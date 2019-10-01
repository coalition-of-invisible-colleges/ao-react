import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueIpfs from './plugins/vue-ipfs';

Vue.use(VueIpfs)

Vue.config.productionTip = false

// for using vue-perf-devtools Chrome/Firefox optimization plugin
Vue.config.devtools = true
Vue.config.performance = true

// no work
// router.beforeEach = (to, from, next) => {
//     console.log("route guarded?????????!", {to, from})
//
//     // store.commit("")
//     next()
// }


new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
