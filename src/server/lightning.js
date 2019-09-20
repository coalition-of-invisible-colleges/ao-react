import config from '../../configuration.js'
import uuidV1 from 'uuid/v1'
import express from 'express'

const lightningRouter = express.Router()

import {hashblockStream} from './onChain/bitcoindZmq'

import cashEvs from './events/cashEvs'
import tasksEvs from './events/tasksEvs'
import calculations from '../calculations'

import LightningClient from 'lightning-client'
import {serverState, pubState} from './state'

const client = new LightningClient(config.clightning.dir, true);


lightningRouter.post('/lightning/channel',(req, res) => {
    client.fundchannel(req.body.id, 'all')
        .then(channel => {
            console.log(channel)
        })
})

lightningRouter.post('/lightning/update',(req, res) => {
    updateAll()
})

function createInvoice(amount, label, description, expiresInSec){
    return client.invoice(amount * 1000, label, description, expiresInSec)
}

function newAddress(){
    return client.newaddr('p2sh-segwit')
}

function updateAll(){
    checkFunds()
    getInfo()
}

function watchOnChain(){
    setInterval(updateAll, 1000 * 60 * 10)
    setTimeout( () => {
        updateAll()
    }, 560)
}

function checkFunds(){
    return client
        .listfunds()
        .then(result => {
            try {
                cashEvs.fundsSet(result.outputs, result.channels)
                result.outputs.forEach( o => {
                    if (o.status === 'confirmed' && pubState.cash.usedTxIds.indexOf(o.txid) === -1){
                        pubState.tasks.forEach( t => {
                            if (t.address === o.address){
                                let cadAmt = calculations.satsToCad(o.value, pubState.cash.spot)
                                tasksEvs.taskBoosted(t.taskId, cadAmt, o.txid)
                            }
                        })
                    }
                })
            } catch (err) {console.log("lighting error; maybe lightningd (c-lightning) is not running")}
        })
        .catch(console.log)
}

function getInfo(){
    return client
        .getinfo()
        .then(result => {
            client.listpeers()
                .then(peers => {
                  try {
                    result.peers = peers.peers.map(p => {
                        return {
                            id: p.id,
                            channels: p.channels.length > 0
                        }
                    })
                    cashEvs.getNodeInfo(result, console.log)
                  } catch (err){
                    console.log("error from cashEvs", err)
                  }
                })
        })
        .catch(console.log)
}

function recordEveryInvoice(start){
    client.waitanyinvoice(start)
        .then(invoice => {
            let satoshis = invoice.msatoshi / 1000
            let spot = pubState.cash.spot
            let cadAmt = calculations.satsToCad(satoshis, spot)

            pubState.tasks.forEach( t => {
                if (t.payment_hash === invoice.payment_hash){
                    tasksEvs.taskBoostedLightning(t.taskId, cadAmt, invoice.payment_hash, invoice.pay_index)
                }
            })
            recordEveryInvoice(start + 1)
        })
        .catch(console.log)
}

module.exports = {
    createInvoice,
    newAddress,
    recordEveryInvoice,
    watchOnChain,
    lightningRouter
}
