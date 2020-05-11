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
import AoSmartZone from './smartZone'
import AoGridResizer from './gridResizer'

interface Sel {
  x: number
  y: number
}

interface GridState {
  redirect?: string
  selected?: Sel
}

export const defaultState: GridState = {
  redirect: undefined
}

interface GridProps {
  taskId: string
}

@observer
export default class AoGrid extends React.Component<GridProps, GridState> {
  constructor(props) {
    super(props)
    this.state = defaultState
    this.addGrid = this.addGrid.bind(this)
    this.selectGridSquare = this.selectGridSquare.bind(this)
    this.goInSquare = this.goInSquare.bind(this)
  }

  addGrid() {
    api.addGridToCard(this.props.taskId, 3, 3)
  }

  selectGridSquare(selection: Sel) {
    this.setState({ selected: selection })
  }

  goInSquare(selection: Sel) {
    aoStore.addToContext([this.props.taskId])
    this.setState({
      redirect:
        '/task/' +
        aoStore.hashMap.get(this.props.taskId).grid.rows[selection.y][
          selection.x
        ]
    })
  }

  render() {
    const render = []
    const task = aoStore.hashMap.get(this.props.taskId)
    const grid = task.hasOwnProperty('grid') ? task.grid : false

    if (this.state.redirect !== undefined) {
      this.setState({ redirect: undefined })
      return <Redirect to={this.state.redirect} />
    }

    if (
      !grid ||
      (grid.hasOwnProperty('height') && grid.height < 1) ||
      (grid.hasOwnProperty('width') && grid.width < 1) ||
      !grid.hasOwnProperty('height') ||
      !grid.hasOwnProperty('width')
    ) {
      return (
        <div className={'gridContainer'}>
          <p onClick={this.addGrid} className={'action'}>
            +grid
          </p>
        </div>
      )
    }

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
          <AoSmartZone
            selected={
              this.state.selected &&
              this.state.selected.x == i &&
              this.state.selected.y == j
            }
            inId={this.props.taskId}
            taskId={tId}
            x={i}
            y={j}
            onSelect={this.selectGridSquare}
            onGoIn={this.goInSquare}
            key={i + '-' + j}
            cardSource={'grid'}
          />
        )
      }
    }
    return (
      <div className={'gridContainer' + (grid.width <= 2 ? ' padbottom' : '')}>
        <div
          className={'grid'}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(' + grid.width.toString() + ', 5em)',
            gridTemplateRows: 'repeat(' + grid.height.toString() + ', 5em)'
          }}>
          {render}
        </div>
        <AoGridResizer taskId={this.props.taskId} />
      </div>
    )
  }
}
