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
const ejwt = require('express-jwt');
const moment = require('moment');

//Express Config
app.use(flash());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
const LocalStrategy = require('passport-local').Strategy;
const jwtSecret = 'lkmaspokjsafpaoskdpa8asda0s9a';

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
passport.use(new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password'
	},
	function(username, password, done) {
		pg.connect(connectionString, (error, client) => {
			client.query("SELECT * FROM users WHERE email = '" + username + "'", function(err, result) {
				var user = result.rows[0];
				if (!user) {
					return done("Incorrect credentials", false);
				} else {
					if (user.email == null) {
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

// used to serialize the user for the session
passport.serializeUser(function(user, done) {
	done(null, user.id);
	// where is this user.id going? Are we supposed to access this anywhere?
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
	// User.findById(id, function(err, user) {});
	const results = [];
	// Get a Postgres client from the connection pool
	pg.connect(connectionString, (err, client, done) => {
		// SQL Query > Select Data
		const query = client.query('SELECT * FROM users WHERE id = ' + id + ' ORDER BY id ASC;');
		// Stream results back one row at a time
		query.on('row', (row) => {
			results.push(row);
		});
		// After all data is returned, close connection and return results
		query.on('end', () => {
			done(err, user);
		});
	});
});

//User displaying Route
router.get('/users', ejwt({ secret: 'lkmaspokjsafpaoskdpa8asda0s9a' }), (req, res) => {
	if (!req.user) {
		return res.sendStatus(401)
	} else {
		const results = [];
		// Get a Postgres client from the connection pool
		pg.connect(connectionString, (err, client, done) => {
			// Handle connection errors
			if (err) {
				done();
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
	}
});

router.post('/auth/login', function(req, res, next) {
	passport.authenticate('local', function(err, user, info) {
		if (err) {
			return res.status(400).json({ error: err });
		} else {
			//user has authenticated correctly thus we create a JWT token
			var token = jwt.encode(user, 'lkmaspokjsafpaoskdpa8asda0s9a');
			return res.json({ token: token });
		}
	})(req, res, next);
});

router.post('/auth/register', function(req, res, next) {
	const saltRounds = 10;
	const data = {
		email: req.body.email,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
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
		client.query('INSERT INTO users(email, password, firstname, lastname) values($1, $2, $3, $4) RETURNING *', [data.email, data.password, data.firstName, data.lastName],
			function(err, result) {
				if (err) {
					return res.status(500).json({ success: false, data: err });
				} else {
					return res.json({ success: true, info: "Registered account." });
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
router.get('/notes', (req, res) => {
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
		const query = client.query('SELECT * FROM notes ORDER BY createdon ASC;');
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

router.get('/notes/:note_id', (req, res) => {
	const results = [];
	// Grab data from the URL parameters
	var id = req.params.note_id;
	// Get a Postgres client from the connection pool
	pg.connect(connectionString, (err, client, done) => {
		// Handle connection errors
		if (err) {
			done();
			console.log(err);
			return res.status(500).json({ success: false, data: err });
		}
		// SQL Query > Select Data
		const query = client.query("SELECT * FROM notes WHERE id = '" + id + "' ORDER BY id ASC");
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

router.post('/notes', ejwt({ secret: 'lkmaspokjsafpaoskdpa8asda0s9a' }), (req, res, next) => {
	const results = [];
	// Grab data from http request
	const data = { text: req.body.text, title: req.body.title, createdBy: req.user.id, createdOn: moment() };
	// Get a Postgres client from the connection pool
	pg.connect(connectionString, (err, client, done) => {
		// Handle connection errors
		if (err) {
			done();
			console.log(err);
			return res.status(500).json({ success: false, data: err });
		}
		client.query('INSERT INTO notes(title, text, createdby, createdon) values($1, $2, $3, $4)', [data.title, data.text, data.createdBy, data.createdOn],
			function(err, result) {
				if (err) throw err;
				// just print the result to the console
				return res.json(result);
				// disconnect the client
				client.end(function(err) {
					if (err) throw err;
				});
			});
	});
});

router.put('/notes/:note_id', (req, res, next) => {
	const results = [];
	// Grab data from the URL parameters
	const id = req.params.note_id;
	// Grab data from http request
	const data = { text: req.body.text, title: req.body.title };
	// Get a Postgres client from the connection pool
	pg.connect(connectionString, (err, client, done) => {
		// Handle connection errors
		if (err) {
			done();
			console.log(err);
			return res.status(500).json({ success: false, data: err });
		}
		// SQL Query > Update Data
		client.query('UPDATE notes SET title=($1), text=($2) WHERE id=($3)', [data.title, data.text, id]);
		// SQL Query > Select Data
		const query = client.query("SELECT * FROM notes ORDER BY id ASC");
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

router.delete('/notes/:note_id', (req, res, next) => {
	const results = [];
	// Grab data from the URL parameters
	const id = req.params.note_id;
	// Get a Postgres client from the connection pool
	pg.connect(connectionString, (err, client, done) => {
		// Handle connection errors
		if (err) {
			done();
			console.log(err);
			return res.status(500).json({ success: false, data: err });
		}
		// SQL Query > Delete Data
		client.query('DELETE FROM notes WHERE id=($1)', [id]);
		// SQL Query > Select Data
		var query = client.query('SELECT * FROM notes ORDER BY id ASC');
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
