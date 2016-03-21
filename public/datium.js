(function(){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
window['Datium'] = (function () {
    function Datium(element, options) {
        var internals = new DatiumInternals(element, options);
        this.updateOptions = function (options) { return internals.updateOptions(options); };
    }
    return Datium;
}());
var DatiumInternals = (function () {
    function DatiumInternals(element, options) {
        var _this = this;
        this.element = element;
        this.options = {};
        if (element === void 0)
            throw 'element is required';
        element.setAttribute('spellcheck', 'false');
        this.input = new Input(element);
        this.pickerManager = new PickerManager(element);
        this.updateOptions(options);
        listen.goto(element, function (e) { return _this.goto(e.date, e.level, e.update); });
        this.goto(this.options['defaultDate'], 6 /* NONE */);
    }
    DatiumInternals.prototype.goto = function (date, level, update) {
        if (update === void 0) { update = true; }
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
            level: level,
            update: update
        });
    };
    DatiumInternals.prototype.updateOptions = function (newOptions) {
        if (newOptions === void 0) { newOptions = {}; }
        this.options = OptionSanitizer.sanitize(newOptions, this.options);
        this.input.updateOptions(this.options);
        this.pickerManager.updateOptions(this.options, this.input.getLevels());
    };
    return DatiumInternals;
}());
function OptionException(msg) {
    return "[Datium Option Exception]\n  " + msg + "\n  See http://datium.io/documentation for documentation.";
}
var OptionSanitizer = (function () {
    function OptionSanitizer() {
    }
    OptionSanitizer.sanitizeDisplayAs = function (displayAs, dflt) {
        if (dflt === void 0) { dflt = 'h:mma MMM D, YYYY'; }
        if (displayAs === void 0)
            return dflt;
        if (typeof displayAs !== 'string')
            throw OptionException('The "displayAs" option must be a string');
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
    OptionSanitizer.sanitizeColor = function (color) {
        var threeHex = '\\s*#[A-Fa-f0-9]{3}\\s*';
        var sixHex = '\\s*#[A-Fa-f0-9]{6}\\s*';
        var rgb = '\\s*rgb\\(\\s*[0-9]{1,3}\\s*,\\s*[0-9]{1,3}\\s*,\\s*[0-9]{1,3}\\s*\\)\\s*';
        var rgba = '\\s*rgba\\(\\s*[0-9]{1,3}\\s*,\\s*[0-9]{1,3}\\s*,\\s*[0-9]{1,3}\\s*\\,\\s*[0-9]*\\.[0-9]+\\s*\\)\\s*';
        var sanitizeColorRegex = new RegExp("^((" + threeHex + ")|(" + sixHex + ")|(" + rgb + ")|(" + rgba + "))$");
        if (color === void 0)
            throw OptionException("All theme colors (primary, primary_text, secondary, secondary_text, secondary_accent) must be defined");
        if (!sanitizeColorRegex.test(color))
            throw OptionException("All theme colors must be valid rgb, rgba, or hex code");
        return color;
    };
    OptionSanitizer.sanitizeTheme = function (theme, dflt) {
        if (dflt === void 0) { dflt = "material"; }
        if (theme === void 0)
            return OptionSanitizer.sanitizeTheme(dflt, void 0);
        if (typeof theme === 'string') {
            switch (theme) {
                case 'light':
                    return {
                        primary: '#eee',
                        primary_text: '#666',
                        secondary: '#fff',
                        secondary_text: '#666',
                        secondary_accent: '#666'
                    };
                case 'dark':
                    return {
                        primary: '#444',
                        primary_text: '#eee',
                        secondary: '#333',
                        secondary_text: '#eee',
                        secondary_accent: '#fff'
                    };
                case 'material':
                    return {
                        primary: '#019587',
                        primary_text: '#fff',
                        secondary: '#fff',
                        secondary_text: '#888',
                        secondary_accent: '#019587'
                    };
                default:
                    throw "Name of theme not valid.";
            }
        }
        else if (typeof theme === 'object') {
            return {
                primary: OptionSanitizer.sanitizeColor(theme['primary']),
                secondary: OptionSanitizer.sanitizeColor(theme['secondary']),
                primary_text: OptionSanitizer.sanitizeColor(theme['primary_text']),
                secondary_text: OptionSanitizer.sanitizeColor(theme['secondary_text']),
                secondary_accent: OptionSanitizer.sanitizeColor(theme['secondary_accent'])
            };
        }
        else {
            throw OptionException('The "theme" option must be object or string');
        }
    };
    OptionSanitizer.sanitize = function (options, defaults) {
        var opts = {
            displayAs: OptionSanitizer.sanitizeDisplayAs(options['displayAs'], defaults.displayAs),
            minDate: OptionSanitizer.sanitizeMinDate(options['minDate'], defaults.minDate),
            maxDate: OptionSanitizer.sanitizeMaxDate(options['maxDate'], defaults.maxDate),
            defaultDate: OptionSanitizer.sanitizeDefaultDate(options['defaultDate'], defaults.defaultDate),
            theme: OptionSanitizer.sanitizeTheme(options['theme'], defaults.theme)
        };
        return opts;
    };
    OptionSanitizer.dfltDate = new Date();
    return OptionSanitizer;
}());
var Common = (function () {
    function Common() {
    }
    Common.prototype.getMonths = function () {
        return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    };
    Common.prototype.getShortMonths = function () {
        return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    };
    Common.prototype.getDays = function () {
        return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    };
    Common.prototype.getShortDays = function () {
        return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    };
    Common.prototype.getHours = function (date) {
        var num = date.getHours();
        if (num === 0)
            num = 12;
        if (num > 12)
            num -= 12;
        return num.toString();
    };
    Common.prototype.getDecade = function (date) {
        return Math.floor(date.getFullYear() / 10) * 10 + " - " + Math.ceil((date.getFullYear() + 1) / 10) * 10;
    };
    Common.prototype.getMeridiem = function (date) {
        return date.getHours() < 12 ? 'am' : 'pm';
    };
    Common.prototype.pad = function (num, size) {
        if (size === void 0) { size = 2; }
        var str = num.toString();
        while (str.length < size)
            str = '0' + str;
        return str;
    };
    Common.prototype.trim = function (str) {
        while (str[0] === '0' && str.length > 1) {
            str = str.substr(1, str.length);
        }
        return str;
    };
    return Common;
}());
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
    var matches = document.documentElement.matches || document.documentElement.msMatchesSelector;
    function handleDelegateEvent(parent, delegateSelector, callback) {
        return function (e) {
            var target = e.srcElement || e.target;
            while (!target.isEqualNode(parent)) {
                if (matches.call(target, delegateSelector)) {
                    callback(e);
                    return;
                }
                target = target.parentElement;
            }
        };
    }
    function attachEventsDelegate(events, parent, delegateSelector, callback) {
        var listeners = [];
        for (var key in events) {
            var event_1 = events[key];
            var newListener = handleDelegateEvent(parent, delegateSelector, callback);
            listeners.push({
                element: parent,
                reference: newListener,
                event: event_1
            });
            parent.addEventListener(event_1, newListener);
        }
        return listeners;
    }
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
    function down() {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i - 0] = arguments[_i];
        }
        if (params.length === 3) {
            return attachEventsDelegate(['mousedown', 'touchstart'], params[0], params[1], function (e) {
                params[2](e);
            });
        }
        else {
            return attachEvents(['mousedown', 'touchstart'], params[0], function (e) {
                params[1](e);
            });
        }
    }
    listen.down = down;
    ;
    function up(element, callback) {
        return attachEvents(['mouseup', 'touchend'], element, function (e) {
            callback(e);
        });
    }
    listen.up = up;
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
    function tap() {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i - 0] = arguments[_i];
        }
        var startTouchX, startTouchY;
        var handleStart = function (e) {
            startTouchX = e.touches[0].clientX;
            startTouchY = e.touches[0].clientY;
        };
        var handleEnd = function (e, callback) {
            if (e.changedTouches === void 0) {
                e.preventDefault();
                callback(e);
                return;
            }
            var xDiff = e.changedTouches[0].clientX - startTouchX;
            var yDiff = e.changedTouches[0].clientY - startTouchY;
            if (Math.sqrt(xDiff * xDiff + yDiff * yDiff) < 10) {
                e.preventDefault();
                callback(e);
            }
        };
        var listeners = [];
        if (params.length === 3) {
            listeners = listeners.concat(attachEventsDelegate(['touchstart'], params[0], params[1], handleStart));
            listeners = listeners.concat(attachEventsDelegate(['touchend', 'click'], params[0], params[1], function (e) {
                handleEnd(e, params[2]);
            }));
        }
        else if (params.length === 2) {
            listeners = listeners.concat(attachEvents(['touchstart'], params[0], handleStart));
            listeners = listeners.concat(attachEvents(['touchend', 'click'], params[0], function (e) {
                handleEnd(e, params[1]);
            }));
        }
        return listeners;
    }
    listen.tap = tap;
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
    PlainText.prototype.getLevel = function () { return 6 /* NONE */; };
    PlainText.prototype.isSelectable = function () { return false; };
    PlainText.prototype.toString = function () { return this.text; };
    return PlainText;
}());
var formatBlocks = (function () {
    var DatePart = (function (_super) {
        __extends(DatePart, _super);
        function DatePart() {
            _super.apply(this, arguments);
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
    }(Common));
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
            return this.setValue(partial);
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
            return 0 /* YEAR */;
        };
        FourDigitYear.prototype.toString = function () {
            return this.date.getFullYear().toString();
        };
        return FourDigitYear;
    }(DatePart));
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
            return /^-?\d{1,2}$/;
        };
        TwoDigitYear.prototype.toString = function () {
            return _super.prototype.toString.call(this).slice(-2);
        };
        return TwoDigitYear;
    }(FourDigitYear));
    var LongMonthName = (function (_super) {
        __extends(LongMonthName, _super);
        function LongMonthName() {
            _super.apply(this, arguments);
        }
        LongMonthName.prototype.getMonths = function () {
            return _super.prototype.getMonths.call(this);
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
            return 1 /* MONTH */;
        };
        LongMonthName.prototype.toString = function () {
            return this.getMonths()[this.date.getMonth()];
        };
        return LongMonthName;
    }(DatePart));
    var ShortMonthName = (function (_super) {
        __extends(ShortMonthName, _super);
        function ShortMonthName() {
            _super.apply(this, arguments);
        }
        ShortMonthName.prototype.getMonths = function () {
            return _super.prototype.getShortMonths.call(this);
        };
        return ShortMonthName;
    }(LongMonthName));
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
    }(LongMonthName));
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
    }(Month));
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
            return 2 /* DATE */;
        };
        DateNumeral.prototype.toString = function () {
            return this.date.getDate().toString();
        };
        return DateNumeral;
    }(DatePart));
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
    }(DateNumeral));
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
    }(DateNumeral));
    var LongDayName = (function (_super) {
        __extends(LongDayName, _super);
        function LongDayName() {
            _super.apply(this, arguments);
        }
        LongDayName.prototype.getDays = function () {
            return _super.prototype.getDays.call(this);
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
            return 2 /* DATE */;
        };
        LongDayName.prototype.toString = function () {
            return this.getDays()[this.date.getDay()];
        };
        return LongDayName;
    }(DatePart));
    var ShortDayName = (function (_super) {
        __extends(ShortDayName, _super);
        function ShortDayName() {
            _super.apply(this, arguments);
        }
        ShortDayName.prototype.getDays = function () {
            return _super.prototype.getShortDays.call(this);
        };
        return ShortDayName;
    }(LongDayName));
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
            return 3 /* HOUR */;
        };
        PaddedMilitaryHour.prototype.getRegEx = function () {
            return /^(((0|1)[0-9])|(2[0-3]))$/;
        };
        PaddedMilitaryHour.prototype.toString = function () {
            return this.pad(this.date.getHours());
        };
        return PaddedMilitaryHour;
    }(DatePart));
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
    }(PaddedMilitaryHour));
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
            return this.pad(this.getHours(this.date));
        };
        return PaddedHour;
    }(PaddedMilitaryHour));
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
    }(PaddedHour));
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
            return 4 /* MINUTE */;
        };
        PaddedMinute.prototype.toString = function () {
            return this.pad(this.date.getMinutes());
        };
        return PaddedMinute;
    }(DatePart));
    var Minute = (function (_super) {
        __extends(Minute, _super);
        function Minute() {
            _super.apply(this, arguments);
        }
        Minute.prototype.setValueFromPartial = function (partial) {
            return this.setValue(this.trim(partial));
        };
        Minute.prototype.getRegEx = function () {
            return /^[0-5]?[0-9]$/;
        };
        Minute.prototype.toString = function () {
            return this.date.getMinutes().toString();
        };
        return Minute;
    }(PaddedMinute));
    var PaddedSecond = (function (_super) {
        __extends(PaddedSecond, _super);
        function PaddedSecond() {
            _super.apply(this, arguments);
        }
        PaddedSecond.prototype.increment = function () {
            var num = this.date.getSeconds() + 1;
            if (num > 59)
                num = 0;
            this.date.setSeconds(num);
        };
        PaddedSecond.prototype.decrement = function () {
            var num = this.date.getSeconds() - 1;
            if (num < 0)
                num = 59;
            this.date.setSeconds(num);
        };
        PaddedSecond.prototype.setValueFromPartial = function (partial) {
            return this.setValue(this.pad(partial));
        };
        PaddedSecond.prototype.setValue = function (value) {
            if (typeof value === 'object') {
                this.date = new Date(value.valueOf());
                return true;
            }
            else if (typeof value === 'string' && this.getRegEx().test(value)) {
                this.date.setSeconds(parseInt(value, 10));
                return true;
            }
            return false;
        };
        PaddedSecond.prototype.getRegEx = function () {
            return /^[0-5][0-9]$/;
        };
        PaddedSecond.prototype.getMaxBuffer = function () {
            return this.date.getSeconds() > 5 ? 1 : 2;
        };
        PaddedSecond.prototype.getLevel = function () {
            return 5 /* SECOND */;
        };
        PaddedSecond.prototype.toString = function () {
            return this.pad(this.date.getSeconds());
        };
        return PaddedSecond;
    }(DatePart));
    var Second = (function (_super) {
        __extends(Second, _super);
        function Second() {
            _super.apply(this, arguments);
        }
        Second.prototype.setValueFromPartial = function (partial) {
            return this.setValue(this.trim(partial));
        };
        Second.prototype.getRegEx = function () {
            return /^[0-5]?[0-9]$/;
        };
        Second.prototype.toString = function () {
            return this.date.getSeconds().toString();
        };
        return Second;
    }(PaddedSecond));
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
            return 3 /* HOUR */;
        };
        UppercaseMeridiem.prototype.getMaxBuffer = function () {
            return 1;
        };
        UppercaseMeridiem.prototype.getRegEx = function () {
            return /^((am)|(pm))$/i;
        };
        UppercaseMeridiem.prototype.toString = function () {
            return this.getMeridiem(this.date).toUpperCase();
        };
        return UppercaseMeridiem;
    }(DatePart));
    var LowercaseMeridiem = (function (_super) {
        __extends(LowercaseMeridiem, _super);
        function LowercaseMeridiem() {
            _super.apply(this, arguments);
        }
        LowercaseMeridiem.prototype.toString = function () {
            return this.getMeridiem(this.date);
        };
        return LowercaseMeridiem;
    }(UppercaseMeridiem));
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
    formatBlocks['m'] = Minute;
    formatBlocks['ss'] = PaddedSecond;
    formatBlocks['s'] = Second;
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
        listen.viewchanged(element, function (e) { return _this.viewchanged(e.date, e.level, e.update); });
    }
    Input.prototype.getLevels = function () {
        var levels = [];
        this.dateParts.forEach(function (datePart) {
            if (levels.indexOf(datePart.getLevel()) === -1 && datePart.isSelectable()) {
                levels.push(datePart.getLevel());
            }
        });
        return levels;
    };
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
    Input.prototype.viewchanged = function (date, level, update) {
        var _this = this;
        this.dateParts.forEach(function (datePart) {
            if (update)
                datePart.setValue(date);
            if (datePart.getLevel() === level &&
                _this.getSelectedDatePart() !== void 0 &&
                level !== _this.getSelectedDatePart().getLevel()) {
                _this.setSelectedDatePart(datePart);
            }
        });
        this.updateView();
    };
    Input.prototype.triggerViewChange = function () {
        trigger.viewchanged(this.element, {
            date: this.getSelectedDatePart().getValue(),
            level: this.getSelectedDatePart().getLevel()
        });
    };
    return Input;
}());
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
                    _this.input.triggerViewChange();
                });
            }
            else if (_this.shiftTabDown) {
                var last = _this.input.getLastSelectableDatePart();
                _this.input.setSelectedDatePart(last);
                setTimeout(function () {
                    _this.input.triggerViewChange();
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
}());
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
                _this.input.triggerViewChange();
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
}());
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
}());
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
}());
var Header = (function (_super) {
    __extends(Header, _super);
    function Header(element, container) {
        var _this = this;
        _super.call(this);
        this.element = element;
        this.container = container;
        listen.viewchanged(element, function (e) { return _this.viewchanged(e.date, e.level); });
        this.yearLabel = container.querySelector('datium-span-label.datium-year');
        this.monthLabel = container.querySelector('datium-span-label.datium-month');
        this.dateLabel = container.querySelector('datium-span-label.datium-date');
        this.hourLabel = container.querySelector('datium-span-label.datium-hour');
        this.minuteLabel = container.querySelector('datium-span-label.datium-minute');
        this.secondLabel = container.querySelector('datium-span-label.datium-second');
        this.labels = [this.yearLabel, this.monthLabel, this.dateLabel, this.hourLabel, this.minuteLabel, this.secondLabel];
        var previousButton = container.querySelector('datium-prev');
        var nextButton = container.querySelector('datium-next');
        var spanLabelContainer = container.querySelector('datium-span-label-container');
        listen.tap(previousButton, function () { return _this.previous(); });
        listen.tap(nextButton, function () { return _this.next(); });
        listen.tap(spanLabelContainer, function () { return _this.zoomOut(); });
    }
    Header.prototype.previous = function () {
        trigger.goto(this.element, {
            date: this.stepDate(1 /* DOWN */),
            level: this.level,
            update: false
        });
    };
    Header.prototype.next = function () {
        trigger.goto(this.element, {
            date: this.stepDate(0 /* UP */),
            level: this.level,
            update: false
        });
    };
    Header.prototype.zoomOut = function () {
        var newLevel = this.levels[this.levels.indexOf(this.level) - 1];
        if (newLevel === void 0)
            return;
        trigger.goto(this.element, {
            date: this.date,
            level: newLevel,
            update: false
        });
    };
    Header.prototype.stepDate = function (stepType) {
        var date = new Date(this.date.valueOf());
        var direction = stepType === 0 /* UP */ ? 1 : -1;
        switch (this.level) {
            case 0 /* YEAR */:
                date.setFullYear(date.getFullYear() + 10 * direction);
                break;
            case 1 /* MONTH */:
                date.setFullYear(date.getFullYear() + direction);
                break;
            case 2 /* DATE */:
                date.setMonth(date.getMonth() + direction);
                break;
            case 3 /* HOUR */:
                date.setDate(date.getDate() + direction);
                break;
            case 4 /* MINUTE */:
                date.setHours(date.getHours() + direction);
                break;
            case 5 /* SECOND */:
                date.setMinutes(date.getMinutes() + direction);
                break;
        }
        return date;
    };
    Header.prototype.viewchanged = function (date, level) {
        var _this = this;
        if (this.date !== void 0 &&
            date.valueOf() === this.date.valueOf() &&
            level === this.level) {
            return;
        }
        this.date = date;
        this.level = level;
        this.labels.forEach(function (label, labelLevel) {
            label.classList.remove('datium-top');
            label.classList.remove('datium-bottom');
            label.classList.remove('datium-hidden');
            if (labelLevel < level) {
                label.classList.add('datium-top');
                label.innerHTML = _this.getHeaderTopText(date, labelLevel);
            }
            else {
                label.classList.add('datium-bottom');
                label.innerHTML = _this.getHeaderBottomText(date, labelLevel);
            }
            if (labelLevel < level - 1 || labelLevel > level) {
                label.classList.add('datium-hidden');
            }
        });
    };
    Header.prototype.getHeaderTopText = function (date, level) {
        switch (level) {
            case 0 /* YEAR */:
                return this.getDecade(date);
            case 1 /* MONTH */:
                return date.getFullYear().toString();
            case 2 /* DATE */:
                return this.getShortMonths()[date.getMonth()] + " " + date.getFullYear();
            case 3 /* HOUR */:
            case 4 /* MINUTE */:
                return this.getShortDays()[date.getDay()] + " " + this.pad(date.getDate()) + " " + this.getShortMonths()[date.getMonth()] + " " + date.getFullYear();
        }
    };
    Header.prototype.getHeaderBottomText = function (date, level) {
        switch (level) {
            case 0 /* YEAR */:
                return this.getDecade(date);
            case 1 /* MONTH */:
                return date.getFullYear().toString();
            case 2 /* DATE */:
                return this.getShortMonths()[date.getMonth()];
            case 3 /* HOUR */:
                return this.getShortDays()[date.getDay()] + " " + this.pad(date.getDate()) + " <datium-variable>" + this.getHours(date) + this.getMeridiem(date) + "</datium-variable>";
            case 4 /* MINUTE */:
                return this.getHours(date) + ":<datium-variable>" + this.pad(date.getMinutes()) + "</datium-variable>" + this.getMeridiem(date);
            case 5 /* SECOND */:
                return this.getHours(date) + ":" + this.pad(date.getMinutes()) + ":<datium-variable>" + this.pad(date.getSeconds()) + "</datium-variable>" + this.getMeridiem(date);
        }
    };
    Header.prototype.updateOptions = function (options, levels) {
        this.options = options;
        this.levels = levels;
    };
    return Header;
}(Common));
var PickerManager = (function () {
    function PickerManager(element) {
        var _this = this;
        this.element = element;
        this.container = this.createView();
        this.insertAfter(element, this.container);
        this.pickerContainer = this.container.querySelector('datium-picker-container');
        this.header = new Header(element, this.container);
        this.yearPicker = new YearPicker(element, this.container);
        this.monthPicker = new MonthPicker(element, this.container);
        this.datePicker = new DatePicker(element, this.container);
        this.hourPicker = new HourPicker(element, this.container);
        this.minutePicker = new MinutePicker(element, this.container);
        this.secondPicker = new SecondPicker(element, this.container);
        listen.down(this.container, '*', function (e) { return _this.down(e); });
        listen.up(document, function () { return _this.up(); });
        listen.mousedown(this.container, function (e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
        listen.viewchanged(element, function (e) { return _this.viewchanged(e.date, e.level, e.update); });
    }
    PickerManager.prototype.viewchanged = function (date, level, selectedDateChange) {
        if (level === 6 /* NONE */) {
            if (this.currentPicker !== void 0) {
                this.currentPicker.remove(3 /* ZOOM_OUT */);
            }
            this.adjustHeight(10);
            return;
        }
        var transition;
        if (this.currentPicker === void 0) {
            this.currentPicker = this.getPicker(level);
            this.currentPicker.create(date, 2 /* ZOOM_IN */);
        }
        else if ((transition = this.getTransition(date, level)) !== void 0) {
            this.currentPicker.remove(transition);
            this.currentPicker = this.getPicker(level);
            this.currentPicker.create(date, transition);
        }
        if (selectedDateChange) {
            this.currentPicker.setSelectedDate(date);
        }
        this.adjustHeight(this.currentPicker.getHeight());
    };
    PickerManager.prototype.getTransition = function (date, level) {
        if (level > this.currentPicker.getLevel())
            return 2 /* ZOOM_IN */;
        if (level < this.currentPicker.getLevel())
            return 3 /* ZOOM_OUT */;
        if (date.valueOf() < this.currentPicker.getMin().valueOf())
            return 0 /* SLIDE_LEFT */;
        if (date.valueOf() > this.currentPicker.getMax().valueOf())
            return 1 /* SLIDE_RIGHT */;
        return void 0;
    };
    PickerManager.prototype.adjustHeight = function (height) {
        this.pickerContainer.style.transform = "translateY(" + (height - 280) + "px)";
    };
    PickerManager.prototype.getPicker = function (level) {
        return [this.yearPicker, this.monthPicker, this.datePicker, this.hourPicker, this.minutePicker, this.secondPicker][level];
    };
    PickerManager.prototype.up = function () {
        var activeElements = this.container.querySelectorAll('.datium-active');
        for (var i = 0; i < activeElements.length; i++) {
            activeElements[i].classList.remove('datium-active');
        }
        this.container.classList.remove('datium-active');
    };
    PickerManager.prototype.down = function (e) {
        var el = e.srcElement || e.target;
        while (el !== this.container) {
            el.classList.add('datium-active');
            el = el.parentElement;
        }
        this.container.classList.add('datium-active');
    };
    PickerManager.prototype.updateOptions = function (options, levels) {
        var themeUpdated = this.options === void 0 ||
            this.options.theme === void 0 ||
            this.options.theme.primary !== options.theme.primary ||
            this.options.theme.primary_text !== options.theme.primary_text ||
            this.options.theme.secondary !== options.theme.secondary ||
            this.options.theme.secondary_accent !== options.theme.secondary_accent ||
            this.options.theme.secondary_text !== options.theme.secondary_text;
        this.options = options;
        if (themeUpdated) {
            this.insertStyles();
        }
        this.header.updateOptions(options, levels);
        this.yearPicker.updateOptions(options);
        this.monthPicker.updateOptions(options);
        this.datePicker.updateOptions(options);
        this.hourPicker.updateOptions(options);
        this.minutePicker.updateOptions(options);
        this.secondPicker.updateOptions(options);
    };
    PickerManager.prototype.createView = function () {
        var el = document.createElement('datium-container');
        el.innerHTML = header + "\n        <datium-picker-container-wrapper>\n            <datium-picker-container></datium-picker-container>\n        </datium-picker-container-wrapper>";
        return el;
    };
    PickerManager.prototype.insertAfter = function (node, newNode) {
        node.parentNode.insertBefore(newNode, node.nextSibling);
    };
    PickerManager.prototype.insertStyles = function () {
        var head = document.head || document.getElementsByTagName('head')[0];
        var styleElement = document.createElement('style');
        var styleId = "datium-style" + (PickerManager.stylesInserted++);
        var existingStyleId = this.getExistingStyleId();
        if (existingStyleId !== null) {
            this.container.classList.remove(existingStyleId);
        }
        this.container.classList.add(styleId);
        var transformedCss = css.replace(/_primary_text/g, this.options.theme.primary_text);
        transformedCss = transformedCss.replace(/_primary/g, this.options.theme.primary);
        transformedCss = transformedCss.replace(/_secondary_text/g, this.options.theme.secondary_text);
        transformedCss = transformedCss.replace(/_secondary_accent/g, this.options.theme.secondary_accent);
        transformedCss = transformedCss.replace(/_secondary/g, this.options.theme.secondary);
        transformedCss = transformedCss.replace(/_id/g, styleId);
        styleElement.type = 'text/css';
        if (styleElement.styleSheet) {
            styleElement.styleSheet.cssText = transformedCss;
        }
        else {
            styleElement.appendChild(document.createTextNode(transformedCss));
        }
        head.appendChild(styleElement);
    };
    PickerManager.prototype.getExistingStyleId = function () {
        for (var i = 0; i < this.container.classList.length; i++) {
            if (/^datium-style\d+$/.test(this.container.classList.item(i))) {
                return this.container.classList.item(i);
            }
        }
        return null;
    };
    PickerManager.stylesInserted = 0;
    return PickerManager;
}());
var header = "<datium-header-wrapper> <datium-header> <datium-span-label-container> <datium-span-label class='datium-year'></datium-span-label> <datium-span-label class='datium-month'></datium-span-label> <datium-span-label class='datium-date'></datium-span-label> <datium-span-label class='datium-hour'></datium-span-label> <datium-span-label class='datium-minute'></datium-span-label> <datium-span-label class='datium-second'></datium-span-label> </datium-span-label-container> <datium-prev></datium-prev> <datium-next></datium-next> </datium-header> </datium-header-wrapper>";
var Picker = (function () {
    function Picker(element, container) {
        this.min = new Date();
        this.max = new Date();
        this.pickerContainer = container.querySelector('datium-picker-container');
    }
    Picker.prototype.create = function (date, transition) {
    };
    Picker.prototype.remove = function (transition) {
    };
    Picker.prototype.getDate = function () {
        return null;
    };
    Picker.prototype.getMin = function () {
        return this.min;
    };
    Picker.prototype.getMax = function () {
        return this.max;
    };
    Picker.prototype.getLevel = function () {
        return 0 /* YEAR */;
    };
    Picker.prototype.setSelectedDate = function (date) {
    };
    Picker.prototype.transitionOut = function (transition) {
        if (transition === 0 /* SLIDE_LEFT */) {
            this.picker.classList.add('datium-picker-right');
        }
        else if (transition === 1 /* SLIDE_RIGHT */) {
            this.picker.classList.add('datium-picker-left');
        }
        else if (transition === 2 /* ZOOM_IN */) {
            this.picker.classList.add('datium-picker-out');
        }
        else {
            this.picker.classList.add('datium-picker-in');
        }
    };
    Picker.prototype.transitionIn = function (transition) {
        if (transition === 0 /* SLIDE_LEFT */) {
            this.picker.classList.add('datium-picker-left');
        }
        else if (transition === 1 /* SLIDE_RIGHT */) {
            this.picker.classList.add('datium-picker-right');
        }
        else if (transition === 2 /* ZOOM_IN */) {
            this.picker.classList.add('datium-picker-in');
        }
        else {
            this.picker.classList.add('datium-picker-out');
        }
    };
    Picker.prototype.getTransitionClass = function (transition) {
        return ['datium-transition-left', 'datium-transition-right',
            'datium-transition-in', 'datium-transition-out'][transition];
    };
    return Picker;
}());
/// <reference path="picker.ts" />
var DatePicker = (function (_super) {
    __extends(DatePicker, _super);
    function DatePicker(element, container) {
        _super.call(this, element, container);
    }
    DatePicker.prototype.updateOptions = function (options) {
    };
    DatePicker.prototype.getHeight = function () {
        return 200;
    };
    return DatePicker;
}(Picker));
/// <reference path="picker.ts" />
var HourPicker = (function (_super) {
    __extends(HourPicker, _super);
    function HourPicker(element, container) {
        _super.call(this, element, container);
    }
    HourPicker.prototype.updateOptions = function (options) {
    };
    HourPicker.prototype.getHeight = function () {
        return 260;
    };
    return HourPicker;
}(Picker));
/// <reference path="picker.ts" />
var MinutePicker = (function (_super) {
    __extends(MinutePicker, _super);
    function MinutePicker(element, container) {
        _super.call(this, element, container);
    }
    MinutePicker.prototype.updateOptions = function (options) {
    };
    MinutePicker.prototype.getHeight = function () {
        return 230;
    };
    return MinutePicker;
}(Picker));
/// <reference path="picker.ts" />
var MonthPicker = (function (_super) {
    __extends(MonthPicker, _super);
    function MonthPicker(element, container) {
        _super.call(this, element, container);
    }
    MonthPicker.prototype.updateOptions = function (options) {
    };
    MonthPicker.prototype.getHeight = function () {
        return 150;
    };
    return MonthPicker;
}(Picker));
/// <reference path="picker.ts" />
var SecondPicker = (function (_super) {
    __extends(SecondPicker, _super);
    function SecondPicker(element, container) {
        _super.call(this, element, container);
    }
    SecondPicker.prototype.updateOptions = function (options) {
    };
    SecondPicker.prototype.getHeight = function () {
        return 180;
    };
    return SecondPicker;
}(Picker));
/// <reference path="picker.ts" />
var YearPicker = (function (_super) {
    __extends(YearPicker, _super);
    function YearPicker(element, container) {
        _super.call(this, element, container);
        this.pickers = {};
    }
    YearPicker.prototype.updateOptions = function (options) {
    };
    YearPicker.prototype.create = function (date, transition) {
        var _this = this;
        this.min = new Date(Math.floor(date.getFullYear() / 10) * 10, 0);
        this.max = new Date(Math.ceil(date.getFullYear() / 10) * 10 + 1, 0);
        var iterator = new Date(this.min.valueOf());
        this.pickers[this.min.valueOf()] = document.createElement('datium-picker');
        this.transitionIn(transition);
        do {
            var yearElement = document.createElement('datium-year-element');
            yearElement.innerHTML = iterator.getFullYear().toString();
            this.picker.appendChild(yearElement);
            iterator.setFullYear(iterator.getFullYear() + 1);
        } while (iterator.valueOf() < this.max.valueOf());
        this.pickerContainer.appendChild(this.picker);
        setTimeout(function () {
            _this.picker.className = '';
        });
    };
    YearPicker.prototype.remove = function (transition) {
        this.transitionOut(transition);
        setTimeout(function (picker) {
            picker.remove();
        }, 400, this.picker);
    };
    YearPicker.prototype.getHeight = function () {
        return 180;
    };
    return YearPicker;
}(Picker));
var css = "datium-container._id datium-header-wrapper{overflow:hidden;position:absolute;left:-7px;right:-7px;top:-7px;height:87px;display:block;pointer-events:none}datium-container._id datium-header{position:relative;display:block;overflow:hidden;height:100px;background-color:_primary;border-top-left-radius:3px;border-top-right-radius:3px;z-index:1;margin:7px;width:calc(100% - 14px);pointer-events:auto;box-shadow:0 3px 6px rgba(0,0,0,.16),0 3px 6px rgba(0,0,0,.23)}datium-container._id datium-span-label-container{position:absolute;left:40px;right:40px;top:0;bottom:0;display:block;overflow:hidden;transition:.2s ease all;transform-origin:40px 40px}datium-container._id datium-span-label{position:absolute;font-size:18pt;color:_primary_text;font-weight:700;transform-origin:0 0;white-space:nowrap;transition:all .2s ease;text-transform:uppercase}datium-container._id datium-span-label.datium-top{transform:translateY(17px) scale(.66);width:151%;opacity:.6}datium-container._id datium-span-label.datium-bottom{transform:translateY(36px) scale(1);width:100%;opacity:1}datium-container._id datium-span-label.datium-top.datium-hidden{transform:translateY(5px) scale(.4);opacity:0}datium-container._id datium-span-label.datium-bottom.datium-hidden{transform:translateY(78px) scale(1.2);opacity:.5}datium-container._id datium-span-label:after{content:'';display:inline-block;position:absolute;margin-left:10px;margin-top:6px;height:17px;width:17px;opacity:0;transition:all .2s ease;background:url(data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22_primary_text%22%3E%3Cpath%20d%3D%22M17%2015l-2%202-5-5%202-2z%22%20fill-rule%3D%22evenodd%22%2F%3E%3Cpath%20d%3D%22M7%200a7%207%200%200%200-7%207%207%207%200%200%200%207%207%207%207%200%200%200%207-7%207%207%200%200%200-7-7zm0%202a5%205%200%200%201%205%205%205%205%200%200%201-5%205%205%205%200%200%201-5-5%205%205%200%200%201%205-5z%22%2F%3E%3Cpath%20d%3D%22M4%206h6v2H4z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E)}datium-container._id datium-span-label.datium-top:after{opacity:1}datium-container._id datium-span-label datium-variable{color:_primary;font-size:14pt;padding:0 4px;margin:0 2px;top:-2px;position:relative}datium-container._id datium-span-label datium-variable:before{content:'';position:absolute;left:0;top:0;right:0;bottom:0;border-radius:5px;background-color:_primary_text;z-index:-1;opacity:.7}datium-container._id datium-next,datium-container._id datium-prev{position:absolute;width:40px;top:0;bottom:0;transform-origin:20px 52px}datium-container._id datium-next:after,datium-container._id datium-next:before,datium-container._id datium-prev:after,datium-container._id datium-prev:before{content:'';position:absolute;display:block;width:3px;height:8px;left:50%;background-color:_primary_text;top:48px}datium-container._id datium-next.datium-active,datium-container._id datium-prev.datium-active{transform:scale(.9);opacity:.9}datium-container._id datium-prev{left:0}datium-container._id datium-prev:after,datium-container._id datium-prev:before{margin-left:-3px}datium-container._id datium-next{right:0}datium-container._id datium-prev:before{transform:rotate(45deg) translateY(-2.6px)}datium-container._id datium-prev:after{transform:rotate(-45deg) translateY(2.6px)}datium-container._id datium-next:before{transform:rotate(45deg) translateY(2.6px)}datium-container._id datium-next:after{transform:rotate(-45deg) translateY(-2.6px)}datium-container._id{display:block;position:absolute;width:280px;font-family:Roboto,Arial;margin-top:2px}datium-container._id,datium-container._id *{-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;-webkit-tap-highlight-color:transparent;cursor:default}datium-container._id datium-picker-container-wrapper{overflow:hidden;position:absolute;left:-7px;right:-7px;top:80px;height:270px;display:block;pointer-events:none}datium-container._id datium-picker-container{position:relative;width:calc(100% - 14px);height:260px;background-color:_secondary;display:block;margin:0 7px 7px;padding-top:20px;box-shadow:0 3px 6px rgba(0,0,0,.16),0 3px 6px rgba(0,0,0,.23);transform:translateY(-270px);pointer-events:auto;border-bottom-right-radius:3px;border-bottom-left-radius:3px;transition:all ease .2s;overflow:hidden}datium-container._id datium-picker{position:absolute;left:0;right:0;bottom:0;color:_secondary_text;transition:.4s ease all}datium-container._id datium-picker.datium-picker-left{transform:translateX(-100%);pointer-events:none;opacity:0}datium-container._id datium-picker.datium-picker-right{transform:translateX(100%);pointer-events:none;opacity:0}datium-container._id datium-picker.datium-picker-in{transform:scale(.8);pointer-events:none;opacity:0}datium-container._id datium-picker.datium-picker-out{transform:scale(1.2);pointer-events:none;opacity:0}datium-container._id datium-year-element{display:inline-block;width:25%;line-height:60px;text-align:center}";
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRhdGl1bS50cyIsIkRhdGl1bUludGVybmFscy50cyIsIk9wdGlvblNhbml0aXplci50cyIsImNvbW1vbi9Db21tb24udHMiLCJjb21tb24vQ3VzdG9tRXZlbnRQb2x5ZmlsbC50cyIsImNvbW1vbi9FdmVudHMudHMiLCJpbnB1dC9EYXRlUGFydHMudHMiLCJpbnB1dC9JbnB1dC50cyIsImlucHV0L0tleWJvYXJkRXZlbnRIYW5kbGVyLnRzIiwiaW5wdXQvTW91c2VFdmVudEhhbmRsZXIudHMiLCJpbnB1dC9QYXJzZXIudHMiLCJpbnB1dC9QYXN0ZUV2ZW50SGFuZGxlci50cyIsInBpY2tlci9IZWFkZXIudHMiLCJwaWNrZXIvUGlja2VyTWFuYWdlci50cyIsInBpY2tlci9odG1sL2hlYWRlci50cyIsInBpY2tlci9waWNrZXJzL1BpY2tlci50cyIsInBpY2tlci9waWNrZXJzL0RhdGVQaWNrZXIudHMiLCJwaWNrZXIvcGlja2Vycy9Ib3VyUGlja2VyLnRzIiwicGlja2VyL3BpY2tlcnMvTWludXRlUGlja2VyLnRzIiwicGlja2VyL3BpY2tlcnMvTW9udGhQaWNrZXIudHMiLCJwaWNrZXIvcGlja2Vycy9TZWNvbmRQaWNrZXIudHMiLCJwaWNrZXIvcGlja2Vycy9ZZWFyUGlja2VyLnRzIiwicGlja2VyL3N0eWxlcy9jc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBTSxNQUFPLENBQUMsUUFBUSxDQUFDLEdBQUc7SUFFdEIsZ0JBQVksT0FBd0IsRUFBRSxPQUFnQjtRQUNsRCxJQUFJLFNBQVMsR0FBRyxJQUFJLGVBQWUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDdEQsSUFBSSxDQUFDLGFBQWEsR0FBRyxVQUFDLE9BQWdCLElBQUssT0FBQSxTQUFTLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFoQyxDQUFnQyxDQUFDO0lBQ2hGLENBQUM7SUFDTCxhQUFDO0FBQUQsQ0FOMEIsQUFNekIsR0FBQSxDQUFBO0FDREQ7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RCxDQUFDLFFBQVEsUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUU7UUFFbEQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzlDLFVBQVUsQ0FBQztZQUNQLEtBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUMvQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSwyQkFBTSxHQUFiLFVBQWMsVUFBcUI7UUFDL0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMvQixVQUFVLENBQUMsVUFBQyxNQUFrQjtZQUMxQixNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDcEIsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDekIsQ0FBQztJQUdNLDhCQUFTLEdBQWhCO1FBQ0ksTUFBTSxDQUFDLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFDTCxpQkFBQztBQUFELENBaERBLEFBZ0RDLENBaER3QixNQUFNLEdBZ0Q5QjtBQ2xERCxJQUFJLEdBQUcsR0FBQyx3MkpBQXcySixDQUFDIiwiZmlsZSI6ImRhdGl1bS5qcyIsInNvdXJjZXNDb250ZW50IjpbIig8YW55PndpbmRvdylbJ0RhdGl1bSddID0gY2xhc3MgRGF0aXVtIHtcclxuICAgIHB1YmxpYyB1cGRhdGVPcHRpb25zOihvcHRpb25zOklPcHRpb25zKSA9PiB2b2lkO1xyXG4gICAgY29uc3RydWN0b3IoZWxlbWVudDpIVE1MSW5wdXRFbGVtZW50LCBvcHRpb25zOklPcHRpb25zKSB7XHJcbiAgICAgICAgbGV0IGludGVybmFscyA9IG5ldyBEYXRpdW1JbnRlcm5hbHMoZWxlbWVudCwgb3B0aW9ucyk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVPcHRpb25zID0gKG9wdGlvbnM6SU9wdGlvbnMpID0+IGludGVybmFscy51cGRhdGVPcHRpb25zKG9wdGlvbnMpO1xyXG4gICAgfVxyXG59IiwiY29uc3QgZW51bSBMZXZlbCB7XHJcbiAgICBZRUFSLCBNT05USCwgREFURSwgSE9VUixcclxuICAgIE1JTlVURSwgU0VDT05ELCBOT05FXHJcbn1cclxuXHJcbmNsYXNzIERhdGl1bUludGVybmFscyB7XHJcbiAgICBwcml2YXRlIG9wdGlvbnM6SU9wdGlvbnMgPSA8YW55Pnt9O1xyXG4gICAgXHJcbiAgICBwcml2YXRlIGlucHV0OklucHV0O1xyXG4gICAgcHJpdmF0ZSBwaWNrZXJNYW5hZ2VyOlBpY2tlck1hbmFnZXI7XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgZWxlbWVudDpIVE1MSW5wdXRFbGVtZW50LCBvcHRpb25zOklPcHRpb25zKSB7XHJcbiAgICAgICAgaWYgKGVsZW1lbnQgPT09IHZvaWQgMCkgdGhyb3cgJ2VsZW1lbnQgaXMgcmVxdWlyZWQnO1xyXG4gICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdzcGVsbGNoZWNrJywgJ2ZhbHNlJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5pbnB1dCA9IG5ldyBJbnB1dChlbGVtZW50KTtcclxuICAgICAgICB0aGlzLnBpY2tlck1hbmFnZXIgPSBuZXcgUGlja2VyTWFuYWdlcihlbGVtZW50KTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnVwZGF0ZU9wdGlvbnMob3B0aW9ucyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGlzdGVuLmdvdG8oZWxlbWVudCwgKGUpID0+IHRoaXMuZ290byhlLmRhdGUsIGUubGV2ZWwsIGUudXBkYXRlKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5nb3RvKHRoaXMub3B0aW9uc1snZGVmYXVsdERhdGUnXSwgTGV2ZWwuTk9ORSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnb3RvKGRhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWwsIHVwZGF0ZTpib29sZWFuID0gdHJ1ZSkge1xyXG4gICAgICAgIGlmIChkYXRlID09PSB2b2lkIDApIGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMubWluRGF0ZSAhPT0gdm9pZCAwICYmIGRhdGUudmFsdWVPZigpIDwgdGhpcy5vcHRpb25zLm1pbkRhdGUudmFsdWVPZigpKSB7XHJcbiAgICAgICAgICAgIGRhdGUgPSBuZXcgRGF0ZSh0aGlzLm9wdGlvbnMubWluRGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLm1heERhdGUgIT09IHZvaWQgMCAmJiBkYXRlLnZhbHVlT2YoKSA+IHRoaXMub3B0aW9ucy5tYXhEYXRlLnZhbHVlT2YoKSkge1xyXG4gICAgICAgICAgICBkYXRlID0gbmV3IERhdGUodGhpcy5vcHRpb25zLm1heERhdGUudmFsdWVPZigpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdHJpZ2dlci52aWV3Y2hhbmdlZCh0aGlzLmVsZW1lbnQsIHtcclxuICAgICAgICAgICAgZGF0ZTogZGF0ZSxcclxuICAgICAgICAgICAgbGV2ZWw6IGxldmVsLFxyXG4gICAgICAgICAgICB1cGRhdGU6IHVwZGF0ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdXBkYXRlT3B0aW9ucyhuZXdPcHRpb25zOklPcHRpb25zID0gPGFueT57fSkge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZShuZXdPcHRpb25zLCB0aGlzLm9wdGlvbnMpOyAgICAgICAgXHJcbiAgICAgICAgdGhpcy5pbnB1dC51cGRhdGVPcHRpb25zKHRoaXMub3B0aW9ucyk7XHJcbiAgICAgICAgdGhpcy5waWNrZXJNYW5hZ2VyLnVwZGF0ZU9wdGlvbnModGhpcy5vcHRpb25zLCB0aGlzLmlucHV0LmdldExldmVscygpKTtcclxuICAgIH1cclxufSIsImZ1bmN0aW9uIE9wdGlvbkV4Y2VwdGlvbihtc2c6c3RyaW5nKSB7XHJcbiAgICByZXR1cm4gYFtEYXRpdW0gT3B0aW9uIEV4Y2VwdGlvbl1cXG4gICR7bXNnfVxcbiAgU2VlIGh0dHA6Ly9kYXRpdW0uaW8vZG9jdW1lbnRhdGlvbiBmb3IgZG9jdW1lbnRhdGlvbi5gO1xyXG59XHJcblxyXG5jbGFzcyBPcHRpb25TYW5pdGl6ZXIge1xyXG4gICAgXHJcbiAgICBzdGF0aWMgZGZsdERhdGU6RGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICBcclxuICAgIHN0YXRpYyBzYW5pdGl6ZURpc3BsYXlBcyhkaXNwbGF5QXM6YW55LCBkZmx0OnN0cmluZyA9ICdoOm1tYSBNTU0gRCwgWVlZWScpIHtcclxuICAgICAgICBpZiAoZGlzcGxheUFzID09PSB2b2lkIDApIHJldHVybiBkZmx0O1xyXG4gICAgICAgIGlmICh0eXBlb2YgZGlzcGxheUFzICE9PSAnc3RyaW5nJykgdGhyb3cgT3B0aW9uRXhjZXB0aW9uKCdUaGUgXCJkaXNwbGF5QXNcIiBvcHRpb24gbXVzdCBiZSBhIHN0cmluZycpO1xyXG4gICAgICAgIHJldHVybiBkaXNwbGF5QXM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN0YXRpYyBzYW5pdGl6ZU1pbkRhdGUobWluRGF0ZTphbnksIGRmbHQ6RGF0ZSA9IHZvaWQgMCkge1xyXG4gICAgICAgIGlmIChtaW5EYXRlID09PSB2b2lkIDApIHJldHVybiBkZmx0O1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShtaW5EYXRlKTsgLy9UT0RPIGZpZ3VyZSB0aGlzIG91dCB5ZXNcclxuICAgIH1cclxuICAgIFxyXG4gICAgc3RhdGljIHNhbml0aXplTWF4RGF0ZShtYXhEYXRlOmFueSwgZGZsdDpEYXRlID0gdm9pZCAwKSB7XHJcbiAgICAgICAgaWYgKG1heERhdGUgPT09IHZvaWQgMCkgcmV0dXJuIGRmbHQ7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKG1heERhdGUpOyAvL1RPRE8gZmlndXJlIHRoaXMgb3V0IFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdGF0aWMgc2FuaXRpemVEZWZhdWx0RGF0ZShkZWZhdWx0RGF0ZTphbnksIGRmbHQ6RGF0ZSA9IHRoaXMuZGZsdERhdGUpIHtcclxuICAgICAgICBpZiAoZGVmYXVsdERhdGUgPT09IHZvaWQgMCkgcmV0dXJuIGRmbHQ7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKGRlZmF1bHREYXRlKTsgLy9UT0RPIGZpZ3VyZSB0aGlzIG91dFxyXG4gICAgfVxyXG4gICAgICAgIFxyXG4gICAgc3RhdGljIHNhbml0aXplQ29sb3IoY29sb3I6YW55KSB7XHJcbiAgICAgICAgbGV0IHRocmVlSGV4ID0gJ1xcXFxzKiNbQS1GYS1mMC05XXszfVxcXFxzKic7XHJcbiAgICAgICAgbGV0IHNpeEhleCA9ICdcXFxccyojW0EtRmEtZjAtOV17Nn1cXFxccyonO1xyXG4gICAgICAgIGxldCByZ2IgPSAnXFxcXHMqcmdiXFxcXChcXFxccypbMC05XXsxLDN9XFxcXHMqLFxcXFxzKlswLTldezEsM31cXFxccyosXFxcXHMqWzAtOV17MSwzfVxcXFxzKlxcXFwpXFxcXHMqJztcclxuICAgICAgICBsZXQgcmdiYSA9ICdcXFxccypyZ2JhXFxcXChcXFxccypbMC05XXsxLDN9XFxcXHMqLFxcXFxzKlswLTldezEsM31cXFxccyosXFxcXHMqWzAtOV17MSwzfVxcXFxzKlxcXFwsXFxcXHMqWzAtOV0qXFxcXC5bMC05XStcXFxccypcXFxcKVxcXFxzKic7XHJcbiAgICAgICAgbGV0IHNhbml0aXplQ29sb3JSZWdleCA9IG5ldyBSZWdFeHAoYF4oKCR7dGhyZWVIZXh9KXwoJHtzaXhIZXh9KXwoJHtyZ2J9KXwoJHtyZ2JhfSkpJGApO1xyXG5cclxuICAgICAgICBpZiAoY29sb3IgPT09IHZvaWQgMCkgdGhyb3cgT3B0aW9uRXhjZXB0aW9uKFwiQWxsIHRoZW1lIGNvbG9ycyAocHJpbWFyeSwgcHJpbWFyeV90ZXh0LCBzZWNvbmRhcnksIHNlY29uZGFyeV90ZXh0LCBzZWNvbmRhcnlfYWNjZW50KSBtdXN0IGJlIGRlZmluZWRcIik7XHJcbiAgICAgICAgaWYgKCFzYW5pdGl6ZUNvbG9yUmVnZXgudGVzdChjb2xvcikpIHRocm93IE9wdGlvbkV4Y2VwdGlvbihcIkFsbCB0aGVtZSBjb2xvcnMgbXVzdCBiZSB2YWxpZCByZ2IsIHJnYmEsIG9yIGhleCBjb2RlXCIpO1xyXG4gICAgICAgIHJldHVybiA8c3RyaW5nPmNvbG9yO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdGF0aWMgc2FuaXRpemVUaGVtZSh0aGVtZTphbnksIGRmbHQ6YW55ID0gXCJtYXRlcmlhbFwiKTpJVGhlbWUge1xyXG4gICAgICAgIGlmICh0aGVtZSA9PT0gdm9pZCAwKSByZXR1cm4gT3B0aW9uU2FuaXRpemVyLnNhbml0aXplVGhlbWUoZGZsdCwgdm9pZCAwKTtcclxuICAgICAgICBpZiAodHlwZW9mIHRoZW1lID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICBzd2l0Y2godGhlbWUpIHtcclxuICAgICAgICAgICAgY2FzZSAnbGlnaHQnOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDxJVGhlbWU+e1xyXG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnk6ICcjZWVlJyxcclxuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5X3RleHQ6ICcjNjY2JyxcclxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnk6ICcjZmZmJyxcclxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnlfdGV4dDogJyM2NjYnLFxyXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeV9hY2NlbnQ6ICcjNjY2J1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlICdkYXJrJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiA8SVRoZW1lPntcclxuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5OiAnIzQ0NCcsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeV90ZXh0OiAnI2VlZScsXHJcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5OiAnIzMzMycsXHJcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5X3RleHQ6ICcjZWVlJyxcclxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnlfYWNjZW50OiAnI2ZmZidcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSAnbWF0ZXJpYWwnOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDxJVGhlbWU+e1xyXG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnk6ICcjMDE5NTg3JyxcclxuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5X3RleHQ6ICcjZmZmJyxcclxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnk6ICcjZmZmJyxcclxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnlfdGV4dDogJyM4ODgnLFxyXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeV9hY2NlbnQ6ICcjMDE5NTg3J1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgdGhyb3cgXCJOYW1lIG9mIHRoZW1lIG5vdCB2YWxpZC5cIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoZW1lID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICByZXR1cm4gPElUaGVtZT4ge1xyXG4gICAgICAgICAgICAgICAgcHJpbWFyeTogT3B0aW9uU2FuaXRpemVyLnNhbml0aXplQ29sb3IodGhlbWVbJ3ByaW1hcnknXSksXHJcbiAgICAgICAgICAgICAgICBzZWNvbmRhcnk6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZUNvbG9yKHRoZW1lWydzZWNvbmRhcnknXSksXHJcbiAgICAgICAgICAgICAgICBwcmltYXJ5X3RleHQ6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZUNvbG9yKHRoZW1lWydwcmltYXJ5X3RleHQnXSksXHJcbiAgICAgICAgICAgICAgICBzZWNvbmRhcnlfdGV4dDogT3B0aW9uU2FuaXRpemVyLnNhbml0aXplQ29sb3IodGhlbWVbJ3NlY29uZGFyeV90ZXh0J10pLFxyXG4gICAgICAgICAgICAgICAgc2Vjb25kYXJ5X2FjY2VudDogT3B0aW9uU2FuaXRpemVyLnNhbml0aXplQ29sb3IodGhlbWVbJ3NlY29uZGFyeV9hY2NlbnQnXSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IE9wdGlvbkV4Y2VwdGlvbignVGhlIFwidGhlbWVcIiBvcHRpb24gbXVzdCBiZSBvYmplY3Qgb3Igc3RyaW5nJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSBcclxuICAgIFxyXG4gICAgXHJcbiAgICBzdGF0aWMgc2FuaXRpemUob3B0aW9uczpJT3B0aW9ucywgZGVmYXVsdHM6SU9wdGlvbnMpIHtcclxuICAgICAgICBsZXQgb3B0czpJT3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgZGlzcGxheUFzOiBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVEaXNwbGF5QXMob3B0aW9uc1snZGlzcGxheUFzJ10sIGRlZmF1bHRzLmRpc3BsYXlBcyksXHJcbiAgICAgICAgICAgIG1pbkRhdGU6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZU1pbkRhdGUob3B0aW9uc1snbWluRGF0ZSddLCBkZWZhdWx0cy5taW5EYXRlKSxcclxuICAgICAgICAgICAgbWF4RGF0ZTogT3B0aW9uU2FuaXRpemVyLnNhbml0aXplTWF4RGF0ZShvcHRpb25zWydtYXhEYXRlJ10sIGRlZmF1bHRzLm1heERhdGUpLFxyXG4gICAgICAgICAgICBkZWZhdWx0RGF0ZTogT3B0aW9uU2FuaXRpemVyLnNhbml0aXplRGVmYXVsdERhdGUob3B0aW9uc1snZGVmYXVsdERhdGUnXSwgZGVmYXVsdHMuZGVmYXVsdERhdGUpLFxyXG4gICAgICAgICAgICB0aGVtZTogT3B0aW9uU2FuaXRpemVyLnNhbml0aXplVGhlbWUob3B0aW9uc1sndGhlbWUnXSwgZGVmYXVsdHMudGhlbWUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiBvcHRzO1xyXG4gICAgfVxyXG59IiwiY2xhc3MgQ29tbW9uIHtcclxuICAgIHByb3RlY3RlZCBnZXRNb250aHMoKSB7XHJcbiAgICAgICAgcmV0dXJuIFtcIkphbnVhcnlcIiwgXCJGZWJydWFyeVwiLCBcIk1hcmNoXCIsIFwiQXByaWxcIiwgXCJNYXlcIiwgXCJKdW5lXCIsIFwiSnVseVwiLCBcIkF1Z3VzdFwiLCBcIlNlcHRlbWJlclwiLCBcIk9jdG9iZXJcIiwgXCJOb3ZlbWJlclwiLCBcIkRlY2VtYmVyXCJdO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgZ2V0U2hvcnRNb250aHMoKSB7XHJcbiAgICAgICAgcmV0dXJuIFtcIkphblwiLCBcIkZlYlwiLCBcIk1hclwiLCBcIkFwclwiLCBcIk1heVwiLCBcIkp1blwiLCBcIkp1bFwiLCBcIkF1Z1wiLCBcIlNlcFwiLCBcIk9jdFwiLCBcIk5vdlwiLCBcIkRlY1wiXTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGdldERheXMoKSB7XHJcbiAgICAgICAgcmV0dXJuIFtcIlN1bmRheVwiLCBcIk1vbmRheVwiLCBcIlR1ZXNkYXlcIiwgXCJXZWRuZXNkYXlcIiwgXCJUaHVyc2RheVwiLCBcIkZyaWRheVwiLCBcIlNhdHVyZGF5XCJdO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgZ2V0U2hvcnREYXlzKCkge1xyXG4gICAgICAgIHJldHVybiBbXCJTdW5cIiwgXCJNb25cIiwgXCJUdWVcIiwgXCJXZWRcIiwgXCJUaHVcIiwgXCJGcmlcIiwgXCJTYXRcIl07XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBnZXRIb3VycyhkYXRlOkRhdGUpOnN0cmluZyB7XHJcbiAgICAgICAgbGV0IG51bSA9IGRhdGUuZ2V0SG91cnMoKTtcclxuICAgICAgICBpZiAobnVtID09PSAwKSBudW0gPSAxMjtcclxuICAgICAgICBpZiAobnVtID4gMTIpIG51bSAtPSAxMjtcclxuICAgICAgICByZXR1cm4gbnVtLnRvU3RyaW5nKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBnZXREZWNhZGUoZGF0ZTpEYXRlKTpzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiBgJHtNYXRoLmZsb29yKGRhdGUuZ2V0RnVsbFllYXIoKS8xMCkqMTB9IC0gJHtNYXRoLmNlaWwoKGRhdGUuZ2V0RnVsbFllYXIoKSArIDEpLzEwKSoxMH1gO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgZ2V0TWVyaWRpZW0oZGF0ZTpEYXRlKTpzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiBkYXRlLmdldEhvdXJzKCkgPCAxMiA/ICdhbScgOiAncG0nO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgcGFkKG51bTpudW1iZXJ8c3RyaW5nLCBzaXplOm51bWJlciA9IDIpIHtcclxuICAgICAgICBsZXQgc3RyID0gbnVtLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgd2hpbGUoc3RyLmxlbmd0aCA8IHNpemUpIHN0ciA9ICcwJyArIHN0cjtcclxuICAgICAgICByZXR1cm4gc3RyO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgdHJpbShzdHI6c3RyaW5nKSB7XHJcbiAgICAgICAgd2hpbGUgKHN0clswXSA9PT0gJzAnICYmIHN0ci5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIHN0ciA9IHN0ci5zdWJzdHIoMSwgc3RyLmxlbmd0aCk7ICBcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHN0cjtcclxuICAgIH1cclxufSIsIkN1c3RvbUV2ZW50ID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgZnVuY3Rpb24gdXNlTmF0aXZlICgpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBsZXQgY3VzdG9tRXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoJ2EnLCB7IGRldGFpbDogeyBiOiAnYicgfSB9KTtcclxuICAgICAgICAgICAgcmV0dXJuICAnYScgPT09IGN1c3RvbUV2ZW50LnR5cGUgJiYgJ2InID09PSBjdXN0b21FdmVudC5kZXRhaWwuYjtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgaWYgKHVzZU5hdGl2ZSgpKSB7XHJcbiAgICAgICAgcmV0dXJuIDxhbnk+Q3VzdG9tRXZlbnQ7XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkb2N1bWVudC5jcmVhdGVFdmVudCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIC8vIElFID49IDlcclxuICAgICAgICByZXR1cm4gPGFueT5mdW5jdGlvbih0eXBlOnN0cmluZywgcGFyYW1zOkN1c3RvbUV2ZW50SW5pdCkge1xyXG4gICAgICAgICAgICBsZXQgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdDdXN0b21FdmVudCcpO1xyXG4gICAgICAgICAgICBpZiAocGFyYW1zKSB7XHJcbiAgICAgICAgICAgICAgICBlLmluaXRDdXN0b21FdmVudCh0eXBlLCBwYXJhbXMuYnViYmxlcywgcGFyYW1zLmNhbmNlbGFibGUsIHBhcmFtcy5kZXRhaWwpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZS5pbml0Q3VzdG9tRXZlbnQodHlwZSwgZmFsc2UsIGZhbHNlLCB2b2lkIDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBlO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gSUUgPj0gOFxyXG4gICAgICAgIHJldHVybiA8YW55PmZ1bmN0aW9uKHR5cGU6c3RyaW5nLCBwYXJhbXM6Q3VzdG9tRXZlbnRJbml0KSB7XHJcbiAgICAgICAgICAgIGxldCBlID0gKDxhbnk+ZG9jdW1lbnQpLmNyZWF0ZUV2ZW50T2JqZWN0KCk7XHJcbiAgICAgICAgICAgIGUudHlwZSA9IHR5cGU7XHJcbiAgICAgICAgICAgIGlmIChwYXJhbXMpIHtcclxuICAgICAgICAgICAgICAgIGUuYnViYmxlcyA9IEJvb2xlYW4ocGFyYW1zLmJ1YmJsZXMpO1xyXG4gICAgICAgICAgICAgICAgZS5jYW5jZWxhYmxlID0gQm9vbGVhbihwYXJhbXMuY2FuY2VsYWJsZSk7XHJcbiAgICAgICAgICAgICAgICBlLmRldGFpbCA9IHBhcmFtcy5kZXRhaWw7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBlLmJ1YmJsZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGUuY2FuY2VsYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgZS5kZXRhaWwgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGU7XHJcbiAgICAgICAgfSBcclxuICAgIH0gIFxyXG59KSgpO1xyXG4iLCJpbnRlcmZhY2UgSUxpc3RlbmVyUmVmZXJlbmNlIHtcclxuICAgIGVsZW1lbnQ6IEVsZW1lbnR8RG9jdW1lbnR8V2luZG93O1xyXG4gICAgcmVmZXJlbmNlOiBFdmVudExpc3RlbmVyO1xyXG4gICAgZXZlbnQ6IHN0cmluZztcclxufVxyXG5cclxubmFtZXNwYWNlIGxpc3RlbiB7XHJcbiAgICBsZXQgbWF0Y2hlcyA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5tYXRjaGVzIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5tc01hdGNoZXNTZWxlY3RvcjtcclxuICAgIFxyXG4gICAgZnVuY3Rpb24gaGFuZGxlRGVsZWdhdGVFdmVudChwYXJlbnQ6RWxlbWVudCwgZGVsZWdhdGVTZWxlY3RvcjpzdHJpbmcsIGNhbGxiYWNrOihlPzpNb3VzZUV2ZW50fFRvdWNoRXZlbnQpID0+IHZvaWQpIHtcclxuICAgICAgICByZXR1cm4gKGU6TW91c2VFdmVudHxUb3VjaEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSBlLnNyY0VsZW1lbnQgfHwgPEVsZW1lbnQ+ZS50YXJnZXQ7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB3aGlsZSghdGFyZ2V0LmlzRXF1YWxOb2RlKHBhcmVudCkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChtYXRjaGVzLmNhbGwodGFyZ2V0LCBkZWxlZ2F0ZVNlbGVjdG9yKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnRFbGVtZW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBmdW5jdGlvbiBhdHRhY2hFdmVudHNEZWxlZ2F0ZShldmVudHM6c3RyaW5nW10sIHBhcmVudDpFbGVtZW50LCBkZWxlZ2F0ZVNlbGVjdG9yOnN0cmluZywgY2FsbGJhY2s6KGU/Ok1vdXNlRXZlbnR8VG91Y2hFdmVudCkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xyXG4gICAgICAgIGxldCBsaXN0ZW5lcnM6SUxpc3RlbmVyUmVmZXJlbmNlW10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gZXZlbnRzKSB7XHJcbiAgICAgICAgICAgIGxldCBldmVudDpzdHJpbmcgPSBldmVudHNba2V5XTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBuZXdMaXN0ZW5lciA9IGhhbmRsZURlbGVnYXRlRXZlbnQocGFyZW50LCBkZWxlZ2F0ZVNlbGVjdG9yLCBjYWxsYmFjayk7XHJcbiAgICAgICAgICAgIGxpc3RlbmVycy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IHBhcmVudCxcclxuICAgICAgICAgICAgICAgIHJlZmVyZW5jZTogbmV3TGlzdGVuZXIsXHJcbiAgICAgICAgICAgICAgICBldmVudDogZXZlbnRcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBwYXJlbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgbmV3TGlzdGVuZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbGlzdGVuZXJzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBmdW5jdGlvbiBhdHRhY2hFdmVudHMoZXZlbnRzOnN0cmluZ1tdLCBlbGVtZW50OkVsZW1lbnR8RG9jdW1lbnR8V2luZG93LCBjYWxsYmFjazooZT86YW55KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgbGV0IGxpc3RlbmVyczpJTGlzdGVuZXJSZWZlcmVuY2VbXSA9IFtdO1xyXG4gICAgICAgIGV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICBsaXN0ZW5lcnMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50OiBlbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgcmVmZXJlbmNlOiBjYWxsYmFjayxcclxuICAgICAgICAgICAgICAgIGV2ZW50OiBldmVudFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBjYWxsYmFjayk7IFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBsaXN0ZW5lcnM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIE5BVElWRVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZm9jdXMoZWxlbWVudDpFbGVtZW50fERvY3VtZW50fFdpbmRvdywgY2FsbGJhY2s6KGU/OkZvY3VzRXZlbnQpID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdIHtcclxuICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzKFsnZm9jdXMnXSwgZWxlbWVudCwgKGUpID0+IHtcclxuICAgICAgICAgICAgY2FsbGJhY2soZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiBkb3duKGVsZW1lbnQ6RWxlbWVudHxEb2N1bWVudHxXaW5kb3csIGNhbGxiYWNrOihlPzpNb3VzZUV2ZW50fFRvdWNoRXZlbnQpID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdO1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGRvd24ocGFyZW50OkVsZW1lbnR8RG9jdW1lbnR8V2luZG93LCBkZWxlZ2F0ZVNlbGVjdG9yOnN0cmluZywgY2FsbGJhY2s6KGU/Ok1vdXNlRXZlbnR8VG91Y2hFdmVudCkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW107XHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZG93biguLi5wYXJhbXM6YW55W10pIHtcclxuICAgICAgICBpZiAocGFyYW1zLmxlbmd0aCA9PT0gMykge1xyXG4gICAgICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzRGVsZWdhdGUoWydtb3VzZWRvd24nLCAndG91Y2hzdGFydCddLCBwYXJhbXNbMF0sIHBhcmFtc1sxXSwgKGUpID0+IHtcclxuICAgICAgICAgICAgICAgIHBhcmFtc1syXSg8YW55PmUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzKFsnbW91c2Vkb3duJywgJ3RvdWNoc3RhcnQnXSwgcGFyYW1zWzBdLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcGFyYW1zWzFdKDxhbnk+ZSk7XHJcbiAgICAgICAgICAgIH0pOyAgICAgICAgXHJcbiAgICAgICAgfSBcclxuICAgIH07XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiB1cChlbGVtZW50OkVsZW1lbnR8RG9jdW1lbnR8V2luZG93LCBjYWxsYmFjazooZT86TW91c2VFdmVudCkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xyXG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydtb3VzZXVwJywgJ3RvdWNoZW5kJ10sIGVsZW1lbnQsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gbW91c2Vkb3duKGVsZW1lbnQ6RWxlbWVudHxEb2N1bWVudHxXaW5kb3csIGNhbGxiYWNrOihlPzpNb3VzZUV2ZW50KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ21vdXNlZG93biddLCBlbGVtZW50LCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBjYWxsYmFjayhlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIG1vdXNldXAoZWxlbWVudDpFbGVtZW50fERvY3VtZW50fFdpbmRvdywgY2FsbGJhY2s6KGU/Ok1vdXNlRXZlbnQpID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdIHtcclxuICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzKFsnbW91c2V1cCddLCBlbGVtZW50LCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBjYWxsYmFjayhlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHBhc3RlKGVsZW1lbnQ6RWxlbWVudHxEb2N1bWVudHxXaW5kb3csIGNhbGxiYWNrOihlPzpNb3VzZUV2ZW50KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ3Bhc3RlJ10sIGVsZW1lbnQsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gdGFwKGVsZW1lbnQ6RWxlbWVudHxEb2N1bWVudCwgY2FsbGJhY2s6KGU/OkV2ZW50KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXTtcclxuICAgIGV4cG9ydCBmdW5jdGlvbiB0YXAocGFyZW50OkVsZW1lbnR8RG9jdW1lbnQsIGRlbGVnYXRlQ2xhc3M6c3RyaW5nLCBjYWxsYmFjazooZT86RXZlbnQpID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdO1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHRhcCguLi5wYXJhbXM6YW55W10pOklMaXN0ZW5lclJlZmVyZW5jZVtdIHtcclxuICAgICAgICBsZXQgc3RhcnRUb3VjaFg6bnVtYmVyLCBzdGFydFRvdWNoWTpudW1iZXI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGhhbmRsZVN0YXJ0ID0gKGU6VG91Y2hFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBzdGFydFRvdWNoWCA9IGUudG91Y2hlc1swXS5jbGllbnRYO1xyXG4gICAgICAgICAgICBzdGFydFRvdWNoWSA9IGUudG91Y2hlc1swXS5jbGllbnRZO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBsZXQgaGFuZGxlRW5kID0gKGU6VG91Y2hFdmVudCwgY2FsbGJhY2s6KGU/OkV2ZW50KSA9PiB2b2lkKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlLmNoYW5nZWRUb3VjaGVzID09PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgeERpZmYgPSBlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFggLSBzdGFydFRvdWNoWDtcclxuICAgICAgICAgICAgbGV0IHlEaWZmID0gZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRZIC0gc3RhcnRUb3VjaFk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoTWF0aC5zcXJ0KHhEaWZmICogeERpZmYgKyB5RGlmZiAqIHlEaWZmKSA8IDEwKSB7XHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBsZXQgbGlzdGVuZXJzOklMaXN0ZW5lclJlZmVyZW5jZVtdID0gW107XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHBhcmFtcy5sZW5ndGggPT09IDMpIHtcclxuICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChhdHRhY2hFdmVudHNEZWxlZ2F0ZShbJ3RvdWNoc3RhcnQnXSwgcGFyYW1zWzBdLCBwYXJhbXNbMV0sIGhhbmRsZVN0YXJ0KSk7XHJcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IGxpc3RlbmVycy5jb25jYXQoYXR0YWNoRXZlbnRzRGVsZWdhdGUoWyd0b3VjaGVuZCcsICdjbGljayddLCBwYXJhbXNbMF0sIHBhcmFtc1sxXSwgKGU6VG91Y2hFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlRW5kKGUsIHBhcmFtc1syXSk7XHJcbiAgICAgICAgICAgIH0pKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHBhcmFtcy5sZW5ndGggPT09IDIpIHtcclxuICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChhdHRhY2hFdmVudHMoWyd0b3VjaHN0YXJ0J10sIHBhcmFtc1swXSwgaGFuZGxlU3RhcnQpKTtcclxuICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChhdHRhY2hFdmVudHMoWyd0b3VjaGVuZCcsICdjbGljayddLCBwYXJhbXNbMF0sIChlOlRvdWNoRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZUVuZChlLCBwYXJhbXNbMV0pO1xyXG4gICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBsaXN0ZW5lcnM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIENVU1RPTVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZ290byhlbGVtZW50OkVsZW1lbnQsIGNhbGxiYWNrOihlPzp7ZGF0ZTpEYXRlLCBsZXZlbDpMZXZlbCwgdXBkYXRlPzpib29sZWFufSkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xyXG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydkYXRpdW0tZ290byddLCBlbGVtZW50LCAoZTpDdXN0b21FdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBjYWxsYmFjayhlLmRldGFpbCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiB2aWV3Y2hhbmdlZChlbGVtZW50OkVsZW1lbnQsIGNhbGxiYWNrOihlPzp7ZGF0ZTpEYXRlLCBsZXZlbDpMZXZlbCwgdXBkYXRlPzpib29sZWFufSkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xyXG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydkYXRpdW0tdmlld2NoYW5nZWQnXSwgZWxlbWVudCwgKGU6Q3VzdG9tRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgY2FsbGJhY2soZS5kZXRhaWwpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXJzKGxpc3RlbmVyczpJTGlzdGVuZXJSZWZlcmVuY2VbXSkge1xyXG4gICAgICAgIGxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xyXG4gICAgICAgICAgIGxpc3RlbmVyLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihsaXN0ZW5lci5ldmVudCwgbGlzdGVuZXIucmVmZXJlbmNlKTsgXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbm5hbWVzcGFjZSB0cmlnZ2VyIHtcclxuICAgIGV4cG9ydCBmdW5jdGlvbiBnb3RvKGVsZW1lbnQ6RWxlbWVudCwgZGF0YT86e2RhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWwsIHVwZGF0ZT86Ym9vbGVhbn0pIHtcclxuICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdkYXRpdW0tZ290bycsIHtcclxuICAgICAgICAgICAgYnViYmxlczogZmFsc2UsXHJcbiAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXHJcbiAgICAgICAgICAgIGRldGFpbDogZGF0YVxyXG4gICAgICAgIH0pKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHZpZXdjaGFuZ2VkKGVsZW1lbnQ6RWxlbWVudCwgZGF0YT86e2RhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWwsIHVwZGF0ZT86Ym9vbGVhbn0pIHtcclxuICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdkYXRpdW0tdmlld2NoYW5nZWQnLCB7XHJcbiAgICAgICAgICAgIGJ1YmJsZXM6IGZhbHNlLFxyXG4gICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICBkZXRhaWw6IGRhdGFcclxuICAgICAgICB9KSk7XHJcbiAgICB9XHJcbn0iLCJpbnRlcmZhY2UgSURhdGVQYXJ0IHtcclxuICAgIGluY3JlbWVudCgpOnZvaWQ7XHJcbiAgICBkZWNyZW1lbnQoKTp2b2lkO1xyXG4gICAgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZyk6Ym9vbGVhbjtcclxuICAgIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKTpib29sZWFuO1xyXG4gICAgZ2V0VmFsdWUoKTpEYXRlO1xyXG4gICAgZ2V0UmVnRXgoKTpSZWdFeHA7XHJcbiAgICBzZXRTZWxlY3RhYmxlKHNlbGVjdGFibGU6Ym9vbGVhbik6SURhdGVQYXJ0O1xyXG4gICAgZ2V0TWF4QnVmZmVyKCk6bnVtYmVyO1xyXG4gICAgZ2V0TGV2ZWwoKTpMZXZlbDtcclxuICAgIGlzU2VsZWN0YWJsZSgpOmJvb2xlYW47XHJcbiAgICB0b1N0cmluZygpOnN0cmluZztcclxufVxyXG5cclxuY2xhc3MgUGxhaW5UZXh0IGltcGxlbWVudHMgSURhdGVQYXJ0IHtcclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgdGV4dDpzdHJpbmcpIHt9XHJcbiAgICBwdWJsaWMgaW5jcmVtZW50KCkge31cclxuICAgIHB1YmxpYyBkZWNyZW1lbnQoKSB7fVxyXG4gICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwoKSB7IHJldHVybiBmYWxzZSB9XHJcbiAgICBwdWJsaWMgc2V0VmFsdWUoKSB7IHJldHVybiBmYWxzZSB9XHJcbiAgICBwdWJsaWMgZ2V0VmFsdWUoKTpEYXRlIHsgcmV0dXJuIG51bGwgfVxyXG4gICAgcHVibGljIGdldFJlZ0V4KCk6UmVnRXhwIHsgcmV0dXJuIG5ldyBSZWdFeHAoYFske3RoaXMudGV4dH1dYCk7IH1cclxuICAgIHB1YmxpYyBzZXRTZWxlY3RhYmxlKHNlbGVjdGFibGU6Ym9vbGVhbik6SURhdGVQYXJ0IHsgcmV0dXJuIHRoaXMgfVxyXG4gICAgcHVibGljIGdldE1heEJ1ZmZlcigpOm51bWJlciB7IHJldHVybiAwIH1cclxuICAgIHB1YmxpYyBnZXRMZXZlbCgpOkxldmVsIHsgcmV0dXJuIExldmVsLk5PTkUgfVxyXG4gICAgcHVibGljIGlzU2VsZWN0YWJsZSgpOmJvb2xlYW4geyByZXR1cm4gZmFsc2UgfVxyXG4gICAgcHVibGljIHRvU3RyaW5nKCk6c3RyaW5nIHsgcmV0dXJuIHRoaXMudGV4dCB9XHJcbn1cclxuICAgIFxyXG5sZXQgZm9ybWF0QmxvY2tzID0gKGZ1bmN0aW9uKCkgeyAgICBcclxuICAgIGNsYXNzIERhdGVQYXJ0IGV4dGVuZHMgQ29tbW9uIHtcclxuICAgICAgICBwcm90ZWN0ZWQgZGF0ZTpEYXRlO1xyXG4gICAgICAgIHByb3RlY3RlZCBzZWxlY3RhYmxlOmJvb2xlYW4gPSB0cnVlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRWYWx1ZSgpOkRhdGUge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRTZWxlY3RhYmxlKHNlbGVjdGFibGU6Ym9vbGVhbikge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGFibGUgPSBzZWxlY3RhYmxlO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGlzU2VsZWN0YWJsZSgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0YWJsZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIEZvdXJEaWdpdFllYXIgZXh0ZW5kcyBEYXRlUGFydCB7XHJcbiAgICAgICAgcHVibGljIGluY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgdGhpcy5kYXRlLnNldEZ1bGxZZWFyKHRoaXMuZGF0ZS5nZXRGdWxsWWVhcigpICsgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBkZWNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRGdWxsWWVhcih0aGlzLmRhdGUuZ2V0RnVsbFllYXIoKSAtIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZShwYXJ0aWFsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRGdWxsWWVhcihwYXJzZUludCh2YWx1ZSwgMTApKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL14tP1xcZHsxLDR9JC87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiA0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBMZXZlbC5ZRUFSO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0RnVsbFllYXIoKS50b1N0cmluZygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgVHdvRGlnaXRZZWFyIGV4dGVuZHMgRm91ckRpZ2l0WWVhciB7XHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYmFzZSA9IE1hdGguZmxvb3Ioc3VwZXIuZ2V0VmFsdWUoKS5nZXRGdWxsWWVhcigpLzEwMCkqMTAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldEZ1bGxZZWFyKHBhcnNlSW50KDxzdHJpbmc+dmFsdWUsIDEwKSArIGJhc2UpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXi0/XFxkezEsMn0kLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3VwZXIudG9TdHJpbmcoKS5zbGljZSgtMik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBMb25nTW9udGhOYW1lIGV4dGVuZHMgRGF0ZVBhcnQge1xyXG4gICAgICAgIHByb3RlY3RlZCBnZXRNb250aHMoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzdXBlci5nZXRNb250aHMoKTtcclxuICAgICAgICB9IFxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBpbmNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0TW9udGgoKSArIDE7XHJcbiAgICAgICAgICAgIGlmIChudW0gPiAxMSkgbnVtID0gMDtcclxuICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1vbnRoKG51bSk7XHJcbiAgICAgICAgICAgIHdoaWxlICh0aGlzLmRhdGUuZ2V0TW9udGgoKSA+IG51bSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldERhdGUodGhpcy5kYXRlLmdldERhdGUoKSAtIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBkZWNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0TW9udGgoKSAtIDE7XHJcbiAgICAgICAgICAgIGlmIChudW0gPCAwKSBudW0gPSAxMTtcclxuICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1vbnRoKG51bSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGxldCBtb250aCA9IHRoaXMuZ2V0TW9udGhzKCkuZmlsdGVyKChtb250aCkgPT4ge1xyXG4gICAgICAgICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cChgXiR7cGFydGlhbH0uKiRgLCAnaScpLnRlc3QobW9udGgpOyBcclxuICAgICAgICAgICAgfSlbMF07XHJcbiAgICAgICAgICAgIGlmIChtb250aCAhPT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZShtb250aCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKHZhbHVlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHRoaXMuZ2V0UmVnRXgoKS50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZ2V0TW9udGhzKCkuaW5kZXhPZih2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0TW9udGgobnVtKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cChgXigoJHt0aGlzLmdldE1vbnRocygpLmpvaW4oXCIpfChcIil9KSkkYCwgJ2knKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFsyLDEsMywyLDMsMywzLDIsMSwxLDEsMV1bdGhpcy5kYXRlLmdldE1vbnRoKCldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBMZXZlbC5NT05USDtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRNb250aHMoKVt0aGlzLmRhdGUuZ2V0TW9udGgoKV07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBTaG9ydE1vbnRoTmFtZSBleHRlbmRzIExvbmdNb250aE5hbWUge1xyXG4gICAgICAgIHByb3RlY3RlZCBnZXRNb250aHMoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzdXBlci5nZXRTaG9ydE1vbnRocygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgTW9udGggZXh0ZW5kcyBMb25nTW9udGhOYW1lIHtcclxuICAgICAgICBwdWJsaWMgZ2V0TWF4QnVmZmVyKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldE1vbnRoKCkgPiAwID8gMSA6IDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICgvXlxcZHsxLDJ9JC8udGVzdChwYXJ0aWFsKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHRyaW1tZWQgPSB0aGlzLnRyaW0ocGFydGlhbCA9PT0gJzAnID8gJzEnIDogcGFydGlhbCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0cmltbWVkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0TW9udGgocGFyc2VJbnQodmFsdWUsIDEwKSAtIDEpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXihbMS05XXwoMVswLTJdKSkkLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gKHRoaXMuZGF0ZS5nZXRNb250aCgpICsgMSkudG9TdHJpbmcoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIFBhZGRlZE1vbnRoIGV4dGVuZHMgTW9udGgge1xyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICgvXlxcZHsxLDJ9JC8udGVzdChwYXJ0aWFsKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhZGRlZCA9IHRoaXMucGFkKHBhcnRpYWwgPT09ICcwJyA/ICcxJyA6IHBhcnRpYWwpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUocGFkZGVkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eKCgwWzEtOV0pfCgxWzAtMl0pKSQvOyAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhZChzdXBlci50b1N0cmluZygpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIERhdGVOdW1lcmFsIGV4dGVuZHMgRGF0ZVBhcnQge1xyXG4gICAgICAgIHByb3RlY3RlZCBkYXlzSW5Nb250aCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHRoaXMuZGF0ZS5nZXRGdWxsWWVhcigpLCB0aGlzLmRhdGUuZ2V0TW9udGgoKSArIDEsIDApLmdldERhdGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGluY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXREYXRlKCkgKyAxO1xyXG4gICAgICAgICAgICBpZiAobnVtID4gdGhpcy5kYXlzSW5Nb250aCgpKSBudW0gPSAxO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0RGF0ZShudW0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZGVjcmVtZW50KCkge1xyXG4gICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldERhdGUoKSAtIDE7XHJcbiAgICAgICAgICAgIGlmIChudW0gPCAxKSBudW0gPSB0aGlzLmRheXNJbk1vbnRoKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXREYXRlKG51bSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICgvXlxcZHsxLDJ9JC8udGVzdChwYXJ0aWFsKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHRyaW1tZWQgPSB0aGlzLnRyaW0ocGFydGlhbCA9PT0gJzAnID8gJzEnIDogcGFydGlhbCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0cmltbWVkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpICYmIHBhcnNlSW50KHZhbHVlLCAxMCkgPCB0aGlzLmRheXNJbk1vbnRoKCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXREYXRlKHBhcnNlSW50KHZhbHVlLCAxMCkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXlsxLTldfCgoMXwyKVswLTldKXwoM1swLTFdKSQvO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TWF4QnVmZmVyKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldERhdGUoKSA+IE1hdGguZmxvb3IodGhpcy5kYXlzSW5Nb250aCgpLzEwKSA/IDEgOiAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBMZXZlbC5EQVRFO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0RGF0ZSgpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBQYWRkZWREYXRlIGV4dGVuZHMgRGF0ZU51bWVyYWwge1xyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICgvXlxcZHsxLDJ9JC8udGVzdChwYXJ0aWFsKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhZGRlZCA9IHRoaXMucGFkKHBhcnRpYWwgPT09ICcwJyA/ICcxJyA6IHBhcnRpYWwpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUocGFkZGVkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eKDBbMS05XSl8KCgxfDIpWzAtOV0pfCgzWzAtMV0pJC87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFkKHRoaXMuZGF0ZS5nZXREYXRlKCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgRGF0ZU9yZGluYWwgZXh0ZW5kcyBEYXRlTnVtZXJhbCB7XHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL14oWzEtOV18KCgxfDIpWzAtOV0pfCgzWzAtMV0pKSgoc3QpfChuZCl8KHJkKXwodGgpKT8kL2k7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgbGV0IGRhdGUgPSB0aGlzLmRhdGUuZ2V0RGF0ZSgpO1xyXG4gICAgICAgICAgICBsZXQgaiA9IGRhdGUgJSAxMDtcclxuICAgICAgICAgICAgbGV0IGsgPSBkYXRlICUgMTAwO1xyXG4gICAgICAgICAgICBpZiAoaiA9PT0gMSAmJiBrICE9PSAxMSkgcmV0dXJuIGRhdGUgKyBcInN0XCI7XHJcbiAgICAgICAgICAgIGlmIChqID09PSAyICYmIGsgIT09IDEyKSByZXR1cm4gZGF0ZSArIFwibmRcIjtcclxuICAgICAgICAgICAgaWYgKGogPT09IDMgJiYgayAhPT0gMTMpIHJldHVybiBkYXRlICsgXCJyZFwiO1xyXG4gICAgICAgICAgICByZXR1cm4gZGF0ZSArIFwidGhcIjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIExvbmdEYXlOYW1lIGV4dGVuZHMgRGF0ZVBhcnQge1xyXG4gICAgICAgIHByb3RlY3RlZCBnZXREYXlzKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3VwZXIuZ2V0RGF5cygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgaW5jcmVtZW50KCkge1xyXG4gICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldERheSgpICsgMTtcclxuICAgICAgICAgICAgaWYgKG51bSA+IDYpIG51bSA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXREYXRlKHRoaXMuZGF0ZS5nZXREYXRlKCkgLSB0aGlzLmRhdGUuZ2V0RGF5KCkgKyBudW0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZGVjcmVtZW50KCkge1xyXG4gICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldERheSgpIC0gMTtcclxuICAgICAgICAgICAgaWYgKG51bSA8IDApIG51bSA9IDY7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXREYXRlKHRoaXMuZGF0ZS5nZXREYXRlKCkgLSB0aGlzLmRhdGUuZ2V0RGF5KCkgKyBudW0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICBsZXQgZGF5ID0gdGhpcy5nZXREYXlzKCkuZmlsdGVyKChkYXkpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUmVnRXhwKGBeJHtwYXJ0aWFsfS4qJGAsICdpJykudGVzdChkYXkpO1xyXG4gICAgICAgICAgICB9KVswXTtcclxuICAgICAgICAgICAgaWYgKGRheSAhPT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZShkYXkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmdldERheXMoKS5pbmRleE9mKHZhbHVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXREYXRlKHRoaXMuZGF0ZS5nZXREYXRlKCkgLSB0aGlzLmRhdGUuZ2V0RGF5KCkgKyBudW0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUmVnRXhwKGBeKCgke3RoaXMuZ2V0RGF5cygpLmpvaW4oXCIpfChcIil9KSkkYCwgJ2knKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFsyLDEsMiwxLDIsMSwyXVt0aGlzLmRhdGUuZ2V0RGF5KCldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBMZXZlbC5EQVRFO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldERheXMoKVt0aGlzLmRhdGUuZ2V0RGF5KCldO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgU2hvcnREYXlOYW1lIGV4dGVuZHMgTG9uZ0RheU5hbWUge1xyXG4gICAgICAgIHByb3RlY3RlZCBnZXREYXlzKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3VwZXIuZ2V0U2hvcnREYXlzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBQYWRkZWRNaWxpdGFyeUhvdXIgZXh0ZW5kcyBEYXRlUGFydCB7XHJcbiAgICAgICAgcHVibGljIGluY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRIb3VycygpICsgMTtcclxuICAgICAgICAgICAgaWYgKG51bSA+IDIzKSBudW0gPSAwO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnMobnVtKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGRlY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRIb3VycygpIC0gMTtcclxuICAgICAgICAgICAgaWYgKG51bSA8IDApIG51bSA9IDIzO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnMobnVtKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKC9eXFxkezEsMn0kLy50ZXN0KHBhcnRpYWwpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGFkZGVkID0gdGhpcy5wYWQocGFydGlhbCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZShwYWRkZWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3VycyhwYXJzZUludCh2YWx1ZSwgMTApKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXRIb3VycygpID4gMiA/IDEgOiAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBMZXZlbC5IT1VSO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXigoKDB8MSlbMC05XSl8KDJbMC0zXSkpJC87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFkKHRoaXMuZGF0ZS5nZXRIb3VycygpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIE1pbGl0YXJ5SG91ciBleHRlbmRzIFBhZGRlZE1pbGl0YXJ5SG91ciB7XHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKC9eXFxkezEsMn0kLy50ZXN0KHBhcnRpYWwpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdHJpbW1lZCA9IHRoaXMudHJpbShwYXJ0aWFsKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHRyaW1tZWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL14oKDE/WzAtOV0pfCgyWzAtM10pKSQvO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0SG91cnMoKS50b1N0cmluZygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgUGFkZGVkSG91ciBleHRlbmRzIFBhZGRlZE1pbGl0YXJ5SG91ciB7XHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgbGV0IHBhZGRlZCA9IHRoaXMucGFkKHBhcnRpYWwgPT09ICcwJyA/ICcxJyA6IHBhcnRpYWwpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZShwYWRkZWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKHZhbHVlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHRoaXMuZ2V0UmVnRXgoKS50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IG51bSA9IHBhcnNlSW50KHZhbHVlLCAxMCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kYXRlLmdldEhvdXJzKCkgPCAxMiAmJiBudW0gPT09IDEyKSBudW0gPSAwO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZGF0ZS5nZXRIb3VycygpID4gMTEgJiYgbnVtICE9PSAxMikgbnVtICs9IDEyO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldEhvdXJzKG51bSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eKDBbMS05XSl8KDFbMC0yXSkkLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlSW50KHRoaXMudG9TdHJpbmcoKSwgMTApID4gMSA/IDEgOiAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhZCh0aGlzLmdldEhvdXJzKHRoaXMuZGF0ZSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgSG91ciBleHRlbmRzIFBhZGRlZEhvdXIge1xyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGxldCB0cmltbWVkID0gdGhpcy50cmltKHBhcnRpYWwgPT09ICcwJyA/ICcxJyA6IHBhcnRpYWwpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0cmltbWVkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL15bMS05XXwoMVswLTJdKSQvO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRyaW0oc3VwZXIudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBQYWRkZWRNaW51dGUgZXh0ZW5kcyBEYXRlUGFydCB7XHJcbiAgICAgICAgcHVibGljIGluY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRNaW51dGVzKCkgKyAxO1xyXG4gICAgICAgICAgICBpZiAobnVtID4gNTkpIG51bSA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRNaW51dGVzKG51bSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBkZWNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0TWludXRlcygpIC0gMTtcclxuICAgICAgICAgICAgaWYgKG51bSA8IDApIG51bSA9IDU5O1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0TWludXRlcyhudW0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0aGlzLnBhZChwYXJ0aWFsKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0TWludXRlcyhwYXJzZUludCh2YWx1ZSwgMTApKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL15bMC01XVswLTldJC87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0TWludXRlcygpID4gNSA/IDEgOiAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBMZXZlbC5NSU5VVEU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFkKHRoaXMuZGF0ZS5nZXRNaW51dGVzKCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgTWludXRlIGV4dGVuZHMgUGFkZGVkTWludXRlIHtcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0aGlzLnRyaW0ocGFydGlhbCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXlswLTVdP1swLTldJC87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXRNaW51dGVzKCkudG9TdHJpbmcoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIFBhZGRlZFNlY29uZCBleHRlbmRzIERhdGVQYXJ0IHtcclxuICAgICAgICBwdWJsaWMgaW5jcmVtZW50KCkge1xyXG4gICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldFNlY29uZHMoKSArIDE7XHJcbiAgICAgICAgICAgIGlmIChudW0gPiA1OSkgbnVtID0gMDtcclxuICAgICAgICAgICAgdGhpcy5kYXRlLnNldFNlY29uZHMobnVtKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGRlY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRTZWNvbmRzKCkgLSAxO1xyXG4gICAgICAgICAgICBpZiAobnVtIDwgMCkgbnVtID0gNTk7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRTZWNvbmRzKG51bSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHRoaXMucGFkKHBhcnRpYWwpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRTZWNvbmRzKHBhcnNlSW50KHZhbHVlLCAxMCkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXlswLTVdWzAtOV0kLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXRTZWNvbmRzKCkgPiA1ID8gMSA6IDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIExldmVsLlNFQ09ORDtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYWQodGhpcy5kYXRlLmdldFNlY29uZHMoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBTZWNvbmQgZXh0ZW5kcyBQYWRkZWRTZWNvbmQge1xyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHRoaXMudHJpbShwYXJ0aWFsKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eWzAtNV0/WzAtOV0kLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldFNlY29uZHMoKS50b1N0cmluZygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgVXBwZXJjYXNlTWVyaWRpZW0gZXh0ZW5kcyBEYXRlUGFydCB7XHJcbiAgICAgICAgcHVibGljIGluY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRIb3VycygpICsgMTI7XHJcbiAgICAgICAgICAgIGlmIChudW0gPiAyMykgbnVtIC09IDI0O1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnMobnVtKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGRlY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRIb3VycygpIC0gMTI7XHJcbiAgICAgICAgICAgIGlmIChudW0gPCAwKSBudW0gKz0gMjQ7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3VycyhudW0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAoL14oKEFNPyl8KFBNPykpJC9pLnRlc3QocGFydGlhbCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHBhcnRpYWxbMF0gPT09ICdBJyA/ICdBTScgOiAnUE0nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUudG9Mb3dlckNhc2UoKSA9PT0gJ2FtJyAmJiB0aGlzLmRhdGUuZ2V0SG91cnMoKSA+IDExKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldEhvdXJzKHRoaXMuZGF0ZS5nZXRIb3VycygpIC0gMTIpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZS50b0xvd2VyQ2FzZSgpID09PSAncG0nICYmIHRoaXMuZGF0ZS5nZXRIb3VycygpIDwgMTIpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnModGhpcy5kYXRlLmdldEhvdXJzKCkgKyAxMik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIExldmVsLkhPVVI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXigoYW0pfChwbSkpJC9pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE1lcmlkaWVtKHRoaXMuZGF0ZSkudG9VcHBlckNhc2UoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIExvd2VyY2FzZU1lcmlkaWVtIGV4dGVuZHMgVXBwZXJjYXNlTWVyaWRpZW0ge1xyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0TWVyaWRpZW0odGhpcy5kYXRlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxldCBmb3JtYXRCbG9ja3M6eyBba2V5OnN0cmluZ106IG5ldyAoKSA9PiBJRGF0ZVBhcnQ7IH0gPSB7fTtcclxuICAgIFxyXG4gICAgZm9ybWF0QmxvY2tzWydZWVlZJ10gPSBGb3VyRGlnaXRZZWFyO1xyXG4gICAgZm9ybWF0QmxvY2tzWydZWSddID0gVHdvRGlnaXRZZWFyO1xyXG4gICAgZm9ybWF0QmxvY2tzWydNTU1NJ10gPSBMb25nTW9udGhOYW1lO1xyXG4gICAgZm9ybWF0QmxvY2tzWydNTU0nXSA9IFNob3J0TW9udGhOYW1lO1xyXG4gICAgZm9ybWF0QmxvY2tzWydNTSddID0gUGFkZGVkTW9udGg7XHJcbiAgICBmb3JtYXRCbG9ja3NbJ00nXSA9IE1vbnRoO1xyXG4gICAgZm9ybWF0QmxvY2tzWydERCddID0gUGFkZGVkRGF0ZTtcclxuICAgIGZvcm1hdEJsb2Nrc1snRG8nXSA9IERhdGVPcmRpbmFsO1xyXG4gICAgZm9ybWF0QmxvY2tzWydEJ10gPSBEYXRlTnVtZXJhbDtcclxuICAgIGZvcm1hdEJsb2Nrc1snZGRkZCddID0gTG9uZ0RheU5hbWU7XHJcbiAgICBmb3JtYXRCbG9ja3NbJ2RkZCddID0gU2hvcnREYXlOYW1lO1xyXG4gICAgZm9ybWF0QmxvY2tzWydISCddID0gUGFkZGVkTWlsaXRhcnlIb3VyO1xyXG4gICAgZm9ybWF0QmxvY2tzWydoaCddID0gUGFkZGVkSG91cjtcclxuICAgIGZvcm1hdEJsb2Nrc1snSCddID0gTWlsaXRhcnlIb3VyO1xyXG4gICAgZm9ybWF0QmxvY2tzWydoJ10gPSBIb3VyO1xyXG4gICAgZm9ybWF0QmxvY2tzWydBJ10gPSBVcHBlcmNhc2VNZXJpZGllbTtcclxuICAgIGZvcm1hdEJsb2Nrc1snYSddID0gTG93ZXJjYXNlTWVyaWRpZW07XHJcbiAgICBmb3JtYXRCbG9ja3NbJ21tJ10gPSBQYWRkZWRNaW51dGU7XHJcbiAgICBmb3JtYXRCbG9ja3NbJ20nXSA9IE1pbnV0ZTtcclxuICAgIGZvcm1hdEJsb2Nrc1snc3MnXSA9IFBhZGRlZFNlY29uZDtcclxuICAgIGZvcm1hdEJsb2Nrc1sncyddID0gU2Vjb25kO1xyXG4gICAgXHJcbiAgICByZXR1cm4gZm9ybWF0QmxvY2tzO1xyXG59KSgpO1xyXG5cclxuXHJcbiIsImNsYXNzIElucHV0IHtcclxuICAgIHByaXZhdGUgb3B0aW9uczogSU9wdGlvbnM7XHJcbiAgICBwcml2YXRlIHNlbGVjdGVkRGF0ZVBhcnQ6IElEYXRlUGFydDtcclxuICAgIHByaXZhdGUgdGV4dEJ1ZmZlcjogc3RyaW5nID0gXCJcIjtcclxuICAgIHB1YmxpYyBkYXRlUGFydHM6IElEYXRlUGFydFtdO1xyXG4gICAgcHVibGljIGZvcm1hdDogUmVnRXhwO1xyXG4gICAgY29uc3RydWN0b3IocHVibGljIGVsZW1lbnQ6IEhUTUxJbnB1dEVsZW1lbnQpIHtcclxuICAgICAgICBuZXcgS2V5Ym9hcmRFdmVudEhhbmRsZXIodGhpcyk7XHJcbiAgICAgICAgbmV3IE1vdXNlRXZlbnRIYW5kbGVyKHRoaXMpO1xyXG4gICAgICAgIG5ldyBQYXN0ZUV2ZW50SGFuZGVyKHRoaXMpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi52aWV3Y2hhbmdlZChlbGVtZW50LCAoZSkgPT4gdGhpcy52aWV3Y2hhbmdlZChlLmRhdGUsIGUubGV2ZWwsIGUudXBkYXRlKSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRMZXZlbHMoKTpMZXZlbFtdIHtcclxuICAgICAgICBsZXQgbGV2ZWxzOkxldmVsW10gPSBbXTtcclxuICAgICAgICB0aGlzLmRhdGVQYXJ0cy5mb3JFYWNoKChkYXRlUGFydCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAobGV2ZWxzLmluZGV4T2YoZGF0ZVBhcnQuZ2V0TGV2ZWwoKSkgPT09IC0xICYmIGRhdGVQYXJ0LmlzU2VsZWN0YWJsZSgpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXZlbHMucHVzaChkYXRlUGFydC5nZXRMZXZlbCgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBsZXZlbHM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRUZXh0QnVmZmVyKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRleHRCdWZmZXI7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBzZXRUZXh0QnVmZmVyKG5ld0J1ZmZlcjpzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLnRleHRCdWZmZXIgPSBuZXdCdWZmZXI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMudGV4dEJ1ZmZlci5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRGF0ZUZyb21CdWZmZXIoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB1cGRhdGVEYXRlRnJvbUJ1ZmZlcigpIHtcclxuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZERhdGVQYXJ0LnNldFZhbHVlRnJvbVBhcnRpYWwodGhpcy50ZXh0QnVmZmVyKSkge1xyXG4gICAgICAgICAgICBsZXQgbmV3RGF0ZSA9IHRoaXMuc2VsZWN0ZWREYXRlUGFydC5nZXRWYWx1ZSgpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKHRoaXMudGV4dEJ1ZmZlci5sZW5ndGggPj0gdGhpcy5zZWxlY3RlZERhdGVQYXJ0LmdldE1heEJ1ZmZlcigpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRleHRCdWZmZXIgPSAnJztcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWREYXRlUGFydCA9IHRoaXMuZ2V0TmV4dFNlbGVjdGFibGVEYXRlUGFydCgpOyAgICBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdHJpZ2dlci5nb3RvKHRoaXMuZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgZGF0ZTogbmV3RGF0ZSxcclxuICAgICAgICAgICAgICAgIGxldmVsOiB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQuZ2V0TGV2ZWwoKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnRleHRCdWZmZXIgPSB0aGlzLnRleHRCdWZmZXIuc2xpY2UoMCwgLTEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldEZpcnN0U2VsZWN0YWJsZURhdGVQYXJ0KCkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5kYXRlUGFydHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZGF0ZVBhcnRzW2ldLmlzU2VsZWN0YWJsZSgpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZVBhcnRzW2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdm9pZCAwO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRMYXN0U2VsZWN0YWJsZURhdGVQYXJ0KCkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSB0aGlzLmRhdGVQYXJ0cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kYXRlUGFydHNbaV0uaXNTZWxlY3RhYmxlKCkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlUGFydHNbaV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2b2lkIDA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXROZXh0U2VsZWN0YWJsZURhdGVQYXJ0KCkge1xyXG4gICAgICAgIGxldCBpID0gdGhpcy5kYXRlUGFydHMuaW5kZXhPZih0aGlzLnNlbGVjdGVkRGF0ZVBhcnQpO1xyXG4gICAgICAgIHdoaWxlICgrK2kgPCB0aGlzLmRhdGVQYXJ0cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZGF0ZVBhcnRzW2ldLmlzU2VsZWN0YWJsZSgpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZVBhcnRzW2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZERhdGVQYXJ0O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0UHJldmlvdXNTZWxlY3RhYmxlRGF0ZVBhcnQoKSB7XHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLmRhdGVQYXJ0cy5pbmRleE9mKHRoaXMuc2VsZWN0ZWREYXRlUGFydCk7XHJcbiAgICAgICAgd2hpbGUgKC0taSA+PSAwKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGVQYXJ0c1tpXS5pc1NlbGVjdGFibGUoKSlcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGVQYXJ0c1tpXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWREYXRlUGFydDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldE5lYXJlc3RTZWxlY3RhYmxlRGF0ZVBhcnQoY2FyZXRQb3NpdGlvbjogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IGRpc3RhbmNlOm51bWJlciA9IE51bWJlci5NQVhfVkFMVUU7XHJcbiAgICAgICAgbGV0IG5lYXJlc3REYXRlUGFydDpJRGF0ZVBhcnQ7XHJcbiAgICAgICAgbGV0IHN0YXJ0ID0gMDtcclxuICAgICAgICBcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZGF0ZVBhcnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRlUGFydCA9IHRoaXMuZGF0ZVBhcnRzW2ldO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKGRhdGVQYXJ0LmlzU2VsZWN0YWJsZSgpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZnJvbUxlZnQgPSBjYXJldFBvc2l0aW9uIC0gc3RhcnQ7XHJcbiAgICAgICAgICAgICAgICBsZXQgZnJvbVJpZ2h0ID0gY2FyZXRQb3NpdGlvbiAtIChzdGFydCArIGRhdGVQYXJ0LnRvU3RyaW5nKCkubGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgaWYgKGZyb21MZWZ0ID4gMCAmJiBmcm9tUmlnaHQgPCAwKSByZXR1cm4gZGF0ZVBhcnQ7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGxldCBkID0gTWF0aC5taW4oTWF0aC5hYnMoZnJvbUxlZnQpLCBNYXRoLmFicyhmcm9tUmlnaHQpKTtcclxuICAgICAgICAgICAgICAgIGlmIChkIDw9IGRpc3RhbmNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmVhcmVzdERhdGVQYXJ0ID0gZGF0ZVBhcnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2UgPSBkO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBzdGFydCArPSBkYXRlUGFydC50b1N0cmluZygpLmxlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIG5lYXJlc3REYXRlUGFydDsgICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgc2V0U2VsZWN0ZWREYXRlUGFydChkYXRlUGFydDpJRGF0ZVBhcnQpIHtcclxuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZERhdGVQYXJ0ICE9PSBkYXRlUGFydCkge1xyXG4gICAgICAgICAgICB0aGlzLnRleHRCdWZmZXIgPSAnJztcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZERhdGVQYXJ0ID0gZGF0ZVBhcnQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0U2VsZWN0ZWREYXRlUGFydCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZERhdGVQYXJ0O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdXBkYXRlT3B0aW9ucyhvcHRpb25zOklPcHRpb25zKSB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmRhdGVQYXJ0cyA9IFBhcnNlci5wYXJzZShvcHRpb25zLmRpc3BsYXlBcyk7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZERhdGVQYXJ0ID0gdm9pZCAwO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBmb3JtYXQ6c3RyaW5nID0gJ14nO1xyXG4gICAgICAgIHRoaXMuZGF0ZVBhcnRzLmZvckVhY2goKGRhdGVQYXJ0KSA9PiB7XHJcbiAgICAgICAgICAgIGZvcm1hdCArPSBgKCR7ZGF0ZVBhcnQuZ2V0UmVnRXgoKS5zb3VyY2Uuc2xpY2UoMSwtMSl9KWA7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5mb3JtYXQgPSBuZXcgUmVnRXhwKGZvcm1hdCsnJCcsICdpJyk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHVwZGF0ZVZpZXcoKSB7XHJcbiAgICAgICAgbGV0IGRhdGVTdHJpbmcgPSAnJztcclxuICAgICAgICB0aGlzLmRhdGVQYXJ0cy5mb3JFYWNoKChkYXRlUGFydCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZGF0ZVBhcnQuZ2V0VmFsdWUoKSA9PT0gdm9pZCAwKSByZXR1cm47XHJcbiAgICAgICAgICAgIGRhdGVTdHJpbmcgKz0gZGF0ZVBhcnQudG9TdHJpbmcoKTsgXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnZhbHVlID0gZGF0ZVN0cmluZztcclxuICAgICAgICBcclxuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZERhdGVQYXJ0ID09PSB2b2lkIDApIHJldHVybjtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgc3RhcnQgPSAwO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBpID0gMDtcclxuICAgICAgICB3aGlsZSAodGhpcy5kYXRlUGFydHNbaV0gIT09IHRoaXMuc2VsZWN0ZWREYXRlUGFydCkge1xyXG4gICAgICAgICAgICBzdGFydCArPSB0aGlzLmRhdGVQYXJ0c1tpKytdLnRvU3RyaW5nKCkubGVuZ3RoO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBsZXQgZW5kID0gc3RhcnQgKyB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQudG9TdHJpbmcoKS5sZW5ndGg7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnNldFNlbGVjdGlvblJhbmdlKHN0YXJ0LCBlbmQpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdmlld2NoYW5nZWQoZGF0ZTpEYXRlLCBsZXZlbDpMZXZlbCwgdXBkYXRlPzpib29sZWFuKSB7ICAgICAgICBcclxuICAgICAgICB0aGlzLmRhdGVQYXJ0cy5mb3JFYWNoKChkYXRlUGFydCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodXBkYXRlKSBkYXRlUGFydC5zZXRWYWx1ZShkYXRlKTtcclxuICAgICAgICAgICAgaWYgKGRhdGVQYXJ0LmdldExldmVsKCkgPT09IGxldmVsICYmXHJcbiAgICAgICAgICAgICAgICB0aGlzLmdldFNlbGVjdGVkRGF0ZVBhcnQoKSAhPT0gdm9pZCAwICYmXHJcbiAgICAgICAgICAgICAgICBsZXZlbCAhPT0gdGhpcy5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0TGV2ZWwoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTZWxlY3RlZERhdGVQYXJ0KGRhdGVQYXJ0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdHJpZ2dlclZpZXdDaGFuZ2UoKSB7XHJcbiAgICAgICAgdHJpZ2dlci52aWV3Y2hhbmdlZCh0aGlzLmVsZW1lbnQsIHtcclxuICAgICAgICAgICAgZGF0ZTogdGhpcy5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0VmFsdWUoKSxcclxuICAgICAgICAgICAgbGV2ZWw6IHRoaXMuZ2V0U2VsZWN0ZWREYXRlUGFydCgpLmdldExldmVsKClcclxuICAgICAgICB9KTsgICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbn0iLCJjb25zdCBlbnVtIEtFWSB7XHJcbiAgICBSSUdIVCA9IDM5LCBMRUZUID0gMzcsIFRBQiA9IDksIFVQID0gMzgsXHJcbiAgICBET1dOID0gNDAsIFYgPSA4NiwgQyA9IDY3LCBBID0gNjUsIEhPTUUgPSAzNixcclxuICAgIEVORCA9IDM1LCBCQUNLU1BBQ0UgPSA4XHJcbn1cclxuXHJcbmNsYXNzIEtleWJvYXJkRXZlbnRIYW5kbGVyIHtcclxuICAgIHByaXZhdGUgc2hpZnRUYWJEb3duID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIHRhYkRvd24gPSBmYWxzZTtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBpbnB1dDpJbnB1dCkge1xyXG4gICAgICAgIGlucHV0LmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgKGUpID0+IHRoaXMua2V5ZG93bihlKSk7XHJcbiAgICAgICAgaW5wdXQuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiZm9jdXNcIiwgKCkgPT4gdGhpcy5mb2N1cygpKTtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoZSkgPT4gdGhpcy5kb2N1bWVudEtleWRvd24oZSkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZm9jdXMgPSAoKTp2b2lkID0+IHtcclxuICAgICAgICBpZiAodGhpcy50YWJEb3duKSB7XHJcbiAgICAgICAgICAgIGxldCBmaXJzdCA9IHRoaXMuaW5wdXQuZ2V0Rmlyc3RTZWxlY3RhYmxlRGF0ZVBhcnQoKTtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC5zZXRTZWxlY3RlZERhdGVQYXJ0KGZpcnN0KTtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgIHRoaXMuaW5wdXQudHJpZ2dlclZpZXdDaGFuZ2UoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnNoaWZ0VGFiRG93bikge1xyXG4gICAgICAgICAgICBsZXQgbGFzdCA9IHRoaXMuaW5wdXQuZ2V0TGFzdFNlbGVjdGFibGVEYXRlUGFydCgpO1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQobGFzdCk7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICB0aGlzLmlucHV0LnRyaWdnZXJWaWV3Q2hhbmdlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBkb2N1bWVudEtleWRvd24oZTpLZXlib2FyZEV2ZW50KSB7XHJcbiAgICAgICAgaWYgKGUuc2hpZnRLZXkgJiYgZS5rZXlDb2RlID09PSBLRVkuVEFCKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hpZnRUYWJEb3duID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2UgaWYgKGUua2V5Q29kZSA9PT0gS0VZLlRBQikge1xyXG4gICAgICAgICAgICB0aGlzLnRhYkRvd24gPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zaGlmdFRhYkRvd24gPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy50YWJEb3duID0gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUga2V5ZG93bihlOktleWJvYXJkRXZlbnQpIHtcclxuICAgICAgICBsZXQgY29kZSA9IGUua2V5Q29kZTtcclxuICAgICAgICBpZiAoY29kZSA+PSA5NiAmJiBjb2RlIDw9IDEwNSkge1xyXG4gICAgICAgICAgICBjb2RlIC09IDQ4O1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICBpZiAoKGNvZGUgPT09IEtFWS5IT01FIHx8IGNvZGUgPT09IEtFWS5FTkQpICYmIGUuc2hpZnRLZXkpIHJldHVybjtcclxuICAgICAgICBpZiAoKGNvZGUgPT09IEtFWS5MRUZUIHx8IGNvZGUgPT09IEtFWS5SSUdIVCkgJiYgZS5zaGlmdEtleSkgcmV0dXJuO1xyXG4gICAgICAgIGlmICgoY29kZSA9PT0gS0VZLkMgfHwgY29kZSA9PT0gS0VZLkEgfHwgY29kZSA9PT0gS0VZLlYpICYmIGUuY3RybEtleSkgcmV0dXJuO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBwcmV2ZW50RGVmYXVsdCA9IHRydWU7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKGNvZGUgPT09IEtFWS5IT01FKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaG9tZSgpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gS0VZLkVORCkge1xyXG4gICAgICAgICAgICB0aGlzLmVuZCgpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gS0VZLkxFRlQpIHtcclxuICAgICAgICAgICAgdGhpcy5sZWZ0KCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb2RlID09PSBLRVkuUklHSFQpIHtcclxuICAgICAgICAgICAgdGhpcy5yaWdodCgpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gS0VZLlRBQiAmJiBlLnNoaWZ0S2V5KSB7XHJcbiAgICAgICAgICAgIHByZXZlbnREZWZhdWx0ID0gdGhpcy5zaGlmdFRhYigpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gS0VZLlRBQikge1xyXG4gICAgICAgICAgICBwcmV2ZW50RGVmYXVsdCA9IHRoaXMudGFiKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb2RlID09PSBLRVkuVVApIHtcclxuICAgICAgICAgICAgdGhpcy51cCgpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gS0VZLkRPV04pIHtcclxuICAgICAgICAgICAgdGhpcy5kb3duKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChwcmV2ZW50RGVmYXVsdCkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBrZXlQcmVzc2VkID0gU3RyaW5nLmZyb21DaGFyQ29kZShjb2RlKTtcclxuICAgICAgICBpZiAoL15bMC05XXxbQS16XSQvLnRlc3Qoa2V5UHJlc3NlZCkpIHtcclxuICAgICAgICAgICAgbGV0IHRleHRCdWZmZXIgPSB0aGlzLmlucHV0LmdldFRleHRCdWZmZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC5zZXRUZXh0QnVmZmVyKHRleHRCdWZmZXIgKyBrZXlQcmVzc2VkKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IEtFWS5CQUNLU1BBQ0UpIHtcclxuICAgICAgICAgICAgbGV0IHRleHRCdWZmZXIgPSB0aGlzLmlucHV0LmdldFRleHRCdWZmZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC5zZXRUZXh0QnVmZmVyKHRleHRCdWZmZXIuc2xpY2UoMCwgLTEpKTtcclxuICAgICAgICB9IGVsc2UgaWYgKCFlLnNoaWZ0S2V5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXQuc2V0VGV4dEJ1ZmZlcignJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGhvbWUoKSB7XHJcbiAgICAgICAgbGV0IGZpcnN0ID0gdGhpcy5pbnB1dC5nZXRGaXJzdFNlbGVjdGFibGVEYXRlUGFydCgpO1xyXG4gICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChmaXJzdCk7XHJcbiAgICAgICAgdGhpcy5pbnB1dC50cmlnZ2VyVmlld0NoYW5nZSgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGVuZCgpIHtcclxuICAgICAgICBsZXQgbGFzdCA9IHRoaXMuaW5wdXQuZ2V0TGFzdFNlbGVjdGFibGVEYXRlUGFydCgpO1xyXG4gICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChsYXN0KTsgICAgIFxyXG4gICAgICAgIHRoaXMuaW5wdXQudHJpZ2dlclZpZXdDaGFuZ2UoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBsZWZ0KCkge1xyXG4gICAgICAgIGxldCBwcmV2aW91cyA9IHRoaXMuaW5wdXQuZ2V0UHJldmlvdXNTZWxlY3RhYmxlRGF0ZVBhcnQoKTtcclxuICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQocHJldmlvdXMpO1xyXG4gICAgICAgIHRoaXMuaW5wdXQudHJpZ2dlclZpZXdDaGFuZ2UoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSByaWdodCgpIHtcclxuICAgICAgICBsZXQgbmV4dCA9IHRoaXMuaW5wdXQuZ2V0TmV4dFNlbGVjdGFibGVEYXRlUGFydCgpO1xyXG4gICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChuZXh0KTtcclxuICAgICAgICB0aGlzLmlucHV0LnRyaWdnZXJWaWV3Q2hhbmdlKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgc2hpZnRUYWIoKSB7XHJcbiAgICAgICAgbGV0IHByZXZpb3VzID0gdGhpcy5pbnB1dC5nZXRQcmV2aW91c1NlbGVjdGFibGVEYXRlUGFydCgpO1xyXG4gICAgICAgIGlmIChwcmV2aW91cyAhPT0gdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkpIHtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC5zZXRTZWxlY3RlZERhdGVQYXJ0KHByZXZpb3VzKTtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC50cmlnZ2VyVmlld0NoYW5nZSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHRhYigpIHtcclxuICAgICAgICBsZXQgbmV4dCA9IHRoaXMuaW5wdXQuZ2V0TmV4dFNlbGVjdGFibGVEYXRlUGFydCgpO1xyXG4gICAgICAgIGlmIChuZXh0ICE9PSB0aGlzLmlucHV0LmdldFNlbGVjdGVkRGF0ZVBhcnQoKSkge1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQobmV4dCk7XHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXQudHJpZ2dlclZpZXdDaGFuZ2UoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSB1cCgpIHtcclxuICAgICAgICB0aGlzLmlucHV0LmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5pbmNyZW1lbnQoKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgbGV2ZWwgPSB0aGlzLmlucHV0LmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5nZXRMZXZlbCgpO1xyXG4gICAgICAgIGxldCBkYXRlID0gdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0VmFsdWUoKTtcclxuICAgICAgICBcclxuICAgICAgICB0cmlnZ2VyLmdvdG8odGhpcy5pbnB1dC5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgIGRhdGU6IGRhdGUsXHJcbiAgICAgICAgICAgIGxldmVsOiBsZXZlbFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGRvd24oKSB7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZGVjcmVtZW50KCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGxldmVsID0gdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0TGV2ZWwoKTtcclxuICAgICAgICBsZXQgZGF0ZSA9IHRoaXMuaW5wdXQuZ2V0U2VsZWN0ZWREYXRlUGFydCgpLmdldFZhbHVlKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdHJpZ2dlci5nb3RvKHRoaXMuaW5wdXQuZWxlbWVudCwge1xyXG4gICAgICAgICAgICBkYXRlOiBkYXRlLFxyXG4gICAgICAgICAgICBsZXZlbDogbGV2ZWxcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsImNsYXNzIE1vdXNlRXZlbnRIYW5kbGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgaW5wdXQ6SW5wdXQpIHtcclxuICAgICAgICBsaXN0ZW4ubW91c2Vkb3duKGlucHV0LmVsZW1lbnQsICgpID0+IHRoaXMubW91c2Vkb3duKCkpO1xyXG4gICAgICAgIGxpc3Rlbi5tb3VzZXVwKGRvY3VtZW50LCAoKSA9PiB0aGlzLm1vdXNldXAoKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gU3RvcCBkZWZhdWx0XHJcbiAgICAgICAgaW5wdXQuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ2VudGVyXCIsIChlKSA9PiBlLnByZXZlbnREZWZhdWx0KCkpO1xyXG4gICAgICAgIGlucHV0LmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdvdmVyXCIsIChlKSA9PiBlLnByZXZlbnREZWZhdWx0KCkpO1xyXG4gICAgICAgIGlucHV0LmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImRyb3BcIiwgKGUpID0+IGUucHJldmVudERlZmF1bHQoKSk7XHJcbiAgICAgICAgaW5wdXQuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY3V0XCIsIChlKSA9PiBlLnByZXZlbnREZWZhdWx0KCkpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGRvd246Ym9vbGVhbjtcclxuICAgIHByaXZhdGUgY2FyZXRTdGFydDpudW1iZXI7XHJcbiAgICBcclxuICAgIHByaXZhdGUgbW91c2Vkb3duKCkge1xyXG4gICAgICAgIHRoaXMuZG93biA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5lbGVtZW50LnNldFNlbGVjdGlvblJhbmdlKHZvaWQgMCwgdm9pZCAwKTtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICB0aGlzLmNhcmV0U3RhcnQgPSB0aGlzLmlucHV0LmVsZW1lbnQuc2VsZWN0aW9uU3RhcnQ7IFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIG1vdXNldXAgPSAoKSA9PiB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmRvd24pIHJldHVybjtcclxuICAgICAgICB0aGlzLmRvd24gPSBmYWxzZTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgcG9zOm51bWJlcjtcclxuICAgICAgICBcclxuICAgICAgICBpZiAodGhpcy5pbnB1dC5lbGVtZW50LnNlbGVjdGlvblN0YXJ0ID09PSB0aGlzLmNhcmV0U3RhcnQpIHtcclxuICAgICAgICAgICAgcG9zID0gdGhpcy5pbnB1dC5lbGVtZW50LnNlbGVjdGlvbkVuZDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwb3MgPSB0aGlzLmlucHV0LmVsZW1lbnQuc2VsZWN0aW9uU3RhcnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBibG9jayA9IHRoaXMuaW5wdXQuZ2V0TmVhcmVzdFNlbGVjdGFibGVEYXRlUGFydChwb3MpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChibG9jayk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMuaW5wdXQuZWxlbWVudC5zZWxlY3Rpb25TdGFydCA+IDAgfHwgdGhpcy5pbnB1dC5lbGVtZW50LnNlbGVjdGlvbkVuZCA8IHRoaXMuaW5wdXQuZWxlbWVudC52YWx1ZS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC50cmlnZ2VyVmlld0NoYW5nZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn0iLCJjbGFzcyBQYXJzZXIge1xyXG4gICAgcHVibGljIHN0YXRpYyBwYXJzZShmb3JtYXQ6c3RyaW5nKTpJRGF0ZVBhcnRbXSB7XHJcbiAgICAgICAgbGV0IHRleHRCdWZmZXIgPSAnJztcclxuICAgICAgICBsZXQgZGF0ZVBhcnRzOklEYXRlUGFydFtdID0gW107XHJcbiAgICBcclxuICAgICAgICBsZXQgaW5kZXggPSAwOyAgICAgICAgICAgICAgICBcclxuICAgICAgICBsZXQgaW5Fc2NhcGVkU2VnbWVudCA9IGZhbHNlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBwdXNoUGxhaW5UZXh0ID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGV4dEJ1ZmZlci5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBkYXRlUGFydHMucHVzaChuZXcgUGxhaW5UZXh0KHRleHRCdWZmZXIpLnNldFNlbGVjdGFibGUoZmFsc2UpKTtcclxuICAgICAgICAgICAgICAgIHRleHRCdWZmZXIgPSAnJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB3aGlsZSAoaW5kZXggPCBmb3JtYXQubGVuZ3RoKSB7ICAgICBcclxuICAgICAgICAgICAgaWYgKCFpbkVzY2FwZWRTZWdtZW50ICYmIGZvcm1hdFtpbmRleF0gPT09ICdbJykge1xyXG4gICAgICAgICAgICAgICAgaW5Fc2NhcGVkU2VnbWVudCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChpbkVzY2FwZWRTZWdtZW50ICYmIGZvcm1hdFtpbmRleF0gPT09ICddJykge1xyXG4gICAgICAgICAgICAgICAgaW5Fc2NhcGVkU2VnbWVudCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaW5kZXgrKztcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoaW5Fc2NhcGVkU2VnbWVudCkge1xyXG4gICAgICAgICAgICAgICAgdGV4dEJ1ZmZlciArPSBmb3JtYXRbaW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgaW5kZXgrKztcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgZm91bmQgPSBmYWxzZTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGZvciAobGV0IGNvZGUgaW4gZm9ybWF0QmxvY2tzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoUGFyc2VyLmZpbmRBdChmb3JtYXQsIGluZGV4LCBgeyR7Y29kZX19YCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBwdXNoUGxhaW5UZXh0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZVBhcnRzLnB1c2gobmV3IGZvcm1hdEJsb2Nrc1tjb2RlXSgpLnNldFNlbGVjdGFibGUoZmFsc2UpKTtcclxuICAgICAgICAgICAgICAgICAgICBpbmRleCArPSBjb2RlLmxlbmd0aCArIDI7XHJcbiAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChQYXJzZXIuZmluZEF0KGZvcm1hdCwgaW5kZXgsIGNvZGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHVzaFBsYWluVGV4dCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGVQYXJ0cy5wdXNoKG5ldyBmb3JtYXRCbG9ja3NbY29kZV0oKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggKz0gY29kZS5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoIWZvdW5kKSB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0QnVmZmVyICs9IGZvcm1hdFtpbmRleF07XHJcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdXNoUGxhaW5UZXh0KCk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICByZXR1cm4gZGF0ZVBhcnRzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHN0YXRpYyBmaW5kQXQgKHN0cjpzdHJpbmcsIGluZGV4Om51bWJlciwgc2VhcmNoOnN0cmluZykge1xyXG4gICAgICAgIHJldHVybiBzdHIuc2xpY2UoaW5kZXgsIGluZGV4ICsgc2VhcmNoLmxlbmd0aCkgPT09IHNlYXJjaDtcclxuICAgIH1cclxufSIsImNsYXNzIFBhc3RlRXZlbnRIYW5kZXIge1xyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBpbnB1dDpJbnB1dCkge1xyXG4gICAgICAgIGxpc3Rlbi5wYXN0ZShpbnB1dC5lbGVtZW50LCAoKSA9PiB0aGlzLnBhc3RlKCkpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHBhc3RlKCkge1xyXG4gICAgICAgIGxldCBvcmlnaW5hbFZhbHVlID0gdGhpcy5pbnB1dC5lbGVtZW50LnZhbHVlO1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgIGlmICghdGhpcy5pbnB1dC5mb3JtYXQudGVzdCh0aGlzLmlucHV0LmVsZW1lbnQudmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgIHRoaXMuaW5wdXQuZWxlbWVudC52YWx1ZSA9IG9yaWdpbmFsVmFsdWU7XHJcbiAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICB9IFxyXG4gICAgICAgICAgIFxyXG4gICAgICAgICAgIGxldCBuZXdEYXRlID0gdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0VmFsdWUoKTtcclxuICAgICAgICAgICBcclxuICAgICAgICAgICBsZXQgc3RyUHJlZml4ID0gJyc7XHJcbiAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmlucHV0LmRhdGVQYXJ0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICBsZXQgZGF0ZVBhcnQgPSB0aGlzLmlucHV0LmRhdGVQYXJ0c1tpXTtcclxuICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgIGxldCByZWdFeHAgPSBuZXcgUmVnRXhwKGRhdGVQYXJ0LmdldFJlZ0V4KCkuc291cmNlLnNsaWNlKDEsIC0xKSwgJ2knKTtcclxuICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgIGxldCB2YWwgPSB0aGlzLmlucHV0LmVsZW1lbnQudmFsdWUucmVwbGFjZShzdHJQcmVmaXgsICcnKS5tYXRjaChyZWdFeHApWzBdO1xyXG4gICAgICAgICAgICAgICBzdHJQcmVmaXggKz0gdmFsO1xyXG4gICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgaWYgKCFkYXRlUGFydC5pc1NlbGVjdGFibGUoKSkgY29udGludWU7XHJcbiAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICBkYXRlUGFydC5zZXRWYWx1ZShuZXdEYXRlKTtcclxuICAgICAgICAgICAgICAgaWYgKGRhdGVQYXJ0LnNldFZhbHVlKHZhbCkpIHtcclxuICAgICAgICAgICAgICAgICAgIG5ld0RhdGUgPSBkYXRlUGFydC5nZXRWYWx1ZSgpO1xyXG4gICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgdGhpcy5pbnB1dC5lbGVtZW50LnZhbHVlID0gb3JpZ2luYWxWYWx1ZTtcclxuICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgIH1cclxuICAgICAgICAgICBcclxuICAgICAgICAgICB0cmlnZ2VyLmdvdG8odGhpcy5pbnB1dC5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgICAgIGRhdGU6IG5ld0RhdGUsXHJcbiAgICAgICAgICAgICAgIGxldmVsOiB0aGlzLmlucHV0LmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5nZXRMZXZlbCgpXHJcbiAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0iLCJjb25zdCBlbnVtIFN0ZXBEaXJlY3Rpb24ge1xyXG4gICAgVVAsIERPV05cclxufVxyXG5cclxuY2xhc3MgSGVhZGVyIGV4dGVuZHMgQ29tbW9uIHtcclxuICAgIHByaXZhdGUgeWVhckxhYmVsOkVsZW1lbnQ7XHJcbiAgICBwcml2YXRlIG1vbnRoTGFiZWw6RWxlbWVudDtcclxuICAgIHByaXZhdGUgZGF0ZUxhYmVsOkVsZW1lbnQ7XHJcbiAgICBwcml2YXRlIGhvdXJMYWJlbDpFbGVtZW50O1xyXG4gICAgcHJpdmF0ZSBtaW51dGVMYWJlbDpFbGVtZW50O1xyXG4gICAgcHJpdmF0ZSBzZWNvbmRMYWJlbDpFbGVtZW50O1xyXG4gICAgXHJcbiAgICBwcml2YXRlIGxhYmVsczpFbGVtZW50W107XHJcbiAgICBcclxuICAgIHByaXZhdGUgb3B0aW9uczpJT3B0aW9ucztcclxuICAgIHByaXZhdGUgbGV2ZWxzOkxldmVsW107XHJcbiAgICBcclxuICAgIHByaXZhdGUgbGV2ZWw6TGV2ZWw7XHJcbiAgICBwcml2YXRlIGRhdGU6RGF0ZTtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBlbGVtZW50OkhUTUxFbGVtZW50LCBwcml2YXRlIGNvbnRhaW5lcjpIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGlzdGVuLnZpZXdjaGFuZ2VkKGVsZW1lbnQsIChlKSA9PiB0aGlzLnZpZXdjaGFuZ2VkKGUuZGF0ZSwgZS5sZXZlbCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMueWVhckxhYmVsID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS15ZWFyJyk7XHJcbiAgICAgICAgdGhpcy5tb250aExhYmVsID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS1tb250aCcpO1xyXG4gICAgICAgIHRoaXMuZGF0ZUxhYmVsID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS1kYXRlJyk7XHJcbiAgICAgICAgdGhpcy5ob3VyTGFiZWwgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcignZGF0aXVtLXNwYW4tbGFiZWwuZGF0aXVtLWhvdXInKTtcclxuICAgICAgICB0aGlzLm1pbnV0ZUxhYmVsID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS1taW51dGUnKTtcclxuICAgICAgICB0aGlzLnNlY29uZExhYmVsID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS1zZWNvbmQnKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmxhYmVscyA9IFt0aGlzLnllYXJMYWJlbCwgdGhpcy5tb250aExhYmVsLCB0aGlzLmRhdGVMYWJlbCwgdGhpcy5ob3VyTGFiZWwsIHRoaXMubWludXRlTGFiZWwsIHRoaXMuc2Vjb25kTGFiZWxdO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBwcmV2aW91c0J1dHRvbiA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdkYXRpdW0tcHJldicpO1xyXG4gICAgICAgIGxldCBuZXh0QnV0dG9uID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1uZXh0Jyk7XHJcbiAgICAgICAgbGV0IHNwYW5MYWJlbENvbnRhaW5lciA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdkYXRpdW0tc3Bhbi1sYWJlbC1jb250YWluZXInKTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4udGFwKHByZXZpb3VzQnV0dG9uLCAoKSA9PiB0aGlzLnByZXZpb3VzKCkpO1xyXG4gICAgICAgIGxpc3Rlbi50YXAobmV4dEJ1dHRvbiwgKCkgPT4gdGhpcy5uZXh0KCkpO1xyXG4gICAgICAgIGxpc3Rlbi50YXAoc3BhbkxhYmVsQ29udGFpbmVyLCAoKSA9PiB0aGlzLnpvb21PdXQoKSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgcHJldmlvdXMoKSB7XHJcbiAgICAgICAgdHJpZ2dlci5nb3RvKHRoaXMuZWxlbWVudCwge1xyXG4gICAgICAgICAgIGRhdGU6IHRoaXMuc3RlcERhdGUoU3RlcERpcmVjdGlvbi5ET1dOKSxcclxuICAgICAgICAgICBsZXZlbDogdGhpcy5sZXZlbCxcclxuICAgICAgICAgICB1cGRhdGU6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgbmV4dCgpIHtcclxuICAgICAgICB0cmlnZ2VyLmdvdG8odGhpcy5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgZGF0ZTogdGhpcy5zdGVwRGF0ZShTdGVwRGlyZWN0aW9uLlVQKSxcclxuICAgICAgICAgICBsZXZlbDogdGhpcy5sZXZlbCxcclxuICAgICAgICAgICB1cGRhdGU6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgem9vbU91dCgpIHtcclxuICAgICAgICBsZXQgbmV3TGV2ZWwgID0gdGhpcy5sZXZlbHNbdGhpcy5sZXZlbHMuaW5kZXhPZih0aGlzLmxldmVsKSAtIDFdO1xyXG4gICAgICAgIGlmIChuZXdMZXZlbCA9PT0gdm9pZCAwKSByZXR1cm47XHJcbiAgICAgICAgdHJpZ2dlci5nb3RvKHRoaXMuZWxlbWVudCwge1xyXG4gICAgICAgICAgIGRhdGU6IHRoaXMuZGF0ZSxcclxuICAgICAgICAgICBsZXZlbDogbmV3TGV2ZWwsXHJcbiAgICAgICAgICAgdXBkYXRlOiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHN0ZXBEYXRlKHN0ZXBUeXBlOlN0ZXBEaXJlY3Rpb24pOkRhdGUge1xyXG4gICAgICAgIGxldCBkYXRlID0gbmV3IERhdGUodGhpcy5kYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgbGV0IGRpcmVjdGlvbiA9IHN0ZXBUeXBlID09PSBTdGVwRGlyZWN0aW9uLlVQID8gMSA6IC0xO1xyXG4gICAgICAgIHN3aXRjaCAodGhpcy5sZXZlbCkge1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLllFQVI6XHJcbiAgICAgICAgICAgICAgICBkYXRlLnNldEZ1bGxZZWFyKGRhdGUuZ2V0RnVsbFllYXIoKSArIDEwICogZGlyZWN0aW9uKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLk1PTlRIOlxyXG4gICAgICAgICAgICAgICAgZGF0ZS5zZXRGdWxsWWVhcihkYXRlLmdldEZ1bGxZZWFyKCkgKyBkaXJlY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuREFURTpcclxuICAgICAgICAgICAgICAgIGRhdGUuc2V0TW9udGgoZGF0ZS5nZXRNb250aCgpICsgZGlyZWN0aW9uKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLkhPVVI6XHJcbiAgICAgICAgICAgICAgICBkYXRlLnNldERhdGUoZGF0ZS5nZXREYXRlKCkgKyBkaXJlY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuTUlOVVRFOlxyXG4gICAgICAgICAgICAgICAgZGF0ZS5zZXRIb3VycyhkYXRlLmdldEhvdXJzKCkgKyBkaXJlY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuU0VDT05EOlxyXG4gICAgICAgICAgICAgICAgZGF0ZS5zZXRNaW51dGVzKGRhdGUuZ2V0TWludXRlcygpICsgZGlyZWN0aW9uKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGF0ZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSB2aWV3Y2hhbmdlZChkYXRlOkRhdGUsIGxldmVsOkxldmVsKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZGF0ZSAhPT0gdm9pZCAwICYmXHJcbiAgICAgICAgICAgIGRhdGUudmFsdWVPZigpID09PSB0aGlzLmRhdGUudmFsdWVPZigpICYmXHJcbiAgICAgICAgICAgIGxldmVsID09PSB0aGlzLmxldmVsKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5kYXRlID0gZGF0ZTtcclxuICAgICAgICB0aGlzLmxldmVsID0gbGV2ZWw7XHJcbiAgICAgICAgdGhpcy5sYWJlbHMuZm9yRWFjaCgobGFiZWwsIGxhYmVsTGV2ZWwpID0+IHtcclxuICAgICAgICAgICAgbGFiZWwuY2xhc3NMaXN0LnJlbW92ZSgnZGF0aXVtLXRvcCcpO1xyXG4gICAgICAgICAgICBsYWJlbC5jbGFzc0xpc3QucmVtb3ZlKCdkYXRpdW0tYm90dG9tJyk7XHJcbiAgICAgICAgICAgIGxhYmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1oaWRkZW4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChsYWJlbExldmVsIDwgbGV2ZWwpIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS10b3AnKTtcclxuICAgICAgICAgICAgICAgIGxhYmVsLmlubmVySFRNTCA9IHRoaXMuZ2V0SGVhZGVyVG9wVGV4dChkYXRlLCBsYWJlbExldmVsKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1ib3R0b20nKTtcclxuICAgICAgICAgICAgICAgIGxhYmVsLmlubmVySFRNTCA9IHRoaXMuZ2V0SGVhZGVyQm90dG9tVGV4dChkYXRlLCBsYWJlbExldmVsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKGxhYmVsTGV2ZWwgPCBsZXZlbCAtIDEgfHwgbGFiZWxMZXZlbCA+IGxldmVsKSB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbC5jbGFzc0xpc3QuYWRkKCdkYXRpdW0taGlkZGVuJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBnZXRIZWFkZXJUb3BUZXh0KGRhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWwpOnN0cmluZyB7XHJcbiAgICAgICAgc3dpdGNoKGxldmVsKSB7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuWUVBUjpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldERlY2FkZShkYXRlKTtcclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5NT05USDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBkYXRlLmdldEZ1bGxZZWFyKCkudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5EQVRFOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3RoaXMuZ2V0U2hvcnRNb250aHMoKVtkYXRlLmdldE1vbnRoKCldfSAke2RhdGUuZ2V0RnVsbFllYXIoKX1gO1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLkhPVVI6XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuTUlOVVRFOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3RoaXMuZ2V0U2hvcnREYXlzKClbZGF0ZS5nZXREYXkoKV19ICR7dGhpcy5wYWQoZGF0ZS5nZXREYXRlKCkpfSAke3RoaXMuZ2V0U2hvcnRNb250aHMoKVtkYXRlLmdldE1vbnRoKCldfSAke2RhdGUuZ2V0RnVsbFllYXIoKX1gO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBnZXRIZWFkZXJCb3R0b21UZXh0KGRhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWwpOnN0cmluZyB7XHJcbiAgICAgICAgc3dpdGNoKGxldmVsKSB7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuWUVBUjpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldERlY2FkZShkYXRlKTtcclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5NT05USDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBkYXRlLmdldEZ1bGxZZWFyKCkudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5EQVRFOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U2hvcnRNb250aHMoKVtkYXRlLmdldE1vbnRoKCldO1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLkhPVVI6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7dGhpcy5nZXRTaG9ydERheXMoKVtkYXRlLmdldERheSgpXX0gJHt0aGlzLnBhZChkYXRlLmdldERhdGUoKSl9IDxkYXRpdW0tdmFyaWFibGU+JHt0aGlzLmdldEhvdXJzKGRhdGUpfSR7dGhpcy5nZXRNZXJpZGllbShkYXRlKX08L2RhdGl1bS12YXJpYWJsZT5gO1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLk1JTlVURTpcclxuICAgICAgICAgICAgICAgIHJldHVybiBgJHt0aGlzLmdldEhvdXJzKGRhdGUpfTo8ZGF0aXVtLXZhcmlhYmxlPiR7dGhpcy5wYWQoZGF0ZS5nZXRNaW51dGVzKCkpfTwvZGF0aXVtLXZhcmlhYmxlPiR7dGhpcy5nZXRNZXJpZGllbShkYXRlKX1gO1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLlNFQ09ORDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBgJHt0aGlzLmdldEhvdXJzKGRhdGUpfToke3RoaXMucGFkKGRhdGUuZ2V0TWludXRlcygpKX06PGRhdGl1bS12YXJpYWJsZT4ke3RoaXMucGFkKGRhdGUuZ2V0U2Vjb25kcygpKX08L2RhdGl1bS12YXJpYWJsZT4ke3RoaXMuZ2V0TWVyaWRpZW0oZGF0ZSl9YDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB1cGRhdGVPcHRpb25zKG9wdGlvbnM6SU9wdGlvbnMsIGxldmVsczpMZXZlbFtdKSB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuICAgICAgICB0aGlzLmxldmVscyA9IGxldmVscztcclxuICAgIH1cclxufSIsImNvbnN0IGVudW0gVHJhbnNpdGlvbiB7XHJcbiAgICBTTElERV9MRUZULFxyXG4gICAgU0xJREVfUklHSFQsXHJcbiAgICBaT09NX0lOLFxyXG4gICAgWk9PTV9PVVRcclxufVxyXG5cclxuY2xhc3MgUGlja2VyTWFuYWdlciB7XHJcbiAgICBwcml2YXRlIG9wdGlvbnM6SU9wdGlvbnM7XHJcbiAgICBwcml2YXRlIGNvbnRhaW5lcjpIVE1MRWxlbWVudDtcclxuICAgIHByaXZhdGUgaGVhZGVyOkhlYWRlcjtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSB5ZWFyUGlja2VyOklQaWNrZXI7XHJcbiAgICBwcml2YXRlIG1vbnRoUGlja2VyOklQaWNrZXI7XHJcbiAgICBwcml2YXRlIGRhdGVQaWNrZXI6SVBpY2tlcjtcclxuICAgIHByaXZhdGUgaG91clBpY2tlcjpJUGlja2VyO1xyXG4gICAgcHJpdmF0ZSBtaW51dGVQaWNrZXI6SVBpY2tlcjtcclxuICAgIHByaXZhdGUgc2Vjb25kUGlja2VyOklQaWNrZXI7XHJcbiAgICBcclxuICAgIHByaXZhdGUgY3VycmVudFBpY2tlcjpJUGlja2VyO1xyXG4gICAgXHJcbiAgICBwcml2YXRlIHBpY2tlckNvbnRhaW5lcjpIVE1MRWxlbWVudDtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBlbGVtZW50OkhUTUxJbnB1dEVsZW1lbnQpIHtcclxuICAgICAgICB0aGlzLmNvbnRhaW5lciA9IHRoaXMuY3JlYXRlVmlldygpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuaW5zZXJ0QWZ0ZXIoZWxlbWVudCwgdGhpcy5jb250YWluZXIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMucGlja2VyQ29udGFpbmVyID0gPEhUTUxFbGVtZW50PnRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1waWNrZXItY29udGFpbmVyJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5oZWFkZXIgPSBuZXcgSGVhZGVyKGVsZW1lbnQsIHRoaXMuY29udGFpbmVyKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnllYXJQaWNrZXIgPSBuZXcgWWVhclBpY2tlcihlbGVtZW50LCB0aGlzLmNvbnRhaW5lcik7XHJcbiAgICAgICAgdGhpcy5tb250aFBpY2tlciA9IG5ldyBNb250aFBpY2tlcihlbGVtZW50LCB0aGlzLmNvbnRhaW5lcik7XHJcbiAgICAgICAgdGhpcy5kYXRlUGlja2VyID0gbmV3IERhdGVQaWNrZXIoZWxlbWVudCwgdGhpcy5jb250YWluZXIpO1xyXG4gICAgICAgIHRoaXMuaG91clBpY2tlciA9IG5ldyBIb3VyUGlja2VyKGVsZW1lbnQsIHRoaXMuY29udGFpbmVyKTtcclxuICAgICAgICB0aGlzLm1pbnV0ZVBpY2tlciA9IG5ldyBNaW51dGVQaWNrZXIoZWxlbWVudCwgdGhpcy5jb250YWluZXIpO1xyXG4gICAgICAgIHRoaXMuc2Vjb25kUGlja2VyID0gbmV3IFNlY29uZFBpY2tlcihlbGVtZW50LCB0aGlzLmNvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICBsaXN0ZW4uZG93bih0aGlzLmNvbnRhaW5lciwgJyonLCAoZSkgPT4gdGhpcy5kb3duKGUpKTtcclxuICAgICAgICBsaXN0ZW4udXAoZG9jdW1lbnQsICgpID0+IHRoaXMudXAoKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGlzdGVuLm1vdXNlZG93bih0aGlzLmNvbnRhaW5lciwgKGUpID0+IHtcclxuICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICByZXR1cm4gZmFsc2U7IFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi52aWV3Y2hhbmdlZChlbGVtZW50LCAoZSkgPT4gdGhpcy52aWV3Y2hhbmdlZChlLmRhdGUsIGUubGV2ZWwsIGUudXBkYXRlKSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgdmlld2NoYW5nZWQoZGF0ZTpEYXRlLCBsZXZlbDpMZXZlbCwgc2VsZWN0ZWREYXRlQ2hhbmdlOmJvb2xlYW4pIHtcclxuICAgICAgICBpZiAobGV2ZWwgPT09IExldmVsLk5PTkUpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudFBpY2tlciAhPT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRQaWNrZXIucmVtb3ZlKFRyYW5zaXRpb24uWk9PTV9PVVQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuYWRqdXN0SGVpZ2h0KDEwKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBsZXQgdHJhbnNpdGlvbjpUcmFuc2l0aW9uO1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRQaWNrZXIgPT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQaWNrZXIgPSB0aGlzLmdldFBpY2tlcihsZXZlbCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBpY2tlci5jcmVhdGUoZGF0ZSwgVHJhbnNpdGlvbi5aT09NX0lOKTtcclxuICAgICAgICB9IGVsc2UgaWYgKCh0cmFuc2l0aW9uID0gdGhpcy5nZXRUcmFuc2l0aW9uKGRhdGUsIGxldmVsKSkgIT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQaWNrZXIucmVtb3ZlKHRyYW5zaXRpb24pO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQaWNrZXIgPSB0aGlzLmdldFBpY2tlcihsZXZlbCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBpY2tlci5jcmVhdGUoZGF0ZSwgdHJhbnNpdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChzZWxlY3RlZERhdGVDaGFuZ2UpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50UGlja2VyLnNldFNlbGVjdGVkRGF0ZShkYXRlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5hZGp1c3RIZWlnaHQodGhpcy5jdXJyZW50UGlja2VyLmdldEhlaWdodCgpKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBnZXRUcmFuc2l0aW9uKGRhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWwpOlRyYW5zaXRpb24ge1xyXG4gICAgICAgIGlmIChsZXZlbCA+IHRoaXMuY3VycmVudFBpY2tlci5nZXRMZXZlbCgpKSByZXR1cm4gVHJhbnNpdGlvbi5aT09NX0lOO1xyXG4gICAgICAgIGlmIChsZXZlbCA8IHRoaXMuY3VycmVudFBpY2tlci5nZXRMZXZlbCgpKSByZXR1cm4gVHJhbnNpdGlvbi5aT09NX09VVDtcclxuICAgICAgICBpZiAoZGF0ZS52YWx1ZU9mKCkgPCB0aGlzLmN1cnJlbnRQaWNrZXIuZ2V0TWluKCkudmFsdWVPZigpKSByZXR1cm4gVHJhbnNpdGlvbi5TTElERV9MRUZUO1xyXG4gICAgICAgIGlmIChkYXRlLnZhbHVlT2YoKSA+IHRoaXMuY3VycmVudFBpY2tlci5nZXRNYXgoKS52YWx1ZU9mKCkpIHJldHVybiBUcmFuc2l0aW9uLlNMSURFX1JJR0hUO1xyXG4gICAgICAgIHJldHVybiB2b2lkIDA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgYWRqdXN0SGVpZ2h0KGhlaWdodDpudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnBpY2tlckNvbnRhaW5lci5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlWSgke2hlaWdodCAtIDI4MH1weClgO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGdldFBpY2tlcihsZXZlbDpMZXZlbCk6SVBpY2tlciB7XHJcbiAgICAgICAgcmV0dXJuIFt0aGlzLnllYXJQaWNrZXIsdGhpcy5tb250aFBpY2tlcix0aGlzLmRhdGVQaWNrZXIsdGhpcy5ob3VyUGlja2VyLHRoaXMubWludXRlUGlja2VyLHRoaXMuc2Vjb25kUGlja2VyXVtsZXZlbF07XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgdXAoKSB7XHJcbiAgICAgICAgbGV0IGFjdGl2ZUVsZW1lbnRzID0gdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnLmRhdGl1bS1hY3RpdmUnKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFjdGl2ZUVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGFjdGl2ZUVsZW1lbnRzW2ldLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1hY3RpdmUnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnZGF0aXVtLWFjdGl2ZScpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGRvd24oZTpNb3VzZUV2ZW50fFRvdWNoRXZlbnQpIHtcclxuICAgICAgICBsZXQgZWwgPSBlLnNyY0VsZW1lbnQgfHwgPEVsZW1lbnQ+ZS50YXJnZXQ7XHJcbiAgICAgICAgd2hpbGUgKGVsICE9PSB0aGlzLmNvbnRhaW5lcikge1xyXG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIGVsID0gZWwucGFyZW50RWxlbWVudDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jb250YWluZXIuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLWFjdGl2ZScpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdXBkYXRlT3B0aW9ucyhvcHRpb25zOklPcHRpb25zLCBsZXZlbHM6TGV2ZWxbXSkge1xyXG4gICAgICAgIGxldCB0aGVtZVVwZGF0ZWQgPSB0aGlzLm9wdGlvbnMgPT09IHZvaWQgMCB8fFxyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMudGhlbWUgPT09IHZvaWQgMCB8fFxyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMudGhlbWUucHJpbWFyeSAhPT0gb3B0aW9ucy50aGVtZS5wcmltYXJ5IHx8XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy50aGVtZS5wcmltYXJ5X3RleHQgIT09IG9wdGlvbnMudGhlbWUucHJpbWFyeV90ZXh0IHx8XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy50aGVtZS5zZWNvbmRhcnkgIT09IG9wdGlvbnMudGhlbWUuc2Vjb25kYXJ5IHx8XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy50aGVtZS5zZWNvbmRhcnlfYWNjZW50ICE9PSBvcHRpb25zLnRoZW1lLnNlY29uZGFyeV9hY2NlbnQgfHxcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnRoZW1lLnNlY29uZGFyeV90ZXh0ICE9PSBvcHRpb25zLnRoZW1lLnNlY29uZGFyeV90ZXh0O1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoZW1lVXBkYXRlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmluc2VydFN0eWxlcygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmhlYWRlci51cGRhdGVPcHRpb25zKG9wdGlvbnMsIGxldmVscyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy55ZWFyUGlja2VyLnVwZGF0ZU9wdGlvbnMob3B0aW9ucyk7XHJcbiAgICAgICAgdGhpcy5tb250aFBpY2tlci51cGRhdGVPcHRpb25zKG9wdGlvbnMpO1xyXG4gICAgICAgIHRoaXMuZGF0ZVBpY2tlci51cGRhdGVPcHRpb25zKG9wdGlvbnMpO1xyXG4gICAgICAgIHRoaXMuaG91clBpY2tlci51cGRhdGVPcHRpb25zKG9wdGlvbnMpO1xyXG4gICAgICAgIHRoaXMubWludXRlUGlja2VyLnVwZGF0ZU9wdGlvbnMob3B0aW9ucyk7XHJcbiAgICAgICAgdGhpcy5zZWNvbmRQaWNrZXIudXBkYXRlT3B0aW9ucyhvcHRpb25zKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBjcmVhdGVWaWV3KCk6SFRNTEVsZW1lbnQge1xyXG4gICAgICAgIGxldCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1jb250YWluZXInKTtcclxuICAgICAgICBlbC5pbm5lckhUTUwgPSBoZWFkZXIgKyBgXHJcbiAgICAgICAgPGRhdGl1bS1waWNrZXItY29udGFpbmVyLXdyYXBwZXI+XHJcbiAgICAgICAgICAgIDxkYXRpdW0tcGlja2VyLWNvbnRhaW5lcj48L2RhdGl1bS1waWNrZXItY29udGFpbmVyPlxyXG4gICAgICAgIDwvZGF0aXVtLXBpY2tlci1jb250YWluZXItd3JhcHBlcj5gO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiBlbDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBpbnNlcnRBZnRlcihub2RlOk5vZGUsIG5ld05vZGU6Tm9kZSk6dm9pZCB7XHJcbiAgICAgICAgbm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShuZXdOb2RlLCBub2RlLm5leHRTaWJsaW5nKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgc3RhdGljIHN0eWxlc0luc2VydGVkOm51bWJlciA9IDA7XHJcbiAgICBcclxuICAgIHByaXZhdGUgaW5zZXJ0U3R5bGVzKCkge1xyXG4gICAgICAgIGxldCBoZWFkID0gZG9jdW1lbnQuaGVhZCB8fCBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdO1xyXG4gICAgICAgIGxldCBzdHlsZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBzdHlsZUlkID0gXCJkYXRpdW0tc3R5bGVcIiArIChQaWNrZXJNYW5hZ2VyLnN0eWxlc0luc2VydGVkKyspO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBleGlzdGluZ1N0eWxlSWQgPSB0aGlzLmdldEV4aXN0aW5nU3R5bGVJZCgpO1xyXG4gICAgICAgIGlmIChleGlzdGluZ1N0eWxlSWQgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5jb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZShleGlzdGluZ1N0eWxlSWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKHN0eWxlSWQpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCB0cmFuc2Zvcm1lZENzcyA9IGNzcy5yZXBsYWNlKC9fcHJpbWFyeV90ZXh0L2csIHRoaXMub3B0aW9ucy50aGVtZS5wcmltYXJ5X3RleHQpO1xyXG4gICAgICAgIHRyYW5zZm9ybWVkQ3NzID0gdHJhbnNmb3JtZWRDc3MucmVwbGFjZSgvX3ByaW1hcnkvZywgdGhpcy5vcHRpb25zLnRoZW1lLnByaW1hcnkpO1xyXG4gICAgICAgIHRyYW5zZm9ybWVkQ3NzID0gdHJhbnNmb3JtZWRDc3MucmVwbGFjZSgvX3NlY29uZGFyeV90ZXh0L2csIHRoaXMub3B0aW9ucy50aGVtZS5zZWNvbmRhcnlfdGV4dCk7XHJcbiAgICAgICAgdHJhbnNmb3JtZWRDc3MgPSB0cmFuc2Zvcm1lZENzcy5yZXBsYWNlKC9fc2Vjb25kYXJ5X2FjY2VudC9nLCB0aGlzLm9wdGlvbnMudGhlbWUuc2Vjb25kYXJ5X2FjY2VudCk7XHJcbiAgICAgICAgdHJhbnNmb3JtZWRDc3MgPSB0cmFuc2Zvcm1lZENzcy5yZXBsYWNlKC9fc2Vjb25kYXJ5L2csIHRoaXMub3B0aW9ucy50aGVtZS5zZWNvbmRhcnkpO1xyXG4gICAgICAgIHRyYW5zZm9ybWVkQ3NzID0gdHJhbnNmb3JtZWRDc3MucmVwbGFjZSgvX2lkL2csIHN0eWxlSWQpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHN0eWxlRWxlbWVudC50eXBlID0gJ3RleHQvY3NzJztcclxuICAgICAgICBpZiAoKDxhbnk+c3R5bGVFbGVtZW50KS5zdHlsZVNoZWV0KXtcclxuICAgICAgICAgICAgKDxhbnk+c3R5bGVFbGVtZW50KS5zdHlsZVNoZWV0LmNzc1RleHQgPSB0cmFuc2Zvcm1lZENzcztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzdHlsZUVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodHJhbnNmb3JtZWRDc3MpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGhlYWQuYXBwZW5kQ2hpbGQoc3R5bGVFbGVtZW50KTsgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGdldEV4aXN0aW5nU3R5bGVJZCgpOnN0cmluZyB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKC9eZGF0aXVtLXN0eWxlXFxkKyQvLnRlc3QodGhpcy5jb250YWluZXIuY2xhc3NMaXN0Lml0ZW0oaSkpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jb250YWluZXIuY2xhc3NMaXN0Lml0ZW0oaSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbn1cclxuIiwidmFyIGhlYWRlciA9IFwiPGRhdGl1bS1oZWFkZXItd3JhcHBlcj4gPGRhdGl1bS1oZWFkZXI+IDxkYXRpdW0tc3Bhbi1sYWJlbC1jb250YWluZXI+IDxkYXRpdW0tc3Bhbi1sYWJlbCBjbGFzcz0nZGF0aXVtLXllYXInPjwvZGF0aXVtLXNwYW4tbGFiZWw+IDxkYXRpdW0tc3Bhbi1sYWJlbCBjbGFzcz0nZGF0aXVtLW1vbnRoJz48L2RhdGl1bS1zcGFuLWxhYmVsPiA8ZGF0aXVtLXNwYW4tbGFiZWwgY2xhc3M9J2RhdGl1bS1kYXRlJz48L2RhdGl1bS1zcGFuLWxhYmVsPiA8ZGF0aXVtLXNwYW4tbGFiZWwgY2xhc3M9J2RhdGl1bS1ob3VyJz48L2RhdGl1bS1zcGFuLWxhYmVsPiA8ZGF0aXVtLXNwYW4tbGFiZWwgY2xhc3M9J2RhdGl1bS1taW51dGUnPjwvZGF0aXVtLXNwYW4tbGFiZWw+IDxkYXRpdW0tc3Bhbi1sYWJlbCBjbGFzcz0nZGF0aXVtLXNlY29uZCc+PC9kYXRpdW0tc3Bhbi1sYWJlbD4gPC9kYXRpdW0tc3Bhbi1sYWJlbC1jb250YWluZXI+IDxkYXRpdW0tcHJldj48L2RhdGl1bS1wcmV2PiA8ZGF0aXVtLW5leHQ+PC9kYXRpdW0tbmV4dD4gPC9kYXRpdW0taGVhZGVyPiA8L2RhdGl1bS1oZWFkZXItd3JhcHBlcj5cIjsiLCJcclxuY2xhc3MgUGlja2VyIHtcclxuICAgIHByb3RlY3RlZCBwaWNrZXJDb250YWluZXI6SFRNTEVsZW1lbnQ7XHJcbiAgICBwcm90ZWN0ZWQgbWluOkRhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgcHJvdGVjdGVkIG1heDpEYXRlID0gbmV3IERhdGUoKTtcclxuICAgIHByb3RlY3RlZCBwaWNrZXI6SFRNTEVsZW1lbnQ7XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6SFRNTEVsZW1lbnQsIGNvbnRhaW5lcjpIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIHRoaXMucGlja2VyQ29udGFpbmVyID0gPEhUTUxFbGVtZW50PmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdkYXRpdW0tcGlja2VyLWNvbnRhaW5lcicpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgY3JlYXRlKGRhdGU6RGF0ZSwgdHJhbnNpdGlvbjpUcmFuc2l0aW9uKSB7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyByZW1vdmUodHJhbnNpdGlvbjpUcmFuc2l0aW9uKSB7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXREYXRlKCk6RGF0ZSB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRNaW4oKTpEYXRlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5taW47XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRNYXgoKTpEYXRlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tYXg7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICByZXR1cm4gTGV2ZWwuWUVBUjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHNldFNlbGVjdGVkRGF0ZShkYXRlOkRhdGUpOnZvaWQge1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgdHJhbnNpdGlvbk91dCh0cmFuc2l0aW9uOlRyYW5zaXRpb24pIHtcclxuICAgICAgICBpZiAodHJhbnNpdGlvbiA9PT0gVHJhbnNpdGlvbi5TTElERV9MRUZUKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGlja2VyLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1waWNrZXItcmlnaHQnKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRyYW5zaXRpb24gPT09IFRyYW5zaXRpb24uU0xJREVfUklHSFQpIHtcclxuICAgICAgICAgICAgdGhpcy5waWNrZXIuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLXBpY2tlci1sZWZ0Jyk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0cmFuc2l0aW9uID09PSBUcmFuc2l0aW9uLlpPT01fSU4pIHtcclxuICAgICAgICAgICAgdGhpcy5waWNrZXIuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLXBpY2tlci1vdXQnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnBpY2tlci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tcGlja2VyLWluJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgdHJhbnNpdGlvbkluKHRyYW5zaXRpb246VHJhbnNpdGlvbikge1xyXG4gICAgICAgIGlmICh0cmFuc2l0aW9uID09PSBUcmFuc2l0aW9uLlNMSURFX0xFRlQpIHtcclxuICAgICAgICAgICAgdGhpcy5waWNrZXIuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLXBpY2tlci1sZWZ0Jyk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0cmFuc2l0aW9uID09PSBUcmFuc2l0aW9uLlNMSURFX1JJR0hUKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGlja2VyLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1waWNrZXItcmlnaHQnKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRyYW5zaXRpb24gPT09IFRyYW5zaXRpb24uWk9PTV9JTikge1xyXG4gICAgICAgICAgICB0aGlzLnBpY2tlci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tcGlja2VyLWluJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5waWNrZXIuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLXBpY2tlci1vdXQnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBnZXRUcmFuc2l0aW9uQ2xhc3ModHJhbnNpdGlvbjpUcmFuc2l0aW9uKSB7XHJcbiAgICAgICAgcmV0dXJuIFsnZGF0aXVtLXRyYW5zaXRpb24tbGVmdCcsICdkYXRpdW0tdHJhbnNpdGlvbi1yaWdodCcsXHJcbiAgICAgICAgICAgICAgICAnZGF0aXVtLXRyYW5zaXRpb24taW4nLCdkYXRpdW0tdHJhbnNpdGlvbi1vdXQnXVt0cmFuc2l0aW9uXTtcclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwicGlja2VyLnRzXCIgLz5cclxuXHJcbmNsYXNzIERhdGVQaWNrZXIgZXh0ZW5kcyBQaWNrZXIgaW1wbGVtZW50cyBJUGlja2VyIHtcclxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6SFRNTEVsZW1lbnQsIGNvbnRhaW5lcjpIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIHN1cGVyKGVsZW1lbnQsIGNvbnRhaW5lcik7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB1cGRhdGVPcHRpb25zKG9wdGlvbnM6SU9wdGlvbnMpIHtcclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldEhlaWdodCgpIHtcclxuICAgICAgICByZXR1cm4gMjAwO1xyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInBpY2tlci50c1wiIC8+XHJcblxyXG5jbGFzcyBIb3VyUGlja2VyIGV4dGVuZHMgUGlja2VyIGltcGxlbWVudHMgSVBpY2tlciB7XHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OkhUTUxFbGVtZW50LCBjb250YWluZXI6SFRNTEVsZW1lbnQpIHtcclxuICAgICAgICBzdXBlcihlbGVtZW50LCBjb250YWluZXIpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdXBkYXRlT3B0aW9ucyhvcHRpb25zOklPcHRpb25zKSB7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRIZWlnaHQoKSB7XHJcbiAgICAgICAgcmV0dXJuIDI2MDtcclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJwaWNrZXIudHNcIiAvPlxyXG5cclxuY2xhc3MgTWludXRlUGlja2VyIGV4dGVuZHMgUGlja2VyIGltcGxlbWVudHMgSVBpY2tlciB7XHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OkhUTUxFbGVtZW50LCBjb250YWluZXI6SFRNTEVsZW1lbnQpIHtcclxuICAgICAgICBzdXBlcihlbGVtZW50LCBjb250YWluZXIpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdXBkYXRlT3B0aW9ucyhvcHRpb25zOklPcHRpb25zKSB7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRIZWlnaHQoKSB7XHJcbiAgICAgICAgcmV0dXJuIDIzMDtcclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJwaWNrZXIudHNcIiAvPlxyXG5cclxuY2xhc3MgTW9udGhQaWNrZXIgZXh0ZW5kcyBQaWNrZXIgaW1wbGVtZW50cyBJUGlja2VyIHtcclxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6SFRNTEVsZW1lbnQsIGNvbnRhaW5lcjpIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIHN1cGVyKGVsZW1lbnQsIGNvbnRhaW5lcik7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB1cGRhdGVPcHRpb25zKG9wdGlvbnM6SU9wdGlvbnMpIHtcclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldEhlaWdodCgpIHtcclxuICAgICAgICByZXR1cm4gMTUwO1xyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInBpY2tlci50c1wiIC8+XHJcblxyXG5jbGFzcyBTZWNvbmRQaWNrZXIgZXh0ZW5kcyBQaWNrZXIgaW1wbGVtZW50cyBJUGlja2VyIHtcclxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6SFRNTEVsZW1lbnQsIGNvbnRhaW5lcjpIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIHN1cGVyKGVsZW1lbnQsIGNvbnRhaW5lcik7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB1cGRhdGVPcHRpb25zKG9wdGlvbnM6SU9wdGlvbnMpIHtcclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldEhlaWdodCgpIHtcclxuICAgICAgICByZXR1cm4gMTgwO1xyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInBpY2tlci50c1wiIC8+XHJcblxyXG5jbGFzcyBZZWFyUGlja2VyIGV4dGVuZHMgUGlja2VyIGltcGxlbWVudHMgSVBpY2tlciB7XHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OkhUTUxFbGVtZW50LCBjb250YWluZXI6SFRNTEVsZW1lbnQpIHtcclxuICAgICAgICBzdXBlcihlbGVtZW50LCBjb250YWluZXIpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdXBkYXRlT3B0aW9ucyhvcHRpb25zOklPcHRpb25zKSB7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgcGlja2Vyczp7W3RpbWVzdGFtcDpudW1iZXJdOkhUTUxFbGVtZW50O30gPSB7fTtcclxuICAgIFxyXG4gICAgcHVibGljIGNyZWF0ZShkYXRlOkRhdGUsIHRyYW5zaXRpb246VHJhbnNpdGlvbikge1xyXG4gICAgICAgIHRoaXMubWluID0gbmV3IERhdGUoTWF0aC5mbG9vcihkYXRlLmdldEZ1bGxZZWFyKCkvMTApKjEwLCAwKTtcclxuICAgICAgICB0aGlzLm1heCA9IG5ldyBEYXRlKE1hdGguY2VpbChkYXRlLmdldEZ1bGxZZWFyKCkvMTApKjEwICsgMSwgMCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGl0ZXJhdG9yID0gbmV3IERhdGUodGhpcy5taW4udmFsdWVPZigpKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnBpY2tlcnNbdGhpcy5taW4udmFsdWVPZigpXSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1waWNrZXInKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnRyYW5zaXRpb25Jbih0cmFuc2l0aW9uKTtcclxuICAgICAgICBcclxuICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgIGxldCB5ZWFyRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS15ZWFyLWVsZW1lbnQnKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHllYXJFbGVtZW50LmlubmVySFRNTCA9IGl0ZXJhdG9yLmdldEZ1bGxZZWFyKCkudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKHllYXJFbGVtZW50KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGl0ZXJhdG9yLnNldEZ1bGxZZWFyKGl0ZXJhdG9yLmdldEZ1bGxZZWFyKCkgKyAxKTtcclxuICAgICAgICB9IHdoaWxlIChpdGVyYXRvci52YWx1ZU9mKCkgPCB0aGlzLm1heC52YWx1ZU9mKCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMucGlja2VyQ29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMucGlja2VyKTtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5waWNrZXIuY2xhc3NOYW1lID0gJyc7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyByZW1vdmUodHJhbnNpdGlvbjpUcmFuc2l0aW9uKSB7XHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uT3V0KHRyYW5zaXRpb24pO1xyXG4gICAgICAgIHNldFRpbWVvdXQoKHBpY2tlcjpIVE1MRWxlbWVudCkgPT4ge1xyXG4gICAgICAgICAgICBwaWNrZXIucmVtb3ZlKCk7XHJcbiAgICAgICAgfSwgNDAwLCB0aGlzLnBpY2tlcik7ICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0SGVpZ2h0KCkge1xyXG4gICAgICAgIHJldHVybiAxODA7XHJcbiAgICB9XHJcbn0iLCJ2YXIgY3NzPVwiZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWhlYWRlci13cmFwcGVye292ZXJmbG93OmhpZGRlbjtwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0Oi03cHg7cmlnaHQ6LTdweDt0b3A6LTdweDtoZWlnaHQ6ODdweDtkaXNwbGF5OmJsb2NrO3BvaW50ZXItZXZlbnRzOm5vbmV9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWhlYWRlcntwb3NpdGlvbjpyZWxhdGl2ZTtkaXNwbGF5OmJsb2NrO292ZXJmbG93OmhpZGRlbjtoZWlnaHQ6MTAwcHg7YmFja2dyb3VuZC1jb2xvcjpfcHJpbWFyeTtib3JkZXItdG9wLWxlZnQtcmFkaXVzOjNweDtib3JkZXItdG9wLXJpZ2h0LXJhZGl1czozcHg7ei1pbmRleDoxO21hcmdpbjo3cHg7d2lkdGg6Y2FsYygxMDAlIC0gMTRweCk7cG9pbnRlci1ldmVudHM6YXV0bztib3gtc2hhZG93OjAgM3B4IDZweCByZ2JhKDAsMCwwLC4xNiksMCAzcHggNnB4IHJnYmEoMCwwLDAsLjIzKX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc3Bhbi1sYWJlbC1jb250YWluZXJ7cG9zaXRpb246YWJzb2x1dGU7bGVmdDo0MHB4O3JpZ2h0OjQwcHg7dG9wOjA7Ym90dG9tOjA7ZGlzcGxheTpibG9jaztvdmVyZmxvdzpoaWRkZW47dHJhbnNpdGlvbjouMnMgZWFzZSBhbGw7dHJhbnNmb3JtLW9yaWdpbjo0MHB4IDQwcHh9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXNwYW4tbGFiZWx7cG9zaXRpb246YWJzb2x1dGU7Zm9udC1zaXplOjE4cHQ7Y29sb3I6X3ByaW1hcnlfdGV4dDtmb250LXdlaWdodDo3MDA7dHJhbnNmb3JtLW9yaWdpbjowIDA7d2hpdGUtc3BhY2U6bm93cmFwO3RyYW5zaXRpb246YWxsIC4ycyBlYXNlO3RleHQtdHJhbnNmb3JtOnVwcGVyY2FzZX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc3Bhbi1sYWJlbC5kYXRpdW0tdG9we3RyYW5zZm9ybTp0cmFuc2xhdGVZKDE3cHgpIHNjYWxlKC42Nik7d2lkdGg6MTUxJTtvcGFjaXR5Oi42fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS1ib3R0b217dHJhbnNmb3JtOnRyYW5zbGF0ZVkoMzZweCkgc2NhbGUoMSk7d2lkdGg6MTAwJTtvcGFjaXR5OjF9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXNwYW4tbGFiZWwuZGF0aXVtLXRvcC5kYXRpdW0taGlkZGVue3RyYW5zZm9ybTp0cmFuc2xhdGVZKDVweCkgc2NhbGUoLjQpO29wYWNpdHk6MH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc3Bhbi1sYWJlbC5kYXRpdW0tYm90dG9tLmRhdGl1bS1oaWRkZW57dHJhbnNmb3JtOnRyYW5zbGF0ZVkoNzhweCkgc2NhbGUoMS4yKTtvcGFjaXR5Oi41fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1zcGFuLWxhYmVsOmFmdGVye2NvbnRlbnQ6Jyc7ZGlzcGxheTppbmxpbmUtYmxvY2s7cG9zaXRpb246YWJzb2x1dGU7bWFyZ2luLWxlZnQ6MTBweDttYXJnaW4tdG9wOjZweDtoZWlnaHQ6MTdweDt3aWR0aDoxN3B4O29wYWNpdHk6MDt0cmFuc2l0aW9uOmFsbCAuMnMgZWFzZTtiYWNrZ3JvdW5kOnVybChkYXRhOmltYWdlL3N2Zyt4bWw7dXRmOCwlM0NzdmclMjB4bWxucyUzRCUyMmh0dHAlM0ElMkYlMkZ3d3cudzMub3JnJTJGMjAwMCUyRnN2ZyUyMiUzRSUzQ2clMjBmaWxsJTNEJTIyX3ByaW1hcnlfdGV4dCUyMiUzRSUzQ3BhdGglMjBkJTNEJTIyTTE3JTIwMTVsLTIlMjAyLTUtNSUyMDItMnolMjIlMjBmaWxsLXJ1bGUlM0QlMjJldmVub2RkJTIyJTJGJTNFJTNDcGF0aCUyMGQlM0QlMjJNNyUyMDBhNyUyMDclMjAwJTIwMCUyMDAtNyUyMDclMjA3JTIwNyUyMDAlMjAwJTIwMCUyMDclMjA3JTIwNyUyMDclMjAwJTIwMCUyMDAlMjA3LTclMjA3JTIwNyUyMDAlMjAwJTIwMC03LTd6bTAlMjAyYTUlMjA1JTIwMCUyMDAlMjAxJTIwNSUyMDUlMjA1JTIwNSUyMDAlMjAwJTIwMS01JTIwNSUyMDUlMjA1JTIwMCUyMDAlMjAxLTUtNSUyMDUlMjA1JTIwMCUyMDAlMjAxJTIwNS01eiUyMiUyRiUzRSUzQ3BhdGglMjBkJTNEJTIyTTQlMjA2aDZ2Mkg0eiUyMiUyRiUzRSUzQyUyRmclM0UlM0MlMkZzdmclM0UpfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS10b3A6YWZ0ZXJ7b3BhY2l0eToxfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1zcGFuLWxhYmVsIGRhdGl1bS12YXJpYWJsZXtjb2xvcjpfcHJpbWFyeTtmb250LXNpemU6MTRwdDtwYWRkaW5nOjAgNHB4O21hcmdpbjowIDJweDt0b3A6LTJweDtwb3NpdGlvbjpyZWxhdGl2ZX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc3Bhbi1sYWJlbCBkYXRpdW0tdmFyaWFibGU6YmVmb3Jle2NvbnRlbnQ6Jyc7cG9zaXRpb246YWJzb2x1dGU7bGVmdDowO3RvcDowO3JpZ2h0OjA7Ym90dG9tOjA7Ym9yZGVyLXJhZGl1czo1cHg7YmFja2dyb3VuZC1jb2xvcjpfcHJpbWFyeV90ZXh0O3otaW5kZXg6LTE7b3BhY2l0eTouN31kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbmV4dCxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcHJldntwb3NpdGlvbjphYnNvbHV0ZTt3aWR0aDo0MHB4O3RvcDowO2JvdHRvbTowO3RyYW5zZm9ybS1vcmlnaW46MjBweCA1MnB4fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1uZXh0OmFmdGVyLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1uZXh0OmJlZm9yZSxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcHJldjphZnRlcixkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcHJldjpiZWZvcmV7Y29udGVudDonJztwb3NpdGlvbjphYnNvbHV0ZTtkaXNwbGF5OmJsb2NrO3dpZHRoOjNweDtoZWlnaHQ6OHB4O2xlZnQ6NTAlO2JhY2tncm91bmQtY29sb3I6X3ByaW1hcnlfdGV4dDt0b3A6NDhweH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbmV4dC5kYXRpdW0tYWN0aXZlLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1wcmV2LmRhdGl1bS1hY3RpdmV7dHJhbnNmb3JtOnNjYWxlKC45KTtvcGFjaXR5Oi45fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1wcmV2e2xlZnQ6MH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcHJldjphZnRlcixkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcHJldjpiZWZvcmV7bWFyZ2luLWxlZnQ6LTNweH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbmV4dHtyaWdodDowfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1wcmV2OmJlZm9yZXt0cmFuc2Zvcm06cm90YXRlKDQ1ZGVnKSB0cmFuc2xhdGVZKC0yLjZweCl9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXByZXY6YWZ0ZXJ7dHJhbnNmb3JtOnJvdGF0ZSgtNDVkZWcpIHRyYW5zbGF0ZVkoMi42cHgpfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1uZXh0OmJlZm9yZXt0cmFuc2Zvcm06cm90YXRlKDQ1ZGVnKSB0cmFuc2xhdGVZKDIuNnB4KX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbmV4dDphZnRlcnt0cmFuc2Zvcm06cm90YXRlKC00NWRlZykgdHJhbnNsYXRlWSgtMi42cHgpfWRhdGl1bS1jb250YWluZXIuX2lke2Rpc3BsYXk6YmxvY2s7cG9zaXRpb246YWJzb2x1dGU7d2lkdGg6MjgwcHg7Zm9udC1mYW1pbHk6Um9ib3RvLEFyaWFsO21hcmdpbi10b3A6MnB4fWRhdGl1bS1jb250YWluZXIuX2lkLGRhdGl1bS1jb250YWluZXIuX2lkICp7LXdlYmtpdC10b3VjaC1jYWxsb3V0Om5vbmU7LXdlYmtpdC11c2VyLXNlbGVjdDpub25lOy1raHRtbC11c2VyLXNlbGVjdDpub25lOy1tb3otdXNlci1zZWxlY3Q6bm9uZTstbXMtdXNlci1zZWxlY3Q6bm9uZTstd2Via2l0LXRhcC1oaWdobGlnaHQtY29sb3I6dHJhbnNwYXJlbnQ7Y3Vyc29yOmRlZmF1bHR9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci1jb250YWluZXItd3JhcHBlcntvdmVyZmxvdzpoaWRkZW47cG9zaXRpb246YWJzb2x1dGU7bGVmdDotN3B4O3JpZ2h0Oi03cHg7dG9wOjgwcHg7aGVpZ2h0OjI3MHB4O2Rpc3BsYXk6YmxvY2s7cG9pbnRlci1ldmVudHM6bm9uZX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLWNvbnRhaW5lcntwb3NpdGlvbjpyZWxhdGl2ZTt3aWR0aDpjYWxjKDEwMCUgLSAxNHB4KTtoZWlnaHQ6MjYwcHg7YmFja2dyb3VuZC1jb2xvcjpfc2Vjb25kYXJ5O2Rpc3BsYXk6YmxvY2s7bWFyZ2luOjAgN3B4IDdweDtwYWRkaW5nLXRvcDoyMHB4O2JveC1zaGFkb3c6MCAzcHggNnB4IHJnYmEoMCwwLDAsLjE2KSwwIDNweCA2cHggcmdiYSgwLDAsMCwuMjMpO3RyYW5zZm9ybTp0cmFuc2xhdGVZKC0yNzBweCk7cG9pbnRlci1ldmVudHM6YXV0bztib3JkZXItYm90dG9tLXJpZ2h0LXJhZGl1czozcHg7Ym9yZGVyLWJvdHRvbS1sZWZ0LXJhZGl1czozcHg7dHJhbnNpdGlvbjphbGwgZWFzZSAuMnM7b3ZlcmZsb3c6aGlkZGVufWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXJ7cG9zaXRpb246YWJzb2x1dGU7bGVmdDowO3JpZ2h0OjA7Ym90dG9tOjA7Y29sb3I6X3NlY29uZGFyeV90ZXh0O3RyYW5zaXRpb246LjRzIGVhc2UgYWxsfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLXBpY2tlci1sZWZ0e3RyYW5zZm9ybTp0cmFuc2xhdGVYKC0xMDAlKTtwb2ludGVyLWV2ZW50czpub25lO29wYWNpdHk6MH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1waWNrZXItcmlnaHR7dHJhbnNmb3JtOnRyYW5zbGF0ZVgoMTAwJSk7cG9pbnRlci1ldmVudHM6bm9uZTtvcGFjaXR5OjB9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tcGlja2VyLWlue3RyYW5zZm9ybTpzY2FsZSguOCk7cG9pbnRlci1ldmVudHM6bm9uZTtvcGFjaXR5OjB9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tcGlja2VyLW91dHt0cmFuc2Zvcm06c2NhbGUoMS4yKTtwb2ludGVyLWV2ZW50czpub25lO29wYWNpdHk6MH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0teWVhci1lbGVtZW50e2Rpc3BsYXk6aW5saW5lLWJsb2NrO3dpZHRoOjI1JTtsaW5lLWhlaWdodDo2MHB4O3RleHQtYWxpZ246Y2VudGVyfVwiOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
