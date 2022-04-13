import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import AoTip from './tip'
import AoHiddenFieldset from './hiddenFieldset'
import AoQuorum from './quorum'
import { getSemantics, gloss } from '../semantics'

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

  @computed get renderedGlossary() {
    const { glossary, levels } = getSemantics()
    const renamedLevels = Object.entries(levels).map(([level, word]) => [
      'Level ' + level,
      word,
    ])
    const combinedGlossary = [
      ...Object.entries(glossary),
      ...renamedLevels,
    ].sort((a, b) => {
      return a[0].localeCompare(b[0], undefined, {
        sensitivity: 'base',
      })
    })
    const renderedGlossary = combinedGlossary.map(([keyword, gloss]) => (
      <tr>
        <td>{keyword}</td>
        <td>{gloss}</td>
      </tr>
    ))

    return (
      <table>
        <tr>
          <th>Word</th>
          <th>Gloss</th>
        </tr>
        {renderedGlossary}
      </table>
    )
  }

  render() {
    const monthlyCost = aoStore.state.cash.rent
    const monthlyCap = aoStore.state.cash.cap

    return (
      <React.Fragment>
        <AoHiddenFieldset heading='Rent Split' startOpen={true}>
          <p>Each month the node cost is split between accounts.</p>
          <p>Monthly cost: {monthlyCost}</p>
          <p>Monthly cap: {monthlyCap} max</p>
          <p>Active members: {this.activeMembers}</p>
          {this.activeMembers >= 1 ? (
            <p>= {this.perMember} each</p>
          ) : (
            <p>No active members to charge a monthly membership fee.</p>
          )}
          {this.renderPendingDeactivation()}
        </AoHiddenFieldset>
        <AoHiddenFieldset heading='Server Glossary' startOpen={true}>
          {this.renderedGlossary}
        </AoHiddenFieldset>
      </React.Fragment>
    )
  }
}
