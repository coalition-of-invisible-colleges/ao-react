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
    this.createResource = this.createResource.bind(this)
    this.purgeResource = this.purgeResource.bind(this)
  }

  renderResources() {
    const list = aoStore.state.resources.map(r => (
      <li>
        {r.name}{' '}
        <span
          className="action inline"
          onClick={this.purgeResource}
          data-resourceid={r.resourceId}>
          Delete
        </span>
      </li>
    ))
    return <ul style={{ listStyleType: 'none' }}>{list}</ul>
  }

  createResource() {
    api.createResource(uuidV1(), 'test', 0, 'asd', true)
  }

  purgeResource(event) {
    if (
      window.confirm(
        'Are you sure you want to delete this resource? You will have to set up the resource again.'
      )
    ) {
      const resourceId: string = event.currentTarget.getAttribute(
        'data-resourceid'
      )
      api.purgeResource(resourceId)
    }
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
        <div className="action" onClick={this.createResource}>
          Create Resource
        </div>
        {this.renderResources()}
      </React.Fragment>
    )
  }
}
