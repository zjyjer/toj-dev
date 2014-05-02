/**
 * Recent_Contest modle
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Recent_ContestSchema = new Schema({
	id: { type: Number },
	oj: { type: String},
	link: { type: String },
	name: { type: String },
	start_time: { type: String }, 
	week: { type: String }, 
	access: { type: String } 
}, { collection: 'Recent_Contest' });

Recent_ContestSchema.index({id: 1});

mongoose.model('Recent_Contest', Recent_ContestSchema);
