function isAheadOf(senpaiId, kohaiId, state, errRes) {
  if (errRes === undefined) {
    errRes = []
  }
  let senpaiRank = state.members.findIndex(m => m.memberId === senpaiId)
  let kohaiRank = state.members.findIndex(m => m.memberId === kohaiId)
  console.log('senpaiRank is ', senpaiRank, 'and kohaiRank is ', kohaiRank)
  if (senpaiRank < kohaiRank) {
    console.log('returning rank of 1')
    return 1
  } else if (kohaiRank < senpaiRank) {
    console.log('returning rank of -1')
    return -1
  }
  console.log('returning rank of 0')

  errRes.push('member is not ahead of other member in order of member list')
  return 0
}

// This method does not check if vouchers exist, therefore it depends on the mutations being perfect
// and there not being any invalid members leftover in the .deck / vouchers list of the other member
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

  // let senpaiVouches = 0

  // state.tasks.forEach(t => {
  //   if (senpaiCard.deck.indexOf(t.taskId) >= 0) {
  //     senpaiVouches++
  //   }
  // })

  const senpaiVouches = senpaiCard.deck.length

  let kohaiVouchCards = state.tasks.filter(
    t => kohaiCard.deck.indexOf(t.taskId) >= 0
  )

  let kohaiVouches = kohaiVouchCards.length

  kohaiVouchCards.forEach(card => {
    // state.tasks
    //   .filter(t => t.deck.indexOf(t.taskId) >= 0)
    //   .forEach(memberCard => {
    //     if (memberCard !== undefined) {
    //       let subVouchCount = 0
    //       state.tasks.forEach(t => {
    //         if (memberCard.deck.indexOf(t.taskId) >= 0) {
    //           subVouchCount++
    //         }
    //       })
    if (card.taskId !== senpaiCard.taskId) {
      kohaiVouches = Math.max(kohaiVouches, card.deck.length)
    }
    //   }
    // })
  })
  // console.log(
  //   'senpai is ',
  //   senpaiCard.name,
  //   ' and kohai is ',
  //   kohaiCard.name,
  //   ' senpaiVouches are ',
  //   senpaiCard.deck,
  //   ' and kohaiVouches are ',
  //   kohaiCard.deck
  // )
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
