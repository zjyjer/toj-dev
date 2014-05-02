var EventProxy = require('eventproxy');
var models = require('../models');
var Contest = models.Contest;

exports.getCount = function(query, callback) {
	Contest.count(query, callback);
};

exports.newAndSave = function(cont, callback) {
	var _contest = new Contest();

	_contest.cid = cont.cid;
	_contest.type = cont.type;
	_contest.title = cont.title;
	_contest.desc = cont.desc;
	_contest.start_time = cont.start_time;
	_contest.end_time = cont.end_time;
	_contest.author = cont.author;
	_contest.passwd = cont.passwd;

	_contest.save(callback);
};

exports.getOne = function(query, callback) {
	Contest.findOne(query, function(err, doc) {
		if (err) {
			return callback(err);
		}
		if(!doc) {
			return callback('No Such Contest!');
		}
		callback(null, doc);
	});
};

exports.getMulti = function(query, fields, opt, callback) {
	Contest.find(query, fields, opt, function(err, docs) {
		if (err) {
			return callback(err);
		}
		if (docs.length === 0) {
			return callback(null, []);
		}

		var conts = [];
		for(var i = 0;i < docs.length; ++i) {
			conts.push(docs[i]);
		}

		callback(null, conts);
	});
};

