//Imports
const express = require('express');
const bodyParser = require('body-parser');
const webpack = require('webpack');
const config = require('./webpack.dev.conf.js');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const jwt = require('jwt-simple');
const app = express();
const router = express.Router();
const compiler = webpack(config);
const flash = require('connect-flash');
const passport = require('passport');
const pg = require('pg');
const path = require('path');
const connectionString = process.env.DATABASE_URL || 'postgres://postgres@localhost:5432/todo';
const Model = require('./model/models.js')

//Express Config
app.use(flash());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
const LocalStrategy = require('passport-local').Strategy;

app.use(require('connect-history-api-fallback')());
// // serve webpack bundle output
app.use(require('webpack-dev-middleware')(compiler, {
	publicPath: config.output.publicPath,
	stats: {
		colors: true,
		chunks: false
	}
}));
// enable hot-reload and state-preserving
app.use(require('webpack-hot-middleware')(compiler));

//PASSPORT CONFIG
passport.use(new LocalStrategy({},
	function(username, password, done) {
		pg.connect(connectionString, (error, client) => {
			client.query("SELECT * FROM users WHERE username = '" + username + "'", function(err, result) {
				var user = result.rows[0];
				if (!user) {
					return done("User does not exist", false);
				} else {
					if (user.username == null) {
						return done("Incorrect credentials", false);
					}
					bcrypt.compare(password, user.password, function(err, res) {
						// res == true
						if (res == true) {
							return done(null, user);
						} else {
							return done("Incorrect credentials", false);
						}
					});
				}
				// disconnect the client
				client.end(function(err) {
					if (err) throw err;
				});
			});
		});
	}
));

//Login Route
router.get('/users', (req, res) => {
	const results = [];
	// Get a Postgres client from the connection pool
	pg.connect(connectionString, (err, client, done) => {
		// Handle connection errors
		if (err) {
			done();
			console.log(err);
			return res.status(500).json({ success: false, data: err });
		}
		// SQL Query > Select Data
		const query = client.query('SELECT * FROM users ORDER BY id ASC;');
		// Stream results back one row at a time
		query.on('row', (row) => {
			results.push(row);
		});
		// After all data is returned, close connection and return results
		query.on('end', () => {
			done();
			return res.json(results);
		});
	});
});

router.post('/auth/login', function(req, res, next) {
	passport.authenticate('local', function(err, user, info) {
		// console.log(err);
		if (err) {
			return res.status(400).json({ error: err });
		} else {
			//user has authenticated correctly thus we create a JWT token
			var token = jwt.encode(user, 'lkmaspokjsafpaoskdpa8asda0s9a');
			return res.json({ success: true, token: 'JWT ' + token });
		}
	})(req, res, next);
});

router.post('/auth/register', function(req, res, next) {
	const saltRounds = 10;
	const data = {
		username: req.body.username,
		password: bcrypt.hashSync(req.body.password, saltRounds)
	};
	// Get a Postgres client from the connection pool
	pg.connect(connectionString, (err, client, done) => {
		// Handle connection errors
		if (err) {
			done();
			console.log(err);
			return res.status(500).json({ success: false, data: err });
		}
		// SQL Query > Insert Data
		client.query('INSERT INTO users(username, password) values($1, $2)', [data.username, data.password],
			function(err, result) {
				if (err) {
					return res.status(500).json({ success: false, data: err });
				} else {
					return res.json({ success: true });
				}
			}
		)
	});
});

router.delete('/auth/users/:user_id', (req, res, next) => {
	const results = [];
	// Grab data from the URL parameters
	const id = req.params.user_id;
	// Get a Postgres client from the connection pool
	pg.connect(connectionString, (err, client, done) => {
		// Handle connection errors
		if (err) {
			done();
			console.log(err);
			return res.status(500).json({ success: false, data: err });
		}
		// SQL Query > Delete Data
		client.query('DELETE FROM users WHERE id=($1)', [id],
			function(err, result) {
				if (err) {
					return res.status(500).json({ success: false, data: err });
				} else {
					return res.json({ success: true });
				}
			}
		);
	});
});

