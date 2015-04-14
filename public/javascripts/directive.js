'use strict';

app.directive("box", function($compile) {    
    return{
    restrict :'AE', 
    scope : {destination:'@destination',
			 users:'@users',
             group:'@group'},

    templateUrl : 'box.html'
    
};
})

app.directive('autoComplete', function($timeout) {
    return function(scope, iElement, iAttrs) {
            iElement.autocomplete({
                source: scope[iAttrs.uiItems],
                select: function() {
                    $timeout(function() {
                      iElement.trigger('input');
                    }, 0);
                }
            });
    };
});





