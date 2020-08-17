import * as React from 'react'
import { computed } from 'mobx'
import { observer } from 'mobx-react'
import { Redirect } from 'react-router-dom'
import aoStore, { Task } from '../client/store'
import api from '../client/api'
import AoDragZone from './dragZone'
import AoDropZone from './dropZone'
import { CardPlay } from '../cards'
import AoGridResizer from './gridResizer'
import AoContextCard from './contextCard'
import AoCardComposer from './cardComposer'

interface GridProps {
  taskId: string
}

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

@observer
export default class AoGrid extends React.Component<GridProps, GridState> {
  constructor(props) {
    super(props)
    this.state = defaultState
    this.addGrid = this.addGrid.bind(this)
    this.selectGridSquare = this.selectGridSquare.bind(this)
    this.dropToGridSquare = this.dropToGridSquare.bind(this)
  }

  addGrid() {
    api.addGridToCard(this.props.taskId, 3, 3)
  }

  selectGridSquare(selection: Sel) {
    this.setState({ selected: selection })
  }

  newGridCard(name: string, coords: Sel) {
    api.pinCardToGrid(coords.x, coords.y, name, this.props.taskId)
  }

  dropToGridSquare(move: CardPlay) {
    if (!move.from.taskId) {
      return
    }
    const cardFrom = aoStore.hashMap.get(move.from.taskId)
    if (!cardFrom) {
      return
    }
    const nameFrom = cardFrom.name

    let nameTo = move.to.name
    if (!nameTo) {
      const cardTo = aoStore.hashMap.get(move.to.taskId)
      if (cardTo) {
        nameTo = cardTo.name
      }
    }

    switch (move.from.zone) {
      case 'card':
        // maybe this doesn't make sense, it's supposed to be for the whole card
        break
      case 'priorities':
        if (move.to.taskId) {
          api
            .unpinCardFromGrid(move.to.coords.x, move.to.coords.y, move.to.inId)
            .then(() => api.refocusCard(move.from.taskId, move.from.inId))
            .then(() =>
              api.pinCardToGrid(
                move.to.coords.x,
                move.to.coords.y,
                nameFrom,
                move.to.inId
              )
            )
        } else {
          api
            .refocusCard(move.from.taskId, move.from.inId)
            .then(() =>
              api.pinCardToGrid(
                move.to.coords.x,
                move.to.coords.y,
                nameFrom,
                move.to.inId
              )
            )
        }
        break
      case 'grid':
        if (move.to.taskId) {
          api
            .pinCardToGrid(
              move.to.coords.x,
              move.to.coords.y,
              nameFrom,
              move.to.inId
            )
            .then(() =>
              api.pinCardToGrid(
                move.from.coords.x,
                move.from.coords.y,
                nameTo,
                move.from.inId
              )
            )
        } else {
          api
            .unpinCardFromGrid(
              move.from.coords.x,
              move.from.coords.y,
              move.from.inId
            )
            .then(() =>
              api.pinCardToGrid(
                move.to.coords.x,
                move.to.coords.y,
                nameFrom,
                move.to.inId
              )
            )
        }
        break
      case 'discard':
        aoStore.popDiscardHistory()
      case 'completed':
      case 'context':
      case 'panel':
      default:
        if (move.to.taskId) {
          api
            .unpinCardFromGrid(move.to.coords.x, move.to.coords.y, move.to.inId)
            .then(() =>
              api.pinCardToGrid(
                move.to.coords.x,
                move.to.coords.y,
                nameFrom,
                move.to.inId
              )
            )
        } else {
          api.pinCardToGrid(
            move.to.coords.x,
            move.to.coords.y,
            nameFrom,
            move.to.inId
          )
        }
        break
    }
  }

  @computed get grid() {
    const card = aoStore.hashMap.get(this.props.taskId)

    if (card && card.hasOwnProperty('grid') && card.grid) {
      return card.grid
    }

    return false
  }

  render() {
    const taskId = this.props.taskId

    const render = []
    let grid = this.grid

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
      console.log('task missing grid. grid: ', this.grid)
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
          tId = grid.rows[j][i]
        }
        if (
          this.state.selected &&
          this.state.selected.x == i &&
          this.state.selected.y == j
        ) {
          render.push(
            <React.Fragment key={i + '-' + j}>
              <AoCardComposer
                onNewCard={(name: string) =>
                  this.newGridCard(name, { x: i, y: j })
                }
                onBlur={() => this.selectGridSquare(undefined)}
              />
            </React.Fragment>
          )
          continue
        }
        render.push(
          <AoDropZone
            taskId={tId}
            inId={taskId}
            x={i}
            y={j}
            onSelect={() => this.selectGridSquare({ x: i, y: j })}
            onDrop={this.dropToGridSquare}
            zoneStyle={'grid'}
            key={i + '-' + j}>
            {tId ? (
              <AoDragZone
                taskId={tId}
                dragContext={{
                  zone: 'grid',
                  inId: taskId,
                  x: i,
                  y: j
                }}>
                <AoContextCard taskId={tId} cardStyle={'mini'} />
              </AoDragZone>
            ) : null}
          </AoDropZone>
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
        <AoGridResizer taskId={taskId} />
      </div>
    )
  }
}
