var mongoose = require('mongoose');
 
module.exports = mongoose.model('Conversation',{
  	id: String,
	user1: String,
	user2: String,
	messages: String
	
});