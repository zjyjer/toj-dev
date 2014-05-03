var EventProxy = require('eventproxy');
var config = require('../config').config;

var Code = require('../proxy').Code;
var Status = require('../proxy').Status;

/**
 * 查看Code
 * Show Code page
 *
 * @param {HttpRequest} req
 * @param {HttpResponse} res
 * @param {Function} next
 */

exports.getByRunid = function(req, res, next) {
	var _runid = req.query.runid ? parseInt(req.query.runid) : 0;
	var _cid = req.query.cid ? parseInt(req.query.cid) : -1;
	
	if(!_runid) {
		req.flash('error', 'Code does not exist!');
		return res.redirect('/Status');
	}

	var events = ['status', 'code'];
	var ep = EventProxy.create(events, function(status, code) {
		var currentUser = req.session.user;
		if(!currentUser || currentUser.username != status.username) {
			req.flash('error', 'You don\'t have the permission!');
			if (_cid == -1) {
				return res.redirect('/Status');
			} else {
				return res.redirect('/Contest/Status?cid=' + _cid);
			}
		}
		if (_cid == -1) {
			res.render('ShowCode', {
				title:'View Code',
				fstat: status,
				fcode: code,
				fcorrlang: config.corrlang,
			});
		} else {
			res.render('Contest/Contest_ShowCode', {
				title:'View Code',
				fstat: status,
				fcode: code,
				fcorrlang: config.corrlang,
			});
		}
	});

	ep.fail(next);

	Status.getOne({ contest_belong: _cid, run_ID: _runid }, ep.done('status'));
	Code.getOne({ contest_belong: _cid, run_ID: _runid }, ep.done('code'));
};
