import React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import LazyTippy from './lazyTippy'
import { isSenpaiOf, isAheadOf, isDecidedlyMorePopularThan } from '../members'
import Bark from '../assets/images/loud.svg'
import Gun from '../assets/images/goodbye.svg'
import Ascend from '../assets/images/ascend.svg'
import GoldenDoge from '../assets/images/goldendoge.svg'
import Banhammer from '../assets/images/banhammer.svg'
import ResetPassword from '../assets/images/resetPassword.svg'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'
import { formatDistanceToNow, format } from 'date-fns'
import AoMemberIcon from './memberIcon'
//import { POTENTIALS_TO_EXECUTE as VOTES_TO_EXECUTE } from '../mutations'

interface CardMenuProps {
  memberId: string
  noPopups?: boolean
}

@observer
export default class AoBarkMenu extends React.PureComponent<CardMenuProps> {
  constructor(props) {
    super(props)
    makeObservable(this)
    this.activateMember = this.activateMember.bind(this)
    this.deactivateMember = this.deactivateMember.bind(this)
    this.resetPassword = this.resetPassword.bind(this)
    this.promoteMember = this.promoteMember.bind(this)
    this.banMember = this.banMember.bind(this)
    this.unbanMember = this.unbanMember.bind(this)
    this.purgeMember = this.purgeMember.bind(this)
  }

  activateMember() {
    api.activateMember(this.props.memberId)
  }

  deactivateMember() {
    api.deactivateMember(this.props.memberId)
  }

  resetPassword() {
    if (
      window.confirm(
        "Are you sure you want to reset this member's password?\n\nTheir password will be reset to the same as their current username. This means the account is p0wned and completely unsecured until someone logs in and changes the password to a new secure password. Please inform the member that their password has changed and remind them to set a new secure password."
      )
    ) {
      api.resetPassword(this.props.memberId)
    }
  }

  promoteMember() {
    if (
      window.confirm(
        'Are you sure you want to promote this member ahead of you in the list of members?\n\nThis may give this user the ability to ban or delete your account. By default, the order of members is their creation order. If you promote this member, they will step ahead of you in line, becoming your superior. The current order may be viewed in the Members panel under "Order"'
      )
    ) {
      api.promoteMember(this.props.memberId)
    }
  }

  banMember() {
    if (
      window.confirm(
        "Are you sure you want to ban this member?\n\nIf banned, the member's account will deactivate, and the member will be unable to use their fob or activate resources such as the door or soda machine. They will be effectively locked-out until the ban is lifted (when ban votes go below 3 again)."
      )
    ) {
      api.banMember(this.props.memberId)
    }
  }

  unbanMember() {
    if (
      window.confirm(
        'Are you sure you want to unban this member?\n\nPlease consider carefully before allowing a potentially dangerous or toxic person back into the community.'
      )
    ) {
      api.unbanMember(this.props.memberId)
    }
  }

