import * as React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
  useRouteMatch
} from 'react-router-dom'
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

const RenderCard = () => {
  const { taskId }: CardParams = useParams()
  console.log('card!', taskId, aoStore.hashMap.get(taskId))
  return (
    <div className="card">
      <AoValue taskId={taskId} />
      <AoCheckbox taskId={taskId} />
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
        <RenderCard />
      </Route>
    </Switch>
  )
}

export default Card
