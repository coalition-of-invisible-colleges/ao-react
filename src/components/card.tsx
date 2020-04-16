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

interface CardParams {
  taskId: string
}

const RenderCard = () => {
  const { taskId }: CardParams = useParams()
  console.log('card!', taskId, aoStore.hashMap.get(taskId))
  return (
    <div className="card">
      <Markdown>{aoStore.hashMap.get(taskId).name}</Markdown>
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
