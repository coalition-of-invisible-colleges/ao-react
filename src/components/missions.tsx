import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore, { Task } from '../client/store'
import AoStack from './stack'
import { gloss } from '../semantics'
import AoPopupPanel from './popupPanel'
import Badge from '../assets/images/badge.svg'

type MissionFilter = 'changed' | 'mine' | 'not mine' | 'all'

type MissionSort = 'alphabetical' | 'hodls' | 'age'

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
        this.changedMissions.length >= 1
          ? 'changed'
          : this.myMissions.length >= 1 &&
            this.myMissions.length !== aoStore.topLevelMissions.length
          ? 'mine'
          : 'all',
      sort: 'hodls',
      loaded: false,
    }
    this.filterBy = this.filterBy.bind(this)
    this.sortBy = this.sortBy.bind(this)
    this.renderSortButton = this.renderSortButton.bind(this)
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.loaded && this.changedMissions.length >= 1) {
      this.setState({ filter: 'changed', loaded: true })
    } else if (
      this.state.filter === 'changed' &&
      this.changedMissions.length < 1
    ) {
      this.setState({
        filter:
          this.myMissions.length >= 1 &&
          this.myMissions.length !== aoStore.topLevelMissions.length
            ? 'mine'
            : 'all',
      })
    } else if (this.state.filter === 'mine' && this.myMissions.length < 1) {
      this.setState({
        filter:
          this.myMissions.length >= 1 &&
          this.myMissions.length !== aoStore.topLevelMissions.length
            ? 'mine'
            : 'all',
      })
    } else if (
      this.state.filter === 'not mine' &&
      this.otherMissions.length < 1
    ) {
      this.setState({
        filter:
          this.myMissions.length >= 1 &&
          this.myMissions.length !== aoStore.topLevelMissions.length
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

  @computed get changedMissions() {
    return this.myMissions.filter(
      mission =>
        !mission.seen ||
        (mission.seen &&
          !mission.seen.some(
            userseen => userseen.memberId === aoStore.member.memberId
          ))
    )
  }

  @computed get myMissions() {
    return aoStore.topLevelMissions.filter(mission =>
      mission.deck.includes(aoStore.member.memberId)
    )
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
    if (this.state.filter === 'changed') {
      missions = this.changedMissions
    } else if (this.state.filter === 'mine') {
      missions = this.myMissions
    } else if (this.state.filter === 'not mine') {
      missions = this.otherMissions
    } else {
      missions = aoStore.topLevelMissions
    }

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
      <div className="results">
        <AoStack
          cards={missions}
          zone="panel"
          cardStyle="mission"
          cardsBeforeFold={5}
        />
      </div>
    )
  }

  render() {
    const renderChanged = this.changedMissions.length >= 1
    const renderMine =
      this.myMissions.length >= 1 &&
      this.myMissions.length !== aoStore.topLevelMissions.length
    const renderOther =
      this.otherMissions.length >= 1 &&
      this.otherMissions.length !== aoStore.topLevelMissions.length
    const renderAll =
      aoStore.topLevelMissions.length >= 1 &&
      (renderChanged || renderMine || renderOther)

    const percentChanged = Math.floor(
      (10 * this.changedMissions.length) / this.myMissions.length
    )
    const buttonClass = 'red' + percentChanged.toString()
    return (
      <div id="missions">
        <AoPopupPanel
          iconSrc={Badge}
          tooltipText={gloss('Guild') + ' Index'}
          tooltipPlacement="right"
          panelPlacement="right"
          id="tour-missions"
          buttonClass={buttonClass}>
          <React.Fragment>
            <h2>{gloss('Guild')} Index</h2>
            <div className="toolbar">
              {renderChanged && this.renderFilterButton('changed', 'Changed')}
              {renderMine && this.renderFilterButton('mine', 'My Deck')}
              {renderOther && this.renderFilterButton('not mine', 'Unheld')}
              {renderAll && this.renderFilterButton('all', 'All')}
            </div>
            <div className="toolbar">
              {this.renderSortButton('alphabetical', 'A-Z')}
              {this.renderSortButton('hodls', 'Hodls')}
              {this.renderSortButton('age', 'Order')}
            </div>
            {this.renderMissionsList}
          </React.Fragment>
        </AoPopupPanel>
      </div>
    )
  }
}
