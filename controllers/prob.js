var net = require('net');
var querystring = require('querystring');
var EventProxy = require('eventproxy');

var config = require('../config').config;
var Util = require('../libs/util');
var Problem = require('../proxy').Problem;
var User = require('../proxy').User;
var Code = require('../proxy').Code;
var Status = require('../proxy').Status;

/**
 * 查看题目列表，可选择oj，页数
 * Volume page
 * Problems?volume=&oj=
 *
 * @param {HttpRequest} req
 * @param {HttpResponse} res
 * @param {Function} next
 */

exports.getByPage = function(req, res, next) {
	var _volume = req.query.volume ? parseInt(req.query.volume) : 1;
	var _oj = req.query.oj;
	var _page;
	var _url = '/Problems?';

	if(_oj && _oj != 'All') {
		req.session.oj = _oj;
		_url += 'oj=' + _oj + '&';
	}
	_url += 'volume=';

	var events = ['counts', 'probs', 'submitted'];
	var ep = EventProxy.create(events, function(counts, probs, submitted) {
		res.render('Volume', {
			title: 'Problems',
			fvol_num: _volume,
			fprobs: probs,
			fsubmitted: submitted,
			fpage: _page,
			furl: _url,
			foj: _oj,
			fojs: config.ojs,
		});
	});

	ep.fail(next);

	var query = {};
	if(_oj && _oj != 'All') query.oj = _oj;
	Problem.getCount(query, ep.done(function(counts) {
		_page = Util.get_Pagelist(_volume, counts);
		ep.emit('counts', counts);
	}));

	var query2 = {};
	if(_oj && _oj != 'All') query2.oj = _oj;
	var options = { skip: config.prob_per_page * (_volume - 1), limit: config.prob_per_page, sort: {'pid': 1}  };
	var fields = {
		'pid': 1,
		'title': 1, 
		'oj': 1,
		'vid': 1,
		'vtotal_submit': 1,
		'total_submit': 1,
		'vtotal_ac': 1,
		'total_ac': 1
	};

	//Problem.getByPage(query2, fields, options, ep.done('probs'));
	Problem.getByPage(query2, fields, options, ep.done(function(probs) {
		ep.emit('probs', probs);
		var currentUser = req.session.user;		
		if (!currentUser) {
			ep.emit('submitted', {});
		} else {
			var ep2 = new EventProxy();
			var list = {};
			ep2.after('getone', probs.length, function(as) {
				ep.emit('submitted', list);
			});
			var username = currentUser.username;
			for(var i = 0;i < probs.length; ++i) {
				(function(i) {
					Status.getSubmitted(-1, username, probs[i].pid, function(err, mark) {
						if (mark != 0) list[probs[i].pid] = mark;
						ep2.emit('getone', '');
					});
				})(i);
			}
		}
	}));
};

/**
 * 查看具体题目
 * Show Problems
 *
 * @param {HttpRequest} req
 * @param {HttpResponse} res
 * @param {Function} next
 */
exports.getByPid = function(req, res, next) {
	var _pid = req.query.pid ? parseInt(req.query.pid) : 0;
	if(!_pid) {
		req.flash('error', 'No Such Problem!');
		return res.redirect('/Problems');
	}
	var events = ['prob'];
	var ep = EventProxy.create(events, function(prob) {
		res.render('ShowProblem', {
			title: prob.title,
			fprob: prob,
			flinks: config.oj_links,
		});
	});

	ep.fail(next);

	Problem.getOne({pid: _pid}, ep.done('prob'));
};

/**
 * 题目搜索
 * Search Problems
 *
 * @param {HttpRequest} req
 * @param {HttpResponse} res
 * @param {Function} next
 */
exports.search = function(req, res, next) {
	var _info = req.body['info'];
	var _oj = req.body['oj'];

	var query = {};
	if(_oj && _oj != 'All') query.oj = _oj;

	var fields = {
		'pid': 1,
		'title': 1,
		'oj': 1,
		'vid': 1,
		'vtotal_submit': 1,
		'vtotal_ac': 1,
		'total_submit': 1,
		'total_ac': 1,
	};
	var options = { sort: {pid: 1} };
	var events = ['probs', 'submitted'];
	var ep = EventProxy.create(events, function(probs, submitted) {
		res.render('SearchProblems', {
			title: 'Search Result',
			fprobs: probs,
			fsubmitted: submitted,
			foj: _oj,
			fojs: config.ojs,
			fnum: probs.length,
		});
	});

	ep.fail(next);

	Problem.search(_info, query, fields, options, ep.done(function(probs) {
		ep.emit('probs', probs);
		var currentUser = req.session.user;		
		if (!currentUser) {
			ep.emit('submitted', {});
		} else {
			var ep2 = new EventProxy();
			var list = {};
			ep2.after('getone', probs.length, function(as) {
				ep.emit('submitted', list);
			});
			var username = currentUser.username;
			for(var i = 0;i < probs.length; ++i) {
				(function(i) {
					Status.getSubmitted(-1, username, probs[i].pid, function(err, mark) {
						if (mark != 0) list[probs[i].pid] = mark;
						ep2.emit('getone', '');
					});
				})(i);
			}
		}
	}));
};

