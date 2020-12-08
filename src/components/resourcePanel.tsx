import * as React from 'react'
import { observer } from 'mobx-react'
import { computed } from 'mobx'
import aoStore from '../client/store'
import api from '../client/api'
import AoPaper from './paper'

interface Props {
  resourceId: string
}

@observer
export default class AoResourcePanel extends React.PureComponent<Props> {
  constructor(props) {
    super(props)
    this.useResource = this.useResource.bind(this)
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
  // <AoPaper taskId={this.props.resourceId} />

  render() {
    const resource = aoStore.resourceById.get(this.props.resourceId)
    if (!resource) {
      return <div>Invalid resource</div>
    }
    const renderOptions = this.optionsList.map(option => {
      const [notes, name, color] = option
      return (
        <button
          type="button"
          className="action"
          onClick={this.useResource}
          data-letter={notes}
          disabled={!this.canAfford}
          key={notes + '-' + name}>
          {notes}: {name}
        </button>
      )
    })
    return (
      <div>
        {/*<h4>{resource.name}</h4>*/}
        {renderOptions}
      </div>
    )
  }
}
