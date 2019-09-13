const satsPerBtc = 100000000 // one hundred million per btc

function cadToSats(cadAmt, spot){
    let sats = parseFloat( cadAmt ) / parseFloat( spot ) * satsPerBtc
    return parseInt(sats)
}

function satsToCad(sats, spot){
    let cad = sats * (spot / satsPerBtc)
    return cad.toFixed(2)
}

function calculateMsThisMonth(){
    let today = new Date()
    let daysThisMonth = new Date(today.getYear(), today.getMonth(), 0).getDate()
    return daysThisMonth * 24 * 60 * 60 * 1000
}

function calculateTaskPayout(task){
    let msThisMonth = calculateMsThisMonth()
    let msSince = Date.now() - parseFloat(task.lastClaimed)
    let payout = (msSince / msThisMonth) * parseFloat(task.monthlyValue) || 0
    let cap = parseFloat(task.cap) || 0
    let boost = parseFloat(task.boost) || 0
    if (cap > 0){
        return Math.min(payout, cap) + boost
    }
    else {
        return payout + boost
    }
}

function getMeridienTime(ts){

    let d = new Date( parseInt(ts) )
    let hour24 = d.getHours()

    let rollover = 0
    if (hour24 >= 24){
        rollover = 1
        hour24 %= 24
    }

    let hour, meridien
    if (hour24 > 12){
        meridien = 'pm'
        hour = hour24 - 12
    } else {
        meridien = 'am'
        hour = hour24
    }

    let date = d.getDate() + rollover
    let month = d.getMonth() + 1
    let minute = d.getMinutes()
    let year = d.getFullYear()

    let weekday = d.toString().slice(0,3)

    return { weekday, year, month, date, hour, minute, meridien }
}

export default {
  calculateTaskPayout,
  cadToSats,
  satsToCad,
  getMeridienTime,
}
