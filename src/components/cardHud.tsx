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
import AoPreview from './preview'
import AoMission from './mission'
import AoBark from './bark'
import AoTally from './tally'
import AoLilypad from './lilypad'
import AoStash from './stash'
import AoFund from './fund'
import AoReminder from './reminder'
import AoHiddenFieldset from './hiddenFieldset'
import { gloss, capitalize } from '../semantics'
import config from '../../configuration'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'

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
}
/* 
              <span>
                <p>Click to discard card</p>
                <p><small>Discarded cards are stored in the discard history until refresh. Drag the page background to recall discarded cards.</small></p>
                <p>
                  <small>
                    Discarded cards remain in your deck if you have grabbed or moved them.
                  </small>
                </p>
              </span>
            */

const AoDownBoat = (props: { onClick: (event) => void}) => {
  console.log("onClick is", props.onClick)
  return <Tippy
            zIndex={4}
            theme="translucent"
            content='discard'
            delay={[625, 200]}
            placement="top-end">
            <div className='downboat' onClick={props.onClick} />
          </Tippy>
}

@observer
export default class CardHud extends React.Component<CardHudProps, State> {
	constructor(props) {
		super(props)
		this.state = {}
	}

	render() {
		const taskId = this.props.taskId
		const card = aoStore.hashMap.get(taskId)
		if (!card) return null
		const isMember = this.props.taskId === card.name

		const hudStyle = this.props.hudStyle

    const discardCardFromZone = (zone) => {
      if(!this.props.inId) {
        return
      }
      api.playCard({
        taskId: this.props.taskId,
        inId: this.props.inId,
        zone: zone
      },
      {
        taskId: this.props.taskId,
        zone: 'discard'
      })
    }
    
    const discardCardFromSubTasks = (event) => {
      event.stopPropagation()
      discardCardFromZone('subTasks')
      aoStore.addToDiscardHistory([card])
    }
    
    const discardCardFromPriorities = (event) => {
      discardCardFromZone('priorities')
    }
    
    const discardCardFromCompleted = (event) => {
      discardCardFromZone('completed')
    }
    
		switch (hudStyle) {
			case 'context':
				return (
					<div className="hud">
						{taskId === aoStore?.memberCard?.taskId && <AoGifts />}
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
						<AoCheckbox taskId={taskId} hudStyle={hudStyle} />
						<AoCountdown taskId={taskId} hudStyle={hudStyle} />
						<AoTally taskId={taskId} hudStyle={hudStyle} />
						<AoCrowdfund taskId={taskId} hudStyle={hudStyle} />
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
						{taskId === aoStore?.memberCard?.taskId && <AoGifts />}
						<div className={'hud ' + hudStyle}>
							<AoTimeClock taskId={taskId} hudStyle={hudStyle} />
							<AoTally taskId={taskId} hudStyle={hudStyle} />
							<AoCheckbox taskId={taskId} hudStyle={hudStyle} />
						</div>
					</React.Fragment>
				)
			case 'face before':
				return (
					<React.Fragment>
						<div className={'hud ' + hudStyle}>
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
					  { this.props.children }
					</div>
				)
			case 'face after':
				return (
					<div className={'hud ' + hudStyle}>
					  <AoDownBoat onClick={discardCardFromSubTasks} />
						<AoPreview
							taskId={taskId}
							hudStyle={hudStyle}
							priorPriors={this.props.priorPriors}
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
					</div>
				)
			case 'notification':
			   return (
					<div className={'hud ' + hudStyle}>
			      <AoCheckbox taskId={taskId} hudStyle={hudStyle} />
					</div>
				)
			case 'menu':
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
						<fieldset>
						  <legend>{capitalize(card.color)} Card</legend>
						  <AoPalette taskId={taskId} />
						</fieldset>
						{card.guild && card.guild.length >= 1 && (
							<AoHiddenFieldset heading={gloss('Guild') + ' Options'}>
								<AoLilypad taskId={taskId} hudStyle={hudStyle} />
								<AoStash taskId={taskId} hudStyle={hudStyle} />
							</AoHiddenFieldset>
						)}
						{showCacheButton && 
						  <fieldset>
						    <legend>Media</legend>
						    {cacheButton}
						  </fieldset>
						}
					</div>
				)
		}
	}
}
