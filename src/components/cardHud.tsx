import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import AoPalette from './palette'
import AoBird from './bird'
import AoUnread from './unread'
import AoCoin from './coin'
import AoBoat from './boat'
import AoCheckbox from './checkbox'
import AoValue from './value'
import AoCrowdfund from './crowdfund'
import AoInterval from './interval'
import AoCountdown from './countdown'
import AoTimeClock from './timeclock'
import AoCardMenu from './cardMenu'
import AoPreview from './preview'
import AoMission from './mission'
import AoBark from './bark'
import AoTally from './tally'
import AoLilypad from './lilypad'
import AoStash from './stash'
import AoFund from './fund'
import config from '../../configuration'

export type HudStyle =
	| 'context'
	| 'full before'
	| 'full after'
	| 'face before'
	| 'face after'
	| 'collapsed'
	| 'collapsed-mission'
	| 'mini before'
	| 'mini after'
	| 'badge'
	| 'menu'

interface CardHudProps {
	taskId: string
	hudStyle: HudStyle
	prioritiesShown?: boolean
	onTogglePriorities?: (any) => void
	noPopups?: boolean
	inId?: string
}

interface State {
	clicked?: boolean
}

@observer
export default class CardHud extends React.Component<CardHudProps, State> {
	constructor(props) {
		super(props)
		this.addGrid = this.addGrid.bind(this)
		this.state = {}
	}

	addGrid() {
		api.addGridToCard(this.props.taskId, 3, 3)
	}

