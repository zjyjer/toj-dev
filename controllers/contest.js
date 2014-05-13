var net = require('net');
var querystring = require('querystring');
var EventProxy = require('eventproxy');

var config = require('../config').config;
var Util = require('../libs/util');
var Problem = require('../proxy').Problem;
var User = require('../proxy').User;
var Code = require('../proxy').Code;
var Status = require('../proxy').Status;
var Contest = require('../proxy').Contest;
var Contest_Problem = require('../proxy').Contest_Problem;
var Contest_User = require('../proxy').Contest_User;


exports.getByPage = function(req, res, next) {
	var _type = req.query.type ? parseInt(req.query.type) : 0;
	var _page = req.query.page ? parseInt(req.query.page) : 1;
	var events = ['conts'];
	var ep = EventProxy.create(events, function(conts) {
		res.render('Contest/Contests', {
			title: 'Contests',
			fconts: conts,
			ftm: new Date(),
		});
	});

	ep.fail(next);

	var query = { type: _type , visible: true };
	var options = { limit: config.contest_per_page, skip: (_page - 1) * config.contest_per_page, sort: {cid: -1} };

	Contest.getMulti(query, {}, options, ep.done('conts'));

};

exports.get_arrange = function(req, res, next) {
	var _type = parseInt(req.query.type);

	return res.render('Contest/Arrange', {
		title: 'Arrange a Contest',
	       	iscopy: 0,
	       	fuser: req.session.user,
	       	fcont: '',
	       	fprobs: [],
		ftype: _type,
	       	fojs: config.ojs,
	});
};

exports.post_arrange = function(req, res, next) {
	var _currentUser = req.session.user;
	var _type = parseInt(req.query.type);
	var _title = req.body['ctitle'];
	var _desc = req.body['cdesc'];
	var _st_time = req.body['csttime'];
	var _ed_time = req.body['cedtime'];
	var _passwd = req.body['cpasswd'];
	var _probs = [];

	for(var i = 1001;i <= config.contest_max_probs + 1000; ++i) {
		if (req.body['pid'+i] == '') break;
		_probs.push({ 'oj': req.body['oj'+i], 'vid': req.body['pid'+i] });
	}

	Contest.getCount(function(err, counts) {
		if (err) {
			req.flash('error', err);
			return res.redirect('/Contest/Contests?type=' + _type);
		}
		var _cont = {
			'cid': counts + 1,
			'type': _type,
			'title': _title,
			'desc': _desc,
			'start_time': _st_time,
			'end_time': _ed_time,
			'author': _currentUser.username,
			'passwd': _passwd,
		}

		//存该比赛到数据库
		Contest.newAndSave(_cont, function(err, cont, na) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/Contest/Contests?type=' + _type);
			}

			//现在没问题了，利用eventproxy的after将题目得到pid并存到contest_problem
			var ep = new EventProxy();
			ep.after('get_and_save', _probs.length, function (list) {
				req.flash('success', 'Arrange Contest successfully.');
				return res.redirect('/Contest/Contests?type=' + _type);
			});
			for (var i = 0; i < _probs.length; i++) {
				(function(i) {
					Problem.getOne(_probs[i], function(err, prob) {
						if (err) {
							req.flash('error', err);
							return res.redirect('/Contest/Contests?type=' + _type);
						}
						Contest_Problem.newAndSave(counts + 1, prob.pid, i, prob.title, function(err, cp, na) {
							if (err) {
								req.flash('error', err);
								return res.redirect('/Contest/Contests?type=' + _type);
							}
							ep.emit('get_and_save');
						});
					});
				})(i);
			}
		});
	});

};

exports.get_setting = function(req, res, next) {
	var _cid = parseInt(req.query.cid);

	Contest.getOne({ cid:_cid }, function(err, doc) {
		if (doc.author != req.session.user.username) {
			res.render('500.html', {title: '500 Error'});
		} else {
			return res.render('Contest/Settings', {
				title: 'Settings',
				fuser: req.session.user,
				fcont: doc,
				fcid: _cid,
			});
		}
	});
};

