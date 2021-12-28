import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore, { Task, emptySearchResults } from '../client/store'
import InfiniteScroll from 'react-infinite-scroller'
import AoContextCard from './contextCard'
import AoDragZone from './dragZone'
import api from '../client/api'
import { findOrphans } from '../cardTypes'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'
import TrashCan from '../assets/images/trash.svg'

type SearchSort = 'alphabetical' | 'hodls' | 'oldest' | 'newest'

interface State {
  // sort: SearchSort
  items: number
  hasMore: boolean
  debounce?
}

export const defaultState: State = {
  items: 5,
  hasMore: true,
}

@observer
export default class AoArchive extends React.Component<{}, State> {
  constructor(props) {
    super(props)
    makeObservable(this)
    this.state = defaultState
    this.scrollMore = this.scrollMore.bind(this)
    this.renderItems = this.renderItems.bind(this)
    this.renderLostCards = this.renderLostCards.bind(this)
  }

  scrollMore(page: number) {
    const newIndex = page * 5
    const hasMore = findOrphans().length > newIndex
    this.setState({
      items: newIndex,
      hasMore: hasMore,
    })
  }

  @computed get myLostCards() {
    return findOrphans()
  }

  renderItems(items) {
    let rendered = items.map((task, i) => (
      <div className="archiveResult">
        {task.deck.length <= 1 && (
          <Tippy
            zIndex={4}
            theme="translucent"
            content="Click to drop and delete this card">
            <img
              src={TrashCan}
              onClick={event => {
                api.removeCards([task.taskId])
              }}
              className="action downboat"
            />
          </Tippy>
        )}
        {task.deck.length >= 2 && (
          <img
            src={TrashCan}
            onClick={event => {
              api.dropCard(task.taskId)
            }}
            className="action downboat"
          />
        )}
        <AoDragZone
          taskId={task.taskId}
          dragContext={{
            zone: 'panel',
            y: i,
          }}
          key={task.taskId}>
          <AoContextCard task={task} cardStyle="priority" noFindOnPage={true} />
        </AoDragZone>
      </div>
    ))

    return rendered
  }

  renderLostCards(lostCards) {
    if (this.state.items === undefined) {
      return ''
    }

    return (
      <div id="archive" className="results">
        <InfiniteScroll
          loadMore={this.scrollMore}
          useWindow={false}
          hasMore={this.state.hasMore}
          loader={<h4 key="heading">Loading...</h4>}>
          {this.renderItems(lostCards.slice(0, this.state.items))}
        </InfiniteScroll>
      </div>
    )
  }

  render() {
    return this.renderLostCards(this.myLostCards)
  }
}
