import * as React from 'react'

import { Helmet } from 'react-helmet'

import {
  computed,
  makeObservable,
  observable,
  reaction,
  comparer,
  runInAction,
} from 'mobx'
import { observer, Observer } from 'mobx-react'
import aoStore, { Task, Member, Resource } from '../client/store'
import api from '../client/api'
import { delay, cancelablePromise } from '../utils'
import Markdown from 'markdown-to-jsx'
import AoPaper from './paper'
import AoGrid from './grid'
import AoStack from './stack'
import AoCompleted from './completed'
import AoCardHud from './cardHud'
import AoMission from './mission'
import AoAttachment from './attachment'
import AoCoin from './coin'
import AoBird from './bird'
import AoPreview from './preview'
import AoCheckmark from './checkmark'
import AoMetric from './metric'
import AoMemberIcon from './memberIcon'
import BlankBadge from '../assets/images/badge_blank.svg'
import Boat from '../assets/images/boat.svg'
import { goInCard, prioritizeCard, subTaskCard, CardZone } from '../cardTypes'
import AoDragZone from './dragZone'
// import AoProposals from './proposals'

export type CardStyle =
  | 'priority'
  | 'face'
  | 'full'
  | 'compact'
  | 'mini'
  | 'badge'
  | 'checkmark'
  | 'context'
  | 'mission'
  | 'member'

export interface DragContext {
  zone: CardZone
  level?: number
  inId?: string
  x?: number
  y: number
}

interface CardProps {
  // task: string
  task: Task
  cardStyle?: CardStyle
  inlineStyle?: React.CSSProperties
  noContextOnFull?: boolean
  noPopups?: boolean
  noFindOnPage?: boolean
  inId?: string
  padTop?: boolean
}

interface State {
  showPriorities?: boolean
  showProjects?: boolean
  // loadedFromServer: boolean
  confirmedLoadedAllChildren: boolean
  renderMeNowPlease?: boolean
}

// const AoContextCard =
//     (props) =>
//     {
//       console.log("AO: components/AoContextCard: ", {props});

//       let card = aoStore.hashMap.get(props.taskId);

//       return <Helmet><title>{card.loadedFromServer?card.name:"loading..."}</title></Helmet>
//     };

// export default observable(AoContextCard);

export default class AoContextCard extends React.Component<CardProps, State> {
  constructor(props) {
    super(props)
    // makeObservable(this);

    this.state = { confirmedLoadedAllChildren: false } //task:this.props.task};

    // let loadedTask = props.task;
    // this.props.taskLoaded = loadedTask?true:false
    // this.props.task = this.props.task

    this.togglePriorities = this.togglePriorities.bind(this)
    this.toggleProjects = this.toggleProjects.bind(this)
    this.newPriority = this.newPriority.bind(this)
    this.newSubTask = this.newSubTask.bind(this)
    this.goInCard = this.goInCard.bind(this)
    this.refocusAll = this.refocusAll.bind(this)
    this.onHover = this.onHover.bind(this)
    this.renderCardContent = this.renderCardContent.bind(this)
    this.clearPendingPromise = this.clearPendingPromise.bind(this)

    this.taskHasLoadedAllChildren = false
  }

  taskName
  taskHasLoadedAllChildren

  executeOnUnmount_list = []

  loadChildTasksAndPossiblyReRender() {
    // console.log('AO: components/contextCard.tsx: loadChildTasksAndReRender: ', {
    //   props: this.props,
    //   state: this.state,
    // })

    // if (forceReload === true) this.setState({"confirmedLoadedAllChildren":false})

    // this code will try to load all the subcards of this card using local client and server async
    //   if all the cards are already on the client, it will finish synchronously, discarding the
    //   response of the async callback
    if (!this.props.task) return
    if (this.props.cardStyle !== 'full') return

    this.taskHasLoadedAllChildren = false

    let currentLoadedState = aoStore.getAllLinkedCardsForThisTaskId_async(
      this.props.task.taskId,
      stateRequiresUpdate => {
        // console.log(
        //   'AO: components/contextCard.tsx: loadChildTasksAndReRender: running callback after loading all child cards',
        //   { stateRequiresUpdate }
        // )

        if (stateRequiresUpdate === true) {
          // this.childComponentsLastUpdated = Date.now()
          this.taskHasLoadedAllChildren = true
          this.setState({ renderMeNowPlease: true })
        }
      }
    )
    if (currentLoadedState !== false) {
      // this.setState({confirmedLoadedAllChildren: true})
      this.taskHasLoadedAllChildren = true
    }
  }

  onPropsTaskChangeFunction() {
    this.loadChildTasksAndPossiblyReRender()
    this.taskName = this.props.task ? this.props.task.name : 'No Task'

    if (this.props.cardStyle === 'full') {
      if (
        aoStore.context.length === 0 &&
        this.props.task &&
        this.props.task.taskId !== aoStore.member.memberId
      ) {
        runInAction(() => aoStore.context.push(aoStore.member.memberId))
      }

      if (this.props.task && this.props.task.taskId) {
        aoStore.removeFromContext(this.props.task.taskId)
      }
    }
  }

