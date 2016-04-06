var app = angular.module("myApp", []);

app.controller("myController", function($scope) {
    $scope.options = {
        displayAs: "MM/DD/YY"
    }
});

app.directive("datiumPicker", function($timeout) {
    return {
        restrict: 'A',
        scope: {
            options: '=datiumOptions'
        },
        require: '?ngModel',
        link: function(scope, element, attrs, ngModel) {
            
            var picker = new Datium(element[0], scope.options);
            
            scope.$watch('options', function(options) {
                picker.updateOptions(options); 
            }, true);
            
            if (ngModel === null) return;
            
            ngModel.$setViewValue(picker.getDate());
            
            ngModel.$formatters.unshift(function(value) { // To view
                var d = new Date(value);
                if (d.toString() !== 'Invalid Date') {
                    picker.goto(d);
                }
                return picker.toString();
            });
            
            ngModel.$parsers.unshift(function(value) { // To model
                return picker.getDate();
            });
            
            element.on('datium-viewchanged', function() {
                element[0].dispatchEvent(new Event('input'));
            });
        }
    }
});