(function(){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
window['Datium'] = (function () {
    function Datium(element, options) {
        var internals = new DatiumInternals(element, options);
        this['updateOptions'] = function (options) { return internals.updateOptions(options); };
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
        //this.pickerManager = new PickerManager(element);
        this.updateOptions(options);
        listen.goto(element, function (e) { return _this.goto(e.date, e.level, e.update); });
        listen.zoomOut(element, function (e) { return _this.zoomOut(e.date, e.currentLevel, e.update); });
        listen.zoomIn(element, function (e) { return _this.zoomIn(e.date, e.currentLevel, e.update); });
        // TODO make sure initial goto is a valid date...
        // this.goto(this.options['defaultDate'], Level.NONE, true);
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
        if (date !== void 0) {
            if (date.valueOf() < this.options.minDate.valueOf()) {
                date = new Date(this.options.minDate.valueOf());
            }
            if (date.valueOf() > this.options.maxDate.valueOf()) {
                date = new Date(this.options.maxDate.valueOf());
            }
        }
        if (date === void 0 && update === false) {
            this.date = new Date();
            level = this.input.getLevels().slice().sort()[0];
        }
        else {
            this.date = date;
        }
        trigger.viewchanged(this.element, {
            date: this.date,
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
        /*
        if (this.pickerManager.currentPicker !== void 0) {
            let curLevel = this.pickerManager.currentPicker.getLevel();
            
            if (this.levels.indexOf(curLevel) == -1) {
                trigger.goto(this.element, {
                    date: this.date,
                    level: this.levels[0]
                })
            }
        }
        
        this.pickerManager.updateOptions(this.options);
        */
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
        if (dflt === void 0) { dflt = new Date(-8640000000000000); }
        if (minDate === void 0)
            return dflt;
        return new Date(minDate); //TODO figure this out yes
    };
    OptionSanitizer.sanitizeMaxDate = function (maxDate, dflt) {
        if (dflt === void 0) { dflt = new Date(8640000000000000); }
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
    OptionSanitizer.sanitizeIsSecondValid = function (isSecondSelectable, dflt) {
        if (dflt === void 0) { dflt = function (date) { return true; }; }
        return dflt;
    };
    OptionSanitizer.sanitizeIsMinuteValid = function (isMinuteSelectable, dflt) {
        if (dflt === void 0) { dflt = function (date) { return true; }; }
        return function (date) { return date.getMinutes() % 15 === 0; };
    };
    OptionSanitizer.sanitizeIsHourValid = function (isHourSelectable, dflt) {
        if (dflt === void 0) { dflt = function (date) { return true; }; }
        return dflt;
    };
    OptionSanitizer.sanitizeIsDateValid = function (isDateSelectable, dflt) {
        if (dflt === void 0) { dflt = function (date) { return true; }; }
        return function (date) { return date.getDay() !== 0 && date.getDay() !== 6; };
    };
    OptionSanitizer.sanitizeIsMonthValid = function (isMonthSelectable, dflt) {
        if (dflt === void 0) { dflt = function (date) { return true; }; }
        return dflt;
    };
    OptionSanitizer.sanitizeIsYearValid = function (isYearSelectable, dflt) {
        if (dflt === void 0) { dflt = function (date) { return true; }; }
        return dflt;
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
        var minDate = OptionSanitizer.sanitizeMinDate(options['minDate'], defaults.minDate);
        var maxDate = OptionSanitizer.sanitizeMaxDate(options['maxDate'], defaults.maxDate);
        var opts = {
            displayAs: OptionSanitizer.sanitizeDisplayAs(options['displayAs'], defaults.displayAs),
            minDate: minDate,
            maxDate: maxDate,
            defaultDate: OptionSanitizer.sanitizeDefaultDate(options['defaultDate'], defaults.defaultDate),
            theme: OptionSanitizer.sanitizeTheme(options['theme'], defaults.theme),
            militaryTime: OptionSanitizer.sanitizeMilitaryTime(options['militaryTime'], defaults.militaryTime),
            isSecondValid: OptionSanitizer.sanitizeIsSecondValid(options['isSecondValid'], defaults.isSecondValid),
            isMinuteValid: OptionSanitizer.sanitizeIsMinuteValid(options['isMinuteValid'], defaults.isMinuteValid),
            isHourValid: OptionSanitizer.sanitizeIsHourValid(options['isHourValid'], defaults.isHourValid),
            isDateValid: OptionSanitizer.sanitizeIsDateValid(options['isDateValid'], defaults.isDateValid),
            isMonthValid: OptionSanitizer.sanitizeIsMonthValid(options['isMonthValid'], defaults.isMonthValid),
            isYearValid: OptionSanitizer.sanitizeIsYearValid(options['isYearValid'], defaults.isYearValid)
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
    function blur(element, callback) {
        return attachEvents(['blur'], element, function (e) {
            callback(e);
        });
    }
    listen.blur = blur;
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
    PlainText.prototype.getLastValue = function () { return null; };
    PlainText.prototype.getValue = function () { return null; };
    PlainText.prototype.getRegEx = function () { return new RegExp("[" + this.text + "]"); };
    PlainText.prototype.setSelectable = function (selectable) { return this; };
    PlainText.prototype.getMaxBuffer = function () { return 0; };
    PlainText.prototype.getLevel = function () { return 6 /* NONE */; };
    PlainText.prototype.isSelectable = function () { return false; };
    PlainText.prototype.isDefined = function () { return false; };
    PlainText.prototype.setDefined = function () { };
    PlainText.prototype.toString = function () { return this.text; };
    return PlainText;
}());
var formatBlocks = (function () {
    var DatePart = (function (_super) {
        __extends(DatePart, _super);
        function DatePart(options) {
            _super.call(this);
            this.options = options;
            this.selectable = true;
            this.defined = false;
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
        DatePart.prototype.isDefined = function () {
            return this.defined;
        };
        DatePart.prototype.setDefined = function (defined) {
            this.defined = defined;
        };
        return DatePart;
    }(Common));
    var FourDigitYear = (function (_super) {
        __extends(FourDigitYear, _super);
        function FourDigitYear(options) {
            _super.call(this, options);
        }
        FourDigitYear.prototype.increment = function () {
            do {
                this.date.setFullYear(this.date.getFullYear() + 1);
            } while (!this.options.isYearValid(this.date));
        };
        FourDigitYear.prototype.decrement = function () {
            do {
                this.date.setFullYear(this.date.getFullYear() - 1);
            } while (!this.options.isYearValid(this.date));
        };
        FourDigitYear.prototype.setValueFromPartial = function (partial) {
            return this.setValue(partial);
        };
        FourDigitYear.prototype.setValue = function (value) {
            if (value === void 0) {
                this.defined = false;
                return false;
            }
            else if (typeof value === 'object') {
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
            if (!this.defined || !this.options.isYearValid(this.date))
                return 'yyyy';
            return this.date.getFullYear().toString();
        };
        return FourDigitYear;
    }(DatePart));
    var TwoDigitYear = (function (_super) {
        __extends(TwoDigitYear, _super);
        function TwoDigitYear(options) {
            _super.call(this, options);
        }
        TwoDigitYear.prototype.getMaxBuffer = function () {
            return 2;
        };
        TwoDigitYear.prototype.setValue = function (value) {
            if (value === void 0) {
                this.defined = false;
                return false;
            }
            else if (typeof value === 'object') {
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
            if (!this.defined || !this.options.isYearValid(this.date))
                return 'yy';
            return _super.prototype.toString.call(this).slice(-2);
        };
        return TwoDigitYear;
    }(FourDigitYear));
    var LongMonthName = (function (_super) {
        __extends(LongMonthName, _super);
        function LongMonthName(options) {
            _super.call(this, options);
        }
        LongMonthName.prototype.getMonths = function () {
            return _super.prototype.getMonths.call(this);
        };
        LongMonthName.prototype.increment = function () {
            do {
                var num = this.date.getMonth() + 1;
                if (num > 11)
                    num = 0;
                this.date.setMonth(num);
                while (this.date.getMonth() > num) {
                    this.date.setDate(this.date.getDate() - 1);
                }
            } while (!this.options.isMonthValid(this.date));
        };
        LongMonthName.prototype.decrement = function () {
            do {
                var num = this.date.getMonth() - 1;
                if (num < 0)
                    num = 11;
                this.date.setMonth(num);
            } while (!this.options.isMonthValid(this.date));
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
            if (value === void 0) {
                this.defined = false;
                return false;
            }
            else if (typeof value === 'object') {
                this.date = new Date(value.valueOf());
                return true;
            }
            else if (typeof value === 'string' && this.getRegEx().test(value)) {
                var num = this.getMonths().indexOf(value);
                this.date.setMonth(num);
                while (this.date.getMonth() > num) {
                    this.date.setDate(this.date.getDate() - 1);
                }
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
            if (!this.defined || !this.options.isMonthValid(this.date))
                return 'mmm';
            return this.getMonths()[this.date.getMonth()];
        };
        return LongMonthName;
    }(DatePart));
    var ShortMonthName = (function (_super) {
        __extends(ShortMonthName, _super);
        function ShortMonthName(options) {
            _super.call(this, options);
        }
        ShortMonthName.prototype.getMonths = function () {
            return _super.prototype.getShortMonths.call(this);
        };
        ShortMonthName.prototype.toString = function () {
            if (!this.defined || !this.options.isMonthValid(this.date))
                return 'mmm';
            _super.prototype.toString.call(this);
        };
        return ShortMonthName;
    }(LongMonthName));
    var Month = (function (_super) {
        __extends(Month, _super);
        function Month(options) {
            _super.call(this, options);
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
            if (value === void 0) {
                this.defined = false;
                return false;
            }
            else if (typeof value === 'object') {
                this.date = new Date(value.valueOf());
                return true;
            }
            else if (typeof value === 'string' && this.getRegEx().test(value)) {
                this.date.setMonth(parseInt(value, 10) - 1);
                while (this.date.getMonth() > parseInt(value, 10) - 1) {
                    this.date.setDate(this.date.getDate() - 1);
                }
                return true;
            }
            return false;
        };
        Month.prototype.getRegEx = function () {
            return /^([1-9]|(1[0-2]))$/;
        };
        Month.prototype.toString = function () {
            if (!this.defined || !this.options.isMonthValid(this.date))
                return 'mm';
            return (this.date.getMonth() + 1).toString();
        };
        return Month;
    }(LongMonthName));
    var PaddedMonth = (function (_super) {
        __extends(PaddedMonth, _super);
        function PaddedMonth(options) {
            _super.call(this, options);
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
            if (!this.defined || !this.options.isMonthValid(this.date))
                return 'mm';
            return this.pad(_super.prototype.toString.call(this));
        };
        return PaddedMonth;
    }(Month));
    var DateNumeral = (function (_super) {
        __extends(DateNumeral, _super);
        function DateNumeral(options) {
            _super.call(this, options);
        }
        DateNumeral.prototype.increment = function () {
            do {
                var num = this.date.getDate() + 1;
                if (num > this.daysInMonth(this.date))
                    num = 1;
                this.date.setDate(num);
            } while (!this.options.isDateValid(this.date));
        };
        DateNumeral.prototype.decrement = function () {
            do {
                var num = this.date.getDate() - 1;
                if (num < 1)
                    num = this.daysInMonth(this.date);
                this.date.setDate(num);
            } while (!this.options.isDateValid(this.date));
        };
        DateNumeral.prototype.setValueFromPartial = function (partial) {
            if (/^\d{1,2}$/.test(partial)) {
                var trimmed = this.trim(partial === '0' ? '1' : partial);
                return this.setValue(trimmed);
            }
            return false;
        };
        DateNumeral.prototype.setValue = function (value) {
            if (value === void 0) {
                this.defined = false;
                return false;
            }
            else if (typeof value === 'object') {
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
            if (!this.defined || !this.options.isDateValid(this.date))
                return 'dd';
            return this.date.getDate().toString();
        };
        return DateNumeral;
    }(DatePart));
    var PaddedDate = (function (_super) {
        __extends(PaddedDate, _super);
        function PaddedDate(options) {
            _super.call(this, options);
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
            if (!this.defined || !this.options.isDateValid(this.date))
                return 'dd';
            return this.pad(this.date.getDate());
        };
        return PaddedDate;
    }(DateNumeral));
    var DateOrdinal = (function (_super) {
        __extends(DateOrdinal, _super);
        function DateOrdinal(options) {
            _super.call(this, options);
        }
        DateOrdinal.prototype.getRegEx = function () {
            return /^([1-9]|((1|2)[0-9])|(3[0-1]))((st)|(nd)|(rd)|(th))?$/i;
        };
        DateOrdinal.prototype.toString = function () {
            if (!this.defined || !this.options.isDateValid(this.date))
                return 'dd';
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
        function LongDayName(options) {
            _super.call(this, options);
        }
        LongDayName.prototype.getDays = function () {
            return _super.prototype.getDays.call(this);
        };
        LongDayName.prototype.increment = function () {
            do {
                var num = this.date.getDay() + 1;
                if (num > 6)
                    num = 0;
                this.date.setDate(this.date.getDate() - this.date.getDay() + num);
            } while (!this.options.isDateValid(this.date));
        };
        LongDayName.prototype.decrement = function () {
            do {
                var num = this.date.getDay() - 1;
                if (num < 0)
                    num = 6;
                this.date.setDate(this.date.getDate() - this.date.getDay() + num);
            } while (!this.options.isDateValid(this.date));
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
            if (value === void 0) {
                this.defined = false;
                return false;
            }
            else if (typeof value === 'object') {
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
            if (!this.defined || !this.options.isDateValid(this.date))
                return 'ddd';
            return this.getDays()[this.date.getDay()];
        };
        return LongDayName;
    }(DatePart));
    var ShortDayName = (function (_super) {
        __extends(ShortDayName, _super);
        function ShortDayName(options) {
            _super.call(this, options);
        }
        ShortDayName.prototype.getDays = function () {
            return _super.prototype.getShortDays.call(this);
        };
        return ShortDayName;
    }(LongDayName));
    var PaddedMilitaryHour = (function (_super) {
        __extends(PaddedMilitaryHour, _super);
        function PaddedMilitaryHour(options) {
            _super.call(this, options);
        }
        PaddedMilitaryHour.prototype.increment = function () {
            do {
                var num = this.date.getHours() + 1;
                if (num > 23)
                    num = 0;
                this.date.setHours(num);
            } while (!this.options.isHourValid(this.date));
        };
        PaddedMilitaryHour.prototype.decrement = function () {
            do {
                var num = this.date.getHours() - 1;
                if (num < 0)
                    num = 23;
                this.date.setHours(num);
                // Day Light Savings Adjustment
                if (this.date.getHours() !== num) {
                    this.date.setHours(num - 1);
                }
            } while (!this.options.isHourValid(this.date));
        };
        PaddedMilitaryHour.prototype.setValueFromPartial = function (partial) {
            if (/^\d{1,2}$/.test(partial)) {
                var padded = this.pad(partial);
                return this.setValue(padded);
            }
            return false;
        };
        PaddedMilitaryHour.prototype.setValue = function (value) {
            if (value === void 0) {
                this.defined = false;
                return false;
            }
            else if (typeof value === 'object') {
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
            if (!this.defined || !this.options.isHourValid(this.date))
                return '--';
            return this.pad(this.date.getHours());
        };
        return PaddedMilitaryHour;
    }(DatePart));
    var MilitaryHour = (function (_super) {
        __extends(MilitaryHour, _super);
        function MilitaryHour(options) {
            _super.call(this, options);
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
            if (!this.defined || !this.options.isHourValid(this.date))
                return '--';
            return this.date.getHours().toString();
        };
        return MilitaryHour;
    }(PaddedMilitaryHour));
    var PaddedHour = (function (_super) {
        __extends(PaddedHour, _super);
        function PaddedHour(options) {
            _super.call(this, options);
        }
        PaddedHour.prototype.setValueFromPartial = function (partial) {
            var padded = this.pad(partial === '0' ? '1' : partial);
            return this.setValue(padded);
        };
        PaddedHour.prototype.setValue = function (value) {
            if (value === void 0) {
                this.defined = false;
                return false;
            }
            else if (typeof value === 'object') {
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
            if (!this.defined || !this.options.isHourValid(this.date))
                return '--';
            return this.pad(this.getHours(this.date));
        };
        return PaddedHour;
    }(PaddedMilitaryHour));
    var Hour = (function (_super) {
        __extends(Hour, _super);
        function Hour(options) {
            _super.call(this, options);
        }
        Hour.prototype.setValueFromPartial = function (partial) {
            var trimmed = this.trim(partial === '0' ? '1' : partial);
            return this.setValue(trimmed);
        };
        Hour.prototype.getRegEx = function () {
            return /^[1-9]|(1[0-2])$/;
        };
        Hour.prototype.toString = function () {
            if (!this.defined || !this.options.isHourValid(this.date))
                return '--';
            return this.trim(_super.prototype.toString.call(this));
        };
        return Hour;
    }(PaddedHour));
    var PaddedMinute = (function (_super) {
        __extends(PaddedMinute, _super);
        function PaddedMinute(options) {
            _super.call(this, options);
        }
        PaddedMinute.prototype.increment = function () {
            do {
                var num = this.date.getMinutes() + 1;
                if (num > 59)
                    num = 0;
                this.date.setMinutes(num);
            } while (!this.options.isMinuteValid(this.date));
        };
        PaddedMinute.prototype.decrement = function () {
            do {
                var num = this.date.getMinutes() - 1;
                if (num < 0)
                    num = 59;
                this.date.setMinutes(num);
            } while (!this.options.isMinuteValid(this.date));
        };
        PaddedMinute.prototype.setValueFromPartial = function (partial) {
            return this.setValue(this.pad(partial));
        };
        PaddedMinute.prototype.setValue = function (value) {
            if (value === void 0) {
                this.defined = false;
                return false;
            }
            else if (typeof value === 'object') {
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
            if (!this.defined || !this.options.isMinuteValid(this.date))
                return '--';
            return this.pad(this.date.getMinutes());
        };
        return PaddedMinute;
    }(DatePart));
    var Minute = (function (_super) {
        __extends(Minute, _super);
        function Minute(options) {
            _super.call(this, options);
        }
        Minute.prototype.setValueFromPartial = function (partial) {
            return this.setValue(this.trim(partial));
        };
        Minute.prototype.getRegEx = function () {
            return /^[0-5]?[0-9]$/;
        };
        Minute.prototype.toString = function () {
            if (!this.defined || !this.options.isMinuteValid(this.date))
                return '--';
            return this.date.getMinutes().toString();
        };
        return Minute;
    }(PaddedMinute));
    var PaddedSecond = (function (_super) {
        __extends(PaddedSecond, _super);
        function PaddedSecond(options) {
            _super.call(this, options);
        }
        PaddedSecond.prototype.increment = function () {
            do {
                var num = this.date.getSeconds() + 1;
                if (num > 59)
                    num = 0;
                this.date.setSeconds(num);
            } while (!this.options.isSecondValid(this.date));
        };
        PaddedSecond.prototype.decrement = function () {
            do {
                var num = this.date.getSeconds() - 1;
                if (num < 0)
                    num = 59;
                this.date.setSeconds(num);
            } while (!this.options.isSecondValid(this.date));
        };
        PaddedSecond.prototype.setValueFromPartial = function (partial) {
            return this.setValue(this.pad(partial));
        };
        PaddedSecond.prototype.setValue = function (value) {
            if (value === void 0) {
                this.defined = false;
                return false;
            }
            else if (typeof value === 'object') {
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
            if (!this.defined || !this.options.isSecondValid(this.date))
                return '--';
            return this.pad(this.date.getSeconds());
        };
        return PaddedSecond;
    }(DatePart));
    var Second = (function (_super) {
        __extends(Second, _super);
        function Second(options) {
            _super.call(this, options);
        }
        Second.prototype.setValueFromPartial = function (partial) {
            return this.setValue(this.trim(partial));
        };
        Second.prototype.getRegEx = function () {
            return /^[0-5]?[0-9]$/;
        };
        Second.prototype.toString = function () {
            if (!this.defined || !this.options.isSecondValid(this.date))
                return '--';
            return this.date.getSeconds().toString();
        };
        return Second;
    }(PaddedSecond));
    var UppercaseMeridiem = (function (_super) {
        __extends(UppercaseMeridiem, _super);
        function UppercaseMeridiem(options) {
            _super.call(this, options);
        }
        UppercaseMeridiem.prototype.increment = function () {
            var num = this.date.getHours() + 12;
            if (num > 23)
                num -= 24;
            this.date.setHours(num);
            if (!this.options.isHourValid(this.date))
                this.decrement();
        };
        UppercaseMeridiem.prototype.decrement = function () {
            var num = this.date.getHours() - 12;
            if (num < 0)
                num += 24;
            this.date.setHours(num);
            if (this.options.isHourValid(this.date))
                this.increment();
        };
        UppercaseMeridiem.prototype.setValueFromPartial = function (partial) {
            if (/^((AM?)|(PM?))$/i.test(partial)) {
                return this.setValue(partial[0] === 'A' ? 'AM' : 'PM');
            }
            return false;
        };
        UppercaseMeridiem.prototype.setValue = function (value) {
            if (value === void 0) {
                this.defined = false;
                return false;
            }
            else if (typeof value === 'object') {
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
            if (!this.defined || !this.options.isHourValid(this.date))
                return '--';
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
            if (!this.defined || !this.options.isHourValid(this.date))
                return '--';
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
        listen.blur(element, function () {
            _this.textBuffer = '';
            _this.blurDatePart(_this.selectedDatePart);
        });
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
                var lastDatePart = this.selectedDatePart;
                this.selectedDatePart = this.getNextSelectableDatePart();
                this.blurDatePart(lastDatePart);
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
            var lastSelected = this.selectedDatePart;
            this.selectedDatePart = datePart;
            this.blurDatePart(lastSelected);
        }
    };
    Input.prototype.blurDatePart = function (datePart) {
        /*
        if (datePart === void 0) return;
        let valid = false;
        switch(datePart.getLevel()) {
            case Level.YEAR:
                valid = this.options.isYearSelectable(datePart.getValue());
                break;
            case Level.MONTH:
                valid = this.options.isMonthSelectable(datePart.getValue());
                break;
            case Level.DATE:
                valid = this.options.isDateSelectable(datePart.getValue());
                break;
            case Level.HOUR:
                valid = this.options.isHourSelectable(datePart.getValue());
                break;
            case Level.MINUTE:
                valid = this.options.isMinuteSelectable(datePart.getValue());
                break;
            case Level.SECOND:
                valid = this.options.isSecondSelectable(datePart.getValue());
                break;
        }
        trigger.goto(this.element, {
            level: this.selectedDatePart.getLevel(),
            date: valid ? datePart.getValue() : datePart.getLastValue()
        });
        */
    };
    Input.prototype.getSelectedDatePart = function () {
        return this.selectedDatePart;
    };
    Input.prototype.updateOptions = function (options) {
        this.options = options;
        this.dateParts = Parser.parse(options);
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
        var defined = date !== void 0;
        this.date = date || this.options.defaultDate;
        this.level = level;
        this.dateParts.forEach(function (datePart) {
            //let currentValid = datePart.isDefined();
            if (update)
                datePart.setValue(_this.date);
            if (update && defined && level === datePart.getLevel()) {
                datePart.setDefined(true);
            }
            else if (!defined) {
                datePart.setDefined(false);
            }
            if (datePart.isSelectable() &&
                datePart.getLevel() === level &&
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
            level: this.getSelectedDatePart().getLevel(),
            update: false
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
            if (textBuffer.length < 2) {
                this.input.getSelectedDatePart().setDefined(false);
                this.input.triggerViewChange();
            }
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
    Parser.parse = function (options) {
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
        while (index < options.displayAs.length) {
            if (!inEscapedSegment && options.displayAs[index] === '[') {
                inEscapedSegment = true;
                index++;
                continue;
            }
            if (inEscapedSegment && options.displayAs[index] === ']') {
                inEscapedSegment = false;
                index++;
                continue;
            }
            if (inEscapedSegment) {
                textBuffer += options.displayAs[index];
                index++;
                continue;
            }
            var found = false;
            for (var code in formatBlocks) {
                if (Parser.findAt(options.displayAs, index, "{" + code + "}")) {
                    pushPlainText();
                    dateParts.push(new formatBlocks[code](options).setSelectable(false));
                    index += code.length + 2;
                    found = true;
                    break;
                }
                else if (Parser.findAt(options.displayAs, index, code)) {
                    pushPlainText();
                    dateParts.push(new formatBlocks[code](options));
                    index += code.length;
                    found = true;
                    break;
                }
            }
            if (!found) {
                textBuffer += options.displayAs[index];
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
        //TODO fix this cause it's not working
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
                    _this.input.blurDatePart(datePart);
                    newDate = datePart.getValue();
                }
                else {
                    // TODO set all dateparts back to original value
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
        // TODO think about making a "viewDate" and a "selectedDate"
        this.date = date;
        this.level = level;
        this.labels.forEach(function (label, labelLevel) {
            label.classList.remove('datium-top');
            label.classList.remove('datium-bottom');
            label.classList.remove('datium-hidden');
            if (labelLevel < level) {
                label.classList.add('datium-top');
                label.innerHTML = _this.getHeaderTopText(_this.date, labelLevel);
            }
            else {
                label.classList.add('datium-bottom');
                label.innerHTML = _this.getHeaderBottomText(_this.date, labelLevel);
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
            if (iterator.getMonth() === date.getMonth() &&
                this.options.isDateValid(iterator)) {
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
        if (selectedDate === void 0)
            return;
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
        this.moved = 0;
    }
    TimePicker.prototype.isDragging = function () {
        return this.dragging;
    };
    TimePicker.prototype.dragStart = function (e) {
        var minuteAdjust = 0;
        if (this.getLevel() === 3 /* HOUR */) {
            minuteAdjust = (Math.PI * this.selectedDate.getMinutes() / 30) / 12;
        }
        trigger.openBubble(this.element, {
            x: -70 * Math.sin(this.rotation + minuteAdjust) + 140,
            y: 70 * Math.cos(this.rotation + minuteAdjust) + 175,
            text: this.getBubbleText()
        });
        this.picker.classList.add('datium-dragging');
        this.dragging = true;
        this.moved = 0;
    };
    TimePicker.prototype.dragMove = function (e) {
        var point = {
            x: this.picker.getBoundingClientRect().left + 140 - this.getClientCoor(e).x,
            y: this.getClientCoor(e).y - this.picker.getBoundingClientRect().top - 120
        };
        var r = Math.atan2(point.x, point.y);
        this.rotation = this.normalizeRotation(r);
        var newDate = this.getElementDate(this.timeDrag);
        var goto = true;
        if (this.getLevel() === 3 /* HOUR */) {
            newDate.setHours(this.rotationToTime(this.rotation));
            goto = this.options.isHourValid(newDate);
        }
        else if (this.getLevel() === 4 /* MINUTE */) {
            newDate.setMinutes(this.rotationToTime(this.rotation));
            goto = this.options.isMinuteValid(newDate);
        }
        else if (this.getLevel() === 5 /* SECOND */) {
            newDate.setSeconds(this.rotationToTime(this.rotation));
            goto = this.options.isHourValid(newDate);
        }
        if (this.moved++ > 1) {
            trigger.updateBubble(this.element, {
                x: -70 * Math.sin(this.rotation) + 140,
                y: 70 * Math.cos(this.rotation) + 175,
                text: this.getBubbleText()
            });
        }
        this.updateLabels(newDate);
        if (goto) {
            trigger.goto(this.element, {
                date: newDate,
                level: this.getLevel(),
                update: false
            });
        }
        this.updateElements();
    };
    TimePicker.prototype.dragEnd = function (e) {
        this.picker.classList.remove('datium-dragging');
        var date = this.getElementDate(this.timeDrag);
        var zoomIn = true;
        if (this.getLevel() === 3 /* HOUR */) {
            date.setHours(this.rotationToTime(this.rotation));
            date = this.round(date);
            zoomIn = this.options.isHourValid(date);
        }
        else if (this.getLevel() === 4 /* MINUTE */) {
            date.setMinutes(this.rotationToTime(this.rotation));
            date = this.round(date);
            zoomIn = this.options.isMinuteValid(date);
        }
        else if (this.getLevel() === 5 /* SECOND */) {
            date.setSeconds(this.rotationToTime(this.rotation));
            date = this.round(date);
            zoomIn = this.options.isSecondValid(date);
        }
        if (zoomIn) {
            trigger.zoomIn(this.element, {
                date: date,
                currentLevel: this.getLevel()
            });
        }
        this.dragging = false;
        this.updateElements();
    };
    TimePicker.prototype.updateElements = function () {
        this.timeDragArm.style.transform = "rotate(" + this.rotation + "rad)";
        if (this.getLevel() == 3 /* HOUR */) {
            var minuteAdjust = 0;
            if (!this.dragging) {
                minuteAdjust = (Math.PI * this.selectedDate.getMinutes() / 30) / 12;
            }
            this.timeDragArm.style.transform = "rotate(" + (this.rotation + minuteAdjust) + "rad)";
            this.hourHand.style.transform = "rotate(" + (this.rotation + minuteAdjust) + "rad)";
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
        if (date === void 0)
            return;
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
    TimePicker.prototype.floor = function (date) { throw 'unimplemented'; };
    TimePicker.prototype.ceil = function (date) { throw 'unimplemented'; };
    TimePicker.prototype.round = function (date) { throw 'unimplemented'; };
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
            // TODO sort out bug with this one
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
    HourPicker.prototype.ceil = function (date) {
        var ceiledDate = new Date(date.valueOf());
        var upper = ceiledDate.getHours() + 1;
        var orig = ceiledDate.getHours();
        while (!this.options.isHourValid(ceiledDate)) {
            if (upper > 23)
                upper = 0;
            ceiledDate.setHours(upper++);
            if (this.options.isHourValid(ceiledDate))
                break;
            if (upper === orig)
                break;
        }
        return ceiledDate;
    };
    HourPicker.prototype.floor = function (date) {
        var flooredDate = new Date(date.valueOf());
        var lower = flooredDate.getHours() - 1;
        var orig = flooredDate.getHours();
        while (!this.options.isHourValid(flooredDate)) {
            if (lower < 0)
                lower = 23;
            flooredDate.setHours(lower--);
            if (this.options.isHourValid(flooredDate))
                break;
            if (lower === orig)
                break;
        }
        return flooredDate;
    };
    HourPicker.prototype.round = function (date) {
        var roundedDate = new Date(date.valueOf());
        var lower = roundedDate.getHours() - 1;
        var upper = roundedDate.getHours() + 1;
        while (!this.options.isHourValid(roundedDate)) {
            if (lower < 0)
                lower = 23;
            roundedDate.setHours(lower--);
            if (this.options.isHourValid(roundedDate))
                break;
            if (lower === upper)
                break;
            if (upper > 23)
                upper = 0;
            roundedDate.setHours(upper++);
            if (lower === upper)
                break;
        }
        return roundedDate;
    };
    HourPicker.prototype.getBubbleText = function (hours) {
        if (hours === void 0) {
            hours = this.rotationToTime(this.rotation);
        }
        var d = new Date(this.selectedDate.valueOf());
        d.setHours(hours);
        d = this.round(d);
        hours = d.getHours();
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
        return Math.floor(t + .000001);
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
            if (this.options.isHourValid(d)) {
                label.classList.remove('datium-inactive');
            }
            else {
                label.classList.add('datium-inactive');
            }
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
    MinutePicker.prototype.ceil = function (date) {
        var ceiledDate = new Date(date.valueOf());
        var upper = ceiledDate.getMinutes() + 1;
        var orig = ceiledDate.getMinutes();
        while (!this.options.isMinuteValid(ceiledDate)) {
            if (upper > 59)
                upper = 0;
            ceiledDate.setMinutes(upper++);
            if (this.options.isMinuteValid(ceiledDate))
                break;
            if (upper === orig)
                break;
        }
        return ceiledDate;
    };
    MinutePicker.prototype.floor = function (date) {
        var flooredDate = new Date(date.valueOf());
        var lower = flooredDate.getMinutes() - 1;
        var orig = flooredDate.getMinutes();
        while (!this.options.isMinuteValid(flooredDate)) {
            if (lower < 0)
                lower = 59;
            flooredDate.setMinutes(lower--);
            if (this.options.isMinuteValid(flooredDate))
                break;
            if (lower === orig)
                break;
        }
        return flooredDate;
    };
    MinutePicker.prototype.round = function (date) {
        var roundedDate = new Date(date.valueOf());
        var lower = roundedDate.getMinutes() - 1;
        var upper = roundedDate.getMinutes() + 1;
        while (!this.options.isMinuteValid(roundedDate)) {
            if (lower < 0)
                lower = 59;
            roundedDate.setMinutes(lower--);
            if (this.options.isMinuteValid(roundedDate))
                break;
            if (lower === upper)
                break;
            if (upper > 59)
                upper = 0;
            roundedDate.setMinutes(upper++);
            if (lower === upper)
                break;
        }
        return roundedDate;
    };
    MinutePicker.prototype.getBubbleText = function (minutes) {
        if (minutes === void 0) {
            minutes = this.rotationToTime(this.rotation);
        }
        var d = new Date(this.selectedDate.valueOf());
        d.setMinutes(minutes);
        d = this.round(d);
        minutes = d.getMinutes();
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
            if (this.options.isMinuteValid(d)) {
                label.classList.remove('datium-inactive');
            }
            else {
                label.classList.add('datium-inactive');
            }
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
            if (this.options.isMonthValid(iterator)) {
                monthElement.setAttribute('datium-data', iterator.toISOString());
            }
            this.picker.appendChild(monthElement);
            iterator.setMonth(iterator.getMonth() + 1);
        } while (iterator.valueOf() < this.max.valueOf());
        this.attach();
        this.setSelectedDate(this.selectedDate);
    };
    MonthPicker.prototype.setSelectedDate = function (selectedDate) {
        if (selectedDate === void 0)
            return;
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
    SecondPicker.prototype.ceil = function (date) {
        var ceiledDate = new Date(date.valueOf());
        var upper = ceiledDate.getSeconds() + 1;
        var orig = ceiledDate.getSeconds();
        while (!this.options.isSecondValid(ceiledDate)) {
            if (upper > 59)
                upper = 0;
            ceiledDate.setSeconds(upper++);
            if (this.options.isSecondValid(ceiledDate))
                break;
            if (upper === orig)
                break;
        }
        return ceiledDate;
    };
    SecondPicker.prototype.floor = function (date) {
        var flooredDate = new Date(date.valueOf());
        var lower = flooredDate.getSeconds() - 1;
        var orig = flooredDate.getSeconds();
        while (!this.options.isSecondValid(flooredDate)) {
            if (lower < 0)
                lower = 59;
            flooredDate.setSeconds(lower--);
            if (this.options.isSecondValid(flooredDate))
                break;
            if (lower === orig)
                break;
        }
        return flooredDate;
    };
    SecondPicker.prototype.round = function (date) {
        var roundedDate = new Date(date.valueOf());
        var lower = roundedDate.getSeconds() - 1;
        var upper = roundedDate.getSeconds() + 1;
        while (!this.options.isSecondValid(roundedDate)) {
            if (lower < 0)
                lower = 59;
            roundedDate.setSeconds(lower--);
            if (this.options.isSecondValid(roundedDate))
                break;
            if (lower === upper)
                break;
            if (upper > 59)
                upper = 0;
            roundedDate.setSeconds(upper++);
            if (lower === upper)
                break;
        }
        return roundedDate;
    };
    SecondPicker.prototype.getBubbleText = function (seconds) {
        if (seconds === void 0) {
            seconds = this.rotationToTime(this.rotation);
        }
        var d = new Date(this.selectedDate.valueOf());
        d.setSeconds(seconds);
        d = this.round(d);
        seconds = d.getSeconds();
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
            var start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());
            var end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds() + 1);
            if (end.valueOf() > this.options.minDate.valueOf() &&
                start.valueOf() < this.options.maxDate.valueOf() &&
                this.options.isSecondValid(d)) {
                label.classList.remove('datium-inactive');
            }
            else {
                label.classList.add('datium-inactive');
            }
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
            if (this.options.isYearValid(iterator)) {
                yearElement.setAttribute('datium-data', iterator.toISOString());
            }
            this.picker.appendChild(yearElement);
            iterator.setFullYear(iterator.getFullYear() + 1);
        } while (iterator.valueOf() <= this.max.valueOf());
        this.attach();
        this.setSelectedDate(this.selectedDate);
    };
    YearPicker.prototype.setSelectedDate = function (selectedDate) {
        if (selectedDate === void 0)
            return;
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
var css = "datium-container._id datium-header,datium-container._id datium-picker-container{width:calc(100% - 14px);box-shadow:0 3px 6px rgba(0,0,0,.16),0 3px 6px rgba(0,0,0,.23);overflow:hidden}datium-container._id datium-bubble,datium-container._id datium-header,datium-container._id datium-picker-container{box-shadow:0 3px 6px rgba(0,0,0,.16),0 3px 6px rgba(0,0,0,.23)}datium-container._id datium-header-wrapper{overflow:hidden;position:absolute;left:-7px;right:-7px;top:-7px;height:87px;display:block;pointer-events:none}datium-container._id datium-header{position:relative;display:block;height:100px;background-color:_primary;border-top-left-radius:3px;border-top-right-radius:3px;z-index:1;margin:7px;pointer-events:auto}datium-container._id datium-span-label-container{position:absolute;left:40px;right:40px;top:0;bottom:0;display:block;overflow:hidden;transition:.2s ease all;transform-origin:40px 40px}datium-container._id datium-span-label{position:absolute;font-size:18pt;color:_primary_text;font-weight:700;transform-origin:0 0;white-space:nowrap;transition:all .2s ease;text-transform:uppercase}datium-container._id datium-span-label.datium-top{transform:translateY(17px) scale(.66);width:151%;opacity:.6}datium-container._id datium-span-label.datium-bottom{transform:translateY(36px) scale(1);width:100%;opacity:1}datium-container._id datium-span-label.datium-top.datium-hidden{transform:translateY(5px) scale(.4);opacity:0}datium-container._id datium-span-label.datium-bottom.datium-hidden{transform:translateY(78px) scale(1.2);opacity:1}datium-container._id datium-span-label:after{content:'';display:inline-block;position:absolute;margin-left:10px;margin-top:6px;height:17px;width:17px;opacity:0;transition:all .2s ease;background:url(data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22_primary_text%22%3E%3Cpath%20d%3D%22M17%2015l-2%202-5-5%202-2z%22%20fill-rule%3D%22evenodd%22%2F%3E%3Cpath%20d%3D%22M7%200a7%207%200%200%200-7%207%207%207%200%200%200%207%207%207%207%200%200%200%207-7%207%207%200%200%200-7-7zm0%202a5%205%200%200%201%205%205%205%205%200%200%201-5%205%205%205%200%200%201-5-5%205%205%200%200%201%205-5z%22%2F%3E%3Cpath%20d%3D%22M4%206h6v2H4z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E)}datium-container._id datium-bubble,datium-container._id datium-bubble.datium-bubble-visible{transition-property:transform,opacity;transition-timing-function:ease;transition-duration:.2s}datium-container._id datium-span-label.datium-top:after{opacity:1}datium-container._id datium-span-label datium-variable{color:_primary;font-size:14pt;padding:0 4px;margin:0 2px;top:-2px;position:relative}datium-container._id datium-span-label datium-variable:before{content:'';position:absolute;left:0;top:0;right:0;bottom:0;border-radius:5px;background-color:_primary_text;z-index:-1;opacity:.7}datium-container._id datium-span-label datium-lower{text-transform:lowercase}datium-container._id datium-next,datium-container._id datium-prev{position:absolute;width:40px;top:0;bottom:0;transform-origin:20px 52px}datium-container._id datium-next:after,datium-container._id datium-next:before,datium-container._id datium-prev:after,datium-container._id datium-prev:before{content:'';position:absolute;display:block;width:3px;height:8px;left:50%;background-color:_primary_text;top:48px}datium-container._id datium-next.datium-active,datium-container._id datium-prev.datium-active{transform:scale(.9);opacity:.9}datium-container._id datium-prev{left:0}datium-container._id datium-prev:after,datium-container._id datium-prev:before{margin-left:-3px}datium-container._id datium-next{right:0}datium-container._id datium-prev:before{transform:rotate(45deg) translateY(-2.6px)}datium-container._id datium-prev:after{transform:rotate(-45deg) translateY(2.6px)}datium-container._id datium-next:before{transform:rotate(45deg) translateY(2.6px)}datium-container._id datium-next:after{transform:rotate(-45deg) translateY(-2.6px)}datium-container._id{display:block;position:absolute;width:280px;font-family:Roboto,Arial;margin-top:2px;font-size:16px}datium-container._id,datium-container._id *{-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;-webkit-tap-highlight-color:transparent;cursor:default}datium-container._id datium-bubble{position:absolute;width:50px;line-height:26px;text-align:center;font-size:14px;background-color:_secondary_accent;font-weight:700;border-radius:3px;margin-left:-25px;margin-top:-32px;color:_secondary;z-index:1;transform-origin:30px 36px;transition-delay:0;transform:scale(.5);opacity:0}datium-container._id datium-bubble:after{content:'';position:absolute;display:block;width:10px;height:10px;transform:rotate(45deg);background:linear-gradient(135deg,rgba(0,0,0,0) 50%,_secondary_accent 50%);left:50%;top:20px;margin-left:-5px}datium-container._id datium-bubble.datium-bubble-visible{transform:scale(1);opacity:1;transition-delay:.2s}datium-container._id datium-bubble:not(.datium-bubble-visible){opacity:0!important}datium-container._id datium-bubble.datium-bubble-inactive{opacity:.5}datium-container._id datium-picker-container-wrapper{overflow:hidden;position:absolute;left:-7px;right:-7px;top:80px;height:270px;display:block;pointer-events:none}datium-container._id datium-picker-container{position:relative;height:260px;background-color:_secondary;display:block;margin:0 7px 7px;padding-top:20px;transform:translateY(-270px);pointer-events:auto;border-bottom-right-radius:3px;border-bottom-left-radius:3px;transition:all ease .4s;transition-delay:.1s}datium-container._id datium-picker{position:absolute;left:0;right:0;bottom:0;color:_secondary_text;transition:all ease .4s}datium-container._id datium-picker.datium-picker-left{transform:translateX(-100%) scale(1);pointer-events:none;transition-delay:0s}datium-container._id datium-picker.datium-picker-right{transform:translateX(100%) scale(1);pointer-events:none;transition-delay:0s}datium-container._id datium-picker.datium-picker-out{transform:translateX(0) scale(1.4);opacity:0;pointer-events:none;transition-delay:0s}datium-container._id datium-picker.datium-picker-in{transform:translateX(0) scale(.6);opacity:0;pointer-events:none;transition-delay:0s}datium-container._id datium-month-element,datium-container._id datium-year-element{display:inline-block;width:25%;line-height:60px;text-align:center;position:relative;transition:.2s ease all}datium-container._id datium-month-element.datium-selected:after,datium-container._id datium-year-element.datium-selected:after{content:'';position:absolute;left:20px;right:20px;top:50%;margin-top:11px;height:2px;display:block;background-color:_secondary_accent}datium-container._id datium-month-element.datium-active,datium-container._id datium-year-element.datium-active{transform:scale(.9);transition:none}datium-container._id datium-month-element:not([datium-data]),datium-container._id datium-year-element:not([datium-data]){opacity:.4;pointer-events:none}datium-container._id datium-month-element.datium-selected:after{left:25px;right:25px}datium-container._id datium-date-header{display:inline-block;width:40px;line-height:28px;opacity:.6;font-weight:700;text-align:center}datium-container._id datium-date-element{display:inline-block;width:40px;line-height:36px;text-align:center;position:relative;transition:.2s ease all}datium-container._id datium-date-element.datium-selected:after{content:'';position:absolute;left:12px;right:12px;top:50%;margin-top:10px;height:2px;display:block;background-color:_secondary_accent}datium-container._id datium-date-element.datium-active{transform:scale(.9);transition:none}datium-container._id datium-date-element:not([datium-data]){opacity:.4;pointer-events:none}datium-container._id datium-picker.datium-hour-picker,datium-container._id datium-picker.datium-minute-picker,datium-container._id datium-picker.datium-second-picker{height:240px}datium-container._id datium-picker.datium-hour-picker:before,datium-container._id datium-picker.datium-minute-picker:before,datium-container._id datium-picker.datium-second-picker:before{content:'';width:140px;height:140px;position:absolute;border:1px solid;left:50%;top:50%;margin-left:-71px;margin-top:-71px;border-radius:70px;opacity:.5}datium-container._id datium-picker.datium-hour-picker:after,datium-container._id datium-picker.datium-minute-picker:after,datium-container._id datium-picker.datium-second-picker:after{content:'';width:4px;height:4px;margin-left:-4px;margin-top:-4px;top:50%;left:50%;border-radius:4px;position:absolute;border:2px solid;border-color:_secondary_accent;background-color:_secondary;box-shadow:0 0 0 2px _secondary}datium-container._id datium-tick{position:absolute;left:50%;top:50%;width:2px;height:70px;margin-left:-1px;transform-origin:1px 0}datium-container._id datium-tick:after{content:'';position:absolute;width:2px;height:6px;background-color:_secondary_text;bottom:-4px;opacity:.5}datium-container._id datium-meridiem-switcher{position:absolute;left:50%;margin-left:-30px;top:50%;margin-top:15px;display:block;width:60px;height:40px}datium-container._id datium-meridiem-switcher:after,datium-container._id datium-meridiem-switcher:before{position:absolute;width:30px;top:0;display:block;line-height:40px;font-weight:700;text-align:center;font-size:14px;transform:scale(.9);opacity:.9;color:_secondary_text;transition:all ease .2s}datium-container._id datium-meridiem-switcher.datium-military-time:before{content:'-12'}datium-container._id datium-meridiem-switcher.datium-military-time:after{content:'+12'}datium-container._id datium-meridiem-switcher:before{content:'AM';left:0}datium-container._id datium-meridiem-switcher:after{content:'PM';right:0}datium-container._id datium-meridiem-switcher.datium-am-selected:before,datium-container._id datium-meridiem-switcher.datium-pm-selected:after{transform:scale(1);color:_secondary_accent;opacity:1}datium-container._id datium-meridiem-switcher.datium-active:after,datium-container._id datium-meridiem-switcher.datium-active:before{transition:none}datium-container._id datium-meridiem-switcher.datium-active.datium-am-selected:before{transform:scale(.9)}datium-container._id datium-meridiem-switcher.datium-active.datium-am-selected:after,datium-container._id datium-meridiem-switcher.datium-active.datium-pm-selected:before{transform:scale(.8)}datium-container._id datium-meridiem-switcher.datium-active.datium-pm-selected:after{transform:scale(.9)}datium-container._id datium-tick-label-container{position:absolute;bottom:-50px;left:-24px;display:block;height:50px;width:50px}datium-container._id datium-tick-label{position:absolute;left:0;top:0;display:block;width:100%;line-height:50px;border-radius:25px;text-align:center;font-size:14px;transition:.2s ease all}datium-container._id datium-tick-label.datium-active{transform:scale(.9);transition:none}datium-container._id datium-tick-label.datium-inactive{opacity:.4;pointer-events:none}datium-container._id datium-picker.datium-hour-picker.datium-dragging datium-hour-hand,datium-container._id datium-picker.datium-hour-picker.datium-dragging datium-minute-hand,datium-container._id datium-picker.datium-hour-picker.datium-dragging datium-second-hand,datium-container._id datium-picker.datium-hour-picker.datium-dragging datium-time-drag-arm,datium-container._id datium-picker.datium-minute-picker.datium-dragging datium-hour-hand,datium-container._id datium-picker.datium-minute-picker.datium-dragging datium-minute-hand,datium-container._id datium-picker.datium-minute-picker.datium-dragging datium-second-hand,datium-container._id datium-picker.datium-minute-picker.datium-dragging datium-time-drag-arm,datium-container._id datium-picker.datium-second-picker.datium-dragging datium-hour-hand,datium-container._id datium-picker.datium-second-picker.datium-dragging datium-minute-hand,datium-container._id datium-picker.datium-second-picker.datium-dragging datium-second-hand,datium-container._id datium-picker.datium-second-picker.datium-dragging datium-time-drag-arm{transition:none}datium-container._id datium-hour-hand,datium-container._id datium-minute-hand,datium-container._id datium-second-hand{position:absolute;display:block;width:0;height:0;left:50%;top:50%;transform-origin:3px 3px;margin-left:-3px;margin-top:-3px;border-left:3px solid transparent;border-right:3px solid transparent;border-top-left-radius:3px;border-top-right-radius:3px;transition:.3s ease all}datium-container._id datium-picker.datium-minute-picker datium-hour-hand,datium-container._id datium-picker.datium-second-picker datium-hour-hand,datium-container._id datium-picker.datium-second-picker datium-minute-hand{border-top-color:_secondary_text;opacity:.5}datium-container._id datium-hour-hand{border-top:30px solid _secondary_accent}datium-container._id datium-minute-hand{transform-origin:2px 2px;margin-left:-2px;margin-top:-2px;border-left:2px solid transparent;border-right:2px solid transparent;border-top-left-radius:2px;border-top-right-radius:2px;border-top:40px solid _secondary_accent}datium-container._id datium-second-hand{transform-origin:1px 1px;margin-left:-1px;margin-top:-1px;border-left:1px solid transparent;border-right:1px solid transparent;border-top-left-radius:1px;border-top-right-radius:1px;border-top:50px solid _secondary_accent}datium-container._id datium-time-drag-arm{width:2px;height:70px;position:absolute;left:50%;top:50%;margin-left:-1px;transform-origin:1px 0;transform:rotate(45deg);transition:.3s ease all}datium-container._id datium-time-drag-arm:after,datium-container._id datium-time-drag-arm:before{content:'';border:4px solid transparent;position:absolute;bottom:-4px;left:12px;border-left-color:_secondary_accent;transform-origin:-11px 4px}datium-container._id datium-time-drag-arm:after{transform:rotate(180deg)}datium-container._id datium-time-drag{display:block;position:absolute;width:50px;height:50px;top:100%;margin-top:-25px;margin-left:-24px;border-radius:25px}datium-container._id datium-time-drag:after{content:'';width:10px;height:10px;position:absolute;left:50%;top:50%;margin-left:-7px;margin-top:-7px;background-color:_secondary_accent;border:2px solid;border-color:_secondary;box-shadow:0 0 0 2px _secondary_accent;border-radius:10px}datium-container._id datium-time-drag.datium-active:after{width:8px;height:8px;border:3px solid;border-color:_secondary}";
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRhdGl1bS50cyIsIkRhdGl1bUludGVybmFscy50cyIsIk9wdGlvblNhbml0aXplci50cyIsImNvbW1vbi9Db21tb24udHMiLCJjb21tb24vQ3VzdG9tRXZlbnRQb2x5ZmlsbC50cyIsImNvbW1vbi9FdmVudHMudHMiLCJpbnB1dC9EYXRlUGFydHMudHMiLCJpbnB1dC9JbnB1dC50cyIsImlucHV0L0tleWJvYXJkRXZlbnRIYW5kbGVyLnRzIiwiaW5wdXQvTW91c2VFdmVudEhhbmRsZXIudHMiLCJpbnB1dC9QYXJzZXIudHMiLCJpbnB1dC9QYXN0ZUV2ZW50SGFuZGxlci50cyIsInBpY2tlci9IZWFkZXIudHMiLCJwaWNrZXIvUGlja2VyTWFuYWdlci50cyIsInBpY2tlci9odG1sL2hlYWRlci50cyIsInBpY2tlci9waWNrZXJzL1BpY2tlci50cyIsInBpY2tlci9waWNrZXJzL0RhdGVQaWNrZXIudHMiLCJwaWNrZXIvcGlja2Vycy9UaW1lUGlja2VyLnRzIiwicGlja2VyL3BpY2tlcnMvSG91clBpY2tlci50cyIsInBpY2tlci9waWNrZXJzL01pbnV0ZVBpY2tlci50cyIsInBpY2tlci9waWNrZXJzL01vbnRoUGlja2VyLnRzIiwicGlja2VyL3BpY2tlcnMvU2Vjb25kUGlja2VyLnRzIiwicGlja2VyL3BpY2tlcnMvWWVhclBpY2tlci50cyIsInBpY2tlci9zdHlsZXMvY3NzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQU0sTUFBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHO0lBRXRCLGdCQUFZLE9BQXdCLEVBQUUsT0FBZ0I7UUFDbEQsSUFBSSxTQUFTLEdBQUcsSUFBSSxlQUFlLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxVQUFDLE9BQWdCLElBQUssT0FBQSxTQUFTLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFoQyxDQUFnQyxDQUFDO0lBQ25GLENBQUM7SUFDTCxh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LENBQUMsQ0FBQztRQUU1RCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzVDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDdEQsQ0FBQztRQUVELElBQUksUUFBUSxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUU1QyxJQUFJLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUM7UUFFdEQsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRTNDLEdBQUcsQ0FBQztZQUVBLElBQUksV0FBVyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMscUJBQXFCLENBQUMsQ0FBQztZQUVoRSxXQUFXLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUUxRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JDLFdBQVcsQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1lBQ3BFLENBQUM7WUFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUVyQyxRQUFRLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNyRCxDQUFDLFFBQVEsUUFBUSxDQUFDLE9BQU8sRUFBRSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUU7UUFFbkQsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBRWQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVNLG9DQUFlLEdBQXRCLFVBQXVCLFlBQWlCO1FBQ3BDLEVBQUUsQ0FBQyxDQUFDLFlBQVksS0FBSyxLQUFLLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQztRQUNwQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBRXJELElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUNoRixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUMzQyxJQUFJLEVBQUUsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlCLElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUNwRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEtBQUssWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDcEQsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUN4QyxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUMzQyxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFFTSw4QkFBUyxHQUFoQjtRQUNJLE1BQU0sQ0FBQyxHQUFHLENBQUM7SUFDZixDQUFDO0lBRU0sNkJBQVEsR0FBZjtRQUNJLE1BQU0sQ0FBQyxZQUFVLENBQUM7SUFDdEIsQ0FBQztJQUNMLGlCQUFDO0FBQUQsQ0F0RkEsQUFzRkMsQ0F0RndCLE1BQU0sR0FzRjlCO0FDeEZELElBQUksR0FBRyxHQUFDLDZoY0FBNmhjLENBQUMiLCJmaWxlIjoiZGF0aXVtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKDxhbnk+d2luZG93KVsnRGF0aXVtJ10gPSBjbGFzcyBEYXRpdW0ge1xyXG4gICAgcHVibGljIHVwZGF0ZU9wdGlvbnM6KG9wdGlvbnM6SU9wdGlvbnMpID0+IHZvaWQ7XHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OkhUTUxJbnB1dEVsZW1lbnQsIG9wdGlvbnM6SU9wdGlvbnMpIHtcclxuICAgICAgICBsZXQgaW50ZXJuYWxzID0gbmV3IERhdGl1bUludGVybmFscyhlbGVtZW50LCBvcHRpb25zKTtcclxuICAgICAgICB0aGlzWyd1cGRhdGVPcHRpb25zJ10gPSAob3B0aW9uczpJT3B0aW9ucykgPT4gaW50ZXJuYWxzLnVwZGF0ZU9wdGlvbnMob3B0aW9ucyk7XHJcbiAgICB9XHJcbn0iLCJjb25zdCBlbnVtIExldmVsIHtcclxuICAgIFlFQVIsIE1PTlRILCBEQVRFLCBIT1VSLFxyXG4gICAgTUlOVVRFLCBTRUNPTkQsIE5PTkVcclxufVxyXG5cclxuY2xhc3MgRGF0aXVtSW50ZXJuYWxzIHtcclxuICAgIHByaXZhdGUgb3B0aW9uczpJT3B0aW9ucyA9IDxhbnk+e307XHJcbiAgICBcclxuICAgIHByaXZhdGUgaW5wdXQ6SW5wdXQ7XHJcbiAgICAvL3ByaXZhdGUgcGlja2VyTWFuYWdlcjpQaWNrZXJNYW5hZ2VyO1xyXG4gICAgXHJcbiAgICBwcml2YXRlIGxldmVsczpMZXZlbFtdO1xyXG4gICAgcHJpdmF0ZSBkYXRlOkRhdGU7XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgZWxlbWVudDpIVE1MSW5wdXRFbGVtZW50LCBvcHRpb25zOklPcHRpb25zKSB7XHJcbiAgICAgICAgaWYgKGVsZW1lbnQgPT09IHZvaWQgMCkgdGhyb3cgJ2VsZW1lbnQgaXMgcmVxdWlyZWQnO1xyXG4gICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdzcGVsbGNoZWNrJywgJ2ZhbHNlJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5pbnB1dCA9IG5ldyBJbnB1dChlbGVtZW50KTtcclxuICAgICAgICAvL3RoaXMucGlja2VyTWFuYWdlciA9IG5ldyBQaWNrZXJNYW5hZ2VyKGVsZW1lbnQpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMudXBkYXRlT3B0aW9ucyhvcHRpb25zKTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4uZ290byhlbGVtZW50LCAoZSkgPT4gdGhpcy5nb3RvKGUuZGF0ZSwgZS5sZXZlbCwgZS51cGRhdGUpKTtcclxuICAgICAgICBsaXN0ZW4uem9vbU91dChlbGVtZW50LCAoZSkgPT4gdGhpcy56b29tT3V0KGUuZGF0ZSwgZS5jdXJyZW50TGV2ZWwsIGUudXBkYXRlKSk7XHJcbiAgICAgICAgbGlzdGVuLnpvb21JbihlbGVtZW50LCAoZSkgPT4gdGhpcy56b29tSW4oZS5kYXRlLCBlLmN1cnJlbnRMZXZlbCwgZS51cGRhdGUpKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBUT0RPIG1ha2Ugc3VyZSBpbml0aWFsIGdvdG8gaXMgYSB2YWxpZCBkYXRlLi4uXHJcbiAgICAgICAgLy8gdGhpcy5nb3RvKHRoaXMub3B0aW9uc1snZGVmYXVsdERhdGUnXSwgTGV2ZWwuTk9ORSwgdHJ1ZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB6b29tT3V0KGRhdGU6RGF0ZSwgY3VycmVudExldmVsOkxldmVsLCB1cGRhdGU6Ym9vbGVhbiA9IHRydWUpIHtcclxuICAgICAgICBsZXQgbmV3TGV2ZWw6TGV2ZWwgPSB0aGlzLmxldmVsc1t0aGlzLmxldmVscy5pbmRleE9mKGN1cnJlbnRMZXZlbCkgLSAxXTsgXHJcbiAgICAgICAgaWYgKG5ld0xldmVsID09PSB2b2lkIDApIHJldHVybjtcclxuICAgICAgICB0cmlnZ2VyLmdvdG8odGhpcy5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgZGF0ZTogZGF0ZSxcclxuICAgICAgICAgICBsZXZlbDogbmV3TGV2ZWwsXHJcbiAgICAgICAgICAgdXBkYXRlOiB1cGRhdGUgXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB6b29tSW4oZGF0ZTpEYXRlLCBjdXJyZW50TGV2ZWw6TGV2ZWwsIHVwZGF0ZTpib29sZWFuID0gdHJ1ZSkge1xyXG4gICAgICAgIGxldCBuZXdMZXZlbDpMZXZlbCA9IHRoaXMubGV2ZWxzW3RoaXMubGV2ZWxzLmluZGV4T2YoY3VycmVudExldmVsKSArIDFdO1xyXG4gICAgICAgIGlmIChuZXdMZXZlbCA9PT0gdm9pZCAwKSBuZXdMZXZlbCA9IGN1cnJlbnRMZXZlbDtcclxuICAgICAgICB0cmlnZ2VyLmdvdG8odGhpcy5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgZGF0ZTogZGF0ZSxcclxuICAgICAgICAgICBsZXZlbDogbmV3TGV2ZWwsXHJcbiAgICAgICAgICAgdXBkYXRlOiB1cGRhdGUgXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnb3RvKGRhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWwsIHVwZGF0ZTpib29sZWFuID0gdHJ1ZSkge1xyXG4gICAgICAgIGlmIChkYXRlICE9PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgaWYgKGRhdGUudmFsdWVPZigpIDwgdGhpcy5vcHRpb25zLm1pbkRhdGUudmFsdWVPZigpKSB7XHJcbiAgICAgICAgICAgICAgICBkYXRlID0gbmV3IERhdGUodGhpcy5vcHRpb25zLm1pbkRhdGUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKGRhdGUudmFsdWVPZigpID4gdGhpcy5vcHRpb25zLm1heERhdGUudmFsdWVPZigpKSB7XHJcbiAgICAgICAgICAgICAgICBkYXRlID0gbmV3IERhdGUodGhpcy5vcHRpb25zLm1heERhdGUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZiAoZGF0ZSA9PT0gdm9pZCAwICYmIHVwZGF0ZSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUoKTtcclxuICAgICAgICAgICAgbGV2ZWwgPSB0aGlzLmlucHV0LmdldExldmVscygpLnNsaWNlKCkuc29ydCgpWzBdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZSA9IGRhdGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRyaWdnZXIudmlld2NoYW5nZWQodGhpcy5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgIGRhdGU6IHRoaXMuZGF0ZSxcclxuICAgICAgICAgICAgbGV2ZWw6IGxldmVsLFxyXG4gICAgICAgICAgICB1cGRhdGU6IHVwZGF0ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdXBkYXRlT3B0aW9ucyhuZXdPcHRpb25zOklPcHRpb25zID0gPGFueT57fSkge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZShuZXdPcHRpb25zLCB0aGlzLm9wdGlvbnMpOyAgICAgICAgXHJcbiAgICAgICAgdGhpcy5pbnB1dC51cGRhdGVPcHRpb25zKHRoaXMub3B0aW9ucyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5sZXZlbHMgPSB0aGlzLmlucHV0LmdldExldmVscygpLnNsaWNlKCk7XHJcbiAgICAgICAgdGhpcy5sZXZlbHMuc29ydCgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgaWYgKHRoaXMucGlja2VyTWFuYWdlci5jdXJyZW50UGlja2VyICE9PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgbGV0IGN1ckxldmVsID0gdGhpcy5waWNrZXJNYW5hZ2VyLmN1cnJlbnRQaWNrZXIuZ2V0TGV2ZWwoKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmxldmVscy5pbmRleE9mKGN1ckxldmVsKSA9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgdHJpZ2dlci5nb3RvKHRoaXMuZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGU6IHRoaXMuZGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICBsZXZlbDogdGhpcy5sZXZlbHNbMF1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5waWNrZXJNYW5hZ2VyLnVwZGF0ZU9wdGlvbnModGhpcy5vcHRpb25zKTtcclxuICAgICAgICAqL1xyXG4gICAgfVxyXG59IiwiZnVuY3Rpb24gT3B0aW9uRXhjZXB0aW9uKG1zZzpzdHJpbmcpIHtcclxuICAgIHJldHVybiBgW0RhdGl1bSBPcHRpb24gRXhjZXB0aW9uXVxcbiAgJHttc2d9XFxuICBTZWUgaHR0cDovL2RhdGl1bS5pby9kb2N1bWVudGF0aW9uIGZvciBkb2N1bWVudGF0aW9uLmA7XHJcbn1cclxuXHJcbmNsYXNzIE9wdGlvblNhbml0aXplciB7XHJcbiAgICBcclxuICAgIHN0YXRpYyBkZmx0RGF0ZTpEYXRlID0gbmV3IERhdGUoKTtcclxuICAgIFxyXG4gICAgc3RhdGljIHNhbml0aXplRGlzcGxheUFzKGRpc3BsYXlBczphbnksIGRmbHQ6c3RyaW5nID0gJ2g6bW1hIE1NTSBELCBZWVlZJykge1xyXG4gICAgICAgIGlmIChkaXNwbGF5QXMgPT09IHZvaWQgMCkgcmV0dXJuIGRmbHQ7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBkaXNwbGF5QXMgIT09ICdzdHJpbmcnKSB0aHJvdyBPcHRpb25FeGNlcHRpb24oJ1RoZSBcImRpc3BsYXlBc1wiIG9wdGlvbiBtdXN0IGJlIGEgc3RyaW5nJyk7XHJcbiAgICAgICAgcmV0dXJuIGRpc3BsYXlBcztcclxuICAgIH1cclxuICAgIFxyXG4gICAgc3RhdGljIHNhbml0aXplTWluRGF0ZShtaW5EYXRlOmFueSwgZGZsdDpEYXRlID0gbmV3IERhdGUoLTg2NDAwMDAwMDAwMDAwMDApKSB7XHJcbiAgICAgICAgaWYgKG1pbkRhdGUgPT09IHZvaWQgMCkgcmV0dXJuIGRmbHQ7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKG1pbkRhdGUpOyAvL1RPRE8gZmlndXJlIHRoaXMgb3V0IHllc1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdGF0aWMgc2FuaXRpemVNYXhEYXRlKG1heERhdGU6YW55LCBkZmx0OkRhdGUgPSBuZXcgRGF0ZSg4NjQwMDAwMDAwMDAwMDAwKSkge1xyXG4gICAgICAgIGlmIChtYXhEYXRlID09PSB2b2lkIDApIHJldHVybiBkZmx0O1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShtYXhEYXRlKTsgLy9UT0RPIGZpZ3VyZSB0aGlzIG91dCBcclxuICAgIH1cclxuICAgIFxyXG4gICAgc3RhdGljIHNhbml0aXplRGVmYXVsdERhdGUoZGVmYXVsdERhdGU6YW55LCBkZmx0OkRhdGUgPSB0aGlzLmRmbHREYXRlKSB7XHJcbiAgICAgICAgaWYgKGRlZmF1bHREYXRlID09PSB2b2lkIDApIHJldHVybiBkZmx0O1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShkZWZhdWx0RGF0ZSk7IC8vVE9ETyBmaWd1cmUgdGhpcyBvdXRcclxuICAgIH1cclxuICAgICAgICBcclxuICAgIHN0YXRpYyBzYW5pdGl6ZUNvbG9yKGNvbG9yOmFueSkge1xyXG4gICAgICAgIGxldCB0aHJlZUhleCA9ICdcXFxccyojW0EtRmEtZjAtOV17M31cXFxccyonO1xyXG4gICAgICAgIGxldCBzaXhIZXggPSAnXFxcXHMqI1tBLUZhLWYwLTldezZ9XFxcXHMqJztcclxuICAgICAgICBsZXQgcmdiID0gJ1xcXFxzKnJnYlxcXFwoXFxcXHMqWzAtOV17MSwzfVxcXFxzKixcXFxccypbMC05XXsxLDN9XFxcXHMqLFxcXFxzKlswLTldezEsM31cXFxccypcXFxcKVxcXFxzKic7XHJcbiAgICAgICAgbGV0IHJnYmEgPSAnXFxcXHMqcmdiYVxcXFwoXFxcXHMqWzAtOV17MSwzfVxcXFxzKixcXFxccypbMC05XXsxLDN9XFxcXHMqLFxcXFxzKlswLTldezEsM31cXFxccypcXFxcLFxcXFxzKlswLTldKlxcXFwuWzAtOV0rXFxcXHMqXFxcXClcXFxccyonO1xyXG4gICAgICAgIGxldCBzYW5pdGl6ZUNvbG9yUmVnZXggPSBuZXcgUmVnRXhwKGBeKCgke3RocmVlSGV4fSl8KCR7c2l4SGV4fSl8KCR7cmdifSl8KCR7cmdiYX0pKSRgKTtcclxuXHJcbiAgICAgICAgaWYgKGNvbG9yID09PSB2b2lkIDApIHRocm93IE9wdGlvbkV4Y2VwdGlvbihcIkFsbCB0aGVtZSBjb2xvcnMgKHByaW1hcnksIHByaW1hcnlfdGV4dCwgc2Vjb25kYXJ5LCBzZWNvbmRhcnlfdGV4dCwgc2Vjb25kYXJ5X2FjY2VudCkgbXVzdCBiZSBkZWZpbmVkXCIpO1xyXG4gICAgICAgIGlmICghc2FuaXRpemVDb2xvclJlZ2V4LnRlc3QoY29sb3IpKSB0aHJvdyBPcHRpb25FeGNlcHRpb24oXCJBbGwgdGhlbWUgY29sb3JzIG11c3QgYmUgdmFsaWQgcmdiLCByZ2JhLCBvciBoZXggY29kZVwiKTtcclxuICAgICAgICByZXR1cm4gPHN0cmluZz5jb2xvcjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgc3RhdGljIHNhbml0aXplVGhlbWUodGhlbWU6YW55LCBkZmx0OmFueSA9IFwibWF0ZXJpYWxcIik6SVRoZW1lIHtcclxuICAgICAgICBpZiAodGhlbWUgPT09IHZvaWQgMCkgcmV0dXJuIE9wdGlvblNhbml0aXplci5zYW5pdGl6ZVRoZW1lKGRmbHQsIHZvaWQgMCk7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGVtZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgc3dpdGNoKHRoZW1lKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ2xpZ2h0JzpcclxuICAgICAgICAgICAgICAgIHJldHVybiA8SVRoZW1lPntcclxuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5OiAnI2VlZScsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeV90ZXh0OiAnIzY2NicsXHJcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5OiAnI2ZmZicsXHJcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5X3RleHQ6ICcjNjY2JyxcclxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnlfYWNjZW50OiAnIzY2NidcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSAnZGFyayc6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gPElUaGVtZT57XHJcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeTogJyM0NDQnLFxyXG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnlfdGV4dDogJyNlZWUnLFxyXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeTogJyMzMzMnLFxyXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeV90ZXh0OiAnI2VlZScsXHJcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5X2FjY2VudDogJyNmZmYnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgJ21hdGVyaWFsJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiA8SVRoZW1lPntcclxuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5OiAnIzAxOTU4NycsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeV90ZXh0OiAnI2ZmZicsXHJcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5OiAnI2ZmZicsXHJcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5X3RleHQ6ICcjODg4JyxcclxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnlfYWNjZW50OiAnIzAxOTU4NydcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHRocm93IFwiTmFtZSBvZiB0aGVtZSBub3QgdmFsaWQuXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGVtZSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDxJVGhlbWU+IHtcclxuICAgICAgICAgICAgICAgIHByaW1hcnk6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZUNvbG9yKHRoZW1lWydwcmltYXJ5J10pLFxyXG4gICAgICAgICAgICAgICAgc2Vjb25kYXJ5OiBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVDb2xvcih0aGVtZVsnc2Vjb25kYXJ5J10pLFxyXG4gICAgICAgICAgICAgICAgcHJpbWFyeV90ZXh0OiBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVDb2xvcih0aGVtZVsncHJpbWFyeV90ZXh0J10pLFxyXG4gICAgICAgICAgICAgICAgc2Vjb25kYXJ5X3RleHQ6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZUNvbG9yKHRoZW1lWydzZWNvbmRhcnlfdGV4dCddKSxcclxuICAgICAgICAgICAgICAgIHNlY29uZGFyeV9hY2NlbnQ6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZUNvbG9yKHRoZW1lWydzZWNvbmRhcnlfYWNjZW50J10pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBPcHRpb25FeGNlcHRpb24oJ1RoZSBcInRoZW1lXCIgb3B0aW9uIG11c3QgYmUgb2JqZWN0IG9yIHN0cmluZycpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgc3RhdGljIHNhbml0aXplSXNTZWNvbmRWYWxpZChpc1NlY29uZFNlbGVjdGFibGU6YW55LCBkZmx0OmFueSA9IChkYXRlOkRhdGUpID0+IHRydWUpIHtcclxuICAgICAgICByZXR1cm4gZGZsdDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgc3RhdGljIHNhbml0aXplSXNNaW51dGVWYWxpZChpc01pbnV0ZVNlbGVjdGFibGU6YW55LCBkZmx0OmFueSA9IChkYXRlOkRhdGUpID0+IHRydWUpIHtcclxuICAgICAgICByZXR1cm4gKGRhdGU6RGF0ZSkgPT4gZGF0ZS5nZXRNaW51dGVzKCkgJSAxNSA9PT0gMDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgc3RhdGljIHNhbml0aXplSXNIb3VyVmFsaWQoaXNIb3VyU2VsZWN0YWJsZTphbnksIGRmbHQ6YW55ID0gKGRhdGU6RGF0ZSkgPT4gdHJ1ZSkge1xyXG4gICAgICAgIHJldHVybiBkZmx0O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdGF0aWMgc2FuaXRpemVJc0RhdGVWYWxpZChpc0RhdGVTZWxlY3RhYmxlOmFueSwgZGZsdDphbnkgPSAoZGF0ZTpEYXRlKSA9PiB0cnVlKSB7XHJcbiAgICAgICAgcmV0dXJuIChkYXRlOkRhdGUpID0+IGRhdGUuZ2V0RGF5KCkgIT09IDAgJiYgZGF0ZS5nZXREYXkoKSAhPT0gNjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgc3RhdGljIHNhbml0aXplSXNNb250aFZhbGlkKGlzTW9udGhTZWxlY3RhYmxlOmFueSwgZGZsdDphbnkgPSAoZGF0ZTpEYXRlKSA9PiB0cnVlKSB7XHJcbiAgICAgICAgcmV0dXJuIGRmbHQ7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN0YXRpYyBzYW5pdGl6ZUlzWWVhclZhbGlkKGlzWWVhclNlbGVjdGFibGU6YW55LCBkZmx0OmFueSA9IChkYXRlOkRhdGUpID0+IHRydWUpIHtcclxuICAgICAgICByZXR1cm4gZGZsdDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgc3RhdGljIHNhbml0aXplTWlsaXRhcnlUaW1lKG1pbGl0YXJ5VGltZTphbnksIGRmbHQ6Ym9vbGVhbiA9IGZhbHNlKSB7XHJcbiAgICAgICAgaWYgKG1pbGl0YXJ5VGltZSA9PT0gdm9pZCAwKSByZXR1cm4gZGZsdDtcclxuICAgICAgICBpZiAodHlwZW9mIG1pbGl0YXJ5VGltZSAhPT0gJ2Jvb2xlYW4nKSB7XHJcbiAgICAgICAgICAgIHRocm93IE9wdGlvbkV4Y2VwdGlvbignVGhlIFwibWlsaXRhcnlUaW1lXCIgb3B0aW9uIG11c3QgYmUgYSBib29sZWFuJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiA8Ym9vbGVhbj5taWxpdGFyeVRpbWU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN0YXRpYyBzYW5pdGl6ZShvcHRpb25zOklPcHRpb25zLCBkZWZhdWx0czpJT3B0aW9ucykge1xyXG4gICAgICAgIGxldCBtaW5EYXRlID0gT3B0aW9uU2FuaXRpemVyLnNhbml0aXplTWluRGF0ZShvcHRpb25zWydtaW5EYXRlJ10sIGRlZmF1bHRzLm1pbkRhdGUpO1xyXG4gICAgICAgIGxldCBtYXhEYXRlID0gT3B0aW9uU2FuaXRpemVyLnNhbml0aXplTWF4RGF0ZShvcHRpb25zWydtYXhEYXRlJ10sIGRlZmF1bHRzLm1heERhdGUpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBvcHRzOklPcHRpb25zID0ge1xyXG4gICAgICAgICAgICBkaXNwbGF5QXM6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZURpc3BsYXlBcyhvcHRpb25zWydkaXNwbGF5QXMnXSwgZGVmYXVsdHMuZGlzcGxheUFzKSxcclxuICAgICAgICAgICAgbWluRGF0ZTogbWluRGF0ZSxcclxuICAgICAgICAgICAgbWF4RGF0ZTogbWF4RGF0ZSxcclxuICAgICAgICAgICAgZGVmYXVsdERhdGU6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZURlZmF1bHREYXRlKG9wdGlvbnNbJ2RlZmF1bHREYXRlJ10sIGRlZmF1bHRzLmRlZmF1bHREYXRlKSxcclxuICAgICAgICAgICAgdGhlbWU6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZVRoZW1lKG9wdGlvbnNbJ3RoZW1lJ10sIGRlZmF1bHRzLnRoZW1lKSxcclxuICAgICAgICAgICAgbWlsaXRhcnlUaW1lOiBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVNaWxpdGFyeVRpbWUob3B0aW9uc1snbWlsaXRhcnlUaW1lJ10sIGRlZmF1bHRzLm1pbGl0YXJ5VGltZSksXHJcbiAgICAgICAgICAgIGlzU2Vjb25kVmFsaWQ6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZUlzU2Vjb25kVmFsaWQob3B0aW9uc1snaXNTZWNvbmRWYWxpZCddLCBkZWZhdWx0cy5pc1NlY29uZFZhbGlkKSxcclxuICAgICAgICAgICAgaXNNaW51dGVWYWxpZDogT3B0aW9uU2FuaXRpemVyLnNhbml0aXplSXNNaW51dGVWYWxpZChvcHRpb25zWydpc01pbnV0ZVZhbGlkJ10sIGRlZmF1bHRzLmlzTWludXRlVmFsaWQpLFxyXG4gICAgICAgICAgICBpc0hvdXJWYWxpZDogT3B0aW9uU2FuaXRpemVyLnNhbml0aXplSXNIb3VyVmFsaWQob3B0aW9uc1snaXNIb3VyVmFsaWQnXSwgZGVmYXVsdHMuaXNIb3VyVmFsaWQpLFxyXG4gICAgICAgICAgICBpc0RhdGVWYWxpZDogT3B0aW9uU2FuaXRpemVyLnNhbml0aXplSXNEYXRlVmFsaWQob3B0aW9uc1snaXNEYXRlVmFsaWQnXSwgZGVmYXVsdHMuaXNEYXRlVmFsaWQpLFxyXG4gICAgICAgICAgICBpc01vbnRoVmFsaWQ6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZUlzTW9udGhWYWxpZChvcHRpb25zWydpc01vbnRoVmFsaWQnXSwgZGVmYXVsdHMuaXNNb250aFZhbGlkKSxcclxuICAgICAgICAgICAgaXNZZWFyVmFsaWQ6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZUlzWWVhclZhbGlkKG9wdGlvbnNbJ2lzWWVhclZhbGlkJ10sIGRlZmF1bHRzLmlzWWVhclZhbGlkKVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gb3B0cztcclxuICAgIH1cclxufSIsImNsYXNzIENvbW1vbiB7XHJcbiAgICBwcm90ZWN0ZWQgZ2V0TW9udGhzKCkge1xyXG4gICAgICAgIHJldHVybiBbXCJKYW51YXJ5XCIsIFwiRmVicnVhcnlcIiwgXCJNYXJjaFwiLCBcIkFwcmlsXCIsIFwiTWF5XCIsIFwiSnVuZVwiLCBcIkp1bHlcIiwgXCJBdWd1c3RcIiwgXCJTZXB0ZW1iZXJcIiwgXCJPY3RvYmVyXCIsIFwiTm92ZW1iZXJcIiwgXCJEZWNlbWJlclwiXTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGdldFNob3J0TW9udGhzKCkge1xyXG4gICAgICAgIHJldHVybiBbXCJKYW5cIiwgXCJGZWJcIiwgXCJNYXJcIiwgXCJBcHJcIiwgXCJNYXlcIiwgXCJKdW5cIiwgXCJKdWxcIiwgXCJBdWdcIiwgXCJTZXBcIiwgXCJPY3RcIiwgXCJOb3ZcIiwgXCJEZWNcIl07XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBnZXREYXlzKCkge1xyXG4gICAgICAgIHJldHVybiBbXCJTdW5kYXlcIiwgXCJNb25kYXlcIiwgXCJUdWVzZGF5XCIsIFwiV2VkbmVzZGF5XCIsIFwiVGh1cnNkYXlcIiwgXCJGcmlkYXlcIiwgXCJTYXR1cmRheVwiXTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGdldFNob3J0RGF5cygpIHtcclxuICAgICAgICByZXR1cm4gW1wiU3VuXCIsIFwiTW9uXCIsIFwiVHVlXCIsIFwiV2VkXCIsIFwiVGh1XCIsIFwiRnJpXCIsIFwiU2F0XCJdO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgZGF5c0luTW9udGgoZGF0ZTpEYXRlKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpICsgMSwgMCkuZ2V0RGF0ZSgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgZ2V0SG91cnMoZGF0ZTpEYXRlKTpzdHJpbmcge1xyXG4gICAgICAgIGxldCBudW0gPSBkYXRlLmdldEhvdXJzKCk7XHJcbiAgICAgICAgaWYgKG51bSA9PT0gMCkgbnVtID0gMTI7XHJcbiAgICAgICAgaWYgKG51bSA+IDEyKSBudW0gLT0gMTI7XHJcbiAgICAgICAgcmV0dXJuIG51bS50b1N0cmluZygpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgZ2V0RGVjYWRlKGRhdGU6RGF0ZSk6c3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gYCR7TWF0aC5mbG9vcihkYXRlLmdldEZ1bGxZZWFyKCkvMTApKjEwfSAtICR7TWF0aC5jZWlsKChkYXRlLmdldEZ1bGxZZWFyKCkgKyAxKS8xMCkqMTB9YDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGdldE1lcmlkaWVtKGRhdGU6RGF0ZSk6c3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gZGF0ZS5nZXRIb3VycygpIDwgMTIgPyAnYW0nIDogJ3BtJztcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIHBhZChudW06bnVtYmVyfHN0cmluZywgc2l6ZTpudW1iZXIgPSAyKSB7XHJcbiAgICAgICAgbGV0IHN0ciA9IG51bS50b1N0cmluZygpO1xyXG4gICAgICAgIHdoaWxlKHN0ci5sZW5ndGggPCBzaXplKSBzdHIgPSAnMCcgKyBzdHI7XHJcbiAgICAgICAgcmV0dXJuIHN0cjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIHRyaW0oc3RyOnN0cmluZykge1xyXG4gICAgICAgIHdoaWxlIChzdHJbMF0gPT09ICcwJyAmJiBzdHIubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICBzdHIgPSBzdHIuc3Vic3RyKDEsIHN0ci5sZW5ndGgpOyAgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzdHI7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBnZXRDbGllbnRDb29yKGU6YW55KTp7eDpudW1iZXIsIHk6bnVtYmVyfSB7XHJcbiAgICAgICAgaWYgKGUuY2xpZW50WCAhPT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB4OiBlLmNsaWVudFgsXHJcbiAgICAgICAgICAgICAgICB5OiBlLmNsaWVudFlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB4OiBlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFgsXHJcbiAgICAgICAgICAgIHk6IGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIkN1c3RvbUV2ZW50ID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgZnVuY3Rpb24gdXNlTmF0aXZlICgpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBsZXQgY3VzdG9tRXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoJ2EnLCB7IGRldGFpbDogeyBiOiAnYicgfSB9KTtcclxuICAgICAgICAgICAgcmV0dXJuICAnYScgPT09IGN1c3RvbUV2ZW50LnR5cGUgJiYgJ2InID09PSBjdXN0b21FdmVudC5kZXRhaWwuYjtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgaWYgKHVzZU5hdGl2ZSgpKSB7XHJcbiAgICAgICAgcmV0dXJuIDxhbnk+Q3VzdG9tRXZlbnQ7XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkb2N1bWVudC5jcmVhdGVFdmVudCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIC8vIElFID49IDlcclxuICAgICAgICByZXR1cm4gPGFueT5mdW5jdGlvbih0eXBlOnN0cmluZywgcGFyYW1zOkN1c3RvbUV2ZW50SW5pdCkge1xyXG4gICAgICAgICAgICBsZXQgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdDdXN0b21FdmVudCcpO1xyXG4gICAgICAgICAgICBpZiAocGFyYW1zKSB7XHJcbiAgICAgICAgICAgICAgICBlLmluaXRDdXN0b21FdmVudCh0eXBlLCBwYXJhbXMuYnViYmxlcywgcGFyYW1zLmNhbmNlbGFibGUsIHBhcmFtcy5kZXRhaWwpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZS5pbml0Q3VzdG9tRXZlbnQodHlwZSwgZmFsc2UsIGZhbHNlLCB2b2lkIDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBlO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gSUUgPj0gOFxyXG4gICAgICAgIHJldHVybiA8YW55PmZ1bmN0aW9uKHR5cGU6c3RyaW5nLCBwYXJhbXM6Q3VzdG9tRXZlbnRJbml0KSB7XHJcbiAgICAgICAgICAgIGxldCBlID0gKDxhbnk+ZG9jdW1lbnQpLmNyZWF0ZUV2ZW50T2JqZWN0KCk7XHJcbiAgICAgICAgICAgIGUudHlwZSA9IHR5cGU7XHJcbiAgICAgICAgICAgIGlmIChwYXJhbXMpIHtcclxuICAgICAgICAgICAgICAgIGUuYnViYmxlcyA9IEJvb2xlYW4ocGFyYW1zLmJ1YmJsZXMpO1xyXG4gICAgICAgICAgICAgICAgZS5jYW5jZWxhYmxlID0gQm9vbGVhbihwYXJhbXMuY2FuY2VsYWJsZSk7XHJcbiAgICAgICAgICAgICAgICBlLmRldGFpbCA9IHBhcmFtcy5kZXRhaWw7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBlLmJ1YmJsZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGUuY2FuY2VsYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgZS5kZXRhaWwgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGU7XHJcbiAgICAgICAgfSBcclxuICAgIH0gIFxyXG59KSgpO1xyXG4iLCJpbnRlcmZhY2UgSUxpc3RlbmVyUmVmZXJlbmNlIHtcclxuICAgIGVsZW1lbnQ6IEVsZW1lbnR8RG9jdW1lbnR8V2luZG93O1xyXG4gICAgcmVmZXJlbmNlOiBFdmVudExpc3RlbmVyO1xyXG4gICAgZXZlbnQ6IHN0cmluZztcclxufVxyXG5cclxuaW50ZXJmYWNlIElEcmFnQ2FsbGJhY2tzIHtcclxuICAgIGRyYWdTdGFydD86KGU/Ok1vdXNlRXZlbnR8VG91Y2hFdmVudCkgPT4gdm9pZDtcclxuICAgIGRyYWdNb3ZlPzooZT86TW91c2VFdmVudHxUb3VjaEV2ZW50KSA9PiB2b2lkO1xyXG4gICAgZHJhZ0VuZD86KGU/Ok1vdXNlRXZlbnR8VG91Y2hFdmVudCkgPT4gdm9pZDtcclxufVxyXG5cclxubmFtZXNwYWNlIGxpc3RlbiB7XHJcbiAgICBsZXQgbWF0Y2hlcyA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5tYXRjaGVzIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5tc01hdGNoZXNTZWxlY3RvcjtcclxuICAgIFxyXG4gICAgZnVuY3Rpb24gaGFuZGxlRGVsZWdhdGVFdmVudChwYXJlbnQ6RWxlbWVudCwgZGVsZWdhdGVTZWxlY3RvcjpzdHJpbmcsIGNhbGxiYWNrOihlPzpNb3VzZUV2ZW50fFRvdWNoRXZlbnQpID0+IHZvaWQpIHtcclxuICAgICAgICByZXR1cm4gKGU6TW91c2VFdmVudHxUb3VjaEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSBlLnNyY0VsZW1lbnQgfHwgPEVsZW1lbnQ+ZS50YXJnZXQ7XHJcbiAgICAgICAgICAgIHdoaWxlKHRhcmdldCAhPT0gbnVsbCAmJiAhdGFyZ2V0LmlzRXF1YWxOb2RlKHBhcmVudCkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChtYXRjaGVzLmNhbGwodGFyZ2V0LCBkZWxlZ2F0ZVNlbGVjdG9yKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnRFbGVtZW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBmdW5jdGlvbiBhdHRhY2hFdmVudHNEZWxlZ2F0ZShldmVudHM6c3RyaW5nW10sIHBhcmVudDpFbGVtZW50LCBkZWxlZ2F0ZVNlbGVjdG9yOnN0cmluZywgY2FsbGJhY2s6KGU/Ok1vdXNlRXZlbnR8VG91Y2hFdmVudCkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xyXG4gICAgICAgIGxldCBsaXN0ZW5lcnM6SUxpc3RlbmVyUmVmZXJlbmNlW10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gZXZlbnRzKSB7XHJcbiAgICAgICAgICAgIGxldCBldmVudDpzdHJpbmcgPSBldmVudHNba2V5XTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBuZXdMaXN0ZW5lciA9IGhhbmRsZURlbGVnYXRlRXZlbnQocGFyZW50LCBkZWxlZ2F0ZVNlbGVjdG9yLCBjYWxsYmFjayk7XHJcbiAgICAgICAgICAgIGxpc3RlbmVycy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IHBhcmVudCxcclxuICAgICAgICAgICAgICAgIHJlZmVyZW5jZTogbmV3TGlzdGVuZXIsXHJcbiAgICAgICAgICAgICAgICBldmVudDogZXZlbnRcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBwYXJlbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgbmV3TGlzdGVuZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbGlzdGVuZXJzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBmdW5jdGlvbiBhdHRhY2hFdmVudHMoZXZlbnRzOnN0cmluZ1tdLCBlbGVtZW50OkVsZW1lbnR8RG9jdW1lbnR8V2luZG93LCBjYWxsYmFjazooZT86YW55KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgbGV0IGxpc3RlbmVyczpJTGlzdGVuZXJSZWZlcmVuY2VbXSA9IFtdO1xyXG4gICAgICAgIGV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICBsaXN0ZW5lcnMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50OiBlbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgcmVmZXJlbmNlOiBjYWxsYmFjayxcclxuICAgICAgICAgICAgICAgIGV2ZW50OiBldmVudFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBjYWxsYmFjayk7IFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBsaXN0ZW5lcnM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIE5BVElWRVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZm9jdXMoZWxlbWVudDpFbGVtZW50fERvY3VtZW50fFdpbmRvdywgY2FsbGJhY2s6KGU/OkZvY3VzRXZlbnQpID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdIHtcclxuICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzKFsnZm9jdXMnXSwgZWxlbWVudCwgKGUpID0+IHtcclxuICAgICAgICAgICAgY2FsbGJhY2soZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiBibHVyKGVsZW1lbnQ6RWxlbWVudHxEb2N1bWVudHxXaW5kb3csIGNhbGxiYWNrOihlPzpGb2N1c0V2ZW50KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ2JsdXInXSwgZWxlbWVudCwgKGUpID0+IHtcclxuICAgICAgICAgICAgY2FsbGJhY2soZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiBkb3duKGVsZW1lbnQ6RWxlbWVudHxEb2N1bWVudHxXaW5kb3csIGNhbGxiYWNrOihlPzpNb3VzZUV2ZW50fFRvdWNoRXZlbnQpID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdO1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGRvd24ocGFyZW50OkVsZW1lbnR8RG9jdW1lbnR8V2luZG93LCBkZWxlZ2F0ZVNlbGVjdG9yOnN0cmluZywgY2FsbGJhY2s6KGU/Ok1vdXNlRXZlbnR8VG91Y2hFdmVudCkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW107XHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZG93biguLi5wYXJhbXM6YW55W10pIHtcclxuICAgICAgICBpZiAocGFyYW1zLmxlbmd0aCA9PT0gMykge1xyXG4gICAgICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzRGVsZWdhdGUoWydtb3VzZWRvd24nLCAndG91Y2hzdGFydCddLCBwYXJhbXNbMF0sIHBhcmFtc1sxXSwgKGUpID0+IHtcclxuICAgICAgICAgICAgICAgIHBhcmFtc1syXSg8YW55PmUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzKFsnbW91c2Vkb3duJywgJ3RvdWNoc3RhcnQnXSwgcGFyYW1zWzBdLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcGFyYW1zWzFdKDxhbnk+ZSk7XHJcbiAgICAgICAgICAgIH0pOyAgICAgICAgXHJcbiAgICAgICAgfSBcclxuICAgIH07XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiB1cChlbGVtZW50OkVsZW1lbnR8RG9jdW1lbnR8V2luZG93LCBjYWxsYmFjazooZT86TW91c2VFdmVudCkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xyXG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydtb3VzZXVwJywgJ3RvdWNoZW5kJ10sIGVsZW1lbnQsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gbW91c2Vkb3duKGVsZW1lbnQ6RWxlbWVudHxEb2N1bWVudHxXaW5kb3csIGNhbGxiYWNrOihlPzpNb3VzZUV2ZW50KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ21vdXNlZG93biddLCBlbGVtZW50LCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBjYWxsYmFjayhlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIG1vdXNldXAoZWxlbWVudDpFbGVtZW50fERvY3VtZW50fFdpbmRvdywgY2FsbGJhY2s6KGU/Ok1vdXNlRXZlbnQpID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdIHtcclxuICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzKFsnbW91c2V1cCddLCBlbGVtZW50LCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBjYWxsYmFjayhlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHBhc3RlKGVsZW1lbnQ6RWxlbWVudHxEb2N1bWVudHxXaW5kb3csIGNhbGxiYWNrOihlPzpNb3VzZUV2ZW50KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ3Bhc3RlJ10sIGVsZW1lbnQsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gdGFwKGVsZW1lbnQ6RWxlbWVudHxEb2N1bWVudCwgY2FsbGJhY2s6KGU/OkV2ZW50KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXTtcclxuICAgIGV4cG9ydCBmdW5jdGlvbiB0YXAocGFyZW50OkVsZW1lbnR8RG9jdW1lbnQsIGRlbGVnYXRlU2VsZWN0b3I6c3RyaW5nLCBjYWxsYmFjazooZT86RXZlbnQpID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdO1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHRhcCguLi5wYXJhbXM6YW55W10pOklMaXN0ZW5lclJlZmVyZW5jZVtdIHtcclxuICAgICAgICBsZXQgc3RhcnRUb3VjaFg6bnVtYmVyLCBzdGFydFRvdWNoWTpudW1iZXI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGhhbmRsZVN0YXJ0ID0gKGU6VG91Y2hFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBzdGFydFRvdWNoWCA9IGUudG91Y2hlc1swXS5jbGllbnRYO1xyXG4gICAgICAgICAgICBzdGFydFRvdWNoWSA9IGUudG91Y2hlc1swXS5jbGllbnRZO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBsZXQgaGFuZGxlRW5kID0gKGU6VG91Y2hFdmVudCwgY2FsbGJhY2s6KGU/OkV2ZW50KSA9PiB2b2lkKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlLmNoYW5nZWRUb3VjaGVzID09PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgeERpZmYgPSBlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFggLSBzdGFydFRvdWNoWDtcclxuICAgICAgICAgICAgbGV0IHlEaWZmID0gZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRZIC0gc3RhcnRUb3VjaFk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoTWF0aC5zcXJ0KHhEaWZmICogeERpZmYgKyB5RGlmZiAqIHlEaWZmKSA8IDEwKSB7XHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBsZXQgbGlzdGVuZXJzOklMaXN0ZW5lclJlZmVyZW5jZVtdID0gW107XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHBhcmFtcy5sZW5ndGggPT09IDMpIHtcclxuICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChhdHRhY2hFdmVudHNEZWxlZ2F0ZShbJ3RvdWNoc3RhcnQnXSwgcGFyYW1zWzBdLCBwYXJhbXNbMV0sIGhhbmRsZVN0YXJ0KSk7XHJcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IGxpc3RlbmVycy5jb25jYXQoYXR0YWNoRXZlbnRzRGVsZWdhdGUoWyd0b3VjaGVuZCcsICdjbGljayddLCBwYXJhbXNbMF0sIHBhcmFtc1sxXSwgKGU6VG91Y2hFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlRW5kKGUsIHBhcmFtc1syXSk7XHJcbiAgICAgICAgICAgIH0pKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHBhcmFtcy5sZW5ndGggPT09IDIpIHtcclxuICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChhdHRhY2hFdmVudHMoWyd0b3VjaHN0YXJ0J10sIHBhcmFtc1swXSwgaGFuZGxlU3RhcnQpKTtcclxuICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChhdHRhY2hFdmVudHMoWyd0b3VjaGVuZCcsICdjbGljayddLCBwYXJhbXNbMF0sIChlOlRvdWNoRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZUVuZChlLCBwYXJhbXNbMV0pO1xyXG4gICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBsaXN0ZW5lcnM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIHN3aXBlKGVsZW1lbnQ6RWxlbWVudCwgZGlyZWN0aW9uOnN0cmluZywgY2FsbGJhY2s6KGU/OkV2ZW50KSA9PiB2b2lkKSB7XHJcbiAgICAgICAgbGV0IHN0YXJ0VG91Y2hYOm51bWJlciwgc3RhcnRUb3VjaFk6bnVtYmVyLCBzdGFydFRpbWU6bnVtYmVyO1xyXG4gICAgICAgIGxldCB0b3VjaE1vdmVMaXN0ZW5lcjpJTGlzdGVuZXJSZWZlcmVuY2U7XHJcbiAgICAgICAgbGV0IHNjcm9sbGluZ0Rpc2FibGVkOmJvb2xlYW47XHJcbiAgICAgICAgXHJcbiAgICAgICAgYXR0YWNoRXZlbnRzKFsndG91Y2hzdGFydCddLCBlbGVtZW50LCAoZTpUb3VjaEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHN0YXJ0VG91Y2hYID0gZS50b3VjaGVzWzBdLmNsaWVudFg7XHJcbiAgICAgICAgICAgIHN0YXJ0VG91Y2hZID0gZS50b3VjaGVzWzBdLmNsaWVudFk7XHJcbiAgICAgICAgICAgIHN0YXJ0VGltZSA9IG5ldyBEYXRlKCkudmFsdWVPZigpO1xyXG4gICAgICAgICAgICBzY3JvbGxpbmdEaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0b3VjaE1vdmVMaXN0ZW5lciA9IGF0dGFjaEV2ZW50cyhbJ3RvdWNobW92ZSddLCBkb2N1bWVudCwgKGU6VG91Y2hFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IHhEaWZmID0gTWF0aC5hYnMoZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRYIC0gc3RhcnRUb3VjaFgpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHlEaWZmID0gTWF0aC5hYnMoZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRZIC0gc3RhcnRUb3VjaFkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHhEaWZmID4geURpZmYgJiYgeERpZmYgPiAyMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbGluZ0Rpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoeURpZmYgPiB4RGlmZiAmJiB5RGlmZiA+IDIwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsaW5nRGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChuZXcgRGF0ZSgpLnZhbHVlT2YoKSAtIHN0YXJ0VGltZSA+IDUwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbGluZ0Rpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoc2Nyb2xsaW5nRGlzYWJsZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pWzBdOyBcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICBhdHRhY2hFdmVudHMoWyd0b3VjaGVuZCddLCBlbGVtZW50LCAoZTpUb3VjaEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIodG91Y2hNb3ZlTGlzdGVuZXIuZXZlbnQsIHRvdWNoTW92ZUxpc3RlbmVyLnJlZmVyZW5jZSk7XHJcbiAgICAgICAgICAgIGlmIChzdGFydFRvdWNoWCA9PT0gdm9pZCAwIHx8IHN0YXJ0VG91Y2hZID09PSB2b2lkIDApIHJldHVybjtcclxuICAgICAgICAgICAgaWYgKG5ldyBEYXRlKCkudmFsdWVPZigpIC0gc3RhcnRUaW1lID4gNTAwKSByZXR1cm47XHJcbiAgICAgICAgICAgIGxldCB4RGlmZiA9IGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WCAtIHN0YXJ0VG91Y2hYO1xyXG4gICAgICAgICAgICBsZXQgeURpZmYgPSBlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFkgLSBzdGFydFRvdWNoWTtcclxuICAgICAgICAgICAgaWYgKE1hdGguYWJzKHhEaWZmKSA+IE1hdGguYWJzKHlEaWZmKSAmJiBNYXRoLmFicyh4RGlmZikgPiAyMCkge1xyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJ2xlZnQnICYmIHhEaWZmIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJ3JpZ2h0JyAmJiB4RGlmZiA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gc3dpcGVMZWZ0KGVsZW1lbnQ6RWxlbWVudCwgY2FsbGJhY2s6KGU/OkV2ZW50KSA9PiB2b2lkKSB7XHJcbiAgICAgICAgc3dpcGUoZWxlbWVudCwgJ2xlZnQnLCBjYWxsYmFjayk7XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHN3aXBlUmlnaHQoZWxlbWVudDpFbGVtZW50LCBjYWxsYmFjazooZT86RXZlbnQpID0+IHZvaWQpIHtcclxuICAgICAgICBzd2lwZShlbGVtZW50LCAncmlnaHQnLCBjYWxsYmFjayk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiBkcmFnKGVsZW1lbnQ6RWxlbWVudCwgY2FsbGJhY2tzOklEcmFnQ2FsbGJhY2tzKTp2b2lkO1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGRyYWcocGFyZW50OkVsZW1lbnQsIGRlbGVnYXRlU2VsZWN0b3I6c3RyaW5nLCBjYWxsYmFja3M6SURyYWdDYWxsYmFja3MpOnZvaWQ7XHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZHJhZyguLi5wYXJhbXM6YW55W10pOnZvaWQge1xyXG4gICAgICAgIGxldCBkcmFnZ2luZzpib29sZWFuID0gZmFsc2U7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGNhbGxiYWNrczpJRHJhZ0NhbGxiYWNrcyA9IHBhcmFtc1twYXJhbXMubGVuZ3RoLTFdO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBzdGFydEV2ZW50cyA9IChlPzpNb3VzZUV2ZW50fFRvdWNoRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgZHJhZ2dpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICBpZiAoY2FsbGJhY2tzLmRyYWdTdGFydCAhPT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgICAgICBjYWxsYmFja3MuZHJhZ1N0YXJ0KGUpO1xyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgbGlzdGVuZXJzOklMaXN0ZW5lclJlZmVyZW5jZVtdID0gW107XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuY29uY2F0KGF0dGFjaEV2ZW50cyhbJ3RvdWNobW92ZScsICdtb3VzZW1vdmUnXSwgZG9jdW1lbnQsIChlPzpNb3VzZUV2ZW50fFRvdWNoRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChkcmFnZ2luZyAmJiBjYWxsYmFja3MuZHJhZ01vdmUgIT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrcy5kcmFnTW92ZShlKTtcclxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChhdHRhY2hFdmVudHMoWyd0b3VjaGVuZCcsICdtb3VzZXVwJ10sIGRvY3VtZW50LCAoZT86TW91c2VFdmVudHxUb3VjaEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZHJhZ2dpbmcgJiYgY2FsbGJhY2tzLmRyYWdFbmQgIT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrcy5kcmFnRW5kKGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGRyYWdnaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICByZW1vdmVMaXN0ZW5lcnMobGlzdGVuZXJzKTsgICAgICAgICAgICBcclxuICAgICAgICAgICAgfSkpOyAgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChwYXJhbXMubGVuZ3RoID09PSAzKSB7XHJcbiAgICAgICAgICAgIGF0dGFjaEV2ZW50c0RlbGVnYXRlKFsndG91Y2hzdGFydCcsICdtb3VzZWRvd24nXSwgcGFyYW1zWzBdLCBwYXJhbXNbMV0sIHN0YXJ0RXZlbnRzKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBhdHRhY2hFdmVudHMoWyd0b3VjaHN0YXJ0JywgJ21vdXNlZG93biddLCBwYXJhbXNbMF0sIHN0YXJ0RXZlbnRzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIENVU1RPTVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZ290byhlbGVtZW50OkVsZW1lbnQsIGNhbGxiYWNrOihlPzp7ZGF0ZTpEYXRlLCBsZXZlbDpMZXZlbCwgdXBkYXRlPzpib29sZWFufSkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xyXG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydkYXRpdW0tZ290byddLCBlbGVtZW50LCAoZTpDdXN0b21FdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBjYWxsYmFjayhlLmRldGFpbCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiB6b29tT3V0KGVsZW1lbnQ6RWxlbWVudCwgY2FsbGJhY2s6KGU/OntkYXRlOkRhdGUsIGN1cnJlbnRMZXZlbDpMZXZlbCwgdXBkYXRlPzpib29sZWFufSkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xyXG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydkYXRpdW0tem9vbS1vdXQnXSwgZWxlbWVudCwgKGU6Q3VzdG9tRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgY2FsbGJhY2soZS5kZXRhaWwpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gem9vbUluKGVsZW1lbnQ6RWxlbWVudCwgY2FsbGJhY2s6KGU/OntkYXRlOkRhdGUsIGN1cnJlbnRMZXZlbDpMZXZlbCwgdXBkYXRlPzpib29sZWFufSkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xyXG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydkYXRpdW0tem9vbS1pbiddLCBlbGVtZW50LCAoZTpDdXN0b21FdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBjYWxsYmFjayhlLmRldGFpbCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiB2aWV3Y2hhbmdlZChlbGVtZW50OkVsZW1lbnQsIGNhbGxiYWNrOihlPzp7ZGF0ZTpEYXRlLCBsZXZlbDpMZXZlbCwgdXBkYXRlPzpib29sZWFufSkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xyXG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydkYXRpdW0tdmlld2NoYW5nZWQnXSwgZWxlbWVudCwgKGU6Q3VzdG9tRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgY2FsbGJhY2soZS5kZXRhaWwpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gb3BlbkJ1YmJsZShlbGVtZW50OkVsZW1lbnQsIGNhbGxiYWNrOihlOnt4Om51bWJlciwgeTpudW1iZXIsIHRleHQ6c3RyaW5nfSkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xyXG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydkYXRpdW0tb3Blbi1idWJibGUnXSwgZWxlbWVudCwgKGU6Q3VzdG9tRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgY2FsbGJhY2soZS5kZXRhaWwpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gdXBkYXRlQnViYmxlKGVsZW1lbnQ6RWxlbWVudCwgY2FsbGJhY2s6KGU6e3g6bnVtYmVyLCB5Om51bWJlciwgdGV4dDpzdHJpbmd9KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ2RhdGl1bS11cGRhdGUtYnViYmxlJ10sIGVsZW1lbnQsIChlOkN1c3RvbUV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGUuZGV0YWlsKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVycyhsaXN0ZW5lcnM6SUxpc3RlbmVyUmVmZXJlbmNlW10pIHtcclxuICAgICAgICBsaXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIpID0+IHtcclxuICAgICAgICAgICBsaXN0ZW5lci5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIobGlzdGVuZXIuZXZlbnQsIGxpc3RlbmVyLnJlZmVyZW5jZSk7IFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5uYW1lc3BhY2UgdHJpZ2dlciB7XHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZ290byhlbGVtZW50OkVsZW1lbnQsIGRhdGE/OntkYXRlOkRhdGUsIGxldmVsOkxldmVsLCB1cGRhdGU/OmJvb2xlYW59KSB7XHJcbiAgICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnZGF0aXVtLWdvdG8nLCB7XHJcbiAgICAgICAgICAgIGJ1YmJsZXM6IGZhbHNlLFxyXG4gICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICBkZXRhaWw6IGRhdGFcclxuICAgICAgICB9KSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiB6b29tT3V0KGVsZW1lbnQ6RWxlbWVudCwgZGF0YT86e2RhdGU6RGF0ZSwgY3VycmVudExldmVsOkxldmVsLCB1cGRhdGU/OmJvb2xlYW59KSB7XHJcbiAgICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnZGF0aXVtLXpvb20tb3V0Jywge1xyXG4gICAgICAgICAgICBidWJibGVzOiBmYWxzZSwgXHJcbiAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXHJcbiAgICAgICAgICAgIGRldGFpbDogZGF0YVxyXG4gICAgICAgIH0pKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHpvb21JbihlbGVtZW50OkVsZW1lbnQsIGRhdGE/OntkYXRlOkRhdGUsIGN1cnJlbnRMZXZlbDpMZXZlbCwgdXBkYXRlPzpib29sZWFufSkge1xyXG4gICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2RhdGl1bS16b29tLWluJywge1xyXG4gICAgICAgICAgICBidWJibGVzOiBmYWxzZSwgXHJcbiAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXHJcbiAgICAgICAgICAgIGRldGFpbDogZGF0YVxyXG4gICAgICAgIH0pKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHZpZXdjaGFuZ2VkKGVsZW1lbnQ6RWxlbWVudCwgZGF0YT86e2RhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWwsIHVwZGF0ZT86Ym9vbGVhbn0pIHtcclxuICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdkYXRpdW0tdmlld2NoYW5nZWQnLCB7XHJcbiAgICAgICAgICAgIGJ1YmJsZXM6IGZhbHNlLFxyXG4gICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICBkZXRhaWw6IGRhdGFcclxuICAgICAgICB9KSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiBvcGVuQnViYmxlKGVsZW1lbnQ6RWxlbWVudCwgZGF0YTp7eDpudW1iZXIsIHk6bnVtYmVyLCB0ZXh0OnN0cmluZ30pIHtcclxuICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdkYXRpdW0tb3Blbi1idWJibGUnLCB7XHJcbiAgICAgICAgICAgIGJ1YmJsZXM6IGZhbHNlLFxyXG4gICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICBkZXRhaWw6IGRhdGFcclxuICAgICAgICB9KSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiB1cGRhdGVCdWJibGUoZWxlbWVudDpFbGVtZW50LCBkYXRhOnt4Om51bWJlciwgeTpudW1iZXIsIHRleHQ6c3RyaW5nfSkge1xyXG4gICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2RhdGl1bS11cGRhdGUtYnViYmxlJywge1xyXG4gICAgICAgICAgICBidWJibGVzOiBmYWxzZSxcclxuICAgICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgZGV0YWlsOiBkYXRhXHJcbiAgICAgICAgfSkpO1xyXG4gICAgfVxyXG59IiwiaW50ZXJmYWNlIElEYXRlUGFydCB7XHJcbiAgICBpbmNyZW1lbnQoKTp2b2lkO1xyXG4gICAgZGVjcmVtZW50KCk6dm9pZDtcclxuICAgIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpOmJvb2xlYW47XHJcbiAgICBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZyk6Ym9vbGVhbjtcclxuICAgIGdldFZhbHVlKCk6RGF0ZTtcclxuICAgIGdldFJlZ0V4KCk6UmVnRXhwO1xyXG4gICAgc2V0U2VsZWN0YWJsZShzZWxlY3RhYmxlOmJvb2xlYW4pOklEYXRlUGFydDtcclxuICAgIGdldE1heEJ1ZmZlcigpOm51bWJlcjtcclxuICAgIGdldExldmVsKCk6TGV2ZWw7XHJcbiAgICBpc1NlbGVjdGFibGUoKTpib29sZWFuO1xyXG4gICAgdG9TdHJpbmcoKTpzdHJpbmc7XHJcbiAgICBpc0RlZmluZWQoKTpib29sZWFuO1xyXG4gICAgc2V0RGVmaW5lZChkZWZpbmVkOmJvb2xlYW4pOnZvaWQ7XHJcbn1cclxuXHJcbmNsYXNzIFBsYWluVGV4dCBpbXBsZW1lbnRzIElEYXRlUGFydCB7XHJcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHRleHQ6c3RyaW5nKSB7fVxyXG4gICAgcHVibGljIGluY3JlbWVudCgpIHt9XHJcbiAgICBwdWJsaWMgZGVjcmVtZW50KCkge31cclxuICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKCkgeyByZXR1cm4gZmFsc2UgfVxyXG4gICAgcHVibGljIHNldFZhbHVlKCkgeyByZXR1cm4gZmFsc2UgfVxyXG4gICAgcHVibGljIGdldExhc3RWYWx1ZSgpOkRhdGUgeyByZXR1cm4gbnVsbCB9XHJcbiAgICBwdWJsaWMgZ2V0VmFsdWUoKTpEYXRlIHsgcmV0dXJuIG51bGwgfVxyXG4gICAgcHVibGljIGdldFJlZ0V4KCk6UmVnRXhwIHsgcmV0dXJuIG5ldyBSZWdFeHAoYFske3RoaXMudGV4dH1dYCk7IH1cclxuICAgIHB1YmxpYyBzZXRTZWxlY3RhYmxlKHNlbGVjdGFibGU6Ym9vbGVhbik6SURhdGVQYXJ0IHsgcmV0dXJuIHRoaXMgfVxyXG4gICAgcHVibGljIGdldE1heEJ1ZmZlcigpOm51bWJlciB7IHJldHVybiAwIH1cclxuICAgIHB1YmxpYyBnZXRMZXZlbCgpOkxldmVsIHsgcmV0dXJuIExldmVsLk5PTkUgfVxyXG4gICAgcHVibGljIGlzU2VsZWN0YWJsZSgpOmJvb2xlYW4geyByZXR1cm4gZmFsc2UgfVxyXG4gICAgcHVibGljIGlzRGVmaW5lZCgpOmJvb2xlYW4geyByZXR1cm4gZmFsc2UgfVxyXG4gICAgcHVibGljIHNldERlZmluZWQoKSB7fVxyXG4gICAgcHVibGljIHRvU3RyaW5nKCk6c3RyaW5nIHsgcmV0dXJuIHRoaXMudGV4dCB9XHJcbn1cclxuICAgIFxyXG5sZXQgZm9ybWF0QmxvY2tzID0gKGZ1bmN0aW9uKCkgeyAgICBcclxuICAgIGNsYXNzIERhdGVQYXJ0IGV4dGVuZHMgQ29tbW9uIHtcclxuICAgICAgICBwcm90ZWN0ZWQgZGF0ZTpEYXRlO1xyXG4gICAgICAgIHByb3RlY3RlZCBzZWxlY3RhYmxlOmJvb2xlYW4gPSB0cnVlO1xyXG4gICAgICAgIHByb3RlY3RlZCBkZWZpbmVkOmJvb2xlYW4gPSBmYWxzZTtcclxuICAgICAgICBcclxuICAgICAgICBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgb3B0aW9uczpJT3B0aW9ucykge1xyXG4gICAgICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0VmFsdWUoKTpEYXRlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0U2VsZWN0YWJsZShzZWxlY3RhYmxlOmJvb2xlYW4pIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RhYmxlID0gc2VsZWN0YWJsZTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBpc1NlbGVjdGFibGUoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGFibGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBpc0RlZmluZWQoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXREZWZpbmVkKGRlZmluZWQ6Ym9vbGVhbikge1xyXG4gICAgICAgICAgICB0aGlzLmRlZmluZWQgPSBkZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgRm91ckRpZ2l0WWVhciBleHRlbmRzIERhdGVQYXJ0IHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihvcHRpb25zOklPcHRpb25zKSB7IHN1cGVyKG9wdGlvbnMpOyB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGluY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldEZ1bGxZZWFyKHRoaXMuZGF0ZS5nZXRGdWxsWWVhcigpICsgMSk7XHJcbiAgICAgICAgICAgIH0gd2hpbGUgKCF0aGlzLm9wdGlvbnMuaXNZZWFyVmFsaWQodGhpcy5kYXRlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBkZWNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRGdWxsWWVhcih0aGlzLmRhdGUuZ2V0RnVsbFllYXIoKSAtIDEpO1xyXG4gICAgICAgICAgICB9IHdoaWxlICghdGhpcy5vcHRpb25zLmlzWWVhclZhbGlkKHRoaXMuZGF0ZSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZShwYXJ0aWFsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlZmluZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRGdWxsWWVhcihwYXJzZUludCh2YWx1ZSwgMTApKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL14tP1xcZHsxLDR9JC87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiA0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBMZXZlbC5ZRUFSO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5kZWZpbmVkIHx8ICF0aGlzLm9wdGlvbnMuaXNZZWFyVmFsaWQodGhpcy5kYXRlKSkgcmV0dXJuICd5eXl5JztcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXRGdWxsWWVhcigpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBUd29EaWdpdFllYXIgZXh0ZW5kcyBGb3VyRGlnaXRZZWFyIHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihvcHRpb25zOklPcHRpb25zKSB7IHN1cGVyKG9wdGlvbnMpOyB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWZpbmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYmFzZSA9IE1hdGguZmxvb3Ioc3VwZXIuZ2V0VmFsdWUoKS5nZXRGdWxsWWVhcigpLzEwMCkqMTAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldEZ1bGxZZWFyKHBhcnNlSW50KDxzdHJpbmc+dmFsdWUsIDEwKSArIGJhc2UpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXi0/XFxkezEsMn0kLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuZGVmaW5lZCB8fCAhdGhpcy5vcHRpb25zLmlzWWVhclZhbGlkKHRoaXMuZGF0ZSkpIHJldHVybiAneXknO1xyXG4gICAgICAgICAgICByZXR1cm4gc3VwZXIudG9TdHJpbmcoKS5zbGljZSgtMik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBMb25nTW9udGhOYW1lIGV4dGVuZHMgRGF0ZVBhcnQge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6SU9wdGlvbnMpIHsgc3VwZXIob3B0aW9ucyk7IH1cclxuICAgICAgICBcclxuICAgICAgICBwcm90ZWN0ZWQgZ2V0TW9udGhzKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3VwZXIuZ2V0TW9udGhzKCk7XHJcbiAgICAgICAgfSBcclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgaW5jcmVtZW50KCkge1xyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldE1vbnRoKCkgKyAxO1xyXG4gICAgICAgICAgICAgICAgaWYgKG51bSA+IDExKSBudW0gPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1vbnRoKG51bSk7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAodGhpcy5kYXRlLmdldE1vbnRoKCkgPiBudW0pIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0RGF0ZSh0aGlzLmRhdGUuZ2V0RGF0ZSgpIC0gMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gd2hpbGUgKCF0aGlzLm9wdGlvbnMuaXNNb250aFZhbGlkKHRoaXMuZGF0ZSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZGVjcmVtZW50KCkge1xyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldE1vbnRoKCkgLSAxO1xyXG4gICAgICAgICAgICAgICAgaWYgKG51bSA8IDApIG51bSA9IDExO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1vbnRoKG51bSk7XHJcbiAgICAgICAgICAgIH0gd2hpbGUgKCF0aGlzLm9wdGlvbnMuaXNNb250aFZhbGlkKHRoaXMuZGF0ZSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICBsZXQgbW9udGggPSB0aGlzLmdldE1vbnRocygpLmZpbHRlcigobW9udGgpID0+IHtcclxuICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoYF4ke3BhcnRpYWx9LiokYCwgJ2knKS50ZXN0KG1vbnRoKTsgXHJcbiAgICAgICAgICAgIH0pWzBdO1xyXG4gICAgICAgICAgICBpZiAobW9udGggIT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUobW9udGgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlZmluZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmdldE1vbnRocygpLmluZGV4T2YodmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1vbnRoKG51bSk7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAodGhpcy5kYXRlLmdldE1vbnRoKCkgPiBudW0pIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0RGF0ZSh0aGlzLmRhdGUuZ2V0RGF0ZSgpIC0gMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoYF4oKCR7dGhpcy5nZXRNb250aHMoKS5qb2luKFwiKXwoXCIpfSkpJGAsICdpJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbMiwxLDMsMiwzLDMsMywyLDEsMSwxLDFdW3RoaXMuZGF0ZS5nZXRNb250aCgpXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldExldmVsKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTGV2ZWwuTU9OVEg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmRlZmluZWQgfHwgIXRoaXMub3B0aW9ucy5pc01vbnRoVmFsaWQodGhpcy5kYXRlKSkgcmV0dXJuICdtbW0nO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRNb250aHMoKVt0aGlzLmRhdGUuZ2V0TW9udGgoKV07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBTaG9ydE1vbnRoTmFtZSBleHRlbmRzIExvbmdNb250aE5hbWUge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6SU9wdGlvbnMpIHsgc3VwZXIob3B0aW9ucyk7IH1cclxuICAgICAgICBcclxuICAgICAgICBwcm90ZWN0ZWQgZ2V0TW9udGhzKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3VwZXIuZ2V0U2hvcnRNb250aHMoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuZGVmaW5lZCB8fCAhdGhpcy5vcHRpb25zLmlzTW9udGhWYWxpZCh0aGlzLmRhdGUpKSByZXR1cm4gJ21tbSc7XHJcbiAgICAgICAgICAgIHN1cGVyLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBNb250aCBleHRlbmRzIExvbmdNb250aE5hbWUge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6SU9wdGlvbnMpIHsgc3VwZXIob3B0aW9ucyk7IH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TWF4QnVmZmVyKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldE1vbnRoKCkgPiAwID8gMSA6IDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICgvXlxcZHsxLDJ9JC8udGVzdChwYXJ0aWFsKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHRyaW1tZWQgPSB0aGlzLnRyaW0ocGFydGlhbCA9PT0gJzAnID8gJzEnIDogcGFydGlhbCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0cmltbWVkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWZpbmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0TW9udGgocGFyc2VJbnQodmFsdWUsIDEwKSAtIDEpO1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKHRoaXMuZGF0ZS5nZXRNb250aCgpID4gcGFyc2VJbnQodmFsdWUsIDEwKSAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0RGF0ZSh0aGlzLmRhdGUuZ2V0RGF0ZSgpIC0gMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eKFsxLTldfCgxWzAtMl0pKSQvO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5kZWZpbmVkIHx8ICF0aGlzLm9wdGlvbnMuaXNNb250aFZhbGlkKHRoaXMuZGF0ZSkpIHJldHVybiAnbW0nO1xyXG4gICAgICAgICAgICByZXR1cm4gKHRoaXMuZGF0ZS5nZXRNb250aCgpICsgMSkudG9TdHJpbmcoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIFBhZGRlZE1vbnRoIGV4dGVuZHMgTW9udGgge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6SU9wdGlvbnMpIHsgc3VwZXIob3B0aW9ucyk7IH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAoL15cXGR7MSwyfSQvLnRlc3QocGFydGlhbCkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBwYWRkZWQgPSB0aGlzLnBhZChwYXJ0aWFsID09PSAnMCcgPyAnMScgOiBwYXJ0aWFsKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHBhZGRlZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXigoMFsxLTldKXwoMVswLTJdKSkkLzsgICAgICAgICAgICBcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuZGVmaW5lZCB8fCAhdGhpcy5vcHRpb25zLmlzTW9udGhWYWxpZCh0aGlzLmRhdGUpKSByZXR1cm4gJ21tJztcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFkKHN1cGVyLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgRGF0ZU51bWVyYWwgZXh0ZW5kcyBEYXRlUGFydCB7XHJcbiAgICAgICAgY29uc3RydWN0b3Iob3B0aW9uczpJT3B0aW9ucykgeyBzdXBlcihvcHRpb25zKTsgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBpbmNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0RGF0ZSgpICsgMTtcclxuICAgICAgICAgICAgICAgIGlmIChudW0gPiB0aGlzLmRheXNJbk1vbnRoKHRoaXMuZGF0ZSkpIG51bSA9IDE7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0RGF0ZShudW0pO1xyXG4gICAgICAgICAgICB9IHdoaWxlICghdGhpcy5vcHRpb25zLmlzRGF0ZVZhbGlkKHRoaXMuZGF0ZSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZGVjcmVtZW50KCkge1xyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldERhdGUoKSAtIDE7XHJcbiAgICAgICAgICAgICAgICBpZiAobnVtIDwgMSkgbnVtID0gdGhpcy5kYXlzSW5Nb250aCh0aGlzLmRhdGUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldERhdGUobnVtKTtcclxuICAgICAgICAgICAgfSB3aGlsZSAoIXRoaXMub3B0aW9ucy5pc0RhdGVWYWxpZCh0aGlzLmRhdGUpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKC9eXFxkezEsMn0kLy50ZXN0KHBhcnRpYWwpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdHJpbW1lZCA9IHRoaXMudHJpbShwYXJ0aWFsID09PSAnMCcgPyAnMScgOiBwYXJ0aWFsKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHRyaW1tZWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlZmluZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkgJiYgcGFyc2VJbnQodmFsdWUsIDEwKSA8IHRoaXMuZGF5c0luTW9udGgodGhpcy5kYXRlKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldERhdGUocGFyc2VJbnQodmFsdWUsIDEwKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eWzEtOV18KCgxfDIpWzAtOV0pfCgzWzAtMV0pJC87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0RGF0ZSgpID4gTWF0aC5mbG9vcih0aGlzLmRheXNJbk1vbnRoKHRoaXMuZGF0ZSkvMTApID8gMSA6IDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIExldmVsLkRBVEU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmRlZmluZWQgfHwgIXRoaXMub3B0aW9ucy5pc0RhdGVWYWxpZCh0aGlzLmRhdGUpKSByZXR1cm4gJ2RkJztcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXREYXRlKCkudG9TdHJpbmcoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIFBhZGRlZERhdGUgZXh0ZW5kcyBEYXRlTnVtZXJhbCB7XHJcbiAgICAgICAgY29uc3RydWN0b3Iob3B0aW9uczpJT3B0aW9ucykgeyBzdXBlcihvcHRpb25zKTsgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICgvXlxcZHsxLDJ9JC8udGVzdChwYXJ0aWFsKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhZGRlZCA9IHRoaXMucGFkKHBhcnRpYWwgPT09ICcwJyA/ICcxJyA6IHBhcnRpYWwpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUocGFkZGVkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eKDBbMS05XSl8KCgxfDIpWzAtOV0pfCgzWzAtMV0pJC87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmRlZmluZWQgfHwgIXRoaXMub3B0aW9ucy5pc0RhdGVWYWxpZCh0aGlzLmRhdGUpKSByZXR1cm4gJ2RkJztcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFkKHRoaXMuZGF0ZS5nZXREYXRlKCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgRGF0ZU9yZGluYWwgZXh0ZW5kcyBEYXRlTnVtZXJhbCB7XHJcbiAgICAgICAgY29uc3RydWN0b3Iob3B0aW9uczpJT3B0aW9ucykgeyBzdXBlcihvcHRpb25zKTsgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eKFsxLTldfCgoMXwyKVswLTldKXwoM1swLTFdKSkoKHN0KXwobmQpfChyZCl8KHRoKSk/JC9pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5kZWZpbmVkIHx8ICF0aGlzLm9wdGlvbnMuaXNEYXRlVmFsaWQodGhpcy5kYXRlKSkgcmV0dXJuICdkZCc7XHJcbiAgICAgICAgICAgIGxldCBkYXRlID0gdGhpcy5kYXRlLmdldERhdGUoKTtcclxuICAgICAgICAgICAgbGV0IGogPSBkYXRlICUgMTA7XHJcbiAgICAgICAgICAgIGxldCBrID0gZGF0ZSAlIDEwMDtcclxuICAgICAgICAgICAgaWYgKGogPT09IDEgJiYgayAhPT0gMTEpIHJldHVybiBkYXRlICsgXCJzdFwiO1xyXG4gICAgICAgICAgICBpZiAoaiA9PT0gMiAmJiBrICE9PSAxMikgcmV0dXJuIGRhdGUgKyBcIm5kXCI7XHJcbiAgICAgICAgICAgIGlmIChqID09PSAzICYmIGsgIT09IDEzKSByZXR1cm4gZGF0ZSArIFwicmRcIjtcclxuICAgICAgICAgICAgcmV0dXJuIGRhdGUgKyBcInRoXCI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBMb25nRGF5TmFtZSBleHRlbmRzIERhdGVQYXJ0IHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihvcHRpb25zOklPcHRpb25zKSB7IHN1cGVyKG9wdGlvbnMpOyB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHJvdGVjdGVkIGdldERheXMoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzdXBlci5nZXREYXlzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBpbmNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0RGF5KCkgKyAxO1xyXG4gICAgICAgICAgICAgICAgaWYgKG51bSA+IDYpIG51bSA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0RGF0ZSh0aGlzLmRhdGUuZ2V0RGF0ZSgpIC0gdGhpcy5kYXRlLmdldERheSgpICsgbnVtKTtcclxuICAgICAgICAgICAgfSB3aGlsZSAoIXRoaXMub3B0aW9ucy5pc0RhdGVWYWxpZCh0aGlzLmRhdGUpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGRlY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXREYXkoKSAtIDE7XHJcbiAgICAgICAgICAgICAgICBpZiAobnVtIDwgMCkgbnVtID0gNjtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXREYXRlKHRoaXMuZGF0ZS5nZXREYXRlKCkgLSB0aGlzLmRhdGUuZ2V0RGF5KCkgKyBudW0pO1xyXG4gICAgICAgICAgICB9IHdoaWxlICghdGhpcy5vcHRpb25zLmlzRGF0ZVZhbGlkKHRoaXMuZGF0ZSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICBsZXQgZGF5ID0gdGhpcy5nZXREYXlzKCkuZmlsdGVyKChkYXkpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUmVnRXhwKGBeJHtwYXJ0aWFsfS4qJGAsICdpJykudGVzdChkYXkpO1xyXG4gICAgICAgICAgICB9KVswXTtcclxuICAgICAgICAgICAgaWYgKGRheSAhPT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZShkYXkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlZmluZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmdldERheXMoKS5pbmRleE9mKHZhbHVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXREYXRlKHRoaXMuZGF0ZS5nZXREYXRlKCkgLSB0aGlzLmRhdGUuZ2V0RGF5KCkgKyBudW0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUmVnRXhwKGBeKCgke3RoaXMuZ2V0RGF5cygpLmpvaW4oXCIpfChcIil9KSkkYCwgJ2knKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFsyLDEsMiwxLDIsMSwyXVt0aGlzLmRhdGUuZ2V0RGF5KCldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBMZXZlbC5EQVRFO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5kZWZpbmVkIHx8ICF0aGlzLm9wdGlvbnMuaXNEYXRlVmFsaWQodGhpcy5kYXRlKSkgcmV0dXJuICdkZGQnO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXREYXlzKClbdGhpcy5kYXRlLmdldERheSgpXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIFNob3J0RGF5TmFtZSBleHRlbmRzIExvbmdEYXlOYW1lIHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihvcHRpb25zOklPcHRpb25zKSB7IHN1cGVyKG9wdGlvbnMpOyB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHJvdGVjdGVkIGdldERheXMoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzdXBlci5nZXRTaG9ydERheXMoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIFBhZGRlZE1pbGl0YXJ5SG91ciBleHRlbmRzIERhdGVQYXJ0IHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihvcHRpb25zOklPcHRpb25zKSB7IHN1cGVyKG9wdGlvbnMpOyB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGluY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRIb3VycygpICsgMTtcclxuICAgICAgICAgICAgICAgIGlmIChudW0gPiAyMykgbnVtID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3VycyhudW0pO1xyXG4gICAgICAgICAgICB9IHdoaWxlICghdGhpcy5vcHRpb25zLmlzSG91clZhbGlkKHRoaXMuZGF0ZSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZGVjcmVtZW50KCkge1xyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldEhvdXJzKCkgLSAxO1xyXG4gICAgICAgICAgICAgICAgaWYgKG51bSA8IDApIG51bSA9IDIzO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldEhvdXJzKG51bSk7XHJcbiAgICAgICAgICAgICAgICAvLyBEYXkgTGlnaHQgU2F2aW5ncyBBZGp1c3RtZW50XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kYXRlLmdldEhvdXJzKCkgIT09IG51bSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3VycyhudW0gLSAxKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSB3aGlsZSAoIXRoaXMub3B0aW9ucy5pc0hvdXJWYWxpZCh0aGlzLmRhdGUpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKC9eXFxkezEsMn0kLy50ZXN0KHBhcnRpYWwpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGFkZGVkID0gdGhpcy5wYWQocGFydGlhbCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZShwYWRkZWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlZmluZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3VycyhwYXJzZUludCh2YWx1ZSwgMTApKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXRIb3VycygpID4gMiA/IDEgOiAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBMZXZlbC5IT1VSO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXigoKDB8MSlbMC05XSl8KDJbMC0zXSkpJC87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmRlZmluZWQgfHwgIXRoaXMub3B0aW9ucy5pc0hvdXJWYWxpZCh0aGlzLmRhdGUpKSByZXR1cm4gJy0tJztcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFkKHRoaXMuZGF0ZS5nZXRIb3VycygpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIE1pbGl0YXJ5SG91ciBleHRlbmRzIFBhZGRlZE1pbGl0YXJ5SG91ciB7XHJcbiAgICAgICAgY29uc3RydWN0b3Iob3B0aW9uczpJT3B0aW9ucykgeyBzdXBlcihvcHRpb25zKTsgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICgvXlxcZHsxLDJ9JC8udGVzdChwYXJ0aWFsKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHRyaW1tZWQgPSB0aGlzLnRyaW0ocGFydGlhbCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0cmltbWVkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eKCgxP1swLTldKXwoMlswLTNdKSkkLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuZGVmaW5lZCB8fCAhdGhpcy5vcHRpb25zLmlzSG91clZhbGlkKHRoaXMuZGF0ZSkpIHJldHVybiAnLS0nO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldEhvdXJzKCkudG9TdHJpbmcoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIFBhZGRlZEhvdXIgZXh0ZW5kcyBQYWRkZWRNaWxpdGFyeUhvdXIge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6SU9wdGlvbnMpIHsgc3VwZXIob3B0aW9ucyk7IH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICBsZXQgcGFkZGVkID0gdGhpcy5wYWQocGFydGlhbCA9PT0gJzAnID8gJzEnIDogcGFydGlhbCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHBhZGRlZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWZpbmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbnVtID0gcGFyc2VJbnQodmFsdWUsIDEwKTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmRhdGUuZ2V0SG91cnMoKSA8IDEyICYmIG51bSA9PT0gMTIpIG51bSA9IDA7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kYXRlLmdldEhvdXJzKCkgPiAxMSAmJiBudW0gIT09IDEyKSBudW0gKz0gMTI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnMobnVtKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL14oMFsxLTldKXwoMVswLTJdKSQvO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TWF4QnVmZmVyKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcGFyc2VJbnQodGhpcy50b1N0cmluZygpLCAxMCkgPiAxID8gMSA6IDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmRlZmluZWQgfHwgIXRoaXMub3B0aW9ucy5pc0hvdXJWYWxpZCh0aGlzLmRhdGUpKSByZXR1cm4gJy0tJztcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFkKHRoaXMuZ2V0SG91cnModGhpcy5kYXRlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBIb3VyIGV4dGVuZHMgUGFkZGVkSG91ciB7XHJcbiAgICAgICAgY29uc3RydWN0b3Iob3B0aW9uczpJT3B0aW9ucykgeyBzdXBlcihvcHRpb25zKTsgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGxldCB0cmltbWVkID0gdGhpcy50cmltKHBhcnRpYWwgPT09ICcwJyA/ICcxJyA6IHBhcnRpYWwpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0cmltbWVkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL15bMS05XXwoMVswLTJdKSQvO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5kZWZpbmVkIHx8ICF0aGlzLm9wdGlvbnMuaXNIb3VyVmFsaWQodGhpcy5kYXRlKSkgcmV0dXJuICctLSc7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRyaW0oc3VwZXIudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBQYWRkZWRNaW51dGUgZXh0ZW5kcyBEYXRlUGFydCB7XHJcbiAgICAgICAgY29uc3RydWN0b3Iob3B0aW9uczpJT3B0aW9ucykgeyBzdXBlcihvcHRpb25zKTsgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBpbmNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0TWludXRlcygpICsgMTtcclxuICAgICAgICAgICAgICAgIGlmIChudW0gPiA1OSkgbnVtID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRNaW51dGVzKG51bSk7XHJcbiAgICAgICAgICAgIH0gd2hpbGUgKCF0aGlzLm9wdGlvbnMuaXNNaW51dGVWYWxpZCh0aGlzLmRhdGUpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGRlY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRNaW51dGVzKCkgLSAxO1xyXG4gICAgICAgICAgICAgICAgaWYgKG51bSA8IDApIG51bSA9IDU5O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1pbnV0ZXMobnVtKTtcclxuICAgICAgICAgICAgfSB3aGlsZSAoIXRoaXMub3B0aW9ucy5pc01pbnV0ZVZhbGlkKHRoaXMuZGF0ZSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0aGlzLnBhZChwYXJ0aWFsKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWZpbmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0TWludXRlcyhwYXJzZUludCh2YWx1ZSwgMTApKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL15bMC01XVswLTldJC87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0TWludXRlcygpID4gNSA/IDEgOiAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBMZXZlbC5NSU5VVEU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmRlZmluZWQgfHwgIXRoaXMub3B0aW9ucy5pc01pbnV0ZVZhbGlkKHRoaXMuZGF0ZSkpIHJldHVybiAnLS0nO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYWQodGhpcy5kYXRlLmdldE1pbnV0ZXMoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBNaW51dGUgZXh0ZW5kcyBQYWRkZWRNaW51dGUge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6SU9wdGlvbnMpIHsgc3VwZXIob3B0aW9ucyk7IH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0aGlzLnRyaW0ocGFydGlhbCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXlswLTVdP1swLTldJC87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmRlZmluZWQgfHwgIXRoaXMub3B0aW9ucy5pc01pbnV0ZVZhbGlkKHRoaXMuZGF0ZSkpIHJldHVybiAnLS0nO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldE1pbnV0ZXMoKS50b1N0cmluZygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgUGFkZGVkU2Vjb25kIGV4dGVuZHMgRGF0ZVBhcnQge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6SU9wdGlvbnMpIHsgc3VwZXIob3B0aW9ucyk7IH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgaW5jcmVtZW50KCkge1xyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldFNlY29uZHMoKSArIDE7XHJcbiAgICAgICAgICAgICAgICBpZiAobnVtID4gNTkpIG51bSA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0U2Vjb25kcyhudW0pO1xyXG4gICAgICAgICAgICB9IHdoaWxlICghdGhpcy5vcHRpb25zLmlzU2Vjb25kVmFsaWQodGhpcy5kYXRlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBkZWNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0U2Vjb25kcygpIC0gMTtcclxuICAgICAgICAgICAgICAgIGlmIChudW0gPCAwKSBudW0gPSA1OTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRTZWNvbmRzKG51bSk7ICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9IHdoaWxlICghdGhpcy5vcHRpb25zLmlzU2Vjb25kVmFsaWQodGhpcy5kYXRlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHRoaXMucGFkKHBhcnRpYWwpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlZmluZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRTZWNvbmRzKHBhcnNlSW50KHZhbHVlLCAxMCkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXlswLTVdWzAtOV0kLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXRTZWNvbmRzKCkgPiA1ID8gMSA6IDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIExldmVsLlNFQ09ORDtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuZGVmaW5lZCB8fCAhdGhpcy5vcHRpb25zLmlzU2Vjb25kVmFsaWQodGhpcy5kYXRlKSkgcmV0dXJuICctLSc7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhZCh0aGlzLmRhdGUuZ2V0U2Vjb25kcygpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIFNlY29uZCBleHRlbmRzIFBhZGRlZFNlY29uZCB7XHJcbiAgICAgICAgY29uc3RydWN0b3Iob3B0aW9uczpJT3B0aW9ucykgeyBzdXBlcihvcHRpb25zKTsgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHRoaXMudHJpbShwYXJ0aWFsKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eWzAtNV0/WzAtOV0kLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuZGVmaW5lZCB8fCAhdGhpcy5vcHRpb25zLmlzU2Vjb25kVmFsaWQodGhpcy5kYXRlKSkgcmV0dXJuICctLSc7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0U2Vjb25kcygpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBVcHBlcmNhc2VNZXJpZGllbSBleHRlbmRzIERhdGVQYXJ0IHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihvcHRpb25zOklPcHRpb25zKSB7IHN1cGVyKG9wdGlvbnMpOyB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGluY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRIb3VycygpICsgMTI7XHJcbiAgICAgICAgICAgIGlmIChudW0gPiAyMykgbnVtIC09IDI0O1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnMobnVtKTtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuaXNIb3VyVmFsaWQodGhpcy5kYXRlKSkgdGhpcy5kZWNyZW1lbnQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGRlY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRIb3VycygpIC0gMTI7XHJcbiAgICAgICAgICAgIGlmIChudW0gPCAwKSBudW0gKz0gMjQ7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3VycyhudW0pO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmlzSG91clZhbGlkKHRoaXMuZGF0ZSkpIHRoaXMuaW5jcmVtZW50KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICgvXigoQU0/KXwoUE0/KSkkL2kudGVzdChwYXJ0aWFsKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUocGFydGlhbFswXSA9PT0gJ0EnID8gJ0FNJyA6ICdQTScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlZmluZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZS50b0xvd2VyQ2FzZSgpID09PSAnYW0nICYmIHRoaXMuZGF0ZS5nZXRIb3VycygpID4gMTEpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnModGhpcy5kYXRlLmdldEhvdXJzKCkgLSAxMik7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlLnRvTG93ZXJDYXNlKCkgPT09ICdwbScgJiYgdGhpcy5kYXRlLmdldEhvdXJzKCkgPCAxMikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3Vycyh0aGlzLmRhdGUuZ2V0SG91cnMoKSArIDEyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldExldmVsKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTGV2ZWwuSE9VUjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eKChhbSl8KHBtKSkkL2k7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmRlZmluZWQgfHwgIXRoaXMub3B0aW9ucy5pc0hvdXJWYWxpZCh0aGlzLmRhdGUpKSByZXR1cm4gJy0tJztcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0TWVyaWRpZW0odGhpcy5kYXRlKS50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgTG93ZXJjYXNlTWVyaWRpZW0gZXh0ZW5kcyBVcHBlcmNhc2VNZXJpZGllbSB7XHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuZGVmaW5lZCB8fCAhdGhpcy5vcHRpb25zLmlzSG91clZhbGlkKHRoaXMuZGF0ZSkpIHJldHVybiAnLS0nO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRNZXJpZGllbSh0aGlzLmRhdGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgbGV0IGZvcm1hdEJsb2Nrczp7IFtrZXk6c3RyaW5nXTogbmV3IChvcHRpb25zOklPcHRpb25zKSA9PiBJRGF0ZVBhcnQ7IH0gPSB7fTtcclxuICAgIFxyXG4gICAgZm9ybWF0QmxvY2tzWydZWVlZJ10gPSBGb3VyRGlnaXRZZWFyO1xyXG4gICAgZm9ybWF0QmxvY2tzWydZWSddID0gVHdvRGlnaXRZZWFyO1xyXG4gICAgZm9ybWF0QmxvY2tzWydNTU1NJ10gPSBMb25nTW9udGhOYW1lO1xyXG4gICAgZm9ybWF0QmxvY2tzWydNTU0nXSA9IFNob3J0TW9udGhOYW1lO1xyXG4gICAgZm9ybWF0QmxvY2tzWydNTSddID0gUGFkZGVkTW9udGg7XHJcbiAgICBmb3JtYXRCbG9ja3NbJ00nXSA9IE1vbnRoO1xyXG4gICAgZm9ybWF0QmxvY2tzWydERCddID0gUGFkZGVkRGF0ZTtcclxuICAgIGZvcm1hdEJsb2Nrc1snRG8nXSA9IERhdGVPcmRpbmFsO1xyXG4gICAgZm9ybWF0QmxvY2tzWydEJ10gPSBEYXRlTnVtZXJhbDtcclxuICAgIGZvcm1hdEJsb2Nrc1snZGRkZCddID0gTG9uZ0RheU5hbWU7XHJcbiAgICBmb3JtYXRCbG9ja3NbJ2RkZCddID0gU2hvcnREYXlOYW1lO1xyXG4gICAgZm9ybWF0QmxvY2tzWydISCddID0gUGFkZGVkTWlsaXRhcnlIb3VyO1xyXG4gICAgZm9ybWF0QmxvY2tzWydoaCddID0gUGFkZGVkSG91cjtcclxuICAgIGZvcm1hdEJsb2Nrc1snSCddID0gTWlsaXRhcnlIb3VyO1xyXG4gICAgZm9ybWF0QmxvY2tzWydoJ10gPSBIb3VyO1xyXG4gICAgZm9ybWF0QmxvY2tzWydBJ10gPSBVcHBlcmNhc2VNZXJpZGllbTtcclxuICAgIGZvcm1hdEJsb2Nrc1snYSddID0gTG93ZXJjYXNlTWVyaWRpZW07XHJcbiAgICBmb3JtYXRCbG9ja3NbJ21tJ10gPSBQYWRkZWRNaW51dGU7XHJcbiAgICBmb3JtYXRCbG9ja3NbJ20nXSA9IE1pbnV0ZTtcclxuICAgIGZvcm1hdEJsb2Nrc1snc3MnXSA9IFBhZGRlZFNlY29uZDtcclxuICAgIGZvcm1hdEJsb2Nrc1sncyddID0gU2Vjb25kO1xyXG4gICAgXHJcbiAgICByZXR1cm4gZm9ybWF0QmxvY2tzO1xyXG59KSgpO1xyXG5cclxuXHJcbiIsImNsYXNzIElucHV0IHtcclxuICAgIHByaXZhdGUgb3B0aW9uczogSU9wdGlvbnM7XHJcbiAgICBwcml2YXRlIHNlbGVjdGVkRGF0ZVBhcnQ6IElEYXRlUGFydDtcclxuICAgIHByaXZhdGUgdGV4dEJ1ZmZlcjogc3RyaW5nID0gXCJcIjtcclxuICAgIHB1YmxpYyBkYXRlUGFydHM6IElEYXRlUGFydFtdO1xyXG4gICAgcHVibGljIGZvcm1hdDogUmVnRXhwO1xyXG4gICAgcHJpdmF0ZSBkYXRlOkRhdGU7XHJcbiAgICBwcml2YXRlIGxldmVsOkxldmVsO1xyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZWxlbWVudDogSFRNTElucHV0RWxlbWVudCkge1xyXG4gICAgICAgIG5ldyBLZXlib2FyZEV2ZW50SGFuZGxlcih0aGlzKTtcclxuICAgICAgICBuZXcgTW91c2VFdmVudEhhbmRsZXIodGhpcyk7XHJcbiAgICAgICAgbmV3IFBhc3RlRXZlbnRIYW5kZXIodGhpcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGlzdGVuLnZpZXdjaGFuZ2VkKGVsZW1lbnQsIChlKSA9PiB0aGlzLnZpZXdjaGFuZ2VkKGUuZGF0ZSwgZS5sZXZlbCwgZS51cGRhdGUpKTtcclxuICAgICAgICBsaXN0ZW4uYmx1cihlbGVtZW50LCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMudGV4dEJ1ZmZlciA9ICcnO1xyXG4gICAgICAgICAgICB0aGlzLmJsdXJEYXRlUGFydCh0aGlzLnNlbGVjdGVkRGF0ZVBhcnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0TGV2ZWxzKCk6TGV2ZWxbXSB7XHJcbiAgICAgICAgbGV0IGxldmVsczpMZXZlbFtdID0gW107XHJcbiAgICAgICAgdGhpcy5kYXRlUGFydHMuZm9yRWFjaCgoZGF0ZVBhcnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKGxldmVscy5pbmRleE9mKGRhdGVQYXJ0LmdldExldmVsKCkpID09PSAtMSAmJiBkYXRlUGFydC5pc1NlbGVjdGFibGUoKSkge1xyXG4gICAgICAgICAgICAgICAgbGV2ZWxzLnB1c2goZGF0ZVBhcnQuZ2V0TGV2ZWwoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gbGV2ZWxzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0VGV4dEJ1ZmZlcigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy50ZXh0QnVmZmVyO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgc2V0VGV4dEJ1ZmZlcihuZXdCdWZmZXI6c3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy50ZXh0QnVmZmVyID0gbmV3QnVmZmVyO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLnRleHRCdWZmZXIubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZURhdGVGcm9tQnVmZmVyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdXBkYXRlRGF0ZUZyb21CdWZmZXIoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWREYXRlUGFydC5zZXRWYWx1ZUZyb21QYXJ0aWFsKHRoaXMudGV4dEJ1ZmZlcikpIHtcclxuICAgICAgICAgICAgbGV0IG5ld0RhdGUgPSB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQuZ2V0VmFsdWUoKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMudGV4dEJ1ZmZlci5sZW5ndGggPj0gdGhpcy5zZWxlY3RlZERhdGVQYXJ0LmdldE1heEJ1ZmZlcigpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRleHRCdWZmZXIgPSAnJztcclxuICAgICAgICAgICAgICAgIGxldCBsYXN0RGF0ZVBhcnQgPSB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQgPSB0aGlzLmdldE5leHRTZWxlY3RhYmxlRGF0ZVBhcnQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYmx1ckRhdGVQYXJ0KGxhc3REYXRlUGFydCk7XHJcbiAgICAgICAgICAgIH0gXHJcbiAgICAgICAgICAgIHRyaWdnZXIuZ290byh0aGlzLmVsZW1lbnQsIHtcclxuICAgICAgICAgICAgICAgIGRhdGU6IG5ld0RhdGUsXHJcbiAgICAgICAgICAgICAgICBsZXZlbDogdGhpcy5zZWxlY3RlZERhdGVQYXJ0LmdldExldmVsKClcclxuICAgICAgICAgICAgfSk7IFxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMudGV4dEJ1ZmZlciA9IHRoaXMudGV4dEJ1ZmZlci5zbGljZSgwLCAtMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0Rmlyc3RTZWxlY3RhYmxlRGF0ZVBhcnQoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmRhdGVQYXJ0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kYXRlUGFydHNbaV0uaXNTZWxlY3RhYmxlKCkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlUGFydHNbaV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2b2lkIDA7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldExhc3RTZWxlY3RhYmxlRGF0ZVBhcnQoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IHRoaXMuZGF0ZVBhcnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGVQYXJ0c1tpXS5pc1NlbGVjdGFibGUoKSlcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGVQYXJ0c1tpXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZvaWQgMDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldE5leHRTZWxlY3RhYmxlRGF0ZVBhcnQoKSB7XHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLmRhdGVQYXJ0cy5pbmRleE9mKHRoaXMuc2VsZWN0ZWREYXRlUGFydCk7XHJcbiAgICAgICAgd2hpbGUgKCsraSA8IHRoaXMuZGF0ZVBhcnRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kYXRlUGFydHNbaV0uaXNTZWxlY3RhYmxlKCkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlUGFydHNbaV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQ7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRQcmV2aW91c1NlbGVjdGFibGVEYXRlUGFydCgpIHtcclxuICAgICAgICBsZXQgaSA9IHRoaXMuZGF0ZVBhcnRzLmluZGV4T2YodGhpcy5zZWxlY3RlZERhdGVQYXJ0KTtcclxuICAgICAgICB3aGlsZSAoLS1pID49IDApIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZGF0ZVBhcnRzW2ldLmlzU2VsZWN0YWJsZSgpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZVBhcnRzW2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZERhdGVQYXJ0O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0TmVhcmVzdFNlbGVjdGFibGVEYXRlUGFydChjYXJldFBvc2l0aW9uOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgZGlzdGFuY2U6bnVtYmVyID0gTnVtYmVyLk1BWF9WQUxVRTtcclxuICAgICAgICBsZXQgbmVhcmVzdERhdGVQYXJ0OklEYXRlUGFydDtcclxuICAgICAgICBsZXQgc3RhcnQgPSAwO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5kYXRlUGFydHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGRhdGVQYXJ0ID0gdGhpcy5kYXRlUGFydHNbaV07XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoZGF0ZVBhcnQuaXNTZWxlY3RhYmxlKCkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBmcm9tTGVmdCA9IGNhcmV0UG9zaXRpb24gLSBzdGFydDtcclxuICAgICAgICAgICAgICAgIGxldCBmcm9tUmlnaHQgPSBjYXJldFBvc2l0aW9uIC0gKHN0YXJ0ICsgZGF0ZVBhcnQudG9TdHJpbmcoKS5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZiAoZnJvbUxlZnQgPiAwICYmIGZyb21SaWdodCA8IDApIHJldHVybiBkYXRlUGFydDtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgbGV0IGQgPSBNYXRoLm1pbihNYXRoLmFicyhmcm9tTGVmdCksIE1hdGguYWJzKGZyb21SaWdodCkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGQgPD0gZGlzdGFuY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBuZWFyZXN0RGF0ZVBhcnQgPSBkYXRlUGFydDtcclxuICAgICAgICAgICAgICAgICAgICBkaXN0YW5jZSA9IGQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHN0YXJ0ICs9IGRhdGVQYXJ0LnRvU3RyaW5nKCkubGVuZ3RoO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gbmVhcmVzdERhdGVQYXJ0OyAgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBzZXRTZWxlY3RlZERhdGVQYXJ0KGRhdGVQYXJ0OklEYXRlUGFydCkge1xyXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkRGF0ZVBhcnQgIT09IGRhdGVQYXJ0KSB7XHJcbiAgICAgICAgICAgIHRoaXMudGV4dEJ1ZmZlciA9ICcnO1xyXG4gICAgICAgICAgICBsZXQgbGFzdFNlbGVjdGVkID0gdGhpcy5zZWxlY3RlZERhdGVQYXJ0O1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQgPSBkYXRlUGFydDtcclxuICAgICAgICAgICAgdGhpcy5ibHVyRGF0ZVBhcnQobGFzdFNlbGVjdGVkKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBibHVyRGF0ZVBhcnQoZGF0ZVBhcnQ6SURhdGVQYXJ0KSB7XHJcbiAgICAgICAgLypcclxuICAgICAgICBpZiAoZGF0ZVBhcnQgPT09IHZvaWQgMCkgcmV0dXJuO1xyXG4gICAgICAgIGxldCB2YWxpZCA9IGZhbHNlO1xyXG4gICAgICAgIHN3aXRjaChkYXRlUGFydC5nZXRMZXZlbCgpKSB7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuWUVBUjpcclxuICAgICAgICAgICAgICAgIHZhbGlkID0gdGhpcy5vcHRpb25zLmlzWWVhclNlbGVjdGFibGUoZGF0ZVBhcnQuZ2V0VmFsdWUoKSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5NT05USDpcclxuICAgICAgICAgICAgICAgIHZhbGlkID0gdGhpcy5vcHRpb25zLmlzTW9udGhTZWxlY3RhYmxlKGRhdGVQYXJ0LmdldFZhbHVlKCkpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuREFURTpcclxuICAgICAgICAgICAgICAgIHZhbGlkID0gdGhpcy5vcHRpb25zLmlzRGF0ZVNlbGVjdGFibGUoZGF0ZVBhcnQuZ2V0VmFsdWUoKSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5IT1VSOlxyXG4gICAgICAgICAgICAgICAgdmFsaWQgPSB0aGlzLm9wdGlvbnMuaXNIb3VyU2VsZWN0YWJsZShkYXRlUGFydC5nZXRWYWx1ZSgpKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLk1JTlVURTpcclxuICAgICAgICAgICAgICAgIHZhbGlkID0gdGhpcy5vcHRpb25zLmlzTWludXRlU2VsZWN0YWJsZShkYXRlUGFydC5nZXRWYWx1ZSgpKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLlNFQ09ORDpcclxuICAgICAgICAgICAgICAgIHZhbGlkID0gdGhpcy5vcHRpb25zLmlzU2Vjb25kU2VsZWN0YWJsZShkYXRlUGFydC5nZXRWYWx1ZSgpKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0cmlnZ2VyLmdvdG8odGhpcy5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgIGxldmVsOiB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQuZ2V0TGV2ZWwoKSxcclxuICAgICAgICAgICAgZGF0ZTogdmFsaWQgPyBkYXRlUGFydC5nZXRWYWx1ZSgpIDogZGF0ZVBhcnQuZ2V0TGFzdFZhbHVlKClcclxuICAgICAgICB9KTtcclxuICAgICAgICAqL1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0U2VsZWN0ZWREYXRlUGFydCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZERhdGVQYXJ0O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdXBkYXRlT3B0aW9ucyhvcHRpb25zOklPcHRpb25zKSB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmRhdGVQYXJ0cyA9IFBhcnNlci5wYXJzZShvcHRpb25zKTtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQgPSB2b2lkIDA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGZvcm1hdDpzdHJpbmcgPSAnXic7XHJcbiAgICAgICAgdGhpcy5kYXRlUGFydHMuZm9yRWFjaCgoZGF0ZVBhcnQpID0+IHtcclxuICAgICAgICAgICAgZm9ybWF0ICs9IGAoJHtkYXRlUGFydC5nZXRSZWdFeCgpLnNvdXJjZS5zbGljZSgxLC0xKX0pYDtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmZvcm1hdCA9IG5ldyBSZWdFeHAoZm9ybWF0KyckJywgJ2knKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnZpZXdjaGFuZ2VkKHRoaXMuZGF0ZSwgdGhpcy5sZXZlbCwgdHJ1ZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB1cGRhdGVWaWV3KCkge1xyXG4gICAgICAgIGxldCBkYXRlU3RyaW5nID0gJyc7XHJcbiAgICAgICAgdGhpcy5kYXRlUGFydHMuZm9yRWFjaCgoZGF0ZVBhcnQpID0+IHtcclxuICAgICAgICAgICAgZGF0ZVN0cmluZyArPSBkYXRlUGFydC50b1N0cmluZygpOyBcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQudmFsdWUgPSBkYXRlU3RyaW5nO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkRGF0ZVBhcnQgPT09IHZvaWQgMCkgcmV0dXJuO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBzdGFydCA9IDA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGkgPSAwO1xyXG4gICAgICAgIHdoaWxlICh0aGlzLmRhdGVQYXJ0c1tpXSAhPT0gdGhpcy5zZWxlY3RlZERhdGVQYXJ0KSB7XHJcbiAgICAgICAgICAgIHN0YXJ0ICs9IHRoaXMuZGF0ZVBhcnRzW2krK10udG9TdHJpbmcoKS5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBlbmQgPSBzdGFydCArIHRoaXMuc2VsZWN0ZWREYXRlUGFydC50b1N0cmluZygpLmxlbmd0aDtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc2V0U2VsZWN0aW9uUmFuZ2Uoc3RhcnQsIGVuZCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB2aWV3Y2hhbmdlZChkYXRlOkRhdGUsIGxldmVsOkxldmVsLCB1cGRhdGU/OmJvb2xlYW4pIHtcclxuICAgICAgICBsZXQgZGVmaW5lZCA9IGRhdGUgIT09IHZvaWQgMDtcclxuICAgICAgICB0aGlzLmRhdGUgPSBkYXRlIHx8IHRoaXMub3B0aW9ucy5kZWZhdWx0RGF0ZTtcclxuICAgICAgICB0aGlzLmxldmVsID0gbGV2ZWw7XHJcbiAgICAgICAgdGhpcy5kYXRlUGFydHMuZm9yRWFjaCgoZGF0ZVBhcnQpID0+IHtcclxuICAgICAgICAgICAgLy9sZXQgY3VycmVudFZhbGlkID0gZGF0ZVBhcnQuaXNEZWZpbmVkKCk7XHJcbiAgICAgICAgICAgIGlmICh1cGRhdGUpIGRhdGVQYXJ0LnNldFZhbHVlKHRoaXMuZGF0ZSk7XHJcbiAgICAgICAgICAgIGlmICh1cGRhdGUgJiYgZGVmaW5lZCAmJiBsZXZlbCA9PT0gZGF0ZVBhcnQuZ2V0TGV2ZWwoKSkge1xyXG4gICAgICAgICAgICAgICAgZGF0ZVBhcnQuc2V0RGVmaW5lZCh0cnVlKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICghZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgZGF0ZVBhcnQuc2V0RGVmaW5lZChmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGRhdGVQYXJ0LmlzU2VsZWN0YWJsZSgpICYmXHJcbiAgICAgICAgICAgICAgICBkYXRlUGFydC5nZXRMZXZlbCgpID09PSBsZXZlbCAmJlxyXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRTZWxlY3RlZERhdGVQYXJ0KCkgIT09IHZvaWQgMCAmJlxyXG4gICAgICAgICAgICAgICAgbGV2ZWwgIT09IHRoaXMuZ2V0U2VsZWN0ZWREYXRlUGFydCgpLmdldExldmVsKCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U2VsZWN0ZWREYXRlUGFydChkYXRlUGFydCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHRyaWdnZXJWaWV3Q2hhbmdlKCkge1xyXG4gICAgICAgIHRyaWdnZXIudmlld2NoYW5nZWQodGhpcy5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgIGRhdGU6IHRoaXMuZ2V0U2VsZWN0ZWREYXRlUGFydCgpLmdldFZhbHVlKCksXHJcbiAgICAgICAgICAgIGxldmVsOiB0aGlzLmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5nZXRMZXZlbCgpLFxyXG4gICAgICAgICAgICB1cGRhdGU6IGZhbHNlXHJcbiAgICAgICAgfSk7ICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG59IiwiY29uc3QgZW51bSBLRVkge1xyXG4gICAgUklHSFQgPSAzOSwgTEVGVCA9IDM3LCBUQUIgPSA5LCBVUCA9IDM4LFxyXG4gICAgRE9XTiA9IDQwLCBWID0gODYsIEMgPSA2NywgQSA9IDY1LCBIT01FID0gMzYsXHJcbiAgICBFTkQgPSAzNSwgQkFDS1NQQUNFID0gOFxyXG59XHJcblxyXG5jbGFzcyBLZXlib2FyZEV2ZW50SGFuZGxlciB7XHJcbiAgICBwcml2YXRlIHNoaWZ0VGFiRG93biA9IGZhbHNlO1xyXG4gICAgcHJpdmF0ZSB0YWJEb3duID0gZmFsc2U7XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgaW5wdXQ6SW5wdXQpIHtcclxuICAgICAgICBpbnB1dC5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIChlKSA9PiB0aGlzLmtleWRvd24oZSkpO1xyXG4gICAgICAgIGlucHV0LmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImZvY3VzXCIsICgpID0+IHRoaXMuZm9jdXMoKSk7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgKGUpID0+IHRoaXMuZG9jdW1lbnRLZXlkb3duKGUpKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGZvY3VzID0gKCk6dm9pZCA9PiB7XHJcbiAgICAgICAgaWYgKHRoaXMudGFiRG93bikge1xyXG4gICAgICAgICAgICBsZXQgZmlyc3QgPSB0aGlzLmlucHV0LmdldEZpcnN0U2VsZWN0YWJsZURhdGVQYXJ0KCk7XHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChmaXJzdCk7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICB0aGlzLmlucHV0LnRyaWdnZXJWaWV3Q2hhbmdlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zaGlmdFRhYkRvd24pIHtcclxuICAgICAgICAgICAgbGV0IGxhc3QgPSB0aGlzLmlucHV0LmdldExhc3RTZWxlY3RhYmxlRGF0ZVBhcnQoKTtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC5zZXRTZWxlY3RlZERhdGVQYXJ0KGxhc3QpO1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgdGhpcy5pbnB1dC50cmlnZ2VyVmlld0NoYW5nZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgZG9jdW1lbnRLZXlkb3duKGU6S2V5Ym9hcmRFdmVudCkge1xyXG4gICAgICAgIGlmIChlLnNoaWZ0S2V5ICYmIGUua2V5Q29kZSA9PT0gS0VZLlRBQikge1xyXG4gICAgICAgICAgICB0aGlzLnNoaWZ0VGFiRG93biA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIGlmIChlLmtleUNvZGUgPT09IEtFWS5UQUIpIHtcclxuICAgICAgICAgICAgdGhpcy50YWJEb3duID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hpZnRUYWJEb3duID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMudGFiRG93biA9IGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGtleWRvd24oZTpLZXlib2FyZEV2ZW50KSB7XHJcbiAgICAgICAgbGV0IGNvZGUgPSBlLmtleUNvZGU7XHJcbiAgICAgICAgaWYgKGNvZGUgPj0gOTYgJiYgY29kZSA8PSAxMDUpIHtcclxuICAgICAgICAgICAgY29kZSAtPSA0ODtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKChjb2RlID09PSBLRVkuSE9NRSB8fCBjb2RlID09PSBLRVkuRU5EKSAmJiBlLnNoaWZ0S2V5KSByZXR1cm47XHJcbiAgICAgICAgaWYgKChjb2RlID09PSBLRVkuTEVGVCB8fCBjb2RlID09PSBLRVkuUklHSFQpICYmIGUuc2hpZnRLZXkpIHJldHVybjtcclxuICAgICAgICBpZiAoKGNvZGUgPT09IEtFWS5DIHx8IGNvZGUgPT09IEtFWS5BIHx8IGNvZGUgPT09IEtFWS5WKSAmJiBlLmN0cmxLZXkpIHJldHVybjtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgcHJldmVudERlZmF1bHQgPSB0cnVlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChjb2RlID09PSBLRVkuSE9NRSkge1xyXG4gICAgICAgICAgICB0aGlzLmhvbWUoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IEtFWS5FTkQpIHtcclxuICAgICAgICAgICAgdGhpcy5lbmQoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IEtFWS5MRUZUKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGVmdCgpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gS0VZLlJJR0hUKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmlnaHQoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IEtFWS5UQUIgJiYgZS5zaGlmdEtleSkge1xyXG4gICAgICAgICAgICBwcmV2ZW50RGVmYXVsdCA9IHRoaXMuc2hpZnRUYWIoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IEtFWS5UQUIpIHtcclxuICAgICAgICAgICAgcHJldmVudERlZmF1bHQgPSB0aGlzLnRhYigpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gS0VZLlVQKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXAoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IEtFWS5ET1dOKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZG93bigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZiAocHJldmVudERlZmF1bHQpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBsZXQga2V5UHJlc3NlZCA9IFN0cmluZy5mcm9tQ2hhckNvZGUoY29kZSk7XHJcbiAgICAgICAgaWYgKC9eWzAtOV18W0Etel0kLy50ZXN0KGtleVByZXNzZWQpKSB7XHJcbiAgICAgICAgICAgIGxldCB0ZXh0QnVmZmVyID0gdGhpcy5pbnB1dC5nZXRUZXh0QnVmZmVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXQuc2V0VGV4dEJ1ZmZlcih0ZXh0QnVmZmVyICsga2V5UHJlc3NlZCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb2RlID09PSBLRVkuQkFDS1NQQUNFKSB7XHJcbiAgICAgICAgICAgIGxldCB0ZXh0QnVmZmVyID0gdGhpcy5pbnB1dC5nZXRUZXh0QnVmZmVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXQuc2V0VGV4dEJ1ZmZlcih0ZXh0QnVmZmVyLnNsaWNlKDAsIC0xKSk7XHJcbiAgICAgICAgICAgIGlmICh0ZXh0QnVmZmVyLmxlbmd0aCA8IDIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQuZ2V0U2VsZWN0ZWREYXRlUGFydCgpLnNldERlZmluZWQoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbnB1dC50cmlnZ2VyVmlld0NoYW5nZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmICghZS5zaGlmdEtleSkge1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0LnNldFRleHRCdWZmZXIoJycpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBob21lKCkge1xyXG4gICAgICAgIGxldCBmaXJzdCA9IHRoaXMuaW5wdXQuZ2V0Rmlyc3RTZWxlY3RhYmxlRGF0ZVBhcnQoKTtcclxuICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQoZmlyc3QpO1xyXG4gICAgICAgIHRoaXMuaW5wdXQudHJpZ2dlclZpZXdDaGFuZ2UoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBlbmQoKSB7XHJcbiAgICAgICAgbGV0IGxhc3QgPSB0aGlzLmlucHV0LmdldExhc3RTZWxlY3RhYmxlRGF0ZVBhcnQoKTtcclxuICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQobGFzdCk7ICAgICBcclxuICAgICAgICB0aGlzLmlucHV0LnRyaWdnZXJWaWV3Q2hhbmdlKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgbGVmdCgpIHtcclxuICAgICAgICBsZXQgcHJldmlvdXMgPSB0aGlzLmlucHV0LmdldFByZXZpb3VzU2VsZWN0YWJsZURhdGVQYXJ0KCk7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5zZXRTZWxlY3RlZERhdGVQYXJ0KHByZXZpb3VzKTtcclxuICAgICAgICB0aGlzLmlucHV0LnRyaWdnZXJWaWV3Q2hhbmdlKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgcmlnaHQoKSB7XHJcbiAgICAgICAgbGV0IG5leHQgPSB0aGlzLmlucHV0LmdldE5leHRTZWxlY3RhYmxlRGF0ZVBhcnQoKTtcclxuICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQobmV4dCk7XHJcbiAgICAgICAgdGhpcy5pbnB1dC50cmlnZ2VyVmlld0NoYW5nZSgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHNoaWZ0VGFiKCkge1xyXG4gICAgICAgIGxldCBwcmV2aW91cyA9IHRoaXMuaW5wdXQuZ2V0UHJldmlvdXNTZWxlY3RhYmxlRGF0ZVBhcnQoKTtcclxuICAgICAgICBpZiAocHJldmlvdXMgIT09IHRoaXMuaW5wdXQuZ2V0U2VsZWN0ZWREYXRlUGFydCgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChwcmV2aW91cyk7XHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXQudHJpZ2dlclZpZXdDaGFuZ2UoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSB0YWIoKSB7XHJcbiAgICAgICAgbGV0IG5leHQgPSB0aGlzLmlucHV0LmdldE5leHRTZWxlY3RhYmxlRGF0ZVBhcnQoKTtcclxuICAgICAgICBpZiAobmV4dCAhPT0gdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkpIHtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC5zZXRTZWxlY3RlZERhdGVQYXJ0KG5leHQpO1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0LnRyaWdnZXJWaWV3Q2hhbmdlKCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgdXAoKSB7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuaW5jcmVtZW50KCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGxldmVsID0gdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0TGV2ZWwoKTtcclxuICAgICAgICBsZXQgZGF0ZSA9IHRoaXMuaW5wdXQuZ2V0U2VsZWN0ZWREYXRlUGFydCgpLmdldFZhbHVlKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdHJpZ2dlci5nb3RvKHRoaXMuaW5wdXQuZWxlbWVudCwge1xyXG4gICAgICAgICAgICBkYXRlOiBkYXRlLFxyXG4gICAgICAgICAgICBsZXZlbDogbGV2ZWxcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBkb3duKCkge1xyXG4gICAgICAgIHRoaXMuaW5wdXQuZ2V0U2VsZWN0ZWREYXRlUGFydCgpLmRlY3JlbWVudCgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBsZXZlbCA9IHRoaXMuaW5wdXQuZ2V0U2VsZWN0ZWREYXRlUGFydCgpLmdldExldmVsKCk7XHJcbiAgICAgICAgbGV0IGRhdGUgPSB0aGlzLmlucHV0LmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5nZXRWYWx1ZSgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRyaWdnZXIuZ290byh0aGlzLmlucHV0LmVsZW1lbnQsIHtcclxuICAgICAgICAgICAgZGF0ZTogZGF0ZSxcclxuICAgICAgICAgICAgbGV2ZWw6IGxldmVsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0iLCJjbGFzcyBNb3VzZUV2ZW50SGFuZGxlciB7XHJcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGlucHV0OklucHV0KSB7XHJcbiAgICAgICAgbGlzdGVuLm1vdXNlZG93bihpbnB1dC5lbGVtZW50LCAoKSA9PiB0aGlzLm1vdXNlZG93bigpKTtcclxuICAgICAgICBsaXN0ZW4ubW91c2V1cChkb2N1bWVudCwgKCkgPT4gdGhpcy5tb3VzZXVwKCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFN0b3AgZGVmYXVsdFxyXG4gICAgICAgIGlucHV0LmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdlbnRlclwiLCAoZSkgPT4gZS5wcmV2ZW50RGVmYXVsdCgpKTtcclxuICAgICAgICBpbnB1dC5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnb3ZlclwiLCAoZSkgPT4gZS5wcmV2ZW50RGVmYXVsdCgpKTtcclxuICAgICAgICBpbnB1dC5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkcm9wXCIsIChlKSA9PiBlLnByZXZlbnREZWZhdWx0KCkpO1xyXG4gICAgICAgIGlucHV0LmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImN1dFwiLCAoZSkgPT4gZS5wcmV2ZW50RGVmYXVsdCgpKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBkb3duOmJvb2xlYW47XHJcbiAgICBwcml2YXRlIGNhcmV0U3RhcnQ6bnVtYmVyO1xyXG4gICAgXHJcbiAgICBwcml2YXRlIG1vdXNlZG93bigpIHtcclxuICAgICAgICB0aGlzLmRvd24gPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuaW5wdXQuZWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZSh2b2lkIDAsIHZvaWQgMCk7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgdGhpcy5jYXJldFN0YXJ0ID0gdGhpcy5pbnB1dC5lbGVtZW50LnNlbGVjdGlvblN0YXJ0OyBcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBtb3VzZXVwID0gKCkgPT4ge1xyXG4gICAgICAgIGlmICghdGhpcy5kb3duKSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5kb3duID0gZmFsc2U7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHBvczpudW1iZXI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMuaW5wdXQuZWxlbWVudC5zZWxlY3Rpb25TdGFydCA9PT0gdGhpcy5jYXJldFN0YXJ0KSB7XHJcbiAgICAgICAgICAgIHBvcyA9IHRoaXMuaW5wdXQuZWxlbWVudC5zZWxlY3Rpb25FbmQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcG9zID0gdGhpcy5pbnB1dC5lbGVtZW50LnNlbGVjdGlvblN0YXJ0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBsZXQgYmxvY2sgPSB0aGlzLmlucHV0LmdldE5lYXJlc3RTZWxlY3RhYmxlRGF0ZVBhcnQocG9zKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQoYmxvY2spO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLmlucHV0LmVsZW1lbnQuc2VsZWN0aW9uU3RhcnQgPiAwIHx8IHRoaXMuaW5wdXQuZWxlbWVudC5zZWxlY3Rpb25FbmQgPCB0aGlzLmlucHV0LmVsZW1lbnQudmFsdWUubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXQudHJpZ2dlclZpZXdDaGFuZ2UoKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59IiwiY2xhc3MgUGFyc2VyIHtcclxuICAgIHB1YmxpYyBzdGF0aWMgcGFyc2Uob3B0aW9uczpJT3B0aW9ucyk6SURhdGVQYXJ0W10ge1xyXG4gICAgICAgIGxldCB0ZXh0QnVmZmVyID0gJyc7XHJcbiAgICAgICAgbGV0IGRhdGVQYXJ0czpJRGF0ZVBhcnRbXSA9IFtdO1xyXG4gICAgXHJcbiAgICAgICAgbGV0IGluZGV4ID0gMDsgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgbGV0IGluRXNjYXBlZFNlZ21lbnQgPSBmYWxzZTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgcHVzaFBsYWluVGV4dCA9ICgpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRleHRCdWZmZXIubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgZGF0ZVBhcnRzLnB1c2gobmV3IFBsYWluVGV4dCh0ZXh0QnVmZmVyKS5zZXRTZWxlY3RhYmxlKGZhbHNlKSk7XHJcbiAgICAgICAgICAgICAgICB0ZXh0QnVmZmVyID0gJyc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgd2hpbGUgKGluZGV4IDwgb3B0aW9ucy5kaXNwbGF5QXMubGVuZ3RoKSB7ICAgICBcclxuICAgICAgICAgICAgaWYgKCFpbkVzY2FwZWRTZWdtZW50ICYmIG9wdGlvbnMuZGlzcGxheUFzW2luZGV4XSA9PT0gJ1snKSB7XHJcbiAgICAgICAgICAgICAgICBpbkVzY2FwZWRTZWdtZW50ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGluZGV4Kys7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKGluRXNjYXBlZFNlZ21lbnQgJiYgb3B0aW9ucy5kaXNwbGF5QXNbaW5kZXhdID09PSAnXScpIHtcclxuICAgICAgICAgICAgICAgIGluRXNjYXBlZFNlZ21lbnQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGluZGV4Kys7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKGluRXNjYXBlZFNlZ21lbnQpIHtcclxuICAgICAgICAgICAgICAgIHRleHRCdWZmZXIgKz0gb3B0aW9ucy5kaXNwbGF5QXNbaW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgaW5kZXgrKztcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgZm91bmQgPSBmYWxzZTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGZvciAobGV0IGNvZGUgaW4gZm9ybWF0QmxvY2tzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoUGFyc2VyLmZpbmRBdChvcHRpb25zLmRpc3BsYXlBcywgaW5kZXgsIGB7JHtjb2RlfX1gKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHB1c2hQbGFpblRleHQoKTtcclxuICAgICAgICAgICAgICAgICAgICBkYXRlUGFydHMucHVzaChuZXcgZm9ybWF0QmxvY2tzW2NvZGVdKG9wdGlvbnMpLnNldFNlbGVjdGFibGUoZmFsc2UpKTtcclxuICAgICAgICAgICAgICAgICAgICBpbmRleCArPSBjb2RlLmxlbmd0aCArIDI7XHJcbiAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChQYXJzZXIuZmluZEF0KG9wdGlvbnMuZGlzcGxheUFzLCBpbmRleCwgY29kZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBwdXNoUGxhaW5UZXh0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZVBhcnRzLnB1c2gobmV3IGZvcm1hdEJsb2Nrc1tjb2RlXShvcHRpb25zKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggKz0gY29kZS5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoIWZvdW5kKSB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0QnVmZmVyICs9IG9wdGlvbnMuZGlzcGxheUFzW2luZGV4XTtcclxuICAgICAgICAgICAgICAgIGluZGV4Kys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1c2hQbGFpblRleHQoKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgIHJldHVybiBkYXRlUGFydHM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgc3RhdGljIGZpbmRBdCAoc3RyOnN0cmluZywgaW5kZXg6bnVtYmVyLCBzZWFyY2g6c3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIHN0ci5zbGljZShpbmRleCwgaW5kZXggKyBzZWFyY2gubGVuZ3RoKSA9PT0gc2VhcmNoO1xyXG4gICAgfVxyXG59IiwiY2xhc3MgUGFzdGVFdmVudEhhbmRlciB7XHJcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGlucHV0OklucHV0KSB7XHJcbiAgICAgICAgbGlzdGVuLnBhc3RlKGlucHV0LmVsZW1lbnQsICgpID0+IHRoaXMucGFzdGUoKSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgcGFzdGUoKSB7XHJcbiAgICAgICAgLy9UT0RPIGZpeCB0aGlzIGNhdXNlIGl0J3Mgbm90IHdvcmtpbmdcclxuICAgICAgICBsZXQgb3JpZ2luYWxWYWx1ZSA9IHRoaXMuaW5wdXQuZWxlbWVudC52YWx1ZTtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICBpZiAoIXRoaXMuaW5wdXQuZm9ybWF0LnRlc3QodGhpcy5pbnB1dC5lbGVtZW50LnZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICB0aGlzLmlucHV0LmVsZW1lbnQudmFsdWUgPSBvcmlnaW5hbFZhbHVlO1xyXG4gICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgfSBcclxuICAgICAgICAgICBcclxuICAgICAgICAgICBsZXQgbmV3RGF0ZSA9IHRoaXMuaW5wdXQuZ2V0U2VsZWN0ZWREYXRlUGFydCgpLmdldFZhbHVlKCk7XHJcbiAgICAgICAgICAgXHJcbiAgICAgICAgICAgbGV0IHN0clByZWZpeCA9ICcnO1xyXG4gICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5pbnB1dC5kYXRlUGFydHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgbGV0IGRhdGVQYXJ0ID0gdGhpcy5pbnB1dC5kYXRlUGFydHNbaV07XHJcbiAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICBsZXQgcmVnRXhwID0gbmV3IFJlZ0V4cChkYXRlUGFydC5nZXRSZWdFeCgpLnNvdXJjZS5zbGljZSgxLCAtMSksICdpJyk7XHJcbiAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICBsZXQgdmFsID0gdGhpcy5pbnB1dC5lbGVtZW50LnZhbHVlLnJlcGxhY2Uoc3RyUHJlZml4LCAnJykubWF0Y2gocmVnRXhwKVswXTtcclxuICAgICAgICAgICAgICAgc3RyUHJlZml4ICs9IHZhbDtcclxuICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgIGlmICghZGF0ZVBhcnQuaXNTZWxlY3RhYmxlKCkpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgZGF0ZVBhcnQuc2V0VmFsdWUobmV3RGF0ZSk7XHJcbiAgICAgICAgICAgICAgIGlmIChkYXRlUGFydC5zZXRWYWx1ZSh2YWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICB0aGlzLmlucHV0LmJsdXJEYXRlUGFydChkYXRlUGFydCk7XHJcbiAgICAgICAgICAgICAgICAgICBuZXdEYXRlID0gZGF0ZVBhcnQuZ2V0VmFsdWUoKTtcclxuICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgIC8vIFRPRE8gc2V0IGFsbCBkYXRlcGFydHMgYmFjayB0byBvcmlnaW5hbCB2YWx1ZVxyXG4gICAgICAgICAgICAgICAgICAgdGhpcy5pbnB1dC5lbGVtZW50LnZhbHVlID0gb3JpZ2luYWxWYWx1ZTtcclxuICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgIH1cclxuICAgICAgICAgICBcclxuICAgICAgICAgICB0cmlnZ2VyLmdvdG8odGhpcy5pbnB1dC5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgICAgIGRhdGU6IG5ld0RhdGUsXHJcbiAgICAgICAgICAgICAgIGxldmVsOiB0aGlzLmlucHV0LmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5nZXRMZXZlbCgpXHJcbiAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0iLCJjb25zdCBlbnVtIFN0ZXBEaXJlY3Rpb24ge1xyXG4gICAgVVAsIERPV05cclxufVxyXG5cclxuY2xhc3MgSGVhZGVyIGV4dGVuZHMgQ29tbW9uIHtcclxuICAgIHByaXZhdGUgeWVhckxhYmVsOkVsZW1lbnQ7XHJcbiAgICBwcml2YXRlIG1vbnRoTGFiZWw6RWxlbWVudDtcclxuICAgIHByaXZhdGUgZGF0ZUxhYmVsOkVsZW1lbnQ7XHJcbiAgICBwcml2YXRlIGhvdXJMYWJlbDpFbGVtZW50O1xyXG4gICAgcHJpdmF0ZSBtaW51dGVMYWJlbDpFbGVtZW50O1xyXG4gICAgcHJpdmF0ZSBzZWNvbmRMYWJlbDpFbGVtZW50O1xyXG4gICAgXHJcbiAgICBwcml2YXRlIGxhYmVsczpFbGVtZW50W107XHJcbiAgICBcclxuICAgIHByaXZhdGUgb3B0aW9uczpJT3B0aW9ucztcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBsZXZlbDpMZXZlbDtcclxuICAgIHByaXZhdGUgZGF0ZTpEYXRlO1xyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVsZW1lbnQ6SFRNTEVsZW1lbnQsIHByaXZhdGUgY29udGFpbmVyOkhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4udmlld2NoYW5nZWQoZWxlbWVudCwgKGUpID0+IHRoaXMudmlld2NoYW5nZWQoZS5kYXRlLCBlLmxldmVsKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy55ZWFyTGFiZWwgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcignZGF0aXVtLXNwYW4tbGFiZWwuZGF0aXVtLXllYXInKTtcclxuICAgICAgICB0aGlzLm1vbnRoTGFiZWwgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcignZGF0aXVtLXNwYW4tbGFiZWwuZGF0aXVtLW1vbnRoJyk7XHJcbiAgICAgICAgdGhpcy5kYXRlTGFiZWwgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcignZGF0aXVtLXNwYW4tbGFiZWwuZGF0aXVtLWRhdGUnKTtcclxuICAgICAgICB0aGlzLmhvdXJMYWJlbCA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdkYXRpdW0tc3Bhbi1sYWJlbC5kYXRpdW0taG91cicpO1xyXG4gICAgICAgIHRoaXMubWludXRlTGFiZWwgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcignZGF0aXVtLXNwYW4tbGFiZWwuZGF0aXVtLW1pbnV0ZScpO1xyXG4gICAgICAgIHRoaXMuc2Vjb25kTGFiZWwgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcignZGF0aXVtLXNwYW4tbGFiZWwuZGF0aXVtLXNlY29uZCcpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMubGFiZWxzID0gW3RoaXMueWVhckxhYmVsLCB0aGlzLm1vbnRoTGFiZWwsIHRoaXMuZGF0ZUxhYmVsLCB0aGlzLmhvdXJMYWJlbCwgdGhpcy5taW51dGVMYWJlbCwgdGhpcy5zZWNvbmRMYWJlbF07XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHByZXZpb3VzQnV0dG9uID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1wcmV2Jyk7XHJcbiAgICAgICAgbGV0IG5leHRCdXR0b24gPSBjb250YWluZXIucXVlcnlTZWxlY3RvcignZGF0aXVtLW5leHQnKTtcclxuICAgICAgICBsZXQgc3BhbkxhYmVsQ29udGFpbmVyID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1zcGFuLWxhYmVsLWNvbnRhaW5lcicpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi50YXAocHJldmlvdXNCdXR0b24sICgpID0+IHRoaXMucHJldmlvdXMoKSk7XHJcbiAgICAgICAgbGlzdGVuLnRhcChuZXh0QnV0dG9uLCAoKSA9PiB0aGlzLm5leHQoKSk7XHJcbiAgICAgICAgbGlzdGVuLnRhcChzcGFuTGFiZWxDb250YWluZXIsICgpID0+IHRoaXMuem9vbU91dCgpKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHByZXZpb3VzKCkge1xyXG4gICAgICAgIHRyaWdnZXIuZ290byh0aGlzLmVsZW1lbnQsIHtcclxuICAgICAgICAgICBkYXRlOiB0aGlzLnN0ZXBEYXRlKFN0ZXBEaXJlY3Rpb24uRE9XTiksXHJcbiAgICAgICAgICAgbGV2ZWw6IHRoaXMubGV2ZWwsXHJcbiAgICAgICAgICAgdXBkYXRlOiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgbmV4dCgpIHtcclxuICAgICAgICB0cmlnZ2VyLmdvdG8odGhpcy5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgZGF0ZTogdGhpcy5zdGVwRGF0ZShTdGVwRGlyZWN0aW9uLlVQKSxcclxuICAgICAgICAgICBsZXZlbDogdGhpcy5sZXZlbCxcclxuICAgICAgICAgICB1cGRhdGU6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgem9vbU91dCgpIHtcclxuICAgICAgICB0cmlnZ2VyLnpvb21PdXQodGhpcy5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgIGRhdGU6IHRoaXMuZGF0ZSxcclxuICAgICAgICAgICAgY3VycmVudExldmVsOiB0aGlzLmxldmVsLFxyXG4gICAgICAgICAgICB1cGRhdGU6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgc3RlcERhdGUoc3RlcFR5cGU6U3RlcERpcmVjdGlvbik6RGF0ZSB7XHJcbiAgICAgICAgbGV0IGRhdGUgPSBuZXcgRGF0ZSh0aGlzLmRhdGUudmFsdWVPZigpKTtcclxuICAgICAgICBsZXQgZGlyZWN0aW9uID0gc3RlcFR5cGUgPT09IFN0ZXBEaXJlY3Rpb24uVVAgPyAxIDogLTE7XHJcbiAgICAgICAgXHJcbiAgICAgICAgc3dpdGNoICh0aGlzLmxldmVsKSB7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuWUVBUjpcclxuICAgICAgICAgICAgICAgIGRhdGUuc2V0RnVsbFllYXIoZGF0ZS5nZXRGdWxsWWVhcigpICsgMTAgKiBkaXJlY3Rpb24pOyAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuTU9OVEg6XHJcbiAgICAgICAgICAgICAgICBkYXRlLnNldEZ1bGxZZWFyKGRhdGUuZ2V0RnVsbFllYXIoKSArIGRpcmVjdGlvbik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5EQVRFOlxyXG4gICAgICAgICAgICAgICAgZGF0ZS5zZXRNb250aChkYXRlLmdldE1vbnRoKCkgKyBkaXJlY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuSE9VUjpcclxuICAgICAgICAgICAgICAgIGRhdGUuc2V0RGF0ZShkYXRlLmdldERhdGUoKSArIGRpcmVjdGlvbik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5NSU5VVEU6XHJcbiAgICAgICAgICAgICAgICBkYXRlLnNldEhvdXJzKGRhdGUuZ2V0SG91cnMoKSArIGRpcmVjdGlvbik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5TRUNPTkQ6XHJcbiAgICAgICAgICAgICAgICBkYXRlLnNldE1pbnV0ZXMoZGF0ZS5nZXRNaW51dGVzKCkgKyBkaXJlY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiBkYXRlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHZpZXdjaGFuZ2VkKGRhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWwpIHtcclxuICAgICAgICAvLyBUT0RPIHRoaW5rIGFib3V0IG1ha2luZyBhIFwidmlld0RhdGVcIiBhbmQgYSBcInNlbGVjdGVkRGF0ZVwiXHJcbiAgICAgICAgdGhpcy5kYXRlID0gZGF0ZTtcclxuICAgICAgICB0aGlzLmxldmVsID0gbGV2ZWw7XHJcbiAgICAgICAgdGhpcy5sYWJlbHMuZm9yRWFjaCgobGFiZWwsIGxhYmVsTGV2ZWwpID0+IHtcclxuICAgICAgICAgICAgbGFiZWwuY2xhc3NMaXN0LnJlbW92ZSgnZGF0aXVtLXRvcCcpO1xyXG4gICAgICAgICAgICBsYWJlbC5jbGFzc0xpc3QucmVtb3ZlKCdkYXRpdW0tYm90dG9tJyk7XHJcbiAgICAgICAgICAgIGxhYmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1oaWRkZW4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChsYWJlbExldmVsIDwgbGV2ZWwpIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS10b3AnKTtcclxuICAgICAgICAgICAgICAgIGxhYmVsLmlubmVySFRNTCA9IHRoaXMuZ2V0SGVhZGVyVG9wVGV4dCh0aGlzLmRhdGUsIGxhYmVsTGV2ZWwpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGFiZWwuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLWJvdHRvbScpO1xyXG4gICAgICAgICAgICAgICAgbGFiZWwuaW5uZXJIVE1MID0gdGhpcy5nZXRIZWFkZXJCb3R0b21UZXh0KHRoaXMuZGF0ZSwgbGFiZWxMZXZlbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChsYWJlbExldmVsIDwgbGV2ZWwgLSAxIHx8IGxhYmVsTGV2ZWwgPiBsZXZlbCkge1xyXG4gICAgICAgICAgICAgICAgbGFiZWwuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLWhpZGRlbicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgZ2V0SGVhZGVyVG9wVGV4dChkYXRlOkRhdGUsIGxldmVsOkxldmVsKTpzdHJpbmcge1xyXG4gICAgICAgIHN3aXRjaChsZXZlbCkge1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLllFQVI6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXREZWNhZGUoZGF0ZSk7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuTU9OVEg6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0ZS5nZXRGdWxsWWVhcigpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuREFURTpcclxuICAgICAgICAgICAgICAgIHJldHVybiBgJHt0aGlzLmdldFNob3J0TW9udGhzKClbZGF0ZS5nZXRNb250aCgpXX0gJHtkYXRlLmdldEZ1bGxZZWFyKCl9YDtcclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5IT1VSOlxyXG4gICAgICAgICAgICBjYXNlIExldmVsLk1JTlVURTpcclxuICAgICAgICAgICAgICAgIHJldHVybiBgJHt0aGlzLmdldFNob3J0RGF5cygpW2RhdGUuZ2V0RGF5KCldfSAke3RoaXMucGFkKGRhdGUuZ2V0RGF0ZSgpKX0gJHt0aGlzLmdldFNob3J0TW9udGhzKClbZGF0ZS5nZXRNb250aCgpXX0gJHtkYXRlLmdldEZ1bGxZZWFyKCl9YDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgZ2V0SGVhZGVyQm90dG9tVGV4dChkYXRlOkRhdGUsIGxldmVsOkxldmVsKTpzdHJpbmcge1xyXG4gICAgICAgIHN3aXRjaChsZXZlbCkge1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLllFQVI6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXREZWNhZGUoZGF0ZSk7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuTU9OVEg6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0ZS5nZXRGdWxsWWVhcigpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuREFURTpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFNob3J0TW9udGhzKClbZGF0ZS5nZXRNb250aCgpXTtcclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5IT1VSOlxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5taWxpdGFyeVRpbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCR7dGhpcy5nZXRTaG9ydERheXMoKVtkYXRlLmdldERheSgpXX0gJHt0aGlzLnBhZChkYXRlLmdldERhdGUoKSl9IDxkYXRpdW0tdmFyaWFibGU+JHt0aGlzLnBhZChkYXRlLmdldEhvdXJzKCkpfTxkYXRpdW0tbG93ZXI+aHI8L2RhdGl1bS1sb3dlcj48L2RhdGl1bS12YXJpYWJsZT5gO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCR7dGhpcy5nZXRTaG9ydERheXMoKVtkYXRlLmdldERheSgpXX0gJHt0aGlzLnBhZChkYXRlLmdldERhdGUoKSl9IDxkYXRpdW0tdmFyaWFibGU+JHt0aGlzLmdldEhvdXJzKGRhdGUpfSR7dGhpcy5nZXRNZXJpZGllbShkYXRlKX08L2RhdGl1bS12YXJpYWJsZT5gOyAgICBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5NSU5VVEU6XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLm1pbGl0YXJ5VGltZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHt0aGlzLnBhZChkYXRlLmdldEhvdXJzKCkpfTo8ZGF0aXVtLXZhcmlhYmxlPiR7dGhpcy5wYWQoZGF0ZS5nZXRNaW51dGVzKCkpfTwvZGF0aXVtLXZhcmlhYmxlPmA7ICAgIFxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCR7dGhpcy5nZXRIb3VycyhkYXRlKX06PGRhdGl1bS12YXJpYWJsZT4ke3RoaXMucGFkKGRhdGUuZ2V0TWludXRlcygpKX08L2RhdGl1bS12YXJpYWJsZT4ke3RoaXMuZ2V0TWVyaWRpZW0oZGF0ZSl9YDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5TRUNPTkQ6XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLm1pbGl0YXJ5VGltZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHt0aGlzLnBhZChkYXRlLmdldEhvdXJzKCkpfToke3RoaXMucGFkKGRhdGUuZ2V0TWludXRlcygpKX06PGRhdGl1bS12YXJpYWJsZT4ke3RoaXMucGFkKGRhdGUuZ2V0U2Vjb25kcygpKX08L2RhdGl1bS12YXJpYWJsZT5gOyAgIFxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCR7dGhpcy5nZXRIb3VycyhkYXRlKX06JHt0aGlzLnBhZChkYXRlLmdldE1pbnV0ZXMoKSl9OjxkYXRpdW0tdmFyaWFibGU+JHt0aGlzLnBhZChkYXRlLmdldFNlY29uZHMoKSl9PC9kYXRpdW0tdmFyaWFibGU+JHt0aGlzLmdldE1lcmlkaWVtKGRhdGUpfWA7ICAgIFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHVwZGF0ZU9wdGlvbnMob3B0aW9uczpJT3B0aW9ucykge1xyXG4gICAgICAgIGxldCB1cGRhdGVWaWV3ID0gdGhpcy5vcHRpb25zICE9PSB2b2lkIDAgJiYgdGhpcy5vcHRpb25zLm1pbGl0YXJ5VGltZSAhPT0gb3B0aW9ucy5taWxpdGFyeVRpbWU7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuICAgICAgICBpZiAodXBkYXRlVmlldykge1xyXG4gICAgICAgICAgICB0aGlzLnZpZXdjaGFuZ2VkKHRoaXMuZGF0ZSwgdGhpcy5sZXZlbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiY29uc3QgZW51bSBUcmFuc2l0aW9uIHtcclxuICAgIFNMSURFX0xFRlQsXHJcbiAgICBTTElERV9SSUdIVCxcclxuICAgIFpPT01fSU4sXHJcbiAgICBaT09NX09VVFxyXG59XHJcblxyXG5jbGFzcyBQaWNrZXJNYW5hZ2VyIHtcclxuICAgIHByaXZhdGUgb3B0aW9uczpJT3B0aW9ucztcclxuICAgIHB1YmxpYyBjb250YWluZXI6SFRNTEVsZW1lbnQ7XHJcbiAgICBwdWJsaWMgaGVhZGVyOkhlYWRlcjtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSB5ZWFyUGlja2VyOklQaWNrZXI7XHJcbiAgICBwcml2YXRlIG1vbnRoUGlja2VyOklQaWNrZXI7XHJcbiAgICBwcml2YXRlIGRhdGVQaWNrZXI6SVBpY2tlcjtcclxuICAgIHByaXZhdGUgaG91clBpY2tlcjpJVGltZVBpY2tlcjtcclxuICAgIHByaXZhdGUgbWludXRlUGlja2VyOklUaW1lUGlja2VyO1xyXG4gICAgcHJpdmF0ZSBzZWNvbmRQaWNrZXI6SVRpbWVQaWNrZXI7XHJcbiAgICBcclxuICAgIHB1YmxpYyBjdXJyZW50UGlja2VyOklQaWNrZXI7XHJcbiAgICBcclxuICAgIHByaXZhdGUgcGlja2VyQ29udGFpbmVyOkhUTUxFbGVtZW50O1xyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVsZW1lbnQ6SFRNTElucHV0RWxlbWVudCkge1xyXG4gICAgICAgIHRoaXMuY29udGFpbmVyID0gdGhpcy5jcmVhdGVWaWV3KCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5pbnNlcnRBZnRlcihlbGVtZW50LCB0aGlzLmNvbnRhaW5lcik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5waWNrZXJDb250YWluZXIgPSA8SFRNTEVsZW1lbnQ+dGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcignZGF0aXVtLXBpY2tlci1jb250YWluZXInKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmhlYWRlciA9IG5ldyBIZWFkZXIoZWxlbWVudCwgdGhpcy5jb250YWluZXIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMueWVhclBpY2tlciA9IG5ldyBZZWFyUGlja2VyKGVsZW1lbnQsIHRoaXMuY29udGFpbmVyKTtcclxuICAgICAgICB0aGlzLm1vbnRoUGlja2VyID0gbmV3IE1vbnRoUGlja2VyKGVsZW1lbnQsIHRoaXMuY29udGFpbmVyKTtcclxuICAgICAgICB0aGlzLmRhdGVQaWNrZXIgPSBuZXcgRGF0ZVBpY2tlcihlbGVtZW50LCB0aGlzLmNvbnRhaW5lcik7XHJcbiAgICAgICAgdGhpcy5ob3VyUGlja2VyID0gbmV3IEhvdXJQaWNrZXIoZWxlbWVudCwgdGhpcy5jb250YWluZXIpO1xyXG4gICAgICAgIHRoaXMubWludXRlUGlja2VyID0gbmV3IE1pbnV0ZVBpY2tlcihlbGVtZW50LCB0aGlzLmNvbnRhaW5lcik7XHJcbiAgICAgICAgdGhpcy5zZWNvbmRQaWNrZXIgPSBuZXcgU2Vjb25kUGlja2VyKGVsZW1lbnQsIHRoaXMuY29udGFpbmVyKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi5kb3duKHRoaXMuY29udGFpbmVyLCAnKicsIChlKSA9PiB0aGlzLmFkZEFjdGl2ZUNsYXNzZXMoZSkpO1xyXG4gICAgICAgIGxpc3Rlbi51cChkb2N1bWVudCwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlQnViYmxlKCk7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQWN0aXZlQ2xhc3NlcygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi5tb3VzZWRvd24odGhpcy5jb250YWluZXIsIChlKSA9PiB7XHJcbiAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgcmV0dXJuIGZhbHNlOyBcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4udmlld2NoYW5nZWQoZWxlbWVudCwgKGUpID0+IHRoaXMudmlld2NoYW5nZWQoZS5kYXRlLCBlLmxldmVsLCBlLnVwZGF0ZSkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi5vcGVuQnViYmxlKGVsZW1lbnQsIChlKSA9PiB7XHJcbiAgICAgICAgICAgdGhpcy5vcGVuQnViYmxlKGUueCwgZS55LCBlLnRleHQpOyBcclxuICAgICAgICB9KTtcclxuICAgICAgICBsaXN0ZW4udXBkYXRlQnViYmxlKGVsZW1lbnQsIChlKSA9PiB7XHJcbiAgICAgICAgICAgdGhpcy51cGRhdGVCdWJibGUoZS54LCBlLnksIGUudGV4dCk7IFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi5zd2lwZUxlZnQodGhpcy5jb250YWluZXIsICgpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc2Vjb25kUGlja2VyLmlzRHJhZ2dpbmcoKSB8fFxyXG4gICAgICAgICAgICAgICAgdGhpcy5taW51dGVQaWNrZXIuaXNEcmFnZ2luZygpIHx8XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhvdXJQaWNrZXIuaXNEcmFnZ2luZygpKSByZXR1cm47XHJcbiAgICAgICAgICAgIHRoaXMuaGVhZGVyLm5leHQoKTsgXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGlzdGVuLnN3aXBlUmlnaHQodGhpcy5jb250YWluZXIsICgpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc2Vjb25kUGlja2VyLmlzRHJhZ2dpbmcoKSB8fFxyXG4gICAgICAgICAgICAgICAgdGhpcy5taW51dGVQaWNrZXIuaXNEcmFnZ2luZygpIHx8XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhvdXJQaWNrZXIuaXNEcmFnZ2luZygpKSByZXR1cm47XHJcbiAgICAgICAgICAgIHRoaXMuaGVhZGVyLnByZXZpb3VzKCk7IFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgY2xvc2VCdWJibGUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuYnViYmxlID09PSB2b2lkIDApIHJldHVybjtcclxuICAgICAgICB0aGlzLmJ1YmJsZS5jbGFzc0xpc3QucmVtb3ZlKCdkYXRpdW0tYnViYmxlLXZpc2libGUnKTtcclxuICAgICAgICBzZXRUaW1lb3V0KChidWJibGU6SFRNTEVsZW1lbnQpID0+IHtcclxuICAgICAgICAgICAgYnViYmxlLnJlbW92ZSgpO1xyXG4gICAgICAgIH0sIDIwMCwgdGhpcy5idWJibGUpO1xyXG4gICAgICAgIHRoaXMuYnViYmxlID0gdm9pZCAwO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGJ1YmJsZTpIVE1MRWxlbWVudDtcclxuICAgIFxyXG4gICAgcHVibGljIG9wZW5CdWJibGUoeDpudW1iZXIsIHk6bnVtYmVyLCB0ZXh0OnN0cmluZykge1xyXG4gICAgICAgIGlmICh0aGlzLmJ1YmJsZSAhPT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2VCdWJibGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5idWJibGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tYnViYmxlJyk7XHJcbiAgICAgICAgdGhpcy5jb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5idWJibGUpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlQnViYmxlKHgsIHksIHRleHQpO1xyXG4gICAgICAgIHNldFRpbWVvdXQoKGJ1YmJsZTpIVE1MRWxlbWVudCkgPT4ge1xyXG4gICAgICAgICAgIGJ1YmJsZS5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tYnViYmxlLXZpc2libGUnKTsgXHJcbiAgICAgICAgfSwgMCwgdGhpcy5idWJibGUpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdXBkYXRlQnViYmxlKHg6bnVtYmVyLCB5Om51bWJlciwgdGV4dDpzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmJ1YmJsZS5pbm5lckhUTUwgPSB0ZXh0O1xyXG4gICAgICAgIHRoaXMuYnViYmxlLnN0eWxlLnRvcCA9IHkgKyAncHgnO1xyXG4gICAgICAgIHRoaXMuYnViYmxlLnN0eWxlLmxlZnQgPSB4ICsgJ3B4JztcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSB2aWV3Y2hhbmdlZChkYXRlOkRhdGUsIGxldmVsOkxldmVsLCB1cGRhdGU6Ym9vbGVhbikge1xyXG4gICAgICAgIGlmIChsZXZlbCA9PT0gTGV2ZWwuTk9ORSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50UGlja2VyICE9PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFBpY2tlci5yZW1vdmUoVHJhbnNpdGlvbi5aT09NX09VVCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5hZGp1c3RIZWlnaHQoMTApO1xyXG4gICAgICAgICAgICBpZiAodXBkYXRlKSB0aGlzLnVwZGF0ZVNlbGVjdGVkRGF0ZShkYXRlKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBsZXQgdHJhbnNpdGlvbjpUcmFuc2l0aW9uO1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRQaWNrZXIgPT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQaWNrZXIgPSB0aGlzLmdldFBpY2tlcihsZXZlbCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBpY2tlci5jcmVhdGUoZGF0ZSwgVHJhbnNpdGlvbi5aT09NX0lOKTtcclxuICAgICAgICB9IGVsc2UgaWYgKCh0cmFuc2l0aW9uID0gdGhpcy5nZXRUcmFuc2l0aW9uKGRhdGUsIGxldmVsKSkgIT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQaWNrZXIucmVtb3ZlKHRyYW5zaXRpb24pO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQaWNrZXIgPSB0aGlzLmdldFBpY2tlcihsZXZlbCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBpY2tlci5jcmVhdGUoZGF0ZSwgdHJhbnNpdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh1cGRhdGUpIHRoaXMudXBkYXRlU2VsZWN0ZWREYXRlKGRhdGUpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuYWRqdXN0SGVpZ2h0KHRoaXMuY3VycmVudFBpY2tlci5nZXRIZWlnaHQoKSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgdXBkYXRlU2VsZWN0ZWREYXRlKGRhdGU6RGF0ZSkge1xyXG4gICAgICAgIHRoaXMueWVhclBpY2tlci5zZXRTZWxlY3RlZERhdGUoZGF0ZSk7XHJcbiAgICAgICAgdGhpcy5tb250aFBpY2tlci5zZXRTZWxlY3RlZERhdGUoZGF0ZSk7XHJcbiAgICAgICAgdGhpcy5kYXRlUGlja2VyLnNldFNlbGVjdGVkRGF0ZShkYXRlKTtcclxuICAgICAgICB0aGlzLmhvdXJQaWNrZXIuc2V0U2VsZWN0ZWREYXRlKGRhdGUpO1xyXG4gICAgICAgIHRoaXMubWludXRlUGlja2VyLnNldFNlbGVjdGVkRGF0ZShkYXRlKTtcclxuICAgICAgICB0aGlzLnNlY29uZFBpY2tlci5zZXRTZWxlY3RlZERhdGUoZGF0ZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgZ2V0VHJhbnNpdGlvbihkYXRlOkRhdGUsIGxldmVsOkxldmVsKTpUcmFuc2l0aW9uIHtcclxuICAgICAgICBpZiAobGV2ZWwgPiB0aGlzLmN1cnJlbnRQaWNrZXIuZ2V0TGV2ZWwoKSkgcmV0dXJuIFRyYW5zaXRpb24uWk9PTV9JTjtcclxuICAgICAgICBpZiAobGV2ZWwgPCB0aGlzLmN1cnJlbnRQaWNrZXIuZ2V0TGV2ZWwoKSkgcmV0dXJuIFRyYW5zaXRpb24uWk9PTV9PVVQ7XHJcbiAgICAgICAgaWYgKGRhdGUudmFsdWVPZigpIDwgdGhpcy5jdXJyZW50UGlja2VyLmdldE1pbigpLnZhbHVlT2YoKSkgcmV0dXJuIFRyYW5zaXRpb24uU0xJREVfTEVGVDtcclxuICAgICAgICBpZiAoZGF0ZS52YWx1ZU9mKCkgPiB0aGlzLmN1cnJlbnRQaWNrZXIuZ2V0TWF4KCkudmFsdWVPZigpKSByZXR1cm4gVHJhbnNpdGlvbi5TTElERV9SSUdIVDtcclxuICAgICAgICByZXR1cm4gdm9pZCAwO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGFkanVzdEhlaWdodChoZWlnaHQ6bnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5waWNrZXJDb250YWluZXIuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZVkoJHtoZWlnaHQgLSAyODB9cHgpYDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBnZXRQaWNrZXIobGV2ZWw6TGV2ZWwpOklQaWNrZXIge1xyXG4gICAgICAgIHJldHVybiBbdGhpcy55ZWFyUGlja2VyLHRoaXMubW9udGhQaWNrZXIsdGhpcy5kYXRlUGlja2VyLHRoaXMuaG91clBpY2tlcix0aGlzLm1pbnV0ZVBpY2tlcix0aGlzLnNlY29uZFBpY2tlcl1bbGV2ZWxdO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgcmVtb3ZlQWN0aXZlQ2xhc3NlcygpIHtcclxuICAgICAgICBsZXQgYWN0aXZlRWxlbWVudHMgPSB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCcuZGF0aXVtLWFjdGl2ZScpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWN0aXZlRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgYWN0aXZlRWxlbWVudHNbaV0uY2xhc3NMaXN0LnJlbW92ZSgnZGF0aXVtLWFjdGl2ZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdkYXRpdW0tYWN0aXZlJyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgYWRkQWN0aXZlQ2xhc3NlcyhlOk1vdXNlRXZlbnR8VG91Y2hFdmVudCkge1xyXG4gICAgICAgIGxldCBlbCA9IGUuc3JjRWxlbWVudCB8fCA8RWxlbWVudD5lLnRhcmdldDtcclxuICAgICAgICB3aGlsZSAoZWwgIT09IHRoaXMuY29udGFpbmVyKSB7XHJcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1hY3RpdmUnKTtcclxuICAgICAgICAgICAgZWwgPSBlbC5wYXJlbnRFbGVtZW50O1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tYWN0aXZlJyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB1cGRhdGVPcHRpb25zKG9wdGlvbnM6SU9wdGlvbnMpIHtcclxuICAgICAgICBsZXQgdGhlbWVVcGRhdGVkID0gdGhpcy5vcHRpb25zID09PSB2b2lkIDAgfHxcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnRoZW1lID09PSB2b2lkIDAgfHxcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnRoZW1lLnByaW1hcnkgIT09IG9wdGlvbnMudGhlbWUucHJpbWFyeSB8fFxyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMudGhlbWUucHJpbWFyeV90ZXh0ICE9PSBvcHRpb25zLnRoZW1lLnByaW1hcnlfdGV4dCB8fFxyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMudGhlbWUuc2Vjb25kYXJ5ICE9PSBvcHRpb25zLnRoZW1lLnNlY29uZGFyeSB8fFxyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMudGhlbWUuc2Vjb25kYXJ5X2FjY2VudCAhPT0gb3B0aW9ucy50aGVtZS5zZWNvbmRhcnlfYWNjZW50IHx8XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy50aGVtZS5zZWNvbmRhcnlfdGV4dCAhPT0gb3B0aW9ucy50aGVtZS5zZWNvbmRhcnlfdGV4dDtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGVtZVVwZGF0ZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5pbnNlcnRTdHlsZXMoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5oZWFkZXIudXBkYXRlT3B0aW9ucyhvcHRpb25zKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnllYXJQaWNrZXIudXBkYXRlT3B0aW9ucyhvcHRpb25zKTtcclxuICAgICAgICB0aGlzLm1vbnRoUGlja2VyLnVwZGF0ZU9wdGlvbnMob3B0aW9ucyk7XHJcbiAgICAgICAgdGhpcy5kYXRlUGlja2VyLnVwZGF0ZU9wdGlvbnMob3B0aW9ucyk7XHJcbiAgICAgICAgdGhpcy5ob3VyUGlja2VyLnVwZGF0ZU9wdGlvbnMob3B0aW9ucyk7XHJcbiAgICAgICAgdGhpcy5taW51dGVQaWNrZXIudXBkYXRlT3B0aW9ucyhvcHRpb25zKTtcclxuICAgICAgICB0aGlzLnNlY29uZFBpY2tlci51cGRhdGVPcHRpb25zKG9wdGlvbnMpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGNyZWF0ZVZpZXcoKTpIVE1MRWxlbWVudCB7XHJcbiAgICAgICAgbGV0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLWNvbnRhaW5lcicpO1xyXG4gICAgICAgIGVsLmlubmVySFRNTCA9IGhlYWRlciArIGBcclxuICAgICAgICA8ZGF0aXVtLXBpY2tlci1jb250YWluZXItd3JhcHBlcj5cclxuICAgICAgICAgICAgPGRhdGl1bS1waWNrZXItY29udGFpbmVyPjwvZGF0aXVtLXBpY2tlci1jb250YWluZXI+XHJcbiAgICAgICAgPC9kYXRpdW0tcGlja2VyLWNvbnRhaW5lci13cmFwcGVyPmA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIGVsO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGluc2VydEFmdGVyKG5vZGU6Tm9kZSwgbmV3Tm9kZTpOb2RlKTp2b2lkIHtcclxuICAgICAgICBub2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5ld05vZGUsIG5vZGUubmV4dFNpYmxpbmcpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdGF0aWMgc3R5bGVzSW5zZXJ0ZWQ6bnVtYmVyID0gMDtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBpbnNlcnRTdHlsZXMoKSB7XHJcbiAgICAgICAgbGV0IGhlYWQgPSBkb2N1bWVudC5oZWFkIHx8IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF07XHJcbiAgICAgICAgbGV0IHN0eWxlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHN0eWxlSWQgPSBcImRhdGl1bS1zdHlsZVwiICsgKFBpY2tlck1hbmFnZXIuc3R5bGVzSW5zZXJ0ZWQrKyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGV4aXN0aW5nU3R5bGVJZCA9IHRoaXMuZ2V0RXhpc3RpbmdTdHlsZUlkKCk7XHJcbiAgICAgICAgaWYgKGV4aXN0aW5nU3R5bGVJZCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKGV4aXN0aW5nU3R5bGVJZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoc3R5bGVJZCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHRyYW5zZm9ybWVkQ3NzID0gY3NzLnJlcGxhY2UoL19wcmltYXJ5X3RleHQvZywgdGhpcy5vcHRpb25zLnRoZW1lLnByaW1hcnlfdGV4dCk7XHJcbiAgICAgICAgdHJhbnNmb3JtZWRDc3MgPSB0cmFuc2Zvcm1lZENzcy5yZXBsYWNlKC9fcHJpbWFyeS9nLCB0aGlzLm9wdGlvbnMudGhlbWUucHJpbWFyeSk7XHJcbiAgICAgICAgdHJhbnNmb3JtZWRDc3MgPSB0cmFuc2Zvcm1lZENzcy5yZXBsYWNlKC9fc2Vjb25kYXJ5X3RleHQvZywgdGhpcy5vcHRpb25zLnRoZW1lLnNlY29uZGFyeV90ZXh0KTtcclxuICAgICAgICB0cmFuc2Zvcm1lZENzcyA9IHRyYW5zZm9ybWVkQ3NzLnJlcGxhY2UoL19zZWNvbmRhcnlfYWNjZW50L2csIHRoaXMub3B0aW9ucy50aGVtZS5zZWNvbmRhcnlfYWNjZW50KTtcclxuICAgICAgICB0cmFuc2Zvcm1lZENzcyA9IHRyYW5zZm9ybWVkQ3NzLnJlcGxhY2UoL19zZWNvbmRhcnkvZywgdGhpcy5vcHRpb25zLnRoZW1lLnNlY29uZGFyeSk7XHJcbiAgICAgICAgdHJhbnNmb3JtZWRDc3MgPSB0cmFuc2Zvcm1lZENzcy5yZXBsYWNlKC9faWQvZywgc3R5bGVJZCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgc3R5bGVFbGVtZW50LnR5cGUgPSAndGV4dC9jc3MnO1xyXG4gICAgICAgIGlmICgoPGFueT5zdHlsZUVsZW1lbnQpLnN0eWxlU2hlZXQpe1xyXG4gICAgICAgICAgICAoPGFueT5zdHlsZUVsZW1lbnQpLnN0eWxlU2hlZXQuY3NzVGV4dCA9IHRyYW5zZm9ybWVkQ3NzO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHN0eWxlRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0cmFuc2Zvcm1lZENzcykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaGVhZC5hcHBlbmRDaGlsZChzdHlsZUVsZW1lbnQpOyAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgZ2V0RXhpc3RpbmdTdHlsZUlkKCk6c3RyaW5nIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoL15kYXRpdW0tc3R5bGVcXGQrJC8udGVzdCh0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QuaXRlbShpKSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QuaXRlbShpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxufVxyXG4iLCJ2YXIgaGVhZGVyID0gXCI8ZGF0aXVtLWhlYWRlci13cmFwcGVyPiA8ZGF0aXVtLWhlYWRlcj4gPGRhdGl1bS1zcGFuLWxhYmVsLWNvbnRhaW5lcj4gPGRhdGl1bS1zcGFuLWxhYmVsIGNsYXNzPSdkYXRpdW0teWVhcic+PC9kYXRpdW0tc3Bhbi1sYWJlbD4gPGRhdGl1bS1zcGFuLWxhYmVsIGNsYXNzPSdkYXRpdW0tbW9udGgnPjwvZGF0aXVtLXNwYW4tbGFiZWw+IDxkYXRpdW0tc3Bhbi1sYWJlbCBjbGFzcz0nZGF0aXVtLWRhdGUnPjwvZGF0aXVtLXNwYW4tbGFiZWw+IDxkYXRpdW0tc3Bhbi1sYWJlbCBjbGFzcz0nZGF0aXVtLWhvdXInPjwvZGF0aXVtLXNwYW4tbGFiZWw+IDxkYXRpdW0tc3Bhbi1sYWJlbCBjbGFzcz0nZGF0aXVtLW1pbnV0ZSc+PC9kYXRpdW0tc3Bhbi1sYWJlbD4gPGRhdGl1bS1zcGFuLWxhYmVsIGNsYXNzPSdkYXRpdW0tc2Vjb25kJz48L2RhdGl1bS1zcGFuLWxhYmVsPiA8L2RhdGl1bS1zcGFuLWxhYmVsLWNvbnRhaW5lcj4gPGRhdGl1bS1wcmV2PjwvZGF0aXVtLXByZXY+IDxkYXRpdW0tbmV4dD48L2RhdGl1bS1uZXh0PiA8L2RhdGl1bS1oZWFkZXI+IDwvZGF0aXVtLWhlYWRlci13cmFwcGVyPlwiOyIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9jb21tb24vQ29tbW9uLnRzXCIgLz5cclxuY2xhc3MgUGlja2VyIGV4dGVuZHMgQ29tbW9uIHtcclxuICAgIHByb3RlY3RlZCBwaWNrZXJDb250YWluZXI6SFRNTEVsZW1lbnQ7XHJcbiAgICBwcm90ZWN0ZWQgbWluOkRhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgcHJvdGVjdGVkIG1heDpEYXRlID0gbmV3IERhdGUoKTtcclxuICAgIHByb3RlY3RlZCBwaWNrZXI6SFRNTEVsZW1lbnQ7XHJcbiAgICBwcm90ZWN0ZWQgc2VsZWN0ZWREYXRlOkRhdGU7XHJcbiAgICBwcm90ZWN0ZWQgb3B0aW9uczpJT3B0aW9ucztcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IocHJvdGVjdGVkIGVsZW1lbnQ6SFRNTEVsZW1lbnQsIHByb3RlY3RlZCBjb250YWluZXI6SFRNTEVsZW1lbnQpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMucGlja2VyQ29udGFpbmVyID0gPEhUTUxFbGVtZW50PmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdkYXRpdW0tcGlja2VyLWNvbnRhaW5lcicpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgY3JlYXRlKGRhdGU6RGF0ZSwgdHJhbnNpdGlvbjpUcmFuc2l0aW9uKSB7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyByZW1vdmUodHJhbnNpdGlvbjpUcmFuc2l0aW9uKSB7XHJcbiAgICAgICAgaWYgKHRoaXMucGlja2VyID09PSB2b2lkIDApIHJldHVybjtcclxuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy50cmFuc2l0aW9uSW5UaW1lb3V0KTtcclxuICAgICAgICB0aGlzLnRyYW5zaXRpb25PdXQodHJhbnNpdGlvbiwgdGhpcy5waWNrZXIpO1xyXG4gICAgICAgIHNldFRpbWVvdXQoKHBpY2tlcjpIVE1MRWxlbWVudCkgPT4ge1xyXG4gICAgICAgICAgICBwaWNrZXIucmVtb3ZlKCk7XHJcbiAgICAgICAgfSwgNTAwLCB0aGlzLnBpY2tlcik7ICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGdldE9mZnNldChlbDpIVE1MRWxlbWVudCk6e3g6bnVtYmVyLCB5Om51bWJlcn0ge1xyXG4gICAgICAgIGxldCB4ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdCAtIHRoaXMuY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQ7XHJcbiAgICAgICAgbGV0IHkgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AgLSB0aGlzLmNvbnRhaW5lci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3A7XHJcbiAgICAgICAgcmV0dXJuIHsgeDogeCwgeTogeSB9O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdXBkYXRlT3B0aW9ucyhvcHRpb25zOklPcHRpb25zKSB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGF0dGFjaCgpIHtcclxuICAgICAgICB0aGlzLnBpY2tlckNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLnBpY2tlcik7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRNaW4oKTpEYXRlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5taW47XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRNYXgoKTpEYXRlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tYXg7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBzZXRTZWxlY3RlZERhdGUoZGF0ZTpEYXRlKTp2b2lkIHtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkRGF0ZSA9IG5ldyBEYXRlKGRhdGUudmFsdWVPZigpKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIHRyYW5zaXRpb25PdXQodHJhbnNpdGlvbjpUcmFuc2l0aW9uLCBwaWNrZXI6SFRNTEVsZW1lbnQpIHtcclxuICAgICAgICBpZiAodHJhbnNpdGlvbiA9PT0gVHJhbnNpdGlvbi5TTElERV9MRUZUKSB7XHJcbiAgICAgICAgICAgIHBpY2tlci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tcGlja2VyLXJpZ2h0Jyk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0cmFuc2l0aW9uID09PSBUcmFuc2l0aW9uLlNMSURFX1JJR0hUKSB7XHJcbiAgICAgICAgICAgIHBpY2tlci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tcGlja2VyLWxlZnQnKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRyYW5zaXRpb24gPT09IFRyYW5zaXRpb24uWk9PTV9JTikge1xyXG4gICAgICAgICAgICBwaWNrZXIuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLXBpY2tlci1vdXQnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwaWNrZXIuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLXBpY2tlci1pbicpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIHRyYW5zaXRpb25JblRpbWVvdXQ6bnVtYmVyO1xyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgdHJhbnNpdGlvbkluKHRyYW5zaXRpb246VHJhbnNpdGlvbiwgcGlja2VyOkhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgbGV0IGNsczpzdHJpbmc7XHJcbiAgICAgICAgaWYgKHRyYW5zaXRpb24gPT09IFRyYW5zaXRpb24uU0xJREVfTEVGVCkge1xyXG4gICAgICAgICAgICBjbHMgPSAnZGF0aXVtLXBpY2tlci1sZWZ0JztcclxuICAgICAgICB9IGVsc2UgaWYgKHRyYW5zaXRpb24gPT09IFRyYW5zaXRpb24uU0xJREVfUklHSFQpIHtcclxuICAgICAgICAgICAgY2xzID0gJ2RhdGl1bS1waWNrZXItcmlnaHQnO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHJhbnNpdGlvbiA9PT0gVHJhbnNpdGlvbi5aT09NX0lOKSB7XHJcbiAgICAgICAgICAgIGNscyA9ICdkYXRpdW0tcGlja2VyLWluJztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjbHMgPSAnZGF0aXVtLXBpY2tlci1vdXQnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwaWNrZXIuY2xhc3NMaXN0LmFkZChjbHMpO1xyXG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRyYW5zaXRpb25JblRpbWVvdXQpO1xyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbkluVGltZW91dCA9IHNldFRpbWVvdXQoKHA6SFRNTEVsZW1lbnQpID0+IHtcclxuICAgICAgICAgICAgcC5jbGFzc0xpc3QucmVtb3ZlKGNscyk7XHJcbiAgICAgICAgfSwgMTAwLCBwaWNrZXIpO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJQaWNrZXIudHNcIiAvPlxyXG5cclxuY2xhc3MgRGF0ZVBpY2tlciBleHRlbmRzIFBpY2tlciBpbXBsZW1lbnRzIElQaWNrZXIge1xyXG4gICAgY29uc3RydWN0b3IoZWxlbWVudDpIVE1MRWxlbWVudCwgY29udGFpbmVyOkhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgc3VwZXIoZWxlbWVudCwgY29udGFpbmVyKTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4udGFwKGNvbnRhaW5lciwgJ2RhdGl1bS1kYXRlLWVsZW1lbnRbZGF0aXVtLWRhdGFdJywgKGUpID0+IHtcclxuICAgICAgICAgICBsZXQgZWw6RWxlbWVudCA9IDxFbGVtZW50PmUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcclxuICAgICAgICAgICBcclxuICAgICAgICAgICBsZXQgeWVhciA9IG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSkuZ2V0RnVsbFllYXIoKTtcclxuICAgICAgICAgICBsZXQgbW9udGggPSBuZXcgRGF0ZShlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpLmdldE1vbnRoKCk7XHJcbiAgICAgICAgICAgbGV0IGRhdGVPZk1vbnRoID0gbmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKS5nZXREYXRlKCk7XHJcbiAgICAgICAgICAgXHJcbiAgICAgICAgICAgbGV0IGRhdGUgPSBuZXcgRGF0ZSh0aGlzLnNlbGVjdGVkRGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgIGRhdGUuc2V0RnVsbFllYXIoeWVhcik7XHJcbiAgICAgICAgICAgZGF0ZS5zZXRNb250aChtb250aCk7XHJcbiAgICAgICAgICAgaWYgKGRhdGUuZ2V0TW9udGgoKSAhPT0gbW9udGgpIHtcclxuICAgICAgICAgICAgICAgZGF0ZS5zZXREYXRlKDApO1xyXG4gICAgICAgICAgIH1cclxuICAgICAgICAgICBkYXRlLnNldERhdGUoZGF0ZU9mTW9udGgpO1xyXG4gICAgICAgICAgIFxyXG4gICAgICAgICAgIHRyaWdnZXIuem9vbUluKGVsZW1lbnQsIHtcclxuICAgICAgICAgICAgICAgZGF0ZTogZGF0ZSxcclxuICAgICAgICAgICAgICAgY3VycmVudExldmVsOiBMZXZlbC5EQVRFXHJcbiAgICAgICAgICAgfSlcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4uZG93bihjb250YWluZXIsICdkYXRpdW0tZGF0ZS1lbGVtZW50JywgKGUpID0+IHtcclxuICAgICAgICAgICAgbGV0IGVsOkhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PihlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQpO1xyXG4gICAgICAgICAgICBsZXQgdGV4dCA9IHRoaXMucGFkKG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSkuZ2V0RGF0ZSgpKTtcclxuICAgICAgICAgICAgbGV0IG9mZnNldCA9IHRoaXMuZ2V0T2Zmc2V0KGVsKTtcclxuICAgICAgICAgICAgdHJpZ2dlci5vcGVuQnViYmxlKGVsZW1lbnQsIHtcclxuICAgICAgICAgICAgICAgIHg6IG9mZnNldC54ICsgMjAsXHJcbiAgICAgICAgICAgICAgICB5OiBvZmZzZXQueSArIDIsXHJcbiAgICAgICAgICAgICAgICB0ZXh0OiB0ZXh0XHJcbiAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgaGVpZ2h0Om51bWJlcjtcclxuICAgIFxyXG4gICAgcHVibGljIGNyZWF0ZShkYXRlOkRhdGUsIHRyYW5zaXRpb246VHJhbnNpdGlvbikge1xyXG4gICAgICAgIHRoaXMubWluID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCkpO1xyXG4gICAgICAgIHRoaXMubWF4ID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCkgKyAxKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgc3RhcnQgPSBuZXcgRGF0ZSh0aGlzLm1pbi52YWx1ZU9mKCkpO1xyXG4gICAgICAgIHN0YXJ0LnNldERhdGUoMSAtIHN0YXJ0LmdldERheSgpKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgZW5kID0gbmV3IERhdGUodGhpcy5tYXgudmFsdWVPZigpKTtcclxuICAgICAgICBlbmQuc2V0RGF0ZShlbmQuZ2V0RGF0ZSgpICsgNyAtIChlbmQuZ2V0RGF5KCkgPT09IDAgPyA3IDogZW5kLmdldERheSgpKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGl0ZXJhdG9yID0gbmV3IERhdGUoc3RhcnQudmFsdWVPZigpKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnBpY2tlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1waWNrZXInKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnRyYW5zaXRpb25Jbih0cmFuc2l0aW9uLCB0aGlzLnBpY2tlcik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA3OyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1kYXRlLWhlYWRlcicpO1xyXG4gICAgICAgICAgICBoZWFkZXIuaW5uZXJIVE1MID0gdGhpcy5nZXREYXlzKClbaV0uc2xpY2UoMCwgMik7XHJcbiAgICAgICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKGhlYWRlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCB0aW1lcyA9IDA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZG8geyAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgZGF0ZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tZGF0ZS1lbGVtZW50Jyk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBkYXRlRWxlbWVudC5pbm5lckhUTUwgPSBpdGVyYXRvci5nZXREYXRlKCkudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChpdGVyYXRvci5nZXRNb250aCgpID09PSBkYXRlLmdldE1vbnRoKCkgJiZcclxuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5pc0RhdGVWYWxpZChpdGVyYXRvcikpIHtcclxuICAgICAgICAgICAgICAgIGRhdGVFbGVtZW50LnNldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnLCBpdGVyYXRvci50b0lTT1N0cmluZygpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5waWNrZXIuYXBwZW5kQ2hpbGQoZGF0ZUVsZW1lbnQpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaXRlcmF0b3Iuc2V0RGF0ZShpdGVyYXRvci5nZXREYXRlKCkgKyAxKTtcclxuICAgICAgICAgICAgdGltZXMrKztcclxuICAgICAgICB9IHdoaWxlIChpdGVyYXRvci52YWx1ZU9mKCkgPCBlbmQudmFsdWVPZigpKTtcclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmhlaWdodCA9IE1hdGguY2VpbCh0aW1lcyAvIDcpICogMzYgKyAyODtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmF0dGFjaCgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuc2V0U2VsZWN0ZWREYXRlKHRoaXMuc2VsZWN0ZWREYXRlKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHNldFNlbGVjdGVkRGF0ZShzZWxlY3RlZERhdGU6RGF0ZSkge1xyXG4gICAgICAgIGlmIChzZWxlY3RlZERhdGUgPT09IHZvaWQgMCkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWREYXRlID0gbmV3IERhdGUoc2VsZWN0ZWREYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGRhdGVFbGVtZW50cyA9IHRoaXMucGlja2VyQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJ2RhdGl1bS1kYXRlLWVsZW1lbnQnKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGVFbGVtZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgZWwgPSBkYXRlRWxlbWVudHMuaXRlbShpKTtcclxuICAgICAgICAgICAgbGV0IGRhdGUgPSBuZXcgRGF0ZShlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpO1xyXG4gICAgICAgICAgICBpZiAoZGF0ZS5nZXRGdWxsWWVhcigpID09PSBzZWxlY3RlZERhdGUuZ2V0RnVsbFllYXIoKSAmJlxyXG4gICAgICAgICAgICAgICAgZGF0ZS5nZXRNb250aCgpID09PSBzZWxlY3RlZERhdGUuZ2V0TW9udGgoKSAmJlxyXG4gICAgICAgICAgICAgICAgZGF0ZS5nZXREYXRlKCkgPT09IHNlbGVjdGVkRGF0ZS5nZXREYXRlKCkpIHtcclxuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1zZWxlY3RlZCcpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZGF0aXVtLXNlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRIZWlnaHQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaGVpZ2h0O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgcmV0dXJuIExldmVsLkRBVEU7XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiUGlja2VyLnRzXCIgLz5cclxuXHJcbmNsYXNzIFRpbWVQaWNrZXIgZXh0ZW5kcyBQaWNrZXIge1xyXG4gICAgcHJvdGVjdGVkIHRpbWVEcmFnOkhUTUxFbGVtZW50O1xyXG4gICAgcHJvdGVjdGVkIHRpbWVEcmFnQXJtOkhUTUxFbGVtZW50O1xyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgc2Vjb25kSGFuZDpIVE1MRWxlbWVudDtcclxuICAgIHByb3RlY3RlZCBob3VySGFuZDpIVE1MRWxlbWVudDtcclxuICAgIHByb3RlY3RlZCBtaW51dGVIYW5kOkhUTUxFbGVtZW50O1xyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgZHJhZ2dpbmc6Ym9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIGlzRHJhZ2dpbmcoKTpib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kcmFnZ2luZztcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIHJvdGF0aW9uOm51bWJlciA9IDA7XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBkcmFnU3RhcnQoZTpNb3VzZUV2ZW50fFRvdWNoRXZlbnQpIHtcclxuICAgICAgICBsZXQgbWludXRlQWRqdXN0ID0gMDtcclxuICAgICAgICBpZiAodGhpcy5nZXRMZXZlbCgpID09PSBMZXZlbC5IT1VSKSB7XHJcbiAgICAgICAgICAgIG1pbnV0ZUFkanVzdCA9IChNYXRoLlBJICogdGhpcy5zZWxlY3RlZERhdGUuZ2V0TWludXRlcygpIC8gMzApIC8gMTI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRyaWdnZXIub3BlbkJ1YmJsZSh0aGlzLmVsZW1lbnQsIHtcclxuICAgICAgICAgICB4OiAtNzAgKiBNYXRoLnNpbih0aGlzLnJvdGF0aW9uICsgbWludXRlQWRqdXN0KSArIDE0MCwgXHJcbiAgICAgICAgICAgeTogNzAgKiBNYXRoLmNvcyh0aGlzLnJvdGF0aW9uICsgbWludXRlQWRqdXN0KSArIDE3NSxcclxuICAgICAgICAgICB0ZXh0OiB0aGlzLmdldEJ1YmJsZVRleHQoKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMucGlja2VyLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1kcmFnZ2luZycpO1xyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMubW92ZWQgPSAwO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIG1vdmVkOm51bWJlciA9IDA7XHJcbiAgICBwcm90ZWN0ZWQgZHJhZ01vdmUoZTpNb3VzZUV2ZW50fFRvdWNoRXZlbnQpIHtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgcG9pbnQgPSB7XHJcbiAgICAgICAgICAgIHg6IHRoaXMucGlja2VyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQgKyAxNDAgLSB0aGlzLmdldENsaWVudENvb3IoZSkueCxcclxuICAgICAgICAgICAgeTogdGhpcy5nZXRDbGllbnRDb29yKGUpLnkgLSB0aGlzLnBpY2tlci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AgLSAxMjBcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHIgPSBNYXRoLmF0YW4yKHBvaW50LngsIHBvaW50LnkpO1xyXG4gICAgICAgIHRoaXMucm90YXRpb24gPSB0aGlzLm5vcm1hbGl6ZVJvdGF0aW9uKHIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBuZXdEYXRlID0gdGhpcy5nZXRFbGVtZW50RGF0ZSh0aGlzLnRpbWVEcmFnKTtcclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICBsZXQgZ290byA9IHRydWU7XHJcbiAgICAgICAgaWYgKHRoaXMuZ2V0TGV2ZWwoKSA9PT0gTGV2ZWwuSE9VUikge1xyXG4gICAgICAgICAgICBuZXdEYXRlLnNldEhvdXJzKHRoaXMucm90YXRpb25Ub1RpbWUodGhpcy5yb3RhdGlvbikpO1xyXG4gICAgICAgICAgICBnb3RvID0gdGhpcy5vcHRpb25zLmlzSG91clZhbGlkKG5ld0RhdGUpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5nZXRMZXZlbCgpID09PSBMZXZlbC5NSU5VVEUpIHtcclxuICAgICAgICAgICAgbmV3RGF0ZS5zZXRNaW51dGVzKHRoaXMucm90YXRpb25Ub1RpbWUodGhpcy5yb3RhdGlvbikpOyAgXHJcbiAgICAgICAgICAgIGdvdG8gPSB0aGlzLm9wdGlvbnMuaXNNaW51dGVWYWxpZChuZXdEYXRlKTsgICAgICAgICAgXHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmdldExldmVsKCkgPT09IExldmVsLlNFQ09ORCkge1xyXG4gICAgICAgICAgICBuZXdEYXRlLnNldFNlY29uZHModGhpcy5yb3RhdGlvblRvVGltZSh0aGlzLnJvdGF0aW9uKSk7XHJcbiAgICAgICAgICAgIGdvdG8gPSB0aGlzLm9wdGlvbnMuaXNIb3VyVmFsaWQobmV3RGF0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLm1vdmVkKysgPiAxKSB7XHJcbiAgICAgICAgICAgIHRyaWdnZXIudXBkYXRlQnViYmxlKHRoaXMuZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgeDogLTcwICogTWF0aC5zaW4odGhpcy5yb3RhdGlvbikgKyAxNDAsIFxyXG4gICAgICAgICAgICAgICAgeTogNzAgKiBNYXRoLmNvcyh0aGlzLnJvdGF0aW9uKSArIDE3NSxcclxuICAgICAgICAgICAgICAgIHRleHQ6IHRoaXMuZ2V0QnViYmxlVGV4dCgpXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnVwZGF0ZUxhYmVscyhuZXdEYXRlKTtcclxuICAgICAgICBpZiAoZ290bykge1xyXG4gICAgICAgICAgICB0cmlnZ2VyLmdvdG8odGhpcy5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgICAgICBkYXRlOiBuZXdEYXRlLFxyXG4gICAgICAgICAgICAgICAgbGV2ZWw6IHRoaXMuZ2V0TGV2ZWwoKSxcclxuICAgICAgICAgICAgICAgIHVwZGF0ZTogZmFsc2VcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMudXBkYXRlRWxlbWVudHMoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGRyYWdFbmQoZTpNb3VzZUV2ZW50fFRvdWNoRXZlbnQpIHtcclxuICAgICAgICB0aGlzLnBpY2tlci5jbGFzc0xpc3QucmVtb3ZlKCdkYXRpdW0tZHJhZ2dpbmcnKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgZGF0ZSA9IHRoaXMuZ2V0RWxlbWVudERhdGUodGhpcy50aW1lRHJhZyk7XHJcbiAgICAgICAgbGV0IHpvb21JbiA9IHRydWU7XHJcbiAgICAgICAgaWYgKHRoaXMuZ2V0TGV2ZWwoKSA9PT0gTGV2ZWwuSE9VUikge1xyXG4gICAgICAgICAgICBkYXRlLnNldEhvdXJzKHRoaXMucm90YXRpb25Ub1RpbWUodGhpcy5yb3RhdGlvbikpO1xyXG4gICAgICAgICAgICBkYXRlID0gdGhpcy5yb3VuZChkYXRlKTtcclxuICAgICAgICAgICAgem9vbUluID0gdGhpcy5vcHRpb25zLmlzSG91clZhbGlkKGRhdGUpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5nZXRMZXZlbCgpID09PSBMZXZlbC5NSU5VVEUpIHtcclxuICAgICAgICAgICAgZGF0ZS5zZXRNaW51dGVzKHRoaXMucm90YXRpb25Ub1RpbWUodGhpcy5yb3RhdGlvbikpO1xyXG4gICAgICAgICAgICBkYXRlID0gdGhpcy5yb3VuZChkYXRlKTtcclxuICAgICAgICAgICAgem9vbUluID0gdGhpcy5vcHRpb25zLmlzTWludXRlVmFsaWQoZGF0ZSk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmdldExldmVsKCkgPT09IExldmVsLlNFQ09ORCkge1xyXG4gICAgICAgICAgICBkYXRlLnNldFNlY29uZHModGhpcy5yb3RhdGlvblRvVGltZSh0aGlzLnJvdGF0aW9uKSk7XHJcbiAgICAgICAgICAgIGRhdGUgPSB0aGlzLnJvdW5kKGRhdGUpO1xyXG4gICAgICAgICAgICB6b29tSW4gPSB0aGlzLm9wdGlvbnMuaXNTZWNvbmRWYWxpZChkYXRlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHpvb21Jbikge1xyXG4gICAgICAgICAgICB0cmlnZ2VyLnpvb21Jbih0aGlzLmVsZW1lbnQsIHtcclxuICAgICAgICAgICAgICAgIGRhdGU6IGRhdGUsXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50TGV2ZWw6IHRoaXMuZ2V0TGV2ZWwoKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZyA9IGZhbHNlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMudXBkYXRlRWxlbWVudHMoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIHVwZGF0ZUVsZW1lbnRzKCkge1xyXG4gICAgICAgIHRoaXMudGltZURyYWdBcm0uc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZSgke3RoaXMucm90YXRpb259cmFkKWA7XHJcbiAgICAgICAgaWYgKHRoaXMuZ2V0TGV2ZWwoKSA9PSBMZXZlbC5IT1VSKSB7XHJcbiAgICAgICAgICAgIGxldCBtaW51dGVBZGp1c3QgPSAwO1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuZHJhZ2dpbmcpIHtcclxuICAgICAgICAgICAgICAgIG1pbnV0ZUFkanVzdCA9IChNYXRoLlBJICogdGhpcy5zZWxlY3RlZERhdGUuZ2V0TWludXRlcygpIC8gMzApIC8gMTI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy50aW1lRHJhZ0FybS5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlKCR7dGhpcy5yb3RhdGlvbiArIG1pbnV0ZUFkanVzdH1yYWQpYDtcclxuICAgICAgICAgICAgdGhpcy5ob3VySGFuZC5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlKCR7dGhpcy5yb3RhdGlvbiArIG1pbnV0ZUFkanVzdH1yYWQpYDtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZ2V0TGV2ZWwoKSA9PT0gTGV2ZWwuTUlOVVRFKSB7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgdCA9IHRoaXMuc2VsZWN0ZWREYXRlLmdldEhvdXJzKCk7XHJcbiAgICAgICAgICAgIGxldCByMSA9ICAodCArIDYpIC8gNiAqIE1hdGguUEk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgciA9IHRoaXMucm90YXRpb247XHJcbiAgICAgICAgICAgIHIgPSB0aGlzLnB1dFJvdGF0aW9uSW5Cb3VuZHMocik7XHJcbiAgICAgICAgICAgIHIxICs9IChyK01hdGguUEkpLzEyO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5ob3VySGFuZC5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlKCR7cjF9cmFkKWA7XHJcbiAgICAgICAgICAgIHRoaXMubWludXRlSGFuZC5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlKCR7dGhpcy5yb3RhdGlvbn1yYWQpYDtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZ2V0TGV2ZWwoKSA9PT0gTGV2ZWwuU0VDT05EKSB7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgdCA9IHRoaXMuc2VsZWN0ZWREYXRlLmdldEhvdXJzKCk7XHJcbiAgICAgICAgICAgIGxldCByMSA9ICAodCArIDYpIC8gNiAqIE1hdGguUEk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCB0MiA9IHRoaXMuc2VsZWN0ZWREYXRlLmdldE1pbnV0ZXMoKTtcclxuICAgICAgICAgICAgbGV0IHIyID0gdGhpcy50aW1lVG9Sb3RhdGlvbih0Mik7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgciA9IHIyO1xyXG4gICAgICAgICAgICByID0gdGhpcy5wdXRSb3RhdGlvbkluQm91bmRzKHIpO1xyXG4gICAgICAgICAgICByMSArPSAocitNYXRoLlBJKS8xMjtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuaG91ckhhbmQuc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZSgke3IxfXJhZClgO1xyXG4gICAgICAgICAgICB0aGlzLm1pbnV0ZUhhbmQuc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZSgke3IyfXJhZClgO1xyXG4gICAgICAgICAgICB0aGlzLnNlY29uZEhhbmQuc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZSgke3RoaXMucm90YXRpb259cmFkKWA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgcHV0Um90YXRpb25JbkJvdW5kcyhyOm51bWJlciwgZmFjdG9yOm51bWJlciA9IDIpIHtcclxuICAgICAgICB3aGlsZSAociA+IE1hdGguUEkpIHIgLT0gTWF0aC5QSSAqIGZhY3RvcjtcclxuICAgICAgICB3aGlsZSAociA8IC1NYXRoLlBJKSByICs9IE1hdGguUEkgKiBmYWN0b3I7XHJcbiAgICAgICAgcmV0dXJuIHI7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBub3JtYWxpemVSb3RhdGlvbihyOm51bWJlciwgZmFjdG9yOm51bWJlciA9IDIpIHtcclxuICAgICAgICByZXR1cm4gciAtIE1hdGgucm91bmQoKHIgLSB0aGlzLnJvdGF0aW9uKSAvIE1hdGguUEkgLyBmYWN0b3IpICogTWF0aC5QSSAqIGZhY3RvcjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHNldFNlbGVjdGVkRGF0ZShkYXRlOkRhdGUpIHtcclxuICAgICAgICBpZiAoZGF0ZSA9PT0gdm9pZCAwKSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZERhdGUgPSBuZXcgRGF0ZShkYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMuZ2V0TGV2ZWwoKSA9PT0gTGV2ZWwuSE9VUikge1xyXG4gICAgICAgICAgICB0aGlzLnJvdGF0aW9uID0gdGhpcy5ub3JtYWxpemVSb3RhdGlvbigoZGF0ZS5nZXRIb3VycygpICsgNikgLyA2ICogTWF0aC5QSSwgMik7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmdldExldmVsKCkgPT09IExldmVsLk1JTlVURSkge1xyXG4gICAgICAgICAgICB0aGlzLnJvdGF0aW9uID0gdGhpcy5ub3JtYWxpemVSb3RhdGlvbigoZGF0ZS5nZXRNaW51dGVzKCkgKyAzMCkgLyAzMCAqIE1hdGguUEksIDIpOyAgICAgICAgICAgIFxyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5nZXRMZXZlbCgpID09PSBMZXZlbC5TRUNPTkQpIHtcclxuICAgICAgICAgICAgdGhpcy5yb3RhdGlvbiA9IHRoaXMubm9ybWFsaXplUm90YXRpb24oKGRhdGUuZ2V0U2Vjb25kcygpICsgMzApIC8gMzAgKiBNYXRoLlBJLCAyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMudGltZURyYWdBcm0gIT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUVsZW1lbnRzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLnBpY2tlciAhPT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlTGFiZWxzKGRhdGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldEhlaWdodCgpIHtcclxuICAgICAgICByZXR1cm4gMjQwO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgZmxvb3IoZGF0ZTpEYXRlKTpEYXRlIHsgdGhyb3cgJ3VuaW1wbGVtZW50ZWQnIH1cclxuICAgIHByb3RlY3RlZCBjZWlsKGRhdGU6RGF0ZSk6RGF0ZSB7IHRocm93ICd1bmltcGxlbWVudGVkJyB9XHJcbiAgICBwcm90ZWN0ZWQgcm91bmQoZGF0ZTpEYXRlKTpEYXRlIHsgdGhyb3cgJ3VuaW1wbGVtZW50ZWQnIH1cclxuICAgIHByb3RlY3RlZCB1cGRhdGVMYWJlbHMoZGF0ZTpEYXRlLCBmb3JjZVVwZGF0ZTpib29sZWFuID0gZmFsc2UpIHsgdGhyb3cgJ3VuaW1wbGVtZW50ZWQnIH1cclxuICAgIHByb3RlY3RlZCBnZXRFbGVtZW50RGF0ZShlbDpFbGVtZW50KTpEYXRlIHsgdGhyb3cgJ3VuaW1wbGVtZW50ZWQnIH1cclxuICAgIHByb3RlY3RlZCBnZXRCdWJibGVUZXh0KCk6c3RyaW5nIHsgdGhyb3cgJ3VuaW1wbGVtZW50ZWQnIH1cclxuICAgIHByb3RlY3RlZCByb3RhdGlvblRvVGltZShyb3RhdGlvbjpudW1iZXIpOm51bWJlciB7IHRocm93ICd1bmltcGxlbWVudGVkJyB9XHJcbiAgICBwcm90ZWN0ZWQgdGltZVRvUm90YXRpb24odGltZTpudW1iZXIpOm51bWJlciB7IHRocm93ICd1bmltcGxlbWVudGVkJyB9XHJcbiAgICBwdWJsaWMgZ2V0TGV2ZWwoKTpMZXZlbCB7IHRocm93ICd1bmltcGxlbWVudGVkJyB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiVGltZVBpY2tlci50c1wiIC8+XHJcblxyXG5jbGFzcyBIb3VyUGlja2VyIGV4dGVuZHMgVGltZVBpY2tlciBpbXBsZW1lbnRzIElUaW1lUGlja2VyIHtcclxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6SFRNTEVsZW1lbnQsIGNvbnRhaW5lcjpIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIHN1cGVyKGVsZW1lbnQsIGNvbnRhaW5lcik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGlzdGVuLmRyYWcoY29udGFpbmVyLCAnLmRhdGl1bS1ob3VyLWRyYWcnLCB7XHJcbiAgICAgICAgICAgIGRyYWdTdGFydDogKGUpID0+IHRoaXMuZHJhZ1N0YXJ0KGUpLFxyXG4gICAgICAgICAgICBkcmFnTW92ZTogKGUpID0+IHRoaXMuZHJhZ01vdmUoZSksXHJcbiAgICAgICAgICAgIGRyYWdFbmQ6IChlKSA9PiB0aGlzLmRyYWdFbmQoZSksIFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi50YXAoY29udGFpbmVyLCAnLmRhdGl1bS1ob3VyLWVsZW1lbnQnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZWw6RWxlbWVudCA9IDxFbGVtZW50PmUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRyaWdnZXIuem9vbUluKHRoaXMuZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgZGF0ZTogdGhpcy5nZXRFbGVtZW50RGF0ZShlbCksXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50TGV2ZWw6IExldmVsLkhPVVJcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGlzdGVuLmRvd24oY29udGFpbmVyLCAnLmRhdGl1bS1ob3VyLWVsZW1lbnQnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZWw6SFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+KGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudCk7XHJcbiAgICAgICAgICAgIGxldCBob3VycyA9IG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSkuZ2V0SG91cnMoKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBvZmZzZXQgPSB0aGlzLmdldE9mZnNldChlbCk7XHJcbiAgICAgICAgICAgIHRyaWdnZXIub3BlbkJ1YmJsZShlbGVtZW50LCB7XHJcbiAgICAgICAgICAgICAgICB4OiBvZmZzZXQueCArIDI1LFxyXG4gICAgICAgICAgICAgICAgeTogb2Zmc2V0LnkgKyAzLFxyXG4gICAgICAgICAgICAgICAgdGV4dDogdGhpcy5nZXRCdWJibGVUZXh0KGhvdXJzKVxyXG4gICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi50YXAoY29udGFpbmVyLCAnZGF0aXVtLW1lcmlkaWVtLXN3aXRjaGVyJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAvLyBUT0RPIHNvcnQgb3V0IGJ1ZyB3aXRoIHRoaXMgb25lXHJcbiAgICAgICAgICAgIGxldCBuZXdEYXRlID0gbmV3IERhdGUodGhpcy5sYXN0TGFiZWxEYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgICAgIGlmIChuZXdEYXRlLmdldEhvdXJzKCkgPCAxMikge1xyXG4gICAgICAgICAgICAgICAgbmV3RGF0ZS5zZXRIb3VycyhuZXdEYXRlLmdldEhvdXJzKCkgKyAxMik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJvdGF0aW9uICs9IE1hdGguUEkgKiAyO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbmV3RGF0ZS5zZXRIb3VycyhuZXdEYXRlLmdldEhvdXJzKCkgLSAxMik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJvdGF0aW9uIC09IE1hdGguUEkgKiAyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUxhYmVscyhuZXdEYXRlKTtcclxuICAgICAgICAgICAgdHJpZ2dlci5nb3RvKHRoaXMuZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgZGF0ZTogbmV3RGF0ZSxcclxuICAgICAgICAgICAgICAgIGxldmVsOiBMZXZlbC5IT1VSLFxyXG4gICAgICAgICAgICAgICAgdXBkYXRlOiBmYWxzZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVFbGVtZW50cygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgY2VpbChkYXRlOkRhdGUpOkRhdGUge1xyXG4gICAgICAgIGxldCBjZWlsZWREYXRlID0gbmV3IERhdGUoZGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgIGxldCB1cHBlciA9IGNlaWxlZERhdGUuZ2V0SG91cnMoKSArIDE7XHJcbiAgICAgICAgbGV0IG9yaWcgPSBjZWlsZWREYXRlLmdldEhvdXJzKCk7XHJcbiAgICAgICAgd2hpbGUgKCF0aGlzLm9wdGlvbnMuaXNIb3VyVmFsaWQoY2VpbGVkRGF0ZSkpIHtcclxuICAgICAgICAgICAgaWYgKHVwcGVyID4gMjMpIHVwcGVyID0gMDtcclxuICAgICAgICAgICAgY2VpbGVkRGF0ZS5zZXRIb3Vycyh1cHBlcisrKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5pc0hvdXJWYWxpZChjZWlsZWREYXRlKSkgYnJlYWs7XHJcbiAgICAgICAgICAgIGlmICh1cHBlciA9PT0gb3JpZykgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjZWlsZWREYXRlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgZmxvb3IoZGF0ZTpEYXRlKTpEYXRlIHtcclxuICAgICAgICBsZXQgZmxvb3JlZERhdGUgPSBuZXcgRGF0ZShkYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgbGV0IGxvd2VyID0gZmxvb3JlZERhdGUuZ2V0SG91cnMoKSAtIDE7XHJcbiAgICAgICAgbGV0IG9yaWcgPSBmbG9vcmVkRGF0ZS5nZXRIb3VycygpO1xyXG4gICAgICAgIHdoaWxlICghdGhpcy5vcHRpb25zLmlzSG91clZhbGlkKGZsb29yZWREYXRlKSkge1xyXG4gICAgICAgICAgICBpZiAobG93ZXIgPCAwKSBsb3dlciA9IDIzO1xyXG4gICAgICAgICAgICBmbG9vcmVkRGF0ZS5zZXRIb3Vycyhsb3dlci0tKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5pc0hvdXJWYWxpZChmbG9vcmVkRGF0ZSkpIGJyZWFrO1xyXG4gICAgICAgICAgICBpZiAobG93ZXIgPT09IG9yaWcpIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmxvb3JlZERhdGU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCByb3VuZChkYXRlOkRhdGUpOkRhdGUge1xyXG4gICAgICAgIGxldCByb3VuZGVkRGF0ZSA9IG5ldyBEYXRlKGRhdGUudmFsdWVPZigpKTtcclxuICAgICAgICBsZXQgbG93ZXIgPSByb3VuZGVkRGF0ZS5nZXRIb3VycygpIC0gMTtcclxuICAgICAgICBsZXQgdXBwZXIgPSByb3VuZGVkRGF0ZS5nZXRIb3VycygpICsgMTtcclxuICAgICAgICB3aGlsZSAoIXRoaXMub3B0aW9ucy5pc0hvdXJWYWxpZChyb3VuZGVkRGF0ZSkpIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChsb3dlciA8IDApIGxvd2VyID0gMjM7XHJcbiAgICAgICAgICAgIHJvdW5kZWREYXRlLnNldEhvdXJzKGxvd2VyLS0pO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmlzSG91clZhbGlkKHJvdW5kZWREYXRlKSkgYnJlYWs7XHJcbiAgICAgICAgICAgIGlmIChsb3dlciA9PT0gdXBwZXIpIGJyZWFrO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKHVwcGVyID4gMjMpIHVwcGVyID0gMDtcclxuICAgICAgICAgICAgcm91bmRlZERhdGUuc2V0SG91cnModXBwZXIrKyk7XHJcbiAgICAgICAgICAgIGlmIChsb3dlciA9PT0gdXBwZXIpIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcm91bmRlZERhdGU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBnZXRCdWJibGVUZXh0KGhvdXJzPzpudW1iZXIpIHtcclxuICAgICAgICBpZiAoaG91cnMgPT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICBob3VycyA9IHRoaXMucm90YXRpb25Ub1RpbWUodGhpcy5yb3RhdGlvbik7IFxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBsZXQgZCA9IG5ldyBEYXRlKHRoaXMuc2VsZWN0ZWREYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgZC5zZXRIb3Vycyhob3Vycyk7XHJcbiAgICAgICAgZCA9IHRoaXMucm91bmQoZCk7XHJcbiAgICAgICAgaG91cnMgPSBkLmdldEhvdXJzKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5taWxpdGFyeVRpbWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFkKGhvdXJzKSsnaHInO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoaG91cnMgPT09IDEyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnMTJwbSc7XHJcbiAgICAgICAgfSBlbHNlIGlmIChob3VycyA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJzEyYW0nO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoaG91cnMgPiAxMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gKGhvdXJzIC0gMTIpICsgJ3BtJztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gaG91cnMgKyAnYW0nO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGdldEVsZW1lbnREYXRlKGVsOkVsZW1lbnQpIHtcclxuICAgICAgICBsZXQgZCA9IG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSk7XHJcbiAgICAgICAgbGV0IHllYXIgPSBkLmdldEZ1bGxZZWFyKCk7XHJcbiAgICAgICAgbGV0IG1vbnRoID0gZC5nZXRNb250aCgpO1xyXG4gICAgICAgIGxldCBkYXRlT2ZNb250aCA9IGQuZ2V0RGF0ZSgpO1xyXG4gICAgICAgIGxldCBob3VycyA9IGQuZ2V0SG91cnMoKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgbmV3RGF0ZSA9IG5ldyBEYXRlKHRoaXMuc2VsZWN0ZWREYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgbmV3RGF0ZS5zZXRGdWxsWWVhcih5ZWFyKTtcclxuICAgICAgICBuZXdEYXRlLnNldE1vbnRoKG1vbnRoKTtcclxuICAgICAgICBpZiAobmV3RGF0ZS5nZXRNb250aCgpICE9PSBtb250aCkge1xyXG4gICAgICAgICAgICBuZXdEYXRlLnNldERhdGUoMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG5ld0RhdGUuc2V0RGF0ZShkYXRlT2ZNb250aCk7XHJcbiAgICAgICAgbmV3RGF0ZS5zZXRIb3Vycyhob3Vycyk7XHJcbiAgICAgICAgcmV0dXJuIG5ld0RhdGU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCByb3RhdGlvblRvVGltZShyOm51bWJlcikge1xyXG4gICAgICAgIHdoaWxlIChyID4gNSpNYXRoLlBJKSByIC09IDQqTWF0aC5QSTtcclxuICAgICAgICB3aGlsZSAociA8IE1hdGguUEkpIHIgKz0gNCpNYXRoLlBJO1xyXG4gICAgICAgIHIgLT0gMiAqIE1hdGguUEk7XHJcbiAgICAgICAgbGV0IHQgPSAociAvIE1hdGguUEkgKiA2KSArIDY7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IodCsuMDAwMDAxKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIHRpbWVUb1JvdGF0aW9uKHQ6bnVtYmVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubm9ybWFsaXplUm90YXRpb24oKHQgKyA2KSAvIDYgKiBNYXRoLlBJKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGNyZWF0ZShkYXRlOkRhdGUsIHRyYW5zaXRpb246VHJhbnNpdGlvbikge1xyXG4gICAgICAgIHRoaXMubWluID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIGRhdGUuZ2V0RGF0ZSgpKTtcclxuICAgICAgICB0aGlzLm1heCA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCBkYXRlLmdldERhdGUoKSArIDEpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBpdGVyYXRvciA9IG5ldyBEYXRlKHRoaXMubWluLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5waWNrZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tcGlja2VyJyk7XHJcbiAgICAgICAgdGhpcy5waWNrZXIuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLWhvdXItcGlja2VyJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uSW4odHJhbnNpdGlvbiwgdGhpcy5waWNrZXIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTI7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgdGljayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS10aWNrJyk7XHJcbiAgICAgICAgICAgIGxldCB0aWNrTGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tdGljay1sYWJlbCcpO1xyXG4gICAgICAgICAgICB0aWNrTGFiZWwuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLWhvdXItZWxlbWVudCcpO1xyXG4gICAgICAgICAgICBsZXQgdGlja0xhYmVsQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpY2stbGFiZWwtY29udGFpbmVyJyk7XHJcbiAgICAgICAgICAgIGxldCByID0gaSAqIE1hdGguUEkvNiArIE1hdGguUEk7XHJcbiAgICAgICAgICAgIHRpY2tMYWJlbENvbnRhaW5lci5hcHBlbmRDaGlsZCh0aWNrTGFiZWwpO1xyXG4gICAgICAgICAgICB0aWNrLmFwcGVuZENoaWxkKHRpY2tMYWJlbENvbnRhaW5lcik7XHJcbiAgICAgICAgICAgIHRpY2suc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZSgke3J9cmFkKWA7XHJcbiAgICAgICAgICAgIHRpY2tMYWJlbENvbnRhaW5lci5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlKCR7MipNYXRoLlBJIC0gcn1yYWQpYDtcclxuICAgICAgICAgICAgdGlja0xhYmVsLnNldEF0dHJpYnV0ZSgnZGF0aXVtLWNsb2NrLXBvcycsIGkudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgZCA9IG5ldyBEYXRlKGRhdGUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBob3VycyA9IHRoaXMucm90YXRpb25Ub1RpbWUocik7XHJcbiAgICAgICAgICAgIGlmIChkYXRlLmdldEhvdXJzKCkgPiAxMSkgaG91cnMgKz0gMTI7XHJcbiAgICAgICAgICAgIGQuc2V0SG91cnMoaG91cnMpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGlja0xhYmVsLnNldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnLCBkLnRvSVNPU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5waWNrZXIuYXBwZW5kQ2hpbGQodGljayk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMubWVyaWRpZW1Td2l0Y2hlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1tZXJpZGllbS1zd2l0Y2hlcicpO1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMubWlsaXRhcnlUaW1lKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWVyaWRpZW1Td2l0Y2hlci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tbWlsaXRhcnktdGltZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnBpY2tlci5hcHBlbmRDaGlsZCh0aGlzLm1lcmlkaWVtU3dpdGNoZXIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuaG91ckhhbmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0taG91ci1oYW5kJyk7XHJcbiAgICAgICAgdGhpcy50aW1lRHJhZ0FybSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS10aW1lLWRyYWctYXJtJyk7XHJcbiAgICAgICAgdGhpcy50aW1lRHJhZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS10aW1lLWRyYWcnKTtcclxuICAgICAgICB0aGlzLnRpbWVEcmFnLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1ob3VyLWRyYWcnKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnRpbWVEcmFnLnNldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnLCBkYXRlLnRvSVNPU3RyaW5nKCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMudGltZURyYWdBcm0uYXBwZW5kQ2hpbGQodGhpcy50aW1lRHJhZyk7XHJcbiAgICAgICAgdGhpcy5waWNrZXIuYXBwZW5kQ2hpbGQodGhpcy50aW1lRHJhZ0FybSk7XHJcbiAgICAgICAgdGhpcy5waWNrZXIuYXBwZW5kQ2hpbGQodGhpcy5ob3VySGFuZCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5tZXJpZGllbSA9IHZvaWQgMDtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmF0dGFjaCgpO1xyXG4gICAgICAgIHRoaXMuc2V0U2VsZWN0ZWREYXRlKHRoaXMuc2VsZWN0ZWREYXRlKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBtZXJpZGllbVN3aXRjaGVyOkhUTUxFbGVtZW50O1xyXG4gICAgXHJcbiAgICBwcml2YXRlIG1lcmlkaWVtOnN0cmluZztcclxuICAgIHByaXZhdGUgbGFzdExhYmVsRGF0ZTpEYXRlO1xyXG4gICAgcHJvdGVjdGVkIHVwZGF0ZUxhYmVscyhkYXRlOkRhdGUsIGZvcmNlVXBkYXRlOmJvb2xlYW4gPSBmYWxzZSkge1xyXG4gICAgICAgIHRoaXMubGFzdExhYmVsRGF0ZSA9IGRhdGU7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMubWVyaWRpZW0gIT09IHZvaWQgMCAmJlxyXG4gICAgICAgICAgICAodGhpcy5tZXJpZGllbSA9PT0gJ0FNJyAmJiBkYXRlLmdldEhvdXJzKCkgPCAxMikgfHxcclxuICAgICAgICAgICAgKHRoaXMubWVyaWRpZW0gPT09ICdQTScgJiYgZGF0ZS5nZXRIb3VycygpID4gMTEpKSB7XHJcbiAgICAgICAgICAgIGlmICghZm9yY2VVcGRhdGUpIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5tZXJpZGllbSA9IGRhdGUuZ2V0SG91cnMoKSA8IDEyID8gJ0FNJyA6ICdQTSc7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMubWVyaWRpZW0gPT09ICdBTScpIHtcclxuICAgICAgICAgICAgdGhpcy5tZXJpZGllbVN3aXRjaGVyLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1wbS1zZWxlY3RlZCcpO1xyXG4gICAgICAgICAgICB0aGlzLm1lcmlkaWVtU3dpdGNoZXIuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLWFtLXNlbGVjdGVkJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5tZXJpZGllbVN3aXRjaGVyLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1hbS1zZWxlY3RlZCcpO1xyXG4gICAgICAgICAgICB0aGlzLm1lcmlkaWVtU3dpdGNoZXIuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLXBtLXNlbGVjdGVkJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBsYWJlbHMgPSB0aGlzLnBpY2tlci5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0aXVtLWNsb2NrLXBvc10nKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxhYmVscy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgbGFiZWwgPSBsYWJlbHMuaXRlbShpKTtcclxuICAgICAgICAgICAgbGV0IHIgPSBNYXRoLlBJKnBhcnNlSW50KGxhYmVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWNsb2NrLXBvcycpLCAxMCkvNi0zKk1hdGguUEk7XHJcbiAgICAgICAgICAgIGxldCB0aW1lID0gdGhpcy5yb3RhdGlvblRvVGltZShyKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBkID0gbmV3IERhdGUobGFiZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKTtcclxuICAgICAgICAgICAgaWYgKGRhdGUuZ2V0SG91cnMoKSA+IDExKSB7XHJcbiAgICAgICAgICAgICAgICBkLnNldEhvdXJzKHRpbWUgKyAxMik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkLnNldEhvdXJzKHRpbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsYWJlbC5zZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJywgZC50b0lTT1N0cmluZygpKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaXNIb3VyVmFsaWQoZCkpIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1pbmFjdGl2ZScpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGFiZWwuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLWluYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMubWlsaXRhcnlUaW1lKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZS5nZXRIb3VycygpID4gMTEpIHRpbWUgKz0gMTI7XHJcbiAgICAgICAgICAgICAgICBsYWJlbC5pbm5lckhUTUwgPSB0aGlzLnBhZCh0aW1lKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aW1lID09PSAwKSB0aW1lID0gMTI7XHJcbiAgICAgICAgICAgICAgICBsYWJlbC5pbm5lckhUTUwgPSB0aW1lLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB1cGRhdGVPcHRpb25zKG9wdGlvbnM6SU9wdGlvbnMpIHtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zICE9PSB2b2lkIDAgJiYgdGhpcy5vcHRpb25zLm1pbGl0YXJ5VGltZSAhPT0gb3B0aW9ucy5taWxpdGFyeVRpbWUpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVMYWJlbHModGhpcy5sYXN0TGFiZWxEYXRlLCB0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuICAgICAgICBcclxuICAgICAgICBpZiAodGhpcy5tZXJpZGllbVN3aXRjaGVyICE9PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5taWxpdGFyeVRpbWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubWVyaWRpZW1Td2l0Y2hlci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tbWlsaXRhcnktdGltZScpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tZXJpZGllbVN3aXRjaGVyLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1taWxpdGFyeS10aW1lJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICByZXR1cm4gTGV2ZWwuSE9VUjtcclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJUaW1lUGlja2VyLnRzXCIgLz5cclxuXHJcbmNsYXNzIE1pbnV0ZVBpY2tlciBleHRlbmRzIFRpbWVQaWNrZXIgaW1wbGVtZW50cyBJVGltZVBpY2tlciB7XHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OkhUTUxFbGVtZW50LCBjb250YWluZXI6SFRNTEVsZW1lbnQpIHtcclxuICAgICAgICBzdXBlcihlbGVtZW50LCBjb250YWluZXIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi5kcmFnKGNvbnRhaW5lciwgJy5kYXRpdW0tbWludXRlLWRyYWcnLCB7XHJcbiAgICAgICAgICAgIGRyYWdTdGFydDogKGUpID0+IHRoaXMuZHJhZ1N0YXJ0KGUpLFxyXG4gICAgICAgICAgICBkcmFnTW92ZTogKGUpID0+IHRoaXMuZHJhZ01vdmUoZSksXHJcbiAgICAgICAgICAgIGRyYWdFbmQ6IChlKSA9PiB0aGlzLmRyYWdFbmQoZSksIFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi50YXAoY29udGFpbmVyLCAnLmRhdGl1bS1taW51dGUtZWxlbWVudCcsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBlbDpFbGVtZW50ID0gPEVsZW1lbnQ+ZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdHJpZ2dlci56b29tSW4odGhpcy5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgICAgICBkYXRlOiB0aGlzLmdldEVsZW1lbnREYXRlKGVsKSxcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRMZXZlbDogTGV2ZWwuTUlOVVRFXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi5kb3duKGNvbnRhaW5lciwgJy5kYXRpdW0tbWludXRlLWVsZW1lbnQnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZWw6SFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+KGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudCk7XHJcbiAgICAgICAgICAgIGxldCBtaW51dGVzID0gbmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKS5nZXRNaW51dGVzKCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgb2Zmc2V0ID0gdGhpcy5nZXRPZmZzZXQoZWwpO1xyXG4gICAgICAgICAgICB0cmlnZ2VyLm9wZW5CdWJibGUoZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgeDogb2Zmc2V0LnggKyAyNSxcclxuICAgICAgICAgICAgICAgIHk6IG9mZnNldC55ICsgMyxcclxuICAgICAgICAgICAgICAgIHRleHQ6IHRoaXMuZ2V0QnViYmxlVGV4dChtaW51dGVzKVxyXG4gICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgY2VpbChkYXRlOkRhdGUpOkRhdGUge1xyXG4gICAgICAgIGxldCBjZWlsZWREYXRlID0gbmV3IERhdGUoZGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgIGxldCB1cHBlciA9IGNlaWxlZERhdGUuZ2V0TWludXRlcygpICsgMTtcclxuICAgICAgICBsZXQgb3JpZyA9IGNlaWxlZERhdGUuZ2V0TWludXRlcygpO1xyXG4gICAgICAgIHdoaWxlICghdGhpcy5vcHRpb25zLmlzTWludXRlVmFsaWQoY2VpbGVkRGF0ZSkpIHtcclxuICAgICAgICAgICAgaWYgKHVwcGVyID4gNTkpIHVwcGVyID0gMDtcclxuICAgICAgICAgICAgY2VpbGVkRGF0ZS5zZXRNaW51dGVzKHVwcGVyKyspO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmlzTWludXRlVmFsaWQoY2VpbGVkRGF0ZSkpIGJyZWFrO1xyXG4gICAgICAgICAgICBpZiAodXBwZXIgPT09IG9yaWcpIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY2VpbGVkRGF0ZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGZsb29yKGRhdGU6RGF0ZSk6RGF0ZSB7XHJcbiAgICAgICAgbGV0IGZsb29yZWREYXRlID0gbmV3IERhdGUoZGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgIGxldCBsb3dlciA9IGZsb29yZWREYXRlLmdldE1pbnV0ZXMoKSAtIDE7XHJcbiAgICAgICAgbGV0IG9yaWcgPSBmbG9vcmVkRGF0ZS5nZXRNaW51dGVzKCk7XHJcbiAgICAgICAgd2hpbGUgKCF0aGlzLm9wdGlvbnMuaXNNaW51dGVWYWxpZChmbG9vcmVkRGF0ZSkpIHtcclxuICAgICAgICAgICAgaWYgKGxvd2VyIDwgMCkgbG93ZXIgPSA1OTtcclxuICAgICAgICAgICAgZmxvb3JlZERhdGUuc2V0TWludXRlcyhsb3dlci0tKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5pc01pbnV0ZVZhbGlkKGZsb29yZWREYXRlKSkgYnJlYWs7XHJcbiAgICAgICAgICAgIGlmIChsb3dlciA9PT0gb3JpZykgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmbG9vcmVkRGF0ZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIHJvdW5kKGRhdGU6RGF0ZSk6RGF0ZSB7XHJcbiAgICAgICAgbGV0IHJvdW5kZWREYXRlID0gbmV3IERhdGUoZGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgIGxldCBsb3dlciA9IHJvdW5kZWREYXRlLmdldE1pbnV0ZXMoKSAtIDE7XHJcbiAgICAgICAgbGV0IHVwcGVyID0gcm91bmRlZERhdGUuZ2V0TWludXRlcygpICsgMTtcclxuICAgICAgICB3aGlsZSAoIXRoaXMub3B0aW9ucy5pc01pbnV0ZVZhbGlkKHJvdW5kZWREYXRlKSkge1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKGxvd2VyIDwgMCkgbG93ZXIgPSA1OTtcclxuICAgICAgICAgICAgcm91bmRlZERhdGUuc2V0TWludXRlcyhsb3dlci0tKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5pc01pbnV0ZVZhbGlkKHJvdW5kZWREYXRlKSkgYnJlYWs7XHJcbiAgICAgICAgICAgIGlmIChsb3dlciA9PT0gdXBwZXIpIGJyZWFrO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKHVwcGVyID4gNTkpIHVwcGVyID0gMDtcclxuICAgICAgICAgICAgcm91bmRlZERhdGUuc2V0TWludXRlcyh1cHBlcisrKTtcclxuICAgICAgICAgICAgaWYgKGxvd2VyID09PSB1cHBlcikgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByb3VuZGVkRGF0ZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGdldEJ1YmJsZVRleHQobWludXRlcz86bnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKG1pbnV0ZXMgPT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICBtaW51dGVzID0gdGhpcy5yb3RhdGlvblRvVGltZSh0aGlzLnJvdGF0aW9uKTsgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBkID0gbmV3IERhdGUodGhpcy5zZWxlY3RlZERhdGUudmFsdWVPZigpKTtcclxuICAgICAgICBkLnNldE1pbnV0ZXMobWludXRlcyk7XHJcbiAgICAgICAgZCA9IHRoaXMucm91bmQoZCk7XHJcbiAgICAgICAgbWludXRlcyA9IGQuZ2V0TWludXRlcygpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiB0aGlzLnBhZChtaW51dGVzKSsnbSc7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBnZXRFbGVtZW50RGF0ZShlbDpFbGVtZW50KSB7XHJcbiAgICAgICAgbGV0IGQgPSBuZXcgRGF0ZShlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpO1xyXG4gICAgICAgIGxldCB5ZWFyID0gZC5nZXRGdWxsWWVhcigpO1xyXG4gICAgICAgIGxldCBtb250aCA9IGQuZ2V0TW9udGgoKTtcclxuICAgICAgICBsZXQgZGF0ZU9mTW9udGggPSBkLmdldERhdGUoKTtcclxuICAgICAgICBsZXQgaG91cnMgPSBkLmdldEhvdXJzKCk7XHJcbiAgICAgICAgbGV0IG1pbnV0ZXMgPSBkLmdldE1pbnV0ZXMoKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgbmV3RGF0ZSA9IG5ldyBEYXRlKHRoaXMuc2VsZWN0ZWREYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgbmV3RGF0ZS5zZXRGdWxsWWVhcih5ZWFyKTtcclxuICAgICAgICBuZXdEYXRlLnNldE1vbnRoKG1vbnRoKTtcclxuICAgICAgICBpZiAobmV3RGF0ZS5nZXRNb250aCgpICE9PSBtb250aCkge1xyXG4gICAgICAgICAgICBuZXdEYXRlLnNldERhdGUoMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG5ld0RhdGUuc2V0RGF0ZShkYXRlT2ZNb250aCk7XHJcbiAgICAgICAgbmV3RGF0ZS5zZXRIb3Vycyhob3Vycyk7XHJcbiAgICAgICAgbmV3RGF0ZS5zZXRNaW51dGVzKG1pbnV0ZXMpO1xyXG4gICAgICAgIHJldHVybiBuZXdEYXRlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgcm90YXRpb25Ub1RpbWUocjpudW1iZXIpIHtcclxuICAgICAgICB3aGlsZSAociA+IE1hdGguUEkpIHIgLT0gMipNYXRoLlBJO1xyXG4gICAgICAgIHdoaWxlIChyIDwgLU1hdGguUEkpIHIgKz0gMipNYXRoLlBJO1xyXG4gICAgICAgIGxldCB0ID0gKHIgLyBNYXRoLlBJICogMzApICsgMzA7XHJcbiAgICAgICAgcmV0dXJuIHQgPj0gNTkuNSA/IDAgOiBNYXRoLnJvdW5kKHQpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgdGltZVRvUm90YXRpb24odDpudW1iZXIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5ub3JtYWxpemVSb3RhdGlvbigodCArIDMwKSAvIDMwICogTWF0aC5QSSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBjcmVhdGUoZGF0ZTpEYXRlLCB0cmFuc2l0aW9uOlRyYW5zaXRpb24pIHtcclxuICAgICAgICB0aGlzLm1pbiA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCBkYXRlLmdldERhdGUoKSwgZGF0ZS5nZXRIb3VycygpKTtcclxuICAgICAgICB0aGlzLm1heCA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCBkYXRlLmdldERhdGUoKSwgZGF0ZS5nZXRIb3VycygpICsgMSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGl0ZXJhdG9yID0gbmV3IERhdGUodGhpcy5taW4udmFsdWVPZigpKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnBpY2tlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1waWNrZXInKTtcclxuICAgICAgICB0aGlzLnBpY2tlci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tbWludXRlLXBpY2tlcicpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbkluKHRyYW5zaXRpb24sIHRoaXMucGlja2VyKTtcclxuICAgICAgICBcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEyOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHRpY2sgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tdGljaycpO1xyXG4gICAgICAgICAgICBsZXQgdGlja0xhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpY2stbGFiZWwnKTtcclxuICAgICAgICAgICAgdGlja0xhYmVsLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1taW51dGUtZWxlbWVudCcpO1xyXG4gICAgICAgICAgICBsZXQgdGlja0xhYmVsQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpY2stbGFiZWwtY29udGFpbmVyJyk7XHJcbiAgICAgICAgICAgIGxldCByID0gaSAqIE1hdGguUEkvNiArIE1hdGguUEk7XHJcbiAgICAgICAgICAgIHRpY2tMYWJlbENvbnRhaW5lci5hcHBlbmRDaGlsZCh0aWNrTGFiZWwpO1xyXG4gICAgICAgICAgICB0aWNrLmFwcGVuZENoaWxkKHRpY2tMYWJlbENvbnRhaW5lcik7XHJcbiAgICAgICAgICAgIHRpY2suc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZSgke3J9cmFkKWA7XHJcbiAgICAgICAgICAgIHRpY2tMYWJlbENvbnRhaW5lci5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlKCR7MipNYXRoLlBJIC0gcn1yYWQpYDtcclxuICAgICAgICAgICAgdGlja0xhYmVsLnNldEF0dHJpYnV0ZSgnZGF0aXVtLWNsb2NrLXBvcycsIGkudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgZCA9IG5ldyBEYXRlKGRhdGUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBtaW51dGVzID0gdGhpcy5yb3RhdGlvblRvVGltZShyKTtcclxuICAgICAgICAgICAgZC5zZXRNaW51dGVzKG1pbnV0ZXMpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGlja0xhYmVsLnNldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnLCBkLnRvSVNPU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICB0aGlzLnBpY2tlci5hcHBlbmRDaGlsZCh0aWNrKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5taW51dGVIYW5kID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLW1pbnV0ZS1oYW5kJyk7XHJcbiAgICAgICAgdGhpcy5ob3VySGFuZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1ob3VyLWhhbmQnKTtcclxuICAgICAgICB0aGlzLnRpbWVEcmFnQXJtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpbWUtZHJhZy1hcm0nKTtcclxuICAgICAgICB0aGlzLnRpbWVEcmFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpbWUtZHJhZycpO1xyXG4gICAgICAgIHRoaXMudGltZURyYWcuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLW1pbnV0ZS1kcmFnJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy50aW1lRHJhZy5zZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJywgZGF0ZS50b0lTT1N0cmluZygpKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnRpbWVEcmFnQXJtLmFwcGVuZENoaWxkKHRoaXMudGltZURyYWcpO1xyXG4gICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKHRoaXMudGltZURyYWdBcm0pO1xyXG4gICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKHRoaXMuaG91ckhhbmQpO1xyXG4gICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKHRoaXMubWludXRlSGFuZCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5hdHRhY2goKTtcclxuICAgICAgICB0aGlzLnNldFNlbGVjdGVkRGF0ZSh0aGlzLnNlbGVjdGVkRGF0ZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCB1cGRhdGVMYWJlbHMoZGF0ZTpEYXRlLCBmb3JjZVVwZGF0ZTpib29sZWFuID0gZmFsc2UpIHtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgbGFiZWxzID0gdGhpcy5waWNrZXIucXVlcnlTZWxlY3RvckFsbCgnW2RhdGl1bS1jbG9jay1wb3NdJyk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsYWJlbHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGxhYmVsID0gbGFiZWxzLml0ZW0oaSk7XHJcbiAgICAgICAgICAgIGxldCByID0gTWF0aC5QSSpwYXJzZUludChsYWJlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1jbG9jay1wb3MnKSwgMTApLzYtMypNYXRoLlBJO1xyXG4gICAgICAgICAgICBsZXQgdGltZSA9IHRoaXMucm90YXRpb25Ub1RpbWUocik7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgZCA9IG5ldyBEYXRlKGxhYmVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsYWJlbC5zZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJywgZC50b0lTT1N0cmluZygpKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaXNNaW51dGVWYWxpZChkKSkge1xyXG4gICAgICAgICAgICAgICAgbGFiZWwuY2xhc3NMaXN0LnJlbW92ZSgnZGF0aXVtLWluYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbC5jbGFzc0xpc3QuYWRkKCdkYXRpdW0taW5hY3RpdmUnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGFiZWwuaW5uZXJIVE1MID0gdGhpcy5wYWQodGltZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdXBkYXRlT3B0aW9ucyhvcHRpb25zOklPcHRpb25zKSB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldExldmVsKCkge1xyXG4gICAgICAgIHJldHVybiBMZXZlbC5NSU5VVEU7XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiUGlja2VyLnRzXCIgLz5cclxuXHJcbmNsYXNzIE1vbnRoUGlja2VyIGV4dGVuZHMgUGlja2VyIGltcGxlbWVudHMgSVBpY2tlciB7XHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OkhUTUxFbGVtZW50LCBjb250YWluZXI6SFRNTEVsZW1lbnQpIHtcclxuICAgICAgICBzdXBlcihlbGVtZW50LCBjb250YWluZXIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi50YXAoY29udGFpbmVyLCAnZGF0aXVtLW1vbnRoLWVsZW1lbnRbZGF0aXVtLWRhdGFdJywgKGUpID0+IHtcclxuICAgICAgICAgICBsZXQgZWw6RWxlbWVudCA9IDxFbGVtZW50PmUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcclxuICAgICAgICAgICBsZXQgeWVhciA9IG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSkuZ2V0RnVsbFllYXIoKTtcclxuICAgICAgICAgICBsZXQgbW9udGggPSBuZXcgRGF0ZShlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpLmdldE1vbnRoKCk7XHJcbiAgICAgICAgICAgXHJcbiAgICAgICAgICAgbGV0IGRhdGUgPSBuZXcgRGF0ZSh0aGlzLnNlbGVjdGVkRGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgIGRhdGUuc2V0RnVsbFllYXIoeWVhcik7XHJcbiAgICAgICAgICAgZGF0ZS5zZXRNb250aChtb250aCk7XHJcbiAgICAgICAgICAgaWYgKGRhdGUuZ2V0TW9udGgoKSAhPT0gbW9udGgpIHtcclxuICAgICAgICAgICAgICAgZGF0ZS5zZXREYXRlKDApO1xyXG4gICAgICAgICAgIH1cclxuICAgICAgICAgICBcclxuICAgICAgICAgICB0cmlnZ2VyLnpvb21JbihlbGVtZW50LCB7XHJcbiAgICAgICAgICAgICAgIGRhdGU6IGRhdGUsXHJcbiAgICAgICAgICAgICAgIGN1cnJlbnRMZXZlbDogTGV2ZWwuTU9OVEhcclxuICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4uZG93bihjb250YWluZXIsICdkYXRpdW0tbW9udGgtZWxlbWVudCcsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBlbDpIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD4oZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50KTtcclxuICAgICAgICAgICAgbGV0IHRleHQgPSB0aGlzLmdldFNob3J0TW9udGhzKClbbmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKS5nZXRNb250aCgpXTtcclxuICAgICAgICAgICAgbGV0IG9mZnNldCA9IHRoaXMuZ2V0T2Zmc2V0KGVsKTtcclxuICAgICAgICAgICAgdHJpZ2dlci5vcGVuQnViYmxlKGVsZW1lbnQsIHtcclxuICAgICAgICAgICAgICAgIHg6IG9mZnNldC54ICsgMzUsXHJcbiAgICAgICAgICAgICAgICB5OiBvZmZzZXQueSArIDE1LFxyXG4gICAgICAgICAgICAgICAgdGV4dDogdGV4dFxyXG4gICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgY3JlYXRlKGRhdGU6RGF0ZSwgdHJhbnNpdGlvbjpUcmFuc2l0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5taW4gPSBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCksIDApO1xyXG4gICAgICAgIHRoaXMubWF4ID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpICsgMSwgMCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGl0ZXJhdG9yID0gbmV3IERhdGUodGhpcy5taW4udmFsdWVPZigpKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnBpY2tlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1waWNrZXInKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnRyYW5zaXRpb25Jbih0cmFuc2l0aW9uLCB0aGlzLnBpY2tlcik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZG8geyAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgbW9udGhFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLW1vbnRoLWVsZW1lbnQnKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIG1vbnRoRWxlbWVudC5pbm5lckhUTUwgPSB0aGlzLmdldFNob3J0TW9udGhzKClbaXRlcmF0b3IuZ2V0TW9udGgoKV07XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmlzTW9udGhWYWxpZChpdGVyYXRvcikpIHtcclxuICAgICAgICAgICAgICAgIG1vbnRoRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJywgaXRlcmF0b3IudG9JU09TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKG1vbnRoRWxlbWVudCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpdGVyYXRvci5zZXRNb250aChpdGVyYXRvci5nZXRNb250aCgpICsgMSk7XHJcbiAgICAgICAgfSB3aGlsZSAoaXRlcmF0b3IudmFsdWVPZigpIDwgdGhpcy5tYXgudmFsdWVPZigpKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmF0dGFjaCgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuc2V0U2VsZWN0ZWREYXRlKHRoaXMuc2VsZWN0ZWREYXRlKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHNldFNlbGVjdGVkRGF0ZShzZWxlY3RlZERhdGU6RGF0ZSkge1xyXG4gICAgICAgIGlmIChzZWxlY3RlZERhdGUgPT09IHZvaWQgMCkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWREYXRlID0gbmV3IERhdGUoc2VsZWN0ZWREYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IG1vbnRoRWxlbWVudHMgPSB0aGlzLnBpY2tlckNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCdkYXRpdW0tbW9udGgtZWxlbWVudCcpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbW9udGhFbGVtZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgZWwgPSBtb250aEVsZW1lbnRzLml0ZW0oaSk7XHJcbiAgICAgICAgICAgIGxldCBkYXRlID0gbmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKTtcclxuICAgICAgICAgICAgaWYgKGRhdGUuZ2V0RnVsbFllYXIoKSA9PT0gc2VsZWN0ZWREYXRlLmdldEZ1bGxZZWFyKCkgJiZcclxuICAgICAgICAgICAgICAgIGRhdGUuZ2V0TW9udGgoKSA9PT0gc2VsZWN0ZWREYXRlLmdldE1vbnRoKCkpIHtcclxuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1zZWxlY3RlZCcpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZGF0aXVtLXNlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRIZWlnaHQoKSB7XHJcbiAgICAgICAgcmV0dXJuIDE4MDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldExldmVsKCkge1xyXG4gICAgICAgIHJldHVybiBMZXZlbC5NT05USDtcclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJUaW1lUGlja2VyLnRzXCIgLz5cclxuXHJcbmNsYXNzIFNlY29uZFBpY2tlciBleHRlbmRzIFRpbWVQaWNrZXIgaW1wbGVtZW50cyBJVGltZVBpY2tlciB7XHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OkhUTUxFbGVtZW50LCBjb250YWluZXI6SFRNTEVsZW1lbnQpIHtcclxuICAgICAgICBzdXBlcihlbGVtZW50LCBjb250YWluZXIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi5kcmFnKGNvbnRhaW5lciwgJy5kYXRpdW0tc2Vjb25kLWRyYWcnLCB7XHJcbiAgICAgICAgICAgIGRyYWdTdGFydDogKGUpID0+IHRoaXMuZHJhZ1N0YXJ0KGUpLFxyXG4gICAgICAgICAgICBkcmFnTW92ZTogKGUpID0+IHRoaXMuZHJhZ01vdmUoZSksXHJcbiAgICAgICAgICAgIGRyYWdFbmQ6IChlKSA9PiB0aGlzLmRyYWdFbmQoZSksIFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi50YXAoY29udGFpbmVyLCAnLmRhdGl1bS1zZWNvbmQtZWxlbWVudCcsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBlbDpFbGVtZW50ID0gPEVsZW1lbnQ+ZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdHJpZ2dlci56b29tSW4odGhpcy5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgICAgICBkYXRlOiB0aGlzLmdldEVsZW1lbnREYXRlKGVsKSxcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRMZXZlbDogTGV2ZWwuU0VDT05EXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi5kb3duKGNvbnRhaW5lciwgJy5kYXRpdW0tc2Vjb25kLWVsZW1lbnQnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZWw6SFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+KGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudCk7XHJcbiAgICAgICAgICAgIGxldCBzZWNvbmRzID0gbmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKS5nZXRTZWNvbmRzKCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgb2Zmc2V0ID0gdGhpcy5nZXRPZmZzZXQoZWwpO1xyXG4gICAgICAgICAgICB0cmlnZ2VyLm9wZW5CdWJibGUoZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgeDogb2Zmc2V0LnggKyAyNSxcclxuICAgICAgICAgICAgICAgIHk6IG9mZnNldC55ICsgMyxcclxuICAgICAgICAgICAgICAgIHRleHQ6IHRoaXMuZ2V0QnViYmxlVGV4dChzZWNvbmRzKVxyXG4gICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgY2VpbChkYXRlOkRhdGUpOkRhdGUge1xyXG4gICAgICAgIGxldCBjZWlsZWREYXRlID0gbmV3IERhdGUoZGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgIGxldCB1cHBlciA9IGNlaWxlZERhdGUuZ2V0U2Vjb25kcygpICsgMTtcclxuICAgICAgICBsZXQgb3JpZyA9IGNlaWxlZERhdGUuZ2V0U2Vjb25kcygpO1xyXG4gICAgICAgIHdoaWxlICghdGhpcy5vcHRpb25zLmlzU2Vjb25kVmFsaWQoY2VpbGVkRGF0ZSkpIHtcclxuICAgICAgICAgICAgaWYgKHVwcGVyID4gNTkpIHVwcGVyID0gMDtcclxuICAgICAgICAgICAgY2VpbGVkRGF0ZS5zZXRTZWNvbmRzKHVwcGVyKyspO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmlzU2Vjb25kVmFsaWQoY2VpbGVkRGF0ZSkpIGJyZWFrO1xyXG4gICAgICAgICAgICBpZiAodXBwZXIgPT09IG9yaWcpIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY2VpbGVkRGF0ZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGZsb29yKGRhdGU6RGF0ZSk6RGF0ZSB7XHJcbiAgICAgICAgbGV0IGZsb29yZWREYXRlID0gbmV3IERhdGUoZGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgIGxldCBsb3dlciA9IGZsb29yZWREYXRlLmdldFNlY29uZHMoKSAtIDE7XHJcbiAgICAgICAgbGV0IG9yaWcgPSBmbG9vcmVkRGF0ZS5nZXRTZWNvbmRzKCk7XHJcbiAgICAgICAgd2hpbGUgKCF0aGlzLm9wdGlvbnMuaXNTZWNvbmRWYWxpZChmbG9vcmVkRGF0ZSkpIHtcclxuICAgICAgICAgICAgaWYgKGxvd2VyIDwgMCkgbG93ZXIgPSA1OTtcclxuICAgICAgICAgICAgZmxvb3JlZERhdGUuc2V0U2Vjb25kcyhsb3dlci0tKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5pc1NlY29uZFZhbGlkKGZsb29yZWREYXRlKSkgYnJlYWs7XHJcbiAgICAgICAgICAgIGlmIChsb3dlciA9PT0gb3JpZykgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmbG9vcmVkRGF0ZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIHJvdW5kKGRhdGU6RGF0ZSk6RGF0ZSB7XHJcbiAgICAgICAgbGV0IHJvdW5kZWREYXRlID0gbmV3IERhdGUoZGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgIGxldCBsb3dlciA9IHJvdW5kZWREYXRlLmdldFNlY29uZHMoKSAtIDE7XHJcbiAgICAgICAgbGV0IHVwcGVyID0gcm91bmRlZERhdGUuZ2V0U2Vjb25kcygpICsgMTtcclxuICAgICAgICB3aGlsZSAoIXRoaXMub3B0aW9ucy5pc1NlY29uZFZhbGlkKHJvdW5kZWREYXRlKSkge1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKGxvd2VyIDwgMCkgbG93ZXIgPSA1OTtcclxuICAgICAgICAgICAgcm91bmRlZERhdGUuc2V0U2Vjb25kcyhsb3dlci0tKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5pc1NlY29uZFZhbGlkKHJvdW5kZWREYXRlKSkgYnJlYWs7XHJcbiAgICAgICAgICAgIGlmIChsb3dlciA9PT0gdXBwZXIpIGJyZWFrO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKHVwcGVyID4gNTkpIHVwcGVyID0gMDtcclxuICAgICAgICAgICAgcm91bmRlZERhdGUuc2V0U2Vjb25kcyh1cHBlcisrKTtcclxuICAgICAgICAgICAgaWYgKGxvd2VyID09PSB1cHBlcikgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByb3VuZGVkRGF0ZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGdldEJ1YmJsZVRleHQoc2Vjb25kcz86bnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHNlY29uZHMgPT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICBzZWNvbmRzID0gdGhpcy5yb3RhdGlvblRvVGltZSh0aGlzLnJvdGF0aW9uKTsgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBkID0gbmV3IERhdGUodGhpcy5zZWxlY3RlZERhdGUudmFsdWVPZigpKTtcclxuICAgICAgICBkLnNldFNlY29uZHMoc2Vjb25kcyk7XHJcbiAgICAgICAgZCA9IHRoaXMucm91bmQoZCk7XHJcbiAgICAgICAgc2Vjb25kcyA9IGQuZ2V0U2Vjb25kcygpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiB0aGlzLnBhZChzZWNvbmRzKSsncyc7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBnZXRFbGVtZW50RGF0ZShlbDpFbGVtZW50KSB7XHJcbiAgICAgICAgbGV0IGQgPSBuZXcgRGF0ZShlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpO1xyXG4gICAgICAgIGxldCB5ZWFyID0gZC5nZXRGdWxsWWVhcigpO1xyXG4gICAgICAgIGxldCBtb250aCA9IGQuZ2V0TW9udGgoKTtcclxuICAgICAgICBsZXQgZGF0ZU9mTW9udGggPSBkLmdldERhdGUoKTtcclxuICAgICAgICBsZXQgaG91cnMgPSBkLmdldEhvdXJzKCk7XHJcbiAgICAgICAgbGV0IG1pbnV0ZXMgPSBkLmdldE1pbnV0ZXMoKTtcclxuICAgICAgICBsZXQgc2Vjb25kcyA9IGQuZ2V0U2Vjb25kcygpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBuZXdEYXRlID0gbmV3IERhdGUodGhpcy5zZWxlY3RlZERhdGUudmFsdWVPZigpKTtcclxuICAgICAgICBuZXdEYXRlLnNldEZ1bGxZZWFyKHllYXIpO1xyXG4gICAgICAgIG5ld0RhdGUuc2V0TW9udGgobW9udGgpO1xyXG4gICAgICAgIGlmIChuZXdEYXRlLmdldE1vbnRoKCkgIT09IG1vbnRoKSB7XHJcbiAgICAgICAgICAgIG5ld0RhdGUuc2V0RGF0ZSgwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbmV3RGF0ZS5zZXREYXRlKGRhdGVPZk1vbnRoKTtcclxuICAgICAgICBuZXdEYXRlLnNldEhvdXJzKGhvdXJzKTtcclxuICAgICAgICBuZXdEYXRlLnNldE1pbnV0ZXMobWludXRlcyk7XHJcbiAgICAgICAgbmV3RGF0ZS5zZXRTZWNvbmRzKHNlY29uZHMpO1xyXG4gICAgICAgIHJldHVybiBuZXdEYXRlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgcm90YXRpb25Ub1RpbWUocjpudW1iZXIpIHtcclxuICAgICAgICB3aGlsZSAociA+IE1hdGguUEkpIHIgLT0gMipNYXRoLlBJO1xyXG4gICAgICAgIHdoaWxlIChyIDwgLU1hdGguUEkpIHIgKz0gMipNYXRoLlBJO1xyXG4gICAgICAgIGxldCB0ID0gKHIgLyBNYXRoLlBJICogMzApICsgMzA7XHJcbiAgICAgICAgcmV0dXJuIHQgPj0gNTkuNSA/IDAgOiBNYXRoLnJvdW5kKHQpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgdGltZVRvUm90YXRpb24odDpudW1iZXIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5ub3JtYWxpemVSb3RhdGlvbigodCArIDMwKSAvIDMwICogTWF0aC5QSSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBjcmVhdGUoZGF0ZTpEYXRlLCB0cmFuc2l0aW9uOlRyYW5zaXRpb24pIHtcclxuICAgICAgICB0aGlzLm1pbiA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCBkYXRlLmdldERhdGUoKSwgZGF0ZS5nZXRIb3VycygpLCBkYXRlLmdldE1pbnV0ZXMoKSk7XHJcbiAgICAgICAgdGhpcy5tYXggPSBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSwgZGF0ZS5nZXREYXRlKCksIGRhdGUuZ2V0SG91cnMoKSwgZGF0ZS5nZXRNaW51dGVzKCkgKyAxKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgaXRlcmF0b3IgPSBuZXcgRGF0ZSh0aGlzLm1pbi52YWx1ZU9mKCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMucGlja2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXBpY2tlcicpO1xyXG4gICAgICAgIHRoaXMucGlja2VyLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1zZWNvbmQtcGlja2VyJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uSW4odHJhbnNpdGlvbiwgdGhpcy5waWNrZXIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTI7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgdGljayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS10aWNrJyk7XHJcbiAgICAgICAgICAgIGxldCB0aWNrTGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tdGljay1sYWJlbCcpO1xyXG4gICAgICAgICAgICB0aWNrTGFiZWwuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLXNlY29uZC1lbGVtZW50Jyk7XHJcbiAgICAgICAgICAgIGxldCB0aWNrTGFiZWxDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tdGljay1sYWJlbC1jb250YWluZXInKTtcclxuICAgICAgICAgICAgbGV0IHIgPSBpICogTWF0aC5QSS82ICsgTWF0aC5QSTtcclxuICAgICAgICAgICAgdGlja0xhYmVsQ29udGFpbmVyLmFwcGVuZENoaWxkKHRpY2tMYWJlbCk7XHJcbiAgICAgICAgICAgIHRpY2suYXBwZW5kQ2hpbGQodGlja0xhYmVsQ29udGFpbmVyKTtcclxuICAgICAgICAgICAgdGljay5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlKCR7cn1yYWQpYDtcclxuICAgICAgICAgICAgdGlja0xhYmVsQ29udGFpbmVyLnN0eWxlLnRyYW5zZm9ybSA9IGByb3RhdGUoJHsyKk1hdGguUEkgLSByfXJhZClgO1xyXG4gICAgICAgICAgICB0aWNrTGFiZWwuc2V0QXR0cmlidXRlKCdkYXRpdW0tY2xvY2stcG9zJywgaS50b1N0cmluZygpKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBkID0gbmV3IERhdGUoZGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IHNlY29uZHMgPSB0aGlzLnJvdGF0aW9uVG9UaW1lKHIpO1xyXG4gICAgICAgICAgICBkLnNldFNlY29uZHMoc2Vjb25kcyk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aWNrTGFiZWwuc2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScsIGQudG9JU09TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKHRpY2spO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnNlY29uZEhhbmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tc2Vjb25kLWhhbmQnKTtcclxuICAgICAgICB0aGlzLm1pbnV0ZUhhbmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tbWludXRlLWhhbmQnKTtcclxuICAgICAgICB0aGlzLmhvdXJIYW5kID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLWhvdXItaGFuZCcpO1xyXG4gICAgICAgIHRoaXMudGltZURyYWdBcm0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tdGltZS1kcmFnLWFybScpO1xyXG4gICAgICAgIHRoaXMudGltZURyYWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tdGltZS1kcmFnJyk7XHJcbiAgICAgICAgdGhpcy50aW1lRHJhZy5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tc2Vjb25kLWRyYWcnKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnRpbWVEcmFnLnNldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnLCBkYXRlLnRvSVNPU3RyaW5nKCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMudGltZURyYWdBcm0uYXBwZW5kQ2hpbGQodGhpcy50aW1lRHJhZyk7XHJcbiAgICAgICAgdGhpcy5waWNrZXIuYXBwZW5kQ2hpbGQodGhpcy50aW1lRHJhZ0FybSk7XHJcbiAgICAgICAgdGhpcy5waWNrZXIuYXBwZW5kQ2hpbGQodGhpcy5ob3VySGFuZCk7XHJcbiAgICAgICAgdGhpcy5waWNrZXIuYXBwZW5kQ2hpbGQodGhpcy5taW51dGVIYW5kKTtcclxuICAgICAgICB0aGlzLnBpY2tlci5hcHBlbmRDaGlsZCh0aGlzLnNlY29uZEhhbmQpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuYXR0YWNoKCk7XHJcbiAgICAgICAgdGhpcy5zZXRTZWxlY3RlZERhdGUodGhpcy5zZWxlY3RlZERhdGUpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgdXBkYXRlTGFiZWxzKGRhdGU6RGF0ZSwgZm9yY2VVcGRhdGU6Ym9vbGVhbiA9IGZhbHNlKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGxhYmVscyA9IHRoaXMucGlja2VyLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRpdW0tY2xvY2stcG9zXScpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGFiZWxzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBsYWJlbCA9IGxhYmVscy5pdGVtKGkpO1xyXG4gICAgICAgICAgICBsZXQgciA9IE1hdGguUEkqcGFyc2VJbnQobGFiZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tY2xvY2stcG9zJyksIDEwKS82LTMqTWF0aC5QSTtcclxuICAgICAgICAgICAgbGV0IHRpbWUgPSB0aGlzLnJvdGF0aW9uVG9UaW1lKHIpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IGQgPSBuZXcgRGF0ZShsYWJlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGFiZWwuc2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScsIGQudG9JU09TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgc3RhcnQgPSBuZXcgRGF0ZShkLmdldEZ1bGxZZWFyKCksIGQuZ2V0TW9udGgoKSwgZC5nZXREYXRlKCksIGQuZ2V0SG91cnMoKSwgZC5nZXRNaW51dGVzKCksIGQuZ2V0U2Vjb25kcygpKTtcclxuICAgICAgICAgICAgbGV0IGVuZCA9IG5ldyBEYXRlKGQuZ2V0RnVsbFllYXIoKSwgZC5nZXRNb250aCgpLCBkLmdldERhdGUoKSwgZC5nZXRIb3VycygpLCBkLmdldE1pbnV0ZXMoKSwgZC5nZXRTZWNvbmRzKCkgKyAxKTtcclxuICAgICAgICAgICAgaWYgKGVuZC52YWx1ZU9mKCkgPiB0aGlzLm9wdGlvbnMubWluRGF0ZS52YWx1ZU9mKCkgJiZcclxuICAgICAgICAgICAgICAgIHN0YXJ0LnZhbHVlT2YoKSA8IHRoaXMub3B0aW9ucy5tYXhEYXRlLnZhbHVlT2YoKSAmJlxyXG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLmlzU2Vjb25kVmFsaWQoZCkpIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1pbmFjdGl2ZScpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGFiZWwuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLWluYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxhYmVsLmlubmVySFRNTCA9IHRoaXMucGFkKHRpbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHVwZGF0ZU9wdGlvbnMob3B0aW9uczpJT3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICByZXR1cm4gTGV2ZWwuU0VDT05EO1xyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIlBpY2tlci50c1wiIC8+XHJcblxyXG5jbGFzcyBZZWFyUGlja2VyIGV4dGVuZHMgUGlja2VyIGltcGxlbWVudHMgSVBpY2tlciB7XHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OkhUTUxFbGVtZW50LCBjb250YWluZXI6SFRNTEVsZW1lbnQpIHtcclxuICAgICAgICBzdXBlcihlbGVtZW50LCBjb250YWluZXIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi50YXAoY29udGFpbmVyLCAnZGF0aXVtLXllYXItZWxlbWVudFtkYXRpdW0tZGF0YV0nLCAoZSkgPT4ge1xyXG4gICAgICAgICAgIGxldCBlbDpFbGVtZW50ID0gPEVsZW1lbnQ+ZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xyXG4gICAgICAgICAgIGxldCB5ZWFyID0gbmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKS5nZXRGdWxsWWVhcigpO1xyXG4gICAgICAgICAgIFxyXG4gICAgICAgICAgIGxldCBkYXRlID0gbmV3IERhdGUodGhpcy5zZWxlY3RlZERhdGUudmFsdWVPZigpKTtcclxuICAgICAgICAgICBkYXRlLnNldEZ1bGxZZWFyKHllYXIpO1xyXG4gICAgICAgICAgIFxyXG4gICAgICAgICAgIHRyaWdnZXIuem9vbUluKGVsZW1lbnQsIHtcclxuICAgICAgICAgICAgICAgZGF0ZTogZGF0ZSxcclxuICAgICAgICAgICAgICAgY3VycmVudExldmVsOiBMZXZlbC5ZRUFSXHJcbiAgICAgICAgICAgfSlcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4uZG93bihjb250YWluZXIsICdkYXRpdW0teWVhci1lbGVtZW50JywgKGUpID0+IHtcclxuICAgICAgICAgICAgbGV0IGVsOkhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PihlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQpO1xyXG4gICAgICAgICAgICBsZXQgdGV4dCA9IG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSkuZ2V0RnVsbFllYXIoKS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICBsZXQgb2Zmc2V0ID0gdGhpcy5nZXRPZmZzZXQoZWwpO1xyXG4gICAgICAgICAgICB0cmlnZ2VyLm9wZW5CdWJibGUoZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgeDogb2Zmc2V0LnggKyAzNSxcclxuICAgICAgICAgICAgICAgIHk6IG9mZnNldC55ICsgMTUsXHJcbiAgICAgICAgICAgICAgICB0ZXh0OiB0ZXh0XHJcbiAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBjcmVhdGUoZGF0ZTpEYXRlLCB0cmFuc2l0aW9uOlRyYW5zaXRpb24pIHtcclxuICAgICAgICB0aGlzLm1pbiA9IG5ldyBEYXRlKE1hdGguZmxvb3IoZGF0ZS5nZXRGdWxsWWVhcigpLzEwKSoxMCwgMCk7XHJcbiAgICAgICAgdGhpcy5tYXggPSBuZXcgRGF0ZShNYXRoLmNlaWwoZGF0ZS5nZXRGdWxsWWVhcigpLzEwKSoxMCwgMCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMubWluLnZhbHVlT2YoKSA9PT0gdGhpcy5tYXgudmFsdWVPZigpKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWF4LnNldEZ1bGxZZWFyKHRoaXMubWF4LmdldEZ1bGxZZWFyKCkgKyAxMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBpdGVyYXRvciA9IG5ldyBEYXRlKHRoaXMubWluLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5waWNrZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tcGlja2VyJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uSW4odHJhbnNpdGlvbiwgdGhpcy5waWNrZXIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCB5ZWFyRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS15ZWFyLWVsZW1lbnQnKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHllYXJFbGVtZW50LmlubmVySFRNTCA9IGl0ZXJhdG9yLmdldEZ1bGxZZWFyKCkudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaXNZZWFyVmFsaWQoaXRlcmF0b3IpKSB7XHJcbiAgICAgICAgICAgICAgICB5ZWFyRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJywgaXRlcmF0b3IudG9JU09TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKHllYXJFbGVtZW50KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGl0ZXJhdG9yLnNldEZ1bGxZZWFyKGl0ZXJhdG9yLmdldEZ1bGxZZWFyKCkgKyAxKTtcclxuICAgICAgICB9IHdoaWxlIChpdGVyYXRvci52YWx1ZU9mKCkgPD0gdGhpcy5tYXgudmFsdWVPZigpKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmF0dGFjaCgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuc2V0U2VsZWN0ZWREYXRlKHRoaXMuc2VsZWN0ZWREYXRlKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHNldFNlbGVjdGVkRGF0ZShzZWxlY3RlZERhdGU6RGF0ZSkge1xyXG4gICAgICAgIGlmIChzZWxlY3RlZERhdGUgPT09IHZvaWQgMCkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWREYXRlID0gbmV3IERhdGUoc2VsZWN0ZWREYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHllYXJFbGVtZW50cyA9IHRoaXMucGlja2VyQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJ2RhdGl1bS15ZWFyLWVsZW1lbnQnKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHllYXJFbGVtZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgZWwgPSB5ZWFyRWxlbWVudHMuaXRlbShpKTtcclxuICAgICAgICAgICAgbGV0IGRhdGUgPSBuZXcgRGF0ZShlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpO1xyXG4gICAgICAgICAgICBpZiAoZGF0ZS5nZXRGdWxsWWVhcigpID09PSBzZWxlY3RlZERhdGUuZ2V0RnVsbFllYXIoKSkge1xyXG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLXNlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdkYXRpdW0tc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldEhlaWdodCgpIHtcclxuICAgICAgICByZXR1cm4gMTgwO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgcmV0dXJuIExldmVsLllFQVI7XHJcbiAgICB9XHJcbn0iLCJ2YXIgY3NzPVwiZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWhlYWRlcixkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLWNvbnRhaW5lcnt3aWR0aDpjYWxjKDEwMCUgLSAxNHB4KTtib3gtc2hhZG93OjAgM3B4IDZweCByZ2JhKDAsMCwwLC4xNiksMCAzcHggNnB4IHJnYmEoMCwwLDAsLjIzKTtvdmVyZmxvdzpoaWRkZW59ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWJ1YmJsZSxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0taGVhZGVyLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXItY29udGFpbmVye2JveC1zaGFkb3c6MCAzcHggNnB4IHJnYmEoMCwwLDAsLjE2KSwwIDNweCA2cHggcmdiYSgwLDAsMCwuMjMpfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1oZWFkZXItd3JhcHBlcntvdmVyZmxvdzpoaWRkZW47cG9zaXRpb246YWJzb2x1dGU7bGVmdDotN3B4O3JpZ2h0Oi03cHg7dG9wOi03cHg7aGVpZ2h0Ojg3cHg7ZGlzcGxheTpibG9jaztwb2ludGVyLWV2ZW50czpub25lfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1oZWFkZXJ7cG9zaXRpb246cmVsYXRpdmU7ZGlzcGxheTpibG9jaztoZWlnaHQ6MTAwcHg7YmFja2dyb3VuZC1jb2xvcjpfcHJpbWFyeTtib3JkZXItdG9wLWxlZnQtcmFkaXVzOjNweDtib3JkZXItdG9wLXJpZ2h0LXJhZGl1czozcHg7ei1pbmRleDoxO21hcmdpbjo3cHg7cG9pbnRlci1ldmVudHM6YXV0b31kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc3Bhbi1sYWJlbC1jb250YWluZXJ7cG9zaXRpb246YWJzb2x1dGU7bGVmdDo0MHB4O3JpZ2h0OjQwcHg7dG9wOjA7Ym90dG9tOjA7ZGlzcGxheTpibG9jaztvdmVyZmxvdzpoaWRkZW47dHJhbnNpdGlvbjouMnMgZWFzZSBhbGw7dHJhbnNmb3JtLW9yaWdpbjo0MHB4IDQwcHh9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXNwYW4tbGFiZWx7cG9zaXRpb246YWJzb2x1dGU7Zm9udC1zaXplOjE4cHQ7Y29sb3I6X3ByaW1hcnlfdGV4dDtmb250LXdlaWdodDo3MDA7dHJhbnNmb3JtLW9yaWdpbjowIDA7d2hpdGUtc3BhY2U6bm93cmFwO3RyYW5zaXRpb246YWxsIC4ycyBlYXNlO3RleHQtdHJhbnNmb3JtOnVwcGVyY2FzZX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc3Bhbi1sYWJlbC5kYXRpdW0tdG9we3RyYW5zZm9ybTp0cmFuc2xhdGVZKDE3cHgpIHNjYWxlKC42Nik7d2lkdGg6MTUxJTtvcGFjaXR5Oi42fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS1ib3R0b217dHJhbnNmb3JtOnRyYW5zbGF0ZVkoMzZweCkgc2NhbGUoMSk7d2lkdGg6MTAwJTtvcGFjaXR5OjF9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXNwYW4tbGFiZWwuZGF0aXVtLXRvcC5kYXRpdW0taGlkZGVue3RyYW5zZm9ybTp0cmFuc2xhdGVZKDVweCkgc2NhbGUoLjQpO29wYWNpdHk6MH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc3Bhbi1sYWJlbC5kYXRpdW0tYm90dG9tLmRhdGl1bS1oaWRkZW57dHJhbnNmb3JtOnRyYW5zbGF0ZVkoNzhweCkgc2NhbGUoMS4yKTtvcGFjaXR5OjF9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXNwYW4tbGFiZWw6YWZ0ZXJ7Y29udGVudDonJztkaXNwbGF5OmlubGluZS1ibG9jaztwb3NpdGlvbjphYnNvbHV0ZTttYXJnaW4tbGVmdDoxMHB4O21hcmdpbi10b3A6NnB4O2hlaWdodDoxN3B4O3dpZHRoOjE3cHg7b3BhY2l0eTowO3RyYW5zaXRpb246YWxsIC4ycyBlYXNlO2JhY2tncm91bmQ6dXJsKGRhdGE6aW1hZ2Uvc3ZnK3htbDt1dGY4LCUzQ3N2ZyUyMHhtbG5zJTNEJTIyaHR0cCUzQSUyRiUyRnd3dy53My5vcmclMkYyMDAwJTJGc3ZnJTIyJTNFJTNDZyUyMGZpbGwlM0QlMjJfcHJpbWFyeV90ZXh0JTIyJTNFJTNDcGF0aCUyMGQlM0QlMjJNMTclMjAxNWwtMiUyMDItNS01JTIwMi0yeiUyMiUyMGZpbGwtcnVsZSUzRCUyMmV2ZW5vZGQlMjIlMkYlM0UlM0NwYXRoJTIwZCUzRCUyMk03JTIwMGE3JTIwNyUyMDAlMjAwJTIwMC03JTIwNyUyMDclMjA3JTIwMCUyMDAlMjAwJTIwNyUyMDclMjA3JTIwNyUyMDAlMjAwJTIwMCUyMDctNyUyMDclMjA3JTIwMCUyMDAlMjAwLTctN3ptMCUyMDJhNSUyMDUlMjAwJTIwMCUyMDElMjA1JTIwNSUyMDUlMjA1JTIwMCUyMDAlMjAxLTUlMjA1JTIwNSUyMDUlMjAwJTIwMCUyMDEtNS01JTIwNSUyMDUlMjAwJTIwMCUyMDElMjA1LTV6JTIyJTJGJTNFJTNDcGF0aCUyMGQlM0QlMjJNNCUyMDZoNnYySDR6JTIyJTJGJTNFJTNDJTJGZyUzRSUzQyUyRnN2ZyUzRSl9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWJ1YmJsZSxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tYnViYmxlLmRhdGl1bS1idWJibGUtdmlzaWJsZXt0cmFuc2l0aW9uLXByb3BlcnR5OnRyYW5zZm9ybSxvcGFjaXR5O3RyYW5zaXRpb24tdGltaW5nLWZ1bmN0aW9uOmVhc2U7dHJhbnNpdGlvbi1kdXJhdGlvbjouMnN9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXNwYW4tbGFiZWwuZGF0aXVtLXRvcDphZnRlcntvcGFjaXR5OjF9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXNwYW4tbGFiZWwgZGF0aXVtLXZhcmlhYmxle2NvbG9yOl9wcmltYXJ5O2ZvbnQtc2l6ZToxNHB0O3BhZGRpbmc6MCA0cHg7bWFyZ2luOjAgMnB4O3RvcDotMnB4O3Bvc2l0aW9uOnJlbGF0aXZlfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1zcGFuLWxhYmVsIGRhdGl1bS12YXJpYWJsZTpiZWZvcmV7Y29udGVudDonJztwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjA7dG9wOjA7cmlnaHQ6MDtib3R0b206MDtib3JkZXItcmFkaXVzOjVweDtiYWNrZ3JvdW5kLWNvbG9yOl9wcmltYXJ5X3RleHQ7ei1pbmRleDotMTtvcGFjaXR5Oi43fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1zcGFuLWxhYmVsIGRhdGl1bS1sb3dlcnt0ZXh0LXRyYW5zZm9ybTpsb3dlcmNhc2V9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW5leHQsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXByZXZ7cG9zaXRpb246YWJzb2x1dGU7d2lkdGg6NDBweDt0b3A6MDtib3R0b206MDt0cmFuc2Zvcm0tb3JpZ2luOjIwcHggNTJweH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbmV4dDphZnRlcixkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbmV4dDpiZWZvcmUsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXByZXY6YWZ0ZXIsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXByZXY6YmVmb3Jle2NvbnRlbnQ6Jyc7cG9zaXRpb246YWJzb2x1dGU7ZGlzcGxheTpibG9jazt3aWR0aDozcHg7aGVpZ2h0OjhweDtsZWZ0OjUwJTtiYWNrZ3JvdW5kLWNvbG9yOl9wcmltYXJ5X3RleHQ7dG9wOjQ4cHh9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW5leHQuZGF0aXVtLWFjdGl2ZSxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcHJldi5kYXRpdW0tYWN0aXZle3RyYW5zZm9ybTpzY2FsZSguOSk7b3BhY2l0eTouOX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcHJldntsZWZ0OjB9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXByZXY6YWZ0ZXIsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXByZXY6YmVmb3Jle21hcmdpbi1sZWZ0Oi0zcHh9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW5leHR7cmlnaHQ6MH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcHJldjpiZWZvcmV7dHJhbnNmb3JtOnJvdGF0ZSg0NWRlZykgdHJhbnNsYXRlWSgtMi42cHgpfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1wcmV2OmFmdGVye3RyYW5zZm9ybTpyb3RhdGUoLTQ1ZGVnKSB0cmFuc2xhdGVZKDIuNnB4KX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbmV4dDpiZWZvcmV7dHJhbnNmb3JtOnJvdGF0ZSg0NWRlZykgdHJhbnNsYXRlWSgyLjZweCl9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW5leHQ6YWZ0ZXJ7dHJhbnNmb3JtOnJvdGF0ZSgtNDVkZWcpIHRyYW5zbGF0ZVkoLTIuNnB4KX1kYXRpdW0tY29udGFpbmVyLl9pZHtkaXNwbGF5OmJsb2NrO3Bvc2l0aW9uOmFic29sdXRlO3dpZHRoOjI4MHB4O2ZvbnQtZmFtaWx5OlJvYm90byxBcmlhbDttYXJnaW4tdG9wOjJweDtmb250LXNpemU6MTZweH1kYXRpdW0tY29udGFpbmVyLl9pZCxkYXRpdW0tY29udGFpbmVyLl9pZCAqey13ZWJraXQtdG91Y2gtY2FsbG91dDpub25lOy13ZWJraXQtdXNlci1zZWxlY3Q6bm9uZTsta2h0bWwtdXNlci1zZWxlY3Q6bm9uZTstbW96LXVzZXItc2VsZWN0Om5vbmU7LW1zLXVzZXItc2VsZWN0Om5vbmU7LXdlYmtpdC10YXAtaGlnaGxpZ2h0LWNvbG9yOnRyYW5zcGFyZW50O2N1cnNvcjpkZWZhdWx0fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1idWJibGV7cG9zaXRpb246YWJzb2x1dGU7d2lkdGg6NTBweDtsaW5lLWhlaWdodDoyNnB4O3RleHQtYWxpZ246Y2VudGVyO2ZvbnQtc2l6ZToxNHB4O2JhY2tncm91bmQtY29sb3I6X3NlY29uZGFyeV9hY2NlbnQ7Zm9udC13ZWlnaHQ6NzAwO2JvcmRlci1yYWRpdXM6M3B4O21hcmdpbi1sZWZ0Oi0yNXB4O21hcmdpbi10b3A6LTMycHg7Y29sb3I6X3NlY29uZGFyeTt6LWluZGV4OjE7dHJhbnNmb3JtLW9yaWdpbjozMHB4IDM2cHg7dHJhbnNpdGlvbi1kZWxheTowO3RyYW5zZm9ybTpzY2FsZSguNSk7b3BhY2l0eTowfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1idWJibGU6YWZ0ZXJ7Y29udGVudDonJztwb3NpdGlvbjphYnNvbHV0ZTtkaXNwbGF5OmJsb2NrO3dpZHRoOjEwcHg7aGVpZ2h0OjEwcHg7dHJhbnNmb3JtOnJvdGF0ZSg0NWRlZyk7YmFja2dyb3VuZDpsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLHJnYmEoMCwwLDAsMCkgNTAlLF9zZWNvbmRhcnlfYWNjZW50IDUwJSk7bGVmdDo1MCU7dG9wOjIwcHg7bWFyZ2luLWxlZnQ6LTVweH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tYnViYmxlLmRhdGl1bS1idWJibGUtdmlzaWJsZXt0cmFuc2Zvcm06c2NhbGUoMSk7b3BhY2l0eToxO3RyYW5zaXRpb24tZGVsYXk6LjJzfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1idWJibGU6bm90KC5kYXRpdW0tYnViYmxlLXZpc2libGUpe29wYWNpdHk6MCFpbXBvcnRhbnR9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWJ1YmJsZS5kYXRpdW0tYnViYmxlLWluYWN0aXZle29wYWNpdHk6LjV9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci1jb250YWluZXItd3JhcHBlcntvdmVyZmxvdzpoaWRkZW47cG9zaXRpb246YWJzb2x1dGU7bGVmdDotN3B4O3JpZ2h0Oi03cHg7dG9wOjgwcHg7aGVpZ2h0OjI3MHB4O2Rpc3BsYXk6YmxvY2s7cG9pbnRlci1ldmVudHM6bm9uZX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLWNvbnRhaW5lcntwb3NpdGlvbjpyZWxhdGl2ZTtoZWlnaHQ6MjYwcHg7YmFja2dyb3VuZC1jb2xvcjpfc2Vjb25kYXJ5O2Rpc3BsYXk6YmxvY2s7bWFyZ2luOjAgN3B4IDdweDtwYWRkaW5nLXRvcDoyMHB4O3RyYW5zZm9ybTp0cmFuc2xhdGVZKC0yNzBweCk7cG9pbnRlci1ldmVudHM6YXV0bztib3JkZXItYm90dG9tLXJpZ2h0LXJhZGl1czozcHg7Ym9yZGVyLWJvdHRvbS1sZWZ0LXJhZGl1czozcHg7dHJhbnNpdGlvbjphbGwgZWFzZSAuNHM7dHJhbnNpdGlvbi1kZWxheTouMXN9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlcntwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjA7cmlnaHQ6MDtib3R0b206MDtjb2xvcjpfc2Vjb25kYXJ5X3RleHQ7dHJhbnNpdGlvbjphbGwgZWFzZSAuNHN9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tcGlja2VyLWxlZnR7dHJhbnNmb3JtOnRyYW5zbGF0ZVgoLTEwMCUpIHNjYWxlKDEpO3BvaW50ZXItZXZlbnRzOm5vbmU7dHJhbnNpdGlvbi1kZWxheTowc31kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1waWNrZXItcmlnaHR7dHJhbnNmb3JtOnRyYW5zbGF0ZVgoMTAwJSkgc2NhbGUoMSk7cG9pbnRlci1ldmVudHM6bm9uZTt0cmFuc2l0aW9uLWRlbGF5OjBzfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLXBpY2tlci1vdXR7dHJhbnNmb3JtOnRyYW5zbGF0ZVgoMCkgc2NhbGUoMS40KTtvcGFjaXR5OjA7cG9pbnRlci1ldmVudHM6bm9uZTt0cmFuc2l0aW9uLWRlbGF5OjBzfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLXBpY2tlci1pbnt0cmFuc2Zvcm06dHJhbnNsYXRlWCgwKSBzY2FsZSguNik7b3BhY2l0eTowO3BvaW50ZXItZXZlbnRzOm5vbmU7dHJhbnNpdGlvbi1kZWxheTowc31kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbW9udGgtZWxlbWVudCxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0teWVhci1lbGVtZW50e2Rpc3BsYXk6aW5saW5lLWJsb2NrO3dpZHRoOjI1JTtsaW5lLWhlaWdodDo2MHB4O3RleHQtYWxpZ246Y2VudGVyO3Bvc2l0aW9uOnJlbGF0aXZlO3RyYW5zaXRpb246LjJzIGVhc2UgYWxsfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tb250aC1lbGVtZW50LmRhdGl1bS1zZWxlY3RlZDphZnRlcixkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0teWVhci1lbGVtZW50LmRhdGl1bS1zZWxlY3RlZDphZnRlcntjb250ZW50OicnO3Bvc2l0aW9uOmFic29sdXRlO2xlZnQ6MjBweDtyaWdodDoyMHB4O3RvcDo1MCU7bWFyZ2luLXRvcDoxMXB4O2hlaWdodDoycHg7ZGlzcGxheTpibG9jaztiYWNrZ3JvdW5kLWNvbG9yOl9zZWNvbmRhcnlfYWNjZW50fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tb250aC1lbGVtZW50LmRhdGl1bS1hY3RpdmUsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXllYXItZWxlbWVudC5kYXRpdW0tYWN0aXZle3RyYW5zZm9ybTpzY2FsZSguOSk7dHJhbnNpdGlvbjpub25lfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tb250aC1lbGVtZW50Om5vdChbZGF0aXVtLWRhdGFdKSxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0teWVhci1lbGVtZW50Om5vdChbZGF0aXVtLWRhdGFdKXtvcGFjaXR5Oi40O3BvaW50ZXItZXZlbnRzOm5vbmV9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1vbnRoLWVsZW1lbnQuZGF0aXVtLXNlbGVjdGVkOmFmdGVye2xlZnQ6MjVweDtyaWdodDoyNXB4fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1kYXRlLWhlYWRlcntkaXNwbGF5OmlubGluZS1ibG9jazt3aWR0aDo0MHB4O2xpbmUtaGVpZ2h0OjI4cHg7b3BhY2l0eTouNjtmb250LXdlaWdodDo3MDA7dGV4dC1hbGlnbjpjZW50ZXJ9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWRhdGUtZWxlbWVudHtkaXNwbGF5OmlubGluZS1ibG9jazt3aWR0aDo0MHB4O2xpbmUtaGVpZ2h0OjM2cHg7dGV4dC1hbGlnbjpjZW50ZXI7cG9zaXRpb246cmVsYXRpdmU7dHJhbnNpdGlvbjouMnMgZWFzZSBhbGx9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWRhdGUtZWxlbWVudC5kYXRpdW0tc2VsZWN0ZWQ6YWZ0ZXJ7Y29udGVudDonJztwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjEycHg7cmlnaHQ6MTJweDt0b3A6NTAlO21hcmdpbi10b3A6MTBweDtoZWlnaHQ6MnB4O2Rpc3BsYXk6YmxvY2s7YmFja2dyb3VuZC1jb2xvcjpfc2Vjb25kYXJ5X2FjY2VudH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tZGF0ZS1lbGVtZW50LmRhdGl1bS1hY3RpdmV7dHJhbnNmb3JtOnNjYWxlKC45KTt0cmFuc2l0aW9uOm5vbmV9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWRhdGUtZWxlbWVudDpub3QoW2RhdGl1bS1kYXRhXSl7b3BhY2l0eTouNDtwb2ludGVyLWV2ZW50czpub25lfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLWhvdXItcGlja2VyLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLW1pbnV0ZS1waWNrZXIsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tc2Vjb25kLXBpY2tlcntoZWlnaHQ6MjQwcHh9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0taG91ci1waWNrZXI6YmVmb3JlLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLW1pbnV0ZS1waWNrZXI6YmVmb3JlLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLXNlY29uZC1waWNrZXI6YmVmb3Jle2NvbnRlbnQ6Jyc7d2lkdGg6MTQwcHg7aGVpZ2h0OjE0MHB4O3Bvc2l0aW9uOmFic29sdXRlO2JvcmRlcjoxcHggc29saWQ7bGVmdDo1MCU7dG9wOjUwJTttYXJnaW4tbGVmdDotNzFweDttYXJnaW4tdG9wOi03MXB4O2JvcmRlci1yYWRpdXM6NzBweDtvcGFjaXR5Oi41fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLWhvdXItcGlja2VyOmFmdGVyLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLW1pbnV0ZS1waWNrZXI6YWZ0ZXIsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tc2Vjb25kLXBpY2tlcjphZnRlcntjb250ZW50OicnO3dpZHRoOjRweDtoZWlnaHQ6NHB4O21hcmdpbi1sZWZ0Oi00cHg7bWFyZ2luLXRvcDotNHB4O3RvcDo1MCU7bGVmdDo1MCU7Ym9yZGVyLXJhZGl1czo0cHg7cG9zaXRpb246YWJzb2x1dGU7Ym9yZGVyOjJweCBzb2xpZDtib3JkZXItY29sb3I6X3NlY29uZGFyeV9hY2NlbnQ7YmFja2dyb3VuZC1jb2xvcjpfc2Vjb25kYXJ5O2JveC1zaGFkb3c6MCAwIDAgMnB4IF9zZWNvbmRhcnl9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXRpY2t7cG9zaXRpb246YWJzb2x1dGU7bGVmdDo1MCU7dG9wOjUwJTt3aWR0aDoycHg7aGVpZ2h0OjcwcHg7bWFyZ2luLWxlZnQ6LTFweDt0cmFuc2Zvcm0tb3JpZ2luOjFweCAwfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS10aWNrOmFmdGVye2NvbnRlbnQ6Jyc7cG9zaXRpb246YWJzb2x1dGU7d2lkdGg6MnB4O2hlaWdodDo2cHg7YmFja2dyb3VuZC1jb2xvcjpfc2Vjb25kYXJ5X3RleHQ7Ym90dG9tOi00cHg7b3BhY2l0eTouNX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbWVyaWRpZW0tc3dpdGNoZXJ7cG9zaXRpb246YWJzb2x1dGU7bGVmdDo1MCU7bWFyZ2luLWxlZnQ6LTMwcHg7dG9wOjUwJTttYXJnaW4tdG9wOjE1cHg7ZGlzcGxheTpibG9jazt3aWR0aDo2MHB4O2hlaWdodDo0MHB4fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tZXJpZGllbS1zd2l0Y2hlcjphZnRlcixkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbWVyaWRpZW0tc3dpdGNoZXI6YmVmb3Jle3Bvc2l0aW9uOmFic29sdXRlO3dpZHRoOjMwcHg7dG9wOjA7ZGlzcGxheTpibG9jaztsaW5lLWhlaWdodDo0MHB4O2ZvbnQtd2VpZ2h0OjcwMDt0ZXh0LWFsaWduOmNlbnRlcjtmb250LXNpemU6MTRweDt0cmFuc2Zvcm06c2NhbGUoLjkpO29wYWNpdHk6Ljk7Y29sb3I6X3NlY29uZGFyeV90ZXh0O3RyYW5zaXRpb246YWxsIGVhc2UgLjJzfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tZXJpZGllbS1zd2l0Y2hlci5kYXRpdW0tbWlsaXRhcnktdGltZTpiZWZvcmV7Y29udGVudDonLTEyJ31kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbWVyaWRpZW0tc3dpdGNoZXIuZGF0aXVtLW1pbGl0YXJ5LXRpbWU6YWZ0ZXJ7Y29udGVudDonKzEyJ31kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbWVyaWRpZW0tc3dpdGNoZXI6YmVmb3Jle2NvbnRlbnQ6J0FNJztsZWZ0OjB9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1lcmlkaWVtLXN3aXRjaGVyOmFmdGVye2NvbnRlbnQ6J1BNJztyaWdodDowfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tZXJpZGllbS1zd2l0Y2hlci5kYXRpdW0tYW0tc2VsZWN0ZWQ6YmVmb3JlLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tZXJpZGllbS1zd2l0Y2hlci5kYXRpdW0tcG0tc2VsZWN0ZWQ6YWZ0ZXJ7dHJhbnNmb3JtOnNjYWxlKDEpO2NvbG9yOl9zZWNvbmRhcnlfYWNjZW50O29wYWNpdHk6MX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbWVyaWRpZW0tc3dpdGNoZXIuZGF0aXVtLWFjdGl2ZTphZnRlcixkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbWVyaWRpZW0tc3dpdGNoZXIuZGF0aXVtLWFjdGl2ZTpiZWZvcmV7dHJhbnNpdGlvbjpub25lfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tZXJpZGllbS1zd2l0Y2hlci5kYXRpdW0tYWN0aXZlLmRhdGl1bS1hbS1zZWxlY3RlZDpiZWZvcmV7dHJhbnNmb3JtOnNjYWxlKC45KX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbWVyaWRpZW0tc3dpdGNoZXIuZGF0aXVtLWFjdGl2ZS5kYXRpdW0tYW0tc2VsZWN0ZWQ6YWZ0ZXIsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1lcmlkaWVtLXN3aXRjaGVyLmRhdGl1bS1hY3RpdmUuZGF0aXVtLXBtLXNlbGVjdGVkOmJlZm9yZXt0cmFuc2Zvcm06c2NhbGUoLjgpfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tZXJpZGllbS1zd2l0Y2hlci5kYXRpdW0tYWN0aXZlLmRhdGl1bS1wbS1zZWxlY3RlZDphZnRlcnt0cmFuc2Zvcm06c2NhbGUoLjkpfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS10aWNrLWxhYmVsLWNvbnRhaW5lcntwb3NpdGlvbjphYnNvbHV0ZTtib3R0b206LTUwcHg7bGVmdDotMjRweDtkaXNwbGF5OmJsb2NrO2hlaWdodDo1MHB4O3dpZHRoOjUwcHh9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXRpY2stbGFiZWx7cG9zaXRpb246YWJzb2x1dGU7bGVmdDowO3RvcDowO2Rpc3BsYXk6YmxvY2s7d2lkdGg6MTAwJTtsaW5lLWhlaWdodDo1MHB4O2JvcmRlci1yYWRpdXM6MjVweDt0ZXh0LWFsaWduOmNlbnRlcjtmb250LXNpemU6MTRweDt0cmFuc2l0aW9uOi4ycyBlYXNlIGFsbH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tdGljay1sYWJlbC5kYXRpdW0tYWN0aXZle3RyYW5zZm9ybTpzY2FsZSguOSk7dHJhbnNpdGlvbjpub25lfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS10aWNrLWxhYmVsLmRhdGl1bS1pbmFjdGl2ZXtvcGFjaXR5Oi40O3BvaW50ZXItZXZlbnRzOm5vbmV9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0taG91ci1waWNrZXIuZGF0aXVtLWRyYWdnaW5nIGRhdGl1bS1ob3VyLWhhbmQsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0taG91ci1waWNrZXIuZGF0aXVtLWRyYWdnaW5nIGRhdGl1bS1taW51dGUtaGFuZCxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1ob3VyLXBpY2tlci5kYXRpdW0tZHJhZ2dpbmcgZGF0aXVtLXNlY29uZC1oYW5kLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLWhvdXItcGlja2VyLmRhdGl1bS1kcmFnZ2luZyBkYXRpdW0tdGltZS1kcmFnLWFybSxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1taW51dGUtcGlja2VyLmRhdGl1bS1kcmFnZ2luZyBkYXRpdW0taG91ci1oYW5kLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLW1pbnV0ZS1waWNrZXIuZGF0aXVtLWRyYWdnaW5nIGRhdGl1bS1taW51dGUtaGFuZCxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1taW51dGUtcGlja2VyLmRhdGl1bS1kcmFnZ2luZyBkYXRpdW0tc2Vjb25kLWhhbmQsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tbWludXRlLXBpY2tlci5kYXRpdW0tZHJhZ2dpbmcgZGF0aXVtLXRpbWUtZHJhZy1hcm0sZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tc2Vjb25kLXBpY2tlci5kYXRpdW0tZHJhZ2dpbmcgZGF0aXVtLWhvdXItaGFuZCxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1zZWNvbmQtcGlja2VyLmRhdGl1bS1kcmFnZ2luZyBkYXRpdW0tbWludXRlLWhhbmQsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tc2Vjb25kLXBpY2tlci5kYXRpdW0tZHJhZ2dpbmcgZGF0aXVtLXNlY29uZC1oYW5kLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLXNlY29uZC1waWNrZXIuZGF0aXVtLWRyYWdnaW5nIGRhdGl1bS10aW1lLWRyYWctYXJte3RyYW5zaXRpb246bm9uZX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0taG91ci1oYW5kLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1taW51dGUtaGFuZCxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc2Vjb25kLWhhbmR7cG9zaXRpb246YWJzb2x1dGU7ZGlzcGxheTpibG9jazt3aWR0aDowO2hlaWdodDowO2xlZnQ6NTAlO3RvcDo1MCU7dHJhbnNmb3JtLW9yaWdpbjozcHggM3B4O21hcmdpbi1sZWZ0Oi0zcHg7bWFyZ2luLXRvcDotM3B4O2JvcmRlci1sZWZ0OjNweCBzb2xpZCB0cmFuc3BhcmVudDtib3JkZXItcmlnaHQ6M3B4IHNvbGlkIHRyYW5zcGFyZW50O2JvcmRlci10b3AtbGVmdC1yYWRpdXM6M3B4O2JvcmRlci10b3AtcmlnaHQtcmFkaXVzOjNweDt0cmFuc2l0aW9uOi4zcyBlYXNlIGFsbH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1taW51dGUtcGlja2VyIGRhdGl1bS1ob3VyLWhhbmQsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tc2Vjb25kLXBpY2tlciBkYXRpdW0taG91ci1oYW5kLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLXNlY29uZC1waWNrZXIgZGF0aXVtLW1pbnV0ZS1oYW5ke2JvcmRlci10b3AtY29sb3I6X3NlY29uZGFyeV90ZXh0O29wYWNpdHk6LjV9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWhvdXItaGFuZHtib3JkZXItdG9wOjMwcHggc29saWQgX3NlY29uZGFyeV9hY2NlbnR9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1pbnV0ZS1oYW5ke3RyYW5zZm9ybS1vcmlnaW46MnB4IDJweDttYXJnaW4tbGVmdDotMnB4O21hcmdpbi10b3A6LTJweDtib3JkZXItbGVmdDoycHggc29saWQgdHJhbnNwYXJlbnQ7Ym9yZGVyLXJpZ2h0OjJweCBzb2xpZCB0cmFuc3BhcmVudDtib3JkZXItdG9wLWxlZnQtcmFkaXVzOjJweDtib3JkZXItdG9wLXJpZ2h0LXJhZGl1czoycHg7Ym9yZGVyLXRvcDo0MHB4IHNvbGlkIF9zZWNvbmRhcnlfYWNjZW50fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1zZWNvbmQtaGFuZHt0cmFuc2Zvcm0tb3JpZ2luOjFweCAxcHg7bWFyZ2luLWxlZnQ6LTFweDttYXJnaW4tdG9wOi0xcHg7Ym9yZGVyLWxlZnQ6MXB4IHNvbGlkIHRyYW5zcGFyZW50O2JvcmRlci1yaWdodDoxcHggc29saWQgdHJhbnNwYXJlbnQ7Ym9yZGVyLXRvcC1sZWZ0LXJhZGl1czoxcHg7Ym9yZGVyLXRvcC1yaWdodC1yYWRpdXM6MXB4O2JvcmRlci10b3A6NTBweCBzb2xpZCBfc2Vjb25kYXJ5X2FjY2VudH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tdGltZS1kcmFnLWFybXt3aWR0aDoycHg7aGVpZ2h0OjcwcHg7cG9zaXRpb246YWJzb2x1dGU7bGVmdDo1MCU7dG9wOjUwJTttYXJnaW4tbGVmdDotMXB4O3RyYW5zZm9ybS1vcmlnaW46MXB4IDA7dHJhbnNmb3JtOnJvdGF0ZSg0NWRlZyk7dHJhbnNpdGlvbjouM3MgZWFzZSBhbGx9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXRpbWUtZHJhZy1hcm06YWZ0ZXIsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXRpbWUtZHJhZy1hcm06YmVmb3Jle2NvbnRlbnQ6Jyc7Ym9yZGVyOjRweCBzb2xpZCB0cmFuc3BhcmVudDtwb3NpdGlvbjphYnNvbHV0ZTtib3R0b206LTRweDtsZWZ0OjEycHg7Ym9yZGVyLWxlZnQtY29sb3I6X3NlY29uZGFyeV9hY2NlbnQ7dHJhbnNmb3JtLW9yaWdpbjotMTFweCA0cHh9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXRpbWUtZHJhZy1hcm06YWZ0ZXJ7dHJhbnNmb3JtOnJvdGF0ZSgxODBkZWcpfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS10aW1lLWRyYWd7ZGlzcGxheTpibG9jaztwb3NpdGlvbjphYnNvbHV0ZTt3aWR0aDo1MHB4O2hlaWdodDo1MHB4O3RvcDoxMDAlO21hcmdpbi10b3A6LTI1cHg7bWFyZ2luLWxlZnQ6LTI0cHg7Ym9yZGVyLXJhZGl1czoyNXB4fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS10aW1lLWRyYWc6YWZ0ZXJ7Y29udGVudDonJzt3aWR0aDoxMHB4O2hlaWdodDoxMHB4O3Bvc2l0aW9uOmFic29sdXRlO2xlZnQ6NTAlO3RvcDo1MCU7bWFyZ2luLWxlZnQ6LTdweDttYXJnaW4tdG9wOi03cHg7YmFja2dyb3VuZC1jb2xvcjpfc2Vjb25kYXJ5X2FjY2VudDtib3JkZXI6MnB4IHNvbGlkO2JvcmRlci1jb2xvcjpfc2Vjb25kYXJ5O2JveC1zaGFkb3c6MCAwIDAgMnB4IF9zZWNvbmRhcnlfYWNjZW50O2JvcmRlci1yYWRpdXM6MTBweH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tdGltZS1kcmFnLmRhdGl1bS1hY3RpdmU6YWZ0ZXJ7d2lkdGg6OHB4O2hlaWdodDo4cHg7Ym9yZGVyOjNweCBzb2xpZDtib3JkZXItY29sb3I6X3NlY29uZGFyeX1cIjsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
