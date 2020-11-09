import React from 'react'
import { observable, computed } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import AoStack from './stack'
import AoScore from './score'
import AoCheckmark from './checkmark'
import LoggedIn from '../assets/images/loggedIn.svg'
import LoggedOut from '../assets/images/loggedOut.svg'
import GoldenDoge from '../assets/images/goldendoge.svg'
import Coin from '../assets/images/coin.svg'
import LazyTippy from './lazyTippy'
import 'tippy.js/dist/tippy.css'
import { isSenpaiOf } from '../members'
import AoBark from './bark'

interface MemberIconProps {
  memberId: string
  noPopups?: boolean
}

@observer
export default class AoMemberIcon extends React.PureComponent<MemberIconProps> {
  constructor(props) {
    super(props)
  }

  @computed get isActive() {
    const member = aoStore.memberById.get(this.props.memberId)
    if (!member) {
      return false
    }
    return member.active >= 1
  }

  @computed get isLoggedIn() {
    return aoStore.state.sessions.some(s => s.ownerId === this.props.memberId)
  }

  @computed get deckSize() {
    return aoStore.state.tasks.filter(t => {
      return t.deck.indexOf(this.props.memberId) >= 0
    }).length
  }

  @computed get renderLoggedInStatusIcon() {
    return (
      <img
        src={this.isLoggedIn ? LoggedIn : LoggedOut}
        className="memberIcon"
        draggable={false}
      />
    )
  }

  @computed get renderMemberInfo() {
    const memberId = this.props.memberId
    const member = aoStore.memberById.get(memberId)
    const card = aoStore.hashMap.get(memberId)
    if (!card) return null

    const renderActiveIcon = (
      <img
        src={GoldenDoge}
        className={'membership ' + (this.isActive ? 'active' : 'inactive')}
        draggable={false}
      />
    )

    return (
      <div className="memberInfo">
        <p>
          {member.name} is{' '}
          <span style={{ marginRight: '0.5em' }}>
            {this.renderLoggedInStatusIcon}
          </span>
          {this.isLoggedIn ? 'online' : 'offline'}
        </p>
        <p>
          Membership: {renderActiveIcon}
          {this.isActive ? 'Active' : 'Inactive'}
        </p>
        {isSenpaiOf(
          aoStore.member.memberId,
          this.props.memberId,
          aoStore.state
        ) === 1 ? (
          <p>
            <small>
              <AoBark memberId={this.props.memberId} noPopups={true} /> You may{' '}
              {this.isActive ? 'deactivate' : 'reactivate'} their membership in
              the Members list.
            </small>
          </p>
        ) : (
          ''
        )}
        {this.deckSize >= 1 && (
          <p>
            <small>
              <img src={Coin} draggable={false} className="inlineIcon" />
              {this.deckSize} card{this.deckSize >= 2 && 's'}
            </small>
          </p>
        )}
        <AoScore
          memberId={this.props.memberId}
          prefix={
            <small>
              <span className="inlineIcon">
                <AoCheckmark />
              </span>
              Points:{' '}
            </small>
          }
        />
      </div>
    )
  }

  render() {
    const memberId = this.props.memberId
    const member = aoStore.memberById.get(memberId)
    const card = aoStore.hashMap.get(memberId)
    if (!card) return null

    return (
      <React.Fragment>
        {!this.props.noPopups ? (
          <LazyTippy
            zIndex={5}
            interactive={true}
            content={this.renderMemberInfo}
            hideOnClick={false}
            delay={[625, 200]}
            appendTo={() =>
              document.getElementById('card-' + memberId).parentElement
            }>
            {this.renderLoggedInStatusIcon}
          </LazyTippy>
        ) : (
          this.renderLoggedInStatusIcon
        )}
      </React.Fragment>
    )
  }
}
