(function(){
window['Datium'] = (function () {
    function Datium(element, options) {
        var internals = new DatiumInternals(element, options);
        this.updateOptions = function (options) { return internals.updateOptions(options); };
    }
    return Datium;
})();
var Level = (function () {
    function Level() {
    }
    Level.YEAR = 0;
    Level.MONTH = 1;
    Level.DATE = 2;
    Level.HOUR = 3;
    Level.MINUTE = 4;
    Level.SECOND = 5;
    Level.NONE = 6;
    return Level;
})();
var DatiumInternals = (function () {
    function DatiumInternals(element, options) {
        var _this = this;
        this.element = element;
        this.options = {};
        if (element === void 0)
            throw 'element is required';
        element.setAttribute('spellcheck', 'false');
        this.input = new Input(element);
        this.updateOptions(options);
        listen.goto(element, function (e) { return _this.goto(e.date, e.level); });
        this.goto(this.options['defaultDate'], Level.NONE);
    }
    DatiumInternals.prototype.goto = function (date, level) {
        if (date === void 0)
            date = new Date();
        if (this.options.minDate !== void 0 && date.valueOf() < this.options.minDate.valueOf()) {
            date = new Date(this.options.minDate.valueOf());
        }
        if (this.options.maxDate !== void 0 && date.valueOf() > this.options.maxDate.valueOf()) {
            date = new Date(this.options.maxDate.valueOf());
        }
        trigger.viewchanged(this.element, {
            date: date,
            level: level
        });
    };
    DatiumInternals.prototype.updateOptions = function (newOptions) {
        if (newOptions === void 0) { newOptions = {}; }
        this.options = OptionSanitizer.sanitize(newOptions, this.options);
        this.input.updateOptions(this.options);
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
    OptionSanitizer.sanitizeMinDate = function (minDate, dflt) {
        if (dflt === void 0) { dflt = void 0; }
        if (minDate === void 0)
            return dflt;
        return new Date(minDate); //TODO figure this out yes
    };
    OptionSanitizer.sanitizeMaxDate = function (maxDate, dflt) {
        if (dflt === void 0) { dflt = void 0; }
        if (maxDate === void 0)
            return dflt;
        return new Date(maxDate); //TODO figure this out 
    };
    OptionSanitizer.sanitizeDefaultDate = function (defaultDate, dflt) {
        if (dflt === void 0) { dflt = this.dfltDate; }
        if (defaultDate === void 0)
            return dflt;
        return new Date(defaultDate); //TODO figure this out
    };
    OptionSanitizer.sanitize = function (options, defaults) {
        return {
            displayAs: OptionSanitizer.sanitizeDisplayAs(options['displayAs'], defaults.displayAs),
            minDate: OptionSanitizer.sanitizeMinDate(options['minDate'], defaults.minDate),
            maxDate: OptionSanitizer.sanitizeMaxDate(options['maxDate'], defaults.maxDate),
            defaultDate: OptionSanitizer.sanitizeDefaultDate(options['defaultDate'], defaults.defaultDate)
        };
    };
    OptionSanitizer.dfltDate = new Date();
    return OptionSanitizer;
})();
CustomEvent = (function () {
    function useNative() {
        try {
            var customEvent = new CustomEvent('a', { detail: { b: 'b' } });
            return 'a' === customEvent.type && 'b' === customEvent.detail.b;
        }
        catch (e) {
        }
        return false;
    }
    if (useNative()) {
        return CustomEvent;
    }
    else if (typeof document.createEvent === 'function') {
        // IE >= 9
        return function (type, params) {
            var e = document.createEvent('CustomEvent');
            if (params) {
                e.initCustomEvent(type, params.bubbles, params.cancelable, params.detail);
            }
            else {
                e.initCustomEvent(type, false, false, void 0);
            }
            return e;
        };
    }
    else {
        // IE >= 8
        return function (type, params) {
            var e = document.createEventObject();
            e.type = type;
            if (params) {
                e.bubbles = Boolean(params.bubbles);
                e.cancelable = Boolean(params.cancelable);
                e.detail = params.detail;
            }
            else {
                e.bubbles = false;
                e.cancelable = false;
                e.detail = void 0;
            }
            return e;
        };
    }
})();
var listen;
(function (listen) {
    function attachEvents(events, element, callback) {
        var listeners = [];
        events.forEach(function (event) {
            listeners.push({
                element: element,
                reference: callback,
                event: event
            });
            element.addEventListener(event, callback);
        });
        return listeners;
    }
    // NATIVE
    function focus(element, callback) {
        return attachEvents(['focus'], element, function (e) {
            callback(e);
        });
    }
    listen.focus = focus;
    function mousedown(element, callback) {
        return attachEvents(['mousedown'], element, function (e) {
            callback(e);
        });
    }
    listen.mousedown = mousedown;
    function mouseup(element, callback) {
        return attachEvents(['mouseup'], element, function (e) {
            callback(e);
        });
    }
    listen.mouseup = mouseup;
    function paste(element, callback) {
        return attachEvents(['paste'], element, function (e) {
            callback(e);
        });
    }
    listen.paste = paste;
    // CUSTOM
    function goto(element, callback) {
        return attachEvents(['datium-goto'], element, function (e) {
            callback(e.detail);
        });
    }
    listen.goto = goto;
    function viewchanged(element, callback) {
        return attachEvents(['datium-viewchanged'], element, function (e) {
            callback(e.detail);
        });
    }
    listen.viewchanged = viewchanged;
    function removeListeners(listeners) {
        listeners.forEach(function (listener) {
            listener.element.removeEventListener(listener.event, listener.reference);
        });
    }
    listen.removeListeners = removeListeners;
})(listen || (listen = {}));
var trigger;
(function (trigger) {
    function goto(element, data) {
        element.dispatchEvent(new CustomEvent('datium-goto', {
            bubbles: false,
            cancelable: true,
            detail: data
        }));
    }
    trigger.goto = goto;
    function viewchanged(element, data) {
        element.dispatchEvent(new CustomEvent('datium-viewchanged', {
            bubbles: false,
            cancelable: true,
            detail: data
        }));
    }
    trigger.viewchanged = viewchanged;
})(trigger || (trigger = {}));
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
    PlainText.prototype.setValueFromPartial = function () { return false; };
    PlainText.prototype.setValue = function () { return false; };
    PlainText.prototype.getValue = function () { return null; };
    PlainText.prototype.getRegEx = function () { return new RegExp("[" + this.text + "]"); };
    PlainText.prototype.setSelectable = function (selectable) { return this; };
    PlainText.prototype.getMaxBuffer = function () { return 0; };
    PlainText.prototype.getLevel = function () { return Level.NONE; };
    PlainText.prototype.isSelectable = function () { return false; };
    PlainText.prototype.toString = function () { return this.text; };
    return PlainText;
})();
var formatBlocks = (function () {
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
        DatePart.prototype.pad = function (num, size) {
            if (size === void 0) { size = 2; }
            var str = num.toString();
            while (str.length < size)
                str = '0' + str;
            return str;
        };
        return DatePart;
    })();
    var FourDigitYear = (function (_super) {
        __extends(FourDigitYear, _super);
        function FourDigitYear() {
            _super.apply(this, arguments);
        }
        FourDigitYear.prototype.increment = function () {
            this.date.setFullYear(this.date.getFullYear() + 1);
        };
        FourDigitYear.prototype.decrement = function () {
            this.date.setFullYear(this.date.getFullYear() - 1);
        };
        FourDigitYear.prototype.setValueFromPartial = function (partial) {
            if (this.getRegEx().test(partial)) {
                return this.setValue(partial);
            }
            else {
                return false;
            }
        };
        FourDigitYear.prototype.setValue = function (value) {
            if (typeof value === 'object') {
                this.date = new Date(value.valueOf());
                return true;
            }
            else if (typeof value === 'string' && this.getRegEx().test(value)) {
                this.date.setFullYear(parseInt(value, 10));
                return true;
            }
            return false;
        };
        FourDigitYear.prototype.getRegEx = function () {
            return /^-?\d{1,4}$/;
        };
        FourDigitYear.prototype.getMaxBuffer = function () {
            return 4;
        };
        FourDigitYear.prototype.getLevel = function () {
            return Level.YEAR;
        };
        FourDigitYear.prototype.toString = function () {
            return this.date.getFullYear().toString();
        };
        return FourDigitYear;
    })(DatePart);
    var TwoDigitYear = (function (_super) {
        __extends(TwoDigitYear, _super);
        function TwoDigitYear() {
            _super.apply(this, arguments);
        }
        TwoDigitYear.prototype.getMaxBuffer = function () {
            return 2;
        };
        TwoDigitYear.prototype.setValue = function (value) {
            if (typeof value === 'object') {
                this.date = new Date(value.valueOf());
                return true;
            }
            else if (typeof value === 'string' && this.getRegEx().test(value)) {
                var base = Math.floor(_super.prototype.getValue.call(this).getFullYear() / 100) * 100;
                this.date.setFullYear(parseInt(value, 10) + base);
                return true;
            }
            return false;
        };
        TwoDigitYear.prototype.getRegEx = function () {
            return /^\-?d{1,2}$/;
        };
        TwoDigitYear.prototype.toString = function () {
            return _super.prototype.toString.call(this).slice(-2);
        };
        return TwoDigitYear;
    })(FourDigitYear);
    var LongMonthName = (function (_super) {
        __extends(LongMonthName, _super);
        function LongMonthName() {
            _super.apply(this, arguments);
        }
        LongMonthName.prototype.getMonths = function () {
            return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        };
        LongMonthName.prototype.increment = function () {
            var num = this.date.getMonth() + 1;
            if (num > 11)
                num = 0;
            this.date.setMonth(num);
            while (this.date.getMonth() > num) {
                this.date.setDate(this.date.getDate() - 1);
            }
        };
        LongMonthName.prototype.decrement = function () {
            var num = this.date.getMonth() - 1;
            if (num < 0)
                num = 11;
            this.date.setMonth(num);
        };
        LongMonthName.prototype.setValueFromPartial = function (partial) {
            var month = this.getMonths().filter(function (month) {
                return new RegExp("^" + partial + ".*$", 'i').test(month);
            })[0];
            if (month !== void 0) {
                return this.setValue(month);
            }
            return false;
        };
        LongMonthName.prototype.setValue = function (value) {
            if (typeof value === 'object') {
                this.date = new Date(value.valueOf());
                return true;
            }
            else if (typeof value === 'string' && this.getRegEx().test(value)) {
                var num = this.getMonths().indexOf(value);
                this.date.setMonth(num);
                return true;
            }
            return false;
        };
        LongMonthName.prototype.getRegEx = function () {
            return new RegExp("^((" + this.getMonths().join(")|(") + "))$", 'i');
        };
        LongMonthName.prototype.getMaxBuffer = function () {
            return 3;
        };
        LongMonthName.prototype.getLevel = function () {
            return Level.MONTH;
        };
        LongMonthName.prototype.toString = function () {
            return this.getMonths()[this.date.getMonth()];
        };
        return LongMonthName;
    })(DatePart);
    var ShortMonthName = (function (_super) {
        __extends(ShortMonthName, _super);
        function ShortMonthName() {
            _super.apply(this, arguments);
        }
        ShortMonthName.prototype.getMonths = function () {
            return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        };
        return ShortMonthName;
    })(LongMonthName);
    var Month = (function (_super) {
        __extends(Month, _super);
        function Month() {
            _super.apply(this, arguments);
        }
        Month.prototype.getMaxBuffer = function () {
            return 2;
        };
        Month.prototype.setValueFromPartial = function (partial) {
            if (/^\d{1,2}$/.test(partial)) {
                return this.setValue(partial);
            }
            return false;
        };
        Month.prototype.setValue = function (value) {
            if (typeof value === 'object') {
                this.date = new Date(value.valueOf());
                return true;
            }
            else if (typeof value === 'string' && this.getRegEx().test(value)) {
                this.date.setMonth(parseInt(value, 10));
                return true;
            }
            return false;
        };
        Month.prototype.getRegEx = function () {
            return /^([1-9]|(1[0-2]))$/;
        };
        Month.prototype.toString = function () {
            return this.date.getMonth().toString();
        };
        return Month;
    })(LongMonthName);
    var PaddedMonth = (function (_super) {
        __extends(PaddedMonth, _super);
        function PaddedMonth() {
            _super.apply(this, arguments);
        }
        PaddedMonth.prototype.getRegEx = function () {
            return /^(0[1-9])|(1[0-2])$/;
        };
        PaddedMonth.prototype.setValueFromPartial = function (partial) {
            if (/^\d{1,2}$/.test(partial)) {
                return this.setValue(this.pad(parseInt(partial, 10)));
            }
        };
        PaddedMonth.prototype.toString = function () {
            return this.pad(this.date.getMonth());
        };
        return PaddedMonth;
    })(Month);
    var DateNumeral = (function (_super) {
        __extends(DateNumeral, _super);
        function DateNumeral() {
            _super.apply(this, arguments);
        }
        DateNumeral.prototype.daysInMonth = function () {
            return new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0).getDate();
        };
        DateNumeral.prototype.increment = function () {
            var num = this.date.getDate() + 1;
            if (num > this.daysInMonth())
                num = 1;
            this.date.setDate(num);
        };
        DateNumeral.prototype.decrement = function () {
            var num = this.date.getDate() - 1;
            if (num < 1)
                num = this.daysInMonth();
            this.date.setDate(num);
        };
        DateNumeral.prototype.setValueFromPartial = function (partial) {
            if (/^\d{1,2}$/.test(partial) && parseInt(partial, 10) < this.daysInMonth()) {
                return this.setValue(parseInt(partial, 10).toString());
            }
            return false;
        };
        DateNumeral.prototype.setValue = function (value) {
            if (typeof value === 'object') {
                this.date = new Date(value.valueOf());
                return true;
            }
            else if (typeof value === 'string' && this.getRegEx().test(value) && parseInt(value, 10) < this.daysInMonth()) {
                this.date.setDate(parseInt(value, 10));
                return true;
            }
            return false;
        };
        DateNumeral.prototype.getRegEx = function () {
            return /^[1-3]?[0-9]$/;
        };
        DateNumeral.prototype.getMaxBuffer = function () {
            return 2;
        };
        DateNumeral.prototype.getLevel = function () {
            return Level.DATE;
        };
        DateNumeral.prototype.toString = function () {
            return this.date.getDate().toString();
        };
        return DateNumeral;
    })(DatePart);
    var PaddedDate = (function (_super) {
        __extends(PaddedDate, _super);
        function PaddedDate() {
            _super.apply(this, arguments);
        }
        PaddedDate.prototype.setValueFromPartial = function (partial) {
            if (/^d{1,2}$/.test(partial) && parseInt(partial, 10) < this.daysInMonth()) {
                return this.setValue(this.pad(parseInt(partial, 10)));
            }
            return false;
        };
        PaddedDate.prototype.getRegEx = function () {
            return /^[0-3][0-9]$/;
        };
        PaddedDate.prototype.toString = function () {
            return this.pad(this.date.getDate());
        };
        return PaddedDate;
    })(DateNumeral);
    var DateOrdinal = (function (_super) {
        __extends(DateOrdinal, _super);
        function DateOrdinal() {
            _super.apply(this, arguments);
        }
        DateOrdinal.prototype.getRegEx = function () {
            return /^[1-3]?[0-9]((st)|(nd)|(rd)|(th))$/i;
        };
        DateOrdinal.prototype.toString = function () {
            var date = this.date.getDate();
            var j = date % 10;
            var k = date % 100;
            if (j == 1 && k != 11)
                return date + "st";
            if (j == 2 && k != 12)
                return date + "nd";
            if (j == 3 && k != 13)
                return date + "rd";
            return date + "th";
        };
        return DateOrdinal;
    })(DateNumeral);
    var Hour = (function (_super) {
        __extends(Hour, _super);
        function Hour() {
            _super.apply(this, arguments);
        }
        Hour.prototype.increment = function () {
            var num = this.date.getHours() + 1;
            if (num > 23)
                num = 0;
            this.date.setHours(num);
        };
        Hour.prototype.decrement = function () {
            var num = this.date.getHours() - 1;
            if (num < 0)
                num = 23;
            this.date.setHours(num);
        };
        Hour.prototype.setValueFromPartial = function (partial) {
            var num = parseInt(partial, 10);
            if (/^\d{1,2}$/.test(partial) && num < 24 && num >= 0) {
                return this.setValue(num.toString());
            }
            return false;
        };
        Hour.prototype.setValue = function (value) {
            if (typeof value === 'object') {
                this.date = new Date(value.valueOf());
                return true;
            }
            else if (typeof value === 'string' && this.getRegEx().test(value)) {
                this.date.setHours(parseInt(value, 10));
                return true;
            }
            return false;
        };
        Hour.prototype.getRegEx = function () {
            return /^[1-5]?[0-9]$/;
        };
        Hour.prototype.getMaxBuffer = function () {
            return 2;
        };
        Hour.prototype.getLevel = function () {
            return Level.HOUR;
        };
        Hour.prototype.toString = function () {
            var hours = this.date.getHours();
            if (hours > 12)
                hours -= 12;
            if (hours === 0)
                hours = 12;
            return hours.toString();
        };
        return Hour;
    })(DatePart);
    var PaddedMinute = (function (_super) {
        __extends(PaddedMinute, _super);
        function PaddedMinute() {
            _super.apply(this, arguments);
        }
        PaddedMinute.prototype.increment = function () {
            var num = this.date.getMinutes() + 1;
            if (num > 59)
                num = 0;
            this.date.setMinutes(num);
        };
        PaddedMinute.prototype.decrement = function () {
            var num = this.date.getMinutes() - 1;
            if (num < 0)
                num = 59;
            this.date.setMinutes(num);
        };
        PaddedMinute.prototype.setValueFromPartial = function (partial) {
            var num = parseInt(partial, 10);
            if (/^\d{1,2}$/.test(partial) && num < 60 && num >= 0) {
                return this.setValue(this.pad(num));
            }
            return false;
        };
        PaddedMinute.prototype.setValue = function (value) {
            if (typeof value === 'object') {
                this.date = new Date(value.valueOf());
                return true;
            }
            else if (typeof value === 'string' && this.getRegEx().test(value)) {
                this.date.setMinutes(parseInt(value, 10));
                return true;
            }
            return false;
        };
        PaddedMinute.prototype.getRegEx = function () {
            return /^[0-5][0-9]$/;
        };
        PaddedMinute.prototype.getMaxBuffer = function () {
            return 2;
        };
        PaddedMinute.prototype.getLevel = function () {
            return Level.MINUTE;
        };
        PaddedMinute.prototype.toString = function () {
            return this.pad(this.date.getMinutes());
        };
        return PaddedMinute;
    })(DatePart);
    var UppercaseMeridiem = (function (_super) {
        __extends(UppercaseMeridiem, _super);
        function UppercaseMeridiem() {
            _super.apply(this, arguments);
        }
        UppercaseMeridiem.prototype.increment = function () {
            var num = this.date.getHours() + 12;
            if (num > 23)
                num -= 24;
            this.date.setHours(num);
        };
        UppercaseMeridiem.prototype.decrement = function () {
            var num = this.date.getHours() - 12;
            if (num < 0)
                num += 24;
            this.date.setHours(num);
        };
        UppercaseMeridiem.prototype.setValueFromPartial = function (partial) {
            if (/^((AM?)|(PM?))$/i.test(partial)) {
                return this.setValue(partial[0] === 'A' ? 'AM' : 'PM');
            }
            return false;
        };
        UppercaseMeridiem.prototype.setValue = function (value) {
            if (typeof value === 'object') {
                this.date = new Date(value.valueOf());
                return true;
            }
            else if (typeof value === 'string' && this.getRegEx().test(value)) {
                if (value.toLowerCase() === 'am' && this.date.getHours() > 11) {
                    this.date.setHours(this.date.getHours() - 12);
                }
                else if (value.toLowerCase() === 'pm' && this.date.getHours() < 12) {
                    this.date.setHours(this.date.getHours() + 12);
                }
                return true;
            }
            return false;
        };
        UppercaseMeridiem.prototype.getLevel = function () {
            return Level.HOUR;
        };
        UppercaseMeridiem.prototype.getMaxBuffer = function () {
            return 1;
        };
        UppercaseMeridiem.prototype.getRegEx = function () {
            return /^((am)|(pm))$/i;
        };
        UppercaseMeridiem.prototype.toString = function () {
            return this.date.getHours() < 12 ? 'AM' : 'PM';
        };
        return UppercaseMeridiem;
    })(DatePart);
    var LowercaseMeridiem = (function (_super) {
        __extends(LowercaseMeridiem, _super);
        function LowercaseMeridiem() {
            _super.apply(this, arguments);
        }
        LowercaseMeridiem.prototype.toString = function () {
            return _super.prototype.toString.call(this).toLowerCase();
        };
        return LowercaseMeridiem;
    })(UppercaseMeridiem);
    var formatBlocks = {};
    formatBlocks['YYYY'] = FourDigitYear;
    formatBlocks['YY'] = TwoDigitYear;
    formatBlocks['MMMM'] = LongMonthName;
    formatBlocks['MMM'] = ShortMonthName;
    formatBlocks['MM'] = PaddedMonth;
    formatBlocks['M'] = Month;
    formatBlocks['DD'] = PaddedDate;
    formatBlocks['Do'] = DateOrdinal;
    formatBlocks['D'] = DateNumeral;
    // dddd
    // ddd
    // X
    // x
    // HH
    // hh
    // H
    formatBlocks['h'] = Hour;
    formatBlocks['A'] = UppercaseMeridiem;
    formatBlocks['a'] = LowercaseMeridiem;
    formatBlocks['mm'] = PaddedMinute;
    // m
    // ss
    // s
    // ZZ
    // Z
    return formatBlocks;
})();
var Input = (function () {
    function Input(element) {
        var _this = this;
        this.element = element;
        this.textBuffer = '';
        new KeyboardEventHandler(this);
        new MouseEventHandler(this);
        new PasteEventHander(this);
        listen.viewchanged(element, function (e) { return _this.viewchanged(e.date, e.level); });
    }
    Input.prototype.getTextBuffer = function () {
        return this.textBuffer;
    };
    Input.prototype.setTextBuffer = function (newBuffer) {
        this.textBuffer = newBuffer;
        if (this.textBuffer.length > 0) {
            this.updateDateFromBuffer();
        }
    };
    Input.prototype.updateDateFromBuffer = function () {
        if (this.selectedDatePart.setValueFromPartial(this.textBuffer)) {
            var newDate = this.selectedDatePart.getValue();
            if (this.textBuffer.length >= this.selectedDatePart.getMaxBuffer()) {
                this.textBuffer = '';
                this.selectedDatePart = this.getNextSelectableDatePart();
            }
            trigger.goto(this.element, {
                date: newDate,
                level: this.selectedDatePart.getLevel()
            });
        }
        else {
            this.textBuffer = this.textBuffer.slice(0, -1);
        }
    };
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
    Input.prototype.getNearestSelectableDatePart = function (caretPosition) {
        var distance = Number.MAX_VALUE;
        var nearestDatePart;
        var start = 0;
        for (var i = 0; i < this.dateParts.length; i++) {
            var datePart = this.dateParts[i];
            if (datePart.isSelectable()) {
                var fromLeft = caretPosition - start;
                var fromRight = caretPosition - (start + datePart.toString().length);
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
        if (this.selectedDatePart !== datePart) {
            this.textBuffer = '';
            this.selectedDatePart = datePart;
        }
    };
    Input.prototype.getSelectedDatePart = function () {
        return this.selectedDatePart;
    };
    Input.prototype.updateOptions = function (options) {
        this.options = options;
        this.dateParts = Parser.parse(options.displayAs);
        this.selectedDatePart = void 0;
        var format = '^';
        this.dateParts.forEach(function (datePart) {
            format += datePart.getRegEx().source.slice(1, -1);
        });
        this.format = new RegExp(format + '$', 'i');
        this.updateView();
    };
    Input.prototype.updateView = function () {
        var dateString = '';
        this.dateParts.forEach(function (datePart) {
            if (datePart.getValue() === void 0)
                return;
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
    Input.prototype.viewchanged = function (date, level) {
        this.dateParts.forEach(function (datePart) {
            datePart.setValue(date);
        });
        this.updateView();
    };
    return Input;
})();
var KeyboardEventHandler = (function () {
    function KeyboardEventHandler(input) {
        var _this = this;
        this.input = input;
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
        }
        else if (!e.shiftKey) {
            this.input.setTextBuffer('');
        }
    };
    KeyboardEventHandler.prototype.home = function () {
        var first = this.input.getFirstSelectableDatePart();
        this.input.setSelectedDatePart(first);
        this.input.updateView();
    };
    KeyboardEventHandler.prototype.end = function () {
        var last = this.input.getLastSelectableDatePart();
        this.input.setSelectedDatePart(last);
        this.input.updateView();
    };
    KeyboardEventHandler.prototype.left = function () {
        var previous = this.input.getPreviousSelectableDatePart();
        this.input.setSelectedDatePart(previous);
        this.input.updateView();
    };
    KeyboardEventHandler.prototype.right = function () {
        var next = this.input.getNextSelectableDatePart();
        this.input.setSelectedDatePart(next);
        this.input.updateView();
    };
    KeyboardEventHandler.prototype.shiftTab = function () {
        var previous = this.input.getPreviousSelectableDatePart();
        if (previous !== this.input.getSelectedDatePart()) {
            this.input.setSelectedDatePart(previous);
            this.input.updateView();
            return true;
        }
        return false;
    };
    KeyboardEventHandler.prototype.tab = function () {
        var next = this.input.getNextSelectableDatePart();
        if (next !== this.input.getSelectedDatePart()) {
            this.input.setSelectedDatePart(next);
            this.input.updateView();
            return true;
        }
        return false;
    };
    KeyboardEventHandler.prototype.up = function () {
        this.input.getSelectedDatePart().increment();
        var level = this.input.getSelectedDatePart().getLevel();
        var date = this.input.getSelectedDatePart().getValue();
        trigger.goto(this.input.element, {
            date: date,
            level: level
        });
    };
    KeyboardEventHandler.prototype.down = function () {
        this.input.getSelectedDatePart().decrement();
        var level = this.input.getSelectedDatePart().getLevel();
        var date = this.input.getSelectedDatePart().getValue();
        trigger.goto(this.input.element, {
            date: date,
            level: level
        });
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
        listen.mousedown(input.element, function () { return _this.mousedown(); });
        listen.mouseup(document, function () { return _this.mouseup(); });
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
var PasteEventHander = (function () {
    function PasteEventHander(input) {
        var _this = this;
        this.input = input;
        listen.paste(input.element, function () { return _this.paste(); });
    }
    PasteEventHander.prototype.paste = function () {
        var _this = this;
        var originalValue = this.input.element.value;
        setTimeout(function () {
            if (!_this.input.format.test(_this.input.element.value)) {
                _this.input.element.value = originalValue;
                return;
            }
            var newDate = _this.input.getSelectedDatePart().getValue();
            var strPrefix = '';
            for (var i = 0; i < _this.input.dateParts.length; i++) {
                var datePart = _this.input.dateParts[i];
                var regExp = new RegExp(datePart.getRegEx().source.slice(1, -1), 'i');
                var val = _this.input.element.value.replace(strPrefix, '').match(regExp)[0];
                strPrefix += val;
                if (!datePart.isSelectable())
                    continue;
                datePart.setValue(newDate);
                if (datePart.setValue(val)) {
                    newDate = datePart.getValue();
                }
                else {
                    _this.input.element.value = originalValue;
                    return;
                }
            }
            trigger.goto(_this.input.element, {
                date: newDate,
                level: _this.input.getSelectedDatePart().getLevel()
            });
        });
    };
    return PasteEventHander;
})();
var Picker = (function () {
    function Picker() {
    }
    Picker.prototype.update = function (options) {
    };
    return Picker;
})();
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRhdGl1bS50cyIsIkRhdGl1bUludGVybmFscy50cyIsIk9wdGlvblNhbml0aXplci50cyIsImNvbW1vbi9DdXN0b21FdmVudFBvbHlmaWxsLnRzIiwiY29tbW9uL0V2ZW50cy50cyIsImlucHV0L0RhdGVQYXJ0cy50cyIsImlucHV0L0lucHV0LnRzIiwiaW5wdXQvS2V5Ym9hcmRFdmVudEhhbmRsZXIudHMiLCJpbnB1dC9Nb3VzZUV2ZW50SGFuZGxlci50cyIsImlucHV0L1BhcnNlci50cyIsImlucHV0L1Bhc3RlRXZlbnRIYW5kbGVyLnRzIiwicGlja2VyL1BpY2tlci50cyJdLCJuYW1lcyI6WyJjb25zdHJ1Y3RvciIsIkxldmVsIiwiTGV2ZWwuY29uc3RydWN0b3IiLCJEYXRpdW1JbnRlcm5hbHMiLCJEYXRpdW1JbnRlcm5hbHMuY29uc3RydWN0b3IiLCJEYXRpdW1JbnRlcm5hbHMuZ290byIsIkRhdGl1bUludGVybmFscy51cGRhdGVPcHRpb25zIiwiT3B0aW9uU2FuaXRpemVyIiwiT3B0aW9uU2FuaXRpemVyLmNvbnN0cnVjdG9yIiwiT3B0aW9uU2FuaXRpemVyLnNhbml0aXplRGlzcGxheUFzIiwiT3B0aW9uU2FuaXRpemVyLnNhbml0aXplTWluRGF0ZSIsIk9wdGlvblNhbml0aXplci5zYW5pdGl6ZU1heERhdGUiLCJPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVEZWZhdWx0RGF0ZSIsIk9wdGlvblNhbml0aXplci5zYW5pdGl6ZSIsInVzZU5hdGl2ZSIsImxpc3RlbiIsImxpc3Rlbi5hdHRhY2hFdmVudHMiLCJsaXN0ZW4uZm9jdXMiLCJsaXN0ZW4ubW91c2Vkb3duIiwibGlzdGVuLm1vdXNldXAiLCJsaXN0ZW4ucGFzdGUiLCJsaXN0ZW4uZ290byIsImxpc3Rlbi52aWV3Y2hhbmdlZCIsImxpc3Rlbi5yZW1vdmVMaXN0ZW5lcnMiLCJ0cmlnZ2VyIiwidHJpZ2dlci5nb3RvIiwidHJpZ2dlci52aWV3Y2hhbmdlZCIsIlBsYWluVGV4dCIsIlBsYWluVGV4dC5jb25zdHJ1Y3RvciIsIlBsYWluVGV4dC5pbmNyZW1lbnQiLCJQbGFpblRleHQuZGVjcmVtZW50IiwiUGxhaW5UZXh0LnNldFZhbHVlRnJvbVBhcnRpYWwiLCJQbGFpblRleHQuc2V0VmFsdWUiLCJQbGFpblRleHQuZ2V0VmFsdWUiLCJQbGFpblRleHQuZ2V0UmVnRXgiLCJQbGFpblRleHQuc2V0U2VsZWN0YWJsZSIsIlBsYWluVGV4dC5nZXRNYXhCdWZmZXIiLCJQbGFpblRleHQuZ2V0TGV2ZWwiLCJQbGFpblRleHQuaXNTZWxlY3RhYmxlIiwiUGxhaW5UZXh0LnRvU3RyaW5nIiwiRGF0ZVBhcnQiLCJEYXRlUGFydC5jb25zdHJ1Y3RvciIsIkRhdGVQYXJ0LmdldFZhbHVlIiwiRGF0ZVBhcnQuc2V0U2VsZWN0YWJsZSIsIkRhdGVQYXJ0LmlzU2VsZWN0YWJsZSIsIkRhdGVQYXJ0LnBhZCIsIkZvdXJEaWdpdFllYXIiLCJGb3VyRGlnaXRZZWFyLmNvbnN0cnVjdG9yIiwiRm91ckRpZ2l0WWVhci5pbmNyZW1lbnQiLCJGb3VyRGlnaXRZZWFyLmRlY3JlbWVudCIsIkZvdXJEaWdpdFllYXIuc2V0VmFsdWVGcm9tUGFydGlhbCIsIkZvdXJEaWdpdFllYXIuc2V0VmFsdWUiLCJGb3VyRGlnaXRZZWFyLmdldFJlZ0V4IiwiRm91ckRpZ2l0WWVhci5nZXRNYXhCdWZmZXIiLCJGb3VyRGlnaXRZZWFyLmdldExldmVsIiwiRm91ckRpZ2l0WWVhci50b1N0cmluZyIsIlR3b0RpZ2l0WWVhciIsIlR3b0RpZ2l0WWVhci5jb25zdHJ1Y3RvciIsIlR3b0RpZ2l0WWVhci5nZXRNYXhCdWZmZXIiLCJUd29EaWdpdFllYXIuc2V0VmFsdWUiLCJUd29EaWdpdFllYXIuZ2V0UmVnRXgiLCJUd29EaWdpdFllYXIudG9TdHJpbmciLCJMb25nTW9udGhOYW1lIiwiTG9uZ01vbnRoTmFtZS5jb25zdHJ1Y3RvciIsIkxvbmdNb250aE5hbWUuZ2V0TW9udGhzIiwiTG9uZ01vbnRoTmFtZS5pbmNyZW1lbnQiLCJMb25nTW9udGhOYW1lLmRlY3JlbWVudCIsIkxvbmdNb250aE5hbWUuc2V0VmFsdWVGcm9tUGFydGlhbCIsIkxvbmdNb250aE5hbWUuc2V0VmFsdWUiLCJMb25nTW9udGhOYW1lLmdldFJlZ0V4IiwiTG9uZ01vbnRoTmFtZS5nZXRNYXhCdWZmZXIiLCJMb25nTW9udGhOYW1lLmdldExldmVsIiwiTG9uZ01vbnRoTmFtZS50b1N0cmluZyIsIlNob3J0TW9udGhOYW1lIiwiU2hvcnRNb250aE5hbWUuY29uc3RydWN0b3IiLCJTaG9ydE1vbnRoTmFtZS5nZXRNb250aHMiLCJNb250aCIsIk1vbnRoLmNvbnN0cnVjdG9yIiwiTW9udGguZ2V0TWF4QnVmZmVyIiwiTW9udGguc2V0VmFsdWVGcm9tUGFydGlhbCIsIk1vbnRoLnNldFZhbHVlIiwiTW9udGguZ2V0UmVnRXgiLCJNb250aC50b1N0cmluZyIsIlBhZGRlZE1vbnRoIiwiUGFkZGVkTW9udGguY29uc3RydWN0b3IiLCJQYWRkZWRNb250aC5nZXRSZWdFeCIsIlBhZGRlZE1vbnRoLnNldFZhbHVlRnJvbVBhcnRpYWwiLCJQYWRkZWRNb250aC50b1N0cmluZyIsIkRhdGVOdW1lcmFsIiwiRGF0ZU51bWVyYWwuY29uc3RydWN0b3IiLCJEYXRlTnVtZXJhbC5kYXlzSW5Nb250aCIsIkRhdGVOdW1lcmFsLmluY3JlbWVudCIsIkRhdGVOdW1lcmFsLmRlY3JlbWVudCIsIkRhdGVOdW1lcmFsLnNldFZhbHVlRnJvbVBhcnRpYWwiLCJEYXRlTnVtZXJhbC5zZXRWYWx1ZSIsIkRhdGVOdW1lcmFsLmdldFJlZ0V4IiwiRGF0ZU51bWVyYWwuZ2V0TWF4QnVmZmVyIiwiRGF0ZU51bWVyYWwuZ2V0TGV2ZWwiLCJEYXRlTnVtZXJhbC50b1N0cmluZyIsIlBhZGRlZERhdGUiLCJQYWRkZWREYXRlLmNvbnN0cnVjdG9yIiwiUGFkZGVkRGF0ZS5zZXRWYWx1ZUZyb21QYXJ0aWFsIiwiUGFkZGVkRGF0ZS5nZXRSZWdFeCIsIlBhZGRlZERhdGUudG9TdHJpbmciLCJEYXRlT3JkaW5hbCIsIkRhdGVPcmRpbmFsLmNvbnN0cnVjdG9yIiwiRGF0ZU9yZGluYWwuZ2V0UmVnRXgiLCJEYXRlT3JkaW5hbC50b1N0cmluZyIsIkhvdXIiLCJIb3VyLmNvbnN0cnVjdG9yIiwiSG91ci5pbmNyZW1lbnQiLCJIb3VyLmRlY3JlbWVudCIsIkhvdXIuc2V0VmFsdWVGcm9tUGFydGlhbCIsIkhvdXIuc2V0VmFsdWUiLCJIb3VyLmdldFJlZ0V4IiwiSG91ci5nZXRNYXhCdWZmZXIiLCJIb3VyLmdldExldmVsIiwiSG91ci50b1N0cmluZyIsIlBhZGRlZE1pbnV0ZSIsIlBhZGRlZE1pbnV0ZS5jb25zdHJ1Y3RvciIsIlBhZGRlZE1pbnV0ZS5pbmNyZW1lbnQiLCJQYWRkZWRNaW51dGUuZGVjcmVtZW50IiwiUGFkZGVkTWludXRlLnNldFZhbHVlRnJvbVBhcnRpYWwiLCJQYWRkZWRNaW51dGUuc2V0VmFsdWUiLCJQYWRkZWRNaW51dGUuZ2V0UmVnRXgiLCJQYWRkZWRNaW51dGUuZ2V0TWF4QnVmZmVyIiwiUGFkZGVkTWludXRlLmdldExldmVsIiwiUGFkZGVkTWludXRlLnRvU3RyaW5nIiwiVXBwZXJjYXNlTWVyaWRpZW0iLCJVcHBlcmNhc2VNZXJpZGllbS5jb25zdHJ1Y3RvciIsIlVwcGVyY2FzZU1lcmlkaWVtLmluY3JlbWVudCIsIlVwcGVyY2FzZU1lcmlkaWVtLmRlY3JlbWVudCIsIlVwcGVyY2FzZU1lcmlkaWVtLnNldFZhbHVlRnJvbVBhcnRpYWwiLCJVcHBlcmNhc2VNZXJpZGllbS5zZXRWYWx1ZSIsIlVwcGVyY2FzZU1lcmlkaWVtLmdldExldmVsIiwiVXBwZXJjYXNlTWVyaWRpZW0uZ2V0TWF4QnVmZmVyIiwiVXBwZXJjYXNlTWVyaWRpZW0uZ2V0UmVnRXgiLCJVcHBlcmNhc2VNZXJpZGllbS50b1N0cmluZyIsIkxvd2VyY2FzZU1lcmlkaWVtIiwiTG93ZXJjYXNlTWVyaWRpZW0uY29uc3RydWN0b3IiLCJMb3dlcmNhc2VNZXJpZGllbS50b1N0cmluZyIsIklucHV0IiwiSW5wdXQuY29uc3RydWN0b3IiLCJJbnB1dC5nZXRUZXh0QnVmZmVyIiwiSW5wdXQuc2V0VGV4dEJ1ZmZlciIsIklucHV0LnVwZGF0ZURhdGVGcm9tQnVmZmVyIiwiSW5wdXQuZ2V0Rmlyc3RTZWxlY3RhYmxlRGF0ZVBhcnQiLCJJbnB1dC5nZXRMYXN0U2VsZWN0YWJsZURhdGVQYXJ0IiwiSW5wdXQuZ2V0TmV4dFNlbGVjdGFibGVEYXRlUGFydCIsIklucHV0LmdldFByZXZpb3VzU2VsZWN0YWJsZURhdGVQYXJ0IiwiSW5wdXQuZ2V0TmVhcmVzdFNlbGVjdGFibGVEYXRlUGFydCIsIklucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQiLCJJbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0IiwiSW5wdXQudXBkYXRlT3B0aW9ucyIsIklucHV0LnVwZGF0ZVZpZXciLCJJbnB1dC52aWV3Y2hhbmdlZCIsIktleWJvYXJkRXZlbnRIYW5kbGVyIiwiS2V5Ym9hcmRFdmVudEhhbmRsZXIuY29uc3RydWN0b3IiLCJLZXlib2FyZEV2ZW50SGFuZGxlci5kb2N1bWVudEtleWRvd24iLCJLZXlib2FyZEV2ZW50SGFuZGxlci5rZXlkb3duIiwiS2V5Ym9hcmRFdmVudEhhbmRsZXIuaG9tZSIsIktleWJvYXJkRXZlbnRIYW5kbGVyLmVuZCIsIktleWJvYXJkRXZlbnRIYW5kbGVyLmxlZnQiLCJLZXlib2FyZEV2ZW50SGFuZGxlci5yaWdodCIsIktleWJvYXJkRXZlbnRIYW5kbGVyLnNoaWZ0VGFiIiwiS2V5Ym9hcmRFdmVudEhhbmRsZXIudGFiIiwiS2V5Ym9hcmRFdmVudEhhbmRsZXIudXAiLCJLZXlib2FyZEV2ZW50SGFuZGxlci5kb3duIiwiTW91c2VFdmVudEhhbmRsZXIiLCJNb3VzZUV2ZW50SGFuZGxlci5jb25zdHJ1Y3RvciIsIk1vdXNlRXZlbnRIYW5kbGVyLm1vdXNlZG93biIsIlBhcnNlciIsIlBhcnNlci5jb25zdHJ1Y3RvciIsIlBhcnNlci5wYXJzZSIsIlBhcnNlci5maW5kQXQiLCJQYXN0ZUV2ZW50SGFuZGVyIiwiUGFzdGVFdmVudEhhbmRlci5jb25zdHJ1Y3RvciIsIlBhc3RlRXZlbnRIYW5kZXIucGFzdGUiLCJQaWNrZXIiLCJQaWNrZXIuY29uc3RydWN0b3IiLCJQaWNrZXIudXBkYXRlIl0sIm1hcHBpbmdzIjoiQUFBTSxNQUFPLENBQUMsUUFBUSxDQUFDLEdBQUc7SUFFdEIsZ0JBQVksT0FBd0IsRUFBRSxPQUFnQjtRQUNsREEsSUFBSUEsU0FBU0EsR0FBR0EsSUFBSUEsZUFBZUEsQ0FBQ0EsT0FBT0EsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFDdERBLElBQUlBLENBQUNBLGFBQWFBLEdBQUdBLFVBQUNBLE9BQWdCQSxJQUFLQSxPQUFBQSxTQUFTQSxDQUFDQSxhQUFhQSxDQUFDQSxPQUFPQSxDQUFDQSxFQUFoQ0EsQ0FBZ0NBLENBQUNBO0lBQ2hGQSxDQUFDQTtJQUNMLGFBQUM7QUFBRCxDQU4wQixBQU16QixHQUFBLENBQUE7QUNORDtJQUFBQztJQVFBQyxDQUFDQTtJQVBVRCxVQUFJQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUNUQSxXQUFLQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUNWQSxVQUFJQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUNUQSxVQUFJQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUNUQSxZQUFNQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUNYQSxZQUFNQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUNYQSxVQUFJQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUNwQkEsWUFBQ0E7QUFBREEsQ0FSQSxBQVFDQSxJQUFBO0FBRUQ7SUFLSUUseUJBQW9CQSxPQUF3QkEsRUFBRUEsT0FBZ0JBO1FBTGxFQyxpQkF3Q0NBO1FBbkN1QkEsWUFBT0EsR0FBUEEsT0FBT0EsQ0FBaUJBO1FBSnBDQSxZQUFPQSxHQUFZQSxFQUFFQSxDQUFDQTtRQUsxQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsS0FBS0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsTUFBTUEscUJBQXFCQSxDQUFDQTtRQUNwREEsT0FBT0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsWUFBWUEsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFFNUNBLElBQUlBLENBQUNBLEtBQUtBLEdBQUdBLElBQUlBLEtBQUtBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO1FBR2hDQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUU1QkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsRUFBRUEsVUFBQ0EsQ0FBQ0EsSUFBS0EsT0FBQUEsS0FBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsRUFBMUJBLENBQTBCQSxDQUFDQSxDQUFDQTtRQUV4REEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsRUFBRUEsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFDdkRBLENBQUNBO0lBRU1ELDhCQUFJQSxHQUFYQSxVQUFZQSxJQUFTQSxFQUFFQSxLQUFXQTtRQUM5QkUsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsSUFBSUEsR0FBR0EsSUFBSUEsSUFBSUEsRUFBRUEsQ0FBQ0E7UUFFdkNBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLEtBQUtBLEtBQUtBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLE9BQU9BLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO1lBQ3JGQSxJQUFJQSxHQUFHQSxJQUFJQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQSxDQUFDQTtRQUNwREEsQ0FBQ0E7UUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0Es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U0EsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0E7WUFDN0NBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFlBQVlBLEVBQUVBLENBQUNBO2dCQUNqQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDakNBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO0lBQ2xCQSxDQUFDQTtJQUVNTCx5Q0FBeUJBLEdBQWhDQTtRQUNJTSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQTtZQUNsREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsWUFBWUEsRUFBRUEsQ0FBQ0E7Z0JBQ2pDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNqQ0EsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDbEJBLENBQUNBO0lBRU1OLHlDQUF5QkEsR0FBaENBO1FBQ0lPLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0E7UUFDdERBLE9BQU9BLEVBQUVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO1lBQ2pDQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxZQUFZQSxFQUFFQSxDQUFDQTtn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QUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1QkEsSUFBSUEsSUFBSUEsRUFBRUEsQ0FBQ0E7UUFDZkEsQ0FBQ0E7UUFHREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsYUFBUUEsSUFBSUEsSUFBSUEsS0FBS0EsWUFBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0E7UUFDbEVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLGFBQVFBLElBQUlBLElBQUlBLEtBQUtBLGNBQVNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLFFBQVFBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBO1FBQ3BFQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxVQUFLQSxJQUFJQSxJQUFJQSxLQUFLQSxVQUFLQSxJQUFJQSxJQUFJQSxLQUFLQSxVQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQTtRQUU5RUEsSUFBSUEsY0FBY0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFFMUJBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLGFBQVFBLENBQUNBLENBQUNBLENBQUNBO1lBQ3BCQSxJQUFJQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQTtRQUNoQkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsWUFBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDMUJBLElBQUlBLENBQUNBLEdBQUdBLEVBQUVBLENBQUNBO1FBQ2ZBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLGFBQVFBLENBQUNBLENBQUNBLENBQUNBO1lBQzNCQSxJQUFJQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQTtRQUNoQkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FB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LENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLEtBQUlBLENBQUNBLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBO2dCQUNuREEsSUFBSUEsUUFBUUEsR0FBR0EsS0FBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBRXZDQSxJQUFJQSxNQUFNQSxHQUFHQSxJQUFJQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxRQUFRQSxFQUFFQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtnQkFFdEVBLElBQUlBLEdBQUdBLEdBQUdBLEtBQUlBLENBQUNBLEtBQUtBLENBQUNBLE9BQU9BLENBQUNBLEtBQUtBLENBQUNBLE9BQU9BLENBQUNBLFNBQVNBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUMzRUEsU0FBU0EsSUFBSUEsR0FBR0EsQ0FBQ0E7Z0JBRWpCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQSxZQUFZQSxFQUFFQSxDQUFDQTtvQkFBQ0EsUUFBUUEsQ0FBQ0E7Z0JBRXZDQSxRQUFRQSxDQUFDQSxRQUFRQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtnQkFDM0JBLEVBQUVBLENBQUNBLENBQUNBLFFBQVFBLENBQUNBLFFBQVFBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO29CQUN6QkEsT0FBT0EsR0FBR0EsUUFBUUEsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0E7Z0JBQ2xDQSxDQUFDQTtnQkFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7b0JBQ0pBLEtBQUlBLENBQUNBLEtBQUtBLENBQUNBLE9BQU9BLENBQUNBLEtBQUtBLEdBQUdBLGFBQWFBLENBQUNBO29CQUN6Q0EsTUFBTUEsQ0FBQ0E7Z0JBQ1hBLENBQUNBO1lBQ0xBLENBQUNBO1lBRURBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLEtBQUlBLENBQUNBLEtBQUtBLENBQUNBLE9BQU9BLEVBQUVBO2dCQUM3QkEsSUFBSUEsRUFBRUEsT0FBT0E7Z0JBQ2JBLEtBQUtBLEVBQUVBLEtBQUlBLENBQUNBLEtBQUtBLENBQUNBLG1CQUFtQkEsRUFBRUEsQ0FBQ0EsUUFBUUEsRUFBRUE7YUFDckRBLENBQUNBLENBQUNBO1FBRU5BLENBQUNBLENBQUNBLENBQUNBO0lBQ1BBLENBQUNBO0lBQ0xGLHVCQUFDQTtBQUFEQSxDQTFDQSxBQTBDQ0EsSUFBQTtBQzFDRDtJQUNJRztJQUVBQyxDQUFDQTtJQUVNRCx1QkFBTUEsR0FBYkEsVUFBY0EsT0FBZ0JBO0lBRTlCRSxDQUFDQTtJQUNMRixhQUFDQTtBQUFEQSxDQVJBLEFBUUNBLElBQUEiLCJmaWxlIjoiZGF0aXVtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKDxhbnk+d2luZG93KVsnRGF0aXVtJ10gPSBjbGFzcyBEYXRpdW0ge1xuICAgIHB1YmxpYyB1cGRhdGVPcHRpb25zOihvcHRpb25zOklPcHRpb25zKSA9PiB2b2lkO1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6SFRNTElucHV0RWxlbWVudCwgb3B0aW9uczpJT3B0aW9ucykge1xuICAgICAgICBsZXQgaW50ZXJuYWxzID0gbmV3IERhdGl1bUludGVybmFscyhlbGVtZW50LCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy51cGRhdGVPcHRpb25zID0gKG9wdGlvbnM6SU9wdGlvbnMpID0+IGludGVybmFscy51cGRhdGVPcHRpb25zKG9wdGlvbnMpO1xuICAgIH1cbn0iLCJjbGFzcyBMZXZlbCB7XG4gICAgc3RhdGljIFlFQVIgPSAwO1xuICAgIHN0YXRpYyBNT05USCA9IDE7XG4gICAgc3RhdGljIERBVEUgPSAyO1xuICAgIHN0YXRpYyBIT1VSID0gMztcbiAgICBzdGF0aWMgTUlOVVRFID0gNDtcbiAgICBzdGF0aWMgU0VDT05EID0gNTtcbiAgICBzdGF0aWMgTk9ORSA9IDY7XG59XG5cbmNsYXNzIERhdGl1bUludGVybmFscyB7XG4gICAgcHJpdmF0ZSBvcHRpb25zOklPcHRpb25zID0ge307XG4gICAgXG4gICAgcHJpdmF0ZSBpbnB1dDpJbnB1dDtcbiAgICBcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVsZW1lbnQ6SFRNTElucHV0RWxlbWVudCwgb3B0aW9uczpJT3B0aW9ucykge1xuICAgICAgICBpZiAoZWxlbWVudCA9PT0gdm9pZCAwKSB0aHJvdyAnZWxlbWVudCBpcyByZXF1aXJlZCc7XG4gICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdzcGVsbGNoZWNrJywgJ2ZhbHNlJyk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmlucHV0ID0gbmV3IElucHV0KGVsZW1lbnQpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIHRoaXMudXBkYXRlT3B0aW9ucyhvcHRpb25zKTsgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgbGlzdGVuLmdvdG8oZWxlbWVudCwgKGUpID0+IHRoaXMuZ290byhlLmRhdGUsIGUubGV2ZWwpKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuZ290byh0aGlzLm9wdGlvbnNbJ2RlZmF1bHREYXRlJ10sIExldmVsLk5PTkUpO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgZ290byhkYXRlOkRhdGUsIGxldmVsOkxldmVsKSB7XG4gICAgICAgIGlmIChkYXRlID09PSB2b2lkIDApIGRhdGUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5taW5EYXRlICE9PSB2b2lkIDAgJiYgZGF0ZS52YWx1ZU9mKCkgPCB0aGlzLm9wdGlvbnMubWluRGF0ZS52YWx1ZU9mKCkpIHtcbiAgICAgICAgICAgIGRhdGUgPSBuZXcgRGF0ZSh0aGlzLm9wdGlvbnMubWluRGF0ZS52YWx1ZU9mKCkpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLm1heERhdGUgIT09IHZvaWQgMCAmJiBkYXRlLnZhbHVlT2YoKSA+IHRoaXMub3B0aW9ucy5tYXhEYXRlLnZhbHVlT2YoKSkge1xuICAgICAgICAgICAgZGF0ZSA9IG5ldyBEYXRlKHRoaXMub3B0aW9ucy5tYXhEYXRlLnZhbHVlT2YoKSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRyaWdnZXIudmlld2NoYW5nZWQodGhpcy5lbGVtZW50LCB7XG4gICAgICAgICAgICBkYXRlOiBkYXRlLFxuICAgICAgICAgICAgbGV2ZWw6IGxldmVsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgdXBkYXRlT3B0aW9ucyhuZXdPcHRpb25zOklPcHRpb25zID0ge30pIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gT3B0aW9uU2FuaXRpemVyLnNhbml0aXplKG5ld09wdGlvbnMsIHRoaXMub3B0aW9ucyk7ICAgICAgICBcbiAgICAgICAgdGhpcy5pbnB1dC51cGRhdGVPcHRpb25zKHRoaXMub3B0aW9ucyk7XG4gICAgfVxufSIsImNsYXNzIE9wdGlvblNhbml0aXplciB7XG4gICAgXG4gICAgc3RhdGljIGRmbHREYXRlOkRhdGUgPSBuZXcgRGF0ZSgpO1xuICAgIFxuICAgIHN0YXRpYyBzYW5pdGl6ZURpc3BsYXlBcyhkaXNwbGF5QXM6YW55LCBkZmx0OnN0cmluZyA9ICdoOm1tYSBNTU0gRCwgWVlZWScpIHtcbiAgICAgICAgaWYgKGRpc3BsYXlBcyA9PT0gdm9pZCAwKSByZXR1cm4gZGZsdDtcbiAgICAgICAgaWYgKHR5cGVvZiBkaXNwbGF5QXMgIT09ICdzdHJpbmcnKSB0aHJvdyAnRGlzcGxheSBhcyBtdXN0IGJlIGEgc3RyaW5nJztcbiAgICAgICAgcmV0dXJuIGRpc3BsYXlBcztcbiAgICB9XG4gICAgXG4gICAgc3RhdGljIHNhbml0aXplTWluRGF0ZShtaW5EYXRlOmFueSwgZGZsdDpEYXRlID0gdm9pZCAwKSB7XG4gICAgICAgIGlmIChtaW5EYXRlID09PSB2b2lkIDApIHJldHVybiBkZmx0O1xuICAgICAgICByZXR1cm4gbmV3IERhdGUobWluRGF0ZSk7IC8vVE9ETyBmaWd1cmUgdGhpcyBvdXQgeWVzXG4gICAgfVxuICAgIFxuICAgIHN0YXRpYyBzYW5pdGl6ZU1heERhdGUobWF4RGF0ZTphbnksIGRmbHQ6RGF0ZSA9IHZvaWQgMCkge1xuICAgICAgICBpZiAobWF4RGF0ZSA9PT0gdm9pZCAwKSByZXR1cm4gZGZsdDtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKG1heERhdGUpOyAvL1RPRE8gZmlndXJlIHRoaXMgb3V0IFxuICAgIH1cbiAgICBcbiAgICBzdGF0aWMgc2FuaXRpemVEZWZhdWx0RGF0ZShkZWZhdWx0RGF0ZTphbnksIGRmbHQ6RGF0ZSA9IHRoaXMuZGZsdERhdGUpIHtcbiAgICAgICAgaWYgKGRlZmF1bHREYXRlID09PSB2b2lkIDApIHJldHVybiBkZmx0O1xuICAgICAgICByZXR1cm4gbmV3IERhdGUoZGVmYXVsdERhdGUpOyAvL1RPRE8gZmlndXJlIHRoaXMgb3V0XG4gICAgfVxuICAgIFxuICAgIHN0YXRpYyBzYW5pdGl6ZShvcHRpb25zOklPcHRpb25zLCBkZWZhdWx0czpJT3B0aW9ucykge1xuICAgICAgICByZXR1cm4gPElPcHRpb25zPntcbiAgICAgICAgICAgIGRpc3BsYXlBczogT3B0aW9uU2FuaXRpemVyLnNhbml0aXplRGlzcGxheUFzKG9wdGlvbnNbJ2Rpc3BsYXlBcyddLCBkZWZhdWx0cy5kaXNwbGF5QXMpLFxuICAgICAgICAgICAgbWluRGF0ZTogT3B0aW9uU2FuaXRpemVyLnNhbml0aXplTWluRGF0ZShvcHRpb25zWydtaW5EYXRlJ10sIGRlZmF1bHRzLm1pbkRhdGUpLFxuICAgICAgICAgICAgbWF4RGF0ZTogT3B0aW9uU2FuaXRpemVyLnNhbml0aXplTWF4RGF0ZShvcHRpb25zWydtYXhEYXRlJ10sIGRlZmF1bHRzLm1heERhdGUpLFxuICAgICAgICAgICAgZGVmYXVsdERhdGU6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZURlZmF1bHREYXRlKG9wdGlvbnNbJ2RlZmF1bHREYXRlJ10sIGRlZmF1bHRzLmRlZmF1bHREYXRlKVxuICAgICAgICB9XG4gICAgfVxufSIsIkN1c3RvbUV2ZW50ID0gKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIHVzZU5hdGl2ZSAoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgY3VzdG9tRXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoJ2EnLCB7IGRldGFpbDogeyBiOiAnYicgfSB9KTtcbiAgICAgICAgICAgIHJldHVybiAgJ2EnID09PSBjdXN0b21FdmVudC50eXBlICYmICdiJyA9PT0gY3VzdG9tRXZlbnQuZGV0YWlsLmI7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIFxuICAgIGlmICh1c2VOYXRpdmUoKSkge1xuICAgICAgICByZXR1cm4gPGFueT5DdXN0b21FdmVudDtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkb2N1bWVudC5jcmVhdGVFdmVudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBJRSA+PSA5XG4gICAgICAgIHJldHVybiA8YW55PmZ1bmN0aW9uKHR5cGU6c3RyaW5nLCBwYXJhbXM6Q3VzdG9tRXZlbnRJbml0KSB7XG4gICAgICAgICAgICBsZXQgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdDdXN0b21FdmVudCcpO1xuICAgICAgICAgICAgaWYgKHBhcmFtcykge1xuICAgICAgICAgICAgICAgIGUuaW5pdEN1c3RvbUV2ZW50KHR5cGUsIHBhcmFtcy5idWJibGVzLCBwYXJhbXMuY2FuY2VsYWJsZSwgcGFyYW1zLmRldGFpbCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGUuaW5pdEN1c3RvbUV2ZW50KHR5cGUsIGZhbHNlLCBmYWxzZSwgdm9pZCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBlO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gSUUgPj0gOFxuICAgICAgICByZXR1cm4gPGFueT5mdW5jdGlvbih0eXBlOnN0cmluZywgcGFyYW1zOkN1c3RvbUV2ZW50SW5pdCkge1xuICAgICAgICAgICAgbGV0IGUgPSAoPGFueT5kb2N1bWVudCkuY3JlYXRlRXZlbnRPYmplY3QoKTtcbiAgICAgICAgICAgIGUudHlwZSA9IHR5cGU7XG4gICAgICAgICAgICBpZiAocGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgZS5idWJibGVzID0gQm9vbGVhbihwYXJhbXMuYnViYmxlcyk7XG4gICAgICAgICAgICAgICAgZS5jYW5jZWxhYmxlID0gQm9vbGVhbihwYXJhbXMuY2FuY2VsYWJsZSk7XG4gICAgICAgICAgICAgICAgZS5kZXRhaWwgPSBwYXJhbXMuZGV0YWlsO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlLmJ1YmJsZXMgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBlLmNhbmNlbGFibGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBlLmRldGFpbCA9IHZvaWQgMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBlO1xuICAgICAgICB9IFxuICAgIH0gIFxufSkoKTtcbiIsImludGVyZmFjZSBJTGlzdGVuZXJSZWZlcmVuY2Uge1xuICAgIGVsZW1lbnQ6IEVsZW1lbnR8RG9jdW1lbnR8V2luZG93O1xuICAgIHJlZmVyZW5jZTogRXZlbnRMaXN0ZW5lcjtcbiAgICBldmVudDogc3RyaW5nO1xufVxuXG5uYW1lc3BhY2UgbGlzdGVuIHtcbiAgICBmdW5jdGlvbiBhdHRhY2hFdmVudHMoZXZlbnRzOnN0cmluZ1tdLCBlbGVtZW50OkVsZW1lbnR8RG9jdW1lbnR8V2luZG93LCBjYWxsYmFjazooZT86YW55KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XG4gICAgICAgIGxldCBsaXN0ZW5lcnM6SUxpc3RlbmVyUmVmZXJlbmNlW10gPSBbXTtcbiAgICAgICAgZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsaXN0ZW5lcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgZWxlbWVudDogZWxlbWVudCxcbiAgICAgICAgICAgICAgICByZWZlcmVuY2U6IGNhbGxiYWNrLFxuICAgICAgICAgICAgICAgIGV2ZW50OiBldmVudFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGNhbGxiYWNrKTsgXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbGlzdGVuZXJzO1xuICAgIH1cbiAgICBcbiAgICAvLyBOQVRJVkVcbiAgICBcbiAgICBleHBvcnQgZnVuY3Rpb24gZm9jdXMoZWxlbWVudDpFbGVtZW50LCBjYWxsYmFjazooZT86Rm9jdXNFdmVudCkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xuICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzKFsnZm9jdXMnXSwgZWxlbWVudCwgKGUpID0+IHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZXhwb3J0IGZ1bmN0aW9uIG1vdXNlZG93bihlbGVtZW50OkVsZW1lbnR8RG9jdW1lbnR8V2luZG93LCBjYWxsYmFjazooZT86TW91c2VFdmVudCkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xuICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzKFsnbW91c2Vkb3duJ10sIGVsZW1lbnQsIChlKSA9PiB7XG4gICAgICAgICAgICBjYWxsYmFjayhlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGV4cG9ydCBmdW5jdGlvbiBtb3VzZXVwKGVsZW1lbnQ6RWxlbWVudHxEb2N1bWVudHxXaW5kb3csIGNhbGxiYWNrOihlPzpNb3VzZUV2ZW50KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydtb3VzZXVwJ10sIGVsZW1lbnQsIChlKSA9PiB7XG4gICAgICAgICAgICBjYWxsYmFjayhlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGV4cG9ydCBmdW5jdGlvbiBwYXN0ZShlbGVtZW50OkVsZW1lbnR8RG9jdW1lbnR8V2luZG93LCBjYWxsYmFjazooZT86TW91c2VFdmVudCkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xuICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzKFsncGFzdGUnXSwgZWxlbWVudCwgKGUpID0+IHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgLy8gQ1VTVE9NXG4gICAgXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGdvdG8oZWxlbWVudDpFbGVtZW50LCBjYWxsYmFjazooZT86e2RhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWx9KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydkYXRpdW0tZ290byddLCBlbGVtZW50LCAoZTpDdXN0b21FdmVudCkgPT4ge1xuICAgICAgICAgICAgY2FsbGJhY2soZS5kZXRhaWwpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHZpZXdjaGFuZ2VkKGVsZW1lbnQ6RWxlbWVudCwgY2FsbGJhY2s6KGU/OntkYXRlOkRhdGUsIGxldmVsOkxldmVsfSkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xuICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzKFsnZGF0aXVtLXZpZXdjaGFuZ2VkJ10sIGVsZW1lbnQsIChlOkN1c3RvbUV2ZW50KSA9PiB7XG4gICAgICAgICAgICBjYWxsYmFjayhlLmRldGFpbCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBleHBvcnQgZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXJzKGxpc3RlbmVyczpJTGlzdGVuZXJSZWZlcmVuY2VbXSkge1xuICAgICAgICBsaXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIpID0+IHtcbiAgICAgICAgICAgbGlzdGVuZXIuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGxpc3RlbmVyLmV2ZW50LCBsaXN0ZW5lci5yZWZlcmVuY2UpOyBcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5uYW1lc3BhY2UgdHJpZ2dlciB7XG4gICAgZXhwb3J0IGZ1bmN0aW9uIGdvdG8oZWxlbWVudDpFbGVtZW50LCBkYXRhPzp7ZGF0ZTpEYXRlLCBsZXZlbDpMZXZlbH0pIHtcbiAgICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnZGF0aXVtLWdvdG8nLCB7XG4gICAgICAgICAgICBidWJibGVzOiBmYWxzZSxcbiAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICAgICAgICBkZXRhaWw6IGRhdGFcbiAgICAgICAgfSkpO1xuICAgIH1cbiAgICBcbiAgICBleHBvcnQgZnVuY3Rpb24gdmlld2NoYW5nZWQoZWxlbWVudDpFbGVtZW50LCBkYXRhPzp7ZGF0ZTpEYXRlLCBsZXZlbDpMZXZlbH0pIHtcbiAgICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnZGF0aXVtLXZpZXdjaGFuZ2VkJywge1xuICAgICAgICAgICAgYnViYmxlczogZmFsc2UsXG4gICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZGV0YWlsOiBkYXRhXG4gICAgICAgIH0pKTtcbiAgICB9XG59IiwiaW50ZXJmYWNlIElEYXRlUGFydCB7XG4gICAgaW5jcmVtZW50KCk6dm9pZDtcbiAgICBkZWNyZW1lbnQoKTp2b2lkO1xuICAgIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpOmJvb2xlYW47XG4gICAgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpOmJvb2xlYW47XG4gICAgZ2V0VmFsdWUoKTpEYXRlO1xuICAgIGdldFJlZ0V4KCk6UmVnRXhwO1xuICAgIHNldFNlbGVjdGFibGUoc2VsZWN0YWJsZTpib29sZWFuKTpJRGF0ZVBhcnQ7XG4gICAgZ2V0TWF4QnVmZmVyKCk6bnVtYmVyO1xuICAgIGdldExldmVsKCk6TGV2ZWw7XG4gICAgaXNTZWxlY3RhYmxlKCk6Ym9vbGVhbjtcbiAgICB0b1N0cmluZygpOnN0cmluZztcbn1cblxuY2xhc3MgUGxhaW5UZXh0IGltcGxlbWVudHMgSURhdGVQYXJ0IHtcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHRleHQ6c3RyaW5nKSB7fVxuICAgIHB1YmxpYyBpbmNyZW1lbnQoKSB7fVxuICAgIHB1YmxpYyBkZWNyZW1lbnQoKSB7fVxuICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKCkgeyByZXR1cm4gZmFsc2UgfVxuICAgIHB1YmxpYyBzZXRWYWx1ZSgpIHsgcmV0dXJuIGZhbHNlIH1cbiAgICBwdWJsaWMgZ2V0VmFsdWUoKTpEYXRlIHsgcmV0dXJuIG51bGwgfVxuICAgIHB1YmxpYyBnZXRSZWdFeCgpOlJlZ0V4cCB7IHJldHVybiBuZXcgUmVnRXhwKGBbJHt0aGlzLnRleHR9XWApOyB9XG4gICAgcHVibGljIHNldFNlbGVjdGFibGUoc2VsZWN0YWJsZTpib29sZWFuKTpJRGF0ZVBhcnQgeyByZXR1cm4gdGhpcyB9XG4gICAgcHVibGljIGdldE1heEJ1ZmZlcigpOm51bWJlciB7IHJldHVybiAwIH1cbiAgICBwdWJsaWMgZ2V0TGV2ZWwoKTpMZXZlbCB7IHJldHVybiBMZXZlbC5OT05FIH1cbiAgICBwdWJsaWMgaXNTZWxlY3RhYmxlKCk6Ym9vbGVhbiB7IHJldHVybiBmYWxzZSB9XG4gICAgcHVibGljIHRvU3RyaW5nKCk6c3RyaW5nIHsgcmV0dXJuIHRoaXMudGV4dCB9XG59XG4gICAgXG5sZXQgZm9ybWF0QmxvY2tzID0gKGZ1bmN0aW9uKCkgeyAgICBcbiAgICBjbGFzcyBEYXRlUGFydCB7XG4gICAgICAgIHByb3RlY3RlZCBkYXRlOkRhdGU7XG4gICAgICAgIHByb3RlY3RlZCBzZWxlY3RhYmxlOmJvb2xlYW4gPSB0cnVlO1xuICAgICAgICBcbiAgICAgICAgcHVibGljIGdldFZhbHVlKCk6RGF0ZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBzZXRTZWxlY3RhYmxlKHNlbGVjdGFibGU6Ym9vbGVhbikge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RhYmxlID0gc2VsZWN0YWJsZTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgaXNTZWxlY3RhYmxlKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0YWJsZTtcbiAgICAgICAgfSAgIFxuICAgICAgICBcbiAgICAgICAgcHJvdGVjdGVkIHBhZChudW06bnVtYmVyLCBzaXplOm51bWJlciA9IDIpIHtcbiAgICAgICAgICAgIGxldCBzdHIgPSBudW0udG9TdHJpbmcoKTtcbiAgICAgICAgICAgIHdoaWxlKHN0ci5sZW5ndGggPCBzaXplKSBzdHIgPSAnMCcgKyBzdHI7XG4gICAgICAgICAgICByZXR1cm4gc3RyO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGNsYXNzIEZvdXJEaWdpdFllYXIgZXh0ZW5kcyBEYXRlUGFydCB7XG4gICAgICAgIHB1YmxpYyBpbmNyZW1lbnQoKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0RnVsbFllYXIodGhpcy5kYXRlLmdldEZ1bGxZZWFyKCkgKyAxKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGRlY3JlbWVudCgpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRGdWxsWWVhcih0aGlzLmRhdGUuZ2V0RnVsbFllYXIoKSAtIDEpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xuICAgICAgICAgICAgaWYgKHRoaXMuZ2V0UmVnRXgoKS50ZXN0KHBhcnRpYWwpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUocGFydGlhbCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKHZhbHVlLnZhbHVlT2YoKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldEZ1bGxZZWFyKHBhcnNlSW50KHZhbHVlLCAxMCkpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XG4gICAgICAgICAgICByZXR1cm4gL14tP1xcZHsxLDR9JC87XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKSB7XG4gICAgICAgICAgICByZXR1cm4gNDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGdldExldmVsKCkge1xuICAgICAgICAgICAgcmV0dXJuIExldmVsLllFQVI7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0RnVsbFllYXIoKS50b1N0cmluZygpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGNsYXNzIFR3b0RpZ2l0WWVhciBleHRlbmRzIEZvdXJEaWdpdFllYXIge1xuICAgICAgICBwdWJsaWMgZ2V0TWF4QnVmZmVyKCkge1xuICAgICAgICAgICAgcmV0dXJuIDI7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHRoaXMuZ2V0UmVnRXgoKS50ZXN0KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGxldCBiYXNlID0gTWF0aC5mbG9vcihzdXBlci5nZXRWYWx1ZSgpLmdldEZ1bGxZZWFyKCkvMTAwKSoxMDA7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldEZ1bGxZZWFyKHBhcnNlSW50KDxzdHJpbmc+dmFsdWUsIDEwKSArIGJhc2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XG4gICAgICAgICAgICByZXR1cm4gL15cXC0/ZHsxLDJ9JC87XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcbiAgICAgICAgICAgIHJldHVybiBzdXBlci50b1N0cmluZygpLnNsaWNlKC0yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBjbGFzcyBMb25nTW9udGhOYW1lIGV4dGVuZHMgRGF0ZVBhcnQge1xuICAgICAgICBwcm90ZWN0ZWQgZ2V0TW9udGhzKCkge1xuICAgICAgICAgICAgcmV0dXJuIFtcIkphbnVhcnlcIiwgXCJGZWJydWFyeVwiLCBcIk1hcmNoXCIsIFwiQXByaWxcIiwgXCJNYXlcIiwgXCJKdW5lXCIsIFwiSnVseVwiLCBcIkF1Z3VzdFwiLCBcIlNlcHRlbWJlclwiLCBcIk9jdG9iZXJcIiwgXCJOb3ZlbWJlclwiLCBcIkRlY2VtYmVyXCJdO1xuICAgICAgICB9IFxuICAgICAgICBcbiAgICAgICAgcHVibGljIGluY3JlbWVudCgpIHtcbiAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0TW9udGgoKSArIDE7XG4gICAgICAgICAgICBpZiAobnVtID4gMTEpIG51bSA9IDA7XG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0TW9udGgobnVtKTtcbiAgICAgICAgICAgIHdoaWxlICh0aGlzLmRhdGUuZ2V0TW9udGgoKSA+IG51bSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXREYXRlKHRoaXMuZGF0ZS5nZXREYXRlKCkgLSAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGRlY3JlbWVudCgpIHtcbiAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0TW9udGgoKSAtIDE7XG4gICAgICAgICAgICBpZiAobnVtIDwgMCkgbnVtID0gMTE7XG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0TW9udGgobnVtKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcbiAgICAgICAgICAgIGxldCBtb250aCA9IHRoaXMuZ2V0TW9udGhzKCkuZmlsdGVyKChtb250aCkgPT4ge1xuICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoYF4ke3BhcnRpYWx9LiokYCwgJ2knKS50ZXN0KG1vbnRoKTsgXG4gICAgICAgICAgICB9KVswXTtcbiAgICAgICAgICAgIGlmIChtb250aCAhPT0gdm9pZCAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUobW9udGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5nZXRNb250aHMoKS5pbmRleE9mKHZhbHVlKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0TW9udGgobnVtKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoYF4oKCR7dGhpcy5nZXRNb250aHMoKS5qb2luKFwiKXwoXCIpfSkpJGAsICdpJyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKSB7XG4gICAgICAgICAgICByZXR1cm4gMztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGdldExldmVsKCkge1xuICAgICAgICAgICAgcmV0dXJuIExldmVsLk1PTlRIO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRNb250aHMoKVt0aGlzLmRhdGUuZ2V0TW9udGgoKV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgY2xhc3MgU2hvcnRNb250aE5hbWUgZXh0ZW5kcyBMb25nTW9udGhOYW1lIHtcbiAgICAgICAgcHJvdGVjdGVkIGdldE1vbnRocygpIHtcbiAgICAgICAgICAgIHJldHVybiBbXCJKYW5cIiwgXCJGZWJcIiwgXCJNYXJcIiwgXCJBcHJcIiwgXCJNYXlcIiwgXCJKdW5cIiwgXCJKdWxcIiwgXCJBdWdcIiwgXCJTZXBcIiwgXCJPY3RcIiwgXCJOb3ZcIiwgXCJEZWNcIl07XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgY2xhc3MgTW9udGggZXh0ZW5kcyBMb25nTW9udGhOYW1lIHtcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcbiAgICAgICAgICAgIHJldHVybiAyO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xuICAgICAgICAgICAgaWYgKC9eXFxkezEsMn0kLy50ZXN0KHBhcnRpYWwpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUocGFydGlhbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHRoaXMuZ2V0UmVnRXgoKS50ZXN0KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRNb250aChwYXJzZUludCh2YWx1ZSwgMTApKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xuICAgICAgICAgICAgcmV0dXJuIC9eKFsxLTldfCgxWzAtMl0pKSQvO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldE1vbnRoKCkudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBjbGFzcyBQYWRkZWRNb250aCBleHRlbmRzIE1vbnRoIHtcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xuICAgICAgICAgICAgcmV0dXJuIC9eKDBbMS05XSl8KDFbMC0yXSkkLztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcbiAgICAgICAgICAgIGlmICgvXlxcZHsxLDJ9JC8udGVzdChwYXJ0aWFsKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHRoaXMucGFkKHBhcnNlSW50KHBhcnRpYWwsIDEwKSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYWQodGhpcy5kYXRlLmdldE1vbnRoKCkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGNsYXNzIERhdGVOdW1lcmFsIGV4dGVuZHMgRGF0ZVBhcnQge1xuICAgICAgICBwcm90ZWN0ZWQgZGF5c0luTW9udGgoKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGUodGhpcy5kYXRlLmdldEZ1bGxZZWFyKCksIHRoaXMuZGF0ZS5nZXRNb250aCgpICsgMSwgMCkuZ2V0RGF0ZSgpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgaW5jcmVtZW50KCkge1xuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXREYXRlKCkgKyAxO1xuICAgICAgICAgICAgaWYgKG51bSA+IHRoaXMuZGF5c0luTW9udGgoKSkgbnVtID0gMTtcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXREYXRlKG51bSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBkZWNyZW1lbnQoKSB7XG4gICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldERhdGUoKSAtIDE7XG4gICAgICAgICAgICBpZiAobnVtIDwgMSkgbnVtID0gdGhpcy5kYXlzSW5Nb250aCgpO1xuICAgICAgICAgICAgdGhpcy5kYXRlLnNldERhdGUobnVtKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcbiAgICAgICAgICAgIGlmICgvXlxcZHsxLDJ9JC8udGVzdChwYXJ0aWFsKSAmJiBwYXJzZUludChwYXJ0aWFsLCAxMCkgPCB0aGlzLmRheXNJbk1vbnRoKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZShwYXJzZUludChwYXJ0aWFsLCAxMCkudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHRoaXMuZ2V0UmVnRXgoKS50ZXN0KHZhbHVlKSAmJiBwYXJzZUludCh2YWx1ZSwgMTApIDwgdGhpcy5kYXlzSW5Nb250aCgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldERhdGUocGFyc2VJbnQodmFsdWUsIDEwKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcbiAgICAgICAgICAgIHJldHVybiAvXlsxLTNdP1swLTldJC87XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKSB7XG4gICAgICAgICAgICByZXR1cm4gMjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGdldExldmVsKCkge1xuICAgICAgICAgICAgcmV0dXJuIExldmVsLkRBVEU7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0RGF0ZSgpLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgY2xhc3MgUGFkZGVkRGF0ZSBleHRlbmRzIERhdGVOdW1lcmFsIHtcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcbiAgICAgICAgICAgIGlmICgvXmR7MSwyfSQvLnRlc3QocGFydGlhbCkgJiYgcGFyc2VJbnQocGFydGlhbCwgMTApIDwgdGhpcy5kYXlzSW5Nb250aCgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUodGhpcy5wYWQocGFyc2VJbnQocGFydGlhbCwgMTApKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcbiAgICAgICAgICAgIHJldHVybiAvXlswLTNdWzAtOV0kLztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFkKHRoaXMuZGF0ZS5nZXREYXRlKCkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGNsYXNzIERhdGVPcmRpbmFsIGV4dGVuZHMgRGF0ZU51bWVyYWwge1xuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XG4gICAgICAgICAgICByZXR1cm4gL15bMS0zXT9bMC05XSgoc3QpfChuZCl8KHJkKXwodGgpKSQvaTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgbGV0IGRhdGUgPSB0aGlzLmRhdGUuZ2V0RGF0ZSgpO1xuICAgICAgICAgICAgbGV0IGogPSBkYXRlICUgMTA7XG4gICAgICAgICAgICBsZXQgayA9IGRhdGUgJSAxMDA7XG4gICAgICAgICAgICBpZiAoaiA9PSAxICYmIGsgIT0gMTEpIHJldHVybiBkYXRlICsgXCJzdFwiO1xuICAgICAgICAgICAgaWYgKGogPT0gMiAmJiBrICE9IDEyKSByZXR1cm4gZGF0ZSArIFwibmRcIjtcbiAgICAgICAgICAgIGlmIChqID09IDMgJiYgayAhPSAxMykgcmV0dXJuIGRhdGUgKyBcInJkXCI7XG4gICAgICAgICAgICByZXR1cm4gZGF0ZSArIFwidGhcIjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBcbiAgICBjbGFzcyBIb3VyIGV4dGVuZHMgRGF0ZVBhcnQgeyAgICAgICAgXG4gICAgICAgIHB1YmxpYyBpbmNyZW1lbnQoKSB7XG4gICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldEhvdXJzKCkgKyAxO1xuICAgICAgICAgICAgaWYgKG51bSA+IDIzKSBudW0gPSAwO1xuICAgICAgICAgICAgdGhpcy5kYXRlLnNldEhvdXJzKG51bSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBkZWNyZW1lbnQoKSB7XG4gICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldEhvdXJzKCkgLSAxO1xuICAgICAgICAgICAgaWYgKG51bSA8IDApIG51bSA9IDIzO1xuICAgICAgICAgICAgdGhpcy5kYXRlLnNldEhvdXJzKG51bSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XG4gICAgICAgICAgICBsZXQgbnVtID0gcGFyc2VJbnQocGFydGlhbCwgMTApO1xuICAgICAgICAgICAgaWYgKC9eXFxkezEsMn0kLy50ZXN0KHBhcnRpYWwpICYmIG51bSA8IDI0ICYmIG51bSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUobnVtLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnMocGFyc2VJbnQodmFsdWUsIDEwKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcbiAgICAgICAgICAgIHJldHVybiAvXlsxLTVdP1swLTldJC87XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKSB7XG4gICAgICAgICAgICByZXR1cm4gMjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGdldExldmVsKCkge1xuICAgICAgICAgICAgcmV0dXJuIExldmVsLkhPVVI7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcbiAgICAgICAgICAgIGxldCBob3VycyA9IHRoaXMuZGF0ZS5nZXRIb3VycygpO1xuICAgICAgICAgICAgaWYgKGhvdXJzID4gMTIpIGhvdXJzIC09IDEyO1xuICAgICAgICAgICAgaWYgKGhvdXJzID09PSAwKSBob3VycyA9IDEyO1xuICAgICAgICAgICAgcmV0dXJuIGhvdXJzLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgY2xhc3MgUGFkZGVkTWludXRlIGV4dGVuZHMgRGF0ZVBhcnQgeyAgICAgICAgXG4gICAgICAgIHB1YmxpYyBpbmNyZW1lbnQoKSB7XG4gICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldE1pbnV0ZXMoKSArIDE7XG4gICAgICAgICAgICBpZiAobnVtID4gNTkpIG51bSA9IDA7XG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0TWludXRlcyhudW0pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgZGVjcmVtZW50KCkge1xuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRNaW51dGVzKCkgLSAxO1xuICAgICAgICAgICAgaWYgKG51bSA8IDApIG51bSA9IDU5O1xuICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1pbnV0ZXMobnVtKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcbiAgICAgICAgICAgIGxldCBudW0gPSBwYXJzZUludChwYXJ0aWFsLCAxMCk7XG4gICAgICAgICAgICBpZiAoL15cXGR7MSwyfSQvLnRlc3QocGFydGlhbCkgJiYgbnVtIDwgNjAgJiYgbnVtID49IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0aGlzLnBhZChudW0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKHZhbHVlLnZhbHVlT2YoKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1pbnV0ZXMocGFyc2VJbnQodmFsdWUsIDEwKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcbiAgICAgICAgICAgIHJldHVybiAvXlswLTVdWzAtOV0kLztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcbiAgICAgICAgICAgIHJldHVybiAyO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XG4gICAgICAgICAgICByZXR1cm4gTGV2ZWwuTUlOVVRFO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYWQodGhpcy5kYXRlLmdldE1pbnV0ZXMoKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgY2xhc3MgVXBwZXJjYXNlTWVyaWRpZW0gZXh0ZW5kcyBEYXRlUGFydCB7ICAgICAgICBcbiAgICAgICAgcHVibGljIGluY3JlbWVudCgpIHtcbiAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0SG91cnMoKSArIDEyO1xuICAgICAgICAgICAgaWYgKG51bSA+IDIzKSBudW0gLT0gMjQ7XG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnMobnVtKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGRlY3JlbWVudCgpIHtcbiAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0SG91cnMoKSAtIDEyO1xuICAgICAgICAgICAgaWYgKG51bSA8IDApIG51bSArPSAyNDtcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3VycyhudW0pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xuICAgICAgICAgICAgaWYgKC9eKChBTT8pfChQTT8pKSQvaS50ZXN0KHBhcnRpYWwpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUocGFydGlhbFswXSA9PT0gJ0EnID8gJ0FNJyA6ICdQTScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUudG9Mb3dlckNhc2UoKSA9PT0gJ2FtJyAmJiB0aGlzLmRhdGUuZ2V0SG91cnMoKSA+IDExKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3Vycyh0aGlzLmRhdGUuZ2V0SG91cnMoKSAtIDEyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlLnRvTG93ZXJDYXNlKCkgPT09ICdwbScgJiYgdGhpcy5kYXRlLmdldEhvdXJzKCkgPCAxMikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnModGhpcy5kYXRlLmdldEhvdXJzKCkgKyAxMik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XG4gICAgICAgICAgICByZXR1cm4gTGV2ZWwuSE9VUjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcbiAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XG4gICAgICAgICAgICByZXR1cm4gL14oKGFtKXwocG0pKSQvaTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXRIb3VycygpIDwgMTIgPyAnQU0nIDogJ1BNJztcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBjbGFzcyBMb3dlcmNhc2VNZXJpZGllbSBleHRlbmRzIFVwcGVyY2FzZU1lcmlkaWVtIHsgICAgICAgIFxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gc3VwZXIudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGxldCBmb3JtYXRCbG9ja3M6eyBba2V5OnN0cmluZ106IG5ldyAoKSA9PiBJRGF0ZVBhcnQ7IH0gPSB7fTtcbiAgICBcbiAgICBmb3JtYXRCbG9ja3NbJ1lZWVknXSA9IEZvdXJEaWdpdFllYXI7XG4gICAgZm9ybWF0QmxvY2tzWydZWSddID0gVHdvRGlnaXRZZWFyO1xuICAgIGZvcm1hdEJsb2Nrc1snTU1NTSddID0gTG9uZ01vbnRoTmFtZTtcbiAgICBmb3JtYXRCbG9ja3NbJ01NTSddID0gU2hvcnRNb250aE5hbWU7XG4gICAgZm9ybWF0QmxvY2tzWydNTSddID0gUGFkZGVkTW9udGg7XG4gICAgZm9ybWF0QmxvY2tzWydNJ10gPSBNb250aDtcbiAgICBmb3JtYXRCbG9ja3NbJ0REJ10gPSBQYWRkZWREYXRlO1xuICAgIGZvcm1hdEJsb2Nrc1snRG8nXSA9IERhdGVPcmRpbmFsO1xuICAgIGZvcm1hdEJsb2Nrc1snRCddID0gRGF0ZU51bWVyYWw7XG4gICAgLy8gZGRkZFxuICAgIC8vIGRkZFxuICAgIC8vIFhcbiAgICAvLyB4XG4gICAgLy8gSEhcbiAgICAvLyBoaFxuICAgIC8vIEhcbiAgICBmb3JtYXRCbG9ja3NbJ2gnXSA9IEhvdXI7XG4gICAgZm9ybWF0QmxvY2tzWydBJ10gPSBVcHBlcmNhc2VNZXJpZGllbTtcbiAgICBmb3JtYXRCbG9ja3NbJ2EnXSA9IExvd2VyY2FzZU1lcmlkaWVtO1xuICAgIGZvcm1hdEJsb2Nrc1snbW0nXSA9IFBhZGRlZE1pbnV0ZTtcbiAgICAvLyBtXG4gICAgLy8gc3NcbiAgICAvLyBzXG4gICAgLy8gWlpcbiAgICAvLyBaXG4gICAgXG4gICAgcmV0dXJuIGZvcm1hdEJsb2Nrcztcbn0pKCk7XG5cblxuIiwiY2xhc3MgSW5wdXQge1xuICAgIHByaXZhdGUgb3B0aW9uczpJT3B0aW9ucztcbiAgICBwcml2YXRlIHNlbGVjdGVkRGF0ZVBhcnQ6SURhdGVQYXJ0O1xuICAgIHByaXZhdGUgdGV4dEJ1ZmZlcjpzdHJpbmcgPSAnJztcbiAgICBcbiAgICBwdWJsaWMgZGF0ZVBhcnRzOklEYXRlUGFydFtdO1xuICAgIHB1YmxpYyBmb3JtYXQ6UmVnRXhwO1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBlbGVtZW50OkhUTUxJbnB1dEVsZW1lbnQpIHtcbiAgICAgICAgbmV3IEtleWJvYXJkRXZlbnRIYW5kbGVyKHRoaXMpO1xuICAgICAgICBuZXcgTW91c2VFdmVudEhhbmRsZXIodGhpcyk7XG4gICAgICAgIG5ldyBQYXN0ZUV2ZW50SGFuZGVyKHRoaXMpO1xuICAgICAgICBcbiAgICAgICAgbGlzdGVuLnZpZXdjaGFuZ2VkKGVsZW1lbnQsIChlKSA9PiB0aGlzLnZpZXdjaGFuZ2VkKGUuZGF0ZSwgZS5sZXZlbCkpO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgZ2V0VGV4dEJ1ZmZlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGV4dEJ1ZmZlcjtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHNldFRleHRCdWZmZXIobmV3QnVmZmVyOnN0cmluZykge1xuICAgICAgICB0aGlzLnRleHRCdWZmZXIgPSBuZXdCdWZmZXI7XG4gICAgICAgIFxuICAgICAgICBpZiAodGhpcy50ZXh0QnVmZmVyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRGF0ZUZyb21CdWZmZXIoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgdXBkYXRlRGF0ZUZyb21CdWZmZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkRGF0ZVBhcnQuc2V0VmFsdWVGcm9tUGFydGlhbCh0aGlzLnRleHRCdWZmZXIpKSB7XG4gICAgICAgICAgICBsZXQgbmV3RGF0ZSA9IHRoaXMuc2VsZWN0ZWREYXRlUGFydC5nZXRWYWx1ZSgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAodGhpcy50ZXh0QnVmZmVyLmxlbmd0aCA+PSB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQuZ2V0TWF4QnVmZmVyKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRleHRCdWZmZXIgPSAnJztcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQgPSB0aGlzLmdldE5leHRTZWxlY3RhYmxlRGF0ZVBhcnQoKTsgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRyaWdnZXIuZ290byh0aGlzLmVsZW1lbnQsIHtcbiAgICAgICAgICAgICAgICBkYXRlOiBuZXdEYXRlLFxuICAgICAgICAgICAgICAgIGxldmVsOiB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQuZ2V0TGV2ZWwoKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnRleHRCdWZmZXIgPSB0aGlzLnRleHRCdWZmZXIuc2xpY2UoMCwgLTEpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBnZXRGaXJzdFNlbGVjdGFibGVEYXRlUGFydCgpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmRhdGVQYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHRoaXMuZGF0ZVBhcnRzW2ldLmlzU2VsZWN0YWJsZSgpKVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGVQYXJ0c1tpXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRMYXN0U2VsZWN0YWJsZURhdGVQYXJ0KCkge1xuICAgICAgICBmb3IgKGxldCBpID0gdGhpcy5kYXRlUGFydHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGVQYXJ0c1tpXS5pc1NlbGVjdGFibGUoKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlUGFydHNbaV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIGdldE5leHRTZWxlY3RhYmxlRGF0ZVBhcnQoKSB7XG4gICAgICAgIGxldCBpID0gdGhpcy5kYXRlUGFydHMuaW5kZXhPZih0aGlzLnNlbGVjdGVkRGF0ZVBhcnQpO1xuICAgICAgICB3aGlsZSAoKytpIDwgdGhpcy5kYXRlUGFydHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5kYXRlUGFydHNbaV0uaXNTZWxlY3RhYmxlKCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZVBhcnRzW2ldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQ7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBnZXRQcmV2aW91c1NlbGVjdGFibGVEYXRlUGFydCgpIHtcbiAgICAgICAgbGV0IGkgPSB0aGlzLmRhdGVQYXJ0cy5pbmRleE9mKHRoaXMuc2VsZWN0ZWREYXRlUGFydCk7XG4gICAgICAgIHdoaWxlICgtLWkgPj0gMCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuZGF0ZVBhcnRzW2ldLmlzU2VsZWN0YWJsZSgpKVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGVQYXJ0c1tpXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZERhdGVQYXJ0O1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgZ2V0TmVhcmVzdFNlbGVjdGFibGVEYXRlUGFydChjYXJldFBvc2l0aW9uOm51bWJlcikgeyAgICAgICAgXG4gICAgICAgIGxldCBkaXN0YW5jZTpudW1iZXIgPSBOdW1iZXIuTUFYX1ZBTFVFO1xuICAgICAgICBsZXQgbmVhcmVzdERhdGVQYXJ0OklEYXRlUGFydDtcbiAgICAgICAgbGV0IHN0YXJ0ID0gMDtcbiAgICAgICAgXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5kYXRlUGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBkYXRlUGFydCA9IHRoaXMuZGF0ZVBhcnRzW2ldO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoZGF0ZVBhcnQuaXNTZWxlY3RhYmxlKCkpIHtcbiAgICAgICAgICAgICAgICBsZXQgZnJvbUxlZnQgPSBjYXJldFBvc2l0aW9uIC0gc3RhcnQ7XG4gICAgICAgICAgICAgICAgbGV0IGZyb21SaWdodCA9IGNhcmV0UG9zaXRpb24gLSAoc3RhcnQgKyBkYXRlUGFydC50b1N0cmluZygpLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKGZyb21MZWZ0ID4gMCAmJiBmcm9tUmlnaHQgPCAwKSByZXR1cm4gZGF0ZVBhcnQ7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbGV0IGQgPSBNYXRoLm1pbihNYXRoLmFicyhmcm9tTGVmdCksIE1hdGguYWJzKGZyb21SaWdodCkpO1xuICAgICAgICAgICAgICAgIGlmIChkIDw9IGRpc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIG5lYXJlc3REYXRlUGFydCA9IGRhdGVQYXJ0O1xuICAgICAgICAgICAgICAgICAgICBkaXN0YW5jZSA9IGQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzdGFydCArPSBkYXRlUGFydC50b1N0cmluZygpLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIG5lYXJlc3REYXRlUGFydDsgICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgc2V0U2VsZWN0ZWREYXRlUGFydChkYXRlUGFydDpJRGF0ZVBhcnQpIHtcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWREYXRlUGFydCAhPT0gZGF0ZVBhcnQpIHtcbiAgICAgICAgICAgIHRoaXMudGV4dEJ1ZmZlciA9ICcnO1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZERhdGVQYXJ0ID0gZGF0ZVBhcnQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcHVibGljIGdldFNlbGVjdGVkRGF0ZVBhcnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQ7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyB1cGRhdGVPcHRpb25zKG9wdGlvbnM6SU9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICAgICAgXG4gICAgICAgIHRoaXMuZGF0ZVBhcnRzID0gUGFyc2VyLnBhcnNlKG9wdGlvbnMuZGlzcGxheUFzKTtcbiAgICAgICAgdGhpcy5zZWxlY3RlZERhdGVQYXJ0ID0gdm9pZCAwO1xuICAgICAgICBcbiAgICAgICAgbGV0IGZvcm1hdDpzdHJpbmcgPSAnXic7XG4gICAgICAgIHRoaXMuZGF0ZVBhcnRzLmZvckVhY2goKGRhdGVQYXJ0KSA9PiB7XG4gICAgICAgICAgICBmb3JtYXQgKz0gZGF0ZVBhcnQuZ2V0UmVnRXgoKS5zb3VyY2Uuc2xpY2UoMSwtMSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmZvcm1hdCA9IG5ldyBSZWdFeHAoZm9ybWF0KyckJywgJ2knKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgdGhpcy51cGRhdGVWaWV3KCk7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyB1cGRhdGVWaWV3KCkge1xuICAgICAgICBsZXQgZGF0ZVN0cmluZyA9ICcnO1xuICAgICAgICB0aGlzLmRhdGVQYXJ0cy5mb3JFYWNoKChkYXRlUGFydCkgPT4ge1xuICAgICAgICAgICAgaWYgKGRhdGVQYXJ0LmdldFZhbHVlKCkgPT09IHZvaWQgMCkgcmV0dXJuO1xuICAgICAgICAgICAgZGF0ZVN0cmluZyArPSBkYXRlUGFydC50b1N0cmluZygpOyBcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZWxlbWVudC52YWx1ZSA9IGRhdGVTdHJpbmc7XG4gICAgICAgIFxuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZERhdGVQYXJ0ID09PSB2b2lkIDApIHJldHVybjtcbiAgICAgICAgXG4gICAgICAgIGxldCBzdGFydCA9IDA7XG4gICAgICAgIFxuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIHdoaWxlICh0aGlzLmRhdGVQYXJ0c1tpXSAhPT0gdGhpcy5zZWxlY3RlZERhdGVQYXJ0KSB7XG4gICAgICAgICAgICBzdGFydCArPSB0aGlzLmRhdGVQYXJ0c1tpKytdLnRvU3RyaW5nKCkubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBsZXQgZW5kID0gc3RhcnQgKyB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQudG9TdHJpbmcoKS5sZW5ndGg7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmVsZW1lbnQuc2V0U2VsZWN0aW9uUmFuZ2Uoc3RhcnQsIGVuZCk7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyB2aWV3Y2hhbmdlZChkYXRlOkRhdGUsIGxldmVsOkxldmVsKSB7XG4gICAgICAgIHRoaXMuZGF0ZVBhcnRzLmZvckVhY2goKGRhdGVQYXJ0KSA9PiB7XG4gICAgICAgICAgICBkYXRlUGFydC5zZXRWYWx1ZShkYXRlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xuICAgIH1cbn0iLCJjb25zdCBlbnVtIEtFWSB7XG4gICAgUklHSFQgPSAzOSwgTEVGVCA9IDM3LCBUQUIgPSA5LCBVUCA9IDM4LFxuICAgIERPV04gPSA0MCwgViA9IDg2LCBDID0gNjcsIEEgPSA2NSwgSE9NRSA9IDM2LFxuICAgIEVORCA9IDM1LCBCQUNLU1BBQ0UgPSA4XG59XG5cbmNsYXNzIEtleWJvYXJkRXZlbnRIYW5kbGVyIHtcbiAgICBwcml2YXRlIHNoaWZ0VGFiRG93biA9IGZhbHNlO1xuICAgIHByaXZhdGUgdGFiRG93biA9IGZhbHNlO1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgaW5wdXQ6SW5wdXQpIHtcbiAgICAgICAgaW5wdXQuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoZSkgPT4gdGhpcy5rZXlkb3duKGUpKTtcbiAgICAgICAgaW5wdXQuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiZm9jdXNcIiwgKCkgPT4gdGhpcy5mb2N1cygpKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgKGUpID0+IHRoaXMuZG9jdW1lbnRLZXlkb3duKGUpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGZvY3VzID0gKCk6dm9pZCA9PiB7XG4gICAgICAgIGlmICh0aGlzLnRhYkRvd24pIHtcbiAgICAgICAgICAgIGxldCBmaXJzdCA9IHRoaXMuaW5wdXQuZ2V0Rmlyc3RTZWxlY3RhYmxlRGF0ZVBhcnQoKTtcbiAgICAgICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChmaXJzdCk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgIHRoaXMuaW5wdXQudXBkYXRlVmlldygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zaGlmdFRhYkRvd24pIHtcbiAgICAgICAgICAgIGxldCBsYXN0ID0gdGhpcy5pbnB1dC5nZXRMYXN0U2VsZWN0YWJsZURhdGVQYXJ0KCk7XG4gICAgICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQobGFzdCk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgIHRoaXMuaW5wdXQudXBkYXRlVmlldygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBkb2N1bWVudEtleWRvd24oZTpLZXlib2FyZEV2ZW50KSB7XG4gICAgICAgIGlmIChlLnNoaWZ0S2V5ICYmIGUua2V5Q29kZSA9PT0gS0VZLlRBQikge1xuICAgICAgICAgICAgdGhpcy5zaGlmdFRhYkRvd24gPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKGUua2V5Q29kZSA9PT0gS0VZLlRBQikge1xuICAgICAgICAgICAgdGhpcy50YWJEb3duID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2hpZnRUYWJEb3duID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnRhYkRvd24gPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUga2V5ZG93bihlOktleWJvYXJkRXZlbnQpIHtcbiAgICAgICAgbGV0IGNvZGUgPSBlLmtleUNvZGU7XG4gICAgICAgIGlmIChjb2RlID49IDk2ICYmIGNvZGUgPD0gMTA1KSB7XG4gICAgICAgICAgICBjb2RlIC09IDQ4O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgaWYgKChjb2RlID09PSBLRVkuSE9NRSB8fCBjb2RlID09PSBLRVkuRU5EKSAmJiBlLnNoaWZ0S2V5KSByZXR1cm47XG4gICAgICAgIGlmICgoY29kZSA9PT0gS0VZLkxFRlQgfHwgY29kZSA9PT0gS0VZLlJJR0hUKSAmJiBlLnNoaWZ0S2V5KSByZXR1cm47XG4gICAgICAgIGlmICgoY29kZSA9PT0gS0VZLkMgfHwgY29kZSA9PT0gS0VZLkEgfHwgY29kZSA9PT0gS0VZLlYpICYmIGUuY3RybEtleSkgcmV0dXJuO1xuICAgICAgICBcbiAgICAgICAgbGV0IHByZXZlbnREZWZhdWx0ID0gdHJ1ZTtcbiAgICAgICAgXG4gICAgICAgIGlmIChjb2RlID09PSBLRVkuSE9NRSkge1xuICAgICAgICAgICAgdGhpcy5ob21lKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gS0VZLkVORCkge1xuICAgICAgICAgICAgdGhpcy5lbmQoKTtcbiAgICAgICAgfSBlbHNlIGlmIChjb2RlID09PSBLRVkuTEVGVCkge1xuICAgICAgICAgICAgdGhpcy5sZWZ0KCk7XG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gS0VZLlJJR0hUKSB7XG4gICAgICAgICAgICB0aGlzLnJpZ2h0KCk7XG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gS0VZLlRBQiAmJiBlLnNoaWZ0S2V5KSB7XG4gICAgICAgICAgICBwcmV2ZW50RGVmYXVsdCA9IHRoaXMuc2hpZnRUYWIoKTtcbiAgICAgICAgfSBlbHNlIGlmIChjb2RlID09PSBLRVkuVEFCKSB7XG4gICAgICAgICAgICBwcmV2ZW50RGVmYXVsdCA9IHRoaXMudGFiKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gS0VZLlVQKSB7XG4gICAgICAgICAgICB0aGlzLnVwKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gS0VZLkRPV04pIHtcbiAgICAgICAgICAgIHRoaXMuZG93bigpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAocHJldmVudERlZmF1bHQpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgbGV0IGtleVByZXNzZWQgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGNvZGUpO1xuICAgICAgICBpZiAoL15bMC05XXxbQS16XSQvLnRlc3Qoa2V5UHJlc3NlZCkpIHtcbiAgICAgICAgICAgIGxldCB0ZXh0QnVmZmVyID0gdGhpcy5pbnB1dC5nZXRUZXh0QnVmZmVyKCk7XG4gICAgICAgICAgICB0aGlzLmlucHV0LnNldFRleHRCdWZmZXIodGV4dEJ1ZmZlciArIGtleVByZXNzZWQpO1xuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IEtFWS5CQUNLU1BBQ0UpIHtcbiAgICAgICAgICAgIGxldCB0ZXh0QnVmZmVyID0gdGhpcy5pbnB1dC5nZXRUZXh0QnVmZmVyKCk7XG4gICAgICAgICAgICB0aGlzLmlucHV0LnNldFRleHRCdWZmZXIodGV4dEJ1ZmZlci5zbGljZSgwLCAtMSkpO1xuICAgICAgICB9IGVsc2UgaWYgKCFlLnNoaWZ0S2V5KSB7XG4gICAgICAgICAgICB0aGlzLmlucHV0LnNldFRleHRCdWZmZXIoJycpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIGhvbWUoKSB7XG4gICAgICAgIGxldCBmaXJzdCA9IHRoaXMuaW5wdXQuZ2V0Rmlyc3RTZWxlY3RhYmxlRGF0ZVBhcnQoKTtcbiAgICAgICAgdGhpcy5pbnB1dC5zZXRTZWxlY3RlZERhdGVQYXJ0KGZpcnN0KTtcbiAgICAgICAgdGhpcy5pbnB1dC51cGRhdGVWaWV3KCk7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgZW5kKCkge1xuICAgICAgICBsZXQgbGFzdCA9IHRoaXMuaW5wdXQuZ2V0TGFzdFNlbGVjdGFibGVEYXRlUGFydCgpO1xuICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQobGFzdCk7ICAgICBcbiAgICAgICAgdGhpcy5pbnB1dC51cGRhdGVWaWV3KCk7ICAgXG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgbGVmdCgpIHtcbiAgICAgICAgbGV0IHByZXZpb3VzID0gdGhpcy5pbnB1dC5nZXRQcmV2aW91c1NlbGVjdGFibGVEYXRlUGFydCgpO1xuICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQocHJldmlvdXMpO1xuICAgICAgICB0aGlzLmlucHV0LnVwZGF0ZVZpZXcoKTtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSByaWdodCgpIHtcbiAgICAgICAgbGV0IG5leHQgPSB0aGlzLmlucHV0LmdldE5leHRTZWxlY3RhYmxlRGF0ZVBhcnQoKTtcbiAgICAgICAgdGhpcy5pbnB1dC5zZXRTZWxlY3RlZERhdGVQYXJ0KG5leHQpO1xuICAgICAgICB0aGlzLmlucHV0LnVwZGF0ZVZpZXcoKTtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBzaGlmdFRhYigpIHtcbiAgICAgICAgbGV0IHByZXZpb3VzID0gdGhpcy5pbnB1dC5nZXRQcmV2aW91c1NlbGVjdGFibGVEYXRlUGFydCgpO1xuICAgICAgICBpZiAocHJldmlvdXMgIT09IHRoaXMuaW5wdXQuZ2V0U2VsZWN0ZWREYXRlUGFydCgpKSB7XG4gICAgICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQocHJldmlvdXMpO1xuICAgICAgICAgICAgdGhpcy5pbnB1dC51cGRhdGVWaWV3KCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgdGFiKCkge1xuICAgICAgICBsZXQgbmV4dCA9IHRoaXMuaW5wdXQuZ2V0TmV4dFNlbGVjdGFibGVEYXRlUGFydCgpO1xuICAgICAgICBpZiAobmV4dCAhPT0gdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkpIHtcbiAgICAgICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChuZXh0KTtcbiAgICAgICAgICAgIHRoaXMuaW5wdXQudXBkYXRlVmlldygpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSB1cCgpIHtcbiAgICAgICAgdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuaW5jcmVtZW50KCk7XG4gICAgICAgIFxuICAgICAgICBsZXQgbGV2ZWwgPSB0aGlzLmlucHV0LmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5nZXRMZXZlbCgpO1xuICAgICAgICBsZXQgZGF0ZSA9IHRoaXMuaW5wdXQuZ2V0U2VsZWN0ZWREYXRlUGFydCgpLmdldFZhbHVlKCk7XG4gICAgICAgIFxuICAgICAgICB0cmlnZ2VyLmdvdG8odGhpcy5pbnB1dC5lbGVtZW50LCB7XG4gICAgICAgICAgICBkYXRlOiBkYXRlLFxuICAgICAgICAgICAgbGV2ZWw6IGxldmVsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIGRvd24oKSB7XG4gICAgICAgIHRoaXMuaW5wdXQuZ2V0U2VsZWN0ZWREYXRlUGFydCgpLmRlY3JlbWVudCgpO1xuICAgICAgICBcbiAgICAgICAgbGV0IGxldmVsID0gdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0TGV2ZWwoKTtcbiAgICAgICAgbGV0IGRhdGUgPSB0aGlzLmlucHV0LmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5nZXRWYWx1ZSgpO1xuICAgICAgICBcbiAgICAgICAgdHJpZ2dlci5nb3RvKHRoaXMuaW5wdXQuZWxlbWVudCwge1xuICAgICAgICAgICAgZGF0ZTogZGF0ZSxcbiAgICAgICAgICAgIGxldmVsOiBsZXZlbFxuICAgICAgICB9KTtcbiAgICB9XG59IiwiY2xhc3MgTW91c2VFdmVudEhhbmRsZXIge1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgaW5wdXQ6SW5wdXQpIHtcbiAgICAgICAgbGlzdGVuLm1vdXNlZG93bihpbnB1dC5lbGVtZW50LCAoKSA9PiB0aGlzLm1vdXNlZG93bigpKTtcbiAgICAgICAgbGlzdGVuLm1vdXNldXAoZG9jdW1lbnQsICgpID0+IHRoaXMubW91c2V1cCgpKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFN0b3AgZGVmYXVsdFxuICAgICAgICBpbnB1dC5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnZW50ZXJcIiwgKGUpID0+IGUucHJldmVudERlZmF1bHQoKSk7XG4gICAgICAgIGlucHV0LmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdvdmVyXCIsIChlKSA9PiBlLnByZXZlbnREZWZhdWx0KCkpO1xuICAgICAgICBpbnB1dC5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkcm9wXCIsIChlKSA9PiBlLnByZXZlbnREZWZhdWx0KCkpO1xuICAgICAgICBpbnB1dC5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjdXRcIiwgKGUpID0+IGUucHJldmVudERlZmF1bHQoKSk7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgZG93bjpib29sZWFuO1xuICAgIHByaXZhdGUgY2FyZXRTdGFydDpudW1iZXI7XG4gICAgXG4gICAgcHJpdmF0ZSBtb3VzZWRvd24oKSB7XG4gICAgICAgIHRoaXMuZG93biA9IHRydWU7XG4gICAgICAgIHRoaXMuaW5wdXQuZWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZSh2b2lkIDAsIHZvaWQgMCk7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICB0aGlzLmNhcmV0U3RhcnQgPSB0aGlzLmlucHV0LmVsZW1lbnQuc2VsZWN0aW9uU3RhcnQ7IFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBtb3VzZXVwID0gKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuZG93bikgcmV0dXJuO1xuICAgICAgICB0aGlzLmRvd24gPSBmYWxzZTtcbiAgICAgICAgXG4gICAgICAgIGxldCBwb3M6bnVtYmVyO1xuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXMuaW5wdXQuZWxlbWVudC5zZWxlY3Rpb25TdGFydCA9PT0gdGhpcy5jYXJldFN0YXJ0KSB7XG4gICAgICAgICAgICBwb3MgPSB0aGlzLmlucHV0LmVsZW1lbnQuc2VsZWN0aW9uRW5kO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcG9zID0gdGhpcy5pbnB1dC5lbGVtZW50LnNlbGVjdGlvblN0YXJ0O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBsZXQgYmxvY2sgPSB0aGlzLmlucHV0LmdldE5lYXJlc3RTZWxlY3RhYmxlRGF0ZVBhcnQocG9zKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChibG9jayk7XG4gICAgICAgIFxuICAgICAgICBpZiAodGhpcy5pbnB1dC5lbGVtZW50LnNlbGVjdGlvblN0YXJ0ID4gMCB8fCB0aGlzLmlucHV0LmVsZW1lbnQuc2VsZWN0aW9uRW5kIDwgdGhpcy5pbnB1dC5lbGVtZW50LnZhbHVlLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5pbnB1dC51cGRhdGVWaWV3KCk7XG4gICAgICAgIH1cbiAgICB9O1xufSIsImNsYXNzIFBhcnNlciB7XG4gICAgcHVibGljIHN0YXRpYyBwYXJzZShmb3JtYXQ6c3RyaW5nKTpJRGF0ZVBhcnRbXSB7XG4gICAgICAgIGxldCB0ZXh0QnVmZmVyID0gJyc7XG4gICAgICAgIGxldCBkYXRlUGFydHM6SURhdGVQYXJ0W10gPSBbXTtcbiAgICBcbiAgICAgICAgbGV0IGluZGV4ID0gMDsgICAgICAgICAgICAgICAgXG4gICAgICAgIGxldCBpbkVzY2FwZWRTZWdtZW50ID0gZmFsc2U7XG4gICAgICAgIFxuICAgICAgICBsZXQgcHVzaFBsYWluVGV4dCA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICh0ZXh0QnVmZmVyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBkYXRlUGFydHMucHVzaChuZXcgUGxhaW5UZXh0KHRleHRCdWZmZXIpLnNldFNlbGVjdGFibGUoZmFsc2UpKTtcbiAgICAgICAgICAgICAgICB0ZXh0QnVmZmVyID0gJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHdoaWxlIChpbmRleCA8IGZvcm1hdC5sZW5ndGgpIHsgICAgIFxuICAgICAgICAgICAgaWYgKCFpbkVzY2FwZWRTZWdtZW50ICYmIGZvcm1hdFtpbmRleF0gPT09ICdbJykge1xuICAgICAgICAgICAgICAgIGluRXNjYXBlZFNlZ21lbnQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChpbkVzY2FwZWRTZWdtZW50ICYmIGZvcm1hdFtpbmRleF0gPT09ICddJykge1xuICAgICAgICAgICAgICAgIGluRXNjYXBlZFNlZ21lbnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoaW5Fc2NhcGVkU2VnbWVudCkge1xuICAgICAgICAgICAgICAgIHRleHRCdWZmZXIgKz0gZm9ybWF0W2luZGV4XTtcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgZm91bmQgPSBmYWxzZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yIChsZXQgY29kZSBpbiBmb3JtYXRCbG9ja3MpIHtcbiAgICAgICAgICAgICAgICBpZiAoUGFyc2VyLmZpbmRBdChmb3JtYXQsIGluZGV4LCBgeyR7Y29kZX19YCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcHVzaFBsYWluVGV4dCgpO1xuICAgICAgICAgICAgICAgICAgICBkYXRlUGFydHMucHVzaChuZXcgZm9ybWF0QmxvY2tzW2NvZGVdKCkuc2V0U2VsZWN0YWJsZShmYWxzZSkpO1xuICAgICAgICAgICAgICAgICAgICBpbmRleCArPSBjb2RlLmxlbmd0aCArIDI7XG4gICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChQYXJzZXIuZmluZEF0KGZvcm1hdCwgaW5kZXgsIGNvZGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHB1c2hQbGFpblRleHQoKTtcbiAgICAgICAgICAgICAgICAgICAgZGF0ZVBhcnRzLnB1c2gobmV3IGZvcm1hdEJsb2Nrc1tjb2RlXSgpKTtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggKz0gY29kZS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoIWZvdW5kKSB7XG4gICAgICAgICAgICAgICAgdGV4dEJ1ZmZlciArPSBmb3JtYXRbaW5kZXhdO1xuICAgICAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVzaFBsYWluVGV4dCgpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gZGF0ZVBhcnRzO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIHN0YXRpYyBmaW5kQXQgKHN0cjpzdHJpbmcsIGluZGV4Om51bWJlciwgc2VhcmNoOnN0cmluZykge1xuICAgICAgICByZXR1cm4gc3RyLnNsaWNlKGluZGV4LCBpbmRleCArIHNlYXJjaC5sZW5ndGgpID09PSBzZWFyY2g7XG4gICAgfVxufSIsImNsYXNzIFBhc3RlRXZlbnRIYW5kZXIge1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgaW5wdXQ6SW5wdXQpIHtcbiAgICAgICAgbGlzdGVuLnBhc3RlKGlucHV0LmVsZW1lbnQsICgpID0+IHRoaXMucGFzdGUoKSk7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgcGFzdGUoKSB7XG4gICAgICAgIGxldCBvcmlnaW5hbFZhbHVlID0gdGhpcy5pbnB1dC5lbGVtZW50LnZhbHVlO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgaWYgKCF0aGlzLmlucHV0LmZvcm1hdC50ZXN0KHRoaXMuaW5wdXQuZWxlbWVudC52YWx1ZSkpIHtcbiAgICAgICAgICAgICAgIHRoaXMuaW5wdXQuZWxlbWVudC52YWx1ZSA9IG9yaWdpbmFsVmFsdWU7XG4gICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgIH0gXG4gICAgICAgICAgIFxuICAgICAgICAgICBsZXQgbmV3RGF0ZSA9IHRoaXMuaW5wdXQuZ2V0U2VsZWN0ZWREYXRlUGFydCgpLmdldFZhbHVlKCk7XG4gICAgICAgICAgIFxuICAgICAgICAgICBsZXQgc3RyUHJlZml4ID0gJyc7XG4gICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5pbnB1dC5kYXRlUGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgIGxldCBkYXRlUGFydCA9IHRoaXMuaW5wdXQuZGF0ZVBhcnRzW2ldO1xuICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICBsZXQgcmVnRXhwID0gbmV3IFJlZ0V4cChkYXRlUGFydC5nZXRSZWdFeCgpLnNvdXJjZS5zbGljZSgxLCAtMSksICdpJyk7XG4gICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgIGxldCB2YWwgPSB0aGlzLmlucHV0LmVsZW1lbnQudmFsdWUucmVwbGFjZShzdHJQcmVmaXgsICcnKS5tYXRjaChyZWdFeHApWzBdO1xuICAgICAgICAgICAgICAgc3RyUHJlZml4ICs9IHZhbDtcbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgaWYgKCFkYXRlUGFydC5pc1NlbGVjdGFibGUoKSkgY29udGludWU7XG4gICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgIGRhdGVQYXJ0LnNldFZhbHVlKG5ld0RhdGUpO1xuICAgICAgICAgICAgICAgaWYgKGRhdGVQYXJ0LnNldFZhbHVlKHZhbCkpIHtcbiAgICAgICAgICAgICAgICAgICBuZXdEYXRlID0gZGF0ZVBhcnQuZ2V0VmFsdWUoKTtcbiAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgdGhpcy5pbnB1dC5lbGVtZW50LnZhbHVlID0gb3JpZ2luYWxWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgIH1cbiAgICAgICAgICAgXG4gICAgICAgICAgIHRyaWdnZXIuZ290byh0aGlzLmlucHV0LmVsZW1lbnQsIHtcbiAgICAgICAgICAgICAgIGRhdGU6IG5ld0RhdGUsXG4gICAgICAgICAgICAgICBsZXZlbDogdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0TGV2ZWwoKVxuICAgICAgICAgICB9KTtcbiAgICAgICAgICAgXG4gICAgICAgIH0pO1xuICAgIH1cbn0iLCJjbGFzcyBQaWNrZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHVwZGF0ZShvcHRpb25zOklPcHRpb25zKSB7XG4gICAgICAgIFxuICAgIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
