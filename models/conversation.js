var mongoose = require('mongoose');
 
var message = mongoose.Schema({
    from     : String
  , to       : String
  , type     : String
  , file     : Object
  , messagebody     : String
  , date     : {type: Date, default: Date.now}
});

var conversation = mongoose.Schema({
    username1    : String
  , username2    : String
  , messages     : [message]
  
});

module.exports = mongoose.model('Conversation', conversation);