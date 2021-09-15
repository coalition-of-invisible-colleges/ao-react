import React from 'react'
import { observable, computed } from 'mobx'
import { observer } from 'mobx-react'
import aoStore, { Task } from '../client/store'
import api from '../client/api'
import AoStack from './stack'
import { CardPlay } from '../cards'
import AoPopupPanel from './popupPanel'
import Star from '../assets/images/star.svg'

interface CompletedProps {
	taskId: string
}

@observer
export default class AoCompleted extends React.PureComponent<CompletedProps> {
	@computed get completedCards() {
		const card = aoStore.hashMap.get(this.props.taskId)

		if (!card.completed || card.completed.length < 1) {
			return null
		}

		let completedCards: Task[] = card.completed
			.map(tId => aoStore.hashMap.get(tId))
			.filter(t => t?.deck?.length >= 1)
		completedCards.reverse()

		return completedCards
	}

	render() {
		const taskId = this.props.taskId
		const card = aoStore.hashMap.get(taskId)

		const archiveCheckmark = (move: CardPlay) => {
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

		if (!card) {
			console.log('missing card in completed')
		}

		if (this.completedCards === null) {
			return null
		}

		const renderedBadge = this.completedCards.length

		return (
			<div className="accomplishments">
				<AoPopupPanel
					iconSrc={Star}
					tooltipText="Accomplishments"
					panelPlacement="right-start"
					id="tour-accomplishments"
					badge={renderedBadge}
					badgeColor="yellow">
					<React.Fragment>
						<h4>
							{this.completedCards.length} Accomplishment
							{this.completedCards.length >= 2 ? 's' : ''}
						</h4>
						<AoStack
							inId={taskId}
							cards={this.completedCards}
							cardStyle="checkmark"
							onDrop={archiveCheckmark}
							alwaysShowAll={true}
							descriptor={{
								singular: 'accomplishment',
								plural: 'accomplishments'
							}}
							zone="completed"
						/>
					</React.Fragment>
				</AoPopupPanel>
			</div>
		)
	}
}
