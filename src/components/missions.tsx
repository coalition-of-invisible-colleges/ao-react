import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import { Task } from '../interfaces'
import AoStack from './stack'
import { gloss } from '../semantics'
import AoPopupPanel from './popupPanel'

type MissionFilter = 'mine' | 'not mine' | 'all'

type MissionSort = 'recents' | 'alphabetical' | 'hodls' | 'age'

interface State {
  page: number
  filter: MissionFilter
  sort: MissionSort
  loaded: boolean
}

@observer
export default class AoMissions extends React.Component<{}, State> {
  constructor(props) {
    super(props)
    makeObservable(this)
    this.state = {
      page: 0,
      filter:
        aoStore.myMissions.length >= 1 &&
        aoStore.myMissions.length !== aoStore.topLevelMissions.length
          ? 'mine'
          : 'all',
      sort: 'recents',
      loaded: false,
    }
    this.filterBy = this.filterBy.bind(this)
    this.sortBy = this.sortBy.bind(this)
    this.renderSortButton = this.renderSortButton.bind(this)
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.filter === 'mine' && aoStore.myMissions.length < 1) {
      this.setState({
        filter:
          aoStore.myMissions.length >= 1 &&
          aoStore.myMissions.length !== aoStore.topLevelMissions.length
            ? 'mine'
            : 'all',
      })
    } else if (
      this.state.filter === 'not mine' &&
      this.otherMissions.length < 1
    ) {
      this.setState({
        filter:
          aoStore.myMissions.length >= 1 &&
          aoStore.myMissions.length !== aoStore.topLevelMissions.length
            ? 'mine'
            : 'all',
      })
    }
  }

  filterBy(event) {
    const filter = event.currentTarget.getAttribute('data-filter')
    if (this.state.filter === filter) {
      return
    }
    this.setState({ filter: filter })
  }

  sortBy(event) {
    const sort = event.currentTarget.getAttribute('data-sort')
    if (this.state.sort === sort) {
      return
    }
    this.setState({ sort: sort })
  }

  renderFilterButton(filter: MissionFilter, label: string) {
    if (this.state.filter === filter) {
      return <p className="action selected">{label}</p>
    } else {
      return (
        <p onClick={this.filterBy} data-filter={filter} className="action">
          {label}
        </p>
      )
    }
  }

  renderSortButton(sort: MissionSort, label: string) {
    if (this.state.sort === sort) {
      return <p className="action selected">{label}</p>
    } else {
      return (
        <p onClick={this.sortBy} data-sort={sort} className="action">
          {label}
        </p>
      )
    }
  }

  @computed get otherMissions() {
    return aoStore.topLevelMissions.filter(
      mission => !mission.deck.includes(aoStore.member.memberId)
    )
  }

  @computed
  get renderMissionsList() {
    if (aoStore.topLevelMissions.length < 1) {
      return null
    }

    let missions
    if (this.state.filter === 'mine') {
      missions = aoStore.myMissions
    } else if (this.state.filter === 'not mine') {
      missions = this.otherMissions
    } else {
      missions = aoStore.topLevelMissions
    }

    if (this.state.sort === 'recents') {
      missions.sort((a, b) => {
        return a.lastClaimed - b.lastClaimed
        // return tempLastClaimeds[b.taskId] - tempLastClaimeds[a.taskId]
      })
    } else if (this.state.sort === 'alphabetical') {
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
      <div className="index">
        <AoStack
          cards={missions}
          zone="panel"
          cardStyle="index"
          alwaysShowAll={true}
          noDrop={true}
        />
      </div>
    )
  }

  render() {
    const renderMine =
      aoStore.myMissions.length >= 1 &&
      aoStore.myMissions.length !== aoStore.topLevelMissions.length
    const renderOther =
      this.otherMissions.length >= 1 &&
      this.otherMissions.length !== aoStore.topLevelMissions.length
    const renderAll =
      aoStore.topLevelMissions.length >= 1 && (renderMine || renderOther)

    return (
      <div id="missions">
        <h2>{gloss('Guilds')}</h2>
        <div className="toolbar">
          {renderMine && this.renderFilterButton('mine', 'My Deck')}
          {renderOther && this.renderFilterButton('not mine', 'Unheld')}
          {renderAll && this.renderFilterButton('all', 'All')}
        </div>
        <div className="toolbar">
          {this.renderSortButton('recents', 'Recent')}
          {this.renderSortButton('alphabetical', 'A-Z')}
          {this.renderSortButton('hodls', 'Hodls')}
          {this.renderSortButton('age', 'Order')}
        </div>
        {this.renderMissionsList}
      </div>
    )
  }
}
