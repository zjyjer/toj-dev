var EventProxy = require('eventproxy');
var models = require('../models');
var Problem = models.Problem;

exports.getCount = function(query, callback) {
	Problem.count(query, callback);
};

exports.getByPage = function(query, fields, opt, callback) {
	Problem.find(query, fields, opt, function(err, docs) {
		if (err) {
			return callback(err);
		}
		if (docs.length === 0) {
			return callback(null, []);
		}

		var probs = [];
		for(var i = 0;i < docs.length; ++i) {
			probs.push(docs[i]);
		}

		callback(null, probs);
	});
};

exports.getOne = function(query, callback) {
	Problem.findOne(query, function(err, doc) {
		if (err) {
			return callback(err);
		}
		if(!doc) {
			return callback('No Such Problem!');
		}
		callback(null, doc);
	});
};

exports.search = function(info, query, fields, opt, callback) {
	var proxy = new EventProxy();
	events = ['by_id', 'by_info'];
	var probs = [];

	proxy.assign(events, function(by_id, by_info) {
		return callback(null, probs);
	}).fail(callback);

	Problem.find({ $or: [ {pid: parseInt(info)}, {vid: info} ] }, fields, opt, function(err, docs) {
		if (err) {
			proxy.emit('by_id');
			proxy.emit('by_info');
			return ;
		}
		for(var i = 0;i < docs.length; ++i) {
			probs.push(docs[i]);
		}
		proxy.emit('by_id');
	});

	var data = '^' + info + '$';
	Problem.find({ $and: [ query, { $or: [ {title: new RegExp(data, "i")}, {source: new RegExp(data, "i")} ] } ] }, fields, opt, function(err, docs) {
		if (err) {
			proxy.emit('by_info');
			return ;
		}
		for(var i = 0;i < docs.length; ++i) {
			probs.push(docs[i]);
		}
		proxy.emit('by_info');
	});
};

exports.getTags = function(query, callback) {
	Problem.findOne(query, {tag: 1}, {}, function(err, doc) {
		if (err) return callback(err, null);
		callback(null, doc);
	});
};
