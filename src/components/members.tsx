import * as React from 'react'
import { computed } from 'mobx'
import { observer } from 'mobx-react'
import InfiniteScroll from 'react-infinite-scroller'
import aoStore, { Task } from '../client/store'
import api from '../client/api'
import AoStack from './stack'
import AoTip from './tip'
import AoContextCard from './contextCard'
import AoDragZone from './dragZone'

type MemberSort = 'alphabetical' | 'recents' | 'vouches' | 'age'

const STARTING_ITEMS = 10

interface State {
  sort: MemberSort
  text?: string
  openNew?: boolean
  items: number
  hasMore: boolean
}

@observer
export default class AoMembers extends React.Component<{}, State> {
  constructor(props) {
    super(props)

    const hasMore =
      aoStore.state.members.filter(
        member => !!aoStore.hashMap.get(member.memberId)
      ).length +
        1 >=
      STARTING_ITEMS + 1

    this.state = {
      sort: 'recents',
      items: STARTING_ITEMS,
      hasMore: hasMore
    }

    this.sortBy = this.sortBy.bind(this)
    this.toggleNew = this.toggleNew.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.scrollMore = this.scrollMore.bind(this)
    this.addMember = this.addMember.bind(this)
    this.renderSortButton = this.renderSortButton.bind(this)
    this.renderMembersList = this.renderMembersList.bind(this)
  }

  sortBy(sort: MemberSort) {
    if (this.state.sort === sort) {
      return
    }
    const hasMore = this.sortedMemberCards.length >= STARTING_ITEMS + 1
    const membersListDiv = document.getElementById('membersList')
    if (membersListDiv) {
      membersListDiv.scrollTop = 0
    }
    this.setState({ sort: sort, items: STARTING_ITEMS, hasMore })
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

  scrollMore(page: number) {
    const newIndex = page * 5
    const hasMore = this.sortedMemberCards.length > newIndex
    this.setState({
      items: newIndex,
      hasMore
    })
  }

  addMember(event) {
    api.createMember(this.state.text)
  }

  renderSortButton(sort: MemberSort, label: string) {
    if (this.state.sort === sort) {
      return <p className="action selected">{label}</p>
    } else {
      return (
        <p onClick={() => this.sortBy(sort)} className="action">
          {label}
        </p>
      )
    }
  }

  @computed get renderedItems() {
    console.log('renderedItems items is ', this.state.items)
    const items = this.sortedMemberCards.slice(0, this.state.items)
    let rendered = items.map((task, i) => {
      return (
        <AoDragZone
          taskId={task.taskId}
          dragContext={{
            zone: 'panel',
            y: i
          }}
          key={task.taskId}>
          <AoContextCard task={task} cardStyle="priority" noFindOnPage={true} />
        </AoDragZone>
      )
    })
    if (items.length >= this.sortedMemberCards.length) {
      rendered.push(
        <p style={{ textAlign: 'center' }}>
          End of {this.sortedMemberCards.length}{' '}
          {this.sortedMemberCards.length === 1 ? 'member' : 'members'}
        </p>
      )
    }
    return rendered
  }

  renderMembersList() {
    if (this.sortedMemberCards.length === 0) {
      return (
        <div id="membersList" className="results">
          No members
        </div>
      )
    }

    return (
      <React.Fragment>
        <div className="toolbar">
          {this.renderSortButton('alphabetical', 'A-Z')}
          {this.renderSortButton('recents', 'Recents')}
          {this.renderSortButton('vouches', 'Vouches')}
          {this.renderSortButton('age', 'Order')}
        </div>
        <div id="membersList" className="results">
          <div>
            {this.sortedMemberCards.length}{' '}
            {this.sortedMemberCards.length === 1 ? 'member' : 'members'}
          </div>
          <InfiniteScroll
            loadMore={this.scrollMore}
            hasMore={this.state.hasMore}
            useWindow={false}
            loader={<h4>Loading...</h4>}>
            {this.renderedItems}
          </InfiniteScroll>
        </div>
      </React.Fragment>
    )
  }

  @computed get sortedMemberCards() {
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

    const count = memberCards.length
    memberCards = memberCards.filter(card => !!card)
    const missingCards = count - memberCards.length
    if (missingCards > 0) {
      console.log(`Missing member cards: ${missingCards}`)
    }

    if (this.state.sort === 'vouches') {
      memberCards.sort((a, b) => {
        return a.deck.length - b.deck.length
      })
    }

    if (this.state.sort !== 'age') {
      memberCards.reverse()
      // Default sort is database order, i.e., member creation order
    }

    return memberCards
  }

  render() {
    return (
      <React.Fragment>
        <h2>Members</h2>
        {this.renderMembersList()}
        <div className="action" onClick={this.toggleNew}>
          {this.state.openNew ? (
            <React.Fragment>Invite &#8963;</React.Fragment>
          ) : (
            <React.Fragment>Invite &#8964;</React.Fragment>
          )}
        </div>
        {this.state.openNew && (
          <div>
            <div>
              <label>Username:</label>
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
          </div>
        )}
      </React.Fragment>
    )
  }
}
