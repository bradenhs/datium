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
        DatePart.prototype.trim = function (str) {
            while (str[0] === '0' && str.length > 1) {
                str = str.substr(1, str.length);
            }
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
            return /^\d{1,4}$/;
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
            return /^\d{1,2}$/;
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
            return [2, 1, 3, 2, 3, 3, 3, 2, 1, 1, 1, 1][this.date.getMonth()];
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
            return this.date.getMonth() > 0 ? 1 : 2;
        };
        Month.prototype.setValueFromPartial = function (partial) {
            if (/^\d{1,2}$/.test(partial)) {
                var trimmed = this.trim(partial === '0' ? '1' : partial);
                return this.setValue(trimmed);
            }
            return false;
        };
        Month.prototype.setValue = function (value) {
            if (typeof value === 'object') {
                this.date = new Date(value.valueOf());
                return true;
            }
            else if (typeof value === 'string' && this.getRegEx().test(value)) {
                this.date.setMonth(parseInt(value, 10) - 1);
                return true;
            }
            return false;
        };
        Month.prototype.getRegEx = function () {
            return /^([1-9]|(1[0-2]))$/;
        };
        Month.prototype.toString = function () {
            return (this.date.getMonth() + 1).toString();
        };
        return Month;
    })(LongMonthName);
    var PaddedMonth = (function (_super) {
        __extends(PaddedMonth, _super);
        function PaddedMonth() {
            _super.apply(this, arguments);
        }
        PaddedMonth.prototype.setValueFromPartial = function (partial) {
            if (/^\d{1,2}$/.test(partial)) {
                var padded = this.pad(partial === '0' ? '1' : partial);
                return this.setValue(padded);
            }
            return false;
        };
        PaddedMonth.prototype.getRegEx = function () {
            return /^((0[1-9])|(1[0-2]))$/;
        };
        PaddedMonth.prototype.toString = function () {
            return this.pad(_super.prototype.toString.call(this));
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
            if (/^\d{1,2}$/.test(partial)) {
                var trimmed = this.trim(partial === '0' ? '1' : partial);
                return this.setValue(trimmed);
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
            return /^[1-9]|((1|2)[0-9])|(3[0-1])$/;
        };
        DateNumeral.prototype.getMaxBuffer = function () {
            return this.date.getDate() > Math.floor(this.daysInMonth() / 10) ? 1 : 2;
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
            if (/^\d{1,2}$/.test(partial)) {
                var padded = this.pad(partial === '0' ? '1' : partial);
                return this.setValue(padded);
            }
            return false;
        };
        PaddedDate.prototype.getRegEx = function () {
            return /^(0[1-9])|((1|2)[0-9])|(3[0-1])$/;
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
            return /^([1-9]|((1|2)[0-9])|(3[0-1]))((st)|(nd)|(rd)|(th))?$/i;
        };
        DateOrdinal.prototype.toString = function () {
            var date = this.date.getDate();
            var j = date % 10;
            var k = date % 100;
            if (j === 1 && k !== 11)
                return date + "st";
            if (j === 2 && k !== 12)
                return date + "nd";
            if (j === 3 && k !== 13)
                return date + "rd";
            return date + "th";
        };
        return DateOrdinal;
    })(DateNumeral);
    var LongDayName = (function (_super) {
        __extends(LongDayName, _super);
        function LongDayName() {
            _super.apply(this, arguments);
        }
        LongDayName.prototype.getDays = function () {
            return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        };
        LongDayName.prototype.increment = function () {
            var num = this.date.getDay() + 1;
            if (num > 6)
                num = 0;
            this.date.setDate(this.date.getDate() - this.date.getDay() + num);
        };
        LongDayName.prototype.decrement = function () {
            var num = this.date.getDay() - 1;
            if (num < 0)
                num = 6;
            this.date.setDate(this.date.getDate() - this.date.getDay() + num);
        };
        LongDayName.prototype.setValueFromPartial = function (partial) {
            var day = this.getDays().filter(function (day) {
                return new RegExp("^" + partial + ".*$", 'i').test(day);
            })[0];
            if (day !== void 0) {
                return this.setValue(day);
            }
            return false;
        };
        LongDayName.prototype.setValue = function (value) {
            if (typeof value === 'object') {
                this.date = new Date(value.valueOf());
                return true;
            }
            else if (typeof value === 'string' && this.getRegEx().test(value)) {
                var num = this.getDays().indexOf(value);
                this.date.setDate(this.date.getDate() - this.date.getDay() + num);
                return true;
            }
            return false;
        };
        LongDayName.prototype.getRegEx = function () {
            return new RegExp("^((" + this.getDays().join(")|(") + "))$", 'i');
        };
        LongDayName.prototype.getMaxBuffer = function () {
            return [2, 1, 2, 1, 2, 1, 2][this.date.getDay()];
        };
        LongDayName.prototype.getLevel = function () {
            return Level.DATE;
        };
        LongDayName.prototype.toString = function () {
            return this.getDays()[this.date.getDay()];
        };
        return LongDayName;
    })(DatePart);
    var ShortDayName = (function (_super) {
        __extends(ShortDayName, _super);
        function ShortDayName() {
            _super.apply(this, arguments);
        }
        ShortDayName.prototype.getDays = function () {
            return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        };
        return ShortDayName;
    })(LongDayName);
    var PaddedMilitaryHour = (function (_super) {
        __extends(PaddedMilitaryHour, _super);
        function PaddedMilitaryHour() {
            _super.apply(this, arguments);
        }
        PaddedMilitaryHour.prototype.increment = function () {
            var num = this.date.getHours() + 1;
            if (num > 23)
                num = 0;
            this.date.setHours(num);
        };
        PaddedMilitaryHour.prototype.decrement = function () {
            var num = this.date.getHours() - 1;
            if (num < 0)
                num = 23;
            this.date.setHours(num);
        };
        PaddedMilitaryHour.prototype.setValueFromPartial = function (partial) {
            if (/^\d{1,2}$/.test(partial)) {
                var padded = this.pad(partial);
                return this.setValue(padded);
            }
            return false;
        };
        PaddedMilitaryHour.prototype.setValue = function (value) {
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
        PaddedMilitaryHour.prototype.getMaxBuffer = function () {
            return this.date.getHours() > 2 ? 1 : 2;
        };
        PaddedMilitaryHour.prototype.getLevel = function () {
            return Level.HOUR;
        };
        PaddedMilitaryHour.prototype.getRegEx = function () {
            return /^(((0|1)[0-9])|(2[0-3]))$/;
        };
        PaddedMilitaryHour.prototype.toString = function () {
            return this.pad(this.date.getHours());
        };
        return PaddedMilitaryHour;
    })(DatePart);
    var MilitaryHour = (function (_super) {
        __extends(MilitaryHour, _super);
        function MilitaryHour() {
            _super.apply(this, arguments);
        }
        MilitaryHour.prototype.setValueFromPartial = function (partial) {
            if (/^\d{1,2}$/.test(partial)) {
                var trimmed = this.trim(partial);
                return this.setValue(trimmed);
            }
            return false;
        };
        MilitaryHour.prototype.getRegEx = function () {
            return /^((1?[0-9])|(2[0-3]))$/;
        };
        MilitaryHour.prototype.toString = function () {
            return this.date.getHours().toString();
        };
        return MilitaryHour;
    })(PaddedMilitaryHour);
    var PaddedHour = (function (_super) {
        __extends(PaddedHour, _super);
        function PaddedHour() {
            _super.apply(this, arguments);
        }
        PaddedHour.prototype.setValueFromPartial = function (partial) {
            var padded = this.pad(partial === '0' ? '1' : partial);
            return this.setValue(padded);
        };
        PaddedHour.prototype.setValue = function (value) {
            if (typeof value === 'object') {
                this.date = new Date(value.valueOf());
                return true;
            }
            else if (typeof value === 'string' && this.getRegEx().test(value)) {
                var num = parseInt(value, 10);
                if (this.date.getHours() < 12 && num === 12)
                    num = 0;
                if (this.date.getHours() > 11 && num !== 12)
                    num += 12;
                this.date.setHours(num);
                return true;
            }
            return false;
        };
        PaddedHour.prototype.getRegEx = function () {
            return /^(0[1-9])|(1[0-2])$/;
        };
        PaddedHour.prototype.getMaxBuffer = function () {
            return parseInt(this.toString(), 10) > 1 ? 1 : 2;
        };
        PaddedHour.prototype.toString = function () {
            var hours = this.date.getHours();
            if (hours > 12)
                hours -= 12;
            if (hours === 0)
                hours = 12;
            return this.pad(hours);
        };
        return PaddedHour;
    })(PaddedMilitaryHour);
    var Hour = (function (_super) {
        __extends(Hour, _super);
        function Hour() {
            _super.apply(this, arguments);
        }
        Hour.prototype.setValueFromPartial = function (partial) {
            var trimmed = this.trim(partial === '0' ? '1' : partial);
            return this.setValue(trimmed);
        };
        Hour.prototype.getRegEx = function () {
            return /^[1-9]|(1[0-2])$/;
        };
        Hour.prototype.toString = function () {
            return this.trim(_super.prototype.toString.call(this));
        };
        return Hour;
    })(PaddedHour);
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
            return this.setValue(this.pad(partial));
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
            return this.date.getMinutes() > 5 ? 1 : 2;
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
    formatBlocks['dddd'] = LongDayName;
    formatBlocks['ddd'] = ShortDayName;
    formatBlocks['HH'] = PaddedMilitaryHour;
    formatBlocks['hh'] = PaddedHour;
    formatBlocks['H'] = MilitaryHour;
    formatBlocks['h'] = Hour;
    formatBlocks['A'] = UppercaseMeridiem;
    formatBlocks['a'] = LowercaseMeridiem;
    formatBlocks['mm'] = PaddedMinute;
    // m
    // ss
    // s
    // X
    // x
    // ZZ
    // Z
    return formatBlocks;
})();
var Input = (function () {
    function Input(element) {
        var _this = this;
        this.element = element;
        this.textBuffer = "";
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
            format += "(" + datePart.getRegEx().source.slice(1, -1) + ")";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRhdGl1bS50cyIsIkRhdGl1bUludGVybmFscy50cyIsIk9wdGlvblNhbml0aXplci50cyIsImNvbW1vbi9DdXN0b21FdmVudFBvbHlmaWxsLnRzIiwiY29tbW9uL0V2ZW50cy50cyIsImlucHV0L0RhdGVQYXJ0cy50cyIsImlucHV0L0lucHV0LnRzIiwiaW5wdXQvS2V5Ym9hcmRFdmVudEhhbmRsZXIudHMiLCJpbnB1dC9Nb3VzZUV2ZW50SGFuZGxlci50cyIsImlucHV0L1BhcnNlci50cyIsImlucHV0L1Bhc3RlRXZlbnRIYW5kbGVyLnRzIiwicGlja2VyL1BpY2tlci50cyJdLCJuYW1lcyI6WyJjb25zdHJ1Y3RvciIsIkxldmVsIiwiTGV2ZWwuY29uc3RydWN0b3IiLCJEYXRpdW1JbnRlcm5hbHMiLCJEYXRpdW1JbnRlcm5hbHMuY29uc3RydWN0b3IiLCJEYXRpdW1JbnRlcm5hbHMuZ290byIsIkRhdGl1bUludGVybmFscy51cGRhdGVPcHRpb25zIiwiT3B0aW9uU2FuaXRpemVyIiwiT3B0aW9uU2FuaXRpemVyLmNvbnN0cnVjdG9yIiwiT3B0aW9uU2FuaXRpemVyLnNhbml0aXplRGlzcGxheUFzIiwiT3B0aW9uU2FuaXRpemVyLnNhbml0aXplTWluRGF0ZSIsIk9wdGlvblNhbml0aXplci5zYW5pdGl6ZU1heERhdGUiLCJPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVEZWZhdWx0RGF0ZSIsIk9wdGlvblNhbml0aXplci5zYW5pdGl6ZSIsInVzZU5hdGl2ZSIsImxpc3RlbiIsImxpc3Rlbi5hdHRhY2hFdmVudHMiLCJsaXN0ZW4uZm9jdXMiLCJsaXN0ZW4ubW91c2Vkb3duIiwibGlzdGVuLm1vdXNldXAiLCJsaXN0ZW4ucGFzdGUiLCJsaXN0ZW4uZ290byIsImxpc3Rlbi52aWV3Y2hhbmdlZCIsImxpc3Rlbi5yZW1vdmVMaXN0ZW5lcnMiLCJ0cmlnZ2VyIiwidHJpZ2dlci5nb3RvIiwidHJpZ2dlci52aWV3Y2hhbmdlZCIsIlBsYWluVGV4dCIsIlBsYWluVGV4dC5jb25zdHJ1Y3RvciIsIlBsYWluVGV4dC5pbmNyZW1lbnQiLCJQbGFpblRleHQuZGVjcmVtZW50IiwiUGxhaW5UZXh0LnNldFZhbHVlRnJvbVBhcnRpYWwiLCJQbGFpblRleHQuc2V0VmFsdWUiLCJQbGFpblRleHQuZ2V0VmFsdWUiLCJQbGFpblRleHQuZ2V0UmVnRXgiLCJQbGFpblRleHQuc2V0U2VsZWN0YWJsZSIsIlBsYWluVGV4dC5nZXRNYXhCdWZmZXIiLCJQbGFpblRleHQuZ2V0TGV2ZWwiLCJQbGFpblRleHQuaXNTZWxlY3RhYmxlIiwiUGxhaW5UZXh0LnRvU3RyaW5nIiwiRGF0ZVBhcnQiLCJEYXRlUGFydC5jb25zdHJ1Y3RvciIsIkRhdGVQYXJ0LmdldFZhbHVlIiwiRGF0ZVBhcnQuc2V0U2VsZWN0YWJsZSIsIkRhdGVQYXJ0LmlzU2VsZWN0YWJsZSIsIkRhdGVQYXJ0LnBhZCIsIkRhdGVQYXJ0LnRyaW0iLCJGb3VyRGlnaXRZZWFyIiwiRm91ckRpZ2l0WWVhci5jb25zdHJ1Y3RvciIsIkZvdXJEaWdpdFllYXIuaW5jcmVtZW50IiwiRm91ckRpZ2l0WWVhci5kZWNyZW1lbnQiLCJGb3VyRGlnaXRZZWFyLnNldFZhbHVlRnJvbVBhcnRpYWwiLCJGb3VyRGlnaXRZZWFyLnNldFZhbHVlIiwiRm91ckRpZ2l0WWVhci5nZXRSZWdFeCIsIkZvdXJEaWdpdFllYXIuZ2V0TWF4QnVmZmVyIiwiRm91ckRpZ2l0WWVhci5nZXRMZXZlbCIsIkZvdXJEaWdpdFllYXIudG9TdHJpbmciLCJUd29EaWdpdFllYXIiLCJUd29EaWdpdFllYXIuY29uc3RydWN0b3IiLCJUd29EaWdpdFllYXIuZ2V0TWF4QnVmZmVyIiwiVHdvRGlnaXRZZWFyLnNldFZhbHVlIiwiVHdvRGlnaXRZZWFyLmdldFJlZ0V4IiwiVHdvRGlnaXRZZWFyLnRvU3RyaW5nIiwiTG9uZ01vbnRoTmFtZSIsIkxvbmdNb250aE5hbWUuY29uc3RydWN0b3IiLCJMb25nTW9udGhOYW1lLmdldE1vbnRocyIsIkxvbmdNb250aE5hbWUuaW5jcmVtZW50IiwiTG9uZ01vbnRoTmFtZS5kZWNyZW1lbnQiLCJMb25nTW9udGhOYW1lLnNldFZhbHVlRnJvbVBhcnRpYWwiLCJMb25nTW9udGhOYW1lLnNldFZhbHVlIiwiTG9uZ01vbnRoTmFtZS5nZXRSZWdFeCIsIkxvbmdNb250aE5hbWUuZ2V0TWF4QnVmZmVyIiwiTG9uZ01vbnRoTmFtZS5nZXRMZXZlbCIsIkxvbmdNb250aE5hbWUudG9TdHJpbmciLCJTaG9ydE1vbnRoTmFtZSIsIlNob3J0TW9udGhOYW1lLmNvbnN0cnVjdG9yIiwiU2hvcnRNb250aE5hbWUuZ2V0TW9udGhzIiwiTW9udGgiLCJNb250aC5jb25zdHJ1Y3RvciIsIk1vbnRoLmdldE1heEJ1ZmZlciIsIk1vbnRoLnNldFZhbHVlRnJvbVBhcnRpYWwiLCJNb250aC5zZXRWYWx1ZSIsIk1vbnRoLmdldFJlZ0V4IiwiTW9udGgudG9TdHJpbmciLCJQYWRkZWRNb250aCIsIlBhZGRlZE1vbnRoLmNvbnN0cnVjdG9yIiwiUGFkZGVkTW9udGguc2V0VmFsdWVGcm9tUGFydGlhbCIsIlBhZGRlZE1vbnRoLmdldFJlZ0V4IiwiUGFkZGVkTW9udGgudG9TdHJpbmciLCJEYXRlTnVtZXJhbCIsIkRhdGVOdW1lcmFsLmNvbnN0cnVjdG9yIiwiRGF0ZU51bWVyYWwuZGF5c0luTW9udGgiLCJEYXRlTnVtZXJhbC5pbmNyZW1lbnQiLCJEYXRlTnVtZXJhbC5kZWNyZW1lbnQiLCJEYXRlTnVtZXJhbC5zZXRWYWx1ZUZyb21QYXJ0aWFsIiwiRGF0ZU51bWVyYWwuc2V0VmFsdWUiLCJEYXRlTnVtZXJhbC5nZXRSZWdFeCIsIkRhdGVOdW1lcmFsLmdldE1heEJ1ZmZlciIsIkRhdGVOdW1lcmFsLmdldExldmVsIiwiRGF0ZU51bWVyYWwudG9TdHJpbmciLCJQYWRkZWREYXRlIiwiUGFkZGVkRGF0ZS5jb25zdHJ1Y3RvciIsIlBhZGRlZERhdGUuc2V0VmFsdWVGcm9tUGFydGlhbCIsIlBhZGRlZERhdGUuZ2V0UmVnRXgiLCJQYWRkZWREYXRlLnRvU3RyaW5nIiwiRGF0ZU9yZGluYWwiLCJEYXRlT3JkaW5hbC5jb25zdHJ1Y3RvciIsIkRhdGVPcmRpbmFsLmdldFJlZ0V4IiwiRGF0ZU9yZGluYWwudG9TdHJpbmciLCJMb25nRGF5TmFtZSIsIkxvbmdEYXlOYW1lLmNvbnN0cnVjdG9yIiwiTG9uZ0RheU5hbWUuZ2V0RGF5cyIsIkxvbmdEYXlOYW1lLmluY3JlbWVudCIsIkxvbmdEYXlOYW1lLmRlY3JlbWVudCIsIkxvbmdEYXlOYW1lLnNldFZhbHVlRnJvbVBhcnRpYWwiLCJMb25nRGF5TmFtZS5zZXRWYWx1ZSIsIkxvbmdEYXlOYW1lLmdldFJlZ0V4IiwiTG9uZ0RheU5hbWUuZ2V0TWF4QnVmZmVyIiwiTG9uZ0RheU5hbWUuZ2V0TGV2ZWwiLCJMb25nRGF5TmFtZS50b1N0cmluZyIsIlNob3J0RGF5TmFtZSIsIlNob3J0RGF5TmFtZS5jb25zdHJ1Y3RvciIsIlNob3J0RGF5TmFtZS5nZXREYXlzIiwiUGFkZGVkTWlsaXRhcnlIb3VyIiwiUGFkZGVkTWlsaXRhcnlIb3VyLmNvbnN0cnVjdG9yIiwiUGFkZGVkTWlsaXRhcnlIb3VyLmluY3JlbWVudCIsIlBhZGRlZE1pbGl0YXJ5SG91ci5kZWNyZW1lbnQiLCJQYWRkZWRNaWxpdGFyeUhvdXIuc2V0VmFsdWVGcm9tUGFydGlhbCIsIlBhZGRlZE1pbGl0YXJ5SG91ci5zZXRWYWx1ZSIsIlBhZGRlZE1pbGl0YXJ5SG91ci5nZXRNYXhCdWZmZXIiLCJQYWRkZWRNaWxpdGFyeUhvdXIuZ2V0TGV2ZWwiLCJQYWRkZWRNaWxpdGFyeUhvdXIuZ2V0UmVnRXgiLCJQYWRkZWRNaWxpdGFyeUhvdXIudG9TdHJpbmciLCJNaWxpdGFyeUhvdXIiLCJNaWxpdGFyeUhvdXIuY29uc3RydWN0b3IiLCJNaWxpdGFyeUhvdXIuc2V0VmFsdWVGcm9tUGFydGlhbCIsIk1pbGl0YXJ5SG91ci5nZXRSZWdFeCIsIk1pbGl0YXJ5SG91ci50b1N0cmluZyIsIlBhZGRlZEhvdXIiLCJQYWRkZWRIb3VyLmNvbnN0cnVjdG9yIiwiUGFkZGVkSG91ci5zZXRWYWx1ZUZyb21QYXJ0aWFsIiwiUGFkZGVkSG91ci5zZXRWYWx1ZSIsIlBhZGRlZEhvdXIuZ2V0UmVnRXgiLCJQYWRkZWRIb3VyLmdldE1heEJ1ZmZlciIsIlBhZGRlZEhvdXIudG9TdHJpbmciLCJIb3VyIiwiSG91ci5jb25zdHJ1Y3RvciIsIkhvdXIuc2V0VmFsdWVGcm9tUGFydGlhbCIsIkhvdXIuZ2V0UmVnRXgiLCJIb3VyLnRvU3RyaW5nIiwiUGFkZGVkTWludXRlIiwiUGFkZGVkTWludXRlLmNvbnN0cnVjdG9yIiwiUGFkZGVkTWludXRlLmluY3JlbWVudCIsIlBhZGRlZE1pbnV0ZS5kZWNyZW1lbnQiLCJQYWRkZWRNaW51dGUuc2V0VmFsdWVGcm9tUGFydGlhbCIsIlBhZGRlZE1pbnV0ZS5zZXRWYWx1ZSIsIlBhZGRlZE1pbnV0ZS5nZXRSZWdFeCIsIlBhZGRlZE1pbnV0ZS5nZXRNYXhCdWZmZXIiLCJQYWRkZWRNaW51dGUuZ2V0TGV2ZWwiLCJQYWRkZWRNaW51dGUudG9TdHJpbmciLCJVcHBlcmNhc2VNZXJpZGllbSIsIlVwcGVyY2FzZU1lcmlkaWVtLmNvbnN0cnVjdG9yIiwiVXBwZXJjYXNlTWVyaWRpZW0uaW5jcmVtZW50IiwiVXBwZXJjYXNlTWVyaWRpZW0uZGVjcmVtZW50IiwiVXBwZXJjYXNlTWVyaWRpZW0uc2V0VmFsdWVGcm9tUGFydGlhbCIsIlVwcGVyY2FzZU1lcmlkaWVtLnNldFZhbHVlIiwiVXBwZXJjYXNlTWVyaWRpZW0uZ2V0TGV2ZWwiLCJVcHBlcmNhc2VNZXJpZGllbS5nZXRNYXhCdWZmZXIiLCJVcHBlcmNhc2VNZXJpZGllbS5nZXRSZWdFeCIsIlVwcGVyY2FzZU1lcmlkaWVtLnRvU3RyaW5nIiwiTG93ZXJjYXNlTWVyaWRpZW0iLCJMb3dlcmNhc2VNZXJpZGllbS5jb25zdHJ1Y3RvciIsIkxvd2VyY2FzZU1lcmlkaWVtLnRvU3RyaW5nIiwiSW5wdXQiLCJJbnB1dC5jb25zdHJ1Y3RvciIsIklucHV0LmdldFRleHRCdWZmZXIiLCJJbnB1dC5zZXRUZXh0QnVmZmVyIiwiSW5wdXQudXBkYXRlRGF0ZUZyb21CdWZmZXIiLCJJbnB1dC5nZXRGaXJzdFNlbGVjdGFibGVEYXRlUGFydCIsIklucHV0LmdldExhc3RTZWxlY3RhYmxlRGF0ZVBhcnQiLCJJbnB1dC5nZXROZXh0U2VsZWN0YWJsZURhdGVQYXJ0IiwiSW5wdXQuZ2V0UHJldmlvdXNTZWxlY3RhYmxlRGF0ZVBhcnQiLCJJbnB1dC5nZXROZWFyZXN0U2VsZWN0YWJsZURhdGVQYXJ0IiwiSW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydCIsIklucHV0LmdldFNlbGVjdGVkRGF0ZVBhcnQiLCJJbnB1dC51cGRhdGVPcHRpb25zIiwiSW5wdXQudXBkYXRlVmlldyIsIklucHV0LnZpZXdjaGFuZ2VkIiwiS2V5Ym9hcmRFdmVudEhhbmRsZXIiLCJLZXlib2FyZEV2ZW50SGFuZGxlci5jb25zdHJ1Y3RvciIsIktleWJvYXJkRXZlbnRIYW5kbGVyLmRvY3VtZW50S2V5ZG93biIsIktleWJvYXJkRXZlbnRIYW5kbGVyLmtleWRvd24iLCJLZXlib2FyZEV2ZW50SGFuZGxlci5ob21lIiwiS2V5Ym9hcmRFdmVudEhhbmRsZXIuZW5kIiwiS2V5Ym9hcmRFdmVudEhhbmRsZXIubGVmdCIsIktleWJvYXJkRXZlbnRIYW5kbGVyLnJpZ2h0IiwiS2V5Ym9hcmRFdmVudEhhbmRsZXIuc2hpZnRUYWIiLCJLZXlib2FyZEV2ZW50SGFuZGxlci50YWIiLCJLZXlib2FyZEV2ZW50SGFuZGxlci51cCIsIktleWJvYXJkRXZlbnRIYW5kbGVyLmRvd24iLCJNb3VzZUV2ZW50SGFuZGxlciIsIk1vdXNlRXZlbnRIYW5kbGVyLmNvbnN0cnVjdG9yIiwiTW91c2VFdmVudEhhbmRsZXIubW91c2Vkb3duIiwiUGFyc2VyIiwiUGFyc2VyLmNvbnN0cnVjdG9yIiwiUGFyc2VyLnBhcnNlIiwiUGFyc2VyLmZpbmRBdCIsIlBhc3RlRXZlbnRIYW5kZXIiLCJQYXN0ZUV2ZW50SGFuZGVyLmNvbnN0cnVjdG9yIiwiUGFzdGVFdmVudEhhbmRlci5wYXN0ZSIsIlBpY2tlciIsIlBpY2tlci5jb25zdHJ1Y3RvciIsIlBpY2tlci51cGRhdGUiXSwibWFwcGluZ3MiOiJBQUFNLE1BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRztJQUV0QixnQkFBWSxPQUF3QixFQUFFLE9BQWdCO1FBQ2xEQSxJQUFJQSxTQUFTQSxHQUFHQSxJQUFJQSxlQUFlQSxDQUFDQSxPQUFPQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUN0REEsSUFBSUEsQ0FBQ0EsYUFBYUEsR0FBR0EsVUFBQ0EsT0FBZ0JBLElBQUtBLE9BQUFBLFNBQVNBLENBQUNBLGFBQWFBLENBQUNBLE9BQU9BLENBQUNBLEVBQWhDQSxDQUFnQ0EsQ0FBQ0E7SUFDaEZBLENBQUNBO0lBQ0wsYUFBQztBQUFELENBTjBCLEFBTXpCLEdBQUEsQ0FBQTtBQ05EO0lBQUFDO0lBUUFDLENBQUNBO0lBUFVELFVBQUlBLEdBQUdBLENBQUNBLENBQUNBO0lBQ1RBLFdBQUtBLEdBQUdBLENBQUNBLENBQUNBO0lBQ1ZBLFVBQUlBLEdBQUdBLENBQUNBLENBQUNBO0lBQ1RBLFVBQUlBLEdBQUdBLENBQUNBLENBQUNBO0lBQ1RBLFlBQU1BLEdBQUdBLENBQUNBLENBQUNBO0lBQ1hBLFlBQU1BLEdBQUdBLENBQUNBLENBQUNBO0lBQ1hBLFVBQUlBLEdBQUdBLENBQUNBLENBQUNBO0lBQ3BCQSxZQUFDQTtBQUFEQSxDQVJBLEFBUUNBLElBQUE7QUFFRDtJQUtJRSx5QkFBb0JBLE9BQXdCQSxFQUFFQSxPQUFnQkE7UUFMbEVDLGlCQXdDQ0E7UUFuQ3VCQSxZQUFPQSxHQUFQQSxPQUFPQSxDQUFpQkE7UUFKcENBLFlBQU9BLEdBQVlBLEVBQUVBLENBQUNBO1FBSzFCQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxLQUFLQSxLQUFLQSxDQUFDQSxDQUFDQTtZQUFDQSxNQUFNQSxxQkFBcUJBLENBQUNBO1FBQ3BEQSxPQUFPQSxDQUFDQSxZQUFZQSxDQUFDQSxZQUFZQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUU1Q0EsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0EsSUFBSUEsS0FBS0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFHaENBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO1FBRTVCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxFQUFFQSxVQUFDQSxDQUFDQSxJQUFLQSxPQUFBQSxLQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxFQUExQkEsQ0FBMEJBLENBQUNBLENBQUNBO1FBRXhEQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxhQUFhQSxDQUFDQSxFQUFFQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtJQUN2REEsQ0FBQ0E7SUFFTUQsOEJBQUlBLEdBQVhBLFVBQVlBLElBQVNBLEVBQUVBLEtBQVdBO1FBQzlCRSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxLQUFLQSxDQUFDQSxDQUFDQTtZQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxJQUFJQSxFQUFFQSxDQUFDQTtRQUV2Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0EsS0FBS0EsS0FBS0EsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsT0FBT0EsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLEdBQUdBLElBQUlBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBLENBQUNBO1FBQ3BEQSxDQUFDQTtRQUVEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxLQUFLQSxLQUFLQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxPQUFPQSxF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LENBQUNBO1FBQ2ZBLENBQUNBO1FBR0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLGFBQVFBLElBQUlBLElBQUlBLEtBQUtBLFlBQU9BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLFFBQVFBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBO1FBQ2xFQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxhQUFRQSxJQUFJQSxJQUFJQSxLQUFLQSxjQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQTtRQUNwRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsVUFBS0EsSUFBSUEsSUFBSUEsS0FBS0EsVUFBS0EsSUFBSUEsSUFBSUEsS0FBS0EsVUFBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0E7UUFFOUVBLElBQUlBLGNBQWNBLEdBQUdBLElBQUlBLENBQUNBO1FBRTFCQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxhQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNwQkEsSUFBSUEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0E7UUFDaEJBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLFlBQU9BLENBQUNBLENBQUNBLENBQUNBO1lBQzFCQSxJQUFJQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFDQTtRQUNmQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxhQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMzQkEsSUFBSUEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0E7UUFDaEJBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLGNBQVNBLENBQUNBLENBQUNBLENBQUNBO1lBQzVCQSxJQUFJQSxD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QSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDL0RBLFVBQVVBLEdBQUdBLEVBQUVBLENBQUNBO1lBQ3BCQSxDQUFDQTtRQUNMQSxDQUFDQSxDQUFBQTtRQUVEQSxPQUFPQSxLQUFLQSxHQUFHQSxNQUFNQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQTtZQUMzQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsZ0JBQWdCQSxJQUFJQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDN0NBLGdCQUFnQkEsR0FBR0EsSUFBSUEsQ0FBQ0E7Z0JBQ3hCQSxLQUFLQSxFQUFFQSxDQUFDQTtnQkFDUkEsUUFBUUEsQ0FBQ0E7WUFDYkEsQ0FBQ0E7WUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQWdCQSxJQUFJQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDNUNBLGdCQUFnQkEsR0FBR0EsS0FBS0EsQ0FBQ0E7Z0JBQ3pCQSxLQUFLQSxFQUFFQSxDQUFDQTtnQkFDUkEsUUFBUUEsQ0FBQ0E7WUFDYkEsQ0FBQ0E7WUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDbkJBLFVBQVVBLElBQUlBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO2dCQUM1QkEsS0FBS0EsRUFBRUEsQ0FBQ0E7Z0JBQ1JBLFFBQVFBLENBQUNBO1lBQ2JBLENBQUNBO1lBRURBLElBQUlBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBO1lBRWxCQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxJQUFJQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDNUJBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLEVBQUVBLEtBQUtBLEVBQUVBLE1BQUlBLElBQUlBLE1BQUdBLENBQUNBLENBQUNBLENBQUNBLENB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QTtZQUNMQSxDQUFDQTtZQUVEQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxPQUFPQSxFQUFFQTtnQkFDN0JBLElBQUlBLEVBQUVBLE9BQU9BO2dCQUNiQSxLQUFLQSxFQUFFQSxLQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxtQkFBbUJBLEVBQUVBLENBQUNBLFFBQVFBLEVBQUVBO2FBQ3JEQSxDQUFDQSxDQUFDQTtRQUVOQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNQQSxDQUFDQTtJQUNMRix1QkFBQ0E7QUFBREEsQ0ExQ0EsQUEwQ0NBLElBQUE7QUMxQ0Q7SUFDSUc7SUFFQUMsQ0FBQ0E7SUFFTUQsdUJBQU1BLEdBQWJBLFVBQWNBLE9BQWdCQTtJQUU5QkUsQ0FBQ0E7SUFDTEYsYUFBQ0E7QUFBREEsQ0FSQSxBQVFDQSxJQUFBIiwiZmlsZSI6ImRhdGl1bS5qcyIsInNvdXJjZXNDb250ZW50IjpbIig8YW55PndpbmRvdylbJ0RhdGl1bSddID0gY2xhc3MgRGF0aXVtIHtcclxuICAgIHB1YmxpYyB1cGRhdGVPcHRpb25zOihvcHRpb25zOklPcHRpb25zKSA9PiB2b2lkO1xyXG4gICAgY29uc3RydWN0b3IoZWxlbWVudDpIVE1MSW5wdXRFbGVtZW50LCBvcHRpb25zOklPcHRpb25zKSB7XHJcbiAgICAgICAgbGV0IGludGVybmFscyA9IG5ldyBEYXRpdW1JbnRlcm5hbHMoZWxlbWVudCwgb3B0aW9ucyk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVPcHRpb25zID0gKG9wdGlvbnM6SU9wdGlvbnMpID0+IGludGVybmFscy51cGRhdGVPcHRpb25zKG9wdGlvbnMpO1xyXG4gICAgfVxyXG59IiwiY2xhc3MgTGV2ZWwge1xyXG4gICAgc3RhdGljIFlFQVIgPSAwO1xyXG4gICAgc3RhdGljIE1PTlRIID0gMTtcclxuICAgIHN0YXRpYyBEQVRFID0gMjtcclxuICAgIHN0YXRpYyBIT1VSID0gMztcclxuICAgIHN0YXRpYyBNSU5VVEUgPSA0O1xyXG4gICAgc3RhdGljIFNFQ09ORCA9IDU7XHJcbiAgICBzdGF0aWMgTk9ORSA9IDY7XHJcbn1cclxuXHJcbmNsYXNzIERhdGl1bUludGVybmFscyB7XHJcbiAgICBwcml2YXRlIG9wdGlvbnM6SU9wdGlvbnMgPSB7fTtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBpbnB1dDpJbnB1dDtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBlbGVtZW50OkhUTUxJbnB1dEVsZW1lbnQsIG9wdGlvbnM6SU9wdGlvbnMpIHtcclxuICAgICAgICBpZiAoZWxlbWVudCA9PT0gdm9pZCAwKSB0aHJvdyAnZWxlbWVudCBpcyByZXF1aXJlZCc7XHJcbiAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3NwZWxsY2hlY2snLCAnZmFsc2UnKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmlucHV0ID0gbmV3IElucHV0KGVsZW1lbnQpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMudXBkYXRlT3B0aW9ucyhvcHRpb25zKTsgICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi5nb3RvKGVsZW1lbnQsIChlKSA9PiB0aGlzLmdvdG8oZS5kYXRlLCBlLmxldmVsKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5nb3RvKHRoaXMub3B0aW9uc1snZGVmYXVsdERhdGUnXSwgTGV2ZWwuTk9ORSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnb3RvKGRhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWwpIHtcclxuICAgICAgICBpZiAoZGF0ZSA9PT0gdm9pZCAwKSBkYXRlID0gbmV3IERhdGUoKTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLm1pbkRhdGUgIT09IHZvaWQgMCAmJiBkYXRlLnZhbHVlT2YoKSA8IHRoaXMub3B0aW9ucy5taW5EYXRlLnZhbHVlT2YoKSkge1xyXG4gICAgICAgICAgICBkYXRlID0gbmV3IERhdGUodGhpcy5vcHRpb25zLm1pbkRhdGUudmFsdWVPZigpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5tYXhEYXRlICE9PSB2b2lkIDAgJiYgZGF0ZS52YWx1ZU9mKCkgPiB0aGlzLm9wdGlvbnMubWF4RGF0ZS52YWx1ZU9mKCkpIHtcclxuICAgICAgICAgICAgZGF0ZSA9IG5ldyBEYXRlKHRoaXMub3B0aW9ucy5tYXhEYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRyaWdnZXIudmlld2NoYW5nZWQodGhpcy5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgIGRhdGU6IGRhdGUsXHJcbiAgICAgICAgICAgIGxldmVsOiBsZXZlbFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdXBkYXRlT3B0aW9ucyhuZXdPcHRpb25zOklPcHRpb25zID0ge30pIHtcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemUobmV3T3B0aW9ucywgdGhpcy5vcHRpb25zKTsgICAgICAgIFxyXG4gICAgICAgIHRoaXMuaW5wdXQudXBkYXRlT3B0aW9ucyh0aGlzLm9wdGlvbnMpO1xyXG4gICAgfVxyXG59IiwiY2xhc3MgT3B0aW9uU2FuaXRpemVyIHtcclxuICAgIFxyXG4gICAgc3RhdGljIGRmbHREYXRlOkRhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgXHJcbiAgICBzdGF0aWMgc2FuaXRpemVEaXNwbGF5QXMoZGlzcGxheUFzOmFueSwgZGZsdDpzdHJpbmcgPSAnaDptbWEgTU1NIEQsIFlZWVknKSB7XHJcbiAgICAgICAgaWYgKGRpc3BsYXlBcyA9PT0gdm9pZCAwKSByZXR1cm4gZGZsdDtcclxuICAgICAgICBpZiAodHlwZW9mIGRpc3BsYXlBcyAhPT0gJ3N0cmluZycpIHRocm93ICdEaXNwbGF5IGFzIG11c3QgYmUgYSBzdHJpbmcnO1xyXG4gICAgICAgIHJldHVybiBkaXNwbGF5QXM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN0YXRpYyBzYW5pdGl6ZU1pbkRhdGUobWluRGF0ZTphbnksIGRmbHQ6RGF0ZSA9IHZvaWQgMCkge1xyXG4gICAgICAgIGlmIChtaW5EYXRlID09PSB2b2lkIDApIHJldHVybiBkZmx0O1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShtaW5EYXRlKTsgLy9UT0RPIGZpZ3VyZSB0aGlzIG91dCB5ZXNcclxuICAgIH1cclxuICAgIFxyXG4gICAgc3RhdGljIHNhbml0aXplTWF4RGF0ZShtYXhEYXRlOmFueSwgZGZsdDpEYXRlID0gdm9pZCAwKSB7XHJcbiAgICAgICAgaWYgKG1heERhdGUgPT09IHZvaWQgMCkgcmV0dXJuIGRmbHQ7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKG1heERhdGUpOyAvL1RPRE8gZmlndXJlIHRoaXMgb3V0IFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdGF0aWMgc2FuaXRpemVEZWZhdWx0RGF0ZShkZWZhdWx0RGF0ZTphbnksIGRmbHQ6RGF0ZSA9IHRoaXMuZGZsdERhdGUpIHtcclxuICAgICAgICBpZiAoZGVmYXVsdERhdGUgPT09IHZvaWQgMCkgcmV0dXJuIGRmbHQ7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKGRlZmF1bHREYXRlKTsgLy9UT0RPIGZpZ3VyZSB0aGlzIG91dFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdGF0aWMgc2FuaXRpemUob3B0aW9uczpJT3B0aW9ucywgZGVmYXVsdHM6SU9wdGlvbnMpIHtcclxuICAgICAgICByZXR1cm4gPElPcHRpb25zPntcclxuICAgICAgICAgICAgZGlzcGxheUFzOiBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVEaXNwbGF5QXMob3B0aW9uc1snZGlzcGxheUFzJ10sIGRlZmF1bHRzLmRpc3BsYXlBcyksXHJcbiAgICAgICAgICAgIG1pbkRhdGU6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZU1pbkRhdGUob3B0aW9uc1snbWluRGF0ZSddLCBkZWZhdWx0cy5taW5EYXRlKSxcclxuICAgICAgICAgICAgbWF4RGF0ZTogT3B0aW9uU2FuaXRpemVyLnNhbml0aXplTWF4RGF0ZShvcHRpb25zWydtYXhEYXRlJ10sIGRlZmF1bHRzLm1heERhdGUpLFxyXG4gICAgICAgICAgICBkZWZhdWx0RGF0ZTogT3B0aW9uU2FuaXRpemVyLnNhbml0aXplRGVmYXVsdERhdGUob3B0aW9uc1snZGVmYXVsdERhdGUnXSwgZGVmYXVsdHMuZGVmYXVsdERhdGUpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiQ3VzdG9tRXZlbnQgPSAoZnVuY3Rpb24oKSB7XHJcbiAgICBmdW5jdGlvbiB1c2VOYXRpdmUgKCkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGxldCBjdXN0b21FdmVudCA9IG5ldyBDdXN0b21FdmVudCgnYScsIHsgZGV0YWlsOiB7IGI6ICdiJyB9IH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gICdhJyA9PT0gY3VzdG9tRXZlbnQudHlwZSAmJiAnYicgPT09IGN1c3RvbUV2ZW50LmRldGFpbC5iO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZiAodXNlTmF0aXZlKCkpIHtcclxuICAgICAgICByZXR1cm4gPGFueT5DdXN0b21FdmVudDtcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRvY3VtZW50LmNyZWF0ZUV2ZW50ID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgLy8gSUUgPj0gOVxyXG4gICAgICAgIHJldHVybiA8YW55PmZ1bmN0aW9uKHR5cGU6c3RyaW5nLCBwYXJhbXM6Q3VzdG9tRXZlbnRJbml0KSB7XHJcbiAgICAgICAgICAgIGxldCBlID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0N1c3RvbUV2ZW50Jyk7XHJcbiAgICAgICAgICAgIGlmIChwYXJhbXMpIHtcclxuICAgICAgICAgICAgICAgIGUuaW5pdEN1c3RvbUV2ZW50KHR5cGUsIHBhcmFtcy5idWJibGVzLCBwYXJhbXMuY2FuY2VsYWJsZSwgcGFyYW1zLmRldGFpbCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBlLmluaXRDdXN0b21FdmVudCh0eXBlLCBmYWxzZSwgZmFsc2UsIHZvaWQgMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGU7XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBJRSA+PSA4XHJcbiAgICAgICAgcmV0dXJuIDxhbnk+ZnVuY3Rpb24odHlwZTpzdHJpbmcsIHBhcmFtczpDdXN0b21FdmVudEluaXQpIHtcclxuICAgICAgICAgICAgbGV0IGUgPSAoPGFueT5kb2N1bWVudCkuY3JlYXRlRXZlbnRPYmplY3QoKTtcclxuICAgICAgICAgICAgZS50eXBlID0gdHlwZTtcclxuICAgICAgICAgICAgaWYgKHBhcmFtcykge1xyXG4gICAgICAgICAgICAgICAgZS5idWJibGVzID0gQm9vbGVhbihwYXJhbXMuYnViYmxlcyk7XHJcbiAgICAgICAgICAgICAgICBlLmNhbmNlbGFibGUgPSBCb29sZWFuKHBhcmFtcy5jYW5jZWxhYmxlKTtcclxuICAgICAgICAgICAgICAgIGUuZGV0YWlsID0gcGFyYW1zLmRldGFpbDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGUuYnViYmxlcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgZS5jYW5jZWxhYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBlLmRldGFpbCA9IHZvaWQgMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZTtcclxuICAgICAgICB9IFxyXG4gICAgfSAgXHJcbn0pKCk7XHJcbiIsImludGVyZmFjZSBJTGlzdGVuZXJSZWZlcmVuY2Uge1xyXG4gICAgZWxlbWVudDogRWxlbWVudHxEb2N1bWVudHxXaW5kb3c7XHJcbiAgICByZWZlcmVuY2U6IEV2ZW50TGlzdGVuZXI7XHJcbiAgICBldmVudDogc3RyaW5nO1xyXG59XHJcblxyXG5uYW1lc3BhY2UgbGlzdGVuIHtcclxuICAgIGZ1bmN0aW9uIGF0dGFjaEV2ZW50cyhldmVudHM6c3RyaW5nW10sIGVsZW1lbnQ6RWxlbWVudHxEb2N1bWVudHxXaW5kb3csIGNhbGxiYWNrOihlPzphbnkpID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdIHtcclxuICAgICAgICBsZXQgbGlzdGVuZXJzOklMaXN0ZW5lclJlZmVyZW5jZVtdID0gW107XHJcbiAgICAgICAgZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGxpc3RlbmVycy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGVsZW1lbnQsXHJcbiAgICAgICAgICAgICAgICByZWZlcmVuY2U6IGNhbGxiYWNrLFxyXG4gICAgICAgICAgICAgICAgZXZlbnQ6IGV2ZW50XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGNhbGxiYWNrKTsgXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGxpc3RlbmVycztcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gTkFUSVZFXHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiBmb2N1cyhlbGVtZW50OkVsZW1lbnQsIGNhbGxiYWNrOihlPzpGb2N1c0V2ZW50KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ2ZvY3VzJ10sIGVsZW1lbnQsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gbW91c2Vkb3duKGVsZW1lbnQ6RWxlbWVudHxEb2N1bWVudHxXaW5kb3csIGNhbGxiYWNrOihlPzpNb3VzZUV2ZW50KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ21vdXNlZG93biddLCBlbGVtZW50LCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBjYWxsYmFjayhlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIG1vdXNldXAoZWxlbWVudDpFbGVtZW50fERvY3VtZW50fFdpbmRvdywgY2FsbGJhY2s6KGU/Ok1vdXNlRXZlbnQpID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdIHtcclxuICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzKFsnbW91c2V1cCddLCBlbGVtZW50LCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBjYWxsYmFjayhlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHBhc3RlKGVsZW1lbnQ6RWxlbWVudHxEb2N1bWVudHxXaW5kb3csIGNhbGxiYWNrOihlPzpNb3VzZUV2ZW50KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ3Bhc3RlJ10sIGVsZW1lbnQsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyBDVVNUT01cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGdvdG8oZWxlbWVudDpFbGVtZW50LCBjYWxsYmFjazooZT86e2RhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWx9KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ2RhdGl1bS1nb3RvJ10sIGVsZW1lbnQsIChlOkN1c3RvbUV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGUuZGV0YWlsKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHZpZXdjaGFuZ2VkKGVsZW1lbnQ6RWxlbWVudCwgY2FsbGJhY2s6KGU/OntkYXRlOkRhdGUsIGxldmVsOkxldmVsfSkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xyXG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydkYXRpdW0tdmlld2NoYW5nZWQnXSwgZWxlbWVudCwgKGU6Q3VzdG9tRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgY2FsbGJhY2soZS5kZXRhaWwpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXJzKGxpc3RlbmVyczpJTGlzdGVuZXJSZWZlcmVuY2VbXSkge1xyXG4gICAgICAgIGxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xyXG4gICAgICAgICAgIGxpc3RlbmVyLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihsaXN0ZW5lci5ldmVudCwgbGlzdGVuZXIucmVmZXJlbmNlKTsgXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbm5hbWVzcGFjZSB0cmlnZ2VyIHtcclxuICAgIGV4cG9ydCBmdW5jdGlvbiBnb3RvKGVsZW1lbnQ6RWxlbWVudCwgZGF0YT86e2RhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWx9KSB7XHJcbiAgICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnZGF0aXVtLWdvdG8nLCB7XHJcbiAgICAgICAgICAgIGJ1YmJsZXM6IGZhbHNlLFxyXG4gICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICBkZXRhaWw6IGRhdGFcclxuICAgICAgICB9KSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiB2aWV3Y2hhbmdlZChlbGVtZW50OkVsZW1lbnQsIGRhdGE/OntkYXRlOkRhdGUsIGxldmVsOkxldmVsfSkge1xyXG4gICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2RhdGl1bS12aWV3Y2hhbmdlZCcsIHtcclxuICAgICAgICAgICAgYnViYmxlczogZmFsc2UsXHJcbiAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXHJcbiAgICAgICAgICAgIGRldGFpbDogZGF0YVxyXG4gICAgICAgIH0pKTtcclxuICAgIH1cclxufSIsImludGVyZmFjZSBJRGF0ZVBhcnQge1xyXG4gICAgaW5jcmVtZW50KCk6dm9pZDtcclxuICAgIGRlY3JlbWVudCgpOnZvaWQ7XHJcbiAgICBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKTpib29sZWFuO1xyXG4gICAgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpOmJvb2xlYW47XHJcbiAgICBnZXRWYWx1ZSgpOkRhdGU7XHJcbiAgICBnZXRSZWdFeCgpOlJlZ0V4cDtcclxuICAgIHNldFNlbGVjdGFibGUoc2VsZWN0YWJsZTpib29sZWFuKTpJRGF0ZVBhcnQ7XHJcbiAgICBnZXRNYXhCdWZmZXIoKTpudW1iZXI7XHJcbiAgICBnZXRMZXZlbCgpOkxldmVsO1xyXG4gICAgaXNTZWxlY3RhYmxlKCk6Ym9vbGVhbjtcclxuICAgIHRvU3RyaW5nKCk6c3RyaW5nO1xyXG59XHJcblxyXG5jbGFzcyBQbGFpblRleHQgaW1wbGVtZW50cyBJRGF0ZVBhcnQge1xyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSB0ZXh0OnN0cmluZykge31cclxuICAgIHB1YmxpYyBpbmNyZW1lbnQoKSB7fVxyXG4gICAgcHVibGljIGRlY3JlbWVudCgpIHt9XHJcbiAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbCgpIHsgcmV0dXJuIGZhbHNlIH1cclxuICAgIHB1YmxpYyBzZXRWYWx1ZSgpIHsgcmV0dXJuIGZhbHNlIH1cclxuICAgIHB1YmxpYyBnZXRWYWx1ZSgpOkRhdGUgeyByZXR1cm4gbnVsbCB9XHJcbiAgICBwdWJsaWMgZ2V0UmVnRXgoKTpSZWdFeHAgeyByZXR1cm4gbmV3IFJlZ0V4cChgWyR7dGhpcy50ZXh0fV1gKTsgfVxyXG4gICAgcHVibGljIHNldFNlbGVjdGFibGUoc2VsZWN0YWJsZTpib29sZWFuKTpJRGF0ZVBhcnQgeyByZXR1cm4gdGhpcyB9XHJcbiAgICBwdWJsaWMgZ2V0TWF4QnVmZmVyKCk6bnVtYmVyIHsgcmV0dXJuIDAgfVxyXG4gICAgcHVibGljIGdldExldmVsKCk6TGV2ZWwgeyByZXR1cm4gTGV2ZWwuTk9ORSB9XHJcbiAgICBwdWJsaWMgaXNTZWxlY3RhYmxlKCk6Ym9vbGVhbiB7IHJldHVybiBmYWxzZSB9XHJcbiAgICBwdWJsaWMgdG9TdHJpbmcoKTpzdHJpbmcgeyByZXR1cm4gdGhpcy50ZXh0IH1cclxufVxyXG4gICAgXHJcbmxldCBmb3JtYXRCbG9ja3MgPSAoZnVuY3Rpb24oKSB7ICAgIFxyXG4gICAgY2xhc3MgRGF0ZVBhcnQge1xyXG4gICAgICAgIHByb3RlY3RlZCBkYXRlOkRhdGU7XHJcbiAgICAgICAgcHJvdGVjdGVkIHNlbGVjdGFibGU6Ym9vbGVhbiA9IHRydWU7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFZhbHVlKCk6RGF0ZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGVcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFNlbGVjdGFibGUoc2VsZWN0YWJsZTpib29sZWFuKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0YWJsZSA9IHNlbGVjdGFibGU7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgaXNTZWxlY3RhYmxlKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RhYmxlO1xyXG4gICAgICAgIH0gICBcclxuICAgICAgICBcclxuICAgICAgICBwcm90ZWN0ZWQgcGFkKG51bTpudW1iZXJ8c3RyaW5nLCBzaXplOm51bWJlciA9IDIpIHtcclxuICAgICAgICAgICAgbGV0IHN0ciA9IG51bS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICB3aGlsZShzdHIubGVuZ3RoIDwgc2l6ZSkgc3RyID0gJzAnICsgc3RyO1xyXG4gICAgICAgICAgICByZXR1cm4gc3RyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwcm90ZWN0ZWQgdHJpbShzdHI6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHdoaWxlIChzdHJbMF0gPT09ICcwJyAmJiBzdHIubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICAgICAgc3RyID0gc3RyLnN1YnN0cigxLCBzdHIubGVuZ3RoKTsgIFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBzdHI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBGb3VyRGlnaXRZZWFyIGV4dGVuZHMgRGF0ZVBhcnQge1xyXG4gICAgICAgIHB1YmxpYyBpbmNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRGdWxsWWVhcih0aGlzLmRhdGUuZ2V0RnVsbFllYXIoKSArIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZGVjcmVtZW50KCkge1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0RnVsbFllYXIodGhpcy5kYXRlLmdldEZ1bGxZZWFyKCkgLSAxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZ2V0UmVnRXgoKS50ZXN0KHBhcnRpYWwpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZShwYXJ0aWFsKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKHZhbHVlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHRoaXMuZ2V0UmVnRXgoKS50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldEZ1bGxZZWFyKHBhcnNlSW50KHZhbHVlLCAxMCkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXlxcZHsxLDR9JC87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiA0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBMZXZlbC5ZRUFSO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0RnVsbFllYXIoKS50b1N0cmluZygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgVHdvRGlnaXRZZWFyIGV4dGVuZHMgRm91ckRpZ2l0WWVhciB7XHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUoKDxEYXRlPnZhbHVlKS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBiYXNlID0gTWF0aC5mbG9vcihzdXBlci5nZXRWYWx1ZSgpLmdldEZ1bGxZZWFyKCkvMTAwKSoxMDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0RnVsbFllYXIocGFyc2VJbnQoPHN0cmluZz52YWx1ZSwgMTApICsgYmFzZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eXFxkezEsMn0kLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3VwZXIudG9TdHJpbmcoKS5zbGljZSgtMik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBMb25nTW9udGhOYW1lIGV4dGVuZHMgRGF0ZVBhcnQge1xyXG4gICAgICAgIHByb3RlY3RlZCBnZXRNb250aHMoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXCJKYW51YXJ5XCIsIFwiRmVicnVhcnlcIiwgXCJNYXJjaFwiLCBcIkFwcmlsXCIsIFwiTWF5XCIsIFwiSnVuZVwiLCBcIkp1bHlcIiwgXCJBdWd1c3RcIiwgXCJTZXB0ZW1iZXJcIiwgXCJPY3RvYmVyXCIsIFwiTm92ZW1iZXJcIiwgXCJEZWNlbWJlclwiXTtcclxuICAgICAgICB9IFxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBpbmNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0TW9udGgoKSArIDE7XHJcbiAgICAgICAgICAgIGlmIChudW0gPiAxMSkgbnVtID0gMDtcclxuICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1vbnRoKG51bSk7XHJcbiAgICAgICAgICAgIHdoaWxlICh0aGlzLmRhdGUuZ2V0TW9udGgoKSA+IG51bSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldERhdGUodGhpcy5kYXRlLmdldERhdGUoKSAtIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBkZWNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0TW9udGgoKSAtIDE7XHJcbiAgICAgICAgICAgIGlmIChudW0gPCAwKSBudW0gPSAxMTtcclxuICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1vbnRoKG51bSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGxldCBtb250aCA9IHRoaXMuZ2V0TW9udGhzKCkuZmlsdGVyKChtb250aCkgPT4ge1xyXG4gICAgICAgICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cChgXiR7cGFydGlhbH0uKiRgLCAnaScpLnRlc3QobW9udGgpOyBcclxuICAgICAgICAgICAgfSlbMF07XHJcbiAgICAgICAgICAgIGlmIChtb250aCAhPT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZShtb250aCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKHZhbHVlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHRoaXMuZ2V0UmVnRXgoKS50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZ2V0TW9udGhzKCkuaW5kZXhPZih2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0TW9udGgobnVtKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cChgXigoJHt0aGlzLmdldE1vbnRocygpLmpvaW4oXCIpfChcIil9KSkkYCwgJ2knKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFsyLDEsMywyLDMsMywzLDIsMSwxLDEsMV1bdGhpcy5kYXRlLmdldE1vbnRoKCldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBMZXZlbC5NT05USDtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRNb250aHMoKVt0aGlzLmRhdGUuZ2V0TW9udGgoKV07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBTaG9ydE1vbnRoTmFtZSBleHRlbmRzIExvbmdNb250aE5hbWUge1xyXG4gICAgICAgIHByb3RlY3RlZCBnZXRNb250aHMoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXCJKYW5cIiwgXCJGZWJcIiwgXCJNYXJcIiwgXCJBcHJcIiwgXCJNYXlcIiwgXCJKdW5cIiwgXCJKdWxcIiwgXCJBdWdcIiwgXCJTZXBcIiwgXCJPY3RcIiwgXCJOb3ZcIiwgXCJEZWNcIl07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBNb250aCBleHRlbmRzIExvbmdNb250aE5hbWUge1xyXG4gICAgICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0TW9udGgoKSA+IDAgPyAxIDogMjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKC9eXFxkezEsMn0kLy50ZXN0KHBhcnRpYWwpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdHJpbW1lZCA9IHRoaXMudHJpbShwYXJ0aWFsID09PSAnMCcgPyAnMScgOiBwYXJ0aWFsKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHRyaW1tZWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRNb250aChwYXJzZUludCh2YWx1ZSwgMTApIC0gMSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eKFsxLTldfCgxWzAtMl0pKSQvO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAodGhpcy5kYXRlLmdldE1vbnRoKCkgKyAxKS50b1N0cmluZygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgUGFkZGVkTW9udGggZXh0ZW5kcyBNb250aCB7XHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKC9eXFxkezEsMn0kLy50ZXN0KHBhcnRpYWwpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGFkZGVkID0gdGhpcy5wYWQocGFydGlhbCA9PT0gJzAnID8gJzEnIDogcGFydGlhbCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZShwYWRkZWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL14oKDBbMS05XSl8KDFbMC0yXSkpJC87ICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFkKHN1cGVyLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgRGF0ZU51bWVyYWwgZXh0ZW5kcyBEYXRlUGFydCB7XHJcbiAgICAgICAgcHJvdGVjdGVkIGRheXNJbk1vbnRoKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGUodGhpcy5kYXRlLmdldEZ1bGxZZWFyKCksIHRoaXMuZGF0ZS5nZXRNb250aCgpICsgMSwgMCkuZ2V0RGF0ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgaW5jcmVtZW50KCkge1xyXG4gICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldERhdGUoKSArIDE7XHJcbiAgICAgICAgICAgIGlmIChudW0gPiB0aGlzLmRheXNJbk1vbnRoKCkpIG51bSA9IDE7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXREYXRlKG51bSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBkZWNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0RGF0ZSgpIC0gMTtcclxuICAgICAgICAgICAgaWYgKG51bSA8IDEpIG51bSA9IHRoaXMuZGF5c0luTW9udGgoKTtcclxuICAgICAgICAgICAgdGhpcy5kYXRlLnNldERhdGUobnVtKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKC9eXFxkezEsMn0kLy50ZXN0KHBhcnRpYWwpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdHJpbW1lZCA9IHRoaXMudHJpbShwYXJ0aWFsID09PSAnMCcgPyAnMScgOiBwYXJ0aWFsKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHRyaW1tZWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkgJiYgcGFyc2VJbnQodmFsdWUsIDEwKSA8IHRoaXMuZGF5c0luTW9udGgoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldERhdGUocGFyc2VJbnQodmFsdWUsIDEwKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eWzEtOV18KCgxfDIpWzAtOV0pfCgzWzAtMV0pJC87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0RGF0ZSgpID4gTWF0aC5mbG9vcih0aGlzLmRheXNJbk1vbnRoKCkvMTApID8gMSA6IDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIExldmVsLkRBVEU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXREYXRlKCkudG9TdHJpbmcoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIFBhZGRlZERhdGUgZXh0ZW5kcyBEYXRlTnVtZXJhbCB7XHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKC9eXFxkezEsMn0kLy50ZXN0KHBhcnRpYWwpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGFkZGVkID0gdGhpcy5wYWQocGFydGlhbCA9PT0gJzAnID8gJzEnIDogcGFydGlhbCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZShwYWRkZWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL14oMFsxLTldKXwoKDF8MilbMC05XSl8KDNbMC0xXSkkLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYWQodGhpcy5kYXRlLmdldERhdGUoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBEYXRlT3JkaW5hbCBleHRlbmRzIERhdGVOdW1lcmFsIHtcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXihbMS05XXwoKDF8MilbMC05XSl8KDNbMC0xXSkpKChzdCl8KG5kKXwocmQpfCh0aCkpPyQvaTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICBsZXQgZGF0ZSA9IHRoaXMuZGF0ZS5nZXREYXRlKCk7XHJcbiAgICAgICAgICAgIGxldCBqID0gZGF0ZSAlIDEwO1xyXG4gICAgICAgICAgICBsZXQgayA9IGRhdGUgJSAxMDA7XHJcbiAgICAgICAgICAgIGlmIChqID09PSAxICYmIGsgIT09IDExKSByZXR1cm4gZGF0ZSArIFwic3RcIjtcclxuICAgICAgICAgICAgaWYgKGogPT09IDIgJiYgayAhPT0gMTIpIHJldHVybiBkYXRlICsgXCJuZFwiO1xyXG4gICAgICAgICAgICBpZiAoaiA9PT0gMyAmJiBrICE9PSAxMykgcmV0dXJuIGRhdGUgKyBcInJkXCI7XHJcbiAgICAgICAgICAgIHJldHVybiBkYXRlICsgXCJ0aFwiO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgTG9uZ0RheU5hbWUgZXh0ZW5kcyBEYXRlUGFydCB7XHJcbiAgICAgICAgcHJvdGVjdGVkIGdldERheXMoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXCJTdW5kYXlcIiwgXCJNb25kYXlcIiwgXCJUdWVzZGF5XCIsIFwiV2VkbmVzZGF5XCIsIFwiVGh1cnNkYXlcIiwgXCJGcmlkYXlcIiwgXCJTYXR1cmRheVwiXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGluY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXREYXkoKSArIDE7XHJcbiAgICAgICAgICAgIGlmIChudW0gPiA2KSBudW0gPSAwO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0RGF0ZSh0aGlzLmRhdGUuZ2V0RGF0ZSgpIC0gdGhpcy5kYXRlLmdldERheSgpICsgbnVtKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGRlY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXREYXkoKSAtIDE7XHJcbiAgICAgICAgICAgIGlmIChudW0gPCAwKSBudW0gPSA2O1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0RGF0ZSh0aGlzLmRhdGUuZ2V0RGF0ZSgpIC0gdGhpcy5kYXRlLmdldERheSgpICsgbnVtKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgbGV0IGRheSA9IHRoaXMuZ2V0RGF5cygpLmZpbHRlcigoZGF5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cChgXiR7cGFydGlhbH0uKiRgLCAnaScpLnRlc3QoZGF5KTtcclxuICAgICAgICAgICAgfSlbMF07XHJcbiAgICAgICAgICAgIGlmIChkYXkgIT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUoZGF5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5nZXREYXlzKCkuaW5kZXhPZih2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0RGF0ZSh0aGlzLmRhdGUuZ2V0RGF0ZSgpIC0gdGhpcy5kYXRlLmdldERheSgpICsgbnVtKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cChgXigoJHt0aGlzLmdldERheXMoKS5qb2luKFwiKXwoXCIpfSkpJGAsICdpJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbMiwxLDIsMSwyLDEsMl1bdGhpcy5kYXRlLmdldERheSgpXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldExldmVsKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTGV2ZWwuREFURTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXREYXlzKClbdGhpcy5kYXRlLmdldERheSgpXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIFNob3J0RGF5TmFtZSBleHRlbmRzIExvbmdEYXlOYW1lIHtcclxuICAgICAgICBwcm90ZWN0ZWQgZ2V0RGF5cygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFtcIlN1blwiLCBcIk1vblwiLCBcIlR1ZVwiLCBcIldlZFwiLCBcIlRodVwiLCBcIkZyaVwiLCBcIlNhdFwiXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIFBhZGRlZE1pbGl0YXJ5SG91ciBleHRlbmRzIERhdGVQYXJ0IHtcclxuICAgICAgICBwdWJsaWMgaW5jcmVtZW50KCkge1xyXG4gICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldEhvdXJzKCkgKyAxO1xyXG4gICAgICAgICAgICBpZiAobnVtID4gMjMpIG51bSA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3VycyhudW0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZGVjcmVtZW50KCkge1xyXG4gICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldEhvdXJzKCkgLSAxO1xyXG4gICAgICAgICAgICBpZiAobnVtIDwgMCkgbnVtID0gMjM7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3VycyhudW0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAoL15cXGR7MSwyfSQvLnRlc3QocGFydGlhbCkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBwYWRkZWQgPSB0aGlzLnBhZChwYXJ0aWFsKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHBhZGRlZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKHZhbHVlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHRoaXMuZ2V0UmVnRXgoKS50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldEhvdXJzKHBhcnNlSW50KHZhbHVlLCAxMCkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TWF4QnVmZmVyKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldEhvdXJzKCkgPiAyID8gMSA6IDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIExldmVsLkhPVVI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eKCgoMHwxKVswLTldKXwoMlswLTNdKSkkLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYWQodGhpcy5kYXRlLmdldEhvdXJzKCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgTWlsaXRhcnlIb3VyIGV4dGVuZHMgUGFkZGVkTWlsaXRhcnlIb3VyIHtcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAoL15cXGR7MSwyfSQvLnRlc3QocGFydGlhbCkpIHtcclxuICAgICAgICAgICAgICAgIGxldCB0cmltbWVkID0gdGhpcy50cmltKHBhcnRpYWwpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUodHJpbW1lZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXigoMT9bMC05XSl8KDJbMC0zXSkpJC87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXRIb3VycygpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBQYWRkZWRIb3VyIGV4dGVuZHMgUGFkZGVkTWlsaXRhcnlIb3VyIHtcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICBsZXQgcGFkZGVkID0gdGhpcy5wYWQocGFydGlhbCA9PT0gJzAnID8gJzEnIDogcGFydGlhbCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHBhZGRlZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbnVtID0gcGFyc2VJbnQodmFsdWUsIDEwKTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmRhdGUuZ2V0SG91cnMoKSA8IDEyICYmIG51bSA9PT0gMTIpIG51bSA9IDA7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kYXRlLmdldEhvdXJzKCkgPiAxMSAmJiBudW0gIT09IDEyKSBudW0gKz0gMTI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnMobnVtKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL14oMFsxLTldKXwoMVswLTJdKSQvO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TWF4QnVmZmVyKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcGFyc2VJbnQodGhpcy50b1N0cmluZygpLCAxMCkgPiAxID8gMSA6IDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgbGV0IGhvdXJzID0gdGhpcy5kYXRlLmdldEhvdXJzKCk7XHJcbiAgICAgICAgICAgIGlmIChob3VycyA+IDEyKSBob3VycyAtPSAxMjtcclxuICAgICAgICAgICAgaWYgKGhvdXJzID09PSAwKSBob3VycyA9IDEyO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYWQoaG91cnMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgSG91ciBleHRlbmRzIFBhZGRlZEhvdXIge1xyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGxldCB0cmltbWVkID0gdGhpcy50cmltKHBhcnRpYWwgPT09ICcwJyA/ICcxJyA6IHBhcnRpYWwpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0cmltbWVkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL15bMS05XXwoMVswLTJdKSQvO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRyaW0oc3VwZXIudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBQYWRkZWRNaW51dGUgZXh0ZW5kcyBEYXRlUGFydCB7XHJcbiAgICAgICAgcHVibGljIGluY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRNaW51dGVzKCkgKyAxO1xyXG4gICAgICAgICAgICBpZiAobnVtID4gNTkpIG51bSA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRNaW51dGVzKG51bSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBkZWNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0TWludXRlcygpIC0gMTtcclxuICAgICAgICAgICAgaWYgKG51bSA8IDApIG51bSA9IDU5O1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0TWludXRlcyhudW0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0aGlzLnBhZChwYXJ0aWFsKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0TWludXRlcyhwYXJzZUludCh2YWx1ZSwgMTApKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL15bMC01XVswLTldJC87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0TWludXRlcygpID4gNSA/IDEgOiAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBMZXZlbC5NSU5VVEU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFkKHRoaXMuZGF0ZS5nZXRNaW51dGVzKCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgVXBwZXJjYXNlTWVyaWRpZW0gZXh0ZW5kcyBEYXRlUGFydCB7XHJcbiAgICAgICAgcHVibGljIGluY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRIb3VycygpICsgMTI7XHJcbiAgICAgICAgICAgIGlmIChudW0gPiAyMykgbnVtIC09IDI0O1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnMobnVtKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGRlY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRIb3VycygpIC0gMTI7XHJcbiAgICAgICAgICAgIGlmIChudW0gPCAwKSBudW0gKz0gMjQ7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3VycyhudW0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAoL14oKEFNPyl8KFBNPykpJC9pLnRlc3QocGFydGlhbCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHBhcnRpYWxbMF0gPT09ICdBJyA/ICdBTScgOiAnUE0nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUudG9Mb3dlckNhc2UoKSA9PT0gJ2FtJyAmJiB0aGlzLmRhdGUuZ2V0SG91cnMoKSA+IDExKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldEhvdXJzKHRoaXMuZGF0ZS5nZXRIb3VycygpIC0gMTIpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZS50b0xvd2VyQ2FzZSgpID09PSAncG0nICYmIHRoaXMuZGF0ZS5nZXRIb3VycygpIDwgMTIpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnModGhpcy5kYXRlLmdldEhvdXJzKCkgKyAxMik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIExldmVsLkhPVVI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXigoYW0pfChwbSkpJC9pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0SG91cnMoKSA8IDEyID8gJ0FNJyA6ICdQTSc7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBMb3dlcmNhc2VNZXJpZGllbSBleHRlbmRzIFVwcGVyY2FzZU1lcmlkaWVtIHtcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzdXBlci50b1N0cmluZygpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsZXQgZm9ybWF0QmxvY2tzOnsgW2tleTpzdHJpbmddOiBuZXcgKCkgPT4gSURhdGVQYXJ0OyB9ID0ge307XHJcbiAgICBcclxuICAgIGZvcm1hdEJsb2Nrc1snWVlZWSddID0gRm91ckRpZ2l0WWVhcjtcclxuICAgIGZvcm1hdEJsb2Nrc1snWVknXSA9IFR3b0RpZ2l0WWVhcjtcclxuICAgIGZvcm1hdEJsb2Nrc1snTU1NTSddID0gTG9uZ01vbnRoTmFtZTtcclxuICAgIGZvcm1hdEJsb2Nrc1snTU1NJ10gPSBTaG9ydE1vbnRoTmFtZTtcclxuICAgIGZvcm1hdEJsb2Nrc1snTU0nXSA9IFBhZGRlZE1vbnRoO1xyXG4gICAgZm9ybWF0QmxvY2tzWydNJ10gPSBNb250aDtcclxuICAgIGZvcm1hdEJsb2Nrc1snREQnXSA9IFBhZGRlZERhdGU7XHJcbiAgICBmb3JtYXRCbG9ja3NbJ0RvJ10gPSBEYXRlT3JkaW5hbDtcclxuICAgIGZvcm1hdEJsb2Nrc1snRCddID0gRGF0ZU51bWVyYWw7XHJcbiAgICBmb3JtYXRCbG9ja3NbJ2RkZGQnXSA9IExvbmdEYXlOYW1lO1xyXG4gICAgZm9ybWF0QmxvY2tzWydkZGQnXSA9IFNob3J0RGF5TmFtZTtcclxuICAgIGZvcm1hdEJsb2Nrc1snSEgnXSA9IFBhZGRlZE1pbGl0YXJ5SG91cjtcclxuICAgIGZvcm1hdEJsb2Nrc1snaGgnXSA9IFBhZGRlZEhvdXI7XHJcbiAgICBmb3JtYXRCbG9ja3NbJ0gnXSA9IE1pbGl0YXJ5SG91cjtcclxuICAgIGZvcm1hdEJsb2Nrc1snaCddID0gSG91cjtcclxuICAgIGZvcm1hdEJsb2Nrc1snQSddID0gVXBwZXJjYXNlTWVyaWRpZW07XHJcbiAgICBmb3JtYXRCbG9ja3NbJ2EnXSA9IExvd2VyY2FzZU1lcmlkaWVtO1xyXG4gICAgZm9ybWF0QmxvY2tzWydtbSddID0gUGFkZGVkTWludXRlO1xyXG4gICAgLy8gbVxyXG4gICAgLy8gc3NcclxuICAgIC8vIHNcclxuICAgIC8vIFhcclxuICAgIC8vIHhcclxuICAgIC8vIFpaXHJcbiAgICAvLyBaXHJcbiAgICBcclxuICAgIHJldHVybiBmb3JtYXRCbG9ja3M7XHJcbn0pKCk7XHJcblxyXG5cclxuIiwiY2xhc3MgSW5wdXQge1xyXG4gICAgcHJpdmF0ZSBvcHRpb25zOiBJT3B0aW9ucztcclxuICAgIHByaXZhdGUgc2VsZWN0ZWREYXRlUGFydDogSURhdGVQYXJ0O1xyXG4gICAgcHJpdmF0ZSB0ZXh0QnVmZmVyOiBzdHJpbmcgPSBcIlwiO1xyXG4gICAgcHVibGljIGRhdGVQYXJ0czogSURhdGVQYXJ0W107XHJcbiAgICBwdWJsaWMgZm9ybWF0OiBSZWdFeHA7XHJcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZWxlbWVudDogSFRNTElucHV0RWxlbWVudCkge1xyXG4gICAgICAgIG5ldyBLZXlib2FyZEV2ZW50SGFuZGxlcih0aGlzKTtcclxuICAgICAgICBuZXcgTW91c2VFdmVudEhhbmRsZXIodGhpcyk7XHJcbiAgICAgICAgbmV3IFBhc3RlRXZlbnRIYW5kZXIodGhpcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGlzdGVuLnZpZXdjaGFuZ2VkKGVsZW1lbnQsIChlKSA9PiB0aGlzLnZpZXdjaGFuZ2VkKGUuZGF0ZSwgZS5sZXZlbCkpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0VGV4dEJ1ZmZlcigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy50ZXh0QnVmZmVyO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgc2V0VGV4dEJ1ZmZlcihuZXdCdWZmZXI6c3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy50ZXh0QnVmZmVyID0gbmV3QnVmZmVyO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLnRleHRCdWZmZXIubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZURhdGVGcm9tQnVmZmVyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdXBkYXRlRGF0ZUZyb21CdWZmZXIoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWREYXRlUGFydC5zZXRWYWx1ZUZyb21QYXJ0aWFsKHRoaXMudGV4dEJ1ZmZlcikpIHtcclxuICAgICAgICAgICAgbGV0IG5ld0RhdGUgPSB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQuZ2V0VmFsdWUoKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnRleHRCdWZmZXIubGVuZ3RoID49IHRoaXMuc2VsZWN0ZWREYXRlUGFydC5nZXRNYXhCdWZmZXIoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy50ZXh0QnVmZmVyID0gJyc7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQgPSB0aGlzLmdldE5leHRTZWxlY3RhYmxlRGF0ZVBhcnQoKTsgICAgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRyaWdnZXIuZ290byh0aGlzLmVsZW1lbnQsIHtcclxuICAgICAgICAgICAgICAgIGRhdGU6IG5ld0RhdGUsXHJcbiAgICAgICAgICAgICAgICBsZXZlbDogdGhpcy5zZWxlY3RlZERhdGVQYXJ0LmdldExldmVsKClcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy50ZXh0QnVmZmVyID0gdGhpcy50ZXh0QnVmZmVyLnNsaWNlKDAsIC0xKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRGaXJzdFNlbGVjdGFibGVEYXRlUGFydCgpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZGF0ZVBhcnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGVQYXJ0c1tpXS5pc1NlbGVjdGFibGUoKSlcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGVQYXJ0c1tpXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZvaWQgMDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0TGFzdFNlbGVjdGFibGVEYXRlUGFydCgpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gdGhpcy5kYXRlUGFydHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZGF0ZVBhcnRzW2ldLmlzU2VsZWN0YWJsZSgpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZVBhcnRzW2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdm9pZCAwO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0TmV4dFNlbGVjdGFibGVEYXRlUGFydCgpIHtcclxuICAgICAgICBsZXQgaSA9IHRoaXMuZGF0ZVBhcnRzLmluZGV4T2YodGhpcy5zZWxlY3RlZERhdGVQYXJ0KTtcclxuICAgICAgICB3aGlsZSAoKytpIDwgdGhpcy5kYXRlUGFydHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGVQYXJ0c1tpXS5pc1NlbGVjdGFibGUoKSlcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGVQYXJ0c1tpXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWREYXRlUGFydDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldFByZXZpb3VzU2VsZWN0YWJsZURhdGVQYXJ0KCkge1xyXG4gICAgICAgIGxldCBpID0gdGhpcy5kYXRlUGFydHMuaW5kZXhPZih0aGlzLnNlbGVjdGVkRGF0ZVBhcnQpO1xyXG4gICAgICAgIHdoaWxlICgtLWkgPj0gMCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kYXRlUGFydHNbaV0uaXNTZWxlY3RhYmxlKCkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlUGFydHNbaV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQ7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXROZWFyZXN0U2VsZWN0YWJsZURhdGVQYXJ0KGNhcmV0UG9zaXRpb246IG51bWJlcikge1xyXG4gICAgICAgIGxldCBkaXN0YW5jZTpudW1iZXIgPSBOdW1iZXIuTUFYX1ZBTFVFO1xyXG4gICAgICAgIGxldCBuZWFyZXN0RGF0ZVBhcnQ6SURhdGVQYXJ0O1xyXG4gICAgICAgIGxldCBzdGFydCA9IDA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmRhdGVQYXJ0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgZGF0ZVBhcnQgPSB0aGlzLmRhdGVQYXJ0c1tpXTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChkYXRlUGFydC5pc1NlbGVjdGFibGUoKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGZyb21MZWZ0ID0gY2FyZXRQb3NpdGlvbiAtIHN0YXJ0O1xyXG4gICAgICAgICAgICAgICAgbGV0IGZyb21SaWdodCA9IGNhcmV0UG9zaXRpb24gLSAoc3RhcnQgKyBkYXRlUGFydC50b1N0cmluZygpLmxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGlmIChmcm9tTGVmdCA+IDAgJiYgZnJvbVJpZ2h0IDwgMCkgcmV0dXJuIGRhdGVQYXJ0O1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBsZXQgZCA9IE1hdGgubWluKE1hdGguYWJzKGZyb21MZWZ0KSwgTWF0aC5hYnMoZnJvbVJpZ2h0KSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZCA8PSBkaXN0YW5jZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5lYXJlc3REYXRlUGFydCA9IGRhdGVQYXJ0O1xyXG4gICAgICAgICAgICAgICAgICAgIGRpc3RhbmNlID0gZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgc3RhcnQgKz0gZGF0ZVBhcnQudG9TdHJpbmcoKS5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiBuZWFyZXN0RGF0ZVBhcnQ7ICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHNldFNlbGVjdGVkRGF0ZVBhcnQoZGF0ZVBhcnQ6SURhdGVQYXJ0KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWREYXRlUGFydCAhPT0gZGF0ZVBhcnQpIHtcclxuICAgICAgICAgICAgdGhpcy50ZXh0QnVmZmVyID0gJyc7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWREYXRlUGFydCA9IGRhdGVQYXJ0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldFNlbGVjdGVkRGF0ZVBhcnQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWREYXRlUGFydDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHVwZGF0ZU9wdGlvbnMob3B0aW9uczpJT3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5kYXRlUGFydHMgPSBQYXJzZXIucGFyc2Uob3B0aW9ucy5kaXNwbGF5QXMpO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWREYXRlUGFydCA9IHZvaWQgMDtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgZm9ybWF0OnN0cmluZyA9ICdeJztcclxuICAgICAgICB0aGlzLmRhdGVQYXJ0cy5mb3JFYWNoKChkYXRlUGFydCkgPT4ge1xyXG4gICAgICAgICAgICBmb3JtYXQgKz0gYCgke2RhdGVQYXJ0LmdldFJlZ0V4KCkuc291cmNlLnNsaWNlKDEsLTEpfSlgO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuZm9ybWF0ID0gbmV3IFJlZ0V4cChmb3JtYXQrJyQnLCAnaScpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgdGhpcy51cGRhdGVWaWV3KCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB1cGRhdGVWaWV3KCkge1xyXG4gICAgICAgIGxldCBkYXRlU3RyaW5nID0gJyc7XHJcbiAgICAgICAgdGhpcy5kYXRlUGFydHMuZm9yRWFjaCgoZGF0ZVBhcnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKGRhdGVQYXJ0LmdldFZhbHVlKCkgPT09IHZvaWQgMCkgcmV0dXJuO1xyXG4gICAgICAgICAgICBkYXRlU3RyaW5nICs9IGRhdGVQYXJ0LnRvU3RyaW5nKCk7IFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC52YWx1ZSA9IGRhdGVTdHJpbmc7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWREYXRlUGFydCA9PT0gdm9pZCAwKSByZXR1cm47XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHN0YXJ0ID0gMDtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgaSA9IDA7XHJcbiAgICAgICAgd2hpbGUgKHRoaXMuZGF0ZVBhcnRzW2ldICE9PSB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQpIHtcclxuICAgICAgICAgICAgc3RhcnQgKz0gdGhpcy5kYXRlUGFydHNbaSsrXS50b1N0cmluZygpLmxlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGVuZCA9IHN0YXJ0ICsgdGhpcy5zZWxlY3RlZERhdGVQYXJ0LnRvU3RyaW5nKCkubGVuZ3RoO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZShzdGFydCwgZW5kKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHZpZXdjaGFuZ2VkKGRhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWwpIHtcclxuICAgICAgICB0aGlzLmRhdGVQYXJ0cy5mb3JFYWNoKChkYXRlUGFydCkgPT4ge1xyXG4gICAgICAgICAgICBkYXRlUGFydC5zZXRWYWx1ZShkYXRlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgIH1cclxufSIsImNvbnN0IGVudW0gS0VZIHtcclxuICAgIFJJR0hUID0gMzksIExFRlQgPSAzNywgVEFCID0gOSwgVVAgPSAzOCxcclxuICAgIERPV04gPSA0MCwgViA9IDg2LCBDID0gNjcsIEEgPSA2NSwgSE9NRSA9IDM2LFxyXG4gICAgRU5EID0gMzUsIEJBQ0tTUEFDRSA9IDhcclxufVxyXG5cclxuY2xhc3MgS2V5Ym9hcmRFdmVudEhhbmRsZXIge1xyXG4gICAgcHJpdmF0ZSBzaGlmdFRhYkRvd24gPSBmYWxzZTtcclxuICAgIHByaXZhdGUgdGFiRG93biA9IGZhbHNlO1xyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGlucHV0OklucHV0KSB7XHJcbiAgICAgICAgaW5wdXQuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoZSkgPT4gdGhpcy5rZXlkb3duKGUpKTtcclxuICAgICAgICBpbnB1dC5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJmb2N1c1wiLCAoKSA9PiB0aGlzLmZvY3VzKCkpO1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIChlKSA9PiB0aGlzLmRvY3VtZW50S2V5ZG93bihlKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBmb2N1cyA9ICgpOnZvaWQgPT4ge1xyXG4gICAgICAgIGlmICh0aGlzLnRhYkRvd24pIHtcclxuICAgICAgICAgICAgbGV0IGZpcnN0ID0gdGhpcy5pbnB1dC5nZXRGaXJzdFNlbGVjdGFibGVEYXRlUGFydCgpO1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQoZmlyc3QpO1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgdGhpcy5pbnB1dC51cGRhdGVWaWV3KCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zaGlmdFRhYkRvd24pIHtcclxuICAgICAgICAgICAgbGV0IGxhc3QgPSB0aGlzLmlucHV0LmdldExhc3RTZWxlY3RhYmxlRGF0ZVBhcnQoKTtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC5zZXRTZWxlY3RlZERhdGVQYXJ0KGxhc3QpO1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgdGhpcy5pbnB1dC51cGRhdGVWaWV3KCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBkb2N1bWVudEtleWRvd24oZTpLZXlib2FyZEV2ZW50KSB7XHJcbiAgICAgICAgaWYgKGUuc2hpZnRLZXkgJiYgZS5rZXlDb2RlID09PSBLRVkuVEFCKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hpZnRUYWJEb3duID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2UgaWYgKGUua2V5Q29kZSA9PT0gS0VZLlRBQikge1xyXG4gICAgICAgICAgICB0aGlzLnRhYkRvd24gPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zaGlmdFRhYkRvd24gPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy50YWJEb3duID0gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUga2V5ZG93bihlOktleWJvYXJkRXZlbnQpIHtcclxuICAgICAgICBsZXQgY29kZSA9IGUua2V5Q29kZTtcclxuICAgICAgICBpZiAoY29kZSA+PSA5NiAmJiBjb2RlIDw9IDEwNSkge1xyXG4gICAgICAgICAgICBjb2RlIC09IDQ4O1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICBpZiAoKGNvZGUgPT09IEtFWS5IT01FIHx8IGNvZGUgPT09IEtFWS5FTkQpICYmIGUuc2hpZnRLZXkpIHJldHVybjtcclxuICAgICAgICBpZiAoKGNvZGUgPT09IEtFWS5MRUZUIHx8IGNvZGUgPT09IEtFWS5SSUdIVCkgJiYgZS5zaGlmdEtleSkgcmV0dXJuO1xyXG4gICAgICAgIGlmICgoY29kZSA9PT0gS0VZLkMgfHwgY29kZSA9PT0gS0VZLkEgfHwgY29kZSA9PT0gS0VZLlYpICYmIGUuY3RybEtleSkgcmV0dXJuO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBwcmV2ZW50RGVmYXVsdCA9IHRydWU7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKGNvZGUgPT09IEtFWS5IT01FKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaG9tZSgpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gS0VZLkVORCkge1xyXG4gICAgICAgICAgICB0aGlzLmVuZCgpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gS0VZLkxFRlQpIHtcclxuICAgICAgICAgICAgdGhpcy5sZWZ0KCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb2RlID09PSBLRVkuUklHSFQpIHtcclxuICAgICAgICAgICAgdGhpcy5yaWdodCgpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gS0VZLlRBQiAmJiBlLnNoaWZ0S2V5KSB7XHJcbiAgICAgICAgICAgIHByZXZlbnREZWZhdWx0ID0gdGhpcy5zaGlmdFRhYigpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gS0VZLlRBQikge1xyXG4gICAgICAgICAgICBwcmV2ZW50RGVmYXVsdCA9IHRoaXMudGFiKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb2RlID09PSBLRVkuVVApIHtcclxuICAgICAgICAgICAgdGhpcy51cCgpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gS0VZLkRPV04pIHtcclxuICAgICAgICAgICAgdGhpcy5kb3duKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChwcmV2ZW50RGVmYXVsdCkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBrZXlQcmVzc2VkID0gU3RyaW5nLmZyb21DaGFyQ29kZShjb2RlKTtcclxuICAgICAgICBpZiAoL15bMC05XXxbQS16XSQvLnRlc3Qoa2V5UHJlc3NlZCkpIHtcclxuICAgICAgICAgICAgbGV0IHRleHRCdWZmZXIgPSB0aGlzLmlucHV0LmdldFRleHRCdWZmZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC5zZXRUZXh0QnVmZmVyKHRleHRCdWZmZXIgKyBrZXlQcmVzc2VkKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IEtFWS5CQUNLU1BBQ0UpIHtcclxuICAgICAgICAgICAgbGV0IHRleHRCdWZmZXIgPSB0aGlzLmlucHV0LmdldFRleHRCdWZmZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC5zZXRUZXh0QnVmZmVyKHRleHRCdWZmZXIuc2xpY2UoMCwgLTEpKTtcclxuICAgICAgICB9IGVsc2UgaWYgKCFlLnNoaWZ0S2V5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXQuc2V0VGV4dEJ1ZmZlcignJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGhvbWUoKSB7XHJcbiAgICAgICAgbGV0IGZpcnN0ID0gdGhpcy5pbnB1dC5nZXRGaXJzdFNlbGVjdGFibGVEYXRlUGFydCgpO1xyXG4gICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChmaXJzdCk7XHJcbiAgICAgICAgdGhpcy5pbnB1dC51cGRhdGVWaWV3KCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgZW5kKCkge1xyXG4gICAgICAgIGxldCBsYXN0ID0gdGhpcy5pbnB1dC5nZXRMYXN0U2VsZWN0YWJsZURhdGVQYXJ0KCk7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5zZXRTZWxlY3RlZERhdGVQYXJ0KGxhc3QpOyAgICAgXHJcbiAgICAgICAgdGhpcy5pbnB1dC51cGRhdGVWaWV3KCk7ICAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgbGVmdCgpIHtcclxuICAgICAgICBsZXQgcHJldmlvdXMgPSB0aGlzLmlucHV0LmdldFByZXZpb3VzU2VsZWN0YWJsZURhdGVQYXJ0KCk7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5zZXRTZWxlY3RlZERhdGVQYXJ0KHByZXZpb3VzKTtcclxuICAgICAgICB0aGlzLmlucHV0LnVwZGF0ZVZpZXcoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSByaWdodCgpIHtcclxuICAgICAgICBsZXQgbmV4dCA9IHRoaXMuaW5wdXQuZ2V0TmV4dFNlbGVjdGFibGVEYXRlUGFydCgpO1xyXG4gICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChuZXh0KTtcclxuICAgICAgICB0aGlzLmlucHV0LnVwZGF0ZVZpZXcoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBzaGlmdFRhYigpIHtcclxuICAgICAgICBsZXQgcHJldmlvdXMgPSB0aGlzLmlucHV0LmdldFByZXZpb3VzU2VsZWN0YWJsZURhdGVQYXJ0KCk7XHJcbiAgICAgICAgaWYgKHByZXZpb3VzICE9PSB0aGlzLmlucHV0LmdldFNlbGVjdGVkRGF0ZVBhcnQoKSkge1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQocHJldmlvdXMpO1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0LnVwZGF0ZVZpZXcoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSB0YWIoKSB7XHJcbiAgICAgICAgbGV0IG5leHQgPSB0aGlzLmlucHV0LmdldE5leHRTZWxlY3RhYmxlRGF0ZVBhcnQoKTtcclxuICAgICAgICBpZiAobmV4dCAhPT0gdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkpIHtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC5zZXRTZWxlY3RlZERhdGVQYXJ0KG5leHQpO1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0LnVwZGF0ZVZpZXcoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSB1cCgpIHtcclxuICAgICAgICB0aGlzLmlucHV0LmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5pbmNyZW1lbnQoKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgbGV2ZWwgPSB0aGlzLmlucHV0LmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5nZXRMZXZlbCgpO1xyXG4gICAgICAgIGxldCBkYXRlID0gdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0VmFsdWUoKTtcclxuICAgICAgICBcclxuICAgICAgICB0cmlnZ2VyLmdvdG8odGhpcy5pbnB1dC5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgIGRhdGU6IGRhdGUsXHJcbiAgICAgICAgICAgIGxldmVsOiBsZXZlbFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGRvd24oKSB7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZGVjcmVtZW50KCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGxldmVsID0gdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0TGV2ZWwoKTtcclxuICAgICAgICBsZXQgZGF0ZSA9IHRoaXMuaW5wdXQuZ2V0U2VsZWN0ZWREYXRlUGFydCgpLmdldFZhbHVlKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdHJpZ2dlci5nb3RvKHRoaXMuaW5wdXQuZWxlbWVudCwge1xyXG4gICAgICAgICAgICBkYXRlOiBkYXRlLFxyXG4gICAgICAgICAgICBsZXZlbDogbGV2ZWxcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsImNsYXNzIE1vdXNlRXZlbnRIYW5kbGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgaW5wdXQ6SW5wdXQpIHtcclxuICAgICAgICBsaXN0ZW4ubW91c2Vkb3duKGlucHV0LmVsZW1lbnQsICgpID0+IHRoaXMubW91c2Vkb3duKCkpO1xyXG4gICAgICAgIGxpc3Rlbi5tb3VzZXVwKGRvY3VtZW50LCAoKSA9PiB0aGlzLm1vdXNldXAoKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gU3RvcCBkZWZhdWx0XHJcbiAgICAgICAgaW5wdXQuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ2VudGVyXCIsIChlKSA9PiBlLnByZXZlbnREZWZhdWx0KCkpO1xyXG4gICAgICAgIGlucHV0LmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdvdmVyXCIsIChlKSA9PiBlLnByZXZlbnREZWZhdWx0KCkpO1xyXG4gICAgICAgIGlucHV0LmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImRyb3BcIiwgKGUpID0+IGUucHJldmVudERlZmF1bHQoKSk7XHJcbiAgICAgICAgaW5wdXQuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY3V0XCIsIChlKSA9PiBlLnByZXZlbnREZWZhdWx0KCkpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGRvd246Ym9vbGVhbjtcclxuICAgIHByaXZhdGUgY2FyZXRTdGFydDpudW1iZXI7XHJcbiAgICBcclxuICAgIHByaXZhdGUgbW91c2Vkb3duKCkge1xyXG4gICAgICAgIHRoaXMuZG93biA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5lbGVtZW50LnNldFNlbGVjdGlvblJhbmdlKHZvaWQgMCwgdm9pZCAwKTtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICB0aGlzLmNhcmV0U3RhcnQgPSB0aGlzLmlucHV0LmVsZW1lbnQuc2VsZWN0aW9uU3RhcnQ7IFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIG1vdXNldXAgPSAoKSA9PiB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmRvd24pIHJldHVybjtcclxuICAgICAgICB0aGlzLmRvd24gPSBmYWxzZTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgcG9zOm51bWJlcjtcclxuICAgICAgICBcclxuICAgICAgICBpZiAodGhpcy5pbnB1dC5lbGVtZW50LnNlbGVjdGlvblN0YXJ0ID09PSB0aGlzLmNhcmV0U3RhcnQpIHtcclxuICAgICAgICAgICAgcG9zID0gdGhpcy5pbnB1dC5lbGVtZW50LnNlbGVjdGlvbkVuZDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwb3MgPSB0aGlzLmlucHV0LmVsZW1lbnQuc2VsZWN0aW9uU3RhcnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBibG9jayA9IHRoaXMuaW5wdXQuZ2V0TmVhcmVzdFNlbGVjdGFibGVEYXRlUGFydChwb3MpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChibG9jayk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMuaW5wdXQuZWxlbWVudC5zZWxlY3Rpb25TdGFydCA+IDAgfHwgdGhpcy5pbnB1dC5lbGVtZW50LnNlbGVjdGlvbkVuZCA8IHRoaXMuaW5wdXQuZWxlbWVudC52YWx1ZS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC51cGRhdGVWaWV3KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSIsImNsYXNzIFBhcnNlciB7XHJcbiAgICBwdWJsaWMgc3RhdGljIHBhcnNlKGZvcm1hdDpzdHJpbmcpOklEYXRlUGFydFtdIHtcclxuICAgICAgICBsZXQgdGV4dEJ1ZmZlciA9ICcnO1xyXG4gICAgICAgIGxldCBkYXRlUGFydHM6SURhdGVQYXJ0W10gPSBbXTtcclxuICAgIFxyXG4gICAgICAgIGxldCBpbmRleCA9IDA7ICAgICAgICAgICAgICAgIFxyXG4gICAgICAgIGxldCBpbkVzY2FwZWRTZWdtZW50ID0gZmFsc2U7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHB1c2hQbGFpblRleHQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0ZXh0QnVmZmVyLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGRhdGVQYXJ0cy5wdXNoKG5ldyBQbGFpblRleHQodGV4dEJ1ZmZlcikuc2V0U2VsZWN0YWJsZShmYWxzZSkpO1xyXG4gICAgICAgICAgICAgICAgdGV4dEJ1ZmZlciA9ICcnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHdoaWxlIChpbmRleCA8IGZvcm1hdC5sZW5ndGgpIHsgICAgIFxyXG4gICAgICAgICAgICBpZiAoIWluRXNjYXBlZFNlZ21lbnQgJiYgZm9ybWF0W2luZGV4XSA9PT0gJ1snKSB7XHJcbiAgICAgICAgICAgICAgICBpbkVzY2FwZWRTZWdtZW50ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGluZGV4Kys7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKGluRXNjYXBlZFNlZ21lbnQgJiYgZm9ybWF0W2luZGV4XSA9PT0gJ10nKSB7XHJcbiAgICAgICAgICAgICAgICBpbkVzY2FwZWRTZWdtZW50ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChpbkVzY2FwZWRTZWdtZW50KSB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0QnVmZmVyICs9IGZvcm1hdFtpbmRleF07XHJcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBmb3VuZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgZm9yIChsZXQgY29kZSBpbiBmb3JtYXRCbG9ja3MpIHtcclxuICAgICAgICAgICAgICAgIGlmIChQYXJzZXIuZmluZEF0KGZvcm1hdCwgaW5kZXgsIGB7JHtjb2RlfX1gKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHB1c2hQbGFpblRleHQoKTtcclxuICAgICAgICAgICAgICAgICAgICBkYXRlUGFydHMucHVzaChuZXcgZm9ybWF0QmxvY2tzW2NvZGVdKCkuc2V0U2VsZWN0YWJsZShmYWxzZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGluZGV4ICs9IGNvZGUubGVuZ3RoICsgMjtcclxuICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFBhcnNlci5maW5kQXQoZm9ybWF0LCBpbmRleCwgY29kZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBwdXNoUGxhaW5UZXh0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZVBhcnRzLnB1c2gobmV3IGZvcm1hdEJsb2Nrc1tjb2RlXSgpKTtcclxuICAgICAgICAgICAgICAgICAgICBpbmRleCArPSBjb2RlLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICghZm91bmQpIHtcclxuICAgICAgICAgICAgICAgIHRleHRCdWZmZXIgKz0gZm9ybWF0W2luZGV4XTtcclxuICAgICAgICAgICAgICAgIGluZGV4Kys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1c2hQbGFpblRleHQoKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgIHJldHVybiBkYXRlUGFydHM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgc3RhdGljIGZpbmRBdCAoc3RyOnN0cmluZywgaW5kZXg6bnVtYmVyLCBzZWFyY2g6c3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIHN0ci5zbGljZShpbmRleCwgaW5kZXggKyBzZWFyY2gubGVuZ3RoKSA9PT0gc2VhcmNoO1xyXG4gICAgfVxyXG59IiwiY2xhc3MgUGFzdGVFdmVudEhhbmRlciB7XHJcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGlucHV0OklucHV0KSB7XHJcbiAgICAgICAgbGlzdGVuLnBhc3RlKGlucHV0LmVsZW1lbnQsICgpID0+IHRoaXMucGFzdGUoKSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgcGFzdGUoKSB7XHJcbiAgICAgICAgbGV0IG9yaWdpbmFsVmFsdWUgPSB0aGlzLmlucHV0LmVsZW1lbnQudmFsdWU7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgaWYgKCF0aGlzLmlucHV0LmZvcm1hdC50ZXN0KHRoaXMuaW5wdXQuZWxlbWVudC52YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgdGhpcy5pbnB1dC5lbGVtZW50LnZhbHVlID0gb3JpZ2luYWxWYWx1ZTtcclxuICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgIH0gXHJcbiAgICAgICAgICAgXHJcbiAgICAgICAgICAgbGV0IG5ld0RhdGUgPSB0aGlzLmlucHV0LmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5nZXRWYWx1ZSgpO1xyXG4gICAgICAgICAgIFxyXG4gICAgICAgICAgIGxldCBzdHJQcmVmaXggPSAnJztcclxuICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuaW5wdXQuZGF0ZVBhcnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgIGxldCBkYXRlUGFydCA9IHRoaXMuaW5wdXQuZGF0ZVBhcnRzW2ldO1xyXG4gICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgbGV0IHJlZ0V4cCA9IG5ldyBSZWdFeHAoZGF0ZVBhcnQuZ2V0UmVnRXgoKS5zb3VyY2Uuc2xpY2UoMSwgLTEpLCAnaScpO1xyXG4gICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgbGV0IHZhbCA9IHRoaXMuaW5wdXQuZWxlbWVudC52YWx1ZS5yZXBsYWNlKHN0clByZWZpeCwgJycpLm1hdGNoKHJlZ0V4cClbMF07XHJcbiAgICAgICAgICAgICAgIHN0clByZWZpeCArPSB2YWw7XHJcbiAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICBpZiAoIWRhdGVQYXJ0LmlzU2VsZWN0YWJsZSgpKSBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgIGRhdGVQYXJ0LnNldFZhbHVlKG5ld0RhdGUpO1xyXG4gICAgICAgICAgICAgICBpZiAoZGF0ZVBhcnQuc2V0VmFsdWUodmFsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgbmV3RGF0ZSA9IGRhdGVQYXJ0LmdldFZhbHVlKCk7XHJcbiAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICB0aGlzLmlucHV0LmVsZW1lbnQudmFsdWUgPSBvcmlnaW5hbFZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgfVxyXG4gICAgICAgICAgIFxyXG4gICAgICAgICAgIHRyaWdnZXIuZ290byh0aGlzLmlucHV0LmVsZW1lbnQsIHtcclxuICAgICAgICAgICAgICAgZGF0ZTogbmV3RGF0ZSxcclxuICAgICAgICAgICAgICAgbGV2ZWw6IHRoaXMuaW5wdXQuZ2V0U2VsZWN0ZWREYXRlUGFydCgpLmdldExldmVsKClcclxuICAgICAgICAgICB9KTtcclxuICAgICAgICAgICBcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsImNsYXNzIFBpY2tlciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHVwZGF0ZShvcHRpb25zOklPcHRpb25zKSB7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbn1cclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
