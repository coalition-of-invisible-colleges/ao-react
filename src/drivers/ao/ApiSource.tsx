import * as _ from 'lodash'
import { Stream } from '@most/types'
import { filter } from '@most/core'
import { AoResponse, AoAction } from '../aoStore'

export interface AoResponseSource {
  filter(
    predicate: (request: AoResponse) => boolean,
    scope?: string
  ): AoResponseSource
  select(category?: string): Stream<AoResponse>
  // isolateSource(source: AoResponseSource, scope: string): AoResponseSource
  // isolateSink(sink: Stream<AoAction>, scope: string): Stream<AoAction>
}

export class ApiSelector implements AoResponseSource {
  constructor(
    private __action$: Stream<AoResponse>,
    private _name: string,
    private _namespace: Array<string> = []
  ) {}

  public filter(
    predicate: (request: AoResponse) => boolean,
    scope?: string
  ): AoResponseSource {
    const filteredResponse$$ = filter(r$ => predicate(r$), this.__action$)
    return new ApiSelector(
      filteredResponse$$,
      this._name,
      scope === undefined ? this._namespace : this._namespace.concat(scope)
    )
  }

  public select(category?: string): any {
    const res$$ = category
      ? filter(
          res$ => _.has(res$, '_category') && res$._category === category,
          this.__action$
        )
      : this.__action$
    // const out: DevToolEnabledSource = adapt(res$$)
    // ._isCycleSource = this._name
    return res$$
  }

  // public isolateSource = isolateSource
  // public isolateSink = isolateSink
}
