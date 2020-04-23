import * as React from 'react'
import { observer } from 'mobx-react'
import { Redirect } from 'react-router-dom'
import aoStore, { AoState } from '../client/store'
import api from '../client/api'
import { ObservableMap } from 'mobx'
import { delay, cancelablePromise, noop } from '../utils'
import AoGridSquare from './gridSquare'

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
  onSelect: (selection: { x: number; y: number }) => void
  onGoIn: (selection: { x: number; y: number }) => void
  // onClick: (event: any) => void
  // onBlur: (event: any) => void
  // onKeyDown: (event: any) => void
  // onDoubleClick: (event: any) => void
  // onChange: (event: any) => void
  // drag: (event: any) => void
  // allowDrop: (event: any) => void
  // drop: (event: any) => void
  // onHover: (event: any) => void
}
const RenderGrid: React.FunctionComponent<GridProps> = observer(
  ({
    grid,
    // onClick,
    // onBlur,
    sel,
    onSelect,
    onGoIn
    // onKeyDown,
    // onChange,
    // onDoubleClick,
    // drag,
    // allowDrop,
    // drop,
    // onHover
  }) => {
    console.log('rerender grid', grid)
    const ret = []
    for (let j = 0; j < grid.size; j++) {
      for (let i = 0; i < grid.size; i++) {
        let tId: string
        if (grid[j] && grid[j][i] && typeof (grid[j][i] === 'string')) {
          tId = aoStore.hashMap.get(grid[j][i]).taskId
        }
        ret.push(
          <AoGridSquare
            selected={sel && sel.x == i && sel.y == j}
            taskId={tId}
            x={i}
            y={j}
            onSelect={onSelect}
            onGoIn={onGoIn}
          />
        )
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
  sel?: Sel
}

@observer
export class AoGrid extends React.Component<{}, AoGridState> {
  constructor(props) {
    super(props)
    this.state = {}
    this.selectGridSquare = this.selectGridSquare.bind(this)
    this.goInSquare = this.goInSquare.bind(this)
    // this.onClick = this.onClick.bind(this)
    // this.onBlur = this.onBlur.bind(this)
    // this.onKeyDown = this.onKeyDown.bind(this)
    // this.onSelectionChange = this.onSelectionChange.bind(this)
    // this.onChange = this.onChange.bind(this)
    // // this.ref = React.createRef()
    // console.log('grid', aoStore.state.grid)
    // this.onDoubleClick = this.onDoubleClick.bind(this)
    // this.drag = this.drag.bind(this)
    // this.allowDrop = this.allowDrop.bind(this)
    // this.drop = this.drop.bind(this)
    // this.onHover = this.onHover.bind(this)
  }

  selectGridSquare(selection: Sel) {
    console.log('selectGridSquare pre')
    this.setState({ sel: selection })
    console.log('selectGridSquare post')
  }

  goInSquare(selection: Sel) {
    this.setState({
      redirect: '/task/' + aoStore.state.grid[selection.y][selection.x]
    })
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
              // onClick={this.onClick}
              // onBlur={this.onBlur}
              // onKeyDown={this.onKeyDown}
              // onDoubleClick={this.onDoubleClick}
              // onChange={this.onChange}
              // drag={this.drag}
              // allowDrop={this.allowDrop}
              // drop={this.drop}
              // onHover={this.onHover}
              grid={{ ...aoStore.state.grid, size: 8 }}
              onSelect={this.selectGridSquare}
              onGoIn={this.goInSquare}
            />
          </div>
        )}
        {this.state.redirect && <Redirect to={this.state.redirect} />}
      </div>
    )
  }
}
