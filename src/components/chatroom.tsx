import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import Jitsi from 'react-jitsi'
import config from '../../configuration'

const chatroomName = 'Lounge'

interface State {
  show?: boolean
}

@observer
export default class AoChatroom extends React.PureComponent<{}, State> {
  constructor(props) {
    super(props)
    this.state = { show: false }
    this.show = this.show.bind(this)
    this.hide = this.hide.bind(this)
  }

  show() {
    console.log('showing chatroom')
    this.setState({ show: true })
  }

  hide() {
    console.log('hiding chatroom')
    this.setState({ show: false })
  }

  render() {
    if (!this.state.show) {
      return (
        <div id="chatroom" className="action closed" onClick={this.show}>
          Chat
        </div>
      )
    }

    return (
      <div id="chatroom">
        <Jitsi
          domain={
            config.hasOwnProperty('jitsiDomain')
              ? config.jitsiDomain
              : 'meet.dctrl.ca'
          }
          roomName={chatroomName}
          displayName={aoStore.member.name}
          containerStyle={{
            width: 'calc((100vw - 39em)/2)',
            height: 'calc(((100vw - 39em)/2)*4/6)'
          }}
        />
        <div className="action" onClick={this.hide}>
          Hide Chatroom
        </div>
      </div>
    )
  }
}
