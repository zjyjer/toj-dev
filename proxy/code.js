var EventProxy = require('eventproxy');
var models = require('../models');
var Code = models.Code;

exports.newAndSave = function(cb, runid, code, callback) {
	var _code = new Code();
	_code.contest_belong = cb;
	_code.run_ID = runid;
	_code.code = code;
	_code.save(callback);
};

exports.getOne = function(query, callback) {
	Code.findOne(query, function(err, doc) {
		if (err) {
			return callback(err);
		}
		if(!doc) {
			return callback('Code does not exist!');
		}
		callback(null, doc);
	});
};
