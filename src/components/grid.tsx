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
  const safeSize = props.size && props.size >= 1 ? props.size : 9
  const squareWidth = safeSize + 'em'
  
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
      const rowPins = pins?.filter(pin => pin.y === 0).sort((b, a) => b.x - a.x)
      console.log("squareWidth is", squareWidth)
      const moreSquareWidth = props.width < 4 ? props.size - 2 + 'em' : props.width * 2 + (props.size / 2) - 3 + 'em'
      const runeSize = (Math.pow(3.14159, 1.2) * (props.width + (props.size * 0.9))) - 20 + 'em'
      for (let i = 0; i < props.width; i++) {
        let tId
        if(props.pins && props.pins.length >= 1) {
          props.pins.forEach(pin => {
            if(pin.x === i && pin.y === 0) {
              tId = pin.taskId
            }
          })
        }
        
        const onClickCaller = () => {
          selectGridSquare({y: 0, x: i})
        }
        
        const dropToSquareCaller = (from: CardLocation) => {
          const to: CardLocation = {
            taskId: tId,
            inId: props.inId,
            zone: 'grid',
            coords: { x: i, y: 0 },
          }
          to.coords.y = 0
          return props.onDropToSquare(from, to).then(result => {
            setRenderMeNowPlease(true)
            return result
          })
        }
          
        const card = aoStore.hashMap.get(tId)
        
        const angle = 360 / props.width
        let rot = angle * i
        
        // Rotate the wheel back so slot 0 is at 1 o'clock
        rot -= 60
        
        // A two-rune is rotated so that slot 0 is on the left
        if(props.width === 2) {
          rot -= 120
        }
        
        // A four-rune is rotated to be a cross (grid covers 2x2)
        if(props.width === 4) {
          rot -= 30
        }
        
        // A three-rune is rotated to appear as an inverted triangle (pyramid covers triangle)
        if(props.width === 3) {
          rot += 30
        }
        
        // A five-rune is rotated to appear as an inverted triangle pentagram
        if(props.width === 5) {
          rot += 6.6
        }
        
        // Rotate the item itself, move it outwards (along the rotated axis), then rotate it back, then center it
        const inlineStyle = props.width >= 2 ? { transform: 'rotate(' + rot + 'deg) translate(' + moreSquareWidth + ') rotate(' + (-rot) + 'deg) translateY(-50%) translateX(-50%)', height: squareWidth, width: squareWidth } : null
          
        if (
          selected &&
          selected.x == i &&
          selected.y == 0
        ) {
          render.push(
            <div className='runeItem' style={inlineStyle} key={i}>
              <AoCardComposer
                onNewCard={newPinboardCard}
                coords={{ x: i, y: 0 }}
                onBlur={onBlur}
              />
            </div>
          )
        } else {
          render.push(
            <div className='runeItem' style={inlineStyle}>
              <AoDropZoneSimple
                onDrop={dropToSquareCaller}
                onClick={onClickCaller}
                dropHoverMessage='drop to place'
                className='rune'
                key={i}>
                {tId ? (
                  <AoDragZone
                    taskId={tId}
                    dragContext={{
                      zone: 'grid',
                      inId: props.inId,
                      x: i,
                      y: 0,
                    }}>
                    <AoContextCard task={card} cardStyle="mini" />
                  </AoDragZone>
                ) : null}
              </AoDropZoneSimple>
            </div>
          )
        }
      }
      
      return <div className='gridContainer rune' style={{ height: runeSize, width: runeSize}}>
        {render}
      </div>
  }
}
