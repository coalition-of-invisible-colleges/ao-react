import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import { HudStyle } from './cardHud'
import Hourglass from '../assets/images/hourglass.svg'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'

interface TimeClockProps {
  taskId: string
  hudStyle: HudStyle
}

interface TimeClockState {
  seconds: number
  timer: boolean
  t: any
}

class AoTimeClock extends React.Component<TimeClockProps, TimeClockState> {
  constructor(props) {
    super(props)
    this.state = {
      seconds: 0,
      timer: false,
      t: null,
    }
    this.setTrigger = this.setTrigger.bind(this)
    this.run = this.run.bind(this)
    this.commit = this.commit.bind(this)
    this.toHHMMSS = this.toHHMMSS.bind(this)
    var t
  }

  toHHMMSS = () => {
    let time = this.state.seconds
    let dateObj = new Date(time * 1000)
    let hours = dateObj.getUTCHours()
    let minutes = dateObj.getUTCMinutes()
    let sec = dateObj.getSeconds()

    let timeString =
      hours.toString().padStart(2, '0') +
      ':' +
      minutes.toString().padStart(2, '0') +
      ':' +
      sec.toString().padStart(2, '0')
    return timeString
  }

  setTrigger = () => this.setState({ seconds: this.state.seconds + 1 })

  run() {
    if (this.state.timer === false) {
      this.setState({ t: setInterval(this.setTrigger, 1000) })
      this.setState({ timer: true })
      // document.getElementById('cardTimer').innerHTML = 'End Timer'
    } else {
      //stop timer
      clearTimeout(this.state.t)
      this.setState({ timer: false })
      //send value to server
      // document.getElementById('cardTimer').innerHTML = 'Start Timer'
    }
  }

  commit() {
    if (this.state.seconds > 0) {
      if (this.state.timer === true) {
        this.setState({ timer: false })
        clearTimeout(this.state.t)
      }
      api.clockTime(this.state.seconds, this.props.taskId, Date.now())
      this.setState({ t: null, seconds: 0 })
    }
  }

  render() {
    switch (this.props.hudStyle) {
      case 'full before':
        return null
        return (
          <div className="hourglass">
            <Tippy
              zIndex={4}
              theme="translucent"
              content={<AoTimeHistory taskId={this.props.taskId} />}
              delay={[625, 200]}>
              <img src={Hourglass} />
            </Tippy>
          </div>
        )
      default:
        return (
          <div className="hourglass">
            <div
              onClick={this.run}
              className={
                this.state.timer ? 'started action' : 'stopped action'
              }>
              {this.state.timer ? 'stop timeclock' : 'start timeclock'}
            </div>
            {this.state.timer || this.state.seconds > 0 ? (
              <div>{this.toHHMMSS()}</div>
            ) : (
              ''
            )}
            {!this.state.timer && this.state.seconds > 0 ? (
              <button id="cardTimerCommit" onClick={this.commit}>
                Commit Time
              </button>
            ) : (
              ''
            )}
          </div>
        )
    }
  }
}

interface TimeHistoryProps {
  taskId: string
}

@observer
class AoTimeHistory extends React.Component<TimeHistoryProps> {
  constructor(props) {
    super(props)
    makeObservable(this)
    this.state = {}
  }

  formatTime = seconds => {
    let dateObj = new Date(seconds * 1000)
    let hours = dateObj.getUTCHours()
    let minutes = dateObj.getUTCMinutes()
    let sec = dateObj.getSeconds()

    let timeString =
      hours.toString().padStart(2, '0') +
      ':' +
      minutes.toString().padStart(2, '0') +
      ':' +
      sec.toString().padStart(2, '0')
    return timeString
  }

  @computed get timeLog() {
    const taskId = this.props.taskId
    const card = aoStore.hashMap.get(taskId)

    return ''
    // if (!card.time || (card.time && card.time.length < 1)) {
    //   return ''
    // }
    // let timeLogOut = null
    // if (
    //   card.time.length > 0 &&
    //   card.time.find(t => {
    //     return t.memberId === aoStore.member.memberId
    //   })
    // ) {
    //   timeLogOut = aoStore.hashMap
    //     .get(taskId)
    //     .time.find(t => {
    //       return t.memberId === aoStore.member.memberId
    //     })
    //     .timelog.map((num, i) => {
    //       return (
    //         <div className={`${i % 2 === 0 ? 'orangeLog' : ''}`} key={i}>
    //           {this.formatTime(num)} on{' '}
    //         </div>
    //       )
    //     })
    // }
    // return timeLogOut
  }

  @computed get dateLog() {
    const taskId = this.props.taskId
    const card = aoStore.hashMap.get(taskId)

    let dateLogOut = null

    return ''
    // if (
    //   card.time &&
    //   card.time.length > 0 &&
    //   card.time.some(t => {
    //     return t.memberId === aoStore.member.memberId
    //   })
    // ) {
    //   dateLogOut = aoStore.hashMap
    //     .get(taskId)
    //     .time.find(t => {
    //       return t.memberId === aoStore.member.memberId
    //     })
    //     .date.map((num, i) => {
    //       if (num) {
    //         return (
    //           <div
    //             className={`cardTimeLogDate ${i % 2 === 0 ? 'orangeLog' : ''}`}
    //             key={i}>
    //             {new Date(Number(num) - 25200000).toUTCString().slice(0, 25)}
    //           </div>
    //         )
    //       } else {
    //         return (
    //           <div
    //             className={`cardTimeLogDateNull ${
    //               i % 2 === 0 ? 'orangeLog' : ''
    //             }`}
    //             key={i}>
    //             Null
    //           </div>
    //         )
    //       }
    //     })

    //   return dateLogOut
    // }
  }

  render() {
    if (!this.timeLog || this.timeLog.length <= 0) {
      return null
    }

    return (
      <div className="history">
        <p>Activity Log</p>
        <div className="cardTimeLog">
          <div>{this.timeLog}</div>
          <div>{this.dateLog}</div>
        </div>
      </div>
    )
  }
}

export default AoTimeClock
