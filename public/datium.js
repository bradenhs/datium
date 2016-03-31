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
        if (date.valueOf() < this.options.minDate.valueOf()) {
            date = new Date(this.options.minDate.valueOf());
        }
        if (date.valueOf() > this.options.maxDate.valueOf()) {
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
    OptionSanitizer.sanitizeIsSecondSelectable = function (isSecondSelectable, dflt) {
        if (dflt === void 0) { dflt = function (date) { return true; }; }
        return dflt;
    };
    OptionSanitizer.sanitizeIsMinuteSelectable = function (isMinuteSelectable, dflt) {
        if (dflt === void 0) { dflt = function (date) { return true; }; }
        return dflt;
    };
    OptionSanitizer.sanitizeIsHourSelectable = function (isHourSelectable, dflt) {
        if (dflt === void 0) { dflt = function (date) { return true; }; }
        return dflt;
    };
    OptionSanitizer.sanitizeIsDateSelectable = function (isDateSelectable, dflt) {
        if (dflt === void 0) { dflt = function (date) { return true; }; }
        return function (date) { return date.getDay() !== 0 && date.getDay() !== 6; };
    };
    OptionSanitizer.sanitizeIsMonthSelectable = function (isMonthSelectable, dflt) {
        if (dflt === void 0) { dflt = function (date) { return true; }; }
        return function (date) { return date.getMonth() % 2 === 0; };
    };
    OptionSanitizer.sanitizeIsYearSelectable = function (isYearSelectable, dflt) {
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
        var opts = {
            displayAs: OptionSanitizer.sanitizeDisplayAs(options['displayAs'], defaults.displayAs),
            minDate: OptionSanitizer.sanitizeMinDate(options['minDate'], defaults.minDate),
            maxDate: OptionSanitizer.sanitizeMaxDate(options['maxDate'], defaults.maxDate),
            defaultDate: OptionSanitizer.sanitizeDefaultDate(options['defaultDate'], defaults.defaultDate),
            theme: OptionSanitizer.sanitizeTheme(options['theme'], defaults.theme),
            militaryTime: OptionSanitizer.sanitizeMilitaryTime(options['militaryTime'], defaults.militaryTime),
            isSecondSelectable: OptionSanitizer.sanitizeIsSecondSelectable(options['isSecondSelectable'], defaults.isSecondSelectable),
            isMinuteSelectable: OptionSanitizer.sanitizeIsMinuteSelectable(options['isMinuteSelectable'], defaults.isMinuteSelectable),
            isHourSelectable: OptionSanitizer.sanitizeIsHourSelectable(options['isHourSelectable'], defaults.isHourSelectable),
            isDateSelectable: OptionSanitizer.sanitizeIsDateSelectable(options['isDateSelectable'], defaults.isDateSelectable),
            isMonthSelectable: OptionSanitizer.sanitizeIsMonthSelectable(options['isMonthSelectable'], defaults.isMonthSelectable),
            isYearSelectable: OptionSanitizer.sanitizeIsYearSelectable(options['isYearSelectable'], defaults.isYearSelectable)
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
        DatePart.prototype.setLast = function () {
            if (this.current === void 0 ||
                this.date === void 0 ||
                this.date.valueOf() !== this.current.valueOf()) {
                this.last = this.current;
                this.current = this.date;
            }
        };
        DatePart.prototype.getLastValue = function () {
            return this.last;
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
            } while (!this.options.isYearSelectable(this.date));
            this.setLast();
        };
        FourDigitYear.prototype.decrement = function () {
            do {
                this.date.setFullYear(this.date.getFullYear() - 1);
            } while (!this.options.isYearSelectable(this.date));
            this.setLast();
        };
        FourDigitYear.prototype.setValueFromPartial = function (partial) {
            return this.setValue(partial);
        };
        FourDigitYear.prototype.setValue = function (value) {
            if (typeof value === 'object') {
                this.date = new Date(value.valueOf());
                this.setLast();
                return true;
            }
            else if (typeof value === 'string' && this.getRegEx().test(value)) {
                this.date.setFullYear(parseInt(value, 10));
                this.setLast();
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
        function TwoDigitYear(options) {
            _super.call(this, options);
        }
        TwoDigitYear.prototype.getMaxBuffer = function () {
            return 2;
        };
        TwoDigitYear.prototype.setValue = function (value) {
            if (typeof value === 'object') {
                this.date = new Date(value.valueOf());
                this.setLast();
                return true;
            }
            else if (typeof value === 'string' && this.getRegEx().test(value)) {
                var base = Math.floor(_super.prototype.getValue.call(this).getFullYear() / 100) * 100;
                this.date.setFullYear(parseInt(value, 10) + base);
                this.setLast();
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
            } while (!this.options.isMonthSelectable(this.date));
            this.setLast();
        };
        LongMonthName.prototype.decrement = function () {
            do {
                var num = this.date.getMonth() - 1;
                if (num < 0)
                    num = 11;
                this.date.setMonth(num);
            } while (!this.options.isMonthSelectable(this.date));
            this.setLast();
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
                this.setLast();
                return true;
            }
            else if (typeof value === 'string' && this.getRegEx().test(value)) {
                var num = this.getMonths().indexOf(value);
                this.date.setMonth(num);
                while (this.date.getMonth() > num) {
                    this.date.setDate(this.date.getDate() - 1);
                }
                this.setLast();
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
        function ShortMonthName(options) {
            _super.call(this, options);
        }
        ShortMonthName.prototype.getMonths = function () {
            return _super.prototype.getShortMonths.call(this);
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
            if (typeof value === 'object') {
                this.date = new Date(value.valueOf());
                this.setLast();
                return true;
            }
            else if (typeof value === 'string' && this.getRegEx().test(value)) {
                this.date.setMonth(parseInt(value, 10) - 1);
                while (this.date.getMonth() > parseInt(value, 10) - 1) {
                    this.date.setDate(this.date.getDate() - 1);
                }
                this.setLast();
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
            } while (!this.options.isDateSelectable(this.date));
            this.setLast();
        };
        DateNumeral.prototype.decrement = function () {
            do {
                var num = this.date.getDate() - 1;
                if (num < 1)
                    num = this.daysInMonth(this.date);
                this.date.setDate(num);
            } while (!this.options.isDateSelectable(this.date));
            this.setLast();
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
                this.setLast();
                return true;
            }
            else if (typeof value === 'string' && this.getRegEx().test(value) && parseInt(value, 10) < this.daysInMonth(this.date)) {
                this.date.setDate(parseInt(value, 10));
                this.setLast();
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
            } while (!this.options.isDateSelectable(this.date));
            this.setLast();
        };
        LongDayName.prototype.decrement = function () {
            do {
                var num = this.date.getDay() - 1;
                if (num < 0)
                    num = 6;
                this.date.setDate(this.date.getDate() - this.date.getDay() + num);
            } while (!this.options.isDateSelectable(this.date));
            this.setLast();
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
                this.setLast();
                return true;
            }
            else if (typeof value === 'string' && this.getRegEx().test(value)) {
                var num = this.getDays().indexOf(value);
                this.date.setDate(this.date.getDate() - this.date.getDay() + num);
                this.setLast();
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
            } while (!this.options.isHourSelectable(this.date));
            this.setLast();
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
            } while (!this.options.isHourSelectable(this.date));
            this.setLast();
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
                this.setLast();
                return true;
            }
            else if (typeof value === 'string' && this.getRegEx().test(value)) {
                this.date.setHours(parseInt(value, 10));
                this.setLast();
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
            if (typeof value === 'object') {
                this.date = new Date(value.valueOf());
                this.setLast();
                return true;
            }
            else if (typeof value === 'string' && this.getRegEx().test(value)) {
                var num = parseInt(value, 10);
                if (this.date.getHours() < 12 && num === 12)
                    num = 0;
                if (this.date.getHours() > 11 && num !== 12)
                    num += 12;
                this.date.setHours(num);
                this.setLast();
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
            } while (!this.options.isMinuteSelectable(this.date));
            this.setLast();
        };
        PaddedMinute.prototype.decrement = function () {
            do {
                var num = this.date.getMinutes() - 1;
                if (num < 0)
                    num = 59;
                this.date.setMinutes(num);
            } while (!this.options.isMinuteSelectable(this.date));
            this.setLast();
        };
        PaddedMinute.prototype.setValueFromPartial = function (partial) {
            return this.setValue(this.pad(partial));
        };
        PaddedMinute.prototype.setValue = function (value) {
            if (typeof value === 'object') {
                this.date = new Date(value.valueOf());
                this.setLast();
                return true;
            }
            else if (typeof value === 'string' && this.getRegEx().test(value)) {
                this.date.setMinutes(parseInt(value, 10));
                this.setLast();
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
            } while (!this.options.isSecondSelectable(this.date));
            this.setLast();
        };
        PaddedSecond.prototype.decrement = function () {
            do {
                var num = this.date.getSeconds() - 1;
                if (num < 0)
                    num = 59;
                this.date.setSeconds(num);
            } while (!this.options.isSecondSelectable(this.date));
            this.setLast();
        };
        PaddedSecond.prototype.setValueFromPartial = function (partial) {
            return this.setValue(this.pad(partial));
        };
        PaddedSecond.prototype.setValue = function (value) {
            if (typeof value === 'object') {
                this.date = new Date(value.valueOf());
                this.setLast();
                return true;
            }
            else if (typeof value === 'string' && this.getRegEx().test(value)) {
                this.date.setSeconds(parseInt(value, 10));
                this.setLast();
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
            if (this.options.isHourSelectable(this.date)) {
                this.setLast();
            }
            else {
                this.decrement();
            }
        };
        UppercaseMeridiem.prototype.decrement = function () {
            var num = this.date.getHours() - 12;
            if (num < 0)
                num += 24;
            this.date.setHours(num);
            if (this.options.isHourSelectable(this.date)) {
                this.setLast();
            }
            else {
                this.increment();
            }
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
                this.setLast();
                return true;
            }
            else if (typeof value === 'string' && this.getRegEx().test(value)) {
                if (value.toLowerCase() === 'am' && this.date.getHours() > 11) {
                    this.date.setHours(this.date.getHours() - 12);
                }
                else if (value.toLowerCase() === 'pm' && this.date.getHours() < 12) {
                    this.date.setHours(this.date.getHours() + 12);
                }
                this.setLast();
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
        listen.blur(element, function () {
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
                this.blurDatePart(this.selectedDatePart);
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
            var lastSelected = this.selectedDatePart;
            this.selectedDatePart = datePart;
            this.blurDatePart(lastSelected);
        }
    };
    Input.prototype.blurDatePart = function (datePart) {
        /*
        if (datePart === void 0) return;
        let lastDate = datePart.getLastValue() || new Date();
        let newDate = datePart.getValue();
        let transformedDate = new Date(newDate.valueOf());
        switch(datePart.getLevel()) {
            case Level.YEAR:
                transformedDate = this.options.isYearSelectable(newDate, lastDate);
                break;
            case Level.MONTH:
                transformedDate = this.options.isMonthSelectable(newDate, lastDate);
                break;
            case Level.DATE:
                transformedDate = this.options.isDateSelectable(newDate, lastDate);
                break;
            case Level.HOUR:
                transformedDate = this.options.isHourSelectable(newDate, lastDate);
                break;
            case Level.MINUTE:
                transformedDate = this.options.isMinuteSelectable(newDate, lastDate);
                break;
            case Level.SECOND:
                transformedDate = this.options.isSecondSelectable(newDate, lastDate);
                break;
        }
        if (newDate.valueOf() !== transformedDate.valueOf()) {
            trigger.goto(this.element, {
                level: this.selectedDatePart.getLevel(),
                date: transformedDate
            });
        }
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
            var next = new Date(iterator.valueOf());
            next.setDate(next.getDate() + 1);
            var dateElement = document.createElement('datium-date-element');
            dateElement.innerHTML = iterator.getDate().toString();
            if (iterator.getMonth() === date.getMonth() &&
                next.valueOf() > this.options.minDate.valueOf() &&
                iterator.valueOf() < this.options.maxDate.valueOf() &&
                this.options.isYearSelectable(iterator) &&
                this.options.isMonthSelectable(iterator) &&
                this.options.isDateSelectable(iterator)) {
                dateElement.setAttribute('datium-data', iterator.toISOString());
            }
            this.picker.appendChild(dateElement);
            iterator = next;
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
        if (this.moved++ > 1) {
            trigger.updateBubble(this.element, {
                x: -70 * Math.sin(this.rotation) + 140,
                y: 70 * Math.cos(this.rotation) + 175,
                text: this.getBubbleText()
            });
        }
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
        var d = new Date(this.selectedDate.valueOf());
        d.setHours(hours);
        if (d.valueOf() < this.options.minDate.valueOf()) {
            hours = this.options.minDate.getHours();
        }
        else if (d.valueOf() > this.options.maxDate.valueOf()) {
            hours = this.options.maxDate.getHours();
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
            var start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours());
            var end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours() + 1);
            if (end.valueOf() > this.options.minDate.valueOf() &&
                start.valueOf() < this.options.maxDate.valueOf()) {
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
    MinutePicker.prototype.getBubbleText = function (minutes) {
        if (minutes === void 0) {
            minutes = this.rotationToTime(this.rotation);
        }
        var d = new Date(this.selectedDate.valueOf());
        d.setMinutes(minutes);
        if (d.valueOf() < this.options.minDate.valueOf()) {
            minutes = this.options.minDate.getMinutes();
        }
        else if (d.valueOf() > this.options.maxDate.valueOf()) {
            minutes = this.options.maxDate.getMinutes();
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
            var start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes());
            var end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes() + 1);
            if (end.valueOf() > this.options.minDate.valueOf() &&
                start.valueOf() < this.options.maxDate.valueOf()) {
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
            var next = new Date(iterator.valueOf());
            next.setMonth(next.getMonth() + 1);
            var monthElement = document.createElement('datium-month-element');
            monthElement.innerHTML = this.getShortMonths()[iterator.getMonth()];
            if (next.valueOf() > this.options.minDate.valueOf() &&
                iterator.valueOf() < this.options.maxDate.valueOf() &&
                this.options.isYearSelectable(iterator) &&
                this.options.isMonthSelectable(iterator)) {
                monthElement.setAttribute('datium-data', iterator.toISOString());
            }
            this.picker.appendChild(monthElement);
            iterator = next;
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
        var d = new Date(this.selectedDate.valueOf());
        d.setSeconds(seconds);
        if (d.valueOf() < this.options.minDate.valueOf()) {
            seconds = this.options.minDate.getSeconds();
        }
        else if (d.valueOf() > this.options.maxDate.valueOf()) {
            seconds = this.options.maxDate.getSeconds();
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
            var start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());
            var end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds() + 1);
            if (end.valueOf() > this.options.minDate.valueOf() &&
                start.valueOf() < this.options.maxDate.valueOf()) {
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
            var next = new Date(iterator.valueOf());
            next.setFullYear(next.getFullYear() + 1);
            var yearElement = document.createElement('datium-year-element');
            yearElement.innerHTML = iterator.getFullYear().toString();
            if (next.valueOf() > this.options.minDate.valueOf() &&
                iterator.valueOf() < this.options.maxDate.valueOf() &&
                this.options.isYearSelectable(iterator)) {
                yearElement.setAttribute('datium-data', iterator.toISOString());
            }
            this.picker.appendChild(yearElement);
            iterator = next;
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
var css = "datium-container._id datium-header,datium-container._id datium-picker-container{width:calc(100% - 14px);box-shadow:0 3px 6px rgba(0,0,0,.16),0 3px 6px rgba(0,0,0,.23);overflow:hidden}datium-container._id datium-bubble,datium-container._id datium-header,datium-container._id datium-picker-container{box-shadow:0 3px 6px rgba(0,0,0,.16),0 3px 6px rgba(0,0,0,.23)}datium-container._id datium-header-wrapper{overflow:hidden;position:absolute;left:-7px;right:-7px;top:-7px;height:87px;display:block;pointer-events:none}datium-container._id datium-header{position:relative;display:block;height:100px;background-color:_primary;border-top-left-radius:3px;border-top-right-radius:3px;z-index:1;margin:7px;pointer-events:auto}datium-container._id datium-span-label-container{position:absolute;left:40px;right:40px;top:0;bottom:0;display:block;overflow:hidden;transition:.2s ease all;transform-origin:40px 40px}datium-container._id datium-span-label{position:absolute;font-size:18pt;color:_primary_text;font-weight:700;transform-origin:0 0;white-space:nowrap;transition:all .2s ease;text-transform:uppercase}datium-container._id datium-span-label.datium-top{transform:translateY(17px) scale(.66);width:151%;opacity:.6}datium-container._id datium-span-label.datium-bottom{transform:translateY(36px) scale(1);width:100%;opacity:1}datium-container._id datium-span-label.datium-top.datium-hidden{transform:translateY(5px) scale(.4);opacity:0}datium-container._id datium-span-label.datium-bottom.datium-hidden{transform:translateY(78px) scale(1.2);opacity:1}datium-container._id datium-span-label:after{content:'';display:inline-block;position:absolute;margin-left:10px;margin-top:6px;height:17px;width:17px;opacity:0;transition:all .2s ease;background:url(data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22_primary_text%22%3E%3Cpath%20d%3D%22M17%2015l-2%202-5-5%202-2z%22%20fill-rule%3D%22evenodd%22%2F%3E%3Cpath%20d%3D%22M7%200a7%207%200%200%200-7%207%207%207%200%200%200%207%207%207%207%200%200%200%207-7%207%207%200%200%200-7-7zm0%202a5%205%200%200%201%205%205%205%205%200%200%201-5%205%205%205%200%200%201-5-5%205%205%200%200%201%205-5z%22%2F%3E%3Cpath%20d%3D%22M4%206h6v2H4z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E)}datium-container._id datium-bubble,datium-container._id datium-bubble.datium-bubble-visible{transition-property:transform,opacity;transition-timing-function:ease;transition-duration:.2s}datium-container._id datium-span-label.datium-top:after{opacity:1}datium-container._id datium-span-label datium-variable{color:_primary;font-size:14pt;padding:0 4px;margin:0 2px;top:-2px;position:relative}datium-container._id datium-span-label datium-variable:before{content:'';position:absolute;left:0;top:0;right:0;bottom:0;border-radius:5px;background-color:_primary_text;z-index:-1;opacity:.7}datium-container._id datium-span-label datium-lower{text-transform:lowercase}datium-container._id datium-next,datium-container._id datium-prev{position:absolute;width:40px;top:0;bottom:0;transform-origin:20px 52px}datium-container._id datium-next:after,datium-container._id datium-next:before,datium-container._id datium-prev:after,datium-container._id datium-prev:before{content:'';position:absolute;display:block;width:3px;height:8px;left:50%;background-color:_primary_text;top:48px}datium-container._id datium-next.datium-active,datium-container._id datium-prev.datium-active{transform:scale(.9);opacity:.9}datium-container._id datium-prev{left:0}datium-container._id datium-prev:after,datium-container._id datium-prev:before{margin-left:-3px}datium-container._id datium-next{right:0}datium-container._id datium-prev:before{transform:rotate(45deg) translateY(-2.6px)}datium-container._id datium-prev:after{transform:rotate(-45deg) translateY(2.6px)}datium-container._id datium-next:before{transform:rotate(45deg) translateY(2.6px)}datium-container._id datium-next:after{transform:rotate(-45deg) translateY(-2.6px)}datium-container._id{display:block;position:absolute;width:280px;font-family:Roboto,Arial;margin-top:2px;font-size:16px}datium-container._id,datium-container._id *{-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;-webkit-tap-highlight-color:transparent;cursor:default}datium-container._id datium-bubble{position:absolute;width:50px;line-height:26px;text-align:center;font-size:14px;background-color:_secondary_accent;font-weight:700;border-radius:3px;margin-left:-25px;margin-top:-32px;color:_secondary;z-index:1;transform-origin:30px 36px;transition-delay:0;transform:scale(.5);opacity:0}datium-container._id datium-bubble:after{content:'';position:absolute;display:block;width:10px;height:10px;transform:rotate(45deg);background:linear-gradient(135deg,rgba(0,0,0,0) 50%,_secondary_accent 50%);left:50%;top:20px;margin-left:-5px}datium-container._id datium-bubble.datium-bubble-visible{transform:scale(1);opacity:1;transition-delay:.2s}datium-container._id datium-picker-container-wrapper{overflow:hidden;position:absolute;left:-7px;right:-7px;top:80px;height:270px;display:block;pointer-events:none}datium-container._id datium-picker-container{position:relative;height:260px;background-color:_secondary;display:block;margin:0 7px 7px;padding-top:20px;transform:translateY(-270px);pointer-events:auto;border-bottom-right-radius:3px;border-bottom-left-radius:3px;transition:all ease .4s;transition-delay:.1s}datium-container._id datium-picker{position:absolute;left:0;right:0;bottom:0;color:_secondary_text;transition:all ease .4s}datium-container._id datium-picker.datium-picker-left{transform:translateX(-100%) scale(1);pointer-events:none;transition-delay:0s}datium-container._id datium-picker.datium-picker-right{transform:translateX(100%) scale(1);pointer-events:none;transition-delay:0s}datium-container._id datium-picker.datium-picker-out{transform:translateX(0) scale(1.4);opacity:0;pointer-events:none;transition-delay:0s}datium-container._id datium-picker.datium-picker-in{transform:translateX(0) scale(.6);opacity:0;pointer-events:none;transition-delay:0s}datium-container._id datium-month-element,datium-container._id datium-year-element{display:inline-block;width:25%;line-height:60px;text-align:center;position:relative;transition:.2s ease all}datium-container._id datium-month-element.datium-selected:after,datium-container._id datium-year-element.datium-selected:after{content:'';position:absolute;left:20px;right:20px;top:50%;margin-top:11px;height:2px;display:block;background-color:_secondary_accent}datium-container._id datium-month-element.datium-active,datium-container._id datium-year-element.datium-active{transform:scale(.9);transition:none}datium-container._id datium-month-element:not([datium-data]),datium-container._id datium-year-element:not([datium-data]){opacity:.4;pointer-events:none}datium-container._id datium-month-element.datium-selected:after{left:25px;right:25px}datium-container._id datium-date-header{display:inline-block;width:40px;line-height:28px;opacity:.4;font-weight:700;text-align:center}datium-container._id datium-date-element{display:inline-block;width:40px;line-height:36px;text-align:center;position:relative;transition:.2s ease all}datium-container._id datium-date-element.datium-selected:after{content:'';position:absolute;left:12px;right:12px;top:50%;margin-top:10px;height:2px;display:block;background-color:_secondary_accent}datium-container._id datium-date-element.datium-active{transform:scale(.9);transition:none}datium-container._id datium-date-element:not([datium-data]){opacity:.4;pointer-events:none}datium-container._id datium-picker.datium-hour-picker,datium-container._id datium-picker.datium-minute-picker,datium-container._id datium-picker.datium-second-picker{height:240px}datium-container._id datium-picker.datium-hour-picker:before,datium-container._id datium-picker.datium-minute-picker:before,datium-container._id datium-picker.datium-second-picker:before{content:'';width:140px;height:140px;position:absolute;border:1px solid;left:50%;top:50%;margin-left:-71px;margin-top:-71px;border-radius:70px;opacity:.5}datium-container._id datium-picker.datium-hour-picker:after,datium-container._id datium-picker.datium-minute-picker:after,datium-container._id datium-picker.datium-second-picker:after{content:'';width:4px;height:4px;margin-left:-4px;margin-top:-4px;top:50%;left:50%;border-radius:4px;position:absolute;border:2px solid;border-color:_secondary_accent;background-color:_secondary;box-shadow:0 0 0 2px _secondary}datium-container._id datium-tick{position:absolute;left:50%;top:50%;width:2px;height:70px;margin-left:-1px;transform-origin:1px 0}datium-container._id datium-tick:after{content:'';position:absolute;width:2px;height:6px;background-color:_secondary_text;bottom:-4px;opacity:.5}datium-container._id datium-meridiem-switcher{position:absolute;left:50%;margin-left:-30px;top:50%;margin-top:15px;display:block;width:60px;height:40px}datium-container._id datium-meridiem-switcher:after,datium-container._id datium-meridiem-switcher:before{position:absolute;width:30px;top:0;display:block;line-height:40px;font-weight:700;text-align:center;font-size:14px;transform:scale(.9);opacity:.9;color:_secondary_text;transition:all ease .2s}datium-container._id datium-meridiem-switcher.datium-military-time:before{content:'-12'}datium-container._id datium-meridiem-switcher.datium-military-time:after{content:'+12'}datium-container._id datium-meridiem-switcher:before{content:'AM';left:0}datium-container._id datium-meridiem-switcher:after{content:'PM';right:0}datium-container._id datium-meridiem-switcher.datium-am-selected:before,datium-container._id datium-meridiem-switcher.datium-pm-selected:after{transform:scale(1);color:_secondary_accent;opacity:1}datium-container._id datium-meridiem-switcher.datium-active:after,datium-container._id datium-meridiem-switcher.datium-active:before{transition:none}datium-container._id datium-meridiem-switcher.datium-active.datium-am-selected:before{transform:scale(.9)}datium-container._id datium-meridiem-switcher.datium-active.datium-am-selected:after,datium-container._id datium-meridiem-switcher.datium-active.datium-pm-selected:before{transform:scale(.8)}datium-container._id datium-meridiem-switcher.datium-active.datium-pm-selected:after{transform:scale(.9)}datium-container._id datium-tick-label-container{position:absolute;bottom:-50px;left:-24px;display:block;height:50px;width:50px}datium-container._id datium-tick-label{position:absolute;left:0;top:0;display:block;width:100%;line-height:50px;border-radius:25px;text-align:center;font-size:14px;transition:.2s ease all}datium-container._id datium-tick-label.datium-active{transform:scale(.9);transition:none}datium-container._id datium-tick-label.datium-inactive{opacity:.4;pointer-events:none}datium-container._id datium-picker.datium-hour-picker.datium-dragging datium-hour-hand,datium-container._id datium-picker.datium-hour-picker.datium-dragging datium-minute-hand,datium-container._id datium-picker.datium-hour-picker.datium-dragging datium-second-hand,datium-container._id datium-picker.datium-hour-picker.datium-dragging datium-time-drag-arm,datium-container._id datium-picker.datium-minute-picker.datium-dragging datium-hour-hand,datium-container._id datium-picker.datium-minute-picker.datium-dragging datium-minute-hand,datium-container._id datium-picker.datium-minute-picker.datium-dragging datium-second-hand,datium-container._id datium-picker.datium-minute-picker.datium-dragging datium-time-drag-arm,datium-container._id datium-picker.datium-second-picker.datium-dragging datium-hour-hand,datium-container._id datium-picker.datium-second-picker.datium-dragging datium-minute-hand,datium-container._id datium-picker.datium-second-picker.datium-dragging datium-second-hand,datium-container._id datium-picker.datium-second-picker.datium-dragging datium-time-drag-arm{transition:none}datium-container._id datium-hour-hand,datium-container._id datium-minute-hand,datium-container._id datium-second-hand{position:absolute;display:block;width:0;height:0;left:50%;top:50%;transform-origin:3px 3px;margin-left:-3px;margin-top:-3px;border-left:3px solid transparent;border-right:3px solid transparent;border-top-left-radius:3px;border-top-right-radius:3px;transition:.3s ease all}datium-container._id datium-picker.datium-minute-picker datium-hour-hand,datium-container._id datium-picker.datium-second-picker datium-hour-hand,datium-container._id datium-picker.datium-second-picker datium-minute-hand{border-top-color:_secondary_text;opacity:.5}datium-container._id datium-hour-hand{border-top:30px solid _secondary_accent}datium-container._id datium-minute-hand{transform-origin:2px 2px;margin-left:-2px;margin-top:-2px;border-left:2px solid transparent;border-right:2px solid transparent;border-top-left-radius:2px;border-top-right-radius:2px;border-top:40px solid _secondary_accent}datium-container._id datium-second-hand{transform-origin:1px 1px;margin-left:-1px;margin-top:-1px;border-left:1px solid transparent;border-right:1px solid transparent;border-top-left-radius:1px;border-top-right-radius:1px;border-top:50px solid _secondary_accent}datium-container._id datium-time-drag-arm{width:2px;height:70px;position:absolute;left:50%;top:50%;margin-left:-1px;transform-origin:1px 0;transform:rotate(45deg);transition:.3s ease all}datium-container._id datium-time-drag-arm:after,datium-container._id datium-time-drag-arm:before{content:'';border:4px solid transparent;position:absolute;bottom:-4px;left:12px;border-left-color:_secondary_accent;transform-origin:-11px 4px}datium-container._id datium-time-drag-arm:after{transform:rotate(180deg)}datium-container._id datium-time-drag{display:block;position:absolute;width:50px;height:50px;top:100%;margin-top:-25px;margin-left:-24px;border-radius:25px}datium-container._id datium-time-drag:after{content:'';width:10px;height:10px;position:absolute;left:50%;top:50%;margin-left:-7px;margin-top:-7px;background-color:_secondary_accent;border:2px solid;border-color:_secondary;box-shadow:0 0 0 2px _secondary_accent;border-radius:10px}datium-container._id datium-time-drag.datium-active:after{width:8px;height:8px;border:3px solid;border-color:_secondary}";
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRhdGl1bS50cyIsIkRhdGl1bUludGVybmFscy50cyIsIk9wdGlvblNhbml0aXplci50cyIsImNvbW1vbi9Db21tb24udHMiLCJjb21tb24vQ3VzdG9tRXZlbnRQb2x5ZmlsbC50cyIsImNvbW1vbi9FdmVudHMudHMiLCJpbnB1dC9EYXRlUGFydHMudHMiLCJpbnB1dC9JbnB1dC50cyIsImlucHV0L0tleWJvYXJkRXZlbnRIYW5kbGVyLnRzIiwiaW5wdXQvTW91c2VFdmVudEhhbmRsZXIudHMiLCJpbnB1dC9QYXJzZXIudHMiLCJpbnB1dC9QYXN0ZUV2ZW50SGFuZGxlci50cyIsInBpY2tlci9IZWFkZXIudHMiLCJwaWNrZXIvUGlja2VyTWFuYWdlci50cyIsInBpY2tlci9odG1sL2hlYWRlci50cyIsInBpY2tlci9waWNrZXJzL1BpY2tlci50cyIsInBpY2tlci9waWNrZXJzL0RhdGVQaWNrZXIudHMiLCJwaWNrZXIvcGlja2Vycy9UaW1lUGlja2VyLnRzIiwicGlja2VyL3BpY2tlcnMvSG91clBpY2tlci50cyIsInBpY2tlci9waWNrZXJzL01pbnV0ZVBpY2tlci50cyIsInBpY2tlci9waWNrZXJzL01vbnRoUGlja2VyLnRzIiwicGlja2VyL3BpY2tlcnMvU2Vjb25kUGlja2VyLnRzIiwicGlja2VyL3BpY2tlcnMvWWVhclBpY2tlci50cyIsInBpY2tlci9zdHlsZXMvY3NzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQU0sTUFBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHO0lBRXRCLGdCQUFZLE9BQXdCLEVBQUUsT0FBZ0I7UUFDbEQsSUFBSSxTQUFTLEdBQUcsSUFBSSxlQUFlLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxhQUFhLEdBQUcsVUFBQyxPQUFnQixJQUFLLE9BQUEsU0FBUyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBaEMsQ0FBZ0MsQ0FBQztJQUNoRixDQUFDO0lBQ0wsYUFBQztB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LElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUVyRCxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLGdCQUFnQixDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDaEYsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDM0MsSUFBSSxFQUFFLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QixJQUFJLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7WUFDcEQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxLQUFLLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BELEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDeEMsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDM0MsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRU0sOEJBQVMsR0FBaEI7UUFDSSxNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUVNLDZCQUFRLEdBQWY7UUFDSSxNQUFNLENBQUMsWUFBVSxDQUFDO0lBQ3RCLENBQUM7SUFDTCxpQkFBQztBQUFELENBekZBLEFBeUZDLENBekZ3QixNQUFNLEdBeUY5QjtBQzNGRCxJQUFJLEdBQUcsR0FBQyxxNGJBQXE0YixDQUFDIiwiZmlsZSI6ImRhdGl1bS5qcyIsInNvdXJjZXNDb250ZW50IjpbIig8YW55PndpbmRvdylbJ0RhdGl1bSddID0gY2xhc3MgRGF0aXVtIHtcclxuICAgIHB1YmxpYyB1cGRhdGVPcHRpb25zOihvcHRpb25zOklPcHRpb25zKSA9PiB2b2lkO1xyXG4gICAgY29uc3RydWN0b3IoZWxlbWVudDpIVE1MSW5wdXRFbGVtZW50LCBvcHRpb25zOklPcHRpb25zKSB7XHJcbiAgICAgICAgbGV0IGludGVybmFscyA9IG5ldyBEYXRpdW1JbnRlcm5hbHMoZWxlbWVudCwgb3B0aW9ucyk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVPcHRpb25zID0gKG9wdGlvbnM6SU9wdGlvbnMpID0+IGludGVybmFscy51cGRhdGVPcHRpb25zKG9wdGlvbnMpO1xyXG4gICAgfVxyXG59IiwiY29uc3QgZW51bSBMZXZlbCB7XHJcbiAgICBZRUFSLCBNT05USCwgREFURSwgSE9VUixcclxuICAgIE1JTlVURSwgU0VDT05ELCBOT05FXHJcbn1cclxuXHJcbmNsYXNzIERhdGl1bUludGVybmFscyB7XHJcbiAgICBwcml2YXRlIG9wdGlvbnM6SU9wdGlvbnMgPSA8YW55Pnt9O1xyXG4gICAgXHJcbiAgICBwcml2YXRlIGlucHV0OklucHV0O1xyXG4gICAgcHJpdmF0ZSBwaWNrZXJNYW5hZ2VyOlBpY2tlck1hbmFnZXI7XHJcbiAgICBcclxuICAgIHByaXZhdGUgbGV2ZWxzOkxldmVsW107XHJcbiAgICBwcml2YXRlIGRhdGU6RGF0ZTtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBlbGVtZW50OkhUTUxJbnB1dEVsZW1lbnQsIG9wdGlvbnM6SU9wdGlvbnMpIHtcclxuICAgICAgICBpZiAoZWxlbWVudCA9PT0gdm9pZCAwKSB0aHJvdyAnZWxlbWVudCBpcyByZXF1aXJlZCc7XHJcbiAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3NwZWxsY2hlY2snLCAnZmFsc2UnKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmlucHV0ID0gbmV3IElucHV0KGVsZW1lbnQpO1xyXG4gICAgICAgIHRoaXMucGlja2VyTWFuYWdlciA9IG5ldyBQaWNrZXJNYW5hZ2VyKGVsZW1lbnQpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMudXBkYXRlT3B0aW9ucyhvcHRpb25zKTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4uZ290byhlbGVtZW50LCAoZSkgPT4gdGhpcy5nb3RvKGUuZGF0ZSwgZS5sZXZlbCwgZS51cGRhdGUpKTtcclxuICAgICAgICBsaXN0ZW4uem9vbU91dChlbGVtZW50LCAoZSkgPT4gdGhpcy56b29tT3V0KGUuZGF0ZSwgZS5jdXJyZW50TGV2ZWwsIGUudXBkYXRlKSk7XHJcbiAgICAgICAgbGlzdGVuLnpvb21JbihlbGVtZW50LCAoZSkgPT4gdGhpcy56b29tSW4oZS5kYXRlLCBlLmN1cnJlbnRMZXZlbCwgZS51cGRhdGUpKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmdvdG8odGhpcy5vcHRpb25zWydkZWZhdWx0RGF0ZSddLCBMZXZlbC5OT05FLCB0cnVlKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHpvb21PdXQoZGF0ZTpEYXRlLCBjdXJyZW50TGV2ZWw6TGV2ZWwsIHVwZGF0ZTpib29sZWFuID0gdHJ1ZSkge1xyXG4gICAgICAgIGxldCBuZXdMZXZlbDpMZXZlbCA9IHRoaXMubGV2ZWxzW3RoaXMubGV2ZWxzLmluZGV4T2YoY3VycmVudExldmVsKSAtIDFdOyBcclxuICAgICAgICBpZiAobmV3TGV2ZWwgPT09IHZvaWQgMCkgcmV0dXJuO1xyXG4gICAgICAgIHRyaWdnZXIuZ290byh0aGlzLmVsZW1lbnQsIHtcclxuICAgICAgICAgICBkYXRlOiBkYXRlLFxyXG4gICAgICAgICAgIGxldmVsOiBuZXdMZXZlbCxcclxuICAgICAgICAgICB1cGRhdGU6IHVwZGF0ZSBcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHpvb21JbihkYXRlOkRhdGUsIGN1cnJlbnRMZXZlbDpMZXZlbCwgdXBkYXRlOmJvb2xlYW4gPSB0cnVlKSB7XHJcbiAgICAgICAgbGV0IG5ld0xldmVsOkxldmVsID0gdGhpcy5sZXZlbHNbdGhpcy5sZXZlbHMuaW5kZXhPZihjdXJyZW50TGV2ZWwpICsgMV07XHJcbiAgICAgICAgaWYgKG5ld0xldmVsID09PSB2b2lkIDApIG5ld0xldmVsID0gY3VycmVudExldmVsO1xyXG4gICAgICAgIHRyaWdnZXIuZ290byh0aGlzLmVsZW1lbnQsIHtcclxuICAgICAgICAgICBkYXRlOiBkYXRlLFxyXG4gICAgICAgICAgIGxldmVsOiBuZXdMZXZlbCxcclxuICAgICAgICAgICB1cGRhdGU6IHVwZGF0ZSBcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdvdG8oZGF0ZTpEYXRlLCBsZXZlbDpMZXZlbCwgdXBkYXRlOmJvb2xlYW4gPSB0cnVlKSB7XHJcbiAgICAgICAgaWYgKGRhdGUgPT09IHZvaWQgMCkgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKGRhdGUudmFsdWVPZigpIDwgdGhpcy5vcHRpb25zLm1pbkRhdGUudmFsdWVPZigpKSB7XHJcbiAgICAgICAgICAgIGRhdGUgPSBuZXcgRGF0ZSh0aGlzLm9wdGlvbnMubWluRGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZiAoZGF0ZS52YWx1ZU9mKCkgPiB0aGlzLm9wdGlvbnMubWF4RGF0ZS52YWx1ZU9mKCkpIHtcclxuICAgICAgICAgICAgZGF0ZSA9IG5ldyBEYXRlKHRoaXMub3B0aW9ucy5tYXhEYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZGF0ZSA9IGRhdGU7XHJcbiAgICAgICAgdHJpZ2dlci52aWV3Y2hhbmdlZCh0aGlzLmVsZW1lbnQsIHtcclxuICAgICAgICAgICAgZGF0ZTogZGF0ZSxcclxuICAgICAgICAgICAgbGV2ZWw6IGxldmVsLFxyXG4gICAgICAgICAgICB1cGRhdGU6IHVwZGF0ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdXBkYXRlT3B0aW9ucyhuZXdPcHRpb25zOklPcHRpb25zID0gPGFueT57fSkge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZShuZXdPcHRpb25zLCB0aGlzLm9wdGlvbnMpOyAgICAgICAgXHJcbiAgICAgICAgdGhpcy5pbnB1dC51cGRhdGVPcHRpb25zKHRoaXMub3B0aW9ucyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5sZXZlbHMgPSB0aGlzLmlucHV0LmdldExldmVscygpLnNsaWNlKCk7XHJcbiAgICAgICAgdGhpcy5sZXZlbHMuc29ydCgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLnBpY2tlck1hbmFnZXIuY3VycmVudFBpY2tlciAhPT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgIGxldCBjdXJMZXZlbCA9IHRoaXMucGlja2VyTWFuYWdlci5jdXJyZW50UGlja2VyLmdldExldmVsKCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAodGhpcy5sZXZlbHMuaW5kZXhPZihjdXJMZXZlbCkgPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIHRyaWdnZXIuZ290byh0aGlzLmVsZW1lbnQsIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRlOiB0aGlzLmRhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgbGV2ZWw6IHRoaXMubGV2ZWxzWzBdXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMucGlja2VyTWFuYWdlci51cGRhdGVPcHRpb25zKHRoaXMub3B0aW9ucyk7XHJcbiAgICB9XHJcbn0iLCJmdW5jdGlvbiBPcHRpb25FeGNlcHRpb24obXNnOnN0cmluZykge1xyXG4gICAgcmV0dXJuIGBbRGF0aXVtIE9wdGlvbiBFeGNlcHRpb25dXFxuICAke21zZ31cXG4gIFNlZSBodHRwOi8vZGF0aXVtLmlvL2RvY3VtZW50YXRpb24gZm9yIGRvY3VtZW50YXRpb24uYDtcclxufVxyXG5cclxuY2xhc3MgT3B0aW9uU2FuaXRpemVyIHtcclxuICAgIFxyXG4gICAgc3RhdGljIGRmbHREYXRlOkRhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgXHJcbiAgICBzdGF0aWMgc2FuaXRpemVEaXNwbGF5QXMoZGlzcGxheUFzOmFueSwgZGZsdDpzdHJpbmcgPSAnaDptbWEgTU1NIEQsIFlZWVknKSB7XHJcbiAgICAgICAgaWYgKGRpc3BsYXlBcyA9PT0gdm9pZCAwKSByZXR1cm4gZGZsdDtcclxuICAgICAgICBpZiAodHlwZW9mIGRpc3BsYXlBcyAhPT0gJ3N0cmluZycpIHRocm93IE9wdGlvbkV4Y2VwdGlvbignVGhlIFwiZGlzcGxheUFzXCIgb3B0aW9uIG11c3QgYmUgYSBzdHJpbmcnKTtcclxuICAgICAgICByZXR1cm4gZGlzcGxheUFzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdGF0aWMgc2FuaXRpemVNaW5EYXRlKG1pbkRhdGU6YW55LCBkZmx0OkRhdGUgPSBuZXcgRGF0ZSgtODY0MDAwMDAwMDAwMDAwMCkpIHtcclxuICAgICAgICBpZiAobWluRGF0ZSA9PT0gdm9pZCAwKSByZXR1cm4gZGZsdDtcclxuICAgICAgICByZXR1cm4gbmV3IERhdGUobWluRGF0ZSk7IC8vVE9ETyBmaWd1cmUgdGhpcyBvdXQgeWVzXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN0YXRpYyBzYW5pdGl6ZU1heERhdGUobWF4RGF0ZTphbnksIGRmbHQ6RGF0ZSA9IG5ldyBEYXRlKDg2NDAwMDAwMDAwMDAwMDApKSB7XHJcbiAgICAgICAgaWYgKG1heERhdGUgPT09IHZvaWQgMCkgcmV0dXJuIGRmbHQ7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKG1heERhdGUpOyAvL1RPRE8gZmlndXJlIHRoaXMgb3V0IFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdGF0aWMgc2FuaXRpemVEZWZhdWx0RGF0ZShkZWZhdWx0RGF0ZTphbnksIGRmbHQ6RGF0ZSA9IHRoaXMuZGZsdERhdGUpIHtcclxuICAgICAgICBpZiAoZGVmYXVsdERhdGUgPT09IHZvaWQgMCkgcmV0dXJuIGRmbHQ7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKGRlZmF1bHREYXRlKTsgLy9UT0RPIGZpZ3VyZSB0aGlzIG91dFxyXG4gICAgfVxyXG4gICAgICAgIFxyXG4gICAgc3RhdGljIHNhbml0aXplQ29sb3IoY29sb3I6YW55KSB7XHJcbiAgICAgICAgbGV0IHRocmVlSGV4ID0gJ1xcXFxzKiNbQS1GYS1mMC05XXszfVxcXFxzKic7XHJcbiAgICAgICAgbGV0IHNpeEhleCA9ICdcXFxccyojW0EtRmEtZjAtOV17Nn1cXFxccyonO1xyXG4gICAgICAgIGxldCByZ2IgPSAnXFxcXHMqcmdiXFxcXChcXFxccypbMC05XXsxLDN9XFxcXHMqLFxcXFxzKlswLTldezEsM31cXFxccyosXFxcXHMqWzAtOV17MSwzfVxcXFxzKlxcXFwpXFxcXHMqJztcclxuICAgICAgICBsZXQgcmdiYSA9ICdcXFxccypyZ2JhXFxcXChcXFxccypbMC05XXsxLDN9XFxcXHMqLFxcXFxzKlswLTldezEsM31cXFxccyosXFxcXHMqWzAtOV17MSwzfVxcXFxzKlxcXFwsXFxcXHMqWzAtOV0qXFxcXC5bMC05XStcXFxccypcXFxcKVxcXFxzKic7XHJcbiAgICAgICAgbGV0IHNhbml0aXplQ29sb3JSZWdleCA9IG5ldyBSZWdFeHAoYF4oKCR7dGhyZWVIZXh9KXwoJHtzaXhIZXh9KXwoJHtyZ2J9KXwoJHtyZ2JhfSkpJGApO1xyXG5cclxuICAgICAgICBpZiAoY29sb3IgPT09IHZvaWQgMCkgdGhyb3cgT3B0aW9uRXhjZXB0aW9uKFwiQWxsIHRoZW1lIGNvbG9ycyAocHJpbWFyeSwgcHJpbWFyeV90ZXh0LCBzZWNvbmRhcnksIHNlY29uZGFyeV90ZXh0LCBzZWNvbmRhcnlfYWNjZW50KSBtdXN0IGJlIGRlZmluZWRcIik7XHJcbiAgICAgICAgaWYgKCFzYW5pdGl6ZUNvbG9yUmVnZXgudGVzdChjb2xvcikpIHRocm93IE9wdGlvbkV4Y2VwdGlvbihcIkFsbCB0aGVtZSBjb2xvcnMgbXVzdCBiZSB2YWxpZCByZ2IsIHJnYmEsIG9yIGhleCBjb2RlXCIpO1xyXG4gICAgICAgIHJldHVybiA8c3RyaW5nPmNvbG9yO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdGF0aWMgc2FuaXRpemVUaGVtZSh0aGVtZTphbnksIGRmbHQ6YW55ID0gXCJtYXRlcmlhbFwiKTpJVGhlbWUge1xyXG4gICAgICAgIGlmICh0aGVtZSA9PT0gdm9pZCAwKSByZXR1cm4gT3B0aW9uU2FuaXRpemVyLnNhbml0aXplVGhlbWUoZGZsdCwgdm9pZCAwKTtcclxuICAgICAgICBpZiAodHlwZW9mIHRoZW1lID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICBzd2l0Y2godGhlbWUpIHtcclxuICAgICAgICAgICAgY2FzZSAnbGlnaHQnOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDxJVGhlbWU+e1xyXG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnk6ICcjZWVlJyxcclxuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5X3RleHQ6ICcjNjY2JyxcclxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnk6ICcjZmZmJyxcclxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnlfdGV4dDogJyM2NjYnLFxyXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeV9hY2NlbnQ6ICcjNjY2J1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlICdkYXJrJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiA8SVRoZW1lPntcclxuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5OiAnIzQ0NCcsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeV90ZXh0OiAnI2VlZScsXHJcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5OiAnIzMzMycsXHJcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5X3RleHQ6ICcjZWVlJyxcclxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnlfYWNjZW50OiAnI2ZmZidcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSAnbWF0ZXJpYWwnOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDxJVGhlbWU+e1xyXG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnk6ICcjMDE5NTg3JyxcclxuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5X3RleHQ6ICcjZmZmJyxcclxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnk6ICcjZmZmJyxcclxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnlfdGV4dDogJyM4ODgnLFxyXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeV9hY2NlbnQ6ICcjMDE5NTg3J1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgdGhyb3cgXCJOYW1lIG9mIHRoZW1lIG5vdCB2YWxpZC5cIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoZW1lID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICByZXR1cm4gPElUaGVtZT4ge1xyXG4gICAgICAgICAgICAgICAgcHJpbWFyeTogT3B0aW9uU2FuaXRpemVyLnNhbml0aXplQ29sb3IodGhlbWVbJ3ByaW1hcnknXSksXHJcbiAgICAgICAgICAgICAgICBzZWNvbmRhcnk6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZUNvbG9yKHRoZW1lWydzZWNvbmRhcnknXSksXHJcbiAgICAgICAgICAgICAgICBwcmltYXJ5X3RleHQ6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZUNvbG9yKHRoZW1lWydwcmltYXJ5X3RleHQnXSksXHJcbiAgICAgICAgICAgICAgICBzZWNvbmRhcnlfdGV4dDogT3B0aW9uU2FuaXRpemVyLnNhbml0aXplQ29sb3IodGhlbWVbJ3NlY29uZGFyeV90ZXh0J10pLFxyXG4gICAgICAgICAgICAgICAgc2Vjb25kYXJ5X2FjY2VudDogT3B0aW9uU2FuaXRpemVyLnNhbml0aXplQ29sb3IodGhlbWVbJ3NlY29uZGFyeV9hY2NlbnQnXSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IE9wdGlvbkV4Y2VwdGlvbignVGhlIFwidGhlbWVcIiBvcHRpb24gbXVzdCBiZSBvYmplY3Qgb3Igc3RyaW5nJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdGF0aWMgc2FuaXRpemVJc1NlY29uZFNlbGVjdGFibGUoaXNTZWNvbmRTZWxlY3RhYmxlOmFueSwgZGZsdDphbnkgPSAoZGF0ZTpEYXRlKSA9PiB0cnVlKSB7XHJcbiAgICAgICAgcmV0dXJuIGRmbHQ7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN0YXRpYyBzYW5pdGl6ZUlzTWludXRlU2VsZWN0YWJsZShpc01pbnV0ZVNlbGVjdGFibGU6YW55LCBkZmx0OmFueSA9IChkYXRlOkRhdGUpID0+IHRydWUpIHtcclxuICAgICAgICByZXR1cm4gZGZsdDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgc3RhdGljIHNhbml0aXplSXNIb3VyU2VsZWN0YWJsZShpc0hvdXJTZWxlY3RhYmxlOmFueSwgZGZsdDphbnkgPSAoZGF0ZTpEYXRlKSA9PiB0cnVlKSB7XHJcbiAgICAgICAgcmV0dXJuIGRmbHQ7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN0YXRpYyBzYW5pdGl6ZUlzRGF0ZVNlbGVjdGFibGUoaXNEYXRlU2VsZWN0YWJsZTphbnksIGRmbHQ6YW55ID0gKGRhdGU6RGF0ZSkgPT4gdHJ1ZSkge1xyXG4gICAgICAgIHJldHVybiAoZGF0ZTpEYXRlKSA9PiBkYXRlLmdldERheSgpICE9PSAwICYmIGRhdGUuZ2V0RGF5KCkgIT09IDY7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN0YXRpYyBzYW5pdGl6ZUlzTW9udGhTZWxlY3RhYmxlKGlzTW9udGhTZWxlY3RhYmxlOmFueSwgZGZsdDphbnkgPSAoZGF0ZTpEYXRlKSA9PiB0cnVlKSB7XHJcbiAgICAgICAgcmV0dXJuIChkYXRlOkRhdGUpID0+IGRhdGUuZ2V0TW9udGgoKSAlIDIgPT09IDA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN0YXRpYyBzYW5pdGl6ZUlzWWVhclNlbGVjdGFibGUoaXNZZWFyU2VsZWN0YWJsZTphbnksIGRmbHQ6YW55ID0gKGRhdGU6RGF0ZSkgPT4gdHJ1ZSkge1xyXG4gICAgICAgIHJldHVybiBkZmx0O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdGF0aWMgc2FuaXRpemVNaWxpdGFyeVRpbWUobWlsaXRhcnlUaW1lOmFueSwgZGZsdDpib29sZWFuID0gZmFsc2UpIHtcclxuICAgICAgICBpZiAobWlsaXRhcnlUaW1lID09PSB2b2lkIDApIHJldHVybiBkZmx0O1xyXG4gICAgICAgIGlmICh0eXBlb2YgbWlsaXRhcnlUaW1lICE9PSAnYm9vbGVhbicpIHtcclxuICAgICAgICAgICAgdGhyb3cgT3B0aW9uRXhjZXB0aW9uKCdUaGUgXCJtaWxpdGFyeVRpbWVcIiBvcHRpb24gbXVzdCBiZSBhIGJvb2xlYW4nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIDxib29sZWFuPm1pbGl0YXJ5VGltZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgc3RhdGljIHNhbml0aXplKG9wdGlvbnM6SU9wdGlvbnMsIGRlZmF1bHRzOklPcHRpb25zKSB7XHJcbiAgICAgICAgbGV0IG9wdHM6SU9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIGRpc3BsYXlBczogT3B0aW9uU2FuaXRpemVyLnNhbml0aXplRGlzcGxheUFzKG9wdGlvbnNbJ2Rpc3BsYXlBcyddLCBkZWZhdWx0cy5kaXNwbGF5QXMpLFxyXG4gICAgICAgICAgICBtaW5EYXRlOiBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVNaW5EYXRlKG9wdGlvbnNbJ21pbkRhdGUnXSwgZGVmYXVsdHMubWluRGF0ZSksXHJcbiAgICAgICAgICAgIG1heERhdGU6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZU1heERhdGUob3B0aW9uc1snbWF4RGF0ZSddLCBkZWZhdWx0cy5tYXhEYXRlKSxcclxuICAgICAgICAgICAgZGVmYXVsdERhdGU6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZURlZmF1bHREYXRlKG9wdGlvbnNbJ2RlZmF1bHREYXRlJ10sIGRlZmF1bHRzLmRlZmF1bHREYXRlKSxcclxuICAgICAgICAgICAgdGhlbWU6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZVRoZW1lKG9wdGlvbnNbJ3RoZW1lJ10sIGRlZmF1bHRzLnRoZW1lKSxcclxuICAgICAgICAgICAgbWlsaXRhcnlUaW1lOiBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVNaWxpdGFyeVRpbWUob3B0aW9uc1snbWlsaXRhcnlUaW1lJ10sIGRlZmF1bHRzLm1pbGl0YXJ5VGltZSksXHJcbiAgICAgICAgICAgIGlzU2Vjb25kU2VsZWN0YWJsZTogT3B0aW9uU2FuaXRpemVyLnNhbml0aXplSXNTZWNvbmRTZWxlY3RhYmxlKG9wdGlvbnNbJ2lzU2Vjb25kU2VsZWN0YWJsZSddLCBkZWZhdWx0cy5pc1NlY29uZFNlbGVjdGFibGUpLFxyXG4gICAgICAgICAgICBpc01pbnV0ZVNlbGVjdGFibGU6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZUlzTWludXRlU2VsZWN0YWJsZShvcHRpb25zWydpc01pbnV0ZVNlbGVjdGFibGUnXSwgZGVmYXVsdHMuaXNNaW51dGVTZWxlY3RhYmxlKSxcclxuICAgICAgICAgICAgaXNIb3VyU2VsZWN0YWJsZTogT3B0aW9uU2FuaXRpemVyLnNhbml0aXplSXNIb3VyU2VsZWN0YWJsZShvcHRpb25zWydpc0hvdXJTZWxlY3RhYmxlJ10sIGRlZmF1bHRzLmlzSG91clNlbGVjdGFibGUpLFxyXG4gICAgICAgICAgICBpc0RhdGVTZWxlY3RhYmxlOiBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVJc0RhdGVTZWxlY3RhYmxlKG9wdGlvbnNbJ2lzRGF0ZVNlbGVjdGFibGUnXSwgZGVmYXVsdHMuaXNEYXRlU2VsZWN0YWJsZSksXHJcbiAgICAgICAgICAgIGlzTW9udGhTZWxlY3RhYmxlOiBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVJc01vbnRoU2VsZWN0YWJsZShvcHRpb25zWydpc01vbnRoU2VsZWN0YWJsZSddLCBkZWZhdWx0cy5pc01vbnRoU2VsZWN0YWJsZSksXHJcbiAgICAgICAgICAgIGlzWWVhclNlbGVjdGFibGU6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZUlzWWVhclNlbGVjdGFibGUob3B0aW9uc1snaXNZZWFyU2VsZWN0YWJsZSddLCBkZWZhdWx0cy5pc1llYXJTZWxlY3RhYmxlKVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gb3B0cztcclxuICAgIH1cclxufSIsImNsYXNzIENvbW1vbiB7XHJcbiAgICBwcm90ZWN0ZWQgZ2V0TW9udGhzKCkge1xyXG4gICAgICAgIHJldHVybiBbXCJKYW51YXJ5XCIsIFwiRmVicnVhcnlcIiwgXCJNYXJjaFwiLCBcIkFwcmlsXCIsIFwiTWF5XCIsIFwiSnVuZVwiLCBcIkp1bHlcIiwgXCJBdWd1c3RcIiwgXCJTZXB0ZW1iZXJcIiwgXCJPY3RvYmVyXCIsIFwiTm92ZW1iZXJcIiwgXCJEZWNlbWJlclwiXTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGdldFNob3J0TW9udGhzKCkge1xyXG4gICAgICAgIHJldHVybiBbXCJKYW5cIiwgXCJGZWJcIiwgXCJNYXJcIiwgXCJBcHJcIiwgXCJNYXlcIiwgXCJKdW5cIiwgXCJKdWxcIiwgXCJBdWdcIiwgXCJTZXBcIiwgXCJPY3RcIiwgXCJOb3ZcIiwgXCJEZWNcIl07XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBnZXREYXlzKCkge1xyXG4gICAgICAgIHJldHVybiBbXCJTdW5kYXlcIiwgXCJNb25kYXlcIiwgXCJUdWVzZGF5XCIsIFwiV2VkbmVzZGF5XCIsIFwiVGh1cnNkYXlcIiwgXCJGcmlkYXlcIiwgXCJTYXR1cmRheVwiXTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGdldFNob3J0RGF5cygpIHtcclxuICAgICAgICByZXR1cm4gW1wiU3VuXCIsIFwiTW9uXCIsIFwiVHVlXCIsIFwiV2VkXCIsIFwiVGh1XCIsIFwiRnJpXCIsIFwiU2F0XCJdO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgZGF5c0luTW9udGgoZGF0ZTpEYXRlKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpICsgMSwgMCkuZ2V0RGF0ZSgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgZ2V0SG91cnMoZGF0ZTpEYXRlKTpzdHJpbmcge1xyXG4gICAgICAgIGxldCBudW0gPSBkYXRlLmdldEhvdXJzKCk7XHJcbiAgICAgICAgaWYgKG51bSA9PT0gMCkgbnVtID0gMTI7XHJcbiAgICAgICAgaWYgKG51bSA+IDEyKSBudW0gLT0gMTI7XHJcbiAgICAgICAgcmV0dXJuIG51bS50b1N0cmluZygpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgZ2V0RGVjYWRlKGRhdGU6RGF0ZSk6c3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gYCR7TWF0aC5mbG9vcihkYXRlLmdldEZ1bGxZZWFyKCkvMTApKjEwfSAtICR7TWF0aC5jZWlsKChkYXRlLmdldEZ1bGxZZWFyKCkgKyAxKS8xMCkqMTB9YDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGdldE1lcmlkaWVtKGRhdGU6RGF0ZSk6c3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gZGF0ZS5nZXRIb3VycygpIDwgMTIgPyAnYW0nIDogJ3BtJztcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIHBhZChudW06bnVtYmVyfHN0cmluZywgc2l6ZTpudW1iZXIgPSAyKSB7XHJcbiAgICAgICAgbGV0IHN0ciA9IG51bS50b1N0cmluZygpO1xyXG4gICAgICAgIHdoaWxlKHN0ci5sZW5ndGggPCBzaXplKSBzdHIgPSAnMCcgKyBzdHI7XHJcbiAgICAgICAgcmV0dXJuIHN0cjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIHRyaW0oc3RyOnN0cmluZykge1xyXG4gICAgICAgIHdoaWxlIChzdHJbMF0gPT09ICcwJyAmJiBzdHIubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICBzdHIgPSBzdHIuc3Vic3RyKDEsIHN0ci5sZW5ndGgpOyAgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzdHI7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBnZXRDbGllbnRDb29yKGU6YW55KTp7eDpudW1iZXIsIHk6bnVtYmVyfSB7XHJcbiAgICAgICAgaWYgKGUuY2xpZW50WCAhPT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB4OiBlLmNsaWVudFgsXHJcbiAgICAgICAgICAgICAgICB5OiBlLmNsaWVudFlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB4OiBlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFgsXHJcbiAgICAgICAgICAgIHk6IGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIkN1c3RvbUV2ZW50ID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgZnVuY3Rpb24gdXNlTmF0aXZlICgpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBsZXQgY3VzdG9tRXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoJ2EnLCB7IGRldGFpbDogeyBiOiAnYicgfSB9KTtcclxuICAgICAgICAgICAgcmV0dXJuICAnYScgPT09IGN1c3RvbUV2ZW50LnR5cGUgJiYgJ2InID09PSBjdXN0b21FdmVudC5kZXRhaWwuYjtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgaWYgKHVzZU5hdGl2ZSgpKSB7XHJcbiAgICAgICAgcmV0dXJuIDxhbnk+Q3VzdG9tRXZlbnQ7XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkb2N1bWVudC5jcmVhdGVFdmVudCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIC8vIElFID49IDlcclxuICAgICAgICByZXR1cm4gPGFueT5mdW5jdGlvbih0eXBlOnN0cmluZywgcGFyYW1zOkN1c3RvbUV2ZW50SW5pdCkge1xyXG4gICAgICAgICAgICBsZXQgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdDdXN0b21FdmVudCcpO1xyXG4gICAgICAgICAgICBpZiAocGFyYW1zKSB7XHJcbiAgICAgICAgICAgICAgICBlLmluaXRDdXN0b21FdmVudCh0eXBlLCBwYXJhbXMuYnViYmxlcywgcGFyYW1zLmNhbmNlbGFibGUsIHBhcmFtcy5kZXRhaWwpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZS5pbml0Q3VzdG9tRXZlbnQodHlwZSwgZmFsc2UsIGZhbHNlLCB2b2lkIDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBlO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gSUUgPj0gOFxyXG4gICAgICAgIHJldHVybiA8YW55PmZ1bmN0aW9uKHR5cGU6c3RyaW5nLCBwYXJhbXM6Q3VzdG9tRXZlbnRJbml0KSB7XHJcbiAgICAgICAgICAgIGxldCBlID0gKDxhbnk+ZG9jdW1lbnQpLmNyZWF0ZUV2ZW50T2JqZWN0KCk7XHJcbiAgICAgICAgICAgIGUudHlwZSA9IHR5cGU7XHJcbiAgICAgICAgICAgIGlmIChwYXJhbXMpIHtcclxuICAgICAgICAgICAgICAgIGUuYnViYmxlcyA9IEJvb2xlYW4ocGFyYW1zLmJ1YmJsZXMpO1xyXG4gICAgICAgICAgICAgICAgZS5jYW5jZWxhYmxlID0gQm9vbGVhbihwYXJhbXMuY2FuY2VsYWJsZSk7XHJcbiAgICAgICAgICAgICAgICBlLmRldGFpbCA9IHBhcmFtcy5kZXRhaWw7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBlLmJ1YmJsZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGUuY2FuY2VsYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgZS5kZXRhaWwgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGU7XHJcbiAgICAgICAgfSBcclxuICAgIH0gIFxyXG59KSgpO1xyXG4iLCJpbnRlcmZhY2UgSUxpc3RlbmVyUmVmZXJlbmNlIHtcclxuICAgIGVsZW1lbnQ6IEVsZW1lbnR8RG9jdW1lbnR8V2luZG93O1xyXG4gICAgcmVmZXJlbmNlOiBFdmVudExpc3RlbmVyO1xyXG4gICAgZXZlbnQ6IHN0cmluZztcclxufVxyXG5cclxuaW50ZXJmYWNlIElEcmFnQ2FsbGJhY2tzIHtcclxuICAgIGRyYWdTdGFydD86KGU/Ok1vdXNlRXZlbnR8VG91Y2hFdmVudCkgPT4gdm9pZDtcclxuICAgIGRyYWdNb3ZlPzooZT86TW91c2VFdmVudHxUb3VjaEV2ZW50KSA9PiB2b2lkO1xyXG4gICAgZHJhZ0VuZD86KGU/Ok1vdXNlRXZlbnR8VG91Y2hFdmVudCkgPT4gdm9pZDtcclxufVxyXG5cclxubmFtZXNwYWNlIGxpc3RlbiB7XHJcbiAgICBsZXQgbWF0Y2hlcyA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5tYXRjaGVzIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5tc01hdGNoZXNTZWxlY3RvcjtcclxuICAgIFxyXG4gICAgZnVuY3Rpb24gaGFuZGxlRGVsZWdhdGVFdmVudChwYXJlbnQ6RWxlbWVudCwgZGVsZWdhdGVTZWxlY3RvcjpzdHJpbmcsIGNhbGxiYWNrOihlPzpNb3VzZUV2ZW50fFRvdWNoRXZlbnQpID0+IHZvaWQpIHtcclxuICAgICAgICByZXR1cm4gKGU6TW91c2VFdmVudHxUb3VjaEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSBlLnNyY0VsZW1lbnQgfHwgPEVsZW1lbnQ+ZS50YXJnZXQ7XHJcbiAgICAgICAgICAgIHdoaWxlKHRhcmdldCAhPT0gbnVsbCAmJiAhdGFyZ2V0LmlzRXF1YWxOb2RlKHBhcmVudCkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChtYXRjaGVzLmNhbGwodGFyZ2V0LCBkZWxlZ2F0ZVNlbGVjdG9yKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnRFbGVtZW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBmdW5jdGlvbiBhdHRhY2hFdmVudHNEZWxlZ2F0ZShldmVudHM6c3RyaW5nW10sIHBhcmVudDpFbGVtZW50LCBkZWxlZ2F0ZVNlbGVjdG9yOnN0cmluZywgY2FsbGJhY2s6KGU/Ok1vdXNlRXZlbnR8VG91Y2hFdmVudCkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xyXG4gICAgICAgIGxldCBsaXN0ZW5lcnM6SUxpc3RlbmVyUmVmZXJlbmNlW10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gZXZlbnRzKSB7XHJcbiAgICAgICAgICAgIGxldCBldmVudDpzdHJpbmcgPSBldmVudHNba2V5XTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBuZXdMaXN0ZW5lciA9IGhhbmRsZURlbGVnYXRlRXZlbnQocGFyZW50LCBkZWxlZ2F0ZVNlbGVjdG9yLCBjYWxsYmFjayk7XHJcbiAgICAgICAgICAgIGxpc3RlbmVycy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IHBhcmVudCxcclxuICAgICAgICAgICAgICAgIHJlZmVyZW5jZTogbmV3TGlzdGVuZXIsXHJcbiAgICAgICAgICAgICAgICBldmVudDogZXZlbnRcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBwYXJlbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgbmV3TGlzdGVuZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbGlzdGVuZXJzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBmdW5jdGlvbiBhdHRhY2hFdmVudHMoZXZlbnRzOnN0cmluZ1tdLCBlbGVtZW50OkVsZW1lbnR8RG9jdW1lbnR8V2luZG93LCBjYWxsYmFjazooZT86YW55KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgbGV0IGxpc3RlbmVyczpJTGlzdGVuZXJSZWZlcmVuY2VbXSA9IFtdO1xyXG4gICAgICAgIGV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICBsaXN0ZW5lcnMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50OiBlbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgcmVmZXJlbmNlOiBjYWxsYmFjayxcclxuICAgICAgICAgICAgICAgIGV2ZW50OiBldmVudFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBjYWxsYmFjayk7IFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBsaXN0ZW5lcnM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIE5BVElWRVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZm9jdXMoZWxlbWVudDpFbGVtZW50fERvY3VtZW50fFdpbmRvdywgY2FsbGJhY2s6KGU/OkZvY3VzRXZlbnQpID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdIHtcclxuICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzKFsnZm9jdXMnXSwgZWxlbWVudCwgKGUpID0+IHtcclxuICAgICAgICAgICAgY2FsbGJhY2soZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiBibHVyKGVsZW1lbnQ6RWxlbWVudHxEb2N1bWVudHxXaW5kb3csIGNhbGxiYWNrOihlPzpGb2N1c0V2ZW50KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ2JsdXInXSwgZWxlbWVudCwgKGUpID0+IHtcclxuICAgICAgICAgICAgY2FsbGJhY2soZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiBkb3duKGVsZW1lbnQ6RWxlbWVudHxEb2N1bWVudHxXaW5kb3csIGNhbGxiYWNrOihlPzpNb3VzZUV2ZW50fFRvdWNoRXZlbnQpID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdO1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGRvd24ocGFyZW50OkVsZW1lbnR8RG9jdW1lbnR8V2luZG93LCBkZWxlZ2F0ZVNlbGVjdG9yOnN0cmluZywgY2FsbGJhY2s6KGU/Ok1vdXNlRXZlbnR8VG91Y2hFdmVudCkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW107XHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZG93biguLi5wYXJhbXM6YW55W10pIHtcclxuICAgICAgICBpZiAocGFyYW1zLmxlbmd0aCA9PT0gMykge1xyXG4gICAgICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzRGVsZWdhdGUoWydtb3VzZWRvd24nLCAndG91Y2hzdGFydCddLCBwYXJhbXNbMF0sIHBhcmFtc1sxXSwgKGUpID0+IHtcclxuICAgICAgICAgICAgICAgIHBhcmFtc1syXSg8YW55PmUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzKFsnbW91c2Vkb3duJywgJ3RvdWNoc3RhcnQnXSwgcGFyYW1zWzBdLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcGFyYW1zWzFdKDxhbnk+ZSk7XHJcbiAgICAgICAgICAgIH0pOyAgICAgICAgXHJcbiAgICAgICAgfSBcclxuICAgIH07XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiB1cChlbGVtZW50OkVsZW1lbnR8RG9jdW1lbnR8V2luZG93LCBjYWxsYmFjazooZT86TW91c2VFdmVudCkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xyXG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydtb3VzZXVwJywgJ3RvdWNoZW5kJ10sIGVsZW1lbnQsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gbW91c2Vkb3duKGVsZW1lbnQ6RWxlbWVudHxEb2N1bWVudHxXaW5kb3csIGNhbGxiYWNrOihlPzpNb3VzZUV2ZW50KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ21vdXNlZG93biddLCBlbGVtZW50LCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBjYWxsYmFjayhlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIG1vdXNldXAoZWxlbWVudDpFbGVtZW50fERvY3VtZW50fFdpbmRvdywgY2FsbGJhY2s6KGU/Ok1vdXNlRXZlbnQpID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdIHtcclxuICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzKFsnbW91c2V1cCddLCBlbGVtZW50LCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBjYWxsYmFjayhlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHBhc3RlKGVsZW1lbnQ6RWxlbWVudHxEb2N1bWVudHxXaW5kb3csIGNhbGxiYWNrOihlPzpNb3VzZUV2ZW50KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ3Bhc3RlJ10sIGVsZW1lbnQsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gdGFwKGVsZW1lbnQ6RWxlbWVudHxEb2N1bWVudCwgY2FsbGJhY2s6KGU/OkV2ZW50KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXTtcclxuICAgIGV4cG9ydCBmdW5jdGlvbiB0YXAocGFyZW50OkVsZW1lbnR8RG9jdW1lbnQsIGRlbGVnYXRlU2VsZWN0b3I6c3RyaW5nLCBjYWxsYmFjazooZT86RXZlbnQpID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdO1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHRhcCguLi5wYXJhbXM6YW55W10pOklMaXN0ZW5lclJlZmVyZW5jZVtdIHtcclxuICAgICAgICBsZXQgc3RhcnRUb3VjaFg6bnVtYmVyLCBzdGFydFRvdWNoWTpudW1iZXI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGhhbmRsZVN0YXJ0ID0gKGU6VG91Y2hFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBzdGFydFRvdWNoWCA9IGUudG91Y2hlc1swXS5jbGllbnRYO1xyXG4gICAgICAgICAgICBzdGFydFRvdWNoWSA9IGUudG91Y2hlc1swXS5jbGllbnRZO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBsZXQgaGFuZGxlRW5kID0gKGU6VG91Y2hFdmVudCwgY2FsbGJhY2s6KGU/OkV2ZW50KSA9PiB2b2lkKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlLmNoYW5nZWRUb3VjaGVzID09PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgeERpZmYgPSBlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFggLSBzdGFydFRvdWNoWDtcclxuICAgICAgICAgICAgbGV0IHlEaWZmID0gZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRZIC0gc3RhcnRUb3VjaFk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoTWF0aC5zcXJ0KHhEaWZmICogeERpZmYgKyB5RGlmZiAqIHlEaWZmKSA8IDEwKSB7XHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBsZXQgbGlzdGVuZXJzOklMaXN0ZW5lclJlZmVyZW5jZVtdID0gW107XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHBhcmFtcy5sZW5ndGggPT09IDMpIHtcclxuICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChhdHRhY2hFdmVudHNEZWxlZ2F0ZShbJ3RvdWNoc3RhcnQnXSwgcGFyYW1zWzBdLCBwYXJhbXNbMV0sIGhhbmRsZVN0YXJ0KSk7XHJcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IGxpc3RlbmVycy5jb25jYXQoYXR0YWNoRXZlbnRzRGVsZWdhdGUoWyd0b3VjaGVuZCcsICdjbGljayddLCBwYXJhbXNbMF0sIHBhcmFtc1sxXSwgKGU6VG91Y2hFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlRW5kKGUsIHBhcmFtc1syXSk7XHJcbiAgICAgICAgICAgIH0pKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHBhcmFtcy5sZW5ndGggPT09IDIpIHtcclxuICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChhdHRhY2hFdmVudHMoWyd0b3VjaHN0YXJ0J10sIHBhcmFtc1swXSwgaGFuZGxlU3RhcnQpKTtcclxuICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChhdHRhY2hFdmVudHMoWyd0b3VjaGVuZCcsICdjbGljayddLCBwYXJhbXNbMF0sIChlOlRvdWNoRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZUVuZChlLCBwYXJhbXNbMV0pO1xyXG4gICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBsaXN0ZW5lcnM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIHN3aXBlKGVsZW1lbnQ6RWxlbWVudCwgZGlyZWN0aW9uOnN0cmluZywgY2FsbGJhY2s6KGU/OkV2ZW50KSA9PiB2b2lkKSB7XHJcbiAgICAgICAgbGV0IHN0YXJ0VG91Y2hYOm51bWJlciwgc3RhcnRUb3VjaFk6bnVtYmVyLCBzdGFydFRpbWU6bnVtYmVyO1xyXG4gICAgICAgIGxldCB0b3VjaE1vdmVMaXN0ZW5lcjpJTGlzdGVuZXJSZWZlcmVuY2U7XHJcbiAgICAgICAgbGV0IHNjcm9sbGluZ0Rpc2FibGVkOmJvb2xlYW47XHJcbiAgICAgICAgXHJcbiAgICAgICAgYXR0YWNoRXZlbnRzKFsndG91Y2hzdGFydCddLCBlbGVtZW50LCAoZTpUb3VjaEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHN0YXJ0VG91Y2hYID0gZS50b3VjaGVzWzBdLmNsaWVudFg7XHJcbiAgICAgICAgICAgIHN0YXJ0VG91Y2hZID0gZS50b3VjaGVzWzBdLmNsaWVudFk7XHJcbiAgICAgICAgICAgIHN0YXJ0VGltZSA9IG5ldyBEYXRlKCkudmFsdWVPZigpO1xyXG4gICAgICAgICAgICBzY3JvbGxpbmdEaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0b3VjaE1vdmVMaXN0ZW5lciA9IGF0dGFjaEV2ZW50cyhbJ3RvdWNobW92ZSddLCBkb2N1bWVudCwgKGU6VG91Y2hFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IHhEaWZmID0gTWF0aC5hYnMoZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRYIC0gc3RhcnRUb3VjaFgpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHlEaWZmID0gTWF0aC5hYnMoZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRZIC0gc3RhcnRUb3VjaFkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHhEaWZmID4geURpZmYgJiYgeERpZmYgPiAyMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbGluZ0Rpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoeURpZmYgPiB4RGlmZiAmJiB5RGlmZiA+IDIwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsaW5nRGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChuZXcgRGF0ZSgpLnZhbHVlT2YoKSAtIHN0YXJ0VGltZSA+IDUwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbGluZ0Rpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoc2Nyb2xsaW5nRGlzYWJsZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pWzBdOyBcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICBhdHRhY2hFdmVudHMoWyd0b3VjaGVuZCddLCBlbGVtZW50LCAoZTpUb3VjaEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIodG91Y2hNb3ZlTGlzdGVuZXIuZXZlbnQsIHRvdWNoTW92ZUxpc3RlbmVyLnJlZmVyZW5jZSk7XHJcbiAgICAgICAgICAgIGlmIChzdGFydFRvdWNoWCA9PT0gdm9pZCAwIHx8IHN0YXJ0VG91Y2hZID09PSB2b2lkIDApIHJldHVybjtcclxuICAgICAgICAgICAgaWYgKG5ldyBEYXRlKCkudmFsdWVPZigpIC0gc3RhcnRUaW1lID4gNTAwKSByZXR1cm47XHJcbiAgICAgICAgICAgIGxldCB4RGlmZiA9IGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WCAtIHN0YXJ0VG91Y2hYO1xyXG4gICAgICAgICAgICBsZXQgeURpZmYgPSBlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFkgLSBzdGFydFRvdWNoWTtcclxuICAgICAgICAgICAgaWYgKE1hdGguYWJzKHhEaWZmKSA+IE1hdGguYWJzKHlEaWZmKSAmJiBNYXRoLmFicyh4RGlmZikgPiAyMCkge1xyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJ2xlZnQnICYmIHhEaWZmIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJ3JpZ2h0JyAmJiB4RGlmZiA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gc3dpcGVMZWZ0KGVsZW1lbnQ6RWxlbWVudCwgY2FsbGJhY2s6KGU/OkV2ZW50KSA9PiB2b2lkKSB7XHJcbiAgICAgICAgc3dpcGUoZWxlbWVudCwgJ2xlZnQnLCBjYWxsYmFjayk7XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHN3aXBlUmlnaHQoZWxlbWVudDpFbGVtZW50LCBjYWxsYmFjazooZT86RXZlbnQpID0+IHZvaWQpIHtcclxuICAgICAgICBzd2lwZShlbGVtZW50LCAncmlnaHQnLCBjYWxsYmFjayk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiBkcmFnKGVsZW1lbnQ6RWxlbWVudCwgY2FsbGJhY2tzOklEcmFnQ2FsbGJhY2tzKTp2b2lkO1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGRyYWcocGFyZW50OkVsZW1lbnQsIGRlbGVnYXRlU2VsZWN0b3I6c3RyaW5nLCBjYWxsYmFja3M6SURyYWdDYWxsYmFja3MpOnZvaWQ7XHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZHJhZyguLi5wYXJhbXM6YW55W10pOnZvaWQge1xyXG4gICAgICAgIGxldCBkcmFnZ2luZzpib29sZWFuID0gZmFsc2U7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGNhbGxiYWNrczpJRHJhZ0NhbGxiYWNrcyA9IHBhcmFtc1twYXJhbXMubGVuZ3RoLTFdO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBzdGFydEV2ZW50cyA9IChlPzpNb3VzZUV2ZW50fFRvdWNoRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgZHJhZ2dpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICBpZiAoY2FsbGJhY2tzLmRyYWdTdGFydCAhPT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgICAgICBjYWxsYmFja3MuZHJhZ1N0YXJ0KGUpO1xyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgbGlzdGVuZXJzOklMaXN0ZW5lclJlZmVyZW5jZVtdID0gW107XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuY29uY2F0KGF0dGFjaEV2ZW50cyhbJ3RvdWNobW92ZScsICdtb3VzZW1vdmUnXSwgZG9jdW1lbnQsIChlPzpNb3VzZUV2ZW50fFRvdWNoRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChkcmFnZ2luZyAmJiBjYWxsYmFja3MuZHJhZ01vdmUgIT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrcy5kcmFnTW92ZShlKTtcclxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChhdHRhY2hFdmVudHMoWyd0b3VjaGVuZCcsICdtb3VzZXVwJ10sIGRvY3VtZW50LCAoZT86TW91c2VFdmVudHxUb3VjaEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZHJhZ2dpbmcgJiYgY2FsbGJhY2tzLmRyYWdFbmQgIT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrcy5kcmFnRW5kKGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGRyYWdnaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICByZW1vdmVMaXN0ZW5lcnMobGlzdGVuZXJzKTsgICAgICAgICAgICBcclxuICAgICAgICAgICAgfSkpOyAgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChwYXJhbXMubGVuZ3RoID09PSAzKSB7XHJcbiAgICAgICAgICAgIGF0dGFjaEV2ZW50c0RlbGVnYXRlKFsndG91Y2hzdGFydCcsICdtb3VzZWRvd24nXSwgcGFyYW1zWzBdLCBwYXJhbXNbMV0sIHN0YXJ0RXZlbnRzKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBhdHRhY2hFdmVudHMoWyd0b3VjaHN0YXJ0JywgJ21vdXNlZG93biddLCBwYXJhbXNbMF0sIHN0YXJ0RXZlbnRzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIENVU1RPTVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZ290byhlbGVtZW50OkVsZW1lbnQsIGNhbGxiYWNrOihlPzp7ZGF0ZTpEYXRlLCBsZXZlbDpMZXZlbCwgdXBkYXRlPzpib29sZWFufSkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xyXG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydkYXRpdW0tZ290byddLCBlbGVtZW50LCAoZTpDdXN0b21FdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBjYWxsYmFjayhlLmRldGFpbCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiB6b29tT3V0KGVsZW1lbnQ6RWxlbWVudCwgY2FsbGJhY2s6KGU/OntkYXRlOkRhdGUsIGN1cnJlbnRMZXZlbDpMZXZlbCwgdXBkYXRlPzpib29sZWFufSkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xyXG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydkYXRpdW0tem9vbS1vdXQnXSwgZWxlbWVudCwgKGU6Q3VzdG9tRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgY2FsbGJhY2soZS5kZXRhaWwpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gem9vbUluKGVsZW1lbnQ6RWxlbWVudCwgY2FsbGJhY2s6KGU/OntkYXRlOkRhdGUsIGN1cnJlbnRMZXZlbDpMZXZlbCwgdXBkYXRlPzpib29sZWFufSkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xyXG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydkYXRpdW0tem9vbS1pbiddLCBlbGVtZW50LCAoZTpDdXN0b21FdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBjYWxsYmFjayhlLmRldGFpbCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiB2aWV3Y2hhbmdlZChlbGVtZW50OkVsZW1lbnQsIGNhbGxiYWNrOihlPzp7ZGF0ZTpEYXRlLCBsZXZlbDpMZXZlbCwgdXBkYXRlPzpib29sZWFufSkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xyXG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydkYXRpdW0tdmlld2NoYW5nZWQnXSwgZWxlbWVudCwgKGU6Q3VzdG9tRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgY2FsbGJhY2soZS5kZXRhaWwpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gb3BlbkJ1YmJsZShlbGVtZW50OkVsZW1lbnQsIGNhbGxiYWNrOihlOnt4Om51bWJlciwgeTpudW1iZXIsIHRleHQ6c3RyaW5nfSkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xyXG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydkYXRpdW0tb3Blbi1idWJibGUnXSwgZWxlbWVudCwgKGU6Q3VzdG9tRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgY2FsbGJhY2soZS5kZXRhaWwpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gdXBkYXRlQnViYmxlKGVsZW1lbnQ6RWxlbWVudCwgY2FsbGJhY2s6KGU6e3g6bnVtYmVyLCB5Om51bWJlciwgdGV4dDpzdHJpbmd9KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ2RhdGl1bS11cGRhdGUtYnViYmxlJ10sIGVsZW1lbnQsIChlOkN1c3RvbUV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGUuZGV0YWlsKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVycyhsaXN0ZW5lcnM6SUxpc3RlbmVyUmVmZXJlbmNlW10pIHtcclxuICAgICAgICBsaXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIpID0+IHtcclxuICAgICAgICAgICBsaXN0ZW5lci5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIobGlzdGVuZXIuZXZlbnQsIGxpc3RlbmVyLnJlZmVyZW5jZSk7IFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5uYW1lc3BhY2UgdHJpZ2dlciB7XHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZ290byhlbGVtZW50OkVsZW1lbnQsIGRhdGE/OntkYXRlOkRhdGUsIGxldmVsOkxldmVsLCB1cGRhdGU/OmJvb2xlYW59KSB7XHJcbiAgICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnZGF0aXVtLWdvdG8nLCB7XHJcbiAgICAgICAgICAgIGJ1YmJsZXM6IGZhbHNlLFxyXG4gICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICBkZXRhaWw6IGRhdGFcclxuICAgICAgICB9KSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiB6b29tT3V0KGVsZW1lbnQ6RWxlbWVudCwgZGF0YT86e2RhdGU6RGF0ZSwgY3VycmVudExldmVsOkxldmVsLCB1cGRhdGU/OmJvb2xlYW59KSB7XHJcbiAgICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnZGF0aXVtLXpvb20tb3V0Jywge1xyXG4gICAgICAgICAgICBidWJibGVzOiBmYWxzZSwgXHJcbiAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXHJcbiAgICAgICAgICAgIGRldGFpbDogZGF0YVxyXG4gICAgICAgIH0pKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHpvb21JbihlbGVtZW50OkVsZW1lbnQsIGRhdGE/OntkYXRlOkRhdGUsIGN1cnJlbnRMZXZlbDpMZXZlbCwgdXBkYXRlPzpib29sZWFufSkge1xyXG4gICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2RhdGl1bS16b29tLWluJywge1xyXG4gICAgICAgICAgICBidWJibGVzOiBmYWxzZSwgXHJcbiAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXHJcbiAgICAgICAgICAgIGRldGFpbDogZGF0YVxyXG4gICAgICAgIH0pKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHZpZXdjaGFuZ2VkKGVsZW1lbnQ6RWxlbWVudCwgZGF0YT86e2RhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWwsIHVwZGF0ZT86Ym9vbGVhbn0pIHtcclxuICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdkYXRpdW0tdmlld2NoYW5nZWQnLCB7XHJcbiAgICAgICAgICAgIGJ1YmJsZXM6IGZhbHNlLFxyXG4gICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICBkZXRhaWw6IGRhdGFcclxuICAgICAgICB9KSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiBvcGVuQnViYmxlKGVsZW1lbnQ6RWxlbWVudCwgZGF0YTp7eDpudW1iZXIsIHk6bnVtYmVyLCB0ZXh0OnN0cmluZ30pIHtcclxuICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdkYXRpdW0tb3Blbi1idWJibGUnLCB7XHJcbiAgICAgICAgICAgIGJ1YmJsZXM6IGZhbHNlLFxyXG4gICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICBkZXRhaWw6IGRhdGFcclxuICAgICAgICB9KSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiB1cGRhdGVCdWJibGUoZWxlbWVudDpFbGVtZW50LCBkYXRhOnt4Om51bWJlciwgeTpudW1iZXIsIHRleHQ6c3RyaW5nfSkge1xyXG4gICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2RhdGl1bS11cGRhdGUtYnViYmxlJywge1xyXG4gICAgICAgICAgICBidWJibGVzOiBmYWxzZSxcclxuICAgICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgZGV0YWlsOiBkYXRhXHJcbiAgICAgICAgfSkpO1xyXG4gICAgfVxyXG59IiwiaW50ZXJmYWNlIElEYXRlUGFydCB7XHJcbiAgICBpbmNyZW1lbnQoKTp2b2lkO1xyXG4gICAgZGVjcmVtZW50KCk6dm9pZDtcclxuICAgIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpOmJvb2xlYW47XHJcbiAgICBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZyk6Ym9vbGVhbjtcclxuICAgIGdldExhc3RWYWx1ZSgpOkRhdGU7XHJcbiAgICBnZXRWYWx1ZSgpOkRhdGU7XHJcbiAgICBnZXRSZWdFeCgpOlJlZ0V4cDtcclxuICAgIHNldFNlbGVjdGFibGUoc2VsZWN0YWJsZTpib29sZWFuKTpJRGF0ZVBhcnQ7XHJcbiAgICBnZXRNYXhCdWZmZXIoKTpudW1iZXI7XHJcbiAgICBnZXRMZXZlbCgpOkxldmVsO1xyXG4gICAgaXNTZWxlY3RhYmxlKCk6Ym9vbGVhbjtcclxuICAgIHRvU3RyaW5nKCk6c3RyaW5nO1xyXG59XHJcblxyXG5jbGFzcyBQbGFpblRleHQgaW1wbGVtZW50cyBJRGF0ZVBhcnQge1xyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSB0ZXh0OnN0cmluZykge31cclxuICAgIHB1YmxpYyBpbmNyZW1lbnQoKSB7fVxyXG4gICAgcHVibGljIGRlY3JlbWVudCgpIHt9XHJcbiAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbCgpIHsgcmV0dXJuIGZhbHNlIH1cclxuICAgIHB1YmxpYyBzZXRWYWx1ZSgpIHsgcmV0dXJuIGZhbHNlIH1cclxuICAgIHB1YmxpYyBnZXRMYXN0VmFsdWUoKTpEYXRlIHsgcmV0dXJuIG51bGwgfVxyXG4gICAgcHVibGljIGdldFZhbHVlKCk6RGF0ZSB7IHJldHVybiBudWxsIH1cclxuICAgIHB1YmxpYyBnZXRSZWdFeCgpOlJlZ0V4cCB7IHJldHVybiBuZXcgUmVnRXhwKGBbJHt0aGlzLnRleHR9XWApOyB9XHJcbiAgICBwdWJsaWMgc2V0U2VsZWN0YWJsZShzZWxlY3RhYmxlOmJvb2xlYW4pOklEYXRlUGFydCB7IHJldHVybiB0aGlzIH1cclxuICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKTpudW1iZXIgeyByZXR1cm4gMCB9XHJcbiAgICBwdWJsaWMgZ2V0TGV2ZWwoKTpMZXZlbCB7IHJldHVybiBMZXZlbC5OT05FIH1cclxuICAgIHB1YmxpYyBpc1NlbGVjdGFibGUoKTpib29sZWFuIHsgcmV0dXJuIGZhbHNlIH1cclxuICAgIHB1YmxpYyB0b1N0cmluZygpOnN0cmluZyB7IHJldHVybiB0aGlzLnRleHQgfVxyXG59XHJcbiAgICBcclxubGV0IGZvcm1hdEJsb2NrcyA9IChmdW5jdGlvbigpIHsgICAgXHJcbiAgICBjbGFzcyBEYXRlUGFydCBleHRlbmRzIENvbW1vbiB7XHJcbiAgICAgICAgcHJvdGVjdGVkIGRhdGU6RGF0ZTtcclxuICAgICAgICBwcm90ZWN0ZWQgc2VsZWN0YWJsZTpib29sZWFuID0gdHJ1ZTtcclxuICAgICAgICBcclxuICAgICAgICBwcml2YXRlIGN1cnJlbnQ6RGF0ZTtcclxuICAgICAgICBwcml2YXRlIGxhc3Q6RGF0ZTtcclxuICAgICAgICBcclxuICAgICAgICBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgb3B0aW9uczpJT3B0aW9ucykge1xyXG4gICAgICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0VmFsdWUoKTpEYXRlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0U2VsZWN0YWJsZShzZWxlY3RhYmxlOmJvb2xlYW4pIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RhYmxlID0gc2VsZWN0YWJsZTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBpc1NlbGVjdGFibGUoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGFibGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHByb3RlY3RlZCBzZXRMYXN0KCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50ID09PSB2b2lkIDAgfHxcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9PT0gdm9pZCAwIHx8XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUudmFsdWVPZigpICE9PSB0aGlzLmN1cnJlbnQudmFsdWVPZigpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3QgPSB0aGlzLmN1cnJlbnQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnQgPSB0aGlzLmRhdGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldExhc3RWYWx1ZSgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubGFzdDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIEZvdXJEaWdpdFllYXIgZXh0ZW5kcyBEYXRlUGFydCB7XHJcbiAgICAgICAgY29uc3RydWN0b3Iob3B0aW9uczpJT3B0aW9ucykgeyBzdXBlcihvcHRpb25zKTsgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBpbmNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRGdWxsWWVhcih0aGlzLmRhdGUuZ2V0RnVsbFllYXIoKSArIDEpO1xyXG4gICAgICAgICAgICB9IHdoaWxlICghdGhpcy5vcHRpb25zLmlzWWVhclNlbGVjdGFibGUodGhpcy5kYXRlKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZGVjcmVtZW50KCkge1xyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0RnVsbFllYXIodGhpcy5kYXRlLmdldEZ1bGxZZWFyKCkgLSAxKTtcclxuICAgICAgICAgICAgfSB3aGlsZSAoIXRoaXMub3B0aW9ucy5pc1llYXJTZWxlY3RhYmxlKHRoaXMuZGF0ZSkpO1xyXG4gICAgICAgICAgICB0aGlzLnNldExhc3QoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUocGFydGlhbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRGdWxsWWVhcihwYXJzZUludCh2YWx1ZSwgMTApKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXi0/XFxkezEsNH0kLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIExldmVsLllFQVI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXRGdWxsWWVhcigpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBUd29EaWdpdFllYXIgZXh0ZW5kcyBGb3VyRGlnaXRZZWFyIHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihvcHRpb25zOklPcHRpb25zKSB7IHN1cGVyKG9wdGlvbnMpOyB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBiYXNlID0gTWF0aC5mbG9vcihzdXBlci5nZXRWYWx1ZSgpLmdldEZ1bGxZZWFyKCkvMTAwKSoxMDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0RnVsbFllYXIocGFyc2VJbnQoPHN0cmluZz52YWx1ZSwgMTApICsgYmFzZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldExhc3QoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL14tP1xcZHsxLDJ9JC87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLnRvU3RyaW5nKCkuc2xpY2UoLTIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgTG9uZ01vbnRoTmFtZSBleHRlbmRzIERhdGVQYXJ0IHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihvcHRpb25zOklPcHRpb25zKSB7IHN1cGVyKG9wdGlvbnMpOyB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHJvdGVjdGVkIGdldE1vbnRocygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLmdldE1vbnRocygpO1xyXG4gICAgICAgIH0gXHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGluY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRNb250aCgpICsgMTtcclxuICAgICAgICAgICAgICAgIGlmIChudW0gPiAxMSkgbnVtID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRNb250aChudW0pO1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKHRoaXMuZGF0ZS5nZXRNb250aCgpID4gbnVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldERhdGUodGhpcy5kYXRlLmdldERhdGUoKSAtIDEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IHdoaWxlICghdGhpcy5vcHRpb25zLmlzTW9udGhTZWxlY3RhYmxlKHRoaXMuZGF0ZSkpO1xyXG4gICAgICAgICAgICB0aGlzLnNldExhc3QoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGRlY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRNb250aCgpIC0gMTtcclxuICAgICAgICAgICAgICAgIGlmIChudW0gPCAwKSBudW0gPSAxMTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRNb250aChudW0pO1xyXG4gICAgICAgICAgICB9IHdoaWxlICghdGhpcy5vcHRpb25zLmlzTW9udGhTZWxlY3RhYmxlKHRoaXMuZGF0ZSkpO1xyXG4gICAgICAgICAgICB0aGlzLnNldExhc3QoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgbGV0IG1vbnRoID0gdGhpcy5nZXRNb250aHMoKS5maWx0ZXIoKG1vbnRoKSA9PiB7XHJcbiAgICAgICAgICAgICAgIHJldHVybiBuZXcgUmVnRXhwKGBeJHtwYXJ0aWFsfS4qJGAsICdpJykudGVzdChtb250aCk7IFxyXG4gICAgICAgICAgICB9KVswXTtcclxuICAgICAgICAgICAgaWYgKG1vbnRoICE9PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKG1vbnRoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmdldE1vbnRocygpLmluZGV4T2YodmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1vbnRoKG51bSk7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAodGhpcy5kYXRlLmdldE1vbnRoKCkgPiBudW0pIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0RGF0ZSh0aGlzLmRhdGUuZ2V0RGF0ZSgpIC0gMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldExhc3QoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cChgXigoJHt0aGlzLmdldE1vbnRocygpLmpvaW4oXCIpfChcIil9KSkkYCwgJ2knKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFsyLDEsMywyLDMsMywzLDIsMSwxLDEsMV1bdGhpcy5kYXRlLmdldE1vbnRoKCldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBMZXZlbC5NT05USDtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRNb250aHMoKVt0aGlzLmRhdGUuZ2V0TW9udGgoKV07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBTaG9ydE1vbnRoTmFtZSBleHRlbmRzIExvbmdNb250aE5hbWUge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6SU9wdGlvbnMpIHsgc3VwZXIob3B0aW9ucyk7IH1cclxuICAgICAgICBcclxuICAgICAgICBwcm90ZWN0ZWQgZ2V0TW9udGhzKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3VwZXIuZ2V0U2hvcnRNb250aHMoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIE1vbnRoIGV4dGVuZHMgTG9uZ01vbnRoTmFtZSB7XHJcbiAgICAgICAgY29uc3RydWN0b3Iob3B0aW9uczpJT3B0aW9ucykgeyBzdXBlcihvcHRpb25zKTsgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0TW9udGgoKSA+IDAgPyAxIDogMjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKC9eXFxkezEsMn0kLy50ZXN0KHBhcnRpYWwpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdHJpbW1lZCA9IHRoaXMudHJpbShwYXJ0aWFsID09PSAnMCcgPyAnMScgOiBwYXJ0aWFsKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHRyaW1tZWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRMYXN0KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHRoaXMuZ2V0UmVnRXgoKS50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1vbnRoKHBhcnNlSW50KHZhbHVlLCAxMCkgLSAxKTtcclxuICAgICAgICAgICAgICAgIHdoaWxlICh0aGlzLmRhdGUuZ2V0TW9udGgoKSA+IHBhcnNlSW50KHZhbHVlLCAxMCkgLSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldERhdGUodGhpcy5kYXRlLmdldERhdGUoKSAtIDEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRMYXN0KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eKFsxLTldfCgxWzAtMl0pKSQvO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAodGhpcy5kYXRlLmdldE1vbnRoKCkgKyAxKS50b1N0cmluZygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgUGFkZGVkTW9udGggZXh0ZW5kcyBNb250aCB7XHJcbiAgICAgICAgY29uc3RydWN0b3Iob3B0aW9uczpJT3B0aW9ucykgeyBzdXBlcihvcHRpb25zKTsgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICgvXlxcZHsxLDJ9JC8udGVzdChwYXJ0aWFsKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhZGRlZCA9IHRoaXMucGFkKHBhcnRpYWwgPT09ICcwJyA/ICcxJyA6IHBhcnRpYWwpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUocGFkZGVkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eKCgwWzEtOV0pfCgxWzAtMl0pKSQvOyAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhZChzdXBlci50b1N0cmluZygpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIERhdGVOdW1lcmFsIGV4dGVuZHMgRGF0ZVBhcnQge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6SU9wdGlvbnMpIHsgc3VwZXIob3B0aW9ucyk7IH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgaW5jcmVtZW50KCkge1xyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldERhdGUoKSArIDE7XHJcbiAgICAgICAgICAgICAgICBpZiAobnVtID4gdGhpcy5kYXlzSW5Nb250aCh0aGlzLmRhdGUpKSBudW0gPSAxO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldERhdGUobnVtKTtcclxuICAgICAgICAgICAgfSB3aGlsZSAoIXRoaXMub3B0aW9ucy5pc0RhdGVTZWxlY3RhYmxlKHRoaXMuZGF0ZSkpO1xyXG4gICAgICAgICAgICB0aGlzLnNldExhc3QoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGRlY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXREYXRlKCkgLSAxO1xyXG4gICAgICAgICAgICAgICAgaWYgKG51bSA8IDEpIG51bSA9IHRoaXMuZGF5c0luTW9udGgodGhpcy5kYXRlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXREYXRlKG51bSk7XHJcbiAgICAgICAgICAgIH0gd2hpbGUgKCF0aGlzLm9wdGlvbnMuaXNEYXRlU2VsZWN0YWJsZSh0aGlzLmRhdGUpKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRMYXN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICgvXlxcZHsxLDJ9JC8udGVzdChwYXJ0aWFsKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHRyaW1tZWQgPSB0aGlzLnRyaW0ocGFydGlhbCA9PT0gJzAnID8gJzEnIDogcGFydGlhbCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0cmltbWVkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkgJiYgcGFyc2VJbnQodmFsdWUsIDEwKSA8IHRoaXMuZGF5c0luTW9udGgodGhpcy5kYXRlKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldERhdGUocGFyc2VJbnQodmFsdWUsIDEwKSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldExhc3QoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL15bMS05XXwoKDF8MilbMC05XSl8KDNbMC0xXSkkLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXREYXRlKCkgPiBNYXRoLmZsb29yKHRoaXMuZGF5c0luTW9udGgodGhpcy5kYXRlKS8xMCkgPyAxIDogMjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldExldmVsKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTGV2ZWwuREFURTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldERhdGUoKS50b1N0cmluZygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgUGFkZGVkRGF0ZSBleHRlbmRzIERhdGVOdW1lcmFsIHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihvcHRpb25zOklPcHRpb25zKSB7IHN1cGVyKG9wdGlvbnMpOyB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKC9eXFxkezEsMn0kLy50ZXN0KHBhcnRpYWwpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGFkZGVkID0gdGhpcy5wYWQocGFydGlhbCA9PT0gJzAnID8gJzEnIDogcGFydGlhbCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZShwYWRkZWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL14oMFsxLTldKXwoKDF8MilbMC05XSl8KDNbMC0xXSkkLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYWQodGhpcy5kYXRlLmdldERhdGUoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBEYXRlT3JkaW5hbCBleHRlbmRzIERhdGVOdW1lcmFsIHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihvcHRpb25zOklPcHRpb25zKSB7IHN1cGVyKG9wdGlvbnMpOyB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL14oWzEtOV18KCgxfDIpWzAtOV0pfCgzWzAtMV0pKSgoc3QpfChuZCl8KHJkKXwodGgpKT8kL2k7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgbGV0IGRhdGUgPSB0aGlzLmRhdGUuZ2V0RGF0ZSgpO1xyXG4gICAgICAgICAgICBsZXQgaiA9IGRhdGUgJSAxMDtcclxuICAgICAgICAgICAgbGV0IGsgPSBkYXRlICUgMTAwO1xyXG4gICAgICAgICAgICBpZiAoaiA9PT0gMSAmJiBrICE9PSAxMSkgcmV0dXJuIGRhdGUgKyBcInN0XCI7XHJcbiAgICAgICAgICAgIGlmIChqID09PSAyICYmIGsgIT09IDEyKSByZXR1cm4gZGF0ZSArIFwibmRcIjtcclxuICAgICAgICAgICAgaWYgKGogPT09IDMgJiYgayAhPT0gMTMpIHJldHVybiBkYXRlICsgXCJyZFwiO1xyXG4gICAgICAgICAgICByZXR1cm4gZGF0ZSArIFwidGhcIjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIExvbmdEYXlOYW1lIGV4dGVuZHMgRGF0ZVBhcnQge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6SU9wdGlvbnMpIHsgc3VwZXIob3B0aW9ucyk7IH1cclxuICAgICAgICBcclxuICAgICAgICBwcm90ZWN0ZWQgZ2V0RGF5cygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLmdldERheXMoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGluY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXREYXkoKSArIDE7XHJcbiAgICAgICAgICAgICAgICBpZiAobnVtID4gNikgbnVtID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXREYXRlKHRoaXMuZGF0ZS5nZXREYXRlKCkgLSB0aGlzLmRhdGUuZ2V0RGF5KCkgKyBudW0pO1xyXG4gICAgICAgICAgICB9IHdoaWxlICghdGhpcy5vcHRpb25zLmlzRGF0ZVNlbGVjdGFibGUodGhpcy5kYXRlKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZGVjcmVtZW50KCkge1xyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldERheSgpIC0gMTtcclxuICAgICAgICAgICAgICAgIGlmIChudW0gPCAwKSBudW0gPSA2O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldERhdGUodGhpcy5kYXRlLmdldERhdGUoKSAtIHRoaXMuZGF0ZS5nZXREYXkoKSArIG51bSk7XHJcbiAgICAgICAgICAgIH0gd2hpbGUgKCF0aGlzLm9wdGlvbnMuaXNEYXRlU2VsZWN0YWJsZSh0aGlzLmRhdGUpKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRMYXN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXkgPSB0aGlzLmdldERheXMoKS5maWx0ZXIoKGRheSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoYF4ke3BhcnRpYWx9LiokYCwgJ2knKS50ZXN0KGRheSk7XHJcbiAgICAgICAgICAgIH0pWzBdO1xyXG4gICAgICAgICAgICBpZiAoZGF5ICE9PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKGRheSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKHZhbHVlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldExhc3QoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5nZXREYXlzKCkuaW5kZXhPZih2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0RGF0ZSh0aGlzLmRhdGUuZ2V0RGF0ZSgpIC0gdGhpcy5kYXRlLmdldERheSgpICsgbnVtKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUmVnRXhwKGBeKCgke3RoaXMuZ2V0RGF5cygpLmpvaW4oXCIpfChcIil9KSkkYCwgJ2knKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFsyLDEsMiwxLDIsMSwyXVt0aGlzLmRhdGUuZ2V0RGF5KCldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBMZXZlbC5EQVRFO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldERheXMoKVt0aGlzLmRhdGUuZ2V0RGF5KCldO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgU2hvcnREYXlOYW1lIGV4dGVuZHMgTG9uZ0RheU5hbWUge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6SU9wdGlvbnMpIHsgc3VwZXIob3B0aW9ucyk7IH1cclxuICAgICAgICBcclxuICAgICAgICBwcm90ZWN0ZWQgZ2V0RGF5cygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLmdldFNob3J0RGF5cygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgUGFkZGVkTWlsaXRhcnlIb3VyIGV4dGVuZHMgRGF0ZVBhcnQge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6SU9wdGlvbnMpIHsgc3VwZXIob3B0aW9ucyk7IH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgaW5jcmVtZW50KCkge1xyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldEhvdXJzKCkgKyAxO1xyXG4gICAgICAgICAgICAgICAgaWYgKG51bSA+IDIzKSBudW0gPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldEhvdXJzKG51bSk7XHJcbiAgICAgICAgICAgIH0gd2hpbGUgKCF0aGlzLm9wdGlvbnMuaXNIb3VyU2VsZWN0YWJsZSh0aGlzLmRhdGUpKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRMYXN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBkZWNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0SG91cnMoKSAtIDE7XHJcbiAgICAgICAgICAgICAgICBpZiAobnVtIDwgMCkgbnVtID0gMjM7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnMobnVtKTtcclxuICAgICAgICAgICAgICAgIC8vIERheSBMaWdodCBTYXZpbmdzIEFkanVzdG1lbnRcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmRhdGUuZ2V0SG91cnMoKSAhPT0gbnVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldEhvdXJzKG51bSAtIDEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IHdoaWxlICghdGhpcy5vcHRpb25zLmlzSG91clNlbGVjdGFibGUodGhpcy5kYXRlKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAoL15cXGR7MSwyfSQvLnRlc3QocGFydGlhbCkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBwYWRkZWQgPSB0aGlzLnBhZChwYXJ0aWFsKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHBhZGRlZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKHZhbHVlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldExhc3QoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnMocGFyc2VJbnQodmFsdWUsIDEwKSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldExhc3QoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXRIb3VycygpID4gMiA/IDEgOiAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBMZXZlbC5IT1VSO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXigoKDB8MSlbMC05XSl8KDJbMC0zXSkpJC87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFkKHRoaXMuZGF0ZS5nZXRIb3VycygpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIE1pbGl0YXJ5SG91ciBleHRlbmRzIFBhZGRlZE1pbGl0YXJ5SG91ciB7XHJcbiAgICAgICAgY29uc3RydWN0b3Iob3B0aW9uczpJT3B0aW9ucykgeyBzdXBlcihvcHRpb25zKTsgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICgvXlxcZHsxLDJ9JC8udGVzdChwYXJ0aWFsKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHRyaW1tZWQgPSB0aGlzLnRyaW0ocGFydGlhbCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0cmltbWVkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eKCgxP1swLTldKXwoMlswLTNdKSkkLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldEhvdXJzKCkudG9TdHJpbmcoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIFBhZGRlZEhvdXIgZXh0ZW5kcyBQYWRkZWRNaWxpdGFyeUhvdXIge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6SU9wdGlvbnMpIHsgc3VwZXIob3B0aW9ucyk7IH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICBsZXQgcGFkZGVkID0gdGhpcy5wYWQocGFydGlhbCA9PT0gJzAnID8gJzEnIDogcGFydGlhbCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHBhZGRlZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBudW0gPSBwYXJzZUludCh2YWx1ZSwgMTApO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZGF0ZS5nZXRIb3VycygpIDwgMTIgJiYgbnVtID09PSAxMikgbnVtID0gMDtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmRhdGUuZ2V0SG91cnMoKSA+IDExICYmIG51bSAhPT0gMTIpIG51bSArPSAxMjtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3VycyhudW0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRMYXN0KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eKDBbMS05XSl8KDFbMC0yXSkkLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlSW50KHRoaXMudG9TdHJpbmcoKSwgMTApID4gMSA/IDEgOiAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhZCh0aGlzLmdldEhvdXJzKHRoaXMuZGF0ZSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgSG91ciBleHRlbmRzIFBhZGRlZEhvdXIge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6SU9wdGlvbnMpIHsgc3VwZXIob3B0aW9ucyk7IH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICBsZXQgdHJpbW1lZCA9IHRoaXMudHJpbShwYXJ0aWFsID09PSAnMCcgPyAnMScgOiBwYXJ0aWFsKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUodHJpbW1lZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eWzEtOV18KDFbMC0yXSkkLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50cmltKHN1cGVyLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgUGFkZGVkTWludXRlIGV4dGVuZHMgRGF0ZVBhcnQge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6SU9wdGlvbnMpIHsgc3VwZXIob3B0aW9ucyk7IH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgaW5jcmVtZW50KCkge1xyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldE1pbnV0ZXMoKSArIDE7XHJcbiAgICAgICAgICAgICAgICBpZiAobnVtID4gNTkpIG51bSA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0TWludXRlcyhudW0pO1xyXG4gICAgICAgICAgICB9IHdoaWxlICghdGhpcy5vcHRpb25zLmlzTWludXRlU2VsZWN0YWJsZSh0aGlzLmRhdGUpKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRMYXN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBkZWNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0TWludXRlcygpIC0gMTtcclxuICAgICAgICAgICAgICAgIGlmIChudW0gPCAwKSBudW0gPSA1OTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRNaW51dGVzKG51bSk7XHJcbiAgICAgICAgICAgIH0gd2hpbGUgKCF0aGlzLm9wdGlvbnMuaXNNaW51dGVTZWxlY3RhYmxlKHRoaXMuZGF0ZSkpO1xyXG4gICAgICAgICAgICB0aGlzLnNldExhc3QoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUodGhpcy5wYWQocGFydGlhbCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKHZhbHVlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldExhc3QoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0TWludXRlcyhwYXJzZUludCh2YWx1ZSwgMTApKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXlswLTVdWzAtOV0kLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXRNaW51dGVzKCkgPiA1ID8gMSA6IDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIExldmVsLk1JTlVURTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYWQodGhpcy5kYXRlLmdldE1pbnV0ZXMoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBNaW51dGUgZXh0ZW5kcyBQYWRkZWRNaW51dGUge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6SU9wdGlvbnMpIHsgc3VwZXIob3B0aW9ucyk7IH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0aGlzLnRyaW0ocGFydGlhbCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXlswLTVdP1swLTldJC87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXRNaW51dGVzKCkudG9TdHJpbmcoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIFBhZGRlZFNlY29uZCBleHRlbmRzIERhdGVQYXJ0IHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihvcHRpb25zOklPcHRpb25zKSB7IHN1cGVyKG9wdGlvbnMpOyB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGluY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRTZWNvbmRzKCkgKyAxO1xyXG4gICAgICAgICAgICAgICAgaWYgKG51bSA+IDU5KSBudW0gPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldFNlY29uZHMobnVtKTtcclxuICAgICAgICAgICAgfSB3aGlsZSAoIXRoaXMub3B0aW9ucy5pc1NlY29uZFNlbGVjdGFibGUodGhpcy5kYXRlKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZGVjcmVtZW50KCkge1xyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldFNlY29uZHMoKSAtIDE7XHJcbiAgICAgICAgICAgICAgICBpZiAobnVtIDwgMCkgbnVtID0gNTk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0U2Vjb25kcyhudW0pOyAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgfSB3aGlsZSAoIXRoaXMub3B0aW9ucy5pc1NlY29uZFNlbGVjdGFibGUodGhpcy5kYXRlKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0aGlzLnBhZChwYXJ0aWFsKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRTZWNvbmRzKHBhcnNlSW50KHZhbHVlLCAxMCkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRMYXN0KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eWzAtNV1bMC05XSQvO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TWF4QnVmZmVyKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldFNlY29uZHMoKSA+IDUgPyAxIDogMjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldExldmVsKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTGV2ZWwuU0VDT05EO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhZCh0aGlzLmRhdGUuZ2V0U2Vjb25kcygpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIFNlY29uZCBleHRlbmRzIFBhZGRlZFNlY29uZCB7XHJcbiAgICAgICAgY29uc3RydWN0b3Iob3B0aW9uczpJT3B0aW9ucykgeyBzdXBlcihvcHRpb25zKTsgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHRoaXMudHJpbShwYXJ0aWFsKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eWzAtNV0/WzAtOV0kLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldFNlY29uZHMoKS50b1N0cmluZygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgVXBwZXJjYXNlTWVyaWRpZW0gZXh0ZW5kcyBEYXRlUGFydCB7XHJcbiAgICAgICAgY29uc3RydWN0b3Iob3B0aW9uczpJT3B0aW9ucykgeyBzdXBlcihvcHRpb25zKTsgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBpbmNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0SG91cnMoKSArIDEyO1xyXG4gICAgICAgICAgICBpZiAobnVtID4gMjMpIG51bSAtPSAyNDtcclxuICAgICAgICAgICAgdGhpcy5kYXRlLnNldEhvdXJzKG51bSk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaXNIb3VyU2VsZWN0YWJsZSh0aGlzLmRhdGUpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldExhc3QoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVjcmVtZW50KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGRlY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRIb3VycygpIC0gMTI7XHJcbiAgICAgICAgICAgIGlmIChudW0gPCAwKSBudW0gKz0gMjQ7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3VycyhudW0pO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmlzSG91clNlbGVjdGFibGUodGhpcy5kYXRlKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRMYXN0KCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmluY3JlbWVudCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICgvXigoQU0/KXwoUE0/KSkkL2kudGVzdChwYXJ0aWFsKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUocGFydGlhbFswXSA9PT0gJ0EnID8gJ0FNJyA6ICdQTScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRMYXN0KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHRoaXMuZ2V0UmVnRXgoKS50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlLnRvTG93ZXJDYXNlKCkgPT09ICdhbScgJiYgdGhpcy5kYXRlLmdldEhvdXJzKCkgPiAxMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3Vycyh0aGlzLmRhdGUuZ2V0SG91cnMoKSAtIDEyKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWUudG9Mb3dlckNhc2UoKSA9PT0gJ3BtJyAmJiB0aGlzLmRhdGUuZ2V0SG91cnMoKSA8IDEyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldEhvdXJzKHRoaXMuZGF0ZS5nZXRIb3VycygpICsgMTIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRMYXN0KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIExldmVsLkhPVVI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXigoYW0pfChwbSkpJC9pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE1lcmlkaWVtKHRoaXMuZGF0ZSkudG9VcHBlckNhc2UoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIExvd2VyY2FzZU1lcmlkaWVtIGV4dGVuZHMgVXBwZXJjYXNlTWVyaWRpZW0ge1xyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0TWVyaWRpZW0odGhpcy5kYXRlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxldCBmb3JtYXRCbG9ja3M6eyBba2V5OnN0cmluZ106IG5ldyAob3B0aW9uczpJT3B0aW9ucykgPT4gSURhdGVQYXJ0OyB9ID0ge307XHJcbiAgICBcclxuICAgIGZvcm1hdEJsb2Nrc1snWVlZWSddID0gRm91ckRpZ2l0WWVhcjtcclxuICAgIGZvcm1hdEJsb2Nrc1snWVknXSA9IFR3b0RpZ2l0WWVhcjtcclxuICAgIGZvcm1hdEJsb2Nrc1snTU1NTSddID0gTG9uZ01vbnRoTmFtZTtcclxuICAgIGZvcm1hdEJsb2Nrc1snTU1NJ10gPSBTaG9ydE1vbnRoTmFtZTtcclxuICAgIGZvcm1hdEJsb2Nrc1snTU0nXSA9IFBhZGRlZE1vbnRoO1xyXG4gICAgZm9ybWF0QmxvY2tzWydNJ10gPSBNb250aDtcclxuICAgIGZvcm1hdEJsb2Nrc1snREQnXSA9IFBhZGRlZERhdGU7XHJcbiAgICBmb3JtYXRCbG9ja3NbJ0RvJ10gPSBEYXRlT3JkaW5hbDtcclxuICAgIGZvcm1hdEJsb2Nrc1snRCddID0gRGF0ZU51bWVyYWw7XHJcbiAgICBmb3JtYXRCbG9ja3NbJ2RkZGQnXSA9IExvbmdEYXlOYW1lO1xyXG4gICAgZm9ybWF0QmxvY2tzWydkZGQnXSA9IFNob3J0RGF5TmFtZTtcclxuICAgIGZvcm1hdEJsb2Nrc1snSEgnXSA9IFBhZGRlZE1pbGl0YXJ5SG91cjtcclxuICAgIGZvcm1hdEJsb2Nrc1snaGgnXSA9IFBhZGRlZEhvdXI7XHJcbiAgICBmb3JtYXRCbG9ja3NbJ0gnXSA9IE1pbGl0YXJ5SG91cjtcclxuICAgIGZvcm1hdEJsb2Nrc1snaCddID0gSG91cjtcclxuICAgIGZvcm1hdEJsb2Nrc1snQSddID0gVXBwZXJjYXNlTWVyaWRpZW07XHJcbiAgICBmb3JtYXRCbG9ja3NbJ2EnXSA9IExvd2VyY2FzZU1lcmlkaWVtO1xyXG4gICAgZm9ybWF0QmxvY2tzWydtbSddID0gUGFkZGVkTWludXRlO1xyXG4gICAgZm9ybWF0QmxvY2tzWydtJ10gPSBNaW51dGU7XHJcbiAgICBmb3JtYXRCbG9ja3NbJ3NzJ10gPSBQYWRkZWRTZWNvbmQ7XHJcbiAgICBmb3JtYXRCbG9ja3NbJ3MnXSA9IFNlY29uZDtcclxuICAgIFxyXG4gICAgcmV0dXJuIGZvcm1hdEJsb2NrcztcclxufSkoKTtcclxuXHJcblxyXG4iLCJjbGFzcyBJbnB1dCB7XHJcbiAgICBwcml2YXRlIG9wdGlvbnM6IElPcHRpb25zO1xyXG4gICAgcHJpdmF0ZSBzZWxlY3RlZERhdGVQYXJ0OiBJRGF0ZVBhcnQ7XHJcbiAgICBwcml2YXRlIHRleHRCdWZmZXI6IHN0cmluZyA9IFwiXCI7XHJcbiAgICBwdWJsaWMgZGF0ZVBhcnRzOiBJRGF0ZVBhcnRbXTtcclxuICAgIHB1YmxpYyBmb3JtYXQ6IFJlZ0V4cDtcclxuICAgIHByaXZhdGUgZGF0ZTpEYXRlO1xyXG4gICAgcHJpdmF0ZSBsZXZlbDpMZXZlbDtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IocHVibGljIGVsZW1lbnQ6IEhUTUxJbnB1dEVsZW1lbnQpIHtcclxuICAgICAgICBuZXcgS2V5Ym9hcmRFdmVudEhhbmRsZXIodGhpcyk7XHJcbiAgICAgICAgbmV3IE1vdXNlRXZlbnRIYW5kbGVyKHRoaXMpO1xyXG4gICAgICAgIG5ldyBQYXN0ZUV2ZW50SGFuZGVyKHRoaXMpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi52aWV3Y2hhbmdlZChlbGVtZW50LCAoZSkgPT4gdGhpcy52aWV3Y2hhbmdlZChlLmRhdGUsIGUubGV2ZWwsIGUudXBkYXRlKSk7XHJcbiAgICAgICAgbGlzdGVuLmJsdXIoZWxlbWVudCwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmJsdXJEYXRlUGFydCh0aGlzLnNlbGVjdGVkRGF0ZVBhcnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0TGV2ZWxzKCk6TGV2ZWxbXSB7XHJcbiAgICAgICAgbGV0IGxldmVsczpMZXZlbFtdID0gW107XHJcbiAgICAgICAgdGhpcy5kYXRlUGFydHMuZm9yRWFjaCgoZGF0ZVBhcnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKGxldmVscy5pbmRleE9mKGRhdGVQYXJ0LmdldExldmVsKCkpID09PSAtMSAmJiBkYXRlUGFydC5pc1NlbGVjdGFibGUoKSkge1xyXG4gICAgICAgICAgICAgICAgbGV2ZWxzLnB1c2goZGF0ZVBhcnQuZ2V0TGV2ZWwoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gbGV2ZWxzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0VGV4dEJ1ZmZlcigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy50ZXh0QnVmZmVyO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgc2V0VGV4dEJ1ZmZlcihuZXdCdWZmZXI6c3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy50ZXh0QnVmZmVyID0gbmV3QnVmZmVyO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLnRleHRCdWZmZXIubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZURhdGVGcm9tQnVmZmVyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdXBkYXRlRGF0ZUZyb21CdWZmZXIoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWREYXRlUGFydC5zZXRWYWx1ZUZyb21QYXJ0aWFsKHRoaXMudGV4dEJ1ZmZlcikpIHtcclxuICAgICAgICAgICAgbGV0IG5ld0RhdGUgPSB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQuZ2V0VmFsdWUoKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnRleHRCdWZmZXIubGVuZ3RoID49IHRoaXMuc2VsZWN0ZWREYXRlUGFydC5nZXRNYXhCdWZmZXIoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy50ZXh0QnVmZmVyID0gJyc7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJsdXJEYXRlUGFydCh0aGlzLnNlbGVjdGVkRGF0ZVBhcnQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZERhdGVQYXJ0ID0gdGhpcy5nZXROZXh0U2VsZWN0YWJsZURhdGVQYXJ0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRyaWdnZXIuZ290byh0aGlzLmVsZW1lbnQsIHtcclxuICAgICAgICAgICAgICAgIGRhdGU6IG5ld0RhdGUsXHJcbiAgICAgICAgICAgICAgICBsZXZlbDogdGhpcy5zZWxlY3RlZERhdGVQYXJ0LmdldExldmVsKClcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy50ZXh0QnVmZmVyID0gdGhpcy50ZXh0QnVmZmVyLnNsaWNlKDAsIC0xKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRGaXJzdFNlbGVjdGFibGVEYXRlUGFydCgpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZGF0ZVBhcnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGVQYXJ0c1tpXS5pc1NlbGVjdGFibGUoKSlcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGVQYXJ0c1tpXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZvaWQgMDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0TGFzdFNlbGVjdGFibGVEYXRlUGFydCgpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gdGhpcy5kYXRlUGFydHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZGF0ZVBhcnRzW2ldLmlzU2VsZWN0YWJsZSgpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZVBhcnRzW2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdm9pZCAwO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0TmV4dFNlbGVjdGFibGVEYXRlUGFydCgpIHtcclxuICAgICAgICBsZXQgaSA9IHRoaXMuZGF0ZVBhcnRzLmluZGV4T2YodGhpcy5zZWxlY3RlZERhdGVQYXJ0KTtcclxuICAgICAgICB3aGlsZSAoKytpIDwgdGhpcy5kYXRlUGFydHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGVQYXJ0c1tpXS5pc1NlbGVjdGFibGUoKSlcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGVQYXJ0c1tpXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWREYXRlUGFydDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldFByZXZpb3VzU2VsZWN0YWJsZURhdGVQYXJ0KCkge1xyXG4gICAgICAgIGxldCBpID0gdGhpcy5kYXRlUGFydHMuaW5kZXhPZih0aGlzLnNlbGVjdGVkRGF0ZVBhcnQpO1xyXG4gICAgICAgIHdoaWxlICgtLWkgPj0gMCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kYXRlUGFydHNbaV0uaXNTZWxlY3RhYmxlKCkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlUGFydHNbaV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQ7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXROZWFyZXN0U2VsZWN0YWJsZURhdGVQYXJ0KGNhcmV0UG9zaXRpb246IG51bWJlcikge1xyXG4gICAgICAgIGxldCBkaXN0YW5jZTpudW1iZXIgPSBOdW1iZXIuTUFYX1ZBTFVFO1xyXG4gICAgICAgIGxldCBuZWFyZXN0RGF0ZVBhcnQ6SURhdGVQYXJ0O1xyXG4gICAgICAgIGxldCBzdGFydCA9IDA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmRhdGVQYXJ0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgZGF0ZVBhcnQgPSB0aGlzLmRhdGVQYXJ0c1tpXTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChkYXRlUGFydC5pc1NlbGVjdGFibGUoKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGZyb21MZWZ0ID0gY2FyZXRQb3NpdGlvbiAtIHN0YXJ0O1xyXG4gICAgICAgICAgICAgICAgbGV0IGZyb21SaWdodCA9IGNhcmV0UG9zaXRpb24gLSAoc3RhcnQgKyBkYXRlUGFydC50b1N0cmluZygpLmxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGlmIChmcm9tTGVmdCA+IDAgJiYgZnJvbVJpZ2h0IDwgMCkgcmV0dXJuIGRhdGVQYXJ0O1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBsZXQgZCA9IE1hdGgubWluKE1hdGguYWJzKGZyb21MZWZ0KSwgTWF0aC5hYnMoZnJvbVJpZ2h0KSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZCA8PSBkaXN0YW5jZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5lYXJlc3REYXRlUGFydCA9IGRhdGVQYXJ0O1xyXG4gICAgICAgICAgICAgICAgICAgIGRpc3RhbmNlID0gZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgc3RhcnQgKz0gZGF0ZVBhcnQudG9TdHJpbmcoKS5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiBuZWFyZXN0RGF0ZVBhcnQ7ICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHNldFNlbGVjdGVkRGF0ZVBhcnQoZGF0ZVBhcnQ6SURhdGVQYXJ0KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWREYXRlUGFydCAhPT0gZGF0ZVBhcnQpIHtcclxuICAgICAgICAgICAgdGhpcy50ZXh0QnVmZmVyID0gJyc7XHJcbiAgICAgICAgICAgIGxldCBsYXN0U2VsZWN0ZWQgPSB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQ7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWREYXRlUGFydCA9IGRhdGVQYXJ0O1xyXG4gICAgICAgICAgICB0aGlzLmJsdXJEYXRlUGFydChsYXN0U2VsZWN0ZWQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGJsdXJEYXRlUGFydChkYXRlUGFydDpJRGF0ZVBhcnQpIHtcclxuICAgICAgICAvKlxyXG4gICAgICAgIGlmIChkYXRlUGFydCA9PT0gdm9pZCAwKSByZXR1cm47XHJcbiAgICAgICAgbGV0IGxhc3REYXRlID0gZGF0ZVBhcnQuZ2V0TGFzdFZhbHVlKCkgfHwgbmV3IERhdGUoKTtcclxuICAgICAgICBsZXQgbmV3RGF0ZSA9IGRhdGVQYXJ0LmdldFZhbHVlKCk7XHJcbiAgICAgICAgbGV0IHRyYW5zZm9ybWVkRGF0ZSA9IG5ldyBEYXRlKG5ld0RhdGUudmFsdWVPZigpKTtcclxuICAgICAgICBzd2l0Y2goZGF0ZVBhcnQuZ2V0TGV2ZWwoKSkge1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLllFQVI6XHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1lZERhdGUgPSB0aGlzLm9wdGlvbnMuaXNZZWFyU2VsZWN0YWJsZShuZXdEYXRlLCBsYXN0RGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5NT05USDpcclxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybWVkRGF0ZSA9IHRoaXMub3B0aW9ucy5pc01vbnRoU2VsZWN0YWJsZShuZXdEYXRlLCBsYXN0RGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5EQVRFOlxyXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtZWREYXRlID0gdGhpcy5vcHRpb25zLmlzRGF0ZVNlbGVjdGFibGUobmV3RGF0ZSwgbGFzdERhdGUpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuSE9VUjpcclxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybWVkRGF0ZSA9IHRoaXMub3B0aW9ucy5pc0hvdXJTZWxlY3RhYmxlKG5ld0RhdGUsIGxhc3REYXRlKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLk1JTlVURTpcclxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybWVkRGF0ZSA9IHRoaXMub3B0aW9ucy5pc01pbnV0ZVNlbGVjdGFibGUobmV3RGF0ZSwgbGFzdERhdGUpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuU0VDT05EOlxyXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtZWREYXRlID0gdGhpcy5vcHRpb25zLmlzU2Vjb25kU2VsZWN0YWJsZShuZXdEYXRlLCBsYXN0RGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG5ld0RhdGUudmFsdWVPZigpICE9PSB0cmFuc2Zvcm1lZERhdGUudmFsdWVPZigpKSB7XHJcbiAgICAgICAgICAgIHRyaWdnZXIuZ290byh0aGlzLmVsZW1lbnQsIHtcclxuICAgICAgICAgICAgICAgIGxldmVsOiB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQuZ2V0TGV2ZWwoKSxcclxuICAgICAgICAgICAgICAgIGRhdGU6IHRyYW5zZm9ybWVkRGF0ZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgKi9cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldFNlbGVjdGVkRGF0ZVBhcnQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWREYXRlUGFydDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHVwZGF0ZU9wdGlvbnMob3B0aW9uczpJT3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5kYXRlUGFydHMgPSBQYXJzZXIucGFyc2Uob3B0aW9ucyk7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZERhdGVQYXJ0ID0gdm9pZCAwO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBmb3JtYXQ6c3RyaW5nID0gJ14nO1xyXG4gICAgICAgIHRoaXMuZGF0ZVBhcnRzLmZvckVhY2goKGRhdGVQYXJ0KSA9PiB7XHJcbiAgICAgICAgICAgIGZvcm1hdCArPSBgKCR7ZGF0ZVBhcnQuZ2V0UmVnRXgoKS5zb3VyY2Uuc2xpY2UoMSwtMSl9KWA7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5mb3JtYXQgPSBuZXcgUmVnRXhwKGZvcm1hdCsnJCcsICdpJyk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICB0aGlzLnZpZXdjaGFuZ2VkKHRoaXMuZGF0ZSwgdGhpcy5sZXZlbCwgdHJ1ZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB1cGRhdGVWaWV3KCkge1xyXG4gICAgICAgIGxldCBkYXRlU3RyaW5nID0gJyc7XHJcbiAgICAgICAgdGhpcy5kYXRlUGFydHMuZm9yRWFjaCgoZGF0ZVBhcnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKGRhdGVQYXJ0LmdldFZhbHVlKCkgPT09IHZvaWQgMCkgcmV0dXJuO1xyXG4gICAgICAgICAgICBkYXRlU3RyaW5nICs9IGRhdGVQYXJ0LnRvU3RyaW5nKCk7IFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC52YWx1ZSA9IGRhdGVTdHJpbmc7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWREYXRlUGFydCA9PT0gdm9pZCAwKSByZXR1cm47XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHN0YXJ0ID0gMDtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgaSA9IDA7XHJcbiAgICAgICAgd2hpbGUgKHRoaXMuZGF0ZVBhcnRzW2ldICE9PSB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQpIHtcclxuICAgICAgICAgICAgc3RhcnQgKz0gdGhpcy5kYXRlUGFydHNbaSsrXS50b1N0cmluZygpLmxlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGVuZCA9IHN0YXJ0ICsgdGhpcy5zZWxlY3RlZERhdGVQYXJ0LnRvU3RyaW5nKCkubGVuZ3RoO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZShzdGFydCwgZW5kKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHZpZXdjaGFuZ2VkKGRhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWwsIHVwZGF0ZT86Ym9vbGVhbikgeyBcclxuICAgICAgICB0aGlzLmRhdGUgPSBkYXRlO1xyXG4gICAgICAgIHRoaXMubGV2ZWwgPSBsZXZlbDsgICAgICAgXHJcbiAgICAgICAgdGhpcy5kYXRlUGFydHMuZm9yRWFjaCgoZGF0ZVBhcnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHVwZGF0ZSkgZGF0ZVBhcnQuc2V0VmFsdWUoZGF0ZSk7XHJcbiAgICAgICAgICAgIGlmIChkYXRlUGFydC5pc1NlbGVjdGFibGUoKSAmJlxyXG4gICAgICAgICAgICAgICAgZGF0ZVBhcnQuZ2V0TGV2ZWwoKSA9PT0gbGV2ZWwgJiZcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0U2VsZWN0ZWREYXRlUGFydCgpICE9PSB2b2lkIDAgJiZcclxuICAgICAgICAgICAgICAgIGxldmVsICE9PSB0aGlzLmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5nZXRMZXZlbCgpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFNlbGVjdGVkRGF0ZVBhcnQoZGF0ZVBhcnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVWaWV3KCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB0cmlnZ2VyVmlld0NoYW5nZSgpIHtcclxuICAgICAgICB0cmlnZ2VyLnZpZXdjaGFuZ2VkKHRoaXMuZWxlbWVudCwge1xyXG4gICAgICAgICAgICBkYXRlOiB0aGlzLmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5nZXRWYWx1ZSgpLFxyXG4gICAgICAgICAgICBsZXZlbDogdGhpcy5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0TGV2ZWwoKVxyXG4gICAgICAgIH0pOyAgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxufSIsImNvbnN0IGVudW0gS0VZIHtcclxuICAgIFJJR0hUID0gMzksIExFRlQgPSAzNywgVEFCID0gOSwgVVAgPSAzOCxcclxuICAgIERPV04gPSA0MCwgViA9IDg2LCBDID0gNjcsIEEgPSA2NSwgSE9NRSA9IDM2LFxyXG4gICAgRU5EID0gMzUsIEJBQ0tTUEFDRSA9IDhcclxufVxyXG5cclxuY2xhc3MgS2V5Ym9hcmRFdmVudEhhbmRsZXIge1xyXG4gICAgcHJpdmF0ZSBzaGlmdFRhYkRvd24gPSBmYWxzZTtcclxuICAgIHByaXZhdGUgdGFiRG93biA9IGZhbHNlO1xyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGlucHV0OklucHV0KSB7XHJcbiAgICAgICAgaW5wdXQuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoZSkgPT4gdGhpcy5rZXlkb3duKGUpKTtcclxuICAgICAgICBpbnB1dC5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJmb2N1c1wiLCAoKSA9PiB0aGlzLmZvY3VzKCkpO1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIChlKSA9PiB0aGlzLmRvY3VtZW50S2V5ZG93bihlKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBmb2N1cyA9ICgpOnZvaWQgPT4ge1xyXG4gICAgICAgIGlmICh0aGlzLnRhYkRvd24pIHtcclxuICAgICAgICAgICAgbGV0IGZpcnN0ID0gdGhpcy5pbnB1dC5nZXRGaXJzdFNlbGVjdGFibGVEYXRlUGFydCgpO1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQoZmlyc3QpO1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgdGhpcy5pbnB1dC50cmlnZ2VyVmlld0NoYW5nZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc2hpZnRUYWJEb3duKSB7XHJcbiAgICAgICAgICAgIGxldCBsYXN0ID0gdGhpcy5pbnB1dC5nZXRMYXN0U2VsZWN0YWJsZURhdGVQYXJ0KCk7XHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChsYXN0KTtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgIHRoaXMuaW5wdXQudHJpZ2dlclZpZXdDaGFuZ2UoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGRvY3VtZW50S2V5ZG93bihlOktleWJvYXJkRXZlbnQpIHtcclxuICAgICAgICBpZiAoZS5zaGlmdEtleSAmJiBlLmtleUNvZGUgPT09IEtFWS5UQUIpIHtcclxuICAgICAgICAgICAgdGhpcy5zaGlmdFRhYkRvd24gPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZS5rZXlDb2RlID09PSBLRVkuVEFCKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGFiRG93biA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnNoaWZ0VGFiRG93biA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLnRhYkRvd24gPSBmYWxzZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBrZXlkb3duKGU6S2V5Ym9hcmRFdmVudCkge1xyXG4gICAgICAgIGxldCBjb2RlID0gZS5rZXlDb2RlO1xyXG4gICAgICAgIGlmIChjb2RlID49IDk2ICYmIGNvZGUgPD0gMTA1KSB7XHJcbiAgICAgICAgICAgIGNvZGUgLT0gNDg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICgoY29kZSA9PT0gS0VZLkhPTUUgfHwgY29kZSA9PT0gS0VZLkVORCkgJiYgZS5zaGlmdEtleSkgcmV0dXJuO1xyXG4gICAgICAgIGlmICgoY29kZSA9PT0gS0VZLkxFRlQgfHwgY29kZSA9PT0gS0VZLlJJR0hUKSAmJiBlLnNoaWZ0S2V5KSByZXR1cm47XHJcbiAgICAgICAgaWYgKChjb2RlID09PSBLRVkuQyB8fCBjb2RlID09PSBLRVkuQSB8fCBjb2RlID09PSBLRVkuVikgJiYgZS5jdHJsS2V5KSByZXR1cm47XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHByZXZlbnREZWZhdWx0ID0gdHJ1ZTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoY29kZSA9PT0gS0VZLkhPTUUpIHtcclxuICAgICAgICAgICAgdGhpcy5ob21lKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb2RlID09PSBLRVkuRU5EKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZW5kKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb2RlID09PSBLRVkuTEVGVCkge1xyXG4gICAgICAgICAgICB0aGlzLmxlZnQoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IEtFWS5SSUdIVCkge1xyXG4gICAgICAgICAgICB0aGlzLnJpZ2h0KCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb2RlID09PSBLRVkuVEFCICYmIGUuc2hpZnRLZXkpIHtcclxuICAgICAgICAgICAgcHJldmVudERlZmF1bHQgPSB0aGlzLnNoaWZ0VGFiKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb2RlID09PSBLRVkuVEFCKSB7XHJcbiAgICAgICAgICAgIHByZXZlbnREZWZhdWx0ID0gdGhpcy50YWIoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IEtFWS5VUCkge1xyXG4gICAgICAgICAgICB0aGlzLnVwKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb2RlID09PSBLRVkuRE9XTikge1xyXG4gICAgICAgICAgICB0aGlzLmRvd24oKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHByZXZlbnREZWZhdWx0KSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGtleVByZXNzZWQgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGNvZGUpO1xyXG4gICAgICAgIGlmICgvXlswLTldfFtBLXpdJC8udGVzdChrZXlQcmVzc2VkKSkge1xyXG4gICAgICAgICAgICBsZXQgdGV4dEJ1ZmZlciA9IHRoaXMuaW5wdXQuZ2V0VGV4dEJ1ZmZlcigpO1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0LnNldFRleHRCdWZmZXIodGV4dEJ1ZmZlciArIGtleVByZXNzZWQpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gS0VZLkJBQ0tTUEFDRSkge1xyXG4gICAgICAgICAgICBsZXQgdGV4dEJ1ZmZlciA9IHRoaXMuaW5wdXQuZ2V0VGV4dEJ1ZmZlcigpO1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0LnNldFRleHRCdWZmZXIodGV4dEJ1ZmZlci5zbGljZSgwLCAtMSkpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoIWUuc2hpZnRLZXkpIHtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC5zZXRUZXh0QnVmZmVyKCcnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgaG9tZSgpIHtcclxuICAgICAgICBsZXQgZmlyc3QgPSB0aGlzLmlucHV0LmdldEZpcnN0U2VsZWN0YWJsZURhdGVQYXJ0KCk7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5zZXRTZWxlY3RlZERhdGVQYXJ0KGZpcnN0KTtcclxuICAgICAgICB0aGlzLmlucHV0LnRyaWdnZXJWaWV3Q2hhbmdlKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgZW5kKCkge1xyXG4gICAgICAgIGxldCBsYXN0ID0gdGhpcy5pbnB1dC5nZXRMYXN0U2VsZWN0YWJsZURhdGVQYXJ0KCk7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5zZXRTZWxlY3RlZERhdGVQYXJ0KGxhc3QpOyAgICAgXHJcbiAgICAgICAgdGhpcy5pbnB1dC50cmlnZ2VyVmlld0NoYW5nZSgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGxlZnQoKSB7XHJcbiAgICAgICAgbGV0IHByZXZpb3VzID0gdGhpcy5pbnB1dC5nZXRQcmV2aW91c1NlbGVjdGFibGVEYXRlUGFydCgpO1xyXG4gICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChwcmV2aW91cyk7XHJcbiAgICAgICAgdGhpcy5pbnB1dC50cmlnZ2VyVmlld0NoYW5nZSgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHJpZ2h0KCkge1xyXG4gICAgICAgIGxldCBuZXh0ID0gdGhpcy5pbnB1dC5nZXROZXh0U2VsZWN0YWJsZURhdGVQYXJ0KCk7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5zZXRTZWxlY3RlZERhdGVQYXJ0KG5leHQpO1xyXG4gICAgICAgIHRoaXMuaW5wdXQudHJpZ2dlclZpZXdDaGFuZ2UoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBzaGlmdFRhYigpIHtcclxuICAgICAgICBsZXQgcHJldmlvdXMgPSB0aGlzLmlucHV0LmdldFByZXZpb3VzU2VsZWN0YWJsZURhdGVQYXJ0KCk7XHJcbiAgICAgICAgaWYgKHByZXZpb3VzICE9PSB0aGlzLmlucHV0LmdldFNlbGVjdGVkRGF0ZVBhcnQoKSkge1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQocHJldmlvdXMpO1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0LnRyaWdnZXJWaWV3Q2hhbmdlKCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgdGFiKCkge1xyXG4gICAgICAgIGxldCBuZXh0ID0gdGhpcy5pbnB1dC5nZXROZXh0U2VsZWN0YWJsZURhdGVQYXJ0KCk7XHJcbiAgICAgICAgaWYgKG5leHQgIT09IHRoaXMuaW5wdXQuZ2V0U2VsZWN0ZWREYXRlUGFydCgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChuZXh0KTtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC50cmlnZ2VyVmlld0NoYW5nZSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHVwKCkge1xyXG4gICAgICAgIHRoaXMuaW5wdXQuZ2V0U2VsZWN0ZWREYXRlUGFydCgpLmluY3JlbWVudCgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBsZXZlbCA9IHRoaXMuaW5wdXQuZ2V0U2VsZWN0ZWREYXRlUGFydCgpLmdldExldmVsKCk7XHJcbiAgICAgICAgbGV0IGRhdGUgPSB0aGlzLmlucHV0LmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5nZXRWYWx1ZSgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRyaWdnZXIuZ290byh0aGlzLmlucHV0LmVsZW1lbnQsIHtcclxuICAgICAgICAgICAgZGF0ZTogZGF0ZSxcclxuICAgICAgICAgICAgbGV2ZWw6IGxldmVsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgZG93bigpIHtcclxuICAgICAgICB0aGlzLmlucHV0LmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5kZWNyZW1lbnQoKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgbGV2ZWwgPSB0aGlzLmlucHV0LmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5nZXRMZXZlbCgpO1xyXG4gICAgICAgIGxldCBkYXRlID0gdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0VmFsdWUoKTtcclxuICAgICAgICBcclxuICAgICAgICB0cmlnZ2VyLmdvdG8odGhpcy5pbnB1dC5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgIGRhdGU6IGRhdGUsXHJcbiAgICAgICAgICAgIGxldmVsOiBsZXZlbFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwiY2xhc3MgTW91c2VFdmVudEhhbmRsZXIge1xyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBpbnB1dDpJbnB1dCkge1xyXG4gICAgICAgIGxpc3Rlbi5tb3VzZWRvd24oaW5wdXQuZWxlbWVudCwgKCkgPT4gdGhpcy5tb3VzZWRvd24oKSk7XHJcbiAgICAgICAgbGlzdGVuLm1vdXNldXAoZG9jdW1lbnQsICgpID0+IHRoaXMubW91c2V1cCgpKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBTdG9wIGRlZmF1bHRcclxuICAgICAgICBpbnB1dC5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnZW50ZXJcIiwgKGUpID0+IGUucHJldmVudERlZmF1bHQoKSk7XHJcbiAgICAgICAgaW5wdXQuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ292ZXJcIiwgKGUpID0+IGUucHJldmVudERlZmF1bHQoKSk7XHJcbiAgICAgICAgaW5wdXQuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiZHJvcFwiLCAoZSkgPT4gZS5wcmV2ZW50RGVmYXVsdCgpKTtcclxuICAgICAgICBpbnB1dC5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjdXRcIiwgKGUpID0+IGUucHJldmVudERlZmF1bHQoKSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgZG93bjpib29sZWFuO1xyXG4gICAgcHJpdmF0ZSBjYXJldFN0YXJ0Om51bWJlcjtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBtb3VzZWRvd24oKSB7XHJcbiAgICAgICAgdGhpcy5kb3duID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmlucHV0LmVsZW1lbnQuc2V0U2VsZWN0aW9uUmFuZ2Uodm9pZCAwLCB2b2lkIDApO1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgIHRoaXMuY2FyZXRTdGFydCA9IHRoaXMuaW5wdXQuZWxlbWVudC5zZWxlY3Rpb25TdGFydDsgXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgbW91c2V1cCA9ICgpID0+IHtcclxuICAgICAgICBpZiAoIXRoaXMuZG93bikgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuZG93biA9IGZhbHNlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBwb3M6bnVtYmVyO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLmlucHV0LmVsZW1lbnQuc2VsZWN0aW9uU3RhcnQgPT09IHRoaXMuY2FyZXRTdGFydCkge1xyXG4gICAgICAgICAgICBwb3MgPSB0aGlzLmlucHV0LmVsZW1lbnQuc2VsZWN0aW9uRW5kO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBvcyA9IHRoaXMuaW5wdXQuZWxlbWVudC5zZWxlY3Rpb25TdGFydDtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGJsb2NrID0gdGhpcy5pbnB1dC5nZXROZWFyZXN0U2VsZWN0YWJsZURhdGVQYXJ0KHBvcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5pbnB1dC5zZXRTZWxlY3RlZERhdGVQYXJ0KGJsb2NrKTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAodGhpcy5pbnB1dC5lbGVtZW50LnNlbGVjdGlvblN0YXJ0ID4gMCB8fCB0aGlzLmlucHV0LmVsZW1lbnQuc2VsZWN0aW9uRW5kIDwgdGhpcy5pbnB1dC5lbGVtZW50LnZhbHVlLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0LnRyaWdnZXJWaWV3Q2hhbmdlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSIsImNsYXNzIFBhcnNlciB7XHJcbiAgICBwdWJsaWMgc3RhdGljIHBhcnNlKG9wdGlvbnM6SU9wdGlvbnMpOklEYXRlUGFydFtdIHtcclxuICAgICAgICBsZXQgdGV4dEJ1ZmZlciA9ICcnO1xyXG4gICAgICAgIGxldCBkYXRlUGFydHM6SURhdGVQYXJ0W10gPSBbXTtcclxuICAgIFxyXG4gICAgICAgIGxldCBpbmRleCA9IDA7ICAgICAgICAgICAgICAgIFxyXG4gICAgICAgIGxldCBpbkVzY2FwZWRTZWdtZW50ID0gZmFsc2U7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHB1c2hQbGFpblRleHQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0ZXh0QnVmZmVyLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGRhdGVQYXJ0cy5wdXNoKG5ldyBQbGFpblRleHQodGV4dEJ1ZmZlcikuc2V0U2VsZWN0YWJsZShmYWxzZSkpO1xyXG4gICAgICAgICAgICAgICAgdGV4dEJ1ZmZlciA9ICcnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHdoaWxlIChpbmRleCA8IG9wdGlvbnMuZGlzcGxheUFzLmxlbmd0aCkgeyAgICAgXHJcbiAgICAgICAgICAgIGlmICghaW5Fc2NhcGVkU2VnbWVudCAmJiBvcHRpb25zLmRpc3BsYXlBc1tpbmRleF0gPT09ICdbJykge1xyXG4gICAgICAgICAgICAgICAgaW5Fc2NhcGVkU2VnbWVudCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChpbkVzY2FwZWRTZWdtZW50ICYmIG9wdGlvbnMuZGlzcGxheUFzW2luZGV4XSA9PT0gJ10nKSB7XHJcbiAgICAgICAgICAgICAgICBpbkVzY2FwZWRTZWdtZW50ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChpbkVzY2FwZWRTZWdtZW50KSB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0QnVmZmVyICs9IG9wdGlvbnMuZGlzcGxheUFzW2luZGV4XTtcclxuICAgICAgICAgICAgICAgIGluZGV4Kys7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IGZvdW5kID0gZmFsc2U7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBmb3IgKGxldCBjb2RlIGluIGZvcm1hdEJsb2Nrcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKFBhcnNlci5maW5kQXQob3B0aW9ucy5kaXNwbGF5QXMsIGluZGV4LCBgeyR7Y29kZX19YCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBwdXNoUGxhaW5UZXh0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZVBhcnRzLnB1c2gobmV3IGZvcm1hdEJsb2Nrc1tjb2RlXShvcHRpb25zKS5zZXRTZWxlY3RhYmxlKGZhbHNlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggKz0gY29kZS5sZW5ndGggKyAyO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoUGFyc2VyLmZpbmRBdChvcHRpb25zLmRpc3BsYXlBcywgaW5kZXgsIGNvZGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHVzaFBsYWluVGV4dCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGVQYXJ0cy5wdXNoKG5ldyBmb3JtYXRCbG9ja3NbY29kZV0ob3B0aW9ucykpO1xyXG4gICAgICAgICAgICAgICAgICAgIGluZGV4ICs9IGNvZGUubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKCFmb3VuZCkge1xyXG4gICAgICAgICAgICAgICAgdGV4dEJ1ZmZlciArPSBvcHRpb25zLmRpc3BsYXlBc1tpbmRleF07XHJcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdXNoUGxhaW5UZXh0KCk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICByZXR1cm4gZGF0ZVBhcnRzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHN0YXRpYyBmaW5kQXQgKHN0cjpzdHJpbmcsIGluZGV4Om51bWJlciwgc2VhcmNoOnN0cmluZykge1xyXG4gICAgICAgIHJldHVybiBzdHIuc2xpY2UoaW5kZXgsIGluZGV4ICsgc2VhcmNoLmxlbmd0aCkgPT09IHNlYXJjaDtcclxuICAgIH1cclxufSIsImNsYXNzIFBhc3RlRXZlbnRIYW5kZXIge1xyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBpbnB1dDpJbnB1dCkge1xyXG4gICAgICAgIGxpc3Rlbi5wYXN0ZShpbnB1dC5lbGVtZW50LCAoKSA9PiB0aGlzLnBhc3RlKCkpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHBhc3RlKCkge1xyXG4gICAgICAgIC8vVE9ETyBmaXggdGhpcyBjYXVzZSBpdCdzIG5vdCB3b3JraW5nXHJcbiAgICAgICAgbGV0IG9yaWdpbmFsVmFsdWUgPSB0aGlzLmlucHV0LmVsZW1lbnQudmFsdWU7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgaWYgKCF0aGlzLmlucHV0LmZvcm1hdC50ZXN0KHRoaXMuaW5wdXQuZWxlbWVudC52YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgdGhpcy5pbnB1dC5lbGVtZW50LnZhbHVlID0gb3JpZ2luYWxWYWx1ZTtcclxuICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgIH0gXHJcbiAgICAgICAgICAgXHJcbiAgICAgICAgICAgbGV0IG5ld0RhdGUgPSB0aGlzLmlucHV0LmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5nZXRWYWx1ZSgpO1xyXG4gICAgICAgICAgIFxyXG4gICAgICAgICAgIGxldCBzdHJQcmVmaXggPSAnJztcclxuICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuaW5wdXQuZGF0ZVBhcnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgIGxldCBkYXRlUGFydCA9IHRoaXMuaW5wdXQuZGF0ZVBhcnRzW2ldO1xyXG4gICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgbGV0IHJlZ0V4cCA9IG5ldyBSZWdFeHAoZGF0ZVBhcnQuZ2V0UmVnRXgoKS5zb3VyY2Uuc2xpY2UoMSwgLTEpLCAnaScpO1xyXG4gICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgbGV0IHZhbCA9IHRoaXMuaW5wdXQuZWxlbWVudC52YWx1ZS5yZXBsYWNlKHN0clByZWZpeCwgJycpLm1hdGNoKHJlZ0V4cClbMF07XHJcbiAgICAgICAgICAgICAgIHN0clByZWZpeCArPSB2YWw7XHJcbiAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICBpZiAoIWRhdGVQYXJ0LmlzU2VsZWN0YWJsZSgpKSBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgIGRhdGVQYXJ0LnNldFZhbHVlKG5ld0RhdGUpO1xyXG4gICAgICAgICAgICAgICBpZiAoZGF0ZVBhcnQuc2V0VmFsdWUodmFsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgdGhpcy5pbnB1dC5ibHVyRGF0ZVBhcnQoZGF0ZVBhcnQpO1xyXG4gICAgICAgICAgICAgICAgICAgbmV3RGF0ZSA9IGRhdGVQYXJ0LmdldFZhbHVlKCk7XHJcbiAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAvLyBUT0RPIHNldCBhbGwgZGF0ZXBhcnRzIGJhY2sgdG8gb3JpZ2luYWwgdmFsdWVcclxuICAgICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQuZWxlbWVudC52YWx1ZSA9IG9yaWdpbmFsVmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICB9XHJcbiAgICAgICAgICAgXHJcbiAgICAgICAgICAgdHJpZ2dlci5nb3RvKHRoaXMuaW5wdXQuZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICBkYXRlOiBuZXdEYXRlLFxyXG4gICAgICAgICAgICAgICBsZXZlbDogdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0TGV2ZWwoKVxyXG4gICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwiY29uc3QgZW51bSBTdGVwRGlyZWN0aW9uIHtcclxuICAgIFVQLCBET1dOXHJcbn1cclxuXHJcbmNsYXNzIEhlYWRlciBleHRlbmRzIENvbW1vbiB7XHJcbiAgICBwcml2YXRlIHllYXJMYWJlbDpFbGVtZW50O1xyXG4gICAgcHJpdmF0ZSBtb250aExhYmVsOkVsZW1lbnQ7XHJcbiAgICBwcml2YXRlIGRhdGVMYWJlbDpFbGVtZW50O1xyXG4gICAgcHJpdmF0ZSBob3VyTGFiZWw6RWxlbWVudDtcclxuICAgIHByaXZhdGUgbWludXRlTGFiZWw6RWxlbWVudDtcclxuICAgIHByaXZhdGUgc2Vjb25kTGFiZWw6RWxlbWVudDtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBsYWJlbHM6RWxlbWVudFtdO1xyXG4gICAgXHJcbiAgICBwcml2YXRlIG9wdGlvbnM6SU9wdGlvbnM7XHJcbiAgICBcclxuICAgIHByaXZhdGUgbGV2ZWw6TGV2ZWw7XHJcbiAgICBwcml2YXRlIGRhdGU6RGF0ZTtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBlbGVtZW50OkhUTUxFbGVtZW50LCBwcml2YXRlIGNvbnRhaW5lcjpIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGlzdGVuLnZpZXdjaGFuZ2VkKGVsZW1lbnQsIChlKSA9PiB0aGlzLnZpZXdjaGFuZ2VkKGUuZGF0ZSwgZS5sZXZlbCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMueWVhckxhYmVsID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS15ZWFyJyk7XHJcbiAgICAgICAgdGhpcy5tb250aExhYmVsID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS1tb250aCcpO1xyXG4gICAgICAgIHRoaXMuZGF0ZUxhYmVsID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS1kYXRlJyk7XHJcbiAgICAgICAgdGhpcy5ob3VyTGFiZWwgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcignZGF0aXVtLXNwYW4tbGFiZWwuZGF0aXVtLWhvdXInKTtcclxuICAgICAgICB0aGlzLm1pbnV0ZUxhYmVsID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS1taW51dGUnKTtcclxuICAgICAgICB0aGlzLnNlY29uZExhYmVsID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS1zZWNvbmQnKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmxhYmVscyA9IFt0aGlzLnllYXJMYWJlbCwgdGhpcy5tb250aExhYmVsLCB0aGlzLmRhdGVMYWJlbCwgdGhpcy5ob3VyTGFiZWwsIHRoaXMubWludXRlTGFiZWwsIHRoaXMuc2Vjb25kTGFiZWxdO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBwcmV2aW91c0J1dHRvbiA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdkYXRpdW0tcHJldicpO1xyXG4gICAgICAgIGxldCBuZXh0QnV0dG9uID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1uZXh0Jyk7XHJcbiAgICAgICAgbGV0IHNwYW5MYWJlbENvbnRhaW5lciA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdkYXRpdW0tc3Bhbi1sYWJlbC1jb250YWluZXInKTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4udGFwKHByZXZpb3VzQnV0dG9uLCAoKSA9PiB0aGlzLnByZXZpb3VzKCkpO1xyXG4gICAgICAgIGxpc3Rlbi50YXAobmV4dEJ1dHRvbiwgKCkgPT4gdGhpcy5uZXh0KCkpO1xyXG4gICAgICAgIGxpc3Rlbi50YXAoc3BhbkxhYmVsQ29udGFpbmVyLCAoKSA9PiB0aGlzLnpvb21PdXQoKSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBwcmV2aW91cygpIHtcclxuICAgICAgICB0cmlnZ2VyLmdvdG8odGhpcy5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgZGF0ZTogdGhpcy5zdGVwRGF0ZShTdGVwRGlyZWN0aW9uLkRPV04pLFxyXG4gICAgICAgICAgIGxldmVsOiB0aGlzLmxldmVsLFxyXG4gICAgICAgICAgIHVwZGF0ZTogZmFsc2VcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIG5leHQoKSB7XHJcbiAgICAgICAgdHJpZ2dlci5nb3RvKHRoaXMuZWxlbWVudCwge1xyXG4gICAgICAgICAgIGRhdGU6IHRoaXMuc3RlcERhdGUoU3RlcERpcmVjdGlvbi5VUCksXHJcbiAgICAgICAgICAgbGV2ZWw6IHRoaXMubGV2ZWwsXHJcbiAgICAgICAgICAgdXBkYXRlOiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHpvb21PdXQoKSB7XHJcbiAgICAgICAgdHJpZ2dlci56b29tT3V0KHRoaXMuZWxlbWVudCwge1xyXG4gICAgICAgICAgICBkYXRlOiB0aGlzLmRhdGUsXHJcbiAgICAgICAgICAgIGN1cnJlbnRMZXZlbDogdGhpcy5sZXZlbCxcclxuICAgICAgICAgICAgdXBkYXRlOiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHN0ZXBEYXRlKHN0ZXBUeXBlOlN0ZXBEaXJlY3Rpb24pOkRhdGUge1xyXG4gICAgICAgIGxldCBkYXRlID0gbmV3IERhdGUodGhpcy5kYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgbGV0IGRpcmVjdGlvbiA9IHN0ZXBUeXBlID09PSBTdGVwRGlyZWN0aW9uLlVQID8gMSA6IC0xO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHN3aXRjaCAodGhpcy5sZXZlbCkge1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLllFQVI6XHJcbiAgICAgICAgICAgICAgICBkYXRlLnNldEZ1bGxZZWFyKGRhdGUuZ2V0RnVsbFllYXIoKSArIDEwICogZGlyZWN0aW9uKTsgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLk1PTlRIOlxyXG4gICAgICAgICAgICAgICAgZGF0ZS5zZXRGdWxsWWVhcihkYXRlLmdldEZ1bGxZZWFyKCkgKyBkaXJlY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuREFURTpcclxuICAgICAgICAgICAgICAgIGRhdGUuc2V0TW9udGgoZGF0ZS5nZXRNb250aCgpICsgZGlyZWN0aW9uKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLkhPVVI6XHJcbiAgICAgICAgICAgICAgICBkYXRlLnNldERhdGUoZGF0ZS5nZXREYXRlKCkgKyBkaXJlY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuTUlOVVRFOlxyXG4gICAgICAgICAgICAgICAgZGF0ZS5zZXRIb3VycyhkYXRlLmdldEhvdXJzKCkgKyBkaXJlY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuU0VDT05EOlxyXG4gICAgICAgICAgICAgICAgZGF0ZS5zZXRNaW51dGVzKGRhdGUuZ2V0TWludXRlcygpICsgZGlyZWN0aW9uKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gZGF0ZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSB2aWV3Y2hhbmdlZChkYXRlOkRhdGUsIGxldmVsOkxldmVsKSB7XHJcbiAgICAgICAgdGhpcy5kYXRlID0gZGF0ZTtcclxuICAgICAgICB0aGlzLmxldmVsID0gbGV2ZWw7XHJcbiAgICAgICAgdGhpcy5sYWJlbHMuZm9yRWFjaCgobGFiZWwsIGxhYmVsTGV2ZWwpID0+IHtcclxuICAgICAgICAgICAgbGFiZWwuY2xhc3NMaXN0LnJlbW92ZSgnZGF0aXVtLXRvcCcpO1xyXG4gICAgICAgICAgICBsYWJlbC5jbGFzc0xpc3QucmVtb3ZlKCdkYXRpdW0tYm90dG9tJyk7XHJcbiAgICAgICAgICAgIGxhYmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1oaWRkZW4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChsYWJlbExldmVsIDwgbGV2ZWwpIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS10b3AnKTtcclxuICAgICAgICAgICAgICAgIGxhYmVsLmlubmVySFRNTCA9IHRoaXMuZ2V0SGVhZGVyVG9wVGV4dChkYXRlLCBsYWJlbExldmVsKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1ib3R0b20nKTtcclxuICAgICAgICAgICAgICAgIGxhYmVsLmlubmVySFRNTCA9IHRoaXMuZ2V0SGVhZGVyQm90dG9tVGV4dChkYXRlLCBsYWJlbExldmVsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKGxhYmVsTGV2ZWwgPCBsZXZlbCAtIDEgfHwgbGFiZWxMZXZlbCA+IGxldmVsKSB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbC5jbGFzc0xpc3QuYWRkKCdkYXRpdW0taGlkZGVuJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBnZXRIZWFkZXJUb3BUZXh0KGRhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWwpOnN0cmluZyB7XHJcbiAgICAgICAgc3dpdGNoKGxldmVsKSB7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuWUVBUjpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldERlY2FkZShkYXRlKTtcclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5NT05USDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBkYXRlLmdldEZ1bGxZZWFyKCkudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5EQVRFOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3RoaXMuZ2V0U2hvcnRNb250aHMoKVtkYXRlLmdldE1vbnRoKCldfSAke2RhdGUuZ2V0RnVsbFllYXIoKX1gO1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLkhPVVI6XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuTUlOVVRFOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3RoaXMuZ2V0U2hvcnREYXlzKClbZGF0ZS5nZXREYXkoKV19ICR7dGhpcy5wYWQoZGF0ZS5nZXREYXRlKCkpfSAke3RoaXMuZ2V0U2hvcnRNb250aHMoKVtkYXRlLmdldE1vbnRoKCldfSAke2RhdGUuZ2V0RnVsbFllYXIoKX1gO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBnZXRIZWFkZXJCb3R0b21UZXh0KGRhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWwpOnN0cmluZyB7XHJcbiAgICAgICAgc3dpdGNoKGxldmVsKSB7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuWUVBUjpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldERlY2FkZShkYXRlKTtcclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5NT05USDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBkYXRlLmdldEZ1bGxZZWFyKCkudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5EQVRFOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U2hvcnRNb250aHMoKVtkYXRlLmdldE1vbnRoKCldO1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLkhPVVI6XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLm1pbGl0YXJ5VGltZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHt0aGlzLmdldFNob3J0RGF5cygpW2RhdGUuZ2V0RGF5KCldfSAke3RoaXMucGFkKGRhdGUuZ2V0RGF0ZSgpKX0gPGRhdGl1bS12YXJpYWJsZT4ke3RoaXMucGFkKGRhdGUuZ2V0SG91cnMoKSl9PGRhdGl1bS1sb3dlcj5ocjwvZGF0aXVtLWxvd2VyPjwvZGF0aXVtLXZhcmlhYmxlPmA7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHt0aGlzLmdldFNob3J0RGF5cygpW2RhdGUuZ2V0RGF5KCldfSAke3RoaXMucGFkKGRhdGUuZ2V0RGF0ZSgpKX0gPGRhdGl1bS12YXJpYWJsZT4ke3RoaXMuZ2V0SG91cnMoZGF0ZSl9JHt0aGlzLmdldE1lcmlkaWVtKGRhdGUpfTwvZGF0aXVtLXZhcmlhYmxlPmA7ICAgIFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIExldmVsLk1JTlVURTpcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMubWlsaXRhcnlUaW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke3RoaXMucGFkKGRhdGUuZ2V0SG91cnMoKSl9OjxkYXRpdW0tdmFyaWFibGU+JHt0aGlzLnBhZChkYXRlLmdldE1pbnV0ZXMoKSl9PC9kYXRpdW0tdmFyaWFibGU+YDsgICAgXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHt0aGlzLmdldEhvdXJzKGRhdGUpfTo8ZGF0aXVtLXZhcmlhYmxlPiR7dGhpcy5wYWQoZGF0ZS5nZXRNaW51dGVzKCkpfTwvZGF0aXVtLXZhcmlhYmxlPiR7dGhpcy5nZXRNZXJpZGllbShkYXRlKX1gO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIExldmVsLlNFQ09ORDpcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMubWlsaXRhcnlUaW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke3RoaXMucGFkKGRhdGUuZ2V0SG91cnMoKSl9OiR7dGhpcy5wYWQoZGF0ZS5nZXRNaW51dGVzKCkpfTo8ZGF0aXVtLXZhcmlhYmxlPiR7dGhpcy5wYWQoZGF0ZS5nZXRTZWNvbmRzKCkpfTwvZGF0aXVtLXZhcmlhYmxlPmA7ICAgXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHt0aGlzLmdldEhvdXJzKGRhdGUpfToke3RoaXMucGFkKGRhdGUuZ2V0TWludXRlcygpKX06PGRhdGl1bS12YXJpYWJsZT4ke3RoaXMucGFkKGRhdGUuZ2V0U2Vjb25kcygpKX08L2RhdGl1bS12YXJpYWJsZT4ke3RoaXMuZ2V0TWVyaWRpZW0oZGF0ZSl9YDsgICAgXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdXBkYXRlT3B0aW9ucyhvcHRpb25zOklPcHRpb25zKSB7XHJcbiAgICAgICAgbGV0IHVwZGF0ZVZpZXcgPSB0aGlzLm9wdGlvbnMgIT09IHZvaWQgMCAmJiB0aGlzLm9wdGlvbnMubWlsaXRhcnlUaW1lICE9PSBvcHRpb25zLm1pbGl0YXJ5VGltZTtcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xyXG4gICAgICAgIGlmICh1cGRhdGVWaWV3KSB7XHJcbiAgICAgICAgICAgIHRoaXMudmlld2NoYW5nZWQodGhpcy5kYXRlLCB0aGlzLmxldmVsKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJjb25zdCBlbnVtIFRyYW5zaXRpb24ge1xyXG4gICAgU0xJREVfTEVGVCxcclxuICAgIFNMSURFX1JJR0hULFxyXG4gICAgWk9PTV9JTixcclxuICAgIFpPT01fT1VUXHJcbn1cclxuXHJcbmNsYXNzIFBpY2tlck1hbmFnZXIge1xyXG4gICAgcHJpdmF0ZSBvcHRpb25zOklPcHRpb25zO1xyXG4gICAgcHVibGljIGNvbnRhaW5lcjpIVE1MRWxlbWVudDtcclxuICAgIHB1YmxpYyBoZWFkZXI6SGVhZGVyO1xyXG4gICAgXHJcbiAgICBwcml2YXRlIHllYXJQaWNrZXI6SVBpY2tlcjtcclxuICAgIHByaXZhdGUgbW9udGhQaWNrZXI6SVBpY2tlcjtcclxuICAgIHByaXZhdGUgZGF0ZVBpY2tlcjpJUGlja2VyO1xyXG4gICAgcHJpdmF0ZSBob3VyUGlja2VyOklUaW1lUGlja2VyO1xyXG4gICAgcHJpdmF0ZSBtaW51dGVQaWNrZXI6SVRpbWVQaWNrZXI7XHJcbiAgICBwcml2YXRlIHNlY29uZFBpY2tlcjpJVGltZVBpY2tlcjtcclxuICAgIFxyXG4gICAgcHVibGljIGN1cnJlbnRQaWNrZXI6SVBpY2tlcjtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBwaWNrZXJDb250YWluZXI6SFRNTEVsZW1lbnQ7XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgZWxlbWVudDpIVE1MSW5wdXRFbGVtZW50KSB7XHJcbiAgICAgICAgdGhpcy5jb250YWluZXIgPSB0aGlzLmNyZWF0ZVZpZXcoKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmluc2VydEFmdGVyKGVsZW1lbnQsIHRoaXMuY29udGFpbmVyKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnBpY2tlckNvbnRhaW5lciA9IDxIVE1MRWxlbWVudD50aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdkYXRpdW0tcGlja2VyLWNvbnRhaW5lcicpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuaGVhZGVyID0gbmV3IEhlYWRlcihlbGVtZW50LCB0aGlzLmNvbnRhaW5lcik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy55ZWFyUGlja2VyID0gbmV3IFllYXJQaWNrZXIoZWxlbWVudCwgdGhpcy5jb250YWluZXIpO1xyXG4gICAgICAgIHRoaXMubW9udGhQaWNrZXIgPSBuZXcgTW9udGhQaWNrZXIoZWxlbWVudCwgdGhpcy5jb250YWluZXIpO1xyXG4gICAgICAgIHRoaXMuZGF0ZVBpY2tlciA9IG5ldyBEYXRlUGlja2VyKGVsZW1lbnQsIHRoaXMuY29udGFpbmVyKTtcclxuICAgICAgICB0aGlzLmhvdXJQaWNrZXIgPSBuZXcgSG91clBpY2tlcihlbGVtZW50LCB0aGlzLmNvbnRhaW5lcik7XHJcbiAgICAgICAgdGhpcy5taW51dGVQaWNrZXIgPSBuZXcgTWludXRlUGlja2VyKGVsZW1lbnQsIHRoaXMuY29udGFpbmVyKTtcclxuICAgICAgICB0aGlzLnNlY29uZFBpY2tlciA9IG5ldyBTZWNvbmRQaWNrZXIoZWxlbWVudCwgdGhpcy5jb250YWluZXIpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgbGlzdGVuLmRvd24odGhpcy5jb250YWluZXIsICcqJywgKGUpID0+IHRoaXMuYWRkQWN0aXZlQ2xhc3NlcyhlKSk7XHJcbiAgICAgICAgbGlzdGVuLnVwKGRvY3VtZW50LCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2VCdWJibGUoKTtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVBY3RpdmVDbGFzc2VzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGlzdGVuLm1vdXNlZG93bih0aGlzLmNvbnRhaW5lciwgKGUpID0+IHtcclxuICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICByZXR1cm4gZmFsc2U7IFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi52aWV3Y2hhbmdlZChlbGVtZW50LCAoZSkgPT4gdGhpcy52aWV3Y2hhbmdlZChlLmRhdGUsIGUubGV2ZWwsIGUudXBkYXRlKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGlzdGVuLm9wZW5CdWJibGUoZWxlbWVudCwgKGUpID0+IHtcclxuICAgICAgICAgICB0aGlzLm9wZW5CdWJibGUoZS54LCBlLnksIGUudGV4dCk7IFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGxpc3Rlbi51cGRhdGVCdWJibGUoZWxlbWVudCwgKGUpID0+IHtcclxuICAgICAgICAgICB0aGlzLnVwZGF0ZUJ1YmJsZShlLngsIGUueSwgZS50ZXh0KTsgXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGlzdGVuLnN3aXBlTGVmdCh0aGlzLmNvbnRhaW5lciwgKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zZWNvbmRQaWNrZXIuaXNEcmFnZ2luZygpIHx8XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1pbnV0ZVBpY2tlci5pc0RyYWdnaW5nKCkgfHxcclxuICAgICAgICAgICAgICAgIHRoaXMuaG91clBpY2tlci5pc0RyYWdnaW5nKCkpIHJldHVybjtcclxuICAgICAgICAgICAgdGhpcy5oZWFkZXIubmV4dCgpOyBcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4uc3dpcGVSaWdodCh0aGlzLmNvbnRhaW5lciwgKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zZWNvbmRQaWNrZXIuaXNEcmFnZ2luZygpIHx8XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1pbnV0ZVBpY2tlci5pc0RyYWdnaW5nKCkgfHxcclxuICAgICAgICAgICAgICAgIHRoaXMuaG91clBpY2tlci5pc0RyYWdnaW5nKCkpIHJldHVybjtcclxuICAgICAgICAgICAgdGhpcy5oZWFkZXIucHJldmlvdXMoKTsgXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBjbG9zZUJ1YmJsZSgpIHtcclxuICAgICAgICBpZiAodGhpcy5idWJibGUgPT09IHZvaWQgMCkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuYnViYmxlLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1idWJibGUtdmlzaWJsZScpO1xyXG4gICAgICAgIHNldFRpbWVvdXQoKGJ1YmJsZTpIVE1MRWxlbWVudCkgPT4ge1xyXG4gICAgICAgICAgICBidWJibGUucmVtb3ZlKCk7XHJcbiAgICAgICAgfSwgMjAwLCB0aGlzLmJ1YmJsZSk7XHJcbiAgICAgICAgdGhpcy5idWJibGUgPSB2b2lkIDA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgYnViYmxlOkhUTUxFbGVtZW50O1xyXG4gICAgXHJcbiAgICBwdWJsaWMgb3BlbkJ1YmJsZSh4Om51bWJlciwgeTpudW1iZXIsIHRleHQ6c3RyaW5nKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuYnViYmxlICE9PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZUJ1YmJsZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmJ1YmJsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1idWJibGUnKTtcclxuICAgICAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmJ1YmJsZSk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVCdWJibGUoeCwgeSwgdGV4dCk7XHJcbiAgICAgICAgc2V0VGltZW91dCgoYnViYmxlOkhUTUxFbGVtZW50KSA9PiB7XHJcbiAgICAgICAgICAgYnViYmxlLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1idWJibGUtdmlzaWJsZScpOyBcclxuICAgICAgICB9LCAwLCB0aGlzLmJ1YmJsZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB1cGRhdGVCdWJibGUoeDpudW1iZXIsIHk6bnVtYmVyLCB0ZXh0OnN0cmluZykge1xyXG4gICAgICAgIHRoaXMuYnViYmxlLmlubmVySFRNTCA9IHRleHQ7XHJcbiAgICAgICAgdGhpcy5idWJibGUuc3R5bGUudG9wID0geSArICdweCc7XHJcbiAgICAgICAgdGhpcy5idWJibGUuc3R5bGUubGVmdCA9IHggKyAncHgnO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHZpZXdjaGFuZ2VkKGRhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWwsIHVwZGF0ZTpib29sZWFuKSB7XHJcbiAgICAgICAgaWYgKGxldmVsID09PSBMZXZlbC5OT05FKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRQaWNrZXIgIT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UGlja2VyLnJlbW92ZShUcmFuc2l0aW9uLlpPT01fT1VUKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmFkanVzdEhlaWdodCgxMCk7XHJcbiAgICAgICAgICAgIGlmICh1cGRhdGUpIHRoaXMudXBkYXRlU2VsZWN0ZWREYXRlKGRhdGUpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCB0cmFuc2l0aW9uOlRyYW5zaXRpb247XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFBpY2tlciA9PT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBpY2tlciA9IHRoaXMuZ2V0UGlja2VyKGxldmVsKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50UGlja2VyLmNyZWF0ZShkYXRlLCBUcmFuc2l0aW9uLlpPT01fSU4pO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoKHRyYW5zaXRpb24gPSB0aGlzLmdldFRyYW5zaXRpb24oZGF0ZSwgbGV2ZWwpKSAhPT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBpY2tlci5yZW1vdmUodHJhbnNpdGlvbik7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBpY2tlciA9IHRoaXMuZ2V0UGlja2VyKGxldmVsKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50UGlja2VyLmNyZWF0ZShkYXRlLCB0cmFuc2l0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHVwZGF0ZSkgdGhpcy51cGRhdGVTZWxlY3RlZERhdGUoZGF0ZSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5hZGp1c3RIZWlnaHQodGhpcy5jdXJyZW50UGlja2VyLmdldEhlaWdodCgpKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSB1cGRhdGVTZWxlY3RlZERhdGUoZGF0ZTpEYXRlKSB7XHJcbiAgICAgICAgdGhpcy55ZWFyUGlja2VyLnNldFNlbGVjdGVkRGF0ZShkYXRlKTtcclxuICAgICAgICB0aGlzLm1vbnRoUGlja2VyLnNldFNlbGVjdGVkRGF0ZShkYXRlKTtcclxuICAgICAgICB0aGlzLmRhdGVQaWNrZXIuc2V0U2VsZWN0ZWREYXRlKGRhdGUpO1xyXG4gICAgICAgIHRoaXMuaG91clBpY2tlci5zZXRTZWxlY3RlZERhdGUoZGF0ZSk7XHJcbiAgICAgICAgdGhpcy5taW51dGVQaWNrZXIuc2V0U2VsZWN0ZWREYXRlKGRhdGUpO1xyXG4gICAgICAgIHRoaXMuc2Vjb25kUGlja2VyLnNldFNlbGVjdGVkRGF0ZShkYXRlKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBnZXRUcmFuc2l0aW9uKGRhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWwpOlRyYW5zaXRpb24ge1xyXG4gICAgICAgIGlmIChsZXZlbCA+IHRoaXMuY3VycmVudFBpY2tlci5nZXRMZXZlbCgpKSByZXR1cm4gVHJhbnNpdGlvbi5aT09NX0lOO1xyXG4gICAgICAgIGlmIChsZXZlbCA8IHRoaXMuY3VycmVudFBpY2tlci5nZXRMZXZlbCgpKSByZXR1cm4gVHJhbnNpdGlvbi5aT09NX09VVDtcclxuICAgICAgICBpZiAoZGF0ZS52YWx1ZU9mKCkgPCB0aGlzLmN1cnJlbnRQaWNrZXIuZ2V0TWluKCkudmFsdWVPZigpKSByZXR1cm4gVHJhbnNpdGlvbi5TTElERV9MRUZUO1xyXG4gICAgICAgIGlmIChkYXRlLnZhbHVlT2YoKSA+IHRoaXMuY3VycmVudFBpY2tlci5nZXRNYXgoKS52YWx1ZU9mKCkpIHJldHVybiBUcmFuc2l0aW9uLlNMSURFX1JJR0hUO1xyXG4gICAgICAgIHJldHVybiB2b2lkIDA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgYWRqdXN0SGVpZ2h0KGhlaWdodDpudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnBpY2tlckNvbnRhaW5lci5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlWSgke2hlaWdodCAtIDI4MH1weClgO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGdldFBpY2tlcihsZXZlbDpMZXZlbCk6SVBpY2tlciB7XHJcbiAgICAgICAgcmV0dXJuIFt0aGlzLnllYXJQaWNrZXIsdGhpcy5tb250aFBpY2tlcix0aGlzLmRhdGVQaWNrZXIsdGhpcy5ob3VyUGlja2VyLHRoaXMubWludXRlUGlja2VyLHRoaXMuc2Vjb25kUGlja2VyXVtsZXZlbF07XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyByZW1vdmVBY3RpdmVDbGFzc2VzKCkge1xyXG4gICAgICAgIGxldCBhY3RpdmVFbGVtZW50cyA9IHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJy5kYXRpdW0tYWN0aXZlJyk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhY3RpdmVFbGVtZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBhY3RpdmVFbGVtZW50c1tpXS5jbGFzc0xpc3QucmVtb3ZlKCdkYXRpdW0tYWN0aXZlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1hY3RpdmUnKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBhZGRBY3RpdmVDbGFzc2VzKGU6TW91c2VFdmVudHxUb3VjaEV2ZW50KSB7XHJcbiAgICAgICAgbGV0IGVsID0gZS5zcmNFbGVtZW50IHx8IDxFbGVtZW50PmUudGFyZ2V0O1xyXG4gICAgICAgIHdoaWxlIChlbCAhPT0gdGhpcy5jb250YWluZXIpIHtcclxuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLWFjdGl2ZScpO1xyXG4gICAgICAgICAgICBlbCA9IGVsLnBhcmVudEVsZW1lbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1hY3RpdmUnKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHVwZGF0ZU9wdGlvbnMob3B0aW9uczpJT3B0aW9ucykge1xyXG4gICAgICAgIGxldCB0aGVtZVVwZGF0ZWQgPSB0aGlzLm9wdGlvbnMgPT09IHZvaWQgMCB8fFxyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMudGhlbWUgPT09IHZvaWQgMCB8fFxyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMudGhlbWUucHJpbWFyeSAhPT0gb3B0aW9ucy50aGVtZS5wcmltYXJ5IHx8XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy50aGVtZS5wcmltYXJ5X3RleHQgIT09IG9wdGlvbnMudGhlbWUucHJpbWFyeV90ZXh0IHx8XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy50aGVtZS5zZWNvbmRhcnkgIT09IG9wdGlvbnMudGhlbWUuc2Vjb25kYXJ5IHx8XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy50aGVtZS5zZWNvbmRhcnlfYWNjZW50ICE9PSBvcHRpb25zLnRoZW1lLnNlY29uZGFyeV9hY2NlbnQgfHxcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnRoZW1lLnNlY29uZGFyeV90ZXh0ICE9PSBvcHRpb25zLnRoZW1lLnNlY29uZGFyeV90ZXh0O1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoZW1lVXBkYXRlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmluc2VydFN0eWxlcygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmhlYWRlci51cGRhdGVPcHRpb25zKG9wdGlvbnMpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMueWVhclBpY2tlci51cGRhdGVPcHRpb25zKG9wdGlvbnMpO1xyXG4gICAgICAgIHRoaXMubW9udGhQaWNrZXIudXBkYXRlT3B0aW9ucyhvcHRpb25zKTtcclxuICAgICAgICB0aGlzLmRhdGVQaWNrZXIudXBkYXRlT3B0aW9ucyhvcHRpb25zKTtcclxuICAgICAgICB0aGlzLmhvdXJQaWNrZXIudXBkYXRlT3B0aW9ucyhvcHRpb25zKTtcclxuICAgICAgICB0aGlzLm1pbnV0ZVBpY2tlci51cGRhdGVPcHRpb25zKG9wdGlvbnMpO1xyXG4gICAgICAgIHRoaXMuc2Vjb25kUGlja2VyLnVwZGF0ZU9wdGlvbnMob3B0aW9ucyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgY3JlYXRlVmlldygpOkhUTUxFbGVtZW50IHtcclxuICAgICAgICBsZXQgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tY29udGFpbmVyJyk7XHJcbiAgICAgICAgZWwuaW5uZXJIVE1MID0gaGVhZGVyICsgYFxyXG4gICAgICAgIDxkYXRpdW0tcGlja2VyLWNvbnRhaW5lci13cmFwcGVyPlxyXG4gICAgICAgICAgICA8ZGF0aXVtLXBpY2tlci1jb250YWluZXI+PC9kYXRpdW0tcGlja2VyLWNvbnRhaW5lcj5cclxuICAgICAgICA8L2RhdGl1bS1waWNrZXItY29udGFpbmVyLXdyYXBwZXI+YDtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gZWw7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgaW5zZXJ0QWZ0ZXIobm9kZTpOb2RlLCBuZXdOb2RlOk5vZGUpOnZvaWQge1xyXG4gICAgICAgIG5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUobmV3Tm9kZSwgbm9kZS5uZXh0U2libGluZyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN0YXRpYyBzdHlsZXNJbnNlcnRlZDpudW1iZXIgPSAwO1xyXG4gICAgXHJcbiAgICBwcml2YXRlIGluc2VydFN0eWxlcygpIHtcclxuICAgICAgICBsZXQgaGVhZCA9IGRvY3VtZW50LmhlYWQgfHwgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXTtcclxuICAgICAgICBsZXQgc3R5bGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgc3R5bGVJZCA9IFwiZGF0aXVtLXN0eWxlXCIgKyAoUGlja2VyTWFuYWdlci5zdHlsZXNJbnNlcnRlZCsrKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgZXhpc3RpbmdTdHlsZUlkID0gdGhpcy5nZXRFeGlzdGluZ1N0eWxlSWQoKTtcclxuICAgICAgICBpZiAoZXhpc3RpbmdTdHlsZUlkICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoZXhpc3RpbmdTdHlsZUlkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5jb250YWluZXIuY2xhc3NMaXN0LmFkZChzdHlsZUlkKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgdHJhbnNmb3JtZWRDc3MgPSBjc3MucmVwbGFjZSgvX3ByaW1hcnlfdGV4dC9nLCB0aGlzLm9wdGlvbnMudGhlbWUucHJpbWFyeV90ZXh0KTtcclxuICAgICAgICB0cmFuc2Zvcm1lZENzcyA9IHRyYW5zZm9ybWVkQ3NzLnJlcGxhY2UoL19wcmltYXJ5L2csIHRoaXMub3B0aW9ucy50aGVtZS5wcmltYXJ5KTtcclxuICAgICAgICB0cmFuc2Zvcm1lZENzcyA9IHRyYW5zZm9ybWVkQ3NzLnJlcGxhY2UoL19zZWNvbmRhcnlfdGV4dC9nLCB0aGlzLm9wdGlvbnMudGhlbWUuc2Vjb25kYXJ5X3RleHQpO1xyXG4gICAgICAgIHRyYW5zZm9ybWVkQ3NzID0gdHJhbnNmb3JtZWRDc3MucmVwbGFjZSgvX3NlY29uZGFyeV9hY2NlbnQvZywgdGhpcy5vcHRpb25zLnRoZW1lLnNlY29uZGFyeV9hY2NlbnQpO1xyXG4gICAgICAgIHRyYW5zZm9ybWVkQ3NzID0gdHJhbnNmb3JtZWRDc3MucmVwbGFjZSgvX3NlY29uZGFyeS9nLCB0aGlzLm9wdGlvbnMudGhlbWUuc2Vjb25kYXJ5KTtcclxuICAgICAgICB0cmFuc2Zvcm1lZENzcyA9IHRyYW5zZm9ybWVkQ3NzLnJlcGxhY2UoL19pZC9nLCBzdHlsZUlkKTtcclxuICAgICAgICBcclxuICAgICAgICBzdHlsZUVsZW1lbnQudHlwZSA9ICd0ZXh0L2Nzcyc7XHJcbiAgICAgICAgaWYgKCg8YW55PnN0eWxlRWxlbWVudCkuc3R5bGVTaGVldCl7XHJcbiAgICAgICAgICAgICg8YW55PnN0eWxlRWxlbWVudCkuc3R5bGVTaGVldC5jc3NUZXh0ID0gdHJhbnNmb3JtZWRDc3M7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc3R5bGVFbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRyYW5zZm9ybWVkQ3NzKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBoZWFkLmFwcGVuZENoaWxkKHN0eWxlRWxlbWVudCk7ICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBnZXRFeGlzdGluZ1N0eWxlSWQoKTpzdHJpbmcge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jb250YWluZXIuY2xhc3NMaXN0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICgvXmRhdGl1bS1zdHlsZVxcZCskLy50ZXN0KHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5pdGVtKGkpKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5pdGVtKGkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG59XHJcbiIsInZhciBoZWFkZXIgPSBcIjxkYXRpdW0taGVhZGVyLXdyYXBwZXI+IDxkYXRpdW0taGVhZGVyPiA8ZGF0aXVtLXNwYW4tbGFiZWwtY29udGFpbmVyPiA8ZGF0aXVtLXNwYW4tbGFiZWwgY2xhc3M9J2RhdGl1bS15ZWFyJz48L2RhdGl1bS1zcGFuLWxhYmVsPiA8ZGF0aXVtLXNwYW4tbGFiZWwgY2xhc3M9J2RhdGl1bS1tb250aCc+PC9kYXRpdW0tc3Bhbi1sYWJlbD4gPGRhdGl1bS1zcGFuLWxhYmVsIGNsYXNzPSdkYXRpdW0tZGF0ZSc+PC9kYXRpdW0tc3Bhbi1sYWJlbD4gPGRhdGl1bS1zcGFuLWxhYmVsIGNsYXNzPSdkYXRpdW0taG91cic+PC9kYXRpdW0tc3Bhbi1sYWJlbD4gPGRhdGl1bS1zcGFuLWxhYmVsIGNsYXNzPSdkYXRpdW0tbWludXRlJz48L2RhdGl1bS1zcGFuLWxhYmVsPiA8ZGF0aXVtLXNwYW4tbGFiZWwgY2xhc3M9J2RhdGl1bS1zZWNvbmQnPjwvZGF0aXVtLXNwYW4tbGFiZWw+IDwvZGF0aXVtLXNwYW4tbGFiZWwtY29udGFpbmVyPiA8ZGF0aXVtLXByZXY+PC9kYXRpdW0tcHJldj4gPGRhdGl1bS1uZXh0PjwvZGF0aXVtLW5leHQ+IDwvZGF0aXVtLWhlYWRlcj4gPC9kYXRpdW0taGVhZGVyLXdyYXBwZXI+XCI7IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2NvbW1vbi9Db21tb24udHNcIiAvPlxyXG5jbGFzcyBQaWNrZXIgZXh0ZW5kcyBDb21tb24ge1xyXG4gICAgcHJvdGVjdGVkIHBpY2tlckNvbnRhaW5lcjpIVE1MRWxlbWVudDtcclxuICAgIHByb3RlY3RlZCBtaW46RGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICBwcm90ZWN0ZWQgbWF4OkRhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgcHJvdGVjdGVkIHBpY2tlcjpIVE1MRWxlbWVudDtcclxuICAgIHByb3RlY3RlZCBzZWxlY3RlZERhdGU6RGF0ZTtcclxuICAgIHByb3RlY3RlZCBvcHRpb25zOklPcHRpb25zO1xyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgZWxlbWVudDpIVE1MRWxlbWVudCwgcHJvdGVjdGVkIGNvbnRhaW5lcjpIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5waWNrZXJDb250YWluZXIgPSA8SFRNTEVsZW1lbnQ+Y29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1waWNrZXItY29udGFpbmVyJyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBjcmVhdGUoZGF0ZTpEYXRlLCB0cmFuc2l0aW9uOlRyYW5zaXRpb24pIHtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHJlbW92ZSh0cmFuc2l0aW9uOlRyYW5zaXRpb24pIHtcclxuICAgICAgICBpZiAodGhpcy5waWNrZXIgPT09IHZvaWQgMCkgcmV0dXJuO1xyXG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRyYW5zaXRpb25JblRpbWVvdXQpO1xyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbk91dCh0cmFuc2l0aW9uLCB0aGlzLnBpY2tlcik7XHJcbiAgICAgICAgc2V0VGltZW91dCgocGlja2VyOkhUTUxFbGVtZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHBpY2tlci5yZW1vdmUoKTtcclxuICAgICAgICB9LCA1MDAsIHRoaXMucGlja2VyKTsgICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgZ2V0T2Zmc2V0KGVsOkhUTUxFbGVtZW50KTp7eDpudW1iZXIsIHk6bnVtYmVyfSB7XHJcbiAgICAgICAgbGV0IHggPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0IC0gdGhpcy5jb250YWluZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdDtcclxuICAgICAgICBsZXQgeSA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCAtIHRoaXMuY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcDtcclxuICAgICAgICByZXR1cm4geyB4OiB4LCB5OiB5IH07XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB1cGRhdGVPcHRpb25zKG9wdGlvbnM6SU9wdGlvbnMpIHtcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgYXR0YWNoKCkge1xyXG4gICAgICAgIHRoaXMucGlja2VyQ29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMucGlja2VyKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldE1pbigpOkRhdGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1pbjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldE1heCgpOkRhdGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1heDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHNldFNlbGVjdGVkRGF0ZShkYXRlOkRhdGUpOnZvaWQge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWREYXRlID0gbmV3IERhdGUoZGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgdHJhbnNpdGlvbk91dCh0cmFuc2l0aW9uOlRyYW5zaXRpb24sIHBpY2tlcjpIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIGlmICh0cmFuc2l0aW9uID09PSBUcmFuc2l0aW9uLlNMSURFX0xFRlQpIHtcclxuICAgICAgICAgICAgcGlja2VyLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1waWNrZXItcmlnaHQnKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRyYW5zaXRpb24gPT09IFRyYW5zaXRpb24uU0xJREVfUklHSFQpIHtcclxuICAgICAgICAgICAgcGlja2VyLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1waWNrZXItbGVmdCcpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHJhbnNpdGlvbiA9PT0gVHJhbnNpdGlvbi5aT09NX0lOKSB7XHJcbiAgICAgICAgICAgIHBpY2tlci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tcGlja2VyLW91dCcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBpY2tlci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tcGlja2VyLWluJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgdHJhbnNpdGlvbkluVGltZW91dDpudW1iZXI7XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCB0cmFuc2l0aW9uSW4odHJhbnNpdGlvbjpUcmFuc2l0aW9uLCBwaWNrZXI6SFRNTEVsZW1lbnQpIHtcclxuICAgICAgICBsZXQgY2xzOnN0cmluZztcclxuICAgICAgICBpZiAodHJhbnNpdGlvbiA9PT0gVHJhbnNpdGlvbi5TTElERV9MRUZUKSB7XHJcbiAgICAgICAgICAgIGNscyA9ICdkYXRpdW0tcGlja2VyLWxlZnQnO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHJhbnNpdGlvbiA9PT0gVHJhbnNpdGlvbi5TTElERV9SSUdIVCkge1xyXG4gICAgICAgICAgICBjbHMgPSAnZGF0aXVtLXBpY2tlci1yaWdodCc7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0cmFuc2l0aW9uID09PSBUcmFuc2l0aW9uLlpPT01fSU4pIHtcclxuICAgICAgICAgICAgY2xzID0gJ2RhdGl1bS1waWNrZXItaW4nO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNscyA9ICdkYXRpdW0tcGlja2VyLW91dCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHBpY2tlci5jbGFzc0xpc3QuYWRkKGNscyk7XHJcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudHJhbnNpdGlvbkluVGltZW91dCk7XHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uSW5UaW1lb3V0ID0gc2V0VGltZW91dCgocDpIVE1MRWxlbWVudCkgPT4ge1xyXG4gICAgICAgICAgICBwLmNsYXNzTGlzdC5yZW1vdmUoY2xzKTtcclxuICAgICAgICB9LCAxMDAsIHBpY2tlcik7XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIlBpY2tlci50c1wiIC8+XHJcblxyXG5jbGFzcyBEYXRlUGlja2VyIGV4dGVuZHMgUGlja2VyIGltcGxlbWVudHMgSVBpY2tlciB7XHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OkhUTUxFbGVtZW50LCBjb250YWluZXI6SFRNTEVsZW1lbnQpIHtcclxuICAgICAgICBzdXBlcihlbGVtZW50LCBjb250YWluZXIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi50YXAoY29udGFpbmVyLCAnZGF0aXVtLWRhdGUtZWxlbWVudFtkYXRpdW0tZGF0YV0nLCAoZSkgPT4ge1xyXG4gICAgICAgICAgIGxldCBlbDpFbGVtZW50ID0gPEVsZW1lbnQ+ZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xyXG4gICAgICAgICAgIFxyXG4gICAgICAgICAgIGxldCB5ZWFyID0gbmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKS5nZXRGdWxsWWVhcigpO1xyXG4gICAgICAgICAgIGxldCBtb250aCA9IG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSkuZ2V0TW9udGgoKTtcclxuICAgICAgICAgICBsZXQgZGF0ZU9mTW9udGggPSBuZXcgRGF0ZShlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpLmdldERhdGUoKTtcclxuICAgICAgICAgICBcclxuICAgICAgICAgICBsZXQgZGF0ZSA9IG5ldyBEYXRlKHRoaXMuc2VsZWN0ZWREYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgICAgZGF0ZS5zZXRGdWxsWWVhcih5ZWFyKTtcclxuICAgICAgICAgICBkYXRlLnNldE1vbnRoKG1vbnRoKTtcclxuICAgICAgICAgICBpZiAoZGF0ZS5nZXRNb250aCgpICE9PSBtb250aCkge1xyXG4gICAgICAgICAgICAgICBkYXRlLnNldERhdGUoMCk7XHJcbiAgICAgICAgICAgfVxyXG4gICAgICAgICAgIGRhdGUuc2V0RGF0ZShkYXRlT2ZNb250aCk7XHJcbiAgICAgICAgICAgXHJcbiAgICAgICAgICAgdHJpZ2dlci56b29tSW4oZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICBkYXRlOiBkYXRlLFxyXG4gICAgICAgICAgICAgICBjdXJyZW50TGV2ZWw6IExldmVsLkRBVEVcclxuICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi5kb3duKGNvbnRhaW5lciwgJ2RhdGl1bS1kYXRlLWVsZW1lbnQnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZWw6SFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+KGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudCk7XHJcbiAgICAgICAgICAgIGxldCB0ZXh0ID0gdGhpcy5wYWQobmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKS5nZXREYXRlKCkpO1xyXG4gICAgICAgICAgICBsZXQgb2Zmc2V0ID0gdGhpcy5nZXRPZmZzZXQoZWwpO1xyXG4gICAgICAgICAgICB0cmlnZ2VyLm9wZW5CdWJibGUoZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgeDogb2Zmc2V0LnggKyAyMCxcclxuICAgICAgICAgICAgICAgIHk6IG9mZnNldC55ICsgMixcclxuICAgICAgICAgICAgICAgIHRleHQ6IHRleHRcclxuICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBoZWlnaHQ6bnVtYmVyO1xyXG4gICAgXHJcbiAgICBwdWJsaWMgY3JlYXRlKGRhdGU6RGF0ZSwgdHJhbnNpdGlvbjpUcmFuc2l0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5taW4gPSBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSk7XHJcbiAgICAgICAgdGhpcy5tYXggPSBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSArIDEpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBzdGFydCA9IG5ldyBEYXRlKHRoaXMubWluLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgc3RhcnQuc2V0RGF0ZSgxIC0gc3RhcnQuZ2V0RGF5KCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBlbmQgPSBuZXcgRGF0ZSh0aGlzLm1heC52YWx1ZU9mKCkpO1xyXG4gICAgICAgIGVuZC5zZXREYXRlKGVuZC5nZXREYXRlKCkgKyA3IC0gKGVuZC5nZXREYXkoKSA9PT0gMCA/IDcgOiBlbmQuZ2V0RGF5KCkpKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgaXRlcmF0b3IgPSBuZXcgRGF0ZShzdGFydC52YWx1ZU9mKCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMucGlja2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXBpY2tlcicpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbkluKHRyYW5zaXRpb24sIHRoaXMucGlja2VyKTtcclxuICAgICAgICBcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDc7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgaGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLWRhdGUtaGVhZGVyJyk7XHJcbiAgICAgICAgICAgIGhlYWRlci5pbm5lckhUTUwgPSB0aGlzLmdldERheXMoKVtpXS5zbGljZSgwLCAyKTtcclxuICAgICAgICAgICAgdGhpcy5waWNrZXIuYXBwZW5kQ2hpbGQoaGVhZGVyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHRpbWVzID0gMDtcclxuICAgICAgICBcclxuICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgIGxldCBuZXh0ID0gbmV3IERhdGUoaXRlcmF0b3IudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgbmV4dC5zZXREYXRlKG5leHQuZ2V0RGF0ZSgpICsgMSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgZGF0ZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tZGF0ZS1lbGVtZW50Jyk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBkYXRlRWxlbWVudC5pbm5lckhUTUwgPSBpdGVyYXRvci5nZXREYXRlKCkudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChpdGVyYXRvci5nZXRNb250aCgpID09PSBkYXRlLmdldE1vbnRoKCkgJiZcclxuICAgICAgICAgICAgICAgIG5leHQudmFsdWVPZigpID4gdGhpcy5vcHRpb25zLm1pbkRhdGUudmFsdWVPZigpICYmXHJcbiAgICAgICAgICAgICAgICBpdGVyYXRvci52YWx1ZU9mKCkgPCB0aGlzLm9wdGlvbnMubWF4RGF0ZS52YWx1ZU9mKCkgJiZcclxuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5pc1llYXJTZWxlY3RhYmxlKGl0ZXJhdG9yKSAmJlxyXG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLmlzTW9udGhTZWxlY3RhYmxlKGl0ZXJhdG9yKSAmJlxyXG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLmlzRGF0ZVNlbGVjdGFibGUoaXRlcmF0b3IpKSB7XHJcbiAgICAgICAgICAgICAgICBkYXRlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJywgaXRlcmF0b3IudG9JU09TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKGRhdGVFbGVtZW50KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGl0ZXJhdG9yID0gbmV4dDtcclxuICAgICAgICAgICAgdGltZXMrKztcclxuICAgICAgICB9IHdoaWxlIChpdGVyYXRvci52YWx1ZU9mKCkgPCBlbmQudmFsdWVPZigpKTtcclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmhlaWdodCA9IE1hdGguY2VpbCh0aW1lcyAvIDcpICogMzYgKyAyODtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmF0dGFjaCgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuc2V0U2VsZWN0ZWREYXRlKHRoaXMuc2VsZWN0ZWREYXRlKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHNldFNlbGVjdGVkRGF0ZShzZWxlY3RlZERhdGU6RGF0ZSkge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWREYXRlID0gbmV3IERhdGUoc2VsZWN0ZWREYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGRhdGVFbGVtZW50cyA9IHRoaXMucGlja2VyQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJ2RhdGl1bS1kYXRlLWVsZW1lbnQnKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGVFbGVtZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgZWwgPSBkYXRlRWxlbWVudHMuaXRlbShpKTtcclxuICAgICAgICAgICAgbGV0IGRhdGUgPSBuZXcgRGF0ZShlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpO1xyXG4gICAgICAgICAgICBpZiAoZGF0ZS5nZXRGdWxsWWVhcigpID09PSBzZWxlY3RlZERhdGUuZ2V0RnVsbFllYXIoKSAmJlxyXG4gICAgICAgICAgICAgICAgZGF0ZS5nZXRNb250aCgpID09PSBzZWxlY3RlZERhdGUuZ2V0TW9udGgoKSAmJlxyXG4gICAgICAgICAgICAgICAgZGF0ZS5nZXREYXRlKCkgPT09IHNlbGVjdGVkRGF0ZS5nZXREYXRlKCkpIHtcclxuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1zZWxlY3RlZCcpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZGF0aXVtLXNlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRIZWlnaHQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaGVpZ2h0O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgcmV0dXJuIExldmVsLkRBVEU7XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiUGlja2VyLnRzXCIgLz5cclxuXHJcbmNsYXNzIFRpbWVQaWNrZXIgZXh0ZW5kcyBQaWNrZXIge1xyXG4gICAgcHJvdGVjdGVkIHRpbWVEcmFnOkhUTUxFbGVtZW50O1xyXG4gICAgcHJvdGVjdGVkIHRpbWVEcmFnQXJtOkhUTUxFbGVtZW50O1xyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgc2Vjb25kSGFuZDpIVE1MRWxlbWVudDtcclxuICAgIHByb3RlY3RlZCBob3VySGFuZDpIVE1MRWxlbWVudDtcclxuICAgIHByb3RlY3RlZCBtaW51dGVIYW5kOkhUTUxFbGVtZW50O1xyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgZHJhZ2dpbmc6Ym9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIGlzRHJhZ2dpbmcoKTpib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kcmFnZ2luZztcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIHJvdGF0aW9uOm51bWJlciA9IDA7XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBkcmFnU3RhcnQoZTpNb3VzZUV2ZW50fFRvdWNoRXZlbnQpIHtcclxuICAgICAgICBsZXQgbWludXRlQWRqdXN0ID0gMDtcclxuICAgICAgICBpZiAodGhpcy5nZXRMZXZlbCgpID09PSBMZXZlbC5IT1VSKSB7XHJcbiAgICAgICAgICAgIG1pbnV0ZUFkanVzdCA9IChNYXRoLlBJICogdGhpcy5zZWxlY3RlZERhdGUuZ2V0TWludXRlcygpIC8gMzApIC8gMTI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRyaWdnZXIub3BlbkJ1YmJsZSh0aGlzLmVsZW1lbnQsIHtcclxuICAgICAgICAgICB4OiAtNzAgKiBNYXRoLnNpbih0aGlzLnJvdGF0aW9uICsgbWludXRlQWRqdXN0KSArIDE0MCwgXHJcbiAgICAgICAgICAgeTogNzAgKiBNYXRoLmNvcyh0aGlzLnJvdGF0aW9uICsgbWludXRlQWRqdXN0KSArIDE3NSxcclxuICAgICAgICAgICB0ZXh0OiB0aGlzLmdldEJ1YmJsZVRleHQoKSBcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnBpY2tlci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tZHJhZ2dpbmcnKTtcclxuICAgICAgICB0aGlzLmRyYWdnaW5nID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLm1vdmVkID0gMDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBtb3ZlZDpudW1iZXIgPSAwO1xyXG4gICAgcHJvdGVjdGVkIGRyYWdNb3ZlKGU6TW91c2VFdmVudHxUb3VjaEV2ZW50KSB7XHJcbiAgICAgICAgaWYgKHRoaXMubW92ZWQrKyA+IDEpIHtcclxuICAgICAgICAgICAgdHJpZ2dlci51cGRhdGVCdWJibGUodGhpcy5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgICAgICB4OiAtNzAgKiBNYXRoLnNpbih0aGlzLnJvdGF0aW9uKSArIDE0MCwgXHJcbiAgICAgICAgICAgICAgICB5OiA3MCAqIE1hdGguY29zKHRoaXMucm90YXRpb24pICsgMTc1LFxyXG4gICAgICAgICAgICAgICAgdGV4dDogdGhpcy5nZXRCdWJibGVUZXh0KClcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBwb2ludCA9IHtcclxuICAgICAgICAgICAgeDogdGhpcy5waWNrZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdCArIDE0MCAtIHRoaXMuZ2V0Q2xpZW50Q29vcihlKS54LFxyXG4gICAgICAgICAgICB5OiB0aGlzLmdldENsaWVudENvb3IoZSkueSAtIHRoaXMucGlja2VyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCAtIDEyMFxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBsZXQgciA9IE1hdGguYXRhbjIocG9pbnQueCwgcG9pbnQueSk7XHJcbiAgICAgICAgdGhpcy5yb3RhdGlvbiA9IHRoaXMubm9ybWFsaXplUm90YXRpb24ocik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IG5ld0RhdGUgPSB0aGlzLmdldEVsZW1lbnREYXRlKHRoaXMudGltZURyYWcpO1xyXG4gICAgICAgIGlmICh0aGlzLmdldExldmVsKCkgPT09IExldmVsLkhPVVIpIHtcclxuICAgICAgICAgICAgbmV3RGF0ZS5zZXRIb3Vycyh0aGlzLnJvdGF0aW9uVG9UaW1lKHRoaXMucm90YXRpb24pKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZ2V0TGV2ZWwoKSA9PT0gTGV2ZWwuTUlOVVRFKSB7XHJcbiAgICAgICAgICAgIG5ld0RhdGUuc2V0TWludXRlcyh0aGlzLnJvdGF0aW9uVG9UaW1lKHRoaXMucm90YXRpb24pKTsgICAgICAgICAgICBcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZ2V0TGV2ZWwoKSA9PT0gTGV2ZWwuU0VDT05EKSB7XHJcbiAgICAgICAgICAgIG5ld0RhdGUuc2V0U2Vjb25kcyh0aGlzLnJvdGF0aW9uVG9UaW1lKHRoaXMucm90YXRpb24pKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy51cGRhdGVMYWJlbHMobmV3RGF0ZSk7XHJcbiAgICAgICAgdHJpZ2dlci5nb3RvKHRoaXMuZWxlbWVudCwge1xyXG4gICAgICAgICAgICBkYXRlOiBuZXdEYXRlLFxyXG4gICAgICAgICAgICBsZXZlbDogdGhpcy5nZXRMZXZlbCgpLFxyXG4gICAgICAgICAgICB1cGRhdGU6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy51cGRhdGVFbGVtZW50cygpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgZHJhZ0VuZChlOk1vdXNlRXZlbnR8VG91Y2hFdmVudCkge1xyXG4gICAgICAgIHRoaXMucGlja2VyLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1kcmFnZ2luZycpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBkYXRlID0gdGhpcy5nZXRFbGVtZW50RGF0ZSh0aGlzLnRpbWVEcmFnKTtcclxuICAgICAgICBpZiAodGhpcy5nZXRMZXZlbCgpID09PSBMZXZlbC5IT1VSKSB7XHJcbiAgICAgICAgICAgIGRhdGUuc2V0SG91cnModGhpcy5yb3RhdGlvblRvVGltZSh0aGlzLnJvdGF0aW9uKSk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmdldExldmVsKCkgPT09IExldmVsLk1JTlVURSkge1xyXG4gICAgICAgICAgICBkYXRlLnNldE1pbnV0ZXModGhpcy5yb3RhdGlvblRvVGltZSh0aGlzLnJvdGF0aW9uKSk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmdldExldmVsKCkgPT09IExldmVsLlNFQ09ORCkge1xyXG4gICAgICAgICAgICBkYXRlLnNldFNlY29uZHModGhpcy5yb3RhdGlvblRvVGltZSh0aGlzLnJvdGF0aW9uKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRyaWdnZXIuem9vbUluKHRoaXMuZWxlbWVudCwge1xyXG4gICAgICAgICAgICBkYXRlOiBkYXRlLFxyXG4gICAgICAgICAgICBjdXJyZW50TGV2ZWw6IHRoaXMuZ2V0TGV2ZWwoKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcgPSBmYWxzZTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnVwZGF0ZUVsZW1lbnRzKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCB1cGRhdGVFbGVtZW50cygpIHtcclxuICAgICAgICB0aGlzLnRpbWVEcmFnQXJtLnN0eWxlLnRyYW5zZm9ybSA9IGByb3RhdGUoJHt0aGlzLnJvdGF0aW9ufXJhZClgO1xyXG4gICAgICAgIGlmICh0aGlzLmdldExldmVsKCkgPT0gTGV2ZWwuSE9VUikge1xyXG4gICAgICAgICAgICBsZXQgbWludXRlQWRqdXN0ID0gMDtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmRyYWdnaW5nKSB7XHJcbiAgICAgICAgICAgICAgICBtaW51dGVBZGp1c3QgPSAoTWF0aC5QSSAqIHRoaXMuc2VsZWN0ZWREYXRlLmdldE1pbnV0ZXMoKSAvIDMwKSAvIDEyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMudGltZURyYWdBcm0uc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZSgke3RoaXMucm90YXRpb24gKyBtaW51dGVBZGp1c3R9cmFkKWA7XHJcbiAgICAgICAgICAgIHRoaXMuaG91ckhhbmQuc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZSgke3RoaXMucm90YXRpb24gKyBtaW51dGVBZGp1c3R9cmFkKWA7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmdldExldmVsKCkgPT09IExldmVsLk1JTlVURSkge1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IHQgPSB0aGlzLnNlbGVjdGVkRGF0ZS5nZXRIb3VycygpO1xyXG4gICAgICAgICAgICBsZXQgcjEgPSAgKHQgKyA2KSAvIDYgKiBNYXRoLlBJO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IHIgPSB0aGlzLnJvdGF0aW9uO1xyXG4gICAgICAgICAgICByID0gdGhpcy5wdXRSb3RhdGlvbkluQm91bmRzKHIpO1xyXG4gICAgICAgICAgICByMSArPSAocitNYXRoLlBJKS8xMjtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuaG91ckhhbmQuc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZSgke3IxfXJhZClgO1xyXG4gICAgICAgICAgICB0aGlzLm1pbnV0ZUhhbmQuc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZSgke3RoaXMucm90YXRpb259cmFkKWA7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmdldExldmVsKCkgPT09IExldmVsLlNFQ09ORCkge1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IHQgPSB0aGlzLnNlbGVjdGVkRGF0ZS5nZXRIb3VycygpO1xyXG4gICAgICAgICAgICBsZXQgcjEgPSAgKHQgKyA2KSAvIDYgKiBNYXRoLlBJO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgdDIgPSB0aGlzLnNlbGVjdGVkRGF0ZS5nZXRNaW51dGVzKCk7XHJcbiAgICAgICAgICAgIGxldCByMiA9IHRoaXMudGltZVRvUm90YXRpb24odDIpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IHIgPSByMjtcclxuICAgICAgICAgICAgciA9IHRoaXMucHV0Um90YXRpb25JbkJvdW5kcyhyKTtcclxuICAgICAgICAgICAgcjEgKz0gKHIrTWF0aC5QSSkvMTI7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLmhvdXJIYW5kLnN0eWxlLnRyYW5zZm9ybSA9IGByb3RhdGUoJHtyMX1yYWQpYDtcclxuICAgICAgICAgICAgdGhpcy5taW51dGVIYW5kLnN0eWxlLnRyYW5zZm9ybSA9IGByb3RhdGUoJHtyMn1yYWQpYDtcclxuICAgICAgICAgICAgdGhpcy5zZWNvbmRIYW5kLnN0eWxlLnRyYW5zZm9ybSA9IGByb3RhdGUoJHt0aGlzLnJvdGF0aW9ufXJhZClgO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIHB1dFJvdGF0aW9uSW5Cb3VuZHMocjpudW1iZXIsIGZhY3RvcjpudW1iZXIgPSAyKSB7XHJcbiAgICAgICAgd2hpbGUgKHIgPiBNYXRoLlBJKSByIC09IE1hdGguUEkgKiBmYWN0b3I7XHJcbiAgICAgICAgd2hpbGUgKHIgPCAtTWF0aC5QSSkgciArPSBNYXRoLlBJICogZmFjdG9yO1xyXG4gICAgICAgIHJldHVybiByO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgbm9ybWFsaXplUm90YXRpb24ocjpudW1iZXIsIGZhY3RvcjpudW1iZXIgPSAyKSB7XHJcbiAgICAgICAgcmV0dXJuIHIgLSBNYXRoLnJvdW5kKChyIC0gdGhpcy5yb3RhdGlvbikgLyBNYXRoLlBJIC8gZmFjdG9yKSAqIE1hdGguUEkgKiBmYWN0b3I7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBzZXRTZWxlY3RlZERhdGUoZGF0ZTpEYXRlKSB7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZERhdGUgPSBuZXcgRGF0ZShkYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMuZ2V0TGV2ZWwoKSA9PT0gTGV2ZWwuSE9VUikge1xyXG4gICAgICAgICAgICB0aGlzLnJvdGF0aW9uID0gdGhpcy5ub3JtYWxpemVSb3RhdGlvbigoZGF0ZS5nZXRIb3VycygpICsgNikgLyA2ICogTWF0aC5QSSwgMik7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmdldExldmVsKCkgPT09IExldmVsLk1JTlVURSkge1xyXG4gICAgICAgICAgICB0aGlzLnJvdGF0aW9uID0gdGhpcy5ub3JtYWxpemVSb3RhdGlvbigoZGF0ZS5nZXRNaW51dGVzKCkgKyAzMCkgLyAzMCAqIE1hdGguUEksIDIpOyAgICAgICAgICAgIFxyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5nZXRMZXZlbCgpID09PSBMZXZlbC5TRUNPTkQpIHtcclxuICAgICAgICAgICAgdGhpcy5yb3RhdGlvbiA9IHRoaXMubm9ybWFsaXplUm90YXRpb24oKGRhdGUuZ2V0U2Vjb25kcygpICsgMzApIC8gMzAgKiBNYXRoLlBJLCAyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMudGltZURyYWdBcm0gIT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUVsZW1lbnRzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLnBpY2tlciAhPT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlTGFiZWxzKGRhdGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldEhlaWdodCgpIHtcclxuICAgICAgICByZXR1cm4gMjQwO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgdXBkYXRlTGFiZWxzKGRhdGU6RGF0ZSwgZm9yY2VVcGRhdGU6Ym9vbGVhbiA9IGZhbHNlKSB7IHRocm93ICd1bmltcGxlbWVudGVkJyB9XHJcbiAgICBwcm90ZWN0ZWQgZ2V0RWxlbWVudERhdGUoZWw6RWxlbWVudCk6RGF0ZSB7IHRocm93ICd1bmltcGxlbWVudGVkJyB9XHJcbiAgICBwcm90ZWN0ZWQgZ2V0QnViYmxlVGV4dCgpOnN0cmluZyB7IHRocm93ICd1bmltcGxlbWVudGVkJyB9XHJcbiAgICBwcm90ZWN0ZWQgcm90YXRpb25Ub1RpbWUocm90YXRpb246bnVtYmVyKTpudW1iZXIgeyB0aHJvdyAndW5pbXBsZW1lbnRlZCcgfVxyXG4gICAgcHJvdGVjdGVkIHRpbWVUb1JvdGF0aW9uKHRpbWU6bnVtYmVyKTpudW1iZXIgeyB0aHJvdyAndW5pbXBsZW1lbnRlZCcgfVxyXG4gICAgcHVibGljIGdldExldmVsKCk6TGV2ZWwgeyB0aHJvdyAndW5pbXBsZW1lbnRlZCcgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIlRpbWVQaWNrZXIudHNcIiAvPlxyXG5cclxuY2xhc3MgSG91clBpY2tlciBleHRlbmRzIFRpbWVQaWNrZXIgaW1wbGVtZW50cyBJVGltZVBpY2tlciB7XHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OkhUTUxFbGVtZW50LCBjb250YWluZXI6SFRNTEVsZW1lbnQpIHtcclxuICAgICAgICBzdXBlcihlbGVtZW50LCBjb250YWluZXIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi5kcmFnKGNvbnRhaW5lciwgJy5kYXRpdW0taG91ci1kcmFnJywge1xyXG4gICAgICAgICAgICBkcmFnU3RhcnQ6IChlKSA9PiB0aGlzLmRyYWdTdGFydChlKSxcclxuICAgICAgICAgICAgZHJhZ01vdmU6IChlKSA9PiB0aGlzLmRyYWdNb3ZlKGUpLFxyXG4gICAgICAgICAgICBkcmFnRW5kOiAoZSkgPT4gdGhpcy5kcmFnRW5kKGUpLCBcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4udGFwKGNvbnRhaW5lciwgJy5kYXRpdW0taG91ci1lbGVtZW50JywgKGUpID0+IHtcclxuICAgICAgICAgICAgbGV0IGVsOkVsZW1lbnQgPSA8RWxlbWVudD5lLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0cmlnZ2VyLnpvb21Jbih0aGlzLmVsZW1lbnQsIHtcclxuICAgICAgICAgICAgICAgIGRhdGU6IHRoaXMuZ2V0RWxlbWVudERhdGUoZWwpLFxyXG4gICAgICAgICAgICAgICAgY3VycmVudExldmVsOiBMZXZlbC5IT1VSXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi5kb3duKGNvbnRhaW5lciwgJy5kYXRpdW0taG91ci1lbGVtZW50JywgKGUpID0+IHtcclxuICAgICAgICAgICAgbGV0IGVsOkhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PihlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQpO1xyXG4gICAgICAgICAgICBsZXQgaG91cnMgPSBuZXcgRGF0ZShlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpLmdldEhvdXJzKCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgb2Zmc2V0ID0gdGhpcy5nZXRPZmZzZXQoZWwpO1xyXG4gICAgICAgICAgICB0cmlnZ2VyLm9wZW5CdWJibGUoZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgeDogb2Zmc2V0LnggKyAyNSxcclxuICAgICAgICAgICAgICAgIHk6IG9mZnNldC55ICsgMyxcclxuICAgICAgICAgICAgICAgIHRleHQ6IHRoaXMuZ2V0QnViYmxlVGV4dChob3VycylcclxuICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4udGFwKGNvbnRhaW5lciwgJ2RhdGl1bS1tZXJpZGllbS1zd2l0Y2hlcicsICgpID0+IHtcclxuICAgICAgICAgICAgbGV0IG5ld0RhdGUgPSBuZXcgRGF0ZSh0aGlzLmxhc3RMYWJlbERhdGUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgaWYgKG5ld0RhdGUuZ2V0SG91cnMoKSA8IDEyKSB7XHJcbiAgICAgICAgICAgICAgICBuZXdEYXRlLnNldEhvdXJzKG5ld0RhdGUuZ2V0SG91cnMoKSArIDEyKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucm90YXRpb24gKz0gTWF0aC5QSSAqIDI7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBuZXdEYXRlLnNldEhvdXJzKG5ld0RhdGUuZ2V0SG91cnMoKSAtIDEyKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucm90YXRpb24gLT0gTWF0aC5QSSAqIDI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlTGFiZWxzKG5ld0RhdGUpO1xyXG4gICAgICAgICAgICB0cmlnZ2VyLmdvdG8odGhpcy5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgICAgICBkYXRlOiBuZXdEYXRlLFxyXG4gICAgICAgICAgICAgICAgbGV2ZWw6IExldmVsLkhPVVIsXHJcbiAgICAgICAgICAgICAgICB1cGRhdGU6IGZhbHNlXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUVsZW1lbnRzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBnZXRCdWJibGVUZXh0KGhvdXJzPzpudW1iZXIpIHtcclxuICAgICAgICBpZiAoaG91cnMgPT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICBob3VycyA9IHRoaXMucm90YXRpb25Ub1RpbWUodGhpcy5yb3RhdGlvbik7IFxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBsZXQgZCA9IG5ldyBEYXRlKHRoaXMuc2VsZWN0ZWREYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgZC5zZXRIb3Vycyhob3Vycyk7XHJcbiAgICAgICAgaWYgKGQudmFsdWVPZigpIDwgdGhpcy5vcHRpb25zLm1pbkRhdGUudmFsdWVPZigpKSB7XHJcbiAgICAgICAgICAgIGhvdXJzID0gdGhpcy5vcHRpb25zLm1pbkRhdGUuZ2V0SG91cnMoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGQudmFsdWVPZigpID4gdGhpcy5vcHRpb25zLm1heERhdGUudmFsdWVPZigpKSB7XHJcbiAgICAgICAgICAgIGhvdXJzID0gdGhpcy5vcHRpb25zLm1heERhdGUuZ2V0SG91cnMoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5taWxpdGFyeVRpbWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFkKGhvdXJzKSsnaHInO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoaG91cnMgPT09IDEyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnMTJwbSc7XHJcbiAgICAgICAgfSBlbHNlIGlmIChob3VycyA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJzEyYW0nO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoaG91cnMgPiAxMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gKGhvdXJzIC0gMTIpICsgJ3BtJztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gaG91cnMgKyAnYW0nO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGdldEVsZW1lbnREYXRlKGVsOkVsZW1lbnQpIHtcclxuICAgICAgICBsZXQgZCA9IG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSk7XHJcbiAgICAgICAgbGV0IHllYXIgPSBkLmdldEZ1bGxZZWFyKCk7XHJcbiAgICAgICAgbGV0IG1vbnRoID0gZC5nZXRNb250aCgpO1xyXG4gICAgICAgIGxldCBkYXRlT2ZNb250aCA9IGQuZ2V0RGF0ZSgpO1xyXG4gICAgICAgIGxldCBob3VycyA9IGQuZ2V0SG91cnMoKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgbmV3RGF0ZSA9IG5ldyBEYXRlKHRoaXMuc2VsZWN0ZWREYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgbmV3RGF0ZS5zZXRGdWxsWWVhcih5ZWFyKTtcclxuICAgICAgICBuZXdEYXRlLnNldE1vbnRoKG1vbnRoKTtcclxuICAgICAgICBpZiAobmV3RGF0ZS5nZXRNb250aCgpICE9PSBtb250aCkge1xyXG4gICAgICAgICAgICBuZXdEYXRlLnNldERhdGUoMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG5ld0RhdGUuc2V0RGF0ZShkYXRlT2ZNb250aCk7XHJcbiAgICAgICAgbmV3RGF0ZS5zZXRIb3Vycyhob3Vycyk7XHJcbiAgICAgICAgcmV0dXJuIG5ld0RhdGU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCByb3RhdGlvblRvVGltZShyOm51bWJlcikge1xyXG4gICAgICAgIHdoaWxlIChyID4gNSpNYXRoLlBJKSByIC09IDQqTWF0aC5QSTtcclxuICAgICAgICB3aGlsZSAociA8IE1hdGguUEkpIHIgKz0gNCpNYXRoLlBJO1xyXG4gICAgICAgIHIgLT0gMiAqIE1hdGguUEk7XHJcbiAgICAgICAgbGV0IHQgPSAociAvIE1hdGguUEkgKiA2KSArIDY7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IodCsuMDAwMDAxKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIHRpbWVUb1JvdGF0aW9uKHQ6bnVtYmVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubm9ybWFsaXplUm90YXRpb24oKHQgKyA2KSAvIDYgKiBNYXRoLlBJKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGNyZWF0ZShkYXRlOkRhdGUsIHRyYW5zaXRpb246VHJhbnNpdGlvbikge1xyXG4gICAgICAgIHRoaXMubWluID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIGRhdGUuZ2V0RGF0ZSgpKTtcclxuICAgICAgICB0aGlzLm1heCA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCBkYXRlLmdldERhdGUoKSArIDEpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBpdGVyYXRvciA9IG5ldyBEYXRlKHRoaXMubWluLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5waWNrZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tcGlja2VyJyk7XHJcbiAgICAgICAgdGhpcy5waWNrZXIuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLWhvdXItcGlja2VyJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uSW4odHJhbnNpdGlvbiwgdGhpcy5waWNrZXIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTI7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgdGljayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS10aWNrJyk7XHJcbiAgICAgICAgICAgIGxldCB0aWNrTGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tdGljay1sYWJlbCcpO1xyXG4gICAgICAgICAgICB0aWNrTGFiZWwuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLWhvdXItZWxlbWVudCcpO1xyXG4gICAgICAgICAgICBsZXQgdGlja0xhYmVsQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpY2stbGFiZWwtY29udGFpbmVyJyk7XHJcbiAgICAgICAgICAgIGxldCByID0gaSAqIE1hdGguUEkvNiArIE1hdGguUEk7XHJcbiAgICAgICAgICAgIHRpY2tMYWJlbENvbnRhaW5lci5hcHBlbmRDaGlsZCh0aWNrTGFiZWwpO1xyXG4gICAgICAgICAgICB0aWNrLmFwcGVuZENoaWxkKHRpY2tMYWJlbENvbnRhaW5lcik7XHJcbiAgICAgICAgICAgIHRpY2suc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZSgke3J9cmFkKWA7XHJcbiAgICAgICAgICAgIHRpY2tMYWJlbENvbnRhaW5lci5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlKCR7MipNYXRoLlBJIC0gcn1yYWQpYDtcclxuICAgICAgICAgICAgdGlja0xhYmVsLnNldEF0dHJpYnV0ZSgnZGF0aXVtLWNsb2NrLXBvcycsIGkudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgZCA9IG5ldyBEYXRlKGRhdGUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBob3VycyA9IHRoaXMucm90YXRpb25Ub1RpbWUocik7XHJcbiAgICAgICAgICAgIGlmIChkYXRlLmdldEhvdXJzKCkgPiAxMSkgaG91cnMgKz0gMTI7XHJcbiAgICAgICAgICAgIGQuc2V0SG91cnMoaG91cnMpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGlja0xhYmVsLnNldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnLCBkLnRvSVNPU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5waWNrZXIuYXBwZW5kQ2hpbGQodGljayk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMubWVyaWRpZW1Td2l0Y2hlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1tZXJpZGllbS1zd2l0Y2hlcicpO1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMubWlsaXRhcnlUaW1lKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWVyaWRpZW1Td2l0Y2hlci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tbWlsaXRhcnktdGltZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnBpY2tlci5hcHBlbmRDaGlsZCh0aGlzLm1lcmlkaWVtU3dpdGNoZXIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuaG91ckhhbmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0taG91ci1oYW5kJyk7XHJcbiAgICAgICAgdGhpcy50aW1lRHJhZ0FybSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS10aW1lLWRyYWctYXJtJyk7XHJcbiAgICAgICAgdGhpcy50aW1lRHJhZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS10aW1lLWRyYWcnKTtcclxuICAgICAgICB0aGlzLnRpbWVEcmFnLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1ob3VyLWRyYWcnKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnRpbWVEcmFnLnNldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnLCBkYXRlLnRvSVNPU3RyaW5nKCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMudGltZURyYWdBcm0uYXBwZW5kQ2hpbGQodGhpcy50aW1lRHJhZyk7XHJcbiAgICAgICAgdGhpcy5waWNrZXIuYXBwZW5kQ2hpbGQodGhpcy50aW1lRHJhZ0FybSk7XHJcbiAgICAgICAgdGhpcy5waWNrZXIuYXBwZW5kQ2hpbGQodGhpcy5ob3VySGFuZCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5tZXJpZGllbSA9IHZvaWQgMDtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmF0dGFjaCgpO1xyXG4gICAgICAgIHRoaXMuc2V0U2VsZWN0ZWREYXRlKHRoaXMuc2VsZWN0ZWREYXRlKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBtZXJpZGllbVN3aXRjaGVyOkhUTUxFbGVtZW50O1xyXG4gICAgXHJcbiAgICBwcml2YXRlIG1lcmlkaWVtOnN0cmluZztcclxuICAgIHByaXZhdGUgbGFzdExhYmVsRGF0ZTpEYXRlO1xyXG4gICAgcHJvdGVjdGVkIHVwZGF0ZUxhYmVscyhkYXRlOkRhdGUsIGZvcmNlVXBkYXRlOmJvb2xlYW4gPSBmYWxzZSkge1xyXG4gICAgICAgIHRoaXMubGFzdExhYmVsRGF0ZSA9IGRhdGU7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMubWVyaWRpZW0gIT09IHZvaWQgMCAmJlxyXG4gICAgICAgICAgICAodGhpcy5tZXJpZGllbSA9PT0gJ0FNJyAmJiBkYXRlLmdldEhvdXJzKCkgPCAxMikgfHxcclxuICAgICAgICAgICAgKHRoaXMubWVyaWRpZW0gPT09ICdQTScgJiYgZGF0ZS5nZXRIb3VycygpID4gMTEpKSB7XHJcbiAgICAgICAgICAgIGlmICghZm9yY2VVcGRhdGUpIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5tZXJpZGllbSA9IGRhdGUuZ2V0SG91cnMoKSA8IDEyID8gJ0FNJyA6ICdQTSc7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMubWVyaWRpZW0gPT09ICdBTScpIHtcclxuICAgICAgICAgICAgdGhpcy5tZXJpZGllbVN3aXRjaGVyLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1wbS1zZWxlY3RlZCcpO1xyXG4gICAgICAgICAgICB0aGlzLm1lcmlkaWVtU3dpdGNoZXIuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLWFtLXNlbGVjdGVkJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5tZXJpZGllbVN3aXRjaGVyLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1hbS1zZWxlY3RlZCcpO1xyXG4gICAgICAgICAgICB0aGlzLm1lcmlkaWVtU3dpdGNoZXIuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLXBtLXNlbGVjdGVkJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBsYWJlbHMgPSB0aGlzLnBpY2tlci5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0aXVtLWNsb2NrLXBvc10nKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxhYmVscy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgbGFiZWwgPSBsYWJlbHMuaXRlbShpKTtcclxuICAgICAgICAgICAgbGV0IHIgPSBNYXRoLlBJKnBhcnNlSW50KGxhYmVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWNsb2NrLXBvcycpLCAxMCkvNi0zKk1hdGguUEk7XHJcbiAgICAgICAgICAgIGxldCB0aW1lID0gdGhpcy5yb3RhdGlvblRvVGltZShyKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBkID0gbmV3IERhdGUobGFiZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKTtcclxuICAgICAgICAgICAgaWYgKGRhdGUuZ2V0SG91cnMoKSA+IDExKSB7XHJcbiAgICAgICAgICAgICAgICBkLnNldEhvdXJzKHRpbWUgKyAxMik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkLnNldEhvdXJzKHRpbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsYWJlbC5zZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJywgZC50b0lTT1N0cmluZygpKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBzdGFydCA9IG5ldyBEYXRlKGQuZ2V0RnVsbFllYXIoKSwgZC5nZXRNb250aCgpLCBkLmdldERhdGUoKSwgZC5nZXRIb3VycygpKTtcclxuICAgICAgICAgICAgbGV0IGVuZCA9IG5ldyBEYXRlKGQuZ2V0RnVsbFllYXIoKSwgZC5nZXRNb250aCgpLCBkLmdldERhdGUoKSwgZC5nZXRIb3VycygpICsgMSk7XHJcbiAgICAgICAgICAgIGlmIChlbmQudmFsdWVPZigpID4gdGhpcy5vcHRpb25zLm1pbkRhdGUudmFsdWVPZigpICYmXHJcbiAgICAgICAgICAgICAgICBzdGFydC52YWx1ZU9mKCkgPCB0aGlzLm9wdGlvbnMubWF4RGF0ZS52YWx1ZU9mKCkpIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1pbmFjdGl2ZScpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGFiZWwuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLWluYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMubWlsaXRhcnlUaW1lKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZS5nZXRIb3VycygpID4gMTEpIHRpbWUgKz0gMTI7XHJcbiAgICAgICAgICAgICAgICBsYWJlbC5pbm5lckhUTUwgPSB0aGlzLnBhZCh0aW1lKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aW1lID09PSAwKSB0aW1lID0gMTI7XHJcbiAgICAgICAgICAgICAgICBsYWJlbC5pbm5lckhUTUwgPSB0aW1lLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB1cGRhdGVPcHRpb25zKG9wdGlvbnM6SU9wdGlvbnMpIHtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zICE9PSB2b2lkIDAgJiYgdGhpcy5vcHRpb25zLm1pbGl0YXJ5VGltZSAhPT0gb3B0aW9ucy5taWxpdGFyeVRpbWUpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVMYWJlbHModGhpcy5sYXN0TGFiZWxEYXRlLCB0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuICAgICAgICBcclxuICAgICAgICBpZiAodGhpcy5tZXJpZGllbVN3aXRjaGVyICE9PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5taWxpdGFyeVRpbWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubWVyaWRpZW1Td2l0Y2hlci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tbWlsaXRhcnktdGltZScpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tZXJpZGllbVN3aXRjaGVyLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1taWxpdGFyeS10aW1lJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICByZXR1cm4gTGV2ZWwuSE9VUjtcclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJUaW1lUGlja2VyLnRzXCIgLz5cclxuXHJcbmNsYXNzIE1pbnV0ZVBpY2tlciBleHRlbmRzIFRpbWVQaWNrZXIgaW1wbGVtZW50cyBJVGltZVBpY2tlciB7XHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OkhUTUxFbGVtZW50LCBjb250YWluZXI6SFRNTEVsZW1lbnQpIHtcclxuICAgICAgICBzdXBlcihlbGVtZW50LCBjb250YWluZXIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi5kcmFnKGNvbnRhaW5lciwgJy5kYXRpdW0tbWludXRlLWRyYWcnLCB7XHJcbiAgICAgICAgICAgIGRyYWdTdGFydDogKGUpID0+IHRoaXMuZHJhZ1N0YXJ0KGUpLFxyXG4gICAgICAgICAgICBkcmFnTW92ZTogKGUpID0+IHRoaXMuZHJhZ01vdmUoZSksXHJcbiAgICAgICAgICAgIGRyYWdFbmQ6IChlKSA9PiB0aGlzLmRyYWdFbmQoZSksIFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi50YXAoY29udGFpbmVyLCAnLmRhdGl1bS1taW51dGUtZWxlbWVudCcsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBlbDpFbGVtZW50ID0gPEVsZW1lbnQ+ZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdHJpZ2dlci56b29tSW4odGhpcy5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgICAgICBkYXRlOiB0aGlzLmdldEVsZW1lbnREYXRlKGVsKSxcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRMZXZlbDogTGV2ZWwuTUlOVVRFXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi5kb3duKGNvbnRhaW5lciwgJy5kYXRpdW0tbWludXRlLWVsZW1lbnQnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZWw6SFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+KGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudCk7XHJcbiAgICAgICAgICAgIGxldCBtaW51dGVzID0gbmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKS5nZXRNaW51dGVzKCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgb2Zmc2V0ID0gdGhpcy5nZXRPZmZzZXQoZWwpO1xyXG4gICAgICAgICAgICB0cmlnZ2VyLm9wZW5CdWJibGUoZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgeDogb2Zmc2V0LnggKyAyNSxcclxuICAgICAgICAgICAgICAgIHk6IG9mZnNldC55ICsgMyxcclxuICAgICAgICAgICAgICAgIHRleHQ6IHRoaXMuZ2V0QnViYmxlVGV4dChtaW51dGVzKVxyXG4gICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgZ2V0QnViYmxlVGV4dChtaW51dGVzPzpudW1iZXIpIHtcclxuICAgICAgICBpZiAobWludXRlcyA9PT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgIG1pbnV0ZXMgPSB0aGlzLnJvdGF0aW9uVG9UaW1lKHRoaXMucm90YXRpb24pOyBcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGQgPSBuZXcgRGF0ZSh0aGlzLnNlbGVjdGVkRGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgIGQuc2V0TWludXRlcyhtaW51dGVzKTtcclxuICAgICAgICBpZiAoZC52YWx1ZU9mKCkgPCB0aGlzLm9wdGlvbnMubWluRGF0ZS52YWx1ZU9mKCkpIHtcclxuICAgICAgICAgICAgbWludXRlcyA9IHRoaXMub3B0aW9ucy5taW5EYXRlLmdldE1pbnV0ZXMoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGQudmFsdWVPZigpID4gdGhpcy5vcHRpb25zLm1heERhdGUudmFsdWVPZigpKSB7XHJcbiAgICAgICAgICAgIG1pbnV0ZXMgPSB0aGlzLm9wdGlvbnMubWF4RGF0ZS5nZXRNaW51dGVzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiB0aGlzLnBhZChtaW51dGVzKSsnbSc7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBnZXRFbGVtZW50RGF0ZShlbDpFbGVtZW50KSB7XHJcbiAgICAgICAgbGV0IGQgPSBuZXcgRGF0ZShlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpO1xyXG4gICAgICAgIGxldCB5ZWFyID0gZC5nZXRGdWxsWWVhcigpO1xyXG4gICAgICAgIGxldCBtb250aCA9IGQuZ2V0TW9udGgoKTtcclxuICAgICAgICBsZXQgZGF0ZU9mTW9udGggPSBkLmdldERhdGUoKTtcclxuICAgICAgICBsZXQgaG91cnMgPSBkLmdldEhvdXJzKCk7XHJcbiAgICAgICAgbGV0IG1pbnV0ZXMgPSBkLmdldE1pbnV0ZXMoKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgbmV3RGF0ZSA9IG5ldyBEYXRlKHRoaXMuc2VsZWN0ZWREYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgbmV3RGF0ZS5zZXRGdWxsWWVhcih5ZWFyKTtcclxuICAgICAgICBuZXdEYXRlLnNldE1vbnRoKG1vbnRoKTtcclxuICAgICAgICBpZiAobmV3RGF0ZS5nZXRNb250aCgpICE9PSBtb250aCkge1xyXG4gICAgICAgICAgICBuZXdEYXRlLnNldERhdGUoMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG5ld0RhdGUuc2V0RGF0ZShkYXRlT2ZNb250aCk7XHJcbiAgICAgICAgbmV3RGF0ZS5zZXRIb3Vycyhob3Vycyk7XHJcbiAgICAgICAgbmV3RGF0ZS5zZXRNaW51dGVzKG1pbnV0ZXMpO1xyXG4gICAgICAgIHJldHVybiBuZXdEYXRlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgcm90YXRpb25Ub1RpbWUocjpudW1iZXIpIHtcclxuICAgICAgICB3aGlsZSAociA+IE1hdGguUEkpIHIgLT0gMipNYXRoLlBJO1xyXG4gICAgICAgIHdoaWxlIChyIDwgLU1hdGguUEkpIHIgKz0gMipNYXRoLlBJO1xyXG4gICAgICAgIGxldCB0ID0gKHIgLyBNYXRoLlBJICogMzApICsgMzA7XHJcbiAgICAgICAgcmV0dXJuIHQgPj0gNTkuNSA/IDAgOiBNYXRoLnJvdW5kKHQpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgdGltZVRvUm90YXRpb24odDpudW1iZXIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5ub3JtYWxpemVSb3RhdGlvbigodCArIDMwKSAvIDMwICogTWF0aC5QSSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBjcmVhdGUoZGF0ZTpEYXRlLCB0cmFuc2l0aW9uOlRyYW5zaXRpb24pIHtcclxuICAgICAgICB0aGlzLm1pbiA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCBkYXRlLmdldERhdGUoKSwgZGF0ZS5nZXRIb3VycygpKTtcclxuICAgICAgICB0aGlzLm1heCA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCBkYXRlLmdldERhdGUoKSwgZGF0ZS5nZXRIb3VycygpICsgMSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGl0ZXJhdG9yID0gbmV3IERhdGUodGhpcy5taW4udmFsdWVPZigpKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnBpY2tlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1waWNrZXInKTtcclxuICAgICAgICB0aGlzLnBpY2tlci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tbWludXRlLXBpY2tlcicpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbkluKHRyYW5zaXRpb24sIHRoaXMucGlja2VyKTtcclxuICAgICAgICBcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEyOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHRpY2sgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tdGljaycpO1xyXG4gICAgICAgICAgICBsZXQgdGlja0xhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpY2stbGFiZWwnKTtcclxuICAgICAgICAgICAgdGlja0xhYmVsLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1taW51dGUtZWxlbWVudCcpO1xyXG4gICAgICAgICAgICBsZXQgdGlja0xhYmVsQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpY2stbGFiZWwtY29udGFpbmVyJyk7XHJcbiAgICAgICAgICAgIGxldCByID0gaSAqIE1hdGguUEkvNiArIE1hdGguUEk7XHJcbiAgICAgICAgICAgIHRpY2tMYWJlbENvbnRhaW5lci5hcHBlbmRDaGlsZCh0aWNrTGFiZWwpO1xyXG4gICAgICAgICAgICB0aWNrLmFwcGVuZENoaWxkKHRpY2tMYWJlbENvbnRhaW5lcik7XHJcbiAgICAgICAgICAgIHRpY2suc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZSgke3J9cmFkKWA7XHJcbiAgICAgICAgICAgIHRpY2tMYWJlbENvbnRhaW5lci5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlKCR7MipNYXRoLlBJIC0gcn1yYWQpYDtcclxuICAgICAgICAgICAgdGlja0xhYmVsLnNldEF0dHJpYnV0ZSgnZGF0aXVtLWNsb2NrLXBvcycsIGkudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgZCA9IG5ldyBEYXRlKGRhdGUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBtaW51dGVzID0gdGhpcy5yb3RhdGlvblRvVGltZShyKTtcclxuICAgICAgICAgICAgZC5zZXRNaW51dGVzKG1pbnV0ZXMpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGlja0xhYmVsLnNldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnLCBkLnRvSVNPU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICB0aGlzLnBpY2tlci5hcHBlbmRDaGlsZCh0aWNrKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5taW51dGVIYW5kID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLW1pbnV0ZS1oYW5kJyk7XHJcbiAgICAgICAgdGhpcy5ob3VySGFuZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1ob3VyLWhhbmQnKTtcclxuICAgICAgICB0aGlzLnRpbWVEcmFnQXJtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpbWUtZHJhZy1hcm0nKTtcclxuICAgICAgICB0aGlzLnRpbWVEcmFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpbWUtZHJhZycpO1xyXG4gICAgICAgIHRoaXMudGltZURyYWcuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLW1pbnV0ZS1kcmFnJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy50aW1lRHJhZy5zZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJywgZGF0ZS50b0lTT1N0cmluZygpKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnRpbWVEcmFnQXJtLmFwcGVuZENoaWxkKHRoaXMudGltZURyYWcpO1xyXG4gICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKHRoaXMudGltZURyYWdBcm0pO1xyXG4gICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKHRoaXMuaG91ckhhbmQpO1xyXG4gICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKHRoaXMubWludXRlSGFuZCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5hdHRhY2goKTtcclxuICAgICAgICB0aGlzLnNldFNlbGVjdGVkRGF0ZSh0aGlzLnNlbGVjdGVkRGF0ZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCB1cGRhdGVMYWJlbHMoZGF0ZTpEYXRlLCBmb3JjZVVwZGF0ZTpib29sZWFuID0gZmFsc2UpIHtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgbGFiZWxzID0gdGhpcy5waWNrZXIucXVlcnlTZWxlY3RvckFsbCgnW2RhdGl1bS1jbG9jay1wb3NdJyk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsYWJlbHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGxhYmVsID0gbGFiZWxzLml0ZW0oaSk7XHJcbiAgICAgICAgICAgIGxldCByID0gTWF0aC5QSSpwYXJzZUludChsYWJlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1jbG9jay1wb3MnKSwgMTApLzYtMypNYXRoLlBJO1xyXG4gICAgICAgICAgICBsZXQgdGltZSA9IHRoaXMucm90YXRpb25Ub1RpbWUocik7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgZCA9IG5ldyBEYXRlKGxhYmVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsYWJlbC5zZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJywgZC50b0lTT1N0cmluZygpKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBzdGFydCA9IG5ldyBEYXRlKGQuZ2V0RnVsbFllYXIoKSwgZC5nZXRNb250aCgpLCBkLmdldERhdGUoKSwgZC5nZXRIb3VycygpLCBkLmdldE1pbnV0ZXMoKSk7XHJcbiAgICAgICAgICAgIGxldCBlbmQgPSBuZXcgRGF0ZShkLmdldEZ1bGxZZWFyKCksIGQuZ2V0TW9udGgoKSwgZC5nZXREYXRlKCksIGQuZ2V0SG91cnMoKSwgZC5nZXRNaW51dGVzKCkgKyAxKTtcclxuICAgICAgICAgICAgaWYgKGVuZC52YWx1ZU9mKCkgPiB0aGlzLm9wdGlvbnMubWluRGF0ZS52YWx1ZU9mKCkgJiZcclxuICAgICAgICAgICAgICAgIHN0YXJ0LnZhbHVlT2YoKSA8IHRoaXMub3B0aW9ucy5tYXhEYXRlLnZhbHVlT2YoKSkge1xyXG4gICAgICAgICAgICAgICAgbGFiZWwuY2xhc3NMaXN0LnJlbW92ZSgnZGF0aXVtLWluYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbC5jbGFzc0xpc3QuYWRkKCdkYXRpdW0taW5hY3RpdmUnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGFiZWwuaW5uZXJIVE1MID0gdGhpcy5wYWQodGltZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdXBkYXRlT3B0aW9ucyhvcHRpb25zOklPcHRpb25zKSB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldExldmVsKCkge1xyXG4gICAgICAgIHJldHVybiBMZXZlbC5NSU5VVEU7XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiUGlja2VyLnRzXCIgLz5cclxuXHJcbmNsYXNzIE1vbnRoUGlja2VyIGV4dGVuZHMgUGlja2VyIGltcGxlbWVudHMgSVBpY2tlciB7XHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OkhUTUxFbGVtZW50LCBjb250YWluZXI6SFRNTEVsZW1lbnQpIHtcclxuICAgICAgICBzdXBlcihlbGVtZW50LCBjb250YWluZXIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi50YXAoY29udGFpbmVyLCAnZGF0aXVtLW1vbnRoLWVsZW1lbnRbZGF0aXVtLWRhdGFdJywgKGUpID0+IHtcclxuICAgICAgICAgICBsZXQgZWw6RWxlbWVudCA9IDxFbGVtZW50PmUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcclxuICAgICAgICAgICBsZXQgeWVhciA9IG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSkuZ2V0RnVsbFllYXIoKTtcclxuICAgICAgICAgICBsZXQgbW9udGggPSBuZXcgRGF0ZShlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpLmdldE1vbnRoKCk7XHJcbiAgICAgICAgICAgXHJcbiAgICAgICAgICAgbGV0IGRhdGUgPSBuZXcgRGF0ZSh0aGlzLnNlbGVjdGVkRGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgIGRhdGUuc2V0RnVsbFllYXIoeWVhcik7XHJcbiAgICAgICAgICAgZGF0ZS5zZXRNb250aChtb250aCk7XHJcbiAgICAgICAgICAgaWYgKGRhdGUuZ2V0TW9udGgoKSAhPT0gbW9udGgpIHtcclxuICAgICAgICAgICAgICAgZGF0ZS5zZXREYXRlKDApO1xyXG4gICAgICAgICAgIH1cclxuICAgICAgICAgICBcclxuICAgICAgICAgICB0cmlnZ2VyLnpvb21JbihlbGVtZW50LCB7XHJcbiAgICAgICAgICAgICAgIGRhdGU6IGRhdGUsXHJcbiAgICAgICAgICAgICAgIGN1cnJlbnRMZXZlbDogTGV2ZWwuTU9OVEhcclxuICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4uZG93bihjb250YWluZXIsICdkYXRpdW0tbW9udGgtZWxlbWVudCcsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBlbDpIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD4oZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50KTtcclxuICAgICAgICAgICAgbGV0IHRleHQgPSB0aGlzLmdldFNob3J0TW9udGhzKClbbmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKS5nZXRNb250aCgpXTtcclxuICAgICAgICAgICAgbGV0IG9mZnNldCA9IHRoaXMuZ2V0T2Zmc2V0KGVsKTtcclxuICAgICAgICAgICAgdHJpZ2dlci5vcGVuQnViYmxlKGVsZW1lbnQsIHtcclxuICAgICAgICAgICAgICAgIHg6IG9mZnNldC54ICsgMzUsXHJcbiAgICAgICAgICAgICAgICB5OiBvZmZzZXQueSArIDE1LFxyXG4gICAgICAgICAgICAgICAgdGV4dDogdGV4dFxyXG4gICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgY3JlYXRlKGRhdGU6RGF0ZSwgdHJhbnNpdGlvbjpUcmFuc2l0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5taW4gPSBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCksIDApO1xyXG4gICAgICAgIHRoaXMubWF4ID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpICsgMSwgMCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGl0ZXJhdG9yID0gbmV3IERhdGUodGhpcy5taW4udmFsdWVPZigpKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnBpY2tlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1waWNrZXInKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnRyYW5zaXRpb25Jbih0cmFuc2l0aW9uLCB0aGlzLnBpY2tlcik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICBsZXQgbmV4dCA9IG5ldyBEYXRlKGl0ZXJhdG9yLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgICAgIG5leHQuc2V0TW9udGgobmV4dC5nZXRNb250aCgpICsgMSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgbW9udGhFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLW1vbnRoLWVsZW1lbnQnKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIG1vbnRoRWxlbWVudC5pbm5lckhUTUwgPSB0aGlzLmdldFNob3J0TW9udGhzKClbaXRlcmF0b3IuZ2V0TW9udGgoKV07XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAobmV4dC52YWx1ZU9mKCkgPiB0aGlzLm9wdGlvbnMubWluRGF0ZS52YWx1ZU9mKCkgJiZcclxuICAgICAgICAgICAgICAgIGl0ZXJhdG9yLnZhbHVlT2YoKSA8IHRoaXMub3B0aW9ucy5tYXhEYXRlLnZhbHVlT2YoKSAmJlxyXG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLmlzWWVhclNlbGVjdGFibGUoaXRlcmF0b3IpICYmXHJcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuaXNNb250aFNlbGVjdGFibGUoaXRlcmF0b3IpKSB7XHJcbiAgICAgICAgICAgICAgICBtb250aEVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScsIGl0ZXJhdG9yLnRvSVNPU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLnBpY2tlci5hcHBlbmRDaGlsZChtb250aEVsZW1lbnQpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaXRlcmF0b3IgPSBuZXh0O1xyXG4gICAgICAgIH0gd2hpbGUgKGl0ZXJhdG9yLnZhbHVlT2YoKSA8IHRoaXMubWF4LnZhbHVlT2YoKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5hdHRhY2goKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnNldFNlbGVjdGVkRGF0ZSh0aGlzLnNlbGVjdGVkRGF0ZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBzZXRTZWxlY3RlZERhdGUoc2VsZWN0ZWREYXRlOkRhdGUpIHtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkRGF0ZSA9IG5ldyBEYXRlKHNlbGVjdGVkRGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBtb250aEVsZW1lbnRzID0gdGhpcy5waWNrZXJDb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnZGF0aXVtLW1vbnRoLWVsZW1lbnQnKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1vbnRoRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGVsID0gbW9udGhFbGVtZW50cy5pdGVtKGkpO1xyXG4gICAgICAgICAgICBsZXQgZGF0ZSA9IG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSk7XHJcbiAgICAgICAgICAgIGlmIChkYXRlLmdldEZ1bGxZZWFyKCkgPT09IHNlbGVjdGVkRGF0ZS5nZXRGdWxsWWVhcigpICYmXHJcbiAgICAgICAgICAgICAgICBkYXRlLmdldE1vbnRoKCkgPT09IHNlbGVjdGVkRGF0ZS5nZXRNb250aCgpKSB7XHJcbiAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1zZWxlY3RlZCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0SGVpZ2h0KCkge1xyXG4gICAgICAgIHJldHVybiAxODA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICByZXR1cm4gTGV2ZWwuTU9OVEg7XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiVGltZVBpY2tlci50c1wiIC8+XHJcblxyXG5jbGFzcyBTZWNvbmRQaWNrZXIgZXh0ZW5kcyBUaW1lUGlja2VyIGltcGxlbWVudHMgSVRpbWVQaWNrZXIge1xyXG4gICAgY29uc3RydWN0b3IoZWxlbWVudDpIVE1MRWxlbWVudCwgY29udGFpbmVyOkhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgc3VwZXIoZWxlbWVudCwgY29udGFpbmVyKTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4uZHJhZyhjb250YWluZXIsICcuZGF0aXVtLXNlY29uZC1kcmFnJywge1xyXG4gICAgICAgICAgICBkcmFnU3RhcnQ6IChlKSA9PiB0aGlzLmRyYWdTdGFydChlKSxcclxuICAgICAgICAgICAgZHJhZ01vdmU6IChlKSA9PiB0aGlzLmRyYWdNb3ZlKGUpLFxyXG4gICAgICAgICAgICBkcmFnRW5kOiAoZSkgPT4gdGhpcy5kcmFnRW5kKGUpLCBcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4udGFwKGNvbnRhaW5lciwgJy5kYXRpdW0tc2Vjb25kLWVsZW1lbnQnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZWw6RWxlbWVudCA9IDxFbGVtZW50PmUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRyaWdnZXIuem9vbUluKHRoaXMuZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgZGF0ZTogdGhpcy5nZXRFbGVtZW50RGF0ZShlbCksXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50TGV2ZWw6IExldmVsLlNFQ09ORFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4uZG93bihjb250YWluZXIsICcuZGF0aXVtLXNlY29uZC1lbGVtZW50JywgKGUpID0+IHtcclxuICAgICAgICAgICAgbGV0IGVsOkhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PihlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQpO1xyXG4gICAgICAgICAgICBsZXQgc2Vjb25kcyA9IG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSkuZ2V0U2Vjb25kcygpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IG9mZnNldCA9IHRoaXMuZ2V0T2Zmc2V0KGVsKTtcclxuICAgICAgICAgICAgdHJpZ2dlci5vcGVuQnViYmxlKGVsZW1lbnQsIHtcclxuICAgICAgICAgICAgICAgIHg6IG9mZnNldC54ICsgMjUsXHJcbiAgICAgICAgICAgICAgICB5OiBvZmZzZXQueSArIDMsXHJcbiAgICAgICAgICAgICAgICB0ZXh0OiB0aGlzLmdldEJ1YmJsZVRleHQoc2Vjb25kcylcclxuICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGdldEJ1YmJsZVRleHQoc2Vjb25kcz86bnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHNlY29uZHMgPT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICBzZWNvbmRzID0gdGhpcy5yb3RhdGlvblRvVGltZSh0aGlzLnJvdGF0aW9uKTsgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBkID0gbmV3IERhdGUodGhpcy5zZWxlY3RlZERhdGUudmFsdWVPZigpKTtcclxuICAgICAgICBkLnNldFNlY29uZHMoc2Vjb25kcyk7XHJcbiAgICAgICAgaWYgKGQudmFsdWVPZigpIDwgdGhpcy5vcHRpb25zLm1pbkRhdGUudmFsdWVPZigpKSB7XHJcbiAgICAgICAgICAgIHNlY29uZHMgPSB0aGlzLm9wdGlvbnMubWluRGF0ZS5nZXRTZWNvbmRzKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChkLnZhbHVlT2YoKSA+IHRoaXMub3B0aW9ucy5tYXhEYXRlLnZhbHVlT2YoKSkge1xyXG4gICAgICAgICAgICBzZWNvbmRzID0gdGhpcy5vcHRpb25zLm1heERhdGUuZ2V0U2Vjb25kcygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gdGhpcy5wYWQoc2Vjb25kcykrJ3MnO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgZ2V0RWxlbWVudERhdGUoZWw6RWxlbWVudCkge1xyXG4gICAgICAgIGxldCBkID0gbmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKTtcclxuICAgICAgICBsZXQgeWVhciA9IGQuZ2V0RnVsbFllYXIoKTtcclxuICAgICAgICBsZXQgbW9udGggPSBkLmdldE1vbnRoKCk7XHJcbiAgICAgICAgbGV0IGRhdGVPZk1vbnRoID0gZC5nZXREYXRlKCk7XHJcbiAgICAgICAgbGV0IGhvdXJzID0gZC5nZXRIb3VycygpO1xyXG4gICAgICAgIGxldCBtaW51dGVzID0gZC5nZXRNaW51dGVzKCk7XHJcbiAgICAgICAgbGV0IHNlY29uZHMgPSBkLmdldFNlY29uZHMoKTtcclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICBsZXQgbmV3RGF0ZSA9IG5ldyBEYXRlKHRoaXMuc2VsZWN0ZWREYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgbmV3RGF0ZS5zZXRGdWxsWWVhcih5ZWFyKTtcclxuICAgICAgICBuZXdEYXRlLnNldE1vbnRoKG1vbnRoKTtcclxuICAgICAgICBpZiAobmV3RGF0ZS5nZXRNb250aCgpICE9PSBtb250aCkge1xyXG4gICAgICAgICAgICBuZXdEYXRlLnNldERhdGUoMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG5ld0RhdGUuc2V0RGF0ZShkYXRlT2ZNb250aCk7XHJcbiAgICAgICAgbmV3RGF0ZS5zZXRIb3Vycyhob3Vycyk7XHJcbiAgICAgICAgbmV3RGF0ZS5zZXRNaW51dGVzKG1pbnV0ZXMpO1xyXG4gICAgICAgIG5ld0RhdGUuc2V0U2Vjb25kcyhzZWNvbmRzKTtcclxuICAgICAgICByZXR1cm4gbmV3RGF0ZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIHJvdGF0aW9uVG9UaW1lKHI6bnVtYmVyKSB7XHJcbiAgICAgICAgd2hpbGUgKHIgPiBNYXRoLlBJKSByIC09IDIqTWF0aC5QSTtcclxuICAgICAgICB3aGlsZSAociA8IC1NYXRoLlBJKSByICs9IDIqTWF0aC5QSTtcclxuICAgICAgICBsZXQgdCA9IChyIC8gTWF0aC5QSSAqIDMwKSArIDMwO1xyXG4gICAgICAgIHJldHVybiB0ID49IDU5LjUgPyAwIDogTWF0aC5yb3VuZCh0KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIHRpbWVUb1JvdGF0aW9uKHQ6bnVtYmVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubm9ybWFsaXplUm90YXRpb24oKHQgKyAzMCkgLyAzMCAqIE1hdGguUEkpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgY3JlYXRlKGRhdGU6RGF0ZSwgdHJhbnNpdGlvbjpUcmFuc2l0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5taW4gPSBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSwgZGF0ZS5nZXREYXRlKCksIGRhdGUuZ2V0SG91cnMoKSwgZGF0ZS5nZXRNaW51dGVzKCkpO1xyXG4gICAgICAgIHRoaXMubWF4ID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIGRhdGUuZ2V0RGF0ZSgpLCBkYXRlLmdldEhvdXJzKCksIGRhdGUuZ2V0TWludXRlcygpICsgMSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGl0ZXJhdG9yID0gbmV3IERhdGUodGhpcy5taW4udmFsdWVPZigpKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnBpY2tlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1waWNrZXInKTtcclxuICAgICAgICB0aGlzLnBpY2tlci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tc2Vjb25kLXBpY2tlcicpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbkluKHRyYW5zaXRpb24sIHRoaXMucGlja2VyKTtcclxuICAgICAgICBcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEyOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHRpY2sgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tdGljaycpO1xyXG4gICAgICAgICAgICBsZXQgdGlja0xhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpY2stbGFiZWwnKTtcclxuICAgICAgICAgICAgdGlja0xhYmVsLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1zZWNvbmQtZWxlbWVudCcpO1xyXG4gICAgICAgICAgICBsZXQgdGlja0xhYmVsQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpY2stbGFiZWwtY29udGFpbmVyJyk7XHJcbiAgICAgICAgICAgIGxldCByID0gaSAqIE1hdGguUEkvNiArIE1hdGguUEk7XHJcbiAgICAgICAgICAgIHRpY2tMYWJlbENvbnRhaW5lci5hcHBlbmRDaGlsZCh0aWNrTGFiZWwpO1xyXG4gICAgICAgICAgICB0aWNrLmFwcGVuZENoaWxkKHRpY2tMYWJlbENvbnRhaW5lcik7XHJcbiAgICAgICAgICAgIHRpY2suc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZSgke3J9cmFkKWA7XHJcbiAgICAgICAgICAgIHRpY2tMYWJlbENvbnRhaW5lci5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlKCR7MipNYXRoLlBJIC0gcn1yYWQpYDtcclxuICAgICAgICAgICAgdGlja0xhYmVsLnNldEF0dHJpYnV0ZSgnZGF0aXVtLWNsb2NrLXBvcycsIGkudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgZCA9IG5ldyBEYXRlKGRhdGUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBzZWNvbmRzID0gdGhpcy5yb3RhdGlvblRvVGltZShyKTtcclxuICAgICAgICAgICAgZC5zZXRTZWNvbmRzKHNlY29uZHMpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGlja0xhYmVsLnNldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnLCBkLnRvSVNPU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICB0aGlzLnBpY2tlci5hcHBlbmRDaGlsZCh0aWNrKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5zZWNvbmRIYW5kID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXNlY29uZC1oYW5kJyk7XHJcbiAgICAgICAgdGhpcy5taW51dGVIYW5kID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLW1pbnV0ZS1oYW5kJyk7XHJcbiAgICAgICAgdGhpcy5ob3VySGFuZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1ob3VyLWhhbmQnKTtcclxuICAgICAgICB0aGlzLnRpbWVEcmFnQXJtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpbWUtZHJhZy1hcm0nKTtcclxuICAgICAgICB0aGlzLnRpbWVEcmFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpbWUtZHJhZycpO1xyXG4gICAgICAgIHRoaXMudGltZURyYWcuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLXNlY29uZC1kcmFnJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy50aW1lRHJhZy5zZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJywgZGF0ZS50b0lTT1N0cmluZygpKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnRpbWVEcmFnQXJtLmFwcGVuZENoaWxkKHRoaXMudGltZURyYWcpO1xyXG4gICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKHRoaXMudGltZURyYWdBcm0pO1xyXG4gICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKHRoaXMuaG91ckhhbmQpO1xyXG4gICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKHRoaXMubWludXRlSGFuZCk7XHJcbiAgICAgICAgdGhpcy5waWNrZXIuYXBwZW5kQ2hpbGQodGhpcy5zZWNvbmRIYW5kKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmF0dGFjaCgpO1xyXG4gICAgICAgIHRoaXMuc2V0U2VsZWN0ZWREYXRlKHRoaXMuc2VsZWN0ZWREYXRlKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIHVwZGF0ZUxhYmVscyhkYXRlOkRhdGUsIGZvcmNlVXBkYXRlOmJvb2xlYW4gPSBmYWxzZSkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBsYWJlbHMgPSB0aGlzLnBpY2tlci5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0aXVtLWNsb2NrLXBvc10nKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxhYmVscy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgbGFiZWwgPSBsYWJlbHMuaXRlbShpKTtcclxuICAgICAgICAgICAgbGV0IHIgPSBNYXRoLlBJKnBhcnNlSW50KGxhYmVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWNsb2NrLXBvcycpLCAxMCkvNi0zKk1hdGguUEk7XHJcbiAgICAgICAgICAgIGxldCB0aW1lID0gdGhpcy5yb3RhdGlvblRvVGltZShyKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBkID0gbmV3IERhdGUobGFiZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxhYmVsLnNldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnLCBkLnRvSVNPU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IHN0YXJ0ID0gbmV3IERhdGUoZC5nZXRGdWxsWWVhcigpLCBkLmdldE1vbnRoKCksIGQuZ2V0RGF0ZSgpLCBkLmdldEhvdXJzKCksIGQuZ2V0TWludXRlcygpLCBkLmdldFNlY29uZHMoKSk7XHJcbiAgICAgICAgICAgIGxldCBlbmQgPSBuZXcgRGF0ZShkLmdldEZ1bGxZZWFyKCksIGQuZ2V0TW9udGgoKSwgZC5nZXREYXRlKCksIGQuZ2V0SG91cnMoKSwgZC5nZXRNaW51dGVzKCksIGQuZ2V0U2Vjb25kcygpICsgMSk7XHJcbiAgICAgICAgICAgIGlmIChlbmQudmFsdWVPZigpID4gdGhpcy5vcHRpb25zLm1pbkRhdGUudmFsdWVPZigpICYmXHJcbiAgICAgICAgICAgICAgICBzdGFydC52YWx1ZU9mKCkgPCB0aGlzLm9wdGlvbnMubWF4RGF0ZS52YWx1ZU9mKCkpIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1pbmFjdGl2ZScpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGFiZWwuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLWluYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxhYmVsLmlubmVySFRNTCA9IHRoaXMucGFkKHRpbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHVwZGF0ZU9wdGlvbnMob3B0aW9uczpJT3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICByZXR1cm4gTGV2ZWwuU0VDT05EO1xyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIlBpY2tlci50c1wiIC8+XHJcblxyXG5jbGFzcyBZZWFyUGlja2VyIGV4dGVuZHMgUGlja2VyIGltcGxlbWVudHMgSVBpY2tlciB7XHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OkhUTUxFbGVtZW50LCBjb250YWluZXI6SFRNTEVsZW1lbnQpIHtcclxuICAgICAgICBzdXBlcihlbGVtZW50LCBjb250YWluZXIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi50YXAoY29udGFpbmVyLCAnZGF0aXVtLXllYXItZWxlbWVudFtkYXRpdW0tZGF0YV0nLCAoZSkgPT4ge1xyXG4gICAgICAgICAgIGxldCBlbDpFbGVtZW50ID0gPEVsZW1lbnQ+ZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xyXG4gICAgICAgICAgIGxldCB5ZWFyID0gbmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKS5nZXRGdWxsWWVhcigpO1xyXG4gICAgICAgICAgIFxyXG4gICAgICAgICAgIGxldCBkYXRlID0gbmV3IERhdGUodGhpcy5zZWxlY3RlZERhdGUudmFsdWVPZigpKTtcclxuICAgICAgICAgICBkYXRlLnNldEZ1bGxZZWFyKHllYXIpO1xyXG4gICAgICAgICAgIFxyXG4gICAgICAgICAgIHRyaWdnZXIuem9vbUluKGVsZW1lbnQsIHtcclxuICAgICAgICAgICAgICAgZGF0ZTogZGF0ZSxcclxuICAgICAgICAgICAgICAgY3VycmVudExldmVsOiBMZXZlbC5ZRUFSXHJcbiAgICAgICAgICAgfSlcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4uZG93bihjb250YWluZXIsICdkYXRpdW0teWVhci1lbGVtZW50JywgKGUpID0+IHtcclxuICAgICAgICAgICAgbGV0IGVsOkhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PihlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQpO1xyXG4gICAgICAgICAgICBsZXQgdGV4dCA9IG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSkuZ2V0RnVsbFllYXIoKS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICBsZXQgb2Zmc2V0ID0gdGhpcy5nZXRPZmZzZXQoZWwpO1xyXG4gICAgICAgICAgICB0cmlnZ2VyLm9wZW5CdWJibGUoZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgeDogb2Zmc2V0LnggKyAzNSxcclxuICAgICAgICAgICAgICAgIHk6IG9mZnNldC55ICsgMTUsXHJcbiAgICAgICAgICAgICAgICB0ZXh0OiB0ZXh0XHJcbiAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBjcmVhdGUoZGF0ZTpEYXRlLCB0cmFuc2l0aW9uOlRyYW5zaXRpb24pIHtcclxuICAgICAgICB0aGlzLm1pbiA9IG5ldyBEYXRlKE1hdGguZmxvb3IoZGF0ZS5nZXRGdWxsWWVhcigpLzEwKSoxMCwgMCk7XHJcbiAgICAgICAgdGhpcy5tYXggPSBuZXcgRGF0ZShNYXRoLmNlaWwoZGF0ZS5nZXRGdWxsWWVhcigpLzEwKSoxMCwgMCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMubWluLnZhbHVlT2YoKSA9PT0gdGhpcy5tYXgudmFsdWVPZigpKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWF4LnNldEZ1bGxZZWFyKHRoaXMubWF4LmdldEZ1bGxZZWFyKCkgKyAxMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBpdGVyYXRvciA9IG5ldyBEYXRlKHRoaXMubWluLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5waWNrZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tcGlja2VyJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uSW4odHJhbnNpdGlvbiwgdGhpcy5waWNrZXIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgICAgbGV0IG5leHQgPSBuZXcgRGF0ZShpdGVyYXRvci52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgICBuZXh0LnNldEZ1bGxZZWFyKG5leHQuZ2V0RnVsbFllYXIoKSArIDEpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IHllYXJFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXllYXItZWxlbWVudCcpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgeWVhckVsZW1lbnQuaW5uZXJIVE1MID0gaXRlcmF0b3IuZ2V0RnVsbFllYXIoKS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKG5leHQudmFsdWVPZigpID4gdGhpcy5vcHRpb25zLm1pbkRhdGUudmFsdWVPZigpICYmXHJcbiAgICAgICAgICAgICAgICBpdGVyYXRvci52YWx1ZU9mKCkgPCB0aGlzLm9wdGlvbnMubWF4RGF0ZS52YWx1ZU9mKCkgJiZcclxuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5pc1llYXJTZWxlY3RhYmxlKGl0ZXJhdG9yKSkge1xyXG4gICAgICAgICAgICAgICAgeWVhckVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScsIGl0ZXJhdG9yLnRvSVNPU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLnBpY2tlci5hcHBlbmRDaGlsZCh5ZWFyRWxlbWVudCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpdGVyYXRvciA9IG5leHQ7XHJcbiAgICAgICAgfSB3aGlsZSAoaXRlcmF0b3IudmFsdWVPZigpIDw9IHRoaXMubWF4LnZhbHVlT2YoKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5hdHRhY2goKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnNldFNlbGVjdGVkRGF0ZSh0aGlzLnNlbGVjdGVkRGF0ZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBzZXRTZWxlY3RlZERhdGUoc2VsZWN0ZWREYXRlOkRhdGUpIHtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkRGF0ZSA9IG5ldyBEYXRlKHNlbGVjdGVkRGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCB5ZWFyRWxlbWVudHMgPSB0aGlzLnBpY2tlckNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCdkYXRpdW0teWVhci1lbGVtZW50Jyk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB5ZWFyRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGVsID0geWVhckVsZW1lbnRzLml0ZW0oaSk7XHJcbiAgICAgICAgICAgIGxldCBkYXRlID0gbmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKTtcclxuICAgICAgICAgICAgaWYgKGRhdGUuZ2V0RnVsbFllYXIoKSA9PT0gc2VsZWN0ZWREYXRlLmdldEZ1bGxZZWFyKCkpIHtcclxuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1zZWxlY3RlZCcpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZGF0aXVtLXNlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRIZWlnaHQoKSB7XHJcbiAgICAgICAgcmV0dXJuIDE4MDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldExldmVsKCkge1xyXG4gICAgICAgIHJldHVybiBMZXZlbC5ZRUFSO1xyXG4gICAgfVxyXG59IiwidmFyIGNzcz1cImRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1oZWFkZXIsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci1jb250YWluZXJ7d2lkdGg6Y2FsYygxMDAlIC0gMTRweCk7Ym94LXNoYWRvdzowIDNweCA2cHggcmdiYSgwLDAsMCwuMTYpLDAgM3B4IDZweCByZ2JhKDAsMCwwLC4yMyk7b3ZlcmZsb3c6aGlkZGVufWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1idWJibGUsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWhlYWRlcixkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLWNvbnRhaW5lcntib3gtc2hhZG93OjAgM3B4IDZweCByZ2JhKDAsMCwwLC4xNiksMCAzcHggNnB4IHJnYmEoMCwwLDAsLjIzKX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0taGVhZGVyLXdyYXBwZXJ7b3ZlcmZsb3c6aGlkZGVuO3Bvc2l0aW9uOmFic29sdXRlO2xlZnQ6LTdweDtyaWdodDotN3B4O3RvcDotN3B4O2hlaWdodDo4N3B4O2Rpc3BsYXk6YmxvY2s7cG9pbnRlci1ldmVudHM6bm9uZX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0taGVhZGVye3Bvc2l0aW9uOnJlbGF0aXZlO2Rpc3BsYXk6YmxvY2s7aGVpZ2h0OjEwMHB4O2JhY2tncm91bmQtY29sb3I6X3ByaW1hcnk7Ym9yZGVyLXRvcC1sZWZ0LXJhZGl1czozcHg7Ym9yZGVyLXRvcC1yaWdodC1yYWRpdXM6M3B4O3otaW5kZXg6MTttYXJnaW46N3B4O3BvaW50ZXItZXZlbnRzOmF1dG99ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXNwYW4tbGFiZWwtY29udGFpbmVye3Bvc2l0aW9uOmFic29sdXRlO2xlZnQ6NDBweDtyaWdodDo0MHB4O3RvcDowO2JvdHRvbTowO2Rpc3BsYXk6YmxvY2s7b3ZlcmZsb3c6aGlkZGVuO3RyYW5zaXRpb246LjJzIGVhc2UgYWxsO3RyYW5zZm9ybS1vcmlnaW46NDBweCA0MHB4fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1zcGFuLWxhYmVse3Bvc2l0aW9uOmFic29sdXRlO2ZvbnQtc2l6ZToxOHB0O2NvbG9yOl9wcmltYXJ5X3RleHQ7Zm9udC13ZWlnaHQ6NzAwO3RyYW5zZm9ybS1vcmlnaW46MCAwO3doaXRlLXNwYWNlOm5vd3JhcDt0cmFuc2l0aW9uOmFsbCAuMnMgZWFzZTt0ZXh0LXRyYW5zZm9ybTp1cHBlcmNhc2V9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXNwYW4tbGFiZWwuZGF0aXVtLXRvcHt0cmFuc2Zvcm06dHJhbnNsYXRlWSgxN3B4KSBzY2FsZSguNjYpO3dpZHRoOjE1MSU7b3BhY2l0eTouNn1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc3Bhbi1sYWJlbC5kYXRpdW0tYm90dG9te3RyYW5zZm9ybTp0cmFuc2xhdGVZKDM2cHgpIHNjYWxlKDEpO3dpZHRoOjEwMCU7b3BhY2l0eToxfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS10b3AuZGF0aXVtLWhpZGRlbnt0cmFuc2Zvcm06dHJhbnNsYXRlWSg1cHgpIHNjYWxlKC40KTtvcGFjaXR5OjB9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXNwYW4tbGFiZWwuZGF0aXVtLWJvdHRvbS5kYXRpdW0taGlkZGVue3RyYW5zZm9ybTp0cmFuc2xhdGVZKDc4cHgpIHNjYWxlKDEuMik7b3BhY2l0eToxfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1zcGFuLWxhYmVsOmFmdGVye2NvbnRlbnQ6Jyc7ZGlzcGxheTppbmxpbmUtYmxvY2s7cG9zaXRpb246YWJzb2x1dGU7bWFyZ2luLWxlZnQ6MTBweDttYXJnaW4tdG9wOjZweDtoZWlnaHQ6MTdweDt3aWR0aDoxN3B4O29wYWNpdHk6MDt0cmFuc2l0aW9uOmFsbCAuMnMgZWFzZTtiYWNrZ3JvdW5kOnVybChkYXRhOmltYWdlL3N2Zyt4bWw7dXRmOCwlM0NzdmclMjB4bWxucyUzRCUyMmh0dHAlM0ElMkYlMkZ3d3cudzMub3JnJTJGMjAwMCUyRnN2ZyUyMiUzRSUzQ2clMjBmaWxsJTNEJTIyX3ByaW1hcnlfdGV4dCUyMiUzRSUzQ3BhdGglMjBkJTNEJTIyTTE3JTIwMTVsLTIlMjAyLTUtNSUyMDItMnolMjIlMjBmaWxsLXJ1bGUlM0QlMjJldmVub2RkJTIyJTJGJTNFJTNDcGF0aCUyMGQlM0QlMjJNNyUyMDBhNyUyMDclMjAwJTIwMCUyMDAtNyUyMDclMjA3JTIwNyUyMDAlMjAwJTIwMCUyMDclMjA3JTIwNyUyMDclMjAwJTIwMCUyMDAlMjA3LTclMjA3JTIwNyUyMDAlMjAwJTIwMC03LTd6bTAlMjAyYTUlMjA1JTIwMCUyMDAlMjAxJTIwNSUyMDUlMjA1JTIwNSUyMDAlMjAwJTIwMS01JTIwNSUyMDUlMjA1JTIwMCUyMDAlMjAxLTUtNSUyMDUlMjA1JTIwMCUyMDAlMjAxJTIwNS01eiUyMiUyRiUzRSUzQ3BhdGglMjBkJTNEJTIyTTQlMjA2aDZ2Mkg0eiUyMiUyRiUzRSUzQyUyRmclM0UlM0MlMkZzdmclM0UpfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1idWJibGUsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWJ1YmJsZS5kYXRpdW0tYnViYmxlLXZpc2libGV7dHJhbnNpdGlvbi1wcm9wZXJ0eTp0cmFuc2Zvcm0sb3BhY2l0eTt0cmFuc2l0aW9uLXRpbWluZy1mdW5jdGlvbjplYXNlO3RyYW5zaXRpb24tZHVyYXRpb246LjJzfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS10b3A6YWZ0ZXJ7b3BhY2l0eToxfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1zcGFuLWxhYmVsIGRhdGl1bS12YXJpYWJsZXtjb2xvcjpfcHJpbWFyeTtmb250LXNpemU6MTRwdDtwYWRkaW5nOjAgNHB4O21hcmdpbjowIDJweDt0b3A6LTJweDtwb3NpdGlvbjpyZWxhdGl2ZX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc3Bhbi1sYWJlbCBkYXRpdW0tdmFyaWFibGU6YmVmb3Jle2NvbnRlbnQ6Jyc7cG9zaXRpb246YWJzb2x1dGU7bGVmdDowO3RvcDowO3JpZ2h0OjA7Ym90dG9tOjA7Ym9yZGVyLXJhZGl1czo1cHg7YmFja2dyb3VuZC1jb2xvcjpfcHJpbWFyeV90ZXh0O3otaW5kZXg6LTE7b3BhY2l0eTouN31kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc3Bhbi1sYWJlbCBkYXRpdW0tbG93ZXJ7dGV4dC10cmFuc2Zvcm06bG93ZXJjYXNlfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1uZXh0LGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1wcmV2e3Bvc2l0aW9uOmFic29sdXRlO3dpZHRoOjQwcHg7dG9wOjA7Ym90dG9tOjA7dHJhbnNmb3JtLW9yaWdpbjoyMHB4IDUycHh9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW5leHQ6YWZ0ZXIsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW5leHQ6YmVmb3JlLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1wcmV2OmFmdGVyLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1wcmV2OmJlZm9yZXtjb250ZW50OicnO3Bvc2l0aW9uOmFic29sdXRlO2Rpc3BsYXk6YmxvY2s7d2lkdGg6M3B4O2hlaWdodDo4cHg7bGVmdDo1MCU7YmFja2dyb3VuZC1jb2xvcjpfcHJpbWFyeV90ZXh0O3RvcDo0OHB4fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1uZXh0LmRhdGl1bS1hY3RpdmUsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXByZXYuZGF0aXVtLWFjdGl2ZXt0cmFuc2Zvcm06c2NhbGUoLjkpO29wYWNpdHk6Ljl9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXByZXZ7bGVmdDowfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1wcmV2OmFmdGVyLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1wcmV2OmJlZm9yZXttYXJnaW4tbGVmdDotM3B4fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1uZXh0e3JpZ2h0OjB9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXByZXY6YmVmb3Jle3RyYW5zZm9ybTpyb3RhdGUoNDVkZWcpIHRyYW5zbGF0ZVkoLTIuNnB4KX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcHJldjphZnRlcnt0cmFuc2Zvcm06cm90YXRlKC00NWRlZykgdHJhbnNsYXRlWSgyLjZweCl9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW5leHQ6YmVmb3Jle3RyYW5zZm9ybTpyb3RhdGUoNDVkZWcpIHRyYW5zbGF0ZVkoMi42cHgpfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1uZXh0OmFmdGVye3RyYW5zZm9ybTpyb3RhdGUoLTQ1ZGVnKSB0cmFuc2xhdGVZKC0yLjZweCl9ZGF0aXVtLWNvbnRhaW5lci5faWR7ZGlzcGxheTpibG9jaztwb3NpdGlvbjphYnNvbHV0ZTt3aWR0aDoyODBweDtmb250LWZhbWlseTpSb2JvdG8sQXJpYWw7bWFyZ2luLXRvcDoycHg7Zm9udC1zaXplOjE2cHh9ZGF0aXVtLWNvbnRhaW5lci5faWQsZGF0aXVtLWNvbnRhaW5lci5faWQgKnstd2Via2l0LXRvdWNoLWNhbGxvdXQ6bm9uZTstd2Via2l0LXVzZXItc2VsZWN0Om5vbmU7LWtodG1sLXVzZXItc2VsZWN0Om5vbmU7LW1vei11c2VyLXNlbGVjdDpub25lOy1tcy11c2VyLXNlbGVjdDpub25lOy13ZWJraXQtdGFwLWhpZ2hsaWdodC1jb2xvcjp0cmFuc3BhcmVudDtjdXJzb3I6ZGVmYXVsdH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tYnViYmxle3Bvc2l0aW9uOmFic29sdXRlO3dpZHRoOjUwcHg7bGluZS1oZWlnaHQ6MjZweDt0ZXh0LWFsaWduOmNlbnRlcjtmb250LXNpemU6MTRweDtiYWNrZ3JvdW5kLWNvbG9yOl9zZWNvbmRhcnlfYWNjZW50O2ZvbnQtd2VpZ2h0OjcwMDtib3JkZXItcmFkaXVzOjNweDttYXJnaW4tbGVmdDotMjVweDttYXJnaW4tdG9wOi0zMnB4O2NvbG9yOl9zZWNvbmRhcnk7ei1pbmRleDoxO3RyYW5zZm9ybS1vcmlnaW46MzBweCAzNnB4O3RyYW5zaXRpb24tZGVsYXk6MDt0cmFuc2Zvcm06c2NhbGUoLjUpO29wYWNpdHk6MH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tYnViYmxlOmFmdGVye2NvbnRlbnQ6Jyc7cG9zaXRpb246YWJzb2x1dGU7ZGlzcGxheTpibG9jazt3aWR0aDoxMHB4O2hlaWdodDoxMHB4O3RyYW5zZm9ybTpyb3RhdGUoNDVkZWcpO2JhY2tncm91bmQ6bGluZWFyLWdyYWRpZW50KDEzNWRlZyxyZ2JhKDAsMCwwLDApIDUwJSxfc2Vjb25kYXJ5X2FjY2VudCA1MCUpO2xlZnQ6NTAlO3RvcDoyMHB4O21hcmdpbi1sZWZ0Oi01cHh9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWJ1YmJsZS5kYXRpdW0tYnViYmxlLXZpc2libGV7dHJhbnNmb3JtOnNjYWxlKDEpO29wYWNpdHk6MTt0cmFuc2l0aW9uLWRlbGF5Oi4yc31kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLWNvbnRhaW5lci13cmFwcGVye292ZXJmbG93OmhpZGRlbjtwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0Oi03cHg7cmlnaHQ6LTdweDt0b3A6ODBweDtoZWlnaHQ6MjcwcHg7ZGlzcGxheTpibG9jaztwb2ludGVyLWV2ZW50czpub25lfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXItY29udGFpbmVye3Bvc2l0aW9uOnJlbGF0aXZlO2hlaWdodDoyNjBweDtiYWNrZ3JvdW5kLWNvbG9yOl9zZWNvbmRhcnk7ZGlzcGxheTpibG9jazttYXJnaW46MCA3cHggN3B4O3BhZGRpbmctdG9wOjIwcHg7dHJhbnNmb3JtOnRyYW5zbGF0ZVkoLTI3MHB4KTtwb2ludGVyLWV2ZW50czphdXRvO2JvcmRlci1ib3R0b20tcmlnaHQtcmFkaXVzOjNweDtib3JkZXItYm90dG9tLWxlZnQtcmFkaXVzOjNweDt0cmFuc2l0aW9uOmFsbCBlYXNlIC40czt0cmFuc2l0aW9uLWRlbGF5Oi4xc31kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2Vye3Bvc2l0aW9uOmFic29sdXRlO2xlZnQ6MDtyaWdodDowO2JvdHRvbTowO2NvbG9yOl9zZWNvbmRhcnlfdGV4dDt0cmFuc2l0aW9uOmFsbCBlYXNlIC40c31kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1waWNrZXItbGVmdHt0cmFuc2Zvcm06dHJhbnNsYXRlWCgtMTAwJSkgc2NhbGUoMSk7cG9pbnRlci1ldmVudHM6bm9uZTt0cmFuc2l0aW9uLWRlbGF5OjBzfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLXBpY2tlci1yaWdodHt0cmFuc2Zvcm06dHJhbnNsYXRlWCgxMDAlKSBzY2FsZSgxKTtwb2ludGVyLWV2ZW50czpub25lO3RyYW5zaXRpb24tZGVsYXk6MHN9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tcGlja2VyLW91dHt0cmFuc2Zvcm06dHJhbnNsYXRlWCgwKSBzY2FsZSgxLjQpO29wYWNpdHk6MDtwb2ludGVyLWV2ZW50czpub25lO3RyYW5zaXRpb24tZGVsYXk6MHN9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tcGlja2VyLWlue3RyYW5zZm9ybTp0cmFuc2xhdGVYKDApIHNjYWxlKC42KTtvcGFjaXR5OjA7cG9pbnRlci1ldmVudHM6bm9uZTt0cmFuc2l0aW9uLWRlbGF5OjBzfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tb250aC1lbGVtZW50LGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS15ZWFyLWVsZW1lbnR7ZGlzcGxheTppbmxpbmUtYmxvY2s7d2lkdGg6MjUlO2xpbmUtaGVpZ2h0OjYwcHg7dGV4dC1hbGlnbjpjZW50ZXI7cG9zaXRpb246cmVsYXRpdmU7dHJhbnNpdGlvbjouMnMgZWFzZSBhbGx9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1vbnRoLWVsZW1lbnQuZGF0aXVtLXNlbGVjdGVkOmFmdGVyLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS15ZWFyLWVsZW1lbnQuZGF0aXVtLXNlbGVjdGVkOmFmdGVye2NvbnRlbnQ6Jyc7cG9zaXRpb246YWJzb2x1dGU7bGVmdDoyMHB4O3JpZ2h0OjIwcHg7dG9wOjUwJTttYXJnaW4tdG9wOjExcHg7aGVpZ2h0OjJweDtkaXNwbGF5OmJsb2NrO2JhY2tncm91bmQtY29sb3I6X3NlY29uZGFyeV9hY2NlbnR9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1vbnRoLWVsZW1lbnQuZGF0aXVtLWFjdGl2ZSxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0teWVhci1lbGVtZW50LmRhdGl1bS1hY3RpdmV7dHJhbnNmb3JtOnNjYWxlKC45KTt0cmFuc2l0aW9uOm5vbmV9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1vbnRoLWVsZW1lbnQ6bm90KFtkYXRpdW0tZGF0YV0pLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS15ZWFyLWVsZW1lbnQ6bm90KFtkYXRpdW0tZGF0YV0pe29wYWNpdHk6LjQ7cG9pbnRlci1ldmVudHM6bm9uZX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbW9udGgtZWxlbWVudC5kYXRpdW0tc2VsZWN0ZWQ6YWZ0ZXJ7bGVmdDoyNXB4O3JpZ2h0OjI1cHh9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWRhdGUtaGVhZGVye2Rpc3BsYXk6aW5saW5lLWJsb2NrO3dpZHRoOjQwcHg7bGluZS1oZWlnaHQ6MjhweDtvcGFjaXR5Oi40O2ZvbnQtd2VpZ2h0OjcwMDt0ZXh0LWFsaWduOmNlbnRlcn1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tZGF0ZS1lbGVtZW50e2Rpc3BsYXk6aW5saW5lLWJsb2NrO3dpZHRoOjQwcHg7bGluZS1oZWlnaHQ6MzZweDt0ZXh0LWFsaWduOmNlbnRlcjtwb3NpdGlvbjpyZWxhdGl2ZTt0cmFuc2l0aW9uOi4ycyBlYXNlIGFsbH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tZGF0ZS1lbGVtZW50LmRhdGl1bS1zZWxlY3RlZDphZnRlcntjb250ZW50OicnO3Bvc2l0aW9uOmFic29sdXRlO2xlZnQ6MTJweDtyaWdodDoxMnB4O3RvcDo1MCU7bWFyZ2luLXRvcDoxMHB4O2hlaWdodDoycHg7ZGlzcGxheTpibG9jaztiYWNrZ3JvdW5kLWNvbG9yOl9zZWNvbmRhcnlfYWNjZW50fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1kYXRlLWVsZW1lbnQuZGF0aXVtLWFjdGl2ZXt0cmFuc2Zvcm06c2NhbGUoLjkpO3RyYW5zaXRpb246bm9uZX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tZGF0ZS1lbGVtZW50Om5vdChbZGF0aXVtLWRhdGFdKXtvcGFjaXR5Oi40O3BvaW50ZXItZXZlbnRzOm5vbmV9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0taG91ci1waWNrZXIsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tbWludXRlLXBpY2tlcixkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1zZWNvbmQtcGlja2Vye2hlaWdodDoyNDBweH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1ob3VyLXBpY2tlcjpiZWZvcmUsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tbWludXRlLXBpY2tlcjpiZWZvcmUsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tc2Vjb25kLXBpY2tlcjpiZWZvcmV7Y29udGVudDonJzt3aWR0aDoxNDBweDtoZWlnaHQ6MTQwcHg7cG9zaXRpb246YWJzb2x1dGU7Ym9yZGVyOjFweCBzb2xpZDtsZWZ0OjUwJTt0b3A6NTAlO21hcmdpbi1sZWZ0Oi03MXB4O21hcmdpbi10b3A6LTcxcHg7Ym9yZGVyLXJhZGl1czo3MHB4O29wYWNpdHk6LjV9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0taG91ci1waWNrZXI6YWZ0ZXIsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tbWludXRlLXBpY2tlcjphZnRlcixkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1zZWNvbmQtcGlja2VyOmFmdGVye2NvbnRlbnQ6Jyc7d2lkdGg6NHB4O2hlaWdodDo0cHg7bWFyZ2luLWxlZnQ6LTRweDttYXJnaW4tdG9wOi00cHg7dG9wOjUwJTtsZWZ0OjUwJTtib3JkZXItcmFkaXVzOjRweDtwb3NpdGlvbjphYnNvbHV0ZTtib3JkZXI6MnB4IHNvbGlkO2JvcmRlci1jb2xvcjpfc2Vjb25kYXJ5X2FjY2VudDtiYWNrZ3JvdW5kLWNvbG9yOl9zZWNvbmRhcnk7Ym94LXNoYWRvdzowIDAgMCAycHggX3NlY29uZGFyeX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tdGlja3twb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjUwJTt0b3A6NTAlO3dpZHRoOjJweDtoZWlnaHQ6NzBweDttYXJnaW4tbGVmdDotMXB4O3RyYW5zZm9ybS1vcmlnaW46MXB4IDB9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXRpY2s6YWZ0ZXJ7Y29udGVudDonJztwb3NpdGlvbjphYnNvbHV0ZTt3aWR0aDoycHg7aGVpZ2h0OjZweDtiYWNrZ3JvdW5kLWNvbG9yOl9zZWNvbmRhcnlfdGV4dDtib3R0b206LTRweDtvcGFjaXR5Oi41fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tZXJpZGllbS1zd2l0Y2hlcntwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjUwJTttYXJnaW4tbGVmdDotMzBweDt0b3A6NTAlO21hcmdpbi10b3A6MTVweDtkaXNwbGF5OmJsb2NrO3dpZHRoOjYwcHg7aGVpZ2h0OjQwcHh9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1lcmlkaWVtLXN3aXRjaGVyOmFmdGVyLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tZXJpZGllbS1zd2l0Y2hlcjpiZWZvcmV7cG9zaXRpb246YWJzb2x1dGU7d2lkdGg6MzBweDt0b3A6MDtkaXNwbGF5OmJsb2NrO2xpbmUtaGVpZ2h0OjQwcHg7Zm9udC13ZWlnaHQ6NzAwO3RleHQtYWxpZ246Y2VudGVyO2ZvbnQtc2l6ZToxNHB4O3RyYW5zZm9ybTpzY2FsZSguOSk7b3BhY2l0eTouOTtjb2xvcjpfc2Vjb25kYXJ5X3RleHQ7dHJhbnNpdGlvbjphbGwgZWFzZSAuMnN9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1lcmlkaWVtLXN3aXRjaGVyLmRhdGl1bS1taWxpdGFyeS10aW1lOmJlZm9yZXtjb250ZW50OictMTInfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tZXJpZGllbS1zd2l0Y2hlci5kYXRpdW0tbWlsaXRhcnktdGltZTphZnRlcntjb250ZW50OicrMTInfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tZXJpZGllbS1zd2l0Y2hlcjpiZWZvcmV7Y29udGVudDonQU0nO2xlZnQ6MH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbWVyaWRpZW0tc3dpdGNoZXI6YWZ0ZXJ7Y29udGVudDonUE0nO3JpZ2h0OjB9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1lcmlkaWVtLXN3aXRjaGVyLmRhdGl1bS1hbS1zZWxlY3RlZDpiZWZvcmUsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1lcmlkaWVtLXN3aXRjaGVyLmRhdGl1bS1wbS1zZWxlY3RlZDphZnRlcnt0cmFuc2Zvcm06c2NhbGUoMSk7Y29sb3I6X3NlY29uZGFyeV9hY2NlbnQ7b3BhY2l0eToxfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tZXJpZGllbS1zd2l0Y2hlci5kYXRpdW0tYWN0aXZlOmFmdGVyLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tZXJpZGllbS1zd2l0Y2hlci5kYXRpdW0tYWN0aXZlOmJlZm9yZXt0cmFuc2l0aW9uOm5vbmV9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1lcmlkaWVtLXN3aXRjaGVyLmRhdGl1bS1hY3RpdmUuZGF0aXVtLWFtLXNlbGVjdGVkOmJlZm9yZXt0cmFuc2Zvcm06c2NhbGUoLjkpfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tZXJpZGllbS1zd2l0Y2hlci5kYXRpdW0tYWN0aXZlLmRhdGl1bS1hbS1zZWxlY3RlZDphZnRlcixkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbWVyaWRpZW0tc3dpdGNoZXIuZGF0aXVtLWFjdGl2ZS5kYXRpdW0tcG0tc2VsZWN0ZWQ6YmVmb3Jle3RyYW5zZm9ybTpzY2FsZSguOCl9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1lcmlkaWVtLXN3aXRjaGVyLmRhdGl1bS1hY3RpdmUuZGF0aXVtLXBtLXNlbGVjdGVkOmFmdGVye3RyYW5zZm9ybTpzY2FsZSguOSl9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXRpY2stbGFiZWwtY29udGFpbmVye3Bvc2l0aW9uOmFic29sdXRlO2JvdHRvbTotNTBweDtsZWZ0Oi0yNHB4O2Rpc3BsYXk6YmxvY2s7aGVpZ2h0OjUwcHg7d2lkdGg6NTBweH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tdGljay1sYWJlbHtwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjA7dG9wOjA7ZGlzcGxheTpibG9jazt3aWR0aDoxMDAlO2xpbmUtaGVpZ2h0OjUwcHg7Ym9yZGVyLXJhZGl1czoyNXB4O3RleHQtYWxpZ246Y2VudGVyO2ZvbnQtc2l6ZToxNHB4O3RyYW5zaXRpb246LjJzIGVhc2UgYWxsfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS10aWNrLWxhYmVsLmRhdGl1bS1hY3RpdmV7dHJhbnNmb3JtOnNjYWxlKC45KTt0cmFuc2l0aW9uOm5vbmV9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXRpY2stbGFiZWwuZGF0aXVtLWluYWN0aXZle29wYWNpdHk6LjQ7cG9pbnRlci1ldmVudHM6bm9uZX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1ob3VyLXBpY2tlci5kYXRpdW0tZHJhZ2dpbmcgZGF0aXVtLWhvdXItaGFuZCxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1ob3VyLXBpY2tlci5kYXRpdW0tZHJhZ2dpbmcgZGF0aXVtLW1pbnV0ZS1oYW5kLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLWhvdXItcGlja2VyLmRhdGl1bS1kcmFnZ2luZyBkYXRpdW0tc2Vjb25kLWhhbmQsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0taG91ci1waWNrZXIuZGF0aXVtLWRyYWdnaW5nIGRhdGl1bS10aW1lLWRyYWctYXJtLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLW1pbnV0ZS1waWNrZXIuZGF0aXVtLWRyYWdnaW5nIGRhdGl1bS1ob3VyLWhhbmQsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tbWludXRlLXBpY2tlci5kYXRpdW0tZHJhZ2dpbmcgZGF0aXVtLW1pbnV0ZS1oYW5kLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLW1pbnV0ZS1waWNrZXIuZGF0aXVtLWRyYWdnaW5nIGRhdGl1bS1zZWNvbmQtaGFuZCxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1taW51dGUtcGlja2VyLmRhdGl1bS1kcmFnZ2luZyBkYXRpdW0tdGltZS1kcmFnLWFybSxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1zZWNvbmQtcGlja2VyLmRhdGl1bS1kcmFnZ2luZyBkYXRpdW0taG91ci1oYW5kLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLXNlY29uZC1waWNrZXIuZGF0aXVtLWRyYWdnaW5nIGRhdGl1bS1taW51dGUtaGFuZCxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1zZWNvbmQtcGlja2VyLmRhdGl1bS1kcmFnZ2luZyBkYXRpdW0tc2Vjb25kLWhhbmQsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tc2Vjb25kLXBpY2tlci5kYXRpdW0tZHJhZ2dpbmcgZGF0aXVtLXRpbWUtZHJhZy1hcm17dHJhbnNpdGlvbjpub25lfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1ob3VyLWhhbmQsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1pbnV0ZS1oYW5kLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1zZWNvbmQtaGFuZHtwb3NpdGlvbjphYnNvbHV0ZTtkaXNwbGF5OmJsb2NrO3dpZHRoOjA7aGVpZ2h0OjA7bGVmdDo1MCU7dG9wOjUwJTt0cmFuc2Zvcm0tb3JpZ2luOjNweCAzcHg7bWFyZ2luLWxlZnQ6LTNweDttYXJnaW4tdG9wOi0zcHg7Ym9yZGVyLWxlZnQ6M3B4IHNvbGlkIHRyYW5zcGFyZW50O2JvcmRlci1yaWdodDozcHggc29saWQgdHJhbnNwYXJlbnQ7Ym9yZGVyLXRvcC1sZWZ0LXJhZGl1czozcHg7Ym9yZGVyLXRvcC1yaWdodC1yYWRpdXM6M3B4O3RyYW5zaXRpb246LjNzIGVhc2UgYWxsfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLW1pbnV0ZS1waWNrZXIgZGF0aXVtLWhvdXItaGFuZCxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1zZWNvbmQtcGlja2VyIGRhdGl1bS1ob3VyLWhhbmQsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tc2Vjb25kLXBpY2tlciBkYXRpdW0tbWludXRlLWhhbmR7Ym9yZGVyLXRvcC1jb2xvcjpfc2Vjb25kYXJ5X3RleHQ7b3BhY2l0eTouNX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0taG91ci1oYW5ke2JvcmRlci10b3A6MzBweCBzb2xpZCBfc2Vjb25kYXJ5X2FjY2VudH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbWludXRlLWhhbmR7dHJhbnNmb3JtLW9yaWdpbjoycHggMnB4O21hcmdpbi1sZWZ0Oi0ycHg7bWFyZ2luLXRvcDotMnB4O2JvcmRlci1sZWZ0OjJweCBzb2xpZCB0cmFuc3BhcmVudDtib3JkZXItcmlnaHQ6MnB4IHNvbGlkIHRyYW5zcGFyZW50O2JvcmRlci10b3AtbGVmdC1yYWRpdXM6MnB4O2JvcmRlci10b3AtcmlnaHQtcmFkaXVzOjJweDtib3JkZXItdG9wOjQwcHggc29saWQgX3NlY29uZGFyeV9hY2NlbnR9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXNlY29uZC1oYW5ke3RyYW5zZm9ybS1vcmlnaW46MXB4IDFweDttYXJnaW4tbGVmdDotMXB4O21hcmdpbi10b3A6LTFweDtib3JkZXItbGVmdDoxcHggc29saWQgdHJhbnNwYXJlbnQ7Ym9yZGVyLXJpZ2h0OjFweCBzb2xpZCB0cmFuc3BhcmVudDtib3JkZXItdG9wLWxlZnQtcmFkaXVzOjFweDtib3JkZXItdG9wLXJpZ2h0LXJhZGl1czoxcHg7Ym9yZGVyLXRvcDo1MHB4IHNvbGlkIF9zZWNvbmRhcnlfYWNjZW50fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS10aW1lLWRyYWctYXJte3dpZHRoOjJweDtoZWlnaHQ6NzBweDtwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjUwJTt0b3A6NTAlO21hcmdpbi1sZWZ0Oi0xcHg7dHJhbnNmb3JtLW9yaWdpbjoxcHggMDt0cmFuc2Zvcm06cm90YXRlKDQ1ZGVnKTt0cmFuc2l0aW9uOi4zcyBlYXNlIGFsbH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tdGltZS1kcmFnLWFybTphZnRlcixkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tdGltZS1kcmFnLWFybTpiZWZvcmV7Y29udGVudDonJztib3JkZXI6NHB4IHNvbGlkIHRyYW5zcGFyZW50O3Bvc2l0aW9uOmFic29sdXRlO2JvdHRvbTotNHB4O2xlZnQ6MTJweDtib3JkZXItbGVmdC1jb2xvcjpfc2Vjb25kYXJ5X2FjY2VudDt0cmFuc2Zvcm0tb3JpZ2luOi0xMXB4IDRweH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tdGltZS1kcmFnLWFybTphZnRlcnt0cmFuc2Zvcm06cm90YXRlKDE4MGRlZyl9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXRpbWUtZHJhZ3tkaXNwbGF5OmJsb2NrO3Bvc2l0aW9uOmFic29sdXRlO3dpZHRoOjUwcHg7aGVpZ2h0OjUwcHg7dG9wOjEwMCU7bWFyZ2luLXRvcDotMjVweDttYXJnaW4tbGVmdDotMjRweDtib3JkZXItcmFkaXVzOjI1cHh9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXRpbWUtZHJhZzphZnRlcntjb250ZW50OicnO3dpZHRoOjEwcHg7aGVpZ2h0OjEwcHg7cG9zaXRpb246YWJzb2x1dGU7bGVmdDo1MCU7dG9wOjUwJTttYXJnaW4tbGVmdDotN3B4O21hcmdpbi10b3A6LTdweDtiYWNrZ3JvdW5kLWNvbG9yOl9zZWNvbmRhcnlfYWNjZW50O2JvcmRlcjoycHggc29saWQ7Ym9yZGVyLWNvbG9yOl9zZWNvbmRhcnk7Ym94LXNoYWRvdzowIDAgMCAycHggX3NlY29uZGFyeV9hY2NlbnQ7Ym9yZGVyLXJhZGl1czoxMHB4fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS10aW1lLWRyYWcuZGF0aXVtLWFjdGl2ZTphZnRlcnt3aWR0aDo4cHg7aGVpZ2h0OjhweDtib3JkZXI6M3B4IHNvbGlkO2JvcmRlci1jb2xvcjpfc2Vjb25kYXJ5fVwiOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
