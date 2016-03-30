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
        listen.zoomOut(element, function (e) { return _this.zoomOut(e.date, e.currentLevel, e.update); });
        listen.zoomIn(element, function (e) { return _this.zoomIn(e.date, e.currentLevel, e.update); });
        this.goto(this.options['defaultDate'], 6 /* NONE */, true);
    }
    DatiumInternals.prototype.zoomOut = function (date, currentLevel, update) {
        if (update === void 0) { update = true; }
        var newLevel = this.levels[this.levels.indexOf(currentLevel) - 1];
        if (newLevel === void 0)
            return;
        trigger.goto(this.element, {
            date: date,
            level: newLevel,
            update: update
        });
    };
    DatiumInternals.prototype.zoomIn = function (date, currentLevel, update) {
        if (update === void 0) { update = true; }
        var newLevel = this.levels[this.levels.indexOf(currentLevel) + 1];
        if (newLevel === void 0)
            newLevel = currentLevel;
        trigger.goto(this.element, {
            date: date,
            level: newLevel,
            update: update
        });
    };
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
        this.date = date;
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
        this.levels = this.input.getLevels().slice();
        this.levels.sort();
        if (this.pickerManager.currentPicker !== void 0) {
            var curLevel = this.pickerManager.currentPicker.getLevel();
            if (this.levels.indexOf(curLevel) == -1) {
                trigger.goto(this.element, {
                    date: this.date,
                    level: this.levels[0]
                });
            }
        }
        this.pickerManager.updateOptions(this.options);
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
    function zoomOut(element, callback) {
        return attachEvents(['datium-zoom-out'], element, function (e) {
            callback(e.detail);
        });
    }
    listen.zoomOut = zoomOut;
    function zoomIn(element, callback) {
        return attachEvents(['datium-zoom-in'], element, function (e) {
            callback(e.detail);
        });
    }
    listen.zoomIn = zoomIn;
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
    function zoomOut(element, data) {
        element.dispatchEvent(new CustomEvent('datium-zoom-out', {
            bubbles: false,
            cancelable: true,
            detail: data
        }));
    }
    trigger.zoomOut = zoomOut;
    function zoomIn(element, data) {
        element.dispatchEvent(new CustomEvent('datium-zoom-in', {
            bubbles: false,
            cancelable: true,
            detail: data
        }));
    }
    trigger.zoomIn = zoomIn;
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
            // Day Light Savings Adjustment
            if (this.date.getHours() !== num) {
                this.date.setHours(num - 1);
            }
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
        trigger.zoomOut(this.element, {
            date: this.date,
            currentLevel: this.level,
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
                    return this.getShortDays()[date.getDay()] + " " + this.pad(date.getDate()) + " <datium-variable>" + this.pad(date.getHours()) + "<datium-lower>hr</datium-lower></datium-variable>";
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
    Header.prototype.updateOptions = function (options) {
        var updateView = this.options !== void 0 && this.options.militaryTime !== options.militaryTime;
        this.options = options;
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
        listen.down(this.container, '*', function (e) { return _this.addActiveClasses(e); });
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
        listen.swipeLeft(this.container, function () {
            if (_this.secondPicker.isDragging() ||
                _this.minutePicker.isDragging() ||
                _this.hourPicker.isDragging())
                return;
            _this.header.next();
        });
        listen.swipeRight(this.container, function () {
            if (_this.secondPicker.isDragging() ||
                _this.minutePicker.isDragging() ||
                _this.hourPicker.isDragging())
                return;
            _this.header.previous();
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
        if (this.bubble !== void 0) {
            this.closeBubble();
        }
        this.bubble = document.createElement('datium-bubble');
        this.container.appendChild(this.bubble);
        this.updateBubble(x, y, text);
        setTimeout(function (bubble) {
            bubble.classList.add('datium-bubble-visible');
        }, 0, this.bubble);
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
    PickerManager.prototype.addActiveClasses = function (e) {
        var el = e.srcElement || e.target;
        while (el !== this.container) {
            el.classList.add('datium-active');
            el = el.parentElement;
        }
        this.container.classList.add('datium-active');
    };
    PickerManager.prototype.updateOptions = function (options) {
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
        this.header.updateOptions(options);
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
        clearTimeout(this.transitionInTimeout);
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
        this.options = options;
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
        clearTimeout(this.transitionInTimeout);
        this.transitionInTimeout = setTimeout(function (p) {
            p.classList.remove(cls);
        }, 100, picker);
    };
    return Picker;
}(Common));
/// <reference path="Picker.ts" />
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
            trigger.zoomIn(element, {
                date: date,
                currentLevel: 2 /* DATE */
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
/// <reference path="Picker.ts" />
var TimePicker = (function (_super) {
    __extends(TimePicker, _super);
    function TimePicker() {
        _super.apply(this, arguments);
        this.dragging = false;
        this.rotation = 0;
    }
    TimePicker.prototype.isDragging = function () {
        return this.dragging;
    };
    TimePicker.prototype.dragStart = function (e) {
        trigger.openBubble(this.element, {
            x: -70 * Math.sin(this.rotation) + 140,
            y: 70 * Math.cos(this.rotation) + 175,
            text: this.getBubbleText()
        });
        this.picker.classList.add('datium-dragging');
        this.dragging = true;
    };
    TimePicker.prototype.dragMove = function (e) {
        trigger.updateBubble(this.element, {
            x: -70 * Math.sin(this.rotation) + 140,
            y: 70 * Math.cos(this.rotation) + 175,
            text: this.getBubbleText()
        });
        var point = {
            x: this.picker.getBoundingClientRect().left + 140 - this.getClientCoor(e).x,
            y: this.getClientCoor(e).y - this.picker.getBoundingClientRect().top - 120
        };
        var r = Math.atan2(point.x, point.y);
        this.rotation = this.normalizeRotation(r);
        var newDate = this.getElementDate(this.timeDrag);
        if (this.getLevel() === 3 /* HOUR */) {
            newDate.setHours(this.rotationToTime(this.rotation));
        }
        else if (this.getLevel() === 4 /* MINUTE */) {
            newDate.setMinutes(this.rotationToTime(this.rotation));
        }
        else if (this.getLevel() === 5 /* SECOND */) {
            newDate.setSeconds(this.rotationToTime(this.rotation));
        }
        this.updateLabels(newDate);
        trigger.goto(this.element, {
            date: newDate,
            level: this.getLevel(),
            update: false
        });
        this.updateElements();
    };
    TimePicker.prototype.dragEnd = function (e) {
        this.picker.classList.remove('datium-dragging');
        var date = this.getElementDate(this.timeDrag);
        if (this.getLevel() === 3 /* HOUR */) {
            date.setHours(this.rotationToTime(this.rotation));
        }
        else if (this.getLevel() === 4 /* MINUTE */) {
            date.setMinutes(this.rotationToTime(this.rotation));
        }
        else if (this.getLevel() === 5 /* SECOND */) {
            date.setSeconds(this.rotationToTime(this.rotation));
        }
        trigger.zoomIn(this.element, {
            date: date,
            currentLevel: this.getLevel()
        });
        this.dragging = false;
    };
    TimePicker.prototype.updateElements = function () {
        this.timeDragArm.style.transform = "rotate(" + this.rotation + "rad)";
        if (this.getLevel() == 3 /* HOUR */) {
            this.hourHand.style.transform = "rotate(" + this.rotation + "rad)";
        }
        else if (this.getLevel() === 4 /* MINUTE */) {
            var t = this.selectedDate.getHours();
            var r1 = (t + 6) / 6 * Math.PI;
            var r = this.rotation;
            r = this.putRotationInBounds(r);
            r1 += (r + Math.PI) / 12;
            this.hourHand.style.transform = "rotate(" + r1 + "rad)";
            this.minuteHand.style.transform = "rotate(" + this.rotation + "rad)";
        }
        else if (this.getLevel() === 5 /* SECOND */) {
            var t = this.selectedDate.getHours();
            var r1 = (t + 6) / 6 * Math.PI;
            var t2 = this.selectedDate.getMinutes();
            var r2 = this.timeToRotation(t2);
            var r = r2;
            r = this.putRotationInBounds(r);
            r1 += (r + Math.PI) / 12;
            this.hourHand.style.transform = "rotate(" + r1 + "rad)";
            this.minuteHand.style.transform = "rotate(" + r2 + "rad)";
            this.secondHand.style.transform = "rotate(" + this.rotation + "rad)";
        }
    };
    TimePicker.prototype.putRotationInBounds = function (r, factor) {
        if (factor === void 0) { factor = 2; }
        while (r > Math.PI)
            r -= Math.PI * factor;
        while (r < -Math.PI)
            r += Math.PI * factor;
        return r;
    };
    TimePicker.prototype.normalizeRotation = function (r, factor) {
        if (factor === void 0) { factor = 2; }
        return r - Math.round((r - this.rotation) / Math.PI / factor) * Math.PI * factor;
    };
    TimePicker.prototype.setSelectedDate = function (date) {
        this.selectedDate = new Date(date.valueOf());
        if (this.getLevel() === 3 /* HOUR */) {
            this.rotation = this.normalizeRotation((date.getHours() + 6) / 6 * Math.PI, 2);
        }
        else if (this.getLevel() === 4 /* MINUTE */) {
            this.rotation = this.normalizeRotation((date.getMinutes() + 30) / 30 * Math.PI, 2);
        }
        else if (this.getLevel() === 5 /* SECOND */) {
            this.rotation = this.normalizeRotation((date.getSeconds() + 30) / 30 * Math.PI, 2);
        }
        if (this.timeDragArm !== void 0) {
            this.updateElements();
        }
        if (this.picker !== void 0) {
            this.updateLabels(date);
        }
    };
    TimePicker.prototype.getHeight = function () {
        return 240;
    };
    TimePicker.prototype.updateLabels = function (date, forceUpdate) {
        if (forceUpdate === void 0) { forceUpdate = false; }
        throw 'unimplemented';
    };
    TimePicker.prototype.getElementDate = function (el) { throw 'unimplemented'; };
    TimePicker.prototype.getBubbleText = function () { throw 'unimplemented'; };
    TimePicker.prototype.rotationToTime = function (rotation) { throw 'unimplemented'; };
    TimePicker.prototype.timeToRotation = function (time) { throw 'unimplemented'; };
    TimePicker.prototype.getLevel = function () { throw 'unimplemented'; };
    return TimePicker;
}(Picker));
/// <reference path="TimePicker.ts" />
var HourPicker = (function (_super) {
    __extends(HourPicker, _super);
    function HourPicker(element, container) {
        var _this = this;
        _super.call(this, element, container);
        listen.drag(container, '.datium-hour-drag', {
            dragStart: function (e) { return _this.dragStart(e); },
            dragMove: function (e) { return _this.dragMove(e); },
            dragEnd: function (e) { return _this.dragEnd(e); }
        });
        listen.tap(container, '.datium-hour-element', function (e) {
            var el = e.target || e.srcElement;
            trigger.zoomIn(_this.element, {
                date: _this.getElementDate(el),
                currentLevel: 3 /* HOUR */
            });
        });
        listen.down(container, '.datium-hour-element', function (e) {
            var el = (e.target || e.srcElement);
            var hours = new Date(el.getAttribute('datium-data')).getHours();
            var offset = _this.getOffset(el);
            trigger.openBubble(element, {
                x: offset.x + 25,
                y: offset.y + 3,
                text: _this.getBubbleText(hours)
            });
        });
        listen.tap(container, 'datium-meridiem-switcher', function () {
            var newDate = new Date(_this.lastLabelDate.valueOf());
            if (newDate.getHours() < 12) {
                newDate.setHours(newDate.getHours() + 12);
                _this.rotation += Math.PI * 2;
            }
            else {
                newDate.setHours(newDate.getHours() - 12);
                _this.rotation -= Math.PI * 2;
            }
            _this.updateLabels(newDate);
            trigger.goto(_this.element, {
                date: newDate,
                level: 3 /* HOUR */,
                update: false
            });
            _this.updateElements();
        });
    }
    HourPicker.prototype.getBubbleText = function (hours) {
        if (hours === void 0) {
            hours = this.rotationToTime(this.rotation);
        }
        if (this.options.militaryTime) {
            return this.pad(hours) + 'hr';
        }
        else if (hours === 12) {
            return '12pm';
        }
        else if (hours === 0) {
            return '12am';
        }
        else if (hours > 11) {
            return (hours - 12) + 'pm';
        }
        else {
            return hours + 'am';
        }
    };
    HourPicker.prototype.getElementDate = function (el) {
        var d = new Date(el.getAttribute('datium-data'));
        var year = d.getFullYear();
        var month = d.getMonth();
        var dateOfMonth = d.getDate();
        var hours = d.getHours();
        var newDate = new Date(this.selectedDate.valueOf());
        newDate.setFullYear(year);
        newDate.setMonth(month);
        if (newDate.getMonth() !== month) {
            newDate.setDate(0);
        }
        newDate.setDate(dateOfMonth);
        newDate.setHours(hours);
        return newDate;
    };
    HourPicker.prototype.rotationToTime = function (r) {
        while (r > 5 * Math.PI)
            r -= 4 * Math.PI;
        while (r < Math.PI)
            r += 4 * Math.PI;
        r -= 2 * Math.PI;
        var t = (r / Math.PI * 6) + 6;
        return t >= 23.5 ? 0 : Math.round(t);
    };
    HourPicker.prototype.timeToRotation = function (t) {
        return this.normalizeRotation((t + 6) / 6 * Math.PI);
    };
    HourPicker.prototype.create = function (date, transition) {
        this.min = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        this.max = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        var iterator = new Date(this.min.valueOf());
        this.picker = document.createElement('datium-picker');
        this.picker.classList.add('datium-hour-picker');
        this.transitionIn(transition, this.picker);
        for (var i = 0; i < 12; i++) {
            var tick = document.createElement('datium-tick');
            var tickLabel = document.createElement('datium-tick-label');
            tickLabel.classList.add('datium-hour-element');
            var tickLabelContainer = document.createElement('datium-tick-label-container');
            var r = i * Math.PI / 6 + Math.PI;
            tickLabelContainer.appendChild(tickLabel);
            tick.appendChild(tickLabelContainer);
            tick.style.transform = "rotate(" + r + "rad)";
            tickLabelContainer.style.transform = "rotate(" + (2 * Math.PI - r) + "rad)";
            tickLabel.setAttribute('datium-clock-pos', i.toString());
            var d = new Date(date.valueOf());
            var hours = this.rotationToTime(r);
            if (date.getHours() > 11)
                hours += 12;
            d.setHours(hours);
            tickLabel.setAttribute('datium-data', d.toISOString());
            this.picker.appendChild(tick);
        }
        this.meridiemSwitcher = document.createElement('datium-meridiem-switcher');
        if (this.options.militaryTime) {
            this.meridiemSwitcher.classList.add('datium-military-time');
        }
        this.picker.appendChild(this.meridiemSwitcher);
        this.hourHand = document.createElement('datium-hour-hand');
        this.timeDragArm = document.createElement('datium-time-drag-arm');
        this.timeDrag = document.createElement('datium-time-drag');
        this.timeDrag.classList.add('datium-hour-drag');
        this.timeDrag.setAttribute('datium-data', date.toISOString());
        this.timeDragArm.appendChild(this.timeDrag);
        this.picker.appendChild(this.timeDragArm);
        this.picker.appendChild(this.hourHand);
        this.meridiem = void 0;
        this.attach();
        this.setSelectedDate(this.selectedDate);
    };
    HourPicker.prototype.updateLabels = function (date, forceUpdate) {
        if (forceUpdate === void 0) { forceUpdate = false; }
        this.lastLabelDate = date;
        if (this.meridiem !== void 0 &&
            (this.meridiem === 'AM' && date.getHours() < 12) ||
            (this.meridiem === 'PM' && date.getHours() > 11)) {
            if (!forceUpdate)
                return;
        }
        this.meridiem = date.getHours() < 12 ? 'AM' : 'PM';
        if (this.meridiem === 'AM') {
            this.meridiemSwitcher.classList.remove('datium-pm-selected');
            this.meridiemSwitcher.classList.add('datium-am-selected');
        }
        else {
            this.meridiemSwitcher.classList.remove('datium-am-selected');
            this.meridiemSwitcher.classList.add('datium-pm-selected');
        }
        var labels = this.picker.querySelectorAll('[datium-clock-pos]');
        for (var i = 0; i < labels.length; i++) {
            var label = labels.item(i);
            var r = Math.PI * parseInt(label.getAttribute('datium-clock-pos'), 10) / 6 - 3 * Math.PI;
            var time = this.rotationToTime(r);
            var d = new Date(label.getAttribute('datium-data'));
            if (date.getHours() > 11) {
                d.setHours(time + 12);
            }
            else {
                d.setHours(time);
            }
            label.setAttribute('datium-data', d.toISOString());
            if (this.options.militaryTime) {
                if (date.getHours() > 11)
                    time += 12;
                label.innerHTML = this.pad(time);
            }
            else {
                if (time === 0)
                    time = 12;
                label.innerHTML = time.toString();
            }
        }
    };
    HourPicker.prototype.updateOptions = function (options) {
        if (this.options !== void 0 && this.options.militaryTime !== options.militaryTime) {
            this.options = options;
            this.updateLabels(this.lastLabelDate, true);
        }
        this.options = options;
        if (this.meridiemSwitcher !== void 0) {
            if (this.options.militaryTime) {
                this.meridiemSwitcher.classList.add('datium-military-time');
            }
            else {
                this.meridiemSwitcher.classList.remove('datium-military-time');
            }
        }
    };
    HourPicker.prototype.getLevel = function () {
        return 3 /* HOUR */;
    };
    return HourPicker;
}(TimePicker));
/// <reference path="TimePicker.ts" />
var MinutePicker = (function (_super) {
    __extends(MinutePicker, _super);
    function MinutePicker(element, container) {
        var _this = this;
        _super.call(this, element, container);
        listen.drag(container, '.datium-minute-drag', {
            dragStart: function (e) { return _this.dragStart(e); },
            dragMove: function (e) { return _this.dragMove(e); },
            dragEnd: function (e) { return _this.dragEnd(e); }
        });
        listen.tap(container, '.datium-minute-element', function (e) {
            var el = e.target || e.srcElement;
            trigger.zoomIn(_this.element, {
                date: _this.getElementDate(el),
                currentLevel: 4 /* MINUTE */
            });
        });
        listen.down(container, '.datium-minute-element', function (e) {
            var el = (e.target || e.srcElement);
            var minutes = new Date(el.getAttribute('datium-data')).getMinutes();
            var offset = _this.getOffset(el);
            trigger.openBubble(element, {
                x: offset.x + 25,
                y: offset.y + 3,
                text: _this.getBubbleText(minutes)
            });
        });
    }
    MinutePicker.prototype.getBubbleText = function (minutes) {
        if (minutes === void 0) {
            minutes = this.rotationToTime(this.rotation);
        }
        return this.pad(minutes) + 'm';
    };
    MinutePicker.prototype.getElementDate = function (el) {
        var d = new Date(el.getAttribute('datium-data'));
        var year = d.getFullYear();
        var month = d.getMonth();
        var dateOfMonth = d.getDate();
        var hours = d.getHours();
        var minutes = d.getMinutes();
        var newDate = new Date(this.selectedDate.valueOf());
        newDate.setFullYear(year);
        newDate.setMonth(month);
        if (newDate.getMonth() !== month) {
            newDate.setDate(0);
        }
        newDate.setDate(dateOfMonth);
        newDate.setHours(hours);
        newDate.setMinutes(minutes);
        return newDate;
    };
    MinutePicker.prototype.rotationToTime = function (r) {
        while (r > Math.PI)
            r -= 2 * Math.PI;
        while (r < -Math.PI)
            r += 2 * Math.PI;
        var t = (r / Math.PI * 30) + 30;
        return t >= 59.5 ? 0 : Math.round(t);
    };
    MinutePicker.prototype.timeToRotation = function (t) {
        return this.normalizeRotation((t + 30) / 30 * Math.PI);
    };
    MinutePicker.prototype.create = function (date, transition) {
        this.min = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours());
        this.max = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() + 1);
        var iterator = new Date(this.min.valueOf());
        this.picker = document.createElement('datium-picker');
        this.picker.classList.add('datium-minute-picker');
        this.transitionIn(transition, this.picker);
        for (var i = 0; i < 12; i++) {
            var tick = document.createElement('datium-tick');
            var tickLabel = document.createElement('datium-tick-label');
            tickLabel.classList.add('datium-minute-element');
            var tickLabelContainer = document.createElement('datium-tick-label-container');
            var r = i * Math.PI / 6 + Math.PI;
            tickLabelContainer.appendChild(tickLabel);
            tick.appendChild(tickLabelContainer);
            tick.style.transform = "rotate(" + r + "rad)";
            tickLabelContainer.style.transform = "rotate(" + (2 * Math.PI - r) + "rad)";
            tickLabel.setAttribute('datium-clock-pos', i.toString());
            var d = new Date(date.valueOf());
            var minutes = this.rotationToTime(r);
            d.setMinutes(minutes);
            tickLabel.setAttribute('datium-data', d.toISOString());
            this.picker.appendChild(tick);
        }
        this.minuteHand = document.createElement('datium-minute-hand');
        this.hourHand = document.createElement('datium-hour-hand');
        this.timeDragArm = document.createElement('datium-time-drag-arm');
        this.timeDrag = document.createElement('datium-time-drag');
        this.timeDrag.classList.add('datium-minute-drag');
        this.timeDrag.setAttribute('datium-data', date.toISOString());
        this.timeDragArm.appendChild(this.timeDrag);
        this.picker.appendChild(this.timeDragArm);
        this.picker.appendChild(this.hourHand);
        this.picker.appendChild(this.minuteHand);
        this.attach();
        this.setSelectedDate(this.selectedDate);
    };
    MinutePicker.prototype.updateLabels = function (date, forceUpdate) {
        if (forceUpdate === void 0) { forceUpdate = false; }
        var labels = this.picker.querySelectorAll('[datium-clock-pos]');
        for (var i = 0; i < labels.length; i++) {
            var label = labels.item(i);
            var r = Math.PI * parseInt(label.getAttribute('datium-clock-pos'), 10) / 6 - 3 * Math.PI;
            var time = this.rotationToTime(r);
            var d = new Date(label.getAttribute('datium-data'));
            label.setAttribute('datium-data', d.toISOString());
            label.innerHTML = this.pad(time);
        }
    };
    MinutePicker.prototype.updateOptions = function (options) {
        this.options = options;
    };
    MinutePicker.prototype.getLevel = function () {
        return 4 /* MINUTE */;
    };
    return MinutePicker;
}(TimePicker));
/// <reference path="Picker.ts" />
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
            trigger.zoomIn(element, {
                date: date,
                currentLevel: 1 /* MONTH */
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
/// <reference path="TimePicker.ts" />
var SecondPicker = (function (_super) {
    __extends(SecondPicker, _super);
    function SecondPicker(element, container) {
        var _this = this;
        _super.call(this, element, container);
        listen.drag(container, '.datium-second-drag', {
            dragStart: function (e) { return _this.dragStart(e); },
            dragMove: function (e) { return _this.dragMove(e); },
            dragEnd: function (e) { return _this.dragEnd(e); }
        });
        listen.tap(container, '.datium-second-element', function (e) {
            var el = e.target || e.srcElement;
            trigger.zoomIn(_this.element, {
                date: _this.getElementDate(el),
                currentLevel: 5 /* SECOND */
            });
        });
        listen.down(container, '.datium-second-element', function (e) {
            var el = (e.target || e.srcElement);
            var seconds = new Date(el.getAttribute('datium-data')).getSeconds();
            var offset = _this.getOffset(el);
            trigger.openBubble(element, {
                x: offset.x + 25,
                y: offset.y + 3,
                text: _this.getBubbleText(seconds)
            });
        });
    }
    SecondPicker.prototype.getBubbleText = function (seconds) {
        if (seconds === void 0) {
            seconds = this.rotationToTime(this.rotation);
        }
        return this.pad(seconds) + 's';
    };
    SecondPicker.prototype.getElementDate = function (el) {
        var d = new Date(el.getAttribute('datium-data'));
        var year = d.getFullYear();
        var month = d.getMonth();
        var dateOfMonth = d.getDate();
        var hours = d.getHours();
        var minutes = d.getMinutes();
        var seconds = d.getSeconds();
        var newDate = new Date(this.selectedDate.valueOf());
        newDate.setFullYear(year);
        newDate.setMonth(month);
        if (newDate.getMonth() !== month) {
            newDate.setDate(0);
        }
        newDate.setDate(dateOfMonth);
        newDate.setHours(hours);
        newDate.setMinutes(minutes);
        newDate.setSeconds(seconds);
        return newDate;
    };
    SecondPicker.prototype.rotationToTime = function (r) {
        while (r > Math.PI)
            r -= 2 * Math.PI;
        while (r < -Math.PI)
            r += 2 * Math.PI;
        var t = (r / Math.PI * 30) + 30;
        return t >= 59.5 ? 0 : Math.round(t);
    };
    SecondPicker.prototype.timeToRotation = function (t) {
        return this.normalizeRotation((t + 30) / 30 * Math.PI);
    };
    SecondPicker.prototype.create = function (date, transition) {
        this.min = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());
        this.max = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes() + 1);
        var iterator = new Date(this.min.valueOf());
        this.picker = document.createElement('datium-picker');
        this.picker.classList.add('datium-second-picker');
        this.transitionIn(transition, this.picker);
        for (var i = 0; i < 12; i++) {
            var tick = document.createElement('datium-tick');
            var tickLabel = document.createElement('datium-tick-label');
            tickLabel.classList.add('datium-second-element');
            var tickLabelContainer = document.createElement('datium-tick-label-container');
            var r = i * Math.PI / 6 + Math.PI;
            tickLabelContainer.appendChild(tickLabel);
            tick.appendChild(tickLabelContainer);
            tick.style.transform = "rotate(" + r + "rad)";
            tickLabelContainer.style.transform = "rotate(" + (2 * Math.PI - r) + "rad)";
            tickLabel.setAttribute('datium-clock-pos', i.toString());
            var d = new Date(date.valueOf());
            var seconds = this.rotationToTime(r);
            d.setSeconds(seconds);
            tickLabel.setAttribute('datium-data', d.toISOString());
            this.picker.appendChild(tick);
        }
        this.secondHand = document.createElement('datium-second-hand');
        this.minuteHand = document.createElement('datium-minute-hand');
        this.hourHand = document.createElement('datium-hour-hand');
        this.timeDragArm = document.createElement('datium-time-drag-arm');
        this.timeDrag = document.createElement('datium-time-drag');
        this.timeDrag.classList.add('datium-second-drag');
        this.timeDrag.setAttribute('datium-data', date.toISOString());
        this.timeDragArm.appendChild(this.timeDrag);
        this.picker.appendChild(this.timeDragArm);
        this.picker.appendChild(this.hourHand);
        this.picker.appendChild(this.minuteHand);
        this.picker.appendChild(this.secondHand);
        this.attach();
        this.setSelectedDate(this.selectedDate);
    };
    SecondPicker.prototype.updateLabels = function (date, forceUpdate) {
        if (forceUpdate === void 0) { forceUpdate = false; }
        var labels = this.picker.querySelectorAll('[datium-clock-pos]');
        for (var i = 0; i < labels.length; i++) {
            var label = labels.item(i);
            var r = Math.PI * parseInt(label.getAttribute('datium-clock-pos'), 10) / 6 - 3 * Math.PI;
            var time = this.rotationToTime(r);
            var d = new Date(label.getAttribute('datium-data'));
            label.setAttribute('datium-data', d.toISOString());
            label.innerHTML = this.pad(time);
        }
    };
    SecondPicker.prototype.updateOptions = function (options) {
        this.options = options;
    };
    SecondPicker.prototype.getLevel = function () {
        return 5 /* SECOND */;
    };
    return SecondPicker;
}(TimePicker));
/// <reference path="Picker.ts" />
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
            trigger.zoomIn(element, {
                date: date,
                currentLevel: 0 /* YEAR */
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
var css = "datium-container._id datium-bubble,datium-container._id datium-header,datium-container._id datium-picker-container{box-shadow:0 3px 6px rgba(0,0,0,.16),0 3px 6px rgba(0,0,0,.23)}datium-container._id datium-header-wrapper{overflow:hidden;position:absolute;left:-7px;right:-7px;top:-7px;height:87px;display:block;pointer-events:none}datium-container._id datium-header{position:relative;display:block;overflow:hidden;height:100px;background-color:_primary;border-top-left-radius:3px;border-top-right-radius:3px;z-index:1;margin:7px;width:calc(100% - 14px);pointer-events:auto}datium-container._id datium-span-label-container{position:absolute;left:40px;right:40px;top:0;bottom:0;display:block;overflow:hidden;transition:.2s ease all;transform-origin:40px 40px}datium-container._id datium-span-label{position:absolute;font-size:18pt;color:_primary_text;font-weight:700;transform-origin:0 0;white-space:nowrap;transition:all .2s ease;text-transform:uppercase}datium-container._id datium-span-label.datium-top{transform:translateY(17px) scale(.66);width:151%;opacity:.6}datium-container._id datium-span-label.datium-bottom{transform:translateY(36px) scale(1);width:100%;opacity:1}datium-container._id datium-span-label.datium-top.datium-hidden{transform:translateY(5px) scale(.4);opacity:0}datium-container._id datium-span-label.datium-bottom.datium-hidden{transform:translateY(78px) scale(1.2);opacity:1}datium-container._id datium-span-label:after{content:'';display:inline-block;position:absolute;margin-left:10px;margin-top:6px;height:17px;width:17px;opacity:0;transition:all .2s ease;background:url(data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22_primary_text%22%3E%3Cpath%20d%3D%22M17%2015l-2%202-5-5%202-2z%22%20fill-rule%3D%22evenodd%22%2F%3E%3Cpath%20d%3D%22M7%200a7%207%200%200%200-7%207%207%207%200%200%200%207%207%207%207%200%200%200%207-7%207%207%200%200%200-7-7zm0%202a5%205%200%200%201%205%205%205%205%200%200%201-5%205%205%205%200%200%201-5-5%205%205%200%200%201%205-5z%22%2F%3E%3Cpath%20d%3D%22M4%206h6v2H4z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E)}datium-container._id datium-bubble,datium-container._id datium-bubble.datium-bubble-visible{transition-property:transform,opacity;transition-timing-function:ease;transition-duration:.2s}datium-container._id datium-span-label.datium-top:after{opacity:1}datium-container._id datium-span-label datium-variable{color:_primary;font-size:14pt;padding:0 4px;margin:0 2px;top:-2px;position:relative}datium-container._id datium-span-label datium-variable:before{content:'';position:absolute;left:0;top:0;right:0;bottom:0;border-radius:5px;background-color:_primary_text;z-index:-1;opacity:.7}datium-container._id datium-span-label datium-lower{text-transform:lowercase}datium-container._id datium-next,datium-container._id datium-prev{position:absolute;width:40px;top:0;bottom:0;transform-origin:20px 52px}datium-container._id datium-next:after,datium-container._id datium-next:before,datium-container._id datium-prev:after,datium-container._id datium-prev:before{content:'';position:absolute;display:block;width:3px;height:8px;left:50%;background-color:_primary_text;top:48px}datium-container._id datium-next.datium-active,datium-container._id datium-prev.datium-active{transform:scale(.9);opacity:.9}datium-container._id datium-prev{left:0}datium-container._id datium-prev:after,datium-container._id datium-prev:before{margin-left:-3px}datium-container._id datium-next{right:0}datium-container._id datium-prev:before{transform:rotate(45deg) translateY(-2.6px)}datium-container._id datium-prev:after{transform:rotate(-45deg) translateY(2.6px)}datium-container._id datium-next:before{transform:rotate(45deg) translateY(2.6px)}datium-container._id datium-next:after{transform:rotate(-45deg) translateY(-2.6px)}datium-container._id{display:block;position:absolute;width:280px;font-family:Roboto,Arial;margin-top:2px;font-size:16px}datium-container._id,datium-container._id *{-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;-webkit-tap-highlight-color:transparent;cursor:default}datium-container._id datium-bubble{position:absolute;width:50px;line-height:26px;text-align:center;font-size:14px;background-color:_secondary_accent;font-weight:700;border-radius:3px;margin-left:-25px;margin-top:-32px;color:_secondary;z-index:1;transform-origin:30px 36px;transition-delay:0;transform:scale(.5);opacity:0}datium-container._id datium-bubble:after{content:'';position:absolute;display:block;width:10px;height:10px;transform:rotate(45deg);background:linear-gradient(135deg,rgba(0,0,0,0) 50%,_secondary_accent 50%);left:50%;top:20px;margin-left:-5px}datium-container._id datium-bubble.datium-bubble-visible{transform:scale(1);opacity:1;transition-delay:.2s}datium-container._id datium-picker-container-wrapper{overflow:hidden;position:absolute;left:-7px;right:-7px;top:80px;height:270px;display:block;pointer-events:none}datium-container._id datium-picker-container{position:relative;width:calc(100% - 14px);height:260px;background-color:_secondary;display:block;margin:0 7px 7px;padding-top:20px;transform:translateY(-270px);pointer-events:auto;border-bottom-right-radius:3px;border-bottom-left-radius:3px;transition:all ease .4s;transition-delay:.1s;overflow:hidden}datium-container._id datium-picker{position:absolute;left:0;right:0;bottom:0;color:_secondary_text;transition:all ease .4s}datium-container._id datium-picker.datium-picker-left{transform:translateX(-100%) scale(1);pointer-events:none;transition-delay:0s}datium-container._id datium-picker.datium-picker-right{transform:translateX(100%) scale(1);pointer-events:none;transition-delay:0s}datium-container._id datium-picker.datium-picker-out{transform:translateX(0) scale(1.4);opacity:0;pointer-events:none;transition-delay:0s}datium-container._id datium-picker.datium-picker-in{transform:translateX(0) scale(.6);opacity:0;pointer-events:none;transition-delay:0s}datium-container._id datium-month-element,datium-container._id datium-year-element{display:inline-block;width:25%;line-height:60px;text-align:center;position:relative;transition:.2s ease all}datium-container._id datium-month-element.datium-selected:after,datium-container._id datium-year-element.datium-selected:after{content:'';position:absolute;left:20px;right:20px;top:50%;margin-top:11px;height:2px;display:block;background-color:_secondary_accent}datium-container._id datium-month-element.datium-active,datium-container._id datium-year-element.datium-active{transform:scale(.9);transition:none}datium-container._id datium-month-element.datium-selected:after{left:25px;right:25px}datium-container._id datium-date-header{display:inline-block;width:40px;line-height:28px;opacity:.6;font-weight:700;text-align:center}datium-container._id datium-date-element{display:inline-block;width:40px;line-height:36px;text-align:center;position:relative;transition:.2s ease all}datium-container._id datium-date-element.datium-selected:after{content:'';position:absolute;left:12px;right:12px;top:50%;margin-top:10px;height:2px;display:block;background-color:_secondary_accent}datium-container._id datium-date-element.datium-active{transform:scale(.9);transition:none}datium-container._id datium-date-element:not([datium-data]){opacity:.6;pointer-events:none}datium-container._id datium-picker.datium-hour-picker,datium-container._id datium-picker.datium-minute-picker,datium-container._id datium-picker.datium-second-picker{height:240px}datium-container._id datium-picker.datium-hour-picker:before,datium-container._id datium-picker.datium-minute-picker:before,datium-container._id datium-picker.datium-second-picker:before{content:'';width:140px;height:140px;position:absolute;border:1px solid;left:50%;top:50%;margin-left:-71px;margin-top:-71px;border-radius:70px;opacity:.5}datium-container._id datium-picker.datium-hour-picker:after,datium-container._id datium-picker.datium-minute-picker:after,datium-container._id datium-picker.datium-second-picker:after{content:'';width:4px;height:4px;margin-left:-4px;margin-top:-4px;top:50%;left:50%;border-radius:4px;position:absolute;border:2px solid;border-color:_secondary_accent;background-color:_secondary;box-shadow:0 0 0 2px _secondary}datium-container._id datium-tick{position:absolute;left:50%;top:50%;width:2px;height:70px;margin-left:-1px;transform-origin:1px 0}datium-container._id datium-tick:after{content:'';position:absolute;width:2px;height:6px;background-color:_secondary_text;bottom:-4px;opacity:.5}datium-container._id datium-meridiem-switcher{position:absolute;left:50%;margin-left:-30px;top:50%;margin-top:15px;display:block;width:60px;height:40px}datium-container._id datium-meridiem-switcher:after,datium-container._id datium-meridiem-switcher:before{position:absolute;width:30px;top:0;display:block;line-height:40px;font-weight:700;text-align:center;font-size:14px;transform:scale(.9);opacity:.9;color:_secondary_text;transition:all ease .2s}datium-container._id datium-meridiem-switcher.datium-military-time:before{content:'-12'}datium-container._id datium-meridiem-switcher.datium-military-time:after{content:'+12'}datium-container._id datium-meridiem-switcher:before{content:'AM';left:0}datium-container._id datium-meridiem-switcher:after{content:'PM';right:0}datium-container._id datium-meridiem-switcher.datium-am-selected:before,datium-container._id datium-meridiem-switcher.datium-pm-selected:after{transform:scale(1);color:_secondary_accent;opacity:1}datium-container._id datium-meridiem-switcher.datium-active:after,datium-container._id datium-meridiem-switcher.datium-active:before{transition:none}datium-container._id datium-meridiem-switcher.datium-active.datium-am-selected:before{transform:scale(.9)}datium-container._id datium-meridiem-switcher.datium-active.datium-am-selected:after,datium-container._id datium-meridiem-switcher.datium-active.datium-pm-selected:before{transform:scale(.8)}datium-container._id datium-meridiem-switcher.datium-active.datium-pm-selected:after{transform:scale(.9)}datium-container._id datium-tick-label-container{position:absolute;bottom:-50px;left:-24px;display:block;height:50px;width:50px}datium-container._id datium-tick-label{position:absolute;left:0;top:0;display:block;width:100%;line-height:50px;border-radius:25px;text-align:center;font-size:14px;transition:.2s ease all}datium-container._id datium-tick-label.datium-active{transform:scale(.9);transition:none}datium-container._id datium-picker.datium-hour-picker.datium-dragging datium-hour-hand,datium-container._id datium-picker.datium-hour-picker.datium-dragging datium-minute-hand,datium-container._id datium-picker.datium-hour-picker.datium-dragging datium-second-hand,datium-container._id datium-picker.datium-hour-picker.datium-dragging datium-time-drag-arm,datium-container._id datium-picker.datium-minute-picker.datium-dragging datium-hour-hand,datium-container._id datium-picker.datium-minute-picker.datium-dragging datium-minute-hand,datium-container._id datium-picker.datium-minute-picker.datium-dragging datium-second-hand,datium-container._id datium-picker.datium-minute-picker.datium-dragging datium-time-drag-arm,datium-container._id datium-picker.datium-second-picker.datium-dragging datium-hour-hand,datium-container._id datium-picker.datium-second-picker.datium-dragging datium-minute-hand,datium-container._id datium-picker.datium-second-picker.datium-dragging datium-second-hand,datium-container._id datium-picker.datium-second-picker.datium-dragging datium-time-drag-arm{transition:none}datium-container._id datium-hour-hand,datium-container._id datium-minute-hand,datium-container._id datium-second-hand{position:absolute;display:block;width:0;height:0;left:50%;top:50%;transform-origin:3px 3px;margin-left:-3px;margin-top:-3px;border-left:3px solid transparent;border-right:3px solid transparent;border-top-left-radius:3px;border-top-right-radius:3px;transition:.3s ease all}datium-container._id datium-picker.datium-minute-picker datium-hour-hand,datium-container._id datium-picker.datium-second-picker datium-hour-hand,datium-container._id datium-picker.datium-second-picker datium-minute-hand{border-top-color:_secondary_text;opacity:.5}datium-container._id datium-hour-hand{border-top:30px solid _secondary_accent}datium-container._id datium-minute-hand{transform-origin:2px 2px;margin-left:-2px;margin-top:-2px;border-left:2px solid transparent;border-right:2px solid transparent;border-top-left-radius:2px;border-top-right-radius:2px;border-top:40px solid _secondary_accent}datium-container._id datium-second-hand{transform-origin:1px 1px;margin-left:-1px;margin-top:-1px;border-left:1px solid transparent;border-right:1px solid transparent;border-top-left-radius:1px;border-top-right-radius:1px;border-top:50px solid _secondary_accent}datium-container._id datium-time-drag-arm{width:2px;height:70px;position:absolute;left:50%;top:50%;margin-left:-1px;transform-origin:1px 0;transform:rotate(45deg);transition:.3s ease all}datium-container._id datium-time-drag-arm:after,datium-container._id datium-time-drag-arm:before{content:'';border:4px solid transparent;position:absolute;bottom:-4px;left:12px;border-left-color:_secondary_accent;transform-origin:-11px 4px}datium-container._id datium-time-drag-arm:after{transform:rotate(180deg)}datium-container._id datium-time-drag{display:block;position:absolute;width:50px;height:50px;top:100%;margin-top:-25px;margin-left:-24px;border-radius:25px}datium-container._id datium-time-drag:after{content:'';width:10px;height:10px;position:absolute;left:50%;top:50%;margin-left:-7px;margin-top:-7px;background-color:_secondary_accent;border:2px solid;border-color:_secondary;box-shadow:0 0 0 2px _secondary_accent;border-radius:10px}datium-container._id datium-time-drag.datium-active:after{width:8px;height:8px;border:3px solid;border-color:_secondary}";
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRhdGl1bS50cyIsIkRhdGl1bUludGVybmFscy50cyIsIk9wdGlvblNhbml0aXplci50cyIsImNvbW1vbi9Db21tb24udHMiLCJjb21tb24vQ3VzdG9tRXZlbnRQb2x5ZmlsbC50cyIsImNvbW1vbi9FdmVudHMudHMiLCJpbnB1dC9EYXRlUGFydHMudHMiLCJpbnB1dC9JbnB1dC50cyIsImlucHV0L0tleWJvYXJkRXZlbnRIYW5kbGVyLnRzIiwiaW5wdXQvTW91c2VFdmVudEhhbmRsZXIudHMiLCJpbnB1dC9QYXJzZXIudHMiLCJpbnB1dC9QYXN0ZUV2ZW50SGFuZGxlci50cyIsInBpY2tlci9IZWFkZXIudHMiLCJwaWNrZXIvUGlja2VyTWFuYWdlci50cyIsInBpY2tlci9odG1sL2hlYWRlci50cyIsInBpY2tlci9waWNrZXJzL1BpY2tlci50cyIsInBpY2tlci9waWNrZXJzL0RhdGVQaWNrZXIudHMiLCJwaWNrZXIvcGlja2Vycy9UaW1lUGlja2VyLnRzIiwicGlja2VyL3BpY2tlcnMvSG91clBpY2tlci50cyIsInBpY2tlci9waWNrZXJzL01pbnV0ZVBpY2tlci50cyIsInBpY2tlci9waWNrZXJzL01vbnRoUGlja2VyLnRzIiwicGlja2VyL3BpY2tlcnMvU2Vjb25kUGlja2VyLnRzIiwicGlja2VyL3BpY2tlcnMvWWVhclBpY2tlci50cyIsInBpY2tlci9zdHlsZXMvY3NzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQU0sTUFBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHO0lBRXRCLGdCQUFZLE9BQXdCLEVBQUUsT0FBZ0I7UUFDbEQsSUFBSSxTQUFTLEdBQUcsSUFBSSxlQUFlLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxhQUFhLEdBQUcsVUFBQyxPQUFnQixJQUFLLE9BQUEsU0FBUyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBaEMsQ0FBZ0MsQ0FBQztJQUNoRixDQUFDO0lBQ0wsYUFBQztBQUFELENBTjBCLEFBTXpCLEdBQUEsQ0FBQTtBQ0REO0lBU0kseUJBQW9CLE9BQXdCLEVBQUUsT0FBZ0I7UUFUbEUsaUJBbUZDO1FBMUV1QixZQUFPLEdBQVAsT0FBTyxDQUFpQjtRQVJwQyxZQUFPLEdBQWlCLEVBQUUsQ0FBQztRQVMvQixFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssS0FBSyxDQUFDLENBQUM7WUFBQyxNQUFNLHFCQUFxQixDQUFDO1FBQ3BELE9BQU8sQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRTVDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVoRCxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRTVCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsS0FBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFwQyxDQUFvQyxDQUFDLENBQUM7UUFDbEUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsVUFBQyxDQUFDLElBQUssT0FBQSxLQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQTlDLENBQThDLENBQUMsQ0FBQztRQUMvRSxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLEtBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBN0MsQ0FBNkMsQ0FBQyxDQUFDO1FBRTdFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsRUFBRSxZQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUVNLGlDQUFPLEdBQWQsVUFBZSxJQUFTLEVBQUUsWUFBa0IsRUFBRSxNQUFxQjtRQUFyQixzQkFBcUIsR0FBckIsYUFBcUI7UUFDL0QsSUFBSSxRQUFRLEdBQVMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN4RSxFQUFFLENBQUMsQ0FBQyxRQUFRLEtBQUssS0FBSyxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUM7UUFDaEMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ3hCLElBQUksRUFBRSxJQUFJO1lBQ1YsS0FBSyxFQUFFLFFBQVE7WUFDZixNQUFNLEVBQUUsTUFBTTtTQUNoQixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sZ0NBQU0sR0FBYixVQUFjLElBQVMsRUFBRSxZQUFrQixFQUFFLE1BQXFCO1FBQXJCLHNCQUFxQixHQUFyQixhQUFxQjtRQUM5RCxJQUFJLFFBQVEsR0FBUyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3hFLEVBQUUsQ0FBQyxDQUFDLFFBQVEsS0FBSyxLQUFLLENBQUMsQ0FBQztZQUFDLFFBQVEsR0FBRyxZQUFZLENBQUM7UUFDakQsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ3hCLElBQUksRUFBRSxJQUFJO1lBQ1YsS0FBSyxFQUFFLFFBQVE7WUFDZixNQUFNLEVBQUUsTUFBTTtTQUNoQixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sOEJBQUksR0FBWCxVQUFZLElBQVMsRUFBRSxLQUFXLEVBQUUsTUFBcUI7UUFBckIsc0JBQXFCLEdBQXJCLGFBQXFCO1FBQ3JELEVBQUUsQ0FBQyxDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsQ0FBQztZQUFDLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBRXZDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxLQUFLLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDckYsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDcEQsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxLQUFLLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDckYsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDcEQsQ0FBQztRQUNELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUM5QixJQUFJLEVBQUUsSUFBSTtZQUNWLEtBQUssRUFBRSxLQUFLO1lBQ1osTUFBTSxFQUFFLE1BQU07U0FDakIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLHVDQUFhLEdBQXBCLFVBQXFCLFVBQTZCO1FBQTdCLDBCQUE2QixHQUE3QixhQUEyQixFQUFFO1FBQzlDLElBQUksQ0FBQyxPQUFPLEdBQUcsZUFBZSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2xFLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV2QyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUVuQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUMsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLENBQUM7WUFFM0QsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN0QyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7b0JBQ3ZCLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtvQkFDZixLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7aUJBQ3hCLENBQUMsQ0FBQTtZQUNOLENBQUM7UUFDTCxDQUFDO1FBRUQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFDTCxzQkFBQztBQUFELENBbkZBLEFBbUZDLElBQUE7QUN4RkQseUJBQXlCLEdBQVU7SUFDL0IsTUFBTSxDQUFDLGtDQUFnQyxHQUFHLDhEQUEyRCxDQUFDO0FBQzFHLENBQUM7QUFFRDtJQUFBO0lBcUdBLENBQUM7SUFqR1UsaUNBQWlCLEdBQXhCLFVBQXlCLFNBQWEsRUFBRSxJQUFpQztRQUFqQyxvQkFBaUMsR0FBakMsMEJBQWlDO1FBQ3JFLEVBQUUsQ0FBQyxDQUFDLFNBQVMsS0FBSyxLQUFLLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDdEMsRUFBRSxDQUFDLENBQUMsT0FBTyxTQUFTLEtBQUssUUFBUSxDQUFDO1lBQUMsTUFBTSxlQUFlLENBQUMseUNBQXlDLENBQUMsQ0FBQztRQUNwRyxNQUFNLENBQUMsU0FBUyxDQUFDO0lBQ3JCLENBQUM7SUFFTSwrQkFBZSxHQUF0QixVQUF1QixPQUFXLEVBQUUsSUFBa0I7UUFBbEIsb0JBQWtCLEdBQWxCLFlBQWlCLENBQUM7UUFDbEQsRUFBRSxDQUFDLENBQUMsT0FBTyxLQUFLLEtBQUssQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNwQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQywwQkFBMEI7SUFDeEQsQ0FBQztJQUVNLCtCQUFlLEdBQXRCLFVBQXVCLE9BQVcsRUFBRSxJQUFrQjtRQUFsQixvQkFBa0IsR0FBbEIsWUFBaUIsQ0FBQztRQUNsRCxFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssS0FBSyxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ3BDLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLHVCQUF1QjtJQUNyRCxDQUFDO0lBRU0sbUNBQW1CLEdBQTFCLFVBQTJCLFdBQWUsRUFBRSxJQUF5QjtRQUF6QixvQkFBeUIsR0FBekIsT0FBWSxJQUFJLENBQUMsUUFBUTtRQUNqRSxFQUFFLENBQUMsQ0FBQyxXQUFXLEtBQUssS0FBSyxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ3hDLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLHNCQUFzQjtJQUN4RCxDQUFDO0lBRU0sNkJBQWEsR0FBcEIsVUFBcUIsS0FBUztRQUMxQixJQUFJLFFBQVEsR0FBRyx5QkFBeUIsQ0FBQztRQUN6QyxJQUFJLE1BQU0sR0FBRyx5QkFBeUIsQ0FBQztRQUN2QyxJQUFJLEdBQUcsR0FBRywyRUFBMkUsQ0FBQztRQUN0RixJQUFJLElBQUksR0FBRyxzR0FBc0csQ0FBQztRQUNsSCxJQUFJLGtCQUFrQixHQUFHLElBQUksTUFBTSxDQUFDLFFBQU0sUUFBUSxXQUFNLE1BQU0sV0FBTSxHQUFHLFdBQU0sSUFBSSxRQUFLLENBQUMsQ0FBQztRQUV4RixFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssS0FBSyxDQUFDLENBQUM7WUFBQyxNQUFNLGVBQWUsQ0FBQyx1R0FBdUcsQ0FBQyxDQUFDO1FBQ3JKLEVBQUUsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQUMsTUFBTSxlQUFlLENBQUMsdURBQXVELENBQUMsQ0FBQztRQUNwSCxNQUFNLENBQVMsS0FBSyxDQUFDO0lBQ3pCLENBQUM7SUFFTSw2QkFBYSxHQUFwQixVQUFxQixLQUFTLEVBQUUsSUFBcUI7UUFBckIsb0JBQXFCLEdBQXJCLGlCQUFxQjtRQUNqRCxFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssS0FBSyxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUN6RSxFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQzVCLE1BQU0sQ0FBQSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ2YsS0FBSyxPQUFPO29CQUNSLE1BQU0sQ0FBUzt3QkFDWCxPQUFPLEVBQUUsTUFBTTt3QkFDZixZQUFZLEVBQUUsTUFBTTt3QkFDcEIsU0FBUyxFQUFFLE1BQU07d0JBQ2pCLGNBQWMsRUFBRSxNQUFNO3dCQUN0QixnQkFBZ0IsRUFBRSxNQUFNO3FCQUMzQixDQUFBO2dCQUNMLEtBQUssTUFBTTtvQkFDUCxNQUFNLENBQVM7d0JBQ1gsT0FBTyxFQUFFLE1BQU07d0JBQ2YsWUFBWSxFQUFFLE1BQU07d0JBQ3BCLFNBQVMsRUFBRSxNQUFNO3dCQUNqQixjQUFjLEVBQUUsTUFBTTt3QkFDdEIsZ0JBQWdCLEVBQUUsTUFBTTtxQkFDM0IsQ0FBQTtnQkFDTCxLQUFLLFVBQVU7b0JBQ1gsTUFBTSxDQUFTO3dCQUNYLE9BQU8sRUFBRSxTQUFTO3dCQUNsQixZQUFZLEVBQUUsTUFBTTt3QkFDcEIsU0FBUyxFQUFFLE1BQU07d0JBQ2pCLGNBQWMsRUFBRSxNQUFNO3dCQUN0QixnQkFBZ0IsRUFBRSxTQUFTO3FCQUM5QixDQUFBO2dCQUNMO29CQUNJLE1BQU0sMEJBQTBCLENBQUM7WUFDckMsQ0FBQztRQUNMLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNuQyxNQUFNLENBQVU7Z0JBQ1osT0FBTyxFQUFFLGVBQWUsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUN4RCxTQUFTLEVBQUUsZUFBZSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQzVELFlBQVksRUFBRSxlQUFlLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDbEUsY0FBYyxFQUFFLGVBQWUsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQ3RFLGdCQUFnQixFQUFFLGVBQWUsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7YUFDN0UsQ0FBQTtRQUNMLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLE1BQU0sZUFBZSxDQUFDLDZDQUE2QyxDQUFDLENBQUM7UUFDekUsQ0FBQztJQUNMLENBQUM7SUFFTSxvQ0FBb0IsR0FBM0IsVUFBNEIsWUFBZ0IsRUFBRSxJQUFvQjtRQUFwQixvQkFBb0IsR0FBcEIsWUFBb0I7UUFDOUQsRUFBRSxDQUFDLENBQUMsWUFBWSxLQUFLLEtBQUssQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztRQUN6QyxFQUFFLENBQUMsQ0FBQyxPQUFPLFlBQVksS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sZUFBZSxDQUFDLDZDQUE2QyxDQUFDLENBQUM7UUFDekUsQ0FBQztRQUNELE1BQU0sQ0FBVSxZQUFZLENBQUM7SUFDakMsQ0FBQztJQUVNLHdCQUFRLEdBQWYsVUFBZ0IsT0FBZ0IsRUFBRSxRQUFpQjtRQUMvQyxJQUFJLElBQUksR0FBWTtZQUNoQixTQUFTLEVBQUUsZUFBZSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBRSxRQUFRLENBQUMsU0FBUyxDQUFDO1lBQ3RGLE9BQU8sRUFBRSxlQUFlLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxRQUFRLENBQUMsT0FBTyxDQUFDO1lBQzlFLE9BQU8sRUFBRSxlQUFlLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxRQUFRLENBQUMsT0FBTyxDQUFDO1lBQzlFLFdBQVcsRUFBRSxlQUFlLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxXQUFXLENBQUM7WUFDOUYsS0FBSyxFQUFFLGVBQWUsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUM7WUFDdEUsWUFBWSxFQUFFLGVBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLEVBQUUsUUFBUSxDQUFDLFlBQVksQ0FBQztTQUNyRyxDQUFBO1FBRUQsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNoQixDQUFDO0lBbEdNLHdCQUFRLEdBQVEsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQW1HdEMsc0JBQUM7QUFBRCxDQXJHQSxBQXFHQyxJQUFBO0FDekdEO0lBQUE7SUE2REEsQ0FBQztJQTVEYSwwQkFBUyxHQUFuQjtRQUNJLE1BQU0sQ0FBQyxDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDdEksQ0FBQztJQUVTLCtCQUFjLEdBQXhCO1FBQ0ksTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNoRyxDQUFDO0lBRVMsd0JBQU8sR0FBakI7UUFDSSxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUMxRixDQUFDO0lBRVMsNkJBQVksR0FBdEI7UUFDSSxNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM3RCxDQUFDO0lBRVMsNEJBQVcsR0FBckIsVUFBc0IsSUFBUztRQUMzQixNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDMUUsQ0FBQztJQUVTLHlCQUFRLEdBQWxCLFVBQW1CLElBQVM7UUFDeEIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzFCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7WUFBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ3hCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7WUFBQyxHQUFHLElBQUksRUFBRSxDQUFDO1FBQ3hCLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDMUIsQ0FBQztJQUVTLDBCQUFTLEdBQW5CLFVBQW9CLElBQVM7UUFDekIsTUFBTSxDQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFDLEVBQUUsQ0FBQyxHQUFDLEVBQUUsV0FBTSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFDLEVBQUUsQ0FBQyxHQUFDLEVBQUksQ0FBQztJQUNwRyxDQUFDO0lBRVMsNEJBQVcsR0FBckIsVUFBc0IsSUFBUztRQUMzQixNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQzlDLENBQUM7SUFFUyxvQkFBRyxHQUFiLFVBQWMsR0FBaUIsRUFBRSxJQUFlO1FBQWYsb0JBQWUsR0FBZixRQUFlO1FBQzVDLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN6QixPQUFNLEdBQUcsQ0FBQyxNQUFNLEdBQUcsSUFBSTtZQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ3pDLE1BQU0sQ0FBQyxHQUFHLENBQUM7SUFDZixDQUFDO0lBRVMscUJBQUksR0FBZCxVQUFlLEdBQVU7UUFDckIsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDdEMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNwQyxDQUFDO1FBQ0QsTUFBTSxDQUFDLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFFUyw4QkFBYSxHQUF2QixVQUF3QixDQUFLO1FBQ3pCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLE1BQU0sQ0FBQztnQkFDSCxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU87Z0JBQ1osQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPO2FBQ2YsQ0FBQTtRQUNMLENBQUM7UUFDRCxNQUFNLENBQUM7WUFDSCxDQUFDLEVBQUUsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPO1lBQzlCLENBQUMsRUFBRSxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU87U0FDakMsQ0FBQTtJQUNMLENBQUM7SUFDTCxhQUFDO0FBQUQsQ0E3REEsQUE2REMsSUFBQTtBQzdERCxXQUFXLEdBQUcsQ0FBQztJQUNYO1FBQ0ksSUFBSSxDQUFDO1lBQ0QsSUFBSSxXQUFXLEdBQUcsSUFBSSxXQUFXLENBQUMsR0FBRyxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMvRCxNQUFNLENBQUUsR0FBRyxLQUFLLFdBQVcsQ0FBQyxJQUFJLElBQUksR0FBRyxLQUFLLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3JFLENBQUU7UUFBQSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2IsQ0FBQztRQUNELE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVELEVBQUUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNkLE1BQU0sQ0FBTSxXQUFXLENBQUM7SUFDNUIsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLFFBQVEsQ0FBQyxXQUFXLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQztRQUNwRCxVQUFVO1FBQ1YsTUFBTSxDQUFNLFVBQVMsSUFBVyxFQUFFLE1BQXNCO1lBQ3BELElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDNUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDVCxDQUFDLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzlFLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixDQUFDLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDbEQsQ0FBQztZQUNELE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDYixDQUFDLENBQUE7SUFDTCxDQUFDO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDSixVQUFVO1FBQ1YsTUFBTSxDQUFNLFVBQVMsSUFBVyxFQUFFLE1BQXNCO1lBQ3BELElBQUksQ0FBQyxHQUFTLFFBQVMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQzVDLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ2QsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDVCxDQUFDLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3BDLENBQUMsQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDMUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1lBQzdCLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixDQUFDLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztnQkFDbEIsQ0FBQyxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7Z0JBQ3JCLENBQUMsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLENBQUM7WUFDdEIsQ0FBQztZQUNELE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDYixDQUFDLENBQUE7SUFDTCxDQUFDO0FBQ0wsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQzVCTCxJQUFVLE1BQU0sQ0E2UWY7QUE3UUQsV0FBVSxNQUFNLEVBQUMsQ0FBQztJQUNkLElBQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMsT0FBTyxJQUFJLFFBQVEsQ0FBQyxlQUFlLENBQUMsaUJBQWlCLENBQUM7SUFFN0YsNkJBQTZCLE1BQWMsRUFBRSxnQkFBdUIsRUFBRSxRQUEyQztRQUM3RyxNQUFNLENBQUMsVUFBQyxDQUF1QjtZQUMzQixJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsVUFBVSxJQUFhLENBQUMsQ0FBQyxNQUFNLENBQUM7WUFDL0MsT0FBTSxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO2dCQUNuRCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDekMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNaLE1BQU0sQ0FBQztnQkFDWCxDQUFDO2dCQUNELE1BQU0sR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDO1lBQ2xDLENBQUM7UUFDTCxDQUFDLENBQUE7SUFDTCxDQUFDO0lBRUQsOEJBQThCLE1BQWUsRUFBRSxNQUFjLEVBQUUsZ0JBQXVCLEVBQUUsUUFBMkM7UUFDL0gsSUFBSSxTQUFTLEdBQXdCLEVBQUUsQ0FBQztRQUN4QyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLElBQUksT0FBSyxHQUFVLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUUvQixJQUFJLFdBQVcsR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDMUUsU0FBUyxDQUFDLElBQUksQ0FBQztnQkFDWCxPQUFPLEVBQUUsTUFBTTtnQkFDZixTQUFTLEVBQUUsV0FBVztnQkFDdEIsS0FBSyxFQUFFLE9BQUs7YUFDZixDQUFDLENBQUM7WUFFSCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ2hELENBQUM7UUFDRCxNQUFNLENBQUMsU0FBUyxDQUFDO0lBQ3JCLENBQUM7SUFFRCxzQkFBc0IsTUFBZSxFQUFFLE9BQStCLEVBQUUsUUFBeUI7UUFDN0YsSUFBSSxTQUFTLEdBQXdCLEVBQUUsQ0FBQztRQUN4QyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQUMsS0FBSztZQUNqQixTQUFTLENBQUMsSUFBSSxDQUFDO2dCQUNYLE9BQU8sRUFBRSxPQUFPO2dCQUNoQixTQUFTLEVBQUUsUUFBUTtnQkFDbkIsS0FBSyxFQUFFLEtBQUs7YUFDZixDQUFDLENBQUM7WUFDSCxPQUFPLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzlDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLFNBQVMsQ0FBQztJQUNyQixDQUFDO0lBRUQsU0FBUztJQUVULGVBQXNCLE9BQStCLEVBQUUsUUFBZ0M7UUFDbkYsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLE9BQU8sRUFBRSxVQUFDLENBQUM7WUFDdEMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUplLFlBQUssUUFJcEIsQ0FBQTtJQUlEO1FBQXFCLGdCQUFlO2FBQWYsV0FBZSxDQUFmLHNCQUFlLENBQWYsSUFBZTtZQUFmLCtCQUFlOztRQUNoQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEIsTUFBTSxDQUFDLG9CQUFvQixDQUFDLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBQyxDQUFDO2dCQUM3RSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQU0sQ0FBQyxDQUFDLENBQUM7WUFDdEIsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFDLENBQUM7Z0JBQzFELE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBTSxDQUFDLENBQUMsQ0FBQztZQUN0QixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7SUFDTCxDQUFDO0lBVmUsV0FBSSxPQVVuQixDQUFBO0lBQUEsQ0FBQztJQUVGLFlBQW1CLE9BQStCLEVBQUUsUUFBZ0M7UUFDaEYsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsRUFBRSxPQUFPLEVBQUUsVUFBQyxDQUFDO1lBQ3BELFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFKZSxTQUFFLEtBSWpCLENBQUE7SUFFRCxtQkFBMEIsT0FBK0IsRUFBRSxRQUFnQztRQUN2RixNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsV0FBVyxDQUFDLEVBQUUsT0FBTyxFQUFFLFVBQUMsQ0FBQztZQUMxQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBSmUsZ0JBQVMsWUFJeEIsQ0FBQTtJQUVELGlCQUF3QixPQUErQixFQUFFLFFBQWdDO1FBQ3JGLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxTQUFTLENBQUMsRUFBRSxPQUFPLEVBQUUsVUFBQyxDQUFDO1lBQ3hDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFKZSxjQUFPLFVBSXRCLENBQUE7SUFFRCxlQUFzQixPQUErQixFQUFFLFFBQWdDO1FBQ25GLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxPQUFPLEVBQUUsVUFBQyxDQUFDO1lBQ3RDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFKZSxZQUFLLFFBSXBCLENBQUE7SUFJRDtRQUFvQixnQkFBZTthQUFmLFdBQWUsQ0FBZixzQkFBZSxDQUFmLElBQWU7WUFBZiwrQkFBZTs7UUFDL0IsSUFBSSxXQUFrQixFQUFFLFdBQWtCLENBQUM7UUFFM0MsSUFBSSxXQUFXLEdBQUcsVUFBQyxDQUFZO1lBQzNCLFdBQVcsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztZQUNuQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFDdkMsQ0FBQyxDQUFBO1FBRUQsSUFBSSxTQUFTLEdBQUcsVUFBQyxDQUFZLEVBQUUsUUFBMkI7WUFDdEQsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzlCLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDbkIsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNaLE1BQU0sQ0FBQztZQUNYLENBQUM7WUFFRCxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUM7WUFDdEQsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsV0FBVyxDQUFDO1lBRXRELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssR0FBRyxLQUFLLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDaEQsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUNuQixRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEIsQ0FBQztRQUNMLENBQUMsQ0FBQTtRQUVELElBQUksU0FBUyxHQUF3QixFQUFFLENBQUM7UUFFeEMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLFNBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLENBQUMsWUFBWSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ3RHLFNBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBQyxDQUFZO2dCQUN4RyxTQUFTLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDUixDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QixTQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxZQUFZLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUNuRixTQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLFVBQUMsQ0FBWTtnQkFDckYsU0FBUyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1IsQ0FBQztRQUNELE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDckIsQ0FBQztJQXRDZSxVQUFHLE1Bc0NsQixDQUFBO0lBRUQsZUFBZSxPQUFlLEVBQUUsU0FBZ0IsRUFBRSxRQUEyQjtRQUN6RSxJQUFJLFdBQWtCLEVBQUUsV0FBa0IsRUFBRSxTQUFnQixDQUFDO1FBQzdELElBQUksaUJBQW9DLENBQUM7UUFDekMsSUFBSSxpQkFBeUIsQ0FBQztRQUU5QixZQUFZLENBQUMsQ0FBQyxZQUFZLENBQUMsRUFBRSxPQUFPLEVBQUUsVUFBQyxDQUFZO1lBQy9DLFdBQVcsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztZQUNuQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7WUFDbkMsU0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDakMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDO1lBQzFCLGlCQUFpQixHQUFHLFlBQVksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxFQUFFLFFBQVEsRUFBRSxVQUFDLENBQVk7Z0JBQ25FLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsV0FBVyxDQUFDLENBQUM7Z0JBQ2hFLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsV0FBVyxDQUFDLENBQUM7Z0JBQ2hFLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxLQUFLLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQzlCLGlCQUFpQixHQUFHLElBQUksQ0FBQztnQkFDN0IsQ0FBQztnQkFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLEtBQUssSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDckMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDO2dCQUM5QixDQUFDO2dCQUNELEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLEdBQUcsU0FBUyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ3pDLGlCQUFpQixHQUFHLEtBQUssQ0FBQztnQkFDOUIsQ0FBQztnQkFDRCxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7b0JBQ3BCLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDdkIsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1YsQ0FBQyxDQUFDLENBQUM7UUFFSCxZQUFZLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxPQUFPLEVBQUUsVUFBQyxDQUFZO1lBQzdDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbkYsRUFBRSxDQUFDLENBQUMsV0FBVyxLQUFLLEtBQUssQ0FBQyxJQUFJLFdBQVcsS0FBSyxLQUFLLENBQUMsQ0FBQztnQkFBQyxNQUFNLENBQUM7WUFDN0QsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxTQUFTLEdBQUcsR0FBRyxDQUFDO2dCQUFDLE1BQU0sQ0FBQztZQUNuRCxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUM7WUFDdEQsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsV0FBVyxDQUFDO1lBQ3RELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzVELENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDbkIsRUFBRSxDQUFDLENBQUMsU0FBUyxLQUFLLE1BQU0sSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDcEMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNoQixDQUFDO2dCQUNELEVBQUUsQ0FBQyxDQUFDLFNBQVMsS0FBSyxPQUFPLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3JDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDaEIsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxtQkFBMEIsT0FBZSxFQUFFLFFBQTJCO1FBQ2xFLEtBQUssQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFGZSxnQkFBUyxZQUV4QixDQUFBO0lBRUQsb0JBQTJCLE9BQWUsRUFBRSxRQUEyQjtRQUNuRSxLQUFLLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBRmUsaUJBQVUsYUFFekIsQ0FBQTtJQUlEO1FBQXFCLGdCQUFlO2FBQWYsV0FBZSxDQUFmLHNCQUFlLENBQWYsSUFBZTtZQUFmLCtCQUFlOztRQUNoQyxJQUFJLFFBQVEsR0FBVyxLQUFLLENBQUM7UUFFN0IsSUFBSSxTQUFTLEdBQWtCLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXZELElBQUksV0FBVyxHQUFHLFVBQUMsQ0FBd0I7WUFDdkMsUUFBUSxHQUFHLElBQUksQ0FBQztZQUNoQixFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDakMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkIsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3ZCLENBQUM7WUFFRCxJQUFJLFNBQVMsR0FBd0IsRUFBRSxDQUFDO1lBRXhDLFNBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsRUFBRSxRQUFRLEVBQUUsVUFBQyxDQUF3QjtnQkFDckcsRUFBRSxDQUFDLENBQUMsUUFBUSxJQUFJLFNBQVMsQ0FBQyxRQUFRLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM1QyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN0QixDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ3ZCLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osU0FBUyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxVQUFDLENBQXdCO2dCQUNsRyxFQUFFLENBQUMsQ0FBQyxRQUFRLElBQUksU0FBUyxDQUFDLE9BQU8sS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzNDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3JCLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDdkIsQ0FBQztnQkFDRCxRQUFRLEdBQUcsS0FBSyxDQUFDO2dCQUNqQixlQUFlLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDL0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNSLENBQUMsQ0FBQTtRQUVELEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QixvQkFBb0IsQ0FBQyxDQUFDLFlBQVksRUFBRSxXQUFXLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ3pGLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLFlBQVksQ0FBQyxDQUFDLFlBQVksRUFBRSxXQUFXLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDdEUsQ0FBQztJQUNMLENBQUM7SUFuQ2UsV0FBSSxPQW1DbkIsQ0FBQTtJQUVELFNBQVM7SUFFVCxjQUFxQixPQUFlLEVBQUUsUUFBK0Q7UUFDakcsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLGFBQWEsQ0FBQyxFQUFFLE9BQU8sRUFBRSxVQUFDLENBQWE7WUFDeEQsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFKZSxXQUFJLE9BSW5CLENBQUE7SUFFRCxpQkFBd0IsT0FBZSxFQUFFLFFBQXNFO1FBQzNHLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLE9BQU8sRUFBRSxVQUFDLENBQWE7WUFDNUQsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFKZSxjQUFPLFVBSXRCLENBQUE7SUFFRCxnQkFBdUIsT0FBZSxFQUFFLFFBQXNFO1FBQzFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLE9BQU8sRUFBRSxVQUFDLENBQWE7WUFDM0QsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFKZSxhQUFNLFNBSXJCLENBQUE7SUFFRCxxQkFBNEIsT0FBZSxFQUFFLFFBQStEO1FBQ3hHLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLE9BQU8sRUFBRSxVQUFDLENBQWE7WUFDL0QsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFKZSxrQkFBVyxjQUkxQixDQUFBO0lBRUQsb0JBQTJCLE9BQWUsRUFBRSxRQUFzRDtRQUM5RixNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsb0JBQW9CLENBQUMsRUFBRSxPQUFPLEVBQUUsVUFBQyxDQUFhO1lBQy9ELFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdkIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBSmUsaUJBQVUsYUFJekIsQ0FBQTtJQUVELHNCQUE2QixPQUFlLEVBQUUsUUFBc0Q7UUFDaEcsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLHNCQUFzQixDQUFDLEVBQUUsT0FBTyxFQUFFLFVBQUMsQ0FBYTtZQUNqRSxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUplLG1CQUFZLGVBSTNCLENBQUE7SUFFRCx5QkFBZ0MsU0FBOEI7UUFDMUQsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFFBQVE7WUFDeEIsUUFBUSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM1RSxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFKZSxzQkFBZSxrQkFJOUIsQ0FBQTtBQUNMLENBQUMsRUE3UVMsTUFBTSxLQUFOLE1BQU0sUUE2UWY7QUFFRCxJQUFVLE9BQU8sQ0FnRGhCO0FBaERELFdBQVUsT0FBTyxFQUFDLENBQUM7SUFDZixjQUFxQixPQUFlLEVBQUUsSUFBK0M7UUFDakYsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxhQUFhLEVBQUU7WUFDakQsT0FBTyxFQUFFLEtBQUs7WUFDZCxVQUFVLEVBQUUsSUFBSTtZQUNoQixNQUFNLEVBQUUsSUFBSTtTQUNmLENBQUMsQ0FBQyxDQUFDO0lBQ1IsQ0FBQztJQU5lLFlBQUksT0FNbkIsQ0FBQTtJQUVELGlCQUF3QixPQUFlLEVBQUUsSUFBc0Q7UUFDM0YsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxpQkFBaUIsRUFBRTtZQUNyRCxPQUFPLEVBQUUsS0FBSztZQUNkLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLE1BQU0sRUFBRSxJQUFJO1NBQ2YsQ0FBQyxDQUFDLENBQUM7SUFDUixDQUFDO0lBTmUsZUFBTyxVQU10QixDQUFBO0lBRUQsZ0JBQXVCLE9BQWUsRUFBRSxJQUFzRDtRQUMxRixPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksV0FBVyxDQUFDLGdCQUFnQixFQUFFO1lBQ3BELE9BQU8sRUFBRSxLQUFLO1lBQ2QsVUFBVSxFQUFFLElBQUk7WUFDaEIsTUFBTSxFQUFFLElBQUk7U0FDZixDQUFDLENBQUMsQ0FBQztJQUNSLENBQUM7SUFOZSxjQUFNLFNBTXJCLENBQUE7SUFFRCxxQkFBNEIsT0FBZSxFQUFFLElBQStDO1FBQ3hGLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxXQUFXLENBQUMsb0JBQW9CLEVBQUU7WUFDeEQsT0FBTyxFQUFFLEtBQUs7WUFDZCxVQUFVLEVBQUUsSUFBSTtZQUNoQixNQUFNLEVBQUUsSUFBSTtTQUNmLENBQUMsQ0FBQyxDQUFDO0lBQ1IsQ0FBQztJQU5lLG1CQUFXLGNBTTFCLENBQUE7SUFFRCxvQkFBMkIsT0FBZSxFQUFFLElBQXNDO1FBQzlFLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxXQUFXLENBQUMsb0JBQW9CLEVBQUU7WUFDeEQsT0FBTyxFQUFFLEtBQUs7WUFDZCxVQUFVLEVBQUUsSUFBSTtZQUNoQixNQUFNLEVBQUUsSUFBSTtTQUNmLENBQUMsQ0FBQyxDQUFDO0lBQ1IsQ0FBQztJQU5lLGtCQUFVLGFBTXpCLENBQUE7SUFFRCxzQkFBNkIsT0FBZSxFQUFFLElBQXNDO1FBQ2hGLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxXQUFXLENBQUMsc0JBQXNCLEVBQUU7WUFDMUQsT0FBTyxFQUFFLEtBQUs7WUFDZCxVQUFVLEVBQUUsSUFBSTtZQUNoQixNQUFNLEVBQUUsSUFBSTtTQUNmLENBQUMsQ0FBQyxDQUFDO0lBQ1IsQ0FBQztJQU5lLG9CQUFZLGVBTTNCLENBQUE7QUFDTCxDQUFDLEVBaERTLE9BQU8sS0FBUCxPQUFPLFFBZ0RoQjtBQzdURDtJQUNJLG1CQUFvQixJQUFXO1FBQVgsU0FBSSxHQUFKLElBQUksQ0FBTztJQUFHLENBQUM7SUFDNUIsNkJBQVMsR0FBaEIsY0FBb0IsQ0FBQztJQUNkLDZCQUFTLEdBQWhCLGNBQW9CLENBQUM7SUFDZCx1Q0FBbUIsR0FBMUIsY0FBK0IsTUFBTSxDQUFDLEtBQUssQ0FBQSxDQUFDLENBQUM7SUFDdEMsNEJBQVEsR0FBZixjQUFvQixNQUFNLENBQUMsS0FBSyxDQUFBLENBQUMsQ0FBQztJQUMzQiw0QkFBUSxHQUFmLGNBQXlCLE1BQU0sQ0FBQyxJQUFJLENBQUEsQ0FBQyxDQUFDO0lBQy9CLDRCQUFRLEdBQWYsY0FBMkIsTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLE1BQUksSUFBSSxDQUFDLElBQUksTUFBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFELGlDQUFhLEdBQXBCLFVBQXFCLFVBQWtCLElBQWMsTUFBTSxDQUFDLElBQUksQ0FBQSxDQUFDLENBQUM7SUFDM0QsZ0NBQVksR0FBbkIsY0FBK0IsTUFBTSxDQUFDLENBQUMsQ0FBQSxDQUFDLENBQUM7SUFDbEMsNEJBQVEsR0FBZixjQUEwQixNQUFNLENBQUMsWUFBVSxDQUFBLENBQUMsQ0FBQztJQUN0QyxnQ0FBWSxHQUFuQixjQUFnQyxNQUFNLENBQUMsS0FBSyxDQUFBLENBQUMsQ0FBQztJQUN2Qyw0QkFBUSxHQUFmLGNBQTJCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFBLENBQUMsQ0FBQztJQUNqRCxnQkFBQztBQUFELENBYkEsQUFhQyxJQUFBO0FBRUQsSUFBSSxZQUFZLEdBQUcsQ0FBQztJQUNoQjtRQUF1Qiw0QkFBTTtRQUE3QjtZQUF1Qiw4QkFBTTtZQUVmLGVBQVUsR0FBVyxJQUFJLENBQUM7UUFjeEMsQ0FBQztRQVpVLDJCQUFRLEdBQWY7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQTtRQUNwQixDQUFDO1FBRU0sZ0NBQWEsR0FBcEIsVUFBcUIsVUFBa0I7WUFDbkMsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7WUFDN0IsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNoQixDQUFDO1FBRU0sK0JBQVksR0FBbkI7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUMzQixDQUFDO1FBQ0wsZUFBQztJQUFELENBaEJBLEFBZ0JDLENBaEJzQixNQUFNLEdBZ0I1QjtJQUVEO1FBQTRCLGlDQUFRO1FBQXBDO1lBQTRCLDhCQUFRO1FBdUNwQyxDQUFDO1FBdENVLGlDQUFTLEdBQWhCO1lBQ0ksSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN2RCxDQUFDO1FBRU0saUNBQVMsR0FBaEI7WUFDSSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3ZELENBQUM7UUFFTSwyQ0FBbUIsR0FBMUIsVUFBMkIsT0FBYztZQUNyQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsQyxDQUFDO1FBRU0sZ0NBQVEsR0FBZixVQUFnQixLQUFpQjtZQUM3QixFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO2dCQUN0QyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2hCLENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsRSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzNDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDaEIsQ0FBQztZQUNELE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDakIsQ0FBQztRQUVNLGdDQUFRLEdBQWY7WUFDSSxNQUFNLENBQUMsYUFBYSxDQUFDO1FBQ3pCLENBQUM7UUFFTSxvQ0FBWSxHQUFuQjtZQUNJLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDYixDQUFDO1FBRU0sZ0NBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyxZQUFVLENBQUM7UUFDdEIsQ0FBQztRQUVNLGdDQUFRLEdBQWY7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM5QyxDQUFDO1FBQ0wsb0JBQUM7SUFBRCxDQXZDQSxBQXVDQyxDQXZDMkIsUUFBUSxHQXVDbkM7SUFFRDtRQUEyQixnQ0FBYTtRQUF4QztZQUEyQiw4QkFBYTtRQXdCeEMsQ0FBQztRQXZCVSxtQ0FBWSxHQUFuQjtZQUNJLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDYixDQUFDO1FBRU0sK0JBQVEsR0FBZixVQUFnQixLQUFpQjtZQUM3QixFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO2dCQUN0QyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2hCLENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsRSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFLLENBQUMsUUFBUSxXQUFFLENBQUMsV0FBVyxFQUFFLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxDQUFDO2dCQUM5RCxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQVMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO2dCQUMxRCxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2hCLENBQUM7WUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2pCLENBQUM7UUFFTSwrQkFBUSxHQUFmO1lBQ0ksTUFBTSxDQUFDLGFBQWEsQ0FBQztRQUN6QixDQUFDO1FBRU0sK0JBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyxnQkFBSyxDQUFDLFFBQVEsV0FBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFDTCxtQkFBQztJQUFELENBeEJBLEFBd0JDLENBeEIwQixhQUFhLEdBd0J2QztJQUVEO1FBQTRCLGlDQUFRO1FBQXBDO1lBQTRCLDhCQUFRO1FBeURwQyxDQUFDO1FBeERhLGlDQUFTLEdBQW5CO1lBQ0ksTUFBTSxDQUFDLGdCQUFLLENBQUMsU0FBUyxXQUFFLENBQUM7UUFDN0IsQ0FBQztRQUVNLGlDQUFTLEdBQWhCO1lBQ0ksSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDbkMsRUFBRSxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztnQkFBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQ3RCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3hCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxHQUFHLEVBQUUsQ0FBQztnQkFDaEMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQyxDQUFDO1FBQ0wsQ0FBQztRQUVNLGlDQUFTLEdBQWhCO1lBQ0ksSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDbkMsRUFBRSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzVCLENBQUM7UUFFTSwyQ0FBbUIsR0FBMUIsVUFBMkIsT0FBYztZQUNyQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQUMsS0FBSztnQkFDdkMsTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLE1BQUksT0FBTyxRQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3hELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ04sRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbkIsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDaEMsQ0FBQztZQUNELE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDakIsQ0FBQztRQUVNLGdDQUFRLEdBQWYsVUFBZ0IsS0FBaUI7WUFDN0IsRUFBRSxDQUFDLENBQUMsT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDNUIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztnQkFDdEMsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNoQixDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbEUsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDMUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3hCLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDaEIsQ0FBQztZQUNELE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDakIsQ0FBQztRQUVNLGdDQUFRLEdBQWY7WUFDSSxNQUFNLENBQUMsSUFBSSxNQUFNLENBQUMsUUFBTSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDcEUsQ0FBQztRQUVNLG9DQUFZLEdBQW5CO1lBQ0ksTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDM0QsQ0FBQztRQUVNLGdDQUFRLEdBQWY7WUFDSSxNQUFNLENBQUMsYUFBVyxDQUFDO1FBQ3ZCLENBQUM7UUFFTSxnQ0FBUSxHQUFmO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUNMLG9CQUFDO0lBQUQsQ0F6REEsQUF5REMsQ0F6RDJCLFFBQVEsR0F5RG5DO0lBRUQ7UUFBNkIsa0NBQWE7UUFBMUM7WUFBNkIsOEJBQWE7UUFJMUMsQ0FBQztRQUhhLGtDQUFTLEdBQW5CO1lBQ0ksTUFBTSxDQUFDLGdCQUFLLENBQUMsY0FBYyxXQUFFLENBQUM7UUFDbEMsQ0FBQztRQUNMLHFCQUFDO0lBQUQsQ0FKQSxBQUlDLENBSjRCLGFBQWEsR0FJekM7SUFFRDtRQUFvQix5QkFBYTtRQUFqQztZQUFvQiw4QkFBYTtRQStCakMsQ0FBQztRQTlCVSw0QkFBWSxHQUFuQjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFFTSxtQ0FBbUIsR0FBMUIsVUFBMkIsT0FBYztZQUNyQyxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDNUIsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEtBQUssR0FBRyxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUMsQ0FBQztnQkFDekQsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbEMsQ0FBQztZQUNELE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDakIsQ0FBQztRQUVNLHdCQUFRLEdBQWYsVUFBZ0IsS0FBaUI7WUFDN0IsRUFBRSxDQUFDLENBQUMsT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDNUIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztnQkFDdEMsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNoQixDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbEUsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDNUMsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNoQixDQUFDO1lBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBRU0sd0JBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQztRQUNoQyxDQUFDO1FBRU0sd0JBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDakQsQ0FBQztRQUNMLFlBQUM7SUFBRCxDQS9CQSxBQStCQyxDQS9CbUIsYUFBYSxHQStCaEM7SUFFRDtRQUEwQiwrQkFBSztRQUEvQjtZQUEwQiw4QkFBSztRQWdCL0IsQ0FBQztRQWZVLHlDQUFtQixHQUExQixVQUEyQixPQUFjO1lBQ3JDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sS0FBSyxHQUFHLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxDQUFDO2dCQUN2RCxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNqQyxDQUFDO1lBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBRU0sOEJBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQztRQUNuQyxDQUFDO1FBRU0sOEJBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFLLENBQUMsUUFBUSxXQUFFLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBQ0wsa0JBQUM7SUFBRCxDQWhCQSxBQWdCQyxDQWhCeUIsS0FBSyxHQWdCOUI7SUFFRDtRQUEwQiwrQkFBUTtRQUFsQztZQUEwQiw4QkFBUTtRQStDbEMsQ0FBQztRQTlDVSwrQkFBUyxHQUFoQjtZQUNJLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ2xDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQy9DLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzNCLENBQUM7UUFFTSwrQkFBUyxHQUFoQjtZQUNJLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ2xDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQy9DLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzNCLENBQUM7UUFFTSx5Q0FBbUIsR0FBMUIsVUFBMkIsT0FBYztZQUNyQyxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDNUIsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEtBQUssR0FBRyxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUMsQ0FBQztnQkFDekQsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbEMsQ0FBQztZQUNELE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDakIsQ0FBQztRQUVNLDhCQUFRLEdBQWYsVUFBZ0IsS0FBaUI7WUFDN0IsRUFBRSxDQUFDLENBQUMsT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDNUIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztnQkFDdEMsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNoQixDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLFFBQVEsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2SCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDaEIsQ0FBQztZQUNELE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDakIsQ0FBQztRQUVNLDhCQUFRLEdBQWY7WUFDSSxNQUFNLENBQUMsK0JBQStCLENBQUM7UUFDM0MsQ0FBQztRQUVNLGtDQUFZLEdBQW5CO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3BGLENBQUM7UUFFTSw4QkFBUSxHQUFmO1lBQ0ksTUFBTSxDQUFDLFlBQVUsQ0FBQztRQUN0QixDQUFDO1FBRU0sOEJBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzFDLENBQUM7UUFDTCxrQkFBQztJQUFELENBL0NBLEFBK0NDLENBL0N5QixRQUFRLEdBK0NqQztJQUVEO1FBQXlCLDhCQUFXO1FBQXBDO1lBQXlCLDhCQUFXO1FBZ0JwQyxDQUFDO1FBZlUsd0NBQW1CLEdBQTFCLFVBQTJCLE9BQWM7WUFDckMsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxLQUFLLEdBQUcsR0FBRyxHQUFHLEdBQUcsT0FBTyxDQUFDLENBQUM7Z0JBQ3ZELE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2pDLENBQUM7WUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2pCLENBQUM7UUFFTSw2QkFBUSxHQUFmO1lBQ0ksTUFBTSxDQUFDLGtDQUFrQyxDQUFDO1FBQzlDLENBQUM7UUFFTSw2QkFBUSxHQUFmO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ3pDLENBQUM7UUFDTCxpQkFBQztJQUFELENBaEJBLEFBZ0JDLENBaEJ3QixXQUFXLEdBZ0JuQztJQUVEO1FBQTBCLCtCQUFXO1FBQXJDO1lBQTBCLDhCQUFXO1FBY3JDLENBQUM7UUFiVSw4QkFBUSxHQUFmO1lBQ0ksTUFBTSxDQUFDLHdEQUF3RCxDQUFDO1FBQ3BFLENBQUM7UUFFTSw4QkFBUSxHQUFmO1lBQ0ksSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUMvQixJQUFJLENBQUMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ2xCLElBQUksQ0FBQyxHQUFHLElBQUksR0FBRyxHQUFHLENBQUM7WUFDbkIsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQzVDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFBQyxNQUFNLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztZQUM1QyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7WUFDNUMsTUFBTSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDdkIsQ0FBQztRQUNMLGtCQUFDO0lBQUQsQ0FkQSxBQWNDLENBZHlCLFdBQVcsR0FjcEM7SUFFRDtRQUEwQiwrQkFBUTtRQUFsQztZQUEwQiw4QkFBUTtRQXNEbEMsQ0FBQztRQXJEYSw2QkFBTyxHQUFqQjtZQUNJLE1BQU0sQ0FBQyxnQkFBSyxDQUFDLE9BQU8sV0FBRSxDQUFDO1FBQzNCLENBQUM7UUFFTSwrQkFBUyxHQUFoQjtZQUNJLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ2pDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztZQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFDdEUsQ0FBQztRQUVNLCtCQUFTLEdBQWhCO1lBQ0ksSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDakMsRUFBRSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQztRQUN0RSxDQUFDO1FBRU0seUNBQW1CLEdBQTFCLFVBQTJCLE9BQWM7WUFDckMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFDLEdBQUc7Z0JBQ2hDLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxNQUFJLE9BQU8sUUFBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN2RCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNOLEVBQUUsQ0FBQyxDQUFDLEdBQUcsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzlCLENBQUM7WUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2pCLENBQUM7UUFFTSw4QkFBUSxHQUFmLFVBQWdCLEtBQWlCO1lBQzdCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7Z0JBQ3RDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDaEIsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xFLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3hDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDbEUsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNoQixDQUFDO1lBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBRU0sOEJBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxRQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNsRSxDQUFDO1FBRU0sa0NBQVksR0FBbkI7WUFDSSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUVNLDhCQUFRLEdBQWY7WUFDSSxNQUFNLENBQUMsWUFBVSxDQUFDO1FBQ3RCLENBQUM7UUFFTSw4QkFBUSxHQUFmO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUNMLGtCQUFDO0lBQUQsQ0F0REEsQUFzREMsQ0F0RHlCLFFBQVEsR0FzRGpDO0lBRUQ7UUFBMkIsZ0NBQVc7UUFBdEM7WUFBMkIsOEJBQVc7UUFJdEMsQ0FBQztRQUhhLDhCQUFPLEdBQWpCO1lBQ0ksTUFBTSxDQUFDLGdCQUFLLENBQUMsWUFBWSxXQUFFLENBQUM7UUFDaEMsQ0FBQztRQUNMLG1CQUFDO0lBQUQsQ0FKQSxBQUlDLENBSjBCLFdBQVcsR0FJckM7SUFFRDtRQUFpQyxzQ0FBUTtRQUF6QztZQUFpQyw4QkFBUTtRQW1EekMsQ0FBQztRQWxEVSxzQ0FBUyxHQUFoQjtZQUNJLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ25DLEVBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7Z0JBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztZQUN0QixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM1QixDQUFDO1FBRU0sc0NBQVMsR0FBaEI7WUFDSSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNuQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7WUFDdEIsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDeEIsK0JBQStCO1lBQy9CLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDL0IsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLENBQUM7UUFDTCxDQUFDO1FBRU0sZ0RBQW1CLEdBQTFCLFVBQTJCLE9BQWM7WUFDckMsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQy9CLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2pDLENBQUM7WUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2pCLENBQUM7UUFFTSxxQ0FBUSxHQUFmLFVBQWdCLEtBQWlCO1lBQzdCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7Z0JBQ3RDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDaEIsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xFLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDeEMsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNoQixDQUFDO1lBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBRU0seUNBQVksR0FBbkI7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM1QyxDQUFDO1FBRU0scUNBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyxZQUFVLENBQUM7UUFDdEIsQ0FBQztRQUVNLHFDQUFRLEdBQWY7WUFDSSxNQUFNLENBQUMsMkJBQTJCLENBQUM7UUFDdkMsQ0FBQztRQUVNLHFDQUFRLEdBQWY7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDMUMsQ0FBQztRQUNMLHlCQUFDO0lBQUQsQ0FuREEsQUFtREMsQ0FuRGdDLFFBQVEsR0FtRHhDO0lBRUQ7UUFBMkIsZ0NBQWtCO1FBQTdDO1lBQTJCLDhCQUFrQjtRQWdCN0MsQ0FBQztRQWZVLDBDQUFtQixHQUExQixVQUEyQixPQUFjO1lBQ3JDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNqQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNsQyxDQUFDO1lBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBRU0sK0JBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQztRQUNwQyxDQUFDO1FBRU0sK0JBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzNDLENBQUM7UUFDTCxtQkFBQztJQUFELENBaEJBLEFBZ0JDLENBaEIwQixrQkFBa0IsR0FnQjVDO0lBRUQ7UUFBeUIsOEJBQWtCO1FBQTNDO1lBQXlCLDhCQUFrQjtRQStCM0MsQ0FBQztRQTlCVSx3Q0FBbUIsR0FBMUIsVUFBMkIsT0FBYztZQUNyQyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sS0FBSyxHQUFHLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZELE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFFTSw2QkFBUSxHQUFmLFVBQWdCLEtBQWlCO1lBQzdCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7Z0JBQ3RDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDaEIsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xFLElBQUksR0FBRyxHQUFHLFFBQVEsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQzlCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxJQUFJLEdBQUcsS0FBSyxFQUFFLENBQUM7b0JBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDckQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLElBQUksR0FBRyxLQUFLLEVBQUUsQ0FBQztvQkFBQyxHQUFHLElBQUksRUFBRSxDQUFDO2dCQUN2RCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDeEIsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNoQixDQUFDO1lBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBRU0sNkJBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQztRQUNqQyxDQUFDO1FBRU0saUNBQVksR0FBbkI7WUFDSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNyRCxDQUFDO1FBRU0sNkJBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUNMLGlCQUFDO0lBQUQsQ0EvQkEsQUErQkMsQ0EvQndCLGtCQUFrQixHQStCMUM7SUFFRDtRQUFtQix3QkFBVTtRQUE3QjtZQUFtQiw4QkFBVTtRQWE3QixDQUFDO1FBWlUsa0NBQW1CLEdBQTFCLFVBQTJCLE9BQWM7WUFDckMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEtBQUssR0FBRyxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUMsQ0FBQztZQUN6RCxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsQyxDQUFDO1FBRU0sdUJBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQztRQUM5QixDQUFDO1FBRU0sdUJBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFLLENBQUMsUUFBUSxXQUFFLENBQUMsQ0FBQztRQUN2QyxDQUFDO1FBQ0wsV0FBQztJQUFELENBYkEsQUFhQyxDQWJrQixVQUFVLEdBYTVCO0lBRUQ7UUFBMkIsZ0NBQVE7UUFBbkM7WUFBMkIsOEJBQVE7UUEyQ25DLENBQUM7UUExQ1UsZ0NBQVMsR0FBaEI7WUFDSSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNyQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO2dCQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDdEIsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDOUIsQ0FBQztRQUVNLGdDQUFTLEdBQWhCO1lBQ0ksSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDckMsRUFBRSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzlCLENBQUM7UUFFTSwwQ0FBbUIsR0FBMUIsVUFBMkIsT0FBYztZQUNyQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUVNLCtCQUFRLEdBQWYsVUFBZ0IsS0FBaUI7WUFDN0IsRUFBRSxDQUFDLENBQUMsT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDNUIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztnQkFDdEMsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNoQixDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbEUsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUMxQyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2hCLENBQUM7WUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2pCLENBQUM7UUFFTSwrQkFBUSxHQUFmO1lBQ0ksTUFBTSxDQUFDLGNBQWMsQ0FBQztRQUMxQixDQUFDO1FBRU0sbUNBQVksR0FBbkI7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM5QyxDQUFDO1FBRU0sK0JBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyxjQUFZLENBQUM7UUFDeEIsQ0FBQztRQUVNLCtCQUFRLEdBQWY7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUNMLG1CQUFDO0lBQUQsQ0EzQ0EsQUEyQ0MsQ0EzQzBCLFFBQVEsR0EyQ2xDO0lBRUQ7UUFBcUIsMEJBQVk7UUFBakM7WUFBcUIsOEJBQVk7UUFZakMsQ0FBQztRQVhVLG9DQUFtQixHQUExQixVQUEyQixPQUFjO1lBQ3JDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUM3QyxDQUFDO1FBRU0seUJBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyxlQUFlLENBQUM7UUFDM0IsQ0FBQztRQUVNLHlCQUFRLEdBQWY7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM3QyxDQUFDO1FBQ0wsYUFBQztJQUFELENBWkEsQUFZQyxDQVpvQixZQUFZLEdBWWhDO0lBRUQ7UUFBMkIsZ0NBQVE7UUFBbkM7WUFBMkIsOEJBQVE7UUEyQ25DLENBQUM7UUExQ1UsZ0NBQVMsR0FBaEI7WUFDSSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNyQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO2dCQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDdEIsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDOUIsQ0FBQztRQUVNLGdDQUFTLEdBQWhCO1lBQ0ksSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDckMsRUFBRSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzlCLENBQUM7UUFFTSwwQ0FBbUIsR0FBMUIsVUFBMkIsT0FBYztZQUNyQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUVNLCtCQUFRLEdBQWYsVUFBZ0IsS0FBaUI7WUFDN0IsRUFBRSxDQUFDLENBQUMsT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDNUIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztnQkFDdEMsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNoQixDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbEUsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUMxQyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2hCLENBQUM7WUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2pCLENBQUM7UUFFTSwrQkFBUSxHQUFmO1lBQ0ksTUFBTSxDQUFDLGNBQWMsQ0FBQztRQUMxQixDQUFDO1FBRU0sbUNBQVksR0FBbkI7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM5QyxDQUFDO1FBRU0sK0JBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyxjQUFZLENBQUM7UUFDeEIsQ0FBQztRQUVNLCtCQUFRLEdBQWY7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUNMLG1CQUFDO0lBQUQsQ0EzQ0EsQUEyQ0MsQ0EzQzBCLFFBQVEsR0EyQ2xDO0lBRUQ7UUFBcUIsMEJBQVk7UUFBakM7WUFBcUIsOEJBQVk7UUFhakMsQ0FBQztRQVpVLG9DQUFtQixHQUExQixVQUEyQixPQUFjO1lBQ3JDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUM3QyxDQUFDO1FBRU0seUJBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyxlQUFlLENBQUM7UUFDM0IsQ0FBQztRQUVNLHlCQUFRLEdBQWY7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM3QyxDQUFDO1FBRUwsYUFBQztJQUFELENBYkEsQUFhQyxDQWJvQixZQUFZLEdBYWhDO0lBRUQ7UUFBZ0MscUNBQVE7UUFBeEM7WUFBZ0MsOEJBQVE7UUFrRHhDLENBQUM7UUFqRFUscUNBQVMsR0FBaEI7WUFDSSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQztZQUNwQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO2dCQUFDLEdBQUcsSUFBSSxFQUFFLENBQUM7WUFDeEIsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDNUIsQ0FBQztRQUVNLHFDQUFTLEdBQWhCO1lBQ0ksSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUM7WUFDcEMsRUFBRSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFBQyxHQUFHLElBQUksRUFBRSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzVCLENBQUM7UUFFTSwrQ0FBbUIsR0FBMUIsVUFBMkIsT0FBYztZQUNyQyxFQUFFLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNuQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQztZQUMzRCxDQUFDO1lBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBRU0sb0NBQVEsR0FBZixVQUFnQixLQUFpQjtZQUM3QixFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO2dCQUN0QyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2hCLENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsRSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDNUQsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztnQkFDbEQsQ0FBQztnQkFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ25FLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7Z0JBQ2xELENBQUM7Z0JBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNoQixDQUFDO1lBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBRU0sb0NBQVEsR0FBZjtZQUNJLE1BQU0sQ0FBQyxZQUFVLENBQUM7UUFDdEIsQ0FBQztRQUVNLHdDQUFZLEdBQW5CO1lBQ0ksTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNiLENBQUM7UUFFTSxvQ0FBUSxHQUFmO1lBQ0ksTUFBTSxDQUFDLGdCQUFnQixDQUFDO1FBQzVCLENBQUM7UUFFTSxvQ0FBUSxHQUFmO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3JELENBQUM7UUFDTCx3QkFBQztJQUFELENBbERBLEFBa0RDLENBbEQrQixRQUFRLEdBa0R2QztJQUVEO1FBQWdDLHFDQUFpQjtRQUFqRDtZQUFnQyw4QkFBaUI7UUFJakQsQ0FBQztRQUhVLG9DQUFRLEdBQWY7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkMsQ0FBQztRQUNMLHdCQUFDO0lBQUQsQ0FKQSxBQUlDLENBSitCLGlCQUFpQixHQUloRDtJQUVELElBQUksWUFBWSxHQUEwQyxFQUFFLENBQUM7SUFFN0QsWUFBWSxDQUFDLE1BQU0sQ0FBQyxHQUFHLGFBQWEsQ0FBQztJQUNyQyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsWUFBWSxDQUFDO0lBQ2xDLFlBQVksQ0FBQyxNQUFNLENBQUMsR0FBRyxhQUFhLENBQUM7SUFDckMsWUFBWSxDQUFDLEtBQUssQ0FBQyxHQUFHLGNBQWMsQ0FBQztJQUNyQyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsV0FBVyxDQUFDO0lBQ2pDLFlBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7SUFDMUIsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLFVBQVUsQ0FBQztJQUNoQyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsV0FBVyxDQUFDO0lBQ2pDLFlBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxXQUFXLENBQUM7SUFDaEMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxHQUFHLFdBQVcsQ0FBQztJQUNuQyxZQUFZLENBQUMsS0FBSyxDQUFDLEdBQUcsWUFBWSxDQUFDO0lBQ25DLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxrQkFBa0IsQ0FBQztJQUN4QyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsVUFBVSxDQUFDO0lBQ2hDLFlBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxZQUFZLENBQUM7SUFDakMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztJQUN6QixZQUFZLENBQUMsR0FBRyxDQUFDLEdBQUcsaUJBQWlCLENBQUM7SUFDdEMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxHQUFHLGlCQUFpQixDQUFDO0lBQ3RDLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxZQUFZLENBQUM7SUFDbEMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQztJQUMzQixZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsWUFBWSxDQUFDO0lBQ2xDLFlBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUM7SUFFM0IsTUFBTSxDQUFDLFlBQVksQ0FBQztBQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDO0FDenJCTDtJQVNJLGVBQW1CLE9BQXlCO1FBVGhELGlCQTJMQztRQWxMc0IsWUFBTyxHQUFQLE9BQU8sQ0FBa0I7UUFOcEMsZUFBVSxHQUFXLEVBQUUsQ0FBQztRQU81QixJQUFJLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9CLElBQUksaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUIsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUUzQixNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLEtBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBM0MsQ0FBMkMsQ0FBQyxDQUFDO0lBQ3BGLENBQUM7SUFFTSx5QkFBUyxHQUFoQjtRQUNJLElBQUksTUFBTSxHQUFXLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFFBQVE7WUFDNUIsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUN4RSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ3JDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVNLDZCQUFhLEdBQXBCO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDM0IsQ0FBQztJQUVNLDZCQUFhLEdBQXBCLFVBQXFCLFNBQWdCO1FBQ2pDLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1FBRTVCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0IsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDaEMsQ0FBQztJQUNMLENBQUM7SUFFTSxvQ0FBb0IsR0FBM0I7UUFDSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3RCxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLENBQUM7WUFFL0MsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDakUsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7Z0JBQ3JCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztZQUM3RCxDQUFDO1lBRUQsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUN2QixJQUFJLEVBQUUsT0FBTztnQkFDYixLQUFLLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRTthQUMxQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25ELENBQUM7SUFDTCxDQUFDO0lBRU0sMENBQTBCLEdBQWpDO1FBQ0ksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzdDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQ2pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDbEIsQ0FBQztJQUVNLHlDQUF5QixHQUFoQztRQUNJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDbEQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDakMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakMsQ0FBQztRQUNELE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNsQixDQUFDO0lBRU0seUNBQXlCLEdBQWhDO1FBQ0ksSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDdEQsT0FBTyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2pDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQ2pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDO0lBQ2pDLENBQUM7SUFFTSw2Q0FBNkIsR0FBcEM7UUFDSSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUN0RCxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQ2QsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDakMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakMsQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7SUFDakMsQ0FBQztJQUVNLDRDQUE0QixHQUFuQyxVQUFvQyxhQUFxQjtRQUNyRCxJQUFJLFFBQVEsR0FBVSxNQUFNLENBQUMsU0FBUyxDQUFDO1FBQ3ZDLElBQUksZUFBeUIsQ0FBQztRQUM5QixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7UUFFZCxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDN0MsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVqQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUMxQixJQUFJLFFBQVEsR0FBRyxhQUFhLEdBQUcsS0FBSyxDQUFDO2dCQUNyQyxJQUFJLFNBQVMsR0FBRyxhQUFhLEdBQUcsQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUVyRSxFQUFFLENBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7b0JBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztnQkFFbkQsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDMUQsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0JBQ2hCLGVBQWUsR0FBRyxRQUFRLENBQUM7b0JBQzNCLFFBQVEsR0FBRyxDQUFDLENBQUM7Z0JBQ2pCLENBQUM7WUFDTCxDQUFDO1lBRUQsS0FBSyxJQUFJLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxNQUFNLENBQUM7UUFDeEMsQ0FBQztRQUVELE1BQU0sQ0FBQyxlQUFlLENBQUM7SUFDM0IsQ0FBQztJQUVNLG1DQUFtQixHQUExQixVQUEyQixRQUFrQjtRQUN6QyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNyQyxJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztZQUNyQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsUUFBUSxDQUFDO1FBQ3JDLENBQUM7SUFDTCxDQUFDO0lBRU0sbUNBQW1CLEdBQTFCO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztJQUNqQyxDQUFDO0lBRU0sNkJBQWEsR0FBcEIsVUFBcUIsT0FBZ0I7UUFDakMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFFdkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFFL0IsSUFBSSxNQUFNLEdBQVUsR0FBRyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQUMsUUFBUTtZQUM1QixNQUFNLElBQUksTUFBSSxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsTUFBRyxDQUFDO1FBQzVELENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRTFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFTSwwQkFBVSxHQUFqQjtRQUNJLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNwQixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFFBQVE7WUFDNUIsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxLQUFLLEtBQUssQ0FBQyxDQUFDO2dCQUFDLE1BQU0sQ0FBQztZQUMzQyxVQUFVLElBQUksUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3RDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDO1FBRWhDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsS0FBSyxLQUFLLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQztRQUU3QyxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7UUFFZCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDVixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDakQsS0FBSyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxNQUFNLENBQUM7UUFDbkQsQ0FBQztRQUVELElBQUksR0FBRyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxDQUFDO1FBRTFELElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFTSwyQkFBVyxHQUFsQixVQUFtQixJQUFTLEVBQUUsS0FBVyxFQUFFLE1BQWU7UUFBMUQsaUJBWUM7UUFYRyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFFBQVE7WUFDNUIsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDO2dCQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDcEMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxLQUFLLEtBQUs7Z0JBQzdCLEtBQUksQ0FBQyxtQkFBbUIsRUFBRSxLQUFLLEtBQUssQ0FBQztnQkFDckMsS0FBSyxLQUFLLEtBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDbEQsS0FBSSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBRU0saUNBQWlCLEdBQXhCO1FBQ0ksT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQzlCLElBQUksRUFBRSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxRQUFRLEVBQUU7WUFDM0MsS0FBSyxFQUFFLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLFFBQVEsRUFBRTtTQUMvQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUwsWUFBQztBQUFELENBM0xBLEFBMkxDLElBQUE7QUNyTEQ7SUFJSSw4QkFBb0IsS0FBVztRQUpuQyxpQkEwSkM7UUF0SnVCLFVBQUssR0FBTCxLQUFLLENBQU07UUFIdkIsaUJBQVksR0FBRyxLQUFLLENBQUM7UUFDckIsWUFBTyxHQUFHLEtBQUssQ0FBQztRQVFoQixVQUFLLEdBQUc7WUFDWixFQUFFLENBQUMsQ0FBQyxLQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDZixJQUFJLEtBQUssR0FBRyxLQUFJLENBQUMsS0FBSyxDQUFDLDBCQUEwQixFQUFFLENBQUM7Z0JBQ3BELEtBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3RDLFVBQVUsQ0FBQztvQkFDUixLQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBQ2xDLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztnQkFDM0IsSUFBSSxJQUFJLEdBQUcsS0FBSSxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO2dCQUNsRCxLQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNyQyxVQUFVLENBQUM7b0JBQ1IsS0FBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2dCQUNsQyxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUM7UUFDTCxDQUFDLENBQUE7UUFuQkcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsVUFBQyxDQUFDLElBQUssT0FBQSxLQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFmLENBQWUsQ0FBQyxDQUFDO1FBQ2xFLEtBQUssQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLGNBQU0sT0FBQSxLQUFJLENBQUMsS0FBSyxFQUFFLEVBQVosQ0FBWSxDQUFDLENBQUM7UUFDNUQsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLEtBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEVBQXZCLENBQXVCLENBQUMsQ0FBQztJQUN6RSxDQUFDO0lBa0JPLDhDQUFlLEdBQXZCLFVBQXdCLENBQWU7UUFBdkMsaUJBVUM7UUFURyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxPQUFPLEtBQUssV0FBTyxDQUFDLENBQUMsQ0FBQztZQUN0QyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztRQUM3QixDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEtBQUssV0FBTyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUN4QixDQUFDO1FBQ0QsVUFBVSxDQUFDO1lBQ1AsS0FBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7WUFDMUIsS0FBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFDekIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8sc0NBQU8sR0FBZixVQUFnQixDQUFlO1FBQzNCLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFDckIsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsSUFBSSxJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztZQUM1QixJQUFJLElBQUksRUFBRSxDQUFDO1FBQ2YsQ0FBQztRQUdELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLGFBQVEsSUFBSSxJQUFJLEtBQUssWUFBTyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQztZQUFDLE1BQU0sQ0FBQztRQUNsRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxhQUFRLElBQUksSUFBSSxLQUFLLGNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUM7WUFBQyxNQUFNLENBQUM7UUFDcEUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssVUFBSyxJQUFJLElBQUksS0FBSyxVQUFLLElBQUksSUFBSSxLQUFLLFVBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUM7WUFBQyxNQUFNLENBQUM7UUFFOUUsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDO1FBRTFCLEVBQUUsQ0FBQyxDQUFDLElBQUksS0FBSyxhQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNoQixDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksS0FBSyxZQUFPLENBQUMsQ0FBQyxDQUFDO1lBQzFCLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNmLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxLQUFLLGFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2hCLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxLQUFLLGNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDNUIsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2pCLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxLQUFLLFdBQU8sSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUN4QyxjQUFjLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3JDLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxLQUFLLFdBQU8sQ0FBQyxDQUFDLENBQUM7WUFDMUIsY0FBYyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNoQyxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksS0FBSyxXQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUNkLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxLQUFLLGFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2hCLENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN2QixDQUFDO1FBRUQsSUFBSSxVQUFVLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQyxFQUFFLENBQUMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuQyxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQzVDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksS0FBSyxpQkFBYSxDQUFDLENBQUMsQ0FBQztZQUNoQyxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQzVDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDckIsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDakMsQ0FBQztJQUVMLENBQUM7SUFFTyxtQ0FBSSxHQUFaO1FBQ0ksSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQywwQkFBMEIsRUFBRSxDQUFDO1FBQ3BELElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQ25DLENBQUM7SUFFTyxrQ0FBRyxHQUFYO1FBQ0ksSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO1FBQ2xELElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckMsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQ25DLENBQUM7SUFFTyxtQ0FBSSxHQUFaO1FBQ0ksSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsRUFBRSxDQUFDO1FBQzFELElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQ25DLENBQUM7SUFFTyxvQ0FBSyxHQUFiO1FBQ0ksSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO1FBQ2xELElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckMsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQ25DLENBQUM7SUFFTyx1Q0FBUSxHQUFoQjtRQUNJLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsNkJBQTZCLEVBQUUsQ0FBQztRQUMxRCxFQUFFLENBQUMsQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNoRCxJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3pDLElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUMvQixNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFTyxrQ0FBRyxHQUFYO1FBQ0ksSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO1FBQ2xELEVBQUUsQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzVDLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDckMsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQy9CLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUNELE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFFakIsQ0FBQztJQUVPLGlDQUFFLEdBQVY7UUFDSSxJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixFQUFFLENBQUMsU0FBUyxFQUFFLENBQUM7UUFFN0MsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3hELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUV2RCxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFO1lBQzdCLElBQUksRUFBRSxJQUFJO1lBQ1YsS0FBSyxFQUFFLEtBQUs7U0FDZixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8sbUNBQUksR0FBWjtRQUNJLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUU3QyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDeEQsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRXZELE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUU7WUFDN0IsSUFBSSxFQUFFLElBQUk7WUFDVixLQUFLLEVBQUUsS0FBSztTQUNmLENBQUMsQ0FBQztJQUNQLENBQUM7SUFDTCwyQkFBQztBQUFELENBMUpBLEFBMEpDLElBQUE7QUNoS0Q7SUFDSSwyQkFBb0IsS0FBVztRQURuQyxpQkEyQ0M7UUExQ3VCLFVBQUssR0FBTCxLQUFLLENBQU07UUFzQnZCLFlBQU8sR0FBRztZQUNkLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSSxDQUFDLElBQUksQ0FBQztnQkFBQyxNQUFNLENBQUM7WUFDdkIsS0FBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7WUFFbEIsSUFBSSxHQUFVLENBQUM7WUFFZixFQUFFLENBQUMsQ0FBQyxLQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEtBQUssS0FBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hELEdBQUcsR0FBRyxLQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUM7WUFDMUMsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLEdBQUcsR0FBRyxLQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUM7WUFDNUMsQ0FBQztZQUVELElBQUksS0FBSyxHQUFHLEtBQUksQ0FBQyxLQUFLLENBQUMsNEJBQTRCLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFekQsS0FBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUV0QyxFQUFFLENBQUMsQ0FBQyxLQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEdBQUcsQ0FBQyxJQUFJLEtBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxLQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDN0csS0FBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQ25DLENBQUM7UUFDTCxDQUFDLENBQUM7UUF4Q0UsTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLGNBQU0sT0FBQSxLQUFJLENBQUMsU0FBUyxFQUFFLEVBQWhCLENBQWdCLENBQUMsQ0FBQztRQUN4RCxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxjQUFNLE9BQUEsS0FBSSxDQUFDLE9BQU8sRUFBRSxFQUFkLENBQWMsQ0FBQyxDQUFDO1FBRS9DLGVBQWU7UUFDZixLQUFLLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLENBQUMsQ0FBQyxjQUFjLEVBQUUsRUFBbEIsQ0FBa0IsQ0FBQyxDQUFDO1FBQ3ZFLEtBQUssQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsQ0FBQyxDQUFDLGNBQWMsRUFBRSxFQUFsQixDQUFrQixDQUFDLENBQUM7UUFDdEUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsVUFBQyxDQUFDLElBQUssT0FBQSxDQUFDLENBQUMsY0FBYyxFQUFFLEVBQWxCLENBQWtCLENBQUMsQ0FBQztRQUNsRSxLQUFLLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLENBQUMsQ0FBQyxjQUFjLEVBQUUsRUFBbEIsQ0FBa0IsQ0FBQyxDQUFDO0lBQ3JFLENBQUM7SUFLTyxxQ0FBUyxHQUFqQjtRQUFBLGlCQU1DO1FBTEcsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNyRCxVQUFVLENBQUM7WUFDUixLQUFJLENBQUMsVUFBVSxHQUFHLEtBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQztRQUN2RCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFzQkwsd0JBQUM7QUFBRCxDQTNDQSxBQTJDQyxJQUFBO0FDM0NEO0lBQUE7SUFtRUEsQ0FBQztJQWxFaUIsWUFBSyxHQUFuQixVQUFvQixNQUFhO1FBQzdCLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNwQixJQUFJLFNBQVMsR0FBZSxFQUFFLENBQUM7UUFFL0IsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsSUFBSSxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7UUFFN0IsSUFBSSxhQUFhLEdBQUc7WUFDaEIsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4QixTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUMvRCxVQUFVLEdBQUcsRUFBRSxDQUFDO1lBQ3BCLENBQUM7UUFDTCxDQUFDLENBQUE7UUFFRCxPQUFPLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDM0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDN0MsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO2dCQUN4QixLQUFLLEVBQUUsQ0FBQztnQkFDUixRQUFRLENBQUM7WUFDYixDQUFDO1lBRUQsRUFBRSxDQUFDLENBQUMsZ0JBQWdCLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQzVDLGdCQUFnQixHQUFHLEtBQUssQ0FBQztnQkFDekIsS0FBSyxFQUFFLENBQUM7Z0JBQ1IsUUFBUSxDQUFDO1lBQ2IsQ0FBQztZQUVELEVBQUUsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztnQkFDbkIsVUFBVSxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDNUIsS0FBSyxFQUFFLENBQUM7Z0JBQ1IsUUFBUSxDQUFDO1lBQ2IsQ0FBQztZQUVELElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztZQUVsQixHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxZQUFZLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBSSxJQUFJLE1BQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDNUMsYUFBYSxFQUFFLENBQUM7b0JBQ2hCLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDOUQsS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO29CQUN6QixLQUFLLEdBQUcsSUFBSSxDQUFDO29CQUNiLEtBQUssQ0FBQztnQkFDVixDQUFDO2dCQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM1QyxhQUFhLEVBQUUsQ0FBQztvQkFDaEIsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3pDLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDO29CQUNyQixLQUFLLEdBQUcsSUFBSSxDQUFDO29CQUNiLEtBQUssQ0FBQztnQkFDVixDQUFDO1lBQ0wsQ0FBQztZQUVELEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDVCxVQUFVLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUM1QixLQUFLLEVBQUUsQ0FBQztZQUNaLENBQUM7UUFFTCxDQUFDO1FBRUQsYUFBYSxFQUFFLENBQUM7UUFFaEIsTUFBTSxDQUFDLFNBQVMsQ0FBQztJQUNyQixDQUFDO0lBRWMsYUFBTSxHQUFyQixVQUF1QixHQUFVLEVBQUUsS0FBWSxFQUFFLE1BQWE7UUFDMUQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssTUFBTSxDQUFDO0lBQzlELENBQUM7SUFDTCxhQUFDO0FBQUQsQ0FuRUEsQUFtRUMsSUFBQTtBQ25FRDtJQUNJLDBCQUFvQixLQUFXO1FBRG5DLGlCQTBDQztRQXpDdUIsVUFBSyxHQUFMLEtBQUssQ0FBTTtRQUMzQixNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsY0FBTSxPQUFBLEtBQUksQ0FBQyxLQUFLLEVBQUUsRUFBWixDQUFZLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRU8sZ0NBQUssR0FBYjtRQUFBLGlCQW9DQztRQW5DRyxJQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFDN0MsVUFBVSxDQUFDO1lBQ1IsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNwRCxLQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsYUFBYSxDQUFDO2dCQUN6QyxNQUFNLENBQUM7WUFDWCxDQUFDO1lBRUQsSUFBSSxPQUFPLEdBQUcsS0FBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRTFELElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQztZQUNuQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUNuRCxJQUFJLFFBQVEsR0FBRyxLQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFdkMsSUFBSSxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBRXRFLElBQUksR0FBRyxHQUFHLEtBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDM0UsU0FBUyxJQUFJLEdBQUcsQ0FBQztnQkFFakIsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUM7b0JBQUMsUUFBUSxDQUFDO2dCQUV2QyxRQUFRLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUMzQixFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDekIsT0FBTyxHQUFHLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDbEMsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDSixLQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsYUFBYSxDQUFDO29CQUN6QyxNQUFNLENBQUM7Z0JBQ1gsQ0FBQztZQUNMLENBQUM7WUFFRCxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFO2dCQUM3QixJQUFJLEVBQUUsT0FBTztnQkFDYixLQUFLLEVBQUUsS0FBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLFFBQVEsRUFBRTthQUNyRCxDQUFDLENBQUM7UUFFTixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFDTCx1QkFBQztBQUFELENBMUNBLEFBMENDLElBQUE7QUN0Q0Q7SUFBcUIsMEJBQU07SUFldkIsZ0JBQW9CLE9BQW1CLEVBQVUsU0FBcUI7UUFmMUUsaUJBZ0tDO1FBaEpPLGlCQUFPLENBQUM7UUFEUSxZQUFPLEdBQVAsT0FBTyxDQUFZO1FBQVUsY0FBUyxHQUFULFNBQVMsQ0FBWTtRQUdsRSxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLEtBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQWpDLENBQWlDLENBQUMsQ0FBQztRQUV0RSxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxhQUFhLENBQUMsK0JBQStCLENBQUMsQ0FBQztRQUMxRSxJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQyxhQUFhLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztRQUM1RSxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxhQUFhLENBQUMsK0JBQStCLENBQUMsQ0FBQztRQUMxRSxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxhQUFhLENBQUMsK0JBQStCLENBQUMsQ0FBQztRQUMxRSxJQUFJLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQyxhQUFhLENBQUMsaUNBQWlDLENBQUMsQ0FBQztRQUM5RSxJQUFJLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQyxhQUFhLENBQUMsaUNBQWlDLENBQUMsQ0FBQztRQUU5RSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUVwSCxJQUFJLGNBQWMsR0FBRyxTQUFTLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzVELElBQUksVUFBVSxHQUFHLFNBQVMsQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDeEQsSUFBSSxrQkFBa0IsR0FBRyxTQUFTLENBQUMsYUFBYSxDQUFDLDZCQUE2QixDQUFDLENBQUM7UUFFaEYsTUFBTSxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsY0FBTSxPQUFBLEtBQUksQ0FBQyxRQUFRLEVBQUUsRUFBZixDQUFlLENBQUMsQ0FBQztRQUNsRCxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxjQUFNLE9BQUEsS0FBSSxDQUFDLElBQUksRUFBRSxFQUFYLENBQVcsQ0FBQyxDQUFDO1FBQzFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsY0FBTSxPQUFBLEtBQUksQ0FBQyxPQUFPLEVBQUUsRUFBZCxDQUFjLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBRU0seUJBQVEsR0FBZjtRQUNJLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUN4QixJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFrQixDQUFDO1lBQ3ZDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztZQUNqQixNQUFNLEVBQUUsS0FBSztTQUNmLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxxQkFBSSxHQUFYO1FBQ0ksT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ3hCLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQWdCLENBQUM7WUFDckMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO1lBQ2pCLE1BQU0sRUFBRSxLQUFLO1NBQ2YsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLHdCQUFPLEdBQWY7UUFDSSxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDMUIsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO1lBQ2YsWUFBWSxFQUFFLElBQUksQ0FBQyxLQUFLO1lBQ3hCLE1BQU0sRUFBRSxLQUFLO1NBQ2hCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTyx5QkFBUSxHQUFoQixVQUFpQixRQUFzQjtRQUNuQyxJQUFJLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDekMsSUFBSSxTQUFTLEdBQUcsUUFBUSxLQUFLLFVBQWdCLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLEtBQUssWUFBVTtnQkFDWCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUM7Z0JBQ3RELEtBQUssQ0FBQztZQUNWLEtBQUssYUFBVztnQkFDWixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQztnQkFDakQsS0FBSyxDQUFDO1lBQ1YsS0FBSyxZQUFVO2dCQUNYLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDO2dCQUMzQyxLQUFLLENBQUM7WUFDVixLQUFLLFlBQVU7Z0JBQ1gsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUM7Z0JBQ3pDLEtBQUssQ0FBQztZQUNWLEtBQUssY0FBWTtnQkFDYixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQztnQkFDM0MsS0FBSyxDQUFDO1lBQ1YsS0FBSyxjQUFZO2dCQUNiLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDO2dCQUMvQyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU8sNEJBQVcsR0FBbkIsVUFBb0IsSUFBUyxFQUFFLEtBQVc7UUFBMUMsaUJBb0JDO1FBbkJHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQUMsS0FBSyxFQUFFLFVBQVU7WUFDbEMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDckMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDeEMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUM7WUFFeEMsRUFBRSxDQUFDLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ3JCLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUNsQyxLQUFLLENBQUMsU0FBUyxHQUFHLEtBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDOUQsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUNyQyxLQUFLLENBQUMsU0FBUyxHQUFHLEtBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDakUsQ0FBQztZQUVELEVBQUUsQ0FBQyxDQUFDLFVBQVUsR0FBRyxLQUFLLEdBQUcsQ0FBQyxJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUMvQyxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUN6QyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8saUNBQWdCLEdBQXhCLFVBQXlCLElBQVMsRUFBRSxLQUFXO1FBQzNDLE1BQU0sQ0FBQSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDWCxLQUFLLFlBQVU7Z0JBQ1gsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDaEMsS0FBSyxhQUFXO2dCQUNaLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDekMsS0FBSyxZQUFVO2dCQUNYLE1BQU0sQ0FBSSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLFNBQUksSUFBSSxDQUFDLFdBQVcsRUFBSSxDQUFDO1lBQzdFLEtBQUssWUFBVSxDQUFDO1lBQ2hCLEtBQUssY0FBWTtnQkFDYixNQUFNLENBQUksSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxTQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLFNBQUksSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxTQUFJLElBQUksQ0FBQyxXQUFXLEVBQUksQ0FBQztRQUNuSixDQUFDO0lBQ0wsQ0FBQztJQUVPLG9DQUFtQixHQUEzQixVQUE0QixJQUFTLEVBQUUsS0FBVztRQUM5QyxNQUFNLENBQUEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ1gsS0FBSyxZQUFVO2dCQUNYLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hDLEtBQUssYUFBVztnQkFDWixNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3pDLEtBQUssWUFBVTtnQkFDWCxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ2xELEtBQUssWUFBVTtnQkFDWCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7b0JBQzVCLE1BQU0sQ0FBSSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLFNBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsMEJBQXFCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLHNEQUFtRCxDQUFDO2dCQUM5SyxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNKLE1BQU0sQ0FBSSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLFNBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsMEJBQXFCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsdUJBQW9CLENBQUM7Z0JBQ2xLLENBQUM7WUFDTCxLQUFLLGNBQVk7Z0JBQ2IsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO29CQUM1QixNQUFNLENBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsMEJBQXFCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLHVCQUFvQixDQUFDO2dCQUM1RyxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNKLE1BQU0sQ0FBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQywwQkFBcUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsMEJBQXFCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFHLENBQUM7Z0JBQy9ILENBQUM7WUFDTCxLQUFLLGNBQVk7Z0JBQ2IsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO29CQUM1QixNQUFNLENBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsU0FBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQywwQkFBcUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsdUJBQW9CLENBQUM7Z0JBQzNJLENBQUM7Z0JBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ0osTUFBTSxDQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsMEJBQXFCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLDBCQUFxQixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBRyxDQUFDO2dCQUM5SixDQUFDO1FBQ1QsQ0FBQztJQUNMLENBQUM7SUFFTSw4QkFBYSxHQUFwQixVQUFxQixPQUFnQjtRQUNqQyxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxLQUFLLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxLQUFLLE9BQU8sQ0FBQyxZQUFZLENBQUM7UUFDL0YsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUNiLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDNUMsQ0FBQztJQUNMLENBQUM7SUFDTCxhQUFDO0FBQUQsQ0FoS0EsQUFnS0MsQ0FoS29CLE1BQU0sR0FnSzFCO0FDN0pEO0lBZ0JJLHVCQUFvQixPQUF3QjtRQWhCaEQsaUJBbVBDO1FBbk91QixZQUFPLEdBQVAsT0FBTyxDQUFpQjtRQUN4QyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUVuQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFMUMsSUFBSSxDQUFDLGVBQWUsR0FBZ0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUU1RixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFbEQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLFVBQVUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzFELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxXQUFXLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM1RCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksVUFBVSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDMUQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLFVBQVUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzFELElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxZQUFZLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM5RCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksWUFBWSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFOUQsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLEtBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsRUFBeEIsQ0FBd0IsQ0FBQyxDQUFDO1FBQ2xFLE1BQU0sQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFO1lBQ2hCLEtBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNuQixLQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUMvQixDQUFDLENBQUMsQ0FBQztRQUVILE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxVQUFDLENBQUM7WUFDaEMsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ25CLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUNwQixNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2hCLENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsVUFBQyxDQUFDLElBQUssT0FBQSxLQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQTNDLENBQTJDLENBQUMsQ0FBQztRQUVoRixNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxVQUFDLENBQUM7WUFDMUIsS0FBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsVUFBQyxDQUFDO1lBQzVCLEtBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2QyxDQUFDLENBQUMsQ0FBQztRQUVILE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUM3QixFQUFFLENBQUMsQ0FBQyxLQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRTtnQkFDOUIsS0FBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUU7Z0JBQzlCLEtBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQUMsTUFBTSxDQUFDO1lBQ3pDLEtBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDdkIsQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDOUIsRUFBRSxDQUFDLENBQUMsS0FBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUU7Z0JBQzlCLEtBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFO2dCQUM5QixLQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUFDLE1BQU0sQ0FBQztZQUN6QyxLQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzNCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLG1DQUFXLEdBQWxCO1FBQ0ksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxLQUFLLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQztRQUNuQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUN0RCxVQUFVLENBQUMsVUFBQyxNQUFrQjtZQUMxQixNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDcEIsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDckIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBSU0sa0NBQVUsR0FBakIsVUFBa0IsQ0FBUSxFQUFFLENBQVEsRUFBRSxJQUFXO1FBQzdDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN2QixDQUFDO1FBQ0QsSUFBSSxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDOUIsVUFBVSxDQUFDLFVBQUMsTUFBa0I7WUFDM0IsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUNqRCxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN2QixDQUFDO0lBRU0sb0NBQVksR0FBbkIsVUFBb0IsQ0FBUSxFQUFFLENBQVEsRUFBRSxJQUFXO1FBQy9DLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztRQUM3QixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUNqQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztJQUN0QyxDQUFDO0lBRU8sbUNBQVcsR0FBbkIsVUFBb0IsSUFBUyxFQUFFLEtBQVcsRUFBRSxNQUFjO1FBQ3RELEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxZQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNoQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxnQkFBbUIsQ0FBQyxDQUFDO1lBQ25ELENBQUM7WUFDRCxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3RCLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQztnQkFBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDMUMsTUFBTSxDQUFDO1FBQ1gsQ0FBQztRQUVELElBQUksVUFBcUIsQ0FBQztRQUMxQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoQyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDM0MsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLGVBQWtCLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25FLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMzQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQztZQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUUxQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRU8sMENBQWtCLEdBQTFCLFVBQTJCLElBQVM7UUFDaEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVPLHFDQUFhLEdBQXJCLFVBQXNCLElBQVMsRUFBRSxLQUFXO1FBQ3hDLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQUMsTUFBTSxDQUFDLGVBQWtCLENBQUM7UUFDckUsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLENBQUM7WUFBQyxNQUFNLENBQUMsZ0JBQW1CLENBQUM7UUFDdEUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7WUFBQyxNQUFNLENBQUMsa0JBQXFCLENBQUM7UUFDekYsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7WUFBQyxNQUFNLENBQUMsbUJBQXNCLENBQUM7UUFDMUYsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFFTyxvQ0FBWSxHQUFwQixVQUFxQixNQUFhO1FBQzlCLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxpQkFBYyxNQUFNLEdBQUcsR0FBRyxTQUFLLENBQUM7SUFDM0UsQ0FBQztJQUVPLGlDQUFTLEdBQWpCLFVBQWtCLEtBQVc7UUFDekIsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBQyxJQUFJLENBQUMsV0FBVyxFQUFDLElBQUksQ0FBQyxVQUFVLEVBQUMsSUFBSSxDQUFDLFVBQVUsRUFBQyxJQUFJLENBQUMsWUFBWSxFQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN6SCxDQUFDO0lBRU0sMkNBQW1CLEdBQTFCO1FBQ0ksSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3ZFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzdDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3hELENBQUM7UUFDRCxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVPLHdDQUFnQixHQUF4QixVQUF5QixDQUF1QjtRQUM1QyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsVUFBVSxJQUFhLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDM0MsT0FBTyxFQUFFLEtBQUssSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQzNCLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ2xDLEVBQUUsR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDO1FBQzFCLENBQUM7UUFDRCxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVNLHFDQUFhLEdBQXBCLFVBQXFCLE9BQWdCO1FBQ2pDLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxPQUFPLEtBQUssS0FBSyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxLQUFLLEtBQUssQ0FBQztZQUM3QixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEtBQUssT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPO1lBQ3BELElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFlBQVksS0FBSyxPQUFPLENBQUMsS0FBSyxDQUFDLFlBQVk7WUFDOUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxLQUFLLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUztZQUN4RCxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsS0FBSyxPQUFPLENBQUMsS0FBSyxDQUFDLGdCQUFnQjtZQUN0RSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxjQUFjLEtBQUssT0FBTyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUM7UUFFdkUsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFFdkIsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUNmLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUN4QixDQUFDO1FBRUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFbkMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDeEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVPLGtDQUFVLEdBQWxCO1FBQ0ksSUFBSSxFQUFFLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ3BELEVBQUUsQ0FBQyxTQUFTLEdBQUcsTUFBTSxHQUFHLDBKQUdXLENBQUM7UUFFcEMsTUFBTSxDQUFDLEVBQUUsQ0FBQztJQUNkLENBQUM7SUFFTyxtQ0FBVyxHQUFuQixVQUFvQixJQUFTLEVBQUUsT0FBWTtRQUN2QyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFJTyxvQ0FBWSxHQUFwQjtRQUNJLElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLElBQUksUUFBUSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JFLElBQUksWUFBWSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFbkQsSUFBSSxPQUFPLEdBQUcsY0FBYyxHQUFHLENBQUMsYUFBYSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7UUFFaEUsSUFBSSxlQUFlLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDaEQsRUFBRSxDQUFDLENBQUMsZUFBZSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3JELENBQUM7UUFFRCxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFdEMsSUFBSSxjQUFjLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNwRixjQUFjLEdBQUcsY0FBYyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDakYsY0FBYyxHQUFHLGNBQWMsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDL0YsY0FBYyxHQUFHLGNBQWMsQ0FBQyxPQUFPLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUNuRyxjQUFjLEdBQUcsY0FBYyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDckYsY0FBYyxHQUFHLGNBQWMsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRXpELFlBQVksQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDO1FBQy9CLEVBQUUsQ0FBQyxDQUFPLFlBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQSxDQUFDO1lBQzFCLFlBQWEsQ0FBQyxVQUFVLENBQUMsT0FBTyxHQUFHLGNBQWMsQ0FBQztRQUM1RCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixZQUFZLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztRQUN0RSxDQUFDO1FBRUQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRU8sMENBQWtCLEdBQTFCO1FBQ0ksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUN2RCxFQUFFLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM3RCxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVDLENBQUM7UUFDTCxDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNoQixDQUFDO0lBdkNNLDRCQUFjLEdBQVUsQ0FBQyxDQUFDO0lBd0NyQyxvQkFBQztBQUFELENBblBBLEFBbVBDLElBQUE7QUMxUEQsSUFBSSxNQUFNLEdBQUcscWpCQUFxakIsQ0FBQztBQ0Fua0IsK0NBQStDO0FBQy9DO0lBQXFCLDBCQUFNO0lBUXZCLGdCQUFzQixPQUFtQixFQUFZLFNBQXFCO1FBQ3RFLGlCQUFPLENBQUM7UUFEVSxZQUFPLEdBQVAsT0FBTyxDQUFZO1FBQVksY0FBUyxHQUFULFNBQVMsQ0FBWTtRQU5oRSxRQUFHLEdBQVEsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUN0QixRQUFHLEdBQVEsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQU81QixJQUFJLENBQUMsZUFBZSxHQUFnQixTQUFTLENBQUMsYUFBYSxDQUFDLHlCQUF5QixDQUFDLENBQUM7SUFDM0YsQ0FBQztJQUVNLHVCQUFNLEdBQWIsVUFBYyxJQUFTLEVBQUUsVUFBcUI7SUFDOUMsQ0FBQztJQUVNLHVCQUFNLEdBQWIsVUFBYyxVQUFxQjtRQUMvQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLEtBQUssQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDO1FBQ25DLFlBQVksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDNUMsVUFBVSxDQUFDLFVBQUMsTUFBa0I7WUFDMUIsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3BCLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3pCLENBQUM7SUFFUywwQkFBUyxHQUFuQixVQUFvQixFQUFjO1FBQzlCLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixFQUFFLENBQUMsSUFBSSxDQUFDO1FBQ3RGLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixFQUFFLENBQUMsR0FBRyxDQUFDO1FBQ3BGLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFFTSw4QkFBYSxHQUFwQixVQUFxQixPQUFnQjtRQUNqQyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUMzQixDQUFDO0lBRVMsdUJBQU0sR0FBaEI7UUFDSSxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVNLHVCQUFNLEdBQWI7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztJQUNwQixDQUFDO0lBRU0sdUJBQU0sR0FBYjtRQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO0lBQ3BCLENBQUM7SUFFTSxnQ0FBZSxHQUF0QixVQUF1QixJQUFTO1FBQzVCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUVTLDhCQUFhLEdBQXZCLFVBQXdCLFVBQXFCLEVBQUUsTUFBa0I7UUFDN0QsRUFBRSxDQUFDLENBQUMsVUFBVSxLQUFLLGtCQUFxQixDQUFDLENBQUMsQ0FBQztZQUN2QyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQ2hELENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxLQUFLLG1CQUFzQixDQUFDLENBQUMsQ0FBQztZQUMvQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxLQUFLLGVBQWtCLENBQUMsQ0FBQyxDQUFDO1lBQzNDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUM3QyxDQUFDO0lBQ0wsQ0FBQztJQUlTLDZCQUFZLEdBQXRCLFVBQXVCLFVBQXFCLEVBQUUsTUFBa0I7UUFDNUQsSUFBSSxHQUFVLENBQUM7UUFDZixFQUFFLENBQUMsQ0FBQyxVQUFVLEtBQUssa0JBQXFCLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLEdBQUcsR0FBRyxvQkFBb0IsQ0FBQztRQUMvQixDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsS0FBSyxtQkFBc0IsQ0FBQyxDQUFDLENBQUM7WUFDL0MsR0FBRyxHQUFHLHFCQUFxQixDQUFDO1FBQ2hDLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxLQUFLLGVBQWtCLENBQUMsQ0FBQyxDQUFDO1lBQzNDLEdBQUcsR0FBRyxrQkFBa0IsQ0FBQztRQUM3QixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixHQUFHLEdBQUcsbUJBQW1CLENBQUM7UUFDOUIsQ0FBQztRQUNELE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLFlBQVksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsVUFBVSxDQUFDLFVBQUMsQ0FBYTtZQUNoRCxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM1QixDQUFDLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3BCLENBQUM7SUFDTCxhQUFDO0FBQUQsQ0FsRkEsQUFrRkMsQ0FsRm9CLE1BQU0sR0FrRjFCO0FDbkZELGtDQUFrQztBQUVsQztJQUF5Qiw4QkFBTTtJQUMzQixvQkFBWSxPQUFtQixFQUFFLFNBQXFCO1FBRDFELGlCQThHQztRQTVHTyxrQkFBTSxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFFMUIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsa0NBQWtDLEVBQUUsVUFBQyxDQUFDO1lBQ3pELElBQUksRUFBRSxHQUFvQixDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUM7WUFFbkQsSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2xFLElBQUksS0FBSyxHQUFHLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNoRSxJQUFJLFdBQVcsR0FBRyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFckUsSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ2pELElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDNUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQixDQUFDO1lBQ0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUUxQixPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRTtnQkFDcEIsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsWUFBWSxFQUFFLFlBQVU7YUFDM0IsQ0FBQyxDQUFBO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxxQkFBcUIsRUFBRSxVQUFDLENBQUM7WUFDNUMsSUFBSSxFQUFFLEdBQTRCLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDN0QsSUFBSSxJQUFJLEdBQUcsS0FBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLE1BQU0sR0FBRyxLQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2hDLE9BQU8sQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFO2dCQUN4QixDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFO2dCQUNoQixDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDO2dCQUNmLElBQUksRUFBRSxJQUFJO2FBQ2QsQ0FBQyxDQUFDO1FBQ04sQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBSU0sMkJBQU0sR0FBYixVQUFjLElBQVMsRUFBRSxVQUFxQjtRQUMxQyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFN0QsSUFBSSxLQUFLLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ3pDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBRWxDLElBQUksR0FBRyxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUN2QyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRXpFLElBQUksUUFBUSxHQUFHLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBRXpDLElBQUksQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUV0RCxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFM0MsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUN6QixJQUFJLFFBQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFDMUQsUUFBTSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNqRCxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFNLENBQUMsQ0FBQztRQUNwQyxDQUFDO1FBRUQsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBRWQsR0FBRyxDQUFDO1lBQ0EsSUFBSSxXQUFXLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1lBRWhFLFdBQVcsQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRXRELEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsS0FBSyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUMxQyxXQUFXLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztZQUNwRSxDQUFDO1lBRUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFckMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDekMsS0FBSyxFQUFFLENBQUM7UUFDWixDQUFDLFFBQVEsUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFHLEdBQUcsQ0FBQyxPQUFPLEVBQUUsRUFBRTtRQUc3QyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFFN0MsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBRWQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVNLG9DQUFlLEdBQXRCLFVBQXVCLFlBQWlCO1FBQ3BDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFFckQsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQ2hGLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzNDLElBQUksRUFBRSxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUIsSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ3BELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsS0FBSyxZQUFZLENBQUMsV0FBVyxFQUFFO2dCQUNqRCxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssWUFBWSxDQUFDLFFBQVEsRUFBRTtnQkFDM0MsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzVDLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDeEMsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDM0MsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRU0sOEJBQVMsR0FBaEI7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUN2QixDQUFDO0lBRU0sNkJBQVEsR0FBZjtRQUNJLE1BQU0sQ0FBQyxZQUFVLENBQUM7SUFDdEIsQ0FBQztJQUNMLGlCQUFDO0FBQUQsQ0E5R0EsQUE4R0MsQ0E5R3dCLE1BQU0sR0E4RzlCO0FDaEhELGtDQUFrQztBQUVsQztJQUF5Qiw4QkFBTTtJQUEvQjtRQUF5Qiw4QkFBTTtRQVFqQixhQUFRLEdBQVcsS0FBSyxDQUFDO1FBS3pCLGFBQVEsR0FBVSxDQUFDLENBQUM7SUE0SWxDLENBQUM7SUFoSlUsK0JBQVUsR0FBakI7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN6QixDQUFDO0lBSVMsOEJBQVMsR0FBbkIsVUFBb0IsQ0FBdUI7UUFDdkMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQzlCLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxHQUFHO1lBQ3RDLENBQUMsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsR0FBRztZQUNyQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRTtTQUM1QixDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUM3QyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztJQUN6QixDQUFDO0lBRVMsNkJBQVEsR0FBbEIsVUFBbUIsQ0FBdUI7UUFDdEMsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2hDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxHQUFHO1lBQ3RDLENBQUMsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsR0FBRztZQUNyQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRTtTQUM1QixDQUFDLENBQUM7UUFFSCxJQUFJLEtBQUssR0FBRztZQUNSLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLHFCQUFxQixFQUFFLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0UsQ0FBQyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRztTQUM3RSxDQUFBO1FBRUQsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUUxQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNqRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssWUFBVSxDQUFDLENBQUMsQ0FBQztZQUNqQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDekQsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssY0FBWSxDQUFDLENBQUMsQ0FBQztZQUMxQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDM0QsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssY0FBWSxDQUFDLENBQUMsQ0FBQztZQUMxQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDM0QsQ0FBQztRQUNELElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDM0IsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ3ZCLElBQUksRUFBRSxPQUFPO1lBQ2IsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDdEIsTUFBTSxFQUFFLEtBQUs7U0FDaEIsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFFUyw0QkFBTyxHQUFqQixVQUFrQixDQUF1QjtRQUNyQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUVoRCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5QyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssWUFBVSxDQUFDLENBQUMsQ0FBQztZQUNqQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDdEQsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssY0FBWSxDQUFDLENBQUMsQ0FBQztZQUMxQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDeEQsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssY0FBWSxDQUFDLENBQUMsQ0FBQztZQUMxQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDeEQsQ0FBQztRQUVELE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUN6QixJQUFJLEVBQUUsSUFBSTtZQUNWLFlBQVksRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFO1NBQ2hDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO0lBQzFCLENBQUM7SUFFUyxtQ0FBYyxHQUF4QjtRQUNJLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxZQUFVLElBQUksQ0FBQyxRQUFRLFNBQU0sQ0FBQztRQUNqRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksWUFBVSxDQUFDLENBQUMsQ0FBQztZQUNoQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsWUFBVSxJQUFJLENBQUMsUUFBUSxTQUFNLENBQUM7UUFDbEUsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssY0FBWSxDQUFDLENBQUMsQ0FBQztZQUUxQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3JDLElBQUksRUFBRSxHQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBRWhDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDdEIsQ0FBQyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLEVBQUUsQ0FBQztZQUVyQixJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsWUFBVSxFQUFFLFNBQU0sQ0FBQztZQUNuRCxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsWUFBVSxJQUFJLENBQUMsUUFBUSxTQUFNLENBQUM7UUFDcEUsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssY0FBWSxDQUFDLENBQUMsQ0FBQztZQUUxQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3JDLElBQUksRUFBRSxHQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBSWhDLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDeEMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUVqQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDWCxDQUFDLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsRUFBRSxDQUFDO1lBRXJCLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxZQUFVLEVBQUUsU0FBTSxDQUFDO1lBQ25ELElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxZQUFVLEVBQUUsU0FBTSxDQUFDO1lBQ3JELElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxZQUFVLElBQUksQ0FBQyxRQUFRLFNBQU0sQ0FBQztRQUNwRSxDQUFDO0lBQ0wsQ0FBQztJQUVTLHdDQUFtQixHQUE3QixVQUE4QixDQUFRLEVBQUUsTUFBaUI7UUFBakIsc0JBQWlCLEdBQWpCLFVBQWlCO1FBQ3JELE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFO1lBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFLEdBQUcsTUFBTSxDQUFDO1FBQzFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUM7UUFDM0MsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNiLENBQUM7SUFFUyxzQ0FBaUIsR0FBM0IsVUFBNEIsQ0FBUSxFQUFFLE1BQWlCO1FBQWpCLHNCQUFpQixHQUFqQixVQUFpQjtRQUNuRCxNQUFNLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUM7SUFDckYsQ0FBQztJQUVNLG9DQUFlLEdBQXRCLFVBQXVCLElBQVM7UUFDNUIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUU3QyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssWUFBVSxDQUFDLENBQUMsQ0FBQztZQUNqQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNuRixDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSyxjQUFZLENBQUMsQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3ZGLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLGNBQVksQ0FBQyxDQUFDLENBQUM7WUFDMUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDdkYsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUMxQixDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekIsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM1QixDQUFDO0lBQ0wsQ0FBQztJQUVNLDhCQUFTLEdBQWhCO1FBQ0ksTUFBTSxDQUFDLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFFUyxpQ0FBWSxHQUF0QixVQUF1QixJQUFTLEVBQUUsV0FBMkI7UUFBM0IsMkJBQTJCLEdBQTNCLG1CQUEyQjtRQUFJLE1BQU0sZUFBZSxDQUFBO0lBQUMsQ0FBQztJQUM5RSxtQ0FBYyxHQUF4QixVQUF5QixFQUFVLElBQVMsTUFBTSxlQUFlLENBQUEsQ0FBQyxDQUFDO0lBQ3pELGtDQUFhLEdBQXZCLGNBQW1DLE1BQU0sZUFBZSxDQUFBLENBQUMsQ0FBQztJQUNoRCxtQ0FBYyxHQUF4QixVQUF5QixRQUFlLElBQVcsTUFBTSxlQUFlLENBQUEsQ0FBQyxDQUFDO0lBQ2hFLG1DQUFjLEdBQXhCLFVBQXlCLElBQVcsSUFBVyxNQUFNLGVBQWUsQ0FBQSxDQUFDLENBQUM7SUFDL0QsNkJBQVEsR0FBZixjQUEwQixNQUFNLGVBQWUsQ0FBQSxDQUFDLENBQUM7SUFDckQsaUJBQUM7QUFBRCxDQXpKQSxBQXlKQyxDQXpKd0IsTUFBTSxHQXlKOUI7QUMzSkQsc0NBQXNDO0FBRXRDO0lBQXlCLDhCQUFVO0lBQy9CLG9CQUFZLE9BQW1CLEVBQUUsU0FBcUI7UUFEMUQsaUJBaU9DO1FBL05PLGtCQUFNLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztRQUUxQixNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxtQkFBbUIsRUFBRTtZQUN4QyxTQUFTLEVBQUUsVUFBQyxDQUFDLElBQUssT0FBQSxLQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFqQixDQUFpQjtZQUNuQyxRQUFRLEVBQUUsVUFBQyxDQUFDLElBQUssT0FBQSxLQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFoQixDQUFnQjtZQUNqQyxPQUFPLEVBQUUsVUFBQyxDQUFDLElBQUssT0FBQSxLQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFmLENBQWU7U0FDbEMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsc0JBQXNCLEVBQUUsVUFBQyxDQUFDO1lBQzVDLElBQUksRUFBRSxHQUFvQixDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUM7WUFFbkQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFJLENBQUMsT0FBTyxFQUFFO2dCQUN6QixJQUFJLEVBQUUsS0FBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUM7Z0JBQzdCLFlBQVksRUFBRSxZQUFVO2FBQzNCLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsc0JBQXNCLEVBQUUsVUFBQyxDQUFDO1lBQzdDLElBQUksRUFBRSxHQUE0QixDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzdELElBQUksS0FBSyxHQUFHLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUVoRSxJQUFJLE1BQU0sR0FBRyxLQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2hDLE9BQU8sQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFO2dCQUN4QixDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFO2dCQUNoQixDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDO2dCQUNmLElBQUksRUFBRSxLQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQzthQUNuQyxDQUFDLENBQUM7UUFDTixDQUFDLENBQUMsQ0FBQztRQUVILE1BQU0sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLDBCQUEwQixFQUFFO1lBQzlDLElBQUksT0FBTyxHQUFHLElBQUksSUFBSSxDQUFDLEtBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUNyRCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDMUIsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7Z0JBQzFDLEtBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDakMsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO2dCQUMxQyxLQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ2pDLENBQUM7WUFFRCxLQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzNCLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSSxDQUFDLE9BQU8sRUFBRTtnQkFDdkIsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsS0FBSyxFQUFFLFlBQVU7Z0JBQ2pCLE1BQU0sRUFBRSxLQUFLO2FBQ2hCLENBQUMsQ0FBQztZQUNILEtBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUMxQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFUyxrQ0FBYSxHQUF2QixVQUF3QixLQUFhO1FBQ2pDLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkIsS0FBSyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFDNUIsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUMsSUFBSSxDQUFDO1FBQ2hDLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdEIsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUNsQixDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDbEIsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNwQixNQUFNLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQy9CLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ3hCLENBQUM7SUFDTCxDQUFDO0lBRVMsbUNBQWMsR0FBeEIsVUFBeUIsRUFBVTtRQUMvQixJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7UUFDakQsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNCLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN6QixJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDOUIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRXpCLElBQUksT0FBTyxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUNwRCxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzFCLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDeEIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDL0IsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixDQUFDO1FBQ0QsT0FBTyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM3QixPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hCLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUVTLG1DQUFjLEdBQXhCLFVBQXlCLENBQVE7UUFDN0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFDLElBQUksQ0FBQyxFQUFFO1lBQUUsQ0FBQyxJQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ3JDLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFO1lBQUUsQ0FBQyxJQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ25DLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM5QixNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRVMsbUNBQWMsR0FBeEIsVUFBeUIsQ0FBUTtRQUM3QixNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUVNLDJCQUFNLEdBQWIsVUFBYyxJQUFTLEVBQUUsVUFBcUI7UUFDMUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ3pFLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFN0UsSUFBSSxRQUFRLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBRTVDLElBQUksQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUN0RCxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUVoRCxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFM0MsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUMxQixJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ2pELElBQUksU0FBUyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUM1RCxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1lBQy9DLElBQUksa0JBQWtCLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO1lBQy9FLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQ2hDLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMxQyxJQUFJLENBQUMsV0FBVyxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDckMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsWUFBVSxDQUFDLFNBQU0sQ0FBQztZQUN6QyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLGFBQVUsQ0FBQyxHQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxVQUFNLENBQUM7WUFDbkUsU0FBUyxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUV6RCxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUVqQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25DLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUM7Z0JBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQztZQUN0QyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRWxCLFNBQVMsQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1lBRXZELElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFFRCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBQzNFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUM1QixJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBQ2hFLENBQUM7UUFHRCxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUUvQyxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUMzRCxJQUFJLENBQUMsV0FBVyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUNsRSxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUMzRCxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUVoRCxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFFOUQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMxQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFdkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsQ0FBQztRQUV2QixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDZCxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBTVMsaUNBQVksR0FBdEIsVUFBdUIsSUFBUyxFQUFFLFdBQTJCO1FBQTNCLDJCQUEyQixHQUEzQixtQkFBMkI7UUFDekQsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7UUFFMUIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsS0FBSyxLQUFLLENBQUM7WUFDeEIsQ0FBQyxJQUFJLENBQUMsUUFBUSxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxDQUFDO1lBQ2hELENBQUMsSUFBSSxDQUFDLFFBQVEsS0FBSyxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuRCxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQztnQkFBQyxNQUFNLENBQUM7UUFDN0IsQ0FBQztRQUVELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBRW5ELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN6QixJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBQzdELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDOUQsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUM3RCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQzlELENBQUM7UUFFRCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDaEUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDckMsSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzQixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQ2pGLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFbEMsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ3BELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUN2QixDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQztZQUMxQixDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyQixDQUFDO1lBRUQsS0FBSyxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFFbkQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxDQUFDO29CQUFDLElBQUksSUFBSSxFQUFFLENBQUM7Z0JBQ3JDLEtBQUssQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyQyxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osRUFBRSxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQztvQkFBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO2dCQUMxQixLQUFLLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN0QyxDQUFDO1FBQ0wsQ0FBQztJQUVMLENBQUM7SUFFTSxrQ0FBYSxHQUFwQixVQUFxQixPQUFnQjtRQUNqQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxLQUFLLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxLQUFLLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQ2hGLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNoRCxDQUFDO1FBQ0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFFdkIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUM7WUFDaEUsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLHNCQUFzQixDQUFDLENBQUM7WUFDbkUsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRU0sNkJBQVEsR0FBZjtRQUNJLE1BQU0sQ0FBQyxZQUFVLENBQUM7SUFDdEIsQ0FBQztJQUNMLGlCQUFDO0FBQUQsQ0FqT0EsQUFpT0MsQ0FqT3dCLFVBQVUsR0FpT2xDO0FDbk9ELHNDQUFzQztBQUV0QztJQUEyQixnQ0FBVTtJQUNqQyxzQkFBWSxPQUFtQixFQUFFLFNBQXFCO1FBRDFELGlCQStJQztRQTdJTyxrQkFBTSxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFFMUIsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUscUJBQXFCLEVBQUU7WUFDMUMsU0FBUyxFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsS0FBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBakIsQ0FBaUI7WUFDbkMsUUFBUSxFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsS0FBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBaEIsQ0FBZ0I7WUFDakMsT0FBTyxFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsS0FBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBZixDQUFlO1NBQ2xDLENBQUMsQ0FBQztRQUVILE1BQU0sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLHdCQUF3QixFQUFFLFVBQUMsQ0FBQztZQUM5QyxJQUFJLEVBQUUsR0FBb0IsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDO1lBRW5ELE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSSxDQUFDLE9BQU8sRUFBRTtnQkFDekIsSUFBSSxFQUFFLEtBQUksQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDO2dCQUM3QixZQUFZLEVBQUUsY0FBWTthQUM3QixDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUVILE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLHdCQUF3QixFQUFFLFVBQUMsQ0FBQztZQUMvQyxJQUFJLEVBQUUsR0FBNEIsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUM3RCxJQUFJLE9BQU8sR0FBRyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUM7WUFFcEUsSUFBSSxNQUFNLEdBQUcsS0FBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNoQyxPQUFPLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRTtnQkFDeEIsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRTtnQkFDaEIsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQztnQkFDZixJQUFJLEVBQUUsS0FBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUM7YUFDckMsQ0FBQyxDQUFDO1FBQ04sQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRVMsb0NBQWEsR0FBdkIsVUFBd0IsT0FBZTtRQUNuQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNqRCxDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUMsR0FBRyxDQUFDO0lBQ2pDLENBQUM7SUFFUyxxQ0FBYyxHQUF4QixVQUF5QixFQUFVO1FBQy9CLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztRQUNqRCxJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDM0IsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3pCLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUM5QixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDekIsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBRTdCLElBQUksT0FBTyxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUNwRCxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzFCLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDeEIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDL0IsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixDQUFDO1FBQ0QsT0FBTyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM3QixPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hCLE9BQU8sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDNUIsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUNuQixDQUFDO0lBRVMscUNBQWMsR0FBeEIsVUFBeUIsQ0FBUTtRQUM3QixPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRTtZQUFFLENBQUMsSUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNuQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQUUsQ0FBQyxJQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ2hDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFUyxxQ0FBYyxHQUF4QixVQUF5QixDQUFRO1FBQzdCLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBRU0sNkJBQU0sR0FBYixVQUFjLElBQVMsRUFBRSxVQUFxQjtRQUMxQyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQzFGLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBRTlGLElBQUksUUFBUSxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUU1QyxJQUFJLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDdEQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFFbEQsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRTNDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDMUIsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNqRCxJQUFJLFNBQVMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFDNUQsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztZQUNqRCxJQUFJLGtCQUFrQixHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsNkJBQTZCLENBQUMsQ0FBQztZQUMvRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUNoQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDMUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLFlBQVUsQ0FBQyxTQUFNLENBQUM7WUFDekMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxhQUFVLENBQUMsR0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsVUFBTSxDQUFDO1lBQ25FLFNBQVMsQ0FBQyxZQUFZLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFFekQsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFFakMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQyxDQUFDLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRXRCLFNBQVMsQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZELElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFFRCxJQUFJLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUMvRCxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUMzRCxJQUFJLENBQUMsV0FBVyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUNsRSxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUMzRCxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUVsRCxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFFOUQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMxQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXpDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNkLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFUyxtQ0FBWSxHQUF0QixVQUF1QixJQUFTLEVBQUUsV0FBMkI7UUFBM0IsMkJBQTJCLEdBQTNCLG1CQUEyQjtRQUV6RCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDaEUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDckMsSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzQixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQ2pGLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFbEMsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBRXBELEtBQUssQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1lBRW5ELEtBQUssQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyQyxDQUFDO0lBRUwsQ0FBQztJQUVNLG9DQUFhLEdBQXBCLFVBQXFCLE9BQWdCO1FBQ2pDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0lBQzNCLENBQUM7SUFFTSwrQkFBUSxHQUFmO1FBQ0ksTUFBTSxDQUFDLGNBQVksQ0FBQztJQUN4QixDQUFDO0lBQ0wsbUJBQUM7QUFBRCxDQS9JQSxBQStJQyxDQS9JMEIsVUFBVSxHQStJcEM7QUNqSkQsa0NBQWtDO0FBRWxDO0lBQTBCLCtCQUFNO0lBQzVCLHFCQUFZLE9BQW1CLEVBQUUsU0FBcUI7UUFEMUQsaUJBbUZDO1FBakZPLGtCQUFNLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztRQUUxQixNQUFNLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxtQ0FBbUMsRUFBRSxVQUFDLENBQUM7WUFDMUQsSUFBSSxFQUFFLEdBQW9CLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQztZQUNuRCxJQUFJLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDbEUsSUFBSSxLQUFLLEdBQUcsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRWhFLElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLEtBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUNqRCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDckIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEIsQ0FBQztZQUVELE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFO2dCQUNwQixJQUFJLEVBQUUsSUFBSTtnQkFDVixZQUFZLEVBQUUsYUFBVzthQUM1QixDQUFDLENBQUM7UUFDTixDQUFDLENBQUMsQ0FBQztRQUVILE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLHNCQUFzQixFQUFFLFVBQUMsQ0FBQztZQUM3QyxJQUFJLEVBQUUsR0FBNEIsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUM3RCxJQUFJLElBQUksR0FBRyxLQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDdEYsSUFBSSxNQUFNLEdBQUcsS0FBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNoQyxPQUFPLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRTtnQkFDeEIsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRTtnQkFDaEIsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRTtnQkFDaEIsSUFBSSxFQUFFLElBQUk7YUFDZCxDQUFDLENBQUM7UUFDTixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSw0QkFBTSxHQUFiLFVBQWMsSUFBUyxFQUFFLFVBQXFCO1FBQzFDLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzNDLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUUvQyxJQUFJLFFBQVEsR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFFNUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBRXRELElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUUzQyxHQUFHLENBQUM7WUFDQSxJQUFJLFlBQVksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLHNCQUFzQixDQUFDLENBQUM7WUFFbEUsWUFBWSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDcEUsWUFBWSxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFFakUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFdEMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDL0MsQ0FBQyxRQUFRLFFBQVEsQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFFO1FBRWxELElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUVkLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFTSxxQ0FBZSxHQUF0QixVQUF1QixZQUFpQjtRQUNwQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBRXJELElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUNsRixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUM1QyxJQUFJLEVBQUUsR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9CLElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUNwRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEtBQUssWUFBWSxDQUFDLFdBQVcsRUFBRTtnQkFDakQsSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzlDLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDeEMsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDM0MsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRU0sK0JBQVMsR0FBaEI7UUFDSSxNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUVNLDhCQUFRLEdBQWY7UUFDSSxNQUFNLENBQUMsYUFBVyxDQUFDO0lBQ3ZCLENBQUM7SUFDTCxrQkFBQztBQUFELENBbkZBLEFBbUZDLENBbkZ5QixNQUFNLEdBbUYvQjtBQ3JGRCxzQ0FBc0M7QUFFdEM7SUFBMkIsZ0NBQVU7SUFDakMsc0JBQVksT0FBbUIsRUFBRSxTQUFxQjtRQUQxRCxpQkFvSkM7UUFsSk8sa0JBQU0sT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRTFCLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLHFCQUFxQixFQUFFO1lBQzFDLFNBQVMsRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLEtBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQWpCLENBQWlCO1lBQ25DLFFBQVEsRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLEtBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQWhCLENBQWdCO1lBQ2pDLE9BQU8sRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLEtBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQWYsQ0FBZTtTQUNsQyxDQUFDLENBQUM7UUFFSCxNQUFNLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSx3QkFBd0IsRUFBRSxVQUFDLENBQUM7WUFDOUMsSUFBSSxFQUFFLEdBQW9CLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQztZQUVuRCxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ3pCLElBQUksRUFBRSxLQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQztnQkFDN0IsWUFBWSxFQUFFLGNBQVk7YUFDN0IsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSx3QkFBd0IsRUFBRSxVQUFDLENBQUM7WUFDL0MsSUFBSSxFQUFFLEdBQTRCLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDN0QsSUFBSSxPQUFPLEdBQUcsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBRXBFLElBQUksTUFBTSxHQUFHLEtBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDaEMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUU7Z0JBQ3hCLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2hCLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUM7Z0JBQ2YsSUFBSSxFQUFFLEtBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDO2FBQ3JDLENBQUMsQ0FBQztRQUNOLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVTLG9DQUFhLEdBQXZCLFVBQXdCLE9BQWU7UUFDbkMsRUFBRSxDQUFDLENBQUMsT0FBTyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQixPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDakQsQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFDLEdBQUcsQ0FBQztJQUNqQyxDQUFDO0lBRVMscUNBQWMsR0FBeEIsVUFBeUIsRUFBVTtRQUMvQixJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7UUFDakQsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNCLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN6QixJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDOUIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3pCLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUM3QixJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUM7UUFHN0IsSUFBSSxPQUFPLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ3BELE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDMUIsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN4QixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztZQUMvQixPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLENBQUM7UUFDRCxPQUFPLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzdCLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDeEIsT0FBTyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM1QixPQUFPLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzVCLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUVTLHFDQUFjLEdBQXhCLFVBQXlCLENBQVE7UUFDN0IsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUU7WUFBRSxDQUFDLElBQUksQ0FBQyxHQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUFFLENBQUMsSUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNwQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNoQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRVMscUNBQWMsR0FBeEIsVUFBeUIsQ0FBUTtRQUM3QixNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDM0QsQ0FBQztJQUVNLDZCQUFNLEdBQWIsVUFBYyxJQUFTLEVBQUUsVUFBcUI7UUFDMUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFDN0csSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBRWpILElBQUksUUFBUSxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUU1QyxJQUFJLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDdEQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFFbEQsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRTNDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDMUIsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNqRCxJQUFJLFNBQVMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFDNUQsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztZQUNqRCxJQUFJLGtCQUFrQixHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsNkJBQTZCLENBQUMsQ0FBQztZQUMvRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUNoQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDMUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLFlBQVUsQ0FBQyxTQUFNLENBQUM7WUFDekMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxhQUFVLENBQUMsR0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsVUFBTSxDQUFDO1lBQ25FLFNBQVMsQ0FBQyxZQUFZLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFFekQsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFFakMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQyxDQUFDLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRXRCLFNBQVMsQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZELElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFFRCxJQUFJLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUMvRCxJQUFJLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUMvRCxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUMzRCxJQUFJLENBQUMsV0FBVyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUNsRSxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUMzRCxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUVsRCxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFFOUQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMxQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUV6QyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDZCxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRVMsbUNBQVksR0FBdEIsVUFBdUIsSUFBUyxFQUFFLFdBQTJCO1FBQTNCLDJCQUEyQixHQUEzQixtQkFBMkI7UUFFekQsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQ2hFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3JDLElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUNqRixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRWxDLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUVwRCxLQUFLLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztZQUVuRCxLQUFLLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckMsQ0FBQztJQUVMLENBQUM7SUFFTSxvQ0FBYSxHQUFwQixVQUFxQixPQUFnQjtRQUNqQyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUMzQixDQUFDO0lBRU0sK0JBQVEsR0FBZjtRQUNJLE1BQU0sQ0FBQyxjQUFZLENBQUM7SUFDeEIsQ0FBQztJQUNMLG1CQUFDO0FBQUQsQ0FwSkEsQUFvSkMsQ0FwSjBCLFVBQVUsR0FvSnBDO0FDdEpELGtDQUFrQztBQUVsQztJQUF5Qiw4QkFBTTtJQUMzQixvQkFBWSxPQUFtQixFQUFFLFNBQXFCO1FBRDFELGlCQWlGQztRQS9FTyxrQkFBTSxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFFMUIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsa0NBQWtDLEVBQUUsVUFBQyxDQUFDO1lBQ3pELElBQUksRUFBRSxHQUFvQixDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUM7WUFDbkQsSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBRWxFLElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLEtBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUNqRCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXZCLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFO2dCQUNwQixJQUFJLEVBQUUsSUFBSTtnQkFDVixZQUFZLEVBQUUsWUFBVTthQUMzQixDQUFDLENBQUE7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUVILE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLHFCQUFxQixFQUFFLFVBQUMsQ0FBQztZQUM1QyxJQUFJLEVBQUUsR0FBNEIsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUM3RCxJQUFJLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDN0UsSUFBSSxNQUFNLEdBQUcsS0FBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNoQyxPQUFPLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRTtnQkFDeEIsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRTtnQkFDaEIsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRTtnQkFDaEIsSUFBSSxFQUFFLElBQUk7YUFDZCxDQUFDLENBQUM7UUFDTixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSwyQkFBTSxHQUFiLFVBQWMsSUFBUyxFQUFFLFVBQXFCO1FBQzFDLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEdBQUMsRUFBRSxDQUFDLEdBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzdELElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEdBQUMsRUFBRSxDQUFDLEdBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRTVELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDNUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBRUQsSUFBSSxRQUFRLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBRTVDLElBQUksQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUV0RCxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFM0MsR0FBRyxDQUFDO1lBQ0EsSUFBSSxXQUFXLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1lBRWhFLFdBQVcsQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzFELFdBQVcsQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1lBRWhFLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBRXJDLFFBQVEsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3JELENBQUMsUUFBUSxRQUFRLENBQUMsT0FBTyxFQUFFLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsRUFBRTtRQUVuRCxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFFZCxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRU0sb0NBQWUsR0FBdEIsVUFBdUIsWUFBaUI7UUFDcEMsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUVyRCxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLGdCQUFnQixDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDaEYsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDM0MsSUFBSSxFQUFFLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QixJQUFJLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7WUFDcEQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxLQUFLLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BELEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDeEMsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDM0MsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRU0sOEJBQVMsR0FBaEI7UUFDSSxNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUVNLDZCQUFRLEdBQWY7UUFDSSxNQUFNLENBQUMsWUFBVSxDQUFDO0lBQ3RCLENBQUM7SUFDTCxpQkFBQztBQUFELENBakZBLEFBaUZDLENBakZ3QixNQUFNLEdBaUY5QjtBQ25GRCxJQUFJLEdBQUcsR0FBQyxnamJBQWdqYixDQUFDIiwiZmlsZSI6ImRhdGl1bS5qcyIsInNvdXJjZXNDb250ZW50IjpbIig8YW55PndpbmRvdylbJ0RhdGl1bSddID0gY2xhc3MgRGF0aXVtIHtcbiAgICBwdWJsaWMgdXBkYXRlT3B0aW9uczoob3B0aW9uczpJT3B0aW9ucykgPT4gdm9pZDtcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OkhUTUxJbnB1dEVsZW1lbnQsIG9wdGlvbnM6SU9wdGlvbnMpIHtcbiAgICAgICAgbGV0IGludGVybmFscyA9IG5ldyBEYXRpdW1JbnRlcm5hbHMoZWxlbWVudCwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMudXBkYXRlT3B0aW9ucyA9IChvcHRpb25zOklPcHRpb25zKSA9PiBpbnRlcm5hbHMudXBkYXRlT3B0aW9ucyhvcHRpb25zKTtcbiAgICB9XG59IiwiY29uc3QgZW51bSBMZXZlbCB7XG4gICAgWUVBUiwgTU9OVEgsIERBVEUsIEhPVVIsXG4gICAgTUlOVVRFLCBTRUNPTkQsIE5PTkVcbn1cblxuY2xhc3MgRGF0aXVtSW50ZXJuYWxzIHtcbiAgICBwcml2YXRlIG9wdGlvbnM6SU9wdGlvbnMgPSA8YW55Pnt9O1xuICAgIFxuICAgIHByaXZhdGUgaW5wdXQ6SW5wdXQ7XG4gICAgcHJpdmF0ZSBwaWNrZXJNYW5hZ2VyOlBpY2tlck1hbmFnZXI7XG4gICAgXG4gICAgcHJpdmF0ZSBsZXZlbHM6TGV2ZWxbXTtcbiAgICBwcml2YXRlIGRhdGU6RGF0ZTtcbiAgICBcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVsZW1lbnQ6SFRNTElucHV0RWxlbWVudCwgb3B0aW9uczpJT3B0aW9ucykge1xuICAgICAgICBpZiAoZWxlbWVudCA9PT0gdm9pZCAwKSB0aHJvdyAnZWxlbWVudCBpcyByZXF1aXJlZCc7XG4gICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdzcGVsbGNoZWNrJywgJ2ZhbHNlJyk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmlucHV0ID0gbmV3IElucHV0KGVsZW1lbnQpO1xuICAgICAgICB0aGlzLnBpY2tlck1hbmFnZXIgPSBuZXcgUGlja2VyTWFuYWdlcihlbGVtZW50KTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMudXBkYXRlT3B0aW9ucyhvcHRpb25zKTtcbiAgICAgICAgXG4gICAgICAgIGxpc3Rlbi5nb3RvKGVsZW1lbnQsIChlKSA9PiB0aGlzLmdvdG8oZS5kYXRlLCBlLmxldmVsLCBlLnVwZGF0ZSkpO1xuICAgICAgICBsaXN0ZW4uem9vbU91dChlbGVtZW50LCAoZSkgPT4gdGhpcy56b29tT3V0KGUuZGF0ZSwgZS5jdXJyZW50TGV2ZWwsIGUudXBkYXRlKSk7XG4gICAgICAgIGxpc3Rlbi56b29tSW4oZWxlbWVudCwgKGUpID0+IHRoaXMuem9vbUluKGUuZGF0ZSwgZS5jdXJyZW50TGV2ZWwsIGUudXBkYXRlKSk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmdvdG8odGhpcy5vcHRpb25zWydkZWZhdWx0RGF0ZSddLCBMZXZlbC5OT05FLCB0cnVlKTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHpvb21PdXQoZGF0ZTpEYXRlLCBjdXJyZW50TGV2ZWw6TGV2ZWwsIHVwZGF0ZTpib29sZWFuID0gdHJ1ZSkge1xuICAgICAgICBsZXQgbmV3TGV2ZWw6TGV2ZWwgPSB0aGlzLmxldmVsc1t0aGlzLmxldmVscy5pbmRleE9mKGN1cnJlbnRMZXZlbCkgLSAxXTsgXG4gICAgICAgIGlmIChuZXdMZXZlbCA9PT0gdm9pZCAwKSByZXR1cm47XG4gICAgICAgIHRyaWdnZXIuZ290byh0aGlzLmVsZW1lbnQsIHtcbiAgICAgICAgICAgZGF0ZTogZGF0ZSxcbiAgICAgICAgICAgbGV2ZWw6IG5ld0xldmVsLFxuICAgICAgICAgICB1cGRhdGU6IHVwZGF0ZSBcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyB6b29tSW4oZGF0ZTpEYXRlLCBjdXJyZW50TGV2ZWw6TGV2ZWwsIHVwZGF0ZTpib29sZWFuID0gdHJ1ZSkge1xuICAgICAgICBsZXQgbmV3TGV2ZWw6TGV2ZWwgPSB0aGlzLmxldmVsc1t0aGlzLmxldmVscy5pbmRleE9mKGN1cnJlbnRMZXZlbCkgKyAxXTtcbiAgICAgICAgaWYgKG5ld0xldmVsID09PSB2b2lkIDApIG5ld0xldmVsID0gY3VycmVudExldmVsO1xuICAgICAgICB0cmlnZ2VyLmdvdG8odGhpcy5lbGVtZW50LCB7XG4gICAgICAgICAgIGRhdGU6IGRhdGUsXG4gICAgICAgICAgIGxldmVsOiBuZXdMZXZlbCxcbiAgICAgICAgICAgdXBkYXRlOiB1cGRhdGUgXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgZ290byhkYXRlOkRhdGUsIGxldmVsOkxldmVsLCB1cGRhdGU6Ym9vbGVhbiA9IHRydWUpIHtcbiAgICAgICAgaWYgKGRhdGUgPT09IHZvaWQgMCkgZGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIFxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLm1pbkRhdGUgIT09IHZvaWQgMCAmJiBkYXRlLnZhbHVlT2YoKSA8IHRoaXMub3B0aW9ucy5taW5EYXRlLnZhbHVlT2YoKSkge1xuICAgICAgICAgICAgZGF0ZSA9IG5ldyBEYXRlKHRoaXMub3B0aW9ucy5taW5EYXRlLnZhbHVlT2YoKSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMubWF4RGF0ZSAhPT0gdm9pZCAwICYmIGRhdGUudmFsdWVPZigpID4gdGhpcy5vcHRpb25zLm1heERhdGUudmFsdWVPZigpKSB7XG4gICAgICAgICAgICBkYXRlID0gbmV3IERhdGUodGhpcy5vcHRpb25zLm1heERhdGUudmFsdWVPZigpKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRhdGUgPSBkYXRlO1xuICAgICAgICB0cmlnZ2VyLnZpZXdjaGFuZ2VkKHRoaXMuZWxlbWVudCwge1xuICAgICAgICAgICAgZGF0ZTogZGF0ZSxcbiAgICAgICAgICAgIGxldmVsOiBsZXZlbCxcbiAgICAgICAgICAgIHVwZGF0ZTogdXBkYXRlXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgdXBkYXRlT3B0aW9ucyhuZXdPcHRpb25zOklPcHRpb25zID0gPGFueT57fSkge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemUobmV3T3B0aW9ucywgdGhpcy5vcHRpb25zKTsgICAgICAgIFxuICAgICAgICB0aGlzLmlucHV0LnVwZGF0ZU9wdGlvbnModGhpcy5vcHRpb25zKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMubGV2ZWxzID0gdGhpcy5pbnB1dC5nZXRMZXZlbHMoKS5zbGljZSgpO1xuICAgICAgICB0aGlzLmxldmVscy5zb3J0KCk7XG4gICAgICAgIFxuICAgICAgICBpZiAodGhpcy5waWNrZXJNYW5hZ2VyLmN1cnJlbnRQaWNrZXIgIT09IHZvaWQgMCkge1xuICAgICAgICAgICAgbGV0IGN1ckxldmVsID0gdGhpcy5waWNrZXJNYW5hZ2VyLmN1cnJlbnRQaWNrZXIuZ2V0TGV2ZWwoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHRoaXMubGV2ZWxzLmluZGV4T2YoY3VyTGV2ZWwpID09IC0xKSB7XG4gICAgICAgICAgICAgICAgdHJpZ2dlci5nb3RvKHRoaXMuZWxlbWVudCwge1xuICAgICAgICAgICAgICAgICAgICBkYXRlOiB0aGlzLmRhdGUsXG4gICAgICAgICAgICAgICAgICAgIGxldmVsOiB0aGlzLmxldmVsc1swXVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRoaXMucGlja2VyTWFuYWdlci51cGRhdGVPcHRpb25zKHRoaXMub3B0aW9ucyk7XG4gICAgfVxufSIsImZ1bmN0aW9uIE9wdGlvbkV4Y2VwdGlvbihtc2c6c3RyaW5nKSB7XG4gICAgcmV0dXJuIGBbRGF0aXVtIE9wdGlvbiBFeGNlcHRpb25dXFxuICAke21zZ31cXG4gIFNlZSBodHRwOi8vZGF0aXVtLmlvL2RvY3VtZW50YXRpb24gZm9yIGRvY3VtZW50YXRpb24uYDtcbn1cblxuY2xhc3MgT3B0aW9uU2FuaXRpemVyIHtcbiAgICBcbiAgICBzdGF0aWMgZGZsdERhdGU6RGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgXG4gICAgc3RhdGljIHNhbml0aXplRGlzcGxheUFzKGRpc3BsYXlBczphbnksIGRmbHQ6c3RyaW5nID0gJ2g6bW1hIE1NTSBELCBZWVlZJykge1xuICAgICAgICBpZiAoZGlzcGxheUFzID09PSB2b2lkIDApIHJldHVybiBkZmx0O1xuICAgICAgICBpZiAodHlwZW9mIGRpc3BsYXlBcyAhPT0gJ3N0cmluZycpIHRocm93IE9wdGlvbkV4Y2VwdGlvbignVGhlIFwiZGlzcGxheUFzXCIgb3B0aW9uIG11c3QgYmUgYSBzdHJpbmcnKTtcbiAgICAgICAgcmV0dXJuIGRpc3BsYXlBcztcbiAgICB9XG4gICAgXG4gICAgc3RhdGljIHNhbml0aXplTWluRGF0ZShtaW5EYXRlOmFueSwgZGZsdDpEYXRlID0gdm9pZCAwKSB7XG4gICAgICAgIGlmIChtaW5EYXRlID09PSB2b2lkIDApIHJldHVybiBkZmx0O1xuICAgICAgICByZXR1cm4gbmV3IERhdGUobWluRGF0ZSk7IC8vVE9ETyBmaWd1cmUgdGhpcyBvdXQgeWVzXG4gICAgfVxuICAgIFxuICAgIHN0YXRpYyBzYW5pdGl6ZU1heERhdGUobWF4RGF0ZTphbnksIGRmbHQ6RGF0ZSA9IHZvaWQgMCkge1xuICAgICAgICBpZiAobWF4RGF0ZSA9PT0gdm9pZCAwKSByZXR1cm4gZGZsdDtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKG1heERhdGUpOyAvL1RPRE8gZmlndXJlIHRoaXMgb3V0IFxuICAgIH1cbiAgICBcbiAgICBzdGF0aWMgc2FuaXRpemVEZWZhdWx0RGF0ZShkZWZhdWx0RGF0ZTphbnksIGRmbHQ6RGF0ZSA9IHRoaXMuZGZsdERhdGUpIHtcbiAgICAgICAgaWYgKGRlZmF1bHREYXRlID09PSB2b2lkIDApIHJldHVybiBkZmx0O1xuICAgICAgICByZXR1cm4gbmV3IERhdGUoZGVmYXVsdERhdGUpOyAvL1RPRE8gZmlndXJlIHRoaXMgb3V0XG4gICAgfVxuICAgICAgICBcbiAgICBzdGF0aWMgc2FuaXRpemVDb2xvcihjb2xvcjphbnkpIHtcbiAgICAgICAgbGV0IHRocmVlSGV4ID0gJ1xcXFxzKiNbQS1GYS1mMC05XXszfVxcXFxzKic7XG4gICAgICAgIGxldCBzaXhIZXggPSAnXFxcXHMqI1tBLUZhLWYwLTldezZ9XFxcXHMqJztcbiAgICAgICAgbGV0IHJnYiA9ICdcXFxccypyZ2JcXFxcKFxcXFxzKlswLTldezEsM31cXFxccyosXFxcXHMqWzAtOV17MSwzfVxcXFxzKixcXFxccypbMC05XXsxLDN9XFxcXHMqXFxcXClcXFxccyonO1xuICAgICAgICBsZXQgcmdiYSA9ICdcXFxccypyZ2JhXFxcXChcXFxccypbMC05XXsxLDN9XFxcXHMqLFxcXFxzKlswLTldezEsM31cXFxccyosXFxcXHMqWzAtOV17MSwzfVxcXFxzKlxcXFwsXFxcXHMqWzAtOV0qXFxcXC5bMC05XStcXFxccypcXFxcKVxcXFxzKic7XG4gICAgICAgIGxldCBzYW5pdGl6ZUNvbG9yUmVnZXggPSBuZXcgUmVnRXhwKGBeKCgke3RocmVlSGV4fSl8KCR7c2l4SGV4fSl8KCR7cmdifSl8KCR7cmdiYX0pKSRgKTtcblxuICAgICAgICBpZiAoY29sb3IgPT09IHZvaWQgMCkgdGhyb3cgT3B0aW9uRXhjZXB0aW9uKFwiQWxsIHRoZW1lIGNvbG9ycyAocHJpbWFyeSwgcHJpbWFyeV90ZXh0LCBzZWNvbmRhcnksIHNlY29uZGFyeV90ZXh0LCBzZWNvbmRhcnlfYWNjZW50KSBtdXN0IGJlIGRlZmluZWRcIik7XG4gICAgICAgIGlmICghc2FuaXRpemVDb2xvclJlZ2V4LnRlc3QoY29sb3IpKSB0aHJvdyBPcHRpb25FeGNlcHRpb24oXCJBbGwgdGhlbWUgY29sb3JzIG11c3QgYmUgdmFsaWQgcmdiLCByZ2JhLCBvciBoZXggY29kZVwiKTtcbiAgICAgICAgcmV0dXJuIDxzdHJpbmc+Y29sb3I7XG4gICAgfVxuICAgIFxuICAgIHN0YXRpYyBzYW5pdGl6ZVRoZW1lKHRoZW1lOmFueSwgZGZsdDphbnkgPSBcIm1hdGVyaWFsXCIpOklUaGVtZSB7XG4gICAgICAgIGlmICh0aGVtZSA9PT0gdm9pZCAwKSByZXR1cm4gT3B0aW9uU2FuaXRpemVyLnNhbml0aXplVGhlbWUoZGZsdCwgdm9pZCAwKTtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGVtZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHN3aXRjaCh0aGVtZSkge1xuICAgICAgICAgICAgY2FzZSAnbGlnaHQnOlxuICAgICAgICAgICAgICAgIHJldHVybiA8SVRoZW1lPntcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeTogJyNlZWUnLFxuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5X3RleHQ6ICcjNjY2JyxcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5OiAnI2ZmZicsXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeV90ZXh0OiAnIzY2NicsXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeV9hY2NlbnQ6ICcjNjY2J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJ2RhcmsnOlxuICAgICAgICAgICAgICAgIHJldHVybiA8SVRoZW1lPntcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeTogJyM0NDQnLFxuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5X3RleHQ6ICcjZWVlJyxcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5OiAnIzMzMycsXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeV90ZXh0OiAnI2VlZScsXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeV9hY2NlbnQ6ICcjZmZmJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJ21hdGVyaWFsJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gPElUaGVtZT57XG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnk6ICcjMDE5NTg3JyxcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeV90ZXh0OiAnI2ZmZicsXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeTogJyNmZmYnLFxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnlfdGV4dDogJyM4ODgnLFxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnlfYWNjZW50OiAnIzAxOTU4NydcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IFwiTmFtZSBvZiB0aGVtZSBub3QgdmFsaWQuXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoZW1lID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgcmV0dXJuIDxJVGhlbWU+IHtcbiAgICAgICAgICAgICAgICBwcmltYXJ5OiBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVDb2xvcih0aGVtZVsncHJpbWFyeSddKSxcbiAgICAgICAgICAgICAgICBzZWNvbmRhcnk6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZUNvbG9yKHRoZW1lWydzZWNvbmRhcnknXSksXG4gICAgICAgICAgICAgICAgcHJpbWFyeV90ZXh0OiBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVDb2xvcih0aGVtZVsncHJpbWFyeV90ZXh0J10pLFxuICAgICAgICAgICAgICAgIHNlY29uZGFyeV90ZXh0OiBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVDb2xvcih0aGVtZVsnc2Vjb25kYXJ5X3RleHQnXSksXG4gICAgICAgICAgICAgICAgc2Vjb25kYXJ5X2FjY2VudDogT3B0aW9uU2FuaXRpemVyLnNhbml0aXplQ29sb3IodGhlbWVbJ3NlY29uZGFyeV9hY2NlbnQnXSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IE9wdGlvbkV4Y2VwdGlvbignVGhlIFwidGhlbWVcIiBvcHRpb24gbXVzdCBiZSBvYmplY3Qgb3Igc3RyaW5nJyk7XG4gICAgICAgIH1cbiAgICB9IFxuICAgIFxuICAgIHN0YXRpYyBzYW5pdGl6ZU1pbGl0YXJ5VGltZShtaWxpdGFyeVRpbWU6YW55LCBkZmx0OmJvb2xlYW4gPSBmYWxzZSkge1xuICAgICAgICBpZiAobWlsaXRhcnlUaW1lID09PSB2b2lkIDApIHJldHVybiBkZmx0O1xuICAgICAgICBpZiAodHlwZW9mIG1pbGl0YXJ5VGltZSAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICB0aHJvdyBPcHRpb25FeGNlcHRpb24oJ1RoZSBcIm1pbGl0YXJ5VGltZVwiIG9wdGlvbiBtdXN0IGJlIGEgYm9vbGVhbicpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiA8Ym9vbGVhbj5taWxpdGFyeVRpbWU7XG4gICAgfVxuICAgIFxuICAgIHN0YXRpYyBzYW5pdGl6ZShvcHRpb25zOklPcHRpb25zLCBkZWZhdWx0czpJT3B0aW9ucykge1xuICAgICAgICBsZXQgb3B0czpJT3B0aW9ucyA9IHtcbiAgICAgICAgICAgIGRpc3BsYXlBczogT3B0aW9uU2FuaXRpemVyLnNhbml0aXplRGlzcGxheUFzKG9wdGlvbnNbJ2Rpc3BsYXlBcyddLCBkZWZhdWx0cy5kaXNwbGF5QXMpLFxuICAgICAgICAgICAgbWluRGF0ZTogT3B0aW9uU2FuaXRpemVyLnNhbml0aXplTWluRGF0ZShvcHRpb25zWydtaW5EYXRlJ10sIGRlZmF1bHRzLm1pbkRhdGUpLFxuICAgICAgICAgICAgbWF4RGF0ZTogT3B0aW9uU2FuaXRpemVyLnNhbml0aXplTWF4RGF0ZShvcHRpb25zWydtYXhEYXRlJ10sIGRlZmF1bHRzLm1heERhdGUpLFxuICAgICAgICAgICAgZGVmYXVsdERhdGU6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZURlZmF1bHREYXRlKG9wdGlvbnNbJ2RlZmF1bHREYXRlJ10sIGRlZmF1bHRzLmRlZmF1bHREYXRlKSxcbiAgICAgICAgICAgIHRoZW1lOiBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVUaGVtZShvcHRpb25zWyd0aGVtZSddLCBkZWZhdWx0cy50aGVtZSksXG4gICAgICAgICAgICBtaWxpdGFyeVRpbWU6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZU1pbGl0YXJ5VGltZShvcHRpb25zWydtaWxpdGFyeVRpbWUnXSwgZGVmYXVsdHMubWlsaXRhcnlUaW1lKVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gb3B0cztcbiAgICB9XG59IiwiY2xhc3MgQ29tbW9uIHtcbiAgICBwcm90ZWN0ZWQgZ2V0TW9udGhzKCkge1xuICAgICAgICByZXR1cm4gW1wiSmFudWFyeVwiLCBcIkZlYnJ1YXJ5XCIsIFwiTWFyY2hcIiwgXCJBcHJpbFwiLCBcIk1heVwiLCBcIkp1bmVcIiwgXCJKdWx5XCIsIFwiQXVndXN0XCIsIFwiU2VwdGVtYmVyXCIsIFwiT2N0b2JlclwiLCBcIk5vdmVtYmVyXCIsIFwiRGVjZW1iZXJcIl07XG4gICAgfVxuICAgIFxuICAgIHByb3RlY3RlZCBnZXRTaG9ydE1vbnRocygpIHtcbiAgICAgICAgcmV0dXJuIFtcIkphblwiLCBcIkZlYlwiLCBcIk1hclwiLCBcIkFwclwiLCBcIk1heVwiLCBcIkp1blwiLCBcIkp1bFwiLCBcIkF1Z1wiLCBcIlNlcFwiLCBcIk9jdFwiLCBcIk5vdlwiLCBcIkRlY1wiXTtcbiAgICB9XG4gICAgXG4gICAgcHJvdGVjdGVkIGdldERheXMoKSB7XG4gICAgICAgIHJldHVybiBbXCJTdW5kYXlcIiwgXCJNb25kYXlcIiwgXCJUdWVzZGF5XCIsIFwiV2VkbmVzZGF5XCIsIFwiVGh1cnNkYXlcIiwgXCJGcmlkYXlcIiwgXCJTYXR1cmRheVwiXTtcbiAgICB9XG4gICAgXG4gICAgcHJvdGVjdGVkIGdldFNob3J0RGF5cygpIHtcbiAgICAgICAgcmV0dXJuIFtcIlN1blwiLCBcIk1vblwiLCBcIlR1ZVwiLCBcIldlZFwiLCBcIlRodVwiLCBcIkZyaVwiLCBcIlNhdFwiXTtcbiAgICB9XG4gICAgXG4gICAgcHJvdGVjdGVkIGRheXNJbk1vbnRoKGRhdGU6RGF0ZSkge1xuICAgICAgICByZXR1cm4gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCkgKyAxLCAwKS5nZXREYXRlKCk7XG4gICAgfVxuICAgIFxuICAgIHByb3RlY3RlZCBnZXRIb3VycyhkYXRlOkRhdGUpOnN0cmluZyB7XG4gICAgICAgIGxldCBudW0gPSBkYXRlLmdldEhvdXJzKCk7XG4gICAgICAgIGlmIChudW0gPT09IDApIG51bSA9IDEyO1xuICAgICAgICBpZiAobnVtID4gMTIpIG51bSAtPSAxMjtcbiAgICAgICAgcmV0dXJuIG51bS50b1N0cmluZygpO1xuICAgIH1cbiAgICBcbiAgICBwcm90ZWN0ZWQgZ2V0RGVjYWRlKGRhdGU6RGF0ZSk6c3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGAke01hdGguZmxvb3IoZGF0ZS5nZXRGdWxsWWVhcigpLzEwKSoxMH0gLSAke01hdGguY2VpbCgoZGF0ZS5nZXRGdWxsWWVhcigpICsgMSkvMTApKjEwfWA7XG4gICAgfVxuICAgIFxuICAgIHByb3RlY3RlZCBnZXRNZXJpZGllbShkYXRlOkRhdGUpOnN0cmluZyB7XG4gICAgICAgIHJldHVybiBkYXRlLmdldEhvdXJzKCkgPCAxMiA/ICdhbScgOiAncG0nO1xuICAgIH1cbiAgICBcbiAgICBwcm90ZWN0ZWQgcGFkKG51bTpudW1iZXJ8c3RyaW5nLCBzaXplOm51bWJlciA9IDIpIHtcbiAgICAgICAgbGV0IHN0ciA9IG51bS50b1N0cmluZygpO1xuICAgICAgICB3aGlsZShzdHIubGVuZ3RoIDwgc2l6ZSkgc3RyID0gJzAnICsgc3RyO1xuICAgICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgICBcbiAgICBwcm90ZWN0ZWQgdHJpbShzdHI6c3RyaW5nKSB7XG4gICAgICAgIHdoaWxlIChzdHJbMF0gPT09ICcwJyAmJiBzdHIubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgc3RyID0gc3RyLnN1YnN0cigxLCBzdHIubGVuZ3RoKTsgIFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICAgIFxuICAgIHByb3RlY3RlZCBnZXRDbGllbnRDb29yKGU6YW55KTp7eDpudW1iZXIsIHk6bnVtYmVyfSB7XG4gICAgICAgIGlmIChlLmNsaWVudFggIT09IHZvaWQgMCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB4OiBlLmNsaWVudFgsXG4gICAgICAgICAgICAgICAgeTogZS5jbGllbnRZXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WCxcbiAgICAgICAgICAgIHk6IGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WVxuICAgICAgICB9XG4gICAgfVxufSIsIkN1c3RvbUV2ZW50ID0gKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIHVzZU5hdGl2ZSAoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgY3VzdG9tRXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoJ2EnLCB7IGRldGFpbDogeyBiOiAnYicgfSB9KTtcbiAgICAgICAgICAgIHJldHVybiAgJ2EnID09PSBjdXN0b21FdmVudC50eXBlICYmICdiJyA9PT0gY3VzdG9tRXZlbnQuZGV0YWlsLmI7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIFxuICAgIGlmICh1c2VOYXRpdmUoKSkge1xuICAgICAgICByZXR1cm4gPGFueT5DdXN0b21FdmVudDtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkb2N1bWVudC5jcmVhdGVFdmVudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBJRSA+PSA5XG4gICAgICAgIHJldHVybiA8YW55PmZ1bmN0aW9uKHR5cGU6c3RyaW5nLCBwYXJhbXM6Q3VzdG9tRXZlbnRJbml0KSB7XG4gICAgICAgICAgICBsZXQgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdDdXN0b21FdmVudCcpO1xuICAgICAgICAgICAgaWYgKHBhcmFtcykge1xuICAgICAgICAgICAgICAgIGUuaW5pdEN1c3RvbUV2ZW50KHR5cGUsIHBhcmFtcy5idWJibGVzLCBwYXJhbXMuY2FuY2VsYWJsZSwgcGFyYW1zLmRldGFpbCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGUuaW5pdEN1c3RvbUV2ZW50KHR5cGUsIGZhbHNlLCBmYWxzZSwgdm9pZCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBlO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gSUUgPj0gOFxuICAgICAgICByZXR1cm4gPGFueT5mdW5jdGlvbih0eXBlOnN0cmluZywgcGFyYW1zOkN1c3RvbUV2ZW50SW5pdCkge1xuICAgICAgICAgICAgbGV0IGUgPSAoPGFueT5kb2N1bWVudCkuY3JlYXRlRXZlbnRPYmplY3QoKTtcbiAgICAgICAgICAgIGUudHlwZSA9IHR5cGU7XG4gICAgICAgICAgICBpZiAocGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgZS5idWJibGVzID0gQm9vbGVhbihwYXJhbXMuYnViYmxlcyk7XG4gICAgICAgICAgICAgICAgZS5jYW5jZWxhYmxlID0gQm9vbGVhbihwYXJhbXMuY2FuY2VsYWJsZSk7XG4gICAgICAgICAgICAgICAgZS5kZXRhaWwgPSBwYXJhbXMuZGV0YWlsO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlLmJ1YmJsZXMgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBlLmNhbmNlbGFibGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBlLmRldGFpbCA9IHZvaWQgMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBlO1xuICAgICAgICB9IFxuICAgIH0gIFxufSkoKTtcbiIsImludGVyZmFjZSBJTGlzdGVuZXJSZWZlcmVuY2Uge1xuICAgIGVsZW1lbnQ6IEVsZW1lbnR8RG9jdW1lbnR8V2luZG93O1xuICAgIHJlZmVyZW5jZTogRXZlbnRMaXN0ZW5lcjtcbiAgICBldmVudDogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgSURyYWdDYWxsYmFja3Mge1xuICAgIGRyYWdTdGFydD86KGU/Ok1vdXNlRXZlbnR8VG91Y2hFdmVudCkgPT4gdm9pZDtcbiAgICBkcmFnTW92ZT86KGU/Ok1vdXNlRXZlbnR8VG91Y2hFdmVudCkgPT4gdm9pZDtcbiAgICBkcmFnRW5kPzooZT86TW91c2VFdmVudHxUb3VjaEV2ZW50KSA9PiB2b2lkO1xufVxuXG5uYW1lc3BhY2UgbGlzdGVuIHtcbiAgICBsZXQgbWF0Y2hlcyA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5tYXRjaGVzIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5tc01hdGNoZXNTZWxlY3RvcjtcbiAgICBcbiAgICBmdW5jdGlvbiBoYW5kbGVEZWxlZ2F0ZUV2ZW50KHBhcmVudDpFbGVtZW50LCBkZWxlZ2F0ZVNlbGVjdG9yOnN0cmluZywgY2FsbGJhY2s6KGU/Ok1vdXNlRXZlbnR8VG91Y2hFdmVudCkgPT4gdm9pZCkge1xuICAgICAgICByZXR1cm4gKGU6TW91c2VFdmVudHxUb3VjaEV2ZW50KSA9PiB7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gZS5zcmNFbGVtZW50IHx8IDxFbGVtZW50PmUudGFyZ2V0O1xuICAgICAgICAgICAgd2hpbGUodGFyZ2V0ICE9PSBudWxsICYmICF0YXJnZXQuaXNFcXVhbE5vZGUocGFyZW50KSkge1xuICAgICAgICAgICAgICAgIGlmIChtYXRjaGVzLmNhbGwodGFyZ2V0LCBkZWxlZ2F0ZVNlbGVjdG9yKSkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQucGFyZW50RWxlbWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBmdW5jdGlvbiBhdHRhY2hFdmVudHNEZWxlZ2F0ZShldmVudHM6c3RyaW5nW10sIHBhcmVudDpFbGVtZW50LCBkZWxlZ2F0ZVNlbGVjdG9yOnN0cmluZywgY2FsbGJhY2s6KGU/Ok1vdXNlRXZlbnR8VG91Y2hFdmVudCkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xuICAgICAgICBsZXQgbGlzdGVuZXJzOklMaXN0ZW5lclJlZmVyZW5jZVtdID0gW107XG4gICAgICAgIGZvciAobGV0IGtleSBpbiBldmVudHMpIHtcbiAgICAgICAgICAgIGxldCBldmVudDpzdHJpbmcgPSBldmVudHNba2V5XTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IG5ld0xpc3RlbmVyID0gaGFuZGxlRGVsZWdhdGVFdmVudChwYXJlbnQsIGRlbGVnYXRlU2VsZWN0b3IsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIGxpc3RlbmVycy5wdXNoKHtcbiAgICAgICAgICAgICAgICBlbGVtZW50OiBwYXJlbnQsXG4gICAgICAgICAgICAgICAgcmVmZXJlbmNlOiBuZXdMaXN0ZW5lcixcbiAgICAgICAgICAgICAgICBldmVudDogZXZlbnRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBwYXJlbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgbmV3TGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsaXN0ZW5lcnM7XG4gICAgfVxuICAgIFxuICAgIGZ1bmN0aW9uIGF0dGFjaEV2ZW50cyhldmVudHM6c3RyaW5nW10sIGVsZW1lbnQ6RWxlbWVudHxEb2N1bWVudHxXaW5kb3csIGNhbGxiYWNrOihlPzphbnkpID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdIHtcbiAgICAgICAgbGV0IGxpc3RlbmVyczpJTGlzdGVuZXJSZWZlcmVuY2VbXSA9IFtdO1xuICAgICAgICBldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxpc3RlbmVycy5wdXNoKHtcbiAgICAgICAgICAgICAgICBlbGVtZW50OiBlbGVtZW50LFxuICAgICAgICAgICAgICAgIHJlZmVyZW5jZTogY2FsbGJhY2ssXG4gICAgICAgICAgICAgICAgZXZlbnQ6IGV2ZW50XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgY2FsbGJhY2spOyBcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBsaXN0ZW5lcnM7XG4gICAgfVxuICAgIFxuICAgIC8vIE5BVElWRVxuICAgIFxuICAgIGV4cG9ydCBmdW5jdGlvbiBmb2N1cyhlbGVtZW50OkVsZW1lbnR8RG9jdW1lbnR8V2luZG93LCBjYWxsYmFjazooZT86Rm9jdXNFdmVudCkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xuICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzKFsnZm9jdXMnXSwgZWxlbWVudCwgKGUpID0+IHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGRvd24oZWxlbWVudDpFbGVtZW50fERvY3VtZW50fFdpbmRvdywgY2FsbGJhY2s6KGU/Ok1vdXNlRXZlbnR8VG91Y2hFdmVudCkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW107XG4gICAgZXhwb3J0IGZ1bmN0aW9uIGRvd24ocGFyZW50OkVsZW1lbnR8RG9jdW1lbnR8V2luZG93LCBkZWxlZ2F0ZVNlbGVjdG9yOnN0cmluZywgY2FsbGJhY2s6KGU/Ok1vdXNlRXZlbnR8VG91Y2hFdmVudCkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW107XG4gICAgZXhwb3J0IGZ1bmN0aW9uIGRvd24oLi4ucGFyYW1zOmFueVtdKSB7XG4gICAgICAgIGlmIChwYXJhbXMubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzRGVsZWdhdGUoWydtb3VzZWRvd24nLCAndG91Y2hzdGFydCddLCBwYXJhbXNbMF0sIHBhcmFtc1sxXSwgKGUpID0+IHtcbiAgICAgICAgICAgICAgICBwYXJhbXNbMl0oPGFueT5lKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ21vdXNlZG93bicsICd0b3VjaHN0YXJ0J10sIHBhcmFtc1swXSwgKGUpID0+IHtcbiAgICAgICAgICAgICAgICBwYXJhbXNbMV0oPGFueT5lKTtcbiAgICAgICAgICAgIH0pOyAgICAgICAgXG4gICAgICAgIH0gXG4gICAgfTtcbiAgICBcbiAgICBleHBvcnQgZnVuY3Rpb24gdXAoZWxlbWVudDpFbGVtZW50fERvY3VtZW50fFdpbmRvdywgY2FsbGJhY2s6KGU/Ok1vdXNlRXZlbnQpID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdIHtcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ21vdXNldXAnLCAndG91Y2hlbmQnXSwgZWxlbWVudCwgKGUpID0+IHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZXhwb3J0IGZ1bmN0aW9uIG1vdXNlZG93bihlbGVtZW50OkVsZW1lbnR8RG9jdW1lbnR8V2luZG93LCBjYWxsYmFjazooZT86TW91c2VFdmVudCkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xuICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzKFsnbW91c2Vkb3duJ10sIGVsZW1lbnQsIChlKSA9PiB7XG4gICAgICAgICAgICBjYWxsYmFjayhlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGV4cG9ydCBmdW5jdGlvbiBtb3VzZXVwKGVsZW1lbnQ6RWxlbWVudHxEb2N1bWVudHxXaW5kb3csIGNhbGxiYWNrOihlPzpNb3VzZUV2ZW50KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydtb3VzZXVwJ10sIGVsZW1lbnQsIChlKSA9PiB7XG4gICAgICAgICAgICBjYWxsYmFjayhlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGV4cG9ydCBmdW5jdGlvbiBwYXN0ZShlbGVtZW50OkVsZW1lbnR8RG9jdW1lbnR8V2luZG93LCBjYWxsYmFjazooZT86TW91c2VFdmVudCkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xuICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzKFsncGFzdGUnXSwgZWxlbWVudCwgKGUpID0+IHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHRhcChlbGVtZW50OkVsZW1lbnR8RG9jdW1lbnQsIGNhbGxiYWNrOihlPzpFdmVudCkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW107XG4gICAgZXhwb3J0IGZ1bmN0aW9uIHRhcChwYXJlbnQ6RWxlbWVudHxEb2N1bWVudCwgZGVsZWdhdGVTZWxlY3RvcjpzdHJpbmcsIGNhbGxiYWNrOihlPzpFdmVudCkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW107XG4gICAgZXhwb3J0IGZ1bmN0aW9uIHRhcCguLi5wYXJhbXM6YW55W10pOklMaXN0ZW5lclJlZmVyZW5jZVtdIHtcbiAgICAgICAgbGV0IHN0YXJ0VG91Y2hYOm51bWJlciwgc3RhcnRUb3VjaFk6bnVtYmVyO1xuICAgICAgICBcbiAgICAgICAgbGV0IGhhbmRsZVN0YXJ0ID0gKGU6VG91Y2hFdmVudCkgPT4ge1xuICAgICAgICAgICAgc3RhcnRUb3VjaFggPSBlLnRvdWNoZXNbMF0uY2xpZW50WDtcbiAgICAgICAgICAgIHN0YXJ0VG91Y2hZID0gZS50b3VjaGVzWzBdLmNsaWVudFk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGxldCBoYW5kbGVFbmQgPSAoZTpUb3VjaEV2ZW50LCBjYWxsYmFjazooZT86RXZlbnQpID0+IHZvaWQpID0+IHtcbiAgICAgICAgICAgIGlmIChlLmNoYW5nZWRUb3VjaGVzID09PSB2b2lkIDApIHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgeERpZmYgPSBlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFggLSBzdGFydFRvdWNoWDtcbiAgICAgICAgICAgIGxldCB5RGlmZiA9IGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WSAtIHN0YXJ0VG91Y2hZO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoTWF0aC5zcXJ0KHhEaWZmICogeERpZmYgKyB5RGlmZiAqIHlEaWZmKSA8IDEwKSB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBsZXQgbGlzdGVuZXJzOklMaXN0ZW5lclJlZmVyZW5jZVtdID0gW107XG4gICAgICAgIFxuICAgICAgICBpZiAocGFyYW1zLmxlbmd0aCA9PT0gMykge1xuICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChhdHRhY2hFdmVudHNEZWxlZ2F0ZShbJ3RvdWNoc3RhcnQnXSwgcGFyYW1zWzBdLCBwYXJhbXNbMV0sIGhhbmRsZVN0YXJ0KSk7XG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuY29uY2F0KGF0dGFjaEV2ZW50c0RlbGVnYXRlKFsndG91Y2hlbmQnLCAnY2xpY2snXSwgcGFyYW1zWzBdLCBwYXJhbXNbMV0sIChlOlRvdWNoRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBoYW5kbGVFbmQoZSwgcGFyYW1zWzJdKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSBlbHNlIGlmIChwYXJhbXMubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuY29uY2F0KGF0dGFjaEV2ZW50cyhbJ3RvdWNoc3RhcnQnXSwgcGFyYW1zWzBdLCBoYW5kbGVTdGFydCkpO1xuICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChhdHRhY2hFdmVudHMoWyd0b3VjaGVuZCcsICdjbGljayddLCBwYXJhbXNbMF0sIChlOlRvdWNoRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBoYW5kbGVFbmQoZSwgcGFyYW1zWzFdKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGlzdGVuZXJzO1xuICAgIH1cbiAgICBcbiAgICBmdW5jdGlvbiBzd2lwZShlbGVtZW50OkVsZW1lbnQsIGRpcmVjdGlvbjpzdHJpbmcsIGNhbGxiYWNrOihlPzpFdmVudCkgPT4gdm9pZCkge1xuICAgICAgICBsZXQgc3RhcnRUb3VjaFg6bnVtYmVyLCBzdGFydFRvdWNoWTpudW1iZXIsIHN0YXJ0VGltZTpudW1iZXI7XG4gICAgICAgIGxldCB0b3VjaE1vdmVMaXN0ZW5lcjpJTGlzdGVuZXJSZWZlcmVuY2U7XG4gICAgICAgIGxldCBzY3JvbGxpbmdEaXNhYmxlZDpib29sZWFuO1xuICAgICAgICBcbiAgICAgICAgYXR0YWNoRXZlbnRzKFsndG91Y2hzdGFydCddLCBlbGVtZW50LCAoZTpUb3VjaEV2ZW50KSA9PiB7XG4gICAgICAgICAgICBzdGFydFRvdWNoWCA9IGUudG91Y2hlc1swXS5jbGllbnRYO1xuICAgICAgICAgICAgc3RhcnRUb3VjaFkgPSBlLnRvdWNoZXNbMF0uY2xpZW50WTtcbiAgICAgICAgICAgIHN0YXJ0VGltZSA9IG5ldyBEYXRlKCkudmFsdWVPZigpO1xuICAgICAgICAgICAgc2Nyb2xsaW5nRGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRvdWNoTW92ZUxpc3RlbmVyID0gYXR0YWNoRXZlbnRzKFsndG91Y2htb3ZlJ10sIGRvY3VtZW50LCAoZTpUb3VjaEV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHhEaWZmID0gTWF0aC5hYnMoZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRYIC0gc3RhcnRUb3VjaFgpO1xuICAgICAgICAgICAgICAgIGxldCB5RGlmZiA9IE1hdGguYWJzKGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WSAtIHN0YXJ0VG91Y2hZKTtcbiAgICAgICAgICAgICAgICBpZiAoeERpZmYgPiB5RGlmZiAmJiB4RGlmZiA+IDIwKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbGluZ0Rpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHlEaWZmID4geERpZmYgJiYgeURpZmYgPiAyMCkge1xuICAgICAgICAgICAgICAgICAgICBzY3JvbGxpbmdEaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobmV3IERhdGUoKS52YWx1ZU9mKCkgLSBzdGFydFRpbWUgPiA1MDApIHtcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsaW5nRGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHNjcm9sbGluZ0Rpc2FibGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVswXTsgXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgYXR0YWNoRXZlbnRzKFsndG91Y2hlbmQnXSwgZWxlbWVudCwgKGU6VG91Y2hFdmVudCkgPT4ge1xuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0b3VjaE1vdmVMaXN0ZW5lci5ldmVudCwgdG91Y2hNb3ZlTGlzdGVuZXIucmVmZXJlbmNlKTtcbiAgICAgICAgICAgIGlmIChzdGFydFRvdWNoWCA9PT0gdm9pZCAwIHx8IHN0YXJ0VG91Y2hZID09PSB2b2lkIDApIHJldHVybjtcbiAgICAgICAgICAgIGlmIChuZXcgRGF0ZSgpLnZhbHVlT2YoKSAtIHN0YXJ0VGltZSA+IDUwMCkgcmV0dXJuO1xuICAgICAgICAgICAgbGV0IHhEaWZmID0gZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRYIC0gc3RhcnRUb3VjaFg7XG4gICAgICAgICAgICBsZXQgeURpZmYgPSBlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFkgLSBzdGFydFRvdWNoWTtcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyh4RGlmZikgPiBNYXRoLmFicyh5RGlmZikgJiYgTWF0aC5hYnMoeERpZmYpID4gMjApIHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJ2xlZnQnICYmIHhEaWZmIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJ3JpZ2h0JyAmJiB4RGlmZiA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHN3aXBlTGVmdChlbGVtZW50OkVsZW1lbnQsIGNhbGxiYWNrOihlPzpFdmVudCkgPT4gdm9pZCkge1xuICAgICAgICBzd2lwZShlbGVtZW50LCAnbGVmdCcsIGNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gc3dpcGVSaWdodChlbGVtZW50OkVsZW1lbnQsIGNhbGxiYWNrOihlPzpFdmVudCkgPT4gdm9pZCkge1xuICAgICAgICBzd2lwZShlbGVtZW50LCAncmlnaHQnLCBjYWxsYmFjayk7XG4gICAgfVxuICAgIFxuICAgIGV4cG9ydCBmdW5jdGlvbiBkcmFnKGVsZW1lbnQ6RWxlbWVudCwgY2FsbGJhY2tzOklEcmFnQ2FsbGJhY2tzKTp2b2lkO1xuICAgIGV4cG9ydCBmdW5jdGlvbiBkcmFnKHBhcmVudDpFbGVtZW50LCBkZWxlZ2F0ZVNlbGVjdG9yOnN0cmluZywgY2FsbGJhY2tzOklEcmFnQ2FsbGJhY2tzKTp2b2lkO1xuICAgIGV4cG9ydCBmdW5jdGlvbiBkcmFnKC4uLnBhcmFtczphbnlbXSk6dm9pZCB7XG4gICAgICAgIGxldCBkcmFnZ2luZzpib29sZWFuID0gZmFsc2U7XG4gICAgICAgIFxuICAgICAgICBsZXQgY2FsbGJhY2tzOklEcmFnQ2FsbGJhY2tzID0gcGFyYW1zW3BhcmFtcy5sZW5ndGgtMV07XG4gICAgICAgIFxuICAgICAgICBsZXQgc3RhcnRFdmVudHMgPSAoZT86TW91c2VFdmVudHxUb3VjaEV2ZW50KSA9PiB7XG4gICAgICAgICAgICBkcmFnZ2luZyA9IHRydWU7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2tzLmRyYWdTdGFydCAhPT0gdm9pZCAwKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2tzLmRyYWdTdGFydChlKTtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxldCBsaXN0ZW5lcnM6SUxpc3RlbmVyUmVmZXJlbmNlW10gPSBbXTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChhdHRhY2hFdmVudHMoWyd0b3VjaG1vdmUnLCAnbW91c2Vtb3ZlJ10sIGRvY3VtZW50LCAoZT86TW91c2VFdmVudHxUb3VjaEV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGRyYWdnaW5nICYmIGNhbGxiYWNrcy5kcmFnTW92ZSAhPT0gdm9pZCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrcy5kcmFnTW92ZShlKTtcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IGxpc3RlbmVycy5jb25jYXQoYXR0YWNoRXZlbnRzKFsndG91Y2hlbmQnLCAnbW91c2V1cCddLCBkb2N1bWVudCwgKGU/Ok1vdXNlRXZlbnR8VG91Y2hFdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChkcmFnZ2luZyAmJiBjYWxsYmFja3MuZHJhZ0VuZCAhPT0gdm9pZCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrcy5kcmFnRW5kKGUpO1xuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRyYWdnaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgcmVtb3ZlTGlzdGVuZXJzKGxpc3RlbmVycyk7ICAgICAgICAgICAgXG4gICAgICAgICAgICB9KSk7ICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKHBhcmFtcy5sZW5ndGggPT09IDMpIHtcbiAgICAgICAgICAgIGF0dGFjaEV2ZW50c0RlbGVnYXRlKFsndG91Y2hzdGFydCcsICdtb3VzZWRvd24nXSwgcGFyYW1zWzBdLCBwYXJhbXNbMV0sIHN0YXJ0RXZlbnRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGF0dGFjaEV2ZW50cyhbJ3RvdWNoc3RhcnQnLCAnbW91c2Vkb3duJ10sIHBhcmFtc1swXSwgc3RhcnRFdmVudHMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIENVU1RPTVxuICAgIFxuICAgIGV4cG9ydCBmdW5jdGlvbiBnb3RvKGVsZW1lbnQ6RWxlbWVudCwgY2FsbGJhY2s6KGU/OntkYXRlOkRhdGUsIGxldmVsOkxldmVsLCB1cGRhdGU/OmJvb2xlYW59KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydkYXRpdW0tZ290byddLCBlbGVtZW50LCAoZTpDdXN0b21FdmVudCkgPT4ge1xuICAgICAgICAgICAgY2FsbGJhY2soZS5kZXRhaWwpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHpvb21PdXQoZWxlbWVudDpFbGVtZW50LCBjYWxsYmFjazooZT86e2RhdGU6RGF0ZSwgY3VycmVudExldmVsOkxldmVsLCB1cGRhdGU/OmJvb2xlYW59KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydkYXRpdW0tem9vbS1vdXQnXSwgZWxlbWVudCwgKGU6Q3VzdG9tRXZlbnQpID0+IHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGUuZGV0YWlsKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGV4cG9ydCBmdW5jdGlvbiB6b29tSW4oZWxlbWVudDpFbGVtZW50LCBjYWxsYmFjazooZT86e2RhdGU6RGF0ZSwgY3VycmVudExldmVsOkxldmVsLCB1cGRhdGU/OmJvb2xlYW59KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydkYXRpdW0tem9vbS1pbiddLCBlbGVtZW50LCAoZTpDdXN0b21FdmVudCkgPT4ge1xuICAgICAgICAgICAgY2FsbGJhY2soZS5kZXRhaWwpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHZpZXdjaGFuZ2VkKGVsZW1lbnQ6RWxlbWVudCwgY2FsbGJhY2s6KGU/OntkYXRlOkRhdGUsIGxldmVsOkxldmVsLCB1cGRhdGU/OmJvb2xlYW59KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydkYXRpdW0tdmlld2NoYW5nZWQnXSwgZWxlbWVudCwgKGU6Q3VzdG9tRXZlbnQpID0+IHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGUuZGV0YWlsKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGV4cG9ydCBmdW5jdGlvbiBvcGVuQnViYmxlKGVsZW1lbnQ6RWxlbWVudCwgY2FsbGJhY2s6KGU6e3g6bnVtYmVyLCB5Om51bWJlciwgdGV4dDpzdHJpbmd9KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydkYXRpdW0tb3Blbi1idWJibGUnXSwgZWxlbWVudCwgKGU6Q3VzdG9tRXZlbnQpID0+IHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGUuZGV0YWlsKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGV4cG9ydCBmdW5jdGlvbiB1cGRhdGVCdWJibGUoZWxlbWVudDpFbGVtZW50LCBjYWxsYmFjazooZTp7eDpudW1iZXIsIHk6bnVtYmVyLCB0ZXh0OnN0cmluZ30pID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdIHtcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ2RhdGl1bS11cGRhdGUtYnViYmxlJ10sIGVsZW1lbnQsIChlOkN1c3RvbUV2ZW50KSA9PiB7XG4gICAgICAgICAgICBjYWxsYmFjayhlLmRldGFpbCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBleHBvcnQgZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXJzKGxpc3RlbmVyczpJTGlzdGVuZXJSZWZlcmVuY2VbXSkge1xuICAgICAgICBsaXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIpID0+IHtcbiAgICAgICAgICAgbGlzdGVuZXIuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGxpc3RlbmVyLmV2ZW50LCBsaXN0ZW5lci5yZWZlcmVuY2UpOyBcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5uYW1lc3BhY2UgdHJpZ2dlciB7XG4gICAgZXhwb3J0IGZ1bmN0aW9uIGdvdG8oZWxlbWVudDpFbGVtZW50LCBkYXRhPzp7ZGF0ZTpEYXRlLCBsZXZlbDpMZXZlbCwgdXBkYXRlPzpib29sZWFufSkge1xuICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdkYXRpdW0tZ290bycsIHtcbiAgICAgICAgICAgIGJ1YmJsZXM6IGZhbHNlLFxuICAgICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGRldGFpbDogZGF0YVxuICAgICAgICB9KSk7XG4gICAgfVxuICAgIFxuICAgIGV4cG9ydCBmdW5jdGlvbiB6b29tT3V0KGVsZW1lbnQ6RWxlbWVudCwgZGF0YT86e2RhdGU6RGF0ZSwgY3VycmVudExldmVsOkxldmVsLCB1cGRhdGU/OmJvb2xlYW59KSB7XG4gICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2RhdGl1bS16b29tLW91dCcsIHtcbiAgICAgICAgICAgIGJ1YmJsZXM6IGZhbHNlLCBcbiAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICAgICAgICBkZXRhaWw6IGRhdGFcbiAgICAgICAgfSkpO1xuICAgIH1cbiAgICBcbiAgICBleHBvcnQgZnVuY3Rpb24gem9vbUluKGVsZW1lbnQ6RWxlbWVudCwgZGF0YT86e2RhdGU6RGF0ZSwgY3VycmVudExldmVsOkxldmVsLCB1cGRhdGU/OmJvb2xlYW59KSB7XG4gICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2RhdGl1bS16b29tLWluJywge1xuICAgICAgICAgICAgYnViYmxlczogZmFsc2UsIFxuICAgICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGRldGFpbDogZGF0YVxuICAgICAgICB9KSk7XG4gICAgfVxuICAgIFxuICAgIGV4cG9ydCBmdW5jdGlvbiB2aWV3Y2hhbmdlZChlbGVtZW50OkVsZW1lbnQsIGRhdGE/OntkYXRlOkRhdGUsIGxldmVsOkxldmVsLCB1cGRhdGU/OmJvb2xlYW59KSB7XG4gICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2RhdGl1bS12aWV3Y2hhbmdlZCcsIHtcbiAgICAgICAgICAgIGJ1YmJsZXM6IGZhbHNlLFxuICAgICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGRldGFpbDogZGF0YVxuICAgICAgICB9KSk7XG4gICAgfVxuICAgIFxuICAgIGV4cG9ydCBmdW5jdGlvbiBvcGVuQnViYmxlKGVsZW1lbnQ6RWxlbWVudCwgZGF0YTp7eDpudW1iZXIsIHk6bnVtYmVyLCB0ZXh0OnN0cmluZ30pIHtcbiAgICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnZGF0aXVtLW9wZW4tYnViYmxlJywge1xuICAgICAgICAgICAgYnViYmxlczogZmFsc2UsXG4gICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZGV0YWlsOiBkYXRhXG4gICAgICAgIH0pKTtcbiAgICB9XG4gICAgXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZUJ1YmJsZShlbGVtZW50OkVsZW1lbnQsIGRhdGE6e3g6bnVtYmVyLCB5Om51bWJlciwgdGV4dDpzdHJpbmd9KSB7XG4gICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2RhdGl1bS11cGRhdGUtYnViYmxlJywge1xuICAgICAgICAgICAgYnViYmxlczogZmFsc2UsXG4gICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZGV0YWlsOiBkYXRhXG4gICAgICAgIH0pKTtcbiAgICB9XG59IiwiaW50ZXJmYWNlIElEYXRlUGFydCB7XG4gICAgaW5jcmVtZW50KCk6dm9pZDtcbiAgICBkZWNyZW1lbnQoKTp2b2lkO1xuICAgIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpOmJvb2xlYW47XG4gICAgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpOmJvb2xlYW47XG4gICAgZ2V0VmFsdWUoKTpEYXRlO1xuICAgIGdldFJlZ0V4KCk6UmVnRXhwO1xuICAgIHNldFNlbGVjdGFibGUoc2VsZWN0YWJsZTpib29sZWFuKTpJRGF0ZVBhcnQ7XG4gICAgZ2V0TWF4QnVmZmVyKCk6bnVtYmVyO1xuICAgIGdldExldmVsKCk6TGV2ZWw7XG4gICAgaXNTZWxlY3RhYmxlKCk6Ym9vbGVhbjtcbiAgICB0b1N0cmluZygpOnN0cmluZztcbn1cblxuY2xhc3MgUGxhaW5UZXh0IGltcGxlbWVudHMgSURhdGVQYXJ0IHtcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHRleHQ6c3RyaW5nKSB7fVxuICAgIHB1YmxpYyBpbmNyZW1lbnQoKSB7fVxuICAgIHB1YmxpYyBkZWNyZW1lbnQoKSB7fVxuICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKCkgeyByZXR1cm4gZmFsc2UgfVxuICAgIHB1YmxpYyBzZXRWYWx1ZSgpIHsgcmV0dXJuIGZhbHNlIH1cbiAgICBwdWJsaWMgZ2V0VmFsdWUoKTpEYXRlIHsgcmV0dXJuIG51bGwgfVxuICAgIHB1YmxpYyBnZXRSZWdFeCgpOlJlZ0V4cCB7IHJldHVybiBuZXcgUmVnRXhwKGBbJHt0aGlzLnRleHR9XWApOyB9XG4gICAgcHVibGljIHNldFNlbGVjdGFibGUoc2VsZWN0YWJsZTpib29sZWFuKTpJRGF0ZVBhcnQgeyByZXR1cm4gdGhpcyB9XG4gICAgcHVibGljIGdldE1heEJ1ZmZlcigpOm51bWJlciB7IHJldHVybiAwIH1cbiAgICBwdWJsaWMgZ2V0TGV2ZWwoKTpMZXZlbCB7IHJldHVybiBMZXZlbC5OT05FIH1cbiAgICBwdWJsaWMgaXNTZWxlY3RhYmxlKCk6Ym9vbGVhbiB7IHJldHVybiBmYWxzZSB9XG4gICAgcHVibGljIHRvU3RyaW5nKCk6c3RyaW5nIHsgcmV0dXJuIHRoaXMudGV4dCB9XG59XG4gICAgXG5sZXQgZm9ybWF0QmxvY2tzID0gKGZ1bmN0aW9uKCkgeyAgICBcbiAgICBjbGFzcyBEYXRlUGFydCBleHRlbmRzIENvbW1vbiB7XG4gICAgICAgIHByb3RlY3RlZCBkYXRlOkRhdGU7XG4gICAgICAgIHByb3RlY3RlZCBzZWxlY3RhYmxlOmJvb2xlYW4gPSB0cnVlO1xuICAgICAgICBcbiAgICAgICAgcHVibGljIGdldFZhbHVlKCk6RGF0ZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBzZXRTZWxlY3RhYmxlKHNlbGVjdGFibGU6Ym9vbGVhbikge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RhYmxlID0gc2VsZWN0YWJsZTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgaXNTZWxlY3RhYmxlKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0YWJsZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBjbGFzcyBGb3VyRGlnaXRZZWFyIGV4dGVuZHMgRGF0ZVBhcnQge1xuICAgICAgICBwdWJsaWMgaW5jcmVtZW50KCkge1xuICAgICAgICAgICAgdGhpcy5kYXRlLnNldEZ1bGxZZWFyKHRoaXMuZGF0ZS5nZXRGdWxsWWVhcigpICsgMSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBkZWNyZW1lbnQoKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0RnVsbFllYXIodGhpcy5kYXRlLmdldEZ1bGxZZWFyKCkgLSAxKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHBhcnRpYWwpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0RnVsbFllYXIocGFyc2VJbnQodmFsdWUsIDEwKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcbiAgICAgICAgICAgIHJldHVybiAvXi0/XFxkezEsNH0kLztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcbiAgICAgICAgICAgIHJldHVybiA0O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XG4gICAgICAgICAgICByZXR1cm4gTGV2ZWwuWUVBUjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXRGdWxsWWVhcigpLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgY2xhc3MgVHdvRGlnaXRZZWFyIGV4dGVuZHMgRm91ckRpZ2l0WWVhciB7XG4gICAgICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKSB7XG4gICAgICAgICAgICByZXR1cm4gMjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKHZhbHVlLnZhbHVlT2YoKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgbGV0IGJhc2UgPSBNYXRoLmZsb29yKHN1cGVyLmdldFZhbHVlKCkuZ2V0RnVsbFllYXIoKS8xMDApKjEwMDtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0RnVsbFllYXIocGFyc2VJbnQoPHN0cmluZz52YWx1ZSwgMTApICsgYmFzZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcbiAgICAgICAgICAgIHJldHVybiAvXi0/XFxkezEsMn0kLztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLnRvU3RyaW5nKCkuc2xpY2UoLTIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGNsYXNzIExvbmdNb250aE5hbWUgZXh0ZW5kcyBEYXRlUGFydCB7XG4gICAgICAgIHByb3RlY3RlZCBnZXRNb250aHMoKSB7XG4gICAgICAgICAgICByZXR1cm4gc3VwZXIuZ2V0TW9udGhzKCk7XG4gICAgICAgIH0gXG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgaW5jcmVtZW50KCkge1xuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRNb250aCgpICsgMTtcbiAgICAgICAgICAgIGlmIChudW0gPiAxMSkgbnVtID0gMDtcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRNb250aChudW0pO1xuICAgICAgICAgICAgd2hpbGUgKHRoaXMuZGF0ZS5nZXRNb250aCgpID4gbnVtKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldERhdGUodGhpcy5kYXRlLmdldERhdGUoKSAtIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgZGVjcmVtZW50KCkge1xuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRNb250aCgpIC0gMTtcbiAgICAgICAgICAgIGlmIChudW0gPCAwKSBudW0gPSAxMTtcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRNb250aChudW0pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xuICAgICAgICAgICAgbGV0IG1vbnRoID0gdGhpcy5nZXRNb250aHMoKS5maWx0ZXIoKG1vbnRoKSA9PiB7XG4gICAgICAgICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cChgXiR7cGFydGlhbH0uKiRgLCAnaScpLnRlc3QobW9udGgpOyBcbiAgICAgICAgICAgIH0pWzBdO1xuICAgICAgICAgICAgaWYgKG1vbnRoICE9PSB2b2lkIDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZShtb250aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHRoaXMuZ2V0UmVnRXgoKS50ZXN0KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmdldE1vbnRocygpLmluZGV4T2YodmFsdWUpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRNb250aChudW0pO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cChgXigoJHt0aGlzLmdldE1vbnRocygpLmpvaW4oXCIpfChcIil9KSkkYCwgJ2knKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcbiAgICAgICAgICAgIHJldHVybiBbMiwxLDMsMiwzLDMsMywyLDEsMSwxLDFdW3RoaXMuZGF0ZS5nZXRNb250aCgpXTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGdldExldmVsKCkge1xuICAgICAgICAgICAgcmV0dXJuIExldmVsLk1PTlRIO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRNb250aHMoKVt0aGlzLmRhdGUuZ2V0TW9udGgoKV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgY2xhc3MgU2hvcnRNb250aE5hbWUgZXh0ZW5kcyBMb25nTW9udGhOYW1lIHtcbiAgICAgICAgcHJvdGVjdGVkIGdldE1vbnRocygpIHtcbiAgICAgICAgICAgIHJldHVybiBzdXBlci5nZXRTaG9ydE1vbnRocygpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGNsYXNzIE1vbnRoIGV4dGVuZHMgTG9uZ01vbnRoTmFtZSB7XG4gICAgICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldE1vbnRoKCkgPiAwID8gMSA6IDI7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XG4gICAgICAgICAgICBpZiAoL15cXGR7MSwyfSQvLnRlc3QocGFydGlhbCkpIHtcbiAgICAgICAgICAgICAgICBsZXQgdHJpbW1lZCA9IHRoaXMudHJpbShwYXJ0aWFsID09PSAnMCcgPyAnMScgOiBwYXJ0aWFsKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0cmltbWVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKHZhbHVlLnZhbHVlT2YoKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1vbnRoKHBhcnNlSW50KHZhbHVlLCAxMCkgLSAxKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xuICAgICAgICAgICAgcmV0dXJuIC9eKFsxLTldfCgxWzAtMl0pKSQvO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gKHRoaXMuZGF0ZS5nZXRNb250aCgpICsgMSkudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBjbGFzcyBQYWRkZWRNb250aCBleHRlbmRzIE1vbnRoIHtcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcbiAgICAgICAgICAgIGlmICgvXlxcZHsxLDJ9JC8udGVzdChwYXJ0aWFsKSkge1xuICAgICAgICAgICAgICAgIGxldCBwYWRkZWQgPSB0aGlzLnBhZChwYXJ0aWFsID09PSAnMCcgPyAnMScgOiBwYXJ0aWFsKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZShwYWRkZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XG4gICAgICAgICAgICByZXR1cm4gL14oKDBbMS05XSl8KDFbMC0yXSkpJC87ICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhZChzdXBlci50b1N0cmluZygpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBjbGFzcyBEYXRlTnVtZXJhbCBleHRlbmRzIERhdGVQYXJ0IHtcbiAgICAgICAgcHVibGljIGluY3JlbWVudCgpIHtcbiAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0RGF0ZSgpICsgMTtcbiAgICAgICAgICAgIGlmIChudW0gPiB0aGlzLmRheXNJbk1vbnRoKHRoaXMuZGF0ZSkpIG51bSA9IDE7XG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0RGF0ZShudW0pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgZGVjcmVtZW50KCkge1xuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXREYXRlKCkgLSAxO1xuICAgICAgICAgICAgaWYgKG51bSA8IDEpIG51bSA9IHRoaXMuZGF5c0luTW9udGgodGhpcy5kYXRlKTtcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXREYXRlKG51bSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XG4gICAgICAgICAgICBpZiAoL15cXGR7MSwyfSQvLnRlc3QocGFydGlhbCkpIHtcbiAgICAgICAgICAgICAgICBsZXQgdHJpbW1lZCA9IHRoaXMudHJpbShwYXJ0aWFsID09PSAnMCcgPyAnMScgOiBwYXJ0aWFsKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0cmltbWVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKHZhbHVlLnZhbHVlT2YoKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpICYmIHBhcnNlSW50KHZhbHVlLCAxMCkgPCB0aGlzLmRheXNJbk1vbnRoKHRoaXMuZGF0ZSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0RGF0ZShwYXJzZUludCh2YWx1ZSwgMTApKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xuICAgICAgICAgICAgcmV0dXJuIC9eWzEtOV18KCgxfDIpWzAtOV0pfCgzWzAtMV0pJC87XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldERhdGUoKSA+IE1hdGguZmxvb3IodGhpcy5kYXlzSW5Nb250aCh0aGlzLmRhdGUpLzEwKSA/IDEgOiAyO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XG4gICAgICAgICAgICByZXR1cm4gTGV2ZWwuREFURTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXREYXRlKCkudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBjbGFzcyBQYWRkZWREYXRlIGV4dGVuZHMgRGF0ZU51bWVyYWwge1xuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xuICAgICAgICAgICAgaWYgKC9eXFxkezEsMn0kLy50ZXN0KHBhcnRpYWwpKSB7XG4gICAgICAgICAgICAgICAgbGV0IHBhZGRlZCA9IHRoaXMucGFkKHBhcnRpYWwgPT09ICcwJyA/ICcxJyA6IHBhcnRpYWwpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHBhZGRlZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcbiAgICAgICAgICAgIHJldHVybiAvXigwWzEtOV0pfCgoMXwyKVswLTldKXwoM1swLTFdKSQvO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYWQodGhpcy5kYXRlLmdldERhdGUoKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgY2xhc3MgRGF0ZU9yZGluYWwgZXh0ZW5kcyBEYXRlTnVtZXJhbCB7XG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcbiAgICAgICAgICAgIHJldHVybiAvXihbMS05XXwoKDF8MilbMC05XSl8KDNbMC0xXSkpKChzdCl8KG5kKXwocmQpfCh0aCkpPyQvaTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgbGV0IGRhdGUgPSB0aGlzLmRhdGUuZ2V0RGF0ZSgpO1xuICAgICAgICAgICAgbGV0IGogPSBkYXRlICUgMTA7XG4gICAgICAgICAgICBsZXQgayA9IGRhdGUgJSAxMDA7XG4gICAgICAgICAgICBpZiAoaiA9PT0gMSAmJiBrICE9PSAxMSkgcmV0dXJuIGRhdGUgKyBcInN0XCI7XG4gICAgICAgICAgICBpZiAoaiA9PT0gMiAmJiBrICE9PSAxMikgcmV0dXJuIGRhdGUgKyBcIm5kXCI7XG4gICAgICAgICAgICBpZiAoaiA9PT0gMyAmJiBrICE9PSAxMykgcmV0dXJuIGRhdGUgKyBcInJkXCI7XG4gICAgICAgICAgICByZXR1cm4gZGF0ZSArIFwidGhcIjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBjbGFzcyBMb25nRGF5TmFtZSBleHRlbmRzIERhdGVQYXJ0IHtcbiAgICAgICAgcHJvdGVjdGVkIGdldERheXMoKSB7XG4gICAgICAgICAgICByZXR1cm4gc3VwZXIuZ2V0RGF5cygpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgaW5jcmVtZW50KCkge1xuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXREYXkoKSArIDE7XG4gICAgICAgICAgICBpZiAobnVtID4gNikgbnVtID0gMDtcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXREYXRlKHRoaXMuZGF0ZS5nZXREYXRlKCkgLSB0aGlzLmRhdGUuZ2V0RGF5KCkgKyBudW0pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgZGVjcmVtZW50KCkge1xuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXREYXkoKSAtIDE7XG4gICAgICAgICAgICBpZiAobnVtIDwgMCkgbnVtID0gNjtcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXREYXRlKHRoaXMuZGF0ZS5nZXREYXRlKCkgLSB0aGlzLmRhdGUuZ2V0RGF5KCkgKyBudW0pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xuICAgICAgICAgICAgbGV0IGRheSA9IHRoaXMuZ2V0RGF5cygpLmZpbHRlcigoZGF5KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoYF4ke3BhcnRpYWx9LiokYCwgJ2knKS50ZXN0KGRheSk7XG4gICAgICAgICAgICB9KVswXTtcbiAgICAgICAgICAgIGlmIChkYXkgIT09IHZvaWQgMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKGRheSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHRoaXMuZ2V0UmVnRXgoKS50ZXN0KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmdldERheXMoKS5pbmRleE9mKHZhbHVlKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0RGF0ZSh0aGlzLmRhdGUuZ2V0RGF0ZSgpIC0gdGhpcy5kYXRlLmdldERheSgpICsgbnVtKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoYF4oKCR7dGhpcy5nZXREYXlzKCkuam9pbihcIil8KFwiKX0pKSRgLCAnaScpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgZ2V0TWF4QnVmZmVyKCkge1xuICAgICAgICAgICAgcmV0dXJuIFsyLDEsMiwxLDIsMSwyXVt0aGlzLmRhdGUuZ2V0RGF5KCldO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XG4gICAgICAgICAgICByZXR1cm4gTGV2ZWwuREFURTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RGF5cygpW3RoaXMuZGF0ZS5nZXREYXkoKV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgY2xhc3MgU2hvcnREYXlOYW1lIGV4dGVuZHMgTG9uZ0RheU5hbWUge1xuICAgICAgICBwcm90ZWN0ZWQgZ2V0RGF5cygpIHtcbiAgICAgICAgICAgIHJldHVybiBzdXBlci5nZXRTaG9ydERheXMoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBjbGFzcyBQYWRkZWRNaWxpdGFyeUhvdXIgZXh0ZW5kcyBEYXRlUGFydCB7XG4gICAgICAgIHB1YmxpYyBpbmNyZW1lbnQoKSB7XG4gICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldEhvdXJzKCkgKyAxO1xuICAgICAgICAgICAgaWYgKG51bSA+IDIzKSBudW0gPSAwO1xuICAgICAgICAgICAgdGhpcy5kYXRlLnNldEhvdXJzKG51bSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBkZWNyZW1lbnQoKSB7XG4gICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldEhvdXJzKCkgLSAxO1xuICAgICAgICAgICAgaWYgKG51bSA8IDApIG51bSA9IDIzO1xuICAgICAgICAgICAgdGhpcy5kYXRlLnNldEhvdXJzKG51bSk7XG4gICAgICAgICAgICAvLyBEYXkgTGlnaHQgU2F2aW5ncyBBZGp1c3RtZW50XG4gICAgICAgICAgICBpZiAodGhpcy5kYXRlLmdldEhvdXJzKCkgIT09IG51bSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3VycyhudW0gLSAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcbiAgICAgICAgICAgIGlmICgvXlxcZHsxLDJ9JC8udGVzdChwYXJ0aWFsKSkge1xuICAgICAgICAgICAgICAgIGxldCBwYWRkZWQgPSB0aGlzLnBhZChwYXJ0aWFsKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZShwYWRkZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnMocGFyc2VJbnQodmFsdWUsIDEwKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldEhvdXJzKCkgPiAyID8gMSA6IDI7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcbiAgICAgICAgICAgIHJldHVybiBMZXZlbC5IT1VSO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XG4gICAgICAgICAgICByZXR1cm4gL14oKCgwfDEpWzAtOV0pfCgyWzAtM10pKSQvO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYWQodGhpcy5kYXRlLmdldEhvdXJzKCkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGNsYXNzIE1pbGl0YXJ5SG91ciBleHRlbmRzIFBhZGRlZE1pbGl0YXJ5SG91ciB7XG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XG4gICAgICAgICAgICBpZiAoL15cXGR7MSwyfSQvLnRlc3QocGFydGlhbCkpIHtcbiAgICAgICAgICAgICAgICBsZXQgdHJpbW1lZCA9IHRoaXMudHJpbShwYXJ0aWFsKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0cmltbWVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xuICAgICAgICAgICAgcmV0dXJuIC9eKCgxP1swLTldKXwoMlswLTNdKSkkLztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXRIb3VycygpLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgY2xhc3MgUGFkZGVkSG91ciBleHRlbmRzIFBhZGRlZE1pbGl0YXJ5SG91ciB7XG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XG4gICAgICAgICAgICBsZXQgcGFkZGVkID0gdGhpcy5wYWQocGFydGlhbCA9PT0gJzAnID8gJzEnIDogcGFydGlhbCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZShwYWRkZWQpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBsZXQgbnVtID0gcGFyc2VJbnQodmFsdWUsIDEwKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kYXRlLmdldEhvdXJzKCkgPCAxMiAmJiBudW0gPT09IDEyKSBudW0gPSAwO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmRhdGUuZ2V0SG91cnMoKSA+IDExICYmIG51bSAhPT0gMTIpIG51bSArPSAxMjtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnMobnVtKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xuICAgICAgICAgICAgcmV0dXJuIC9eKDBbMS05XSl8KDFbMC0yXSkkLztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJzZUludCh0aGlzLnRvU3RyaW5nKCksIDEwKSA+IDEgPyAxIDogMjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFkKHRoaXMuZ2V0SG91cnModGhpcy5kYXRlKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgY2xhc3MgSG91ciBleHRlbmRzIFBhZGRlZEhvdXIge1xuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xuICAgICAgICAgICAgbGV0IHRyaW1tZWQgPSB0aGlzLnRyaW0ocGFydGlhbCA9PT0gJzAnID8gJzEnIDogcGFydGlhbCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0cmltbWVkKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xuICAgICAgICAgICAgcmV0dXJuIC9eWzEtOV18KDFbMC0yXSkkLztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudHJpbShzdXBlci50b1N0cmluZygpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBjbGFzcyBQYWRkZWRNaW51dGUgZXh0ZW5kcyBEYXRlUGFydCB7XG4gICAgICAgIHB1YmxpYyBpbmNyZW1lbnQoKSB7XG4gICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldE1pbnV0ZXMoKSArIDE7XG4gICAgICAgICAgICBpZiAobnVtID4gNTkpIG51bSA9IDA7XG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0TWludXRlcyhudW0pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgZGVjcmVtZW50KCkge1xuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRNaW51dGVzKCkgLSAxO1xuICAgICAgICAgICAgaWYgKG51bSA8IDApIG51bSA9IDU5O1xuICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1pbnV0ZXMobnVtKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHRoaXMucGFkKHBhcnRpYWwpKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKHZhbHVlLnZhbHVlT2YoKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1pbnV0ZXMocGFyc2VJbnQodmFsdWUsIDEwKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcbiAgICAgICAgICAgIHJldHVybiAvXlswLTVdWzAtOV0kLztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0TWludXRlcygpID4gNSA/IDEgOiAyO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XG4gICAgICAgICAgICByZXR1cm4gTGV2ZWwuTUlOVVRFO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYWQodGhpcy5kYXRlLmdldE1pbnV0ZXMoKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgY2xhc3MgTWludXRlIGV4dGVuZHMgUGFkZGVkTWludXRlIHtcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHRoaXMudHJpbShwYXJ0aWFsKSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcbiAgICAgICAgICAgIHJldHVybiAvXlswLTVdP1swLTldJC87XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0TWludXRlcygpLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgY2xhc3MgUGFkZGVkU2Vjb25kIGV4dGVuZHMgRGF0ZVBhcnQge1xuICAgICAgICBwdWJsaWMgaW5jcmVtZW50KCkge1xuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRTZWNvbmRzKCkgKyAxO1xuICAgICAgICAgICAgaWYgKG51bSA+IDU5KSBudW0gPSAwO1xuICAgICAgICAgICAgdGhpcy5kYXRlLnNldFNlY29uZHMobnVtKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGRlY3JlbWVudCgpIHtcbiAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0U2Vjb25kcygpIC0gMTtcbiAgICAgICAgICAgIGlmIChudW0gPCAwKSBudW0gPSA1OTtcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRTZWNvbmRzKG51bSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0aGlzLnBhZChwYXJ0aWFsKSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHRoaXMuZ2V0UmVnRXgoKS50ZXN0KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRTZWNvbmRzKHBhcnNlSW50KHZhbHVlLCAxMCkpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XG4gICAgICAgICAgICByZXR1cm4gL15bMC01XVswLTldJC87XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldFNlY29uZHMoKSA+IDUgPyAxIDogMjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGdldExldmVsKCkge1xuICAgICAgICAgICAgcmV0dXJuIExldmVsLlNFQ09ORDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFkKHRoaXMuZGF0ZS5nZXRTZWNvbmRzKCkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGNsYXNzIFNlY29uZCBleHRlbmRzIFBhZGRlZFNlY29uZCB7XG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0aGlzLnRyaW0ocGFydGlhbCkpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XG4gICAgICAgICAgICByZXR1cm4gL15bMC01XT9bMC05XSQvO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldFNlY29uZHMoKS50b1N0cmluZygpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBjbGFzcyBVcHBlcmNhc2VNZXJpZGllbSBleHRlbmRzIERhdGVQYXJ0IHtcbiAgICAgICAgcHVibGljIGluY3JlbWVudCgpIHtcbiAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0SG91cnMoKSArIDEyO1xuICAgICAgICAgICAgaWYgKG51bSA+IDIzKSBudW0gLT0gMjQ7XG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnMobnVtKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGRlY3JlbWVudCgpIHtcbiAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0SG91cnMoKSAtIDEyO1xuICAgICAgICAgICAgaWYgKG51bSA8IDApIG51bSArPSAyNDtcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3VycyhudW0pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xuICAgICAgICAgICAgaWYgKC9eKChBTT8pfChQTT8pKSQvaS50ZXN0KHBhcnRpYWwpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUocGFydGlhbFswXSA9PT0gJ0EnID8gJ0FNJyA6ICdQTScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUudG9Mb3dlckNhc2UoKSA9PT0gJ2FtJyAmJiB0aGlzLmRhdGUuZ2V0SG91cnMoKSA+IDExKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3Vycyh0aGlzLmRhdGUuZ2V0SG91cnMoKSAtIDEyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlLnRvTG93ZXJDYXNlKCkgPT09ICdwbScgJiYgdGhpcy5kYXRlLmdldEhvdXJzKCkgPCAxMikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnModGhpcy5kYXRlLmdldEhvdXJzKCkgKyAxMik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XG4gICAgICAgICAgICByZXR1cm4gTGV2ZWwuSE9VUjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcbiAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XG4gICAgICAgICAgICByZXR1cm4gL14oKGFtKXwocG0pKSQvaTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0TWVyaWRpZW0odGhpcy5kYXRlKS50b1VwcGVyQ2FzZSgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGNsYXNzIExvd2VyY2FzZU1lcmlkaWVtIGV4dGVuZHMgVXBwZXJjYXNlTWVyaWRpZW0ge1xuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRNZXJpZGllbSh0aGlzLmRhdGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGxldCBmb3JtYXRCbG9ja3M6eyBba2V5OnN0cmluZ106IG5ldyAoKSA9PiBJRGF0ZVBhcnQ7IH0gPSB7fTtcbiAgICBcbiAgICBmb3JtYXRCbG9ja3NbJ1lZWVknXSA9IEZvdXJEaWdpdFllYXI7XG4gICAgZm9ybWF0QmxvY2tzWydZWSddID0gVHdvRGlnaXRZZWFyO1xuICAgIGZvcm1hdEJsb2Nrc1snTU1NTSddID0gTG9uZ01vbnRoTmFtZTtcbiAgICBmb3JtYXRCbG9ja3NbJ01NTSddID0gU2hvcnRNb250aE5hbWU7XG4gICAgZm9ybWF0QmxvY2tzWydNTSddID0gUGFkZGVkTW9udGg7XG4gICAgZm9ybWF0QmxvY2tzWydNJ10gPSBNb250aDtcbiAgICBmb3JtYXRCbG9ja3NbJ0REJ10gPSBQYWRkZWREYXRlO1xuICAgIGZvcm1hdEJsb2Nrc1snRG8nXSA9IERhdGVPcmRpbmFsO1xuICAgIGZvcm1hdEJsb2Nrc1snRCddID0gRGF0ZU51bWVyYWw7XG4gICAgZm9ybWF0QmxvY2tzWydkZGRkJ10gPSBMb25nRGF5TmFtZTtcbiAgICBmb3JtYXRCbG9ja3NbJ2RkZCddID0gU2hvcnREYXlOYW1lO1xuICAgIGZvcm1hdEJsb2Nrc1snSEgnXSA9IFBhZGRlZE1pbGl0YXJ5SG91cjtcbiAgICBmb3JtYXRCbG9ja3NbJ2hoJ10gPSBQYWRkZWRIb3VyO1xuICAgIGZvcm1hdEJsb2Nrc1snSCddID0gTWlsaXRhcnlIb3VyO1xuICAgIGZvcm1hdEJsb2Nrc1snaCddID0gSG91cjtcbiAgICBmb3JtYXRCbG9ja3NbJ0EnXSA9IFVwcGVyY2FzZU1lcmlkaWVtO1xuICAgIGZvcm1hdEJsb2Nrc1snYSddID0gTG93ZXJjYXNlTWVyaWRpZW07XG4gICAgZm9ybWF0QmxvY2tzWydtbSddID0gUGFkZGVkTWludXRlO1xuICAgIGZvcm1hdEJsb2Nrc1snbSddID0gTWludXRlO1xuICAgIGZvcm1hdEJsb2Nrc1snc3MnXSA9IFBhZGRlZFNlY29uZDtcbiAgICBmb3JtYXRCbG9ja3NbJ3MnXSA9IFNlY29uZDtcbiAgICBcbiAgICByZXR1cm4gZm9ybWF0QmxvY2tzO1xufSkoKTtcblxuXG4iLCJjbGFzcyBJbnB1dCB7XG4gICAgcHJpdmF0ZSBvcHRpb25zOiBJT3B0aW9ucztcbiAgICBwcml2YXRlIHNlbGVjdGVkRGF0ZVBhcnQ6IElEYXRlUGFydDtcbiAgICBwcml2YXRlIHRleHRCdWZmZXI6IHN0cmluZyA9IFwiXCI7XG4gICAgcHVibGljIGRhdGVQYXJ0czogSURhdGVQYXJ0W107XG4gICAgcHVibGljIGZvcm1hdDogUmVnRXhwO1xuICAgIHByaXZhdGUgZGF0ZTpEYXRlO1xuICAgIHByaXZhdGUgbGV2ZWw6TGV2ZWw7XG4gICAgXG4gICAgY29uc3RydWN0b3IocHVibGljIGVsZW1lbnQ6IEhUTUxJbnB1dEVsZW1lbnQpIHtcbiAgICAgICAgbmV3IEtleWJvYXJkRXZlbnRIYW5kbGVyKHRoaXMpO1xuICAgICAgICBuZXcgTW91c2VFdmVudEhhbmRsZXIodGhpcyk7XG4gICAgICAgIG5ldyBQYXN0ZUV2ZW50SGFuZGVyKHRoaXMpO1xuICAgICAgICBcbiAgICAgICAgbGlzdGVuLnZpZXdjaGFuZ2VkKGVsZW1lbnQsIChlKSA9PiB0aGlzLnZpZXdjaGFuZ2VkKGUuZGF0ZSwgZS5sZXZlbCwgZS51cGRhdGUpKTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIGdldExldmVscygpOkxldmVsW10ge1xuICAgICAgICBsZXQgbGV2ZWxzOkxldmVsW10gPSBbXTtcbiAgICAgICAgdGhpcy5kYXRlUGFydHMuZm9yRWFjaCgoZGF0ZVBhcnQpID0+IHtcbiAgICAgICAgICAgIGlmIChsZXZlbHMuaW5kZXhPZihkYXRlUGFydC5nZXRMZXZlbCgpKSA9PT0gLTEgJiYgZGF0ZVBhcnQuaXNTZWxlY3RhYmxlKCkpIHtcbiAgICAgICAgICAgICAgICBsZXZlbHMucHVzaChkYXRlUGFydC5nZXRMZXZlbCgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBsZXZlbHM7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBnZXRUZXh0QnVmZmVyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50ZXh0QnVmZmVyO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgc2V0VGV4dEJ1ZmZlcihuZXdCdWZmZXI6c3RyaW5nKSB7XG4gICAgICAgIHRoaXMudGV4dEJ1ZmZlciA9IG5ld0J1ZmZlcjtcbiAgICAgICAgXG4gICAgICAgIGlmICh0aGlzLnRleHRCdWZmZXIubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVEYXRlRnJvbUJ1ZmZlcigpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyB1cGRhdGVEYXRlRnJvbUJ1ZmZlcigpIHtcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWREYXRlUGFydC5zZXRWYWx1ZUZyb21QYXJ0aWFsKHRoaXMudGV4dEJ1ZmZlcikpIHtcbiAgICAgICAgICAgIGxldCBuZXdEYXRlID0gdGhpcy5zZWxlY3RlZERhdGVQYXJ0LmdldFZhbHVlKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICh0aGlzLnRleHRCdWZmZXIubGVuZ3RoID49IHRoaXMuc2VsZWN0ZWREYXRlUGFydC5nZXRNYXhCdWZmZXIoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMudGV4dEJ1ZmZlciA9ICcnO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWREYXRlUGFydCA9IHRoaXMuZ2V0TmV4dFNlbGVjdGFibGVEYXRlUGFydCgpOyAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdHJpZ2dlci5nb3RvKHRoaXMuZWxlbWVudCwge1xuICAgICAgICAgICAgICAgIGRhdGU6IG5ld0RhdGUsXG4gICAgICAgICAgICAgICAgbGV2ZWw6IHRoaXMuc2VsZWN0ZWREYXRlUGFydC5nZXRMZXZlbCgpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudGV4dEJ1ZmZlciA9IHRoaXMudGV4dEJ1ZmZlci5zbGljZSgwLCAtMSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcHVibGljIGdldEZpcnN0U2VsZWN0YWJsZURhdGVQYXJ0KCkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZGF0ZVBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5kYXRlUGFydHNbaV0uaXNTZWxlY3RhYmxlKCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZVBhcnRzW2ldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgfVxuXG4gICAgcHVibGljIGdldExhc3RTZWxlY3RhYmxlRGF0ZVBhcnQoKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSB0aGlzLmRhdGVQYXJ0cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuZGF0ZVBhcnRzW2ldLmlzU2VsZWN0YWJsZSgpKVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGVQYXJ0c1tpXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgZ2V0TmV4dFNlbGVjdGFibGVEYXRlUGFydCgpIHtcbiAgICAgICAgbGV0IGkgPSB0aGlzLmRhdGVQYXJ0cy5pbmRleE9mKHRoaXMuc2VsZWN0ZWREYXRlUGFydCk7XG4gICAgICAgIHdoaWxlICgrK2kgPCB0aGlzLmRhdGVQYXJ0cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGVQYXJ0c1tpXS5pc1NlbGVjdGFibGUoKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlUGFydHNbaV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWREYXRlUGFydDtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIGdldFByZXZpb3VzU2VsZWN0YWJsZURhdGVQYXJ0KCkge1xuICAgICAgICBsZXQgaSA9IHRoaXMuZGF0ZVBhcnRzLmluZGV4T2YodGhpcy5zZWxlY3RlZERhdGVQYXJ0KTtcbiAgICAgICAgd2hpbGUgKC0taSA+PSAwKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5kYXRlUGFydHNbaV0uaXNTZWxlY3RhYmxlKCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZVBhcnRzW2ldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQ7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBnZXROZWFyZXN0U2VsZWN0YWJsZURhdGVQYXJ0KGNhcmV0UG9zaXRpb246IG51bWJlcikge1xuICAgICAgICBsZXQgZGlzdGFuY2U6bnVtYmVyID0gTnVtYmVyLk1BWF9WQUxVRTtcbiAgICAgICAgbGV0IG5lYXJlc3REYXRlUGFydDpJRGF0ZVBhcnQ7XG4gICAgICAgIGxldCBzdGFydCA9IDA7XG4gICAgICAgIFxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZGF0ZVBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgZGF0ZVBhcnQgPSB0aGlzLmRhdGVQYXJ0c1tpXTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKGRhdGVQYXJ0LmlzU2VsZWN0YWJsZSgpKSB7XG4gICAgICAgICAgICAgICAgbGV0IGZyb21MZWZ0ID0gY2FyZXRQb3NpdGlvbiAtIHN0YXJ0O1xuICAgICAgICAgICAgICAgIGxldCBmcm9tUmlnaHQgPSBjYXJldFBvc2l0aW9uIC0gKHN0YXJ0ICsgZGF0ZVBhcnQudG9TdHJpbmcoKS5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIChmcm9tTGVmdCA+IDAgJiYgZnJvbVJpZ2h0IDwgMCkgcmV0dXJuIGRhdGVQYXJ0O1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGxldCBkID0gTWF0aC5taW4oTWF0aC5hYnMoZnJvbUxlZnQpLCBNYXRoLmFicyhmcm9tUmlnaHQpKTtcbiAgICAgICAgICAgICAgICBpZiAoZCA8PSBkaXN0YW5jZSkge1xuICAgICAgICAgICAgICAgICAgICBuZWFyZXN0RGF0ZVBhcnQgPSBkYXRlUGFydDtcbiAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2UgPSBkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc3RhcnQgKz0gZGF0ZVBhcnQudG9TdHJpbmcoKS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBuZWFyZXN0RGF0ZVBhcnQ7ICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHNldFNlbGVjdGVkRGF0ZVBhcnQoZGF0ZVBhcnQ6SURhdGVQYXJ0KSB7XG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkRGF0ZVBhcnQgIT09IGRhdGVQYXJ0KSB7XG4gICAgICAgICAgICB0aGlzLnRleHRCdWZmZXIgPSAnJztcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWREYXRlUGFydCA9IGRhdGVQYXJ0O1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBnZXRTZWxlY3RlZERhdGVQYXJ0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZERhdGVQYXJ0O1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgdXBkYXRlT3B0aW9ucyhvcHRpb25zOklPcHRpb25zKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmRhdGVQYXJ0cyA9IFBhcnNlci5wYXJzZShvcHRpb25zLmRpc3BsYXlBcyk7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWREYXRlUGFydCA9IHZvaWQgMDtcbiAgICAgICAgXG4gICAgICAgIGxldCBmb3JtYXQ6c3RyaW5nID0gJ14nO1xuICAgICAgICB0aGlzLmRhdGVQYXJ0cy5mb3JFYWNoKChkYXRlUGFydCkgPT4ge1xuICAgICAgICAgICAgZm9ybWF0ICs9IGAoJHtkYXRlUGFydC5nZXRSZWdFeCgpLnNvdXJjZS5zbGljZSgxLC0xKX0pYDtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZm9ybWF0ID0gbmV3IFJlZ0V4cChmb3JtYXQrJyQnLCAnaScpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICB0aGlzLnZpZXdjaGFuZ2VkKHRoaXMuZGF0ZSwgdGhpcy5sZXZlbCwgdHJ1ZSk7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyB1cGRhdGVWaWV3KCkge1xuICAgICAgICBsZXQgZGF0ZVN0cmluZyA9ICcnO1xuICAgICAgICB0aGlzLmRhdGVQYXJ0cy5mb3JFYWNoKChkYXRlUGFydCkgPT4ge1xuICAgICAgICAgICAgaWYgKGRhdGVQYXJ0LmdldFZhbHVlKCkgPT09IHZvaWQgMCkgcmV0dXJuO1xuICAgICAgICAgICAgZGF0ZVN0cmluZyArPSBkYXRlUGFydC50b1N0cmluZygpOyBcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZWxlbWVudC52YWx1ZSA9IGRhdGVTdHJpbmc7XG4gICAgICAgIFxuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZERhdGVQYXJ0ID09PSB2b2lkIDApIHJldHVybjtcbiAgICAgICAgXG4gICAgICAgIGxldCBzdGFydCA9IDA7XG4gICAgICAgIFxuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIHdoaWxlICh0aGlzLmRhdGVQYXJ0c1tpXSAhPT0gdGhpcy5zZWxlY3RlZERhdGVQYXJ0KSB7XG4gICAgICAgICAgICBzdGFydCArPSB0aGlzLmRhdGVQYXJ0c1tpKytdLnRvU3RyaW5nKCkubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBsZXQgZW5kID0gc3RhcnQgKyB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQudG9TdHJpbmcoKS5sZW5ndGg7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmVsZW1lbnQuc2V0U2VsZWN0aW9uUmFuZ2Uoc3RhcnQsIGVuZCk7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyB2aWV3Y2hhbmdlZChkYXRlOkRhdGUsIGxldmVsOkxldmVsLCB1cGRhdGU/OmJvb2xlYW4pIHsgXG4gICAgICAgIHRoaXMuZGF0ZSA9IGRhdGU7XG4gICAgICAgIHRoaXMubGV2ZWwgPSBsZXZlbDsgICAgICAgXG4gICAgICAgIHRoaXMuZGF0ZVBhcnRzLmZvckVhY2goKGRhdGVQYXJ0KSA9PiB7XG4gICAgICAgICAgICBpZiAodXBkYXRlKSBkYXRlUGFydC5zZXRWYWx1ZShkYXRlKTtcbiAgICAgICAgICAgIGlmIChkYXRlUGFydC5nZXRMZXZlbCgpID09PSBsZXZlbCAmJlxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0U2VsZWN0ZWREYXRlUGFydCgpICE9PSB2b2lkIDAgJiZcbiAgICAgICAgICAgICAgICBsZXZlbCAhPT0gdGhpcy5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0TGV2ZWwoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U2VsZWN0ZWREYXRlUGFydChkYXRlUGFydCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHRyaWdnZXJWaWV3Q2hhbmdlKCkge1xuICAgICAgICB0cmlnZ2VyLnZpZXdjaGFuZ2VkKHRoaXMuZWxlbWVudCwge1xuICAgICAgICAgICAgZGF0ZTogdGhpcy5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0VmFsdWUoKSxcbiAgICAgICAgICAgIGxldmVsOiB0aGlzLmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5nZXRMZXZlbCgpXG4gICAgICAgIH0pOyAgICAgICAgXG4gICAgfVxuICAgIFxufSIsImNvbnN0IGVudW0gS0VZIHtcbiAgICBSSUdIVCA9IDM5LCBMRUZUID0gMzcsIFRBQiA9IDksIFVQID0gMzgsXG4gICAgRE9XTiA9IDQwLCBWID0gODYsIEMgPSA2NywgQSA9IDY1LCBIT01FID0gMzYsXG4gICAgRU5EID0gMzUsIEJBQ0tTUEFDRSA9IDhcbn1cblxuY2xhc3MgS2V5Ym9hcmRFdmVudEhhbmRsZXIge1xuICAgIHByaXZhdGUgc2hpZnRUYWJEb3duID0gZmFsc2U7XG4gICAgcHJpdmF0ZSB0YWJEb3duID0gZmFsc2U7XG4gICAgXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBpbnB1dDpJbnB1dCkge1xuICAgICAgICBpbnB1dC5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIChlKSA9PiB0aGlzLmtleWRvd24oZSkpO1xuICAgICAgICBpbnB1dC5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJmb2N1c1wiLCAoKSA9PiB0aGlzLmZvY3VzKCkpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoZSkgPT4gdGhpcy5kb2N1bWVudEtleWRvd24oZSkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZm9jdXMgPSAoKTp2b2lkID0+IHtcbiAgICAgICAgaWYgKHRoaXMudGFiRG93bikge1xuICAgICAgICAgICAgbGV0IGZpcnN0ID0gdGhpcy5pbnB1dC5nZXRGaXJzdFNlbGVjdGFibGVEYXRlUGFydCgpO1xuICAgICAgICAgICAgdGhpcy5pbnB1dC5zZXRTZWxlY3RlZERhdGVQYXJ0KGZpcnN0KTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgdGhpcy5pbnB1dC50cmlnZ2VyVmlld0NoYW5nZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zaGlmdFRhYkRvd24pIHtcbiAgICAgICAgICAgIGxldCBsYXN0ID0gdGhpcy5pbnB1dC5nZXRMYXN0U2VsZWN0YWJsZURhdGVQYXJ0KCk7XG4gICAgICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQobGFzdCk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgIHRoaXMuaW5wdXQudHJpZ2dlclZpZXdDaGFuZ2UoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgZG9jdW1lbnRLZXlkb3duKGU6S2V5Ym9hcmRFdmVudCkge1xuICAgICAgICBpZiAoZS5zaGlmdEtleSAmJiBlLmtleUNvZGUgPT09IEtFWS5UQUIpIHtcbiAgICAgICAgICAgIHRoaXMuc2hpZnRUYWJEb3duID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChlLmtleUNvZGUgPT09IEtFWS5UQUIpIHtcbiAgICAgICAgICAgIHRoaXMudGFiRG93biA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNoaWZ0VGFiRG93biA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy50YWJEb3duID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIGtleWRvd24oZTpLZXlib2FyZEV2ZW50KSB7XG4gICAgICAgIGxldCBjb2RlID0gZS5rZXlDb2RlO1xuICAgICAgICBpZiAoY29kZSA+PSA5NiAmJiBjb2RlIDw9IDEwNSkge1xuICAgICAgICAgICAgY29kZSAtPSA0ODtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGlmICgoY29kZSA9PT0gS0VZLkhPTUUgfHwgY29kZSA9PT0gS0VZLkVORCkgJiYgZS5zaGlmdEtleSkgcmV0dXJuO1xuICAgICAgICBpZiAoKGNvZGUgPT09IEtFWS5MRUZUIHx8IGNvZGUgPT09IEtFWS5SSUdIVCkgJiYgZS5zaGlmdEtleSkgcmV0dXJuO1xuICAgICAgICBpZiAoKGNvZGUgPT09IEtFWS5DIHx8IGNvZGUgPT09IEtFWS5BIHx8IGNvZGUgPT09IEtFWS5WKSAmJiBlLmN0cmxLZXkpIHJldHVybjtcbiAgICAgICAgXG4gICAgICAgIGxldCBwcmV2ZW50RGVmYXVsdCA9IHRydWU7XG4gICAgICAgIFxuICAgICAgICBpZiAoY29kZSA9PT0gS0VZLkhPTUUpIHtcbiAgICAgICAgICAgIHRoaXMuaG9tZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IEtFWS5FTkQpIHtcbiAgICAgICAgICAgIHRoaXMuZW5kKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gS0VZLkxFRlQpIHtcbiAgICAgICAgICAgIHRoaXMubGVmdCgpO1xuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IEtFWS5SSUdIVCkge1xuICAgICAgICAgICAgdGhpcy5yaWdodCgpO1xuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IEtFWS5UQUIgJiYgZS5zaGlmdEtleSkge1xuICAgICAgICAgICAgcHJldmVudERlZmF1bHQgPSB0aGlzLnNoaWZ0VGFiKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gS0VZLlRBQikge1xuICAgICAgICAgICAgcHJldmVudERlZmF1bHQgPSB0aGlzLnRhYigpO1xuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IEtFWS5VUCkge1xuICAgICAgICAgICAgdGhpcy51cCgpO1xuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IEtFWS5ET1dOKSB7XG4gICAgICAgICAgICB0aGlzLmRvd24oKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKHByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGxldCBrZXlQcmVzc2VkID0gU3RyaW5nLmZyb21DaGFyQ29kZShjb2RlKTtcbiAgICAgICAgaWYgKC9eWzAtOV18W0Etel0kLy50ZXN0KGtleVByZXNzZWQpKSB7XG4gICAgICAgICAgICBsZXQgdGV4dEJ1ZmZlciA9IHRoaXMuaW5wdXQuZ2V0VGV4dEJ1ZmZlcigpO1xuICAgICAgICAgICAgdGhpcy5pbnB1dC5zZXRUZXh0QnVmZmVyKHRleHRCdWZmZXIgKyBrZXlQcmVzc2VkKTtcbiAgICAgICAgfSBlbHNlIGlmIChjb2RlID09PSBLRVkuQkFDS1NQQUNFKSB7XG4gICAgICAgICAgICBsZXQgdGV4dEJ1ZmZlciA9IHRoaXMuaW5wdXQuZ2V0VGV4dEJ1ZmZlcigpO1xuICAgICAgICAgICAgdGhpcy5pbnB1dC5zZXRUZXh0QnVmZmVyKHRleHRCdWZmZXIuc2xpY2UoMCwgLTEpKTtcbiAgICAgICAgfSBlbHNlIGlmICghZS5zaGlmdEtleSkge1xuICAgICAgICAgICAgdGhpcy5pbnB1dC5zZXRUZXh0QnVmZmVyKCcnKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBob21lKCkge1xuICAgICAgICBsZXQgZmlyc3QgPSB0aGlzLmlucHV0LmdldEZpcnN0U2VsZWN0YWJsZURhdGVQYXJ0KCk7XG4gICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChmaXJzdCk7XG4gICAgICAgIHRoaXMuaW5wdXQudHJpZ2dlclZpZXdDaGFuZ2UoKTtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBlbmQoKSB7XG4gICAgICAgIGxldCBsYXN0ID0gdGhpcy5pbnB1dC5nZXRMYXN0U2VsZWN0YWJsZURhdGVQYXJ0KCk7XG4gICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChsYXN0KTsgICAgIFxuICAgICAgICB0aGlzLmlucHV0LnRyaWdnZXJWaWV3Q2hhbmdlKCk7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgbGVmdCgpIHtcbiAgICAgICAgbGV0IHByZXZpb3VzID0gdGhpcy5pbnB1dC5nZXRQcmV2aW91c1NlbGVjdGFibGVEYXRlUGFydCgpO1xuICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQocHJldmlvdXMpO1xuICAgICAgICB0aGlzLmlucHV0LnRyaWdnZXJWaWV3Q2hhbmdlKCk7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgcmlnaHQoKSB7XG4gICAgICAgIGxldCBuZXh0ID0gdGhpcy5pbnB1dC5nZXROZXh0U2VsZWN0YWJsZURhdGVQYXJ0KCk7XG4gICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChuZXh0KTtcbiAgICAgICAgdGhpcy5pbnB1dC50cmlnZ2VyVmlld0NoYW5nZSgpO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIHNoaWZ0VGFiKCkge1xuICAgICAgICBsZXQgcHJldmlvdXMgPSB0aGlzLmlucHV0LmdldFByZXZpb3VzU2VsZWN0YWJsZURhdGVQYXJ0KCk7XG4gICAgICAgIGlmIChwcmV2aW91cyAhPT0gdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkpIHtcbiAgICAgICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChwcmV2aW91cyk7XG4gICAgICAgICAgICB0aGlzLmlucHV0LnRyaWdnZXJWaWV3Q2hhbmdlKCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgdGFiKCkge1xuICAgICAgICBsZXQgbmV4dCA9IHRoaXMuaW5wdXQuZ2V0TmV4dFNlbGVjdGFibGVEYXRlUGFydCgpO1xuICAgICAgICBpZiAobmV4dCAhPT0gdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkpIHtcbiAgICAgICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChuZXh0KTtcbiAgICAgICAgICAgIHRoaXMuaW5wdXQudHJpZ2dlclZpZXdDaGFuZ2UoKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgdXAoKSB7XG4gICAgICAgIHRoaXMuaW5wdXQuZ2V0U2VsZWN0ZWREYXRlUGFydCgpLmluY3JlbWVudCgpO1xuICAgICAgICBcbiAgICAgICAgbGV0IGxldmVsID0gdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0TGV2ZWwoKTtcbiAgICAgICAgbGV0IGRhdGUgPSB0aGlzLmlucHV0LmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5nZXRWYWx1ZSgpO1xuICAgICAgICBcbiAgICAgICAgdHJpZ2dlci5nb3RvKHRoaXMuaW5wdXQuZWxlbWVudCwge1xuICAgICAgICAgICAgZGF0ZTogZGF0ZSxcbiAgICAgICAgICAgIGxldmVsOiBsZXZlbFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBkb3duKCkge1xuICAgICAgICB0aGlzLmlucHV0LmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5kZWNyZW1lbnQoKTtcbiAgICAgICAgXG4gICAgICAgIGxldCBsZXZlbCA9IHRoaXMuaW5wdXQuZ2V0U2VsZWN0ZWREYXRlUGFydCgpLmdldExldmVsKCk7XG4gICAgICAgIGxldCBkYXRlID0gdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0VmFsdWUoKTtcbiAgICAgICAgXG4gICAgICAgIHRyaWdnZXIuZ290byh0aGlzLmlucHV0LmVsZW1lbnQsIHtcbiAgICAgICAgICAgIGRhdGU6IGRhdGUsXG4gICAgICAgICAgICBsZXZlbDogbGV2ZWxcbiAgICAgICAgfSk7XG4gICAgfVxufSIsImNsYXNzIE1vdXNlRXZlbnRIYW5kbGVyIHtcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGlucHV0OklucHV0KSB7XG4gICAgICAgIGxpc3Rlbi5tb3VzZWRvd24oaW5wdXQuZWxlbWVudCwgKCkgPT4gdGhpcy5tb3VzZWRvd24oKSk7XG4gICAgICAgIGxpc3Rlbi5tb3VzZXVwKGRvY3VtZW50LCAoKSA9PiB0aGlzLm1vdXNldXAoKSk7XG4gICAgICAgIFxuICAgICAgICAvLyBTdG9wIGRlZmF1bHRcbiAgICAgICAgaW5wdXQuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ2VudGVyXCIsIChlKSA9PiBlLnByZXZlbnREZWZhdWx0KCkpO1xuICAgICAgICBpbnB1dC5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnb3ZlclwiLCAoZSkgPT4gZS5wcmV2ZW50RGVmYXVsdCgpKTtcbiAgICAgICAgaW5wdXQuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiZHJvcFwiLCAoZSkgPT4gZS5wcmV2ZW50RGVmYXVsdCgpKTtcbiAgICAgICAgaW5wdXQuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY3V0XCIsIChlKSA9PiBlLnByZXZlbnREZWZhdWx0KCkpO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIGRvd246Ym9vbGVhbjtcbiAgICBwcml2YXRlIGNhcmV0U3RhcnQ6bnVtYmVyO1xuICAgIFxuICAgIHByaXZhdGUgbW91c2Vkb3duKCkge1xuICAgICAgICB0aGlzLmRvd24gPSB0cnVlO1xuICAgICAgICB0aGlzLmlucHV0LmVsZW1lbnQuc2V0U2VsZWN0aW9uUmFuZ2Uodm9pZCAwLCB2b2lkIDApO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgdGhpcy5jYXJldFN0YXJ0ID0gdGhpcy5pbnB1dC5lbGVtZW50LnNlbGVjdGlvblN0YXJ0OyBcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgbW91c2V1cCA9ICgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLmRvd24pIHJldHVybjtcbiAgICAgICAgdGhpcy5kb3duID0gZmFsc2U7XG4gICAgICAgIFxuICAgICAgICBsZXQgcG9zOm51bWJlcjtcbiAgICAgICAgXG4gICAgICAgIGlmICh0aGlzLmlucHV0LmVsZW1lbnQuc2VsZWN0aW9uU3RhcnQgPT09IHRoaXMuY2FyZXRTdGFydCkge1xuICAgICAgICAgICAgcG9zID0gdGhpcy5pbnB1dC5lbGVtZW50LnNlbGVjdGlvbkVuZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBvcyA9IHRoaXMuaW5wdXQuZWxlbWVudC5zZWxlY3Rpb25TdGFydDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgbGV0IGJsb2NrID0gdGhpcy5pbnB1dC5nZXROZWFyZXN0U2VsZWN0YWJsZURhdGVQYXJ0KHBvcyk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQoYmxvY2spO1xuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXMuaW5wdXQuZWxlbWVudC5zZWxlY3Rpb25TdGFydCA+IDAgfHwgdGhpcy5pbnB1dC5lbGVtZW50LnNlbGVjdGlvbkVuZCA8IHRoaXMuaW5wdXQuZWxlbWVudC52YWx1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuaW5wdXQudHJpZ2dlclZpZXdDaGFuZ2UoKTtcbiAgICAgICAgfVxuICAgIH07XG59IiwiY2xhc3MgUGFyc2VyIHtcbiAgICBwdWJsaWMgc3RhdGljIHBhcnNlKGZvcm1hdDpzdHJpbmcpOklEYXRlUGFydFtdIHtcbiAgICAgICAgbGV0IHRleHRCdWZmZXIgPSAnJztcbiAgICAgICAgbGV0IGRhdGVQYXJ0czpJRGF0ZVBhcnRbXSA9IFtdO1xuICAgIFxuICAgICAgICBsZXQgaW5kZXggPSAwOyAgICAgICAgICAgICAgICBcbiAgICAgICAgbGV0IGluRXNjYXBlZFNlZ21lbnQgPSBmYWxzZTtcbiAgICAgICAgXG4gICAgICAgIGxldCBwdXNoUGxhaW5UZXh0ID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRleHRCdWZmZXIubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGRhdGVQYXJ0cy5wdXNoKG5ldyBQbGFpblRleHQodGV4dEJ1ZmZlcikuc2V0U2VsZWN0YWJsZShmYWxzZSkpO1xuICAgICAgICAgICAgICAgIHRleHRCdWZmZXIgPSAnJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgd2hpbGUgKGluZGV4IDwgZm9ybWF0Lmxlbmd0aCkgeyAgICAgXG4gICAgICAgICAgICBpZiAoIWluRXNjYXBlZFNlZ21lbnQgJiYgZm9ybWF0W2luZGV4XSA9PT0gJ1snKSB7XG4gICAgICAgICAgICAgICAgaW5Fc2NhcGVkU2VnbWVudCA9IHRydWU7XG4gICAgICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKGluRXNjYXBlZFNlZ21lbnQgJiYgZm9ybWF0W2luZGV4XSA9PT0gJ10nKSB7XG4gICAgICAgICAgICAgICAgaW5Fc2NhcGVkU2VnbWVudCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChpbkVzY2FwZWRTZWdtZW50KSB7XG4gICAgICAgICAgICAgICAgdGV4dEJ1ZmZlciArPSBmb3JtYXRbaW5kZXhdO1xuICAgICAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxldCBmb3VuZCA9IGZhbHNlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IgKGxldCBjb2RlIGluIGZvcm1hdEJsb2Nrcykge1xuICAgICAgICAgICAgICAgIGlmIChQYXJzZXIuZmluZEF0KGZvcm1hdCwgaW5kZXgsIGB7JHtjb2RlfX1gKSkge1xuICAgICAgICAgICAgICAgICAgICBwdXNoUGxhaW5UZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIGRhdGVQYXJ0cy5wdXNoKG5ldyBmb3JtYXRCbG9ja3NbY29kZV0oKS5zZXRTZWxlY3RhYmxlKGZhbHNlKSk7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4ICs9IGNvZGUubGVuZ3RoICsgMjtcbiAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFBhcnNlci5maW5kQXQoZm9ybWF0LCBpbmRleCwgY29kZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcHVzaFBsYWluVGV4dCgpO1xuICAgICAgICAgICAgICAgICAgICBkYXRlUGFydHMucHVzaChuZXcgZm9ybWF0QmxvY2tzW2NvZGVdKCkpO1xuICAgICAgICAgICAgICAgICAgICBpbmRleCArPSBjb2RlLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICghZm91bmQpIHtcbiAgICAgICAgICAgICAgICB0ZXh0QnVmZmVyICs9IGZvcm1hdFtpbmRleF07XG4gICAgICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdXNoUGxhaW5UZXh0KCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBkYXRlUGFydHM7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgc3RhdGljIGZpbmRBdCAoc3RyOnN0cmluZywgaW5kZXg6bnVtYmVyLCBzZWFyY2g6c3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBzdHIuc2xpY2UoaW5kZXgsIGluZGV4ICsgc2VhcmNoLmxlbmd0aCkgPT09IHNlYXJjaDtcbiAgICB9XG59IiwiY2xhc3MgUGFzdGVFdmVudEhhbmRlciB7XG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBpbnB1dDpJbnB1dCkge1xuICAgICAgICBsaXN0ZW4ucGFzdGUoaW5wdXQuZWxlbWVudCwgKCkgPT4gdGhpcy5wYXN0ZSgpKTtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBwYXN0ZSgpIHtcbiAgICAgICAgbGV0IG9yaWdpbmFsVmFsdWUgPSB0aGlzLmlucHV0LmVsZW1lbnQudmFsdWU7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICBpZiAoIXRoaXMuaW5wdXQuZm9ybWF0LnRlc3QodGhpcy5pbnB1dC5lbGVtZW50LnZhbHVlKSkge1xuICAgICAgICAgICAgICAgdGhpcy5pbnB1dC5lbGVtZW50LnZhbHVlID0gb3JpZ2luYWxWYWx1ZTtcbiAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgfSBcbiAgICAgICAgICAgXG4gICAgICAgICAgIGxldCBuZXdEYXRlID0gdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0VmFsdWUoKTtcbiAgICAgICAgICAgXG4gICAgICAgICAgIGxldCBzdHJQcmVmaXggPSAnJztcbiAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmlucHV0LmRhdGVQYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgbGV0IGRhdGVQYXJ0ID0gdGhpcy5pbnB1dC5kYXRlUGFydHNbaV07XG4gICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgIGxldCByZWdFeHAgPSBuZXcgUmVnRXhwKGRhdGVQYXJ0LmdldFJlZ0V4KCkuc291cmNlLnNsaWNlKDEsIC0xKSwgJ2knKTtcbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgbGV0IHZhbCA9IHRoaXMuaW5wdXQuZWxlbWVudC52YWx1ZS5yZXBsYWNlKHN0clByZWZpeCwgJycpLm1hdGNoKHJlZ0V4cClbMF07XG4gICAgICAgICAgICAgICBzdHJQcmVmaXggKz0gdmFsO1xuICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICBpZiAoIWRhdGVQYXJ0LmlzU2VsZWN0YWJsZSgpKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgZGF0ZVBhcnQuc2V0VmFsdWUobmV3RGF0ZSk7XG4gICAgICAgICAgICAgICBpZiAoZGF0ZVBhcnQuc2V0VmFsdWUodmFsKSkge1xuICAgICAgICAgICAgICAgICAgIG5ld0RhdGUgPSBkYXRlUGFydC5nZXRWYWx1ZSgpO1xuICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICB0aGlzLmlucHV0LmVsZW1lbnQudmFsdWUgPSBvcmlnaW5hbFZhbHVlO1xuICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfVxuICAgICAgICAgICBcbiAgICAgICAgICAgdHJpZ2dlci5nb3RvKHRoaXMuaW5wdXQuZWxlbWVudCwge1xuICAgICAgICAgICAgICAgZGF0ZTogbmV3RGF0ZSxcbiAgICAgICAgICAgICAgIGxldmVsOiB0aGlzLmlucHV0LmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5nZXRMZXZlbCgpXG4gICAgICAgICAgIH0pO1xuICAgICAgICAgICBcbiAgICAgICAgfSk7XG4gICAgfVxufSIsImNvbnN0IGVudW0gU3RlcERpcmVjdGlvbiB7XG4gICAgVVAsIERPV05cbn1cblxuY2xhc3MgSGVhZGVyIGV4dGVuZHMgQ29tbW9uIHtcbiAgICBwcml2YXRlIHllYXJMYWJlbDpFbGVtZW50O1xuICAgIHByaXZhdGUgbW9udGhMYWJlbDpFbGVtZW50O1xuICAgIHByaXZhdGUgZGF0ZUxhYmVsOkVsZW1lbnQ7XG4gICAgcHJpdmF0ZSBob3VyTGFiZWw6RWxlbWVudDtcbiAgICBwcml2YXRlIG1pbnV0ZUxhYmVsOkVsZW1lbnQ7XG4gICAgcHJpdmF0ZSBzZWNvbmRMYWJlbDpFbGVtZW50O1xuICAgIFxuICAgIHByaXZhdGUgbGFiZWxzOkVsZW1lbnRbXTtcbiAgICBcbiAgICBwcml2YXRlIG9wdGlvbnM6SU9wdGlvbnM7XG4gICAgXG4gICAgcHJpdmF0ZSBsZXZlbDpMZXZlbDtcbiAgICBwcml2YXRlIGRhdGU6RGF0ZTtcbiAgICBcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVsZW1lbnQ6SFRNTEVsZW1lbnQsIHByaXZhdGUgY29udGFpbmVyOkhUTUxFbGVtZW50KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIFxuICAgICAgICBsaXN0ZW4udmlld2NoYW5nZWQoZWxlbWVudCwgKGUpID0+IHRoaXMudmlld2NoYW5nZWQoZS5kYXRlLCBlLmxldmVsKSk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnllYXJMYWJlbCA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdkYXRpdW0tc3Bhbi1sYWJlbC5kYXRpdW0teWVhcicpO1xuICAgICAgICB0aGlzLm1vbnRoTGFiZWwgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcignZGF0aXVtLXNwYW4tbGFiZWwuZGF0aXVtLW1vbnRoJyk7XG4gICAgICAgIHRoaXMuZGF0ZUxhYmVsID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS1kYXRlJyk7XG4gICAgICAgIHRoaXMuaG91ckxhYmVsID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS1ob3VyJyk7XG4gICAgICAgIHRoaXMubWludXRlTGFiZWwgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcignZGF0aXVtLXNwYW4tbGFiZWwuZGF0aXVtLW1pbnV0ZScpO1xuICAgICAgICB0aGlzLnNlY29uZExhYmVsID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS1zZWNvbmQnKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMubGFiZWxzID0gW3RoaXMueWVhckxhYmVsLCB0aGlzLm1vbnRoTGFiZWwsIHRoaXMuZGF0ZUxhYmVsLCB0aGlzLmhvdXJMYWJlbCwgdGhpcy5taW51dGVMYWJlbCwgdGhpcy5zZWNvbmRMYWJlbF07XG4gICAgICAgIFxuICAgICAgICBsZXQgcHJldmlvdXNCdXR0b24gPSBjb250YWluZXIucXVlcnlTZWxlY3RvcignZGF0aXVtLXByZXYnKTtcbiAgICAgICAgbGV0IG5leHRCdXR0b24gPSBjb250YWluZXIucXVlcnlTZWxlY3RvcignZGF0aXVtLW5leHQnKTtcbiAgICAgICAgbGV0IHNwYW5MYWJlbENvbnRhaW5lciA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdkYXRpdW0tc3Bhbi1sYWJlbC1jb250YWluZXInKTtcbiAgICAgICAgXG4gICAgICAgIGxpc3Rlbi50YXAocHJldmlvdXNCdXR0b24sICgpID0+IHRoaXMucHJldmlvdXMoKSk7XG4gICAgICAgIGxpc3Rlbi50YXAobmV4dEJ1dHRvbiwgKCkgPT4gdGhpcy5uZXh0KCkpO1xuICAgICAgICBsaXN0ZW4udGFwKHNwYW5MYWJlbENvbnRhaW5lciwgKCkgPT4gdGhpcy56b29tT3V0KCkpO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgcHJldmlvdXMoKSB7XG4gICAgICAgIHRyaWdnZXIuZ290byh0aGlzLmVsZW1lbnQsIHtcbiAgICAgICAgICAgZGF0ZTogdGhpcy5zdGVwRGF0ZShTdGVwRGlyZWN0aW9uLkRPV04pLFxuICAgICAgICAgICBsZXZlbDogdGhpcy5sZXZlbCxcbiAgICAgICAgICAgdXBkYXRlOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIG5leHQoKSB7XG4gICAgICAgIHRyaWdnZXIuZ290byh0aGlzLmVsZW1lbnQsIHtcbiAgICAgICAgICAgZGF0ZTogdGhpcy5zdGVwRGF0ZShTdGVwRGlyZWN0aW9uLlVQKSxcbiAgICAgICAgICAgbGV2ZWw6IHRoaXMubGV2ZWwsXG4gICAgICAgICAgIHVwZGF0ZTogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgem9vbU91dCgpIHtcbiAgICAgICAgdHJpZ2dlci56b29tT3V0KHRoaXMuZWxlbWVudCwge1xuICAgICAgICAgICAgZGF0ZTogdGhpcy5kYXRlLFxuICAgICAgICAgICAgY3VycmVudExldmVsOiB0aGlzLmxldmVsLFxuICAgICAgICAgICAgdXBkYXRlOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBzdGVwRGF0ZShzdGVwVHlwZTpTdGVwRGlyZWN0aW9uKTpEYXRlIHtcbiAgICAgICAgbGV0IGRhdGUgPSBuZXcgRGF0ZSh0aGlzLmRhdGUudmFsdWVPZigpKTtcbiAgICAgICAgbGV0IGRpcmVjdGlvbiA9IHN0ZXBUeXBlID09PSBTdGVwRGlyZWN0aW9uLlVQID8gMSA6IC0xO1xuICAgICAgICBzd2l0Y2ggKHRoaXMubGV2ZWwpIHtcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuWUVBUjpcbiAgICAgICAgICAgICAgICBkYXRlLnNldEZ1bGxZZWFyKGRhdGUuZ2V0RnVsbFllYXIoKSArIDEwICogZGlyZWN0aW9uKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuTU9OVEg6XG4gICAgICAgICAgICAgICAgZGF0ZS5zZXRGdWxsWWVhcihkYXRlLmdldEZ1bGxZZWFyKCkgKyBkaXJlY3Rpb24pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBMZXZlbC5EQVRFOlxuICAgICAgICAgICAgICAgIGRhdGUuc2V0TW9udGgoZGF0ZS5nZXRNb250aCgpICsgZGlyZWN0aW9uKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuSE9VUjpcbiAgICAgICAgICAgICAgICBkYXRlLnNldERhdGUoZGF0ZS5nZXREYXRlKCkgKyBkaXJlY3Rpb24pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBMZXZlbC5NSU5VVEU6XG4gICAgICAgICAgICAgICAgZGF0ZS5zZXRIb3VycyhkYXRlLmdldEhvdXJzKCkgKyBkaXJlY3Rpb24pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBMZXZlbC5TRUNPTkQ6XG4gICAgICAgICAgICAgICAgZGF0ZS5zZXRNaW51dGVzKGRhdGUuZ2V0TWludXRlcygpICsgZGlyZWN0aW9uKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGF0ZTtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSB2aWV3Y2hhbmdlZChkYXRlOkRhdGUsIGxldmVsOkxldmVsKSB7XG4gICAgICAgIHRoaXMuZGF0ZSA9IGRhdGU7XG4gICAgICAgIHRoaXMubGV2ZWwgPSBsZXZlbDtcbiAgICAgICAgdGhpcy5sYWJlbHMuZm9yRWFjaCgobGFiZWwsIGxhYmVsTGV2ZWwpID0+IHtcbiAgICAgICAgICAgIGxhYmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS10b3AnKTtcbiAgICAgICAgICAgIGxhYmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1ib3R0b20nKTtcbiAgICAgICAgICAgIGxhYmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1oaWRkZW4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKGxhYmVsTGV2ZWwgPCBsZXZlbCkge1xuICAgICAgICAgICAgICAgIGxhYmVsLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS10b3AnKTtcbiAgICAgICAgICAgICAgICBsYWJlbC5pbm5lckhUTUwgPSB0aGlzLmdldEhlYWRlclRvcFRleHQoZGF0ZSwgbGFiZWxMZXZlbCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxhYmVsLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1ib3R0b20nKTtcbiAgICAgICAgICAgICAgICBsYWJlbC5pbm5lckhUTUwgPSB0aGlzLmdldEhlYWRlckJvdHRvbVRleHQoZGF0ZSwgbGFiZWxMZXZlbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChsYWJlbExldmVsIDwgbGV2ZWwgLSAxIHx8IGxhYmVsTGV2ZWwgPiBsZXZlbCkge1xuICAgICAgICAgICAgICAgIGxhYmVsLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1oaWRkZW4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgZ2V0SGVhZGVyVG9wVGV4dChkYXRlOkRhdGUsIGxldmVsOkxldmVsKTpzdHJpbmcge1xuICAgICAgICBzd2l0Y2gobGV2ZWwpIHtcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuWUVBUjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXREZWNhZGUoZGF0ZSk7XG4gICAgICAgICAgICBjYXNlIExldmVsLk1PTlRIOlxuICAgICAgICAgICAgICAgIHJldHVybiBkYXRlLmdldEZ1bGxZZWFyKCkudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuREFURTpcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7dGhpcy5nZXRTaG9ydE1vbnRocygpW2RhdGUuZ2V0TW9udGgoKV19ICR7ZGF0ZS5nZXRGdWxsWWVhcigpfWA7XG4gICAgICAgICAgICBjYXNlIExldmVsLkhPVVI6XG4gICAgICAgICAgICBjYXNlIExldmVsLk1JTlVURTpcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7dGhpcy5nZXRTaG9ydERheXMoKVtkYXRlLmdldERheSgpXX0gJHt0aGlzLnBhZChkYXRlLmdldERhdGUoKSl9ICR7dGhpcy5nZXRTaG9ydE1vbnRocygpW2RhdGUuZ2V0TW9udGgoKV19ICR7ZGF0ZS5nZXRGdWxsWWVhcigpfWA7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBnZXRIZWFkZXJCb3R0b21UZXh0KGRhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWwpOnN0cmluZyB7XG4gICAgICAgIHN3aXRjaChsZXZlbCkge1xuICAgICAgICAgICAgY2FzZSBMZXZlbC5ZRUFSOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldERlY2FkZShkYXRlKTtcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuTU9OVEg6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGUuZ2V0RnVsbFllYXIoKS50b1N0cmluZygpO1xuICAgICAgICAgICAgY2FzZSBMZXZlbC5EQVRFOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFNob3J0TW9udGhzKClbZGF0ZS5nZXRNb250aCgpXTtcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuSE9VUjpcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLm1pbGl0YXJ5VGltZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCR7dGhpcy5nZXRTaG9ydERheXMoKVtkYXRlLmdldERheSgpXX0gJHt0aGlzLnBhZChkYXRlLmdldERhdGUoKSl9IDxkYXRpdW0tdmFyaWFibGU+JHt0aGlzLnBhZChkYXRlLmdldEhvdXJzKCkpfTxkYXRpdW0tbG93ZXI+aHI8L2RhdGl1bS1sb3dlcj48L2RhdGl1bS12YXJpYWJsZT5gO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHt0aGlzLmdldFNob3J0RGF5cygpW2RhdGUuZ2V0RGF5KCldfSAke3RoaXMucGFkKGRhdGUuZ2V0RGF0ZSgpKX0gPGRhdGl1bS12YXJpYWJsZT4ke3RoaXMuZ2V0SG91cnMoZGF0ZSl9JHt0aGlzLmdldE1lcmlkaWVtKGRhdGUpfTwvZGF0aXVtLXZhcmlhYmxlPmA7ICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuTUlOVVRFOlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMubWlsaXRhcnlUaW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHt0aGlzLnBhZChkYXRlLmdldEhvdXJzKCkpfTo8ZGF0aXVtLXZhcmlhYmxlPiR7dGhpcy5wYWQoZGF0ZS5nZXRNaW51dGVzKCkpfTwvZGF0aXVtLXZhcmlhYmxlPmA7ICAgIFxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHt0aGlzLmdldEhvdXJzKGRhdGUpfTo8ZGF0aXVtLXZhcmlhYmxlPiR7dGhpcy5wYWQoZGF0ZS5nZXRNaW51dGVzKCkpfTwvZGF0aXVtLXZhcmlhYmxlPiR7dGhpcy5nZXRNZXJpZGllbShkYXRlKX1gO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuU0VDT05EOlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMubWlsaXRhcnlUaW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHt0aGlzLnBhZChkYXRlLmdldEhvdXJzKCkpfToke3RoaXMucGFkKGRhdGUuZ2V0TWludXRlcygpKX06PGRhdGl1bS12YXJpYWJsZT4ke3RoaXMucGFkKGRhdGUuZ2V0U2Vjb25kcygpKX08L2RhdGl1bS12YXJpYWJsZT5gOyAgIFxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHt0aGlzLmdldEhvdXJzKGRhdGUpfToke3RoaXMucGFkKGRhdGUuZ2V0TWludXRlcygpKX06PGRhdGl1bS12YXJpYWJsZT4ke3RoaXMucGFkKGRhdGUuZ2V0U2Vjb25kcygpKX08L2RhdGl1bS12YXJpYWJsZT4ke3RoaXMuZ2V0TWVyaWRpZW0oZGF0ZSl9YDsgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyB1cGRhdGVPcHRpb25zKG9wdGlvbnM6SU9wdGlvbnMpIHtcbiAgICAgICAgbGV0IHVwZGF0ZVZpZXcgPSB0aGlzLm9wdGlvbnMgIT09IHZvaWQgMCAmJiB0aGlzLm9wdGlvbnMubWlsaXRhcnlUaW1lICE9PSBvcHRpb25zLm1pbGl0YXJ5VGltZTtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICAgICAgaWYgKHVwZGF0ZVZpZXcpIHtcbiAgICAgICAgICAgIHRoaXMudmlld2NoYW5nZWQodGhpcy5kYXRlLCB0aGlzLmxldmVsKTtcbiAgICAgICAgfVxuICAgIH1cbn0iLCJjb25zdCBlbnVtIFRyYW5zaXRpb24ge1xuICAgIFNMSURFX0xFRlQsXG4gICAgU0xJREVfUklHSFQsXG4gICAgWk9PTV9JTixcbiAgICBaT09NX09VVFxufVxuXG5jbGFzcyBQaWNrZXJNYW5hZ2VyIHtcbiAgICBwcml2YXRlIG9wdGlvbnM6SU9wdGlvbnM7XG4gICAgcHVibGljIGNvbnRhaW5lcjpIVE1MRWxlbWVudDtcbiAgICBwdWJsaWMgaGVhZGVyOkhlYWRlcjtcbiAgICBcbiAgICBwcml2YXRlIHllYXJQaWNrZXI6SVBpY2tlcjtcbiAgICBwcml2YXRlIG1vbnRoUGlja2VyOklQaWNrZXI7XG4gICAgcHJpdmF0ZSBkYXRlUGlja2VyOklQaWNrZXI7XG4gICAgcHJpdmF0ZSBob3VyUGlja2VyOklUaW1lUGlja2VyO1xuICAgIHByaXZhdGUgbWludXRlUGlja2VyOklUaW1lUGlja2VyO1xuICAgIHByaXZhdGUgc2Vjb25kUGlja2VyOklUaW1lUGlja2VyO1xuICAgIFxuICAgIHB1YmxpYyBjdXJyZW50UGlja2VyOklQaWNrZXI7XG4gICAgXG4gICAgcHJpdmF0ZSBwaWNrZXJDb250YWluZXI6SFRNTEVsZW1lbnQ7XG4gICAgXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBlbGVtZW50OkhUTUxJbnB1dEVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXIgPSB0aGlzLmNyZWF0ZVZpZXcoKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuaW5zZXJ0QWZ0ZXIoZWxlbWVudCwgdGhpcy5jb250YWluZXIpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5waWNrZXJDb250YWluZXIgPSA8SFRNTEVsZW1lbnQ+dGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcignZGF0aXVtLXBpY2tlci1jb250YWluZXInKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuaGVhZGVyID0gbmV3IEhlYWRlcihlbGVtZW50LCB0aGlzLmNvbnRhaW5lcik7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnllYXJQaWNrZXIgPSBuZXcgWWVhclBpY2tlcihlbGVtZW50LCB0aGlzLmNvbnRhaW5lcik7XG4gICAgICAgIHRoaXMubW9udGhQaWNrZXIgPSBuZXcgTW9udGhQaWNrZXIoZWxlbWVudCwgdGhpcy5jb250YWluZXIpO1xuICAgICAgICB0aGlzLmRhdGVQaWNrZXIgPSBuZXcgRGF0ZVBpY2tlcihlbGVtZW50LCB0aGlzLmNvbnRhaW5lcik7XG4gICAgICAgIHRoaXMuaG91clBpY2tlciA9IG5ldyBIb3VyUGlja2VyKGVsZW1lbnQsIHRoaXMuY29udGFpbmVyKTtcbiAgICAgICAgdGhpcy5taW51dGVQaWNrZXIgPSBuZXcgTWludXRlUGlja2VyKGVsZW1lbnQsIHRoaXMuY29udGFpbmVyKTtcbiAgICAgICAgdGhpcy5zZWNvbmRQaWNrZXIgPSBuZXcgU2Vjb25kUGlja2VyKGVsZW1lbnQsIHRoaXMuY29udGFpbmVyKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgbGlzdGVuLmRvd24odGhpcy5jb250YWluZXIsICcqJywgKGUpID0+IHRoaXMuYWRkQWN0aXZlQ2xhc3NlcyhlKSk7XG4gICAgICAgIGxpc3Rlbi51cChkb2N1bWVudCwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jbG9zZUJ1YmJsZSgpO1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVBY3RpdmVDbGFzc2VzKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgbGlzdGVuLm1vdXNlZG93bih0aGlzLmNvbnRhaW5lciwgKGUpID0+IHtcbiAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICByZXR1cm4gZmFsc2U7IFxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGxpc3Rlbi52aWV3Y2hhbmdlZChlbGVtZW50LCAoZSkgPT4gdGhpcy52aWV3Y2hhbmdlZChlLmRhdGUsIGUubGV2ZWwsIGUudXBkYXRlKSk7XG4gICAgICAgIFxuICAgICAgICBsaXN0ZW4ub3BlbkJ1YmJsZShlbGVtZW50LCAoZSkgPT4ge1xuICAgICAgICAgICB0aGlzLm9wZW5CdWJibGUoZS54LCBlLnksIGUudGV4dCk7IFxuICAgICAgICB9KTtcbiAgICAgICAgbGlzdGVuLnVwZGF0ZUJ1YmJsZShlbGVtZW50LCAoZSkgPT4ge1xuICAgICAgICAgICB0aGlzLnVwZGF0ZUJ1YmJsZShlLngsIGUueSwgZS50ZXh0KTsgXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgbGlzdGVuLnN3aXBlTGVmdCh0aGlzLmNvbnRhaW5lciwgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuc2Vjb25kUGlja2VyLmlzRHJhZ2dpbmcoKSB8fFxuICAgICAgICAgICAgICAgIHRoaXMubWludXRlUGlja2VyLmlzRHJhZ2dpbmcoKSB8fFxuICAgICAgICAgICAgICAgIHRoaXMuaG91clBpY2tlci5pc0RyYWdnaW5nKCkpIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMuaGVhZGVyLm5leHQoKTsgXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgbGlzdGVuLnN3aXBlUmlnaHQodGhpcy5jb250YWluZXIsICgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLnNlY29uZFBpY2tlci5pc0RyYWdnaW5nKCkgfHxcbiAgICAgICAgICAgICAgICB0aGlzLm1pbnV0ZVBpY2tlci5pc0RyYWdnaW5nKCkgfHxcbiAgICAgICAgICAgICAgICB0aGlzLmhvdXJQaWNrZXIuaXNEcmFnZ2luZygpKSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLmhlYWRlci5wcmV2aW91cygpOyBcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBjbG9zZUJ1YmJsZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuYnViYmxlID09PSB2b2lkIDApIHJldHVybjtcbiAgICAgICAgdGhpcy5idWJibGUuY2xhc3NMaXN0LnJlbW92ZSgnZGF0aXVtLWJ1YmJsZS12aXNpYmxlJyk7XG4gICAgICAgIHNldFRpbWVvdXQoKGJ1YmJsZTpIVE1MRWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgYnViYmxlLnJlbW92ZSgpO1xuICAgICAgICB9LCAyMDAsIHRoaXMuYnViYmxlKTtcbiAgICAgICAgdGhpcy5idWJibGUgPSB2b2lkIDA7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgYnViYmxlOkhUTUxFbGVtZW50O1xuICAgIFxuICAgIHB1YmxpYyBvcGVuQnViYmxlKHg6bnVtYmVyLCB5Om51bWJlciwgdGV4dDpzdHJpbmcpIHtcbiAgICAgICAgaWYgKHRoaXMuYnViYmxlICE9PSB2b2lkIDApIHtcbiAgICAgICAgICAgIHRoaXMuY2xvc2VCdWJibGUoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJ1YmJsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1idWJibGUnKTtcbiAgICAgICAgdGhpcy5jb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5idWJibGUpO1xuICAgICAgICB0aGlzLnVwZGF0ZUJ1YmJsZSh4LCB5LCB0ZXh0KTtcbiAgICAgICAgc2V0VGltZW91dCgoYnViYmxlOkhUTUxFbGVtZW50KSA9PiB7XG4gICAgICAgICAgIGJ1YmJsZS5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tYnViYmxlLXZpc2libGUnKTsgXG4gICAgICAgIH0sIDAsIHRoaXMuYnViYmxlKTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHVwZGF0ZUJ1YmJsZSh4Om51bWJlciwgeTpudW1iZXIsIHRleHQ6c3RyaW5nKSB7XG4gICAgICAgIHRoaXMuYnViYmxlLmlubmVySFRNTCA9IHRleHQ7XG4gICAgICAgIHRoaXMuYnViYmxlLnN0eWxlLnRvcCA9IHkgKyAncHgnO1xuICAgICAgICB0aGlzLmJ1YmJsZS5zdHlsZS5sZWZ0ID0geCArICdweCc7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgdmlld2NoYW5nZWQoZGF0ZTpEYXRlLCBsZXZlbDpMZXZlbCwgdXBkYXRlOmJvb2xlYW4pIHtcbiAgICAgICAgaWYgKGxldmVsID09PSBMZXZlbC5OT05FKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50UGlja2VyICE9PSB2b2lkIDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRQaWNrZXIucmVtb3ZlKFRyYW5zaXRpb24uWk9PTV9PVVQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5hZGp1c3RIZWlnaHQoMTApO1xuICAgICAgICAgICAgaWYgKHVwZGF0ZSkgdGhpcy51cGRhdGVTZWxlY3RlZERhdGUoZGF0ZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGxldCB0cmFuc2l0aW9uOlRyYW5zaXRpb247XG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRQaWNrZXIgPT09IHZvaWQgMCkge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50UGlja2VyID0gdGhpcy5nZXRQaWNrZXIobGV2ZWwpO1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50UGlja2VyLmNyZWF0ZShkYXRlLCBUcmFuc2l0aW9uLlpPT01fSU4pO1xuICAgICAgICB9IGVsc2UgaWYgKCh0cmFuc2l0aW9uID0gdGhpcy5nZXRUcmFuc2l0aW9uKGRhdGUsIGxldmVsKSkgIT09IHZvaWQgMCkge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50UGlja2VyLnJlbW92ZSh0cmFuc2l0aW9uKTtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBpY2tlciA9IHRoaXMuZ2V0UGlja2VyKGxldmVsKTtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBpY2tlci5jcmVhdGUoZGF0ZSwgdHJhbnNpdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmICh1cGRhdGUpIHRoaXMudXBkYXRlU2VsZWN0ZWREYXRlKGRhdGUpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5hZGp1c3RIZWlnaHQodGhpcy5jdXJyZW50UGlja2VyLmdldEhlaWdodCgpKTtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSB1cGRhdGVTZWxlY3RlZERhdGUoZGF0ZTpEYXRlKSB7XG4gICAgICAgIHRoaXMueWVhclBpY2tlci5zZXRTZWxlY3RlZERhdGUoZGF0ZSk7XG4gICAgICAgIHRoaXMubW9udGhQaWNrZXIuc2V0U2VsZWN0ZWREYXRlKGRhdGUpO1xuICAgICAgICB0aGlzLmRhdGVQaWNrZXIuc2V0U2VsZWN0ZWREYXRlKGRhdGUpO1xuICAgICAgICB0aGlzLmhvdXJQaWNrZXIuc2V0U2VsZWN0ZWREYXRlKGRhdGUpO1xuICAgICAgICB0aGlzLm1pbnV0ZVBpY2tlci5zZXRTZWxlY3RlZERhdGUoZGF0ZSk7XG4gICAgICAgIHRoaXMuc2Vjb25kUGlja2VyLnNldFNlbGVjdGVkRGF0ZShkYXRlKTtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBnZXRUcmFuc2l0aW9uKGRhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWwpOlRyYW5zaXRpb24ge1xuICAgICAgICBpZiAobGV2ZWwgPiB0aGlzLmN1cnJlbnRQaWNrZXIuZ2V0TGV2ZWwoKSkgcmV0dXJuIFRyYW5zaXRpb24uWk9PTV9JTjtcbiAgICAgICAgaWYgKGxldmVsIDwgdGhpcy5jdXJyZW50UGlja2VyLmdldExldmVsKCkpIHJldHVybiBUcmFuc2l0aW9uLlpPT01fT1VUO1xuICAgICAgICBpZiAoZGF0ZS52YWx1ZU9mKCkgPCB0aGlzLmN1cnJlbnRQaWNrZXIuZ2V0TWluKCkudmFsdWVPZigpKSByZXR1cm4gVHJhbnNpdGlvbi5TTElERV9MRUZUO1xuICAgICAgICBpZiAoZGF0ZS52YWx1ZU9mKCkgPiB0aGlzLmN1cnJlbnRQaWNrZXIuZ2V0TWF4KCkudmFsdWVPZigpKSByZXR1cm4gVHJhbnNpdGlvbi5TTElERV9SSUdIVDtcbiAgICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBhZGp1c3RIZWlnaHQoaGVpZ2h0Om51bWJlcikge1xuICAgICAgICB0aGlzLnBpY2tlckNvbnRhaW5lci5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlWSgke2hlaWdodCAtIDI4MH1weClgO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIGdldFBpY2tlcihsZXZlbDpMZXZlbCk6SVBpY2tlciB7XG4gICAgICAgIHJldHVybiBbdGhpcy55ZWFyUGlja2VyLHRoaXMubW9udGhQaWNrZXIsdGhpcy5kYXRlUGlja2VyLHRoaXMuaG91clBpY2tlcix0aGlzLm1pbnV0ZVBpY2tlcix0aGlzLnNlY29uZFBpY2tlcl1bbGV2ZWxdO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgcmVtb3ZlQWN0aXZlQ2xhc3NlcygpIHtcbiAgICAgICAgbGV0IGFjdGl2ZUVsZW1lbnRzID0gdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnLmRhdGl1bS1hY3RpdmUnKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhY3RpdmVFbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYWN0aXZlRWxlbWVudHNbaV0uY2xhc3NMaXN0LnJlbW92ZSgnZGF0aXVtLWFjdGl2ZScpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1hY3RpdmUnKTtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBhZGRBY3RpdmVDbGFzc2VzKGU6TW91c2VFdmVudHxUb3VjaEV2ZW50KSB7XG4gICAgICAgIGxldCBlbCA9IGUuc3JjRWxlbWVudCB8fCA8RWxlbWVudD5lLnRhcmdldDtcbiAgICAgICAgd2hpbGUgKGVsICE9PSB0aGlzLmNvbnRhaW5lcikge1xuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLWFjdGl2ZScpO1xuICAgICAgICAgICAgZWwgPSBlbC5wYXJlbnRFbGVtZW50O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1hY3RpdmUnKTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHVwZGF0ZU9wdGlvbnMob3B0aW9uczpJT3B0aW9ucykge1xuICAgICAgICBsZXQgdGhlbWVVcGRhdGVkID0gdGhpcy5vcHRpb25zID09PSB2b2lkIDAgfHxcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy50aGVtZSA9PT0gdm9pZCAwIHx8XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMudGhlbWUucHJpbWFyeSAhPT0gb3B0aW9ucy50aGVtZS5wcmltYXJ5IHx8XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMudGhlbWUucHJpbWFyeV90ZXh0ICE9PSBvcHRpb25zLnRoZW1lLnByaW1hcnlfdGV4dCB8fFxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnRoZW1lLnNlY29uZGFyeSAhPT0gb3B0aW9ucy50aGVtZS5zZWNvbmRhcnkgfHxcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy50aGVtZS5zZWNvbmRhcnlfYWNjZW50ICE9PSBvcHRpb25zLnRoZW1lLnNlY29uZGFyeV9hY2NlbnQgfHxcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy50aGVtZS5zZWNvbmRhcnlfdGV4dCAhPT0gb3B0aW9ucy50aGVtZS5zZWNvbmRhcnlfdGV4dDtcbiAgICAgICAgXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgICAgIFxuICAgICAgICBpZiAodGhlbWVVcGRhdGVkKSB7XG4gICAgICAgICAgICB0aGlzLmluc2VydFN0eWxlcygpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0aGlzLmhlYWRlci51cGRhdGVPcHRpb25zKG9wdGlvbnMpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy55ZWFyUGlja2VyLnVwZGF0ZU9wdGlvbnMob3B0aW9ucyk7XG4gICAgICAgIHRoaXMubW9udGhQaWNrZXIudXBkYXRlT3B0aW9ucyhvcHRpb25zKTtcbiAgICAgICAgdGhpcy5kYXRlUGlja2VyLnVwZGF0ZU9wdGlvbnMob3B0aW9ucyk7XG4gICAgICAgIHRoaXMuaG91clBpY2tlci51cGRhdGVPcHRpb25zKG9wdGlvbnMpO1xuICAgICAgICB0aGlzLm1pbnV0ZVBpY2tlci51cGRhdGVPcHRpb25zKG9wdGlvbnMpO1xuICAgICAgICB0aGlzLnNlY29uZFBpY2tlci51cGRhdGVPcHRpb25zKG9wdGlvbnMpO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIGNyZWF0ZVZpZXcoKTpIVE1MRWxlbWVudCB7XG4gICAgICAgIGxldCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1jb250YWluZXInKTtcbiAgICAgICAgZWwuaW5uZXJIVE1MID0gaGVhZGVyICsgYFxuICAgICAgICA8ZGF0aXVtLXBpY2tlci1jb250YWluZXItd3JhcHBlcj5cbiAgICAgICAgICAgIDxkYXRpdW0tcGlja2VyLWNvbnRhaW5lcj48L2RhdGl1bS1waWNrZXItY29udGFpbmVyPlxuICAgICAgICA8L2RhdGl1bS1waWNrZXItY29udGFpbmVyLXdyYXBwZXI+YDtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBpbnNlcnRBZnRlcihub2RlOk5vZGUsIG5ld05vZGU6Tm9kZSk6dm9pZCB7XG4gICAgICAgIG5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUobmV3Tm9kZSwgbm9kZS5uZXh0U2libGluZyk7XG4gICAgfVxuICAgIFxuICAgIHN0YXRpYyBzdHlsZXNJbnNlcnRlZDpudW1iZXIgPSAwO1xuICAgIFxuICAgIHByaXZhdGUgaW5zZXJ0U3R5bGVzKCkge1xuICAgICAgICBsZXQgaGVhZCA9IGRvY3VtZW50LmhlYWQgfHwgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXTtcbiAgICAgICAgbGV0IHN0eWxlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgICAgIFxuICAgICAgICBsZXQgc3R5bGVJZCA9IFwiZGF0aXVtLXN0eWxlXCIgKyAoUGlja2VyTWFuYWdlci5zdHlsZXNJbnNlcnRlZCsrKTtcbiAgICAgICAgXG4gICAgICAgIGxldCBleGlzdGluZ1N0eWxlSWQgPSB0aGlzLmdldEV4aXN0aW5nU3R5bGVJZCgpO1xuICAgICAgICBpZiAoZXhpc3RpbmdTdHlsZUlkICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKGV4aXN0aW5nU3R5bGVJZCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoc3R5bGVJZCk7XG4gICAgICAgIFxuICAgICAgICBsZXQgdHJhbnNmb3JtZWRDc3MgPSBjc3MucmVwbGFjZSgvX3ByaW1hcnlfdGV4dC9nLCB0aGlzLm9wdGlvbnMudGhlbWUucHJpbWFyeV90ZXh0KTtcbiAgICAgICAgdHJhbnNmb3JtZWRDc3MgPSB0cmFuc2Zvcm1lZENzcy5yZXBsYWNlKC9fcHJpbWFyeS9nLCB0aGlzLm9wdGlvbnMudGhlbWUucHJpbWFyeSk7XG4gICAgICAgIHRyYW5zZm9ybWVkQ3NzID0gdHJhbnNmb3JtZWRDc3MucmVwbGFjZSgvX3NlY29uZGFyeV90ZXh0L2csIHRoaXMub3B0aW9ucy50aGVtZS5zZWNvbmRhcnlfdGV4dCk7XG4gICAgICAgIHRyYW5zZm9ybWVkQ3NzID0gdHJhbnNmb3JtZWRDc3MucmVwbGFjZSgvX3NlY29uZGFyeV9hY2NlbnQvZywgdGhpcy5vcHRpb25zLnRoZW1lLnNlY29uZGFyeV9hY2NlbnQpO1xuICAgICAgICB0cmFuc2Zvcm1lZENzcyA9IHRyYW5zZm9ybWVkQ3NzLnJlcGxhY2UoL19zZWNvbmRhcnkvZywgdGhpcy5vcHRpb25zLnRoZW1lLnNlY29uZGFyeSk7XG4gICAgICAgIHRyYW5zZm9ybWVkQ3NzID0gdHJhbnNmb3JtZWRDc3MucmVwbGFjZSgvX2lkL2csIHN0eWxlSWQpO1xuICAgICAgICBcbiAgICAgICAgc3R5bGVFbGVtZW50LnR5cGUgPSAndGV4dC9jc3MnO1xuICAgICAgICBpZiAoKDxhbnk+c3R5bGVFbGVtZW50KS5zdHlsZVNoZWV0KXtcbiAgICAgICAgICAgICg8YW55PnN0eWxlRWxlbWVudCkuc3R5bGVTaGVldC5jc3NUZXh0ID0gdHJhbnNmb3JtZWRDc3M7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdHlsZUVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodHJhbnNmb3JtZWRDc3MpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGhlYWQuYXBwZW5kQ2hpbGQoc3R5bGVFbGVtZW50KTsgIFxuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIGdldEV4aXN0aW5nU3R5bGVJZCgpOnN0cmluZyB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jb250YWluZXIuY2xhc3NMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoL15kYXRpdW0tc3R5bGVcXGQrJC8udGVzdCh0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QuaXRlbShpKSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jb250YWluZXIuY2xhc3NMaXN0Lml0ZW0oaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuIiwidmFyIGhlYWRlciA9IFwiPGRhdGl1bS1oZWFkZXItd3JhcHBlcj4gPGRhdGl1bS1oZWFkZXI+IDxkYXRpdW0tc3Bhbi1sYWJlbC1jb250YWluZXI+IDxkYXRpdW0tc3Bhbi1sYWJlbCBjbGFzcz0nZGF0aXVtLXllYXInPjwvZGF0aXVtLXNwYW4tbGFiZWw+IDxkYXRpdW0tc3Bhbi1sYWJlbCBjbGFzcz0nZGF0aXVtLW1vbnRoJz48L2RhdGl1bS1zcGFuLWxhYmVsPiA8ZGF0aXVtLXNwYW4tbGFiZWwgY2xhc3M9J2RhdGl1bS1kYXRlJz48L2RhdGl1bS1zcGFuLWxhYmVsPiA8ZGF0aXVtLXNwYW4tbGFiZWwgY2xhc3M9J2RhdGl1bS1ob3VyJz48L2RhdGl1bS1zcGFuLWxhYmVsPiA8ZGF0aXVtLXNwYW4tbGFiZWwgY2xhc3M9J2RhdGl1bS1taW51dGUnPjwvZGF0aXVtLXNwYW4tbGFiZWw+IDxkYXRpdW0tc3Bhbi1sYWJlbCBjbGFzcz0nZGF0aXVtLXNlY29uZCc+PC9kYXRpdW0tc3Bhbi1sYWJlbD4gPC9kYXRpdW0tc3Bhbi1sYWJlbC1jb250YWluZXI+IDxkYXRpdW0tcHJldj48L2RhdGl1bS1wcmV2PiA8ZGF0aXVtLW5leHQ+PC9kYXRpdW0tbmV4dD4gPC9kYXRpdW0taGVhZGVyPiA8L2RhdGl1bS1oZWFkZXItd3JhcHBlcj5cIjsiLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vY29tbW9uL0NvbW1vbi50c1wiIC8+XG5jbGFzcyBQaWNrZXIgZXh0ZW5kcyBDb21tb24ge1xuICAgIHByb3RlY3RlZCBwaWNrZXJDb250YWluZXI6SFRNTEVsZW1lbnQ7XG4gICAgcHJvdGVjdGVkIG1pbjpEYXRlID0gbmV3IERhdGUoKTtcbiAgICBwcm90ZWN0ZWQgbWF4OkRhdGUgPSBuZXcgRGF0ZSgpO1xuICAgIHByb3RlY3RlZCBwaWNrZXI6SFRNTEVsZW1lbnQ7XG4gICAgcHJvdGVjdGVkIHNlbGVjdGVkRGF0ZTpEYXRlO1xuICAgIHByb3RlY3RlZCBvcHRpb25zOklPcHRpb25zO1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBlbGVtZW50OkhUTUxFbGVtZW50LCBwcm90ZWN0ZWQgY29udGFpbmVyOkhUTUxFbGVtZW50KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMucGlja2VyQ29udGFpbmVyID0gPEhUTUxFbGVtZW50PmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdkYXRpdW0tcGlja2VyLWNvbnRhaW5lcicpO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgY3JlYXRlKGRhdGU6RGF0ZSwgdHJhbnNpdGlvbjpUcmFuc2l0aW9uKSB7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyByZW1vdmUodHJhbnNpdGlvbjpUcmFuc2l0aW9uKSB7XG4gICAgICAgIGlmICh0aGlzLnBpY2tlciA9PT0gdm9pZCAwKSByZXR1cm47XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRyYW5zaXRpb25JblRpbWVvdXQpO1xuICAgICAgICB0aGlzLnRyYW5zaXRpb25PdXQodHJhbnNpdGlvbiwgdGhpcy5waWNrZXIpO1xuICAgICAgICBzZXRUaW1lb3V0KChwaWNrZXI6SFRNTEVsZW1lbnQpID0+IHtcbiAgICAgICAgICAgIHBpY2tlci5yZW1vdmUoKTtcbiAgICAgICAgfSwgNTAwLCB0aGlzLnBpY2tlcik7ICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgcHJvdGVjdGVkIGdldE9mZnNldChlbDpIVE1MRWxlbWVudCk6e3g6bnVtYmVyLCB5Om51bWJlcn0ge1xuICAgICAgICBsZXQgeCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQgLSB0aGlzLmNvbnRhaW5lci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0O1xuICAgICAgICBsZXQgeSA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCAtIHRoaXMuY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcDtcbiAgICAgICAgcmV0dXJuIHsgeDogeCwgeTogeSB9O1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgdXBkYXRlT3B0aW9ucyhvcHRpb25zOklPcHRpb25zKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgfVxuICAgIFxuICAgIHByb3RlY3RlZCBhdHRhY2goKSB7XG4gICAgICAgIHRoaXMucGlja2VyQ29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMucGlja2VyKTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIGdldE1pbigpOkRhdGUge1xuICAgICAgICByZXR1cm4gdGhpcy5taW47XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBnZXRNYXgoKTpEYXRlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWF4O1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgc2V0U2VsZWN0ZWREYXRlKGRhdGU6RGF0ZSk6dm9pZCB7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWREYXRlID0gbmV3IERhdGUoZGF0ZS52YWx1ZU9mKCkpO1xuICAgIH1cbiAgICBcbiAgICBwcm90ZWN0ZWQgdHJhbnNpdGlvbk91dCh0cmFuc2l0aW9uOlRyYW5zaXRpb24sIHBpY2tlcjpIVE1MRWxlbWVudCkge1xuICAgICAgICBpZiAodHJhbnNpdGlvbiA9PT0gVHJhbnNpdGlvbi5TTElERV9MRUZUKSB7XG4gICAgICAgICAgICBwaWNrZXIuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLXBpY2tlci1yaWdodCcpO1xuICAgICAgICB9IGVsc2UgaWYgKHRyYW5zaXRpb24gPT09IFRyYW5zaXRpb24uU0xJREVfUklHSFQpIHtcbiAgICAgICAgICAgIHBpY2tlci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tcGlja2VyLWxlZnQnKTtcbiAgICAgICAgfSBlbHNlIGlmICh0cmFuc2l0aW9uID09PSBUcmFuc2l0aW9uLlpPT01fSU4pIHtcbiAgICAgICAgICAgIHBpY2tlci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tcGlja2VyLW91dCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGlja2VyLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1waWNrZXItaW4nKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBwcm90ZWN0ZWQgdHJhbnNpdGlvbkluVGltZW91dDpudW1iZXI7XG4gICAgXG4gICAgcHJvdGVjdGVkIHRyYW5zaXRpb25Jbih0cmFuc2l0aW9uOlRyYW5zaXRpb24sIHBpY2tlcjpIVE1MRWxlbWVudCkge1xuICAgICAgICBsZXQgY2xzOnN0cmluZztcbiAgICAgICAgaWYgKHRyYW5zaXRpb24gPT09IFRyYW5zaXRpb24uU0xJREVfTEVGVCkge1xuICAgICAgICAgICAgY2xzID0gJ2RhdGl1bS1waWNrZXItbGVmdCc7XG4gICAgICAgIH0gZWxzZSBpZiAodHJhbnNpdGlvbiA9PT0gVHJhbnNpdGlvbi5TTElERV9SSUdIVCkge1xuICAgICAgICAgICAgY2xzID0gJ2RhdGl1bS1waWNrZXItcmlnaHQnO1xuICAgICAgICB9IGVsc2UgaWYgKHRyYW5zaXRpb24gPT09IFRyYW5zaXRpb24uWk9PTV9JTikge1xuICAgICAgICAgICAgY2xzID0gJ2RhdGl1bS1waWNrZXItaW4nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2xzID0gJ2RhdGl1bS1waWNrZXItb3V0JztcbiAgICAgICAgfVxuICAgICAgICBwaWNrZXIuY2xhc3NMaXN0LmFkZChjbHMpO1xuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy50cmFuc2l0aW9uSW5UaW1lb3V0KTtcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uSW5UaW1lb3V0ID0gc2V0VGltZW91dCgocDpIVE1MRWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgcC5jbGFzc0xpc3QucmVtb3ZlKGNscyk7XG4gICAgICAgIH0sIDEwMCwgcGlja2VyKTtcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiUGlja2VyLnRzXCIgLz5cblxuY2xhc3MgRGF0ZVBpY2tlciBleHRlbmRzIFBpY2tlciBpbXBsZW1lbnRzIElQaWNrZXIge1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6SFRNTEVsZW1lbnQsIGNvbnRhaW5lcjpIVE1MRWxlbWVudCkge1xuICAgICAgICBzdXBlcihlbGVtZW50LCBjb250YWluZXIpO1xuICAgICAgICBcbiAgICAgICAgbGlzdGVuLnRhcChjb250YWluZXIsICdkYXRpdW0tZGF0ZS1lbGVtZW50W2RhdGl1bS1kYXRhXScsIChlKSA9PiB7XG4gICAgICAgICAgIGxldCBlbDpFbGVtZW50ID0gPEVsZW1lbnQ+ZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xuICAgICAgICAgICBcbiAgICAgICAgICAgbGV0IHllYXIgPSBuZXcgRGF0ZShlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpLmdldEZ1bGxZZWFyKCk7XG4gICAgICAgICAgIGxldCBtb250aCA9IG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSkuZ2V0TW9udGgoKTtcbiAgICAgICAgICAgbGV0IGRhdGVPZk1vbnRoID0gbmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKS5nZXREYXRlKCk7XG4gICAgICAgICAgIFxuICAgICAgICAgICBsZXQgZGF0ZSA9IG5ldyBEYXRlKHRoaXMuc2VsZWN0ZWREYXRlLnZhbHVlT2YoKSk7XG4gICAgICAgICAgIGRhdGUuc2V0RnVsbFllYXIoeWVhcik7XG4gICAgICAgICAgIGRhdGUuc2V0TW9udGgobW9udGgpO1xuICAgICAgICAgICBpZiAoZGF0ZS5nZXRNb250aCgpICE9PSBtb250aCkge1xuICAgICAgICAgICAgICAgZGF0ZS5zZXREYXRlKDApO1xuICAgICAgICAgICB9XG4gICAgICAgICAgIGRhdGUuc2V0RGF0ZShkYXRlT2ZNb250aCk7XG4gICAgICAgICAgIFxuICAgICAgICAgICB0cmlnZ2VyLnpvb21JbihlbGVtZW50LCB7XG4gICAgICAgICAgICAgICBkYXRlOiBkYXRlLFxuICAgICAgICAgICAgICAgY3VycmVudExldmVsOiBMZXZlbC5EQVRFXG4gICAgICAgICAgIH0pXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgbGlzdGVuLmRvd24oY29udGFpbmVyLCAnZGF0aXVtLWRhdGUtZWxlbWVudCcsIChlKSA9PiB7XG4gICAgICAgICAgICBsZXQgZWw6SFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+KGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudCk7XG4gICAgICAgICAgICBsZXQgdGV4dCA9IHRoaXMucGFkKG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSkuZ2V0RGF0ZSgpKTtcbiAgICAgICAgICAgIGxldCBvZmZzZXQgPSB0aGlzLmdldE9mZnNldChlbCk7XG4gICAgICAgICAgICB0cmlnZ2VyLm9wZW5CdWJibGUoZWxlbWVudCwge1xuICAgICAgICAgICAgICAgIHg6IG9mZnNldC54ICsgMjAsXG4gICAgICAgICAgICAgICAgeTogb2Zmc2V0LnkgKyAyLFxuICAgICAgICAgICAgICAgIHRleHQ6IHRleHRcbiAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIGhlaWdodDpudW1iZXI7XG4gICAgXG4gICAgcHVibGljIGNyZWF0ZShkYXRlOkRhdGUsIHRyYW5zaXRpb246VHJhbnNpdGlvbikge1xuICAgICAgICB0aGlzLm1pbiA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpKTtcbiAgICAgICAgdGhpcy5tYXggPSBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSArIDEpO1xuICAgICAgICBcbiAgICAgICAgbGV0IHN0YXJ0ID0gbmV3IERhdGUodGhpcy5taW4udmFsdWVPZigpKTtcbiAgICAgICAgc3RhcnQuc2V0RGF0ZSgxIC0gc3RhcnQuZ2V0RGF5KCkpO1xuICAgICAgICBcbiAgICAgICAgbGV0IGVuZCA9IG5ldyBEYXRlKHRoaXMubWF4LnZhbHVlT2YoKSk7XG4gICAgICAgIGVuZC5zZXREYXRlKGVuZC5nZXREYXRlKCkgKyA3IC0gKGVuZC5nZXREYXkoKSA9PT0gMCA/IDcgOiBlbmQuZ2V0RGF5KCkpKTtcbiAgICAgICAgXG4gICAgICAgIGxldCBpdGVyYXRvciA9IG5ldyBEYXRlKHN0YXJ0LnZhbHVlT2YoKSk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnBpY2tlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1waWNrZXInKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbkluKHRyYW5zaXRpb24sIHRoaXMucGlja2VyKTtcbiAgICAgICAgXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNzsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgaGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLWRhdGUtaGVhZGVyJyk7XG4gICAgICAgICAgICBoZWFkZXIuaW5uZXJIVE1MID0gdGhpcy5nZXREYXlzKClbaV0uc2xpY2UoMCwgMik7XG4gICAgICAgICAgICB0aGlzLnBpY2tlci5hcHBlbmRDaGlsZChoZWFkZXIpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBsZXQgdGltZXMgPSAwO1xuICAgICAgICBcbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgbGV0IGRhdGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLWRhdGUtZWxlbWVudCcpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBkYXRlRWxlbWVudC5pbm5lckhUTUwgPSBpdGVyYXRvci5nZXREYXRlKCkudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKGl0ZXJhdG9yLmdldE1vbnRoKCkgPT09IGRhdGUuZ2V0TW9udGgoKSkge1xuICAgICAgICAgICAgICAgIGRhdGVFbGVtZW50LnNldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnLCBpdGVyYXRvci50b0lTT1N0cmluZygpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5waWNrZXIuYXBwZW5kQ2hpbGQoZGF0ZUVsZW1lbnQpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpdGVyYXRvci5zZXREYXRlKGl0ZXJhdG9yLmdldERhdGUoKSArIDEpO1xuICAgICAgICAgICAgdGltZXMrKztcbiAgICAgICAgfSB3aGlsZSAoaXRlcmF0b3IudmFsdWVPZigpIDwgZW5kLnZhbHVlT2YoKSk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBNYXRoLmNlaWwodGltZXMgLyA3KSAqIDM2ICsgMjg7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmF0dGFjaCgpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5zZXRTZWxlY3RlZERhdGUodGhpcy5zZWxlY3RlZERhdGUpO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgc2V0U2VsZWN0ZWREYXRlKHNlbGVjdGVkRGF0ZTpEYXRlKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWREYXRlID0gbmV3IERhdGUoc2VsZWN0ZWREYXRlLnZhbHVlT2YoKSk7XG4gICAgICAgIFxuICAgICAgICBsZXQgZGF0ZUVsZW1lbnRzID0gdGhpcy5waWNrZXJDb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnZGF0aXVtLWRhdGUtZWxlbWVudCcpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGVFbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGV0IGVsID0gZGF0ZUVsZW1lbnRzLml0ZW0oaSk7XG4gICAgICAgICAgICBsZXQgZGF0ZSA9IG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSk7XG4gICAgICAgICAgICBpZiAoZGF0ZS5nZXRGdWxsWWVhcigpID09PSBzZWxlY3RlZERhdGUuZ2V0RnVsbFllYXIoKSAmJlxuICAgICAgICAgICAgICAgIGRhdGUuZ2V0TW9udGgoKSA9PT0gc2VsZWN0ZWREYXRlLmdldE1vbnRoKCkgJiZcbiAgICAgICAgICAgICAgICBkYXRlLmdldERhdGUoKSA9PT0gc2VsZWN0ZWREYXRlLmdldERhdGUoKSkge1xuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1zZWxlY3RlZCcpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdkYXRpdW0tc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgZ2V0SGVpZ2h0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5oZWlnaHQ7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcbiAgICAgICAgcmV0dXJuIExldmVsLkRBVEU7XG4gICAgfVxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJQaWNrZXIudHNcIiAvPlxuXG5jbGFzcyBUaW1lUGlja2VyIGV4dGVuZHMgUGlja2VyIHtcbiAgICBwcm90ZWN0ZWQgdGltZURyYWc6SFRNTEVsZW1lbnQ7XG4gICAgcHJvdGVjdGVkIHRpbWVEcmFnQXJtOkhUTUxFbGVtZW50O1xuICAgIFxuICAgIHByb3RlY3RlZCBzZWNvbmRIYW5kOkhUTUxFbGVtZW50O1xuICAgIHByb3RlY3RlZCBob3VySGFuZDpIVE1MRWxlbWVudDtcbiAgICBwcm90ZWN0ZWQgbWludXRlSGFuZDpIVE1MRWxlbWVudDtcbiAgICBcbiAgICBwcm90ZWN0ZWQgZHJhZ2dpbmc6Ym9vbGVhbiA9IGZhbHNlO1xuICAgIHB1YmxpYyBpc0RyYWdnaW5nKCk6Ym9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmRyYWdnaW5nO1xuICAgIH1cbiAgICBcbiAgICBwcm90ZWN0ZWQgcm90YXRpb246bnVtYmVyID0gMDtcbiAgICBcbiAgICBwcm90ZWN0ZWQgZHJhZ1N0YXJ0KGU6TW91c2VFdmVudHxUb3VjaEV2ZW50KSB7XG4gICAgICAgIHRyaWdnZXIub3BlbkJ1YmJsZSh0aGlzLmVsZW1lbnQsIHtcbiAgICAgICAgICAgeDogLTcwICogTWF0aC5zaW4odGhpcy5yb3RhdGlvbikgKyAxNDAsIFxuICAgICAgICAgICB5OiA3MCAqIE1hdGguY29zKHRoaXMucm90YXRpb24pICsgMTc1LFxuICAgICAgICAgICB0ZXh0OiB0aGlzLmdldEJ1YmJsZVRleHQoKSBcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucGlja2VyLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1kcmFnZ2luZycpO1xuICAgICAgICB0aGlzLmRyYWdnaW5nID0gdHJ1ZTtcbiAgICB9XG4gICAgXG4gICAgcHJvdGVjdGVkIGRyYWdNb3ZlKGU6TW91c2VFdmVudHxUb3VjaEV2ZW50KSB7XG4gICAgICAgIHRyaWdnZXIudXBkYXRlQnViYmxlKHRoaXMuZWxlbWVudCwge1xuICAgICAgICAgICB4OiAtNzAgKiBNYXRoLnNpbih0aGlzLnJvdGF0aW9uKSArIDE0MCwgXG4gICAgICAgICAgIHk6IDcwICogTWF0aC5jb3ModGhpcy5yb3RhdGlvbikgKyAxNzUsXG4gICAgICAgICAgIHRleHQ6IHRoaXMuZ2V0QnViYmxlVGV4dCgpXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgbGV0IHBvaW50ID0ge1xuICAgICAgICAgICAgeDogdGhpcy5waWNrZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdCArIDE0MCAtIHRoaXMuZ2V0Q2xpZW50Q29vcihlKS54LFxuICAgICAgICAgICAgeTogdGhpcy5nZXRDbGllbnRDb29yKGUpLnkgLSB0aGlzLnBpY2tlci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AgLSAxMjBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgbGV0IHIgPSBNYXRoLmF0YW4yKHBvaW50LngsIHBvaW50LnkpOyAgICAgICAgXG4gICAgICAgIHRoaXMucm90YXRpb24gPSB0aGlzLm5vcm1hbGl6ZVJvdGF0aW9uKHIpO1xuICAgICAgICBcbiAgICAgICAgbGV0IG5ld0RhdGUgPSB0aGlzLmdldEVsZW1lbnREYXRlKHRoaXMudGltZURyYWcpO1xuICAgICAgICBpZiAodGhpcy5nZXRMZXZlbCgpID09PSBMZXZlbC5IT1VSKSB7XG4gICAgICAgICAgICBuZXdEYXRlLnNldEhvdXJzKHRoaXMucm90YXRpb25Ub1RpbWUodGhpcy5yb3RhdGlvbikpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZ2V0TGV2ZWwoKSA9PT0gTGV2ZWwuTUlOVVRFKSB7XG4gICAgICAgICAgICBuZXdEYXRlLnNldE1pbnV0ZXModGhpcy5yb3RhdGlvblRvVGltZSh0aGlzLnJvdGF0aW9uKSk7ICAgICAgICAgICAgXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5nZXRMZXZlbCgpID09PSBMZXZlbC5TRUNPTkQpIHtcbiAgICAgICAgICAgIG5ld0RhdGUuc2V0U2Vjb25kcyh0aGlzLnJvdGF0aW9uVG9UaW1lKHRoaXMucm90YXRpb24pKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVwZGF0ZUxhYmVscyhuZXdEYXRlKTtcbiAgICAgICAgdHJpZ2dlci5nb3RvKHRoaXMuZWxlbWVudCwge1xuICAgICAgICAgICAgZGF0ZTogbmV3RGF0ZSxcbiAgICAgICAgICAgIGxldmVsOiB0aGlzLmdldExldmVsKCksXG4gICAgICAgICAgICB1cGRhdGU6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgdGhpcy51cGRhdGVFbGVtZW50cygpO1xuICAgIH1cbiAgICBcbiAgICBwcm90ZWN0ZWQgZHJhZ0VuZChlOk1vdXNlRXZlbnR8VG91Y2hFdmVudCkge1xuICAgICAgICB0aGlzLnBpY2tlci5jbGFzc0xpc3QucmVtb3ZlKCdkYXRpdW0tZHJhZ2dpbmcnKTtcbiAgICAgICAgXG4gICAgICAgIGxldCBkYXRlID0gdGhpcy5nZXRFbGVtZW50RGF0ZSh0aGlzLnRpbWVEcmFnKTtcbiAgICAgICAgaWYgKHRoaXMuZ2V0TGV2ZWwoKSA9PT0gTGV2ZWwuSE9VUikge1xuICAgICAgICAgICAgZGF0ZS5zZXRIb3Vycyh0aGlzLnJvdGF0aW9uVG9UaW1lKHRoaXMucm90YXRpb24pKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmdldExldmVsKCkgPT09IExldmVsLk1JTlVURSkge1xuICAgICAgICAgICAgZGF0ZS5zZXRNaW51dGVzKHRoaXMucm90YXRpb25Ub1RpbWUodGhpcy5yb3RhdGlvbikpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZ2V0TGV2ZWwoKSA9PT0gTGV2ZWwuU0VDT05EKSB7XG4gICAgICAgICAgICBkYXRlLnNldFNlY29uZHModGhpcy5yb3RhdGlvblRvVGltZSh0aGlzLnJvdGF0aW9uKSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRyaWdnZXIuem9vbUluKHRoaXMuZWxlbWVudCwge1xuICAgICAgICAgICAgZGF0ZTogZGF0ZSxcbiAgICAgICAgICAgIGN1cnJlbnRMZXZlbDogdGhpcy5nZXRMZXZlbCgpXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5kcmFnZ2luZyA9IGZhbHNlO1xuICAgIH1cbiAgICBcbiAgICBwcm90ZWN0ZWQgdXBkYXRlRWxlbWVudHMoKSB7XG4gICAgICAgIHRoaXMudGltZURyYWdBcm0uc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZSgke3RoaXMucm90YXRpb259cmFkKWA7XG4gICAgICAgIGlmICh0aGlzLmdldExldmVsKCkgPT0gTGV2ZWwuSE9VUikge1xuICAgICAgICAgICAgdGhpcy5ob3VySGFuZC5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlKCR7dGhpcy5yb3RhdGlvbn1yYWQpYDtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmdldExldmVsKCkgPT09IExldmVsLk1JTlVURSkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgdCA9IHRoaXMuc2VsZWN0ZWREYXRlLmdldEhvdXJzKCk7XG4gICAgICAgICAgICBsZXQgcjEgPSAgKHQgKyA2KSAvIDYgKiBNYXRoLlBJO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgciA9IHRoaXMucm90YXRpb247XG4gICAgICAgICAgICByID0gdGhpcy5wdXRSb3RhdGlvbkluQm91bmRzKHIpO1xuICAgICAgICAgICAgcjEgKz0gKHIrTWF0aC5QSSkvMTI7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuaG91ckhhbmQuc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZSgke3IxfXJhZClgO1xuICAgICAgICAgICAgdGhpcy5taW51dGVIYW5kLnN0eWxlLnRyYW5zZm9ybSA9IGByb3RhdGUoJHt0aGlzLnJvdGF0aW9ufXJhZClgO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZ2V0TGV2ZWwoKSA9PT0gTGV2ZWwuU0VDT05EKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxldCB0ID0gdGhpcy5zZWxlY3RlZERhdGUuZ2V0SG91cnMoKTtcbiAgICAgICAgICAgIGxldCByMSA9ICAodCArIDYpIC8gNiAqIE1hdGguUEk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgdDIgPSB0aGlzLnNlbGVjdGVkRGF0ZS5nZXRNaW51dGVzKCk7XG4gICAgICAgICAgICBsZXQgcjIgPSB0aGlzLnRpbWVUb1JvdGF0aW9uKHQyKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IHIgPSByMjtcbiAgICAgICAgICAgIHIgPSB0aGlzLnB1dFJvdGF0aW9uSW5Cb3VuZHMocik7XG4gICAgICAgICAgICByMSArPSAocitNYXRoLlBJKS8xMjtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5ob3VySGFuZC5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlKCR7cjF9cmFkKWA7XG4gICAgICAgICAgICB0aGlzLm1pbnV0ZUhhbmQuc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZSgke3IyfXJhZClgO1xuICAgICAgICAgICAgdGhpcy5zZWNvbmRIYW5kLnN0eWxlLnRyYW5zZm9ybSA9IGByb3RhdGUoJHt0aGlzLnJvdGF0aW9ufXJhZClgO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHByb3RlY3RlZCBwdXRSb3RhdGlvbkluQm91bmRzKHI6bnVtYmVyLCBmYWN0b3I6bnVtYmVyID0gMikge1xuICAgICAgICB3aGlsZSAociA+IE1hdGguUEkpIHIgLT0gTWF0aC5QSSAqIGZhY3RvcjtcbiAgICAgICAgd2hpbGUgKHIgPCAtTWF0aC5QSSkgciArPSBNYXRoLlBJICogZmFjdG9yO1xuICAgICAgICByZXR1cm4gcjtcbiAgICB9XG4gICAgXG4gICAgcHJvdGVjdGVkIG5vcm1hbGl6ZVJvdGF0aW9uKHI6bnVtYmVyLCBmYWN0b3I6bnVtYmVyID0gMikge1xuICAgICAgICByZXR1cm4gciAtIE1hdGgucm91bmQoKHIgLSB0aGlzLnJvdGF0aW9uKSAvIE1hdGguUEkgLyBmYWN0b3IpICogTWF0aC5QSSAqIGZhY3RvcjtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHNldFNlbGVjdGVkRGF0ZShkYXRlOkRhdGUpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RlZERhdGUgPSBuZXcgRGF0ZShkYXRlLnZhbHVlT2YoKSk7XG4gICAgICAgIFxuICAgICAgICBpZiAodGhpcy5nZXRMZXZlbCgpID09PSBMZXZlbC5IT1VSKSB7XG4gICAgICAgICAgICB0aGlzLnJvdGF0aW9uID0gdGhpcy5ub3JtYWxpemVSb3RhdGlvbigoZGF0ZS5nZXRIb3VycygpICsgNikgLyA2ICogTWF0aC5QSSwgMik7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5nZXRMZXZlbCgpID09PSBMZXZlbC5NSU5VVEUpIHtcbiAgICAgICAgICAgIHRoaXMucm90YXRpb24gPSB0aGlzLm5vcm1hbGl6ZVJvdGF0aW9uKChkYXRlLmdldE1pbnV0ZXMoKSArIDMwKSAvIDMwICogTWF0aC5QSSwgMik7ICAgICAgICAgICAgXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5nZXRMZXZlbCgpID09PSBMZXZlbC5TRUNPTkQpIHtcbiAgICAgICAgICAgIHRoaXMucm90YXRpb24gPSB0aGlzLm5vcm1hbGl6ZVJvdGF0aW9uKChkYXRlLmdldFNlY29uZHMoKSArIDMwKSAvIDMwICogTWF0aC5QSSwgMik7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmICh0aGlzLnRpbWVEcmFnQXJtICE9PSB2b2lkIDApIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRWxlbWVudHMoKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXMucGlja2VyICE9PSB2b2lkIDApIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlTGFiZWxzKGRhdGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBnZXRIZWlnaHQoKSB7XG4gICAgICAgIHJldHVybiAyNDA7XG4gICAgfVxuICAgIFxuICAgIHByb3RlY3RlZCB1cGRhdGVMYWJlbHMoZGF0ZTpEYXRlLCBmb3JjZVVwZGF0ZTpib29sZWFuID0gZmFsc2UpIHsgdGhyb3cgJ3VuaW1wbGVtZW50ZWQnIH1cbiAgICBwcm90ZWN0ZWQgZ2V0RWxlbWVudERhdGUoZWw6RWxlbWVudCk6RGF0ZSB7IHRocm93ICd1bmltcGxlbWVudGVkJyB9XG4gICAgcHJvdGVjdGVkIGdldEJ1YmJsZVRleHQoKTpzdHJpbmcgeyB0aHJvdyAndW5pbXBsZW1lbnRlZCcgfVxuICAgIHByb3RlY3RlZCByb3RhdGlvblRvVGltZShyb3RhdGlvbjpudW1iZXIpOm51bWJlciB7IHRocm93ICd1bmltcGxlbWVudGVkJyB9XG4gICAgcHJvdGVjdGVkIHRpbWVUb1JvdGF0aW9uKHRpbWU6bnVtYmVyKTpudW1iZXIgeyB0aHJvdyAndW5pbXBsZW1lbnRlZCcgfVxuICAgIHB1YmxpYyBnZXRMZXZlbCgpOkxldmVsIHsgdGhyb3cgJ3VuaW1wbGVtZW50ZWQnIH1cbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiVGltZVBpY2tlci50c1wiIC8+XG5cbmNsYXNzIEhvdXJQaWNrZXIgZXh0ZW5kcyBUaW1lUGlja2VyIGltcGxlbWVudHMgSVRpbWVQaWNrZXIge1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6SFRNTEVsZW1lbnQsIGNvbnRhaW5lcjpIVE1MRWxlbWVudCkge1xuICAgICAgICBzdXBlcihlbGVtZW50LCBjb250YWluZXIpO1xuICAgICAgICBcbiAgICAgICAgbGlzdGVuLmRyYWcoY29udGFpbmVyLCAnLmRhdGl1bS1ob3VyLWRyYWcnLCB7XG4gICAgICAgICAgICBkcmFnU3RhcnQ6IChlKSA9PiB0aGlzLmRyYWdTdGFydChlKSxcbiAgICAgICAgICAgIGRyYWdNb3ZlOiAoZSkgPT4gdGhpcy5kcmFnTW92ZShlKSxcbiAgICAgICAgICAgIGRyYWdFbmQ6IChlKSA9PiB0aGlzLmRyYWdFbmQoZSksIFxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGxpc3Rlbi50YXAoY29udGFpbmVyLCAnLmRhdGl1bS1ob3VyLWVsZW1lbnQnLCAoZSkgPT4ge1xuICAgICAgICAgICAgbGV0IGVsOkVsZW1lbnQgPSA8RWxlbWVudD5lLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRyaWdnZXIuem9vbUluKHRoaXMuZWxlbWVudCwge1xuICAgICAgICAgICAgICAgIGRhdGU6IHRoaXMuZ2V0RWxlbWVudERhdGUoZWwpLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRMZXZlbDogTGV2ZWwuSE9VUlxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgbGlzdGVuLmRvd24oY29udGFpbmVyLCAnLmRhdGl1bS1ob3VyLWVsZW1lbnQnLCAoZSkgPT4ge1xuICAgICAgICAgICAgbGV0IGVsOkhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PihlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQpO1xuICAgICAgICAgICAgbGV0IGhvdXJzID0gbmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKS5nZXRIb3VycygpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgb2Zmc2V0ID0gdGhpcy5nZXRPZmZzZXQoZWwpO1xuICAgICAgICAgICAgdHJpZ2dlci5vcGVuQnViYmxlKGVsZW1lbnQsIHtcbiAgICAgICAgICAgICAgICB4OiBvZmZzZXQueCArIDI1LFxuICAgICAgICAgICAgICAgIHk6IG9mZnNldC55ICsgMyxcbiAgICAgICAgICAgICAgICB0ZXh0OiB0aGlzLmdldEJ1YmJsZVRleHQoaG91cnMpXG4gICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGxpc3Rlbi50YXAoY29udGFpbmVyLCAnZGF0aXVtLW1lcmlkaWVtLXN3aXRjaGVyJywgKCkgPT4ge1xuICAgICAgICAgICAgbGV0IG5ld0RhdGUgPSBuZXcgRGF0ZSh0aGlzLmxhc3RMYWJlbERhdGUudmFsdWVPZigpKTtcbiAgICAgICAgICAgIGlmIChuZXdEYXRlLmdldEhvdXJzKCkgPCAxMikge1xuICAgICAgICAgICAgICAgIG5ld0RhdGUuc2V0SG91cnMobmV3RGF0ZS5nZXRIb3VycygpICsgMTIpO1xuICAgICAgICAgICAgICAgIHRoaXMucm90YXRpb24gKz0gTWF0aC5QSSAqIDI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5ld0RhdGUuc2V0SG91cnMobmV3RGF0ZS5nZXRIb3VycygpIC0gMTIpO1xuICAgICAgICAgICAgICAgIHRoaXMucm90YXRpb24gLT0gTWF0aC5QSSAqIDI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMudXBkYXRlTGFiZWxzKG5ld0RhdGUpO1xuICAgICAgICAgICAgdHJpZ2dlci5nb3RvKHRoaXMuZWxlbWVudCwge1xuICAgICAgICAgICAgICAgIGRhdGU6IG5ld0RhdGUsXG4gICAgICAgICAgICAgICAgbGV2ZWw6IExldmVsLkhPVVIsXG4gICAgICAgICAgICAgICAgdXBkYXRlOiBmYWxzZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUVsZW1lbnRzKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBwcm90ZWN0ZWQgZ2V0QnViYmxlVGV4dChob3Vycz86bnVtYmVyKSB7XG4gICAgICAgIGlmIChob3VycyA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgICBob3VycyA9IHRoaXMucm90YXRpb25Ub1RpbWUodGhpcy5yb3RhdGlvbik7IFxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMubWlsaXRhcnlUaW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYWQoaG91cnMpKydocic7XG4gICAgICAgIH0gZWxzZSBpZiAoaG91cnMgPT09IDEyKSB7XG4gICAgICAgICAgICByZXR1cm4gJzEycG0nO1xuICAgICAgICB9IGVsc2UgaWYgKGhvdXJzID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gJzEyYW0nO1xuICAgICAgICB9IGVsc2UgaWYgKGhvdXJzID4gMTEpIHtcbiAgICAgICAgICAgIHJldHVybiAoaG91cnMgLSAxMikgKyAncG0nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGhvdXJzICsgJ2FtJztcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBwcm90ZWN0ZWQgZ2V0RWxlbWVudERhdGUoZWw6RWxlbWVudCkge1xuICAgICAgICBsZXQgZCA9IG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSk7XG4gICAgICAgIGxldCB5ZWFyID0gZC5nZXRGdWxsWWVhcigpO1xuICAgICAgICBsZXQgbW9udGggPSBkLmdldE1vbnRoKCk7XG4gICAgICAgIGxldCBkYXRlT2ZNb250aCA9IGQuZ2V0RGF0ZSgpO1xuICAgICAgICBsZXQgaG91cnMgPSBkLmdldEhvdXJzKCk7XG4gICAgICAgIFxuICAgICAgICBsZXQgbmV3RGF0ZSA9IG5ldyBEYXRlKHRoaXMuc2VsZWN0ZWREYXRlLnZhbHVlT2YoKSk7XG4gICAgICAgIG5ld0RhdGUuc2V0RnVsbFllYXIoeWVhcik7XG4gICAgICAgIG5ld0RhdGUuc2V0TW9udGgobW9udGgpO1xuICAgICAgICBpZiAobmV3RGF0ZS5nZXRNb250aCgpICE9PSBtb250aCkge1xuICAgICAgICAgICAgbmV3RGF0ZS5zZXREYXRlKDApO1xuICAgICAgICB9XG4gICAgICAgIG5ld0RhdGUuc2V0RGF0ZShkYXRlT2ZNb250aCk7XG4gICAgICAgIG5ld0RhdGUuc2V0SG91cnMoaG91cnMpO1xuICAgICAgICByZXR1cm4gbmV3RGF0ZTtcbiAgICB9XG4gICAgXG4gICAgcHJvdGVjdGVkIHJvdGF0aW9uVG9UaW1lKHI6bnVtYmVyKSB7XG4gICAgICAgIHdoaWxlIChyID4gNSpNYXRoLlBJKSByIC09IDQqTWF0aC5QSTtcbiAgICAgICAgd2hpbGUgKHIgPCBNYXRoLlBJKSByICs9IDQqTWF0aC5QSTtcbiAgICAgICAgciAtPSAyICogTWF0aC5QSTtcbiAgICAgICAgbGV0IHQgPSAociAvIE1hdGguUEkgKiA2KSArIDY7XG4gICAgICAgIHJldHVybiB0ID49IDIzLjUgPyAwIDogTWF0aC5yb3VuZCh0KTtcbiAgICB9XG4gICAgXG4gICAgcHJvdGVjdGVkIHRpbWVUb1JvdGF0aW9uKHQ6bnVtYmVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5vcm1hbGl6ZVJvdGF0aW9uKCh0ICsgNikgLyA2ICogTWF0aC5QSSk7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBjcmVhdGUoZGF0ZTpEYXRlLCB0cmFuc2l0aW9uOlRyYW5zaXRpb24pIHtcbiAgICAgICAgdGhpcy5taW4gPSBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSwgZGF0ZS5nZXREYXRlKCkpO1xuICAgICAgICB0aGlzLm1heCA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCBkYXRlLmdldERhdGUoKSArIDEpO1xuICAgICAgICBcbiAgICAgICAgbGV0IGl0ZXJhdG9yID0gbmV3IERhdGUodGhpcy5taW4udmFsdWVPZigpKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMucGlja2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXBpY2tlcicpO1xuICAgICAgICB0aGlzLnBpY2tlci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0taG91ci1waWNrZXInKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbkluKHRyYW5zaXRpb24sIHRoaXMucGlja2VyKTtcbiAgICAgICAgXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTI7IGkrKykge1xuICAgICAgICAgICAgbGV0IHRpY2sgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tdGljaycpO1xuICAgICAgICAgICAgbGV0IHRpY2tMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS10aWNrLWxhYmVsJyk7XG4gICAgICAgICAgICB0aWNrTGFiZWwuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLWhvdXItZWxlbWVudCcpO1xuICAgICAgICAgICAgbGV0IHRpY2tMYWJlbENvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS10aWNrLWxhYmVsLWNvbnRhaW5lcicpO1xuICAgICAgICAgICAgbGV0IHIgPSBpICogTWF0aC5QSS82ICsgTWF0aC5QSTtcbiAgICAgICAgICAgIHRpY2tMYWJlbENvbnRhaW5lci5hcHBlbmRDaGlsZCh0aWNrTGFiZWwpO1xuICAgICAgICAgICAgdGljay5hcHBlbmRDaGlsZCh0aWNrTGFiZWxDb250YWluZXIpO1xuICAgICAgICAgICAgdGljay5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlKCR7cn1yYWQpYDtcbiAgICAgICAgICAgIHRpY2tMYWJlbENvbnRhaW5lci5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlKCR7MipNYXRoLlBJIC0gcn1yYWQpYDtcbiAgICAgICAgICAgIHRpY2tMYWJlbC5zZXRBdHRyaWJ1dGUoJ2RhdGl1bS1jbG9jay1wb3MnLCBpLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgZCA9IG5ldyBEYXRlKGRhdGUudmFsdWVPZigpKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IGhvdXJzID0gdGhpcy5yb3RhdGlvblRvVGltZShyKTtcbiAgICAgICAgICAgIGlmIChkYXRlLmdldEhvdXJzKCkgPiAxMSkgaG91cnMgKz0gMTI7XG4gICAgICAgICAgICBkLnNldEhvdXJzKGhvdXJzKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGlja0xhYmVsLnNldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnLCBkLnRvSVNPU3RyaW5nKCkpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLnBpY2tlci5hcHBlbmRDaGlsZCh0aWNrKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpcy5tZXJpZGllbVN3aXRjaGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLW1lcmlkaWVtLXN3aXRjaGVyJyk7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMubWlsaXRhcnlUaW1lKSB7XG4gICAgICAgICAgICB0aGlzLm1lcmlkaWVtU3dpdGNoZXIuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLW1pbGl0YXJ5LXRpbWUnKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKHRoaXMubWVyaWRpZW1Td2l0Y2hlcik7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmhvdXJIYW5kID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLWhvdXItaGFuZCcpO1xuICAgICAgICB0aGlzLnRpbWVEcmFnQXJtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpbWUtZHJhZy1hcm0nKTtcbiAgICAgICAgdGhpcy50aW1lRHJhZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS10aW1lLWRyYWcnKTtcbiAgICAgICAgdGhpcy50aW1lRHJhZy5jbGFzc0xpc3QuYWRkKCdkYXRpdW0taG91ci1kcmFnJyk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnRpbWVEcmFnLnNldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnLCBkYXRlLnRvSVNPU3RyaW5nKCkpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy50aW1lRHJhZ0FybS5hcHBlbmRDaGlsZCh0aGlzLnRpbWVEcmFnKTtcbiAgICAgICAgdGhpcy5waWNrZXIuYXBwZW5kQ2hpbGQodGhpcy50aW1lRHJhZ0FybSk7XG4gICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKHRoaXMuaG91ckhhbmQpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5tZXJpZGllbSA9IHZvaWQgMDtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuYXR0YWNoKCk7XG4gICAgICAgIHRoaXMuc2V0U2VsZWN0ZWREYXRlKHRoaXMuc2VsZWN0ZWREYXRlKTtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBtZXJpZGllbVN3aXRjaGVyOkhUTUxFbGVtZW50O1xuICAgIFxuICAgIHByaXZhdGUgbWVyaWRpZW06c3RyaW5nO1xuICAgIHByaXZhdGUgbGFzdExhYmVsRGF0ZTpEYXRlO1xuICAgIHByb3RlY3RlZCB1cGRhdGVMYWJlbHMoZGF0ZTpEYXRlLCBmb3JjZVVwZGF0ZTpib29sZWFuID0gZmFsc2UpIHtcbiAgICAgICAgdGhpcy5sYXN0TGFiZWxEYXRlID0gZGF0ZTtcbiAgICAgICAgXG4gICAgICAgIGlmICh0aGlzLm1lcmlkaWVtICE9PSB2b2lkIDAgJiZcbiAgICAgICAgICAgICh0aGlzLm1lcmlkaWVtID09PSAnQU0nICYmIGRhdGUuZ2V0SG91cnMoKSA8IDEyKSB8fFxuICAgICAgICAgICAgKHRoaXMubWVyaWRpZW0gPT09ICdQTScgJiYgZGF0ZS5nZXRIb3VycygpID4gMTEpKSB7XG4gICAgICAgICAgICBpZiAoIWZvcmNlVXBkYXRlKSByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRoaXMubWVyaWRpZW0gPSBkYXRlLmdldEhvdXJzKCkgPCAxMiA/ICdBTScgOiAnUE0nO1xuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXMubWVyaWRpZW0gPT09ICdBTScpIHtcbiAgICAgICAgICAgIHRoaXMubWVyaWRpZW1Td2l0Y2hlci5jbGFzc0xpc3QucmVtb3ZlKCdkYXRpdW0tcG0tc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgIHRoaXMubWVyaWRpZW1Td2l0Y2hlci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tYW0tc2VsZWN0ZWQnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubWVyaWRpZW1Td2l0Y2hlci5jbGFzc0xpc3QucmVtb3ZlKCdkYXRpdW0tYW0tc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgIHRoaXMubWVyaWRpZW1Td2l0Y2hlci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tcG0tc2VsZWN0ZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgbGV0IGxhYmVscyA9IHRoaXMucGlja2VyLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRpdW0tY2xvY2stcG9zXScpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxhYmVscy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGV0IGxhYmVsID0gbGFiZWxzLml0ZW0oaSk7XG4gICAgICAgICAgICBsZXQgciA9IE1hdGguUEkqcGFyc2VJbnQobGFiZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tY2xvY2stcG9zJyksIDEwKS82LTMqTWF0aC5QSTtcbiAgICAgICAgICAgIGxldCB0aW1lID0gdGhpcy5yb3RhdGlvblRvVGltZShyKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IGQgPSBuZXcgRGF0ZShsYWJlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpO1xuICAgICAgICAgICAgaWYgKGRhdGUuZ2V0SG91cnMoKSA+IDExKSB7XG4gICAgICAgICAgICAgICAgZC5zZXRIb3Vycyh0aW1lICsgMTIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkLnNldEhvdXJzKHRpbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBsYWJlbC5zZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJywgZC50b0lTT1N0cmluZygpKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5taWxpdGFyeVRpbWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZS5nZXRIb3VycygpID4gMTEpIHRpbWUgKz0gMTI7XG4gICAgICAgICAgICAgICAgbGFiZWwuaW5uZXJIVE1MID0gdGhpcy5wYWQodGltZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICh0aW1lID09PSAwKSB0aW1lID0gMTI7XG4gICAgICAgICAgICAgICAgbGFiZWwuaW5uZXJIVE1MID0gdGltZS50b1N0cmluZygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgdXBkYXRlT3B0aW9ucyhvcHRpb25zOklPcHRpb25zKSB7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMgIT09IHZvaWQgMCAmJiB0aGlzLm9wdGlvbnMubWlsaXRhcnlUaW1lICE9PSBvcHRpb25zLm1pbGl0YXJ5VGltZSkge1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICAgICAgICAgIHRoaXMudXBkYXRlTGFiZWxzKHRoaXMubGFzdExhYmVsRGF0ZSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICAgICAgXG4gICAgICAgIGlmICh0aGlzLm1lcmlkaWVtU3dpdGNoZXIgIT09IHZvaWQgMCkge1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5taWxpdGFyeVRpbWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1lcmlkaWVtU3dpdGNoZXIuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLW1pbGl0YXJ5LXRpbWUnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tZXJpZGllbVN3aXRjaGVyLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1taWxpdGFyeS10aW1lJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcHVibGljIGdldExldmVsKCkge1xuICAgICAgICByZXR1cm4gTGV2ZWwuSE9VUjtcbiAgICB9XG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIlRpbWVQaWNrZXIudHNcIiAvPlxuXG5jbGFzcyBNaW51dGVQaWNrZXIgZXh0ZW5kcyBUaW1lUGlja2VyIGltcGxlbWVudHMgSVRpbWVQaWNrZXIge1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6SFRNTEVsZW1lbnQsIGNvbnRhaW5lcjpIVE1MRWxlbWVudCkge1xuICAgICAgICBzdXBlcihlbGVtZW50LCBjb250YWluZXIpO1xuICAgICAgICBcbiAgICAgICAgbGlzdGVuLmRyYWcoY29udGFpbmVyLCAnLmRhdGl1bS1taW51dGUtZHJhZycsIHtcbiAgICAgICAgICAgIGRyYWdTdGFydDogKGUpID0+IHRoaXMuZHJhZ1N0YXJ0KGUpLFxuICAgICAgICAgICAgZHJhZ01vdmU6IChlKSA9PiB0aGlzLmRyYWdNb3ZlKGUpLFxuICAgICAgICAgICAgZHJhZ0VuZDogKGUpID0+IHRoaXMuZHJhZ0VuZChlKSwgXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgbGlzdGVuLnRhcChjb250YWluZXIsICcuZGF0aXVtLW1pbnV0ZS1lbGVtZW50JywgKGUpID0+IHtcbiAgICAgICAgICAgIGxldCBlbDpFbGVtZW50ID0gPEVsZW1lbnQ+ZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0cmlnZ2VyLnpvb21Jbih0aGlzLmVsZW1lbnQsIHtcbiAgICAgICAgICAgICAgICBkYXRlOiB0aGlzLmdldEVsZW1lbnREYXRlKGVsKSxcbiAgICAgICAgICAgICAgICBjdXJyZW50TGV2ZWw6IExldmVsLk1JTlVURVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgbGlzdGVuLmRvd24oY29udGFpbmVyLCAnLmRhdGl1bS1taW51dGUtZWxlbWVudCcsIChlKSA9PiB7XG4gICAgICAgICAgICBsZXQgZWw6SFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+KGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudCk7XG4gICAgICAgICAgICBsZXQgbWludXRlcyA9IG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSkuZ2V0TWludXRlcygpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgb2Zmc2V0ID0gdGhpcy5nZXRPZmZzZXQoZWwpO1xuICAgICAgICAgICAgdHJpZ2dlci5vcGVuQnViYmxlKGVsZW1lbnQsIHtcbiAgICAgICAgICAgICAgICB4OiBvZmZzZXQueCArIDI1LFxuICAgICAgICAgICAgICAgIHk6IG9mZnNldC55ICsgMyxcbiAgICAgICAgICAgICAgICB0ZXh0OiB0aGlzLmdldEJ1YmJsZVRleHQobWludXRlcylcbiAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBwcm90ZWN0ZWQgZ2V0QnViYmxlVGV4dChtaW51dGVzPzpudW1iZXIpIHtcbiAgICAgICAgaWYgKG1pbnV0ZXMgPT09IHZvaWQgMCkge1xuICAgICAgICAgICAgbWludXRlcyA9IHRoaXMucm90YXRpb25Ub1RpbWUodGhpcy5yb3RhdGlvbik7IFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnBhZChtaW51dGVzKSsnbSc7XG4gICAgfVxuICAgIFxuICAgIHByb3RlY3RlZCBnZXRFbGVtZW50RGF0ZShlbDpFbGVtZW50KSB7XG4gICAgICAgIGxldCBkID0gbmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKTtcbiAgICAgICAgbGV0IHllYXIgPSBkLmdldEZ1bGxZZWFyKCk7XG4gICAgICAgIGxldCBtb250aCA9IGQuZ2V0TW9udGgoKTtcbiAgICAgICAgbGV0IGRhdGVPZk1vbnRoID0gZC5nZXREYXRlKCk7XG4gICAgICAgIGxldCBob3VycyA9IGQuZ2V0SG91cnMoKTtcbiAgICAgICAgbGV0IG1pbnV0ZXMgPSBkLmdldE1pbnV0ZXMoKTtcbiAgICAgICAgXG4gICAgICAgIGxldCBuZXdEYXRlID0gbmV3IERhdGUodGhpcy5zZWxlY3RlZERhdGUudmFsdWVPZigpKTtcbiAgICAgICAgbmV3RGF0ZS5zZXRGdWxsWWVhcih5ZWFyKTtcbiAgICAgICAgbmV3RGF0ZS5zZXRNb250aChtb250aCk7XG4gICAgICAgIGlmIChuZXdEYXRlLmdldE1vbnRoKCkgIT09IG1vbnRoKSB7XG4gICAgICAgICAgICBuZXdEYXRlLnNldERhdGUoMCk7XG4gICAgICAgIH1cbiAgICAgICAgbmV3RGF0ZS5zZXREYXRlKGRhdGVPZk1vbnRoKTtcbiAgICAgICAgbmV3RGF0ZS5zZXRIb3Vycyhob3Vycyk7XG4gICAgICAgIG5ld0RhdGUuc2V0TWludXRlcyhtaW51dGVzKTtcbiAgICAgICAgcmV0dXJuIG5ld0RhdGU7XG4gICAgfVxuICAgIFxuICAgIHByb3RlY3RlZCByb3RhdGlvblRvVGltZShyOm51bWJlcikge1xuICAgICAgICB3aGlsZSAociA+IE1hdGguUEkpIHIgLT0gMipNYXRoLlBJO1xuICAgICAgICB3aGlsZSAociA8IC1NYXRoLlBJKSByICs9IDIqTWF0aC5QSTtcbiAgICAgICAgbGV0IHQgPSAociAvIE1hdGguUEkgKiAzMCkgKyAzMDtcbiAgICAgICAgcmV0dXJuIHQgPj0gNTkuNSA/IDAgOiBNYXRoLnJvdW5kKHQpO1xuICAgIH1cbiAgICBcbiAgICBwcm90ZWN0ZWQgdGltZVRvUm90YXRpb24odDpudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubm9ybWFsaXplUm90YXRpb24oKHQgKyAzMCkgLyAzMCAqIE1hdGguUEkpO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgY3JlYXRlKGRhdGU6RGF0ZSwgdHJhbnNpdGlvbjpUcmFuc2l0aW9uKSB7XG4gICAgICAgIHRoaXMubWluID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIGRhdGUuZ2V0RGF0ZSgpLCBkYXRlLmdldEhvdXJzKCkpO1xuICAgICAgICB0aGlzLm1heCA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCBkYXRlLmdldERhdGUoKSwgZGF0ZS5nZXRIb3VycygpICsgMSk7XG4gICAgICAgIFxuICAgICAgICBsZXQgaXRlcmF0b3IgPSBuZXcgRGF0ZSh0aGlzLm1pbi52YWx1ZU9mKCkpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5waWNrZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tcGlja2VyJyk7XG4gICAgICAgIHRoaXMucGlja2VyLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1taW51dGUtcGlja2VyJyk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnRyYW5zaXRpb25Jbih0cmFuc2l0aW9uLCB0aGlzLnBpY2tlcik7XG4gICAgICAgIFxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEyOyBpKyspIHtcbiAgICAgICAgICAgIGxldCB0aWNrID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpY2snKTtcbiAgICAgICAgICAgIGxldCB0aWNrTGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tdGljay1sYWJlbCcpO1xuICAgICAgICAgICAgdGlja0xhYmVsLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1taW51dGUtZWxlbWVudCcpO1xuICAgICAgICAgICAgbGV0IHRpY2tMYWJlbENvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS10aWNrLWxhYmVsLWNvbnRhaW5lcicpO1xuICAgICAgICAgICAgbGV0IHIgPSBpICogTWF0aC5QSS82ICsgTWF0aC5QSTtcbiAgICAgICAgICAgIHRpY2tMYWJlbENvbnRhaW5lci5hcHBlbmRDaGlsZCh0aWNrTGFiZWwpO1xuICAgICAgICAgICAgdGljay5hcHBlbmRDaGlsZCh0aWNrTGFiZWxDb250YWluZXIpO1xuICAgICAgICAgICAgdGljay5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlKCR7cn1yYWQpYDtcbiAgICAgICAgICAgIHRpY2tMYWJlbENvbnRhaW5lci5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlKCR7MipNYXRoLlBJIC0gcn1yYWQpYDtcbiAgICAgICAgICAgIHRpY2tMYWJlbC5zZXRBdHRyaWJ1dGUoJ2RhdGl1bS1jbG9jay1wb3MnLCBpLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgZCA9IG5ldyBEYXRlKGRhdGUudmFsdWVPZigpKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IG1pbnV0ZXMgPSB0aGlzLnJvdGF0aW9uVG9UaW1lKHIpO1xuICAgICAgICAgICAgZC5zZXRNaW51dGVzKG1pbnV0ZXMpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aWNrTGFiZWwuc2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScsIGQudG9JU09TdHJpbmcoKSk7XG4gICAgICAgICAgICB0aGlzLnBpY2tlci5hcHBlbmRDaGlsZCh0aWNrKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpcy5taW51dGVIYW5kID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLW1pbnV0ZS1oYW5kJyk7XG4gICAgICAgIHRoaXMuaG91ckhhbmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0taG91ci1oYW5kJyk7XG4gICAgICAgIHRoaXMudGltZURyYWdBcm0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tdGltZS1kcmFnLWFybScpO1xuICAgICAgICB0aGlzLnRpbWVEcmFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpbWUtZHJhZycpO1xuICAgICAgICB0aGlzLnRpbWVEcmFnLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1taW51dGUtZHJhZycpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy50aW1lRHJhZy5zZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJywgZGF0ZS50b0lTT1N0cmluZygpKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMudGltZURyYWdBcm0uYXBwZW5kQ2hpbGQodGhpcy50aW1lRHJhZyk7XG4gICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKHRoaXMudGltZURyYWdBcm0pO1xuICAgICAgICB0aGlzLnBpY2tlci5hcHBlbmRDaGlsZCh0aGlzLmhvdXJIYW5kKTtcbiAgICAgICAgdGhpcy5waWNrZXIuYXBwZW5kQ2hpbGQodGhpcy5taW51dGVIYW5kKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuYXR0YWNoKCk7XG4gICAgICAgIHRoaXMuc2V0U2VsZWN0ZWREYXRlKHRoaXMuc2VsZWN0ZWREYXRlKTtcbiAgICB9XG4gICAgXG4gICAgcHJvdGVjdGVkIHVwZGF0ZUxhYmVscyhkYXRlOkRhdGUsIGZvcmNlVXBkYXRlOmJvb2xlYW4gPSBmYWxzZSkge1xuICAgICAgICBcbiAgICAgICAgbGV0IGxhYmVscyA9IHRoaXMucGlja2VyLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRpdW0tY2xvY2stcG9zXScpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxhYmVscy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGV0IGxhYmVsID0gbGFiZWxzLml0ZW0oaSk7XG4gICAgICAgICAgICBsZXQgciA9IE1hdGguUEkqcGFyc2VJbnQobGFiZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tY2xvY2stcG9zJyksIDEwKS82LTMqTWF0aC5QSTtcbiAgICAgICAgICAgIGxldCB0aW1lID0gdGhpcy5yb3RhdGlvblRvVGltZShyKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IGQgPSBuZXcgRGF0ZShsYWJlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsYWJlbC5zZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJywgZC50b0lTT1N0cmluZygpKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbGFiZWwuaW5uZXJIVE1MID0gdGhpcy5wYWQodGltZSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyB1cGRhdGVPcHRpb25zKG9wdGlvbnM6SU9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB9XG4gICAgXG4gICAgcHVibGljIGdldExldmVsKCkge1xuICAgICAgICByZXR1cm4gTGV2ZWwuTUlOVVRFO1xuICAgIH1cbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiUGlja2VyLnRzXCIgLz5cblxuY2xhc3MgTW9udGhQaWNrZXIgZXh0ZW5kcyBQaWNrZXIgaW1wbGVtZW50cyBJUGlja2VyIHtcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OkhUTUxFbGVtZW50LCBjb250YWluZXI6SFRNTEVsZW1lbnQpIHtcbiAgICAgICAgc3VwZXIoZWxlbWVudCwgY29udGFpbmVyKTtcbiAgICAgICAgXG4gICAgICAgIGxpc3Rlbi50YXAoY29udGFpbmVyLCAnZGF0aXVtLW1vbnRoLWVsZW1lbnRbZGF0aXVtLWRhdGFdJywgKGUpID0+IHtcbiAgICAgICAgICAgbGV0IGVsOkVsZW1lbnQgPSA8RWxlbWVudD5lLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XG4gICAgICAgICAgIGxldCB5ZWFyID0gbmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKS5nZXRGdWxsWWVhcigpO1xuICAgICAgICAgICBsZXQgbW9udGggPSBuZXcgRGF0ZShlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpLmdldE1vbnRoKCk7XG4gICAgICAgICAgIFxuICAgICAgICAgICBsZXQgZGF0ZSA9IG5ldyBEYXRlKHRoaXMuc2VsZWN0ZWREYXRlLnZhbHVlT2YoKSk7XG4gICAgICAgICAgIGRhdGUuc2V0RnVsbFllYXIoeWVhcik7XG4gICAgICAgICAgIGRhdGUuc2V0TW9udGgobW9udGgpO1xuICAgICAgICAgICBpZiAoZGF0ZS5nZXRNb250aCgpICE9PSBtb250aCkge1xuICAgICAgICAgICAgICAgZGF0ZS5zZXREYXRlKDApO1xuICAgICAgICAgICB9XG4gICAgICAgICAgIFxuICAgICAgICAgICB0cmlnZ2VyLnpvb21JbihlbGVtZW50LCB7XG4gICAgICAgICAgICAgICBkYXRlOiBkYXRlLFxuICAgICAgICAgICAgICAgY3VycmVudExldmVsOiBMZXZlbC5NT05USFxuICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBsaXN0ZW4uZG93bihjb250YWluZXIsICdkYXRpdW0tbW9udGgtZWxlbWVudCcsIChlKSA9PiB7XG4gICAgICAgICAgICBsZXQgZWw6SFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+KGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudCk7XG4gICAgICAgICAgICBsZXQgdGV4dCA9IHRoaXMuZ2V0U2hvcnRNb250aHMoKVtuZXcgRGF0ZShlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpLmdldE1vbnRoKCldO1xuICAgICAgICAgICAgbGV0IG9mZnNldCA9IHRoaXMuZ2V0T2Zmc2V0KGVsKTtcbiAgICAgICAgICAgIHRyaWdnZXIub3BlbkJ1YmJsZShlbGVtZW50LCB7XG4gICAgICAgICAgICAgICAgeDogb2Zmc2V0LnggKyAzNSxcbiAgICAgICAgICAgICAgICB5OiBvZmZzZXQueSArIDE1LFxuICAgICAgICAgICAgICAgIHRleHQ6IHRleHRcbiAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgY3JlYXRlKGRhdGU6RGF0ZSwgdHJhbnNpdGlvbjpUcmFuc2l0aW9uKSB7XG4gICAgICAgIHRoaXMubWluID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCAwKTtcbiAgICAgICAgdGhpcy5tYXggPSBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCkgKyAxLCAwKTtcbiAgICAgICAgXG4gICAgICAgIGxldCBpdGVyYXRvciA9IG5ldyBEYXRlKHRoaXMubWluLnZhbHVlT2YoKSk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnBpY2tlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1waWNrZXInKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbkluKHRyYW5zaXRpb24sIHRoaXMucGlja2VyKTtcbiAgICAgICAgXG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIGxldCBtb250aEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tbW9udGgtZWxlbWVudCcpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBtb250aEVsZW1lbnQuaW5uZXJIVE1MID0gdGhpcy5nZXRTaG9ydE1vbnRocygpW2l0ZXJhdG9yLmdldE1vbnRoKCldO1xuICAgICAgICAgICAgbW9udGhFbGVtZW50LnNldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnLCBpdGVyYXRvci50b0lTT1N0cmluZygpKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5waWNrZXIuYXBwZW5kQ2hpbGQobW9udGhFbGVtZW50KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaXRlcmF0b3Iuc2V0TW9udGgoaXRlcmF0b3IuZ2V0TW9udGgoKSArIDEpO1xuICAgICAgICB9IHdoaWxlIChpdGVyYXRvci52YWx1ZU9mKCkgPCB0aGlzLm1heC52YWx1ZU9mKCkpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5hdHRhY2goKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuc2V0U2VsZWN0ZWREYXRlKHRoaXMuc2VsZWN0ZWREYXRlKTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHNldFNlbGVjdGVkRGF0ZShzZWxlY3RlZERhdGU6RGF0ZSkge1xuICAgICAgICB0aGlzLnNlbGVjdGVkRGF0ZSA9IG5ldyBEYXRlKHNlbGVjdGVkRGF0ZS52YWx1ZU9mKCkpO1xuICAgICAgICBcbiAgICAgICAgbGV0IG1vbnRoRWxlbWVudHMgPSB0aGlzLnBpY2tlckNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCdkYXRpdW0tbW9udGgtZWxlbWVudCcpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1vbnRoRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBlbCA9IG1vbnRoRWxlbWVudHMuaXRlbShpKTtcbiAgICAgICAgICAgIGxldCBkYXRlID0gbmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKTtcbiAgICAgICAgICAgIGlmIChkYXRlLmdldEZ1bGxZZWFyKCkgPT09IHNlbGVjdGVkRGF0ZS5nZXRGdWxsWWVhcigpICYmXG4gICAgICAgICAgICAgICAgZGF0ZS5nZXRNb250aCgpID09PSBzZWxlY3RlZERhdGUuZ2V0TW9udGgoKSkge1xuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1zZWxlY3RlZCcpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdkYXRpdW0tc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgZ2V0SGVpZ2h0KCkge1xuICAgICAgICByZXR1cm4gMTgwO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XG4gICAgICAgIHJldHVybiBMZXZlbC5NT05USDtcbiAgICB9XG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIlRpbWVQaWNrZXIudHNcIiAvPlxuXG5jbGFzcyBTZWNvbmRQaWNrZXIgZXh0ZW5kcyBUaW1lUGlja2VyIGltcGxlbWVudHMgSVRpbWVQaWNrZXIge1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6SFRNTEVsZW1lbnQsIGNvbnRhaW5lcjpIVE1MRWxlbWVudCkge1xuICAgICAgICBzdXBlcihlbGVtZW50LCBjb250YWluZXIpO1xuICAgICAgICBcbiAgICAgICAgbGlzdGVuLmRyYWcoY29udGFpbmVyLCAnLmRhdGl1bS1zZWNvbmQtZHJhZycsIHtcbiAgICAgICAgICAgIGRyYWdTdGFydDogKGUpID0+IHRoaXMuZHJhZ1N0YXJ0KGUpLFxuICAgICAgICAgICAgZHJhZ01vdmU6IChlKSA9PiB0aGlzLmRyYWdNb3ZlKGUpLFxuICAgICAgICAgICAgZHJhZ0VuZDogKGUpID0+IHRoaXMuZHJhZ0VuZChlKSwgXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgbGlzdGVuLnRhcChjb250YWluZXIsICcuZGF0aXVtLXNlY29uZC1lbGVtZW50JywgKGUpID0+IHtcbiAgICAgICAgICAgIGxldCBlbDpFbGVtZW50ID0gPEVsZW1lbnQ+ZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0cmlnZ2VyLnpvb21Jbih0aGlzLmVsZW1lbnQsIHtcbiAgICAgICAgICAgICAgICBkYXRlOiB0aGlzLmdldEVsZW1lbnREYXRlKGVsKSxcbiAgICAgICAgICAgICAgICBjdXJyZW50TGV2ZWw6IExldmVsLlNFQ09ORFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgbGlzdGVuLmRvd24oY29udGFpbmVyLCAnLmRhdGl1bS1zZWNvbmQtZWxlbWVudCcsIChlKSA9PiB7XG4gICAgICAgICAgICBsZXQgZWw6SFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+KGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudCk7XG4gICAgICAgICAgICBsZXQgc2Vjb25kcyA9IG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSkuZ2V0U2Vjb25kcygpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgb2Zmc2V0ID0gdGhpcy5nZXRPZmZzZXQoZWwpO1xuICAgICAgICAgICAgdHJpZ2dlci5vcGVuQnViYmxlKGVsZW1lbnQsIHtcbiAgICAgICAgICAgICAgICB4OiBvZmZzZXQueCArIDI1LFxuICAgICAgICAgICAgICAgIHk6IG9mZnNldC55ICsgMyxcbiAgICAgICAgICAgICAgICB0ZXh0OiB0aGlzLmdldEJ1YmJsZVRleHQoc2Vjb25kcylcbiAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBwcm90ZWN0ZWQgZ2V0QnViYmxlVGV4dChzZWNvbmRzPzpudW1iZXIpIHtcbiAgICAgICAgaWYgKHNlY29uZHMgPT09IHZvaWQgMCkge1xuICAgICAgICAgICAgc2Vjb25kcyA9IHRoaXMucm90YXRpb25Ub1RpbWUodGhpcy5yb3RhdGlvbik7IFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnBhZChzZWNvbmRzKSsncyc7XG4gICAgfVxuICAgIFxuICAgIHByb3RlY3RlZCBnZXRFbGVtZW50RGF0ZShlbDpFbGVtZW50KSB7XG4gICAgICAgIGxldCBkID0gbmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKTtcbiAgICAgICAgbGV0IHllYXIgPSBkLmdldEZ1bGxZZWFyKCk7XG4gICAgICAgIGxldCBtb250aCA9IGQuZ2V0TW9udGgoKTtcbiAgICAgICAgbGV0IGRhdGVPZk1vbnRoID0gZC5nZXREYXRlKCk7XG4gICAgICAgIGxldCBob3VycyA9IGQuZ2V0SG91cnMoKTtcbiAgICAgICAgbGV0IG1pbnV0ZXMgPSBkLmdldE1pbnV0ZXMoKTtcbiAgICAgICAgbGV0IHNlY29uZHMgPSBkLmdldFNlY29uZHMoKTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBsZXQgbmV3RGF0ZSA9IG5ldyBEYXRlKHRoaXMuc2VsZWN0ZWREYXRlLnZhbHVlT2YoKSk7XG4gICAgICAgIG5ld0RhdGUuc2V0RnVsbFllYXIoeWVhcik7XG4gICAgICAgIG5ld0RhdGUuc2V0TW9udGgobW9udGgpO1xuICAgICAgICBpZiAobmV3RGF0ZS5nZXRNb250aCgpICE9PSBtb250aCkge1xuICAgICAgICAgICAgbmV3RGF0ZS5zZXREYXRlKDApO1xuICAgICAgICB9XG4gICAgICAgIG5ld0RhdGUuc2V0RGF0ZShkYXRlT2ZNb250aCk7XG4gICAgICAgIG5ld0RhdGUuc2V0SG91cnMoaG91cnMpO1xuICAgICAgICBuZXdEYXRlLnNldE1pbnV0ZXMobWludXRlcyk7XG4gICAgICAgIG5ld0RhdGUuc2V0U2Vjb25kcyhzZWNvbmRzKTtcbiAgICAgICAgcmV0dXJuIG5ld0RhdGU7XG4gICAgfVxuICAgIFxuICAgIHByb3RlY3RlZCByb3RhdGlvblRvVGltZShyOm51bWJlcikge1xuICAgICAgICB3aGlsZSAociA+IE1hdGguUEkpIHIgLT0gMipNYXRoLlBJO1xuICAgICAgICB3aGlsZSAociA8IC1NYXRoLlBJKSByICs9IDIqTWF0aC5QSTtcbiAgICAgICAgbGV0IHQgPSAociAvIE1hdGguUEkgKiAzMCkgKyAzMDtcbiAgICAgICAgcmV0dXJuIHQgPj0gNTkuNSA/IDAgOiBNYXRoLnJvdW5kKHQpO1xuICAgIH1cbiAgICBcbiAgICBwcm90ZWN0ZWQgdGltZVRvUm90YXRpb24odDpudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubm9ybWFsaXplUm90YXRpb24oKHQgKyAzMCkgLyAzMCAqIE1hdGguUEkpO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgY3JlYXRlKGRhdGU6RGF0ZSwgdHJhbnNpdGlvbjpUcmFuc2l0aW9uKSB7XG4gICAgICAgIHRoaXMubWluID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIGRhdGUuZ2V0RGF0ZSgpLCBkYXRlLmdldEhvdXJzKCksIGRhdGUuZ2V0TWludXRlcygpKTtcbiAgICAgICAgdGhpcy5tYXggPSBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSwgZGF0ZS5nZXREYXRlKCksIGRhdGUuZ2V0SG91cnMoKSwgZGF0ZS5nZXRNaW51dGVzKCkgKyAxKTtcbiAgICAgICAgXG4gICAgICAgIGxldCBpdGVyYXRvciA9IG5ldyBEYXRlKHRoaXMubWluLnZhbHVlT2YoKSk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnBpY2tlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1waWNrZXInKTtcbiAgICAgICAgdGhpcy5waWNrZXIuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLXNlY29uZC1waWNrZXInKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbkluKHRyYW5zaXRpb24sIHRoaXMucGlja2VyKTtcbiAgICAgICAgXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTI7IGkrKykge1xuICAgICAgICAgICAgbGV0IHRpY2sgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tdGljaycpO1xuICAgICAgICAgICAgbGV0IHRpY2tMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS10aWNrLWxhYmVsJyk7XG4gICAgICAgICAgICB0aWNrTGFiZWwuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLXNlY29uZC1lbGVtZW50Jyk7XG4gICAgICAgICAgICBsZXQgdGlja0xhYmVsQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpY2stbGFiZWwtY29udGFpbmVyJyk7XG4gICAgICAgICAgICBsZXQgciA9IGkgKiBNYXRoLlBJLzYgKyBNYXRoLlBJO1xuICAgICAgICAgICAgdGlja0xhYmVsQ29udGFpbmVyLmFwcGVuZENoaWxkKHRpY2tMYWJlbCk7XG4gICAgICAgICAgICB0aWNrLmFwcGVuZENoaWxkKHRpY2tMYWJlbENvbnRhaW5lcik7XG4gICAgICAgICAgICB0aWNrLnN0eWxlLnRyYW5zZm9ybSA9IGByb3RhdGUoJHtyfXJhZClgO1xuICAgICAgICAgICAgdGlja0xhYmVsQ29udGFpbmVyLnN0eWxlLnRyYW5zZm9ybSA9IGByb3RhdGUoJHsyKk1hdGguUEkgLSByfXJhZClgO1xuICAgICAgICAgICAgdGlja0xhYmVsLnNldEF0dHJpYnV0ZSgnZGF0aXVtLWNsb2NrLXBvcycsIGkudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxldCBkID0gbmV3IERhdGUoZGF0ZS52YWx1ZU9mKCkpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgc2Vjb25kcyA9IHRoaXMucm90YXRpb25Ub1RpbWUocik7XG4gICAgICAgICAgICBkLnNldFNlY29uZHMoc2Vjb25kcyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRpY2tMYWJlbC5zZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJywgZC50b0lTT1N0cmluZygpKTtcbiAgICAgICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKHRpY2spO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0aGlzLnNlY29uZEhhbmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tc2Vjb25kLWhhbmQnKTtcbiAgICAgICAgdGhpcy5taW51dGVIYW5kID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLW1pbnV0ZS1oYW5kJyk7XG4gICAgICAgIHRoaXMuaG91ckhhbmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0taG91ci1oYW5kJyk7XG4gICAgICAgIHRoaXMudGltZURyYWdBcm0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tdGltZS1kcmFnLWFybScpO1xuICAgICAgICB0aGlzLnRpbWVEcmFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpbWUtZHJhZycpO1xuICAgICAgICB0aGlzLnRpbWVEcmFnLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1zZWNvbmQtZHJhZycpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy50aW1lRHJhZy5zZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJywgZGF0ZS50b0lTT1N0cmluZygpKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMudGltZURyYWdBcm0uYXBwZW5kQ2hpbGQodGhpcy50aW1lRHJhZyk7XG4gICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKHRoaXMudGltZURyYWdBcm0pO1xuICAgICAgICB0aGlzLnBpY2tlci5hcHBlbmRDaGlsZCh0aGlzLmhvdXJIYW5kKTtcbiAgICAgICAgdGhpcy5waWNrZXIuYXBwZW5kQ2hpbGQodGhpcy5taW51dGVIYW5kKTtcbiAgICAgICAgdGhpcy5waWNrZXIuYXBwZW5kQ2hpbGQodGhpcy5zZWNvbmRIYW5kKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuYXR0YWNoKCk7XG4gICAgICAgIHRoaXMuc2V0U2VsZWN0ZWREYXRlKHRoaXMuc2VsZWN0ZWREYXRlKTtcbiAgICB9XG4gICAgXG4gICAgcHJvdGVjdGVkIHVwZGF0ZUxhYmVscyhkYXRlOkRhdGUsIGZvcmNlVXBkYXRlOmJvb2xlYW4gPSBmYWxzZSkge1xuICAgICAgICBcbiAgICAgICAgbGV0IGxhYmVscyA9IHRoaXMucGlja2VyLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRpdW0tY2xvY2stcG9zXScpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxhYmVscy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGV0IGxhYmVsID0gbGFiZWxzLml0ZW0oaSk7XG4gICAgICAgICAgICBsZXQgciA9IE1hdGguUEkqcGFyc2VJbnQobGFiZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tY2xvY2stcG9zJyksIDEwKS82LTMqTWF0aC5QSTtcbiAgICAgICAgICAgIGxldCB0aW1lID0gdGhpcy5yb3RhdGlvblRvVGltZShyKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IGQgPSBuZXcgRGF0ZShsYWJlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsYWJlbC5zZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJywgZC50b0lTT1N0cmluZygpKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbGFiZWwuaW5uZXJIVE1MID0gdGhpcy5wYWQodGltZSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyB1cGRhdGVPcHRpb25zKG9wdGlvbnM6SU9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB9XG4gICAgXG4gICAgcHVibGljIGdldExldmVsKCkge1xuICAgICAgICByZXR1cm4gTGV2ZWwuU0VDT05EO1xuICAgIH1cbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiUGlja2VyLnRzXCIgLz5cblxuY2xhc3MgWWVhclBpY2tlciBleHRlbmRzIFBpY2tlciBpbXBsZW1lbnRzIElQaWNrZXIge1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6SFRNTEVsZW1lbnQsIGNvbnRhaW5lcjpIVE1MRWxlbWVudCkge1xuICAgICAgICBzdXBlcihlbGVtZW50LCBjb250YWluZXIpO1xuICAgICAgICBcbiAgICAgICAgbGlzdGVuLnRhcChjb250YWluZXIsICdkYXRpdW0teWVhci1lbGVtZW50W2RhdGl1bS1kYXRhXScsIChlKSA9PiB7XG4gICAgICAgICAgIGxldCBlbDpFbGVtZW50ID0gPEVsZW1lbnQ+ZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xuICAgICAgICAgICBsZXQgeWVhciA9IG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSkuZ2V0RnVsbFllYXIoKTtcbiAgICAgICAgICAgXG4gICAgICAgICAgIGxldCBkYXRlID0gbmV3IERhdGUodGhpcy5zZWxlY3RlZERhdGUudmFsdWVPZigpKTtcbiAgICAgICAgICAgZGF0ZS5zZXRGdWxsWWVhcih5ZWFyKTtcbiAgICAgICAgICAgXG4gICAgICAgICAgIHRyaWdnZXIuem9vbUluKGVsZW1lbnQsIHtcbiAgICAgICAgICAgICAgIGRhdGU6IGRhdGUsXG4gICAgICAgICAgICAgICBjdXJyZW50TGV2ZWw6IExldmVsLllFQVJcbiAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBsaXN0ZW4uZG93bihjb250YWluZXIsICdkYXRpdW0teWVhci1lbGVtZW50JywgKGUpID0+IHtcbiAgICAgICAgICAgIGxldCBlbDpIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD4oZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50KTtcbiAgICAgICAgICAgIGxldCB0ZXh0ID0gbmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKS5nZXRGdWxsWWVhcigpLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICBsZXQgb2Zmc2V0ID0gdGhpcy5nZXRPZmZzZXQoZWwpO1xuICAgICAgICAgICAgdHJpZ2dlci5vcGVuQnViYmxlKGVsZW1lbnQsIHtcbiAgICAgICAgICAgICAgICB4OiBvZmZzZXQueCArIDM1LFxuICAgICAgICAgICAgICAgIHk6IG9mZnNldC55ICsgMTUsXG4gICAgICAgICAgICAgICAgdGV4dDogdGV4dFxuICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBjcmVhdGUoZGF0ZTpEYXRlLCB0cmFuc2l0aW9uOlRyYW5zaXRpb24pIHtcbiAgICAgICAgdGhpcy5taW4gPSBuZXcgRGF0ZShNYXRoLmZsb29yKGRhdGUuZ2V0RnVsbFllYXIoKS8xMCkqMTAsIDApO1xuICAgICAgICB0aGlzLm1heCA9IG5ldyBEYXRlKE1hdGguY2VpbChkYXRlLmdldEZ1bGxZZWFyKCkvMTApKjEwLCAwKTtcbiAgICAgICAgXG4gICAgICAgIGlmICh0aGlzLm1pbi52YWx1ZU9mKCkgPT09IHRoaXMubWF4LnZhbHVlT2YoKSkge1xuICAgICAgICAgICAgdGhpcy5tYXguc2V0RnVsbFllYXIodGhpcy5tYXguZ2V0RnVsbFllYXIoKSArIDEwKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgbGV0IGl0ZXJhdG9yID0gbmV3IERhdGUodGhpcy5taW4udmFsdWVPZigpKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMucGlja2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXBpY2tlcicpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uSW4odHJhbnNpdGlvbiwgdGhpcy5waWNrZXIpO1xuICAgICAgICBcbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgbGV0IHllYXJFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXllYXItZWxlbWVudCcpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB5ZWFyRWxlbWVudC5pbm5lckhUTUwgPSBpdGVyYXRvci5nZXRGdWxsWWVhcigpLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICB5ZWFyRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJywgaXRlcmF0b3IudG9JU09TdHJpbmcoKSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKHllYXJFbGVtZW50KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaXRlcmF0b3Iuc2V0RnVsbFllYXIoaXRlcmF0b3IuZ2V0RnVsbFllYXIoKSArIDEpO1xuICAgICAgICB9IHdoaWxlIChpdGVyYXRvci52YWx1ZU9mKCkgPD0gdGhpcy5tYXgudmFsdWVPZigpKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuYXR0YWNoKCk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnNldFNlbGVjdGVkRGF0ZSh0aGlzLnNlbGVjdGVkRGF0ZSk7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBzZXRTZWxlY3RlZERhdGUoc2VsZWN0ZWREYXRlOkRhdGUpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RlZERhdGUgPSBuZXcgRGF0ZShzZWxlY3RlZERhdGUudmFsdWVPZigpKTtcbiAgICAgICAgXG4gICAgICAgIGxldCB5ZWFyRWxlbWVudHMgPSB0aGlzLnBpY2tlckNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCdkYXRpdW0teWVhci1lbGVtZW50Jyk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgeWVhckVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgZWwgPSB5ZWFyRWxlbWVudHMuaXRlbShpKTtcbiAgICAgICAgICAgIGxldCBkYXRlID0gbmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKTtcbiAgICAgICAgICAgIGlmIChkYXRlLmdldEZ1bGxZZWFyKCkgPT09IHNlbGVjdGVkRGF0ZS5nZXRGdWxsWWVhcigpKSB7XG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLXNlbGVjdGVkJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1zZWxlY3RlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBnZXRIZWlnaHQoKSB7XG4gICAgICAgIHJldHVybiAxODA7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcbiAgICAgICAgcmV0dXJuIExldmVsLllFQVI7XG4gICAgfVxufSIsInZhciBjc3M9XCJkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tYnViYmxlLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1oZWFkZXIsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci1jb250YWluZXJ7Ym94LXNoYWRvdzowIDNweCA2cHggcmdiYSgwLDAsMCwuMTYpLDAgM3B4IDZweCByZ2JhKDAsMCwwLC4yMyl9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWhlYWRlci13cmFwcGVye292ZXJmbG93OmhpZGRlbjtwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0Oi03cHg7cmlnaHQ6LTdweDt0b3A6LTdweDtoZWlnaHQ6ODdweDtkaXNwbGF5OmJsb2NrO3BvaW50ZXItZXZlbnRzOm5vbmV9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWhlYWRlcntwb3NpdGlvbjpyZWxhdGl2ZTtkaXNwbGF5OmJsb2NrO292ZXJmbG93OmhpZGRlbjtoZWlnaHQ6MTAwcHg7YmFja2dyb3VuZC1jb2xvcjpfcHJpbWFyeTtib3JkZXItdG9wLWxlZnQtcmFkaXVzOjNweDtib3JkZXItdG9wLXJpZ2h0LXJhZGl1czozcHg7ei1pbmRleDoxO21hcmdpbjo3cHg7d2lkdGg6Y2FsYygxMDAlIC0gMTRweCk7cG9pbnRlci1ldmVudHM6YXV0b31kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc3Bhbi1sYWJlbC1jb250YWluZXJ7cG9zaXRpb246YWJzb2x1dGU7bGVmdDo0MHB4O3JpZ2h0OjQwcHg7dG9wOjA7Ym90dG9tOjA7ZGlzcGxheTpibG9jaztvdmVyZmxvdzpoaWRkZW47dHJhbnNpdGlvbjouMnMgZWFzZSBhbGw7dHJhbnNmb3JtLW9yaWdpbjo0MHB4IDQwcHh9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXNwYW4tbGFiZWx7cG9zaXRpb246YWJzb2x1dGU7Zm9udC1zaXplOjE4cHQ7Y29sb3I6X3ByaW1hcnlfdGV4dDtmb250LXdlaWdodDo3MDA7dHJhbnNmb3JtLW9yaWdpbjowIDA7d2hpdGUtc3BhY2U6bm93cmFwO3RyYW5zaXRpb246YWxsIC4ycyBlYXNlO3RleHQtdHJhbnNmb3JtOnVwcGVyY2FzZX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc3Bhbi1sYWJlbC5kYXRpdW0tdG9we3RyYW5zZm9ybTp0cmFuc2xhdGVZKDE3cHgpIHNjYWxlKC42Nik7d2lkdGg6MTUxJTtvcGFjaXR5Oi42fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS1ib3R0b217dHJhbnNmb3JtOnRyYW5zbGF0ZVkoMzZweCkgc2NhbGUoMSk7d2lkdGg6MTAwJTtvcGFjaXR5OjF9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXNwYW4tbGFiZWwuZGF0aXVtLXRvcC5kYXRpdW0taGlkZGVue3RyYW5zZm9ybTp0cmFuc2xhdGVZKDVweCkgc2NhbGUoLjQpO29wYWNpdHk6MH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc3Bhbi1sYWJlbC5kYXRpdW0tYm90dG9tLmRhdGl1bS1oaWRkZW57dHJhbnNmb3JtOnRyYW5zbGF0ZVkoNzhweCkgc2NhbGUoMS4yKTtvcGFjaXR5OjF9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXNwYW4tbGFiZWw6YWZ0ZXJ7Y29udGVudDonJztkaXNwbGF5OmlubGluZS1ibG9jaztwb3NpdGlvbjphYnNvbHV0ZTttYXJnaW4tbGVmdDoxMHB4O21hcmdpbi10b3A6NnB4O2hlaWdodDoxN3B4O3dpZHRoOjE3cHg7b3BhY2l0eTowO3RyYW5zaXRpb246YWxsIC4ycyBlYXNlO2JhY2tncm91bmQ6dXJsKGRhdGE6aW1hZ2Uvc3ZnK3htbDt1dGY4LCUzQ3N2ZyUyMHhtbG5zJTNEJTIyaHR0cCUzQSUyRiUyRnd3dy53My5vcmclMkYyMDAwJTJGc3ZnJTIyJTNFJTNDZyUyMGZpbGwlM0QlMjJfcHJpbWFyeV90ZXh0JTIyJTNFJTNDcGF0aCUyMGQlM0QlMjJNMTclMjAxNWwtMiUyMDItNS01JTIwMi0yeiUyMiUyMGZpbGwtcnVsZSUzRCUyMmV2ZW5vZGQlMjIlMkYlM0UlM0NwYXRoJTIwZCUzRCUyMk03JTIwMGE3JTIwNyUyMDAlMjAwJTIwMC03JTIwNyUyMDclMjA3JTIwMCUyMDAlMjAwJTIwNyUyMDclMjA3JTIwNyUyMDAlMjAwJTIwMCUyMDctNyUyMDclMjA3JTIwMCUyMDAlMjAwLTctN3ptMCUyMDJhNSUyMDUlMjAwJTIwMCUyMDElMjA1JTIwNSUyMDUlMjA1JTIwMCUyMDAlMjAxLTUlMjA1JTIwNSUyMDUlMjAwJTIwMCUyMDEtNS01JTIwNSUyMDUlMjAwJTIwMCUyMDElMjA1LTV6JTIyJTJGJTNFJTNDcGF0aCUyMGQlM0QlMjJNNCUyMDZoNnYySDR6JTIyJTJGJTNFJTNDJTJGZyUzRSUzQyUyRnN2ZyUzRSl9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWJ1YmJsZSxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tYnViYmxlLmRhdGl1bS1idWJibGUtdmlzaWJsZXt0cmFuc2l0aW9uLXByb3BlcnR5OnRyYW5zZm9ybSxvcGFjaXR5O3RyYW5zaXRpb24tdGltaW5nLWZ1bmN0aW9uOmVhc2U7dHJhbnNpdGlvbi1kdXJhdGlvbjouMnN9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXNwYW4tbGFiZWwuZGF0aXVtLXRvcDphZnRlcntvcGFjaXR5OjF9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXNwYW4tbGFiZWwgZGF0aXVtLXZhcmlhYmxle2NvbG9yOl9wcmltYXJ5O2ZvbnQtc2l6ZToxNHB0O3BhZGRpbmc6MCA0cHg7bWFyZ2luOjAgMnB4O3RvcDotMnB4O3Bvc2l0aW9uOnJlbGF0aXZlfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1zcGFuLWxhYmVsIGRhdGl1bS12YXJpYWJsZTpiZWZvcmV7Y29udGVudDonJztwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjA7dG9wOjA7cmlnaHQ6MDtib3R0b206MDtib3JkZXItcmFkaXVzOjVweDtiYWNrZ3JvdW5kLWNvbG9yOl9wcmltYXJ5X3RleHQ7ei1pbmRleDotMTtvcGFjaXR5Oi43fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1zcGFuLWxhYmVsIGRhdGl1bS1sb3dlcnt0ZXh0LXRyYW5zZm9ybTpsb3dlcmNhc2V9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW5leHQsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXByZXZ7cG9zaXRpb246YWJzb2x1dGU7d2lkdGg6NDBweDt0b3A6MDtib3R0b206MDt0cmFuc2Zvcm0tb3JpZ2luOjIwcHggNTJweH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbmV4dDphZnRlcixkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbmV4dDpiZWZvcmUsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXByZXY6YWZ0ZXIsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXByZXY6YmVmb3Jle2NvbnRlbnQ6Jyc7cG9zaXRpb246YWJzb2x1dGU7ZGlzcGxheTpibG9jazt3aWR0aDozcHg7aGVpZ2h0OjhweDtsZWZ0OjUwJTtiYWNrZ3JvdW5kLWNvbG9yOl9wcmltYXJ5X3RleHQ7dG9wOjQ4cHh9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW5leHQuZGF0aXVtLWFjdGl2ZSxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcHJldi5kYXRpdW0tYWN0aXZle3RyYW5zZm9ybTpzY2FsZSguOSk7b3BhY2l0eTouOX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcHJldntsZWZ0OjB9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXByZXY6YWZ0ZXIsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXByZXY6YmVmb3Jle21hcmdpbi1sZWZ0Oi0zcHh9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW5leHR7cmlnaHQ6MH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcHJldjpiZWZvcmV7dHJhbnNmb3JtOnJvdGF0ZSg0NWRlZykgdHJhbnNsYXRlWSgtMi42cHgpfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1wcmV2OmFmdGVye3RyYW5zZm9ybTpyb3RhdGUoLTQ1ZGVnKSB0cmFuc2xhdGVZKDIuNnB4KX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbmV4dDpiZWZvcmV7dHJhbnNmb3JtOnJvdGF0ZSg0NWRlZykgdHJhbnNsYXRlWSgyLjZweCl9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW5leHQ6YWZ0ZXJ7dHJhbnNmb3JtOnJvdGF0ZSgtNDVkZWcpIHRyYW5zbGF0ZVkoLTIuNnB4KX1kYXRpdW0tY29udGFpbmVyLl9pZHtkaXNwbGF5OmJsb2NrO3Bvc2l0aW9uOmFic29sdXRlO3dpZHRoOjI4MHB4O2ZvbnQtZmFtaWx5OlJvYm90byxBcmlhbDttYXJnaW4tdG9wOjJweDtmb250LXNpemU6MTZweH1kYXRpdW0tY29udGFpbmVyLl9pZCxkYXRpdW0tY29udGFpbmVyLl9pZCAqey13ZWJraXQtdG91Y2gtY2FsbG91dDpub25lOy13ZWJraXQtdXNlci1zZWxlY3Q6bm9uZTsta2h0bWwtdXNlci1zZWxlY3Q6bm9uZTstbW96LXVzZXItc2VsZWN0Om5vbmU7LW1zLXVzZXItc2VsZWN0Om5vbmU7LXdlYmtpdC10YXAtaGlnaGxpZ2h0LWNvbG9yOnRyYW5zcGFyZW50O2N1cnNvcjpkZWZhdWx0fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1idWJibGV7cG9zaXRpb246YWJzb2x1dGU7d2lkdGg6NTBweDtsaW5lLWhlaWdodDoyNnB4O3RleHQtYWxpZ246Y2VudGVyO2ZvbnQtc2l6ZToxNHB4O2JhY2tncm91bmQtY29sb3I6X3NlY29uZGFyeV9hY2NlbnQ7Zm9udC13ZWlnaHQ6NzAwO2JvcmRlci1yYWRpdXM6M3B4O21hcmdpbi1sZWZ0Oi0yNXB4O21hcmdpbi10b3A6LTMycHg7Y29sb3I6X3NlY29uZGFyeTt6LWluZGV4OjE7dHJhbnNmb3JtLW9yaWdpbjozMHB4IDM2cHg7dHJhbnNpdGlvbi1kZWxheTowO3RyYW5zZm9ybTpzY2FsZSguNSk7b3BhY2l0eTowfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1idWJibGU6YWZ0ZXJ7Y29udGVudDonJztwb3NpdGlvbjphYnNvbHV0ZTtkaXNwbGF5OmJsb2NrO3dpZHRoOjEwcHg7aGVpZ2h0OjEwcHg7dHJhbnNmb3JtOnJvdGF0ZSg0NWRlZyk7YmFja2dyb3VuZDpsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLHJnYmEoMCwwLDAsMCkgNTAlLF9zZWNvbmRhcnlfYWNjZW50IDUwJSk7bGVmdDo1MCU7dG9wOjIwcHg7bWFyZ2luLWxlZnQ6LTVweH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tYnViYmxlLmRhdGl1bS1idWJibGUtdmlzaWJsZXt0cmFuc2Zvcm06c2NhbGUoMSk7b3BhY2l0eToxO3RyYW5zaXRpb24tZGVsYXk6LjJzfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXItY29udGFpbmVyLXdyYXBwZXJ7b3ZlcmZsb3c6aGlkZGVuO3Bvc2l0aW9uOmFic29sdXRlO2xlZnQ6LTdweDtyaWdodDotN3B4O3RvcDo4MHB4O2hlaWdodDoyNzBweDtkaXNwbGF5OmJsb2NrO3BvaW50ZXItZXZlbnRzOm5vbmV9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci1jb250YWluZXJ7cG9zaXRpb246cmVsYXRpdmU7d2lkdGg6Y2FsYygxMDAlIC0gMTRweCk7aGVpZ2h0OjI2MHB4O2JhY2tncm91bmQtY29sb3I6X3NlY29uZGFyeTtkaXNwbGF5OmJsb2NrO21hcmdpbjowIDdweCA3cHg7cGFkZGluZy10b3A6MjBweDt0cmFuc2Zvcm06dHJhbnNsYXRlWSgtMjcwcHgpO3BvaW50ZXItZXZlbnRzOmF1dG87Ym9yZGVyLWJvdHRvbS1yaWdodC1yYWRpdXM6M3B4O2JvcmRlci1ib3R0b20tbGVmdC1yYWRpdXM6M3B4O3RyYW5zaXRpb246YWxsIGVhc2UgLjRzO3RyYW5zaXRpb24tZGVsYXk6LjFzO292ZXJmbG93OmhpZGRlbn1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2Vye3Bvc2l0aW9uOmFic29sdXRlO2xlZnQ6MDtyaWdodDowO2JvdHRvbTowO2NvbG9yOl9zZWNvbmRhcnlfdGV4dDt0cmFuc2l0aW9uOmFsbCBlYXNlIC40c31kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1waWNrZXItbGVmdHt0cmFuc2Zvcm06dHJhbnNsYXRlWCgtMTAwJSkgc2NhbGUoMSk7cG9pbnRlci1ldmVudHM6bm9uZTt0cmFuc2l0aW9uLWRlbGF5OjBzfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLXBpY2tlci1yaWdodHt0cmFuc2Zvcm06dHJhbnNsYXRlWCgxMDAlKSBzY2FsZSgxKTtwb2ludGVyLWV2ZW50czpub25lO3RyYW5zaXRpb24tZGVsYXk6MHN9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tcGlja2VyLW91dHt0cmFuc2Zvcm06dHJhbnNsYXRlWCgwKSBzY2FsZSgxLjQpO29wYWNpdHk6MDtwb2ludGVyLWV2ZW50czpub25lO3RyYW5zaXRpb24tZGVsYXk6MHN9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tcGlja2VyLWlue3RyYW5zZm9ybTp0cmFuc2xhdGVYKDApIHNjYWxlKC42KTtvcGFjaXR5OjA7cG9pbnRlci1ldmVudHM6bm9uZTt0cmFuc2l0aW9uLWRlbGF5OjBzfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tb250aC1lbGVtZW50LGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS15ZWFyLWVsZW1lbnR7ZGlzcGxheTppbmxpbmUtYmxvY2s7d2lkdGg6MjUlO2xpbmUtaGVpZ2h0OjYwcHg7dGV4dC1hbGlnbjpjZW50ZXI7cG9zaXRpb246cmVsYXRpdmU7dHJhbnNpdGlvbjouMnMgZWFzZSBhbGx9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1vbnRoLWVsZW1lbnQuZGF0aXVtLXNlbGVjdGVkOmFmdGVyLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS15ZWFyLWVsZW1lbnQuZGF0aXVtLXNlbGVjdGVkOmFmdGVye2NvbnRlbnQ6Jyc7cG9zaXRpb246YWJzb2x1dGU7bGVmdDoyMHB4O3JpZ2h0OjIwcHg7dG9wOjUwJTttYXJnaW4tdG9wOjExcHg7aGVpZ2h0OjJweDtkaXNwbGF5OmJsb2NrO2JhY2tncm91bmQtY29sb3I6X3NlY29uZGFyeV9hY2NlbnR9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1vbnRoLWVsZW1lbnQuZGF0aXVtLWFjdGl2ZSxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0teWVhci1lbGVtZW50LmRhdGl1bS1hY3RpdmV7dHJhbnNmb3JtOnNjYWxlKC45KTt0cmFuc2l0aW9uOm5vbmV9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1vbnRoLWVsZW1lbnQuZGF0aXVtLXNlbGVjdGVkOmFmdGVye2xlZnQ6MjVweDtyaWdodDoyNXB4fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1kYXRlLWhlYWRlcntkaXNwbGF5OmlubGluZS1ibG9jazt3aWR0aDo0MHB4O2xpbmUtaGVpZ2h0OjI4cHg7b3BhY2l0eTouNjtmb250LXdlaWdodDo3MDA7dGV4dC1hbGlnbjpjZW50ZXJ9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWRhdGUtZWxlbWVudHtkaXNwbGF5OmlubGluZS1ibG9jazt3aWR0aDo0MHB4O2xpbmUtaGVpZ2h0OjM2cHg7dGV4dC1hbGlnbjpjZW50ZXI7cG9zaXRpb246cmVsYXRpdmU7dHJhbnNpdGlvbjouMnMgZWFzZSBhbGx9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWRhdGUtZWxlbWVudC5kYXRpdW0tc2VsZWN0ZWQ6YWZ0ZXJ7Y29udGVudDonJztwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjEycHg7cmlnaHQ6MTJweDt0b3A6NTAlO21hcmdpbi10b3A6MTBweDtoZWlnaHQ6MnB4O2Rpc3BsYXk6YmxvY2s7YmFja2dyb3VuZC1jb2xvcjpfc2Vjb25kYXJ5X2FjY2VudH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tZGF0ZS1lbGVtZW50LmRhdGl1bS1hY3RpdmV7dHJhbnNmb3JtOnNjYWxlKC45KTt0cmFuc2l0aW9uOm5vbmV9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWRhdGUtZWxlbWVudDpub3QoW2RhdGl1bS1kYXRhXSl7b3BhY2l0eTouNjtwb2ludGVyLWV2ZW50czpub25lfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLWhvdXItcGlja2VyLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLW1pbnV0ZS1waWNrZXIsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tc2Vjb25kLXBpY2tlcntoZWlnaHQ6MjQwcHh9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0taG91ci1waWNrZXI6YmVmb3JlLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLW1pbnV0ZS1waWNrZXI6YmVmb3JlLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLXNlY29uZC1waWNrZXI6YmVmb3Jle2NvbnRlbnQ6Jyc7d2lkdGg6MTQwcHg7aGVpZ2h0OjE0MHB4O3Bvc2l0aW9uOmFic29sdXRlO2JvcmRlcjoxcHggc29saWQ7bGVmdDo1MCU7dG9wOjUwJTttYXJnaW4tbGVmdDotNzFweDttYXJnaW4tdG9wOi03MXB4O2JvcmRlci1yYWRpdXM6NzBweDtvcGFjaXR5Oi41fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLWhvdXItcGlja2VyOmFmdGVyLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLW1pbnV0ZS1waWNrZXI6YWZ0ZXIsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tc2Vjb25kLXBpY2tlcjphZnRlcntjb250ZW50OicnO3dpZHRoOjRweDtoZWlnaHQ6NHB4O21hcmdpbi1sZWZ0Oi00cHg7bWFyZ2luLXRvcDotNHB4O3RvcDo1MCU7bGVmdDo1MCU7Ym9yZGVyLXJhZGl1czo0cHg7cG9zaXRpb246YWJzb2x1dGU7Ym9yZGVyOjJweCBzb2xpZDtib3JkZXItY29sb3I6X3NlY29uZGFyeV9hY2NlbnQ7YmFja2dyb3VuZC1jb2xvcjpfc2Vjb25kYXJ5O2JveC1zaGFkb3c6MCAwIDAgMnB4IF9zZWNvbmRhcnl9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXRpY2t7cG9zaXRpb246YWJzb2x1dGU7bGVmdDo1MCU7dG9wOjUwJTt3aWR0aDoycHg7aGVpZ2h0OjcwcHg7bWFyZ2luLWxlZnQ6LTFweDt0cmFuc2Zvcm0tb3JpZ2luOjFweCAwfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS10aWNrOmFmdGVye2NvbnRlbnQ6Jyc7cG9zaXRpb246YWJzb2x1dGU7d2lkdGg6MnB4O2hlaWdodDo2cHg7YmFja2dyb3VuZC1jb2xvcjpfc2Vjb25kYXJ5X3RleHQ7Ym90dG9tOi00cHg7b3BhY2l0eTouNX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbWVyaWRpZW0tc3dpdGNoZXJ7cG9zaXRpb246YWJzb2x1dGU7bGVmdDo1MCU7bWFyZ2luLWxlZnQ6LTMwcHg7dG9wOjUwJTttYXJnaW4tdG9wOjE1cHg7ZGlzcGxheTpibG9jazt3aWR0aDo2MHB4O2hlaWdodDo0MHB4fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tZXJpZGllbS1zd2l0Y2hlcjphZnRlcixkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbWVyaWRpZW0tc3dpdGNoZXI6YmVmb3Jle3Bvc2l0aW9uOmFic29sdXRlO3dpZHRoOjMwcHg7dG9wOjA7ZGlzcGxheTpibG9jaztsaW5lLWhlaWdodDo0MHB4O2ZvbnQtd2VpZ2h0OjcwMDt0ZXh0LWFsaWduOmNlbnRlcjtmb250LXNpemU6MTRweDt0cmFuc2Zvcm06c2NhbGUoLjkpO29wYWNpdHk6Ljk7Y29sb3I6X3NlY29uZGFyeV90ZXh0O3RyYW5zaXRpb246YWxsIGVhc2UgLjJzfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tZXJpZGllbS1zd2l0Y2hlci5kYXRpdW0tbWlsaXRhcnktdGltZTpiZWZvcmV7Y29udGVudDonLTEyJ31kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbWVyaWRpZW0tc3dpdGNoZXIuZGF0aXVtLW1pbGl0YXJ5LXRpbWU6YWZ0ZXJ7Y29udGVudDonKzEyJ31kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbWVyaWRpZW0tc3dpdGNoZXI6YmVmb3Jle2NvbnRlbnQ6J0FNJztsZWZ0OjB9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1lcmlkaWVtLXN3aXRjaGVyOmFmdGVye2NvbnRlbnQ6J1BNJztyaWdodDowfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tZXJpZGllbS1zd2l0Y2hlci5kYXRpdW0tYW0tc2VsZWN0ZWQ6YmVmb3JlLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tZXJpZGllbS1zd2l0Y2hlci5kYXRpdW0tcG0tc2VsZWN0ZWQ6YWZ0ZXJ7dHJhbnNmb3JtOnNjYWxlKDEpO2NvbG9yOl9zZWNvbmRhcnlfYWNjZW50O29wYWNpdHk6MX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbWVyaWRpZW0tc3dpdGNoZXIuZGF0aXVtLWFjdGl2ZTphZnRlcixkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbWVyaWRpZW0tc3dpdGNoZXIuZGF0aXVtLWFjdGl2ZTpiZWZvcmV7dHJhbnNpdGlvbjpub25lfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tZXJpZGllbS1zd2l0Y2hlci5kYXRpdW0tYWN0aXZlLmRhdGl1bS1hbS1zZWxlY3RlZDpiZWZvcmV7dHJhbnNmb3JtOnNjYWxlKC45KX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbWVyaWRpZW0tc3dpdGNoZXIuZGF0aXVtLWFjdGl2ZS5kYXRpdW0tYW0tc2VsZWN0ZWQ6YWZ0ZXIsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1lcmlkaWVtLXN3aXRjaGVyLmRhdGl1bS1hY3RpdmUuZGF0aXVtLXBtLXNlbGVjdGVkOmJlZm9yZXt0cmFuc2Zvcm06c2NhbGUoLjgpfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tZXJpZGllbS1zd2l0Y2hlci5kYXRpdW0tYWN0aXZlLmRhdGl1bS1wbS1zZWxlY3RlZDphZnRlcnt0cmFuc2Zvcm06c2NhbGUoLjkpfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS10aWNrLWxhYmVsLWNvbnRhaW5lcntwb3NpdGlvbjphYnNvbHV0ZTtib3R0b206LTUwcHg7bGVmdDotMjRweDtkaXNwbGF5OmJsb2NrO2hlaWdodDo1MHB4O3dpZHRoOjUwcHh9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXRpY2stbGFiZWx7cG9zaXRpb246YWJzb2x1dGU7bGVmdDowO3RvcDowO2Rpc3BsYXk6YmxvY2s7d2lkdGg6MTAwJTtsaW5lLWhlaWdodDo1MHB4O2JvcmRlci1yYWRpdXM6MjVweDt0ZXh0LWFsaWduOmNlbnRlcjtmb250LXNpemU6MTRweDt0cmFuc2l0aW9uOi4ycyBlYXNlIGFsbH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tdGljay1sYWJlbC5kYXRpdW0tYWN0aXZle3RyYW5zZm9ybTpzY2FsZSguOSk7dHJhbnNpdGlvbjpub25lfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLWhvdXItcGlja2VyLmRhdGl1bS1kcmFnZ2luZyBkYXRpdW0taG91ci1oYW5kLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLWhvdXItcGlja2VyLmRhdGl1bS1kcmFnZ2luZyBkYXRpdW0tbWludXRlLWhhbmQsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0taG91ci1waWNrZXIuZGF0aXVtLWRyYWdnaW5nIGRhdGl1bS1zZWNvbmQtaGFuZCxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1ob3VyLXBpY2tlci5kYXRpdW0tZHJhZ2dpbmcgZGF0aXVtLXRpbWUtZHJhZy1hcm0sZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tbWludXRlLXBpY2tlci5kYXRpdW0tZHJhZ2dpbmcgZGF0aXVtLWhvdXItaGFuZCxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1taW51dGUtcGlja2VyLmRhdGl1bS1kcmFnZ2luZyBkYXRpdW0tbWludXRlLWhhbmQsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tbWludXRlLXBpY2tlci5kYXRpdW0tZHJhZ2dpbmcgZGF0aXVtLXNlY29uZC1oYW5kLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLW1pbnV0ZS1waWNrZXIuZGF0aXVtLWRyYWdnaW5nIGRhdGl1bS10aW1lLWRyYWctYXJtLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLXNlY29uZC1waWNrZXIuZGF0aXVtLWRyYWdnaW5nIGRhdGl1bS1ob3VyLWhhbmQsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tc2Vjb25kLXBpY2tlci5kYXRpdW0tZHJhZ2dpbmcgZGF0aXVtLW1pbnV0ZS1oYW5kLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLXNlY29uZC1waWNrZXIuZGF0aXVtLWRyYWdnaW5nIGRhdGl1bS1zZWNvbmQtaGFuZCxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1zZWNvbmQtcGlja2VyLmRhdGl1bS1kcmFnZ2luZyBkYXRpdW0tdGltZS1kcmFnLWFybXt0cmFuc2l0aW9uOm5vbmV9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWhvdXItaGFuZCxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbWludXRlLWhhbmQsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXNlY29uZC1oYW5ke3Bvc2l0aW9uOmFic29sdXRlO2Rpc3BsYXk6YmxvY2s7d2lkdGg6MDtoZWlnaHQ6MDtsZWZ0OjUwJTt0b3A6NTAlO3RyYW5zZm9ybS1vcmlnaW46M3B4IDNweDttYXJnaW4tbGVmdDotM3B4O21hcmdpbi10b3A6LTNweDtib3JkZXItbGVmdDozcHggc29saWQgdHJhbnNwYXJlbnQ7Ym9yZGVyLXJpZ2h0OjNweCBzb2xpZCB0cmFuc3BhcmVudDtib3JkZXItdG9wLWxlZnQtcmFkaXVzOjNweDtib3JkZXItdG9wLXJpZ2h0LXJhZGl1czozcHg7dHJhbnNpdGlvbjouM3MgZWFzZSBhbGx9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tbWludXRlLXBpY2tlciBkYXRpdW0taG91ci1oYW5kLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLXNlY29uZC1waWNrZXIgZGF0aXVtLWhvdXItaGFuZCxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1zZWNvbmQtcGlja2VyIGRhdGl1bS1taW51dGUtaGFuZHtib3JkZXItdG9wLWNvbG9yOl9zZWNvbmRhcnlfdGV4dDtvcGFjaXR5Oi41fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1ob3VyLWhhbmR7Ym9yZGVyLXRvcDozMHB4IHNvbGlkIF9zZWNvbmRhcnlfYWNjZW50fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1taW51dGUtaGFuZHt0cmFuc2Zvcm0tb3JpZ2luOjJweCAycHg7bWFyZ2luLWxlZnQ6LTJweDttYXJnaW4tdG9wOi0ycHg7Ym9yZGVyLWxlZnQ6MnB4IHNvbGlkIHRyYW5zcGFyZW50O2JvcmRlci1yaWdodDoycHggc29saWQgdHJhbnNwYXJlbnQ7Ym9yZGVyLXRvcC1sZWZ0LXJhZGl1czoycHg7Ym9yZGVyLXRvcC1yaWdodC1yYWRpdXM6MnB4O2JvcmRlci10b3A6NDBweCBzb2xpZCBfc2Vjb25kYXJ5X2FjY2VudH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc2Vjb25kLWhhbmR7dHJhbnNmb3JtLW9yaWdpbjoxcHggMXB4O21hcmdpbi1sZWZ0Oi0xcHg7bWFyZ2luLXRvcDotMXB4O2JvcmRlci1sZWZ0OjFweCBzb2xpZCB0cmFuc3BhcmVudDtib3JkZXItcmlnaHQ6MXB4IHNvbGlkIHRyYW5zcGFyZW50O2JvcmRlci10b3AtbGVmdC1yYWRpdXM6MXB4O2JvcmRlci10b3AtcmlnaHQtcmFkaXVzOjFweDtib3JkZXItdG9wOjUwcHggc29saWQgX3NlY29uZGFyeV9hY2NlbnR9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXRpbWUtZHJhZy1hcm17d2lkdGg6MnB4O2hlaWdodDo3MHB4O3Bvc2l0aW9uOmFic29sdXRlO2xlZnQ6NTAlO3RvcDo1MCU7bWFyZ2luLWxlZnQ6LTFweDt0cmFuc2Zvcm0tb3JpZ2luOjFweCAwO3RyYW5zZm9ybTpyb3RhdGUoNDVkZWcpO3RyYW5zaXRpb246LjNzIGVhc2UgYWxsfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS10aW1lLWRyYWctYXJtOmFmdGVyLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS10aW1lLWRyYWctYXJtOmJlZm9yZXtjb250ZW50OicnO2JvcmRlcjo0cHggc29saWQgdHJhbnNwYXJlbnQ7cG9zaXRpb246YWJzb2x1dGU7Ym90dG9tOi00cHg7bGVmdDoxMnB4O2JvcmRlci1sZWZ0LWNvbG9yOl9zZWNvbmRhcnlfYWNjZW50O3RyYW5zZm9ybS1vcmlnaW46LTExcHggNHB4fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS10aW1lLWRyYWctYXJtOmFmdGVye3RyYW5zZm9ybTpyb3RhdGUoMTgwZGVnKX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tdGltZS1kcmFne2Rpc3BsYXk6YmxvY2s7cG9zaXRpb246YWJzb2x1dGU7d2lkdGg6NTBweDtoZWlnaHQ6NTBweDt0b3A6MTAwJTttYXJnaW4tdG9wOi0yNXB4O21hcmdpbi1sZWZ0Oi0yNHB4O2JvcmRlci1yYWRpdXM6MjVweH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tdGltZS1kcmFnOmFmdGVye2NvbnRlbnQ6Jyc7d2lkdGg6MTBweDtoZWlnaHQ6MTBweDtwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjUwJTt0b3A6NTAlO21hcmdpbi1sZWZ0Oi03cHg7bWFyZ2luLXRvcDotN3B4O2JhY2tncm91bmQtY29sb3I6X3NlY29uZGFyeV9hY2NlbnQ7Ym9yZGVyOjJweCBzb2xpZDtib3JkZXItY29sb3I6X3NlY29uZGFyeTtib3gtc2hhZG93OjAgMCAwIDJweCBfc2Vjb25kYXJ5X2FjY2VudDtib3JkZXItcmFkaXVzOjEwcHh9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXRpbWUtZHJhZy5kYXRpdW0tYWN0aXZlOmFmdGVye3dpZHRoOjhweDtoZWlnaHQ6OHB4O2JvcmRlcjozcHggc29saWQ7Ym9yZGVyLWNvbG9yOl9zZWNvbmRhcnl9XCI7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
