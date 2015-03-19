'use strict';

app.directive("box", function($compile) {    
    var directive = {};
    directive.restrict = 'AE'; 
    directive.scope = {
         destination:'@destination'
     };
    directive.templateUrl = 'box.html';
    return directive;
});


