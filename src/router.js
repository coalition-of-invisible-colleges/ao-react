import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from './components/Home'

import Access from './components/Dash/Access'
import Connect from './components/Dash/Connect'
import Accounts from './components/Dash/Accounts'
import Lightning from './components/Dash/Lightning'
import Reserve from './components/Dash/Reserve'
// Member components
import Members from './components/Members'
import Wiki from './components/Wiki'
// import Bounties from './components/Bounties'
import Onboarding from './components/Onboarding'

// Invoice components
import Invoices from './components/Invoices'

import Manage from './components/Manage'
import Auth from './components/Auth'

import MemberCalendar from './components/MemberCalendar'
import TaskCalendar from './components/TaskCalendar'
import List from './components/EventsList'

import MyPage from './components/MyPage'
import Nodes from './components/Nodes'
import Deck from './components/Deck'

import Archive from './components/Deck/Archive'

import News from './components/Pinboard/News'
import Missions from './components/Pinboard/Missions'
import Recent from './components/Pinboard/Recent'
import Bounties from './components/Pinboard/Bounties'
import Calendar from './components/Pinboard/Calendar'

import Checkmarks from './components/Upgrades/Checkmarks'
import Payments from './components/Upgrades/Payments'
import Planning from './components/Upgrades/Planning'
import Zen from './components/Upgrades/Zen'
import Priorities from './components/Deck/Priorities'

Vue.use(VueRouter)

const routes =[{
  path: '/',
  component: Deck,
  meta: { title: "DCTRL" },
  children: [
    {
      path: 'doge',
      component: Zen
    },
    {
      path: 'boat',
      component: Priorities,
      meta: { title: "priorities" },
    },
    {
      path: 'badge',
      component: Checkmarks,
      meta: { title: "checkmarks" },
    },
    {
      path: 'chest',
      component: Payments,
      meta: { title: "checkmarks" },
    },
    {
      path: 'timecube',
      component: Planning,
      meta: { title: "planning" },
    },
  ]
},{
  path: '/task/*',
  component: Deck,
  meta: { title: "card" },
},{
  path: '/front',
  component: News,
  meta: { title: "DCTRL" }
},{
  path: '/front/doge',
  component: News,
  meta: { title: "newspaper" }
},{
  path: '/front/boat',
  component: Missions,
  meta: { title: "top cards" }
},{
  path: '/front/badge',
  component: Recent,
  meta: { title: "recent" }
},{
  path: '/front/chest',
  component: Bounties,
  meta: { title: "bounties" }
},{
  path: '/front/timecube',
  component: Calendar,
  meta: { title: "calendar" }
},{
  path: '/history',
  component: List,
  meta: { title: "history" }
},{
  path: '/members',
  component: Members,
  meta: { title: "members @ DCTRL" }
},{
  path: '/dash',
  component: Access,
  meta: { title: "dashboard" }
},{
  path: '/dash/doge',
  component: Access,
  meta: { title: "resources" }
},
{
  path: '/dash/boat',
  component: Connect,
  meta: { title: "networking" }
},
{
  path: '/dash/badge',
  component: Accounts ,
  meta: { title: "manage accounts" }
},{
  path: '/dash/chest',
  component: Lightning,
  meta: { title: "lightning wallet" }
},{
  path: '/dash/timecube',
  component: Reserve,
  meta: { title: "central reserve" }
},
{
  path: '/dash/slayer',
  component: Accounts,
  meta: { title: "dashboard" }
},{
  path:'/archive',
  component: Archive,
  meta: { title: "sunken ship" }
},
]

const router = new VueRouter({
  routes,
  scrollBehavior: (to, from, savedPosition) => {
      return { x: 0, y: 0 }
  }
})

import Store from './store.js'

router.beforeEach((to, from, next) => {

  Store.commit("startLoading", to.path)
  next()

})

router.afterEach((to, from, next) => {

  if(to.meta.title == 'card') return
  Vue.nextTick( () => {
      document.title = to.meta.title ? to.meta.title : 'ao';
  })

})


// init ({ dispatch }) {       // Could also be async and use await instead of return
//   return Promise.all([
//     dispatch('getUserSession'), // Using another action
//     dispatch('auth/init'),      // In another module
//     fetch('tehKittenz')         // With the native fetch API
//     // ...
//   ])
// }
// const loadingLoaded = store.dispatch('loadingLoaded')

// router.beforeEach((to, from, next) => {
//   storeInit.then(next)
//     .catch(e => {
//       // Handle error
//     })
// })

// router.beforeRouteLeave((to, from, next) => {
//   console.log("beforeRouteLeave routed to path", to.path, "from  ", from.path)

//   switch(from.meta.title) {
//     case 'card':
//     break
//   }

//   Store.dispatch('startLoading', 'unicorn').then()
// })

export default router
