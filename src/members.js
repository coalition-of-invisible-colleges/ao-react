function isAheadOf(senpaiId, kohaiId, state, errRes) {
  if (errRes === undefined) {
    errRes = []
  }
  let senpaiRank = state.members.findIndex(m => m.memberId === senpaiId)
  let kohaiRank = state.members.findIndex(m => m.memberId === kohaiId)

  if (senpaiRank < kohaiRank) {
    return 1
  } else if (kohaiRank > senpaiRank) {
    return -1
  }

  errRes.push('member is not ahead of other member in order of member list')
  return 0
}

function isDecidedlyMorePopularThan(senpaiId, kohaiId, state, errRes) {
  if (errRes === undefined) {
    errRes = []
  }

  const senpaiCard = state.tasks.find(t => t.taskId === senpaiId)
  if (!senpaiCard) {
    errRes.push('invalid member detected')
    return null
  }
  const kohaiCard = state.tasks.find(t => t.taskId === kohaiId)
  if (!kohaiCard) {
    errRes.push('invalid member detected')
    return null
  }

  const senpaiVouches = senpaiCard.deck
    .map(mId => state.tasks.find(t => t.taskId === mId))
    .filter(memberCard => memberCard !== undefined).length

  let kohaiVouchCards = kohaiCard.deck
    .map(mId => state.tasks.find(t => t.taskId === mId))
    .filter(memberCard => memberCard !== undefined)

  let kohaiVouches = kohaiVouchCards.length

  kohaiVouchCards.forEach(card => {
    const memberCards = card.deck
      .map(memberId => state.tasks.find(t => t.taskId === memberId))
      .forEach(memberCard => {
        if (memberCard !== undefined) {
          let subVouchCount = 0
          memberCard.deck.forEach(subcard => {
            if (subcard !== undefined) {
              subVouchCount++
            }
          })
          kohaiVouches = Math.max(kohaiVouches, subVouchCount)
        }
      })
  })

  if (senpaiVouches > kohaiVouches) {
    return 1
  } else if (kohaiVouches > senpaiVouches) {
    return -1
  }

  errRes.push('member does not have more vouches than other member')
  return 0
}

function isSenpaiOf(senpaiId, kohaiId, state, errRes) {
  if (errRes === undefined) {
    errRes = []
  }

  const rank = isAheadOf(senpaiId, kohaiId, state, errRes)
  const vouches = isDecidedlyMorePopularThan(senpaiId, kohaiId, state, errRes)
  if (rank === 1 && vouches === 1) {
    return 1
  } else if (rank === -1 && vouches === -1) {
    return -1
  }

  errRes.push('member is not a senpai of the other member')
  return 0
}

module.exports = {
  isAheadOf,
  isDecidedlyMorePopularThan,
  isSenpaiOf
}
