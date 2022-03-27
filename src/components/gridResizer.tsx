import React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import { PinboardStyle } from '../interfaces'
import AoHiddenFieldset from './hiddenFieldset'
import api from '../client/api'
import GridImg from '../assets/images/grid.svg'
import PyramidImg from '../assets/images/pyramid.svg'
import RowImg from '../assets/images/row.svg'
import ColumnImg from '../assets/images/column.svg'
import SquareSize from '../assets/images/square.svg'

interface Props {
  taskId: string
  spread: PinboardStyle
  hasGrid?: boolean
  gridHeight?: number
  gridWidth?: number
}

export default function AoGridResizer(props: Props) {
  const taskId = props.taskId
  const card = aoStore.hashMap.get(taskId)
  if (!card) {
    return null
  }

  const pinboard = card.pinboard
  
  const switchToPyramid = event => {
    event.stopPropagation()
    return api.setCardProperty(props.taskId, 'pinboard.spread', 'pyramid')
  }

  const switchToGrid = event => {
    event.stopPropagation()
    return api.setCardProperty(props.taskId, 'pinboard.spread', 'grid')
  }
  
  const addPyramid = (event) => {
		switchToPyramid(event).then(() => api.addGridToCard(taskId, 3, 3))
	}
	
	const addGrid = (event) => {
		switchToGrid(event).then(() => api.addGridToCard(taskId, 3, 3))
	}
	
  if(!pinboard) {
    return <AoHiddenFieldset heading='Grid' startOpen={false} className='gridMenu'>
      <div className='centerFlex'>
        <img src={PyramidImg} className="gridMenu action" onClick={addPyramid} />
        <img src={GridImg} className="gridMenu action" onClick={addGrid} />
      </div>
		</AoHiddenFieldset>
  }

  const increaseRows = () => {
    const card = aoStore.hashMap.get(taskId)
    api.resizeGrid(taskId, pinboard.height + 1, pinboard.width, pinboard.size)
  }

  const decreaseRows = () => {
    const card = aoStore.hashMap.get(taskId)
    api.resizeGrid(taskId, pinboard.height - 1, pinboard.width, pinboard.size)
  }

  const increaseColumns = () => {
    const card = aoStore.hashMap.get(taskId)
    api.resizeGrid(taskId, pinboard.height, pinboard.width + 1, pinboard.size)
  }

  const decreaseColumns = () => {
    const card = aoStore.hashMap.get(taskId)
    api.resizeGrid(taskId, pinboard.height, pinboard.width - 1, pinboard.size)
  }

  const removeGrid = () => {
    api.removeGridFromCard(taskId)
  }
  
  const noGrid =
			!pinboard ||
			(pinboard.hasOwnProperty('height') && pinboard.height < 1) ||
			(pinboard.hasOwnProperty('width') && pinboard.width < 1) ||
			!pinboard.hasOwnProperty('height') ||
			!pinboard.hasOwnProperty('width')
			
  const isPyramid = props.spread === 'pyramid'

  const increaseSquareSize = () => {
    api.resizeGrid(
      props.taskId,
      pinboard.height,
      pinboard.width,
      pinboard.size && pinboard.size >= 1 ? pinboard.size + 1 : 10
    )
  }

  const decreaseSquareSize = () => {
    api.resizeGrid(
      props.taskId,
      pinboard.height,
      pinboard.width,
      pinboard.size && pinboard.size >= 1 ? pinboard.size - 1 : 8
    )
  }
  
  const epithet = isPyramid ? pinboard.height + '-row Pyramid' : pinboard.width + '×' + pinboard.height + ' ' + 'Grid' 

  return (
      <AoHiddenFieldset heading={epithet} startOpen={true} className='gridMenu'>
        <div className="centerFlex">
          <button
            className={'action' + (isPyramid ? ' selected' : '')}
            onClick={switchToPyramid}
            disabled={isPyramid}>
            <img src={PyramidImg} />
          </button>
          <button
            className={'action' + (!isPyramid ? ' selected' : '')}
            onClick={switchToGrid}
            disabled={!isPyramid}>
            <img src={GridImg} />
          </button>
        </div>
         {!isPyramid &&
          <div className="oneLineSetting">
            <img src={ColumnImg} />
            <button
              type="button"
              onClick={decreaseColumns}
              disabled={card.pinboard.width <= 1}
              className="action minus">
              -
            </button>
            <button
              type="button"
              onClick={increaseColumns}
              disabled={card.pinboard.width >= 100}
              className="action plus">
              +
            </button>
          </div>
        }
        <div className="oneLineSetting">
          <img src={RowImg} />
          <button
            type="button"
            onClick={decreaseRows}
            disabled={card.pinboard.height <= 1}
            className="action minus">
            -
          </button>
          <button
            type="button"
            onClick={increaseRows}
            disabled={card.pinboard.height >= 100}
            className="action plus">
            +
          </button>
        </div>
        <div className='oneLineSetting'>
          <img src={SquareSize} />
          <button
            type="button"
            onClick={decreaseSquareSize}
            disabled={pinboard.size <= 1}
            className="action minus">
            -
          </button>
          <button
            type="button"
            onClick={increaseSquareSize}
            disabled={pinboard.size >= 40}
            className="action plus">
            +
          </button>
        </div>
        {(pinboard.width <= 1 || pinboard.height <= 1) && (
            <button
              type="button"
              onClick={removeGrid}
              className="action remove">
              Remove {isPyramid ? 'Pyramid' : 'Grid'}
            </button>
          )}
      </AoHiddenFieldset>
    )
}
