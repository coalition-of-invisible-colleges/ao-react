import React from 'react'
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

const RenderNumberOfReturned = observer(props => props.getReturnedCardsLength())

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

@observer
export default class AoReturnPile extends React.PureComponent {
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

  @computed get orphans() {
    return aoStore.state.tasks.filter(t => {
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
      return true
    })
  }

  @computed
  get returnedCards() {
    console.log(
      'recomputing returned cards. this should only happen once or twice when you create a card'
    )

    let allChildTaskIds = []

    this.orphans.forEach(t => {
      allChildTaskIds.push(...t.subTasks, ...t.priorities, ...t.completed)
      if (t.grid && t.grid.rows) {
        Object.entries(t.grid.rows).forEach(([y, row]) => {
          Object.entries(row).forEach(([x, cell]) => {
            if (cell.length >= 1) {
              allChildTaskIds.push(cell)
            }
          })
        })
      }
    })

    const filteredOrphans = _.filter(
      this.orphans,
      t => !allChildTaskIds.includes(t.taskId)
    )

    return filteredOrphans
  }

  @computed get topReturnedCard() {
    if (this.returnedCards && this.returnedCards.length >= 1) {
      return this.returnedCards[this.returnedCards.length - 1]
    }
    return null
  }

  getReturnedCardsLength = () => this.returnedCards.length

  render() {
    const { card, setRedirect } = this.context

    return (
      <React.Fragment>
        {this.topReturnedCard ? (
          <div id={'returnPile'}>
            <AoDragZone
              taskId={this.topReturnedCard.taskId}
              dragContext={{ zone: 'panel', y: 0 }}>
              <LazyTippy
                zIndex={4}
                interactive={true}
                hideOnClick={false}
                delay={[625, 200]}
                theme="translucent"
                content={
                  <div className={'previewPopup'}>
                    <p>Returned cards—drag to draw (or unmoon to drop):</p>
                    <AoContextCard
                      task={this.topReturnedCard}
                      cardStyle={'compact'}
                    />
                  </div>
                }
                placement={'top'}>
                <img
                  src={MoonBag}
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
