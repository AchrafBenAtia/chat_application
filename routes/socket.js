module.exports = function(server) {

	var io = require('socket.io')(server),
		fs = require('fs');

	var User = require('../models/user');
	var Conversation = require('../models/conversation');
	var Group = require('../models/group');

	//socket.io events 
	var users_onlines = [];
	var sockets = {};
	var exist = function(tagname) {
		var i = null;
		for (i = 0; users_onlines.length > i; i += 1) {
			if (users_onlines[i] == tagname) {
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

		socket.on("speek:group", function(data) {
			Group
			.findById(data.group)
			.exec(function (err, group){
				if(group){
					sockets[data.from].emit("load old message", group.messages);
				}

			})
		});

		socket.on('iamhere', function(data) {
			// This is sent by users when they connect, so we can map them to a user.
			User
			.findById(data) 
			.populate('groupes')
			.exec(function (err, user) {
				if (exist(user.username) == false) {
					if (user !== null) {
						socket.user = user;
						sockets[socket.user.username] = socket;
						connected_user = user;
						users_onlines.push(connected_user.username);

					}
					var query = Conversation.find({
						$or: [{
							'username1': socket.user.username
						}, {
							'username2': socket.user.username
						}]
					});
					query.exec(function(err, convs) {
						if (err) console.log("error");
						if (convs) {
							sockets[socket.user.username].emit("load:ConversationHistory", convs);
						}

					});	
				    sockets[socket.user.username].emit("load:UserGroups", user.groupes);
				}
			})
			User.find(function(err, users) {
				var alluser = []
				for (var i = 0; i < users.length; i++) {
					alluser.push(users[i].username)
				};

				socket.emit("AllUser", alluser);
			});
		});

		//send all user conversation to user 
		socket.on('get:history', function(data) {
			var query = Conversation.find({
				$or: [{
					'username1': socket.user.username
				}, {
					'username2': socket.user.username
				}]
			});
			query.exec(function(err, convs) {
				if (err) console.log("error");
				if (convs) {
					sockets[socket.user.username].emit("load:ConversationHistory", convs);
				}

			});
		});


		socket.on('send:message', function(data) {

			if (typeof(data.destination) == "string") {
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
							'status': "Not-Seen",
							'type': "text",
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
							'status': "Not-Seen",
							'type': "text",
							'messagebody': data.message,
							'created': new Date()
						});
						conv.save(function(err) {
							if (err) console.log('failed send message !');
						});
					}
				});

				if (exist(data.destination)) {
					sockets[data.destination].emit('send:message', {
						type: "text",
						status: "Not-Seen",
						user: socket.user.username,
						destination: data.destination,
						date: new Date().toGMTString(),
						text: data.message
					});
				} else {
					console.log("hors-ligne message");
				}
				/*	var query = Conversation.find({
							$or: [{
								'username1': data.destination
							}, {
								'username2': data.destination
							}]
						});
						query.exec(function(err, convs) {
							if (err) console.log("error");
							if (convs) {
								console.log(convs);
								sockets[data.destination].emit("load:ConversationHistory", convs);
							}

						});*/
			}else{
				data.destination.push(socket.user.username);
				Group.findOne({'member' : { $all : data.destination }}, function(err, group) {
					if (err) console.log("error");
					if (group == null) {
						console.log("here");
						var group_add = new Group();
						group_add.admin = socket.user.username;
						group_add.member = data.destination;
						group_add.messages.push({
							'from': socket.user.username,
							'status': "Not-Seen",
							'type': "text",
							'messagebody': data.message,
							'created': new Date().toGMTString()

						});
						group_add.save(function(err) {
							if (!err) console.log('success!');
						});
						data.destination.forEach(function(dest) {
							
							User.findOne({'username':dest},function(err,user){
								if (err) console.log("error");
								user.groupes.push(group_add._id);
								user.save(function (err) {
    							if (err) return handleError(err);
 							 });
							});
						});
					

					} else {	
						group.messages.push({
							'from': socket.user.username,
							'status': "Not-Seen",
							'type': "text",
							'messagebody': data.message,
							'created': new Date().toGMTString()

						});
						group.save(function(err) {
							if (!err) console.log('success!');
						});

						
						
					}
			
			

		});
			}
				});

		socket.on("send:file", function(data) {
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
						'status': "Not-Seen",
						'type': "file",
						'file': data.file,
						'created': new Date().toGMTString()
					});
					newConversation.save(function(err) {
						if (!err) console.log('success!');
					});

				} else {
					conv.messages.push({
						'from': socket.user.username,
						'to': data.destination,
						'status': "Not-Seen",
						'type': "file",
						'file': data.file,
						'created': new Date().toGMTString()
					});
					conv.save(function(err) {
						if (!err) console.log('successAddFile!');
					});
				}


			});
			if (exist(data.destination)) {
				sockets[data.destination].emit('send:file', {
					type: "file",
					status: "Not-Seen",
					user: socket.user.username,
					destination: data.destination,
					date: new Date().toGMTString(),
					file: data.file
				});
			} else {
				console.log("hors-ligne-file")
			}
		});


		socket.on("update:notif", function(data) {
			var query = Conversation.findOne({
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
			});
			query.exec(function(err, conv) {
				if (err) console.log("error");
				if (conv) {

					conv.messages.forEach(function(message) {
						if (message.to == socket.user.username) {
							message.status = "Seen";
						}
					});
					conv.markModified('messages');
					conv.save();
					if (exist(data.destination)) {
						sockets[data.destination].emit("message:seen");
					}

				}
			});
		});
		socket.on('disconnect', function(data) {
			if (!socket.user) return;
			while (users_onlines.indexOf(socket.user.username) !== -1) {
				users_onlines.splice(users_onlines.indexOf(socket.user.username), 1);
			}
			console.log('user disconnected ' + socket.user.username);
		});


	});



	return io;
}