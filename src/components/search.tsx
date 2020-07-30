import * as React from 'react'
import { computed, autorun } from 'mobx'
import { observer } from 'mobx-react'
import { Redirect } from 'react-router-dom'
import aoStore, {
  AoState,
  Task,
  SearchResults,
  emptySearchResults
} from '../client/store'
import api from '../client/api'
import { ObservableMap } from 'mobx'
import AoStack from './stack'
import { hideAll } from 'tippy.js'
import InfiniteScroll from 'react-infinite-scroll-component'
import AoContextCard from './contextCard'
import { TaskContext } from './taskContext'
import AoDragZone from './dragZone'

type SearchSort = 'alphabetical' | 'hodls' | 'oldest' | 'newest'

interface State {
  query: string
  redirect?: string
  sort: SearchSort
  items?: number
  hasMore: boolean
}

export const defaultState: State = {
  query: '',
  sort: 'newest',
  redirect: undefined,
  items: undefined,
  hasMore: true
}

@observer
export default class AoSearch extends React.Component<{}, State> {
  constructor(props) {
    super(props)
    this.state = defaultState
    this.componentDidMount = this.componentDidMount.bind(this)
    this.focus = this.focus.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onSearch = this.onSearch.bind(this)
    this.scrollMore = this.scrollMore.bind(this)
    this.sortBy = this.sortBy.bind(this)
    this.renderItems = this.renderItems.bind(this)
    this.renderSortButton = this.renderSortButton.bind(this)
  }

  private searchBox = React.createRef<HTMLInputElement>()

  componentDidMount() {
    this.searchBox.current.select()
    ;(this.searchBox.current as any).onsearch = this.onSearch
    ;(this.searchBox.current as any).incremental = true
  }

  focus() {
    this.searchBox.current.select()
  }

  onChange(event) {
    this.setState({ query: event.target.value })
  }

  onSearch(event) {
    const query = event.target.value
    if (query.length === 1) {
      // For snappier performance, you must type at least two characters to search
      return
    }

    aoStore.updateSearchResults(query)
    this.setState({ query: query, items: query.length >= 1 ? 10 : undefined })
  }

  @computed get sortedResults() {
    if (!aoStore.searchResults || aoStore.searchResults.length < 1) {
      return emptySearchResults
    }

    let sortedResults = emptySearchResults

    switch (this.state.sort) {
      case 'alphabetical':
        sortedResults.missions = aoStore.searchResults.missions
          .slice()
          .sort((a, b) => {
            return a.name.localeCompare(b.name, undefined, {
              sensitivity: 'base'
            })
          })
        sortedResults.members = aoStore.searchResults.members
          .slice()
          .sort((a, b) => {
            return a.name.localeCompare(b.name, undefined, {
              sensitivity: 'base'
            })
          })
        sortedResults.tasks = aoStore.searchResults.tasks
          .slice()
          .sort((a, b) => {
            return a.name.localeCompare(b.name, undefined, {
              sensitivity: 'base'
            })
          })

        break
      case 'hodls':
        sortedResults.missions = aoStore.searchResults.missions
          .slice()
          .sort((a, b) => {
            return b.deck.length - a.deck.length
          })
        sortedResults.members = aoStore.searchResults.members
          .slice()
          .sort((a, b) => {
            return b.deck.length - a.deck.length
          })
        sortedResults.tasks = aoStore.searchResults.tasks
          .slice()
          .sort((a, b) => {
            return b.deck.length - a.deck.length
          })

        break
      case 'oldest':
        // Default sort is card creation order
        return aoStore.searchResults
      case 'newest':
        sortedResults.missions = aoStore.searchResults.missions
          .slice()
          .reverse()
        sortedResults.members = aoStore.searchResults.members.slice().reverse()
        sortedResults.tasks = aoStore.searchResults.tasks.slice().reverse()
        break
    }
    sortedResults.all = sortedResults.missions.concat(
      sortedResults.members,
      sortedResults.tasks
    )
    sortedResults.length = sortedResults.all.length

    return sortedResults
  }

  scrollMore() {
    const index = this.state.items
    const nextResults = this.sortedResults.all.slice(index, index + 5)
    let hasMore = true
    if (index + 5 > this.sortedResults.length) {
      hasMore = false
    }
    this.setState({
      items: index + 5,
      hasMore: hasMore
    })
  }

  sortBy(sort: SearchSort) {
    if (this.state.sort === sort) {
      return
    }
    this.setState({ sort: sort })
  }

  renderItems(items) {
    return items.map((task, i) => (
      <TaskContext.Provider value={task} key={task.taskId}>
        <AoDragZone
          dragContext={{
            zone: 'panel',
            y: i
          }}>
          <AoContextCard cardStyle={'priority'} noFindOnPage={true} />
        </AoDragZone>
      </TaskContext.Provider>
    ))
  }

  renderSearchResults() {
    if (this.state.items === undefined) {
      return ''
    }

    if (this.sortedResults.length === 0) {
      if (this.state.query && this.state.query.length >= 1) {
        return (
          <div id={'searchResults'} className={'results'}>
            0 results
          </div>
        )
      }
    }

    return (
      <React.Fragment>
        {this.sortedResults.length >= 2 ? (
          <div className={'toolbar'}>
            {this.renderSortButton('newest', 'Newest')}
            {this.renderSortButton('alphabetical', 'A-Z')}
            {this.renderSortButton('hodls', 'Hodls')}
            {this.renderSortButton('oldest', 'Order')}
          </div>
        ) : (
          ''
        )}
        <div id={'searchResults'} className={'results'}>
          <div>
            {this.sortedResults.length}{' '}
            {this.sortedResults.length === 1
              ? 'search result'
              : 'search results'}
          </div>
          <InfiniteScroll
            dataLength={this.state.items}
            next={this.scrollMore}
            scrollableTarget={'searchResults'}
            hasMore={this.state.hasMore}
            loader={<h4>Loading...</h4>}
            endMessage={
              <p style={{ textAlign: 'center' }}>
                End of {this.sortedResults.length}{' '}
                {this.sortedResults.length === 1 ? 'result' : 'results'}
              </p>
            }>
            {this.renderItems(
              this.sortedResults.all.slice(0, this.state.items)
            )}
          </InfiniteScroll>
        </div>
      </React.Fragment>
    )
  }

  renderSortButton(sort: SearchSort, label: string) {
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

    return (
      <React.Fragment>
        <input
          ref={this.searchBox}
          type="search"
          onChange={this.onChange}
          value={this.state.query}
          size={36}
          placeholder={'search for a card'}
          autoFocus
        />
        {this.renderSearchResults()}
      </React.Fragment>
    )
  }
}
