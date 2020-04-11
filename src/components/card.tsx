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

interface CardParams {
  taskId: string
}

const CardDetails = () => {
  const { taskId }: CardParams = useParams()
  console.log('card!', taskId, aoStore.hashMap.get(taskId))
  return <div>{JSON.stringify(aoStore.hashMap.get(taskId))}</div>
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
