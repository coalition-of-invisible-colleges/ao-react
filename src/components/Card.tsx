import * as React from 'react'
import { useState } from 'react'
import { observer } from 'mobx-react'
import { ObservableMap, computed } from 'mobx'
import { Switch, Route, useParams, useRouteMatch } from 'react-router-dom'
import api from '../client/api'
import aoStore from '../client/store'
import Markdown from 'markdown-to-jsx'
import AoPaper from './paper'
import AoPalette from './palette'
import AoCoin from './coin'
import AoCheckbox from './checkbox'
import AoValue from './value'
import AoCountdown from './countdown'
import AoTimeClock from './timeclock'
import AoGrid from './grid'
import AoStack from './stack'
import AoSmartZone from './smartZone'
import AoSmartCard from './smartCard'

interface CardParams {
  taskId: string
}

const CardDetails = () => {
  const { taskId }: CardParams = useParams()
  aoStore.setCurrentCard(taskId)
  aoStore.removeFromContext(taskId)
  console.log('card!', taskId, aoStore.hashMap.get(taskId))
  // <AoValue taskId={taskId} />
  // <AoCheckbox taskId={taskId} />
  // <AoCountdown taskId={taskId} />
  // <AoPalette taskId={taskId} />
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
  return (
    <Switch>
      <Route path={`${match.path}/:taskId`}>
        <CardDetails />
      </Route>
    </Switch>
  )
}

export default AoCard
