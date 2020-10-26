import React from 'react'
import { computed } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import AoCardHud, { HudStyle } from './cardHud'
import LazyTippy from './lazyTippy'
import { isSenpai } from '../cards'
import Bark from '../assets/images/loud.svg'
import Gun from '../assets/images/goodbye.svg'
import Ascend from '../assets/images/ascend.svg'
import GoldenDoge from '../assets/images/goldendoge.svg'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'
import { formatDistanceToNow, format } from 'date-fns'
import AoMemberIcon from './memberIcon'

interface CardMenuProps {
  memberId: string
  noPopups?: boolean
}

@observer
export default class AoBarkMenu extends React.PureComponent<CardMenuProps> {
  constructor(props) {
    super(props)
    this.promoteMember = this.promoteMember.bind(this)
    this.banMember = this.banMember.bind(this)
    this.unbanMember = this.unbanMember.bind(this)
    this.purgeMember = this.purgeMember.bind(this)
    this.activateMember = this.activateMember.bind(this)
    this.deactivateMember = this.deactivateMember.bind(this)
  }

  activateMember() {
    api.activateMember(this.props.memberId)
  }

  deactivateMember() {
    api.deactivateMember(this.props.memberId)
  }

  promoteMember() {
    if (
      !window.confirm(
        'Are you sure you want to promote this member ahead of you in the list of members?\n\nThis may give this user the ability to ban or delete your account. By default, the order of members is their creation order. If you promote this member, they will step ahead of you in line, becoming your superior. This action cannot be undone.'
      )
    ) {
      return
    }
    api.promoteMember(this.props.memberId)
  }

  banMember() {
    if (this.banCount < 3) {
      let actionText = [
        'propose a ban',
        'second this ban',
        'execute this ban right now'
      ]
      let confirmMessage =
        'Are you sure you want to ' +
        actionText[this.banCount] +
        "?\n\nIf banned, the member's account will deactivate, and the member will be unable to use their fob or activate resources such as the door or soda machine. They will be effectively locked-out until the ban is lifted (when ban votes go below 3 again)."

      if (!window.confirm(confirmMessage)) {
        return
      }
    }
    api.banMember(this.props.memberId)
  }

  unbanMember() {
    if (this.banCount === 3) {
      if (
        !window.confirm(
          'Are you sure you want to unban this member?\n\nPlease consider carefully before allowing a potentially dangerous or toxic person back into the community.'
        )
      ) {
        return
      }
    }
    api.unbanMember(this.props.memberId)
  }

  purgeMember() {
    if (
      window.confirm(
        'Are you sure you want to delete this member? This action cannot be undone.'
      )
    ) {
      console.log('member delete attempted')
    }
  }

  @computed get banCount() {
    const member = aoStore.memberById.get(this.props.memberId)
    if (!member || !member.hasOwnProperty('potentials')) {
      return 0
    }
    return member.potentials.filter(pot => pot.opinion === 'member-banned')
      .length
  }

  @computed get doIBan() {
    const member = aoStore.memberById.get(this.props.memberId)
    if (!member || !member.hasOwnProperty('potentials')) {
      return null
    }
    return member.potentials.some(
      pot =>
        pot.opinion === 'member-banned' &&
        pot.memberId === aoStore.member.memberId
    )
  }

  @computed get senpai() {
    const senpai = isSenpai(this.props.memberId)
    switch (senpai) {
      case 1:
        return 'senpai'
      case -1:
        return 'kohai'
      case 0:
        return false
    }
  }

  @computed get message() {
    if (this.senpai === 'senpai') {
      return 'This member is your senpai. Respect them, for they can ban you.'
    } else if (this.senpai === 'kohai') {
      return 'This member is your kohai and a target for enforcement action.'
    }
    return 'Dominance cannot be established.'
  }

  @computed get renderBanList() {
    const member = aoStore.memberById.get(this.props.memberId)
    if (!member) {
      return null
    }

    const renderedBans = member.potentials
      .filter(pot => pot.opinion === 'member-banned')
      .map(pot => {
        const senpaiId = pot.memberId
        const senpai = aoStore.memberById.get(pot.memberId)
        const senpaiName = senpai ? senpai.name : 'deleted member'
        const distanceToNow = formatDistanceToNow(pot.timestamp, {
          addSuffix: true
        })

        return (
          <li key={senpaiId}>
            <AoMemberIcon memberId={senpaiId} /> {senpaiName} voted to ban{' '}
            {distanceToNow}
          </li>
        )
      })

    return <ul>{renderedBans}</ul>
  }

  @computed get renderBarkMenu() {
    const member = aoStore.memberById.get(this.props.memberId)
    if (!member) {
      return null
    }
    const isActive = member.active >= 1

    let membershipActivator: JSX.Element

    if (isActive) {
      membershipActivator = (
        <p>
          <small>Membership is active.</small>
        </p>
      )
    } else if (member.banned) {
      membershipActivator = (
        <p>
          <small>Member is banned and cannot be reactivated.</small>
        </p>
      )
    } else if (aoStore.member.active >= 1) {
      membershipActivator = (
        <div className="action" onClick={this.activateMember}>
          <img src={GoldenDoge} className="membership inactive" />
          Reactivate Membership
        </div>
      )
    } else {
      membershipActivator = (
        <p>
          <small>
            Your memberhsip is inactive, so you cannot activate this member's
            account.
          </small>
        </p>
      )
    }

    let banLabel = ''
    if (this.doIBan) {
      switch (this.banCount) {
        case 3:
          banLabel = 'Unban'
          break
        default:
          banLabel = 'Remove Ban Vote'
      }
    } else {
      switch (this.banCount) {
        case 0:
          banLabel = 'Propose Ban'
          break
        case 1:
          banLabel = 'Second Ban'
          break
        case 2:
          banLabel = 'Execute Ban'
          break
        default:
          banLabel = 'Increase Ban Vote'
      }
    }
    return (
      <React.Fragment>
        <div>{this.message}</div>
        {!!this.senpai ? (
          <div className="menu">
            <div className="action" onClick={this.promoteMember}>
              <img src={Ascend} className="ascend" />
              Promote Above
            </div>
            <div
              className="action"
              onClick={this.doIBan ? this.unbanMember : this.banMember}>
              {banLabel} ({this.banCount}/3)
            </div>
            {this.banCount >= 1 && this.renderBanList}
            <div className="action" onClick={this.purgeMember}>
              <img src={Gun} />
              Delete Account
            </div>
            {membershipActivator}
          </div>
        ) : (
          ''
        )}
      </React.Fragment>
    )
  }

  @computed
  get renderMenuButton() {
    return (
      <Tippy
        zIndex={4}
        theme={'translucent'}
        content={this.message}
        hideOnClick={false}>
        <img
          src={Bark}
          className={
            'barkButton' +
            (this.senpai ? ' ' + this.senpai : '') +
            (this.props.noPopups ? ' noPopups' : '')
          }
          draggable={false}
          onDoubleClick={event => {
            event.stopPropagation()
            event.nativeEvent.stopImmediatePropagation()
          }}
        />
      </Tippy>
    )
  }

  render() {
    if (!this.senpai) {
      return ''
    }

    if (this.props.noPopups || this.senpai === 'senpai') {
      return this.renderMenuButton
    }

    return (
      <LazyTippy
        zIndex={5}
        content={this.renderBarkMenu}
        interactive={true}
        trigger={'click'}
        placement={'top-end'}
        appendTo={document.getElementById('root')}>
        {this.renderMenuButton}
      </LazyTippy>
    )
  }
}
