import * as React from 'react'
import { observer } from 'mobx-react'
import { computed, makeObservable } from 'mobx'
import aoStore from '../client/store'
import api from '../client/api'
import { HudStyle } from './cardHud'
import CheckmarkRecurring from '../assets/images/checkmarkRecurring.svg'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'

interface Props {
  taskId: string
  hudStyle: HudStyle
}

interface State {
  text: string
  error?: boolean
}

@observer
export default class AoInterval extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    makeObservable(this)
    const card = aoStore.hashMap.get(this.props.taskId)
    if (card) {
      this.state = {
        text: card.claimInterval > 0 ? card.claimInterval.toString() : '',
      }
    } else {
      this.state = { text: '' }
    }

    this.saveValue = this.saveValue.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
  }

  saveValue() {
    event.stopPropagation()
    const taskId = this.props.taskId
    if (this.state.text.length < 1) {
      api.setClaimInterval(taskId, null)
    }
    const card = aoStore.hashMap.get(taskId)
    if (!card) {
      return
    }
    let newValue = parseFloat(this.state.text)
    if (newValue === card.claimInterval) {
      return
    }
    if (newValue !== NaN) {
      api.setClaimInterval(taskId, newValue)
    }
  }

  onKeyDown(event) {
    if (event.key === 'Enter') {
      event.stopPropagation()
      this.saveValue()
    } else if (event.key === 'Escape') {
      event.stopPropagation()
      this.setState({ text: '' })
    }
  }

  onChange(event) {
    this.setState({ text: event.target.value })
    const days = parseFloat(event.target.value)
    if (days === NaN) {
      this.setState({ error: true })
    } else {
      this.setState({ error: false })
    }
  }

  @computed get isGrabbed() {
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card) return undefined
    return card.deck.indexOf(aoStore.member.memberId) >= 0
  }

  render() {
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card) {
      return null
    }
    switch (this.props.hudStyle) {
      case 'menu':
        const changedAndValid =
          !this.state.error &&
          parseFloat(this.state.text) !== card.claimInterval
        const setUncheckThisCard = (event) => {
          if(!event.target) return
          console.log('checked is', event.target.checked)
          api.setCardProperty(this.props.taskId, 'uncheckThisCard', event.target.checked)
        }
        const setUncheckPriorities = (event) => {
          if(!event.target) return
          api.setCardProperty(this.props.taskId, 'uncheckPriorities', event.target.checked)
        }
        const setUncheckPinned = (event) => {
          if(!event.target) return
          api.setCardProperty(this.props.taskId, 'uncheckPinned', event.target.checked)
        }
        const setDimChecked = (event) => {
          if(!event.target) return
          api.setCardProperty(this.props.taskId, 'dimChecked', event.target.checked)
        }
        return (
          <div className="claimInterval menu">
            <div>
              <img
                src={CheckmarkRecurring}
                alt="a checkmark with two circular arrows around it"
              />
              uncheck every{' '}
              <input
                type="text"
                onChange={this.onChange}
                onKeyDown={this.onKeyDown}
                value={this.state.text}
                size={2}
                autoFocus
              />{' '}
              hours
              <button
                type="button"
                className="action inline"
                onClick={this.saveValue}
                disabled={!changedAndValid}>
                Set
              </button>
            </div>
            <div className='leftItem'><input type="checkbox" id="uncheckThisCard" checked={card?.uncheckThisCard} onChange={setUncheckThisCard} /><label htmlFor="uncheckThisCard">Uncheck this card</label></div>
            <div className='leftItem'><input type="checkbox" id="uncheckPriorities" checked={card?.uncheckPriorities} onChange={setUncheckPriorities} /><label htmlFor="uncheckPriorities">Uncheck priorities within this card</label></div>
            <div className='leftItem'><input type="checkbox" id="uncheckPinned" checked={card?.uncheckPinned} onChange={setUncheckPinned} /><label htmlFor="uncheckPinned">Uncheck pinned cards within this card</label></div>
            <div className='leftItem'><input type="checkbox" id="dimChecked" checked={card?.dimChecked} onChange={setDimChecked} /><label htmlFor="dimChecked">Dim already checked pinned cards (requires refresh)</label></div>
            <p><small>Cards are reset at five minute intervals.</small></p>
            <p><small>Timer for this card resets whenever this card is checked or unchecked (or fob tapped for member/resource).</small></p>
          </div>
        )
      default:
        if (!card.claimInterval || card.claimInterval <= 0 || !this.isGrabbed) {
          return null
        }
        const tooltip =
          'uncheck will trigger every ' + card.claimInterval + ' hours'
        return (
          <div className="claimInterval full">
            <Tippy
              placement="top"
              delay={[475, 200]}
              theme="translucent"
              content={tooltip}
              appendTo={document.getElementById('root')}>
              <img
                src={CheckmarkRecurring}
                alt="a checkmark with two circular arrows around it"
              />
            </Tippy>
          </div>
        )
    }
  }
}
