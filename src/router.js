import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from './components/Home'
import Dash from './components/Dash'
// Member components
import Members from './components/Members'
import Wiki from './components/Wiki'
// Member forms
import MemberCreate from './components/forms/MemberCreate'
import MemberDeactivate from './components/forms/MemberDeactivate'
import MemberCharge from './components/forms/MemberCharge'
import MemberPaid from './components/forms/MemberPaid'
import MemberPaidStuff from './components/forms/MemberPaidStuff'
import MemberActivate from './components/forms/MemberActivate'
import MemberAddressUpdate from './components/forms/MemberAddressUpdate'
import MemberBadge from './components/forms/MemberBadge'

// Task components
import Bounties from './components/Bounties'
// Task forms
import TaskBoost from './components/forms/TaskBoost'
import TaskClaim from './components/forms/TaskClaim'
import TaskRateUpdate from './components/forms/TaskRateUpdate'
import BountyCreate from './components/forms/BountyCreate'
import GuildCreate from './components/forms/GuildCreate'
import TaskCreate from './components/forms/TaskCreate'

// Cash forms
import CashExpense from './components/forms/CashExpense'
import CashReceive from './components/forms/CashReceive'

//Resource components
import Resources from './components/Resources'
import ResourceCreate from './components/forms/ResourceCreate'
import ResourceUse from './components/forms/ResourceUse'
import ResourceStock from './components/forms/ResourceStock'
import ResourceRemove from './components/forms/ResourceRemove'
import ResourceBook from './components/forms/ResourceBook'
import RentSet from './components/forms/RentSet'
import Onboarding from './components/Onboarding'

// Invoice components
import Invoices from './components/Invoices'
import InvoiceCreate from './components/forms/InvoiceCreate'

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
  component: Pinboard,
  meta: { title: "DCTRL" }
},{
  path: '/channels',
  component: Nodes,
  meta: { title: "lightning" }
},{
  path: '/auth',
  component: Auth,
  meta: { title: "authorize" }
},{
  path: '/history',
  component: List,
  meta: { title: "history" }
},{
  path: '/deck',
  component: Deck,
  meta: { title: "deck" }
},{
  path: '/invoices',
  component: Invoices,
  meta: { title: "invoices" }
},{
  path: '/invoices/*',
  component: Invoices,
  meta: { title: "invoices" }
},{
  path: '/invoice_create/*',
  component: InvoiceCreate,
  meta: { title: "create invoice" }
},{
  path: '/account',
  component: MyPage,
  meta: { title: "account @ DCTRL" }
},{
  path: '/calendar/*',
  component: MemberCalendar,
  meta: { title: "calendar @ DCTRL" }
},{
  path: '/member_create',
  component: MemberCreate,
  meta: { title: "create member" }
},{
  path: '/member_create/*',
  component: MemberCreate,
  meta: { title: "create member" }
},{
  path: '/member_paid/*',
  component: MemberPaid,
  meta: { title: "member paid" }
},{
  path: '/member_charge/*',
  component: MemberCharge,
  meta: { title: "member charged" }
},{
  path: '/member_badge/*',
  component: MemberBadge,
  meta: { title: "member badge" }
},{
  path: '/member_deactivate',
  component: MemberDeactivate,
  meta: { title: "member deactivated" }
},{
  path: '/member_activate/*',
  component: MemberActivate,
  meta: { title: "member acvtivated" }
},{
  path: '/member_address_update/*',
  component: MemberAddressUpdate,
  meta: { title: "member address updated" }
},{
  path: '/members',
  component: Members,
  meta: { title: "members @ DCTRL" }
},{
  path: '/member_paid_stuff/*',
  component: MemberPaidStuff,
  meta: { title: "member paid stuff" }
},{
  path: '/fobtap',
  component: Resources,
  meta: { title: "door control" }
},{
  path: '/resource_create',
  component: ResourceCreate,
  meta: { title: "resource @ DCTRL" }
},{
  path: '/resource_use/*',
  component: ResourceUse,
  meta: { title: "resource used" }
},{
  path: '/resource_stock/*',
  component: ResourceStock,
  meta: { title: "resource stock" }
},{
  path: '/resource_remove/*',
  component: ResourceRemove,
  meta: { title: "resource removed" }
},{
  path: '/resource_book/*',
  component: ResourceBook,
  meta: { title: "resource booked" }
},{
  path:'/cash_expense',
  component: CashExpense,
  meta: { title: "cash expense" }
},{
  path: '/cash_receive',
  component: CashReceive,
  meta: { title: "cash retrieved" }
},{
  path: '/bounty_create/*',
  component: BountyCreate,
  meta: { title: "bounty created" }
},{
  path: '/card',
  component: TaskCreate,
  meta: { title: "task created" }
},{
  path: '/task_claim/*',
  component: TaskClaim,
  meta: { title: "task claimed" }
},{
  path: '/task/*',
  component: TaskCalendar,
  meta: { title: "card" }
},{
  path: '/task_rate_update/*',
  component: TaskRateUpdate,
  meta: { title: "task rate updated" }
},{
  path: '/dash',
  component: Dash,
  meta: { title: "dashboard" }
},{
  path: '/bounties',
  component: Bounties,
  meta: { title: "bounties" }
},{
  path: '/task_boost/*',
  component: TaskBoost,
  meta: { title: "allocate task" }
},{
  path: '/guild_create/*',
  component: GuildCreate,
  meta: { title: "create guild" }
},{
  path:'/manage',
  component: Manage,
  meta: { title: "manage" }
},{
  path:'/onboarding',
  component: Onboarding,
  meta: { title: "onboarding @ DCTRL" }
},{
  path:'/wiki',
  component: Wiki,
  meta: { title: "wiki @ DCTRL" }
},
{
  path:'/archive',
  component: Archive,
  meta: { title: "sunken ship" }
}
]

const router = new VueRouter({
  routes
})

router.afterEach((to, from, next) => {
  if(to.meta.title == 'card') return
  Vue.nextTick( () => {
      document.title = to.meta.title ? to.meta.title : 'ao';
  })
})

// this one may make the browser history better
// router.afterEach((to, from) => {
//   Vue.nextTick( () => {
//     document.title = to.meta.title ? to.meta.title : 'default title';
//   });
// })

export default router
