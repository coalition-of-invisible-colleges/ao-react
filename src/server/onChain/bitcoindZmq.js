// wrap bitcoind zmq with kefir streams
// raw block & tx decoded by bitcoinjs-lib

// const zmq = require('zeromq')
const Kefir = require('kefir')
const bitcoin = require('bitcoinjs-lib')

var hashblockEmitter, hashtxEmitter, rawblockEmitter, rawtxEmitter

const rawblockStream = Kefir.stream( e => {
    rawblockEmitter = e
}).log('rawblock')

const rawtxStream = Kefir.stream( e => {
    rawtxEmitter = e
}).log('rawtx')

const hashtxStream = Kefir.stream( e => {
    hashtxEmitter = e
}).log('hashtx')

const hashblockStream = Kefir.stream( e => {
    hashblockEmitter = e
}).log('hashblock')

module.exports = {
    rawblockStream,
    rawtxStream,
    hashtxStream,
    hashblockStream,
}

// const sock = zmq.socket('sub')
// sock.subscribe("hashblock");
// // sock.subscribe("hashtx");
// // sock.subscribe("rawblock");
// // sock.subscribe("rawtx");
// sock.on('message', function(topic, message) {
//     switch ( topic.toString('utf8') ) {
//         case 'rawblock':
//             // TODO: large segwit blocks cannot be parsed by this version of bitcoin-lib
//             // const blk = bitcoin.Block.fromBuffer(message)
//             break
//         case 'rawtx':
//             const tx = bitcoin.Transaction.fromBuffer(message)
//             rawtxEmitter.emit(tx)
//             break
//         case 'hashtx':
//             hashtxEmitter.emit(message.toString('hex'))
//             break
//         case 'hashblock':
//             hashblockEmitter.emit(message.toString('hex'))
//             break
//     }
// })

// sock.on('connect', function(fd, ep) {console.log('connect, endpoint:', ep);});
// sock.connect('tcp://127.0.0.1:28332');
