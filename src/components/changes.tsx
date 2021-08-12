import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore, { Task } from '../client/store'
import AoStack from './stack'
import { gloss } from '../semantics'
import AoPopupPanel from './popupPanel'

type ChangesSort = 'alphabetical' | 'hodls' | 'age'

interface State {
  sort: ChangesSort
}

@observer
export default class AoChanges extends React.Component<{}, State> {
  constructor(props) {
    super(props)
    makeObservable(this)
    this.state = {
      sort: 'hodls',
    }
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

  renderSortButton(sort: ChangesSort, label: string) {
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

  @computed get allChanges() {
    return aoStore.myCards.filter(
      card =>
        card.seen &&
        !card.seen.some(
          userseen => userseen.memberId === aoStore.member.memberId
        )
    )
  }

  @computed
  get renderChangesList() {
    if (this.allChanges.length < 1) {
      return null
    }

    let cards = this.allChanges

    if (this.state.sort === 'alphabetical') {
      cards.sort((a, b) => {
        return b.guild.toLowerCase().localeCompare(a.guild.toLowerCase())
      })
    } else if (this.state.sort === 'hodls') {
      cards.sort((a, b) => {
        return a.deck.length - b.deck.length
      })
    } else if (this.state.sort === 'age') {
      cards.reverse()
      // Default sort is database order, i.e., card creation order
    }

    return (
      <div className="results">
        <AoStack
          cards={cards}
          zone="panel"
          cardStyle="face"
          cardsBeforeFold={5}
        />
      </div>
    )
  }

  render() {
    const percentChanged = Math.min(Math.floor(this.allChanges.length / 30), 10)
    const buttonClass = 'red' + percentChanged.toString()
    return (
      <div id="changes">
        <AoPopupPanel
          tooltipText="Changes"
          tooltipPlacement="bottom"
          panelPlacement="bottom"
          id="tour-missions"
          buttonClass={buttonClass}>
          <React.Fragment>
            <h2>Changes</h2>
            <div className="toolbar">
              {this.renderSortButton('alphabetical', 'A-Z')}
              {this.renderSortButton('hodls', 'Hodls')}
              {this.renderSortButton('age', 'Order')}
            </div>
            {this.renderChangesList}
          </React.Fragment>
        </AoPopupPanel>
      </div>
    )
  }
}
