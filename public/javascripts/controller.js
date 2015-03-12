'use strict';



app.controller('ChatController', function($scope, socket) {
  $scope.count = 0;
  $scope.usersOnlines = {};
  var user_id = document.getElementById('user').value;
  var username = document.getElementById('username').value;
   $scope.showbox= function(){
   
    document.getElementById('chat_box_content').append("<input ng-model='text'>{{text}}");

   }


  //Ne pas afficher l'utilisateur connecté dans la liste des utilisateur  

  socket.emit('iamhere', user_id);
  socket.on('whoshere', function(data) {
    $scope.usersOnlines = data.users;
  });

  //get messages from other users
  socket.on('send:message', function(message) {
    $scope.messages.push(message);
  });

  //send messages to other users 
  $scope.messages = [];
  $scope.sendMessage = function() {
    socket.emit('send:message', {

      message: $scope.message
    });
    $scope.messages.push({
      user: {
        username: username
      },
      text: $scope.message
    });
    $scope.message = '';

  }

});

app.directive("box", function($compile) {
/*  return function(scope, element, attrs) {
    element.bind("click", function() {*/
/*      angular.element(document.getElementById('chat_box_content')).append($compile("<div class='col-md-4' ><div class='box box-warning direct-chat direct-chat-warning'><div class='box-header with-border'><h3 class='box-title'>Chat with "+attrs.addbox+" </h3><div class='box-tools pull-right'><span data-toggle='tooltip' title='3 New Messages' class='badge bg-yellow'>3</span><button class='btn btn-box-tool' data-widget='collapse'><i class='fa fa-minus'></i></button><button class='btn btn-box-tool' data-toggle='tooltip' title='Contacts' data-widget='chat-pane-toggle'><i class='fa fa-comments'></i></button><button class='btn btn-box-tool' data-widget='remove'><i class='fa fa-times'></i></button></div></div><div class='box-body' ><div class='direct-chat-messages'  ><div ng-repeat='message in messages' ng-switch on='message.user.username' ><div class='direct-chat-msg' ng-switch-when= <%=user.username%>><div class='direct-chat-info clearfix'><span class='direct-chat-name pull-left'>{{message.user.username}}</span><span class='direct-chat-timestamp pull-right'>23 Jan 2:00 pm</span></div><img class='direct-chat-img' src='dist/img/user1-128x128.jpg' alt='message user image' /><div class='direct-chat-text'><p ng-bind-html='message.text | unsafe'>{{message.text}}</p></div></div><div class='direct-chat-msg right' ng-switch-default><div class='direct-chat-info clearfix'><span class='direct-chat-name pull-right'>{{message.user.username}}</span><span class='direct-chat-timestamp pull-left'>23 Jan 2:05 pm</span></div><img class='direct-chat-img' src='dist/img/user3-128x128.jpg' alt='message user image' /><div class='direct-chat-text'><p ng-bind-html='message.text | unsafe'>{{message.text}}</p></div></div></div></div></div><div class='box-footer'><form ng-submit='sendMessage()' method='post' ><div class='input-group'><input type='text' name='message' placeholder='Type Message ...' class='form-control' ng-model='message'/><span class='input-group-btn'><button type='button' class='btn btn-warning btn-flat'>Send</button></span></div></form></div></div></div>")(scope));
*/    
    var directive = {};
    directive.restrict = 'E'; 
    directive.templateUrl = 'box.html';
    return directive;



});

app.directive("addbox", function($compile) {
     
    var template = '<box><box>';
     
    return function(scope, element, attrs) {
       element.bind("click", function() {
                scope.$apply(function() {
                    var content = $compile(template)(scope);
                    element.append(content);
               })
            });
        }
    
});
  