  subCardsReaction
  registerSubCardsReaction() {
    if (this.subCardsReaction) this.subCardsReaction()
    this.subCardsReaction = reaction(
      () => {
        let toReturn = []

        if (!this.props.task || this.props.cardStyle !== 'full') {
          // do nothing
        } else {
          this.props.task &&
            this.props.task.priorities &&
            this.props.task.priorities.length
          this.props.task &&
            this.props.task.subTasks &&
            this.props.task.subTasks.length
          this.props.task &&
            this.props.task.completed &&
            this.props.task.completed.length
          this.props.task && this.props.task.grid && this.props.task.grid.rows
          this.props.task && this.props.task.aoGridToolDoNotUpdateUI

          toReturn = this.allSubCardItems
          toReturn.push(
            this.props.task && this.props.task.aoGridToolDoNotUpdateUI
          )

          // }
          // console.log(
          //   'AO: components/contextCard.tsx: projectCardsReaction: testPhase',
          //   {
          //     taskName: this.taskName,
          //     task: this.props.task,
          //     taskHasLoadedAllChildren: this.taskHasLoadedAllChildren,
          //     aoGridToolDoNotUpdateUI:
          //       this.props.task && this.props.task.aoGridToolDoNotUpdateUI,
          //     toReturn,
          //   }
          // )
        }
        return toReturn
      },
      projectCards => {
        // console.log(
        //   'AO: components/contextCard.tsx: projectCardsReaction: actionPhase',
        //   { taskName: this.taskName }
        // )
        if (
          this.taskHasLoadedAllChildren === true &&
          this.props.task.aoGridToolDoNotUpdateUI !== true
        ) {
          this.setState({ renderMeNowPlease: true })
        }
      },
      { equals: comparer.structural }
    )
  }

  componentDidMount() {
    //console.log("AO: components/contextCard.tsx: componentDidMount: ", {"props": this.props, "state": this.state})

    this.onPropsTaskChangeFunction()
    this.registerSubCardsReaction()

    // this code will try to load all the subcards of this card using local client and server async
    //   if all the cards are already on the client, it will finish synchronously, discarding the
    //   response of the async callback
    // if (! this.props.task) return

    // if (this.state.confirmedLoadedAllChildren === false)
    // {
    //   let currentLoadedState = aoStore.getAllLinkedCardsForThisTaskId_async
    //       ( this.props.task.taskId,
    //         (stateRequiresUpdate) =>
    //         {
    //           console.log("AO: components/contextCard.tsx: componentDidMount: running callback after loading all child cards", {stateRequiresUpdate})
    //           if (stateRequiresUpdate === true)
    //           { this.setState({confirmedLoadedAllChildren: true})
    //           }
    //         }
    //       )
    //   if (currentLoadedState !== false)
    //   {
    //     this.setState({confirmedLoadedAllChildren: true})
    //   }
    // }

    // this.loadChildTasksAndReRender(true)

    // here we want to track the subCards and rerender when they change
    // if (this.props.cardStyle === "full")
    // {
    // let unMountReactionFunction =

    // this.executeOnUnmount_list.push(unMountReactionFunction)
    // }
  }

  componentDidUpdate(prevProps) {
    this.onPropsTaskChangeFunction()
    this.registerSubCardsReaction()

    // this.childComponentsLastUpdated = Date.now()

    //console.log("AO: components/contextCard.tsx: componentDidUpdate", {"props": this.props, "state": this.state, prevProps})

    // if (this.props.task && prevProps.task && this.props.task.taskId === prevProps.task.taskId)
    // {
    //   // do nothing
    // }
    // else
    // {
    //   // re-render card
    //   // this.loadChildTasksAndReRender(true)

    // }
  }

  componentWillUnmount() {
    //console.log("AO: components/contextCard.tsx: componentWillUnmount", {"props": this.props, "state": this.state})

    this.clearPendingPromise()
    if (this.subCardsReaction) this.subCardsReaction()

    // this.executeOnUnmount_list.forEach ( fn => fn() );
  }

  pendingPromise = undefined

  clearPendingPromise() {
    if (this.pendingPromise) {
      this.pendingPromise.cancel()
    }
    this.pendingPromise = undefined
  }

  @computed get allSubCardItems() {
    let debuggingOutput = []

    const card = this.props.task
    if (!card) return []

    let toReturn = []
    let allSubCards = []

    let subCardArrayList = [card.priorities, card.subTasks, card.completed]

    subCardArrayList.forEach((subCardArray, index) => {
      subCardArray.forEach(cardItem => {
        toReturn.push(index + ':' + cardItem)
      })
    })

    // allSubCards.forEach(tId => {
    //     let subCard = aoStore.hashMap.get(tId)
    //     debuggingOutput.push({tId, subCard})
    //     if (subCard) {
    //        toReturn.push(subCard.taskId)
    //     }
    // })

    if (card.grid && card.grid.rows) {
      Object.entries(card.grid.rows).forEach(([y, row]) => {
        Object.entries(row).forEach(([x, cell]) => {
          // let gridCard = aoStore.hashMap.get(cell)
          debuggingOutput.push({ y, x, cell })
          toReturn.push(y + ':' + x + ':' + cell)
        })
      })
    }

    //console.log("AO: components/contextCard.tsx: allSubCardItems complete", {"taskName": this.taskName, allSubCards, "grid":card.grid, toReturn, debuggingOutput})

    return toReturn
  }

  get projectCards() {
    if (this.props.cardStyle !== 'mission') {
      return undefined
    }
    let debuggingOutput = []

    const card = this.props.task
    if (!card) return []

    let projectCards: Task[] = []
    let allSubCards = [].concat(card.priorities, card.subTasks, card.completed)

    allSubCards.forEach(tId => {
      let subCard = aoStore.hashMap.get(tId)
      debuggingOutput.push({ tId, subCard })
      if (subCard) {
        if (
          subCard.guild &&
          subCard.guild.length >= 1 &&
          subCard.deck.length >= 1
        ) {
          projectCards.push(subCard)
        }
      }
    })

    if (card.grid && card.grid.rows) {
      Object.entries(card.grid.rows).forEach(([y, row]) => {
        Object.entries(row).forEach(([x, cell]) => {
          let gridCard = aoStore.hashMap.get(cell)
          debuggingOutput.push({ y, x, cell, gridCard })
          if (
            gridCard &&
            gridCard.guild &&
            gridCard.guild.length >= 1 &&
            gridCard.deck.length >= 1
          ) {
            projectCards.push(gridCard)
          }
        })
      })
    }

    //console.log("AO: components/contextCard.tsx: projectCards complete", {"taskName": this.taskName, allSubCards, "grid":card.grid, projectCards, debuggingOutput})

    return projectCards
  }

