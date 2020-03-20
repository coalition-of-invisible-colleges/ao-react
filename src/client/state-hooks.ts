import { observe, autorun, intercept, reaction } from 'mobx'
import aoStore from './store'
export const disposer0 = observe(aoStore.state.tasks, change => {
  console.log('observe!!', change)
  if (!change.object) {
    // ignore attempts to unset the background color
    return null
  }
  console.log('observe!', change.object)
  // console.log(aoStore.state.tasks.length)
  document.getElementById('log').innerHTML += 'observe' + '<br />'
})
export const disposer1 = intercept(aoStore.state.tasks, change => {
  console.log('INTERCEPT!!', change)
  if (!change.object) {
    // ignore attempts to unset the background color
    return null
  }
  console.log('intercept!', change.object)
  // console.log(aoStore.state.tasks.length)
  document.getElementById('log').innerHTML += 'intercept' + '<br />'
  return change
})

export const disposer2 = reaction(
  () => aoStore.state.tasks.length,
  length => {
    console.log('autorun!!')
    console.log(aoStore.state.tasks)
    document.getElementById('log').innerHTML += 'react' + '<br />'
  }
)

export const disposer3 = autorun(() => {
  console.log('autorun!')
  console.log(aoStore.state.tasks.length)
  document.getElementById('log').innerHTML += 'autorun' + '<br />'
})
