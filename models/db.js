var settings = require('../config');
var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;

module.exports = new Db('localhost', new Server(settings.host, Connection.DEFAULT_PORT, {}));
