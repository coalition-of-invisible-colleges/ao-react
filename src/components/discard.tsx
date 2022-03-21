import * as React from 'react'
import { observer } from 'mobx-react'
import api from '../client/api'
import aoStore from '../client/store'
import AoDragZone from './dragZone'
import AoDropZone from './dropZone'
import { CardPlay, goUp } from '../cardTypes'
import { hideAll as hideAllTippys } from 'tippy.js'
import AoDataVis from './dataVis'
import _ from 'lodash'

@observer
export default class AoDiscardZone extends React.Component {
	constructor(props) {
		super(props)
		this.state = {}
		this.dropToDiscard = this.dropToDiscard.bind(this)
		this.closeAllCloseables = this.closeAllCloseables.bind(this)
	}

	dropToDiscard(move: CardPlay) {
		if (move.from.zone === 'discard') {
			return
		}

		const card = aoStore.hashMap.get(move.from.taskId)
		if (!card) {
			console.log('Invalid card to discard, trying anyway.')
		}

		if (!move.from.taskId) {
			return
		}
		const cardFrom = aoStore.hashMap.get(move.from.inId)
		if (!cardFrom) {
			return
		}
		const nameFrom = card.name

		switch (move.from.zone) {
			case 'card':
				aoStore.addToDiscardHistory([card])
				goUp()
				break
			case 'priorities':
				if (card.claimed && card.claimed.length >= 1) {
					api.refocusCard(move.from.taskId, move.from.inId)
				} else {
					api.refocusCard(move.from.taskId, move.from.inId).then(() => {
						aoStore.addToDiscardHistory([card])
						api.discardCardFromCard(move.from.taskId, move.from.inId)
					})
				}
				break
			case 'grid':
			  const shrinkDock = () => {
          // If it's a member's bookmarks card, shrink it to remove any empty squares on the right
          console.log("shrinkDock!")
          console.log("card.name is", move.from.inId)
          const possibleBookmarksCard = aoStore.hashMap.get(move.from.inId)
          if(!possibleBookmarksCard) {
            return
          }
					if(possibleBookmarksCard.name === aoStore.member.memberId + '-bookmarks') {
						if(_.has(possibleBookmarksCard, 'grid.rows') && possibleBookmarksCard?.grid?.height >= 1) {
							let lastIndexWithCard = 0
							if(_.has(possibleBookmarksCard, 'grid.rows.0')) {
  							Object.entries(possibleBookmarksCard.grid.rows[0]).sort((a, b) => { 
  							console.log("a is", a)
  							return parseInt(b[0]) - parseInt(a[0])}).forEach(([index, bookmarkTaskId], i) => {
  								if(bookmarkTaskId) {
  									lastIndexWithCard = Math.max(lastIndexWithCard, parseInt(index, 10))
  								}
  							})
  					  }
							api.resizeGrid(move.from.inId, possibleBookmarksCard.grid.height, lastIndexWithCard + 1, possibleBookmarksCard.grid.size)
						}
					}
        }
          
				api
					.unpinCardFromGrid(
						move.from.coords.x,
						move.from.coords.y,
						move.from.inId
					)
					.then(() => {
						if (card.claimed && card.claimed.length >= 1) {
							api.refocusCard(move.from.taskId, move.from.inId).then(shrinkDock)
						} else {
							api.refocusCard(move.from.taskId, move.from.inId).then(() => {
								aoStore.addToDiscardHistory([card])
								api.discardCardFromCard(move.from.taskId, move.from.inId).then(shrinkDock)
							})
						}
					})
				break
			case 'subTasks':
				if (card.claimed && card.claimed.length >= 1) {
					api.refocusCard(move.from.taskId, move.from.inId)
				} else {
					aoStore.addToDiscardHistory([card])
					api.discardCardFromCard(move.from.taskId, move.from.inId)
				}
				break
			case 'completed':
				aoStore.addToDiscardHistory([card])
				api.discardCardFromCard(move.from.taskId, move.from.inId)
				break
			case 'context':
				aoStore.addToDiscardHistory([card])
				aoStore.removeFromContext(move.from.taskId)
				break
			case 'gifts':
				aoStore.addToDiscardHistory([card])
				api.dropCard(move.from.taskId)
				break
			case 'stash':
				aoStore.addToDiscardHistory([card])
				const guildMemberLevel = guildCard => {
					if (
						!guildCard ||
						!guildCard.memberships ||
						!guildCard.memberships.length
					)
						return null

					let found = guildCard.memberships.find(
						membership => membership.memberId === aoStore.member.memberId
					)

					return found ? found.level : 0
				}
				console.log('guildMemberLevel is ', guildMemberLevel(cardFrom))
				if (guildMemberLevel(cardFrom) >= move.from.level) {
					api.unstashCard(move.from.taskId, move.from.inId, move.from.level)
				}
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
				<AoDropZone onDrop={this.dropToDiscard} zoneStyle="discard">
					{aoStore.discard.length >= 1 ? (
						<AoDragZone
							taskId={aoStore.discard[aoStore.discard.length - 1].taskId}
							dragContext={{ zone: 'discard', y: 0 }}
						/>
					) : (
						this.props.children
					)}
				</AoDropZone>
        <AoDataVis totalLocalTasks={aoStore.state.tasks.length} />
			</div>
		)
	}
}
