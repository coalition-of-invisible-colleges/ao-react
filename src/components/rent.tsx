import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api.js'
import AoTip from './tip'
import AoQuorum from './quorum'

@observer
export default class AoRent extends React.PureComponent<{}> {
  constructor(props) {
    super(props)
    makeObservable(this)
    this.state = {}
    this.renderPendingDeactivation = this.renderPendingDeactivation.bind(this)
  }

  @computed get activeMembers() {
    let a = 0
    aoStore.state.members.forEach(m => {
      if (m.active > 0) {
        a++
      }
    })
    return a
  }

  @computed get perMember() {
    return aoStore.state.cash.rent / this.activeMembers
  }

  @computed get pendingDeactivations() {
    return aoStore.state.members
      .filter(m => {
        const member = aoStore.hashMap.get(m.memberId)

        if (!member || !member.hasOwnProperty('boost')) {
          return false
        }
        return m.active > 0 && member.boost <= 0
      })
      .map(m => m.memberId)
  }

  renderPendingDeactivation() {
    if (this.pendingDeactivations.length <= 0 || aoStore.state.cash.rent <= 0) {
      return <p>No users are pending deactivation</p>
    }

    const renderedDeactivations = this.pendingDeactivations.map(mId => (
      <li>{mId}</li>
    )) // should be name

    return (
      <React.Fragment>
        <h4>Pending Deactivation:</h4>
        <ul>{renderedDeactivations}</ul>
      </React.Fragment>
    )
  }

  render() {
    const monthlyCost = aoStore.state.cash.rent
    const monthlyCap = aoStore.state.cash.cap

    return (
      <React.Fragment>
        <h3>
          Rent Split{' '}
          <AoTip text="Each month the node cost is split between accounts." />
        </h3>
        <p>Monthly cost: {monthlyCost} [set]</p>
        <p>Monthly cap: {monthlyCap} max [set]</p>
        <p>Active members: {this.activeMembers}</p>
        {this.activeMembers >= 1 ? (
          <p>= {this.perMember} each</p>
        ) : (
          'No active members to charge a monthly membership fee.'
        )}
        {this.renderPendingDeactivation()}
        <div>
          Quorum{' '}
          <AoTip text="Number of signatures required to pass a proposal. Passed proposals appear in the Passed Proposals section of each squad. Anyone can change this setting at any time to change how proposals are displayed in squads." />
          : <AoQuorum />
        </div>
      </React.Fragment>
    )
  }
}
