import * as React from 'react'
import aoStore from '../client/store'
import { useParams } from 'react-router-dom'

interface CardParams {
  taskId: string
}

const Card: React.FunctionComponent<{}> = () => {
  const { taskId }: CardParams = useParams()
  return <div>{JSON.stringify(aoStore.hashMap.get(taskId))}</div>
}

export default Card
