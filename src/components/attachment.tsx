import React from 'react'
import { Link } from 'react-router-dom'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore, { Task } from '../client/store'
import { HudStyle } from './cardHud'
import FileViewer from 'react-file-viewer'
import path from 'path'
import api from '../client/api'
import render from 'render-media'
import From from 'from2'
import dataUriToBuffer from 'data-uri-to-buffer'

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
  private attachmentRef = React.createRef<HTMLDivElement>()

  constructor(props) {
    super(props)
    this.state = {}
    this.loadMeme = this.loadMeme.bind(this)
    this.setFile = this.setFile.bind(this)
    this.download = this.download.bind(this)
  }

  componentDidMount() {
    this.loadMeme()
  }

  componentDidUpdate(prevProps) {
    console.log('attachment updated: ', this.props.taskId)

    if (this.props.taskId !== prevProps.taskId) {
      this.loadMeme()
    }
  }

  loadMeme() {
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
      reader.onload = this.setFile
      reader.readAsDataURL(res.body)
    })
  }

  setFile(e) {
    // console.log('DataURI:', e.target.result)
    var buffer = dataUriToBuffer(e.target.result)

    var file = {
      name: 'attachment.jpg',
      createReadStream: function(opts) {
        if (!opts) opts = {}
        return From([
          buffer.slice(opts.start || 0, opts.end || buffer.length - 1)
        ])
      }
    }

    render.append(file, this.attachmentRef.current, function(err, elem) {
      if (err) return console.error(err.message)

      // console.log(elem) // new element
    })
  }

  download(e) {
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card) return

    let meme = aoStore.memeById.get(card.taskId)
    if (!meme) {
      return
    }
    api.downloadMeme(meme.hash)
  }

  render() {
    // element only attaches when meme downloads
    return <div ref={this.attachmentRef} />
  }
}
