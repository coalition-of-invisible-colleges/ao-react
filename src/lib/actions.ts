export function taskCreate(
  name: string,
  color: string,
  deck: string[],
  inId: string
) {
  return {
    type: 'task-created',
    name,
    color,
    deck,
    inId
  }
}

export function gridAdd(taskId: string, x: number, y: number) {
  return { type: 'task-created', taskId, x, y }
}

export type AoAction =
  | ReturnType<typeof taskCreate>
  | ReturnType<typeof gridAdd>
