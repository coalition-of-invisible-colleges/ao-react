import Vue from 'vue'
import VueRouter from 'vue-router'

import Deck from './components/Deck'

import Access from './components/Access'
import Connect from './components/Connect'
import Accounts from './components/Accounts'
import Lightning from './components/Lightning'
import Reserve from './components/Reserve'


import News from './components/News'
import Missions from './components/Missions'
import Recent from './components/Recent'
import Bounties from './components/Bounties'
import Upcoming from './components/Upcoming'

import Checkmarks from './components/Checkmarks'
import Payments from './components/Payments'
import Planning from './components/Planning'
import Zen from './components/Zen'
import Priorities from './components/Priorities'

import Archive from './components/Deck/Archive'
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
  component: Upcoming,
  meta: { title: "calendar" }
},{
  path: '/dash',
  component: Access,
  meta: { title: "dashboard" }
},{
  path: '/dash/doge',
  component: Access,
  meta: { title: "resources" }
},{
  path: '/dash/boat',
  component: Connect,
  meta: { title: "networking" }
},{
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
