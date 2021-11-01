import React from 'react'
import ReactDOM from 'react-dom'
import { useState, useEffect } from 'react'
import {
  makeAutoObservable,
  makeObservable,
  observable,
  computed,
  action,
  runInAction,
  reaction,
  autorun,
} from 'mobx'
import { observer } from 'mobx-react'
import { useHistory } from 'react-router-dom'
import aoStore, { Member, Resource } from '../client/store'

import AoStack from './stack'

import AoContextCard from './contextCard'
import AoDrawPile from './draw'
import AoDiscardZone from './discard'
import AoHud from './hud'
import { Helmet } from 'react-helmet'
import { ShepherdTour as Tour } from 'react-shepherd'
import { steps, tourOptions } from './tour'
import api from '../client/api'

interface CardProps {
  match
}

interface RenderProps {
  taskId?: string
}

// let getCommunityCard =
//     () =>
//     {
//       aoStore.getTaskByName_async
//       ( "community hub",
//         (communityCard) =>
//         {
//           if (
//               !communityCard ||
//               !communityCard.hasOwnProperty('taskId') ||
//               !communityCard.taskId
//           ) {
//               console.log("AO: components/App.tsx: initialising page, creating community hub card on server")

//               api.createCard('community hub', true).then(result => {
//                   const newTaskId = JSON.parse(result.text).event.taskId

//                   console.log("AO: components/App.tsx: initialising page, community hub card created: ", { newTaskId });

//                   aoStore.setCurrentCard(newTaskId)
//                   // setHubId(newTaskId)
//                   // initialStateComplete();
//               })
//           } else {
//               console.log("AO: components/App.tsx: initialising page, community hub card found in client state: ", { "taskId": communityCard.taskId });

//               aoStore.setCurrentCard(communityCard.taskId)
//               // setHubId(communityCard.taskId)
//               // initialStateComplete();
//           }
//         }
//       )
//     }

class ContextStackWatcher {
  contextCardList = aoStore.contextCards

  constructor() {
    makeObservable(this, { contextCardList: observable })
  }
}
const contextStackWatcher = new ContextStackWatcher()
reaction(
  () => {
    return aoStore.context
  },

  contextCardList => {
    // console.log('@AO: components/Card.tsx: contextStackWatcher: ', {
    //   'contextStackWatcher.contextCardList': contextCardList.slice(),
    // })
  }
)
// const ContextStackView   = observer( () => <div id="context">
//          contextCard.tsx__full__noContextOnFull_false
//          <AoStack
//            cards={contextStackWatcher.contextCardList}
//            cardStyle="context"
//            alwaysShowAll={true}
//            zone="context"
//          />
//        </div>

// );

class CurrentContextCard {
  cardItem = null
  loadingCardItemFromServer = null
  history = null

  constructor() {
    makeObservable(this, { cardItem: observable })
  }

  setCardItem(taskId) {
    let taskIdUrlString = '/task/'

    if (taskId !== null && taskId !== undefined) {
      //TODO: some kind of loader spinner?
      // get the card from the client store or from the server
      aoStore.getTaskById_async(taskId, taskItem => {
        runInAction(() => {
          this.cardItem = taskItem

          taskIdUrlString += taskId

          if (window.location.pathname !== taskIdUrlString) {
            this.history.push(taskIdUrlString)
          }

          // console.log("AO: components/Card.tsx: CurrentContextCard: setCardItem: ", {taskId, taskItem, "history.action": this.history.action, stateToPush})

          // contextStackWatcher.contextCardList.push(taskItem.taskId)
          // setImmediate(() => aoStore.context.push(taskItem.taskId))

          document.title = 'loading....'
          // window.history.pushState({}, '', taskIdUrlString)
        })
      })
    } else {
      runInAction(() => {
        this.cardItem = null
        this.history.push(taskIdUrlString)
      })
    }
  }
}
const currentContextCard = new CurrentContextCard()
const currentCardReaction = reaction(
  () => {
    // console.log("AO: client/Card.tsx: currentCardReaction: testPhase: aoStore.currentCard: "+ aoStore.currentCard)

    return aoStore.currentCard
  },
  currentCard => {
    // console.log("AO: client/Card.tsx: currentCardReaction: reactionPhase: aoStore.currentCard: "+ currentCard)
    currentContextCard.setCardItem(currentCard)
  }
)

const PageTitleView = observer(() => {
  let pageTitle = 'Loading...'

  if (currentContextCard.cardItem) {
    if (
      currentContextCard.cardItem.name === currentContextCard.cardItem.taskId
    ) {
      const foundMember = aoStore.memberById.get(
        currentContextCard.cardItem.taskId
      )
      if (foundMember) {
        pageTitle = foundMember.name
      } else {
        const foundResource = aoStore.resourceById.get(
          currentContextCard.cardItem.taskId
        )?.name
      }
    } else {
      pageTitle = currentContextCard.cardItem.name
    }
  }

  return (
    <Helmet>
      <title>{pageTitle}</title>
    </Helmet>
  )
})

const ContextCardView = observer(() => {
  if (currentContextCard.cardItem === null) {
    // console.log("AO: client/Card.tsx: ContextCardView: render: drawPile: "+ currentContextCard.cardItem)
    return <AoDrawPile />
  } else {
    // console.log("AO: client/Card.tsx: ContextCardView: render: aoStore.currentCard: "+ currentContextCard.cardItem.taskId)
    return (
      <AoContextCard
        task={currentContextCard.cardItem}
        cardStyle="full"
        padTop={!!aoStore.taskDoingNow}
      />
    )
  }
})

