import React from 'react'
import { Redirect } from 'react-router-dom'
import { computed } from 'mobx'
import { observer } from 'mobx-react'
import aoStore, { Task } from '../client/store'
import AoDragZone from './dragZone'
import AoContextCard from './contextCard'
import MoonBag from '../assets/images/archive.svg'
import LazyTippy from './lazyTippy'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'
import _ from 'lodash'
import { hideAll as hideAllTippys } from 'tippy.js'

function allReachableHeldParents(origin: Task): Task[] {
  if (!origin.hasOwnProperty('taskId')) {
    return []
  }
  let queue: Task[] = [origin]
  let reachableCards: Task[] = []

  let visited = {}
  visited[origin.taskId] = true
  let i = 0
  while (queue.length >= 1) {
    let task = queue.pop()
    if (
      task === undefined ||
      task.subTasks === undefined ||
      task.priorities === undefined ||
      task.completed === undefined
    ) {
      console.log('Invalid task found during returned cards search, skipping.')
      continue
    }

    if (
      task.deck.indexOf(aoStore.memberCard.taskId) < 0 &&
      task.taskId !== aoStore.member.memberId
    ) {
      continue
    }

    reachableCards.push(task)
    if (task.hasOwnProperty('parents') && task.parents.length >= 1) {
      let parents = []
      task.parents.forEach(tId => {
        if (aoStore.hashMap.get(tId)) {
          parents.push(aoStore.hashMap.get(tId))
        }
      })
      parents.forEach(st => {
        if (!st.hasOwnProperty('taskId')) {
          console.log('Missing parent found during returned cards search.')
          return
        }
        if (!visited.hasOwnProperty(st.taskId)) {
          visited[st.taskId] = true
          queue.push(st)
        }
      })
    }
  }

  return reachableCards
}

interface State {
  redirect?: string
}

@observer
export default class AoReturnPile extends React.PureComponent<{}, State> {
  constructor(props) {
    super(props)
    this.state = {}
    this.findOrphans = this.findOrphans.bind(this)
    this.goInCard = this.goInCard.bind(this)
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.redirect !== undefined) {
      this.setState({ redirect: undefined })
    }
  }

  findOrphans(count: number) {
    let found = 0
    return aoStore.state.tasks.filter(t => {
      if (found >= count) {
        return false
      }

      if (!t.hasOwnProperty('taskId')) {
        console.log('Broken card found while search for returned cards.')
        return false
      }

      if (t.deck.indexOf(aoStore.member.memberId) < 0) {
        return false
      }

      if (t.taskId === t.name) {
        return false
      }

      if (t.guild && t.guild.length >= 1) {
        return false
      }

      if (t.book && t.book.startTs) {
        return false
      }

      if (t.name === 'community hub') {
        return false
      }

      const dockCardName = aoStore.member.memberId + '-bookmarks'
      if (t.name === dockCardName) {
        return false
      }

      let parents = allReachableHeldParents(t)

      let anchorCards: Task[] = [aoStore.memberCard].concat(
        aoStore.myGuilds,
        this.myEvents
      )

      if (
        parents.some(st => {
          return anchorCards.some(at => at.taskId === st.taskId)
        })
      ) {
        return false
      }
      found++
      return true
    })
  }

  goInCard(event) {
    event.stopPropagation()
    hideAllTippys()
    aoStore.closeAllCloseables()

    const card = this.topReturnedCard
    if (!card) {
      console.log('missing card')
      return
    }
    const taskId = card.taskId
    console.log('goInCard taskId is ', taskId)
    aoStore.addToContext([aoStore.currentCard])
    aoStore.setCurrentCard(taskId)
    aoStore.removeFromContext(taskId)
    this.setState({ redirect: taskId })
  }

  @computed get myEvents(): Task[] {
    let my = aoStore.state.tasks
      .filter(t => {
        if (!t.hasOwnProperty('taskId')) {
          console.log(
            'Invalid event card detected while retrieving member events list.'
          )
          return false
        }

        if (!t.book || !t.book.startTs || t.book.startTs <= 0) return false
        if (t.deck.indexOf(aoStore.member.memberId) === -1) {
          return false
        }
        return true
      })
      .sort((a, b) => {
        return b.book.startTs - a.book.startTs
      })

    return my
  }

  @computed get topReturnedCard() {
    const orphans = this.findOrphans(1)
    if (orphans.length >= 1) {
      return orphans[0]
    }
    return null
  }

  render() {
    if (this.state.redirect !== undefined) {
      return <Redirect to={this.state.redirect} />
    }

    console.log('topReturnedCard is ', this.topReturnedCard)
    return (
      <React.Fragment>
        {this.topReturnedCard ? (
          <div id={'returnPile'}>
            <AoDragZone
              taskId={this.topReturnedCard.taskId}
              dragContext={{ zone: 'panel', y: 0 }}>
              <LazyTippy
                zIndex={4}
                theme="translucent"
                content="Discarded cards (drag to draw)"
                placement={'top'}>
                <img
                  src={MoonBag}
                  onDoubleClick={this.goInCard}
                  style={{ height: '4.5em' }}
                  className="actionIcon"
                />
              </LazyTippy>
            </AoDragZone>
          </div>
        ) : null}
      </React.Fragment>
    )
  }
}
