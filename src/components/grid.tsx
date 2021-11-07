import * as React from 'react'
import { computed, runInAction, observable } from 'mobx'
import { observer, Observer } from 'mobx-react'
import { Redirect } from 'react-router-dom'
import aoStore, { Task, Grid, GridStyle } from '../client/store'
import api from '../client/api'
import AoDragZone from './dragZone'
import AoDropZone from './dropZone'
import { CardPlay, Coords, goUp } from '../cardTypes'
import AoGridResizer from './gridResizer'
import AoContextCard from './contextCard'
import AoCardComposer from './cardComposer'
import GridImg from '../assets/images/grid.svg'
import Pyramid from '../assets/images/pyramid.svg'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'

interface GridProps {
  taskId: string
  grid: Grid
  gridStyle: GridStyle
  dropActsLikeFolder?: boolean
  height: number // Height & width included to trigger refresh when grid is resized
  width: number
}

interface GridViewProps extends GridProps {
  taskId: string
  grid: Grid
  dropActsLikeFolder?: boolean
}

interface PyramidViewProps extends GridProps {
  taskId: string
  grid: Grid
  dropActsLikeFolder?: boolean
  gridWidth: string
}

async function dropToGridSquare(move: CardPlay, dropActsLikeFolder) {
  console.log('dropToGridSquare move is', move)
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

  return new Promise((resolve, reject) => {
    switch (move.from.zone) {
      case 'card':
        if (
          move.to.taskId &&
          dropActsLikeFolder &&
          move.from.inId !== move.to.inId
        ) {
          api
            .findOrCreateCardInCard(nameFrom, move.to.taskId, true)
            .then(goUp)
            .then(resolve)
        } else if (move.to.taskId) {
          api
            .unpinCardFromGrid(move.to.coords.x, move.to.coords.y, move.to.inId)
            .then(() =>
              api
                .pinCardToGrid(
                  move.to.coords.x,
                  move.to.coords.y,
                  nameFrom,
                  move.to.inId
                )
                .then(resolve)
            )
        } else {
          api
            .pinCardToGrid(
              move.to.coords.x,
              move.to.coords.y,
              nameFrom,
              move.to.inId
            )
            .then(resolve)
        }
        break
      case 'priorities':
        if (move.to.taskId && dropActsLikeFolder) {
          api.refocusCard(move.from.taskId, move.from.inId).then(() => {
            api
              .discardCardFromCard(move.from.taskId, move.from.inId)
              .then(() =>
                api.findOrCreateCardInCard(nameFrom, move.to.taskId, true)
              )
              .then(resolve)
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
            .then(resolve)
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
            .then(resolve)
        }
        break
      case 'grid':
        console.log('dropped card from grid')
        if (
          move.to.taskId &&
          dropActsLikeFolder &&
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
            .then(resolve)
        } else if (move.to.taskId) {
          api
            .pinCardToGrid(
              move.to.coords.x,
              move.to.coords.y,
              nameFrom,
              move.to.inId
            )
            .then(() =>
              api
                .pinCardToGrid(
                  move.from.coords.x,
                  move.from.coords.y,
                  nameTo,
                  move.from.inId
                )
                .then(resolve)
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
                .then(resolve)
            })
        }
        break
      case 'subTasks':
        api.discardCardFromCard(move.from.taskId, move.from.inId).then(() => {
          if (move.to.taskId && dropActsLikeFolder) {
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
              .then(resolve)
          } else {
            api
              .pinCardToGrid(
                move.to.coords.x,
                move.to.coords.y,
                nameFrom,
                move.to.inId
              )
              .then(resolve)
          }
        })
        break
      case 'discard':
        aoStore.popDiscardHistory()
        resolve(null)
      case 'completed':
      case 'context':
      case 'panel':
      default:
        if (move.to.taskId && dropActsLikeFolder) {
          api
            .findOrCreateCardInCard(nameFrom, move.to.taskId, false)
            .then(resolve)
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
            .then(resolve)
        } else {
          api
            .pinCardToGrid(
              move.to.coords.x,
              move.to.coords.y,
              nameFrom,
              move.to.inId
            )
            .then(resolve)
        }
        break
    }
  })
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
    gridStyle: GridStyle
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
      const isPyramid = props.gridStyle === 'pyramid'

      render.push(
        <AoDropZone
          taskId={tId}
          inId={props.inId}
          x={i}
          y={props.y}
          onSelect={props.selectGridSquare}
          onDrop={props.dropToGridSquare}
          zoneStyle="grid"
          pyramidRows={isPyramid}
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
                  card &&
                  card.guild &&
                  card.guild.length >= 1
                    ? 'badge'
                    : 'mini'
                }
                inId={props.inId}
              />
            </AoDragZone>
          ) : null}
        </AoDropZone>
      )
    }

    return <>{render}</>
  }
)

