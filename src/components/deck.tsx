import * as React from 'react'
import { computed } from 'mobx'
import { observer } from 'mobx-react'
import aoStore, { Task, emptySearchResults } from '../client/store'
import InfiniteScroll from 'react-infinite-scroller'
import AoContextCard from './contextCard'
import AoDragZone from './dragZone'

type SearchSort = 'alphabetical' | 'hodls' | 'oldest' | 'newest'

interface State {
  query: string
  sort: SearchSort
  items: number
  hasMore: boolean
  debounce?
}

export const defaultState: State = {
  query: '',
  sort: 'newest',
  items: 10,
  hasMore: true
}

const minQueryLength = 2

@observer
export default class AoDeck extends React.Component<{}, State> {
  constructor(props) {
    super(props)
    this.state = defaultState
    this.componentDidMount = this.componentDidMount.bind(this)
    this.focus = this.focus.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onSearch = this.onSearch.bind(this)
    this.scrollMore = this.scrollMore.bind(this)
    this.sortBy = this.sortBy.bind(this)
    this.renderItems = this.renderItems.bind(this)
    this.renderSortButton = this.renderSortButton.bind(this)
    this.renderSearchResults = this.renderSearchResults.bind(this)
  }

  private searchBox = React.createRef<HTMLInputElement>()

  componentDidMount() {
    this.searchBox.current.select()
    // ;(this.searchBox.current as any).onsearch = this.onSearch
    // ;(this.searchBox.current as any).incremental = true
  }

  focus() {
    this.searchBox.current.select()
  }

  onChange(event) {
    console.log('about to debounce')
    if (this.state.debounce) {
      clearTimeout(this.state.debounce)
    }

    this.setState({
      query: event.target.value,
      debounce: setTimeout(this.onSearch, 500)
    })
  }

  onKeyDown(event) {
    if (event.key === 'Escape') {
      // this should also close the entire search box tippy
      this.setState({ query: '' })
    }
  }

  onSearch() {
    const query = this.state.query
    console.log('search. query is ', query)
    if (query === undefined) {
      return
    }

    if (query === '') {
      this.setState({ query: '', items: defaultState.items })
      window.scrollTo(window.scrollX, window.scrollY + 1)
      window.scrollTo(window.scrollX, window.scrollY - 1)
      return
    }

    if (query.length === 1) {
      // For snappier performance, you must type at least two characters to search
      return
    }

    aoStore.updateSearchResults(query)
    const minResults =
      this.onlyMyResults.length >= 1
        ? Math.min(this.onlyMyResults.length, 10)
        : 0
    let itemCount
    if (query.length >= 1 && minResults >= 1) {
      itemCount = Math.min(minResults)
    }
    this.setState({ query: query, items: itemCount })

    // Hack to get the Tippy box to recalculate its position so it won't go offscreen
    window.scrollTo(window.scrollX, window.scrollY + 1)
    window.scrollTo(window.scrollX, window.scrollY - 1)
  }

  @computed get onlyMyResults() {
    let filteredResults = emptySearchResults

    const isGrabbed = taskId => {
      const card = aoStore.hashMap.get(taskId)
      if (!card) return null

      return card.deck.indexOf(aoStore.member.memberId) >= 0
    }

    if (!aoStore.searchResults) {
      return emptySearchResults
    }

    Object.entries(aoStore.searchResults).forEach(resultCategory => {
      const [categoryName, searchResults] = resultCategory
      if (categoryName === 'all' || categoryName === 'length') {
        return
      }
      filteredResults[categoryName] = aoStore.searchResults[
        categoryName
      ].filter(task => isGrabbed(task.taskId))
      console.log('filteredResults is ', filteredResults)
    })

    filteredResults.all = filteredResults.missions.concat(
      filteredResults.members,
      filteredResults.tasks
    )
    filteredResults.length = filteredResults.all.length
    console.log('filteredResults is ', filteredResults)

    return filteredResults
  }

