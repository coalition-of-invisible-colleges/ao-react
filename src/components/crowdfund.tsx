import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import { HudStyle } from './cardHud'
import Chest from '../assets/images/chest.svg'

interface Props {
  taskId: string
  hudStyle: HudStyle
}

interface State {
  editing: boolean
  text: string
}

export const defaultState: State = {
  editing: false,
  text: '',
}

@observer
export default class AoCrowdfund extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = defaultState
    this.startEditing = this.startEditing.bind(this)
    this.stopEditing = this.stopEditing.bind(this)
    this.saveGoal = this.saveGoal.bind(this)
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
    if (!card) return null

    if (card.goal) {
      this.setState({
        text: card.goal.toString(),
      })
    }
    this.setState({ editing: true })
  }

  stopEditing() {
    this.setState({ editing: false })
  }

  saveGoal(event) {
    event.stopPropagation()

    const taskId = this.props.taskId
    const card = aoStore.hashMap.get(taskId)
    if (!card) return null

    let newGoal: number =
      this.state.text.length > 0 ? parseInt(this.state.text, 10) : 0
    if (newGoal === card.goal) {
      this.setState({ editing: false })
      return
    }
    if (newGoal !== NaN) {
      api.setCardProperty(taskId, 'goal', newGoal)
      this.setState({ editing: false })
    }
  }

  onKeyDown(event) {
    if (event.key === 'Enter') {
      event.stopPropagation()
      this.saveGoal(event)
    } else if (event.key === 'Escape') {
      event.stopPropagation()
      this.setState({ editing: false, text: '' })
    }
  }

  onChange(event) {
    this.setState({ text: event.target.value })
  }

  render() {
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card) return null

    const bonus = card.boost || 0
    const hasPoints = bonus > 0

    const goal = card.hasOwnProperty('goal') && card.goal >= 0 ? card.goal : 0
    const hasGoal = goal > 0

    const pointsSlashGoal = (
      <span>
        {hasPoints ? bonus : hasGoal ? '0' : ''}
        {hasGoal && '/'}
        {hasGoal && goal}
      </span>
    )

    if (this.state.editing) {
      return (
        <div className="goal">
          <input
            type="text"
            onChange={this.onChange}
            onKeyDown={this.onKeyDown}
            value={this.state.text}
            size={3}
            autoFocus
          />
          <button type="button" onClick={this.saveGoal}>
            Set Goal
          </button>
        </div>
      )
    }
    switch (this.props.hudStyle) {
      case 'full before':
        if (hasGoal || hasPoints) {
          return (
            <div onClick={this.startEditing} className="goal full action">
              {pointsSlashGoal} points
            </div>
          )
        }
        return null
      case 'mini before':
        if (hasGoal || hasPoints) {
          return <span className="goal mini">{pointsSlashGoal}</span>
        }
        return null
      case 'menu':
        return (
          <div className="goal menu">
            <div onClick={this.startEditing} className="action">
              <img src={Chest} />
              {hasGoal ? 'Goal: ' + goal : 'set crowdfund goal'}
            </div>
          </div>
        )
      case 'face before':
      case 'collapsed':
      case 'collapsed-mission':
      case 'context':
      default:
        if (hasGoal || hasPoints) {
          return (
            <div className={'goal summary ' + this.props.hudStyle}>
              {pointsSlashGoal}
            </div>
          )
        }
        return null
    }
  }
}
