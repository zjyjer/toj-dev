/**
 * Module dependecies
 */

var EventProxy = require('eventproxy');
var config = require('../config').config;
var Util = require('../libs/util');
var Contest = require('../proxy').Contest;
var Recent_Contest = require('../proxy').Recent_Contest;

exports.index = function(req, res, next) {

	var events = ['rconts'];
	var ep = EventProxy.create(events, function(rconts) {
		res.render('index', {
			title: 'Home',
			fcontests: rconts,
		});
	});
	ep.fail(next);

	Recent_Contest.getMulti({},{},{ sort: {start_time: 1} }, ep.done('rconts'));
};


