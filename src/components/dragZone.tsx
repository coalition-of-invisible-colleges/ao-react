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

	constructor(props) {
		super(props)
		this.drag = this.drag.bind(this)
	}

	drag(event) {
		console.log(
			'drag event from dragZone! dragContext is ',
			this.props.dragContext
		)
		const card = this.context
		if (!card) {
			console.log('drag event on missing card')
			return
		}
		event.dataTransfer.setData('text/taskId', card.taskId)

		let cardHTML = ReactDOMServer.renderToStaticMarkup(
			<TaskContext.Provider value={card}>
				<AoContextCard cardStyle={'compact'} />
			</TaskContext.Provider>
		)

		let element = document.createElement('div')
		element.innerHTML = cardHTML
		document.body.appendChild(element)

		event.dataTransfer.setDragImage(element, 170, 145)

		if (!this.props.dragContext) {
			console.log('drag without dragContext')
			return
		}
		// event.dataTransfer.setData('text/dragContext', this.props.dragContext) // test sending whole object
		event.dataTransfer.setData('text/fromZone', this.props.dragContext.zone)
		if (this.props.dragContext.inId) {
			event.dataTransfer.setData('text/fromInId', this.props.dragContext.inId)
		}
		if (this.props.dragContext.x >= 0) {
			event.dataTransfer.setData('text/fromX', this.props.dragContext.x)
		}
		event.dataTransfer.setData('text/fromY', this.props.dragContext.y)
	}

	render() {
		return (
			<div className={'dragZone'} draggable="true" onDragStart={this.drag}>
				{this.props.children}
			</div>
		)
	}
}
