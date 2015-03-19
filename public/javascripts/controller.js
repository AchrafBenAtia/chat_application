'use strict';

app.controller('ChatController', function($scope, $rootScope, $compile, socket) {


  $scope.usersOnlines = {};

  var username = document.getElementById('username').value;

  var user_id = document.getElementById('user').value;

  var msgs = [];
  var count = 0;
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
      if (exist(dest, $scope.dests) == false) {
        angular.element(document.getElementById('chat_box_content')).append($compile("<box destination=" + dest + " ></box>")($rootScope));
        $scope.dests.push(dest);
      }
    }
  }



  //Ne pas afficher l'utilisateur connecté dans la liste des utilisateur  

  socket.emit('iamhere', user_id);
  socket.on('whoshere', function(data) {

    $scope.usersOnlines = data.users;
  });
  var exist = function(tagname, tab) {
    var i = null;
    for (i = 0; tab.length > i; i += 1) {
      if (tab[i] == tagname) {
        return true;
      }
    }

    return false;
  };
  $scope.dests = [];
  $scope.messages = [];
  //get messages from other users
  socket.on('send:message', function(message) {
    $scope.messages.push(message);
    console.log($scope.messages);


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