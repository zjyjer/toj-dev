/**
 * Problem modle
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ProbSchema = new Schema({
	pid: { type: Number },
	vid: { type: String },
	oj: { type: String },
	title: {type: String },
	desc: { type: String },
	input: { type: String },
	output: { type: String },
	sample_in: { type: String },
	sample_out: { type: String },
	num_of_testcases: { type: Number, default: 1 },
	total_submit: { type: Number, default: 0 },
	total_ac: { type: Number, default: 0 },
	total_wa: { type: Number, default: 0 },
	total_re: { type: Number, default: 0 },
	total_ce: { type: Number, default: 0 },
	total_tle: { type: Number, default: 0 },
	total_mle: { type: Number, default: 0 },
	total_ole: { type: Number, default: 0 },
	total_pe: { type: Number, default: 0 },
	total_rf: { type: Number, default: 0 },
	total_other: { type: Number, default: 0 },
	vtotal_ac: { type: Number, default: 0 },
	vtotal_submit: { type: Number, default: 0 },
	special_status: { type: Number, default: 0 },
	time_limit: { type: Number, default: 1000 },
	mem_limit: { type: Number, default: 65536 },
	hint: { type: String },
	source: { type: String },
	author: { type: String },
	tag: { type: Array, default: [] }
}, { collection: 'Problem' });

ProbSchema.index({pid: 1}, {unique: true});
ProbSchema.index({oj: 1, pid: 1});

mongoose.model('Problem', ProbSchema);
