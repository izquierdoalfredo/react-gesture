    npm install react-with-gesture
    
Wraps a component into a div that receives MouseDown and TouchStart events, then captures movement until release.

* `down`, true on mouse-down or finger-touch
* `x/y`, screen coordinates
* `xDelta/yDelta`, coordinates relative to initial coordinates, great for sliding/dragging gestures
* `xInitial/yInitial`, coordinates of the first click/touch

```jsx
import { withGesture } from 'react-with-gesture'

@withGesture
class Something extends React.Component {
    render() {
        const { down, x, y, xDelta, yDelta, xInitial, yInitial }
        return `coordinates: ${x} ${y}`
    }
}
```

or ...

```jsx
withGesture(
    ({ down, x, y, xDelta, yDelta, xInitial, yInitial }) => `coordinates: ${x} ${y}`
)
```

or ...


```jsx
import { Gesture } from 'react-with-gesture'

class Something extends React.Component {
    render() {
        return (
            <Gesture>
                {({ down, x, y, xDelta, yDelta, xInitial, yInitial }) => `coordinates: ${x} ${y}`}
            </Gesture>
        )
    }
}
```
