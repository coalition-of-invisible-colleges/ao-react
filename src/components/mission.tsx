import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore, { Task } from '../client/store'
import { TaskContext } from './taskContext'
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
  hudStyle: HudStyle
}

@observer
export default class AoMission extends React.Component<MissionProps, State> {
  static contextType = TaskContext

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

    const { card, setRedirect } = this.context
    if (card.guild) {
      this.setState({
        text: card.guild
      })
    }
    this.setState({ editing: true })
  }

  stopEditing() {
    this.setState({ editing: false, text: '' })
  }

  saveMission(event) {
    event.stopPropagation()

    const { card, setRedirect } = this.context
    if (this.state.text === card.guild) {
      this.setState({ editing: false })
      return
    }
    api.titleMissionCard(card.taskId, this.state.text)
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
    const { card, setRedirect } = this.context

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
