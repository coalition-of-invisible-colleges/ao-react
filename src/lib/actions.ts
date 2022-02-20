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
