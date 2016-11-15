import { router } from './main.js'

export default {
	user: {
		authenticated: false,
	},
	login(context, creds, redirect) {
		context.$http.post('/api/auth/login', {
				username: creds.username,
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
				username: creds.username,
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
				console.log(error);
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
			'Authorization': 'Bearer ' + localStorage.getItem('id_token')
		}
	}
}
