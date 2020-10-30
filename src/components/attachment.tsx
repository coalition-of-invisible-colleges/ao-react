import React from 'react'
import { Link } from 'react-router-dom'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore, { Task } from '../client/store'
import { HudStyle } from './cardHud'
import FileViewer from 'react-file-viewer'
import path from 'path'
import api from '../client/api'

interface Props {
  taskId: string
  hudStyle: HudStyle
}

interface State {
  file?
  filetype?: string
  downloadPath?: string
}

@observer
export default class AoAttachment extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {}
    this.setFile = this.setFile.bind(this)
  }

  componentDidMount() {
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card) return

    let meme = aoStore.memeById.get(card.taskId)
    if (!meme) {
      return
    }

    api.fetchMeme(meme.hash).then(res => {
      console.log('type is ', res.body.type)
      this.setState({
        filetype: res.body.type,
        downloadPath: '/download/' + meme.hash
      })
      var reader = new FileReader()
      reader.readAsDataURL(res.body)
      reader.onload = this.setFile
    })
  }

  setFile(e) {
    console.log('DataURL:', e.target.result)
    this.setState({
      file: e.target.result
    })
  }

  onError(e) {
    console.log(e, 'error in file-viewer')
  }

  render() {
    console.log('file data is ', this.state.file)
    console.log('file type is ', this.state.filetype)

    if (!this.state.file || !this.state.filetype) {
      return null
    }
    // if it's an image, display it
    // otherwise, display a download button
    return (
      <div key={Math.random()}>
        <Link to={this.state.downloadPath}>Attachment</Link>
        {this.state.file && (
          <React.Fragment>
            <FileViewer
              fileType={this.state.filetype}
              filePath={this.state.file}
              onError={this.onError}
            />
            <img src={this.state.file} />
          </React.Fragment>
        )}
      </div>
    )
  }
}
