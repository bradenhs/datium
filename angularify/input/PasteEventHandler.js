ngm.factory("", function() {
var PasteEventHander = (function () {
    function PasteEventHander(input) {
        var _this = this;
        this.input = input;
        listen.paste(input.element, function () { return _this.paste(); });
    }
    PasteEventHander.prototype.paste = function () {
        var _this = this;
        var originalValue = this.input.element.value;
        var start = this.input.element.selectionStart;
        var end = this.input.element.selectionEnd;
        setTimeout(function () {
            if (!_this.input.setDateFromString(_this.input.element.value, start, end)) {
                _this.input.element.value = originalValue;
            }
        });
    };
    return PasteEventHander;
}());
});