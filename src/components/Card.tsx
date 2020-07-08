import * as React from 'react'
import { ObservableMap, computed } from 'mobx'
import { Route, useParams, useRouteMatch } from 'react-router-dom'
import aoStore from '../client/store'
import { TaskContext } from './taskContext'
import AoContextCard from './contextCard'
import AoDiscardZone from './discard'

interface CardParams {
  taskId: string
}

const RenderCard = () => {
  const { taskId }: CardParams = useParams()
  aoStore.setCurrentCard(taskId)
  aoStore.removeFromContext(taskId)
  let card = aoStore.hashMap.get(taskId)

  if (!card) {
    return <p>Invalid card ID.</p>
  }

  return (
    <TaskContext.Provider value={card}>
      <AoDiscardZone>
        <AoContextCard cardStyle={'full'} />
      </AoDiscardZone>
    </TaskContext.Provider>
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
