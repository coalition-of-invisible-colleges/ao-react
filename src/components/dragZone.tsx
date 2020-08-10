import * as React from 'react'
import ReactDOMServer from 'react-dom/server'
import { observer } from 'mobx-react'
import aoStore, { AoState, Task } from '../client/store'
import api from '../client/api'
import { delay, cancelablePromise, noop } from '../utils'
import AoContextCard, { CardStyle } from './contextCard'
import { TaskContext } from './taskContext'
import { DragContext } from './contextCard'

interface DragZoneProps {
	dragContext?: DragContext
	onDropSuccess?: () => void
}

@observer
export default class AoDragZone extends React.Component<DragZoneProps> {
	static contextType = TaskContext

	constructor(props, context) {
		super(props, context)
		this.drag = this.drag.bind(this)
	}

	drag(event) {
		event.stopPropagation()
		console.log(
			'drag event from dragZone! dragContext is ',
			this.props.dragContext
		)
		const { card, setRedirect } = this.context
		if (!card) {
			console.log('drag event on missing card')
			return
		}
		// This is a hack. onDragEnter and onDragOver only offer protected access to drag contents,
		// so you can see the name of the field, e.g., 'text/taskId', but not the contents.
		// Using the taskId as the name of the drag data field type allows us to detect in dropZone.tsx
		// when a card is being dragged over the same card (so we can do nothing).
		event.dataTransfer.setData(card.taskId, card.taskId)
		event.dataTransfer.setData('text/taskId', card.taskId)

		if (!this.props.dragContext) {
			console.log('drag without dragContext')
			return
		}
		event.dataTransfer.setData('text/fromZone', this.props.dragContext.zone)
		if (this.props.dragContext.inId) {
			event.dataTransfer.setData('text/fromInId', this.props.dragContext.inId)
		}
		if (this.props.dragContext.x >= 0) {
			event.dataTransfer.setData('text/fromX', this.props.dragContext.x)
		}
		event.dataTransfer.setData('text/fromY', this.props.dragContext.y)

		let fromId: string = event.dataTransfer.getData('text/taskId')
		let fromInId: string = event.dataTransfer.getData('text/fromInId')
		let fromZone = event.dataTransfer.getData('text/fromZone')
		let fromCoords = {
			x: event.dataTransfer.getData('text/fromX'),
			y: event.dataTransfer.getData('text/fromY')
		}
		let fromLocation = {
			taskId: fromId,
			inId: fromInId,
			zone: fromZone,
			coords: fromCoords
		}

		// Do this last, because some cards don't render properly
		// and break the rest of the dataTransfer.setData calls
		// It seems to fail to set the image silently and then,
		// since there is no drag image, setting other data fields
		// fails too
		let cardHTML = ReactDOMServer.renderToStaticMarkup(
			<TaskContext.Provider value={{ card, setRedirect }}>
				<AoContextCard cardStyle={'compact'} noPopups={true} />
			</TaskContext.Provider>
		)
		let dragGhostElement: Element = document.createElement('div')
		dragGhostElement.innerHTML = cardHTML
		dragGhostElement.id = 'dragGhost'
		dragGhostElement = document.body.appendChild(dragGhostElement)

		if (dragGhostElement) {
			event.dataTransfer.setDragImage(dragGhostElement, 170, 145)
		}
	}

	render() {
		return (
			<div className={'dragZone'} draggable="true" onDragStart={this.drag}>
				{this.props.children}
			</div>
		)
	}
}
