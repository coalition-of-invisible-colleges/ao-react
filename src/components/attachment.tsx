import React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'

import FileType from 'file-type/browser'

async function fetchMeme(hash) {
  const blob = await api.fetchMeme(hash)
  const fileType = await FileType.fromBlob(blob)

  return { fileType, data: blob }
}

interface Props {
  taskId: string
  onNextTrack?: (taskId: string) => void
}

interface State {
  data?
  fileType?
  blob?
  mimeType?: string
  downloadPath?: string
}

@observer
export default class AoAttachment extends React.Component<Props, State> {
  private audioRef = React.createRef<HTMLAudioElement>()

  constructor(props) {
    super(props)
    this.state = {}
    this.loadMeme = this.loadMeme.bind(this)

    const meme = aoStore.memeById.get(props.taskId)
    if (meme) {
      this.loadMeme()
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.taskId !== prevProps.taskId) {
      this.loadMeme()
    }
    if (this.audioRef.current) {
      this.audioRef.current.addEventListener('ended', function () {
        console.log('track finished playing')
      })
    }
  }

  async loadMeme() {
    const meme = aoStore.memeById.get(this.props.taskId)
    if (meme) {
      const { fileType, data } = await fetchMeme(meme.hash)
      if (fileType) {
        var urlCreator = window.URL || window.webkitURL
        var imageUrl = urlCreator.createObjectURL(data)
        this.setState({ fileType, data: imageUrl })
      }
    }
  }

  download(e) {
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card) {
      return null
    }

    let meme = aoStore.memeById.get(card.taskId)
    if (!meme) {
      return null
    }
    api.downloadMeme(meme.hash)
  }

  render() {
    if (!this.props.taskId) {
      return null
    }

    const meme = aoStore.memeById.get(this.props.taskId)
    if (!meme || !this.state.fileType || !this.state.data) {
      return null
    }

    if (this.state.fileType.mime.includes('audio')) {
      return <audio src={this.state.data} ref={this.audioRef} controls />
    } else if (this.state.fileType.mime.includes('video')) {
      return <video src={this.state.data} controls />
    } else {
      return (
        <div className="attachment">
          <img src={this.state.data} alt="attachment" />
        </div>
      )
    }
  }
}
