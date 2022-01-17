import fs from 'fs'
import net from 'net'
import uuidV1 from 'uuid/v1'
let PORT = process.env.PORT || 8003

console.log(process.env.HOME + '/.tor/control_auth_cookie')
var cookieBuff = fs.readFileSync(process.env.HOME + '/.tor/control_auth_cookie')
var cookie = Buffer.from(cookieBuff).toString('hex')

let controlClient = net.connect({host: '127.0.0.1', port: 9051}, () => {
    controlClient.write('AUTHENTICATE ' + cookie + '\r\n');
});

let hiddenServicePortSplit
let hiddenServiceDirSplit
let onion
var i = -1
const torControl = function(callback){
    controlClient.on('data', (x) => {
        i ++
        if (i ===0){
          controlClient.write("GETCONF HiddenServicePort \r\n")
        } else if (i === 1) {
          hiddenServicePortSplit = splitFromBuffer(x)
          controlClient.write("GETCONF HiddenServiceDir \r\n")
        } else if (i === 2){
          hiddenServiceDirSplit = splitFromBuffer(x)
          onion = checkCurrentPortHasConfigAndReturnOnion(hiddenServicePortSplit, hiddenServiceDirSplit, PORT)
          if (!onion){
            let newConf = buildNewConfString(hiddenServicePortSplit, hiddenServiceDirSplit, PORT)
            controlClient.write("SETCONF " + newConf + " \r\n")
          } else {
            controlClient.write("QUIT \r\n" )
            callback(null, onion)
          }
        } else if (i === 3){
          controlClient.write("GETCONF HiddenServicePort \r\n")
        } else if (i === 4) {
          hiddenServicePortSplit = splitFromBuffer(x)
          controlClient.write("GETCONF HiddenServiceDir \r\n")
        } else if (i === 5){
          hiddenServiceDirSplit = splitFromBuffer(x)
          onion = checkCurrentPortHasConfigAndReturnOnion(hiddenServicePortSplit, hiddenServiceDirSplit, PORT)
          if (!onion){
              console.log('guess we failed')
              callback('sorry')
          } else {
              controlClient.write("QUIT \r\n" )
              callback(null, onion)
          }
        }
    })
}

function splitFromBuffer(x){
    return Buffer.from(x)
        .toString()
        .split(/\r?\n/)
        .filter(x => x)
        .map(x => x.slice(4));
}

function buildNewConfString(hiddenServicePortSplit, hiddenServiceDirSplit, port){
    let targetDir = "/var/lib/tor/" + uuidV1()
    try {
        fs.mkdirSync(targetDir, '0700')
    } catch (err){
        console.log(err)
    }

    hiddenServicePortSplit = hiddenServicePortSplit.map(noQuotes => {
        return noQuotes.slice(0, 18) + "\"" + noQuotes.slice(18) + "\""
    })

    let alternate = []
    hiddenServiceDirSplit.forEach((x, i) => {
        alternate.push(x)
        alternate.push(hiddenServicePortSplit[i])
    })
    let conffy = ''
    conffy += alternate.join(' ')
    conffy += " HiddenServiceDir=" + targetDir + " "
    conffy += " HiddenServicePort=\"80 127.0.0.1:" + port + "\""
    return conffy
}

function checkCurrentPortHasConfigAndReturnOnion(hiddenServicePortSplit, hiddenServiceDirSplit, port=8003){
    let onion = false

    hiddenServicePortSplit.forEach((x, i) => {
        if (x.indexOf(port) > -1){
            let directory = hiddenServiceDirSplit[i].slice(17)
            onion = fs.readFileSync(directory + '/hostname', {encoding:'utf8'})
        }
    })

    return onion
}

export default torControl;
