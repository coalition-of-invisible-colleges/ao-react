import fs from 'fs'
import net from 'net'
import uuidV1 from 'uuid/v1'
import { execSync } from 'child_process'
let PORT = process.env.PORT || 3000

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

let targetDir = process.env.HOME + '/.tor/' + uuidV1() // //"/var/lib/tor/" + 'eda29f80-7f28-11ec-b6f2-636d1c517fa0' //uuidV1()
const torControl = function(callback){
    controlClient.on('data', (x) => {
        i ++
        if (i ===0){
          controlClient.write("GETCONF HiddenServicePort \r\n")
        } else if (i === 1) {
          hiddenServicePortSplit = splitFromBuffer(x)
          hiddenServicePortSplit = hiddenServicePortSplit.filter(x => x !== 'HiddenServicePort')
          console.log("i is ", i, "and hiddenServicePortSplit is", hiddenServicePortSplit)
          controlClient.write("GETCONF HiddenServiceDir \r\n")
        } else if (i === 2){
          hiddenServiceDirSplit = splitFromBuffer(x)
          hiddenServiceDirSplit = hiddenServiceDirSplit.filter(x => x !== 'HiddenServiceDir')
          console.log("i is ", i, "and hiddenServiceDirSplit is", hiddenServiceDirSplit)
          onion = checkCurrentPortHasConfigAndReturnOnion(hiddenServicePortSplit, hiddenServiceDirSplit, PORT)
          console.log("i is", i, "and onion is", onion)
          if (!onion){
            let newConf = buildNewConfString(hiddenServicePortSplit, hiddenServiceDirSplit, PORT)
            console.log("i is", i, "and newConf is", newConf)
            controlClient.write("SETCONF " + newConf + " \r\n")
          } else {
            controlClient.write("QUIT \r\n" )
            callback(null, onion)
          }
        } else if (i === 3){
          console.log(Buffer.from(x.toString()).toString())
          controlClient.write("GETCONF HiddenServicePort \r\n")
        } else if (i === 4) {
          hiddenServicePortSplit = splitFromBuffer(x)
          controlClient.write("GETCONF HiddenServiceDir \r\n")
        } else if (i === 5){
          hiddenServiceDirSplit = splitFromBuffer(x)
          onion = checkCurrentPortHasConfigAndReturnOnion(hiddenServicePortSplit, hiddenServiceDirSplit, PORT)
          console.log("i is", i, "and onion is", onion)
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
    console.log("process uid is", process.getuid())
    try {
    console.log("targetDir is", targetDir)

       console.log("making dir: ", fs.mkdirSync(targetDir, '0700'))

       let uid = process.getuid()

       let gid = Number.parseInt(execSync('id -g tor'), 10)
        console.log("uid is", uid, "and gid is", gid)
        //fs.chownSync(targetDir, uid, gid)
        fs.chmodSync(targetDir, '0700')

      } catch (err) {
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
