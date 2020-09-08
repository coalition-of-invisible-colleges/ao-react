import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import AoServerName from './serverName'
import AoTip from './tip'

@observer
export default class AoConnect extends React.PureComponent<{}> {
  constructor(props) {
    super(props)
  }

  render() {
    const list = aoStore.state.ao.map(ao => <li>{ao}</li>)

    return (
      <React.Fragment>
        <h3>
          Connect AOs <AoTip text="Connect AOs securely over tor." />
        </h3>
        <p>
          Name this AO: <AoServerName />
        </p>
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
