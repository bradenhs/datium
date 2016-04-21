ngm.factory("datium.PointerEventHandler", function() {
var PointerEventHandler = (function () {
    function PointerEventHandler(input) {
        var _this = this;
        this.input = input;
        this.down = false;
        this.mouseup = function () {
            if (!_this.down)
                return;
            _this.down = false;
            if (_this.input.isInput) {
                var pos = _this.input.element.selectionStart;
                if (pos === _this.caretStart) {
                    pos = _this.input.element.selectionEnd;
                }
                var block = _this.input.getNearestSelectableDatePart(pos);
                _this.input.setSelectedDatePart(block);
                if (_this.input.element.selectionStart > 0 || _this.input.element.selectionEnd < _this.input.element.value.length) {
                    _this.input.triggerViewChange();
                }
            }
            else {
                var maxDatePart = _this.input.getMaxDatePart();
                _this.input.setSelectedDatePart(maxDatePart);
                _this.input.triggerViewChange();
            }
        };
        var stopMousedown = false;
        listen.touchstart(input.element, function (e) {
            stopMousedown = true;
        });
        listen.mousedown(input.element, function () {
            if (!stopMousedown)
                _this.mousedown();
            stopMousedown = false;
        });
        listen.mouseup(document, function () {
            _this.mouseup();
        });
        // Set Interval for Touch Devices
        if (this.input.isInput) {
            var start_1, end_1;
            setInterval(function () {
                if (_this.down ||
                    _this.input.element !== document.activeElement)
                    return;
                if (start_1 === _this.input.element.selectionStart &&
                    end_1 === _this.input.element.selectionEnd)
                    return;
                if (_this.input.element.selectionStart !== _this.input.element.selectionEnd)
                    return;
                start_1 = _this.input.element.selectionStart;
                end_1 = _this.input.element.selectionEnd;
                var pos = start_1 + (end_1 - start_1) / 2;
                var block = _this.input.getNearestSelectableDatePart(pos);
                _this.input.setSelectedDatePart(block);
                _this.input.triggerViewChange();
            }, 10);
        }
        // Stop default
        input.element.addEventListener("dragenter", function (e) { return e.preventDefault(); });
        input.element.addEventListener("dragover", function (e) { return e.preventDefault(); });
        input.element.addEventListener("drop", function (e) { return e.preventDefault(); });
        input.element.addEventListener("cut", function (e) { return e.preventDefault(); });
    }
    PointerEventHandler.prototype.mousedown = function () {
        var _this = this;
        this.down = true;
        if (!this.input.isInput)
            return;
        this.input.element.setSelectionRange(void 0, void 0);
        setTimeout(function () {
            _this.caretStart = _this.input.element.selectionStart;
        });
    };
    return PointerEventHandler;
}());
return PointerEventHandler;
});