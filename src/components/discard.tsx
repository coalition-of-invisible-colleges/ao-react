import * as React from 'react'
import { useState } from 'react'
import { observer } from 'mobx-react'
import { ObservableMap, computed } from 'mobx'
import { Redirect } from 'react-router-dom'
import api from '../client/api'
import aoStore, { Task } from '../client/store'
import { TaskContext } from './taskContext'
import AoDragZone from './dragZone'
import AoDropZone from './dropZone'
import { CardPlay } from '../cards'
import { hideAll as hideAllTippys } from 'tippy.js'

interface DiscardProps {}

@observer
export default class AoDiscardZone extends React.Component<DiscardProps> {
	static contextType = TaskContext

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
		const nameFrom = aoStore.hashMap.get(move.from.taskId).name

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
		let { card, setRedirect } = this.context
		// console.log('render discard setRedirect is ', setRedirect)
		return (
			<div onClick={this.closeAllCloseables}>
				<AoDropZone onDrop={this.dropToDiscard} zoneStyle={'discard'}>
					{aoStore.discard.length >= 1 ? (
						<TaskContext.Provider
							value={{
								card: aoStore.discard[aoStore.discard.length - 1],
								setRedirect: setRedirect
							}}>
							<AoDragZone dragContext={{ zone: 'discard', y: 0 }} />
							<TaskContext.Provider
								value={{
									card: card ? card : undefined,
									setRedirect: setRedirect
								}}>
								{this.props.children}
							</TaskContext.Provider>
						</TaskContext.Provider>
					) : (
						this.props.children
					)}
				</AoDropZone>
			</div>
		)
	}
}
