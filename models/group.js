var mongoose = require('mongoose');

var message = mongoose.Schema({
    from     : String
  , to       : String
  , type     : String
  , status   : String
  , file     : Object
  , messagebody    : String
  , date     : {type: Date, default: Date.now}
});

var group = mongoose.Schema({
	admin: String,
	member: [String],
	messages:[message]
});

module.exports = mongoose.model('Group', group);