exports.post_setting = function(req, res, next) {
	var _cid = parseInt(req.query.cid);
	var _title = req.body['ctitle'];
	var _desc = req.body['cdesc'];
	var _st_time = req.body['csttime'];
	var _ed_time = req.body['cedtime'];
	var _passwd = req.body['cpasswd'];

	Contest.getOne({ cid: _cid }, function(err, doc) {
		if (err || !doc) {
			req.flash('error', 'Invalid Contest!');
			return res.redirect('/Contest/Contests?type=0');
		}
		if (_title) doc.title = _title;
		if (_desc) doc.desc = _desc;
		if (_st_time) doc.start_time = _st_time;
		if (_ed_time) doc.end_time = _ed_time;
		doc.save();
		req.flash('success', 'The Contest has been updated!');
		res.redirect('/Contest/ShowContests?cid='+_cid);
	});
};

exports.post_del = function(req, res, next) {
	var _cid = req.body['cid'] ? parseInt(req.body['cid']) : 0;

	if (!_cid) return res.send(0);

	Contest.getOne({ cid: _cid }, function(err, doc) {
		if (err || !doc) {
			return res.send({ ok: 0 });
		}
		if (doc.author != req.session.user.username) return res.send({ ok: 0 });
		doc.visible = false;
		doc.save();
		return res.send({ ok: 1 });
	});
};

exports.clone = function(req, res, next) {
	var _cid = req.query.from ? parseInt(req.query.from) : 0;

	if (!_cid) {
		req.flash('Invalid Contest!');
		return res.redirect('/Contest/Contests?type=0');
	}

	var events = ['cont', 'probs'];

	var ep = EventProxy.create(events, function(cont, probs) {
		return res.render('Contest/Arrange', {
			title: 'Clone a Contest',
		       	iscopy: 1,
		       	fuser: req.session.user,
		       	ftype: cont.type,
		       	fojs: config.ojs,
		       	fcont: cont,
		       	fprobs: probs,
		});
	});

	ep.fail(next);

	Contest.getOne({ cid: _cid }, ep.done('cont'));

	var query = { cid: _cid };
	var fields = { pid: 1 };
	var options = { sort: {nid: 1} };
	Contest_Problem.getMulti(query, fields, options, ep.done(function(probs) {
			var ep2 = new EventProxy();
			ep2.after('get_oj_vid', probs.length, function (list) {
				ep.emit('probs', list);
			});
			for (var i = 0; i < probs.length; i++) {
				(function(i) {
					Problem.getOne({ pid: probs[i].pid } , function(err, prob) {
						ep2.emit('get_oj_vid', prob);
					});
				})(i);
			}
	}));
};

exports.check_pid = function(req, res, next) {
	var _oj = req.body['oj'];
	var _vid = req.body['pid'];

	Problem.getOne({ oj: _oj, vid: _vid }, function(err, prob) {
		if(err || !prob) {
			return res.send({ error:1, title: '' });
		} else {
			return res.send({ error:0, title: prob.title });
		}
	});
};

exports.get_enter = function(req, res, next) {
	var _cid = req.query.cid ? parseInt(req.query.cid) : 0;
	if (!_cid) {
		req.flash('error', 'Contest is not exists.Maybe it has been deleted.');
		return res.redirect('/Contest/Contests?type=0');
	}
	res.render('Contest/Contest_Enter', {
		title: 'Enter Contest',
		fcid: _cid,
	});
};

exports.post_enter = function(req, res, next) {
	var _cid = req.query.cid ? parseInt(req.query.cid) : 0;
	var _passwd = req.body['passwd'];

	Contest.getOne( {cid: _cid, visible: true }, function(err, cont) {
		if (err || !cont) {
			req.flash('error', 'Contest does not exists.Maybe it has been deleted.');
			return res.redirect('/Contest/Contests?type=0');
		} else if (cont.passwd != _passwd) {
			return res.send({ error: '1' });
		} else {
			Contest_User.newAndSave( _cid, req.session.user.username, function(err, cu, na) {
				if (err) {
					req.flash('error', 'Contest does not exists.Maybe it has been deleted.');
					return res.redirect('/Contest/Contests?type=0');
				}
				res.send({ error: '0' });
			});
		}
	});
};

