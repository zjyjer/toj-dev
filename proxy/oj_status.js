var EventProxy = require('eventproxy');
var models = require('../models');
var OJ_Status = models.OJ_Status;

exports.getAllStatus = function(callback) {
	OJ_Status.find({}, function(err, docs) {
		if (err) {
			return callback(err);
		}
		callback(null, docs);
	});
};
