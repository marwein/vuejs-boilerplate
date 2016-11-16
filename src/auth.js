import { router } from './main.js'

export default {
	user: {
		authenticated: false,
	},
	login(context, creds, redirect) {
		context.$http.post('/api/auth/login', {
				email: creds.email,
				password: creds.password
			})
			.then(response => {
				localStorage.setItem('id_token', response.data.token);
				this.user.authenticated = true;
				if (redirect) {
					router.push(redirect)
				};
			})
			.catch(function(error) {
				this.error = error.body.error;
			});
	},
	signup(context, creds, redirect) {
		context.$http.post('/api/auth/register', {
				email: creds.email,
				firstName: creds.firstName,
				lastName: creds.lastName,
				password: creds.password
			})
			.then(response => {
				if (response.data.success == true) {
					router.push('/login');
				};
			})
			.catch(function(error) {
				// console.log(error);
				this.error = error;
			});
	},
	logout() {
		localStorage.removeItem('id_token')
		this.user.authenticated = false
	},
	checkAuth() {
		var jwt = localStorage.getItem('id_token')
		if (jwt) {
			this.user.authenticated = true
		} else {
			this.user.authenticated = false
		}
	},
	getAuthHeader() {
		return {
			'Authorization': localStorage.getItem('id_token')
		}
	}
}
