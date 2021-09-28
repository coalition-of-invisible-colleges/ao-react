export function isAheadOf(senpaiId, kohaiId, state, errRes) {
  if (errRes === undefined) {
    errRes = []
  }
  let senpaiRank = state.members.findIndex(m => m.memberId === senpaiId)
  let kohaiRank = state.members.findIndex(m => m.memberId === kohaiId)
  if (senpaiRank < kohaiRank) {
    return 1
  } else if (kohaiRank < senpaiRank) {
    return -1
  }

  errRes.push('member is not ahead of other member in order of member list')
  return 0
}

// This method does not check if vouchers exist, therefore it depends on the mutations being perfect
// and there not being any invalid members leftover in the .deck / vouchers list of the other member
export function isDecidedlyMorePopularThan(senpaiId, kohaiId, state, errRes) {
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

  const senpaiVouches = countVouches(senpaiId, state)

  let kohaiVouchCards = state.tasks.filter(
    t => kohaiCard.deck.indexOf(t.taskId) >= 0
  )

  let kohaiVouches = kohaiVouchCards.length

  kohaiVouchCards.forEach(card => {
    if (card.taskId !== senpaiCard.taskId) {
      kohaiVouches = Math.max(kohaiVouches, countVouches(card.taskId, state))
    }
  })
  if (senpaiVouches > kohaiVouches) {
    return 1
  } else if (kohaiVouches > senpaiVouches) {
    return -1
  }

  errRes.push('member does not have more vouches than other member')
  return 0
}

export function isSenpaiOf(senpaiId, kohaiId, state, errRes) {
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

// Note: duplicated from cardTypes.ts because it is in TypeScript and this file is not
function countVouches(memberId, state) {
  const card = state.tasks.find(t => t.taskId === memberId)

  if (!card || !card.hasOwnProperty('deck')) return null

  let count = 0

  const memberCards = card.deck
    .map(memberId => state.tasks.find(t => t.taskId === memberId))
    .forEach(memberCard => {
      if (memberCard !== undefined) {
        count++
      }
    })

  return count
}
