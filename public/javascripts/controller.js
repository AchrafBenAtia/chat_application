'use strict';

app.controller('ChatController', function($scope, $compile, socket) {


  $scope.usersOnlines = {};

  var username = document.getElementById('username').value;

  var user_id = document.getElementById('user').value;

 $scope.msgs = [];
  $scope.addbox = function(dest) {
    if (dest !== username) {
      if (exist(dest, $scope.dests) == false) {
        socket.emit("speek:someone", {
          from: username,
          to: dest
        });

        socket.on("load old message", function(data) {
         
          for (var i = data.length - 1; i >= 0; i--) {
            var message = {
            user : data[i].from,
            destination : data[i].to,
            date : data[i].date,
            text : data.messagebody 
          }
             $scope.msgs.push(message);

          }

          
        });
         console.log($scope.msgs);

        angular.element(document.getElementById('chat_box_content')).append($compile("<box destination=" + dest + " ></box>")($scope));
        $scope.dests.push(dest);

      }
    }
  }
   $scope.messages =  $scope.msgs;
   console.log($scope.msgs);




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
      user: {
        username: username
      },
      text: $scope.message,
      date: new Date().toGMTString()
    });
    $scope.message = '';

  }


});