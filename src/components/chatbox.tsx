import * as React from 'react'
import { computed, makeObservable } from 'mobx';
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import AoPopupPanel from './popupPanel'
import Pepe from '../assets/images/pepe.svg'
import AoStack from './stack'
import AoPaper from './paper'
import AoMemberIcon from './memberIcon'
import AoCardComposer from './cardComposer'

interface Props {
  taskId: string
}

interface State {
  page: number
  text: string
  color: string
}

export const defaultState: State = {
  page: 0,
  text: '',
  color: 'blue'
}

@observer
export default class AoChatbox extends React.Component<Props, State> {
  private shitpostBox = React.createRef<AoCardComposer>()

  constructor(props) {
    super(props)
    makeObservable(this);
    this.state = defaultState
    this.focusShitpostBox = this.focusShitpostBox.bind(this)
    this.shitpost = this.shitpost.bind(this)
    this.setColor = this.setColor.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onChange = this.onChange.bind(this)
  }

  focusShitpostBox(instance?) {
    this.shitpostBox.current.focus()
  }

  shitpost(shit: string) {
    const taskId = this.props.taskId
    const card = aoStore.hashMap.get(taskId)

    if (!card) {
      console.log('Missing card in chatbox')
    }

    api.findOrCreateCardInCard(shit, card.taskId, false, this.state.color, true)
    this.setState({ text: '' })
  }

  @computed get shitpostsHere() {
    const taskId = this.props.taskId
    const card = aoStore.hashMap.get(taskId)

    if (!card) {
      console.log('Missing card in chatbox')
      return null
    }

    let shitposts = []

    if (card) {
      ;[...card.priorities, ...card.subTasks, ...card.completed].forEach(st => {
        const subCard = aoStore.hashMap.get(st)
        if (!subCard) {
          console.log('Missing subcard in chatbox')
          return
        }
        if (subCard.deck && subCard.deck.length <= 0) {
          shitposts.push(aoStore.hashMap.get(st))
        }
      })
    }

    shitposts.sort((a, b) => {
      return b.created - a.created
    })

    return shitposts
  }

  setColor(event) {
    this.setState({ color: event.currentTarget.getAttribute('data-color') })
    this.focusShitpostBox()
  }

  onKeyDown(event) {
    if (event.key === 'Enter') {
      this.shitpost(this.state.text)
    }
  }

  onChange(newValue) {
    this.setState({ text: newValue })
  }

  // This doesn't make sense because there isn't currently a Creator: filed on cards
  // And cards only show up in the chat box if they have 0 hodls / 0-length .deck
  // @computed get authorDecorator() {
  //   const taskId = this.props.taskId
  //   const card = aoStore.hashMap.get(taskId)
  //   if (!card) return null

  //   let renderedNames = {}
  //   ;[...card.priorities, ...card.subTasks, ...card.completed].forEach(
  //     (tId, i) => {
  //       if (!tId) {
  //         return
  //       }

  //       const subCard = aoStore.hashMap.get(tId)
  //       if (!subCard || !subCard.hasOwnProperty('deck')) {
  //         console.log('authordecorator 3.2')

  //         return
  //       }

  //       console.log('name is ', subCard.name)

  //       if (subCard.deck.length >= 1) {
  //         console.log('authordecorator 3.2.5 deck is ', subCard.deck)

  //         return
  //       }

  //       const firstHodlrMemberId = Object.keys(subCard.deck)[0]
  //       if (!firstHodlrMemberId) {
  //         console.log('authordecorator 3.3 memberid is ', firstHodlrMemberId)

  //         return
  //       }

  //       const firstHodlr = aoStore.memberById.get(firstHodlrMemberId)
  //       if (!firstHodlr) {

  //         return
  //       }

  //       const name = firstHodlr.name
  //       if (!name) {

  //         return
  //       }

  //       renderedNames[tId] = (
  //         <React.Fragment>
  //           <AoMemberIcon memberId={firstHodlrMemberId} /> {name}
  //         </React.Fragment>
  //       )
  //     }
  //   )
  //   return renderedNames
  // }

  render() {
    const taskId = this.props.taskId
    const card = aoStore.hashMap.get(taskId)

    if (!card) {
      console.log('Missing card in chatbox')
      return null
    }

    const palette = ['red', 'yellow', 'green', 'blue', 'purple'].map(
      (colorName, i) => (
        <div
          onClick={this.setColor}
          data-color={colorName}
          className="swatch"
          key={i}>
          <div
            className={
              this.state.color === colorName ? 'border selected' : 'border'
            }>
            <AoPaper color={colorName} />
          </div>
        </div>
      )
    )

    return (
      <div className="chatbox">
        <AoCardComposer
          onNewCard={this.shitpost}
          onChange={this.onChange}
          placeholderText="type to chat..."
          ref={this.shitpostBox}
        />
        <div className="palette">{palette}</div>
        <AoStack
          cards={this.shitpostsHere}
          cardStyle="priority"
          alwaysShowAll={true}
          inId={taskId}
          zone="subTasks"
        />
      </div>
    )
  }
}
