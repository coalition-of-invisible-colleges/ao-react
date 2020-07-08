// move onDrag out logic to smartCard (all cards are draggable)
// dropZone only wraps the immediate element that is droppable. so dropZone will wrap the entire priorities region.import
// start by getting drag to work from Top Missions list to Community Hub grid

import * as React from 'react'
import { FunctionComponent } from 'react'
import { useState } from 'react'
import { observer } from 'mobx-react'
import { ObservableMap, computed } from 'mobx'
import { Redirect } from 'react-router-dom'
import api from '../client/api'
import aoStore, { Task } from '../client/store'
import Markdown from 'markdown-to-jsx'
import { Sel } from './smartZone'
import AoContextCard, { CardStyle } from './contextCard'
import { TaskContext } from './taskContext'
import AoDragZone from './dragZone'
import AoDropZone, { CardPlay } from './dropZone'

interface State {
	history: Task[]
}

export const defaultState: State = {
	history: []
}

interface DiscardProps {}

@observer
export default class AoDiscardZone extends React.Component<
	DiscardProps,
	State
> {
	static contextType = TaskContext

	constructor(props) {
		super(props)
		this.state = defaultState
		this.dropToDiscard = this.dropToDiscard.bind(this)
	}

	dropToDiscard(move: CardPlay) {
		console.log('dropToGridSquare, move is ', move)
		const card = aoStore.hashMap.get(move.from.taskId)
		if (card) {
			this.setState({ history: this.state.history.concat(card) })
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

	popHistory() {
		this.setState({ history: this.state.history.slice(0, -1) })
	}

	render() {
		const card = this.context

		console.log('history length is ', this.state.history.length)

		return (
			<AoDropZone onDrop={this.dropToDiscard} zoneStyle={'discard'}>
				{this.state.history.length >= 1 ? (
					<TaskContext.Provider
						value={this.state.history[this.state.history.length - 1]}>
						<AoDragZone onDropSuccess={this.popHistory} />
						<TaskContext.Provider value={card ? card : undefined}>
							{this.props.children}
						</TaskContext.Provider>
					</TaskContext.Provider>
				) : (
					this.props.children
				)}
			</AoDropZone>
		)
	}
}
