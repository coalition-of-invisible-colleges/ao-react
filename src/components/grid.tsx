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

interface AoGridState {
  redirect?: string
  sel?: Sel
}

interface GridProps {
  grid: GridType
  sel?: Sel
  onSelect: (selection: { x: number; y: number }) => void
  onGoIn: (selection: { x: number; y: number }) => void
}

const RenderGrid: React.FunctionComponent<GridProps> = observer(
  ({ grid, sel, onSelect, onGoIn }) => {
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
            key={i + '-' + j}
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

@observer
export class AoGrid extends React.Component<{}, AoGridState> {
  constructor(props) {
    super(props)
    this.state = {}
    this.selectGridSquare = this.selectGridSquare.bind(this)
    this.goInSquare = this.goInSquare.bind(this)
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
    return (
      <div>
        {!this.state.redirect && (
          <div id="gridContainer">
            <h2>Meme Grid</h2>
            <RenderGrid
              sel={this.state.sel}
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
