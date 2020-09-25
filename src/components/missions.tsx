import * as React from 'react'
import { computed } from 'mobx'
import { observer } from 'mobx-react'
import aoStore, { Task } from '../client/store'
import AoStack from './stack'

type MissionSort = 'alphabetical' | 'hodls' | 'age'

interface State {
  page: number
  sort: MissionSort
}

export const defaultState: State = {
  page: 0,
  sort: 'alphabetical'
}

@observer
export default class AoMissions extends React.PureComponent<{}, State> {
  constructor(props) {
    super(props)
    this.state = defaultState
    this.sortBy = this.sortBy.bind(this)
    this.renderSortButton = this.renderSortButton.bind(this)
  }

  sortBy(event) {
    const sort = event.currentTarget.getAttribute('data-sort')
    if (this.state.sort === sort) {
      return
    }
    this.setState({ sort: sort })
  }

  renderSortButton(sort: MissionSort, label: string) {
    if (this.state.sort === sort) {
      return <p className={'action selected'}>{label}</p>
    } else {
      return (
        <p onClick={this.sortBy} data-sort={sort} className={'action'}>
          {label}
        </p>
      )
    }
  }

  @computed
  get renderMissionsList() {
    let missions = aoStore.state.tasks.filter(task => {
      return task.hasOwnProperty('guild') && task.guild.length >= 1
    })
    if (missions.length < 1) {
      return ''
    }

    let projectCards = []
    projectCards = projectCards.concat(
      ...missions.map(task => aoStore.subGuildsByGuild.get(task.taskId))
    )

    missions = missions.filter(task => {
      return !projectCards.includes(task)
    })

    if (this.state.sort === 'alphabetical') {
      missions.sort((a, b) => {
        return b.guild.toLowerCase().localeCompare(a.guild.toLowerCase())
      })
    } else if (this.state.sort === 'hodls') {
      missions.sort((a, b) => {
        return a.deck.length - b.deck.length
      })
    } else if (this.state.sort === 'age') {
      missions.reverse()
      // Default sort is database order, i.e., card creation order
    }

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
    return (
      <React.Fragment>
        <h2>Missions Index</h2>
        <div className={'toolbar'}>
          {this.renderSortButton('alphabetical', 'A-Z')}
          {this.renderSortButton('hodls', 'Hodls')}
          {this.renderSortButton('age', 'Order')}
        </div>
        {this.renderMissionsList}
      </React.Fragment>
    )
  }
}
