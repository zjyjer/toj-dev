var EventProxy = require('eventproxy');
var models = require('../models');
var Recent_Contest = models.Recent_Contest;

exports.getMulti = function(query, fields, opt, callback) {
	Recent_Contest.find(query, fields, opt, function(err, docs) {
		if (err) {
			return callback(err);
		}
		if (docs.length === 0) {
			return callback(null, []);
		}
		callback(null, docs);
	});
};

exports.getOne = function(query, callback) {
	Recent_Contest.findOne(query, function(err, doc) {
		if (err) {
			return callback(err);
		}
		callback(null, doc);
	});
};

exports.newAndSave = function(rc, callback) {
	var _rc = new Recent_Contest();
	_rc.id = rc.id;
	_rc.oj = rc.oj;
	_rc.link  = rc.link;
	_rc.name = rc.name;
	_rc.start_time = rc.start_time;
	_rc.week = rc.week;
	_rc.access = rc.access;
	_rc.save(callback);
};
