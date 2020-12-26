import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import Jitsi from 'react-jitsi'
import config from '../../configuration'

interface Props {
  taskId: string
}

interface State {
  flash?: boolean
}

@observer
export default class AoChatroom extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {}
    this.hide = this.hide.bind(this)
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.taskId !== this.props.taskId) {
      this.setState({ flash: true })
      process.nextTick(() => this.setState({ flash: false }))
    }
  }

  componentWillUnmount() {
    api.visitCard(this.props.taskId, false)
    aoStore.setCurrentChatroom(null)
  }

  hide() {
    console.log('hiding chatroom')
    api.visitCard(this.props.taskId, false)
    aoStore.setCurrentChatroom(null)
  }

  render() {
    if (this.state.flash) {
      return <div>Reloading chatroom...</div>
    }

    if (!this.props.taskId) {
      return null
    }

    const card = aoStore.hashMap.get(this.props.taskId)
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
          roomName={card.guild.substring(0, 60)}
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
