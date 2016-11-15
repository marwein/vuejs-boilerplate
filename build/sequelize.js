// app/sequelize.js
var Sequelize = require('sequelize'),
	sequelize = new Sequelize('postgres://postgres@localhost:5432/todo');

module.exports = sequelize;
