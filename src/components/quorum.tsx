import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore, { AoState } from '../client/store'
import api from '../client/api'

interface State {
  editing: boolean
  text: string
}

export const defaultState: State = {
  editing: false,
  text: ''
}

@observer
export default class AoServerName extends React.PureComponent<{}, State> {
  constructor(props) {
    super(props)
    this.state = defaultState
    this.startEditing = this.startEditing.bind(this)
    this.saveValue = this.saveValue.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
  }

  startEditing(event) {
    event.stopPropagation()
    if (aoStore.state.cash.quorum) {
      this.setState({
        text: aoStore.state.cash.quorum.toString()
      })
    }
    this.setState({ editing: true })
  }

  saveValue(event) {
    event.stopPropagation()
    let newValue: number =
      this.state.text.length > 0 ? parseInt(this.state.text, 10) : 0
    console.log('newValue is ', newValue)
    if (newValue === aoStore.state.cash.quorum) {
      this.setState({ editing: false })
      return
    }
    if (newValue !== NaN) {
      api.setQuorum(newValue)
      this.setState({ editing: false })
    }
  }

  onKeyDown(event) {
    if (event.key === 'Enter') {
      this.saveValue(event)
    } else if (event.key === 'Escape') {
      this.setState({ editing: false, text: '' })
    }
  }

  onChange(event) {
    this.setState({ text: event.target.value })
  }

  render() {
    if (this.state.editing) {
      return (
        <div className="serverQuorum">
          <input
            type="text"
            onChange={this.onChange}
            onKeyDown={this.onKeyDown}
            value={this.state.text}
            size={1}
            autoFocus
          />
          <button type="button" onClick={this.saveValue}>
            Set Quorum
          </button>
        </div>
      )
    }
    return (
      <div className={'serverQuorum menu'}>
        <div onClick={this.startEditing} className={'action'}>
          {aoStore.state.cash.quorum}
        </div>
      </div>
    )
  }
}
