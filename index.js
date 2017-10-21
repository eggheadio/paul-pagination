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

const time = mapPropsStream(props$ =>
  props$.switchMap(
    props =>
      Observable.interval(1000).map(() =>
        new Date().toLocaleDateString(
          props.locale,
          {
            weekday: "long",
            hour: "numeric",
            minute: "numeric",
            second: "numeric"
          }
        )
      ),
    (props, time) => ({ ...props, time })
  )
)

const Clock = props => <h1>{props.time}</h1>

const ClockWithTime = time(Clock)

render(
  <div>
    <ClockWithTime locale="en-US" />
    <ClockWithTime locale="ja-JP" />
    <ClockWithTime locale="ar-EG" />
  </div>,
  document.getElementById("app")
)
