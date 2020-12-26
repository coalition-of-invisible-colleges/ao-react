import api from './client/api'
import aoStore, { Task, Signature } from './client/store'
import { hideAll as hideAllTippys } from 'tippy.js'

export type CardZone =
	| 'card'
	| 'priorities'
	| 'grid'
	| 'subTasks'
	| 'completed'
	| 'context'
	| 'discard'
	| 'panel'
	| 'gifts'

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

export function goInCard(card: Task, isContext = false) {
	hideAllTippys()
	aoStore.closeAllCloseables()

	const taskId = card.taskId
	console.log('goInCard taskId is ', taskId)
	if (isContext) {
		aoStore.clearContextTo(card.taskId)
	} else {
		aoStore.addToContext([aoStore.currentCard])
	}
	aoStore.setCurrentCard(taskId)
	aoStore.removeFromContext(taskId)
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
			api.prioritizeCard(move.from.taskId, move.to.inId)
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

// this is actually about members, not cards, but not gonna split the file yet
// export function isSenpai(memberId: string) {
// return isSenpaiOf(aoStore.member.memberId, memberId)
// const theirCard = aoStore.hashMap.get(memberId)
// if (!theirCard) {
// 	console.log('invalid member detected')
// 	return 0
// }
// const theirVouchCards = theirCard.deck
// 	.map(mId => aoStore.hashMap.get(mId))
// 	.filter(memberCard => memberCard !== undefined)

// let theirVouches = theirVouchCards.length

// theirVouchCards.forEach(card => {
// 	theirVouches = Math.max(theirVouches, countVouches(card.taskId))
// })

// const myVouches = aoStore.memberCard.deck
// 	.map(mId => aoStore.hashMap.get(mId))
// 	.filter(memberCard => memberCard !== undefined).length

// let theirRank = aoStore.state.members.findIndex(m => m.memberId === memberId)
// let myRank = aoStore.state.members.findIndex(
// 	m => m.memberId === aoStore.member.memberId
// )
// if (theirRank < myRank && theirVouches > myVouches) {
// 	return 1
// } else if (myRank < theirRank && myVouches > theirVouches) {
// 	return -1
// }
// return 0
// }

// A card's .signed is an append-only list of all signing events.
// This function reduces it to just each member's current opinion
export function mostRecentSignaturesOnly(signed: Signature[]) {
	let mostRecentSignaturesOnly = signed.filter((signature, index) => {
		let lastIndex
		for (let i = signed.length - 1; i >= 0; i--) {
			if (signed[i].memberId === signature.memberId) {
				lastIndex = i
				break
			}
		}
		return lastIndex === index
	})
	return mostRecentSignaturesOnly
}

export function countCurrentSignatures(signed: Signature[]) {
	return mostRecentSignaturesOnly(signed).filter(
		signature => signature.opinion >= 1
	).length
}

export function countVouches(memberId: string) {
	const card = aoStore.hashMap.get(memberId)
	if (!card || !card.hasOwnProperty('deck')) return null

	let count = 0

	const memberCards = card.deck
		.map(memberId => aoStore.hashMap.get(memberId))
		.forEach(memberCard => {
			if (memberCard !== undefined) {
				count++
			}
		})

	return count
}
