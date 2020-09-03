import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import uuidV1 from 'uuid/v1'

@observer
export default class AoResources extends React.PureComponent<{}> {
  constructor(props) {
    super(props)
    this.renderResources = this.renderResources.bind(this)
  }

  renderResources() {
    const list = aoStore.state.resources.map(r => <li>{r.name}</li>)
    return <ul>{list}</ul>
  }

  createTestResource() {
    api.createResource(uuidV1(), 'test', 0, 'asd', true)
  }

  render() {
    return (
      <React.Fragment>
        <h3>Resource Access</h3>
        <p>
          Connect resources such as door or vending machine using fobtap points
          and raspberry pi running fobtap rfid scan point.
        </p>
        <button type="button" onClick={this.createTestResource}>
          Create Test Resource
        </button>
        {this.renderResources()}
      </React.Fragment>
    )
  }
}
