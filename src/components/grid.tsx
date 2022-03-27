import * as React from 'react'
import { computed, runInAction, observable } from 'mobx'
import { observer, Observer } from 'mobx-react'
import request from 'superagent'
import { Redirect } from 'react-router-dom'
import aoStore from '../client/store'
import { Task, PinboardStyle, Pinboard, Pin } from '../interfaces'
import AoDragZone from './dragZone'
import AoDropZoneSimple from './dropZoneSimple'
import { CardPlay, CardLocation, Coords, goUp } from '../cardTypes'
import AoContextCard from './contextCard'
import AoCardComposer from './cardComposer'

// TODO: Move this to Interfaces
interface PinboardProps extends Pinboard {
  pins: Pin[]
  inId?: string // For from.inId of cards dragged out of this grid, maybe can be eliminated
  spread: PinboardStyle
  onDropToSquare: (from: CardLocation, to?: CardLocation) => Promise<request.Response>
  onNewCard: (name: string, coords?: Coords, callbackToClear?: () => void) => Promise<request.Response>
}

const AoGridRowObserver = observer(
  (props: {
    pins: Pin[]
    y: number
    selected?: Coords
    width: number
    onBlur: () => void
    onNewGridCard: (name: string, coords: Coords, callbackToClear: () => void) => void
    selectGridSquare: (selection: Coords) => void
    onDropToSquare: (from: CardLocation, to: CardLocation) => Promise<request.Response>
    spread: PinboardStyle,
    inId: string
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
      
      if(props.pins && props.pins.length >= 1) {
        props.pins.forEach(pin => {
          if(pin.x === i && pin.y === props.y) {
            tId = pin.taskId
          }
        })
      }
      
      const card = aoStore.hashMap.get(tId)
      const isPyramid = props.spread === 'pyramid'

      const toHasGuild = card?.guild && card?.guild?.length >= 1
      
      const onDropToSquareCaller = (from: CardLocation) => {
        const to: CardLocation = {
          taskId: tId,
          inId: props.inId,
          zone: 'grid',
          coords: { x: i, y: props.y },
        }
        props.onDropToSquare(from, to)
      }
      
      const onClickCaller = () => {
        props.selectGridSquare({y: props.y, x: i})
      }
      
      render.push(
        <AoDropZoneSimple
          onDrop={onDropToSquareCaller}
          onClick={onClickCaller}
          dropHoverMessage='drop to place'
          className='grid'
          key={i + '-' + props.y}>
          {tId ? (
            <AoDragZone
              taskId={tId}
              dragContext={{
                zone: 'grid',
                inId: props.inId,
                x: i,
                y: props.y,
              }}>
              <AoContextCard task={card} cardStyle="mini" /*inId={props.inId}*/ />
            </AoDragZone>
          ) : null}
        </AoDropZoneSimple>
      )
    }

    return <>{render}</>
  }
)

export default function AoPinboard(props: PinboardProps) {
  const pins = props.pins
  if (
    !props.height || props.height < 1 ||
    !props.width || props.width < 1 ||
    !props.spread 
  ) {
    return null
  }
  const squareWidth = props.size && props.size >= 1 ? props.size + 'em' : '9em'
  
  const [selected, setSelected]: [Coords, (Coords) => void] = React.useState()
  const [renderMeNowPlease, setRenderMeNowPlease] = React.useState(false)
  
  React.useEffect(() => {
    if(renderMeNowPlease) {
      setRenderMeNowPlease(false)
    }
  }, [renderMeNowPlease])
  
  function selectGridSquare(selection: Coords) {
    setSelected(selection)
  }

  function onBlur() {
    selectGridSquare(undefined)
  }

  function newPinboardCard(name: string, coords: Coords, callbackToClear) {
    props.onNewCard(name, coords, callbackToClear).then(() => setRenderMeNowPlease(true))
  }

  const render: JSX.Element[] = []

  switch(props.spread) {
    case 'grid':
      for (let j = 0; j < props.height; j++) {
        const rowPins = pins?.filter(pin => pin.y === j)
        const dropToSquareCaller = (from: CardLocation, to: CardLocation) => {
          to.coords.y = j
          return props.onDropToSquare(from, to).then(result => {
            setRenderMeNowPlease(true)
            return result
          })
        }
        render.push(
          <React.Fragment key={j}>
            <AoGridRowObserver
              pins={rowPins}
              y={j}
              selected={selected}
              width={props.width}
              onBlur={onBlur}
              onNewGridCard={newPinboardCard}
              selectGridSquare={selectGridSquare}
              onDropToSquare={dropToSquareCaller}
              key={j}
              spread="grid"
              inId={props.inId}
            />
          </React.Fragment>
        )
      }
      return (
        <div className='gridContainer'>
          <div
            className="grid"
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(' + props.width.toString() + ', ' + squareWidth + ')',
              gridTemplateRows:
                'repeat(' + props.height.toString() + ', ' + squareWidth + ')',
            }}>
            {render}
          </div>
        </div>
      )
    case 'pyramid':
      for (let j = 0; j < props.height; j++) {
        const rowPins = pins?.filter(pin => pin.y === j)
        const rowWidth = j + 1
        const dropToSquareCaller = (from: CardLocation, to: CardLocation) => {
          to.coords.y = j
          return props.onDropToSquare(from, to).then(result => {
            setRenderMeNowPlease(true)
            return result
          })
        }
        render.push(
          <div
            key={j}
            className="grid pyramidRow"
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(' + rowWidth.toString() + ', ' + squareWidth + ')',
              gridTemplateRows: squareWidth,
            }}>
            <AoGridRowObserver
              pins={rowPins}
              y={j}
              selected={selected}
              width={rowWidth}
              onBlur={onBlur}
              onNewGridCard={newPinboardCard}
              onDropToSquare={dropToSquareCaller}
              selectGridSquare={selectGridSquare}
              key={j}
              spread="pyramid"
              inId={props.inId}
            />
          </div>
        )
      }
      return (
        <div className='gridContainer'>
          {render}
        </div>
      )
    case 'rune':
      return <div className='gridContainer'>rune view coming soon</div>
  }
}
