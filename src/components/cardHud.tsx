import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import AoPalette from './palette'
import AoGifts from './gifts'
import AoBird from './bird'
import AoBoat from './boat'
import AoCheckbox from './checkbox'
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
import AoReminder from './reminder'
import config from '../../configuration'

export type HudStyle =
	| 'context'
	| 'full before'
	| 'full after'
	| 'face before'
	| 'face after'
	| 'collapsed'
	| 'collapsed-mission'
	| 'collapsed-member'
	| 'mini before'
	| 'mini after'
	| 'badge'
	| 'menu'
	| 'notification'

interface CardHudProps {
	taskId: string
	hudStyle: HudStyle
	prioritiesShown?: boolean
	onTogglePriorities?: (any) => void
	noPopups?: boolean
	inId?: string
	priorPriors?: string[]
}

interface State {
	clicked?: boolean
    card?: any
    access?: string
}

@observer
export default class CardHud extends React.Component<CardHudProps, State> {
	constructor(props) {
		super(props)
		this.addGrid = this.addGrid.bind(this)
		this.modifyCardAccess = this.modifyCardAccess.bind(this)
		const { access } = aoStore.hashMap.get(this.props.taskId)
		this.state = { access }
	}

	addGrid() {
		api.addGridToCard(this.props.taskId, 3, 3)
	}

	modifyCardAccess() {
		const card = aoStore.hashMap.get(this.props.taskId)
        this.setState({ access: card.access })
        if (this.state.access === "public") {
            api.setCardAccess(this.props.taskId, 'private');
        } else if (this.state.access === 'private')  {
            api.setCardAccess(this.props.taskId, 'default');
        } else {
            api.setCardAccess(this.props.taskId, 'public');
        }
    }

