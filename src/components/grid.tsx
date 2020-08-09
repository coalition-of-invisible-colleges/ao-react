import * as React from 'react'
import { computed } from 'mobx'
import { observer } from 'mobx-react'
import { Redirect } from 'react-router-dom'
import aoStore, { AoState, Grid, Task } from '../client/store'
import { TaskContext } from './taskContext'
import api from '../client/api'
import { ObservableMap } from 'mobx'
import { delay, cancelablePromise, noop } from '../utils'
import AoDragZone from './dragZone'
import AoDropZone from './dropZone'
import { CardPlay } from '../cards'
import AoGridResizer from './gridResizer'
import AoContextCard from './contextCard'
import AoCardComposer from './cardComposer'

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
export default class AoGrid extends React.Component<{}, GridState> {
  static contextType = TaskContext

  constructor(props) {
    super(props)
    this.state = defaultState
    this.addGrid = this.addGrid.bind(this)
    this.selectGridSquare = this.selectGridSquare.bind(this)
    this.dropToGridSquare = this.dropToGridSquare.bind(this)
  }

  addGrid() {
    const { card, setRedirect } = this.context
    api.addGridToCard(card.taskId, 3, 3)
  }

  selectGridSquare(selection: Sel) {
    this.setState({ selected: selection })
  }

  newGridCard(name: string, coords: Sel) {
    const { card, setRedirect } = this.context
    api.pinCardToGrid(coords.x, coords.y, name, card.taskId)
  }

  dropToGridSquare(move: CardPlay) {
    if (!move.from.taskId) {
      return
    }
    const nameFrom = aoStore.hashMap.get(move.from.taskId).name

    const nameTo = move.to.taskId
      ? aoStore.hashMap.get(move.to.taskId).name
      : undefined

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
    // console.log('rerendering grid')
    const { card, setRedirect } = this.context

    if (card.hasOwnProperty('grid') && card.grid) {
      return card.grid
    }

    return false
  }

  render() {
    const { card, setRedirect } = this.context
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
        let task: Task
        if (
          grid.rows[j] &&
          grid.rows[j][i] &&
          typeof (grid.rows[j][i] === 'string')
        ) {
          task = aoStore.hashMap.get(grid.rows[j][i])
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
          <TaskContext.Provider
            value={{ card: task, setRedirect }}
            key={i + '-' + j}>
            <AoDropZone
              inId={card.taskId}
              x={i}
              y={j}
              onSelect={() => this.selectGridSquare({ x: i, y: j })}
              onDrop={this.dropToGridSquare}
              zoneStyle={'grid'}>
              {task ? (
                <AoDragZone
                  dragContext={{
                    zone: 'grid',
                    inId: card.taskId,
                    x: i,
                    y: j
                  }}>
                  <AoContextCard cardStyle={'mini'} />
                </AoDragZone>
              ) : null}
            </AoDropZone>
          </TaskContext.Provider>
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
        <AoGridResizer />
      </div>
    )
  }
}
