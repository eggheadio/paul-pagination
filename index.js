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

const crazyButtonStyles = mapPropsStream(
  props$ => {
    return props$.switchMap(
      props =>
        Observable.interval(250)
          .startWith(0)
          .map(
            count => count % props.styles.length
          )
          .map(index => props.styles[index]),
      (props, bsStyle) => ({
        ...props,
        bsStyle,
        children: bsStyle
      })
    )
  }
)

const CrazyButton = crazyButtonStyles(Button)

render(
  <div>
    <CrazyButton styles={styles} />
  </div>,
  document.getElementById("app")
)