  purgeMember() {
    if (
      window.confirm(
        "Are you sure you want to delete this member's account and member card right now?\n\nThis will delete the member and their member card, and erase their hodls. This action cannot be undone."
      )
    ) {
      api.purgeMember(this.props.memberId)
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

  @computed get resetCount() {
    const member = aoStore.memberById.get(this.props.memberId)
    if (!member || !member.hasOwnProperty('potentials')) {
      return 0
    }
    return member.potentials.filter(
      pot => pot.opinion === 'member-secret-reset'
    ).length
  }

  // cached version of the function in members.js
  @computed get senpai() {
    const rank = this.isAheadOf
    if (rank === 0) {
      return 'peer'
    } else if (rank === 1) {
      const vouches = isDecidedlyMorePopularThan(
        this.props.memberId,
        aoStore.member.memberId,
        aoStore.state
      )
      if (vouches === 1) {
        return 'senpai'
      } else {
        return 'peer'
      }
    } else {
      const vouches = isDecidedlyMorePopularThan(
        aoStore.member.memberId,
        this.props.memberId,
        aoStore.state
      )
      if (vouches === 1) {
        return 'kohai'
      } else {
        return 'peer'
      }
    }
  }

  canPromote() {
    return this.isAheadOf === -1
  }

  @computed get isAheadOf() {
    return isAheadOf(
      this.props.memberId,
      aoStore.member.memberId,
      aoStore.state
    )
  }

  @computed get message() {
    if (this.senpai === 'senpai') {
      return (
        <React.Fragment>
          <div>
            This member is your senpai because they both have more vouches than
            you, and they are first in the members list.
          </div>
          <div>
            Senpai can use the following powers on you if 3 of them agree:
          </div>
          <ul>
            <li>Promote you above them in the members list</li>
            <li>Reset your password</li>
            <li>Ban you, locking your fob</li>
            <li>Delete your account</li>
          </ul>
          <div>Respect your senpai, for they can ban you!</div>
        </React.Fragment>
      )
    } else if (this.senpai === 'kohai') {
      return 'This member is your kohai and a target for enforcement action.'
    }
    return 'Promote above'
  }

  renderBanList() {
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
          addSuffix: true,
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

  // todo: move this to a more global location and make it a global admin feed
  // renderDeleteList() {
  //   const member = aoStore.memberById.get(this.props.memberId)
  //   if (!member) {
  //     return null
  //   }

  //   const renderedDeletes = member.potentials
  //     .filter(pot => pot.opinion === 'member-purged')
  //     .map(pot => {
  //       const senpaiId = pot.memberId
  //       const senpai = aoStore.memberById.get(pot.memberId)
  //       const senpaiName = senpai ? senpai.name : 'deleted member'
  //       const distanceToNow = formatDistanceToNow(pot.timestamp, {
  //         addSuffix: true
  //       })

  //       return (
  //         <li key={senpaiId}>
  //           <AoMemberIcon memberId={senpaiId} /> {senpaiName} voted to delete
  //           account {distanceToNow}
  //         </li>
  //       )
  //     })

  //   return <ul>{renderedDeletes}</ul>
  // }

  renderBarkMenu() {
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

    return (
      <div className="paddedPopup">
        <div>{this.message}</div>
        {!!this.senpai && (
          <div className="menu">
            <div className="action" onClick={this.promoteMember}>
              <img src={Ascend} className="ascend" />
              Promote Above
            </div>
            <div
              className="action"
              onClick={member.banned ? this.unbanMember : this.banMember}>
              <img src={Banhammer} />
              Ban Member
            </div>
            {this.banCount >= 1 && this.renderBanList()}
            <div className="action" onClick={this.resetPassword}>
              <img src={ResetPassword} className="reset" />
              Reset Password
            </div>
            {(member.p0wned || !member.hasOwnProperty('p0wned')) && (
              <p className="warning">
                <small>
                  {member.p0wned
                    ? "This member's password has not been changed from the default."
                    : "This member's password is stale and should be changed."}
                </small>
              </p>
            )}
            <div className="action" onClick={this.purgeMember}>
              <img src={Gun} className="icon" />
              Delete Account
            </div>
            {membershipActivator}
          </div>
        )}
      </div>
    )
  }

  renderMenuButton() {
    const member = aoStore.memberById.get(this.props.memberId)
    if (!member) {
      return null
    }

    return (
      <Tippy
        zIndex={4}
        theme="translucent"
        content={this.message}
        hideOnClick={false}>
        <img
          src={Bark}
          className={
            'barkButton ' +
            this.senpai +
            (member.p0wned || !member.hasOwnProperty('p0wned')
              ? ' p0wned '
              : '') +
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

  renderPromoteButton() {
    return (
      <Tippy
        zIndex={4}
        theme="translucent"
        content={this.message}
        hideOnClick={false}>
        <img
          src={Ascend}
          className={'barkButton' + (this.props.noPopups ? ' noPopups' : '')}
          draggable={false}
          onClick={this.promoteMember}
          onDoubleClick={event => {
            event.stopPropagation()
            event.nativeEvent.stopImmediatePropagation()
          }}
        />
      </Tippy>
    )
  }

  render() {
    if (this.props.noPopups || this.senpai === 'senpai') {
      return this.renderMenuButton()
    }

    if (this.senpai === 'kohai') {
      return (
        <LazyTippy
          zIndex={5}
          content={this.renderBarkMenu()}
          interactive={true}
          theme="translucent"
          trigger="click"
          placement="top-end"
          appendTo={document.getElementById('root')}>
          {this.renderMenuButton()}
        </LazyTippy>
      )
    }

    if (this.senpai === 'peer' && this.canPromote()) {
      return this.renderPromoteButton()
    }

    return ''
  }
}
