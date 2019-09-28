import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from './components/Home'
import Dash from './components/Dash'
// Member components
import Members from './components/Members'
import Wiki from './components/Wiki'
import Bounties from './components/Bounties'
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
import Pinboard from './components/Pinboard'
import Deck from './components/Deck'

import Archive from './components/Deck/Archive'

Vue.use(VueRouter)

const routes =[{
  path: '/',
  component: Deck,
  meta: { title: "DCTRL" }
},{
  path: '/front',
  component: Pinboard,
  meta: { title: "DCTRL" }
},{
  path: '/history',
  component: List,
  meta: { title: "history" }
},{
  path: '/deck',
  component: Deck,
  meta: { title: "deck" }
},{
  path: '/members',
  component: Members,
  meta: { title: "members @ DCTRL" }
},{
  path: '/dash',
  component: Dash,
  meta: { title: "dashboard" }
},{
  path: '/dash/*',
  component: Dash,
  meta: { title: "dashboard" }
},{
  path:'/archive',
  component: Archive,
  meta: { title: "sunken ship" }
},{
  path: '/task/*',
  component: Deck,
  meta: { title: "card" },
},
]

const router = new VueRouter({
  routes,
  scrollBehavior: (to, from, savedPosition) => {
      return { x: 0, y: 0 }
  }
})

router.afterEach((to, from, next) => {
  console.log("routed to path", to.path, "from  ", from.path)

  if(to.meta.title == 'card') return
  Vue.nextTick( () => {
      document.title = to.meta.title ? to.meta.title : 'ao';
  })

})

export default router
