import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import uuidV1 from 'uuid/v1'
import AoTip from './tip'
import AoResourcePanel from './resourcePanel'

@observer
export default class AoResources extends React.PureComponent<{}> {
  constructor(props) {
    super(props)
    this.renderResources = this.renderResources.bind(this)
    this.createResource = this.createResource.bind(this)
  }

  renderResources() {
    const list = aoStore.state.resources.map(r => (
      <li key={r.resourceId}>
        <AoResourcePanel resourceId={r.resourceId} />
      </li>
    ))
    return <ul style={{ listStyleType: 'none' }}>{list}</ul>
  }

  createResource() {
    api.createResource(uuidV1(), 'test', 0, 'asd', true)
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
        {this.renderResources()}
        <div className="action" onClick={this.createResource}>
          Create Test Resource
        </div>
      </React.Fragment>
    )
  }
}
