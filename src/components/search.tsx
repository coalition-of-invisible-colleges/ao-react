import * as React from 'react'
import { observer } from 'mobx-react'
import { Redirect } from 'react-router-dom'
import aoStore, { AoState, Task } from '../client/store'
import api from '../client/api'
import { ObservableMap } from 'mobx'
import { delay, cancelablePromise, noop } from '../utils'
import MagnifyingGlass from '../assets/images/search.svg'
import AoPopupPanel from './popupPanel'
import AoStack from './stack'
import { hideAll } from 'tippy.js'

interface State {
  query: string
  results: Task[]
  redirect?: string
}

export const defaultState: State = {
  query: '',
  results: [],
  redirect: undefined
}

@observer
export default class AoSearch extends React.Component<{}, State> {
  constructor(props) {
    super(props)
    this.state = defaultState
    this.onChange = this.onChange.bind(this)
    this.updateResults = this.updateResults.bind(this)
    this.onSearchPanelOpen = this.onSearchPanelOpen.bind(this)
  }

  private searchBox = React.createRef<HTMLInputElement>()

  pendingPromises = []

  appendPendingPromise = promise =>
    (this.pendingPromises = [...this.pendingPromises, promise])

  removePendingPromise = promise =>
    (this.pendingPromises = this.pendingPromises.filter(p => p !== promise))

  clearPendingPromises = () => this.pendingPromises.map(p => p.cancel())

  onSearchPanelOpen() {
    this.searchBox.current.select()
  }

  onChange(event) {
    this.setState({ query: event.target.value })
    this.clearPendingPromises()
    const debounce = cancelablePromise(delay(500))
    this.appendPendingPromise(debounce)
    return debounce.promise
      .then(() => {
        this.updateResults()
        this.removePendingPromise(debounce)
      })
      .catch(errorInfo => {
        this.removePendingPromise(debounce)
        if (!errorInfo.isCanceled) {
          throw errorInfo.error
        }
      })
  }

  updateResults() {
    aoStore.updateSearchResults(this.state.query.trim())
  }

  renderSearchResults() {
    if (aoStore.searchResults.length < 1) {
      return ''
    }

    const results = aoStore.searchResults.slice().reverse()

    return (
      <div className={'results'}>
        <AoStack cards={results} cardStyle={'priority'} alwaysShowAll={true} />
      </div>
    )
  }

  render() {
    if (this.state.redirect !== undefined) {
      this.setState({ redirect: undefined })
      return <Redirect to={this.state.redirect} />
    }

    return (
      <div id={'search'}>
        <AoPopupPanel
          iconSrc={MagnifyingGlass}
          tooltipText={'Search'}
          tooltipPlacement={'right'}
          panelPlacement={'right'}
          onShown={this.onSearchPanelOpen}>
          <input
            ref={this.searchBox}
            type="text"
            onChange={this.onChange}
            value={this.state.query}
            size={36}
            placeholder={'search for a card'}
            autoFocus
          />
          {this.renderSearchResults()}
        </AoPopupPanel>
      </div>
    )
  }
}