// const AoGridRow: Function = (props: {
//   row: {}
//   y: number
//   inId: string
//   selected?: Coords
//   width: number
//   dropActsLikeFolder: boolean
//   onBlur: () => void
//   onNewGridCard: (name: string, coords: Coords) => void
//   selectGridSquare: (selection: Coords) => void
//   dropToGridSquare: (move: CardPlay) => void
// }): JSX.Element => {
//   console.log('AoGridRow render()')

//   let render: JSX.Element[] = []
//   for (let i = 0; i < props.width; i++) {
//     if (
//       props.selected &&
//       props.selected.x == i &&
//       props.selected.y == props.y
//     ) {
//       render.push(
//         <React.Fragment key={i + '-' + props.y}>
//           <AoCardComposer
//             onNewCard={props.onNewGridCard}
//             coords={{ x: i, y: props.y }}
//             onBlur={props.onBlur}
//           />
//         </React.Fragment>
//       )
//       continue
//     }
//     let tId: string
//     if (props.row && props.row[i] && typeof (props.row[i] === 'string')) {
//       tId = props.row[i]
//     }

//     const card = aoStore.hashMap.get(tId)
//     render.push(
//       <AoDropZone
//         taskId={tId}
//         inId={props.inId}
//         x={i}
//         y={props.y}
//         onSelect={props.selectGridSquare}
//         onDrop={props.dropToGridSquare}
//         zoneStyle="grid"
//         key={i + '-' + props.y}
//         dropActsLikeFolder={props.dropActsLikeFolder}>
//         {tId ? (
//           <AoDragZone
//             taskId={tId}
//             dragContext={{
//               zone: 'grid',
//               inId: props.inId,
//               x: i,
//               y: props.y,
//             }}>
//             <AoContextCard
//               task={card}
//               cardStyle={
//                 props.dropActsLikeFolder && card.guild && card.guild.length >= 1
//                   ? 'badge'
//                   : 'mini'
//               }
//             />
//           </AoDragZone>
//         ) : null}
//       </AoDropZone>
//     )
//   }

//   return <>{render}</>
// }

const GridView: Function = (props: GridViewProps): JSX.Element => {
  // console.log('AO: components/grid.tsx: GridView component function')

  const [selected, setSelected]: [Coords, (Coords) => void] = React.useState()
  const [renderMeNowPlease, setRenderMeNowPlease] = React.useState(false)
  console.log('GridView render()')

  React.useEffect(() => {
    console.log(
      'GridView useEffect triggered, renderMeNowPlease is',
      renderMeNowPlease
    )

    if (renderMeNowPlease) {
      setRenderMeNowPlease(false)
    }
  }, [renderMeNowPlease])

  function selectGridSquare(selection: Coords) {
    setSelected(selection)
  }

  function onBlur() {
    selectGridSquare(undefined)
  }

  function newGridCard(name: string, coords: Coords) {
    api.pinCardToGrid(coords.x, coords.y, name, props.taskId)
  }

  function dropToGridSquareCaller(move: CardPlay) {
    dropToGridSquare(move, props.dropActsLikeFolder).then(result => {
      console.log('setting renderMeNowPlease to true')
      setRenderMeNowPlease(true)
    })
  }

  const render: JSX.Element[] = []
  const taskId = props.taskId
  const grid = props.grid
  const rows = grid.rows

  for (let j = 0; j < grid.height; j++) {
    const currentRow = rows[j]
    const rowWidth = grid.width
    render.push(
      <React.Fragment key={j}>
        <AoGridRowObserver
          row={currentRow}
          y={j}
          inId={props.taskId}
          selected={selected}
          width={rowWidth}
          dropActsLikeFolder={props.dropActsLikeFolder}
          onBlur={onBlur}
          onNewGridCard={newGridCard}
          selectGridSquare={selectGridSquare}
          dropToGridSquare={dropToGridSquareCaller}
          key={j}
          gridStyle="grid"
        />
      </React.Fragment>
    )
  }
  return <>{render}</>
}

