(function(){
var OptionSanitizer = (function () {
    var sanitizeElement = function (element) {
        if (element === void 0)
            throw 'DATIUM: "element" option is required';
        console.log('oh yeah aha');
        return element;
    };
    return (function () {
        function class_1() {
        }
        class_1.sanitize = function (opts) {
            return {
                element: sanitizeElement(opts.element)
            };
        };
        return class_1;
    })();
})();
/// <reference path="OptionSanitizer.ts" />
window['Datium'] = (function () {
    var options;
    return (function () {
        function class_2(opts) {
            this.updateOptions(opts);
        }
        class_2.prototype.updateOptions = function (opts) {
            options = OptionSanitizer.sanitize(opts);
        };
        return class_2;
    })();
})();
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk9wdGlvblNhbml0aXplci50cyIsIkRhdGl1bS50cyJdLCJuYW1lcyI6WyJjb25zdHJ1Y3RvciIsInNhbml0aXplIiwidXBkYXRlT3B0aW9ucyJdLCJtYXBwaW5ncyI6IkFBQUEsSUFBSSxlQUFlLEdBQUcsQ0FBQztJQUNuQixJQUFJLGVBQWUsR0FBRyxVQUFDLE9BQXdCO1FBQzNDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sS0FBSyxLQUFLLENBQUMsQ0FBQztZQUFDLE1BQU0sc0NBQXNDLENBQUM7UUFDckUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUMzQixNQUFNLENBQUMsT0FBTyxDQUFDO0lBQ25CLENBQUMsQ0FBQTtJQUVELE1BQU0sQ0FBQztRQUFBO1FBTVBBLENBQUNBO1FBTFUsZ0JBQVEsR0FBZixVQUFnQixJQUFhO1lBQ3pCQyxNQUFNQSxDQUFDQTtnQkFDSEEsT0FBT0EsRUFBRUEsZUFBZUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0E7YUFDekNBLENBQUNBO1FBQ05BLENBQUNBO1FBQ0wsY0FBQztJQUFELENBTk8sQUFNTixHQUFBLENBQUE7QUFDTCxDQUFDLENBQUMsRUFBRSxDQUFDO0FDZEwsMkNBQTJDO0FBRXJDLE1BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDO0lBQ3ZCLElBQUksT0FBZ0IsQ0FBQztJQUVyQixNQUFNLENBQUM7UUFDSCxpQkFBWSxJQUFhO1lBQ3JCRCxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUM3QkEsQ0FBQ0E7UUFFRCwrQkFBYSxHQUFiLFVBQWMsSUFBYTtZQUN2QkUsT0FBT0EsR0FBR0EsZUFBZUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDN0NBLENBQUNBO1FBQ0wsY0FBQztJQUFELENBUk8sQUFRTixHQUFBLENBQUE7QUFDTCxDQUFDLENBQUMsRUFBRSxDQUFDIiwiZmlsZSI6ImRhdGl1bS5qcyIsInNvdXJjZXNDb250ZW50IjpbImxldCBPcHRpb25TYW5pdGl6ZXIgPSAoKCkgPT4ge1xyXG4gICAgbGV0IHNhbml0aXplRWxlbWVudCA9IChlbGVtZW50OkhUTUxJbnB1dEVsZW1lbnQpOkhUTUxJbnB1dEVsZW1lbnQgPT4ge1xyXG4gICAgICAgIGlmIChlbGVtZW50ID09PSB2b2lkIDApIHRocm93ICdEQVRJVU06IFwiZWxlbWVudFwiIG9wdGlvbiBpcyByZXF1aXJlZCc7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ29oIHllYWggYWhhJyk7XHJcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJldHVybiBjbGFzcyB7XHJcbiAgICAgICAgc3RhdGljIHNhbml0aXplKG9wdHM6SU9wdGlvbnMpOklPcHRpb25zIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IHNhbml0aXplRWxlbWVudChvcHRzLmVsZW1lbnQpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJPcHRpb25TYW5pdGl6ZXIudHNcIiAvPlxyXG5cclxuKDxhbnk+d2luZG93KVsnRGF0aXVtJ10gPSAoZnVuY3Rpb24oKSB7XHJcbiAgICBsZXQgb3B0aW9uczpJT3B0aW9ucztcclxuICAgIFxyXG4gICAgcmV0dXJuIGNsYXNzIHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihvcHRzOklPcHRpb25zKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlT3B0aW9ucyhvcHRzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdXBkYXRlT3B0aW9ucyhvcHRzOklPcHRpb25zKTp2b2lkIHtcclxuICAgICAgICAgICAgb3B0aW9ucyA9IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZShvcHRzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
