ngm.factory("datium.PasteEventHandler",
["datium.listen", 
function(listen) {
var PasteEventHander = (function () {
    function PasteEventHander(input) {
        var self = this;
        this.input = input;
        listen.paste(input.element, function () { return self.paste(); });
    }
    PasteEventHander.prototype.paste = function () {
        var self = this;
        var originalValue = this.input.element.value;
        var start = this.input.element.selectionStart;
        var end = this.input.element.selectionEnd;
        setTimeout(function () {
            if (!self.input.setDateFromString(self.input.element.value, start, end)) {
                self.input.element.value = originalValue;
            }
        });
    };
    return PasteEventHander;
}());
return PasteEventHandler;
}]);