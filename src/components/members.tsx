import * as React from 'react'
import { observer } from 'mobx-react'
import { Redirect } from 'react-router-dom'
import aoStore, { AoState, Task } from '../client/store'
import api from '../client/api'
import { ObservableMap } from 'mobx'
import { delay, cancelablePromise, noop } from '../utils'
import AoPopupPanel from './popupPanel'
import AoStack from './stack'
import MemberIcon from '../assets/images/loggedWhite.svg'

export type MemberSort = 'recents' | 'vouches' | 'age'

interface State {
  sort: MemberSort
  page: number
  redirect?: string
  text?: string
}

export const defaultState: State = {
  sort: 'recents',
  page: 0,
  redirect: undefined
}

@observer
export default class AoMembers extends React.Component<{}, State> {
  constructor(props) {
    super(props)
    this.state = defaultState
    this.sortBy = this.sortBy.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onClick = this.onClick.bind(this)
  }

  sortBy(sort: MemberSort) {
    this.setState({ sort: sort })
  }

  onChange(event) {
    this.setState({ text: event.target.value })
  }

  onKeyDown(event) {
    if (event.key === 'Enter') {
      this.onClick(event)
    }
  }
  onClick(event) {
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
    if (this.state.redirect !== undefined) {
      this.setState({ redirect: undefined })
      return <Redirect to={this.state.redirect} />
    }

    const members = aoStore.state.members.slice()
    let memberCards: Task[] = []

    if (this.state.sort === 'recents') {
      members.sort((a, b) => {
        return a.lastUsed < b.lastUsed ? -1 : 1
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
      // Default sort is database order, i.e., creation order
    }

    let list
    if (memberCards && memberCards.length >= 1) {
      list = (
        <AoStack
          cards={memberCards}
          zone={'panel'}
          cardStyle={'priority'}
          alwaysShowAll={true}
        />
      )
    }

    return (
      <div id={'members'}>
        <AoPopupPanel
          iconSrc={MemberIcon}
          tooltipText={'Members'}
          tooltipPlacement={'right'}
          panelPlacement={'right'}>
          <React.Fragment>
            <h2>Members</h2>
            <div className={'toolbar'}>
              {this.renderSortButton('recents', 'Recents')}
              {this.renderSortButton('vouches', 'Vouches')}
              {this.renderSortButton('age', 'Order')}
            </div>
            {list}
            <div>
              Add Member
              <input
                type="text"
                value={this.state.text}
                onChange={this.onChange}
                onKeyDown={this.onKeyDown}
              />
              <button type="button" onClick={this.onClick}>
                Add Member
              </button>
            </div>
          </React.Fragment>
        </AoPopupPanel>
      </div>
    )
  }
}
