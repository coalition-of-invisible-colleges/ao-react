import Store from '../store'

function setUpgradeMode(index) {
    Store.commit("setMode", index)
}

function nextUpgradeMode(router) {
    Store.commit("nextMode")
    Store.commit('startLoading', Store.state.upgrades.mode)

    if(Store.state.upgrades.dimension === 'sun'){
        return router.push('/front/' + Store.state.upgrades.mode)
    }
    if(Store.state.upgrades.dimension === 'bull'){
        return router.push('/dash/' + Store.state.upgrades.mode)
    }
    router.push('/' + Store.state.upgrades.mode)
}

function previousUpgradeMode(router) {
    Store.commit("previousMode")
    Store.commit('startLoading', Store.state.upgrades.mode)

    if(Store.state.upgrades.dimension === 'sun'){
        return router.push('/front/' + Store.state.upgrades.mode)
    }
    if(Store.state.upgrades.dimension === 'bull'){
        return router.push('/dash/' + Store.state.upgrades.mode)
    }
    router.push('/' + Store.state.upgrades.mode)
}

function closeUpgrades() {
    Store.commit("closeUpgrades")
}

function flashHelm(flashes = 1) {
    let ms = 350
    let helm = document.getElementById('helm')
    let addedClasses = ' flash'
    if(flashes < 1) {
        addedClasses += ' half'
        ms *= 0.7
    } else if(flashes === 2) {
        addedClasses += ' twice'
        ms *= flashes
    } else if(flashes === 5) {
        addedClasses += ' five'
        ms *= flashes
    }

    helm.className += addedClasses
    setTimeout( () => { helm.className = helm.className.replace(addedClasses, '') }, ms)
}

export default {
    setUpgradeMode,
    nextUpgradeMode,
    previousUpgradeMode,
    closeUpgrades,
    flashHelm,
}
