import * as React from 'react'
import { observer } from 'mobx-react'
import { Redirect } from 'react-router-dom'
import aoStore, { AoState, Task } from '../client/store'
import api from '../client/api'
import { ObservableMap } from 'mobx'
import { delay, cancelablePromise, noop } from '../utils'
import AoSmartZone, { Sel } from './smartZone'
import MemberIcon from '../assets/images/loggedWhite.svg'

export type MemberSort = 'recents' | 'vouches'

interface State {
  membersPanel: boolean
  sort: MemberSort
  page: number
  redirect?: string
}

export const defaultState: State = {
  membersPanel: false,
  sort: 'recents',
  page: 0,
  redirect: undefined
}

@observer
export default class AoMembers extends React.Component<{}, State> {
  constructor(props) {
    super(props)
    this.state = defaultState
    this.toggleMembersPanel = this.toggleMembersPanel.bind(this)
    this.sortByRecent = this.sortByRecent.bind(this)
    this.sortByVouches = this.sortByRecent.bind(this)
    this.renderMembersButton = this.renderMembersButton.bind(this)
    this.renderMembersList = this.renderMembersList.bind(this)
    this.goInResult = this.goInResult.bind(this)
  }

  toggleMembersPanel() {
    this.setState({ membersPanel: !this.state.membersPanel })
  }

  goInResult(selection: Sel) {
    const trueY = aoStore.searchResults.length - selection.y - 1
    const taskId = aoStore.searchResults[trueY].taskId
    aoStore.addToContext([aoStore.currentCard])
    this.setState({
      redirect: '/task/' + taskId
    })
    this.setState({ membersPanel: false })
  }

  sortByRecent() {
    this.setState({ sort: 'recents' })
  }

  sortByVouches() {
    this.setState({ sort: 'vouches' })
  }

  renderMembersButton() {
    return (
      <div onClick={this.toggleMembersPanel} className={'actionCircle'}>
        <img src={MemberIcon} />
      </div>
    )
  }

  renderMembersList() {
    if (aoStore.state.members.length < 1) {
      return ''
    }

    const results = aoStore.state.members
      .slice()
      .reverse()
      .map((member, i) => (
        <AoSmartZone
          taskId={member.memberId}
          y={i}
          key={i}
          cardSource={'search'}
          onGoIn={this.goInResult}
        />
      ))

    return <div className={'results'}>{results}</div>
  }

  render() {
    if (this.state.redirect !== undefined) {
      this.setState({ redirect: undefined })
      return <Redirect to={this.state.redirect} />
    }

    if (!this.state.membersPanel) {
      return <div id={'members'}>{this.renderMembersButton()}</div>
    }

    return (
      <div id={'members'} className={'open'}>
        {this.renderMembersButton()}
        <button onClick={this.sortByRecent}>Recents</button>
        <button onClick={this.sortByVouches}>Vouches</button>
        {this.renderMembersList()}
      </div>
    )
  }
}
