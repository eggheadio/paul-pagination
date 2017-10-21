import "bootstrap/dist/css/bootstrap.css"
import { render } from "react-dom"
import { Button } from "react-bootstrap"
import { Observable } from "rxjs"
import {
  setObservableConfig,
  mapPropsStream
} from "recompose"
setObservableConfig({
  fromESObservable: Observable.from,
  toESObservable: x => x
})

const styles = [
  "success",
  "warning",
  "danger",
  "info",
  "default",
  "primary",
  "link"
]

const sizes = ["large", "small", "xsmall"]

const crazy = mapPropsStream(props$ => {
  return props$.switchMap(
    props =>
      Observable.interval(250)
        .startWith(0)
        .map(count => ({
          styleIndex: count % props.styles.length,
          sizeIndex: count % props.sizes.length
        }))
        .map(({ styleIndex, sizeIndex }) => ({
          bsStyle: props.styles[styleIndex],
          bsSize: props.sizes[sizeIndex]
        })),
    (props, { bsStyle, bsSize }) => ({
      ...props,
      bsStyle,
      bsSize,
      children: `${bsSize}-${bsStyle}`
    })
  )
})

const CrazyButton = crazy(Button)

render(
  <div>
    <CrazyButton styles={styles} sizes={sizes} />
  </div>,
  document.getElementById("app")
)
