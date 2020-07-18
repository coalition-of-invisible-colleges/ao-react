import React, { FunctionComponent } from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore, { AoState, Task } from '../client/store'
import { TaskContext } from './taskContext'
import AoDragZone from './dragZone'
import AoContextCard from './contextCard'
import MoonBag from '../assets/images/moonbag.svg'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import _ from 'lodash'

const AoReturnPile: FunctionComponent<{}> = observer(() => {
  const computed = observable({
    get returnedCards() {
      const findAllReachableHeldParents = (origin: Task) => {
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
            console.log(
              'Invalid task found during returned cards search, skipping.'
            )
            continue
          }

          if (
            task.deck.indexOf(aoStore.memberCard.taskId) < 0 &&
            task.taskId !== aoStore.member.memberId
          ) {
            // console.log("unheld card found: ", task.taskId)
            continue
          }

          reachableCards.push(task)
          if (task.hasOwnProperty('parents') && task.parents.length) {
            let parents = []
            task.parents.forEach(tId => {
              if (aoStore.hashMap.get(tId)) {
                parents.push(aoStore.hashMap.get(tId))
              }
            })
            parents.forEach(st => {
              if (!st.hasOwnProperty('taskId')) {
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

      let anchorCards: Task[] = [aoStore.memberCard].concat(aoStore.myGuilds)
      console.log('anchorCards is ', anchorCards)

      let orphans = aoStore.state.tasks.filter(t => {
        if (t.deck.indexOf(aoStore.memberCard.taskId) < 0) {
          return false
        }
        let parents = findAllReachableHeldParents(t)
        if (t.name === 'ikebana') {
          console.log('ikebana parentZZZ are ', parents)
        }

        if (
          parents.some(st => {
            return anchorCards.some(at => at.taskId === st.taskId)
          })
        ) {
          return false
        }
        return true
      })

      let allChildTaskIds = []

      orphans.forEach(t => {
        allChildTaskIds.push(...t.subTasks, ...t.priorities, ...t.completed)
        if (t.grid && t.grid.rows) {
          Object.entries(t.grid.rows).forEach(([y, row]) => {
            Object.entries(row).forEach(([x, cell]) => {
              allChildTaskIds.push(cell)
            })
          })
        }
      })

      orphans = _.filter(orphans, t => allChildTaskIds.indexOf(t.taskId) < 0)

      return orphans
    },
    get topReturnedCard() {
      console.log('topReturnedCard. length is, ', this.returnedCards.length)
      if (this.returnedCards && this.returnedCards.length >= 1) {
        // console.log('top returned card is ', this.returnedCards[0])
        return this.returnedCards[0]
      }
      return null
    }
  })

  return (
    <React.Fragment>
      {computed.topReturnedCard ? (
        <div id={'returnPile'}>
          <TaskContext.Provider value={computed.topReturnedCard}>
            <AoDragZone dragContext={{ zone: 'panel', y: 0 }}>
              <Tippy
                zIndex={4}
                interactive={true}
                hideOnClick={false}
                content={
                  <div className={'previewPopup'}>
                    <p>
                      Returned cards—drag to draw next card (or click moon to
                      drop):
                    </p>
                    <AoContextCard cardStyle={'compact'} />
                  </div>
                }
                placement={'top'}>
                <div className={'actionCircle'}>
                  <img src={MoonBag} />
                  <div className={'badge'}>{computed.returnedCards.length}</div>
                </div>
              </Tippy>
            </AoDragZone>
          </TaskContext.Provider>
        </div>
      ) : null}
    </React.Fragment>
  )
})

export default AoReturnPile
