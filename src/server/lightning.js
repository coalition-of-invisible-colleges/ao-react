import config from '../../configuration.js'
import uuidV1 from 'uuid/v1'

import {hashblockStream} from './onChain/bitcoindZmq'

import cashEvs from './events/cashEvs'
import tasksEvs from './events/tasksEvs'
import calculations from '../calculations'

import LightningClient from 'lightning-client'
import {serverState, pubState} from './state'

const client = new LightningClient(config.clightning.dir, true);

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
    hashblockStream.onValue(updateAll)
    setTimeout( () => {
        updateAll()
    }, 3456)
}

function checkFunds(){
    return client
        .listfunds()
        .then(result => {
            try {
                console.log("checking ", result.outputs.length, " outputs vs ", pubState.cash.usedTxIds.length, "used")
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
            console.log("getinfo", result)
            try {
                cashEvs.getNodeInfo(result, console.log)
            } catch (err){
                console.log("error from cashEvs", err)
            }
        })
        .catch(console.log)
}

function recordEveryInvoice(start){
    console.log("waiting on invoices after ", start)
    client.waitanyinvoice(start)
        .then(invoice => {
            let cadAmt = calculations.satsToCad(invoice.msatoshi / 1000, pubState.cash.spot)
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
}
