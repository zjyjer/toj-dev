/**
 * Reply modle
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ReplySchema = new Schema({
	content: { type: String },
	topic_id: { type: ObjectId },
	author: { type: String },
	reply_id : { type: ObjectId },
	create_at: { type: Date, default: Date.now },
	update_at: { type: Date, default: Date.now }
}, { collection: 'Reply' });

ReplySchema.index({ topic_id: 1 });
ReplySchema.index({ username: 1, create_at: -1});

mongoose.model('Reply', ReplySchema);
