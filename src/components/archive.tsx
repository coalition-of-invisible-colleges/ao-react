import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore, { Task, emptySearchResults } from '../client/store'
import InfiniteScroll from 'react-infinite-scroller'
import AoContextCard from './contextCard'
import AoDragZone from './dragZone'
import AoTip from './tip'
import api from '../client/api'
import { findOrphans } from '../cardTypes'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'
import DownBoat from '../assets/images/downboat.svg'
import TrashCan from '../assets/images/trash.svg'

type SearchSort = 'alphabetical' | 'hodls' | 'oldest' | 'newest'

interface State {
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
    return findOrphans(6)
  }

  renderItems(items) {
    let rendered = items.map((task, i) => (
      <div className="archiveResult">
        {task.deck.length <= 1 && (
          <Tippy
            zIndex={4}
            theme="translucent"
            content="Drop &amp; delete card">
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
          <Tippy zIndex={4} theme="translucent" content="Drop card">
            <img
              src={DownBoat}
              onClick={event => {
                api.dropCard(task.taskId)
              }}
              className="action downboat"
            />
          </Tippy>
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

  render() {
    if (this.state.items === undefined) {
      return ''
    }

    return (
      <React.Fragment>
        <div className="floatTip">
          <AoTip text="This tab shows your most recent five lost cards. A lost card is a card that cannot be found in any of the guild cards in your deck, or any cards within those cards. Drag cards out of Lost Cards and place them in a guild or sub-guild card you hold in your deck to remove from Lost Cards. If you are the last person holding a card in your deck, you may delete it. If you are not sure why a card is showing up in the Lost Cards tab, try hovering its pin and grabbing its parent card, and/or making one of its parent cards into a guild." />
        </div>
        <div id="archive" className="results">
          {this.myLostCards.length >= 1 ? (
            this.renderItems(this.myLostCards.slice(0, 5))
          ) : (
            <p>No lost cards. Try "download entire deck".</p>
          )}
          {this.myLostCards.length > 5 && <p>Drag cards out to see more</p>}
        </div>
      </React.Fragment>
    )
  }
}
