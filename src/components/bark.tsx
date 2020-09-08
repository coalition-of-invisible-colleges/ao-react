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
import GoldenDoge from '../assets/images/goldendoge.svg'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'

interface CardMenuProps {
  memberId: string
  noPopups?: boolean
}

@observer
export default class AoBarkMenu extends React.PureComponent<CardMenuProps> {
  constructor(props) {
    super(props)
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

  purgeMember() {
    if (
      window.confirm(
        'Are you sure you want to delete this member? This action cannot be undone.'
      )
    ) {
      console.log('member delete attempted')
    }
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

  @computed get renderBarkMenu() {
    const member = aoStore.memberById.get(this.props.memberId)
    if (!member) {
      return null
    }
    const isActive = member.active >= 1

    let membershipActivator: JSX.Element

    if (isActive) {
      membershipActivator = (
        <div className="action" onClick={this.deactivateMember}>
          <img src={GoldenDoge} className="membership" />
          Deactivate Membership
        </div>
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
      <React.Fragment>
        <div>{this.message}</div>
        {!!this.senpai ? (
          <div className="menu">
            <div className="action">Propose Ban</div>
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
