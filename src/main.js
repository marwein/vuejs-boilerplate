import Vue from 'vue';
import VueAuth from '@websanova/vue-auth';
import Router from 'vue-router';
import Resource from 'vue-resource';
import App from './App';

// Import components
import Register from './components/pages/Register.vue';
import Hello from './components/pages/Hello.vue';
import Login from './components/pages/Login.vue';
import Users from './components/pages/Users.vue';
import Todo from './components/pages/Todo.vue';
import TodoSingle from './components/pages/TodoSingle.vue';

Vue.use(Resource);
Vue.use(Router);

// Router
var router = new Router({
	mode: 'history',
	routes: [
		{ path: '/', component: Hello },
		{ path: '/users', component: Users },
		{ path: '/register', component: Register },
		{ path: '/login', component: Login },
		{ path: '/todo', component: Todo },
		{ name: 'todoItem', path: '/todo/:id', component: TodoSingle }
	]
});

Vue.use(require('@websanova/vue-auth'), {
	loginData: { url: 'auth/login', method: 'POST', redirect: null },
	router: router
});

Vue.http.options.root = 'http://localhost:8090/api';

const app = new Vue({
	router,
	render: (h) => h(App)
}).$mount('#app')
