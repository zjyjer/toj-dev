var querystring = require('querystring');

var config = require('../config').config;
var Util = require('../libs/util');

var Problem = require('../proxy').Problem;
var EventProxy = require('eventproxy');
var User = require('../proxy').User;
var Code = require('../proxy').Code;
var Status = require('../proxy').Status;
var Contest = require('../proxy').Contest;
var Contest_Problem = require('../proxy').Contest_Problem;

/**
 * 查看Status页面
 * Status page
 * Status?pid=&username=&lang=&result=
 *
 * @param {HttpRequest} req
 * @param {HttpResponse} res
 * @param {Function} next
 */

exports.getByPage = function(req, res, next) {
	var _url = '/Status?';
	var _pid = req.query.pid ? parseInt(req.query.pid) : 0;
	var _lang = req.query.lang ? parseInt(req.query.lang) : 0;
	var _username = req.query.username ? req.query.username : '';
	var _result = req.query.result ? req.query.result : '';
	var _page = req.query.page ? parseInt(req.query.page) : 1;

	var query = {};
	if (_pid) {
		query.pid = _pid;
		_url += 'pid=' + _pid;
	} else  _url += 'pid=';

	if (_username) {
		query.username = _username;
		_url += '&username=' + _username;
	} else  _url += '&username=';

	if (_lang) {
		query.lang = _lang;
		_url += '&lang=' + _lang;
	} else  _url += '&lang=';

	if (_result) {
		query.result = config.digit2result[_result];
		_url += '&result=' + _result;
	} else  _url += '&result=';

	var _total_page;
	var loginUser = '';
	if (req.session.user) loginUser = req.session.user.username;

	var events = ['counts', 'stats'];
	var ep = EventProxy.create(events, function(counts, stats) {
		res.render('Status', {
			title:'Status',
			floginUser: loginUser,
			fstats: stats,
			fcorrlang: config.corrlang,
			fpageID: _page,
			fselected:{
				'lang': _lang,
				'result': config.digit2result[_result],
				'username': _username,
				'pid': _pid,
			},
			furl: _url,
			ftotal_page: _total_page,
		});
	});

	ep.fail(next);

	query.contest_belong = -1;

	Status.getCount(query, ep.done(function(counts) {
		_total_page = Math.ceil(counts / 15);
		if (_total_page == 0) _total_page = 1;

		ep.emit('counts', counts);
	}));

	var options = { limit: config.status_per_page, skip: (_page - 1) * config.status_per_page, sort: {run_ID: -1} };
	Status.getMulti(query, {}, options, ep.done('stats'));
};

/**
 * 查看Statistics页面
 * Statistics page
 * Statisitcs?pid=&lang=
 *
 * @param {HttpRequest} req
 * @param {HttpResponse} res
 * @param {Function} next
 */

exports.getStatistics = function(req, res, next) {
	var _url = '/Statistics?';
	var _pid = req.query.pid ? parseInt(req.query.pid) : 0;
	var _lang = req.query.lang ? parseInt(req.query.lang) : 0;
	var _page = req.query.page ? parseInt(req.query.page) : 1;

	if (!_pid) {
		req.flash('Invalid Problem!');
		return res.redirect('/Problems');
	}
	var query = { contest_belong: -1, speed: 51 };

	query.pid = _pid;
	_url += 'pid=' + _pid;

	if (_lang) {
		query.lang = _lang;
		_url += '&lang=' + _lang;
	} else  _url += '&lang=';

	var _total_page, _total_num;
	var loginUser = '';
	if (req.session.user) loginUser = req.session.user.username;

	var events = ['counts', 'statistics', 'prob'];
	var ep = EventProxy.create(events, function(counts, statistics, prob) {
		res.render('Statistics', {
			title:'Statistics',
			floginUser: loginUser,
			fprob: prob,
			fstatistics: statistics,
			fcorrlang: config.corrlang,
			fpageID: _page,
			flang: _lang,
			furl: _url,
			ftotal_page: _total_page,
			ftotal_num: _total_num,
		});
	});

	ep.fail(next);

	query.contest_belong = -1;

	Status.getCount(query, ep.done(function(counts) {
		_total_page = Math.ceil(counts / config.statistics_per_page);
		if (_total_page == 0) _total_page = 1;
		_total_num = counts;

		ep.emit('counts', counts);
	}));

	Problem.getOne({pid: _pid}, ep.done('prob'));

	var options = { limit: config.statistics_per_page , skip: (_page - 1) * config.statistics_per_page };
	Status.getMulti(query, {}, options, ep.done('statistics'));
};

exports.get_ce = function(req, res, next) {
	var events = ['stat'];
	var ep = EventProxy.create(events, function(stat) {
		res.render('ShowCEError', {
			title: 'Compile Information',
			fce_info: stat.ce_info,
		});
	});

	ep.fail(next);

	var _cid = req.query.cid ? parseInt(req.query.cid) : -1;
	var _runid = req.query.runid ? parseInt(req.query.runid) : -1;
	Status.getOne({ contest_belong: _cid, run_ID: _runid }, ep.done('stat'));
};


/**
 * Contest 的 Status
 *
 */

