'use strict';

app.controller('ChatController', function($timeout, $scope, $rootScope, $sce, $q, $compile, socket) {
  var username = document.getElementById('username').value;
  var user_id = document.getElementById('user').value;
  var msgs = [];
  var count = 0;
  $scope.usersOnlines = [];
  $scope.dests = []; //user destinations array
  $scope.messages = [];
  $scope.conversations = []; //user Conversations array 
  $scope.users = [];

  

  socket.on('AllUser', function(data) {
     for (var i = 0; i < data.length; i++) {
       $scope.users.push(data[i]);
     };
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
  $scope.closeChatBox = true;
  //close Chat Box 
  $scope.closeChatPanel = function(dest) {
    console.log($scope.dests.length);
    $scope.dests.splice($scope.dests.indexOf(dest), 1);
    $scope.closeChatBox = false;
  }
    $scope.updateSelectedUser = function(a) {
      $scope.destination = a;
  }


  $scope.getConversationMessages = function(conversation) {
      $scope.intervenant = conversation.intervenant;
      $scope.ConversationMsgs = conversation.msgs;
      var wrapper = document.getElementById('chat-box'),
        scrollRemaining = wrapper.scrollHeight - wrapper.scrollTop;
      $timeout(function() {
        wrapper.scrollTop = wrapper.scrollHeight - scrollRemaining;
      }, 0);

    }
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
        var wrapper = document.getElementsByClassName('direct-chat-messages')[0],
          scrollRemaining = wrapper.scrollHeight - wrapper.scrollTop;
        $timeout(function() {
          wrapper.scrollTop = wrapper.scrollHeight - scrollRemaining;
        }, 0);


      });
      count++;
    }
  }

  $scope.addbox = function(dest) {
    if (dest !== username) {
      if (exist(dest, $scope.dests) == false) {
        $scope.dests.push(dest);
        angular.element(document.getElementById('chat_box_content')).append($compile("<box destination=" + dest + " users="+$scope.users+"></box>")($scope));
        $scope.notif = 0;

      }
    }
  }


  $scope.notification = function() {

    $scope.notif = 0;
  }

  $scope.getchat = function(dest) {
    if (exist(dest, $scope.dests) == false) {
      angular.element(document.getElementById('chat_box_content')).append($compile("<box destination=" + dest + " users="+$scope.users+"></box>")($scope));
      $scope.dests.push(dest);
      $scope.notif = 0;

    }

  }

  $scope.OpenEmptyBox = function() {

    angular.element(document.getElementById('chat_box_content')).append($compile("<box users="+$scope.users+"></box>")($scope));

  }


  //sockets communication

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
    var wrapper = document.getElementsByClassName('direct-chat-messages')[0],
      scrollRemaining = wrapper.scrollHeight - wrapper.scrollTop;
    $timeout(function() {
      wrapper.scrollTop = wrapper.scrollHeight - scrollRemaining;
    }, 0);
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
    var wrapper = document.getElementsByClassName('direct-chat-messages')[0],
      scrollRemaining = wrapper.scrollHeight - wrapper.scrollTop;
    $timeout(function() {
      wrapper.scrollTop = wrapper.scrollHeight - scrollRemaining;
    }, 0);
  }


});