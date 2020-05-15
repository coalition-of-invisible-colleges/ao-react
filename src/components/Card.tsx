import * as React from 'react'
import { ObservableMap, computed } from 'mobx'
import { Route, useParams, useRouteMatch } from 'react-router-dom'
import aoStore from '../client/store'
import AoSmartZone from './smartZone'
import AoSmartCard from './smartCard'

interface CardParams {
  taskId: string
}

const RenderCard = () => {
  const { taskId }: CardParams = useParams()
  aoStore.setCurrentCard(taskId)
  aoStore.removeFromContext(taskId)
  return (
    <React.Fragment>
      <AoSmartZone inId={taskId} cardSource={'discard'}>
        <AoSmartCard taskId={taskId} cardStyle={'full'} />
      </AoSmartZone>
    </React.Fragment>
  )
}

const AoCard: React.FunctionComponent<{}> = () => {
  const match = useRouteMatch()
  console.log('match.path is ', match.path)
  return (
    <Route path={`${match.path}/:taskId`}>
      <RenderCard />
    </Route>
  )
}

export default AoCard
