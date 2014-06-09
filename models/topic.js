/**
 * Topic modle
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TopicSchema = new Schema({
	cid: { type: Number, default: -1 },
	pid: { type: Number },
	title: { type: String },
	content: { type: String },
	author: { type: String },
	top: { type: Boolean, default: false },
	reply_count: { type: Number, default: 0 },
	visit_count: { type: Number, default: 0 },
	create_at: { type: Date, default: Date.now },
	update_at: { type: Date, default: Date.now },
	last_reply: { type: ObjectId },
	last_reply_at: { type: Date, default: Date.now }
}, { collection: 'Topic' });

TopicSchema.index({create_at: -1});
TopicSchema.index({top: -1, last_reply_at: -1});
TopicSchema.index({last_reply_at: -1});
TopicSchema.index({username: 1, create_at: -1});

mongoose.model('Topic', TopicSchema);
