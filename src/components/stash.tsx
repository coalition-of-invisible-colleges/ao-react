import React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import { Task } from '../interfaces'
import api from '../client/api'
import AoStack from './stack'
import { CardPlay } from '../cardTypes'
import AoPopupPanel from './popupPanel'
import AoDropZone from './dropZone'
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
		this.dropToStash = this.dropToStash.bind(this)
	}

	goToTab(event) {
		const tab = event.currentTarget.getAttribute('data-page')
		if (this.state.tab === tab) {
			return
		}
		this.setState({ tab })
	}

	@computed get guildMemberLevel() {
		const card = aoStore.hashMap.get(this.props.taskId)
		if (!card || !card.memberships || !card.memberships.length) return null

		let found = card.memberships.find(
			membership => membership.memberId === aoStore.member.memberId
		)

		return found ? found.level : 0
	}

	dropToStash(move: CardPlay, level: number = null) {
		if (!move.from.taskId) {
			return
		}
		const cardFrom = aoStore.hashMap.get(move.from.taskId)
		if (!cardFrom) {
			return
		}
		const nameFrom = cardFrom.name

		const cardTo = aoStore.hashMap.get(move.to.taskId)
		const nameTo = cardTo && cardTo.name ? cardTo.name : undefined

		const myLevel = this.guildMemberLevel
		let numLevel: number = level || this.state.tab
		if (typeof numLevel === 'string') {
			numLevel = parseInt(numLevel, 10)
		}
		switch (move.from.zone) {
			case 'discard':
				aoStore.popDiscardHistory()
			case 'card':
			case 'priorities':
			case 'grid':
			case 'subTasks':
			case 'completed':
			case 'context':
			case 'panel':
			default:
				api.stashCard(move.from.taskId, move.from.inId, numLevel)
		}
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

		if (!card) {
			console.log('missing card in stash')
		}

		if (this.props.hudStyle === 'menu') {
			if (!card.showStash) {
				const addStash = () => {
					api.setCardProperty(this.props.taskId, 'showStash', true)
				}
				return (
					<div className="stash menu">
						<div onClick={addStash} className="action">
							<img src={Stash} />
							+stash
						</div>
					</div>
				)
			} else {
				return null
			}
		}

		const stashedTaskIds =
			card.stash && card.stash.hasOwnProperty(this.state.tab)
				? card.stash[this.state.tab]
				: []

		const stashedCards = stashedTaskIds.map(tId => aoStore.hashMap.get(tId))
		const myLevel = this.guildMemberLevel

		let totalStashedCards = 0
		if (card.stash) {
			Object.entries<[number, string[]]>(card.stash).forEach(
				([level, tIds]) => {
					if (myLevel >= parseInt(level, 10)) {
						totalStashedCards += tIds.length
					}
				}
			)
		}

		if (
			(!card.guild || card.guild.length <= 1 || !card.showStash) &&
			totalStashedCards < 1
		) {
			return null
		}

		const renderTabButton = (tab: number, label: string, enabled: boolean) => {
			if (this.state.tab == tab) {
				return <div className="action inline selected">{label}</div>
			} else {
				if (enabled) {
					return (
						<div
							onClick={this.goToTab}
							data-page={tab}
							className="action inline">
							{label}
						</div>
					)
				} else {
					return (
						<Tippy
							theme="translucent"
							content={`You don't have access to this dropbox level, but you can drop ${gloss(
								'cards'
							)} in here.`}
							placement="bottom">
							<div
								onClick={this.goToTab}
								data-page={tab}
								className="action inline">
								{label}
							</div>
						</Tippy>
					)
				}
			}
		}

		const renderedBadge = totalStashedCards
		let renderedTabs = []
		for (let i = 1; i <= this.maxLevel; i++) {
			renderedTabs.push(renderTabButton(i, glossLevel(i), myLevel >= i))
		}
		const onDropFactory = (move: CardPlay) => {
			this.dropToStash(move, this.state.tab as number)
		}

		let numLevel: number = this.state.tab
		if (typeof numLevel === 'string') {
			numLevel = parseInt(numLevel, 10)
		}

		return (
					<React.Fragment>
					  <div className="flexTabs">
						  {renderedTabs}
					  </div>
						{this.guildMemberLevel >= this.state.tab ? (
							<React.Fragment>
								<h4>
									{stashedCards.length} Stashed Card
									{stashedCards.length === 0 || stashedCards.length >= 2
										? 's'
										: ''}
								</h4>
								<AoStack
									inId={taskId}
									cards={stashedCards}
									showAdd={false}
									cardStyle="priority"
									noDrop={true}
									alwaysShowAll={true}
									descriptor={{
										singular: 'stashed card',
										plural: 'stashed cards',
									}}
									zone="stash"
									stashLevel={numLevel}
								/>
							</React.Fragment>
						) : (
							<p>{`This stash is above your membership level in this ${gloss(
								'guild'
							)}, but you can drop cards here (drop on stash icon with this tab selected).`}</p>
						)}
					</React.Fragment>
		)
	}
}
