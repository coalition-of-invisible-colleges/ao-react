import * as React from 'react'
import { observer } from 'mobx-react'
import api from '../client/api'
import aoStore from '../client/store'
import AoDragZone from './dragZone'
import AoDropZone from './dropZone'
import { CardPlay } from '../cards'
import { hideAll as hideAllTippys } from 'tippy.js'

@observer
export default class AoDiscardZone extends React.PureComponent {
	constructor(props) {
		super(props)
		this.state = {}
		this.dropToDiscard = this.dropToDiscard.bind(this)
		this.closeAllCloseables = this.closeAllCloseables.bind(this)
	}

	dropToDiscard(move: CardPlay) {
		console.log('dropToGridSquare, move is ', move)
		const card = aoStore.hashMap.get(move.from.taskId)
		if (card) {
			// This should only be done if a card is actually discarded. For example should not be done on priorities that are merely deprioritized. Also it should display the action that is to happen for the black discard background zone as text next to the cursor.
			aoStore.addToDiscardHistory([card])
			console.log('Pushed discarded card to history.')
		} else {
			console.log('Invalid card to discard, trying anyway.')
		}

		if (!move.from.taskId) {
			return
		}
		const cardFrom = aoStore.hashMap.get(move.from.taskId)
		if (!cardFrom) {
			return
		}
		const nameFrom = card.name

		switch (move.from.zone) {
			case 'card':
				// maybe this doesn't make sense, it's supposed to be for the whole card
				break
			case 'priorities':
				api.refocusCard(move.from.taskId, move.from.inId)
				break
			case 'grid':
				api
					.unpinCardFromGrid(
						move.from.coords.x,
						move.from.coords.y,
						move.from.inId
					)
					.then(() => {
						if (card.claimed && card.claimed.length >= 1) {
							api.refocusCard(move.from.taskId, move.from.inId)
						} else {
							api.discardCardFromCard(move.from.taskId, move.from.inId)
						}
					})
				break
			case 'subTasks':
				if (card.claimed && card.claimed.length >= 1) {
					api.refocusCard(move.from.taskId, move.from.inId)
				} else {
					api.discardCardFromCard(move.from.taskId, move.from.inId)
				}
				break
			case 'completed':
				api.discardCardFromCard(move.from.taskId, move.from.inId)
				break
			case 'context':
				aoStore.removeFromContext(move.from.taskId)
				break
		}
	}

	closeAllCloseables() {
		hideAllTippys()
		aoStore.closeAllCloseables()
	}

	render() {
		return (
			<div onClick={this.closeAllCloseables}>
				<AoDropZone onDrop={this.dropToDiscard} zoneStyle={'discard'}>
					{aoStore.discard.length >= 1 ? (
						<AoDragZone
							taskId={aoStore.discard[aoStore.discard.length - 1].taskId}
							dragContext={{ zone: 'discard', y: 0 }}
						/>
					) : (
						this.props.children
					)}
				</AoDropZone>
			</div>
		)
	}
}
