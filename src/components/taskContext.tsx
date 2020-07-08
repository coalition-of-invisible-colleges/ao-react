import * as React from 'react'
import { Task } from '../client/store'

// interface IContextProps {
// 	state: IState
// 	dispatch: ({ type }: { type: string }) => void
// }

export const TaskContext = React.createContext<Task>(null)
