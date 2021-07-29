import * as React from 'react'
import { observer } from 'mobx-react'
import { computed, makeObservable } from 'mobx'
import aoStore from '../client/store'
import api from '../client/api'
import AoMemberIcon from './memberIcon'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'
import Lilypad from '../assets/images/chatroom.svg'

interface Props {
  taskId: string
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
      api.visitCard(this.props.taskId, true)
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

      return (
        <div key={memberId}>
          <AoMemberIcon memberId={memberId} /> {name}{' '}
          {area === 1 && seconds <= 100 && <small>in chat</small>}
        </div>
      )
    })

    if (renderedAvatars.length <= 0) {
      return null
    }

    return (
      <React.Fragment>
        <h4>Who's Here</h4>
        {renderedAvatars}
      </React.Fragment>
    )
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
    } else {
      const renderedBadge = (
        <div className="badge green">{chatroomPop + '/' + cardPop}</div>
      )
      button = (
        <div
          className={'lilypad actionCircle' + (youAreHere ? ' open' : '')}
          onClick={this.toggleChat}>
          <img src={Lilypad} />
          {(chatroomPop >= 1 || cardPop >= 1) && renderedBadge}
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
  }
}
