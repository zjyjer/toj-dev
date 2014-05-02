/**
 * User modle
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var UserSchema = new Schema({
	username: { type: String },
	nickname: { type: String },
    	password: { type: String },
    	school: { type: String },
    	country: { type: String },
    	decl: { type: String },
    	email: { type: String },
    	total_submit: { type: Number, default: 0 },
    	total_ac: { type: Number, default: 0 },
    	solved_contest: { type: Number, default: 0},
	reg_time: { type: Date, default: Date.now },
    	last_login: { type: Date, default: Date.now },
    	access: { type: Number, default: 0}
}, { collection: 'User' });

UserSchema.index({username : 1}, {unique: true});
UserSchema.index({total_ac: 1});

mongoose.model('User', UserSchema);
