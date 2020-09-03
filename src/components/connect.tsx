import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'

@observer
export default class AoConnect extends React.PureComponent<{}> {
  constructor(props) {
    super(props)
  }

  render() {
    const list = aoStore.state.ao.map(ao => <li>{ao}</li>)

    return (
      <React.Fragment>
        <h3>Connect AOs</h3>
        <p>Connect AOs securely over tor.</p>
        <p>Tor status: Offline</p>
        {list.length >= 1 ? (
          <React.Fragment>
            <ul>{list}</ul>
          </React.Fragment>
        ) : (
          'No AOs connected.'
        )}
      </React.Fragment>
    )
  }
}