	render() {
		const taskId = this.props.taskId
		const card = aoStore.hashMap.get(taskId)
		if (!card) return null
		const isMember = this.props.taskId === card.name

		const hudStyle = this.props.hudStyle
		const isGrabbed = card.deck.indexOf(aoStore.member.memberId) >= 0

		// let cardHudIdentifierFunction =

		switch (hudStyle) {
			case 'context':
				return (
					<div className={'hud'}>
						<AoUnread taskId={taskId} />
						<AoMission taskId={taskId} hudStyle={hudStyle} />
						<AoPreview
							taskId={taskId}
							hudStyle={hudStyle}
							prioritiesShown={this.props.prioritiesShown}
							onTogglePriorities={this.props.onTogglePriorities}
						/>
						<AoCountdown taskId={taskId} hudStyle={hudStyle} />
					</div>
				)
				break
			case 'collapsed':
				return (
					<div className="hud">
						<AoUnread taskId={taskId} />
						<AoMission taskId={taskId} hudStyle={hudStyle} />
						{isMember ? <AoBark memberId={taskId} /> : ''}
						<AoPreview
							taskId={taskId}
							hudStyle={hudStyle}
							prioritiesShown={this.props.prioritiesShown}
							onTogglePriorities={this.props.onTogglePriorities}
						/>
						<AoCountdown taskId={taskId} hudStyle={hudStyle} />
						<AoTally taskId={taskId} hudStyle={hudStyle} />
						<AoValue taskId={taskId} hudStyle={hudStyle} />
						<AoCrowdfund taskId={taskId} hudStyle={hudStyle} />
						<AoCheckbox taskId={taskId} hudStyle={hudStyle} />
						<AoCardMenu taskId={taskId} hudStyle={hudStyle} />
					</div>
				)
			case 'collapsed-mission':
				return (
					<div className="hud">
						<AoUnread taskId={taskId} />
						<AoPreview
							taskId={taskId}
							hudStyle={hudStyle}
							prioritiesShown={this.props.prioritiesShown}
							onTogglePriorities={this.props.onTogglePriorities}
						/>
						<AoCountdown taskId={taskId} hudStyle={hudStyle} />
						<AoTally taskId={taskId} hudStyle={hudStyle} />
						<AoValue taskId={taskId} hudStyle={hudStyle} />
						<AoCrowdfund taskId={taskId} hudStyle={hudStyle} />
						<AoLilypad taskId={taskId} />
						<AoCheckbox taskId={taskId} hudStyle={hudStyle} />
						<AoCardMenu taskId={taskId} hudStyle={hudStyle} />
					</div>
				)
			case 'full before':
				return (
					<React.Fragment>
						{isGrabbed && taskId !== card.name && <AoBird taskId={taskId} />}
						<AoStash taskId={taskId} hudStyle={hudStyle} />
						<div className={'hud ' + hudStyle}>
							<AoCountdown taskId={taskId} hudStyle={hudStyle} />
							<AoTimeClock taskId={taskId} hudStyle={hudStyle} />
							<AoTally taskId={taskId} hudStyle={hudStyle} />
							<AoValue taskId={taskId} hudStyle={hudStyle} />
							<AoCrowdfund taskId={taskId} hudStyle={hudStyle} />
							<AoInterval taskId={taskId} hudStyle={hudStyle} />
							<AoCheckbox taskId={taskId} hudStyle={hudStyle} />
						</div>
						<AoUnread taskId={taskId} />
					</React.Fragment>
				)
			case 'face before':
				return (
					<React.Fragment>
						{isGrabbed && <AoBird taskId={taskId} />}
						<div className={'hud ' + hudStyle}>
							<AoCountdown taskId={taskId} hudStyle={hudStyle} />
							<AoTally taskId={taskId} hudStyle={hudStyle} />
							<AoValue taskId={taskId} hudStyle={hudStyle} />
							<AoCrowdfund taskId={taskId} hudStyle={hudStyle} />
							{this.props.inId ? (
								<AoBoat taskId={taskId} inId={this.props.inId} />
							) : (
								<AoCheckbox taskId={taskId} hudStyle={hudStyle} />
							)}
						</div>
					</React.Fragment>
				)
			case 'full after':
				return (
					<div className={'hud ' + hudStyle}>
						<AoCoin taskId={taskId} />
						<AoLilypad taskId={taskId} />
						<AoCardMenu taskId={taskId} hudStyle={hudStyle} />
					</div>
				)
			case 'face after':
				return (
					<div className={'hud ' + hudStyle}>
						<AoUnread taskId={taskId} />
						<AoCoin taskId={taskId} noPopups={this.props.noPopups} />
						<AoPreview taskId={taskId} hudStyle={hudStyle} />
						<AoCardMenu
							taskId={taskId}
							hudStyle={hudStyle}
							noPopups={this.props.noPopups}
						/>
					</div>
				)
			case 'mini before':
				return (
					<div className={'hud ' + hudStyle}>
						<AoMission taskId={taskId} hudStyle={hudStyle} />
						<AoTally taskId={taskId} hudStyle={hudStyle} />
						<AoCheckbox taskId={taskId} hudStyle={hudStyle} />
						<AoValue taskId={taskId} hudStyle={hudStyle} />
						<AoCrowdfund taskId={taskId} hudStyle={hudStyle} />
					</div>
				)
			case 'mini after':
				return (
					<React.Fragment>
						<AoUnread taskId={taskId} />
						<div className={'hud ' + hudStyle}>
							<AoCountdown taskId={taskId} hudStyle={hudStyle} />
							<AoPreview taskId={taskId} hudStyle={hudStyle} />
							<AoCardMenu taskId={taskId} hudStyle={hudStyle} />
						</div>
					</React.Fragment>
				)
			case 'badge':
				return (
					<div className={'hud ' + hudStyle}>
						<AoCountdown taskId={taskId} hudStyle={hudStyle} />
						<AoPreview taskId={taskId} hudStyle={hudStyle} />
						<AoCheckbox taskId={taskId} hudStyle={hudStyle} />
						<AoCardMenu taskId={taskId} hudStyle={hudStyle} />
					</div>
				)
			case 'menu':
				const grid = card.grid
				const noGrid =
					!grid ||
					(grid.hasOwnProperty('height') && grid.height < 1) ||
					(grid.hasOwnProperty('width') && grid.width < 1) ||
					!grid.hasOwnProperty('height') ||
					!grid.hasOwnProperty('width')

				const mediaUrlDetected = true
				const cacheButton = (
					<button
						className="cache menu action"
						onClick={() => {
							this.setState({ clicked: true })
							api.cacheMeme(this.props.taskId)
						}}
						disabled={this.state.clicked}>
						Cache Media
					</button>
				)
				const showCacheButton = config.memes.dir && config.memes.videoCacher
				const parentCard = this.props.inId
					? aoStore.hashMap.get(this.props.inId)
					: null

				return (
					<div className="hud menu">
						<AoMission taskId={taskId} hudStyle={hudStyle} />
						{card.guild && card.guild.length >= 1 && (
							<React.Fragment>
								<AoLilypad taskId={taskId} hudStyle={hudStyle} />
								<AoStash taskId={taskId} hudStyle={hudStyle} />
							</React.Fragment>
						)}
						{noGrid && (
							<div className="gridMenu action" onClick={this.addGrid}>
								+grid
							</div>
						)}
						<AoInterval taskId={taskId} hudStyle={hudStyle} />
						<AoCrowdfund taskId={taskId} hudStyle={hudStyle} />
						{showCacheButton && cacheButton}
						<AoCountdown taskId={taskId} hudStyle={hudStyle} />
						<AoFund taskId={taskId} />
						<AoPalette taskId={taskId} />
					</div>
				)
		}
	}
}