const PyramidView: Function = (props: PyramidViewProps): JSX.Element => {
  // console.log('AO: components/grid.tsx: GridView component function')

  const [selected, setSelected]: [Coords, (Coords) => void] = React.useState()
  const [renderMeNowPlease, setRenderMeNowPlease] = React.useState(false)
  React.useEffect(() => {
    console.log(
      'PyramidView useEffect triggered, renderMeNowPlease is',
      renderMeNowPlease
    )
    if (renderMeNowPlease) {
      setRenderMeNowPlease(false)
    }
  }, [renderMeNowPlease])

  function selectGridSquare(selection: Coords) {
    setSelected(selection)
  }

  function onBlur() {
    selectGridSquare(undefined)
  }

  function newGridCard(name: string, coords: Coords) {
    api.pinCardToGrid(coords.x, coords.y, name, props.taskId)
  }

  function dropToGridSquareCaller(move: CardPlay) {
    dropToGridSquare(move, props.dropActsLikeFolder).then(() => {
      console.log('setting renderMeNowPlease to true')
      setRenderMeNowPlease(true)
    })
  }

  const render: JSX.Element[] = []
  const taskId = props.taskId
  const grid = props.grid
  const rows = grid.rows
  const isPyramid = props.gridStyle === 'pyramid'

  for (let j = 0; j < grid.height; j++) {
    const currentRow = rows[j]
    const rowWidth = j + 1
    render.push(
      <div
        key={j}
        className="grid pyramidRow"
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(' + rowWidth.toString() + ', ' + props.gridWidth + ')',
          gridTemplateRows: props.gridWidth,
        }}>
        <AoGridRowObserver
          row={currentRow}
          y={j}
          inId={props.taskId}
          selected={selected}
          width={rowWidth}
          dropActsLikeFolder={props.dropActsLikeFolder}
          onBlur={onBlur}
          onNewGridCard={newGridCard}
          selectGridSquare={selectGridSquare}
          dropToGridSquare={dropToGridSquareCaller}
          key={j}
          gridStyle="pyramid"
        />
      </div>
    )
  }
  return <>{render}</>
}

interface GridMenuProps {
  taskId: string
  gridStyle: GridStyle
}

function AoGridMenu(props: GridMenuProps) {
  const card = aoStore.hashMap.get(props.taskId)
  if (
    !card ||
    !card.grid ||
    card.grid.height <= 1 ||
    (card.gridStyle !== 'pyramid' && card.grid.width <= 1)
  ) {
    return null
  }

  const switchToPyramid = event => {
    event.stopPropagation()
    api.setCardProperty(props.taskId, 'gridStyle', 'pyramid')
  }

  const switchToGrid = event => {
    event.stopPropagation()
    api.setCardProperty(props.taskId, 'gridStyle', 'grid')
  }

  const isPyramid = props.gridStyle === 'pyramid'
  console.log('AoGridMenu render()')
  const renderedGridMenu = (
    <div className="gridMenu">
      <button
        className={'action' + (isPyramid ? ' selected' : '')}
        onClick={switchToPyramid}
        disabled={isPyramid}>
        <img src={Pyramid} />
        Pyramid
      </button>
      <button
        className={'action' + (!isPyramid ? ' selected' : '')}
        onClick={switchToGrid}
        disabled={!isPyramid}>
        <img src={GridImg} />
        Grid
      </button>
    </div>
  )

  return (
    <div className="gridMenuButton">
      <Tippy
        zIndex={5}
        content={renderedGridMenu}
        interactive={true}
        trigger="click"
        placement="top-end"
        appendTo={document.getElementById('root')}
        theme="translucent">
        <button className="action">&#9662;</button>
      </Tippy>
    </div>
  )
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
  const card = aoStore.hashMap.get(taskId)

  if (!card) {
    return null
  }
  const isPyramid = props.gridStyle === 'pyramid'

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

  const gridWidth = props.dropActsLikeFolder ? '5em' : '9em'
  console.log('AoGrid render()')
  if (!isPyramid) {
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
        <AoGridResizer taskId={taskId} gridStyle={props.gridStyle} />
        <AoGridMenu taskId={taskId} gridStyle={props.gridStyle} />
      </div>
    )
  } else {
    return (
      <div className={'gridContainer' + (grid.width <= 2 ? ' padbottom' : '')}>
        <PyramidView
          taskId={taskId}
          grid={grid}
          gridStyle={props.gridStyle}
          dropActsLikeFolder={props.dropActsLikeFolder}
          gridWidth={gridWidth}
        />
        <AoGridResizer taskId={taskId} gridStyle={props.gridStyle} />
        <AoGridMenu taskId={taskId} gridStyle={props.gridStyle} />
      </div>
    )
  }
}