// DATA ROUTES
router.get('/todos', (req, res) => {
	const results = [];
	// Get a Postgres client from the connection pool
	pg.connect(connectionString, (err, client, done) => {
		// Handle connection errors
		if (err) {
			done();
			console.log(err);
			return res.status(500).json({ success: false, data: err });
		}
		// SQL Query > Select Data
		const query = client.query('SELECT * FROM items ORDER BY id ASC;');
		// Stream results back one row at a time
		query.on('row', (row) => {
			results.push(row);
		});
		// After all data is returned, close connection and return results
		query.on('end', () => {
			done();
			return res.json(results);
		});
	});
});

router.get('/todos/:todo_id', (req, res) => {
	const results = [];
	// Grab data from the URL parameters
	const id = req.params.todo_id;
	// Get a Postgres client from the connection pool
	pg.connect(connectionString, (err, client, done) => {
		// Handle connection errors
		if (err) {
			done();
			console.log(err);
			return res.status(500).json({ success: false, data: err });
		}
		// SQL Query > Select Data
		const query = client.query("SELECT * FROM items WHERE id = '" + id + "' ORDER BY id ASC");
		// Stream results back one row at a time
		query.on('row', (row) => {
			results.push(row);
		});
		// After all data is returned, close connection and return results
		query.on('end', function() {
			done();
			return res.json(results);
		});
	});
});

router.post('/todos', (req, res, next) => {
	const results = [];
	// Grab data from http request
	const data = { text: req.body.text, complete: false };
	// Get a Postgres client from the connection pool
	pg.connect(connectionString, (err, client, done) => {
		// Handle connection errors
		if (err) {
			done();
			console.log(err);
			return res.status(500).json({ success: false, data: err });
		}
		// SQL Query > Insert Data
		client.query('INSERT INTO items(text, complete) values($1, $2)', [data.text, data.complete]);
		// SQL Query > Select Data
		const query = client.query('SELECT * FROM items ORDER BY id ASC');
		// Stream results back one row at a time
		query.on('row', (row) => {
			results.push(row);
		});
		// After all data is returned, close connection and return results
		query.on('end', () => {
			done();
			return res.json(results);
		});
	});
});

router.put('/todos/:todo_id', (req, res, next) => {
	const results = [];
	// Grab data from the URL parameters
	const id = req.params.todo_id;
	// Grab data from http request
	const data = { text: req.body.text, complete: req.body.complete };
	// Get a Postgres client from the connection pool
	pg.connect(connectionString, (err, client, done) => {
		// Handle connection errors
		if (err) {
			done();
			console.log(err);
			return res.status(500).json({ success: false, data: err });
		}
		// SQL Query > Update Data
		client.query('UPDATE items SET text=($1), complete=($2) WHERE id=($3)', [data.text, data.complete, id]);
		// SQL Query > Select Data
		const query = client.query("SELECT * FROM items ORDER BY id ASC");
		// Stream results back one row at a time
		query.on('row', (row) => {
			results.push(row);
		});
		// After all data is returned, close connection and return results
		query.on('end', function() {
			done();
			return res.json(results);
		});
	});
});

router.delete('/todos/:todo_id', (req, res, next) => {
	const results = [];
	// Grab data from the URL parameters
	const id = req.params.todo_id;
	// Get a Postgres client from the connection pool
	pg.connect(connectionString, (err, client, done) => {
		// Handle connection errors
		if (err) {
			done();
			console.log(err);
			return res.status(500).json({ success: false, data: err });
		}
		// SQL Query > Delete Data
		client.query('DELETE FROM items WHERE id=($1)', [id]);
		// SQL Query > Select Data
		var query = client.query('SELECT * FROM items ORDER BY id ASC');
		// Stream results back one row at a time
		query.on('row', (row) => {
			results.push(row);
		});
		// After all data is returned, close connection and return results
		query.on('end', () => {
			done();
			return res.json(results);
		});
	});
});

//Server port
app.use('/api', router);
app.listen(8090, 'localhost', function(err) {
	if (err) {
		console.log(err)
		return
	}
	console.log('Listening at http://localhost:8090')
});
