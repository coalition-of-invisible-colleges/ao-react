import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import { JitsiMeeting } from '@jitsi/react-sdk'
import config from '../../configuration'
import Chatbox from './chatbox'
import { goInCard } from '../cardTypes'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'

interface Props {
  taskId: string
}

interface State {
  flash?: boolean
  timer?
}

@observer
export default class AoChatroom extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {}
    this.hide = this.hide.bind(this)
    this.startTimer = this.startTimer.bind(this)
    this.goInCard = this.goInCard.bind(this)
  }

  componentDidMount() {
    if (!this.props.taskId) {
      return
    }
    this.startTimer()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.taskId !== this.props.taskId) {
      this.setState({ flash: true })
      process.nextTick(() => this.setState({ flash: false }))
      if (!prevProps.taskId && this.props.taskId) {
        if (this.state.timer) {
          clearTimeout(this.state.timer)
        }
        this.startTimer()
      }
    }
  }

  componentWillUnmount() {
    if (this.props.taskId) {
      api.visitCard(this.props.taskId, false)
    }
    aoStore.setCurrentChatroom(null)
  }

  hide() {
    console.log('hiding chatroom')
    if (this.state.timer) {
      clearTimeout(this.state.timer)
    }
    if (this.props.taskId) {
      api.visitCard(this.props.taskId, false)
    }
    aoStore.setCurrentChatroom(null)
  }

  startTimer() {
    const timer = setInterval(() => {
      api.visitCard(this.props.taskId, true)
    }, 15000)

    this.setState({ timer })
  }

  goInCard(event) {
    event.stopPropagation()

    if (!this.props.taskId) {
      return
    }

    const taskId = this.props.taskId
    const card = aoStore.hashMap.get(taskId)
    if (!card) {
      console.log('missing card')
      return
    }

    goInCard(card.taskId)
    aoStore.setGlobalRedirect(card.taskId)
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
        <div>
          {aoStore.currentCard === this.props.taskId ? (
            <Tippy
              zIndex={4}
              theme={'translucent'}
              content="You Are Here"
              delay={[625, 200]}>
              <span>
                <span className="actionLink current">{card.guild}</span>{' '}
                chatroom
              </span>
            </Tippy>
          ) : (
            <React.Fragment>
              <span onClick={this.goInCard} className="actionLink">
                {card.guild}
              </span>{' '}
              chatroom
            </React.Fragment>
          )}
          <div
            className="action"
            onClick={this.hide}
            style={{ display: 'inline-block' }}>
            ×
          </div>
        </div>
        {/*containerStyle={{
            width: 'calc((100vw - 39em)/2)',
            height: 'calc(((100vw - 39em)/2)*4/6)',
          }}
          loadingComponent={() => (
            <div className="loading">Loading video room…</div>
          )}*/}
        <JitsiMeeting
          domain={config?.jitsi?.domain || 'meet.dctrl.space'}
          roomName={card.guild.substring(0, 60)}
          configOverwrite={{ prejoinConfig: {enabled: false }, logoImageUrl: "" }}
          interfaceConfigOverwrite={{DEFAULT_LOGO_URL: null}}
          userInfo = {{
              displayName: aoStore.member.name,
              email: null
          }}
        />
        <Chatbox taskId={this.props.taskId} />
      </div>
    )
  }
}
