'use strict';

app.controller('ChatController', function($timeout, $interval, $q, $scope, $upload, $compile, socket) {
  var username = document.getElementById('username').value;
  var user_id = document.getElementById('user').value;
  var msgs = [];
  var count = 0;

  $scope.usersOnlines = [];
  $scope.dests = []; //user destinations array
  $scope.messages = [];
  $scope.conversations = []; //user Conversations array
  $scope.group_conversations = []; 
  $scope.usernames_online = [];
  $scope.users = [];
  $scope.tags = [];

 

$scope.loadTags = function(query) {
  var deferred = $q.defer();
  var autoCompleteTags =  $scope.users;
  deferred.resolve(autoCompleteTags);
  return deferred.promise;
};
   
  $scope.cancelSendFile = function() {
    
    $scope.percent = 0;
  }

  $scope.onFileSelect = function($files) {
    //$files: an array of files selected, each file has name, size, and type. 
    for (var i = 0; i < $files.length; i++) {
      var file = $files[i];
      $scope.upload = $upload.upload({
        url: '/file-upload',
        data: $scope.destination,
        method: 'POST',
        file: file,
      }).progress(function(evt) {
        $scope.percent = parseInt(100.0 * evt.loaded / evt.total);
      }).success(function(data, status, headers, config) {
        $scope.sendFile = function(file) {

          $scope.percent = 0;
          socket.emit("send:file", {
            file: data,
            destination: $scope.destination
          });
          $scope.messages.push({
            user: username,
            type: "file",
            file: data,
            date: new Date().toGMTString()
          });
          var wrapper = document.getElementsByClassName('direct-chat-messages')[0],
            scrollRemaining = wrapper.scrollHeight - wrapper.scrollTop;
          $timeout(function() {
            wrapper.scrollTop = wrapper.scrollHeight - scrollRemaining;
          }, 0);


        }
      });

    }
  };

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
    $scope.$parent.$parent.dests.splice($scope.$parent.$parent.dests.indexOf(dest), 1);
    $scope.closeChatBox = false;
  }

  $scope.updateSelectedUser = function(user_s) {
    
    if(user_s != null){ 
      $scope.destination = user_s; 
      $scope.groupe = true;  
  }}


  $scope.getConversationMessages = function(conversation) {
      $scope.intervenant = conversation.intervenant;
      $scope.ConversationMsgs = conversation.msgs;
      var wrapper = document.getElementById('chat-box'),
        scrollRemaining = wrapper.scrollHeight - wrapper.scrollTop;
      $timeout(function() {
        wrapper.scrollTop = wrapper.scrollHeight - scrollRemaining;
      }, 0);

    }
    //load old conversation on mouse_enter !!!
  $scope.load = function() {
    if($scope.destination != null){
    if (count == 0) {
    if($scope.group != "undefined"){
      console.log("group");
    socket.emit("speek:group", {
      from:username,
      group:$scope.group
    });     
  }else{
    console.log("private");
      socket.emit("speek:someone", {
        from: username,
        to: $scope.destination
      });   
        }

      socket.on("load old message", function(data) {

        for (var i = 0; i <= data.length - 1; i++) {
          var message = {
            user: data[i].from,
            type: data[i].type,
            status:data[i].status,
            destination: data[i].to,
            date: new Date(data[i].date).toGMTString(),
            text: data[i].messagebody,
            file: data[i].file
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
  }

  $scope.addbox = function(dest) {  
    if (dest !== username) {
      if (exist(dest, $scope.dests) == false) {
        $scope.dests.push(dest);
        angular.element(document.getElementById('chat_box_content')).append($compile("<box destination=" + dest + " users=" + $scope.users + " ></box>")($scope));
        $scope.notif = 0;

      }
    }
  
}


  $scope.getchat = function(dest, goup_id) {
    if (exist(dest, $scope.dests) == false) {       
      angular.element(document.getElementById('chat_box_content')).append($compile("<box destination=" + dest + " users=" + $scope.users + " group="+goup_id+"></box>")($scope));
      $scope.dests.push(dest);
      $scope.notif = 0;

    }

  }
  //open empty box and select user "hors ligne message"
  $scope.OpenEmptyBox = function() {

    angular.element(document.getElementById('chat_box_content')).append($compile("<box users=" + $scope.users + " ></box>")($scope));

  }
    //send messages to other users 
  $scope.sendMessage = function() {

    socket.emit('send:message', {
      message: $scope.message,
      destination: $scope.destination
    });

    $scope.messages.push({
      user: username,
      type: "text",
      status:"distributed",
      text: $scope.message,
      date: new Date().toGMTString()
    });

    $scope.message = '';
    $scope.show_statut = true;
    setTimeout(function () {
        $scope.show_statut = false;
    }, 1000);
    var wrapper = document.getElementsByClassName('direct-chat-messages')[0],
      scrollRemaining = wrapper.scrollHeight - wrapper.scrollTop;
    $timeout(function() {
      wrapper.scrollTop = wrapper.scrollHeight - scrollRemaining;
    }, 0);
  }

  $scope.notification_update = function(destination){
    socket.emit('update:notif',{
        destination:destination
    });


  }

  $scope.get_history = function(){
       socket.emit('get:history');
  }




  /*--------------------------------------------------------------------------------------------*/


  //sockets reception communication

  //tell socket.io that y're connected 
  socket.emit('iamhere', user_id);

  //get online users List
  socket.on('whoshere', function(data) {
    $scope.usersOnlines = data.users;
  

  });

  //get conversations history
var unread_message = 0;
var status_conv = null;
var convs = [];
$scope.total_unread_conv = 0;


  socket.on("load:ConversationHistory", function(data) {
    $scope.total_unread_conv = 0;
    for (var i = 0; i < data.length; i++) {

        data[i].messages.forEach(function(message) {
          if(message.to == username){
            if(message.status == "Not-Seen"){
              unread_message++;
            }
          }

          })

          if(unread_message > 0){
            $scope.total_unread_conv ++;
          }
            
          
      var user;
      if (data[i].username1 == username) {
        user = data[i].username2;
      } else {
        user = data[i].username1;
      }

      var conversation = {
        intervenant: user,
        msgs: data[i].messages,
        status: "Unread",
        unread_message:unread_message

      }
      convs.push(conversation);
      unread_message = 0;
      status_conv = null;

    }
      $scope.conversations = convs;
      convs = [];
  });

  socket.on("load:UserGroups",function(data){
    data.forEach(function(group){
    var conversation = {
        intervenant: group.member.join(),
        msgs: group.messages,
        group_id: group._id
      }
      $scope.group_conversations.push(conversation);
      })
  });
  //get messages from other users
  socket.on('send:message', function(message) {
    $scope.messages.push(message);
    var wrapper = document.getElementsByClassName('direct-chat-messages')[0],
      scrollRemaining = wrapper.scrollHeight - wrapper.scrollTop;
    $timeout(function() {
      wrapper.scrollTop = wrapper.scrollHeight - scrollRemaining;
    }, 0);
  });
  
  socket.on("message:seen",function(){

     $scope.messages[$scope.messages.length - 1].status = "seen"; 
  });

  socket.on('send:file', function(message) {
    $scope.messages.push(message);
    var wrapper = document.getElementsByClassName('direct-chat-messages')[0],
      scrollRemaining = wrapper.scrollHeight - wrapper.scrollTop;
    $timeout(function() {
      wrapper.scrollTop = wrapper.scrollHeight - scrollRemaining;
    }, 0);
  });
});