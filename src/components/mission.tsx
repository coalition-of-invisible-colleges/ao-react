import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore, { AoState } from '../client/store'
import api from '../client/api'
import { ObservableMap } from 'mobx'
import { HudStyle } from './cardHud'
import Badge from '../assets/images/badge.svg'

interface State {
  editing: boolean
  text: string
}

export const defaultState: State = {
  editing: false,
  text: ''
}

interface MissionProps {
  taskId: string
  hudStyle: HudStyle
}

@observer
export default class AoMission extends React.Component<MissionProps, State> {
  constructor(props) {
    super(props)
    this.state = defaultState
    this.startEditing = this.startEditing.bind(this)
    this.saveMission = this.saveMission.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
  }

  startEditing(event) {
    event.stopPropagation()
    if (aoStore.hashMap.get(this.props.taskId).guild) {
      this.setState({
        text: aoStore.hashMap.get(this.props.taskId).guild
      })
    }
    this.setState({ editing: true })
  }

  saveMission(event) {
    event.stopPropagation()
    if (this.state.text === aoStore.hashMap.get(this.props.taskId).guild) {
      this.setState({ editing: false })
      return
    }
    api.titleMissionCard(this.props.taskId, this.state.text)
    this.setState({ editing: false })
  }

  onKeyDown(event) {
    if (event.key === 'Enter') {
      this.saveMission(event)
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
        <div className="mission">
          <input
            type="text"
            onChange={this.onChange}
            onKeyDown={this.onKeyDown}
            value={this.state.text}
            size={18}
            autoFocus
          />
          <button type="button" onClick={this.saveMission}>
            Title Mission
          </button>
        </div>
      )
    }
    switch (this.props.hudStyle) {
      case 'full before':
        if (!aoStore.hashMap.get(this.props.taskId).guild) {
          return null
        }
        return (
          <div onClick={this.startEditing} className={'mission full action'}>
            <img className="badge" src={Badge} />
            {aoStore.hashMap.get(this.props.taskId).guild}
          </div>
        )
      case 'mini before':
        if (aoStore.hashMap.get(this.props.taskId).guild) {
          return (
            <span className={'mission mini'}>
              <img className="badge" src={Badge} />
              {aoStore.hashMap.get(this.props.taskId).guild}
            </span>
          )
        }
        return null
      case 'menu':
        return (
          <div className={'mission menu'}>
            <div onClick={this.startEditing} className={'action'}>
              <img className="badge" src={Badge} />
              {aoStore.hashMap.get(this.props.taskId).guild
                ? aoStore.hashMap.get(this.props.taskId).guild
                : 'add mission title'}
            </div>
          </div>
        )
      case 'face before':
      case 'collapsed':
      default:
        if (aoStore.hashMap.get(this.props.taskId).guild) {
          return (
            <div className={'mission summary ' + this.props.hudStyle}>
              <img className="badge" src={Badge} />
              {aoStore.hashMap.get(this.props.taskId).guild}
            </div>
          )
        }
        return null
    }
  }
}
