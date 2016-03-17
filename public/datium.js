(function(){
window['Datium'] = (function () {
    function Datium(element, options) {
        var internals = new DatiumInternals(element, options);
        this.updateOptions = function (options) { return internals.updateOptions(options); };
    }
    return Datium;
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
        this.pickerManager = new PickerManager(element);
        this.updateOptions(options);
        listen.goto(element, function (e) { return _this.goto(e.date, e.level); });
        this.goto(this.options['defaultDate'], 6 /* NONE */);
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
        this.pickerManager.updateOptions(this.options, this.input.getLevels());
    };
    return DatiumInternals;
})();
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
    PlainText.prototype.getLevel = function () { return 6 /* NONE */; };
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
            return /^-?\d{1,2}$/;
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
            return 1 /* MONTH */;
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
            return 2 /* DATE */;
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
            return 2 /* DATE */;
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
            return 3 /* HOUR */;
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
            return 4 /* MINUTE */;
        };
        PaddedMinute.prototype.toString = function () {
            return this.pad(this.date.getMinutes());
        };
        return PaddedMinute;
    })(DatePart);
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
    })(PaddedMinute);
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
    })(DatePart);
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
    })(PaddedSecond);
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
        listen.viewchanged(element, function (e) { return _this.viewchanged(e.date, e.level); });
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
    Input.prototype.viewchanged = function (date, level) {
        this.dateParts.forEach(function (datePart) {
            datePart.setValue(date);
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
var DatePicker = (function () {
    function DatePicker() {
    }
    return DatePicker;
})();
var Header = (function () {
    function Header(element, container) {
        var _this = this;
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
    }
    Header.prototype.viewchanged = function (date, level) {
        var _this = this;
        this.labels.forEach(function (label, i) {
            label.classList.remove('datium-top');
            label.classList.remove('datium-bottom');
            label.classList.remove('datium-hidden');
            if (i < level) {
                label.classList.add('datium-top');
                label.innerHTML = _this.getHeaderTopText(date, i);
            }
            else {
                label.classList.add('datium-bottom');
                label.innerHTML = _this.getHeaderBottomText(date, i);
            }
            if (i < level - 1 || i > level) {
                label.classList.add('datium-hidden');
            }
        });
    };
    // genreAL USE?
    Header.prototype.getMonth = function (date) {
        return ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][date.getMonth()];
    };
    // genreAL USE?
    Header.prototype.getDay = function (date) {
        return ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][date.getDay()];
    };
    Header.prototype.getHeaderTopText = function (date, level) {
        switch (level) {
            case 0 /* YEAR */:
                return this.getDecade(date);
            case 1 /* MONTH */:
                return date.getFullYear().toString();
            case 2 /* DATE */:
                return this.getMonth(date) + " " + date.getFullYear();
            case 3 /* HOUR */:
            case 4 /* MINUTE */:
                return this.getDay(date) + " " + this.pad(date.getDate()) + " " + this.getMonth(date) + " " + date.getFullYear();
        }
    };
    // genreAL USE?
    Header.prototype.pad = function (num, size) {
        if (size === void 0) { size = 2; }
        var str = num.toString();
        while (str.length < size)
            str = '0' + str;
        return str;
    };
    // general use?
    Header.prototype.getDecade = function (date) {
        return Math.floor(date.getFullYear() / 10) * 10 + " - " + Math.ceil((date.getFullYear() + 1) / 10) * 10;
    };
    // general use?
    Header.prototype.getHours = function (date) {
        var num = date.getHours();
        if (num === 0)
            num = 12;
        if (num > 12)
            num -= 12;
        return num.toString();
    };
    // general use?
    Header.prototype.getMeridiem = function (date) {
        return date.getHours() < 12 ? 'AM' : 'PM';
    };
    Header.prototype.getHeaderBottomText = function (date, level) {
        switch (level) {
            case 0 /* YEAR */:
                return this.getDecade(date);
            case 1 /* MONTH */:
                return date.getFullYear().toString();
            case 2 /* DATE */:
                return this.getMonth(date);
            case 3 /* HOUR */:
                return this.getDay(date) + " " + this.pad(date.getDate()) + " <datium-variable>" + this.getHours(date) + this.getMeridiem(date) + "</datium-variable>";
            case 4 /* MINUTE */:
                return this.getHours(date) + ":<datium-variable>" + this.pad(date.getMinutes()) + "</datium-variable>" + this.getMeridiem(date);
            case 5 /* SECOND */:
                return this.getHours(date) + ":" + this.pad(date.getMinutes()) + ":<datium-variable>" + this.pad(date.getSeconds()) + "</datium-variable>" + this.getMeridiem(date);
        }
    };
    Header.prototype.updateOptions = function (options) {
        this.options = options;
    };
    return Header;
})();
var HourPicker = (function () {
    function HourPicker() {
    }
    return HourPicker;
})();
var MinutePicker = (function () {
    function MinutePicker() {
    }
    return MinutePicker;
})();
var MonthPicker = (function () {
    function MonthPicker() {
    }
    return MonthPicker;
})();
var PickerManager = (function () {
    function PickerManager(element) {
        var _this = this;
        this.element = element;
        this.container = this.createView();
        this.insertAfter(element, this.container);
        this.header = new Header(element, this.container);
        listen.viewchanged(element, function (e) { return _this.viewchanged(e.date, e.level); });
        listen.down(this.container, '*', function (e) { return _this.down(e); });
        listen.up(document, function () { return _this.up(); });
    }
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
    PickerManager.prototype.viewchanged = function (date, level) {
        if (this.pickers[level] === void 0)
            return; // close the picker
        this.currentPicker = this.pickers[level];
    };
    PickerManager.prototype.updateOptions = function (options, levels) {
        var _this = this;
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
        this.pickers = [];
        levels.forEach(function (level) {
            switch (level) {
                case 0 /* YEAR */:
                    _this.pickers[0 /* YEAR */] = new YearPicker();
                    break;
                case 1 /* MONTH */:
                    _this.pickers[1 /* MONTH */] = new MonthPicker();
                    break;
                case 2 /* DATE */:
                    _this.pickers[2 /* DATE */] = new DatePicker();
                    break;
                case 3 /* HOUR */:
                    _this.pickers[3 /* HOUR */] = new HourPicker();
                    break;
                case 4 /* MINUTE */:
                    _this.pickers[4 /* MINUTE */] = new MinutePicker();
                    break;
                case 5 /* SECOND */:
                    _this.pickers[5 /* SECOND */] = new SecondPicker();
                    break;
            }
        });
    };
    PickerManager.prototype.createView = function () {
        var el = document.createElement('datium-container');
        el.innerHTML = header + '<datium-picker-container></datium-picker-container>';
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
})();
var SecondPicker = (function () {
    function SecondPicker() {
    }
    return SecondPicker;
})();
var YearPicker = (function () {
    function YearPicker() {
    }
    return YearPicker;
})();
var header = "<datium-header> <datium-span-label-container> <datium-span-label class='datium-year'></datium-span-label> <datium-span-label class='datium-month'></datium-span-label> <datium-span-label class='datium-date'></datium-span-label> <datium-span-label class='datium-hour'></datium-span-label> <datium-span-label class='datium-minute'></datium-span-label> <datium-span-label class='datium-second'></datium-span-label> </datium-span-label-container> <datium-prev></datium-prev> <datium-next></datium-next> </datium-header>";
var css = "@font-face{font-family:Roboto;font-style:normal;font-weight:400;src:local('Roboto'),local('Roboto-Regular'),url(https://fonts.gstatic.com/s/roboto/v15/CWB0XYA8bzo0kSThX0UTuA.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2212,U+2215,U+E0FF,U+EFFD,U+F000}@font-face{font-family:Roboto;font-style:normal;font-weight:700;src:local('Roboto Bold'),local('Roboto-Bold'),url(https://fonts.gstatic.com/s/roboto/v15/d-6IYplOFocCacKzxwXSOFtXRa8TVwTICgirnJhmVJw.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2212,U+2215,U+E0FF,U+EFFD,U+F000}datium-container._id datium-header{position:relative;display:block;overflow:hidden;width:100%;height:80px;background-color:_primary;border-top-left-radius:3px;border-top-right-radius:3px;margin-bottom:5px}datium-container._id datium-span-label-container{position:absolute;left:40px;right:40px;top:0;bottom:0;display:block;overflow:hidden;transition:.2s ease all}datium-container._id datium-span-label{position:absolute;font-size:18pt;color:_primary_text;font-weight:700;transform-origin:0 0;white-space:nowrap;transition:all .2s ease}datium-container._id datium-span-label.datium-top{transform:translateY(17px) scale(.66);width:151%;opacity:.6}datium-container._id datium-span-label.datium-bottom{transform:translateY(36px) scale(1);width:100%;opacity:1}datium-container._id datium-span-label.datium-top.datium-hidden{transform:translateY(5px) scale(.4);opacity:0}datium-container._id datium-span-label.datium-bottom.datium-hidden{transform:translateY(78px) scale(1.2)}datium-container._id datium-span-label:after{content:'';display:inline-block;position:absolute;margin-left:10px;margin-top:6px;height:17px;width:17px;opacity:0;transition:all .2s ease;background:url(data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22_primary_text%22%3E%3Cpath%20d%3D%22M17%2015l-2%202-5-5%202-2z%22%20fill-rule%3D%22evenodd%22%2F%3E%3Cpath%20d%3D%22M7%200a7%207%200%200%200-7%207%207%207%200%200%200%207%207%207%207%200%200%200%207-7%207%207%200%200%200-7-7zm0%202a5%205%200%200%201%205%205%205%205%200%200%201-5%205%205%205%200%200%201-5-5%205%205%200%200%201%205-5z%22%2F%3E%3Cpath%20d%3D%22M4%206h6v2H4z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E)}datium-container._id datium-span-label.datium-top:after{opacity:1}datium-container._id datium-span-label datium-variable{color:_primary;font-size:14pt;padding:0 4px;margin:0 2px;top:-2px;position:relative}datium-container._id datium-span-label datium-variable:before{content:'';position:absolute;left:0;top:0;right:0;bottom:0;border-radius:5px;background-color:_primary_text;z-index:-1;opacity:.7}datium-container._id datium-next,datium-container._id datium-prev{position:absolute;width:40px;top:0;bottom:0;transform-origin:20px 52px}datium-container._id datium-next:after,datium-container._id datium-next:before,datium-container._id datium-prev:after,datium-container._id datium-prev:before{content:'';position:absolute;display:block;width:3px;height:8px;left:50%;background-color:_primary_text;top:48px}datium-container._id datium-next.datium-active,datium-container._id datium-prev.datium-active{transform:scale(.9);opacity:.9}datium-container._id datium-prev{left:0}datium-container._id datium-prev:after,datium-container._id datium-prev:before{margin-left:-3px}datium-container._id datium-next{right:0}datium-container._id datium-prev:before{transform:rotate(45deg) translateY(-3px)}datium-container._id datium-prev:after{transform:rotate(-45deg) translateY(3px)}datium-container._id datium-next:before{transform:rotate(45deg) translateY(3px)}datium-container._id datium-next:after{transform:rotate(-45deg) translateY(-3px)}datium-container._id{display:block;position:absolute;border-radius:3px;width:280px;box-shadow:0 10px 20px rgba(0,0,0,.19),0 6px 6px rgba(0,0,0,.23);font-family:Roboto}datium-container._id,datium-container._id *{-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;-webkit-tap-highlight-color:transparent;cursor:default}";
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRhdGl1bS50cyIsIkRhdGl1bUludGVybmFscy50cyIsIk9wdGlvblNhbml0aXplci50cyIsImNvbW1vbi9DdXN0b21FdmVudFBvbHlmaWxsLnRzIiwiY29tbW9uL0V2ZW50cy50cyIsImlucHV0L0RhdGVQYXJ0cy50cyIsImlucHV0L0lucHV0LnRzIiwiaW5wdXQvS2V5Ym9hcmRFdmVudEhhbmRsZXIudHMiLCJpbnB1dC9Nb3VzZUV2ZW50SGFuZGxlci50cyIsImlucHV0L1BhcnNlci50cyIsImlucHV0L1Bhc3RlRXZlbnRIYW5kbGVyLnRzIiwicGlja2VyL0RhdGVQaWNrZXIudHMiLCJwaWNrZXIvSGVhZGVyLnRzIiwicGlja2VyL0hvdXJQaWNrZXIudHMiLCJwaWNrZXIvTWludXRlUGlja2VyLnRzIiwicGlja2VyL01vbnRoUGlja2VyLnRzIiwicGlja2VyL1BpY2tlck1hbmFnZXIudHMiLCJwaWNrZXIvU2Vjb25kUGlja2VyLnRzIiwicGlja2VyL1llYXJQaWNrZXIudHMiLCJwaWNrZXIvaHRtbC9oZWFkZXIudHMiLCJwaWNrZXIvc3R5bGVzL2Nzcy50cyJdLCJuYW1lcyI6WyJjb25zdHJ1Y3RvciIsIkRhdGl1bUludGVybmFscyIsIkRhdGl1bUludGVybmFscy5jb25zdHJ1Y3RvciIsIkRhdGl1bUludGVybmFscy5nb3RvIiwiRGF0aXVtSW50ZXJuYWxzLnVwZGF0ZU9wdGlvbnMiLCJPcHRpb25FeGNlcHRpb24iLCJPcHRpb25TYW5pdGl6ZXIiLCJPcHRpb25TYW5pdGl6ZXIuY29uc3RydWN0b3IiLCJPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVEaXNwbGF5QXMiLCJPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVNaW5EYXRlIiwiT3B0aW9uU2FuaXRpemVyLnNhbml0aXplTWF4RGF0ZSIsIk9wdGlvblNhbml0aXplci5zYW5pdGl6ZURlZmF1bHREYXRlIiwiT3B0aW9uU2FuaXRpemVyLnNhbml0aXplQ29sb3IiLCJPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVUaGVtZSIsIk9wdGlvblNhbml0aXplci5zYW5pdGl6ZSIsInVzZU5hdGl2ZSIsImxpc3RlbiIsImxpc3Rlbi5oYW5kbGVEZWxlZ2F0ZUV2ZW50IiwibGlzdGVuLmF0dGFjaEV2ZW50c0RlbGVnYXRlIiwibGlzdGVuLmF0dGFjaEV2ZW50cyIsImxpc3Rlbi5mb2N1cyIsImxpc3Rlbi5kb3duIiwibGlzdGVuLnVwIiwibGlzdGVuLm1vdXNlZG93biIsImxpc3Rlbi5tb3VzZXVwIiwibGlzdGVuLnBhc3RlIiwibGlzdGVuLmdvdG8iLCJsaXN0ZW4udmlld2NoYW5nZWQiLCJsaXN0ZW4ucmVtb3ZlTGlzdGVuZXJzIiwidHJpZ2dlciIsInRyaWdnZXIuZ290byIsInRyaWdnZXIudmlld2NoYW5nZWQiLCJQbGFpblRleHQiLCJQbGFpblRleHQuY29uc3RydWN0b3IiLCJQbGFpblRleHQuaW5jcmVtZW50IiwiUGxhaW5UZXh0LmRlY3JlbWVudCIsIlBsYWluVGV4dC5zZXRWYWx1ZUZyb21QYXJ0aWFsIiwiUGxhaW5UZXh0LnNldFZhbHVlIiwiUGxhaW5UZXh0LmdldFZhbHVlIiwiUGxhaW5UZXh0LmdldFJlZ0V4IiwiUGxhaW5UZXh0LnNldFNlbGVjdGFibGUiLCJQbGFpblRleHQuZ2V0TWF4QnVmZmVyIiwiUGxhaW5UZXh0LmdldExldmVsIiwiUGxhaW5UZXh0LmlzU2VsZWN0YWJsZSIsIlBsYWluVGV4dC50b1N0cmluZyIsIkRhdGVQYXJ0IiwiRGF0ZVBhcnQuY29uc3RydWN0b3IiLCJEYXRlUGFydC5nZXRWYWx1ZSIsIkRhdGVQYXJ0LnNldFNlbGVjdGFibGUiLCJEYXRlUGFydC5pc1NlbGVjdGFibGUiLCJEYXRlUGFydC5wYWQiLCJEYXRlUGFydC50cmltIiwiRm91ckRpZ2l0WWVhciIsIkZvdXJEaWdpdFllYXIuY29uc3RydWN0b3IiLCJGb3VyRGlnaXRZZWFyLmluY3JlbWVudCIsIkZvdXJEaWdpdFllYXIuZGVjcmVtZW50IiwiRm91ckRpZ2l0WWVhci5zZXRWYWx1ZUZyb21QYXJ0aWFsIiwiRm91ckRpZ2l0WWVhci5zZXRWYWx1ZSIsIkZvdXJEaWdpdFllYXIuZ2V0UmVnRXgiLCJGb3VyRGlnaXRZZWFyLmdldE1heEJ1ZmZlciIsIkZvdXJEaWdpdFllYXIuZ2V0TGV2ZWwiLCJGb3VyRGlnaXRZZWFyLnRvU3RyaW5nIiwiVHdvRGlnaXRZZWFyIiwiVHdvRGlnaXRZZWFyLmNvbnN0cnVjdG9yIiwiVHdvRGlnaXRZZWFyLmdldE1heEJ1ZmZlciIsIlR3b0RpZ2l0WWVhci5zZXRWYWx1ZSIsIlR3b0RpZ2l0WWVhci5nZXRSZWdFeCIsIlR3b0RpZ2l0WWVhci50b1N0cmluZyIsIkxvbmdNb250aE5hbWUiLCJMb25nTW9udGhOYW1lLmNvbnN0cnVjdG9yIiwiTG9uZ01vbnRoTmFtZS5nZXRNb250aHMiLCJMb25nTW9udGhOYW1lLmluY3JlbWVudCIsIkxvbmdNb250aE5hbWUuZGVjcmVtZW50IiwiTG9uZ01vbnRoTmFtZS5zZXRWYWx1ZUZyb21QYXJ0aWFsIiwiTG9uZ01vbnRoTmFtZS5zZXRWYWx1ZSIsIkxvbmdNb250aE5hbWUuZ2V0UmVnRXgiLCJMb25nTW9udGhOYW1lLmdldE1heEJ1ZmZlciIsIkxvbmdNb250aE5hbWUuZ2V0TGV2ZWwiLCJMb25nTW9udGhOYW1lLnRvU3RyaW5nIiwiU2hvcnRNb250aE5hbWUiLCJTaG9ydE1vbnRoTmFtZS5jb25zdHJ1Y3RvciIsIlNob3J0TW9udGhOYW1lLmdldE1vbnRocyIsIk1vbnRoIiwiTW9udGguY29uc3RydWN0b3IiLCJNb250aC5nZXRNYXhCdWZmZXIiLCJNb250aC5zZXRWYWx1ZUZyb21QYXJ0aWFsIiwiTW9udGguc2V0VmFsdWUiLCJNb250aC5nZXRSZWdFeCIsIk1vbnRoLnRvU3RyaW5nIiwiUGFkZGVkTW9udGgiLCJQYWRkZWRNb250aC5jb25zdHJ1Y3RvciIsIlBhZGRlZE1vbnRoLnNldFZhbHVlRnJvbVBhcnRpYWwiLCJQYWRkZWRNb250aC5nZXRSZWdFeCIsIlBhZGRlZE1vbnRoLnRvU3RyaW5nIiwiRGF0ZU51bWVyYWwiLCJEYXRlTnVtZXJhbC5jb25zdHJ1Y3RvciIsIkRhdGVOdW1lcmFsLmRheXNJbk1vbnRoIiwiRGF0ZU51bWVyYWwuaW5jcmVtZW50IiwiRGF0ZU51bWVyYWwuZGVjcmVtZW50IiwiRGF0ZU51bWVyYWwuc2V0VmFsdWVGcm9tUGFydGlhbCIsIkRhdGVOdW1lcmFsLnNldFZhbHVlIiwiRGF0ZU51bWVyYWwuZ2V0UmVnRXgiLCJEYXRlTnVtZXJhbC5nZXRNYXhCdWZmZXIiLCJEYXRlTnVtZXJhbC5nZXRMZXZlbCIsIkRhdGVOdW1lcmFsLnRvU3RyaW5nIiwiUGFkZGVkRGF0ZSIsIlBhZGRlZERhdGUuY29uc3RydWN0b3IiLCJQYWRkZWREYXRlLnNldFZhbHVlRnJvbVBhcnRpYWwiLCJQYWRkZWREYXRlLmdldFJlZ0V4IiwiUGFkZGVkRGF0ZS50b1N0cmluZyIsIkRhdGVPcmRpbmFsIiwiRGF0ZU9yZGluYWwuY29uc3RydWN0b3IiLCJEYXRlT3JkaW5hbC5nZXRSZWdFeCIsIkRhdGVPcmRpbmFsLnRvU3RyaW5nIiwiTG9uZ0RheU5hbWUiLCJMb25nRGF5TmFtZS5jb25zdHJ1Y3RvciIsIkxvbmdEYXlOYW1lLmdldERheXMiLCJMb25nRGF5TmFtZS5pbmNyZW1lbnQiLCJMb25nRGF5TmFtZS5kZWNyZW1lbnQiLCJMb25nRGF5TmFtZS5zZXRWYWx1ZUZyb21QYXJ0aWFsIiwiTG9uZ0RheU5hbWUuc2V0VmFsdWUiLCJMb25nRGF5TmFtZS5nZXRSZWdFeCIsIkxvbmdEYXlOYW1lLmdldE1heEJ1ZmZlciIsIkxvbmdEYXlOYW1lLmdldExldmVsIiwiTG9uZ0RheU5hbWUudG9TdHJpbmciLCJTaG9ydERheU5hbWUiLCJTaG9ydERheU5hbWUuY29uc3RydWN0b3IiLCJTaG9ydERheU5hbWUuZ2V0RGF5cyIsIlBhZGRlZE1pbGl0YXJ5SG91ciIsIlBhZGRlZE1pbGl0YXJ5SG91ci5jb25zdHJ1Y3RvciIsIlBhZGRlZE1pbGl0YXJ5SG91ci5pbmNyZW1lbnQiLCJQYWRkZWRNaWxpdGFyeUhvdXIuZGVjcmVtZW50IiwiUGFkZGVkTWlsaXRhcnlIb3VyLnNldFZhbHVlRnJvbVBhcnRpYWwiLCJQYWRkZWRNaWxpdGFyeUhvdXIuc2V0VmFsdWUiLCJQYWRkZWRNaWxpdGFyeUhvdXIuZ2V0TWF4QnVmZmVyIiwiUGFkZGVkTWlsaXRhcnlIb3VyLmdldExldmVsIiwiUGFkZGVkTWlsaXRhcnlIb3VyLmdldFJlZ0V4IiwiUGFkZGVkTWlsaXRhcnlIb3VyLnRvU3RyaW5nIiwiTWlsaXRhcnlIb3VyIiwiTWlsaXRhcnlIb3VyLmNvbnN0cnVjdG9yIiwiTWlsaXRhcnlIb3VyLnNldFZhbHVlRnJvbVBhcnRpYWwiLCJNaWxpdGFyeUhvdXIuZ2V0UmVnRXgiLCJNaWxpdGFyeUhvdXIudG9TdHJpbmciLCJQYWRkZWRIb3VyIiwiUGFkZGVkSG91ci5jb25zdHJ1Y3RvciIsIlBhZGRlZEhvdXIuc2V0VmFsdWVGcm9tUGFydGlhbCIsIlBhZGRlZEhvdXIuc2V0VmFsdWUiLCJQYWRkZWRIb3VyLmdldFJlZ0V4IiwiUGFkZGVkSG91ci5nZXRNYXhCdWZmZXIiLCJQYWRkZWRIb3VyLnRvU3RyaW5nIiwiSG91ciIsIkhvdXIuY29uc3RydWN0b3IiLCJIb3VyLnNldFZhbHVlRnJvbVBhcnRpYWwiLCJIb3VyLmdldFJlZ0V4IiwiSG91ci50b1N0cmluZyIsIlBhZGRlZE1pbnV0ZSIsIlBhZGRlZE1pbnV0ZS5jb25zdHJ1Y3RvciIsIlBhZGRlZE1pbnV0ZS5pbmNyZW1lbnQiLCJQYWRkZWRNaW51dGUuZGVjcmVtZW50IiwiUGFkZGVkTWludXRlLnNldFZhbHVlRnJvbVBhcnRpYWwiLCJQYWRkZWRNaW51dGUuc2V0VmFsdWUiLCJQYWRkZWRNaW51dGUuZ2V0UmVnRXgiLCJQYWRkZWRNaW51dGUuZ2V0TWF4QnVmZmVyIiwiUGFkZGVkTWludXRlLmdldExldmVsIiwiUGFkZGVkTWludXRlLnRvU3RyaW5nIiwiTWludXRlIiwiTWludXRlLmNvbnN0cnVjdG9yIiwiTWludXRlLnNldFZhbHVlRnJvbVBhcnRpYWwiLCJNaW51dGUuZ2V0UmVnRXgiLCJNaW51dGUudG9TdHJpbmciLCJQYWRkZWRTZWNvbmQiLCJQYWRkZWRTZWNvbmQuY29uc3RydWN0b3IiLCJQYWRkZWRTZWNvbmQuaW5jcmVtZW50IiwiUGFkZGVkU2Vjb25kLmRlY3JlbWVudCIsIlBhZGRlZFNlY29uZC5zZXRWYWx1ZUZyb21QYXJ0aWFsIiwiUGFkZGVkU2Vjb25kLnNldFZhbHVlIiwiUGFkZGVkU2Vjb25kLmdldFJlZ0V4IiwiUGFkZGVkU2Vjb25kLmdldE1heEJ1ZmZlciIsIlBhZGRlZFNlY29uZC5nZXRMZXZlbCIsIlBhZGRlZFNlY29uZC50b1N0cmluZyIsIlNlY29uZCIsIlNlY29uZC5jb25zdHJ1Y3RvciIsIlNlY29uZC5zZXRWYWx1ZUZyb21QYXJ0aWFsIiwiU2Vjb25kLmdldFJlZ0V4IiwiU2Vjb25kLnRvU3RyaW5nIiwiVXBwZXJjYXNlTWVyaWRpZW0iLCJVcHBlcmNhc2VNZXJpZGllbS5jb25zdHJ1Y3RvciIsIlVwcGVyY2FzZU1lcmlkaWVtLmluY3JlbWVudCIsIlVwcGVyY2FzZU1lcmlkaWVtLmRlY3JlbWVudCIsIlVwcGVyY2FzZU1lcmlkaWVtLnNldFZhbHVlRnJvbVBhcnRpYWwiLCJVcHBlcmNhc2VNZXJpZGllbS5zZXRWYWx1ZSIsIlVwcGVyY2FzZU1lcmlkaWVtLmdldExldmVsIiwiVXBwZXJjYXNlTWVyaWRpZW0uZ2V0TWF4QnVmZmVyIiwiVXBwZXJjYXNlTWVyaWRpZW0uZ2V0UmVnRXgiLCJVcHBlcmNhc2VNZXJpZGllbS50b1N0cmluZyIsIkxvd2VyY2FzZU1lcmlkaWVtIiwiTG93ZXJjYXNlTWVyaWRpZW0uY29uc3RydWN0b3IiLCJMb3dlcmNhc2VNZXJpZGllbS50b1N0cmluZyIsIklucHV0IiwiSW5wdXQuY29uc3RydWN0b3IiLCJJbnB1dC5nZXRMZXZlbHMiLCJJbnB1dC5nZXRUZXh0QnVmZmVyIiwiSW5wdXQuc2V0VGV4dEJ1ZmZlciIsIklucHV0LnVwZGF0ZURhdGVGcm9tQnVmZmVyIiwiSW5wdXQuZ2V0Rmlyc3RTZWxlY3RhYmxlRGF0ZVBhcnQiLCJJbnB1dC5nZXRMYXN0U2VsZWN0YWJsZURhdGVQYXJ0IiwiSW5wdXQuZ2V0TmV4dFNlbGVjdGFibGVEYXRlUGFydCIsIklucHV0LmdldFByZXZpb3VzU2VsZWN0YWJsZURhdGVQYXJ0IiwiSW5wdXQuZ2V0TmVhcmVzdFNlbGVjdGFibGVEYXRlUGFydCIsIklucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQiLCJJbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0IiwiSW5wdXQudXBkYXRlT3B0aW9ucyIsIklucHV0LnVwZGF0ZVZpZXciLCJJbnB1dC52aWV3Y2hhbmdlZCIsIklucHV0LnRyaWdnZXJWaWV3Q2hhbmdlIiwiS2V5Ym9hcmRFdmVudEhhbmRsZXIiLCJLZXlib2FyZEV2ZW50SGFuZGxlci5jb25zdHJ1Y3RvciIsIktleWJvYXJkRXZlbnRIYW5kbGVyLmRvY3VtZW50S2V5ZG93biIsIktleWJvYXJkRXZlbnRIYW5kbGVyLmtleWRvd24iLCJLZXlib2FyZEV2ZW50SGFuZGxlci5ob21lIiwiS2V5Ym9hcmRFdmVudEhhbmRsZXIuZW5kIiwiS2V5Ym9hcmRFdmVudEhhbmRsZXIubGVmdCIsIktleWJvYXJkRXZlbnRIYW5kbGVyLnJpZ2h0IiwiS2V5Ym9hcmRFdmVudEhhbmRsZXIuc2hpZnRUYWIiLCJLZXlib2FyZEV2ZW50SGFuZGxlci50YWIiLCJLZXlib2FyZEV2ZW50SGFuZGxlci51cCIsIktleWJvYXJkRXZlbnRIYW5kbGVyLmRvd24iLCJNb3VzZUV2ZW50SGFuZGxlciIsIk1vdXNlRXZlbnRIYW5kbGVyLmNvbnN0cnVjdG9yIiwiTW91c2VFdmVudEhhbmRsZXIubW91c2Vkb3duIiwiUGFyc2VyIiwiUGFyc2VyLmNvbnN0cnVjdG9yIiwiUGFyc2VyLnBhcnNlIiwiUGFyc2VyLmZpbmRBdCIsIlBhc3RlRXZlbnRIYW5kZXIiLCJQYXN0ZUV2ZW50SGFuZGVyLmNvbnN0cnVjdG9yIiwiUGFzdGVFdmVudEhhbmRlci5wYXN0ZSIsIkRhdGVQaWNrZXIiLCJEYXRlUGlja2VyLmNvbnN0cnVjdG9yIiwiSGVhZGVyIiwiSGVhZGVyLmNvbnN0cnVjdG9yIiwiSGVhZGVyLnZpZXdjaGFuZ2VkIiwiSGVhZGVyLmdldE1vbnRoIiwiSGVhZGVyLmdldERheSIsIkhlYWRlci5nZXRIZWFkZXJUb3BUZXh0IiwiSGVhZGVyLnBhZCIsIkhlYWRlci5nZXREZWNhZGUiLCJIZWFkZXIuZ2V0SG91cnMiLCJIZWFkZXIuZ2V0TWVyaWRpZW0iLCJIZWFkZXIuZ2V0SGVhZGVyQm90dG9tVGV4dCIsIkhlYWRlci51cGRhdGVPcHRpb25zIiwiSG91clBpY2tlciIsIkhvdXJQaWNrZXIuY29uc3RydWN0b3IiLCJNaW51dGVQaWNrZXIiLCJNaW51dGVQaWNrZXIuY29uc3RydWN0b3IiLCJNb250aFBpY2tlciIsIk1vbnRoUGlja2VyLmNvbnN0cnVjdG9yIiwiUGlja2VyTWFuYWdlciIsIlBpY2tlck1hbmFnZXIuY29uc3RydWN0b3IiLCJQaWNrZXJNYW5hZ2VyLnVwIiwiUGlja2VyTWFuYWdlci5kb3duIiwiUGlja2VyTWFuYWdlci52aWV3Y2hhbmdlZCIsIlBpY2tlck1hbmFnZXIudXBkYXRlT3B0aW9ucyIsIlBpY2tlck1hbmFnZXIuY3JlYXRlVmlldyIsIlBpY2tlck1hbmFnZXIuaW5zZXJ0QWZ0ZXIiLCJQaWNrZXJNYW5hZ2VyLmluc2VydFN0eWxlcyIsIlBpY2tlck1hbmFnZXIuZ2V0RXhpc3RpbmdTdHlsZUlkIiwiU2Vjb25kUGlja2VyIiwiU2Vjb25kUGlja2VyLmNvbnN0cnVjdG9yIiwiWWVhclBpY2tlciIsIlllYXJQaWNrZXIuY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiJBQUFNLE1BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRztJQUV0QixnQkFBWSxPQUF3QixFQUFFLE9BQWdCO1FBQ2xEQSxJQUFJQSxTQUFTQSxHQUFHQSxJQUFJQSxlQUFlQSxDQUFDQSxPQUFPQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUN0REEsSUFBSUEsQ0FBQ0EsYUFBYUEsR0FBR0EsVUFBQ0EsT0FBZ0JBLElBQUtBLE9BQUFBLFNBQVNBLENBQUNBLGFBQWFBLENBQUNBLE9BQU9BLENBQUNBLEVBQWhDQSxDQUFnQ0EsQ0FBQ0E7SUFDaEZBLENBQUNBO0lBQ0wsYUFBQztBQUFELENBTjBCLEFBTXpCLEdBQUEsQ0FBQTtBQ0REO0lBTUlDLHlCQUFvQkEsT0FBd0JBLEVBQUVBLE9BQWdCQTtRQU5sRUMsaUJBMENDQTtRQXBDdUJBLFlBQU9BLEdBQVBBLE9BQU9BLENBQWlCQTtRQUxwQ0EsWUFBT0EsR0FBaUJBLEVBQUVBLENBQUNBO1FBTS9CQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxLQUFLQSxLQUFLQSxDQUFDQSxDQUFDQTtZQUFDQSxNQUFNQSxxQkFBcUJBLENBQUNBO1FBQ3BEQSxPQUFPQSxDQUFDQSxZQUFZQSxDQUFDQSxZQUFZQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUU1Q0EsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0EsSUFBSUEsS0FBS0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFDaENBLElBQUlBLENBQUNBLGFBQWFBLEdBQUdBLElBQUlBLGFBQWFBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO1FBRWhEQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUU1QkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsRUFBRUEsVUFBQ0EsQ0FBQ0EsSUFBS0EsT0FBQUEsS0FBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsRUFBMUJBLENBQTBCQSxDQUFDQSxDQUFDQTtRQUV4REEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsRUFBRUEsWUFBVUEsQ0FBQ0EsQ0FBQ0E7SUFDdkRBLENBQUNBO0lBRU1ELDhCQUFJQSxHQUFYQSxVQUFZQSxJQUFTQSxFQUFFQSxLQUFXQTtRQUM5QkUsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsSUFBSUEsR0FBR0EsSUFBSUEsSUFBSUEsRUFBRUEsQ0FBQ0E7UUFFdkNBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLEtBQUtBLEtBQUtBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLE9BQU9BLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO1lBQ3JGQSxJQUFJQSxHQUFHQSxJQUFJQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQSxDQUFDQTtRQUNwREEsQ0FBQ0E7UUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0EsS0FBS0EsS0FBS0EsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsT0FBT0EsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLEdBQUdBLElBQUlBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBLENBQUNBO1FBQ3BEQSxDQUFDQTtRQUVEQSxPQUFPQSxDQUFDQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxFQUFFQTtZQUM5QkEsSUFBSUEsRUFBRUEsSUFBSUE7WUFDVkEsS0FBS0EsRUFBRUEsS0FBS0E7U0FDZkEsQ0FBQ0EsQ0FBQ0E7SUFDUEEsQ0FBQ0E7SUFFTUYsdUNBQWFBLEdBQXBCQSxVQUFxQkEsVUFBNkJBO1FBQTdCRywwQkFBNkJBLEdBQTdCQSxhQUEyQkEsRUFBRUE7UUFDOUNBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLGVBQWVBLENBQUNBLFFBQVFBLENBQUNBLFVBQVVBLEVBQUVBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNB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QSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDNUJBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBLENBQUNBO2dCQUN0Q0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7WUFDaEJBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLEtBQUtBLEtBQUtBLFFBQVFBLElBQUlBLElBQUlBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUNsRUEsSUFBSUEsR0FBR0EsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3hDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxFQUFFQSxHQUFHQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxFQUFFQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQTtnQkFDbEVBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1lBQ2hCQSxDQUFDQTtZQUNEQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQTtRQUNqQkEsQ0FBQ0E7UUFFTU4sOEJBQVFBLEdBQWZBO1lBQ0lPLE1BQU1BLENBQUNBLElBQUlBLE1BQU1BLENBQUNBLFFBQU1BLElBQUlBLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLFFBQUtBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO1FBQ2xFQSxDQUFDQTtRQUVNUCxrQ0FBWUEsR0FBbkJBO1lBQ0lRLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLEVBQUNBLENBQUNBLEVBQUNBLENBQUNBLEVBQUNBLENBQUNBLEVBQUNBLENBQUNBLEVBQUNBLENBQUNBLEVBQUNBLENBQUNBLENBQUNB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S0FBS0EsV0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdENBLElBQUlBLENBQUNBLFlBQVlBLEdBQUdBLElBQUlBLENBQUNBO1FBQzdCQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxPQUFPQSxLQUFLQSxXQUFPQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMvQkEsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDeEJBLENBQUNBO1FBQ0RBLFVBQVVBLENBQUNBO1lBQ1BBLEtBQUlBLENBQUNBLFlBQVlBLEdBQUdBLEtBQUtBLENBQUNBO1lBQzFCQSxLQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUN6QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDUEEsQ0FBQ0E7SUFFT0Ysc0NBQU9BLEdBQWZBLFVBQWdCQSxDQUFlQTtRQUMzQkcsSUFBSUEsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0E7UUFDckJBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLElBQUlBLEVBQUVBLElBQUlBLElBQUlBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO1lBQzVCQSxJQUFJQSxJQUFJQSxFQUFFQSxDQUFDQTtRQUNmQSxDQUFDQTtRQUdEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxhQUFRQSxJQUFJQSxJQUFJQSxLQUFLQSxZQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQTtRQUNsRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsYUFBUUEsSUFBSUEsSUFBSUEsS0FBS0EsY0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0E7UUFDcEVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLFVBQUtBLElBQUlBLElBQUlBLEtBQUtBLFVBQUtBLElBQUlBLElBQUlBLEtBQUtBLFVBQUtBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBO1FBRTlFQSxJQUFJQSxjQUFjQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUUxQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsYUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDcEJBLElBQUlBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBO1FBQ2hCQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxZQUFPQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMxQkEsSUFBSUEsQ0FBQ0EsR0FBR0EsRUFBRUEsQ0FBQ0E7UUFDZkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsYUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDM0JBLElBQUlBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBO1FBQ2hCQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxjQUFTQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1QkEsSUFBSUEsQ0FBQ0EsS0FBS0EsRUFBRUEsQ0FBQ0E7UUFDakJBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLFdBQU9BLElBQUlBLENBQUNBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO1lBQ3hDQSxjQUFjQSxHQUFHQSxJQUFJQSxDQUFDQSxRQUFRQSxFQUFFQSxDQUFDQTtRQUNyQ0EsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsV0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDMUJBLGNBQWNBLEdBQUdBLElBQUlBLENBQUNBLEdBQUdBLEVBQUVBLENBQUNBO1FBQ2hDQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFD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YkEsQ0FBQ0E7WUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQWdCQSxJQUFJQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDNUNBLGdCQUFnQkEsR0FBR0EsS0FBS0EsQ0FBQ0E7Z0JBQ3pCQSxLQUFLQSxFQUFFQSxDQUFDQTtnQkFDUkEsUUFBUUEsQ0FBQ0E7WUFDYkEsQ0FBQ0E7WUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDbkJBLFVBQVVBLElBQUlBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO2dCQUM1QkEsS0FBS0EsRUFBRUEsQ0FBQ0E7Z0JBQ1JBLFFBQVFBLENBQUNBO1lBQ2JBLENBQUNBO1lBRURBLElBQUlBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBO1lBRWxCQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxJQUFJQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDNUJBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLEVBQUVBLEtBQUtBLEVBQUVBLE1BQUlBLElBQUlBLE1BQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO29CQUM1Q0EsYUFBYUEsRUFBRUEsQ0FBQ0E7b0JBQ2hCQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxZQUFZQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxhQUFhQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDOURBLEtBQUtBLElBQUlBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBO29CQUN6QkEsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0E7b0JBQ2JBLEtBQUtBLENBQUNBO2dCQUNWQSxDQUFDQTtnQkFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsRUFB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SUFBSUEsQ0FBQ0EsVUFBVUEsRUFBRUEsQ0FBQ0E7UUFFbkNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLE9BQU9BLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1FBRTFDQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFHQSxJQUFJQSxNQUFNQSxDQUFDQSxPQUFPQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtRQUVsREEsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsT0FBT0EsRUFBRUEsVUFBQ0EsQ0FBQ0EsSUFBS0EsT0FBQUEsS0FBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsRUFBakNBLENBQWlDQSxDQUFDQSxDQUFDQTtRQUV0RUEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsRUFBRUEsR0FBR0EsRUFBRUEsVUFBQ0EsQ0FBQ0EsSUFBS0EsT0FBQUEsS0FBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBWkEsQ0FBWUEsQ0FBQ0EsQ0FBQ0E7UUFDdERBLE1BQU1BLENBQUNBLEVBQUVBLENBQUNBLFFBQVFBLEVBQUVBLGNBQU1BLE9BQUFBLEtBQUlBLENBQUNBLEVBQUVBLEVBQUVBLEVBQVRBLENBQVNBLENBQUNBLENBQUNBO0lBQ3pDQSxDQUFDQTtJQUVPRCwwQkFBRUEsR0FBVkE7UUFDSUUsSUFBSUEsY0FBY0EsR0FBR0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxnQkFBZ0JBLENBQUNBLENBQUNBO1FBQ3ZFQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxjQUFjQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQTtZQUM3Q0EsY0FBY0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFB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QUFDQTtnQkFDN0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzVDQSxDQUFDQTtRQUNMQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtJQUNoQkEsQ0FBQ0E7SUF2Q01ULDRCQUFjQSxHQUFVQSxDQUFDQSxDQUFDQTtJQXdDckNBLG9CQUFDQTtBQUFEQSxDQXRJQSxBQXNJQ0EsSUFBQTtBQ3RJRDtJQUFBVTtJQUVBQyxDQUFDQTtJQUFERCxtQkFBQ0E7QUFBREEsQ0FGQSxBQUVDQSxJQUFBO0FDRkQ7SUFBQUU7SUFFQUMsQ0FBQ0E7SUFBREQsaUJBQUNBO0FBQURBLENBRkEsQUFFQ0EsSUFBQTtBQ0ZELElBQUksTUFBTSxHQUFHLG9nQkFBb2dCLENBQUM7QUNBbGhCLElBQUksR0FBRyxHQUFDLG9rSUFBb2tJLENBQUMiLCJmaWxlIjoiZGF0aXVtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKDxhbnk+d2luZG93KVsnRGF0aXVtJ10gPSBjbGFzcyBEYXRpdW0ge1xyXG4gICAgcHVibGljIHVwZGF0ZU9wdGlvbnM6KG9wdGlvbnM6SU9wdGlvbnMpID0+IHZvaWQ7XHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OkhUTUxJbnB1dEVsZW1lbnQsIG9wdGlvbnM6SU9wdGlvbnMpIHtcclxuICAgICAgICBsZXQgaW50ZXJuYWxzID0gbmV3IERhdGl1bUludGVybmFscyhlbGVtZW50LCBvcHRpb25zKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZU9wdGlvbnMgPSAob3B0aW9uczpJT3B0aW9ucykgPT4gaW50ZXJuYWxzLnVwZGF0ZU9wdGlvbnMob3B0aW9ucyk7XHJcbiAgICB9XHJcbn0iLCJjb25zdCBlbnVtIExldmVsIHtcclxuICAgIFlFQVIsIE1PTlRILCBEQVRFLCBIT1VSLFxyXG4gICAgTUlOVVRFLCBTRUNPTkQsIE5PTkVcclxufVxyXG5cclxuY2xhc3MgRGF0aXVtSW50ZXJuYWxzIHtcclxuICAgIHByaXZhdGUgb3B0aW9uczpJT3B0aW9ucyA9IDxhbnk+e307XHJcbiAgICBcclxuICAgIHByaXZhdGUgaW5wdXQ6SW5wdXQ7XHJcbiAgICBwcml2YXRlIHBpY2tlck1hbmFnZXI6UGlja2VyTWFuYWdlcjtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBlbGVtZW50OkhUTUxJbnB1dEVsZW1lbnQsIG9wdGlvbnM6SU9wdGlvbnMpIHtcclxuICAgICAgICBpZiAoZWxlbWVudCA9PT0gdm9pZCAwKSB0aHJvdyAnZWxlbWVudCBpcyByZXF1aXJlZCc7XHJcbiAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3NwZWxsY2hlY2snLCAnZmFsc2UnKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmlucHV0ID0gbmV3IElucHV0KGVsZW1lbnQpO1xyXG4gICAgICAgIHRoaXMucGlja2VyTWFuYWdlciA9IG5ldyBQaWNrZXJNYW5hZ2VyKGVsZW1lbnQpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMudXBkYXRlT3B0aW9ucyhvcHRpb25zKTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4uZ290byhlbGVtZW50LCAoZSkgPT4gdGhpcy5nb3RvKGUuZGF0ZSwgZS5sZXZlbCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuZ290byh0aGlzLm9wdGlvbnNbJ2RlZmF1bHREYXRlJ10sIExldmVsLk5PTkUpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ290byhkYXRlOkRhdGUsIGxldmVsOkxldmVsKSB7XHJcbiAgICAgICAgaWYgKGRhdGUgPT09IHZvaWQgMCkgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5taW5EYXRlICE9PSB2b2lkIDAgJiYgZGF0ZS52YWx1ZU9mKCkgPCB0aGlzLm9wdGlvbnMubWluRGF0ZS52YWx1ZU9mKCkpIHtcclxuICAgICAgICAgICAgZGF0ZSA9IG5ldyBEYXRlKHRoaXMub3B0aW9ucy5taW5EYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMubWF4RGF0ZSAhPT0gdm9pZCAwICYmIGRhdGUudmFsdWVPZigpID4gdGhpcy5vcHRpb25zLm1heERhdGUudmFsdWVPZigpKSB7XHJcbiAgICAgICAgICAgIGRhdGUgPSBuZXcgRGF0ZSh0aGlzLm9wdGlvbnMubWF4RGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB0cmlnZ2VyLnZpZXdjaGFuZ2VkKHRoaXMuZWxlbWVudCwge1xyXG4gICAgICAgICAgICBkYXRlOiBkYXRlLFxyXG4gICAgICAgICAgICBsZXZlbDogbGV2ZWxcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHVwZGF0ZU9wdGlvbnMobmV3T3B0aW9uczpJT3B0aW9ucyA9IDxhbnk+e30pIHtcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemUobmV3T3B0aW9ucywgdGhpcy5vcHRpb25zKTsgICAgICAgIFxyXG4gICAgICAgIHRoaXMuaW5wdXQudXBkYXRlT3B0aW9ucyh0aGlzLm9wdGlvbnMpO1xyXG4gICAgICAgIHRoaXMucGlja2VyTWFuYWdlci51cGRhdGVPcHRpb25zKHRoaXMub3B0aW9ucywgdGhpcy5pbnB1dC5nZXRMZXZlbHMoKSk7XHJcbiAgICB9XHJcbn0iLCJmdW5jdGlvbiBPcHRpb25FeGNlcHRpb24obXNnOnN0cmluZykge1xyXG4gICAgcmV0dXJuIGBbRGF0aXVtIE9wdGlvbiBFeGNlcHRpb25dXFxuICAke21zZ31cXG4gIFNlZSBodHRwOi8vZGF0aXVtLmlvL2RvY3VtZW50YXRpb24gZm9yIGRvY3VtZW50YXRpb24uYDtcclxufVxyXG5cclxuY2xhc3MgT3B0aW9uU2FuaXRpemVyIHtcclxuICAgIFxyXG4gICAgc3RhdGljIGRmbHREYXRlOkRhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgXHJcbiAgICBzdGF0aWMgc2FuaXRpemVEaXNwbGF5QXMoZGlzcGxheUFzOmFueSwgZGZsdDpzdHJpbmcgPSAnaDptbWEgTU1NIEQsIFlZWVknKSB7XHJcbiAgICAgICAgaWYgKGRpc3BsYXlBcyA9PT0gdm9pZCAwKSByZXR1cm4gZGZsdDtcclxuICAgICAgICBpZiAodHlwZW9mIGRpc3BsYXlBcyAhPT0gJ3N0cmluZycpIHRocm93IE9wdGlvbkV4Y2VwdGlvbignVGhlIFwiZGlzcGxheUFzXCIgb3B0aW9uIG11c3QgYmUgYSBzdHJpbmcnKTtcclxuICAgICAgICByZXR1cm4gZGlzcGxheUFzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdGF0aWMgc2FuaXRpemVNaW5EYXRlKG1pbkRhdGU6YW55LCBkZmx0OkRhdGUgPSB2b2lkIDApIHtcclxuICAgICAgICBpZiAobWluRGF0ZSA9PT0gdm9pZCAwKSByZXR1cm4gZGZsdDtcclxuICAgICAgICByZXR1cm4gbmV3IERhdGUobWluRGF0ZSk7IC8vVE9ETyBmaWd1cmUgdGhpcyBvdXQgeWVzXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN0YXRpYyBzYW5pdGl6ZU1heERhdGUobWF4RGF0ZTphbnksIGRmbHQ6RGF0ZSA9IHZvaWQgMCkge1xyXG4gICAgICAgIGlmIChtYXhEYXRlID09PSB2b2lkIDApIHJldHVybiBkZmx0O1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShtYXhEYXRlKTsgLy9UT0RPIGZpZ3VyZSB0aGlzIG91dCBcclxuICAgIH1cclxuICAgIFxyXG4gICAgc3RhdGljIHNhbml0aXplRGVmYXVsdERhdGUoZGVmYXVsdERhdGU6YW55LCBkZmx0OkRhdGUgPSB0aGlzLmRmbHREYXRlKSB7XHJcbiAgICAgICAgaWYgKGRlZmF1bHREYXRlID09PSB2b2lkIDApIHJldHVybiBkZmx0O1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShkZWZhdWx0RGF0ZSk7IC8vVE9ETyBmaWd1cmUgdGhpcyBvdXRcclxuICAgIH1cclxuICAgICAgICBcclxuICAgIHN0YXRpYyBzYW5pdGl6ZUNvbG9yKGNvbG9yOmFueSkge1xyXG4gICAgICAgIGxldCB0aHJlZUhleCA9ICdcXFxccyojW0EtRmEtZjAtOV17M31cXFxccyonO1xyXG4gICAgICAgIGxldCBzaXhIZXggPSAnXFxcXHMqI1tBLUZhLWYwLTldezZ9XFxcXHMqJztcclxuICAgICAgICBsZXQgcmdiID0gJ1xcXFxzKnJnYlxcXFwoXFxcXHMqWzAtOV17MSwzfVxcXFxzKixcXFxccypbMC05XXsxLDN9XFxcXHMqLFxcXFxzKlswLTldezEsM31cXFxccypcXFxcKVxcXFxzKic7XHJcbiAgICAgICAgbGV0IHJnYmEgPSAnXFxcXHMqcmdiYVxcXFwoXFxcXHMqWzAtOV17MSwzfVxcXFxzKixcXFxccypbMC05XXsxLDN9XFxcXHMqLFxcXFxzKlswLTldezEsM31cXFxccypcXFxcLFxcXFxzKlswLTldKlxcXFwuWzAtOV0rXFxcXHMqXFxcXClcXFxccyonO1xyXG4gICAgICAgIGxldCBzYW5pdGl6ZUNvbG9yUmVnZXggPSBuZXcgUmVnRXhwKGBeKCgke3RocmVlSGV4fSl8KCR7c2l4SGV4fSl8KCR7cmdifSl8KCR7cmdiYX0pKSRgKTtcclxuXHJcbiAgICAgICAgaWYgKGNvbG9yID09PSB2b2lkIDApIHRocm93IE9wdGlvbkV4Y2VwdGlvbihcIkFsbCB0aGVtZSBjb2xvcnMgKHByaW1hcnksIHByaW1hcnlfdGV4dCwgc2Vjb25kYXJ5LCBzZWNvbmRhcnlfdGV4dCwgc2Vjb25kYXJ5X2FjY2VudCkgbXVzdCBiZSBkZWZpbmVkXCIpO1xyXG4gICAgICAgIGlmICghc2FuaXRpemVDb2xvclJlZ2V4LnRlc3QoY29sb3IpKSB0aHJvdyBPcHRpb25FeGNlcHRpb24oXCJBbGwgdGhlbWUgY29sb3JzIG11c3QgYmUgdmFsaWQgcmdiLCByZ2JhLCBvciBoZXggY29kZVwiKTtcclxuICAgICAgICByZXR1cm4gPHN0cmluZz5jb2xvcjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgc3RhdGljIHNhbml0aXplVGhlbWUodGhlbWU6YW55LCBkZmx0OmFueSA9IFwibWF0ZXJpYWxcIik6SVRoZW1lIHtcclxuICAgICAgICBpZiAodGhlbWUgPT09IHZvaWQgMCkgcmV0dXJuIE9wdGlvblNhbml0aXplci5zYW5pdGl6ZVRoZW1lKGRmbHQsIHZvaWQgMCk7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGVtZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgc3dpdGNoKHRoZW1lKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ2xpZ2h0JzpcclxuICAgICAgICAgICAgICAgIHJldHVybiA8SVRoZW1lPntcclxuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5OiAnI2VlZScsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeV90ZXh0OiAnIzY2NicsXHJcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5OiAnI2ZmZicsXHJcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5X3RleHQ6ICcjNjY2JyxcclxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnlfYWNjZW50OiAnIzY2NidcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSAnZGFyayc6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gPElUaGVtZT57XHJcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeTogJyM0NDQnLFxyXG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnlfdGV4dDogJyNlZWUnLFxyXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeTogJyMzMzMnLFxyXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeV90ZXh0OiAnI2VlZScsXHJcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5X2FjY2VudDogJyNmZmYnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgJ21hdGVyaWFsJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiA8SVRoZW1lPntcclxuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5OiAnIzAxOTU4NycsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeV90ZXh0OiAnI2ZmZicsXHJcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5OiAnI2ZmZicsXHJcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5X3RleHQ6ICcjODg4JyxcclxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnlfYWNjZW50OiAnIzAxOTU4NydcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHRocm93IFwiTmFtZSBvZiB0aGVtZSBub3QgdmFsaWQuXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGVtZSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDxJVGhlbWU+IHtcclxuICAgICAgICAgICAgICAgIHByaW1hcnk6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZUNvbG9yKHRoZW1lWydwcmltYXJ5J10pLFxyXG4gICAgICAgICAgICAgICAgc2Vjb25kYXJ5OiBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVDb2xvcih0aGVtZVsnc2Vjb25kYXJ5J10pLFxyXG4gICAgICAgICAgICAgICAgcHJpbWFyeV90ZXh0OiBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVDb2xvcih0aGVtZVsncHJpbWFyeV90ZXh0J10pLFxyXG4gICAgICAgICAgICAgICAgc2Vjb25kYXJ5X3RleHQ6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZUNvbG9yKHRoZW1lWydzZWNvbmRhcnlfdGV4dCddKSxcclxuICAgICAgICAgICAgICAgIHNlY29uZGFyeV9hY2NlbnQ6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZUNvbG9yKHRoZW1lWydzZWNvbmRhcnlfYWNjZW50J10pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBPcHRpb25FeGNlcHRpb24oJ1RoZSBcInRoZW1lXCIgb3B0aW9uIG11c3QgYmUgb2JqZWN0IG9yIHN0cmluZycpO1xyXG4gICAgICAgIH1cclxuICAgIH0gXHJcbiAgICBcclxuICAgIFxyXG4gICAgc3RhdGljIHNhbml0aXplKG9wdGlvbnM6SU9wdGlvbnMsIGRlZmF1bHRzOklPcHRpb25zKSB7XHJcbiAgICAgICAgbGV0IG9wdHM6SU9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIGRpc3BsYXlBczogT3B0aW9uU2FuaXRpemVyLnNhbml0aXplRGlzcGxheUFzKG9wdGlvbnNbJ2Rpc3BsYXlBcyddLCBkZWZhdWx0cy5kaXNwbGF5QXMpLFxyXG4gICAgICAgICAgICBtaW5EYXRlOiBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVNaW5EYXRlKG9wdGlvbnNbJ21pbkRhdGUnXSwgZGVmYXVsdHMubWluRGF0ZSksXHJcbiAgICAgICAgICAgIG1heERhdGU6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZU1heERhdGUob3B0aW9uc1snbWF4RGF0ZSddLCBkZWZhdWx0cy5tYXhEYXRlKSxcclxuICAgICAgICAgICAgZGVmYXVsdERhdGU6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZURlZmF1bHREYXRlKG9wdGlvbnNbJ2RlZmF1bHREYXRlJ10sIGRlZmF1bHRzLmRlZmF1bHREYXRlKSxcclxuICAgICAgICAgICAgdGhlbWU6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZVRoZW1lKG9wdGlvbnNbJ3RoZW1lJ10sIGRlZmF1bHRzLnRoZW1lKVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gb3B0cztcclxuICAgIH1cclxufSIsIkN1c3RvbUV2ZW50ID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgZnVuY3Rpb24gdXNlTmF0aXZlICgpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBsZXQgY3VzdG9tRXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoJ2EnLCB7IGRldGFpbDogeyBiOiAnYicgfSB9KTtcclxuICAgICAgICAgICAgcmV0dXJuICAnYScgPT09IGN1c3RvbUV2ZW50LnR5cGUgJiYgJ2InID09PSBjdXN0b21FdmVudC5kZXRhaWwuYjtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgaWYgKHVzZU5hdGl2ZSgpKSB7XHJcbiAgICAgICAgcmV0dXJuIDxhbnk+Q3VzdG9tRXZlbnQ7XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkb2N1bWVudC5jcmVhdGVFdmVudCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIC8vIElFID49IDlcclxuICAgICAgICByZXR1cm4gPGFueT5mdW5jdGlvbih0eXBlOnN0cmluZywgcGFyYW1zOkN1c3RvbUV2ZW50SW5pdCkge1xyXG4gICAgICAgICAgICBsZXQgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdDdXN0b21FdmVudCcpO1xyXG4gICAgICAgICAgICBpZiAocGFyYW1zKSB7XHJcbiAgICAgICAgICAgICAgICBlLmluaXRDdXN0b21FdmVudCh0eXBlLCBwYXJhbXMuYnViYmxlcywgcGFyYW1zLmNhbmNlbGFibGUsIHBhcmFtcy5kZXRhaWwpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZS5pbml0Q3VzdG9tRXZlbnQodHlwZSwgZmFsc2UsIGZhbHNlLCB2b2lkIDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBlO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gSUUgPj0gOFxyXG4gICAgICAgIHJldHVybiA8YW55PmZ1bmN0aW9uKHR5cGU6c3RyaW5nLCBwYXJhbXM6Q3VzdG9tRXZlbnRJbml0KSB7XHJcbiAgICAgICAgICAgIGxldCBlID0gKDxhbnk+ZG9jdW1lbnQpLmNyZWF0ZUV2ZW50T2JqZWN0KCk7XHJcbiAgICAgICAgICAgIGUudHlwZSA9IHR5cGU7XHJcbiAgICAgICAgICAgIGlmIChwYXJhbXMpIHtcclxuICAgICAgICAgICAgICAgIGUuYnViYmxlcyA9IEJvb2xlYW4ocGFyYW1zLmJ1YmJsZXMpO1xyXG4gICAgICAgICAgICAgICAgZS5jYW5jZWxhYmxlID0gQm9vbGVhbihwYXJhbXMuY2FuY2VsYWJsZSk7XHJcbiAgICAgICAgICAgICAgICBlLmRldGFpbCA9IHBhcmFtcy5kZXRhaWw7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBlLmJ1YmJsZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGUuY2FuY2VsYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgZS5kZXRhaWwgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGU7XHJcbiAgICAgICAgfSBcclxuICAgIH0gIFxyXG59KSgpO1xyXG4iLCJpbnRlcmZhY2UgSUxpc3RlbmVyUmVmZXJlbmNlIHtcclxuICAgIGVsZW1lbnQ6IEVsZW1lbnR8RG9jdW1lbnR8V2luZG93O1xyXG4gICAgcmVmZXJlbmNlOiBFdmVudExpc3RlbmVyO1xyXG4gICAgZXZlbnQ6IHN0cmluZztcclxufVxyXG5cclxubmFtZXNwYWNlIGxpc3RlbiB7XHJcbiAgICBsZXQgbWF0Y2hlcyA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5tYXRjaGVzIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5tc01hdGNoZXNTZWxlY3RvcjtcclxuICAgIFxyXG4gICAgZnVuY3Rpb24gaGFuZGxlRGVsZWdhdGVFdmVudChwYXJlbnQ6RWxlbWVudCwgZGVsZWdhdGVTZWxlY3RvcjpzdHJpbmcsIGNhbGxiYWNrOihlPzpNb3VzZUV2ZW50fFRvdWNoRXZlbnQpID0+IHZvaWQpIHtcclxuICAgICAgICByZXR1cm4gKGU6TW91c2VFdmVudHxUb3VjaEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSBlLnNyY0VsZW1lbnQgfHwgPEVsZW1lbnQ+ZS50YXJnZXQ7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB3aGlsZSghdGFyZ2V0LmlzRXF1YWxOb2RlKHBhcmVudCkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChtYXRjaGVzLmNhbGwodGFyZ2V0LCBkZWxlZ2F0ZVNlbGVjdG9yKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnRFbGVtZW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBmdW5jdGlvbiBhdHRhY2hFdmVudHNEZWxlZ2F0ZShldmVudHM6c3RyaW5nW10sIHBhcmVudDpFbGVtZW50LCBkZWxlZ2F0ZVNlbGVjdG9yOnN0cmluZywgY2FsbGJhY2s6KGU/Ok1vdXNlRXZlbnR8VG91Y2hFdmVudCkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xyXG4gICAgICAgIGxldCBsaXN0ZW5lcnM6SUxpc3RlbmVyUmVmZXJlbmNlW10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gZXZlbnRzKSB7XHJcbiAgICAgICAgICAgIGxldCBldmVudDpzdHJpbmcgPSBldmVudHNba2V5XTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBuZXdMaXN0ZW5lciA9IGhhbmRsZURlbGVnYXRlRXZlbnQocGFyZW50LCBkZWxlZ2F0ZVNlbGVjdG9yLCBjYWxsYmFjayk7XHJcbiAgICAgICAgICAgIGxpc3RlbmVycy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IHBhcmVudCxcclxuICAgICAgICAgICAgICAgIHJlZmVyZW5jZTogbmV3TGlzdGVuZXIsXHJcbiAgICAgICAgICAgICAgICBldmVudDogZXZlbnRcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBwYXJlbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgbmV3TGlzdGVuZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbGlzdGVuZXJzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBmdW5jdGlvbiBhdHRhY2hFdmVudHMoZXZlbnRzOnN0cmluZ1tdLCBlbGVtZW50OkVsZW1lbnR8RG9jdW1lbnR8V2luZG93LCBjYWxsYmFjazooZT86YW55KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgbGV0IGxpc3RlbmVyczpJTGlzdGVuZXJSZWZlcmVuY2VbXSA9IFtdO1xyXG4gICAgICAgIGV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICBsaXN0ZW5lcnMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50OiBlbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgcmVmZXJlbmNlOiBjYWxsYmFjayxcclxuICAgICAgICAgICAgICAgIGV2ZW50OiBldmVudFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBjYWxsYmFjayk7IFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBsaXN0ZW5lcnM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIE5BVElWRVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZm9jdXMoZWxlbWVudDpFbGVtZW50fERvY3VtZW50fFdpbmRvdywgY2FsbGJhY2s6KGU/OkZvY3VzRXZlbnQpID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdIHtcclxuICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzKFsnZm9jdXMnXSwgZWxlbWVudCwgKGUpID0+IHtcclxuICAgICAgICAgICAgY2FsbGJhY2soZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiBkb3duKGVsZW1lbnQ6RWxlbWVudHxEb2N1bWVudHxXaW5kb3csIGNhbGxiYWNrOihlPzpNb3VzZUV2ZW50fFRvdWNoRXZlbnQpID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdO1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGRvd24ocGFyZW50OkVsZW1lbnR8RG9jdW1lbnR8V2luZG93LCBkZWxlZ2F0ZVNlbGVjdG9yOnN0cmluZywgY2FsbGJhY2s6KGU/Ok1vdXNlRXZlbnR8VG91Y2hFdmVudCkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW107XHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZG93biguLi5wYXJhbXM6YW55W10pIHtcclxuICAgICAgICBpZiAocGFyYW1zLmxlbmd0aCA9PT0gMykge1xyXG4gICAgICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzRGVsZWdhdGUoWydtb3VzZWRvd24nLCAndG91Y2hzdGFydCddLCBwYXJhbXNbMF0sIHBhcmFtc1sxXSwgKGUpID0+IHtcclxuICAgICAgICAgICAgICAgIHBhcmFtc1syXSg8YW55PmUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzKFsnbW91c2Vkb3duJywgJ3RvdWNoc3RhcnQnXSwgcGFyYW1zWzBdLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcGFyYW1zWzFdKDxhbnk+ZSk7XHJcbiAgICAgICAgICAgIH0pOyAgICAgICAgXHJcbiAgICAgICAgfSBcclxuICAgIH07XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiB1cChlbGVtZW50OkVsZW1lbnR8RG9jdW1lbnR8V2luZG93LCBjYWxsYmFjazooZT86TW91c2VFdmVudCkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xyXG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydtb3VzZXVwJywgJ3RvdWNoZW5kJ10sIGVsZW1lbnQsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gbW91c2Vkb3duKGVsZW1lbnQ6RWxlbWVudHxEb2N1bWVudHxXaW5kb3csIGNhbGxiYWNrOihlPzpNb3VzZUV2ZW50KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ21vdXNlZG93biddLCBlbGVtZW50LCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBjYWxsYmFjayhlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIG1vdXNldXAoZWxlbWVudDpFbGVtZW50fERvY3VtZW50fFdpbmRvdywgY2FsbGJhY2s6KGU/Ok1vdXNlRXZlbnQpID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdIHtcclxuICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzKFsnbW91c2V1cCddLCBlbGVtZW50LCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBjYWxsYmFjayhlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHBhc3RlKGVsZW1lbnQ6RWxlbWVudHxEb2N1bWVudHxXaW5kb3csIGNhbGxiYWNrOihlPzpNb3VzZUV2ZW50KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ3Bhc3RlJ10sIGVsZW1lbnQsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyBDVVNUT01cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGdvdG8oZWxlbWVudDpFbGVtZW50LCBjYWxsYmFjazooZT86e2RhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWx9KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ2RhdGl1bS1nb3RvJ10sIGVsZW1lbnQsIChlOkN1c3RvbUV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGUuZGV0YWlsKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHZpZXdjaGFuZ2VkKGVsZW1lbnQ6RWxlbWVudCwgY2FsbGJhY2s6KGU/OntkYXRlOkRhdGUsIGxldmVsOkxldmVsfSkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xyXG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydkYXRpdW0tdmlld2NoYW5nZWQnXSwgZWxlbWVudCwgKGU6Q3VzdG9tRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgY2FsbGJhY2soZS5kZXRhaWwpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXJzKGxpc3RlbmVyczpJTGlzdGVuZXJSZWZlcmVuY2VbXSkge1xyXG4gICAgICAgIGxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xyXG4gICAgICAgICAgIGxpc3RlbmVyLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihsaXN0ZW5lci5ldmVudCwgbGlzdGVuZXIucmVmZXJlbmNlKTsgXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbm5hbWVzcGFjZSB0cmlnZ2VyIHtcclxuICAgIGV4cG9ydCBmdW5jdGlvbiBnb3RvKGVsZW1lbnQ6RWxlbWVudCwgZGF0YT86e2RhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWx9KSB7XHJcbiAgICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnZGF0aXVtLWdvdG8nLCB7XHJcbiAgICAgICAgICAgIGJ1YmJsZXM6IGZhbHNlLFxyXG4gICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICBkZXRhaWw6IGRhdGFcclxuICAgICAgICB9KSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiB2aWV3Y2hhbmdlZChlbGVtZW50OkVsZW1lbnQsIGRhdGE/OntkYXRlOkRhdGUsIGxldmVsOkxldmVsfSkge1xyXG4gICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2RhdGl1bS12aWV3Y2hhbmdlZCcsIHtcclxuICAgICAgICAgICAgYnViYmxlczogZmFsc2UsXHJcbiAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXHJcbiAgICAgICAgICAgIGRldGFpbDogZGF0YVxyXG4gICAgICAgIH0pKTtcclxuICAgIH1cclxufSIsImludGVyZmFjZSBJRGF0ZVBhcnQge1xyXG4gICAgaW5jcmVtZW50KCk6dm9pZDtcclxuICAgIGRlY3JlbWVudCgpOnZvaWQ7XHJcbiAgICBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKTpib29sZWFuO1xyXG4gICAgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpOmJvb2xlYW47XHJcbiAgICBnZXRWYWx1ZSgpOkRhdGU7XHJcbiAgICBnZXRSZWdFeCgpOlJlZ0V4cDtcclxuICAgIHNldFNlbGVjdGFibGUoc2VsZWN0YWJsZTpib29sZWFuKTpJRGF0ZVBhcnQ7XHJcbiAgICBnZXRNYXhCdWZmZXIoKTpudW1iZXI7XHJcbiAgICBnZXRMZXZlbCgpOkxldmVsO1xyXG4gICAgaXNTZWxlY3RhYmxlKCk6Ym9vbGVhbjtcclxuICAgIHRvU3RyaW5nKCk6c3RyaW5nO1xyXG59XHJcblxyXG5jbGFzcyBQbGFpblRleHQgaW1wbGVtZW50cyBJRGF0ZVBhcnQge1xyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSB0ZXh0OnN0cmluZykge31cclxuICAgIHB1YmxpYyBpbmNyZW1lbnQoKSB7fVxyXG4gICAgcHVibGljIGRlY3JlbWVudCgpIHt9XHJcbiAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbCgpIHsgcmV0dXJuIGZhbHNlIH1cclxuICAgIHB1YmxpYyBzZXRWYWx1ZSgpIHsgcmV0dXJuIGZhbHNlIH1cclxuICAgIHB1YmxpYyBnZXRWYWx1ZSgpOkRhdGUgeyByZXR1cm4gbnVsbCB9XHJcbiAgICBwdWJsaWMgZ2V0UmVnRXgoKTpSZWdFeHAgeyByZXR1cm4gbmV3IFJlZ0V4cChgWyR7dGhpcy50ZXh0fV1gKTsgfVxyXG4gICAgcHVibGljIHNldFNlbGVjdGFibGUoc2VsZWN0YWJsZTpib29sZWFuKTpJRGF0ZVBhcnQgeyByZXR1cm4gdGhpcyB9XHJcbiAgICBwdWJsaWMgZ2V0TWF4QnVmZmVyKCk6bnVtYmVyIHsgcmV0dXJuIDAgfVxyXG4gICAgcHVibGljIGdldExldmVsKCk6TGV2ZWwgeyByZXR1cm4gTGV2ZWwuTk9ORSB9XHJcbiAgICBwdWJsaWMgaXNTZWxlY3RhYmxlKCk6Ym9vbGVhbiB7IHJldHVybiBmYWxzZSB9XHJcbiAgICBwdWJsaWMgdG9TdHJpbmcoKTpzdHJpbmcgeyByZXR1cm4gdGhpcy50ZXh0IH1cclxufVxyXG4gICAgXHJcbmxldCBmb3JtYXRCbG9ja3MgPSAoZnVuY3Rpb24oKSB7ICAgIFxyXG4gICAgY2xhc3MgRGF0ZVBhcnQge1xyXG4gICAgICAgIHByb3RlY3RlZCBkYXRlOkRhdGU7XHJcbiAgICAgICAgcHJvdGVjdGVkIHNlbGVjdGFibGU6Ym9vbGVhbiA9IHRydWU7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFZhbHVlKCk6RGF0ZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGVcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFNlbGVjdGFibGUoc2VsZWN0YWJsZTpib29sZWFuKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0YWJsZSA9IHNlbGVjdGFibGU7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgaXNTZWxlY3RhYmxlKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RhYmxlO1xyXG4gICAgICAgIH0gICBcclxuICAgICAgICBcclxuICAgICAgICBwcm90ZWN0ZWQgcGFkKG51bTpudW1iZXJ8c3RyaW5nLCBzaXplOm51bWJlciA9IDIpIHtcclxuICAgICAgICAgICAgbGV0IHN0ciA9IG51bS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICB3aGlsZShzdHIubGVuZ3RoIDwgc2l6ZSkgc3RyID0gJzAnICsgc3RyO1xyXG4gICAgICAgICAgICByZXR1cm4gc3RyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwcm90ZWN0ZWQgdHJpbShzdHI6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHdoaWxlIChzdHJbMF0gPT09ICcwJyAmJiBzdHIubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICAgICAgc3RyID0gc3RyLnN1YnN0cigxLCBzdHIubGVuZ3RoKTsgIFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBzdHI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBGb3VyRGlnaXRZZWFyIGV4dGVuZHMgRGF0ZVBhcnQge1xyXG4gICAgICAgIHB1YmxpYyBpbmNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRGdWxsWWVhcih0aGlzLmRhdGUuZ2V0RnVsbFllYXIoKSArIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZGVjcmVtZW50KCkge1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0RnVsbFllYXIodGhpcy5kYXRlLmdldEZ1bGxZZWFyKCkgLSAxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUocGFydGlhbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0RnVsbFllYXIocGFyc2VJbnQodmFsdWUsIDEwKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eLT9cXGR7MSw0fSQvO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TWF4QnVmZmVyKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gNDtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldExldmVsKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTGV2ZWwuWUVBUjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldEZ1bGxZZWFyKCkudG9TdHJpbmcoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIFR3b0RpZ2l0WWVhciBleHRlbmRzIEZvdXJEaWdpdFllYXIge1xyXG4gICAgICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKHZhbHVlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHRoaXMuZ2V0UmVnRXgoKS50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGJhc2UgPSBNYXRoLmZsb29yKHN1cGVyLmdldFZhbHVlKCkuZ2V0RnVsbFllYXIoKS8xMDApKjEwMDtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRGdWxsWWVhcihwYXJzZUludCg8c3RyaW5nPnZhbHVlLCAxMCkgKyBiYXNlKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL14tP1xcZHsxLDJ9JC87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLnRvU3RyaW5nKCkuc2xpY2UoLTIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgTG9uZ01vbnRoTmFtZSBleHRlbmRzIERhdGVQYXJ0IHtcclxuICAgICAgICBwcm90ZWN0ZWQgZ2V0TW9udGhzKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gW1wiSmFudWFyeVwiLCBcIkZlYnJ1YXJ5XCIsIFwiTWFyY2hcIiwgXCJBcHJpbFwiLCBcIk1heVwiLCBcIkp1bmVcIiwgXCJKdWx5XCIsIFwiQXVndXN0XCIsIFwiU2VwdGVtYmVyXCIsIFwiT2N0b2JlclwiLCBcIk5vdmVtYmVyXCIsIFwiRGVjZW1iZXJcIl07XHJcbiAgICAgICAgfSBcclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgaW5jcmVtZW50KCkge1xyXG4gICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldE1vbnRoKCkgKyAxO1xyXG4gICAgICAgICAgICBpZiAobnVtID4gMTEpIG51bSA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRNb250aChudW0pO1xyXG4gICAgICAgICAgICB3aGlsZSAodGhpcy5kYXRlLmdldE1vbnRoKCkgPiBudW0pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXREYXRlKHRoaXMuZGF0ZS5nZXREYXRlKCkgLSAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZGVjcmVtZW50KCkge1xyXG4gICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldE1vbnRoKCkgLSAxO1xyXG4gICAgICAgICAgICBpZiAobnVtIDwgMCkgbnVtID0gMTE7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRNb250aChudW0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICBsZXQgbW9udGggPSB0aGlzLmdldE1vbnRocygpLmZpbHRlcigobW9udGgpID0+IHtcclxuICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoYF4ke3BhcnRpYWx9LiokYCwgJ2knKS50ZXN0KG1vbnRoKTsgXHJcbiAgICAgICAgICAgIH0pWzBdO1xyXG4gICAgICAgICAgICBpZiAobW9udGggIT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUobW9udGgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmdldE1vbnRocygpLmluZGV4T2YodmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1vbnRoKG51bSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoYF4oKCR7dGhpcy5nZXRNb250aHMoKS5qb2luKFwiKXwoXCIpfSkpJGAsICdpJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbMiwxLDMsMiwzLDMsMywyLDEsMSwxLDFdW3RoaXMuZGF0ZS5nZXRNb250aCgpXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldExldmVsKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTGV2ZWwuTU9OVEg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0TW9udGhzKClbdGhpcy5kYXRlLmdldE1vbnRoKCldO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgU2hvcnRNb250aE5hbWUgZXh0ZW5kcyBMb25nTW9udGhOYW1lIHtcclxuICAgICAgICBwcm90ZWN0ZWQgZ2V0TW9udGhzKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gW1wiSmFuXCIsIFwiRmViXCIsIFwiTWFyXCIsIFwiQXByXCIsIFwiTWF5XCIsIFwiSnVuXCIsIFwiSnVsXCIsIFwiQXVnXCIsIFwiU2VwXCIsIFwiT2N0XCIsIFwiTm92XCIsIFwiRGVjXCJdO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgTW9udGggZXh0ZW5kcyBMb25nTW9udGhOYW1lIHtcclxuICAgICAgICBwdWJsaWMgZ2V0TWF4QnVmZmVyKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldE1vbnRoKCkgPiAwID8gMSA6IDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICgvXlxcZHsxLDJ9JC8udGVzdChwYXJ0aWFsKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHRyaW1tZWQgPSB0aGlzLnRyaW0ocGFydGlhbCA9PT0gJzAnID8gJzEnIDogcGFydGlhbCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0cmltbWVkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0TW9udGgocGFyc2VJbnQodmFsdWUsIDEwKSAtIDEpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXihbMS05XXwoMVswLTJdKSkkLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gKHRoaXMuZGF0ZS5nZXRNb250aCgpICsgMSkudG9TdHJpbmcoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIFBhZGRlZE1vbnRoIGV4dGVuZHMgTW9udGgge1xyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICgvXlxcZHsxLDJ9JC8udGVzdChwYXJ0aWFsKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhZGRlZCA9IHRoaXMucGFkKHBhcnRpYWwgPT09ICcwJyA/ICcxJyA6IHBhcnRpYWwpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUocGFkZGVkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eKCgwWzEtOV0pfCgxWzAtMl0pKSQvOyAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhZChzdXBlci50b1N0cmluZygpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIERhdGVOdW1lcmFsIGV4dGVuZHMgRGF0ZVBhcnQge1xyXG4gICAgICAgIHByb3RlY3RlZCBkYXlzSW5Nb250aCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHRoaXMuZGF0ZS5nZXRGdWxsWWVhcigpLCB0aGlzLmRhdGUuZ2V0TW9udGgoKSArIDEsIDApLmdldERhdGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGluY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXREYXRlKCkgKyAxO1xyXG4gICAgICAgICAgICBpZiAobnVtID4gdGhpcy5kYXlzSW5Nb250aCgpKSBudW0gPSAxO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0RGF0ZShudW0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZGVjcmVtZW50KCkge1xyXG4gICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldERhdGUoKSAtIDE7XHJcbiAgICAgICAgICAgIGlmIChudW0gPCAxKSBudW0gPSB0aGlzLmRheXNJbk1vbnRoKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXREYXRlKG51bSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICgvXlxcZHsxLDJ9JC8udGVzdChwYXJ0aWFsKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHRyaW1tZWQgPSB0aGlzLnRyaW0ocGFydGlhbCA9PT0gJzAnID8gJzEnIDogcGFydGlhbCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0cmltbWVkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpICYmIHBhcnNlSW50KHZhbHVlLCAxMCkgPCB0aGlzLmRheXNJbk1vbnRoKCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXREYXRlKHBhcnNlSW50KHZhbHVlLCAxMCkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXlsxLTldfCgoMXwyKVswLTldKXwoM1swLTFdKSQvO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TWF4QnVmZmVyKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldERhdGUoKSA+IE1hdGguZmxvb3IodGhpcy5kYXlzSW5Nb250aCgpLzEwKSA/IDEgOiAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBMZXZlbC5EQVRFO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0RGF0ZSgpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBQYWRkZWREYXRlIGV4dGVuZHMgRGF0ZU51bWVyYWwge1xyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICgvXlxcZHsxLDJ9JC8udGVzdChwYXJ0aWFsKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhZGRlZCA9IHRoaXMucGFkKHBhcnRpYWwgPT09ICcwJyA/ICcxJyA6IHBhcnRpYWwpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUocGFkZGVkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eKDBbMS05XSl8KCgxfDIpWzAtOV0pfCgzWzAtMV0pJC87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFkKHRoaXMuZGF0ZS5nZXREYXRlKCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgRGF0ZU9yZGluYWwgZXh0ZW5kcyBEYXRlTnVtZXJhbCB7XHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL14oWzEtOV18KCgxfDIpWzAtOV0pfCgzWzAtMV0pKSgoc3QpfChuZCl8KHJkKXwodGgpKT8kL2k7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgbGV0IGRhdGUgPSB0aGlzLmRhdGUuZ2V0RGF0ZSgpO1xyXG4gICAgICAgICAgICBsZXQgaiA9IGRhdGUgJSAxMDtcclxuICAgICAgICAgICAgbGV0IGsgPSBkYXRlICUgMTAwO1xyXG4gICAgICAgICAgICBpZiAoaiA9PT0gMSAmJiBrICE9PSAxMSkgcmV0dXJuIGRhdGUgKyBcInN0XCI7XHJcbiAgICAgICAgICAgIGlmIChqID09PSAyICYmIGsgIT09IDEyKSByZXR1cm4gZGF0ZSArIFwibmRcIjtcclxuICAgICAgICAgICAgaWYgKGogPT09IDMgJiYgayAhPT0gMTMpIHJldHVybiBkYXRlICsgXCJyZFwiO1xyXG4gICAgICAgICAgICByZXR1cm4gZGF0ZSArIFwidGhcIjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIExvbmdEYXlOYW1lIGV4dGVuZHMgRGF0ZVBhcnQge1xyXG4gICAgICAgIHByb3RlY3RlZCBnZXREYXlzKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gW1wiU3VuZGF5XCIsIFwiTW9uZGF5XCIsIFwiVHVlc2RheVwiLCBcIldlZG5lc2RheVwiLCBcIlRodXJzZGF5XCIsIFwiRnJpZGF5XCIsIFwiU2F0dXJkYXlcIl07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBpbmNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0RGF5KCkgKyAxO1xyXG4gICAgICAgICAgICBpZiAobnVtID4gNikgbnVtID0gMDtcclxuICAgICAgICAgICAgdGhpcy5kYXRlLnNldERhdGUodGhpcy5kYXRlLmdldERhdGUoKSAtIHRoaXMuZGF0ZS5nZXREYXkoKSArIG51bSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBkZWNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0RGF5KCkgLSAxO1xyXG4gICAgICAgICAgICBpZiAobnVtIDwgMCkgbnVtID0gNjtcclxuICAgICAgICAgICAgdGhpcy5kYXRlLnNldERhdGUodGhpcy5kYXRlLmdldERhdGUoKSAtIHRoaXMuZGF0ZS5nZXREYXkoKSArIG51bSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXkgPSB0aGlzLmdldERheXMoKS5maWx0ZXIoKGRheSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoYF4ke3BhcnRpYWx9LiokYCwgJ2knKS50ZXN0KGRheSk7XHJcbiAgICAgICAgICAgIH0pWzBdO1xyXG4gICAgICAgICAgICBpZiAoZGF5ICE9PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKGRheSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKHZhbHVlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHRoaXMuZ2V0UmVnRXgoKS50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZ2V0RGF5cygpLmluZGV4T2YodmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldERhdGUodGhpcy5kYXRlLmdldERhdGUoKSAtIHRoaXMuZGF0ZS5nZXREYXkoKSArIG51bSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoYF4oKCR7dGhpcy5nZXREYXlzKCkuam9pbihcIil8KFwiKX0pKSRgLCAnaScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TWF4QnVmZmVyKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gWzIsMSwyLDEsMiwxLDJdW3RoaXMuZGF0ZS5nZXREYXkoKV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIExldmVsLkRBVEU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RGF5cygpW3RoaXMuZGF0ZS5nZXREYXkoKV07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBTaG9ydERheU5hbWUgZXh0ZW5kcyBMb25nRGF5TmFtZSB7XHJcbiAgICAgICAgcHJvdGVjdGVkIGdldERheXMoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXCJTdW5cIiwgXCJNb25cIiwgXCJUdWVcIiwgXCJXZWRcIiwgXCJUaHVcIiwgXCJGcmlcIiwgXCJTYXRcIl07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBQYWRkZWRNaWxpdGFyeUhvdXIgZXh0ZW5kcyBEYXRlUGFydCB7XHJcbiAgICAgICAgcHVibGljIGluY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRIb3VycygpICsgMTtcclxuICAgICAgICAgICAgaWYgKG51bSA+IDIzKSBudW0gPSAwO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnMobnVtKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGRlY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRIb3VycygpIC0gMTtcclxuICAgICAgICAgICAgaWYgKG51bSA8IDApIG51bSA9IDIzO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnMobnVtKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKC9eXFxkezEsMn0kLy50ZXN0KHBhcnRpYWwpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGFkZGVkID0gdGhpcy5wYWQocGFydGlhbCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZShwYWRkZWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3VycyhwYXJzZUludCh2YWx1ZSwgMTApKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXRIb3VycygpID4gMiA/IDEgOiAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBMZXZlbC5IT1VSO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXigoKDB8MSlbMC05XSl8KDJbMC0zXSkpJC87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFkKHRoaXMuZGF0ZS5nZXRIb3VycygpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIE1pbGl0YXJ5SG91ciBleHRlbmRzIFBhZGRlZE1pbGl0YXJ5SG91ciB7XHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKC9eXFxkezEsMn0kLy50ZXN0KHBhcnRpYWwpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdHJpbW1lZCA9IHRoaXMudHJpbShwYXJ0aWFsKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHRyaW1tZWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL14oKDE/WzAtOV0pfCgyWzAtM10pKSQvO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0SG91cnMoKS50b1N0cmluZygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgUGFkZGVkSG91ciBleHRlbmRzIFBhZGRlZE1pbGl0YXJ5SG91ciB7XHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgbGV0IHBhZGRlZCA9IHRoaXMucGFkKHBhcnRpYWwgPT09ICcwJyA/ICcxJyA6IHBhcnRpYWwpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZShwYWRkZWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKHZhbHVlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHRoaXMuZ2V0UmVnRXgoKS50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IG51bSA9IHBhcnNlSW50KHZhbHVlLCAxMCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kYXRlLmdldEhvdXJzKCkgPCAxMiAmJiBudW0gPT09IDEyKSBudW0gPSAwO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZGF0ZS5nZXRIb3VycygpID4gMTEgJiYgbnVtICE9PSAxMikgbnVtICs9IDEyO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldEhvdXJzKG51bSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eKDBbMS05XSl8KDFbMC0yXSkkLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlSW50KHRoaXMudG9TdHJpbmcoKSwgMTApID4gMSA/IDEgOiAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIGxldCBob3VycyA9IHRoaXMuZGF0ZS5nZXRIb3VycygpO1xyXG4gICAgICAgICAgICBpZiAoaG91cnMgPiAxMikgaG91cnMgLT0gMTI7XHJcbiAgICAgICAgICAgIGlmIChob3VycyA9PT0gMCkgaG91cnMgPSAxMjtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFkKGhvdXJzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIEhvdXIgZXh0ZW5kcyBQYWRkZWRIb3VyIHtcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICBsZXQgdHJpbW1lZCA9IHRoaXMudHJpbShwYXJ0aWFsID09PSAnMCcgPyAnMScgOiBwYXJ0aWFsKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUodHJpbW1lZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eWzEtOV18KDFbMC0yXSkkLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50cmltKHN1cGVyLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgUGFkZGVkTWludXRlIGV4dGVuZHMgRGF0ZVBhcnQge1xyXG4gICAgICAgIHB1YmxpYyBpbmNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0TWludXRlcygpICsgMTtcclxuICAgICAgICAgICAgaWYgKG51bSA+IDU5KSBudW0gPSAwO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0TWludXRlcyhudW0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZGVjcmVtZW50KCkge1xyXG4gICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldE1pbnV0ZXMoKSAtIDE7XHJcbiAgICAgICAgICAgIGlmIChudW0gPCAwKSBudW0gPSA1OTtcclxuICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1pbnV0ZXMobnVtKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUodGhpcy5wYWQocGFydGlhbCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKHZhbHVlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHRoaXMuZ2V0UmVnRXgoKS50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1pbnV0ZXMocGFyc2VJbnQodmFsdWUsIDEwKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eWzAtNV1bMC05XSQvO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TWF4QnVmZmVyKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldE1pbnV0ZXMoKSA+IDUgPyAxIDogMjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldExldmVsKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTGV2ZWwuTUlOVVRFO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhZCh0aGlzLmRhdGUuZ2V0TWludXRlcygpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIE1pbnV0ZSBleHRlbmRzIFBhZGRlZE1pbnV0ZSB7XHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUodGhpcy50cmltKHBhcnRpYWwpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL15bMC01XT9bMC05XSQvO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0TWludXRlcygpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBQYWRkZWRTZWNvbmQgZXh0ZW5kcyBEYXRlUGFydCB7XHJcbiAgICAgICAgcHVibGljIGluY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRTZWNvbmRzKCkgKyAxO1xyXG4gICAgICAgICAgICBpZiAobnVtID4gNTkpIG51bSA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRTZWNvbmRzKG51bSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBkZWNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0U2Vjb25kcygpIC0gMTtcclxuICAgICAgICAgICAgaWYgKG51bSA8IDApIG51bSA9IDU5O1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0U2Vjb25kcyhudW0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0aGlzLnBhZChwYXJ0aWFsKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0U2Vjb25kcyhwYXJzZUludCh2YWx1ZSwgMTApKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL15bMC01XVswLTldJC87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0U2Vjb25kcygpID4gNSA/IDEgOiAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBMZXZlbC5TRUNPTkQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFkKHRoaXMuZGF0ZS5nZXRTZWNvbmRzKCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgU2Vjb25kIGV4dGVuZHMgUGFkZGVkU2Vjb25kIHtcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0aGlzLnRyaW0ocGFydGlhbCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXlswLTVdP1swLTldJC87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXRTZWNvbmRzKCkudG9TdHJpbmcoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIFVwcGVyY2FzZU1lcmlkaWVtIGV4dGVuZHMgRGF0ZVBhcnQge1xyXG4gICAgICAgIHB1YmxpYyBpbmNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0SG91cnMoKSArIDEyO1xyXG4gICAgICAgICAgICBpZiAobnVtID4gMjMpIG51bSAtPSAyNDtcclxuICAgICAgICAgICAgdGhpcy5kYXRlLnNldEhvdXJzKG51bSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBkZWNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0SG91cnMoKSAtIDEyO1xyXG4gICAgICAgICAgICBpZiAobnVtIDwgMCkgbnVtICs9IDI0O1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnMobnVtKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKC9eKChBTT8pfChQTT8pKSQvaS50ZXN0KHBhcnRpYWwpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZShwYXJ0aWFsWzBdID09PSAnQScgPyAnQU0nIDogJ1BNJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKHZhbHVlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHRoaXMuZ2V0UmVnRXgoKS50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlLnRvTG93ZXJDYXNlKCkgPT09ICdhbScgJiYgdGhpcy5kYXRlLmdldEhvdXJzKCkgPiAxMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3Vycyh0aGlzLmRhdGUuZ2V0SG91cnMoKSAtIDEyKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWUudG9Mb3dlckNhc2UoKSA9PT0gJ3BtJyAmJiB0aGlzLmRhdGUuZ2V0SG91cnMoKSA8IDEyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldEhvdXJzKHRoaXMuZGF0ZS5nZXRIb3VycygpICsgMTIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBMZXZlbC5IT1VSO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TWF4QnVmZmVyKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL14oKGFtKXwocG0pKSQvaTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldEhvdXJzKCkgPCAxMiA/ICdBTScgOiAnUE0nO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgTG93ZXJjYXNlTWVyaWRpZW0gZXh0ZW5kcyBVcHBlcmNhc2VNZXJpZGllbSB7XHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3VwZXIudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgbGV0IGZvcm1hdEJsb2Nrczp7IFtrZXk6c3RyaW5nXTogbmV3ICgpID0+IElEYXRlUGFydDsgfSA9IHt9O1xyXG4gICAgXHJcbiAgICBmb3JtYXRCbG9ja3NbJ1lZWVknXSA9IEZvdXJEaWdpdFllYXI7XHJcbiAgICBmb3JtYXRCbG9ja3NbJ1lZJ10gPSBUd29EaWdpdFllYXI7XHJcbiAgICBmb3JtYXRCbG9ja3NbJ01NTU0nXSA9IExvbmdNb250aE5hbWU7XHJcbiAgICBmb3JtYXRCbG9ja3NbJ01NTSddID0gU2hvcnRNb250aE5hbWU7XHJcbiAgICBmb3JtYXRCbG9ja3NbJ01NJ10gPSBQYWRkZWRNb250aDtcclxuICAgIGZvcm1hdEJsb2Nrc1snTSddID0gTW9udGg7XHJcbiAgICBmb3JtYXRCbG9ja3NbJ0REJ10gPSBQYWRkZWREYXRlO1xyXG4gICAgZm9ybWF0QmxvY2tzWydEbyddID0gRGF0ZU9yZGluYWw7XHJcbiAgICBmb3JtYXRCbG9ja3NbJ0QnXSA9IERhdGVOdW1lcmFsO1xyXG4gICAgZm9ybWF0QmxvY2tzWydkZGRkJ10gPSBMb25nRGF5TmFtZTtcclxuICAgIGZvcm1hdEJsb2Nrc1snZGRkJ10gPSBTaG9ydERheU5hbWU7XHJcbiAgICBmb3JtYXRCbG9ja3NbJ0hIJ10gPSBQYWRkZWRNaWxpdGFyeUhvdXI7XHJcbiAgICBmb3JtYXRCbG9ja3NbJ2hoJ10gPSBQYWRkZWRIb3VyO1xyXG4gICAgZm9ybWF0QmxvY2tzWydIJ10gPSBNaWxpdGFyeUhvdXI7XHJcbiAgICBmb3JtYXRCbG9ja3NbJ2gnXSA9IEhvdXI7XHJcbiAgICBmb3JtYXRCbG9ja3NbJ0EnXSA9IFVwcGVyY2FzZU1lcmlkaWVtO1xyXG4gICAgZm9ybWF0QmxvY2tzWydhJ10gPSBMb3dlcmNhc2VNZXJpZGllbTtcclxuICAgIGZvcm1hdEJsb2Nrc1snbW0nXSA9IFBhZGRlZE1pbnV0ZTtcclxuICAgIGZvcm1hdEJsb2Nrc1snbSddID0gTWludXRlO1xyXG4gICAgZm9ybWF0QmxvY2tzWydzcyddID0gUGFkZGVkU2Vjb25kO1xyXG4gICAgZm9ybWF0QmxvY2tzWydzJ10gPSBTZWNvbmQ7XHJcbiAgICBcclxuICAgIHJldHVybiBmb3JtYXRCbG9ja3M7XHJcbn0pKCk7XHJcblxyXG5cclxuIiwiY2xhc3MgSW5wdXQge1xyXG4gICAgcHJpdmF0ZSBvcHRpb25zOiBJT3B0aW9ucztcclxuICAgIHByaXZhdGUgc2VsZWN0ZWREYXRlUGFydDogSURhdGVQYXJ0O1xyXG4gICAgcHJpdmF0ZSB0ZXh0QnVmZmVyOiBzdHJpbmcgPSBcIlwiO1xyXG4gICAgcHVibGljIGRhdGVQYXJ0czogSURhdGVQYXJ0W107XHJcbiAgICBwdWJsaWMgZm9ybWF0OiBSZWdFeHA7XHJcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZWxlbWVudDogSFRNTElucHV0RWxlbWVudCkge1xyXG4gICAgICAgIG5ldyBLZXlib2FyZEV2ZW50SGFuZGxlcih0aGlzKTtcclxuICAgICAgICBuZXcgTW91c2VFdmVudEhhbmRsZXIodGhpcyk7XHJcbiAgICAgICAgbmV3IFBhc3RlRXZlbnRIYW5kZXIodGhpcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGlzdGVuLnZpZXdjaGFuZ2VkKGVsZW1lbnQsIChlKSA9PiB0aGlzLnZpZXdjaGFuZ2VkKGUuZGF0ZSwgZS5sZXZlbCkpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0TGV2ZWxzKCk6TGV2ZWxbXSB7XHJcbiAgICAgICAgbGV0IGxldmVsczpMZXZlbFtdID0gW107XHJcbiAgICAgICAgdGhpcy5kYXRlUGFydHMuZm9yRWFjaCgoZGF0ZVBhcnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKGxldmVscy5pbmRleE9mKGRhdGVQYXJ0LmdldExldmVsKCkpID09PSAtMSAmJiBkYXRlUGFydC5pc1NlbGVjdGFibGUoKSkge1xyXG4gICAgICAgICAgICAgICAgbGV2ZWxzLnB1c2goZGF0ZVBhcnQuZ2V0TGV2ZWwoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gbGV2ZWxzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0VGV4dEJ1ZmZlcigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy50ZXh0QnVmZmVyO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgc2V0VGV4dEJ1ZmZlcihuZXdCdWZmZXI6c3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy50ZXh0QnVmZmVyID0gbmV3QnVmZmVyO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLnRleHRCdWZmZXIubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZURhdGVGcm9tQnVmZmVyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdXBkYXRlRGF0ZUZyb21CdWZmZXIoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWREYXRlUGFydC5zZXRWYWx1ZUZyb21QYXJ0aWFsKHRoaXMudGV4dEJ1ZmZlcikpIHtcclxuICAgICAgICAgICAgbGV0IG5ld0RhdGUgPSB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQuZ2V0VmFsdWUoKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnRleHRCdWZmZXIubGVuZ3RoID49IHRoaXMuc2VsZWN0ZWREYXRlUGFydC5nZXRNYXhCdWZmZXIoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy50ZXh0QnVmZmVyID0gJyc7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQgPSB0aGlzLmdldE5leHRTZWxlY3RhYmxlRGF0ZVBhcnQoKTsgICAgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRyaWdnZXIuZ290byh0aGlzLmVsZW1lbnQsIHtcclxuICAgICAgICAgICAgICAgIGRhdGU6IG5ld0RhdGUsXHJcbiAgICAgICAgICAgICAgICBsZXZlbDogdGhpcy5zZWxlY3RlZERhdGVQYXJ0LmdldExldmVsKClcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy50ZXh0QnVmZmVyID0gdGhpcy50ZXh0QnVmZmVyLnNsaWNlKDAsIC0xKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRGaXJzdFNlbGVjdGFibGVEYXRlUGFydCgpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZGF0ZVBhcnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGVQYXJ0c1tpXS5pc1NlbGVjdGFibGUoKSlcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGVQYXJ0c1tpXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZvaWQgMDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0TGFzdFNlbGVjdGFibGVEYXRlUGFydCgpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gdGhpcy5kYXRlUGFydHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZGF0ZVBhcnRzW2ldLmlzU2VsZWN0YWJsZSgpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZVBhcnRzW2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdm9pZCAwO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0TmV4dFNlbGVjdGFibGVEYXRlUGFydCgpIHtcclxuICAgICAgICBsZXQgaSA9IHRoaXMuZGF0ZVBhcnRzLmluZGV4T2YodGhpcy5zZWxlY3RlZERhdGVQYXJ0KTtcclxuICAgICAgICB3aGlsZSAoKytpIDwgdGhpcy5kYXRlUGFydHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGVQYXJ0c1tpXS5pc1NlbGVjdGFibGUoKSlcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGVQYXJ0c1tpXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWREYXRlUGFydDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldFByZXZpb3VzU2VsZWN0YWJsZURhdGVQYXJ0KCkge1xyXG4gICAgICAgIGxldCBpID0gdGhpcy5kYXRlUGFydHMuaW5kZXhPZih0aGlzLnNlbGVjdGVkRGF0ZVBhcnQpO1xyXG4gICAgICAgIHdoaWxlICgtLWkgPj0gMCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kYXRlUGFydHNbaV0uaXNTZWxlY3RhYmxlKCkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlUGFydHNbaV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQ7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXROZWFyZXN0U2VsZWN0YWJsZURhdGVQYXJ0KGNhcmV0UG9zaXRpb246IG51bWJlcikge1xyXG4gICAgICAgIGxldCBkaXN0YW5jZTpudW1iZXIgPSBOdW1iZXIuTUFYX1ZBTFVFO1xyXG4gICAgICAgIGxldCBuZWFyZXN0RGF0ZVBhcnQ6SURhdGVQYXJ0O1xyXG4gICAgICAgIGxldCBzdGFydCA9IDA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmRhdGVQYXJ0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgZGF0ZVBhcnQgPSB0aGlzLmRhdGVQYXJ0c1tpXTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChkYXRlUGFydC5pc1NlbGVjdGFibGUoKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGZyb21MZWZ0ID0gY2FyZXRQb3NpdGlvbiAtIHN0YXJ0O1xyXG4gICAgICAgICAgICAgICAgbGV0IGZyb21SaWdodCA9IGNhcmV0UG9zaXRpb24gLSAoc3RhcnQgKyBkYXRlUGFydC50b1N0cmluZygpLmxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGlmIChmcm9tTGVmdCA+IDAgJiYgZnJvbVJpZ2h0IDwgMCkgcmV0dXJuIGRhdGVQYXJ0O1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBsZXQgZCA9IE1hdGgubWluKE1hdGguYWJzKGZyb21MZWZ0KSwgTWF0aC5hYnMoZnJvbVJpZ2h0KSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZCA8PSBkaXN0YW5jZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5lYXJlc3REYXRlUGFydCA9IGRhdGVQYXJ0O1xyXG4gICAgICAgICAgICAgICAgICAgIGRpc3RhbmNlID0gZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgc3RhcnQgKz0gZGF0ZVBhcnQudG9TdHJpbmcoKS5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiBuZWFyZXN0RGF0ZVBhcnQ7ICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHNldFNlbGVjdGVkRGF0ZVBhcnQoZGF0ZVBhcnQ6SURhdGVQYXJ0KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWREYXRlUGFydCAhPT0gZGF0ZVBhcnQpIHtcclxuICAgICAgICAgICAgdGhpcy50ZXh0QnVmZmVyID0gJyc7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWREYXRlUGFydCA9IGRhdGVQYXJ0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldFNlbGVjdGVkRGF0ZVBhcnQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWREYXRlUGFydDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHVwZGF0ZU9wdGlvbnMob3B0aW9uczpJT3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5kYXRlUGFydHMgPSBQYXJzZXIucGFyc2Uob3B0aW9ucy5kaXNwbGF5QXMpO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWREYXRlUGFydCA9IHZvaWQgMDtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgZm9ybWF0OnN0cmluZyA9ICdeJztcclxuICAgICAgICB0aGlzLmRhdGVQYXJ0cy5mb3JFYWNoKChkYXRlUGFydCkgPT4ge1xyXG4gICAgICAgICAgICBmb3JtYXQgKz0gYCgke2RhdGVQYXJ0LmdldFJlZ0V4KCkuc291cmNlLnNsaWNlKDEsLTEpfSlgO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuZm9ybWF0ID0gbmV3IFJlZ0V4cChmb3JtYXQrJyQnLCAnaScpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgdGhpcy51cGRhdGVWaWV3KCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB1cGRhdGVWaWV3KCkge1xyXG4gICAgICAgIGxldCBkYXRlU3RyaW5nID0gJyc7XHJcbiAgICAgICAgdGhpcy5kYXRlUGFydHMuZm9yRWFjaCgoZGF0ZVBhcnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKGRhdGVQYXJ0LmdldFZhbHVlKCkgPT09IHZvaWQgMCkgcmV0dXJuO1xyXG4gICAgICAgICAgICBkYXRlU3RyaW5nICs9IGRhdGVQYXJ0LnRvU3RyaW5nKCk7IFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC52YWx1ZSA9IGRhdGVTdHJpbmc7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWREYXRlUGFydCA9PT0gdm9pZCAwKSByZXR1cm47XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHN0YXJ0ID0gMDtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgaSA9IDA7XHJcbiAgICAgICAgd2hpbGUgKHRoaXMuZGF0ZVBhcnRzW2ldICE9PSB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQpIHtcclxuICAgICAgICAgICAgc3RhcnQgKz0gdGhpcy5kYXRlUGFydHNbaSsrXS50b1N0cmluZygpLmxlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGVuZCA9IHN0YXJ0ICsgdGhpcy5zZWxlY3RlZERhdGVQYXJ0LnRvU3RyaW5nKCkubGVuZ3RoO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZShzdGFydCwgZW5kKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHZpZXdjaGFuZ2VkKGRhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWwpIHtcclxuICAgICAgICB0aGlzLmRhdGVQYXJ0cy5mb3JFYWNoKChkYXRlUGFydCkgPT4ge1xyXG4gICAgICAgICAgICBkYXRlUGFydC5zZXRWYWx1ZShkYXRlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHRyaWdnZXJWaWV3Q2hhbmdlKCkge1xyXG4gICAgICAgIHRyaWdnZXIudmlld2NoYW5nZWQodGhpcy5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgIGRhdGU6IHRoaXMuZ2V0U2VsZWN0ZWREYXRlUGFydCgpLmdldFZhbHVlKCksXHJcbiAgICAgICAgICAgIGxldmVsOiB0aGlzLmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5nZXRMZXZlbCgpXHJcbiAgICAgICAgfSk7ICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG59IiwiY29uc3QgZW51bSBLRVkge1xyXG4gICAgUklHSFQgPSAzOSwgTEVGVCA9IDM3LCBUQUIgPSA5LCBVUCA9IDM4LFxyXG4gICAgRE9XTiA9IDQwLCBWID0gODYsIEMgPSA2NywgQSA9IDY1LCBIT01FID0gMzYsXHJcbiAgICBFTkQgPSAzNSwgQkFDS1NQQUNFID0gOFxyXG59XHJcblxyXG5jbGFzcyBLZXlib2FyZEV2ZW50SGFuZGxlciB7XHJcbiAgICBwcml2YXRlIHNoaWZ0VGFiRG93biA9IGZhbHNlO1xyXG4gICAgcHJpdmF0ZSB0YWJEb3duID0gZmFsc2U7XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgaW5wdXQ6SW5wdXQpIHtcclxuICAgICAgICBpbnB1dC5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIChlKSA9PiB0aGlzLmtleWRvd24oZSkpO1xyXG4gICAgICAgIGlucHV0LmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImZvY3VzXCIsICgpID0+IHRoaXMuZm9jdXMoKSk7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgKGUpID0+IHRoaXMuZG9jdW1lbnRLZXlkb3duKGUpKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGZvY3VzID0gKCk6dm9pZCA9PiB7XHJcbiAgICAgICAgaWYgKHRoaXMudGFiRG93bikge1xyXG4gICAgICAgICAgICBsZXQgZmlyc3QgPSB0aGlzLmlucHV0LmdldEZpcnN0U2VsZWN0YWJsZURhdGVQYXJ0KCk7XHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChmaXJzdCk7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICB0aGlzLmlucHV0LnRyaWdnZXJWaWV3Q2hhbmdlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zaGlmdFRhYkRvd24pIHtcclxuICAgICAgICAgICAgbGV0IGxhc3QgPSB0aGlzLmlucHV0LmdldExhc3RTZWxlY3RhYmxlRGF0ZVBhcnQoKTtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC5zZXRTZWxlY3RlZERhdGVQYXJ0KGxhc3QpO1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgdGhpcy5pbnB1dC50cmlnZ2VyVmlld0NoYW5nZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgZG9jdW1lbnRLZXlkb3duKGU6S2V5Ym9hcmRFdmVudCkge1xyXG4gICAgICAgIGlmIChlLnNoaWZ0S2V5ICYmIGUua2V5Q29kZSA9PT0gS0VZLlRBQikge1xyXG4gICAgICAgICAgICB0aGlzLnNoaWZ0VGFiRG93biA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIGlmIChlLmtleUNvZGUgPT09IEtFWS5UQUIpIHtcclxuICAgICAgICAgICAgdGhpcy50YWJEb3duID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hpZnRUYWJEb3duID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMudGFiRG93biA9IGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGtleWRvd24oZTpLZXlib2FyZEV2ZW50KSB7XHJcbiAgICAgICAgbGV0IGNvZGUgPSBlLmtleUNvZGU7XHJcbiAgICAgICAgaWYgKGNvZGUgPj0gOTYgJiYgY29kZSA8PSAxMDUpIHtcclxuICAgICAgICAgICAgY29kZSAtPSA0ODtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKChjb2RlID09PSBLRVkuSE9NRSB8fCBjb2RlID09PSBLRVkuRU5EKSAmJiBlLnNoaWZ0S2V5KSByZXR1cm47XHJcbiAgICAgICAgaWYgKChjb2RlID09PSBLRVkuTEVGVCB8fCBjb2RlID09PSBLRVkuUklHSFQpICYmIGUuc2hpZnRLZXkpIHJldHVybjtcclxuICAgICAgICBpZiAoKGNvZGUgPT09IEtFWS5DIHx8IGNvZGUgPT09IEtFWS5BIHx8IGNvZGUgPT09IEtFWS5WKSAmJiBlLmN0cmxLZXkpIHJldHVybjtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgcHJldmVudERlZmF1bHQgPSB0cnVlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChjb2RlID09PSBLRVkuSE9NRSkge1xyXG4gICAgICAgICAgICB0aGlzLmhvbWUoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IEtFWS5FTkQpIHtcclxuICAgICAgICAgICAgdGhpcy5lbmQoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IEtFWS5MRUZUKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGVmdCgpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gS0VZLlJJR0hUKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmlnaHQoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IEtFWS5UQUIgJiYgZS5zaGlmdEtleSkge1xyXG4gICAgICAgICAgICBwcmV2ZW50RGVmYXVsdCA9IHRoaXMuc2hpZnRUYWIoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IEtFWS5UQUIpIHtcclxuICAgICAgICAgICAgcHJldmVudERlZmF1bHQgPSB0aGlzLnRhYigpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gS0VZLlVQKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXAoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IEtFWS5ET1dOKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZG93bigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZiAocHJldmVudERlZmF1bHQpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBsZXQga2V5UHJlc3NlZCA9IFN0cmluZy5mcm9tQ2hhckNvZGUoY29kZSk7XHJcbiAgICAgICAgaWYgKC9eWzAtOV18W0Etel0kLy50ZXN0KGtleVByZXNzZWQpKSB7XHJcbiAgICAgICAgICAgIGxldCB0ZXh0QnVmZmVyID0gdGhpcy5pbnB1dC5nZXRUZXh0QnVmZmVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXQuc2V0VGV4dEJ1ZmZlcih0ZXh0QnVmZmVyICsga2V5UHJlc3NlZCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb2RlID09PSBLRVkuQkFDS1NQQUNFKSB7XHJcbiAgICAgICAgICAgIGxldCB0ZXh0QnVmZmVyID0gdGhpcy5pbnB1dC5nZXRUZXh0QnVmZmVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXQuc2V0VGV4dEJ1ZmZlcih0ZXh0QnVmZmVyLnNsaWNlKDAsIC0xKSk7XHJcbiAgICAgICAgfSBlbHNlIGlmICghZS5zaGlmdEtleSkge1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0LnNldFRleHRCdWZmZXIoJycpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBob21lKCkge1xyXG4gICAgICAgIGxldCBmaXJzdCA9IHRoaXMuaW5wdXQuZ2V0Rmlyc3RTZWxlY3RhYmxlRGF0ZVBhcnQoKTtcclxuICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQoZmlyc3QpO1xyXG4gICAgICAgIHRoaXMuaW5wdXQudHJpZ2dlclZpZXdDaGFuZ2UoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBlbmQoKSB7XHJcbiAgICAgICAgbGV0IGxhc3QgPSB0aGlzLmlucHV0LmdldExhc3RTZWxlY3RhYmxlRGF0ZVBhcnQoKTtcclxuICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQobGFzdCk7ICAgICBcclxuICAgICAgICB0aGlzLmlucHV0LnRyaWdnZXJWaWV3Q2hhbmdlKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgbGVmdCgpIHtcclxuICAgICAgICBsZXQgcHJldmlvdXMgPSB0aGlzLmlucHV0LmdldFByZXZpb3VzU2VsZWN0YWJsZURhdGVQYXJ0KCk7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5zZXRTZWxlY3RlZERhdGVQYXJ0KHByZXZpb3VzKTtcclxuICAgICAgICB0aGlzLmlucHV0LnRyaWdnZXJWaWV3Q2hhbmdlKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgcmlnaHQoKSB7XHJcbiAgICAgICAgbGV0IG5leHQgPSB0aGlzLmlucHV0LmdldE5leHRTZWxlY3RhYmxlRGF0ZVBhcnQoKTtcclxuICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQobmV4dCk7XHJcbiAgICAgICAgdGhpcy5pbnB1dC50cmlnZ2VyVmlld0NoYW5nZSgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHNoaWZ0VGFiKCkge1xyXG4gICAgICAgIGxldCBwcmV2aW91cyA9IHRoaXMuaW5wdXQuZ2V0UHJldmlvdXNTZWxlY3RhYmxlRGF0ZVBhcnQoKTtcclxuICAgICAgICBpZiAocHJldmlvdXMgIT09IHRoaXMuaW5wdXQuZ2V0U2VsZWN0ZWREYXRlUGFydCgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChwcmV2aW91cyk7XHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXQudHJpZ2dlclZpZXdDaGFuZ2UoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSB0YWIoKSB7XHJcbiAgICAgICAgbGV0IG5leHQgPSB0aGlzLmlucHV0LmdldE5leHRTZWxlY3RhYmxlRGF0ZVBhcnQoKTtcclxuICAgICAgICBpZiAobmV4dCAhPT0gdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkpIHtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC5zZXRTZWxlY3RlZERhdGVQYXJ0KG5leHQpO1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0LnRyaWdnZXJWaWV3Q2hhbmdlKCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgdXAoKSB7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuaW5jcmVtZW50KCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGxldmVsID0gdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0TGV2ZWwoKTtcclxuICAgICAgICBsZXQgZGF0ZSA9IHRoaXMuaW5wdXQuZ2V0U2VsZWN0ZWREYXRlUGFydCgpLmdldFZhbHVlKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdHJpZ2dlci5nb3RvKHRoaXMuaW5wdXQuZWxlbWVudCwge1xyXG4gICAgICAgICAgICBkYXRlOiBkYXRlLFxyXG4gICAgICAgICAgICBsZXZlbDogbGV2ZWxcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBkb3duKCkge1xyXG4gICAgICAgIHRoaXMuaW5wdXQuZ2V0U2VsZWN0ZWREYXRlUGFydCgpLmRlY3JlbWVudCgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBsZXZlbCA9IHRoaXMuaW5wdXQuZ2V0U2VsZWN0ZWREYXRlUGFydCgpLmdldExldmVsKCk7XHJcbiAgICAgICAgbGV0IGRhdGUgPSB0aGlzLmlucHV0LmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5nZXRWYWx1ZSgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRyaWdnZXIuZ290byh0aGlzLmlucHV0LmVsZW1lbnQsIHtcclxuICAgICAgICAgICAgZGF0ZTogZGF0ZSxcclxuICAgICAgICAgICAgbGV2ZWw6IGxldmVsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0iLCJjbGFzcyBNb3VzZUV2ZW50SGFuZGxlciB7XHJcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGlucHV0OklucHV0KSB7XHJcbiAgICAgICAgbGlzdGVuLm1vdXNlZG93bihpbnB1dC5lbGVtZW50LCAoKSA9PiB0aGlzLm1vdXNlZG93bigpKTtcclxuICAgICAgICBsaXN0ZW4ubW91c2V1cChkb2N1bWVudCwgKCkgPT4gdGhpcy5tb3VzZXVwKCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFN0b3AgZGVmYXVsdFxyXG4gICAgICAgIGlucHV0LmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdlbnRlclwiLCAoZSkgPT4gZS5wcmV2ZW50RGVmYXVsdCgpKTtcclxuICAgICAgICBpbnB1dC5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnb3ZlclwiLCAoZSkgPT4gZS5wcmV2ZW50RGVmYXVsdCgpKTtcclxuICAgICAgICBpbnB1dC5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkcm9wXCIsIChlKSA9PiBlLnByZXZlbnREZWZhdWx0KCkpO1xyXG4gICAgICAgIGlucHV0LmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImN1dFwiLCAoZSkgPT4gZS5wcmV2ZW50RGVmYXVsdCgpKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBkb3duOmJvb2xlYW47XHJcbiAgICBwcml2YXRlIGNhcmV0U3RhcnQ6bnVtYmVyO1xyXG4gICAgXHJcbiAgICBwcml2YXRlIG1vdXNlZG93bigpIHtcclxuICAgICAgICB0aGlzLmRvd24gPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuaW5wdXQuZWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZSh2b2lkIDAsIHZvaWQgMCk7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgdGhpcy5jYXJldFN0YXJ0ID0gdGhpcy5pbnB1dC5lbGVtZW50LnNlbGVjdGlvblN0YXJ0OyBcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBtb3VzZXVwID0gKCkgPT4ge1xyXG4gICAgICAgIGlmICghdGhpcy5kb3duKSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5kb3duID0gZmFsc2U7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHBvczpudW1iZXI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMuaW5wdXQuZWxlbWVudC5zZWxlY3Rpb25TdGFydCA9PT0gdGhpcy5jYXJldFN0YXJ0KSB7XHJcbiAgICAgICAgICAgIHBvcyA9IHRoaXMuaW5wdXQuZWxlbWVudC5zZWxlY3Rpb25FbmQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcG9zID0gdGhpcy5pbnB1dC5lbGVtZW50LnNlbGVjdGlvblN0YXJ0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBsZXQgYmxvY2sgPSB0aGlzLmlucHV0LmdldE5lYXJlc3RTZWxlY3RhYmxlRGF0ZVBhcnQocG9zKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQoYmxvY2spO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLmlucHV0LmVsZW1lbnQuc2VsZWN0aW9uU3RhcnQgPiAwIHx8IHRoaXMuaW5wdXQuZWxlbWVudC5zZWxlY3Rpb25FbmQgPCB0aGlzLmlucHV0LmVsZW1lbnQudmFsdWUubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXQudHJpZ2dlclZpZXdDaGFuZ2UoKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59IiwiY2xhc3MgUGFyc2VyIHtcclxuICAgIHB1YmxpYyBzdGF0aWMgcGFyc2UoZm9ybWF0OnN0cmluZyk6SURhdGVQYXJ0W10ge1xyXG4gICAgICAgIGxldCB0ZXh0QnVmZmVyID0gJyc7XHJcbiAgICAgICAgbGV0IGRhdGVQYXJ0czpJRGF0ZVBhcnRbXSA9IFtdO1xyXG4gICAgXHJcbiAgICAgICAgbGV0IGluZGV4ID0gMDsgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgbGV0IGluRXNjYXBlZFNlZ21lbnQgPSBmYWxzZTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgcHVzaFBsYWluVGV4dCA9ICgpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRleHRCdWZmZXIubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgZGF0ZVBhcnRzLnB1c2gobmV3IFBsYWluVGV4dCh0ZXh0QnVmZmVyKS5zZXRTZWxlY3RhYmxlKGZhbHNlKSk7XHJcbiAgICAgICAgICAgICAgICB0ZXh0QnVmZmVyID0gJyc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgd2hpbGUgKGluZGV4IDwgZm9ybWF0Lmxlbmd0aCkgeyAgICAgXHJcbiAgICAgICAgICAgIGlmICghaW5Fc2NhcGVkU2VnbWVudCAmJiBmb3JtYXRbaW5kZXhdID09PSAnWycpIHtcclxuICAgICAgICAgICAgICAgIGluRXNjYXBlZFNlZ21lbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgaW5kZXgrKztcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoaW5Fc2NhcGVkU2VnbWVudCAmJiBmb3JtYXRbaW5kZXhdID09PSAnXScpIHtcclxuICAgICAgICAgICAgICAgIGluRXNjYXBlZFNlZ21lbnQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGluZGV4Kys7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKGluRXNjYXBlZFNlZ21lbnQpIHtcclxuICAgICAgICAgICAgICAgIHRleHRCdWZmZXIgKz0gZm9ybWF0W2luZGV4XTtcclxuICAgICAgICAgICAgICAgIGluZGV4Kys7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IGZvdW5kID0gZmFsc2U7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBmb3IgKGxldCBjb2RlIGluIGZvcm1hdEJsb2Nrcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKFBhcnNlci5maW5kQXQoZm9ybWF0LCBpbmRleCwgYHske2NvZGV9fWApKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHVzaFBsYWluVGV4dCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGVQYXJ0cy5wdXNoKG5ldyBmb3JtYXRCbG9ja3NbY29kZV0oKS5zZXRTZWxlY3RhYmxlKGZhbHNlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggKz0gY29kZS5sZW5ndGggKyAyO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoUGFyc2VyLmZpbmRBdChmb3JtYXQsIGluZGV4LCBjb2RlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHB1c2hQbGFpblRleHQoKTtcclxuICAgICAgICAgICAgICAgICAgICBkYXRlUGFydHMucHVzaChuZXcgZm9ybWF0QmxvY2tzW2NvZGVdKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGluZGV4ICs9IGNvZGUubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKCFmb3VuZCkge1xyXG4gICAgICAgICAgICAgICAgdGV4dEJ1ZmZlciArPSBmb3JtYXRbaW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgaW5kZXgrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVzaFBsYWluVGV4dCgpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIGRhdGVQYXJ0cztcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgZmluZEF0IChzdHI6c3RyaW5nLCBpbmRleDpudW1iZXIsIHNlYXJjaDpzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gc3RyLnNsaWNlKGluZGV4LCBpbmRleCArIHNlYXJjaC5sZW5ndGgpID09PSBzZWFyY2g7XHJcbiAgICB9XHJcbn0iLCJjbGFzcyBQYXN0ZUV2ZW50SGFuZGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgaW5wdXQ6SW5wdXQpIHtcclxuICAgICAgICBsaXN0ZW4ucGFzdGUoaW5wdXQuZWxlbWVudCwgKCkgPT4gdGhpcy5wYXN0ZSgpKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBwYXN0ZSgpIHtcclxuICAgICAgICBsZXQgb3JpZ2luYWxWYWx1ZSA9IHRoaXMuaW5wdXQuZWxlbWVudC52YWx1ZTtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICBpZiAoIXRoaXMuaW5wdXQuZm9ybWF0LnRlc3QodGhpcy5pbnB1dC5lbGVtZW50LnZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICB0aGlzLmlucHV0LmVsZW1lbnQudmFsdWUgPSBvcmlnaW5hbFZhbHVlO1xyXG4gICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgfSBcclxuICAgICAgICAgICBcclxuICAgICAgICAgICBsZXQgbmV3RGF0ZSA9IHRoaXMuaW5wdXQuZ2V0U2VsZWN0ZWREYXRlUGFydCgpLmdldFZhbHVlKCk7XHJcbiAgICAgICAgICAgXHJcbiAgICAgICAgICAgbGV0IHN0clByZWZpeCA9ICcnO1xyXG4gICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5pbnB1dC5kYXRlUGFydHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgbGV0IGRhdGVQYXJ0ID0gdGhpcy5pbnB1dC5kYXRlUGFydHNbaV07XHJcbiAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICBsZXQgcmVnRXhwID0gbmV3IFJlZ0V4cChkYXRlUGFydC5nZXRSZWdFeCgpLnNvdXJjZS5zbGljZSgxLCAtMSksICdpJyk7XHJcbiAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICBsZXQgdmFsID0gdGhpcy5pbnB1dC5lbGVtZW50LnZhbHVlLnJlcGxhY2Uoc3RyUHJlZml4LCAnJykubWF0Y2gocmVnRXhwKVswXTtcclxuICAgICAgICAgICAgICAgc3RyUHJlZml4ICs9IHZhbDtcclxuICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgIGlmICghZGF0ZVBhcnQuaXNTZWxlY3RhYmxlKCkpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgZGF0ZVBhcnQuc2V0VmFsdWUobmV3RGF0ZSk7XHJcbiAgICAgICAgICAgICAgIGlmIChkYXRlUGFydC5zZXRWYWx1ZSh2YWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICBuZXdEYXRlID0gZGF0ZVBhcnQuZ2V0VmFsdWUoKTtcclxuICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQuZWxlbWVudC52YWx1ZSA9IG9yaWdpbmFsVmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICB9XHJcbiAgICAgICAgICAgXHJcbiAgICAgICAgICAgdHJpZ2dlci5nb3RvKHRoaXMuaW5wdXQuZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICBkYXRlOiBuZXdEYXRlLFxyXG4gICAgICAgICAgICAgICBsZXZlbDogdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0TGV2ZWwoKVxyXG4gICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgIFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwiY2xhc3MgRGF0ZVBpY2tlciBpbXBsZW1lbnRzIElQaWNrZXIge1xyXG4gICAgXHJcbn0iLCJjbGFzcyBIZWFkZXIge1xyXG4gICAgcHJpdmF0ZSB5ZWFyTGFiZWw6RWxlbWVudDtcclxuICAgIHByaXZhdGUgbW9udGhMYWJlbDpFbGVtZW50O1xyXG4gICAgcHJpdmF0ZSBkYXRlTGFiZWw6RWxlbWVudDtcclxuICAgIHByaXZhdGUgaG91ckxhYmVsOkVsZW1lbnQ7XHJcbiAgICBwcml2YXRlIG1pbnV0ZUxhYmVsOkVsZW1lbnQ7XHJcbiAgICBwcml2YXRlIHNlY29uZExhYmVsOkVsZW1lbnQ7XHJcbiAgICBcclxuICAgIHByaXZhdGUgbGFiZWxzOkVsZW1lbnRbXTtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBvcHRpb25zOklPcHRpb25zO1xyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVsZW1lbnQ6SFRNTEVsZW1lbnQsIHByaXZhdGUgY29udGFpbmVyOkhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgbGlzdGVuLnZpZXdjaGFuZ2VkKGVsZW1lbnQsIChlKSA9PiB0aGlzLnZpZXdjaGFuZ2VkKGUuZGF0ZSwgZS5sZXZlbCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMueWVhckxhYmVsID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS15ZWFyJyk7XHJcbiAgICAgICAgdGhpcy5tb250aExhYmVsID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS1tb250aCcpO1xyXG4gICAgICAgIHRoaXMuZGF0ZUxhYmVsID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS1kYXRlJyk7XHJcbiAgICAgICAgdGhpcy5ob3VyTGFiZWwgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcignZGF0aXVtLXNwYW4tbGFiZWwuZGF0aXVtLWhvdXInKTtcclxuICAgICAgICB0aGlzLm1pbnV0ZUxhYmVsID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS1taW51dGUnKTtcclxuICAgICAgICB0aGlzLnNlY29uZExhYmVsID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS1zZWNvbmQnKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmxhYmVscyA9IFt0aGlzLnllYXJMYWJlbCwgdGhpcy5tb250aExhYmVsLCB0aGlzLmRhdGVMYWJlbCwgdGhpcy5ob3VyTGFiZWwsIHRoaXMubWludXRlTGFiZWwsIHRoaXMuc2Vjb25kTGFiZWxdO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHZpZXdjaGFuZ2VkKGRhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWwpIHtcclxuICAgICAgICB0aGlzLmxhYmVscy5mb3JFYWNoKChsYWJlbCwgaSkgPT4ge1xyXG4gICAgICAgICAgICBsYWJlbC5jbGFzc0xpc3QucmVtb3ZlKCdkYXRpdW0tdG9wJyk7XHJcbiAgICAgICAgICAgIGxhYmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1ib3R0b20nKTtcclxuICAgICAgICAgICAgbGFiZWwuY2xhc3NMaXN0LnJlbW92ZSgnZGF0aXVtLWhpZGRlbicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKGkgPCBsZXZlbCkge1xyXG4gICAgICAgICAgICAgICAgbGFiZWwuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLXRvcCcpO1xyXG4gICAgICAgICAgICAgICAgbGFiZWwuaW5uZXJIVE1MID0gdGhpcy5nZXRIZWFkZXJUb3BUZXh0KGRhdGUsIGkpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGFiZWwuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLWJvdHRvbScpO1xyXG4gICAgICAgICAgICAgICAgbGFiZWwuaW5uZXJIVE1MID0gdGhpcy5nZXRIZWFkZXJCb3R0b21UZXh0KGRhdGUsIGkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoaSA8IGxldmVsIC0gMSB8fCBpID4gbGV2ZWwpIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1oaWRkZW4nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyBnZW5yZUFMIFVTRT9cclxuICAgIHByaXZhdGUgZ2V0TW9udGgoZGF0ZTpEYXRlKTpzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiBbJ0pBTicsICdGRUInLCAnTUFSJywgJ0FQUicsICdNQVknLCAnSlVOJywgJ0pVTCcsICdBVUcnLCAnU0VQJywgJ09DVCcsICdOT1YnLCAnREVDJ11bZGF0ZS5nZXRNb250aCgpXTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gZ2VucmVBTCBVU0U/XHJcbiAgICBwcml2YXRlIGdldERheShkYXRlOkRhdGUpOnN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIFsnU1VOJywgJ01PTicsICdUVUUnLCAnV0VEJywgJ1RIVScsICdGUkknLCAnU0FUJ11bZGF0ZS5nZXREYXkoKV07XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgZ2V0SGVhZGVyVG9wVGV4dChkYXRlOkRhdGUsIGxldmVsOkxldmVsKTpzdHJpbmcge1xyXG4gICAgICAgIHN3aXRjaChsZXZlbCkge1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLllFQVI6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXREZWNhZGUoZGF0ZSk7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuTU9OVEg6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0ZS5nZXRGdWxsWWVhcigpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuREFURTpcclxuICAgICAgICAgICAgICAgIHJldHVybiBgJHt0aGlzLmdldE1vbnRoKGRhdGUpfSAke2RhdGUuZ2V0RnVsbFllYXIoKX1gO1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLkhPVVI6XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuTUlOVVRFOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3RoaXMuZ2V0RGF5KGRhdGUpfSAke3RoaXMucGFkKGRhdGUuZ2V0RGF0ZSgpKX0gJHt0aGlzLmdldE1vbnRoKGRhdGUpfSAke2RhdGUuZ2V0RnVsbFllYXIoKX1gO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gZ2VucmVBTCBVU0U/XHJcbiAgICBwcml2YXRlIHBhZChudW06bnVtYmVyfHN0cmluZywgc2l6ZTpudW1iZXIgPSAyKSB7XHJcbiAgICAgICAgbGV0IHN0ciA9IG51bS50b1N0cmluZygpO1xyXG4gICAgICAgIHdoaWxlKHN0ci5sZW5ndGggPCBzaXplKSBzdHIgPSAnMCcgKyBzdHI7XHJcbiAgICAgICAgcmV0dXJuIHN0cjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gZ2VuZXJhbCB1c2U/XHJcbiAgICBwcml2YXRlIGdldERlY2FkZShkYXRlOkRhdGUpOnN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIGAke01hdGguZmxvb3IoZGF0ZS5nZXRGdWxsWWVhcigpLzEwKSoxMH0gLSAke01hdGguY2VpbCgoZGF0ZS5nZXRGdWxsWWVhcigpICsgMSkvMTApKjEwfWA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIGdlbmVyYWwgdXNlP1xyXG4gICAgcHJpdmF0ZSBnZXRIb3VycyhkYXRlOkRhdGUpOnN0cmluZyB7XHJcbiAgICAgICAgbGV0IG51bSA9IGRhdGUuZ2V0SG91cnMoKTtcclxuICAgICAgICBpZiAobnVtID09PSAwKSBudW0gPSAxMjtcclxuICAgICAgICBpZiAobnVtID4gMTIpIG51bSAtPSAxMjtcclxuICAgICAgICByZXR1cm4gbnVtLnRvU3RyaW5nKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIGdlbmVyYWwgdXNlP1xyXG4gICAgcHJpdmF0ZSBnZXRNZXJpZGllbShkYXRlOkRhdGUpOnN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIGRhdGUuZ2V0SG91cnMoKSA8IDEyID8gJ0FNJyA6ICdQTSc7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgZ2V0SGVhZGVyQm90dG9tVGV4dChkYXRlOkRhdGUsIGxldmVsOkxldmVsKTpzdHJpbmcge1xyXG4gICAgICAgIHN3aXRjaChsZXZlbCkge1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLllFQVI6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXREZWNhZGUoZGF0ZSk7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuTU9OVEg6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0ZS5nZXRGdWxsWWVhcigpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuREFURTpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE1vbnRoKGRhdGUpO1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLkhPVVI6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7dGhpcy5nZXREYXkoZGF0ZSl9ICR7dGhpcy5wYWQoZGF0ZS5nZXREYXRlKCkpfSA8ZGF0aXVtLXZhcmlhYmxlPiR7dGhpcy5nZXRIb3VycyhkYXRlKX0ke3RoaXMuZ2V0TWVyaWRpZW0oZGF0ZSl9PC9kYXRpdW0tdmFyaWFibGU+YDtcclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5NSU5VVEU6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7dGhpcy5nZXRIb3VycyhkYXRlKX06PGRhdGl1bS12YXJpYWJsZT4ke3RoaXMucGFkKGRhdGUuZ2V0TWludXRlcygpKX08L2RhdGl1bS12YXJpYWJsZT4ke3RoaXMuZ2V0TWVyaWRpZW0oZGF0ZSl9YDtcclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5TRUNPTkQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7dGhpcy5nZXRIb3VycyhkYXRlKX06JHt0aGlzLnBhZChkYXRlLmdldE1pbnV0ZXMoKSl9OjxkYXRpdW0tdmFyaWFibGU+JHt0aGlzLnBhZChkYXRlLmdldFNlY29uZHMoKSl9PC9kYXRpdW0tdmFyaWFibGU+JHt0aGlzLmdldE1lcmlkaWVtKGRhdGUpfWA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHVwZGF0ZU9wdGlvbnMob3B0aW9uczpJT3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XHJcbiAgICB9XHJcbn0iLCJjbGFzcyBIb3VyUGlja2VyIGltcGxlbWVudHMgSVBpY2tlciB7XHJcbiAgICBcclxufSIsImNsYXNzIE1pbnV0ZVBpY2tlciBpbXBsZW1lbnRzIElQaWNrZXIge1xyXG4gICAgXHJcbn0iLCJjbGFzcyBNb250aFBpY2tlciBpbXBsZW1lbnRzIElQaWNrZXIge1xyXG4gICAgXHJcbn0iLCJjbGFzcyBQaWNrZXJNYW5hZ2VyIHtcclxuICAgIHByaXZhdGUgb3B0aW9uczpJT3B0aW9ucztcclxuICAgIHByaXZhdGUgY29udGFpbmVyOkhUTUxFbGVtZW50O1xyXG4gICAgcHJpdmF0ZSBoZWFkZXI6SGVhZGVyO1xyXG4gICAgcHJpdmF0ZSBwaWNrZXJzOklQaWNrZXJbXTtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBlbGVtZW50OkhUTUxJbnB1dEVsZW1lbnQpIHtcclxuICAgICAgICB0aGlzLmNvbnRhaW5lciA9IHRoaXMuY3JlYXRlVmlldygpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuaW5zZXJ0QWZ0ZXIoZWxlbWVudCwgdGhpcy5jb250YWluZXIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuaGVhZGVyID0gbmV3IEhlYWRlcihlbGVtZW50LCB0aGlzLmNvbnRhaW5lcik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGlzdGVuLnZpZXdjaGFuZ2VkKGVsZW1lbnQsIChlKSA9PiB0aGlzLnZpZXdjaGFuZ2VkKGUuZGF0ZSwgZS5sZXZlbCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi5kb3duKHRoaXMuY29udGFpbmVyLCAnKicsIChlKSA9PiB0aGlzLmRvd24oZSkpO1xyXG4gICAgICAgIGxpc3Rlbi51cChkb2N1bWVudCwgKCkgPT4gdGhpcy51cCgpKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSB1cCgpIHtcclxuICAgICAgICBsZXQgYWN0aXZlRWxlbWVudHMgPSB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCcuZGF0aXVtLWFjdGl2ZScpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWN0aXZlRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgYWN0aXZlRWxlbWVudHNbaV0uY2xhc3NMaXN0LnJlbW92ZSgnZGF0aXVtLWFjdGl2ZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdkYXRpdW0tYWN0aXZlJyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgZG93bihlOk1vdXNlRXZlbnR8VG91Y2hFdmVudCkge1xyXG4gICAgICAgIGxldCBlbCA9IGUuc3JjRWxlbWVudCB8fCA8RWxlbWVudD5lLnRhcmdldDtcclxuICAgICAgICB3aGlsZSAoZWwgIT09IHRoaXMuY29udGFpbmVyKSB7XHJcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1hY3RpdmUnKTtcclxuICAgICAgICAgICAgZWwgPSBlbC5wYXJlbnRFbGVtZW50O1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tYWN0aXZlJyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgY3VycmVudFBpY2tlcjpJUGlja2VyO1xyXG4gICAgXHJcbiAgICBwcml2YXRlIHZpZXdjaGFuZ2VkKGRhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWwpOnZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLnBpY2tlcnNbbGV2ZWxdID09PSB2b2lkIDApIHJldHVybjsgLy8gY2xvc2UgdGhlIHBpY2tlclxyXG4gICAgICAgIHRoaXMuY3VycmVudFBpY2tlciA9IHRoaXMucGlja2Vyc1tsZXZlbF07XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB1cGRhdGVPcHRpb25zKG9wdGlvbnM6SU9wdGlvbnMsIGxldmVsczpMZXZlbFtdKSB7XHJcbiAgICAgICAgbGV0IHRoZW1lVXBkYXRlZCA9IHRoaXMub3B0aW9ucyA9PT0gdm9pZCAwIHx8XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy50aGVtZSA9PT0gdm9pZCAwIHx8XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy50aGVtZS5wcmltYXJ5ICE9PSBvcHRpb25zLnRoZW1lLnByaW1hcnkgfHxcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnRoZW1lLnByaW1hcnlfdGV4dCAhPT0gb3B0aW9ucy50aGVtZS5wcmltYXJ5X3RleHQgfHxcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnRoZW1lLnNlY29uZGFyeSAhPT0gb3B0aW9ucy50aGVtZS5zZWNvbmRhcnkgfHxcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnRoZW1lLnNlY29uZGFyeV9hY2NlbnQgIT09IG9wdGlvbnMudGhlbWUuc2Vjb25kYXJ5X2FjY2VudCB8fFxyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMudGhlbWUuc2Vjb25kYXJ5X3RleHQgIT09IG9wdGlvbnMudGhlbWUuc2Vjb25kYXJ5X3RleHQ7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuICAgICAgICBcclxuICAgICAgICBpZiAodGhlbWVVcGRhdGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5zZXJ0U3R5bGVzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMucGlja2VycyA9IFtdO1xyXG4gICAgICAgIGxldmVscy5mb3JFYWNoKChsZXZlbCkgPT4ge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKGxldmVsKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIExldmVsLllFQVI6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5waWNrZXJzW0xldmVsLllFQVJdID0gbmV3IFllYXJQaWNrZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgTGV2ZWwuTU9OVEg6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5waWNrZXJzW0xldmVsLk1PTlRIXSA9IG5ldyBNb250aFBpY2tlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBMZXZlbC5EQVRFOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGlja2Vyc1tMZXZlbC5EQVRFXSA9IG5ldyBEYXRlUGlja2VyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIExldmVsLkhPVVI6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5waWNrZXJzW0xldmVsLkhPVVJdID0gbmV3IEhvdXJQaWNrZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgTGV2ZWwuTUlOVVRFOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGlja2Vyc1tMZXZlbC5NSU5VVEVdID0gbmV3IE1pbnV0ZVBpY2tlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBMZXZlbC5TRUNPTkQ6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5waWNrZXJzW0xldmVsLlNFQ09ORF0gPSBuZXcgU2Vjb25kUGlja2VyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBjcmVhdGVWaWV3KCk6SFRNTEVsZW1lbnQge1xyXG4gICAgICAgIGxldCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1jb250YWluZXInKTtcclxuICAgICAgICBlbC5pbm5lckhUTUwgPSBoZWFkZXIgKyAnPGRhdGl1bS1waWNrZXItY29udGFpbmVyPjwvZGF0aXVtLXBpY2tlci1jb250YWluZXI+JztcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gZWw7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgaW5zZXJ0QWZ0ZXIobm9kZTpOb2RlLCBuZXdOb2RlOk5vZGUpOnZvaWQge1xyXG4gICAgICAgIG5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUobmV3Tm9kZSwgbm9kZS5uZXh0U2libGluZyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN0YXRpYyBzdHlsZXNJbnNlcnRlZDpudW1iZXIgPSAwO1xyXG4gICAgXHJcbiAgICBwcml2YXRlIGluc2VydFN0eWxlcygpIHtcclxuICAgICAgICBsZXQgaGVhZCA9IGRvY3VtZW50LmhlYWQgfHwgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXTtcclxuICAgICAgICBsZXQgc3R5bGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgc3R5bGVJZCA9IFwiZGF0aXVtLXN0eWxlXCIgKyAoUGlja2VyTWFuYWdlci5zdHlsZXNJbnNlcnRlZCsrKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgZXhpc3RpbmdTdHlsZUlkID0gdGhpcy5nZXRFeGlzdGluZ1N0eWxlSWQoKTtcclxuICAgICAgICBpZiAoZXhpc3RpbmdTdHlsZUlkICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoZXhpc3RpbmdTdHlsZUlkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5jb250YWluZXIuY2xhc3NMaXN0LmFkZChzdHlsZUlkKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgdHJhbnNmb3JtZWRDc3MgPSBjc3MucmVwbGFjZSgvX3ByaW1hcnlfdGV4dC9nLCB0aGlzLm9wdGlvbnMudGhlbWUucHJpbWFyeV90ZXh0KTtcclxuICAgICAgICB0cmFuc2Zvcm1lZENzcyA9IHRyYW5zZm9ybWVkQ3NzLnJlcGxhY2UoL19wcmltYXJ5L2csIHRoaXMub3B0aW9ucy50aGVtZS5wcmltYXJ5KTtcclxuICAgICAgICB0cmFuc2Zvcm1lZENzcyA9IHRyYW5zZm9ybWVkQ3NzLnJlcGxhY2UoL19zZWNvbmRhcnlfdGV4dC9nLCB0aGlzLm9wdGlvbnMudGhlbWUuc2Vjb25kYXJ5X3RleHQpO1xyXG4gICAgICAgIHRyYW5zZm9ybWVkQ3NzID0gdHJhbnNmb3JtZWRDc3MucmVwbGFjZSgvX3NlY29uZGFyeV9hY2NlbnQvZywgdGhpcy5vcHRpb25zLnRoZW1lLnNlY29uZGFyeV9hY2NlbnQpO1xyXG4gICAgICAgIHRyYW5zZm9ybWVkQ3NzID0gdHJhbnNmb3JtZWRDc3MucmVwbGFjZSgvX3NlY29uZGFyeS9nLCB0aGlzLm9wdGlvbnMudGhlbWUuc2Vjb25kYXJ5KTtcclxuICAgICAgICB0cmFuc2Zvcm1lZENzcyA9IHRyYW5zZm9ybWVkQ3NzLnJlcGxhY2UoL19pZC9nLCBzdHlsZUlkKTtcclxuICAgICAgICBcclxuICAgICAgICBzdHlsZUVsZW1lbnQudHlwZSA9ICd0ZXh0L2Nzcyc7XHJcbiAgICAgICAgaWYgKCg8YW55PnN0eWxlRWxlbWVudCkuc3R5bGVTaGVldCl7XHJcbiAgICAgICAgICAgICg8YW55PnN0eWxlRWxlbWVudCkuc3R5bGVTaGVldC5jc3NUZXh0ID0gdHJhbnNmb3JtZWRDc3M7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc3R5bGVFbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRyYW5zZm9ybWVkQ3NzKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBoZWFkLmFwcGVuZENoaWxkKHN0eWxlRWxlbWVudCk7ICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBnZXRFeGlzdGluZ1N0eWxlSWQoKTpzdHJpbmcge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jb250YWluZXIuY2xhc3NMaXN0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICgvXmRhdGl1bS1zdHlsZVxcZCskLy50ZXN0KHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5pdGVtKGkpKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5pdGVtKGkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG59XHJcbiIsImNsYXNzIFNlY29uZFBpY2tlciBpbXBsZW1lbnRzIElQaWNrZXIge1xyXG4gICAgXHJcbn0iLCJjbGFzcyBZZWFyUGlja2VyIGltcGxlbWVudHMgSVBpY2tlciB7XHJcbiAgICBcclxufSIsInZhciBoZWFkZXIgPSBcIjxkYXRpdW0taGVhZGVyPiA8ZGF0aXVtLXNwYW4tbGFiZWwtY29udGFpbmVyPiA8ZGF0aXVtLXNwYW4tbGFiZWwgY2xhc3M9J2RhdGl1bS15ZWFyJz48L2RhdGl1bS1zcGFuLWxhYmVsPiA8ZGF0aXVtLXNwYW4tbGFiZWwgY2xhc3M9J2RhdGl1bS1tb250aCc+PC9kYXRpdW0tc3Bhbi1sYWJlbD4gPGRhdGl1bS1zcGFuLWxhYmVsIGNsYXNzPSdkYXRpdW0tZGF0ZSc+PC9kYXRpdW0tc3Bhbi1sYWJlbD4gPGRhdGl1bS1zcGFuLWxhYmVsIGNsYXNzPSdkYXRpdW0taG91cic+PC9kYXRpdW0tc3Bhbi1sYWJlbD4gPGRhdGl1bS1zcGFuLWxhYmVsIGNsYXNzPSdkYXRpdW0tbWludXRlJz48L2RhdGl1bS1zcGFuLWxhYmVsPiA8ZGF0aXVtLXNwYW4tbGFiZWwgY2xhc3M9J2RhdGl1bS1zZWNvbmQnPjwvZGF0aXVtLXNwYW4tbGFiZWw+IDwvZGF0aXVtLXNwYW4tbGFiZWwtY29udGFpbmVyPiA8ZGF0aXVtLXByZXY+PC9kYXRpdW0tcHJldj4gPGRhdGl1bS1uZXh0PjwvZGF0aXVtLW5leHQ+IDwvZGF0aXVtLWhlYWRlcj5cIjsiLCJ2YXIgY3NzPVwiQGZvbnQtZmFjZXtmb250LWZhbWlseTpSb2JvdG87Zm9udC1zdHlsZTpub3JtYWw7Zm9udC13ZWlnaHQ6NDAwO3NyYzpsb2NhbCgnUm9ib3RvJyksbG9jYWwoJ1JvYm90by1SZWd1bGFyJyksdXJsKGh0dHBzOi8vZm9udHMuZ3N0YXRpYy5jb20vcy9yb2JvdG8vdjE1L0NXQjBYWUE4YnpvMGtTVGhYMFVUdUEud29mZjIpIGZvcm1hdCgnd29mZjInKTt1bmljb2RlLXJhbmdlOlUrMDAwMC0wMEZGLFUrMDEzMSxVKzAxNTItMDE1MyxVKzAyQzYsVSswMkRBLFUrMDJEQyxVKzIwMDAtMjA2RixVKzIwNzQsVSsyMEFDLFUrMjIxMixVKzIyMTUsVStFMEZGLFUrRUZGRCxVK0YwMDB9QGZvbnQtZmFjZXtmb250LWZhbWlseTpSb2JvdG87Zm9udC1zdHlsZTpub3JtYWw7Zm9udC13ZWlnaHQ6NzAwO3NyYzpsb2NhbCgnUm9ib3RvIEJvbGQnKSxsb2NhbCgnUm9ib3RvLUJvbGQnKSx1cmwoaHR0cHM6Ly9mb250cy5nc3RhdGljLmNvbS9zL3JvYm90by92MTUvZC02SVlwbE9Gb2NDYWNLenh3WFNPRnRYUmE4VFZ3VElDZ2lybkpobVZKdy53b2ZmMikgZm9ybWF0KCd3b2ZmMicpO3VuaWNvZGUtcmFuZ2U6VSswMDAwLTAwRkYsVSswMTMxLFUrMDE1Mi0wMTUzLFUrMDJDNixVKzAyREEsVSswMkRDLFUrMjAwMC0yMDZGLFUrMjA3NCxVKzIwQUMsVSsyMjEyLFUrMjIxNSxVK0UwRkYsVStFRkZELFUrRjAwMH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0taGVhZGVye3Bvc2l0aW9uOnJlbGF0aXZlO2Rpc3BsYXk6YmxvY2s7b3ZlcmZsb3c6aGlkZGVuO3dpZHRoOjEwMCU7aGVpZ2h0OjgwcHg7YmFja2dyb3VuZC1jb2xvcjpfcHJpbWFyeTtib3JkZXItdG9wLWxlZnQtcmFkaXVzOjNweDtib3JkZXItdG9wLXJpZ2h0LXJhZGl1czozcHg7bWFyZ2luLWJvdHRvbTo1cHh9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXNwYW4tbGFiZWwtY29udGFpbmVye3Bvc2l0aW9uOmFic29sdXRlO2xlZnQ6NDBweDtyaWdodDo0MHB4O3RvcDowO2JvdHRvbTowO2Rpc3BsYXk6YmxvY2s7b3ZlcmZsb3c6aGlkZGVuO3RyYW5zaXRpb246LjJzIGVhc2UgYWxsfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1zcGFuLWxhYmVse3Bvc2l0aW9uOmFic29sdXRlO2ZvbnQtc2l6ZToxOHB0O2NvbG9yOl9wcmltYXJ5X3RleHQ7Zm9udC13ZWlnaHQ6NzAwO3RyYW5zZm9ybS1vcmlnaW46MCAwO3doaXRlLXNwYWNlOm5vd3JhcDt0cmFuc2l0aW9uOmFsbCAuMnMgZWFzZX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc3Bhbi1sYWJlbC5kYXRpdW0tdG9we3RyYW5zZm9ybTp0cmFuc2xhdGVZKDE3cHgpIHNjYWxlKC42Nik7d2lkdGg6MTUxJTtvcGFjaXR5Oi42fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS1ib3R0b217dHJhbnNmb3JtOnRyYW5zbGF0ZVkoMzZweCkgc2NhbGUoMSk7d2lkdGg6MTAwJTtvcGFjaXR5OjF9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXNwYW4tbGFiZWwuZGF0aXVtLXRvcC5kYXRpdW0taGlkZGVue3RyYW5zZm9ybTp0cmFuc2xhdGVZKDVweCkgc2NhbGUoLjQpO29wYWNpdHk6MH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc3Bhbi1sYWJlbC5kYXRpdW0tYm90dG9tLmRhdGl1bS1oaWRkZW57dHJhbnNmb3JtOnRyYW5zbGF0ZVkoNzhweCkgc2NhbGUoMS4yKX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc3Bhbi1sYWJlbDphZnRlcntjb250ZW50OicnO2Rpc3BsYXk6aW5saW5lLWJsb2NrO3Bvc2l0aW9uOmFic29sdXRlO21hcmdpbi1sZWZ0OjEwcHg7bWFyZ2luLXRvcDo2cHg7aGVpZ2h0OjE3cHg7d2lkdGg6MTdweDtvcGFjaXR5OjA7dHJhbnNpdGlvbjphbGwgLjJzIGVhc2U7YmFja2dyb3VuZDp1cmwoZGF0YTppbWFnZS9zdmcreG1sO3V0ZjgsJTNDc3ZnJTIweG1sbnMlM0QlMjJodHRwJTNBJTJGJTJGd3d3LnczLm9yZyUyRjIwMDAlMkZzdmclMjIlM0UlM0NnJTIwZmlsbCUzRCUyMl9wcmltYXJ5X3RleHQlMjIlM0UlM0NwYXRoJTIwZCUzRCUyMk0xNyUyMDE1bC0yJTIwMi01LTUlMjAyLTJ6JTIyJTIwZmlsbC1ydWxlJTNEJTIyZXZlbm9kZCUyMiUyRiUzRSUzQ3BhdGglMjBkJTNEJTIyTTclMjAwYTclMjA3JTIwMCUyMDAlMjAwLTclMjA3JTIwNyUyMDclMjAwJTIwMCUyMDAlMjA3JTIwNyUyMDclMjA3JTIwMCUyMDAlMjAwJTIwNy03JTIwNyUyMDclMjAwJTIwMCUyMDAtNy03em0wJTIwMmE1JTIwNSUyMDAlMjAwJTIwMSUyMDUlMjA1JTIwNSUyMDUlMjAwJTIwMCUyMDEtNSUyMDUlMjA1JTIwNSUyMDAlMjAwJTIwMS01LTUlMjA1JTIwNSUyMDAlMjAwJTIwMSUyMDUtNXolMjIlMkYlM0UlM0NwYXRoJTIwZCUzRCUyMk00JTIwNmg2djJINHolMjIlMkYlM0UlM0MlMkZnJTNFJTNDJTJGc3ZnJTNFKX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc3Bhbi1sYWJlbC5kYXRpdW0tdG9wOmFmdGVye29wYWNpdHk6MX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc3Bhbi1sYWJlbCBkYXRpdW0tdmFyaWFibGV7Y29sb3I6X3ByaW1hcnk7Zm9udC1zaXplOjE0cHQ7cGFkZGluZzowIDRweDttYXJnaW46MCAycHg7dG9wOi0ycHg7cG9zaXRpb246cmVsYXRpdmV9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXNwYW4tbGFiZWwgZGF0aXVtLXZhcmlhYmxlOmJlZm9yZXtjb250ZW50OicnO3Bvc2l0aW9uOmFic29sdXRlO2xlZnQ6MDt0b3A6MDtyaWdodDowO2JvdHRvbTowO2JvcmRlci1yYWRpdXM6NXB4O2JhY2tncm91bmQtY29sb3I6X3ByaW1hcnlfdGV4dDt6LWluZGV4Oi0xO29wYWNpdHk6Ljd9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW5leHQsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXByZXZ7cG9zaXRpb246YWJzb2x1dGU7d2lkdGg6NDBweDt0b3A6MDtib3R0b206MDt0cmFuc2Zvcm0tb3JpZ2luOjIwcHggNTJweH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbmV4dDphZnRlcixkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbmV4dDpiZWZvcmUsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXByZXY6YWZ0ZXIsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXByZXY6YmVmb3Jle2NvbnRlbnQ6Jyc7cG9zaXRpb246YWJzb2x1dGU7ZGlzcGxheTpibG9jazt3aWR0aDozcHg7aGVpZ2h0OjhweDtsZWZ0OjUwJTtiYWNrZ3JvdW5kLWNvbG9yOl9wcmltYXJ5X3RleHQ7dG9wOjQ4cHh9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW5leHQuZGF0aXVtLWFjdGl2ZSxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcHJldi5kYXRpdW0tYWN0aXZle3RyYW5zZm9ybTpzY2FsZSguOSk7b3BhY2l0eTouOX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcHJldntsZWZ0OjB9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXByZXY6YWZ0ZXIsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXByZXY6YmVmb3Jle21hcmdpbi1sZWZ0Oi0zcHh9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW5leHR7cmlnaHQ6MH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcHJldjpiZWZvcmV7dHJhbnNmb3JtOnJvdGF0ZSg0NWRlZykgdHJhbnNsYXRlWSgtM3B4KX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcHJldjphZnRlcnt0cmFuc2Zvcm06cm90YXRlKC00NWRlZykgdHJhbnNsYXRlWSgzcHgpfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1uZXh0OmJlZm9yZXt0cmFuc2Zvcm06cm90YXRlKDQ1ZGVnKSB0cmFuc2xhdGVZKDNweCl9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW5leHQ6YWZ0ZXJ7dHJhbnNmb3JtOnJvdGF0ZSgtNDVkZWcpIHRyYW5zbGF0ZVkoLTNweCl9ZGF0aXVtLWNvbnRhaW5lci5faWR7ZGlzcGxheTpibG9jaztwb3NpdGlvbjphYnNvbHV0ZTtib3JkZXItcmFkaXVzOjNweDt3aWR0aDoyODBweDtib3gtc2hhZG93OjAgMTBweCAyMHB4IHJnYmEoMCwwLDAsLjE5KSwwIDZweCA2cHggcmdiYSgwLDAsMCwuMjMpO2ZvbnQtZmFtaWx5OlJvYm90b31kYXRpdW0tY29udGFpbmVyLl9pZCxkYXRpdW0tY29udGFpbmVyLl9pZCAqey13ZWJraXQtdG91Y2gtY2FsbG91dDpub25lOy13ZWJraXQtdXNlci1zZWxlY3Q6bm9uZTsta2h0bWwtdXNlci1zZWxlY3Q6bm9uZTstbW96LXVzZXItc2VsZWN0Om5vbmU7LW1zLXVzZXItc2VsZWN0Om5vbmU7LXdlYmtpdC10YXAtaGlnaGxpZ2h0LWNvbG9yOnRyYW5zcGFyZW50O2N1cnNvcjpkZWZhdWx0fVwiOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
