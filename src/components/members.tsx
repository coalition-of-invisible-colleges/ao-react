import * as React from 'react'
import { computed } from 'mobx'
import { observer } from 'mobx-react'
import InfiniteScroll from 'react-infinite-scroll-component'
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
  page: number
  text?: string
  openNew?: boolean
  items?: number
  hasMore: boolean
}

@observer
export default class AoMembers extends React.Component<{}, State> {
  constructor(props) {
    super(props)
    console.log(
      'AoMembers constructor members.length is ',
      aoStore.state.members.length
    )
    const hasMore = aoStore.state.members.length >= STARTING_ITEMS + 1
    this.state = {
      sort: 'recents',
      page: 0,
      items: STARTING_ITEMS,
      hasMore: hasMore
    }
    console.log('state is now ', this.state)

    this.sortBy = this.sortBy.bind(this)
    this.toggleNew = this.toggleNew.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.scrollMore = this.scrollMore.bind(this)
    this.addMember = this.addMember.bind(this)
    this.renderSortButton = this.renderSortButton.bind(this)
    this.renderItems = this.renderItems.bind(this)
    this.renderMembersList = this.renderMembersList.bind(this)
  }

  sortBy(sort: MemberSort) {
    console.log('members sortBy. state is ', this.state)
    if (this.state.sort === sort) {
      return
    }
    const hasMore = this.sortedMemberCards.length >= STARTING_ITEMS + 1
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

  scrollMore() {
    console.log('members scrollMore')

    const index = this.state.items
    const nextResults = this.sortedMemberCards.slice(index, index + 5)
    const hasMore = this.sortedMemberCards.length >= index + 1
    this.setState({
      items: index + 5,
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

  renderItems(items) {
    return items.map((task, i) => (
      <AoDragZone
        taskId={task.taskId}
        dragContext={{
          zone: 'panel',
          y: i
        }}
        key={task.taskId}>
        <AoContextCard task={task} cardStyle="priority" noFindOnPage={true} />
      </AoDragZone>
    ))
  }

  renderMembersList() {
    if (this.state.items === undefined) {
      return ''
    }

    if (this.sortedMemberCards.length === 0) {
      return (
        <div id="membersList" className="results">
          No members
        </div>
      )
    }

    return (
      <div id="membersList" className="results">
        <div>
          {this.sortedMemberCards.length}{' '}
          {this.sortedMemberCards.length === 1 ? 'member' : 'members'}
        </div>
        <InfiniteScroll
          dataLength={this.state.items}
          next={this.scrollMore}
          scrollableTarget="membersList"
          hasMore={this.state.hasMore}
          loader={<h4>Loading...</h4>}
          endMessage={
            <p style={{ textAlign: 'center' }}>
              End of {this.sortedMemberCards.length}{' '}
              {this.sortedMemberCards.length === 1 ? 'member' : 'members'}
            </p>
          }>
          {this.renderItems(this.sortedMemberCards.slice(0, this.state.items))}
        </InfiniteScroll>
      </div>
    )
  }

  @computed get sortedMemberCards() {
    console.log('sortedMemberCards state is ', this.state)

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
    }

    if (this.state.sort !== 'age') {
      memberCards.reverse()
      // Default sort is database order, i.e., member creation order
    }
    console.log('sortedMemberCards. length is ', memberCards.length)

    return memberCards
  }

  render() {
    return (
      <div
        style={{
          paddingBottom:
            this.state.items <= 10 && !this.state.openNew ? '2.7em' : null
        }}>
        <h2>Members</h2>
        <div className="toolbar">
          {this.renderSortButton('alphabetical', 'A-Z')}
          {this.renderSortButton('recents', 'Recents')}
          {this.renderSortButton('vouches', 'Vouches')}
          {this.renderSortButton('age', 'Order')}
        </div>
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
          </div>
        )}
      </div>
    )
  }
}