  @computed get sortedResults() {
    if (!this.onlyMyResults || this.onlyMyResults.all.length < 1) {
      return emptySearchResults
    }

    let sortedResults = emptySearchResults

    switch (this.state.sort) {
      case 'alphabetical':
        sortedResults.missions = this.onlyMyResults.missions
          .slice()
          .sort((a, b) => {
            return a.name.localeCompare(b.name, undefined, {
              sensitivity: 'base'
            })
          })
        sortedResults.members = this.onlyMyResults.members
          .slice()
          .sort((a, b) => {
            return a.name.localeCompare(b.name, undefined, {
              sensitivity: 'base'
            })
          })
        sortedResults.tasks = this.onlyMyResults.tasks.slice().sort((a, b) => {
          return a.name.localeCompare(b.name, undefined, {
            sensitivity: 'base'
          })
        })

        break
      case 'hodls':
        sortedResults.missions = this.onlyMyResults.missions
          .slice()
          .sort((a, b) => {
            return b.deck.length - a.deck.length
          })
        sortedResults.members = this.onlyMyResults.members
          .slice()
          .sort((a, b) => {
            return b.deck.length - a.deck.length
          })
        sortedResults.tasks = this.onlyMyResults.tasks.slice().sort((a, b) => {
          return b.deck.length - a.deck.length
        })

        break
      case 'oldest':
        // Default sort is card creation order
        return this.onlyMyResults
      case 'newest':
        sortedResults.missions = this.onlyMyResults.missions.slice().reverse()
        sortedResults.members = this.onlyMyResults.members.slice().reverse()
        sortedResults.tasks = this.onlyMyResults.tasks.slice().reverse()
        break
    }
    sortedResults.all = sortedResults.missions.concat(
      sortedResults.members,
      sortedResults.tasks
    )
    sortedResults.length = sortedResults.all.length

    return sortedResults
  }

  @computed get sortedMyCards() {
    if (!aoStore.myCards || aoStore.myCards.length < 1) {
      return []
    }

    let sortedMyCards = []

    switch (this.state.sort) {
      case 'alphabetical':
        sortedMyCards = aoStore.myCards.slice().sort((a, b) => {
          return a.name.localeCompare(b.name, undefined, {
            sensitivity: 'base'
          })
        })
        break
      case 'hodls':
        sortedMyCards = aoStore.myCards.slice().sort((a, b) => {
          return b.deck.length - a.deck.length
        })
        break
      case 'oldest':
        // Default sort is card creation order
        return aoStore.myCards
      case 'newest':
        sortedMyCards = aoStore.myCards.slice().reverse()
        break
    }

    return sortedMyCards
  }

  scrollMore(page: number) {
    const newIndex = page * 5
    const hasMore =
      this.state.query.length >= minQueryLength
        ? this.sortedResults.length > newIndex
        : aoStore.myCards.length > newIndex
    this.setState({
      items: newIndex,
      hasMore: hasMore
    })
  }

  sortBy(event) {
    const sort = event.currentTarget.getAttribute('data-sort')
    if (this.state.sort === sort) {
      return
    }
    this.setState({ sort: sort })
  }

  renderItems(items) {
    let rendered = items.map((task, i) => (
      <AoDragZone
        taskId={task.taskId}
        dragContext={{
          zone: 'panel',
          y: i
        }}
        key={task.taskId}>
        <AoContextCard task={task} cardStyle="priority" noFindOnPage={true} />
      </AoDragZone>
    ))

    const showFinalSummary =
      this.state.query?.length >= minQueryLength
        ? items.length >= this.sortedResults.length
        : items.length >= aoStore.myCards.length

    if (showFinalSummary) {
      rendered.push(
        <p style={{ textAlign: 'center' }} key="summary">
          End of {this.sortedResults.length}{' '}
          {this.sortedResults.length === 1 ? 'result' : 'results'}
        </p>
      )
    }
    return rendered
  }

  renderSearchResults(searchResults) {
    if (this.state.items === undefined) {
      return ''
    }

    if (searchResults.length === 0) {
      if (this.state.query && this.state.query.length >= minQueryLength) {
        return (
          <div id="searchResults" className="results">
            0 results
          </div>
        )
      }
    }

    return (
      <React.Fragment>
        {searchResults.length >= 2 ? (
          <div className="toolbar">
            {this.renderSortButton('newest', 'Newest')}
            {this.renderSortButton('alphabetical', 'A-Z')}
            {this.renderSortButton('hodls', 'Hodls')}
            {this.renderSortButton('oldest', 'Order')}
          </div>
        ) : (
          ''
        )}
        <div id="searchResults" className="results">
          <div>
            {searchResults.length}{' '}
            {searchResults.length === 1 &&
            this.state.query.length >= minQueryLength
              ? 'search result'
              : 'cards in deck'}
          </div>
          <InfiniteScroll
            loadMore={this.scrollMore}
            useWindow={false}
            hasMore={this.state.hasMore}
            loader={<h4 key="heading">Loading...</h4>}>
            {this.renderItems(searchResults.slice(0, this.state.items))}
          </InfiniteScroll>
        </div>
      </React.Fragment>
    )
  }

  renderSortButton(sort: SearchSort, label: string) {
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

  render() {
    return (
      <React.Fragment>
        <input
          ref={this.searchBox}
          type="deck"
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          value={this.state.query}
          size={36}
          placeholder="search my cards"
          autoFocus
        />
        {this.state.query?.length >= minQueryLength
          ? this.renderSearchResults(this.sortedResults.all)
          : this.renderSearchResults(this.sortedMyCards)}
      </React.Fragment>
    )
  }
}
