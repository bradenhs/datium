(function(){
var Level;
(function (Level) {
    Level[Level["YEAR"] = 0] = "YEAR";
    Level[Level["MONTH"] = 1] = "MONTH";
    Level[Level["DATE"] = 2] = "DATE";
    Level[Level["HOUR"] = 3] = "HOUR";
    Level[Level["MINUTE"] = 4] = "MINUTE";
    Level[Level["SECOND"] = 5] = "SECOND";
    Level[Level["NONE"] = 6] = "NONE";
})(Level || (Level = {}));
var DateManager = (function () {
    function DateManager() {
    }
    DateManager.prototype.update = function (options) {
        this.options = options;
    };
    DateManager.prototype.goTo = function (date, level) {
    };
    DateManager.prototype.getDefaultDate = function () {
        return new Date();
    };
    return DateManager;
})();
window['Datium'] = (function () {
    function Datium(element, options) {
        var internals = new DatiumInternals(element, options);
        this.update = function (options) { return internals.update(options); };
    }
    return Datium;
})();
var DatiumInternals = (function () {
    function DatiumInternals(element, options) {
        this.element = element;
        this.options = {};
        if (element === void 0)
            throw 'element is required';
        this.dateManager = new DateManager();
        this.input = new Input(element, this.dateManager);
        this.update(options);
    }
    DatiumInternals.prototype.update = function (newOptions) {
        if (newOptions === void 0) { newOptions = {}; }
        this.options = OptionSanitizer.sanitize(newOptions, this.options);
        this.input.update(this.options);
        this.dateManager.update(this.options);
    };
    return DatiumInternals;
})();
var OptionSanitizer = (function () {
    function OptionSanitizer() {
    }
    OptionSanitizer.sanitizeDisplayAs = function (displayAs, dflt) {
        if (dflt === void 0) { dflt = 'h:mma MMM D, YYYY'; }
        if (displayAs === void 0)
            return dflt;
        if (typeof displayAs !== 'string')
            throw 'Display as must be a string';
        return displayAs;
    };
    OptionSanitizer.sanitize = function (options, defaults) {
        return {
            displayAs: OptionSanitizer.sanitizeDisplayAs(options['displayAs'], defaults.displayAs)
        };
    };
    return OptionSanitizer;
})();
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var PlainText = (function () {
    function PlainText(text) {
        this.text = text;
    }
    PlainText.prototype.increment = function () { };
    PlainText.prototype.decrement = function () { };
    PlainText.prototype.setValue = function () { };
    PlainText.prototype.getValue = function () { return null; };
    PlainText.prototype.getRegEx = function () { return null; };
    PlainText.prototype.setSelectable = function () { return this; };
    PlainText.prototype.getLevel = function () { return Level.NONE; };
    PlainText.prototype.isSelectable = function () { return false; };
    PlainText.prototype.toString = function () { return this.text; };
    return PlainText;
})();
var formatBlocks = (function () {
    var formatBlocks = {};
    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var DatePart = (function () {
        function DatePart() {
            this.selectable = true;
        }
        DatePart.prototype.getValue = function () {
            return this.date;
        };
        DatePart.prototype.setSelectable = function (selectable) {
            this.selectable = selectable;
            return this;
        };
        DatePart.prototype.isSelectable = function () {
            return this.selectable;
        };
        return DatePart;
    })();
    formatBlocks['YYYY'] = (function (_super) {
        __extends(class_1, _super);
        function class_1() {
            _super.apply(this, arguments);
        }
        class_1.prototype.increment = function () {
            this.date.setFullYear(this.date.getFullYear() + 1);
        };
        class_1.prototype.decrement = function () {
            this.date.setFullYear(this.date.getFullYear() - 1);
        };
        class_1.prototype.setValue = function (value) {
            if (value instanceof Date) {
                this.date = new Date(value.valueOf());
            }
            else if (typeof value === 'string' && this.getRegEx().test(value)) {
                this.date.setFullYear(parseInt(value, 10));
            }
            else {
                this.date = void 0;
            }
        };
        class_1.prototype.getRegEx = function () {
            return /^\d+$/;
        };
        class_1.prototype.getLevel = function () {
            return Level.YEAR;
        };
        class_1.prototype.toString = function () {
            if (this.date === void 0)
                return '----';
            return this.date.getFullYear().toString();
        };
        return class_1;
    })(DatePart);
    formatBlocks['MMM'] = (function (_super) {
        __extends(class_2, _super);
        function class_2() {
            _super.apply(this, arguments);
        }
        class_2.prototype.increment = function () {
            var num = this.date.getMonth() + 1;
            if (num > 11)
                num = 0;
            this.date.setMonth(num);
        };
        class_2.prototype.decrement = function () {
            var num = this.date.getMonth() - 1;
            if (num < 0)
                num = 11;
            this.date.setMonth(num);
        };
        class_2.prototype.setValue = function (value) {
            if (value instanceof Date) {
                this.date = new Date(value.valueOf());
            }
            else if (typeof value === 'string' && this.getRegEx().test(value)) {
                var num = monthNames.map(function (v) { return v.slice(0, 3); }).indexOf(value);
                this.date.setMonth(num);
            }
            else {
                this.date = void 0;
            }
        };
        class_2.prototype.getRegEx = function () {
            return new RegExp("^((" + monthNames.map(function (v) { return v.slice(0, 3); }).join(")|(") + "))$");
        };
        class_2.prototype.getLevel = function () {
            return Level.MONTH;
        };
        class_2.prototype.toString = function () {
            if (this.date === void 0)
                return '---';
            return monthNames.map(function (v) { return v.slice(0, 3); })[this.date.getMonth()];
        };
        return class_2;
    })(DatePart);
    formatBlocks['D'] = (function (_super) {
        __extends(class_3, _super);
        function class_3() {
            _super.apply(this, arguments);
        }
        class_3.prototype.daysInMonth = function () {
            return new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0).getDate();
        };
        class_3.prototype.increment = function () {
            var num = this.date.getDate() + 1;
            if (num > this.daysInMonth())
                num = 1;
            this.date.setDate(num);
        };
        class_3.prototype.decrement = function () {
            var num = this.date.getDate() - 1;
            if (num < 1)
                num = this.daysInMonth();
            this.date.setDate(num);
        };
        class_3.prototype.setValue = function (value) {
            if (value instanceof Date) {
                this.date = new Date(value.valueOf());
            }
            else if (typeof value === 'string' && this.getRegEx().test(value) && parseInt(value, 10) < this.daysInMonth()) {
                this.date.setDate(parseInt(value, 10));
            }
            else {
                this.date = void 0;
            }
        };
        class_3.prototype.getRegEx = function () {
            return /^[1-3]?[0-9]$/;
        };
        class_3.prototype.getLevel = function () {
            return Level.DATE;
        };
        class_3.prototype.toString = function () {
            if (this.date === void 0)
                return '--';
            return this.date.getDate().toString();
        };
        return class_3;
    })(DatePart);
    formatBlocks['h'] = (function (_super) {
        __extends(class_4, _super);
        function class_4() {
            _super.apply(this, arguments);
        }
        class_4.prototype.increment = function () {
            var num = this.date.getHours() + 1;
            if (num > 23)
                num = 0;
            this.date.setHours(num);
        };
        class_4.prototype.decrement = function () {
            var num = this.date.getHours() - 1;
            if (num < 0)
                num = 23;
            this.date.setHours(num);
        };
        class_4.prototype.setValue = function (value) {
            if (value instanceof Date) {
                this.date = new Date(value.valueOf());
            }
            else if (typeof value === 'string' && this.getRegEx().test(value)) {
                this.date.setHours(parseInt(value, 10));
            }
            else {
                this.date = void 0;
            }
        };
        class_4.prototype.getRegEx = function () {
            return /^[1-5]?[0-9]$/;
        };
        class_4.prototype.getLevel = function () {
            return Level.HOUR;
        };
        class_4.prototype.toString = function () {
            if (this.date === void 0)
                return '--';
            return this.date.getHours().toString();
        };
        return class_4;
    })(DatePart);
    formatBlocks['mm'] = (function (_super) {
        __extends(class_5, _super);
        function class_5() {
            _super.apply(this, arguments);
        }
        class_5.prototype.increment = function () {
            var num = this.date.getMinutes() + 1;
            if (num > 59)
                num = 0;
            this.date.setMinutes(num);
        };
        class_5.prototype.decrement = function () {
            var num = this.date.getMinutes() - 1;
            if (num < 0)
                num = 59;
            this.date.setMinutes(num);
        };
        class_5.prototype.setValue = function (value) {
            if (value instanceof Date) {
                this.date = new Date(value.valueOf());
            }
            else if (typeof value === 'string' && this.getRegEx().test(value)) {
                this.date.setHours(parseInt(value, 10));
            }
            else {
                this.date = void 0;
            }
        };
        class_5.prototype.getRegEx = function () {
            return /^[0-5][0-9]$/;
        };
        class_5.prototype.getLevel = function () {
            return Level.MINUTE;
        };
        class_5.prototype.toString = function () {
            if (this.date === void 0)
                return '--';
            return this.date.getMinutes().toString();
        };
        return class_5;
    })(DatePart);
    formatBlocks['A'] = (function (_super) {
        __extends(class_6, _super);
        function class_6() {
            _super.apply(this, arguments);
        }
        class_6.prototype.increment = function () {
            var num = this.date.getHours() + 12;
            if (num > 23)
                num -= 24;
            this.date.setHours(num);
        };
        class_6.prototype.decrement = function () {
            var num = this.date.getHours() - 12;
            if (num < 0)
                num += 24;
            this.date.setHours(num);
        };
        class_6.prototype.setValue = function (value) {
            if (value instanceof Date) {
                this.date = new Date(value.valueOf());
            }
            else if (typeof value === 'string' && this.getRegEx().test(value)) {
                if (value.toLowerCase() === 'am' && this.date.getHours() > 11) {
                    this.date.setHours(this.date.getHours() - 12);
                }
                else if (value.toLowerCase() === 'pm' && this.date.getHours() < 12) {
                    this.date.setHours(this.date.getHours() + 12);
                }
                this.date.setHours(parseInt(value, 10));
            }
            else {
                this.date = void 0;
            }
        };
        class_6.prototype.getLevel = function () {
            return Level.HOUR;
        };
        class_6.prototype.getRegEx = function () {
            return /^((AM)|(PM))$/;
        };
        class_6.prototype.toString = function () {
            if (this.date === void 0)
                return '--';
            return this.date.getHours() < 12 ? 'AM' : 'PM';
        };
        return class_6;
    })(DatePart);
    formatBlocks['a'] = (function (_super) {
        __extends(class_7, _super);
        function class_7() {
            _super.apply(this, arguments);
        }
        class_7.prototype.getRegEx = function () {
            return /^((am)|(pm))$/;
        };
        class_7.prototype.toString = function () {
            return _super.prototype.toString.call(this).toLowerCase();
        };
        return class_7;
    })(formatBlocks['A']);
    return formatBlocks;
})();
var Input = (function () {
    function Input(element, dateManager) {
        this.element = element;
        this.dateManager = dateManager;
        new KeyboardEventHandler(this, dateManager);
        new MouseEventHandler(this);
    }
    Input.prototype.getFirstSelectableDatePart = function () {
        for (var i = 0; i < this.dateParts.length; i++) {
            if (this.dateParts[i].isSelectable())
                return this.dateParts[i];
        }
        return void 0;
    };
    Input.prototype.getLastSelectableDatePart = function () {
        for (var i = this.dateParts.length - 1; i >= 0; i--) {
            if (this.dateParts[i].isSelectable())
                return this.dateParts[i];
        }
        return void 0;
    };
    Input.prototype.getNextSelectableDatePart = function () {
        var i = this.dateParts.indexOf(this.selectedDatePart);
        while (++i < this.dateParts.length) {
            if (this.dateParts[i].isSelectable())
                return this.dateParts[i];
        }
        return this.selectedDatePart;
    };
    Input.prototype.getPreviousSelectableDatePart = function () {
        var i = this.dateParts.indexOf(this.selectedDatePart);
        while (--i >= 0) {
            if (this.dateParts[i].isSelectable())
                return this.dateParts[i];
        }
        return this.selectedDatePart;
    };
    Input.prototype.getNearestSelectableDatePart = function (pos) {
        var distance = Number.MAX_VALUE;
        var nearestDatePart;
        var start = 0;
        for (var i = 0; i < this.dateParts.length; i++) {
            var datePart = this.dateParts[i];
            if (datePart.isSelectable()) {
                var fromLeft = pos - start;
                var fromRight = pos - (start + datePart.toString().length);
                if (fromLeft > 0 && fromRight < 0)
                    return datePart;
                var d = Math.min(Math.abs(fromLeft), Math.abs(fromRight));
                if (d <= distance) {
                    nearestDatePart = datePart;
                    distance = d;
                }
            }
            start += datePart.toString().length;
        }
        return nearestDatePart;
    };
    Input.prototype.setSelectedDatePart = function (datePart) {
        this.selectedDatePart = datePart;
    };
    Input.prototype.getSelectedDatePart = function () {
        return this.selectedDatePart;
    };
    Input.prototype.update = function (options) {
        this.options = options;
        this.dateParts = Parser.parse(options.displayAs);
        this.selectedDatePart = void 0;
        this.updateView();
    };
    Input.prototype.updateView = function () {
        var dateString = '';
        this.dateParts.forEach(function (datePart) {
            dateString += datePart.toString();
        });
        this.element.value = dateString;
        if (this.selectedDatePart === void 0)
            return;
        var start = 0;
        var i = 0;
        while (this.dateParts[i] !== this.selectedDatePart) {
            start += this.dateParts[i++].toString().length;
        }
        var end = start + this.selectedDatePart.toString().length;
        this.element.setSelectionRange(start, end);
    };
    return Input;
})();
var KeyboardEventHandler = (function () {
    function KeyboardEventHandler(input, dateManager) {
        var _this = this;
        this.input = input;
        this.dateManager = dateManager;
        this.shiftTabDown = false;
        this.tabDown = false;
        this.focus = function () {
            if (_this.tabDown) {
                var first = _this.input.getFirstSelectableDatePart();
                _this.input.setSelectedDatePart(first);
                setTimeout(function () {
                    _this.input.updateView();
                });
            }
            else if (_this.shiftTabDown) {
                var last = _this.input.getLastSelectableDatePart();
                _this.input.setSelectedDatePart(last);
                setTimeout(function () {
                    _this.input.updateView();
                });
            }
        };
        input.element.addEventListener("keydown", function (e) { return _this.keydown(e); });
        input.element.addEventListener("focus", function () { return _this.focus(); });
        document.addEventListener("keydown", function (e) { return _this.documentKeydown(e); });
    }
    KeyboardEventHandler.prototype.documentKeydown = function (e) {
        var _this = this;
        if (e.shiftKey && e.keyCode === 9 /* TAB */) {
            this.shiftTabDown = true;
        }
        else if (e.keyCode === 9 /* TAB */) {
            this.tabDown = true;
        }
        setTimeout(function () {
            _this.shiftTabDown = false;
            _this.tabDown = false;
        });
    };
    KeyboardEventHandler.prototype.keydown = function (e) {
        var code = e.keyCode;
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
    };
    KeyboardEventHandler.prototype.home = function () {
        var first = this.input.getFirstSelectableDatePart();
        this.input.setSelectedDatePart(first);
    };
    KeyboardEventHandler.prototype.end = function () {
        var last = this.input.getLastSelectableDatePart();
        this.input.setSelectedDatePart(last);
    };
    KeyboardEventHandler.prototype.left = function () {
        var previous = this.input.getPreviousSelectableDatePart();
        this.input.setSelectedDatePart(previous);
    };
    KeyboardEventHandler.prototype.right = function () {
        var next = this.input.getNextSelectableDatePart();
        this.input.setSelectedDatePart(next);
    };
    KeyboardEventHandler.prototype.shiftTab = function () {
        var previous = this.input.getPreviousSelectableDatePart();
        if (previous !== this.input.getSelectedDatePart()) {
            this.input.setSelectedDatePart(previous);
            return true;
        }
        return false;
    };
    KeyboardEventHandler.prototype.tab = function () {
        var next = this.input.getNextSelectableDatePart();
        if (next !== this.input.getSelectedDatePart()) {
            this.input.setSelectedDatePart(next);
            return true;
        }
        return false;
    };
    KeyboardEventHandler.prototype.up = function () {
        try {
            this.input.getSelectedDatePart().increment();
        }
        catch (e) {
            this.input.getSelectedDatePart().setValue(this.dateManager.getDefaultDate());
        }
        var level = this.input.getSelectedDatePart().getLevel();
        var date = this.input.getSelectedDatePart().getValue();
        this.dateManager.goTo(date, level);
    };
    KeyboardEventHandler.prototype.down = function () {
    };
    return KeyboardEventHandler;
})();
var MouseEventHandler = (function () {
    function MouseEventHandler(input) {
        var _this = this;
        this.input = input;
        this.mouseup = function () {
            if (!_this.down)
                return;
            _this.down = false;
            var pos;
            if (_this.input.element.selectionStart === _this.caretStart) {
                pos = _this.input.element.selectionEnd;
            }
            else {
                pos = _this.input.element.selectionStart;
            }
            var block = _this.input.getNearestSelectableDatePart(pos);
            _this.input.setSelectedDatePart(block);
            if (_this.input.element.selectionStart > 0 || _this.input.element.selectionEnd < _this.input.element.value.length) {
                _this.input.updateView();
            }
        };
        input.element.addEventListener('mousedown', function () { return _this.mousedown(); });
        document.addEventListener("mouseup", function () { return _this.mouseup(); });
        // Stop default
        input.element.addEventListener("dragenter", function (e) { return e.preventDefault(); });
        input.element.addEventListener("dragover", function (e) { return e.preventDefault(); });
        input.element.addEventListener("drop", function (e) { return e.preventDefault(); });
        input.element.addEventListener("cut", function (e) { return e.preventDefault(); });
    }
    MouseEventHandler.prototype.mousedown = function () {
        var _this = this;
        this.down = true;
        this.input.element.setSelectionRange(void 0, void 0);
        setTimeout(function () {
            _this.caretStart = _this.input.element.selectionStart;
        });
    };
    return MouseEventHandler;
})();
var Parser = (function () {
    function Parser() {
    }
    Parser.parse = function (format) {
        var textBuffer = '';
        var dateParts = [];
        var index = 0;
        var inEscapedSegment = false;
        var pushPlainText = function () {
            if (textBuffer.length > 0) {
                dateParts.push(new PlainText(textBuffer).setSelectable(false));
                textBuffer = '';
            }
        };
        while (index < format.length) {
            if (!inEscapedSegment && format[index] === '[') {
                inEscapedSegment = true;
                index++;
                continue;
            }
            if (inEscapedSegment && format[index] === ']') {
                inEscapedSegment = false;
                index++;
                continue;
            }
            if (inEscapedSegment) {
                textBuffer += format[index];
                index++;
                continue;
            }
            var found = false;
            for (var code in formatBlocks) {
                if (Parser.findAt(format, index, "{" + code + "}")) {
                    pushPlainText();
                    dateParts.push(new formatBlocks[code]().setSelectable(false));
                    index += code.length + 2;
                    found = true;
                    break;
                }
                else if (Parser.findAt(format, index, code)) {
                    pushPlainText();
                    dateParts.push(new formatBlocks[code]());
                    index += code.length;
                    found = true;
                    break;
                }
            }
            if (!found) {
                textBuffer += format[index];
                index++;
            }
        }
        pushPlainText();
        return dateParts;
    };
    Parser.findAt = function (str, index, search) {
        return str.slice(index, index + search.length) === search;
    };
    return Parser;
})();
var Picker = (function () {
    function Picker() {
    }
    Picker.prototype.update = function (options) {
    };
    return Picker;
})();
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRhdGVNYW5hZ2VyLnRzIiwiRGF0aXVtLnRzIiwiRGF0aXVtSW50ZXJuYWxzLnRzIiwiT3B0aW9uU2FuaXRpemVyLnRzIiwiaW5wdXQvRGF0ZVBhcnRzLnRzIiwiaW5wdXQvSW5wdXQudHMiLCJpbnB1dC9LZXlib2FyZEV2ZW50SGFuZGxlci50cyIsImlucHV0L01vdXNlRXZlbnRIYW5kbGVyLnRzIiwiaW5wdXQvUGFyc2VyLnRzIiwicGlja2VyL1BpY2tlci50cyJdLCJuYW1lcyI6WyJMZXZlbCIsIkRhdGVNYW5hZ2VyIiwiRGF0ZU1hbmFnZXIuY29uc3RydWN0b3IiLCJEYXRlTWFuYWdlci51cGRhdGUiLCJEYXRlTWFuYWdlci5nb1RvIiwiRGF0ZU1hbmFnZXIuZ2V0RGVmYXVsdERhdGUiLCJjb25zdHJ1Y3RvciIsIkRhdGl1bUludGVybmFscyIsIkRhdGl1bUludGVybmFscy5jb25zdHJ1Y3RvciIsIkRhdGl1bUludGVybmFscy51cGRhdGUiLCJPcHRpb25TYW5pdGl6ZXIiLCJPcHRpb25TYW5pdGl6ZXIuY29uc3RydWN0b3IiLCJPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVEaXNwbGF5QXMiLCJPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemUiLCJQbGFpblRleHQiLCJQbGFpblRleHQuY29uc3RydWN0b3IiLCJQbGFpblRleHQuaW5jcmVtZW50IiwiUGxhaW5UZXh0LmRlY3JlbWVudCIsIlBsYWluVGV4dC5zZXRWYWx1ZSIsIlBsYWluVGV4dC5nZXRWYWx1ZSIsIlBsYWluVGV4dC5nZXRSZWdFeCIsIlBsYWluVGV4dC5zZXRTZWxlY3RhYmxlIiwiUGxhaW5UZXh0LmdldExldmVsIiwiUGxhaW5UZXh0LmlzU2VsZWN0YWJsZSIsIlBsYWluVGV4dC50b1N0cmluZyIsIkRhdGVQYXJ0IiwiRGF0ZVBhcnQuY29uc3RydWN0b3IiLCJEYXRlUGFydC5nZXRWYWx1ZSIsIkRhdGVQYXJ0LnNldFNlbGVjdGFibGUiLCJEYXRlUGFydC5pc1NlbGVjdGFibGUiLCJpbmNyZW1lbnQiLCJkZWNyZW1lbnQiLCJzZXRWYWx1ZSIsImdldFJlZ0V4IiwiZ2V0TGV2ZWwiLCJ0b1N0cmluZyIsImRheXNJbk1vbnRoIiwiSW5wdXQiLCJJbnB1dC5jb25zdHJ1Y3RvciIsIklucHV0LmdldEZpcnN0U2VsZWN0YWJsZURhdGVQYXJ0IiwiSW5wdXQuZ2V0TGFzdFNlbGVjdGFibGVEYXRlUGFydCIsIklucHV0LmdldE5leHRTZWxlY3RhYmxlRGF0ZVBhcnQiLCJJbnB1dC5nZXRQcmV2aW91c1NlbGVjdGFibGVEYXRlUGFydCIsIklucHV0LmdldE5lYXJlc3RTZWxlY3RhYmxlRGF0ZVBhcnQiLCJJbnB1dC5zZXRTZWxlY3RlZERhdGVQYXJ0IiwiSW5wdXQuZ2V0U2VsZWN0ZWREYXRlUGFydCIsIklucHV0LnVwZGF0ZSIsIklucHV0LnVwZGF0ZVZpZXciLCJLZXlib2FyZEV2ZW50SGFuZGxlciIsIktleWJvYXJkRXZlbnRIYW5kbGVyLmNvbnN0cnVjdG9yIiwiS2V5Ym9hcmRFdmVudEhhbmRsZXIuZG9jdW1lbnRLZXlkb3duIiwiS2V5Ym9hcmRFdmVudEhhbmRsZXIua2V5ZG93biIsIktleWJvYXJkRXZlbnRIYW5kbGVyLmhvbWUiLCJLZXlib2FyZEV2ZW50SGFuZGxlci5lbmQiLCJLZXlib2FyZEV2ZW50SGFuZGxlci5sZWZ0IiwiS2V5Ym9hcmRFdmVudEhhbmRsZXIucmlnaHQiLCJLZXlib2FyZEV2ZW50SGFuZGxlci5zaGlmdFRhYiIsIktleWJvYXJkRXZlbnRIYW5kbGVyLnRhYiIsIktleWJvYXJkRXZlbnRIYW5kbGVyLnVwIiwiS2V5Ym9hcmRFdmVudEhhbmRsZXIuZG93biIsIk1vdXNlRXZlbnRIYW5kbGVyIiwiTW91c2VFdmVudEhhbmRsZXIuY29uc3RydWN0b3IiLCJNb3VzZUV2ZW50SGFuZGxlci5tb3VzZWRvd24iLCJQYXJzZXIiLCJQYXJzZXIuY29uc3RydWN0b3IiLCJQYXJzZXIucGFyc2UiLCJQYXJzZXIuZmluZEF0IiwiUGlja2VyIiwiUGlja2VyLmNvbnN0cnVjdG9yIiwi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SUFBSUEsQ0FBQ0EsUUFBUUEsRUFBRUEsR0FBR0EsRUFBRUEsQ0FBQ0E7WUFDcENBLEVBQUVBLENBQUNBLENBQUNBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBO2dCQUFDQSxHQUFHQSxJQUFJQSxFQUFFQSxDQUFDQTtZQUN2QkEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDNUJBLENBQUNBO1FBRU0sMEJBQVEsR0FBZixVQUFnQixLQUFpQjtZQUM3QkMsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsWUFBWUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3hCQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQSxDQUFDQTtZQUMxQ0EsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsS0FBS0EsS0FBS0EsUUFBUUEsSUFBSUEsSUFBSUEsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2xFQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxXQUFXQSxFQUFFQSxLQUFLQSxJQUFJQSxJQUFJQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxFQUFFQSxHQUFHQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDNURBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLEVBQUVBLEdBQUdBLEVBQUVBLENBQUNBLENBQUNBO2dCQUNsREEsQ0FBQ0E7Z0JBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLFdBQVdBLEVBQUVBLEtBQUtBLElBQUlBLElBQUlBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLEVBQUVBLEdBQUdBLEVBQUVB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QSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNqQ0EsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQTtJQUNqQ0EsQ0FBQ0E7SUFFTUwsNENBQTRCQSxHQUFuQ0EsVUFBb0NBLEdBQVVBO1FBQzFDTSxJQUFJQSxRQUFRQSxHQUFVQSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQTtRQUN2Q0EsSUFBSUEsZUFBeUJBLENBQUNBO1FBQzlCQSxJQUFJQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUVkQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQTtZQUM3Q0EsSUFBSUEsUUFBUUEsR0FBR0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFFakNBLEVBQUVBLENBQUNBLENBQUNBLFFBQVFBLENBQUNBLFlBQVlBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO2dCQUMxQkEsSUFBSUEsUUFBUUEsR0FBR0EsR0FBR0EsR0FBR0EsS0FBS0EsQ0FBQ0E7Z0JBQzNCQSxJQUFJQSxTQUFTQSxHQUFHQSxHQUFHQSxHQUFHQSxDQUFDQSxLQUFLQSxHQUFHQSxRQUFRQSxDQUFDQSxRQUFRQSxFQUFFQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtnQkFFM0RBLEVBQUVBLENBQUNBLENBQUNBLFFBQVFBLEdBQUdBLENBQUNBLElBQUlBLFNBQVNBLEdBQUdBLENBQUNBLENBQUNBO29CQUFDQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQTtnQkFFbkRBLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLElBQUlBLENBQUNB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LENBQUNBLEtBQUtBLENBQUNBLE9BQU9BLENBQUNBLFlBQVlBLENBQUNBO1lBQzFDQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFDSkEsR0FBR0EsR0FBR0EsS0FBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsY0FBY0EsQ0FBQ0E7WUFDNUNBLENBQUNBO1lBRURBLElBQUlBLEtBQUtBLEdBQUdBLEtBQUlBLENBQUNBLEtBQUtBLENBQUNBLDRCQUE0QkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFFekRBLEtBQUlBLENBQUNBLEtBQUtBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7WUFFdENBLEVBQUVBLENBQUNBLENBQUNBLEtBQUlBLENBQUNBLEtBQUtBLENBQUNBLE9BQU9BLENBQUNBLGNBQWNBLEdBQUdBLENBQUNBLElBQUlBLEtBQUlBLENBQUNBLEtBQUtBLENBQUNBLE9BQU9BLENBQUNBLFlBQVlBLEdBQUdBLEtBQUlBLENBQUNBLEtBQUtBLENBQUNBLE9BQU9BLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO2dCQUM3R0EsS0FBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsVUFBVUEsRUFBRUEsQ0FBQ0E7WUFDNUJBLENBQUNBO1FBQ0xBLENBQUNBLENBQUNBO1FBeENFQSxLQUFLQSxDQUFDQSxPQUFPQSxDQUFDQSxnQkFBZ0JBLENBQUNBLFdBQVdBLEVBQUVBLGNBQU1BLE9BQUFBLEtBQUlBLENBQUNBLFNBQVNBLEVBQUVBLEVBQWhCQSxDQUFnQkEsQ0FBQ0EsQ0FBQ0E7UUFDcEVBLFFBQVFBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsU0FBU0EsRUFBRUEsY0FBTUEsT0FBQUEsS0FBSUEsQ0FBQ0EsT0FBT0EsRUFBRUEsRUFBZEEsQ0FBY0EsQ0FBQ0EsQ0FBQ0E7UUFFM0RBLGVBQWVBO1FBQ2ZBLEtBQUtBLENBQUNBLE9BQU9BLENBQUNBLGdCQUFnQkEsQ0FBQ0EsV0FBV0EsRUFBRUEsVUFBQ0EsQ0FBQ0EsSUFBS0Es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QUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDVEEsVUFBVUEsSUFBSUEsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzVCQSxLQUFLQSxFQUFFQSxDQUFDQTtZQUNaQSxDQUFDQTtRQUVMQSxDQUFDQTtRQUVEQSxhQUFhQSxFQUFFQSxDQUFDQTtRQUVoQkEsTUFBTUEsQ0FBQ0EsU0FBU0EsQ0FBQ0E7SUFDckJBLENBQUNBO0lBRWNGLGFBQU1BLEdBQXJCQSxVQUF1QkEsR0FBVUEsRUFBRUEsS0FBWUEsRUFBRUEsTUFBYUE7UUFDMURHLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLEdBQUdBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLE1BQU1BLENBQUNBO0lBQzlEQSxDQUFDQTtJQUNMSCxhQUFDQTtBQUFEQSxDQW5FQSxBQW1FQ0EsSUFBQTtBQ25FRDtJQUNJSTtJQUVBQyxDQUFDQTtJQUVNRCx1QkFBTUEsR0FBYkEsVUFBY0EsT0FBZ0JBO0lBRTlCRSxDQUFDQTtJQUNMRixhQUFDQTtBQUFEQSxDQVJBLEFBUUNBLElBQUEiLCJmaWxlIjoiZGF0aXVtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZW51bSBMZXZlbCB7XHJcbiAgICBZRUFSLCBNT05USCwgREFURSwgSE9VUiwgTUlOVVRFLCBTRUNPTkQsIE5PTkVcclxufVxyXG5cclxuXHJcbmNsYXNzIERhdGVNYW5hZ2VyIHtcclxuICAgIHByaXZhdGUgb3B0aW9uczpJT3B0aW9ucztcclxuICAgIFxyXG4gICAgcHVibGljIHVwZGF0ZShvcHRpb25zOklPcHRpb25zKSB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdvVG8oZGF0ZTpEYXRlLCBsZXZlbDpMZXZlbCkge1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0RGVmYXVsdERhdGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKCk7XHJcbiAgICB9XHJcbn0iLCIoPGFueT53aW5kb3cpWydEYXRpdW0nXSA9IGNsYXNzIERhdGl1bSB7XHJcbiAgICBwdWJsaWMgdXBkYXRlOihvcHRpb25zOklPcHRpb25zKSA9PiB2b2lkO1xyXG4gICAgY29uc3RydWN0b3IoZWxlbWVudDpIVE1MSW5wdXRFbGVtZW50LCBvcHRpb25zOklPcHRpb25zKSB7XHJcbiAgICAgICAgbGV0IGludGVybmFscyA9IG5ldyBEYXRpdW1JbnRlcm5hbHMoZWxlbWVudCwgb3B0aW9ucyk7XHJcbiAgICAgICAgdGhpcy51cGRhdGUgPSAob3B0aW9uczpJT3B0aW9ucykgPT4gaW50ZXJuYWxzLnVwZGF0ZShvcHRpb25zKTtcclxuICAgIH1cclxufSIsImNsYXNzIERhdGl1bUludGVybmFscyB7XHJcbiAgICBwcml2YXRlIG9wdGlvbnM6SU9wdGlvbnMgPSB7fTtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBpbnB1dDpJbnB1dDtcclxuICAgIHByaXZhdGUgZGF0ZU1hbmFnZXI6RGF0ZU1hbmFnZXI7XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgZWxlbWVudDpIVE1MSW5wdXRFbGVtZW50LCBvcHRpb25zOklPcHRpb25zKSB7XHJcbiAgICAgICAgaWYgKGVsZW1lbnQgPT09IHZvaWQgMCkgdGhyb3cgJ2VsZW1lbnQgaXMgcmVxdWlyZWQnO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuZGF0ZU1hbmFnZXIgPSBuZXcgRGF0ZU1hbmFnZXIoKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmlucHV0ID0gbmV3IElucHV0KGVsZW1lbnQsIHRoaXMuZGF0ZU1hbmFnZXIpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgdGhpcy51cGRhdGUob3B0aW9ucyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB1cGRhdGUobmV3T3B0aW9uczpJT3B0aW9ucyA9IHt9KSB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gT3B0aW9uU2FuaXRpemVyLnNhbml0aXplKG5ld09wdGlvbnMsIHRoaXMub3B0aW9ucyk7ICAgICAgICBcclxuICAgICAgICB0aGlzLmlucHV0LnVwZGF0ZSh0aGlzLm9wdGlvbnMpO1xyXG4gICAgICAgIHRoaXMuZGF0ZU1hbmFnZXIudXBkYXRlKHRoaXMub3B0aW9ucyk7XHJcbiAgICB9XHJcbn0iLCJjbGFzcyBPcHRpb25TYW5pdGl6ZXIge1xyXG4gICAgICAgIFxyXG4gICAgc3RhdGljIHNhbml0aXplRGlzcGxheUFzKGRpc3BsYXlBczpzdHJpbmcsIGRmbHQ6c3RyaW5nID0gJ2g6bW1hIE1NTSBELCBZWVlZJykge1xyXG4gICAgICAgIGlmIChkaXNwbGF5QXMgPT09IHZvaWQgMCkgcmV0dXJuIGRmbHQ7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBkaXNwbGF5QXMgIT09ICdzdHJpbmcnKSB0aHJvdyAnRGlzcGxheSBhcyBtdXN0IGJlIGEgc3RyaW5nJztcclxuICAgICAgICByZXR1cm4gZGlzcGxheUFzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdGF0aWMgc2FuaXRpemUob3B0aW9uczpJT3B0aW9ucywgZGVmYXVsdHM6SU9wdGlvbnMpIHtcclxuICAgICAgICByZXR1cm4gPElPcHRpb25zPntcclxuICAgICAgICAgICAgZGlzcGxheUFzOiBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVEaXNwbGF5QXMob3B0aW9uc1snZGlzcGxheUFzJ10sIGRlZmF1bHRzLmRpc3BsYXlBcylcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJpbnRlcmZhY2UgSURhdGVQYXJ0IHtcclxuICAgIGluY3JlbWVudCgpOnZvaWQ7XHJcbiAgICBkZWNyZW1lbnQoKTp2b2lkO1xyXG4gICAgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpOnZvaWQ7XHJcbiAgICBnZXRWYWx1ZSgpOkRhdGU7XHJcbiAgICBnZXRSZWdFeCgpOlJlZ0V4cDtcclxuICAgIHNldFNlbGVjdGFibGUoc2VsZWN0YWJsZTpib29sZWFuKTpJRGF0ZVBhcnQ7XHJcbiAgICBnZXRMZXZlbCgpOkxldmVsO1xyXG4gICAgaXNTZWxlY3RhYmxlKCk6Ym9vbGVhbjtcclxuICAgIHRvU3RyaW5nKCk6c3RyaW5nO1xyXG59XHJcblxyXG5jbGFzcyBQbGFpblRleHQgaW1wbGVtZW50cyBJRGF0ZVBhcnQge1xyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSB0ZXh0OnN0cmluZykge31cclxuICAgIHB1YmxpYyBpbmNyZW1lbnQoKSB7fVxyXG4gICAgcHVibGljIGRlY3JlbWVudCgpIHt9XHJcbiAgICBwdWJsaWMgc2V0VmFsdWUoKSB7fVxyXG4gICAgcHVibGljIGdldFZhbHVlKCk6RGF0ZSB7IHJldHVybiBudWxsIH1cclxuICAgIHB1YmxpYyBnZXRSZWdFeCgpOlJlZ0V4cCB7IHJldHVybiBudWxsIH1cclxuICAgIHB1YmxpYyBzZXRTZWxlY3RhYmxlKCk6SURhdGVQYXJ0IHsgcmV0dXJuIHRoaXMgfVxyXG4gICAgcHVibGljIGdldExldmVsKCk6TGV2ZWwgeyByZXR1cm4gTGV2ZWwuTk9ORSB9XHJcbiAgICBwdWJsaWMgaXNTZWxlY3RhYmxlKCk6Ym9vbGVhbiB7IHJldHVybiBmYWxzZSB9XHJcbiAgICBwdWJsaWMgdG9TdHJpbmcoKTpzdHJpbmcgeyByZXR1cm4gdGhpcy50ZXh0IH1cclxufVxyXG4gICAgXHJcbmxldCBmb3JtYXRCbG9ja3MgPSAoZnVuY3Rpb24oKSB7XHJcbiAgICBsZXQgZm9ybWF0QmxvY2tzOnsgW2tleTpzdHJpbmddOiBuZXcgKCkgPT4gSURhdGVQYXJ0OyB9ID0ge307XHJcbiAgICAgICAgXHJcbiAgICBjb25zdCBtb250aE5hbWVzOnN0cmluZ1tdID0gW1wiSmFudWFyeVwiLCBcIkZlYnJ1YXJ5XCIsIFwiTWFyY2hcIiwgXCJBcHJpbFwiLCBcIk1heVwiLCBcIkp1bmVcIiwgXCJKdWx5XCIsIFwiQXVndXN0XCIsIFwiU2VwdGVtYmVyXCIsIFwiT2N0b2JlclwiLCBcIk5vdmVtYmVyXCIsIFwiRGVjZW1iZXJcIl07XHJcbiAgICBjb25zdCBkYXlOYW1lczpzdHJpbmdbXSA9IFtcIlN1bmRheVwiLCBcIk1vbmRheVwiLCBcIlR1ZXNkYXlcIiwgXCJXZWRuZXNkYXlcIiwgXCJUaHVyc2RheVwiLCBcIkZyaWRheVwiLCBcIlNhdHVyZGF5XCJdO1xyXG4gICAgXHJcbiAgICBjbGFzcyBEYXRlUGFydCB7XHJcbiAgICAgICAgcHJvdGVjdGVkIGRhdGU6RGF0ZTtcclxuICAgICAgICBwcm90ZWN0ZWQgc2VsZWN0YWJsZTpib29sZWFuID0gdHJ1ZTtcclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0VmFsdWUoKTpEYXRlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0U2VsZWN0YWJsZShzZWxlY3RhYmxlOmJvb2xlYW4pIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RhYmxlID0gc2VsZWN0YWJsZTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBpc1NlbGVjdGFibGUoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGFibGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBmb3JtYXRCbG9ja3NbJ1lZWVknXSA9IGNsYXNzIGV4dGVuZHMgRGF0ZVBhcnQge1xyXG4gICAgICAgIHB1YmxpYyBpbmNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRGdWxsWWVhcih0aGlzLmRhdGUuZ2V0RnVsbFllYXIoKSArIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZGVjcmVtZW50KCkge1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0RnVsbFllYXIodGhpcy5kYXRlLmdldEZ1bGxZZWFyKCkgLSAxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKHZhbHVlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRGdWxsWWVhcihwYXJzZUludCh2YWx1ZSwgMTApKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IHZvaWQgMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXlxcZCskLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldExldmVsKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTGV2ZWwuWUVBUjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kYXRlID09PSB2b2lkIDApIHJldHVybiAnLS0tLSc7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0RnVsbFllYXIoKS50b1N0cmluZygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgZm9ybWF0QmxvY2tzWydNTU0nXSA9IGNsYXNzIGV4dGVuZHMgRGF0ZVBhcnQge1xyXG4gICAgICAgIHB1YmxpYyBpbmNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0TW9udGgoKSArIDE7XHJcbiAgICAgICAgICAgIGlmIChudW0gPiAxMSkgbnVtID0gMDtcclxuICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1vbnRoKG51bSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBkZWNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0TW9udGgoKSAtIDE7XHJcbiAgICAgICAgICAgIGlmIChudW0gPCAwKSBudW0gPSAxMTtcclxuICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1vbnRoKG51bSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBEYXRlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbnVtID0gbW9udGhOYW1lcy5tYXAoKHY6c3RyaW5nKSA9PiB2LnNsaWNlKDAsMykpLmluZGV4T2YodmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1vbnRoKG51bSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cChgXigoJHttb250aE5hbWVzLm1hcCgodjpzdHJpbmcpID0+IHYuc2xpY2UoMCwzKSkuam9pbihcIil8KFwiKX0pKSRgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldExldmVsKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTGV2ZWwuTU9OVEg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZGF0ZSA9PT0gdm9pZCAwKSByZXR1cm4gJy0tLSc7XHJcbiAgICAgICAgICAgIHJldHVybiBtb250aE5hbWVzLm1hcCgodjpzdHJpbmcpID0+IHYuc2xpY2UoMCwzKSlbdGhpcy5kYXRlLmdldE1vbnRoKCldO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgZm9ybWF0QmxvY2tzWydEJ10gPSBjbGFzcyBleHRlbmRzIERhdGVQYXJ0IHtcclxuICAgICAgICBwcml2YXRlIGRheXNJbk1vbnRoKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGUodGhpcy5kYXRlLmdldEZ1bGxZZWFyKCksIHRoaXMuZGF0ZS5nZXRNb250aCgpICsgMSwgMCkuZ2V0RGF0ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgaW5jcmVtZW50KCkge1xyXG4gICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldERhdGUoKSArIDE7XHJcbiAgICAgICAgICAgIGlmIChudW0gPiB0aGlzLmRheXNJbk1vbnRoKCkpIG51bSA9IDE7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXREYXRlKG51bSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBkZWNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0RGF0ZSgpIC0gMTtcclxuICAgICAgICAgICAgaWYgKG51bSA8IDEpIG51bSA9IHRoaXMuZGF5c0luTW9udGgoKTtcclxuICAgICAgICAgICAgdGhpcy5kYXRlLnNldERhdGUobnVtKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKHZhbHVlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkgJiYgcGFyc2VJbnQodmFsdWUsIDEwKSA8IHRoaXMuZGF5c0luTW9udGgoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldERhdGUocGFyc2VJbnQodmFsdWUsIDEwKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL15bMS0zXT9bMC05XSQvO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBMZXZlbC5EQVRFO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGUgPT09IHZvaWQgMCkgcmV0dXJuICctLSc7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0RGF0ZSgpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBmb3JtYXRCbG9ja3NbJ2gnXSA9IGNsYXNzIGV4dGVuZHMgRGF0ZVBhcnQgeyAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGluY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRIb3VycygpICsgMTtcclxuICAgICAgICAgICAgaWYgKG51bSA+IDIzKSBudW0gPSAwO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnMobnVtKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGRlY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRIb3VycygpIC0gMTtcclxuICAgICAgICAgICAgaWYgKG51bSA8IDApIG51bSA9IDIzO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnMobnVtKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKHZhbHVlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3VycyhwYXJzZUludCh2YWx1ZSwgMTApKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IHZvaWQgMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXlsxLTVdP1swLTldJC87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIExldmVsLkhPVVI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZGF0ZSA9PT0gdm9pZCAwKSByZXR1cm4gJy0tJztcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXRIb3VycygpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBmb3JtYXRCbG9ja3NbJ21tJ10gPSBjbGFzcyBleHRlbmRzIERhdGVQYXJ0IHsgICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBpbmNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0TWludXRlcygpICsgMTtcclxuICAgICAgICAgICAgaWYgKG51bSA+IDU5KSBudW0gPSAwO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0TWludXRlcyhudW0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZGVjcmVtZW50KCkge1xyXG4gICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldE1pbnV0ZXMoKSAtIDE7XHJcbiAgICAgICAgICAgIGlmIChudW0gPCAwKSBudW0gPSA1OTtcclxuICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1pbnV0ZXMobnVtKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKHZhbHVlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3VycyhwYXJzZUludCh2YWx1ZSwgMTApKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IHZvaWQgMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXlswLTVdWzAtOV0kLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldExldmVsKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTGV2ZWwuTUlOVVRFO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGUgPT09IHZvaWQgMCkgcmV0dXJuICctLSc7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0TWludXRlcygpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBmb3JtYXRCbG9ja3NbJ0EnXSA9IGNsYXNzIGV4dGVuZHMgRGF0ZVBhcnQgeyAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGluY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRIb3VycygpICsgMTI7XHJcbiAgICAgICAgICAgIGlmIChudW0gPiAyMykgbnVtIC09IDI0O1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnMobnVtKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGRlY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRIb3VycygpIC0gMTI7XHJcbiAgICAgICAgICAgIGlmIChudW0gPCAwKSBudW0gKz0gMjQ7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3VycyhudW0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHRoaXMuZ2V0UmVnRXgoKS50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlLnRvTG93ZXJDYXNlKCkgPT09ICdhbScgJiYgdGhpcy5kYXRlLmdldEhvdXJzKCkgPiAxMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3Vycyh0aGlzLmRhdGUuZ2V0SG91cnMoKSAtIDEyKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWUudG9Mb3dlckNhc2UoKSA9PT0gJ3BtJyAmJiB0aGlzLmRhdGUuZ2V0SG91cnMoKSA8IDEyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldEhvdXJzKHRoaXMuZGF0ZS5nZXRIb3VycygpICsgMTIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldEhvdXJzKHBhcnNlSW50KHZhbHVlLCAxMCkpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gdm9pZCAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIExldmVsLkhPVVI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eKChBTSl8KFBNKSkkLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kYXRlID09PSB2b2lkIDApIHJldHVybiAnLS0nO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldEhvdXJzKCkgPCAxMiA/ICdBTScgOiAnUE0nO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgZm9ybWF0QmxvY2tzWydhJ10gPSBjbGFzcyBleHRlbmRzIGZvcm1hdEJsb2Nrc1snQSddIHtcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXigoYW0pfChwbSkpJC87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJldHVybiBmb3JtYXRCbG9ja3M7XHJcbn0pKCk7XHJcblxyXG5cclxuIiwiY2xhc3MgSW5wdXQge1xyXG4gICAgcHJpdmF0ZSBvcHRpb25zOklPcHRpb25zO1xyXG4gICAgcHJpdmF0ZSBkYXRlUGFydHM6SURhdGVQYXJ0W107XHJcbiAgICBwcml2YXRlIHNlbGVjdGVkRGF0ZVBhcnQ6SURhdGVQYXJ0O1xyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZWxlbWVudDpIVE1MSW5wdXRFbGVtZW50LCBwcml2YXRlIGRhdGVNYW5hZ2VyOkRhdGVNYW5hZ2VyKSB7XHJcbiAgICAgICAgbmV3IEtleWJvYXJkRXZlbnRIYW5kbGVyKHRoaXMsIGRhdGVNYW5hZ2VyKTtcclxuICAgICAgICBuZXcgTW91c2VFdmVudEhhbmRsZXIodGhpcyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRGaXJzdFNlbGVjdGFibGVEYXRlUGFydCgpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZGF0ZVBhcnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGVQYXJ0c1tpXS5pc1NlbGVjdGFibGUoKSlcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGVQYXJ0c1tpXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZvaWQgMDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0TGFzdFNlbGVjdGFibGVEYXRlUGFydCgpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gdGhpcy5kYXRlUGFydHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZGF0ZVBhcnRzW2ldLmlzU2VsZWN0YWJsZSgpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZVBhcnRzW2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdm9pZCAwO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0TmV4dFNlbGVjdGFibGVEYXRlUGFydCgpIHtcclxuICAgICAgICBsZXQgaSA9IHRoaXMuZGF0ZVBhcnRzLmluZGV4T2YodGhpcy5zZWxlY3RlZERhdGVQYXJ0KTtcclxuICAgICAgICB3aGlsZSAoKytpIDwgdGhpcy5kYXRlUGFydHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGVQYXJ0c1tpXS5pc1NlbGVjdGFibGUoKSlcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGVQYXJ0c1tpXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWREYXRlUGFydDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldFByZXZpb3VzU2VsZWN0YWJsZURhdGVQYXJ0KCkge1xyXG4gICAgICAgIGxldCBpID0gdGhpcy5kYXRlUGFydHMuaW5kZXhPZih0aGlzLnNlbGVjdGVkRGF0ZVBhcnQpO1xyXG4gICAgICAgIHdoaWxlICgtLWkgPj0gMCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kYXRlUGFydHNbaV0uaXNTZWxlY3RhYmxlKCkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlUGFydHNbaV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQ7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXROZWFyZXN0U2VsZWN0YWJsZURhdGVQYXJ0KHBvczpudW1iZXIpIHsgICAgICAgIFxyXG4gICAgICAgIGxldCBkaXN0YW5jZTpudW1iZXIgPSBOdW1iZXIuTUFYX1ZBTFVFO1xyXG4gICAgICAgIGxldCBuZWFyZXN0RGF0ZVBhcnQ6SURhdGVQYXJ0O1xyXG4gICAgICAgIGxldCBzdGFydCA9IDA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmRhdGVQYXJ0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgZGF0ZVBhcnQgPSB0aGlzLmRhdGVQYXJ0c1tpXTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChkYXRlUGFydC5pc1NlbGVjdGFibGUoKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGZyb21MZWZ0ID0gcG9zIC0gc3RhcnQ7XHJcbiAgICAgICAgICAgICAgICBsZXQgZnJvbVJpZ2h0ID0gcG9zIC0gKHN0YXJ0ICsgZGF0ZVBhcnQudG9TdHJpbmcoKS5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZiAoZnJvbUxlZnQgPiAwICYmIGZyb21SaWdodCA8IDApIHJldHVybiBkYXRlUGFydDtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgbGV0IGQgPSBNYXRoLm1pbihNYXRoLmFicyhmcm9tTGVmdCksIE1hdGguYWJzKGZyb21SaWdodCkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGQgPD0gZGlzdGFuY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBuZWFyZXN0RGF0ZVBhcnQgPSBkYXRlUGFydDtcclxuICAgICAgICAgICAgICAgICAgICBkaXN0YW5jZSA9IGQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHN0YXJ0ICs9IGRhdGVQYXJ0LnRvU3RyaW5nKCkubGVuZ3RoO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gbmVhcmVzdERhdGVQYXJ0OyAgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBzZXRTZWxlY3RlZERhdGVQYXJ0KGRhdGVQYXJ0OklEYXRlUGFydCkge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWREYXRlUGFydCA9IGRhdGVQYXJ0O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0U2VsZWN0ZWREYXRlUGFydCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZERhdGVQYXJ0O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdXBkYXRlKG9wdGlvbnM6SU9wdGlvbnMpIHtcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuZGF0ZVBhcnRzID0gUGFyc2VyLnBhcnNlKG9wdGlvbnMuZGlzcGxheUFzKTtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQgPSB2b2lkIDA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy51cGRhdGVWaWV3KCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB1cGRhdGVWaWV3KCkge1xyXG4gICAgICAgIGxldCBkYXRlU3RyaW5nID0gJyc7XHJcbiAgICAgICAgdGhpcy5kYXRlUGFydHMuZm9yRWFjaCgoZGF0ZVBhcnQpID0+IHtcclxuICAgICAgICAgICAgZGF0ZVN0cmluZyArPSBkYXRlUGFydC50b1N0cmluZygpOyBcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQudmFsdWUgPSBkYXRlU3RyaW5nO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkRGF0ZVBhcnQgPT09IHZvaWQgMCkgcmV0dXJuO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBzdGFydCA9IDA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGkgPSAwO1xyXG4gICAgICAgIHdoaWxlICh0aGlzLmRhdGVQYXJ0c1tpXSAhPT0gdGhpcy5zZWxlY3RlZERhdGVQYXJ0KSB7XHJcbiAgICAgICAgICAgIHN0YXJ0ICs9IHRoaXMuZGF0ZVBhcnRzW2krK10udG9TdHJpbmcoKS5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBlbmQgPSBzdGFydCArIHRoaXMuc2VsZWN0ZWREYXRlUGFydC50b1N0cmluZygpLmxlbmd0aDtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc2V0U2VsZWN0aW9uUmFuZ2Uoc3RhcnQsIGVuZCk7XHJcbiAgICB9XHJcbn0iLCJjb25zdCBlbnVtIEtFWSB7XHJcbiAgICBSSUdIVCA9IDM5LCBMRUZUID0gMzcsIFRBQiA9IDksIFVQID0gMzgsXHJcbiAgICBET1dOID0gNDAsIFYgPSA4NiwgQyA9IDY3LCBBID0gNjUsIEhPTUUgPSAzNixcclxuICAgIEVORCA9IDM1LCBCQUNLU1BBQ0UgPSA4XHJcbn1cclxuXHJcbmNsYXNzIEtleWJvYXJkRXZlbnRIYW5kbGVyIHtcclxuICAgIHByaXZhdGUgc2hpZnRUYWJEb3duID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIHRhYkRvd24gPSBmYWxzZTtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBpbnB1dDpJbnB1dCwgcHJpdmF0ZSBkYXRlTWFuYWdlcjpEYXRlTWFuYWdlcikge1xyXG4gICAgICAgIGlucHV0LmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgKGUpID0+IHRoaXMua2V5ZG93bihlKSk7XHJcbiAgICAgICAgaW5wdXQuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiZm9jdXNcIiwgKCkgPT4gdGhpcy5mb2N1cygpKTtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoZSkgPT4gdGhpcy5kb2N1bWVudEtleWRvd24oZSkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZm9jdXMgPSAoKTp2b2lkID0+IHtcclxuICAgICAgICBpZiAodGhpcy50YWJEb3duKSB7XHJcbiAgICAgICAgICAgIGxldCBmaXJzdCA9IHRoaXMuaW5wdXQuZ2V0Rmlyc3RTZWxlY3RhYmxlRGF0ZVBhcnQoKTtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC5zZXRTZWxlY3RlZERhdGVQYXJ0KGZpcnN0KTtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgIHRoaXMuaW5wdXQudXBkYXRlVmlldygpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc2hpZnRUYWJEb3duKSB7XHJcbiAgICAgICAgICAgIGxldCBsYXN0ID0gdGhpcy5pbnB1dC5nZXRMYXN0U2VsZWN0YWJsZURhdGVQYXJ0KCk7XHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChsYXN0KTtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgIHRoaXMuaW5wdXQudXBkYXRlVmlldygpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgZG9jdW1lbnRLZXlkb3duKGU6S2V5Ym9hcmRFdmVudCkge1xyXG4gICAgICAgIGlmIChlLnNoaWZ0S2V5ICYmIGUua2V5Q29kZSA9PT0gS0VZLlRBQikge1xyXG4gICAgICAgICAgICB0aGlzLnNoaWZ0VGFiRG93biA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIGlmIChlLmtleUNvZGUgPT09IEtFWS5UQUIpIHtcclxuICAgICAgICAgICAgdGhpcy50YWJEb3duID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hpZnRUYWJEb3duID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMudGFiRG93biA9IGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGtleWRvd24oZTpLZXlib2FyZEV2ZW50KSB7XHJcbiAgICAgICAgbGV0IGNvZGUgPSBlLmtleUNvZGU7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKChjb2RlID09PSBLRVkuSE9NRSB8fCBjb2RlID09PSBLRVkuRU5EKSAmJiBlLnNoaWZ0S2V5KSByZXR1cm47XHJcbiAgICAgICAgaWYgKChjb2RlID09PSBLRVkuTEVGVCB8fCBjb2RlID09PSBLRVkuUklHSFQpICYmIGUuc2hpZnRLZXkpIHJldHVybjtcclxuICAgICAgICBpZiAoKGNvZGUgPT09IEtFWS5DIHx8IGNvZGUgPT09IEtFWS5BIHx8IGNvZGUgPT09IEtFWS5WKSAmJiBlLmN0cmxLZXkpIHJldHVybjtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgcHJldmVudERlZmF1bHQgPSB0cnVlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChjb2RlID09PSBLRVkuSE9NRSkge1xyXG4gICAgICAgICAgICB0aGlzLmhvbWUoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IEtFWS5FTkQpIHtcclxuICAgICAgICAgICAgdGhpcy5lbmQoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IEtFWS5MRUZUKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGVmdCgpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gS0VZLlJJR0hUKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmlnaHQoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IEtFWS5UQUIgJiYgZS5zaGlmdEtleSkge1xyXG4gICAgICAgICAgICBwcmV2ZW50RGVmYXVsdCA9IHRoaXMuc2hpZnRUYWIoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IEtFWS5UQUIpIHtcclxuICAgICAgICAgICAgcHJldmVudERlZmF1bHQgPSB0aGlzLnRhYigpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gS0VZLlVQKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXAoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IEtFWS5ET1dOKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZG93bigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZiAocHJldmVudERlZmF1bHQpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBob21lKCkge1xyXG4gICAgICAgIGxldCBmaXJzdCA9IHRoaXMuaW5wdXQuZ2V0Rmlyc3RTZWxlY3RhYmxlRGF0ZVBhcnQoKTtcclxuICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQoZmlyc3QpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGVuZCgpIHtcclxuICAgICAgICBsZXQgbGFzdCA9IHRoaXMuaW5wdXQuZ2V0TGFzdFNlbGVjdGFibGVEYXRlUGFydCgpO1xyXG4gICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChsYXN0KTsgICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGxlZnQoKSB7XHJcbiAgICAgICAgbGV0IHByZXZpb3VzID0gdGhpcy5pbnB1dC5nZXRQcmV2aW91c1NlbGVjdGFibGVEYXRlUGFydCgpO1xyXG4gICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChwcmV2aW91cyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgcmlnaHQoKSB7XHJcbiAgICAgICAgbGV0IG5leHQgPSB0aGlzLmlucHV0LmdldE5leHRTZWxlY3RhYmxlRGF0ZVBhcnQoKTtcclxuICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQobmV4dCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgc2hpZnRUYWIoKSB7XHJcbiAgICAgICAgbGV0IHByZXZpb3VzID0gdGhpcy5pbnB1dC5nZXRQcmV2aW91c1NlbGVjdGFibGVEYXRlUGFydCgpO1xyXG4gICAgICAgIGlmIChwcmV2aW91cyAhPT0gdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkpIHtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC5zZXRTZWxlY3RlZERhdGVQYXJ0KHByZXZpb3VzKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSB0YWIoKSB7XHJcbiAgICAgICAgbGV0IG5leHQgPSB0aGlzLmlucHV0LmdldE5leHRTZWxlY3RhYmxlRGF0ZVBhcnQoKTtcclxuICAgICAgICBpZiAobmV4dCAhPT0gdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkpIHtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC5zZXRTZWxlY3RlZERhdGVQYXJ0KG5leHQpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHVwKCkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXQuZ2V0U2VsZWN0ZWREYXRlUGFydCgpLmluY3JlbWVudCgpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuc2V0VmFsdWUodGhpcy5kYXRlTWFuYWdlci5nZXREZWZhdWx0RGF0ZSgpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGxldmVsID0gdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0TGV2ZWwoKTtcclxuICAgICAgICBsZXQgZGF0ZSA9IHRoaXMuaW5wdXQuZ2V0U2VsZWN0ZWREYXRlUGFydCgpLmdldFZhbHVlKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5kYXRlTWFuYWdlci5nb1RvKGRhdGUsIGxldmVsKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBkb3duKCkge1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG59IiwiY2xhc3MgTW91c2VFdmVudEhhbmRsZXIge1xyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBpbnB1dDpJbnB1dCkge1xyXG4gICAgICAgIGlucHV0LmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgKCkgPT4gdGhpcy5tb3VzZWRvd24oKSk7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgKCkgPT4gdGhpcy5tb3VzZXVwKCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFN0b3AgZGVmYXVsdFxyXG4gICAgICAgIGlucHV0LmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdlbnRlclwiLCAoZSkgPT4gZS5wcmV2ZW50RGVmYXVsdCgpKTtcclxuICAgICAgICBpbnB1dC5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnb3ZlclwiLCAoZSkgPT4gZS5wcmV2ZW50RGVmYXVsdCgpKTtcclxuICAgICAgICBpbnB1dC5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkcm9wXCIsIChlKSA9PiBlLnByZXZlbnREZWZhdWx0KCkpO1xyXG4gICAgICAgIGlucHV0LmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImN1dFwiLCAoZSkgPT4gZS5wcmV2ZW50RGVmYXVsdCgpKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBkb3duOmJvb2xlYW47XHJcbiAgICBwcml2YXRlIGNhcmV0U3RhcnQ6bnVtYmVyO1xyXG4gICAgXHJcbiAgICBwcml2YXRlIG1vdXNlZG93bigpIHtcclxuICAgICAgICB0aGlzLmRvd24gPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuaW5wdXQuZWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZSh2b2lkIDAsIHZvaWQgMCk7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgdGhpcy5jYXJldFN0YXJ0ID0gdGhpcy5pbnB1dC5lbGVtZW50LnNlbGVjdGlvblN0YXJ0OyBcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBtb3VzZXVwID0gKCkgPT4ge1xyXG4gICAgICAgIGlmICghdGhpcy5kb3duKSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5kb3duID0gZmFsc2U7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHBvczpudW1iZXI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMuaW5wdXQuZWxlbWVudC5zZWxlY3Rpb25TdGFydCA9PT0gdGhpcy5jYXJldFN0YXJ0KSB7XHJcbiAgICAgICAgICAgIHBvcyA9IHRoaXMuaW5wdXQuZWxlbWVudC5zZWxlY3Rpb25FbmQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcG9zID0gdGhpcy5pbnB1dC5lbGVtZW50LnNlbGVjdGlvblN0YXJ0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBsZXQgYmxvY2sgPSB0aGlzLmlucHV0LmdldE5lYXJlc3RTZWxlY3RhYmxlRGF0ZVBhcnQocG9zKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQoYmxvY2spO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLmlucHV0LmVsZW1lbnQuc2VsZWN0aW9uU3RhcnQgPiAwIHx8IHRoaXMuaW5wdXQuZWxlbWVudC5zZWxlY3Rpb25FbmQgPCB0aGlzLmlucHV0LmVsZW1lbnQudmFsdWUubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXQudXBkYXRlVmlldygpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn0iLCJjbGFzcyBQYXJzZXIge1xyXG4gICAgcHVibGljIHN0YXRpYyBwYXJzZShmb3JtYXQ6c3RyaW5nKTpJRGF0ZVBhcnRbXSB7XHJcbiAgICAgICAgbGV0IHRleHRCdWZmZXIgPSAnJztcclxuICAgICAgICBsZXQgZGF0ZVBhcnRzOklEYXRlUGFydFtdID0gW107XHJcbiAgICBcclxuICAgICAgICBsZXQgaW5kZXggPSAwOyAgICAgICAgICAgICAgICBcclxuICAgICAgICBsZXQgaW5Fc2NhcGVkU2VnbWVudCA9IGZhbHNlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBwdXNoUGxhaW5UZXh0ID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGV4dEJ1ZmZlci5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBkYXRlUGFydHMucHVzaChuZXcgUGxhaW5UZXh0KHRleHRCdWZmZXIpLnNldFNlbGVjdGFibGUoZmFsc2UpKTtcclxuICAgICAgICAgICAgICAgIHRleHRCdWZmZXIgPSAnJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB3aGlsZSAoaW5kZXggPCBmb3JtYXQubGVuZ3RoKSB7ICAgICBcclxuICAgICAgICAgICAgaWYgKCFpbkVzY2FwZWRTZWdtZW50ICYmIGZvcm1hdFtpbmRleF0gPT09ICdbJykge1xyXG4gICAgICAgICAgICAgICAgaW5Fc2NhcGVkU2VnbWVudCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChpbkVzY2FwZWRTZWdtZW50ICYmIGZvcm1hdFtpbmRleF0gPT09ICddJykge1xyXG4gICAgICAgICAgICAgICAgaW5Fc2NhcGVkU2VnbWVudCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaW5kZXgrKztcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoaW5Fc2NhcGVkU2VnbWVudCkge1xyXG4gICAgICAgICAgICAgICAgdGV4dEJ1ZmZlciArPSBmb3JtYXRbaW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgaW5kZXgrKztcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgZm91bmQgPSBmYWxzZTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGZvciAobGV0IGNvZGUgaW4gZm9ybWF0QmxvY2tzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoUGFyc2VyLmZpbmRBdChmb3JtYXQsIGluZGV4LCBgeyR7Y29kZX19YCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBwdXNoUGxhaW5UZXh0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZVBhcnRzLnB1c2gobmV3IGZvcm1hdEJsb2Nrc1tjb2RlXSgpLnNldFNlbGVjdGFibGUoZmFsc2UpKTtcclxuICAgICAgICAgICAgICAgICAgICBpbmRleCArPSBjb2RlLmxlbmd0aCArIDI7XHJcbiAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChQYXJzZXIuZmluZEF0KGZvcm1hdCwgaW5kZXgsIGNvZGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHVzaFBsYWluVGV4dCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGVQYXJ0cy5wdXNoKG5ldyBmb3JtYXRCbG9ja3NbY29kZV0oKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggKz0gY29kZS5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoIWZvdW5kKSB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0QnVmZmVyICs9IGZvcm1hdFtpbmRleF07XHJcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdXNoUGxhaW5UZXh0KCk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICByZXR1cm4gZGF0ZVBhcnRzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHN0YXRpYyBmaW5kQXQgKHN0cjpzdHJpbmcsIGluZGV4Om51bWJlciwgc2VhcmNoOnN0cmluZykge1xyXG4gICAgICAgIHJldHVybiBzdHIuc2xpY2UoaW5kZXgsIGluZGV4ICsgc2VhcmNoLmxlbmd0aCkgPT09IHNlYXJjaDtcclxuICAgIH1cclxufSIsImNsYXNzIFBpY2tlciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHVwZGF0ZShvcHRpb25zOklPcHRpb25zKSB7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbn1cclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
