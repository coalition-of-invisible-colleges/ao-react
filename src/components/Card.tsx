import React from 'react'
import ReactDOM from "react-dom"
import { useState, useEffect } from 'react'
import { makeAutoObservable, makeObservable, observable, action, runInAction, reaction } from 'mobx'
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

let getCommunityCard = 
    () =>
    { 
      aoStore.getTaskByName_async
      ( "community hub",
        (communityCard) =>
        {
          if (
              !communityCard ||
              !communityCard.hasOwnProperty('taskId') ||
              !communityCard.taskId
          ) {
              console.log("AO: components/App.tsx: initialising page, creating community hub card on server")
              
              api.createCard('community hub', true).then(result => {
                  const newTaskId = JSON.parse(result.text).event.taskId
                  
                  console.log("AO: components/App.tsx: initialising page, community hub card created: ", { newTaskId });

                  aoStore.setCurrentCard(newTaskId)
                  // setHubId(newTaskId)
                  // initialStateComplete();
              })
          } else {
              console.log("AO: components/App.tsx: initialising page, community hub card found in client state: ", { "taskId": communityCard.taskId });

              aoStore.setCurrentCard(communityCard.taskId)
              // setHubId(communityCard.taskId)
              // initialStateComplete();
          }
        }
      )
    }


export class ContextPile {
  contextPileList         = aoStore.contextCards;

  constructor () {
    makeObservable(this, {contextPileList: observable})
  }

}
const contextPile       = new ContextPile()
const ContextPileView   = observer( ({contextPile}) => <div id="context">
         contextCard.tsx__full__noContextOnFull_false
         <AoStack
           cards={contextPile.contextPileList}
           cardStyle="context"
           alwaysShowAll={true}
           zone="context"
         />
       </div>
  
);



export class CurrentContextCard {
  cardItem = null;
  loadingCardItemFromServer = null;
  history = null;

  constructor() { 
    makeObservable(this, {cardItem: observable}) 
  }

  setCardItem(taskId) {
    let taskIdUrlString = "/task/"

    if (taskId !== null && taskId !== undefined)
    {
      aoStore.getTaskById_async(taskId, (taskItem) => { runInAction(() => { this.cardItem = taskItem; contextPile.contextPileList.push(taskItem)} ) });
      taskIdUrlString += taskId
    }
    else
    {
      runInAction( () => { this.cardItem = null } )
    }
    
    this.history.push(taskIdUrlString)
  }
}
const currentContextCard = new CurrentContextCard();
const currentCardReaction =
    reaction
    ( () => 
      { 
        console.log("AO: client/Card.tsx: currentCardReaction: testPhase: aoStore.currentCard: "+ aoStore.currentCard)
        return aoStore.currentCard 
      },
      (currentCard) => 
      { 
        console.log("AO: client/Card.tsx: currentCardReaction: reactionPhase: aoStore.currentCard: "+ currentCard)
        currentContextCard.setCardItem(currentCard) 
      }
    );

const PageTitleView   = observer( ({currentContextCard}) => <Helmet><title>{currentContextCard.cardItem?currentContextCard.cardItem.name:"Loading..."}</title></Helmet> );

const ContextCardView = observer( 
      ({currentContextCard}) => 
      { 
        console.log("AO: client/Card.tsx: currentCardView: render: aoStore.currentCard: "+ currentContextCard.cardItem)
        if (currentContextCard.cardItem === null) return <AoDrawPile /> 
        else return <AoContextCard task={currentContextCard.cardItem} cardStyle="full" />
      }
    );



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
  currentContextCard.history = history;

  // console.log("AO: components/Card.tsx: AoCard function: ", {props})
  if (props.match.path === "/")
  {
    getCommunityCard()
  }
  else if (props.match.params.taskId !== aoStore.currentCard)
  {
    aoStore.setCurrentCard(props.match.params.taskId);
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
        Card.tsx
        { 
          <AoDiscardZone /> 
        }
        { 
          //card ? <AoContextCard taskId={taskId} task={card} cardStyle="full" /> : <AoDrawPile />
          // <AoContextCard taskId={taskId} task={card} cardStyle="full" />
          //taskId?<AoContextCard taskId={taskId} cardStyle="full" />:<div>'AO: components/Card.tsx: taskId not set'</div>
          // <div id="currentContextCard">currentContextCard div: {taskId}
          <div>
            <PageTitleView      currentContextCard={currentContextCard} />
            {
              //<ContextPileView    contextPile={contextPile} />
            }
            <ContextCardView    currentContextCard={currentContextCard} />
          </div>
          // <CardHeadingView    currentContextCard={currentContextCard} />
          // </div>

        }
        { 
          <AoHud />
        }
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
