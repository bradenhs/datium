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
    OptionSanitizer.sanitizeMilitaryTime = function (militaryTime, dflt) {
        if (dflt === void 0) { dflt = false; }
        if (militaryTime === void 0)
            return dflt;
        if (typeof militaryTime !== 'boolean') {
            throw OptionException('The "militaryTime" option must be a boolean');
        }
        return militaryTime;
    };
    OptionSanitizer.sanitize = function (options, defaults) {
        var opts = {
            displayAs: OptionSanitizer.sanitizeDisplayAs(options['displayAs'], defaults.displayAs),
            minDate: OptionSanitizer.sanitizeMinDate(options['minDate'], defaults.minDate),
            maxDate: OptionSanitizer.sanitizeMaxDate(options['maxDate'], defaults.maxDate),
            defaultDate: OptionSanitizer.sanitizeDefaultDate(options['defaultDate'], defaults.defaultDate),
            theme: OptionSanitizer.sanitizeTheme(options['theme'], defaults.theme),
            militaryTime: OptionSanitizer.sanitizeMilitaryTime(options['militaryTime'], defaults.militaryTime)
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
    Common.prototype.getClientCoor = function (e) {
        if (e.clientX !== void 0) {
            return {
                x: e.clientX,
                y: e.clientY
            };
        }
        return {
            x: e.changedTouches[0].clientX,
            y: e.changedTouches[0].clientY
        };
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
            while (target !== null && !target.isEqualNode(parent)) {
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
    function drag() {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i - 0] = arguments[_i];
        }
        var dragging = false;
        var callbacks = params[params.length - 1];
        var startEvents = function (e) {
            dragging = true;
            if (callbacks.dragStart !== void 0) {
                callbacks.dragStart(e);
                e.preventDefault();
            }
            var listeners = [];
            listeners = listeners.concat(attachEvents(['touchmove', 'mousemove'], document, function (e) {
                if (dragging && callbacks.dragMove !== void 0) {
                    callbacks.dragMove(e);
                    e.preventDefault();
                }
            }));
            listeners = listeners.concat(attachEvents(['touchend', 'mouseup'], document, function (e) {
                if (dragging && callbacks.dragEnd !== void 0) {
                    callbacks.dragEnd(e);
                    e.preventDefault();
                }
                dragging = false;
                removeListeners(listeners);
            }));
        };
        if (params.length === 3) {
            attachEventsDelegate(['touchstart', 'mousedown'], params[0], params[1], startEvents);
        }
        else {
            attachEvents(['touchstart', 'mousedown'], params[0], startEvents);
        }
    }
    listen.drag = drag;
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
    function updateBubble(element, callback) {
        return attachEvents(['datium-update-bubble'], element, function (e) {
            callback(e.detail);
        });
    }
    listen.updateBubble = updateBubble;
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
    function updateBubble(element, data) {
        element.dispatchEvent(new CustomEvent('datium-update-bubble', {
            bubbles: false,
            cancelable: true,
            detail: data
        }));
    }
    trigger.updateBubble = updateBubble;
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
        this.viewchanged(this.date, this.level, true);
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
        this.date = date;
        this.level = level;
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
        var newLevel = this.levels.sort()[this.levels.indexOf(this.level) - 1];
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
                if (this.options.militaryTime) {
                    return this.getShortDays()[date.getDay()] + " " + this.pad(date.getDate()) + " <datium-variable>" + this.pad(date.getHours()) + "</datium-variable>";
                }
                else {
                    return this.getShortDays()[date.getDay()] + " " + this.pad(date.getDate()) + " <datium-variable>" + this.getHours(date) + this.getMeridiem(date) + "</datium-variable>";
                }
            case 4 /* MINUTE */:
                if (this.options.militaryTime) {
                    return this.pad(date.getHours()) + ":<datium-variable>" + this.pad(date.getMinutes()) + "</datium-variable>";
                }
                else {
                    return this.getHours(date) + ":<datium-variable>" + this.pad(date.getMinutes()) + "</datium-variable>" + this.getMeridiem(date);
                }
            case 5 /* SECOND */:
                if (this.options.militaryTime) {
                    return this.pad(date.getHours()) + ":" + this.pad(date.getMinutes()) + ":<datium-variable>" + this.pad(date.getSeconds()) + "</datium-variable>";
                }
                else {
                    return this.getHours(date) + ":" + this.pad(date.getMinutes()) + ":<datium-variable>" + this.pad(date.getSeconds()) + "</datium-variable>" + this.getMeridiem(date);
                }
        }
    };
    Header.prototype.updateOptions = function (options, levels) {
        var updateView = this.options !== void 0 && this.options.militaryTime !== options.militaryTime;
        this.options = options;
        this.levels = levels;
        if (updateView) {
            this.viewchanged(this.date, this.level);
        }
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
        listen.updateBubble(element, function (e) {
            _this.updateBubble(e.x, e.y, e.text);
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
        this.element = element;
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
        var _this = this;
        _super.call(this, element, container);
        this.rotation = 0;
        listen.drag(container, 'datium-time-drag', {
            dragStart: function (e) { return _this.dragStart(e); },
            dragMove: function (e) { return _this.dragMove(e); },
            dragEnd: function (e) { return _this.dragEnd(e); }
        });
    }
    HourPicker.prototype.dragStart = function (e) {
        trigger.openBubble(this.element, {
            x: -70 * Math.sin(this.rotation) + 140,
            y: 70 * Math.cos(this.rotation) + 175,
            text: this.getTime()
        });
        this.picker.classList.add('datium-dragging');
    };
    HourPicker.prototype.dragMove = function (e) {
        this.getTime();
        trigger.updateBubble(this.element, {
            x: -70 * Math.sin(this.rotation) + 140,
            y: 70 * Math.cos(this.rotation) + 175,
            text: this.getTime()
        });
        var point = this.fromCenter(this.getClientCoor(e));
        var r = Math.atan2(point.x, point.y);
        while (r - this.rotation > Math.PI)
            r -= 2 * Math.PI;
        while (this.rotation - r < -Math.PI)
            r += 2 * Math.PI;
        this.rotation = r;
        this.updateTimeDragArm();
    };
    HourPicker.prototype.getTime = function () {
        var time = 180 / Math.PI * this.rotation / 30 + 6;
        time = time > 11.5 ? 0 : Math.round(time);
        return time.toString();
    };
    HourPicker.prototype.dragEnd = function (e) {
        this.picker.classList.remove('datium-dragging');
    };
    HourPicker.prototype.fromCenter = function (point) {
        return {
            x: this.getCenter().x - point.x,
            y: point.y - this.getCenter().y
        };
    };
    HourPicker.prototype.getCenter = function () {
        return {
            x: this.picker.getBoundingClientRect().left + 140,
            y: this.picker.getBoundingClientRect().top + 120
        };
    };
    HourPicker.prototype.updateTimeDragArm = function () {
        this.timeDragArm.style.transform = "rotate(" + this.rotation + "rad)";
        this.hourHand.style.transform = "rotate(" + this.rotation + "rad)";
    };
    HourPicker.prototype.create = function (date, transition) {
        this.min = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        this.max = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        var iterator = new Date(this.min.valueOf());
        this.picker = document.createElement('datium-picker');
        this.picker.classList.add('datium-time-picker');
        this.transitionIn(transition, this.picker);
        for (var i = 0; i < 12; i++) {
            var tick = document.createElement('datium-tick');
            var tickLabel = document.createElement('datium-tick-label');
            tickLabel.innerHTML = (i === 0 ? 12 : i).toString();
            tick.appendChild(tickLabel);
            tick.style.transform = "rotate(" + (i * 30 + 180) + "deg)";
            tickLabel.style.transform = "rotate(" + (i * -30 + 180) + "deg)";
            this.picker.appendChild(tick);
        }
        this.hourHand = document.createElement('datium-hour-hand');
        this.timeDragArm = document.createElement('datium-time-drag-arm');
        this.timeDrag = document.createElement('datium-time-drag');
        this.timeDragArm.appendChild(this.timeDrag);
        this.picker.appendChild(this.timeDragArm);
        this.picker.appendChild(this.hourHand);
        this.attach();
        this.setSelectedDate(this.selectedDate);
    };
    HourPicker.prototype.setSelectedDate = function (date) {
        this.selectedDate = new Date(date.valueOf());
        this.rotation = date.getHours() * Math.PI / 6 - Math.PI;
        if (this.timeDragArm !== void 0 && this.hourHand !== void 0) {
            this.updateTimeDragArm();
        }
    };
    HourPicker.prototype.getHeight = function () {
        return 240;
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
var css = "datium-container._id datium-bubble,datium-container._id datium-header,datium-container._id datium-picker-container{box-shadow:0 3px 6px rgba(0,0,0,.16),0 3px 6px rgba(0,0,0,.23)}datium-container._id datium-header-wrapper{overflow:hidden;position:absolute;left:-7px;right:-7px;top:-7px;height:87px;display:block;pointer-events:none}datium-container._id datium-header{position:relative;display:block;overflow:hidden;height:100px;background-color:_primary;border-top-left-radius:3px;border-top-right-radius:3px;z-index:1;margin:7px;width:calc(100% - 14px);pointer-events:auto}datium-container._id datium-span-label-container{position:absolute;left:40px;right:40px;top:0;bottom:0;display:block;overflow:hidden;transition:.2s ease all;transform-origin:40px 40px}datium-container._id datium-span-label{position:absolute;font-size:18pt;color:_primary_text;font-weight:700;transform-origin:0 0;white-space:nowrap;transition:all .2s ease;text-transform:uppercase}datium-container._id datium-span-label.datium-top{transform:translateY(17px) scale(.66);width:151%;opacity:.6}datium-container._id datium-span-label.datium-bottom{transform:translateY(36px) scale(1);width:100%;opacity:1}datium-container._id datium-span-label.datium-top.datium-hidden{transform:translateY(5px) scale(.4);opacity:0}datium-container._id datium-span-label.datium-bottom.datium-hidden{transform:translateY(78px) scale(1.2);opacity:1}datium-container._id datium-span-label:after{content:'';display:inline-block;position:absolute;margin-left:10px;margin-top:6px;height:17px;width:17px;opacity:0;transition:all .2s ease;background:url(data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22_primary_text%22%3E%3Cpath%20d%3D%22M17%2015l-2%202-5-5%202-2z%22%20fill-rule%3D%22evenodd%22%2F%3E%3Cpath%20d%3D%22M7%200a7%207%200%200%200-7%207%207%207%200%200%200%207%207%207%207%200%200%200%207-7%207%207%200%200%200-7-7zm0%202a5%205%200%200%201%205%205%205%205%200%200%201-5%205%205%205%200%200%201-5-5%205%205%200%200%201%205-5z%22%2F%3E%3Cpath%20d%3D%22M4%206h6v2H4z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E)}datium-container._id datium-bubble,datium-container._id datium-bubble.datium-bubble-visible{transition-property:transform,opacity;transition-timing-function:ease;transition-duration:.2s}datium-container._id datium-span-label.datium-top:after{opacity:1}datium-container._id datium-span-label datium-variable{color:_primary;font-size:14pt;padding:0 4px;margin:0 2px;top:-2px;position:relative}datium-container._id datium-span-label datium-variable:before{content:'';position:absolute;left:0;top:0;right:0;bottom:0;border-radius:5px;background-color:_primary_text;z-index:-1;opacity:.7}datium-container._id datium-next,datium-container._id datium-prev{position:absolute;width:40px;top:0;bottom:0;transform-origin:20px 52px}datium-container._id datium-next:after,datium-container._id datium-next:before,datium-container._id datium-prev:after,datium-container._id datium-prev:before{content:'';position:absolute;display:block;width:3px;height:8px;left:50%;background-color:_primary_text;top:48px}datium-container._id datium-next.datium-active,datium-container._id datium-prev.datium-active{transform:scale(.9);opacity:.9}datium-container._id datium-prev{left:0}datium-container._id datium-prev:after,datium-container._id datium-prev:before{margin-left:-3px}datium-container._id datium-next{right:0}datium-container._id datium-prev:before{transform:rotate(45deg) translateY(-2.6px)}datium-container._id datium-prev:after{transform:rotate(-45deg) translateY(2.6px)}datium-container._id datium-next:before{transform:rotate(45deg) translateY(2.6px)}datium-container._id datium-next:after{transform:rotate(-45deg) translateY(-2.6px)}datium-container._id{display:block;position:absolute;width:280px;font-family:Roboto,Arial;margin-top:2px;font-size:16px}datium-container._id,datium-container._id *{-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;-webkit-tap-highlight-color:transparent;cursor:default}datium-container._id datium-bubble{position:absolute;width:50px;line-height:26px;text-align:center;font-size:14px;background-color:_secondary_accent;font-weight:700;border-radius:3px;margin-left:-25px;margin-top:-32px;color:_secondary;z-index:1;transform-origin:30px 36px;transition-delay:0;transform:scale(.5);opacity:0}datium-container._id datium-bubble:after{content:'';position:absolute;display:block;width:10px;height:10px;transform:rotate(45deg);background-color:_secondary_accent;left:50%;top:20px;margin-left:-5px}datium-container._id datium-bubble.datium-bubble-visible{transform:scale(1);opacity:1;transition-delay:.2s}datium-container._id datium-picker-container-wrapper{overflow:hidden;position:absolute;left:-7px;right:-7px;top:80px;height:270px;display:block;pointer-events:none}datium-container._id datium-picker-container{position:relative;width:calc(100% - 14px);height:260px;background-color:_secondary;display:block;margin:0 7px 7px;padding-top:20px;transform:translateY(-270px);pointer-events:auto;border-bottom-right-radius:3px;border-bottom-left-radius:3px;transition:all ease .4s;transition-delay:.1s;overflow:hidden}datium-container._id datium-picker{position:absolute;left:0;right:0;bottom:0;color:_secondary_text;transition:all ease .4s}datium-container._id datium-picker.datium-picker-left{transform:translateX(-100%) scale(1);pointer-events:none;transition-delay:0s}datium-container._id datium-picker.datium-picker-right{transform:translateX(100%) scale(1);pointer-events:none;transition-delay:0s}datium-container._id datium-picker.datium-picker-out{transform:translateX(0) scale(1.4);opacity:0;pointer-events:none;transition-delay:0s}datium-container._id datium-picker.datium-picker-in{transform:translateX(0) scale(.6);opacity:0;pointer-events:none;transition-delay:0s}datium-container._id datium-month-element,datium-container._id datium-year-element{display:inline-block;width:25%;line-height:60px;text-align:center;position:relative;transition:.2s ease all}datium-container._id datium-month-element.datium-selected:after,datium-container._id datium-year-element.datium-selected:after{content:'';position:absolute;left:20px;right:20px;top:50%;margin-top:11px;height:2px;display:block;background-color:_primary}datium-container._id datium-month-element.datium-active,datium-container._id datium-year-element.datium-active{transform:scale(.9);transition:none}datium-container._id datium-month-element.datium-selected:after{left:25px;right:25px}datium-container._id datium-date-header{display:inline-block;width:40px;line-height:28px;opacity:.6;font-weight:700;text-align:center}datium-container._id datium-date-element{display:inline-block;width:40px;line-height:36px;text-align:center;position:relative;transition:.2s ease all}datium-container._id datium-date-element.datium-selected:after{content:'';position:absolute;left:12px;right:12px;top:50%;margin-top:10px;height:2px;display:block;background-color:_primary}datium-container._id datium-date-element.datium-active{transform:scale(.9);transition:none}datium-container._id datium-date-element:not([datium-data]){opacity:.6;pointer-events:none}datium-container._id datium-picker.datium-time-picker{height:240px}datium-container._id datium-picker.datium-time-picker:before{content:'';width:140px;height:140px;position:absolute;border:1px solid;left:50%;top:50%;margin-left:-71px;margin-top:-71px;border-radius:70px;opacity:.5}datium-container._id datium-picker.datium-time-picker:after{content:'';width:4px;height:4px;margin-left:-4px;margin-top:-4px;top:50%;left:50%;border-radius:4px;position:absolute;border:2px solid;border-color:_secondary_accent;background-color:_secondary;box-shadow:0 0 0 2px _secondary}datium-container._id datium-tick{position:absolute;left:50%;top:50%;width:2px;height:70px;margin-left:-1px;transform-origin:1px 0}datium-container._id datium-tick:after{content:'';position:absolute;width:2px;height:6px;background-color:_secondary_text;bottom:-4px;opacity:.5}datium-container._id datium-tick-label{position:absolute;bottom:-50px;left:-24px;display:block;line-height:50px;width:50px;border-radius:25px;text-align:center;font-size:14px}datium-container._id datium-picker.datium-time-picker.datium-dragging datium-hour-hand,datium-container._id datium-picker.datium-time-picker.datium-dragging datium-time-drag-arm{transition:none}datium-container._id datium-hour-hand{position:absolute;display:block;width:0;height:0;left:50%;top:50%;transform-origin:3px 3px;margin-left:-3px;margin-top:-3px;border-top:30px solid _secondary_accent;border-left:3px solid transparent;border-right:3px solid transparent;border-top-left-radius:3px;border-top-right-radius:3px;transition:.2s ease all}datium-container._id datium-time-drag-arm{width:2px;height:70px;position:absolute;left:50%;top:50%;margin-left:-1px;transform-origin:1px 0;transform:rotate(45deg);transition:.2s ease all}datium-container._id datium-time-drag-arm:after,datium-container._id datium-time-drag-arm:before{content:'';border:4px solid transparent;position:absolute;bottom:-4px;left:12px;border-left-color:_secondary_accent;transform-origin:-11px 4px}datium-container._id datium-time-drag-arm:after{transform:rotate(180deg)}datium-container._id datium-time-drag{display:block;position:absolute;width:50px;height:50px;top:100%;margin-top:-25px;margin-left:-24px;border-radius:25px}datium-container._id datium-time-drag:after{content:'';width:10px;height:10px;position:absolute;left:50%;top:50%;margin-left:-7px;margin-top:-7px;background-color:_secondary_accent;border:2px solid;border-color:_secondary;box-shadow:0 0 0 2px _secondary_accent;border-radius:10px}datium-container._id datium-time-drag.datium-active:after{width:8px;height:8px;border:3px solid;border-color:_secondary}";
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRhdGl1bS50cyIsIkRhdGl1bUludGVybmFscy50cyIsIk9wdGlvblNhbml0aXplci50cyIsImNvbW1vbi9Db21tb24udHMiLCJjb21tb24vQ3VzdG9tRXZlbnRQb2x5ZmlsbC50cyIsImNvbW1vbi9FdmVudHMudHMiLCJpbnB1dC9EYXRlUGFydHMudHMiLCJpbnB1dC9JbnB1dC50cyIsImlucHV0L0tleWJvYXJkRXZlbnRIYW5kbGVyLnRzIiwiaW5wdXQvTW91c2VFdmVudEhhbmRsZXIudHMiLCJpbnB1dC9QYXJzZXIudHMiLCJpbnB1dC9QYXN0ZUV2ZW50SGFuZGxlci50cyIsInBpY2tlci9IZWFkZXIudHMiLCJwaWNrZXIvUGlja2VyTWFuYWdlci50cyIsInBpY2tlci9odG1sL2hlYWRlci50cyIsInBpY2tlci9waWNrZXJzL1BpY2tlci50cyIsInBpY2tlci9waWNrZXJzL0RhdGVQaWNrZXIudHMiLCJwaWNrZXIvcGlja2Vycy9Ib3VyUGlja2VyLnRzIiwicGlja2VyL3BpY2tlcnMvTWludXRlUGlja2VyLnRzIiwicGlja2VyL3BpY2tlcnMvTW9udGhQaWNrZXIudHMiLCJwaWNrZXIvcGlja2Vycy9TZWNvbmRQaWNrZXIudHMiLCJwaWNrZXIvcGlja2Vycy9ZZWFyUGlja2VyLnRzIiwicGlja2VyL3N0eWxlcy9jc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBTSxNQUFPLENBQUMsUUFBUSxDQUFDLEdBQUc7SUFFdEIsZ0JBQVksT0FBd0IsRUFBRSxPQUFnQjtRQUNsRCxJQUFJLFNBQVMsR0FBRyxJQUFJLGVBQWUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDdEQsSUFBSSxDQUFDLGFBQWEsR0FBRyxVQUFDLE9BQWdCLElBQUssT0FBQSxTQUFTLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFoQyxDQUFnQyxDQUFDO0lBQ2hGLENBQUM7SUFDTCxhQUFDO0FBQUQsQ0FOMEIsQUFNekIsR0FBQSxDQUFBO0FDREQ7SUFNSSx5QkFBb0IsT0FBd0IsRUFBRSxPQUFnQjtRQU5sRSxpQkEyQ0M7UUFyQ3VCLFlBQU8sR0FBUCxPQUFPLENBQWlCO1FBTHBDLFlBQU8sR0FBaUIsRUFBRSxDQUFDO1FBTS9CLEVBQUUsQ0FBQyxDQUFDLE9BQU8sS0FBSyxLQUFLLENBQUMsQ0FBQztZQUFDLE1BQU0scUJBQXFCLENBQUM7UUFDcEQsT0FBTyxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFNUMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRWhELElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFNUIsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsVUFBQyxDQUFDLElBQUssT0FBQSxLQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQXBDLENBQW9DLENBQUMsQ0FBQztRQUVsRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEVBQUUsWUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFTSw4QkFBSSxHQUFYLFVBQVksSUFBUyxFQUFFLEtBQVcsRUFBRSxNQUFxQjtRQUFyQixzQkFBcUIsR0FBckIsYUFBcUI7UUFDckQsRUFBRSxDQUFDLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxDQUFDO1lBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFFdkMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEtBQUssS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNyRixJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUNwRCxDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEtBQUssS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNyRixJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUNwRCxDQUFDO1FBRUQsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQzlCLElBQUksRUFBRSxJQUFJO1lBQ1YsS0FBSyxFQUFFLEtBQUs7WUFDWixNQUFNLEVBQUUsTUFBTTtTQUNqQixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sdUNBQWEsR0FBcEIsVUFBcUIsVUFBNkI7UUFBN0IsMEJBQTZCLEdBQTdCLGFBQTJCLEVBQUU7UUFDOUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxlQUFlLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbEUsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO0lBQzNFLENBQUM7SUFDTCxzQkFBQztBQUFELENBM0NBLEFBMkNDLElBQUE7QUNoREQseUJBQXlCLEdBQVU7SUFDL0IsTUFBTSxDQUFDLGtDQUFnQyxHQUFHLDhEQUEyRCxDQUFDO0FBQzFHLENBQUM7QUFFRDtJQUFBO0lBcUdBLENBQUM7SUFqR1UsaUNBQWlCLEdBQXhCLFVBQXlCLFNBQWEsRUFBRSxJQUFpQztRQUFqQyxvQkFBaUMsR0FBakMsMEJBQWlDO1FBQ3JFLEVBQUUsQ0FBQyxDQUFDLFNBQVMsS0FBSyxLQUFLLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDdEMsRUFBRSxDQUFDLENBQUMsT0FBTyxTQUFTLEtBQUssUUFBUSxDQUFDO1lBQUMsTUFBTSxlQUFlLENBQUMseUNBQXlDLENBQUMsQ0FBQztRQUNwRyxNQUFNLENBQUMsU0FBUyxDQUFDO0lBQ3JCLENBQUM7SUFFTSwrQkFBZSxHQUF0QixVQUF1QixPQUFXLEVBQUUsSUFBa0I7UUFBbEIsb0JBQWtCLEdBQWxCLFlBQWlCLENBQUM7UUFDbEQsRUFBRSxDQUFDLENBQUMsT0FBTyxLQUFLLEtBQUssQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNwQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQywwQkFBMEI7SUFDeEQsQ0FBQztJQUVNLCtCQUFlLEdBQXRCLFVBQXVCLE9BQVcsRUFBRSxJQUFrQjtRQUFsQixvQkFBa0IsR0FBbEIsWUFBaUIsQ0FBQztRQUNsRCxFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssS0FBSyxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ3BDLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLHVCQUF1QjtJQUNyRCxDQUFDO0lBRU0sbUNBQW1CLEdBQTFCLFVBQTJCLFdBQWUsRUFBRSxJQUF5QjtRQUF6QixvQkFBeUIsR0FBekIsT0FBWSxJQUFJLENBQUMsUUFBUTtRQUNqRSxFQUFFLENBQUMsQ0FBQyxXQUFXLEtBQUssS0FBSyxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ3hDLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLHNCQUFzQjtJQUN4RCxDQUFDO0lBRU0sNkJBQWEsR0FBcEIsVUFBcUIsS0FBUztRQUMxQixJQUFJLFFBQVEsR0FBRyx5QkFBeUIsQ0FBQztRQUN6QyxJQUFJLE1BQU0sR0FBRyx5QkFBeUIsQ0FBQztRQUN2QyxJQUFJLEdBQUcsR0FBRywyRUFBMkUsQ0FBQztRQUN0RixJQUFJLElBQUksR0FBRyxzR0FBc0csQ0FBQztRQUNsSCxJQUFJLGtCQUFrQixHQUFHLElBQUksTUFBTSxDQUFDLFFBQU0sUUFBUSxXQUFNLE1BQU0sV0FBTSxHQUFHLFdBQU0sSUFBSSxRQUFLLENBQUMsQ0FBQztRQUV4RixFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssS0FBSyxDQUFDLENBQUM7WUFBQyxNQUFNLGVBQWUsQ0FBQyx1R0FBdUcsQ0FBQyxDQUFDO1FBQ3JKLEVBQUUsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQUMsTUFBTSxlQUFlLENBQUMsdURBQXVELENBQUMsQ0FBQztRQUNwSCxNQUFNLENBQVMsS0FBSyxDQUFDO0lBQ3pCLENBQUM7SUFFTSw2QkFBYSxHQUFwQixVQUFxQixLQUFTLEVBQUUsSUFBcUI7UUFBckIsb0JBQXFCLEdBQXJCLGlCQUFxQjtRQUNqRCxFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssS0FBSyxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUN6RSxFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQzVCLE1BQU0sQ0FBQSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ2YsS0FBSyxPQUFPO29CQUNSLE1BQU0sQ0FBUzt3QkFDWCxPQUFPLEVBQUUsTUFBTTt3QkFDZixZQUFZLEVBQUUsTUFBTTt3QkFDcEIsU0FBUyxFQUFFLE1BQU07d0JBQ2pCLGNBQWMsRUFBRSxNQUFNO3dCQUN0QixnQkFBZ0IsRUFBRSxNQUFNO3FCQUMzQixDQUFBO2dCQUNMLEtBQUssTUFBTTtvQkFDUCxNQUFNLENBQVM7d0JBQ1gsT0FBTyxFQUFFLE1BQU07d0JBQ2YsWUFBWSxFQUFFLE1BQU07d0JBQ3BCLFNBQVMsRUFBRSxNQUFNO3dCQUNqQixjQUFjLEVBQUUsTUFBTTt3QkFDdEIsZ0JBQWdCLEVBQUUsTUFBTTtxQkFDM0IsQ0FBQTtnQkFDTCxLQUFLLFVBQVU7b0JBQ1gsTUFBTSxDQUFTO3dCQUNYLE9BQU8sRUFBRSxTQUFTO3dCQUNsQixZQUFZLEVBQUUsTUFBTTt3QkFDcEIsU0FBUyxFQUFFLE1BQU07d0JBQ2pCLGNBQWMsRUFBRSxNQUFNO3dCQUN0QixnQkFBZ0IsRUFBRSxTQUFTO3FCQUM5QixDQUFBO2dCQUNMO29CQUNJLE1BQU0sMEJBQTBCLENBQUM7WUFDckMsQ0FBQztRQUNMLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNuQyxNQUFNLENBQVU7Z0JBQ1osT0FBTyxFQUFFLGVBQWUsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUN4RCxTQUFTLEVBQUUsZUFBZSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQzVELFlBQVksRUFBRSxlQUFlLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDbEUsY0FBYyxFQUFFLGVBQWUsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQ3RFLGdCQUFnQixFQUFFLGVBQWUsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7YUFDN0UsQ0FBQTtRQUNMLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLE1BQU0sZUFBZSxDQUFDLDZDQUE2QyxDQUFDLENBQUM7UUFDekUsQ0FBQztJQUNMLENBQUM7SUFFTSxvQ0FBb0IsR0FBM0IsVUFBNEIsWUFBZ0IsRUFBRSxJQUFvQjtRQUFwQixvQkFBb0IsR0FBcEIsWUFBb0I7UUFDOUQsRUFBRSxDQUFDLENBQUMsWUFBWSxLQUFLLEtBQUssQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztRQUN6QyxFQUFFLENBQUMsQ0FBQyxPQUFPLFlBQVksS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sZUFBZSxDQUFDLDZDQUE2QyxDQUFDLENBQUM7UUFDekUsQ0FBQztRQUNELE1BQU0sQ0FBVSxZQUFZLENBQUM7SUFDakMsQ0FBQztJQUVNLHdCQUFRLEdBQWYsVUFBZ0IsT0FBZ0IsRUFBRSxRQUFpQjtRQUMvQyxJQUFJLElBQUksR0FBWTtZQUNoQixTQUFTLEVBQUUsZUFBZSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBRSxRQUFRLENBQUMsU0FBUyxDQUFDO1lBQ3RGLE9BQU8sRUFBRSxlQUFlLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxRQUFRLENBQUMsT0FBTyxDQUFDO1lBQzlFLE9BQU8sRUFBRSxlQUFlLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxRQUFRLENBQUMsT0FBTyxDQUFDO1lBQzlFLFdBQVcsRUFBRSxlQUFlLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxXQUFXLENBQUM7WUFDOUYsS0FBSyxFQUFFLGVBQWUsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUM7WUFDdEUsWUFBWSxFQUFFLGVBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLEVBQUUsUUFBUSxDQUFDLFlBQVksQ0FBQztTQUNyRyxDQUFBO1FBRUQsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNoQixDQUFDO0lBbEdNLHdCQUFRLEdBQVEsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQW1HdEMsc0JBQUM7QUFBRCxDQXJHQSxBQXFHQyxJQUFBO0FDekdEO0lBQUE7SUE2REEsQ0FBQztJQTVEYSwwQkFBUyxHQUFuQjtRQUNJLE1BQU0sQ0FBQyxDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDdEksQ0FBQztJQUVTLCtCQUFjLEdBQXhCO1FBQ0ksTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNoRyxDQUFDO0lBRVMsd0JBQU8sR0FBakI7UUFDSSxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUMxRixDQUFDO0lBRVMsNkJBQVksR0FBdEI7UUFDSSxNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM3RCxDQUFDO0lBRVMsNEJBQVcsR0FBckIsVUFBc0IsSUFBUztRQUMzQixNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDMUUsQ0FBQztJQUVTLHlCQUFRLEdBQWxCLFVBQW1CLElBQVM7UUFDeEIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzFCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7WUFBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ3hCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7WUFBQyxHQUFHLElBQUksRUFBRSxDQUFDO1FBQ3hCLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDMUIsQ0FBQztJQUVTLDBCQUFTLEdBQW5CLFVBQW9CLElBQVM7UUFDekIsTUFBTSxDQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFDLEVBQUUsQ0FBQyxHQUFDLEVBQUUsV0FBTSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFDLEVBQUUsQ0FBQyxHQUFDLEVBQUksQ0FBQztJQUNwRyxDQUFDO0lBRVMsNEJBQVcsR0FBckIsVUFBc0IsSUFBUztRQUMzQixNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQzlDLENBQUM7SUFFUyxvQkFBRyxHQUFiLFVBQWMsR0FBaUIsRUFBRSxJQUFlO1FBQWYsb0JBQWUsR0FBZixRQUFlO1FBQzVDLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN6QixPQUFNLEdBQUcsQ0FBQyxNQUFNLEdBQUcsSUFBSTtZQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ3pDLE1BQU0sQ0FBQyxHQUFHLENBQUM7SUFDZixDQUFDO0lBRVMscUJBQUksR0FBZCxVQUFlLEdBQVU7UUFDckIsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDdEMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNwQyxDQUFDO1FBQ0QsTUFBTSxDQUFDLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFFUyw4QkFBYSxHQUF2QixVQUF3QixDQUFLO1FBQ3pCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLE1BQU0sQ0FBQztnQkFDSCxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU87Z0JBQ1osQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPO2FBQ2YsQ0FBQTtRQUNMLENBQUM7UUFDRCxNQUFNLENBQUM7WUFDSCxDQUFDLEVBQUUsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPO1lBQzlCLENBQUMsRUFBRSxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU87U0FDakMsQ0FBQTtJQUNMLENBQUM7SUFDTCxhQUFDO0FBQUQsQ0E3REEsQUE2REMsSUFBQTtBQzdERCxXQUFXLEdBQUcsQ0FBQztJQUNYO1FBQ0ksSUFBSSxDQUFDO1lBQ0QsSUFBSSxXQUFXLEdBQUcsSUFBSSxXQUFXLENBQUMsR0FBRyxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMvRCxNQUFNLENBQUUsR0FBRyxLQUFLLFdBQVcsQ0FBQyxJQUFJLElBQUksR0FBRyxLQUFLLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3JFLENBQUU7UUFBQSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2IsQ0FBQztRQUNELE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVELEVBQUUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNkLE1BQU0sQ0FBTSxXQUFXLENBQUM7SUFDNUIsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLFFBQVEsQ0FBQyxXQUFXLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQztRQUNwRCxVQUFVO1FBQ1YsTUFBTSxDQUFNLFVBQVMsSUFBVyxFQUFFLE1BQXNCO1lBQ3BELElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDNUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDVCxDQUFDLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzlFLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixDQUFDLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDbEQsQ0FBQztZQUNELE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDYixDQUFDLENBQUE7SUFDTCxDQUFDO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDSixVQUFVO1FBQ1YsTUFBTSxDQUFNLFVBQVMsSUFBVyxFQUFFLE1BQXNCO1lBQ3BELElBQUksQ0FBQyxHQUFTLFFBQVMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQzVDLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ2QsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDVCxDQUFDLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3BDLENBQUMsQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDMUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1lBQzdCLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixDQUFDLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztnQkFDbEIsQ0FBQyxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7Z0JBQ3JCLENBQUMsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLENBQUM7WUFDdEIsQ0FBQztZQUNELE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDYixDQUFDLENBQUE7SUFDTCxDQUFDO0FBQ0wsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQzVCTCxJQUFVLE1BQU0sQ0FpUWY7QUFqUUQsV0FBVSxNQUFNLEVBQUMsQ0FBQztJQUNkLElBQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMsT0FBTyxJQUFJLFFBQVEsQ0FBQyxlQUFlLENBQUMsaUJBQWlCLENBQUM7SUFFN0YsNkJBQTZCLE1BQWMsRUFBRSxnQkFBdUIsRUFBRSxRQUEyQztRQUM3RyxNQUFNLENBQUMsVUFBQyxDQUF1QjtZQUMzQixJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsVUFBVSxJQUFhLENBQUMsQ0FBQyxNQUFNLENBQUM7WUFDL0MsT0FBTSxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO2dCQUNuRCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDekMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNaLE1BQU0sQ0FBQztnQkFDWCxDQUFDO2dCQUNELE1BQU0sR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDO1lBQ2xDLENBQUM7UUFDTCxDQUFDLENBQUE7SUFDTCxDQUFDO0lBRUQsOEJBQThCLE1BQWUsRUFBRSxNQUFjLEVBQUUsZ0JBQXVCLEVBQUUsUUFBMkM7UUFDL0gsSUFBSSxTQUFTLEdBQXdCLEVBQUUsQ0FBQztRQUN4QyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLElBQUksT0FBSyxHQUFVLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUUvQixJQUFJLFdBQVcsR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDMUUsU0FBUyxDQUFDLElBQUksQ0FBQztnQkFDWCxPQUFPLEVBQUUsTUFBTTtnQkFDZixTQUFTLEVBQUUsV0FBVztnQkFDdEIsS0FBSyxFQUFFLE9BQUs7YUFDZixDQUFDLENBQUM7WUFFSCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ2hELENBQUM7UUFDRCxNQUFNLENBQUMsU0FBUyxDQUFDO0lBQ3JCLENBQUM7SUFFRCxzQkFBc0IsTUFBZSxFQUFFLE9BQStCLEVBQUUsUUFBeUI7UUFDN0YsSUFBSSxTQUFTLEdBQXdCLEVBQUUsQ0FBQztRQUN4QyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQUMsS0FBSztZQUNqQixTQUFTLENBQUMsSUFBSSxDQUFDO2dCQUNYLE9BQU8sRUFBRSxPQUFPO2dCQUNoQixTQUFTLEVBQUUsUUFBUTtnQkFDbkIsS0FBSyxFQUFFLEtBQUs7YUFDZixDQUFDLENBQUM7WUFDSCxPQUFPLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzlDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLFNBQVMsQ0FBQztJQUNyQixDQUFDO0lBRUQsU0FBUztJQUVULGVBQXNCLE9BQStCLEVBQUUsUUFBZ0M7UUFDbkYsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLE9BQU8sRUFBRSxVQUFDLENBQUM7WUFDdEMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUplLFlBQUssUUFJcEIsQ0FBQTtJQUlEO1FBQXFCLGdCQUFlO2FBQWYsV0FBZSxDQUFmLHNCQUFlLENBQWYsSUFBZTtZQUFmLCtCQUFlOztRQUNoQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEIsTUFBTSxDQUFDLG9CQUFvQixDQUFDLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBQyxDQUFDO2dCQUM3RSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQU0sQ0FBQyxDQUFDLENBQUM7WUFDdEIsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFDLENBQUM7Z0JBQzFELE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBTSxDQUFDLENBQUMsQ0FBQztZQUN0QixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7SUFDTCxDQUFDO0lBVmUsV0FBSSxPQVVuQixDQUFBO0lBQUEsQ0FBQztJQUVGLFlBQW1CLE9BQStCLEVBQUUsUUFBZ0M7UUFDaEYsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsRUFBRSxPQUFPLEVBQUUsVUFBQyxDQUFDO1lBQ3BELFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFKZSxTQUFFLEtBSWpCLENBQUE7SUFFRCxtQkFBMEIsT0FBK0IsRUFBRSxRQUFnQztRQUN2RixNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsV0FBVyxDQUFDLEVBQUUsT0FBTyxFQUFFLFVBQUMsQ0FBQztZQUMxQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBSmUsZ0JBQVMsWUFJeEIsQ0FBQTtJQUVELGlCQUF3QixPQUErQixFQUFFLFFBQWdDO1FBQ3JGLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxTQUFTLENBQUMsRUFBRSxPQUFPLEVBQUUsVUFBQyxDQUFDO1lBQ3hDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFKZSxjQUFPLFVBSXRCLENBQUE7SUFFRCxlQUFzQixPQUErQixFQUFFLFFBQWdDO1FBQ25GLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxPQUFPLEVBQUUsVUFBQyxDQUFDO1lBQ3RDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFKZSxZQUFLLFFBSXBCLENBQUE7SUFJRDtRQUFvQixnQkFBZTthQUFmLFdBQWUsQ0FBZixzQkFBZSxDQUFmLElBQWU7WUFBZiwrQkFBZTs7UUFDL0IsSUFBSSxXQUFrQixFQUFFLFdBQWtCLENBQUM7UUFFM0MsSUFBSSxXQUFXLEdBQUcsVUFBQyxDQUFZO1lBQzNCLFdBQVcsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztZQUNuQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFDdkMsQ0FBQyxDQUFBO1FBRUQsSUFBSSxTQUFTLEdBQUcsVUFBQyxDQUFZLEVBQUUsUUFBMkI7WUFDdEQsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzlCLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDbkIsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNaLE1BQU0sQ0FBQztZQUNYLENBQUM7WUFFRCxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUM7WUFDdEQsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsV0FBVyxDQUFDO1lBRXRELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssR0FBRyxLQUFLLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDaEQsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUNuQixRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEIsQ0FBQztRQUNMLENBQUMsQ0FBQTtRQUVELElBQUksU0FBUyxHQUF3QixFQUFFLENBQUM7UUFFeEMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLFNBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLENBQUMsWUFBWSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ3RHLFNBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBQyxDQUFZO2dCQUN4RyxTQUFTLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDUixDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QixTQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxZQUFZLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUNuRixTQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLFVBQUMsQ0FBWTtnQkFDckYsU0FBUyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1IsQ0FBQztRQUNELE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDckIsQ0FBQztJQXRDZSxVQUFHLE1Bc0NsQixDQUFBO0lBRUQsZUFBZSxPQUFlLEVBQUUsU0FBZ0IsRUFBRSxRQUEyQjtRQUN6RSxJQUFJLFdBQWtCLEVBQUUsV0FBa0IsRUFBRSxTQUFnQixDQUFDO1FBQzdELElBQUksaUJBQW9DLENBQUM7UUFDekMsSUFBSSxpQkFBeUIsQ0FBQztRQUU5QixZQUFZLENBQUMsQ0FBQyxZQUFZLENBQUMsRUFBRSxPQUFPLEVBQUUsVUFBQyxDQUFZO1lBQy9DLFdBQVcsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztZQUNuQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7WUFDbkMsU0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDakMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDO1lBQzFCLGlCQUFpQixHQUFHLFlBQVksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxFQUFFLFFBQVEsRUFBRSxVQUFDLENBQVk7Z0JBQ25FLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsV0FBVyxDQUFDLENBQUM7Z0JBQ2hFLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsV0FBVyxDQUFDLENBQUM7Z0JBQ2hFLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxLQUFLLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQzlCLGlCQUFpQixHQUFHLElBQUksQ0FBQztnQkFDN0IsQ0FBQztnQkFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLEtBQUssSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDckMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDO2dCQUM5QixDQUFDO2dCQUNELEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLEdBQUcsU0FBUyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ3pDLGlCQUFpQixHQUFHLEtBQUssQ0FBQztnQkFDOUIsQ0FBQztnQkFDRCxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7b0JBQ3BCLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDdkIsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1YsQ0FBQyxDQUFDLENBQUM7UUFFSCxZQUFZLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxPQUFPLEVBQUUsVUFBQyxDQUFZO1lBQzdDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbkYsRUFBRSxDQUFDLENBQUMsV0FBVyxLQUFLLEtBQUssQ0FBQyxJQUFJLFdBQVcsS0FBSyxLQUFLLENBQUMsQ0FBQztnQkFBQyxNQUFNLENBQUM7WUFDN0QsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxTQUFTLEdBQUcsR0FBRyxDQUFDO2dCQUFDLE1BQU0sQ0FBQztZQUNuRCxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUM7WUFDdEQsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsV0FBVyxDQUFDO1lBQ3RELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzVELENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDbkIsRUFBRSxDQUFDLENBQUMsU0FBUyxLQUFLLE1BQU0sSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDcEMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNoQixDQUFDO2dCQUNELEVBQUUsQ0FBQyxDQUFDLFNBQVMsS0FBSyxPQUFPLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3JDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDaEIsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxtQkFBMEIsT0FBZSxFQUFFLFFBQTJCO1FBQ2xFLEtBQUssQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFGZSxnQkFBUyxZQUV4QixDQUFBO0lBRUQsb0JBQTJCLE9BQWUsRUFBRSxRQUEyQjtRQUNuRSxLQUFLLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBRmUsaUJBQVUsYUFFekIsQ0FBQTtJQUlEO1FBQXFCLGdCQUFlO2FBQWYsV0FBZSxDQUFmLHNCQUFlLENBQWYsSUFBZTtZQUFmLCtCQUFlOztRQUNoQyxJQUFJLFFBQVEsR0FBVyxLQUFLLENBQUM7UUFFN0IsSUFBSSxTQUFTLEdBQWtCLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXZELElBQUksV0FBVyxHQUFHLFVBQUMsQ0FBd0I7WUFDdkMsUUFBUSxHQUFHLElBQUksQ0FBQztZQUNoQixFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDakMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkIsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3ZCLENBQUM7WUFFRCxJQUFJLFNBQVMsR0FBd0IsRUFBRSxDQUFDO1lBRXhDLFNBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsRUFBRSxRQUFRLEVBQUUsVUFBQyxDQUF3QjtnQkFDckcsRUFBRSxDQUFDLENBQUMsUUFBUSxJQUFJLFNBQVMsQ0FBQyxRQUFRLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM1QyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN0QixDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ3ZCLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osU0FBUyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxVQUFDLENBQXdCO2dCQUNsRyxFQUFFLENBQUMsQ0FBQyxRQUFRLElBQUksU0FBUyxDQUFDLE9BQU8sS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzNDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3JCLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDdkIsQ0FBQztnQkFDRCxRQUFRLEdBQUcsS0FBSyxDQUFDO2dCQUNqQixlQUFlLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDL0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNSLENBQUMsQ0FBQTtRQUVELEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QixvQkFBb0IsQ0FBQyxDQUFDLFlBQVksRUFBRSxXQUFXLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ3pGLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLFlBQVksQ0FBQyxDQUFDLFlBQVksRUFBRSxXQUFXLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDdEUsQ0FBQztJQUNMLENBQUM7SUFuQ2UsV0FBSSxPQW1DbkIsQ0FBQTtJQUVELFNBQVM7SUFFVCxjQUFxQixPQUFlLEVBQUUsUUFBK0Q7UUFDakcsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLGFBQWEsQ0FBQyxFQUFFLE9BQU8sRUFBRSxVQUFDLENBQWE7WUFDeEQsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFKZSxXQUFJLE9BSW5CLENBQUE7SUFFRCxxQkFBNEIsT0FBZSxFQUFFLFFBQStEO1FBQ3hHLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLE9BQU8sRUFBRSxVQUFDLENBQWE7WUFDL0QsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFKZSxrQkFBVyxjQUkxQixDQUFBO0lBRUQsb0JBQTJCLE9BQWUsRUFBRSxRQUFzRDtRQUM5RixNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsb0JBQW9CLENBQUMsRUFBRSxPQUFPLEVBQUUsVUFBQyxDQUFhO1lBQy9ELFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdkIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBSmUsaUJBQVUsYUFJekIsQ0FBQTtJQUVELHNCQUE2QixPQUFlLEVBQUUsUUFBc0Q7UUFDaEcsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLHNCQUFzQixDQUFDLEVBQUUsT0FBTyxFQUFFLFVBQUMsQ0FBYTtZQUNqRSxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUplLG1CQUFZLGVBSTNCLENBQUE7SUFFRCx5QkFBZ0MsU0FBOEI7UUFDMUQsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFFBQVE7WUFDeEIsUUFBUSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM1RSxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFKZSxzQkFBZSxrQkFJOUIsQ0FBQTtBQUNMLENBQUMsRUFqUVMsTUFBTSxLQUFOLE1BQU0sUUFpUWY7QUFFRCxJQUFVLE9BQU8sQ0FnQ2hCO0FBaENELFdBQVUsT0FBTyxFQUFDLENBQUM7SUFDZixjQUFxQixPQUFlLEVBQUUsSUFBK0M7UUFDakYsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxhQUFhLEVBQUU7WUFDakQsT0FBTyxFQUFFLEtBQUs7WUFDZCxVQUFVLEVBQUUsSUFBSTtZQUNoQixNQUFNLEVBQUUsSUFBSTtTQUNmLENBQUMsQ0FBQyxDQUFDO0lBQ1IsQ0FBQztJQU5lLFlBQUksT0FNbkIsQ0FBQTtJQUVELHFCQUE0QixPQUFlLEVBQUUsSUFBK0M7UUFDeEYsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxvQkFBb0IsRUFBRTtZQUN4RCxPQUFPLEVBQUUsS0FBSztZQUNkLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLE1BQU0sRUFBRSxJQUFJO1NBQ2YsQ0FBQyxDQUFDLENBQUM7SUFDUixDQUFDO0lBTmUsbUJBQVcsY0FNMUIsQ0FBQTtJQUVELG9CQUEyQixPQUFlLEVBQUUsSUFBc0M7UUFDOUUsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxvQkFBb0IsRUFBRTtZQUN4RCxPQUFPLEVBQUUsS0FBSztZQUNkLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLE1BQU0sRUFBRSxJQUFJO1NBQ2YsQ0FBQyxDQUFDLENBQUM7SUFDUixDQUFDO0lBTmUsa0JBQVUsYUFNekIsQ0FBQTtJQUVELHNCQUE2QixPQUFlLEVBQUUsSUFBc0M7UUFDaEYsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxzQkFBc0IsRUFBRTtZQUMxRCxPQUFPLEVBQUUsS0FBSztZQUNkLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLE1BQU0sRUFBRSxJQUFJO1NBQ2YsQ0FBQyxDQUFDLENBQUM7SUFDUixDQUFDO0lBTmUsb0JBQVksZUFNM0IsQ0FBQTtBQUNMLENBQUMsRUFoQ1MsT0FBTyxLQUFQLE9BQU8sUUFnQ2hCO0FDalNEO0lBQ0ksbUJBQW9CLElBQVc7UUFBWCxTQUFJLEdBQUosSUFBSSxDQUFPO0lBQUcsQ0FBQztJQUM1Qiw2QkFBUyxHQUFoQixjQUFvQixDQUFDO0lBQ2QsNkJBQVMsR0FBaEIsY0FBb0IsQ0FBQztJQUNkLHVDQUFtQixHQUExQixjQUErQixNQUFNLENBQUMsS0FBSyxDQUFBLENBQUMsQ0FBQztJQUN0Qyw0QkFBUSxHQUFmLGNBQW9CLE1BQU0sQ0FBQyxLQUFLLENBQUEsQ0FBQyxDQUFDO0lBQzNCLDRCQUFRLEdBQWYsY0FBeUIsTUFBTSxDQUFDLElBQUksQ0FBQSxDQUFDLENBQUM7SUFDL0IsNEJBQVEsR0FBZixjQUEyQixNQUFNLENBQUMsSUFBSSxNQUFNLENBQUMsTUFBSSxJQUFJLENBQUMsSUFBSSxNQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUQsaUNBQWEsR0FBcEIsVUFBcUIsVUFBa0IsSUFBYyxNQUFNLENBQUMsSUFBSSxDQUFBLENBQUMsQ0FBQztJQUMzRCxnQ0FBWSxHQUFuQixjQUErQixNQUFNLENBQUMsQ0FBQyxDQUFBLENBQUMsQ0FBQztJQUNsQyw0QkFBUSxHQUFmLGNBQTBCLE1BQU0sQ0FBQyxZQUFVLENBQUEsQ0FBQyxDQUFDO0lBQ3RDLGdDQUFZLEdBQW5CLGNBQWdDLE1BQU0sQ0FBQyxLQUFLLENBQUEsQ0FBQyxDQUFDO0lBQ3ZDLDRCQUFRLEdBQWYsY0FBMkIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUEsQ0FBQyxDQUFDO0lBQ2pELGdCQUFDO0FBQUQsQ0FiQSxBQWFDLElBQUE7QUFFRCxJQUFJLFlBQVksR0FBRyxDQUFDO0lBQ2hCO1FBQXVCLDRCQUFNO1FBQTdCO1lBQXVCLDhCQUFNO1lBRWYsZUFBVSxHQUFXLElBQUksQ0FBQztRQWN4QyxDQUFDO1FBWlUsMkJBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFBO1FBQ3BCLENBQUM7UUFFTSxnQ0FBYSxHQUFwQixVQUFxQixVQUFrQjtZQUNuQyxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztZQUM3QixNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFFTSwrQkFBWSxHQUFuQjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQzNCLENBQUM7UUFDTCxlQUFDO0lBQUQsQ0FoQkEsQUFnQkMsQ0FoQnNCLE1BQU0sR0FnQjVCO0lBRUQ7UUFBNEIsaUNBQVE7UUFBcEM7WUFBNEIsOEJBQVE7UUF1Q3BDLENBQUM7UUF0Q1UsaUNBQVMsR0FBaEI7WUFDSSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3ZELENBQUM7UUFFTSxpQ0FBUyxHQUFoQjtZQUNJLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDdkQsQ0FBQztRQUVNLDJDQUFtQixHQUExQixVQUEyQixPQUFjO1lBQ3JDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFFTSxnQ0FBUSxHQUFmLFVBQWdCLEtBQWlCO1lBQzdCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7Z0JBQ3RDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDaEIsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xFLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDM0MsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNoQixDQUFDO1lBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBRU0sZ0NBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyxhQUFhLENBQUM7UUFDekIsQ0FBQztRQUVNLG9DQUFZLEdBQW5CO1lBQ0ksTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNiLENBQUM7UUFFTSxnQ0FBUSxHQUFmO1lBQ0ksTUFBTSxDQUFDLFlBQVUsQ0FBQztRQUN0QixDQUFDO1FBRU0sZ0NBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzlDLENBQUM7UUFDTCxvQkFBQztJQUFELENBdkNBLEFBdUNDLENBdkMyQixRQUFRLEdBdUNuQztJQUVEO1FBQTJCLGdDQUFhO1FBQXhDO1lBQTJCLDhCQUFhO1FBd0J4QyxDQUFDO1FBdkJVLG1DQUFZLEdBQW5CO1lBQ0ksTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNiLENBQUM7UUFFTSwrQkFBUSxHQUFmLFVBQWdCLEtBQWlCO1lBQzdCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7Z0JBQ3RDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDaEIsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xFLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQUssQ0FBQyxRQUFRLFdBQUUsQ0FBQyxXQUFXLEVBQUUsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLENBQUM7Z0JBQzlELElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBUyxLQUFLLEVBQUUsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7Z0JBQzFELE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDaEIsQ0FBQztZQUNELE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDakIsQ0FBQztRQUVNLCtCQUFRLEdBQWY7WUFDSSxNQUFNLENBQUMsYUFBYSxDQUFDO1FBQ3pCLENBQUM7UUFFTSwrQkFBUSxHQUFmO1lBQ0ksTUFBTSxDQUFDLGdCQUFLLENBQUMsUUFBUSxXQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUNMLG1CQUFDO0lBQUQsQ0F4QkEsQUF3QkMsQ0F4QjBCLGFBQWEsR0F3QnZDO0lBRUQ7UUFBNEIsaUNBQVE7UUFBcEM7WUFBNEIsOEJBQVE7UUF5RHBDLENBQUM7UUF4RGEsaUNBQVMsR0FBbkI7WUFDSSxNQUFNLENBQUMsZ0JBQUssQ0FBQyxTQUFTLFdBQUUsQ0FBQztRQUM3QixDQUFDO1FBRU0saUNBQVMsR0FBaEI7WUFDSSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNuQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO2dCQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDdEIsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDeEIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLEdBQUcsRUFBRSxDQUFDO2dCQUNoQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQy9DLENBQUM7UUFDTCxDQUFDO1FBRU0saUNBQVMsR0FBaEI7WUFDSSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNuQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7WUFDdEIsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDNUIsQ0FBQztRQUVNLDJDQUFtQixHQUExQixVQUEyQixPQUFjO1lBQ3JDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBQyxLQUFLO2dCQUN2QyxNQUFNLENBQUMsSUFBSSxNQUFNLENBQUMsTUFBSSxPQUFPLFFBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDeEQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDTixFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNuQixNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNoQyxDQUFDO1lBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBRU0sZ0NBQVEsR0FBZixVQUFnQixLQUFpQjtZQUM3QixFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO2dCQUN0QyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2hCLENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsRSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUMxQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDeEIsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNoQixDQUFDO1lBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBRU0sZ0NBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxRQUFNLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNwRSxDQUFDO1FBRU0sb0NBQVksR0FBbkI7WUFDSSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUMzRCxDQUFDO1FBRU0sZ0NBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyxhQUFXLENBQUM7UUFDdkIsQ0FBQztRQUVNLGdDQUFRLEdBQWY7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUNsRCxDQUFDO1FBQ0wsb0JBQUM7SUFBRCxDQXpEQSxBQXlEQyxDQXpEMkIsUUFBUSxHQXlEbkM7SUFFRDtRQUE2QixrQ0FBYTtRQUExQztZQUE2Qiw4QkFBYTtRQUkxQyxDQUFDO1FBSGEsa0NBQVMsR0FBbkI7WUFDSSxNQUFNLENBQUMsZ0JBQUssQ0FBQyxjQUFjLFdBQUUsQ0FBQztRQUNsQyxDQUFDO1FBQ0wscUJBQUM7SUFBRCxDQUpBLEFBSUMsQ0FKNEIsYUFBYSxHQUl6QztJQUVEO1FBQW9CLHlCQUFhO1FBQWpDO1lBQW9CLDhCQUFhO1FBK0JqQyxDQUFDO1FBOUJVLDRCQUFZLEdBQW5CO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUVNLG1DQUFtQixHQUExQixVQUEyQixPQUFjO1lBQ3JDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sS0FBSyxHQUFHLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxDQUFDO2dCQUN6RCxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNsQyxDQUFDO1lBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBRU0sd0JBQVEsR0FBZixVQUFnQixLQUFpQjtZQUM3QixFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO2dCQUN0QyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2hCLENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsRSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUM1QyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2hCLENBQUM7WUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2pCLENBQUM7UUFFTSx3QkFBUSxHQUFmO1lBQ0ksTUFBTSxDQUFDLG9CQUFvQixDQUFDO1FBQ2hDLENBQUM7UUFFTSx3QkFBUSxHQUFmO1lBQ0ksTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNqRCxDQUFDO1FBQ0wsWUFBQztJQUFELENBL0JBLEFBK0JDLENBL0JtQixhQUFhLEdBK0JoQztJQUVEO1FBQTBCLCtCQUFLO1FBQS9CO1lBQTBCLDhCQUFLO1FBZ0IvQixDQUFDO1FBZlUseUNBQW1CLEdBQTFCLFVBQTJCLE9BQWM7WUFDckMsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxLQUFLLEdBQUcsR0FBRyxHQUFHLEdBQUcsT0FBTyxDQUFDLENBQUM7Z0JBQ3ZELE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2pDLENBQUM7WUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2pCLENBQUM7UUFFTSw4QkFBUSxHQUFmO1lBQ0ksTUFBTSxDQUFDLHVCQUF1QixDQUFDO1FBQ25DLENBQUM7UUFFTSw4QkFBUSxHQUFmO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsZ0JBQUssQ0FBQyxRQUFRLFdBQUUsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFDTCxrQkFBQztJQUFELENBaEJBLEFBZ0JDLENBaEJ5QixLQUFLLEdBZ0I5QjtJQUVEO1FBQTBCLCtCQUFRO1FBQWxDO1lBQTBCLDhCQUFRO1FBK0NsQyxDQUFDO1FBOUNVLCtCQUFTLEdBQWhCO1lBQ0ksSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDbEMsRUFBRSxDQUFDLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDL0MsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDM0IsQ0FBQztRQUVNLCtCQUFTLEdBQWhCO1lBQ0ksSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDbEMsRUFBRSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDL0MsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDM0IsQ0FBQztRQUVNLHlDQUFtQixHQUExQixVQUEyQixPQUFjO1lBQ3JDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sS0FBSyxHQUFHLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxDQUFDO2dCQUN6RCxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNsQyxDQUFDO1lBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBRU0sOEJBQVEsR0FBZixVQUFnQixLQUFpQjtZQUM3QixFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO2dCQUN0QyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2hCLENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksUUFBUSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZILElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDdkMsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNoQixDQUFDO1lBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBRU0sOEJBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQywrQkFBK0IsQ0FBQztRQUMzQyxDQUFDO1FBRU0sa0NBQVksR0FBbkI7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDcEYsQ0FBQztRQUVNLDhCQUFRLEdBQWY7WUFDSSxNQUFNLENBQUMsWUFBVSxDQUFDO1FBQ3RCLENBQUM7UUFFTSw4QkFBUSxHQUFmO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDMUMsQ0FBQztRQUNMLGtCQUFDO0lBQUQsQ0EvQ0EsQUErQ0MsQ0EvQ3lCLFFBQVEsR0ErQ2pDO0lBRUQ7UUFBeUIsOEJBQVc7UUFBcEM7WUFBeUIsOEJBQVc7UUFnQnBDLENBQUM7UUFmVSx3Q0FBbUIsR0FBMUIsVUFBMkIsT0FBYztZQUNyQyxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDNUIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEtBQUssR0FBRyxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUMsQ0FBQztnQkFDdkQsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDakMsQ0FBQztZQUNELE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDakIsQ0FBQztRQUVNLDZCQUFRLEdBQWY7WUFDSSxNQUFNLENBQUMsa0NBQWtDLENBQUM7UUFDOUMsQ0FBQztRQUVNLDZCQUFRLEdBQWY7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDekMsQ0FBQztRQUNMLGlCQUFDO0lBQUQsQ0FoQkEsQUFnQkMsQ0FoQndCLFdBQVcsR0FnQm5DO0lBRUQ7UUFBMEIsK0JBQVc7UUFBckM7WUFBMEIsOEJBQVc7UUFjckMsQ0FBQztRQWJVLDhCQUFRLEdBQWY7WUFDSSxNQUFNLENBQUMsd0RBQXdELENBQUM7UUFDcEUsQ0FBQztRQUVNLDhCQUFRLEdBQWY7WUFDSSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQy9CLElBQUksQ0FBQyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7WUFDbEIsSUFBSSxDQUFDLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQztZQUNuQixFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7WUFDNUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQzVDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFBQyxNQUFNLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztZQUM1QyxNQUFNLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUN2QixDQUFDO1FBQ0wsa0JBQUM7SUFBRCxDQWRBLEFBY0MsQ0FkeUIsV0FBVyxHQWNwQztJQUVEO1FBQTBCLCtCQUFRO1FBQWxDO1lBQTBCLDhCQUFRO1FBc0RsQyxDQUFDO1FBckRhLDZCQUFPLEdBQWpCO1lBQ0ksTUFBTSxDQUFDLGdCQUFLLENBQUMsT0FBTyxXQUFFLENBQUM7UUFDM0IsQ0FBQztRQUVNLCtCQUFTLEdBQWhCO1lBQ0ksSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDakMsRUFBRSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQztRQUN0RSxDQUFDO1FBRU0sK0JBQVMsR0FBaEI7WUFDSSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNqQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDckIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQ3RFLENBQUM7UUFFTSx5Q0FBbUIsR0FBMUIsVUFBMkIsT0FBYztZQUNyQyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQUMsR0FBRztnQkFDaEMsTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLE1BQUksT0FBTyxRQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ04sRUFBRSxDQUFDLENBQUMsR0FBRyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDOUIsQ0FBQztZQUNELE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDakIsQ0FBQztRQUVNLDhCQUFRLEdBQWYsVUFBZ0IsS0FBaUI7WUFDN0IsRUFBRSxDQUFDLENBQUMsT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDNUIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztnQkFDdEMsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNoQixDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbEUsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDeEMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUNsRSxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2hCLENBQUM7WUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2pCLENBQUM7UUFFTSw4QkFBUSxHQUFmO1lBQ0ksTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLFFBQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2xFLENBQUM7UUFFTSxrQ0FBWSxHQUFuQjtZQUNJLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUMvQyxDQUFDO1FBRU0sOEJBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyxZQUFVLENBQUM7UUFDdEIsQ0FBQztRQUVNLDhCQUFRLEdBQWY7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUM5QyxDQUFDO1FBQ0wsa0JBQUM7SUFBRCxDQXREQSxBQXNEQyxDQXREeUIsUUFBUSxHQXNEakM7SUFFRDtRQUEyQixnQ0FBVztRQUF0QztZQUEyQiw4QkFBVztRQUl0QyxDQUFDO1FBSGEsOEJBQU8sR0FBakI7WUFDSSxNQUFNLENBQUMsZ0JBQUssQ0FBQyxZQUFZLFdBQUUsQ0FBQztRQUNoQyxDQUFDO1FBQ0wsbUJBQUM7SUFBRCxDQUpBLEFBSUMsQ0FKMEIsV0FBVyxHQUlyQztJQUVEO1FBQWlDLHNDQUFRO1FBQXpDO1lBQWlDLDhCQUFRO1FBK0N6QyxDQUFDO1FBOUNVLHNDQUFTLEdBQWhCO1lBQ0ksSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDbkMsRUFBRSxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztnQkFBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQ3RCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzVCLENBQUM7UUFFTSxzQ0FBUyxHQUFoQjtZQUNJLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ25DLEVBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztZQUN0QixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM1QixDQUFDO1FBRU0sZ0RBQW1CLEdBQTFCLFVBQTJCLE9BQWM7WUFDckMsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQy9CLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2pDLENBQUM7WUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2pCLENBQUM7UUFFTSxxQ0FBUSxHQUFmLFVBQWdCLEtBQWlCO1lBQzdCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7Z0JBQ3RDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDaEIsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xFLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDeEMsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNoQixDQUFDO1lBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBRU0seUNBQVksR0FBbkI7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM1QyxDQUFDO1FBRU0scUNBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyxZQUFVLENBQUM7UUFDdEIsQ0FBQztRQUVNLHFDQUFRLEdBQWY7WUFDSSxNQUFNLENBQUMsMkJBQTJCLENBQUM7UUFDdkMsQ0FBQztRQUVNLHFDQUFRLEdBQWY7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDMUMsQ0FBQztRQUNMLHlCQUFDO0lBQUQsQ0EvQ0EsQUErQ0MsQ0EvQ2dDLFFBQVEsR0ErQ3hDO0lBRUQ7UUFBMkIsZ0NBQWtCO1FBQTdDO1lBQTJCLDhCQUFrQjtRQWdCN0MsQ0FBQztRQWZVLDBDQUFtQixHQUExQixVQUEyQixPQUFjO1lBQ3JDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNqQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNsQyxDQUFDO1lBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBRU0sK0JBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQztRQUNwQyxDQUFDO1FBRU0sK0JBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzNDLENBQUM7UUFDTCxtQkFBQztJQUFELENBaEJBLEFBZ0JDLENBaEIwQixrQkFBa0IsR0FnQjVDO0lBRUQ7UUFBeUIsOEJBQWtCO1FBQTNDO1lBQXlCLDhCQUFrQjtRQStCM0MsQ0FBQztRQTlCVSx3Q0FBbUIsR0FBMUIsVUFBMkIsT0FBYztZQUNyQyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sS0FBSyxHQUFHLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZELE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFFTSw2QkFBUSxHQUFmLFVBQWdCLEtBQWlCO1lBQzdCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7Z0JBQ3RDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDaEIsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xFLElBQUksR0FBRyxHQUFHLFFBQVEsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQzlCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxJQUFJLEdBQUcsS0FBSyxFQUFFLENBQUM7b0JBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDckQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLElBQUksR0FBRyxLQUFLLEVBQUUsQ0FBQztvQkFBQyxHQUFHLElBQUksRUFBRSxDQUFDO2dCQUN2RCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDeEIsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNoQixDQUFDO1lBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBRU0sNkJBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQztRQUNqQyxDQUFDO1FBRU0saUNBQVksR0FBbkI7WUFDSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNyRCxDQUFDO1FBRU0sNkJBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUNMLGlCQUFDO0lBQUQsQ0EvQkEsQUErQkMsQ0EvQndCLGtCQUFrQixHQStCMUM7SUFFRDtRQUFtQix3QkFBVTtRQUE3QjtZQUFtQiw4QkFBVTtRQWE3QixDQUFDO1FBWlUsa0NBQW1CLEdBQTFCLFVBQTJCLE9BQWM7WUFDckMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEtBQUssR0FBRyxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUMsQ0FBQztZQUN6RCxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsQyxDQUFDO1FBRU0sdUJBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQztRQUM5QixDQUFDO1FBRU0sdUJBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFLLENBQUMsUUFBUSxXQUFFLENBQUMsQ0FBQztRQUN2QyxDQUFDO1FBQ0wsV0FBQztJQUFELENBYkEsQUFhQyxDQWJrQixVQUFVLEdBYTVCO0lBRUQ7UUFBMkIsZ0NBQVE7UUFBbkM7WUFBMkIsOEJBQVE7UUEyQ25DLENBQUM7UUExQ1UsZ0NBQVMsR0FBaEI7WUFDSSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNyQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO2dCQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDdEIsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDOUIsQ0FBQztRQUVNLGdDQUFTLEdBQWhCO1lBQ0ksSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDckMsRUFBRSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzlCLENBQUM7UUFFTSwwQ0FBbUIsR0FBMUIsVUFBMkIsT0FBYztZQUNyQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUVNLCtCQUFRLEdBQWYsVUFBZ0IsS0FBaUI7WUFDN0IsRUFBRSxDQUFDLENBQUMsT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDNUIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztnQkFDdEMsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNoQixDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbEUsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUMxQyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2hCLENBQUM7WUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2pCLENBQUM7UUFFTSwrQkFBUSxHQUFmO1lBQ0ksTUFBTSxDQUFDLGNBQWMsQ0FBQztRQUMxQixDQUFDO1FBRU0sbUNBQVksR0FBbkI7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM5QyxDQUFDO1FBRU0sK0JBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyxjQUFZLENBQUM7UUFDeEIsQ0FBQztRQUVNLCtCQUFRLEdBQWY7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUNMLG1CQUFDO0lBQUQsQ0EzQ0EsQUEyQ0MsQ0EzQzBCLFFBQVEsR0EyQ2xDO0lBRUQ7UUFBcUIsMEJBQVk7UUFBakM7WUFBcUIsOEJBQVk7UUFZakMsQ0FBQztRQVhVLG9DQUFtQixHQUExQixVQUEyQixPQUFjO1lBQ3JDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUM3QyxDQUFDO1FBRU0seUJBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyxlQUFlLENBQUM7UUFDM0IsQ0FBQztRQUVNLHlCQUFRLEdBQWY7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM3QyxDQUFDO1FBQ0wsYUFBQztJQUFELENBWkEsQUFZQyxDQVpvQixZQUFZLEdBWWhDO0lBRUQ7UUFBMkIsZ0NBQVE7UUFBbkM7WUFBMkIsOEJBQVE7UUEyQ25DLENBQUM7UUExQ1UsZ0NBQVMsR0FBaEI7WUFDSSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNyQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO2dCQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDdEIsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDOUIsQ0FBQztRQUVNLGdDQUFTLEdBQWhCO1lBQ0ksSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDckMsRUFBRSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzlCLENBQUM7UUFFTSwwQ0FBbUIsR0FBMUIsVUFBMkIsT0FBYztZQUNyQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUVNLCtCQUFRLEdBQWYsVUFBZ0IsS0FBaUI7WUFDN0IsRUFBRSxDQUFDLENBQUMsT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDNUIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztnQkFDdEMsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNoQixDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbEUsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUMxQyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2hCLENBQUM7WUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2pCLENBQUM7UUFFTSwrQkFBUSxHQUFmO1lBQ0ksTUFBTSxDQUFDLGNBQWMsQ0FBQztRQUMxQixDQUFDO1FBRU0sbUNBQVksR0FBbkI7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM5QyxDQUFDO1FBRU0sK0JBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyxjQUFZLENBQUM7UUFDeEIsQ0FBQztRQUVNLCtCQUFRLEdBQWY7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUNMLG1CQUFDO0lBQUQsQ0EzQ0EsQUEyQ0MsQ0EzQzBCLFFBQVEsR0EyQ2xDO0lBRUQ7UUFBcUIsMEJBQVk7UUFBakM7WUFBcUIsOEJBQVk7UUFhakMsQ0FBQztRQVpVLG9DQUFtQixHQUExQixVQUEyQixPQUFjO1lBQ3JDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUM3QyxDQUFDO1FBRU0seUJBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyxlQUFlLENBQUM7UUFDM0IsQ0FBQztRQUVNLHlCQUFRLEdBQWY7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM3QyxDQUFDO1FBRUwsYUFBQztJQUFELENBYkEsQUFhQyxDQWJvQixZQUFZLEdBYWhDO0lBRUQ7UUFBZ0MscUNBQVE7UUFBeEM7WUFBZ0MsOEJBQVE7UUFrRHhDLENBQUM7UUFqRFUscUNBQVMsR0FBaEI7WUFDSSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQztZQUNwQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO2dCQUFDLEdBQUcsSUFBSSxFQUFFLENBQUM7WUFDeEIsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDNUIsQ0FBQztRQUVNLHFDQUFTLEdBQWhCO1lBQ0ksSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUM7WUFDcEMsRUFBRSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFBQyxHQUFHLElBQUksRUFBRSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzVCLENBQUM7UUFFTSwrQ0FBbUIsR0FBMUIsVUFBMkIsT0FBYztZQUNyQyxFQUFFLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNuQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQztZQUMzRCxDQUFDO1lBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBRU0sb0NBQVEsR0FBZixVQUFnQixLQUFpQjtZQUM3QixFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO2dCQUN0QyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2hCLENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsRSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDNUQsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztnQkFDbEQsQ0FBQztnQkFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ25FLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7Z0JBQ2xELENBQUM7Z0JBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNoQixDQUFDO1lBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBRU0sb0NBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyxZQUFVLENBQUM7UUFDdEIsQ0FBQztRQUVNLHdDQUFZLEdBQW5CO1lBQ0ksTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNiLENBQUM7UUFFTSxvQ0FBUSxHQUFmO1lBQ0ksTUFBTSxDQUFDLGdCQUFnQixDQUFDO1FBQzVCLENBQUM7UUFFTSxvQ0FBUSxHQUFmO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3JELENBQUM7UUFDTCx3QkFBQztJQUFELENBbERBLEFBa0RDLENBbEQrQixRQUFRLEdBa0R2QztJQUVEO1FBQWdDLHFDQUFpQjtRQUFqRDtZQUFnQyw4QkFBaUI7UUFJakQsQ0FBQztRQUhVLG9DQUFRLEdBQWY7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkMsQ0FBQztRQUNMLHdCQUFDO0lBQUQsQ0FKQSxBQUlDLENBSitCLGlCQUFpQixHQUloRDtJQUVELElBQUksWUFBWSxHQUEwQyxFQUFFLENBQUM7SUFFN0QsWUFBWSxDQUFDLE1BQU0sQ0FBQyxHQUFHLGFBQWEsQ0FBQztJQUNyQyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsWUFBWSxDQUFDO0lBQ2xDLFlBQVksQ0FBQyxNQUFNLENBQUMsR0FBRyxhQUFhLENBQUM7SUFDckMsWUFBWSxDQUFDLEtBQUssQ0FBQyxHQUFHLGNBQWMsQ0FBQztJQUNyQyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsV0FBVyxDQUFDO0lBQ2pDLFlBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7SUFDMUIsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLFVBQVUsQ0FBQztJQUNoQyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsV0FBVyxDQUFDO0lBQ2pDLFlBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxXQUFXLENBQUM7SUFDaEMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxHQUFHLFdBQVcsQ0FBQztJQUNuQyxZQUFZLENBQUMsS0FBSyxDQUFDLEdBQUcsWUFBWSxDQUFDO0lBQ25DLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxrQkFBa0IsQ0FBQztJQUN4QyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsVUFBVSxDQUFDO0lBQ2hDLFlBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxZQUFZLENBQUM7SUFDakMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztJQUN6QixZQUFZLENBQUMsR0FBRyxDQUFDLEdBQUcsaUJBQWlCLENBQUM7SUFDdEMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxHQUFHLGlCQUFpQixDQUFDO0lBQ3RDLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxZQUFZLENBQUM7SUFDbEMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQztJQUMzQixZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsWUFBWSxDQUFDO0lBQ2xDLFlBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUM7SUFFM0IsTUFBTSxDQUFDLFlBQVksQ0FBQztBQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDO0FDcnJCTDtJQVNJLGVBQW1CLE9BQXlCO1FBVGhELGlCQTJMQztRQWxMc0IsWUFBTyxHQUFQLE9BQU8sQ0FBa0I7UUFOcEMsZUFBVSxHQUFXLEVBQUUsQ0FBQztRQU81QixJQUFJLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9CLElBQUksaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUIsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUUzQixNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLEtBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBM0MsQ0FBMkMsQ0FBQyxDQUFDO0lBQ3BGLENBQUM7SUFFTSx5QkFBUyxHQUFoQjtRQUNJLElBQUksTUFBTSxHQUFXLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFFBQVE7WUFDNUIsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUN4RSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ3JDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVNLDZCQUFhLEdBQXBCO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDM0IsQ0FBQztJQUVNLDZCQUFhLEdBQXBCLFVBQXFCLFNBQWdCO1FBQ2pDLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1FBRTVCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0IsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDaEMsQ0FBQztJQUNMLENBQUM7SUFFTSxvQ0FBb0IsR0FBM0I7UUFDSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3RCxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLENBQUM7WUFFL0MsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDakUsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7Z0JBQ3JCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztZQUM3RCxDQUFDO1lBRUQsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUN2QixJQUFJLEVBQUUsT0FBTztnQkFDYixLQUFLLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRTthQUMxQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25ELENBQUM7SUFDTCxDQUFDO0lBRU0sMENBQTBCLEdBQWpDO1FBQ0ksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzdDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQ2pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDbEIsQ0FBQztJQUVNLHlDQUF5QixHQUFoQztRQUNJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDbEQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDakMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakMsQ0FBQztRQUNELE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNsQixDQUFDO0lBRU0seUNBQXlCLEdBQWhDO1FBQ0ksSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDdEQsT0FBTyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2pDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQ2pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDO0lBQ2pDLENBQUM7SUFFTSw2Q0FBNkIsR0FBcEM7UUFDSSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUN0RCxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQ2QsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDakMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakMsQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7SUFDakMsQ0FBQztJQUVNLDRDQUE0QixHQUFuQyxVQUFvQyxhQUFxQjtRQUNyRCxJQUFJLFFBQVEsR0FBVSxNQUFNLENBQUMsU0FBUyxDQUFDO1FBQ3ZDLElBQUksZUFBeUIsQ0FBQztRQUM5QixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7UUFFZCxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDN0MsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVqQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUMxQixJQUFJLFFBQVEsR0FBRyxhQUFhLEdBQUcsS0FBSyxDQUFDO2dCQUNyQyxJQUFJLFNBQVMsR0FBRyxhQUFhLEdBQUcsQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUVyRSxFQUFFLENBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7b0JBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztnQkFFbkQsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDMUQsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0JBQ2hCLGVBQWUsR0FBRyxRQUFRLENBQUM7b0JBQzNCLFFBQVEsR0FBRyxDQUFDLENBQUM7Z0JBQ2pCLENBQUM7WUFDTCxDQUFDO1lBRUQsS0FBSyxJQUFJLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxNQUFNLENBQUM7UUFDeEMsQ0FBQztRQUVELE1BQU0sQ0FBQyxlQUFlLENBQUM7SUFDM0IsQ0FBQztJQUVNLG1DQUFtQixHQUExQixVQUEyQixRQUFrQjtRQUN6QyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNyQyxJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztZQUNyQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsUUFBUSxDQUFDO1FBQ3JDLENBQUM7SUFDTCxDQUFDO0lBRU0sbUNBQW1CLEdBQTFCO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztJQUNqQyxDQUFDO0lBRU0sNkJBQWEsR0FBcEIsVUFBcUIsT0FBZ0I7UUFDakMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFFdkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFFL0IsSUFBSSxNQUFNLEdBQVUsR0FBRyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQUMsUUFBUTtZQUM1QixNQUFNLElBQUksTUFBSSxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsTUFBRyxDQUFDO1FBQzVELENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRTFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFTSwwQkFBVSxHQUFqQjtRQUNJLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNwQixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFFBQVE7WUFDNUIsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxLQUFLLEtBQUssQ0FBQyxDQUFDO2dCQUFDLE1BQU0sQ0FBQztZQUMzQyxVQUFVLElBQUksUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3RDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDO1FBRWhDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsS0FBSyxLQUFLLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQztRQUU3QyxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7UUFFZCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDVixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDakQsS0FBSyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxNQUFNLENBQUM7UUFDbkQsQ0FBQztRQUVELElBQUksR0FBRyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxDQUFDO1FBRTFELElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFTSwyQkFBVyxHQUFsQixVQUFtQixJQUFTLEVBQUUsS0FBVyxFQUFFLE1BQWU7UUFBMUQsaUJBWUM7UUFYRyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFFBQVE7WUFDNUIsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDO2dCQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDcEMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxLQUFLLEtBQUs7Z0JBQzdCLEtBQUksQ0FBQyxtQkFBbUIsRUFBRSxLQUFLLEtBQUssQ0FBQztnQkFDckMsS0FBSyxLQUFLLEtBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDbEQsS0FBSSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBRU0saUNBQWlCLEdBQXhCO1FBQ0ksT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQzlCLElBQUksRUFBRSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxRQUFRLEVBQUU7WUFDM0MsS0FBSyxFQUFFLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLFFBQVEsRUFBRTtTQUMvQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUwsWUFBQztBQUFELENBM0xBLEFBMkxDLElBQUE7QUNyTEQ7SUFJSSw4QkFBb0IsS0FBVztRQUpuQyxpQkEwSkM7UUF0SnVCLFVBQUssR0FBTCxLQUFLLENBQU07UUFIdkIsaUJBQVksR0FBRyxLQUFLLENBQUM7UUFDckIsWUFBTyxHQUFHLEtBQUssQ0FBQztRQVFoQixVQUFLLEdBQUc7WUFDWixFQUFFLENBQUMsQ0FBQyxLQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDZixJQUFJLEtBQUssR0FBRyxLQUFJLENBQUMsS0FBSyxDQUFDLDBCQUEwQixFQUFFLENBQUM7Z0JBQ3BELEtBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3RDLFVBQVUsQ0FBQztvQkFDUixLQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBQ2xDLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztnQkFDM0IsSUFBSSxJQUFJLEdBQUcsS0FBSSxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO2dCQUNsRCxLQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNyQyxVQUFVLENBQUM7b0JBQ1IsS0FBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2dCQUNsQyxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUM7UUFDTCxDQUFDLENBQUE7UUFuQkcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsVUFBQyxDQUFDLElBQUssT0FBQSxLQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFmLENBQWUsQ0FBQyxDQUFDO1FBQ2xFLEtBQUssQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLGNBQU0sT0FBQSxLQUFJLENBQUMsS0FBSyxFQUFFLEVBQVosQ0FBWSxDQUFDLENBQUM7UUFDNUQsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLEtBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEVBQXZCLENBQXVCLENBQUMsQ0FBQztJQUN6RSxDQUFDO0lBa0JPLDhDQUFlLEdBQXZCLFVBQXdCLENBQWU7UUFBdkMsaUJBVUM7UUFURyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxPQUFPLEtBQUssV0FBTyxDQUFDLENBQUMsQ0FBQztZQUN0QyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztRQUM3QixDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEtBQUssV0FBTyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUN4QixDQUFDO1FBQ0QsVUFBVSxDQUFDO1lBQ1AsS0FBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7WUFDMUIsS0FBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFDekIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8sc0NBQU8sR0FBZixVQUFnQixDQUFlO1FBQzNCLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFDckIsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsSUFBSSxJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztZQUM1QixJQUFJLElBQUksRUFBRSxDQUFDO1FBQ2YsQ0FBQztRQUdELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLGFBQVEsSUFBSSxJQUFJLEtBQUssWUFBTyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQztZQUFDLE1BQU0sQ0FBQztRQUNsRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxhQUFRLElBQUksSUFBSSxLQUFLLGNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUM7WUFBQyxNQUFNLENBQUM7UUFDcEUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssVUFBSyxJQUFJLElBQUksS0FBSyxVQUFLLElBQUksSUFBSSxLQUFLLFVBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUM7WUFBQyxNQUFNLENBQUM7UUFFOUUsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDO1FBRTFCLEVBQUUsQ0FBQyxDQUFDLElBQUksS0FBSyxhQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNoQixDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksS0FBSyxZQUFPLENBQUMsQ0FBQyxDQUFDO1lBQzFCLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNmLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxLQUFLLGFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2hCLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxLQUFLLGNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDNUIsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2pCLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxLQUFLLFdBQU8sSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUN4QyxjQUFjLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3JDLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxLQUFLLFdBQU8sQ0FBQyxDQUFDLENBQUM7WUFDMUIsY0FBYyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNoQyxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksS0FBSyxXQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUNkLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxLQUFLLGFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2hCLENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN2QixDQUFDO1FBRUQsSUFBSSxVQUFVLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQyxFQUFFLENBQUMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuQyxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQzVDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksS0FBSyxpQkFBYSxDQUFDLENBQUMsQ0FBQztZQUNoQyxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQzVDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDckIsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDakMsQ0FBQztJQUVMLENBQUM7SUFFTyxtQ0FBSSxHQUFaO1FBQ0ksSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQywwQkFBMEIsRUFBRSxDQUFDO1FBQ3BELElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQ25DLENBQUM7SUFFTyxrQ0FBRyxHQUFYO1FBQ0ksSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO1FBQ2xELElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckMsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQ25DLENBQUM7SUFFTyxtQ0FBSSxHQUFaO1FBQ0ksSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsRUFBRSxDQUFDO1FBQzFELElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQ25DLENBQUM7SUFFTyxvQ0FBSyxHQUFiO1FBQ0ksSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO1FBQ2xELElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckMsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQ25DLENBQUM7SUFFTyx1Q0FBUSxHQUFoQjtRQUNJLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsNkJBQTZCLEVBQUUsQ0FBQztRQUMxRCxFQUFFLENBQUMsQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNoRCxJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3pDLElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUMvQixNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFTyxrQ0FBRyxHQUFYO1FBQ0ksSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO1FBQ2xELEVBQUUsQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzVDLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDckMsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQy9CLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUNELE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFFakIsQ0FBQztJQUVPLGlDQUFFLEdBQVY7UUFDSSxJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixFQUFFLENBQUMsU0FBUyxFQUFFLENBQUM7UUFFN0MsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3hELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUV2RCxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFO1lBQzdCLElBQUksRUFBRSxJQUFJO1lBQ1YsS0FBSyxFQUFFLEtBQUs7U0FDZixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8sbUNBQUksR0FBWjtRQUNJLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUU3QyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDeEQsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRXZELE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUU7WUFDN0IsSUFBSSxFQUFFLElBQUk7WUFDVixLQUFLLEVBQUUsS0FBSztTQUNmLENBQUMsQ0FBQztJQUNQLENBQUM7SUFDTCwyQkFBQztBQUFELENBMUpBLEFBMEpDLElBQUE7QUNoS0Q7SUFDSSwyQkFBb0IsS0FBVztRQURuQyxpQkEyQ0M7UUExQ3VCLFVBQUssR0FBTCxLQUFLLENBQU07UUFzQnZCLFlBQU8sR0FBRztZQUNkLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSSxDQUFDLElBQUksQ0FBQztnQkFBQyxNQUFNLENBQUM7WUFDdkIsS0FBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7WUFFbEIsSUFBSSxHQUFVLENBQUM7WUFFZixFQUFFLENBQUMsQ0FBQyxLQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEtBQUssS0FBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hELEdBQUcsR0FBRyxLQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUM7WUFDMUMsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLEdBQUcsR0FBRyxLQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUM7WUFDNUMsQ0FBQztZQUVELElBQUksS0FBSyxHQUFHLEtBQUksQ0FBQyxLQUFLLENBQUMsNEJBQTRCLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFekQsS0FBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUV0QyxFQUFFLENBQUMsQ0FBQyxLQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEdBQUcsQ0FBQyxJQUFJLEtBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxLQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDN0csS0FBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQ25DLENBQUM7UUFDTCxDQUFDLENBQUM7UUF4Q0UsTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLGNBQU0sT0FBQSxLQUFJLENBQUMsU0FBUyxFQUFFLEVBQWhCLENBQWdCLENBQUMsQ0FBQztRQUN4RCxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxjQUFNLE9BQUEsS0FBSSxDQUFDLE9BQU8sRUFBRSxFQUFkLENBQWMsQ0FBQyxDQUFDO1FBRS9DLGVBQWU7UUFDZixLQUFLLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLENBQUMsQ0FBQyxjQUFjLEVBQUUsRUFBbEIsQ0FBa0IsQ0FBQyxDQUFDO1FBQ3ZFLEtBQUssQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsQ0FBQyxDQUFDLGNBQWMsRUFBRSxFQUFsQixDQUFrQixDQUFDLENBQUM7UUFDdEUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsVUFBQyxDQUFDLElBQUssT0FBQSxDQUFDLENBQUMsY0FBYyxFQUFFLEVBQWxCLENBQWtCLENBQUMsQ0FBQztRQUNsRSxLQUFLLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLENBQUMsQ0FBQyxjQUFjLEVBQUUsRUFBbEIsQ0FBa0IsQ0FBQyxDQUFDO0lBQ3JFLENBQUM7SUFLTyxxQ0FBUyxHQUFqQjtRQUFBLGlCQU1DO1FBTEcsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNyRCxVQUFVLENBQUM7WUFDUixLQUFJLENBQUMsVUFBVSxHQUFHLEtBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQztRQUN2RCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFzQkwsd0JBQUM7QUFBRCxDQTNDQSxBQTJDQyxJQUFBO0FDM0NEO0lBQUE7SUFtRUEsQ0FBQztJQWxFaUIsWUFBSyxHQUFuQixVQUFvQixNQUFhO1FBQzdCLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNwQixJQUFJLFNBQVMsR0FBZSxFQUFFLENBQUM7UUFFL0IsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsSUFBSSxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7UUFFN0IsSUFBSSxhQUFhLEdBQUc7WUFDaEIsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4QixTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUMvRCxVQUFVLEdBQUcsRUFBRSxDQUFDO1lBQ3BCLENBQUM7UUFDTCxDQUFDLENBQUE7UUFFRCxPQUFPLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDM0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDN0MsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO2dCQUN4QixLQUFLLEVBQUUsQ0FBQztnQkFDUixRQUFRLENBQUM7WUFDYixDQUFDO1lBRUQsRUFBRSxDQUFDLENBQUMsZ0JBQWdCLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQzVDLGdCQUFnQixHQUFHLEtBQUssQ0FBQztnQkFDekIsS0FBSyxFQUFFLENBQUM7Z0JBQ1IsUUFBUSxDQUFDO1lBQ2IsQ0FBQztZQUVELEVBQUUsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztnQkFDbkIsVUFBVSxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDNUIsS0FBSyxFQUFFLENBQUM7Z0JBQ1IsUUFBUSxDQUFDO1lBQ2IsQ0FBQztZQUVELElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztZQUVsQixHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxZQUFZLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBSSxJQUFJLE1BQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDNUMsYUFBYSxFQUFFLENBQUM7b0JBQ2hCLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDOUQsS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO29CQUN6QixLQUFLLEdBQUcsSUFBSSxDQUFDO29CQUNiLEtBQUssQ0FBQztnQkFDVixDQUFDO2dCQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM1QyxhQUFhLEVBQUUsQ0FBQztvQkFDaEIsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3pDLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDO29CQUNyQixLQUFLLEdBQUcsSUFBSSxDQUFDO29CQUNiLEtBQUssQ0FBQztnQkFDVixDQUFDO1lBQ0wsQ0FBQztZQUVELEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDVCxVQUFVLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUM1QixLQUFLLEVBQUUsQ0FBQztZQUNaLENBQUM7UUFFTCxDQUFDO1FBRUQsYUFBYSxFQUFFLENBQUM7UUFFaEIsTUFBTSxDQUFDLFNBQVMsQ0FBQztJQUNyQixDQUFDO0lBRWMsYUFBTSxHQUFyQixVQUF1QixHQUFVLEVBQUUsS0FBWSxFQUFFLE1BQWE7UUFDMUQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssTUFBTSxDQUFDO0lBQzlELENBQUM7SUFDTCxhQUFDO0FBQUQsQ0FuRUEsQUFtRUMsSUFBQTtBQ25FRDtJQUNJLDBCQUFvQixLQUFXO1FBRG5DLGlCQTBDQztRQXpDdUIsVUFBSyxHQUFMLEtBQUssQ0FBTTtRQUMzQixNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsY0FBTSxPQUFBLEtBQUksQ0FBQyxLQUFLLEVBQUUsRUFBWixDQUFZLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRU8sZ0NBQUssR0FBYjtRQUFBLGlCQW9DQztRQW5DRyxJQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFDN0MsVUFBVSxDQUFDO1lBQ1IsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNwRCxLQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsYUFBYSxDQUFDO2dCQUN6QyxNQUFNLENBQUM7WUFDWCxDQUFDO1lBRUQsSUFBSSxPQUFPLEdBQUcsS0FBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRTFELElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQztZQUNuQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUNuRCxJQUFJLFFBQVEsR0FBRyxLQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFdkMsSUFBSSxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBRXRFLElBQUksR0FBRyxHQUFHLEtBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDM0UsU0FBUyxJQUFJLEdBQUcsQ0FBQztnQkFFakIsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUM7b0JBQUMsUUFBUSxDQUFDO2dCQUV2QyxRQUFRLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUMzQixFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDekIsT0FBTyxHQUFHLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDbEMsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDSixLQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsYUFBYSxDQUFDO29CQUN6QyxNQUFNLENBQUM7Z0JBQ1gsQ0FBQztZQUNMLENBQUM7WUFFRCxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFO2dCQUM3QixJQUFJLEVBQUUsT0FBTztnQkFDYixLQUFLLEVBQUUsS0FBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLFFBQVEsRUFBRTthQUNyRCxDQUFDLENBQUM7UUFFTixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFDTCx1QkFBQztBQUFELENBMUNBLEFBMENDLElBQUE7QUN0Q0Q7SUFBcUIsMEJBQU07SUFnQnZCLGdCQUFvQixPQUFtQixFQUFVLFNBQXFCO1FBaEIxRSxpQkE0S0M7UUEzSk8saUJBQU8sQ0FBQztRQURRLFlBQU8sR0FBUCxPQUFPLENBQVk7UUFBVSxjQUFTLEdBQVQsU0FBUyxDQUFZO1FBR2xFLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsS0FBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBakMsQ0FBaUMsQ0FBQyxDQUFDO1FBRXRFLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDLGFBQWEsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1FBQzFFLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDLGFBQWEsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO1FBQzVFLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDLGFBQWEsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1FBQzFFLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDLGFBQWEsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1FBQzFFLElBQUksQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDLGFBQWEsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1FBQzlFLElBQUksQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDLGFBQWEsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1FBRTlFLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRXBILElBQUksY0FBYyxHQUFHLFNBQVMsQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDNUQsSUFBSSxVQUFVLEdBQUcsU0FBUyxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUN4RCxJQUFJLGtCQUFrQixHQUFHLFNBQVMsQ0FBQyxhQUFhLENBQUMsNkJBQTZCLENBQUMsQ0FBQztRQUVoRixNQUFNLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxjQUFNLE9BQUEsS0FBSSxDQUFDLFFBQVEsRUFBRSxFQUFmLENBQWUsQ0FBQyxDQUFDO1FBQ2xELE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLGNBQU0sT0FBQSxLQUFJLENBQUMsSUFBSSxFQUFFLEVBQVgsQ0FBVyxDQUFDLENBQUM7UUFDMUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxjQUFNLE9BQUEsS0FBSSxDQUFDLE9BQU8sRUFBRSxFQUFkLENBQWMsQ0FBQyxDQUFDO1FBRXJELE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFO1lBQ3pCLEtBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNmLENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUU7WUFDMUIsS0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ25CLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLHlCQUFRLEdBQWY7UUFDSSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDeEIsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBa0IsQ0FBQztZQUN2QyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7WUFDakIsTUFBTSxFQUFFLEtBQUs7U0FDZixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0scUJBQUksR0FBWDtRQUNJLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUN4QixJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFnQixDQUFDO1lBQ3JDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztZQUNqQixNQUFNLEVBQUUsS0FBSztTQUNmLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTyx3QkFBTyxHQUFmO1FBQ0ksSUFBSSxRQUFRLEdBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDeEUsRUFBRSxDQUFDLENBQUMsUUFBUSxLQUFLLEtBQUssQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDO1FBQ2hDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUN4QixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7WUFDZixLQUFLLEVBQUUsUUFBUTtZQUNmLE1BQU0sRUFBRSxLQUFLO1NBQ2YsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLHlCQUFRLEdBQWhCLFVBQWlCLFFBQXNCO1FBQ25DLElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUN6QyxJQUFJLFNBQVMsR0FBRyxRQUFRLEtBQUssVUFBZ0IsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDdkQsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDakIsS0FBSyxZQUFVO2dCQUNYLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQztnQkFDdEQsS0FBSyxDQUFDO1lBQ1YsS0FBSyxhQUFXO2dCQUNaLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDO2dCQUNqRCxLQUFLLENBQUM7WUFDVixLQUFLLFlBQVU7Z0JBQ1gsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUM7Z0JBQzNDLEtBQUssQ0FBQztZQUNWLEtBQUssWUFBVTtnQkFDWCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQztnQkFDekMsS0FBSyxDQUFDO1lBQ1YsS0FBSyxjQUFZO2dCQUNiLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDO2dCQUMzQyxLQUFLLENBQUM7WUFDVixLQUFLLGNBQVk7Z0JBQ2IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUM7Z0JBQy9DLEtBQUssQ0FBQztRQUNkLENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFTyw0QkFBVyxHQUFuQixVQUFvQixJQUFTLEVBQUUsS0FBVztRQUExQyxpQkFvQkM7UUFuQkcsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBQyxLQUFLLEVBQUUsVUFBVTtZQUNsQyxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNyQyxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUN4QyxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUV4QyxFQUFFLENBQUMsQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDckIsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQ2xDLEtBQUssQ0FBQyxTQUFTLEdBQUcsS0FBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztZQUM5RCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQ3JDLEtBQUssQ0FBQyxTQUFTLEdBQUcsS0FBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztZQUNqRSxDQUFDO1lBRUQsRUFBRSxDQUFDLENBQUMsVUFBVSxHQUFHLEtBQUssR0FBRyxDQUFDLElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQy9DLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ3pDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTyxpQ0FBZ0IsR0FBeEIsVUFBeUIsSUFBUyxFQUFFLEtBQVc7UUFDM0MsTUFBTSxDQUFBLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNYLEtBQUssWUFBVTtnQkFDWCxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNoQyxLQUFLLGFBQVc7Z0JBQ1osTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN6QyxLQUFLLFlBQVU7Z0JBQ1gsTUFBTSxDQUFJLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsU0FBSSxJQUFJLENBQUMsV0FBVyxFQUFJLENBQUM7WUFDN0UsS0FBSyxZQUFVLENBQUM7WUFDaEIsS0FBSyxjQUFZO2dCQUNiLE1BQU0sQ0FBSSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLFNBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsU0FBSSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLFNBQUksSUFBSSxDQUFDLFdBQVcsRUFBSSxDQUFDO1FBQ25KLENBQUM7SUFDTCxDQUFDO0lBRU8sb0NBQW1CLEdBQTNCLFVBQTRCLElBQVMsRUFBRSxLQUFXO1FBQzlDLE1BQU0sQ0FBQSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDWCxLQUFLLFlBQVU7Z0JBQ1gsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDaEMsS0FBSyxhQUFXO2dCQUNaLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDekMsS0FBSyxZQUFVO2dCQUNYLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDbEQsS0FBSyxZQUFVO2dCQUNYLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztvQkFDNUIsTUFBTSxDQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsU0FBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQywwQkFBcUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsdUJBQW9CLENBQUM7Z0JBQy9JLENBQUM7Z0JBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ0osTUFBTSxDQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsU0FBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQywwQkFBcUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyx1QkFBb0IsQ0FBQztnQkFDbEssQ0FBQztZQUNMLEtBQUssY0FBWTtnQkFDYixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7b0JBQzVCLE1BQU0sQ0FBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQywwQkFBcUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsdUJBQW9CLENBQUM7Z0JBQzVHLENBQUM7Z0JBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ0osTUFBTSxDQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLDBCQUFxQixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQywwQkFBcUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUcsQ0FBQztnQkFDL0gsQ0FBQztZQUNMLEtBQUssY0FBWTtnQkFDYixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7b0JBQzVCLE1BQU0sQ0FBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxTQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLDBCQUFxQixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyx1QkFBb0IsQ0FBQztnQkFDM0ksQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDSixNQUFNLENBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQywwQkFBcUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsMEJBQXFCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFHLENBQUM7Z0JBQzlKLENBQUM7UUFDVCxDQUFDO0lBQ0wsQ0FBQztJQUVNLDhCQUFhLEdBQXBCLFVBQXFCLE9BQWdCLEVBQUUsTUFBYztRQUNqRCxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxLQUFLLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxLQUFLLE9BQU8sQ0FBQyxZQUFZLENBQUM7UUFDL0YsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUNiLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDNUMsQ0FBQztJQUNMLENBQUM7SUFDTCxhQUFDO0FBQUQsQ0E1S0EsQUE0S0MsQ0E1S29CLE1BQU0sR0E0SzFCO0FDektEO0lBZ0JJLHVCQUFvQixPQUF3QjtRQWhCaEQsaUJBcU9DO1FBck51QixZQUFPLEdBQVAsT0FBTyxDQUFpQjtRQUN4QyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUVuQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFMUMsSUFBSSxDQUFDLGVBQWUsR0FBZ0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUU1RixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFbEQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLFVBQVUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzFELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxXQUFXLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM1RCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksVUFBVSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDMUQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLFVBQVUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzFELElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxZQUFZLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM5RCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksWUFBWSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFOUQsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLEtBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQVosQ0FBWSxDQUFDLENBQUM7UUFDdEQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUU7WUFDaEIsS0FBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ25CLEtBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1FBQy9CLENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFVBQUMsQ0FBQztZQUNoQyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDbkIsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ3BCLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDaEIsQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLEtBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBM0MsQ0FBMkMsQ0FBQyxDQUFDO1FBRWhGLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLFVBQUMsQ0FBQztZQUMxQixLQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckMsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxVQUFDLENBQUM7WUFDNUIsS0FBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLG1DQUFXLEdBQWxCO1FBQ0ksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxLQUFLLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQztRQUNuQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUN0RCxVQUFVLENBQUMsVUFBQyxNQUFrQjtZQUMxQixNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDcEIsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDckIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBSU0sa0NBQVUsR0FBakIsVUFBa0IsQ0FBUSxFQUFFLENBQVEsRUFBRSxJQUFXO1FBQWpELGlCQVVDO1FBVEcsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekIsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3ZCLENBQUM7UUFDRCxJQUFJLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDdEQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM5QixVQUFVLENBQUM7WUFDUixLQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUN0RCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxvQ0FBWSxHQUFuQixVQUFvQixDQUFRLEVBQUUsQ0FBUSxFQUFFLElBQVc7UUFDL0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBQzdCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO0lBQ3RDLENBQUM7SUFFTyxtQ0FBVyxHQUFuQixVQUFvQixJQUFTLEVBQUUsS0FBVyxFQUFFLE1BQWM7UUFDdEQsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLFlBQVUsQ0FBQyxDQUFDLENBQUM7WUFDdkIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hDLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLGdCQUFtQixDQUFDLENBQUM7WUFDbkQsQ0FBQztZQUNELElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdEIsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDO2dCQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMxQyxNQUFNLENBQUM7UUFDWCxDQUFDO1FBRUQsSUFBSSxVQUFxQixDQUFDO1FBQzFCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMzQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsZUFBa0IsQ0FBQyxDQUFDO1FBQ3hELENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDdEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzNDLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNoRCxDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDO1lBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFFTywwQ0FBa0IsR0FBMUIsVUFBMkIsSUFBUztRQUNoQyxJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0QyxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0QyxJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0QyxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRU8scUNBQWEsR0FBckIsVUFBc0IsSUFBUyxFQUFFLEtBQVc7UUFDeEMsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLENBQUM7WUFBQyxNQUFNLENBQUMsZUFBa0IsQ0FBQztRQUNyRSxFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUFDLE1BQU0sQ0FBQyxnQkFBbUIsQ0FBQztRQUN0RSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUFDLE1BQU0sQ0FBQyxrQkFBcUIsQ0FBQztRQUN6RixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUFDLE1BQU0sQ0FBQyxtQkFBc0IsQ0FBQztRQUMxRixNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDbEIsQ0FBQztJQUVPLG9DQUFZLEdBQXBCLFVBQXFCLE1BQWE7UUFDOUIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLGlCQUFjLE1BQU0sR0FBRyxHQUFHLFNBQUssQ0FBQztJQUMzRSxDQUFDO0lBRU8saUNBQVMsR0FBakIsVUFBa0IsS0FBVztRQUN6QixNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFDLElBQUksQ0FBQyxXQUFXLEVBQUMsSUFBSSxDQUFDLFVBQVUsRUFBQyxJQUFJLENBQUMsVUFBVSxFQUFDLElBQUksQ0FBQyxZQUFZLEVBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3pILENBQUM7SUFFTSwyQ0FBbUIsR0FBMUI7UUFDSSxJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDdkUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDN0MsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDeEQsQ0FBQztRQUNELElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBRU8sNEJBQUksR0FBWixVQUFhLENBQXVCO1FBQ2hDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxVQUFVLElBQWEsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUMzQyxPQUFPLEVBQUUsS0FBSyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDM0IsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDbEMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxhQUFhLENBQUM7UUFDMUIsQ0FBQztRQUNELElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRU0scUNBQWEsR0FBcEIsVUFBcUIsT0FBZ0IsRUFBRSxNQUFjO1FBQ2pELElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxPQUFPLEtBQUssS0FBSyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxLQUFLLEtBQUssQ0FBQztZQUM3QixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEtBQUssT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPO1lBQ3BELElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFlBQVksS0FBSyxPQUFPLENBQUMsS0FBSyxDQUFDLFlBQVk7WUFDOUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxLQUFLLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUztZQUN4RCxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsS0FBSyxPQUFPLENBQUMsS0FBSyxDQUFDLGdCQUFnQjtZQUN0RSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxjQUFjLEtBQUssT0FBTyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUM7UUFFdkUsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFFdkIsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUNmLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUN4QixDQUFDO1FBRUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRTNDLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFTyxrQ0FBVSxHQUFsQjtRQUNJLElBQUksRUFBRSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUNwRCxFQUFFLENBQUMsU0FBUyxHQUFHLE1BQU0sR0FBRywwSkFHVyxDQUFDO1FBRXBDLE1BQU0sQ0FBQyxFQUFFLENBQUM7SUFDZCxDQUFDO0lBRU8sbUNBQVcsR0FBbkIsVUFBb0IsSUFBUyxFQUFFLE9BQVk7UUFDdkMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBSU8sb0NBQVksR0FBcEI7UUFDSSxJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxJQUFJLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyRSxJQUFJLFlBQVksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRW5ELElBQUksT0FBTyxHQUFHLGNBQWMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO1FBRWhFLElBQUksZUFBZSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQ2hELEVBQUUsQ0FBQyxDQUFDLGVBQWUsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzNCLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNyRCxDQUFDO1FBRUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXRDLElBQUksY0FBYyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDcEYsY0FBYyxHQUFHLGNBQWMsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2pGLGNBQWMsR0FBRyxjQUFjLENBQUMsT0FBTyxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQy9GLGNBQWMsR0FBRyxjQUFjLENBQUMsT0FBTyxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDbkcsY0FBYyxHQUFHLGNBQWMsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3JGLGNBQWMsR0FBRyxjQUFjLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUV6RCxZQUFZLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQztRQUMvQixFQUFFLENBQUMsQ0FBTyxZQUFhLENBQUMsVUFBVSxDQUFDLENBQUEsQ0FBQztZQUMxQixZQUFhLENBQUMsVUFBVSxDQUFDLE9BQU8sR0FBRyxjQUFjLENBQUM7UUFDNUQsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osWUFBWSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7UUFDdEUsQ0FBQztRQUVELElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVPLDBDQUFrQixHQUExQjtRQUNJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDdkQsRUFBRSxDQUFDLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDN0QsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QyxDQUFDO1FBQ0wsQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQXZDTSw0QkFBYyxHQUFVLENBQUMsQ0FBQztJQXdDckMsb0JBQUM7QUFBRCxDQXJPQSxBQXFPQyxJQUFBO0FDNU9ELElBQUksTUFBTSxHQUFHLHFqQkFBcWpCLENBQUM7QUNBbmtCLCtDQUErQztBQUMvQztJQUFxQiwwQkFBTTtJQU92QixnQkFBc0IsT0FBbUIsRUFBWSxTQUFxQjtRQUN0RSxpQkFBTyxDQUFDO1FBRFUsWUFBTyxHQUFQLE9BQU8sQ0FBWTtRQUFZLGNBQVMsR0FBVCxTQUFTLENBQVk7UUFMaEUsUUFBRyxHQUFRLElBQUksSUFBSSxFQUFFLENBQUM7UUFDdEIsUUFBRyxHQUFRLElBQUksSUFBSSxFQUFFLENBQUM7UUFNNUIsSUFBSSxDQUFDLGVBQWUsR0FBZ0IsU0FBUyxDQUFDLGFBQWEsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0lBQzNGLENBQUM7SUFFTSx1QkFBTSxHQUFiLFVBQWMsSUFBUyxFQUFFLFVBQXFCO0lBQzlDLENBQUM7SUFFTSx1QkFBTSxHQUFiLFVBQWMsVUFBcUI7UUFDL0IsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxLQUFLLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQztRQUNuQyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDNUMsVUFBVSxDQUFDLFVBQUMsTUFBa0I7WUFDMUIsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3BCLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3pCLENBQUM7SUFFUywwQkFBUyxHQUFuQixVQUFvQixFQUFjO1FBQzlCLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixFQUFFLENBQUMsSUFBSSxDQUFDO1FBQ3RGLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixFQUFFLENBQUMsR0FBRyxDQUFDO1FBQ3BGLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFFTSw4QkFBYSxHQUFwQixVQUFxQixPQUFnQjtJQUVyQyxDQUFDO0lBRVMsdUJBQU0sR0FBaEI7UUFDSSxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVNLHVCQUFNLEdBQWI7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztJQUNwQixDQUFDO0lBRU0sdUJBQU0sR0FBYjtRQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO0lBQ3BCLENBQUM7SUFFTSxnQ0FBZSxHQUF0QixVQUF1QixJQUFTO1FBQzVCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUVTLDhCQUFhLEdBQXZCLFVBQXdCLFVBQXFCLEVBQUUsTUFBa0I7UUFDN0QsRUFBRSxDQUFDLENBQUMsVUFBVSxLQUFLLGtCQUFxQixDQUFDLENBQUMsQ0FBQztZQUN2QyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQ2hELENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxLQUFLLG1CQUFzQixDQUFDLENBQUMsQ0FBQztZQUMvQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxLQUFLLGVBQWtCLENBQUMsQ0FBQyxDQUFDO1lBQzNDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUM3QyxDQUFDO0lBQ0wsQ0FBQztJQUVTLDZCQUFZLEdBQXRCLFVBQXVCLFVBQXFCLEVBQUUsTUFBa0I7UUFDNUQsSUFBSSxHQUFHLENBQUM7UUFDUixFQUFFLENBQUMsQ0FBQyxVQUFVLEtBQUssa0JBQXFCLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLEdBQUcsR0FBRyxvQkFBb0IsQ0FBQztRQUMvQixDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsS0FBSyxtQkFBc0IsQ0FBQyxDQUFDLENBQUM7WUFDL0MsR0FBRyxHQUFHLHFCQUFxQixDQUFDO1FBQ2hDLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxLQUFLLGVBQWtCLENBQUMsQ0FBQyxDQUFDO1lBQzNDLEdBQUcsR0FBRyxrQkFBa0IsQ0FBQztRQUM3QixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixHQUFHLEdBQUcsbUJBQW1CLENBQUM7UUFDOUIsQ0FBQztRQUNELE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLFVBQVUsQ0FBQyxVQUFDLENBQUM7WUFDVCxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM1QixDQUFDLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3BCLENBQUM7SUFDTCxhQUFDO0FBQUQsQ0E3RUEsQUE2RUMsQ0E3RW9CLE1BQU0sR0E2RTFCO0FDOUVELGtDQUFrQztBQUVsQztJQUF5Qiw4QkFBTTtJQUMzQixvQkFBWSxPQUFtQixFQUFFLFNBQXFCO1FBRDFELGlCQThHQztRQTVHTyxrQkFBTSxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFFMUIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsa0NBQWtDLEVBQUUsVUFBQyxDQUFDO1lBQ3pELElBQUksRUFBRSxHQUFvQixDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUM7WUFFbkQsSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2xFLElBQUksS0FBSyxHQUFHLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNoRSxJQUFJLFdBQVcsR0FBRyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFckUsSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ2pELElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDNUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQixDQUFDO1lBQ0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUUxQixPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDbEIsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLFlBQVU7YUFDcEIsQ0FBQyxDQUFBO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxxQkFBcUIsRUFBRSxVQUFDLENBQUM7WUFDNUMsSUFBSSxFQUFFLEdBQTRCLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDN0QsSUFBSSxJQUFJLEdBQUcsS0FBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLE1BQU0sR0FBRyxLQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2hDLE9BQU8sQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFO2dCQUN4QixDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFO2dCQUNoQixDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDO2dCQUNmLElBQUksRUFBRSxJQUFJO2FBQ2QsQ0FBQyxDQUFDO1FBQ04sQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBSU0sMkJBQU0sR0FBYixVQUFjLElBQVMsRUFBRSxVQUFxQjtRQUMxQyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFN0QsSUFBSSxLQUFLLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ3pDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBRWxDLElBQUksR0FBRyxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUN2QyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRXpFLElBQUksUUFBUSxHQUFHLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBRXpDLElBQUksQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUV0RCxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFM0MsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUN6QixJQUFJLFFBQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFDMUQsUUFBTSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNqRCxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFNLENBQUMsQ0FBQztRQUNwQyxDQUFDO1FBRUQsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBRWQsR0FBRyxDQUFDO1lBQ0EsSUFBSSxXQUFXLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1lBRWhFLFdBQVcsQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRXRELEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsS0FBSyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUMxQyxXQUFXLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztZQUNwRSxDQUFDO1lBRUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFckMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDekMsS0FBSyxFQUFFLENBQUM7UUFDWixDQUFDLFFBQVEsUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFHLEdBQUcsQ0FBQyxPQUFPLEVBQUUsRUFBRTtRQUc3QyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFFN0MsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBRWQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVNLG9DQUFlLEdBQXRCLFVBQXVCLFlBQWlCO1FBQ3BDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFFckQsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQ2hGLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzNDLElBQUksRUFBRSxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUIsSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ3BELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsS0FBSyxZQUFZLENBQUMsV0FBVyxFQUFFO2dCQUNqRCxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssWUFBWSxDQUFDLFFBQVEsRUFBRTtnQkFDM0MsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzVDLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDeEMsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDM0MsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRU0sOEJBQVMsR0FBaEI7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUN2QixDQUFDO0lBRU0sNkJBQVEsR0FBZjtRQUNJLE1BQU0sQ0FBQyxZQUFVLENBQUM7SUFDdEIsQ0FBQztJQUNMLGlCQUFDO0FBQUQsQ0E5R0EsQUE4R0MsQ0E5R3dCLE1BQU0sR0E4RzlCO0FDaEhELGtDQUFrQztBQUVsQztJQUF5Qiw4QkFBTTtJQUMzQixvQkFBWSxPQUFtQixFQUFFLFNBQXFCO1FBRDFELGlCQXdIQztRQXRITyxrQkFBTSxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFrRXRCLGFBQVEsR0FBVSxDQUFDLENBQUM7UUFoRXhCLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLGtCQUFrQixFQUFFO1lBQ3ZDLFNBQVMsRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLEtBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQWpCLENBQWlCO1lBQ25DLFFBQVEsRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLEtBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQWhCLENBQWdCO1lBQ2pDLE9BQU8sRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLEtBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQWYsQ0FBZTtTQUNsQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBS08sOEJBQVMsR0FBakIsVUFBa0IsQ0FBdUI7UUFDckMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQzlCLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxHQUFHO1lBQ3RDLENBQUMsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsR0FBRztZQUNyQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRTtTQUN0QixDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRU8sNkJBQVEsR0FBaEIsVUFBaUIsQ0FBdUI7UUFDcEMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2YsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2hDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxHQUFHO1lBQ3RDLENBQUMsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsR0FBRztZQUNyQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRTtTQUN0QixDQUFDLENBQUM7UUFDSCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuRCxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JDLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLEVBQUU7WUFBRSxDQUFDLElBQUksQ0FBQyxHQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDbkQsT0FBTyxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQUUsQ0FBQyxJQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ3BELElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFFTyw0QkFBTyxHQUFmO1FBQ0ksSUFBSSxJQUFJLEdBQUcsR0FBRyxHQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2hELElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7SUFFM0IsQ0FBQztJQUVPLDRCQUFPLEdBQWYsVUFBZ0IsQ0FBdUI7UUFDbkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVPLCtCQUFVLEdBQWxCLFVBQW1CLEtBQTBCO1FBQ3pDLE1BQU0sQ0FBQztZQUNILENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDO1lBQy9CLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1NBQ2xDLENBQUE7SUFDTCxDQUFDO0lBRU8sOEJBQVMsR0FBakI7UUFDSSxNQUFNLENBQUM7WUFDSCxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLElBQUksR0FBRyxHQUFHO1lBQ2pELENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLHFCQUFxQixFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUc7U0FDbkQsQ0FBQTtJQUNMLENBQUM7SUFFTyxzQ0FBaUIsR0FBekI7UUFDSSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsWUFBVSxJQUFJLENBQUMsUUFBUSxTQUFNLENBQUM7UUFDakUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLFlBQVUsSUFBSSxDQUFDLFFBQVEsU0FBTSxDQUFDO0lBQ2xFLENBQUM7SUFPTSwyQkFBTSxHQUFiLFVBQWMsSUFBUyxFQUFFLFVBQXFCO1FBQzFDLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUN6RSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBRTdFLElBQUksUUFBUSxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUU1QyxJQUFJLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDdEQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFFaEQsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRTNDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDMUIsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNqRCxJQUFJLFNBQVMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFDNUQsU0FBUyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3BELElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDNUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsYUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsVUFBTSxDQUFDO1lBQ3BELFNBQVMsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLGFBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsVUFBTSxDQUFDO1lBQzFELElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFFRCxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUMzRCxJQUFJLENBQUMsV0FBVyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUNsRSxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUMzRCxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDNUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUV2QyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDZCxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRU0sb0NBQWUsR0FBdEIsVUFBdUIsSUFBUztRQUM1QixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQzdDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDeEQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsS0FBSyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxRCxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUM3QixDQUFDO0lBQ0wsQ0FBQztJQUVNLDhCQUFTLEdBQWhCO1FBQ0ksTUFBTSxDQUFDLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFFTSw2QkFBUSxHQUFmO1FBQ0ksTUFBTSxDQUFDLFlBQVUsQ0FBQztJQUN0QixDQUFDO0lBQ0wsaUJBQUM7QUFBRCxDQXhIQSxBQXdIQyxDQXhId0IsTUFBTSxHQXdIOUI7QUMxSEQsa0NBQWtDO0FBRWxDO0lBQTJCLGdDQUFNO0lBQzdCLHNCQUFZLE9BQW1CLEVBQUUsU0FBcUI7UUFDbEQsa0JBQU0sT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFTSxvQ0FBYSxHQUFwQixVQUFxQixPQUFnQjtJQUVyQyxDQUFDO0lBRU0sZ0NBQVMsR0FBaEI7UUFDSSxNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUVNLCtCQUFRLEdBQWY7UUFDSSxNQUFNLENBQUMsY0FBWSxDQUFDO0lBQ3hCLENBQUM7SUFDTCxtQkFBQztBQUFELENBaEJBLEFBZ0JDLENBaEIwQixNQUFNLEdBZ0JoQztBQ2xCRCxrQ0FBa0M7QUFFbEM7SUFBMEIsK0JBQU07SUFDNUIscUJBQVksT0FBbUIsRUFBRSxTQUFxQjtRQUQxRCxpQkFtRkM7UUFqRk8sa0JBQU0sT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRTFCLE1BQU0sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLG1DQUFtQyxFQUFFLFVBQUMsQ0FBQztZQUMxRCxJQUFJLEVBQUUsR0FBb0IsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDO1lBQ25ELElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNsRSxJQUFJLEtBQUssR0FBRyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7WUFFaEUsSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ2pELElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDNUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQixDQUFDO1lBRUQsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2xCLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxZQUFVO2FBQ3BCLENBQUMsQ0FBQztRQUNOLENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsc0JBQXNCLEVBQUUsVUFBQyxDQUFDO1lBQzdDLElBQUksRUFBRSxHQUE0QixDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzdELElBQUksSUFBSSxHQUFHLEtBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUN0RixJQUFJLE1BQU0sR0FBRyxLQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2hDLE9BQU8sQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFO2dCQUN4QixDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFO2dCQUNoQixDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFO2dCQUNoQixJQUFJLEVBQUUsSUFBSTthQUNkLENBQUMsQ0FBQztRQUNOLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLDRCQUFNLEdBQWIsVUFBYyxJQUFTLEVBQUUsVUFBcUI7UUFDMUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDM0MsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRS9DLElBQUksUUFBUSxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUU1QyxJQUFJLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUM7UUFFdEQsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRTNDLEdBQUcsQ0FBQztZQUNBLElBQUksWUFBWSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsc0JBQXNCLENBQUMsQ0FBQztZQUVsRSxZQUFZLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNwRSxZQUFZLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztZQUVqRSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUV0QyxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMvQyxDQUFDLFFBQVEsUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUU7UUFFbEQsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBRWQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVNLHFDQUFlLEdBQXRCLFVBQXVCLFlBQWlCO1FBQ3BDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFFckQsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBQ2xGLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzVDLElBQUksRUFBRSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ3BELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsS0FBSyxZQUFZLENBQUMsV0FBVyxFQUFFO2dCQUNqRCxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDOUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUN4QyxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUMzQyxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFFTSwrQkFBUyxHQUFoQjtRQUNJLE1BQU0sQ0FBQyxHQUFHLENBQUM7SUFDZixDQUFDO0lBRU0sOEJBQVEsR0FBZjtRQUNJLE1BQU0sQ0FBQyxhQUFXLENBQUM7SUFDdkIsQ0FBQztJQUNMLGtCQUFDO0FBQUQsQ0FuRkEsQUFtRkMsQ0FuRnlCLE1BQU0sR0FtRi9CO0FDckZELGtDQUFrQztBQUVsQztJQUEyQixnQ0FBTTtJQUM3QixzQkFBWSxPQUFtQixFQUFFLFNBQXFCO1FBQ2xELGtCQUFNLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRU0sb0NBQWEsR0FBcEIsVUFBcUIsT0FBZ0I7SUFFckMsQ0FBQztJQUVNLGdDQUFTLEdBQWhCO1FBQ0ksTUFBTSxDQUFDLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFFTSwrQkFBUSxHQUFmO1FBQ0ksTUFBTSxDQUFDLGNBQVksQ0FBQztJQUN4QixDQUFDO0lBQ0wsbUJBQUM7QUFBRCxDQWhCQSxBQWdCQyxDQWhCMEIsTUFBTSxHQWdCaEM7QUNsQkQsa0NBQWtDO0FBRWxDO0lBQXlCLDhCQUFNO0lBQzNCLG9CQUFZLE9BQW1CLEVBQUUsU0FBcUI7UUFEMUQsaUJBaUZDO1FBL0VPLGtCQUFNLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztRQUUxQixNQUFNLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxrQ0FBa0MsRUFBRSxVQUFDLENBQUM7WUFDekQsSUFBSSxFQUFFLEdBQW9CLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQztZQUNuRCxJQUFJLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7WUFFbEUsSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ2pELElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFdkIsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2xCLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxhQUFXO2FBQ3JCLENBQUMsQ0FBQTtRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUscUJBQXFCLEVBQUUsVUFBQyxDQUFDO1lBQzVDLElBQUksRUFBRSxHQUE0QixDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzdELElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUM3RSxJQUFJLE1BQU0sR0FBRyxLQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2hDLE9BQU8sQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFO2dCQUN4QixDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFO2dCQUNoQixDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFO2dCQUNoQixJQUFJLEVBQUUsSUFBSTthQUNkLENBQUMsQ0FBQztRQUNOLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLDJCQUFNLEdBQWIsVUFBYyxJQUFTLEVBQUUsVUFBcUI7UUFDMUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsR0FBQyxFQUFFLENBQUMsR0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDN0QsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsR0FBQyxFQUFFLENBQUMsR0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFNUQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM1QyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ3RELENBQUM7UUFFRCxJQUFJLFFBQVEsR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFFNUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBRXRELElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUUzQyxHQUFHLENBQUM7WUFDQSxJQUFJLFdBQVcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLHFCQUFxQixDQUFDLENBQUM7WUFFaEUsV0FBVyxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDMUQsV0FBVyxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFFaEUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFckMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDckQsQ0FBQyxRQUFRLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFFO1FBRW5ELElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUVkLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFTSxvQ0FBZSxHQUF0QixVQUF1QixZQUFpQjtRQUNwQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBRXJELElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUNoRixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUMzQyxJQUFJLEVBQUUsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlCLElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUNwRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEtBQUssWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDcEQsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUN4QyxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUMzQyxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFFTSw4QkFBUyxHQUFoQjtRQUNJLE1BQU0sQ0FBQyxHQUFHLENBQUM7SUFDZixDQUFDO0lBRU0sNkJBQVEsR0FBZjtRQUNJLE1BQU0sQ0FBQyxZQUFVLENBQUM7SUFDdEIsQ0FBQztJQUNMLGlCQUFDO0FBQUQsQ0FqRkEsQUFpRkMsQ0FqRndCLE1BQU0sR0FpRjlCO0FDbkZELElBQUksR0FBRyxHQUFDLHVsVEFBdWxULENBQUMiLCJmaWxlIjoiZGF0aXVtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKDxhbnk+d2luZG93KVsnRGF0aXVtJ10gPSBjbGFzcyBEYXRpdW0ge1xuICAgIHB1YmxpYyB1cGRhdGVPcHRpb25zOihvcHRpb25zOklPcHRpb25zKSA9PiB2b2lkO1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6SFRNTElucHV0RWxlbWVudCwgb3B0aW9uczpJT3B0aW9ucykge1xuICAgICAgICBsZXQgaW50ZXJuYWxzID0gbmV3IERhdGl1bUludGVybmFscyhlbGVtZW50LCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy51cGRhdGVPcHRpb25zID0gKG9wdGlvbnM6SU9wdGlvbnMpID0+IGludGVybmFscy51cGRhdGVPcHRpb25zKG9wdGlvbnMpO1xuICAgIH1cbn0iLCJjb25zdCBlbnVtIExldmVsIHtcbiAgICBZRUFSLCBNT05USCwgREFURSwgSE9VUixcbiAgICBNSU5VVEUsIFNFQ09ORCwgTk9ORVxufVxuXG5jbGFzcyBEYXRpdW1JbnRlcm5hbHMge1xuICAgIHByaXZhdGUgb3B0aW9uczpJT3B0aW9ucyA9IDxhbnk+e307XG4gICAgXG4gICAgcHJpdmF0ZSBpbnB1dDpJbnB1dDtcbiAgICBwcml2YXRlIHBpY2tlck1hbmFnZXI6UGlja2VyTWFuYWdlcjtcbiAgICBcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVsZW1lbnQ6SFRNTElucHV0RWxlbWVudCwgb3B0aW9uczpJT3B0aW9ucykge1xuICAgICAgICBpZiAoZWxlbWVudCA9PT0gdm9pZCAwKSB0aHJvdyAnZWxlbWVudCBpcyByZXF1aXJlZCc7XG4gICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdzcGVsbGNoZWNrJywgJ2ZhbHNlJyk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmlucHV0ID0gbmV3IElucHV0KGVsZW1lbnQpO1xuICAgICAgICB0aGlzLnBpY2tlck1hbmFnZXIgPSBuZXcgUGlja2VyTWFuYWdlcihlbGVtZW50KTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMudXBkYXRlT3B0aW9ucyhvcHRpb25zKTtcbiAgICAgICAgXG4gICAgICAgIGxpc3Rlbi5nb3RvKGVsZW1lbnQsIChlKSA9PiB0aGlzLmdvdG8oZS5kYXRlLCBlLmxldmVsLCBlLnVwZGF0ZSkpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5nb3RvKHRoaXMub3B0aW9uc1snZGVmYXVsdERhdGUnXSwgTGV2ZWwuTk9ORSwgdHJ1ZSk7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBnb3RvKGRhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWwsIHVwZGF0ZTpib29sZWFuID0gdHJ1ZSkge1xuICAgICAgICBpZiAoZGF0ZSA9PT0gdm9pZCAwKSBkYXRlID0gbmV3IERhdGUoKTtcbiAgICAgICAgXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMubWluRGF0ZSAhPT0gdm9pZCAwICYmIGRhdGUudmFsdWVPZigpIDwgdGhpcy5vcHRpb25zLm1pbkRhdGUudmFsdWVPZigpKSB7XG4gICAgICAgICAgICBkYXRlID0gbmV3IERhdGUodGhpcy5vcHRpb25zLm1pbkRhdGUudmFsdWVPZigpKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5tYXhEYXRlICE9PSB2b2lkIDAgJiYgZGF0ZS52YWx1ZU9mKCkgPiB0aGlzLm9wdGlvbnMubWF4RGF0ZS52YWx1ZU9mKCkpIHtcbiAgICAgICAgICAgIGRhdGUgPSBuZXcgRGF0ZSh0aGlzLm9wdGlvbnMubWF4RGF0ZS52YWx1ZU9mKCkpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0cmlnZ2VyLnZpZXdjaGFuZ2VkKHRoaXMuZWxlbWVudCwge1xuICAgICAgICAgICAgZGF0ZTogZGF0ZSxcbiAgICAgICAgICAgIGxldmVsOiBsZXZlbCxcbiAgICAgICAgICAgIHVwZGF0ZTogdXBkYXRlXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgdXBkYXRlT3B0aW9ucyhuZXdPcHRpb25zOklPcHRpb25zID0gPGFueT57fSkge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemUobmV3T3B0aW9ucywgdGhpcy5vcHRpb25zKTsgICAgICAgIFxuICAgICAgICB0aGlzLmlucHV0LnVwZGF0ZU9wdGlvbnModGhpcy5vcHRpb25zKTtcbiAgICAgICAgdGhpcy5waWNrZXJNYW5hZ2VyLnVwZGF0ZU9wdGlvbnModGhpcy5vcHRpb25zLCB0aGlzLmlucHV0LmdldExldmVscygpKTtcbiAgICB9XG59IiwiZnVuY3Rpb24gT3B0aW9uRXhjZXB0aW9uKG1zZzpzdHJpbmcpIHtcbiAgICByZXR1cm4gYFtEYXRpdW0gT3B0aW9uIEV4Y2VwdGlvbl1cXG4gICR7bXNnfVxcbiAgU2VlIGh0dHA6Ly9kYXRpdW0uaW8vZG9jdW1lbnRhdGlvbiBmb3IgZG9jdW1lbnRhdGlvbi5gO1xufVxuXG5jbGFzcyBPcHRpb25TYW5pdGl6ZXIge1xuICAgIFxuICAgIHN0YXRpYyBkZmx0RGF0ZTpEYXRlID0gbmV3IERhdGUoKTtcbiAgICBcbiAgICBzdGF0aWMgc2FuaXRpemVEaXNwbGF5QXMoZGlzcGxheUFzOmFueSwgZGZsdDpzdHJpbmcgPSAnaDptbWEgTU1NIEQsIFlZWVknKSB7XG4gICAgICAgIGlmIChkaXNwbGF5QXMgPT09IHZvaWQgMCkgcmV0dXJuIGRmbHQ7XG4gICAgICAgIGlmICh0eXBlb2YgZGlzcGxheUFzICE9PSAnc3RyaW5nJykgdGhyb3cgT3B0aW9uRXhjZXB0aW9uKCdUaGUgXCJkaXNwbGF5QXNcIiBvcHRpb24gbXVzdCBiZSBhIHN0cmluZycpO1xuICAgICAgICByZXR1cm4gZGlzcGxheUFzO1xuICAgIH1cbiAgICBcbiAgICBzdGF0aWMgc2FuaXRpemVNaW5EYXRlKG1pbkRhdGU6YW55LCBkZmx0OkRhdGUgPSB2b2lkIDApIHtcbiAgICAgICAgaWYgKG1pbkRhdGUgPT09IHZvaWQgMCkgcmV0dXJuIGRmbHQ7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShtaW5EYXRlKTsgLy9UT0RPIGZpZ3VyZSB0aGlzIG91dCB5ZXNcbiAgICB9XG4gICAgXG4gICAgc3RhdGljIHNhbml0aXplTWF4RGF0ZShtYXhEYXRlOmFueSwgZGZsdDpEYXRlID0gdm9pZCAwKSB7XG4gICAgICAgIGlmIChtYXhEYXRlID09PSB2b2lkIDApIHJldHVybiBkZmx0O1xuICAgICAgICByZXR1cm4gbmV3IERhdGUobWF4RGF0ZSk7IC8vVE9ETyBmaWd1cmUgdGhpcyBvdXQgXG4gICAgfVxuICAgIFxuICAgIHN0YXRpYyBzYW5pdGl6ZURlZmF1bHREYXRlKGRlZmF1bHREYXRlOmFueSwgZGZsdDpEYXRlID0gdGhpcy5kZmx0RGF0ZSkge1xuICAgICAgICBpZiAoZGVmYXVsdERhdGUgPT09IHZvaWQgMCkgcmV0dXJuIGRmbHQ7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShkZWZhdWx0RGF0ZSk7IC8vVE9ETyBmaWd1cmUgdGhpcyBvdXRcbiAgICB9XG4gICAgICAgIFxuICAgIHN0YXRpYyBzYW5pdGl6ZUNvbG9yKGNvbG9yOmFueSkge1xuICAgICAgICBsZXQgdGhyZWVIZXggPSAnXFxcXHMqI1tBLUZhLWYwLTldezN9XFxcXHMqJztcbiAgICAgICAgbGV0IHNpeEhleCA9ICdcXFxccyojW0EtRmEtZjAtOV17Nn1cXFxccyonO1xuICAgICAgICBsZXQgcmdiID0gJ1xcXFxzKnJnYlxcXFwoXFxcXHMqWzAtOV17MSwzfVxcXFxzKixcXFxccypbMC05XXsxLDN9XFxcXHMqLFxcXFxzKlswLTldezEsM31cXFxccypcXFxcKVxcXFxzKic7XG4gICAgICAgIGxldCByZ2JhID0gJ1xcXFxzKnJnYmFcXFxcKFxcXFxzKlswLTldezEsM31cXFxccyosXFxcXHMqWzAtOV17MSwzfVxcXFxzKixcXFxccypbMC05XXsxLDN9XFxcXHMqXFxcXCxcXFxccypbMC05XSpcXFxcLlswLTldK1xcXFxzKlxcXFwpXFxcXHMqJztcbiAgICAgICAgbGV0IHNhbml0aXplQ29sb3JSZWdleCA9IG5ldyBSZWdFeHAoYF4oKCR7dGhyZWVIZXh9KXwoJHtzaXhIZXh9KXwoJHtyZ2J9KXwoJHtyZ2JhfSkpJGApO1xuXG4gICAgICAgIGlmIChjb2xvciA9PT0gdm9pZCAwKSB0aHJvdyBPcHRpb25FeGNlcHRpb24oXCJBbGwgdGhlbWUgY29sb3JzIChwcmltYXJ5LCBwcmltYXJ5X3RleHQsIHNlY29uZGFyeSwgc2Vjb25kYXJ5X3RleHQsIHNlY29uZGFyeV9hY2NlbnQpIG11c3QgYmUgZGVmaW5lZFwiKTtcbiAgICAgICAgaWYgKCFzYW5pdGl6ZUNvbG9yUmVnZXgudGVzdChjb2xvcikpIHRocm93IE9wdGlvbkV4Y2VwdGlvbihcIkFsbCB0aGVtZSBjb2xvcnMgbXVzdCBiZSB2YWxpZCByZ2IsIHJnYmEsIG9yIGhleCBjb2RlXCIpO1xuICAgICAgICByZXR1cm4gPHN0cmluZz5jb2xvcjtcbiAgICB9XG4gICAgXG4gICAgc3RhdGljIHNhbml0aXplVGhlbWUodGhlbWU6YW55LCBkZmx0OmFueSA9IFwibWF0ZXJpYWxcIik6SVRoZW1lIHtcbiAgICAgICAgaWYgKHRoZW1lID09PSB2b2lkIDApIHJldHVybiBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVUaGVtZShkZmx0LCB2b2lkIDApO1xuICAgICAgICBpZiAodHlwZW9mIHRoZW1lID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgc3dpdGNoKHRoZW1lKSB7XG4gICAgICAgICAgICBjYXNlICdsaWdodCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxJVGhlbWU+e1xuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5OiAnI2VlZScsXG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnlfdGV4dDogJyM2NjYnLFxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnk6ICcjZmZmJyxcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5X3RleHQ6ICcjNjY2JyxcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5X2FjY2VudDogJyM2NjYnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAnZGFyayc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxJVGhlbWU+e1xuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5OiAnIzQ0NCcsXG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnlfdGV4dDogJyNlZWUnLFxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnk6ICcjMzMzJyxcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5X3RleHQ6ICcjZWVlJyxcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5X2FjY2VudDogJyNmZmYnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAnbWF0ZXJpYWwnOlxuICAgICAgICAgICAgICAgIHJldHVybiA8SVRoZW1lPntcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeTogJyMwMTk1ODcnLFxuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5X3RleHQ6ICcjZmZmJyxcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5OiAnI2ZmZicsXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeV90ZXh0OiAnIzg4OCcsXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeV9hY2NlbnQ6ICcjMDE5NTg3J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgXCJOYW1lIG9mIHRoZW1lIG5vdCB2YWxpZC5cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhlbWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICByZXR1cm4gPElUaGVtZT4ge1xuICAgICAgICAgICAgICAgIHByaW1hcnk6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZUNvbG9yKHRoZW1lWydwcmltYXJ5J10pLFxuICAgICAgICAgICAgICAgIHNlY29uZGFyeTogT3B0aW9uU2FuaXRpemVyLnNhbml0aXplQ29sb3IodGhlbWVbJ3NlY29uZGFyeSddKSxcbiAgICAgICAgICAgICAgICBwcmltYXJ5X3RleHQ6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZUNvbG9yKHRoZW1lWydwcmltYXJ5X3RleHQnXSksXG4gICAgICAgICAgICAgICAgc2Vjb25kYXJ5X3RleHQ6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZUNvbG9yKHRoZW1lWydzZWNvbmRhcnlfdGV4dCddKSxcbiAgICAgICAgICAgICAgICBzZWNvbmRhcnlfYWNjZW50OiBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVDb2xvcih0aGVtZVsnc2Vjb25kYXJ5X2FjY2VudCddKVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgT3B0aW9uRXhjZXB0aW9uKCdUaGUgXCJ0aGVtZVwiIG9wdGlvbiBtdXN0IGJlIG9iamVjdCBvciBzdHJpbmcnKTtcbiAgICAgICAgfVxuICAgIH0gXG4gICAgXG4gICAgc3RhdGljIHNhbml0aXplTWlsaXRhcnlUaW1lKG1pbGl0YXJ5VGltZTphbnksIGRmbHQ6Ym9vbGVhbiA9IGZhbHNlKSB7XG4gICAgICAgIGlmIChtaWxpdGFyeVRpbWUgPT09IHZvaWQgMCkgcmV0dXJuIGRmbHQ7XG4gICAgICAgIGlmICh0eXBlb2YgbWlsaXRhcnlUaW1lICE9PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICAgIHRocm93IE9wdGlvbkV4Y2VwdGlvbignVGhlIFwibWlsaXRhcnlUaW1lXCIgb3B0aW9uIG11c3QgYmUgYSBib29sZWFuJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDxib29sZWFuPm1pbGl0YXJ5VGltZTtcbiAgICB9XG4gICAgXG4gICAgc3RhdGljIHNhbml0aXplKG9wdGlvbnM6SU9wdGlvbnMsIGRlZmF1bHRzOklPcHRpb25zKSB7XG4gICAgICAgIGxldCBvcHRzOklPcHRpb25zID0ge1xuICAgICAgICAgICAgZGlzcGxheUFzOiBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVEaXNwbGF5QXMob3B0aW9uc1snZGlzcGxheUFzJ10sIGRlZmF1bHRzLmRpc3BsYXlBcyksXG4gICAgICAgICAgICBtaW5EYXRlOiBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVNaW5EYXRlKG9wdGlvbnNbJ21pbkRhdGUnXSwgZGVmYXVsdHMubWluRGF0ZSksXG4gICAgICAgICAgICBtYXhEYXRlOiBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVNYXhEYXRlKG9wdGlvbnNbJ21heERhdGUnXSwgZGVmYXVsdHMubWF4RGF0ZSksXG4gICAgICAgICAgICBkZWZhdWx0RGF0ZTogT3B0aW9uU2FuaXRpemVyLnNhbml0aXplRGVmYXVsdERhdGUob3B0aW9uc1snZGVmYXVsdERhdGUnXSwgZGVmYXVsdHMuZGVmYXVsdERhdGUpLFxuICAgICAgICAgICAgdGhlbWU6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZVRoZW1lKG9wdGlvbnNbJ3RoZW1lJ10sIGRlZmF1bHRzLnRoZW1lKSxcbiAgICAgICAgICAgIG1pbGl0YXJ5VGltZTogT3B0aW9uU2FuaXRpemVyLnNhbml0aXplTWlsaXRhcnlUaW1lKG9wdGlvbnNbJ21pbGl0YXJ5VGltZSddLCBkZWZhdWx0cy5taWxpdGFyeVRpbWUpXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBvcHRzO1xuICAgIH1cbn0iLCJjbGFzcyBDb21tb24ge1xuICAgIHByb3RlY3RlZCBnZXRNb250aHMoKSB7XG4gICAgICAgIHJldHVybiBbXCJKYW51YXJ5XCIsIFwiRmVicnVhcnlcIiwgXCJNYXJjaFwiLCBcIkFwcmlsXCIsIFwiTWF5XCIsIFwiSnVuZVwiLCBcIkp1bHlcIiwgXCJBdWd1c3RcIiwgXCJTZXB0ZW1iZXJcIiwgXCJPY3RvYmVyXCIsIFwiTm92ZW1iZXJcIiwgXCJEZWNlbWJlclwiXTtcbiAgICB9XG4gICAgXG4gICAgcHJvdGVjdGVkIGdldFNob3J0TW9udGhzKCkge1xuICAgICAgICByZXR1cm4gW1wiSmFuXCIsIFwiRmViXCIsIFwiTWFyXCIsIFwiQXByXCIsIFwiTWF5XCIsIFwiSnVuXCIsIFwiSnVsXCIsIFwiQXVnXCIsIFwiU2VwXCIsIFwiT2N0XCIsIFwiTm92XCIsIFwiRGVjXCJdO1xuICAgIH1cbiAgICBcbiAgICBwcm90ZWN0ZWQgZ2V0RGF5cygpIHtcbiAgICAgICAgcmV0dXJuIFtcIlN1bmRheVwiLCBcIk1vbmRheVwiLCBcIlR1ZXNkYXlcIiwgXCJXZWRuZXNkYXlcIiwgXCJUaHVyc2RheVwiLCBcIkZyaWRheVwiLCBcIlNhdHVyZGF5XCJdO1xuICAgIH1cbiAgICBcbiAgICBwcm90ZWN0ZWQgZ2V0U2hvcnREYXlzKCkge1xuICAgICAgICByZXR1cm4gW1wiU3VuXCIsIFwiTW9uXCIsIFwiVHVlXCIsIFwiV2VkXCIsIFwiVGh1XCIsIFwiRnJpXCIsIFwiU2F0XCJdO1xuICAgIH1cbiAgICBcbiAgICBwcm90ZWN0ZWQgZGF5c0luTW9udGgoZGF0ZTpEYXRlKSB7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSArIDEsIDApLmdldERhdGUoKTtcbiAgICB9XG4gICAgXG4gICAgcHJvdGVjdGVkIGdldEhvdXJzKGRhdGU6RGF0ZSk6c3RyaW5nIHtcbiAgICAgICAgbGV0IG51bSA9IGRhdGUuZ2V0SG91cnMoKTtcbiAgICAgICAgaWYgKG51bSA9PT0gMCkgbnVtID0gMTI7XG4gICAgICAgIGlmIChudW0gPiAxMikgbnVtIC09IDEyO1xuICAgICAgICByZXR1cm4gbnVtLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIFxuICAgIHByb3RlY3RlZCBnZXREZWNhZGUoZGF0ZTpEYXRlKTpzdHJpbmcge1xuICAgICAgICByZXR1cm4gYCR7TWF0aC5mbG9vcihkYXRlLmdldEZ1bGxZZWFyKCkvMTApKjEwfSAtICR7TWF0aC5jZWlsKChkYXRlLmdldEZ1bGxZZWFyKCkgKyAxKS8xMCkqMTB9YDtcbiAgICB9XG4gICAgXG4gICAgcHJvdGVjdGVkIGdldE1lcmlkaWVtKGRhdGU6RGF0ZSk6c3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGRhdGUuZ2V0SG91cnMoKSA8IDEyID8gJ2FtJyA6ICdwbSc7XG4gICAgfVxuICAgIFxuICAgIHByb3RlY3RlZCBwYWQobnVtOm51bWJlcnxzdHJpbmcsIHNpemU6bnVtYmVyID0gMikge1xuICAgICAgICBsZXQgc3RyID0gbnVtLnRvU3RyaW5nKCk7XG4gICAgICAgIHdoaWxlKHN0ci5sZW5ndGggPCBzaXplKSBzdHIgPSAnMCcgKyBzdHI7XG4gICAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICAgIFxuICAgIHByb3RlY3RlZCB0cmltKHN0cjpzdHJpbmcpIHtcbiAgICAgICAgd2hpbGUgKHN0clswXSA9PT0gJzAnICYmIHN0ci5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICBzdHIgPSBzdHIuc3Vic3RyKDEsIHN0ci5sZW5ndGgpOyAgXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG4gICAgXG4gICAgcHJvdGVjdGVkIGdldENsaWVudENvb3IoZTphbnkpOnt4Om51bWJlciwgeTpudW1iZXJ9IHtcbiAgICAgICAgaWYgKGUuY2xpZW50WCAhPT0gdm9pZCAwKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHg6IGUuY2xpZW50WCxcbiAgICAgICAgICAgICAgICB5OiBlLmNsaWVudFlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRYLFxuICAgICAgICAgICAgeTogZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRZXG4gICAgICAgIH1cbiAgICB9XG59IiwiQ3VzdG9tRXZlbnQgPSAoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gdXNlTmF0aXZlICgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBjdXN0b21FdmVudCA9IG5ldyBDdXN0b21FdmVudCgnYScsIHsgZGV0YWlsOiB7IGI6ICdiJyB9IH0pO1xuICAgICAgICAgICAgcmV0dXJuICAnYScgPT09IGN1c3RvbUV2ZW50LnR5cGUgJiYgJ2InID09PSBjdXN0b21FdmVudC5kZXRhaWwuYjtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgXG4gICAgaWYgKHVzZU5hdGl2ZSgpKSB7XG4gICAgICAgIHJldHVybiA8YW55PkN1c3RvbUV2ZW50O1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRvY3VtZW50LmNyZWF0ZUV2ZW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIElFID49IDlcbiAgICAgICAgcmV0dXJuIDxhbnk+ZnVuY3Rpb24odHlwZTpzdHJpbmcsIHBhcmFtczpDdXN0b21FdmVudEluaXQpIHtcbiAgICAgICAgICAgIGxldCBlID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0N1c3RvbUV2ZW50Jyk7XG4gICAgICAgICAgICBpZiAocGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgZS5pbml0Q3VzdG9tRXZlbnQodHlwZSwgcGFyYW1zLmJ1YmJsZXMsIHBhcmFtcy5jYW5jZWxhYmxlLCBwYXJhbXMuZGV0YWlsKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZS5pbml0Q3VzdG9tRXZlbnQodHlwZSwgZmFsc2UsIGZhbHNlLCB2b2lkIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGU7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBJRSA+PSA4XG4gICAgICAgIHJldHVybiA8YW55PmZ1bmN0aW9uKHR5cGU6c3RyaW5nLCBwYXJhbXM6Q3VzdG9tRXZlbnRJbml0KSB7XG4gICAgICAgICAgICBsZXQgZSA9ICg8YW55PmRvY3VtZW50KS5jcmVhdGVFdmVudE9iamVjdCgpO1xuICAgICAgICAgICAgZS50eXBlID0gdHlwZTtcbiAgICAgICAgICAgIGlmIChwYXJhbXMpIHtcbiAgICAgICAgICAgICAgICBlLmJ1YmJsZXMgPSBCb29sZWFuKHBhcmFtcy5idWJibGVzKTtcbiAgICAgICAgICAgICAgICBlLmNhbmNlbGFibGUgPSBCb29sZWFuKHBhcmFtcy5jYW5jZWxhYmxlKTtcbiAgICAgICAgICAgICAgICBlLmRldGFpbCA9IHBhcmFtcy5kZXRhaWw7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGUuYnViYmxlcyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGUuY2FuY2VsYWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGUuZGV0YWlsID0gdm9pZCAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGU7XG4gICAgICAgIH0gXG4gICAgfSAgXG59KSgpO1xuIiwiaW50ZXJmYWNlIElMaXN0ZW5lclJlZmVyZW5jZSB7XG4gICAgZWxlbWVudDogRWxlbWVudHxEb2N1bWVudHxXaW5kb3c7XG4gICAgcmVmZXJlbmNlOiBFdmVudExpc3RlbmVyO1xuICAgIGV2ZW50OiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBJRHJhZ0NhbGxiYWNrcyB7XG4gICAgZHJhZ1N0YXJ0PzooZT86TW91c2VFdmVudHxUb3VjaEV2ZW50KSA9PiB2b2lkO1xuICAgIGRyYWdNb3ZlPzooZT86TW91c2VFdmVudHxUb3VjaEV2ZW50KSA9PiB2b2lkO1xuICAgIGRyYWdFbmQ/OihlPzpNb3VzZUV2ZW50fFRvdWNoRXZlbnQpID0+IHZvaWQ7XG59XG5cbm5hbWVzcGFjZSBsaXN0ZW4ge1xuICAgIGxldCBtYXRjaGVzID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50Lm1hdGNoZXMgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50Lm1zTWF0Y2hlc1NlbGVjdG9yO1xuICAgIFxuICAgIGZ1bmN0aW9uIGhhbmRsZURlbGVnYXRlRXZlbnQocGFyZW50OkVsZW1lbnQsIGRlbGVnYXRlU2VsZWN0b3I6c3RyaW5nLCBjYWxsYmFjazooZT86TW91c2VFdmVudHxUb3VjaEV2ZW50KSA9PiB2b2lkKSB7XG4gICAgICAgIHJldHVybiAoZTpNb3VzZUV2ZW50fFRvdWNoRXZlbnQpID0+IHtcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSBlLnNyY0VsZW1lbnQgfHwgPEVsZW1lbnQ+ZS50YXJnZXQ7XG4gICAgICAgICAgICB3aGlsZSh0YXJnZXQgIT09IG51bGwgJiYgIXRhcmdldC5pc0VxdWFsTm9kZShwYXJlbnQpKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoZXMuY2FsbCh0YXJnZXQsIGRlbGVnYXRlU2VsZWN0b3IpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnRFbGVtZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGZ1bmN0aW9uIGF0dGFjaEV2ZW50c0RlbGVnYXRlKGV2ZW50czpzdHJpbmdbXSwgcGFyZW50OkVsZW1lbnQsIGRlbGVnYXRlU2VsZWN0b3I6c3RyaW5nLCBjYWxsYmFjazooZT86TW91c2VFdmVudHxUb3VjaEV2ZW50KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XG4gICAgICAgIGxldCBsaXN0ZW5lcnM6SUxpc3RlbmVyUmVmZXJlbmNlW10gPSBbXTtcbiAgICAgICAgZm9yIChsZXQga2V5IGluIGV2ZW50cykge1xuICAgICAgICAgICAgbGV0IGV2ZW50OnN0cmluZyA9IGV2ZW50c1trZXldO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgbmV3TGlzdGVuZXIgPSBoYW5kbGVEZWxlZ2F0ZUV2ZW50KHBhcmVudCwgZGVsZWdhdGVTZWxlY3RvciwgY2FsbGJhY2spO1xuICAgICAgICAgICAgbGlzdGVuZXJzLnB1c2goe1xuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IHBhcmVudCxcbiAgICAgICAgICAgICAgICByZWZlcmVuY2U6IG5ld0xpc3RlbmVyLFxuICAgICAgICAgICAgICAgIGV2ZW50OiBldmVudFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHBhcmVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBuZXdMaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxpc3RlbmVycztcbiAgICB9XG4gICAgXG4gICAgZnVuY3Rpb24gYXR0YWNoRXZlbnRzKGV2ZW50czpzdHJpbmdbXSwgZWxlbWVudDpFbGVtZW50fERvY3VtZW50fFdpbmRvdywgY2FsbGJhY2s6KGU/OmFueSkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xuICAgICAgICBsZXQgbGlzdGVuZXJzOklMaXN0ZW5lclJlZmVyZW5jZVtdID0gW107XG4gICAgICAgIGV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgICAgICAgbGlzdGVuZXJzLnB1c2goe1xuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGVsZW1lbnQsXG4gICAgICAgICAgICAgICAgcmVmZXJlbmNlOiBjYWxsYmFjayxcbiAgICAgICAgICAgICAgICBldmVudDogZXZlbnRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBjYWxsYmFjayk7IFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGxpc3RlbmVycztcbiAgICB9XG4gICAgXG4gICAgLy8gTkFUSVZFXG4gICAgXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGZvY3VzKGVsZW1lbnQ6RWxlbWVudHxEb2N1bWVudHxXaW5kb3csIGNhbGxiYWNrOihlPzpGb2N1c0V2ZW50KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydmb2N1cyddLCBlbGVtZW50LCAoZSkgPT4ge1xuICAgICAgICAgICAgY2FsbGJhY2soZSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBleHBvcnQgZnVuY3Rpb24gZG93bihlbGVtZW50OkVsZW1lbnR8RG9jdW1lbnR8V2luZG93LCBjYWxsYmFjazooZT86TW91c2VFdmVudHxUb3VjaEV2ZW50KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXTtcbiAgICBleHBvcnQgZnVuY3Rpb24gZG93bihwYXJlbnQ6RWxlbWVudHxEb2N1bWVudHxXaW5kb3csIGRlbGVnYXRlU2VsZWN0b3I6c3RyaW5nLCBjYWxsYmFjazooZT86TW91c2VFdmVudHxUb3VjaEV2ZW50KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXTtcbiAgICBleHBvcnQgZnVuY3Rpb24gZG93biguLi5wYXJhbXM6YW55W10pIHtcbiAgICAgICAgaWYgKHBhcmFtcy5sZW5ndGggPT09IDMpIHtcbiAgICAgICAgICAgIHJldHVybiBhdHRhY2hFdmVudHNEZWxlZ2F0ZShbJ21vdXNlZG93bicsICd0b3VjaHN0YXJ0J10sIHBhcmFtc1swXSwgcGFyYW1zWzFdLCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIHBhcmFtc1syXSg8YW55PmUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzKFsnbW91c2Vkb3duJywgJ3RvdWNoc3RhcnQnXSwgcGFyYW1zWzBdLCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIHBhcmFtc1sxXSg8YW55PmUpO1xuICAgICAgICAgICAgfSk7ICAgICAgICBcbiAgICAgICAgfSBcbiAgICB9O1xuICAgIFxuICAgIGV4cG9ydCBmdW5jdGlvbiB1cChlbGVtZW50OkVsZW1lbnR8RG9jdW1lbnR8V2luZG93LCBjYWxsYmFjazooZT86TW91c2VFdmVudCkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xuICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzKFsnbW91c2V1cCcsICd0b3VjaGVuZCddLCBlbGVtZW50LCAoZSkgPT4ge1xuICAgICAgICAgICAgY2FsbGJhY2soZSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBleHBvcnQgZnVuY3Rpb24gbW91c2Vkb3duKGVsZW1lbnQ6RWxlbWVudHxEb2N1bWVudHxXaW5kb3csIGNhbGxiYWNrOihlPzpNb3VzZUV2ZW50KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydtb3VzZWRvd24nXSwgZWxlbWVudCwgKGUpID0+IHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZXhwb3J0IGZ1bmN0aW9uIG1vdXNldXAoZWxlbWVudDpFbGVtZW50fERvY3VtZW50fFdpbmRvdywgY2FsbGJhY2s6KGU/Ok1vdXNlRXZlbnQpID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdIHtcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ21vdXNldXAnXSwgZWxlbWVudCwgKGUpID0+IHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHBhc3RlKGVsZW1lbnQ6RWxlbWVudHxEb2N1bWVudHxXaW5kb3csIGNhbGxiYWNrOihlPzpNb3VzZUV2ZW50KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydwYXN0ZSddLCBlbGVtZW50LCAoZSkgPT4ge1xuICAgICAgICAgICAgY2FsbGJhY2soZSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBleHBvcnQgZnVuY3Rpb24gdGFwKGVsZW1lbnQ6RWxlbWVudHxEb2N1bWVudCwgY2FsbGJhY2s6KGU/OkV2ZW50KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXTtcbiAgICBleHBvcnQgZnVuY3Rpb24gdGFwKHBhcmVudDpFbGVtZW50fERvY3VtZW50LCBkZWxlZ2F0ZVNlbGVjdG9yOnN0cmluZywgY2FsbGJhY2s6KGU/OkV2ZW50KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXTtcbiAgICBleHBvcnQgZnVuY3Rpb24gdGFwKC4uLnBhcmFtczphbnlbXSk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xuICAgICAgICBsZXQgc3RhcnRUb3VjaFg6bnVtYmVyLCBzdGFydFRvdWNoWTpudW1iZXI7XG4gICAgICAgIFxuICAgICAgICBsZXQgaGFuZGxlU3RhcnQgPSAoZTpUb3VjaEV2ZW50KSA9PiB7XG4gICAgICAgICAgICBzdGFydFRvdWNoWCA9IGUudG91Y2hlc1swXS5jbGllbnRYO1xuICAgICAgICAgICAgc3RhcnRUb3VjaFkgPSBlLnRvdWNoZXNbMF0uY2xpZW50WTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgbGV0IGhhbmRsZUVuZCA9IChlOlRvdWNoRXZlbnQsIGNhbGxiYWNrOihlPzpFdmVudCkgPT4gdm9pZCkgPT4ge1xuICAgICAgICAgICAgaWYgKGUuY2hhbmdlZFRvdWNoZXMgPT09IHZvaWQgMCkge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxldCB4RGlmZiA9IGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WCAtIHN0YXJ0VG91Y2hYO1xuICAgICAgICAgICAgbGV0IHlEaWZmID0gZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRZIC0gc3RhcnRUb3VjaFk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChNYXRoLnNxcnQoeERpZmYgKiB4RGlmZiArIHlEaWZmICogeURpZmYpIDwgMTApIHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGxldCBsaXN0ZW5lcnM6SUxpc3RlbmVyUmVmZXJlbmNlW10gPSBbXTtcbiAgICAgICAgXG4gICAgICAgIGlmIChwYXJhbXMubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuY29uY2F0KGF0dGFjaEV2ZW50c0RlbGVnYXRlKFsndG91Y2hzdGFydCddLCBwYXJhbXNbMF0sIHBhcmFtc1sxXSwgaGFuZGxlU3RhcnQpKTtcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IGxpc3RlbmVycy5jb25jYXQoYXR0YWNoRXZlbnRzRGVsZWdhdGUoWyd0b3VjaGVuZCcsICdjbGljayddLCBwYXJhbXNbMF0sIHBhcmFtc1sxXSwgKGU6VG91Y2hFdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGhhbmRsZUVuZChlLCBwYXJhbXNbMl0pO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9IGVsc2UgaWYgKHBhcmFtcy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IGxpc3RlbmVycy5jb25jYXQoYXR0YWNoRXZlbnRzKFsndG91Y2hzdGFydCddLCBwYXJhbXNbMF0sIGhhbmRsZVN0YXJ0KSk7XG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuY29uY2F0KGF0dGFjaEV2ZW50cyhbJ3RvdWNoZW5kJywgJ2NsaWNrJ10sIHBhcmFtc1swXSwgKGU6VG91Y2hFdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGhhbmRsZUVuZChlLCBwYXJhbXNbMV0pO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsaXN0ZW5lcnM7XG4gICAgfVxuICAgIFxuICAgIGZ1bmN0aW9uIHN3aXBlKGVsZW1lbnQ6RWxlbWVudCwgZGlyZWN0aW9uOnN0cmluZywgY2FsbGJhY2s6KGU/OkV2ZW50KSA9PiB2b2lkKSB7XG4gICAgICAgIGxldCBzdGFydFRvdWNoWDpudW1iZXIsIHN0YXJ0VG91Y2hZOm51bWJlciwgc3RhcnRUaW1lOm51bWJlcjtcbiAgICAgICAgbGV0IHRvdWNoTW92ZUxpc3RlbmVyOklMaXN0ZW5lclJlZmVyZW5jZTtcbiAgICAgICAgbGV0IHNjcm9sbGluZ0Rpc2FibGVkOmJvb2xlYW47XG4gICAgICAgIFxuICAgICAgICBhdHRhY2hFdmVudHMoWyd0b3VjaHN0YXJ0J10sIGVsZW1lbnQsIChlOlRvdWNoRXZlbnQpID0+IHtcbiAgICAgICAgICAgIHN0YXJ0VG91Y2hYID0gZS50b3VjaGVzWzBdLmNsaWVudFg7XG4gICAgICAgICAgICBzdGFydFRvdWNoWSA9IGUudG91Y2hlc1swXS5jbGllbnRZO1xuICAgICAgICAgICAgc3RhcnRUaW1lID0gbmV3IERhdGUoKS52YWx1ZU9mKCk7XG4gICAgICAgICAgICBzY3JvbGxpbmdEaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgdG91Y2hNb3ZlTGlzdGVuZXIgPSBhdHRhY2hFdmVudHMoWyd0b3VjaG1vdmUnXSwgZG9jdW1lbnQsIChlOlRvdWNoRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgeERpZmYgPSBNYXRoLmFicyhlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFggLSBzdGFydFRvdWNoWCk7XG4gICAgICAgICAgICAgICAgbGV0IHlEaWZmID0gTWF0aC5hYnMoZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRZIC0gc3RhcnRUb3VjaFkpO1xuICAgICAgICAgICAgICAgIGlmICh4RGlmZiA+IHlEaWZmICYmIHhEaWZmID4gMjApIHtcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsaW5nRGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoeURpZmYgPiB4RGlmZiAmJiB5RGlmZiA+IDIwKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbGluZ0Rpc2FibGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChuZXcgRGF0ZSgpLnZhbHVlT2YoKSAtIHN0YXJ0VGltZSA+IDUwMCkge1xuICAgICAgICAgICAgICAgICAgICBzY3JvbGxpbmdEaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoc2Nyb2xsaW5nRGlzYWJsZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pWzBdOyBcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBhdHRhY2hFdmVudHMoWyd0b3VjaGVuZCddLCBlbGVtZW50LCAoZTpUb3VjaEV2ZW50KSA9PiB7XG4gICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKHRvdWNoTW92ZUxpc3RlbmVyLmV2ZW50LCB0b3VjaE1vdmVMaXN0ZW5lci5yZWZlcmVuY2UpO1xuICAgICAgICAgICAgaWYgKHN0YXJ0VG91Y2hYID09PSB2b2lkIDAgfHwgc3RhcnRUb3VjaFkgPT09IHZvaWQgMCkgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKG5ldyBEYXRlKCkudmFsdWVPZigpIC0gc3RhcnRUaW1lID4gNTAwKSByZXR1cm47XG4gICAgICAgICAgICBsZXQgeERpZmYgPSBlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFggLSBzdGFydFRvdWNoWDtcbiAgICAgICAgICAgIGxldCB5RGlmZiA9IGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WSAtIHN0YXJ0VG91Y2hZO1xuICAgICAgICAgICAgaWYgKE1hdGguYWJzKHhEaWZmKSA+IE1hdGguYWJzKHlEaWZmKSAmJiBNYXRoLmFicyh4RGlmZikgPiAyMCkge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBpZiAoZGlyZWN0aW9uID09PSAnbGVmdCcgJiYgeERpZmYgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZGlyZWN0aW9uID09PSAncmlnaHQnICYmIHhEaWZmID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gc3dpcGVMZWZ0KGVsZW1lbnQ6RWxlbWVudCwgY2FsbGJhY2s6KGU/OkV2ZW50KSA9PiB2b2lkKSB7XG4gICAgICAgIHN3aXBlKGVsZW1lbnQsICdsZWZ0JywgY2FsbGJhY2spO1xuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBzd2lwZVJpZ2h0KGVsZW1lbnQ6RWxlbWVudCwgY2FsbGJhY2s6KGU/OkV2ZW50KSA9PiB2b2lkKSB7XG4gICAgICAgIHN3aXBlKGVsZW1lbnQsICdyaWdodCcsIGNhbGxiYWNrKTtcbiAgICB9XG4gICAgXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGRyYWcoZWxlbWVudDpFbGVtZW50LCBjYWxsYmFja3M6SURyYWdDYWxsYmFja3MpOnZvaWQ7XG4gICAgZXhwb3J0IGZ1bmN0aW9uIGRyYWcocGFyZW50OkVsZW1lbnQsIGRlbGVnYXRlU2VsZWN0b3I6c3RyaW5nLCBjYWxsYmFja3M6SURyYWdDYWxsYmFja3MpOnZvaWQ7XG4gICAgZXhwb3J0IGZ1bmN0aW9uIGRyYWcoLi4ucGFyYW1zOmFueVtdKTp2b2lkIHtcbiAgICAgICAgbGV0IGRyYWdnaW5nOmJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgXG4gICAgICAgIGxldCBjYWxsYmFja3M6SURyYWdDYWxsYmFja3MgPSBwYXJhbXNbcGFyYW1zLmxlbmd0aC0xXTtcbiAgICAgICAgXG4gICAgICAgIGxldCBzdGFydEV2ZW50cyA9IChlPzpNb3VzZUV2ZW50fFRvdWNoRXZlbnQpID0+IHtcbiAgICAgICAgICAgIGRyYWdnaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFja3MuZHJhZ1N0YXJ0ICE9PSB2b2lkIDApIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFja3MuZHJhZ1N0YXJ0KGUpO1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IGxpc3RlbmVyczpJTGlzdGVuZXJSZWZlcmVuY2VbXSA9IFtdO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuY29uY2F0KGF0dGFjaEV2ZW50cyhbJ3RvdWNobW92ZScsICdtb3VzZW1vdmUnXSwgZG9jdW1lbnQsIChlPzpNb3VzZUV2ZW50fFRvdWNoRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZHJhZ2dpbmcgJiYgY2FsbGJhY2tzLmRyYWdNb3ZlICE9PSB2b2lkIDApIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tzLmRyYWdNb3ZlKGUpO1xuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChhdHRhY2hFdmVudHMoWyd0b3VjaGVuZCcsICdtb3VzZXVwJ10sIGRvY3VtZW50LCAoZT86TW91c2VFdmVudHxUb3VjaEV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGRyYWdnaW5nICYmIGNhbGxiYWNrcy5kcmFnRW5kICE9PSB2b2lkIDApIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tzLmRyYWdFbmQoZSk7XG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZHJhZ2dpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICByZW1vdmVMaXN0ZW5lcnMobGlzdGVuZXJzKTsgICAgICAgICAgICBcbiAgICAgICAgICAgIH0pKTsgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAocGFyYW1zLmxlbmd0aCA9PT0gMykge1xuICAgICAgICAgICAgYXR0YWNoRXZlbnRzRGVsZWdhdGUoWyd0b3VjaHN0YXJ0JywgJ21vdXNlZG93biddLCBwYXJhbXNbMF0sIHBhcmFtc1sxXSwgc3RhcnRFdmVudHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXR0YWNoRXZlbnRzKFsndG91Y2hzdGFydCcsICdtb3VzZWRvd24nXSwgcGFyYW1zWzBdLCBzdGFydEV2ZW50cyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLy8gQ1VTVE9NXG4gICAgXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGdvdG8oZWxlbWVudDpFbGVtZW50LCBjYWxsYmFjazooZT86e2RhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWwsIHVwZGF0ZT86Ym9vbGVhbn0pID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdIHtcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ2RhdGl1bS1nb3RvJ10sIGVsZW1lbnQsIChlOkN1c3RvbUV2ZW50KSA9PiB7XG4gICAgICAgICAgICBjYWxsYmFjayhlLmRldGFpbCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBleHBvcnQgZnVuY3Rpb24gdmlld2NoYW5nZWQoZWxlbWVudDpFbGVtZW50LCBjYWxsYmFjazooZT86e2RhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWwsIHVwZGF0ZT86Ym9vbGVhbn0pID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdIHtcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ2RhdGl1bS12aWV3Y2hhbmdlZCddLCBlbGVtZW50LCAoZTpDdXN0b21FdmVudCkgPT4ge1xuICAgICAgICAgICAgY2FsbGJhY2soZS5kZXRhaWwpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZXhwb3J0IGZ1bmN0aW9uIG9wZW5CdWJibGUoZWxlbWVudDpFbGVtZW50LCBjYWxsYmFjazooZTp7eDpudW1iZXIsIHk6bnVtYmVyLCB0ZXh0OnN0cmluZ30pID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdIHtcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ2RhdGl1bS1vcGVuLWJ1YmJsZSddLCBlbGVtZW50LCAoZTpDdXN0b21FdmVudCkgPT4ge1xuICAgICAgICAgICAgY2FsbGJhY2soZS5kZXRhaWwpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZUJ1YmJsZShlbGVtZW50OkVsZW1lbnQsIGNhbGxiYWNrOihlOnt4Om51bWJlciwgeTpudW1iZXIsIHRleHQ6c3RyaW5nfSkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xuICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzKFsnZGF0aXVtLXVwZGF0ZS1idWJibGUnXSwgZWxlbWVudCwgKGU6Q3VzdG9tRXZlbnQpID0+IHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGUuZGV0YWlsKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGV4cG9ydCBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcnMobGlzdGVuZXJzOklMaXN0ZW5lclJlZmVyZW5jZVtdKSB7XG4gICAgICAgIGxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xuICAgICAgICAgICBsaXN0ZW5lci5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIobGlzdGVuZXIuZXZlbnQsIGxpc3RlbmVyLnJlZmVyZW5jZSk7IFxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbm5hbWVzcGFjZSB0cmlnZ2VyIHtcbiAgICBleHBvcnQgZnVuY3Rpb24gZ290byhlbGVtZW50OkVsZW1lbnQsIGRhdGE/OntkYXRlOkRhdGUsIGxldmVsOkxldmVsLCB1cGRhdGU/OmJvb2xlYW59KSB7XG4gICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2RhdGl1bS1nb3RvJywge1xuICAgICAgICAgICAgYnViYmxlczogZmFsc2UsXG4gICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZGV0YWlsOiBkYXRhXG4gICAgICAgIH0pKTtcbiAgICB9XG4gICAgXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHZpZXdjaGFuZ2VkKGVsZW1lbnQ6RWxlbWVudCwgZGF0YT86e2RhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWwsIHVwZGF0ZT86Ym9vbGVhbn0pIHtcbiAgICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnZGF0aXVtLXZpZXdjaGFuZ2VkJywge1xuICAgICAgICAgICAgYnViYmxlczogZmFsc2UsXG4gICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZGV0YWlsOiBkYXRhXG4gICAgICAgIH0pKTtcbiAgICB9XG4gICAgXG4gICAgZXhwb3J0IGZ1bmN0aW9uIG9wZW5CdWJibGUoZWxlbWVudDpFbGVtZW50LCBkYXRhOnt4Om51bWJlciwgeTpudW1iZXIsIHRleHQ6c3RyaW5nfSkge1xuICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdkYXRpdW0tb3Blbi1idWJibGUnLCB7XG4gICAgICAgICAgICBidWJibGVzOiBmYWxzZSxcbiAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICAgICAgICBkZXRhaWw6IGRhdGFcbiAgICAgICAgfSkpO1xuICAgIH1cbiAgICBcbiAgICBleHBvcnQgZnVuY3Rpb24gdXBkYXRlQnViYmxlKGVsZW1lbnQ6RWxlbWVudCwgZGF0YTp7eDpudW1iZXIsIHk6bnVtYmVyLCB0ZXh0OnN0cmluZ30pIHtcbiAgICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnZGF0aXVtLXVwZGF0ZS1idWJibGUnLCB7XG4gICAgICAgICAgICBidWJibGVzOiBmYWxzZSxcbiAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICAgICAgICBkZXRhaWw6IGRhdGFcbiAgICAgICAgfSkpO1xuICAgIH1cbn0iLCJpbnRlcmZhY2UgSURhdGVQYXJ0IHtcbiAgICBpbmNyZW1lbnQoKTp2b2lkO1xuICAgIGRlY3JlbWVudCgpOnZvaWQ7XG4gICAgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZyk6Ym9vbGVhbjtcbiAgICBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZyk6Ym9vbGVhbjtcbiAgICBnZXRWYWx1ZSgpOkRhdGU7XG4gICAgZ2V0UmVnRXgoKTpSZWdFeHA7XG4gICAgc2V0U2VsZWN0YWJsZShzZWxlY3RhYmxlOmJvb2xlYW4pOklEYXRlUGFydDtcbiAgICBnZXRNYXhCdWZmZXIoKTpudW1iZXI7XG4gICAgZ2V0TGV2ZWwoKTpMZXZlbDtcbiAgICBpc1NlbGVjdGFibGUoKTpib29sZWFuO1xuICAgIHRvU3RyaW5nKCk6c3RyaW5nO1xufVxuXG5jbGFzcyBQbGFpblRleHQgaW1wbGVtZW50cyBJRGF0ZVBhcnQge1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgdGV4dDpzdHJpbmcpIHt9XG4gICAgcHVibGljIGluY3JlbWVudCgpIHt9XG4gICAgcHVibGljIGRlY3JlbWVudCgpIHt9XG4gICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwoKSB7IHJldHVybiBmYWxzZSB9XG4gICAgcHVibGljIHNldFZhbHVlKCkgeyByZXR1cm4gZmFsc2UgfVxuICAgIHB1YmxpYyBnZXRWYWx1ZSgpOkRhdGUgeyByZXR1cm4gbnVsbCB9XG4gICAgcHVibGljIGdldFJlZ0V4KCk6UmVnRXhwIHsgcmV0dXJuIG5ldyBSZWdFeHAoYFske3RoaXMudGV4dH1dYCk7IH1cbiAgICBwdWJsaWMgc2V0U2VsZWN0YWJsZShzZWxlY3RhYmxlOmJvb2xlYW4pOklEYXRlUGFydCB7IHJldHVybiB0aGlzIH1cbiAgICBwdWJsaWMgZ2V0TWF4QnVmZmVyKCk6bnVtYmVyIHsgcmV0dXJuIDAgfVxuICAgIHB1YmxpYyBnZXRMZXZlbCgpOkxldmVsIHsgcmV0dXJuIExldmVsLk5PTkUgfVxuICAgIHB1YmxpYyBpc1NlbGVjdGFibGUoKTpib29sZWFuIHsgcmV0dXJuIGZhbHNlIH1cbiAgICBwdWJsaWMgdG9TdHJpbmcoKTpzdHJpbmcgeyByZXR1cm4gdGhpcy50ZXh0IH1cbn1cbiAgICBcbmxldCBmb3JtYXRCbG9ja3MgPSAoZnVuY3Rpb24oKSB7ICAgIFxuICAgIGNsYXNzIERhdGVQYXJ0IGV4dGVuZHMgQ29tbW9uIHtcbiAgICAgICAgcHJvdGVjdGVkIGRhdGU6RGF0ZTtcbiAgICAgICAgcHJvdGVjdGVkIHNlbGVjdGFibGU6Ym9vbGVhbiA9IHRydWU7XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgZ2V0VmFsdWUoKTpEYXRlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGVcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHNldFNlbGVjdGFibGUoc2VsZWN0YWJsZTpib29sZWFuKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGFibGUgPSBzZWxlY3RhYmxlO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBpc1NlbGVjdGFibGUoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RhYmxlO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGNsYXNzIEZvdXJEaWdpdFllYXIgZXh0ZW5kcyBEYXRlUGFydCB7XG4gICAgICAgIHB1YmxpYyBpbmNyZW1lbnQoKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0RnVsbFllYXIodGhpcy5kYXRlLmdldEZ1bGxZZWFyKCkgKyAxKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGRlY3JlbWVudCgpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRGdWxsWWVhcih0aGlzLmRhdGUuZ2V0RnVsbFllYXIoKSAtIDEpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUocGFydGlhbCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHRoaXMuZ2V0UmVnRXgoKS50ZXN0KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRGdWxsWWVhcihwYXJzZUludCh2YWx1ZSwgMTApKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xuICAgICAgICAgICAgcmV0dXJuIC9eLT9cXGR7MSw0fSQvO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgZ2V0TWF4QnVmZmVyKCkge1xuICAgICAgICAgICAgcmV0dXJuIDQ7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcbiAgICAgICAgICAgIHJldHVybiBMZXZlbC5ZRUFSO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldEZ1bGxZZWFyKCkudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBjbGFzcyBUd29EaWdpdFllYXIgZXh0ZW5kcyBGb3VyRGlnaXRZZWFyIHtcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcbiAgICAgICAgICAgIHJldHVybiAyO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBsZXQgYmFzZSA9IE1hdGguZmxvb3Ioc3VwZXIuZ2V0VmFsdWUoKS5nZXRGdWxsWWVhcigpLzEwMCkqMTAwO1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRGdWxsWWVhcihwYXJzZUludCg8c3RyaW5nPnZhbHVlLCAxMCkgKyBiYXNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xuICAgICAgICAgICAgcmV0dXJuIC9eLT9cXGR7MSwyfSQvO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gc3VwZXIudG9TdHJpbmcoKS5zbGljZSgtMik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgY2xhc3MgTG9uZ01vbnRoTmFtZSBleHRlbmRzIERhdGVQYXJ0IHtcbiAgICAgICAgcHJvdGVjdGVkIGdldE1vbnRocygpIHtcbiAgICAgICAgICAgIHJldHVybiBzdXBlci5nZXRNb250aHMoKTtcbiAgICAgICAgfSBcbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBpbmNyZW1lbnQoKSB7XG4gICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldE1vbnRoKCkgKyAxO1xuICAgICAgICAgICAgaWYgKG51bSA+IDExKSBudW0gPSAwO1xuICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1vbnRoKG51bSk7XG4gICAgICAgICAgICB3aGlsZSAodGhpcy5kYXRlLmdldE1vbnRoKCkgPiBudW0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0RGF0ZSh0aGlzLmRhdGUuZ2V0RGF0ZSgpIC0gMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBkZWNyZW1lbnQoKSB7XG4gICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldE1vbnRoKCkgLSAxO1xuICAgICAgICAgICAgaWYgKG51bSA8IDApIG51bSA9IDExO1xuICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1vbnRoKG51bSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XG4gICAgICAgICAgICBsZXQgbW9udGggPSB0aGlzLmdldE1vbnRocygpLmZpbHRlcigobW9udGgpID0+IHtcbiAgICAgICAgICAgICAgIHJldHVybiBuZXcgUmVnRXhwKGBeJHtwYXJ0aWFsfS4qJGAsICdpJykudGVzdChtb250aCk7IFxuICAgICAgICAgICAgfSlbMF07XG4gICAgICAgICAgICBpZiAobW9udGggIT09IHZvaWQgMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKG1vbnRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKHZhbHVlLnZhbHVlT2YoKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZ2V0TW9udGhzKCkuaW5kZXhPZih2YWx1ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1vbnRoKG51bSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUmVnRXhwKGBeKCgke3RoaXMuZ2V0TW9udGhzKCkuam9pbihcIil8KFwiKX0pKSRgLCAnaScpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgZ2V0TWF4QnVmZmVyKCkge1xuICAgICAgICAgICAgcmV0dXJuIFsyLDEsMywyLDMsMywzLDIsMSwxLDEsMV1bdGhpcy5kYXRlLmdldE1vbnRoKCldO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XG4gICAgICAgICAgICByZXR1cm4gTGV2ZWwuTU9OVEg7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE1vbnRocygpW3RoaXMuZGF0ZS5nZXRNb250aCgpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBjbGFzcyBTaG9ydE1vbnRoTmFtZSBleHRlbmRzIExvbmdNb250aE5hbWUge1xuICAgICAgICBwcm90ZWN0ZWQgZ2V0TW9udGhzKCkge1xuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLmdldFNob3J0TW9udGhzKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgY2xhc3MgTW9udGggZXh0ZW5kcyBMb25nTW9udGhOYW1lIHtcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0TW9udGgoKSA+IDAgPyAxIDogMjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcbiAgICAgICAgICAgIGlmICgvXlxcZHsxLDJ9JC8udGVzdChwYXJ0aWFsKSkge1xuICAgICAgICAgICAgICAgIGxldCB0cmltbWVkID0gdGhpcy50cmltKHBhcnRpYWwgPT09ICcwJyA/ICcxJyA6IHBhcnRpYWwpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHRyaW1tZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0TW9udGgocGFyc2VJbnQodmFsdWUsIDEwKSAtIDEpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XG4gICAgICAgICAgICByZXR1cm4gL14oWzEtOV18KDFbMC0yXSkpJC87XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcbiAgICAgICAgICAgIHJldHVybiAodGhpcy5kYXRlLmdldE1vbnRoKCkgKyAxKS50b1N0cmluZygpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGNsYXNzIFBhZGRlZE1vbnRoIGV4dGVuZHMgTW9udGgge1xuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xuICAgICAgICAgICAgaWYgKC9eXFxkezEsMn0kLy50ZXN0KHBhcnRpYWwpKSB7XG4gICAgICAgICAgICAgICAgbGV0IHBhZGRlZCA9IHRoaXMucGFkKHBhcnRpYWwgPT09ICcwJyA/ICcxJyA6IHBhcnRpYWwpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHBhZGRlZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcbiAgICAgICAgICAgIHJldHVybiAvXigoMFsxLTldKXwoMVswLTJdKSkkLzsgICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFkKHN1cGVyLnRvU3RyaW5nKCkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGNsYXNzIERhdGVOdW1lcmFsIGV4dGVuZHMgRGF0ZVBhcnQge1xuICAgICAgICBwdWJsaWMgaW5jcmVtZW50KCkge1xuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXREYXRlKCkgKyAxO1xuICAgICAgICAgICAgaWYgKG51bSA+IHRoaXMuZGF5c0luTW9udGgodGhpcy5kYXRlKSkgbnVtID0gMTtcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXREYXRlKG51bSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBkZWNyZW1lbnQoKSB7XG4gICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldERhdGUoKSAtIDE7XG4gICAgICAgICAgICBpZiAobnVtIDwgMSkgbnVtID0gdGhpcy5kYXlzSW5Nb250aCh0aGlzLmRhdGUpO1xuICAgICAgICAgICAgdGhpcy5kYXRlLnNldERhdGUobnVtKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcbiAgICAgICAgICAgIGlmICgvXlxcZHsxLDJ9JC8udGVzdChwYXJ0aWFsKSkge1xuICAgICAgICAgICAgICAgIGxldCB0cmltbWVkID0gdGhpcy50cmltKHBhcnRpYWwgPT09ICcwJyA/ICcxJyA6IHBhcnRpYWwpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHRyaW1tZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkgJiYgcGFyc2VJbnQodmFsdWUsIDEwKSA8IHRoaXMuZGF5c0luTW9udGgodGhpcy5kYXRlKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXREYXRlKHBhcnNlSW50KHZhbHVlLCAxMCkpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XG4gICAgICAgICAgICByZXR1cm4gL15bMS05XXwoKDF8MilbMC05XSl8KDNbMC0xXSkkLztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0RGF0ZSgpID4gTWF0aC5mbG9vcih0aGlzLmRheXNJbk1vbnRoKHRoaXMuZGF0ZSkvMTApID8gMSA6IDI7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcbiAgICAgICAgICAgIHJldHVybiBMZXZlbC5EQVRFO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldERhdGUoKS50b1N0cmluZygpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGNsYXNzIFBhZGRlZERhdGUgZXh0ZW5kcyBEYXRlTnVtZXJhbCB7XG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XG4gICAgICAgICAgICBpZiAoL15cXGR7MSwyfSQvLnRlc3QocGFydGlhbCkpIHtcbiAgICAgICAgICAgICAgICBsZXQgcGFkZGVkID0gdGhpcy5wYWQocGFydGlhbCA9PT0gJzAnID8gJzEnIDogcGFydGlhbCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUocGFkZGVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xuICAgICAgICAgICAgcmV0dXJuIC9eKDBbMS05XSl8KCgxfDIpWzAtOV0pfCgzWzAtMV0pJC87XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhZCh0aGlzLmRhdGUuZ2V0RGF0ZSgpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBjbGFzcyBEYXRlT3JkaW5hbCBleHRlbmRzIERhdGVOdW1lcmFsIHtcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xuICAgICAgICAgICAgcmV0dXJuIC9eKFsxLTldfCgoMXwyKVswLTldKXwoM1swLTFdKSkoKHN0KXwobmQpfChyZCl8KHRoKSk/JC9pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICBsZXQgZGF0ZSA9IHRoaXMuZGF0ZS5nZXREYXRlKCk7XG4gICAgICAgICAgICBsZXQgaiA9IGRhdGUgJSAxMDtcbiAgICAgICAgICAgIGxldCBrID0gZGF0ZSAlIDEwMDtcbiAgICAgICAgICAgIGlmIChqID09PSAxICYmIGsgIT09IDExKSByZXR1cm4gZGF0ZSArIFwic3RcIjtcbiAgICAgICAgICAgIGlmIChqID09PSAyICYmIGsgIT09IDEyKSByZXR1cm4gZGF0ZSArIFwibmRcIjtcbiAgICAgICAgICAgIGlmIChqID09PSAzICYmIGsgIT09IDEzKSByZXR1cm4gZGF0ZSArIFwicmRcIjtcbiAgICAgICAgICAgIHJldHVybiBkYXRlICsgXCJ0aFwiO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGNsYXNzIExvbmdEYXlOYW1lIGV4dGVuZHMgRGF0ZVBhcnQge1xuICAgICAgICBwcm90ZWN0ZWQgZ2V0RGF5cygpIHtcbiAgICAgICAgICAgIHJldHVybiBzdXBlci5nZXREYXlzKCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBpbmNyZW1lbnQoKSB7XG4gICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldERheSgpICsgMTtcbiAgICAgICAgICAgIGlmIChudW0gPiA2KSBudW0gPSAwO1xuICAgICAgICAgICAgdGhpcy5kYXRlLnNldERhdGUodGhpcy5kYXRlLmdldERhdGUoKSAtIHRoaXMuZGF0ZS5nZXREYXkoKSArIG51bSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBkZWNyZW1lbnQoKSB7XG4gICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldERheSgpIC0gMTtcbiAgICAgICAgICAgIGlmIChudW0gPCAwKSBudW0gPSA2O1xuICAgICAgICAgICAgdGhpcy5kYXRlLnNldERhdGUodGhpcy5kYXRlLmdldERhdGUoKSAtIHRoaXMuZGF0ZS5nZXREYXkoKSArIG51bSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XG4gICAgICAgICAgICBsZXQgZGF5ID0gdGhpcy5nZXREYXlzKCkuZmlsdGVyKChkYXkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cChgXiR7cGFydGlhbH0uKiRgLCAnaScpLnRlc3QoZGF5KTtcbiAgICAgICAgICAgIH0pWzBdO1xuICAgICAgICAgICAgaWYgKGRheSAhPT0gdm9pZCAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUoZGF5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKHZhbHVlLnZhbHVlT2YoKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZ2V0RGF5cygpLmluZGV4T2YodmFsdWUpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXREYXRlKHRoaXMuZGF0ZS5nZXREYXRlKCkgLSB0aGlzLmRhdGUuZ2V0RGF5KCkgKyBudW0pO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cChgXigoJHt0aGlzLmdldERheXMoKS5qb2luKFwiKXwoXCIpfSkpJGAsICdpJyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKSB7XG4gICAgICAgICAgICByZXR1cm4gWzIsMSwyLDEsMiwxLDJdW3RoaXMuZGF0ZS5nZXREYXkoKV07XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcbiAgICAgICAgICAgIHJldHVybiBMZXZlbC5EQVRFO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXREYXlzKClbdGhpcy5kYXRlLmdldERheSgpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBjbGFzcyBTaG9ydERheU5hbWUgZXh0ZW5kcyBMb25nRGF5TmFtZSB7XG4gICAgICAgIHByb3RlY3RlZCBnZXREYXlzKCkge1xuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLmdldFNob3J0RGF5cygpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGNsYXNzIFBhZGRlZE1pbGl0YXJ5SG91ciBleHRlbmRzIERhdGVQYXJ0IHtcbiAgICAgICAgcHVibGljIGluY3JlbWVudCgpIHtcbiAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0SG91cnMoKSArIDE7XG4gICAgICAgICAgICBpZiAobnVtID4gMjMpIG51bSA9IDA7XG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnMobnVtKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGRlY3JlbWVudCgpIHtcbiAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0SG91cnMoKSAtIDE7XG4gICAgICAgICAgICBpZiAobnVtIDwgMCkgbnVtID0gMjM7XG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnMobnVtKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcbiAgICAgICAgICAgIGlmICgvXlxcZHsxLDJ9JC8udGVzdChwYXJ0aWFsKSkge1xuICAgICAgICAgICAgICAgIGxldCBwYWRkZWQgPSB0aGlzLnBhZChwYXJ0aWFsKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZShwYWRkZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnMocGFyc2VJbnQodmFsdWUsIDEwKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldEhvdXJzKCkgPiAyID8gMSA6IDI7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcbiAgICAgICAgICAgIHJldHVybiBMZXZlbC5IT1VSO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XG4gICAgICAgICAgICByZXR1cm4gL14oKCgwfDEpWzAtOV0pfCgyWzAtM10pKSQvO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYWQodGhpcy5kYXRlLmdldEhvdXJzKCkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGNsYXNzIE1pbGl0YXJ5SG91ciBleHRlbmRzIFBhZGRlZE1pbGl0YXJ5SG91ciB7XG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XG4gICAgICAgICAgICBpZiAoL15cXGR7MSwyfSQvLnRlc3QocGFydGlhbCkpIHtcbiAgICAgICAgICAgICAgICBsZXQgdHJpbW1lZCA9IHRoaXMudHJpbShwYXJ0aWFsKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0cmltbWVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xuICAgICAgICAgICAgcmV0dXJuIC9eKCgxP1swLTldKXwoMlswLTNdKSkkLztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXRIb3VycygpLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgY2xhc3MgUGFkZGVkSG91ciBleHRlbmRzIFBhZGRlZE1pbGl0YXJ5SG91ciB7XG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XG4gICAgICAgICAgICBsZXQgcGFkZGVkID0gdGhpcy5wYWQocGFydGlhbCA9PT0gJzAnID8gJzEnIDogcGFydGlhbCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZShwYWRkZWQpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBsZXQgbnVtID0gcGFyc2VJbnQodmFsdWUsIDEwKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kYXRlLmdldEhvdXJzKCkgPCAxMiAmJiBudW0gPT09IDEyKSBudW0gPSAwO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmRhdGUuZ2V0SG91cnMoKSA+IDExICYmIG51bSAhPT0gMTIpIG51bSArPSAxMjtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnMobnVtKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xuICAgICAgICAgICAgcmV0dXJuIC9eKDBbMS05XSl8KDFbMC0yXSkkLztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJzZUludCh0aGlzLnRvU3RyaW5nKCksIDEwKSA+IDEgPyAxIDogMjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFkKHRoaXMuZ2V0SG91cnModGhpcy5kYXRlKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgY2xhc3MgSG91ciBleHRlbmRzIFBhZGRlZEhvdXIge1xuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xuICAgICAgICAgICAgbGV0IHRyaW1tZWQgPSB0aGlzLnRyaW0ocGFydGlhbCA9PT0gJzAnID8gJzEnIDogcGFydGlhbCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0cmltbWVkKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xuICAgICAgICAgICAgcmV0dXJuIC9eWzEtOV18KDFbMC0yXSkkLztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudHJpbShzdXBlci50b1N0cmluZygpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBjbGFzcyBQYWRkZWRNaW51dGUgZXh0ZW5kcyBEYXRlUGFydCB7XG4gICAgICAgIHB1YmxpYyBpbmNyZW1lbnQoKSB7XG4gICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldE1pbnV0ZXMoKSArIDE7XG4gICAgICAgICAgICBpZiAobnVtID4gNTkpIG51bSA9IDA7XG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0TWludXRlcyhudW0pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgZGVjcmVtZW50KCkge1xuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRNaW51dGVzKCkgLSAxO1xuICAgICAgICAgICAgaWYgKG51bSA8IDApIG51bSA9IDU5O1xuICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1pbnV0ZXMobnVtKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHRoaXMucGFkKHBhcnRpYWwpKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKHZhbHVlLnZhbHVlT2YoKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1pbnV0ZXMocGFyc2VJbnQodmFsdWUsIDEwKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcbiAgICAgICAgICAgIHJldHVybiAvXlswLTVdWzAtOV0kLztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0TWludXRlcygpID4gNSA/IDEgOiAyO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XG4gICAgICAgICAgICByZXR1cm4gTGV2ZWwuTUlOVVRFO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYWQodGhpcy5kYXRlLmdldE1pbnV0ZXMoKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgY2xhc3MgTWludXRlIGV4dGVuZHMgUGFkZGVkTWludXRlIHtcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHRoaXMudHJpbShwYXJ0aWFsKSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcbiAgICAgICAgICAgIHJldHVybiAvXlswLTVdP1swLTldJC87XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0TWludXRlcygpLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgY2xhc3MgUGFkZGVkU2Vjb25kIGV4dGVuZHMgRGF0ZVBhcnQge1xuICAgICAgICBwdWJsaWMgaW5jcmVtZW50KCkge1xuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRTZWNvbmRzKCkgKyAxO1xuICAgICAgICAgICAgaWYgKG51bSA+IDU5KSBudW0gPSAwO1xuICAgICAgICAgICAgdGhpcy5kYXRlLnNldFNlY29uZHMobnVtKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGRlY3JlbWVudCgpIHtcbiAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0U2Vjb25kcygpIC0gMTtcbiAgICAgICAgICAgIGlmIChudW0gPCAwKSBudW0gPSA1OTtcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRTZWNvbmRzKG51bSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0aGlzLnBhZChwYXJ0aWFsKSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHRoaXMuZ2V0UmVnRXgoKS50ZXN0KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRTZWNvbmRzKHBhcnNlSW50KHZhbHVlLCAxMCkpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XG4gICAgICAgICAgICByZXR1cm4gL15bMC01XVswLTldJC87XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldFNlY29uZHMoKSA+IDUgPyAxIDogMjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGdldExldmVsKCkge1xuICAgICAgICAgICAgcmV0dXJuIExldmVsLlNFQ09ORDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFkKHRoaXMuZGF0ZS5nZXRTZWNvbmRzKCkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGNsYXNzIFNlY29uZCBleHRlbmRzIFBhZGRlZFNlY29uZCB7XG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0aGlzLnRyaW0ocGFydGlhbCkpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XG4gICAgICAgICAgICByZXR1cm4gL15bMC01XT9bMC05XSQvO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldFNlY29uZHMoKS50b1N0cmluZygpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBjbGFzcyBVcHBlcmNhc2VNZXJpZGllbSBleHRlbmRzIERhdGVQYXJ0IHtcbiAgICAgICAgcHVibGljIGluY3JlbWVudCgpIHtcbiAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0SG91cnMoKSArIDEyO1xuICAgICAgICAgICAgaWYgKG51bSA+IDIzKSBudW0gLT0gMjQ7XG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnMobnVtKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGRlY3JlbWVudCgpIHtcbiAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0SG91cnMoKSAtIDEyO1xuICAgICAgICAgICAgaWYgKG51bSA8IDApIG51bSArPSAyNDtcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3VycyhudW0pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xuICAgICAgICAgICAgaWYgKC9eKChBTT8pfChQTT8pKSQvaS50ZXN0KHBhcnRpYWwpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUocGFydGlhbFswXSA9PT0gJ0EnID8gJ0FNJyA6ICdQTScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUudG9Mb3dlckNhc2UoKSA9PT0gJ2FtJyAmJiB0aGlzLmRhdGUuZ2V0SG91cnMoKSA+IDExKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3Vycyh0aGlzLmRhdGUuZ2V0SG91cnMoKSAtIDEyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlLnRvTG93ZXJDYXNlKCkgPT09ICdwbScgJiYgdGhpcy5kYXRlLmdldEhvdXJzKCkgPCAxMikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnModGhpcy5kYXRlLmdldEhvdXJzKCkgKyAxMik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XG4gICAgICAgICAgICByZXR1cm4gTGV2ZWwuSE9VUjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcbiAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XG4gICAgICAgICAgICByZXR1cm4gL14oKGFtKXwocG0pKSQvaTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0TWVyaWRpZW0odGhpcy5kYXRlKS50b1VwcGVyQ2FzZSgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGNsYXNzIExvd2VyY2FzZU1lcmlkaWVtIGV4dGVuZHMgVXBwZXJjYXNlTWVyaWRpZW0ge1xuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRNZXJpZGllbSh0aGlzLmRhdGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGxldCBmb3JtYXRCbG9ja3M6eyBba2V5OnN0cmluZ106IG5ldyAoKSA9PiBJRGF0ZVBhcnQ7IH0gPSB7fTtcbiAgICBcbiAgICBmb3JtYXRCbG9ja3NbJ1lZWVknXSA9IEZvdXJEaWdpdFllYXI7XG4gICAgZm9ybWF0QmxvY2tzWydZWSddID0gVHdvRGlnaXRZZWFyO1xuICAgIGZvcm1hdEJsb2Nrc1snTU1NTSddID0gTG9uZ01vbnRoTmFtZTtcbiAgICBmb3JtYXRCbG9ja3NbJ01NTSddID0gU2hvcnRNb250aE5hbWU7XG4gICAgZm9ybWF0QmxvY2tzWydNTSddID0gUGFkZGVkTW9udGg7XG4gICAgZm9ybWF0QmxvY2tzWydNJ10gPSBNb250aDtcbiAgICBmb3JtYXRCbG9ja3NbJ0REJ10gPSBQYWRkZWREYXRlO1xuICAgIGZvcm1hdEJsb2Nrc1snRG8nXSA9IERhdGVPcmRpbmFsO1xuICAgIGZvcm1hdEJsb2Nrc1snRCddID0gRGF0ZU51bWVyYWw7XG4gICAgZm9ybWF0QmxvY2tzWydkZGRkJ10gPSBMb25nRGF5TmFtZTtcbiAgICBmb3JtYXRCbG9ja3NbJ2RkZCddID0gU2hvcnREYXlOYW1lO1xuICAgIGZvcm1hdEJsb2Nrc1snSEgnXSA9IFBhZGRlZE1pbGl0YXJ5SG91cjtcbiAgICBmb3JtYXRCbG9ja3NbJ2hoJ10gPSBQYWRkZWRIb3VyO1xuICAgIGZvcm1hdEJsb2Nrc1snSCddID0gTWlsaXRhcnlIb3VyO1xuICAgIGZvcm1hdEJsb2Nrc1snaCddID0gSG91cjtcbiAgICBmb3JtYXRCbG9ja3NbJ0EnXSA9IFVwcGVyY2FzZU1lcmlkaWVtO1xuICAgIGZvcm1hdEJsb2Nrc1snYSddID0gTG93ZXJjYXNlTWVyaWRpZW07XG4gICAgZm9ybWF0QmxvY2tzWydtbSddID0gUGFkZGVkTWludXRlO1xuICAgIGZvcm1hdEJsb2Nrc1snbSddID0gTWludXRlO1xuICAgIGZvcm1hdEJsb2Nrc1snc3MnXSA9IFBhZGRlZFNlY29uZDtcbiAgICBmb3JtYXRCbG9ja3NbJ3MnXSA9IFNlY29uZDtcbiAgICBcbiAgICByZXR1cm4gZm9ybWF0QmxvY2tzO1xufSkoKTtcblxuXG4iLCJjbGFzcyBJbnB1dCB7XG4gICAgcHJpdmF0ZSBvcHRpb25zOiBJT3B0aW9ucztcbiAgICBwcml2YXRlIHNlbGVjdGVkRGF0ZVBhcnQ6IElEYXRlUGFydDtcbiAgICBwcml2YXRlIHRleHRCdWZmZXI6IHN0cmluZyA9IFwiXCI7XG4gICAgcHVibGljIGRhdGVQYXJ0czogSURhdGVQYXJ0W107XG4gICAgcHVibGljIGZvcm1hdDogUmVnRXhwO1xuICAgIHByaXZhdGUgZGF0ZTpEYXRlO1xuICAgIHByaXZhdGUgbGV2ZWw6TGV2ZWw7XG4gICAgXG4gICAgY29uc3RydWN0b3IocHVibGljIGVsZW1lbnQ6IEhUTUxJbnB1dEVsZW1lbnQpIHtcbiAgICAgICAgbmV3IEtleWJvYXJkRXZlbnRIYW5kbGVyKHRoaXMpO1xuICAgICAgICBuZXcgTW91c2VFdmVudEhhbmRsZXIodGhpcyk7XG4gICAgICAgIG5ldyBQYXN0ZUV2ZW50SGFuZGVyKHRoaXMpO1xuICAgICAgICBcbiAgICAgICAgbGlzdGVuLnZpZXdjaGFuZ2VkKGVsZW1lbnQsIChlKSA9PiB0aGlzLnZpZXdjaGFuZ2VkKGUuZGF0ZSwgZS5sZXZlbCwgZS51cGRhdGUpKTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIGdldExldmVscygpOkxldmVsW10ge1xuICAgICAgICBsZXQgbGV2ZWxzOkxldmVsW10gPSBbXTtcbiAgICAgICAgdGhpcy5kYXRlUGFydHMuZm9yRWFjaCgoZGF0ZVBhcnQpID0+IHtcbiAgICAgICAgICAgIGlmIChsZXZlbHMuaW5kZXhPZihkYXRlUGFydC5nZXRMZXZlbCgpKSA9PT0gLTEgJiYgZGF0ZVBhcnQuaXNTZWxlY3RhYmxlKCkpIHtcbiAgICAgICAgICAgICAgICBsZXZlbHMucHVzaChkYXRlUGFydC5nZXRMZXZlbCgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBsZXZlbHM7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBnZXRUZXh0QnVmZmVyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50ZXh0QnVmZmVyO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgc2V0VGV4dEJ1ZmZlcihuZXdCdWZmZXI6c3RyaW5nKSB7XG4gICAgICAgIHRoaXMudGV4dEJ1ZmZlciA9IG5ld0J1ZmZlcjtcbiAgICAgICAgXG4gICAgICAgIGlmICh0aGlzLnRleHRCdWZmZXIubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVEYXRlRnJvbUJ1ZmZlcigpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyB1cGRhdGVEYXRlRnJvbUJ1ZmZlcigpIHtcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWREYXRlUGFydC5zZXRWYWx1ZUZyb21QYXJ0aWFsKHRoaXMudGV4dEJ1ZmZlcikpIHtcbiAgICAgICAgICAgIGxldCBuZXdEYXRlID0gdGhpcy5zZWxlY3RlZERhdGVQYXJ0LmdldFZhbHVlKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICh0aGlzLnRleHRCdWZmZXIubGVuZ3RoID49IHRoaXMuc2VsZWN0ZWREYXRlUGFydC5nZXRNYXhCdWZmZXIoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMudGV4dEJ1ZmZlciA9ICcnO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWREYXRlUGFydCA9IHRoaXMuZ2V0TmV4dFNlbGVjdGFibGVEYXRlUGFydCgpOyAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdHJpZ2dlci5nb3RvKHRoaXMuZWxlbWVudCwge1xuICAgICAgICAgICAgICAgIGRhdGU6IG5ld0RhdGUsXG4gICAgICAgICAgICAgICAgbGV2ZWw6IHRoaXMuc2VsZWN0ZWREYXRlUGFydC5nZXRMZXZlbCgpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudGV4dEJ1ZmZlciA9IHRoaXMudGV4dEJ1ZmZlci5zbGljZSgwLCAtMSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcHVibGljIGdldEZpcnN0U2VsZWN0YWJsZURhdGVQYXJ0KCkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZGF0ZVBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5kYXRlUGFydHNbaV0uaXNTZWxlY3RhYmxlKCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZVBhcnRzW2ldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgfVxuXG4gICAgcHVibGljIGdldExhc3RTZWxlY3RhYmxlRGF0ZVBhcnQoKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSB0aGlzLmRhdGVQYXJ0cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuZGF0ZVBhcnRzW2ldLmlzU2VsZWN0YWJsZSgpKVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGVQYXJ0c1tpXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgZ2V0TmV4dFNlbGVjdGFibGVEYXRlUGFydCgpIHtcbiAgICAgICAgbGV0IGkgPSB0aGlzLmRhdGVQYXJ0cy5pbmRleE9mKHRoaXMuc2VsZWN0ZWREYXRlUGFydCk7XG4gICAgICAgIHdoaWxlICgrK2kgPCB0aGlzLmRhdGVQYXJ0cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGVQYXJ0c1tpXS5pc1NlbGVjdGFibGUoKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlUGFydHNbaV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWREYXRlUGFydDtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIGdldFByZXZpb3VzU2VsZWN0YWJsZURhdGVQYXJ0KCkge1xuICAgICAgICBsZXQgaSA9IHRoaXMuZGF0ZVBhcnRzLmluZGV4T2YodGhpcy5zZWxlY3RlZERhdGVQYXJ0KTtcbiAgICAgICAgd2hpbGUgKC0taSA+PSAwKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5kYXRlUGFydHNbaV0uaXNTZWxlY3RhYmxlKCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZVBhcnRzW2ldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQ7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBnZXROZWFyZXN0U2VsZWN0YWJsZURhdGVQYXJ0KGNhcmV0UG9zaXRpb246IG51bWJlcikge1xuICAgICAgICBsZXQgZGlzdGFuY2U6bnVtYmVyID0gTnVtYmVyLk1BWF9WQUxVRTtcbiAgICAgICAgbGV0IG5lYXJlc3REYXRlUGFydDpJRGF0ZVBhcnQ7XG4gICAgICAgIGxldCBzdGFydCA9IDA7XG4gICAgICAgIFxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZGF0ZVBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgZGF0ZVBhcnQgPSB0aGlzLmRhdGVQYXJ0c1tpXTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKGRhdGVQYXJ0LmlzU2VsZWN0YWJsZSgpKSB7XG4gICAgICAgICAgICAgICAgbGV0IGZyb21MZWZ0ID0gY2FyZXRQb3NpdGlvbiAtIHN0YXJ0O1xuICAgICAgICAgICAgICAgIGxldCBmcm9tUmlnaHQgPSBjYXJldFBvc2l0aW9uIC0gKHN0YXJ0ICsgZGF0ZVBhcnQudG9TdHJpbmcoKS5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIChmcm9tTGVmdCA+IDAgJiYgZnJvbVJpZ2h0IDwgMCkgcmV0dXJuIGRhdGVQYXJ0O1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGxldCBkID0gTWF0aC5taW4oTWF0aC5hYnMoZnJvbUxlZnQpLCBNYXRoLmFicyhmcm9tUmlnaHQpKTtcbiAgICAgICAgICAgICAgICBpZiAoZCA8PSBkaXN0YW5jZSkge1xuICAgICAgICAgICAgICAgICAgICBuZWFyZXN0RGF0ZVBhcnQgPSBkYXRlUGFydDtcbiAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2UgPSBkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc3RhcnQgKz0gZGF0ZVBhcnQudG9TdHJpbmcoKS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBuZWFyZXN0RGF0ZVBhcnQ7ICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHNldFNlbGVjdGVkRGF0ZVBhcnQoZGF0ZVBhcnQ6SURhdGVQYXJ0KSB7XG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkRGF0ZVBhcnQgIT09IGRhdGVQYXJ0KSB7XG4gICAgICAgICAgICB0aGlzLnRleHRCdWZmZXIgPSAnJztcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWREYXRlUGFydCA9IGRhdGVQYXJ0O1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBnZXRTZWxlY3RlZERhdGVQYXJ0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZERhdGVQYXJ0O1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgdXBkYXRlT3B0aW9ucyhvcHRpb25zOklPcHRpb25zKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmRhdGVQYXJ0cyA9IFBhcnNlci5wYXJzZShvcHRpb25zLmRpc3BsYXlBcyk7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWREYXRlUGFydCA9IHZvaWQgMDtcbiAgICAgICAgXG4gICAgICAgIGxldCBmb3JtYXQ6c3RyaW5nID0gJ14nO1xuICAgICAgICB0aGlzLmRhdGVQYXJ0cy5mb3JFYWNoKChkYXRlUGFydCkgPT4ge1xuICAgICAgICAgICAgZm9ybWF0ICs9IGAoJHtkYXRlUGFydC5nZXRSZWdFeCgpLnNvdXJjZS5zbGljZSgxLC0xKX0pYDtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZm9ybWF0ID0gbmV3IFJlZ0V4cChmb3JtYXQrJyQnLCAnaScpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICB0aGlzLnZpZXdjaGFuZ2VkKHRoaXMuZGF0ZSwgdGhpcy5sZXZlbCwgdHJ1ZSk7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyB1cGRhdGVWaWV3KCkge1xuICAgICAgICBsZXQgZGF0ZVN0cmluZyA9ICcnO1xuICAgICAgICB0aGlzLmRhdGVQYXJ0cy5mb3JFYWNoKChkYXRlUGFydCkgPT4ge1xuICAgICAgICAgICAgaWYgKGRhdGVQYXJ0LmdldFZhbHVlKCkgPT09IHZvaWQgMCkgcmV0dXJuO1xuICAgICAgICAgICAgZGF0ZVN0cmluZyArPSBkYXRlUGFydC50b1N0cmluZygpOyBcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZWxlbWVudC52YWx1ZSA9IGRhdGVTdHJpbmc7XG4gICAgICAgIFxuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZERhdGVQYXJ0ID09PSB2b2lkIDApIHJldHVybjtcbiAgICAgICAgXG4gICAgICAgIGxldCBzdGFydCA9IDA7XG4gICAgICAgIFxuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIHdoaWxlICh0aGlzLmRhdGVQYXJ0c1tpXSAhPT0gdGhpcy5zZWxlY3RlZERhdGVQYXJ0KSB7XG4gICAgICAgICAgICBzdGFydCArPSB0aGlzLmRhdGVQYXJ0c1tpKytdLnRvU3RyaW5nKCkubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBsZXQgZW5kID0gc3RhcnQgKyB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQudG9TdHJpbmcoKS5sZW5ndGg7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmVsZW1lbnQuc2V0U2VsZWN0aW9uUmFuZ2Uoc3RhcnQsIGVuZCk7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyB2aWV3Y2hhbmdlZChkYXRlOkRhdGUsIGxldmVsOkxldmVsLCB1cGRhdGU/OmJvb2xlYW4pIHsgXG4gICAgICAgIHRoaXMuZGF0ZSA9IGRhdGU7XG4gICAgICAgIHRoaXMubGV2ZWwgPSBsZXZlbDsgICAgICAgXG4gICAgICAgIHRoaXMuZGF0ZVBhcnRzLmZvckVhY2goKGRhdGVQYXJ0KSA9PiB7XG4gICAgICAgICAgICBpZiAodXBkYXRlKSBkYXRlUGFydC5zZXRWYWx1ZShkYXRlKTtcbiAgICAgICAgICAgIGlmIChkYXRlUGFydC5nZXRMZXZlbCgpID09PSBsZXZlbCAmJlxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0U2VsZWN0ZWREYXRlUGFydCgpICE9PSB2b2lkIDAgJiZcbiAgICAgICAgICAgICAgICBsZXZlbCAhPT0gdGhpcy5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0TGV2ZWwoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U2VsZWN0ZWREYXRlUGFydChkYXRlUGFydCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHRyaWdnZXJWaWV3Q2hhbmdlKCkge1xuICAgICAgICB0cmlnZ2VyLnZpZXdjaGFuZ2VkKHRoaXMuZWxlbWVudCwge1xuICAgICAgICAgICAgZGF0ZTogdGhpcy5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0VmFsdWUoKSxcbiAgICAgICAgICAgIGxldmVsOiB0aGlzLmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5nZXRMZXZlbCgpXG4gICAgICAgIH0pOyAgICAgICAgXG4gICAgfVxuICAgIFxufSIsImNvbnN0IGVudW0gS0VZIHtcbiAgICBSSUdIVCA9IDM5LCBMRUZUID0gMzcsIFRBQiA9IDksIFVQID0gMzgsXG4gICAgRE9XTiA9IDQwLCBWID0gODYsIEMgPSA2NywgQSA9IDY1LCBIT01FID0gMzYsXG4gICAgRU5EID0gMzUsIEJBQ0tTUEFDRSA9IDhcbn1cblxuY2xhc3MgS2V5Ym9hcmRFdmVudEhhbmRsZXIge1xuICAgIHByaXZhdGUgc2hpZnRUYWJEb3duID0gZmFsc2U7XG4gICAgcHJpdmF0ZSB0YWJEb3duID0gZmFsc2U7XG4gICAgXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBpbnB1dDpJbnB1dCkge1xuICAgICAgICBpbnB1dC5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIChlKSA9PiB0aGlzLmtleWRvd24oZSkpO1xuICAgICAgICBpbnB1dC5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJmb2N1c1wiLCAoKSA9PiB0aGlzLmZvY3VzKCkpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoZSkgPT4gdGhpcy5kb2N1bWVudEtleWRvd24oZSkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZm9jdXMgPSAoKTp2b2lkID0+IHtcbiAgICAgICAgaWYgKHRoaXMudGFiRG93bikge1xuICAgICAgICAgICAgbGV0IGZpcnN0ID0gdGhpcy5pbnB1dC5nZXRGaXJzdFNlbGVjdGFibGVEYXRlUGFydCgpO1xuICAgICAgICAgICAgdGhpcy5pbnB1dC5zZXRTZWxlY3RlZERhdGVQYXJ0KGZpcnN0KTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgdGhpcy5pbnB1dC50cmlnZ2VyVmlld0NoYW5nZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zaGlmdFRhYkRvd24pIHtcbiAgICAgICAgICAgIGxldCBsYXN0ID0gdGhpcy5pbnB1dC5nZXRMYXN0U2VsZWN0YWJsZURhdGVQYXJ0KCk7XG4gICAgICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQobGFzdCk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgIHRoaXMuaW5wdXQudHJpZ2dlclZpZXdDaGFuZ2UoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgZG9jdW1lbnRLZXlkb3duKGU6S2V5Ym9hcmRFdmVudCkge1xuICAgICAgICBpZiAoZS5zaGlmdEtleSAmJiBlLmtleUNvZGUgPT09IEtFWS5UQUIpIHtcbiAgICAgICAgICAgIHRoaXMuc2hpZnRUYWJEb3duID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChlLmtleUNvZGUgPT09IEtFWS5UQUIpIHtcbiAgICAgICAgICAgIHRoaXMudGFiRG93biA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNoaWZ0VGFiRG93biA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy50YWJEb3duID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIGtleWRvd24oZTpLZXlib2FyZEV2ZW50KSB7XG4gICAgICAgIGxldCBjb2RlID0gZS5rZXlDb2RlO1xuICAgICAgICBpZiAoY29kZSA+PSA5NiAmJiBjb2RlIDw9IDEwNSkge1xuICAgICAgICAgICAgY29kZSAtPSA0ODtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGlmICgoY29kZSA9PT0gS0VZLkhPTUUgfHwgY29kZSA9PT0gS0VZLkVORCkgJiYgZS5zaGlmdEtleSkgcmV0dXJuO1xuICAgICAgICBpZiAoKGNvZGUgPT09IEtFWS5MRUZUIHx8IGNvZGUgPT09IEtFWS5SSUdIVCkgJiYgZS5zaGlmdEtleSkgcmV0dXJuO1xuICAgICAgICBpZiAoKGNvZGUgPT09IEtFWS5DIHx8IGNvZGUgPT09IEtFWS5BIHx8IGNvZGUgPT09IEtFWS5WKSAmJiBlLmN0cmxLZXkpIHJldHVybjtcbiAgICAgICAgXG4gICAgICAgIGxldCBwcmV2ZW50RGVmYXVsdCA9IHRydWU7XG4gICAgICAgIFxuICAgICAgICBpZiAoY29kZSA9PT0gS0VZLkhPTUUpIHtcbiAgICAgICAgICAgIHRoaXMuaG9tZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IEtFWS5FTkQpIHtcbiAgICAgICAgICAgIHRoaXMuZW5kKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gS0VZLkxFRlQpIHtcbiAgICAgICAgICAgIHRoaXMubGVmdCgpO1xuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IEtFWS5SSUdIVCkge1xuICAgICAgICAgICAgdGhpcy5yaWdodCgpO1xuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IEtFWS5UQUIgJiYgZS5zaGlmdEtleSkge1xuICAgICAgICAgICAgcHJldmVudERlZmF1bHQgPSB0aGlzLnNoaWZ0VGFiKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gS0VZLlRBQikge1xuICAgICAgICAgICAgcHJldmVudERlZmF1bHQgPSB0aGlzLnRhYigpO1xuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IEtFWS5VUCkge1xuICAgICAgICAgICAgdGhpcy51cCgpO1xuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IEtFWS5ET1dOKSB7XG4gICAgICAgICAgICB0aGlzLmRvd24oKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKHByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGxldCBrZXlQcmVzc2VkID0gU3RyaW5nLmZyb21DaGFyQ29kZShjb2RlKTtcbiAgICAgICAgaWYgKC9eWzAtOV18W0Etel0kLy50ZXN0KGtleVByZXNzZWQpKSB7XG4gICAgICAgICAgICBsZXQgdGV4dEJ1ZmZlciA9IHRoaXMuaW5wdXQuZ2V0VGV4dEJ1ZmZlcigpO1xuICAgICAgICAgICAgdGhpcy5pbnB1dC5zZXRUZXh0QnVmZmVyKHRleHRCdWZmZXIgKyBrZXlQcmVzc2VkKTtcbiAgICAgICAgfSBlbHNlIGlmIChjb2RlID09PSBLRVkuQkFDS1NQQUNFKSB7XG4gICAgICAgICAgICBsZXQgdGV4dEJ1ZmZlciA9IHRoaXMuaW5wdXQuZ2V0VGV4dEJ1ZmZlcigpO1xuICAgICAgICAgICAgdGhpcy5pbnB1dC5zZXRUZXh0QnVmZmVyKHRleHRCdWZmZXIuc2xpY2UoMCwgLTEpKTtcbiAgICAgICAgfSBlbHNlIGlmICghZS5zaGlmdEtleSkge1xuICAgICAgICAgICAgdGhpcy5pbnB1dC5zZXRUZXh0QnVmZmVyKCcnKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBob21lKCkge1xuICAgICAgICBsZXQgZmlyc3QgPSB0aGlzLmlucHV0LmdldEZpcnN0U2VsZWN0YWJsZURhdGVQYXJ0KCk7XG4gICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChmaXJzdCk7XG4gICAgICAgIHRoaXMuaW5wdXQudHJpZ2dlclZpZXdDaGFuZ2UoKTtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBlbmQoKSB7XG4gICAgICAgIGxldCBsYXN0ID0gdGhpcy5pbnB1dC5nZXRMYXN0U2VsZWN0YWJsZURhdGVQYXJ0KCk7XG4gICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChsYXN0KTsgICAgIFxuICAgICAgICB0aGlzLmlucHV0LnRyaWdnZXJWaWV3Q2hhbmdlKCk7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgbGVmdCgpIHtcbiAgICAgICAgbGV0IHByZXZpb3VzID0gdGhpcy5pbnB1dC5nZXRQcmV2aW91c1NlbGVjdGFibGVEYXRlUGFydCgpO1xuICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQocHJldmlvdXMpO1xuICAgICAgICB0aGlzLmlucHV0LnRyaWdnZXJWaWV3Q2hhbmdlKCk7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgcmlnaHQoKSB7XG4gICAgICAgIGxldCBuZXh0ID0gdGhpcy5pbnB1dC5nZXROZXh0U2VsZWN0YWJsZURhdGVQYXJ0KCk7XG4gICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChuZXh0KTtcbiAgICAgICAgdGhpcy5pbnB1dC50cmlnZ2VyVmlld0NoYW5nZSgpO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIHNoaWZ0VGFiKCkge1xuICAgICAgICBsZXQgcHJldmlvdXMgPSB0aGlzLmlucHV0LmdldFByZXZpb3VzU2VsZWN0YWJsZURhdGVQYXJ0KCk7XG4gICAgICAgIGlmIChwcmV2aW91cyAhPT0gdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkpIHtcbiAgICAgICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChwcmV2aW91cyk7XG4gICAgICAgICAgICB0aGlzLmlucHV0LnRyaWdnZXJWaWV3Q2hhbmdlKCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgdGFiKCkge1xuICAgICAgICBsZXQgbmV4dCA9IHRoaXMuaW5wdXQuZ2V0TmV4dFNlbGVjdGFibGVEYXRlUGFydCgpO1xuICAgICAgICBpZiAobmV4dCAhPT0gdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkpIHtcbiAgICAgICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChuZXh0KTtcbiAgICAgICAgICAgIHRoaXMuaW5wdXQudHJpZ2dlclZpZXdDaGFuZ2UoKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgdXAoKSB7XG4gICAgICAgIHRoaXMuaW5wdXQuZ2V0U2VsZWN0ZWREYXRlUGFydCgpLmluY3JlbWVudCgpO1xuICAgICAgICBcbiAgICAgICAgbGV0IGxldmVsID0gdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0TGV2ZWwoKTtcbiAgICAgICAgbGV0IGRhdGUgPSB0aGlzLmlucHV0LmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5nZXRWYWx1ZSgpO1xuICAgICAgICBcbiAgICAgICAgdHJpZ2dlci5nb3RvKHRoaXMuaW5wdXQuZWxlbWVudCwge1xuICAgICAgICAgICAgZGF0ZTogZGF0ZSxcbiAgICAgICAgICAgIGxldmVsOiBsZXZlbFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBkb3duKCkge1xuICAgICAgICB0aGlzLmlucHV0LmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5kZWNyZW1lbnQoKTtcbiAgICAgICAgXG4gICAgICAgIGxldCBsZXZlbCA9IHRoaXMuaW5wdXQuZ2V0U2VsZWN0ZWREYXRlUGFydCgpLmdldExldmVsKCk7XG4gICAgICAgIGxldCBkYXRlID0gdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0VmFsdWUoKTtcbiAgICAgICAgXG4gICAgICAgIHRyaWdnZXIuZ290byh0aGlzLmlucHV0LmVsZW1lbnQsIHtcbiAgICAgICAgICAgIGRhdGU6IGRhdGUsXG4gICAgICAgICAgICBsZXZlbDogbGV2ZWxcbiAgICAgICAgfSk7XG4gICAgfVxufSIsImNsYXNzIE1vdXNlRXZlbnRIYW5kbGVyIHtcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGlucHV0OklucHV0KSB7XG4gICAgICAgIGxpc3Rlbi5tb3VzZWRvd24oaW5wdXQuZWxlbWVudCwgKCkgPT4gdGhpcy5tb3VzZWRvd24oKSk7XG4gICAgICAgIGxpc3Rlbi5tb3VzZXVwKGRvY3VtZW50LCAoKSA9PiB0aGlzLm1vdXNldXAoKSk7XG4gICAgICAgIFxuICAgICAgICAvLyBTdG9wIGRlZmF1bHRcbiAgICAgICAgaW5wdXQuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ2VudGVyXCIsIChlKSA9PiBlLnByZXZlbnREZWZhdWx0KCkpO1xuICAgICAgICBpbnB1dC5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnb3ZlclwiLCAoZSkgPT4gZS5wcmV2ZW50RGVmYXVsdCgpKTtcbiAgICAgICAgaW5wdXQuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiZHJvcFwiLCAoZSkgPT4gZS5wcmV2ZW50RGVmYXVsdCgpKTtcbiAgICAgICAgaW5wdXQuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY3V0XCIsIChlKSA9PiBlLnByZXZlbnREZWZhdWx0KCkpO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIGRvd246Ym9vbGVhbjtcbiAgICBwcml2YXRlIGNhcmV0U3RhcnQ6bnVtYmVyO1xuICAgIFxuICAgIHByaXZhdGUgbW91c2Vkb3duKCkge1xuICAgICAgICB0aGlzLmRvd24gPSB0cnVlO1xuICAgICAgICB0aGlzLmlucHV0LmVsZW1lbnQuc2V0U2VsZWN0aW9uUmFuZ2Uodm9pZCAwLCB2b2lkIDApO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgdGhpcy5jYXJldFN0YXJ0ID0gdGhpcy5pbnB1dC5lbGVtZW50LnNlbGVjdGlvblN0YXJ0OyBcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgbW91c2V1cCA9ICgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLmRvd24pIHJldHVybjtcbiAgICAgICAgdGhpcy5kb3duID0gZmFsc2U7XG4gICAgICAgIFxuICAgICAgICBsZXQgcG9zOm51bWJlcjtcbiAgICAgICAgXG4gICAgICAgIGlmICh0aGlzLmlucHV0LmVsZW1lbnQuc2VsZWN0aW9uU3RhcnQgPT09IHRoaXMuY2FyZXRTdGFydCkge1xuICAgICAgICAgICAgcG9zID0gdGhpcy5pbnB1dC5lbGVtZW50LnNlbGVjdGlvbkVuZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBvcyA9IHRoaXMuaW5wdXQuZWxlbWVudC5zZWxlY3Rpb25TdGFydDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgbGV0IGJsb2NrID0gdGhpcy5pbnB1dC5nZXROZWFyZXN0U2VsZWN0YWJsZURhdGVQYXJ0KHBvcyk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQoYmxvY2spO1xuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXMuaW5wdXQuZWxlbWVudC5zZWxlY3Rpb25TdGFydCA+IDAgfHwgdGhpcy5pbnB1dC5lbGVtZW50LnNlbGVjdGlvbkVuZCA8IHRoaXMuaW5wdXQuZWxlbWVudC52YWx1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuaW5wdXQudHJpZ2dlclZpZXdDaGFuZ2UoKTtcbiAgICAgICAgfVxuICAgIH07XG59IiwiY2xhc3MgUGFyc2VyIHtcbiAgICBwdWJsaWMgc3RhdGljIHBhcnNlKGZvcm1hdDpzdHJpbmcpOklEYXRlUGFydFtdIHtcbiAgICAgICAgbGV0IHRleHRCdWZmZXIgPSAnJztcbiAgICAgICAgbGV0IGRhdGVQYXJ0czpJRGF0ZVBhcnRbXSA9IFtdO1xuICAgIFxuICAgICAgICBsZXQgaW5kZXggPSAwOyAgICAgICAgICAgICAgICBcbiAgICAgICAgbGV0IGluRXNjYXBlZFNlZ21lbnQgPSBmYWxzZTtcbiAgICAgICAgXG4gICAgICAgIGxldCBwdXNoUGxhaW5UZXh0ID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRleHRCdWZmZXIubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGRhdGVQYXJ0cy5wdXNoKG5ldyBQbGFpblRleHQodGV4dEJ1ZmZlcikuc2V0U2VsZWN0YWJsZShmYWxzZSkpO1xuICAgICAgICAgICAgICAgIHRleHRCdWZmZXIgPSAnJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgd2hpbGUgKGluZGV4IDwgZm9ybWF0Lmxlbmd0aCkgeyAgICAgXG4gICAgICAgICAgICBpZiAoIWluRXNjYXBlZFNlZ21lbnQgJiYgZm9ybWF0W2luZGV4XSA9PT0gJ1snKSB7XG4gICAgICAgICAgICAgICAgaW5Fc2NhcGVkU2VnbWVudCA9IHRydWU7XG4gICAgICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKGluRXNjYXBlZFNlZ21lbnQgJiYgZm9ybWF0W2luZGV4XSA9PT0gJ10nKSB7XG4gICAgICAgICAgICAgICAgaW5Fc2NhcGVkU2VnbWVudCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChpbkVzY2FwZWRTZWdtZW50KSB7XG4gICAgICAgICAgICAgICAgdGV4dEJ1ZmZlciArPSBmb3JtYXRbaW5kZXhdO1xuICAgICAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxldCBmb3VuZCA9IGZhbHNlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IgKGxldCBjb2RlIGluIGZvcm1hdEJsb2Nrcykge1xuICAgICAgICAgICAgICAgIGlmIChQYXJzZXIuZmluZEF0KGZvcm1hdCwgaW5kZXgsIGB7JHtjb2RlfX1gKSkge1xuICAgICAgICAgICAgICAgICAgICBwdXNoUGxhaW5UZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIGRhdGVQYXJ0cy5wdXNoKG5ldyBmb3JtYXRCbG9ja3NbY29kZV0oKS5zZXRTZWxlY3RhYmxlKGZhbHNlKSk7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4ICs9IGNvZGUubGVuZ3RoICsgMjtcbiAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFBhcnNlci5maW5kQXQoZm9ybWF0LCBpbmRleCwgY29kZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcHVzaFBsYWluVGV4dCgpO1xuICAgICAgICAgICAgICAgICAgICBkYXRlUGFydHMucHVzaChuZXcgZm9ybWF0QmxvY2tzW2NvZGVdKCkpO1xuICAgICAgICAgICAgICAgICAgICBpbmRleCArPSBjb2RlLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICghZm91bmQpIHtcbiAgICAgICAgICAgICAgICB0ZXh0QnVmZmVyICs9IGZvcm1hdFtpbmRleF07XG4gICAgICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdXNoUGxhaW5UZXh0KCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBkYXRlUGFydHM7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgc3RhdGljIGZpbmRBdCAoc3RyOnN0cmluZywgaW5kZXg6bnVtYmVyLCBzZWFyY2g6c3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBzdHIuc2xpY2UoaW5kZXgsIGluZGV4ICsgc2VhcmNoLmxlbmd0aCkgPT09IHNlYXJjaDtcbiAgICB9XG59IiwiY2xhc3MgUGFzdGVFdmVudEhhbmRlciB7XG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBpbnB1dDpJbnB1dCkge1xuICAgICAgICBsaXN0ZW4ucGFzdGUoaW5wdXQuZWxlbWVudCwgKCkgPT4gdGhpcy5wYXN0ZSgpKTtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBwYXN0ZSgpIHtcbiAgICAgICAgbGV0IG9yaWdpbmFsVmFsdWUgPSB0aGlzLmlucHV0LmVsZW1lbnQudmFsdWU7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICBpZiAoIXRoaXMuaW5wdXQuZm9ybWF0LnRlc3QodGhpcy5pbnB1dC5lbGVtZW50LnZhbHVlKSkge1xuICAgICAgICAgICAgICAgdGhpcy5pbnB1dC5lbGVtZW50LnZhbHVlID0gb3JpZ2luYWxWYWx1ZTtcbiAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgfSBcbiAgICAgICAgICAgXG4gICAgICAgICAgIGxldCBuZXdEYXRlID0gdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0VmFsdWUoKTtcbiAgICAgICAgICAgXG4gICAgICAgICAgIGxldCBzdHJQcmVmaXggPSAnJztcbiAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmlucHV0LmRhdGVQYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgbGV0IGRhdGVQYXJ0ID0gdGhpcy5pbnB1dC5kYXRlUGFydHNbaV07XG4gICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgIGxldCByZWdFeHAgPSBuZXcgUmVnRXhwKGRhdGVQYXJ0LmdldFJlZ0V4KCkuc291cmNlLnNsaWNlKDEsIC0xKSwgJ2knKTtcbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgbGV0IHZhbCA9IHRoaXMuaW5wdXQuZWxlbWVudC52YWx1ZS5yZXBsYWNlKHN0clByZWZpeCwgJycpLm1hdGNoKHJlZ0V4cClbMF07XG4gICAgICAgICAgICAgICBzdHJQcmVmaXggKz0gdmFsO1xuICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICBpZiAoIWRhdGVQYXJ0LmlzU2VsZWN0YWJsZSgpKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgZGF0ZVBhcnQuc2V0VmFsdWUobmV3RGF0ZSk7XG4gICAgICAgICAgICAgICBpZiAoZGF0ZVBhcnQuc2V0VmFsdWUodmFsKSkge1xuICAgICAgICAgICAgICAgICAgIG5ld0RhdGUgPSBkYXRlUGFydC5nZXRWYWx1ZSgpO1xuICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICB0aGlzLmlucHV0LmVsZW1lbnQudmFsdWUgPSBvcmlnaW5hbFZhbHVlO1xuICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfVxuICAgICAgICAgICBcbiAgICAgICAgICAgdHJpZ2dlci5nb3RvKHRoaXMuaW5wdXQuZWxlbWVudCwge1xuICAgICAgICAgICAgICAgZGF0ZTogbmV3RGF0ZSxcbiAgICAgICAgICAgICAgIGxldmVsOiB0aGlzLmlucHV0LmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5nZXRMZXZlbCgpXG4gICAgICAgICAgIH0pO1xuICAgICAgICAgICBcbiAgICAgICAgfSk7XG4gICAgfVxufSIsImNvbnN0IGVudW0gU3RlcERpcmVjdGlvbiB7XG4gICAgVVAsIERPV05cbn1cblxuY2xhc3MgSGVhZGVyIGV4dGVuZHMgQ29tbW9uIHtcbiAgICBwcml2YXRlIHllYXJMYWJlbDpFbGVtZW50O1xuICAgIHByaXZhdGUgbW9udGhMYWJlbDpFbGVtZW50O1xuICAgIHByaXZhdGUgZGF0ZUxhYmVsOkVsZW1lbnQ7XG4gICAgcHJpdmF0ZSBob3VyTGFiZWw6RWxlbWVudDtcbiAgICBwcml2YXRlIG1pbnV0ZUxhYmVsOkVsZW1lbnQ7XG4gICAgcHJpdmF0ZSBzZWNvbmRMYWJlbDpFbGVtZW50O1xuICAgIFxuICAgIHByaXZhdGUgbGFiZWxzOkVsZW1lbnRbXTtcbiAgICBcbiAgICBwcml2YXRlIG9wdGlvbnM6SU9wdGlvbnM7XG4gICAgcHJpdmF0ZSBsZXZlbHM6TGV2ZWxbXTtcbiAgICBcbiAgICBwcml2YXRlIGxldmVsOkxldmVsO1xuICAgIHByaXZhdGUgZGF0ZTpEYXRlO1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgZWxlbWVudDpIVE1MRWxlbWVudCwgcHJpdmF0ZSBjb250YWluZXI6SFRNTEVsZW1lbnQpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgXG4gICAgICAgIGxpc3Rlbi52aWV3Y2hhbmdlZChlbGVtZW50LCAoZSkgPT4gdGhpcy52aWV3Y2hhbmdlZChlLmRhdGUsIGUubGV2ZWwpKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMueWVhckxhYmVsID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS15ZWFyJyk7XG4gICAgICAgIHRoaXMubW9udGhMYWJlbCA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdkYXRpdW0tc3Bhbi1sYWJlbC5kYXRpdW0tbW9udGgnKTtcbiAgICAgICAgdGhpcy5kYXRlTGFiZWwgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcignZGF0aXVtLXNwYW4tbGFiZWwuZGF0aXVtLWRhdGUnKTtcbiAgICAgICAgdGhpcy5ob3VyTGFiZWwgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcignZGF0aXVtLXNwYW4tbGFiZWwuZGF0aXVtLWhvdXInKTtcbiAgICAgICAgdGhpcy5taW51dGVMYWJlbCA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdkYXRpdW0tc3Bhbi1sYWJlbC5kYXRpdW0tbWludXRlJyk7XG4gICAgICAgIHRoaXMuc2Vjb25kTGFiZWwgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcignZGF0aXVtLXNwYW4tbGFiZWwuZGF0aXVtLXNlY29uZCcpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5sYWJlbHMgPSBbdGhpcy55ZWFyTGFiZWwsIHRoaXMubW9udGhMYWJlbCwgdGhpcy5kYXRlTGFiZWwsIHRoaXMuaG91ckxhYmVsLCB0aGlzLm1pbnV0ZUxhYmVsLCB0aGlzLnNlY29uZExhYmVsXTtcbiAgICAgICAgXG4gICAgICAgIGxldCBwcmV2aW91c0J1dHRvbiA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdkYXRpdW0tcHJldicpO1xuICAgICAgICBsZXQgbmV4dEJ1dHRvbiA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdkYXRpdW0tbmV4dCcpO1xuICAgICAgICBsZXQgc3BhbkxhYmVsQ29udGFpbmVyID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1zcGFuLWxhYmVsLWNvbnRhaW5lcicpO1xuICAgICAgICBcbiAgICAgICAgbGlzdGVuLnRhcChwcmV2aW91c0J1dHRvbiwgKCkgPT4gdGhpcy5wcmV2aW91cygpKTtcbiAgICAgICAgbGlzdGVuLnRhcChuZXh0QnV0dG9uLCAoKSA9PiB0aGlzLm5leHQoKSk7XG4gICAgICAgIGxpc3Rlbi50YXAoc3BhbkxhYmVsQ29udGFpbmVyLCAoKSA9PiB0aGlzLnpvb21PdXQoKSk7XG4gICAgICAgIFxuICAgICAgICBsaXN0ZW4uc3dpcGVMZWZ0KGNvbnRhaW5lciwgKCkgPT4ge1xuICAgICAgICAgICB0aGlzLm5leHQoKTsgXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgbGlzdGVuLnN3aXBlUmlnaHQoY29udGFpbmVyLCAoKSA9PiB7XG4gICAgICAgICAgIHRoaXMucHJldmlvdXMoKTsgXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgcHJldmlvdXMoKSB7XG4gICAgICAgIHRyaWdnZXIuZ290byh0aGlzLmVsZW1lbnQsIHtcbiAgICAgICAgICAgZGF0ZTogdGhpcy5zdGVwRGF0ZShTdGVwRGlyZWN0aW9uLkRPV04pLFxuICAgICAgICAgICBsZXZlbDogdGhpcy5sZXZlbCxcbiAgICAgICAgICAgdXBkYXRlOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIG5leHQoKSB7XG4gICAgICAgIHRyaWdnZXIuZ290byh0aGlzLmVsZW1lbnQsIHtcbiAgICAgICAgICAgZGF0ZTogdGhpcy5zdGVwRGF0ZShTdGVwRGlyZWN0aW9uLlVQKSxcbiAgICAgICAgICAgbGV2ZWw6IHRoaXMubGV2ZWwsXG4gICAgICAgICAgIHVwZGF0ZTogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgem9vbU91dCgpIHtcbiAgICAgICAgbGV0IG5ld0xldmVsICA9IHRoaXMubGV2ZWxzLnNvcnQoKVt0aGlzLmxldmVscy5pbmRleE9mKHRoaXMubGV2ZWwpIC0gMV07XG4gICAgICAgIGlmIChuZXdMZXZlbCA9PT0gdm9pZCAwKSByZXR1cm47XG4gICAgICAgIHRyaWdnZXIuZ290byh0aGlzLmVsZW1lbnQsIHtcbiAgICAgICAgICAgZGF0ZTogdGhpcy5kYXRlLFxuICAgICAgICAgICBsZXZlbDogbmV3TGV2ZWwsXG4gICAgICAgICAgIHVwZGF0ZTogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgc3RlcERhdGUoc3RlcFR5cGU6U3RlcERpcmVjdGlvbik6RGF0ZSB7XG4gICAgICAgIGxldCBkYXRlID0gbmV3IERhdGUodGhpcy5kYXRlLnZhbHVlT2YoKSk7XG4gICAgICAgIGxldCBkaXJlY3Rpb24gPSBzdGVwVHlwZSA9PT0gU3RlcERpcmVjdGlvbi5VUCA/IDEgOiAtMTtcbiAgICAgICAgc3dpdGNoICh0aGlzLmxldmVsKSB7XG4gICAgICAgICAgICBjYXNlIExldmVsLllFQVI6XG4gICAgICAgICAgICAgICAgZGF0ZS5zZXRGdWxsWWVhcihkYXRlLmdldEZ1bGxZZWFyKCkgKyAxMCAqIGRpcmVjdGlvbik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIExldmVsLk1PTlRIOlxuICAgICAgICAgICAgICAgIGRhdGUuc2V0RnVsbFllYXIoZGF0ZS5nZXRGdWxsWWVhcigpICsgZGlyZWN0aW9uKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuREFURTpcbiAgICAgICAgICAgICAgICBkYXRlLnNldE1vbnRoKGRhdGUuZ2V0TW9udGgoKSArIGRpcmVjdGlvbik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIExldmVsLkhPVVI6XG4gICAgICAgICAgICAgICAgZGF0ZS5zZXREYXRlKGRhdGUuZ2V0RGF0ZSgpICsgZGlyZWN0aW9uKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuTUlOVVRFOlxuICAgICAgICAgICAgICAgIGRhdGUuc2V0SG91cnMoZGF0ZS5nZXRIb3VycygpICsgZGlyZWN0aW9uKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuU0VDT05EOlxuICAgICAgICAgICAgICAgIGRhdGUuc2V0TWludXRlcyhkYXRlLmdldE1pbnV0ZXMoKSArIGRpcmVjdGlvbik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRhdGU7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgdmlld2NoYW5nZWQoZGF0ZTpEYXRlLCBsZXZlbDpMZXZlbCkge1xuICAgICAgICB0aGlzLmRhdGUgPSBkYXRlO1xuICAgICAgICB0aGlzLmxldmVsID0gbGV2ZWw7XG4gICAgICAgIHRoaXMubGFiZWxzLmZvckVhY2goKGxhYmVsLCBsYWJlbExldmVsKSA9PiB7XG4gICAgICAgICAgICBsYWJlbC5jbGFzc0xpc3QucmVtb3ZlKCdkYXRpdW0tdG9wJyk7XG4gICAgICAgICAgICBsYWJlbC5jbGFzc0xpc3QucmVtb3ZlKCdkYXRpdW0tYm90dG9tJyk7XG4gICAgICAgICAgICBsYWJlbC5jbGFzc0xpc3QucmVtb3ZlKCdkYXRpdW0taGlkZGVuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChsYWJlbExldmVsIDwgbGV2ZWwpIHtcbiAgICAgICAgICAgICAgICBsYWJlbC5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tdG9wJyk7XG4gICAgICAgICAgICAgICAgbGFiZWwuaW5uZXJIVE1MID0gdGhpcy5nZXRIZWFkZXJUb3BUZXh0KGRhdGUsIGxhYmVsTGV2ZWwpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsYWJlbC5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tYm90dG9tJyk7XG4gICAgICAgICAgICAgICAgbGFiZWwuaW5uZXJIVE1MID0gdGhpcy5nZXRIZWFkZXJCb3R0b21UZXh0KGRhdGUsIGxhYmVsTGV2ZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAobGFiZWxMZXZlbCA8IGxldmVsIC0gMSB8fCBsYWJlbExldmVsID4gbGV2ZWwpIHtcbiAgICAgICAgICAgICAgICBsYWJlbC5jbGFzc0xpc3QuYWRkKCdkYXRpdW0taGlkZGVuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIGdldEhlYWRlclRvcFRleHQoZGF0ZTpEYXRlLCBsZXZlbDpMZXZlbCk6c3RyaW5nIHtcbiAgICAgICAgc3dpdGNoKGxldmVsKSB7XG4gICAgICAgICAgICBjYXNlIExldmVsLllFQVI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RGVjYWRlKGRhdGUpO1xuICAgICAgICAgICAgY2FzZSBMZXZlbC5NT05USDpcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0ZS5nZXRGdWxsWWVhcigpLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICBjYXNlIExldmVsLkRBVEU6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3RoaXMuZ2V0U2hvcnRNb250aHMoKVtkYXRlLmdldE1vbnRoKCldfSAke2RhdGUuZ2V0RnVsbFllYXIoKX1gO1xuICAgICAgICAgICAgY2FzZSBMZXZlbC5IT1VSOlxuICAgICAgICAgICAgY2FzZSBMZXZlbC5NSU5VVEU6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3RoaXMuZ2V0U2hvcnREYXlzKClbZGF0ZS5nZXREYXkoKV19ICR7dGhpcy5wYWQoZGF0ZS5nZXREYXRlKCkpfSAke3RoaXMuZ2V0U2hvcnRNb250aHMoKVtkYXRlLmdldE1vbnRoKCldfSAke2RhdGUuZ2V0RnVsbFllYXIoKX1gO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgZ2V0SGVhZGVyQm90dG9tVGV4dChkYXRlOkRhdGUsIGxldmVsOkxldmVsKTpzdHJpbmcge1xuICAgICAgICBzd2l0Y2gobGV2ZWwpIHtcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuWUVBUjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXREZWNhZGUoZGF0ZSk7XG4gICAgICAgICAgICBjYXNlIExldmVsLk1PTlRIOlxuICAgICAgICAgICAgICAgIHJldHVybiBkYXRlLmdldEZ1bGxZZWFyKCkudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuREFURTpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRTaG9ydE1vbnRocygpW2RhdGUuZ2V0TW9udGgoKV07XG4gICAgICAgICAgICBjYXNlIExldmVsLkhPVVI6XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5taWxpdGFyeVRpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke3RoaXMuZ2V0U2hvcnREYXlzKClbZGF0ZS5nZXREYXkoKV19ICR7dGhpcy5wYWQoZGF0ZS5nZXREYXRlKCkpfSA8ZGF0aXVtLXZhcmlhYmxlPiR7dGhpcy5wYWQoZGF0ZS5nZXRIb3VycygpKX08L2RhdGl1bS12YXJpYWJsZT5gO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHt0aGlzLmdldFNob3J0RGF5cygpW2RhdGUuZ2V0RGF5KCldfSAke3RoaXMucGFkKGRhdGUuZ2V0RGF0ZSgpKX0gPGRhdGl1bS12YXJpYWJsZT4ke3RoaXMuZ2V0SG91cnMoZGF0ZSl9JHt0aGlzLmdldE1lcmlkaWVtKGRhdGUpfTwvZGF0aXVtLXZhcmlhYmxlPmA7ICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuTUlOVVRFOlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMubWlsaXRhcnlUaW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHt0aGlzLnBhZChkYXRlLmdldEhvdXJzKCkpfTo8ZGF0aXVtLXZhcmlhYmxlPiR7dGhpcy5wYWQoZGF0ZS5nZXRNaW51dGVzKCkpfTwvZGF0aXVtLXZhcmlhYmxlPmA7ICAgIFxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHt0aGlzLmdldEhvdXJzKGRhdGUpfTo8ZGF0aXVtLXZhcmlhYmxlPiR7dGhpcy5wYWQoZGF0ZS5nZXRNaW51dGVzKCkpfTwvZGF0aXVtLXZhcmlhYmxlPiR7dGhpcy5nZXRNZXJpZGllbShkYXRlKX1gO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuU0VDT05EOlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMubWlsaXRhcnlUaW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHt0aGlzLnBhZChkYXRlLmdldEhvdXJzKCkpfToke3RoaXMucGFkKGRhdGUuZ2V0TWludXRlcygpKX06PGRhdGl1bS12YXJpYWJsZT4ke3RoaXMucGFkKGRhdGUuZ2V0U2Vjb25kcygpKX08L2RhdGl1bS12YXJpYWJsZT5gOyAgIFxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHt0aGlzLmdldEhvdXJzKGRhdGUpfToke3RoaXMucGFkKGRhdGUuZ2V0TWludXRlcygpKX06PGRhdGl1bS12YXJpYWJsZT4ke3RoaXMucGFkKGRhdGUuZ2V0U2Vjb25kcygpKX08L2RhdGl1bS12YXJpYWJsZT4ke3RoaXMuZ2V0TWVyaWRpZW0oZGF0ZSl9YDsgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyB1cGRhdGVPcHRpb25zKG9wdGlvbnM6SU9wdGlvbnMsIGxldmVsczpMZXZlbFtdKSB7XG4gICAgICAgIGxldCB1cGRhdGVWaWV3ID0gdGhpcy5vcHRpb25zICE9PSB2b2lkIDAgJiYgdGhpcy5vcHRpb25zLm1pbGl0YXJ5VGltZSAhPT0gb3B0aW9ucy5taWxpdGFyeVRpbWU7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgICAgIHRoaXMubGV2ZWxzID0gbGV2ZWxzO1xuICAgICAgICBpZiAodXBkYXRlVmlldykge1xuICAgICAgICAgICAgdGhpcy52aWV3Y2hhbmdlZCh0aGlzLmRhdGUsIHRoaXMubGV2ZWwpO1xuICAgICAgICB9XG4gICAgfVxufSIsImNvbnN0IGVudW0gVHJhbnNpdGlvbiB7XG4gICAgU0xJREVfTEVGVCxcbiAgICBTTElERV9SSUdIVCxcbiAgICBaT09NX0lOLFxuICAgIFpPT01fT1VUXG59XG5cbmNsYXNzIFBpY2tlck1hbmFnZXIge1xuICAgIHByaXZhdGUgb3B0aW9uczpJT3B0aW9ucztcbiAgICBwdWJsaWMgY29udGFpbmVyOkhUTUxFbGVtZW50O1xuICAgIHB1YmxpYyBoZWFkZXI6SGVhZGVyO1xuICAgIFxuICAgIHByaXZhdGUgeWVhclBpY2tlcjpJUGlja2VyO1xuICAgIHByaXZhdGUgbW9udGhQaWNrZXI6SVBpY2tlcjtcbiAgICBwcml2YXRlIGRhdGVQaWNrZXI6SVBpY2tlcjtcbiAgICBwcml2YXRlIGhvdXJQaWNrZXI6SVBpY2tlcjtcbiAgICBwcml2YXRlIG1pbnV0ZVBpY2tlcjpJUGlja2VyO1xuICAgIHByaXZhdGUgc2Vjb25kUGlja2VyOklQaWNrZXI7XG4gICAgXG4gICAgcHVibGljIGN1cnJlbnRQaWNrZXI6SVBpY2tlcjtcbiAgICBcbiAgICBwcml2YXRlIHBpY2tlckNvbnRhaW5lcjpIVE1MRWxlbWVudDtcbiAgICBcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVsZW1lbnQ6SFRNTElucHV0RWxlbWVudCkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lciA9IHRoaXMuY3JlYXRlVmlldygpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5pbnNlcnRBZnRlcihlbGVtZW50LCB0aGlzLmNvbnRhaW5lcik7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnBpY2tlckNvbnRhaW5lciA9IDxIVE1MRWxlbWVudD50aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdkYXRpdW0tcGlja2VyLWNvbnRhaW5lcicpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5oZWFkZXIgPSBuZXcgSGVhZGVyKGVsZW1lbnQsIHRoaXMuY29udGFpbmVyKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMueWVhclBpY2tlciA9IG5ldyBZZWFyUGlja2VyKGVsZW1lbnQsIHRoaXMuY29udGFpbmVyKTtcbiAgICAgICAgdGhpcy5tb250aFBpY2tlciA9IG5ldyBNb250aFBpY2tlcihlbGVtZW50LCB0aGlzLmNvbnRhaW5lcik7XG4gICAgICAgIHRoaXMuZGF0ZVBpY2tlciA9IG5ldyBEYXRlUGlja2VyKGVsZW1lbnQsIHRoaXMuY29udGFpbmVyKTtcbiAgICAgICAgdGhpcy5ob3VyUGlja2VyID0gbmV3IEhvdXJQaWNrZXIoZWxlbWVudCwgdGhpcy5jb250YWluZXIpO1xuICAgICAgICB0aGlzLm1pbnV0ZVBpY2tlciA9IG5ldyBNaW51dGVQaWNrZXIoZWxlbWVudCwgdGhpcy5jb250YWluZXIpO1xuICAgICAgICB0aGlzLnNlY29uZFBpY2tlciA9IG5ldyBTZWNvbmRQaWNrZXIoZWxlbWVudCwgdGhpcy5jb250YWluZXIpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBsaXN0ZW4uZG93bih0aGlzLmNvbnRhaW5lciwgJyonLCAoZSkgPT4gdGhpcy5kb3duKGUpKTtcbiAgICAgICAgbGlzdGVuLnVwKGRvY3VtZW50LCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlQnViYmxlKCk7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUFjdGl2ZUNsYXNzZXMoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBsaXN0ZW4ubW91c2Vkb3duKHRoaXMuY29udGFpbmVyLCAoZSkgPT4ge1xuICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgIHJldHVybiBmYWxzZTsgXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgbGlzdGVuLnZpZXdjaGFuZ2VkKGVsZW1lbnQsIChlKSA9PiB0aGlzLnZpZXdjaGFuZ2VkKGUuZGF0ZSwgZS5sZXZlbCwgZS51cGRhdGUpKTtcbiAgICAgICAgXG4gICAgICAgIGxpc3Rlbi5vcGVuQnViYmxlKGVsZW1lbnQsIChlKSA9PiB7XG4gICAgICAgICAgIHRoaXMub3BlbkJ1YmJsZShlLngsIGUueSwgZS50ZXh0KTsgXG4gICAgICAgIH0pO1xuICAgICAgICBsaXN0ZW4udXBkYXRlQnViYmxlKGVsZW1lbnQsIChlKSA9PiB7XG4gICAgICAgICAgIHRoaXMudXBkYXRlQnViYmxlKGUueCwgZS55LCBlLnRleHQpOyBcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBjbG9zZUJ1YmJsZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuYnViYmxlID09PSB2b2lkIDApIHJldHVybjtcbiAgICAgICAgdGhpcy5idWJibGUuY2xhc3NMaXN0LnJlbW92ZSgnZGF0aXVtLWJ1YmJsZS12aXNpYmxlJyk7XG4gICAgICAgIHNldFRpbWVvdXQoKGJ1YmJsZTpIVE1MRWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgYnViYmxlLnJlbW92ZSgpO1xuICAgICAgICB9LCAyMDAsIHRoaXMuYnViYmxlKTtcbiAgICAgICAgdGhpcy5idWJibGUgPSB2b2lkIDA7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgYnViYmxlOkhUTUxFbGVtZW50O1xuICAgIFxuICAgIHB1YmxpYyBvcGVuQnViYmxlKHg6bnVtYmVyLCB5Om51bWJlciwgdGV4dDpzdHJpbmcpIHtcbiAgICAgICAgaWYgKHRoaXMuYnViYmxlICE9PSB2b2lkIDApIHtcbiAgICAgICAgICAgIHRoaXMuY2xvc2VCdWJibGUoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJ1YmJsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1idWJibGUnKTtcbiAgICAgICAgdGhpcy5jb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5idWJibGUpO1xuICAgICAgICB0aGlzLnVwZGF0ZUJ1YmJsZSh4LCB5LCB0ZXh0KTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgIHRoaXMuYnViYmxlLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1idWJibGUtdmlzaWJsZScpOyBcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyB1cGRhdGVCdWJibGUoeDpudW1iZXIsIHk6bnVtYmVyLCB0ZXh0OnN0cmluZykge1xuICAgICAgICB0aGlzLmJ1YmJsZS5pbm5lckhUTUwgPSB0ZXh0O1xuICAgICAgICB0aGlzLmJ1YmJsZS5zdHlsZS50b3AgPSB5ICsgJ3B4JztcbiAgICAgICAgdGhpcy5idWJibGUuc3R5bGUubGVmdCA9IHggKyAncHgnO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIHZpZXdjaGFuZ2VkKGRhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWwsIHVwZGF0ZTpib29sZWFuKSB7XG4gICAgICAgIGlmIChsZXZlbCA9PT0gTGV2ZWwuTk9ORSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudFBpY2tlciAhPT0gdm9pZCAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UGlja2VyLnJlbW92ZShUcmFuc2l0aW9uLlpPT01fT1VUKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuYWRqdXN0SGVpZ2h0KDEwKTtcbiAgICAgICAgICAgIGlmICh1cGRhdGUpIHRoaXMudXBkYXRlU2VsZWN0ZWREYXRlKGRhdGUpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBsZXQgdHJhbnNpdGlvbjpUcmFuc2l0aW9uO1xuICAgICAgICBpZiAodGhpcy5jdXJyZW50UGlja2VyID09PSB2b2lkIDApIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBpY2tlciA9IHRoaXMuZ2V0UGlja2VyKGxldmVsKTtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBpY2tlci5jcmVhdGUoZGF0ZSwgVHJhbnNpdGlvbi5aT09NX0lOKTtcbiAgICAgICAgfSBlbHNlIGlmICgodHJhbnNpdGlvbiA9IHRoaXMuZ2V0VHJhbnNpdGlvbihkYXRlLCBsZXZlbCkpICE9PSB2b2lkIDApIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBpY2tlci5yZW1vdmUodHJhbnNpdGlvbik7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQaWNrZXIgPSB0aGlzLmdldFBpY2tlcihsZXZlbCk7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQaWNrZXIuY3JlYXRlKGRhdGUsIHRyYW5zaXRpb24pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAodXBkYXRlKSB0aGlzLnVwZGF0ZVNlbGVjdGVkRGF0ZShkYXRlKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuYWRqdXN0SGVpZ2h0KHRoaXMuY3VycmVudFBpY2tlci5nZXRIZWlnaHQoKSk7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgdXBkYXRlU2VsZWN0ZWREYXRlKGRhdGU6RGF0ZSkge1xuICAgICAgICB0aGlzLnllYXJQaWNrZXIuc2V0U2VsZWN0ZWREYXRlKGRhdGUpO1xuICAgICAgICB0aGlzLm1vbnRoUGlja2VyLnNldFNlbGVjdGVkRGF0ZShkYXRlKTtcbiAgICAgICAgdGhpcy5kYXRlUGlja2VyLnNldFNlbGVjdGVkRGF0ZShkYXRlKTtcbiAgICAgICAgdGhpcy5ob3VyUGlja2VyLnNldFNlbGVjdGVkRGF0ZShkYXRlKTtcbiAgICAgICAgdGhpcy5taW51dGVQaWNrZXIuc2V0U2VsZWN0ZWREYXRlKGRhdGUpO1xuICAgICAgICB0aGlzLnNlY29uZFBpY2tlci5zZXRTZWxlY3RlZERhdGUoZGF0ZSk7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgZ2V0VHJhbnNpdGlvbihkYXRlOkRhdGUsIGxldmVsOkxldmVsKTpUcmFuc2l0aW9uIHtcbiAgICAgICAgaWYgKGxldmVsID4gdGhpcy5jdXJyZW50UGlja2VyLmdldExldmVsKCkpIHJldHVybiBUcmFuc2l0aW9uLlpPT01fSU47XG4gICAgICAgIGlmIChsZXZlbCA8IHRoaXMuY3VycmVudFBpY2tlci5nZXRMZXZlbCgpKSByZXR1cm4gVHJhbnNpdGlvbi5aT09NX09VVDtcbiAgICAgICAgaWYgKGRhdGUudmFsdWVPZigpIDwgdGhpcy5jdXJyZW50UGlja2VyLmdldE1pbigpLnZhbHVlT2YoKSkgcmV0dXJuIFRyYW5zaXRpb24uU0xJREVfTEVGVDtcbiAgICAgICAgaWYgKGRhdGUudmFsdWVPZigpID4gdGhpcy5jdXJyZW50UGlja2VyLmdldE1heCgpLnZhbHVlT2YoKSkgcmV0dXJuIFRyYW5zaXRpb24uU0xJREVfUklHSFQ7XG4gICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgYWRqdXN0SGVpZ2h0KGhlaWdodDpudW1iZXIpIHtcbiAgICAgICAgdGhpcy5waWNrZXJDb250YWluZXIuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZVkoJHtoZWlnaHQgLSAyODB9cHgpYDtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBnZXRQaWNrZXIobGV2ZWw6TGV2ZWwpOklQaWNrZXIge1xuICAgICAgICByZXR1cm4gW3RoaXMueWVhclBpY2tlcix0aGlzLm1vbnRoUGlja2VyLHRoaXMuZGF0ZVBpY2tlcix0aGlzLmhvdXJQaWNrZXIsdGhpcy5taW51dGVQaWNrZXIsdGhpcy5zZWNvbmRQaWNrZXJdW2xldmVsXTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHJlbW92ZUFjdGl2ZUNsYXNzZXMoKSB7XG4gICAgICAgIGxldCBhY3RpdmVFbGVtZW50cyA9IHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJy5kYXRpdW0tYWN0aXZlJyk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWN0aXZlRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFjdGl2ZUVsZW1lbnRzW2ldLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1hY3RpdmUnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdkYXRpdW0tYWN0aXZlJyk7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgZG93bihlOk1vdXNlRXZlbnR8VG91Y2hFdmVudCkge1xuICAgICAgICBsZXQgZWwgPSBlLnNyY0VsZW1lbnQgfHwgPEVsZW1lbnQ+ZS50YXJnZXQ7XG4gICAgICAgIHdoaWxlIChlbCAhPT0gdGhpcy5jb250YWluZXIpIHtcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1hY3RpdmUnKTtcbiAgICAgICAgICAgIGVsID0gZWwucGFyZW50RWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tYWN0aXZlJyk7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyB1cGRhdGVPcHRpb25zKG9wdGlvbnM6SU9wdGlvbnMsIGxldmVsczpMZXZlbFtdKSB7XG4gICAgICAgIGxldCB0aGVtZVVwZGF0ZWQgPSB0aGlzLm9wdGlvbnMgPT09IHZvaWQgMCB8fFxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnRoZW1lID09PSB2b2lkIDAgfHxcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy50aGVtZS5wcmltYXJ5ICE9PSBvcHRpb25zLnRoZW1lLnByaW1hcnkgfHxcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy50aGVtZS5wcmltYXJ5X3RleHQgIT09IG9wdGlvbnMudGhlbWUucHJpbWFyeV90ZXh0IHx8XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMudGhlbWUuc2Vjb25kYXJ5ICE9PSBvcHRpb25zLnRoZW1lLnNlY29uZGFyeSB8fFxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnRoZW1lLnNlY29uZGFyeV9hY2NlbnQgIT09IG9wdGlvbnMudGhlbWUuc2Vjb25kYXJ5X2FjY2VudCB8fFxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnRoZW1lLnNlY29uZGFyeV90ZXh0ICE9PSBvcHRpb25zLnRoZW1lLnNlY29uZGFyeV90ZXh0O1xuICAgICAgICBcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICAgICAgXG4gICAgICAgIGlmICh0aGVtZVVwZGF0ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuaW5zZXJ0U3R5bGVzKCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRoaXMuaGVhZGVyLnVwZGF0ZU9wdGlvbnMob3B0aW9ucywgbGV2ZWxzKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMueWVhclBpY2tlci51cGRhdGVPcHRpb25zKG9wdGlvbnMpO1xuICAgICAgICB0aGlzLm1vbnRoUGlja2VyLnVwZGF0ZU9wdGlvbnMob3B0aW9ucyk7XG4gICAgICAgIHRoaXMuZGF0ZVBpY2tlci51cGRhdGVPcHRpb25zKG9wdGlvbnMpO1xuICAgICAgICB0aGlzLmhvdXJQaWNrZXIudXBkYXRlT3B0aW9ucyhvcHRpb25zKTtcbiAgICAgICAgdGhpcy5taW51dGVQaWNrZXIudXBkYXRlT3B0aW9ucyhvcHRpb25zKTtcbiAgICAgICAgdGhpcy5zZWNvbmRQaWNrZXIudXBkYXRlT3B0aW9ucyhvcHRpb25zKTtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBjcmVhdGVWaWV3KCk6SFRNTEVsZW1lbnQge1xuICAgICAgICBsZXQgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tY29udGFpbmVyJyk7XG4gICAgICAgIGVsLmlubmVySFRNTCA9IGhlYWRlciArIGBcbiAgICAgICAgPGRhdGl1bS1waWNrZXItY29udGFpbmVyLXdyYXBwZXI+XG4gICAgICAgICAgICA8ZGF0aXVtLXBpY2tlci1jb250YWluZXI+PC9kYXRpdW0tcGlja2VyLWNvbnRhaW5lcj5cbiAgICAgICAgPC9kYXRpdW0tcGlja2VyLWNvbnRhaW5lci13cmFwcGVyPmA7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gZWw7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgaW5zZXJ0QWZ0ZXIobm9kZTpOb2RlLCBuZXdOb2RlOk5vZGUpOnZvaWQge1xuICAgICAgICBub2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5ld05vZGUsIG5vZGUubmV4dFNpYmxpbmcpO1xuICAgIH1cbiAgICBcbiAgICBzdGF0aWMgc3R5bGVzSW5zZXJ0ZWQ6bnVtYmVyID0gMDtcbiAgICBcbiAgICBwcml2YXRlIGluc2VydFN0eWxlcygpIHtcbiAgICAgICAgbGV0IGhlYWQgPSBkb2N1bWVudC5oZWFkIHx8IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF07XG4gICAgICAgIGxldCBzdHlsZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgICAgICBcbiAgICAgICAgbGV0IHN0eWxlSWQgPSBcImRhdGl1bS1zdHlsZVwiICsgKFBpY2tlck1hbmFnZXIuc3R5bGVzSW5zZXJ0ZWQrKyk7XG4gICAgICAgIFxuICAgICAgICBsZXQgZXhpc3RpbmdTdHlsZUlkID0gdGhpcy5nZXRFeGlzdGluZ1N0eWxlSWQoKTtcbiAgICAgICAgaWYgKGV4aXN0aW5nU3R5bGVJZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5jb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZShleGlzdGluZ1N0eWxlSWQpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKHN0eWxlSWQpO1xuICAgICAgICBcbiAgICAgICAgbGV0IHRyYW5zZm9ybWVkQ3NzID0gY3NzLnJlcGxhY2UoL19wcmltYXJ5X3RleHQvZywgdGhpcy5vcHRpb25zLnRoZW1lLnByaW1hcnlfdGV4dCk7XG4gICAgICAgIHRyYW5zZm9ybWVkQ3NzID0gdHJhbnNmb3JtZWRDc3MucmVwbGFjZSgvX3ByaW1hcnkvZywgdGhpcy5vcHRpb25zLnRoZW1lLnByaW1hcnkpO1xuICAgICAgICB0cmFuc2Zvcm1lZENzcyA9IHRyYW5zZm9ybWVkQ3NzLnJlcGxhY2UoL19zZWNvbmRhcnlfdGV4dC9nLCB0aGlzLm9wdGlvbnMudGhlbWUuc2Vjb25kYXJ5X3RleHQpO1xuICAgICAgICB0cmFuc2Zvcm1lZENzcyA9IHRyYW5zZm9ybWVkQ3NzLnJlcGxhY2UoL19zZWNvbmRhcnlfYWNjZW50L2csIHRoaXMub3B0aW9ucy50aGVtZS5zZWNvbmRhcnlfYWNjZW50KTtcbiAgICAgICAgdHJhbnNmb3JtZWRDc3MgPSB0cmFuc2Zvcm1lZENzcy5yZXBsYWNlKC9fc2Vjb25kYXJ5L2csIHRoaXMub3B0aW9ucy50aGVtZS5zZWNvbmRhcnkpO1xuICAgICAgICB0cmFuc2Zvcm1lZENzcyA9IHRyYW5zZm9ybWVkQ3NzLnJlcGxhY2UoL19pZC9nLCBzdHlsZUlkKTtcbiAgICAgICAgXG4gICAgICAgIHN0eWxlRWxlbWVudC50eXBlID0gJ3RleHQvY3NzJztcbiAgICAgICAgaWYgKCg8YW55PnN0eWxlRWxlbWVudCkuc3R5bGVTaGVldCl7XG4gICAgICAgICAgICAoPGFueT5zdHlsZUVsZW1lbnQpLnN0eWxlU2hlZXQuY3NzVGV4dCA9IHRyYW5zZm9ybWVkQ3NzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3R5bGVFbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRyYW5zZm9ybWVkQ3NzKSk7XG4gICAgICAgIH1cblxuICAgICAgICBoZWFkLmFwcGVuZENoaWxkKHN0eWxlRWxlbWVudCk7ICBcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBnZXRFeGlzdGluZ1N0eWxlSWQoKTpzdHJpbmcge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKC9eZGF0aXVtLXN0eWxlXFxkKyQvLnRlc3QodGhpcy5jb250YWluZXIuY2xhc3NMaXN0Lml0ZW0oaSkpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5pdGVtKGkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cbiIsInZhciBoZWFkZXIgPSBcIjxkYXRpdW0taGVhZGVyLXdyYXBwZXI+IDxkYXRpdW0taGVhZGVyPiA8ZGF0aXVtLXNwYW4tbGFiZWwtY29udGFpbmVyPiA8ZGF0aXVtLXNwYW4tbGFiZWwgY2xhc3M9J2RhdGl1bS15ZWFyJz48L2RhdGl1bS1zcGFuLWxhYmVsPiA8ZGF0aXVtLXNwYW4tbGFiZWwgY2xhc3M9J2RhdGl1bS1tb250aCc+PC9kYXRpdW0tc3Bhbi1sYWJlbD4gPGRhdGl1bS1zcGFuLWxhYmVsIGNsYXNzPSdkYXRpdW0tZGF0ZSc+PC9kYXRpdW0tc3Bhbi1sYWJlbD4gPGRhdGl1bS1zcGFuLWxhYmVsIGNsYXNzPSdkYXRpdW0taG91cic+PC9kYXRpdW0tc3Bhbi1sYWJlbD4gPGRhdGl1bS1zcGFuLWxhYmVsIGNsYXNzPSdkYXRpdW0tbWludXRlJz48L2RhdGl1bS1zcGFuLWxhYmVsPiA8ZGF0aXVtLXNwYW4tbGFiZWwgY2xhc3M9J2RhdGl1bS1zZWNvbmQnPjwvZGF0aXVtLXNwYW4tbGFiZWw+IDwvZGF0aXVtLXNwYW4tbGFiZWwtY29udGFpbmVyPiA8ZGF0aXVtLXByZXY+PC9kYXRpdW0tcHJldj4gPGRhdGl1bS1uZXh0PjwvZGF0aXVtLW5leHQ+IDwvZGF0aXVtLWhlYWRlcj4gPC9kYXRpdW0taGVhZGVyLXdyYXBwZXI+XCI7IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2NvbW1vbi9Db21tb24udHNcIiAvPlxuY2xhc3MgUGlja2VyIGV4dGVuZHMgQ29tbW9uIHtcbiAgICBwcm90ZWN0ZWQgcGlja2VyQ29udGFpbmVyOkhUTUxFbGVtZW50O1xuICAgIHByb3RlY3RlZCBtaW46RGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgcHJvdGVjdGVkIG1heDpEYXRlID0gbmV3IERhdGUoKTtcbiAgICBwcm90ZWN0ZWQgcGlja2VyOkhUTUxFbGVtZW50O1xuICAgIHByb3RlY3RlZCBzZWxlY3RlZERhdGU6RGF0ZTtcbiAgICBcbiAgICBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgZWxlbWVudDpIVE1MRWxlbWVudCwgcHJvdGVjdGVkIGNvbnRhaW5lcjpIVE1MRWxlbWVudCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLnBpY2tlckNvbnRhaW5lciA9IDxIVE1MRWxlbWVudD5jb250YWluZXIucXVlcnlTZWxlY3RvcignZGF0aXVtLXBpY2tlci1jb250YWluZXInKTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIGNyZWF0ZShkYXRlOkRhdGUsIHRyYW5zaXRpb246VHJhbnNpdGlvbikge1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgcmVtb3ZlKHRyYW5zaXRpb246VHJhbnNpdGlvbikge1xuICAgICAgICBpZiAodGhpcy5waWNrZXIgPT09IHZvaWQgMCkgcmV0dXJuO1xuICAgICAgICB0aGlzLnRyYW5zaXRpb25PdXQodHJhbnNpdGlvbiwgdGhpcy5waWNrZXIpO1xuICAgICAgICBzZXRUaW1lb3V0KChwaWNrZXI6SFRNTEVsZW1lbnQpID0+IHtcbiAgICAgICAgICAgIHBpY2tlci5yZW1vdmUoKTtcbiAgICAgICAgfSwgNTAwLCB0aGlzLnBpY2tlcik7ICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgcHJvdGVjdGVkIGdldE9mZnNldChlbDpIVE1MRWxlbWVudCk6e3g6bnVtYmVyLCB5Om51bWJlcn0ge1xuICAgICAgICBsZXQgeCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQgLSB0aGlzLmNvbnRhaW5lci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0O1xuICAgICAgICBsZXQgeSA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCAtIHRoaXMuY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcDtcbiAgICAgICAgcmV0dXJuIHsgeDogeCwgeTogeSB9O1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgdXBkYXRlT3B0aW9ucyhvcHRpb25zOklPcHRpb25zKSB7XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBwcm90ZWN0ZWQgYXR0YWNoKCkge1xuICAgICAgICB0aGlzLnBpY2tlckNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLnBpY2tlcik7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBnZXRNaW4oKTpEYXRlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWluO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgZ2V0TWF4KCk6RGF0ZSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1heDtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHNldFNlbGVjdGVkRGF0ZShkYXRlOkRhdGUpOnZvaWQge1xuICAgICAgICB0aGlzLnNlbGVjdGVkRGF0ZSA9IG5ldyBEYXRlKGRhdGUudmFsdWVPZigpKTtcbiAgICB9XG4gICAgXG4gICAgcHJvdGVjdGVkIHRyYW5zaXRpb25PdXQodHJhbnNpdGlvbjpUcmFuc2l0aW9uLCBwaWNrZXI6SFRNTEVsZW1lbnQpIHtcbiAgICAgICAgaWYgKHRyYW5zaXRpb24gPT09IFRyYW5zaXRpb24uU0xJREVfTEVGVCkge1xuICAgICAgICAgICAgcGlja2VyLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1waWNrZXItcmlnaHQnKTtcbiAgICAgICAgfSBlbHNlIGlmICh0cmFuc2l0aW9uID09PSBUcmFuc2l0aW9uLlNMSURFX1JJR0hUKSB7XG4gICAgICAgICAgICBwaWNrZXIuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLXBpY2tlci1sZWZ0Jyk7XG4gICAgICAgIH0gZWxzZSBpZiAodHJhbnNpdGlvbiA9PT0gVHJhbnNpdGlvbi5aT09NX0lOKSB7XG4gICAgICAgICAgICBwaWNrZXIuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLXBpY2tlci1vdXQnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBpY2tlci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tcGlja2VyLWluJyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcHJvdGVjdGVkIHRyYW5zaXRpb25Jbih0cmFuc2l0aW9uOlRyYW5zaXRpb24sIHBpY2tlcjpIVE1MRWxlbWVudCkge1xuICAgICAgICBsZXQgY2xzO1xuICAgICAgICBpZiAodHJhbnNpdGlvbiA9PT0gVHJhbnNpdGlvbi5TTElERV9MRUZUKSB7XG4gICAgICAgICAgICBjbHMgPSAnZGF0aXVtLXBpY2tlci1sZWZ0JztcbiAgICAgICAgfSBlbHNlIGlmICh0cmFuc2l0aW9uID09PSBUcmFuc2l0aW9uLlNMSURFX1JJR0hUKSB7XG4gICAgICAgICAgICBjbHMgPSAnZGF0aXVtLXBpY2tlci1yaWdodCc7XG4gICAgICAgIH0gZWxzZSBpZiAodHJhbnNpdGlvbiA9PT0gVHJhbnNpdGlvbi5aT09NX0lOKSB7XG4gICAgICAgICAgICBjbHMgPSAnZGF0aXVtLXBpY2tlci1pbic7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjbHMgPSAnZGF0aXVtLXBpY2tlci1vdXQnO1xuICAgICAgICB9XG4gICAgICAgIHBpY2tlci5jbGFzc0xpc3QuYWRkKGNscyk7XG4gICAgICAgIHNldFRpbWVvdXQoKHApID0+IHtcbiAgICAgICAgICAgIHAuY2xhc3NMaXN0LnJlbW92ZShjbHMpO1xuICAgICAgICB9LCAxMDAsIHBpY2tlcik7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInBpY2tlci50c1wiIC8+XG5cbmNsYXNzIERhdGVQaWNrZXIgZXh0ZW5kcyBQaWNrZXIgaW1wbGVtZW50cyBJUGlja2VyIHtcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OkhUTUxFbGVtZW50LCBjb250YWluZXI6SFRNTEVsZW1lbnQpIHtcbiAgICAgICAgc3VwZXIoZWxlbWVudCwgY29udGFpbmVyKTtcbiAgICAgICAgXG4gICAgICAgIGxpc3Rlbi50YXAoY29udGFpbmVyLCAnZGF0aXVtLWRhdGUtZWxlbWVudFtkYXRpdW0tZGF0YV0nLCAoZSkgPT4ge1xuICAgICAgICAgICBsZXQgZWw6RWxlbWVudCA9IDxFbGVtZW50PmUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcbiAgICAgICAgICAgXG4gICAgICAgICAgIGxldCB5ZWFyID0gbmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKS5nZXRGdWxsWWVhcigpO1xuICAgICAgICAgICBsZXQgbW9udGggPSBuZXcgRGF0ZShlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpLmdldE1vbnRoKCk7XG4gICAgICAgICAgIGxldCBkYXRlT2ZNb250aCA9IG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSkuZ2V0RGF0ZSgpO1xuICAgICAgICAgICBcbiAgICAgICAgICAgbGV0IGRhdGUgPSBuZXcgRGF0ZSh0aGlzLnNlbGVjdGVkRGF0ZS52YWx1ZU9mKCkpO1xuICAgICAgICAgICBkYXRlLnNldEZ1bGxZZWFyKHllYXIpO1xuICAgICAgICAgICBkYXRlLnNldE1vbnRoKG1vbnRoKTtcbiAgICAgICAgICAgaWYgKGRhdGUuZ2V0TW9udGgoKSAhPT0gbW9udGgpIHtcbiAgICAgICAgICAgICAgIGRhdGUuc2V0RGF0ZSgwKTtcbiAgICAgICAgICAgfVxuICAgICAgICAgICBkYXRlLnNldERhdGUoZGF0ZU9mTW9udGgpO1xuICAgICAgICAgICBcbiAgICAgICAgICAgdHJpZ2dlci5nb3RvKGVsZW1lbnQsIHtcbiAgICAgICAgICAgICAgIGRhdGU6IGRhdGUsXG4gICAgICAgICAgICAgICBsZXZlbDogTGV2ZWwuSE9VUlxuICAgICAgICAgICB9KVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGxpc3Rlbi5kb3duKGNvbnRhaW5lciwgJ2RhdGl1bS1kYXRlLWVsZW1lbnQnLCAoZSkgPT4ge1xuICAgICAgICAgICAgbGV0IGVsOkhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PihlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQpO1xuICAgICAgICAgICAgbGV0IHRleHQgPSB0aGlzLnBhZChuZXcgRGF0ZShlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpLmdldERhdGUoKSk7XG4gICAgICAgICAgICBsZXQgb2Zmc2V0ID0gdGhpcy5nZXRPZmZzZXQoZWwpO1xuICAgICAgICAgICAgdHJpZ2dlci5vcGVuQnViYmxlKGVsZW1lbnQsIHtcbiAgICAgICAgICAgICAgICB4OiBvZmZzZXQueCArIDIwLFxuICAgICAgICAgICAgICAgIHk6IG9mZnNldC55ICsgMixcbiAgICAgICAgICAgICAgICB0ZXh0OiB0ZXh0XG4gICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBoZWlnaHQ6bnVtYmVyO1xuICAgIFxuICAgIHB1YmxpYyBjcmVhdGUoZGF0ZTpEYXRlLCB0cmFuc2l0aW9uOlRyYW5zaXRpb24pIHtcbiAgICAgICAgdGhpcy5taW4gPSBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSk7XG4gICAgICAgIHRoaXMubWF4ID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCkgKyAxKTtcbiAgICAgICAgXG4gICAgICAgIGxldCBzdGFydCA9IG5ldyBEYXRlKHRoaXMubWluLnZhbHVlT2YoKSk7XG4gICAgICAgIHN0YXJ0LnNldERhdGUoMSAtIHN0YXJ0LmdldERheSgpKTtcbiAgICAgICAgXG4gICAgICAgIGxldCBlbmQgPSBuZXcgRGF0ZSh0aGlzLm1heC52YWx1ZU9mKCkpO1xuICAgICAgICBlbmQuc2V0RGF0ZShlbmQuZ2V0RGF0ZSgpICsgNyAtIChlbmQuZ2V0RGF5KCkgPT09IDAgPyA3IDogZW5kLmdldERheSgpKSk7XG4gICAgICAgIFxuICAgICAgICBsZXQgaXRlcmF0b3IgPSBuZXcgRGF0ZShzdGFydC52YWx1ZU9mKCkpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5waWNrZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tcGlja2VyJyk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnRyYW5zaXRpb25Jbih0cmFuc2l0aW9uLCB0aGlzLnBpY2tlcik7XG4gICAgICAgIFxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDc7IGkrKykge1xuICAgICAgICAgICAgbGV0IGhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1kYXRlLWhlYWRlcicpO1xuICAgICAgICAgICAgaGVhZGVyLmlubmVySFRNTCA9IHRoaXMuZ2V0RGF5cygpW2ldLnNsaWNlKDAsIDIpO1xuICAgICAgICAgICAgdGhpcy5waWNrZXIuYXBwZW5kQ2hpbGQoaGVhZGVyKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgbGV0IHRpbWVzID0gMDtcbiAgICAgICAgXG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIGxldCBkYXRlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1kYXRlLWVsZW1lbnQnKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZGF0ZUVsZW1lbnQuaW5uZXJIVE1MID0gaXRlcmF0b3IuZ2V0RGF0ZSgpLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChpdGVyYXRvci5nZXRNb250aCgpID09PSBkYXRlLmdldE1vbnRoKCkpIHtcbiAgICAgICAgICAgICAgICBkYXRlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJywgaXRlcmF0b3IudG9JU09TdHJpbmcoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKGRhdGVFbGVtZW50KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaXRlcmF0b3Iuc2V0RGF0ZShpdGVyYXRvci5nZXREYXRlKCkgKyAxKTtcbiAgICAgICAgICAgIHRpbWVzKys7XG4gICAgICAgIH0gd2hpbGUgKGl0ZXJhdG9yLnZhbHVlT2YoKSA8IGVuZC52YWx1ZU9mKCkpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gTWF0aC5jZWlsKHRpbWVzIC8gNykgKiAzNiArIDI4O1xuICAgICAgICBcbiAgICAgICAgdGhpcy5hdHRhY2goKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuc2V0U2VsZWN0ZWREYXRlKHRoaXMuc2VsZWN0ZWREYXRlKTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHNldFNlbGVjdGVkRGF0ZShzZWxlY3RlZERhdGU6RGF0ZSkge1xuICAgICAgICB0aGlzLnNlbGVjdGVkRGF0ZSA9IG5ldyBEYXRlKHNlbGVjdGVkRGF0ZS52YWx1ZU9mKCkpO1xuICAgICAgICBcbiAgICAgICAgbGV0IGRhdGVFbGVtZW50cyA9IHRoaXMucGlja2VyQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJ2RhdGl1bS1kYXRlLWVsZW1lbnQnKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRlRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBlbCA9IGRhdGVFbGVtZW50cy5pdGVtKGkpO1xuICAgICAgICAgICAgbGV0IGRhdGUgPSBuZXcgRGF0ZShlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpO1xuICAgICAgICAgICAgaWYgKGRhdGUuZ2V0RnVsbFllYXIoKSA9PT0gc2VsZWN0ZWREYXRlLmdldEZ1bGxZZWFyKCkgJiZcbiAgICAgICAgICAgICAgICBkYXRlLmdldE1vbnRoKCkgPT09IHNlbGVjdGVkRGF0ZS5nZXRNb250aCgpICYmXG4gICAgICAgICAgICAgICAgZGF0ZS5nZXREYXRlKCkgPT09IHNlbGVjdGVkRGF0ZS5nZXREYXRlKCkpIHtcbiAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZGF0aXVtLXNlbGVjdGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcHVibGljIGdldEhlaWdodCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGVpZ2h0O1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XG4gICAgICAgIHJldHVybiBMZXZlbC5EQVRFO1xuICAgIH1cbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwicGlja2VyLnRzXCIgLz5cblxuY2xhc3MgSG91clBpY2tlciBleHRlbmRzIFBpY2tlciBpbXBsZW1lbnRzIElQaWNrZXIge1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6SFRNTEVsZW1lbnQsIGNvbnRhaW5lcjpIVE1MRWxlbWVudCkge1xuICAgICAgICBzdXBlcihlbGVtZW50LCBjb250YWluZXIpO1xuICAgICAgICBcbiAgICAgICAgbGlzdGVuLmRyYWcoY29udGFpbmVyLCAnZGF0aXVtLXRpbWUtZHJhZycsIHtcbiAgICAgICAgICAgIGRyYWdTdGFydDogKGUpID0+IHRoaXMuZHJhZ1N0YXJ0KGUpLFxuICAgICAgICAgICAgZHJhZ01vdmU6IChlKSA9PiB0aGlzLmRyYWdNb3ZlKGUpLFxuICAgICAgICAgICAgZHJhZ0VuZDogKGUpID0+IHRoaXMuZHJhZ0VuZChlKSwgXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIG9mZnNldFg6bnVtYmVyO1xuICAgIHByaXZhdGUgb2Zmc2V0WTpudW1iZXI7XG4gICAgXG4gICAgcHJpdmF0ZSBkcmFnU3RhcnQoZTpNb3VzZUV2ZW50fFRvdWNoRXZlbnQpIHtcbiAgICAgICAgdHJpZ2dlci5vcGVuQnViYmxlKHRoaXMuZWxlbWVudCwge1xuICAgICAgICAgICB4OiAtNzAgKiBNYXRoLnNpbih0aGlzLnJvdGF0aW9uKSArIDE0MCwgXG4gICAgICAgICAgIHk6IDcwICogTWF0aC5jb3ModGhpcy5yb3RhdGlvbikgKyAxNzUsXG4gICAgICAgICAgIHRleHQ6IHRoaXMuZ2V0VGltZSgpIFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5waWNrZXIuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLWRyYWdnaW5nJyk7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgZHJhZ01vdmUoZTpNb3VzZUV2ZW50fFRvdWNoRXZlbnQpIHtcbiAgICAgICAgdGhpcy5nZXRUaW1lKCk7XG4gICAgICAgIHRyaWdnZXIudXBkYXRlQnViYmxlKHRoaXMuZWxlbWVudCwge1xuICAgICAgICAgICB4OiAtNzAgKiBNYXRoLnNpbih0aGlzLnJvdGF0aW9uKSArIDE0MCwgXG4gICAgICAgICAgIHk6IDcwICogTWF0aC5jb3ModGhpcy5yb3RhdGlvbikgKyAxNzUsXG4gICAgICAgICAgIHRleHQ6IHRoaXMuZ2V0VGltZSgpXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgcG9pbnQgPSB0aGlzLmZyb21DZW50ZXIodGhpcy5nZXRDbGllbnRDb29yKGUpKTtcbiAgICAgICAgbGV0IHIgPSBNYXRoLmF0YW4yKHBvaW50LngsIHBvaW50LnkpO1xuICAgICAgICB3aGlsZSAociAtIHRoaXMucm90YXRpb24gPiBNYXRoLlBJKSByIC09IDIqTWF0aC5QSTtcbiAgICAgICAgd2hpbGUgKHRoaXMucm90YXRpb24gLSByIDwgLU1hdGguUEkpIHIgKz0gMipNYXRoLlBJO1xuICAgICAgICB0aGlzLnJvdGF0aW9uID0gcjtcbiAgICAgICAgdGhpcy51cGRhdGVUaW1lRHJhZ0FybSgpO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIGdldFRpbWUoKSB7XG4gICAgICAgIGxldCB0aW1lID0gMTgwL01hdGguUEkgKiB0aGlzLnJvdGF0aW9uIC8gMzAgKyA2O1xuICAgICAgICB0aW1lID0gdGltZSA+IDExLjUgPyAwIDogTWF0aC5yb3VuZCh0aW1lKTtcbiAgICAgICAgcmV0dXJuIHRpbWUudG9TdHJpbmcoKTtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgZHJhZ0VuZChlOk1vdXNlRXZlbnR8VG91Y2hFdmVudCkge1xuICAgICAgICB0aGlzLnBpY2tlci5jbGFzc0xpc3QucmVtb3ZlKCdkYXRpdW0tZHJhZ2dpbmcnKTtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBmcm9tQ2VudGVyKHBvaW50Ont4Om51bWJlciwgeTpudW1iZXJ9KTp7eDpudW1iZXIsIHk6bnVtYmVyfSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiB0aGlzLmdldENlbnRlcigpLnggLSBwb2ludC54LFxuICAgICAgICAgICAgeTogcG9pbnQueSAtIHRoaXMuZ2V0Q2VudGVyKCkueVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgZ2V0Q2VudGVyKCk6e3g6bnVtYmVyLCB5Om51bWJlcn0ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogdGhpcy5waWNrZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdCArIDE0MCxcbiAgICAgICAgICAgIHk6IHRoaXMucGlja2VyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCArIDEyMFxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgdXBkYXRlVGltZURyYWdBcm0oKSB7XG4gICAgICAgIHRoaXMudGltZURyYWdBcm0uc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZSgke3RoaXMucm90YXRpb259cmFkKWA7XG4gICAgICAgIHRoaXMuaG91ckhhbmQuc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZSgke3RoaXMucm90YXRpb259cmFkKWA7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgcm90YXRpb246bnVtYmVyID0gMDtcbiAgICBwcml2YXRlIHRpbWVEcmFnQXJtOkhUTUxFbGVtZW50O1xuICAgIHByaXZhdGUgdGltZURyYWc6SFRNTEVsZW1lbnQ7XG4gICAgcHJpdmF0ZSBob3VySGFuZDpIVE1MRWxlbWVudDtcbiAgICBcbiAgICBwdWJsaWMgY3JlYXRlKGRhdGU6RGF0ZSwgdHJhbnNpdGlvbjpUcmFuc2l0aW9uKSB7XG4gICAgICAgIHRoaXMubWluID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIGRhdGUuZ2V0RGF0ZSgpKTtcbiAgICAgICAgdGhpcy5tYXggPSBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSwgZGF0ZS5nZXREYXRlKCkgKyAxKTtcbiAgICAgICAgXG4gICAgICAgIGxldCBpdGVyYXRvciA9IG5ldyBEYXRlKHRoaXMubWluLnZhbHVlT2YoKSk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnBpY2tlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1waWNrZXInKTtcbiAgICAgICAgdGhpcy5waWNrZXIuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLXRpbWUtcGlja2VyJyk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnRyYW5zaXRpb25Jbih0cmFuc2l0aW9uLCB0aGlzLnBpY2tlcik7XG4gICAgICAgIFxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEyOyBpKyspIHtcbiAgICAgICAgICAgIGxldCB0aWNrID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpY2snKTtcbiAgICAgICAgICAgIGxldCB0aWNrTGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tdGljay1sYWJlbCcpO1xuICAgICAgICAgICAgdGlja0xhYmVsLmlubmVySFRNTCA9IChpID09PSAwID8gMTIgOiBpKS50b1N0cmluZygpO1xuICAgICAgICAgICAgdGljay5hcHBlbmRDaGlsZCh0aWNrTGFiZWwpO1xuICAgICAgICAgICAgdGljay5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlKCR7aSAqIDMwICsgMTgwfWRlZylgO1xuICAgICAgICAgICAgdGlja0xhYmVsLnN0eWxlLnRyYW5zZm9ybSA9IGByb3RhdGUoJHtpICogLTMwICsgMTgwfWRlZylgO1xuICAgICAgICAgICAgdGhpcy5waWNrZXIuYXBwZW5kQ2hpbGQodGljayk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRoaXMuaG91ckhhbmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0taG91ci1oYW5kJyk7XG4gICAgICAgIHRoaXMudGltZURyYWdBcm0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tdGltZS1kcmFnLWFybScpO1xuICAgICAgICB0aGlzLnRpbWVEcmFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpbWUtZHJhZycpO1xuICAgICAgICB0aGlzLnRpbWVEcmFnQXJtLmFwcGVuZENoaWxkKHRoaXMudGltZURyYWcpO1xuICAgICAgICB0aGlzLnBpY2tlci5hcHBlbmRDaGlsZCh0aGlzLnRpbWVEcmFnQXJtKTtcbiAgICAgICAgdGhpcy5waWNrZXIuYXBwZW5kQ2hpbGQodGhpcy5ob3VySGFuZCk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmF0dGFjaCgpO1xuICAgICAgICB0aGlzLnNldFNlbGVjdGVkRGF0ZSh0aGlzLnNlbGVjdGVkRGF0ZSk7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBzZXRTZWxlY3RlZERhdGUoZGF0ZTpEYXRlKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWREYXRlID0gbmV3IERhdGUoZGF0ZS52YWx1ZU9mKCkpO1xuICAgICAgICB0aGlzLnJvdGF0aW9uID0gZGF0ZS5nZXRIb3VycygpICogTWF0aC5QSSAvIDYgLSBNYXRoLlBJO1xuICAgICAgICBpZiAodGhpcy50aW1lRHJhZ0FybSAhPT0gdm9pZCAwICYmIHRoaXMuaG91ckhhbmQgIT09IHZvaWQgMCkge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVUaW1lRHJhZ0FybSgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBnZXRIZWlnaHQoKSB7XG4gICAgICAgIHJldHVybiAyNDA7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcbiAgICAgICAgcmV0dXJuIExldmVsLkhPVVI7XG4gICAgfVxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJwaWNrZXIudHNcIiAvPlxuXG5jbGFzcyBNaW51dGVQaWNrZXIgZXh0ZW5kcyBQaWNrZXIgaW1wbGVtZW50cyBJUGlja2VyIHtcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OkhUTUxFbGVtZW50LCBjb250YWluZXI6SFRNTEVsZW1lbnQpIHtcbiAgICAgICAgc3VwZXIoZWxlbWVudCwgY29udGFpbmVyKTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHVwZGF0ZU9wdGlvbnMob3B0aW9uczpJT3B0aW9ucykge1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgcHVibGljIGdldEhlaWdodCgpIHtcbiAgICAgICAgcmV0dXJuIDIzMDtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIGdldExldmVsKCkge1xuICAgICAgICByZXR1cm4gTGV2ZWwuTUlOVVRFO1xuICAgIH1cbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwicGlja2VyLnRzXCIgLz5cblxuY2xhc3MgTW9udGhQaWNrZXIgZXh0ZW5kcyBQaWNrZXIgaW1wbGVtZW50cyBJUGlja2VyIHtcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OkhUTUxFbGVtZW50LCBjb250YWluZXI6SFRNTEVsZW1lbnQpIHtcbiAgICAgICAgc3VwZXIoZWxlbWVudCwgY29udGFpbmVyKTtcbiAgICAgICAgXG4gICAgICAgIGxpc3Rlbi50YXAoY29udGFpbmVyLCAnZGF0aXVtLW1vbnRoLWVsZW1lbnRbZGF0aXVtLWRhdGFdJywgKGUpID0+IHtcbiAgICAgICAgICAgbGV0IGVsOkVsZW1lbnQgPSA8RWxlbWVudD5lLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XG4gICAgICAgICAgIGxldCB5ZWFyID0gbmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKS5nZXRGdWxsWWVhcigpO1xuICAgICAgICAgICBsZXQgbW9udGggPSBuZXcgRGF0ZShlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpLmdldE1vbnRoKCk7XG4gICAgICAgICAgIFxuICAgICAgICAgICBsZXQgZGF0ZSA9IG5ldyBEYXRlKHRoaXMuc2VsZWN0ZWREYXRlLnZhbHVlT2YoKSk7XG4gICAgICAgICAgIGRhdGUuc2V0RnVsbFllYXIoeWVhcik7XG4gICAgICAgICAgIGRhdGUuc2V0TW9udGgobW9udGgpO1xuICAgICAgICAgICBpZiAoZGF0ZS5nZXRNb250aCgpICE9PSBtb250aCkge1xuICAgICAgICAgICAgICAgZGF0ZS5zZXREYXRlKDApO1xuICAgICAgICAgICB9XG4gICAgICAgICAgIFxuICAgICAgICAgICB0cmlnZ2VyLmdvdG8oZWxlbWVudCwge1xuICAgICAgICAgICAgICAgZGF0ZTogZGF0ZSxcbiAgICAgICAgICAgICAgIGxldmVsOiBMZXZlbC5EQVRFXG4gICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGxpc3Rlbi5kb3duKGNvbnRhaW5lciwgJ2RhdGl1bS1tb250aC1lbGVtZW50JywgKGUpID0+IHtcbiAgICAgICAgICAgIGxldCBlbDpIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD4oZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50KTtcbiAgICAgICAgICAgIGxldCB0ZXh0ID0gdGhpcy5nZXRTaG9ydE1vbnRocygpW25ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSkuZ2V0TW9udGgoKV07XG4gICAgICAgICAgICBsZXQgb2Zmc2V0ID0gdGhpcy5nZXRPZmZzZXQoZWwpO1xuICAgICAgICAgICAgdHJpZ2dlci5vcGVuQnViYmxlKGVsZW1lbnQsIHtcbiAgICAgICAgICAgICAgICB4OiBvZmZzZXQueCArIDM1LFxuICAgICAgICAgICAgICAgIHk6IG9mZnNldC55ICsgMTUsXG4gICAgICAgICAgICAgICAgdGV4dDogdGV4dFxuICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBjcmVhdGUoZGF0ZTpEYXRlLCB0cmFuc2l0aW9uOlRyYW5zaXRpb24pIHtcbiAgICAgICAgdGhpcy5taW4gPSBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCksIDApO1xuICAgICAgICB0aGlzLm1heCA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSArIDEsIDApO1xuICAgICAgICBcbiAgICAgICAgbGV0IGl0ZXJhdG9yID0gbmV3IERhdGUodGhpcy5taW4udmFsdWVPZigpKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMucGlja2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXBpY2tlcicpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uSW4odHJhbnNpdGlvbiwgdGhpcy5waWNrZXIpO1xuICAgICAgICBcbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgbGV0IG1vbnRoRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1tb250aC1lbGVtZW50Jyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG1vbnRoRWxlbWVudC5pbm5lckhUTUwgPSB0aGlzLmdldFNob3J0TW9udGhzKClbaXRlcmF0b3IuZ2V0TW9udGgoKV07XG4gICAgICAgICAgICBtb250aEVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScsIGl0ZXJhdG9yLnRvSVNPU3RyaW5nKCkpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLnBpY2tlci5hcHBlbmRDaGlsZChtb250aEVsZW1lbnQpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpdGVyYXRvci5zZXRNb250aChpdGVyYXRvci5nZXRNb250aCgpICsgMSk7XG4gICAgICAgIH0gd2hpbGUgKGl0ZXJhdG9yLnZhbHVlT2YoKSA8IHRoaXMubWF4LnZhbHVlT2YoKSk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmF0dGFjaCgpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5zZXRTZWxlY3RlZERhdGUodGhpcy5zZWxlY3RlZERhdGUpO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgc2V0U2VsZWN0ZWREYXRlKHNlbGVjdGVkRGF0ZTpEYXRlKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWREYXRlID0gbmV3IERhdGUoc2VsZWN0ZWREYXRlLnZhbHVlT2YoKSk7XG4gICAgICAgIFxuICAgICAgICBsZXQgbW9udGhFbGVtZW50cyA9IHRoaXMucGlja2VyQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJ2RhdGl1bS1tb250aC1lbGVtZW50Jyk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbW9udGhFbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGV0IGVsID0gbW9udGhFbGVtZW50cy5pdGVtKGkpO1xuICAgICAgICAgICAgbGV0IGRhdGUgPSBuZXcgRGF0ZShlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpO1xuICAgICAgICAgICAgaWYgKGRhdGUuZ2V0RnVsbFllYXIoKSA9PT0gc2VsZWN0ZWREYXRlLmdldEZ1bGxZZWFyKCkgJiZcbiAgICAgICAgICAgICAgICBkYXRlLmdldE1vbnRoKCkgPT09IHNlbGVjdGVkRGF0ZS5nZXRNb250aCgpKSB7XG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLXNlbGVjdGVkJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1zZWxlY3RlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBnZXRIZWlnaHQoKSB7XG4gICAgICAgIHJldHVybiAxODA7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcbiAgICAgICAgcmV0dXJuIExldmVsLk1PTlRIO1xuICAgIH1cbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwicGlja2VyLnRzXCIgLz5cblxuY2xhc3MgU2Vjb25kUGlja2VyIGV4dGVuZHMgUGlja2VyIGltcGxlbWVudHMgSVBpY2tlciB7XG4gICAgY29uc3RydWN0b3IoZWxlbWVudDpIVE1MRWxlbWVudCwgY29udGFpbmVyOkhUTUxFbGVtZW50KSB7XG4gICAgICAgIHN1cGVyKGVsZW1lbnQsIGNvbnRhaW5lcik7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyB1cGRhdGVPcHRpb25zKG9wdGlvbnM6SU9wdGlvbnMpIHtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBnZXRIZWlnaHQoKSB7XG4gICAgICAgIHJldHVybiAxODA7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcbiAgICAgICAgcmV0dXJuIExldmVsLlNFQ09ORDtcbiAgICB9XG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInBpY2tlci50c1wiIC8+XG5cbmNsYXNzIFllYXJQaWNrZXIgZXh0ZW5kcyBQaWNrZXIgaW1wbGVtZW50cyBJUGlja2VyIHtcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OkhUTUxFbGVtZW50LCBjb250YWluZXI6SFRNTEVsZW1lbnQpIHtcbiAgICAgICAgc3VwZXIoZWxlbWVudCwgY29udGFpbmVyKTtcbiAgICAgICAgXG4gICAgICAgIGxpc3Rlbi50YXAoY29udGFpbmVyLCAnZGF0aXVtLXllYXItZWxlbWVudFtkYXRpdW0tZGF0YV0nLCAoZSkgPT4ge1xuICAgICAgICAgICBsZXQgZWw6RWxlbWVudCA9IDxFbGVtZW50PmUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcbiAgICAgICAgICAgbGV0IHllYXIgPSBuZXcgRGF0ZShlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpLmdldEZ1bGxZZWFyKCk7XG4gICAgICAgICAgIFxuICAgICAgICAgICBsZXQgZGF0ZSA9IG5ldyBEYXRlKHRoaXMuc2VsZWN0ZWREYXRlLnZhbHVlT2YoKSk7XG4gICAgICAgICAgIGRhdGUuc2V0RnVsbFllYXIoeWVhcik7XG4gICAgICAgICAgIFxuICAgICAgICAgICB0cmlnZ2VyLmdvdG8oZWxlbWVudCwge1xuICAgICAgICAgICAgICAgZGF0ZTogZGF0ZSxcbiAgICAgICAgICAgICAgIGxldmVsOiBMZXZlbC5NT05USFxuICAgICAgICAgICB9KVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGxpc3Rlbi5kb3duKGNvbnRhaW5lciwgJ2RhdGl1bS15ZWFyLWVsZW1lbnQnLCAoZSkgPT4ge1xuICAgICAgICAgICAgbGV0IGVsOkhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PihlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQpO1xuICAgICAgICAgICAgbGV0IHRleHQgPSBuZXcgRGF0ZShlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpLmdldEZ1bGxZZWFyKCkudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIGxldCBvZmZzZXQgPSB0aGlzLmdldE9mZnNldChlbCk7XG4gICAgICAgICAgICB0cmlnZ2VyLm9wZW5CdWJibGUoZWxlbWVudCwge1xuICAgICAgICAgICAgICAgIHg6IG9mZnNldC54ICsgMzUsXG4gICAgICAgICAgICAgICAgeTogb2Zmc2V0LnkgKyAxNSxcbiAgICAgICAgICAgICAgICB0ZXh0OiB0ZXh0XG4gICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIGNyZWF0ZShkYXRlOkRhdGUsIHRyYW5zaXRpb246VHJhbnNpdGlvbikge1xuICAgICAgICB0aGlzLm1pbiA9IG5ldyBEYXRlKE1hdGguZmxvb3IoZGF0ZS5nZXRGdWxsWWVhcigpLzEwKSoxMCwgMCk7XG4gICAgICAgIHRoaXMubWF4ID0gbmV3IERhdGUoTWF0aC5jZWlsKGRhdGUuZ2V0RnVsbFllYXIoKS8xMCkqMTAsIDApO1xuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXMubWluLnZhbHVlT2YoKSA9PT0gdGhpcy5tYXgudmFsdWVPZigpKSB7XG4gICAgICAgICAgICB0aGlzLm1heC5zZXRGdWxsWWVhcih0aGlzLm1heC5nZXRGdWxsWWVhcigpICsgMTApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBsZXQgaXRlcmF0b3IgPSBuZXcgRGF0ZSh0aGlzLm1pbi52YWx1ZU9mKCkpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5waWNrZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tcGlja2VyJyk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnRyYW5zaXRpb25Jbih0cmFuc2l0aW9uLCB0aGlzLnBpY2tlcik7XG4gICAgICAgIFxuICAgICAgICBkbyB7XG4gICAgICAgICAgICBsZXQgeWVhckVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0teWVhci1lbGVtZW50Jyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHllYXJFbGVtZW50LmlubmVySFRNTCA9IGl0ZXJhdG9yLmdldEZ1bGxZZWFyKCkudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIHllYXJFbGVtZW50LnNldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnLCBpdGVyYXRvci50b0lTT1N0cmluZygpKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5waWNrZXIuYXBwZW5kQ2hpbGQoeWVhckVsZW1lbnQpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpdGVyYXRvci5zZXRGdWxsWWVhcihpdGVyYXRvci5nZXRGdWxsWWVhcigpICsgMSk7XG4gICAgICAgIH0gd2hpbGUgKGl0ZXJhdG9yLnZhbHVlT2YoKSA8PSB0aGlzLm1heC52YWx1ZU9mKCkpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5hdHRhY2goKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuc2V0U2VsZWN0ZWREYXRlKHRoaXMuc2VsZWN0ZWREYXRlKTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHNldFNlbGVjdGVkRGF0ZShzZWxlY3RlZERhdGU6RGF0ZSkge1xuICAgICAgICB0aGlzLnNlbGVjdGVkRGF0ZSA9IG5ldyBEYXRlKHNlbGVjdGVkRGF0ZS52YWx1ZU9mKCkpO1xuICAgICAgICBcbiAgICAgICAgbGV0IHllYXJFbGVtZW50cyA9IHRoaXMucGlja2VyQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJ2RhdGl1bS15ZWFyLWVsZW1lbnQnKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB5ZWFyRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBlbCA9IHllYXJFbGVtZW50cy5pdGVtKGkpO1xuICAgICAgICAgICAgbGV0IGRhdGUgPSBuZXcgRGF0ZShlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpO1xuICAgICAgICAgICAgaWYgKGRhdGUuZ2V0RnVsbFllYXIoKSA9PT0gc2VsZWN0ZWREYXRlLmdldEZ1bGxZZWFyKCkpIHtcbiAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZGF0aXVtLXNlbGVjdGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcHVibGljIGdldEhlaWdodCgpIHtcbiAgICAgICAgcmV0dXJuIDE4MDtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIGdldExldmVsKCkge1xuICAgICAgICByZXR1cm4gTGV2ZWwuWUVBUjtcbiAgICB9XG59IiwidmFyIGNzcz1cImRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1idWJibGUsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWhlYWRlcixkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLWNvbnRhaW5lcntib3gtc2hhZG93OjAgM3B4IDZweCByZ2JhKDAsMCwwLC4xNiksMCAzcHggNnB4IHJnYmEoMCwwLDAsLjIzKX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0taGVhZGVyLXdyYXBwZXJ7b3ZlcmZsb3c6aGlkZGVuO3Bvc2l0aW9uOmFic29sdXRlO2xlZnQ6LTdweDtyaWdodDotN3B4O3RvcDotN3B4O2hlaWdodDo4N3B4O2Rpc3BsYXk6YmxvY2s7cG9pbnRlci1ldmVudHM6bm9uZX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0taGVhZGVye3Bvc2l0aW9uOnJlbGF0aXZlO2Rpc3BsYXk6YmxvY2s7b3ZlcmZsb3c6aGlkZGVuO2hlaWdodDoxMDBweDtiYWNrZ3JvdW5kLWNvbG9yOl9wcmltYXJ5O2JvcmRlci10b3AtbGVmdC1yYWRpdXM6M3B4O2JvcmRlci10b3AtcmlnaHQtcmFkaXVzOjNweDt6LWluZGV4OjE7bWFyZ2luOjdweDt3aWR0aDpjYWxjKDEwMCUgLSAxNHB4KTtwb2ludGVyLWV2ZW50czphdXRvfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1zcGFuLWxhYmVsLWNvbnRhaW5lcntwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjQwcHg7cmlnaHQ6NDBweDt0b3A6MDtib3R0b206MDtkaXNwbGF5OmJsb2NrO292ZXJmbG93OmhpZGRlbjt0cmFuc2l0aW9uOi4ycyBlYXNlIGFsbDt0cmFuc2Zvcm0tb3JpZ2luOjQwcHggNDBweH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc3Bhbi1sYWJlbHtwb3NpdGlvbjphYnNvbHV0ZTtmb250LXNpemU6MThwdDtjb2xvcjpfcHJpbWFyeV90ZXh0O2ZvbnQtd2VpZ2h0OjcwMDt0cmFuc2Zvcm0tb3JpZ2luOjAgMDt3aGl0ZS1zcGFjZTpub3dyYXA7dHJhbnNpdGlvbjphbGwgLjJzIGVhc2U7dGV4dC10cmFuc2Zvcm06dXBwZXJjYXNlfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS10b3B7dHJhbnNmb3JtOnRyYW5zbGF0ZVkoMTdweCkgc2NhbGUoLjY2KTt3aWR0aDoxNTElO29wYWNpdHk6LjZ9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXNwYW4tbGFiZWwuZGF0aXVtLWJvdHRvbXt0cmFuc2Zvcm06dHJhbnNsYXRlWSgzNnB4KSBzY2FsZSgxKTt3aWR0aDoxMDAlO29wYWNpdHk6MX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc3Bhbi1sYWJlbC5kYXRpdW0tdG9wLmRhdGl1bS1oaWRkZW57dHJhbnNmb3JtOnRyYW5zbGF0ZVkoNXB4KSBzY2FsZSguNCk7b3BhY2l0eTowfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS1ib3R0b20uZGF0aXVtLWhpZGRlbnt0cmFuc2Zvcm06dHJhbnNsYXRlWSg3OHB4KSBzY2FsZSgxLjIpO29wYWNpdHk6MX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc3Bhbi1sYWJlbDphZnRlcntjb250ZW50OicnO2Rpc3BsYXk6aW5saW5lLWJsb2NrO3Bvc2l0aW9uOmFic29sdXRlO21hcmdpbi1sZWZ0OjEwcHg7bWFyZ2luLXRvcDo2cHg7aGVpZ2h0OjE3cHg7d2lkdGg6MTdweDtvcGFjaXR5OjA7dHJhbnNpdGlvbjphbGwgLjJzIGVhc2U7YmFja2dyb3VuZDp1cmwoZGF0YTppbWFnZS9zdmcreG1sO3V0ZjgsJTNDc3ZnJTIweG1sbnMlM0QlMjJodHRwJTNBJTJGJTJGd3d3LnczLm9yZyUyRjIwMDAlMkZzdmclMjIlM0UlM0NnJTIwZmlsbCUzRCUyMl9wcmltYXJ5X3RleHQlMjIlM0UlM0NwYXRoJTIwZCUzRCUyMk0xNyUyMDE1bC0yJTIwMi01LTUlMjAyLTJ6JTIyJTIwZmlsbC1ydWxlJTNEJTIyZXZlbm9kZCUyMiUyRiUzRSUzQ3BhdGglMjBkJTNEJTIyTTclMjAwYTclMjA3JTIwMCUyMDAlMjAwLTclMjA3JTIwNyUyMDclMjAwJTIwMCUyMDAlMjA3JTIwNyUyMDclMjA3JTIwMCUyMDAlMjAwJTIwNy03JTIwNyUyMDclMjAwJTIwMCUyMDAtNy03em0wJTIwMmE1JTIwNSUyMDAlMjAwJTIwMSUyMDUlMjA1JTIwNSUyMDUlMjAwJTIwMCUyMDEtNSUyMDUlMjA1JTIwNSUyMDAlMjAwJTIwMS01LTUlMjA1JTIwNSUyMDAlMjAwJTIwMSUyMDUtNXolMjIlMkYlM0UlM0NwYXRoJTIwZCUzRCUyMk00JTIwNmg2djJINHolMjIlMkYlM0UlM0MlMkZnJTNFJTNDJTJGc3ZnJTNFKX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tYnViYmxlLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1idWJibGUuZGF0aXVtLWJ1YmJsZS12aXNpYmxle3RyYW5zaXRpb24tcHJvcGVydHk6dHJhbnNmb3JtLG9wYWNpdHk7dHJhbnNpdGlvbi10aW1pbmctZnVuY3Rpb246ZWFzZTt0cmFuc2l0aW9uLWR1cmF0aW9uOi4yc31kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc3Bhbi1sYWJlbC5kYXRpdW0tdG9wOmFmdGVye29wYWNpdHk6MX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc3Bhbi1sYWJlbCBkYXRpdW0tdmFyaWFibGV7Y29sb3I6X3ByaW1hcnk7Zm9udC1zaXplOjE0cHQ7cGFkZGluZzowIDRweDttYXJnaW46MCAycHg7dG9wOi0ycHg7cG9zaXRpb246cmVsYXRpdmV9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXNwYW4tbGFiZWwgZGF0aXVtLXZhcmlhYmxlOmJlZm9yZXtjb250ZW50OicnO3Bvc2l0aW9uOmFic29sdXRlO2xlZnQ6MDt0b3A6MDtyaWdodDowO2JvdHRvbTowO2JvcmRlci1yYWRpdXM6NXB4O2JhY2tncm91bmQtY29sb3I6X3ByaW1hcnlfdGV4dDt6LWluZGV4Oi0xO29wYWNpdHk6Ljd9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW5leHQsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXByZXZ7cG9zaXRpb246YWJzb2x1dGU7d2lkdGg6NDBweDt0b3A6MDtib3R0b206MDt0cmFuc2Zvcm0tb3JpZ2luOjIwcHggNTJweH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbmV4dDphZnRlcixkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbmV4dDpiZWZvcmUsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXByZXY6YWZ0ZXIsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXByZXY6YmVmb3Jle2NvbnRlbnQ6Jyc7cG9zaXRpb246YWJzb2x1dGU7ZGlzcGxheTpibG9jazt3aWR0aDozcHg7aGVpZ2h0OjhweDtsZWZ0OjUwJTtiYWNrZ3JvdW5kLWNvbG9yOl9wcmltYXJ5X3RleHQ7dG9wOjQ4cHh9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW5leHQuZGF0aXVtLWFjdGl2ZSxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcHJldi5kYXRpdW0tYWN0aXZle3RyYW5zZm9ybTpzY2FsZSguOSk7b3BhY2l0eTouOX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcHJldntsZWZ0OjB9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXByZXY6YWZ0ZXIsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXByZXY6YmVmb3Jle21hcmdpbi1sZWZ0Oi0zcHh9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW5leHR7cmlnaHQ6MH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcHJldjpiZWZvcmV7dHJhbnNmb3JtOnJvdGF0ZSg0NWRlZykgdHJhbnNsYXRlWSgtMi42cHgpfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1wcmV2OmFmdGVye3RyYW5zZm9ybTpyb3RhdGUoLTQ1ZGVnKSB0cmFuc2xhdGVZKDIuNnB4KX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbmV4dDpiZWZvcmV7dHJhbnNmb3JtOnJvdGF0ZSg0NWRlZykgdHJhbnNsYXRlWSgyLjZweCl9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW5leHQ6YWZ0ZXJ7dHJhbnNmb3JtOnJvdGF0ZSgtNDVkZWcpIHRyYW5zbGF0ZVkoLTIuNnB4KX1kYXRpdW0tY29udGFpbmVyLl9pZHtkaXNwbGF5OmJsb2NrO3Bvc2l0aW9uOmFic29sdXRlO3dpZHRoOjI4MHB4O2ZvbnQtZmFtaWx5OlJvYm90byxBcmlhbDttYXJnaW4tdG9wOjJweDtmb250LXNpemU6MTZweH1kYXRpdW0tY29udGFpbmVyLl9pZCxkYXRpdW0tY29udGFpbmVyLl9pZCAqey13ZWJraXQtdG91Y2gtY2FsbG91dDpub25lOy13ZWJraXQtdXNlci1zZWxlY3Q6bm9uZTsta2h0bWwtdXNlci1zZWxlY3Q6bm9uZTstbW96LXVzZXItc2VsZWN0Om5vbmU7LW1zLXVzZXItc2VsZWN0Om5vbmU7LXdlYmtpdC10YXAtaGlnaGxpZ2h0LWNvbG9yOnRyYW5zcGFyZW50O2N1cnNvcjpkZWZhdWx0fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1idWJibGV7cG9zaXRpb246YWJzb2x1dGU7d2lkdGg6NTBweDtsaW5lLWhlaWdodDoyNnB4O3RleHQtYWxpZ246Y2VudGVyO2ZvbnQtc2l6ZToxNHB4O2JhY2tncm91bmQtY29sb3I6X3NlY29uZGFyeV9hY2NlbnQ7Zm9udC13ZWlnaHQ6NzAwO2JvcmRlci1yYWRpdXM6M3B4O21hcmdpbi1sZWZ0Oi0yNXB4O21hcmdpbi10b3A6LTMycHg7Y29sb3I6X3NlY29uZGFyeTt6LWluZGV4OjE7dHJhbnNmb3JtLW9yaWdpbjozMHB4IDM2cHg7dHJhbnNpdGlvbi1kZWxheTowO3RyYW5zZm9ybTpzY2FsZSguNSk7b3BhY2l0eTowfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1idWJibGU6YWZ0ZXJ7Y29udGVudDonJztwb3NpdGlvbjphYnNvbHV0ZTtkaXNwbGF5OmJsb2NrO3dpZHRoOjEwcHg7aGVpZ2h0OjEwcHg7dHJhbnNmb3JtOnJvdGF0ZSg0NWRlZyk7YmFja2dyb3VuZC1jb2xvcjpfc2Vjb25kYXJ5X2FjY2VudDtsZWZ0OjUwJTt0b3A6MjBweDttYXJnaW4tbGVmdDotNXB4fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1idWJibGUuZGF0aXVtLWJ1YmJsZS12aXNpYmxle3RyYW5zZm9ybTpzY2FsZSgxKTtvcGFjaXR5OjE7dHJhbnNpdGlvbi1kZWxheTouMnN9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci1jb250YWluZXItd3JhcHBlcntvdmVyZmxvdzpoaWRkZW47cG9zaXRpb246YWJzb2x1dGU7bGVmdDotN3B4O3JpZ2h0Oi03cHg7dG9wOjgwcHg7aGVpZ2h0OjI3MHB4O2Rpc3BsYXk6YmxvY2s7cG9pbnRlci1ldmVudHM6bm9uZX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLWNvbnRhaW5lcntwb3NpdGlvbjpyZWxhdGl2ZTt3aWR0aDpjYWxjKDEwMCUgLSAxNHB4KTtoZWlnaHQ6MjYwcHg7YmFja2dyb3VuZC1jb2xvcjpfc2Vjb25kYXJ5O2Rpc3BsYXk6YmxvY2s7bWFyZ2luOjAgN3B4IDdweDtwYWRkaW5nLXRvcDoyMHB4O3RyYW5zZm9ybTp0cmFuc2xhdGVZKC0yNzBweCk7cG9pbnRlci1ldmVudHM6YXV0bztib3JkZXItYm90dG9tLXJpZ2h0LXJhZGl1czozcHg7Ym9yZGVyLWJvdHRvbS1sZWZ0LXJhZGl1czozcHg7dHJhbnNpdGlvbjphbGwgZWFzZSAuNHM7dHJhbnNpdGlvbi1kZWxheTouMXM7b3ZlcmZsb3c6aGlkZGVufWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXJ7cG9zaXRpb246YWJzb2x1dGU7bGVmdDowO3JpZ2h0OjA7Ym90dG9tOjA7Y29sb3I6X3NlY29uZGFyeV90ZXh0O3RyYW5zaXRpb246YWxsIGVhc2UgLjRzfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLXBpY2tlci1sZWZ0e3RyYW5zZm9ybTp0cmFuc2xhdGVYKC0xMDAlKSBzY2FsZSgxKTtwb2ludGVyLWV2ZW50czpub25lO3RyYW5zaXRpb24tZGVsYXk6MHN9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tcGlja2VyLXJpZ2h0e3RyYW5zZm9ybTp0cmFuc2xhdGVYKDEwMCUpIHNjYWxlKDEpO3BvaW50ZXItZXZlbnRzOm5vbmU7dHJhbnNpdGlvbi1kZWxheTowc31kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1waWNrZXItb3V0e3RyYW5zZm9ybTp0cmFuc2xhdGVYKDApIHNjYWxlKDEuNCk7b3BhY2l0eTowO3BvaW50ZXItZXZlbnRzOm5vbmU7dHJhbnNpdGlvbi1kZWxheTowc31kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1waWNrZXItaW57dHJhbnNmb3JtOnRyYW5zbGF0ZVgoMCkgc2NhbGUoLjYpO29wYWNpdHk6MDtwb2ludGVyLWV2ZW50czpub25lO3RyYW5zaXRpb24tZGVsYXk6MHN9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1vbnRoLWVsZW1lbnQsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXllYXItZWxlbWVudHtkaXNwbGF5OmlubGluZS1ibG9jazt3aWR0aDoyNSU7bGluZS1oZWlnaHQ6NjBweDt0ZXh0LWFsaWduOmNlbnRlcjtwb3NpdGlvbjpyZWxhdGl2ZTt0cmFuc2l0aW9uOi4ycyBlYXNlIGFsbH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbW9udGgtZWxlbWVudC5kYXRpdW0tc2VsZWN0ZWQ6YWZ0ZXIsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXllYXItZWxlbWVudC5kYXRpdW0tc2VsZWN0ZWQ6YWZ0ZXJ7Y29udGVudDonJztwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjIwcHg7cmlnaHQ6MjBweDt0b3A6NTAlO21hcmdpbi10b3A6MTFweDtoZWlnaHQ6MnB4O2Rpc3BsYXk6YmxvY2s7YmFja2dyb3VuZC1jb2xvcjpfcHJpbWFyeX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbW9udGgtZWxlbWVudC5kYXRpdW0tYWN0aXZlLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS15ZWFyLWVsZW1lbnQuZGF0aXVtLWFjdGl2ZXt0cmFuc2Zvcm06c2NhbGUoLjkpO3RyYW5zaXRpb246bm9uZX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbW9udGgtZWxlbWVudC5kYXRpdW0tc2VsZWN0ZWQ6YWZ0ZXJ7bGVmdDoyNXB4O3JpZ2h0OjI1cHh9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWRhdGUtaGVhZGVye2Rpc3BsYXk6aW5saW5lLWJsb2NrO3dpZHRoOjQwcHg7bGluZS1oZWlnaHQ6MjhweDtvcGFjaXR5Oi42O2ZvbnQtd2VpZ2h0OjcwMDt0ZXh0LWFsaWduOmNlbnRlcn1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tZGF0ZS1lbGVtZW50e2Rpc3BsYXk6aW5saW5lLWJsb2NrO3dpZHRoOjQwcHg7bGluZS1oZWlnaHQ6MzZweDt0ZXh0LWFsaWduOmNlbnRlcjtwb3NpdGlvbjpyZWxhdGl2ZTt0cmFuc2l0aW9uOi4ycyBlYXNlIGFsbH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tZGF0ZS1lbGVtZW50LmRhdGl1bS1zZWxlY3RlZDphZnRlcntjb250ZW50OicnO3Bvc2l0aW9uOmFic29sdXRlO2xlZnQ6MTJweDtyaWdodDoxMnB4O3RvcDo1MCU7bWFyZ2luLXRvcDoxMHB4O2hlaWdodDoycHg7ZGlzcGxheTpibG9jaztiYWNrZ3JvdW5kLWNvbG9yOl9wcmltYXJ5fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1kYXRlLWVsZW1lbnQuZGF0aXVtLWFjdGl2ZXt0cmFuc2Zvcm06c2NhbGUoLjkpO3RyYW5zaXRpb246bm9uZX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tZGF0ZS1lbGVtZW50Om5vdChbZGF0aXVtLWRhdGFdKXtvcGFjaXR5Oi42O3BvaW50ZXItZXZlbnRzOm5vbmV9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tdGltZS1waWNrZXJ7aGVpZ2h0OjI0MHB4fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLXRpbWUtcGlja2VyOmJlZm9yZXtjb250ZW50OicnO3dpZHRoOjE0MHB4O2hlaWdodDoxNDBweDtwb3NpdGlvbjphYnNvbHV0ZTtib3JkZXI6MXB4IHNvbGlkO2xlZnQ6NTAlO3RvcDo1MCU7bWFyZ2luLWxlZnQ6LTcxcHg7bWFyZ2luLXRvcDotNzFweDtib3JkZXItcmFkaXVzOjcwcHg7b3BhY2l0eTouNX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS10aW1lLXBpY2tlcjphZnRlcntjb250ZW50OicnO3dpZHRoOjRweDtoZWlnaHQ6NHB4O21hcmdpbi1sZWZ0Oi00cHg7bWFyZ2luLXRvcDotNHB4O3RvcDo1MCU7bGVmdDo1MCU7Ym9yZGVyLXJhZGl1czo0cHg7cG9zaXRpb246YWJzb2x1dGU7Ym9yZGVyOjJweCBzb2xpZDtib3JkZXItY29sb3I6X3NlY29uZGFyeV9hY2NlbnQ7YmFja2dyb3VuZC1jb2xvcjpfc2Vjb25kYXJ5O2JveC1zaGFkb3c6MCAwIDAgMnB4IF9zZWNvbmRhcnl9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXRpY2t7cG9zaXRpb246YWJzb2x1dGU7bGVmdDo1MCU7dG9wOjUwJTt3aWR0aDoycHg7aGVpZ2h0OjcwcHg7bWFyZ2luLWxlZnQ6LTFweDt0cmFuc2Zvcm0tb3JpZ2luOjFweCAwfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS10aWNrOmFmdGVye2NvbnRlbnQ6Jyc7cG9zaXRpb246YWJzb2x1dGU7d2lkdGg6MnB4O2hlaWdodDo2cHg7YmFja2dyb3VuZC1jb2xvcjpfc2Vjb25kYXJ5X3RleHQ7Ym90dG9tOi00cHg7b3BhY2l0eTouNX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tdGljay1sYWJlbHtwb3NpdGlvbjphYnNvbHV0ZTtib3R0b206LTUwcHg7bGVmdDotMjRweDtkaXNwbGF5OmJsb2NrO2xpbmUtaGVpZ2h0OjUwcHg7d2lkdGg6NTBweDtib3JkZXItcmFkaXVzOjI1cHg7dGV4dC1hbGlnbjpjZW50ZXI7Zm9udC1zaXplOjE0cHh9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tdGltZS1waWNrZXIuZGF0aXVtLWRyYWdnaW5nIGRhdGl1bS1ob3VyLWhhbmQsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tdGltZS1waWNrZXIuZGF0aXVtLWRyYWdnaW5nIGRhdGl1bS10aW1lLWRyYWctYXJte3RyYW5zaXRpb246bm9uZX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0taG91ci1oYW5ke3Bvc2l0aW9uOmFic29sdXRlO2Rpc3BsYXk6YmxvY2s7d2lkdGg6MDtoZWlnaHQ6MDtsZWZ0OjUwJTt0b3A6NTAlO3RyYW5zZm9ybS1vcmlnaW46M3B4IDNweDttYXJnaW4tbGVmdDotM3B4O21hcmdpbi10b3A6LTNweDtib3JkZXItdG9wOjMwcHggc29saWQgX3NlY29uZGFyeV9hY2NlbnQ7Ym9yZGVyLWxlZnQ6M3B4IHNvbGlkIHRyYW5zcGFyZW50O2JvcmRlci1yaWdodDozcHggc29saWQgdHJhbnNwYXJlbnQ7Ym9yZGVyLXRvcC1sZWZ0LXJhZGl1czozcHg7Ym9yZGVyLXRvcC1yaWdodC1yYWRpdXM6M3B4O3RyYW5zaXRpb246LjJzIGVhc2UgYWxsfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS10aW1lLWRyYWctYXJte3dpZHRoOjJweDtoZWlnaHQ6NzBweDtwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjUwJTt0b3A6NTAlO21hcmdpbi1sZWZ0Oi0xcHg7dHJhbnNmb3JtLW9yaWdpbjoxcHggMDt0cmFuc2Zvcm06cm90YXRlKDQ1ZGVnKTt0cmFuc2l0aW9uOi4ycyBlYXNlIGFsbH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tdGltZS1kcmFnLWFybTphZnRlcixkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tdGltZS1kcmFnLWFybTpiZWZvcmV7Y29udGVudDonJztib3JkZXI6NHB4IHNvbGlkIHRyYW5zcGFyZW50O3Bvc2l0aW9uOmFic29sdXRlO2JvdHRvbTotNHB4O2xlZnQ6MTJweDtib3JkZXItbGVmdC1jb2xvcjpfc2Vjb25kYXJ5X2FjY2VudDt0cmFuc2Zvcm0tb3JpZ2luOi0xMXB4IDRweH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tdGltZS1kcmFnLWFybTphZnRlcnt0cmFuc2Zvcm06cm90YXRlKDE4MGRlZyl9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXRpbWUtZHJhZ3tkaXNwbGF5OmJsb2NrO3Bvc2l0aW9uOmFic29sdXRlO3dpZHRoOjUwcHg7aGVpZ2h0OjUwcHg7dG9wOjEwMCU7bWFyZ2luLXRvcDotMjVweDttYXJnaW4tbGVmdDotMjRweDtib3JkZXItcmFkaXVzOjI1cHh9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXRpbWUtZHJhZzphZnRlcntjb250ZW50OicnO3dpZHRoOjEwcHg7aGVpZ2h0OjEwcHg7cG9zaXRpb246YWJzb2x1dGU7bGVmdDo1MCU7dG9wOjUwJTttYXJnaW4tbGVmdDotN3B4O21hcmdpbi10b3A6LTdweDtiYWNrZ3JvdW5kLWNvbG9yOl9zZWNvbmRhcnlfYWNjZW50O2JvcmRlcjoycHggc29saWQ7Ym9yZGVyLWNvbG9yOl9zZWNvbmRhcnk7Ym94LXNoYWRvdzowIDAgMCAycHggX3NlY29uZGFyeV9hY2NlbnQ7Ym9yZGVyLXJhZGl1czoxMHB4fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS10aW1lLWRyYWcuZGF0aXVtLWFjdGl2ZTphZnRlcnt3aWR0aDo4cHg7aGVpZ2h0OjhweDtib3JkZXI6M3B4IHNvbGlkO2JvcmRlci1jb2xvcjpfc2Vjb25kYXJ5fVwiOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
