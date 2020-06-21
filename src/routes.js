import Login from './components/Login'
import AoMembers from './components/Members'
import AoCard from './components/Card'
import AoMember from './components/Member'

const routes = [
	{
		path: '/login',
		component: Login,
		restricted: false
	},
	{
		path: '/members',
		component: AoMembers,
		restricted: true
	},
	{
		path: '/task',
		component: AoCard,
		restricted: true
	},
	{
		path: '/',
		exact: true,
		component: AoMember,
		restricted: true
	}
	// here: need to add route for grabbing files from server
]

export default routes
