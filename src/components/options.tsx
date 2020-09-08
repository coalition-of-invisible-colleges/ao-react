import * as React from 'react'
import { observer } from 'mobx-react'

@observer
export default class AoOptions extends React.PureComponent<{}> {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <React.Fragment>
        <h3>Server Options</h3>
        <p>No options yet.</p>
      </React.Fragment>
    )
  }
}
