/**
 * OJ_Status modle
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var OJ_StatusSchema = new Schema({
	oj: { type: String},
    	status: { type: String, default: "All seems OK."},
	check_time: { type: String}
}, { collection: 'OJ_Status' });

OJ_StatusSchema.index({oj: 1});

mongoose.model('OJ_Status', OJ_StatusSchema);
