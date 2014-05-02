/**
 * Contest modle
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ContestSchema = new Schema({
	cid: { type: Number },
	type: { type: Number },
	title: { type: String },
	desc: { type: String },
	start_time: { type: Date, default: Date.now },
	end_time: { type: Date, default: Date.now },
	author: { type: String },
    	visible: { type: Boolean, default: true},
	passwd: { type: String },
	//problem: { type: Array }
}, { collection: 'Contest' });

ContestSchema.index({cid: 1});
ContestSchema.index({author: 1});

mongoose.model('Contest', ContestSchema);
