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

export function gridCreate(name: number, length: number, width: number) {
  return { type: 'grid-created', name, length, width }
}

export function gridUnpin(gridId: string, x: number, y: number) {
  return { type: 'grid-unpin', gridId, x, y }
}
export function gridPin(gridId: string, taskId: string, x: number, y: number) {
  return { type: 'grid-pin', gridId, taskId, x, y }
}
export function gridResize(
  gridId: string,
  amount: number,
  side: 'right' | 'left' | 'top' | 'bottom'
) {
  return { type: 'grid-resize', gridId, amount, side }
}

export type AoAction =
  | ReturnType<typeof taskCreate>
  | ReturnType<typeof gridCreate>
  | ReturnType<typeof gridResize>
  | ReturnType<typeof gridPin>
  | ReturnType<typeof gridUnpin>
