/**
 * Status modle
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var StatusSchema = new Schema({
	run_ID: { type: Number },
	oj: { type: String },
	submit_time : { type: Date, default: Date.now },
	result : { type: String },
	pid : { type: Number },
	username : { type: String },
	lang : { type: Number },
	time_used : { type: Number },
	mem_used : { type: Number },
	code_len: { type: Number },
	ce_info : { type: String },
    	contest_belong: { type: Number, default: -1},
	//speed=51 is the most fastest one with accpeted result
	speed : { type: Number, default: 50 }
}, { collection: 'Status' });

StatusSchema.index({contest_belong: -1, run_ID: -1});
StatusSchema.index({result: 1});

mongoose.model('Status', StatusSchema);
