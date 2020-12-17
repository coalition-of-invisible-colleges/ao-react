import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore, { Task } from '../client/store'
import api from '../client/api'
import AoStack from './stack'
import AoTip from './tip'

type MemberSort = 'alphabetical' | 'recents' | 'vouches' | 'age'

interface State {
  sort: MemberSort
  page: number
  text?: string
  openNew?: boolean
}

export const defaultState: State = {
  sort: 'recents',
  page: 0
}

@observer
export default class AoMembers extends React.PureComponent<{}, State> {
  constructor(props) {
    super(props)
    this.state = defaultState
    this.sortBy = this.sortBy.bind(this)
    this.toggleNew = this.toggleNew.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.addMember = this.addMember.bind(this)
  }

  sortBy(sort: MemberSort) {
    if (this.state.sort === sort) {
      return
    }
    this.setState({ sort: sort })
  }

  toggleNew() {
    this.setState({ openNew: !this.state.openNew })
  }

  onChange(event) {
    this.setState({ text: event.target.value })
  }

  onKeyDown(event) {
    if (event.key === 'Enter') {
      this.addMember(event)
    }
  }

  addMember(event) {
    api.createMember(this.state.text)
  }

  renderSortButton(sort: MemberSort, label: string) {
    if (this.state.sort === sort) {
      return <p className={'action selected'}>{label}</p>
    } else {
      return (
        <p onClick={() => this.sortBy(sort)} className={'action'}>
          {label}
        </p>
      )
    }
  }

  render() {
    const members = aoStore.state.members.slice()
    let memberCards: Task[] = []

    if (this.state.sort === 'recents') {
      members.sort((a, b) => {
        return a.lastUsed < b.lastUsed ? -1 : 1
      })
    } else if (this.state.sort === 'alphabetical') {
      members.sort((a, b) => {
        return b.name.toLowerCase().localeCompare(a.name.toLowerCase())
      })
    }

    memberCards = members
      .map(member => aoStore.hashMap.get(member.memberId))
      .slice()

    if (this.state.sort === 'vouches') {
      memberCards.sort((a, b) => {
        return a.deck.length - b.deck.length
      })
    } else if (this.state.sort === 'age') {
      memberCards.reverse()
      // Default sort is database order, i.e., member creation order
    }

    let list
    if (memberCards && memberCards.length >= 1) {
      list = (
        <AoStack
          cards={memberCards}
          zone="panel"
          cardStyle="priority"
          cardsBeforeFold={10}
        />
      )
    }

    return (
      <div
        style={{
          paddingBottom:
            memberCards.length <= 10 && !this.state.openNew ? '2.7em' : null
        }}>
        <h2>Members</h2>
        <div className="toolbar">
          {this.renderSortButton('alphabetical', 'A-Z')}
          {this.renderSortButton('recents', 'Recents')}
          {this.renderSortButton('vouches', 'Vouches')}
          {this.renderSortButton('age', 'Order')}
        </div>
        {list}
        <div className="action" onClick={this.toggleNew}>
          {this.state.openNew ? (
            <React.Fragment>Invite &#8963;</React.Fragment>
          ) : (
            <React.Fragment>Invite &#8964;</React.Fragment>
          )}
        </div>
        {this.state.openNew && (
          <form>
            <div style={{ position: 'relative', top: '-1em' }}>
              <label style={{ position: 'relative', top: '0em' }}>
                Username:
              </label>
              <input
                type="text"
                value={this.state.text}
                onChange={this.onChange}
                onKeyDown={this.onKeyDown}
                size={16}
              />
            </div>
            <AoTip text="Create a new member account on this AO server. The default password is the same as the username. Please log in and change your password promptly to maintain community security." />
            <button type="button" onClick={this.addMember} className="action">
              Add Member
            </button>
          </form>
        )}
      </div>
    )
  }
}
