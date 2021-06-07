import * as React from 'react'
import { computed } from 'mobx'
import { observer } from 'mobx-react'
import aoStore, { Task, Signature } from '../client/store'
import AoStack from './stack'
import { mostRecentSignaturesOnly, countCurrentSignatures } from '../cards'
import AoTip from './tip'

interface Props {
  filterByGuildId: string
  updateBadge?: (number) => void
}

@observer
export default class AoProposals extends React.Component<Props> {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    if (this.props.updateBadge) {
      this.props.updateBadge(this.toSign.length)
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.updateBadge) {
      this.props.updateBadge(this.toSign.length)
    }
  }

  @computed get everSigned() {
    let source = aoStore.state.tasks
    console.log('filterByGuildId is', this.props.filterByGuildId)
    if (this.props.filterByGuildId) {
      const guildCard = aoStore.hashMap.get(this.props.filterByGuildId)
      if (!guildCard) {
        return []
      }
      source = []
      if (guildCard) {
        let gridTaskIds = []
        Object.entries(guildCard.grid.rows).forEach(([y, row]) => {
          gridTaskIds.push(...Object.values(row))
          console.log('gridTaskIds is ', gridTaskIds)
        })
        ;[
          ...guildCard.priorities,
          ...gridTaskIds,
          ...guildCard.subTasks,
          ...guildCard.completed
        ].forEach(st => {
          const subCard = aoStore.hashMap.get(st)
          if (!subCard) {
            console.log('Missing subcard in proposals')
            return
          }
          if (
            (subCard.deck && subCard.deck.length <= 0) ||
            this.props.filterByGuildId
          ) {
            source.push(aoStore.hashMap.get(st))
          }
        })
      }
    }
    return source
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
      return !this.passed
        .concat(this.toSign)
        .some(t => t.taskId === task.taskId)
    })
  }

  // @computed get previouslySigned() {
  //   console.log(
  //     'previouslySigned. this.everSigned.length is ',
  //     this.everSigned.length,
  //     ' and this.proposals.length is ',
  //     this.proposals.length
  //   )
  //   return this.everSigned.filter(task => {
  //     return this.proposals.every(t => t.taskId !== task.taskId)
  //   })
  // }

  @computed get renderProposalsList() {
    return (
      <div className="results">
        <AoStack
          cards={this.toSign}
          descriptor={{
            singular: 'More to Sign',
            plural: 'More to Sign'
          }}
          cardStyle="face"
        />
        <div className="tail">
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
          {/*          <AoStack
            cards={this.previouslySigned}
            cardStyle="face"
            alwaysShowAll={false}
            descriptor={{
              singular: 'Previously Signed',
              plural: 'Previously Signed'
            }}
            noFirstCard={true}
          />
*/}{' '}
        </div>
      </div>
    )
  }

  render() {
    return (
      <React.Fragment>
        {this.toSign.length >= 1 && (
          <React.Fragment>
            <h3>
              {this.toSign.length} Proposal{this.toSign.length > 1 && 's'} to
              sign
            </h3>
            <div
              style={{
                textAlign: 'center',
                position: 'relative',
                top: '-0.5em'
              }}>
              <small>
                The community awaits your decision.{' '}
                <AoTip text="Any card signed by at least one member is called a 'proposal' and listed here. To sign a card, hover over its moon and click 'sign'. This is the official pinned bulletin for this server, for posting proposals, propositions, motions, announcements, rules, guidelines, policies, rulings, etc." />
              </small>
            </div>
          </React.Fragment>
        )}
        {this.renderProposalsList}
      </React.Fragment>
    )
  }
}
