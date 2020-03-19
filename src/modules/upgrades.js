const Vue = require("vue");
const modes = ["doge", "boat", "badge", "chest", "timecube"];
const payments = ["bitcoin", "lightning"];
const dimensions = ["unicorn", "sun", "bull"];

const state = {
    mode: modes[0],
    payment: false,
    dimension: dimensions[0],
    bird: false,
    stacks: 1,
    barking: false,
    pinging: false,
    zoom: false,
    search: false,
    searchResult: false,
    paintbrushColor: false,
    grid: {
        selX: false,
        selY: false
    },
    flashClasses: {
        flash: false,
        half: false,
        twice: false,
        five: false
    },
    grid: {
        selX: false,
        selY: false
    }
};

const mutations = {
    flash(state) {
        state.flashClasses.flash = true;
    },
    flashHalf(state) {
        state.flashClasses.half = true;
    },
    flashTwice(state) {
        state.flashClasses.twice = true;
    },
    flashFive(state) {
        state.flashClasses.five = true;
    },
    flashOff(state) {
        state.flashClasses.flash = false;
        state.flashClasses.half = false;
        state.flashClasses.twice = false;
        state.flashClasses.five = false;
    },
    toggleBird(state) {
        state.bird = !state.bird;
    },
    toggleStacks(state) {
        if (state.stacks === 5) {
            state.stacks = 1;
        } else {
            state.stacks = 5;
        }
    },
    nextMode(state) {
        let currentIndex = modes.indexOf(state.mode);
        let nextIndex = (currentIndex + 1) % modes.length;
        state.mode = modes[nextIndex];
    },
    previousMode(state) {
        let currentIndex = modes.indexOf(state.mode);
        let prevIndex = currentIndex <= 0 ? modes.length - 1 : currentIndex - 1;
        state.mode = modes[prevIndex];
    },
    setMode(state, index) {
        state.mode = modes[index];
    },
    closeUpgrades(state) {
        state.mode = modes[0];
    },
    setPayMode(state, index) {
        state.payment = payments[index];
    },
    closePayMode(state) {
        state.payment = false;
    },
    setDimension(state, index) {
        state.dimension = dimensions[index];
    },
    closeDimension(state) {
        state.dimension = false;
    },
    bark(state) {
        state.barking = true;
        state.pinging = true;
        // XXX - should be sync? Works!?
        setTimeout(() => {
            state.barking = false;
        }, 1000);
        setTimeout(() => {
            state.pinging = false;
        }, 2000);
        let flip = new Audio(require("../assets/sounds/ping.wav"));
        flip.volume = flip.volume * 0.33;
        flip.play();
    },
    selectGridMeme(state, coord) {
        console.log("x,y ", coord);
        state.grid.selX = coord.x;
        state.grid.selY = coord.y;
    },
    zoom(state) {
        state.zoom = !state.zoom;
    },
    search(state, query) {
        state.search = query;
    },
    selectSearchResult(state, taskId) {
        state.searchResult = taskId;
        console.log("search result loaded ", taskId);
    },
    searchSelectionReceived(state, taskId) {
        state.searchResult = false;
    },
    startPainting(state, color) {
        console.log("starting painting");
        state.paintbrushColor = color;
    },
    stopPainting(state) {
        state.paintbrushColor = false;
    }
};

const actions = {
    nextUpgradeMode({ commit, state }, router) {
        commit("nextMode");
        commit("startLoading", state.mode);

        if (state.dimension === "sun") {
            return router.push("/front/" + state.mode);
        }
        if (state.dimension === "bull") {
            return router.push("/dash/" + state.mode);
        }
        router.push("/" + state.mode);
    },
    previousUpgradeMode({ commit, state }, router) {
        commit("previousMode");
        commit("startLoading", state.mode);

        if (state.dimension === "sun") {
            return router.push("/front/" + state.mode);
        }
        if (state.dimension === "bull") {
            return router.push("/dash/" + state.mode);
        }
        router.push("/" + state.mode);
    },
    flashHelm({ commit, state }, flashes) {
        commit("flash");
        let ms = 350;
        if (flashes < 1) {
            commit("flashHalf");
            ms *= 0.7;
        } else if (flashes === 2) {
            commit("flashTwice");
            ms *= flashes;
        } else if (flashes === 5) {
            commit("flashFive");
            ms *= flashes;
        }
        setTimeout(() => {
            commit("flashOff");
        }, ms);
    }
};
const getters = {};

module.exports = {
    state,
    mutations,
    actions,
    getters
};
