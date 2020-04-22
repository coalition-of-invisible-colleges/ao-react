import * as React from 'react'
import { observer } from 'mobx-react'
import { Redirect } from 'react-router-dom'
import aoStore, { AoState } from '../client/store'
import api from '../client/api'
import { ObservableMap } from 'mobx'
import { delay, cancelablePromise, noop } from '../utils'
// import { GridCard as GridCardSchema, State as GridCardState } from './grid'
import AoPaper from './paper'
import Markdown from 'markdown-to-jsx'

interface Sel {
  x: number
  y: number
}

interface GridType {
  [y: number]: { [x: number]: string }
  size: number
}

export interface State {
  selected?: Sel
  // gridCard: GridCardState
}

export const defaultState: State = {
  selected: undefined
}

interface GridProps {
  grid: GridType
  sel?: Sel
  onClick: (event: any) => void
  onBlur: (event: any) => void
  onKeyDown: (event: any) => void
  onDoubleClick: (event: any) => void
  onChange: (event: any) => void
  drag: (event: any) => void
  allowDrop: (event: any) => void
  drop: (event: any) => void
  onHover: (event: any) => void
}
const RenderGrid: React.FunctionComponent<GridProps> = observer(
  ({
    grid,
    onClick,
    onBlur,
    sel,
    onKeyDown,
    onChange,
    onDoubleClick,
    drag,
    allowDrop,
    drop,
    onHover
  }) => {
    console.log('rerender grid', grid)
    const ret = []
    for (let j = 0; j < grid.size; j++) {
      for (let i = 0; i < grid.size; i++) {
        if (sel && sel.x == i && sel.y == j) {
          ret.push(
            <textarea
              id={j + '-' + i}
              onClick={onClick}
              autoFocus
              onBlur={onBlur}
              // className={`square ${
              //   JSON.stringify(
              //     aoStore.hashMap.get(
              //       aoStore.state.grid[j][i]
              //     ).seen.length
              //   )
              //     ? 'seen'
              //     : ''
              // }`}
              className="square"
              onChange={onChange}
              onKeyDown={onKeyDown}
              onDoubleClick={onDoubleClick}
              draggable="true"
              onDragStart={drag}
              onDragOver={allowDrop}
              onDrop={drop}
              onMouseOver={onHover}
              style={{
                gridRow: (j + 1).toString(),
                gridColumn: (i + 1).toString()
              }}
            />
          )
        } else {
          if (grid[j] && grid[j][i] && typeof (grid[j][i] === 'string')) {
            ret.push(
              <div
                id={i + '-' + j}
                onClick={onClick}
                onDoubleClick={onDoubleClick}
                className={`square ${
                  aoStore.hashMap.get(aoStore.state.grid[j][i]).seen.some(t => {
                    return t.memberId === aoStore.member.memberId
                  })
                    ? ''
                    : 'seen'
                }`}
                draggable="true"
                onDragStart={drag}
                onDragOver={allowDrop}
                onDrop={drop}
                onMouseOver={onHover}
                style={{
                  gridRow: (j + 1).toString(),
                  gridColumn: (i + 1).toString()
                }}>
                {aoStore.hashMap.get(grid[j][i]).color ? (
                  <AoPaper taskId={aoStore.hashMap.get(grid[j][i]).taskId} />
                ) : (
                  ''
                )}
                <div className="miniContainer">
                  {aoStore.hashMap
                    .get(grid[j][i])
                    .claimed.indexOf(aoStore.member.memberId) >= 0 ? (
                    <img
                      className="miniCheckbox"
                      src="../assets/images/completed.svg"
                    />
                  ) : null}
                  {aoStore.hashMap.get(grid[j][i]).completeValue > 0 ? (
                    <div className="miniValue">
                      {aoStore.hashMap.get(grid[j][i]).completeValue}
                    </div>
                  ) : null}
                </div>
                <span className="gridSpanContainer">
                  <Markdown>{aoStore.hashMap.get(grid[j][i]).name}</Markdown>
                </span>
              </div>
            )
          } else {
            ret.push(
              <div
                id={i + '-' + j}
                onClick={onClick}
                onDoubleClick={onDoubleClick}
                className="square empty"
                draggable="true"
                onDragStart={drag}
                onDragOver={allowDrop}
                onDrop={drop}
                onMouseOver={onHover}
                style={{
                  gridRow: (j + 1).toString(),
                  gridColumn: (i + 1).toString()
                }}></div>
            )
          }
        }
      }
    }
    return (
      <div
        className="grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(' + grid.size.toString() + ', 5em)',
          gridTemplateRows: 'repeat(' + grid.size.toString() + ', 5em)'
        }}>
        {ret}
      </div>
    )
  }
)

