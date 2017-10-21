import "bootstrap/dist/css/bootstrap.css"
import { render } from "react-dom"
import {
  Button,
  ButtonGroup
} from "react-bootstrap"
import { Observable, Scheduler } from "rxjs"
import {
  setObservableConfig,
  mapPropsStream,
  createEventHandler
} from "recompose"
setObservableConfig({
  fromESObservable: Observable.from,
  toESObservable: x => x
})

const Paginate = mapPropsStream(props => {
  const {
    handler: onNext,
    stream: nexts
  } = createEventHandler()
  const {
    handler: onPrev,
    stream: prevs
  } = createEventHandler()
  const {
    handler: onLast,
    stream: lasts
  } = createEventHandler()
  const {
    handler: onFirst,
    stream: firsts
  } = createEventHandler()
  const {
    handler: onSelect,
    stream: selects
  } = createEventHandler()

  return props.switchMap(
    selectPage,
    (props, page) => ({
      ...props,
      page,
      onNext,
      onPrev,
      onLast,
      onFirst,
      onSelect
    })
  )

  function selectPage(props) {
    const {
      page = 1,
      pages = 1,
      boundaryLinks = false
    } = props
    const events = selects.merge(
      (!boundaryLinks && Observable.empty()) ||
        Observable.merge(
          firsts.mapTo({ to: 1 }),
          lasts.mapTo({ to: pages })
        )
    )

    return events
      .merge(
        nexts
          .mapTo({ inc: 1 })
          .merge(prevs.mapTo({ inc: -1 }))
      )
      .scan(
        (page, { inc, to }) =>
          !inc
            ? to || 1
            : Math.max(
                1,
                Math.min(pages, page + inc)
              ),
        page
      )
      .do(props.onSelect)
      .startWith(page)
  }
})

function Pagination({
  page = 1,
  pages = 1,
  prev = false,
  next = false,
  size,
  buttonSize = 30,
  maxButtons = Infinity,
  vertical,
  ellipsis = false,
  boundaryLinks = false,
  onNext,
  onPrev,
  onLast,
  onFirst,
  onSelect,
  ...props
}) {
  const buttons = []
  const numControls =
    prev + next + boundaryLinks * 2
  const numButtons = Math.min(
    pages,
    Math.max(
      1,
      typeof size === "number"
        ? Math.min(
            maxButtons,
            Math.floor(size / buttonSize) -
              numControls -
              1
          )
        : maxButtons
    )
  )

  let endIndex,
    index,
    count = -1

  index = Math.max(
    page - parseInt(numButtons * 0.5, 10),
    1
  )

  const hasHiddenPagesAfter =
    pages >= numButtons + index
  const hasHiddenPagesBefore =
    (page - 1 >= numButtons * 0.5) | 0

  if (hasHiddenPagesAfter) {
    endIndex = Math.min(
      pages,
      index + numButtons - 1
    )
  } else {
    endIndex = pages
    index = Math.max(pages - numButtons + 1, 1)
  }

  do {
    ++count

    const isFirstElement =
      count === 0 &&
      hasHiddenPagesBefore &&
      numButtons > 4
    const isLastElement =
      count === numButtons - 1 &&
      hasHiddenPagesAfter &&
      numButtons > 4
    const isEllipsisElement =
      ellipsis === true &&
      numButtons > 4 &&
      ((hasHiddenPagesBefore && count === 1) ===
        true ||
        (hasHiddenPagesAfter &&
          count === numButtons - 2) === true)

    const event = isLastElement
      ? { to: pages }
      : isFirstElement
        ? { to: 1 }
        : !isEllipsisElement
          ? { to: index }
          : {
              inc:
                (count === 1 ? -1 : 1) *
                (numButtons - 5)
            }

    buttons.push(
      <Button
        componentClass="a"
        key={`btn-${count}`}
        onClick={onSelect.bind(null, event)}
        bsStyle={
          (page === index && "primary") ||
          undefined
        }
      >
        {isEllipsisElement
          ? "..."
          : isFirstElement
            ? 1
            : isLastElement ? pages : index}
      </Button>
    )
  } while (++index <= endIndex)

  prev &&
    buttons.unshift(
      <Button
        key={`btn-prev`}
        onClick={onPrev}
        componentClass="a"
        disabled={page === 1}
      >
        prev
      </Button>
    )

  next &&
    buttons.push(
      <Button
        key={`btn-next`}
        onClick={onNext}
        componentClass="a"
        disabled={page === pages}
      >
        next
      </Button>
    )

  if (boundaryLinks) {
    buttons.unshift(
      <Button
        key={`btn-first`}
        onClick={onFirst}
        componentClass="a"
        disabled={endIndex <= numButtons}
      >
        first
      </Button>
    )

    buttons.push(
      <Button
        key={`btn-last`}
        onClick={onLast}
        componentClass="a"
        disabled={endIndex == pages}
      >
        last
      </Button>
    )
  }

  props.vertical = vertical
  props.justified = !vertical

  if (typeof size === "number") {
    props.style = {
      [vertical ? "maxHeight" : "maxWidth"]: size,
      ...props.style
    }
  }

  return (
    <ButtonGroup {...props}>
      {buttons}
    </ButtonGroup>
  )
}

Pagination = Paginate(Pagination)

Observable.fromEvent(window, "resize")
  .auditTime(0, Scheduler.animationFrame)
  .startWith(null)
  .subscribe(renderPaginators)

function renderPaginators() {
  render(
    <div>
      <Pagination
        maxButtons={12}
        page={150}
        pages={300}
        size={window.innerWidth - 12}
        style={{ float: "left", left: 6 }}
      />
      <Pagination
        vertical
        ellipsis
        next
        prev
        page={750}
        pages={1500}
        size={window.innerHeight - 70}
        style={{ float: "left", top: 2 }}
      />
    </div>,
    document.getElementById("app")
  )
}
