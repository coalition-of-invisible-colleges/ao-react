import * as React from 'react'
import { computed } from 'mobx'
import { observer } from 'mobx-react'
import { Redirect } from 'react-router-dom'
import aoStore, { Task, Grid } from '../client/store'
import api from '../client/api'
import AoDragZone from './dragZone'
import AoDropZone from './dropZone'
import { CardPlay, Coords } from '../cards'
import AoGridResizer from './gridResizer'
import AoContextCard from './contextCard'
import AoCardComposer from './cardComposer'

interface GridProps {
  taskId: string
  dropActsLikeFolder?: boolean
}

interface GridViewProps extends GridProps {
  grid: Grid
}

interface GridViewState {
  selected?: Coords
}

@observer
class GridView extends React.PureComponent<GridViewProps, GridViewState> {
  constructor(props) {
    super(props)
    this.state = {}
    this.selectGridSquare = this.selectGridSquare.bind(this)
    this.onBlur = this.onBlur.bind(this)
    this.newGridCard = this.newGridCard.bind(this)
    this.dropToGridSquare = this.dropToGridSquare.bind(this)
  }

  selectGridSquare(selection: Coords) {
    this.setState({ selected: selection })
  }

  onBlur() {
    this.selectGridSquare(undefined)
  }

  newGridCard(name: string, coords: Coords) {
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

    const cardTo = aoStore.hashMap.get(move.to.taskId)
    const nameTo = cardTo && cardTo.name ? cardTo.name : undefined

    switch (move.from.zone) {
      case 'card':
        // maybe this doesn't make sense, it's supposed to be for the whole card
        break
      case 'priorities':
        if (move.to.taskId && this.props.dropActsLikeFolder) {
          api.refocusCard(move.from.taskId, move.from.inId).then(() => {
            api
              .discardCardFromCard(move.from.taskId, move.from.inId)
              .then(() =>
                api.findOrCreateCardInCard(nameFrom, move.to.taskId, true)
              )
          })
        } else if (move.to.taskId) {
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
        if (
          move.to.taskId &&
          this.props.dropActsLikeFolder &&
          move.from.inId !== move.to.inId
        ) {
          api
            .unpinCardFromGrid(
              move.from.coords.x,
              move.from.coords.y,
              move.from.inId
            )
            .then(() => {
              api.discardCardFromCard(move.from.taskId, move.from.inId)
            })
            .then(() =>
              api.findOrCreateCardInCard(nameFrom, move.to.taskId, true)
            )
        } else if (move.to.taskId) {
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
      case 'subTasks':
        api.discardCardFromCard(move.from.taskId, move.from.inId).then(() => {
          if (move.to.taskId && this.props.dropActsLikeFolder) {
            api.findOrCreateCardInCard(nameFrom, move.to.taskId, false)
          } else if (move.to.taskId) {
            api
              .unpinCardFromGrid(
                move.to.coords.x,
                move.to.coords.y,
                move.to.inId
              )
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
        })
        break
      case 'discard':
        aoStore.popDiscardHistory()
      case 'completed':
      case 'context':
      case 'panel':
      default:
        if (move.to.taskId && this.props.dropActsLikeFolder) {
          api.findOrCreateCardInCard(nameFrom, move.to.taskId, false)
        } else if (move.to.taskId) {
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

  render() {
    const render = []
    const taskId = this.props.taskId
    const grid = this.props.grid

    for (let j = 0; j < grid.height; j++) {
      for (let i = 0; i < grid.width; i++) {
        if (
          this.state.selected &&
          this.state.selected.x == i &&
          this.state.selected.y == j
        ) {
          render.push(
            <React.Fragment key={i + '-' + j}>
              <AoCardComposer
                onNewCard={this.newGridCard}
                coords={{ x: i, y: j }}
                onBlur={this.onBlur}
              />
            </React.Fragment>
          )
          continue
        }
        let tId: string
        if (
          grid.rows[j] &&
          grid.rows[j][i] &&
          typeof (grid.rows[j][i] === 'string')
        ) {
          tId = grid.rows[j][i]
        }

        const card = aoStore.hashMap.get(tId)
        render.push(
          <AoDropZone
            taskId={tId}
            inId={taskId}
            x={i}
            y={j}
            onSelect={this.selectGridSquare}
            onDrop={this.dropToGridSquare}
            zoneStyle={'grid'}
            key={i + '-' + j}
            dropActsLikeFolder={this.props.dropActsLikeFolder}>
            {tId ? (
              <AoDragZone
                taskId={tId}
                dragContext={{
                  zone: 'grid',
                  inId: taskId,
                  x: i,
                  y: j
                }}>
                <AoContextCard
                  task={card}
                  cardStyle={
                    this.props.dropActsLikeFolder &&
                    card.guild &&
                    card.guild.length >= 1
                      ? 'badge'
                      : 'mini'
                  }
                />
              </AoDragZone>
            ) : null}
          </AoDropZone>
        )
      }
    }
    return render
  }
}

interface GridState {
  redirect?: string
}

export const defaultState: GridState = {
  redirect: undefined
}

@observer
export default class AoGrid extends React.PureComponent<GridProps, GridState> {
  constructor(props) {
    super(props)
    this.state = defaultState
    this.addGrid = this.addGrid.bind(this)
  }

  addGrid() {
    api.addGridToCard(this.props.taskId, 3, 3)
  }

  render() {
    if (this.state.redirect !== undefined) {
      this.setState({ redirect: undefined })
      return <Redirect to={this.state.redirect} />
    }

    const taskId = this.props.taskId
    const card = aoStore.hashMap.get(this.props.taskId)

    if (!card) {
      return null
    }

    const grid = card.grid

    if (
      !grid ||
      (grid.hasOwnProperty('height') && grid.height < 1) ||
      (grid.hasOwnProperty('width') && grid.width < 1) ||
      !grid.hasOwnProperty('height') ||
      !grid.hasOwnProperty('width')
    ) {
      return null
      return (
        <div className="gridContainer noPad">
          <p onClick={this.addGrid} className="action">
            +grid
          </p>
        </div>
      )
    }

    return (
      <div className={'gridContainer' + (grid.width <= 2 ? ' padbottom' : '')}>
        <div
          className="grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(' + grid.width.toString() + ', 5em)',
            gridTemplateRows: 'repeat(' + grid.height.toString() + ', 5em)'
          }}>
          <GridView
            taskId={taskId}
            grid={grid}
            dropActsLikeFolder={this.props.dropActsLikeFolder}
          />
        </div>
        <AoGridResizer taskId={taskId} />
      </div>
    )
  }
}
