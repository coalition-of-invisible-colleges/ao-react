import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import { HudStyle } from './cardHud'
import Badge from '../assets/images/badge.svg'

interface MissionProps {
  taskId: string
  hudStyle: HudStyle
}

interface State {
  editing: boolean
  text: string
}

export const defaultState: State = {
  editing: false,
  text: ''
}

@observer
export default class AoMission extends React.PureComponent<
  MissionProps,
  State
> {
  constructor(props) {
    super(props)
    this.state = defaultState
    this.startEditing = this.startEditing.bind(this)
    this.stopEditing = this.stopEditing.bind(this)
    this.saveMission = this.saveMission.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
  }

  componentDidMount() {
    aoStore.registerCloseable(this.stopEditing)
  }

  componentWillUnmount() {
    aoStore.unregisterCloseable(this.stopEditing)
  }

  startEditing(event) {
    event.stopPropagation()

    const card = aoStore.hashMap.get(this.props.taskId)

    if (card.guild) {
      this.setState({
        text: card.guild
      })
    }
    this.setState({ editing: true })
  }

  stopEditing() {
    if (this.state.editing) {
      this.setState({ editing: false, text: '' })
    }
  }

  saveMission(event) {
    event.stopPropagation()

    const card = aoStore.hashMap.get(this.props.taskId)

    if (this.state.text === card.guild) {
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
      this.stopEditing()
    }
  }

  onChange(event) {
    this.setState({ text: event.target.value })
  }

  render() {
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card) return null

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
        if (!card.guild) {
          return null
        }
        return (
          <div onClick={this.startEditing} className={'mission full action'}>
            <img className="badge" src={Badge} />
            {card.guild}
          </div>
        )
      case 'mini before':
        if (card.guild) {
          return (
            <span className={'mission mini'}>
              <img className="badge" src={Badge} />
              {card.guild}
            </span>
          )
        }
        return null
      case 'badge':
        if (card.guild) {
          return <span className={'mission badge'}>{card.guild}</span>
        }
        return null
      case 'menu':
        return (
          <div className={'mission menu'}>
            <div onClick={this.startEditing} className={'action'}>
              <img className="badge" src={Badge} />
              {card.guild ? card.guild : 'add mission title'}
            </div>
          </div>
        )
      case 'face before':
      case 'collapsed':
      default:
        if (card.guild) {
          return (
            <div className={'mission summary ' + this.props.hudStyle}>
              <img className="badge" src={Badge} />
              {card.guild}
            </div>
          )
        }
        return null
    }
  }
}
