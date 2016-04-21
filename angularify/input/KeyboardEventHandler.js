ngm.factory("datium.KeyboardEventHandler",
["datium.trigger", 
function(trigger) {
var KeyboardEventHandler = (function () {
    function KeyboardEventHandler(input) {
        var self = this;
        this.input = input;
        this.shiftTabDown = false;
        this.tabDown = false;
        this.focus = function () {
            if (self.tabDown) {
                var first = self.input.getFirstSelectableDatePart();
                self.input.setSelectedDatePart(first);
                setTimeout(function () {
                    self.input.triggerViewChange();
                });
            }
            else if (self.shiftTabDown) {
                var last = self.input.getLastSelectableDatePart();
                self.input.setSelectedDatePart(last);
                setTimeout(function () {
                    self.input.triggerViewChange();
                });
            }
            else if (!self.input.isInput) {
                var block = self.input.getMaxDatePart();
                self.input.setSelectedDatePart(block);
                setTimeout(function () {
                    self.input.triggerViewChange();
                });
            }
        };
        input.element.addEventListener("focus", function () { return self.focus(); });
        if (!input.isInput)
            return;
        input.element.addEventListener("keydown", function (e) { return self.keydown(e); });
        document.addEventListener("keydown", function (e) { return self.documentKeydown(e); });
    }
    KeyboardEventHandler.prototype.documentKeydown = function (e) {
        var self = this;
        if (e.shiftKey && e.keyCode === 9 /* TAB */) {
            this.shiftTabDown = true;
        }
        else if (e.keyCode === 9 /* TAB */) {
            this.tabDown = true;
        }
        setTimeout(function () {
            self.shiftTabDown = false;
            self.tabDown = false;
        });
    };
    KeyboardEventHandler.prototype.keydown = function (e) {
        var self = this;
        var code = e.keyCode;
        if (code >= 96 && code <= 105) {
            code -= 48;
        }
        if ((code === 36 /* HOME */ || code === 35 /* END */) && e.shiftKey)
            return;
        if ((code === 37 /* LEFT */ || code === 39 /* RIGHT */) && e.shiftKey)
            return;
        if ((code === 67 /* C */ || code === 65 /* A */ || code === 86 /* V */) && e.ctrlKey)
            return;
        var preventDefault = true;
        if (code === 36 /* HOME */) {
            this.home();
        }
        else if (code === 35 /* END */) {
            this.end();
        }
        else if (code === 37 /* LEFT */) {
            this.left();
        }
        else if (code === 39 /* RIGHT */) {
            this.right();
        }
        else if (code === 9 /* TAB */ && e.shiftKey) {
            preventDefault = this.shiftTab();
        }
        else if (code === 9 /* TAB */) {
            preventDefault = this.tab();
        }
        else if (code === 38 /* UP */) {
            this.up();
        }
        else if (code === 40 /* DOWN */) {
            this.down();
        }
        if (preventDefault) {
            e.preventDefault();
        }
        var keyPressed = String.fromCharCode(code);
        if (/^[0-9]|[A-z]$/.test(keyPressed)) {
            var textBuffer = this.input.getTextBuffer();
            this.input.setTextBuffer(textBuffer + keyPressed);
        }
        else if (code === 8 /* BACKSPACE */) {
            var textBuffer = this.input.getTextBuffer();
            this.input.setTextBuffer(textBuffer.slice(0, -1));
            if (textBuffer.length < 2) {
                //TODO triger defined change
                var undefinedLevel_1 = this.input.getSelectedDatePart().getLevel();
                this.input.dateParts.forEach(function (datePart) {
                    if (datePart.getLevel() === undefinedLevel_1) {
                        self.input.setDefined(datePart, false);
                    }
                });
                this.input.triggerViewChange();
            }
        }
        else if (code === 46 /* DELETE */) {
            //TODO triger defined change
            var undefinedLevel_2 = this.input.getSelectedDatePart().getLevel();
            this.input.dateParts.forEach(function (datePart) {
                if (datePart.getLevel() === undefinedLevel_2) {
                    self.input.setDefined(datePart, false);
                }
            });
            this.input.triggerViewChange();
        }
        else if (!e.shiftKey) {
            this.input.setTextBuffer('');
        }
    };
    KeyboardEventHandler.prototype.home = function () {
        var first = this.input.getFirstSelectableDatePart();
        this.input.setSelectedDatePart(first);
        this.input.triggerViewChange();
    };
    KeyboardEventHandler.prototype.end = function () {
        var last = this.input.getLastSelectableDatePart();
        this.input.setSelectedDatePart(last);
        this.input.triggerViewChange();
    };
    KeyboardEventHandler.prototype.left = function () {
        var previous = this.input.getPreviousSelectableDatePart();
        this.input.setSelectedDatePart(previous);
        this.input.triggerViewChange();
    };
    KeyboardEventHandler.prototype.right = function () {
        var next = this.input.getNextSelectableDatePart();
        this.input.setSelectedDatePart(next);
        this.input.triggerViewChange();
    };
    KeyboardEventHandler.prototype.shiftTab = function () {
        var previous = this.input.getPreviousSelectableDatePart();
        if (previous !== this.input.getSelectedDatePart()) {
            this.input.setSelectedDatePart(previous);
            this.input.triggerViewChange();
            return true;
        }
        return false;
    };
    KeyboardEventHandler.prototype.tab = function () {
        var next = this.input.getNextSelectableDatePart();
        if (next !== this.input.getSelectedDatePart()) {
            this.input.setSelectedDatePart(next);
            this.input.triggerViewChange();
            return true;
        }
        return false;
    };
    KeyboardEventHandler.prototype.up = function () {
        var self = this;
        this.input.getSelectedDatePart().increment();
        this.input.dateParts.forEach(function (datePart) {
            if (datePart.getLevel() === self.input.getSelectedDatePart().getLevel()) {
                self.input.setDefined(datePart, true);
            }
        });
        var level = this.input.getSelectedDatePart().getLevel();
        var date = this.input.getSelectedDatePart().getValue();
        trigger.goto(this.input.element, {
            date: date,
            level: level
        });
    };
    KeyboardEventHandler.prototype.down = function () {
        var self = this;
        this.input.getSelectedDatePart().decrement();
        this.input.dateParts.forEach(function (datePart) {
            if (datePart.getLevel() === self.input.getSelectedDatePart().getLevel()) {
                self.input.setDefined(datePart, true);
            }
        });
        var level = this.input.getSelectedDatePart().getLevel();
        var date = this.input.getSelectedDatePart().getValue();
        trigger.goto(this.input.element, {
            date: date,
            level: level
        });
    };
    return KeyboardEventHandler;
}());
return KeyboardEventHandler;
}]);