/**
 * 提交(GET)
 * Submit Problems
 *
 * @param {HttpRequest} req
 * @param {HttpResponse} res
 * @param {Function} next
 */
exports.get_submit = function(req, res, next) {
	var _pid = req.query.pid ? parseInt(req.query.pid) : 0;
	if(!_pid) {
		req.flash('error', 'No Such Problem!');
		return res.redirect('/Problems');
	}
	var events = ['prob'];
	var ep = EventProxy.create(events, function(prob) {
		res.render('ProbSubmit', {
			title: 'Submit',
			fprob: prob,
			flang: config.oj_lang[prob.oj],
		});
	});

	ep.fail(next);

	Problem.getOne({pid: _pid}, ep.done('prob'));
};

/**
 * 提交(POST)
 * Submit Problems
 *
 * @param {HttpRequest} req
 * @param {HttpResponse} res
 * @param {Function} next
 */
exports.post_submit = function(req, res, next) {
	var _pid = req.query.pid ? parseInt(req.query.pid) : 0;
	var _code = req.body['code'];
	var _lang = req.query.pid ? parseInt(req.body['lang']) : 0;
	var _username = req.session.user.username;

	if (!_pid) {
		req.flash('error', 'No Such Problem!');
		return res.redirect('/Prolems');
	}
	if (!_lang) {
		req.flash('error', 'Please select a valid language!');
		return res.redirect('/ShowProblems?pid=' + _pid);
	}

	var proxy = new EventProxy();
	var render = function() {
		res.redirect('/Status?page=1');
	};

	proxy.assign('prob_update', 'counts', 'code_save', 'status_save', 'user_update', 'submit', render);
	proxy.fail(next);



	Problem.getOne({pid: _pid}, proxy.done(function(prob) {
		if (!prob) {
			proxy.unbind();
			req.flash('error', 'No Such Problem!');
			return res.redirect('/Problems');
		}

		prob.total_submit += 1;	//题目提交数+1
		prob.save();

		proxy.emit('prob_update');
		//题目没有问题，存在
		//接下来检查用户是否存在

		User.getByName({username: _username}, proxy.done(function(user) {
			if (!user) {
				proxy.unbind();
				req.flash('error', 'No Such User!');
				return res.redirect('/Problems');
			}

			user.total_submit += 1;	//题目提交数+1
			user.save();

			proxy.emit('user_update');


			//题目和用户都没有问题，准备提交
			//获取runid等
			Status.getCount({}, proxy.done(function(counts) {

				var _runid = counts + 1;
				var data = config.submit_string + "\n" + _runid + "\n" + prob.oj;

				proxy.emit('counts', counts);

				Code.newAndSave(-1, _runid, _code, proxy.done('code_save'));

				var _status = {
					contest_belong:	-1,
				run_ID: 	_runid,
				username: 	_username,
				pid: 	_pid,
				oj: 	prob.oj,
				lang: 	_lang,
				code_len:	_code.length,
				submit_time:	new Date(),
				result:		'Waiting'
				};

				Status.newAndSave(_status, proxy.done('status_save'));


				// 这里应该添加一个error处理函数，如果judge无法发送socket怎么办
				// later...
				var client = new net.Socket();
				client.connect(config.judge_port, config.judge_host, function() {
					client.write(data);
				});
				client.on('error',function(error){
					proxy.unbind();
					req.flash('error', 'The judge is temporary unavailable.Sorry.');
					return res.redirect('/Status?&page=1');
				});
				client.on('close', function() {
					proxy.emit('submit');
				});


			}));
		}));

	}));

};


exports.getTags = function(req, res, next ) {
	var _pid = req.body['pid'] ? parseInt(req.body['pid']) : 0;
	Problem.getTags({ pid: _pid }, function(err, doc) {
		var json = {};
		json.tag = doc ? doc.tag : [];
		json.access = 0;
		if (req.session.user) {
			Status.getOne({ pid: _pid, username: req.session.user.username, result: 'Accepted' }, function(err, doc) {
				if (doc) json.access = 1;
				res.send(json);
			});
		} else {
			res.send(json);
		}
	});
};

exports.addTags = function(req, res, next ) {
	var _pid = req.body['pid'] ? parseInt(req.body['pid']) : 0;
	var _tag = req.body['tag'] ? req.body['tag'] : '';

	if (!_pid) return res.send({ ok: 0, list: [] });
	if (!_tag) return res.send({ ok: 0, list: [] });

	Problem.getOne({ pid: _pid }, function(err, doc) {
		if (err || !doc) return res.send({ ok: 0, list: [] });
		doc.tag.addToSet(_tag);
		doc.save();
		res.send({ ok: 1, list: doc.tag });
	});
};
