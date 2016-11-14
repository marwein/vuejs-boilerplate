//Imports
const express = require('express');
const bodyParser = require('body-parser');
const webpack = require('webpack');
const config = require('./webpack.dev.conf.js');
const _ = require('lodash');
const bCrypt = require('bcrypt');
const jwt = require('jwt-simple');

const app = express();
const router = express.Router();
const compiler = webpack(config);
const flash = require('connect-flash');
const passport = require('passport');

const pg = require('pg');
const path = require('path');
const connectionString = process.env.DATABASE_URL || 'postgres://postgres@localhost:5432/todo';

// var User = require('./models/user.js');

//Express Config
app.use(flash());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// import necessary modules for Passport
app.use(passport.initialize());
app.use(passport.session());
const LocalStrategy = require('passport-local').Strategy;

// handle fallback for HTML5 history API
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
// compilation error display
app.use(require('webpack-hot-middleware')(compiler));

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
