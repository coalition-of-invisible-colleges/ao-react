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
    if (missions.length < 1) {
      return ''
    }

    let getProjectCards = card => {
      let projectCards: Task[] = []
      let allSubCards = card.priorities.concat(card.subTasks, card.completed)

      allSubCards.forEach(tId => {
        let subCard = aoStore.hashMap.get(tId)
        if (subCard) {
          if (subCard.guild && subCard.guild.length >= 1) {
            projectCards.push(subCard)
          }
        }
      })

      if (card.grid && card.grid.rows) {
        Object.entries(card.grid.rows).forEach(([y, row]) => {
          Object.entries(row).forEach(([x, cell]) => {
            let gridCard = aoStore.hashMap.get(cell)
            if (gridCard.guild && gridCard.guild.length >= 1) {
              projectCards.push(gridCard)
            }
          })
        })
      }

      return projectCards
    }

    let projectCards = []
    projectCards = projectCards.concat(
      ...missions.map(task => getProjectCards(task))
    )

    missions = missions.filter(task => {
      return !projectCards.includes(task)
    })

    return (
      <div className={'results'}>
        <AoStack
          cards={missions}
          zone={'panel'}
          cardStyle={'mission'}
          alwaysShowAll={true}
        />
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
          <h2>Missions Index</h2>
          {this.renderMissionsList()}
        </AoPopupPanel>
      </div>
    )
  }
}
