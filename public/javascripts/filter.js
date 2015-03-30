'use strict';

app.filter('moment', function () {
  return function (input, momentFn /*, param1, param2, etc... */) {
    var args = Array.prototype.slice.call(arguments, 2),
        momentObj = moment(input);
    return momentObj[momentFn].apply(momentObj, args);
  };
});