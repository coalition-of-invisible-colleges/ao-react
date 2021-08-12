import * as React from 'react'
import { computed, runInAction, observable } from 'mobx'
import { observer, Observer } from 'mobx-react'
import { Redirect } from 'react-router-dom'
import aoStore, { Task, Grid } from '../client/store'
import api from '../client/api'
import AoDragZone from './dragZone'
import AoDropZone from './dropZone'
import { CardPlay, Coords, goUp } from '../cardTypes'
import AoGridResizer from './gridResizer'
import AoContextCard from './contextCard'
import AoCardComposer from './cardComposer'

interface GridProps {
  taskId: string
  grid: Grid
  dropActsLikeFolder?: boolean
  height: number // Height & width included to trigger refresh when grid is resized
  width: number
}

interface GridViewProps extends GridProps {
  grid: Grid
}

const AoGridRowObserver = observer(
  (props: {
    row: {}
    y: number
    inId: string
    selected?: Coords
    width: number
    dropActsLikeFolder: boolean
    onBlur: () => void
    onNewGridCard: (name: string, coords: Coords) => void
    selectGridSquare: (selection: Coords) => void
    dropToGridSquare: (move: CardPlay) => void
  }) => {
    let render: JSX.Element[] = []
    for (let i = 0; i < props.width; i++) {
      if (
        props.selected &&
        props.selected.x == i &&
        props.selected.y == props.y
      ) {
        render.push(
          <React.Fragment key={i + '-' + props.y}>
            <AoCardComposer
              onNewCard={props.onNewGridCard}
              coords={{ x: i, y: props.y }}
              onBlur={props.onBlur}
            />
          </React.Fragment>
        )
        continue
      }
      let tId: string
      if (props.row && props.row[i] && typeof (props.row[i] === 'string')) {
        tId = props.row[i]
      }

      const card = aoStore.hashMap.get(tId)
      render.push(
        <AoDropZone
          taskId={tId}
          inId={props.inId}
          x={i}
          y={props.y}
          onSelect={props.selectGridSquare}
          onDrop={props.dropToGridSquare}
          zoneStyle={'grid'}
          key={i + '-' + props.y}
          dropActsLikeFolder={props.dropActsLikeFolder}>
          {tId ? (
            <AoDragZone
              taskId={tId}
              dragContext={{
                zone: 'grid',
                inId: props.inId,
                x: i,
                y: props.y,
              }}>
              <AoContextCard
                task={card}
                cardStyle={
                  props.dropActsLikeFolder &&
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

    return <>{render}</>
  }
)

const AoGridRow: Function = (props: {
  row: {}
  y: number
  inId: string
  selected?: Coords
  width: number
  dropActsLikeFolder: boolean
  onBlur: () => void
  onNewGridCard: (name: string, coords: Coords) => void
  selectGridSquare: (selection: Coords) => void
  dropToGridSquare: (move: CardPlay) => void
}): JSX.Element => {
  console.log('AoGridRow render()')

  let render: JSX.Element[] = []
  for (let i = 0; i < props.width; i++) {
    if (
      props.selected &&
      props.selected.x == i &&
      props.selected.y == props.y
    ) {
      render.push(
        <React.Fragment key={i + '-' + props.y}>
          <AoCardComposer
            onNewCard={props.onNewGridCard}
            coords={{ x: i, y: props.y }}
            onBlur={props.onBlur}
          />
        </React.Fragment>
      )
      continue
    }
    let tId: string
    if (props.row && props.row[i] && typeof (props.row[i] === 'string')) {
      tId = props.row[i]
    }

    const card = aoStore.hashMap.get(tId)
    render.push(
      <AoDropZone
        taskId={tId}
        inId={props.inId}
        x={i}
        y={props.y}
        onSelect={props.selectGridSquare}
        onDrop={props.dropToGridSquare}
        zoneStyle="grid"
        key={i + '-' + props.y}
        dropActsLikeFolder={props.dropActsLikeFolder}>
        {tId ? (
          <AoDragZone
            taskId={tId}
            dragContext={{
              zone: 'grid',
              inId: props.inId,
              x: i,
              y: props.y,
            }}>
            <AoContextCard
              task={card}
              cardStyle={
                props.dropActsLikeFolder && card.guild && card.guild.length >= 1
                  ? 'badge'
                  : 'mini'
              }
            />
          </AoDragZone>
        ) : null}
      </AoDropZone>
    )
  }

  return <>{render}</>
}

const GridView: Function = (props: GridViewProps): JSX.Element => {
  // console.log('AO: components/grid.tsx: GridView component function')

  const [selected, setSelected]: [Coords, (Coords) => void] = React.useState()

  function selectGridSquare(selection: Coords) {
    setSelected(selection)
  }

  function onBlur() {
    selectGridSquare(undefined)
  }

  function newGridCard(name: string, coords: Coords) {
    api.pinCardToGrid(coords.x, coords.y, name, props.taskId)
  }

  function dropToGridSquare(move: CardPlay) {
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
        if (
          move.to.taskId &&
          props.dropActsLikeFolder &&
          move.from.inId !== move.to.inId
        ) {
          api.findOrCreateCardInCard(nameFrom, move.to.taskId, true).then(goUp)
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
      case 'priorities':
        if (move.to.taskId && props.dropActsLikeFolder) {
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
          props.dropActsLikeFolder &&
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
          let movingCardWithinThisTaskGridTaskItem = aoStore.hashMap.get(
            move.from.inId
          )
          runInAction(
            () =>
              (movingCardWithinThisTaskGridTaskItem.aoGridToolDoNotUpdateUI =
                true)
          )
          api
            .unpinCardFromGrid(
              move.from.coords.x,
              move.from.coords.y,
              move.from.inId
            )
            .then(() => {
              api
                .pinCardToGrid(
                  move.to.coords.x,
                  move.to.coords.y,
                  nameFrom,
                  move.to.inId
                )
                .then(() => {
                  runInAction(
                    () =>
                      (movingCardWithinThisTaskGridTaskItem.aoGridToolDoNotUpdateUI =
                        false)
                  )
                })
            })
        }
        break
      case 'subTasks':
        api.discardCardFromCard(move.from.taskId, move.from.inId).then(() => {
          if (move.to.taskId && props.dropActsLikeFolder) {
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
        if (move.to.taskId && props.dropActsLikeFolder) {
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

  const render: JSX.Element[] = []
  const taskId = props.taskId
  const grid = props.grid
  const rows = grid.rows
  for (let j = 0; j < grid.height; j++) {
    const currentRow = rows[j]
    render.push(
      <React.Fragment key={j}>
        <AoGridRowObserver
          row={currentRow}
          y={j}
          inId={props.taskId}
          selected={selected}
          width={grid.width}
          dropActsLikeFolder={props.dropActsLikeFolder}
          onBlur={onBlur}
          onNewGridCard={newGridCard}
          selectGridSquare={selectGridSquare}
          dropToGridSquare={dropToGridSquare}
          key={j}
        />
      </React.Fragment>
    )
  }
  return <>{render}</>
}

export default function AoGrid(props: GridProps) {
  const [redirect, setRedirect] = React.useState<string>(undefined)

  function addGrid() {
    api.addGridToCard(props.taskId, 3, 3)
  }

  React.useEffect(() => {
    if (redirect !== undefined) {
      setRedirect(undefined)
    }
  }, [redirect])

  if (redirect !== undefined) {
    return <Redirect to={redirect} />
  }

  const taskId = props.taskId
  const grid = props.grid

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
        <p onClick={addGrid} className="action">
          +grid
        </p>
      </div>
    )
  }

  const gridWidth = props.dropActsLikeFolder ? '5em' : '6em'

  return (
    <div className={'gridContainer' + (grid.width <= 2 ? ' padbottom' : '')}>
      <div
        className="grid"
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(' + grid.width.toString() + ', ' + gridWidth + ')',
          gridTemplateRows:
            'repeat(' + grid.height.toString() + ', ' + gridWidth + ')',
        }}>
        <GridView
          taskId={taskId}
          grid={grid}
          dropActsLikeFolder={props.dropActsLikeFolder}
        />
      </div>
      <AoGridResizer taskId={taskId} />
    </div>
  )
}
