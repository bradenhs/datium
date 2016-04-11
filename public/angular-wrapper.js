var app = angular.module("myApp", []);

app.controller("myController", function($scope) {
    $scope.date = new Date();
    $scope.options = {
        displayAs: "h:mma MM/DD/YYYY",
        theme: 'dark'
    }
});

app.directive("datiumPicker", function($timeout) {
    return {
        restrict: 'A',
        scope: {
            options: '=datiumOptions',
            ngModel: '='
        },
        require: '?ngModel',
        link: function(scope, element, attrs, ngModel) {
            
            var picker = new Datium(element[0], scope.options);
            
            scope.$watch('options', function(options) {
                picker.updateOptions(options); 
            }, true);
            
            if (ngModel === null) return;
            
            var date = new Date(scope.ngModel);
            $timeout(function() {
                if (date.toString() === 'Invalid Date') {
                    scope.ngModel = void 0;
                } else {
                    picker.setDate(date); 
                    picker.setDefined();
                }   
            });
            
            ngModel.$options = {
                updateOn: 'datium-viewchanged',
                updateOnDefault: false
            };
            
            ngModel.$formatters.unshift(function(value) {
                var date = new Date(value);
                if (date.toString() !== 'Invalid Date') {
                    picker.setDate(date);
                }
                return picker.toString();
            });
            
            ngModel.$parsers.unshift(function(value) {
                return picker.getDate();
            });
        }
    }
});