  togglePriorities(event) {
    event.stopPropagation()
    event.nativeEvent.stopImmediatePropagation()
    if (!this.state.showPriorities) {
      this.setState({ showPriorities: true, showProjects: false })
    } else {
      this.setState({ showPriorities: false })
    }
  }

  toggleProjects(event) {
    event.nativeEvent.stopImmediatePropagation()
    if (!this.state.showProjects) {
      this.setState({ showProjects: true, showPriorities: false })
    } else {
      this.setState({ showProjects: false })
    }
  }

  newPriority(name: string) {
    const card = this.props.task
    if (!card) {
      console.log('missing card')
    }
    api
      .findOrCreateCardInCard(name, card.taskId, true)
      .then(() => this.setState({ renderMeNowPlease: true }))
  }

  newSubTask(name: string) {
    const card = this.props.task
    if (!card) {
      console.log('missing card')
    }
    api
      .findOrCreateCardInCard(name, card.taskId)
      .then(() => this.setState({ renderMeNowPlease: true }))
  }

  goInCard(event) {
    const card = this.props.task
    if (!card) {
      console.log('missing card')
      return
    }
    // if (this.props.cardStyle !== "context") aoStore.addToContext([aoStore.currentCard])
    let thisCardIsRenderedInTheContextStack = this.props.cardStyle === 'context'
    goInCard(
      card.taskId,
      thisCardIsRenderedInTheContextStack,
      !thisCardIsRenderedInTheContextStack
    )
    // aoStore.setGlobalRedirect(card.taskId)
  }

  refocusAll() {
    api.refocusPile(this.props.task.taskId)
  }

  async onHover(event) {
    // event.preventDefault()
    // const card = this.props.task
    // if (
    //   card.seen &&
    //   card.seen.some(s => s.memberId === aoStore.member.memberId)
    // ) {
    //   return
    // }
    // if (this.pendingPromise !== undefined) {
    //   return
    // }
    // this.pendingPromise = cancelablePromise(delay(2000))
    // return this.pendingPromise.promise
    //   .then(() => {
    //     if (
    //       !card.seen ||
    //       (card.seen &&
    //         !card.seen.some(s => s.memberId === aoStore.member.memberId))
    //     ) {
    //       api.markSeen(this.props.task.taskId)
    //     }
    //     this.clearPendingPromise()
    //   })
    //   .catch(errorInfo => {
    //     // rethrow the error if the promise wasn't
    //     // rejected because of a cancelation
    //     this.clearPendingPromise()
    //     if (!errorInfo.isCanceled) {
    //       throw errorInfo.error
    //     }
    //   })
  }

  @computed get applyClassIfCurrentSearchResult() {
    if (this.props.noFindOnPage) {
      return ''
    }
    if (
      aoStore.searchResults &&
      aoStore.searchResults.hasOwnProperty('all') &&
      aoStore.searchResults.all.some(task => {
        return task.taskId === this.props.task.taskId
      })
    ) {
      return ' searchedOnPage'
    }
    return ''
  }

  renderCardContent(content: string, hideIframes = false) {
    // hideIframes doesn't  work. it's supposed to hide YouTube embeds in the mini card.
    const meme = aoStore.memeById.get(this.props.task.taskId)
    let memeContent
    if (meme) {
      memeContent =
        '<a href="' +
        '/memes/' +
        meme.filename +
        '" download >' +
        content +
        '</a>'
    }

    return (
      <Markdown
        options={{
          forceBlock: false,
          overrides: {
            a: {
              props: {
                target: '_blank',
              },
            },
            iframe: {
              props: {
                display: hideIframes ? 'inherit' : 'none',
              },
            },
          },
        }}>
        {memeContent ? memeContent : content}
      </Markdown>
    )
  }

  @computed get priorityCards() {
    const card = this.props.task
    if (card.priorities && card.priorities.length >= 1) {
      return card.priorities
        .map(tId => aoStore.hashMap.get(tId))
        .filter(t => t?.deck?.length >= 1)
    }
    return null
  }

  @computed get renderedUpboats() {
    const card = this.props.task
    const upboats = {}
    this.priorityCards?.forEach((priority, i) => {
      let allocatedHere = 0
      if (Array.isArray(card.allocations)) {
        card.allocations.some(allocation => {
          if (allocation.allocatedId === priority.taskId) {
            allocatedHere = allocation.amount
          }
        })
      }
      const totalAllocatedHere = priority.boost + allocatedHere
      upboats[priority.taskId] = (
        <div
          onClick={() => api.allocatePriority(card.taskId, priority.taskId)}
          className="allocate">
          <img src={Boat} />
          {totalAllocatedHere > 0 && (
            <div className="allocation">{totalAllocatedHere}</div>
          )}
        </div>
      )
      if (i === this.priorityCards.length - 1) {
        upboats[priority.taskId] = (
          <div>
            <AoMetric taskId={priority.taskId} inId={card.taskId} />
            {upboats[priority.taskId]}
          </div>
        )
      }
    })

    return upboats
  }

