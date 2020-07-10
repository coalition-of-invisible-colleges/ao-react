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

export type MemberSort = 'recents' | 'vouches'

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
    this.sortByRecent = this.sortByRecent.bind(this)
    this.sortByVouches = this.sortByRecent.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onClick = this.onClick.bind(this)
  }

  sortByRecent() {
    this.setState({ sort: 'recents' })
  }

  sortByVouches() {
    this.setState({ sort: 'vouches' })
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

  render() {
    if (this.state.redirect !== undefined) {
      this.setState({ redirect: undefined })
      return <Redirect to={this.state.redirect} />
    }

    let list
    const memberCards = aoStore.state.members
      .map(member => aoStore.hashMap.get(member.memberId))
      .slice()
      .reverse()
    if (memberCards && memberCards.length >= 1) {
      list = (
        <AoStack
          cards={memberCards}
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
            <button onClick={this.sortByRecent}>Recents</button>
            <button onClick={this.sortByVouches}>Vouches</button>
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