// const CardTitleView = observer( ({currentContextCard}) => <Helmet><title>{currentContextCard.cardItem.name}</title></Helmet> );
// ReactDOM.render(<PageTitleView currentContextCard={currentContextCard} />, document.getElementById("root"));

// function renderCard(taskId?: string, props?: any) {
//   console.log('AO: components/Card.tsx: renderCard: taskId is ', {taskId, props})

//   // let card
//   // let cardText
//   // if (taskId) {
//   //   card = aoStore.hashMap.get(taskId)

//   //   if (card) {
//   //     cardText = ''
//   //     if (card.name === taskId) {
//   //       let memberOrResource: Member | Resource = aoStore.memberById.get(taskId)
//   //       if (!memberOrResource) {
//   //         memberOrResource = aoStore.resourceById.get(taskId)
//   //       }
//   //       if (memberOrResource) {
//   //         cardText = memberOrResource.name
//   //       }
//   //     } else if (card.guild) {
//   //       cardText = card.guild
//   //     } else {
//   //       cardText = card.name
//   //     }

//   //     if (cardText.length > 12) {
//   //       cardText = cardText.substring(0, 12) + '…'
//   //     }
//   //   }
//   // }

//   // currentContextCard.setCardItem(taskId);

//   return (
//     <Tour steps={steps} tourOptions={tourOptions}>
//       <div id="tour-current-card">
//         {
//           // <Helmet>
//           //   <title>
//           //     {//cardText ? cardText + ' - ' : ''
//           //     }
//           //     {aoStore.state.cash.alias}
//           //   </title>
//           // </Helmet>
//         }
//         Card.tsx
//         { <AoDiscardZone />
//         }
//         {
//           //card ? <AoContextCard taskId={taskId} task={card} cardStyle="full" /> : <AoDrawPile />
//           // <AoContextCard taskId={taskId} task={card} cardStyle="full" />
//           //taskId?<AoContextCard taskId={taskId} cardStyle="full" />:<div>'AO: components/Card.tsx: taskId not set'</div>
//           // <div id="currentContextCard">currentContextCard div: {taskId}
//           <div>
//             <PageTitleView      currentContextCard={currentContextCard} />
//             {
//               //<ContextPileView    contextPile={contextPile} />
//             }
//             <ContextCardView    currentContextCard={currentContextCard} />
//           </div>
//           // <CardHeadingView    currentContextCard={currentContextCard} />
//           // </div>

//         }
//         {
//           <AoHud />
//         }
//       </div>
//     </Tour>
//   )
// }

interface CardState {
  nextRender?: boolean
}

export default function AoCard(props) {
  let history = useHistory()
  currentContextCard.history = history

  console.log(history.action)

  // console.log("AO: components/Card.tsx: AoCard function: ", {props})
  let targetTaskId
  if (props.match.path === '/') {
    aoStore.getCommunityHubCardId(communityHubCardTaskId =>
      aoStore.setCurrentCard(communityHubCardTaskId)
    )
  } else if (props.match.params && props.match.params.taskId) {
    // if (props.match.params.taskId === undefined && aoStore.currentCard === null)
    // {
    //   // do nothing
    // }
    // else
    {
      let targetTaskId = props.match.params.taskId
      console.log('@: components/Card.tsx: rendering task: ', { targetTaskId })

      aoStore.getTaskById_async(targetTaskId, () => {
        console.log('@: components/Card.tsx: task loaded from server: ', {
          targetTaskId,
          clientSideData: aoStore.hashMap.get(targetTaskId),
        })
        aoStore.setCurrentCard(targetTaskId)
      })
    }
  }

  return (
    <Tour steps={steps} tourOptions={tourOptions}>
      <div id="tour-current-card">
        {
          // <Helmet>
          //   <title>
          //     {//cardText ? cardText + ' - ' : ''
          //     }
          //     {aoStore.state.cash.alias}
          //   </title>
          // </Helmet>
        }
        {<AoDiscardZone />}
        {
          //card ? <AoContextCard taskId={taskId} task={card} cardStyle="full" /> : <AoDrawPile />
          // <AoContextCard taskId={taskId} task={card} cardStyle="full" />
          //taskId?<AoContextCard taskId={taskId} cardStyle="full" />:<div>'AO: components/Card.tsx: taskId not set'</div>
          // <div id="currentContextCard">currentContextCard div: {taskId}
          <div>
            <PageTitleView />
            {
              //<ContextPileView    contextPile={contextPile} />
            }
            <ContextCardView />
          </div>
          // <CardHeadingView    currentContextCard={currentContextCard} />
          // </div>
        }
        {<AoHud />}
      </div>
    </Tour>
  )

  // let taskId =
  //   props.match.params.hasOwnProperty('taskId') && props.match.params.taskId

  // console.log("AO: components/Card.tsx: AoCard:", { props })

  // useEffect(() => {
  //   aoStore.setCurrentCard(taskId);
  //   currentContextCard.setCardItem(taskId);

  //   // setTimeout(() => currentContextCard.cardItem.name = "Woosh", 2000);
  // },
  // [taskId]
  // )

  // useEffect(() => {
  //   if (aoStore.globalRedirect) {
  //     history.push(aoStore.globalRedirect)
  //     aoStore.setGlobalRedirect(null)
  //   }
  // }, [aoStore.globalRedirect])

  // return (
  //   // aoStore.currentCard?<div tabIndex={0} style={{ outline: 'none' }}>
  //   //   { renderCard(aoStore.currentCard, props)
  //   //   }
  //   // </div>:"No taskId"

  // )
  // ReactDOM.render(renderCard(aoStore.currentCard), document.getElementById("root"));
}
