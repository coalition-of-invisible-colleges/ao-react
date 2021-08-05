import React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore, { Task } from '../client/store'
import api from '../client/api'
import AoStack from './stack'
import { CardPlay } from '../cards'
import AoPopupPanel from './popupPanel'
import { HudStyle } from './cardHud'
import Stash from '../assets/images/stash.svg'
import { gloss, glossLevel } from '../semantics'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'

interface Props {
	taskId: string
	hudStyle?: HudStyle
}

interface State {
	tab: number
}

@observer
export default class AoStash extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props)
		makeObservable(this)
		this.state = { tab: 1 }
		this.goToTab = this.goToTab.bind(this)
	}

	goToTab(event) {
		const tab = event.currentTarget.getAttribute('data-page')
		if (this.state.tab === tab) {
			return
		}
		this.setState({ tab })
	}

	@computed get maxLevel() {
		const taskId = this.props.taskId
		const card = aoStore.hashMap.get(taskId)
		if (!card || !card.memberships || !card.memberships.length) {
			return null
		}
		let maxLevel = 0
		card.memberships.forEach(membership => {
			maxLevel = Math.max(maxLevel, membership.level)
		})
		return maxLevel
	}

	render() {
		const taskId = this.props.taskId
		const card = aoStore.hashMap.get(taskId)

		const stashCard = (move: CardPlay) => {
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
			console.log('missing card in stash')
		}

		const stashedCards =
			card.stash && card.stash.hasOwnProperty(this.state.tab)
				? card.stash[this.state.tab]
				: []

		const renderTabButton = (tab: number, label: string, enabled: boolean) => {
			if (this.state.tab == tab) {
				return <div className="action inline selected">{label}</div>
			} else {
				if (enabled) {
					return (
						<button
							onClick={this.goToTab}
							data-page={tab}
							className="action inline">
							{label}
						</button>
					)
				} else {
					return (
						<Tippy
							theme="translucent"
							content={`You don't have access to this dropbox level, but you can drop ${gloss(
								'cards'
							)} in here.`}
							placement="bottom">
							<button
								onClick={this.goToTab}
								data-page={tab}
								className="action inline"
								disabled={true}>
								{label}
							</button>
						</Tippy>
					)
				}
			}
		}

		const myLevel =
			card.memberships.find(
				membership => membership.memberId === aoStore.member.memberId
			).level || 0
		const renderedBadge = stashedCards.length
		let renderedTabs = []
		for (let i = 1; i <= this.maxLevel; i++) {
			renderedTabs.push(renderTabButton(i, glossLevel(i), myLevel >= i))
		}
		return (
			<div className="stash">
				<Tippy
					theme="translucent"
					content={`You don't have access to this dropbox level, but you can drop ${gloss(
						'cards'
					)} in here.`}
					placement="bottom">
					<button
						onClick={this.goToTab}
						data-page={1}
						className="action inline"
						disabled={true}>
						TestTab
					</button>
				</Tippy>

				<AoPopupPanel
					iconSrc={Stash}
					tooltipText={`${gloss(
						'Guild'
					)} Stash / Dropbox (cards dropped and stored here will only be visible to members of that level or above)`}
					panelPlacement="right-start"
					id="tour-stash"
					badge={renderedBadge}
					badgeColor="red">
					<React.Fragment>
						{renderedTabs}
						<h4>
							{stashedCards.length} Stashed Card
							{stashedCards.length === 0 || stashedCards.length >= 2 ? 's' : ''}
						</h4>
						<AoStack
							inId={taskId}
							cards={stashedCards}
							cardStyle="checkmark"
							onDrop={stashCard}
							alwaysShowAll={true}
							descriptor={{
								singular: 'stashed card',
								plural: 'stashed cards',
							}}
							zone="stash"
						/>
					</React.Fragment>
				</AoPopupPanel>
			</div>
		)
	}
}
