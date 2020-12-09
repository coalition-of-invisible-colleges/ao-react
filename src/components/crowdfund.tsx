import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import { HudStyle } from './cardHud'

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
  text: ''
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
        text: card.goal.toString()
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
      this.saveGoal(event)
    } else if (event.key === 'Escape') {
      this.setState({ editing: false, text: '' })
    }
  }

  onChange(event) {
    this.setState({ text: event.target.value })
  }

  render() {
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card) return null

    const goal = card.hasOwnProperty('goal') && card.goal >= 0 ? card.goal : 0
    const hasGoal = goal > 0

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
        if (hasGoal) {
          return (
            <div onClick={this.startEditing} className="goal full action">
              {'Goal: ' + goal}
            </div>
          )
        }
        return null
      case 'mini before':
        if (hasGoal) {
          return <span className="goal mini">{'Goal: ' + goal}</span>
        }
        return null
      case 'menu':
        return (
          <div className="goal menu">
            <div onClick={this.startEditing} className="action">
              {hasGoal ? 'Goal: ' + goal : 'set crowdfund goal'}
            </div>
          </div>
        )
      case 'face before':
      case 'collapsed':
      default:
        if (hasGoal) {
          return (
            <div className={'goal summary ' + this.props.hudStyle}>
              {'Goal: ' + goal}
            </div>
          )
        }
        return null
    }
  }
}
