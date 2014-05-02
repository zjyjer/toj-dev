var Contest = require('../proxy').Contest;
var Contest_User = require('../proxy').Contest_User;

/**
 * need admin access
 *
 */

exports.adminRequired = function(req, res, next) {
	if (!req.session.user) {
		req.flash('error', 'Please login first!');
		return res.redirect('/login');
	}
	if(req.session.user.access != 99) {
		req.flash('error', 'Need to be admin!');
		return res.redirect('/');
	}
	next();
};

/**
 * need login
 */
exports.loginRequired = function(req, res, next) {
	if (!req.session.user) {
		req.flash('error', 'Please login first!');
		return res.redirect('/login');
	}
	next();
};


/**
 * need not login
 */
exports.logoutRequired = function(req, res, next) {
	if (req.session.user) {
		req.flash('error', 'Please logout first!');
		return res.redirect('/');
	}
	next();
};

/**
 * need to access to enter contest
 */
exports.accessRequired = function(req, res, next) {
	var _cid = req.query.cid ? parseInt(req.query.cid) : 0;
	var _username = req.session.user ? req.session.user.username : '';

	if (!_cid) {
		req.flash('error', 'Contest doesn\'t exists!');
		return res.redirect('/Contest/Contests?type=0');
	}
	Contest.getOne({ cid: _cid }, function(err, cont) {
		if (err) {
			req.flash('error', 'Contest doesn\'t exists!');
			return res.redirect('/Contest/Contests?type=0');
		}
		if (cont.passwd != '') {
			Contest_User.getOne({ cid: _cid, username: _username }, function(err, cu) {
				if (err || !cu) {
					req.flash('error', err);
					//return res.redirect('/Contest/Contests?type=0');
					return res.redirect('/Contest/Enter?cid='  + _cid);
				}
				next();
			});
		} else next();
	});
};

