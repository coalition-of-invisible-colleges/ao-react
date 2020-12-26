import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import Jitsi from 'react-jitsi'
import config from '../../configuration'

@observer
export default class AoChatroom extends React.PureComponent {
  constructor(props) {
    super(props)
    // this.state = { show: false }
    // this.show = this.show.bind(this)
    this.hide = this.hide.bind(this)
  }

  componentWillUnmount() {
    aoStore.setCurrentChatroom(null)
    api.visitCard(aoStore.currentChatroom, false)
  }

  // show() {
  //   console.log('showing chatroom')
  //   this.setState({ show: true })
  //   api.visitCard(aoStore.currentChatroom, true)
  // }

  hide() {
    console.log('hiding chatroom')
    api.visitCard(aoStore.currentChatroom, false)
    aoStore.setCurrentChatroom(null)
  }

  render() {
    // if (!this.state.show) {
    //   return (
    //     <div id="chatroom" className="action closed" onClick={this.show}>
    //       {aoStore.currentChatroom && 'Rejoin '}Chat
    //     </div>
    //   )
    // }

    if (!aoStore.currentChatroom) {
      return null
    }

    const card = aoStore.hashMap.get(aoStore.currentChatroom)
    if (!card) {
      console.log('Attempt to access chatroom on missing card.')
      return null
    }

    return (
      <div id="chatroom">
        <Jitsi
          domain={
            config.hasOwnProperty('jitsi') &&
            config.jitsi.hasOwnProperty('domain')
              ? config.jitsi.domain
              : 'meet.dctrl.ca'
          }
          roomName={card.name.substring(0, 60)}
          displayName={aoStore.member.name}
          containerStyle={{
            width: 'calc((100vw - 39em)/2)',
            height: 'calc(((100vw - 39em)/2)*4/6)'
          }}
        />
        <div className="action" onClick={this.hide}>
          Leave {card.guild} Chatroom
        </div>
      </div>
    )
  }
}
