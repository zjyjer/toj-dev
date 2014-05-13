/**
 * Module dependecies
 */

var crypto = require('crypto');
var EventProxy = require('eventproxy');
var config = require('../config').config;
var Util = require('../libs/util');
var Contest = require('../proxy').Contest;
var Recent_Contest = require('../proxy').Recent_Contest;
var OJ_Status = require('../proxy').OJ_Status;


exports.index = function(req, res, next) {

	var events = ['rconts', 'oj_status', 'run_conts0', 'run_conts1', 'sch_conts0', 'sch_conts1'];
	var ep = EventProxy.create(events, function(rconts, oj_status, run_conts0, run_conts1, sch_conts0, sch_conts1) {
		res.render('index', {
			title: 'Home',
			fcontests: rconts,
			frun_conts0: run_conts0,
			frun_conts1: run_conts1,
			fsch_conts0: sch_conts0,
			fsch_conts1: sch_conts1,
			foj_status: oj_status,
			foj_msg: config.oj_msg,
		});
	});
	ep.fail(next);

	var now = new Date();
	now.setHours(now.getHours() + 8);
	var tm = now.toISOString().replace(/T/,' ').replace(/\..+/,'');

	Recent_Contest.getMulti({ start_time: {$gt: tm} },{},{ limit: config.rcont_per_page, sort: {start_time: 1} }, ep.done('rconts'));

	OJ_Status.getAllStatus(ep.done('oj_status'));

	now = new Date();
	var query = { start_time: { $lt: now }, end_time: { $gt: now }, type: 0 };
	var options = { limit: 5 };
	Contest.getMulti(query, {}, options, ep.done('run_conts0'));

	query = { start_time: { $lt: now }, end_time: { $gt: now }, type: 1 };
	Contest.getMulti(query, {}, options, ep.done('run_conts1'));

	query = { start_time: { $gt: now }, type: 0 };
	Contest.getMulti(query, {}, options, ep.done('sch_conts0'));

	query = { start_time: { $gt: now }, type: 1 };
	Contest.getMulti(query, {}, options, ep.done('sch_conts1'));
};


exports.faq = function(req, res, next) {
	res.render('FAQ', {
		title: 'FAQ',
	});
};
