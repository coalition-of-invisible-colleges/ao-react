import * as React from 'react'
import { observer } from 'mobx-react'
import { Redirect } from 'react-router-dom'
import aoStore, { AoState, Task } from '../client/store'
import api from '../client/api'
import { ObservableMap } from 'mobx'
import { delay, cancelablePromise, noop } from '../utils'
import AoSmartZone, { Sel } from './smartZone'
import Badge from '../assets/images/badge.svg'

interface State {
  missionsPanel: boolean
  page: number
  redirect?: string
}

export const defaultState: State = {
  missionsPanel: false,
  page: 0,
  redirect: undefined
}

@observer
export default class AoMissions extends React.Component<{}, State> {
  constructor(props) {
    super(props)
    this.state = defaultState
    this.toggleMissionsPanel = this.toggleMissionsPanel.bind(this)
    this.renderMissionsButton = this.renderMissionsButton.bind(this)
    this.renderMissionsList = this.renderMissionsList.bind(this)
    this.goInResult = this.goInResult.bind(this)
  }

  toggleMissionsPanel() {
    this.setState({ missionsPanel: !this.state.missionsPanel })
  }

  goInResult(selection: Sel) {
    const trueY = aoStore.searchResults.length - selection.y - 1
    const taskId = aoStore.searchResults[trueY].taskId
    aoStore.addToContext([aoStore.currentCard])
    this.setState({
      redirect: '/task/' + taskId
    })
    this.setState({ missionsPanel: false })
  }

  renderMissionsButton() {
    return (
      <div onClick={this.toggleMissionsPanel} className={'actionCircle'}>
        <img src={Badge} />
      </div>
    )
  }

  renderMissionsList() {
    const missions = aoStore.state.tasks.filter(task => {
      return task.hasOwnProperty('guild') && task.guild.length >= 1
    })

    if (missions.length < 1) {
      return ''
    }

    const results = missions
      .slice()
      .reverse()
      .map((task, i) => (
        <AoSmartZone
          taskId={task.taskId}
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

    if (!this.state.missionsPanel) {
      return <div id={'missions'}>{this.renderMissionsButton()}</div>
    }

    return (
      <div id={'missions'} className={'open'}>
        {this.renderMissionsButton()}
        {this.renderMissionsList()}
      </div>
    )
  }
}
