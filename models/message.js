var mongoose = require('mongoose');
var User = require('../models/user');

 
module.exports = mongoose.model('Message',{
	from: String,
	content: String,
	created: {type: Date, default: Date.now}
});