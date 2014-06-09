var EventProxy = require('eventproxy');

var config = require('../config').config;
var Util = require('../libs/util');

var Problem = require('../proxy').Problem;
var Topic = require('../proxy').Topic;
var Reply = require('../proxy').Reply;

exports.index = function(req, res, next) {
	var _page = req.query.page ? parseInt(req.query.page) : 1;

	var events = ['topics'];
	var ep = EventProxy.create(events, function(topics) {
		res.render('Discuss/index', {
			title: 'Discuss',
			ftopics: topics,
		});
	});

	ep.fail(next);

	var options = { skip: (_page - 1) * config.topics_per_page, limit: config.topics_per_page, sort: { top: -1, last_reply_at: -1} };

	Topic.getTopicsByQuery({}, options, ep.done('topics'));
};

exports.get_topic = function(req, res, next) {
	var topic_id = req.params.tid;
	if (topic_id.length !== 24) {
		req.flash('error', 'The topic does not exists.');
		return res.redirect('/Discuss');
	}
	var events = ['topic'];
	var ep = EventProxy.create(events, function (topic) {
		res.render('Discuss/topic', {
			title: topic.title,
			ftopic: topic,
		});
	});

	ep.fail(next);

	Topic.getFullTopic(topic_id, ep.done(function (message, topic, author, replies) {
		if (message) {
			ep.unbind();
			req.flash('error', message);
			return res.redirect('/Discuss');
		}

		//console.log(topic);
		topic.visit_count += 1;
		topic.save();

		// format date
		topic.friendly_create_at = Util.format_date2(topic.create_at, true);
		topic.friendly_update_at = Util.format_date2(topic.update_at, true);

		topic.user = author;

		topic.replies = replies;

		ep.emit('topic', topic);
	}));
};

exports.get_create = function(req, res, next) {
	return res.render('Discuss/create', {
		title: 'Create',
	});
};

exports.post_create = function(req, res, next) {
	var _cid = -1;
	var _pid = req.body['pid'] ? parseInt(req.body['pid']) : -1;
	var _title = req.body['title'];
	var _content = req.body['content'];
	var _username = req.session.user.username;

	var doc = {
		cid: _cid,
		pid: _pid,
		title: _title,
		content: _content,
		username: _username
	};

	Topic.newAndSave(doc, function(err, tp, na) {
		if (err) {
			req.flash('error', err);
			return res.redirect('/Discuss');
		} else {
			return res.redirect('/Discuss/topic/' + tp._id);
		}
	});
};

exports.top = function (req, res, next) {
	if (!req.session.user || req.session.user.access !== 99) {
		console.log(req.session.user.access);
		res.redirect('/Discuss');
		return;
	}
	var topic_id = req.params.tid;
	var is_top = req.params.is_top;
	if (topic_id.length !== 24) {
		req.flash('error', 'Invalid Topid.');
		return res.redirect('/Discuss');;
	}
	Topic.getTopic(topic_id, function (err, topic) {
		if (err) {
			return next(err);
		}
		if (!topic) {
			req.flash('error', 'Invalid Topid.');
			return res.redirect('/Discuss');;
		}
		topic.top = is_top;
		topic.save(function (err) {
			if (err) {
				return next(err);
			}
			var msg = topic.top ? 'This topic is on top.' : 'This topic is untop.';
			req.flash('success', msg);
			return res.redirect('/Discuss');;
		});
	});
};


