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
import mime from 'mime-types'

interface Props {
  taskId: string
  hudStyle: HudStyle
}

interface State {
  blob?
  mimeType?: string
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

    let meme = aoStore.memeById.get(props.taskId)
    if (meme) {
      let mimeType = mime.lookup(meme.filetype)

      console.log(
        'looked up filetype ',
        meme.filetype,
        ' and got MIME type: ',
        mimeType
      )
      this.state = { mimeType }
    }
  }

  componentDidMount() {
    this.loadMeme()
  }

  componentDidUpdate(prevProps) {
    if (this.props.taskId !== prevProps.taskId) {
      this.loadMeme()
    }
  }

  loadMeme() {
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card) {
      this.setState({ blob: null })
      return
    }

    let meme = aoStore.memeById.get(card.taskId)
    if (!meme) {
      this.setState({ blob: null })
      return
    }

    api.fetchMeme(meme.hash).then(res => {
      console.log('type is ', res.body.type)
      this.setState({
        downloadPath: '/download/' + meme.hash
      })
      var reader = new FileReader()
      reader.onload = this.setFile
      reader.readAsDataURL(res.body)
    })
  }

  setFile(e) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    let dataURI = e.target.result
    var byteString = atob(dataURI.split(',')[1])

    // separate out the mime component
    var mimeString = dataURI
      .split(',')[0]
      .split(':')[1]
      .split(';')[0]
    console.log('mimeString is ', mimeString)
    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length)

    // create a view into the buffer
    var ia = new Uint8Array(ab)

    // set the bytes of the buffer to the correct values
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
    }

    // write the ArrayBuffer to a blob, and you're done
    var blob = new Blob([ab], { type: this.state.mimeType })
    // return blob

    // console.log('DataURI:', e.target.result)
    // console.log('type is, ', e.target.result.type)
    // const base64Content = e.target.result

    // // base64 encoded data doesn't contain commas
    // let base64ContentArray = base64Content.split(',')

    // // base64 content cannot contain whitespaces but nevertheless skip if there are!
    // let mimeType = base64ContentArray[0].match(
    //   /[^:\s*]\w+\/[\w-+\d.]+(?=[;| ])/
    // )[0]

    // // base64 encoded data - pure
    // let base64Data = base64ContentArray[1]

    // // Inject our hardcoded MIME type from the card, since nginx doesn't forward it correctly
    // const newDataURI = 'data:' + this.state.mimeType + ';base64,' + base64Data
    // console.log('newDataURI:', newDataURI)

    // this.setState({
    //   file: newDataURI
    // })
    // var buffer = dataUriToBuffer(e.target.result)

    // var file = {
    //   name: 'attachment.jpg',
    //   createReadStream: function(opts) {
    //     if (!opts) opts = {}
    //     return From([
    //       buffer.slice(opts.start || 0, opts.end || buffer.length - 1)
    //     ])
    //   }
    // }

    // render.append(file, this.attachmentRef.current, function(err, elem) {
    //   if (err) return console.error(err.message)

    //   console.log(elem) // new element
    // })
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
    // element only attaches when meme downloads
    // return <div ref={this.attachmentRef} />
    if (!this.state.blob) {
      return null
    }

    switch (this.state.mimeType) {
      case 'image/jpeg':
      case 'image/jpg':
      case 'image/png':
      case 'image/gif':
      default:
        return <img src={this.state.blob} alt="attachment" />
    }
  }
}
