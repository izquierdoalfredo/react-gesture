import CoordinatesRecognizer from './CoordinatesRecognizer'
import { UseGestureEvent, IngKey, Vector2 } from '../types'
import { getGenericEventData, getScrollEventValues } from '../utils/event'
import { calculateAllGeometry } from '../utils/math'
import { getStartGestureState, getGenericPayload } from './Recognizer'
import { addBindings } from '../Controller'

export default class ScrollRecognizer extends CoordinatesRecognizer<'scroll'> {
  readonly ingKey = 'scrolling' as IngKey
  readonly stateKey = 'scroll'
  debounced = true

  handleEvent = (event: UseGestureEvent): void => {
    if (!this.enabled) return

    this.clearTimeout()
    this.setTimeout(this.onEnd)

    const values = getScrollEventValues(event)
    this.updateSharedState(getGenericEventData(event))

    if (!this.state._active) {
      this.onStart(event, values)
    } else {
      this.onChange(event, values)
    }

    this.fireGestureHandler()
  }

  onStart = (event: UseGestureEvent, values: Vector2): void => {

    this.updateGestureState({
      ...getStartGestureState(this, values, event),
      ...getGenericPayload(this, event, true),
      initial: this.state.values,
    })

    const movementDetection = this.getMovement(values)
    const geometry = calculateAllGeometry(movementDetection.delta!)

    this.updateGestureState(movementDetection)
    this.updateGestureState(geometry)
  }

  onChange = (event: UseGestureEvent, values: Vector2): void => {
    this.updateGestureState({
      ...getGenericPayload(this, event),
      ...this.getKinematics(values, event),
    })
  }

  onEnd = (): void => {
    this.state._active = false
    this.updateGestureState({ ...this.getMovement(this.state.values), velocities: [0, 0], velocity: 0 })
    this.fireGestureHandler()
  }

  addBindings(bindings: any): void {
    addBindings(bindings, 'onScroll', this.handleEvent)
  }
}
