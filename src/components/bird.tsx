import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import AoBirdAutocomplete from './birdAutocomplete'
import Bird from '../assets/images/send.svg'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'
import LazyTippy from './lazyTippy'
import AoMemberIcon from './memberIcon'

type BirdTab = 'send' | 'link' | 'sign'

interface Props {
  taskId: string
}

interface State {
  memberId?: string
  tab: BirdTab
}

@observer
export default class AoBird extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props)
    makeObservable(this)
    this.state = { tab: 'send' }
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
    console.log('passCard!')
    if (this.state.memberId !== undefined) {
      api.passCard(this.props.taskId, this.state.memberId)
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
      const fromMember = aoStore.memberById.get(fromId)
      const fromName = fromMember ? fromMember.name : 'deleted member'
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
      <div className="infoTooltip">
        {this.memberRequests?.length > 0 && (
          <p>
            {this.memberRequests.length} member request
            {this.memberRequests.length > 1 ? 's ' : ' '}
            waiting
          </p>
        )}
        {renderedPasses.length > 0 && <h4>Pending Passes</h4>}
        {renderedPasses}
        <p>Click to give card</p>
      </div>
    )
  }

  goToTab(event) {
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
              !card.memberships.some(memb => memb.memberId === memberId)))
      )
      .map(([memberId, opinion]) => memberId)

    return memberIdsRequestingEntry
  }

  signCard() {
    api.signCard(this.props.taskId)
  }

  unsignCard() {
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
    const isGuild = card.guild && card.guild?.length >= 1
    const signed = this.isSigned
    const isMember = signed && this.guildMemberLevel > 0
    const level = signed ? this.guildMemberLevel : null

    const renderedApplicantsList = (
      <ul>
        {this.memberRequests?.map(mId => {
          const name = aoStore.memberById.get(mId)?.name
          return (
            <li key={mId}>
              <AoMemberIcon memberId={mId} />
              {name}
            </li>
          )
        })}
      </ul>
    )

    return (
      <LazyTippy
        zIndex={4}
        trigger="click"
        onShown={this.focus}
        hideOnClick="toggle"
        theme="translucent"
        content={
          <React.Fragment>
            <div className="toolbar">
              {this.renderTabButton('send', 'Send')}
              {isGuild &&
                this.renderTabButton('sign', isGuild ? 'Join' : 'Sign')}
              {/*{this.renderTabButton('link', 'Link')}*/}
            </div>
            {currentTab === 'send' && (
              <React.Fragment>
                <AoBirdAutocomplete
                  taskId={this.props.taskId}
                  onChange={this.onChange}
                />
                <div className="action inline" onClick={this.passCard}>
                  give
                </div>
              </React.Fragment>
            )}
            {currentTab === 'sign' && (
              <React.Fragment>
                {level > 0 && <p>Level {level} Student</p>}
                {!signed && (
                  <React.Fragment>
                    {isGuild
                      ? 'Click to request group membership.'
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
                      : 'Click to leave this squad.'}
                    <div className="action" onClick={this.unsignCard}>
                      unsign card
                      {!isMember && (
                        <React.Fragment> &amp; cancel join</React.Fragment>
                      )}
                    </div>
                  </React.Fragment>
                )}
                {!isGuild && !signed && (
                  <React.Fragment>
                    Click to sign this card.
                    <div className="action" onClick={this.signCard}>
                      sign card
                      {isGuild && (
                        <React.Fragment> &amp; apply to join</React.Fragment>
                      )}
                    </div>
                  </React.Fragment>
                )}
                {(isMember || (signed && !isGuild)) && (
                  <React.Fragment>
                    {isGuild
                      ? 'Click to leave this squad.'
                      : 'Click to unsign this card.'}
                    <div className="action" onClick={this.unsignCard}>
                      unsign card &amp; leave squad
                    </div>
                  </React.Fragment>
                )}
                {isGuild && isMember && this.memberRequests?.length >= 1 && (
                  <React.Fragment>
                    <h4>Applicants</h4>
                    {renderedApplicantsList}
                  </React.Fragment>
                )}
              </React.Fragment>
            )}
          </React.Fragment>
        }
        placement="right-start"
        interactive={true}>
        <Tippy
          zIndex={4}
          theme="translucent"
          content={this.renderPassList}
          delay={[625, 200]}
          placement="right-start">
          <div className="bird">
            <img src={Bird} />
            {this.memberRequests && this.memberRequests?.length >= 1 && (
              <div className="badge red">{this.memberRequests.length}</div>
            )}
            {this.pendingPasses >= 1 && (
              <div className={'badge subscript'}>{this.pendingPasses}</div>
            )}
          </div>
        </Tippy>
      </LazyTippy>
    )
  }
}
