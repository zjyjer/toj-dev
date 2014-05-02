/**
 * Code modle
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var CodeSchema = new Schema({
	contest_belong: { type: Number },
	run_ID: { type: Number },
    	code: { type: String }
}, { collection: 'Code' });

CodeSchema.index({run_ID: 1});
CodeSchema.index({contest_belong: 1});

mongoose.model('Code', CodeSchema);
