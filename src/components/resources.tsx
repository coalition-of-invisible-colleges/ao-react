import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import uuidV1 from 'uuid/v1'
import AoTip from './tip'

@observer
export default class AoResources extends React.PureComponent<{}> {
  constructor(props) {
    super(props)
    this.renderResources = this.renderResources.bind(this)
    this.createTestResource = this.createTestResource.bind(this)
    this.purgeResource = this.purgeResource.bind(this)
  }

  renderResources() {
    const list = aoStore.state.resources.map(r => (
      <li>
        {r.name}{' '}
        <div
          className="action"
          onClick={this.purgeResource}
          data-resourceid={r.resourceId}>
          Purge
        </div>
      </li>
    ))
    return <ul>{list}</ul>
  }

  createTestResource() {
    api.createResource(uuidV1(), 'test', 0, 'asd', true)
  }

  purgeResource(event) {
    const resourceId: string = event.currentTarget.getAttribute(
      'data-resourceid'
    )
    api.purgeResource(resourceId)
  }

  render() {
    return (
      <React.Fragment>
        <h3>
          Resource Access{' '}
          <AoTip
            text="Connect resources such as door or vending machine using RFID fobtap connected to 
          a raspberry pi. See dctrl-fobtap project on GitHub."
          />
        </h3>
        <button type="button" onClick={this.createTestResource}>
          Create Test Resource
        </button>
        {this.renderResources()}
      </React.Fragment>
    )
  }
}
