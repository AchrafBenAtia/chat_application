var mongoose = require('mongoose');
var Group = require('../models/group');


var user = mongoose.Schema({
    username    : String
  , password    : String
  , email     : String
  , firstName: String
  , lastName: String
  , groupes:[{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Group'
	}]
});

module.exports = mongoose.model('User', user);