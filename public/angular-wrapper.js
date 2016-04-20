var app = angular.module("myApp", []);

app.controller("myController", function($scope) {
    $scope.date = new Date();
    $scope.options = {
        isMinuteValid: function(date) {
            return date.getMinutes() % 15 === 0;
        }
    }
});

app.directive("datiumPicker", function() {
    return {
        restrict: 'A',
        scope: {
            options: '=datiumOptions',
            ngModel: '='
        },
        require: '?ngModel',
        link: function(scope, element, attrs, ngModel) {
            var options = scope.options === void 0 ? {} : JSON.parse(JSON.stringify(scope.options));
            
            if (options.minDate !== void 0) {
                options.minDate = new Date(options.minDate);
            }
            
            if (options.maxDate !== void 0) {
                options.maxDate = new Date(options.maxDate);
            }
            
            if (options.initialDate !== void 0) {
                options.initialDate = new Date(options.initialDate);
            }
            
            var picker = new Datium(element[0], options);
            
            if (scope.ngModel !== void 0 && new Date(scope.ngModel).toString() !== 'Invalid Date') {
                picker.setDefined();
                picker.setDate(scope.ngModel);
                picker.setDirty(false);
            }
            
            var isInput = element[0].setSelectionRange !== void 0;
            
            scope.$watch('options', function(options) {
                picker.updateOptions(options);
                if (ngModel === null) return;
                ngModel.$setValidity('', picker.isValid());
            }, true);
            
            if (ngModel === null) return;
            
            ngModel.$setViewValue(picker.getDate());
            ngModel.$setPristine();
            
            ngModel.$options = {
                updateOn: 'datium-viewchanged',
                updateOnDefault: false
            };
            
            var invalidKeys = ['datium-before-min', 'datium-after-max','datium-undefined', 'datium-bad-selection'];
            ['year','month','day','hour','minute','second'].forEach(function(level) {
                invalidKeys.push('datium-'+level+'-undefined');
                invalidKeys.push('datium-bad-'+level+'-selection'); 
            });
            
            function setValidity() {
                var reasons = picker.getInvalidReasons();
                ngModel.$setValidity('', picker.isValid());
                invalidKeys.forEach(function (invalidKey) {
                    ngModel.$setValidity(invalidKey, reasons.indexOf(invalidKey) === -1); 
                });
            }
            
            element[0].addEventListener('datium-viewchanged', function(e) {
                if (picker.isDirty()) {
                    ngModel.$setDirty();
                }
                if (!isInput && e.detail.update) {
                    setValidity();
                    scope.ngModel = picker.getDate();
                    if (!picker.isDirty()) {
                        ngModel.$setPristine();
                    }     
                }
            });
            
            if (isInput) {
                ngModel.$formatters.unshift(function(value) {
                    var date = new Date(value);
                    if (date.toString() !== 'Invalid Date') {
                        picker.setDate(date);
                        picker.setDefined();
                    }
                    setValidity();
                    return picker.toString();
                });
                
                ngModel.$parsers.unshift(function(value) {
                    setValidity();
                    if (!picker.isDirty()) {
                        ngModel.$setPristine();
                    }             
                    return picker.getDate();
                });
            } else {
                scope.$watch('ngModel', function(date) {
                    picker.setDate(date);
                    picker.setDefined();
                });
            }
        }
    }
});