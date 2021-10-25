import * as React from 'react'
import { observer } from 'mobx-react'
import { computed, makeObservable } from 'mobx'
import aoStore from '../client/store'
import api from '../client/api'
import AoMemberIcon from './memberIcon'
import { HudStyle } from './cardHud'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'
import Lilypad from '../assets/images/chatroom.svg'

interface Props {
  taskId: string
  hudStyle?: HudStyle
}

interface State {
  show?: boolean
  now: number
}

@observer
export default class AoChatroom extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    makeObservable(this)
    this.state = { show: false, now: Date.now() }
    this.hopHere = this.hopHere.bind(this)
    this.toggleChat = this.toggleChat.bind(this)
  }

  componentDidMount() {
    setInterval(() => {
      this.setState({ now: Date.now() })
    }, 5000)
  }

  hopHere() {
    api.visitCard(this.props.taskId, false)
    aoStore.setCurrentChatroom(null)
  }

  toggleChat() {
    if (aoStore.currentChatroom === this.props.taskId) {
      api.visitCard(this.props.taskId, false)
      aoStore.setCurrentChatroom(null)
    } else {
      aoStore.setCurrentChatroom(this.props.taskId)
      api.visitCard(this.props.taskId, true, true)
    }
  }

  @computed get renderAvatarList() {
    const taskId = this.props.taskId
    const card = aoStore.hashMap.get(taskId)
    if (!card || !card.hasOwnProperty('avatars') || card.avatars.length <= 0) {
      return null
    }

    const renderedAvatars = card.avatars.map(avatarLocation => {
      const { memberId, timestamp, area } = avatarLocation
      const member = aoStore.memberById.get(memberId)
      const name = member ? member.name : 'deleted member'

      const now = this.state.now
      const msSince = now - avatarLocation.timestamp
      const seconds = msSince / 1000

      if (area !== 1 || seconds >= 100) {
        return null
      }

      return (
        <div key={memberId}>
          <AoMemberIcon memberId={memberId} /> {name}{' '}
          {/*area === 1 && seconds <= 100 && <small>in chat</small>*/}
        </div>
      )
    })

    if (renderedAvatars.length <= 0) {
      return null
    }

    return (
      <React.Fragment>
        <h4>
          {renderedAvatars && renderedAvatars.length >= 1
            ? "Who's Here"
            : 'Join Room'}
        </h4>
        {renderedAvatars}
      </React.Fragment>
    )
  }

  @computed get shitpostCount() {
    const taskId = this.props.taskId
    const card = aoStore.hashMap.get(taskId)

    if (!card) {
      console.log('Missing card in lilypad')
      return null
    }

    let shitposts = 0

    if (card) {
      ;[...card.priorities, ...card.subTasks, ...card.completed].forEach(st => {
        const subCard = aoStore.hashMap.get(st)
        if (!subCard) {
          console.log('Missing subcard in lilypad')
          return
        }
        if (subCard.deck && subCard.deck.length <= 0) {
          shitposts++
        }
      })
    }

    return shitposts
  }

  render() {
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card) {
      console.log('Attempt to access chatroom on missing card.')
      return null
    }

    const cardPop = card.avatars ? card.avatars.length : 0

    const now = this.state.now

    const chatroomPop = card.avatars
      ? card.avatars.filter(avatarLocation => {
          const msSince = now - avatarLocation.timestamp
          const seconds = msSince / 1000
          return avatarLocation.area === 1 && seconds <= 70
        }).length
      : 0

    const youAreHere = card.avatars
      ? card.avatars.some(avatarLocation => {
          const msSince = now - avatarLocation.timestamp
          const seconds = msSince / 1000
          return (
            avatarLocation.memberId === aoStore.member.memberId &&
            avatarLocation.area === 1 &&
            seconds <= 70
          )
        })
      : false

    let button
    let altMessage
    if (!card.guild || card.guild.length <= 1) {
      return null
      // let message = youAreHere ? 'You Are Here' : 'Move Here'
      // button = (
      //   <div className="lilypad action" onClick={this.hopHere}>
      //     {message}
      //     {cardPop >= 1 && ' (' + cardPop + ')'}
      //   </div>
      // )
      // altMessage = 'Move your avatar here'
    } else if (this.props.hudStyle === 'menu') {
      if (!card.showChatroom) {
        const addChatroom = () => {
          api.setCardProperty(this.props.taskId, 'showChatroom', true)
        }
        return (
          <div className="lilypad menu">
            <div onClick={addChatroom} className="action">
              <img src={Lilypad} />
              +chatroom
            </div>
          </div>
        )
      } else {
        const removeChatroom = () => {
          api.setCardProperty(this.props.taskId, 'showChatroom', false)
        }
        return (
          <div className="lilypad menu">
            <div onClick={removeChatroom} className="action">
              <img src={Lilypad} />
              remove chatroom
            </div>
          </div>
        )
      }
    } else if (card.showChatroom) {
      const renderedBadge = <div className="badge green">{chatroomPop}</div>
      const percentChanged = Math.min(Math.floor(this.shitpostCount), 10)
      const buttonClass = ' red' + percentChanged.toString()

      button = (
        <div
          className={
            'lilypad actionCircle' + buttonClass + (youAreHere ? ' open' : '')
          }
          onClick={this.toggleChat}>
          {/*          <img src={Lilypad} />
           */}
          <object type="image/svg+xml" data={Lilypad} />
          {chatroomPop >= 1 && renderedBadge}
        </div>
      )
      altMessage = youAreHere
        ? 'You are in this chatroom'
        : 'Click to enter chatroom'

      return (
        <Tippy
          zIndex={4}
          theme="translucent"
          content={
            <div className="infoTooltip">
              {this.renderAvatarList}
              <p>{altMessage}</p>
            </div>
          }>
          {button}
        </Tippy>
      )
    }
    return null
  }
}
