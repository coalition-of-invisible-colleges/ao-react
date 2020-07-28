import * as React from 'react'
import { observer } from 'mobx-react'
import { Redirect } from 'react-router-dom'
import aoStore, { AoState, Task } from '../client/store'
import api from '../client/api'
import { ObservableMap } from 'mobx'
import { delay, cancelablePromise, noop } from '../utils'
import AoStack from './stack'
import { hideAll } from 'tippy.js'
import InfiniteScroll from 'react-infinite-scroll-component'
import AoContextCard from './contextCard'
import { TaskContext } from './taskContext'
import AoDragZone from './dragZone'

interface State {
  query: string
  results: Task[]
  redirect?: string
  items: JSX.Element[]
}

export const defaultState: State = {
  query: '',
  results: [],
  redirect: undefined,
  items: []
}

@observer
export default class AoSearch extends React.Component<{}, State> {
  constructor(props) {
    super(props)
    this.state = defaultState
    this.onChange = this.onChange.bind(this)
    this.onSearch = this.onSearch.bind(this)
    this.updateResults = this.updateResults.bind(this)
    this.componentDidMount = this.componentDidMount.bind(this)
    this.focus = this.focus.bind(this)
    this.scrollMore = this.scrollMore.bind(this)
    this.renderItems = this.renderItems.bind(this)
  }

  private searchBox = React.createRef<HTMLInputElement>()

  pendingPromises = []

  appendPendingPromise = promise =>
    (this.pendingPromises = [...this.pendingPromises, promise])

  removePendingPromise = promise =>
    (this.pendingPromises = this.pendingPromises.filter(p => p !== promise))

  clearPendingPromises = () => this.pendingPromises.map(p => p.cancel())

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
    this.setState({ query: event.target.value })
    this.updateResults()
  }

  updateResults() {
    aoStore.updateSearchResults(this.state.query.trim())
    const firstResults = aoStore.searchResults.slice(0, 10)
    this.setState({ items: this.renderItems(firstResults) })
    console.log('updateResults length is ', this.state.items.length)
  }

  scrollMore() {
    const index = this.state.items.length
    const nextResults = aoStore.searchResults.slice(index, index + 5)
    console.log('nextResults is ', nextResults)
    this.setState({
      items: this.state.items.concat(this.renderItems(nextResults))
    })
    console.log('scrollMore length is ', this.state.items.length)
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
    if (aoStore.searchResults.length < 1) {
      return ''
    }

    return (
      <div id={'searchResults'} className={'results'}>
        <InfiniteScroll
          dataLength={this.state.items.length}
          next={this.scrollMore}
          scrollableTarget={'searchResults'}
          hasMore={true}
          loader={<h4>Loading...</h4>}
          endMessage={<p style={{ textAlign: 'center' }}>End of results</p>}>
          {this.state.items}
        </InfiniteScroll>
      </div>
    )
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
