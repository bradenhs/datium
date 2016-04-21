ngm.factory("datium.PointerEventHandler",
["datium.listen", 
function(listen) {
var PointerEventHandler = (function () {
    function PointerEventHandler(input) {
        var self = this;
        this.input = input;
        this.down = false;
        this.mouseup = function () {
            if (!self.down)
                return;
            self.down = false;
            if (self.input.isInput) {
                var pos = self.input.element.selectionStart;
                if (pos === self.caretStart) {
                    pos = self.input.element.selectionEnd;
                }
                var block = self.input.getNearestSelectableDatePart(pos);
                self.input.setSelectedDatePart(block);
                if (self.input.element.selectionStart > 0 || self.input.element.selectionEnd < self.input.element.value.length) {
                    self.input.triggerViewChange();
                }
            }
            else {
                var maxDatePart = self.input.getMaxDatePart();
                self.input.setSelectedDatePart(maxDatePart);
                self.input.triggerViewChange();
            }
        };
        var stopMousedown = false;
        listen.touchstart(input.element, function (e) {
            stopMousedown = true;
        });
        listen.mousedown(input.element, function () {
            if (!stopMousedown)
                self.mousedown();
            stopMousedown = false;
        });
        listen.mouseup(document, function () {
            self.mouseup();
        });
        // Set Interval for Touch Devices
        if (this.input.isInput) {
            var start_1, end_1;
            setInterval(function () {
                if (self.down ||
                    self.input.element !== document.activeElement)
                    return;
                if (start_1 === self.input.element.selectionStart &&
                    end_1 === self.input.element.selectionEnd)
                    return;
                if (self.input.element.selectionStart !== self.input.element.selectionEnd)
                    return;
                start_1 = self.input.element.selectionStart;
                end_1 = self.input.element.selectionEnd;
                var pos = start_1 + (end_1 - start_1) / 2;
                var block = self.input.getNearestSelectableDatePart(pos);
                self.input.setSelectedDatePart(block);
                self.input.triggerViewChange();
            }, 10);
        }
        // Stop default
        input.element.addEventListener("dragenter", function (e) { return e.preventDefault(); });
        input.element.addEventListener("dragover", function (e) { return e.preventDefault(); });
        input.element.addEventListener("drop", function (e) { return e.preventDefault(); });
        input.element.addEventListener("cut", function (e) { return e.preventDefault(); });
    }
    PointerEventHandler.prototype.mousedown = function () {
        var self = this;
        this.down = true;
        if (!this.input.isInput)
            return;
        this.input.element.setSelectionRange(void 0, void 0);
        setTimeout(function () {
            self.caretStart = self.input.element.selectionStart;
        });
    };
    return PointerEventHandler;
}());
return PointerEventHandler;
}]);