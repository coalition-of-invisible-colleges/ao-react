import React from 'react'
import { Redirect } from 'react-router-dom'
import { ObservableMap, computed } from 'mobx'
import { observer } from 'mobx-react'
import { Route, useParams, useRouteMatch } from 'react-router-dom'
import aoStore, { Task } from '../client/store'
import { TaskContext } from './taskContext'
import AoContextCard from './contextCard'
import AoDiscardZone from './discard'
import AoHud from './hud'

interface CardProps {
  match
}

interface RenderProps {
  card: Task
  redirectCallback: (string) => void
}

@observer
class RenderCard extends React.PureComponent<RenderProps> {
  render() {
    if (!this.props.card) {
      return <p>Invalid card ID.</p>
    }

    const context = {
      card: this.props.card,
      setRedirect: this.props.redirectCallback
    }
    // console.log('RenderCard context is ', context)
    return (
      <TaskContext.Provider value={context}>
        <AoDiscardZone />
        <AoContextCard cardStyle={'full'} />
        <AoHud />
      </TaskContext.Provider>
    )
  }
}

interface State {
  currentCard: Task
  redirect?: string
}

@observer
export default class AoCard extends React.Component<CardProps, State> {
  constructor(props) {
    super(props)
    const card = aoStore.hashMap.get(this.props.match.params.taskId)
    aoStore.setCurrentCard(this.props.match.params.taskId)
    this.state = { currentCard: card }
    this.setRedirect = this.setRedirect.bind(this)
  }

  componentDidUpdate(prevProps) {
    if (this.state.redirect !== undefined) {
      this.setState({ redirect: undefined })
    }
  }

  setRedirect(taskId: string) {
    const card = aoStore.hashMap.get(taskId)
    aoStore.setCurrentCard(taskId)
    aoStore.removeFromContext(taskId)
    this.setState({ redirect: taskId, currentCard: card })
  }

  render() {
    if (this.state.redirect !== undefined) {
      return <Redirect to={this.state.redirect} />
    }

    return (
      <RenderCard
        card={this.state.currentCard}
        redirectCallback={this.setRedirect}
      />
    )
  }
}
