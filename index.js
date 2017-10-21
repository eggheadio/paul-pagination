import "bootstrap/dist/css/bootstrap.css"
import { render } from "react-dom"
import { Button } from "react-bootstrap"
import { Observable } from "rxjs"
import {
  setObservableConfig,
  mapPropsStream,
  createEventHandler
} from "recompose"
setObservableConfig({
  fromESObservable: Observable.from,
  toESObservable: x => x
})

const time = mapPropsStream(props$ => {
  const {
    handler: onClick,
    stream: onClick$
  } = createEventHandler()

  const click$ = onClick$.do(console.log.bind(console))

  return props$.switchMap(
    props =>
      Observable.interval(1000)
        .takeUntil(click$)
        .map(() =>
          new Date().toLocaleDateString(props.locale, {
            weekday: "long",
            hour: "numeric",
            minute: "numeric",
            second: "numeric"
          })
        )
        .startWith(""),
    (props, time) => ({ ...props, time, onClick })
  )
})

const Clock = props => (
  <h1 onClick={props.onClick}>{props.time}</h1>
)

const ClockWithTime = time(Clock)

render(
  <div>
    <ClockWithTime locale="en-US" />
    <ClockWithTime locale="ja-JP" />
    <ClockWithTime locale="ar-EG" />
  </div>,
  document.getElementById("app")
)
