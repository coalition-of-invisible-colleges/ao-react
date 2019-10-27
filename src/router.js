import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from './components/Home'

import Access from './components/Dash/Access'
import Connect from './components/Dash/Connect'
import Accounts from './components/Dash/Accounts'
import Lightning from './components/Dash/Lightning'
import Reserve from './components/Dash/Reserve'
import Members from './components/Members'

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

  if (/doge/.test(to.path)){
      Store.commit("setMode", 0)
  }

  if (/boat/.test(to.path)){
      Store.commit("setMode", 1)
  }

  if (/badge/.test(to.path)){
      Store.commit("setMode", 2)
  }

  if (/chest/.test(to.path)){
      Store.commit("setMode", 3)
  }

  if (/timecube/.test(to.path)){
      Store.commit("setMode", 4)
  }

  setTimeout(()=>{
    next()
  }, 3)

})

export default router
