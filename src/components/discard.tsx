import * as React from 'react'
import { observer } from 'mobx-react'
import api from '../client/api'
import aoStore from '../client/store'
import AoDragZone from './dragZone'
import AoDropZoneSimple from './dropZoneSimple'
import { CardLocation, goUp } from '../cardTypes'
import { hideAll as hideAllTippys } from 'tippy.js'
import AoDataVis from './dataVis'
import _ from 'lodash'

interface Props {
  onDiscard: () => void
}

@observer
export default class AoDiscardZone extends React.Component<Props> {
	constructor(props) {
		super(props)
		this.state = {}
		this.dropToDiscard = this.dropToDiscard.bind(this)
		this.closeAllCloseables = this.closeAllCloseables.bind(this)
	}

	dropToDiscard(from: CardLocation) {
		if (from.zone === 'discard') {
			return
		}

		const card = aoStore.hashMap.get(from.taskId)
		if (!card) {
			console.log('Invalid card to discard, trying anyway.')
		}

		if (!from.taskId) {
			return
		}
		const cardFrom = aoStore.hashMap.get(from.inId)
		if (!cardFrom) {
			return
		}
		const nameFrom = card.name

    aoStore.addToDiscardHistory([card])
		
		switch (from.zone) {
			case 'card':
				goUp()
				break
			case 'grid':
			  const shrinkDock = () => {
          // If it's a member's bookmarks card, shrink it to remove any empty squares on the right
          const possibleBookmarksCard = aoStore.hashMap.get(from.inId)
          if(!possibleBookmarksCard) {
            return
          }
					if(possibleBookmarksCard.name === aoStore.member.memberId + '-bookmarks') {
						if(possibleBookmarksCard.hasOwnProperty('pins') && possibleBookmarksCard?.grid?.height >= 1) {
							let lastIndexWithCard = 0
							possibleBookmarksCard.pins.forEach(pin => { 
								if(pin.taskId && pin.y === 0 && pin.x && pin.x >= 0) {
									lastIndexWithCard = Math.max(lastIndexWithCard, pin.x)
								}
							})
							api.resizeGrid(from.inId, possibleBookmarksCard.grid.height, lastIndexWithCard + 1, possibleBookmarksCard.grid.size)
						}
					}
        }
        api.playCard(from, { taskId: from.taskId, zone: 'discard'}).then(shrinkDock).then(this.props.onDiscard)
        break
      case 'priorities':    
			case 'subTasks':
			case 'completed':
				api.playCard(from, {taskId: from.taskId, zone: 'discard'})
				break
			case 'context':
				aoStore.removeFromContext(from.taskId)
				break
			case 'gifts':
				break
			case 'stash':
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
				if (guildMemberLevel(cardFrom) >= from.level) {
					api.unstashCard(from.taskId, from.inId, from.level)
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
				<AoDropZoneSimple onDrop={this.dropToDiscard} className='discard' dropHoverMessage='discard (drag to recall)'>
					{aoStore.discard.length >= 1 ? (
						<AoDragZone
							taskId={aoStore.discard[aoStore.discard.length - 1].taskId}
							dragContext={{ zone: 'discard', y: 0 }}
						/>
					) : (
						this.props.children
					)}
				</AoDropZoneSimple>
        <AoDataVis totalLocalTasks={aoStore.state.tasks.length} />
			</div>
		)
	}
}
