module.exports = function(server) {

	var io = require('socket.io')(server);
	var User = require('../models/user');
/*	var User = require('../models/conversation');
*/

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


		socket.on('iamhere', function(data) {
			// This is sent by users when they connect, so we can map them to a user.
			console.log("[DEBUG][io.sockets][iamhere] %s", data);
			User.findById(data, function(err, user) {
				console.log("[DEBUG][iamhere] %s -> {%j, %j}", data, err, user);
				if (exist(user.username) == false) {
					if (user !== null) {
						socket.user = user;
						sockets[socket.user.username] = socket;
						connected_user = user;
						users_onlines.push(connected_user);

					}
				}


			});
		});


		socket.on('send:message', function(data) {
			console.log("from " + socket.user.username + " to " + data.destination);
			sockets[data.destination].emit('send:message', {
				user: socket.user,
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