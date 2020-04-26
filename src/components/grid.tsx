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
import AoGridResizer from './gridResizer'

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
export class RenderGrid extends React.Component<GridParams, AoGridState> {
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
    const grid = aoStore.state.grids.find(g => {
      return g.gridId === this.props.gridId
    })
    this.setState({
      redirect: '/task/' + grid.rows[selection.y][selection.x]
    })
  }

  render() {
    const render = []
    const grid = aoStore.state.grids.find(g => {
      return g.gridId === this.props.gridId
    })
    for (let j = 0; j < grid.height; j++) {
      for (let i = 0; i < grid.width; i++) {
        let tId: string
        if (
          grid.rows[j] &&
          grid.rows[j][i] &&
          typeof (grid.rows[j][i] === 'string')
        ) {
          tId = aoStore.hashMap.get(grid.rows[j][i]).taskId
        }
        render.push(
          <AoGridSquare
            selected={
              this.state.selected &&
              this.state.selected.x == i &&
              this.state.selected.y == j
            }
            gridId={this.props.gridId}
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
    return !this.state.redirect ? (
      <div id="gridContainer">
        <h2>Meme Grid</h2>
        <div
          className="grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(' + grid.width.toString() + ', 5em)',
            gridTemplateRows: 'repeat(' + grid.height.toString() + ', 5em)'
          }}>
          {render}
        </div>
        <AoGridResizer gridId={this.props.gridId} />
      </div>
    ) : (
      this.state.redirect && <Redirect to={this.state.redirect} />
    )
  }
}

const AoGrid: React.FunctionComponent<{}> = () => {
  const { gridId }: GridParams = useParams()
  const match = useRouteMatch()
  return (
    <Switch>
      <Route path={`${match.path}/:gridId`}>
        <RenderGrid gridId={'6894c1c0-87f8-11ea-adfb-9bde4bd00109'} />
      </Route>
    </Switch>
  )
}

export default AoGrid
