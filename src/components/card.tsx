import * as React from 'react'
import { useState } from 'react'
import { observer } from 'mobx-react'
import { ObservableMap } from 'mobx'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useParams,
  useRouteMatch
} from 'react-router-dom'
import api from '../client/api'

import aoStore from '../client/store'
import Markdown from 'markdown-to-jsx'
import AoCoin from './coin'
import AoCheckbox from './checkbox'
import AoValue from './value'
import AoCountdown from './countdown'
interface CardParams {
  taskId: string
}
interface TimeClockState {
  seconds: number
  timer: boolean
  t: any
}

interface Props {
  taskId: string
}

class TimeClock extends React.Component<Props, TimeClockState> {
  constructor(props) {
    super(props)
    this.state = {
      seconds: 0,
      timer: false,
      t: null
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
    console.log(this.state.seconds, this.props.taskId)
    if (this.state.timer === true) {
      this.setState({ timer: false })
      clearTimeout(this.state.t)
      // document.getElementById('cardTimer').innerHTML = 'Start Timer'
    }
    console.log('before')
    //commit this.state.seconds to server

    api.commitTime(this.state.seconds, this.props.taskId)
    console.log('after')
    this.setState({ t: null })
    this.setState({ seconds: 0 })
  }

  render() {
    return (
      <React.Fragment>
        <img
          onClick={this.run}
          id="hourglassIMG"
          className={this.state.timer ? 'hgOn' : 'hgOff'}
          src="../assets/images/hourglass.svg"
          alt=""></img>
        <div>{this.toHHMMSS()}</div>
        {/* <button id="cardTimer" onClick={this.run}>
          Start Timer
        </button> */}
        <button id="cardTimerCommit" onClick={this.commit}>
          Commit Time
        </button>
      </React.Fragment>
    )
  }
}

// const TimeClock = () => {
//   const [seconds, setSeconds] = useState(0)
//   const setTrigger = () => {
//     setSeconds(seconds + 1)
//   }
//   const run = () => setInterval(setTrigger, 1000)
//   run()
//   return <div>{seconds}</div>
// }

const CardDetails = () => {
  const { taskId }: CardParams = useParams()
  console.log('card!', taskId, aoStore.hashMap.get(taskId))
  return (
    <div className="card">
      <AoValue taskId={taskId} />
      <AoCheckbox taskId={taskId} />
      <TimeClock taskId={taskId} />
      <div className="content">
        <Markdown>{aoStore.hashMap.get(taskId).name}</Markdown>
      </div>
      <AoCountdown taskId={taskId} />
      <AoCoin taskId={taskId} />
    </div>
  )
}

const Card: React.FunctionComponent<{}> = () => {
  const match = useRouteMatch()
  return (
    <Switch>
      <Route path={`${match.path}/:taskId`}>
        <CardDetails />
      </Route>
    </Switch>
  )
}

export default Card