interface AoGridState {
  redirect?: string
  text?: string
  sel?: Sel
}

@observer
export class AoGrid extends React.Component<{}, AoGridState> {
  constructor(props) {
    super(props)
    this.state = {}
    this.onClick = this.onClick.bind(this)
    this.onBlur = this.onBlur.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onSelectionChange = this.onSelectionChange.bind(this)
    this.onChange = this.onChange.bind(this)
    // this.ref = React.createRef()
    console.log('grid', aoStore.state.grid)
    this.onDoubleClick = this.onDoubleClick.bind(this)
    this.drag = this.drag.bind(this)
    this.allowDrop = this.allowDrop.bind(this)
    this.drop = this.drop.bind(this)
    this.onHover = this.onHover.bind(this)
  }
  componentWillUnmount() {
    // cancel all pending promises to avoid
    // side effects when the component is unmounted
    this.clearPendingPromises()
  }

  onHover = async event => {
    event.preventDefault()
    console.log(event)
    console.log('id' + event.target.id)
    console.log('hovering')
    if (document.getElementById(event.target.id).classList.contains('seen')) {
      let square = event.target.id.split('-')
      let name = aoStore.hashMap.get(
        aoStore.state.grid[Number(square[1])][Number(square[0])]
      ).name
      let timer = setTimeout(() => api.markSeen(name), 2000)
      document.getElementById(event.target.id).onmouseout = () =>
        clearTimeout(timer)
      console.log(
        'seen?: ' +
          aoStore.hashMap
            .get(aoStore.state.grid[Number(square[1])][Number(square[0])])
            .seen.hasOwnProperty('memberId')
      )
      console.log(
        'seen2? : ' +
          aoStore.hashMap
            .get(aoStore.state.grid[Number(square[1])][Number(square[0])])
            .seen.some(s => {
              return s.memberId === aoStore.member.memberId
            })
      )
    }
  }

  drag = event => {
    // console.log('drag fire')
    // console.log(event.target.id)
    event.dataTransfer.setData('dragSquare', event.target.id)
  }

  allowDrop = event => {
    event.preventDefault()
  }

  drop = async event => {
    event.preventDefault()
    console.log('drag over fire')
    console.log(event.target.id)
    console.log('parent: ' + event.target.parentNode.id)
    let iTo =
      event.target.className === 'gridSpanContainer'
        ? event.target.parentNode.id.split('-')
        : event.target.id.split('-')
    let iFrom = event.dataTransfer.getData('dragSquare').split('-')
    console.log('from' + iFrom)
    console.log('to' + iTo)
    console.log('from 0: ' + iFrom[0])
    console.log('from 1: ' + iFrom[1])
    console.log('to 0: ' + iTo[0])
    console.log('to 1: ' + iTo[1])
    console.log('ToID: ' + iTo)

    // let nFrom = aoStore.hashMap.get(
    //   aoStore.state.grid[Number(iFrom[1])][Number(iFrom[0])]
    // ).name
    // let nTo = aoStore.hashMap.get(
    //   aoStore.state.grid[Number(iTo[1])][Number(iTo[0])]
    // ).name

    let nFrom = undefined
    let nTo = undefined

    if (
      aoStore.hashMap.get(
        aoStore.state.grid[Number(iFrom[1])][Number(iFrom[0])]
      )
    ) {
      nFrom = aoStore.hashMap.get(
        aoStore.state.grid[Number(iFrom[1])][Number(iFrom[0])]
      ).name
    }

    if (
      aoStore.hashMap.get(aoStore.state.grid[Number(iTo[1])][Number(iTo[0])])
    ) {
      nTo = aoStore.hashMap.get(
        aoStore.state.grid[Number(iTo[1])][Number(iTo[0])]
      ).name
    }

    if (nFrom && nTo) {
      api.createAndOrAddCardToGrid(Number(iTo[0]), Number(iTo[1]), nFrom)
      api.createAndOrAddCardToGrid(Number(iFrom[0]), Number(iFrom[1]), nTo)
    } else if (nFrom) {
      api.createAndOrAddCardToGrid(Number(iTo[0]), Number(iTo[1]), nFrom)
      api.delCardFromGrid(Number(iFrom[0]), Number(iFrom[1]))
    } else if (nTo) {
      api.createAndOrAddCardToGrid(Number(iFrom[0]), Number(iFrom[1]), nTo)
      api.delCardFromGrid(Number(iTo[0]), Number(iTo[1]))
    } else if (!nFrom && !nTo) {
    }
  }

