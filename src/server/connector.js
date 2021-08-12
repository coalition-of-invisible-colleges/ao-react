import express from 'express'
const router = express.Router()
import tr from 'tor-request'

export function postEvent(address, secret, body, callback, logErrors = true) {
  tr.request(
    {
      url: 'http://' + address + '/events',
      headers: { Authorization: secret },
      method: 'post',
      body,
      json: true,
    },
    function (err, res, resBody) {
      if (err) {
        if (logErrors) console.log('error res', err)
        return callback(err)
      }
      callback(resBody)
    }
  )
}

export function checkHash(address, secret, taskId, callback, logErrors = true) {
  tr.request(
    {
      url: 'http://' + address + '/taskhash/' + taskId,
      headers: { Authorization: secret },
      method: 'post',
      json: true,
    },
    function (err, res, resBody) {
      if (err) {
        if (logErrors) console.log('error res', err)
        return callback(err)
      }
      callback(resBody)
    }
  )
}

export function getState(address, secret, callback) {
  tr.request(
    {
      url: 'http://' + address + '/state',
      headers: { Authorization: secret },
      method: 'post',
      body: { x: true },
      json: true,
    },
    function (err, res, resBody) {
      if (err) {
        console.log('error res', err)
        return callback(err)
      }
      callback(null, resBody)
    }
  )
}
