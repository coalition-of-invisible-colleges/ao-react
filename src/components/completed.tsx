import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore, { AoState, Task } from '../client/store'
import { Redirect } from 'react-router-dom'
import { ObservableMap } from 'mobx'
import { delay, cancelablePromise, noop } from '../utils'
import api from '../client/api'
import Markdown from 'markdown-to-jsx'
import AoPaper from './paper'
import AoGrid from './grid'
import AoStack from './stack'
import AoSourceStack from './sourceStack'
import AoCardHud from './cardHud'
import AoMission from './mission'
import AoAttachment from './attachment'
import AoCoin from './coin'
import { TaskContext } from './taskContext'
import { CardPlay } from './dropZone'

interface CompletedProps {}

interface State {}

@observer
export default class AoCompleted extends React.Component<
	CompletedProps,
	State
> {
	static contextType = TaskContext

	constructor(props) {
		super(props)
		this.state = {}
		this.archiveCheckmark = this.archiveCheckmark.bind(this)
	}

	archiveCheckmark(move: CardPlay) {
		if (!move.from.taskId) {
			return
		}
		const nameFrom = aoStore.hashMap.get(move.from.taskId).name

		switch (move.from.zone) {
			case 'card':
				// maybe this doesn't make sense, it's supposed to be for the whole card
				break
			case 'priorities':
				api.refocusCard(move.from.taskId, move.from.inId)
				break
			case 'grid':
				api.unpinCardFromGrid(
					move.from.coords.x,
					move.from.coords.y,
					move.from.inId
				)
				break
			case 'subTasks':
			case 'completed':
			case 'context':
			case 'discard':
				// api.refocusCard(move.from.taskId, move.to.inId)
				break
			default:
				break
		}
	}

	render() {
		const card = this.context
		if (!card) {
			console.log('missing card in completed')
		}

		if (!card.completed || card.completed.length < 1) {
			return null
		}

		let completedCards: Task[] = card.completed.map(tId =>
			aoStore.hashMap.get(tId)
		)
		completedCards.reverse()

		return (
			<AoSourceStack
				inId={card.taskId}
				cards={completedCards}
				cardStyle={'checkmark'}
				onDrop={this.archiveCheckmark}
				noFirstCard={true}
				descriptor={{
					singular: 'accomplishment',
					plural: 'accomplishments'
				}}
				zone={'completed'}
			/>
		)
	}
}
