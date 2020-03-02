const state = require('./state')

function buildResCallback(res){
    return (err, dbResponse) => {
        if (err) {
            res.status(500).send('db err')
        } else {
            res.status(201).send(dbResponse)
        }
    }
}

function memberFromFob(fob){
  let m
  state.serverState.members.filter(m => m.active > 0).forEach(member => {
      if (member.fob == fob){
          m = member
      }
  })
  return m
}

function getResource(resourceId){
  let resource
  state.serverState.resources.forEach(r => {
      if (r.resourceId == resourceId){
          resource = r
      }
  })
  return resource
}

module.exports = {
  buildResCallback,
  memberFromFob,
  getResource
}
