import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'

@observer
export default class AoFob extends React.PureComponent {
  constructor(props) {
    super(props)
    makeObservable(this)
    this.activateMe = this.activateMe.bind(this)
  }

  activateMe() {
    api.activateMember(aoStore.member.memberId)
  }

  @computed get isActive() {
    return aoStore.member.active >= 1
  }

  @computed get isFirstMemberOnServer() {
    return aoStore.state.members[0] === aoStore.member
  }

  render() {
    if (this.isActive || !this.isFirstMemberOnServer) {
      return null
    }
    return (
      <div className="activate menu">
        <div onClick={this.activateMe} className="action">
          Reactivate Membership
        </div>
      </div>
    )
  }
}
