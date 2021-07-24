import * as React from 'react'
import { observer } from 'mobx-react'
import { computed, makeObservable } from 'mobx';
import { Redirect } from 'react-router-dom'
import aoStore from '../client/store'
import api from '../client/api'
import { goInCard } from '../cards'
import AoPaper from './paper'

interface Props {
  resourceId: string
}

interface State {
  redirect?: string
}

@observer
export default class AoResourcePanel extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props)
    makeObservable(this);
    this.state = {}
    this.useResource = this.useResource.bind(this)
    this.purgeResource = this.purgeResource.bind(this)
    this.goInCard = this.goInCard.bind(this)
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.redirect !== undefined) {
      this.setState({ redirect: undefined })
    }
  }

  @computed get canAfford() {
    const resource = aoStore.resourceById.get(this.props.resourceId)
    if (!resource) {
      return false
    }
    return aoStore.memberCard.boost >= resource.charged
  }

  useResource(event) {
    const resource = aoStore.resourceById.get(this.props.resourceId)
    if (!resource) {
      return
    }
    const notes = event.currentTarget.getAttribute('data-letter')
    api.useResource(this.props.resourceId, 1, resource.charged, notes)
  }

  purgeResource(event) {
    const resource = aoStore.resourceById.get(this.props.resourceId)
    if (!resource) {
      return
    }
    if (
      window.confirm(
        'Are you sure you want to delete this resource? You will have to set up the resource again.'
      )
    ) {
      api.purgeResource(this.props.resourceId)
    }
  }

  @computed get optionsList() {
    const card = aoStore.hashMap.get(this.props.resourceId)
    if (!card) {
      return []
    }
    let ol = card.priorities.map(taskId => {
      const option = aoStore.hashMap.get(taskId)
      if (!option) {
        return null
      }
      const split = option.name.split(':')
      if (split.length >= 2) {
        return [split[0], split[1], option.color] // notes, name, color
      } else {
        return ['A', option.name, option.color]
      }
    })
    if (ol.length < 1) {
      ol = [['A', 'Use', 'blue']]
    }
    // return ol.filter(list => {
    //     return !!list
    // })
    return ol
  }

  goInCard(event) {
    console.log('goinCardResource')
    event.stopPropagation()

    const card = aoStore.hashMap.get(this.props.resourceId)
    if (!card) {
      console.log('missing card')
      return
    }

    goInCard(card.taskId)
    this.setState({ redirect: this.props.resourceId })
  }

  render() {
    if (this.state.redirect !== undefined) {
      return <Redirect to={this.state.redirect} />
    }

    const resource = aoStore.resourceById.get(this.props.resourceId)
    if (!resource) {
      return <div>Invalid resource</div>
    }
    const renderOptions = this.optionsList.map(option => {
      const [notes, name, color] = option
      return (
        <div className="option">
          <AoPaper color={color} />
          <button
            type="button"
            className="action"
            onClick={this.useResource}
            data-letter={notes}
            disabled={!this.canAfford}
            key={notes + '-' + name}>
            {notes}: {name}
          </button>
        </div>
      )
    })

    return (
      <div className="resource" onDoubleClick={this.goInCard}>
        <AoPaper taskId={this.props.resourceId} />
        <div className="name">{resource.name}</div>
        <span
          className="action corner"
          onClick={this.purgeResource}
          data-resourceid={resource.resourceId}>
          Delete
        </span>
        {renderOptions}
      </div>
    )
  }
}
