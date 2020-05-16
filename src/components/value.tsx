import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore, { AoState } from '../client/store'
import api from '../client/api'
import { ObservableMap } from 'mobx'
import { HudStyle } from './cardHud'

interface State {
  editing: boolean
  text: string
}

export const defaultState: State = {
  editing: false,
  text: ''
}

interface ValueParams {
  taskId: string
  hudStyle: HudStyle
}

@observer
export default class AoValue extends React.Component<ValueParams, State> {
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
    if (aoStore.hashMap.get(this.props.taskId).completeValue) {
      this.setState({
        text: aoStore.hashMap.get(this.props.taskId).completeValue.toString()
      })
    }
    this.setState({ editing: true })
  }

  saveValue(event) {
    event.stopPropagation()
    let newValue: number =
      this.state.text.length > 0 ? parseInt(this.state.text, 10) : 0
    if (newValue === aoStore.hashMap.get(this.props.taskId).completeValue) {
      this.setState({ editing: false })
      return
    }
    if (newValue !== NaN) {
      api.valueCard(this.props.taskId, newValue)
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
        <div className="value">
          <input
            type="text"
            onChange={this.onChange}
            onKeyDown={this.onKeyDown}
            value={this.state.text}
            size={1}
            autoFocus
          />
          <button type="button" onClick={this.saveValue}>
            Set Value
          </button>
        </div>
      )
    }
    switch (this.props.hudStyle) {
      case 'full before':
        return (
          <div onClick={this.startEditing} className={'value full action'}>
            {aoStore.hashMap.get(this.props.taskId).completeValue
              ? aoStore.hashMap.get(this.props.taskId).completeValue + ' points'
              : '+value'}
          </div>
        )
      case 'mini before':
        if (aoStore.hashMap.get(this.props.taskId).completeValue) {
          return (
            <span className={'value mini'}>
              {aoStore.hashMap.get(this.props.taskId).completeValue + 'p'}
            </span>
          )
        }
        return null
      case 'menu':
        return (
          <div className={'value menu'}>
            <div onClick={this.startEditing} className={'action'}>
              {aoStore.hashMap.get(this.props.taskId).completeValue
                ? 'worth ' +
                  aoStore.hashMap.get(this.props.taskId).completeValue +
                  ' points if checked'
                : 'set checkmark value'}
            </div>
          </div>
        )
      case 'face before':
      case 'collapsed':
      default:
        if (aoStore.hashMap.get(this.props.taskId).completeValue > 0) {
          return (
            <div className={'value summary ' + this.props.hudStyle}>
              {aoStore.hashMap.get(this.props.taskId).completeValue + 'p'}
            </div>
          )
        }
        return null
    }
  }
}
