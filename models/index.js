var mongoose = require('mongoose');
var config = require('../config').config;

mongoose.connect(config.db, function (err) {
	if (err) {
		console.error('connect to %s error: ', config.db, err.message);
		process.exit(1);
	}
});

// models
require('./user');
require('./prob');
require('./status');
require('./rcont');
require('./code');
require('./contest');
require('./contest_user');
require('./contest_prob');
require('./oj_status');
require('./topic');
require('./reply');

exports.User = mongoose.model('User');
exports.Problem = mongoose.model('Problem');
exports.Status = mongoose.model('Status');
exports.Recent_Contest = mongoose.model('Recent_Contest');
exports.Code = mongoose.model('Code');
exports.Contest = mongoose.model('Contest');
exports.Contest_User = mongoose.model('Contest_User');
exports.Contest_Problem = mongoose.model('Contest_Problem');
exports.OJ_Status = mongoose.model('OJ_Status');
exports.Topic = mongoose.model('Topic');
exports.Reply = mongoose.model('Reply');