exports.show_info = function(req, res, next) {
	var _cid = req.query.cid ? parseInt(req.query.cid) : 0;
	
	if (!_cid) {
		req.flash('error', 'Contest does not exists.Maybe it has been deleted.');
		return res.redirect('/Contest/Contests?type=0');
	}

	Contest.getOne({ cid: _cid, visible: true }, function(err, cont) {
		if (err) {
			req.flash('error', err);
			return res.redirect('/Contest/Contests?type=0');
		}
		return res.render('Contest/ShowContest', {
			title: cont.title,
		       	fcont: cont,
		});
	});
};

exports.get_problem = function(req, res, next) {
	var _cid = parseInt(req.body['cid']);
	var _nid = parseInt(req.body['index']);

	var events = ['prob', 'total_submit', 'total_ac'];
	var ep = EventProxy.create(events, function(prob, total_submit, total_ac) {
		return res.send({ title: prob.title, all: total_submit, ac: total_ac });
	});

	ep.fail(next);

	Contest_Problem.getOne({ cid: _cid, nid: _nid }, ep.done(function(prob) {
		ep.emit('prob', prob);
		Status.getCount({ contest_belong: _cid, pid: prob.pid }, ep.done('total_submit'));
		Status.getCount({ contest_belong: _cid, pid: prob.pid, result: 'Accepted' }, ep.done('total_ac'));
	}));

};

exports.show_problem = function(req, res, next) {
	var _cid = parseInt(req.query.cid);

	var events = ['cont', 'probs', 'submitted'];

	var ep = EventProxy.create(events, function(cont, probs, submitted) {
		return res.render('Contest/Contest_Problem', {
			title: 'Problems',
		       	fcont: cont,
		       	fprobs: probs,
		       	fsubmitted: submitted,
		       	fshow: (new Date() > cont.start_time),
		});
	});

	ep.fail(next);

	Contest.getOne({ cid: _cid }, ep.done('cont'));

	var query = { cid: _cid };
	var options = { sort: {nid: 1} };
	Contest_Problem.getMulti(query, {}, options, ep.done('probs'));
	Contest_Problem.getMulti(query, {}, options, ep.done(function(probs) {
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
					Status.getSubmitted(_cid, username, probs[i].pid, function(err, mark) {
						if (mark != 0) list[probs[i].pid] = mark;
						ep2.emit('getone', '');
					});
				})(i);
			}
		}
	}));
};

exports.show_one_problem = function(req, res, next) {
	var _cid = req.query.cid ? parseInt(req.query.cid) : 0;
	var _nid = req.query.pid ? parseInt(req.query.pid) : 0;

	if (!_cid || !_nid) {
		req.flash('error', 'Invalid Contest or Problem!');
		return res.redirect('/Contest/Contests?type=0');
	}

	_nid = _nid - 1001;

	var events = ['counts', 'pid', 'prob'];

	var ep = EventProxy.create(events, function(counts, pid, prob) {
		return res.render('Contest/Contest_ShowProblem', {
			title: req.query.pid + '-' + prob.title,
		       	fcounts: counts,
		       	findex: _nid,
		       	fcid: _cid,
		       	fprob: prob,
		});
	});

	ep.fail(next);

	Contest_Problem.getCount({ cid: _cid }, ep.done('counts'));

	Contest_Problem.getOne({ cid: _cid, nid: _nid }, ep.done(function(cprob) {
		ep.emit('pid', cprob.pid);
		Problem.getOne({ pid: cprob.pid }, ep.done('prob'));
	}));

};

