import * as React from 'react'
import { computed, makeObservable } from 'mobx';
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'

@observer
export default class AoReserve extends React.PureComponent<{}> {
  constructor(props) {
    super(props)
    makeObservable(this);
    this.state = {}
  }

  @computed get confirmedBalance() {
    let confirmedBalance = 0
    aoStore.state.cash.outputs.forEach(o => {
      confirmedBalance += o.value
    })
    return confirmedBalance
  }

  @computed get totalLocal() {
    let totalLocal = 0
    aoStore.state.cash.channels.forEach(c => {
      totalLocal += c.channel_sat
    })
    return totalLocal
  }

  @computed get totalWallet() {
    return this.totalLocal + this.confirmedBalance
  }

  @computed get reserveData() {
    let members = []
    let guilds = []
    let resources = []
    let cards = []

    aoStore.state.tasks.forEach(t => {
      if (t.boost > 0) {
        if (aoStore.state.members.some(m => m.memberId === t.taskId)) {
          members.push(t)
        } else if (
          aoStore.state.resources.some(r => r.resourceId === t.taskId)
        ) {
          resources.push(t)
        } else if (t.guild) {
          guilds.push(t)
        } else {
          cards.push(t)
        }
      }
    })

    members.sort((a, b) => parseInt(b.boost) - parseInt(a.boost))
    guilds.sort((a, b) => parseInt(b.boost) - parseInt(a.boost))
    resources.sort((a, b) => parseInt(b.boost) - parseInt(a.boost))
    cards.sort((a, b) => parseInt(b.boost) - parseInt(a.boost))

    let totalMembers = 0
    let totalGuilds = 0
    let totalCards = 0
    let totalResources = 0
    members.forEach(t => {
      totalMembers += parseFloat(t.boost)
    })
    guilds.forEach(t => {
      totalGuilds += parseFloat(t.boost)
    })
    resources.forEach(t => {
      totalResources += parseFloat(t.boost)
    })
    cards.forEach(t => {
      totalCards += parseFloat(t.boost)
    })
    let totalPointsSum =
      totalMembers + totalGuilds + totalResources + totalCards
    let satPoint = this.totalWallet / totalPointsSum
    return {
      totalPointsSum,
      satPoint,
      totalMembers,
      totalGuilds,
      totalResources,
      totalCards,
      members,
      guilds,
      cards,
      resources
    }
  }

  render() {
    const monthlyCost = aoStore.state.cash.rent
    const monthlyCap = aoStore.state.cash.cap
    const {
      totalPointsSum,
      satPoint,
      totalMembers,
      totalGuilds,
      totalResources,
      totalCards,
      members,
      guilds,
      cards,
      resources
    } = this.reserveData

    return (
      <React.Fragment>
        <h3>Reserve</h3>
        <p>Control creation of points on this server</p>
        <p>
          {totalPointsSum.toFixed(0)} total points {satPoint.toFixed(0)}{' '}
          &#12471;
        </p>
        <p>{totalMembers.toFixed(0)} in accounts [list]</p>
        <p>{totalResources.toFixed(0)} in resources [list]</p>
        <p>{totalGuilds.toFixed(0)} on missions [list]</p>
        <p>{totalCards.toFixed(0)} on cards [list]</p>
      </React.Fragment>
    )
  }
}
