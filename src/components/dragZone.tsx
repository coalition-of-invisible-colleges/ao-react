import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore, { AoState, Task } from '../client/store'
import api from '../client/api'
import { delay, cancelablePromise, noop } from '../utils'
import AoSmartCard, { CardStyle } from './smartCard'
import { TaskContext } from './taskContext'
import { DragContext } from './contextCard'

interface DragZoneProps {
	dragContext: DragContext
}

@observer
export default class AoDragZone extends React.Component<DragZoneProps> {
	static contextType = TaskContext

	constructor(props) {
		super(props)
		this.drag = this.drag.bind(this)
	}

	drag(event) {
		const card = this.context
		if (!card) {
			console.log('drag event on missing card')
			return
		}
		if (!this.props.dragContext) {
			console.log('drag without dragContext')
			return
		}
		event.dataTransfer.setData('text/taskId', card.taskId)
		// event.dataTransfer.setData('text/dragContext', this.props.dragContext) // test sending whole object
		event.dataTransfer.setData('text/fromZone', this.props.dragContext.zone)
		if (this.props.dragContext.inId) {
			event.dataTransfer.setData('text/fromInId', this.props.dragContext.inId)
		}
		if (this.props.dragContext.x) {
			event.dataTransfer.setData('text/fromX', this.props.dragContext.x)
		}
		// if (this.props.cardStyle === 'grid') {
		// 	event.dataTransfer.setData('fromX', this.props.x)
		// }
		event.dataTransfer.setData('text/fromY', this.props.dragContext.y)
	}

	render() {
		return (
			<div className={'zone'} draggable="true" onDragStart={this.drag}>
				{this.props.children}
			</div>
		)
	}
}
