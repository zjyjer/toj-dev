var EventProxy = require('eventproxy');
var models = require('../models');
var User = models.User;

exports.newAndSave = function(username, passwd, callback) {
	var _user = new User();
	_user.username = username;
	_user.password = passwd;
	_user.save(callback);
};

exports.getCount = function(query, callback) {
	User.count(query, callback);
};

exports.getByName = function(query, callback) {
	User.findOne(query, function(err, doc) {
		if (err) {
			return callback(err);
		}
		if(!doc) {
			//return callback('No Such User!');
			callback(null, null);
		} else {
			callback(null, doc);
		}
	});
};

exports.getMulti = function(query, fields, opt, callback) {
	User.find(query, fields, opt, function(err, docs) {
		if (err) {
			return callback(err);
		}
		if (docs.length === 0) {
			return callback(null, []);
		}

		var users = [];
		for(var i = 0;i < docs.length; ++i) {
			users.push(docs[i]);
		}

		callback(null, users);
	});
};

