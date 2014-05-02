/**
 * Contest_Prob modle
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Contest_ProbSchema = new Schema({
	cid: { type: Number },
	nid: { type: Number },
	pid: { type: Number },
    	title: { type: String },
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
}, { collection: 'Contest_Problem' });

Contest_ProbSchema.index({cid: 1});

mongoose.model('Contest_Problem', Contest_ProbSchema);
