import _ from 'lodash'

function membersMuts(members, ev){
  switch (ev.type){
      case "ao-connected":
          break
      case "ao-disconnected":
          break
      case "member-created":
          ev.lastUsed = ev.timestamp
          ev.muted = false
          members.push(ev)
          break
      case "member-activated":
          members.forEach( member => {
              if (member.memberId === ev.memberId){
                  if ( member.active < 0) {
                      member.active = -1 * member.active
                  } else {
                      member.active ++
                  }
              }
          })
          break
      case "task-boosted":
          members.forEach( member => {
              if (member.memberId === ev.taskId){
                  if ( member.active < 0) {
                      member.active = -1 * member.active
                  } else {
                      member.active ++
                  }
              }
          })
          break
      case "task-boosted-lightning":
          members.forEach( member => {
              if (member.memberId === ev.taskId){
                  if ( member.active < 0) {
                      member.active = -1 * member.active
                  } else {
                      member.active ++
                  }
              }
          })
          break
      case "member-deactivated":
          members.forEach( member => {
              if (member.memberId === ev.memberId){
                  if (member.active >= 0){
                      member.active = -1 * member.active - 1
                  }
              }
          })
          break
      case "member-purged":
          members.forEach( (member, i) => {
              if (member.memberId === ev.memberId) {
                      members.splice(i, 1)
              }
          })
          break
      case "resource-used":
          members.forEach( member => {
              if (member.memberId === ev.memberId){
                  member.lastUsed = ev.timestamp
              }
          })
          break

      case "member-field-updated":
          members.forEach( member => {
              if (member.memberId === ev.memberId){
                  member[ev.field] = ev.newfield
              }
          })
          break

      case "badge-added":
          members.forEach( member => {
              if (member.memberId === ev.memberId){
                  member.badges.push( ev )
              }
          })
          break

      case "badge-removed":
          members.forEach( member => {
              if (member.memberId === ev.memberId) {
                  member.badges.forEach((b, i) => {
                      if (ev.badge === b.badge) {
                          member.badges.splice(i, 1)
                      }
                  })
              }
          })
          break

      case "badge-hidden":
          members.forEach( member => {
              if (member.memberId === ev.memberId) {
                  if(!member.hiddenBadges) member.hiddenBadges = [] //add hiddenBadges property if it doesn't exist
                  if(member.hiddenBadges.includes(ev.badge)){ //if the badge is currently in the hidden list, remove it
                    member.hiddenBadges = member.hiddenBadges.filter( badge => { //We need to remove all references, since bugs could create multiples
                        if(badge == ev.badge){
                            return false
                        }
                        return true
                    })
                  } else { //We don't have the badge in our hidden list, so let's add it
                      member.hiddenBadges.push(ev.badge)
                  }
              }

          })
          break

      case "cleanup":
          members.forEach( member => {
              let indexes = []
              member.badges.forEach( (b, i) => {
                  let ageMs = Date.now() - parseInt( b.timestamp )

                  let maxAge = (1000 * 60 * 60 * 24 * 42)
                  let isOld = ageMs > maxAge

                  if (b.badge == 'admin'){
                      isOld = false
                  }

                  if (isOld){
                      indexes.push(i)
                  }
              })
              _.pullAt(member.badges, indexes)
          })
          break

      case "doge-barked":
          members.forEach( member => {
              // this should only bump up for mutual doges
              if (member.memberId === ev.memberId){
                  member.lastUsed = ev.timestamp
                  // then bark
              }
          })
          break

      case "doge-muted":
        members.forEach( member => {
            if (member.memberId === ev.memberId){
                member.muted = true
            }
        })
        break

      case "doge-unmuted":
        members.forEach( member => {
            if (member.memberId === ev.memberId){
                member.muted = false
            }
        })
        break
  }
}

export default membersMuts
