import Vue from 'vue';
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

//Auth Setup
import auth from './auth'
// Check the user's auth status when the app starts
auth.checkAuth();

Vue.use(Resource);
Vue.use(Router);

// Router
export var router = new Router({
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

Vue.http.options.root = 'http://localhost:8090/api';
Vue.http.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('id_token');

const app = new Vue({
	router,
	render: (h) => h(App)
}).$mount('#app')
