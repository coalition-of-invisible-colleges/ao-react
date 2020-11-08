import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import AoServerName from './serverName'
import AoTip from './tip'
import config from '../../configuration'

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
          Connect AOs{' '}
          <AoTip text="Connect AOs peer-to-peer securely over tor." />
        </h3>
        <div>
          Name this AO: <AoServerName />
        </div>
        <p>
          {config.hasOwnProperty('tor') && config.tor.hasOwnProperty('hostname')
            ? 'Tor address: ' + config.tor.hostname
            : 'Tor not set up.'}
        </p>
        {/*<p>Secret: {aoStore.state.loader.token}</p>*/}

        {list.length >= 1 ? (
          <React.Fragment>
            <ul>{list}</ul>
          </React.Fragment>
        ) : (
          <p>No AOs connected.</p>
        )}
      </React.Fragment>
    )
  }
}
