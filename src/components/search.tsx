import * as React from 'react'
import { observer } from 'mobx-react'
import { Redirect } from 'react-router-dom'
import aoStore, { AoState, Task } from '../client/store'
import api from '../client/api'
import { ObservableMap } from 'mobx'
import { delay, cancelablePromise, noop } from '../utils'
import AoSmartZone from './smartZone'
import MagnifyingGlass from '../assets/images/search.svg'

interface State {
  searchPanel: boolean
  query: string
  results: Task[]
}

export const defaultState: State = {
  searchPanel: false,
  query: '',
  results: []
}

@observer
export default class AoSearch extends React.Component<{}, State> {
  constructor(props) {
    super(props)
    this.state = defaultState
    this.toggleSearchPanel = this.toggleSearchPanel.bind(this)
    this.onChange = this.onChange.bind(this)
    this.renderSearchButton = this.renderSearchButton.bind(this)
    this.updateResults = this.updateResults.bind(this)
  }

  pendingPromises = []

  appendPendingPromise = promise =>
    (this.pendingPromises = [...this.pendingPromises, promise])

  removePendingPromise = promise =>
    (this.pendingPromises = this.pendingPromises.filter(p => p !== promise))

  clearPendingPromises = () => this.pendingPromises.map(p => p.cancel())

  toggleSearchPanel() {
    this.setState({ searchPanel: !this.state.searchPanel })
  }

  onChange(event) {
    console.log('on change value is ', event.target.value)
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

  renderSearchButton() {
    return (
      <div className={'actionCircle'}>
        <img src={MagnifyingGlass} onClick={this.toggleSearchPanel} />
      </div>
    )
  }

  renderSearchResults() {
    if (aoStore.searchResults.length < 1) {
      return ''
    }

    const results = aoStore.searchResults
      .slice()
      .reverse()
      .map((task, i) => (
        <AoSmartZone taskId={task.taskId} y={i} key={i} cardSource={'search'} />
      ))

    return <div className={'results'}>{results}</div>
  }

  render() {
    if (!this.state.searchPanel) {
      return <div id={'search'}>{this.renderSearchButton()}</div>
    }

    return (
      <div id={'search'} className={'open'}>
        <input
          type="text"
          onChange={this.onChange}
          value={this.state.query}
          size={20}
          placeholder={'search for a card'}
          autoFocus
        />
        {this.renderSearchResults()}
        {this.renderSearchButton()}
      </div>
    )
  }
}