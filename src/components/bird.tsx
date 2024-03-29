import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import AoStack from './stack'
import AoBirdAutocomplete from './birdAutocomplete'
import AoHiddenFieldset from './hiddenFieldset'
import Bird from '../assets/images/pushpin.svg'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'
import LazyTippy from './lazyTippy'
import AoMemberIcon from './memberIcon'
import { gloss, glossLevel } from '../semantics'
import { crawler } from '../calculations'

type BirdTab = 'send' | 'link' | 'sign'

interface Props {
  taskId: string
  noPopups?: boolean
}

interface State {
  memberId?: string
  memberName?: string
  tab: BirdTab
  selectedServer?: string
  error?: string
  includeCrawlerCards: boolean
}

const THIS_SERVER = "on this AO"

@observer
export default class AoBird extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    makeObservable(this)
    this.state = { tab: 'send', includeCrawlerCards: true }
    this.onChange = this.onChange.bind(this)
    this.passCard = this.passCard.bind(this)
    this.focus = this.focus.bind(this)
    this.goToTab = this.goToTab.bind(this)
    this.signCard = this.signCard.bind(this)
    this.unsignCard = this.unsignCard.bind(this)
    this.renderTabButton = this.renderTabButton.bind(this)
  }

  private birdBox = React.createRef<HTMLInputElement>()

  onChange(memberId: string) {
    this.setState({ memberId })
  }

  passCard(event) {
    event.stopPropagation()
    if (aoStore.member.memberId === undefined) {
      console.log("No memberId available, something is broken, cannot send card")
      return
    }
    if(!this.state.selectedServer || this.state.selectedServer === THIS_SERVER) {
      api.passCard(this.props.taskId, this.state.memberId)
    } else {
       let tasks = []
        if (aoStore.currentCard === aoStore.member.memberId) {
            tasks = aoStore.state.tasks.filter(t => t.deck.indexOf(aoStore.member.memberId) > -1)
        } else if(this.state.includeCrawlerCards) {
            let taskList = crawler(aoStore.state.tasks, aoStore.currentCard)
            tasks = aoStore.state.tasks.filter(t => taskList.indexOf(t.taskId) > -1)
        } else {
          tasks = [aoStore.hashMap.get(aoStore.currentCard)]
        }
        const eventToSend = {
          type: 'tasks-received',
          to: this.state.memberName,
          tasks
        }
        api.relayEventToOtherAo(this.state.selectedServer, eventToSend).then(() => {
          this.setState({error: 'Sent!'})
        })
        this.setState({error: "Sending..."})
    }
  }

  focus() {
    document.getElementById('autocomplete-' + this.props.taskId).focus()
  }

  @computed get pendingPasses() {
    const taskId = this.props.taskId
    const card = aoStore.hashMap.get(taskId)
    return card.passed.length
  }

  @computed get renderPassList() {
    const taskId = this.props.taskId
    const card = aoStore.hashMap.get(taskId)
    if (!card) {
      return null
    }
    const renderedPasses = card.passed.map(pass => {
      const fromId = pass[0]
      let fromName
      if(fromId.includes('.onion')) {
        fromName = fromId
      } else {
        const fromMember = aoStore.memberById.get(fromId)
        fromName = fromMember ? fromMember.name : 'deleted member'
      }
      const toId = pass[1]
      const toMember = aoStore.memberById.get(toId)
      const toName = toMember ? toMember.name : 'deleted member'
      return (
        <div key={fromId + '-' + toId}>
          <AoMemberIcon memberId={fromId} /> {fromName}{' '}
          <img src={Bird} style={{ height: '1em' }} />{' '}
          <AoMemberIcon memberId={toId} /> {toName}
        </div>
      )
    })

    return (
      <React.Fragment>
        {renderedPasses.length > 0 && <h4>Pending Passes</h4>}
        {renderedPasses}
      </React.Fragment>
    )
  }

  goToTab(event) {
    event.stopPropagation()
    const tab = event.currentTarget.getAttribute('data-page')
    if (this.state.tab === tab) {
      return
    }
    this.setState({ tab: tab })
  }

  @computed get isSigned() {
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card || !card.signed || !card.signed.length) return null
    let lastFoundOpinion
    card.signed.forEach(signature => {
      if (signature.memberId === aoStore.member.memberId) {
        lastFoundOpinion = signature.opinion
      }
    })

    return lastFoundOpinion === 1
  }

  @computed get guildMemberLevel() {
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card || !card.memberships || !card.memberships.length) return null

    let found = card.memberships.find(
      membership => membership.memberId === aoStore.member.memberId
    )

    return found ? found.level : null
  }

  @computed get memberRequests() {
    const myLevel = this.guildMemberLevel
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card || !card.signed || !card.signed.length) return null

    let lastFoundOpinions = {}
    card.signed.forEach(signature => {
      lastFoundOpinions[signature.memberId] = signature.opinion
    })

    const memberIdsRequestingEntry = Object.entries(lastFoundOpinions)
      .filter(
        ([memberId, opinion]) =>
          opinion >= 1 &&
          (!card.memberships ||
            (card.memberships &&
              card.memberships.length &&
              !card.memberships.some(
                memb => memb.memberId === memberId && memb.level !== 0
              )))
      )
      .map(([memberId, opinion]) => memberId)

    return memberIdsRequestingEntry
  }

  @computed get renderedApplicantsList() {
    const taskId = this.props.taskId
    return (
      <ul>
        {this.memberRequests?.map(mId => {
          const name = aoStore.memberById.get(mId)?.name
          const approveApplicant = () => {
            api.assignMembership(taskId, mId, 1)
          }
          const rejectApplicant = () => {
            api.assignMembership(taskId, mId, 0)
          }
          return (
            <li key={mId}>
              <AoMemberIcon memberId={mId} />
              {name}{' '}
              {this.guildMemberLevel >= 2 && (
                <React.Fragment>
                  <div className="action inline" onClick={approveApplicant}>
                    welcome
                  </div>
                  <div className="action inline" onClick={rejectApplicant}>
                    reject
                  </div>
                </React.Fragment>
              )}
            </li>
          )
        })}
      </ul>
    )
  }

  @computed get memberships() {
    const myLevel = this.guildMemberLevel
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card || !card.memberships || !card.memberships.length) return null
    return card?.memberships
      ?.filter(membership => membership.level >= 1)
      .sort((a, b) => b.level - a.level)
  }

  @computed get renderedMembers() {
    if (
      !this.memberships ||
      !this.memberships.length ||
      this.memberships.length < 1
    ) {
      return null
    }

    const taskId = this.props.taskId

    const myLevel = this.guildMemberLevel
    let maxLevel = 0
    this.memberships.forEach(membership => {
      maxLevel = Math.max(maxLevel, membership.level)
    })

    const renderedRows = this.memberships.map(membership => {
      const { memberId, level } = membership
      const name = aoStore.memberById.get(memberId)?.name
      const validSelfPromotion =
        memberId === aoStore.member.memberId &&
        myLevel === maxLevel &&
        maxLevel >= 1
      const canPromote =
        (myLevel > level && myLevel >= level + 2) || validSelfPromotion
      const canDemote =
        (myLevel > level && myLevel >= level + 1) || validSelfPromotion

      const promoteMember = () => {
        api.assignMembership(taskId, memberId, level + 1)
      }
      const demoteOrKick = () => {
        if (level > 1) {
          let demoteMsg
          if (memberId === aoStore.member.memberId) {
            demoteMsg = `Are you sure you want to demote yourself? Without one person with the highest level, anyone will be able to promote themselves and take over the ${gloss(
              'guild'
            )}!`
          } else {
            demoteMsg = `Are you sure you want to demote this ${glossLevel(
              level
            )}? This might hurt their feelings.`
          }
          if (window.confirm(demoteMsg)) {
            api.assignMembership(taskId, memberId, level - 1)
          }
        } else {
          let kickMsg
          if (memberId === aoStore.member.memberId) {
            kickMsg = `Are you sure you want to kick yourself out? You will not unsign the ${gloss(
              'card'
            )}.`
          } else {
            kickMsg = `Are you sure you want to kick this member out of the ${gloss(
              'guild'
            )}? They will not be able to rejoin the ${gloss(
              'guild'
            )} unless you delete their kick (no way to do this yet). This might hurt their feelings.`
          }

          if (window.confirm(kickMsg)) {
            api.assignMembership(taskId, memberId, -1)
          }
        }
      }
      return (
        <tr key={memberId}>
          <td>
            <AoMemberIcon memberId={memberId} />
            {name}
            {canPromote && (
              <div className="action inline" onClick={promoteMember}>
                promote
              </div>
            )}
            {canDemote && (
              <div className="action inline" onClick={demoteOrKick}>
                {level > 1 ? 'demote' : 'kick'}
              </div>
            )}
          </td>
          <td>{level}</td>
          <td>{glossLevel(level)}</td>
        </tr>
      )
    })
    return (
      <table>
        <tr>
          <th>username</th>
          <th>level</th>
          <th>role</th>
        </tr>
        {renderedRows}
      </table>
    )
  }

  signCard(event) {
    event.stopPropagation()
    api.signCard(this.props.taskId)
  }

  unsignCard(event) {
    event.stopPropagation()
    api.signCard(this.props.taskId, 0)
  }

  renderTabButton(tab: BirdTab, label: string) {
    if (this.state.tab === tab) {
      return <p className="action selected">{label}</p>
    } else {
      return (
        <p onClick={this.goToTab} data-page={tab} className="action">
          {label}
        </p>
      )
    }
  }

  render() {
    const currentTab = this.state.tab
    const taskId = this.props.taskId
    const card = aoStore.hashMap.get(taskId)
    if (!card) {
      return null
    }

    const isGrabbed = card.deck.indexOf(aoStore.member.memberId) >= 0
    const isGuild = card.guild && card.guild?.length >= 1
    const signed = this.isSigned
    const isMember = signed && this.guildMemberLevel > 0
    const level = signed ? this.guildMemberLevel : null

    const touchCard = event => {
      event.stopPropagation()
      event.nativeEvent.stopImmediatePropagation()

      if (isGrabbed) {
        api.dropCard(taskId)
      } else {
        api.grabCard(taskId)
      }
    }

    let parentCards = []
    if (!this.props.noPopups) {
      if (
        card &&
        card.hasOwnProperty('parents') &&
        card.parents &&
        card.parents.length >= 1
      ) {
        parentCards = card.parents
          .map(taskId => aoStore.hashMap.get(taskId))
          .filter(task => {
            if (!task || !task.hasOwnProperty('taskId')) {
              return false
            }

            if (task.taskId === task.name) {
              return false
            }
            if (task.taskId === aoStore.currentCard) {
              return false
            }
            return true
          })
        parentCards.reverse()
      }
    }
/*
<div className="bird" onClick={event => event.stopPropagation()}>
            <img src={Bird} />
            {this.memberRequests && this.memberRequests?.length >= 1 && (
              <div className="badge red">{this.memberRequests.length}</div>
            )}
            {this.pendingPasses >= 1 && (
              <div className={'badge subscript'}>{this.pendingPasses}</div>
            )}
          </div>*/
    const connectedAos = aoStore.state.ao.filter(ao => {
            const msSinceLastContact = Date.now() - ao.lastContact
            const msFiveDays = 1000 * 60 * 60 * 24 * 5
            return msSinceLastContact <= msFiveDays
        })
    
    const onChangeAoSelect = (event) => {
      this.setState({selectedServer: event.target.value })
    } 
    
    const renderedAoList = connectedAos && connectedAos.length >= 1 ?
      <select onChange={onChangeAoSelect}>
        <option>{THIS_SERVER}</option>
        {connectedAos.map(ao => {
            return <option>{ao.address}</option>
        })}
      </select> : null
    
    const onChangeText = (event) => {
      this.setState({memberName: event.target.value})
    }
    
    const setIncludeCrawlerCards = (event) => {
      this.setState({includeCrawlerCards: event.target.checked})
    }
    
    const thisServerIsSelected = !this.state.selectedServer || this.state.selectedServer === THIS_SERVER
    const sendLabel = !thisServerIsSelected ? aoStore.currentCard === aoStore.member.memberId ? 'Migrate' : this.state.includeCrawlerCards ? 'Send Cards' : 'Send Card' : 'Give'
    return (
          <React.Fragment>
            <fieldset>
              <legend>{sendLabel}</legend>
              {thisServerIsSelected ? <AoBirdAutocomplete
                  taskId={this.props.taskId}
                  onChange={this.onChange}
                /> :
                <input type='text' onChange={onChangeText} placeholder='type member name exactly' />
              }
              <div className="action inline" onClick={this.passCard}>
                {thisServerIsSelected ? 'Give' : 'Send'}
              </div>
              {(!thisServerIsSelected && aoStore.currentCard !== aoStore.member.memberId) && <div><input type='checkbox' onChange={setIncludeCrawlerCards} checked={this.state.includeCrawlerCards} /> also send all cards within this card</div>}
              {sendLabel === 'Migrate' && <div>Send your entire deck to another server</div>}
              {!!renderedAoList && <div className='normalFlex'><div className='specialAt'>@</div>{renderedAoList}</div>}
              {this.state.error && <div className={this.state.error.includes('Success') ? 'greenText' : 'redText'}>{this.state.error}</div>}
              {this.renderPassList}
            </fieldset>
            <AoHiddenFieldset heading={'Within ' + parentCards?.length || '0'}>
              <React.Fragment>
                {!this.props.noPopups &&
                  parentCards &&
                  parentCards.length >= 1 ? (
                    <React.Fragment>
                      <h3>
                        Within {parentCards.length} other card
                        {parentCards.length >= 2 ? 's' : ''}
                      </h3>
                      <AoStack
                        cards={parentCards}
                        zone="panel"
                        cardStyle="priority"
                        cardsBeforeFold={3}
                        noPopups={true}
                      />
                    </React.Fragment>
                  ) : (
                    'Not within any other cards'
                  )}
              </React.Fragment>
            </AoHiddenFieldset>
            <AoHiddenFieldset heading='Join / Sign'>
              <React.Fragment>
                {level > 0 && (
                  <p>
                    Level {level} {glossLevel(level)}
                  </p>
                )}
                {!signed && (
                  <React.Fragment>
                    {isGuild
                      ? `Click to request ${gloss('guild')} membership.`
                      : 'Click to publicly endorse this card.'}
                    <div className="action" onClick={this.signCard}>
                      sign card
                      {isGuild && (
                        <React.Fragment> &amp; apply to join</React.Fragment>
                      )}
                    </div>
                  </React.Fragment>
                )}
                {isGuild && signed && !isMember && (
                  <React.Fragment>
                    {!isMember
                      ? 'Click to cancel your membership request.'
                      : `Click to leave this ${gloss('guild')}.`}
                    <div className="action" onClick={this.unsignCard}>
                      unsign {gloss('card')}
                      {!isMember && (
                        <React.Fragment> &amp; cancel join</React.Fragment>
                      )}
                    </div>
                  </React.Fragment>
                )}
                {(isMember || (signed && !isGuild)) && (
                  <React.Fragment>
                    {isGuild
                      ? `Click to leave this ${gloss('guild')}.`
                      : `Click to unsign this ${gloss('card')}.`}
                    <div className="action" onClick={this.unsignCard}>
                      unsign {gloss('card')}{(card.guild && card.guild.length >= 1 ? '&amp; leave ' + gloss('guild') : '')}
                    </div>
                  </React.Fragment>
                )}
                {this.memberRequests?.length >= 1 && (
                  <p>
                    {this.memberRequests.length} member request
                    {this.memberRequests.length > 1 ? 's ' : ' '}
                    waiting
                  </p>
                )}
                {isGuild && isMember && this.memberRequests?.length >= 1 && (
                  <React.Fragment>
                    <h4>Applicants</h4>
                    {this.renderedApplicantsList}
                  </React.Fragment>
                )}
                {isGuild && isMember && this.memberships?.length >= 1 && (
                  <React.Fragment>
                    <h4>Members</h4>
                    {this.renderedMembers}
                  </React.Fragment>
                )}
              </React.Fragment>
            </AoHiddenFieldset>
          </React.Fragment>
    )
  }
}
