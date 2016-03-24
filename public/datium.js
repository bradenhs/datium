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
        this.goto(this.options['defaultDate'], 6 /* NONE */, true);
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
    Common.prototype.daysInMonth = function (date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
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
    function swipe(element, direction, callback) {
        var startTouchX, startTouchY, startTime;
        var touchMoveListener;
        var scrollingDisabled;
        attachEvents(['touchstart'], element, function (e) {
            startTouchX = e.touches[0].clientX;
            startTouchY = e.touches[0].clientY;
            startTime = new Date().valueOf();
            scrollingDisabled = false;
            touchMoveListener = attachEvents(['touchmove'], document, function (e) {
                var xDiff = Math.abs(e.changedTouches[0].clientX - startTouchX);
                var yDiff = Math.abs(e.changedTouches[0].clientY - startTouchY);
                if (xDiff > yDiff && xDiff > 20) {
                    scrollingDisabled = true;
                }
                else if (yDiff > xDiff && yDiff > 20) {
                    scrollingDisabled = false;
                }
                if (new Date().valueOf() - startTime > 500) {
                    scrollingDisabled = false;
                }
                if (scrollingDisabled) {
                    e.preventDefault();
                }
            })[0];
        });
        attachEvents(['touchend'], element, function (e) {
            document.removeEventListener(touchMoveListener.event, touchMoveListener.reference);
            if (startTouchX === void 0 || startTouchY === void 0)
                return;
            if (new Date().valueOf() - startTime > 500)
                return;
            var xDiff = e.changedTouches[0].clientX - startTouchX;
            var yDiff = e.changedTouches[0].clientY - startTouchY;
            if (Math.abs(xDiff) > Math.abs(yDiff) && Math.abs(xDiff) > 20) {
                e.preventDefault();
                if (direction === 'left' && xDiff < 0) {
                    callback(e);
                }
                if (direction === 'right' && xDiff > 0) {
                    callback(e);
                }
            }
        });
    }
    function swipeLeft(element, callback) {
        swipe(element, 'left', callback);
    }
    listen.swipeLeft = swipeLeft;
    function swipeRight(element, callback) {
        swipe(element, 'right', callback);
    }
    listen.swipeRight = swipeRight;
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
    function openBubble(element, callback) {
        return attachEvents(['datium-open-bubble'], element, function (e) {
            callback(e.detail);
        });
    }
    listen.openBubble = openBubble;
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
    function openBubble(element, data) {
        element.dispatchEvent(new CustomEvent('datium-open-bubble', {
            bubbles: false,
            cancelable: true,
            detail: data
        }));
    }
    trigger.openBubble = openBubble;
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
        DateNumeral.prototype.increment = function () {
            var num = this.date.getDate() + 1;
            if (num > this.daysInMonth(this.date))
                num = 1;
            this.date.setDate(num);
        };
        DateNumeral.prototype.decrement = function () {
            var num = this.date.getDate() - 1;
            if (num < 1)
                num = this.daysInMonth(this.date);
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
            else if (typeof value === 'string' && this.getRegEx().test(value) && parseInt(value, 10) < this.daysInMonth(this.date)) {
                this.date.setDate(parseInt(value, 10));
                return true;
            }
            return false;
        };
        DateNumeral.prototype.getRegEx = function () {
            return /^[1-9]|((1|2)[0-9])|(3[0-1])$/;
        };
        DateNumeral.prototype.getMaxBuffer = function () {
            return this.date.getDate() > Math.floor(this.daysInMonth(this.date) / 10) ? 1 : 2;
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
        listen.swipeLeft(container, function () {
            _this.next();
        });
        listen.swipeRight(container, function () {
            _this.previous();
        });
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
        listen.up(document, function () {
            _this.closeBubble();
            _this.removeActiveClasses();
        });
        listen.mousedown(this.container, function (e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
        listen.viewchanged(element, function (e) { return _this.viewchanged(e.date, e.level, e.update); });
        listen.openBubble(element, function (e) {
            _this.openBubble(e.x, e.y, e.text);
        });
    }
    PickerManager.prototype.closeBubble = function () {
        if (this.bubble === void 0)
            return;
        this.bubble.classList.remove('datium-bubble-visible');
        setTimeout(function (bubble) {
            bubble.remove();
        }, 200, this.bubble);
        this.bubble = void 0;
    };
    PickerManager.prototype.openBubble = function (x, y, text) {
        var _this = this;
        if (this.bubble !== void 0) {
            this.closeBubble();
        }
        this.bubble = document.createElement('datium-bubble');
        this.container.appendChild(this.bubble);
        this.updateBubble(x, y, text);
        setTimeout(function () {
            _this.bubble.classList.add('datium-bubble-visible');
        });
    };
    PickerManager.prototype.updateBubble = function (x, y, text) {
        this.bubble.innerHTML = text;
        this.bubble.style.top = y + 'px';
        this.bubble.style.left = x + 'px';
    };
    PickerManager.prototype.viewchanged = function (date, level, update) {
        if (level === 6 /* NONE */) {
            if (this.currentPicker !== void 0) {
                this.currentPicker.remove(3 /* ZOOM_OUT */);
            }
            this.adjustHeight(10);
            if (update)
                this.updateSelectedDate(date);
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
        if (update)
            this.updateSelectedDate(date);
        this.adjustHeight(this.currentPicker.getHeight());
    };
    PickerManager.prototype.updateSelectedDate = function (date) {
        this.yearPicker.setSelectedDate(date);
        this.monthPicker.setSelectedDate(date);
        this.datePicker.setSelectedDate(date);
        this.hourPicker.setSelectedDate(date);
        this.minutePicker.setSelectedDate(date);
        this.secondPicker.setSelectedDate(date);
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
    PickerManager.prototype.removeActiveClasses = function () {
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
/// <reference path="../../common/Common.ts" />
var Picker = (function (_super) {
    __extends(Picker, _super);
    function Picker(element, container) {
        _super.call(this);
        this.container = container;
        this.min = new Date();
        this.max = new Date();
        this.pickerContainer = container.querySelector('datium-picker-container');
    }
    Picker.prototype.create = function (date, transition) {
    };
    Picker.prototype.remove = function (transition) {
        if (this.picker === void 0)
            return;
        this.transitionOut(transition, this.picker);
        setTimeout(function (picker) {
            picker.remove();
        }, 500, this.picker);
    };
    Picker.prototype.getOffset = function (el) {
        var x = el.getBoundingClientRect().left - this.container.getBoundingClientRect().left;
        var y = el.getBoundingClientRect().top - this.container.getBoundingClientRect().top;
        return { x: x, y: y };
    };
    Picker.prototype.updateOptions = function (options) {
    };
    Picker.prototype.attach = function () {
        this.pickerContainer.appendChild(this.picker);
    };
    Picker.prototype.getMin = function () {
        return this.min;
    };
    Picker.prototype.getMax = function () {
        return this.max;
    };
    Picker.prototype.setSelectedDate = function (date) {
        this.selectedDate = new Date(date.valueOf());
    };
    Picker.prototype.transitionOut = function (transition, picker) {
        if (transition === 0 /* SLIDE_LEFT */) {
            picker.classList.add('datium-picker-right');
        }
        else if (transition === 1 /* SLIDE_RIGHT */) {
            picker.classList.add('datium-picker-left');
        }
        else if (transition === 2 /* ZOOM_IN */) {
            picker.classList.add('datium-picker-out');
        }
        else {
            picker.classList.add('datium-picker-in');
        }
    };
    Picker.prototype.transitionIn = function (transition, picker) {
        var cls;
        if (transition === 0 /* SLIDE_LEFT */) {
            cls = 'datium-picker-left';
        }
        else if (transition === 1 /* SLIDE_RIGHT */) {
            cls = 'datium-picker-right';
        }
        else if (transition === 2 /* ZOOM_IN */) {
            cls = 'datium-picker-in';
        }
        else {
            cls = 'datium-picker-out';
        }
        picker.classList.add(cls);
        setTimeout(function (p) {
            p.classList.remove(cls);
        }, 100, picker);
    };
    return Picker;
}(Common));
/// <reference path="picker.ts" />
var DatePicker = (function (_super) {
    __extends(DatePicker, _super);
    function DatePicker(element, container) {
        var _this = this;
        _super.call(this, element, container);
        listen.tap(container, 'datium-date-element[datium-data]', function (e) {
            var el = e.target || e.srcElement;
            var year = new Date(el.getAttribute('datium-data')).getFullYear();
            var month = new Date(el.getAttribute('datium-data')).getMonth();
            var dateOfMonth = new Date(el.getAttribute('datium-data')).getDate();
            var date = new Date(_this.selectedDate.valueOf());
            date.setFullYear(year);
            date.setMonth(month);
            if (date.getMonth() !== month) {
                date.setDate(0);
            }
            date.setDate(dateOfMonth);
            trigger.goto(element, {
                date: date,
                level: 3 /* HOUR */
            });
        });
        listen.down(container, 'datium-date-element', function (e) {
            var el = (e.target || e.srcElement);
            var text = _this.pad(new Date(el.getAttribute('datium-data')).getDate());
            var offset = _this.getOffset(el);
            trigger.openBubble(element, {
                x: offset.x + 20,
                y: offset.y + 2,
                text: text
            });
        });
    }
    DatePicker.prototype.create = function (date, transition) {
        this.min = new Date(date.getFullYear(), date.getMonth());
        this.max = new Date(date.getFullYear(), date.getMonth() + 1);
        var start = new Date(this.min.valueOf());
        start.setDate(1 - start.getDay());
        var end = new Date(this.max.valueOf());
        end.setDate(end.getDate() + 7 - (end.getDay() === 0 ? 7 : end.getDay()));
        var iterator = new Date(start.valueOf());
        this.picker = document.createElement('datium-picker');
        this.transitionIn(transition, this.picker);
        for (var i = 0; i < 7; i++) {
            var header_1 = document.createElement('datium-date-header');
            header_1.innerHTML = this.getDays()[i].slice(0, 2);
            this.picker.appendChild(header_1);
        }
        var times = 0;
        do {
            var dateElement = document.createElement('datium-date-element');
            dateElement.innerHTML = iterator.getDate().toString();
            if (iterator.getMonth() === date.getMonth()) {
                dateElement.setAttribute('datium-data', iterator.toISOString());
            }
            this.picker.appendChild(dateElement);
            iterator.setDate(iterator.getDate() + 1);
            times++;
        } while (iterator.valueOf() < end.valueOf());
        this.height = Math.ceil(times / 7) * 36 + 28;
        this.attach();
        this.setSelectedDate(this.selectedDate);
    };
    DatePicker.prototype.setSelectedDate = function (selectedDate) {
        this.selectedDate = new Date(selectedDate.valueOf());
        var dateElements = this.pickerContainer.querySelectorAll('datium-date-element');
        for (var i = 0; i < dateElements.length; i++) {
            var el = dateElements.item(i);
            var date = new Date(el.getAttribute('datium-data'));
            if (date.getFullYear() === selectedDate.getFullYear() &&
                date.getMonth() === selectedDate.getMonth() &&
                date.getDate() === selectedDate.getDate()) {
                el.classList.add('datium-selected');
            }
            else {
                el.classList.remove('datium-selected');
            }
        }
    };
    DatePicker.prototype.getHeight = function () {
        return this.height;
    };
    DatePicker.prototype.getLevel = function () {
        return 2 /* DATE */;
    };
    return DatePicker;
}(Picker));
/// <reference path="picker.ts" />
var HourPicker = (function (_super) {
    __extends(HourPicker, _super);
    function HourPicker(element, container) {
        _super.call(this, element, container);
    }
    HourPicker.prototype.create = function (date, transition) {
        this.min = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        this.max = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        var iterator = new Date(this.min.valueOf());
        this.picker = document.createElement('datium-picker');
        this.transitionIn(transition, this.picker);
        do {
            var hourElement = document.createElement('datium-hour-element');
            hourElement.innerHTML = iterator.getHours().toString();
            this.picker.appendChild(hourElement);
            iterator.setHours(iterator.getHours() + 1);
        } while (iterator.valueOf() < this.max.valueOf());
        this.attach();
        this.setSelectedDate(this.selectedDate);
    };
    HourPicker.prototype.getHeight = function () {
        return 260;
    };
    HourPicker.prototype.getLevel = function () {
        return 3 /* HOUR */;
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
    MinutePicker.prototype.getLevel = function () {
        return 4 /* MINUTE */;
    };
    return MinutePicker;
}(Picker));
/// <reference path="picker.ts" />
var MonthPicker = (function (_super) {
    __extends(MonthPicker, _super);
    function MonthPicker(element, container) {
        var _this = this;
        _super.call(this, element, container);
        listen.tap(container, 'datium-month-element[datium-data]', function (e) {
            var el = e.target || e.srcElement;
            var year = new Date(el.getAttribute('datium-data')).getFullYear();
            var month = new Date(el.getAttribute('datium-data')).getMonth();
            var date = new Date(_this.selectedDate.valueOf());
            date.setFullYear(year);
            date.setMonth(month);
            if (date.getMonth() !== month) {
                date.setDate(0);
            }
            trigger.goto(element, {
                date: date,
                level: 2 /* DATE */
            });
        });
        listen.down(container, 'datium-month-element', function (e) {
            var el = (e.target || e.srcElement);
            var text = _this.getShortMonths()[new Date(el.getAttribute('datium-data')).getMonth()];
            var offset = _this.getOffset(el);
            trigger.openBubble(element, {
                x: offset.x + 35,
                y: offset.y + 15,
                text: text
            });
        });
    }
    MonthPicker.prototype.create = function (date, transition) {
        this.min = new Date(date.getFullYear(), 0);
        this.max = new Date(date.getFullYear() + 1, 0);
        var iterator = new Date(this.min.valueOf());
        this.picker = document.createElement('datium-picker');
        this.transitionIn(transition, this.picker);
        do {
            var monthElement = document.createElement('datium-month-element');
            monthElement.innerHTML = this.getShortMonths()[iterator.getMonth()];
            monthElement.setAttribute('datium-data', iterator.toISOString());
            this.picker.appendChild(monthElement);
            iterator.setMonth(iterator.getMonth() + 1);
        } while (iterator.valueOf() < this.max.valueOf());
        this.attach();
        this.setSelectedDate(this.selectedDate);
    };
    MonthPicker.prototype.setSelectedDate = function (selectedDate) {
        this.selectedDate = new Date(selectedDate.valueOf());
        var monthElements = this.pickerContainer.querySelectorAll('datium-month-element');
        for (var i = 0; i < monthElements.length; i++) {
            var el = monthElements.item(i);
            var date = new Date(el.getAttribute('datium-data'));
            if (date.getFullYear() === selectedDate.getFullYear() &&
                date.getMonth() === selectedDate.getMonth()) {
                el.classList.add('datium-selected');
            }
            else {
                el.classList.remove('datium-selected');
            }
        }
    };
    MonthPicker.prototype.getHeight = function () {
        return 180;
    };
    MonthPicker.prototype.getLevel = function () {
        return 1 /* MONTH */;
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
    SecondPicker.prototype.getLevel = function () {
        return 5 /* SECOND */;
    };
    return SecondPicker;
}(Picker));
/// <reference path="picker.ts" />
var YearPicker = (function (_super) {
    __extends(YearPicker, _super);
    function YearPicker(element, container) {
        var _this = this;
        _super.call(this, element, container);
        listen.tap(container, 'datium-year-element[datium-data]', function (e) {
            var el = e.target || e.srcElement;
            var year = new Date(el.getAttribute('datium-data')).getFullYear();
            var date = new Date(_this.selectedDate.valueOf());
            date.setFullYear(year);
            trigger.goto(element, {
                date: date,
                level: 1 /* MONTH */
            });
        });
        listen.down(container, 'datium-year-element', function (e) {
            var el = (e.target || e.srcElement);
            var text = new Date(el.getAttribute('datium-data')).getFullYear().toString();
            var offset = _this.getOffset(el);
            trigger.openBubble(element, {
                x: offset.x + 35,
                y: offset.y + 15,
                text: text
            });
        });
    }
    YearPicker.prototype.create = function (date, transition) {
        this.min = new Date(Math.floor(date.getFullYear() / 10) * 10, 0);
        this.max = new Date(Math.ceil(date.getFullYear() / 10) * 10, 0);
        if (this.min.valueOf() === this.max.valueOf()) {
            this.max.setFullYear(this.max.getFullYear() + 10);
        }
        var iterator = new Date(this.min.valueOf());
        this.picker = document.createElement('datium-picker');
        this.transitionIn(transition, this.picker);
        do {
            var yearElement = document.createElement('datium-year-element');
            yearElement.innerHTML = iterator.getFullYear().toString();
            yearElement.setAttribute('datium-data', iterator.toISOString());
            this.picker.appendChild(yearElement);
            iterator.setFullYear(iterator.getFullYear() + 1);
        } while (iterator.valueOf() <= this.max.valueOf());
        this.attach();
        this.setSelectedDate(this.selectedDate);
    };
    YearPicker.prototype.setSelectedDate = function (selectedDate) {
        this.selectedDate = new Date(selectedDate.valueOf());
        var yearElements = this.pickerContainer.querySelectorAll('datium-year-element');
        for (var i = 0; i < yearElements.length; i++) {
            var el = yearElements.item(i);
            var date = new Date(el.getAttribute('datium-data'));
            if (date.getFullYear() === selectedDate.getFullYear()) {
                el.classList.add('datium-selected');
            }
            else {
                el.classList.remove('datium-selected');
            }
        }
    };
    YearPicker.prototype.getHeight = function () {
        return 180;
    };
    YearPicker.prototype.getLevel = function () {
        return 0 /* YEAR */;
    };
    return YearPicker;
}(Picker));
var css = "datium-container._id datium-bubble,datium-container._id datium-header,datium-container._id datium-picker-container{box-shadow:0 3px 6px rgba(0,0,0,.16),0 3px 6px rgba(0,0,0,.23)}datium-container._id datium-header-wrapper{overflow:hidden;position:absolute;left:-7px;right:-7px;top:-7px;height:87px;display:block;pointer-events:none}datium-container._id datium-header{position:relative;display:block;overflow:hidden;height:100px;background-color:_primary;border-top-left-radius:3px;border-top-right-radius:3px;z-index:1;margin:7px;width:calc(100% - 14px);pointer-events:auto}datium-container._id datium-span-label-container{position:absolute;left:40px;right:40px;top:0;bottom:0;display:block;overflow:hidden;transition:.2s ease all;transform-origin:40px 40px}datium-container._id datium-span-label{position:absolute;font-size:18pt;color:_primary_text;font-weight:700;transform-origin:0 0;white-space:nowrap;transition:all .2s ease;text-transform:uppercase}datium-container._id datium-span-label.datium-top{transform:translateY(17px) scale(.66);width:151%;opacity:.6}datium-container._id datium-span-label.datium-bottom{transform:translateY(36px) scale(1);width:100%;opacity:1}datium-container._id datium-span-label.datium-top.datium-hidden{transform:translateY(5px) scale(.4);opacity:0}datium-container._id datium-span-label.datium-bottom.datium-hidden{transform:translateY(78px) scale(1.2);opacity:.5}datium-container._id datium-span-label:after{content:'';display:inline-block;position:absolute;margin-left:10px;margin-top:6px;height:17px;width:17px;opacity:0;transition:all .2s ease;background:url(data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22_primary_text%22%3E%3Cpath%20d%3D%22M17%2015l-2%202-5-5%202-2z%22%20fill-rule%3D%22evenodd%22%2F%3E%3Cpath%20d%3D%22M7%200a7%207%200%200%200-7%207%207%207%200%200%200%207%207%207%207%200%200%200%207-7%207%207%200%200%200-7-7zm0%202a5%205%200%200%201%205%205%205%205%200%200%201-5%205%205%205%200%200%201-5-5%205%205%200%200%201%205-5z%22%2F%3E%3Cpath%20d%3D%22M4%206h6v2H4z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E)}datium-container._id datium-span-label.datium-top:after{opacity:1}datium-container._id datium-span-label datium-variable{color:_primary;font-size:14pt;padding:0 4px;margin:0 2px;top:-2px;position:relative}datium-container._id datium-span-label datium-variable:before{content:'';position:absolute;left:0;top:0;right:0;bottom:0;border-radius:5px;background-color:_primary_text;z-index:-1;opacity:.7}datium-container._id datium-next,datium-container._id datium-prev{position:absolute;width:40px;top:0;bottom:0;transform-origin:20px 52px}datium-container._id datium-next:after,datium-container._id datium-next:before,datium-container._id datium-prev:after,datium-container._id datium-prev:before{content:'';position:absolute;display:block;width:3px;height:8px;left:50%;background-color:_primary_text;top:48px}datium-container._id datium-next.datium-active,datium-container._id datium-prev.datium-active{transform:scale(.9);opacity:.9}datium-container._id datium-prev{left:0}datium-container._id datium-prev:after,datium-container._id datium-prev:before{margin-left:-3px}datium-container._id datium-next{right:0}datium-container._id datium-prev:before{transform:rotate(45deg) translateY(-2.6px)}datium-container._id datium-prev:after{transform:rotate(-45deg) translateY(2.6px)}datium-container._id datium-next:before{transform:rotate(45deg) translateY(2.6px)}datium-container._id datium-next:after{transform:rotate(-45deg) translateY(-2.6px)}datium-container._id{display:block;position:absolute;width:280px;font-family:Roboto,Arial;margin-top:2px;font-size:16px}datium-container._id,datium-container._id *{-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;-webkit-tap-highlight-color:transparent;cursor:default}datium-container._id datium-bubble{position:absolute;width:50px;line-height:26px;text-align:center;font-size:14px;background-color:_secondary_accent;font-weight:700;border-radius:3px;margin-left:-25px;margin-top:-32px;color:_secondary;z-index:1;transform-origin:30px 36px;transition:ease all .2s;transform:scale(.5);opacity:0}datium-container._id datium-bubble:after{content:'';position:absolute;display:block;width:10px;height:10px;transform:rotate(45deg);background-color:_secondary_accent;left:50%;top:20px;margin-left:-5px}datium-container._id datium-bubble.datium-bubble-visible{transform:scale(1);opacity:1;transition-timing-function:ease;transition-property:all;transition-duration:.2s;transition-delay:.2s}datium-container._id datium-picker-container-wrapper{overflow:hidden;position:absolute;left:-7px;right:-7px;top:80px;height:270px;display:block;pointer-events:none}datium-container._id datium-picker-container{position:relative;width:calc(100% - 14px);height:260px;background-color:_secondary;display:block;margin:0 7px 7px;padding-top:20px;transform:translateY(-270px);pointer-events:auto;border-bottom-right-radius:3px;border-bottom-left-radius:3px;transition:all ease .4s;transition-delay:.1s;overflow:hidden}datium-container._id datium-picker{position:absolute;left:0;right:0;bottom:0;color:_secondary_text;transition:all ease .4s}datium-container._id datium-picker.datium-picker-left{transform:translateX(-100%) scale(1);pointer-events:none;transition-delay:0s}datium-container._id datium-picker.datium-picker-right{transform:translateX(100%) scale(1);pointer-events:none;transition-delay:0s}datium-container._id datium-picker.datium-picker-out{transform:translateX(0) scale(1.4);opacity:0;pointer-events:none;transition-delay:0s}datium-container._id datium-picker.datium-picker-in{transform:translateX(0) scale(.6);opacity:0;pointer-events:none;transition-delay:0s}datium-container._id datium-month-element,datium-container._id datium-year-element{display:inline-block;width:25%;line-height:60px;text-align:center;position:relative;transition:.2s ease all}datium-container._id datium-month-element.datium-selected:after,datium-container._id datium-year-element.datium-selected:after{content:'';position:absolute;left:20px;right:20px;top:50%;margin-top:11px;height:2px;display:block;background-color:_primary}datium-container._id datium-month-element.datium-active,datium-container._id datium-year-element.datium-active{transform:scale(.9);transition:none}datium-container._id datium-month-element.datium-selected:after{left:25px;right:25px}datium-container._id datium-date-header{display:inline-block;width:40px;line-height:28px;opacity:.6;font-weight:700;text-align:center}datium-container._id datium-date-element{display:inline-block;width:40px;line-height:36px;text-align:center;position:relative;transition:.2s ease all}datium-container._id datium-date-element.datium-selected:after{content:'';position:absolute;left:12px;right:12px;top:50%;margin-top:10px;height:2px;display:block;background-color:_primary}datium-container._id datium-date-element.datium-active{transform:scale(.9);transition:none}datium-container._id datium-date-element:not([datium-data]){opacity:.6;pointer-events:none}";
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRhdGl1bS50cyIsIkRhdGl1bUludGVybmFscy50cyIsIk9wdGlvblNhbml0aXplci50cyIsImNvbW1vbi9Db21tb24udHMiLCJjb21tb24vQ3VzdG9tRXZlbnRQb2x5ZmlsbC50cyIsImNvbW1vbi9FdmVudHMudHMiLCJpbnB1dC9EYXRlUGFydHMudHMiLCJpbnB1dC9JbnB1dC50cyIsImlucHV0L0tleWJvYXJkRXZlbnRIYW5kbGVyLnRzIiwiaW5wdXQvTW91c2VFdmVudEhhbmRsZXIudHMiLCJpbnB1dC9QYXJzZXIudHMiLCJpbnB1dC9QYXN0ZUV2ZW50SGFuZGxlci50cyIsInBpY2tlci9IZWFkZXIudHMiLCJwaWNrZXIvUGlja2VyTWFuYWdlci50cyIsInBpY2tlci9odG1sL2hlYWRlci50cyIsInBpY2tlci9waWNrZXJzL1BpY2tlci50cyIsInBpY2tlci9waWNrZXJzL0RhdGVQaWNrZXIudHMiLCJwaWNrZXIvcGlja2Vycy9Ib3VyUGlja2VyLnRzIiwicGlja2VyL3BpY2tlcnMvTWludXRlUGlja2VyLnRzIiwicGlja2VyL3BpY2tlcnMvTW9udGhQaWNrZXIudHMiLCJwaWNrZXIvcGlja2Vycy9TZWNvbmRQaWNrZXIudHMiLCJwaWNrZXIvcGlja2Vycy9ZZWFyUGlja2VyLnRzIiwicGlja2VyL3N0eWxlcy9jc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBTSxNQUFPLENBQUMsUUFBUSxDQUFDLEdBQUc7SUFFdEIsZ0JBQVksT0FBd0IsRUFBRSxPQUFnQjtRQUNsRCxJQUFJLFNBQVMsR0FBRyxJQUFJLGVBQWUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDdEQsSUFBSSxDQUFDLGFBQWEsR0FBRyxVQUFDLE9BQWdCLElBQUssT0FBQSxTQUFTLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFoQyxDQUFnQyxDQUFDO0lBQ2hGLENBQUM7SUFDTCxhQUFDO0FBQUQsQ0FOMEIsQUFNekIsR0FBQSxDQUFBO0FDREQ7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QUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUMzQyxJQUFJLEVBQUUsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlCLElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUNwRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEtBQUssWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDcEQsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUN4QyxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUMzQyxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFFTSw4QkFBUyxHQUFoQjtRQUNJLE1BQU0sQ0FBQyxHQUFHLENBQUM7SUFDZixDQUFDO0lBRU0sNkJBQVEsR0FBZjtRQUNJLE1BQU0sQ0FBQyxZQUFVLENBQUM7SUFDdEIsQ0FBQztJQUNMLGlCQUFDO0FBQUQsQ0FqRkEsQUFpRkMsQ0FqRndCLE1BQU0sR0FpRjlCO0FDbkZELElBQUksR0FBRyxHQUFDLDA3TkFBMDdOLENBQUMiLCJmaWxlIjoiZGF0aXVtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKDxhbnk+d2luZG93KVsnRGF0aXVtJ10gPSBjbGFzcyBEYXRpdW0ge1xyXG4gICAgcHVibGljIHVwZGF0ZU9wdGlvbnM6KG9wdGlvbnM6SU9wdGlvbnMpID0+IHZvaWQ7XHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OkhUTUxJbnB1dEVsZW1lbnQsIG9wdGlvbnM6SU9wdGlvbnMpIHtcclxuICAgICAgICBsZXQgaW50ZXJuYWxzID0gbmV3IERhdGl1bUludGVybmFscyhlbGVtZW50LCBvcHRpb25zKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZU9wdGlvbnMgPSAob3B0aW9uczpJT3B0aW9ucykgPT4gaW50ZXJuYWxzLnVwZGF0ZU9wdGlvbnMob3B0aW9ucyk7XHJcbiAgICB9XHJcbn0iLCJjb25zdCBlbnVtIExldmVsIHtcclxuICAgIFlFQVIsIE1PTlRILCBEQVRFLCBIT1VSLFxyXG4gICAgTUlOVVRFLCBTRUNPTkQsIE5PTkVcclxufVxyXG5cclxuY2xhc3MgRGF0aXVtSW50ZXJuYWxzIHtcclxuICAgIHByaXZhdGUgb3B0aW9uczpJT3B0aW9ucyA9IDxhbnk+e307XHJcbiAgICBcclxuICAgIHByaXZhdGUgaW5wdXQ6SW5wdXQ7XHJcbiAgICBwcml2YXRlIHBpY2tlck1hbmFnZXI6UGlja2VyTWFuYWdlcjtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBlbGVtZW50OkhUTUxJbnB1dEVsZW1lbnQsIG9wdGlvbnM6SU9wdGlvbnMpIHtcclxuICAgICAgICBpZiAoZWxlbWVudCA9PT0gdm9pZCAwKSB0aHJvdyAnZWxlbWVudCBpcyByZXF1aXJlZCc7XHJcbiAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3NwZWxsY2hlY2snLCAnZmFsc2UnKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmlucHV0ID0gbmV3IElucHV0KGVsZW1lbnQpO1xyXG4gICAgICAgIHRoaXMucGlja2VyTWFuYWdlciA9IG5ldyBQaWNrZXJNYW5hZ2VyKGVsZW1lbnQpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMudXBkYXRlT3B0aW9ucyhvcHRpb25zKTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4uZ290byhlbGVtZW50LCAoZSkgPT4gdGhpcy5nb3RvKGUuZGF0ZSwgZS5sZXZlbCwgZS51cGRhdGUpKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmdvdG8odGhpcy5vcHRpb25zWydkZWZhdWx0RGF0ZSddLCBMZXZlbC5OT05FLCB0cnVlKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdvdG8oZGF0ZTpEYXRlLCBsZXZlbDpMZXZlbCwgdXBkYXRlOmJvb2xlYW4gPSB0cnVlKSB7XHJcbiAgICAgICAgaWYgKGRhdGUgPT09IHZvaWQgMCkgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5taW5EYXRlICE9PSB2b2lkIDAgJiYgZGF0ZS52YWx1ZU9mKCkgPCB0aGlzLm9wdGlvbnMubWluRGF0ZS52YWx1ZU9mKCkpIHtcclxuICAgICAgICAgICAgZGF0ZSA9IG5ldyBEYXRlKHRoaXMub3B0aW9ucy5taW5EYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMubWF4RGF0ZSAhPT0gdm9pZCAwICYmIGRhdGUudmFsdWVPZigpID4gdGhpcy5vcHRpb25zLm1heERhdGUudmFsdWVPZigpKSB7XHJcbiAgICAgICAgICAgIGRhdGUgPSBuZXcgRGF0ZSh0aGlzLm9wdGlvbnMubWF4RGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB0cmlnZ2VyLnZpZXdjaGFuZ2VkKHRoaXMuZWxlbWVudCwge1xyXG4gICAgICAgICAgICBkYXRlOiBkYXRlLFxyXG4gICAgICAgICAgICBsZXZlbDogbGV2ZWwsXHJcbiAgICAgICAgICAgIHVwZGF0ZTogdXBkYXRlXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB1cGRhdGVPcHRpb25zKG5ld09wdGlvbnM6SU9wdGlvbnMgPSA8YW55Pnt9KSB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gT3B0aW9uU2FuaXRpemVyLnNhbml0aXplKG5ld09wdGlvbnMsIHRoaXMub3B0aW9ucyk7ICAgICAgICBcclxuICAgICAgICB0aGlzLmlucHV0LnVwZGF0ZU9wdGlvbnModGhpcy5vcHRpb25zKTtcclxuICAgICAgICB0aGlzLnBpY2tlck1hbmFnZXIudXBkYXRlT3B0aW9ucyh0aGlzLm9wdGlvbnMsIHRoaXMuaW5wdXQuZ2V0TGV2ZWxzKCkpO1xyXG4gICAgfVxyXG59IiwiZnVuY3Rpb24gT3B0aW9uRXhjZXB0aW9uKG1zZzpzdHJpbmcpIHtcclxuICAgIHJldHVybiBgW0RhdGl1bSBPcHRpb24gRXhjZXB0aW9uXVxcbiAgJHttc2d9XFxuICBTZWUgaHR0cDovL2RhdGl1bS5pby9kb2N1bWVudGF0aW9uIGZvciBkb2N1bWVudGF0aW9uLmA7XHJcbn1cclxuXHJcbmNsYXNzIE9wdGlvblNhbml0aXplciB7XHJcbiAgICBcclxuICAgIHN0YXRpYyBkZmx0RGF0ZTpEYXRlID0gbmV3IERhdGUoKTtcclxuICAgIFxyXG4gICAgc3RhdGljIHNhbml0aXplRGlzcGxheUFzKGRpc3BsYXlBczphbnksIGRmbHQ6c3RyaW5nID0gJ2g6bW1hIE1NTSBELCBZWVlZJykge1xyXG4gICAgICAgIGlmIChkaXNwbGF5QXMgPT09IHZvaWQgMCkgcmV0dXJuIGRmbHQ7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBkaXNwbGF5QXMgIT09ICdzdHJpbmcnKSB0aHJvdyBPcHRpb25FeGNlcHRpb24oJ1RoZSBcImRpc3BsYXlBc1wiIG9wdGlvbiBtdXN0IGJlIGEgc3RyaW5nJyk7XHJcbiAgICAgICAgcmV0dXJuIGRpc3BsYXlBcztcclxuICAgIH1cclxuICAgIFxyXG4gICAgc3RhdGljIHNhbml0aXplTWluRGF0ZShtaW5EYXRlOmFueSwgZGZsdDpEYXRlID0gdm9pZCAwKSB7XHJcbiAgICAgICAgaWYgKG1pbkRhdGUgPT09IHZvaWQgMCkgcmV0dXJuIGRmbHQ7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKG1pbkRhdGUpOyAvL1RPRE8gZmlndXJlIHRoaXMgb3V0IHllc1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdGF0aWMgc2FuaXRpemVNYXhEYXRlKG1heERhdGU6YW55LCBkZmx0OkRhdGUgPSB2b2lkIDApIHtcclxuICAgICAgICBpZiAobWF4RGF0ZSA9PT0gdm9pZCAwKSByZXR1cm4gZGZsdDtcclxuICAgICAgICByZXR1cm4gbmV3IERhdGUobWF4RGF0ZSk7IC8vVE9ETyBmaWd1cmUgdGhpcyBvdXQgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN0YXRpYyBzYW5pdGl6ZURlZmF1bHREYXRlKGRlZmF1bHREYXRlOmFueSwgZGZsdDpEYXRlID0gdGhpcy5kZmx0RGF0ZSkge1xyXG4gICAgICAgIGlmIChkZWZhdWx0RGF0ZSA9PT0gdm9pZCAwKSByZXR1cm4gZGZsdDtcclxuICAgICAgICByZXR1cm4gbmV3IERhdGUoZGVmYXVsdERhdGUpOyAvL1RPRE8gZmlndXJlIHRoaXMgb3V0XHJcbiAgICB9XHJcbiAgICAgICAgXHJcbiAgICBzdGF0aWMgc2FuaXRpemVDb2xvcihjb2xvcjphbnkpIHtcclxuICAgICAgICBsZXQgdGhyZWVIZXggPSAnXFxcXHMqI1tBLUZhLWYwLTldezN9XFxcXHMqJztcclxuICAgICAgICBsZXQgc2l4SGV4ID0gJ1xcXFxzKiNbQS1GYS1mMC05XXs2fVxcXFxzKic7XHJcbiAgICAgICAgbGV0IHJnYiA9ICdcXFxccypyZ2JcXFxcKFxcXFxzKlswLTldezEsM31cXFxccyosXFxcXHMqWzAtOV17MSwzfVxcXFxzKixcXFxccypbMC05XXsxLDN9XFxcXHMqXFxcXClcXFxccyonO1xyXG4gICAgICAgIGxldCByZ2JhID0gJ1xcXFxzKnJnYmFcXFxcKFxcXFxzKlswLTldezEsM31cXFxccyosXFxcXHMqWzAtOV17MSwzfVxcXFxzKixcXFxccypbMC05XXsxLDN9XFxcXHMqXFxcXCxcXFxccypbMC05XSpcXFxcLlswLTldK1xcXFxzKlxcXFwpXFxcXHMqJztcclxuICAgICAgICBsZXQgc2FuaXRpemVDb2xvclJlZ2V4ID0gbmV3IFJlZ0V4cChgXigoJHt0aHJlZUhleH0pfCgke3NpeEhleH0pfCgke3JnYn0pfCgke3JnYmF9KSkkYCk7XHJcblxyXG4gICAgICAgIGlmIChjb2xvciA9PT0gdm9pZCAwKSB0aHJvdyBPcHRpb25FeGNlcHRpb24oXCJBbGwgdGhlbWUgY29sb3JzIChwcmltYXJ5LCBwcmltYXJ5X3RleHQsIHNlY29uZGFyeSwgc2Vjb25kYXJ5X3RleHQsIHNlY29uZGFyeV9hY2NlbnQpIG11c3QgYmUgZGVmaW5lZFwiKTtcclxuICAgICAgICBpZiAoIXNhbml0aXplQ29sb3JSZWdleC50ZXN0KGNvbG9yKSkgdGhyb3cgT3B0aW9uRXhjZXB0aW9uKFwiQWxsIHRoZW1lIGNvbG9ycyBtdXN0IGJlIHZhbGlkIHJnYiwgcmdiYSwgb3IgaGV4IGNvZGVcIik7XHJcbiAgICAgICAgcmV0dXJuIDxzdHJpbmc+Y29sb3I7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN0YXRpYyBzYW5pdGl6ZVRoZW1lKHRoZW1lOmFueSwgZGZsdDphbnkgPSBcIm1hdGVyaWFsXCIpOklUaGVtZSB7XHJcbiAgICAgICAgaWYgKHRoZW1lID09PSB2b2lkIDApIHJldHVybiBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVUaGVtZShkZmx0LCB2b2lkIDApO1xyXG4gICAgICAgIGlmICh0eXBlb2YgdGhlbWUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHN3aXRjaCh0aGVtZSkge1xyXG4gICAgICAgICAgICBjYXNlICdsaWdodCc6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gPElUaGVtZT57XHJcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeTogJyNlZWUnLFxyXG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnlfdGV4dDogJyM2NjYnLFxyXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeTogJyNmZmYnLFxyXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeV90ZXh0OiAnIzY2NicsXHJcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5X2FjY2VudDogJyM2NjYnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgJ2RhcmsnOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDxJVGhlbWU+e1xyXG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnk6ICcjNDQ0JyxcclxuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5X3RleHQ6ICcjZWVlJyxcclxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnk6ICcjMzMzJyxcclxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnlfdGV4dDogJyNlZWUnLFxyXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeV9hY2NlbnQ6ICcjZmZmJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlICdtYXRlcmlhbCc6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gPElUaGVtZT57XHJcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeTogJyMwMTk1ODcnLFxyXG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnlfdGV4dDogJyNmZmYnLFxyXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeTogJyNmZmYnLFxyXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeV90ZXh0OiAnIzg4OCcsXHJcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5X2FjY2VudDogJyMwMTk1ODcnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBcIk5hbWUgb2YgdGhlbWUgbm90IHZhbGlkLlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhlbWUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiA8SVRoZW1lPiB7XHJcbiAgICAgICAgICAgICAgICBwcmltYXJ5OiBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVDb2xvcih0aGVtZVsncHJpbWFyeSddKSxcclxuICAgICAgICAgICAgICAgIHNlY29uZGFyeTogT3B0aW9uU2FuaXRpemVyLnNhbml0aXplQ29sb3IodGhlbWVbJ3NlY29uZGFyeSddKSxcclxuICAgICAgICAgICAgICAgIHByaW1hcnlfdGV4dDogT3B0aW9uU2FuaXRpemVyLnNhbml0aXplQ29sb3IodGhlbWVbJ3ByaW1hcnlfdGV4dCddKSxcclxuICAgICAgICAgICAgICAgIHNlY29uZGFyeV90ZXh0OiBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVDb2xvcih0aGVtZVsnc2Vjb25kYXJ5X3RleHQnXSksXHJcbiAgICAgICAgICAgICAgICBzZWNvbmRhcnlfYWNjZW50OiBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVDb2xvcih0aGVtZVsnc2Vjb25kYXJ5X2FjY2VudCddKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgT3B0aW9uRXhjZXB0aW9uKCdUaGUgXCJ0aGVtZVwiIG9wdGlvbiBtdXN0IGJlIG9iamVjdCBvciBzdHJpbmcnKTtcclxuICAgICAgICB9XHJcbiAgICB9IFxyXG4gICAgXHJcbiAgICBcclxuICAgIHN0YXRpYyBzYW5pdGl6ZShvcHRpb25zOklPcHRpb25zLCBkZWZhdWx0czpJT3B0aW9ucykge1xyXG4gICAgICAgIGxldCBvcHRzOklPcHRpb25zID0ge1xyXG4gICAgICAgICAgICBkaXNwbGF5QXM6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZURpc3BsYXlBcyhvcHRpb25zWydkaXNwbGF5QXMnXSwgZGVmYXVsdHMuZGlzcGxheUFzKSxcclxuICAgICAgICAgICAgbWluRGF0ZTogT3B0aW9uU2FuaXRpemVyLnNhbml0aXplTWluRGF0ZShvcHRpb25zWydtaW5EYXRlJ10sIGRlZmF1bHRzLm1pbkRhdGUpLFxyXG4gICAgICAgICAgICBtYXhEYXRlOiBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVNYXhEYXRlKG9wdGlvbnNbJ21heERhdGUnXSwgZGVmYXVsdHMubWF4RGF0ZSksXHJcbiAgICAgICAgICAgIGRlZmF1bHREYXRlOiBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVEZWZhdWx0RGF0ZShvcHRpb25zWydkZWZhdWx0RGF0ZSddLCBkZWZhdWx0cy5kZWZhdWx0RGF0ZSksXHJcbiAgICAgICAgICAgIHRoZW1lOiBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVUaGVtZShvcHRpb25zWyd0aGVtZSddLCBkZWZhdWx0cy50aGVtZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIG9wdHM7XHJcbiAgICB9XHJcbn0iLCJjbGFzcyBDb21tb24ge1xyXG4gICAgcHJvdGVjdGVkIGdldE1vbnRocygpIHtcclxuICAgICAgICByZXR1cm4gW1wiSmFudWFyeVwiLCBcIkZlYnJ1YXJ5XCIsIFwiTWFyY2hcIiwgXCJBcHJpbFwiLCBcIk1heVwiLCBcIkp1bmVcIiwgXCJKdWx5XCIsIFwiQXVndXN0XCIsIFwiU2VwdGVtYmVyXCIsIFwiT2N0b2JlclwiLCBcIk5vdmVtYmVyXCIsIFwiRGVjZW1iZXJcIl07XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBnZXRTaG9ydE1vbnRocygpIHtcclxuICAgICAgICByZXR1cm4gW1wiSmFuXCIsIFwiRmViXCIsIFwiTWFyXCIsIFwiQXByXCIsIFwiTWF5XCIsIFwiSnVuXCIsIFwiSnVsXCIsIFwiQXVnXCIsIFwiU2VwXCIsIFwiT2N0XCIsIFwiTm92XCIsIFwiRGVjXCJdO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgZ2V0RGF5cygpIHtcclxuICAgICAgICByZXR1cm4gW1wiU3VuZGF5XCIsIFwiTW9uZGF5XCIsIFwiVHVlc2RheVwiLCBcIldlZG5lc2RheVwiLCBcIlRodXJzZGF5XCIsIFwiRnJpZGF5XCIsIFwiU2F0dXJkYXlcIl07XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBnZXRTaG9ydERheXMoKSB7XHJcbiAgICAgICAgcmV0dXJuIFtcIlN1blwiLCBcIk1vblwiLCBcIlR1ZVwiLCBcIldlZFwiLCBcIlRodVwiLCBcIkZyaVwiLCBcIlNhdFwiXTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGRheXNJbk1vbnRoKGRhdGU6RGF0ZSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSArIDEsIDApLmdldERhdGUoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGdldEhvdXJzKGRhdGU6RGF0ZSk6c3RyaW5nIHtcclxuICAgICAgICBsZXQgbnVtID0gZGF0ZS5nZXRIb3VycygpO1xyXG4gICAgICAgIGlmIChudW0gPT09IDApIG51bSA9IDEyO1xyXG4gICAgICAgIGlmIChudW0gPiAxMikgbnVtIC09IDEyO1xyXG4gICAgICAgIHJldHVybiBudW0udG9TdHJpbmcoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGdldERlY2FkZShkYXRlOkRhdGUpOnN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIGAke01hdGguZmxvb3IoZGF0ZS5nZXRGdWxsWWVhcigpLzEwKSoxMH0gLSAke01hdGguY2VpbCgoZGF0ZS5nZXRGdWxsWWVhcigpICsgMSkvMTApKjEwfWA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBnZXRNZXJpZGllbShkYXRlOkRhdGUpOnN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIGRhdGUuZ2V0SG91cnMoKSA8IDEyID8gJ2FtJyA6ICdwbSc7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBwYWQobnVtOm51bWJlcnxzdHJpbmcsIHNpemU6bnVtYmVyID0gMikge1xyXG4gICAgICAgIGxldCBzdHIgPSBudW0udG9TdHJpbmcoKTtcclxuICAgICAgICB3aGlsZShzdHIubGVuZ3RoIDwgc2l6ZSkgc3RyID0gJzAnICsgc3RyO1xyXG4gICAgICAgIHJldHVybiBzdHI7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCB0cmltKHN0cjpzdHJpbmcpIHtcclxuICAgICAgICB3aGlsZSAoc3RyWzBdID09PSAnMCcgJiYgc3RyLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgc3RyID0gc3RyLnN1YnN0cigxLCBzdHIubGVuZ3RoKTsgIFxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3RyO1xyXG4gICAgfVxyXG59IiwiQ3VzdG9tRXZlbnQgPSAoZnVuY3Rpb24oKSB7XHJcbiAgICBmdW5jdGlvbiB1c2VOYXRpdmUgKCkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGxldCBjdXN0b21FdmVudCA9IG5ldyBDdXN0b21FdmVudCgnYScsIHsgZGV0YWlsOiB7IGI6ICdiJyB9IH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gICdhJyA9PT0gY3VzdG9tRXZlbnQudHlwZSAmJiAnYicgPT09IGN1c3RvbUV2ZW50LmRldGFpbC5iO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZiAodXNlTmF0aXZlKCkpIHtcclxuICAgICAgICByZXR1cm4gPGFueT5DdXN0b21FdmVudDtcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRvY3VtZW50LmNyZWF0ZUV2ZW50ID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgLy8gSUUgPj0gOVxyXG4gICAgICAgIHJldHVybiA8YW55PmZ1bmN0aW9uKHR5cGU6c3RyaW5nLCBwYXJhbXM6Q3VzdG9tRXZlbnRJbml0KSB7XHJcbiAgICAgICAgICAgIGxldCBlID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0N1c3RvbUV2ZW50Jyk7XHJcbiAgICAgICAgICAgIGlmIChwYXJhbXMpIHtcclxuICAgICAgICAgICAgICAgIGUuaW5pdEN1c3RvbUV2ZW50KHR5cGUsIHBhcmFtcy5idWJibGVzLCBwYXJhbXMuY2FuY2VsYWJsZSwgcGFyYW1zLmRldGFpbCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBlLmluaXRDdXN0b21FdmVudCh0eXBlLCBmYWxzZSwgZmFsc2UsIHZvaWQgMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGU7XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBJRSA+PSA4XHJcbiAgICAgICAgcmV0dXJuIDxhbnk+ZnVuY3Rpb24odHlwZTpzdHJpbmcsIHBhcmFtczpDdXN0b21FdmVudEluaXQpIHtcclxuICAgICAgICAgICAgbGV0IGUgPSAoPGFueT5kb2N1bWVudCkuY3JlYXRlRXZlbnRPYmplY3QoKTtcclxuICAgICAgICAgICAgZS50eXBlID0gdHlwZTtcclxuICAgICAgICAgICAgaWYgKHBhcmFtcykge1xyXG4gICAgICAgICAgICAgICAgZS5idWJibGVzID0gQm9vbGVhbihwYXJhbXMuYnViYmxlcyk7XHJcbiAgICAgICAgICAgICAgICBlLmNhbmNlbGFibGUgPSBCb29sZWFuKHBhcmFtcy5jYW5jZWxhYmxlKTtcclxuICAgICAgICAgICAgICAgIGUuZGV0YWlsID0gcGFyYW1zLmRldGFpbDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGUuYnViYmxlcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgZS5jYW5jZWxhYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBlLmRldGFpbCA9IHZvaWQgMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZTtcclxuICAgICAgICB9IFxyXG4gICAgfSAgXHJcbn0pKCk7XHJcbiIsImludGVyZmFjZSBJTGlzdGVuZXJSZWZlcmVuY2Uge1xyXG4gICAgZWxlbWVudDogRWxlbWVudHxEb2N1bWVudHxXaW5kb3c7XHJcbiAgICByZWZlcmVuY2U6IEV2ZW50TGlzdGVuZXI7XHJcbiAgICBldmVudDogc3RyaW5nO1xyXG59XHJcblxyXG5uYW1lc3BhY2UgbGlzdGVuIHtcclxuICAgIGxldCBtYXRjaGVzID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50Lm1hdGNoZXMgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50Lm1zTWF0Y2hlc1NlbGVjdG9yO1xyXG4gICAgXHJcbiAgICBmdW5jdGlvbiBoYW5kbGVEZWxlZ2F0ZUV2ZW50KHBhcmVudDpFbGVtZW50LCBkZWxlZ2F0ZVNlbGVjdG9yOnN0cmluZywgY2FsbGJhY2s6KGU/Ok1vdXNlRXZlbnR8VG91Y2hFdmVudCkgPT4gdm9pZCkge1xyXG4gICAgICAgIHJldHVybiAoZTpNb3VzZUV2ZW50fFRvdWNoRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdmFyIHRhcmdldCA9IGUuc3JjRWxlbWVudCB8fCA8RWxlbWVudD5lLnRhcmdldDtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHdoaWxlKCF0YXJnZXQuaXNFcXVhbE5vZGUocGFyZW50KSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoZXMuY2FsbCh0YXJnZXQsIGRlbGVnYXRlU2VsZWN0b3IpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudEVsZW1lbnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIGF0dGFjaEV2ZW50c0RlbGVnYXRlKGV2ZW50czpzdHJpbmdbXSwgcGFyZW50OkVsZW1lbnQsIGRlbGVnYXRlU2VsZWN0b3I6c3RyaW5nLCBjYWxsYmFjazooZT86TW91c2VFdmVudHxUb3VjaEV2ZW50KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgbGV0IGxpc3RlbmVyczpJTGlzdGVuZXJSZWZlcmVuY2VbXSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiBldmVudHMpIHtcclxuICAgICAgICAgICAgbGV0IGV2ZW50OnN0cmluZyA9IGV2ZW50c1trZXldO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IG5ld0xpc3RlbmVyID0gaGFuZGxlRGVsZWdhdGVFdmVudChwYXJlbnQsIGRlbGVnYXRlU2VsZWN0b3IsIGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgbGlzdGVuZXJzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudDogcGFyZW50LFxyXG4gICAgICAgICAgICAgICAgcmVmZXJlbmNlOiBuZXdMaXN0ZW5lcixcclxuICAgICAgICAgICAgICAgIGV2ZW50OiBldmVudFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHBhcmVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBuZXdMaXN0ZW5lcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBsaXN0ZW5lcnM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIGF0dGFjaEV2ZW50cyhldmVudHM6c3RyaW5nW10sIGVsZW1lbnQ6RWxlbWVudHxEb2N1bWVudHxXaW5kb3csIGNhbGxiYWNrOihlPzphbnkpID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdIHtcclxuICAgICAgICBsZXQgbGlzdGVuZXJzOklMaXN0ZW5lclJlZmVyZW5jZVtdID0gW107XHJcbiAgICAgICAgZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGxpc3RlbmVycy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGVsZW1lbnQsXHJcbiAgICAgICAgICAgICAgICByZWZlcmVuY2U6IGNhbGxiYWNrLFxyXG4gICAgICAgICAgICAgICAgZXZlbnQ6IGV2ZW50XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGNhbGxiYWNrKTsgXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGxpc3RlbmVycztcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gTkFUSVZFXHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiBmb2N1cyhlbGVtZW50OkVsZW1lbnR8RG9jdW1lbnR8V2luZG93LCBjYWxsYmFjazooZT86Rm9jdXNFdmVudCkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xyXG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydmb2N1cyddLCBlbGVtZW50LCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBjYWxsYmFjayhlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGRvd24oZWxlbWVudDpFbGVtZW50fERvY3VtZW50fFdpbmRvdywgY2FsbGJhY2s6KGU/Ok1vdXNlRXZlbnR8VG91Y2hFdmVudCkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW107XHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZG93bihwYXJlbnQ6RWxlbWVudHxEb2N1bWVudHxXaW5kb3csIGRlbGVnYXRlU2VsZWN0b3I6c3RyaW5nLCBjYWxsYmFjazooZT86TW91c2VFdmVudHxUb3VjaEV2ZW50KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXTtcclxuICAgIGV4cG9ydCBmdW5jdGlvbiBkb3duKC4uLnBhcmFtczphbnlbXSkge1xyXG4gICAgICAgIGlmIChwYXJhbXMubGVuZ3RoID09PSAzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhdHRhY2hFdmVudHNEZWxlZ2F0ZShbJ21vdXNlZG93bicsICd0b3VjaHN0YXJ0J10sIHBhcmFtc1swXSwgcGFyYW1zWzFdLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcGFyYW1zWzJdKDxhbnk+ZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydtb3VzZWRvd24nLCAndG91Y2hzdGFydCddLCBwYXJhbXNbMF0sIChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBwYXJhbXNbMV0oPGFueT5lKTtcclxuICAgICAgICAgICAgfSk7ICAgICAgICBcclxuICAgICAgICB9IFxyXG4gICAgfTtcclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHVwKGVsZW1lbnQ6RWxlbWVudHxEb2N1bWVudHxXaW5kb3csIGNhbGxiYWNrOihlPzpNb3VzZUV2ZW50KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ21vdXNldXAnLCAndG91Y2hlbmQnXSwgZWxlbWVudCwgKGUpID0+IHtcclxuICAgICAgICAgICAgY2FsbGJhY2soZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiBtb3VzZWRvd24oZWxlbWVudDpFbGVtZW50fERvY3VtZW50fFdpbmRvdywgY2FsbGJhY2s6KGU/Ok1vdXNlRXZlbnQpID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdIHtcclxuICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzKFsnbW91c2Vkb3duJ10sIGVsZW1lbnQsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gbW91c2V1cChlbGVtZW50OkVsZW1lbnR8RG9jdW1lbnR8V2luZG93LCBjYWxsYmFjazooZT86TW91c2VFdmVudCkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xyXG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydtb3VzZXVwJ10sIGVsZW1lbnQsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gcGFzdGUoZWxlbWVudDpFbGVtZW50fERvY3VtZW50fFdpbmRvdywgY2FsbGJhY2s6KGU/Ok1vdXNlRXZlbnQpID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdIHtcclxuICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzKFsncGFzdGUnXSwgZWxlbWVudCwgKGUpID0+IHtcclxuICAgICAgICAgICAgY2FsbGJhY2soZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiB0YXAoZWxlbWVudDpFbGVtZW50fERvY3VtZW50LCBjYWxsYmFjazooZT86RXZlbnQpID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdO1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHRhcChwYXJlbnQ6RWxlbWVudHxEb2N1bWVudCwgZGVsZWdhdGVTZWxlY3RvcjpzdHJpbmcsIGNhbGxiYWNrOihlPzpFdmVudCkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW107XHJcbiAgICBleHBvcnQgZnVuY3Rpb24gdGFwKC4uLnBhcmFtczphbnlbXSk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xyXG4gICAgICAgIGxldCBzdGFydFRvdWNoWDpudW1iZXIsIHN0YXJ0VG91Y2hZOm51bWJlcjtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgaGFuZGxlU3RhcnQgPSAoZTpUb3VjaEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHN0YXJ0VG91Y2hYID0gZS50b3VjaGVzWzBdLmNsaWVudFg7XHJcbiAgICAgICAgICAgIHN0YXJ0VG91Y2hZID0gZS50b3VjaGVzWzBdLmNsaWVudFk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBoYW5kbGVFbmQgPSAoZTpUb3VjaEV2ZW50LCBjYWxsYmFjazooZT86RXZlbnQpID0+IHZvaWQpID0+IHtcclxuICAgICAgICAgICAgaWYgKGUuY2hhbmdlZFRvdWNoZXMgPT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCB4RGlmZiA9IGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WCAtIHN0YXJ0VG91Y2hYO1xyXG4gICAgICAgICAgICBsZXQgeURpZmYgPSBlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFkgLSBzdGFydFRvdWNoWTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChNYXRoLnNxcnQoeERpZmYgKiB4RGlmZiArIHlEaWZmICogeURpZmYpIDwgMTApIHtcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBsaXN0ZW5lcnM6SUxpc3RlbmVyUmVmZXJlbmNlW10gPSBbXTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAocGFyYW1zLmxlbmd0aCA9PT0gMykge1xyXG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuY29uY2F0KGF0dGFjaEV2ZW50c0RlbGVnYXRlKFsndG91Y2hzdGFydCddLCBwYXJhbXNbMF0sIHBhcmFtc1sxXSwgaGFuZGxlU3RhcnQpKTtcclxuICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChhdHRhY2hFdmVudHNEZWxlZ2F0ZShbJ3RvdWNoZW5kJywgJ2NsaWNrJ10sIHBhcmFtc1swXSwgcGFyYW1zWzFdLCAoZTpUb3VjaEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVFbmQoZSwgcGFyYW1zWzJdKTtcclxuICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAocGFyYW1zLmxlbmd0aCA9PT0gMikge1xyXG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuY29uY2F0KGF0dGFjaEV2ZW50cyhbJ3RvdWNoc3RhcnQnXSwgcGFyYW1zWzBdLCBoYW5kbGVTdGFydCkpO1xyXG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuY29uY2F0KGF0dGFjaEV2ZW50cyhbJ3RvdWNoZW5kJywgJ2NsaWNrJ10sIHBhcmFtc1swXSwgKGU6VG91Y2hFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlRW5kKGUsIHBhcmFtc1sxXSk7XHJcbiAgICAgICAgICAgIH0pKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGxpc3RlbmVycztcclxuICAgIH1cclxuICAgIFxyXG4gICAgZnVuY3Rpb24gc3dpcGUoZWxlbWVudDpFbGVtZW50LCBkaXJlY3Rpb246c3RyaW5nLCBjYWxsYmFjazooZT86RXZlbnQpID0+IHZvaWQpIHtcclxuICAgICAgICBsZXQgc3RhcnRUb3VjaFg6bnVtYmVyLCBzdGFydFRvdWNoWTpudW1iZXIsIHN0YXJ0VGltZTpudW1iZXI7XHJcbiAgICAgICAgbGV0IHRvdWNoTW92ZUxpc3RlbmVyOklMaXN0ZW5lclJlZmVyZW5jZTtcclxuICAgICAgICBsZXQgc2Nyb2xsaW5nRGlzYWJsZWQ6Ym9vbGVhbjtcclxuICAgICAgICBcclxuICAgICAgICBhdHRhY2hFdmVudHMoWyd0b3VjaHN0YXJ0J10sIGVsZW1lbnQsIChlOlRvdWNoRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgc3RhcnRUb3VjaFggPSBlLnRvdWNoZXNbMF0uY2xpZW50WDtcclxuICAgICAgICAgICAgc3RhcnRUb3VjaFkgPSBlLnRvdWNoZXNbMF0uY2xpZW50WTtcclxuICAgICAgICAgICAgc3RhcnRUaW1lID0gbmV3IERhdGUoKS52YWx1ZU9mKCk7XHJcbiAgICAgICAgICAgIHNjcm9sbGluZ0Rpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRvdWNoTW92ZUxpc3RlbmVyID0gYXR0YWNoRXZlbnRzKFsndG91Y2htb3ZlJ10sIGRvY3VtZW50LCAoZTpUb3VjaEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgeERpZmYgPSBNYXRoLmFicyhlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFggLSBzdGFydFRvdWNoWCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgeURpZmYgPSBNYXRoLmFicyhlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFkgLSBzdGFydFRvdWNoWSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoeERpZmYgPiB5RGlmZiAmJiB4RGlmZiA+IDIwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsaW5nRGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh5RGlmZiA+IHhEaWZmICYmIHlEaWZmID4gMjApIHtcclxuICAgICAgICAgICAgICAgICAgICBzY3JvbGxpbmdEaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKG5ldyBEYXRlKCkudmFsdWVPZigpIC0gc3RhcnRUaW1lID4gNTAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsaW5nRGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChzY3JvbGxpbmdEaXNhYmxlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlbMF07IFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGF0dGFjaEV2ZW50cyhbJ3RvdWNoZW5kJ10sIGVsZW1lbnQsIChlOlRvdWNoRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0b3VjaE1vdmVMaXN0ZW5lci5ldmVudCwgdG91Y2hNb3ZlTGlzdGVuZXIucmVmZXJlbmNlKTtcclxuICAgICAgICAgICAgaWYgKHN0YXJ0VG91Y2hYID09PSB2b2lkIDAgfHwgc3RhcnRUb3VjaFkgPT09IHZvaWQgMCkgcmV0dXJuO1xyXG4gICAgICAgICAgICBpZiAobmV3IERhdGUoKS52YWx1ZU9mKCkgLSBzdGFydFRpbWUgPiA1MDApIHJldHVybjtcclxuICAgICAgICAgICAgbGV0IHhEaWZmID0gZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRYIC0gc3RhcnRUb3VjaFg7XHJcbiAgICAgICAgICAgIGxldCB5RGlmZiA9IGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WSAtIHN0YXJ0VG91Y2hZO1xyXG4gICAgICAgICAgICBpZiAoTWF0aC5hYnMoeERpZmYpID4gTWF0aC5hYnMoeURpZmYpICYmIE1hdGguYWJzKHhEaWZmKSA+IDIwKSB7XHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGlyZWN0aW9uID09PSAnbGVmdCcgJiYgeERpZmYgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZGlyZWN0aW9uID09PSAncmlnaHQnICYmIHhEaWZmID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBzd2lwZUxlZnQoZWxlbWVudDpFbGVtZW50LCBjYWxsYmFjazooZT86RXZlbnQpID0+IHZvaWQpIHtcclxuICAgICAgICBzd2lwZShlbGVtZW50LCAnbGVmdCcsIGNhbGxiYWNrKTtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gc3dpcGVSaWdodChlbGVtZW50OkVsZW1lbnQsIGNhbGxiYWNrOihlPzpFdmVudCkgPT4gdm9pZCkge1xyXG4gICAgICAgIHN3aXBlKGVsZW1lbnQsICdyaWdodCcsIGNhbGxiYWNrKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gQ1VTVE9NXHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiBnb3RvKGVsZW1lbnQ6RWxlbWVudCwgY2FsbGJhY2s6KGU/OntkYXRlOkRhdGUsIGxldmVsOkxldmVsLCB1cGRhdGU/OmJvb2xlYW59KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ2RhdGl1bS1nb3RvJ10sIGVsZW1lbnQsIChlOkN1c3RvbUV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGUuZGV0YWlsKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHZpZXdjaGFuZ2VkKGVsZW1lbnQ6RWxlbWVudCwgY2FsbGJhY2s6KGU/OntkYXRlOkRhdGUsIGxldmVsOkxldmVsLCB1cGRhdGU/OmJvb2xlYW59KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ2RhdGl1bS12aWV3Y2hhbmdlZCddLCBlbGVtZW50LCAoZTpDdXN0b21FdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBjYWxsYmFjayhlLmRldGFpbCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiBvcGVuQnViYmxlKGVsZW1lbnQ6RWxlbWVudCwgY2FsbGJhY2s6KGU6e3g6bnVtYmVyLCB5Om51bWJlciwgdGV4dDpzdHJpbmd9KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ2RhdGl1bS1vcGVuLWJ1YmJsZSddLCBlbGVtZW50LCAoZTpDdXN0b21FdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBjYWxsYmFjayhlLmRldGFpbCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcnMobGlzdGVuZXJzOklMaXN0ZW5lclJlZmVyZW5jZVtdKSB7XHJcbiAgICAgICAgbGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyKSA9PiB7XHJcbiAgICAgICAgICAgbGlzdGVuZXIuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGxpc3RlbmVyLmV2ZW50LCBsaXN0ZW5lci5yZWZlcmVuY2UpOyBcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxubmFtZXNwYWNlIHRyaWdnZXIge1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGdvdG8oZWxlbWVudDpFbGVtZW50LCBkYXRhPzp7ZGF0ZTpEYXRlLCBsZXZlbDpMZXZlbCwgdXBkYXRlPzpib29sZWFufSkge1xyXG4gICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2RhdGl1bS1nb3RvJywge1xyXG4gICAgICAgICAgICBidWJibGVzOiBmYWxzZSxcclxuICAgICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgZGV0YWlsOiBkYXRhXHJcbiAgICAgICAgfSkpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gdmlld2NoYW5nZWQoZWxlbWVudDpFbGVtZW50LCBkYXRhPzp7ZGF0ZTpEYXRlLCBsZXZlbDpMZXZlbCwgdXBkYXRlPzpib29sZWFufSkge1xyXG4gICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2RhdGl1bS12aWV3Y2hhbmdlZCcsIHtcclxuICAgICAgICAgICAgYnViYmxlczogZmFsc2UsXHJcbiAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXHJcbiAgICAgICAgICAgIGRldGFpbDogZGF0YVxyXG4gICAgICAgIH0pKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIG9wZW5CdWJibGUoZWxlbWVudDpFbGVtZW50LCBkYXRhOnt4Om51bWJlciwgeTpudW1iZXIsIHRleHQ6c3RyaW5nfSkge1xyXG4gICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2RhdGl1bS1vcGVuLWJ1YmJsZScsIHtcclxuICAgICAgICAgICAgYnViYmxlczogZmFsc2UsXHJcbiAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXHJcbiAgICAgICAgICAgIGRldGFpbDogZGF0YVxyXG4gICAgICAgIH0pKTtcclxuICAgIH1cclxufSIsImludGVyZmFjZSBJRGF0ZVBhcnQge1xyXG4gICAgaW5jcmVtZW50KCk6dm9pZDtcclxuICAgIGRlY3JlbWVudCgpOnZvaWQ7XHJcbiAgICBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKTpib29sZWFuO1xyXG4gICAgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpOmJvb2xlYW47XHJcbiAgICBnZXRWYWx1ZSgpOkRhdGU7XHJcbiAgICBnZXRSZWdFeCgpOlJlZ0V4cDtcclxuICAgIHNldFNlbGVjdGFibGUoc2VsZWN0YWJsZTpib29sZWFuKTpJRGF0ZVBhcnQ7XHJcbiAgICBnZXRNYXhCdWZmZXIoKTpudW1iZXI7XHJcbiAgICBnZXRMZXZlbCgpOkxldmVsO1xyXG4gICAgaXNTZWxlY3RhYmxlKCk6Ym9vbGVhbjtcclxuICAgIHRvU3RyaW5nKCk6c3RyaW5nO1xyXG59XHJcblxyXG5jbGFzcyBQbGFpblRleHQgaW1wbGVtZW50cyBJRGF0ZVBhcnQge1xyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSB0ZXh0OnN0cmluZykge31cclxuICAgIHB1YmxpYyBpbmNyZW1lbnQoKSB7fVxyXG4gICAgcHVibGljIGRlY3JlbWVudCgpIHt9XHJcbiAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbCgpIHsgcmV0dXJuIGZhbHNlIH1cclxuICAgIHB1YmxpYyBzZXRWYWx1ZSgpIHsgcmV0dXJuIGZhbHNlIH1cclxuICAgIHB1YmxpYyBnZXRWYWx1ZSgpOkRhdGUgeyByZXR1cm4gbnVsbCB9XHJcbiAgICBwdWJsaWMgZ2V0UmVnRXgoKTpSZWdFeHAgeyByZXR1cm4gbmV3IFJlZ0V4cChgWyR7dGhpcy50ZXh0fV1gKTsgfVxyXG4gICAgcHVibGljIHNldFNlbGVjdGFibGUoc2VsZWN0YWJsZTpib29sZWFuKTpJRGF0ZVBhcnQgeyByZXR1cm4gdGhpcyB9XHJcbiAgICBwdWJsaWMgZ2V0TWF4QnVmZmVyKCk6bnVtYmVyIHsgcmV0dXJuIDAgfVxyXG4gICAgcHVibGljIGdldExldmVsKCk6TGV2ZWwgeyByZXR1cm4gTGV2ZWwuTk9ORSB9XHJcbiAgICBwdWJsaWMgaXNTZWxlY3RhYmxlKCk6Ym9vbGVhbiB7IHJldHVybiBmYWxzZSB9XHJcbiAgICBwdWJsaWMgdG9TdHJpbmcoKTpzdHJpbmcgeyByZXR1cm4gdGhpcy50ZXh0IH1cclxufVxyXG4gICAgXHJcbmxldCBmb3JtYXRCbG9ja3MgPSAoZnVuY3Rpb24oKSB7ICAgIFxyXG4gICAgY2xhc3MgRGF0ZVBhcnQgZXh0ZW5kcyBDb21tb24ge1xyXG4gICAgICAgIHByb3RlY3RlZCBkYXRlOkRhdGU7XHJcbiAgICAgICAgcHJvdGVjdGVkIHNlbGVjdGFibGU6Ym9vbGVhbiA9IHRydWU7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFZhbHVlKCk6RGF0ZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGVcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFNlbGVjdGFibGUoc2VsZWN0YWJsZTpib29sZWFuKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0YWJsZSA9IHNlbGVjdGFibGU7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgaXNTZWxlY3RhYmxlKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RhYmxlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgRm91ckRpZ2l0WWVhciBleHRlbmRzIERhdGVQYXJ0IHtcclxuICAgICAgICBwdWJsaWMgaW5jcmVtZW50KCkge1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0RnVsbFllYXIodGhpcy5kYXRlLmdldEZ1bGxZZWFyKCkgKyAxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGRlY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgdGhpcy5kYXRlLnNldEZ1bGxZZWFyKHRoaXMuZGF0ZS5nZXRGdWxsWWVhcigpIC0gMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHBhcnRpYWwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKHZhbHVlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHRoaXMuZ2V0UmVnRXgoKS50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldEZ1bGxZZWFyKHBhcnNlSW50KHZhbHVlLCAxMCkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXi0/XFxkezEsNH0kLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIExldmVsLllFQVI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXRGdWxsWWVhcigpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBUd29EaWdpdFllYXIgZXh0ZW5kcyBGb3VyRGlnaXRZZWFyIHtcclxuICAgICAgICBwdWJsaWMgZ2V0TWF4QnVmZmVyKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gMjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBiYXNlID0gTWF0aC5mbG9vcihzdXBlci5nZXRWYWx1ZSgpLmdldEZ1bGxZZWFyKCkvMTAwKSoxMDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0RnVsbFllYXIocGFyc2VJbnQoPHN0cmluZz52YWx1ZSwgMTApICsgYmFzZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eLT9cXGR7MSwyfSQvO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzdXBlci50b1N0cmluZygpLnNsaWNlKC0yKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIExvbmdNb250aE5hbWUgZXh0ZW5kcyBEYXRlUGFydCB7XHJcbiAgICAgICAgcHJvdGVjdGVkIGdldE1vbnRocygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLmdldE1vbnRocygpO1xyXG4gICAgICAgIH0gXHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGluY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRNb250aCgpICsgMTtcclxuICAgICAgICAgICAgaWYgKG51bSA+IDExKSBudW0gPSAwO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0TW9udGgobnVtKTtcclxuICAgICAgICAgICAgd2hpbGUgKHRoaXMuZGF0ZS5nZXRNb250aCgpID4gbnVtKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0RGF0ZSh0aGlzLmRhdGUuZ2V0RGF0ZSgpIC0gMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGRlY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRNb250aCgpIC0gMTtcclxuICAgICAgICAgICAgaWYgKG51bSA8IDApIG51bSA9IDExO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0TW9udGgobnVtKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgbGV0IG1vbnRoID0gdGhpcy5nZXRNb250aHMoKS5maWx0ZXIoKG1vbnRoKSA9PiB7XHJcbiAgICAgICAgICAgICAgIHJldHVybiBuZXcgUmVnRXhwKGBeJHtwYXJ0aWFsfS4qJGAsICdpJykudGVzdChtb250aCk7IFxyXG4gICAgICAgICAgICB9KVswXTtcclxuICAgICAgICAgICAgaWYgKG1vbnRoICE9PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKG1vbnRoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5nZXRNb250aHMoKS5pbmRleE9mKHZhbHVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRNb250aChudW0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUmVnRXhwKGBeKCgke3RoaXMuZ2V0TW9udGhzKCkuam9pbihcIil8KFwiKX0pKSRgLCAnaScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TWF4QnVmZmVyKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gWzIsMSwzLDIsMywzLDMsMiwxLDEsMSwxXVt0aGlzLmRhdGUuZ2V0TW9udGgoKV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIExldmVsLk1PTlRIO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE1vbnRocygpW3RoaXMuZGF0ZS5nZXRNb250aCgpXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIFNob3J0TW9udGhOYW1lIGV4dGVuZHMgTG9uZ01vbnRoTmFtZSB7XHJcbiAgICAgICAgcHJvdGVjdGVkIGdldE1vbnRocygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLmdldFNob3J0TW9udGhzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBNb250aCBleHRlbmRzIExvbmdNb250aE5hbWUge1xyXG4gICAgICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0TW9udGgoKSA+IDAgPyAxIDogMjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKC9eXFxkezEsMn0kLy50ZXN0KHBhcnRpYWwpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdHJpbW1lZCA9IHRoaXMudHJpbShwYXJ0aWFsID09PSAnMCcgPyAnMScgOiBwYXJ0aWFsKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHRyaW1tZWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRNb250aChwYXJzZUludCh2YWx1ZSwgMTApIC0gMSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eKFsxLTldfCgxWzAtMl0pKSQvO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAodGhpcy5kYXRlLmdldE1vbnRoKCkgKyAxKS50b1N0cmluZygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgUGFkZGVkTW9udGggZXh0ZW5kcyBNb250aCB7XHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKC9eXFxkezEsMn0kLy50ZXN0KHBhcnRpYWwpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGFkZGVkID0gdGhpcy5wYWQocGFydGlhbCA9PT0gJzAnID8gJzEnIDogcGFydGlhbCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZShwYWRkZWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL14oKDBbMS05XSl8KDFbMC0yXSkpJC87ICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFkKHN1cGVyLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgRGF0ZU51bWVyYWwgZXh0ZW5kcyBEYXRlUGFydCB7XHJcbiAgICAgICAgcHVibGljIGluY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXREYXRlKCkgKyAxO1xyXG4gICAgICAgICAgICBpZiAobnVtID4gdGhpcy5kYXlzSW5Nb250aCh0aGlzLmRhdGUpKSBudW0gPSAxO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0RGF0ZShudW0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZGVjcmVtZW50KCkge1xyXG4gICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldERhdGUoKSAtIDE7XHJcbiAgICAgICAgICAgIGlmIChudW0gPCAxKSBudW0gPSB0aGlzLmRheXNJbk1vbnRoKHRoaXMuZGF0ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXREYXRlKG51bSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICgvXlxcZHsxLDJ9JC8udGVzdChwYXJ0aWFsKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHRyaW1tZWQgPSB0aGlzLnRyaW0ocGFydGlhbCA9PT0gJzAnID8gJzEnIDogcGFydGlhbCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0cmltbWVkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpICYmIHBhcnNlSW50KHZhbHVlLCAxMCkgPCB0aGlzLmRheXNJbk1vbnRoKHRoaXMuZGF0ZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXREYXRlKHBhcnNlSW50KHZhbHVlLCAxMCkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXlsxLTldfCgoMXwyKVswLTldKXwoM1swLTFdKSQvO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TWF4QnVmZmVyKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldERhdGUoKSA+IE1hdGguZmxvb3IodGhpcy5kYXlzSW5Nb250aCh0aGlzLmRhdGUpLzEwKSA/IDEgOiAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBMZXZlbC5EQVRFO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0RGF0ZSgpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBQYWRkZWREYXRlIGV4dGVuZHMgRGF0ZU51bWVyYWwge1xyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICgvXlxcZHsxLDJ9JC8udGVzdChwYXJ0aWFsKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhZGRlZCA9IHRoaXMucGFkKHBhcnRpYWwgPT09ICcwJyA/ICcxJyA6IHBhcnRpYWwpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUocGFkZGVkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eKDBbMS05XSl8KCgxfDIpWzAtOV0pfCgzWzAtMV0pJC87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFkKHRoaXMuZGF0ZS5nZXREYXRlKCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgRGF0ZU9yZGluYWwgZXh0ZW5kcyBEYXRlTnVtZXJhbCB7XHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL14oWzEtOV18KCgxfDIpWzAtOV0pfCgzWzAtMV0pKSgoc3QpfChuZCl8KHJkKXwodGgpKT8kL2k7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgbGV0IGRhdGUgPSB0aGlzLmRhdGUuZ2V0RGF0ZSgpO1xyXG4gICAgICAgICAgICBsZXQgaiA9IGRhdGUgJSAxMDtcclxuICAgICAgICAgICAgbGV0IGsgPSBkYXRlICUgMTAwO1xyXG4gICAgICAgICAgICBpZiAoaiA9PT0gMSAmJiBrICE9PSAxMSkgcmV0dXJuIGRhdGUgKyBcInN0XCI7XHJcbiAgICAgICAgICAgIGlmIChqID09PSAyICYmIGsgIT09IDEyKSByZXR1cm4gZGF0ZSArIFwibmRcIjtcclxuICAgICAgICAgICAgaWYgKGogPT09IDMgJiYgayAhPT0gMTMpIHJldHVybiBkYXRlICsgXCJyZFwiO1xyXG4gICAgICAgICAgICByZXR1cm4gZGF0ZSArIFwidGhcIjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIExvbmdEYXlOYW1lIGV4dGVuZHMgRGF0ZVBhcnQge1xyXG4gICAgICAgIHByb3RlY3RlZCBnZXREYXlzKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3VwZXIuZ2V0RGF5cygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgaW5jcmVtZW50KCkge1xyXG4gICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldERheSgpICsgMTtcclxuICAgICAgICAgICAgaWYgKG51bSA+IDYpIG51bSA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXREYXRlKHRoaXMuZGF0ZS5nZXREYXRlKCkgLSB0aGlzLmRhdGUuZ2V0RGF5KCkgKyBudW0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZGVjcmVtZW50KCkge1xyXG4gICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldERheSgpIC0gMTtcclxuICAgICAgICAgICAgaWYgKG51bSA8IDApIG51bSA9IDY7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXREYXRlKHRoaXMuZGF0ZS5nZXREYXRlKCkgLSB0aGlzLmRhdGUuZ2V0RGF5KCkgKyBudW0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICBsZXQgZGF5ID0gdGhpcy5nZXREYXlzKCkuZmlsdGVyKChkYXkpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUmVnRXhwKGBeJHtwYXJ0aWFsfS4qJGAsICdpJykudGVzdChkYXkpO1xyXG4gICAgICAgICAgICB9KVswXTtcclxuICAgICAgICAgICAgaWYgKGRheSAhPT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZShkYXkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmdldERheXMoKS5pbmRleE9mKHZhbHVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXREYXRlKHRoaXMuZGF0ZS5nZXREYXRlKCkgLSB0aGlzLmRhdGUuZ2V0RGF5KCkgKyBudW0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUmVnRXhwKGBeKCgke3RoaXMuZ2V0RGF5cygpLmpvaW4oXCIpfChcIil9KSkkYCwgJ2knKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFsyLDEsMiwxLDIsMSwyXVt0aGlzLmRhdGUuZ2V0RGF5KCldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBMZXZlbC5EQVRFO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldERheXMoKVt0aGlzLmRhdGUuZ2V0RGF5KCldO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgU2hvcnREYXlOYW1lIGV4dGVuZHMgTG9uZ0RheU5hbWUge1xyXG4gICAgICAgIHByb3RlY3RlZCBnZXREYXlzKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3VwZXIuZ2V0U2hvcnREYXlzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBQYWRkZWRNaWxpdGFyeUhvdXIgZXh0ZW5kcyBEYXRlUGFydCB7XHJcbiAgICAgICAgcHVibGljIGluY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRIb3VycygpICsgMTtcclxuICAgICAgICAgICAgaWYgKG51bSA+IDIzKSBudW0gPSAwO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnMobnVtKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGRlY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRIb3VycygpIC0gMTtcclxuICAgICAgICAgICAgaWYgKG51bSA8IDApIG51bSA9IDIzO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnMobnVtKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKC9eXFxkezEsMn0kLy50ZXN0KHBhcnRpYWwpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGFkZGVkID0gdGhpcy5wYWQocGFydGlhbCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZShwYWRkZWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3VycyhwYXJzZUludCh2YWx1ZSwgMTApKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXRIb3VycygpID4gMiA/IDEgOiAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBMZXZlbC5IT1VSO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXigoKDB8MSlbMC05XSl8KDJbMC0zXSkpJC87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFkKHRoaXMuZGF0ZS5nZXRIb3VycygpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIE1pbGl0YXJ5SG91ciBleHRlbmRzIFBhZGRlZE1pbGl0YXJ5SG91ciB7XHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKC9eXFxkezEsMn0kLy50ZXN0KHBhcnRpYWwpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdHJpbW1lZCA9IHRoaXMudHJpbShwYXJ0aWFsKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHRyaW1tZWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL14oKDE/WzAtOV0pfCgyWzAtM10pKSQvO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0SG91cnMoKS50b1N0cmluZygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgUGFkZGVkSG91ciBleHRlbmRzIFBhZGRlZE1pbGl0YXJ5SG91ciB7XHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgbGV0IHBhZGRlZCA9IHRoaXMucGFkKHBhcnRpYWwgPT09ICcwJyA/ICcxJyA6IHBhcnRpYWwpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZShwYWRkZWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKHZhbHVlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHRoaXMuZ2V0UmVnRXgoKS50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IG51bSA9IHBhcnNlSW50KHZhbHVlLCAxMCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kYXRlLmdldEhvdXJzKCkgPCAxMiAmJiBudW0gPT09IDEyKSBudW0gPSAwO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZGF0ZS5nZXRIb3VycygpID4gMTEgJiYgbnVtICE9PSAxMikgbnVtICs9IDEyO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldEhvdXJzKG51bSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eKDBbMS05XSl8KDFbMC0yXSkkLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlSW50KHRoaXMudG9TdHJpbmcoKSwgMTApID4gMSA/IDEgOiAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhZCh0aGlzLmdldEhvdXJzKHRoaXMuZGF0ZSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgSG91ciBleHRlbmRzIFBhZGRlZEhvdXIge1xyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGxldCB0cmltbWVkID0gdGhpcy50cmltKHBhcnRpYWwgPT09ICcwJyA/ICcxJyA6IHBhcnRpYWwpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0cmltbWVkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL15bMS05XXwoMVswLTJdKSQvO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRyaW0oc3VwZXIudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBQYWRkZWRNaW51dGUgZXh0ZW5kcyBEYXRlUGFydCB7XHJcbiAgICAgICAgcHVibGljIGluY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRNaW51dGVzKCkgKyAxO1xyXG4gICAgICAgICAgICBpZiAobnVtID4gNTkpIG51bSA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRNaW51dGVzKG51bSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBkZWNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0TWludXRlcygpIC0gMTtcclxuICAgICAgICAgICAgaWYgKG51bSA8IDApIG51bSA9IDU5O1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0TWludXRlcyhudW0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0aGlzLnBhZChwYXJ0aWFsKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0TWludXRlcyhwYXJzZUludCh2YWx1ZSwgMTApKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL15bMC01XVswLTldJC87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0TWludXRlcygpID4gNSA/IDEgOiAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBMZXZlbC5NSU5VVEU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFkKHRoaXMuZGF0ZS5nZXRNaW51dGVzKCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgTWludXRlIGV4dGVuZHMgUGFkZGVkTWludXRlIHtcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0aGlzLnRyaW0ocGFydGlhbCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXlswLTVdP1swLTldJC87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXRNaW51dGVzKCkudG9TdHJpbmcoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIFBhZGRlZFNlY29uZCBleHRlbmRzIERhdGVQYXJ0IHtcclxuICAgICAgICBwdWJsaWMgaW5jcmVtZW50KCkge1xyXG4gICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldFNlY29uZHMoKSArIDE7XHJcbiAgICAgICAgICAgIGlmIChudW0gPiA1OSkgbnVtID0gMDtcclxuICAgICAgICAgICAgdGhpcy5kYXRlLnNldFNlY29uZHMobnVtKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGRlY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRTZWNvbmRzKCkgLSAxO1xyXG4gICAgICAgICAgICBpZiAobnVtIDwgMCkgbnVtID0gNTk7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRTZWNvbmRzKG51bSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHRoaXMucGFkKHBhcnRpYWwpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRTZWNvbmRzKHBhcnNlSW50KHZhbHVlLCAxMCkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXlswLTVdWzAtOV0kLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXRTZWNvbmRzKCkgPiA1ID8gMSA6IDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIExldmVsLlNFQ09ORDtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYWQodGhpcy5kYXRlLmdldFNlY29uZHMoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBTZWNvbmQgZXh0ZW5kcyBQYWRkZWRTZWNvbmQge1xyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHRoaXMudHJpbShwYXJ0aWFsKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eWzAtNV0/WzAtOV0kLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldFNlY29uZHMoKS50b1N0cmluZygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgVXBwZXJjYXNlTWVyaWRpZW0gZXh0ZW5kcyBEYXRlUGFydCB7XHJcbiAgICAgICAgcHVibGljIGluY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRIb3VycygpICsgMTI7XHJcbiAgICAgICAgICAgIGlmIChudW0gPiAyMykgbnVtIC09IDI0O1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnMobnVtKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGRlY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRIb3VycygpIC0gMTI7XHJcbiAgICAgICAgICAgIGlmIChudW0gPCAwKSBudW0gKz0gMjQ7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3VycyhudW0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAoL14oKEFNPyl8KFBNPykpJC9pLnRlc3QocGFydGlhbCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHBhcnRpYWxbMF0gPT09ICdBJyA/ICdBTScgOiAnUE0nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUudG9Mb3dlckNhc2UoKSA9PT0gJ2FtJyAmJiB0aGlzLmRhdGUuZ2V0SG91cnMoKSA+IDExKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldEhvdXJzKHRoaXMuZGF0ZS5nZXRIb3VycygpIC0gMTIpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZS50b0xvd2VyQ2FzZSgpID09PSAncG0nICYmIHRoaXMuZGF0ZS5nZXRIb3VycygpIDwgMTIpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnModGhpcy5kYXRlLmdldEhvdXJzKCkgKyAxMik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIExldmVsLkhPVVI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXigoYW0pfChwbSkpJC9pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE1lcmlkaWVtKHRoaXMuZGF0ZSkudG9VcHBlckNhc2UoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIExvd2VyY2FzZU1lcmlkaWVtIGV4dGVuZHMgVXBwZXJjYXNlTWVyaWRpZW0ge1xyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0TWVyaWRpZW0odGhpcy5kYXRlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxldCBmb3JtYXRCbG9ja3M6eyBba2V5OnN0cmluZ106IG5ldyAoKSA9PiBJRGF0ZVBhcnQ7IH0gPSB7fTtcclxuICAgIFxyXG4gICAgZm9ybWF0QmxvY2tzWydZWVlZJ10gPSBGb3VyRGlnaXRZZWFyO1xyXG4gICAgZm9ybWF0QmxvY2tzWydZWSddID0gVHdvRGlnaXRZZWFyO1xyXG4gICAgZm9ybWF0QmxvY2tzWydNTU1NJ10gPSBMb25nTW9udGhOYW1lO1xyXG4gICAgZm9ybWF0QmxvY2tzWydNTU0nXSA9IFNob3J0TW9udGhOYW1lO1xyXG4gICAgZm9ybWF0QmxvY2tzWydNTSddID0gUGFkZGVkTW9udGg7XHJcbiAgICBmb3JtYXRCbG9ja3NbJ00nXSA9IE1vbnRoO1xyXG4gICAgZm9ybWF0QmxvY2tzWydERCddID0gUGFkZGVkRGF0ZTtcclxuICAgIGZvcm1hdEJsb2Nrc1snRG8nXSA9IERhdGVPcmRpbmFsO1xyXG4gICAgZm9ybWF0QmxvY2tzWydEJ10gPSBEYXRlTnVtZXJhbDtcclxuICAgIGZvcm1hdEJsb2Nrc1snZGRkZCddID0gTG9uZ0RheU5hbWU7XHJcbiAgICBmb3JtYXRCbG9ja3NbJ2RkZCddID0gU2hvcnREYXlOYW1lO1xyXG4gICAgZm9ybWF0QmxvY2tzWydISCddID0gUGFkZGVkTWlsaXRhcnlIb3VyO1xyXG4gICAgZm9ybWF0QmxvY2tzWydoaCddID0gUGFkZGVkSG91cjtcclxuICAgIGZvcm1hdEJsb2Nrc1snSCddID0gTWlsaXRhcnlIb3VyO1xyXG4gICAgZm9ybWF0QmxvY2tzWydoJ10gPSBIb3VyO1xyXG4gICAgZm9ybWF0QmxvY2tzWydBJ10gPSBVcHBlcmNhc2VNZXJpZGllbTtcclxuICAgIGZvcm1hdEJsb2Nrc1snYSddID0gTG93ZXJjYXNlTWVyaWRpZW07XHJcbiAgICBmb3JtYXRCbG9ja3NbJ21tJ10gPSBQYWRkZWRNaW51dGU7XHJcbiAgICBmb3JtYXRCbG9ja3NbJ20nXSA9IE1pbnV0ZTtcclxuICAgIGZvcm1hdEJsb2Nrc1snc3MnXSA9IFBhZGRlZFNlY29uZDtcclxuICAgIGZvcm1hdEJsb2Nrc1sncyddID0gU2Vjb25kO1xyXG4gICAgXHJcbiAgICByZXR1cm4gZm9ybWF0QmxvY2tzO1xyXG59KSgpO1xyXG5cclxuXHJcbiIsImNsYXNzIElucHV0IHtcclxuICAgIHByaXZhdGUgb3B0aW9uczogSU9wdGlvbnM7XHJcbiAgICBwcml2YXRlIHNlbGVjdGVkRGF0ZVBhcnQ6IElEYXRlUGFydDtcclxuICAgIHByaXZhdGUgdGV4dEJ1ZmZlcjogc3RyaW5nID0gXCJcIjtcclxuICAgIHB1YmxpYyBkYXRlUGFydHM6IElEYXRlUGFydFtdO1xyXG4gICAgcHVibGljIGZvcm1hdDogUmVnRXhwO1xyXG4gICAgY29uc3RydWN0b3IocHVibGljIGVsZW1lbnQ6IEhUTUxJbnB1dEVsZW1lbnQpIHtcclxuICAgICAgICBuZXcgS2V5Ym9hcmRFdmVudEhhbmRsZXIodGhpcyk7XHJcbiAgICAgICAgbmV3IE1vdXNlRXZlbnRIYW5kbGVyKHRoaXMpO1xyXG4gICAgICAgIG5ldyBQYXN0ZUV2ZW50SGFuZGVyKHRoaXMpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi52aWV3Y2hhbmdlZChlbGVtZW50LCAoZSkgPT4gdGhpcy52aWV3Y2hhbmdlZChlLmRhdGUsIGUubGV2ZWwsIGUudXBkYXRlKSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRMZXZlbHMoKTpMZXZlbFtdIHtcclxuICAgICAgICBsZXQgbGV2ZWxzOkxldmVsW10gPSBbXTtcclxuICAgICAgICB0aGlzLmRhdGVQYXJ0cy5mb3JFYWNoKChkYXRlUGFydCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAobGV2ZWxzLmluZGV4T2YoZGF0ZVBhcnQuZ2V0TGV2ZWwoKSkgPT09IC0xICYmIGRhdGVQYXJ0LmlzU2VsZWN0YWJsZSgpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXZlbHMucHVzaChkYXRlUGFydC5nZXRMZXZlbCgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBsZXZlbHM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRUZXh0QnVmZmVyKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRleHRCdWZmZXI7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBzZXRUZXh0QnVmZmVyKG5ld0J1ZmZlcjpzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLnRleHRCdWZmZXIgPSBuZXdCdWZmZXI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMudGV4dEJ1ZmZlci5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRGF0ZUZyb21CdWZmZXIoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB1cGRhdGVEYXRlRnJvbUJ1ZmZlcigpIHtcclxuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZERhdGVQYXJ0LnNldFZhbHVlRnJvbVBhcnRpYWwodGhpcy50ZXh0QnVmZmVyKSkge1xyXG4gICAgICAgICAgICBsZXQgbmV3RGF0ZSA9IHRoaXMuc2VsZWN0ZWREYXRlUGFydC5nZXRWYWx1ZSgpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKHRoaXMudGV4dEJ1ZmZlci5sZW5ndGggPj0gdGhpcy5zZWxlY3RlZERhdGVQYXJ0LmdldE1heEJ1ZmZlcigpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRleHRCdWZmZXIgPSAnJztcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWREYXRlUGFydCA9IHRoaXMuZ2V0TmV4dFNlbGVjdGFibGVEYXRlUGFydCgpOyAgICBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdHJpZ2dlci5nb3RvKHRoaXMuZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgZGF0ZTogbmV3RGF0ZSxcclxuICAgICAgICAgICAgICAgIGxldmVsOiB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQuZ2V0TGV2ZWwoKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnRleHRCdWZmZXIgPSB0aGlzLnRleHRCdWZmZXIuc2xpY2UoMCwgLTEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldEZpcnN0U2VsZWN0YWJsZURhdGVQYXJ0KCkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5kYXRlUGFydHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZGF0ZVBhcnRzW2ldLmlzU2VsZWN0YWJsZSgpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZVBhcnRzW2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdm9pZCAwO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRMYXN0U2VsZWN0YWJsZURhdGVQYXJ0KCkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSB0aGlzLmRhdGVQYXJ0cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kYXRlUGFydHNbaV0uaXNTZWxlY3RhYmxlKCkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlUGFydHNbaV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2b2lkIDA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXROZXh0U2VsZWN0YWJsZURhdGVQYXJ0KCkge1xyXG4gICAgICAgIGxldCBpID0gdGhpcy5kYXRlUGFydHMuaW5kZXhPZih0aGlzLnNlbGVjdGVkRGF0ZVBhcnQpO1xyXG4gICAgICAgIHdoaWxlICgrK2kgPCB0aGlzLmRhdGVQYXJ0cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZGF0ZVBhcnRzW2ldLmlzU2VsZWN0YWJsZSgpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZVBhcnRzW2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZERhdGVQYXJ0O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0UHJldmlvdXNTZWxlY3RhYmxlRGF0ZVBhcnQoKSB7XHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLmRhdGVQYXJ0cy5pbmRleE9mKHRoaXMuc2VsZWN0ZWREYXRlUGFydCk7XHJcbiAgICAgICAgd2hpbGUgKC0taSA+PSAwKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGVQYXJ0c1tpXS5pc1NlbGVjdGFibGUoKSlcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGVQYXJ0c1tpXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWREYXRlUGFydDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldE5lYXJlc3RTZWxlY3RhYmxlRGF0ZVBhcnQoY2FyZXRQb3NpdGlvbjogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IGRpc3RhbmNlOm51bWJlciA9IE51bWJlci5NQVhfVkFMVUU7XHJcbiAgICAgICAgbGV0IG5lYXJlc3REYXRlUGFydDpJRGF0ZVBhcnQ7XHJcbiAgICAgICAgbGV0IHN0YXJ0ID0gMDtcclxuICAgICAgICBcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZGF0ZVBhcnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRlUGFydCA9IHRoaXMuZGF0ZVBhcnRzW2ldO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKGRhdGVQYXJ0LmlzU2VsZWN0YWJsZSgpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZnJvbUxlZnQgPSBjYXJldFBvc2l0aW9uIC0gc3RhcnQ7XHJcbiAgICAgICAgICAgICAgICBsZXQgZnJvbVJpZ2h0ID0gY2FyZXRQb3NpdGlvbiAtIChzdGFydCArIGRhdGVQYXJ0LnRvU3RyaW5nKCkubGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgaWYgKGZyb21MZWZ0ID4gMCAmJiBmcm9tUmlnaHQgPCAwKSByZXR1cm4gZGF0ZVBhcnQ7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGxldCBkID0gTWF0aC5taW4oTWF0aC5hYnMoZnJvbUxlZnQpLCBNYXRoLmFicyhmcm9tUmlnaHQpKTtcclxuICAgICAgICAgICAgICAgIGlmIChkIDw9IGRpc3RhbmNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmVhcmVzdERhdGVQYXJ0ID0gZGF0ZVBhcnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2UgPSBkO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBzdGFydCArPSBkYXRlUGFydC50b1N0cmluZygpLmxlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIG5lYXJlc3REYXRlUGFydDsgICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgc2V0U2VsZWN0ZWREYXRlUGFydChkYXRlUGFydDpJRGF0ZVBhcnQpIHtcclxuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZERhdGVQYXJ0ICE9PSBkYXRlUGFydCkge1xyXG4gICAgICAgICAgICB0aGlzLnRleHRCdWZmZXIgPSAnJztcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZERhdGVQYXJ0ID0gZGF0ZVBhcnQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0U2VsZWN0ZWREYXRlUGFydCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZERhdGVQYXJ0O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdXBkYXRlT3B0aW9ucyhvcHRpb25zOklPcHRpb25zKSB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmRhdGVQYXJ0cyA9IFBhcnNlci5wYXJzZShvcHRpb25zLmRpc3BsYXlBcyk7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZERhdGVQYXJ0ID0gdm9pZCAwO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBmb3JtYXQ6c3RyaW5nID0gJ14nO1xyXG4gICAgICAgIHRoaXMuZGF0ZVBhcnRzLmZvckVhY2goKGRhdGVQYXJ0KSA9PiB7XHJcbiAgICAgICAgICAgIGZvcm1hdCArPSBgKCR7ZGF0ZVBhcnQuZ2V0UmVnRXgoKS5zb3VyY2Uuc2xpY2UoMSwtMSl9KWA7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5mb3JtYXQgPSBuZXcgUmVnRXhwKGZvcm1hdCsnJCcsICdpJyk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHVwZGF0ZVZpZXcoKSB7XHJcbiAgICAgICAgbGV0IGRhdGVTdHJpbmcgPSAnJztcclxuICAgICAgICB0aGlzLmRhdGVQYXJ0cy5mb3JFYWNoKChkYXRlUGFydCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZGF0ZVBhcnQuZ2V0VmFsdWUoKSA9PT0gdm9pZCAwKSByZXR1cm47XHJcbiAgICAgICAgICAgIGRhdGVTdHJpbmcgKz0gZGF0ZVBhcnQudG9TdHJpbmcoKTsgXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnZhbHVlID0gZGF0ZVN0cmluZztcclxuICAgICAgICBcclxuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZERhdGVQYXJ0ID09PSB2b2lkIDApIHJldHVybjtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgc3RhcnQgPSAwO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBpID0gMDtcclxuICAgICAgICB3aGlsZSAodGhpcy5kYXRlUGFydHNbaV0gIT09IHRoaXMuc2VsZWN0ZWREYXRlUGFydCkge1xyXG4gICAgICAgICAgICBzdGFydCArPSB0aGlzLmRhdGVQYXJ0c1tpKytdLnRvU3RyaW5nKCkubGVuZ3RoO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBsZXQgZW5kID0gc3RhcnQgKyB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQudG9TdHJpbmcoKS5sZW5ndGg7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnNldFNlbGVjdGlvblJhbmdlKHN0YXJ0LCBlbmQpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdmlld2NoYW5nZWQoZGF0ZTpEYXRlLCBsZXZlbDpMZXZlbCwgdXBkYXRlPzpib29sZWFuKSB7ICAgICAgICBcclxuICAgICAgICB0aGlzLmRhdGVQYXJ0cy5mb3JFYWNoKChkYXRlUGFydCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodXBkYXRlKSBkYXRlUGFydC5zZXRWYWx1ZShkYXRlKTtcclxuICAgICAgICAgICAgaWYgKGRhdGVQYXJ0LmdldExldmVsKCkgPT09IGxldmVsICYmXHJcbiAgICAgICAgICAgICAgICB0aGlzLmdldFNlbGVjdGVkRGF0ZVBhcnQoKSAhPT0gdm9pZCAwICYmXHJcbiAgICAgICAgICAgICAgICBsZXZlbCAhPT0gdGhpcy5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0TGV2ZWwoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTZWxlY3RlZERhdGVQYXJ0KGRhdGVQYXJ0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdHJpZ2dlclZpZXdDaGFuZ2UoKSB7XHJcbiAgICAgICAgdHJpZ2dlci52aWV3Y2hhbmdlZCh0aGlzLmVsZW1lbnQsIHtcclxuICAgICAgICAgICAgZGF0ZTogdGhpcy5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0VmFsdWUoKSxcclxuICAgICAgICAgICAgbGV2ZWw6IHRoaXMuZ2V0U2VsZWN0ZWREYXRlUGFydCgpLmdldExldmVsKClcclxuICAgICAgICB9KTsgICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbn0iLCJjb25zdCBlbnVtIEtFWSB7XHJcbiAgICBSSUdIVCA9IDM5LCBMRUZUID0gMzcsIFRBQiA9IDksIFVQID0gMzgsXHJcbiAgICBET1dOID0gNDAsIFYgPSA4NiwgQyA9IDY3LCBBID0gNjUsIEhPTUUgPSAzNixcclxuICAgIEVORCA9IDM1LCBCQUNLU1BBQ0UgPSA4XHJcbn1cclxuXHJcbmNsYXNzIEtleWJvYXJkRXZlbnRIYW5kbGVyIHtcclxuICAgIHByaXZhdGUgc2hpZnRUYWJEb3duID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIHRhYkRvd24gPSBmYWxzZTtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBpbnB1dDpJbnB1dCkge1xyXG4gICAgICAgIGlucHV0LmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgKGUpID0+IHRoaXMua2V5ZG93bihlKSk7XHJcbiAgICAgICAgaW5wdXQuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiZm9jdXNcIiwgKCkgPT4gdGhpcy5mb2N1cygpKTtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoZSkgPT4gdGhpcy5kb2N1bWVudEtleWRvd24oZSkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZm9jdXMgPSAoKTp2b2lkID0+IHtcclxuICAgICAgICBpZiAodGhpcy50YWJEb3duKSB7XHJcbiAgICAgICAgICAgIGxldCBmaXJzdCA9IHRoaXMuaW5wdXQuZ2V0Rmlyc3RTZWxlY3RhYmxlRGF0ZVBhcnQoKTtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC5zZXRTZWxlY3RlZERhdGVQYXJ0KGZpcnN0KTtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgIHRoaXMuaW5wdXQudHJpZ2dlclZpZXdDaGFuZ2UoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnNoaWZ0VGFiRG93bikge1xyXG4gICAgICAgICAgICBsZXQgbGFzdCA9IHRoaXMuaW5wdXQuZ2V0TGFzdFNlbGVjdGFibGVEYXRlUGFydCgpO1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQobGFzdCk7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICB0aGlzLmlucHV0LnRyaWdnZXJWaWV3Q2hhbmdlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBkb2N1bWVudEtleWRvd24oZTpLZXlib2FyZEV2ZW50KSB7XHJcbiAgICAgICAgaWYgKGUuc2hpZnRLZXkgJiYgZS5rZXlDb2RlID09PSBLRVkuVEFCKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hpZnRUYWJEb3duID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2UgaWYgKGUua2V5Q29kZSA9PT0gS0VZLlRBQikge1xyXG4gICAgICAgICAgICB0aGlzLnRhYkRvd24gPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zaGlmdFRhYkRvd24gPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy50YWJEb3duID0gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUga2V5ZG93bihlOktleWJvYXJkRXZlbnQpIHtcclxuICAgICAgICBsZXQgY29kZSA9IGUua2V5Q29kZTtcclxuICAgICAgICBpZiAoY29kZSA+PSA5NiAmJiBjb2RlIDw9IDEwNSkge1xyXG4gICAgICAgICAgICBjb2RlIC09IDQ4O1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICBpZiAoKGNvZGUgPT09IEtFWS5IT01FIHx8IGNvZGUgPT09IEtFWS5FTkQpICYmIGUuc2hpZnRLZXkpIHJldHVybjtcclxuICAgICAgICBpZiAoKGNvZGUgPT09IEtFWS5MRUZUIHx8IGNvZGUgPT09IEtFWS5SSUdIVCkgJiYgZS5zaGlmdEtleSkgcmV0dXJuO1xyXG4gICAgICAgIGlmICgoY29kZSA9PT0gS0VZLkMgfHwgY29kZSA9PT0gS0VZLkEgfHwgY29kZSA9PT0gS0VZLlYpICYmIGUuY3RybEtleSkgcmV0dXJuO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBwcmV2ZW50RGVmYXVsdCA9IHRydWU7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKGNvZGUgPT09IEtFWS5IT01FKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaG9tZSgpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gS0VZLkVORCkge1xyXG4gICAgICAgICAgICB0aGlzLmVuZCgpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gS0VZLkxFRlQpIHtcclxuICAgICAgICAgICAgdGhpcy5sZWZ0KCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb2RlID09PSBLRVkuUklHSFQpIHtcclxuICAgICAgICAgICAgdGhpcy5yaWdodCgpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gS0VZLlRBQiAmJiBlLnNoaWZ0S2V5KSB7XHJcbiAgICAgICAgICAgIHByZXZlbnREZWZhdWx0ID0gdGhpcy5zaGlmdFRhYigpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gS0VZLlRBQikge1xyXG4gICAgICAgICAgICBwcmV2ZW50RGVmYXVsdCA9IHRoaXMudGFiKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb2RlID09PSBLRVkuVVApIHtcclxuICAgICAgICAgICAgdGhpcy51cCgpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gS0VZLkRPV04pIHtcclxuICAgICAgICAgICAgdGhpcy5kb3duKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChwcmV2ZW50RGVmYXVsdCkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBrZXlQcmVzc2VkID0gU3RyaW5nLmZyb21DaGFyQ29kZShjb2RlKTtcclxuICAgICAgICBpZiAoL15bMC05XXxbQS16XSQvLnRlc3Qoa2V5UHJlc3NlZCkpIHtcclxuICAgICAgICAgICAgbGV0IHRleHRCdWZmZXIgPSB0aGlzLmlucHV0LmdldFRleHRCdWZmZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC5zZXRUZXh0QnVmZmVyKHRleHRCdWZmZXIgKyBrZXlQcmVzc2VkKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IEtFWS5CQUNLU1BBQ0UpIHtcclxuICAgICAgICAgICAgbGV0IHRleHRCdWZmZXIgPSB0aGlzLmlucHV0LmdldFRleHRCdWZmZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC5zZXRUZXh0QnVmZmVyKHRleHRCdWZmZXIuc2xpY2UoMCwgLTEpKTtcclxuICAgICAgICB9IGVsc2UgaWYgKCFlLnNoaWZ0S2V5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXQuc2V0VGV4dEJ1ZmZlcignJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGhvbWUoKSB7XHJcbiAgICAgICAgbGV0IGZpcnN0ID0gdGhpcy5pbnB1dC5nZXRGaXJzdFNlbGVjdGFibGVEYXRlUGFydCgpO1xyXG4gICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChmaXJzdCk7XHJcbiAgICAgICAgdGhpcy5pbnB1dC50cmlnZ2VyVmlld0NoYW5nZSgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGVuZCgpIHtcclxuICAgICAgICBsZXQgbGFzdCA9IHRoaXMuaW5wdXQuZ2V0TGFzdFNlbGVjdGFibGVEYXRlUGFydCgpO1xyXG4gICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChsYXN0KTsgICAgIFxyXG4gICAgICAgIHRoaXMuaW5wdXQudHJpZ2dlclZpZXdDaGFuZ2UoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBsZWZ0KCkge1xyXG4gICAgICAgIGxldCBwcmV2aW91cyA9IHRoaXMuaW5wdXQuZ2V0UHJldmlvdXNTZWxlY3RhYmxlRGF0ZVBhcnQoKTtcclxuICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQocHJldmlvdXMpO1xyXG4gICAgICAgIHRoaXMuaW5wdXQudHJpZ2dlclZpZXdDaGFuZ2UoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSByaWdodCgpIHtcclxuICAgICAgICBsZXQgbmV4dCA9IHRoaXMuaW5wdXQuZ2V0TmV4dFNlbGVjdGFibGVEYXRlUGFydCgpO1xyXG4gICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChuZXh0KTtcclxuICAgICAgICB0aGlzLmlucHV0LnRyaWdnZXJWaWV3Q2hhbmdlKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgc2hpZnRUYWIoKSB7XHJcbiAgICAgICAgbGV0IHByZXZpb3VzID0gdGhpcy5pbnB1dC5nZXRQcmV2aW91c1NlbGVjdGFibGVEYXRlUGFydCgpO1xyXG4gICAgICAgIGlmIChwcmV2aW91cyAhPT0gdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkpIHtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC5zZXRTZWxlY3RlZERhdGVQYXJ0KHByZXZpb3VzKTtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC50cmlnZ2VyVmlld0NoYW5nZSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHRhYigpIHtcclxuICAgICAgICBsZXQgbmV4dCA9IHRoaXMuaW5wdXQuZ2V0TmV4dFNlbGVjdGFibGVEYXRlUGFydCgpO1xyXG4gICAgICAgIGlmIChuZXh0ICE9PSB0aGlzLmlucHV0LmdldFNlbGVjdGVkRGF0ZVBhcnQoKSkge1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQobmV4dCk7XHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXQudHJpZ2dlclZpZXdDaGFuZ2UoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSB1cCgpIHtcclxuICAgICAgICB0aGlzLmlucHV0LmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5pbmNyZW1lbnQoKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgbGV2ZWwgPSB0aGlzLmlucHV0LmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5nZXRMZXZlbCgpO1xyXG4gICAgICAgIGxldCBkYXRlID0gdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0VmFsdWUoKTtcclxuICAgICAgICBcclxuICAgICAgICB0cmlnZ2VyLmdvdG8odGhpcy5pbnB1dC5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgIGRhdGU6IGRhdGUsXHJcbiAgICAgICAgICAgIGxldmVsOiBsZXZlbFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGRvd24oKSB7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZGVjcmVtZW50KCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGxldmVsID0gdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0TGV2ZWwoKTtcclxuICAgICAgICBsZXQgZGF0ZSA9IHRoaXMuaW5wdXQuZ2V0U2VsZWN0ZWREYXRlUGFydCgpLmdldFZhbHVlKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdHJpZ2dlci5nb3RvKHRoaXMuaW5wdXQuZWxlbWVudCwge1xyXG4gICAgICAgICAgICBkYXRlOiBkYXRlLFxyXG4gICAgICAgICAgICBsZXZlbDogbGV2ZWxcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsImNsYXNzIE1vdXNlRXZlbnRIYW5kbGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgaW5wdXQ6SW5wdXQpIHtcclxuICAgICAgICBsaXN0ZW4ubW91c2Vkb3duKGlucHV0LmVsZW1lbnQsICgpID0+IHRoaXMubW91c2Vkb3duKCkpO1xyXG4gICAgICAgIGxpc3Rlbi5tb3VzZXVwKGRvY3VtZW50LCAoKSA9PiB0aGlzLm1vdXNldXAoKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gU3RvcCBkZWZhdWx0XHJcbiAgICAgICAgaW5wdXQuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ2VudGVyXCIsIChlKSA9PiBlLnByZXZlbnREZWZhdWx0KCkpO1xyXG4gICAgICAgIGlucHV0LmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdvdmVyXCIsIChlKSA9PiBlLnByZXZlbnREZWZhdWx0KCkpO1xyXG4gICAgICAgIGlucHV0LmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImRyb3BcIiwgKGUpID0+IGUucHJldmVudERlZmF1bHQoKSk7XHJcbiAgICAgICAgaW5wdXQuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY3V0XCIsIChlKSA9PiBlLnByZXZlbnREZWZhdWx0KCkpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGRvd246Ym9vbGVhbjtcclxuICAgIHByaXZhdGUgY2FyZXRTdGFydDpudW1iZXI7XHJcbiAgICBcclxuICAgIHByaXZhdGUgbW91c2Vkb3duKCkge1xyXG4gICAgICAgIHRoaXMuZG93biA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5lbGVtZW50LnNldFNlbGVjdGlvblJhbmdlKHZvaWQgMCwgdm9pZCAwKTtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICB0aGlzLmNhcmV0U3RhcnQgPSB0aGlzLmlucHV0LmVsZW1lbnQuc2VsZWN0aW9uU3RhcnQ7IFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIG1vdXNldXAgPSAoKSA9PiB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmRvd24pIHJldHVybjtcclxuICAgICAgICB0aGlzLmRvd24gPSBmYWxzZTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgcG9zOm51bWJlcjtcclxuICAgICAgICBcclxuICAgICAgICBpZiAodGhpcy5pbnB1dC5lbGVtZW50LnNlbGVjdGlvblN0YXJ0ID09PSB0aGlzLmNhcmV0U3RhcnQpIHtcclxuICAgICAgICAgICAgcG9zID0gdGhpcy5pbnB1dC5lbGVtZW50LnNlbGVjdGlvbkVuZDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwb3MgPSB0aGlzLmlucHV0LmVsZW1lbnQuc2VsZWN0aW9uU3RhcnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBibG9jayA9IHRoaXMuaW5wdXQuZ2V0TmVhcmVzdFNlbGVjdGFibGVEYXRlUGFydChwb3MpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChibG9jayk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMuaW5wdXQuZWxlbWVudC5zZWxlY3Rpb25TdGFydCA+IDAgfHwgdGhpcy5pbnB1dC5lbGVtZW50LnNlbGVjdGlvbkVuZCA8IHRoaXMuaW5wdXQuZWxlbWVudC52YWx1ZS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC50cmlnZ2VyVmlld0NoYW5nZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn0iLCJjbGFzcyBQYXJzZXIge1xyXG4gICAgcHVibGljIHN0YXRpYyBwYXJzZShmb3JtYXQ6c3RyaW5nKTpJRGF0ZVBhcnRbXSB7XHJcbiAgICAgICAgbGV0IHRleHRCdWZmZXIgPSAnJztcclxuICAgICAgICBsZXQgZGF0ZVBhcnRzOklEYXRlUGFydFtdID0gW107XHJcbiAgICBcclxuICAgICAgICBsZXQgaW5kZXggPSAwOyAgICAgICAgICAgICAgICBcclxuICAgICAgICBsZXQgaW5Fc2NhcGVkU2VnbWVudCA9IGZhbHNlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBwdXNoUGxhaW5UZXh0ID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGV4dEJ1ZmZlci5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBkYXRlUGFydHMucHVzaChuZXcgUGxhaW5UZXh0KHRleHRCdWZmZXIpLnNldFNlbGVjdGFibGUoZmFsc2UpKTtcclxuICAgICAgICAgICAgICAgIHRleHRCdWZmZXIgPSAnJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB3aGlsZSAoaW5kZXggPCBmb3JtYXQubGVuZ3RoKSB7ICAgICBcclxuICAgICAgICAgICAgaWYgKCFpbkVzY2FwZWRTZWdtZW50ICYmIGZvcm1hdFtpbmRleF0gPT09ICdbJykge1xyXG4gICAgICAgICAgICAgICAgaW5Fc2NhcGVkU2VnbWVudCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChpbkVzY2FwZWRTZWdtZW50ICYmIGZvcm1hdFtpbmRleF0gPT09ICddJykge1xyXG4gICAgICAgICAgICAgICAgaW5Fc2NhcGVkU2VnbWVudCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaW5kZXgrKztcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoaW5Fc2NhcGVkU2VnbWVudCkge1xyXG4gICAgICAgICAgICAgICAgdGV4dEJ1ZmZlciArPSBmb3JtYXRbaW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgaW5kZXgrKztcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgZm91bmQgPSBmYWxzZTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGZvciAobGV0IGNvZGUgaW4gZm9ybWF0QmxvY2tzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoUGFyc2VyLmZpbmRBdChmb3JtYXQsIGluZGV4LCBgeyR7Y29kZX19YCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBwdXNoUGxhaW5UZXh0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZVBhcnRzLnB1c2gobmV3IGZvcm1hdEJsb2Nrc1tjb2RlXSgpLnNldFNlbGVjdGFibGUoZmFsc2UpKTtcclxuICAgICAgICAgICAgICAgICAgICBpbmRleCArPSBjb2RlLmxlbmd0aCArIDI7XHJcbiAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChQYXJzZXIuZmluZEF0KGZvcm1hdCwgaW5kZXgsIGNvZGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHVzaFBsYWluVGV4dCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGVQYXJ0cy5wdXNoKG5ldyBmb3JtYXRCbG9ja3NbY29kZV0oKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggKz0gY29kZS5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoIWZvdW5kKSB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0QnVmZmVyICs9IGZvcm1hdFtpbmRleF07XHJcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdXNoUGxhaW5UZXh0KCk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICByZXR1cm4gZGF0ZVBhcnRzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHN0YXRpYyBmaW5kQXQgKHN0cjpzdHJpbmcsIGluZGV4Om51bWJlciwgc2VhcmNoOnN0cmluZykge1xyXG4gICAgICAgIHJldHVybiBzdHIuc2xpY2UoaW5kZXgsIGluZGV4ICsgc2VhcmNoLmxlbmd0aCkgPT09IHNlYXJjaDtcclxuICAgIH1cclxufSIsImNsYXNzIFBhc3RlRXZlbnRIYW5kZXIge1xyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBpbnB1dDpJbnB1dCkge1xyXG4gICAgICAgIGxpc3Rlbi5wYXN0ZShpbnB1dC5lbGVtZW50LCAoKSA9PiB0aGlzLnBhc3RlKCkpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHBhc3RlKCkge1xyXG4gICAgICAgIGxldCBvcmlnaW5hbFZhbHVlID0gdGhpcy5pbnB1dC5lbGVtZW50LnZhbHVlO1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgIGlmICghdGhpcy5pbnB1dC5mb3JtYXQudGVzdCh0aGlzLmlucHV0LmVsZW1lbnQudmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgIHRoaXMuaW5wdXQuZWxlbWVudC52YWx1ZSA9IG9yaWdpbmFsVmFsdWU7XHJcbiAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICB9IFxyXG4gICAgICAgICAgIFxyXG4gICAgICAgICAgIGxldCBuZXdEYXRlID0gdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0VmFsdWUoKTtcclxuICAgICAgICAgICBcclxuICAgICAgICAgICBsZXQgc3RyUHJlZml4ID0gJyc7XHJcbiAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmlucHV0LmRhdGVQYXJ0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICBsZXQgZGF0ZVBhcnQgPSB0aGlzLmlucHV0LmRhdGVQYXJ0c1tpXTtcclxuICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgIGxldCByZWdFeHAgPSBuZXcgUmVnRXhwKGRhdGVQYXJ0LmdldFJlZ0V4KCkuc291cmNlLnNsaWNlKDEsIC0xKSwgJ2knKTtcclxuICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgIGxldCB2YWwgPSB0aGlzLmlucHV0LmVsZW1lbnQudmFsdWUucmVwbGFjZShzdHJQcmVmaXgsICcnKS5tYXRjaChyZWdFeHApWzBdO1xyXG4gICAgICAgICAgICAgICBzdHJQcmVmaXggKz0gdmFsO1xyXG4gICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgaWYgKCFkYXRlUGFydC5pc1NlbGVjdGFibGUoKSkgY29udGludWU7XHJcbiAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICBkYXRlUGFydC5zZXRWYWx1ZShuZXdEYXRlKTtcclxuICAgICAgICAgICAgICAgaWYgKGRhdGVQYXJ0LnNldFZhbHVlKHZhbCkpIHtcclxuICAgICAgICAgICAgICAgICAgIG5ld0RhdGUgPSBkYXRlUGFydC5nZXRWYWx1ZSgpO1xyXG4gICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgdGhpcy5pbnB1dC5lbGVtZW50LnZhbHVlID0gb3JpZ2luYWxWYWx1ZTtcclxuICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgIH1cclxuICAgICAgICAgICBcclxuICAgICAgICAgICB0cmlnZ2VyLmdvdG8odGhpcy5pbnB1dC5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgICAgIGRhdGU6IG5ld0RhdGUsXHJcbiAgICAgICAgICAgICAgIGxldmVsOiB0aGlzLmlucHV0LmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5nZXRMZXZlbCgpXHJcbiAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0iLCJjb25zdCBlbnVtIFN0ZXBEaXJlY3Rpb24ge1xyXG4gICAgVVAsIERPV05cclxufVxyXG5cclxuY2xhc3MgSGVhZGVyIGV4dGVuZHMgQ29tbW9uIHtcclxuICAgIHByaXZhdGUgeWVhckxhYmVsOkVsZW1lbnQ7XHJcbiAgICBwcml2YXRlIG1vbnRoTGFiZWw6RWxlbWVudDtcclxuICAgIHByaXZhdGUgZGF0ZUxhYmVsOkVsZW1lbnQ7XHJcbiAgICBwcml2YXRlIGhvdXJMYWJlbDpFbGVtZW50O1xyXG4gICAgcHJpdmF0ZSBtaW51dGVMYWJlbDpFbGVtZW50O1xyXG4gICAgcHJpdmF0ZSBzZWNvbmRMYWJlbDpFbGVtZW50O1xyXG4gICAgXHJcbiAgICBwcml2YXRlIGxhYmVsczpFbGVtZW50W107XHJcbiAgICBcclxuICAgIHByaXZhdGUgb3B0aW9uczpJT3B0aW9ucztcclxuICAgIHByaXZhdGUgbGV2ZWxzOkxldmVsW107XHJcbiAgICBcclxuICAgIHByaXZhdGUgbGV2ZWw6TGV2ZWw7XHJcbiAgICBwcml2YXRlIGRhdGU6RGF0ZTtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBlbGVtZW50OkhUTUxFbGVtZW50LCBwcml2YXRlIGNvbnRhaW5lcjpIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGlzdGVuLnZpZXdjaGFuZ2VkKGVsZW1lbnQsIChlKSA9PiB0aGlzLnZpZXdjaGFuZ2VkKGUuZGF0ZSwgZS5sZXZlbCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMueWVhckxhYmVsID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS15ZWFyJyk7XHJcbiAgICAgICAgdGhpcy5tb250aExhYmVsID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS1tb250aCcpO1xyXG4gICAgICAgIHRoaXMuZGF0ZUxhYmVsID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS1kYXRlJyk7XHJcbiAgICAgICAgdGhpcy5ob3VyTGFiZWwgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcignZGF0aXVtLXNwYW4tbGFiZWwuZGF0aXVtLWhvdXInKTtcclxuICAgICAgICB0aGlzLm1pbnV0ZUxhYmVsID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS1taW51dGUnKTtcclxuICAgICAgICB0aGlzLnNlY29uZExhYmVsID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS1zZWNvbmQnKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmxhYmVscyA9IFt0aGlzLnllYXJMYWJlbCwgdGhpcy5tb250aExhYmVsLCB0aGlzLmRhdGVMYWJlbCwgdGhpcy5ob3VyTGFiZWwsIHRoaXMubWludXRlTGFiZWwsIHRoaXMuc2Vjb25kTGFiZWxdO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBwcmV2aW91c0J1dHRvbiA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdkYXRpdW0tcHJldicpO1xyXG4gICAgICAgIGxldCBuZXh0QnV0dG9uID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1uZXh0Jyk7XHJcbiAgICAgICAgbGV0IHNwYW5MYWJlbENvbnRhaW5lciA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdkYXRpdW0tc3Bhbi1sYWJlbC1jb250YWluZXInKTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4udGFwKHByZXZpb3VzQnV0dG9uLCAoKSA9PiB0aGlzLnByZXZpb3VzKCkpO1xyXG4gICAgICAgIGxpc3Rlbi50YXAobmV4dEJ1dHRvbiwgKCkgPT4gdGhpcy5uZXh0KCkpO1xyXG4gICAgICAgIGxpc3Rlbi50YXAoc3BhbkxhYmVsQ29udGFpbmVyLCAoKSA9PiB0aGlzLnpvb21PdXQoKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGlzdGVuLnN3aXBlTGVmdChjb250YWluZXIsICgpID0+IHtcclxuICAgICAgICAgICB0aGlzLm5leHQoKTsgXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGlzdGVuLnN3aXBlUmlnaHQoY29udGFpbmVyLCAoKSA9PiB7XHJcbiAgICAgICAgICAgdGhpcy5wcmV2aW91cygpOyBcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHByZXZpb3VzKCkge1xyXG4gICAgICAgIHRyaWdnZXIuZ290byh0aGlzLmVsZW1lbnQsIHtcclxuICAgICAgICAgICBkYXRlOiB0aGlzLnN0ZXBEYXRlKFN0ZXBEaXJlY3Rpb24uRE9XTiksXHJcbiAgICAgICAgICAgbGV2ZWw6IHRoaXMubGV2ZWwsXHJcbiAgICAgICAgICAgdXBkYXRlOiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgbmV4dCgpIHtcclxuICAgICAgICB0cmlnZ2VyLmdvdG8odGhpcy5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgZGF0ZTogdGhpcy5zdGVwRGF0ZShTdGVwRGlyZWN0aW9uLlVQKSxcclxuICAgICAgICAgICBsZXZlbDogdGhpcy5sZXZlbCxcclxuICAgICAgICAgICB1cGRhdGU6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgem9vbU91dCgpIHtcclxuICAgICAgICBsZXQgbmV3TGV2ZWwgID0gdGhpcy5sZXZlbHNbdGhpcy5sZXZlbHMuaW5kZXhPZih0aGlzLmxldmVsKSAtIDFdO1xyXG4gICAgICAgIGlmIChuZXdMZXZlbCA9PT0gdm9pZCAwKSByZXR1cm47XHJcbiAgICAgICAgdHJpZ2dlci5nb3RvKHRoaXMuZWxlbWVudCwge1xyXG4gICAgICAgICAgIGRhdGU6IHRoaXMuZGF0ZSxcclxuICAgICAgICAgICBsZXZlbDogbmV3TGV2ZWwsXHJcbiAgICAgICAgICAgdXBkYXRlOiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHN0ZXBEYXRlKHN0ZXBUeXBlOlN0ZXBEaXJlY3Rpb24pOkRhdGUge1xyXG4gICAgICAgIGxldCBkYXRlID0gbmV3IERhdGUodGhpcy5kYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgbGV0IGRpcmVjdGlvbiA9IHN0ZXBUeXBlID09PSBTdGVwRGlyZWN0aW9uLlVQID8gMSA6IC0xO1xyXG4gICAgICAgIHN3aXRjaCAodGhpcy5sZXZlbCkge1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLllFQVI6XHJcbiAgICAgICAgICAgICAgICBkYXRlLnNldEZ1bGxZZWFyKGRhdGUuZ2V0RnVsbFllYXIoKSArIDEwICogZGlyZWN0aW9uKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLk1PTlRIOlxyXG4gICAgICAgICAgICAgICAgZGF0ZS5zZXRGdWxsWWVhcihkYXRlLmdldEZ1bGxZZWFyKCkgKyBkaXJlY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuREFURTpcclxuICAgICAgICAgICAgICAgIGRhdGUuc2V0TW9udGgoZGF0ZS5nZXRNb250aCgpICsgZGlyZWN0aW9uKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLkhPVVI6XHJcbiAgICAgICAgICAgICAgICBkYXRlLnNldERhdGUoZGF0ZS5nZXREYXRlKCkgKyBkaXJlY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuTUlOVVRFOlxyXG4gICAgICAgICAgICAgICAgZGF0ZS5zZXRIb3VycyhkYXRlLmdldEhvdXJzKCkgKyBkaXJlY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuU0VDT05EOlxyXG4gICAgICAgICAgICAgICAgZGF0ZS5zZXRNaW51dGVzKGRhdGUuZ2V0TWludXRlcygpICsgZGlyZWN0aW9uKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGF0ZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSB2aWV3Y2hhbmdlZChkYXRlOkRhdGUsIGxldmVsOkxldmVsKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZGF0ZSAhPT0gdm9pZCAwICYmXHJcbiAgICAgICAgICAgIGRhdGUudmFsdWVPZigpID09PSB0aGlzLmRhdGUudmFsdWVPZigpICYmXHJcbiAgICAgICAgICAgIGxldmVsID09PSB0aGlzLmxldmVsKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5kYXRlID0gZGF0ZTtcclxuICAgICAgICB0aGlzLmxldmVsID0gbGV2ZWw7XHJcbiAgICAgICAgdGhpcy5sYWJlbHMuZm9yRWFjaCgobGFiZWwsIGxhYmVsTGV2ZWwpID0+IHtcclxuICAgICAgICAgICAgbGFiZWwuY2xhc3NMaXN0LnJlbW92ZSgnZGF0aXVtLXRvcCcpO1xyXG4gICAgICAgICAgICBsYWJlbC5jbGFzc0xpc3QucmVtb3ZlKCdkYXRpdW0tYm90dG9tJyk7XHJcbiAgICAgICAgICAgIGxhYmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1oaWRkZW4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChsYWJlbExldmVsIDwgbGV2ZWwpIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS10b3AnKTtcclxuICAgICAgICAgICAgICAgIGxhYmVsLmlubmVySFRNTCA9IHRoaXMuZ2V0SGVhZGVyVG9wVGV4dChkYXRlLCBsYWJlbExldmVsKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1ib3R0b20nKTtcclxuICAgICAgICAgICAgICAgIGxhYmVsLmlubmVySFRNTCA9IHRoaXMuZ2V0SGVhZGVyQm90dG9tVGV4dChkYXRlLCBsYWJlbExldmVsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKGxhYmVsTGV2ZWwgPCBsZXZlbCAtIDEgfHwgbGFiZWxMZXZlbCA+IGxldmVsKSB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbC5jbGFzc0xpc3QuYWRkKCdkYXRpdW0taGlkZGVuJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBnZXRIZWFkZXJUb3BUZXh0KGRhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWwpOnN0cmluZyB7XHJcbiAgICAgICAgc3dpdGNoKGxldmVsKSB7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuWUVBUjpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldERlY2FkZShkYXRlKTtcclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5NT05USDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBkYXRlLmdldEZ1bGxZZWFyKCkudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5EQVRFOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3RoaXMuZ2V0U2hvcnRNb250aHMoKVtkYXRlLmdldE1vbnRoKCldfSAke2RhdGUuZ2V0RnVsbFllYXIoKX1gO1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLkhPVVI6XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuTUlOVVRFOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3RoaXMuZ2V0U2hvcnREYXlzKClbZGF0ZS5nZXREYXkoKV19ICR7dGhpcy5wYWQoZGF0ZS5nZXREYXRlKCkpfSAke3RoaXMuZ2V0U2hvcnRNb250aHMoKVtkYXRlLmdldE1vbnRoKCldfSAke2RhdGUuZ2V0RnVsbFllYXIoKX1gO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBnZXRIZWFkZXJCb3R0b21UZXh0KGRhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWwpOnN0cmluZyB7XHJcbiAgICAgICAgc3dpdGNoKGxldmVsKSB7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuWUVBUjpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldERlY2FkZShkYXRlKTtcclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5NT05USDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBkYXRlLmdldEZ1bGxZZWFyKCkudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5EQVRFOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U2hvcnRNb250aHMoKVtkYXRlLmdldE1vbnRoKCldO1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLkhPVVI6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7dGhpcy5nZXRTaG9ydERheXMoKVtkYXRlLmdldERheSgpXX0gJHt0aGlzLnBhZChkYXRlLmdldERhdGUoKSl9IDxkYXRpdW0tdmFyaWFibGU+JHt0aGlzLmdldEhvdXJzKGRhdGUpfSR7dGhpcy5nZXRNZXJpZGllbShkYXRlKX08L2RhdGl1bS12YXJpYWJsZT5gO1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLk1JTlVURTpcclxuICAgICAgICAgICAgICAgIHJldHVybiBgJHt0aGlzLmdldEhvdXJzKGRhdGUpfTo8ZGF0aXVtLXZhcmlhYmxlPiR7dGhpcy5wYWQoZGF0ZS5nZXRNaW51dGVzKCkpfTwvZGF0aXVtLXZhcmlhYmxlPiR7dGhpcy5nZXRNZXJpZGllbShkYXRlKX1gO1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLlNFQ09ORDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBgJHt0aGlzLmdldEhvdXJzKGRhdGUpfToke3RoaXMucGFkKGRhdGUuZ2V0TWludXRlcygpKX06PGRhdGl1bS12YXJpYWJsZT4ke3RoaXMucGFkKGRhdGUuZ2V0U2Vjb25kcygpKX08L2RhdGl1bS12YXJpYWJsZT4ke3RoaXMuZ2V0TWVyaWRpZW0oZGF0ZSl9YDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB1cGRhdGVPcHRpb25zKG9wdGlvbnM6SU9wdGlvbnMsIGxldmVsczpMZXZlbFtdKSB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuICAgICAgICB0aGlzLmxldmVscyA9IGxldmVscztcclxuICAgIH1cclxufSIsImNvbnN0IGVudW0gVHJhbnNpdGlvbiB7XHJcbiAgICBTTElERV9MRUZULFxyXG4gICAgU0xJREVfUklHSFQsXHJcbiAgICBaT09NX0lOLFxyXG4gICAgWk9PTV9PVVRcclxufVxyXG5cclxuY2xhc3MgUGlja2VyTWFuYWdlciB7XHJcbiAgICBwcml2YXRlIG9wdGlvbnM6SU9wdGlvbnM7XHJcbiAgICBwdWJsaWMgY29udGFpbmVyOkhUTUxFbGVtZW50O1xyXG4gICAgcHVibGljIGhlYWRlcjpIZWFkZXI7XHJcbiAgICBcclxuICAgIHByaXZhdGUgeWVhclBpY2tlcjpJUGlja2VyO1xyXG4gICAgcHJpdmF0ZSBtb250aFBpY2tlcjpJUGlja2VyO1xyXG4gICAgcHJpdmF0ZSBkYXRlUGlja2VyOklQaWNrZXI7XHJcbiAgICBwcml2YXRlIGhvdXJQaWNrZXI6SVBpY2tlcjtcclxuICAgIHByaXZhdGUgbWludXRlUGlja2VyOklQaWNrZXI7XHJcbiAgICBwcml2YXRlIHNlY29uZFBpY2tlcjpJUGlja2VyO1xyXG4gICAgXHJcbiAgICBwdWJsaWMgY3VycmVudFBpY2tlcjpJUGlja2VyO1xyXG4gICAgXHJcbiAgICBwcml2YXRlIHBpY2tlckNvbnRhaW5lcjpIVE1MRWxlbWVudDtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBlbGVtZW50OkhUTUxJbnB1dEVsZW1lbnQpIHtcclxuICAgICAgICB0aGlzLmNvbnRhaW5lciA9IHRoaXMuY3JlYXRlVmlldygpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuaW5zZXJ0QWZ0ZXIoZWxlbWVudCwgdGhpcy5jb250YWluZXIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMucGlja2VyQ29udGFpbmVyID0gPEhUTUxFbGVtZW50PnRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1waWNrZXItY29udGFpbmVyJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5oZWFkZXIgPSBuZXcgSGVhZGVyKGVsZW1lbnQsIHRoaXMuY29udGFpbmVyKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnllYXJQaWNrZXIgPSBuZXcgWWVhclBpY2tlcihlbGVtZW50LCB0aGlzLmNvbnRhaW5lcik7XHJcbiAgICAgICAgdGhpcy5tb250aFBpY2tlciA9IG5ldyBNb250aFBpY2tlcihlbGVtZW50LCB0aGlzLmNvbnRhaW5lcik7XHJcbiAgICAgICAgdGhpcy5kYXRlUGlja2VyID0gbmV3IERhdGVQaWNrZXIoZWxlbWVudCwgdGhpcy5jb250YWluZXIpO1xyXG4gICAgICAgIHRoaXMuaG91clBpY2tlciA9IG5ldyBIb3VyUGlja2VyKGVsZW1lbnQsIHRoaXMuY29udGFpbmVyKTtcclxuICAgICAgICB0aGlzLm1pbnV0ZVBpY2tlciA9IG5ldyBNaW51dGVQaWNrZXIoZWxlbWVudCwgdGhpcy5jb250YWluZXIpO1xyXG4gICAgICAgIHRoaXMuc2Vjb25kUGlja2VyID0gbmV3IFNlY29uZFBpY2tlcihlbGVtZW50LCB0aGlzLmNvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICBsaXN0ZW4uZG93bih0aGlzLmNvbnRhaW5lciwgJyonLCAoZSkgPT4gdGhpcy5kb3duKGUpKTtcclxuICAgICAgICBsaXN0ZW4udXAoZG9jdW1lbnQsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZUJ1YmJsZSgpO1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUFjdGl2ZUNsYXNzZXMoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4ubW91c2Vkb3duKHRoaXMuY29udGFpbmVyLCAoZSkgPT4ge1xyXG4gICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgIHJldHVybiBmYWxzZTsgXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGlzdGVuLnZpZXdjaGFuZ2VkKGVsZW1lbnQsIChlKSA9PiB0aGlzLnZpZXdjaGFuZ2VkKGUuZGF0ZSwgZS5sZXZlbCwgZS51cGRhdGUpKTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4ub3BlbkJ1YmJsZShlbGVtZW50LCAoZSkgPT4ge1xyXG4gICAgICAgICAgIHRoaXMub3BlbkJ1YmJsZShlLngsIGUueSwgZS50ZXh0KTsgXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBjbG9zZUJ1YmJsZSgpIHtcclxuICAgICAgICBpZiAodGhpcy5idWJibGUgPT09IHZvaWQgMCkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuYnViYmxlLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1idWJibGUtdmlzaWJsZScpO1xyXG4gICAgICAgIHNldFRpbWVvdXQoKGJ1YmJsZTpIVE1MRWxlbWVudCkgPT4ge1xyXG4gICAgICAgICAgICBidWJibGUucmVtb3ZlKCk7XHJcbiAgICAgICAgfSwgMjAwLCB0aGlzLmJ1YmJsZSk7XHJcbiAgICAgICAgdGhpcy5idWJibGUgPSB2b2lkIDA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgYnViYmxlOkhUTUxFbGVtZW50O1xyXG4gICAgXHJcbiAgICBwdWJsaWMgb3BlbkJ1YmJsZSh4Om51bWJlciwgeTpudW1iZXIsIHRleHQ6c3RyaW5nKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuYnViYmxlICE9PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZUJ1YmJsZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmJ1YmJsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1idWJibGUnKTtcclxuICAgICAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmJ1YmJsZSk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVCdWJibGUoeCwgeSwgdGV4dCk7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgdGhpcy5idWJibGUuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLWJ1YmJsZS12aXNpYmxlJyk7IFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdXBkYXRlQnViYmxlKHg6bnVtYmVyLCB5Om51bWJlciwgdGV4dDpzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmJ1YmJsZS5pbm5lckhUTUwgPSB0ZXh0O1xyXG4gICAgICAgIHRoaXMuYnViYmxlLnN0eWxlLnRvcCA9IHkgKyAncHgnO1xyXG4gICAgICAgIHRoaXMuYnViYmxlLnN0eWxlLmxlZnQgPSB4ICsgJ3B4JztcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSB2aWV3Y2hhbmdlZChkYXRlOkRhdGUsIGxldmVsOkxldmVsLCB1cGRhdGU6Ym9vbGVhbikge1xyXG4gICAgICAgIGlmIChsZXZlbCA9PT0gTGV2ZWwuTk9ORSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50UGlja2VyICE9PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFBpY2tlci5yZW1vdmUoVHJhbnNpdGlvbi5aT09NX09VVCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5hZGp1c3RIZWlnaHQoMTApO1xyXG4gICAgICAgICAgICBpZiAodXBkYXRlKSB0aGlzLnVwZGF0ZVNlbGVjdGVkRGF0ZShkYXRlKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBsZXQgdHJhbnNpdGlvbjpUcmFuc2l0aW9uO1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRQaWNrZXIgPT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQaWNrZXIgPSB0aGlzLmdldFBpY2tlcihsZXZlbCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBpY2tlci5jcmVhdGUoZGF0ZSwgVHJhbnNpdGlvbi5aT09NX0lOKTtcclxuICAgICAgICB9IGVsc2UgaWYgKCh0cmFuc2l0aW9uID0gdGhpcy5nZXRUcmFuc2l0aW9uKGRhdGUsIGxldmVsKSkgIT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQaWNrZXIucmVtb3ZlKHRyYW5zaXRpb24pO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQaWNrZXIgPSB0aGlzLmdldFBpY2tlcihsZXZlbCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBpY2tlci5jcmVhdGUoZGF0ZSwgdHJhbnNpdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh1cGRhdGUpIHRoaXMudXBkYXRlU2VsZWN0ZWREYXRlKGRhdGUpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuYWRqdXN0SGVpZ2h0KHRoaXMuY3VycmVudFBpY2tlci5nZXRIZWlnaHQoKSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgdXBkYXRlU2VsZWN0ZWREYXRlKGRhdGU6RGF0ZSkge1xyXG4gICAgICAgIHRoaXMueWVhclBpY2tlci5zZXRTZWxlY3RlZERhdGUoZGF0ZSk7XHJcbiAgICAgICAgdGhpcy5tb250aFBpY2tlci5zZXRTZWxlY3RlZERhdGUoZGF0ZSk7XHJcbiAgICAgICAgdGhpcy5kYXRlUGlja2VyLnNldFNlbGVjdGVkRGF0ZShkYXRlKTtcclxuICAgICAgICB0aGlzLmhvdXJQaWNrZXIuc2V0U2VsZWN0ZWREYXRlKGRhdGUpO1xyXG4gICAgICAgIHRoaXMubWludXRlUGlja2VyLnNldFNlbGVjdGVkRGF0ZShkYXRlKTtcclxuICAgICAgICB0aGlzLnNlY29uZFBpY2tlci5zZXRTZWxlY3RlZERhdGUoZGF0ZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgZ2V0VHJhbnNpdGlvbihkYXRlOkRhdGUsIGxldmVsOkxldmVsKTpUcmFuc2l0aW9uIHtcclxuICAgICAgICBpZiAobGV2ZWwgPiB0aGlzLmN1cnJlbnRQaWNrZXIuZ2V0TGV2ZWwoKSkgcmV0dXJuIFRyYW5zaXRpb24uWk9PTV9JTjtcclxuICAgICAgICBpZiAobGV2ZWwgPCB0aGlzLmN1cnJlbnRQaWNrZXIuZ2V0TGV2ZWwoKSkgcmV0dXJuIFRyYW5zaXRpb24uWk9PTV9PVVQ7XHJcbiAgICAgICAgaWYgKGRhdGUudmFsdWVPZigpIDwgdGhpcy5jdXJyZW50UGlja2VyLmdldE1pbigpLnZhbHVlT2YoKSkgcmV0dXJuIFRyYW5zaXRpb24uU0xJREVfTEVGVDtcclxuICAgICAgICBpZiAoZGF0ZS52YWx1ZU9mKCkgPiB0aGlzLmN1cnJlbnRQaWNrZXIuZ2V0TWF4KCkudmFsdWVPZigpKSByZXR1cm4gVHJhbnNpdGlvbi5TTElERV9SSUdIVDtcclxuICAgICAgICByZXR1cm4gdm9pZCAwO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGFkanVzdEhlaWdodChoZWlnaHQ6bnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5waWNrZXJDb250YWluZXIuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZVkoJHtoZWlnaHQgLSAyODB9cHgpYDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBnZXRQaWNrZXIobGV2ZWw6TGV2ZWwpOklQaWNrZXIge1xyXG4gICAgICAgIHJldHVybiBbdGhpcy55ZWFyUGlja2VyLHRoaXMubW9udGhQaWNrZXIsdGhpcy5kYXRlUGlja2VyLHRoaXMuaG91clBpY2tlcix0aGlzLm1pbnV0ZVBpY2tlcix0aGlzLnNlY29uZFBpY2tlcl1bbGV2ZWxdO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgcmVtb3ZlQWN0aXZlQ2xhc3NlcygpIHtcclxuICAgICAgICBsZXQgYWN0aXZlRWxlbWVudHMgPSB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCcuZGF0aXVtLWFjdGl2ZScpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWN0aXZlRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgYWN0aXZlRWxlbWVudHNbaV0uY2xhc3NMaXN0LnJlbW92ZSgnZGF0aXVtLWFjdGl2ZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdkYXRpdW0tYWN0aXZlJyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgZG93bihlOk1vdXNlRXZlbnR8VG91Y2hFdmVudCkge1xyXG4gICAgICAgIGxldCBlbCA9IGUuc3JjRWxlbWVudCB8fCA8RWxlbWVudD5lLnRhcmdldDtcclxuICAgICAgICB3aGlsZSAoZWwgIT09IHRoaXMuY29udGFpbmVyKSB7XHJcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1hY3RpdmUnKTtcclxuICAgICAgICAgICAgZWwgPSBlbC5wYXJlbnRFbGVtZW50O1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tYWN0aXZlJyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB1cGRhdGVPcHRpb25zKG9wdGlvbnM6SU9wdGlvbnMsIGxldmVsczpMZXZlbFtdKSB7XHJcbiAgICAgICAgbGV0IHRoZW1lVXBkYXRlZCA9IHRoaXMub3B0aW9ucyA9PT0gdm9pZCAwIHx8XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy50aGVtZSA9PT0gdm9pZCAwIHx8XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy50aGVtZS5wcmltYXJ5ICE9PSBvcHRpb25zLnRoZW1lLnByaW1hcnkgfHxcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnRoZW1lLnByaW1hcnlfdGV4dCAhPT0gb3B0aW9ucy50aGVtZS5wcmltYXJ5X3RleHQgfHxcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnRoZW1lLnNlY29uZGFyeSAhPT0gb3B0aW9ucy50aGVtZS5zZWNvbmRhcnkgfHxcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnRoZW1lLnNlY29uZGFyeV9hY2NlbnQgIT09IG9wdGlvbnMudGhlbWUuc2Vjb25kYXJ5X2FjY2VudCB8fFxyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMudGhlbWUuc2Vjb25kYXJ5X3RleHQgIT09IG9wdGlvbnMudGhlbWUuc2Vjb25kYXJ5X3RleHQ7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuICAgICAgICBcclxuICAgICAgICBpZiAodGhlbWVVcGRhdGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5zZXJ0U3R5bGVzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuaGVhZGVyLnVwZGF0ZU9wdGlvbnMob3B0aW9ucywgbGV2ZWxzKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnllYXJQaWNrZXIudXBkYXRlT3B0aW9ucyhvcHRpb25zKTtcclxuICAgICAgICB0aGlzLm1vbnRoUGlja2VyLnVwZGF0ZU9wdGlvbnMob3B0aW9ucyk7XHJcbiAgICAgICAgdGhpcy5kYXRlUGlja2VyLnVwZGF0ZU9wdGlvbnMob3B0aW9ucyk7XHJcbiAgICAgICAgdGhpcy5ob3VyUGlja2VyLnVwZGF0ZU9wdGlvbnMob3B0aW9ucyk7XHJcbiAgICAgICAgdGhpcy5taW51dGVQaWNrZXIudXBkYXRlT3B0aW9ucyhvcHRpb25zKTtcclxuICAgICAgICB0aGlzLnNlY29uZFBpY2tlci51cGRhdGVPcHRpb25zKG9wdGlvbnMpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGNyZWF0ZVZpZXcoKTpIVE1MRWxlbWVudCB7XHJcbiAgICAgICAgbGV0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLWNvbnRhaW5lcicpO1xyXG4gICAgICAgIGVsLmlubmVySFRNTCA9IGhlYWRlciArIGBcclxuICAgICAgICA8ZGF0aXVtLXBpY2tlci1jb250YWluZXItd3JhcHBlcj5cclxuICAgICAgICAgICAgPGRhdGl1bS1waWNrZXItY29udGFpbmVyPjwvZGF0aXVtLXBpY2tlci1jb250YWluZXI+XHJcbiAgICAgICAgPC9kYXRpdW0tcGlja2VyLWNvbnRhaW5lci13cmFwcGVyPmA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIGVsO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGluc2VydEFmdGVyKG5vZGU6Tm9kZSwgbmV3Tm9kZTpOb2RlKTp2b2lkIHtcclxuICAgICAgICBub2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5ld05vZGUsIG5vZGUubmV4dFNpYmxpbmcpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdGF0aWMgc3R5bGVzSW5zZXJ0ZWQ6bnVtYmVyID0gMDtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBpbnNlcnRTdHlsZXMoKSB7XHJcbiAgICAgICAgbGV0IGhlYWQgPSBkb2N1bWVudC5oZWFkIHx8IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF07XHJcbiAgICAgICAgbGV0IHN0eWxlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHN0eWxlSWQgPSBcImRhdGl1bS1zdHlsZVwiICsgKFBpY2tlck1hbmFnZXIuc3R5bGVzSW5zZXJ0ZWQrKyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGV4aXN0aW5nU3R5bGVJZCA9IHRoaXMuZ2V0RXhpc3RpbmdTdHlsZUlkKCk7XHJcbiAgICAgICAgaWYgKGV4aXN0aW5nU3R5bGVJZCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKGV4aXN0aW5nU3R5bGVJZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoc3R5bGVJZCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHRyYW5zZm9ybWVkQ3NzID0gY3NzLnJlcGxhY2UoL19wcmltYXJ5X3RleHQvZywgdGhpcy5vcHRpb25zLnRoZW1lLnByaW1hcnlfdGV4dCk7XHJcbiAgICAgICAgdHJhbnNmb3JtZWRDc3MgPSB0cmFuc2Zvcm1lZENzcy5yZXBsYWNlKC9fcHJpbWFyeS9nLCB0aGlzLm9wdGlvbnMudGhlbWUucHJpbWFyeSk7XHJcbiAgICAgICAgdHJhbnNmb3JtZWRDc3MgPSB0cmFuc2Zvcm1lZENzcy5yZXBsYWNlKC9fc2Vjb25kYXJ5X3RleHQvZywgdGhpcy5vcHRpb25zLnRoZW1lLnNlY29uZGFyeV90ZXh0KTtcclxuICAgICAgICB0cmFuc2Zvcm1lZENzcyA9IHRyYW5zZm9ybWVkQ3NzLnJlcGxhY2UoL19zZWNvbmRhcnlfYWNjZW50L2csIHRoaXMub3B0aW9ucy50aGVtZS5zZWNvbmRhcnlfYWNjZW50KTtcclxuICAgICAgICB0cmFuc2Zvcm1lZENzcyA9IHRyYW5zZm9ybWVkQ3NzLnJlcGxhY2UoL19zZWNvbmRhcnkvZywgdGhpcy5vcHRpb25zLnRoZW1lLnNlY29uZGFyeSk7XHJcbiAgICAgICAgdHJhbnNmb3JtZWRDc3MgPSB0cmFuc2Zvcm1lZENzcy5yZXBsYWNlKC9faWQvZywgc3R5bGVJZCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgc3R5bGVFbGVtZW50LnR5cGUgPSAndGV4dC9jc3MnO1xyXG4gICAgICAgIGlmICgoPGFueT5zdHlsZUVsZW1lbnQpLnN0eWxlU2hlZXQpe1xyXG4gICAgICAgICAgICAoPGFueT5zdHlsZUVsZW1lbnQpLnN0eWxlU2hlZXQuY3NzVGV4dCA9IHRyYW5zZm9ybWVkQ3NzO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHN0eWxlRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0cmFuc2Zvcm1lZENzcykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaGVhZC5hcHBlbmRDaGlsZChzdHlsZUVsZW1lbnQpOyAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgZ2V0RXhpc3RpbmdTdHlsZUlkKCk6c3RyaW5nIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoL15kYXRpdW0tc3R5bGVcXGQrJC8udGVzdCh0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QuaXRlbShpKSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QuaXRlbShpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxufVxyXG4iLCJ2YXIgaGVhZGVyID0gXCI8ZGF0aXVtLWhlYWRlci13cmFwcGVyPiA8ZGF0aXVtLWhlYWRlcj4gPGRhdGl1bS1zcGFuLWxhYmVsLWNvbnRhaW5lcj4gPGRhdGl1bS1zcGFuLWxhYmVsIGNsYXNzPSdkYXRpdW0teWVhcic+PC9kYXRpdW0tc3Bhbi1sYWJlbD4gPGRhdGl1bS1zcGFuLWxhYmVsIGNsYXNzPSdkYXRpdW0tbW9udGgnPjwvZGF0aXVtLXNwYW4tbGFiZWw+IDxkYXRpdW0tc3Bhbi1sYWJlbCBjbGFzcz0nZGF0aXVtLWRhdGUnPjwvZGF0aXVtLXNwYW4tbGFiZWw+IDxkYXRpdW0tc3Bhbi1sYWJlbCBjbGFzcz0nZGF0aXVtLWhvdXInPjwvZGF0aXVtLXNwYW4tbGFiZWw+IDxkYXRpdW0tc3Bhbi1sYWJlbCBjbGFzcz0nZGF0aXVtLW1pbnV0ZSc+PC9kYXRpdW0tc3Bhbi1sYWJlbD4gPGRhdGl1bS1zcGFuLWxhYmVsIGNsYXNzPSdkYXRpdW0tc2Vjb25kJz48L2RhdGl1bS1zcGFuLWxhYmVsPiA8L2RhdGl1bS1zcGFuLWxhYmVsLWNvbnRhaW5lcj4gPGRhdGl1bS1wcmV2PjwvZGF0aXVtLXByZXY+IDxkYXRpdW0tbmV4dD48L2RhdGl1bS1uZXh0PiA8L2RhdGl1bS1oZWFkZXI+IDwvZGF0aXVtLWhlYWRlci13cmFwcGVyPlwiOyIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9jb21tb24vQ29tbW9uLnRzXCIgLz5cclxuY2xhc3MgUGlja2VyIGV4dGVuZHMgQ29tbW9uIHtcclxuICAgIHByb3RlY3RlZCBwaWNrZXJDb250YWluZXI6SFRNTEVsZW1lbnQ7XHJcbiAgICBwcm90ZWN0ZWQgbWluOkRhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgcHJvdGVjdGVkIG1heDpEYXRlID0gbmV3IERhdGUoKTtcclxuICAgIHByb3RlY3RlZCBwaWNrZXI6SFRNTEVsZW1lbnQ7XHJcbiAgICBwcm90ZWN0ZWQgc2VsZWN0ZWREYXRlOkRhdGU7XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6SFRNTEVsZW1lbnQsIHByaXZhdGUgY29udGFpbmVyOkhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLnBpY2tlckNvbnRhaW5lciA9IDxIVE1MRWxlbWVudD5jb250YWluZXIucXVlcnlTZWxlY3RvcignZGF0aXVtLXBpY2tlci1jb250YWluZXInKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGNyZWF0ZShkYXRlOkRhdGUsIHRyYW5zaXRpb246VHJhbnNpdGlvbikge1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgcmVtb3ZlKHRyYW5zaXRpb246VHJhbnNpdGlvbikge1xyXG4gICAgICAgIGlmICh0aGlzLnBpY2tlciA9PT0gdm9pZCAwKSByZXR1cm47XHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uT3V0KHRyYW5zaXRpb24sIHRoaXMucGlja2VyKTtcclxuICAgICAgICBzZXRUaW1lb3V0KChwaWNrZXI6SFRNTEVsZW1lbnQpID0+IHtcclxuICAgICAgICAgICAgcGlja2VyLnJlbW92ZSgpO1xyXG4gICAgICAgIH0sIDUwMCwgdGhpcy5waWNrZXIpOyAgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBnZXRPZmZzZXQoZWw6SFRNTEVsZW1lbnQpOnt4Om51bWJlciwgeTpudW1iZXJ9IHtcclxuICAgICAgICBsZXQgeCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQgLSB0aGlzLmNvbnRhaW5lci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0O1xyXG4gICAgICAgIGxldCB5ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wIC0gdGhpcy5jb250YWluZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wO1xyXG4gICAgICAgIHJldHVybiB7IHg6IHgsIHk6IHkgfTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHVwZGF0ZU9wdGlvbnMob3B0aW9uczpJT3B0aW9ucykge1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgYXR0YWNoKCkge1xyXG4gICAgICAgIHRoaXMucGlja2VyQ29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMucGlja2VyKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldE1pbigpOkRhdGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1pbjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldE1heCgpOkRhdGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1heDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHNldFNlbGVjdGVkRGF0ZShkYXRlOkRhdGUpOnZvaWQge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWREYXRlID0gbmV3IERhdGUoZGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgdHJhbnNpdGlvbk91dCh0cmFuc2l0aW9uOlRyYW5zaXRpb24sIHBpY2tlcjpIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIGlmICh0cmFuc2l0aW9uID09PSBUcmFuc2l0aW9uLlNMSURFX0xFRlQpIHtcclxuICAgICAgICAgICAgcGlja2VyLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1waWNrZXItcmlnaHQnKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRyYW5zaXRpb24gPT09IFRyYW5zaXRpb24uU0xJREVfUklHSFQpIHtcclxuICAgICAgICAgICAgcGlja2VyLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1waWNrZXItbGVmdCcpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHJhbnNpdGlvbiA9PT0gVHJhbnNpdGlvbi5aT09NX0lOKSB7XHJcbiAgICAgICAgICAgIHBpY2tlci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tcGlja2VyLW91dCcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBpY2tlci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tcGlja2VyLWluJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgdHJhbnNpdGlvbkluKHRyYW5zaXRpb246VHJhbnNpdGlvbiwgcGlja2VyOkhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgbGV0IGNscztcclxuICAgICAgICBpZiAodHJhbnNpdGlvbiA9PT0gVHJhbnNpdGlvbi5TTElERV9MRUZUKSB7XHJcbiAgICAgICAgICAgIGNscyA9ICdkYXRpdW0tcGlja2VyLWxlZnQnO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHJhbnNpdGlvbiA9PT0gVHJhbnNpdGlvbi5TTElERV9SSUdIVCkge1xyXG4gICAgICAgICAgICBjbHMgPSAnZGF0aXVtLXBpY2tlci1yaWdodCc7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0cmFuc2l0aW9uID09PSBUcmFuc2l0aW9uLlpPT01fSU4pIHtcclxuICAgICAgICAgICAgY2xzID0gJ2RhdGl1bS1waWNrZXItaW4nO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNscyA9ICdkYXRpdW0tcGlja2VyLW91dCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHBpY2tlci5jbGFzc0xpc3QuYWRkKGNscyk7XHJcbiAgICAgICAgc2V0VGltZW91dCgocCkgPT4ge1xyXG4gICAgICAgICAgICBwLmNsYXNzTGlzdC5yZW1vdmUoY2xzKTtcclxuICAgICAgICB9LCAxMDAsIHBpY2tlcik7XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInBpY2tlci50c1wiIC8+XHJcblxyXG5jbGFzcyBEYXRlUGlja2VyIGV4dGVuZHMgUGlja2VyIGltcGxlbWVudHMgSVBpY2tlciB7XHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OkhUTUxFbGVtZW50LCBjb250YWluZXI6SFRNTEVsZW1lbnQpIHtcclxuICAgICAgICBzdXBlcihlbGVtZW50LCBjb250YWluZXIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi50YXAoY29udGFpbmVyLCAnZGF0aXVtLWRhdGUtZWxlbWVudFtkYXRpdW0tZGF0YV0nLCAoZSkgPT4ge1xyXG4gICAgICAgICAgIGxldCBlbDpFbGVtZW50ID0gPEVsZW1lbnQ+ZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xyXG4gICAgICAgICAgIFxyXG4gICAgICAgICAgIGxldCB5ZWFyID0gbmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKS5nZXRGdWxsWWVhcigpO1xyXG4gICAgICAgICAgIGxldCBtb250aCA9IG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSkuZ2V0TW9udGgoKTtcclxuICAgICAgICAgICBsZXQgZGF0ZU9mTW9udGggPSBuZXcgRGF0ZShlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpLmdldERhdGUoKTtcclxuICAgICAgICAgICBcclxuICAgICAgICAgICBsZXQgZGF0ZSA9IG5ldyBEYXRlKHRoaXMuc2VsZWN0ZWREYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgICAgZGF0ZS5zZXRGdWxsWWVhcih5ZWFyKTtcclxuICAgICAgICAgICBkYXRlLnNldE1vbnRoKG1vbnRoKTtcclxuICAgICAgICAgICBpZiAoZGF0ZS5nZXRNb250aCgpICE9PSBtb250aCkge1xyXG4gICAgICAgICAgICAgICBkYXRlLnNldERhdGUoMCk7XHJcbiAgICAgICAgICAgfVxyXG4gICAgICAgICAgIGRhdGUuc2V0RGF0ZShkYXRlT2ZNb250aCk7XHJcbiAgICAgICAgICAgXHJcbiAgICAgICAgICAgdHJpZ2dlci5nb3RvKGVsZW1lbnQsIHtcclxuICAgICAgICAgICAgICAgZGF0ZTogZGF0ZSxcclxuICAgICAgICAgICAgICAgbGV2ZWw6IExldmVsLkhPVVJcclxuICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi5kb3duKGNvbnRhaW5lciwgJ2RhdGl1bS1kYXRlLWVsZW1lbnQnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZWw6SFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+KGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudCk7XHJcbiAgICAgICAgICAgIGxldCB0ZXh0ID0gdGhpcy5wYWQobmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKS5nZXREYXRlKCkpO1xyXG4gICAgICAgICAgICBsZXQgb2Zmc2V0ID0gdGhpcy5nZXRPZmZzZXQoZWwpO1xyXG4gICAgICAgICAgICB0cmlnZ2VyLm9wZW5CdWJibGUoZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgeDogb2Zmc2V0LnggKyAyMCxcclxuICAgICAgICAgICAgICAgIHk6IG9mZnNldC55ICsgMixcclxuICAgICAgICAgICAgICAgIHRleHQ6IHRleHRcclxuICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBoZWlnaHQ6bnVtYmVyO1xyXG4gICAgXHJcbiAgICBwdWJsaWMgY3JlYXRlKGRhdGU6RGF0ZSwgdHJhbnNpdGlvbjpUcmFuc2l0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5taW4gPSBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSk7XHJcbiAgICAgICAgdGhpcy5tYXggPSBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSArIDEpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBzdGFydCA9IG5ldyBEYXRlKHRoaXMubWluLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgc3RhcnQuc2V0RGF0ZSgxIC0gc3RhcnQuZ2V0RGF5KCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBlbmQgPSBuZXcgRGF0ZSh0aGlzLm1heC52YWx1ZU9mKCkpO1xyXG4gICAgICAgIGVuZC5zZXREYXRlKGVuZC5nZXREYXRlKCkgKyA3IC0gKGVuZC5nZXREYXkoKSA9PT0gMCA/IDcgOiBlbmQuZ2V0RGF5KCkpKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgaXRlcmF0b3IgPSBuZXcgRGF0ZShzdGFydC52YWx1ZU9mKCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMucGlja2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXBpY2tlcicpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbkluKHRyYW5zaXRpb24sIHRoaXMucGlja2VyKTtcclxuICAgICAgICBcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDc7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgaGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLWRhdGUtaGVhZGVyJyk7XHJcbiAgICAgICAgICAgIGhlYWRlci5pbm5lckhUTUwgPSB0aGlzLmdldERheXMoKVtpXS5zbGljZSgwLCAyKTtcclxuICAgICAgICAgICAgdGhpcy5waWNrZXIuYXBwZW5kQ2hpbGQoaGVhZGVyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHRpbWVzID0gMDtcclxuICAgICAgICBcclxuICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgIGxldCBkYXRlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1kYXRlLWVsZW1lbnQnKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGRhdGVFbGVtZW50LmlubmVySFRNTCA9IGl0ZXJhdG9yLmdldERhdGUoKS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKGl0ZXJhdG9yLmdldE1vbnRoKCkgPT09IGRhdGUuZ2V0TW9udGgoKSkge1xyXG4gICAgICAgICAgICAgICAgZGF0ZUVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScsIGl0ZXJhdG9yLnRvSVNPU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLnBpY2tlci5hcHBlbmRDaGlsZChkYXRlRWxlbWVudCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpdGVyYXRvci5zZXREYXRlKGl0ZXJhdG9yLmdldERhdGUoKSArIDEpO1xyXG4gICAgICAgICAgICB0aW1lcysrO1xyXG4gICAgICAgIH0gd2hpbGUgKGl0ZXJhdG9yLnZhbHVlT2YoKSA8IGVuZC52YWx1ZU9mKCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gTWF0aC5jZWlsKHRpbWVzIC8gNykgKiAzNiArIDI4O1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuYXR0YWNoKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5zZXRTZWxlY3RlZERhdGUodGhpcy5zZWxlY3RlZERhdGUpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgc2V0U2VsZWN0ZWREYXRlKHNlbGVjdGVkRGF0ZTpEYXRlKSB7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZERhdGUgPSBuZXcgRGF0ZShzZWxlY3RlZERhdGUudmFsdWVPZigpKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgZGF0ZUVsZW1lbnRzID0gdGhpcy5waWNrZXJDb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnZGF0aXVtLWRhdGUtZWxlbWVudCcpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGF0ZUVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBlbCA9IGRhdGVFbGVtZW50cy5pdGVtKGkpO1xyXG4gICAgICAgICAgICBsZXQgZGF0ZSA9IG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSk7XHJcbiAgICAgICAgICAgIGlmIChkYXRlLmdldEZ1bGxZZWFyKCkgPT09IHNlbGVjdGVkRGF0ZS5nZXRGdWxsWWVhcigpICYmXHJcbiAgICAgICAgICAgICAgICBkYXRlLmdldE1vbnRoKCkgPT09IHNlbGVjdGVkRGF0ZS5nZXRNb250aCgpICYmXHJcbiAgICAgICAgICAgICAgICBkYXRlLmdldERhdGUoKSA9PT0gc2VsZWN0ZWREYXRlLmdldERhdGUoKSkge1xyXG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLXNlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdkYXRpdW0tc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldEhlaWdodCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5oZWlnaHQ7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICByZXR1cm4gTGV2ZWwuREFURTtcclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJwaWNrZXIudHNcIiAvPlxyXG5cclxuY2xhc3MgSG91clBpY2tlciBleHRlbmRzIFBpY2tlciBpbXBsZW1lbnRzIElQaWNrZXIge1xyXG4gICAgY29uc3RydWN0b3IoZWxlbWVudDpIVE1MRWxlbWVudCwgY29udGFpbmVyOkhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgc3VwZXIoZWxlbWVudCwgY29udGFpbmVyKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGNyZWF0ZShkYXRlOkRhdGUsIHRyYW5zaXRpb246VHJhbnNpdGlvbikge1xyXG4gICAgICAgIHRoaXMubWluID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIGRhdGUuZ2V0RGF0ZSgpKTtcclxuICAgICAgICB0aGlzLm1heCA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCBkYXRlLmdldERhdGUoKSArIDEpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBpdGVyYXRvciA9IG5ldyBEYXRlKHRoaXMubWluLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5waWNrZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tcGlja2VyJyk7XHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uSW4odHJhbnNpdGlvbiwgdGhpcy5waWNrZXIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgICAgbGV0IGhvdXJFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLWhvdXItZWxlbWVudCcpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaG91ckVsZW1lbnQuaW5uZXJIVE1MID0gaXRlcmF0b3IuZ2V0SG91cnMoKS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5waWNrZXIuYXBwZW5kQ2hpbGQoaG91ckVsZW1lbnQpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaXRlcmF0b3Iuc2V0SG91cnMoaXRlcmF0b3IuZ2V0SG91cnMoKSArIDEpO1xyXG4gICAgICAgIH0gd2hpbGUgKGl0ZXJhdG9yLnZhbHVlT2YoKSA8IHRoaXMubWF4LnZhbHVlT2YoKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5hdHRhY2goKTtcclxuICAgICAgICB0aGlzLnNldFNlbGVjdGVkRGF0ZSh0aGlzLnNlbGVjdGVkRGF0ZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRIZWlnaHQoKSB7XHJcbiAgICAgICAgcmV0dXJuIDI2MDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldExldmVsKCkge1xyXG4gICAgICAgIHJldHVybiBMZXZlbC5IT1VSO1xyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInBpY2tlci50c1wiIC8+XHJcblxyXG5jbGFzcyBNaW51dGVQaWNrZXIgZXh0ZW5kcyBQaWNrZXIgaW1wbGVtZW50cyBJUGlja2VyIHtcclxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6SFRNTEVsZW1lbnQsIGNvbnRhaW5lcjpIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIHN1cGVyKGVsZW1lbnQsIGNvbnRhaW5lcik7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB1cGRhdGVPcHRpb25zKG9wdGlvbnM6SU9wdGlvbnMpIHtcclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldEhlaWdodCgpIHtcclxuICAgICAgICByZXR1cm4gMjMwO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgcmV0dXJuIExldmVsLk1JTlVURTtcclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJwaWNrZXIudHNcIiAvPlxyXG5cclxuY2xhc3MgTW9udGhQaWNrZXIgZXh0ZW5kcyBQaWNrZXIgaW1wbGVtZW50cyBJUGlja2VyIHtcclxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6SFRNTEVsZW1lbnQsIGNvbnRhaW5lcjpIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIHN1cGVyKGVsZW1lbnQsIGNvbnRhaW5lcik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGlzdGVuLnRhcChjb250YWluZXIsICdkYXRpdW0tbW9udGgtZWxlbWVudFtkYXRpdW0tZGF0YV0nLCAoZSkgPT4ge1xyXG4gICAgICAgICAgIGxldCBlbDpFbGVtZW50ID0gPEVsZW1lbnQ+ZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xyXG4gICAgICAgICAgIGxldCB5ZWFyID0gbmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKS5nZXRGdWxsWWVhcigpO1xyXG4gICAgICAgICAgIGxldCBtb250aCA9IG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSkuZ2V0TW9udGgoKTtcclxuICAgICAgICAgICBcclxuICAgICAgICAgICBsZXQgZGF0ZSA9IG5ldyBEYXRlKHRoaXMuc2VsZWN0ZWREYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgICAgZGF0ZS5zZXRGdWxsWWVhcih5ZWFyKTtcclxuICAgICAgICAgICBkYXRlLnNldE1vbnRoKG1vbnRoKTtcclxuICAgICAgICAgICBpZiAoZGF0ZS5nZXRNb250aCgpICE9PSBtb250aCkge1xyXG4gICAgICAgICAgICAgICBkYXRlLnNldERhdGUoMCk7XHJcbiAgICAgICAgICAgfVxyXG4gICAgICAgICAgIFxyXG4gICAgICAgICAgIHRyaWdnZXIuZ290byhlbGVtZW50LCB7XHJcbiAgICAgICAgICAgICAgIGRhdGU6IGRhdGUsXHJcbiAgICAgICAgICAgICAgIGxldmVsOiBMZXZlbC5EQVRFXHJcbiAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGlzdGVuLmRvd24oY29udGFpbmVyLCAnZGF0aXVtLW1vbnRoLWVsZW1lbnQnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZWw6SFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+KGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudCk7XHJcbiAgICAgICAgICAgIGxldCB0ZXh0ID0gdGhpcy5nZXRTaG9ydE1vbnRocygpW25ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSkuZ2V0TW9udGgoKV07XHJcbiAgICAgICAgICAgIGxldCBvZmZzZXQgPSB0aGlzLmdldE9mZnNldChlbCk7XHJcbiAgICAgICAgICAgIHRyaWdnZXIub3BlbkJ1YmJsZShlbGVtZW50LCB7XHJcbiAgICAgICAgICAgICAgICB4OiBvZmZzZXQueCArIDM1LFxyXG4gICAgICAgICAgICAgICAgeTogb2Zmc2V0LnkgKyAxNSxcclxuICAgICAgICAgICAgICAgIHRleHQ6IHRleHRcclxuICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGNyZWF0ZShkYXRlOkRhdGUsIHRyYW5zaXRpb246VHJhbnNpdGlvbikge1xyXG4gICAgICAgIHRoaXMubWluID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCAwKTtcclxuICAgICAgICB0aGlzLm1heCA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSArIDEsIDApO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBpdGVyYXRvciA9IG5ldyBEYXRlKHRoaXMubWluLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5waWNrZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tcGlja2VyJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uSW4odHJhbnNpdGlvbiwgdGhpcy5waWNrZXIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgICAgbGV0IG1vbnRoRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1tb250aC1lbGVtZW50Jyk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBtb250aEVsZW1lbnQuaW5uZXJIVE1MID0gdGhpcy5nZXRTaG9ydE1vbnRocygpW2l0ZXJhdG9yLmdldE1vbnRoKCldO1xyXG4gICAgICAgICAgICBtb250aEVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScsIGl0ZXJhdG9yLnRvSVNPU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5waWNrZXIuYXBwZW5kQ2hpbGQobW9udGhFbGVtZW50KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGl0ZXJhdG9yLnNldE1vbnRoKGl0ZXJhdG9yLmdldE1vbnRoKCkgKyAxKTtcclxuICAgICAgICB9IHdoaWxlIChpdGVyYXRvci52YWx1ZU9mKCkgPCB0aGlzLm1heC52YWx1ZU9mKCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuYXR0YWNoKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5zZXRTZWxlY3RlZERhdGUodGhpcy5zZWxlY3RlZERhdGUpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgc2V0U2VsZWN0ZWREYXRlKHNlbGVjdGVkRGF0ZTpEYXRlKSB7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZERhdGUgPSBuZXcgRGF0ZShzZWxlY3RlZERhdGUudmFsdWVPZigpKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgbW9udGhFbGVtZW50cyA9IHRoaXMucGlja2VyQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJ2RhdGl1bS1tb250aC1lbGVtZW50Jyk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtb250aEVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBlbCA9IG1vbnRoRWxlbWVudHMuaXRlbShpKTtcclxuICAgICAgICAgICAgbGV0IGRhdGUgPSBuZXcgRGF0ZShlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpO1xyXG4gICAgICAgICAgICBpZiAoZGF0ZS5nZXRGdWxsWWVhcigpID09PSBzZWxlY3RlZERhdGUuZ2V0RnVsbFllYXIoKSAmJlxyXG4gICAgICAgICAgICAgICAgZGF0ZS5nZXRNb250aCgpID09PSBzZWxlY3RlZERhdGUuZ2V0TW9udGgoKSkge1xyXG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLXNlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdkYXRpdW0tc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldEhlaWdodCgpIHtcclxuICAgICAgICByZXR1cm4gMTgwO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgcmV0dXJuIExldmVsLk1PTlRIO1xyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInBpY2tlci50c1wiIC8+XHJcblxyXG5jbGFzcyBTZWNvbmRQaWNrZXIgZXh0ZW5kcyBQaWNrZXIgaW1wbGVtZW50cyBJUGlja2VyIHtcclxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6SFRNTEVsZW1lbnQsIGNvbnRhaW5lcjpIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIHN1cGVyKGVsZW1lbnQsIGNvbnRhaW5lcik7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB1cGRhdGVPcHRpb25zKG9wdGlvbnM6SU9wdGlvbnMpIHtcclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldEhlaWdodCgpIHtcclxuICAgICAgICByZXR1cm4gMTgwO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgcmV0dXJuIExldmVsLlNFQ09ORDtcclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJwaWNrZXIudHNcIiAvPlxyXG5cclxuY2xhc3MgWWVhclBpY2tlciBleHRlbmRzIFBpY2tlciBpbXBsZW1lbnRzIElQaWNrZXIge1xyXG4gICAgY29uc3RydWN0b3IoZWxlbWVudDpIVE1MRWxlbWVudCwgY29udGFpbmVyOkhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgc3VwZXIoZWxlbWVudCwgY29udGFpbmVyKTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4udGFwKGNvbnRhaW5lciwgJ2RhdGl1bS15ZWFyLWVsZW1lbnRbZGF0aXVtLWRhdGFdJywgKGUpID0+IHtcclxuICAgICAgICAgICBsZXQgZWw6RWxlbWVudCA9IDxFbGVtZW50PmUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcclxuICAgICAgICAgICBsZXQgeWVhciA9IG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSkuZ2V0RnVsbFllYXIoKTtcclxuICAgICAgICAgICBcclxuICAgICAgICAgICBsZXQgZGF0ZSA9IG5ldyBEYXRlKHRoaXMuc2VsZWN0ZWREYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgICAgZGF0ZS5zZXRGdWxsWWVhcih5ZWFyKTtcclxuICAgICAgICAgICBcclxuICAgICAgICAgICB0cmlnZ2VyLmdvdG8oZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICBkYXRlOiBkYXRlLFxyXG4gICAgICAgICAgICAgICBsZXZlbDogTGV2ZWwuTU9OVEhcclxuICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi5kb3duKGNvbnRhaW5lciwgJ2RhdGl1bS15ZWFyLWVsZW1lbnQnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZWw6SFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+KGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudCk7XHJcbiAgICAgICAgICAgIGxldCB0ZXh0ID0gbmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKS5nZXRGdWxsWWVhcigpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIGxldCBvZmZzZXQgPSB0aGlzLmdldE9mZnNldChlbCk7XHJcbiAgICAgICAgICAgIHRyaWdnZXIub3BlbkJ1YmJsZShlbGVtZW50LCB7XHJcbiAgICAgICAgICAgICAgICB4OiBvZmZzZXQueCArIDM1LFxyXG4gICAgICAgICAgICAgICAgeTogb2Zmc2V0LnkgKyAxNSxcclxuICAgICAgICAgICAgICAgIHRleHQ6IHRleHRcclxuICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGNyZWF0ZShkYXRlOkRhdGUsIHRyYW5zaXRpb246VHJhbnNpdGlvbikge1xyXG4gICAgICAgIHRoaXMubWluID0gbmV3IERhdGUoTWF0aC5mbG9vcihkYXRlLmdldEZ1bGxZZWFyKCkvMTApKjEwLCAwKTtcclxuICAgICAgICB0aGlzLm1heCA9IG5ldyBEYXRlKE1hdGguY2VpbChkYXRlLmdldEZ1bGxZZWFyKCkvMTApKjEwLCAwKTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAodGhpcy5taW4udmFsdWVPZigpID09PSB0aGlzLm1heC52YWx1ZU9mKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5tYXguc2V0RnVsbFllYXIodGhpcy5tYXguZ2V0RnVsbFllYXIoKSArIDEwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGl0ZXJhdG9yID0gbmV3IERhdGUodGhpcy5taW4udmFsdWVPZigpKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnBpY2tlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1waWNrZXInKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnRyYW5zaXRpb25Jbih0cmFuc2l0aW9uLCB0aGlzLnBpY2tlcik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICBsZXQgeWVhckVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0teWVhci1lbGVtZW50Jyk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB5ZWFyRWxlbWVudC5pbm5lckhUTUwgPSBpdGVyYXRvci5nZXRGdWxsWWVhcigpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIHllYXJFbGVtZW50LnNldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnLCBpdGVyYXRvci50b0lTT1N0cmluZygpKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKHllYXJFbGVtZW50KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGl0ZXJhdG9yLnNldEZ1bGxZZWFyKGl0ZXJhdG9yLmdldEZ1bGxZZWFyKCkgKyAxKTtcclxuICAgICAgICB9IHdoaWxlIChpdGVyYXRvci52YWx1ZU9mKCkgPD0gdGhpcy5tYXgudmFsdWVPZigpKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmF0dGFjaCgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuc2V0U2VsZWN0ZWREYXRlKHRoaXMuc2VsZWN0ZWREYXRlKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHNldFNlbGVjdGVkRGF0ZShzZWxlY3RlZERhdGU6RGF0ZSkge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWREYXRlID0gbmV3IERhdGUoc2VsZWN0ZWREYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHllYXJFbGVtZW50cyA9IHRoaXMucGlja2VyQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJ2RhdGl1bS15ZWFyLWVsZW1lbnQnKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHllYXJFbGVtZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgZWwgPSB5ZWFyRWxlbWVudHMuaXRlbShpKTtcclxuICAgICAgICAgICAgbGV0IGRhdGUgPSBuZXcgRGF0ZShlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpO1xyXG4gICAgICAgICAgICBpZiAoZGF0ZS5nZXRGdWxsWWVhcigpID09PSBzZWxlY3RlZERhdGUuZ2V0RnVsbFllYXIoKSkge1xyXG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLXNlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdkYXRpdW0tc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldEhlaWdodCgpIHtcclxuICAgICAgICByZXR1cm4gMTgwO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgcmV0dXJuIExldmVsLllFQVI7XHJcbiAgICB9XHJcbn0iLCJ2YXIgY3NzPVwiZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWJ1YmJsZSxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0taGVhZGVyLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXItY29udGFpbmVye2JveC1zaGFkb3c6MCAzcHggNnB4IHJnYmEoMCwwLDAsLjE2KSwwIDNweCA2cHggcmdiYSgwLDAsMCwuMjMpfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1oZWFkZXItd3JhcHBlcntvdmVyZmxvdzpoaWRkZW47cG9zaXRpb246YWJzb2x1dGU7bGVmdDotN3B4O3JpZ2h0Oi03cHg7dG9wOi03cHg7aGVpZ2h0Ojg3cHg7ZGlzcGxheTpibG9jaztwb2ludGVyLWV2ZW50czpub25lfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1oZWFkZXJ7cG9zaXRpb246cmVsYXRpdmU7ZGlzcGxheTpibG9jaztvdmVyZmxvdzpoaWRkZW47aGVpZ2h0OjEwMHB4O2JhY2tncm91bmQtY29sb3I6X3ByaW1hcnk7Ym9yZGVyLXRvcC1sZWZ0LXJhZGl1czozcHg7Ym9yZGVyLXRvcC1yaWdodC1yYWRpdXM6M3B4O3otaW5kZXg6MTttYXJnaW46N3B4O3dpZHRoOmNhbGMoMTAwJSAtIDE0cHgpO3BvaW50ZXItZXZlbnRzOmF1dG99ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXNwYW4tbGFiZWwtY29udGFpbmVye3Bvc2l0aW9uOmFic29sdXRlO2xlZnQ6NDBweDtyaWdodDo0MHB4O3RvcDowO2JvdHRvbTowO2Rpc3BsYXk6YmxvY2s7b3ZlcmZsb3c6aGlkZGVuO3RyYW5zaXRpb246LjJzIGVhc2UgYWxsO3RyYW5zZm9ybS1vcmlnaW46NDBweCA0MHB4fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1zcGFuLWxhYmVse3Bvc2l0aW9uOmFic29sdXRlO2ZvbnQtc2l6ZToxOHB0O2NvbG9yOl9wcmltYXJ5X3RleHQ7Zm9udC13ZWlnaHQ6NzAwO3RyYW5zZm9ybS1vcmlnaW46MCAwO3doaXRlLXNwYWNlOm5vd3JhcDt0cmFuc2l0aW9uOmFsbCAuMnMgZWFzZTt0ZXh0LXRyYW5zZm9ybTp1cHBlcmNhc2V9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXNwYW4tbGFiZWwuZGF0aXVtLXRvcHt0cmFuc2Zvcm06dHJhbnNsYXRlWSgxN3B4KSBzY2FsZSguNjYpO3dpZHRoOjE1MSU7b3BhY2l0eTouNn1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc3Bhbi1sYWJlbC5kYXRpdW0tYm90dG9te3RyYW5zZm9ybTp0cmFuc2xhdGVZKDM2cHgpIHNjYWxlKDEpO3dpZHRoOjEwMCU7b3BhY2l0eToxfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS10b3AuZGF0aXVtLWhpZGRlbnt0cmFuc2Zvcm06dHJhbnNsYXRlWSg1cHgpIHNjYWxlKC40KTtvcGFjaXR5OjB9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXNwYW4tbGFiZWwuZGF0aXVtLWJvdHRvbS5kYXRpdW0taGlkZGVue3RyYW5zZm9ybTp0cmFuc2xhdGVZKDc4cHgpIHNjYWxlKDEuMik7b3BhY2l0eTouNX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc3Bhbi1sYWJlbDphZnRlcntjb250ZW50OicnO2Rpc3BsYXk6aW5saW5lLWJsb2NrO3Bvc2l0aW9uOmFic29sdXRlO21hcmdpbi1sZWZ0OjEwcHg7bWFyZ2luLXRvcDo2cHg7aGVpZ2h0OjE3cHg7d2lkdGg6MTdweDtvcGFjaXR5OjA7dHJhbnNpdGlvbjphbGwgLjJzIGVhc2U7YmFja2dyb3VuZDp1cmwoZGF0YTppbWFnZS9zdmcreG1sO3V0ZjgsJTNDc3ZnJTIweG1sbnMlM0QlMjJodHRwJTNBJTJGJTJGd3d3LnczLm9yZyUyRjIwMDAlMkZzdmclMjIlM0UlM0NnJTIwZmlsbCUzRCUyMl9wcmltYXJ5X3RleHQlMjIlM0UlM0NwYXRoJTIwZCUzRCUyMk0xNyUyMDE1bC0yJTIwMi01LTUlMjAyLTJ6JTIyJTIwZmlsbC1ydWxlJTNEJTIyZXZlbm9kZCUyMiUyRiUzRSUzQ3BhdGglMjBkJTNEJTIyTTclMjAwYTclMjA3JTIwMCUyMDAlMjAwLTclMjA3JTIwNyUyMDclMjAwJTIwMCUyMDAlMjA3JTIwNyUyMDclMjA3JTIwMCUyMDAlMjAwJTIwNy03JTIwNyUyMDclMjAwJTIwMCUyMDAtNy03em0wJTIwMmE1JTIwNSUyMDAlMjAwJTIwMSUyMDUlMjA1JTIwNSUyMDUlMjAwJTIwMCUyMDEtNSUyMDUlMjA1JTIwNSUyMDAlMjAwJTIwMS01LTUlMjA1JTIwNSUyMDAlMjAwJTIwMSUyMDUtNXolMjIlMkYlM0UlM0NwYXRoJTIwZCUzRCUyMk00JTIwNmg2djJINHolMjIlMkYlM0UlM0MlMkZnJTNFJTNDJTJGc3ZnJTNFKX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc3Bhbi1sYWJlbC5kYXRpdW0tdG9wOmFmdGVye29wYWNpdHk6MX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc3Bhbi1sYWJlbCBkYXRpdW0tdmFyaWFibGV7Y29sb3I6X3ByaW1hcnk7Zm9udC1zaXplOjE0cHQ7cGFkZGluZzowIDRweDttYXJnaW46MCAycHg7dG9wOi0ycHg7cG9zaXRpb246cmVsYXRpdmV9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXNwYW4tbGFiZWwgZGF0aXVtLXZhcmlhYmxlOmJlZm9yZXtjb250ZW50OicnO3Bvc2l0aW9uOmFic29sdXRlO2xlZnQ6MDt0b3A6MDtyaWdodDowO2JvdHRvbTowO2JvcmRlci1yYWRpdXM6NXB4O2JhY2tncm91bmQtY29sb3I6X3ByaW1hcnlfdGV4dDt6LWluZGV4Oi0xO29wYWNpdHk6Ljd9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW5leHQsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXByZXZ7cG9zaXRpb246YWJzb2x1dGU7d2lkdGg6NDBweDt0b3A6MDtib3R0b206MDt0cmFuc2Zvcm0tb3JpZ2luOjIwcHggNTJweH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbmV4dDphZnRlcixkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbmV4dDpiZWZvcmUsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXByZXY6YWZ0ZXIsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXByZXY6YmVmb3Jle2NvbnRlbnQ6Jyc7cG9zaXRpb246YWJzb2x1dGU7ZGlzcGxheTpibG9jazt3aWR0aDozcHg7aGVpZ2h0OjhweDtsZWZ0OjUwJTtiYWNrZ3JvdW5kLWNvbG9yOl9wcmltYXJ5X3RleHQ7dG9wOjQ4cHh9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW5leHQuZGF0aXVtLWFjdGl2ZSxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcHJldi5kYXRpdW0tYWN0aXZle3RyYW5zZm9ybTpzY2FsZSguOSk7b3BhY2l0eTouOX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcHJldntsZWZ0OjB9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXByZXY6YWZ0ZXIsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXByZXY6YmVmb3Jle21hcmdpbi1sZWZ0Oi0zcHh9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW5leHR7cmlnaHQ6MH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcHJldjpiZWZvcmV7dHJhbnNmb3JtOnJvdGF0ZSg0NWRlZykgdHJhbnNsYXRlWSgtMi42cHgpfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1wcmV2OmFmdGVye3RyYW5zZm9ybTpyb3RhdGUoLTQ1ZGVnKSB0cmFuc2xhdGVZKDIuNnB4KX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbmV4dDpiZWZvcmV7dHJhbnNmb3JtOnJvdGF0ZSg0NWRlZykgdHJhbnNsYXRlWSgyLjZweCl9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW5leHQ6YWZ0ZXJ7dHJhbnNmb3JtOnJvdGF0ZSgtNDVkZWcpIHRyYW5zbGF0ZVkoLTIuNnB4KX1kYXRpdW0tY29udGFpbmVyLl9pZHtkaXNwbGF5OmJsb2NrO3Bvc2l0aW9uOmFic29sdXRlO3dpZHRoOjI4MHB4O2ZvbnQtZmFtaWx5OlJvYm90byxBcmlhbDttYXJnaW4tdG9wOjJweDtmb250LXNpemU6MTZweH1kYXRpdW0tY29udGFpbmVyLl9pZCxkYXRpdW0tY29udGFpbmVyLl9pZCAqey13ZWJraXQtdG91Y2gtY2FsbG91dDpub25lOy13ZWJraXQtdXNlci1zZWxlY3Q6bm9uZTsta2h0bWwtdXNlci1zZWxlY3Q6bm9uZTstbW96LXVzZXItc2VsZWN0Om5vbmU7LW1zLXVzZXItc2VsZWN0Om5vbmU7LXdlYmtpdC10YXAtaGlnaGxpZ2h0LWNvbG9yOnRyYW5zcGFyZW50O2N1cnNvcjpkZWZhdWx0fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1idWJibGV7cG9zaXRpb246YWJzb2x1dGU7d2lkdGg6NTBweDtsaW5lLWhlaWdodDoyNnB4O3RleHQtYWxpZ246Y2VudGVyO2ZvbnQtc2l6ZToxNHB4O2JhY2tncm91bmQtY29sb3I6X3NlY29uZGFyeV9hY2NlbnQ7Zm9udC13ZWlnaHQ6NzAwO2JvcmRlci1yYWRpdXM6M3B4O21hcmdpbi1sZWZ0Oi0yNXB4O21hcmdpbi10b3A6LTMycHg7Y29sb3I6X3NlY29uZGFyeTt6LWluZGV4OjE7dHJhbnNmb3JtLW9yaWdpbjozMHB4IDM2cHg7dHJhbnNpdGlvbjplYXNlIGFsbCAuMnM7dHJhbnNmb3JtOnNjYWxlKC41KTtvcGFjaXR5OjB9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWJ1YmJsZTphZnRlcntjb250ZW50OicnO3Bvc2l0aW9uOmFic29sdXRlO2Rpc3BsYXk6YmxvY2s7d2lkdGg6MTBweDtoZWlnaHQ6MTBweDt0cmFuc2Zvcm06cm90YXRlKDQ1ZGVnKTtiYWNrZ3JvdW5kLWNvbG9yOl9zZWNvbmRhcnlfYWNjZW50O2xlZnQ6NTAlO3RvcDoyMHB4O21hcmdpbi1sZWZ0Oi01cHh9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWJ1YmJsZS5kYXRpdW0tYnViYmxlLXZpc2libGV7dHJhbnNmb3JtOnNjYWxlKDEpO29wYWNpdHk6MTt0cmFuc2l0aW9uLXRpbWluZy1mdW5jdGlvbjplYXNlO3RyYW5zaXRpb24tcHJvcGVydHk6YWxsO3RyYW5zaXRpb24tZHVyYXRpb246LjJzO3RyYW5zaXRpb24tZGVsYXk6LjJzfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXItY29udGFpbmVyLXdyYXBwZXJ7b3ZlcmZsb3c6aGlkZGVuO3Bvc2l0aW9uOmFic29sdXRlO2xlZnQ6LTdweDtyaWdodDotN3B4O3RvcDo4MHB4O2hlaWdodDoyNzBweDtkaXNwbGF5OmJsb2NrO3BvaW50ZXItZXZlbnRzOm5vbmV9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci1jb250YWluZXJ7cG9zaXRpb246cmVsYXRpdmU7d2lkdGg6Y2FsYygxMDAlIC0gMTRweCk7aGVpZ2h0OjI2MHB4O2JhY2tncm91bmQtY29sb3I6X3NlY29uZGFyeTtkaXNwbGF5OmJsb2NrO21hcmdpbjowIDdweCA3cHg7cGFkZGluZy10b3A6MjBweDt0cmFuc2Zvcm06dHJhbnNsYXRlWSgtMjcwcHgpO3BvaW50ZXItZXZlbnRzOmF1dG87Ym9yZGVyLWJvdHRvbS1yaWdodC1yYWRpdXM6M3B4O2JvcmRlci1ib3R0b20tbGVmdC1yYWRpdXM6M3B4O3RyYW5zaXRpb246YWxsIGVhc2UgLjRzO3RyYW5zaXRpb24tZGVsYXk6LjFzO292ZXJmbG93OmhpZGRlbn1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2Vye3Bvc2l0aW9uOmFic29sdXRlO2xlZnQ6MDtyaWdodDowO2JvdHRvbTowO2NvbG9yOl9zZWNvbmRhcnlfdGV4dDt0cmFuc2l0aW9uOmFsbCBlYXNlIC40c31kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1waWNrZXItbGVmdHt0cmFuc2Zvcm06dHJhbnNsYXRlWCgtMTAwJSkgc2NhbGUoMSk7cG9pbnRlci1ldmVudHM6bm9uZTt0cmFuc2l0aW9uLWRlbGF5OjBzfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLXBpY2tlci1yaWdodHt0cmFuc2Zvcm06dHJhbnNsYXRlWCgxMDAlKSBzY2FsZSgxKTtwb2ludGVyLWV2ZW50czpub25lO3RyYW5zaXRpb24tZGVsYXk6MHN9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tcGlja2VyLW91dHt0cmFuc2Zvcm06dHJhbnNsYXRlWCgwKSBzY2FsZSgxLjQpO29wYWNpdHk6MDtwb2ludGVyLWV2ZW50czpub25lO3RyYW5zaXRpb24tZGVsYXk6MHN9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tcGlja2VyLWlue3RyYW5zZm9ybTp0cmFuc2xhdGVYKDApIHNjYWxlKC42KTtvcGFjaXR5OjA7cG9pbnRlci1ldmVudHM6bm9uZTt0cmFuc2l0aW9uLWRlbGF5OjBzfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tb250aC1lbGVtZW50LGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS15ZWFyLWVsZW1lbnR7ZGlzcGxheTppbmxpbmUtYmxvY2s7d2lkdGg6MjUlO2xpbmUtaGVpZ2h0OjYwcHg7dGV4dC1hbGlnbjpjZW50ZXI7cG9zaXRpb246cmVsYXRpdmU7dHJhbnNpdGlvbjouMnMgZWFzZSBhbGx9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1vbnRoLWVsZW1lbnQuZGF0aXVtLXNlbGVjdGVkOmFmdGVyLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS15ZWFyLWVsZW1lbnQuZGF0aXVtLXNlbGVjdGVkOmFmdGVye2NvbnRlbnQ6Jyc7cG9zaXRpb246YWJzb2x1dGU7bGVmdDoyMHB4O3JpZ2h0OjIwcHg7dG9wOjUwJTttYXJnaW4tdG9wOjExcHg7aGVpZ2h0OjJweDtkaXNwbGF5OmJsb2NrO2JhY2tncm91bmQtY29sb3I6X3ByaW1hcnl9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1vbnRoLWVsZW1lbnQuZGF0aXVtLWFjdGl2ZSxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0teWVhci1lbGVtZW50LmRhdGl1bS1hY3RpdmV7dHJhbnNmb3JtOnNjYWxlKC45KTt0cmFuc2l0aW9uOm5vbmV9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1vbnRoLWVsZW1lbnQuZGF0aXVtLXNlbGVjdGVkOmFmdGVye2xlZnQ6MjVweDtyaWdodDoyNXB4fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1kYXRlLWhlYWRlcntkaXNwbGF5OmlubGluZS1ibG9jazt3aWR0aDo0MHB4O2xpbmUtaGVpZ2h0OjI4cHg7b3BhY2l0eTouNjtmb250LXdlaWdodDo3MDA7dGV4dC1hbGlnbjpjZW50ZXJ9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWRhdGUtZWxlbWVudHtkaXNwbGF5OmlubGluZS1ibG9jazt3aWR0aDo0MHB4O2xpbmUtaGVpZ2h0OjM2cHg7dGV4dC1hbGlnbjpjZW50ZXI7cG9zaXRpb246cmVsYXRpdmU7dHJhbnNpdGlvbjouMnMgZWFzZSBhbGx9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWRhdGUtZWxlbWVudC5kYXRpdW0tc2VsZWN0ZWQ6YWZ0ZXJ7Y29udGVudDonJztwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjEycHg7cmlnaHQ6MTJweDt0b3A6NTAlO21hcmdpbi10b3A6MTBweDtoZWlnaHQ6MnB4O2Rpc3BsYXk6YmxvY2s7YmFja2dyb3VuZC1jb2xvcjpfcHJpbWFyeX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tZGF0ZS1lbGVtZW50LmRhdGl1bS1hY3RpdmV7dHJhbnNmb3JtOnNjYWxlKC45KTt0cmFuc2l0aW9uOm5vbmV9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWRhdGUtZWxlbWVudDpub3QoW2RhdGl1bS1kYXRhXSl7b3BhY2l0eTouNjtwb2ludGVyLWV2ZW50czpub25lfVwiOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