	render() {
		const taskId = this.props.taskId
		const card = aoStore.hashMap.get(taskId)
		if (!card) return null
		const isMember = this.props.taskId === card.name

		const hudStyle = this.props.hudStyle

		// let cardHudIdentifierFunction =

		switch (hudStyle) {
			case 'context':
				return (
					<div className="hud">
						{taskId === aoStore.memberCard.taskId && <AoGifts />}
						<AoMission taskId={taskId} hudStyle={hudStyle} />
						<AoPreview
							taskId={taskId}
							hudStyle={hudStyle}
							prioritiesShown={this.props.prioritiesShown}
							onTogglePriorities={this.props.onTogglePriorities}
							priorPriors={this.props.priorPriors}
						/>
						<AoCountdown taskId={taskId} hudStyle={hudStyle} />
						<AoCrowdfund taskId={taskId} hudStyle={hudStyle} />
					</div>
				)
				break
			case 'collapsed':
				return (
					<div className="hud">
						<AoMission taskId={taskId} hudStyle={hudStyle} />
						{isMember ? <AoBark memberId={taskId} /> : ''}
						<AoPreview
							taskId={taskId}
							hudStyle={hudStyle}
							prioritiesShown={this.props.prioritiesShown}
							onTogglePriorities={this.props.onTogglePriorities}
							priorPriors={this.props.priorPriors}
						/>
						<AoCountdown taskId={taskId} hudStyle={hudStyle} />
						<AoTally taskId={taskId} hudStyle={hudStyle} />
						<AoCrowdfund taskId={taskId} hudStyle={hudStyle} />
						<AoCheckbox taskId={taskId} hudStyle={hudStyle} />
						<AoCardMenu taskId={taskId} hudStyle={hudStyle} />
					</div>
				)
			case 'collapsed-mission':
				return (
					<div className="hud">
						<AoPreview
							taskId={taskId}
							hudStyle={hudStyle}
							prioritiesShown={this.props.prioritiesShown}
							onTogglePriorities={this.props.onTogglePriorities}
							priorPriors={this.props.priorPriors}
						/>
						<AoCountdown taskId={taskId} hudStyle={hudStyle} />
						<AoTally taskId={taskId} hudStyle={hudStyle} />
						<AoCrowdfund taskId={taskId} hudStyle={hudStyle} />
						<AoLilypad taskId={taskId} />
						<AoCheckbox taskId={taskId} hudStyle={hudStyle} />
						<AoCardMenu taskId={taskId} hudStyle={hudStyle} />
					</div>
				)
			case 'collapsed-member':
				return (
					<div className="hud">
						{/*<AoPreview
							taskId={taskId}
							hudStyle={hudStyle}
							prioritiesShown={this.props.prioritiesShown}
							onTogglePriorities={this.props.onTogglePriorities}
							priorPriors={this.props.priorPriors}
						/>*/}
						<AoReminder memberCard={card} />
						<AoCrowdfund taskId={taskId} hudStyle={hudStyle} />
						{isMember ? <AoBark memberId={taskId} /> : ''}
					</div>
				)
			case 'full before':
				return (
					<React.Fragment>
						<AoBird taskId={taskId} />
						{taskId === aoStore.memberCard.taskId && <AoGifts />}
						<AoStash taskId={taskId} hudStyle={hudStyle} />
						<div className={'hud ' + hudStyle}>
							<AoCountdown taskId={taskId} hudStyle={hudStyle} />
							<AoTimeClock taskId={taskId} hudStyle={hudStyle} />
							<AoTally taskId={taskId} hudStyle={hudStyle} />
							<AoCrowdfund taskId={taskId} hudStyle={hudStyle} />
							<AoInterval taskId={taskId} hudStyle={hudStyle} />
							<AoCheckbox taskId={taskId} hudStyle={hudStyle} />
						</div>
					</React.Fragment>
				)
			case 'face before':
				return (
					<React.Fragment>
						<AoBird taskId={taskId} />
						<div className={'hud ' + hudStyle}>
							<AoCountdown taskId={taskId} hudStyle={hudStyle} />
							<AoTally taskId={taskId} hudStyle={hudStyle} />
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
						<AoLilypad taskId={taskId} />
						<AoCardMenu taskId={taskId} hudStyle={hudStyle} />
					</div>
				)
			case 'face after':
				return (
					<div className={'hud ' + hudStyle}>
						<AoPreview
							taskId={taskId}
							hudStyle={hudStyle}
							priorPriors={this.props.priorPriors}
						/>
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
						<AoCrowdfund taskId={taskId} hudStyle={hudStyle} />
					</div>
				)
			case 'mini after':
				return (
					<React.Fragment>
						<div className={'hud ' + hudStyle}>
							<AoCheckbox taskId={taskId} hudStyle={hudStyle} />
							<AoCountdown taskId={taskId} hudStyle={hudStyle} />
							<AoPreview
								taskId={taskId}
								hudStyle={hudStyle}
								priorPriors={this.props.priorPriors}
							/>
							<AoCardMenu taskId={taskId} hudStyle={hudStyle} />
						</div>
					</React.Fragment>
				)
			case 'badge':
				return (
					<div className={'hud ' + hudStyle}>
						<AoCountdown taskId={taskId} hudStyle={hudStyle} />
						<AoPreview
							taskId={taskId}
							hudStyle={hudStyle}
							priorPriors={this.props.priorPriors}
						/>
						<AoCheckbox taskId={taskId} hudStyle={hudStyle} />
						<AoCardMenu taskId={taskId} hudStyle={hudStyle} />
					</div>
				)
			case 'notification':
			   return (
					<div className={'hud ' + hudStyle}>
						<AoCountdown taskId={taskId} hudStyle={hudStyle} />
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
					<div className="hud menu" onClick={event => event.stopPropagation()}>
						<AoMission taskId={taskId} hudStyle={hudStyle} />
						{card.guild && card.guild.length >= 1 && (
							<React.Fragment>
								<AoLilypad taskId={taskId} hudStyle={hudStyle} />
								<AoStash taskId={taskId} hudStyle={hudStyle} />
							</React.Fragment>
						)}
						{noGrid && (
							<div className="gridMenu action" onClick={this.addGrid}>
								add pyramid
							</div>
						)}
						<AoInterval taskId={taskId} hudStyle={hudStyle} />
						<AoCrowdfund taskId={taskId} hudStyle={hudStyle} />
						{showCacheButton && cacheButton}
						<AoCountdown taskId={taskId} hudStyle={hudStyle} />
						<AoFund taskId={taskId} />
                        <div className="gridMenu action" onClick={this.modifyCardAccess}>
                         {"Access: " + this.state.access}
                        </div>
						<AoPalette taskId={taskId} />
					</div>
				)
		}
	}
}
