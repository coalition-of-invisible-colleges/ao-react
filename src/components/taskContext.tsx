import * as React from 'react'
import { Task } from '../client/store'

interface TaskContextProps {
	card: Task
	setRedirect: (taskId: string) => void
}

export const TaskContext = React.createContext<TaskContextProps>(null)
