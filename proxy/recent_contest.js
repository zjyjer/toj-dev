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
}
