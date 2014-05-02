/**
 * Contest_User modle
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Contest_UserSchema = new Schema({
	cid: { type: Number },
	username: { type: String }
}, { collection: 'Contest_User' });

Contest_UserSchema.index({cid: 1});

mongoose.model('Contest_User', Contest_UserSchema);
