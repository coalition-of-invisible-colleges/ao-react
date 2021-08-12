import React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import api from '../client/api'
import { delay, cancelablePromise } from '../utils'
import aoStore from '../client/store'
import { formatDistanceToNow } from 'date-fns'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'

interface UnreadProps {
  taskId: string
}

@observer
export default class AoUnread extends React.PureComponent<UnreadProps> {
  pendingPromise = undefined

  constructor(props: UnreadProps) {
    super(props)
    makeObservable(this)
    this.markSeen = this.markSeen.bind(this)
  }

  componentWillUnmount() {
    //console.log("AO: components/contextCard.tsx: componentWillUnmount", {"props": this.props, "state": this.state})

    this.clearPendingPromise()
    // if (this.subCardsReaction) this.subCardsReaction() ???

    // this.executeOnUnmount_list.forEach ( fn => fn() );
  }

  clearPendingPromise() {
    if (this.pendingPromise) {
      this.pendingPromise.cancel()
    }
    this.pendingPromise = undefined
  }

  markSeen() {
    event.preventDefault()

    const taskId = this.props.taskId
    const card = aoStore.hashMap.get(taskId)
    if (!card) {
      return
    }
    if (
      card.seen &&
      card.seen.some(s => s.memberId === aoStore.member.memberId)
    ) {
      return
    }

    if (this.pendingPromise !== undefined) {
      return
    }

    this.pendingPromise = cancelablePromise(delay(2000))
    return this.pendingPromise.promise
      .then(() => {
        if (
          !card.seen ||
          (card.seen &&
            !card.seen.some(s => s.memberId === aoStore.member.memberId))
        ) {
          api.markSeen(taskId)
        }
        this.clearPendingPromise()
      })
      .catch(errorInfo => {
        // rethrow the error if the promise wasn't
        // rejected because of a cancelation
        this.clearPendingPromise()
        if (!errorInfo.isCanceled) {
          throw errorInfo.error
        }
      })
  }

  @computed
  get seen() {
    const card = aoStore.hashMap.get(this.props.taskId)
    return aoStore.state.tasks.filter(
      t => t.deck.indexOf(aoStore.member.memberId) !== -1
    )
  }

  render() {
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card) {
      console.log('missing card for unread, taskId is', this.props.taskId)
      return null
    }
    if (
      !card.seen ||
      (card.seen &&
        card.seen.some(t => {
          return t.memberId === aoStore.member.memberId
        }))
    ) {
      return null
    }
    const cardAge = formatDistanceToNow(card.created, { addSuffix: true })
    const renderedTooltip = (
      <React.Fragment>
        <div>created {cardAge}</div>
        <div>
          <small>tap to mark seen</small>
        </div>
      </React.Fragment>
    )
    return (
      <Tippy
        placement="top"
        delay={[475, 200]}
        theme="translucent"
        content={renderedTooltip}
        appendTo={document.getElementById('root')}>
        <div className="unread" onClick={this.markSeen} />
      </Tippy>
    )
  }
}
