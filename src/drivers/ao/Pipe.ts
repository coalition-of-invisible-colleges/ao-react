/* sourced from https://github.com/mostjs/core/blob/e37adda4c9cc923b2c132c8b313eec598748db27/packages/core/src/sink/Pipe.ts */
/** @license MIT License (c) copyright 2010-2017 original author or authors */
/** @author Brian Cavalier */
import { Sink, Time } from '@most/types'

export default abstract class Pipe<A, B> implements Sink<A> {
  protected readonly sink: Sink<B>

  constructor(sink: Sink<B>) {
    this.sink = sink
  }

  abstract event(t: Time, x: A): void

  end(t: Time): void {
    return this.sink.end(t)
  }

  error(t: Time, e: Error): void {
    return this.sink.error(t, e)
  }
}
