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

export const defaultState: AoGridState = {
  redirect: undefined
}

interface GridProps {
  taskId: string
}

@observer
export default class AoGrid extends React.Component<GridProps, AoGridState> {
  constructor(props) {
    super(props)
    this.state = defaultState
    this.addGrid = this.addGrid.bind(this)
    this.selectGridSquare = this.selectGridSquare.bind(this)
    this.goInSquare = this.goInSquare.bind(this)
  }

  addGrid() {
    console.log('addGrid()')
    api.addGridToCard(this.props.taskId, 3, 3)
  }

  selectGridSquare(selection: Sel) {
    console.log('selectGridSquare pre')
    this.setState({ selected: selection })
    console.log('selectGridSquare post')
  }

  goInSquare(selection: Sel) {
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
    console.log('task is ', task)
    const grid = task.hasOwnProperty('grid') ? task.grid : false
    console.log('task.grid is ', grid)

    if (this.state.redirect !== undefined) {
      console.log('redirecting')
      this.setState({ redirect: undefined })
      return <Redirect to={this.state.redirect} />
    }
    console.log('about to check')
    if (
      !grid ||
      (grid.hasOwnProperty('height') && grid.height < 1) ||
      (grid.hasOwnProperty('width') && grid.width < 1) ||
      !grid.hasOwnProperty('height') ||
      !grid.hasOwnProperty('width')
    ) {
      console.log('displaying text')
      return (
        <div className={'gridContainer'}>
          <p onClick={this.addGrid} className={'action'}>
            +grid
          </p>
        </div>
      )
    }
    console.log('failed to display text')

    for (let j = 0; j < grid.height; j++) {
      for (let i = 0; i < grid.width; i++) {
        console.log('loop j is ', j, ' and i is ', i)
        let tId: string
        // console.log('cell is ', grid.rows[j][i])
        if (
          grid.rows[j] &&
          grid.rows[j][i] &&
          typeof (grid.rows[j][i] === 'string')
        ) {
          tId = aoStore.hashMap.get(grid.rows[j][i]).taskId
          // console.log('\n\ntId is', tId)
          // console.log('raw square is ', aoStore.hashMap.get(grid.rows[j][i]))
        }
        render.push(
          <AoGridSquare
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
          />
        )
      }
    }
    console.log('returning')
    return (
      <div className={'gridContainer'}>
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
