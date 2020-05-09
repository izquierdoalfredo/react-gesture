import CoordinatesRecognizer from './CoordinatesRecognizer'
import { Fn, IngKey } from '../types'
import { noop } from '../utils/utils'
import { getPointerEventValues, getGenericEventData } from '../utils/event'
import { calculateDistance } from '../utils/math'
import { getStartGestureState, getGenericPayload } from './Recognizer'

const TAP_DISTANCE_THRESHOLD = 3
const SWIPE_MAX_ELAPSED_TIME = 220

export default class DragRecognizer extends CoordinatesRecognizer<'drag'> {
  readonly ingKey = 'dragging' as IngKey
  readonly stateKey = 'drag'

  private dragShouldStart = (_event: React.PointerEvent) => {
    // drag should start if gesture is enabled and not already active.
    // This is needed so that a second touch on the target doesn't trigger
    // another drag event.
    return this.enabled && !this.state._active
  }

  /**
   * TODO add back when setPointerCapture is widely wupported
   * https://caniuse.com/#search=setPointerCapture
   * private setPointers = (event: UseGestureEvent<PointerEvent>) => {
   *   const { currentTarget, pointerId } = event
   *   if (currentTarget) currentTarget.setPointerCapture(pointerId)
   *   this.updateGestureState({ currentTarget, pointerId })
   * }

   * private removePointers = () => {
   *   const { currentTarget, pointerId } = this.state
   *   if (currentTarget && pointerId) currentTarget.releasePointerCapture(pointerId)
   * }
   */

  private setListeners = () => {
    this.controller.removeWindowListeners(this.stateKey)
    const dragListeners: [string, Fn][] = [
      ['pointermove', this.onDragChange],
      ['pointerup', this.onDragEnd],
      ['pointercancel', this.onDragEnd],
    ]

    this.controller.addWindowListeners(this.stateKey, dragListeners)
  }

  onDragStart = (event: React.PointerEvent): void => {
    if (!this.dragShouldStart(event)) return
    /**
     * TODO add back when setPointerCapture is widely supported
     * this.setPointers(event as PointerEvent)
     */

    // Sets listeners to the window
    this.setListeners()

    // We set the state pointerId to the event.pointerId so we can make sure
    // that we lock the drag to the event initiating the gesture
    this.state._pointerId = event.pointerId

    if (this.config.delay > 0) {
      this.state._delayedEvent = true
      // If it's a React SyntheticEvent we need to persist it so that we can use it async
      if (typeof event.persist === 'function') event.persist()
      this.setTimeout(this.startDrag.bind(this), this.config.delay, event)
    } else {
      this.startDrag(event)
    }
  }

  startDrag(event: React.PointerEvent) {
    const values = getPointerEventValues(event)
    this.updateSharedState(getGenericEventData(event))

    const startState = {
      ...getStartGestureState(this, values, event),
      ...getGenericPayload(this, event, true),
      _pointerId: event.pointerId,
    }

    const movementState = this.getMovement(values, startState)

    this.updateGestureState({
      ...startState,
      ...movementState,
      cancel: this.onCancel,
    })

    this.fireGestureHandler()
  }

  onDragChange = (event: React.PointerEvent): void => {
    // If the gesture was canceled don't respond to the event.
    if (this.state.canceled) return

    // If the event pointerId doesn't match the initiating pointerId
    // don't respond to the event.
    if (event.pointerId !== this.state._pointerId) return

    // If the gesture isn't active then respond to the event only if
    // it's been delayed via the `delay` option, in which case start
    // the gesture immediately.
    if (!this.state._active) {
      if (this.state._delayedEvent) {
        this.clearTimeout()
        this.startDrag(event)
      }
      return
    }

    const genericEventData = getGenericEventData(event)

    // If the event doesn't have any button / touches left we should cancel
    // the gesture. This may happen if the drag release happens outside the browser
    // window.
    if (!genericEventData.down) {
      this.onDragEnd(event)
      return
    }

    this.updateSharedState(genericEventData)

    const values = getPointerEventValues(event)
    const kinematics = this.getKinematics(values, event)
    const genericPayload = getGenericPayload(this, event)

    // This verifies if the drag can be assimilated to a tap by checking
    // if the real distance of the drag (ie not accounting for the threshold) is
    // greater than the TAP_DISTANCE_THRESHOLD.
    let { _isTap } = this.state
    const realDistance = calculateDistance(kinematics._movement!)
    if (_isTap && realDistance >= TAP_DISTANCE_THRESHOLD) _isTap = false

    this.updateGestureState({ ...genericPayload, ...kinematics, _isTap, cancel: this.onCancel })

    this.fireGestureHandler()
  }

  onDragEnd = (event: React.PointerEvent): void => {
    // If the event pointerId doesn't match the initiating pointerId
    // don't respond to the event.
    if (event.pointerId !== this.state._pointerId) return

    this.state._active = false
    this.updateSharedState({ down: false, buttons: 0, touches: 0 })

    const {
      _isTap,
      values,
      velocities: [vx, vy],
      movement: [mx, my],
      _intentional: [ix, iy],
    } = this.state

    const endState = {
      ...getGenericPayload(this, event),
      ...this.getMovement(values),
    }

    const {
      swipeVelocity: [svx, svy],
      swipeDistance: [sx, sy],
    } = this.config

    const swipe: [number, number] = [0, 0]

    if (endState.elapsedTime < SWIPE_MAX_ELAPSED_TIME) {
      if (ix !== false && Math.abs(vx) > svx && Math.abs(mx) > sx) swipe[0] = Math.sign(vx)
      if (iy !== false && Math.abs(vy) > svy && Math.abs(my) > sy) swipe[1] = Math.sign(vy)
    }

    this.updateGestureState({ ...endState, tap: _isTap, swipe })
    this.fireGestureHandler(this.config.filterTaps && this.state._isTap)
  }

  clean = (): void => {
    super.clean()
    this.state._delayedEvent = false // can't remember if this is useful?
    this.controller.removeWindowListeners(this.stateKey)

    // TODO add back when setPointerCapture is widely wupported
    // this.removePointers()
  }

  onCancel = (): void => {
    this.updateGestureState({ canceled: true, cancel: noop })
    this.state._active = false
    this.updateSharedState({ down: false, buttons: 0, touches: 0 })
    requestAnimationFrame(() => this.fireGestureHandler())
  }

  addBindings(): void {
    this.controller.addBindings('onPointerDown', this.onDragStart)

    // TODO add back when setPointerCapture is widely wupported
    // this.controller.addBindings('onPointerMove', this.onDragChange)
    // this.controller.addBindings(['onPointerUp', 'onPointerCancel'], this.onDragEnd)
  }
}
