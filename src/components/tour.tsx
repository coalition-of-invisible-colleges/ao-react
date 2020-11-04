import * as React from 'react'
import { observer } from 'mobx-react'
import Tour from 'react-user-tour'

interface State {
  started: boolean
  step: number
}

@observer
export default class AoTour extends React.PureComponent<{}, State> {
  private tourStart = React.createRef<HTMLDivElement>()

  constructor(props) {
    super(props)
    this.state = { started: false, step: 1 }
    this.startTour = this.startTour.bind(this)
  }

  startTour() {
    console.log('starting tour')
    this.setState({ started: true, step: 1 })
  }

  render() {
    return (
      <div className="tour menu" id="#tourStart">
        <Tour
          active={this.state.started}
          step={this.state.step}
          onNext={step => this.setState({ step })}
          onBack={step => this.setState({ step })}
          onCancel={() => this.setState({ started: false })}
          steps={[
            {
              step: 1,
              selector: '#tourCurrentCard',
              position: 'top-left',
              title: <div style={{ color: 'blue' }}>Welcome!</div>,
              body: (
                <div style={{ color: 'green' }}>
                  {' '}
                  "<strong>Welcome to the AO!</strong>
                  <br />
                  An open-source tool for online and offline communities.{' '}
                  <em>Let's start!</em>"
                </div>
              )
            },
            {
              step: 2,
              selector: '#calendar',
              title: <div style={{ color: 'blue' }}>Community Calendar</div>,
              body: (
                <div style={{ color: 'yellow' }}>
                  This is the calendar. See events here!
                </div>
              )
            }
          ]}
        />
        <div onClick={this.startTour} className={'action'} ref={this.tourStart}>
          Start Tour
        </div>
      </div>
    )
  }
}
