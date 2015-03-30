module.exports = function(server) {

	var io = require('socket.io')(server);
	var User = require('../models/user');
	var Conversation = require('../models/conversation');


	//socket.io events 
	var users_onlines = [];
	var sockets = {};
	var exist = function(tagname) {
		var i = null;
		for (i = 0; users_onlines.length > i; i += 1) {
			if (users_onlines[i].username == tagname) {
				return true;
			}
		}

		return false;
	};

	io.sockets.on('connection', function(socket) {
		var connected_user = {};

		// send updates with online users
		var i = setInterval(function() {

			socket.emit('whoshere', { 
				'users': users_onlines,
			});
		}, 3000);

		console.info("[DEBUG][io.sockets][connection]");

		
				

		

		socket.on("speek:someone", function(data) {
			var query = Conversation.findOne({
				$and: [{
					$or: [{
						'username1': data.from
					}, {
						'username1': data.to
					}]
				}, {
					$or: [{
						'username2': data.from
					}, {
						'username2': data.to
					}]
				}]
			}, {
				messages: {
					$slice: -10
				}
			});
			query.sort("-messages.date").exec(function(err, conv) {
				if (err) console.log("error");
				if (conv) {
					sockets[data.from].emit("load old message", conv.messages);

				}

			});
		});
		socket.on('iamhere', function(data) {
			// This is sent by users when they connect, so we can map them to a user.
			User.findById(data, function(err, user) {
				/*				console.log("[DEBUG][iamhere] %s -> {%j, %j}", data, err, user);
				 */
				if (exist(user.username) == false) {
					if (user !== null) {
						socket.user = user;
						sockets[socket.user.username] = socket;
						connected_user = user;
						users_onlines.push(connected_user);

					}

					//send conversation history to user
					var query = Conversation.find({
						$or: [{
							'username1': user.username
						}, {
							'username2': user.username
						}]
					});
					query.exec(function(err, convs) {
						if (err) console.log("error");
						if (convs) {
							sockets[user.username].emit("load:ConversationHistory", convs);
						}

					});

				}

			});
			User.find(function(err, users) {
			var alluser = []
			for (var i = 0; i < users.length; i++) {
				alluser.push(users[i].username)
			};
			
			socket.emit("AllUser", alluser);
	     });


		});


		socket.on('send:message', function(data) {
			console.log("[Debug][send:message] from " + socket.user.username + " to " + data.destination);
			//try to find if a coversation between the two users exist to add the message, other case we try to create a new conversation and put the message inside 
			Conversation.findOne({
				$and: [{
					$or: [{
						'username1': socket.user.username
					}, {
						'username1': data.destination
					}]
				}, {
					$or: [{
						'username2': socket.user.username
					}, {
						'username2': data.destination
					}]
				}]
			}, function(err, conv) {
				if (err) console.log("error");
				if (conv == null) {
					var newConversation = new Conversation();
					newConversation.username1 = socket.user.username;
					newConversation.username2 = data.destination;
					newConversation.messages.push({
						'from': socket.user.username,
						'to': data.destination,
						'messagebody': data.message,
						'created': new Date().toGMTString()
					});
					newConversation.save(function(err) {
						if (!err) console.log('success!');
					});

				} else {
					conv.messages.push({
						'from': socket.user.username,
						'to': data.destination,
						'messagebody': data.message,
						'created': new Date()
					});
					conv.save(function(err) {
						if (!err) console.log('successAddMessage!');
					});
				}


			});
			sockets[data.destination].emit('send:message', {
				user: socket.user.username,
				destination: data.destination,
				date: new Date().toGMTString(),
				text: data.message
			});

		});

		socket.on('disconnect', function(data) {
			if (!socket.user) return;
			while (users_onlines.indexOf(socket.user) !== -1) {
				users_onlines.splice(users_onlines.indexOf(socket.user), 1);
			}
			console.log('user disconnected ' + socket.user.username);
		});


	});



	return io;
}