  render = () => {
    const card = this.props.task
    if (!card) {
      return (
        <div className={'card ' + this.props.cardStyle + ' loading'}>
          <div className="content">
            <div className="spinner" />
          </div>
        </div>
      )
    }

    const taskId = card.taskId
    let member
    let content = card.name

    if (taskId === content) {
      member = aoStore.memberById.get(taskId)
      if (member) {
        content = member.name
      } else {
        const resource = aoStore.resourceById.get(taskId)
        if (resource) {
          content = resource.name
        }
      }
    }

    let priorityCards: Task[] = this.priorityCards

    let subTaskCards: Task[]
    if (card.subTasks && card.subTasks.length >= 1) {
      subTaskCards = card.subTasks
        .map(tId => aoStore.hashMap.get(tId))
        .filter(t => t?.deck?.length >= 1)
    }

    const cardStyle = this.props.cardStyle ? this.props.cardStyle : 'face'
    // console.log('AO: components/contextCard.tsx: render: ', {
    //   taskId,
    //   cardStyle,
    // })

    switch (cardStyle) {
      case 'context':
        return (
          <div
            className={'card context' + this.applyClassIfCurrentSearchResult}
            id={'card-' + taskId}
            onClick={this.goInCard}
            onMouseEnter={this.onHover}
            onMouseOver={this.onHover}
            onMouseOut={this.clearPendingPromise}
            style={this.props.inlineStyle ? this.props.inlineStyle : null}>
            <AoPaper taskId={taskId} />
            <AoCardHud taskId={taskId} hudStyle="context" />
            <div className="content">
              {member && <AoMemberIcon memberId={taskId} />}
              {this.renderCardContent(content)}
            </div>
          </div>
        )
      case 'member':
      case 'priority':
        const isGrabbed = card.deck.indexOf(aoStore.member.memberId) >= 0
        return (
          <div
            id={'card-' + taskId}
            className={
              'card priority' +
              this.applyClassIfCurrentSearchResult +
              (this.state.showPriorities ? ' padbottom' : '')
            }
            onClick={this.goInCard}
            onMouseEnter={this.onHover}
            onMouseOver={this.onHover}
            onMouseOut={this.clearPendingPromise}>
            <AoPaper taskId={taskId} />
            <AoCardHud
              taskId={taskId}
              hudStyle="collapsed"
              prioritiesShown={this.state.showPriorities}
              onTogglePriorities={this.togglePriorities}
            />
            <div className="content">
              {isGrabbed && card.taskId !== card.name ? (
                <AoBird taskId={taskId} />
              ) : (
                <AoCoin taskId={taskId} noPopups={this.props.noPopups} />
              )}
              {member && <AoMemberIcon memberId={taskId} />}
              <AoAttachment taskId={taskId} inId={this.props.inId} />
              {this.renderCardContent(content)}
            </div>
            {this.state.showPriorities ? (
              <AoStack
                inId={taskId}
                cards={priorityCards}
                cardStyle="priority"
                zone="priorities"
              />
            ) : null}
          </div>
        )
      case 'face':
      case 'compact':
        return (
          <div
            id={'card-' + taskId}
            className={
              'card ' +
              this.props.cardStyle +
              this.applyClassIfCurrentSearchResult
            }
            onClick={this.goInCard}
            onMouseEnter={this.onHover}
            onMouseOver={this.onHover}
            onMouseOut={this.clearPendingPromise}>
            <AoPaper taskId={taskId} />
            <AoCardHud
              taskId={taskId}
              hudStyle="face before"
              inId={this.props.inId}
            />
            <div
              className={
                'content' + (card.priorities.length < 1 ? ' padBefore' : '')
              }>
              <AoMission taskId={taskId} hudStyle="face before" />
              {member && <AoMemberIcon memberId={taskId} />}
              <AoAttachment taskId={taskId} inId={this.props.inId} />
              {this.renderCardContent(content)}
              {card.priorities && card.priorities.length >= 1 ? (
                <>
                  <div className="action" onClick={this.togglePriorities}>
                    {card.priorities.length}{' '}
                    {card.priorities.length > 1 ? 'priorities' : 'priority'}{' '}
                    {this.state.showPriorities ? (
                      <React.Fragment>&#8963;</React.Fragment>
                    ) : (
                      <React.Fragment>&#8964;</React.Fragment>
                    )}
                  </div>
                  {this.state.showPriorities ? (
                    <AoStack
                      inId={taskId}
                      cards={priorityCards}
                      showAdd={false}
                      hideAddWhenCards={true}
                      addButtonText="+priority"
                      cardStyle="priority"
                      onNewCard={this.newPriority}
                      onDrop={prioritizeCard}
                      zone="priorities"
                    />
                  ) : null}
                </>
              ) : null}
            </div>
            <AoCardHud
              taskId={taskId}
              hudStyle="face after"
              noPopups={this.props.noPopups}
            />
          </div>
        )
      case 'full':
        const grid = card.grid
        return (
          <React.Fragment>
            {this.props.noContextOnFull ? (
              ''
            ) : (
              <div
                id="context"
                style={{
                  marginTop: this.props.padTop ? '4em' : 'inherit',
                }}>
                <Observer>
                  {() => {
                    return (
                      <AoStack
                        cards={aoStore.contextCards}
                        cardStyle="context"
                        alwaysShowAll={true}
                        zone="context"
                        doNotReverseList={true}
                      />
                    )
                  }}
                </Observer>
              </div>
            )}
            <div
              id={'card-' + taskId}
              className={'card full' + this.applyClassIfCurrentSearchResult}
              onDrop={e => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onMouseEnter={this.onHover}
              onMouseOver={this.onHover}
              onMouseOut={this.clearPendingPromise}>
              <Observer>
                {() => {
                  return (
                    <AoDragZone
                      taskId={taskId}
                      dragContext={{
                        zone: 'card',
                        inId: null,
                        y: 0,
                      }}>
                      <AoPaper taskId={taskId} />
                    </AoDragZone>
                  )
                }}
              </Observer>
              <Observer>
                {() => <AoCardHud taskId={taskId} hudStyle="full before" />}
              </Observer>
              <Observer>
                {() => {
                  return (
                    <div
                      className={
                        'content' +
                        (card.priorities.length < 1 &&
                        (!card.grid ||
                          (card.grid && card.grid.height < 1) ||
                          card.grid.width < 1)
                          ? ' padBefore'
                          : '')
                      }>
                      <AoMission taskId={taskId} hudStyle="full before" />
                      {member && <AoMemberIcon memberId={taskId} />}
                      <AoAttachment taskId={taskId} inId={this.props.inId} />
                      {this.renderCardContent(content)}
                    </div>
                  )
                }}
              </Observer>
              {/*              <Observer>
                {() => {
                  if (card.guild) {
                    return <AoProposals filterByGuildId={taskId} />
                  } else {
                    return <div />
                  }
                }}
              </Observer>
*/}{' '}
              <Observer>
                {() => {
                  return (
                    <AoStack
                      inId={taskId}
                      cards={priorityCards}
                      showAdd={false}
                      hideAddWhenCards={true}
                      addButtonText="+priority"
                      cardStyle="priority"
                      onNewCard={this.newPriority}
                      onDrop={prioritizeCard}
                      zone="priorities"
                      decorators={this.renderedUpboats}
                    />
                  )
                }}
              </Observer>
              <Observer>
                {() => {
                  if (priorityCards && priorityCards.length > 6) {
                    return (
                      <div className="refocusAll">
                        <button className="action" onClick={this.refocusAll}>
                          refocus
                        </button>
                      </div>
                    )
                  } else {
                    return <div />
                  }
                }}
              </Observer>
              <Observer>
                {() => (
                  <AoGrid
                    grid={card.grid}
                    taskId={taskId}
                    height={card.grid?.height}
                    width={card.grid?.width}
                    gridStyle={card.gridStyle}
                  />
                )}
              </Observer>
              <Observer>
                {() => {
                  return (
                    <AoStack
                      inId={taskId}
                      cards={subTaskCards}
                      showAdd={false}
                      cardStyle="face"
                      onNewCard={this.newSubTask}
                      onDrop={subTaskCard}
                      zone="subTasks"
                    />
                  )
                }}
              </Observer>
              <Observer>
                {() => {
                  return <AoCompleted taskId={taskId} />
                }}
              </Observer>
              <Observer>
                {() => {
                  return <AoCardHud taskId={taskId} hudStyle="full after" />
                }}
              </Observer>
            </div>
          </React.Fragment>
        )
      case 'checkmark':
        return (
          <div
            id={'card-' + taskId}
            className={'card checkmark' + this.applyClassIfCurrentSearchResult}
            onMouseEnter={this.onHover}
            onMouseOver={this.onHover}
            onMouseOut={this.clearPendingPromise}>
            <AoCheckmark taskId={taskId} onGoIn={this.goInCard} />
            <div className="content">{this.renderCardContent(content)}</div>
          </div>
        )
      case 'mission':
        // A format that emphasizes the mission and projects (sub-missions), for the Missions Index
        const projectCards = this.projectCards
        return (
          <div
            className={
              'card mission' +
              (this.state.showPriorities ? ' padbottom' : '') +
              this.applyClassIfCurrentSearchResult
            }
            id={'card-' + taskId}
            onClick={this.goInCard}
            onMouseEnter={this.onHover}
            onMouseOver={this.onHover}
            onMouseOut={this.clearPendingPromise}>
            <AoPaper taskId={taskId} />
            <AoCardHud taskId={taskId} hudStyle="collapsed-mission" />
            <div className="content">
              <AoMission taskId={taskId} hudStyle="collapsed" />
              <AoPreview
                taskId={taskId}
                hudStyle="collapsed"
                prioritiesShown={this.state.showPriorities}
                onTogglePriorities={this.togglePriorities}
                projectsShown={this.state.showProjects}
                onToggleProjects={this.toggleProjects}
                hideSubcardCountOnCollapsed={true}
              />
            </div>
            {this.state.showProjects ? (
              <AoStack
                inId={taskId}
                cards={projectCards}
                cardStyle="mission"
                zone="panel"
              />
            ) : null}
            {this.state.showPriorities ? (
              <AoStack
                inId={taskId}
                cards={priorityCards}
                cardStyle="priority"
                zone="panel"
              />
            ) : null}
            <div style={{ clear: 'both', height: '1px' }} />
          </div>
        )
      case 'badge':
        return (
          <div
            id={'card-' + taskId}
            className={'card badge' + this.applyClassIfCurrentSearchResult}
            onClick={this.goInCard}
            onMouseEnter={this.onHover}
            onMouseOver={this.onHover}
            onMouseOut={this.clearPendingPromise}>
            <AoPaper taskId={taskId} />
            <AoMission taskId={taskId} hudStyle="badge" />
            <AoCardHud taskId={taskId} hudStyle="badge" />
          </div>
        )
        break
      case 'mini':
      default:
        let shortened = content
        if (shortened.length > 32) {
          shortened = shortened.substr(0, shortened.lastIndexOf(' ', 32))
        }

        return (
          <div
            id={'card-' + taskId}
            className={'card mini' + this.applyClassIfCurrentSearchResult}
            onClick={this.goInCard}
            onMouseEnter={this.onHover}
            onMouseOver={this.onHover}
            onMouseOut={this.clearPendingPromise}>
            <AoPaper taskId={taskId} />
            <AoCardHud taskId={taskId} hudStyle="mini before" />
            <div className="content">
              {member && <AoMemberIcon memberId={taskId} />}
              <AoAttachment taskId={taskId} inId={this.props.inId} />
              {this.renderCardContent(content, true)}
            </div>
            <AoCardHud taskId={taskId} hudStyle="mini after" />
          </div>
        )
    }
  }

  // version from merge, I think there are no issues here, but the git merge had this entire content as one conflict, for some reason
  //   constructor(props) {
  //     super(props)
  //     makeObservable(this)
  //     this.state = {}
  //     this.togglePriorities = this.togglePriorities.bind(this)
  //     this.toggleProjects = this.toggleProjects.bind(this)
  //     this.newPriority = this.newPriority.bind(this)
  //     this.newSubTask = this.newSubTask.bind(this)
  //     this.goInCard = this.goInCard.bind(this)
  //     this.refocusAll = this.refocusAll.bind(this)
  //     this.onHover = this.onHover.bind(this)
  //     this.renderCardContent = this.renderCardContent.bind(this)
  //     this.clearPendingPromise = this.clearPendingPromise.bind(this)
  //   }

  //   componentWillUnmount() {
  //     this.clearPendingPromise()
  //   }

  //   pendingPromise = undefined

  //   clearPendingPromise() {
  //     if (this.pendingPromise) {
  //       this.pendingPromise.cancel()
  //     }
  //     this.pendingPromise = undefined
  //   }

  //   togglePriorities(event) {
  //     event.stopPropagation()
  //     event.nativeEvent.stopImmediatePropagation()
  //     if (!this.state.showPriorities) {
  //       this.setState({ showPriorities: true, showProjects: false })
  //     } else {
  //       this.setState({ showPriorities: false })
  //     }
  //   }

  //   toggleProjects(event) {
  //     event.stopPropagation()
  //     event.nativeEvent.stopImmediatePropagation()
  //     if (!this.state.showProjects) {
  //       this.setState({ showProjects: true, showPriorities: false })
  //     } else {
  //       this.setState({ showProjects: false })
  //     }
  //   }

  //   newPriority(name: string) {
  //     const card = this.props.task
  //     if (!card) {
  //       console.log('missing card')
  //     }
  //     api.findOrCreateCardInCard(name, card.taskId, true)
  //   }

  //   newSubTask(name: string) {
  //     const card = this.props.task
  //     if (!card) {
  //       console.log('missing card')
  //     }
  //     api.findOrCreateCardInCard(name, card.taskId)
  //   }

  //   goInCard(event) {
  //     event.stopPropagation()

  //     const card = this.props.task
  //     if (!card) {
  //       console.log('missing card')
  //       return
  //     }

  //     goInCard(card.taskId, this.props.cardStyle === 'context')
  //     aoStore.setGlobalRedirect(card.taskId)
  //   }

  //   refocusAll() {
  //     api.refocusPile(this.props.task.taskId)
  //   }

  //   async onHover(event) {
  //     event.preventDefault()
  //     event.stopPropagation()
  //     const card = this.props.task
  //     if (
  //       card.seen &&
  //       card.seen.some(s => s.memberId === aoStore.member.memberId)
  //     ) {
  //       return
  //     }

  //     if (this.pendingPromise !== undefined) {
  //       return
  //     }

  //     this.pendingPromise = cancelablePromise(delay(2000))
  //     return this.pendingPromise.promise
  //       .then(() => {
  //         if (
  //           !card.seen ||
  //           (card.seen &&
  //             !card.seen.some(s => s.memberId === aoStore.member.memberId))
  //         ) {
  //           api.markSeen(this.props.task.taskId)
  //         }
  //         this.clearPendingPromise()
  //       })
  //       .catch(errorInfo => {
  //         // rethrow the error if the promise wasn't
  //         // rejected because of a cancelation
  //         this.clearPendingPromise()
  //         if (!errorInfo.isCanceled) {
  //           throw errorInfo.error
  //         }
  //       })
  //   }

  //   @computed get applyClassIfCurrentSearchResult() {
  //     if (this.props.noFindOnPage) {
  //       return ''
  //     }
  //     if (
  //       aoStore.searchResults &&
  //       aoStore.searchResults.hasOwnProperty('all') &&
  //       aoStore.searchResults.all.some(task => {
  //         return task.taskId === this.props.task.taskId
  //       })
  //     ) {
  //       return ' searchedOnPage'
  //     }
  //     return ''
  //   }

  //   renderCardContent(content: string, hideIframes = false) {
  //     // hideIframes doesn't  work. it's supposed to hide YouTube embeds in the mini card.
  //     const meme = aoStore.memeById.get(this.props.task.taskId)
  //     let memeContent
  //     if (meme) {
  //       memeContent =
  //         '<a href="' +
  //         '/download/' +
  //         meme.hash +
  //         '" download >' +
  //         content +
  //         '</a>'
  //     }

  //     return (
  //       <Markdown
  //         options={{
  //           forceBlock: false,
  //           overrides: {
  //             a: {
  //               props: {
  //                 target: '_blank',
  //               },
  //             },
  //             iframe: {
  //               props: {
  //                 display: hideIframes ? 'inherit' : 'none',
  //               },
  //             },
  //           },
  //         }}>
  //         {memeContent ? memeContent : content}
  //       </Markdown>
  //     )
  //   }

  //   projectCards() {
  //     if (this.props.cardStyle !== 'mission') {
  //       return undefined
  //     }
  //     const card = this.props.task

  //     let projectCards: Task[] = []
  //     let allSubCards = card.priorities.concat(card.subTasks, card.completed)

  //     allSubCards.forEach(tId => {
  //       let subCard = aoStore.hashMap.get(tId)
  //       if (subCard) {
  //         if (
  //           subCard.guild &&
  //           subCard.guild.length >= 1 &&
  //           subCard.deck.length >= 1
  //         ) {
  //           projectCards.push(subCard)
  //         }
  //       }
  //     })

  //     if (card.grid && card.grid.rows) {
  //       Object.entries(card.grid.rows).forEach(([y, row]) => {
  //         Object.entries(row).forEach(([x, cell]) => {
  //           let gridCard = aoStore.hashMap.get(cell)
  //           if (
  //             gridCard &&
  //             gridCard.guild &&
  //             gridCard.guild.length >= 1 &&
  //             gridCard.deck.length >= 1
  //           ) {
  //             projectCards.push(gridCard)
  //           }
  //         })
  //       })
  //     }

  //     return projectCards
  //   }

  //   render() {
  //     const card = this.props.task
  //     if (!card) {
  //       console.log('missing card')
  //       return (
  //         <div className={'card ' + this.props.cardStyle}>
  //           <div className="content">missing card</div>
  //         </div>
  //       )
  //     }

  //     const taskId = card.taskId
  //     let member
  //     let content = card.name

  //     if (taskId === content) {
  //       member = aoStore.memberById.get(taskId)
  //       if (member) {
  //         content = member.name
  //       } else {
  //         const resource = aoStore.resourceById.get(taskId)
  //         if (resource) {
  //           content = resource.name
  //         }
  //       }
  //     }

  //     let priorityCards: Task[]
  //     if (card.priorities && card.priorities.length >= 1) {
  //       priorityCards = card.priorities
  //         .map(tId => aoStore.hashMap.get(tId))
  //         .filter(t => t?.deck?.length >= 1)
  //     }

  //     let subTaskCards: Task[]
  //     if (card.subTasks && card.subTasks.length >= 1) {
  //       subTaskCards = card.subTasks
  //         .map(tId => aoStore.hashMap.get(tId))
  //         .filter(t => t?.deck?.length >= 1)
  //     }

  //     const cardStyle = this.props.cardStyle ? this.props.cardStyle : 'face'

  //     switch (cardStyle) {
  //       case 'context':
  //         return (
  //           <div
  //             className={'card context' + this.applyClassIfCurrentSearchResult}
  //             id={'card-' + taskId}
  //             onClick={this.goInCard}
  //             onMouseEnter={this.onHover}
  //             onMouseOver={this.onHover}
  //             onMouseOut={this.clearPendingPromise}
  //             style={this.props.inlineStyle ? this.props.inlineStyle : null}>
  //             <AoPaper taskId={taskId} />
  //             <AoCardHud taskId={taskId} hudStyle="context" />
  //             <div className="content">
  //               {member && <AoMemberIcon memberId={taskId} />}
  //               {this.renderCardContent(content)}
  //             </div>
  //           </div>
  //         )
  //       case 'member':
  //       case 'priority':
  //         const isGrabbed = card.deck.indexOf(aoStore.member.memberId) >= 0
  //         return (
  //           <div
  //             id={'card-' + taskId}
  //             className={
  //               'card priority' +
  //               this.applyClassIfCurrentSearchResult +
  //               (this.state.showPriorities ? ' padbottom' : '')
  //             }
  //             onDoubleClick={this.goInCard}
  //             onMouseEnter={this.onHover}
  //             onMouseOver={this.onHover}
  //             onMouseOut={this.clearPendingPromise}>
  //             <AoPaper taskId={taskId} />
  //             <AoCardHud
  //               taskId={taskId}
  //               hudStyle="collapsed"
  //               prioritiesShown={this.state.showPriorities}
  //               onTogglePriorities={this.togglePriorities}
  //             />
  //             <div className="content">
  //               {isGrabbed && card.taskId !== card.name ? (
  //                 <AoBird taskId={taskId} />
  //               ) : (
  //                 <AoCoin taskId={taskId} noPopups={this.props.noPopups} />
  //               )}
  //               {member && <AoMemberIcon memberId={taskId} />}
  //               <AoAttachment taskId={taskId} />
  //               {this.renderCardContent(content)}
  //             </div>
  //             {this.state.showPriorities ? (
  //               <AoStack
  //                 inId={taskId}
  //                 cards={priorityCards}
  //                 cardStyle="priority"
  //                 zone="priorities"
  //               />
  //             ) : null}
  //           </div>
  //         )
  //       case 'face':
  //       case 'compact':
  //         return (
  //           <div
  //             id={'card-' + taskId}
  //             className={
  //               'card ' +
  //               this.props.cardStyle +
  //               this.applyClassIfCurrentSearchResult
  //             }
  //             onDoubleClick={this.goInCard}
  //             onMouseEnter={this.onHover}
  //             onMouseOver={this.onHover}
  //             onMouseOut={this.clearPendingPromise}>
  //             <AoPaper taskId={taskId} />
  //             <AoCardHud
  //               taskId={taskId}
  //               hudStyle="face before"
  //               inId={this.props.inId}
  //             />
  //             <div className="content">
  //               <AoMission taskId={taskId} hudStyle="face before" />
  //               {member && <AoMemberIcon memberId={taskId} />}
  //               <AoAttachment taskId={taskId} />
  //               {this.renderCardContent(content)}
  //               {card.priorities && card.priorities.length >= 1 ? (
  //                 <>
  //                   <div className="action" onClick={this.togglePriorities}>
  //                     {card.priorities.length}{' '}
  //                     {card.priorities.length > 1 ? 'priorities' : 'priority'}{' '}
  //                     {this.state.showPriorities ? (
  //                       <React.Fragment>&#8963;</React.Fragment>
  //                     ) : (
  //                       <React.Fragment>&#8964;</React.Fragment>
  //                     )}
  //                   </div>
  //                   {this.state.showPriorities ? (
  //                     <AoStack
  //                       inId={taskId}
  //                       cards={priorityCards}
  //                       showAdd={true}
  //                       hideAddWhenCards={true}
  //                       addButtonText="+priority"
  //                       cardStyle="priority"
  //                       onNewCard={this.newPriority}
  //                       onDrop={prioritizeCard}
  //                       zone="priorities"
  //                     />
  //                   ) : null}
  //                 </>
  //               ) : null}
  //             </div>
  //             <AoCardHud
  //               taskId={taskId}
  //               hudStyle="face after"
  //               noPopups={this.props.noPopups}
  //             />
  //           </div>
  //         )
  //       case 'full':
  //         const grid = card.grid

  //         return (
  //           <React.Fragment>
  //             {this.props.noContextOnFull ? (
  //               ''
  //             ) : (
  //               <div id="context">
  //                 <AoStack
  //                   cards={aoStore.contextCards}
  //                   cardStyle="context"
  //                   alwaysShowAll={true}
  //                   zone="context"
  //                 />
  //               </div>
  //             )}
  //             <div
  //               id={'card-' + taskId}
  //               className={'card full' + this.applyClassIfCurrentSearchResult}
  //               onDrop={e => {
  //                 e.preventDefault()
  //                 e.stopPropagation()
  //               }}
  //               onMouseEnter={this.onHover}
  //               onMouseOver={this.onHover}
  //               onMouseOut={this.clearPendingPromise}>
  //               <AoDragZone
  //                 taskId={taskId}
  //                 dragContext={{
  //                   zone: 'card',
  //                   inId: null,
  //                   y: 0,
  //                 }}>
  //                 <AoPaper taskId={taskId} />
  //               </AoDragZone>
  //               <AoCardHud taskId={taskId} hudStyle="full before" />
  //               <div className="content">
  //                 <AoMission taskId={taskId} hudStyle="full before" />
  //                 {member && <AoMemberIcon memberId={taskId} />}
  //                 <AoAttachment taskId={taskId} />
  //                 {this.renderCardContent(content)}
  //               </div>
  //               {card.guild && <AoProposals filterByGuildId={taskId} />}
  //               <AoStack
  //                 inId={taskId}
  //                 cards={priorityCards}
  //                 showAdd={true}
  //                 hideAddWhenCards={true}
  //                 addButtonText="+priority"
  //                 cardStyle="priority"
  //                 onNewCard={this.newPriority}
  //                 onDrop={prioritizeCard}
  //                 zone="priorities"
  //               />
  //               {priorityCards && priorityCards.length > 6 && (
  //                 <div className="refocusAll">
  //                   <button className="action" onClick={this.refocusAll}>
  //                     refocus
  //                   </button>
  //                 </div>
  //               )}
  //               <AoGrid
  //                 grid={grid}
  //                 taskId={taskId}
  //                 height={grid?.height}
  //                 width={grid?.width}
  //               />
  //               <AoStack
  //                 inId={taskId}
  //                 cards={subTaskCards}
  //                 showAdd={priorityCards && priorityCards.length >= 1}
  //                 addButtonText="+card"
  //                 hideAddWhenCards={true}
  //                 cardStyle="face"
  //                 onNewCard={this.newSubTask}
  //                 onDrop={subTaskCard}
  //                 zone="subTasks"
  //               />
  //               <AoCompleted taskId={taskId} />
  //               <AoCardHud taskId={taskId} hudStyle="full after" />
  //             </div>
  //           </React.Fragment>
  //         )
  //       case 'checkmark':
  //         return (
  //           <div
  //             id={'card-' + taskId}
  //             className={'card checkmark' + this.applyClassIfCurrentSearchResult}
  //             onMouseEnter={this.onHover}
  //             onMouseOver={this.onHover}
  //             onMouseOut={this.clearPendingPromise}>
  //             <AoCheckmark taskId={taskId} onGoIn={this.goInCard} />
  //             <div className="content">{this.renderCardContent(content)}</div>
  //           </div>
  //         )
  //       case 'mission':
  //         // A format that emphasizes the mission and projects (sub-missions), for the Missions Index
  //         const projectCards = this.projectCards()
  //         return (
  //           <div
  //             className={
  //               'card mission' +
  //               (this.state.showPriorities ? ' padbottom' : '') +
  //               this.applyClassIfCurrentSearchResult
  //             }
  //             id={'card-' + taskId}
  //             onDoubleClick={this.goInCard}
  //             onMouseEnter={this.onHover}
  //             onMouseOver={this.onHover}
  //             onMouseOut={this.clearPendingPromise}>
  //             <AoPaper taskId={taskId} />
  //             <AoCardHud taskId={taskId} hudStyle="collapsed-mission" />
  //             <div className="content">
  //               <AoCoin taskId={taskId} />
  //               <AoMission taskId={taskId} hudStyle="collapsed" />
  //               <AoPreview
  //                 taskId={taskId}
  //                 hudStyle="collapsed"
  //                 prioritiesShown={this.state.showPriorities}
  //                 onTogglePriorities={this.togglePriorities}
  //                 projectsShown={this.state.showProjects}
  //                 onToggleProjects={this.toggleProjects}
  //                 hideSubcardCountOnCollapsed={true}
  //               />
  //             </div>
  //             {this.state.showProjects ? (
  //               <AoStack
  //                 inId={taskId}
  //                 cards={projectCards}
  //                 cardStyle="mission"
  //                 zone="panel"
  //               />
  //             ) : null}
  //             {this.state.showPriorities ? (
  //               <AoStack
  //                 inId={taskId}
  //                 cards={priorityCards}
  //                 cardStyle="priority"
  //                 zone="panel"
  //               />
  //             ) : null}
  //             <div style={{ clear: 'both', height: '1px' }} />
  //           </div>
  //         )
  //       case 'badge':
  //         return (
  //           <div
  //             id={'card-' + taskId}
  //             className={'card badge' + this.applyClassIfCurrentSearchResult}
  //             onMouseEnter={this.onHover}
  //             onMouseOver={this.onHover}
  //             onMouseOut={this.clearPendingPromise}>
  //             <AoPaper taskId={taskId} />
  //             <img
  //               className="background"
  //               src={BlankBadge}
  //               onClick={this.goInCard}
  //               id={'card-clickable-' + taskId}
  //             />
  //             <AoMission taskId={taskId} hudStyle="badge" />
  //             <AoCardHud taskId={taskId} hudStyle="badge" />
  //           </div>
  //         )
  //         break
  //       case 'mini':
  //       default:
  //         let shortened = content
  //         if (shortened.length > 32) {
  //           shortened = shortened.substr(0, shortened.lastIndexOf(' ', 32))
  //         }

  //         return (
  //           <div
  //             id={'card-' + taskId}
  //             className={'card mini' + this.applyClassIfCurrentSearchResult}
  //             onDoubleClick={this.goInCard}
  //             onMouseEnter={this.onHover}
  //             onMouseOver={this.onHover}
  //             onMouseOut={this.clearPendingPromise}>
  //             <AoPaper taskId={taskId} />
  //             <AoCardHud taskId={taskId} hudStyle="mini before" />
  //             <div className="content">
  //               {member && <AoMemberIcon memberId={taskId} />}
  //               <AoAttachment taskId={taskId} />
  //               {this.renderCardContent(content, true)}
  //             </div>
  //             <AoCardHud taskId={taskId} hudStyle="mini after" />
  //           </div>
  //         )
  //     }
  //   }
}
