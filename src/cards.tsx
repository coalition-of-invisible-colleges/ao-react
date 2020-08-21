import api from './client/api'
import aoStore from './client/store'

export type CardZone =
	| 'card'
	| 'priorities'
	| 'grid'
	| 'subTasks'
	| 'completed'
	| 'context'
	| 'discard'
	| 'panel'

export interface Coords {
	x?: number
	y: number
}

export interface CardLocation {
	taskId: string
	inId: string
	zone: CardZone
	coords: Coords
}

export interface CardPlay {
	from: CardLocation
	to: CardLocation
}

export function prioritizeCard(move: CardPlay) {
	if (!move.from.taskId) {
		return
	}
	const nameFrom = aoStore.hashMap.get(move.from.taskId).name

	switch (move.from.zone) {
		case 'card':
			// maybe this doesn't make sense, it's supposed to be for the whole card
			break
		case 'priorities':
			if (move.from.inId === move.to.inId) {
				api.prioritizeCard(move.from.taskId, move.from.inId)
			} else {
				api.findOrCreateCardInCard(nameFrom, move.to.inId, true)
			}
			break
		case 'grid':
			api
				.unpinCardFromGrid(
					move.from.coords.x,
					move.from.coords.y,
					move.from.inId
				)
				.then(() => api.prioritizeCard(move.from.taskId, move.to.inId))
			break
		case 'completed':
		case 'completed':
			api.prioritizeCard(move.from.taskId, move.to.inId)
			break
		case 'discard':
			aoStore.popDiscardHistory()
		case 'subTasks':
		case 'context':
		case 'panel':
			api.findOrCreateCardInCard(nameFrom, move.to.inId, true)
			break
		default:
			break
	}
}

export function subTaskCard(move: CardPlay) {
	if (!move.from.taskId) {
		return
	}
	const nameFrom = aoStore.hashMap.get(move.from.taskId).name

	switch (move.from.zone) {
		case 'card':
			// maybe this doesn't make sense, it's supposed to be for the whole card
			break
		case 'priorities':
			if (move.from.inId) {
				api
					.refocusCard(move.from.taskId, move.from.inId)
					.then(() => api.findOrCreateCardInCard(nameFrom, move.to.inId))
			} else {
				api.findOrCreateCardInCard(nameFrom, move.to.inId)
			}
			break
		case 'grid':
			api.unpinCardFromGrid(
				move.from.coords.x,
				move.from.coords.y,
				move.from.inId
			)
			break
		case 'discard':
			aoStore.popDiscardHistory()
		case 'completed':
		case 'subTasks':
		case 'context':
		case 'panel':
			api.findOrCreateCardInCard(nameFrom, move.to.inId)
			break
		default:
			break
	}
}
