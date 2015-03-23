'use strict';

app.controller('ChatController', function($scope, $rootScope, $compile, socket) {
  var username = document.getElementById('username').value;
  var user_id = document.getElementById('user').value;
  var msgs = [];
  var count = 0;
  $scope.usersOnlines = {};
  var dests = []; //user destinations array
  $scope.messages = [];
  $scope.conversations = []; //user Conversations array 
  var exist = function(tagname, tab) {
    var i = null;
    for (i = 0; tab.length > i; i += 1) {
      if (tab[i] == tagname) {
        return true;
      }
    }

    return false;
  };
  //load old conversation on click !!!
  $scope.load = function(dest) {
    if (count == 0) {
      socket.emit("speek:someone", {
        from: username,
        to: dest
      });

      socket.on("load old message", function(data) {

        for (var i = 0; i <= data.length - 1; i++) {
          var message = {
            user: data[i].from,
            destination: data[i].to,
            date: new Date(data[i].date).toGMTString(),
            text: data[i].messagebody
          }

          msgs.push(message);

        }
        $scope.messages = msgs;

      });
      count++;
    }
  }

  $scope.addbox = function(dest) {
    if (dest !== username) {
      if (exist(dest, dests) == false) {
        angular.element(document.getElementById('chat_box_content')).append($compile("<box destination=" + dest + " ></box>")($rootScope));
        dests.push(dest);
        $scope.notif = 0;

      }
    }
  }
  $scope.notification = function() {

    $scope.notif = 0;
  }

  $scope.getchat = function(dest) {
     if (exist(dest, dests) == false) {
        angular.element(document.getElementById('chat_box_content')).append($compile("<box destination=" + dest + " ></box>")($rootScope));
        dests.push(dest);
        $scope.notif = 0;

      }

  }

  //tell socket.io that y're connected 
  socket.emit('iamhere', user_id);

  //get online users List
  socket.on('whoshere', function(data) {

    $scope.usersOnlines = data.users;
  });

  //get conversations history
  socket.on("load:ConversationHistory", function(data) {

    for (var i = 0; i < data.length; i++) {
      var user;
      if (data[i].username1 == username) {
        user = data[i].username2;
      } else {
        user = data[i].username1;
      }

      var conversation = {
        intervenant: user,
        msgs: data[i].messages
      }
      $scope.conversations.push(conversation);

    }
  });

  //get messages from other users
  socket.on('send:message', function(message) {
    $scope.messages.push(message);
    $scope.notif = $scope.notif + 1;
  });

  //send messages to other users 
  $scope.sendMessage = function() {
    socket.emit('send:message', {
      message: $scope.message,
      destination: $scope.destination

    });

    $scope.messages.push({
      user: username,
      text: $scope.message,
      date: new Date().toGMTString()
    });
    $scope.message = '';
  }


});