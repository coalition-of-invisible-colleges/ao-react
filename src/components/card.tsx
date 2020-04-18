import * as React from 'react'
import { useState } from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
  useRouteMatch
} from 'react-router-dom'
import { observer } from 'mobx-react'
import { ObservableMap } from 'mobx'
import aoStore from '../client/store'
import { useParams } from 'react-router-dom'
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
}

class TimeClock extends React.Component<{}, TimeClockState> {
  constructor(props) {
    super(props)
    this.state = {
      seconds: 0
    }
  }

  render() {
    return (
      <React.Fragment>
        <div>test</div>
        <div>{this.state.seconds}</div>
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
      <TimeClock />
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
