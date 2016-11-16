import Vue from 'vue';
import Router from 'vue-router';
import Resource from 'vue-resource';
import App from './App';
import VeeValidate from 'vee-validate';

// Import components
import Register from './components/pages/Register.vue';
import Hello from './components/pages/Hello.vue';
import Login from './components/pages/Login.vue';
import Users from './components/pages/Users.vue';
import Notes from './components/pages/Notes.vue';
import NoteSingle from './components/pages/NoteSingle.vue';

//Auth Setup
// Check the user's auth status when the app starts
import auth from './auth'
auth.checkAuth();
Vue.use(VeeValidate);
Vue.use(Resource);
Vue.use(Router);

// Routes
export var router = new Router({
	mode: 'history',
	routes: [
		{ path: '/', component: Hello },
		{ path: '/users', component: Users, meta: { requiresAuth: true } },
		{ path: '/register', component: Register },
		{ path: '/login', component: Login },
		{ path: '/notes', component: Notes },
		{ name: 'noteSingle', path: '/notes/:id', component: NoteSingle }
	]
});

Vue.http.options.root = 'http://localhost:8090/api';
// console.log(auth.getAuthHeader());
Vue.http.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('id_token');

//Protect authenticated routes with Route Meta tags.
router.beforeEach((to, from, next) => {
	if (to.matched.some(record => record.meta.requiresAuth)) {
		// this route requires auth, check if logged in
		// if not, redirect to login page.
		if (!auth.user.authenticated) {
			next({
				path: '/login',
				query: { redirect: to.fullPath }
			})
		} else {
			next()
		}
	} else {
		next() // make sure to always call next()!
	}
})

//Build app into #app div
const app = new Vue({
	router,
	render: (h) => h(App)
}).$mount('#app')
