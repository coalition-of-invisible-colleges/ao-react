import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore, { AoState } from '../client/store'
import api from '../client/api'
import { ObservableMap } from 'mobx'

interface State {
  editing: boolean
  text: string
  repeat: string
  match: boolean
}

export const defaultState: State = {
  editing: false,
  text: '',
  repeat: '',
  match: false
}

@observer
export default class AoPassword extends React.Component<{}, State> {
  constructor(props) {
    super(props)
    this.state = defaultState
    this.startEditing = this.startEditing.bind(this)
    this.saveValue = this.saveValue.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onChangeRepeat = this.onChangeRepeat.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
  }

  startEditing(event) {
    event.stopPropagation()
    this.setState({ editing: true, text: '', repeat: '' })
  }

  saveValue(event) {
    event.stopPropagation()
    if (this.state.text.length <= 0 || this.state.text !== this.state.repeat) {
      this.setState({ editing: false })
      return
    }
    api.updateMemberField('secret', this.state.text)
    this.setState({ editing: false })
  }

  onKeyDown(event) {
    if (event.key === 'Enter') {
      this.saveValue(event)
    } else if (event.key === 'Escape') {
      this.setState({ editing: false, text: '', repeat: '' })
    }
  }

  onChange(event) {
    this.setState({ text: event.target.value })
  }

  onChangeRepeat(event) {
    this.setState({ repeat: event.target.value })
  }

  render() {
    if (this.state.editing) {
      return (
        <div className="password">
          <label htmlFor={'passwordOnce'}>password: </label>
          <input
            id={'passwordOnce'}
            type="password"
            onChange={this.onChange}
            onKeyDown={this.onKeyDown}
            value={this.state.text}
            size={18}
            autoFocus
          />
          <label htmlFor={'passwordTwice'}>repeat: </label>
          <input
            id={'passwordTwice'}
            type="password"
            onChange={this.onChangeRepeat}
            onKeyDown={this.onKeyDown}
            value={this.state.repeat}
            size={18}
          />
          <button
            type="button"
            onClick={this.saveValue}
            disabled={this.state.text !== this.state.repeat}>
            Change Password
          </button>
        </div>
      )
    }
    return (
      <div className={'password menu'}>
        <div onClick={this.startEditing} className={'action'}>
          Change Password
        </div>
      </div>
    )
  }
}
