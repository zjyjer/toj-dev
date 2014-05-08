var crypto = require('crypto');
var fs = require('fs');
var EventProxy = require('eventproxy');

var User = require('../proxy').User;
var Status = require('../proxy').Status;
var config = require('../config').config;
var Util = require('../libs/util');

exports.get_register = function(req, res, next) {
	return res.render('reg', {
		title: 'Register',
	});
};

exports.post_register = function(req, res, next) {
	if (req.body['password-repeat'] != req.body['password']) {
		req.flash('error', 'The password isn\'t the same.');
		return res.redirect('/reg');
	}

	//md5
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');

	var proxy = new EventProxy();
	var render = function() {
		req.flash('success', 'Register succeed.');
		res.redirect('/');
	};


	proxy.assign('check', 'add', render);

	proxy.fail(next);

	User.getByName({ username: req.body['username'] }, proxy.done(function(user) {
		if (user) {
			req.flash('error', 'Username already exists.');
			proxy.unbind();
			return res.redirect('/reg');
		}

		proxy.emit('check');
		
		User.newAndSave(req.body['username'], password, proxy.done(function(user, na) {
			req.session.user = user;
			proxy.emit('add');
		}));
	}));
};

exports.get_login = function(req, res, next) {
	return res.render('login', {
		title: 'Sign in',
	});
};

exports.post_login = function(req, res, next) {

	//md5
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');

	var proxy = new EventProxy();
	var render = function() {
		req.flash('success', 'Sign in success.');
		res.redirect('/');
	};

	proxy.assign('check', render);

	proxy.fail(next);

	User.getByName({ username: req.body.username }, proxy.done(function(user) {
		if (!user) {
			proxy.unbind();
			req.flash('error', 'Username doesn\'t exists.');
			return res.redirect('/login');
		} else if(user.password != password){
			proxy.unbind();
			req.flash('error', 'Username and password doesn\'t match.');
			return res.redirect('/login');
		} else {
			req.session.user = user;
			proxy.emit('check');
		}
	}));
};

exports.checkExists = function(req, res, next) {
	User.getByName({ username: req.body['username'] }, function(message, user) {
		if(user) {
			res.send({exists: 1});
		} else {
			res.send({exists: 0});
		}
	});
};
	
exports.get_logout = function(req, res, next) {
	req.session.user = null;
	req.flash('success', 'Sign out success.');
	return res.redirect('/');
};


exports.get_changePasswd = function(req, res, next) {
	var _username = req.query.u;
	return res.render('ChangePasswd', {
		title: 'Change Password',
	       	fusername: _username,
	});
};

exports.post_changePasswd = function(req, res, next) {
	var _username = req.session.user.username;
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body['password']).digest('base64');

	var proxy = new EventProxy();
	var render = function() {
		req.flash('success', 'Your password has been changed successfully.');
		res.redirect('/');
	};

	proxy.assign('change', render);

	proxy.fail(next);

	User.getByName({ username: _username }, proxy.done(function(user) {
		if (!user) {
			proxy.unbind();
			req.flash('error', 'Username doesn\'t exists.');
			return res.redirect('/');
		}
		user.password = password;
		user.save(function(err) {
			if (err) {
				proxy.unbind();
				console.log(err);
				req.flash('error', err);
				return res.redirect('/');
			} else {
				proxy.emit('change');
			}
		});
	}));

};

exports.post_checkPasswd = function(req, res, next) {
	var md5 = crypto.createHash('md5');
	var _username = req.body['username'];
	var _passwd = req.body['passwd'];
	var _password = md5.update(_passwd).digest('base64');

	User.getByName({ username: _username}, function(err, user) {
		if (err || !user) {
			req.flash('error', 'User doesn\'t exists.');
			return res.redirect('/');
		}
		if (user.password == _password) {
			return res.send( {match: 1} );
		} else  return res.send( {match: 0} );

	});

};

exports.get_profile = function(req, res, next) {
	var _currentUser = req.session.user;
	var _username = _currentUser ? _currentUser.username : '';


	var events = ['user', 'pids', 'rank'];
	var ep = EventProxy.create(events, function(user, pids, rank) {
		return res.render('profile', {
			title: 'Profile',
		       	fuser: user,
		       	fusername: _username,
		       	fpids: pids,
		       	frank: rank,
		});
	});

	ep.fail(next);

	User.getByName({ username: req.params.user }, ep.done('user'));

	User.getRankByAC( req.params.user, ep.done('rank'));

	var query = { speed: 51, username: req.params.user};
	var fields = { pid: 1 };

	Status.getMulti(query, fields, {}, ep.done('pids'));
};

exports.save_profile = function(req, res, next) {
	var _currentUser = req.session.user;

	var proxy = new EventProxy();
	var render = function() {
		res.redirect('/profile/' + _currentUser.username);
	};


	proxy.assign('save', render);

	proxy.fail(next);

	User.getByName({ username: _currentUser.username }, proxy.done(function(user) {
		if (req.body['nickname']) user.nickname = req.body['nickname'];
		if (req.body['email']) user.email = req.body['email'];
		if (req.body['univer']) user.univer = req.body['univer'];
		if (req.body['country']) user.country = req.body['country'];
		if (req.body['decl']) user.decl = req.body['decl'];
		user.save(function(err) {
			if (err) {
				console.log("This is error");
				console.log(err);
			}
		});
		proxy.emit('save');
	}));
};

exports.get_rank = function(req, res, next) {
	var _page = req.query.page ? parseInt(req.query.page) : 1;

	var events = ['counts', 'users'];
	var ep = EventProxy.create(events, function(counts, users) {
		return res.render('Ranklist', {
			title: 'Ranklist',
		       	fusers: users,
		       	fpage: _page,
		       	ftotal_page: Math.ceil( counts / config.users_per_page),
		});
	});

	ep.fail(next);

	User.getCount( {}, ep.done('counts'));


	var options = { limit: config.users_per_page, skip: (_page - 1) * config.users_per_page, sort: {total_ac: -1} };

	User.getMulti( {}, {}, options, ep.done('users'));

};

exports.getPunchCard = function(req, res, next) {
	var _username = req.body['username'];
	
	var events = ['stats'];
	var ep = EventProxy.create(events, function(stats) {
		var json = Util.getPunchCard(stats);
		res.send(json);
	});

	ep.fail(next);
	
	var now = new Date();
	now.setDate(now.getDate()-7);
	var query = { username: _username, result: 'Accepted', submit_time: { $gt: now } };
	var fields = { submit_time: 1 };
	var options = { sort: { submit_time : 1 }};
	Status.getMulti(query, fields, options, ep.done('stats'));
};
