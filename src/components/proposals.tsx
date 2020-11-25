import * as React from 'react'
import { computed } from 'mobx'
import { observer } from 'mobx-react'
import aoStore, { Task, Signature } from '../client/store'
import AoStack from './stack'
import { mostRecentSignaturesOnly, countCurrentSignatures } from '../cards'
import AoPopupPanel from './popupPanel'
import AoTip from './tip'
import AoQuorum from './quorum'
import Scroll from '../assets/images/scroll.svg'

@observer
export default class AoProposals extends React.Component {
  constructor(props) {
    super(props)
  }

  @computed get everSigned() {
    return aoStore.state.tasks
      .filter(task => {
        return (
          task.hasOwnProperty('signed') &&
          task.signed.some(signature => signature.opinion >= 1)
        )
      })
      .sort(
        (a, b) =>
          countCurrentSignatures(a.signed) - countCurrentSignatures(b.signed)
      )
  }

  @computed get proposals() {
    return this.everSigned.filter(task => {
      return mostRecentSignaturesOnly(task.signed).some(
        signature => signature.opinion >= 1
      )
    })
  }

  @computed get toSign() {
    return this.proposals.filter(task => {
      return task.signed.every(
        signature => signature.memberId !== aoStore.member.memberId
      )
    })
  }

  @computed get signed() {
    return this.proposals.filter(task => {
      return !this.toSign.some(t => t.taskId === task.taskId)
    })
  }

  @computed get passed() {
    return this.proposals.filter(task => {
      let ayes = 0
      mostRecentSignaturesOnly(task.signed).forEach(signature => {
        if (signature.opinion >= 1) {
          ayes++
        }
      })
      return ayes >= aoStore.state.cash.quorum
    })
  }

  @computed get rejected() {
    return this.proposals.filter(task => {
      return !this.passed.some(t => t.taskId === task.taskId)
    })
  }

  @computed get previouslySigned() {
    console.log(
      'previouslySigned. this.everSigned.length is ',
      this.everSigned.length,
      ' and this.proposals.length is ',
      this.proposals.length
    )
    return this.everSigned.filter(task => {
      return this.proposals.every(t => t.taskId !== task.taskId)
    })
  }

  @computed get renderProposalsList() {
    return (
      <div className="results">
        {this.toSign.length >= 1 ? <h2>To Sign</h2> : ''}
        <AoStack
          cards={this.toSign}
          descriptor={{
            singular: 'More to Sign',
            plural: 'More to Sign'
          }}
          cardStyle="face"
        />
        <div className={'tail'}>
          <AoStack
            cards={this.passed}
            cardStyle="face"
            alwaysShowAll={false}
            descriptor={{
              singular: 'Passed Proposal',
              plural: 'Passed Proposals'
            }}
            noFirstCard={true}
          />
          <AoStack
            cards={this.rejected}
            cardStyle="face"
            alwaysShowAll={false}
            descriptor={{
              singular: 'Unpassed Proposal',
              plural: 'Unpassed Proposals'
            }}
            noFirstCard={true}
          />

          <AoStack
            cards={this.previouslySigned}
            cardStyle="face"
            alwaysShowAll={false}
            descriptor={{
              singular: 'Previously Signed',
              plural: 'Previously Signed'
            }}
            noFirstCard={true}
          />
        </div>
      </div>
    )
  }

  render() {
    if (this.proposals.length < 1) {
      return null
    }
    const renderedBadge =
      this.toSign.length >= 1 ? (
        <React.Fragment>{this.toSign.length}</React.Fragment>
      ) : null

    return (
      <div id="proposals">
        <AoPopupPanel
          iconSrc={Scroll}
          tooltipText="Proposals"
          badge={renderedBadge}
          tooltipPlacement="right"
          panelPlacement="right"
          id="tour-proposals">
          <React.Fragment>
            <h2>Proposals</h2>
            <div
              style={{
                textAlign: 'center',
                position: 'relative',
                top: '-0.5em'
              }}>
              <small>
                {this.toSign.length >= 1
                  ? 'The community awaits your decision.'
                  : 'You have no proposals to sign.'}{' '}
                <AoTip text="Any card signed by at least one member is called a 'proposal' and listed here. To sign a card, hover over its moon and click 'sign'. This is the official pinned bulletin for this server, for posting proposals, propositions, motions, announcements, rules, guidelines, policies, rulings, etc." />
              </small>
            </div>
            {this.renderProposalsList}
            <div>
              Quorum: <AoQuorum />
            </div>
          </React.Fragment>
        </AoPopupPanel>
      </div>
    )
  }
}