exports.contest_getByPage = function(req, res, next) {
	var _url = '/Contest/Status?';
	var _cid = req.query.cid ? parseInt(req.query.cid) : 0;
	var _nid = req.query.pid ? parseInt(req.query.pid) : 0;
	var _lang = req.query.lang ? parseInt(req.query.lang) : 0;
	var _username = req.query.username ? req.query.username : '';
	var _result = req.query.result ? req.query.result : '';
	var _page = req.query.page ? parseInt(req.query.page) : 1;

	var query = {};

	if (!_cid) {
		req.flash('error', 'Invalid Contest!');
		return res.redirect('/Contest/Contests?type=0');
	}

	query.contest_belong = _cid;
	_url += 'cid=' + _cid;

	if (_nid) {
		_url += 'pid=' + _nid;
	} else  _url += 'pid=';

	if (_username) {
		query.username = _username;
		_url += '&username=' + _username;
	} else  _url += '&username=';

	if (_lang) {
		query.lang = _lang;
		_url += '&lang=' + _lang;
	} else  _url += '&lang=';

	if (_result) {
		query.result = config.digit2result[_result];
		_url += '&result=' + _result;
	} else  _url += '&result=';

	var _total_page;
	var loginUser = '';
	if (req.session.user) loginUser = req.session.user.username;

	var events = ['cont', 'counts', 'stats', 'map'];
	var ep = EventProxy.create(events, function(cont, counts, stats, map) {

		res.render('Contest/Contest_Status', {
			title:'Status',
			floginUser: loginUser,
			fcont: cont,
			fstats: stats,
			fmap: map,
			fcorrlang: config.corrlang,
			fpageID: _page,
			fselected:{
				'lang': _lang,
				'result': config.digit2result[_result],
				'username': _username,
				'pid': _nid,
			},
			furl: _url,
			ftotal_page: _total_page,
		});
	});

	ep.fail(next);

	Contest.getOne({ cid: _cid}, ep.done(function(cont) {
		ep.emit('cont', cont);
		var options = { limit: config.status_per_page, skip: (_page - 1) * config.status_per_page, sort: {run_ID: -1} };
		if (_nid) {
			Contest_Problem.getOne({ cid: _cid, nid: _nid }, function(err, cp) {
				query.pid = cp.pid;
				Status.getMulti(query, {}, options, ep.done('stats'));
			});
		} else {
			Status.getMulti(query, {}, options, ep.done('stats'));
		}
	}));

	Status.getCount(query, ep.done(function(counts) {
		_total_page = Math.ceil(counts / 15);
		if (_total_page == 0) _total_page = 1;

		ep.emit('counts', counts);
	}));
	Contest_Problem.getMulti({ cid: _cid }, {}, {}, function(err, probs) {
		var map = {};
		if (err || !probs) {
			ep.unbind();
			req.flash('error', 'Error, something happeded.');
			return res.redirect('/Contest/Contests?type=0');
		} else {
			probs.forEach(function(prob, index) {
				map[prob.pid] = prob.nid;
				if (index == probs.length - 1) ep.emit('map', map);
			});
		}
	});
};

/**
 * Contest Statistics
 */

exports.contest_getStatistics = function(req, res, next) {
	var _url = '/Contest/Statistics?';
	var _cid = req.query.cid ? parseInt(req.query.cid) : 0;
	var _nid = req.query.pid ? parseInt(req.query.pid) : -1;
	var _lang = req.query.lang ? parseInt(req.query.lang) : 0;
	var _page = req.query.page ? parseInt(req.query.page) : 1;

	if (!_cid) {
		req.flash('Invalid Contest!');
		return res.redirect('/Contest/Contests?type=0');
	}
	if (_nid == -1) {
		req.flash('Invalid Problem!');
		return res.redirect('/Contest/Contests?type=0');
	}

	var query = { contest_belong: _cid, speed: 51 };

	_url += 'cid=' + _cid + '&pid=' + _nid;
	//query.pid = _pid;

	if (_lang) {
		query.lang = _lang;
		_url += '&lang=' + _lang;
	} else  _url += '&lang=';

	var _total_page, _total_num;
	var loginUser = '';
	if (req.session.user) loginUser = req.session.user.username;

	var events = ['prob', 'counts', 'statistics'];
	var ep = EventProxy.create(events, function(prob, counts, statistics) {

		res.render('Contest/Contest_Statistics', {
			title:'Statistics',
			floginUser: loginUser,
			fprob: prob,
			fstatistics: statistics,
			fcorrlang: config.corrlang,
			fpageID: _page,
			flang: _lang,
			furl: _url,
			ftotal_page: _total_page,
			ftotal_num: _total_num,
		});
	});

	ep.fail(next);

	Contest_Problem.getOne({ cid: _cid, nid: _nid}, ep.done(function(prob) {

		query.pid = prob.pid;
		ep.emit('prob', prob);

		Status.getCount(query, ep.done(function(counts) {
			_total_page = Math.ceil(counts / config.statistics_per_page);
			if (_total_page == 0) _total_page = 1;
			_total_num = counts;

			ep.emit('counts', counts);
		}));

		var options = { limit: config.statistics_per_page , skip: (_page - 1) * config.statistics_per_page };
		Status.getMulti(query, {}, options, ep.done('statistics'));
	}));

};