exports.get_submit = function(req, res, next) {
	var _cid = req.query.cid ? parseInt(req.query.cid) : 0;
	var _nid = req.query.pid ? parseInt(req.query.pid) : 0;

	if (!_cid || !_nid) {
		req.flash('error', 'Invalid Contest or Problem!');
		return res.redirect('/Contest/Contests?type=0');
	}

	_nid = _nid - 1001;

	var events = ['cont', 'pid', 'prob'];

	var ep = EventProxy.create(events, function(cont, pid, prob) {
		return res.render('Contest/Contest_ProbSubmit', {
			title: 'Submit',
		       	fcid: _cid,
		       	findex: _nid,
		       	fprob: prob,
		       	fedtime: cont.end_time,
			flang: config.oj_lang[prob.oj],
		});
	});

	ep.fail(next);

	Contest.getOne({ cid: _cid }, ep.done('cont'));


	Contest_Problem.getOne({ cid: _cid, nid: _nid }, ep.done(function(cprob) {
		ep.emit('pid', cprob.pid);
		Problem.getOne({ pid: cprob.pid }, ep.done('prob'));
	}));
};

exports.post_submit = function(req, res, next) {
	var _cid = req.query.cid ? parseInt(req.query.cid) : 0;
	var _nid = req.query.pid ? parseInt(req.query.pid) : 0;
	var _code = req.body['code'];
	var _lang = req.body['lang'];
	var _username = req.session.user.username;

	if (!_cid || !_nid) {
		req.flash('error', 'Invalid Contest or Problem!');
		return res.redirect('/Contest/Contests?type=0');
	}

	_nid = _nid - 1001;

	var proxy = new EventProxy();
	var render = function() {
		res.redirect('/Contest/Status?cid='+_cid+'&page=1');
	};

	proxy.assign('prob_update', 'get_oj', 'counts', 'code_save', 'status_save', 'submit', render);

	proxy.fail(next);


	// 在Contest_Problem集合里获取Prob，total_submit+1
	// 至于结果的更新，交给judger
	Contest_Problem.getOne({ cid: _cid, nid: _nid }, proxy.done(function(prob) {
		prob.total_submit += 1;
		prob.save();

		proxy.emit('prob_update');

		// 获取counts，以便计算runid，没有自增ID的好讨厌= = 
		Status.getCount({}, proxy.done(function(counts) {

			proxy.emit('counts', counts);

			Problem.getOne({ pid: prob.pid }, proxy.done(function(rprob) {

				var _runid = counts + 1;
				var data = config.submit_string + "\n" + _runid + "\n" + rprob.oj;

				proxy.emit('get_oj');


				// 好，现在有runid了
				// 貌似存一下code和status就可以提交了，好开森= =

				Code.newAndSave(_cid, _runid, _code, proxy.done('code_save'));

				var _status = {
					contest_belong:	_cid,
				run_ID: 	_runid,
				username: 	_username,
				pid: 	prob.pid,
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
					return res.redirect('/Contest/Status?cid=' + _cid + '&page=1');
				});
				client.on('close', function() {
					proxy.emit('submit');
				});
			}));
		}));

	}));
};

exports.get_standing = function(req, res, next) {
	var _cid = req.query.cid ? parseInt(req.query.cid) : 0;

	if (!_cid) {
		req.flash('error', 'Invalid Contest!');
		return res.redirect('/Contest/Contests?type=0');
	}

	var events = ['cont', 'cont_probs'];

	var ep = EventProxy.create(events, function(cont, cont_probs) {
		res.render('Contest/Contest_Standing', {
			title: 'Standing',
			fcont: cont,
			fcont_probs: cont_probs,
		});
	});

	ep.fail(next);

	Contest.getOne({ cid: _cid}, ep.done('cont'));

	Contest_Problem.getMulti({ cid: _cid }, {}, { sort: {nid: 1} }, ep.done('cont_probs'));
};

exports.post_standing = function(req, res, next) {
	var _cid = parseInt(req.body['cid']);

	var events = ['cont', 'cont_probs', 'stats'];

	var ep = EventProxy.create(events, function(cont, cont_probs, stats) {
		var ret = Util.get_standing_via_status(cont, cont_probs, stats);
		res.send({ sa: ret['standing'], fb: ret['fb'], solve: ret['solve'] });
	});

	ep.fail(next);

	Contest.getOne({ cid: _cid }, ep.done('cont'));

	Contest_Problem.getMulti({ cid: _cid }, {}, { sort: { nid: 1}}, ep.done('cont_probs'));

	var query = { contest_belong: _cid};
	var options = { sort: {submit_time: 1} };
	Status.getMulti(query, {}, options, ep.done('stats'));

};
