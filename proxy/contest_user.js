var EventProxy = require('eventproxy');
var models = require('../models');
var Contest_User = models.Contest_User;


exports.newAndSave = function(cid, username, callback) {
	var _cu = new Contest_User();
	console.log(_cu);
	_cu.cid = cid;
	_cu.username = username;
	_cu.save(callback);
};

exports.getOne = function(query, callback) {
	Contest_User.findOne(query, function(err, doc) {
		if (err) {
			return callback(err);
		}
		if(!doc) {
			err = 'You don\'t have access!';
			//return callback('You don\'t have access!');
		}
		callback(err, doc);
	});
};