  pendingPromises = []

  appendPendingPromise = promise =>
    (this.pendingPromises = [...this.pendingPromises, promise])

  removePendingPromise = promise =>
    (this.pendingPromises = this.pendingPromises.filter(p => p !== promise))

  clearPendingPromises = () => this.pendingPromises.map(p => p.cancel())
  onDoubleClick(e) {
    console.log('double click')
    this.clearPendingPromises()
    const [xs, ys] = e.target.id.split('-')
    const x = parseInt(xs)
    const y = parseInt(ys)
    this.setState({ redirect: '/task/' + aoStore.state.grid[y][x] })
  }
  onClick(event) {
    console.log('clicked!')
    const [xs, ys] = event.target.id.split('-')
    const x = parseInt(xs)
    const y = parseInt(ys)
    const waitForClick = cancelablePromise(delay(200))
    this.appendPendingPromise(waitForClick)
    return waitForClick.promise
      .then(() => {
        this.setState({ sel: { x, y } })
        console.log('clicked', x, y)
        // this.ref.current.focus()
        // if the promise wasn't cancelled, we execute
        // the callback and remove it from the queue
        this.removePendingPromise(waitForClick)
      })
      .catch(errorInfo => {
        // rethrow the error if the promise wasn't
        // rejected because of a cancelation
        this.removePendingPromise(waitForClick)
        if (!errorInfo.isCanceled) {
          throw errorInfo.error
        }
      })
  }

  onBlur(event) {
    this.setState({ sel: undefined, text: undefined })
  }

  onKeyDown(event) {
    if (event.key === 'Enter') {
      console.log('enter')
      console.log('selx: ' + this.state.sel.x)
      console.log('sely: ' + this.state.sel.y)
      console.log('text: ' + this.state.text)
      if (!this.state.text) {
        api.delCardFromGrid(this.state.sel.x, this.state.sel.y),
          console.log('delFired')
      } else {
        api.createAndOrAddCardToGrid(
          this.state.sel.x,
          this.state.sel.y,
          this.state.text
        )
      }
      this.onBlur(event)
    }
  }
  onSelectionChange(event) {
    console.log('selected event', event)
  }
  componentDidMount() {}
  onChange(event) {
    console.log('on change', event.target.value)
    this.setState({ text: event.target.value })
  }
  render() {
    console.log('render main grid', aoStore.state.grid)
    return (
      <div>
        {!this.state.redirect && (
          <div id="gridContainer">
            <h2>Meme Grid</h2>
            <RenderGrid
              sel={this.state.sel}
              onClick={this.onClick}
              onBlur={this.onBlur}
              onKeyDown={this.onKeyDown}
              onDoubleClick={this.onDoubleClick}
              onChange={this.onChange}
              drag={this.drag}
              allowDrop={this.allowDrop}
              drop={this.drop}
              onHover={this.onHover}
              grid={{ ...aoStore.state.grid, size: 8 }}
            />
          </div>
        )}
        {this.state.redirect && <Redirect to={this.state.redirect} />}
      </div>
    )
  }
}
