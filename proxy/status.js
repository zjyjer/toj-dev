var EventProxy = require('eventproxy');
var models = require('../models');
var Status = models.Status;

exports.getCount = function(query, callback) {
	Status.count(query, callback);
};

exports.newAndSave = function(status, callback) {
	var _status = new Status();
	_status.contest_belong = status.contest_belong;
	_status.run_ID = status.run_ID;
	_status.username = status.username;
	_status.pid = status.pid;
	_status.oj = status.oj;
	_status.lang = status.lang;
	_status.code_len = status.code_len;
	_status.submit_time = status.submit_time;
	_status.result = status.result;
	_status.save(callback);
};

exports.getOne = function(query, callback) {
	Status.findOne(query, function(err, doc) {
		if (err) {
			return callback(err);
		}
		if(!doc) {
			return callback('Error!');
		}
		callback(null, doc);
	});

};

exports.getMulti = function(query, fields, opt, callback) {
	Status.find(query, fields, opt, function(err, docs) {
		if (err) {
			return callback(err);
		}
		if (docs.length === 0) {
			return callback(null, []);
		}

		var stats = [];
		for(var i = 0;i < docs.length; ++i) {
			stats.push(docs[i]);
		}

		callback(null, stats);
	});
};

