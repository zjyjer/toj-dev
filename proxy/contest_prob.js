var EventProxy = require('eventproxy');
var models = require('../models');
var Contest_Problem = models.Contest_Problem;


exports.newAndSave = function(cid, pid, nid, title, callback) {
	var _cp = new Contest_Problem();
	_cp.cid = cid;
	_cp.pid = pid;
	_cp.nid = nid;
	_cp.title = title;
	_cp.save(callback);
};

exports.getCount = function(query, callback) {
	Contest_Problem.count(query, callback);
};


exports.getOne = function(query, callback) {
	Contest_Problem.findOne(query, function(err, doc) {
		if (err) {
			return callback(err);
		}
		if(!doc) {
			return callback('No Such Problem!');
		}
		callback(null, doc);
	});
};

exports.getMulti = function(query, fields, opt, callback) {
	Contest_Problem.find(query, fields, opt, function(err, docs) {
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

