import { ensureVector, assignDefault, valueFn } from './utils'
import { resolveWith } from './resolveOptionsWith'

import {
  GenericOptions,
  InternalGenericOptions,
  DragConfig,
  GestureOptions,
  InternalDragOptions,
  InternalGestureOptions,
  CoordinatesConfig,
  InternalCoordinatesOptions,
  DistanceAngleConfig,
  InternalDistanceAngleOptions,
  Vector2,
  Bounds,
  StateKey,
  State,
  CoordinatesKey,
  DistanceAngleKey,
} from '../types'

export const DEFAULT_DRAG_DELAY = 180
export const DEFAULT_RUBBERBAND = 0.15
export const DEFAULT_SWIPE_VELOCITY = 0.5
export const DEFAULT_SWIPE_DISTANCE = 60

const InternalGestureOptionsNormalizers = {
  threshold(value: number | Vector2 = 0) {
    return ensureVector(value)
  },

  rubberband(value: number | boolean | Vector2 = 0): Vector2 {
    switch (value) {
      case true:
        return ensureVector(DEFAULT_RUBBERBAND)
      case false:
        return ensureVector(0)
      default:
        return ensureVector(value)
    }
  },

  enabled(value = true) {
    return value
  },

  triggerAllEvents(value = false) {
    return value
  },

  initial(value = 0) {
    if (typeof value === 'function') return value
    return ensureVector(value)
  },
}

const InternalCoordinatesOptionsNormalizers = {
  ...InternalGestureOptionsNormalizers,
  axis: true,
  lockDirection(value = false) {
    return value
  },
  bounds(value: Bounds | ((state?: State) => Bounds) = {}) {
    if (typeof value === 'function')
      return (state?: State) => InternalCoordinatesOptionsNormalizers.bounds(value(state))

    const { left = -Infinity, right = Infinity, top = -Infinity, bottom = Infinity } = value

    return [
      [left, right],
      [top, bottom],
    ]
  },
}

const InternalGenericOptionsNormalizers = {
  enabled(value = true) {
    return value
  },
  domTarget: true,
  window(value = typeof window !== 'undefined' ? window : undefined) {
    return value
  },
  eventOptions({ passive = true, capture = false } = {}) {
    return { passive, capture }
  },
}

const InternalDistanceAngleOptionsNormalizers = {
  ...InternalGestureOptionsNormalizers,

  bounds(_value: undefined, _key: string, { distanceBounds = {}, angleBounds = {} }: any) {
    const _distanceBounds = (state?: State) => {
      const D = assignDefault(valueFn(distanceBounds, state), { min: -Infinity, max: Infinity })
      return [D.min, D.max]
    }

    const _angleBounds = (state?: State) => {
      const A = assignDefault(valueFn(angleBounds, state), { min: -Infinity, max: Infinity })
      return [A.min, A.max]
    }

    if (typeof distanceBounds !== 'function' && typeof angleBounds !== 'function')
      return [_distanceBounds(), _angleBounds()]

    return (state?: State) => [_distanceBounds(state), _angleBounds(state)]
  },
}

const InternalDragOptionsNormalizers = {
  ...InternalCoordinatesOptionsNormalizers,

  threshold(
    this: any,
    v: number | Vector2 | undefined,
    _k: string,
    { filterTaps = false, lockDirection = false, axis = undefined }: any
  ) {
    const A = ensureVector(v, filterTaps ? 3 : lockDirection ? 1 : axis ? 1 : 0) as Vector2
    this.filterTaps = filterTaps || A[0] + A[1] > 0
    return A
  },

  swipeVelocity(v: number | Vector2 = DEFAULT_SWIPE_VELOCITY) {
    return ensureVector(v)
  },
  swipeDistance(v: number | Vector2 = DEFAULT_SWIPE_DISTANCE) {
    return ensureVector(v)
  },

  delay(value: number | boolean = 0) {
    switch (value) {
      case true:
        return DEFAULT_DRAG_DELAY
      case false:
        return 0
      default:
        return value
    }
  },
}

export function getInternalGestureOptions<T extends StateKey>(
  config: GestureOptions<T> = {}
): InternalGestureOptions<T> {
  return resolveWith<GestureOptions<T>, InternalGestureOptions<T>>(config, InternalGestureOptionsNormalizers)
}

export function getInternalGenericOptions(config: GenericOptions = {}): InternalGenericOptions {
  return resolveWith<GenericOptions, InternalGenericOptions>(config, InternalGenericOptionsNormalizers)
}

export function getInternalCoordinatesOptions<T extends CoordinatesKey>(
  config: CoordinatesConfig<T> = {}
): InternalCoordinatesOptions<T> {
  return resolveWith<CoordinatesConfig<T>, InternalCoordinatesOptions<T>>(config, InternalCoordinatesOptionsNormalizers)
}

export function getInternalDistanceAngleOptions<T extends DistanceAngleKey>(
  config: DistanceAngleConfig<T> = {}
): InternalDistanceAngleOptions<T> {
  return resolveWith<DistanceAngleConfig<T>, InternalDistanceAngleOptions<T>>(
    config,
    InternalDistanceAngleOptionsNormalizers
  )
}

export function getInternalDragOptions(config: DragConfig = {}): InternalDragOptions {
  return resolveWith<DragConfig, InternalDragOptions>(config, InternalDragOptionsNormalizers)
}
