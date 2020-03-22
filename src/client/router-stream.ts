import { runEffects, tap } from '@most/core'
import { hashchange } from '@most/dom-event'
import { newDefaultScheduler } from '@most/scheduler'
import { UrlEvent } from './router'
export default function useRouterStream(onEvent: (event: UrlEvent) => void) {
  const hashstream = hashchange(window)
  runEffects(
    tap(function(e: HashChangeEvent) {
      console.log('router stream', e)
      onEvent({ oldUrl: e.oldURL, newUrl: e.newURL })
    }, hashstream),
    newDefaultScheduler()
  )
}
