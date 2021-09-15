import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
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
export default class AoFob extends React.PureComponent<{}, State> {
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
    this.setState({ editing: true })
  }

  saveValue(event) {
    event.stopPropagation()
    if (this.state.text.length <= 0) {
      this.setState({ editing: false })
      return
    }
    api.updateMemberField('fob', this.state.text)
    this.setState({ editing: false })
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
        <div className="fob">
          <input
            type="text"
            onChange={this.onChange}
            onKeyDown={this.onKeyDown}
            value={this.state.text}
            size={15}
            autoFocus
          />
          <button type="button" onClick={this.saveValue}>
            Change Fob
          </button>
        </div>
      )
    }
    return (
      <div className={'fob menu'}>
        <div onClick={this.startEditing} className={'action'}>
          Change Fob
        </div>
      </div>
    )
  }
}
