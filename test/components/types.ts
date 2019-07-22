import React from 'react'
import { Fn, GestureConfig } from '../../src/types'

interface Props {
  bindArgs?: any[]
  gestures: string[]
  cancel?: Fn
  canceled?: boolean
  memoArg?: any
  config?: Partial<GestureConfig>
}

export type InteractiveType = React.FunctionComponent<Props>
