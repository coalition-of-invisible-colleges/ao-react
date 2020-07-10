import * as React from 'react'
import { observer } from 'mobx-react'
import { Redirect } from 'react-router-dom'
import aoStore, { AoState, Task } from '../client/store'
import api from '../client/api'
import { ObservableMap } from 'mobx'
import { delay, cancelablePromise, noop } from '../utils'
import AoStack from './stack'
import Badge from '../assets/images/badge.svg'
import AoPopupPanel from './popupPanel'

interface State {
  page: number
  redirect?: string
}

export const defaultState: State = {
  page: 0,
  redirect: undefined
}

@observer
export default class AoMissions extends React.Component<{}, State> {
  constructor(props) {
    super(props)
    this.state = defaultState
    this.renderMissionsList = this.renderMissionsList.bind(this)
  }

  renderMissionsList() {
    let missions = aoStore.state.tasks.filter(task => {
      return task.hasOwnProperty('guild') && task.guild.length >= 1
    })
    missions.reverse()

    if (missions.length < 1) {
      return ''
    }

    return (
      <div className={'results'}>
        <AoStack cards={missions} cardStyle={'priority'} alwaysShowAll={true} />
      </div>
    )
  }

  render() {
    if (this.state.redirect !== undefined) {
      this.setState({ redirect: undefined })
      return <Redirect to={this.state.redirect} />
    }

    return (
      <div id="missions">
        <AoPopupPanel
          iconSrc={Badge}
          tooltipText={'Missions Index'}
          tooltipPlacement={'right'}
          panelPlacement={'right'}>
          {this.renderMissionsList()}
        </AoPopupPanel>
      </div>
    )
  }
}
