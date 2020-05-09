import CoordinatesRecognizer from './CoordinatesRecognizer'
import { UseGestureEvent, IngKey } from '../types'
import { getGenericEventData, getScrollEventValues } from '../utils/event'
import { calculateAllGeometry } from '../utils/math'
import { getStartGestureState, getGenericPayload } from './Recognizer'

export default class ScrollRecognizer extends CoordinatesRecognizer<'scroll'> {
  readonly ingKey = 'scrolling' as IngKey
  readonly stateKey = 'scroll'
  debounced = true

  private scrollShouldRun = () => {
    return this.enabled
  }

  onScroll = (event: UseGestureEvent): void => {
    if (!this.scrollShouldRun()) return
    this.clearTimeout()
    this.setTimeout(this.onScrollEnd)

    if (!this.state._active) this.onScrollStart(event)
    else this.onScrollChange(event)
  }

  onScrollStart = (event: UseGestureEvent): void => {
    const values = getScrollEventValues(event)

    this.updateSharedState(getGenericEventData(event))

    const startState = {
      ...getStartGestureState(this, values, event),
      ...getGenericPayload(this, event, true),
      initial: this.state.values,
    }

    const movementDetection = this.getMovement(values, startState)
    const delta = movementDetection.delta!

    this.updateGestureState({
      ...startState,
      ...movementDetection,
      ...calculateAllGeometry(delta),
    })

    this.fireGestureHandler()
  }

  onScrollChange = (event: UseGestureEvent): void => {
    const genericEventData = getGenericEventData(event)

    this.updateSharedState(genericEventData)

    const values = getScrollEventValues(event)
    const kinematics = this.getKinematics(values, event)

    this.updateGestureState({
      ...getGenericPayload(this, event),
      ...kinematics,
    })

    this.fireGestureHandler()
  }

  onScrollEnd = (): void => {
    this.state._active = false
    this.updateGestureState({ ...this.getMovement(this.state.values), velocities: [0, 0], velocity: 0 })
    this.fireGestureHandler()
  }

  addBindings(): void {
    this.controller.addBindings('onScroll', this.onScroll)
  }
}
