import React from 'react'
import { useSpring, animated } from 'react-spring'
import { useGesture } from 'react-use-gesture'
import styles from './styles.module.css'

export default function Two() {
  const [style, set] = useSpring(() => ({ x: 0, y: 0, scale: 1, rotateZ: 0 }))
  const [style2, set2] = useSpring(() => ({ x: 0, y: 0, scale: 1, rotateZ: 0 }))

  const bind = useGesture({
    onDrag: ({ down, offset: [x, y] }) => {
      set({ scale: down ? 1.2 : 1, x, y })
    },
    onPinch: ({ offset: [d, a] }) => {
      set({ scale: 1 + d / 200, rotateZ: a })
    },
  })

  const bind2 = useGesture({
    onDrag: ({ down, offset: [x, y] }) => {
      set2({ scale: down ? 1.2 : 1, x, y })
    },
    onPinch: ({ offset: [d, a] }) => {
      set2({ scale: 1 + d / 200, rotateZ: a })
    },
  })

  return (
    <div className="flex">
      <animated.div {...bind()} className={styles.drag} style={style}></animated.div>
      <animated.div {...bind2()} className={styles.drag} style={{ ...style2, background: 'hotpink' }}></animated.div>
    </div>
  )
}
