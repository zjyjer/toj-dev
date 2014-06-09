var EventProxy = require('eventproxy');

var config = require('../config').config;
var Util = require('../libs/util');

var Problem = require('../proxy').Problem;
var Topic = require('../proxy').Topic;
var Reply = require('../proxy').Reply;


/**
 * 添加一级回复
 */
exports.add = function (req, res, next) {
	var content = req.body.r_content;
	var topic_id = req.params.tid;
	//console.log(content + " " + topic_id);


	if (topic_id.length !== 24) {
		req.flash('error', 'The topic does not exists.');
		return res.redirect('/Discuss');
	}

	if (content === '') {
		req.flash('Reply content can not empty!');
		return res.redirect('/Discuss/topic/' + tid);;
	}

	var ep = EventProxy.create();
	ep.fail(next);

	Topic.getTopic(topic_id, ep.doneLater(function (topic) {
		if (!topic) {
			ep.unbind();
			// just 404 page
			return next();
		}
		ep.emit('topic', topic);
	}));

	ep.on('topic', function (topic) {
		Reply.newAndSave(content, topic_id, req.session.user.username, ep.done(function (reply) {
			Topic.updateLastReply(topic_id, reply._id, ep.done(function () {
				ep.emit('reply_saved', reply);
			}));
		}));

	});

	ep.all('reply_saved', function (reply) {
		//console.log('ok');
		res.redirect('/Discuss/topic/' + topic_id + '#' + reply._id);
	});
};


/**
 * 添加二级回复
 */
exports.add2 = function (req, res, next) {
	var reply_id = req.params.rid;
	var topic_id = req.body['topic_id'];
	var content = req.body['r2_content'];

	if (content === '') {
		res.send('');
		return;
	}

	var proxy = new EventProxy();
	proxy.assign('reply_saved', function (reply) {
		Reply.getReplyById(reply._id, function (err, reply) {
			res.redirect('/Discuss/topic/' + topic_id + '#' + reply._id);
			// res.partial('reply/reply2', {object: reply, as: 'reply'});
		});
	});

	// 创建一条回复，并保存
	Reply.newAndSave(content, topic_id, req.session.user.username, reply_id, function (err, reply) {
		if (err) {
			return next(err);
		}
		// 更新主题的最后回复信息
		Topic.updateLastReply(topic_id, reply._id, function (err) {
			if (err) {
				return next(err);
			}
			proxy.emit('reply_saved', reply);
		});
	});

};


