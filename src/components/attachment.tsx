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
  inId: string
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
  private videoRef = React.createRef<HTMLVideoElement>()

  constructor(props) {
    super(props)
    this.state = {}
    this.loadMeme = this.loadMeme.bind(this)

    const meme = aoStore.memeById.get(props.taskId)
    if (meme) {
      this.loadMeme().then(() => {
        const taskId = this.props.taskId
        const inId = this.props.inId
        let avRef
        if (this.audioRef.current) {
          avRef = this.audioRef
        } else if (this.videoRef.current) {
          avRef = this.videoRef
        }
        if (avRef) {
          if (this.props.inId) {
            avRef.current.addEventListener('play', function () {
              aoStore.startedPlaying(inId, taskId)
            })

            avRef.current.addEventListener('ended', function () {
              let nextTaskId = aoStore.nextCardWithMediaAttachment
              while (nextTaskId) {
                const nextCard = aoStore.hashMap.get(nextTaskId)
                if (nextCard) {
                  const nextElement: HTMLMediaElement = document.getElementById(
                    'playable-' + nextTaskId
                  ) as HTMLMediaElement

                  if (nextElement) {
                    nextElement.play()
                    return
                  }
                }
                aoStore.startedPlaying(inId, nextTaskId)
                nextTaskId = aoStore.nextCardWithMediaAttachment
              }
            })
          }
        }
      })
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.taskId !== prevProps.taskId) {
      this.loadMeme()
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
      return (
        <div className="attachment">
          <audio
            src={this.state.data}
            ref={this.audioRef}
            id={'playable-' + this.props.taskId}
            controls
          />
        </div>
      )
    } else if (this.state.fileType.mime.includes('video')) {
      return (
        <div className="attachment">
          <video
            src={this.state.data}
            ref={this.videoRef}
            id={'playable-' + this.props.taskId}
            controls
          />
        </div>
      )
    } else {
      return (
        <div className="attachment">
          <img src={this.state.data} alt="attachment" />
        </div>
      )
    }
  }
}
