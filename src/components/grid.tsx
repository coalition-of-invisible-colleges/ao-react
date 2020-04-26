import * as React from 'react'
import { observer } from 'mobx-react'
import {
  Redirect,
  Switch,
  Route,
  useParams,
  useRouteMatch
} from 'react-router-dom'
import aoStore, { AoState, Grid } from '../client/store'
import api from '../client/api'
import { ObservableMap } from 'mobx'
import { delay, cancelablePromise, noop } from '../utils'
import AoGridSquare from './gridSquare'

interface Sel {
  x: number
  y: number
}

interface AoGridState {
  redirect?: string
  selected?: Sel
}

interface GridParams {
  gridId: string
}

// interface GridProps {
//   grid: Grid
//   sel?: Sel
//   onSelect: (selection: { x: number; y: number }) => void
//   onGoIn: (selection: { x: number; y: number }) => void
// }

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
    this.setState({ selected: selection })
    console.log('selectGridSquare post')
  }

  goInSquare(selection: Sel) {
    this.setState({
      redirect: '/task/' + aoStore.state.grids[selection.y][selection.x]
    })
  }

  render() {
    const ret = []
    const { gridId }: GridParams = useParams()
    const grid = aoStore.state.grids.find(g => {
      return g.gridId === gridId
    })
    for (let j = 0; j < grid.height; j++) {
      for (let i = 0; i < grid.width; i++) {
        let tId: string
        if (grid[j] && grid[j][i] && typeof (grid[j][i] === 'string')) {
          tId = aoStore.hashMap.get(grid[j][i]).taskId
        }
        ret.push(
          <AoGridSquare
            selected={
              this.state.selected &&
              this.state.selected.x == i &&
              this.state.selected.y == j
            }
            gridId={gridId}
            taskId={tId}
            x={i}
            y={j}
            onSelect={this.selectGridSquare}
            onGoIn={this.goInSquare}
            key={i + '-' + j}
          />
        )
      }
    }
    let match = useRouteMatch()
    return (
      <Switch>
        <Route path={`${match.path}/:gridId`}>
          {!this.state.redirect && (
            <div id="gridContainer">
              <h2>Meme Grid</h2>
              <div
                className="grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(' + grid.width.toString() + ', 5em)',
                  gridTemplateRows:
                    'repeat(' + grid.height.toString() + ', 5em)'
                }}>
                {ret}
              </div>
            </div>
          )}
          {this.state.redirect && <Redirect to={this.state.redirect} />}
        </Route>
      </Switch>
    )
  }
}

export default AoGrid
