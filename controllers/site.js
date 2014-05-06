/**
 * Module dependecies
 */

var EventProxy = require('eventproxy');
var config = require('../config').config;
var Util = require('../libs/util');
var Contest = require('../proxy').Contest;
var Recent_Contest = require('../proxy').Recent_Contest;
var OJ_Status = require('../proxy').OJ_Status;

exports.index = function(req, res, next) {

	var events = ['rconts', 'oj_status'];
	var ep = EventProxy.create(events, function(rconts, oj_status) {
		res.render('index', {
			title: 'Home',
			fcontests: rconts,
			foj_status: oj_status,
			foj_msg: config.oj_msg,
		});
	});
	ep.fail(next);

	Recent_Contest.getMulti({},{},{ limit: config.rcont_per_page, sort: {start_time: 1} }, ep.done('rconts'));

	OJ_Status.getAllStatus(ep.done('oj_status'));

};


exports.faq = function(req, res, next) {
	res.render('FAQ', {
		title: 'FAQ',
	});
};
