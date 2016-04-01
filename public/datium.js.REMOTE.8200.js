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
        this.pickerManager = new PickerManager(element);
        this.updateOptions(options);
        listen.goto(element, function (e) { return _this.goto(e.date, e.level, e.update); });
        listen.zoomOut(element, function (e) { return _this.zoomOut(e.date, e.currentLevel, e.update); });
        listen.zoomIn(element, function (e) { return _this.zoomIn(e.date, e.currentLevel, e.update); });
        // TODO make sure initial goto is a valid date...
        this.goto(this.options.defaultDate, 6 /* NONE */, true);
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
        return function (date) { return date.getMinutes() % 15 === 0; };
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
        return dflt;
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
        var minDate = OptionSanitizer.sanitizeMinDate(options['minDate'], defaults.minDate);
        var maxDate = OptionSanitizer.sanitizeMaxDate(options['maxDate'], defaults.maxDate);
        var yearSelectable = OptionSanitizer.sanitizeIsYearSelectable(options['isYearSelectable'], defaults.isYearSelectable);
        var monthSelectable = OptionSanitizer.sanitizeIsMonthSelectable(options['isMonthSelectable'], defaults.isMonthSelectable);
        var dateSelectable = OptionSanitizer.sanitizeIsDateSelectable(options['isDateSelectable'], defaults.isDateSelectable);
        var hourSelectable = OptionSanitizer.sanitizeIsHourSelectable(options['isHourSelectable'], defaults.isHourSelectable);
        var minuteSelectable = OptionSanitizer.sanitizeIsMinuteSelectable(options['isMinuteSelectable'], defaults.isMinuteSelectable);
        var secondSelectable = OptionSanitizer.sanitizeIsSecondSelectable(options['isSecondSelectable'], defaults.isSecondSelectable);
        var isYearSelectable = function (d) {
            if (new Date(d.getFullYear(), 0).valueOf() > maxDate.valueOf() ||
                new Date(d.getFullYear() + 1, 0).valueOf() < minDate.valueOf())
                return false;
            return yearSelectable(d);
        };
        var isMonthSelectable = function (d) {
            if (new Date(d.getFullYear(), d.getMonth()).valueOf() > maxDate.valueOf() ||
                new Date(d.getFullYear(), d.getMonth() + 1).valueOf() < minDate.valueOf())
                return false;
            return isYearSelectable(d) &&
                monthSelectable(d);
        };
        var isDateSelectable = function (d) {
            if (new Date(d.getFullYear(), d.getMonth(), d.getDate()).valueOf() > maxDate.valueOf() ||
                new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).valueOf() < minDate.valueOf())
                return false;
            return isMonthSelectable(d) &&
                dateSelectable(d);
        };
        var isHourSelectable = function (d) {
            if (new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()).valueOf() > maxDate.valueOf() ||
                new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours() + 1).valueOf() < minDate.valueOf())
                return false;
            return isDateSelectable(d) &&
                hourSelectable(d);
        };
        var isMinuteSelectable = function (d) {
            if (new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()).valueOf() > maxDate.valueOf() ||
                new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes() + 1).valueOf() < minDate.valueOf())
                return false;
            return isHourSelectable(d) &&
                minuteSelectable(d);
        };
        var isSecondSelectable = function (d) {
            if (new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()).valueOf() > maxDate.valueOf() ||
                new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds() + 1).valueOf() < minDate.valueOf())
                return false;
            return isMinuteSelectable(d) &&
                secondSelectable(d);
        };
        var opts = {
            displayAs: OptionSanitizer.sanitizeDisplayAs(options['displayAs'], defaults.displayAs),
            minDate: minDate,
            maxDate: maxDate,
            defaultDate: OptionSanitizer.sanitizeDefaultDate(options['defaultDate'], defaults.defaultDate),
            theme: OptionSanitizer.sanitizeTheme(options['theme'], defaults.theme),
            militaryTime: OptionSanitizer.sanitizeMilitaryTime(options['militaryTime'], defaults.militaryTime),
            isSecondSelectable: isSecondSelectable,
            isMinuteSelectable: isMinuteSelectable,
            isHourSelectable: isHourSelectable,
            isDateSelectable: isDateSelectable,
            isMonthSelectable: isMonthSelectable,
            isYearSelectable: isYearSelectable
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
        console.log('blur');
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
            var dateElement = document.createElement('datium-date-element');
            dateElement.innerHTML = iterator.getDate().toString();
            if (iterator.getMonth() === date.getMonth() &&
                this.options.isDateSelectable(iterator)) {
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
            goto = this.options.isHourSelectable(newDate);
        }
        else if (this.getLevel() === 4 /* MINUTE */) {
            newDate.setMinutes(this.rotationToTime(this.rotation));
            goto = this.options.isMinuteSelectable(newDate);
        }
        else if (this.getLevel() === 5 /* SECOND */) {
            newDate.setSeconds(this.rotationToTime(this.rotation));
            goto = this.options.isHourSelectable(newDate);
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
            zoomIn = this.options.isHourSelectable(date);
        }
        else if (this.getLevel() === 4 /* MINUTE */) {
            date.setMinutes(this.rotationToTime(this.rotation));
            date = this.round(date);
            zoomIn = this.options.isMinuteSelectable(date);
        }
        else if (this.getLevel() === 5 /* SECOND */) {
            date.setSeconds(this.rotationToTime(this.rotation));
            date = this.round(date);
            zoomIn = this.options.isSecondSelectable(date);
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
        while (!this.options.isHourSelectable(ceiledDate)) {
            if (upper > 23)
                upper = 0;
            ceiledDate.setHours(upper++);
            if (this.options.isHourSelectable(ceiledDate))
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
        while (!this.options.isHourSelectable(flooredDate)) {
            if (lower < 0)
                lower = 23;
            flooredDate.setHours(lower--);
            if (this.options.isHourSelectable(flooredDate))
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
        while (!this.options.isHourSelectable(roundedDate)) {
            if (lower < 0)
                lower = 23;
            roundedDate.setHours(lower--);
            if (this.options.isHourSelectable(roundedDate))
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
            if (this.options.isHourSelectable(d)) {
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
        while (!this.options.isMinuteSelectable(ceiledDate)) {
            if (upper > 59)
                upper = 0;
            ceiledDate.setMinutes(upper++);
            if (this.options.isMinuteSelectable(ceiledDate))
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
        while (!this.options.isMinuteSelectable(flooredDate)) {
            if (lower < 0)
                lower = 59;
            flooredDate.setMinutes(lower--);
            if (this.options.isMinuteSelectable(flooredDate))
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
        while (!this.options.isMinuteSelectable(roundedDate)) {
            if (lower < 0)
                lower = 59;
            roundedDate.setMinutes(lower--);
            if (this.options.isMinuteSelectable(roundedDate))
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
            if (this.options.isMinuteSelectable(d)) {
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
            if (this.options.isMonthSelectable(iterator)) {
                monthElement.setAttribute('datium-data', iterator.toISOString());
            }
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
    SecondPicker.prototype.ceil = function (date) {
        var ceiledDate = new Date(date.valueOf());
        var upper = ceiledDate.getSeconds() + 1;
        var orig = ceiledDate.getSeconds();
        while (!this.options.isSecondSelectable(ceiledDate)) {
            if (upper > 59)
                upper = 0;
            ceiledDate.setSeconds(upper++);
            if (this.options.isSecondSelectable(ceiledDate))
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
        while (!this.options.isSecondSelectable(flooredDate)) {
            if (lower < 0)
                lower = 59;
            flooredDate.setSeconds(lower--);
            if (this.options.isSecondSelectable(flooredDate))
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
        while (!this.options.isSecondSelectable(roundedDate)) {
            if (lower < 0)
                lower = 59;
            roundedDate.setSeconds(lower--);
            if (this.options.isSecondSelectable(roundedDate))
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
                this.options.isSecondSelectable(d)) {
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
            if (this.options.isYearSelectable(iterator)) {
                yearElement.setAttribute('datium-data', iterator.toISOString());
            }
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
var css = "datium-container._id datium-header,datium-container._id datium-picker-container{width:calc(100% - 14px);box-shadow:0 3px 6px rgba(0,0,0,.16),0 3px 6px rgba(0,0,0,.23);overflow:hidden}datium-container._id datium-bubble,datium-container._id datium-header,datium-container._id datium-picker-container{box-shadow:0 3px 6px rgba(0,0,0,.16),0 3px 6px rgba(0,0,0,.23)}datium-container._id datium-header-wrapper{overflow:hidden;position:absolute;left:-7px;right:-7px;top:-7px;height:87px;display:block;pointer-events:none}datium-container._id datium-header{position:relative;display:block;height:100px;background-color:_primary;border-top-left-radius:3px;border-top-right-radius:3px;z-index:1;margin:7px;pointer-events:auto}datium-container._id datium-span-label-container{position:absolute;left:40px;right:40px;top:0;bottom:0;display:block;overflow:hidden;transition:.2s ease all;transform-origin:40px 40px}datium-container._id datium-span-label{position:absolute;font-size:18pt;color:_primary_text;font-weight:700;transform-origin:0 0;white-space:nowrap;transition:all .2s ease;text-transform:uppercase}datium-container._id datium-span-label.datium-top{transform:translateY(17px) scale(.66);width:151%;opacity:.6}datium-container._id datium-span-label.datium-bottom{transform:translateY(36px) scale(1);width:100%;opacity:1}datium-container._id datium-span-label.datium-top.datium-hidden{transform:translateY(5px) scale(.4);opacity:0}datium-container._id datium-span-label.datium-bottom.datium-hidden{transform:translateY(78px) scale(1.2);opacity:1}datium-container._id datium-span-label:after{content:'';display:inline-block;position:absolute;margin-left:10px;margin-top:6px;height:17px;width:17px;opacity:0;transition:all .2s ease;background:url(data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22_primary_text%22%3E%3Cpath%20d%3D%22M17%2015l-2%202-5-5%202-2z%22%20fill-rule%3D%22evenodd%22%2F%3E%3Cpath%20d%3D%22M7%200a7%207%200%200%200-7%207%207%207%200%200%200%207%207%207%207%200%200%200%207-7%207%207%200%200%200-7-7zm0%202a5%205%200%200%201%205%205%205%205%200%200%201-5%205%205%205%200%200%201-5-5%205%205%200%200%201%205-5z%22%2F%3E%3Cpath%20d%3D%22M4%206h6v2H4z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E)}datium-container._id datium-bubble,datium-container._id datium-bubble.datium-bubble-visible{transition-property:transform,opacity;transition-timing-function:ease;transition-duration:.2s}datium-container._id datium-span-label.datium-top:after{opacity:1}datium-container._id datium-span-label datium-variable{color:_primary;font-size:14pt;padding:0 4px;margin:0 2px;top:-2px;position:relative}datium-container._id datium-span-label datium-variable:before{content:'';position:absolute;left:0;top:0;right:0;bottom:0;border-radius:5px;background-color:_primary_text;z-index:-1;opacity:.7}datium-container._id datium-span-label datium-lower{text-transform:lowercase}datium-container._id datium-next,datium-container._id datium-prev{position:absolute;width:40px;top:0;bottom:0;transform-origin:20px 52px}datium-container._id datium-next:after,datium-container._id datium-next:before,datium-container._id datium-prev:after,datium-container._id datium-prev:before{content:'';position:absolute;display:block;width:3px;height:8px;left:50%;background-color:_primary_text;top:48px}datium-container._id datium-next.datium-active,datium-container._id datium-prev.datium-active{transform:scale(.9);opacity:.9}datium-container._id datium-prev{left:0}datium-container._id datium-prev:after,datium-container._id datium-prev:before{margin-left:-3px}datium-container._id datium-next{right:0}datium-container._id datium-prev:before{transform:rotate(45deg) translateY(-2.6px)}datium-container._id datium-prev:after{transform:rotate(-45deg) translateY(2.6px)}datium-container._id datium-next:before{transform:rotate(45deg) translateY(2.6px)}datium-container._id datium-next:after{transform:rotate(-45deg) translateY(-2.6px)}datium-container._id{display:block;position:absolute;width:280px;font-family:Roboto,Arial;margin-top:2px;font-size:16px}datium-container._id,datium-container._id *{-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;-webkit-tap-highlight-color:transparent;cursor:default}datium-container._id datium-bubble{position:absolute;width:50px;line-height:26px;text-align:center;font-size:14px;background-color:_secondary_accent;font-weight:700;border-radius:3px;margin-left:-25px;margin-top:-32px;color:_secondary;z-index:1;transform-origin:30px 36px;transition-delay:0;transform:scale(.5);opacity:0}datium-container._id datium-bubble:after{content:'';position:absolute;display:block;width:10px;height:10px;transform:rotate(45deg);background:linear-gradient(135deg,rgba(0,0,0,0) 50%,_secondary_accent 50%);left:50%;top:20px;margin-left:-5px}datium-container._id datium-bubble.datium-bubble-visible{transform:scale(1);opacity:1;transition-delay:.2s}datium-container._id datium-bubble:not(.datium-bubble-visible){opacity:0!important}datium-container._id datium-bubble.datium-bubble-inactive{opacity:.5}datium-container._id datium-picker-container-wrapper{overflow:hidden;position:absolute;left:-7px;right:-7px;top:80px;height:270px;display:block;pointer-events:none}datium-container._id datium-picker-container{position:relative;height:260px;background-color:_secondary;display:block;margin:0 7px 7px;padding-top:20px;transform:translateY(-270px);pointer-events:auto;border-bottom-right-radius:3px;border-bottom-left-radius:3px;transition:all ease .4s;transition-delay:.1s}datium-container._id datium-picker{position:absolute;left:0;right:0;bottom:0;color:_secondary_text;transition:all ease .4s}datium-container._id datium-picker.datium-picker-left{transform:translateX(-100%) scale(1);pointer-events:none;transition-delay:0s}datium-container._id datium-picker.datium-picker-right{transform:translateX(100%) scale(1);pointer-events:none;transition-delay:0s}datium-container._id datium-picker.datium-picker-out{transform:translateX(0) scale(1.4);opacity:0;pointer-events:none;transition-delay:0s}datium-container._id datium-picker.datium-picker-in{transform:translateX(0) scale(.6);opacity:0;pointer-events:none;transition-delay:0s}datium-container._id datium-month-element,datium-container._id datium-year-element{display:inline-block;width:25%;line-height:60px;text-align:center;position:relative;transition:.2s ease all}datium-container._id datium-month-element.datium-selected:after,datium-container._id datium-year-element.datium-selected:after{content:'';position:absolute;left:20px;right:20px;top:50%;margin-top:11px;height:2px;display:block;background-color:_secondary_accent}datium-container._id datium-month-element.datium-active,datium-container._id datium-year-element.datium-active{transform:scale(.9);transition:none}datium-container._id datium-month-element:not([datium-data]),datium-container._id datium-year-element:not([datium-data]){opacity:.4;pointer-events:none}datium-container._id datium-month-element.datium-selected:after{left:25px;right:25px}datium-container._id datium-date-header{display:inline-block;width:40px;line-height:28px;opacity:.6;font-weight:700;text-align:center}datium-container._id datium-date-element{display:inline-block;width:40px;line-height:36px;text-align:center;position:relative;transition:.2s ease all}datium-container._id datium-date-element.datium-selected:after{content:'';position:absolute;left:12px;right:12px;top:50%;margin-top:10px;height:2px;display:block;background-color:_secondary_accent}datium-container._id datium-date-element.datium-active{transform:scale(.9);transition:none}datium-container._id datium-date-element:not([datium-data]){opacity:.4;pointer-events:none}datium-container._id datium-picker.datium-hour-picker,datium-container._id datium-picker.datium-minute-picker,datium-container._id datium-picker.datium-second-picker{height:240px}datium-container._id datium-picker.datium-hour-picker:before,datium-container._id datium-picker.datium-minute-picker:before,datium-container._id datium-picker.datium-second-picker:before{content:'';width:140px;height:140px;position:absolute;border:1px solid;left:50%;top:50%;margin-left:-71px;margin-top:-71px;border-radius:70px;opacity:.5}datium-container._id datium-picker.datium-hour-picker:after,datium-container._id datium-picker.datium-minute-picker:after,datium-container._id datium-picker.datium-second-picker:after{content:'';width:4px;height:4px;margin-left:-4px;margin-top:-4px;top:50%;left:50%;border-radius:4px;position:absolute;border:2px solid;border-color:_secondary_accent;background-color:_secondary;box-shadow:0 0 0 2px _secondary}datium-container._id datium-tick{position:absolute;left:50%;top:50%;width:2px;height:70px;margin-left:-1px;transform-origin:1px 0}datium-container._id datium-tick:after{content:'';position:absolute;width:2px;height:6px;background-color:_secondary_text;bottom:-4px;opacity:.5}datium-container._id datium-meridiem-switcher{position:absolute;left:50%;margin-left:-30px;top:50%;margin-top:15px;display:block;width:60px;height:40px}datium-container._id datium-meridiem-switcher:after,datium-container._id datium-meridiem-switcher:before{position:absolute;width:30px;top:0;display:block;line-height:40px;font-weight:700;text-align:center;font-size:14px;transform:scale(.9);opacity:.9;color:_secondary_text;transition:all ease .2s}datium-container._id datium-meridiem-switcher.datium-military-time:before{content:'-12'}datium-container._id datium-meridiem-switcher.datium-military-time:after{content:'+12'}datium-container._id datium-meridiem-switcher:before{content:'AM';left:0}datium-container._id datium-meridiem-switcher:after{content:'PM';right:0}datium-container._id datium-meridiem-switcher.datium-am-selected:before,datium-container._id datium-meridiem-switcher.datium-pm-selected:after{transform:scale(1);color:_secondary_accent;opacity:1}datium-container._id datium-meridiem-switcher.datium-active:after,datium-container._id datium-meridiem-switcher.datium-active:before{transition:none}datium-container._id datium-meridiem-switcher.datium-active.datium-am-selected:before{transform:scale(.9)}datium-container._id datium-meridiem-switcher.datium-active.datium-am-selected:after,datium-container._id datium-meridiem-switcher.datium-active.datium-pm-selected:before{transform:scale(.8)}datium-container._id datium-meridiem-switcher.datium-active.datium-pm-selected:after{transform:scale(.9)}datium-container._id datium-tick-label-container{position:absolute;bottom:-50px;left:-24px;display:block;height:50px;width:50px}datium-container._id datium-tick-label{position:absolute;left:0;top:0;display:block;width:100%;line-height:50px;border-radius:25px;text-align:center;font-size:14px;transition:.2s ease all}datium-container._id datium-tick-label.datium-active{transform:scale(.9);transition:none}datium-container._id datium-tick-label.datium-inactive{opacity:.4;pointer-events:none}datium-container._id datium-picker.datium-hour-picker.datium-dragging datium-hour-hand,datium-container._id datium-picker.datium-hour-picker.datium-dragging datium-minute-hand,datium-container._id datium-picker.datium-hour-picker.datium-dragging datium-second-hand,datium-container._id datium-picker.datium-hour-picker.datium-dragging datium-time-drag-arm,datium-container._id datium-picker.datium-minute-picker.datium-dragging datium-hour-hand,datium-container._id datium-picker.datium-minute-picker.datium-dragging datium-minute-hand,datium-container._id datium-picker.datium-minute-picker.datium-dragging datium-second-hand,datium-container._id datium-picker.datium-minute-picker.datium-dragging datium-time-drag-arm,datium-container._id datium-picker.datium-second-picker.datium-dragging datium-hour-hand,datium-container._id datium-picker.datium-second-picker.datium-dragging datium-minute-hand,datium-container._id datium-picker.datium-second-picker.datium-dragging datium-second-hand,datium-container._id datium-picker.datium-second-picker.datium-dragging datium-time-drag-arm{transition:none}datium-container._id datium-hour-hand,datium-container._id datium-minute-hand,datium-container._id datium-second-hand{position:absolute;display:block;width:0;height:0;left:50%;top:50%;transform-origin:3px 3px;margin-left:-3px;margin-top:-3px;border-left:3px solid transparent;border-right:3px solid transparent;border-top-left-radius:3px;border-top-right-radius:3px;transition:.3s ease all}datium-container._id datium-picker.datium-minute-picker datium-hour-hand,datium-container._id datium-picker.datium-second-picker datium-hour-hand,datium-container._id datium-picker.datium-second-picker datium-minute-hand{border-top-color:_secondary_text;opacity:.5}datium-container._id datium-hour-hand{border-top:30px solid _secondary_accent}datium-container._id datium-minute-hand{transform-origin:2px 2px;margin-left:-2px;margin-top:-2px;border-left:2px solid transparent;border-right:2px solid transparent;border-top-left-radius:2px;border-top-right-radius:2px;border-top:40px solid _secondary_accent}datium-container._id datium-second-hand{transform-origin:1px 1px;margin-left:-1px;margin-top:-1px;border-left:1px solid transparent;border-right:1px solid transparent;border-top-left-radius:1px;border-top-right-radius:1px;border-top:50px solid _secondary_accent}datium-container._id datium-time-drag-arm{width:2px;height:70px;position:absolute;left:50%;top:50%;margin-left:-1px;transform-origin:1px 0;transform:rotate(45deg);transition:.3s ease all}datium-container._id datium-time-drag-arm:after,datium-container._id datium-time-drag-arm:before{content:'';border:4px solid transparent;position:absolute;bottom:-4px;left:12px;border-left-color:_secondary_accent;transform-origin:-11px 4px}datium-container._id datium-time-drag-arm:after{transform:rotate(180deg)}datium-container._id datium-time-drag{display:block;position:absolute;width:50px;height:50px;top:100%;margin-top:-25px;margin-left:-24px;border-radius:25px}datium-container._id datium-time-drag:after{content:'';width:10px;height:10px;position:absolute;left:50%;top:50%;margin-left:-7px;margin-top:-7px;background-color:_secondary_accent;border:2px solid;border-color:_secondary;box-shadow:0 0 0 2px _secondary_accent;border-radius:10px}datium-container._id datium-time-drag.datium-active:after{width:8px;height:8px;border:3px solid;border-color:_secondary}";
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRhdGl1bS50cyIsIkRhdGl1bUludGVybmFscy50cyIsIk9wdGlvblNhbml0aXplci50cyIsImNvbW1vbi9Db21tb24udHMiLCJjb21tb24vQ3VzdG9tRXZlbnRQb2x5ZmlsbC50cyIsImNvbW1vbi9FdmVudHMudHMiLCJpbnB1dC9EYXRlUGFydHMudHMiLCJpbnB1dC9JbnB1dC50cyIsImlucHV0L0tleWJvYXJkRXZlbnRIYW5kbGVyLnRzIiwiaW5wdXQvTW91c2VFdmVudEhhbmRsZXIudHMiLCJpbnB1dC9QYXJzZXIudHMiLCJpbnB1dC9QYXN0ZUV2ZW50SGFuZGxlci50cyIsInBpY2tlci9IZWFkZXIudHMiLCJwaWNrZXIvUGlja2VyTWFuYWdlci50cyIsInBpY2tlci9odG1sL2hlYWRlci50cyIsInBpY2tlci9waWNrZXJzL1BpY2tlci50cyIsInBpY2tlci9waWNrZXJzL0RhdGVQaWNrZXIudHMiLCJwaWNrZXIvcGlja2Vycy9UaW1lUGlja2VyLnRzIiwicGlja2VyL3BpY2tlcnMvSG91clBpY2tlci50cyIsInBpY2tlci9waWNrZXJzL01pbnV0ZVBpY2tlci50cyIsInBpY2tlci9waWNrZXJzL01vbnRoUGlja2VyLnRzIiwicGlja2VyL3BpY2tlcnMvU2Vjb25kUGlja2VyLnRzIiwicGlja2VyL3BpY2tlcnMvWWVhclBpY2tlci50cyIsInBpY2tlci9zdHlsZXMvY3NzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQU0sTUFBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHO0lBRXRCLGdCQUFZLE9BQXdCLEVBQUUsT0FBZ0I7UUFDbEQsSUFBSSxTQUFTLEdBQUcsSUFBSSxlQUFlLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxVQUFDLE9BQWdCLElBQUssT0FBQSxTQUFTLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFoQyxDQUFnQyxDQUFDO0lBQ25GLENBQUM7SUFDTCxh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QyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBRXJELElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUNoRixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUMzQyxJQUFJLEVBQUUsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlCLElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUNwRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEtBQUssWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDcEQsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUN4QyxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUMzQyxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFFTSw4QkFBUyxHQUFoQjtRQUNJLE1BQU0sQ0FBQyxHQUFHLENBQUM7SUFDZixDQUFDO0lBRU0sNkJBQVEsR0FBZjtRQUNJLE1BQU0sQ0FBQyxZQUFVLENBQUM7SUFDdEIsQ0FBQztJQUNMLGlCQUFDO0FBQUQsQ0FyRkEsQUFxRkMsQ0FyRndCLE1BQU0sR0FxRjlCO0FDdkZELElBQUksR0FBRyxHQUFDLDZoY0FBNmhjLENBQUMiLCJmaWxlIjoiZGF0aXVtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKDxhbnk+d2luZG93KVsnRGF0aXVtJ10gPSBjbGFzcyBEYXRpdW0ge1xyXG4gICAgcHVibGljIHVwZGF0ZU9wdGlvbnM6KG9wdGlvbnM6SU9wdGlvbnMpID0+IHZvaWQ7XHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OkhUTUxJbnB1dEVsZW1lbnQsIG9wdGlvbnM6SU9wdGlvbnMpIHtcclxuICAgICAgICBsZXQgaW50ZXJuYWxzID0gbmV3IERhdGl1bUludGVybmFscyhlbGVtZW50LCBvcHRpb25zKTtcclxuICAgICAgICB0aGlzWyd1cGRhdGVPcHRpb25zJ10gPSAob3B0aW9uczpJT3B0aW9ucykgPT4gaW50ZXJuYWxzLnVwZGF0ZU9wdGlvbnMob3B0aW9ucyk7XHJcbiAgICB9XHJcbn0iLCJjb25zdCBlbnVtIExldmVsIHtcclxuICAgIFlFQVIsIE1PTlRILCBEQVRFLCBIT1VSLFxyXG4gICAgTUlOVVRFLCBTRUNPTkQsIE5PTkVcclxufVxyXG5cclxuY2xhc3MgRGF0aXVtSW50ZXJuYWxzIHtcclxuICAgIHByaXZhdGUgb3B0aW9uczpJT3B0aW9ucyA9IDxhbnk+e307XHJcbiAgICBcclxuICAgIHByaXZhdGUgaW5wdXQ6SW5wdXQ7XHJcbiAgICBwcml2YXRlIHBpY2tlck1hbmFnZXI6UGlja2VyTWFuYWdlcjtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBsZXZlbHM6TGV2ZWxbXTtcclxuICAgIHByaXZhdGUgZGF0ZTpEYXRlO1xyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVsZW1lbnQ6SFRNTElucHV0RWxlbWVudCwgb3B0aW9uczpJT3B0aW9ucykge1xyXG4gICAgICAgIGlmIChlbGVtZW50ID09PSB2b2lkIDApIHRocm93ICdlbGVtZW50IGlzIHJlcXVpcmVkJztcclxuICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnc3BlbGxjaGVjaycsICdmYWxzZScpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuaW5wdXQgPSBuZXcgSW5wdXQoZWxlbWVudCk7XHJcbiAgICAgICAgdGhpcy5waWNrZXJNYW5hZ2VyID0gbmV3IFBpY2tlck1hbmFnZXIoZWxlbWVudCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy51cGRhdGVPcHRpb25zKG9wdGlvbnMpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi5nb3RvKGVsZW1lbnQsIChlKSA9PiB0aGlzLmdvdG8oZS5kYXRlLCBlLmxldmVsLCBlLnVwZGF0ZSkpO1xyXG4gICAgICAgIGxpc3Rlbi56b29tT3V0KGVsZW1lbnQsIChlKSA9PiB0aGlzLnpvb21PdXQoZS5kYXRlLCBlLmN1cnJlbnRMZXZlbCwgZS51cGRhdGUpKTtcclxuICAgICAgICBsaXN0ZW4uem9vbUluKGVsZW1lbnQsIChlKSA9PiB0aGlzLnpvb21JbihlLmRhdGUsIGUuY3VycmVudExldmVsLCBlLnVwZGF0ZSkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFRPRE8gbWFrZSBzdXJlIGluaXRpYWwgZ290byBpcyBhIHZhbGlkIGRhdGUuLi5cclxuICAgICAgICB0aGlzLmdvdG8odGhpcy5vcHRpb25zLmRlZmF1bHREYXRlLCBMZXZlbC5OT05FLCB0cnVlKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHpvb21PdXQoZGF0ZTpEYXRlLCBjdXJyZW50TGV2ZWw6TGV2ZWwsIHVwZGF0ZTpib29sZWFuID0gdHJ1ZSkge1xyXG4gICAgICAgIGxldCBuZXdMZXZlbDpMZXZlbCA9IHRoaXMubGV2ZWxzW3RoaXMubGV2ZWxzLmluZGV4T2YoY3VycmVudExldmVsKSAtIDFdOyBcclxuICAgICAgICBpZiAobmV3TGV2ZWwgPT09IHZvaWQgMCkgcmV0dXJuO1xyXG4gICAgICAgIHRyaWdnZXIuZ290byh0aGlzLmVsZW1lbnQsIHtcclxuICAgICAgICAgICBkYXRlOiBkYXRlLFxyXG4gICAgICAgICAgIGxldmVsOiBuZXdMZXZlbCxcclxuICAgICAgICAgICB1cGRhdGU6IHVwZGF0ZSBcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHpvb21JbihkYXRlOkRhdGUsIGN1cnJlbnRMZXZlbDpMZXZlbCwgdXBkYXRlOmJvb2xlYW4gPSB0cnVlKSB7XHJcbiAgICAgICAgbGV0IG5ld0xldmVsOkxldmVsID0gdGhpcy5sZXZlbHNbdGhpcy5sZXZlbHMuaW5kZXhPZihjdXJyZW50TGV2ZWwpICsgMV07XHJcbiAgICAgICAgaWYgKG5ld0xldmVsID09PSB2b2lkIDApIG5ld0xldmVsID0gY3VycmVudExldmVsO1xyXG4gICAgICAgIHRyaWdnZXIuZ290byh0aGlzLmVsZW1lbnQsIHtcclxuICAgICAgICAgICBkYXRlOiBkYXRlLFxyXG4gICAgICAgICAgIGxldmVsOiBuZXdMZXZlbCxcclxuICAgICAgICAgICB1cGRhdGU6IHVwZGF0ZSBcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdvdG8oZGF0ZTpEYXRlLCBsZXZlbDpMZXZlbCwgdXBkYXRlOmJvb2xlYW4gPSB0cnVlKSB7XHJcbiAgICAgICAgaWYgKGRhdGUgPT09IHZvaWQgMCkgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKGRhdGUudmFsdWVPZigpIDwgdGhpcy5vcHRpb25zLm1pbkRhdGUudmFsdWVPZigpKSB7XHJcbiAgICAgICAgICAgIGRhdGUgPSBuZXcgRGF0ZSh0aGlzLm9wdGlvbnMubWluRGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZiAoZGF0ZS52YWx1ZU9mKCkgPiB0aGlzLm9wdGlvbnMubWF4RGF0ZS52YWx1ZU9mKCkpIHtcclxuICAgICAgICAgICAgZGF0ZSA9IG5ldyBEYXRlKHRoaXMub3B0aW9ucy5tYXhEYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZGF0ZSA9IGRhdGU7XHJcbiAgICAgICAgdHJpZ2dlci52aWV3Y2hhbmdlZCh0aGlzLmVsZW1lbnQsIHtcclxuICAgICAgICAgICAgZGF0ZTogZGF0ZSxcclxuICAgICAgICAgICAgbGV2ZWw6IGxldmVsLFxyXG4gICAgICAgICAgICB1cGRhdGU6IHVwZGF0ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdXBkYXRlT3B0aW9ucyhuZXdPcHRpb25zOklPcHRpb25zID0gPGFueT57fSkge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZShuZXdPcHRpb25zLCB0aGlzLm9wdGlvbnMpOyAgICAgICAgXHJcbiAgICAgICAgdGhpcy5pbnB1dC51cGRhdGVPcHRpb25zKHRoaXMub3B0aW9ucyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5sZXZlbHMgPSB0aGlzLmlucHV0LmdldExldmVscygpLnNsaWNlKCk7XHJcbiAgICAgICAgdGhpcy5sZXZlbHMuc29ydCgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLnBpY2tlck1hbmFnZXIuY3VycmVudFBpY2tlciAhPT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgIGxldCBjdXJMZXZlbCA9IHRoaXMucGlja2VyTWFuYWdlci5jdXJyZW50UGlja2VyLmdldExldmVsKCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAodGhpcy5sZXZlbHMuaW5kZXhPZihjdXJMZXZlbCkgPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIHRyaWdnZXIuZ290byh0aGlzLmVsZW1lbnQsIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRlOiB0aGlzLmRhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgbGV2ZWw6IHRoaXMubGV2ZWxzWzBdXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMucGlja2VyTWFuYWdlci51cGRhdGVPcHRpb25zKHRoaXMub3B0aW9ucyk7XHJcbiAgICB9XHJcbn0iLCJmdW5jdGlvbiBPcHRpb25FeGNlcHRpb24obXNnOnN0cmluZykge1xyXG4gICAgcmV0dXJuIGBbRGF0aXVtIE9wdGlvbiBFeGNlcHRpb25dXFxuICAke21zZ31cXG4gIFNlZSBodHRwOi8vZGF0aXVtLmlvL2RvY3VtZW50YXRpb24gZm9yIGRvY3VtZW50YXRpb24uYDtcclxufVxyXG5cclxuY2xhc3MgT3B0aW9uU2FuaXRpemVyIHtcclxuICAgIFxyXG4gICAgc3RhdGljIGRmbHREYXRlOkRhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgXHJcbiAgICBzdGF0aWMgc2FuaXRpemVEaXNwbGF5QXMoZGlzcGxheUFzOmFueSwgZGZsdDpzdHJpbmcgPSAnaDptbWEgTU1NIEQsIFlZWVknKSB7XHJcbiAgICAgICAgaWYgKGRpc3BsYXlBcyA9PT0gdm9pZCAwKSByZXR1cm4gZGZsdDtcclxuICAgICAgICBpZiAodHlwZW9mIGRpc3BsYXlBcyAhPT0gJ3N0cmluZycpIHRocm93IE9wdGlvbkV4Y2VwdGlvbignVGhlIFwiZGlzcGxheUFzXCIgb3B0aW9uIG11c3QgYmUgYSBzdHJpbmcnKTtcclxuICAgICAgICByZXR1cm4gZGlzcGxheUFzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdGF0aWMgc2FuaXRpemVNaW5EYXRlKG1pbkRhdGU6YW55LCBkZmx0OkRhdGUgPSBuZXcgRGF0ZSgtODY0MDAwMDAwMDAwMDAwMCkpIHtcclxuICAgICAgICBpZiAobWluRGF0ZSA9PT0gdm9pZCAwKSByZXR1cm4gZGZsdDtcclxuICAgICAgICByZXR1cm4gbmV3IERhdGUobWluRGF0ZSk7IC8vVE9ETyBmaWd1cmUgdGhpcyBvdXQgeWVzXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN0YXRpYyBzYW5pdGl6ZU1heERhdGUobWF4RGF0ZTphbnksIGRmbHQ6RGF0ZSA9IG5ldyBEYXRlKDg2NDAwMDAwMDAwMDAwMDApKSB7XHJcbiAgICAgICAgaWYgKG1heERhdGUgPT09IHZvaWQgMCkgcmV0dXJuIGRmbHQ7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKG1heERhdGUpOyAvL1RPRE8gZmlndXJlIHRoaXMgb3V0IFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdGF0aWMgc2FuaXRpemVEZWZhdWx0RGF0ZShkZWZhdWx0RGF0ZTphbnksIGRmbHQ6RGF0ZSA9IHRoaXMuZGZsdERhdGUpIHtcclxuICAgICAgICBpZiAoZGVmYXVsdERhdGUgPT09IHZvaWQgMCkgcmV0dXJuIGRmbHQ7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKGRlZmF1bHREYXRlKTsgLy9UT0RPIGZpZ3VyZSB0aGlzIG91dFxyXG4gICAgfVxyXG4gICAgICAgIFxyXG4gICAgc3RhdGljIHNhbml0aXplQ29sb3IoY29sb3I6YW55KSB7XHJcbiAgICAgICAgbGV0IHRocmVlSGV4ID0gJ1xcXFxzKiNbQS1GYS1mMC05XXszfVxcXFxzKic7XHJcbiAgICAgICAgbGV0IHNpeEhleCA9ICdcXFxccyojW0EtRmEtZjAtOV17Nn1cXFxccyonO1xyXG4gICAgICAgIGxldCByZ2IgPSAnXFxcXHMqcmdiXFxcXChcXFxccypbMC05XXsxLDN9XFxcXHMqLFxcXFxzKlswLTldezEsM31cXFxccyosXFxcXHMqWzAtOV17MSwzfVxcXFxzKlxcXFwpXFxcXHMqJztcclxuICAgICAgICBsZXQgcmdiYSA9ICdcXFxccypyZ2JhXFxcXChcXFxccypbMC05XXsxLDN9XFxcXHMqLFxcXFxzKlswLTldezEsM31cXFxccyosXFxcXHMqWzAtOV17MSwzfVxcXFxzKlxcXFwsXFxcXHMqWzAtOV0qXFxcXC5bMC05XStcXFxccypcXFxcKVxcXFxzKic7XHJcbiAgICAgICAgbGV0IHNhbml0aXplQ29sb3JSZWdleCA9IG5ldyBSZWdFeHAoYF4oKCR7dGhyZWVIZXh9KXwoJHtzaXhIZXh9KXwoJHtyZ2J9KXwoJHtyZ2JhfSkpJGApO1xyXG5cclxuICAgICAgICBpZiAoY29sb3IgPT09IHZvaWQgMCkgdGhyb3cgT3B0aW9uRXhjZXB0aW9uKFwiQWxsIHRoZW1lIGNvbG9ycyAocHJpbWFyeSwgcHJpbWFyeV90ZXh0LCBzZWNvbmRhcnksIHNlY29uZGFyeV90ZXh0LCBzZWNvbmRhcnlfYWNjZW50KSBtdXN0IGJlIGRlZmluZWRcIik7XHJcbiAgICAgICAgaWYgKCFzYW5pdGl6ZUNvbG9yUmVnZXgudGVzdChjb2xvcikpIHRocm93IE9wdGlvbkV4Y2VwdGlvbihcIkFsbCB0aGVtZSBjb2xvcnMgbXVzdCBiZSB2YWxpZCByZ2IsIHJnYmEsIG9yIGhleCBjb2RlXCIpO1xyXG4gICAgICAgIHJldHVybiA8c3RyaW5nPmNvbG9yO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdGF0aWMgc2FuaXRpemVUaGVtZSh0aGVtZTphbnksIGRmbHQ6YW55ID0gXCJtYXRlcmlhbFwiKTpJVGhlbWUge1xyXG4gICAgICAgIGlmICh0aGVtZSA9PT0gdm9pZCAwKSByZXR1cm4gT3B0aW9uU2FuaXRpemVyLnNhbml0aXplVGhlbWUoZGZsdCwgdm9pZCAwKTtcclxuICAgICAgICBpZiAodHlwZW9mIHRoZW1lID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICBzd2l0Y2godGhlbWUpIHtcclxuICAgICAgICAgICAgY2FzZSAnbGlnaHQnOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDxJVGhlbWU+e1xyXG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnk6ICcjZWVlJyxcclxuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5X3RleHQ6ICcjNjY2JyxcclxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnk6ICcjZmZmJyxcclxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnlfdGV4dDogJyM2NjYnLFxyXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeV9hY2NlbnQ6ICcjNjY2J1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlICdkYXJrJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiA8SVRoZW1lPntcclxuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5OiAnIzQ0NCcsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeV90ZXh0OiAnI2VlZScsXHJcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5OiAnIzMzMycsXHJcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5X3RleHQ6ICcjZWVlJyxcclxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnlfYWNjZW50OiAnI2ZmZidcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSAnbWF0ZXJpYWwnOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDxJVGhlbWU+e1xyXG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnk6ICcjMDE5NTg3JyxcclxuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5X3RleHQ6ICcjZmZmJyxcclxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnk6ICcjZmZmJyxcclxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnlfdGV4dDogJyM4ODgnLFxyXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeV9hY2NlbnQ6ICcjMDE5NTg3J1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgdGhyb3cgXCJOYW1lIG9mIHRoZW1lIG5vdCB2YWxpZC5cIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoZW1lID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICByZXR1cm4gPElUaGVtZT4ge1xyXG4gICAgICAgICAgICAgICAgcHJpbWFyeTogT3B0aW9uU2FuaXRpemVyLnNhbml0aXplQ29sb3IodGhlbWVbJ3ByaW1hcnknXSksXHJcbiAgICAgICAgICAgICAgICBzZWNvbmRhcnk6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZUNvbG9yKHRoZW1lWydzZWNvbmRhcnknXSksXHJcbiAgICAgICAgICAgICAgICBwcmltYXJ5X3RleHQ6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZUNvbG9yKHRoZW1lWydwcmltYXJ5X3RleHQnXSksXHJcbiAgICAgICAgICAgICAgICBzZWNvbmRhcnlfdGV4dDogT3B0aW9uU2FuaXRpemVyLnNhbml0aXplQ29sb3IodGhlbWVbJ3NlY29uZGFyeV90ZXh0J10pLFxyXG4gICAgICAgICAgICAgICAgc2Vjb25kYXJ5X2FjY2VudDogT3B0aW9uU2FuaXRpemVyLnNhbml0aXplQ29sb3IodGhlbWVbJ3NlY29uZGFyeV9hY2NlbnQnXSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IE9wdGlvbkV4Y2VwdGlvbignVGhlIFwidGhlbWVcIiBvcHRpb24gbXVzdCBiZSBvYmplY3Qgb3Igc3RyaW5nJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdGF0aWMgc2FuaXRpemVJc1NlY29uZFNlbGVjdGFibGUoaXNTZWNvbmRTZWxlY3RhYmxlOmFueSwgZGZsdDphbnkgPSAoZGF0ZTpEYXRlKSA9PiB0cnVlKSB7XHJcbiAgICAgICAgcmV0dXJuIGRmbHQ7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN0YXRpYyBzYW5pdGl6ZUlzTWludXRlU2VsZWN0YWJsZShpc01pbnV0ZVNlbGVjdGFibGU6YW55LCBkZmx0OmFueSA9IChkYXRlOkRhdGUpID0+IHRydWUpIHtcclxuICAgICAgICByZXR1cm4gKGRhdGU6RGF0ZSkgPT4gZGF0ZS5nZXRNaW51dGVzKCkgJSAxNSA9PT0gMDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgc3RhdGljIHNhbml0aXplSXNIb3VyU2VsZWN0YWJsZShpc0hvdXJTZWxlY3RhYmxlOmFueSwgZGZsdDphbnkgPSAoZGF0ZTpEYXRlKSA9PiB0cnVlKSB7XHJcbiAgICAgICAgcmV0dXJuIGRmbHQ7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN0YXRpYyBzYW5pdGl6ZUlzRGF0ZVNlbGVjdGFibGUoaXNEYXRlU2VsZWN0YWJsZTphbnksIGRmbHQ6YW55ID0gKGRhdGU6RGF0ZSkgPT4gdHJ1ZSkge1xyXG4gICAgICAgIHJldHVybiAoZGF0ZTpEYXRlKSA9PiBkYXRlLmdldERheSgpICE9PSAwICYmIGRhdGUuZ2V0RGF5KCkgIT09IDY7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN0YXRpYyBzYW5pdGl6ZUlzTW9udGhTZWxlY3RhYmxlKGlzTW9udGhTZWxlY3RhYmxlOmFueSwgZGZsdDphbnkgPSAoZGF0ZTpEYXRlKSA9PiB0cnVlKSB7XHJcbiAgICAgICAgcmV0dXJuIGRmbHQ7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN0YXRpYyBzYW5pdGl6ZUlzWWVhclNlbGVjdGFibGUoaXNZZWFyU2VsZWN0YWJsZTphbnksIGRmbHQ6YW55ID0gKGRhdGU6RGF0ZSkgPT4gdHJ1ZSkge1xyXG4gICAgICAgIHJldHVybiBkZmx0O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdGF0aWMgc2FuaXRpemVNaWxpdGFyeVRpbWUobWlsaXRhcnlUaW1lOmFueSwgZGZsdDpib29sZWFuID0gZmFsc2UpIHtcclxuICAgICAgICBpZiAobWlsaXRhcnlUaW1lID09PSB2b2lkIDApIHJldHVybiBkZmx0O1xyXG4gICAgICAgIGlmICh0eXBlb2YgbWlsaXRhcnlUaW1lICE9PSAnYm9vbGVhbicpIHtcclxuICAgICAgICAgICAgdGhyb3cgT3B0aW9uRXhjZXB0aW9uKCdUaGUgXCJtaWxpdGFyeVRpbWVcIiBvcHRpb24gbXVzdCBiZSBhIGJvb2xlYW4nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIDxib29sZWFuPm1pbGl0YXJ5VGltZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgc3RhdGljIHNhbml0aXplKG9wdGlvbnM6SU9wdGlvbnMsIGRlZmF1bHRzOklPcHRpb25zKSB7XHJcbiAgICAgICAgbGV0IG1pbkRhdGUgPSBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVNaW5EYXRlKG9wdGlvbnNbJ21pbkRhdGUnXSwgZGVmYXVsdHMubWluRGF0ZSk7XHJcbiAgICAgICAgbGV0IG1heERhdGUgPSBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVNYXhEYXRlKG9wdGlvbnNbJ21heERhdGUnXSwgZGVmYXVsdHMubWF4RGF0ZSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHllYXJTZWxlY3RhYmxlID0gT3B0aW9uU2FuaXRpemVyLnNhbml0aXplSXNZZWFyU2VsZWN0YWJsZShvcHRpb25zWydpc1llYXJTZWxlY3RhYmxlJ10sIGRlZmF1bHRzLmlzWWVhclNlbGVjdGFibGUpO1xyXG4gICAgICAgIGxldCBtb250aFNlbGVjdGFibGUgPSBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVJc01vbnRoU2VsZWN0YWJsZShvcHRpb25zWydpc01vbnRoU2VsZWN0YWJsZSddLCBkZWZhdWx0cy5pc01vbnRoU2VsZWN0YWJsZSk7XHJcbiAgICAgICAgbGV0IGRhdGVTZWxlY3RhYmxlID0gT3B0aW9uU2FuaXRpemVyLnNhbml0aXplSXNEYXRlU2VsZWN0YWJsZShvcHRpb25zWydpc0RhdGVTZWxlY3RhYmxlJ10sIGRlZmF1bHRzLmlzRGF0ZVNlbGVjdGFibGUpO1xyXG4gICAgICAgIGxldCBob3VyU2VsZWN0YWJsZSA9IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZUlzSG91clNlbGVjdGFibGUob3B0aW9uc1snaXNIb3VyU2VsZWN0YWJsZSddLCBkZWZhdWx0cy5pc0hvdXJTZWxlY3RhYmxlKTtcclxuICAgICAgICBsZXQgbWludXRlU2VsZWN0YWJsZSA9IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZUlzTWludXRlU2VsZWN0YWJsZShvcHRpb25zWydpc01pbnV0ZVNlbGVjdGFibGUnXSwgZGVmYXVsdHMuaXNNaW51dGVTZWxlY3RhYmxlKTtcclxuICAgICAgICBsZXQgc2Vjb25kU2VsZWN0YWJsZSA9IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZUlzU2Vjb25kU2VsZWN0YWJsZShvcHRpb25zWydpc1NlY29uZFNlbGVjdGFibGUnXSwgZGVmYXVsdHMuaXNTZWNvbmRTZWxlY3RhYmxlKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgaXNZZWFyU2VsZWN0YWJsZSA9IChkOkRhdGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKG5ldyBEYXRlKGQuZ2V0RnVsbFllYXIoKSwgMCkudmFsdWVPZigpID4gbWF4RGF0ZS52YWx1ZU9mKCkgfHxcclxuICAgICAgICAgICAgICAgIG5ldyBEYXRlKGQuZ2V0RnVsbFllYXIoKSArIDEsIDApLnZhbHVlT2YoKSA8IG1pbkRhdGUudmFsdWVPZigpKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIHJldHVybiB5ZWFyU2VsZWN0YWJsZShkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGlzTW9udGhTZWxlY3RhYmxlID0gKGQ6RGF0ZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAobmV3IERhdGUoZC5nZXRGdWxsWWVhcigpLCBkLmdldE1vbnRoKCkpLnZhbHVlT2YoKSA+IG1heERhdGUudmFsdWVPZigpIHx8XHJcbiAgICAgICAgICAgICAgICBuZXcgRGF0ZShkLmdldEZ1bGxZZWFyKCksIGQuZ2V0TW9udGgoKSArIDEpLnZhbHVlT2YoKSA8IG1pbkRhdGUudmFsdWVPZigpKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIHJldHVybiBpc1llYXJTZWxlY3RhYmxlKGQpICYmXHJcbiAgICAgICAgICAgICAgICAgICBtb250aFNlbGVjdGFibGUoZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBpc0RhdGVTZWxlY3RhYmxlID0gKGQ6RGF0ZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAobmV3IERhdGUoZC5nZXRGdWxsWWVhcigpLCBkLmdldE1vbnRoKCksIGQuZ2V0RGF0ZSgpKS52YWx1ZU9mKCkgPiBtYXhEYXRlLnZhbHVlT2YoKSB8fFxyXG4gICAgICAgICAgICAgICAgbmV3IERhdGUoZC5nZXRGdWxsWWVhcigpLCBkLmdldE1vbnRoKCksIGQuZ2V0RGF0ZSgpICsgMSkudmFsdWVPZigpIDwgbWluRGF0ZS52YWx1ZU9mKCkpIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgcmV0dXJuIGlzTW9udGhTZWxlY3RhYmxlKGQpICYmXHJcbiAgICAgICAgICAgICAgICAgICBkYXRlU2VsZWN0YWJsZShkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGlzSG91clNlbGVjdGFibGUgPSAoZDpEYXRlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChuZXcgRGF0ZShkLmdldEZ1bGxZZWFyKCksIGQuZ2V0TW9udGgoKSwgZC5nZXREYXRlKCksIGQuZ2V0SG91cnMoKSkudmFsdWVPZigpID4gbWF4RGF0ZS52YWx1ZU9mKCkgfHxcclxuICAgICAgICAgICAgICAgIG5ldyBEYXRlKGQuZ2V0RnVsbFllYXIoKSwgZC5nZXRNb250aCgpLCBkLmdldERhdGUoKSwgZC5nZXRIb3VycygpICsgMSkudmFsdWVPZigpIDwgbWluRGF0ZS52YWx1ZU9mKCkpIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgcmV0dXJuIGlzRGF0ZVNlbGVjdGFibGUoZCkgJiZcclxuICAgICAgICAgICAgICAgICAgIGhvdXJTZWxlY3RhYmxlKGQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgaXNNaW51dGVTZWxlY3RhYmxlID0gKGQ6RGF0ZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAobmV3IERhdGUoZC5nZXRGdWxsWWVhcigpLCBkLmdldE1vbnRoKCksIGQuZ2V0RGF0ZSgpLCBkLmdldEhvdXJzKCksIGQuZ2V0TWludXRlcygpKS52YWx1ZU9mKCkgPiBtYXhEYXRlLnZhbHVlT2YoKSB8fFxyXG4gICAgICAgICAgICAgICAgbmV3IERhdGUoZC5nZXRGdWxsWWVhcigpLCBkLmdldE1vbnRoKCksIGQuZ2V0RGF0ZSgpLCBkLmdldEhvdXJzKCksIGQuZ2V0TWludXRlcygpICsgMSkudmFsdWVPZigpIDwgbWluRGF0ZS52YWx1ZU9mKCkpIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgcmV0dXJuIGlzSG91clNlbGVjdGFibGUoZCkgJiZcclxuICAgICAgICAgICAgICAgICAgIG1pbnV0ZVNlbGVjdGFibGUoZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBpc1NlY29uZFNlbGVjdGFibGUgPSAoZDpEYXRlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChuZXcgRGF0ZShkLmdldEZ1bGxZZWFyKCksIGQuZ2V0TW9udGgoKSwgZC5nZXREYXRlKCksIGQuZ2V0SG91cnMoKSwgZC5nZXRNaW51dGVzKCksIGQuZ2V0U2Vjb25kcygpKS52YWx1ZU9mKCkgPiBtYXhEYXRlLnZhbHVlT2YoKSB8fFxyXG4gICAgICAgICAgICAgICAgbmV3IERhdGUoZC5nZXRGdWxsWWVhcigpLCBkLmdldE1vbnRoKCksIGQuZ2V0RGF0ZSgpLCBkLmdldEhvdXJzKCksIGQuZ2V0TWludXRlcygpLCBkLmdldFNlY29uZHMoKSArIDEpLnZhbHVlT2YoKSA8IG1pbkRhdGUudmFsdWVPZigpKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIHJldHVybiBpc01pbnV0ZVNlbGVjdGFibGUoZCkgJiZcclxuICAgICAgICAgICAgICAgICAgIHNlY29uZFNlbGVjdGFibGUoZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBvcHRzOklPcHRpb25zID0ge1xyXG4gICAgICAgICAgICBkaXNwbGF5QXM6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZURpc3BsYXlBcyhvcHRpb25zWydkaXNwbGF5QXMnXSwgZGVmYXVsdHMuZGlzcGxheUFzKSxcclxuICAgICAgICAgICAgbWluRGF0ZTogbWluRGF0ZSxcclxuICAgICAgICAgICAgbWF4RGF0ZTogbWF4RGF0ZSxcclxuICAgICAgICAgICAgZGVmYXVsdERhdGU6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZURlZmF1bHREYXRlKG9wdGlvbnNbJ2RlZmF1bHREYXRlJ10sIGRlZmF1bHRzLmRlZmF1bHREYXRlKSxcclxuICAgICAgICAgICAgdGhlbWU6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZVRoZW1lKG9wdGlvbnNbJ3RoZW1lJ10sIGRlZmF1bHRzLnRoZW1lKSxcclxuICAgICAgICAgICAgbWlsaXRhcnlUaW1lOiBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVNaWxpdGFyeVRpbWUob3B0aW9uc1snbWlsaXRhcnlUaW1lJ10sIGRlZmF1bHRzLm1pbGl0YXJ5VGltZSksXHJcbiAgICAgICAgICAgIGlzU2Vjb25kU2VsZWN0YWJsZTogaXNTZWNvbmRTZWxlY3RhYmxlLFxyXG4gICAgICAgICAgICBpc01pbnV0ZVNlbGVjdGFibGU6IGlzTWludXRlU2VsZWN0YWJsZSxcclxuICAgICAgICAgICAgaXNIb3VyU2VsZWN0YWJsZTogaXNIb3VyU2VsZWN0YWJsZSxcclxuICAgICAgICAgICAgaXNEYXRlU2VsZWN0YWJsZTogaXNEYXRlU2VsZWN0YWJsZSxcclxuICAgICAgICAgICAgaXNNb250aFNlbGVjdGFibGU6IGlzTW9udGhTZWxlY3RhYmxlLFxyXG4gICAgICAgICAgICBpc1llYXJTZWxlY3RhYmxlOiBpc1llYXJTZWxlY3RhYmxlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiBvcHRzO1xyXG4gICAgfVxyXG59IiwiY2xhc3MgQ29tbW9uIHtcclxuICAgIHByb3RlY3RlZCBnZXRNb250aHMoKSB7XHJcbiAgICAgICAgcmV0dXJuIFtcIkphbnVhcnlcIiwgXCJGZWJydWFyeVwiLCBcIk1hcmNoXCIsIFwiQXByaWxcIiwgXCJNYXlcIiwgXCJKdW5lXCIsIFwiSnVseVwiLCBcIkF1Z3VzdFwiLCBcIlNlcHRlbWJlclwiLCBcIk9jdG9iZXJcIiwgXCJOb3ZlbWJlclwiLCBcIkRlY2VtYmVyXCJdO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgZ2V0U2hvcnRNb250aHMoKSB7XHJcbiAgICAgICAgcmV0dXJuIFtcIkphblwiLCBcIkZlYlwiLCBcIk1hclwiLCBcIkFwclwiLCBcIk1heVwiLCBcIkp1blwiLCBcIkp1bFwiLCBcIkF1Z1wiLCBcIlNlcFwiLCBcIk9jdFwiLCBcIk5vdlwiLCBcIkRlY1wiXTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGdldERheXMoKSB7XHJcbiAgICAgICAgcmV0dXJuIFtcIlN1bmRheVwiLCBcIk1vbmRheVwiLCBcIlR1ZXNkYXlcIiwgXCJXZWRuZXNkYXlcIiwgXCJUaHVyc2RheVwiLCBcIkZyaWRheVwiLCBcIlNhdHVyZGF5XCJdO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgZ2V0U2hvcnREYXlzKCkge1xyXG4gICAgICAgIHJldHVybiBbXCJTdW5cIiwgXCJNb25cIiwgXCJUdWVcIiwgXCJXZWRcIiwgXCJUaHVcIiwgXCJGcmlcIiwgXCJTYXRcIl07XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBkYXlzSW5Nb250aChkYXRlOkRhdGUpIHtcclxuICAgICAgICByZXR1cm4gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCkgKyAxLCAwKS5nZXREYXRlKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBnZXRIb3VycyhkYXRlOkRhdGUpOnN0cmluZyB7XHJcbiAgICAgICAgbGV0IG51bSA9IGRhdGUuZ2V0SG91cnMoKTtcclxuICAgICAgICBpZiAobnVtID09PSAwKSBudW0gPSAxMjtcclxuICAgICAgICBpZiAobnVtID4gMTIpIG51bSAtPSAxMjtcclxuICAgICAgICByZXR1cm4gbnVtLnRvU3RyaW5nKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBnZXREZWNhZGUoZGF0ZTpEYXRlKTpzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiBgJHtNYXRoLmZsb29yKGRhdGUuZ2V0RnVsbFllYXIoKS8xMCkqMTB9IC0gJHtNYXRoLmNlaWwoKGRhdGUuZ2V0RnVsbFllYXIoKSArIDEpLzEwKSoxMH1gO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgZ2V0TWVyaWRpZW0oZGF0ZTpEYXRlKTpzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiBkYXRlLmdldEhvdXJzKCkgPCAxMiA/ICdhbScgOiAncG0nO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgcGFkKG51bTpudW1iZXJ8c3RyaW5nLCBzaXplOm51bWJlciA9IDIpIHtcclxuICAgICAgICBsZXQgc3RyID0gbnVtLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgd2hpbGUoc3RyLmxlbmd0aCA8IHNpemUpIHN0ciA9ICcwJyArIHN0cjtcclxuICAgICAgICByZXR1cm4gc3RyO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgdHJpbShzdHI6c3RyaW5nKSB7XHJcbiAgICAgICAgd2hpbGUgKHN0clswXSA9PT0gJzAnICYmIHN0ci5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIHN0ciA9IHN0ci5zdWJzdHIoMSwgc3RyLmxlbmd0aCk7ICBcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHN0cjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGdldENsaWVudENvb3IoZTphbnkpOnt4Om51bWJlciwgeTpudW1iZXJ9IHtcclxuICAgICAgICBpZiAoZS5jbGllbnRYICE9PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHg6IGUuY2xpZW50WCxcclxuICAgICAgICAgICAgICAgIHk6IGUuY2xpZW50WVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHg6IGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WCxcclxuICAgICAgICAgICAgeTogZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRZXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiQ3VzdG9tRXZlbnQgPSAoZnVuY3Rpb24oKSB7XHJcbiAgICBmdW5jdGlvbiB1c2VOYXRpdmUgKCkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGxldCBjdXN0b21FdmVudCA9IG5ldyBDdXN0b21FdmVudCgnYScsIHsgZGV0YWlsOiB7IGI6ICdiJyB9IH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gICdhJyA9PT0gY3VzdG9tRXZlbnQudHlwZSAmJiAnYicgPT09IGN1c3RvbUV2ZW50LmRldGFpbC5iO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZiAodXNlTmF0aXZlKCkpIHtcclxuICAgICAgICByZXR1cm4gPGFueT5DdXN0b21FdmVudDtcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRvY3VtZW50LmNyZWF0ZUV2ZW50ID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgLy8gSUUgPj0gOVxyXG4gICAgICAgIHJldHVybiA8YW55PmZ1bmN0aW9uKHR5cGU6c3RyaW5nLCBwYXJhbXM6Q3VzdG9tRXZlbnRJbml0KSB7XHJcbiAgICAgICAgICAgIGxldCBlID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0N1c3RvbUV2ZW50Jyk7XHJcbiAgICAgICAgICAgIGlmIChwYXJhbXMpIHtcclxuICAgICAgICAgICAgICAgIGUuaW5pdEN1c3RvbUV2ZW50KHR5cGUsIHBhcmFtcy5idWJibGVzLCBwYXJhbXMuY2FuY2VsYWJsZSwgcGFyYW1zLmRldGFpbCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBlLmluaXRDdXN0b21FdmVudCh0eXBlLCBmYWxzZSwgZmFsc2UsIHZvaWQgMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGU7XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBJRSA+PSA4XHJcbiAgICAgICAgcmV0dXJuIDxhbnk+ZnVuY3Rpb24odHlwZTpzdHJpbmcsIHBhcmFtczpDdXN0b21FdmVudEluaXQpIHtcclxuICAgICAgICAgICAgbGV0IGUgPSAoPGFueT5kb2N1bWVudCkuY3JlYXRlRXZlbnRPYmplY3QoKTtcclxuICAgICAgICAgICAgZS50eXBlID0gdHlwZTtcclxuICAgICAgICAgICAgaWYgKHBhcmFtcykge1xyXG4gICAgICAgICAgICAgICAgZS5idWJibGVzID0gQm9vbGVhbihwYXJhbXMuYnViYmxlcyk7XHJcbiAgICAgICAgICAgICAgICBlLmNhbmNlbGFibGUgPSBCb29sZWFuKHBhcmFtcy5jYW5jZWxhYmxlKTtcclxuICAgICAgICAgICAgICAgIGUuZGV0YWlsID0gcGFyYW1zLmRldGFpbDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGUuYnViYmxlcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgZS5jYW5jZWxhYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBlLmRldGFpbCA9IHZvaWQgMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZTtcclxuICAgICAgICB9IFxyXG4gICAgfSAgXHJcbn0pKCk7XHJcbiIsImludGVyZmFjZSBJTGlzdGVuZXJSZWZlcmVuY2Uge1xyXG4gICAgZWxlbWVudDogRWxlbWVudHxEb2N1bWVudHxXaW5kb3c7XHJcbiAgICByZWZlcmVuY2U6IEV2ZW50TGlzdGVuZXI7XHJcbiAgICBldmVudDogc3RyaW5nO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgSURyYWdDYWxsYmFja3Mge1xyXG4gICAgZHJhZ1N0YXJ0PzooZT86TW91c2VFdmVudHxUb3VjaEV2ZW50KSA9PiB2b2lkO1xyXG4gICAgZHJhZ01vdmU/OihlPzpNb3VzZUV2ZW50fFRvdWNoRXZlbnQpID0+IHZvaWQ7XHJcbiAgICBkcmFnRW5kPzooZT86TW91c2VFdmVudHxUb3VjaEV2ZW50KSA9PiB2b2lkO1xyXG59XHJcblxyXG5uYW1lc3BhY2UgbGlzdGVuIHtcclxuICAgIGxldCBtYXRjaGVzID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50Lm1hdGNoZXMgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50Lm1zTWF0Y2hlc1NlbGVjdG9yO1xyXG4gICAgXHJcbiAgICBmdW5jdGlvbiBoYW5kbGVEZWxlZ2F0ZUV2ZW50KHBhcmVudDpFbGVtZW50LCBkZWxlZ2F0ZVNlbGVjdG9yOnN0cmluZywgY2FsbGJhY2s6KGU/Ok1vdXNlRXZlbnR8VG91Y2hFdmVudCkgPT4gdm9pZCkge1xyXG4gICAgICAgIHJldHVybiAoZTpNb3VzZUV2ZW50fFRvdWNoRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdmFyIHRhcmdldCA9IGUuc3JjRWxlbWVudCB8fCA8RWxlbWVudD5lLnRhcmdldDtcclxuICAgICAgICAgICAgd2hpbGUodGFyZ2V0ICE9PSBudWxsICYmICF0YXJnZXQuaXNFcXVhbE5vZGUocGFyZW50KSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoZXMuY2FsbCh0YXJnZXQsIGRlbGVnYXRlU2VsZWN0b3IpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudEVsZW1lbnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIGF0dGFjaEV2ZW50c0RlbGVnYXRlKGV2ZW50czpzdHJpbmdbXSwgcGFyZW50OkVsZW1lbnQsIGRlbGVnYXRlU2VsZWN0b3I6c3RyaW5nLCBjYWxsYmFjazooZT86TW91c2VFdmVudHxUb3VjaEV2ZW50KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgbGV0IGxpc3RlbmVyczpJTGlzdGVuZXJSZWZlcmVuY2VbXSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiBldmVudHMpIHtcclxuICAgICAgICAgICAgbGV0IGV2ZW50OnN0cmluZyA9IGV2ZW50c1trZXldO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IG5ld0xpc3RlbmVyID0gaGFuZGxlRGVsZWdhdGVFdmVudChwYXJlbnQsIGRlbGVnYXRlU2VsZWN0b3IsIGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgbGlzdGVuZXJzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudDogcGFyZW50LFxyXG4gICAgICAgICAgICAgICAgcmVmZXJlbmNlOiBuZXdMaXN0ZW5lcixcclxuICAgICAgICAgICAgICAgIGV2ZW50OiBldmVudFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHBhcmVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBuZXdMaXN0ZW5lcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBsaXN0ZW5lcnM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIGF0dGFjaEV2ZW50cyhldmVudHM6c3RyaW5nW10sIGVsZW1lbnQ6RWxlbWVudHxEb2N1bWVudHxXaW5kb3csIGNhbGxiYWNrOihlPzphbnkpID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdIHtcclxuICAgICAgICBsZXQgbGlzdGVuZXJzOklMaXN0ZW5lclJlZmVyZW5jZVtdID0gW107XHJcbiAgICAgICAgZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGxpc3RlbmVycy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGVsZW1lbnQsXHJcbiAgICAgICAgICAgICAgICByZWZlcmVuY2U6IGNhbGxiYWNrLFxyXG4gICAgICAgICAgICAgICAgZXZlbnQ6IGV2ZW50XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGNhbGxiYWNrKTsgXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGxpc3RlbmVycztcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gTkFUSVZFXHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiBmb2N1cyhlbGVtZW50OkVsZW1lbnR8RG9jdW1lbnR8V2luZG93LCBjYWxsYmFjazooZT86Rm9jdXNFdmVudCkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xyXG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydmb2N1cyddLCBlbGVtZW50LCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBjYWxsYmFjayhlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGJsdXIoZWxlbWVudDpFbGVtZW50fERvY3VtZW50fFdpbmRvdywgY2FsbGJhY2s6KGU/OkZvY3VzRXZlbnQpID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdIHtcclxuICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzKFsnYmx1ciddLCBlbGVtZW50LCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBjYWxsYmFjayhlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGRvd24oZWxlbWVudDpFbGVtZW50fERvY3VtZW50fFdpbmRvdywgY2FsbGJhY2s6KGU/Ok1vdXNlRXZlbnR8VG91Y2hFdmVudCkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW107XHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZG93bihwYXJlbnQ6RWxlbWVudHxEb2N1bWVudHxXaW5kb3csIGRlbGVnYXRlU2VsZWN0b3I6c3RyaW5nLCBjYWxsYmFjazooZT86TW91c2VFdmVudHxUb3VjaEV2ZW50KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXTtcclxuICAgIGV4cG9ydCBmdW5jdGlvbiBkb3duKC4uLnBhcmFtczphbnlbXSkge1xyXG4gICAgICAgIGlmIChwYXJhbXMubGVuZ3RoID09PSAzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhdHRhY2hFdmVudHNEZWxlZ2F0ZShbJ21vdXNlZG93bicsICd0b3VjaHN0YXJ0J10sIHBhcmFtc1swXSwgcGFyYW1zWzFdLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcGFyYW1zWzJdKDxhbnk+ZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydtb3VzZWRvd24nLCAndG91Y2hzdGFydCddLCBwYXJhbXNbMF0sIChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBwYXJhbXNbMV0oPGFueT5lKTtcclxuICAgICAgICAgICAgfSk7ICAgICAgICBcclxuICAgICAgICB9IFxyXG4gICAgfTtcclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHVwKGVsZW1lbnQ6RWxlbWVudHxEb2N1bWVudHxXaW5kb3csIGNhbGxiYWNrOihlPzpNb3VzZUV2ZW50KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ21vdXNldXAnLCAndG91Y2hlbmQnXSwgZWxlbWVudCwgKGUpID0+IHtcclxuICAgICAgICAgICAgY2FsbGJhY2soZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiBtb3VzZWRvd24oZWxlbWVudDpFbGVtZW50fERvY3VtZW50fFdpbmRvdywgY2FsbGJhY2s6KGU/Ok1vdXNlRXZlbnQpID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdIHtcclxuICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzKFsnbW91c2Vkb3duJ10sIGVsZW1lbnQsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gbW91c2V1cChlbGVtZW50OkVsZW1lbnR8RG9jdW1lbnR8V2luZG93LCBjYWxsYmFjazooZT86TW91c2VFdmVudCkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xyXG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydtb3VzZXVwJ10sIGVsZW1lbnQsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gcGFzdGUoZWxlbWVudDpFbGVtZW50fERvY3VtZW50fFdpbmRvdywgY2FsbGJhY2s6KGU/Ok1vdXNlRXZlbnQpID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdIHtcclxuICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzKFsncGFzdGUnXSwgZWxlbWVudCwgKGUpID0+IHtcclxuICAgICAgICAgICAgY2FsbGJhY2soZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiB0YXAoZWxlbWVudDpFbGVtZW50fERvY3VtZW50LCBjYWxsYmFjazooZT86RXZlbnQpID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdO1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHRhcChwYXJlbnQ6RWxlbWVudHxEb2N1bWVudCwgZGVsZWdhdGVTZWxlY3RvcjpzdHJpbmcsIGNhbGxiYWNrOihlPzpFdmVudCkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW107XHJcbiAgICBleHBvcnQgZnVuY3Rpb24gdGFwKC4uLnBhcmFtczphbnlbXSk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xyXG4gICAgICAgIGxldCBzdGFydFRvdWNoWDpudW1iZXIsIHN0YXJ0VG91Y2hZOm51bWJlcjtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgaGFuZGxlU3RhcnQgPSAoZTpUb3VjaEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHN0YXJ0VG91Y2hYID0gZS50b3VjaGVzWzBdLmNsaWVudFg7XHJcbiAgICAgICAgICAgIHN0YXJ0VG91Y2hZID0gZS50b3VjaGVzWzBdLmNsaWVudFk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBoYW5kbGVFbmQgPSAoZTpUb3VjaEV2ZW50LCBjYWxsYmFjazooZT86RXZlbnQpID0+IHZvaWQpID0+IHtcclxuICAgICAgICAgICAgaWYgKGUuY2hhbmdlZFRvdWNoZXMgPT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCB4RGlmZiA9IGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WCAtIHN0YXJ0VG91Y2hYO1xyXG4gICAgICAgICAgICBsZXQgeURpZmYgPSBlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFkgLSBzdGFydFRvdWNoWTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChNYXRoLnNxcnQoeERpZmYgKiB4RGlmZiArIHlEaWZmICogeURpZmYpIDwgMTApIHtcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBsaXN0ZW5lcnM6SUxpc3RlbmVyUmVmZXJlbmNlW10gPSBbXTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAocGFyYW1zLmxlbmd0aCA9PT0gMykge1xyXG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuY29uY2F0KGF0dGFjaEV2ZW50c0RlbGVnYXRlKFsndG91Y2hzdGFydCddLCBwYXJhbXNbMF0sIHBhcmFtc1sxXSwgaGFuZGxlU3RhcnQpKTtcclxuICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChhdHRhY2hFdmVudHNEZWxlZ2F0ZShbJ3RvdWNoZW5kJywgJ2NsaWNrJ10sIHBhcmFtc1swXSwgcGFyYW1zWzFdLCAoZTpUb3VjaEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVFbmQoZSwgcGFyYW1zWzJdKTtcclxuICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAocGFyYW1zLmxlbmd0aCA9PT0gMikge1xyXG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuY29uY2F0KGF0dGFjaEV2ZW50cyhbJ3RvdWNoc3RhcnQnXSwgcGFyYW1zWzBdLCBoYW5kbGVTdGFydCkpO1xyXG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuY29uY2F0KGF0dGFjaEV2ZW50cyhbJ3RvdWNoZW5kJywgJ2NsaWNrJ10sIHBhcmFtc1swXSwgKGU6VG91Y2hFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlRW5kKGUsIHBhcmFtc1sxXSk7XHJcbiAgICAgICAgICAgIH0pKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGxpc3RlbmVycztcclxuICAgIH1cclxuICAgIFxyXG4gICAgZnVuY3Rpb24gc3dpcGUoZWxlbWVudDpFbGVtZW50LCBkaXJlY3Rpb246c3RyaW5nLCBjYWxsYmFjazooZT86RXZlbnQpID0+IHZvaWQpIHtcclxuICAgICAgICBsZXQgc3RhcnRUb3VjaFg6bnVtYmVyLCBzdGFydFRvdWNoWTpudW1iZXIsIHN0YXJ0VGltZTpudW1iZXI7XHJcbiAgICAgICAgbGV0IHRvdWNoTW92ZUxpc3RlbmVyOklMaXN0ZW5lclJlZmVyZW5jZTtcclxuICAgICAgICBsZXQgc2Nyb2xsaW5nRGlzYWJsZWQ6Ym9vbGVhbjtcclxuICAgICAgICBcclxuICAgICAgICBhdHRhY2hFdmVudHMoWyd0b3VjaHN0YXJ0J10sIGVsZW1lbnQsIChlOlRvdWNoRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgc3RhcnRUb3VjaFggPSBlLnRvdWNoZXNbMF0uY2xpZW50WDtcclxuICAgICAgICAgICAgc3RhcnRUb3VjaFkgPSBlLnRvdWNoZXNbMF0uY2xpZW50WTtcclxuICAgICAgICAgICAgc3RhcnRUaW1lID0gbmV3IERhdGUoKS52YWx1ZU9mKCk7XHJcbiAgICAgICAgICAgIHNjcm9sbGluZ0Rpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRvdWNoTW92ZUxpc3RlbmVyID0gYXR0YWNoRXZlbnRzKFsndG91Y2htb3ZlJ10sIGRvY3VtZW50LCAoZTpUb3VjaEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgeERpZmYgPSBNYXRoLmFicyhlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFggLSBzdGFydFRvdWNoWCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgeURpZmYgPSBNYXRoLmFicyhlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFkgLSBzdGFydFRvdWNoWSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoeERpZmYgPiB5RGlmZiAmJiB4RGlmZiA+IDIwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsaW5nRGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh5RGlmZiA+IHhEaWZmICYmIHlEaWZmID4gMjApIHtcclxuICAgICAgICAgICAgICAgICAgICBzY3JvbGxpbmdEaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKG5ldyBEYXRlKCkudmFsdWVPZigpIC0gc3RhcnRUaW1lID4gNTAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsaW5nRGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChzY3JvbGxpbmdEaXNhYmxlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlbMF07IFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGF0dGFjaEV2ZW50cyhbJ3RvdWNoZW5kJ10sIGVsZW1lbnQsIChlOlRvdWNoRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0b3VjaE1vdmVMaXN0ZW5lci5ldmVudCwgdG91Y2hNb3ZlTGlzdGVuZXIucmVmZXJlbmNlKTtcclxuICAgICAgICAgICAgaWYgKHN0YXJ0VG91Y2hYID09PSB2b2lkIDAgfHwgc3RhcnRUb3VjaFkgPT09IHZvaWQgMCkgcmV0dXJuO1xyXG4gICAgICAgICAgICBpZiAobmV3IERhdGUoKS52YWx1ZU9mKCkgLSBzdGFydFRpbWUgPiA1MDApIHJldHVybjtcclxuICAgICAgICAgICAgbGV0IHhEaWZmID0gZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRYIC0gc3RhcnRUb3VjaFg7XHJcbiAgICAgICAgICAgIGxldCB5RGlmZiA9IGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WSAtIHN0YXJ0VG91Y2hZO1xyXG4gICAgICAgICAgICBpZiAoTWF0aC5hYnMoeERpZmYpID4gTWF0aC5hYnMoeURpZmYpICYmIE1hdGguYWJzKHhEaWZmKSA+IDIwKSB7XHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGlyZWN0aW9uID09PSAnbGVmdCcgJiYgeERpZmYgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZGlyZWN0aW9uID09PSAncmlnaHQnICYmIHhEaWZmID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBzd2lwZUxlZnQoZWxlbWVudDpFbGVtZW50LCBjYWxsYmFjazooZT86RXZlbnQpID0+IHZvaWQpIHtcclxuICAgICAgICBzd2lwZShlbGVtZW50LCAnbGVmdCcsIGNhbGxiYWNrKTtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gc3dpcGVSaWdodChlbGVtZW50OkVsZW1lbnQsIGNhbGxiYWNrOihlPzpFdmVudCkgPT4gdm9pZCkge1xyXG4gICAgICAgIHN3aXBlKGVsZW1lbnQsICdyaWdodCcsIGNhbGxiYWNrKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGRyYWcoZWxlbWVudDpFbGVtZW50LCBjYWxsYmFja3M6SURyYWdDYWxsYmFja3MpOnZvaWQ7XHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZHJhZyhwYXJlbnQ6RWxlbWVudCwgZGVsZWdhdGVTZWxlY3RvcjpzdHJpbmcsIGNhbGxiYWNrczpJRHJhZ0NhbGxiYWNrcyk6dm9pZDtcclxuICAgIGV4cG9ydCBmdW5jdGlvbiBkcmFnKC4uLnBhcmFtczphbnlbXSk6dm9pZCB7XHJcbiAgICAgICAgbGV0IGRyYWdnaW5nOmJvb2xlYW4gPSBmYWxzZTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgY2FsbGJhY2tzOklEcmFnQ2FsbGJhY2tzID0gcGFyYW1zW3BhcmFtcy5sZW5ndGgtMV07XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHN0YXJ0RXZlbnRzID0gKGU/Ok1vdXNlRXZlbnR8VG91Y2hFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBkcmFnZ2luZyA9IHRydWU7XHJcbiAgICAgICAgICAgIGlmIChjYWxsYmFja3MuZHJhZ1N0YXJ0ICE9PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrcy5kcmFnU3RhcnQoZSk7XHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBsaXN0ZW5lcnM6SUxpc3RlbmVyUmVmZXJlbmNlW10gPSBbXTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IGxpc3RlbmVycy5jb25jYXQoYXR0YWNoRXZlbnRzKFsndG91Y2htb3ZlJywgJ21vdXNlbW92ZSddLCBkb2N1bWVudCwgKGU/Ok1vdXNlRXZlbnR8VG91Y2hFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRyYWdnaW5nICYmIGNhbGxiYWNrcy5kcmFnTW92ZSAhPT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tzLmRyYWdNb3ZlKGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuY29uY2F0KGF0dGFjaEV2ZW50cyhbJ3RvdWNoZW5kJywgJ21vdXNldXAnXSwgZG9jdW1lbnQsIChlPzpNb3VzZUV2ZW50fFRvdWNoRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChkcmFnZ2luZyAmJiBjYWxsYmFja3MuZHJhZ0VuZCAhPT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tzLmRyYWdFbmQoZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZHJhZ2dpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHJlbW92ZUxpc3RlbmVycyhsaXN0ZW5lcnMpOyAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9KSk7ICBcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHBhcmFtcy5sZW5ndGggPT09IDMpIHtcclxuICAgICAgICAgICAgYXR0YWNoRXZlbnRzRGVsZWdhdGUoWyd0b3VjaHN0YXJ0JywgJ21vdXNlZG93biddLCBwYXJhbXNbMF0sIHBhcmFtc1sxXSwgc3RhcnRFdmVudHMpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGF0dGFjaEV2ZW50cyhbJ3RvdWNoc3RhcnQnLCAnbW91c2Vkb3duJ10sIHBhcmFtc1swXSwgc3RhcnRFdmVudHMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gQ1VTVE9NXHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiBnb3RvKGVsZW1lbnQ6RWxlbWVudCwgY2FsbGJhY2s6KGU/OntkYXRlOkRhdGUsIGxldmVsOkxldmVsLCB1cGRhdGU/OmJvb2xlYW59KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ2RhdGl1bS1nb3RvJ10sIGVsZW1lbnQsIChlOkN1c3RvbUV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGUuZGV0YWlsKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHpvb21PdXQoZWxlbWVudDpFbGVtZW50LCBjYWxsYmFjazooZT86e2RhdGU6RGF0ZSwgY3VycmVudExldmVsOkxldmVsLCB1cGRhdGU/OmJvb2xlYW59KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ2RhdGl1bS16b29tLW91dCddLCBlbGVtZW50LCAoZTpDdXN0b21FdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBjYWxsYmFjayhlLmRldGFpbCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiB6b29tSW4oZWxlbWVudDpFbGVtZW50LCBjYWxsYmFjazooZT86e2RhdGU6RGF0ZSwgY3VycmVudExldmVsOkxldmVsLCB1cGRhdGU/OmJvb2xlYW59KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ2RhdGl1bS16b29tLWluJ10sIGVsZW1lbnQsIChlOkN1c3RvbUV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGUuZGV0YWlsKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHZpZXdjaGFuZ2VkKGVsZW1lbnQ6RWxlbWVudCwgY2FsbGJhY2s6KGU/OntkYXRlOkRhdGUsIGxldmVsOkxldmVsLCB1cGRhdGU/OmJvb2xlYW59KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ2RhdGl1bS12aWV3Y2hhbmdlZCddLCBlbGVtZW50LCAoZTpDdXN0b21FdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBjYWxsYmFjayhlLmRldGFpbCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiBvcGVuQnViYmxlKGVsZW1lbnQ6RWxlbWVudCwgY2FsbGJhY2s6KGU6e3g6bnVtYmVyLCB5Om51bWJlciwgdGV4dDpzdHJpbmd9KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ2RhdGl1bS1vcGVuLWJ1YmJsZSddLCBlbGVtZW50LCAoZTpDdXN0b21FdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBjYWxsYmFjayhlLmRldGFpbCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiB1cGRhdGVCdWJibGUoZWxlbWVudDpFbGVtZW50LCBjYWxsYmFjazooZTp7eDpudW1iZXIsIHk6bnVtYmVyLCB0ZXh0OnN0cmluZ30pID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdIHtcclxuICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzKFsnZGF0aXVtLXVwZGF0ZS1idWJibGUnXSwgZWxlbWVudCwgKGU6Q3VzdG9tRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgY2FsbGJhY2soZS5kZXRhaWwpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXJzKGxpc3RlbmVyczpJTGlzdGVuZXJSZWZlcmVuY2VbXSkge1xyXG4gICAgICAgIGxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xyXG4gICAgICAgICAgIGxpc3RlbmVyLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihsaXN0ZW5lci5ldmVudCwgbGlzdGVuZXIucmVmZXJlbmNlKTsgXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbm5hbWVzcGFjZSB0cmlnZ2VyIHtcclxuICAgIGV4cG9ydCBmdW5jdGlvbiBnb3RvKGVsZW1lbnQ6RWxlbWVudCwgZGF0YT86e2RhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWwsIHVwZGF0ZT86Ym9vbGVhbn0pIHtcclxuICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdkYXRpdW0tZ290bycsIHtcclxuICAgICAgICAgICAgYnViYmxlczogZmFsc2UsXHJcbiAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXHJcbiAgICAgICAgICAgIGRldGFpbDogZGF0YVxyXG4gICAgICAgIH0pKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHpvb21PdXQoZWxlbWVudDpFbGVtZW50LCBkYXRhPzp7ZGF0ZTpEYXRlLCBjdXJyZW50TGV2ZWw6TGV2ZWwsIHVwZGF0ZT86Ym9vbGVhbn0pIHtcclxuICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdkYXRpdW0tem9vbS1vdXQnLCB7XHJcbiAgICAgICAgICAgIGJ1YmJsZXM6IGZhbHNlLCBcclxuICAgICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgZGV0YWlsOiBkYXRhXHJcbiAgICAgICAgfSkpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gem9vbUluKGVsZW1lbnQ6RWxlbWVudCwgZGF0YT86e2RhdGU6RGF0ZSwgY3VycmVudExldmVsOkxldmVsLCB1cGRhdGU/OmJvb2xlYW59KSB7XHJcbiAgICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnZGF0aXVtLXpvb20taW4nLCB7XHJcbiAgICAgICAgICAgIGJ1YmJsZXM6IGZhbHNlLCBcclxuICAgICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgZGV0YWlsOiBkYXRhXHJcbiAgICAgICAgfSkpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gdmlld2NoYW5nZWQoZWxlbWVudDpFbGVtZW50LCBkYXRhPzp7ZGF0ZTpEYXRlLCBsZXZlbDpMZXZlbCwgdXBkYXRlPzpib29sZWFufSkge1xyXG4gICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2RhdGl1bS12aWV3Y2hhbmdlZCcsIHtcclxuICAgICAgICAgICAgYnViYmxlczogZmFsc2UsXHJcbiAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXHJcbiAgICAgICAgICAgIGRldGFpbDogZGF0YVxyXG4gICAgICAgIH0pKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIG9wZW5CdWJibGUoZWxlbWVudDpFbGVtZW50LCBkYXRhOnt4Om51bWJlciwgeTpudW1iZXIsIHRleHQ6c3RyaW5nfSkge1xyXG4gICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2RhdGl1bS1vcGVuLWJ1YmJsZScsIHtcclxuICAgICAgICAgICAgYnViYmxlczogZmFsc2UsXHJcbiAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXHJcbiAgICAgICAgICAgIGRldGFpbDogZGF0YVxyXG4gICAgICAgIH0pKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZUJ1YmJsZShlbGVtZW50OkVsZW1lbnQsIGRhdGE6e3g6bnVtYmVyLCB5Om51bWJlciwgdGV4dDpzdHJpbmd9KSB7XHJcbiAgICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnZGF0aXVtLXVwZGF0ZS1idWJibGUnLCB7XHJcbiAgICAgICAgICAgIGJ1YmJsZXM6IGZhbHNlLFxyXG4gICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICBkZXRhaWw6IGRhdGFcclxuICAgICAgICB9KSk7XHJcbiAgICB9XHJcbn0iLCJpbnRlcmZhY2UgSURhdGVQYXJ0IHtcclxuICAgIGluY3JlbWVudCgpOnZvaWQ7XHJcbiAgICBkZWNyZW1lbnQoKTp2b2lkO1xyXG4gICAgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZyk6Ym9vbGVhbjtcclxuICAgIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKTpib29sZWFuO1xyXG4gICAgZ2V0TGFzdFZhbHVlKCk6RGF0ZTtcclxuICAgIGdldFZhbHVlKCk6RGF0ZTtcclxuICAgIGdldFJlZ0V4KCk6UmVnRXhwO1xyXG4gICAgc2V0U2VsZWN0YWJsZShzZWxlY3RhYmxlOmJvb2xlYW4pOklEYXRlUGFydDtcclxuICAgIGdldE1heEJ1ZmZlcigpOm51bWJlcjtcclxuICAgIGdldExldmVsKCk6TGV2ZWw7XHJcbiAgICBpc1NlbGVjdGFibGUoKTpib29sZWFuO1xyXG4gICAgdG9TdHJpbmcoKTpzdHJpbmc7XHJcbn1cclxuXHJcbmNsYXNzIFBsYWluVGV4dCBpbXBsZW1lbnRzIElEYXRlUGFydCB7XHJcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHRleHQ6c3RyaW5nKSB7fVxyXG4gICAgcHVibGljIGluY3JlbWVudCgpIHt9XHJcbiAgICBwdWJsaWMgZGVjcmVtZW50KCkge31cclxuICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKCkgeyByZXR1cm4gZmFsc2UgfVxyXG4gICAgcHVibGljIHNldFZhbHVlKCkgeyByZXR1cm4gZmFsc2UgfVxyXG4gICAgcHVibGljIGdldExhc3RWYWx1ZSgpOkRhdGUgeyByZXR1cm4gbnVsbCB9XHJcbiAgICBwdWJsaWMgZ2V0VmFsdWUoKTpEYXRlIHsgcmV0dXJuIG51bGwgfVxyXG4gICAgcHVibGljIGdldFJlZ0V4KCk6UmVnRXhwIHsgcmV0dXJuIG5ldyBSZWdFeHAoYFske3RoaXMudGV4dH1dYCk7IH1cclxuICAgIHB1YmxpYyBzZXRTZWxlY3RhYmxlKHNlbGVjdGFibGU6Ym9vbGVhbik6SURhdGVQYXJ0IHsgcmV0dXJuIHRoaXMgfVxyXG4gICAgcHVibGljIGdldE1heEJ1ZmZlcigpOm51bWJlciB7IHJldHVybiAwIH1cclxuICAgIHB1YmxpYyBnZXRMZXZlbCgpOkxldmVsIHsgcmV0dXJuIExldmVsLk5PTkUgfVxyXG4gICAgcHVibGljIGlzU2VsZWN0YWJsZSgpOmJvb2xlYW4geyByZXR1cm4gZmFsc2UgfVxyXG4gICAgcHVibGljIHRvU3RyaW5nKCk6c3RyaW5nIHsgcmV0dXJuIHRoaXMudGV4dCB9XHJcbn1cclxuICAgIFxyXG5sZXQgZm9ybWF0QmxvY2tzID0gKGZ1bmN0aW9uKCkgeyAgICBcclxuICAgIGNsYXNzIERhdGVQYXJ0IGV4dGVuZHMgQ29tbW9uIHtcclxuICAgICAgICBwcm90ZWN0ZWQgZGF0ZTpEYXRlO1xyXG4gICAgICAgIHByb3RlY3RlZCBzZWxlY3RhYmxlOmJvb2xlYW4gPSB0cnVlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHByaXZhdGUgY3VycmVudDpEYXRlO1xyXG4gICAgICAgIHByaXZhdGUgbGFzdDpEYXRlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBvcHRpb25zOklPcHRpb25zKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRWYWx1ZSgpOkRhdGUge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRTZWxlY3RhYmxlKHNlbGVjdGFibGU6Ym9vbGVhbikge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGFibGUgPSBzZWxlY3RhYmxlO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGlzU2VsZWN0YWJsZSgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0YWJsZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHJvdGVjdGVkIHNldExhc3QoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnQgPT09IHZvaWQgMCB8fFxyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID09PSB2b2lkIDAgfHxcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS52YWx1ZU9mKCkgIT09IHRoaXMuY3VycmVudC52YWx1ZU9mKCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubGFzdCA9IHRoaXMuY3VycmVudDtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IHRoaXMuZGF0ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TGFzdFZhbHVlKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5sYXN0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgRm91ckRpZ2l0WWVhciBleHRlbmRzIERhdGVQYXJ0IHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihvcHRpb25zOklPcHRpb25zKSB7IHN1cGVyKG9wdGlvbnMpOyB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGluY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldEZ1bGxZZWFyKHRoaXMuZGF0ZS5nZXRGdWxsWWVhcigpICsgMSk7XHJcbiAgICAgICAgICAgIH0gd2hpbGUgKCF0aGlzLm9wdGlvbnMuaXNZZWFyU2VsZWN0YWJsZSh0aGlzLmRhdGUpKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRMYXN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBkZWNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRGdWxsWWVhcih0aGlzLmRhdGUuZ2V0RnVsbFllYXIoKSAtIDEpO1xyXG4gICAgICAgICAgICB9IHdoaWxlICghdGhpcy5vcHRpb25zLmlzWWVhclNlbGVjdGFibGUodGhpcy5kYXRlKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZShwYXJ0aWFsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRMYXN0KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHRoaXMuZ2V0UmVnRXgoKS50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldEZ1bGxZZWFyKHBhcnNlSW50KHZhbHVlLCAxMCkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRMYXN0KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eLT9cXGR7MSw0fSQvO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TWF4QnVmZmVyKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gNDtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldExldmVsKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTGV2ZWwuWUVBUjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldEZ1bGxZZWFyKCkudG9TdHJpbmcoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIFR3b0RpZ2l0WWVhciBleHRlbmRzIEZvdXJEaWdpdFllYXIge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6SU9wdGlvbnMpIHsgc3VwZXIob3B0aW9ucyk7IH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TWF4QnVmZmVyKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gMjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRMYXN0KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHRoaXMuZ2V0UmVnRXgoKS50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGJhc2UgPSBNYXRoLmZsb29yKHN1cGVyLmdldFZhbHVlKCkuZ2V0RnVsbFllYXIoKS8xMDApKjEwMDtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRGdWxsWWVhcihwYXJzZUludCg8c3RyaW5nPnZhbHVlLCAxMCkgKyBiYXNlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXi0/XFxkezEsMn0kLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3VwZXIudG9TdHJpbmcoKS5zbGljZSgtMik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBMb25nTW9udGhOYW1lIGV4dGVuZHMgRGF0ZVBhcnQge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6SU9wdGlvbnMpIHsgc3VwZXIob3B0aW9ucyk7IH1cclxuICAgICAgICBcclxuICAgICAgICBwcm90ZWN0ZWQgZ2V0TW9udGhzKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3VwZXIuZ2V0TW9udGhzKCk7XHJcbiAgICAgICAgfSBcclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgaW5jcmVtZW50KCkge1xyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldE1vbnRoKCkgKyAxO1xyXG4gICAgICAgICAgICAgICAgaWYgKG51bSA+IDExKSBudW0gPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1vbnRoKG51bSk7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAodGhpcy5kYXRlLmdldE1vbnRoKCkgPiBudW0pIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0RGF0ZSh0aGlzLmRhdGUuZ2V0RGF0ZSgpIC0gMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gd2hpbGUgKCF0aGlzLm9wdGlvbnMuaXNNb250aFNlbGVjdGFibGUodGhpcy5kYXRlKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZGVjcmVtZW50KCkge1xyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldE1vbnRoKCkgLSAxO1xyXG4gICAgICAgICAgICAgICAgaWYgKG51bSA8IDApIG51bSA9IDExO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1vbnRoKG51bSk7XHJcbiAgICAgICAgICAgIH0gd2hpbGUgKCF0aGlzLm9wdGlvbnMuaXNNb250aFNlbGVjdGFibGUodGhpcy5kYXRlKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICBsZXQgbW9udGggPSB0aGlzLmdldE1vbnRocygpLmZpbHRlcigobW9udGgpID0+IHtcclxuICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoYF4ke3BhcnRpYWx9LiokYCwgJ2knKS50ZXN0KG1vbnRoKTsgXHJcbiAgICAgICAgICAgIH0pWzBdO1xyXG4gICAgICAgICAgICBpZiAobW9udGggIT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUobW9udGgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRMYXN0KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHRoaXMuZ2V0UmVnRXgoKS50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZ2V0TW9udGhzKCkuaW5kZXhPZih2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0TW9udGgobnVtKTtcclxuICAgICAgICAgICAgICAgIHdoaWxlICh0aGlzLmRhdGUuZ2V0TW9udGgoKSA+IG51bSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXREYXRlKHRoaXMuZGF0ZS5nZXREYXRlKCkgLSAxKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUmVnRXhwKGBeKCgke3RoaXMuZ2V0TW9udGhzKCkuam9pbihcIil8KFwiKX0pKSRgLCAnaScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TWF4QnVmZmVyKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gWzIsMSwzLDIsMywzLDMsMiwxLDEsMSwxXVt0aGlzLmRhdGUuZ2V0TW9udGgoKV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIExldmVsLk1PTlRIO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE1vbnRocygpW3RoaXMuZGF0ZS5nZXRNb250aCgpXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIFNob3J0TW9udGhOYW1lIGV4dGVuZHMgTG9uZ01vbnRoTmFtZSB7XHJcbiAgICAgICAgY29uc3RydWN0b3Iob3B0aW9uczpJT3B0aW9ucykgeyBzdXBlcihvcHRpb25zKTsgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHByb3RlY3RlZCBnZXRNb250aHMoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzdXBlci5nZXRTaG9ydE1vbnRocygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgTW9udGggZXh0ZW5kcyBMb25nTW9udGhOYW1lIHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihvcHRpb25zOklPcHRpb25zKSB7IHN1cGVyKG9wdGlvbnMpOyB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXRNb250aCgpID4gMCA/IDEgOiAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAoL15cXGR7MSwyfSQvLnRlc3QocGFydGlhbCkpIHtcclxuICAgICAgICAgICAgICAgIGxldCB0cmltbWVkID0gdGhpcy50cmltKHBhcnRpYWwgPT09ICcwJyA/ICcxJyA6IHBhcnRpYWwpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUodHJpbW1lZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKHZhbHVlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldExhc3QoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0TW9udGgocGFyc2VJbnQodmFsdWUsIDEwKSAtIDEpO1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKHRoaXMuZGF0ZS5nZXRNb250aCgpID4gcGFyc2VJbnQodmFsdWUsIDEwKSAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0RGF0ZSh0aGlzLmRhdGUuZ2V0RGF0ZSgpIC0gMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldExhc3QoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL14oWzEtOV18KDFbMC0yXSkpJC87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuICh0aGlzLmRhdGUuZ2V0TW9udGgoKSArIDEpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBQYWRkZWRNb250aCBleHRlbmRzIE1vbnRoIHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihvcHRpb25zOklPcHRpb25zKSB7IHN1cGVyKG9wdGlvbnMpOyB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKC9eXFxkezEsMn0kLy50ZXN0KHBhcnRpYWwpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGFkZGVkID0gdGhpcy5wYWQocGFydGlhbCA9PT0gJzAnID8gJzEnIDogcGFydGlhbCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZShwYWRkZWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL14oKDBbMS05XSl8KDFbMC0yXSkpJC87ICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFkKHN1cGVyLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgRGF0ZU51bWVyYWwgZXh0ZW5kcyBEYXRlUGFydCB7XHJcbiAgICAgICAgY29uc3RydWN0b3Iob3B0aW9uczpJT3B0aW9ucykgeyBzdXBlcihvcHRpb25zKTsgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBpbmNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0RGF0ZSgpICsgMTtcclxuICAgICAgICAgICAgICAgIGlmIChudW0gPiB0aGlzLmRheXNJbk1vbnRoKHRoaXMuZGF0ZSkpIG51bSA9IDE7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0RGF0ZShudW0pO1xyXG4gICAgICAgICAgICB9IHdoaWxlICghdGhpcy5vcHRpb25zLmlzRGF0ZVNlbGVjdGFibGUodGhpcy5kYXRlKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZGVjcmVtZW50KCkge1xyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldERhdGUoKSAtIDE7XHJcbiAgICAgICAgICAgICAgICBpZiAobnVtIDwgMSkgbnVtID0gdGhpcy5kYXlzSW5Nb250aCh0aGlzLmRhdGUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldERhdGUobnVtKTtcclxuICAgICAgICAgICAgfSB3aGlsZSAoIXRoaXMub3B0aW9ucy5pc0RhdGVTZWxlY3RhYmxlKHRoaXMuZGF0ZSkpO1xyXG4gICAgICAgICAgICB0aGlzLnNldExhc3QoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKC9eXFxkezEsMn0kLy50ZXN0KHBhcnRpYWwpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdHJpbW1lZCA9IHRoaXMudHJpbShwYXJ0aWFsID09PSAnMCcgPyAnMScgOiBwYXJ0aWFsKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHRyaW1tZWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRMYXN0KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHRoaXMuZ2V0UmVnRXgoKS50ZXN0KHZhbHVlKSAmJiBwYXJzZUludCh2YWx1ZSwgMTApIDwgdGhpcy5kYXlzSW5Nb250aCh0aGlzLmRhdGUpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0RGF0ZShwYXJzZUludCh2YWx1ZSwgMTApKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXlsxLTldfCgoMXwyKVswLTldKXwoM1swLTFdKSQvO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TWF4QnVmZmVyKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldERhdGUoKSA+IE1hdGguZmxvb3IodGhpcy5kYXlzSW5Nb250aCh0aGlzLmRhdGUpLzEwKSA/IDEgOiAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBMZXZlbC5EQVRFO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0RGF0ZSgpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBQYWRkZWREYXRlIGV4dGVuZHMgRGF0ZU51bWVyYWwge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6SU9wdGlvbnMpIHsgc3VwZXIob3B0aW9ucyk7IH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAoL15cXGR7MSwyfSQvLnRlc3QocGFydGlhbCkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBwYWRkZWQgPSB0aGlzLnBhZChwYXJ0aWFsID09PSAnMCcgPyAnMScgOiBwYXJ0aWFsKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHBhZGRlZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXigwWzEtOV0pfCgoMXwyKVswLTldKXwoM1swLTFdKSQvO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhZCh0aGlzLmRhdGUuZ2V0RGF0ZSgpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIERhdGVPcmRpbmFsIGV4dGVuZHMgRGF0ZU51bWVyYWwge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6SU9wdGlvbnMpIHsgc3VwZXIob3B0aW9ucyk7IH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXihbMS05XXwoKDF8MilbMC05XSl8KDNbMC0xXSkpKChzdCl8KG5kKXwocmQpfCh0aCkpPyQvaTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICBsZXQgZGF0ZSA9IHRoaXMuZGF0ZS5nZXREYXRlKCk7XHJcbiAgICAgICAgICAgIGxldCBqID0gZGF0ZSAlIDEwO1xyXG4gICAgICAgICAgICBsZXQgayA9IGRhdGUgJSAxMDA7XHJcbiAgICAgICAgICAgIGlmIChqID09PSAxICYmIGsgIT09IDExKSByZXR1cm4gZGF0ZSArIFwic3RcIjtcclxuICAgICAgICAgICAgaWYgKGogPT09IDIgJiYgayAhPT0gMTIpIHJldHVybiBkYXRlICsgXCJuZFwiO1xyXG4gICAgICAgICAgICBpZiAoaiA9PT0gMyAmJiBrICE9PSAxMykgcmV0dXJuIGRhdGUgKyBcInJkXCI7XHJcbiAgICAgICAgICAgIHJldHVybiBkYXRlICsgXCJ0aFwiO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgTG9uZ0RheU5hbWUgZXh0ZW5kcyBEYXRlUGFydCB7XHJcbiAgICAgICAgY29uc3RydWN0b3Iob3B0aW9uczpJT3B0aW9ucykgeyBzdXBlcihvcHRpb25zKTsgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHByb3RlY3RlZCBnZXREYXlzKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3VwZXIuZ2V0RGF5cygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgaW5jcmVtZW50KCkge1xyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldERheSgpICsgMTtcclxuICAgICAgICAgICAgICAgIGlmIChudW0gPiA2KSBudW0gPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldERhdGUodGhpcy5kYXRlLmdldERhdGUoKSAtIHRoaXMuZGF0ZS5nZXREYXkoKSArIG51bSk7XHJcbiAgICAgICAgICAgIH0gd2hpbGUgKCF0aGlzLm9wdGlvbnMuaXNEYXRlU2VsZWN0YWJsZSh0aGlzLmRhdGUpKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRMYXN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBkZWNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0RGF5KCkgLSAxO1xyXG4gICAgICAgICAgICAgICAgaWYgKG51bSA8IDApIG51bSA9IDY7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0RGF0ZSh0aGlzLmRhdGUuZ2V0RGF0ZSgpIC0gdGhpcy5kYXRlLmdldERheSgpICsgbnVtKTtcclxuICAgICAgICAgICAgfSB3aGlsZSAoIXRoaXMub3B0aW9ucy5pc0RhdGVTZWxlY3RhYmxlKHRoaXMuZGF0ZSkpO1xyXG4gICAgICAgICAgICB0aGlzLnNldExhc3QoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgbGV0IGRheSA9IHRoaXMuZ2V0RGF5cygpLmZpbHRlcigoZGF5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cChgXiR7cGFydGlhbH0uKiRgLCAnaScpLnRlc3QoZGF5KTtcclxuICAgICAgICAgICAgfSlbMF07XHJcbiAgICAgICAgICAgIGlmIChkYXkgIT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUoZGF5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmdldERheXMoKS5pbmRleE9mKHZhbHVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXREYXRlKHRoaXMuZGF0ZS5nZXREYXRlKCkgLSB0aGlzLmRhdGUuZ2V0RGF5KCkgKyBudW0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRMYXN0KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoYF4oKCR7dGhpcy5nZXREYXlzKCkuam9pbihcIil8KFwiKX0pKSRgLCAnaScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TWF4QnVmZmVyKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gWzIsMSwyLDEsMiwxLDJdW3RoaXMuZGF0ZS5nZXREYXkoKV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIExldmVsLkRBVEU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RGF5cygpW3RoaXMuZGF0ZS5nZXREYXkoKV07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBTaG9ydERheU5hbWUgZXh0ZW5kcyBMb25nRGF5TmFtZSB7XHJcbiAgICAgICAgY29uc3RydWN0b3Iob3B0aW9uczpJT3B0aW9ucykgeyBzdXBlcihvcHRpb25zKTsgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHByb3RlY3RlZCBnZXREYXlzKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3VwZXIuZ2V0U2hvcnREYXlzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBQYWRkZWRNaWxpdGFyeUhvdXIgZXh0ZW5kcyBEYXRlUGFydCB7XHJcbiAgICAgICAgY29uc3RydWN0b3Iob3B0aW9uczpJT3B0aW9ucykgeyBzdXBlcihvcHRpb25zKTsgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBpbmNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0SG91cnMoKSArIDE7XHJcbiAgICAgICAgICAgICAgICBpZiAobnVtID4gMjMpIG51bSA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnMobnVtKTtcclxuICAgICAgICAgICAgfSB3aGlsZSAoIXRoaXMub3B0aW9ucy5pc0hvdXJTZWxlY3RhYmxlKHRoaXMuZGF0ZSkpO1xyXG4gICAgICAgICAgICB0aGlzLnNldExhc3QoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGRlY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRIb3VycygpIC0gMTtcclxuICAgICAgICAgICAgICAgIGlmIChudW0gPCAwKSBudW0gPSAyMztcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3VycyhudW0pO1xyXG4gICAgICAgICAgICAgICAgLy8gRGF5IExpZ2h0IFNhdmluZ3MgQWRqdXN0bWVudFxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZGF0ZS5nZXRIb3VycygpICE9PSBudW0pIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnMobnVtIC0gMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gd2hpbGUgKCF0aGlzLm9wdGlvbnMuaXNIb3VyU2VsZWN0YWJsZSh0aGlzLmRhdGUpKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRMYXN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICgvXlxcZHsxLDJ9JC8udGVzdChwYXJ0aWFsKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhZGRlZCA9IHRoaXMucGFkKHBhcnRpYWwpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUocGFkZGVkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3VycyhwYXJzZUludCh2YWx1ZSwgMTApKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TWF4QnVmZmVyKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldEhvdXJzKCkgPiAyID8gMSA6IDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIExldmVsLkhPVVI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eKCgoMHwxKVswLTldKXwoMlswLTNdKSkkLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYWQodGhpcy5kYXRlLmdldEhvdXJzKCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgTWlsaXRhcnlIb3VyIGV4dGVuZHMgUGFkZGVkTWlsaXRhcnlIb3VyIHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihvcHRpb25zOklPcHRpb25zKSB7IHN1cGVyKG9wdGlvbnMpOyB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKC9eXFxkezEsMn0kLy50ZXN0KHBhcnRpYWwpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdHJpbW1lZCA9IHRoaXMudHJpbShwYXJ0aWFsKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHRyaW1tZWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL14oKDE/WzAtOV0pfCgyWzAtM10pKSQvO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0SG91cnMoKS50b1N0cmluZygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgUGFkZGVkSG91ciBleHRlbmRzIFBhZGRlZE1pbGl0YXJ5SG91ciB7XHJcbiAgICAgICAgY29uc3RydWN0b3Iob3B0aW9uczpJT3B0aW9ucykgeyBzdXBlcihvcHRpb25zKTsgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGxldCBwYWRkZWQgPSB0aGlzLnBhZChwYXJ0aWFsID09PSAnMCcgPyAnMScgOiBwYXJ0aWFsKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUocGFkZGVkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRMYXN0KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHRoaXMuZ2V0UmVnRXgoKS50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IG51bSA9IHBhcnNlSW50KHZhbHVlLCAxMCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kYXRlLmdldEhvdXJzKCkgPCAxMiAmJiBudW0gPT09IDEyKSBudW0gPSAwO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZGF0ZS5nZXRIb3VycygpID4gMTEgJiYgbnVtICE9PSAxMikgbnVtICs9IDEyO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldEhvdXJzKG51bSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldExhc3QoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL14oMFsxLTldKXwoMVswLTJdKSQvO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TWF4QnVmZmVyKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcGFyc2VJbnQodGhpcy50b1N0cmluZygpLCAxMCkgPiAxID8gMSA6IDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFkKHRoaXMuZ2V0SG91cnModGhpcy5kYXRlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBIb3VyIGV4dGVuZHMgUGFkZGVkSG91ciB7XHJcbiAgICAgICAgY29uc3RydWN0b3Iob3B0aW9uczpJT3B0aW9ucykgeyBzdXBlcihvcHRpb25zKTsgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGxldCB0cmltbWVkID0gdGhpcy50cmltKHBhcnRpYWwgPT09ICcwJyA/ICcxJyA6IHBhcnRpYWwpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0cmltbWVkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL15bMS05XXwoMVswLTJdKSQvO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRyaW0oc3VwZXIudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBQYWRkZWRNaW51dGUgZXh0ZW5kcyBEYXRlUGFydCB7XHJcbiAgICAgICAgY29uc3RydWN0b3Iob3B0aW9uczpJT3B0aW9ucykgeyBzdXBlcihvcHRpb25zKTsgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBpbmNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0TWludXRlcygpICsgMTtcclxuICAgICAgICAgICAgICAgIGlmIChudW0gPiA1OSkgbnVtID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRNaW51dGVzKG51bSk7XHJcbiAgICAgICAgICAgIH0gd2hpbGUgKCF0aGlzLm9wdGlvbnMuaXNNaW51dGVTZWxlY3RhYmxlKHRoaXMuZGF0ZSkpO1xyXG4gICAgICAgICAgICB0aGlzLnNldExhc3QoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGRlY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRNaW51dGVzKCkgLSAxO1xyXG4gICAgICAgICAgICAgICAgaWYgKG51bSA8IDApIG51bSA9IDU5O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1pbnV0ZXMobnVtKTtcclxuICAgICAgICAgICAgfSB3aGlsZSAoIXRoaXMub3B0aW9ucy5pc01pbnV0ZVNlbGVjdGFibGUodGhpcy5kYXRlKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0aGlzLnBhZChwYXJ0aWFsKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRNaW51dGVzKHBhcnNlSW50KHZhbHVlLCAxMCkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRMYXN0KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eWzAtNV1bMC05XSQvO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TWF4QnVmZmVyKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldE1pbnV0ZXMoKSA+IDUgPyAxIDogMjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldExldmVsKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTGV2ZWwuTUlOVVRFO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhZCh0aGlzLmRhdGUuZ2V0TWludXRlcygpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIE1pbnV0ZSBleHRlbmRzIFBhZGRlZE1pbnV0ZSB7XHJcbiAgICAgICAgY29uc3RydWN0b3Iob3B0aW9uczpJT3B0aW9ucykgeyBzdXBlcihvcHRpb25zKTsgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHRoaXMudHJpbShwYXJ0aWFsKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eWzAtNV0/WzAtOV0kLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldE1pbnV0ZXMoKS50b1N0cmluZygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgUGFkZGVkU2Vjb25kIGV4dGVuZHMgRGF0ZVBhcnQge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6SU9wdGlvbnMpIHsgc3VwZXIob3B0aW9ucyk7IH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgaW5jcmVtZW50KCkge1xyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldFNlY29uZHMoKSArIDE7XHJcbiAgICAgICAgICAgICAgICBpZiAobnVtID4gNTkpIG51bSA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0U2Vjb25kcyhudW0pO1xyXG4gICAgICAgICAgICB9IHdoaWxlICghdGhpcy5vcHRpb25zLmlzU2Vjb25kU2VsZWN0YWJsZSh0aGlzLmRhdGUpKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRMYXN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBkZWNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0U2Vjb25kcygpIC0gMTtcclxuICAgICAgICAgICAgICAgIGlmIChudW0gPCAwKSBudW0gPSA1OTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRTZWNvbmRzKG51bSk7ICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9IHdoaWxlICghdGhpcy5vcHRpb25zLmlzU2Vjb25kU2VsZWN0YWJsZSh0aGlzLmRhdGUpKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRMYXN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHRoaXMucGFkKHBhcnRpYWwpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRMYXN0KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHRoaXMuZ2V0UmVnRXgoKS50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldFNlY29uZHMocGFyc2VJbnQodmFsdWUsIDEwKSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldExhc3QoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL15bMC01XVswLTldJC87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0U2Vjb25kcygpID4gNSA/IDEgOiAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBMZXZlbC5TRUNPTkQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFkKHRoaXMuZGF0ZS5nZXRTZWNvbmRzKCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgU2Vjb25kIGV4dGVuZHMgUGFkZGVkU2Vjb25kIHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihvcHRpb25zOklPcHRpb25zKSB7IHN1cGVyKG9wdGlvbnMpOyB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUodGhpcy50cmltKHBhcnRpYWwpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL15bMC01XT9bMC05XSQvO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0U2Vjb25kcygpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBVcHBlcmNhc2VNZXJpZGllbSBleHRlbmRzIERhdGVQYXJ0IHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihvcHRpb25zOklPcHRpb25zKSB7IHN1cGVyKG9wdGlvbnMpOyB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGluY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRIb3VycygpICsgMTI7XHJcbiAgICAgICAgICAgIGlmIChudW0gPiAyMykgbnVtIC09IDI0O1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnMobnVtKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5pc0hvdXJTZWxlY3RhYmxlKHRoaXMuZGF0ZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWNyZW1lbnQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZGVjcmVtZW50KCkge1xyXG4gICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldEhvdXJzKCkgLSAxMjtcclxuICAgICAgICAgICAgaWYgKG51bSA8IDApIG51bSArPSAyNDtcclxuICAgICAgICAgICAgdGhpcy5kYXRlLnNldEhvdXJzKG51bSk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaXNIb3VyU2VsZWN0YWJsZSh0aGlzLmRhdGUpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldExhc3QoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW5jcmVtZW50KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKC9eKChBTT8pfChQTT8pKSQvaS50ZXN0KHBhcnRpYWwpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZShwYXJ0aWFsWzBdID09PSAnQScgPyAnQU0nIDogJ1BNJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKHZhbHVlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldExhc3QoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUudG9Mb3dlckNhc2UoKSA9PT0gJ2FtJyAmJiB0aGlzLmRhdGUuZ2V0SG91cnMoKSA+IDExKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldEhvdXJzKHRoaXMuZGF0ZS5nZXRIb3VycygpIC0gMTIpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZS50b0xvd2VyQ2FzZSgpID09PSAncG0nICYmIHRoaXMuZGF0ZS5nZXRIb3VycygpIDwgMTIpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnModGhpcy5kYXRlLmdldEhvdXJzKCkgKyAxMik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldExhc3QoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldExldmVsKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTGV2ZWwuSE9VUjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eKChhbSl8KHBtKSkkL2k7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0TWVyaWRpZW0odGhpcy5kYXRlKS50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgTG93ZXJjYXNlTWVyaWRpZW0gZXh0ZW5kcyBVcHBlcmNhc2VNZXJpZGllbSB7XHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRNZXJpZGllbSh0aGlzLmRhdGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgbGV0IGZvcm1hdEJsb2Nrczp7IFtrZXk6c3RyaW5nXTogbmV3IChvcHRpb25zOklPcHRpb25zKSA9PiBJRGF0ZVBhcnQ7IH0gPSB7fTtcclxuICAgIFxyXG4gICAgZm9ybWF0QmxvY2tzWydZWVlZJ10gPSBGb3VyRGlnaXRZZWFyO1xyXG4gICAgZm9ybWF0QmxvY2tzWydZWSddID0gVHdvRGlnaXRZZWFyO1xyXG4gICAgZm9ybWF0QmxvY2tzWydNTU1NJ10gPSBMb25nTW9udGhOYW1lO1xyXG4gICAgZm9ybWF0QmxvY2tzWydNTU0nXSA9IFNob3J0TW9udGhOYW1lO1xyXG4gICAgZm9ybWF0QmxvY2tzWydNTSddID0gUGFkZGVkTW9udGg7XHJcbiAgICBmb3JtYXRCbG9ja3NbJ00nXSA9IE1vbnRoO1xyXG4gICAgZm9ybWF0QmxvY2tzWydERCddID0gUGFkZGVkRGF0ZTtcclxuICAgIGZvcm1hdEJsb2Nrc1snRG8nXSA9IERhdGVPcmRpbmFsO1xyXG4gICAgZm9ybWF0QmxvY2tzWydEJ10gPSBEYXRlTnVtZXJhbDtcclxuICAgIGZvcm1hdEJsb2Nrc1snZGRkZCddID0gTG9uZ0RheU5hbWU7XHJcbiAgICBmb3JtYXRCbG9ja3NbJ2RkZCddID0gU2hvcnREYXlOYW1lO1xyXG4gICAgZm9ybWF0QmxvY2tzWydISCddID0gUGFkZGVkTWlsaXRhcnlIb3VyO1xyXG4gICAgZm9ybWF0QmxvY2tzWydoaCddID0gUGFkZGVkSG91cjtcclxuICAgIGZvcm1hdEJsb2Nrc1snSCddID0gTWlsaXRhcnlIb3VyO1xyXG4gICAgZm9ybWF0QmxvY2tzWydoJ10gPSBIb3VyO1xyXG4gICAgZm9ybWF0QmxvY2tzWydBJ10gPSBVcHBlcmNhc2VNZXJpZGllbTtcclxuICAgIGZvcm1hdEJsb2Nrc1snYSddID0gTG93ZXJjYXNlTWVyaWRpZW07XHJcbiAgICBmb3JtYXRCbG9ja3NbJ21tJ10gPSBQYWRkZWRNaW51dGU7XHJcbiAgICBmb3JtYXRCbG9ja3NbJ20nXSA9IE1pbnV0ZTtcclxuICAgIGZvcm1hdEJsb2Nrc1snc3MnXSA9IFBhZGRlZFNlY29uZDtcclxuICAgIGZvcm1hdEJsb2Nrc1sncyddID0gU2Vjb25kO1xyXG4gICAgXHJcbiAgICByZXR1cm4gZm9ybWF0QmxvY2tzO1xyXG59KSgpO1xyXG5cclxuXHJcbiIsImNsYXNzIElucHV0IHtcclxuICAgIHByaXZhdGUgb3B0aW9uczogSU9wdGlvbnM7XHJcbiAgICBwcml2YXRlIHNlbGVjdGVkRGF0ZVBhcnQ6IElEYXRlUGFydDtcclxuICAgIHByaXZhdGUgdGV4dEJ1ZmZlcjogc3RyaW5nID0gXCJcIjtcclxuICAgIHB1YmxpYyBkYXRlUGFydHM6IElEYXRlUGFydFtdO1xyXG4gICAgcHVibGljIGZvcm1hdDogUmVnRXhwO1xyXG4gICAgcHJpdmF0ZSBkYXRlOkRhdGU7XHJcbiAgICBwcml2YXRlIGxldmVsOkxldmVsO1xyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZWxlbWVudDogSFRNTElucHV0RWxlbWVudCkge1xyXG4gICAgICAgIG5ldyBLZXlib2FyZEV2ZW50SGFuZGxlcih0aGlzKTtcclxuICAgICAgICBuZXcgTW91c2VFdmVudEhhbmRsZXIodGhpcyk7XHJcbiAgICAgICAgbmV3IFBhc3RlRXZlbnRIYW5kZXIodGhpcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGlzdGVuLnZpZXdjaGFuZ2VkKGVsZW1lbnQsIChlKSA9PiB0aGlzLnZpZXdjaGFuZ2VkKGUuZGF0ZSwgZS5sZXZlbCwgZS51cGRhdGUpKTtcclxuICAgICAgICBsaXN0ZW4uYmx1cihlbGVtZW50LCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuYmx1ckRhdGVQYXJ0KHRoaXMuc2VsZWN0ZWREYXRlUGFydCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRMZXZlbHMoKTpMZXZlbFtdIHtcclxuICAgICAgICBsZXQgbGV2ZWxzOkxldmVsW10gPSBbXTtcclxuICAgICAgICB0aGlzLmRhdGVQYXJ0cy5mb3JFYWNoKChkYXRlUGFydCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAobGV2ZWxzLmluZGV4T2YoZGF0ZVBhcnQuZ2V0TGV2ZWwoKSkgPT09IC0xICYmIGRhdGVQYXJ0LmlzU2VsZWN0YWJsZSgpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXZlbHMucHVzaChkYXRlUGFydC5nZXRMZXZlbCgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBsZXZlbHM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRUZXh0QnVmZmVyKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRleHRCdWZmZXI7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBzZXRUZXh0QnVmZmVyKG5ld0J1ZmZlcjpzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLnRleHRCdWZmZXIgPSBuZXdCdWZmZXI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMudGV4dEJ1ZmZlci5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRGF0ZUZyb21CdWZmZXIoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB1cGRhdGVEYXRlRnJvbUJ1ZmZlcigpIHtcclxuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZERhdGVQYXJ0LnNldFZhbHVlRnJvbVBhcnRpYWwodGhpcy50ZXh0QnVmZmVyKSkge1xyXG4gICAgICAgICAgICBsZXQgbmV3RGF0ZSA9IHRoaXMuc2VsZWN0ZWREYXRlUGFydC5nZXRWYWx1ZSgpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKHRoaXMudGV4dEJ1ZmZlci5sZW5ndGggPj0gdGhpcy5zZWxlY3RlZERhdGVQYXJ0LmdldE1heEJ1ZmZlcigpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRleHRCdWZmZXIgPSAnJztcclxuICAgICAgICAgICAgICAgIHRoaXMuYmx1ckRhdGVQYXJ0KHRoaXMuc2VsZWN0ZWREYXRlUGFydCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQgPSB0aGlzLmdldE5leHRTZWxlY3RhYmxlRGF0ZVBhcnQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdHJpZ2dlci5nb3RvKHRoaXMuZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgZGF0ZTogbmV3RGF0ZSxcclxuICAgICAgICAgICAgICAgIGxldmVsOiB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQuZ2V0TGV2ZWwoKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnRleHRCdWZmZXIgPSB0aGlzLnRleHRCdWZmZXIuc2xpY2UoMCwgLTEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldEZpcnN0U2VsZWN0YWJsZURhdGVQYXJ0KCkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5kYXRlUGFydHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZGF0ZVBhcnRzW2ldLmlzU2VsZWN0YWJsZSgpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZVBhcnRzW2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdm9pZCAwO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRMYXN0U2VsZWN0YWJsZURhdGVQYXJ0KCkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSB0aGlzLmRhdGVQYXJ0cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kYXRlUGFydHNbaV0uaXNTZWxlY3RhYmxlKCkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlUGFydHNbaV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2b2lkIDA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXROZXh0U2VsZWN0YWJsZURhdGVQYXJ0KCkge1xyXG4gICAgICAgIGxldCBpID0gdGhpcy5kYXRlUGFydHMuaW5kZXhPZih0aGlzLnNlbGVjdGVkRGF0ZVBhcnQpO1xyXG4gICAgICAgIHdoaWxlICgrK2kgPCB0aGlzLmRhdGVQYXJ0cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZGF0ZVBhcnRzW2ldLmlzU2VsZWN0YWJsZSgpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZVBhcnRzW2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZERhdGVQYXJ0O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0UHJldmlvdXNTZWxlY3RhYmxlRGF0ZVBhcnQoKSB7XHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLmRhdGVQYXJ0cy5pbmRleE9mKHRoaXMuc2VsZWN0ZWREYXRlUGFydCk7XHJcbiAgICAgICAgd2hpbGUgKC0taSA+PSAwKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGVQYXJ0c1tpXS5pc1NlbGVjdGFibGUoKSlcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGVQYXJ0c1tpXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWREYXRlUGFydDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldE5lYXJlc3RTZWxlY3RhYmxlRGF0ZVBhcnQoY2FyZXRQb3NpdGlvbjogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IGRpc3RhbmNlOm51bWJlciA9IE51bWJlci5NQVhfVkFMVUU7XHJcbiAgICAgICAgbGV0IG5lYXJlc3REYXRlUGFydDpJRGF0ZVBhcnQ7XHJcbiAgICAgICAgbGV0IHN0YXJ0ID0gMDtcclxuICAgICAgICBcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZGF0ZVBhcnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRlUGFydCA9IHRoaXMuZGF0ZVBhcnRzW2ldO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKGRhdGVQYXJ0LmlzU2VsZWN0YWJsZSgpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZnJvbUxlZnQgPSBjYXJldFBvc2l0aW9uIC0gc3RhcnQ7XHJcbiAgICAgICAgICAgICAgICBsZXQgZnJvbVJpZ2h0ID0gY2FyZXRQb3NpdGlvbiAtIChzdGFydCArIGRhdGVQYXJ0LnRvU3RyaW5nKCkubGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgaWYgKGZyb21MZWZ0ID4gMCAmJiBmcm9tUmlnaHQgPCAwKSByZXR1cm4gZGF0ZVBhcnQ7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGxldCBkID0gTWF0aC5taW4oTWF0aC5hYnMoZnJvbUxlZnQpLCBNYXRoLmFicyhmcm9tUmlnaHQpKTtcclxuICAgICAgICAgICAgICAgIGlmIChkIDw9IGRpc3RhbmNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmVhcmVzdERhdGVQYXJ0ID0gZGF0ZVBhcnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2UgPSBkO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBzdGFydCArPSBkYXRlUGFydC50b1N0cmluZygpLmxlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIG5lYXJlc3REYXRlUGFydDsgICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgc2V0U2VsZWN0ZWREYXRlUGFydChkYXRlUGFydDpJRGF0ZVBhcnQpIHtcclxuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZERhdGVQYXJ0ICE9PSBkYXRlUGFydCkge1xyXG4gICAgICAgICAgICB0aGlzLnRleHRCdWZmZXIgPSAnJztcclxuICAgICAgICAgICAgbGV0IGxhc3RTZWxlY3RlZCA9IHRoaXMuc2VsZWN0ZWREYXRlUGFydDtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZERhdGVQYXJ0ID0gZGF0ZVBhcnQ7XHJcbiAgICAgICAgICAgIHRoaXMuYmx1ckRhdGVQYXJ0KGxhc3RTZWxlY3RlZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgYmx1ckRhdGVQYXJ0KGRhdGVQYXJ0OklEYXRlUGFydCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdibHVyJyk7XHJcbiAgICAgICAgLypcclxuICAgICAgICBpZiAoZGF0ZVBhcnQgPT09IHZvaWQgMCkgcmV0dXJuO1xyXG4gICAgICAgIGxldCBsYXN0RGF0ZSA9IGRhdGVQYXJ0LmdldExhc3RWYWx1ZSgpIHx8IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgbGV0IG5ld0RhdGUgPSBkYXRlUGFydC5nZXRWYWx1ZSgpO1xyXG4gICAgICAgIGxldCB0cmFuc2Zvcm1lZERhdGUgPSBuZXcgRGF0ZShuZXdEYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgc3dpdGNoKGRhdGVQYXJ0LmdldExldmVsKCkpIHtcclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5ZRUFSOlxyXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtZWREYXRlID0gdGhpcy5vcHRpb25zLmlzWWVhclNlbGVjdGFibGUobmV3RGF0ZSwgbGFzdERhdGUpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuTU9OVEg6XHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1lZERhdGUgPSB0aGlzLm9wdGlvbnMuaXNNb250aFNlbGVjdGFibGUobmV3RGF0ZSwgbGFzdERhdGUpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuREFURTpcclxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybWVkRGF0ZSA9IHRoaXMub3B0aW9ucy5pc0RhdGVTZWxlY3RhYmxlKG5ld0RhdGUsIGxhc3REYXRlKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLkhPVVI6XHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1lZERhdGUgPSB0aGlzLm9wdGlvbnMuaXNIb3VyU2VsZWN0YWJsZShuZXdEYXRlLCBsYXN0RGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5NSU5VVEU6XHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1lZERhdGUgPSB0aGlzLm9wdGlvbnMuaXNNaW51dGVTZWxlY3RhYmxlKG5ld0RhdGUsIGxhc3REYXRlKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLlNFQ09ORDpcclxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybWVkRGF0ZSA9IHRoaXMub3B0aW9ucy5pc1NlY29uZFNlbGVjdGFibGUobmV3RGF0ZSwgbGFzdERhdGUpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChuZXdEYXRlLnZhbHVlT2YoKSAhPT0gdHJhbnNmb3JtZWREYXRlLnZhbHVlT2YoKSkge1xyXG4gICAgICAgICAgICB0cmlnZ2VyLmdvdG8odGhpcy5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgICAgICBsZXZlbDogdGhpcy5zZWxlY3RlZERhdGVQYXJ0LmdldExldmVsKCksXHJcbiAgICAgICAgICAgICAgICBkYXRlOiB0cmFuc2Zvcm1lZERhdGVcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICovXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRTZWxlY3RlZERhdGVQYXJ0KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQ7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB1cGRhdGVPcHRpb25zKG9wdGlvbnM6SU9wdGlvbnMpIHtcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuZGF0ZVBhcnRzID0gUGFyc2VyLnBhcnNlKG9wdGlvbnMpO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWREYXRlUGFydCA9IHZvaWQgMDtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgZm9ybWF0OnN0cmluZyA9ICdeJztcclxuICAgICAgICB0aGlzLmRhdGVQYXJ0cy5mb3JFYWNoKChkYXRlUGFydCkgPT4ge1xyXG4gICAgICAgICAgICBmb3JtYXQgKz0gYCgke2RhdGVQYXJ0LmdldFJlZ0V4KCkuc291cmNlLnNsaWNlKDEsLTEpfSlgO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuZm9ybWF0ID0gbmV3IFJlZ0V4cChmb3JtYXQrJyQnLCAnaScpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgdGhpcy52aWV3Y2hhbmdlZCh0aGlzLmRhdGUsIHRoaXMubGV2ZWwsIHRydWUpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdXBkYXRlVmlldygpIHtcclxuICAgICAgICBsZXQgZGF0ZVN0cmluZyA9ICcnO1xyXG4gICAgICAgIHRoaXMuZGF0ZVBhcnRzLmZvckVhY2goKGRhdGVQYXJ0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChkYXRlUGFydC5nZXRWYWx1ZSgpID09PSB2b2lkIDApIHJldHVybjtcclxuICAgICAgICAgICAgZGF0ZVN0cmluZyArPSBkYXRlUGFydC50b1N0cmluZygpOyBcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQudmFsdWUgPSBkYXRlU3RyaW5nO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkRGF0ZVBhcnQgPT09IHZvaWQgMCkgcmV0dXJuO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBzdGFydCA9IDA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGkgPSAwO1xyXG4gICAgICAgIHdoaWxlICh0aGlzLmRhdGVQYXJ0c1tpXSAhPT0gdGhpcy5zZWxlY3RlZERhdGVQYXJ0KSB7XHJcbiAgICAgICAgICAgIHN0YXJ0ICs9IHRoaXMuZGF0ZVBhcnRzW2krK10udG9TdHJpbmcoKS5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBlbmQgPSBzdGFydCArIHRoaXMuc2VsZWN0ZWREYXRlUGFydC50b1N0cmluZygpLmxlbmd0aDtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc2V0U2VsZWN0aW9uUmFuZ2Uoc3RhcnQsIGVuZCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB2aWV3Y2hhbmdlZChkYXRlOkRhdGUsIGxldmVsOkxldmVsLCB1cGRhdGU/OmJvb2xlYW4pIHsgXHJcbiAgICAgICAgdGhpcy5kYXRlID0gZGF0ZTtcclxuICAgICAgICB0aGlzLmxldmVsID0gbGV2ZWw7ICAgICAgIFxyXG4gICAgICAgIHRoaXMuZGF0ZVBhcnRzLmZvckVhY2goKGRhdGVQYXJ0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh1cGRhdGUpIGRhdGVQYXJ0LnNldFZhbHVlKGRhdGUpO1xyXG4gICAgICAgICAgICBpZiAoZGF0ZVBhcnQuaXNTZWxlY3RhYmxlKCkgJiZcclxuICAgICAgICAgICAgICAgIGRhdGVQYXJ0LmdldExldmVsKCkgPT09IGxldmVsICYmXHJcbiAgICAgICAgICAgICAgICB0aGlzLmdldFNlbGVjdGVkRGF0ZVBhcnQoKSAhPT0gdm9pZCAwICYmXHJcbiAgICAgICAgICAgICAgICBsZXZlbCAhPT0gdGhpcy5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0TGV2ZWwoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTZWxlY3RlZERhdGVQYXJ0KGRhdGVQYXJ0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdHJpZ2dlclZpZXdDaGFuZ2UoKSB7XHJcbiAgICAgICAgdHJpZ2dlci52aWV3Y2hhbmdlZCh0aGlzLmVsZW1lbnQsIHtcclxuICAgICAgICAgICAgZGF0ZTogdGhpcy5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0VmFsdWUoKSxcclxuICAgICAgICAgICAgbGV2ZWw6IHRoaXMuZ2V0U2VsZWN0ZWREYXRlUGFydCgpLmdldExldmVsKClcclxuICAgICAgICB9KTsgICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbn0iLCJjb25zdCBlbnVtIEtFWSB7XHJcbiAgICBSSUdIVCA9IDM5LCBMRUZUID0gMzcsIFRBQiA9IDksIFVQID0gMzgsXHJcbiAgICBET1dOID0gNDAsIFYgPSA4NiwgQyA9IDY3LCBBID0gNjUsIEhPTUUgPSAzNixcclxuICAgIEVORCA9IDM1LCBCQUNLU1BBQ0UgPSA4XHJcbn1cclxuXHJcbmNsYXNzIEtleWJvYXJkRXZlbnRIYW5kbGVyIHtcclxuICAgIHByaXZhdGUgc2hpZnRUYWJEb3duID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIHRhYkRvd24gPSBmYWxzZTtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBpbnB1dDpJbnB1dCkge1xyXG4gICAgICAgIGlucHV0LmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgKGUpID0+IHRoaXMua2V5ZG93bihlKSk7XHJcbiAgICAgICAgaW5wdXQuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiZm9jdXNcIiwgKCkgPT4gdGhpcy5mb2N1cygpKTtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoZSkgPT4gdGhpcy5kb2N1bWVudEtleWRvd24oZSkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZm9jdXMgPSAoKTp2b2lkID0+IHtcclxuICAgICAgICBpZiAodGhpcy50YWJEb3duKSB7XHJcbiAgICAgICAgICAgIGxldCBmaXJzdCA9IHRoaXMuaW5wdXQuZ2V0Rmlyc3RTZWxlY3RhYmxlRGF0ZVBhcnQoKTtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC5zZXRTZWxlY3RlZERhdGVQYXJ0KGZpcnN0KTtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgIHRoaXMuaW5wdXQudHJpZ2dlclZpZXdDaGFuZ2UoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnNoaWZ0VGFiRG93bikge1xyXG4gICAgICAgICAgICBsZXQgbGFzdCA9IHRoaXMuaW5wdXQuZ2V0TGFzdFNlbGVjdGFibGVEYXRlUGFydCgpO1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQobGFzdCk7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICB0aGlzLmlucHV0LnRyaWdnZXJWaWV3Q2hhbmdlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBkb2N1bWVudEtleWRvd24oZTpLZXlib2FyZEV2ZW50KSB7XHJcbiAgICAgICAgaWYgKGUuc2hpZnRLZXkgJiYgZS5rZXlDb2RlID09PSBLRVkuVEFCKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hpZnRUYWJEb3duID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2UgaWYgKGUua2V5Q29kZSA9PT0gS0VZLlRBQikge1xyXG4gICAgICAgICAgICB0aGlzLnRhYkRvd24gPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zaGlmdFRhYkRvd24gPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy50YWJEb3duID0gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUga2V5ZG93bihlOktleWJvYXJkRXZlbnQpIHtcclxuICAgICAgICBsZXQgY29kZSA9IGUua2V5Q29kZTtcclxuICAgICAgICBpZiAoY29kZSA+PSA5NiAmJiBjb2RlIDw9IDEwNSkge1xyXG4gICAgICAgICAgICBjb2RlIC09IDQ4O1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICBpZiAoKGNvZGUgPT09IEtFWS5IT01FIHx8IGNvZGUgPT09IEtFWS5FTkQpICYmIGUuc2hpZnRLZXkpIHJldHVybjtcclxuICAgICAgICBpZiAoKGNvZGUgPT09IEtFWS5MRUZUIHx8IGNvZGUgPT09IEtFWS5SSUdIVCkgJiYgZS5zaGlmdEtleSkgcmV0dXJuO1xyXG4gICAgICAgIGlmICgoY29kZSA9PT0gS0VZLkMgfHwgY29kZSA9PT0gS0VZLkEgfHwgY29kZSA9PT0gS0VZLlYpICYmIGUuY3RybEtleSkgcmV0dXJuO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBwcmV2ZW50RGVmYXVsdCA9IHRydWU7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKGNvZGUgPT09IEtFWS5IT01FKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaG9tZSgpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gS0VZLkVORCkge1xyXG4gICAgICAgICAgICB0aGlzLmVuZCgpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gS0VZLkxFRlQpIHtcclxuICAgICAgICAgICAgdGhpcy5sZWZ0KCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb2RlID09PSBLRVkuUklHSFQpIHtcclxuICAgICAgICAgICAgdGhpcy5yaWdodCgpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gS0VZLlRBQiAmJiBlLnNoaWZ0S2V5KSB7XHJcbiAgICAgICAgICAgIHByZXZlbnREZWZhdWx0ID0gdGhpcy5zaGlmdFRhYigpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gS0VZLlRBQikge1xyXG4gICAgICAgICAgICBwcmV2ZW50RGVmYXVsdCA9IHRoaXMudGFiKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb2RlID09PSBLRVkuVVApIHtcclxuICAgICAgICAgICAgdGhpcy51cCgpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gS0VZLkRPV04pIHtcclxuICAgICAgICAgICAgdGhpcy5kb3duKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChwcmV2ZW50RGVmYXVsdCkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBrZXlQcmVzc2VkID0gU3RyaW5nLmZyb21DaGFyQ29kZShjb2RlKTtcclxuICAgICAgICBpZiAoL15bMC05XXxbQS16XSQvLnRlc3Qoa2V5UHJlc3NlZCkpIHtcclxuICAgICAgICAgICAgbGV0IHRleHRCdWZmZXIgPSB0aGlzLmlucHV0LmdldFRleHRCdWZmZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC5zZXRUZXh0QnVmZmVyKHRleHRCdWZmZXIgKyBrZXlQcmVzc2VkKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IEtFWS5CQUNLU1BBQ0UpIHtcclxuICAgICAgICAgICAgbGV0IHRleHRCdWZmZXIgPSB0aGlzLmlucHV0LmdldFRleHRCdWZmZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC5zZXRUZXh0QnVmZmVyKHRleHRCdWZmZXIuc2xpY2UoMCwgLTEpKTtcclxuICAgICAgICB9IGVsc2UgaWYgKCFlLnNoaWZ0S2V5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXQuc2V0VGV4dEJ1ZmZlcignJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGhvbWUoKSB7XHJcbiAgICAgICAgbGV0IGZpcnN0ID0gdGhpcy5pbnB1dC5nZXRGaXJzdFNlbGVjdGFibGVEYXRlUGFydCgpO1xyXG4gICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChmaXJzdCk7XHJcbiAgICAgICAgdGhpcy5pbnB1dC50cmlnZ2VyVmlld0NoYW5nZSgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGVuZCgpIHtcclxuICAgICAgICBsZXQgbGFzdCA9IHRoaXMuaW5wdXQuZ2V0TGFzdFNlbGVjdGFibGVEYXRlUGFydCgpO1xyXG4gICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChsYXN0KTsgICAgIFxyXG4gICAgICAgIHRoaXMuaW5wdXQudHJpZ2dlclZpZXdDaGFuZ2UoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBsZWZ0KCkge1xyXG4gICAgICAgIGxldCBwcmV2aW91cyA9IHRoaXMuaW5wdXQuZ2V0UHJldmlvdXNTZWxlY3RhYmxlRGF0ZVBhcnQoKTtcclxuICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQocHJldmlvdXMpO1xyXG4gICAgICAgIHRoaXMuaW5wdXQudHJpZ2dlclZpZXdDaGFuZ2UoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSByaWdodCgpIHtcclxuICAgICAgICBsZXQgbmV4dCA9IHRoaXMuaW5wdXQuZ2V0TmV4dFNlbGVjdGFibGVEYXRlUGFydCgpO1xyXG4gICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChuZXh0KTtcclxuICAgICAgICB0aGlzLmlucHV0LnRyaWdnZXJWaWV3Q2hhbmdlKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgc2hpZnRUYWIoKSB7XHJcbiAgICAgICAgbGV0IHByZXZpb3VzID0gdGhpcy5pbnB1dC5nZXRQcmV2aW91c1NlbGVjdGFibGVEYXRlUGFydCgpO1xyXG4gICAgICAgIGlmIChwcmV2aW91cyAhPT0gdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkpIHtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC5zZXRTZWxlY3RlZERhdGVQYXJ0KHByZXZpb3VzKTtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC50cmlnZ2VyVmlld0NoYW5nZSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHRhYigpIHtcclxuICAgICAgICBsZXQgbmV4dCA9IHRoaXMuaW5wdXQuZ2V0TmV4dFNlbGVjdGFibGVEYXRlUGFydCgpO1xyXG4gICAgICAgIGlmIChuZXh0ICE9PSB0aGlzLmlucHV0LmdldFNlbGVjdGVkRGF0ZVBhcnQoKSkge1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQobmV4dCk7XHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXQudHJpZ2dlclZpZXdDaGFuZ2UoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSB1cCgpIHtcclxuICAgICAgICB0aGlzLmlucHV0LmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5pbmNyZW1lbnQoKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgbGV2ZWwgPSB0aGlzLmlucHV0LmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5nZXRMZXZlbCgpO1xyXG4gICAgICAgIGxldCBkYXRlID0gdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0VmFsdWUoKTtcclxuICAgICAgICBcclxuICAgICAgICB0cmlnZ2VyLmdvdG8odGhpcy5pbnB1dC5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgIGRhdGU6IGRhdGUsXHJcbiAgICAgICAgICAgIGxldmVsOiBsZXZlbFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGRvd24oKSB7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZGVjcmVtZW50KCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGxldmVsID0gdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0TGV2ZWwoKTtcclxuICAgICAgICBsZXQgZGF0ZSA9IHRoaXMuaW5wdXQuZ2V0U2VsZWN0ZWREYXRlUGFydCgpLmdldFZhbHVlKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdHJpZ2dlci5nb3RvKHRoaXMuaW5wdXQuZWxlbWVudCwge1xyXG4gICAgICAgICAgICBkYXRlOiBkYXRlLFxyXG4gICAgICAgICAgICBsZXZlbDogbGV2ZWxcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsImNsYXNzIE1vdXNlRXZlbnRIYW5kbGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgaW5wdXQ6SW5wdXQpIHtcclxuICAgICAgICBsaXN0ZW4ubW91c2Vkb3duKGlucHV0LmVsZW1lbnQsICgpID0+IHRoaXMubW91c2Vkb3duKCkpO1xyXG4gICAgICAgIGxpc3Rlbi5tb3VzZXVwKGRvY3VtZW50LCAoKSA9PiB0aGlzLm1vdXNldXAoKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gU3RvcCBkZWZhdWx0XHJcbiAgICAgICAgaW5wdXQuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ2VudGVyXCIsIChlKSA9PiBlLnByZXZlbnREZWZhdWx0KCkpO1xyXG4gICAgICAgIGlucHV0LmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdvdmVyXCIsIChlKSA9PiBlLnByZXZlbnREZWZhdWx0KCkpO1xyXG4gICAgICAgIGlucHV0LmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImRyb3BcIiwgKGUpID0+IGUucHJldmVudERlZmF1bHQoKSk7XHJcbiAgICAgICAgaW5wdXQuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY3V0XCIsIChlKSA9PiBlLnByZXZlbnREZWZhdWx0KCkpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGRvd246Ym9vbGVhbjtcclxuICAgIHByaXZhdGUgY2FyZXRTdGFydDpudW1iZXI7XHJcbiAgICBcclxuICAgIHByaXZhdGUgbW91c2Vkb3duKCkge1xyXG4gICAgICAgIHRoaXMuZG93biA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5lbGVtZW50LnNldFNlbGVjdGlvblJhbmdlKHZvaWQgMCwgdm9pZCAwKTtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICB0aGlzLmNhcmV0U3RhcnQgPSB0aGlzLmlucHV0LmVsZW1lbnQuc2VsZWN0aW9uU3RhcnQ7IFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIG1vdXNldXAgPSAoKSA9PiB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmRvd24pIHJldHVybjtcclxuICAgICAgICB0aGlzLmRvd24gPSBmYWxzZTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgcG9zOm51bWJlcjtcclxuICAgICAgICBcclxuICAgICAgICBpZiAodGhpcy5pbnB1dC5lbGVtZW50LnNlbGVjdGlvblN0YXJ0ID09PSB0aGlzLmNhcmV0U3RhcnQpIHtcclxuICAgICAgICAgICAgcG9zID0gdGhpcy5pbnB1dC5lbGVtZW50LnNlbGVjdGlvbkVuZDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwb3MgPSB0aGlzLmlucHV0LmVsZW1lbnQuc2VsZWN0aW9uU3RhcnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBibG9jayA9IHRoaXMuaW5wdXQuZ2V0TmVhcmVzdFNlbGVjdGFibGVEYXRlUGFydChwb3MpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChibG9jayk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMuaW5wdXQuZWxlbWVudC5zZWxlY3Rpb25TdGFydCA+IDAgfHwgdGhpcy5pbnB1dC5lbGVtZW50LnNlbGVjdGlvbkVuZCA8IHRoaXMuaW5wdXQuZWxlbWVudC52YWx1ZS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC50cmlnZ2VyVmlld0NoYW5nZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn0iLCJjbGFzcyBQYXJzZXIge1xyXG4gICAgcHVibGljIHN0YXRpYyBwYXJzZShvcHRpb25zOklPcHRpb25zKTpJRGF0ZVBhcnRbXSB7XHJcbiAgICAgICAgbGV0IHRleHRCdWZmZXIgPSAnJztcclxuICAgICAgICBsZXQgZGF0ZVBhcnRzOklEYXRlUGFydFtdID0gW107XHJcbiAgICBcclxuICAgICAgICBsZXQgaW5kZXggPSAwOyAgICAgICAgICAgICAgICBcclxuICAgICAgICBsZXQgaW5Fc2NhcGVkU2VnbWVudCA9IGZhbHNlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBwdXNoUGxhaW5UZXh0ID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGV4dEJ1ZmZlci5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBkYXRlUGFydHMucHVzaChuZXcgUGxhaW5UZXh0KHRleHRCdWZmZXIpLnNldFNlbGVjdGFibGUoZmFsc2UpKTtcclxuICAgICAgICAgICAgICAgIHRleHRCdWZmZXIgPSAnJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB3aGlsZSAoaW5kZXggPCBvcHRpb25zLmRpc3BsYXlBcy5sZW5ndGgpIHsgICAgIFxyXG4gICAgICAgICAgICBpZiAoIWluRXNjYXBlZFNlZ21lbnQgJiYgb3B0aW9ucy5kaXNwbGF5QXNbaW5kZXhdID09PSAnWycpIHtcclxuICAgICAgICAgICAgICAgIGluRXNjYXBlZFNlZ21lbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgaW5kZXgrKztcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoaW5Fc2NhcGVkU2VnbWVudCAmJiBvcHRpb25zLmRpc3BsYXlBc1tpbmRleF0gPT09ICddJykge1xyXG4gICAgICAgICAgICAgICAgaW5Fc2NhcGVkU2VnbWVudCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaW5kZXgrKztcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoaW5Fc2NhcGVkU2VnbWVudCkge1xyXG4gICAgICAgICAgICAgICAgdGV4dEJ1ZmZlciArPSBvcHRpb25zLmRpc3BsYXlBc1tpbmRleF07XHJcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBmb3VuZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgZm9yIChsZXQgY29kZSBpbiBmb3JtYXRCbG9ja3MpIHtcclxuICAgICAgICAgICAgICAgIGlmIChQYXJzZXIuZmluZEF0KG9wdGlvbnMuZGlzcGxheUFzLCBpbmRleCwgYHske2NvZGV9fWApKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHVzaFBsYWluVGV4dCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGVQYXJ0cy5wdXNoKG5ldyBmb3JtYXRCbG9ja3NbY29kZV0ob3B0aW9ucykuc2V0U2VsZWN0YWJsZShmYWxzZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGluZGV4ICs9IGNvZGUubGVuZ3RoICsgMjtcclxuICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFBhcnNlci5maW5kQXQob3B0aW9ucy5kaXNwbGF5QXMsIGluZGV4LCBjb2RlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHB1c2hQbGFpblRleHQoKTtcclxuICAgICAgICAgICAgICAgICAgICBkYXRlUGFydHMucHVzaChuZXcgZm9ybWF0QmxvY2tzW2NvZGVdKG9wdGlvbnMpKTtcclxuICAgICAgICAgICAgICAgICAgICBpbmRleCArPSBjb2RlLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICghZm91bmQpIHtcclxuICAgICAgICAgICAgICAgIHRleHRCdWZmZXIgKz0gb3B0aW9ucy5kaXNwbGF5QXNbaW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgaW5kZXgrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVzaFBsYWluVGV4dCgpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIGRhdGVQYXJ0cztcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgZmluZEF0IChzdHI6c3RyaW5nLCBpbmRleDpudW1iZXIsIHNlYXJjaDpzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gc3RyLnNsaWNlKGluZGV4LCBpbmRleCArIHNlYXJjaC5sZW5ndGgpID09PSBzZWFyY2g7XHJcbiAgICB9XHJcbn0iLCJjbGFzcyBQYXN0ZUV2ZW50SGFuZGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgaW5wdXQ6SW5wdXQpIHtcclxuICAgICAgICBsaXN0ZW4ucGFzdGUoaW5wdXQuZWxlbWVudCwgKCkgPT4gdGhpcy5wYXN0ZSgpKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBwYXN0ZSgpIHtcclxuICAgICAgICAvL1RPRE8gZml4IHRoaXMgY2F1c2UgaXQncyBub3Qgd29ya2luZ1xyXG4gICAgICAgIGxldCBvcmlnaW5hbFZhbHVlID0gdGhpcy5pbnB1dC5lbGVtZW50LnZhbHVlO1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgIGlmICghdGhpcy5pbnB1dC5mb3JtYXQudGVzdCh0aGlzLmlucHV0LmVsZW1lbnQudmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgIHRoaXMuaW5wdXQuZWxlbWVudC52YWx1ZSA9IG9yaWdpbmFsVmFsdWU7XHJcbiAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICB9IFxyXG4gICAgICAgICAgIFxyXG4gICAgICAgICAgIGxldCBuZXdEYXRlID0gdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0VmFsdWUoKTtcclxuICAgICAgICAgICBcclxuICAgICAgICAgICBsZXQgc3RyUHJlZml4ID0gJyc7XHJcbiAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmlucHV0LmRhdGVQYXJ0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICBsZXQgZGF0ZVBhcnQgPSB0aGlzLmlucHV0LmRhdGVQYXJ0c1tpXTtcclxuICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgIGxldCByZWdFeHAgPSBuZXcgUmVnRXhwKGRhdGVQYXJ0LmdldFJlZ0V4KCkuc291cmNlLnNsaWNlKDEsIC0xKSwgJ2knKTtcclxuICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgIGxldCB2YWwgPSB0aGlzLmlucHV0LmVsZW1lbnQudmFsdWUucmVwbGFjZShzdHJQcmVmaXgsICcnKS5tYXRjaChyZWdFeHApWzBdO1xyXG4gICAgICAgICAgICAgICBzdHJQcmVmaXggKz0gdmFsO1xyXG4gICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgaWYgKCFkYXRlUGFydC5pc1NlbGVjdGFibGUoKSkgY29udGludWU7XHJcbiAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICBkYXRlUGFydC5zZXRWYWx1ZShuZXdEYXRlKTtcclxuICAgICAgICAgICAgICAgaWYgKGRhdGVQYXJ0LnNldFZhbHVlKHZhbCkpIHtcclxuICAgICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQuYmx1ckRhdGVQYXJ0KGRhdGVQYXJ0KTtcclxuICAgICAgICAgICAgICAgICAgIG5ld0RhdGUgPSBkYXRlUGFydC5nZXRWYWx1ZSgpO1xyXG4gICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgLy8gVE9ETyBzZXQgYWxsIGRhdGVwYXJ0cyBiYWNrIHRvIG9yaWdpbmFsIHZhbHVlXHJcbiAgICAgICAgICAgICAgICAgICB0aGlzLmlucHV0LmVsZW1lbnQudmFsdWUgPSBvcmlnaW5hbFZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgfVxyXG4gICAgICAgICAgIFxyXG4gICAgICAgICAgIHRyaWdnZXIuZ290byh0aGlzLmlucHV0LmVsZW1lbnQsIHtcclxuICAgICAgICAgICAgICAgZGF0ZTogbmV3RGF0ZSxcclxuICAgICAgICAgICAgICAgbGV2ZWw6IHRoaXMuaW5wdXQuZ2V0U2VsZWN0ZWREYXRlUGFydCgpLmdldExldmVsKClcclxuICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsImNvbnN0IGVudW0gU3RlcERpcmVjdGlvbiB7XHJcbiAgICBVUCwgRE9XTlxyXG59XHJcblxyXG5jbGFzcyBIZWFkZXIgZXh0ZW5kcyBDb21tb24ge1xyXG4gICAgcHJpdmF0ZSB5ZWFyTGFiZWw6RWxlbWVudDtcclxuICAgIHByaXZhdGUgbW9udGhMYWJlbDpFbGVtZW50O1xyXG4gICAgcHJpdmF0ZSBkYXRlTGFiZWw6RWxlbWVudDtcclxuICAgIHByaXZhdGUgaG91ckxhYmVsOkVsZW1lbnQ7XHJcbiAgICBwcml2YXRlIG1pbnV0ZUxhYmVsOkVsZW1lbnQ7XHJcbiAgICBwcml2YXRlIHNlY29uZExhYmVsOkVsZW1lbnQ7XHJcbiAgICBcclxuICAgIHByaXZhdGUgbGFiZWxzOkVsZW1lbnRbXTtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBvcHRpb25zOklPcHRpb25zO1xyXG4gICAgXHJcbiAgICBwcml2YXRlIGxldmVsOkxldmVsO1xyXG4gICAgcHJpdmF0ZSBkYXRlOkRhdGU7XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgZWxlbWVudDpIVE1MRWxlbWVudCwgcHJpdmF0ZSBjb250YWluZXI6SFRNTEVsZW1lbnQpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi52aWV3Y2hhbmdlZChlbGVtZW50LCAoZSkgPT4gdGhpcy52aWV3Y2hhbmdlZChlLmRhdGUsIGUubGV2ZWwpKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnllYXJMYWJlbCA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdkYXRpdW0tc3Bhbi1sYWJlbC5kYXRpdW0teWVhcicpO1xyXG4gICAgICAgIHRoaXMubW9udGhMYWJlbCA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdkYXRpdW0tc3Bhbi1sYWJlbC5kYXRpdW0tbW9udGgnKTtcclxuICAgICAgICB0aGlzLmRhdGVMYWJlbCA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdkYXRpdW0tc3Bhbi1sYWJlbC5kYXRpdW0tZGF0ZScpO1xyXG4gICAgICAgIHRoaXMuaG91ckxhYmVsID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS1ob3VyJyk7XHJcbiAgICAgICAgdGhpcy5taW51dGVMYWJlbCA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdkYXRpdW0tc3Bhbi1sYWJlbC5kYXRpdW0tbWludXRlJyk7XHJcbiAgICAgICAgdGhpcy5zZWNvbmRMYWJlbCA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdkYXRpdW0tc3Bhbi1sYWJlbC5kYXRpdW0tc2Vjb25kJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5sYWJlbHMgPSBbdGhpcy55ZWFyTGFiZWwsIHRoaXMubW9udGhMYWJlbCwgdGhpcy5kYXRlTGFiZWwsIHRoaXMuaG91ckxhYmVsLCB0aGlzLm1pbnV0ZUxhYmVsLCB0aGlzLnNlY29uZExhYmVsXTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgcHJldmlvdXNCdXR0b24gPSBjb250YWluZXIucXVlcnlTZWxlY3RvcignZGF0aXVtLXByZXYnKTtcclxuICAgICAgICBsZXQgbmV4dEJ1dHRvbiA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdkYXRpdW0tbmV4dCcpO1xyXG4gICAgICAgIGxldCBzcGFuTGFiZWxDb250YWluZXIgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcignZGF0aXVtLXNwYW4tbGFiZWwtY29udGFpbmVyJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGlzdGVuLnRhcChwcmV2aW91c0J1dHRvbiwgKCkgPT4gdGhpcy5wcmV2aW91cygpKTtcclxuICAgICAgICBsaXN0ZW4udGFwKG5leHRCdXR0b24sICgpID0+IHRoaXMubmV4dCgpKTtcclxuICAgICAgICBsaXN0ZW4udGFwKHNwYW5MYWJlbENvbnRhaW5lciwgKCkgPT4gdGhpcy56b29tT3V0KCkpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgcHJldmlvdXMoKSB7XHJcbiAgICAgICAgdHJpZ2dlci5nb3RvKHRoaXMuZWxlbWVudCwge1xyXG4gICAgICAgICAgIGRhdGU6IHRoaXMuc3RlcERhdGUoU3RlcERpcmVjdGlvbi5ET1dOKSxcclxuICAgICAgICAgICBsZXZlbDogdGhpcy5sZXZlbCxcclxuICAgICAgICAgICB1cGRhdGU6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBuZXh0KCkge1xyXG4gICAgICAgIHRyaWdnZXIuZ290byh0aGlzLmVsZW1lbnQsIHtcclxuICAgICAgICAgICBkYXRlOiB0aGlzLnN0ZXBEYXRlKFN0ZXBEaXJlY3Rpb24uVVApLFxyXG4gICAgICAgICAgIGxldmVsOiB0aGlzLmxldmVsLFxyXG4gICAgICAgICAgIHVwZGF0ZTogZmFsc2VcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSB6b29tT3V0KCkge1xyXG4gICAgICAgIHRyaWdnZXIuem9vbU91dCh0aGlzLmVsZW1lbnQsIHtcclxuICAgICAgICAgICAgZGF0ZTogdGhpcy5kYXRlLFxyXG4gICAgICAgICAgICBjdXJyZW50TGV2ZWw6IHRoaXMubGV2ZWwsXHJcbiAgICAgICAgICAgIHVwZGF0ZTogZmFsc2VcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBzdGVwRGF0ZShzdGVwVHlwZTpTdGVwRGlyZWN0aW9uKTpEYXRlIHtcclxuICAgICAgICBsZXQgZGF0ZSA9IG5ldyBEYXRlKHRoaXMuZGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgIGxldCBkaXJlY3Rpb24gPSBzdGVwVHlwZSA9PT0gU3RlcERpcmVjdGlvbi5VUCA/IDEgOiAtMTtcclxuICAgICAgICBcclxuICAgICAgICBzd2l0Y2ggKHRoaXMubGV2ZWwpIHtcclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5ZRUFSOlxyXG4gICAgICAgICAgICAgICAgZGF0ZS5zZXRGdWxsWWVhcihkYXRlLmdldEZ1bGxZZWFyKCkgKyAxMCAqIGRpcmVjdGlvbik7ICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5NT05USDpcclxuICAgICAgICAgICAgICAgIGRhdGUuc2V0RnVsbFllYXIoZGF0ZS5nZXRGdWxsWWVhcigpICsgZGlyZWN0aW9uKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLkRBVEU6XHJcbiAgICAgICAgICAgICAgICBkYXRlLnNldE1vbnRoKGRhdGUuZ2V0TW9udGgoKSArIGRpcmVjdGlvbik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5IT1VSOlxyXG4gICAgICAgICAgICAgICAgZGF0ZS5zZXREYXRlKGRhdGUuZ2V0RGF0ZSgpICsgZGlyZWN0aW9uKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLk1JTlVURTpcclxuICAgICAgICAgICAgICAgIGRhdGUuc2V0SG91cnMoZGF0ZS5nZXRIb3VycygpICsgZGlyZWN0aW9uKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLlNFQ09ORDpcclxuICAgICAgICAgICAgICAgIGRhdGUuc2V0TWludXRlcyhkYXRlLmdldE1pbnV0ZXMoKSArIGRpcmVjdGlvbik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIGRhdGU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgdmlld2NoYW5nZWQoZGF0ZTpEYXRlLCBsZXZlbDpMZXZlbCkge1xyXG4gICAgICAgIHRoaXMuZGF0ZSA9IGRhdGU7XHJcbiAgICAgICAgdGhpcy5sZXZlbCA9IGxldmVsO1xyXG4gICAgICAgIHRoaXMubGFiZWxzLmZvckVhY2goKGxhYmVsLCBsYWJlbExldmVsKSA9PiB7XHJcbiAgICAgICAgICAgIGxhYmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS10b3AnKTtcclxuICAgICAgICAgICAgbGFiZWwuY2xhc3NMaXN0LnJlbW92ZSgnZGF0aXVtLWJvdHRvbScpO1xyXG4gICAgICAgICAgICBsYWJlbC5jbGFzc0xpc3QucmVtb3ZlKCdkYXRpdW0taGlkZGVuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAobGFiZWxMZXZlbCA8IGxldmVsKSB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbC5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tdG9wJyk7XHJcbiAgICAgICAgICAgICAgICBsYWJlbC5pbm5lckhUTUwgPSB0aGlzLmdldEhlYWRlclRvcFRleHQoZGF0ZSwgbGFiZWxMZXZlbCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbC5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tYm90dG9tJyk7XHJcbiAgICAgICAgICAgICAgICBsYWJlbC5pbm5lckhUTUwgPSB0aGlzLmdldEhlYWRlckJvdHRvbVRleHQoZGF0ZSwgbGFiZWxMZXZlbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChsYWJlbExldmVsIDwgbGV2ZWwgLSAxIHx8IGxhYmVsTGV2ZWwgPiBsZXZlbCkge1xyXG4gICAgICAgICAgICAgICAgbGFiZWwuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLWhpZGRlbicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgZ2V0SGVhZGVyVG9wVGV4dChkYXRlOkRhdGUsIGxldmVsOkxldmVsKTpzdHJpbmcge1xyXG4gICAgICAgIHN3aXRjaChsZXZlbCkge1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLllFQVI6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXREZWNhZGUoZGF0ZSk7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuTU9OVEg6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0ZS5nZXRGdWxsWWVhcigpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuREFURTpcclxuICAgICAgICAgICAgICAgIHJldHVybiBgJHt0aGlzLmdldFNob3J0TW9udGhzKClbZGF0ZS5nZXRNb250aCgpXX0gJHtkYXRlLmdldEZ1bGxZZWFyKCl9YDtcclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5IT1VSOlxyXG4gICAgICAgICAgICBjYXNlIExldmVsLk1JTlVURTpcclxuICAgICAgICAgICAgICAgIHJldHVybiBgJHt0aGlzLmdldFNob3J0RGF5cygpW2RhdGUuZ2V0RGF5KCldfSAke3RoaXMucGFkKGRhdGUuZ2V0RGF0ZSgpKX0gJHt0aGlzLmdldFNob3J0TW9udGhzKClbZGF0ZS5nZXRNb250aCgpXX0gJHtkYXRlLmdldEZ1bGxZZWFyKCl9YDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgZ2V0SGVhZGVyQm90dG9tVGV4dChkYXRlOkRhdGUsIGxldmVsOkxldmVsKTpzdHJpbmcge1xyXG4gICAgICAgIHN3aXRjaChsZXZlbCkge1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLllFQVI6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXREZWNhZGUoZGF0ZSk7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuTU9OVEg6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0ZS5nZXRGdWxsWWVhcigpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuREFURTpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFNob3J0TW9udGhzKClbZGF0ZS5nZXRNb250aCgpXTtcclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5IT1VSOlxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5taWxpdGFyeVRpbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCR7dGhpcy5nZXRTaG9ydERheXMoKVtkYXRlLmdldERheSgpXX0gJHt0aGlzLnBhZChkYXRlLmdldERhdGUoKSl9IDxkYXRpdW0tdmFyaWFibGU+JHt0aGlzLnBhZChkYXRlLmdldEhvdXJzKCkpfTxkYXRpdW0tbG93ZXI+aHI8L2RhdGl1bS1sb3dlcj48L2RhdGl1bS12YXJpYWJsZT5gO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCR7dGhpcy5nZXRTaG9ydERheXMoKVtkYXRlLmdldERheSgpXX0gJHt0aGlzLnBhZChkYXRlLmdldERhdGUoKSl9IDxkYXRpdW0tdmFyaWFibGU+JHt0aGlzLmdldEhvdXJzKGRhdGUpfSR7dGhpcy5nZXRNZXJpZGllbShkYXRlKX08L2RhdGl1bS12YXJpYWJsZT5gOyAgICBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5NSU5VVEU6XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLm1pbGl0YXJ5VGltZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHt0aGlzLnBhZChkYXRlLmdldEhvdXJzKCkpfTo8ZGF0aXVtLXZhcmlhYmxlPiR7dGhpcy5wYWQoZGF0ZS5nZXRNaW51dGVzKCkpfTwvZGF0aXVtLXZhcmlhYmxlPmA7ICAgIFxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCR7dGhpcy5nZXRIb3VycyhkYXRlKX06PGRhdGl1bS12YXJpYWJsZT4ke3RoaXMucGFkKGRhdGUuZ2V0TWludXRlcygpKX08L2RhdGl1bS12YXJpYWJsZT4ke3RoaXMuZ2V0TWVyaWRpZW0oZGF0ZSl9YDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5TRUNPTkQ6XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLm1pbGl0YXJ5VGltZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHt0aGlzLnBhZChkYXRlLmdldEhvdXJzKCkpfToke3RoaXMucGFkKGRhdGUuZ2V0TWludXRlcygpKX06PGRhdGl1bS12YXJpYWJsZT4ke3RoaXMucGFkKGRhdGUuZ2V0U2Vjb25kcygpKX08L2RhdGl1bS12YXJpYWJsZT5gOyAgIFxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCR7dGhpcy5nZXRIb3VycyhkYXRlKX06JHt0aGlzLnBhZChkYXRlLmdldE1pbnV0ZXMoKSl9OjxkYXRpdW0tdmFyaWFibGU+JHt0aGlzLnBhZChkYXRlLmdldFNlY29uZHMoKSl9PC9kYXRpdW0tdmFyaWFibGU+JHt0aGlzLmdldE1lcmlkaWVtKGRhdGUpfWA7ICAgIFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHVwZGF0ZU9wdGlvbnMob3B0aW9uczpJT3B0aW9ucykge1xyXG4gICAgICAgIGxldCB1cGRhdGVWaWV3ID0gdGhpcy5vcHRpb25zICE9PSB2b2lkIDAgJiYgdGhpcy5vcHRpb25zLm1pbGl0YXJ5VGltZSAhPT0gb3B0aW9ucy5taWxpdGFyeVRpbWU7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuICAgICAgICBpZiAodXBkYXRlVmlldykge1xyXG4gICAgICAgICAgICB0aGlzLnZpZXdjaGFuZ2VkKHRoaXMuZGF0ZSwgdGhpcy5sZXZlbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiY29uc3QgZW51bSBUcmFuc2l0aW9uIHtcclxuICAgIFNMSURFX0xFRlQsXHJcbiAgICBTTElERV9SSUdIVCxcclxuICAgIFpPT01fSU4sXHJcbiAgICBaT09NX09VVFxyXG59XHJcblxyXG5jbGFzcyBQaWNrZXJNYW5hZ2VyIHtcclxuICAgIHByaXZhdGUgb3B0aW9uczpJT3B0aW9ucztcclxuICAgIHB1YmxpYyBjb250YWluZXI6SFRNTEVsZW1lbnQ7XHJcbiAgICBwdWJsaWMgaGVhZGVyOkhlYWRlcjtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSB5ZWFyUGlja2VyOklQaWNrZXI7XHJcbiAgICBwcml2YXRlIG1vbnRoUGlja2VyOklQaWNrZXI7XHJcbiAgICBwcml2YXRlIGRhdGVQaWNrZXI6SVBpY2tlcjtcclxuICAgIHByaXZhdGUgaG91clBpY2tlcjpJVGltZVBpY2tlcjtcclxuICAgIHByaXZhdGUgbWludXRlUGlja2VyOklUaW1lUGlja2VyO1xyXG4gICAgcHJpdmF0ZSBzZWNvbmRQaWNrZXI6SVRpbWVQaWNrZXI7XHJcbiAgICBcclxuICAgIHB1YmxpYyBjdXJyZW50UGlja2VyOklQaWNrZXI7XHJcbiAgICBcclxuICAgIHByaXZhdGUgcGlja2VyQ29udGFpbmVyOkhUTUxFbGVtZW50O1xyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVsZW1lbnQ6SFRNTElucHV0RWxlbWVudCkge1xyXG4gICAgICAgIHRoaXMuY29udGFpbmVyID0gdGhpcy5jcmVhdGVWaWV3KCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5pbnNlcnRBZnRlcihlbGVtZW50LCB0aGlzLmNvbnRhaW5lcik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5waWNrZXJDb250YWluZXIgPSA8SFRNTEVsZW1lbnQ+dGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcignZGF0aXVtLXBpY2tlci1jb250YWluZXInKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmhlYWRlciA9IG5ldyBIZWFkZXIoZWxlbWVudCwgdGhpcy5jb250YWluZXIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMueWVhclBpY2tlciA9IG5ldyBZZWFyUGlja2VyKGVsZW1lbnQsIHRoaXMuY29udGFpbmVyKTtcclxuICAgICAgICB0aGlzLm1vbnRoUGlja2VyID0gbmV3IE1vbnRoUGlja2VyKGVsZW1lbnQsIHRoaXMuY29udGFpbmVyKTtcclxuICAgICAgICB0aGlzLmRhdGVQaWNrZXIgPSBuZXcgRGF0ZVBpY2tlcihlbGVtZW50LCB0aGlzLmNvbnRhaW5lcik7XHJcbiAgICAgICAgdGhpcy5ob3VyUGlja2VyID0gbmV3IEhvdXJQaWNrZXIoZWxlbWVudCwgdGhpcy5jb250YWluZXIpO1xyXG4gICAgICAgIHRoaXMubWludXRlUGlja2VyID0gbmV3IE1pbnV0ZVBpY2tlcihlbGVtZW50LCB0aGlzLmNvbnRhaW5lcik7XHJcbiAgICAgICAgdGhpcy5zZWNvbmRQaWNrZXIgPSBuZXcgU2Vjb25kUGlja2VyKGVsZW1lbnQsIHRoaXMuY29udGFpbmVyKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi5kb3duKHRoaXMuY29udGFpbmVyLCAnKicsIChlKSA9PiB0aGlzLmFkZEFjdGl2ZUNsYXNzZXMoZSkpO1xyXG4gICAgICAgIGxpc3Rlbi51cChkb2N1bWVudCwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlQnViYmxlKCk7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQWN0aXZlQ2xhc3NlcygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi5tb3VzZWRvd24odGhpcy5jb250YWluZXIsIChlKSA9PiB7XHJcbiAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgcmV0dXJuIGZhbHNlOyBcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4udmlld2NoYW5nZWQoZWxlbWVudCwgKGUpID0+IHRoaXMudmlld2NoYW5nZWQoZS5kYXRlLCBlLmxldmVsLCBlLnVwZGF0ZSkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi5vcGVuQnViYmxlKGVsZW1lbnQsIChlKSA9PiB7XHJcbiAgICAgICAgICAgdGhpcy5vcGVuQnViYmxlKGUueCwgZS55LCBlLnRleHQpOyBcclxuICAgICAgICB9KTtcclxuICAgICAgICBsaXN0ZW4udXBkYXRlQnViYmxlKGVsZW1lbnQsIChlKSA9PiB7XHJcbiAgICAgICAgICAgdGhpcy51cGRhdGVCdWJibGUoZS54LCBlLnksIGUudGV4dCk7IFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi5zd2lwZUxlZnQodGhpcy5jb250YWluZXIsICgpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc2Vjb25kUGlja2VyLmlzRHJhZ2dpbmcoKSB8fFxyXG4gICAgICAgICAgICAgICAgdGhpcy5taW51dGVQaWNrZXIuaXNEcmFnZ2luZygpIHx8XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhvdXJQaWNrZXIuaXNEcmFnZ2luZygpKSByZXR1cm47XHJcbiAgICAgICAgICAgIHRoaXMuaGVhZGVyLm5leHQoKTsgXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGlzdGVuLnN3aXBlUmlnaHQodGhpcy5jb250YWluZXIsICgpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc2Vjb25kUGlja2VyLmlzRHJhZ2dpbmcoKSB8fFxyXG4gICAgICAgICAgICAgICAgdGhpcy5taW51dGVQaWNrZXIuaXNEcmFnZ2luZygpIHx8XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhvdXJQaWNrZXIuaXNEcmFnZ2luZygpKSByZXR1cm47XHJcbiAgICAgICAgICAgIHRoaXMuaGVhZGVyLnByZXZpb3VzKCk7IFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgY2xvc2VCdWJibGUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuYnViYmxlID09PSB2b2lkIDApIHJldHVybjtcclxuICAgICAgICB0aGlzLmJ1YmJsZS5jbGFzc0xpc3QucmVtb3ZlKCdkYXRpdW0tYnViYmxlLXZpc2libGUnKTtcclxuICAgICAgICBzZXRUaW1lb3V0KChidWJibGU6SFRNTEVsZW1lbnQpID0+IHtcclxuICAgICAgICAgICAgYnViYmxlLnJlbW92ZSgpO1xyXG4gICAgICAgIH0sIDIwMCwgdGhpcy5idWJibGUpO1xyXG4gICAgICAgIHRoaXMuYnViYmxlID0gdm9pZCAwO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGJ1YmJsZTpIVE1MRWxlbWVudDtcclxuICAgIFxyXG4gICAgcHVibGljIG9wZW5CdWJibGUoeDpudW1iZXIsIHk6bnVtYmVyLCB0ZXh0OnN0cmluZykge1xyXG4gICAgICAgIGlmICh0aGlzLmJ1YmJsZSAhPT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2VCdWJibGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5idWJibGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tYnViYmxlJyk7XHJcbiAgICAgICAgdGhpcy5jb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5idWJibGUpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlQnViYmxlKHgsIHksIHRleHQpO1xyXG4gICAgICAgIHNldFRpbWVvdXQoKGJ1YmJsZTpIVE1MRWxlbWVudCkgPT4ge1xyXG4gICAgICAgICAgIGJ1YmJsZS5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tYnViYmxlLXZpc2libGUnKTsgXHJcbiAgICAgICAgfSwgMCwgdGhpcy5idWJibGUpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdXBkYXRlQnViYmxlKHg6bnVtYmVyLCB5Om51bWJlciwgdGV4dDpzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmJ1YmJsZS5pbm5lckhUTUwgPSB0ZXh0O1xyXG4gICAgICAgIHRoaXMuYnViYmxlLnN0eWxlLnRvcCA9IHkgKyAncHgnO1xyXG4gICAgICAgIHRoaXMuYnViYmxlLnN0eWxlLmxlZnQgPSB4ICsgJ3B4JztcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSB2aWV3Y2hhbmdlZChkYXRlOkRhdGUsIGxldmVsOkxldmVsLCB1cGRhdGU6Ym9vbGVhbikge1xyXG4gICAgICAgIGlmIChsZXZlbCA9PT0gTGV2ZWwuTk9ORSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50UGlja2VyICE9PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFBpY2tlci5yZW1vdmUoVHJhbnNpdGlvbi5aT09NX09VVCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5hZGp1c3RIZWlnaHQoMTApO1xyXG4gICAgICAgICAgICBpZiAodXBkYXRlKSB0aGlzLnVwZGF0ZVNlbGVjdGVkRGF0ZShkYXRlKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBsZXQgdHJhbnNpdGlvbjpUcmFuc2l0aW9uO1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRQaWNrZXIgPT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQaWNrZXIgPSB0aGlzLmdldFBpY2tlcihsZXZlbCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBpY2tlci5jcmVhdGUoZGF0ZSwgVHJhbnNpdGlvbi5aT09NX0lOKTtcclxuICAgICAgICB9IGVsc2UgaWYgKCh0cmFuc2l0aW9uID0gdGhpcy5nZXRUcmFuc2l0aW9uKGRhdGUsIGxldmVsKSkgIT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQaWNrZXIucmVtb3ZlKHRyYW5zaXRpb24pO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQaWNrZXIgPSB0aGlzLmdldFBpY2tlcihsZXZlbCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBpY2tlci5jcmVhdGUoZGF0ZSwgdHJhbnNpdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh1cGRhdGUpIHRoaXMudXBkYXRlU2VsZWN0ZWREYXRlKGRhdGUpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuYWRqdXN0SGVpZ2h0KHRoaXMuY3VycmVudFBpY2tlci5nZXRIZWlnaHQoKSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgdXBkYXRlU2VsZWN0ZWREYXRlKGRhdGU6RGF0ZSkge1xyXG4gICAgICAgIHRoaXMueWVhclBpY2tlci5zZXRTZWxlY3RlZERhdGUoZGF0ZSk7XHJcbiAgICAgICAgdGhpcy5tb250aFBpY2tlci5zZXRTZWxlY3RlZERhdGUoZGF0ZSk7XHJcbiAgICAgICAgdGhpcy5kYXRlUGlja2VyLnNldFNlbGVjdGVkRGF0ZShkYXRlKTtcclxuICAgICAgICB0aGlzLmhvdXJQaWNrZXIuc2V0U2VsZWN0ZWREYXRlKGRhdGUpO1xyXG4gICAgICAgIHRoaXMubWludXRlUGlja2VyLnNldFNlbGVjdGVkRGF0ZShkYXRlKTtcclxuICAgICAgICB0aGlzLnNlY29uZFBpY2tlci5zZXRTZWxlY3RlZERhdGUoZGF0ZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgZ2V0VHJhbnNpdGlvbihkYXRlOkRhdGUsIGxldmVsOkxldmVsKTpUcmFuc2l0aW9uIHtcclxuICAgICAgICBpZiAobGV2ZWwgPiB0aGlzLmN1cnJlbnRQaWNrZXIuZ2V0TGV2ZWwoKSkgcmV0dXJuIFRyYW5zaXRpb24uWk9PTV9JTjtcclxuICAgICAgICBpZiAobGV2ZWwgPCB0aGlzLmN1cnJlbnRQaWNrZXIuZ2V0TGV2ZWwoKSkgcmV0dXJuIFRyYW5zaXRpb24uWk9PTV9PVVQ7XHJcbiAgICAgICAgaWYgKGRhdGUudmFsdWVPZigpIDwgdGhpcy5jdXJyZW50UGlja2VyLmdldE1pbigpLnZhbHVlT2YoKSkgcmV0dXJuIFRyYW5zaXRpb24uU0xJREVfTEVGVDtcclxuICAgICAgICBpZiAoZGF0ZS52YWx1ZU9mKCkgPiB0aGlzLmN1cnJlbnRQaWNrZXIuZ2V0TWF4KCkudmFsdWVPZigpKSByZXR1cm4gVHJhbnNpdGlvbi5TTElERV9SSUdIVDtcclxuICAgICAgICByZXR1cm4gdm9pZCAwO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGFkanVzdEhlaWdodChoZWlnaHQ6bnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5waWNrZXJDb250YWluZXIuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZVkoJHtoZWlnaHQgLSAyODB9cHgpYDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBnZXRQaWNrZXIobGV2ZWw6TGV2ZWwpOklQaWNrZXIge1xyXG4gICAgICAgIHJldHVybiBbdGhpcy55ZWFyUGlja2VyLHRoaXMubW9udGhQaWNrZXIsdGhpcy5kYXRlUGlja2VyLHRoaXMuaG91clBpY2tlcix0aGlzLm1pbnV0ZVBpY2tlcix0aGlzLnNlY29uZFBpY2tlcl1bbGV2ZWxdO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgcmVtb3ZlQWN0aXZlQ2xhc3NlcygpIHtcclxuICAgICAgICBsZXQgYWN0aXZlRWxlbWVudHMgPSB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCcuZGF0aXVtLWFjdGl2ZScpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWN0aXZlRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgYWN0aXZlRWxlbWVudHNbaV0uY2xhc3NMaXN0LnJlbW92ZSgnZGF0aXVtLWFjdGl2ZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdkYXRpdW0tYWN0aXZlJyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgYWRkQWN0aXZlQ2xhc3NlcyhlOk1vdXNlRXZlbnR8VG91Y2hFdmVudCkge1xyXG4gICAgICAgIGxldCBlbCA9IGUuc3JjRWxlbWVudCB8fCA8RWxlbWVudD5lLnRhcmdldDtcclxuICAgICAgICB3aGlsZSAoZWwgIT09IHRoaXMuY29udGFpbmVyKSB7XHJcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1hY3RpdmUnKTtcclxuICAgICAgICAgICAgZWwgPSBlbC5wYXJlbnRFbGVtZW50O1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tYWN0aXZlJyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB1cGRhdGVPcHRpb25zKG9wdGlvbnM6SU9wdGlvbnMpIHtcclxuICAgICAgICBsZXQgdGhlbWVVcGRhdGVkID0gdGhpcy5vcHRpb25zID09PSB2b2lkIDAgfHxcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnRoZW1lID09PSB2b2lkIDAgfHxcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnRoZW1lLnByaW1hcnkgIT09IG9wdGlvbnMudGhlbWUucHJpbWFyeSB8fFxyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMudGhlbWUucHJpbWFyeV90ZXh0ICE9PSBvcHRpb25zLnRoZW1lLnByaW1hcnlfdGV4dCB8fFxyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMudGhlbWUuc2Vjb25kYXJ5ICE9PSBvcHRpb25zLnRoZW1lLnNlY29uZGFyeSB8fFxyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMudGhlbWUuc2Vjb25kYXJ5X2FjY2VudCAhPT0gb3B0aW9ucy50aGVtZS5zZWNvbmRhcnlfYWNjZW50IHx8XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy50aGVtZS5zZWNvbmRhcnlfdGV4dCAhPT0gb3B0aW9ucy50aGVtZS5zZWNvbmRhcnlfdGV4dDtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGVtZVVwZGF0ZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5pbnNlcnRTdHlsZXMoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5oZWFkZXIudXBkYXRlT3B0aW9ucyhvcHRpb25zKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnllYXJQaWNrZXIudXBkYXRlT3B0aW9ucyhvcHRpb25zKTtcclxuICAgICAgICB0aGlzLm1vbnRoUGlja2VyLnVwZGF0ZU9wdGlvbnMob3B0aW9ucyk7XHJcbiAgICAgICAgdGhpcy5kYXRlUGlja2VyLnVwZGF0ZU9wdGlvbnMob3B0aW9ucyk7XHJcbiAgICAgICAgdGhpcy5ob3VyUGlja2VyLnVwZGF0ZU9wdGlvbnMob3B0aW9ucyk7XHJcbiAgICAgICAgdGhpcy5taW51dGVQaWNrZXIudXBkYXRlT3B0aW9ucyhvcHRpb25zKTtcclxuICAgICAgICB0aGlzLnNlY29uZFBpY2tlci51cGRhdGVPcHRpb25zKG9wdGlvbnMpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGNyZWF0ZVZpZXcoKTpIVE1MRWxlbWVudCB7XHJcbiAgICAgICAgbGV0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLWNvbnRhaW5lcicpO1xyXG4gICAgICAgIGVsLmlubmVySFRNTCA9IGhlYWRlciArIGBcclxuICAgICAgICA8ZGF0aXVtLXBpY2tlci1jb250YWluZXItd3JhcHBlcj5cclxuICAgICAgICAgICAgPGRhdGl1bS1waWNrZXItY29udGFpbmVyPjwvZGF0aXVtLXBpY2tlci1jb250YWluZXI+XHJcbiAgICAgICAgPC9kYXRpdW0tcGlja2VyLWNvbnRhaW5lci13cmFwcGVyPmA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIGVsO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGluc2VydEFmdGVyKG5vZGU6Tm9kZSwgbmV3Tm9kZTpOb2RlKTp2b2lkIHtcclxuICAgICAgICBub2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5ld05vZGUsIG5vZGUubmV4dFNpYmxpbmcpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdGF0aWMgc3R5bGVzSW5zZXJ0ZWQ6bnVtYmVyID0gMDtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBpbnNlcnRTdHlsZXMoKSB7XHJcbiAgICAgICAgbGV0IGhlYWQgPSBkb2N1bWVudC5oZWFkIHx8IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF07XHJcbiAgICAgICAgbGV0IHN0eWxlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHN0eWxlSWQgPSBcImRhdGl1bS1zdHlsZVwiICsgKFBpY2tlck1hbmFnZXIuc3R5bGVzSW5zZXJ0ZWQrKyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGV4aXN0aW5nU3R5bGVJZCA9IHRoaXMuZ2V0RXhpc3RpbmdTdHlsZUlkKCk7XHJcbiAgICAgICAgaWYgKGV4aXN0aW5nU3R5bGVJZCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKGV4aXN0aW5nU3R5bGVJZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoc3R5bGVJZCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHRyYW5zZm9ybWVkQ3NzID0gY3NzLnJlcGxhY2UoL19wcmltYXJ5X3RleHQvZywgdGhpcy5vcHRpb25zLnRoZW1lLnByaW1hcnlfdGV4dCk7XHJcbiAgICAgICAgdHJhbnNmb3JtZWRDc3MgPSB0cmFuc2Zvcm1lZENzcy5yZXBsYWNlKC9fcHJpbWFyeS9nLCB0aGlzLm9wdGlvbnMudGhlbWUucHJpbWFyeSk7XHJcbiAgICAgICAgdHJhbnNmb3JtZWRDc3MgPSB0cmFuc2Zvcm1lZENzcy5yZXBsYWNlKC9fc2Vjb25kYXJ5X3RleHQvZywgdGhpcy5vcHRpb25zLnRoZW1lLnNlY29uZGFyeV90ZXh0KTtcclxuICAgICAgICB0cmFuc2Zvcm1lZENzcyA9IHRyYW5zZm9ybWVkQ3NzLnJlcGxhY2UoL19zZWNvbmRhcnlfYWNjZW50L2csIHRoaXMub3B0aW9ucy50aGVtZS5zZWNvbmRhcnlfYWNjZW50KTtcclxuICAgICAgICB0cmFuc2Zvcm1lZENzcyA9IHRyYW5zZm9ybWVkQ3NzLnJlcGxhY2UoL19zZWNvbmRhcnkvZywgdGhpcy5vcHRpb25zLnRoZW1lLnNlY29uZGFyeSk7XHJcbiAgICAgICAgdHJhbnNmb3JtZWRDc3MgPSB0cmFuc2Zvcm1lZENzcy5yZXBsYWNlKC9faWQvZywgc3R5bGVJZCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgc3R5bGVFbGVtZW50LnR5cGUgPSAndGV4dC9jc3MnO1xyXG4gICAgICAgIGlmICgoPGFueT5zdHlsZUVsZW1lbnQpLnN0eWxlU2hlZXQpe1xyXG4gICAgICAgICAgICAoPGFueT5zdHlsZUVsZW1lbnQpLnN0eWxlU2hlZXQuY3NzVGV4dCA9IHRyYW5zZm9ybWVkQ3NzO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHN0eWxlRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0cmFuc2Zvcm1lZENzcykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaGVhZC5hcHBlbmRDaGlsZChzdHlsZUVsZW1lbnQpOyAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgZ2V0RXhpc3RpbmdTdHlsZUlkKCk6c3RyaW5nIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoL15kYXRpdW0tc3R5bGVcXGQrJC8udGVzdCh0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QuaXRlbShpKSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QuaXRlbShpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxufVxyXG4iLCJ2YXIgaGVhZGVyID0gXCI8ZGF0aXVtLWhlYWRlci13cmFwcGVyPiA8ZGF0aXVtLWhlYWRlcj4gPGRhdGl1bS1zcGFuLWxhYmVsLWNvbnRhaW5lcj4gPGRhdGl1bS1zcGFuLWxhYmVsIGNsYXNzPSdkYXRpdW0teWVhcic+PC9kYXRpdW0tc3Bhbi1sYWJlbD4gPGRhdGl1bS1zcGFuLWxhYmVsIGNsYXNzPSdkYXRpdW0tbW9udGgnPjwvZGF0aXVtLXNwYW4tbGFiZWw+IDxkYXRpdW0tc3Bhbi1sYWJlbCBjbGFzcz0nZGF0aXVtLWRhdGUnPjwvZGF0aXVtLXNwYW4tbGFiZWw+IDxkYXRpdW0tc3Bhbi1sYWJlbCBjbGFzcz0nZGF0aXVtLWhvdXInPjwvZGF0aXVtLXNwYW4tbGFiZWw+IDxkYXRpdW0tc3Bhbi1sYWJlbCBjbGFzcz0nZGF0aXVtLW1pbnV0ZSc+PC9kYXRpdW0tc3Bhbi1sYWJlbD4gPGRhdGl1bS1zcGFuLWxhYmVsIGNsYXNzPSdkYXRpdW0tc2Vjb25kJz48L2RhdGl1bS1zcGFuLWxhYmVsPiA8L2RhdGl1bS1zcGFuLWxhYmVsLWNvbnRhaW5lcj4gPGRhdGl1bS1wcmV2PjwvZGF0aXVtLXByZXY+IDxkYXRpdW0tbmV4dD48L2RhdGl1bS1uZXh0PiA8L2RhdGl1bS1oZWFkZXI+IDwvZGF0aXVtLWhlYWRlci13cmFwcGVyPlwiOyIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9jb21tb24vQ29tbW9uLnRzXCIgLz5cclxuY2xhc3MgUGlja2VyIGV4dGVuZHMgQ29tbW9uIHtcclxuICAgIHByb3RlY3RlZCBwaWNrZXJDb250YWluZXI6SFRNTEVsZW1lbnQ7XHJcbiAgICBwcm90ZWN0ZWQgbWluOkRhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgcHJvdGVjdGVkIG1heDpEYXRlID0gbmV3IERhdGUoKTtcclxuICAgIHByb3RlY3RlZCBwaWNrZXI6SFRNTEVsZW1lbnQ7XHJcbiAgICBwcm90ZWN0ZWQgc2VsZWN0ZWREYXRlOkRhdGU7XHJcbiAgICBwcm90ZWN0ZWQgb3B0aW9uczpJT3B0aW9ucztcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IocHJvdGVjdGVkIGVsZW1lbnQ6SFRNTEVsZW1lbnQsIHByb3RlY3RlZCBjb250YWluZXI6SFRNTEVsZW1lbnQpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMucGlja2VyQ29udGFpbmVyID0gPEhUTUxFbGVtZW50PmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdkYXRpdW0tcGlja2VyLWNvbnRhaW5lcicpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgY3JlYXRlKGRhdGU6RGF0ZSwgdHJhbnNpdGlvbjpUcmFuc2l0aW9uKSB7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyByZW1vdmUodHJhbnNpdGlvbjpUcmFuc2l0aW9uKSB7XHJcbiAgICAgICAgaWYgKHRoaXMucGlja2VyID09PSB2b2lkIDApIHJldHVybjtcclxuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy50cmFuc2l0aW9uSW5UaW1lb3V0KTtcclxuICAgICAgICB0aGlzLnRyYW5zaXRpb25PdXQodHJhbnNpdGlvbiwgdGhpcy5waWNrZXIpO1xyXG4gICAgICAgIHNldFRpbWVvdXQoKHBpY2tlcjpIVE1MRWxlbWVudCkgPT4ge1xyXG4gICAgICAgICAgICBwaWNrZXIucmVtb3ZlKCk7XHJcbiAgICAgICAgfSwgNTAwLCB0aGlzLnBpY2tlcik7ICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGdldE9mZnNldChlbDpIVE1MRWxlbWVudCk6e3g6bnVtYmVyLCB5Om51bWJlcn0ge1xyXG4gICAgICAgIGxldCB4ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdCAtIHRoaXMuY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQ7XHJcbiAgICAgICAgbGV0IHkgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AgLSB0aGlzLmNvbnRhaW5lci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3A7XHJcbiAgICAgICAgcmV0dXJuIHsgeDogeCwgeTogeSB9O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdXBkYXRlT3B0aW9ucyhvcHRpb25zOklPcHRpb25zKSB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGF0dGFjaCgpIHtcclxuICAgICAgICB0aGlzLnBpY2tlckNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLnBpY2tlcik7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRNaW4oKTpEYXRlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5taW47XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRNYXgoKTpEYXRlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tYXg7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBzZXRTZWxlY3RlZERhdGUoZGF0ZTpEYXRlKTp2b2lkIHtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkRGF0ZSA9IG5ldyBEYXRlKGRhdGUudmFsdWVPZigpKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIHRyYW5zaXRpb25PdXQodHJhbnNpdGlvbjpUcmFuc2l0aW9uLCBwaWNrZXI6SFRNTEVsZW1lbnQpIHtcclxuICAgICAgICBpZiAodHJhbnNpdGlvbiA9PT0gVHJhbnNpdGlvbi5TTElERV9MRUZUKSB7XHJcbiAgICAgICAgICAgIHBpY2tlci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tcGlja2VyLXJpZ2h0Jyk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0cmFuc2l0aW9uID09PSBUcmFuc2l0aW9uLlNMSURFX1JJR0hUKSB7XHJcbiAgICAgICAgICAgIHBpY2tlci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tcGlja2VyLWxlZnQnKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRyYW5zaXRpb24gPT09IFRyYW5zaXRpb24uWk9PTV9JTikge1xyXG4gICAgICAgICAgICBwaWNrZXIuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLXBpY2tlci1vdXQnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwaWNrZXIuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLXBpY2tlci1pbicpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIHRyYW5zaXRpb25JblRpbWVvdXQ6bnVtYmVyO1xyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgdHJhbnNpdGlvbkluKHRyYW5zaXRpb246VHJhbnNpdGlvbiwgcGlja2VyOkhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgbGV0IGNsczpzdHJpbmc7XHJcbiAgICAgICAgaWYgKHRyYW5zaXRpb24gPT09IFRyYW5zaXRpb24uU0xJREVfTEVGVCkge1xyXG4gICAgICAgICAgICBjbHMgPSAnZGF0aXVtLXBpY2tlci1sZWZ0JztcclxuICAgICAgICB9IGVsc2UgaWYgKHRyYW5zaXRpb24gPT09IFRyYW5zaXRpb24uU0xJREVfUklHSFQpIHtcclxuICAgICAgICAgICAgY2xzID0gJ2RhdGl1bS1waWNrZXItcmlnaHQnO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHJhbnNpdGlvbiA9PT0gVHJhbnNpdGlvbi5aT09NX0lOKSB7XHJcbiAgICAgICAgICAgIGNscyA9ICdkYXRpdW0tcGlja2VyLWluJztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjbHMgPSAnZGF0aXVtLXBpY2tlci1vdXQnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwaWNrZXIuY2xhc3NMaXN0LmFkZChjbHMpO1xyXG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRyYW5zaXRpb25JblRpbWVvdXQpO1xyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbkluVGltZW91dCA9IHNldFRpbWVvdXQoKHA6SFRNTEVsZW1lbnQpID0+IHtcclxuICAgICAgICAgICAgcC5jbGFzc0xpc3QucmVtb3ZlKGNscyk7XHJcbiAgICAgICAgfSwgMTAwLCBwaWNrZXIpO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJQaWNrZXIudHNcIiAvPlxyXG5cclxuY2xhc3MgRGF0ZVBpY2tlciBleHRlbmRzIFBpY2tlciBpbXBsZW1lbnRzIElQaWNrZXIge1xyXG4gICAgY29uc3RydWN0b3IoZWxlbWVudDpIVE1MRWxlbWVudCwgY29udGFpbmVyOkhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgc3VwZXIoZWxlbWVudCwgY29udGFpbmVyKTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4udGFwKGNvbnRhaW5lciwgJ2RhdGl1bS1kYXRlLWVsZW1lbnRbZGF0aXVtLWRhdGFdJywgKGUpID0+IHtcclxuICAgICAgICAgICBsZXQgZWw6RWxlbWVudCA9IDxFbGVtZW50PmUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcclxuICAgICAgICAgICBcclxuICAgICAgICAgICBsZXQgeWVhciA9IG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSkuZ2V0RnVsbFllYXIoKTtcclxuICAgICAgICAgICBsZXQgbW9udGggPSBuZXcgRGF0ZShlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpLmdldE1vbnRoKCk7XHJcbiAgICAgICAgICAgbGV0IGRhdGVPZk1vbnRoID0gbmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKS5nZXREYXRlKCk7XHJcbiAgICAgICAgICAgXHJcbiAgICAgICAgICAgbGV0IGRhdGUgPSBuZXcgRGF0ZSh0aGlzLnNlbGVjdGVkRGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgIGRhdGUuc2V0RnVsbFllYXIoeWVhcik7XHJcbiAgICAgICAgICAgZGF0ZS5zZXRNb250aChtb250aCk7XHJcbiAgICAgICAgICAgaWYgKGRhdGUuZ2V0TW9udGgoKSAhPT0gbW9udGgpIHtcclxuICAgICAgICAgICAgICAgZGF0ZS5zZXREYXRlKDApO1xyXG4gICAgICAgICAgIH1cclxuICAgICAgICAgICBkYXRlLnNldERhdGUoZGF0ZU9mTW9udGgpO1xyXG4gICAgICAgICAgIFxyXG4gICAgICAgICAgIHRyaWdnZXIuem9vbUluKGVsZW1lbnQsIHtcclxuICAgICAgICAgICAgICAgZGF0ZTogZGF0ZSxcclxuICAgICAgICAgICAgICAgY3VycmVudExldmVsOiBMZXZlbC5EQVRFXHJcbiAgICAgICAgICAgfSlcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4uZG93bihjb250YWluZXIsICdkYXRpdW0tZGF0ZS1lbGVtZW50JywgKGUpID0+IHtcclxuICAgICAgICAgICAgbGV0IGVsOkhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PihlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQpO1xyXG4gICAgICAgICAgICBsZXQgdGV4dCA9IHRoaXMucGFkKG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSkuZ2V0RGF0ZSgpKTtcclxuICAgICAgICAgICAgbGV0IG9mZnNldCA9IHRoaXMuZ2V0T2Zmc2V0KGVsKTtcclxuICAgICAgICAgICAgdHJpZ2dlci5vcGVuQnViYmxlKGVsZW1lbnQsIHtcclxuICAgICAgICAgICAgICAgIHg6IG9mZnNldC54ICsgMjAsXHJcbiAgICAgICAgICAgICAgICB5OiBvZmZzZXQueSArIDIsXHJcbiAgICAgICAgICAgICAgICB0ZXh0OiB0ZXh0XHJcbiAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgaGVpZ2h0Om51bWJlcjtcclxuICAgIFxyXG4gICAgcHVibGljIGNyZWF0ZShkYXRlOkRhdGUsIHRyYW5zaXRpb246VHJhbnNpdGlvbikge1xyXG4gICAgICAgIHRoaXMubWluID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCkpO1xyXG4gICAgICAgIHRoaXMubWF4ID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCkgKyAxKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgc3RhcnQgPSBuZXcgRGF0ZSh0aGlzLm1pbi52YWx1ZU9mKCkpO1xyXG4gICAgICAgIHN0YXJ0LnNldERhdGUoMSAtIHN0YXJ0LmdldERheSgpKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgZW5kID0gbmV3IERhdGUodGhpcy5tYXgudmFsdWVPZigpKTtcclxuICAgICAgICBlbmQuc2V0RGF0ZShlbmQuZ2V0RGF0ZSgpICsgNyAtIChlbmQuZ2V0RGF5KCkgPT09IDAgPyA3IDogZW5kLmdldERheSgpKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGl0ZXJhdG9yID0gbmV3IERhdGUoc3RhcnQudmFsdWVPZigpKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnBpY2tlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1waWNrZXInKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnRyYW5zaXRpb25Jbih0cmFuc2l0aW9uLCB0aGlzLnBpY2tlcik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA3OyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1kYXRlLWhlYWRlcicpO1xyXG4gICAgICAgICAgICBoZWFkZXIuaW5uZXJIVE1MID0gdGhpcy5nZXREYXlzKClbaV0uc2xpY2UoMCwgMik7XHJcbiAgICAgICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKGhlYWRlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCB0aW1lcyA9IDA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZG8geyAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgZGF0ZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tZGF0ZS1lbGVtZW50Jyk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBkYXRlRWxlbWVudC5pbm5lckhUTUwgPSBpdGVyYXRvci5nZXREYXRlKCkudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChpdGVyYXRvci5nZXRNb250aCgpID09PSBkYXRlLmdldE1vbnRoKCkgJiZcclxuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5pc0RhdGVTZWxlY3RhYmxlKGl0ZXJhdG9yKSkge1xyXG4gICAgICAgICAgICAgICAgZGF0ZUVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScsIGl0ZXJhdG9yLnRvSVNPU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLnBpY2tlci5hcHBlbmRDaGlsZChkYXRlRWxlbWVudCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpdGVyYXRvci5zZXREYXRlKGl0ZXJhdG9yLmdldERhdGUoKSArIDEpO1xyXG4gICAgICAgICAgICB0aW1lcysrO1xyXG4gICAgICAgIH0gd2hpbGUgKGl0ZXJhdG9yLnZhbHVlT2YoKSA8IGVuZC52YWx1ZU9mKCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gTWF0aC5jZWlsKHRpbWVzIC8gNykgKiAzNiArIDI4O1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuYXR0YWNoKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5zZXRTZWxlY3RlZERhdGUodGhpcy5zZWxlY3RlZERhdGUpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgc2V0U2VsZWN0ZWREYXRlKHNlbGVjdGVkRGF0ZTpEYXRlKSB7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZERhdGUgPSBuZXcgRGF0ZShzZWxlY3RlZERhdGUudmFsdWVPZigpKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgZGF0ZUVsZW1lbnRzID0gdGhpcy5waWNrZXJDb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnZGF0aXVtLWRhdGUtZWxlbWVudCcpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGF0ZUVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBlbCA9IGRhdGVFbGVtZW50cy5pdGVtKGkpO1xyXG4gICAgICAgICAgICBsZXQgZGF0ZSA9IG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSk7XHJcbiAgICAgICAgICAgIGlmIChkYXRlLmdldEZ1bGxZZWFyKCkgPT09IHNlbGVjdGVkRGF0ZS5nZXRGdWxsWWVhcigpICYmXHJcbiAgICAgICAgICAgICAgICBkYXRlLmdldE1vbnRoKCkgPT09IHNlbGVjdGVkRGF0ZS5nZXRNb250aCgpICYmXHJcbiAgICAgICAgICAgICAgICBkYXRlLmdldERhdGUoKSA9PT0gc2VsZWN0ZWREYXRlLmdldERhdGUoKSkge1xyXG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLXNlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdkYXRpdW0tc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldEhlaWdodCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5oZWlnaHQ7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICByZXR1cm4gTGV2ZWwuREFURTtcclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJQaWNrZXIudHNcIiAvPlxyXG5cclxuY2xhc3MgVGltZVBpY2tlciBleHRlbmRzIFBpY2tlciB7XHJcbiAgICBwcm90ZWN0ZWQgdGltZURyYWc6SFRNTEVsZW1lbnQ7XHJcbiAgICBwcm90ZWN0ZWQgdGltZURyYWdBcm06SFRNTEVsZW1lbnQ7XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBzZWNvbmRIYW5kOkhUTUxFbGVtZW50O1xyXG4gICAgcHJvdGVjdGVkIGhvdXJIYW5kOkhUTUxFbGVtZW50O1xyXG4gICAgcHJvdGVjdGVkIG1pbnV0ZUhhbmQ6SFRNTEVsZW1lbnQ7XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBkcmFnZ2luZzpib29sZWFuID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgaXNEcmFnZ2luZygpOmJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRyYWdnaW5nO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgcm90YXRpb246bnVtYmVyID0gMDtcclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGRyYWdTdGFydChlOk1vdXNlRXZlbnR8VG91Y2hFdmVudCkge1xyXG4gICAgICAgIGxldCBtaW51dGVBZGp1c3QgPSAwO1xyXG4gICAgICAgIGlmICh0aGlzLmdldExldmVsKCkgPT09IExldmVsLkhPVVIpIHtcclxuICAgICAgICAgICAgbWludXRlQWRqdXN0ID0gKE1hdGguUEkgKiB0aGlzLnNlbGVjdGVkRGF0ZS5nZXRNaW51dGVzKCkgLyAzMCkgLyAxMjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdHJpZ2dlci5vcGVuQnViYmxlKHRoaXMuZWxlbWVudCwge1xyXG4gICAgICAgICAgIHg6IC03MCAqIE1hdGguc2luKHRoaXMucm90YXRpb24gKyBtaW51dGVBZGp1c3QpICsgMTQwLCBcclxuICAgICAgICAgICB5OiA3MCAqIE1hdGguY29zKHRoaXMucm90YXRpb24gKyBtaW51dGVBZGp1c3QpICsgMTc1LFxyXG4gICAgICAgICAgIHRleHQ6IHRoaXMuZ2V0QnViYmxlVGV4dCgpXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5waWNrZXIuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLWRyYWdnaW5nJyk7XHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZyA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5tb3ZlZCA9IDA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgbW92ZWQ6bnVtYmVyID0gMDtcclxuICAgIHByb3RlY3RlZCBkcmFnTW92ZShlOk1vdXNlRXZlbnR8VG91Y2hFdmVudCkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBwb2ludCA9IHtcclxuICAgICAgICAgICAgeDogdGhpcy5waWNrZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdCArIDE0MCAtIHRoaXMuZ2V0Q2xpZW50Q29vcihlKS54LFxyXG4gICAgICAgICAgICB5OiB0aGlzLmdldENsaWVudENvb3IoZSkueSAtIHRoaXMucGlja2VyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCAtIDEyMFxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBsZXQgciA9IE1hdGguYXRhbjIocG9pbnQueCwgcG9pbnQueSk7XHJcbiAgICAgICAgdGhpcy5yb3RhdGlvbiA9IHRoaXMubm9ybWFsaXplUm90YXRpb24ocik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IG5ld0RhdGUgPSB0aGlzLmdldEVsZW1lbnREYXRlKHRoaXMudGltZURyYWcpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBnb3RvID0gdHJ1ZTtcclxuICAgICAgICBpZiAodGhpcy5nZXRMZXZlbCgpID09PSBMZXZlbC5IT1VSKSB7XHJcbiAgICAgICAgICAgIG5ld0RhdGUuc2V0SG91cnModGhpcy5yb3RhdGlvblRvVGltZSh0aGlzLnJvdGF0aW9uKSk7XHJcbiAgICAgICAgICAgIGdvdG8gPSB0aGlzLm9wdGlvbnMuaXNIb3VyU2VsZWN0YWJsZShuZXdEYXRlKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZ2V0TGV2ZWwoKSA9PT0gTGV2ZWwuTUlOVVRFKSB7XHJcbiAgICAgICAgICAgIG5ld0RhdGUuc2V0TWludXRlcyh0aGlzLnJvdGF0aW9uVG9UaW1lKHRoaXMucm90YXRpb24pKTsgIFxyXG4gICAgICAgICAgICBnb3RvID0gdGhpcy5vcHRpb25zLmlzTWludXRlU2VsZWN0YWJsZShuZXdEYXRlKTsgICAgICAgICAgXHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmdldExldmVsKCkgPT09IExldmVsLlNFQ09ORCkge1xyXG4gICAgICAgICAgICBuZXdEYXRlLnNldFNlY29uZHModGhpcy5yb3RhdGlvblRvVGltZSh0aGlzLnJvdGF0aW9uKSk7XHJcbiAgICAgICAgICAgIGdvdG8gPSB0aGlzLm9wdGlvbnMuaXNIb3VyU2VsZWN0YWJsZShuZXdEYXRlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMubW92ZWQrKyA+IDEpIHtcclxuICAgICAgICAgICAgdHJpZ2dlci51cGRhdGVCdWJibGUodGhpcy5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgICAgICB4OiAtNzAgKiBNYXRoLnNpbih0aGlzLnJvdGF0aW9uKSArIDE0MCwgXHJcbiAgICAgICAgICAgICAgICB5OiA3MCAqIE1hdGguY29zKHRoaXMucm90YXRpb24pICsgMTc1LFxyXG4gICAgICAgICAgICAgICAgdGV4dDogdGhpcy5nZXRCdWJibGVUZXh0KClcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMudXBkYXRlTGFiZWxzKG5ld0RhdGUpO1xyXG4gICAgICAgIGlmIChnb3RvKSB7XHJcbiAgICAgICAgICAgIHRyaWdnZXIuZ290byh0aGlzLmVsZW1lbnQsIHtcclxuICAgICAgICAgICAgICAgIGRhdGU6IG5ld0RhdGUsXHJcbiAgICAgICAgICAgICAgICBsZXZlbDogdGhpcy5nZXRMZXZlbCgpLFxyXG4gICAgICAgICAgICAgICAgdXBkYXRlOiBmYWxzZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy51cGRhdGVFbGVtZW50cygpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgZHJhZ0VuZChlOk1vdXNlRXZlbnR8VG91Y2hFdmVudCkge1xyXG4gICAgICAgIHRoaXMucGlja2VyLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1kcmFnZ2luZycpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBkYXRlID0gdGhpcy5nZXRFbGVtZW50RGF0ZSh0aGlzLnRpbWVEcmFnKTtcclxuICAgICAgICBsZXQgem9vbUluID0gdHJ1ZTtcclxuICAgICAgICBpZiAodGhpcy5nZXRMZXZlbCgpID09PSBMZXZlbC5IT1VSKSB7XHJcbiAgICAgICAgICAgIGRhdGUuc2V0SG91cnModGhpcy5yb3RhdGlvblRvVGltZSh0aGlzLnJvdGF0aW9uKSk7XHJcbiAgICAgICAgICAgIGRhdGUgPSB0aGlzLnJvdW5kKGRhdGUpO1xyXG4gICAgICAgICAgICB6b29tSW4gPSB0aGlzLm9wdGlvbnMuaXNIb3VyU2VsZWN0YWJsZShkYXRlKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZ2V0TGV2ZWwoKSA9PT0gTGV2ZWwuTUlOVVRFKSB7XHJcbiAgICAgICAgICAgIGRhdGUuc2V0TWludXRlcyh0aGlzLnJvdGF0aW9uVG9UaW1lKHRoaXMucm90YXRpb24pKTtcclxuICAgICAgICAgICAgZGF0ZSA9IHRoaXMucm91bmQoZGF0ZSk7XHJcbiAgICAgICAgICAgIHpvb21JbiA9IHRoaXMub3B0aW9ucy5pc01pbnV0ZVNlbGVjdGFibGUoZGF0ZSk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmdldExldmVsKCkgPT09IExldmVsLlNFQ09ORCkge1xyXG4gICAgICAgICAgICBkYXRlLnNldFNlY29uZHModGhpcy5yb3RhdGlvblRvVGltZSh0aGlzLnJvdGF0aW9uKSk7XHJcbiAgICAgICAgICAgIGRhdGUgPSB0aGlzLnJvdW5kKGRhdGUpO1xyXG4gICAgICAgICAgICB6b29tSW4gPSB0aGlzLm9wdGlvbnMuaXNTZWNvbmRTZWxlY3RhYmxlKGRhdGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZiAoem9vbUluKSB7XHJcbiAgICAgICAgICAgIHRyaWdnZXIuem9vbUluKHRoaXMuZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgZGF0ZTogZGF0ZSxcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRMZXZlbDogdGhpcy5nZXRMZXZlbCgpXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmRyYWdnaW5nID0gZmFsc2U7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy51cGRhdGVFbGVtZW50cygpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgdXBkYXRlRWxlbWVudHMoKSB7XHJcbiAgICAgICAgdGhpcy50aW1lRHJhZ0FybS5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlKCR7dGhpcy5yb3RhdGlvbn1yYWQpYDtcclxuICAgICAgICBpZiAodGhpcy5nZXRMZXZlbCgpID09IExldmVsLkhPVVIpIHtcclxuICAgICAgICAgICAgbGV0IG1pbnV0ZUFkanVzdCA9IDA7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5kcmFnZ2luZykge1xyXG4gICAgICAgICAgICAgICAgbWludXRlQWRqdXN0ID0gKE1hdGguUEkgKiB0aGlzLnNlbGVjdGVkRGF0ZS5nZXRNaW51dGVzKCkgLyAzMCkgLyAxMjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnRpbWVEcmFnQXJtLnN0eWxlLnRyYW5zZm9ybSA9IGByb3RhdGUoJHt0aGlzLnJvdGF0aW9uICsgbWludXRlQWRqdXN0fXJhZClgO1xyXG4gICAgICAgICAgICB0aGlzLmhvdXJIYW5kLnN0eWxlLnRyYW5zZm9ybSA9IGByb3RhdGUoJHt0aGlzLnJvdGF0aW9uICsgbWludXRlQWRqdXN0fXJhZClgO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5nZXRMZXZlbCgpID09PSBMZXZlbC5NSU5VVEUpIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCB0ID0gdGhpcy5zZWxlY3RlZERhdGUuZ2V0SG91cnMoKTtcclxuICAgICAgICAgICAgbGV0IHIxID0gICh0ICsgNikgLyA2ICogTWF0aC5QSTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCByID0gdGhpcy5yb3RhdGlvbjtcclxuICAgICAgICAgICAgciA9IHRoaXMucHV0Um90YXRpb25JbkJvdW5kcyhyKTtcclxuICAgICAgICAgICAgcjEgKz0gKHIrTWF0aC5QSSkvMTI7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLmhvdXJIYW5kLnN0eWxlLnRyYW5zZm9ybSA9IGByb3RhdGUoJHtyMX1yYWQpYDtcclxuICAgICAgICAgICAgdGhpcy5taW51dGVIYW5kLnN0eWxlLnRyYW5zZm9ybSA9IGByb3RhdGUoJHt0aGlzLnJvdGF0aW9ufXJhZClgO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5nZXRMZXZlbCgpID09PSBMZXZlbC5TRUNPTkQpIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCB0ID0gdGhpcy5zZWxlY3RlZERhdGUuZ2V0SG91cnMoKTtcclxuICAgICAgICAgICAgbGV0IHIxID0gICh0ICsgNikgLyA2ICogTWF0aC5QSTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IHQyID0gdGhpcy5zZWxlY3RlZERhdGUuZ2V0TWludXRlcygpO1xyXG4gICAgICAgICAgICBsZXQgcjIgPSB0aGlzLnRpbWVUb1JvdGF0aW9uKHQyKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCByID0gcjI7XHJcbiAgICAgICAgICAgIHIgPSB0aGlzLnB1dFJvdGF0aW9uSW5Cb3VuZHMocik7XHJcbiAgICAgICAgICAgIHIxICs9IChyK01hdGguUEkpLzEyO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5ob3VySGFuZC5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlKCR7cjF9cmFkKWA7XHJcbiAgICAgICAgICAgIHRoaXMubWludXRlSGFuZC5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlKCR7cjJ9cmFkKWA7XHJcbiAgICAgICAgICAgIHRoaXMuc2Vjb25kSGFuZC5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlKCR7dGhpcy5yb3RhdGlvbn1yYWQpYDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBwdXRSb3RhdGlvbkluQm91bmRzKHI6bnVtYmVyLCBmYWN0b3I6bnVtYmVyID0gMikge1xyXG4gICAgICAgIHdoaWxlIChyID4gTWF0aC5QSSkgciAtPSBNYXRoLlBJICogZmFjdG9yO1xyXG4gICAgICAgIHdoaWxlIChyIDwgLU1hdGguUEkpIHIgKz0gTWF0aC5QSSAqIGZhY3RvcjtcclxuICAgICAgICByZXR1cm4gcjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIG5vcm1hbGl6ZVJvdGF0aW9uKHI6bnVtYmVyLCBmYWN0b3I6bnVtYmVyID0gMikge1xyXG4gICAgICAgIHJldHVybiByIC0gTWF0aC5yb3VuZCgociAtIHRoaXMucm90YXRpb24pIC8gTWF0aC5QSSAvIGZhY3RvcikgKiBNYXRoLlBJICogZmFjdG9yO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgc2V0U2VsZWN0ZWREYXRlKGRhdGU6RGF0ZSkge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWREYXRlID0gbmV3IERhdGUoZGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLmdldExldmVsKCkgPT09IExldmVsLkhPVVIpIHtcclxuICAgICAgICAgICAgdGhpcy5yb3RhdGlvbiA9IHRoaXMubm9ybWFsaXplUm90YXRpb24oKGRhdGUuZ2V0SG91cnMoKSArIDYpIC8gNiAqIE1hdGguUEksIDIpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5nZXRMZXZlbCgpID09PSBMZXZlbC5NSU5VVEUpIHtcclxuICAgICAgICAgICAgdGhpcy5yb3RhdGlvbiA9IHRoaXMubm9ybWFsaXplUm90YXRpb24oKGRhdGUuZ2V0TWludXRlcygpICsgMzApIC8gMzAgKiBNYXRoLlBJLCAyKTsgICAgICAgICAgICBcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZ2V0TGV2ZWwoKSA9PT0gTGV2ZWwuU0VDT05EKSB7XHJcbiAgICAgICAgICAgIHRoaXMucm90YXRpb24gPSB0aGlzLm5vcm1hbGl6ZVJvdGF0aW9uKChkYXRlLmdldFNlY29uZHMoKSArIDMwKSAvIDMwICogTWF0aC5QSSwgMik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLnRpbWVEcmFnQXJtICE9PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVFbGVtZW50cygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZiAodGhpcy5waWNrZXIgIT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUxhYmVscyhkYXRlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRIZWlnaHQoKSB7XHJcbiAgICAgICAgcmV0dXJuIDI0MDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGZsb29yKGRhdGU6RGF0ZSk6RGF0ZSB7IHRocm93ICd1bmltcGxlbWVudGVkJyB9XHJcbiAgICBwcm90ZWN0ZWQgY2VpbChkYXRlOkRhdGUpOkRhdGUgeyB0aHJvdyAndW5pbXBsZW1lbnRlZCcgfVxyXG4gICAgcHJvdGVjdGVkIHJvdW5kKGRhdGU6RGF0ZSk6RGF0ZSB7IHRocm93ICd1bmltcGxlbWVudGVkJyB9XHJcbiAgICBwcm90ZWN0ZWQgdXBkYXRlTGFiZWxzKGRhdGU6RGF0ZSwgZm9yY2VVcGRhdGU6Ym9vbGVhbiA9IGZhbHNlKSB7IHRocm93ICd1bmltcGxlbWVudGVkJyB9XHJcbiAgICBwcm90ZWN0ZWQgZ2V0RWxlbWVudERhdGUoZWw6RWxlbWVudCk6RGF0ZSB7IHRocm93ICd1bmltcGxlbWVudGVkJyB9XHJcbiAgICBwcm90ZWN0ZWQgZ2V0QnViYmxlVGV4dCgpOnN0cmluZyB7IHRocm93ICd1bmltcGxlbWVudGVkJyB9XHJcbiAgICBwcm90ZWN0ZWQgcm90YXRpb25Ub1RpbWUocm90YXRpb246bnVtYmVyKTpudW1iZXIgeyB0aHJvdyAndW5pbXBsZW1lbnRlZCcgfVxyXG4gICAgcHJvdGVjdGVkIHRpbWVUb1JvdGF0aW9uKHRpbWU6bnVtYmVyKTpudW1iZXIgeyB0aHJvdyAndW5pbXBsZW1lbnRlZCcgfVxyXG4gICAgcHVibGljIGdldExldmVsKCk6TGV2ZWwgeyB0aHJvdyAndW5pbXBsZW1lbnRlZCcgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIlRpbWVQaWNrZXIudHNcIiAvPlxyXG5cclxuY2xhc3MgSG91clBpY2tlciBleHRlbmRzIFRpbWVQaWNrZXIgaW1wbGVtZW50cyBJVGltZVBpY2tlciB7XHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OkhUTUxFbGVtZW50LCBjb250YWluZXI6SFRNTEVsZW1lbnQpIHtcclxuICAgICAgICBzdXBlcihlbGVtZW50LCBjb250YWluZXIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi5kcmFnKGNvbnRhaW5lciwgJy5kYXRpdW0taG91ci1kcmFnJywge1xyXG4gICAgICAgICAgICBkcmFnU3RhcnQ6IChlKSA9PiB0aGlzLmRyYWdTdGFydChlKSxcclxuICAgICAgICAgICAgZHJhZ01vdmU6IChlKSA9PiB0aGlzLmRyYWdNb3ZlKGUpLFxyXG4gICAgICAgICAgICBkcmFnRW5kOiAoZSkgPT4gdGhpcy5kcmFnRW5kKGUpLCBcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4udGFwKGNvbnRhaW5lciwgJy5kYXRpdW0taG91ci1lbGVtZW50JywgKGUpID0+IHtcclxuICAgICAgICAgICAgbGV0IGVsOkVsZW1lbnQgPSA8RWxlbWVudD5lLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0cmlnZ2VyLnpvb21Jbih0aGlzLmVsZW1lbnQsIHtcclxuICAgICAgICAgICAgICAgIGRhdGU6IHRoaXMuZ2V0RWxlbWVudERhdGUoZWwpLFxyXG4gICAgICAgICAgICAgICAgY3VycmVudExldmVsOiBMZXZlbC5IT1VSXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi5kb3duKGNvbnRhaW5lciwgJy5kYXRpdW0taG91ci1lbGVtZW50JywgKGUpID0+IHtcclxuICAgICAgICAgICAgbGV0IGVsOkhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PihlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQpO1xyXG4gICAgICAgICAgICBsZXQgaG91cnMgPSBuZXcgRGF0ZShlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpLmdldEhvdXJzKCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgb2Zmc2V0ID0gdGhpcy5nZXRPZmZzZXQoZWwpO1xyXG4gICAgICAgICAgICB0cmlnZ2VyLm9wZW5CdWJibGUoZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgeDogb2Zmc2V0LnggKyAyNSxcclxuICAgICAgICAgICAgICAgIHk6IG9mZnNldC55ICsgMyxcclxuICAgICAgICAgICAgICAgIHRleHQ6IHRoaXMuZ2V0QnViYmxlVGV4dChob3VycylcclxuICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4udGFwKGNvbnRhaW5lciwgJ2RhdGl1bS1tZXJpZGllbS1zd2l0Y2hlcicsICgpID0+IHtcclxuICAgICAgICAgICAgLy8gVE9ETyBzb3J0IG91dCBidWcgd2l0aCB0aGlzIG9uZVxyXG4gICAgICAgICAgICBsZXQgbmV3RGF0ZSA9IG5ldyBEYXRlKHRoaXMubGFzdExhYmVsRGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgICBpZiAobmV3RGF0ZS5nZXRIb3VycygpIDwgMTIpIHtcclxuICAgICAgICAgICAgICAgIG5ld0RhdGUuc2V0SG91cnMobmV3RGF0ZS5nZXRIb3VycygpICsgMTIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yb3RhdGlvbiArPSBNYXRoLlBJICogMjtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG5ld0RhdGUuc2V0SG91cnMobmV3RGF0ZS5nZXRIb3VycygpIC0gMTIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yb3RhdGlvbiAtPSBNYXRoLlBJICogMjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVMYWJlbHMobmV3RGF0ZSk7XHJcbiAgICAgICAgICAgIHRyaWdnZXIuZ290byh0aGlzLmVsZW1lbnQsIHtcclxuICAgICAgICAgICAgICAgIGRhdGU6IG5ld0RhdGUsXHJcbiAgICAgICAgICAgICAgICBsZXZlbDogTGV2ZWwuSE9VUixcclxuICAgICAgICAgICAgICAgIHVwZGF0ZTogZmFsc2VcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRWxlbWVudHMoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGNlaWwoZGF0ZTpEYXRlKTpEYXRlIHtcclxuICAgICAgICBsZXQgY2VpbGVkRGF0ZSA9IG5ldyBEYXRlKGRhdGUudmFsdWVPZigpKTtcclxuICAgICAgICBsZXQgdXBwZXIgPSBjZWlsZWREYXRlLmdldEhvdXJzKCkgKyAxO1xyXG4gICAgICAgIGxldCBvcmlnID0gY2VpbGVkRGF0ZS5nZXRIb3VycygpO1xyXG4gICAgICAgIHdoaWxlICghdGhpcy5vcHRpb25zLmlzSG91clNlbGVjdGFibGUoY2VpbGVkRGF0ZSkpIHtcclxuICAgICAgICAgICAgaWYgKHVwcGVyID4gMjMpIHVwcGVyID0gMDtcclxuICAgICAgICAgICAgY2VpbGVkRGF0ZS5zZXRIb3Vycyh1cHBlcisrKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5pc0hvdXJTZWxlY3RhYmxlKGNlaWxlZERhdGUpKSBicmVhaztcclxuICAgICAgICAgICAgaWYgKHVwcGVyID09PSBvcmlnKSBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNlaWxlZERhdGU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBmbG9vcihkYXRlOkRhdGUpOkRhdGUge1xyXG4gICAgICAgIGxldCBmbG9vcmVkRGF0ZSA9IG5ldyBEYXRlKGRhdGUudmFsdWVPZigpKTtcclxuICAgICAgICBsZXQgbG93ZXIgPSBmbG9vcmVkRGF0ZS5nZXRIb3VycygpIC0gMTtcclxuICAgICAgICBsZXQgb3JpZyA9IGZsb29yZWREYXRlLmdldEhvdXJzKCk7XHJcbiAgICAgICAgd2hpbGUgKCF0aGlzLm9wdGlvbnMuaXNIb3VyU2VsZWN0YWJsZShmbG9vcmVkRGF0ZSkpIHtcclxuICAgICAgICAgICAgaWYgKGxvd2VyIDwgMCkgbG93ZXIgPSAyMztcclxuICAgICAgICAgICAgZmxvb3JlZERhdGUuc2V0SG91cnMobG93ZXItLSk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaXNIb3VyU2VsZWN0YWJsZShmbG9vcmVkRGF0ZSkpIGJyZWFrO1xyXG4gICAgICAgICAgICBpZiAobG93ZXIgPT09IG9yaWcpIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmxvb3JlZERhdGU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCByb3VuZChkYXRlOkRhdGUpOkRhdGUge1xyXG4gICAgICAgIGxldCByb3VuZGVkRGF0ZSA9IG5ldyBEYXRlKGRhdGUudmFsdWVPZigpKTtcclxuICAgICAgICBsZXQgbG93ZXIgPSByb3VuZGVkRGF0ZS5nZXRIb3VycygpIC0gMTtcclxuICAgICAgICBsZXQgdXBwZXIgPSByb3VuZGVkRGF0ZS5nZXRIb3VycygpICsgMTtcclxuICAgICAgICB3aGlsZSAoIXRoaXMub3B0aW9ucy5pc0hvdXJTZWxlY3RhYmxlKHJvdW5kZWREYXRlKSkge1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKGxvd2VyIDwgMCkgbG93ZXIgPSAyMztcclxuICAgICAgICAgICAgcm91bmRlZERhdGUuc2V0SG91cnMobG93ZXItLSk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaXNIb3VyU2VsZWN0YWJsZShyb3VuZGVkRGF0ZSkpIGJyZWFrO1xyXG4gICAgICAgICAgICBpZiAobG93ZXIgPT09IHVwcGVyKSBicmVhaztcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICh1cHBlciA+IDIzKSB1cHBlciA9IDA7XHJcbiAgICAgICAgICAgIHJvdW5kZWREYXRlLnNldEhvdXJzKHVwcGVyKyspO1xyXG4gICAgICAgICAgICBpZiAobG93ZXIgPT09IHVwcGVyKSBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJvdW5kZWREYXRlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgZ2V0QnViYmxlVGV4dChob3Vycz86bnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKGhvdXJzID09PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgaG91cnMgPSB0aGlzLnJvdGF0aW9uVG9UaW1lKHRoaXMucm90YXRpb24pOyBcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGQgPSBuZXcgRGF0ZSh0aGlzLnNlbGVjdGVkRGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgIGQuc2V0SG91cnMoaG91cnMpO1xyXG4gICAgICAgIGQgPSB0aGlzLnJvdW5kKGQpO1xyXG4gICAgICAgIGhvdXJzID0gZC5nZXRIb3VycygpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMubWlsaXRhcnlUaW1lKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhZChob3VycykrJ2hyJztcclxuICAgICAgICB9IGVsc2UgaWYgKGhvdXJzID09PSAxMikge1xyXG4gICAgICAgICAgICByZXR1cm4gJzEycG0nO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoaG91cnMgPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuICcxMmFtJztcclxuICAgICAgICB9IGVsc2UgaWYgKGhvdXJzID4gMTEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIChob3VycyAtIDEyKSArICdwbSc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGhvdXJzICsgJ2FtJztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBnZXRFbGVtZW50RGF0ZShlbDpFbGVtZW50KSB7XHJcbiAgICAgICAgbGV0IGQgPSBuZXcgRGF0ZShlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpO1xyXG4gICAgICAgIGxldCB5ZWFyID0gZC5nZXRGdWxsWWVhcigpO1xyXG4gICAgICAgIGxldCBtb250aCA9IGQuZ2V0TW9udGgoKTtcclxuICAgICAgICBsZXQgZGF0ZU9mTW9udGggPSBkLmdldERhdGUoKTtcclxuICAgICAgICBsZXQgaG91cnMgPSBkLmdldEhvdXJzKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IG5ld0RhdGUgPSBuZXcgRGF0ZSh0aGlzLnNlbGVjdGVkRGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgIG5ld0RhdGUuc2V0RnVsbFllYXIoeWVhcik7XHJcbiAgICAgICAgbmV3RGF0ZS5zZXRNb250aChtb250aCk7XHJcbiAgICAgICAgaWYgKG5ld0RhdGUuZ2V0TW9udGgoKSAhPT0gbW9udGgpIHtcclxuICAgICAgICAgICAgbmV3RGF0ZS5zZXREYXRlKDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBuZXdEYXRlLnNldERhdGUoZGF0ZU9mTW9udGgpO1xyXG4gICAgICAgIG5ld0RhdGUuc2V0SG91cnMoaG91cnMpO1xyXG4gICAgICAgIHJldHVybiBuZXdEYXRlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgcm90YXRpb25Ub1RpbWUocjpudW1iZXIpIHtcclxuICAgICAgICB3aGlsZSAociA+IDUqTWF0aC5QSSkgciAtPSA0Kk1hdGguUEk7XHJcbiAgICAgICAgd2hpbGUgKHIgPCBNYXRoLlBJKSByICs9IDQqTWF0aC5QSTtcclxuICAgICAgICByIC09IDIgKiBNYXRoLlBJO1xyXG4gICAgICAgIGxldCB0ID0gKHIgLyBNYXRoLlBJICogNikgKyA2O1xyXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKHQrLjAwMDAwMSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCB0aW1lVG9Sb3RhdGlvbih0Om51bWJlcikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm5vcm1hbGl6ZVJvdGF0aW9uKCh0ICsgNikgLyA2ICogTWF0aC5QSSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBjcmVhdGUoZGF0ZTpEYXRlLCB0cmFuc2l0aW9uOlRyYW5zaXRpb24pIHtcclxuICAgICAgICB0aGlzLm1pbiA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCBkYXRlLmdldERhdGUoKSk7XHJcbiAgICAgICAgdGhpcy5tYXggPSBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSwgZGF0ZS5nZXREYXRlKCkgKyAxKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgaXRlcmF0b3IgPSBuZXcgRGF0ZSh0aGlzLm1pbi52YWx1ZU9mKCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMucGlja2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXBpY2tlcicpO1xyXG4gICAgICAgIHRoaXMucGlja2VyLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1ob3VyLXBpY2tlcicpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbkluKHRyYW5zaXRpb24sIHRoaXMucGlja2VyKTtcclxuICAgICAgICBcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEyOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHRpY2sgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tdGljaycpO1xyXG4gICAgICAgICAgICBsZXQgdGlja0xhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpY2stbGFiZWwnKTtcclxuICAgICAgICAgICAgdGlja0xhYmVsLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1ob3VyLWVsZW1lbnQnKTtcclxuICAgICAgICAgICAgbGV0IHRpY2tMYWJlbENvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS10aWNrLWxhYmVsLWNvbnRhaW5lcicpO1xyXG4gICAgICAgICAgICBsZXQgciA9IGkgKiBNYXRoLlBJLzYgKyBNYXRoLlBJO1xyXG4gICAgICAgICAgICB0aWNrTGFiZWxDb250YWluZXIuYXBwZW5kQ2hpbGQodGlja0xhYmVsKTtcclxuICAgICAgICAgICAgdGljay5hcHBlbmRDaGlsZCh0aWNrTGFiZWxDb250YWluZXIpO1xyXG4gICAgICAgICAgICB0aWNrLnN0eWxlLnRyYW5zZm9ybSA9IGByb3RhdGUoJHtyfXJhZClgO1xyXG4gICAgICAgICAgICB0aWNrTGFiZWxDb250YWluZXIuc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZSgkezIqTWF0aC5QSSAtIHJ9cmFkKWA7XHJcbiAgICAgICAgICAgIHRpY2tMYWJlbC5zZXRBdHRyaWJ1dGUoJ2RhdGl1bS1jbG9jay1wb3MnLCBpLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IGQgPSBuZXcgRGF0ZShkYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgaG91cnMgPSB0aGlzLnJvdGF0aW9uVG9UaW1lKHIpO1xyXG4gICAgICAgICAgICBpZiAoZGF0ZS5nZXRIb3VycygpID4gMTEpIGhvdXJzICs9IDEyO1xyXG4gICAgICAgICAgICBkLnNldEhvdXJzKGhvdXJzKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRpY2tMYWJlbC5zZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJywgZC50b0lTT1N0cmluZygpKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKHRpY2spO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm1lcmlkaWVtU3dpdGNoZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tbWVyaWRpZW0tc3dpdGNoZXInKTtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLm1pbGl0YXJ5VGltZSkge1xyXG4gICAgICAgICAgICB0aGlzLm1lcmlkaWVtU3dpdGNoZXIuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLW1pbGl0YXJ5LXRpbWUnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5waWNrZXIuYXBwZW5kQ2hpbGQodGhpcy5tZXJpZGllbVN3aXRjaGVyKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmhvdXJIYW5kID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLWhvdXItaGFuZCcpO1xyXG4gICAgICAgIHRoaXMudGltZURyYWdBcm0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tdGltZS1kcmFnLWFybScpO1xyXG4gICAgICAgIHRoaXMudGltZURyYWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tdGltZS1kcmFnJyk7XHJcbiAgICAgICAgdGhpcy50aW1lRHJhZy5jbGFzc0xpc3QuYWRkKCdkYXRpdW0taG91ci1kcmFnJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy50aW1lRHJhZy5zZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJywgZGF0ZS50b0lTT1N0cmluZygpKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnRpbWVEcmFnQXJtLmFwcGVuZENoaWxkKHRoaXMudGltZURyYWcpO1xyXG4gICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKHRoaXMudGltZURyYWdBcm0pO1xyXG4gICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKHRoaXMuaG91ckhhbmQpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMubWVyaWRpZW0gPSB2b2lkIDA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5hdHRhY2goKTtcclxuICAgICAgICB0aGlzLnNldFNlbGVjdGVkRGF0ZSh0aGlzLnNlbGVjdGVkRGF0ZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgbWVyaWRpZW1Td2l0Y2hlcjpIVE1MRWxlbWVudDtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBtZXJpZGllbTpzdHJpbmc7XHJcbiAgICBwcml2YXRlIGxhc3RMYWJlbERhdGU6RGF0ZTtcclxuICAgIHByb3RlY3RlZCB1cGRhdGVMYWJlbHMoZGF0ZTpEYXRlLCBmb3JjZVVwZGF0ZTpib29sZWFuID0gZmFsc2UpIHtcclxuICAgICAgICB0aGlzLmxhc3RMYWJlbERhdGUgPSBkYXRlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLm1lcmlkaWVtICE9PSB2b2lkIDAgJiZcclxuICAgICAgICAgICAgKHRoaXMubWVyaWRpZW0gPT09ICdBTScgJiYgZGF0ZS5nZXRIb3VycygpIDwgMTIpIHx8XHJcbiAgICAgICAgICAgICh0aGlzLm1lcmlkaWVtID09PSAnUE0nICYmIGRhdGUuZ2V0SG91cnMoKSA+IDExKSkge1xyXG4gICAgICAgICAgICBpZiAoIWZvcmNlVXBkYXRlKSByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMubWVyaWRpZW0gPSBkYXRlLmdldEhvdXJzKCkgPCAxMiA/ICdBTScgOiAnUE0nO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLm1lcmlkaWVtID09PSAnQU0nKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWVyaWRpZW1Td2l0Y2hlci5jbGFzc0xpc3QucmVtb3ZlKCdkYXRpdW0tcG0tc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgdGhpcy5tZXJpZGllbVN3aXRjaGVyLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1hbS1zZWxlY3RlZCcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMubWVyaWRpZW1Td2l0Y2hlci5jbGFzc0xpc3QucmVtb3ZlKCdkYXRpdW0tYW0tc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgdGhpcy5tZXJpZGllbVN3aXRjaGVyLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1wbS1zZWxlY3RlZCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBsZXQgbGFiZWxzID0gdGhpcy5waWNrZXIucXVlcnlTZWxlY3RvckFsbCgnW2RhdGl1bS1jbG9jay1wb3NdJyk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsYWJlbHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGxhYmVsID0gbGFiZWxzLml0ZW0oaSk7XHJcbiAgICAgICAgICAgIGxldCByID0gTWF0aC5QSSpwYXJzZUludChsYWJlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1jbG9jay1wb3MnKSwgMTApLzYtMypNYXRoLlBJO1xyXG4gICAgICAgICAgICBsZXQgdGltZSA9IHRoaXMucm90YXRpb25Ub1RpbWUocik7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgZCA9IG5ldyBEYXRlKGxhYmVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSk7XHJcbiAgICAgICAgICAgIGlmIChkYXRlLmdldEhvdXJzKCkgPiAxMSkge1xyXG4gICAgICAgICAgICAgICAgZC5zZXRIb3Vycyh0aW1lICsgMTIpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZC5zZXRIb3Vycyh0aW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGFiZWwuc2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScsIGQudG9JU09TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmlzSG91clNlbGVjdGFibGUoZCkpIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1pbmFjdGl2ZScpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGFiZWwuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLWluYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMubWlsaXRhcnlUaW1lKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZS5nZXRIb3VycygpID4gMTEpIHRpbWUgKz0gMTI7XHJcbiAgICAgICAgICAgICAgICBsYWJlbC5pbm5lckhUTUwgPSB0aGlzLnBhZCh0aW1lKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aW1lID09PSAwKSB0aW1lID0gMTI7XHJcbiAgICAgICAgICAgICAgICBsYWJlbC5pbm5lckhUTUwgPSB0aW1lLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB1cGRhdGVPcHRpb25zKG9wdGlvbnM6SU9wdGlvbnMpIHtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zICE9PSB2b2lkIDAgJiYgdGhpcy5vcHRpb25zLm1pbGl0YXJ5VGltZSAhPT0gb3B0aW9ucy5taWxpdGFyeVRpbWUpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVMYWJlbHModGhpcy5sYXN0TGFiZWxEYXRlLCB0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuICAgICAgICBcclxuICAgICAgICBpZiAodGhpcy5tZXJpZGllbVN3aXRjaGVyICE9PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5taWxpdGFyeVRpbWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubWVyaWRpZW1Td2l0Y2hlci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tbWlsaXRhcnktdGltZScpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tZXJpZGllbVN3aXRjaGVyLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1taWxpdGFyeS10aW1lJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICByZXR1cm4gTGV2ZWwuSE9VUjtcclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJUaW1lUGlja2VyLnRzXCIgLz5cclxuXHJcbmNsYXNzIE1pbnV0ZVBpY2tlciBleHRlbmRzIFRpbWVQaWNrZXIgaW1wbGVtZW50cyBJVGltZVBpY2tlciB7XHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OkhUTUxFbGVtZW50LCBjb250YWluZXI6SFRNTEVsZW1lbnQpIHtcclxuICAgICAgICBzdXBlcihlbGVtZW50LCBjb250YWluZXIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi5kcmFnKGNvbnRhaW5lciwgJy5kYXRpdW0tbWludXRlLWRyYWcnLCB7XHJcbiAgICAgICAgICAgIGRyYWdTdGFydDogKGUpID0+IHRoaXMuZHJhZ1N0YXJ0KGUpLFxyXG4gICAgICAgICAgICBkcmFnTW92ZTogKGUpID0+IHRoaXMuZHJhZ01vdmUoZSksXHJcbiAgICAgICAgICAgIGRyYWdFbmQ6IChlKSA9PiB0aGlzLmRyYWdFbmQoZSksIFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi50YXAoY29udGFpbmVyLCAnLmRhdGl1bS1taW51dGUtZWxlbWVudCcsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBlbDpFbGVtZW50ID0gPEVsZW1lbnQ+ZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdHJpZ2dlci56b29tSW4odGhpcy5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgICAgICBkYXRlOiB0aGlzLmdldEVsZW1lbnREYXRlKGVsKSxcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRMZXZlbDogTGV2ZWwuTUlOVVRFXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi5kb3duKGNvbnRhaW5lciwgJy5kYXRpdW0tbWludXRlLWVsZW1lbnQnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZWw6SFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+KGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudCk7XHJcbiAgICAgICAgICAgIGxldCBtaW51dGVzID0gbmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKS5nZXRNaW51dGVzKCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgb2Zmc2V0ID0gdGhpcy5nZXRPZmZzZXQoZWwpO1xyXG4gICAgICAgICAgICB0cmlnZ2VyLm9wZW5CdWJibGUoZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgeDogb2Zmc2V0LnggKyAyNSxcclxuICAgICAgICAgICAgICAgIHk6IG9mZnNldC55ICsgMyxcclxuICAgICAgICAgICAgICAgIHRleHQ6IHRoaXMuZ2V0QnViYmxlVGV4dChtaW51dGVzKVxyXG4gICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgY2VpbChkYXRlOkRhdGUpOkRhdGUge1xyXG4gICAgICAgIGxldCBjZWlsZWREYXRlID0gbmV3IERhdGUoZGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgIGxldCB1cHBlciA9IGNlaWxlZERhdGUuZ2V0TWludXRlcygpICsgMTtcclxuICAgICAgICBsZXQgb3JpZyA9IGNlaWxlZERhdGUuZ2V0TWludXRlcygpO1xyXG4gICAgICAgIHdoaWxlICghdGhpcy5vcHRpb25zLmlzTWludXRlU2VsZWN0YWJsZShjZWlsZWREYXRlKSkge1xyXG4gICAgICAgICAgICBpZiAodXBwZXIgPiA1OSkgdXBwZXIgPSAwO1xyXG4gICAgICAgICAgICBjZWlsZWREYXRlLnNldE1pbnV0ZXModXBwZXIrKyk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaXNNaW51dGVTZWxlY3RhYmxlKGNlaWxlZERhdGUpKSBicmVhaztcclxuICAgICAgICAgICAgaWYgKHVwcGVyID09PSBvcmlnKSBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNlaWxlZERhdGU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBmbG9vcihkYXRlOkRhdGUpOkRhdGUge1xyXG4gICAgICAgIGxldCBmbG9vcmVkRGF0ZSA9IG5ldyBEYXRlKGRhdGUudmFsdWVPZigpKTtcclxuICAgICAgICBsZXQgbG93ZXIgPSBmbG9vcmVkRGF0ZS5nZXRNaW51dGVzKCkgLSAxO1xyXG4gICAgICAgIGxldCBvcmlnID0gZmxvb3JlZERhdGUuZ2V0TWludXRlcygpO1xyXG4gICAgICAgIHdoaWxlICghdGhpcy5vcHRpb25zLmlzTWludXRlU2VsZWN0YWJsZShmbG9vcmVkRGF0ZSkpIHtcclxuICAgICAgICAgICAgaWYgKGxvd2VyIDwgMCkgbG93ZXIgPSA1OTtcclxuICAgICAgICAgICAgZmxvb3JlZERhdGUuc2V0TWludXRlcyhsb3dlci0tKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5pc01pbnV0ZVNlbGVjdGFibGUoZmxvb3JlZERhdGUpKSBicmVhaztcclxuICAgICAgICAgICAgaWYgKGxvd2VyID09PSBvcmlnKSBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZsb29yZWREYXRlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgcm91bmQoZGF0ZTpEYXRlKTpEYXRlIHtcclxuICAgICAgICBsZXQgcm91bmRlZERhdGUgPSBuZXcgRGF0ZShkYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgbGV0IGxvd2VyID0gcm91bmRlZERhdGUuZ2V0TWludXRlcygpIC0gMTtcclxuICAgICAgICBsZXQgdXBwZXIgPSByb3VuZGVkRGF0ZS5nZXRNaW51dGVzKCkgKyAxO1xyXG4gICAgICAgIHdoaWxlICghdGhpcy5vcHRpb25zLmlzTWludXRlU2VsZWN0YWJsZShyb3VuZGVkRGF0ZSkpIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChsb3dlciA8IDApIGxvd2VyID0gNTk7XHJcbiAgICAgICAgICAgIHJvdW5kZWREYXRlLnNldE1pbnV0ZXMobG93ZXItLSk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaXNNaW51dGVTZWxlY3RhYmxlKHJvdW5kZWREYXRlKSkgYnJlYWs7XHJcbiAgICAgICAgICAgIGlmIChsb3dlciA9PT0gdXBwZXIpIGJyZWFrO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKHVwcGVyID4gNTkpIHVwcGVyID0gMDtcclxuICAgICAgICAgICAgcm91bmRlZERhdGUuc2V0TWludXRlcyh1cHBlcisrKTtcclxuICAgICAgICAgICAgaWYgKGxvd2VyID09PSB1cHBlcikgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByb3VuZGVkRGF0ZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGdldEJ1YmJsZVRleHQobWludXRlcz86bnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKG1pbnV0ZXMgPT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICBtaW51dGVzID0gdGhpcy5yb3RhdGlvblRvVGltZSh0aGlzLnJvdGF0aW9uKTsgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBkID0gbmV3IERhdGUodGhpcy5zZWxlY3RlZERhdGUudmFsdWVPZigpKTtcclxuICAgICAgICBkLnNldE1pbnV0ZXMobWludXRlcyk7XHJcbiAgICAgICAgZCA9IHRoaXMucm91bmQoZCk7XHJcbiAgICAgICAgbWludXRlcyA9IGQuZ2V0TWludXRlcygpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiB0aGlzLnBhZChtaW51dGVzKSsnbSc7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBnZXRFbGVtZW50RGF0ZShlbDpFbGVtZW50KSB7XHJcbiAgICAgICAgbGV0IGQgPSBuZXcgRGF0ZShlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpO1xyXG4gICAgICAgIGxldCB5ZWFyID0gZC5nZXRGdWxsWWVhcigpO1xyXG4gICAgICAgIGxldCBtb250aCA9IGQuZ2V0TW9udGgoKTtcclxuICAgICAgICBsZXQgZGF0ZU9mTW9udGggPSBkLmdldERhdGUoKTtcclxuICAgICAgICBsZXQgaG91cnMgPSBkLmdldEhvdXJzKCk7XHJcbiAgICAgICAgbGV0IG1pbnV0ZXMgPSBkLmdldE1pbnV0ZXMoKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgbmV3RGF0ZSA9IG5ldyBEYXRlKHRoaXMuc2VsZWN0ZWREYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgbmV3RGF0ZS5zZXRGdWxsWWVhcih5ZWFyKTtcclxuICAgICAgICBuZXdEYXRlLnNldE1vbnRoKG1vbnRoKTtcclxuICAgICAgICBpZiAobmV3RGF0ZS5nZXRNb250aCgpICE9PSBtb250aCkge1xyXG4gICAgICAgICAgICBuZXdEYXRlLnNldERhdGUoMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG5ld0RhdGUuc2V0RGF0ZShkYXRlT2ZNb250aCk7XHJcbiAgICAgICAgbmV3RGF0ZS5zZXRIb3Vycyhob3Vycyk7XHJcbiAgICAgICAgbmV3RGF0ZS5zZXRNaW51dGVzKG1pbnV0ZXMpO1xyXG4gICAgICAgIHJldHVybiBuZXdEYXRlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgcm90YXRpb25Ub1RpbWUocjpudW1iZXIpIHtcclxuICAgICAgICB3aGlsZSAociA+IE1hdGguUEkpIHIgLT0gMipNYXRoLlBJO1xyXG4gICAgICAgIHdoaWxlIChyIDwgLU1hdGguUEkpIHIgKz0gMipNYXRoLlBJO1xyXG4gICAgICAgIGxldCB0ID0gKHIgLyBNYXRoLlBJICogMzApICsgMzA7XHJcbiAgICAgICAgcmV0dXJuIHQgPj0gNTkuNSA/IDAgOiBNYXRoLnJvdW5kKHQpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgdGltZVRvUm90YXRpb24odDpudW1iZXIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5ub3JtYWxpemVSb3RhdGlvbigodCArIDMwKSAvIDMwICogTWF0aC5QSSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBjcmVhdGUoZGF0ZTpEYXRlLCB0cmFuc2l0aW9uOlRyYW5zaXRpb24pIHtcclxuICAgICAgICB0aGlzLm1pbiA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCBkYXRlLmdldERhdGUoKSwgZGF0ZS5nZXRIb3VycygpKTtcclxuICAgICAgICB0aGlzLm1heCA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCBkYXRlLmdldERhdGUoKSwgZGF0ZS5nZXRIb3VycygpICsgMSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGl0ZXJhdG9yID0gbmV3IERhdGUodGhpcy5taW4udmFsdWVPZigpKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnBpY2tlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1waWNrZXInKTtcclxuICAgICAgICB0aGlzLnBpY2tlci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tbWludXRlLXBpY2tlcicpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbkluKHRyYW5zaXRpb24sIHRoaXMucGlja2VyKTtcclxuICAgICAgICBcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEyOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHRpY2sgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tdGljaycpO1xyXG4gICAgICAgICAgICBsZXQgdGlja0xhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpY2stbGFiZWwnKTtcclxuICAgICAgICAgICAgdGlja0xhYmVsLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1taW51dGUtZWxlbWVudCcpO1xyXG4gICAgICAgICAgICBsZXQgdGlja0xhYmVsQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpY2stbGFiZWwtY29udGFpbmVyJyk7XHJcbiAgICAgICAgICAgIGxldCByID0gaSAqIE1hdGguUEkvNiArIE1hdGguUEk7XHJcbiAgICAgICAgICAgIHRpY2tMYWJlbENvbnRhaW5lci5hcHBlbmRDaGlsZCh0aWNrTGFiZWwpO1xyXG4gICAgICAgICAgICB0aWNrLmFwcGVuZENoaWxkKHRpY2tMYWJlbENvbnRhaW5lcik7XHJcbiAgICAgICAgICAgIHRpY2suc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZSgke3J9cmFkKWA7XHJcbiAgICAgICAgICAgIHRpY2tMYWJlbENvbnRhaW5lci5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlKCR7MipNYXRoLlBJIC0gcn1yYWQpYDtcclxuICAgICAgICAgICAgdGlja0xhYmVsLnNldEF0dHJpYnV0ZSgnZGF0aXVtLWNsb2NrLXBvcycsIGkudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgZCA9IG5ldyBEYXRlKGRhdGUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBtaW51dGVzID0gdGhpcy5yb3RhdGlvblRvVGltZShyKTtcclxuICAgICAgICAgICAgZC5zZXRNaW51dGVzKG1pbnV0ZXMpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGlja0xhYmVsLnNldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnLCBkLnRvSVNPU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICB0aGlzLnBpY2tlci5hcHBlbmRDaGlsZCh0aWNrKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5taW51dGVIYW5kID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLW1pbnV0ZS1oYW5kJyk7XHJcbiAgICAgICAgdGhpcy5ob3VySGFuZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1ob3VyLWhhbmQnKTtcclxuICAgICAgICB0aGlzLnRpbWVEcmFnQXJtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpbWUtZHJhZy1hcm0nKTtcclxuICAgICAgICB0aGlzLnRpbWVEcmFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpbWUtZHJhZycpO1xyXG4gICAgICAgIHRoaXMudGltZURyYWcuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLW1pbnV0ZS1kcmFnJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy50aW1lRHJhZy5zZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJywgZGF0ZS50b0lTT1N0cmluZygpKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnRpbWVEcmFnQXJtLmFwcGVuZENoaWxkKHRoaXMudGltZURyYWcpO1xyXG4gICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKHRoaXMudGltZURyYWdBcm0pO1xyXG4gICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKHRoaXMuaG91ckhhbmQpO1xyXG4gICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKHRoaXMubWludXRlSGFuZCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5hdHRhY2goKTtcclxuICAgICAgICB0aGlzLnNldFNlbGVjdGVkRGF0ZSh0aGlzLnNlbGVjdGVkRGF0ZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCB1cGRhdGVMYWJlbHMoZGF0ZTpEYXRlLCBmb3JjZVVwZGF0ZTpib29sZWFuID0gZmFsc2UpIHtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgbGFiZWxzID0gdGhpcy5waWNrZXIucXVlcnlTZWxlY3RvckFsbCgnW2RhdGl1bS1jbG9jay1wb3NdJyk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsYWJlbHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGxhYmVsID0gbGFiZWxzLml0ZW0oaSk7XHJcbiAgICAgICAgICAgIGxldCByID0gTWF0aC5QSSpwYXJzZUludChsYWJlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1jbG9jay1wb3MnKSwgMTApLzYtMypNYXRoLlBJO1xyXG4gICAgICAgICAgICBsZXQgdGltZSA9IHRoaXMucm90YXRpb25Ub1RpbWUocik7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgZCA9IG5ldyBEYXRlKGxhYmVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsYWJlbC5zZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJywgZC50b0lTT1N0cmluZygpKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaXNNaW51dGVTZWxlY3RhYmxlKGQpKSB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbC5jbGFzc0xpc3QucmVtb3ZlKCdkYXRpdW0taW5hY3RpdmUnKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1pbmFjdGl2ZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsYWJlbC5pbm5lckhUTUwgPSB0aGlzLnBhZCh0aW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB1cGRhdGVPcHRpb25zKG9wdGlvbnM6SU9wdGlvbnMpIHtcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgcmV0dXJuIExldmVsLk1JTlVURTtcclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJQaWNrZXIudHNcIiAvPlxyXG5cclxuY2xhc3MgTW9udGhQaWNrZXIgZXh0ZW5kcyBQaWNrZXIgaW1wbGVtZW50cyBJUGlja2VyIHtcclxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6SFRNTEVsZW1lbnQsIGNvbnRhaW5lcjpIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIHN1cGVyKGVsZW1lbnQsIGNvbnRhaW5lcik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGlzdGVuLnRhcChjb250YWluZXIsICdkYXRpdW0tbW9udGgtZWxlbWVudFtkYXRpdW0tZGF0YV0nLCAoZSkgPT4ge1xyXG4gICAgICAgICAgIGxldCBlbDpFbGVtZW50ID0gPEVsZW1lbnQ+ZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xyXG4gICAgICAgICAgIGxldCB5ZWFyID0gbmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKS5nZXRGdWxsWWVhcigpO1xyXG4gICAgICAgICAgIGxldCBtb250aCA9IG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSkuZ2V0TW9udGgoKTtcclxuICAgICAgICAgICBcclxuICAgICAgICAgICBsZXQgZGF0ZSA9IG5ldyBEYXRlKHRoaXMuc2VsZWN0ZWREYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgICAgZGF0ZS5zZXRGdWxsWWVhcih5ZWFyKTtcclxuICAgICAgICAgICBkYXRlLnNldE1vbnRoKG1vbnRoKTtcclxuICAgICAgICAgICBpZiAoZGF0ZS5nZXRNb250aCgpICE9PSBtb250aCkge1xyXG4gICAgICAgICAgICAgICBkYXRlLnNldERhdGUoMCk7XHJcbiAgICAgICAgICAgfVxyXG4gICAgICAgICAgIFxyXG4gICAgICAgICAgIHRyaWdnZXIuem9vbUluKGVsZW1lbnQsIHtcclxuICAgICAgICAgICAgICAgZGF0ZTogZGF0ZSxcclxuICAgICAgICAgICAgICAgY3VycmVudExldmVsOiBMZXZlbC5NT05USFxyXG4gICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi5kb3duKGNvbnRhaW5lciwgJ2RhdGl1bS1tb250aC1lbGVtZW50JywgKGUpID0+IHtcclxuICAgICAgICAgICAgbGV0IGVsOkhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PihlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQpO1xyXG4gICAgICAgICAgICBsZXQgdGV4dCA9IHRoaXMuZ2V0U2hvcnRNb250aHMoKVtuZXcgRGF0ZShlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpLmdldE1vbnRoKCldO1xyXG4gICAgICAgICAgICBsZXQgb2Zmc2V0ID0gdGhpcy5nZXRPZmZzZXQoZWwpO1xyXG4gICAgICAgICAgICB0cmlnZ2VyLm9wZW5CdWJibGUoZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgeDogb2Zmc2V0LnggKyAzNSxcclxuICAgICAgICAgICAgICAgIHk6IG9mZnNldC55ICsgMTUsXHJcbiAgICAgICAgICAgICAgICB0ZXh0OiB0ZXh0XHJcbiAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBjcmVhdGUoZGF0ZTpEYXRlLCB0cmFuc2l0aW9uOlRyYW5zaXRpb24pIHtcclxuICAgICAgICB0aGlzLm1pbiA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgMCk7XHJcbiAgICAgICAgdGhpcy5tYXggPSBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCkgKyAxLCAwKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgaXRlcmF0b3IgPSBuZXcgRGF0ZSh0aGlzLm1pbi52YWx1ZU9mKCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMucGlja2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXBpY2tlcicpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbkluKHRyYW5zaXRpb24sIHRoaXMucGlja2VyKTtcclxuICAgICAgICBcclxuICAgICAgICBkbyB7ICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBtb250aEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tbW9udGgtZWxlbWVudCcpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbW9udGhFbGVtZW50LmlubmVySFRNTCA9IHRoaXMuZ2V0U2hvcnRNb250aHMoKVtpdGVyYXRvci5nZXRNb250aCgpXTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaXNNb250aFNlbGVjdGFibGUoaXRlcmF0b3IpKSB7XHJcbiAgICAgICAgICAgICAgICBtb250aEVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScsIGl0ZXJhdG9yLnRvSVNPU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLnBpY2tlci5hcHBlbmRDaGlsZChtb250aEVsZW1lbnQpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaXRlcmF0b3Iuc2V0TW9udGgoaXRlcmF0b3IuZ2V0TW9udGgoKSArIDEpO1xyXG4gICAgICAgIH0gd2hpbGUgKGl0ZXJhdG9yLnZhbHVlT2YoKSA8IHRoaXMubWF4LnZhbHVlT2YoKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5hdHRhY2goKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnNldFNlbGVjdGVkRGF0ZSh0aGlzLnNlbGVjdGVkRGF0ZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBzZXRTZWxlY3RlZERhdGUoc2VsZWN0ZWREYXRlOkRhdGUpIHtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkRGF0ZSA9IG5ldyBEYXRlKHNlbGVjdGVkRGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBtb250aEVsZW1lbnRzID0gdGhpcy5waWNrZXJDb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnZGF0aXVtLW1vbnRoLWVsZW1lbnQnKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1vbnRoRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGVsID0gbW9udGhFbGVtZW50cy5pdGVtKGkpO1xyXG4gICAgICAgICAgICBsZXQgZGF0ZSA9IG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSk7XHJcbiAgICAgICAgICAgIGlmIChkYXRlLmdldEZ1bGxZZWFyKCkgPT09IHNlbGVjdGVkRGF0ZS5nZXRGdWxsWWVhcigpICYmXHJcbiAgICAgICAgICAgICAgICBkYXRlLmdldE1vbnRoKCkgPT09IHNlbGVjdGVkRGF0ZS5nZXRNb250aCgpKSB7XHJcbiAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1zZWxlY3RlZCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0SGVpZ2h0KCkge1xyXG4gICAgICAgIHJldHVybiAxODA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICByZXR1cm4gTGV2ZWwuTU9OVEg7XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiVGltZVBpY2tlci50c1wiIC8+XHJcblxyXG5jbGFzcyBTZWNvbmRQaWNrZXIgZXh0ZW5kcyBUaW1lUGlja2VyIGltcGxlbWVudHMgSVRpbWVQaWNrZXIge1xyXG4gICAgY29uc3RydWN0b3IoZWxlbWVudDpIVE1MRWxlbWVudCwgY29udGFpbmVyOkhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgc3VwZXIoZWxlbWVudCwgY29udGFpbmVyKTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4uZHJhZyhjb250YWluZXIsICcuZGF0aXVtLXNlY29uZC1kcmFnJywge1xyXG4gICAgICAgICAgICBkcmFnU3RhcnQ6IChlKSA9PiB0aGlzLmRyYWdTdGFydChlKSxcclxuICAgICAgICAgICAgZHJhZ01vdmU6IChlKSA9PiB0aGlzLmRyYWdNb3ZlKGUpLFxyXG4gICAgICAgICAgICBkcmFnRW5kOiAoZSkgPT4gdGhpcy5kcmFnRW5kKGUpLCBcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4udGFwKGNvbnRhaW5lciwgJy5kYXRpdW0tc2Vjb25kLWVsZW1lbnQnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZWw6RWxlbWVudCA9IDxFbGVtZW50PmUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRyaWdnZXIuem9vbUluKHRoaXMuZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgZGF0ZTogdGhpcy5nZXRFbGVtZW50RGF0ZShlbCksXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50TGV2ZWw6IExldmVsLlNFQ09ORFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4uZG93bihjb250YWluZXIsICcuZGF0aXVtLXNlY29uZC1lbGVtZW50JywgKGUpID0+IHtcclxuICAgICAgICAgICAgbGV0IGVsOkhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PihlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQpO1xyXG4gICAgICAgICAgICBsZXQgc2Vjb25kcyA9IG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSkuZ2V0U2Vjb25kcygpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IG9mZnNldCA9IHRoaXMuZ2V0T2Zmc2V0KGVsKTtcclxuICAgICAgICAgICAgdHJpZ2dlci5vcGVuQnViYmxlKGVsZW1lbnQsIHtcclxuICAgICAgICAgICAgICAgIHg6IG9mZnNldC54ICsgMjUsXHJcbiAgICAgICAgICAgICAgICB5OiBvZmZzZXQueSArIDMsXHJcbiAgICAgICAgICAgICAgICB0ZXh0OiB0aGlzLmdldEJ1YmJsZVRleHQoc2Vjb25kcylcclxuICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGNlaWwoZGF0ZTpEYXRlKTpEYXRlIHtcclxuICAgICAgICBsZXQgY2VpbGVkRGF0ZSA9IG5ldyBEYXRlKGRhdGUudmFsdWVPZigpKTtcclxuICAgICAgICBsZXQgdXBwZXIgPSBjZWlsZWREYXRlLmdldFNlY29uZHMoKSArIDE7XHJcbiAgICAgICAgbGV0IG9yaWcgPSBjZWlsZWREYXRlLmdldFNlY29uZHMoKTtcclxuICAgICAgICB3aGlsZSAoIXRoaXMub3B0aW9ucy5pc1NlY29uZFNlbGVjdGFibGUoY2VpbGVkRGF0ZSkpIHtcclxuICAgICAgICAgICAgaWYgKHVwcGVyID4gNTkpIHVwcGVyID0gMDtcclxuICAgICAgICAgICAgY2VpbGVkRGF0ZS5zZXRTZWNvbmRzKHVwcGVyKyspO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmlzU2Vjb25kU2VsZWN0YWJsZShjZWlsZWREYXRlKSkgYnJlYWs7XHJcbiAgICAgICAgICAgIGlmICh1cHBlciA9PT0gb3JpZykgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjZWlsZWREYXRlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgZmxvb3IoZGF0ZTpEYXRlKTpEYXRlIHtcclxuICAgICAgICBsZXQgZmxvb3JlZERhdGUgPSBuZXcgRGF0ZShkYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgbGV0IGxvd2VyID0gZmxvb3JlZERhdGUuZ2V0U2Vjb25kcygpIC0gMTtcclxuICAgICAgICBsZXQgb3JpZyA9IGZsb29yZWREYXRlLmdldFNlY29uZHMoKTtcclxuICAgICAgICB3aGlsZSAoIXRoaXMub3B0aW9ucy5pc1NlY29uZFNlbGVjdGFibGUoZmxvb3JlZERhdGUpKSB7XHJcbiAgICAgICAgICAgIGlmIChsb3dlciA8IDApIGxvd2VyID0gNTk7XHJcbiAgICAgICAgICAgIGZsb29yZWREYXRlLnNldFNlY29uZHMobG93ZXItLSk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaXNTZWNvbmRTZWxlY3RhYmxlKGZsb29yZWREYXRlKSkgYnJlYWs7XHJcbiAgICAgICAgICAgIGlmIChsb3dlciA9PT0gb3JpZykgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmbG9vcmVkRGF0ZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIHJvdW5kKGRhdGU6RGF0ZSk6RGF0ZSB7XHJcbiAgICAgICAgbGV0IHJvdW5kZWREYXRlID0gbmV3IERhdGUoZGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgIGxldCBsb3dlciA9IHJvdW5kZWREYXRlLmdldFNlY29uZHMoKSAtIDE7XHJcbiAgICAgICAgbGV0IHVwcGVyID0gcm91bmRlZERhdGUuZ2V0U2Vjb25kcygpICsgMTtcclxuICAgICAgICB3aGlsZSAoIXRoaXMub3B0aW9ucy5pc1NlY29uZFNlbGVjdGFibGUocm91bmRlZERhdGUpKSB7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAobG93ZXIgPCAwKSBsb3dlciA9IDU5O1xyXG4gICAgICAgICAgICByb3VuZGVkRGF0ZS5zZXRTZWNvbmRzKGxvd2VyLS0pO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmlzU2Vjb25kU2VsZWN0YWJsZShyb3VuZGVkRGF0ZSkpIGJyZWFrO1xyXG4gICAgICAgICAgICBpZiAobG93ZXIgPT09IHVwcGVyKSBicmVhaztcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICh1cHBlciA+IDU5KSB1cHBlciA9IDA7XHJcbiAgICAgICAgICAgIHJvdW5kZWREYXRlLnNldFNlY29uZHModXBwZXIrKyk7XHJcbiAgICAgICAgICAgIGlmIChsb3dlciA9PT0gdXBwZXIpIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcm91bmRlZERhdGU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBnZXRCdWJibGVUZXh0KHNlY29uZHM/Om51bWJlcikge1xyXG4gICAgICAgIGlmIChzZWNvbmRzID09PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgc2Vjb25kcyA9IHRoaXMucm90YXRpb25Ub1RpbWUodGhpcy5yb3RhdGlvbik7IFxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBsZXQgZCA9IG5ldyBEYXRlKHRoaXMuc2VsZWN0ZWREYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgZC5zZXRTZWNvbmRzKHNlY29uZHMpO1xyXG4gICAgICAgIGQgPSB0aGlzLnJvdW5kKGQpO1xyXG4gICAgICAgIHNlY29uZHMgPSBkLmdldFNlY29uZHMoKTtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gdGhpcy5wYWQoc2Vjb25kcykrJ3MnO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgZ2V0RWxlbWVudERhdGUoZWw6RWxlbWVudCkge1xyXG4gICAgICAgIGxldCBkID0gbmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKTtcclxuICAgICAgICBsZXQgeWVhciA9IGQuZ2V0RnVsbFllYXIoKTtcclxuICAgICAgICBsZXQgbW9udGggPSBkLmdldE1vbnRoKCk7XHJcbiAgICAgICAgbGV0IGRhdGVPZk1vbnRoID0gZC5nZXREYXRlKCk7XHJcbiAgICAgICAgbGV0IGhvdXJzID0gZC5nZXRIb3VycygpO1xyXG4gICAgICAgIGxldCBtaW51dGVzID0gZC5nZXRNaW51dGVzKCk7XHJcbiAgICAgICAgbGV0IHNlY29uZHMgPSBkLmdldFNlY29uZHMoKTtcclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICBsZXQgbmV3RGF0ZSA9IG5ldyBEYXRlKHRoaXMuc2VsZWN0ZWREYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgbmV3RGF0ZS5zZXRGdWxsWWVhcih5ZWFyKTtcclxuICAgICAgICBuZXdEYXRlLnNldE1vbnRoKG1vbnRoKTtcclxuICAgICAgICBpZiAobmV3RGF0ZS5nZXRNb250aCgpICE9PSBtb250aCkge1xyXG4gICAgICAgICAgICBuZXdEYXRlLnNldERhdGUoMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG5ld0RhdGUuc2V0RGF0ZShkYXRlT2ZNb250aCk7XHJcbiAgICAgICAgbmV3RGF0ZS5zZXRIb3Vycyhob3Vycyk7XHJcbiAgICAgICAgbmV3RGF0ZS5zZXRNaW51dGVzKG1pbnV0ZXMpO1xyXG4gICAgICAgIG5ld0RhdGUuc2V0U2Vjb25kcyhzZWNvbmRzKTtcclxuICAgICAgICByZXR1cm4gbmV3RGF0ZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIHJvdGF0aW9uVG9UaW1lKHI6bnVtYmVyKSB7XHJcbiAgICAgICAgd2hpbGUgKHIgPiBNYXRoLlBJKSByIC09IDIqTWF0aC5QSTtcclxuICAgICAgICB3aGlsZSAociA8IC1NYXRoLlBJKSByICs9IDIqTWF0aC5QSTtcclxuICAgICAgICBsZXQgdCA9IChyIC8gTWF0aC5QSSAqIDMwKSArIDMwO1xyXG4gICAgICAgIHJldHVybiB0ID49IDU5LjUgPyAwIDogTWF0aC5yb3VuZCh0KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIHRpbWVUb1JvdGF0aW9uKHQ6bnVtYmVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubm9ybWFsaXplUm90YXRpb24oKHQgKyAzMCkgLyAzMCAqIE1hdGguUEkpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgY3JlYXRlKGRhdGU6RGF0ZSwgdHJhbnNpdGlvbjpUcmFuc2l0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5taW4gPSBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSwgZGF0ZS5nZXREYXRlKCksIGRhdGUuZ2V0SG91cnMoKSwgZGF0ZS5nZXRNaW51dGVzKCkpO1xyXG4gICAgICAgIHRoaXMubWF4ID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIGRhdGUuZ2V0RGF0ZSgpLCBkYXRlLmdldEhvdXJzKCksIGRhdGUuZ2V0TWludXRlcygpICsgMSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGl0ZXJhdG9yID0gbmV3IERhdGUodGhpcy5taW4udmFsdWVPZigpKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnBpY2tlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1waWNrZXInKTtcclxuICAgICAgICB0aGlzLnBpY2tlci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tc2Vjb25kLXBpY2tlcicpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbkluKHRyYW5zaXRpb24sIHRoaXMucGlja2VyKTtcclxuICAgICAgICBcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEyOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHRpY2sgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tdGljaycpO1xyXG4gICAgICAgICAgICBsZXQgdGlja0xhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpY2stbGFiZWwnKTtcclxuICAgICAgICAgICAgdGlja0xhYmVsLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1zZWNvbmQtZWxlbWVudCcpO1xyXG4gICAgICAgICAgICBsZXQgdGlja0xhYmVsQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpY2stbGFiZWwtY29udGFpbmVyJyk7XHJcbiAgICAgICAgICAgIGxldCByID0gaSAqIE1hdGguUEkvNiArIE1hdGguUEk7XHJcbiAgICAgICAgICAgIHRpY2tMYWJlbENvbnRhaW5lci5hcHBlbmRDaGlsZCh0aWNrTGFiZWwpO1xyXG4gICAgICAgICAgICB0aWNrLmFwcGVuZENoaWxkKHRpY2tMYWJlbENvbnRhaW5lcik7XHJcbiAgICAgICAgICAgIHRpY2suc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZSgke3J9cmFkKWA7XHJcbiAgICAgICAgICAgIHRpY2tMYWJlbENvbnRhaW5lci5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlKCR7MipNYXRoLlBJIC0gcn1yYWQpYDtcclxuICAgICAgICAgICAgdGlja0xhYmVsLnNldEF0dHJpYnV0ZSgnZGF0aXVtLWNsb2NrLXBvcycsIGkudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgZCA9IG5ldyBEYXRlKGRhdGUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBzZWNvbmRzID0gdGhpcy5yb3RhdGlvblRvVGltZShyKTtcclxuICAgICAgICAgICAgZC5zZXRTZWNvbmRzKHNlY29uZHMpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGlja0xhYmVsLnNldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnLCBkLnRvSVNPU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICB0aGlzLnBpY2tlci5hcHBlbmRDaGlsZCh0aWNrKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5zZWNvbmRIYW5kID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXNlY29uZC1oYW5kJyk7XHJcbiAgICAgICAgdGhpcy5taW51dGVIYW5kID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLW1pbnV0ZS1oYW5kJyk7XHJcbiAgICAgICAgdGhpcy5ob3VySGFuZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1ob3VyLWhhbmQnKTtcclxuICAgICAgICB0aGlzLnRpbWVEcmFnQXJtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpbWUtZHJhZy1hcm0nKTtcclxuICAgICAgICB0aGlzLnRpbWVEcmFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpbWUtZHJhZycpO1xyXG4gICAgICAgIHRoaXMudGltZURyYWcuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLXNlY29uZC1kcmFnJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy50aW1lRHJhZy5zZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJywgZGF0ZS50b0lTT1N0cmluZygpKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnRpbWVEcmFnQXJtLmFwcGVuZENoaWxkKHRoaXMudGltZURyYWcpO1xyXG4gICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKHRoaXMudGltZURyYWdBcm0pO1xyXG4gICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKHRoaXMuaG91ckhhbmQpO1xyXG4gICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKHRoaXMubWludXRlSGFuZCk7XHJcbiAgICAgICAgdGhpcy5waWNrZXIuYXBwZW5kQ2hpbGQodGhpcy5zZWNvbmRIYW5kKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmF0dGFjaCgpO1xyXG4gICAgICAgIHRoaXMuc2V0U2VsZWN0ZWREYXRlKHRoaXMuc2VsZWN0ZWREYXRlKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIHVwZGF0ZUxhYmVscyhkYXRlOkRhdGUsIGZvcmNlVXBkYXRlOmJvb2xlYW4gPSBmYWxzZSkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBsYWJlbHMgPSB0aGlzLnBpY2tlci5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0aXVtLWNsb2NrLXBvc10nKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxhYmVscy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgbGFiZWwgPSBsYWJlbHMuaXRlbShpKTtcclxuICAgICAgICAgICAgbGV0IHIgPSBNYXRoLlBJKnBhcnNlSW50KGxhYmVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWNsb2NrLXBvcycpLCAxMCkvNi0zKk1hdGguUEk7XHJcbiAgICAgICAgICAgIGxldCB0aW1lID0gdGhpcy5yb3RhdGlvblRvVGltZShyKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBkID0gbmV3IERhdGUobGFiZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxhYmVsLnNldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnLCBkLnRvSVNPU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IHN0YXJ0ID0gbmV3IERhdGUoZC5nZXRGdWxsWWVhcigpLCBkLmdldE1vbnRoKCksIGQuZ2V0RGF0ZSgpLCBkLmdldEhvdXJzKCksIGQuZ2V0TWludXRlcygpLCBkLmdldFNlY29uZHMoKSk7XHJcbiAgICAgICAgICAgIGxldCBlbmQgPSBuZXcgRGF0ZShkLmdldEZ1bGxZZWFyKCksIGQuZ2V0TW9udGgoKSwgZC5nZXREYXRlKCksIGQuZ2V0SG91cnMoKSwgZC5nZXRNaW51dGVzKCksIGQuZ2V0U2Vjb25kcygpICsgMSk7XHJcbiAgICAgICAgICAgIGlmIChlbmQudmFsdWVPZigpID4gdGhpcy5vcHRpb25zLm1pbkRhdGUudmFsdWVPZigpICYmXHJcbiAgICAgICAgICAgICAgICBzdGFydC52YWx1ZU9mKCkgPCB0aGlzLm9wdGlvbnMubWF4RGF0ZS52YWx1ZU9mKCkgJiZcclxuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5pc1NlY29uZFNlbGVjdGFibGUoZCkpIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1pbmFjdGl2ZScpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGFiZWwuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLWluYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxhYmVsLmlubmVySFRNTCA9IHRoaXMucGFkKHRpbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHVwZGF0ZU9wdGlvbnMob3B0aW9uczpJT3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICByZXR1cm4gTGV2ZWwuU0VDT05EO1xyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIlBpY2tlci50c1wiIC8+XHJcblxyXG5jbGFzcyBZZWFyUGlja2VyIGV4dGVuZHMgUGlja2VyIGltcGxlbWVudHMgSVBpY2tlciB7XHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OkhUTUxFbGVtZW50LCBjb250YWluZXI6SFRNTEVsZW1lbnQpIHtcclxuICAgICAgICBzdXBlcihlbGVtZW50LCBjb250YWluZXIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi50YXAoY29udGFpbmVyLCAnZGF0aXVtLXllYXItZWxlbWVudFtkYXRpdW0tZGF0YV0nLCAoZSkgPT4ge1xyXG4gICAgICAgICAgIGxldCBlbDpFbGVtZW50ID0gPEVsZW1lbnQ+ZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xyXG4gICAgICAgICAgIGxldCB5ZWFyID0gbmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKS5nZXRGdWxsWWVhcigpO1xyXG4gICAgICAgICAgIFxyXG4gICAgICAgICAgIGxldCBkYXRlID0gbmV3IERhdGUodGhpcy5zZWxlY3RlZERhdGUudmFsdWVPZigpKTtcclxuICAgICAgICAgICBkYXRlLnNldEZ1bGxZZWFyKHllYXIpO1xyXG4gICAgICAgICAgIFxyXG4gICAgICAgICAgIHRyaWdnZXIuem9vbUluKGVsZW1lbnQsIHtcclxuICAgICAgICAgICAgICAgZGF0ZTogZGF0ZSxcclxuICAgICAgICAgICAgICAgY3VycmVudExldmVsOiBMZXZlbC5ZRUFSXHJcbiAgICAgICAgICAgfSlcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4uZG93bihjb250YWluZXIsICdkYXRpdW0teWVhci1lbGVtZW50JywgKGUpID0+IHtcclxuICAgICAgICAgICAgbGV0IGVsOkhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PihlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQpO1xyXG4gICAgICAgICAgICBsZXQgdGV4dCA9IG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSkuZ2V0RnVsbFllYXIoKS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICBsZXQgb2Zmc2V0ID0gdGhpcy5nZXRPZmZzZXQoZWwpO1xyXG4gICAgICAgICAgICB0cmlnZ2VyLm9wZW5CdWJibGUoZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgeDogb2Zmc2V0LnggKyAzNSxcclxuICAgICAgICAgICAgICAgIHk6IG9mZnNldC55ICsgMTUsXHJcbiAgICAgICAgICAgICAgICB0ZXh0OiB0ZXh0XHJcbiAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBjcmVhdGUoZGF0ZTpEYXRlLCB0cmFuc2l0aW9uOlRyYW5zaXRpb24pIHtcclxuICAgICAgICB0aGlzLm1pbiA9IG5ldyBEYXRlKE1hdGguZmxvb3IoZGF0ZS5nZXRGdWxsWWVhcigpLzEwKSoxMCwgMCk7XHJcbiAgICAgICAgdGhpcy5tYXggPSBuZXcgRGF0ZShNYXRoLmNlaWwoZGF0ZS5nZXRGdWxsWWVhcigpLzEwKSoxMCwgMCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMubWluLnZhbHVlT2YoKSA9PT0gdGhpcy5tYXgudmFsdWVPZigpKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWF4LnNldEZ1bGxZZWFyKHRoaXMubWF4LmdldEZ1bGxZZWFyKCkgKyAxMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBpdGVyYXRvciA9IG5ldyBEYXRlKHRoaXMubWluLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5waWNrZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tcGlja2VyJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uSW4odHJhbnNpdGlvbiwgdGhpcy5waWNrZXIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCB5ZWFyRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS15ZWFyLWVsZW1lbnQnKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHllYXJFbGVtZW50LmlubmVySFRNTCA9IGl0ZXJhdG9yLmdldEZ1bGxZZWFyKCkudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaXNZZWFyU2VsZWN0YWJsZShpdGVyYXRvcikpIHtcclxuICAgICAgICAgICAgICAgIHllYXJFbGVtZW50LnNldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnLCBpdGVyYXRvci50b0lTT1N0cmluZygpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5waWNrZXIuYXBwZW5kQ2hpbGQoeWVhckVsZW1lbnQpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaXRlcmF0b3Iuc2V0RnVsbFllYXIoaXRlcmF0b3IuZ2V0RnVsbFllYXIoKSArIDEpO1xyXG4gICAgICAgIH0gd2hpbGUgKGl0ZXJhdG9yLnZhbHVlT2YoKSA8PSB0aGlzLm1heC52YWx1ZU9mKCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuYXR0YWNoKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5zZXRTZWxlY3RlZERhdGUodGhpcy5zZWxlY3RlZERhdGUpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgc2V0U2VsZWN0ZWREYXRlKHNlbGVjdGVkRGF0ZTpEYXRlKSB7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZERhdGUgPSBuZXcgRGF0ZShzZWxlY3RlZERhdGUudmFsdWVPZigpKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgeWVhckVsZW1lbnRzID0gdGhpcy5waWNrZXJDb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnZGF0aXVtLXllYXItZWxlbWVudCcpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgeWVhckVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBlbCA9IHllYXJFbGVtZW50cy5pdGVtKGkpO1xyXG4gICAgICAgICAgICBsZXQgZGF0ZSA9IG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSk7XHJcbiAgICAgICAgICAgIGlmIChkYXRlLmdldEZ1bGxZZWFyKCkgPT09IHNlbGVjdGVkRGF0ZS5nZXRGdWxsWWVhcigpKSB7XHJcbiAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1zZWxlY3RlZCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0SGVpZ2h0KCkge1xyXG4gICAgICAgIHJldHVybiAxODA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICByZXR1cm4gTGV2ZWwuWUVBUjtcclxuICAgIH1cclxufSIsInZhciBjc3M9XCJkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0taGVhZGVyLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXItY29udGFpbmVye3dpZHRoOmNhbGMoMTAwJSAtIDE0cHgpO2JveC1zaGFkb3c6MCAzcHggNnB4IHJnYmEoMCwwLDAsLjE2KSwwIDNweCA2cHggcmdiYSgwLDAsMCwuMjMpO292ZXJmbG93OmhpZGRlbn1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tYnViYmxlLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1oZWFkZXIsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci1jb250YWluZXJ7Ym94LXNoYWRvdzowIDNweCA2cHggcmdiYSgwLDAsMCwuMTYpLDAgM3B4IDZweCByZ2JhKDAsMCwwLC4yMyl9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWhlYWRlci13cmFwcGVye292ZXJmbG93OmhpZGRlbjtwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0Oi03cHg7cmlnaHQ6LTdweDt0b3A6LTdweDtoZWlnaHQ6ODdweDtkaXNwbGF5OmJsb2NrO3BvaW50ZXItZXZlbnRzOm5vbmV9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWhlYWRlcntwb3NpdGlvbjpyZWxhdGl2ZTtkaXNwbGF5OmJsb2NrO2hlaWdodDoxMDBweDtiYWNrZ3JvdW5kLWNvbG9yOl9wcmltYXJ5O2JvcmRlci10b3AtbGVmdC1yYWRpdXM6M3B4O2JvcmRlci10b3AtcmlnaHQtcmFkaXVzOjNweDt6LWluZGV4OjE7bWFyZ2luOjdweDtwb2ludGVyLWV2ZW50czphdXRvfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1zcGFuLWxhYmVsLWNvbnRhaW5lcntwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjQwcHg7cmlnaHQ6NDBweDt0b3A6MDtib3R0b206MDtkaXNwbGF5OmJsb2NrO292ZXJmbG93OmhpZGRlbjt0cmFuc2l0aW9uOi4ycyBlYXNlIGFsbDt0cmFuc2Zvcm0tb3JpZ2luOjQwcHggNDBweH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc3Bhbi1sYWJlbHtwb3NpdGlvbjphYnNvbHV0ZTtmb250LXNpemU6MThwdDtjb2xvcjpfcHJpbWFyeV90ZXh0O2ZvbnQtd2VpZ2h0OjcwMDt0cmFuc2Zvcm0tb3JpZ2luOjAgMDt3aGl0ZS1zcGFjZTpub3dyYXA7dHJhbnNpdGlvbjphbGwgLjJzIGVhc2U7dGV4dC10cmFuc2Zvcm06dXBwZXJjYXNlfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS10b3B7dHJhbnNmb3JtOnRyYW5zbGF0ZVkoMTdweCkgc2NhbGUoLjY2KTt3aWR0aDoxNTElO29wYWNpdHk6LjZ9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXNwYW4tbGFiZWwuZGF0aXVtLWJvdHRvbXt0cmFuc2Zvcm06dHJhbnNsYXRlWSgzNnB4KSBzY2FsZSgxKTt3aWR0aDoxMDAlO29wYWNpdHk6MX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc3Bhbi1sYWJlbC5kYXRpdW0tdG9wLmRhdGl1bS1oaWRkZW57dHJhbnNmb3JtOnRyYW5zbGF0ZVkoNXB4KSBzY2FsZSguNCk7b3BhY2l0eTowfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS1ib3R0b20uZGF0aXVtLWhpZGRlbnt0cmFuc2Zvcm06dHJhbnNsYXRlWSg3OHB4KSBzY2FsZSgxLjIpO29wYWNpdHk6MX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc3Bhbi1sYWJlbDphZnRlcntjb250ZW50OicnO2Rpc3BsYXk6aW5saW5lLWJsb2NrO3Bvc2l0aW9uOmFic29sdXRlO21hcmdpbi1sZWZ0OjEwcHg7bWFyZ2luLXRvcDo2cHg7aGVpZ2h0OjE3cHg7d2lkdGg6MTdweDtvcGFjaXR5OjA7dHJhbnNpdGlvbjphbGwgLjJzIGVhc2U7YmFja2dyb3VuZDp1cmwoZGF0YTppbWFnZS9zdmcreG1sO3V0ZjgsJTNDc3ZnJTIweG1sbnMlM0QlMjJodHRwJTNBJTJGJTJGd3d3LnczLm9yZyUyRjIwMDAlMkZzdmclMjIlM0UlM0NnJTIwZmlsbCUzRCUyMl9wcmltYXJ5X3RleHQlMjIlM0UlM0NwYXRoJTIwZCUzRCUyMk0xNyUyMDE1bC0yJTIwMi01LTUlMjAyLTJ6JTIyJTIwZmlsbC1ydWxlJTNEJTIyZXZlbm9kZCUyMiUyRiUzRSUzQ3BhdGglMjBkJTNEJTIyTTclMjAwYTclMjA3JTIwMCUyMDAlMjAwLTclMjA3JTIwNyUyMDclMjAwJTIwMCUyMDAlMjA3JTIwNyUyMDclMjA3JTIwMCUyMDAlMjAwJTIwNy03JTIwNyUyMDclMjAwJTIwMCUyMDAtNy03em0wJTIwMmE1JTIwNSUyMDAlMjAwJTIwMSUyMDUlMjA1JTIwNSUyMDUlMjAwJTIwMCUyMDEtNSUyMDUlMjA1JTIwNSUyMDAlMjAwJTIwMS01LTUlMjA1JTIwNSUyMDAlMjAwJTIwMSUyMDUtNXolMjIlMkYlM0UlM0NwYXRoJTIwZCUzRCUyMk00JTIwNmg2djJINHolMjIlMkYlM0UlM0MlMkZnJTNFJTNDJTJGc3ZnJTNFKX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tYnViYmxlLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1idWJibGUuZGF0aXVtLWJ1YmJsZS12aXNpYmxle3RyYW5zaXRpb24tcHJvcGVydHk6dHJhbnNmb3JtLG9wYWNpdHk7dHJhbnNpdGlvbi10aW1pbmctZnVuY3Rpb246ZWFzZTt0cmFuc2l0aW9uLWR1cmF0aW9uOi4yc31kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc3Bhbi1sYWJlbC5kYXRpdW0tdG9wOmFmdGVye29wYWNpdHk6MX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc3Bhbi1sYWJlbCBkYXRpdW0tdmFyaWFibGV7Y29sb3I6X3ByaW1hcnk7Zm9udC1zaXplOjE0cHQ7cGFkZGluZzowIDRweDttYXJnaW46MCAycHg7dG9wOi0ycHg7cG9zaXRpb246cmVsYXRpdmV9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXNwYW4tbGFiZWwgZGF0aXVtLXZhcmlhYmxlOmJlZm9yZXtjb250ZW50OicnO3Bvc2l0aW9uOmFic29sdXRlO2xlZnQ6MDt0b3A6MDtyaWdodDowO2JvdHRvbTowO2JvcmRlci1yYWRpdXM6NXB4O2JhY2tncm91bmQtY29sb3I6X3ByaW1hcnlfdGV4dDt6LWluZGV4Oi0xO29wYWNpdHk6Ljd9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXNwYW4tbGFiZWwgZGF0aXVtLWxvd2Vye3RleHQtdHJhbnNmb3JtOmxvd2VyY2FzZX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbmV4dCxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcHJldntwb3NpdGlvbjphYnNvbHV0ZTt3aWR0aDo0MHB4O3RvcDowO2JvdHRvbTowO3RyYW5zZm9ybS1vcmlnaW46MjBweCA1MnB4fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1uZXh0OmFmdGVyLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1uZXh0OmJlZm9yZSxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcHJldjphZnRlcixkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcHJldjpiZWZvcmV7Y29udGVudDonJztwb3NpdGlvbjphYnNvbHV0ZTtkaXNwbGF5OmJsb2NrO3dpZHRoOjNweDtoZWlnaHQ6OHB4O2xlZnQ6NTAlO2JhY2tncm91bmQtY29sb3I6X3ByaW1hcnlfdGV4dDt0b3A6NDhweH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbmV4dC5kYXRpdW0tYWN0aXZlLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1wcmV2LmRhdGl1bS1hY3RpdmV7dHJhbnNmb3JtOnNjYWxlKC45KTtvcGFjaXR5Oi45fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1wcmV2e2xlZnQ6MH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcHJldjphZnRlcixkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcHJldjpiZWZvcmV7bWFyZ2luLWxlZnQ6LTNweH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbmV4dHtyaWdodDowfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1wcmV2OmJlZm9yZXt0cmFuc2Zvcm06cm90YXRlKDQ1ZGVnKSB0cmFuc2xhdGVZKC0yLjZweCl9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXByZXY6YWZ0ZXJ7dHJhbnNmb3JtOnJvdGF0ZSgtNDVkZWcpIHRyYW5zbGF0ZVkoMi42cHgpfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1uZXh0OmJlZm9yZXt0cmFuc2Zvcm06cm90YXRlKDQ1ZGVnKSB0cmFuc2xhdGVZKDIuNnB4KX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbmV4dDphZnRlcnt0cmFuc2Zvcm06cm90YXRlKC00NWRlZykgdHJhbnNsYXRlWSgtMi42cHgpfWRhdGl1bS1jb250YWluZXIuX2lke2Rpc3BsYXk6YmxvY2s7cG9zaXRpb246YWJzb2x1dGU7d2lkdGg6MjgwcHg7Zm9udC1mYW1pbHk6Um9ib3RvLEFyaWFsO21hcmdpbi10b3A6MnB4O2ZvbnQtc2l6ZToxNnB4fWRhdGl1bS1jb250YWluZXIuX2lkLGRhdGl1bS1jb250YWluZXIuX2lkICp7LXdlYmtpdC10b3VjaC1jYWxsb3V0Om5vbmU7LXdlYmtpdC11c2VyLXNlbGVjdDpub25lOy1raHRtbC11c2VyLXNlbGVjdDpub25lOy1tb3otdXNlci1zZWxlY3Q6bm9uZTstbXMtdXNlci1zZWxlY3Q6bm9uZTstd2Via2l0LXRhcC1oaWdobGlnaHQtY29sb3I6dHJhbnNwYXJlbnQ7Y3Vyc29yOmRlZmF1bHR9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWJ1YmJsZXtwb3NpdGlvbjphYnNvbHV0ZTt3aWR0aDo1MHB4O2xpbmUtaGVpZ2h0OjI2cHg7dGV4dC1hbGlnbjpjZW50ZXI7Zm9udC1zaXplOjE0cHg7YmFja2dyb3VuZC1jb2xvcjpfc2Vjb25kYXJ5X2FjY2VudDtmb250LXdlaWdodDo3MDA7Ym9yZGVyLXJhZGl1czozcHg7bWFyZ2luLWxlZnQ6LTI1cHg7bWFyZ2luLXRvcDotMzJweDtjb2xvcjpfc2Vjb25kYXJ5O3otaW5kZXg6MTt0cmFuc2Zvcm0tb3JpZ2luOjMwcHggMzZweDt0cmFuc2l0aW9uLWRlbGF5OjA7dHJhbnNmb3JtOnNjYWxlKC41KTtvcGFjaXR5OjB9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWJ1YmJsZTphZnRlcntjb250ZW50OicnO3Bvc2l0aW9uOmFic29sdXRlO2Rpc3BsYXk6YmxvY2s7d2lkdGg6MTBweDtoZWlnaHQ6MTBweDt0cmFuc2Zvcm06cm90YXRlKDQ1ZGVnKTtiYWNrZ3JvdW5kOmxpbmVhci1ncmFkaWVudCgxMzVkZWcscmdiYSgwLDAsMCwwKSA1MCUsX3NlY29uZGFyeV9hY2NlbnQgNTAlKTtsZWZ0OjUwJTt0b3A6MjBweDttYXJnaW4tbGVmdDotNXB4fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1idWJibGUuZGF0aXVtLWJ1YmJsZS12aXNpYmxle3RyYW5zZm9ybTpzY2FsZSgxKTtvcGFjaXR5OjE7dHJhbnNpdGlvbi1kZWxheTouMnN9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWJ1YmJsZTpub3QoLmRhdGl1bS1idWJibGUtdmlzaWJsZSl7b3BhY2l0eTowIWltcG9ydGFudH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tYnViYmxlLmRhdGl1bS1idWJibGUtaW5hY3RpdmV7b3BhY2l0eTouNX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLWNvbnRhaW5lci13cmFwcGVye292ZXJmbG93OmhpZGRlbjtwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0Oi03cHg7cmlnaHQ6LTdweDt0b3A6ODBweDtoZWlnaHQ6MjcwcHg7ZGlzcGxheTpibG9jaztwb2ludGVyLWV2ZW50czpub25lfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXItY29udGFpbmVye3Bvc2l0aW9uOnJlbGF0aXZlO2hlaWdodDoyNjBweDtiYWNrZ3JvdW5kLWNvbG9yOl9zZWNvbmRhcnk7ZGlzcGxheTpibG9jazttYXJnaW46MCA3cHggN3B4O3BhZGRpbmctdG9wOjIwcHg7dHJhbnNmb3JtOnRyYW5zbGF0ZVkoLTI3MHB4KTtwb2ludGVyLWV2ZW50czphdXRvO2JvcmRlci1ib3R0b20tcmlnaHQtcmFkaXVzOjNweDtib3JkZXItYm90dG9tLWxlZnQtcmFkaXVzOjNweDt0cmFuc2l0aW9uOmFsbCBlYXNlIC40czt0cmFuc2l0aW9uLWRlbGF5Oi4xc31kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2Vye3Bvc2l0aW9uOmFic29sdXRlO2xlZnQ6MDtyaWdodDowO2JvdHRvbTowO2NvbG9yOl9zZWNvbmRhcnlfdGV4dDt0cmFuc2l0aW9uOmFsbCBlYXNlIC40c31kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1waWNrZXItbGVmdHt0cmFuc2Zvcm06dHJhbnNsYXRlWCgtMTAwJSkgc2NhbGUoMSk7cG9pbnRlci1ldmVudHM6bm9uZTt0cmFuc2l0aW9uLWRlbGF5OjBzfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLXBpY2tlci1yaWdodHt0cmFuc2Zvcm06dHJhbnNsYXRlWCgxMDAlKSBzY2FsZSgxKTtwb2ludGVyLWV2ZW50czpub25lO3RyYW5zaXRpb24tZGVsYXk6MHN9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tcGlja2VyLW91dHt0cmFuc2Zvcm06dHJhbnNsYXRlWCgwKSBzY2FsZSgxLjQpO29wYWNpdHk6MDtwb2ludGVyLWV2ZW50czpub25lO3RyYW5zaXRpb24tZGVsYXk6MHN9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tcGlja2VyLWlue3RyYW5zZm9ybTp0cmFuc2xhdGVYKDApIHNjYWxlKC42KTtvcGFjaXR5OjA7cG9pbnRlci1ldmVudHM6bm9uZTt0cmFuc2l0aW9uLWRlbGF5OjBzfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tb250aC1lbGVtZW50LGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS15ZWFyLWVsZW1lbnR7ZGlzcGxheTppbmxpbmUtYmxvY2s7d2lkdGg6MjUlO2xpbmUtaGVpZ2h0OjYwcHg7dGV4dC1hbGlnbjpjZW50ZXI7cG9zaXRpb246cmVsYXRpdmU7dHJhbnNpdGlvbjouMnMgZWFzZSBhbGx9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1vbnRoLWVsZW1lbnQuZGF0aXVtLXNlbGVjdGVkOmFmdGVyLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS15ZWFyLWVsZW1lbnQuZGF0aXVtLXNlbGVjdGVkOmFmdGVye2NvbnRlbnQ6Jyc7cG9zaXRpb246YWJzb2x1dGU7bGVmdDoyMHB4O3JpZ2h0OjIwcHg7dG9wOjUwJTttYXJnaW4tdG9wOjExcHg7aGVpZ2h0OjJweDtkaXNwbGF5OmJsb2NrO2JhY2tncm91bmQtY29sb3I6X3NlY29uZGFyeV9hY2NlbnR9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1vbnRoLWVsZW1lbnQuZGF0aXVtLWFjdGl2ZSxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0teWVhci1lbGVtZW50LmRhdGl1bS1hY3RpdmV7dHJhbnNmb3JtOnNjYWxlKC45KTt0cmFuc2l0aW9uOm5vbmV9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1vbnRoLWVsZW1lbnQ6bm90KFtkYXRpdW0tZGF0YV0pLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS15ZWFyLWVsZW1lbnQ6bm90KFtkYXRpdW0tZGF0YV0pe29wYWNpdHk6LjQ7cG9pbnRlci1ldmVudHM6bm9uZX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbW9udGgtZWxlbWVudC5kYXRpdW0tc2VsZWN0ZWQ6YWZ0ZXJ7bGVmdDoyNXB4O3JpZ2h0OjI1cHh9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWRhdGUtaGVhZGVye2Rpc3BsYXk6aW5saW5lLWJsb2NrO3dpZHRoOjQwcHg7bGluZS1oZWlnaHQ6MjhweDtvcGFjaXR5Oi42O2ZvbnQtd2VpZ2h0OjcwMDt0ZXh0LWFsaWduOmNlbnRlcn1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tZGF0ZS1lbGVtZW50e2Rpc3BsYXk6aW5saW5lLWJsb2NrO3dpZHRoOjQwcHg7bGluZS1oZWlnaHQ6MzZweDt0ZXh0LWFsaWduOmNlbnRlcjtwb3NpdGlvbjpyZWxhdGl2ZTt0cmFuc2l0aW9uOi4ycyBlYXNlIGFsbH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tZGF0ZS1lbGVtZW50LmRhdGl1bS1zZWxlY3RlZDphZnRlcntjb250ZW50OicnO3Bvc2l0aW9uOmFic29sdXRlO2xlZnQ6MTJweDtyaWdodDoxMnB4O3RvcDo1MCU7bWFyZ2luLXRvcDoxMHB4O2hlaWdodDoycHg7ZGlzcGxheTpibG9jaztiYWNrZ3JvdW5kLWNvbG9yOl9zZWNvbmRhcnlfYWNjZW50fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1kYXRlLWVsZW1lbnQuZGF0aXVtLWFjdGl2ZXt0cmFuc2Zvcm06c2NhbGUoLjkpO3RyYW5zaXRpb246bm9uZX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tZGF0ZS1lbGVtZW50Om5vdChbZGF0aXVtLWRhdGFdKXtvcGFjaXR5Oi40O3BvaW50ZXItZXZlbnRzOm5vbmV9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0taG91ci1waWNrZXIsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tbWludXRlLXBpY2tlcixkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1zZWNvbmQtcGlja2Vye2hlaWdodDoyNDBweH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1ob3VyLXBpY2tlcjpiZWZvcmUsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tbWludXRlLXBpY2tlcjpiZWZvcmUsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tc2Vjb25kLXBpY2tlcjpiZWZvcmV7Y29udGVudDonJzt3aWR0aDoxNDBweDtoZWlnaHQ6MTQwcHg7cG9zaXRpb246YWJzb2x1dGU7Ym9yZGVyOjFweCBzb2xpZDtsZWZ0OjUwJTt0b3A6NTAlO21hcmdpbi1sZWZ0Oi03MXB4O21hcmdpbi10b3A6LTcxcHg7Ym9yZGVyLXJhZGl1czo3MHB4O29wYWNpdHk6LjV9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0taG91ci1waWNrZXI6YWZ0ZXIsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tbWludXRlLXBpY2tlcjphZnRlcixkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1zZWNvbmQtcGlja2VyOmFmdGVye2NvbnRlbnQ6Jyc7d2lkdGg6NHB4O2hlaWdodDo0cHg7bWFyZ2luLWxlZnQ6LTRweDttYXJnaW4tdG9wOi00cHg7dG9wOjUwJTtsZWZ0OjUwJTtib3JkZXItcmFkaXVzOjRweDtwb3NpdGlvbjphYnNvbHV0ZTtib3JkZXI6MnB4IHNvbGlkO2JvcmRlci1jb2xvcjpfc2Vjb25kYXJ5X2FjY2VudDtiYWNrZ3JvdW5kLWNvbG9yOl9zZWNvbmRhcnk7Ym94LXNoYWRvdzowIDAgMCAycHggX3NlY29uZGFyeX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tdGlja3twb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjUwJTt0b3A6NTAlO3dpZHRoOjJweDtoZWlnaHQ6NzBweDttYXJnaW4tbGVmdDotMXB4O3RyYW5zZm9ybS1vcmlnaW46MXB4IDB9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXRpY2s6YWZ0ZXJ7Y29udGVudDonJztwb3NpdGlvbjphYnNvbHV0ZTt3aWR0aDoycHg7aGVpZ2h0OjZweDtiYWNrZ3JvdW5kLWNvbG9yOl9zZWNvbmRhcnlfdGV4dDtib3R0b206LTRweDtvcGFjaXR5Oi41fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tZXJpZGllbS1zd2l0Y2hlcntwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjUwJTttYXJnaW4tbGVmdDotMzBweDt0b3A6NTAlO21hcmdpbi10b3A6MTVweDtkaXNwbGF5OmJsb2NrO3dpZHRoOjYwcHg7aGVpZ2h0OjQwcHh9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1lcmlkaWVtLXN3aXRjaGVyOmFmdGVyLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tZXJpZGllbS1zd2l0Y2hlcjpiZWZvcmV7cG9zaXRpb246YWJzb2x1dGU7d2lkdGg6MzBweDt0b3A6MDtkaXNwbGF5OmJsb2NrO2xpbmUtaGVpZ2h0OjQwcHg7Zm9udC13ZWlnaHQ6NzAwO3RleHQtYWxpZ246Y2VudGVyO2ZvbnQtc2l6ZToxNHB4O3RyYW5zZm9ybTpzY2FsZSguOSk7b3BhY2l0eTouOTtjb2xvcjpfc2Vjb25kYXJ5X3RleHQ7dHJhbnNpdGlvbjphbGwgZWFzZSAuMnN9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1lcmlkaWVtLXN3aXRjaGVyLmRhdGl1bS1taWxpdGFyeS10aW1lOmJlZm9yZXtjb250ZW50OictMTInfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tZXJpZGllbS1zd2l0Y2hlci5kYXRpdW0tbWlsaXRhcnktdGltZTphZnRlcntjb250ZW50OicrMTInfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tZXJpZGllbS1zd2l0Y2hlcjpiZWZvcmV7Y29udGVudDonQU0nO2xlZnQ6MH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbWVyaWRpZW0tc3dpdGNoZXI6YWZ0ZXJ7Y29udGVudDonUE0nO3JpZ2h0OjB9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1lcmlkaWVtLXN3aXRjaGVyLmRhdGl1bS1hbS1zZWxlY3RlZDpiZWZvcmUsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1lcmlkaWVtLXN3aXRjaGVyLmRhdGl1bS1wbS1zZWxlY3RlZDphZnRlcnt0cmFuc2Zvcm06c2NhbGUoMSk7Y29sb3I6X3NlY29uZGFyeV9hY2NlbnQ7b3BhY2l0eToxfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tZXJpZGllbS1zd2l0Y2hlci5kYXRpdW0tYWN0aXZlOmFmdGVyLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tZXJpZGllbS1zd2l0Y2hlci5kYXRpdW0tYWN0aXZlOmJlZm9yZXt0cmFuc2l0aW9uOm5vbmV9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1lcmlkaWVtLXN3aXRjaGVyLmRhdGl1bS1hY3RpdmUuZGF0aXVtLWFtLXNlbGVjdGVkOmJlZm9yZXt0cmFuc2Zvcm06c2NhbGUoLjkpfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tZXJpZGllbS1zd2l0Y2hlci5kYXRpdW0tYWN0aXZlLmRhdGl1bS1hbS1zZWxlY3RlZDphZnRlcixkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbWVyaWRpZW0tc3dpdGNoZXIuZGF0aXVtLWFjdGl2ZS5kYXRpdW0tcG0tc2VsZWN0ZWQ6YmVmb3Jle3RyYW5zZm9ybTpzY2FsZSguOCl9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1lcmlkaWVtLXN3aXRjaGVyLmRhdGl1bS1hY3RpdmUuZGF0aXVtLXBtLXNlbGVjdGVkOmFmdGVye3RyYW5zZm9ybTpzY2FsZSguOSl9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXRpY2stbGFiZWwtY29udGFpbmVye3Bvc2l0aW9uOmFic29sdXRlO2JvdHRvbTotNTBweDtsZWZ0Oi0yNHB4O2Rpc3BsYXk6YmxvY2s7aGVpZ2h0OjUwcHg7d2lkdGg6NTBweH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tdGljay1sYWJlbHtwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjA7dG9wOjA7ZGlzcGxheTpibG9jazt3aWR0aDoxMDAlO2xpbmUtaGVpZ2h0OjUwcHg7Ym9yZGVyLXJhZGl1czoyNXB4O3RleHQtYWxpZ246Y2VudGVyO2ZvbnQtc2l6ZToxNHB4O3RyYW5zaXRpb246LjJzIGVhc2UgYWxsfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS10aWNrLWxhYmVsLmRhdGl1bS1hY3RpdmV7dHJhbnNmb3JtOnNjYWxlKC45KTt0cmFuc2l0aW9uOm5vbmV9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXRpY2stbGFiZWwuZGF0aXVtLWluYWN0aXZle29wYWNpdHk6LjQ7cG9pbnRlci1ldmVudHM6bm9uZX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1ob3VyLXBpY2tlci5kYXRpdW0tZHJhZ2dpbmcgZGF0aXVtLWhvdXItaGFuZCxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1ob3VyLXBpY2tlci5kYXRpdW0tZHJhZ2dpbmcgZGF0aXVtLW1pbnV0ZS1oYW5kLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLWhvdXItcGlja2VyLmRhdGl1bS1kcmFnZ2luZyBkYXRpdW0tc2Vjb25kLWhhbmQsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0taG91ci1waWNrZXIuZGF0aXVtLWRyYWdnaW5nIGRhdGl1bS10aW1lLWRyYWctYXJtLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLW1pbnV0ZS1waWNrZXIuZGF0aXVtLWRyYWdnaW5nIGRhdGl1bS1ob3VyLWhhbmQsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tbWludXRlLXBpY2tlci5kYXRpdW0tZHJhZ2dpbmcgZGF0aXVtLW1pbnV0ZS1oYW5kLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLW1pbnV0ZS1waWNrZXIuZGF0aXVtLWRyYWdnaW5nIGRhdGl1bS1zZWNvbmQtaGFuZCxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1taW51dGUtcGlja2VyLmRhdGl1bS1kcmFnZ2luZyBkYXRpdW0tdGltZS1kcmFnLWFybSxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1zZWNvbmQtcGlja2VyLmRhdGl1bS1kcmFnZ2luZyBkYXRpdW0taG91ci1oYW5kLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLXNlY29uZC1waWNrZXIuZGF0aXVtLWRyYWdnaW5nIGRhdGl1bS1taW51dGUtaGFuZCxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1zZWNvbmQtcGlja2VyLmRhdGl1bS1kcmFnZ2luZyBkYXRpdW0tc2Vjb25kLWhhbmQsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tc2Vjb25kLXBpY2tlci5kYXRpdW0tZHJhZ2dpbmcgZGF0aXVtLXRpbWUtZHJhZy1hcm17dHJhbnNpdGlvbjpub25lfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1ob3VyLWhhbmQsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1pbnV0ZS1oYW5kLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1zZWNvbmQtaGFuZHtwb3NpdGlvbjphYnNvbHV0ZTtkaXNwbGF5OmJsb2NrO3dpZHRoOjA7aGVpZ2h0OjA7bGVmdDo1MCU7dG9wOjUwJTt0cmFuc2Zvcm0tb3JpZ2luOjNweCAzcHg7bWFyZ2luLWxlZnQ6LTNweDttYXJnaW4tdG9wOi0zcHg7Ym9yZGVyLWxlZnQ6M3B4IHNvbGlkIHRyYW5zcGFyZW50O2JvcmRlci1yaWdodDozcHggc29saWQgdHJhbnNwYXJlbnQ7Ym9yZGVyLXRvcC1sZWZ0LXJhZGl1czozcHg7Ym9yZGVyLXRvcC1yaWdodC1yYWRpdXM6M3B4O3RyYW5zaXRpb246LjNzIGVhc2UgYWxsfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLW1pbnV0ZS1waWNrZXIgZGF0aXVtLWhvdXItaGFuZCxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1zZWNvbmQtcGlja2VyIGRhdGl1bS1ob3VyLWhhbmQsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tc2Vjb25kLXBpY2tlciBkYXRpdW0tbWludXRlLWhhbmR7Ym9yZGVyLXRvcC1jb2xvcjpfc2Vjb25kYXJ5X3RleHQ7b3BhY2l0eTouNX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0taG91ci1oYW5ke2JvcmRlci10b3A6MzBweCBzb2xpZCBfc2Vjb25kYXJ5X2FjY2VudH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbWludXRlLWhhbmR7dHJhbnNmb3JtLW9yaWdpbjoycHggMnB4O21hcmdpbi1sZWZ0Oi0ycHg7bWFyZ2luLXRvcDotMnB4O2JvcmRlci1sZWZ0OjJweCBzb2xpZCB0cmFuc3BhcmVudDtib3JkZXItcmlnaHQ6MnB4IHNvbGlkIHRyYW5zcGFyZW50O2JvcmRlci10b3AtbGVmdC1yYWRpdXM6MnB4O2JvcmRlci10b3AtcmlnaHQtcmFkaXVzOjJweDtib3JkZXItdG9wOjQwcHggc29saWQgX3NlY29uZGFyeV9hY2NlbnR9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXNlY29uZC1oYW5ke3RyYW5zZm9ybS1vcmlnaW46MXB4IDFweDttYXJnaW4tbGVmdDotMXB4O21hcmdpbi10b3A6LTFweDtib3JkZXItbGVmdDoxcHggc29saWQgdHJhbnNwYXJlbnQ7Ym9yZGVyLXJpZ2h0OjFweCBzb2xpZCB0cmFuc3BhcmVudDtib3JkZXItdG9wLWxlZnQtcmFkaXVzOjFweDtib3JkZXItdG9wLXJpZ2h0LXJhZGl1czoxcHg7Ym9yZGVyLXRvcDo1MHB4IHNvbGlkIF9zZWNvbmRhcnlfYWNjZW50fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS10aW1lLWRyYWctYXJte3dpZHRoOjJweDtoZWlnaHQ6NzBweDtwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjUwJTt0b3A6NTAlO21hcmdpbi1sZWZ0Oi0xcHg7dHJhbnNmb3JtLW9yaWdpbjoxcHggMDt0cmFuc2Zvcm06cm90YXRlKDQ1ZGVnKTt0cmFuc2l0aW9uOi4zcyBlYXNlIGFsbH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tdGltZS1kcmFnLWFybTphZnRlcixkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tdGltZS1kcmFnLWFybTpiZWZvcmV7Y29udGVudDonJztib3JkZXI6NHB4IHNvbGlkIHRyYW5zcGFyZW50O3Bvc2l0aW9uOmFic29sdXRlO2JvdHRvbTotNHB4O2xlZnQ6MTJweDtib3JkZXItbGVmdC1jb2xvcjpfc2Vjb25kYXJ5X2FjY2VudDt0cmFuc2Zvcm0tb3JpZ2luOi0xMXB4IDRweH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tdGltZS1kcmFnLWFybTphZnRlcnt0cmFuc2Zvcm06cm90YXRlKDE4MGRlZyl9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXRpbWUtZHJhZ3tkaXNwbGF5OmJsb2NrO3Bvc2l0aW9uOmFic29sdXRlO3dpZHRoOjUwcHg7aGVpZ2h0OjUwcHg7dG9wOjEwMCU7bWFyZ2luLXRvcDotMjVweDttYXJnaW4tbGVmdDotMjRweDtib3JkZXItcmFkaXVzOjI1cHh9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXRpbWUtZHJhZzphZnRlcntjb250ZW50OicnO3dpZHRoOjEwcHg7aGVpZ2h0OjEwcHg7cG9zaXRpb246YWJzb2x1dGU7bGVmdDo1MCU7dG9wOjUwJTttYXJnaW4tbGVmdDotN3B4O21hcmdpbi10b3A6LTdweDtiYWNrZ3JvdW5kLWNvbG9yOl9zZWNvbmRhcnlfYWNjZW50O2JvcmRlcjoycHggc29saWQ7Ym9yZGVyLWNvbG9yOl9zZWNvbmRhcnk7Ym94LXNoYWRvdzowIDAgMCAycHggX3NlY29uZGFyeV9hY2NlbnQ7Ym9yZGVyLXJhZGl1czoxMHB4fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS10aW1lLWRyYWcuZGF0aXVtLWFjdGl2ZTphZnRlcnt3aWR0aDo4cHg7aGVpZ2h0OjhweDtib3JkZXI6M3B4IHNvbGlkO2JvcmRlci1jb2xvcjpfc2Vjb25kYXJ5fVwiOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
