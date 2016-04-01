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
            if (new Date(d.getFullYear(), 0).valueOf() < maxDate.valueOf() ||
                new Date(d.getFullYear() + 1, 0).valueOf() > minDate.valueOf())
                return false;
            return yearSelectable(d);
        };
        var isMonthSelectable = function (d) {
            if (new Date(d.getFullYear(), d.getMonth()).valueOf() < maxDate.valueOf() ||
                new Date(d.getFullYear(), d.getMonth() + 1).valueOf() > minDate.valueOf())
                return false;
            return isYearSelectable(d) &&
                monthSelectable(d);
        };
        var isDateSelectable = function (d) {
            if (new Date(d.getFullYear(), d.getMonth(), d.getDate()).valueOf() < maxDate.valueOf() ||
                new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).valueOf() > minDate.valueOf())
                return false;
            return isMonthSelectable(d) &&
                dateSelectable(d);
        };
        var isHourSelectable = function (d) {
            if (new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()).valueOf() < maxDate.valueOf() ||
                new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours() + 1).valueOf() > minDate.valueOf())
                return false;
            return isDateSelectable(d) &&
                hourSelectable(d);
        };
        var isMinuteSelectable = function (d) {
            if (new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()).valueOf() < maxDate.valueOf() ||
                new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes() + 1).valueOf() > minDate.valueOf())
                return false;
            return isHourSelectable(d) &&
                minuteSelectable(d);
        };
        var isSecondSelectable = function (d) {
            if (new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()).valueOf() < maxDate.valueOf() ||
                new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds() + 1).valueOf() > minDate.valueOf())
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRhdGl1bS50cyIsIkRhdGl1bUludGVybmFscy50cyIsIk9wdGlvblNhbml0aXplci50cyIsImNvbW1vbi9Db21tb24udHMiLCJjb21tb24vQ3VzdG9tRXZlbnRQb2x5ZmlsbC50cyIsImNvbW1vbi9FdmVudHMudHMiLCJpbnB1dC9EYXRlUGFydHMudHMiLCJpbnB1dC9JbnB1dC50cyIsImlucHV0L0tleWJvYXJkRXZlbnRIYW5kbGVyLnRzIiwiaW5wdXQvTW91c2VFdmVudEhhbmRsZXIudHMiLCJpbnB1dC9QYXJzZXIudHMiLCJpbnB1dC9QYXN0ZUV2ZW50SGFuZGxlci50cyIsInBpY2tlci9IZWFkZXIudHMiLCJwaWNrZXIvUGlja2VyTWFuYWdlci50cyIsInBpY2tlci9odG1sL2hlYWRlci50cyIsInBpY2tlci9waWNrZXJzL1BpY2tlci50cyIsInBpY2tlci9waWNrZXJzL0RhdGVQaWNrZXIudHMiLCJwaWNrZXIvcGlja2Vycy9UaW1lUGlja2VyLnRzIiwicGlja2VyL3BpY2tlcnMvSG91clBpY2tlci50cyIsInBpY2tlci9waWNrZXJzL01pbnV0ZVBpY2tlci50cyIsInBpY2tlci9waWNrZXJzL01vbnRoUGlja2VyLnRzIiwicGlja2VyL3BpY2tlcnMvU2Vjb25kUGlja2VyLnRzIiwicGlja2VyL3BpY2tlcnMvWWVhclBpY2tlci50cyIsInBpY2tlci9zdHlsZXMvY3NzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQU0sTUFBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHO0lBRXRCLGdCQUFZLE9BQXdCLEVBQUUsT0FBZ0I7UUFDbEQsSUFBSSxTQUFTLEdBQUcsSUFBSSxlQUFlLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxhQUFhLEdBQUcsVUFBQyxPQUFnQixJQUFLLE9BQUEsU0FBUyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBaEMsQ0FBZ0MsQ0FBQztJQUNoRixDQUFDO0lBQ0wsYUFBQztB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UUFFckQsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQ2hGLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzNDLElBQUksRUFBRSxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUIsSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ3BELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsS0FBSyxZQUFZLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNwRCxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ3hDLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixFQUFFLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQzNDLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQUVNLDhCQUFTLEdBQWhCO1FBQ0ksTUFBTSxDQUFDLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFFTSw2QkFBUSxHQUFmO1FBQ0ksTUFBTSxDQUFDLFlBQVUsQ0FBQztJQUN0QixDQUFDO0lBQ0wsaUJBQUM7QUFBRCxDQXJGQSxBQXFGQyxDQXJGd0IsTUFBTSxHQXFGOUI7QUN2RkQsSUFBSSxHQUFHLEdBQUMsNmhjQUE2aGMsQ0FBQyIsImZpbGUiOiJkYXRpdW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyIoPGFueT53aW5kb3cpWydEYXRpdW0nXSA9IGNsYXNzIERhdGl1bSB7XHJcbiAgICBwdWJsaWMgdXBkYXRlT3B0aW9uczoob3B0aW9uczpJT3B0aW9ucykgPT4gdm9pZDtcclxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6SFRNTElucHV0RWxlbWVudCwgb3B0aW9uczpJT3B0aW9ucykge1xyXG4gICAgICAgIGxldCBpbnRlcm5hbHMgPSBuZXcgRGF0aXVtSW50ZXJuYWxzKGVsZW1lbnQsIG9wdGlvbnMpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlT3B0aW9ucyA9IChvcHRpb25zOklPcHRpb25zKSA9PiBpbnRlcm5hbHMudXBkYXRlT3B0aW9ucyhvcHRpb25zKTtcclxuICAgIH1cclxufSIsImNvbnN0IGVudW0gTGV2ZWwge1xyXG4gICAgWUVBUiwgTU9OVEgsIERBVEUsIEhPVVIsXHJcbiAgICBNSU5VVEUsIFNFQ09ORCwgTk9ORVxyXG59XHJcblxyXG5jbGFzcyBEYXRpdW1JbnRlcm5hbHMge1xyXG4gICAgcHJpdmF0ZSBvcHRpb25zOklPcHRpb25zID0gPGFueT57fTtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBpbnB1dDpJbnB1dDtcclxuICAgIHByaXZhdGUgcGlja2VyTWFuYWdlcjpQaWNrZXJNYW5hZ2VyO1xyXG4gICAgXHJcbiAgICBwcml2YXRlIGxldmVsczpMZXZlbFtdO1xyXG4gICAgcHJpdmF0ZSBkYXRlOkRhdGU7XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgZWxlbWVudDpIVE1MSW5wdXRFbGVtZW50LCBvcHRpb25zOklPcHRpb25zKSB7XHJcbiAgICAgICAgaWYgKGVsZW1lbnQgPT09IHZvaWQgMCkgdGhyb3cgJ2VsZW1lbnQgaXMgcmVxdWlyZWQnO1xyXG4gICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdzcGVsbGNoZWNrJywgJ2ZhbHNlJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5pbnB1dCA9IG5ldyBJbnB1dChlbGVtZW50KTtcclxuICAgICAgICB0aGlzLnBpY2tlck1hbmFnZXIgPSBuZXcgUGlja2VyTWFuYWdlcihlbGVtZW50KTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnVwZGF0ZU9wdGlvbnMob3B0aW9ucyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGlzdGVuLmdvdG8oZWxlbWVudCwgKGUpID0+IHRoaXMuZ290byhlLmRhdGUsIGUubGV2ZWwsIGUudXBkYXRlKSk7XHJcbiAgICAgICAgbGlzdGVuLnpvb21PdXQoZWxlbWVudCwgKGUpID0+IHRoaXMuem9vbU91dChlLmRhdGUsIGUuY3VycmVudExldmVsLCBlLnVwZGF0ZSkpO1xyXG4gICAgICAgIGxpc3Rlbi56b29tSW4oZWxlbWVudCwgKGUpID0+IHRoaXMuem9vbUluKGUuZGF0ZSwgZS5jdXJyZW50TGV2ZWwsIGUudXBkYXRlKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5nb3RvKHRoaXMub3B0aW9uc1snZGVmYXVsdERhdGUnXSwgTGV2ZWwuTk9ORSwgdHJ1ZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB6b29tT3V0KGRhdGU6RGF0ZSwgY3VycmVudExldmVsOkxldmVsLCB1cGRhdGU6Ym9vbGVhbiA9IHRydWUpIHtcclxuICAgICAgICBsZXQgbmV3TGV2ZWw6TGV2ZWwgPSB0aGlzLmxldmVsc1t0aGlzLmxldmVscy5pbmRleE9mKGN1cnJlbnRMZXZlbCkgLSAxXTsgXHJcbiAgICAgICAgaWYgKG5ld0xldmVsID09PSB2b2lkIDApIHJldHVybjtcclxuICAgICAgICB0cmlnZ2VyLmdvdG8odGhpcy5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgZGF0ZTogZGF0ZSxcclxuICAgICAgICAgICBsZXZlbDogbmV3TGV2ZWwsXHJcbiAgICAgICAgICAgdXBkYXRlOiB1cGRhdGUgXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB6b29tSW4oZGF0ZTpEYXRlLCBjdXJyZW50TGV2ZWw6TGV2ZWwsIHVwZGF0ZTpib29sZWFuID0gdHJ1ZSkge1xyXG4gICAgICAgIGxldCBuZXdMZXZlbDpMZXZlbCA9IHRoaXMubGV2ZWxzW3RoaXMubGV2ZWxzLmluZGV4T2YoY3VycmVudExldmVsKSArIDFdO1xyXG4gICAgICAgIGlmIChuZXdMZXZlbCA9PT0gdm9pZCAwKSBuZXdMZXZlbCA9IGN1cnJlbnRMZXZlbDtcclxuICAgICAgICB0cmlnZ2VyLmdvdG8odGhpcy5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgZGF0ZTogZGF0ZSxcclxuICAgICAgICAgICBsZXZlbDogbmV3TGV2ZWwsXHJcbiAgICAgICAgICAgdXBkYXRlOiB1cGRhdGUgXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnb3RvKGRhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWwsIHVwZGF0ZTpib29sZWFuID0gdHJ1ZSkge1xyXG4gICAgICAgIGlmIChkYXRlID09PSB2b2lkIDApIGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChkYXRlLnZhbHVlT2YoKSA8IHRoaXMub3B0aW9ucy5taW5EYXRlLnZhbHVlT2YoKSkge1xyXG4gICAgICAgICAgICBkYXRlID0gbmV3IERhdGUodGhpcy5vcHRpb25zLm1pbkRhdGUudmFsdWVPZigpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKGRhdGUudmFsdWVPZigpID4gdGhpcy5vcHRpb25zLm1heERhdGUudmFsdWVPZigpKSB7XHJcbiAgICAgICAgICAgIGRhdGUgPSBuZXcgRGF0ZSh0aGlzLm9wdGlvbnMubWF4RGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmRhdGUgPSBkYXRlO1xyXG4gICAgICAgIHRyaWdnZXIudmlld2NoYW5nZWQodGhpcy5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgIGRhdGU6IGRhdGUsXHJcbiAgICAgICAgICAgIGxldmVsOiBsZXZlbCxcclxuICAgICAgICAgICAgdXBkYXRlOiB1cGRhdGVcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHVwZGF0ZU9wdGlvbnMobmV3T3B0aW9uczpJT3B0aW9ucyA9IDxhbnk+e30pIHtcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemUobmV3T3B0aW9ucywgdGhpcy5vcHRpb25zKTsgICAgICAgIFxyXG4gICAgICAgIHRoaXMuaW5wdXQudXBkYXRlT3B0aW9ucyh0aGlzLm9wdGlvbnMpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMubGV2ZWxzID0gdGhpcy5pbnB1dC5nZXRMZXZlbHMoKS5zbGljZSgpO1xyXG4gICAgICAgIHRoaXMubGV2ZWxzLnNvcnQoKTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAodGhpcy5waWNrZXJNYW5hZ2VyLmN1cnJlbnRQaWNrZXIgIT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICBsZXQgY3VyTGV2ZWwgPSB0aGlzLnBpY2tlck1hbmFnZXIuY3VycmVudFBpY2tlci5nZXRMZXZlbCgpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKHRoaXMubGV2ZWxzLmluZGV4T2YoY3VyTGV2ZWwpID09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICB0cmlnZ2VyLmdvdG8odGhpcy5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZTogdGhpcy5kYXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIGxldmVsOiB0aGlzLmxldmVsc1swXVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnBpY2tlck1hbmFnZXIudXBkYXRlT3B0aW9ucyh0aGlzLm9wdGlvbnMpO1xyXG4gICAgfVxyXG59IiwiZnVuY3Rpb24gT3B0aW9uRXhjZXB0aW9uKG1zZzpzdHJpbmcpIHtcclxuICAgIHJldHVybiBgW0RhdGl1bSBPcHRpb24gRXhjZXB0aW9uXVxcbiAgJHttc2d9XFxuICBTZWUgaHR0cDovL2RhdGl1bS5pby9kb2N1bWVudGF0aW9uIGZvciBkb2N1bWVudGF0aW9uLmA7XHJcbn1cclxuXHJcbmNsYXNzIE9wdGlvblNhbml0aXplciB7XHJcbiAgICBcclxuICAgIHN0YXRpYyBkZmx0RGF0ZTpEYXRlID0gbmV3IERhdGUoKTtcclxuICAgIFxyXG4gICAgc3RhdGljIHNhbml0aXplRGlzcGxheUFzKGRpc3BsYXlBczphbnksIGRmbHQ6c3RyaW5nID0gJ2g6bW1hIE1NTSBELCBZWVlZJykge1xyXG4gICAgICAgIGlmIChkaXNwbGF5QXMgPT09IHZvaWQgMCkgcmV0dXJuIGRmbHQ7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBkaXNwbGF5QXMgIT09ICdzdHJpbmcnKSB0aHJvdyBPcHRpb25FeGNlcHRpb24oJ1RoZSBcImRpc3BsYXlBc1wiIG9wdGlvbiBtdXN0IGJlIGEgc3RyaW5nJyk7XHJcbiAgICAgICAgcmV0dXJuIGRpc3BsYXlBcztcclxuICAgIH1cclxuICAgIFxyXG4gICAgc3RhdGljIHNhbml0aXplTWluRGF0ZShtaW5EYXRlOmFueSwgZGZsdDpEYXRlID0gbmV3IERhdGUoLTg2NDAwMDAwMDAwMDAwMDApKSB7XHJcbiAgICAgICAgaWYgKG1pbkRhdGUgPT09IHZvaWQgMCkgcmV0dXJuIGRmbHQ7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKG1pbkRhdGUpOyAvL1RPRE8gZmlndXJlIHRoaXMgb3V0IHllc1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdGF0aWMgc2FuaXRpemVNYXhEYXRlKG1heERhdGU6YW55LCBkZmx0OkRhdGUgPSBuZXcgRGF0ZSg4NjQwMDAwMDAwMDAwMDAwKSkge1xyXG4gICAgICAgIGlmIChtYXhEYXRlID09PSB2b2lkIDApIHJldHVybiBkZmx0O1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShtYXhEYXRlKTsgLy9UT0RPIGZpZ3VyZSB0aGlzIG91dCBcclxuICAgIH1cclxuICAgIFxyXG4gICAgc3RhdGljIHNhbml0aXplRGVmYXVsdERhdGUoZGVmYXVsdERhdGU6YW55LCBkZmx0OkRhdGUgPSB0aGlzLmRmbHREYXRlKSB7XHJcbiAgICAgICAgaWYgKGRlZmF1bHREYXRlID09PSB2b2lkIDApIHJldHVybiBkZmx0O1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShkZWZhdWx0RGF0ZSk7IC8vVE9ETyBmaWd1cmUgdGhpcyBvdXRcclxuICAgIH1cclxuICAgICAgICBcclxuICAgIHN0YXRpYyBzYW5pdGl6ZUNvbG9yKGNvbG9yOmFueSkge1xyXG4gICAgICAgIGxldCB0aHJlZUhleCA9ICdcXFxccyojW0EtRmEtZjAtOV17M31cXFxccyonO1xyXG4gICAgICAgIGxldCBzaXhIZXggPSAnXFxcXHMqI1tBLUZhLWYwLTldezZ9XFxcXHMqJztcclxuICAgICAgICBsZXQgcmdiID0gJ1xcXFxzKnJnYlxcXFwoXFxcXHMqWzAtOV17MSwzfVxcXFxzKixcXFxccypbMC05XXsxLDN9XFxcXHMqLFxcXFxzKlswLTldezEsM31cXFxccypcXFxcKVxcXFxzKic7XHJcbiAgICAgICAgbGV0IHJnYmEgPSAnXFxcXHMqcmdiYVxcXFwoXFxcXHMqWzAtOV17MSwzfVxcXFxzKixcXFxccypbMC05XXsxLDN9XFxcXHMqLFxcXFxzKlswLTldezEsM31cXFxccypcXFxcLFxcXFxzKlswLTldKlxcXFwuWzAtOV0rXFxcXHMqXFxcXClcXFxccyonO1xyXG4gICAgICAgIGxldCBzYW5pdGl6ZUNvbG9yUmVnZXggPSBuZXcgUmVnRXhwKGBeKCgke3RocmVlSGV4fSl8KCR7c2l4SGV4fSl8KCR7cmdifSl8KCR7cmdiYX0pKSRgKTtcclxuXHJcbiAgICAgICAgaWYgKGNvbG9yID09PSB2b2lkIDApIHRocm93IE9wdGlvbkV4Y2VwdGlvbihcIkFsbCB0aGVtZSBjb2xvcnMgKHByaW1hcnksIHByaW1hcnlfdGV4dCwgc2Vjb25kYXJ5LCBzZWNvbmRhcnlfdGV4dCwgc2Vjb25kYXJ5X2FjY2VudCkgbXVzdCBiZSBkZWZpbmVkXCIpO1xyXG4gICAgICAgIGlmICghc2FuaXRpemVDb2xvclJlZ2V4LnRlc3QoY29sb3IpKSB0aHJvdyBPcHRpb25FeGNlcHRpb24oXCJBbGwgdGhlbWUgY29sb3JzIG11c3QgYmUgdmFsaWQgcmdiLCByZ2JhLCBvciBoZXggY29kZVwiKTtcclxuICAgICAgICByZXR1cm4gPHN0cmluZz5jb2xvcjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgc3RhdGljIHNhbml0aXplVGhlbWUodGhlbWU6YW55LCBkZmx0OmFueSA9IFwibWF0ZXJpYWxcIik6SVRoZW1lIHtcclxuICAgICAgICBpZiAodGhlbWUgPT09IHZvaWQgMCkgcmV0dXJuIE9wdGlvblNhbml0aXplci5zYW5pdGl6ZVRoZW1lKGRmbHQsIHZvaWQgMCk7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGVtZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgc3dpdGNoKHRoZW1lKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ2xpZ2h0JzpcclxuICAgICAgICAgICAgICAgIHJldHVybiA8SVRoZW1lPntcclxuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5OiAnI2VlZScsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeV90ZXh0OiAnIzY2NicsXHJcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5OiAnI2ZmZicsXHJcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5X3RleHQ6ICcjNjY2JyxcclxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnlfYWNjZW50OiAnIzY2NidcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSAnZGFyayc6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gPElUaGVtZT57XHJcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeTogJyM0NDQnLFxyXG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnlfdGV4dDogJyNlZWUnLFxyXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeTogJyMzMzMnLFxyXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeV90ZXh0OiAnI2VlZScsXHJcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5X2FjY2VudDogJyNmZmYnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgJ21hdGVyaWFsJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiA8SVRoZW1lPntcclxuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5OiAnIzAxOTU4NycsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeV90ZXh0OiAnI2ZmZicsXHJcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5OiAnI2ZmZicsXHJcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5X3RleHQ6ICcjODg4JyxcclxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnlfYWNjZW50OiAnIzAxOTU4NydcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHRocm93IFwiTmFtZSBvZiB0aGVtZSBub3QgdmFsaWQuXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGVtZSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDxJVGhlbWU+IHtcclxuICAgICAgICAgICAgICAgIHByaW1hcnk6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZUNvbG9yKHRoZW1lWydwcmltYXJ5J10pLFxyXG4gICAgICAgICAgICAgICAgc2Vjb25kYXJ5OiBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVDb2xvcih0aGVtZVsnc2Vjb25kYXJ5J10pLFxyXG4gICAgICAgICAgICAgICAgcHJpbWFyeV90ZXh0OiBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVDb2xvcih0aGVtZVsncHJpbWFyeV90ZXh0J10pLFxyXG4gICAgICAgICAgICAgICAgc2Vjb25kYXJ5X3RleHQ6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZUNvbG9yKHRoZW1lWydzZWNvbmRhcnlfdGV4dCddKSxcclxuICAgICAgICAgICAgICAgIHNlY29uZGFyeV9hY2NlbnQ6IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZUNvbG9yKHRoZW1lWydzZWNvbmRhcnlfYWNjZW50J10pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBPcHRpb25FeGNlcHRpb24oJ1RoZSBcInRoZW1lXCIgb3B0aW9uIG11c3QgYmUgb2JqZWN0IG9yIHN0cmluZycpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgc3RhdGljIHNhbml0aXplSXNTZWNvbmRTZWxlY3RhYmxlKGlzU2Vjb25kU2VsZWN0YWJsZTphbnksIGRmbHQ6YW55ID0gKGRhdGU6RGF0ZSkgPT4gdHJ1ZSkge1xyXG4gICAgICAgIHJldHVybiBkZmx0O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdGF0aWMgc2FuaXRpemVJc01pbnV0ZVNlbGVjdGFibGUoaXNNaW51dGVTZWxlY3RhYmxlOmFueSwgZGZsdDphbnkgPSAoZGF0ZTpEYXRlKSA9PiB0cnVlKSB7XHJcbiAgICAgICAgcmV0dXJuIChkYXRlOkRhdGUpID0+IGRhdGUuZ2V0TWludXRlcygpICUgMTUgPT09IDA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN0YXRpYyBzYW5pdGl6ZUlzSG91clNlbGVjdGFibGUoaXNIb3VyU2VsZWN0YWJsZTphbnksIGRmbHQ6YW55ID0gKGRhdGU6RGF0ZSkgPT4gdHJ1ZSkge1xyXG4gICAgICAgIHJldHVybiBkZmx0O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdGF0aWMgc2FuaXRpemVJc0RhdGVTZWxlY3RhYmxlKGlzRGF0ZVNlbGVjdGFibGU6YW55LCBkZmx0OmFueSA9IChkYXRlOkRhdGUpID0+IHRydWUpIHtcclxuICAgICAgICByZXR1cm4gKGRhdGU6RGF0ZSkgPT4gZGF0ZS5nZXREYXkoKSAhPT0gMCAmJiBkYXRlLmdldERheSgpICE9PSA2O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdGF0aWMgc2FuaXRpemVJc01vbnRoU2VsZWN0YWJsZShpc01vbnRoU2VsZWN0YWJsZTphbnksIGRmbHQ6YW55ID0gKGRhdGU6RGF0ZSkgPT4gdHJ1ZSkge1xyXG4gICAgICAgIHJldHVybiBkZmx0O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdGF0aWMgc2FuaXRpemVJc1llYXJTZWxlY3RhYmxlKGlzWWVhclNlbGVjdGFibGU6YW55LCBkZmx0OmFueSA9IChkYXRlOkRhdGUpID0+IHRydWUpIHtcclxuICAgICAgICByZXR1cm4gZGZsdDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgc3RhdGljIHNhbml0aXplTWlsaXRhcnlUaW1lKG1pbGl0YXJ5VGltZTphbnksIGRmbHQ6Ym9vbGVhbiA9IGZhbHNlKSB7XHJcbiAgICAgICAgaWYgKG1pbGl0YXJ5VGltZSA9PT0gdm9pZCAwKSByZXR1cm4gZGZsdDtcclxuICAgICAgICBpZiAodHlwZW9mIG1pbGl0YXJ5VGltZSAhPT0gJ2Jvb2xlYW4nKSB7XHJcbiAgICAgICAgICAgIHRocm93IE9wdGlvbkV4Y2VwdGlvbignVGhlIFwibWlsaXRhcnlUaW1lXCIgb3B0aW9uIG11c3QgYmUgYSBib29sZWFuJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiA8Ym9vbGVhbj5taWxpdGFyeVRpbWU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN0YXRpYyBzYW5pdGl6ZShvcHRpb25zOklPcHRpb25zLCBkZWZhdWx0czpJT3B0aW9ucykge1xyXG4gICAgICAgIGxldCBtaW5EYXRlID0gT3B0aW9uU2FuaXRpemVyLnNhbml0aXplTWluRGF0ZShvcHRpb25zWydtaW5EYXRlJ10sIGRlZmF1bHRzLm1pbkRhdGUpO1xyXG4gICAgICAgIGxldCBtYXhEYXRlID0gT3B0aW9uU2FuaXRpemVyLnNhbml0aXplTWF4RGF0ZShvcHRpb25zWydtYXhEYXRlJ10sIGRlZmF1bHRzLm1heERhdGUpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCB5ZWFyU2VsZWN0YWJsZSA9IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZUlzWWVhclNlbGVjdGFibGUob3B0aW9uc1snaXNZZWFyU2VsZWN0YWJsZSddLCBkZWZhdWx0cy5pc1llYXJTZWxlY3RhYmxlKTtcclxuICAgICAgICBsZXQgbW9udGhTZWxlY3RhYmxlID0gT3B0aW9uU2FuaXRpemVyLnNhbml0aXplSXNNb250aFNlbGVjdGFibGUob3B0aW9uc1snaXNNb250aFNlbGVjdGFibGUnXSwgZGVmYXVsdHMuaXNNb250aFNlbGVjdGFibGUpO1xyXG4gICAgICAgIGxldCBkYXRlU2VsZWN0YWJsZSA9IE9wdGlvblNhbml0aXplci5zYW5pdGl6ZUlzRGF0ZVNlbGVjdGFibGUob3B0aW9uc1snaXNEYXRlU2VsZWN0YWJsZSddLCBkZWZhdWx0cy5pc0RhdGVTZWxlY3RhYmxlKTtcclxuICAgICAgICBsZXQgaG91clNlbGVjdGFibGUgPSBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVJc0hvdXJTZWxlY3RhYmxlKG9wdGlvbnNbJ2lzSG91clNlbGVjdGFibGUnXSwgZGVmYXVsdHMuaXNIb3VyU2VsZWN0YWJsZSk7XHJcbiAgICAgICAgbGV0IG1pbnV0ZVNlbGVjdGFibGUgPSBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVJc01pbnV0ZVNlbGVjdGFibGUob3B0aW9uc1snaXNNaW51dGVTZWxlY3RhYmxlJ10sIGRlZmF1bHRzLmlzTWludXRlU2VsZWN0YWJsZSk7XHJcbiAgICAgICAgbGV0IHNlY29uZFNlbGVjdGFibGUgPSBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVJc1NlY29uZFNlbGVjdGFibGUob3B0aW9uc1snaXNTZWNvbmRTZWxlY3RhYmxlJ10sIGRlZmF1bHRzLmlzU2Vjb25kU2VsZWN0YWJsZSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGlzWWVhclNlbGVjdGFibGUgPSAoZDpEYXRlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChuZXcgRGF0ZShkLmdldEZ1bGxZZWFyKCksIDApLnZhbHVlT2YoKSA8IG1heERhdGUudmFsdWVPZigpIHx8XHJcbiAgICAgICAgICAgICAgICBuZXcgRGF0ZShkLmdldEZ1bGxZZWFyKCkgKyAxLCAwKS52YWx1ZU9mKCkgPiBtaW5EYXRlLnZhbHVlT2YoKSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICByZXR1cm4geWVhclNlbGVjdGFibGUoZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBpc01vbnRoU2VsZWN0YWJsZSA9IChkOkRhdGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKG5ldyBEYXRlKGQuZ2V0RnVsbFllYXIoKSwgZC5nZXRNb250aCgpKS52YWx1ZU9mKCkgPCBtYXhEYXRlLnZhbHVlT2YoKSB8fFxyXG4gICAgICAgICAgICAgICAgbmV3IERhdGUoZC5nZXRGdWxsWWVhcigpLCBkLmdldE1vbnRoKCkgKyAxKS52YWx1ZU9mKCkgPiBtaW5EYXRlLnZhbHVlT2YoKSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICByZXR1cm4gaXNZZWFyU2VsZWN0YWJsZShkKSAmJlxyXG4gICAgICAgICAgICAgICAgICAgbW9udGhTZWxlY3RhYmxlKGQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgaXNEYXRlU2VsZWN0YWJsZSA9IChkOkRhdGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKG5ldyBEYXRlKGQuZ2V0RnVsbFllYXIoKSwgZC5nZXRNb250aCgpLCBkLmdldERhdGUoKSkudmFsdWVPZigpIDwgbWF4RGF0ZS52YWx1ZU9mKCkgfHxcclxuICAgICAgICAgICAgICAgIG5ldyBEYXRlKGQuZ2V0RnVsbFllYXIoKSwgZC5nZXRNb250aCgpLCBkLmdldERhdGUoKSArIDEpLnZhbHVlT2YoKSA+IG1pbkRhdGUudmFsdWVPZigpKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIHJldHVybiBpc01vbnRoU2VsZWN0YWJsZShkKSAmJlxyXG4gICAgICAgICAgICAgICAgICAgZGF0ZVNlbGVjdGFibGUoZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBpc0hvdXJTZWxlY3RhYmxlID0gKGQ6RGF0ZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAobmV3IERhdGUoZC5nZXRGdWxsWWVhcigpLCBkLmdldE1vbnRoKCksIGQuZ2V0RGF0ZSgpLCBkLmdldEhvdXJzKCkpLnZhbHVlT2YoKSA8IG1heERhdGUudmFsdWVPZigpIHx8XHJcbiAgICAgICAgICAgICAgICBuZXcgRGF0ZShkLmdldEZ1bGxZZWFyKCksIGQuZ2V0TW9udGgoKSwgZC5nZXREYXRlKCksIGQuZ2V0SG91cnMoKSArIDEpLnZhbHVlT2YoKSA+IG1pbkRhdGUudmFsdWVPZigpKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIHJldHVybiBpc0RhdGVTZWxlY3RhYmxlKGQpICYmXHJcbiAgICAgICAgICAgICAgICAgICBob3VyU2VsZWN0YWJsZShkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGlzTWludXRlU2VsZWN0YWJsZSA9IChkOkRhdGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKG5ldyBEYXRlKGQuZ2V0RnVsbFllYXIoKSwgZC5nZXRNb250aCgpLCBkLmdldERhdGUoKSwgZC5nZXRIb3VycygpLCBkLmdldE1pbnV0ZXMoKSkudmFsdWVPZigpIDwgbWF4RGF0ZS52YWx1ZU9mKCkgfHxcclxuICAgICAgICAgICAgICAgIG5ldyBEYXRlKGQuZ2V0RnVsbFllYXIoKSwgZC5nZXRNb250aCgpLCBkLmdldERhdGUoKSwgZC5nZXRIb3VycygpLCBkLmdldE1pbnV0ZXMoKSArIDEpLnZhbHVlT2YoKSA+IG1pbkRhdGUudmFsdWVPZigpKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIHJldHVybiBpc0hvdXJTZWxlY3RhYmxlKGQpICYmXHJcbiAgICAgICAgICAgICAgICAgICBtaW51dGVTZWxlY3RhYmxlKGQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgaXNTZWNvbmRTZWxlY3RhYmxlID0gKGQ6RGF0ZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAobmV3IERhdGUoZC5nZXRGdWxsWWVhcigpLCBkLmdldE1vbnRoKCksIGQuZ2V0RGF0ZSgpLCBkLmdldEhvdXJzKCksIGQuZ2V0TWludXRlcygpLCBkLmdldFNlY29uZHMoKSkudmFsdWVPZigpIDwgbWF4RGF0ZS52YWx1ZU9mKCkgfHxcclxuICAgICAgICAgICAgICAgIG5ldyBEYXRlKGQuZ2V0RnVsbFllYXIoKSwgZC5nZXRNb250aCgpLCBkLmdldERhdGUoKSwgZC5nZXRIb3VycygpLCBkLmdldE1pbnV0ZXMoKSwgZC5nZXRTZWNvbmRzKCkgKyAxKS52YWx1ZU9mKCkgPiBtaW5EYXRlLnZhbHVlT2YoKSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICByZXR1cm4gaXNNaW51dGVTZWxlY3RhYmxlKGQpICYmXHJcbiAgICAgICAgICAgICAgICAgICBzZWNvbmRTZWxlY3RhYmxlKGQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBsZXQgb3B0czpJT3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgZGlzcGxheUFzOiBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVEaXNwbGF5QXMob3B0aW9uc1snZGlzcGxheUFzJ10sIGRlZmF1bHRzLmRpc3BsYXlBcyksXHJcbiAgICAgICAgICAgIG1pbkRhdGU6IG1pbkRhdGUsXHJcbiAgICAgICAgICAgIG1heERhdGU6IG1heERhdGUsXHJcbiAgICAgICAgICAgIGRlZmF1bHREYXRlOiBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVEZWZhdWx0RGF0ZShvcHRpb25zWydkZWZhdWx0RGF0ZSddLCBkZWZhdWx0cy5kZWZhdWx0RGF0ZSksXHJcbiAgICAgICAgICAgIHRoZW1lOiBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemVUaGVtZShvcHRpb25zWyd0aGVtZSddLCBkZWZhdWx0cy50aGVtZSksXHJcbiAgICAgICAgICAgIG1pbGl0YXJ5VGltZTogT3B0aW9uU2FuaXRpemVyLnNhbml0aXplTWlsaXRhcnlUaW1lKG9wdGlvbnNbJ21pbGl0YXJ5VGltZSddLCBkZWZhdWx0cy5taWxpdGFyeVRpbWUpLFxyXG4gICAgICAgICAgICBpc1NlY29uZFNlbGVjdGFibGU6IGlzU2Vjb25kU2VsZWN0YWJsZSxcclxuICAgICAgICAgICAgaXNNaW51dGVTZWxlY3RhYmxlOiBpc01pbnV0ZVNlbGVjdGFibGUsXHJcbiAgICAgICAgICAgIGlzSG91clNlbGVjdGFibGU6IGlzSG91clNlbGVjdGFibGUsXHJcbiAgICAgICAgICAgIGlzRGF0ZVNlbGVjdGFibGU6IGlzRGF0ZVNlbGVjdGFibGUsXHJcbiAgICAgICAgICAgIGlzTW9udGhTZWxlY3RhYmxlOiBpc01vbnRoU2VsZWN0YWJsZSxcclxuICAgICAgICAgICAgaXNZZWFyU2VsZWN0YWJsZTogaXNZZWFyU2VsZWN0YWJsZVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gb3B0cztcclxuICAgIH1cclxufSIsImNsYXNzIENvbW1vbiB7XHJcbiAgICBwcm90ZWN0ZWQgZ2V0TW9udGhzKCkge1xyXG4gICAgICAgIHJldHVybiBbXCJKYW51YXJ5XCIsIFwiRmVicnVhcnlcIiwgXCJNYXJjaFwiLCBcIkFwcmlsXCIsIFwiTWF5XCIsIFwiSnVuZVwiLCBcIkp1bHlcIiwgXCJBdWd1c3RcIiwgXCJTZXB0ZW1iZXJcIiwgXCJPY3RvYmVyXCIsIFwiTm92ZW1iZXJcIiwgXCJEZWNlbWJlclwiXTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGdldFNob3J0TW9udGhzKCkge1xyXG4gICAgICAgIHJldHVybiBbXCJKYW5cIiwgXCJGZWJcIiwgXCJNYXJcIiwgXCJBcHJcIiwgXCJNYXlcIiwgXCJKdW5cIiwgXCJKdWxcIiwgXCJBdWdcIiwgXCJTZXBcIiwgXCJPY3RcIiwgXCJOb3ZcIiwgXCJEZWNcIl07XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBnZXREYXlzKCkge1xyXG4gICAgICAgIHJldHVybiBbXCJTdW5kYXlcIiwgXCJNb25kYXlcIiwgXCJUdWVzZGF5XCIsIFwiV2VkbmVzZGF5XCIsIFwiVGh1cnNkYXlcIiwgXCJGcmlkYXlcIiwgXCJTYXR1cmRheVwiXTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGdldFNob3J0RGF5cygpIHtcclxuICAgICAgICByZXR1cm4gW1wiU3VuXCIsIFwiTW9uXCIsIFwiVHVlXCIsIFwiV2VkXCIsIFwiVGh1XCIsIFwiRnJpXCIsIFwiU2F0XCJdO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgZGF5c0luTW9udGgoZGF0ZTpEYXRlKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpICsgMSwgMCkuZ2V0RGF0ZSgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgZ2V0SG91cnMoZGF0ZTpEYXRlKTpzdHJpbmcge1xyXG4gICAgICAgIGxldCBudW0gPSBkYXRlLmdldEhvdXJzKCk7XHJcbiAgICAgICAgaWYgKG51bSA9PT0gMCkgbnVtID0gMTI7XHJcbiAgICAgICAgaWYgKG51bSA+IDEyKSBudW0gLT0gMTI7XHJcbiAgICAgICAgcmV0dXJuIG51bS50b1N0cmluZygpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgZ2V0RGVjYWRlKGRhdGU6RGF0ZSk6c3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gYCR7TWF0aC5mbG9vcihkYXRlLmdldEZ1bGxZZWFyKCkvMTApKjEwfSAtICR7TWF0aC5jZWlsKChkYXRlLmdldEZ1bGxZZWFyKCkgKyAxKS8xMCkqMTB9YDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGdldE1lcmlkaWVtKGRhdGU6RGF0ZSk6c3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gZGF0ZS5nZXRIb3VycygpIDwgMTIgPyAnYW0nIDogJ3BtJztcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIHBhZChudW06bnVtYmVyfHN0cmluZywgc2l6ZTpudW1iZXIgPSAyKSB7XHJcbiAgICAgICAgbGV0IHN0ciA9IG51bS50b1N0cmluZygpO1xyXG4gICAgICAgIHdoaWxlKHN0ci5sZW5ndGggPCBzaXplKSBzdHIgPSAnMCcgKyBzdHI7XHJcbiAgICAgICAgcmV0dXJuIHN0cjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIHRyaW0oc3RyOnN0cmluZykge1xyXG4gICAgICAgIHdoaWxlIChzdHJbMF0gPT09ICcwJyAmJiBzdHIubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICBzdHIgPSBzdHIuc3Vic3RyKDEsIHN0ci5sZW5ndGgpOyAgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzdHI7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBnZXRDbGllbnRDb29yKGU6YW55KTp7eDpudW1iZXIsIHk6bnVtYmVyfSB7XHJcbiAgICAgICAgaWYgKGUuY2xpZW50WCAhPT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB4OiBlLmNsaWVudFgsXHJcbiAgICAgICAgICAgICAgICB5OiBlLmNsaWVudFlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB4OiBlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFgsXHJcbiAgICAgICAgICAgIHk6IGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIkN1c3RvbUV2ZW50ID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgZnVuY3Rpb24gdXNlTmF0aXZlICgpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBsZXQgY3VzdG9tRXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoJ2EnLCB7IGRldGFpbDogeyBiOiAnYicgfSB9KTtcclxuICAgICAgICAgICAgcmV0dXJuICAnYScgPT09IGN1c3RvbUV2ZW50LnR5cGUgJiYgJ2InID09PSBjdXN0b21FdmVudC5kZXRhaWwuYjtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgaWYgKHVzZU5hdGl2ZSgpKSB7XHJcbiAgICAgICAgcmV0dXJuIDxhbnk+Q3VzdG9tRXZlbnQ7XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkb2N1bWVudC5jcmVhdGVFdmVudCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIC8vIElFID49IDlcclxuICAgICAgICByZXR1cm4gPGFueT5mdW5jdGlvbih0eXBlOnN0cmluZywgcGFyYW1zOkN1c3RvbUV2ZW50SW5pdCkge1xyXG4gICAgICAgICAgICBsZXQgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdDdXN0b21FdmVudCcpO1xyXG4gICAgICAgICAgICBpZiAocGFyYW1zKSB7XHJcbiAgICAgICAgICAgICAgICBlLmluaXRDdXN0b21FdmVudCh0eXBlLCBwYXJhbXMuYnViYmxlcywgcGFyYW1zLmNhbmNlbGFibGUsIHBhcmFtcy5kZXRhaWwpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZS5pbml0Q3VzdG9tRXZlbnQodHlwZSwgZmFsc2UsIGZhbHNlLCB2b2lkIDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBlO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gSUUgPj0gOFxyXG4gICAgICAgIHJldHVybiA8YW55PmZ1bmN0aW9uKHR5cGU6c3RyaW5nLCBwYXJhbXM6Q3VzdG9tRXZlbnRJbml0KSB7XHJcbiAgICAgICAgICAgIGxldCBlID0gKDxhbnk+ZG9jdW1lbnQpLmNyZWF0ZUV2ZW50T2JqZWN0KCk7XHJcbiAgICAgICAgICAgIGUudHlwZSA9IHR5cGU7XHJcbiAgICAgICAgICAgIGlmIChwYXJhbXMpIHtcclxuICAgICAgICAgICAgICAgIGUuYnViYmxlcyA9IEJvb2xlYW4ocGFyYW1zLmJ1YmJsZXMpO1xyXG4gICAgICAgICAgICAgICAgZS5jYW5jZWxhYmxlID0gQm9vbGVhbihwYXJhbXMuY2FuY2VsYWJsZSk7XHJcbiAgICAgICAgICAgICAgICBlLmRldGFpbCA9IHBhcmFtcy5kZXRhaWw7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBlLmJ1YmJsZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGUuY2FuY2VsYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgZS5kZXRhaWwgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGU7XHJcbiAgICAgICAgfSBcclxuICAgIH0gIFxyXG59KSgpO1xyXG4iLCJpbnRlcmZhY2UgSUxpc3RlbmVyUmVmZXJlbmNlIHtcclxuICAgIGVsZW1lbnQ6IEVsZW1lbnR8RG9jdW1lbnR8V2luZG93O1xyXG4gICAgcmVmZXJlbmNlOiBFdmVudExpc3RlbmVyO1xyXG4gICAgZXZlbnQ6IHN0cmluZztcclxufVxyXG5cclxuaW50ZXJmYWNlIElEcmFnQ2FsbGJhY2tzIHtcclxuICAgIGRyYWdTdGFydD86KGU/Ok1vdXNlRXZlbnR8VG91Y2hFdmVudCkgPT4gdm9pZDtcclxuICAgIGRyYWdNb3ZlPzooZT86TW91c2VFdmVudHxUb3VjaEV2ZW50KSA9PiB2b2lkO1xyXG4gICAgZHJhZ0VuZD86KGU/Ok1vdXNlRXZlbnR8VG91Y2hFdmVudCkgPT4gdm9pZDtcclxufVxyXG5cclxubmFtZXNwYWNlIGxpc3RlbiB7XHJcbiAgICBsZXQgbWF0Y2hlcyA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5tYXRjaGVzIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5tc01hdGNoZXNTZWxlY3RvcjtcclxuICAgIFxyXG4gICAgZnVuY3Rpb24gaGFuZGxlRGVsZWdhdGVFdmVudChwYXJlbnQ6RWxlbWVudCwgZGVsZWdhdGVTZWxlY3RvcjpzdHJpbmcsIGNhbGxiYWNrOihlPzpNb3VzZUV2ZW50fFRvdWNoRXZlbnQpID0+IHZvaWQpIHtcclxuICAgICAgICByZXR1cm4gKGU6TW91c2VFdmVudHxUb3VjaEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSBlLnNyY0VsZW1lbnQgfHwgPEVsZW1lbnQ+ZS50YXJnZXQ7XHJcbiAgICAgICAgICAgIHdoaWxlKHRhcmdldCAhPT0gbnVsbCAmJiAhdGFyZ2V0LmlzRXF1YWxOb2RlKHBhcmVudCkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChtYXRjaGVzLmNhbGwodGFyZ2V0LCBkZWxlZ2F0ZVNlbGVjdG9yKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnRFbGVtZW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBmdW5jdGlvbiBhdHRhY2hFdmVudHNEZWxlZ2F0ZShldmVudHM6c3RyaW5nW10sIHBhcmVudDpFbGVtZW50LCBkZWxlZ2F0ZVNlbGVjdG9yOnN0cmluZywgY2FsbGJhY2s6KGU/Ok1vdXNlRXZlbnR8VG91Y2hFdmVudCkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xyXG4gICAgICAgIGxldCBsaXN0ZW5lcnM6SUxpc3RlbmVyUmVmZXJlbmNlW10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gZXZlbnRzKSB7XHJcbiAgICAgICAgICAgIGxldCBldmVudDpzdHJpbmcgPSBldmVudHNba2V5XTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBuZXdMaXN0ZW5lciA9IGhhbmRsZURlbGVnYXRlRXZlbnQocGFyZW50LCBkZWxlZ2F0ZVNlbGVjdG9yLCBjYWxsYmFjayk7XHJcbiAgICAgICAgICAgIGxpc3RlbmVycy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IHBhcmVudCxcclxuICAgICAgICAgICAgICAgIHJlZmVyZW5jZTogbmV3TGlzdGVuZXIsXHJcbiAgICAgICAgICAgICAgICBldmVudDogZXZlbnRcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBwYXJlbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgbmV3TGlzdGVuZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbGlzdGVuZXJzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBmdW5jdGlvbiBhdHRhY2hFdmVudHMoZXZlbnRzOnN0cmluZ1tdLCBlbGVtZW50OkVsZW1lbnR8RG9jdW1lbnR8V2luZG93LCBjYWxsYmFjazooZT86YW55KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgbGV0IGxpc3RlbmVyczpJTGlzdGVuZXJSZWZlcmVuY2VbXSA9IFtdO1xyXG4gICAgICAgIGV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICBsaXN0ZW5lcnMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50OiBlbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgcmVmZXJlbmNlOiBjYWxsYmFjayxcclxuICAgICAgICAgICAgICAgIGV2ZW50OiBldmVudFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBjYWxsYmFjayk7IFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBsaXN0ZW5lcnM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIE5BVElWRVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZm9jdXMoZWxlbWVudDpFbGVtZW50fERvY3VtZW50fFdpbmRvdywgY2FsbGJhY2s6KGU/OkZvY3VzRXZlbnQpID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdIHtcclxuICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzKFsnZm9jdXMnXSwgZWxlbWVudCwgKGUpID0+IHtcclxuICAgICAgICAgICAgY2FsbGJhY2soZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiBibHVyKGVsZW1lbnQ6RWxlbWVudHxEb2N1bWVudHxXaW5kb3csIGNhbGxiYWNrOihlPzpGb2N1c0V2ZW50KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ2JsdXInXSwgZWxlbWVudCwgKGUpID0+IHtcclxuICAgICAgICAgICAgY2FsbGJhY2soZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiBkb3duKGVsZW1lbnQ6RWxlbWVudHxEb2N1bWVudHxXaW5kb3csIGNhbGxiYWNrOihlPzpNb3VzZUV2ZW50fFRvdWNoRXZlbnQpID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdO1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGRvd24ocGFyZW50OkVsZW1lbnR8RG9jdW1lbnR8V2luZG93LCBkZWxlZ2F0ZVNlbGVjdG9yOnN0cmluZywgY2FsbGJhY2s6KGU/Ok1vdXNlRXZlbnR8VG91Y2hFdmVudCkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW107XHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZG93biguLi5wYXJhbXM6YW55W10pIHtcclxuICAgICAgICBpZiAocGFyYW1zLmxlbmd0aCA9PT0gMykge1xyXG4gICAgICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzRGVsZWdhdGUoWydtb3VzZWRvd24nLCAndG91Y2hzdGFydCddLCBwYXJhbXNbMF0sIHBhcmFtc1sxXSwgKGUpID0+IHtcclxuICAgICAgICAgICAgICAgIHBhcmFtc1syXSg8YW55PmUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzKFsnbW91c2Vkb3duJywgJ3RvdWNoc3RhcnQnXSwgcGFyYW1zWzBdLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcGFyYW1zWzFdKDxhbnk+ZSk7XHJcbiAgICAgICAgICAgIH0pOyAgICAgICAgXHJcbiAgICAgICAgfSBcclxuICAgIH07XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiB1cChlbGVtZW50OkVsZW1lbnR8RG9jdW1lbnR8V2luZG93LCBjYWxsYmFjazooZT86TW91c2VFdmVudCkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xyXG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydtb3VzZXVwJywgJ3RvdWNoZW5kJ10sIGVsZW1lbnQsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gbW91c2Vkb3duKGVsZW1lbnQ6RWxlbWVudHxEb2N1bWVudHxXaW5kb3csIGNhbGxiYWNrOihlPzpNb3VzZUV2ZW50KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ21vdXNlZG93biddLCBlbGVtZW50LCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBjYWxsYmFjayhlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIG1vdXNldXAoZWxlbWVudDpFbGVtZW50fERvY3VtZW50fFdpbmRvdywgY2FsbGJhY2s6KGU/Ok1vdXNlRXZlbnQpID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdIHtcclxuICAgICAgICByZXR1cm4gYXR0YWNoRXZlbnRzKFsnbW91c2V1cCddLCBlbGVtZW50LCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBjYWxsYmFjayhlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHBhc3RlKGVsZW1lbnQ6RWxlbWVudHxEb2N1bWVudHxXaW5kb3csIGNhbGxiYWNrOihlPzpNb3VzZUV2ZW50KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ3Bhc3RlJ10sIGVsZW1lbnQsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gdGFwKGVsZW1lbnQ6RWxlbWVudHxEb2N1bWVudCwgY2FsbGJhY2s6KGU/OkV2ZW50KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXTtcclxuICAgIGV4cG9ydCBmdW5jdGlvbiB0YXAocGFyZW50OkVsZW1lbnR8RG9jdW1lbnQsIGRlbGVnYXRlU2VsZWN0b3I6c3RyaW5nLCBjYWxsYmFjazooZT86RXZlbnQpID0+IHZvaWQpOklMaXN0ZW5lclJlZmVyZW5jZVtdO1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHRhcCguLi5wYXJhbXM6YW55W10pOklMaXN0ZW5lclJlZmVyZW5jZVtdIHtcclxuICAgICAgICBsZXQgc3RhcnRUb3VjaFg6bnVtYmVyLCBzdGFydFRvdWNoWTpudW1iZXI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGhhbmRsZVN0YXJ0ID0gKGU6VG91Y2hFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBzdGFydFRvdWNoWCA9IGUudG91Y2hlc1swXS5jbGllbnRYO1xyXG4gICAgICAgICAgICBzdGFydFRvdWNoWSA9IGUudG91Y2hlc1swXS5jbGllbnRZO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBsZXQgaGFuZGxlRW5kID0gKGU6VG91Y2hFdmVudCwgY2FsbGJhY2s6KGU/OkV2ZW50KSA9PiB2b2lkKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlLmNoYW5nZWRUb3VjaGVzID09PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgeERpZmYgPSBlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFggLSBzdGFydFRvdWNoWDtcclxuICAgICAgICAgICAgbGV0IHlEaWZmID0gZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRZIC0gc3RhcnRUb3VjaFk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoTWF0aC5zcXJ0KHhEaWZmICogeERpZmYgKyB5RGlmZiAqIHlEaWZmKSA8IDEwKSB7XHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBsZXQgbGlzdGVuZXJzOklMaXN0ZW5lclJlZmVyZW5jZVtdID0gW107XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHBhcmFtcy5sZW5ndGggPT09IDMpIHtcclxuICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChhdHRhY2hFdmVudHNEZWxlZ2F0ZShbJ3RvdWNoc3RhcnQnXSwgcGFyYW1zWzBdLCBwYXJhbXNbMV0sIGhhbmRsZVN0YXJ0KSk7XHJcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IGxpc3RlbmVycy5jb25jYXQoYXR0YWNoRXZlbnRzRGVsZWdhdGUoWyd0b3VjaGVuZCcsICdjbGljayddLCBwYXJhbXNbMF0sIHBhcmFtc1sxXSwgKGU6VG91Y2hFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlRW5kKGUsIHBhcmFtc1syXSk7XHJcbiAgICAgICAgICAgIH0pKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHBhcmFtcy5sZW5ndGggPT09IDIpIHtcclxuICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChhdHRhY2hFdmVudHMoWyd0b3VjaHN0YXJ0J10sIHBhcmFtc1swXSwgaGFuZGxlU3RhcnQpKTtcclxuICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChhdHRhY2hFdmVudHMoWyd0b3VjaGVuZCcsICdjbGljayddLCBwYXJhbXNbMF0sIChlOlRvdWNoRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZUVuZChlLCBwYXJhbXNbMV0pO1xyXG4gICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBsaXN0ZW5lcnM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIHN3aXBlKGVsZW1lbnQ6RWxlbWVudCwgZGlyZWN0aW9uOnN0cmluZywgY2FsbGJhY2s6KGU/OkV2ZW50KSA9PiB2b2lkKSB7XHJcbiAgICAgICAgbGV0IHN0YXJ0VG91Y2hYOm51bWJlciwgc3RhcnRUb3VjaFk6bnVtYmVyLCBzdGFydFRpbWU6bnVtYmVyO1xyXG4gICAgICAgIGxldCB0b3VjaE1vdmVMaXN0ZW5lcjpJTGlzdGVuZXJSZWZlcmVuY2U7XHJcbiAgICAgICAgbGV0IHNjcm9sbGluZ0Rpc2FibGVkOmJvb2xlYW47XHJcbiAgICAgICAgXHJcbiAgICAgICAgYXR0YWNoRXZlbnRzKFsndG91Y2hzdGFydCddLCBlbGVtZW50LCAoZTpUb3VjaEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHN0YXJ0VG91Y2hYID0gZS50b3VjaGVzWzBdLmNsaWVudFg7XHJcbiAgICAgICAgICAgIHN0YXJ0VG91Y2hZID0gZS50b3VjaGVzWzBdLmNsaWVudFk7XHJcbiAgICAgICAgICAgIHN0YXJ0VGltZSA9IG5ldyBEYXRlKCkudmFsdWVPZigpO1xyXG4gICAgICAgICAgICBzY3JvbGxpbmdEaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0b3VjaE1vdmVMaXN0ZW5lciA9IGF0dGFjaEV2ZW50cyhbJ3RvdWNobW92ZSddLCBkb2N1bWVudCwgKGU6VG91Y2hFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IHhEaWZmID0gTWF0aC5hYnMoZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRYIC0gc3RhcnRUb3VjaFgpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHlEaWZmID0gTWF0aC5hYnMoZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRZIC0gc3RhcnRUb3VjaFkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHhEaWZmID4geURpZmYgJiYgeERpZmYgPiAyMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbGluZ0Rpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoeURpZmYgPiB4RGlmZiAmJiB5RGlmZiA+IDIwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsaW5nRGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChuZXcgRGF0ZSgpLnZhbHVlT2YoKSAtIHN0YXJ0VGltZSA+IDUwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbGluZ0Rpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoc2Nyb2xsaW5nRGlzYWJsZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pWzBdOyBcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICBhdHRhY2hFdmVudHMoWyd0b3VjaGVuZCddLCBlbGVtZW50LCAoZTpUb3VjaEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIodG91Y2hNb3ZlTGlzdGVuZXIuZXZlbnQsIHRvdWNoTW92ZUxpc3RlbmVyLnJlZmVyZW5jZSk7XHJcbiAgICAgICAgICAgIGlmIChzdGFydFRvdWNoWCA9PT0gdm9pZCAwIHx8IHN0YXJ0VG91Y2hZID09PSB2b2lkIDApIHJldHVybjtcclxuICAgICAgICAgICAgaWYgKG5ldyBEYXRlKCkudmFsdWVPZigpIC0gc3RhcnRUaW1lID4gNTAwKSByZXR1cm47XHJcbiAgICAgICAgICAgIGxldCB4RGlmZiA9IGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WCAtIHN0YXJ0VG91Y2hYO1xyXG4gICAgICAgICAgICBsZXQgeURpZmYgPSBlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFkgLSBzdGFydFRvdWNoWTtcclxuICAgICAgICAgICAgaWYgKE1hdGguYWJzKHhEaWZmKSA+IE1hdGguYWJzKHlEaWZmKSAmJiBNYXRoLmFicyh4RGlmZikgPiAyMCkge1xyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJ2xlZnQnICYmIHhEaWZmIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJ3JpZ2h0JyAmJiB4RGlmZiA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gc3dpcGVMZWZ0KGVsZW1lbnQ6RWxlbWVudCwgY2FsbGJhY2s6KGU/OkV2ZW50KSA9PiB2b2lkKSB7XHJcbiAgICAgICAgc3dpcGUoZWxlbWVudCwgJ2xlZnQnLCBjYWxsYmFjayk7XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHN3aXBlUmlnaHQoZWxlbWVudDpFbGVtZW50LCBjYWxsYmFjazooZT86RXZlbnQpID0+IHZvaWQpIHtcclxuICAgICAgICBzd2lwZShlbGVtZW50LCAncmlnaHQnLCBjYWxsYmFjayk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiBkcmFnKGVsZW1lbnQ6RWxlbWVudCwgY2FsbGJhY2tzOklEcmFnQ2FsbGJhY2tzKTp2b2lkO1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGRyYWcocGFyZW50OkVsZW1lbnQsIGRlbGVnYXRlU2VsZWN0b3I6c3RyaW5nLCBjYWxsYmFja3M6SURyYWdDYWxsYmFja3MpOnZvaWQ7XHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZHJhZyguLi5wYXJhbXM6YW55W10pOnZvaWQge1xyXG4gICAgICAgIGxldCBkcmFnZ2luZzpib29sZWFuID0gZmFsc2U7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGNhbGxiYWNrczpJRHJhZ0NhbGxiYWNrcyA9IHBhcmFtc1twYXJhbXMubGVuZ3RoLTFdO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBzdGFydEV2ZW50cyA9IChlPzpNb3VzZUV2ZW50fFRvdWNoRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgZHJhZ2dpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICBpZiAoY2FsbGJhY2tzLmRyYWdTdGFydCAhPT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgICAgICBjYWxsYmFja3MuZHJhZ1N0YXJ0KGUpO1xyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgbGlzdGVuZXJzOklMaXN0ZW5lclJlZmVyZW5jZVtdID0gW107XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuY29uY2F0KGF0dGFjaEV2ZW50cyhbJ3RvdWNobW92ZScsICdtb3VzZW1vdmUnXSwgZG9jdW1lbnQsIChlPzpNb3VzZUV2ZW50fFRvdWNoRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChkcmFnZ2luZyAmJiBjYWxsYmFja3MuZHJhZ01vdmUgIT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrcy5kcmFnTW92ZShlKTtcclxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChhdHRhY2hFdmVudHMoWyd0b3VjaGVuZCcsICdtb3VzZXVwJ10sIGRvY3VtZW50LCAoZT86TW91c2VFdmVudHxUb3VjaEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZHJhZ2dpbmcgJiYgY2FsbGJhY2tzLmRyYWdFbmQgIT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrcy5kcmFnRW5kKGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGRyYWdnaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICByZW1vdmVMaXN0ZW5lcnMobGlzdGVuZXJzKTsgICAgICAgICAgICBcclxuICAgICAgICAgICAgfSkpOyAgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChwYXJhbXMubGVuZ3RoID09PSAzKSB7XHJcbiAgICAgICAgICAgIGF0dGFjaEV2ZW50c0RlbGVnYXRlKFsndG91Y2hzdGFydCcsICdtb3VzZWRvd24nXSwgcGFyYW1zWzBdLCBwYXJhbXNbMV0sIHN0YXJ0RXZlbnRzKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBhdHRhY2hFdmVudHMoWyd0b3VjaHN0YXJ0JywgJ21vdXNlZG93biddLCBwYXJhbXNbMF0sIHN0YXJ0RXZlbnRzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIENVU1RPTVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZ290byhlbGVtZW50OkVsZW1lbnQsIGNhbGxiYWNrOihlPzp7ZGF0ZTpEYXRlLCBsZXZlbDpMZXZlbCwgdXBkYXRlPzpib29sZWFufSkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xyXG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydkYXRpdW0tZ290byddLCBlbGVtZW50LCAoZTpDdXN0b21FdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBjYWxsYmFjayhlLmRldGFpbCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiB6b29tT3V0KGVsZW1lbnQ6RWxlbWVudCwgY2FsbGJhY2s6KGU/OntkYXRlOkRhdGUsIGN1cnJlbnRMZXZlbDpMZXZlbCwgdXBkYXRlPzpib29sZWFufSkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xyXG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydkYXRpdW0tem9vbS1vdXQnXSwgZWxlbWVudCwgKGU6Q3VzdG9tRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgY2FsbGJhY2soZS5kZXRhaWwpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gem9vbUluKGVsZW1lbnQ6RWxlbWVudCwgY2FsbGJhY2s6KGU/OntkYXRlOkRhdGUsIGN1cnJlbnRMZXZlbDpMZXZlbCwgdXBkYXRlPzpib29sZWFufSkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xyXG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydkYXRpdW0tem9vbS1pbiddLCBlbGVtZW50LCAoZTpDdXN0b21FdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBjYWxsYmFjayhlLmRldGFpbCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiB2aWV3Y2hhbmdlZChlbGVtZW50OkVsZW1lbnQsIGNhbGxiYWNrOihlPzp7ZGF0ZTpEYXRlLCBsZXZlbDpMZXZlbCwgdXBkYXRlPzpib29sZWFufSkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xyXG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydkYXRpdW0tdmlld2NoYW5nZWQnXSwgZWxlbWVudCwgKGU6Q3VzdG9tRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgY2FsbGJhY2soZS5kZXRhaWwpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gb3BlbkJ1YmJsZShlbGVtZW50OkVsZW1lbnQsIGNhbGxiYWNrOihlOnt4Om51bWJlciwgeTpudW1iZXIsIHRleHQ6c3RyaW5nfSkgPT4gdm9pZCk6SUxpc3RlbmVyUmVmZXJlbmNlW10ge1xyXG4gICAgICAgIHJldHVybiBhdHRhY2hFdmVudHMoWydkYXRpdW0tb3Blbi1idWJibGUnXSwgZWxlbWVudCwgKGU6Q3VzdG9tRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgY2FsbGJhY2soZS5kZXRhaWwpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gdXBkYXRlQnViYmxlKGVsZW1lbnQ6RWxlbWVudCwgY2FsbGJhY2s6KGU6e3g6bnVtYmVyLCB5Om51bWJlciwgdGV4dDpzdHJpbmd9KSA9PiB2b2lkKTpJTGlzdGVuZXJSZWZlcmVuY2VbXSB7XHJcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50cyhbJ2RhdGl1bS11cGRhdGUtYnViYmxlJ10sIGVsZW1lbnQsIChlOkN1c3RvbUV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGUuZGV0YWlsKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVycyhsaXN0ZW5lcnM6SUxpc3RlbmVyUmVmZXJlbmNlW10pIHtcclxuICAgICAgICBsaXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIpID0+IHtcclxuICAgICAgICAgICBsaXN0ZW5lci5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIobGlzdGVuZXIuZXZlbnQsIGxpc3RlbmVyLnJlZmVyZW5jZSk7IFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5uYW1lc3BhY2UgdHJpZ2dlciB7XHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZ290byhlbGVtZW50OkVsZW1lbnQsIGRhdGE/OntkYXRlOkRhdGUsIGxldmVsOkxldmVsLCB1cGRhdGU/OmJvb2xlYW59KSB7XHJcbiAgICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnZGF0aXVtLWdvdG8nLCB7XHJcbiAgICAgICAgICAgIGJ1YmJsZXM6IGZhbHNlLFxyXG4gICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICBkZXRhaWw6IGRhdGFcclxuICAgICAgICB9KSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiB6b29tT3V0KGVsZW1lbnQ6RWxlbWVudCwgZGF0YT86e2RhdGU6RGF0ZSwgY3VycmVudExldmVsOkxldmVsLCB1cGRhdGU/OmJvb2xlYW59KSB7XHJcbiAgICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnZGF0aXVtLXpvb20tb3V0Jywge1xyXG4gICAgICAgICAgICBidWJibGVzOiBmYWxzZSwgXHJcbiAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXHJcbiAgICAgICAgICAgIGRldGFpbDogZGF0YVxyXG4gICAgICAgIH0pKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHpvb21JbihlbGVtZW50OkVsZW1lbnQsIGRhdGE/OntkYXRlOkRhdGUsIGN1cnJlbnRMZXZlbDpMZXZlbCwgdXBkYXRlPzpib29sZWFufSkge1xyXG4gICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2RhdGl1bS16b29tLWluJywge1xyXG4gICAgICAgICAgICBidWJibGVzOiBmYWxzZSwgXHJcbiAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXHJcbiAgICAgICAgICAgIGRldGFpbDogZGF0YVxyXG4gICAgICAgIH0pKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHZpZXdjaGFuZ2VkKGVsZW1lbnQ6RWxlbWVudCwgZGF0YT86e2RhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWwsIHVwZGF0ZT86Ym9vbGVhbn0pIHtcclxuICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdkYXRpdW0tdmlld2NoYW5nZWQnLCB7XHJcbiAgICAgICAgICAgIGJ1YmJsZXM6IGZhbHNlLFxyXG4gICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICBkZXRhaWw6IGRhdGFcclxuICAgICAgICB9KSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiBvcGVuQnViYmxlKGVsZW1lbnQ6RWxlbWVudCwgZGF0YTp7eDpudW1iZXIsIHk6bnVtYmVyLCB0ZXh0OnN0cmluZ30pIHtcclxuICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdkYXRpdW0tb3Blbi1idWJibGUnLCB7XHJcbiAgICAgICAgICAgIGJ1YmJsZXM6IGZhbHNlLFxyXG4gICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICBkZXRhaWw6IGRhdGFcclxuICAgICAgICB9KSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiB1cGRhdGVCdWJibGUoZWxlbWVudDpFbGVtZW50LCBkYXRhOnt4Om51bWJlciwgeTpudW1iZXIsIHRleHQ6c3RyaW5nfSkge1xyXG4gICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2RhdGl1bS11cGRhdGUtYnViYmxlJywge1xyXG4gICAgICAgICAgICBidWJibGVzOiBmYWxzZSxcclxuICAgICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgZGV0YWlsOiBkYXRhXHJcbiAgICAgICAgfSkpO1xyXG4gICAgfVxyXG59IiwiaW50ZXJmYWNlIElEYXRlUGFydCB7XHJcbiAgICBpbmNyZW1lbnQoKTp2b2lkO1xyXG4gICAgZGVjcmVtZW50KCk6dm9pZDtcclxuICAgIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpOmJvb2xlYW47XHJcbiAgICBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZyk6Ym9vbGVhbjtcclxuICAgIGdldExhc3RWYWx1ZSgpOkRhdGU7XHJcbiAgICBnZXRWYWx1ZSgpOkRhdGU7XHJcbiAgICBnZXRSZWdFeCgpOlJlZ0V4cDtcclxuICAgIHNldFNlbGVjdGFibGUoc2VsZWN0YWJsZTpib29sZWFuKTpJRGF0ZVBhcnQ7XHJcbiAgICBnZXRNYXhCdWZmZXIoKTpudW1iZXI7XHJcbiAgICBnZXRMZXZlbCgpOkxldmVsO1xyXG4gICAgaXNTZWxlY3RhYmxlKCk6Ym9vbGVhbjtcclxuICAgIHRvU3RyaW5nKCk6c3RyaW5nO1xyXG59XHJcblxyXG5jbGFzcyBQbGFpblRleHQgaW1wbGVtZW50cyBJRGF0ZVBhcnQge1xyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSB0ZXh0OnN0cmluZykge31cclxuICAgIHB1YmxpYyBpbmNyZW1lbnQoKSB7fVxyXG4gICAgcHVibGljIGRlY3JlbWVudCgpIHt9XHJcbiAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbCgpIHsgcmV0dXJuIGZhbHNlIH1cclxuICAgIHB1YmxpYyBzZXRWYWx1ZSgpIHsgcmV0dXJuIGZhbHNlIH1cclxuICAgIHB1YmxpYyBnZXRMYXN0VmFsdWUoKTpEYXRlIHsgcmV0dXJuIG51bGwgfVxyXG4gICAgcHVibGljIGdldFZhbHVlKCk6RGF0ZSB7IHJldHVybiBudWxsIH1cclxuICAgIHB1YmxpYyBnZXRSZWdFeCgpOlJlZ0V4cCB7IHJldHVybiBuZXcgUmVnRXhwKGBbJHt0aGlzLnRleHR9XWApOyB9XHJcbiAgICBwdWJsaWMgc2V0U2VsZWN0YWJsZShzZWxlY3RhYmxlOmJvb2xlYW4pOklEYXRlUGFydCB7IHJldHVybiB0aGlzIH1cclxuICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKTpudW1iZXIgeyByZXR1cm4gMCB9XHJcbiAgICBwdWJsaWMgZ2V0TGV2ZWwoKTpMZXZlbCB7IHJldHVybiBMZXZlbC5OT05FIH1cclxuICAgIHB1YmxpYyBpc1NlbGVjdGFibGUoKTpib29sZWFuIHsgcmV0dXJuIGZhbHNlIH1cclxuICAgIHB1YmxpYyB0b1N0cmluZygpOnN0cmluZyB7IHJldHVybiB0aGlzLnRleHQgfVxyXG59XHJcbiAgICBcclxubGV0IGZvcm1hdEJsb2NrcyA9IChmdW5jdGlvbigpIHsgICAgXHJcbiAgICBjbGFzcyBEYXRlUGFydCBleHRlbmRzIENvbW1vbiB7XHJcbiAgICAgICAgcHJvdGVjdGVkIGRhdGU6RGF0ZTtcclxuICAgICAgICBwcm90ZWN0ZWQgc2VsZWN0YWJsZTpib29sZWFuID0gdHJ1ZTtcclxuICAgICAgICBcclxuICAgICAgICBwcml2YXRlIGN1cnJlbnQ6RGF0ZTtcclxuICAgICAgICBwcml2YXRlIGxhc3Q6RGF0ZTtcclxuICAgICAgICBcclxuICAgICAgICBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgb3B0aW9uczpJT3B0aW9ucykge1xyXG4gICAgICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0VmFsdWUoKTpEYXRlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0U2VsZWN0YWJsZShzZWxlY3RhYmxlOmJvb2xlYW4pIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RhYmxlID0gc2VsZWN0YWJsZTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBpc1NlbGVjdGFibGUoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGFibGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHByb3RlY3RlZCBzZXRMYXN0KCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50ID09PSB2b2lkIDAgfHxcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9PT0gdm9pZCAwIHx8XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUudmFsdWVPZigpICE9PSB0aGlzLmN1cnJlbnQudmFsdWVPZigpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3QgPSB0aGlzLmN1cnJlbnQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnQgPSB0aGlzLmRhdGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldExhc3RWYWx1ZSgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubGFzdDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIEZvdXJEaWdpdFllYXIgZXh0ZW5kcyBEYXRlUGFydCB7XHJcbiAgICAgICAgY29uc3RydWN0b3Iob3B0aW9uczpJT3B0aW9ucykgeyBzdXBlcihvcHRpb25zKTsgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBpbmNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRGdWxsWWVhcih0aGlzLmRhdGUuZ2V0RnVsbFllYXIoKSArIDEpO1xyXG4gICAgICAgICAgICB9IHdoaWxlICghdGhpcy5vcHRpb25zLmlzWWVhclNlbGVjdGFibGUodGhpcy5kYXRlKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZGVjcmVtZW50KCkge1xyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0RnVsbFllYXIodGhpcy5kYXRlLmdldEZ1bGxZZWFyKCkgLSAxKTtcclxuICAgICAgICAgICAgfSB3aGlsZSAoIXRoaXMub3B0aW9ucy5pc1llYXJTZWxlY3RhYmxlKHRoaXMuZGF0ZSkpO1xyXG4gICAgICAgICAgICB0aGlzLnNldExhc3QoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUocGFydGlhbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRGdWxsWWVhcihwYXJzZUludCh2YWx1ZSwgMTApKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXi0/XFxkezEsNH0kLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIExldmVsLllFQVI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXRGdWxsWWVhcigpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBUd29EaWdpdFllYXIgZXh0ZW5kcyBGb3VyRGlnaXRZZWFyIHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihvcHRpb25zOklPcHRpb25zKSB7IHN1cGVyKG9wdGlvbnMpOyB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBiYXNlID0gTWF0aC5mbG9vcihzdXBlci5nZXRWYWx1ZSgpLmdldEZ1bGxZZWFyKCkvMTAwKSoxMDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0RnVsbFllYXIocGFyc2VJbnQoPHN0cmluZz52YWx1ZSwgMTApICsgYmFzZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldExhc3QoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL14tP1xcZHsxLDJ9JC87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLnRvU3RyaW5nKCkuc2xpY2UoLTIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgTG9uZ01vbnRoTmFtZSBleHRlbmRzIERhdGVQYXJ0IHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihvcHRpb25zOklPcHRpb25zKSB7IHN1cGVyKG9wdGlvbnMpOyB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHJvdGVjdGVkIGdldE1vbnRocygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLmdldE1vbnRocygpO1xyXG4gICAgICAgIH0gXHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGluY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRNb250aCgpICsgMTtcclxuICAgICAgICAgICAgICAgIGlmIChudW0gPiAxMSkgbnVtID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRNb250aChudW0pO1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKHRoaXMuZGF0ZS5nZXRNb250aCgpID4gbnVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldERhdGUodGhpcy5kYXRlLmdldERhdGUoKSAtIDEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IHdoaWxlICghdGhpcy5vcHRpb25zLmlzTW9udGhTZWxlY3RhYmxlKHRoaXMuZGF0ZSkpO1xyXG4gICAgICAgICAgICB0aGlzLnNldExhc3QoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGRlY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRNb250aCgpIC0gMTtcclxuICAgICAgICAgICAgICAgIGlmIChudW0gPCAwKSBudW0gPSAxMTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRNb250aChudW0pO1xyXG4gICAgICAgICAgICB9IHdoaWxlICghdGhpcy5vcHRpb25zLmlzTW9udGhTZWxlY3RhYmxlKHRoaXMuZGF0ZSkpO1xyXG4gICAgICAgICAgICB0aGlzLnNldExhc3QoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgbGV0IG1vbnRoID0gdGhpcy5nZXRNb250aHMoKS5maWx0ZXIoKG1vbnRoKSA9PiB7XHJcbiAgICAgICAgICAgICAgIHJldHVybiBuZXcgUmVnRXhwKGBeJHtwYXJ0aWFsfS4qJGAsICdpJykudGVzdChtb250aCk7IFxyXG4gICAgICAgICAgICB9KVswXTtcclxuICAgICAgICAgICAgaWYgKG1vbnRoICE9PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKG1vbnRoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmdldE1vbnRocygpLmluZGV4T2YodmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1vbnRoKG51bSk7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAodGhpcy5kYXRlLmdldE1vbnRoKCkgPiBudW0pIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0RGF0ZSh0aGlzLmRhdGUuZ2V0RGF0ZSgpIC0gMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldExhc3QoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cChgXigoJHt0aGlzLmdldE1vbnRocygpLmpvaW4oXCIpfChcIil9KSkkYCwgJ2knKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFsyLDEsMywyLDMsMywzLDIsMSwxLDEsMV1bdGhpcy5kYXRlLmdldE1vbnRoKCldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBMZXZlbC5NT05USDtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRNb250aHMoKVt0aGlzLmRhdGUuZ2V0TW9udGgoKV07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBTaG9ydE1vbnRoTmFtZSBleHRlbmRzIExvbmdNb250aE5hbWUge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6SU9wdGlvbnMpIHsgc3VwZXIob3B0aW9ucyk7IH1cclxuICAgICAgICBcclxuICAgICAgICBwcm90ZWN0ZWQgZ2V0TW9udGhzKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3VwZXIuZ2V0U2hvcnRNb250aHMoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIE1vbnRoIGV4dGVuZHMgTG9uZ01vbnRoTmFtZSB7XHJcbiAgICAgICAgY29uc3RydWN0b3Iob3B0aW9uczpJT3B0aW9ucykgeyBzdXBlcihvcHRpb25zKTsgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0TW9udGgoKSA+IDAgPyAxIDogMjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKC9eXFxkezEsMn0kLy50ZXN0KHBhcnRpYWwpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdHJpbW1lZCA9IHRoaXMudHJpbShwYXJ0aWFsID09PSAnMCcgPyAnMScgOiBwYXJ0aWFsKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHRyaW1tZWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRMYXN0KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHRoaXMuZ2V0UmVnRXgoKS50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1vbnRoKHBhcnNlSW50KHZhbHVlLCAxMCkgLSAxKTtcclxuICAgICAgICAgICAgICAgIHdoaWxlICh0aGlzLmRhdGUuZ2V0TW9udGgoKSA+IHBhcnNlSW50KHZhbHVlLCAxMCkgLSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldERhdGUodGhpcy5kYXRlLmdldERhdGUoKSAtIDEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRMYXN0KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eKFsxLTldfCgxWzAtMl0pKSQvO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAodGhpcy5kYXRlLmdldE1vbnRoKCkgKyAxKS50b1N0cmluZygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgUGFkZGVkTW9udGggZXh0ZW5kcyBNb250aCB7XHJcbiAgICAgICAgY29uc3RydWN0b3Iob3B0aW9uczpJT3B0aW9ucykgeyBzdXBlcihvcHRpb25zKTsgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICgvXlxcZHsxLDJ9JC8udGVzdChwYXJ0aWFsKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhZGRlZCA9IHRoaXMucGFkKHBhcnRpYWwgPT09ICcwJyA/ICcxJyA6IHBhcnRpYWwpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUocGFkZGVkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eKCgwWzEtOV0pfCgxWzAtMl0pKSQvOyAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhZChzdXBlci50b1N0cmluZygpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIERhdGVOdW1lcmFsIGV4dGVuZHMgRGF0ZVBhcnQge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6SU9wdGlvbnMpIHsgc3VwZXIob3B0aW9ucyk7IH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgaW5jcmVtZW50KCkge1xyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldERhdGUoKSArIDE7XHJcbiAgICAgICAgICAgICAgICBpZiAobnVtID4gdGhpcy5kYXlzSW5Nb250aCh0aGlzLmRhdGUpKSBudW0gPSAxO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldERhdGUobnVtKTtcclxuICAgICAgICAgICAgfSB3aGlsZSAoIXRoaXMub3B0aW9ucy5pc0RhdGVTZWxlY3RhYmxlKHRoaXMuZGF0ZSkpO1xyXG4gICAgICAgICAgICB0aGlzLnNldExhc3QoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGRlY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXREYXRlKCkgLSAxO1xyXG4gICAgICAgICAgICAgICAgaWYgKG51bSA8IDEpIG51bSA9IHRoaXMuZGF5c0luTW9udGgodGhpcy5kYXRlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXREYXRlKG51bSk7XHJcbiAgICAgICAgICAgIH0gd2hpbGUgKCF0aGlzLm9wdGlvbnMuaXNEYXRlU2VsZWN0YWJsZSh0aGlzLmRhdGUpKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRMYXN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICgvXlxcZHsxLDJ9JC8udGVzdChwYXJ0aWFsKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHRyaW1tZWQgPSB0aGlzLnRyaW0ocGFydGlhbCA9PT0gJzAnID8gJzEnIDogcGFydGlhbCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0cmltbWVkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkgJiYgcGFyc2VJbnQodmFsdWUsIDEwKSA8IHRoaXMuZGF5c0luTW9udGgodGhpcy5kYXRlKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldERhdGUocGFyc2VJbnQodmFsdWUsIDEwKSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldExhc3QoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL15bMS05XXwoKDF8MilbMC05XSl8KDNbMC0xXSkkLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXREYXRlKCkgPiBNYXRoLmZsb29yKHRoaXMuZGF5c0luTW9udGgodGhpcy5kYXRlKS8xMCkgPyAxIDogMjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldExldmVsKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTGV2ZWwuREFURTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldERhdGUoKS50b1N0cmluZygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgUGFkZGVkRGF0ZSBleHRlbmRzIERhdGVOdW1lcmFsIHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihvcHRpb25zOklPcHRpb25zKSB7IHN1cGVyKG9wdGlvbnMpOyB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKC9eXFxkezEsMn0kLy50ZXN0KHBhcnRpYWwpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGFkZGVkID0gdGhpcy5wYWQocGFydGlhbCA9PT0gJzAnID8gJzEnIDogcGFydGlhbCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZShwYWRkZWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL14oMFsxLTldKXwoKDF8MilbMC05XSl8KDNbMC0xXSkkLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYWQodGhpcy5kYXRlLmdldERhdGUoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBEYXRlT3JkaW5hbCBleHRlbmRzIERhdGVOdW1lcmFsIHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihvcHRpb25zOklPcHRpb25zKSB7IHN1cGVyKG9wdGlvbnMpOyB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldFJlZ0V4KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gL14oWzEtOV18KCgxfDIpWzAtOV0pfCgzWzAtMV0pKSgoc3QpfChuZCl8KHJkKXwodGgpKT8kL2k7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgbGV0IGRhdGUgPSB0aGlzLmRhdGUuZ2V0RGF0ZSgpO1xyXG4gICAgICAgICAgICBsZXQgaiA9IGRhdGUgJSAxMDtcclxuICAgICAgICAgICAgbGV0IGsgPSBkYXRlICUgMTAwO1xyXG4gICAgICAgICAgICBpZiAoaiA9PT0gMSAmJiBrICE9PSAxMSkgcmV0dXJuIGRhdGUgKyBcInN0XCI7XHJcbiAgICAgICAgICAgIGlmIChqID09PSAyICYmIGsgIT09IDEyKSByZXR1cm4gZGF0ZSArIFwibmRcIjtcclxuICAgICAgICAgICAgaWYgKGogPT09IDMgJiYgayAhPT0gMTMpIHJldHVybiBkYXRlICsgXCJyZFwiO1xyXG4gICAgICAgICAgICByZXR1cm4gZGF0ZSArIFwidGhcIjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIExvbmdEYXlOYW1lIGV4dGVuZHMgRGF0ZVBhcnQge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6SU9wdGlvbnMpIHsgc3VwZXIob3B0aW9ucyk7IH1cclxuICAgICAgICBcclxuICAgICAgICBwcm90ZWN0ZWQgZ2V0RGF5cygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLmdldERheXMoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGluY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXREYXkoKSArIDE7XHJcbiAgICAgICAgICAgICAgICBpZiAobnVtID4gNikgbnVtID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXREYXRlKHRoaXMuZGF0ZS5nZXREYXRlKCkgLSB0aGlzLmRhdGUuZ2V0RGF5KCkgKyBudW0pO1xyXG4gICAgICAgICAgICB9IHdoaWxlICghdGhpcy5vcHRpb25zLmlzRGF0ZVNlbGVjdGFibGUodGhpcy5kYXRlKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZGVjcmVtZW50KCkge1xyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldERheSgpIC0gMTtcclxuICAgICAgICAgICAgICAgIGlmIChudW0gPCAwKSBudW0gPSA2O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldERhdGUodGhpcy5kYXRlLmdldERhdGUoKSAtIHRoaXMuZGF0ZS5nZXREYXkoKSArIG51bSk7XHJcbiAgICAgICAgICAgIH0gd2hpbGUgKCF0aGlzLm9wdGlvbnMuaXNEYXRlU2VsZWN0YWJsZSh0aGlzLmRhdGUpKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRMYXN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXkgPSB0aGlzLmdldERheXMoKS5maWx0ZXIoKGRheSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoYF4ke3BhcnRpYWx9LiokYCwgJ2knKS50ZXN0KGRheSk7XHJcbiAgICAgICAgICAgIH0pWzBdO1xyXG4gICAgICAgICAgICBpZiAoZGF5ICE9PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKGRheSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKHZhbHVlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldExhc3QoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5nZXREYXlzKCkuaW5kZXhPZih2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0RGF0ZSh0aGlzLmRhdGUuZ2V0RGF0ZSgpIC0gdGhpcy5kYXRlLmdldERheSgpICsgbnVtKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUmVnRXhwKGBeKCgke3RoaXMuZ2V0RGF5cygpLmpvaW4oXCIpfChcIil9KSkkYCwgJ2knKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFsyLDEsMiwxLDIsMSwyXVt0aGlzLmRhdGUuZ2V0RGF5KCldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBMZXZlbC5EQVRFO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldERheXMoKVt0aGlzLmRhdGUuZ2V0RGF5KCldO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgU2hvcnREYXlOYW1lIGV4dGVuZHMgTG9uZ0RheU5hbWUge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6SU9wdGlvbnMpIHsgc3VwZXIob3B0aW9ucyk7IH1cclxuICAgICAgICBcclxuICAgICAgICBwcm90ZWN0ZWQgZ2V0RGF5cygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLmdldFNob3J0RGF5cygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgUGFkZGVkTWlsaXRhcnlIb3VyIGV4dGVuZHMgRGF0ZVBhcnQge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6SU9wdGlvbnMpIHsgc3VwZXIob3B0aW9ucyk7IH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgaW5jcmVtZW50KCkge1xyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldEhvdXJzKCkgKyAxO1xyXG4gICAgICAgICAgICAgICAgaWYgKG51bSA+IDIzKSBudW0gPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldEhvdXJzKG51bSk7XHJcbiAgICAgICAgICAgIH0gd2hpbGUgKCF0aGlzLm9wdGlvbnMuaXNIb3VyU2VsZWN0YWJsZSh0aGlzLmRhdGUpKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRMYXN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBkZWNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0SG91cnMoKSAtIDE7XHJcbiAgICAgICAgICAgICAgICBpZiAobnVtIDwgMCkgbnVtID0gMjM7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnMobnVtKTtcclxuICAgICAgICAgICAgICAgIC8vIERheSBMaWdodCBTYXZpbmdzIEFkanVzdG1lbnRcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmRhdGUuZ2V0SG91cnMoKSAhPT0gbnVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldEhvdXJzKG51bSAtIDEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IHdoaWxlICghdGhpcy5vcHRpb25zLmlzSG91clNlbGVjdGFibGUodGhpcy5kYXRlKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAoL15cXGR7MSwyfSQvLnRlc3QocGFydGlhbCkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBwYWRkZWQgPSB0aGlzLnBhZChwYXJ0aWFsKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHBhZGRlZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKHZhbHVlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldExhc3QoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnMocGFyc2VJbnQodmFsdWUsIDEwKSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldExhc3QoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXRIb3VycygpID4gMiA/IDEgOiAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBMZXZlbC5IT1VSO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXigoKDB8MSlbMC05XSl8KDJbMC0zXSkpJC87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFkKHRoaXMuZGF0ZS5nZXRIb3VycygpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIE1pbGl0YXJ5SG91ciBleHRlbmRzIFBhZGRlZE1pbGl0YXJ5SG91ciB7XHJcbiAgICAgICAgY29uc3RydWN0b3Iob3B0aW9uczpJT3B0aW9ucykgeyBzdXBlcihvcHRpb25zKTsgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICgvXlxcZHsxLDJ9JC8udGVzdChwYXJ0aWFsKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHRyaW1tZWQgPSB0aGlzLnRyaW0ocGFydGlhbCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0cmltbWVkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eKCgxP1swLTldKXwoMlswLTNdKSkkLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldEhvdXJzKCkudG9TdHJpbmcoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIFBhZGRlZEhvdXIgZXh0ZW5kcyBQYWRkZWRNaWxpdGFyeUhvdXIge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6SU9wdGlvbnMpIHsgc3VwZXIob3B0aW9ucyk7IH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICBsZXQgcGFkZGVkID0gdGhpcy5wYWQocGFydGlhbCA9PT0gJzAnID8gJzEnIDogcGFydGlhbCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHBhZGRlZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBudW0gPSBwYXJzZUludCh2YWx1ZSwgMTApO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZGF0ZS5nZXRIb3VycygpIDwgMTIgJiYgbnVtID09PSAxMikgbnVtID0gMDtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmRhdGUuZ2V0SG91cnMoKSA+IDExICYmIG51bSAhPT0gMTIpIG51bSArPSAxMjtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3VycyhudW0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRMYXN0KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eKDBbMS05XSl8KDFbMC0yXSkkLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlSW50KHRoaXMudG9TdHJpbmcoKSwgMTApID4gMSA/IDEgOiAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhZCh0aGlzLmdldEhvdXJzKHRoaXMuZGF0ZSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgSG91ciBleHRlbmRzIFBhZGRlZEhvdXIge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6SU9wdGlvbnMpIHsgc3VwZXIob3B0aW9ucyk7IH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICBsZXQgdHJpbW1lZCA9IHRoaXMudHJpbShwYXJ0aWFsID09PSAnMCcgPyAnMScgOiBwYXJ0aWFsKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUodHJpbW1lZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eWzEtOV18KDFbMC0yXSkkLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50cmltKHN1cGVyLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgUGFkZGVkTWludXRlIGV4dGVuZHMgRGF0ZVBhcnQge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6SU9wdGlvbnMpIHsgc3VwZXIob3B0aW9ucyk7IH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgaW5jcmVtZW50KCkge1xyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldE1pbnV0ZXMoKSArIDE7XHJcbiAgICAgICAgICAgICAgICBpZiAobnVtID4gNTkpIG51bSA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0TWludXRlcyhudW0pO1xyXG4gICAgICAgICAgICB9IHdoaWxlICghdGhpcy5vcHRpb25zLmlzTWludXRlU2VsZWN0YWJsZSh0aGlzLmRhdGUpKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRMYXN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBkZWNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0TWludXRlcygpIC0gMTtcclxuICAgICAgICAgICAgICAgIGlmIChudW0gPCAwKSBudW0gPSA1OTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRNaW51dGVzKG51bSk7XHJcbiAgICAgICAgICAgIH0gd2hpbGUgKCF0aGlzLm9wdGlvbnMuaXNNaW51dGVTZWxlY3RhYmxlKHRoaXMuZGF0ZSkpO1xyXG4gICAgICAgICAgICB0aGlzLnNldExhc3QoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlRnJvbVBhcnRpYWwocGFydGlhbDpzdHJpbmcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUodGhpcy5wYWQocGFydGlhbCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWUodmFsdWU6RGF0ZXxzdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKHZhbHVlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldExhc3QoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5nZXRSZWdFeCgpLnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0TWludXRlcyhwYXJzZUludCh2YWx1ZSwgMTApKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXlswLTVdWzAtOV0kLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldE1heEJ1ZmZlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXRNaW51dGVzKCkgPiA1ID8gMSA6IDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIExldmVsLk1JTlVURTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYWQodGhpcy5kYXRlLmdldE1pbnV0ZXMoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBNaW51dGUgZXh0ZW5kcyBQYWRkZWRNaW51dGUge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6SU9wdGlvbnMpIHsgc3VwZXIob3B0aW9ucyk7IH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0aGlzLnRyaW0ocGFydGlhbCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXlswLTVdP1swLTldJC87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXRNaW51dGVzKCkudG9TdHJpbmcoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIFBhZGRlZFNlY29uZCBleHRlbmRzIERhdGVQYXJ0IHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihvcHRpb25zOklPcHRpb25zKSB7IHN1cGVyKG9wdGlvbnMpOyB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGluY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRTZWNvbmRzKCkgKyAxO1xyXG4gICAgICAgICAgICAgICAgaWYgKG51bSA+IDU5KSBudW0gPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldFNlY29uZHMobnVtKTtcclxuICAgICAgICAgICAgfSB3aGlsZSAoIXRoaXMub3B0aW9ucy5pc1NlY29uZFNlbGVjdGFibGUodGhpcy5kYXRlKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZGVjcmVtZW50KCkge1xyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbnVtID0gdGhpcy5kYXRlLmdldFNlY29uZHMoKSAtIDE7XHJcbiAgICAgICAgICAgICAgICBpZiAobnVtIDwgMCkgbnVtID0gNTk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0U2Vjb25kcyhudW0pOyAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgfSB3aGlsZSAoIXRoaXMub3B0aW9ucy5pc1NlY29uZFNlbGVjdGFibGUodGhpcy5kYXRlKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VmFsdWVGcm9tUGFydGlhbChwYXJ0aWFsOnN0cmluZykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0aGlzLnBhZChwYXJ0aWFsKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZSh2YWx1ZTpEYXRlfHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUodmFsdWUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0TGFzdCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB0aGlzLmdldFJlZ0V4KCkudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRTZWNvbmRzKHBhcnNlSW50KHZhbHVlLCAxMCkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRMYXN0KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eWzAtNV1bMC05XSQvO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0TWF4QnVmZmVyKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldFNlY29uZHMoKSA+IDUgPyAxIDogMjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldExldmVsKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTGV2ZWwuU0VDT05EO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhZCh0aGlzLmRhdGUuZ2V0U2Vjb25kcygpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIFNlY29uZCBleHRlbmRzIFBhZGRlZFNlY29uZCB7XHJcbiAgICAgICAgY29uc3RydWN0b3Iob3B0aW9uczpJT3B0aW9ucykgeyBzdXBlcihvcHRpb25zKTsgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHRoaXMudHJpbShwYXJ0aWFsKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWdFeCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC9eWzAtNV0/WzAtOV0kLztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldFNlY29uZHMoKS50b1N0cmluZygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgVXBwZXJjYXNlTWVyaWRpZW0gZXh0ZW5kcyBEYXRlUGFydCB7XHJcbiAgICAgICAgY29uc3RydWN0b3Iob3B0aW9uczpJT3B0aW9ucykgeyBzdXBlcihvcHRpb25zKTsgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBpbmNyZW1lbnQoKSB7XHJcbiAgICAgICAgICAgIGxldCBudW0gPSB0aGlzLmRhdGUuZ2V0SG91cnMoKSArIDEyO1xyXG4gICAgICAgICAgICBpZiAobnVtID4gMjMpIG51bSAtPSAyNDtcclxuICAgICAgICAgICAgdGhpcy5kYXRlLnNldEhvdXJzKG51bSk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaXNIb3VyU2VsZWN0YWJsZSh0aGlzLmRhdGUpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldExhc3QoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVjcmVtZW50KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGRlY3JlbWVudCgpIHtcclxuICAgICAgICAgICAgbGV0IG51bSA9IHRoaXMuZGF0ZS5nZXRIb3VycygpIC0gMTI7XHJcbiAgICAgICAgICAgIGlmIChudW0gPCAwKSBudW0gKz0gMjQ7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3VycyhudW0pO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmlzSG91clNlbGVjdGFibGUodGhpcy5kYXRlKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRMYXN0KCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmluY3JlbWVudCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRWYWx1ZUZyb21QYXJ0aWFsKHBhcnRpYWw6c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICgvXigoQU0/KXwoUE0/KSkkL2kudGVzdChwYXJ0aWFsKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUocGFydGlhbFswXSA9PT0gJ0EnID8gJ0FNJyA6ICdQTScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFZhbHVlKHZhbHVlOkRhdGV8c3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSh2YWx1ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRMYXN0KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHRoaXMuZ2V0UmVnRXgoKS50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlLnRvTG93ZXJDYXNlKCkgPT09ICdhbScgJiYgdGhpcy5kYXRlLmdldEhvdXJzKCkgPiAxMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3Vycyh0aGlzLmRhdGUuZ2V0SG91cnMoKSAtIDEyKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWUudG9Mb3dlckNhc2UoKSA9PT0gJ3BtJyAmJiB0aGlzLmRhdGUuZ2V0SG91cnMoKSA8IDEyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldEhvdXJzKHRoaXMuZGF0ZS5nZXRIb3VycygpICsgMTIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRMYXN0KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIExldmVsLkhPVVI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBnZXRNYXhCdWZmZXIoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0UmVnRXgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAvXigoYW0pfChwbSkpJC9pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE1lcmlkaWVtKHRoaXMuZGF0ZSkudG9VcHBlckNhc2UoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIExvd2VyY2FzZU1lcmlkaWVtIGV4dGVuZHMgVXBwZXJjYXNlTWVyaWRpZW0ge1xyXG4gICAgICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0TWVyaWRpZW0odGhpcy5kYXRlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxldCBmb3JtYXRCbG9ja3M6eyBba2V5OnN0cmluZ106IG5ldyAob3B0aW9uczpJT3B0aW9ucykgPT4gSURhdGVQYXJ0OyB9ID0ge307XHJcbiAgICBcclxuICAgIGZvcm1hdEJsb2Nrc1snWVlZWSddID0gRm91ckRpZ2l0WWVhcjtcclxuICAgIGZvcm1hdEJsb2Nrc1snWVknXSA9IFR3b0RpZ2l0WWVhcjtcclxuICAgIGZvcm1hdEJsb2Nrc1snTU1NTSddID0gTG9uZ01vbnRoTmFtZTtcclxuICAgIGZvcm1hdEJsb2Nrc1snTU1NJ10gPSBTaG9ydE1vbnRoTmFtZTtcclxuICAgIGZvcm1hdEJsb2Nrc1snTU0nXSA9IFBhZGRlZE1vbnRoO1xyXG4gICAgZm9ybWF0QmxvY2tzWydNJ10gPSBNb250aDtcclxuICAgIGZvcm1hdEJsb2Nrc1snREQnXSA9IFBhZGRlZERhdGU7XHJcbiAgICBmb3JtYXRCbG9ja3NbJ0RvJ10gPSBEYXRlT3JkaW5hbDtcclxuICAgIGZvcm1hdEJsb2Nrc1snRCddID0gRGF0ZU51bWVyYWw7XHJcbiAgICBmb3JtYXRCbG9ja3NbJ2RkZGQnXSA9IExvbmdEYXlOYW1lO1xyXG4gICAgZm9ybWF0QmxvY2tzWydkZGQnXSA9IFNob3J0RGF5TmFtZTtcclxuICAgIGZvcm1hdEJsb2Nrc1snSEgnXSA9IFBhZGRlZE1pbGl0YXJ5SG91cjtcclxuICAgIGZvcm1hdEJsb2Nrc1snaGgnXSA9IFBhZGRlZEhvdXI7XHJcbiAgICBmb3JtYXRCbG9ja3NbJ0gnXSA9IE1pbGl0YXJ5SG91cjtcclxuICAgIGZvcm1hdEJsb2Nrc1snaCddID0gSG91cjtcclxuICAgIGZvcm1hdEJsb2Nrc1snQSddID0gVXBwZXJjYXNlTWVyaWRpZW07XHJcbiAgICBmb3JtYXRCbG9ja3NbJ2EnXSA9IExvd2VyY2FzZU1lcmlkaWVtO1xyXG4gICAgZm9ybWF0QmxvY2tzWydtbSddID0gUGFkZGVkTWludXRlO1xyXG4gICAgZm9ybWF0QmxvY2tzWydtJ10gPSBNaW51dGU7XHJcbiAgICBmb3JtYXRCbG9ja3NbJ3NzJ10gPSBQYWRkZWRTZWNvbmQ7XHJcbiAgICBmb3JtYXRCbG9ja3NbJ3MnXSA9IFNlY29uZDtcclxuICAgIFxyXG4gICAgcmV0dXJuIGZvcm1hdEJsb2NrcztcclxufSkoKTtcclxuXHJcblxyXG4iLCJjbGFzcyBJbnB1dCB7XHJcbiAgICBwcml2YXRlIG9wdGlvbnM6IElPcHRpb25zO1xyXG4gICAgcHJpdmF0ZSBzZWxlY3RlZERhdGVQYXJ0OiBJRGF0ZVBhcnQ7XHJcbiAgICBwcml2YXRlIHRleHRCdWZmZXI6IHN0cmluZyA9IFwiXCI7XHJcbiAgICBwdWJsaWMgZGF0ZVBhcnRzOiBJRGF0ZVBhcnRbXTtcclxuICAgIHB1YmxpYyBmb3JtYXQ6IFJlZ0V4cDtcclxuICAgIHByaXZhdGUgZGF0ZTpEYXRlO1xyXG4gICAgcHJpdmF0ZSBsZXZlbDpMZXZlbDtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IocHVibGljIGVsZW1lbnQ6IEhUTUxJbnB1dEVsZW1lbnQpIHtcclxuICAgICAgICBuZXcgS2V5Ym9hcmRFdmVudEhhbmRsZXIodGhpcyk7XHJcbiAgICAgICAgbmV3IE1vdXNlRXZlbnRIYW5kbGVyKHRoaXMpO1xyXG4gICAgICAgIG5ldyBQYXN0ZUV2ZW50SGFuZGVyKHRoaXMpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi52aWV3Y2hhbmdlZChlbGVtZW50LCAoZSkgPT4gdGhpcy52aWV3Y2hhbmdlZChlLmRhdGUsIGUubGV2ZWwsIGUudXBkYXRlKSk7XHJcbiAgICAgICAgbGlzdGVuLmJsdXIoZWxlbWVudCwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmJsdXJEYXRlUGFydCh0aGlzLnNlbGVjdGVkRGF0ZVBhcnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0TGV2ZWxzKCk6TGV2ZWxbXSB7XHJcbiAgICAgICAgbGV0IGxldmVsczpMZXZlbFtdID0gW107XHJcbiAgICAgICAgdGhpcy5kYXRlUGFydHMuZm9yRWFjaCgoZGF0ZVBhcnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKGxldmVscy5pbmRleE9mKGRhdGVQYXJ0LmdldExldmVsKCkpID09PSAtMSAmJiBkYXRlUGFydC5pc1NlbGVjdGFibGUoKSkge1xyXG4gICAgICAgICAgICAgICAgbGV2ZWxzLnB1c2goZGF0ZVBhcnQuZ2V0TGV2ZWwoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gbGV2ZWxzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0VGV4dEJ1ZmZlcigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy50ZXh0QnVmZmVyO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgc2V0VGV4dEJ1ZmZlcihuZXdCdWZmZXI6c3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy50ZXh0QnVmZmVyID0gbmV3QnVmZmVyO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLnRleHRCdWZmZXIubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZURhdGVGcm9tQnVmZmVyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdXBkYXRlRGF0ZUZyb21CdWZmZXIoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWREYXRlUGFydC5zZXRWYWx1ZUZyb21QYXJ0aWFsKHRoaXMudGV4dEJ1ZmZlcikpIHtcclxuICAgICAgICAgICAgbGV0IG5ld0RhdGUgPSB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQuZ2V0VmFsdWUoKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnRleHRCdWZmZXIubGVuZ3RoID49IHRoaXMuc2VsZWN0ZWREYXRlUGFydC5nZXRNYXhCdWZmZXIoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy50ZXh0QnVmZmVyID0gJyc7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJsdXJEYXRlUGFydCh0aGlzLnNlbGVjdGVkRGF0ZVBhcnQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZERhdGVQYXJ0ID0gdGhpcy5nZXROZXh0U2VsZWN0YWJsZURhdGVQYXJ0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRyaWdnZXIuZ290byh0aGlzLmVsZW1lbnQsIHtcclxuICAgICAgICAgICAgICAgIGRhdGU6IG5ld0RhdGUsXHJcbiAgICAgICAgICAgICAgICBsZXZlbDogdGhpcy5zZWxlY3RlZERhdGVQYXJ0LmdldExldmVsKClcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy50ZXh0QnVmZmVyID0gdGhpcy50ZXh0QnVmZmVyLnNsaWNlKDAsIC0xKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRGaXJzdFNlbGVjdGFibGVEYXRlUGFydCgpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZGF0ZVBhcnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGVQYXJ0c1tpXS5pc1NlbGVjdGFibGUoKSlcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGVQYXJ0c1tpXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZvaWQgMDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0TGFzdFNlbGVjdGFibGVEYXRlUGFydCgpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gdGhpcy5kYXRlUGFydHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZGF0ZVBhcnRzW2ldLmlzU2VsZWN0YWJsZSgpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZVBhcnRzW2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdm9pZCAwO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0TmV4dFNlbGVjdGFibGVEYXRlUGFydCgpIHtcclxuICAgICAgICBsZXQgaSA9IHRoaXMuZGF0ZVBhcnRzLmluZGV4T2YodGhpcy5zZWxlY3RlZERhdGVQYXJ0KTtcclxuICAgICAgICB3aGlsZSAoKytpIDwgdGhpcy5kYXRlUGFydHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGVQYXJ0c1tpXS5pc1NlbGVjdGFibGUoKSlcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGVQYXJ0c1tpXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWREYXRlUGFydDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldFByZXZpb3VzU2VsZWN0YWJsZURhdGVQYXJ0KCkge1xyXG4gICAgICAgIGxldCBpID0gdGhpcy5kYXRlUGFydHMuaW5kZXhPZih0aGlzLnNlbGVjdGVkRGF0ZVBhcnQpO1xyXG4gICAgICAgIHdoaWxlICgtLWkgPj0gMCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kYXRlUGFydHNbaV0uaXNTZWxlY3RhYmxlKCkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlUGFydHNbaV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQ7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXROZWFyZXN0U2VsZWN0YWJsZURhdGVQYXJ0KGNhcmV0UG9zaXRpb246IG51bWJlcikge1xyXG4gICAgICAgIGxldCBkaXN0YW5jZTpudW1iZXIgPSBOdW1iZXIuTUFYX1ZBTFVFO1xyXG4gICAgICAgIGxldCBuZWFyZXN0RGF0ZVBhcnQ6SURhdGVQYXJ0O1xyXG4gICAgICAgIGxldCBzdGFydCA9IDA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmRhdGVQYXJ0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgZGF0ZVBhcnQgPSB0aGlzLmRhdGVQYXJ0c1tpXTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChkYXRlUGFydC5pc1NlbGVjdGFibGUoKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGZyb21MZWZ0ID0gY2FyZXRQb3NpdGlvbiAtIHN0YXJ0O1xyXG4gICAgICAgICAgICAgICAgbGV0IGZyb21SaWdodCA9IGNhcmV0UG9zaXRpb24gLSAoc3RhcnQgKyBkYXRlUGFydC50b1N0cmluZygpLmxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGlmIChmcm9tTGVmdCA+IDAgJiYgZnJvbVJpZ2h0IDwgMCkgcmV0dXJuIGRhdGVQYXJ0O1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBsZXQgZCA9IE1hdGgubWluKE1hdGguYWJzKGZyb21MZWZ0KSwgTWF0aC5hYnMoZnJvbVJpZ2h0KSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZCA8PSBkaXN0YW5jZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5lYXJlc3REYXRlUGFydCA9IGRhdGVQYXJ0O1xyXG4gICAgICAgICAgICAgICAgICAgIGRpc3RhbmNlID0gZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgc3RhcnQgKz0gZGF0ZVBhcnQudG9TdHJpbmcoKS5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiBuZWFyZXN0RGF0ZVBhcnQ7ICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHNldFNlbGVjdGVkRGF0ZVBhcnQoZGF0ZVBhcnQ6SURhdGVQYXJ0KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWREYXRlUGFydCAhPT0gZGF0ZVBhcnQpIHtcclxuICAgICAgICAgICAgdGhpcy50ZXh0QnVmZmVyID0gJyc7XHJcbiAgICAgICAgICAgIGxldCBsYXN0U2VsZWN0ZWQgPSB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQ7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWREYXRlUGFydCA9IGRhdGVQYXJ0O1xyXG4gICAgICAgICAgICB0aGlzLmJsdXJEYXRlUGFydChsYXN0U2VsZWN0ZWQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGJsdXJEYXRlUGFydChkYXRlUGFydDpJRGF0ZVBhcnQpIHtcclxuICAgICAgICAvKlxyXG4gICAgICAgIGlmIChkYXRlUGFydCA9PT0gdm9pZCAwKSByZXR1cm47XHJcbiAgICAgICAgbGV0IGxhc3REYXRlID0gZGF0ZVBhcnQuZ2V0TGFzdFZhbHVlKCkgfHwgbmV3IERhdGUoKTtcclxuICAgICAgICBsZXQgbmV3RGF0ZSA9IGRhdGVQYXJ0LmdldFZhbHVlKCk7XHJcbiAgICAgICAgbGV0IHRyYW5zZm9ybWVkRGF0ZSA9IG5ldyBEYXRlKG5ld0RhdGUudmFsdWVPZigpKTtcclxuICAgICAgICBzd2l0Y2goZGF0ZVBhcnQuZ2V0TGV2ZWwoKSkge1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLllFQVI6XHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1lZERhdGUgPSB0aGlzLm9wdGlvbnMuaXNZZWFyU2VsZWN0YWJsZShuZXdEYXRlLCBsYXN0RGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5NT05USDpcclxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybWVkRGF0ZSA9IHRoaXMub3B0aW9ucy5pc01vbnRoU2VsZWN0YWJsZShuZXdEYXRlLCBsYXN0RGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5EQVRFOlxyXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtZWREYXRlID0gdGhpcy5vcHRpb25zLmlzRGF0ZVNlbGVjdGFibGUobmV3RGF0ZSwgbGFzdERhdGUpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuSE9VUjpcclxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybWVkRGF0ZSA9IHRoaXMub3B0aW9ucy5pc0hvdXJTZWxlY3RhYmxlKG5ld0RhdGUsIGxhc3REYXRlKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLk1JTlVURTpcclxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybWVkRGF0ZSA9IHRoaXMub3B0aW9ucy5pc01pbnV0ZVNlbGVjdGFibGUobmV3RGF0ZSwgbGFzdERhdGUpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuU0VDT05EOlxyXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtZWREYXRlID0gdGhpcy5vcHRpb25zLmlzU2Vjb25kU2VsZWN0YWJsZShuZXdEYXRlLCBsYXN0RGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG5ld0RhdGUudmFsdWVPZigpICE9PSB0cmFuc2Zvcm1lZERhdGUudmFsdWVPZigpKSB7XHJcbiAgICAgICAgICAgIHRyaWdnZXIuZ290byh0aGlzLmVsZW1lbnQsIHtcclxuICAgICAgICAgICAgICAgIGxldmVsOiB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQuZ2V0TGV2ZWwoKSxcclxuICAgICAgICAgICAgICAgIGRhdGU6IHRyYW5zZm9ybWVkRGF0ZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgKi9cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldFNlbGVjdGVkRGF0ZVBhcnQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWREYXRlUGFydDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHVwZGF0ZU9wdGlvbnMob3B0aW9uczpJT3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5kYXRlUGFydHMgPSBQYXJzZXIucGFyc2Uob3B0aW9ucyk7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZERhdGVQYXJ0ID0gdm9pZCAwO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBmb3JtYXQ6c3RyaW5nID0gJ14nO1xyXG4gICAgICAgIHRoaXMuZGF0ZVBhcnRzLmZvckVhY2goKGRhdGVQYXJ0KSA9PiB7XHJcbiAgICAgICAgICAgIGZvcm1hdCArPSBgKCR7ZGF0ZVBhcnQuZ2V0UmVnRXgoKS5zb3VyY2Uuc2xpY2UoMSwtMSl9KWA7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5mb3JtYXQgPSBuZXcgUmVnRXhwKGZvcm1hdCsnJCcsICdpJyk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICB0aGlzLnZpZXdjaGFuZ2VkKHRoaXMuZGF0ZSwgdGhpcy5sZXZlbCwgdHJ1ZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB1cGRhdGVWaWV3KCkge1xyXG4gICAgICAgIGxldCBkYXRlU3RyaW5nID0gJyc7XHJcbiAgICAgICAgdGhpcy5kYXRlUGFydHMuZm9yRWFjaCgoZGF0ZVBhcnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKGRhdGVQYXJ0LmdldFZhbHVlKCkgPT09IHZvaWQgMCkgcmV0dXJuO1xyXG4gICAgICAgICAgICBkYXRlU3RyaW5nICs9IGRhdGVQYXJ0LnRvU3RyaW5nKCk7IFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC52YWx1ZSA9IGRhdGVTdHJpbmc7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWREYXRlUGFydCA9PT0gdm9pZCAwKSByZXR1cm47XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHN0YXJ0ID0gMDtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgaSA9IDA7XHJcbiAgICAgICAgd2hpbGUgKHRoaXMuZGF0ZVBhcnRzW2ldICE9PSB0aGlzLnNlbGVjdGVkRGF0ZVBhcnQpIHtcclxuICAgICAgICAgICAgc3RhcnQgKz0gdGhpcy5kYXRlUGFydHNbaSsrXS50b1N0cmluZygpLmxlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGVuZCA9IHN0YXJ0ICsgdGhpcy5zZWxlY3RlZERhdGVQYXJ0LnRvU3RyaW5nKCkubGVuZ3RoO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZShzdGFydCwgZW5kKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHZpZXdjaGFuZ2VkKGRhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWwsIHVwZGF0ZT86Ym9vbGVhbikgeyBcclxuICAgICAgICB0aGlzLmRhdGUgPSBkYXRlO1xyXG4gICAgICAgIHRoaXMubGV2ZWwgPSBsZXZlbDsgICAgICAgXHJcbiAgICAgICAgdGhpcy5kYXRlUGFydHMuZm9yRWFjaCgoZGF0ZVBhcnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHVwZGF0ZSkgZGF0ZVBhcnQuc2V0VmFsdWUoZGF0ZSk7XHJcbiAgICAgICAgICAgIGlmIChkYXRlUGFydC5pc1NlbGVjdGFibGUoKSAmJlxyXG4gICAgICAgICAgICAgICAgZGF0ZVBhcnQuZ2V0TGV2ZWwoKSA9PT0gbGV2ZWwgJiZcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0U2VsZWN0ZWREYXRlUGFydCgpICE9PSB2b2lkIDAgJiZcclxuICAgICAgICAgICAgICAgIGxldmVsICE9PSB0aGlzLmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5nZXRMZXZlbCgpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFNlbGVjdGVkRGF0ZVBhcnQoZGF0ZVBhcnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVWaWV3KCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB0cmlnZ2VyVmlld0NoYW5nZSgpIHtcclxuICAgICAgICB0cmlnZ2VyLnZpZXdjaGFuZ2VkKHRoaXMuZWxlbWVudCwge1xyXG4gICAgICAgICAgICBkYXRlOiB0aGlzLmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5nZXRWYWx1ZSgpLFxyXG4gICAgICAgICAgICBsZXZlbDogdGhpcy5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0TGV2ZWwoKVxyXG4gICAgICAgIH0pOyAgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxufSIsImNvbnN0IGVudW0gS0VZIHtcclxuICAgIFJJR0hUID0gMzksIExFRlQgPSAzNywgVEFCID0gOSwgVVAgPSAzOCxcclxuICAgIERPV04gPSA0MCwgViA9IDg2LCBDID0gNjcsIEEgPSA2NSwgSE9NRSA9IDM2LFxyXG4gICAgRU5EID0gMzUsIEJBQ0tTUEFDRSA9IDhcclxufVxyXG5cclxuY2xhc3MgS2V5Ym9hcmRFdmVudEhhbmRsZXIge1xyXG4gICAgcHJpdmF0ZSBzaGlmdFRhYkRvd24gPSBmYWxzZTtcclxuICAgIHByaXZhdGUgdGFiRG93biA9IGZhbHNlO1xyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGlucHV0OklucHV0KSB7XHJcbiAgICAgICAgaW5wdXQuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoZSkgPT4gdGhpcy5rZXlkb3duKGUpKTtcclxuICAgICAgICBpbnB1dC5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJmb2N1c1wiLCAoKSA9PiB0aGlzLmZvY3VzKCkpO1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIChlKSA9PiB0aGlzLmRvY3VtZW50S2V5ZG93bihlKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBmb2N1cyA9ICgpOnZvaWQgPT4ge1xyXG4gICAgICAgIGlmICh0aGlzLnRhYkRvd24pIHtcclxuICAgICAgICAgICAgbGV0IGZpcnN0ID0gdGhpcy5pbnB1dC5nZXRGaXJzdFNlbGVjdGFibGVEYXRlUGFydCgpO1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQoZmlyc3QpO1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgdGhpcy5pbnB1dC50cmlnZ2VyVmlld0NoYW5nZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc2hpZnRUYWJEb3duKSB7XHJcbiAgICAgICAgICAgIGxldCBsYXN0ID0gdGhpcy5pbnB1dC5nZXRMYXN0U2VsZWN0YWJsZURhdGVQYXJ0KCk7XHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChsYXN0KTtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgIHRoaXMuaW5wdXQudHJpZ2dlclZpZXdDaGFuZ2UoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGRvY3VtZW50S2V5ZG93bihlOktleWJvYXJkRXZlbnQpIHtcclxuICAgICAgICBpZiAoZS5zaGlmdEtleSAmJiBlLmtleUNvZGUgPT09IEtFWS5UQUIpIHtcclxuICAgICAgICAgICAgdGhpcy5zaGlmdFRhYkRvd24gPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZS5rZXlDb2RlID09PSBLRVkuVEFCKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGFiRG93biA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnNoaWZ0VGFiRG93biA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLnRhYkRvd24gPSBmYWxzZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBrZXlkb3duKGU6S2V5Ym9hcmRFdmVudCkge1xyXG4gICAgICAgIGxldCBjb2RlID0gZS5rZXlDb2RlO1xyXG4gICAgICAgIGlmIChjb2RlID49IDk2ICYmIGNvZGUgPD0gMTA1KSB7XHJcbiAgICAgICAgICAgIGNvZGUgLT0gNDg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICgoY29kZSA9PT0gS0VZLkhPTUUgfHwgY29kZSA9PT0gS0VZLkVORCkgJiYgZS5zaGlmdEtleSkgcmV0dXJuO1xyXG4gICAgICAgIGlmICgoY29kZSA9PT0gS0VZLkxFRlQgfHwgY29kZSA9PT0gS0VZLlJJR0hUKSAmJiBlLnNoaWZ0S2V5KSByZXR1cm47XHJcbiAgICAgICAgaWYgKChjb2RlID09PSBLRVkuQyB8fCBjb2RlID09PSBLRVkuQSB8fCBjb2RlID09PSBLRVkuVikgJiYgZS5jdHJsS2V5KSByZXR1cm47XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHByZXZlbnREZWZhdWx0ID0gdHJ1ZTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoY29kZSA9PT0gS0VZLkhPTUUpIHtcclxuICAgICAgICAgICAgdGhpcy5ob21lKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb2RlID09PSBLRVkuRU5EKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZW5kKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb2RlID09PSBLRVkuTEVGVCkge1xyXG4gICAgICAgICAgICB0aGlzLmxlZnQoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IEtFWS5SSUdIVCkge1xyXG4gICAgICAgICAgICB0aGlzLnJpZ2h0KCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb2RlID09PSBLRVkuVEFCICYmIGUuc2hpZnRLZXkpIHtcclxuICAgICAgICAgICAgcHJldmVudERlZmF1bHQgPSB0aGlzLnNoaWZ0VGFiKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb2RlID09PSBLRVkuVEFCKSB7XHJcbiAgICAgICAgICAgIHByZXZlbnREZWZhdWx0ID0gdGhpcy50YWIoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IEtFWS5VUCkge1xyXG4gICAgICAgICAgICB0aGlzLnVwKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb2RlID09PSBLRVkuRE9XTikge1xyXG4gICAgICAgICAgICB0aGlzLmRvd24oKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHByZXZlbnREZWZhdWx0KSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGtleVByZXNzZWQgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGNvZGUpO1xyXG4gICAgICAgIGlmICgvXlswLTldfFtBLXpdJC8udGVzdChrZXlQcmVzc2VkKSkge1xyXG4gICAgICAgICAgICBsZXQgdGV4dEJ1ZmZlciA9IHRoaXMuaW5wdXQuZ2V0VGV4dEJ1ZmZlcigpO1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0LnNldFRleHRCdWZmZXIodGV4dEJ1ZmZlciArIGtleVByZXNzZWQpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gS0VZLkJBQ0tTUEFDRSkge1xyXG4gICAgICAgICAgICBsZXQgdGV4dEJ1ZmZlciA9IHRoaXMuaW5wdXQuZ2V0VGV4dEJ1ZmZlcigpO1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0LnNldFRleHRCdWZmZXIodGV4dEJ1ZmZlci5zbGljZSgwLCAtMSkpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoIWUuc2hpZnRLZXkpIHtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC5zZXRUZXh0QnVmZmVyKCcnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgaG9tZSgpIHtcclxuICAgICAgICBsZXQgZmlyc3QgPSB0aGlzLmlucHV0LmdldEZpcnN0U2VsZWN0YWJsZURhdGVQYXJ0KCk7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5zZXRTZWxlY3RlZERhdGVQYXJ0KGZpcnN0KTtcclxuICAgICAgICB0aGlzLmlucHV0LnRyaWdnZXJWaWV3Q2hhbmdlKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgZW5kKCkge1xyXG4gICAgICAgIGxldCBsYXN0ID0gdGhpcy5pbnB1dC5nZXRMYXN0U2VsZWN0YWJsZURhdGVQYXJ0KCk7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5zZXRTZWxlY3RlZERhdGVQYXJ0KGxhc3QpOyAgICAgXHJcbiAgICAgICAgdGhpcy5pbnB1dC50cmlnZ2VyVmlld0NoYW5nZSgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGxlZnQoKSB7XHJcbiAgICAgICAgbGV0IHByZXZpb3VzID0gdGhpcy5pbnB1dC5nZXRQcmV2aW91c1NlbGVjdGFibGVEYXRlUGFydCgpO1xyXG4gICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChwcmV2aW91cyk7XHJcbiAgICAgICAgdGhpcy5pbnB1dC50cmlnZ2VyVmlld0NoYW5nZSgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHJpZ2h0KCkge1xyXG4gICAgICAgIGxldCBuZXh0ID0gdGhpcy5pbnB1dC5nZXROZXh0U2VsZWN0YWJsZURhdGVQYXJ0KCk7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5zZXRTZWxlY3RlZERhdGVQYXJ0KG5leHQpO1xyXG4gICAgICAgIHRoaXMuaW5wdXQudHJpZ2dlclZpZXdDaGFuZ2UoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBzaGlmdFRhYigpIHtcclxuICAgICAgICBsZXQgcHJldmlvdXMgPSB0aGlzLmlucHV0LmdldFByZXZpb3VzU2VsZWN0YWJsZURhdGVQYXJ0KCk7XHJcbiAgICAgICAgaWYgKHByZXZpb3VzICE9PSB0aGlzLmlucHV0LmdldFNlbGVjdGVkRGF0ZVBhcnQoKSkge1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGVkRGF0ZVBhcnQocHJldmlvdXMpO1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0LnRyaWdnZXJWaWV3Q2hhbmdlKCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgdGFiKCkge1xyXG4gICAgICAgIGxldCBuZXh0ID0gdGhpcy5pbnB1dC5nZXROZXh0U2VsZWN0YWJsZURhdGVQYXJ0KCk7XHJcbiAgICAgICAgaWYgKG5leHQgIT09IHRoaXMuaW5wdXQuZ2V0U2VsZWN0ZWREYXRlUGFydCgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0ZWREYXRlUGFydChuZXh0KTtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC50cmlnZ2VyVmlld0NoYW5nZSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHVwKCkge1xyXG4gICAgICAgIHRoaXMuaW5wdXQuZ2V0U2VsZWN0ZWREYXRlUGFydCgpLmluY3JlbWVudCgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBsZXZlbCA9IHRoaXMuaW5wdXQuZ2V0U2VsZWN0ZWREYXRlUGFydCgpLmdldExldmVsKCk7XHJcbiAgICAgICAgbGV0IGRhdGUgPSB0aGlzLmlucHV0LmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5nZXRWYWx1ZSgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRyaWdnZXIuZ290byh0aGlzLmlucHV0LmVsZW1lbnQsIHtcclxuICAgICAgICAgICAgZGF0ZTogZGF0ZSxcclxuICAgICAgICAgICAgbGV2ZWw6IGxldmVsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgZG93bigpIHtcclxuICAgICAgICB0aGlzLmlucHV0LmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5kZWNyZW1lbnQoKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgbGV2ZWwgPSB0aGlzLmlucHV0LmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5nZXRMZXZlbCgpO1xyXG4gICAgICAgIGxldCBkYXRlID0gdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0VmFsdWUoKTtcclxuICAgICAgICBcclxuICAgICAgICB0cmlnZ2VyLmdvdG8odGhpcy5pbnB1dC5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgIGRhdGU6IGRhdGUsXHJcbiAgICAgICAgICAgIGxldmVsOiBsZXZlbFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwiY2xhc3MgTW91c2VFdmVudEhhbmRsZXIge1xyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBpbnB1dDpJbnB1dCkge1xyXG4gICAgICAgIGxpc3Rlbi5tb3VzZWRvd24oaW5wdXQuZWxlbWVudCwgKCkgPT4gdGhpcy5tb3VzZWRvd24oKSk7XHJcbiAgICAgICAgbGlzdGVuLm1vdXNldXAoZG9jdW1lbnQsICgpID0+IHRoaXMubW91c2V1cCgpKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBTdG9wIGRlZmF1bHRcclxuICAgICAgICBpbnB1dC5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnZW50ZXJcIiwgKGUpID0+IGUucHJldmVudERlZmF1bHQoKSk7XHJcbiAgICAgICAgaW5wdXQuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ292ZXJcIiwgKGUpID0+IGUucHJldmVudERlZmF1bHQoKSk7XHJcbiAgICAgICAgaW5wdXQuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiZHJvcFwiLCAoZSkgPT4gZS5wcmV2ZW50RGVmYXVsdCgpKTtcclxuICAgICAgICBpbnB1dC5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjdXRcIiwgKGUpID0+IGUucHJldmVudERlZmF1bHQoKSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgZG93bjpib29sZWFuO1xyXG4gICAgcHJpdmF0ZSBjYXJldFN0YXJ0Om51bWJlcjtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBtb3VzZWRvd24oKSB7XHJcbiAgICAgICAgdGhpcy5kb3duID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmlucHV0LmVsZW1lbnQuc2V0U2VsZWN0aW9uUmFuZ2Uodm9pZCAwLCB2b2lkIDApO1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgIHRoaXMuY2FyZXRTdGFydCA9IHRoaXMuaW5wdXQuZWxlbWVudC5zZWxlY3Rpb25TdGFydDsgXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgbW91c2V1cCA9ICgpID0+IHtcclxuICAgICAgICBpZiAoIXRoaXMuZG93bikgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuZG93biA9IGZhbHNlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBwb3M6bnVtYmVyO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLmlucHV0LmVsZW1lbnQuc2VsZWN0aW9uU3RhcnQgPT09IHRoaXMuY2FyZXRTdGFydCkge1xyXG4gICAgICAgICAgICBwb3MgPSB0aGlzLmlucHV0LmVsZW1lbnQuc2VsZWN0aW9uRW5kO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBvcyA9IHRoaXMuaW5wdXQuZWxlbWVudC5zZWxlY3Rpb25TdGFydDtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGJsb2NrID0gdGhpcy5pbnB1dC5nZXROZWFyZXN0U2VsZWN0YWJsZURhdGVQYXJ0KHBvcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5pbnB1dC5zZXRTZWxlY3RlZERhdGVQYXJ0KGJsb2NrKTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAodGhpcy5pbnB1dC5lbGVtZW50LnNlbGVjdGlvblN0YXJ0ID4gMCB8fCB0aGlzLmlucHV0LmVsZW1lbnQuc2VsZWN0aW9uRW5kIDwgdGhpcy5pbnB1dC5lbGVtZW50LnZhbHVlLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0LnRyaWdnZXJWaWV3Q2hhbmdlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSIsImNsYXNzIFBhcnNlciB7XHJcbiAgICBwdWJsaWMgc3RhdGljIHBhcnNlKG9wdGlvbnM6SU9wdGlvbnMpOklEYXRlUGFydFtdIHtcclxuICAgICAgICBsZXQgdGV4dEJ1ZmZlciA9ICcnO1xyXG4gICAgICAgIGxldCBkYXRlUGFydHM6SURhdGVQYXJ0W10gPSBbXTtcclxuICAgIFxyXG4gICAgICAgIGxldCBpbmRleCA9IDA7ICAgICAgICAgICAgICAgIFxyXG4gICAgICAgIGxldCBpbkVzY2FwZWRTZWdtZW50ID0gZmFsc2U7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHB1c2hQbGFpblRleHQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0ZXh0QnVmZmVyLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGRhdGVQYXJ0cy5wdXNoKG5ldyBQbGFpblRleHQodGV4dEJ1ZmZlcikuc2V0U2VsZWN0YWJsZShmYWxzZSkpO1xyXG4gICAgICAgICAgICAgICAgdGV4dEJ1ZmZlciA9ICcnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHdoaWxlIChpbmRleCA8IG9wdGlvbnMuZGlzcGxheUFzLmxlbmd0aCkgeyAgICAgXHJcbiAgICAgICAgICAgIGlmICghaW5Fc2NhcGVkU2VnbWVudCAmJiBvcHRpb25zLmRpc3BsYXlBc1tpbmRleF0gPT09ICdbJykge1xyXG4gICAgICAgICAgICAgICAgaW5Fc2NhcGVkU2VnbWVudCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChpbkVzY2FwZWRTZWdtZW50ICYmIG9wdGlvbnMuZGlzcGxheUFzW2luZGV4XSA9PT0gJ10nKSB7XHJcbiAgICAgICAgICAgICAgICBpbkVzY2FwZWRTZWdtZW50ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChpbkVzY2FwZWRTZWdtZW50KSB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0QnVmZmVyICs9IG9wdGlvbnMuZGlzcGxheUFzW2luZGV4XTtcclxuICAgICAgICAgICAgICAgIGluZGV4Kys7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IGZvdW5kID0gZmFsc2U7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBmb3IgKGxldCBjb2RlIGluIGZvcm1hdEJsb2Nrcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKFBhcnNlci5maW5kQXQob3B0aW9ucy5kaXNwbGF5QXMsIGluZGV4LCBgeyR7Y29kZX19YCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBwdXNoUGxhaW5UZXh0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZVBhcnRzLnB1c2gobmV3IGZvcm1hdEJsb2Nrc1tjb2RlXShvcHRpb25zKS5zZXRTZWxlY3RhYmxlKGZhbHNlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggKz0gY29kZS5sZW5ndGggKyAyO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoUGFyc2VyLmZpbmRBdChvcHRpb25zLmRpc3BsYXlBcywgaW5kZXgsIGNvZGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHVzaFBsYWluVGV4dCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGVQYXJ0cy5wdXNoKG5ldyBmb3JtYXRCbG9ja3NbY29kZV0ob3B0aW9ucykpO1xyXG4gICAgICAgICAgICAgICAgICAgIGluZGV4ICs9IGNvZGUubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKCFmb3VuZCkge1xyXG4gICAgICAgICAgICAgICAgdGV4dEJ1ZmZlciArPSBvcHRpb25zLmRpc3BsYXlBc1tpbmRleF07XHJcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdXNoUGxhaW5UZXh0KCk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICByZXR1cm4gZGF0ZVBhcnRzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHN0YXRpYyBmaW5kQXQgKHN0cjpzdHJpbmcsIGluZGV4Om51bWJlciwgc2VhcmNoOnN0cmluZykge1xyXG4gICAgICAgIHJldHVybiBzdHIuc2xpY2UoaW5kZXgsIGluZGV4ICsgc2VhcmNoLmxlbmd0aCkgPT09IHNlYXJjaDtcclxuICAgIH1cclxufSIsImNsYXNzIFBhc3RlRXZlbnRIYW5kZXIge1xyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBpbnB1dDpJbnB1dCkge1xyXG4gICAgICAgIGxpc3Rlbi5wYXN0ZShpbnB1dC5lbGVtZW50LCAoKSA9PiB0aGlzLnBhc3RlKCkpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHBhc3RlKCkge1xyXG4gICAgICAgIC8vVE9ETyBmaXggdGhpcyBjYXVzZSBpdCdzIG5vdCB3b3JraW5nXHJcbiAgICAgICAgbGV0IG9yaWdpbmFsVmFsdWUgPSB0aGlzLmlucHV0LmVsZW1lbnQudmFsdWU7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgaWYgKCF0aGlzLmlucHV0LmZvcm1hdC50ZXN0KHRoaXMuaW5wdXQuZWxlbWVudC52YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgdGhpcy5pbnB1dC5lbGVtZW50LnZhbHVlID0gb3JpZ2luYWxWYWx1ZTtcclxuICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgIH0gXHJcbiAgICAgICAgICAgXHJcbiAgICAgICAgICAgbGV0IG5ld0RhdGUgPSB0aGlzLmlucHV0LmdldFNlbGVjdGVkRGF0ZVBhcnQoKS5nZXRWYWx1ZSgpO1xyXG4gICAgICAgICAgIFxyXG4gICAgICAgICAgIGxldCBzdHJQcmVmaXggPSAnJztcclxuICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuaW5wdXQuZGF0ZVBhcnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgIGxldCBkYXRlUGFydCA9IHRoaXMuaW5wdXQuZGF0ZVBhcnRzW2ldO1xyXG4gICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgbGV0IHJlZ0V4cCA9IG5ldyBSZWdFeHAoZGF0ZVBhcnQuZ2V0UmVnRXgoKS5zb3VyY2Uuc2xpY2UoMSwgLTEpLCAnaScpO1xyXG4gICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgbGV0IHZhbCA9IHRoaXMuaW5wdXQuZWxlbWVudC52YWx1ZS5yZXBsYWNlKHN0clByZWZpeCwgJycpLm1hdGNoKHJlZ0V4cClbMF07XHJcbiAgICAgICAgICAgICAgIHN0clByZWZpeCArPSB2YWw7XHJcbiAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICBpZiAoIWRhdGVQYXJ0LmlzU2VsZWN0YWJsZSgpKSBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgIGRhdGVQYXJ0LnNldFZhbHVlKG5ld0RhdGUpO1xyXG4gICAgICAgICAgICAgICBpZiAoZGF0ZVBhcnQuc2V0VmFsdWUodmFsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgdGhpcy5pbnB1dC5ibHVyRGF0ZVBhcnQoZGF0ZVBhcnQpO1xyXG4gICAgICAgICAgICAgICAgICAgbmV3RGF0ZSA9IGRhdGVQYXJ0LmdldFZhbHVlKCk7XHJcbiAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAvLyBUT0RPIHNldCBhbGwgZGF0ZXBhcnRzIGJhY2sgdG8gb3JpZ2luYWwgdmFsdWVcclxuICAgICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQuZWxlbWVudC52YWx1ZSA9IG9yaWdpbmFsVmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICB9XHJcbiAgICAgICAgICAgXHJcbiAgICAgICAgICAgdHJpZ2dlci5nb3RvKHRoaXMuaW5wdXQuZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICBkYXRlOiBuZXdEYXRlLFxyXG4gICAgICAgICAgICAgICBsZXZlbDogdGhpcy5pbnB1dC5nZXRTZWxlY3RlZERhdGVQYXJ0KCkuZ2V0TGV2ZWwoKVxyXG4gICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwiY29uc3QgZW51bSBTdGVwRGlyZWN0aW9uIHtcclxuICAgIFVQLCBET1dOXHJcbn1cclxuXHJcbmNsYXNzIEhlYWRlciBleHRlbmRzIENvbW1vbiB7XHJcbiAgICBwcml2YXRlIHllYXJMYWJlbDpFbGVtZW50O1xyXG4gICAgcHJpdmF0ZSBtb250aExhYmVsOkVsZW1lbnQ7XHJcbiAgICBwcml2YXRlIGRhdGVMYWJlbDpFbGVtZW50O1xyXG4gICAgcHJpdmF0ZSBob3VyTGFiZWw6RWxlbWVudDtcclxuICAgIHByaXZhdGUgbWludXRlTGFiZWw6RWxlbWVudDtcclxuICAgIHByaXZhdGUgc2Vjb25kTGFiZWw6RWxlbWVudDtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBsYWJlbHM6RWxlbWVudFtdO1xyXG4gICAgXHJcbiAgICBwcml2YXRlIG9wdGlvbnM6SU9wdGlvbnM7XHJcbiAgICBcclxuICAgIHByaXZhdGUgbGV2ZWw6TGV2ZWw7XHJcbiAgICBwcml2YXRlIGRhdGU6RGF0ZTtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBlbGVtZW50OkhUTUxFbGVtZW50LCBwcml2YXRlIGNvbnRhaW5lcjpIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGlzdGVuLnZpZXdjaGFuZ2VkKGVsZW1lbnQsIChlKSA9PiB0aGlzLnZpZXdjaGFuZ2VkKGUuZGF0ZSwgZS5sZXZlbCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMueWVhckxhYmVsID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS15ZWFyJyk7XHJcbiAgICAgICAgdGhpcy5tb250aExhYmVsID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS1tb250aCcpO1xyXG4gICAgICAgIHRoaXMuZGF0ZUxhYmVsID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS1kYXRlJyk7XHJcbiAgICAgICAgdGhpcy5ob3VyTGFiZWwgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcignZGF0aXVtLXNwYW4tbGFiZWwuZGF0aXVtLWhvdXInKTtcclxuICAgICAgICB0aGlzLm1pbnV0ZUxhYmVsID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS1taW51dGUnKTtcclxuICAgICAgICB0aGlzLnNlY29uZExhYmVsID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS1zZWNvbmQnKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmxhYmVscyA9IFt0aGlzLnllYXJMYWJlbCwgdGhpcy5tb250aExhYmVsLCB0aGlzLmRhdGVMYWJlbCwgdGhpcy5ob3VyTGFiZWwsIHRoaXMubWludXRlTGFiZWwsIHRoaXMuc2Vjb25kTGFiZWxdO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBwcmV2aW91c0J1dHRvbiA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdkYXRpdW0tcHJldicpO1xyXG4gICAgICAgIGxldCBuZXh0QnV0dG9uID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1uZXh0Jyk7XHJcbiAgICAgICAgbGV0IHNwYW5MYWJlbENvbnRhaW5lciA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdkYXRpdW0tc3Bhbi1sYWJlbC1jb250YWluZXInKTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4udGFwKHByZXZpb3VzQnV0dG9uLCAoKSA9PiB0aGlzLnByZXZpb3VzKCkpO1xyXG4gICAgICAgIGxpc3Rlbi50YXAobmV4dEJ1dHRvbiwgKCkgPT4gdGhpcy5uZXh0KCkpO1xyXG4gICAgICAgIGxpc3Rlbi50YXAoc3BhbkxhYmVsQ29udGFpbmVyLCAoKSA9PiB0aGlzLnpvb21PdXQoKSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBwcmV2aW91cygpIHtcclxuICAgICAgICB0cmlnZ2VyLmdvdG8odGhpcy5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgZGF0ZTogdGhpcy5zdGVwRGF0ZShTdGVwRGlyZWN0aW9uLkRPV04pLFxyXG4gICAgICAgICAgIGxldmVsOiB0aGlzLmxldmVsLFxyXG4gICAgICAgICAgIHVwZGF0ZTogZmFsc2VcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIG5leHQoKSB7XHJcbiAgICAgICAgdHJpZ2dlci5nb3RvKHRoaXMuZWxlbWVudCwge1xyXG4gICAgICAgICAgIGRhdGU6IHRoaXMuc3RlcERhdGUoU3RlcERpcmVjdGlvbi5VUCksXHJcbiAgICAgICAgICAgbGV2ZWw6IHRoaXMubGV2ZWwsXHJcbiAgICAgICAgICAgdXBkYXRlOiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHpvb21PdXQoKSB7XHJcbiAgICAgICAgdHJpZ2dlci56b29tT3V0KHRoaXMuZWxlbWVudCwge1xyXG4gICAgICAgICAgICBkYXRlOiB0aGlzLmRhdGUsXHJcbiAgICAgICAgICAgIGN1cnJlbnRMZXZlbDogdGhpcy5sZXZlbCxcclxuICAgICAgICAgICAgdXBkYXRlOiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHN0ZXBEYXRlKHN0ZXBUeXBlOlN0ZXBEaXJlY3Rpb24pOkRhdGUge1xyXG4gICAgICAgIGxldCBkYXRlID0gbmV3IERhdGUodGhpcy5kYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgbGV0IGRpcmVjdGlvbiA9IHN0ZXBUeXBlID09PSBTdGVwRGlyZWN0aW9uLlVQID8gMSA6IC0xO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHN3aXRjaCAodGhpcy5sZXZlbCkge1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLllFQVI6XHJcbiAgICAgICAgICAgICAgICBkYXRlLnNldEZ1bGxZZWFyKGRhdGUuZ2V0RnVsbFllYXIoKSArIDEwICogZGlyZWN0aW9uKTsgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLk1PTlRIOlxyXG4gICAgICAgICAgICAgICAgZGF0ZS5zZXRGdWxsWWVhcihkYXRlLmdldEZ1bGxZZWFyKCkgKyBkaXJlY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuREFURTpcclxuICAgICAgICAgICAgICAgIGRhdGUuc2V0TW9udGgoZGF0ZS5nZXRNb250aCgpICsgZGlyZWN0aW9uKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLkhPVVI6XHJcbiAgICAgICAgICAgICAgICBkYXRlLnNldERhdGUoZGF0ZS5nZXREYXRlKCkgKyBkaXJlY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuTUlOVVRFOlxyXG4gICAgICAgICAgICAgICAgZGF0ZS5zZXRIb3VycyhkYXRlLmdldEhvdXJzKCkgKyBkaXJlY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuU0VDT05EOlxyXG4gICAgICAgICAgICAgICAgZGF0ZS5zZXRNaW51dGVzKGRhdGUuZ2V0TWludXRlcygpICsgZGlyZWN0aW9uKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gZGF0ZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSB2aWV3Y2hhbmdlZChkYXRlOkRhdGUsIGxldmVsOkxldmVsKSB7XHJcbiAgICAgICAgdGhpcy5kYXRlID0gZGF0ZTtcclxuICAgICAgICB0aGlzLmxldmVsID0gbGV2ZWw7XHJcbiAgICAgICAgdGhpcy5sYWJlbHMuZm9yRWFjaCgobGFiZWwsIGxhYmVsTGV2ZWwpID0+IHtcclxuICAgICAgICAgICAgbGFiZWwuY2xhc3NMaXN0LnJlbW92ZSgnZGF0aXVtLXRvcCcpO1xyXG4gICAgICAgICAgICBsYWJlbC5jbGFzc0xpc3QucmVtb3ZlKCdkYXRpdW0tYm90dG9tJyk7XHJcbiAgICAgICAgICAgIGxhYmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1oaWRkZW4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChsYWJlbExldmVsIDwgbGV2ZWwpIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS10b3AnKTtcclxuICAgICAgICAgICAgICAgIGxhYmVsLmlubmVySFRNTCA9IHRoaXMuZ2V0SGVhZGVyVG9wVGV4dChkYXRlLCBsYWJlbExldmVsKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1ib3R0b20nKTtcclxuICAgICAgICAgICAgICAgIGxhYmVsLmlubmVySFRNTCA9IHRoaXMuZ2V0SGVhZGVyQm90dG9tVGV4dChkYXRlLCBsYWJlbExldmVsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKGxhYmVsTGV2ZWwgPCBsZXZlbCAtIDEgfHwgbGFiZWxMZXZlbCA+IGxldmVsKSB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbC5jbGFzc0xpc3QuYWRkKCdkYXRpdW0taGlkZGVuJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBnZXRIZWFkZXJUb3BUZXh0KGRhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWwpOnN0cmluZyB7XHJcbiAgICAgICAgc3dpdGNoKGxldmVsKSB7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuWUVBUjpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldERlY2FkZShkYXRlKTtcclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5NT05USDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBkYXRlLmdldEZ1bGxZZWFyKCkudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5EQVRFOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3RoaXMuZ2V0U2hvcnRNb250aHMoKVtkYXRlLmdldE1vbnRoKCldfSAke2RhdGUuZ2V0RnVsbFllYXIoKX1gO1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLkhPVVI6XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuTUlOVVRFOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3RoaXMuZ2V0U2hvcnREYXlzKClbZGF0ZS5nZXREYXkoKV19ICR7dGhpcy5wYWQoZGF0ZS5nZXREYXRlKCkpfSAke3RoaXMuZ2V0U2hvcnRNb250aHMoKVtkYXRlLmdldE1vbnRoKCldfSAke2RhdGUuZ2V0RnVsbFllYXIoKX1gO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBnZXRIZWFkZXJCb3R0b21UZXh0KGRhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWwpOnN0cmluZyB7XHJcbiAgICAgICAgc3dpdGNoKGxldmVsKSB7XHJcbiAgICAgICAgICAgIGNhc2UgTGV2ZWwuWUVBUjpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldERlY2FkZShkYXRlKTtcclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5NT05USDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBkYXRlLmdldEZ1bGxZZWFyKCkudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgY2FzZSBMZXZlbC5EQVRFOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U2hvcnRNb250aHMoKVtkYXRlLmdldE1vbnRoKCldO1xyXG4gICAgICAgICAgICBjYXNlIExldmVsLkhPVVI6XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLm1pbGl0YXJ5VGltZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHt0aGlzLmdldFNob3J0RGF5cygpW2RhdGUuZ2V0RGF5KCldfSAke3RoaXMucGFkKGRhdGUuZ2V0RGF0ZSgpKX0gPGRhdGl1bS12YXJpYWJsZT4ke3RoaXMucGFkKGRhdGUuZ2V0SG91cnMoKSl9PGRhdGl1bS1sb3dlcj5ocjwvZGF0aXVtLWxvd2VyPjwvZGF0aXVtLXZhcmlhYmxlPmA7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHt0aGlzLmdldFNob3J0RGF5cygpW2RhdGUuZ2V0RGF5KCldfSAke3RoaXMucGFkKGRhdGUuZ2V0RGF0ZSgpKX0gPGRhdGl1bS12YXJpYWJsZT4ke3RoaXMuZ2V0SG91cnMoZGF0ZSl9JHt0aGlzLmdldE1lcmlkaWVtKGRhdGUpfTwvZGF0aXVtLXZhcmlhYmxlPmA7ICAgIFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIExldmVsLk1JTlVURTpcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMubWlsaXRhcnlUaW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke3RoaXMucGFkKGRhdGUuZ2V0SG91cnMoKSl9OjxkYXRpdW0tdmFyaWFibGU+JHt0aGlzLnBhZChkYXRlLmdldE1pbnV0ZXMoKSl9PC9kYXRpdW0tdmFyaWFibGU+YDsgICAgXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHt0aGlzLmdldEhvdXJzKGRhdGUpfTo8ZGF0aXVtLXZhcmlhYmxlPiR7dGhpcy5wYWQoZGF0ZS5nZXRNaW51dGVzKCkpfTwvZGF0aXVtLXZhcmlhYmxlPiR7dGhpcy5nZXRNZXJpZGllbShkYXRlKX1gO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIExldmVsLlNFQ09ORDpcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMubWlsaXRhcnlUaW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke3RoaXMucGFkKGRhdGUuZ2V0SG91cnMoKSl9OiR7dGhpcy5wYWQoZGF0ZS5nZXRNaW51dGVzKCkpfTo8ZGF0aXVtLXZhcmlhYmxlPiR7dGhpcy5wYWQoZGF0ZS5nZXRTZWNvbmRzKCkpfTwvZGF0aXVtLXZhcmlhYmxlPmA7ICAgXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHt0aGlzLmdldEhvdXJzKGRhdGUpfToke3RoaXMucGFkKGRhdGUuZ2V0TWludXRlcygpKX06PGRhdGl1bS12YXJpYWJsZT4ke3RoaXMucGFkKGRhdGUuZ2V0U2Vjb25kcygpKX08L2RhdGl1bS12YXJpYWJsZT4ke3RoaXMuZ2V0TWVyaWRpZW0oZGF0ZSl9YDsgICAgXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdXBkYXRlT3B0aW9ucyhvcHRpb25zOklPcHRpb25zKSB7XHJcbiAgICAgICAgbGV0IHVwZGF0ZVZpZXcgPSB0aGlzLm9wdGlvbnMgIT09IHZvaWQgMCAmJiB0aGlzLm9wdGlvbnMubWlsaXRhcnlUaW1lICE9PSBvcHRpb25zLm1pbGl0YXJ5VGltZTtcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xyXG4gICAgICAgIGlmICh1cGRhdGVWaWV3KSB7XHJcbiAgICAgICAgICAgIHRoaXMudmlld2NoYW5nZWQodGhpcy5kYXRlLCB0aGlzLmxldmVsKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJjb25zdCBlbnVtIFRyYW5zaXRpb24ge1xyXG4gICAgU0xJREVfTEVGVCxcclxuICAgIFNMSURFX1JJR0hULFxyXG4gICAgWk9PTV9JTixcclxuICAgIFpPT01fT1VUXHJcbn1cclxuXHJcbmNsYXNzIFBpY2tlck1hbmFnZXIge1xyXG4gICAgcHJpdmF0ZSBvcHRpb25zOklPcHRpb25zO1xyXG4gICAgcHVibGljIGNvbnRhaW5lcjpIVE1MRWxlbWVudDtcclxuICAgIHB1YmxpYyBoZWFkZXI6SGVhZGVyO1xyXG4gICAgXHJcbiAgICBwcml2YXRlIHllYXJQaWNrZXI6SVBpY2tlcjtcclxuICAgIHByaXZhdGUgbW9udGhQaWNrZXI6SVBpY2tlcjtcclxuICAgIHByaXZhdGUgZGF0ZVBpY2tlcjpJUGlja2VyO1xyXG4gICAgcHJpdmF0ZSBob3VyUGlja2VyOklUaW1lUGlja2VyO1xyXG4gICAgcHJpdmF0ZSBtaW51dGVQaWNrZXI6SVRpbWVQaWNrZXI7XHJcbiAgICBwcml2YXRlIHNlY29uZFBpY2tlcjpJVGltZVBpY2tlcjtcclxuICAgIFxyXG4gICAgcHVibGljIGN1cnJlbnRQaWNrZXI6SVBpY2tlcjtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBwaWNrZXJDb250YWluZXI6SFRNTEVsZW1lbnQ7XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgZWxlbWVudDpIVE1MSW5wdXRFbGVtZW50KSB7XHJcbiAgICAgICAgdGhpcy5jb250YWluZXIgPSB0aGlzLmNyZWF0ZVZpZXcoKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmluc2VydEFmdGVyKGVsZW1lbnQsIHRoaXMuY29udGFpbmVyKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnBpY2tlckNvbnRhaW5lciA9IDxIVE1MRWxlbWVudD50aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdkYXRpdW0tcGlja2VyLWNvbnRhaW5lcicpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuaGVhZGVyID0gbmV3IEhlYWRlcihlbGVtZW50LCB0aGlzLmNvbnRhaW5lcik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy55ZWFyUGlja2VyID0gbmV3IFllYXJQaWNrZXIoZWxlbWVudCwgdGhpcy5jb250YWluZXIpO1xyXG4gICAgICAgIHRoaXMubW9udGhQaWNrZXIgPSBuZXcgTW9udGhQaWNrZXIoZWxlbWVudCwgdGhpcy5jb250YWluZXIpO1xyXG4gICAgICAgIHRoaXMuZGF0ZVBpY2tlciA9IG5ldyBEYXRlUGlja2VyKGVsZW1lbnQsIHRoaXMuY29udGFpbmVyKTtcclxuICAgICAgICB0aGlzLmhvdXJQaWNrZXIgPSBuZXcgSG91clBpY2tlcihlbGVtZW50LCB0aGlzLmNvbnRhaW5lcik7XHJcbiAgICAgICAgdGhpcy5taW51dGVQaWNrZXIgPSBuZXcgTWludXRlUGlja2VyKGVsZW1lbnQsIHRoaXMuY29udGFpbmVyKTtcclxuICAgICAgICB0aGlzLnNlY29uZFBpY2tlciA9IG5ldyBTZWNvbmRQaWNrZXIoZWxlbWVudCwgdGhpcy5jb250YWluZXIpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgbGlzdGVuLmRvd24odGhpcy5jb250YWluZXIsICcqJywgKGUpID0+IHRoaXMuYWRkQWN0aXZlQ2xhc3NlcyhlKSk7XHJcbiAgICAgICAgbGlzdGVuLnVwKGRvY3VtZW50LCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2VCdWJibGUoKTtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVBY3RpdmVDbGFzc2VzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGlzdGVuLm1vdXNlZG93bih0aGlzLmNvbnRhaW5lciwgKGUpID0+IHtcclxuICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICByZXR1cm4gZmFsc2U7IFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi52aWV3Y2hhbmdlZChlbGVtZW50LCAoZSkgPT4gdGhpcy52aWV3Y2hhbmdlZChlLmRhdGUsIGUubGV2ZWwsIGUudXBkYXRlKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGlzdGVuLm9wZW5CdWJibGUoZWxlbWVudCwgKGUpID0+IHtcclxuICAgICAgICAgICB0aGlzLm9wZW5CdWJibGUoZS54LCBlLnksIGUudGV4dCk7IFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGxpc3Rlbi51cGRhdGVCdWJibGUoZWxlbWVudCwgKGUpID0+IHtcclxuICAgICAgICAgICB0aGlzLnVwZGF0ZUJ1YmJsZShlLngsIGUueSwgZS50ZXh0KTsgXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGlzdGVuLnN3aXBlTGVmdCh0aGlzLmNvbnRhaW5lciwgKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zZWNvbmRQaWNrZXIuaXNEcmFnZ2luZygpIHx8XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1pbnV0ZVBpY2tlci5pc0RyYWdnaW5nKCkgfHxcclxuICAgICAgICAgICAgICAgIHRoaXMuaG91clBpY2tlci5pc0RyYWdnaW5nKCkpIHJldHVybjtcclxuICAgICAgICAgICAgdGhpcy5oZWFkZXIubmV4dCgpOyBcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4uc3dpcGVSaWdodCh0aGlzLmNvbnRhaW5lciwgKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zZWNvbmRQaWNrZXIuaXNEcmFnZ2luZygpIHx8XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1pbnV0ZVBpY2tlci5pc0RyYWdnaW5nKCkgfHxcclxuICAgICAgICAgICAgICAgIHRoaXMuaG91clBpY2tlci5pc0RyYWdnaW5nKCkpIHJldHVybjtcclxuICAgICAgICAgICAgdGhpcy5oZWFkZXIucHJldmlvdXMoKTsgXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBjbG9zZUJ1YmJsZSgpIHtcclxuICAgICAgICBpZiAodGhpcy5idWJibGUgPT09IHZvaWQgMCkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuYnViYmxlLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1idWJibGUtdmlzaWJsZScpO1xyXG4gICAgICAgIHNldFRpbWVvdXQoKGJ1YmJsZTpIVE1MRWxlbWVudCkgPT4ge1xyXG4gICAgICAgICAgICBidWJibGUucmVtb3ZlKCk7XHJcbiAgICAgICAgfSwgMjAwLCB0aGlzLmJ1YmJsZSk7XHJcbiAgICAgICAgdGhpcy5idWJibGUgPSB2b2lkIDA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgYnViYmxlOkhUTUxFbGVtZW50O1xyXG4gICAgXHJcbiAgICBwdWJsaWMgb3BlbkJ1YmJsZSh4Om51bWJlciwgeTpudW1iZXIsIHRleHQ6c3RyaW5nKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuYnViYmxlICE9PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZUJ1YmJsZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmJ1YmJsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1idWJibGUnKTtcclxuICAgICAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmJ1YmJsZSk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVCdWJibGUoeCwgeSwgdGV4dCk7XHJcbiAgICAgICAgc2V0VGltZW91dCgoYnViYmxlOkhUTUxFbGVtZW50KSA9PiB7XHJcbiAgICAgICAgICAgYnViYmxlLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1idWJibGUtdmlzaWJsZScpOyBcclxuICAgICAgICB9LCAwLCB0aGlzLmJ1YmJsZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB1cGRhdGVCdWJibGUoeDpudW1iZXIsIHk6bnVtYmVyLCB0ZXh0OnN0cmluZykge1xyXG4gICAgICAgIHRoaXMuYnViYmxlLmlubmVySFRNTCA9IHRleHQ7XHJcbiAgICAgICAgdGhpcy5idWJibGUuc3R5bGUudG9wID0geSArICdweCc7XHJcbiAgICAgICAgdGhpcy5idWJibGUuc3R5bGUubGVmdCA9IHggKyAncHgnO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHZpZXdjaGFuZ2VkKGRhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWwsIHVwZGF0ZTpib29sZWFuKSB7XHJcbiAgICAgICAgaWYgKGxldmVsID09PSBMZXZlbC5OT05FKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRQaWNrZXIgIT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UGlja2VyLnJlbW92ZShUcmFuc2l0aW9uLlpPT01fT1VUKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmFkanVzdEhlaWdodCgxMCk7XHJcbiAgICAgICAgICAgIGlmICh1cGRhdGUpIHRoaXMudXBkYXRlU2VsZWN0ZWREYXRlKGRhdGUpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCB0cmFuc2l0aW9uOlRyYW5zaXRpb247XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFBpY2tlciA9PT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBpY2tlciA9IHRoaXMuZ2V0UGlja2VyKGxldmVsKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50UGlja2VyLmNyZWF0ZShkYXRlLCBUcmFuc2l0aW9uLlpPT01fSU4pO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoKHRyYW5zaXRpb24gPSB0aGlzLmdldFRyYW5zaXRpb24oZGF0ZSwgbGV2ZWwpKSAhPT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBpY2tlci5yZW1vdmUodHJhbnNpdGlvbik7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBpY2tlciA9IHRoaXMuZ2V0UGlja2VyKGxldmVsKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50UGlja2VyLmNyZWF0ZShkYXRlLCB0cmFuc2l0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHVwZGF0ZSkgdGhpcy51cGRhdGVTZWxlY3RlZERhdGUoZGF0ZSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5hZGp1c3RIZWlnaHQodGhpcy5jdXJyZW50UGlja2VyLmdldEhlaWdodCgpKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSB1cGRhdGVTZWxlY3RlZERhdGUoZGF0ZTpEYXRlKSB7XHJcbiAgICAgICAgdGhpcy55ZWFyUGlja2VyLnNldFNlbGVjdGVkRGF0ZShkYXRlKTtcclxuICAgICAgICB0aGlzLm1vbnRoUGlja2VyLnNldFNlbGVjdGVkRGF0ZShkYXRlKTtcclxuICAgICAgICB0aGlzLmRhdGVQaWNrZXIuc2V0U2VsZWN0ZWREYXRlKGRhdGUpO1xyXG4gICAgICAgIHRoaXMuaG91clBpY2tlci5zZXRTZWxlY3RlZERhdGUoZGF0ZSk7XHJcbiAgICAgICAgdGhpcy5taW51dGVQaWNrZXIuc2V0U2VsZWN0ZWREYXRlKGRhdGUpO1xyXG4gICAgICAgIHRoaXMuc2Vjb25kUGlja2VyLnNldFNlbGVjdGVkRGF0ZShkYXRlKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBnZXRUcmFuc2l0aW9uKGRhdGU6RGF0ZSwgbGV2ZWw6TGV2ZWwpOlRyYW5zaXRpb24ge1xyXG4gICAgICAgIGlmIChsZXZlbCA+IHRoaXMuY3VycmVudFBpY2tlci5nZXRMZXZlbCgpKSByZXR1cm4gVHJhbnNpdGlvbi5aT09NX0lOO1xyXG4gICAgICAgIGlmIChsZXZlbCA8IHRoaXMuY3VycmVudFBpY2tlci5nZXRMZXZlbCgpKSByZXR1cm4gVHJhbnNpdGlvbi5aT09NX09VVDtcclxuICAgICAgICBpZiAoZGF0ZS52YWx1ZU9mKCkgPCB0aGlzLmN1cnJlbnRQaWNrZXIuZ2V0TWluKCkudmFsdWVPZigpKSByZXR1cm4gVHJhbnNpdGlvbi5TTElERV9MRUZUO1xyXG4gICAgICAgIGlmIChkYXRlLnZhbHVlT2YoKSA+IHRoaXMuY3VycmVudFBpY2tlci5nZXRNYXgoKS52YWx1ZU9mKCkpIHJldHVybiBUcmFuc2l0aW9uLlNMSURFX1JJR0hUO1xyXG4gICAgICAgIHJldHVybiB2b2lkIDA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgYWRqdXN0SGVpZ2h0KGhlaWdodDpudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnBpY2tlckNvbnRhaW5lci5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlWSgke2hlaWdodCAtIDI4MH1weClgO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGdldFBpY2tlcihsZXZlbDpMZXZlbCk6SVBpY2tlciB7XHJcbiAgICAgICAgcmV0dXJuIFt0aGlzLnllYXJQaWNrZXIsdGhpcy5tb250aFBpY2tlcix0aGlzLmRhdGVQaWNrZXIsdGhpcy5ob3VyUGlja2VyLHRoaXMubWludXRlUGlja2VyLHRoaXMuc2Vjb25kUGlja2VyXVtsZXZlbF07XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyByZW1vdmVBY3RpdmVDbGFzc2VzKCkge1xyXG4gICAgICAgIGxldCBhY3RpdmVFbGVtZW50cyA9IHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJy5kYXRpdW0tYWN0aXZlJyk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhY3RpdmVFbGVtZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBhY3RpdmVFbGVtZW50c1tpXS5jbGFzc0xpc3QucmVtb3ZlKCdkYXRpdW0tYWN0aXZlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1hY3RpdmUnKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBhZGRBY3RpdmVDbGFzc2VzKGU6TW91c2VFdmVudHxUb3VjaEV2ZW50KSB7XHJcbiAgICAgICAgbGV0IGVsID0gZS5zcmNFbGVtZW50IHx8IDxFbGVtZW50PmUudGFyZ2V0O1xyXG4gICAgICAgIHdoaWxlIChlbCAhPT0gdGhpcy5jb250YWluZXIpIHtcclxuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLWFjdGl2ZScpO1xyXG4gICAgICAgICAgICBlbCA9IGVsLnBhcmVudEVsZW1lbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1hY3RpdmUnKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHVwZGF0ZU9wdGlvbnMob3B0aW9uczpJT3B0aW9ucykge1xyXG4gICAgICAgIGxldCB0aGVtZVVwZGF0ZWQgPSB0aGlzLm9wdGlvbnMgPT09IHZvaWQgMCB8fFxyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMudGhlbWUgPT09IHZvaWQgMCB8fFxyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMudGhlbWUucHJpbWFyeSAhPT0gb3B0aW9ucy50aGVtZS5wcmltYXJ5IHx8XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy50aGVtZS5wcmltYXJ5X3RleHQgIT09IG9wdGlvbnMudGhlbWUucHJpbWFyeV90ZXh0IHx8XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy50aGVtZS5zZWNvbmRhcnkgIT09IG9wdGlvbnMudGhlbWUuc2Vjb25kYXJ5IHx8XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy50aGVtZS5zZWNvbmRhcnlfYWNjZW50ICE9PSBvcHRpb25zLnRoZW1lLnNlY29uZGFyeV9hY2NlbnQgfHxcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnRoZW1lLnNlY29uZGFyeV90ZXh0ICE9PSBvcHRpb25zLnRoZW1lLnNlY29uZGFyeV90ZXh0O1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoZW1lVXBkYXRlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmluc2VydFN0eWxlcygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmhlYWRlci51cGRhdGVPcHRpb25zKG9wdGlvbnMpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMueWVhclBpY2tlci51cGRhdGVPcHRpb25zKG9wdGlvbnMpO1xyXG4gICAgICAgIHRoaXMubW9udGhQaWNrZXIudXBkYXRlT3B0aW9ucyhvcHRpb25zKTtcclxuICAgICAgICB0aGlzLmRhdGVQaWNrZXIudXBkYXRlT3B0aW9ucyhvcHRpb25zKTtcclxuICAgICAgICB0aGlzLmhvdXJQaWNrZXIudXBkYXRlT3B0aW9ucyhvcHRpb25zKTtcclxuICAgICAgICB0aGlzLm1pbnV0ZVBpY2tlci51cGRhdGVPcHRpb25zKG9wdGlvbnMpO1xyXG4gICAgICAgIHRoaXMuc2Vjb25kUGlja2VyLnVwZGF0ZU9wdGlvbnMob3B0aW9ucyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgY3JlYXRlVmlldygpOkhUTUxFbGVtZW50IHtcclxuICAgICAgICBsZXQgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tY29udGFpbmVyJyk7XHJcbiAgICAgICAgZWwuaW5uZXJIVE1MID0gaGVhZGVyICsgYFxyXG4gICAgICAgIDxkYXRpdW0tcGlja2VyLWNvbnRhaW5lci13cmFwcGVyPlxyXG4gICAgICAgICAgICA8ZGF0aXVtLXBpY2tlci1jb250YWluZXI+PC9kYXRpdW0tcGlja2VyLWNvbnRhaW5lcj5cclxuICAgICAgICA8L2RhdGl1bS1waWNrZXItY29udGFpbmVyLXdyYXBwZXI+YDtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gZWw7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgaW5zZXJ0QWZ0ZXIobm9kZTpOb2RlLCBuZXdOb2RlOk5vZGUpOnZvaWQge1xyXG4gICAgICAgIG5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUobmV3Tm9kZSwgbm9kZS5uZXh0U2libGluZyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN0YXRpYyBzdHlsZXNJbnNlcnRlZDpudW1iZXIgPSAwO1xyXG4gICAgXHJcbiAgICBwcml2YXRlIGluc2VydFN0eWxlcygpIHtcclxuICAgICAgICBsZXQgaGVhZCA9IGRvY3VtZW50LmhlYWQgfHwgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXTtcclxuICAgICAgICBsZXQgc3R5bGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgc3R5bGVJZCA9IFwiZGF0aXVtLXN0eWxlXCIgKyAoUGlja2VyTWFuYWdlci5zdHlsZXNJbnNlcnRlZCsrKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgZXhpc3RpbmdTdHlsZUlkID0gdGhpcy5nZXRFeGlzdGluZ1N0eWxlSWQoKTtcclxuICAgICAgICBpZiAoZXhpc3RpbmdTdHlsZUlkICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoZXhpc3RpbmdTdHlsZUlkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5jb250YWluZXIuY2xhc3NMaXN0LmFkZChzdHlsZUlkKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgdHJhbnNmb3JtZWRDc3MgPSBjc3MucmVwbGFjZSgvX3ByaW1hcnlfdGV4dC9nLCB0aGlzLm9wdGlvbnMudGhlbWUucHJpbWFyeV90ZXh0KTtcclxuICAgICAgICB0cmFuc2Zvcm1lZENzcyA9IHRyYW5zZm9ybWVkQ3NzLnJlcGxhY2UoL19wcmltYXJ5L2csIHRoaXMub3B0aW9ucy50aGVtZS5wcmltYXJ5KTtcclxuICAgICAgICB0cmFuc2Zvcm1lZENzcyA9IHRyYW5zZm9ybWVkQ3NzLnJlcGxhY2UoL19zZWNvbmRhcnlfdGV4dC9nLCB0aGlzLm9wdGlvbnMudGhlbWUuc2Vjb25kYXJ5X3RleHQpO1xyXG4gICAgICAgIHRyYW5zZm9ybWVkQ3NzID0gdHJhbnNmb3JtZWRDc3MucmVwbGFjZSgvX3NlY29uZGFyeV9hY2NlbnQvZywgdGhpcy5vcHRpb25zLnRoZW1lLnNlY29uZGFyeV9hY2NlbnQpO1xyXG4gICAgICAgIHRyYW5zZm9ybWVkQ3NzID0gdHJhbnNmb3JtZWRDc3MucmVwbGFjZSgvX3NlY29uZGFyeS9nLCB0aGlzLm9wdGlvbnMudGhlbWUuc2Vjb25kYXJ5KTtcclxuICAgICAgICB0cmFuc2Zvcm1lZENzcyA9IHRyYW5zZm9ybWVkQ3NzLnJlcGxhY2UoL19pZC9nLCBzdHlsZUlkKTtcclxuICAgICAgICBcclxuICAgICAgICBzdHlsZUVsZW1lbnQudHlwZSA9ICd0ZXh0L2Nzcyc7XHJcbiAgICAgICAgaWYgKCg8YW55PnN0eWxlRWxlbWVudCkuc3R5bGVTaGVldCl7XHJcbiAgICAgICAgICAgICg8YW55PnN0eWxlRWxlbWVudCkuc3R5bGVTaGVldC5jc3NUZXh0ID0gdHJhbnNmb3JtZWRDc3M7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc3R5bGVFbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRyYW5zZm9ybWVkQ3NzKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBoZWFkLmFwcGVuZENoaWxkKHN0eWxlRWxlbWVudCk7ICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBnZXRFeGlzdGluZ1N0eWxlSWQoKTpzdHJpbmcge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jb250YWluZXIuY2xhc3NMaXN0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICgvXmRhdGl1bS1zdHlsZVxcZCskLy50ZXN0KHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5pdGVtKGkpKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5pdGVtKGkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG59XHJcbiIsInZhciBoZWFkZXIgPSBcIjxkYXRpdW0taGVhZGVyLXdyYXBwZXI+IDxkYXRpdW0taGVhZGVyPiA8ZGF0aXVtLXNwYW4tbGFiZWwtY29udGFpbmVyPiA8ZGF0aXVtLXNwYW4tbGFiZWwgY2xhc3M9J2RhdGl1bS15ZWFyJz48L2RhdGl1bS1zcGFuLWxhYmVsPiA8ZGF0aXVtLXNwYW4tbGFiZWwgY2xhc3M9J2RhdGl1bS1tb250aCc+PC9kYXRpdW0tc3Bhbi1sYWJlbD4gPGRhdGl1bS1zcGFuLWxhYmVsIGNsYXNzPSdkYXRpdW0tZGF0ZSc+PC9kYXRpdW0tc3Bhbi1sYWJlbD4gPGRhdGl1bS1zcGFuLWxhYmVsIGNsYXNzPSdkYXRpdW0taG91cic+PC9kYXRpdW0tc3Bhbi1sYWJlbD4gPGRhdGl1bS1zcGFuLWxhYmVsIGNsYXNzPSdkYXRpdW0tbWludXRlJz48L2RhdGl1bS1zcGFuLWxhYmVsPiA8ZGF0aXVtLXNwYW4tbGFiZWwgY2xhc3M9J2RhdGl1bS1zZWNvbmQnPjwvZGF0aXVtLXNwYW4tbGFiZWw+IDwvZGF0aXVtLXNwYW4tbGFiZWwtY29udGFpbmVyPiA8ZGF0aXVtLXByZXY+PC9kYXRpdW0tcHJldj4gPGRhdGl1bS1uZXh0PjwvZGF0aXVtLW5leHQ+IDwvZGF0aXVtLWhlYWRlcj4gPC9kYXRpdW0taGVhZGVyLXdyYXBwZXI+XCI7IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2NvbW1vbi9Db21tb24udHNcIiAvPlxyXG5jbGFzcyBQaWNrZXIgZXh0ZW5kcyBDb21tb24ge1xyXG4gICAgcHJvdGVjdGVkIHBpY2tlckNvbnRhaW5lcjpIVE1MRWxlbWVudDtcclxuICAgIHByb3RlY3RlZCBtaW46RGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICBwcm90ZWN0ZWQgbWF4OkRhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgcHJvdGVjdGVkIHBpY2tlcjpIVE1MRWxlbWVudDtcclxuICAgIHByb3RlY3RlZCBzZWxlY3RlZERhdGU6RGF0ZTtcclxuICAgIHByb3RlY3RlZCBvcHRpb25zOklPcHRpb25zO1xyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgZWxlbWVudDpIVE1MRWxlbWVudCwgcHJvdGVjdGVkIGNvbnRhaW5lcjpIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5waWNrZXJDb250YWluZXIgPSA8SFRNTEVsZW1lbnQ+Y29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2RhdGl1bS1waWNrZXItY29udGFpbmVyJyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBjcmVhdGUoZGF0ZTpEYXRlLCB0cmFuc2l0aW9uOlRyYW5zaXRpb24pIHtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHJlbW92ZSh0cmFuc2l0aW9uOlRyYW5zaXRpb24pIHtcclxuICAgICAgICBpZiAodGhpcy5waWNrZXIgPT09IHZvaWQgMCkgcmV0dXJuO1xyXG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRyYW5zaXRpb25JblRpbWVvdXQpO1xyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbk91dCh0cmFuc2l0aW9uLCB0aGlzLnBpY2tlcik7XHJcbiAgICAgICAgc2V0VGltZW91dCgocGlja2VyOkhUTUxFbGVtZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHBpY2tlci5yZW1vdmUoKTtcclxuICAgICAgICB9LCA1MDAsIHRoaXMucGlja2VyKTsgICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgZ2V0T2Zmc2V0KGVsOkhUTUxFbGVtZW50KTp7eDpudW1iZXIsIHk6bnVtYmVyfSB7XHJcbiAgICAgICAgbGV0IHggPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0IC0gdGhpcy5jb250YWluZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdDtcclxuICAgICAgICBsZXQgeSA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCAtIHRoaXMuY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcDtcclxuICAgICAgICByZXR1cm4geyB4OiB4LCB5OiB5IH07XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB1cGRhdGVPcHRpb25zKG9wdGlvbnM6SU9wdGlvbnMpIHtcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgYXR0YWNoKCkge1xyXG4gICAgICAgIHRoaXMucGlja2VyQ29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMucGlja2VyKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldE1pbigpOkRhdGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1pbjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldE1heCgpOkRhdGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1heDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHNldFNlbGVjdGVkRGF0ZShkYXRlOkRhdGUpOnZvaWQge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWREYXRlID0gbmV3IERhdGUoZGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgdHJhbnNpdGlvbk91dCh0cmFuc2l0aW9uOlRyYW5zaXRpb24sIHBpY2tlcjpIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIGlmICh0cmFuc2l0aW9uID09PSBUcmFuc2l0aW9uLlNMSURFX0xFRlQpIHtcclxuICAgICAgICAgICAgcGlja2VyLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1waWNrZXItcmlnaHQnKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRyYW5zaXRpb24gPT09IFRyYW5zaXRpb24uU0xJREVfUklHSFQpIHtcclxuICAgICAgICAgICAgcGlja2VyLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1waWNrZXItbGVmdCcpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHJhbnNpdGlvbiA9PT0gVHJhbnNpdGlvbi5aT09NX0lOKSB7XHJcbiAgICAgICAgICAgIHBpY2tlci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tcGlja2VyLW91dCcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBpY2tlci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tcGlja2VyLWluJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgdHJhbnNpdGlvbkluVGltZW91dDpudW1iZXI7XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCB0cmFuc2l0aW9uSW4odHJhbnNpdGlvbjpUcmFuc2l0aW9uLCBwaWNrZXI6SFRNTEVsZW1lbnQpIHtcclxuICAgICAgICBsZXQgY2xzOnN0cmluZztcclxuICAgICAgICBpZiAodHJhbnNpdGlvbiA9PT0gVHJhbnNpdGlvbi5TTElERV9MRUZUKSB7XHJcbiAgICAgICAgICAgIGNscyA9ICdkYXRpdW0tcGlja2VyLWxlZnQnO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHJhbnNpdGlvbiA9PT0gVHJhbnNpdGlvbi5TTElERV9SSUdIVCkge1xyXG4gICAgICAgICAgICBjbHMgPSAnZGF0aXVtLXBpY2tlci1yaWdodCc7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0cmFuc2l0aW9uID09PSBUcmFuc2l0aW9uLlpPT01fSU4pIHtcclxuICAgICAgICAgICAgY2xzID0gJ2RhdGl1bS1waWNrZXItaW4nO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNscyA9ICdkYXRpdW0tcGlja2VyLW91dCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHBpY2tlci5jbGFzc0xpc3QuYWRkKGNscyk7XHJcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudHJhbnNpdGlvbkluVGltZW91dCk7XHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uSW5UaW1lb3V0ID0gc2V0VGltZW91dCgocDpIVE1MRWxlbWVudCkgPT4ge1xyXG4gICAgICAgICAgICBwLmNsYXNzTGlzdC5yZW1vdmUoY2xzKTtcclxuICAgICAgICB9LCAxMDAsIHBpY2tlcik7XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIlBpY2tlci50c1wiIC8+XHJcblxyXG5jbGFzcyBEYXRlUGlja2VyIGV4dGVuZHMgUGlja2VyIGltcGxlbWVudHMgSVBpY2tlciB7XHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OkhUTUxFbGVtZW50LCBjb250YWluZXI6SFRNTEVsZW1lbnQpIHtcclxuICAgICAgICBzdXBlcihlbGVtZW50LCBjb250YWluZXIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi50YXAoY29udGFpbmVyLCAnZGF0aXVtLWRhdGUtZWxlbWVudFtkYXRpdW0tZGF0YV0nLCAoZSkgPT4ge1xyXG4gICAgICAgICAgIGxldCBlbDpFbGVtZW50ID0gPEVsZW1lbnQ+ZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xyXG4gICAgICAgICAgIFxyXG4gICAgICAgICAgIGxldCB5ZWFyID0gbmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKS5nZXRGdWxsWWVhcigpO1xyXG4gICAgICAgICAgIGxldCBtb250aCA9IG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSkuZ2V0TW9udGgoKTtcclxuICAgICAgICAgICBsZXQgZGF0ZU9mTW9udGggPSBuZXcgRGF0ZShlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpLmdldERhdGUoKTtcclxuICAgICAgICAgICBcclxuICAgICAgICAgICBsZXQgZGF0ZSA9IG5ldyBEYXRlKHRoaXMuc2VsZWN0ZWREYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgICAgZGF0ZS5zZXRGdWxsWWVhcih5ZWFyKTtcclxuICAgICAgICAgICBkYXRlLnNldE1vbnRoKG1vbnRoKTtcclxuICAgICAgICAgICBpZiAoZGF0ZS5nZXRNb250aCgpICE9PSBtb250aCkge1xyXG4gICAgICAgICAgICAgICBkYXRlLnNldERhdGUoMCk7XHJcbiAgICAgICAgICAgfVxyXG4gICAgICAgICAgIGRhdGUuc2V0RGF0ZShkYXRlT2ZNb250aCk7XHJcbiAgICAgICAgICAgXHJcbiAgICAgICAgICAgdHJpZ2dlci56b29tSW4oZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICBkYXRlOiBkYXRlLFxyXG4gICAgICAgICAgICAgICBjdXJyZW50TGV2ZWw6IExldmVsLkRBVEVcclxuICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi5kb3duKGNvbnRhaW5lciwgJ2RhdGl1bS1kYXRlLWVsZW1lbnQnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZWw6SFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+KGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudCk7XHJcbiAgICAgICAgICAgIGxldCB0ZXh0ID0gdGhpcy5wYWQobmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKS5nZXREYXRlKCkpO1xyXG4gICAgICAgICAgICBsZXQgb2Zmc2V0ID0gdGhpcy5nZXRPZmZzZXQoZWwpO1xyXG4gICAgICAgICAgICB0cmlnZ2VyLm9wZW5CdWJibGUoZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgeDogb2Zmc2V0LnggKyAyMCxcclxuICAgICAgICAgICAgICAgIHk6IG9mZnNldC55ICsgMixcclxuICAgICAgICAgICAgICAgIHRleHQ6IHRleHRcclxuICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBoZWlnaHQ6bnVtYmVyO1xyXG4gICAgXHJcbiAgICBwdWJsaWMgY3JlYXRlKGRhdGU6RGF0ZSwgdHJhbnNpdGlvbjpUcmFuc2l0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5taW4gPSBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSk7XHJcbiAgICAgICAgdGhpcy5tYXggPSBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSArIDEpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBzdGFydCA9IG5ldyBEYXRlKHRoaXMubWluLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgc3RhcnQuc2V0RGF0ZSgxIC0gc3RhcnQuZ2V0RGF5KCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBlbmQgPSBuZXcgRGF0ZSh0aGlzLm1heC52YWx1ZU9mKCkpO1xyXG4gICAgICAgIGVuZC5zZXREYXRlKGVuZC5nZXREYXRlKCkgKyA3IC0gKGVuZC5nZXREYXkoKSA9PT0gMCA/IDcgOiBlbmQuZ2V0RGF5KCkpKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgaXRlcmF0b3IgPSBuZXcgRGF0ZShzdGFydC52YWx1ZU9mKCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMucGlja2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXBpY2tlcicpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbkluKHRyYW5zaXRpb24sIHRoaXMucGlja2VyKTtcclxuICAgICAgICBcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDc7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgaGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLWRhdGUtaGVhZGVyJyk7XHJcbiAgICAgICAgICAgIGhlYWRlci5pbm5lckhUTUwgPSB0aGlzLmdldERheXMoKVtpXS5zbGljZSgwLCAyKTtcclxuICAgICAgICAgICAgdGhpcy5waWNrZXIuYXBwZW5kQ2hpbGQoaGVhZGVyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHRpbWVzID0gMDtcclxuICAgICAgICBcclxuICAgICAgICBkbyB7ICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBkYXRlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1kYXRlLWVsZW1lbnQnKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGRhdGVFbGVtZW50LmlubmVySFRNTCA9IGl0ZXJhdG9yLmdldERhdGUoKS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKGl0ZXJhdG9yLmdldE1vbnRoKCkgPT09IGRhdGUuZ2V0TW9udGgoKSAmJlxyXG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLmlzRGF0ZVNlbGVjdGFibGUoaXRlcmF0b3IpKSB7XHJcbiAgICAgICAgICAgICAgICBkYXRlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJywgaXRlcmF0b3IudG9JU09TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKGRhdGVFbGVtZW50KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGl0ZXJhdG9yLnNldERhdGUoaXRlcmF0b3IuZ2V0RGF0ZSgpICsgMSk7XHJcbiAgICAgICAgICAgIHRpbWVzKys7XHJcbiAgICAgICAgfSB3aGlsZSAoaXRlcmF0b3IudmFsdWVPZigpIDwgZW5kLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBNYXRoLmNlaWwodGltZXMgLyA3KSAqIDM2ICsgMjg7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5hdHRhY2goKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnNldFNlbGVjdGVkRGF0ZSh0aGlzLnNlbGVjdGVkRGF0ZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBzZXRTZWxlY3RlZERhdGUoc2VsZWN0ZWREYXRlOkRhdGUpIHtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkRGF0ZSA9IG5ldyBEYXRlKHNlbGVjdGVkRGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBkYXRlRWxlbWVudHMgPSB0aGlzLnBpY2tlckNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCdkYXRpdW0tZGF0ZS1lbGVtZW50Jyk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRlRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGVsID0gZGF0ZUVsZW1lbnRzLml0ZW0oaSk7XHJcbiAgICAgICAgICAgIGxldCBkYXRlID0gbmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKTtcclxuICAgICAgICAgICAgaWYgKGRhdGUuZ2V0RnVsbFllYXIoKSA9PT0gc2VsZWN0ZWREYXRlLmdldEZ1bGxZZWFyKCkgJiZcclxuICAgICAgICAgICAgICAgIGRhdGUuZ2V0TW9udGgoKSA9PT0gc2VsZWN0ZWREYXRlLmdldE1vbnRoKCkgJiZcclxuICAgICAgICAgICAgICAgIGRhdGUuZ2V0RGF0ZSgpID09PSBzZWxlY3RlZERhdGUuZ2V0RGF0ZSgpKSB7XHJcbiAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1zZWxlY3RlZCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0SGVpZ2h0KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmhlaWdodDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldExldmVsKCkge1xyXG4gICAgICAgIHJldHVybiBMZXZlbC5EQVRFO1xyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIlBpY2tlci50c1wiIC8+XHJcblxyXG5jbGFzcyBUaW1lUGlja2VyIGV4dGVuZHMgUGlja2VyIHtcclxuICAgIHByb3RlY3RlZCB0aW1lRHJhZzpIVE1MRWxlbWVudDtcclxuICAgIHByb3RlY3RlZCB0aW1lRHJhZ0FybTpIVE1MRWxlbWVudDtcclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIHNlY29uZEhhbmQ6SFRNTEVsZW1lbnQ7XHJcbiAgICBwcm90ZWN0ZWQgaG91ckhhbmQ6SFRNTEVsZW1lbnQ7XHJcbiAgICBwcm90ZWN0ZWQgbWludXRlSGFuZDpIVE1MRWxlbWVudDtcclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGRyYWdnaW5nOmJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHB1YmxpYyBpc0RyYWdnaW5nKCk6Ym9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZHJhZ2dpbmc7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCByb3RhdGlvbjpudW1iZXIgPSAwO1xyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgZHJhZ1N0YXJ0KGU6TW91c2VFdmVudHxUb3VjaEV2ZW50KSB7XHJcbiAgICAgICAgbGV0IG1pbnV0ZUFkanVzdCA9IDA7XHJcbiAgICAgICAgaWYgKHRoaXMuZ2V0TGV2ZWwoKSA9PT0gTGV2ZWwuSE9VUikge1xyXG4gICAgICAgICAgICBtaW51dGVBZGp1c3QgPSAoTWF0aC5QSSAqIHRoaXMuc2VsZWN0ZWREYXRlLmdldE1pbnV0ZXMoKSAvIDMwKSAvIDEyO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0cmlnZ2VyLm9wZW5CdWJibGUodGhpcy5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgeDogLTcwICogTWF0aC5zaW4odGhpcy5yb3RhdGlvbiArIG1pbnV0ZUFkanVzdCkgKyAxNDAsIFxyXG4gICAgICAgICAgIHk6IDcwICogTWF0aC5jb3ModGhpcy5yb3RhdGlvbiArIG1pbnV0ZUFkanVzdCkgKyAxNzUsXHJcbiAgICAgICAgICAgdGV4dDogdGhpcy5nZXRCdWJibGVUZXh0KClcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnBpY2tlci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tZHJhZ2dpbmcnKTtcclxuICAgICAgICB0aGlzLmRyYWdnaW5nID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLm1vdmVkID0gMDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBtb3ZlZDpudW1iZXIgPSAwO1xyXG4gICAgcHJvdGVjdGVkIGRyYWdNb3ZlKGU6TW91c2VFdmVudHxUb3VjaEV2ZW50KSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHBvaW50ID0ge1xyXG4gICAgICAgICAgICB4OiB0aGlzLnBpY2tlci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0ICsgMTQwIC0gdGhpcy5nZXRDbGllbnRDb29yKGUpLngsXHJcbiAgICAgICAgICAgIHk6IHRoaXMuZ2V0Q2xpZW50Q29vcihlKS55IC0gdGhpcy5waWNrZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wIC0gMTIwXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCByID0gTWF0aC5hdGFuMihwb2ludC54LCBwb2ludC55KTtcclxuICAgICAgICB0aGlzLnJvdGF0aW9uID0gdGhpcy5ub3JtYWxpemVSb3RhdGlvbihyKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgbmV3RGF0ZSA9IHRoaXMuZ2V0RWxlbWVudERhdGUodGhpcy50aW1lRHJhZyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGdvdG8gPSB0cnVlO1xyXG4gICAgICAgIGlmICh0aGlzLmdldExldmVsKCkgPT09IExldmVsLkhPVVIpIHtcclxuICAgICAgICAgICAgbmV3RGF0ZS5zZXRIb3Vycyh0aGlzLnJvdGF0aW9uVG9UaW1lKHRoaXMucm90YXRpb24pKTtcclxuICAgICAgICAgICAgZ290byA9IHRoaXMub3B0aW9ucy5pc0hvdXJTZWxlY3RhYmxlKG5ld0RhdGUpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5nZXRMZXZlbCgpID09PSBMZXZlbC5NSU5VVEUpIHtcclxuICAgICAgICAgICAgbmV3RGF0ZS5zZXRNaW51dGVzKHRoaXMucm90YXRpb25Ub1RpbWUodGhpcy5yb3RhdGlvbikpOyAgXHJcbiAgICAgICAgICAgIGdvdG8gPSB0aGlzLm9wdGlvbnMuaXNNaW51dGVTZWxlY3RhYmxlKG5ld0RhdGUpOyAgICAgICAgICBcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZ2V0TGV2ZWwoKSA9PT0gTGV2ZWwuU0VDT05EKSB7XHJcbiAgICAgICAgICAgIG5ld0RhdGUuc2V0U2Vjb25kcyh0aGlzLnJvdGF0aW9uVG9UaW1lKHRoaXMucm90YXRpb24pKTtcclxuICAgICAgICAgICAgZ290byA9IHRoaXMub3B0aW9ucy5pc0hvdXJTZWxlY3RhYmxlKG5ld0RhdGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZiAodGhpcy5tb3ZlZCsrID4gMSkge1xyXG4gICAgICAgICAgICB0cmlnZ2VyLnVwZGF0ZUJ1YmJsZSh0aGlzLmVsZW1lbnQsIHtcclxuICAgICAgICAgICAgICAgIHg6IC03MCAqIE1hdGguc2luKHRoaXMucm90YXRpb24pICsgMTQwLCBcclxuICAgICAgICAgICAgICAgIHk6IDcwICogTWF0aC5jb3ModGhpcy5yb3RhdGlvbikgKyAxNzUsXHJcbiAgICAgICAgICAgICAgICB0ZXh0OiB0aGlzLmdldEJ1YmJsZVRleHQoKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy51cGRhdGVMYWJlbHMobmV3RGF0ZSk7XHJcbiAgICAgICAgaWYgKGdvdG8pIHtcclxuICAgICAgICAgICAgdHJpZ2dlci5nb3RvKHRoaXMuZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgZGF0ZTogbmV3RGF0ZSxcclxuICAgICAgICAgICAgICAgIGxldmVsOiB0aGlzLmdldExldmVsKCksXHJcbiAgICAgICAgICAgICAgICB1cGRhdGU6IGZhbHNlXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnVwZGF0ZUVsZW1lbnRzKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBkcmFnRW5kKGU6TW91c2VFdmVudHxUb3VjaEV2ZW50KSB7XHJcbiAgICAgICAgdGhpcy5waWNrZXIuY2xhc3NMaXN0LnJlbW92ZSgnZGF0aXVtLWRyYWdnaW5nJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGRhdGUgPSB0aGlzLmdldEVsZW1lbnREYXRlKHRoaXMudGltZURyYWcpO1xyXG4gICAgICAgIGxldCB6b29tSW4gPSB0cnVlO1xyXG4gICAgICAgIGlmICh0aGlzLmdldExldmVsKCkgPT09IExldmVsLkhPVVIpIHtcclxuICAgICAgICAgICAgZGF0ZS5zZXRIb3Vycyh0aGlzLnJvdGF0aW9uVG9UaW1lKHRoaXMucm90YXRpb24pKTtcclxuICAgICAgICAgICAgZGF0ZSA9IHRoaXMucm91bmQoZGF0ZSk7XHJcbiAgICAgICAgICAgIHpvb21JbiA9IHRoaXMub3B0aW9ucy5pc0hvdXJTZWxlY3RhYmxlKGRhdGUpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5nZXRMZXZlbCgpID09PSBMZXZlbC5NSU5VVEUpIHtcclxuICAgICAgICAgICAgZGF0ZS5zZXRNaW51dGVzKHRoaXMucm90YXRpb25Ub1RpbWUodGhpcy5yb3RhdGlvbikpO1xyXG4gICAgICAgICAgICBkYXRlID0gdGhpcy5yb3VuZChkYXRlKTtcclxuICAgICAgICAgICAgem9vbUluID0gdGhpcy5vcHRpb25zLmlzTWludXRlU2VsZWN0YWJsZShkYXRlKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZ2V0TGV2ZWwoKSA9PT0gTGV2ZWwuU0VDT05EKSB7XHJcbiAgICAgICAgICAgIGRhdGUuc2V0U2Vjb25kcyh0aGlzLnJvdGF0aW9uVG9UaW1lKHRoaXMucm90YXRpb24pKTtcclxuICAgICAgICAgICAgZGF0ZSA9IHRoaXMucm91bmQoZGF0ZSk7XHJcbiAgICAgICAgICAgIHpvb21JbiA9IHRoaXMub3B0aW9ucy5pc1NlY29uZFNlbGVjdGFibGUoZGF0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh6b29tSW4pIHtcclxuICAgICAgICAgICAgdHJpZ2dlci56b29tSW4odGhpcy5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgICAgICBkYXRlOiBkYXRlLFxyXG4gICAgICAgICAgICAgICAgY3VycmVudExldmVsOiB0aGlzLmdldExldmVsKClcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcgPSBmYWxzZTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnVwZGF0ZUVsZW1lbnRzKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCB1cGRhdGVFbGVtZW50cygpIHtcclxuICAgICAgICB0aGlzLnRpbWVEcmFnQXJtLnN0eWxlLnRyYW5zZm9ybSA9IGByb3RhdGUoJHt0aGlzLnJvdGF0aW9ufXJhZClgO1xyXG4gICAgICAgIGlmICh0aGlzLmdldExldmVsKCkgPT0gTGV2ZWwuSE9VUikge1xyXG4gICAgICAgICAgICBsZXQgbWludXRlQWRqdXN0ID0gMDtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmRyYWdnaW5nKSB7XHJcbiAgICAgICAgICAgICAgICBtaW51dGVBZGp1c3QgPSAoTWF0aC5QSSAqIHRoaXMuc2VsZWN0ZWREYXRlLmdldE1pbnV0ZXMoKSAvIDMwKSAvIDEyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMudGltZURyYWdBcm0uc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZSgke3RoaXMucm90YXRpb24gKyBtaW51dGVBZGp1c3R9cmFkKWA7XHJcbiAgICAgICAgICAgIHRoaXMuaG91ckhhbmQuc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZSgke3RoaXMucm90YXRpb24gKyBtaW51dGVBZGp1c3R9cmFkKWA7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmdldExldmVsKCkgPT09IExldmVsLk1JTlVURSkge1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IHQgPSB0aGlzLnNlbGVjdGVkRGF0ZS5nZXRIb3VycygpO1xyXG4gICAgICAgICAgICBsZXQgcjEgPSAgKHQgKyA2KSAvIDYgKiBNYXRoLlBJO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IHIgPSB0aGlzLnJvdGF0aW9uO1xyXG4gICAgICAgICAgICByID0gdGhpcy5wdXRSb3RhdGlvbkluQm91bmRzKHIpO1xyXG4gICAgICAgICAgICByMSArPSAocitNYXRoLlBJKS8xMjtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuaG91ckhhbmQuc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZSgke3IxfXJhZClgO1xyXG4gICAgICAgICAgICB0aGlzLm1pbnV0ZUhhbmQuc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZSgke3RoaXMucm90YXRpb259cmFkKWA7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmdldExldmVsKCkgPT09IExldmVsLlNFQ09ORCkge1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IHQgPSB0aGlzLnNlbGVjdGVkRGF0ZS5nZXRIb3VycygpO1xyXG4gICAgICAgICAgICBsZXQgcjEgPSAgKHQgKyA2KSAvIDYgKiBNYXRoLlBJO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgdDIgPSB0aGlzLnNlbGVjdGVkRGF0ZS5nZXRNaW51dGVzKCk7XHJcbiAgICAgICAgICAgIGxldCByMiA9IHRoaXMudGltZVRvUm90YXRpb24odDIpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IHIgPSByMjtcclxuICAgICAgICAgICAgciA9IHRoaXMucHV0Um90YXRpb25JbkJvdW5kcyhyKTtcclxuICAgICAgICAgICAgcjEgKz0gKHIrTWF0aC5QSSkvMTI7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLmhvdXJIYW5kLnN0eWxlLnRyYW5zZm9ybSA9IGByb3RhdGUoJHtyMX1yYWQpYDtcclxuICAgICAgICAgICAgdGhpcy5taW51dGVIYW5kLnN0eWxlLnRyYW5zZm9ybSA9IGByb3RhdGUoJHtyMn1yYWQpYDtcclxuICAgICAgICAgICAgdGhpcy5zZWNvbmRIYW5kLnN0eWxlLnRyYW5zZm9ybSA9IGByb3RhdGUoJHt0aGlzLnJvdGF0aW9ufXJhZClgO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIHB1dFJvdGF0aW9uSW5Cb3VuZHMocjpudW1iZXIsIGZhY3RvcjpudW1iZXIgPSAyKSB7XHJcbiAgICAgICAgd2hpbGUgKHIgPiBNYXRoLlBJKSByIC09IE1hdGguUEkgKiBmYWN0b3I7XHJcbiAgICAgICAgd2hpbGUgKHIgPCAtTWF0aC5QSSkgciArPSBNYXRoLlBJICogZmFjdG9yO1xyXG4gICAgICAgIHJldHVybiByO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgbm9ybWFsaXplUm90YXRpb24ocjpudW1iZXIsIGZhY3RvcjpudW1iZXIgPSAyKSB7XHJcbiAgICAgICAgcmV0dXJuIHIgLSBNYXRoLnJvdW5kKChyIC0gdGhpcy5yb3RhdGlvbikgLyBNYXRoLlBJIC8gZmFjdG9yKSAqIE1hdGguUEkgKiBmYWN0b3I7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBzZXRTZWxlY3RlZERhdGUoZGF0ZTpEYXRlKSB7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZERhdGUgPSBuZXcgRGF0ZShkYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMuZ2V0TGV2ZWwoKSA9PT0gTGV2ZWwuSE9VUikge1xyXG4gICAgICAgICAgICB0aGlzLnJvdGF0aW9uID0gdGhpcy5ub3JtYWxpemVSb3RhdGlvbigoZGF0ZS5nZXRIb3VycygpICsgNikgLyA2ICogTWF0aC5QSSwgMik7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmdldExldmVsKCkgPT09IExldmVsLk1JTlVURSkge1xyXG4gICAgICAgICAgICB0aGlzLnJvdGF0aW9uID0gdGhpcy5ub3JtYWxpemVSb3RhdGlvbigoZGF0ZS5nZXRNaW51dGVzKCkgKyAzMCkgLyAzMCAqIE1hdGguUEksIDIpOyAgICAgICAgICAgIFxyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5nZXRMZXZlbCgpID09PSBMZXZlbC5TRUNPTkQpIHtcclxuICAgICAgICAgICAgdGhpcy5yb3RhdGlvbiA9IHRoaXMubm9ybWFsaXplUm90YXRpb24oKGRhdGUuZ2V0U2Vjb25kcygpICsgMzApIC8gMzAgKiBNYXRoLlBJLCAyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMudGltZURyYWdBcm0gIT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUVsZW1lbnRzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLnBpY2tlciAhPT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlTGFiZWxzKGRhdGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldEhlaWdodCgpIHtcclxuICAgICAgICByZXR1cm4gMjQwO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgZmxvb3IoZGF0ZTpEYXRlKTpEYXRlIHsgdGhyb3cgJ3VuaW1wbGVtZW50ZWQnIH1cclxuICAgIHByb3RlY3RlZCBjZWlsKGRhdGU6RGF0ZSk6RGF0ZSB7IHRocm93ICd1bmltcGxlbWVudGVkJyB9XHJcbiAgICBwcm90ZWN0ZWQgcm91bmQoZGF0ZTpEYXRlKTpEYXRlIHsgdGhyb3cgJ3VuaW1wbGVtZW50ZWQnIH1cclxuICAgIHByb3RlY3RlZCB1cGRhdGVMYWJlbHMoZGF0ZTpEYXRlLCBmb3JjZVVwZGF0ZTpib29sZWFuID0gZmFsc2UpIHsgdGhyb3cgJ3VuaW1wbGVtZW50ZWQnIH1cclxuICAgIHByb3RlY3RlZCBnZXRFbGVtZW50RGF0ZShlbDpFbGVtZW50KTpEYXRlIHsgdGhyb3cgJ3VuaW1wbGVtZW50ZWQnIH1cclxuICAgIHByb3RlY3RlZCBnZXRCdWJibGVUZXh0KCk6c3RyaW5nIHsgdGhyb3cgJ3VuaW1wbGVtZW50ZWQnIH1cclxuICAgIHByb3RlY3RlZCByb3RhdGlvblRvVGltZShyb3RhdGlvbjpudW1iZXIpOm51bWJlciB7IHRocm93ICd1bmltcGxlbWVudGVkJyB9XHJcbiAgICBwcm90ZWN0ZWQgdGltZVRvUm90YXRpb24odGltZTpudW1iZXIpOm51bWJlciB7IHRocm93ICd1bmltcGxlbWVudGVkJyB9XHJcbiAgICBwdWJsaWMgZ2V0TGV2ZWwoKTpMZXZlbCB7IHRocm93ICd1bmltcGxlbWVudGVkJyB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiVGltZVBpY2tlci50c1wiIC8+XHJcblxyXG5jbGFzcyBIb3VyUGlja2VyIGV4dGVuZHMgVGltZVBpY2tlciBpbXBsZW1lbnRzIElUaW1lUGlja2VyIHtcclxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6SFRNTEVsZW1lbnQsIGNvbnRhaW5lcjpIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIHN1cGVyKGVsZW1lbnQsIGNvbnRhaW5lcik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGlzdGVuLmRyYWcoY29udGFpbmVyLCAnLmRhdGl1bS1ob3VyLWRyYWcnLCB7XHJcbiAgICAgICAgICAgIGRyYWdTdGFydDogKGUpID0+IHRoaXMuZHJhZ1N0YXJ0KGUpLFxyXG4gICAgICAgICAgICBkcmFnTW92ZTogKGUpID0+IHRoaXMuZHJhZ01vdmUoZSksXHJcbiAgICAgICAgICAgIGRyYWdFbmQ6IChlKSA9PiB0aGlzLmRyYWdFbmQoZSksIFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi50YXAoY29udGFpbmVyLCAnLmRhdGl1bS1ob3VyLWVsZW1lbnQnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZWw6RWxlbWVudCA9IDxFbGVtZW50PmUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRyaWdnZXIuem9vbUluKHRoaXMuZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgZGF0ZTogdGhpcy5nZXRFbGVtZW50RGF0ZShlbCksXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50TGV2ZWw6IExldmVsLkhPVVJcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGlzdGVuLmRvd24oY29udGFpbmVyLCAnLmRhdGl1bS1ob3VyLWVsZW1lbnQnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZWw6SFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+KGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudCk7XHJcbiAgICAgICAgICAgIGxldCBob3VycyA9IG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSkuZ2V0SG91cnMoKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBvZmZzZXQgPSB0aGlzLmdldE9mZnNldChlbCk7XHJcbiAgICAgICAgICAgIHRyaWdnZXIub3BlbkJ1YmJsZShlbGVtZW50LCB7XHJcbiAgICAgICAgICAgICAgICB4OiBvZmZzZXQueCArIDI1LFxyXG4gICAgICAgICAgICAgICAgeTogb2Zmc2V0LnkgKyAzLFxyXG4gICAgICAgICAgICAgICAgdGV4dDogdGhpcy5nZXRCdWJibGVUZXh0KGhvdXJzKVxyXG4gICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi50YXAoY29udGFpbmVyLCAnZGF0aXVtLW1lcmlkaWVtLXN3aXRjaGVyJywgKCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgbmV3RGF0ZSA9IG5ldyBEYXRlKHRoaXMubGFzdExhYmVsRGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgICBpZiAobmV3RGF0ZS5nZXRIb3VycygpIDwgMTIpIHtcclxuICAgICAgICAgICAgICAgIG5ld0RhdGUuc2V0SG91cnMobmV3RGF0ZS5nZXRIb3VycygpICsgMTIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yb3RhdGlvbiArPSBNYXRoLlBJICogMjtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG5ld0RhdGUuc2V0SG91cnMobmV3RGF0ZS5nZXRIb3VycygpIC0gMTIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yb3RhdGlvbiAtPSBNYXRoLlBJICogMjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVMYWJlbHMobmV3RGF0ZSk7XHJcbiAgICAgICAgICAgIHRyaWdnZXIuZ290byh0aGlzLmVsZW1lbnQsIHtcclxuICAgICAgICAgICAgICAgIGRhdGU6IG5ld0RhdGUsXHJcbiAgICAgICAgICAgICAgICBsZXZlbDogTGV2ZWwuSE9VUixcclxuICAgICAgICAgICAgICAgIHVwZGF0ZTogZmFsc2VcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRWxlbWVudHMoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGNlaWwoZGF0ZTpEYXRlKTpEYXRlIHtcclxuICAgICAgICBsZXQgY2VpbGVkRGF0ZSA9IG5ldyBEYXRlKGRhdGUudmFsdWVPZigpKTtcclxuICAgICAgICBsZXQgdXBwZXIgPSBjZWlsZWREYXRlLmdldEhvdXJzKCkgKyAxO1xyXG4gICAgICAgIGxldCBvcmlnID0gY2VpbGVkRGF0ZS5nZXRIb3VycygpO1xyXG4gICAgICAgIHdoaWxlICghdGhpcy5vcHRpb25zLmlzSG91clNlbGVjdGFibGUoY2VpbGVkRGF0ZSkpIHtcclxuICAgICAgICAgICAgaWYgKHVwcGVyID4gMjMpIHVwcGVyID0gMDtcclxuICAgICAgICAgICAgY2VpbGVkRGF0ZS5zZXRIb3Vycyh1cHBlcisrKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5pc0hvdXJTZWxlY3RhYmxlKGNlaWxlZERhdGUpKSBicmVhaztcclxuICAgICAgICAgICAgaWYgKHVwcGVyID09PSBvcmlnKSBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNlaWxlZERhdGU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBmbG9vcihkYXRlOkRhdGUpOkRhdGUge1xyXG4gICAgICAgIGxldCBmbG9vcmVkRGF0ZSA9IG5ldyBEYXRlKGRhdGUudmFsdWVPZigpKTtcclxuICAgICAgICBsZXQgbG93ZXIgPSBmbG9vcmVkRGF0ZS5nZXRIb3VycygpIC0gMTtcclxuICAgICAgICBsZXQgb3JpZyA9IGZsb29yZWREYXRlLmdldEhvdXJzKCk7XHJcbiAgICAgICAgd2hpbGUgKCF0aGlzLm9wdGlvbnMuaXNIb3VyU2VsZWN0YWJsZShmbG9vcmVkRGF0ZSkpIHtcclxuICAgICAgICAgICAgaWYgKGxvd2VyIDwgMCkgbG93ZXIgPSAyMztcclxuICAgICAgICAgICAgZmxvb3JlZERhdGUuc2V0SG91cnMobG93ZXItLSk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaXNIb3VyU2VsZWN0YWJsZShmbG9vcmVkRGF0ZSkpIGJyZWFrO1xyXG4gICAgICAgICAgICBpZiAobG93ZXIgPT09IG9yaWcpIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmxvb3JlZERhdGU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCByb3VuZChkYXRlOkRhdGUpOkRhdGUge1xyXG4gICAgICAgIGxldCByb3VuZGVkRGF0ZSA9IG5ldyBEYXRlKGRhdGUudmFsdWVPZigpKTtcclxuICAgICAgICBsZXQgbG93ZXIgPSByb3VuZGVkRGF0ZS5nZXRIb3VycygpIC0gMTtcclxuICAgICAgICBsZXQgdXBwZXIgPSByb3VuZGVkRGF0ZS5nZXRIb3VycygpICsgMTtcclxuICAgICAgICB3aGlsZSAoIXRoaXMub3B0aW9ucy5pc0hvdXJTZWxlY3RhYmxlKHJvdW5kZWREYXRlKSkge1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKGxvd2VyIDwgMCkgbG93ZXIgPSAyMztcclxuICAgICAgICAgICAgcm91bmRlZERhdGUuc2V0SG91cnMobG93ZXItLSk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaXNIb3VyU2VsZWN0YWJsZShyb3VuZGVkRGF0ZSkpIGJyZWFrO1xyXG4gICAgICAgICAgICBpZiAobG93ZXIgPT09IHVwcGVyKSBicmVhaztcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICh1cHBlciA+IDIzKSB1cHBlciA9IDA7XHJcbiAgICAgICAgICAgIHJvdW5kZWREYXRlLnNldEhvdXJzKHVwcGVyKyspO1xyXG4gICAgICAgICAgICBpZiAobG93ZXIgPT09IHVwcGVyKSBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJvdW5kZWREYXRlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgZ2V0QnViYmxlVGV4dChob3Vycz86bnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKGhvdXJzID09PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgaG91cnMgPSB0aGlzLnJvdGF0aW9uVG9UaW1lKHRoaXMucm90YXRpb24pOyBcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGQgPSBuZXcgRGF0ZSh0aGlzLnNlbGVjdGVkRGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgIGQuc2V0SG91cnMoaG91cnMpO1xyXG4gICAgICAgIGQgPSB0aGlzLnJvdW5kKGQpO1xyXG4gICAgICAgIGhvdXJzID0gZC5nZXRIb3VycygpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMubWlsaXRhcnlUaW1lKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhZChob3VycykrJ2hyJztcclxuICAgICAgICB9IGVsc2UgaWYgKGhvdXJzID09PSAxMikge1xyXG4gICAgICAgICAgICByZXR1cm4gJzEycG0nO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoaG91cnMgPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuICcxMmFtJztcclxuICAgICAgICB9IGVsc2UgaWYgKGhvdXJzID4gMTEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIChob3VycyAtIDEyKSArICdwbSc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGhvdXJzICsgJ2FtJztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBnZXRFbGVtZW50RGF0ZShlbDpFbGVtZW50KSB7XHJcbiAgICAgICAgbGV0IGQgPSBuZXcgRGF0ZShlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpO1xyXG4gICAgICAgIGxldCB5ZWFyID0gZC5nZXRGdWxsWWVhcigpO1xyXG4gICAgICAgIGxldCBtb250aCA9IGQuZ2V0TW9udGgoKTtcclxuICAgICAgICBsZXQgZGF0ZU9mTW9udGggPSBkLmdldERhdGUoKTtcclxuICAgICAgICBsZXQgaG91cnMgPSBkLmdldEhvdXJzKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IG5ld0RhdGUgPSBuZXcgRGF0ZSh0aGlzLnNlbGVjdGVkRGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgIG5ld0RhdGUuc2V0RnVsbFllYXIoeWVhcik7XHJcbiAgICAgICAgbmV3RGF0ZS5zZXRNb250aChtb250aCk7XHJcbiAgICAgICAgaWYgKG5ld0RhdGUuZ2V0TW9udGgoKSAhPT0gbW9udGgpIHtcclxuICAgICAgICAgICAgbmV3RGF0ZS5zZXREYXRlKDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBuZXdEYXRlLnNldERhdGUoZGF0ZU9mTW9udGgpO1xyXG4gICAgICAgIG5ld0RhdGUuc2V0SG91cnMoaG91cnMpO1xyXG4gICAgICAgIHJldHVybiBuZXdEYXRlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgcm90YXRpb25Ub1RpbWUocjpudW1iZXIpIHtcclxuICAgICAgICB3aGlsZSAociA+IDUqTWF0aC5QSSkgciAtPSA0Kk1hdGguUEk7XHJcbiAgICAgICAgd2hpbGUgKHIgPCBNYXRoLlBJKSByICs9IDQqTWF0aC5QSTtcclxuICAgICAgICByIC09IDIgKiBNYXRoLlBJO1xyXG4gICAgICAgIGxldCB0ID0gKHIgLyBNYXRoLlBJICogNikgKyA2O1xyXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKHQrLjAwMDAwMSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCB0aW1lVG9Sb3RhdGlvbih0Om51bWJlcikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm5vcm1hbGl6ZVJvdGF0aW9uKCh0ICsgNikgLyA2ICogTWF0aC5QSSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBjcmVhdGUoZGF0ZTpEYXRlLCB0cmFuc2l0aW9uOlRyYW5zaXRpb24pIHtcclxuICAgICAgICB0aGlzLm1pbiA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCBkYXRlLmdldERhdGUoKSk7XHJcbiAgICAgICAgdGhpcy5tYXggPSBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSwgZGF0ZS5nZXREYXRlKCkgKyAxKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgaXRlcmF0b3IgPSBuZXcgRGF0ZSh0aGlzLm1pbi52YWx1ZU9mKCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMucGlja2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXBpY2tlcicpO1xyXG4gICAgICAgIHRoaXMucGlja2VyLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1ob3VyLXBpY2tlcicpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbkluKHRyYW5zaXRpb24sIHRoaXMucGlja2VyKTtcclxuICAgICAgICBcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEyOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHRpY2sgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tdGljaycpO1xyXG4gICAgICAgICAgICBsZXQgdGlja0xhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpY2stbGFiZWwnKTtcclxuICAgICAgICAgICAgdGlja0xhYmVsLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1ob3VyLWVsZW1lbnQnKTtcclxuICAgICAgICAgICAgbGV0IHRpY2tMYWJlbENvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS10aWNrLWxhYmVsLWNvbnRhaW5lcicpO1xyXG4gICAgICAgICAgICBsZXQgciA9IGkgKiBNYXRoLlBJLzYgKyBNYXRoLlBJO1xyXG4gICAgICAgICAgICB0aWNrTGFiZWxDb250YWluZXIuYXBwZW5kQ2hpbGQodGlja0xhYmVsKTtcclxuICAgICAgICAgICAgdGljay5hcHBlbmRDaGlsZCh0aWNrTGFiZWxDb250YWluZXIpO1xyXG4gICAgICAgICAgICB0aWNrLnN0eWxlLnRyYW5zZm9ybSA9IGByb3RhdGUoJHtyfXJhZClgO1xyXG4gICAgICAgICAgICB0aWNrTGFiZWxDb250YWluZXIuc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZSgkezIqTWF0aC5QSSAtIHJ9cmFkKWA7XHJcbiAgICAgICAgICAgIHRpY2tMYWJlbC5zZXRBdHRyaWJ1dGUoJ2RhdGl1bS1jbG9jay1wb3MnLCBpLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IGQgPSBuZXcgRGF0ZShkYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgaG91cnMgPSB0aGlzLnJvdGF0aW9uVG9UaW1lKHIpO1xyXG4gICAgICAgICAgICBpZiAoZGF0ZS5nZXRIb3VycygpID4gMTEpIGhvdXJzICs9IDEyO1xyXG4gICAgICAgICAgICBkLnNldEhvdXJzKGhvdXJzKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRpY2tMYWJlbC5zZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJywgZC50b0lTT1N0cmluZygpKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKHRpY2spO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm1lcmlkaWVtU3dpdGNoZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tbWVyaWRpZW0tc3dpdGNoZXInKTtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLm1pbGl0YXJ5VGltZSkge1xyXG4gICAgICAgICAgICB0aGlzLm1lcmlkaWVtU3dpdGNoZXIuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLW1pbGl0YXJ5LXRpbWUnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5waWNrZXIuYXBwZW5kQ2hpbGQodGhpcy5tZXJpZGllbVN3aXRjaGVyKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmhvdXJIYW5kID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLWhvdXItaGFuZCcpO1xyXG4gICAgICAgIHRoaXMudGltZURyYWdBcm0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tdGltZS1kcmFnLWFybScpO1xyXG4gICAgICAgIHRoaXMudGltZURyYWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tdGltZS1kcmFnJyk7XHJcbiAgICAgICAgdGhpcy50aW1lRHJhZy5jbGFzc0xpc3QuYWRkKCdkYXRpdW0taG91ci1kcmFnJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy50aW1lRHJhZy5zZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJywgZGF0ZS50b0lTT1N0cmluZygpKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnRpbWVEcmFnQXJtLmFwcGVuZENoaWxkKHRoaXMudGltZURyYWcpO1xyXG4gICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKHRoaXMudGltZURyYWdBcm0pO1xyXG4gICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKHRoaXMuaG91ckhhbmQpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMubWVyaWRpZW0gPSB2b2lkIDA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5hdHRhY2goKTtcclxuICAgICAgICB0aGlzLnNldFNlbGVjdGVkRGF0ZSh0aGlzLnNlbGVjdGVkRGF0ZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgbWVyaWRpZW1Td2l0Y2hlcjpIVE1MRWxlbWVudDtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBtZXJpZGllbTpzdHJpbmc7XHJcbiAgICBwcml2YXRlIGxhc3RMYWJlbERhdGU6RGF0ZTtcclxuICAgIHByb3RlY3RlZCB1cGRhdGVMYWJlbHMoZGF0ZTpEYXRlLCBmb3JjZVVwZGF0ZTpib29sZWFuID0gZmFsc2UpIHtcclxuICAgICAgICB0aGlzLmxhc3RMYWJlbERhdGUgPSBkYXRlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLm1lcmlkaWVtICE9PSB2b2lkIDAgJiZcclxuICAgICAgICAgICAgKHRoaXMubWVyaWRpZW0gPT09ICdBTScgJiYgZGF0ZS5nZXRIb3VycygpIDwgMTIpIHx8XHJcbiAgICAgICAgICAgICh0aGlzLm1lcmlkaWVtID09PSAnUE0nICYmIGRhdGUuZ2V0SG91cnMoKSA+IDExKSkge1xyXG4gICAgICAgICAgICBpZiAoIWZvcmNlVXBkYXRlKSByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMubWVyaWRpZW0gPSBkYXRlLmdldEhvdXJzKCkgPCAxMiA/ICdBTScgOiAnUE0nO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLm1lcmlkaWVtID09PSAnQU0nKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWVyaWRpZW1Td2l0Y2hlci5jbGFzc0xpc3QucmVtb3ZlKCdkYXRpdW0tcG0tc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgdGhpcy5tZXJpZGllbVN3aXRjaGVyLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1hbS1zZWxlY3RlZCcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMubWVyaWRpZW1Td2l0Y2hlci5jbGFzc0xpc3QucmVtb3ZlKCdkYXRpdW0tYW0tc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgdGhpcy5tZXJpZGllbVN3aXRjaGVyLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1wbS1zZWxlY3RlZCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBsZXQgbGFiZWxzID0gdGhpcy5waWNrZXIucXVlcnlTZWxlY3RvckFsbCgnW2RhdGl1bS1jbG9jay1wb3NdJyk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsYWJlbHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGxhYmVsID0gbGFiZWxzLml0ZW0oaSk7XHJcbiAgICAgICAgICAgIGxldCByID0gTWF0aC5QSSpwYXJzZUludChsYWJlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1jbG9jay1wb3MnKSwgMTApLzYtMypNYXRoLlBJO1xyXG4gICAgICAgICAgICBsZXQgdGltZSA9IHRoaXMucm90YXRpb25Ub1RpbWUocik7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgZCA9IG5ldyBEYXRlKGxhYmVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSk7XHJcbiAgICAgICAgICAgIGlmIChkYXRlLmdldEhvdXJzKCkgPiAxMSkge1xyXG4gICAgICAgICAgICAgICAgZC5zZXRIb3Vycyh0aW1lICsgMTIpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZC5zZXRIb3Vycyh0aW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGFiZWwuc2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScsIGQudG9JU09TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmlzSG91clNlbGVjdGFibGUoZCkpIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1pbmFjdGl2ZScpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGFiZWwuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLWluYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMubWlsaXRhcnlUaW1lKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZS5nZXRIb3VycygpID4gMTEpIHRpbWUgKz0gMTI7XHJcbiAgICAgICAgICAgICAgICBsYWJlbC5pbm5lckhUTUwgPSB0aGlzLnBhZCh0aW1lKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aW1lID09PSAwKSB0aW1lID0gMTI7XHJcbiAgICAgICAgICAgICAgICBsYWJlbC5pbm5lckhUTUwgPSB0aW1lLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB1cGRhdGVPcHRpb25zKG9wdGlvbnM6SU9wdGlvbnMpIHtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zICE9PSB2b2lkIDAgJiYgdGhpcy5vcHRpb25zLm1pbGl0YXJ5VGltZSAhPT0gb3B0aW9ucy5taWxpdGFyeVRpbWUpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVMYWJlbHModGhpcy5sYXN0TGFiZWxEYXRlLCB0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuICAgICAgICBcclxuICAgICAgICBpZiAodGhpcy5tZXJpZGllbVN3aXRjaGVyICE9PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5taWxpdGFyeVRpbWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubWVyaWRpZW1Td2l0Y2hlci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tbWlsaXRhcnktdGltZScpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tZXJpZGllbVN3aXRjaGVyLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1taWxpdGFyeS10aW1lJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICByZXR1cm4gTGV2ZWwuSE9VUjtcclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJUaW1lUGlja2VyLnRzXCIgLz5cclxuXHJcbmNsYXNzIE1pbnV0ZVBpY2tlciBleHRlbmRzIFRpbWVQaWNrZXIgaW1wbGVtZW50cyBJVGltZVBpY2tlciB7XHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OkhUTUxFbGVtZW50LCBjb250YWluZXI6SFRNTEVsZW1lbnQpIHtcclxuICAgICAgICBzdXBlcihlbGVtZW50LCBjb250YWluZXIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi5kcmFnKGNvbnRhaW5lciwgJy5kYXRpdW0tbWludXRlLWRyYWcnLCB7XHJcbiAgICAgICAgICAgIGRyYWdTdGFydDogKGUpID0+IHRoaXMuZHJhZ1N0YXJ0KGUpLFxyXG4gICAgICAgICAgICBkcmFnTW92ZTogKGUpID0+IHRoaXMuZHJhZ01vdmUoZSksXHJcbiAgICAgICAgICAgIGRyYWdFbmQ6IChlKSA9PiB0aGlzLmRyYWdFbmQoZSksIFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi50YXAoY29udGFpbmVyLCAnLmRhdGl1bS1taW51dGUtZWxlbWVudCcsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBlbDpFbGVtZW50ID0gPEVsZW1lbnQ+ZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdHJpZ2dlci56b29tSW4odGhpcy5lbGVtZW50LCB7XHJcbiAgICAgICAgICAgICAgICBkYXRlOiB0aGlzLmdldEVsZW1lbnREYXRlKGVsKSxcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRMZXZlbDogTGV2ZWwuTUlOVVRFXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi5kb3duKGNvbnRhaW5lciwgJy5kYXRpdW0tbWludXRlLWVsZW1lbnQnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZWw6SFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+KGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudCk7XHJcbiAgICAgICAgICAgIGxldCBtaW51dGVzID0gbmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKS5nZXRNaW51dGVzKCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgb2Zmc2V0ID0gdGhpcy5nZXRPZmZzZXQoZWwpO1xyXG4gICAgICAgICAgICB0cmlnZ2VyLm9wZW5CdWJibGUoZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgeDogb2Zmc2V0LnggKyAyNSxcclxuICAgICAgICAgICAgICAgIHk6IG9mZnNldC55ICsgMyxcclxuICAgICAgICAgICAgICAgIHRleHQ6IHRoaXMuZ2V0QnViYmxlVGV4dChtaW51dGVzKVxyXG4gICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgY2VpbChkYXRlOkRhdGUpOkRhdGUge1xyXG4gICAgICAgIGxldCBjZWlsZWREYXRlID0gbmV3IERhdGUoZGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgIGxldCB1cHBlciA9IGNlaWxlZERhdGUuZ2V0TWludXRlcygpICsgMTtcclxuICAgICAgICBsZXQgb3JpZyA9IGNlaWxlZERhdGUuZ2V0TWludXRlcygpO1xyXG4gICAgICAgIHdoaWxlICghdGhpcy5vcHRpb25zLmlzTWludXRlU2VsZWN0YWJsZShjZWlsZWREYXRlKSkge1xyXG4gICAgICAgICAgICBpZiAodXBwZXIgPiA1OSkgdXBwZXIgPSAwO1xyXG4gICAgICAgICAgICBjZWlsZWREYXRlLnNldE1pbnV0ZXModXBwZXIrKyk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaXNNaW51dGVTZWxlY3RhYmxlKGNlaWxlZERhdGUpKSBicmVhaztcclxuICAgICAgICAgICAgaWYgKHVwcGVyID09PSBvcmlnKSBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNlaWxlZERhdGU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBmbG9vcihkYXRlOkRhdGUpOkRhdGUge1xyXG4gICAgICAgIGxldCBmbG9vcmVkRGF0ZSA9IG5ldyBEYXRlKGRhdGUudmFsdWVPZigpKTtcclxuICAgICAgICBsZXQgbG93ZXIgPSBmbG9vcmVkRGF0ZS5nZXRNaW51dGVzKCkgLSAxO1xyXG4gICAgICAgIGxldCBvcmlnID0gZmxvb3JlZERhdGUuZ2V0TWludXRlcygpO1xyXG4gICAgICAgIHdoaWxlICghdGhpcy5vcHRpb25zLmlzTWludXRlU2VsZWN0YWJsZShmbG9vcmVkRGF0ZSkpIHtcclxuICAgICAgICAgICAgaWYgKGxvd2VyIDwgMCkgbG93ZXIgPSA1OTtcclxuICAgICAgICAgICAgZmxvb3JlZERhdGUuc2V0TWludXRlcyhsb3dlci0tKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5pc01pbnV0ZVNlbGVjdGFibGUoZmxvb3JlZERhdGUpKSBicmVhaztcclxuICAgICAgICAgICAgaWYgKGxvd2VyID09PSBvcmlnKSBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZsb29yZWREYXRlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgcm91bmQoZGF0ZTpEYXRlKTpEYXRlIHtcclxuICAgICAgICBsZXQgcm91bmRlZERhdGUgPSBuZXcgRGF0ZShkYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgbGV0IGxvd2VyID0gcm91bmRlZERhdGUuZ2V0TWludXRlcygpIC0gMTtcclxuICAgICAgICBsZXQgdXBwZXIgPSByb3VuZGVkRGF0ZS5nZXRNaW51dGVzKCkgKyAxO1xyXG4gICAgICAgIHdoaWxlICghdGhpcy5vcHRpb25zLmlzTWludXRlU2VsZWN0YWJsZShyb3VuZGVkRGF0ZSkpIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChsb3dlciA8IDApIGxvd2VyID0gNTk7XHJcbiAgICAgICAgICAgIHJvdW5kZWREYXRlLnNldE1pbnV0ZXMobG93ZXItLSk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaXNNaW51dGVTZWxlY3RhYmxlKHJvdW5kZWREYXRlKSkgYnJlYWs7XHJcbiAgICAgICAgICAgIGlmIChsb3dlciA9PT0gdXBwZXIpIGJyZWFrO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKHVwcGVyID4gNTkpIHVwcGVyID0gMDtcclxuICAgICAgICAgICAgcm91bmRlZERhdGUuc2V0TWludXRlcyh1cHBlcisrKTtcclxuICAgICAgICAgICAgaWYgKGxvd2VyID09PSB1cHBlcikgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByb3VuZGVkRGF0ZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGdldEJ1YmJsZVRleHQobWludXRlcz86bnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKG1pbnV0ZXMgPT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICBtaW51dGVzID0gdGhpcy5yb3RhdGlvblRvVGltZSh0aGlzLnJvdGF0aW9uKTsgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBkID0gbmV3IERhdGUodGhpcy5zZWxlY3RlZERhdGUudmFsdWVPZigpKTtcclxuICAgICAgICBkLnNldE1pbnV0ZXMobWludXRlcyk7XHJcbiAgICAgICAgZCA9IHRoaXMucm91bmQoZCk7XHJcbiAgICAgICAgbWludXRlcyA9IGQuZ2V0TWludXRlcygpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiB0aGlzLnBhZChtaW51dGVzKSsnbSc7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBnZXRFbGVtZW50RGF0ZShlbDpFbGVtZW50KSB7XHJcbiAgICAgICAgbGV0IGQgPSBuZXcgRGF0ZShlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpO1xyXG4gICAgICAgIGxldCB5ZWFyID0gZC5nZXRGdWxsWWVhcigpO1xyXG4gICAgICAgIGxldCBtb250aCA9IGQuZ2V0TW9udGgoKTtcclxuICAgICAgICBsZXQgZGF0ZU9mTW9udGggPSBkLmdldERhdGUoKTtcclxuICAgICAgICBsZXQgaG91cnMgPSBkLmdldEhvdXJzKCk7XHJcbiAgICAgICAgbGV0IG1pbnV0ZXMgPSBkLmdldE1pbnV0ZXMoKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgbmV3RGF0ZSA9IG5ldyBEYXRlKHRoaXMuc2VsZWN0ZWREYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgbmV3RGF0ZS5zZXRGdWxsWWVhcih5ZWFyKTtcclxuICAgICAgICBuZXdEYXRlLnNldE1vbnRoKG1vbnRoKTtcclxuICAgICAgICBpZiAobmV3RGF0ZS5nZXRNb250aCgpICE9PSBtb250aCkge1xyXG4gICAgICAgICAgICBuZXdEYXRlLnNldERhdGUoMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG5ld0RhdGUuc2V0RGF0ZShkYXRlT2ZNb250aCk7XHJcbiAgICAgICAgbmV3RGF0ZS5zZXRIb3Vycyhob3Vycyk7XHJcbiAgICAgICAgbmV3RGF0ZS5zZXRNaW51dGVzKG1pbnV0ZXMpO1xyXG4gICAgICAgIHJldHVybiBuZXdEYXRlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgcm90YXRpb25Ub1RpbWUocjpudW1iZXIpIHtcclxuICAgICAgICB3aGlsZSAociA+IE1hdGguUEkpIHIgLT0gMipNYXRoLlBJO1xyXG4gICAgICAgIHdoaWxlIChyIDwgLU1hdGguUEkpIHIgKz0gMipNYXRoLlBJO1xyXG4gICAgICAgIGxldCB0ID0gKHIgLyBNYXRoLlBJICogMzApICsgMzA7XHJcbiAgICAgICAgcmV0dXJuIHQgPj0gNTkuNSA/IDAgOiBNYXRoLnJvdW5kKHQpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgdGltZVRvUm90YXRpb24odDpudW1iZXIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5ub3JtYWxpemVSb3RhdGlvbigodCArIDMwKSAvIDMwICogTWF0aC5QSSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBjcmVhdGUoZGF0ZTpEYXRlLCB0cmFuc2l0aW9uOlRyYW5zaXRpb24pIHtcclxuICAgICAgICB0aGlzLm1pbiA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCBkYXRlLmdldERhdGUoKSwgZGF0ZS5nZXRIb3VycygpKTtcclxuICAgICAgICB0aGlzLm1heCA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCBkYXRlLmdldERhdGUoKSwgZGF0ZS5nZXRIb3VycygpICsgMSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGl0ZXJhdG9yID0gbmV3IERhdGUodGhpcy5taW4udmFsdWVPZigpKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnBpY2tlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1waWNrZXInKTtcclxuICAgICAgICB0aGlzLnBpY2tlci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tbWludXRlLXBpY2tlcicpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbkluKHRyYW5zaXRpb24sIHRoaXMucGlja2VyKTtcclxuICAgICAgICBcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEyOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHRpY2sgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tdGljaycpO1xyXG4gICAgICAgICAgICBsZXQgdGlja0xhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpY2stbGFiZWwnKTtcclxuICAgICAgICAgICAgdGlja0xhYmVsLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1taW51dGUtZWxlbWVudCcpO1xyXG4gICAgICAgICAgICBsZXQgdGlja0xhYmVsQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpY2stbGFiZWwtY29udGFpbmVyJyk7XHJcbiAgICAgICAgICAgIGxldCByID0gaSAqIE1hdGguUEkvNiArIE1hdGguUEk7XHJcbiAgICAgICAgICAgIHRpY2tMYWJlbENvbnRhaW5lci5hcHBlbmRDaGlsZCh0aWNrTGFiZWwpO1xyXG4gICAgICAgICAgICB0aWNrLmFwcGVuZENoaWxkKHRpY2tMYWJlbENvbnRhaW5lcik7XHJcbiAgICAgICAgICAgIHRpY2suc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZSgke3J9cmFkKWA7XHJcbiAgICAgICAgICAgIHRpY2tMYWJlbENvbnRhaW5lci5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlKCR7MipNYXRoLlBJIC0gcn1yYWQpYDtcclxuICAgICAgICAgICAgdGlja0xhYmVsLnNldEF0dHJpYnV0ZSgnZGF0aXVtLWNsb2NrLXBvcycsIGkudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgZCA9IG5ldyBEYXRlKGRhdGUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBtaW51dGVzID0gdGhpcy5yb3RhdGlvblRvVGltZShyKTtcclxuICAgICAgICAgICAgZC5zZXRNaW51dGVzKG1pbnV0ZXMpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGlja0xhYmVsLnNldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnLCBkLnRvSVNPU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICB0aGlzLnBpY2tlci5hcHBlbmRDaGlsZCh0aWNrKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5taW51dGVIYW5kID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLW1pbnV0ZS1oYW5kJyk7XHJcbiAgICAgICAgdGhpcy5ob3VySGFuZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1ob3VyLWhhbmQnKTtcclxuICAgICAgICB0aGlzLnRpbWVEcmFnQXJtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpbWUtZHJhZy1hcm0nKTtcclxuICAgICAgICB0aGlzLnRpbWVEcmFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpbWUtZHJhZycpO1xyXG4gICAgICAgIHRoaXMudGltZURyYWcuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLW1pbnV0ZS1kcmFnJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy50aW1lRHJhZy5zZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJywgZGF0ZS50b0lTT1N0cmluZygpKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnRpbWVEcmFnQXJtLmFwcGVuZENoaWxkKHRoaXMudGltZURyYWcpO1xyXG4gICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKHRoaXMudGltZURyYWdBcm0pO1xyXG4gICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKHRoaXMuaG91ckhhbmQpO1xyXG4gICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKHRoaXMubWludXRlSGFuZCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5hdHRhY2goKTtcclxuICAgICAgICB0aGlzLnNldFNlbGVjdGVkRGF0ZSh0aGlzLnNlbGVjdGVkRGF0ZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCB1cGRhdGVMYWJlbHMoZGF0ZTpEYXRlLCBmb3JjZVVwZGF0ZTpib29sZWFuID0gZmFsc2UpIHtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgbGFiZWxzID0gdGhpcy5waWNrZXIucXVlcnlTZWxlY3RvckFsbCgnW2RhdGl1bS1jbG9jay1wb3NdJyk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsYWJlbHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGxhYmVsID0gbGFiZWxzLml0ZW0oaSk7XHJcbiAgICAgICAgICAgIGxldCByID0gTWF0aC5QSSpwYXJzZUludChsYWJlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1jbG9jay1wb3MnKSwgMTApLzYtMypNYXRoLlBJO1xyXG4gICAgICAgICAgICBsZXQgdGltZSA9IHRoaXMucm90YXRpb25Ub1RpbWUocik7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgZCA9IG5ldyBEYXRlKGxhYmVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsYWJlbC5zZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJywgZC50b0lTT1N0cmluZygpKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaXNNaW51dGVTZWxlY3RhYmxlKGQpKSB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbC5jbGFzc0xpc3QucmVtb3ZlKCdkYXRpdW0taW5hY3RpdmUnKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1pbmFjdGl2ZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsYWJlbC5pbm5lckhUTUwgPSB0aGlzLnBhZCh0aW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB1cGRhdGVPcHRpb25zKG9wdGlvbnM6SU9wdGlvbnMpIHtcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgcmV0dXJuIExldmVsLk1JTlVURTtcclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJQaWNrZXIudHNcIiAvPlxyXG5cclxuY2xhc3MgTW9udGhQaWNrZXIgZXh0ZW5kcyBQaWNrZXIgaW1wbGVtZW50cyBJUGlja2VyIHtcclxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6SFRNTEVsZW1lbnQsIGNvbnRhaW5lcjpIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIHN1cGVyKGVsZW1lbnQsIGNvbnRhaW5lcik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGlzdGVuLnRhcChjb250YWluZXIsICdkYXRpdW0tbW9udGgtZWxlbWVudFtkYXRpdW0tZGF0YV0nLCAoZSkgPT4ge1xyXG4gICAgICAgICAgIGxldCBlbDpFbGVtZW50ID0gPEVsZW1lbnQ+ZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xyXG4gICAgICAgICAgIGxldCB5ZWFyID0gbmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKS5nZXRGdWxsWWVhcigpO1xyXG4gICAgICAgICAgIGxldCBtb250aCA9IG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSkuZ2V0TW9udGgoKTtcclxuICAgICAgICAgICBcclxuICAgICAgICAgICBsZXQgZGF0ZSA9IG5ldyBEYXRlKHRoaXMuc2VsZWN0ZWREYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgICAgZGF0ZS5zZXRGdWxsWWVhcih5ZWFyKTtcclxuICAgICAgICAgICBkYXRlLnNldE1vbnRoKG1vbnRoKTtcclxuICAgICAgICAgICBpZiAoZGF0ZS5nZXRNb250aCgpICE9PSBtb250aCkge1xyXG4gICAgICAgICAgICAgICBkYXRlLnNldERhdGUoMCk7XHJcbiAgICAgICAgICAgfVxyXG4gICAgICAgICAgIFxyXG4gICAgICAgICAgIHRyaWdnZXIuem9vbUluKGVsZW1lbnQsIHtcclxuICAgICAgICAgICAgICAgZGF0ZTogZGF0ZSxcclxuICAgICAgICAgICAgICAgY3VycmVudExldmVsOiBMZXZlbC5NT05USFxyXG4gICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi5kb3duKGNvbnRhaW5lciwgJ2RhdGl1bS1tb250aC1lbGVtZW50JywgKGUpID0+IHtcclxuICAgICAgICAgICAgbGV0IGVsOkhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PihlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQpO1xyXG4gICAgICAgICAgICBsZXQgdGV4dCA9IHRoaXMuZ2V0U2hvcnRNb250aHMoKVtuZXcgRGF0ZShlbC5nZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJykpLmdldE1vbnRoKCldO1xyXG4gICAgICAgICAgICBsZXQgb2Zmc2V0ID0gdGhpcy5nZXRPZmZzZXQoZWwpO1xyXG4gICAgICAgICAgICB0cmlnZ2VyLm9wZW5CdWJibGUoZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgeDogb2Zmc2V0LnggKyAzNSxcclxuICAgICAgICAgICAgICAgIHk6IG9mZnNldC55ICsgMTUsXHJcbiAgICAgICAgICAgICAgICB0ZXh0OiB0ZXh0XHJcbiAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBjcmVhdGUoZGF0ZTpEYXRlLCB0cmFuc2l0aW9uOlRyYW5zaXRpb24pIHtcclxuICAgICAgICB0aGlzLm1pbiA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgMCk7XHJcbiAgICAgICAgdGhpcy5tYXggPSBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCkgKyAxLCAwKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgaXRlcmF0b3IgPSBuZXcgRGF0ZSh0aGlzLm1pbi52YWx1ZU9mKCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMucGlja2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXBpY2tlcicpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbkluKHRyYW5zaXRpb24sIHRoaXMucGlja2VyKTtcclxuICAgICAgICBcclxuICAgICAgICBkbyB7ICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBtb250aEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tbW9udGgtZWxlbWVudCcpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbW9udGhFbGVtZW50LmlubmVySFRNTCA9IHRoaXMuZ2V0U2hvcnRNb250aHMoKVtpdGVyYXRvci5nZXRNb250aCgpXTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaXNNb250aFNlbGVjdGFibGUoaXRlcmF0b3IpKSB7XHJcbiAgICAgICAgICAgICAgICBtb250aEVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScsIGl0ZXJhdG9yLnRvSVNPU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLnBpY2tlci5hcHBlbmRDaGlsZChtb250aEVsZW1lbnQpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaXRlcmF0b3Iuc2V0TW9udGgoaXRlcmF0b3IuZ2V0TW9udGgoKSArIDEpO1xyXG4gICAgICAgIH0gd2hpbGUgKGl0ZXJhdG9yLnZhbHVlT2YoKSA8IHRoaXMubWF4LnZhbHVlT2YoKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5hdHRhY2goKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnNldFNlbGVjdGVkRGF0ZSh0aGlzLnNlbGVjdGVkRGF0ZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBzZXRTZWxlY3RlZERhdGUoc2VsZWN0ZWREYXRlOkRhdGUpIHtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkRGF0ZSA9IG5ldyBEYXRlKHNlbGVjdGVkRGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBtb250aEVsZW1lbnRzID0gdGhpcy5waWNrZXJDb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnZGF0aXVtLW1vbnRoLWVsZW1lbnQnKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1vbnRoRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGVsID0gbW9udGhFbGVtZW50cy5pdGVtKGkpO1xyXG4gICAgICAgICAgICBsZXQgZGF0ZSA9IG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSk7XHJcbiAgICAgICAgICAgIGlmIChkYXRlLmdldEZ1bGxZZWFyKCkgPT09IHNlbGVjdGVkRGF0ZS5nZXRGdWxsWWVhcigpICYmXHJcbiAgICAgICAgICAgICAgICBkYXRlLmdldE1vbnRoKCkgPT09IHNlbGVjdGVkRGF0ZS5nZXRNb250aCgpKSB7XHJcbiAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1zZWxlY3RlZCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0SGVpZ2h0KCkge1xyXG4gICAgICAgIHJldHVybiAxODA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICByZXR1cm4gTGV2ZWwuTU9OVEg7XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiVGltZVBpY2tlci50c1wiIC8+XHJcblxyXG5jbGFzcyBTZWNvbmRQaWNrZXIgZXh0ZW5kcyBUaW1lUGlja2VyIGltcGxlbWVudHMgSVRpbWVQaWNrZXIge1xyXG4gICAgY29uc3RydWN0b3IoZWxlbWVudDpIVE1MRWxlbWVudCwgY29udGFpbmVyOkhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgc3VwZXIoZWxlbWVudCwgY29udGFpbmVyKTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4uZHJhZyhjb250YWluZXIsICcuZGF0aXVtLXNlY29uZC1kcmFnJywge1xyXG4gICAgICAgICAgICBkcmFnU3RhcnQ6IChlKSA9PiB0aGlzLmRyYWdTdGFydChlKSxcclxuICAgICAgICAgICAgZHJhZ01vdmU6IChlKSA9PiB0aGlzLmRyYWdNb3ZlKGUpLFxyXG4gICAgICAgICAgICBkcmFnRW5kOiAoZSkgPT4gdGhpcy5kcmFnRW5kKGUpLCBcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4udGFwKGNvbnRhaW5lciwgJy5kYXRpdW0tc2Vjb25kLWVsZW1lbnQnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZWw6RWxlbWVudCA9IDxFbGVtZW50PmUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRyaWdnZXIuem9vbUluKHRoaXMuZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgZGF0ZTogdGhpcy5nZXRFbGVtZW50RGF0ZShlbCksXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50TGV2ZWw6IExldmVsLlNFQ09ORFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4uZG93bihjb250YWluZXIsICcuZGF0aXVtLXNlY29uZC1lbGVtZW50JywgKGUpID0+IHtcclxuICAgICAgICAgICAgbGV0IGVsOkhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PihlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQpO1xyXG4gICAgICAgICAgICBsZXQgc2Vjb25kcyA9IG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSkuZ2V0U2Vjb25kcygpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IG9mZnNldCA9IHRoaXMuZ2V0T2Zmc2V0KGVsKTtcclxuICAgICAgICAgICAgdHJpZ2dlci5vcGVuQnViYmxlKGVsZW1lbnQsIHtcclxuICAgICAgICAgICAgICAgIHg6IG9mZnNldC54ICsgMjUsXHJcbiAgICAgICAgICAgICAgICB5OiBvZmZzZXQueSArIDMsXHJcbiAgICAgICAgICAgICAgICB0ZXh0OiB0aGlzLmdldEJ1YmJsZVRleHQoc2Vjb25kcylcclxuICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGNlaWwoZGF0ZTpEYXRlKTpEYXRlIHtcclxuICAgICAgICBsZXQgY2VpbGVkRGF0ZSA9IG5ldyBEYXRlKGRhdGUudmFsdWVPZigpKTtcclxuICAgICAgICBsZXQgdXBwZXIgPSBjZWlsZWREYXRlLmdldFNlY29uZHMoKSArIDE7XHJcbiAgICAgICAgbGV0IG9yaWcgPSBjZWlsZWREYXRlLmdldFNlY29uZHMoKTtcclxuICAgICAgICB3aGlsZSAoIXRoaXMub3B0aW9ucy5pc1NlY29uZFNlbGVjdGFibGUoY2VpbGVkRGF0ZSkpIHtcclxuICAgICAgICAgICAgaWYgKHVwcGVyID4gNTkpIHVwcGVyID0gMDtcclxuICAgICAgICAgICAgY2VpbGVkRGF0ZS5zZXRTZWNvbmRzKHVwcGVyKyspO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmlzU2Vjb25kU2VsZWN0YWJsZShjZWlsZWREYXRlKSkgYnJlYWs7XHJcbiAgICAgICAgICAgIGlmICh1cHBlciA9PT0gb3JpZykgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjZWlsZWREYXRlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgZmxvb3IoZGF0ZTpEYXRlKTpEYXRlIHtcclxuICAgICAgICBsZXQgZmxvb3JlZERhdGUgPSBuZXcgRGF0ZShkYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgbGV0IGxvd2VyID0gZmxvb3JlZERhdGUuZ2V0U2Vjb25kcygpIC0gMTtcclxuICAgICAgICBsZXQgb3JpZyA9IGZsb29yZWREYXRlLmdldFNlY29uZHMoKTtcclxuICAgICAgICB3aGlsZSAoIXRoaXMub3B0aW9ucy5pc1NlY29uZFNlbGVjdGFibGUoZmxvb3JlZERhdGUpKSB7XHJcbiAgICAgICAgICAgIGlmIChsb3dlciA8IDApIGxvd2VyID0gNTk7XHJcbiAgICAgICAgICAgIGZsb29yZWREYXRlLnNldFNlY29uZHMobG93ZXItLSk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaXNTZWNvbmRTZWxlY3RhYmxlKGZsb29yZWREYXRlKSkgYnJlYWs7XHJcbiAgICAgICAgICAgIGlmIChsb3dlciA9PT0gb3JpZykgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmbG9vcmVkRGF0ZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIHJvdW5kKGRhdGU6RGF0ZSk6RGF0ZSB7XHJcbiAgICAgICAgbGV0IHJvdW5kZWREYXRlID0gbmV3IERhdGUoZGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgIGxldCBsb3dlciA9IHJvdW5kZWREYXRlLmdldFNlY29uZHMoKSAtIDE7XHJcbiAgICAgICAgbGV0IHVwcGVyID0gcm91bmRlZERhdGUuZ2V0U2Vjb25kcygpICsgMTtcclxuICAgICAgICB3aGlsZSAoIXRoaXMub3B0aW9ucy5pc1NlY29uZFNlbGVjdGFibGUocm91bmRlZERhdGUpKSB7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAobG93ZXIgPCAwKSBsb3dlciA9IDU5O1xyXG4gICAgICAgICAgICByb3VuZGVkRGF0ZS5zZXRTZWNvbmRzKGxvd2VyLS0pO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmlzU2Vjb25kU2VsZWN0YWJsZShyb3VuZGVkRGF0ZSkpIGJyZWFrO1xyXG4gICAgICAgICAgICBpZiAobG93ZXIgPT09IHVwcGVyKSBicmVhaztcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICh1cHBlciA+IDU5KSB1cHBlciA9IDA7XHJcbiAgICAgICAgICAgIHJvdW5kZWREYXRlLnNldFNlY29uZHModXBwZXIrKyk7XHJcbiAgICAgICAgICAgIGlmIChsb3dlciA9PT0gdXBwZXIpIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcm91bmRlZERhdGU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBnZXRCdWJibGVUZXh0KHNlY29uZHM/Om51bWJlcikge1xyXG4gICAgICAgIGlmIChzZWNvbmRzID09PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgc2Vjb25kcyA9IHRoaXMucm90YXRpb25Ub1RpbWUodGhpcy5yb3RhdGlvbik7IFxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBsZXQgZCA9IG5ldyBEYXRlKHRoaXMuc2VsZWN0ZWREYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgZC5zZXRTZWNvbmRzKHNlY29uZHMpO1xyXG4gICAgICAgIGQgPSB0aGlzLnJvdW5kKGQpO1xyXG4gICAgICAgIHNlY29uZHMgPSBkLmdldFNlY29uZHMoKTtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gdGhpcy5wYWQoc2Vjb25kcykrJ3MnO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgZ2V0RWxlbWVudERhdGUoZWw6RWxlbWVudCkge1xyXG4gICAgICAgIGxldCBkID0gbmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKTtcclxuICAgICAgICBsZXQgeWVhciA9IGQuZ2V0RnVsbFllYXIoKTtcclxuICAgICAgICBsZXQgbW9udGggPSBkLmdldE1vbnRoKCk7XHJcbiAgICAgICAgbGV0IGRhdGVPZk1vbnRoID0gZC5nZXREYXRlKCk7XHJcbiAgICAgICAgbGV0IGhvdXJzID0gZC5nZXRIb3VycygpO1xyXG4gICAgICAgIGxldCBtaW51dGVzID0gZC5nZXRNaW51dGVzKCk7XHJcbiAgICAgICAgbGV0IHNlY29uZHMgPSBkLmdldFNlY29uZHMoKTtcclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICBsZXQgbmV3RGF0ZSA9IG5ldyBEYXRlKHRoaXMuc2VsZWN0ZWREYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgbmV3RGF0ZS5zZXRGdWxsWWVhcih5ZWFyKTtcclxuICAgICAgICBuZXdEYXRlLnNldE1vbnRoKG1vbnRoKTtcclxuICAgICAgICBpZiAobmV3RGF0ZS5nZXRNb250aCgpICE9PSBtb250aCkge1xyXG4gICAgICAgICAgICBuZXdEYXRlLnNldERhdGUoMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG5ld0RhdGUuc2V0RGF0ZShkYXRlT2ZNb250aCk7XHJcbiAgICAgICAgbmV3RGF0ZS5zZXRIb3Vycyhob3Vycyk7XHJcbiAgICAgICAgbmV3RGF0ZS5zZXRNaW51dGVzKG1pbnV0ZXMpO1xyXG4gICAgICAgIG5ld0RhdGUuc2V0U2Vjb25kcyhzZWNvbmRzKTtcclxuICAgICAgICByZXR1cm4gbmV3RGF0ZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIHJvdGF0aW9uVG9UaW1lKHI6bnVtYmVyKSB7XHJcbiAgICAgICAgd2hpbGUgKHIgPiBNYXRoLlBJKSByIC09IDIqTWF0aC5QSTtcclxuICAgICAgICB3aGlsZSAociA8IC1NYXRoLlBJKSByICs9IDIqTWF0aC5QSTtcclxuICAgICAgICBsZXQgdCA9IChyIC8gTWF0aC5QSSAqIDMwKSArIDMwO1xyXG4gICAgICAgIHJldHVybiB0ID49IDU5LjUgPyAwIDogTWF0aC5yb3VuZCh0KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIHRpbWVUb1JvdGF0aW9uKHQ6bnVtYmVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubm9ybWFsaXplUm90YXRpb24oKHQgKyAzMCkgLyAzMCAqIE1hdGguUEkpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgY3JlYXRlKGRhdGU6RGF0ZSwgdHJhbnNpdGlvbjpUcmFuc2l0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5taW4gPSBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSwgZGF0ZS5nZXREYXRlKCksIGRhdGUuZ2V0SG91cnMoKSwgZGF0ZS5nZXRNaW51dGVzKCkpO1xyXG4gICAgICAgIHRoaXMubWF4ID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIGRhdGUuZ2V0RGF0ZSgpLCBkYXRlLmdldEhvdXJzKCksIGRhdGUuZ2V0TWludXRlcygpICsgMSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGl0ZXJhdG9yID0gbmV3IERhdGUodGhpcy5taW4udmFsdWVPZigpKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnBpY2tlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1waWNrZXInKTtcclxuICAgICAgICB0aGlzLnBpY2tlci5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tc2Vjb25kLXBpY2tlcicpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbkluKHRyYW5zaXRpb24sIHRoaXMucGlja2VyKTtcclxuICAgICAgICBcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEyOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHRpY2sgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tdGljaycpO1xyXG4gICAgICAgICAgICBsZXQgdGlja0xhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpY2stbGFiZWwnKTtcclxuICAgICAgICAgICAgdGlja0xhYmVsLmNsYXNzTGlzdC5hZGQoJ2RhdGl1bS1zZWNvbmQtZWxlbWVudCcpO1xyXG4gICAgICAgICAgICBsZXQgdGlja0xhYmVsQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpY2stbGFiZWwtY29udGFpbmVyJyk7XHJcbiAgICAgICAgICAgIGxldCByID0gaSAqIE1hdGguUEkvNiArIE1hdGguUEk7XHJcbiAgICAgICAgICAgIHRpY2tMYWJlbENvbnRhaW5lci5hcHBlbmRDaGlsZCh0aWNrTGFiZWwpO1xyXG4gICAgICAgICAgICB0aWNrLmFwcGVuZENoaWxkKHRpY2tMYWJlbENvbnRhaW5lcik7XHJcbiAgICAgICAgICAgIHRpY2suc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZSgke3J9cmFkKWA7XHJcbiAgICAgICAgICAgIHRpY2tMYWJlbENvbnRhaW5lci5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlKCR7MipNYXRoLlBJIC0gcn1yYWQpYDtcclxuICAgICAgICAgICAgdGlja0xhYmVsLnNldEF0dHJpYnV0ZSgnZGF0aXVtLWNsb2NrLXBvcycsIGkudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgZCA9IG5ldyBEYXRlKGRhdGUudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBzZWNvbmRzID0gdGhpcy5yb3RhdGlvblRvVGltZShyKTtcclxuICAgICAgICAgICAgZC5zZXRTZWNvbmRzKHNlY29uZHMpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGlja0xhYmVsLnNldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnLCBkLnRvSVNPU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICB0aGlzLnBpY2tlci5hcHBlbmRDaGlsZCh0aWNrKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5zZWNvbmRIYW5kID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXNlY29uZC1oYW5kJyk7XHJcbiAgICAgICAgdGhpcy5taW51dGVIYW5kID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLW1pbnV0ZS1oYW5kJyk7XHJcbiAgICAgICAgdGhpcy5ob3VySGFuZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS1ob3VyLWhhbmQnKTtcclxuICAgICAgICB0aGlzLnRpbWVEcmFnQXJtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpbWUtZHJhZy1hcm0nKTtcclxuICAgICAgICB0aGlzLnRpbWVEcmFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0aXVtLXRpbWUtZHJhZycpO1xyXG4gICAgICAgIHRoaXMudGltZURyYWcuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLXNlY29uZC1kcmFnJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy50aW1lRHJhZy5zZXRBdHRyaWJ1dGUoJ2RhdGl1bS1kYXRhJywgZGF0ZS50b0lTT1N0cmluZygpKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnRpbWVEcmFnQXJtLmFwcGVuZENoaWxkKHRoaXMudGltZURyYWcpO1xyXG4gICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKHRoaXMudGltZURyYWdBcm0pO1xyXG4gICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKHRoaXMuaG91ckhhbmQpO1xyXG4gICAgICAgIHRoaXMucGlja2VyLmFwcGVuZENoaWxkKHRoaXMubWludXRlSGFuZCk7XHJcbiAgICAgICAgdGhpcy5waWNrZXIuYXBwZW5kQ2hpbGQodGhpcy5zZWNvbmRIYW5kKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmF0dGFjaCgpO1xyXG4gICAgICAgIHRoaXMuc2V0U2VsZWN0ZWREYXRlKHRoaXMuc2VsZWN0ZWREYXRlKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIHVwZGF0ZUxhYmVscyhkYXRlOkRhdGUsIGZvcmNlVXBkYXRlOmJvb2xlYW4gPSBmYWxzZSkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBsYWJlbHMgPSB0aGlzLnBpY2tlci5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0aXVtLWNsb2NrLXBvc10nKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxhYmVscy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgbGFiZWwgPSBsYWJlbHMuaXRlbShpKTtcclxuICAgICAgICAgICAgbGV0IHIgPSBNYXRoLlBJKnBhcnNlSW50KGxhYmVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWNsb2NrLXBvcycpLCAxMCkvNi0zKk1hdGguUEk7XHJcbiAgICAgICAgICAgIGxldCB0aW1lID0gdGhpcy5yb3RhdGlvblRvVGltZShyKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBkID0gbmV3IERhdGUobGFiZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxhYmVsLnNldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnLCBkLnRvSVNPU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IHN0YXJ0ID0gbmV3IERhdGUoZC5nZXRGdWxsWWVhcigpLCBkLmdldE1vbnRoKCksIGQuZ2V0RGF0ZSgpLCBkLmdldEhvdXJzKCksIGQuZ2V0TWludXRlcygpLCBkLmdldFNlY29uZHMoKSk7XHJcbiAgICAgICAgICAgIGxldCBlbmQgPSBuZXcgRGF0ZShkLmdldEZ1bGxZZWFyKCksIGQuZ2V0TW9udGgoKSwgZC5nZXREYXRlKCksIGQuZ2V0SG91cnMoKSwgZC5nZXRNaW51dGVzKCksIGQuZ2V0U2Vjb25kcygpICsgMSk7XHJcbiAgICAgICAgICAgIGlmIChlbmQudmFsdWVPZigpID4gdGhpcy5vcHRpb25zLm1pbkRhdGUudmFsdWVPZigpICYmXHJcbiAgICAgICAgICAgICAgICBzdGFydC52YWx1ZU9mKCkgPCB0aGlzLm9wdGlvbnMubWF4RGF0ZS52YWx1ZU9mKCkgJiZcclxuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5pc1NlY29uZFNlbGVjdGFibGUoZCkpIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1pbmFjdGl2ZScpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGFiZWwuY2xhc3NMaXN0LmFkZCgnZGF0aXVtLWluYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxhYmVsLmlubmVySFRNTCA9IHRoaXMucGFkKHRpbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHVwZGF0ZU9wdGlvbnMob3B0aW9uczpJT3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICByZXR1cm4gTGV2ZWwuU0VDT05EO1xyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIlBpY2tlci50c1wiIC8+XHJcblxyXG5jbGFzcyBZZWFyUGlja2VyIGV4dGVuZHMgUGlja2VyIGltcGxlbWVudHMgSVBpY2tlciB7XHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OkhUTUxFbGVtZW50LCBjb250YWluZXI6SFRNTEVsZW1lbnQpIHtcclxuICAgICAgICBzdXBlcihlbGVtZW50LCBjb250YWluZXIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3Rlbi50YXAoY29udGFpbmVyLCAnZGF0aXVtLXllYXItZWxlbWVudFtkYXRpdW0tZGF0YV0nLCAoZSkgPT4ge1xyXG4gICAgICAgICAgIGxldCBlbDpFbGVtZW50ID0gPEVsZW1lbnQ+ZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xyXG4gICAgICAgICAgIGxldCB5ZWFyID0gbmV3IERhdGUoZWwuZ2V0QXR0cmlidXRlKCdkYXRpdW0tZGF0YScpKS5nZXRGdWxsWWVhcigpO1xyXG4gICAgICAgICAgIFxyXG4gICAgICAgICAgIGxldCBkYXRlID0gbmV3IERhdGUodGhpcy5zZWxlY3RlZERhdGUudmFsdWVPZigpKTtcclxuICAgICAgICAgICBkYXRlLnNldEZ1bGxZZWFyKHllYXIpO1xyXG4gICAgICAgICAgIFxyXG4gICAgICAgICAgIHRyaWdnZXIuem9vbUluKGVsZW1lbnQsIHtcclxuICAgICAgICAgICAgICAgZGF0ZTogZGF0ZSxcclxuICAgICAgICAgICAgICAgY3VycmVudExldmVsOiBMZXZlbC5ZRUFSXHJcbiAgICAgICAgICAgfSlcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICBsaXN0ZW4uZG93bihjb250YWluZXIsICdkYXRpdW0teWVhci1lbGVtZW50JywgKGUpID0+IHtcclxuICAgICAgICAgICAgbGV0IGVsOkhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PihlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQpO1xyXG4gICAgICAgICAgICBsZXQgdGV4dCA9IG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSkuZ2V0RnVsbFllYXIoKS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICBsZXQgb2Zmc2V0ID0gdGhpcy5nZXRPZmZzZXQoZWwpO1xyXG4gICAgICAgICAgICB0cmlnZ2VyLm9wZW5CdWJibGUoZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgeDogb2Zmc2V0LnggKyAzNSxcclxuICAgICAgICAgICAgICAgIHk6IG9mZnNldC55ICsgMTUsXHJcbiAgICAgICAgICAgICAgICB0ZXh0OiB0ZXh0XHJcbiAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBjcmVhdGUoZGF0ZTpEYXRlLCB0cmFuc2l0aW9uOlRyYW5zaXRpb24pIHtcclxuICAgICAgICB0aGlzLm1pbiA9IG5ldyBEYXRlKE1hdGguZmxvb3IoZGF0ZS5nZXRGdWxsWWVhcigpLzEwKSoxMCwgMCk7XHJcbiAgICAgICAgdGhpcy5tYXggPSBuZXcgRGF0ZShNYXRoLmNlaWwoZGF0ZS5nZXRGdWxsWWVhcigpLzEwKSoxMCwgMCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMubWluLnZhbHVlT2YoKSA9PT0gdGhpcy5tYXgudmFsdWVPZigpKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWF4LnNldEZ1bGxZZWFyKHRoaXMubWF4LmdldEZ1bGxZZWFyKCkgKyAxMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBpdGVyYXRvciA9IG5ldyBEYXRlKHRoaXMubWluLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5waWNrZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRpdW0tcGlja2VyJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uSW4odHJhbnNpdGlvbiwgdGhpcy5waWNrZXIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCB5ZWFyRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGl1bS15ZWFyLWVsZW1lbnQnKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHllYXJFbGVtZW50LmlubmVySFRNTCA9IGl0ZXJhdG9yLmdldEZ1bGxZZWFyKCkudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaXNZZWFyU2VsZWN0YWJsZShpdGVyYXRvcikpIHtcclxuICAgICAgICAgICAgICAgIHllYXJFbGVtZW50LnNldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnLCBpdGVyYXRvci50b0lTT1N0cmluZygpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5waWNrZXIuYXBwZW5kQ2hpbGQoeWVhckVsZW1lbnQpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaXRlcmF0b3Iuc2V0RnVsbFllYXIoaXRlcmF0b3IuZ2V0RnVsbFllYXIoKSArIDEpO1xyXG4gICAgICAgIH0gd2hpbGUgKGl0ZXJhdG9yLnZhbHVlT2YoKSA8PSB0aGlzLm1heC52YWx1ZU9mKCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuYXR0YWNoKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5zZXRTZWxlY3RlZERhdGUodGhpcy5zZWxlY3RlZERhdGUpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgc2V0U2VsZWN0ZWREYXRlKHNlbGVjdGVkRGF0ZTpEYXRlKSB7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZERhdGUgPSBuZXcgRGF0ZShzZWxlY3RlZERhdGUudmFsdWVPZigpKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgeWVhckVsZW1lbnRzID0gdGhpcy5waWNrZXJDb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnZGF0aXVtLXllYXItZWxlbWVudCcpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgeWVhckVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBlbCA9IHllYXJFbGVtZW50cy5pdGVtKGkpO1xyXG4gICAgICAgICAgICBsZXQgZGF0ZSA9IG5ldyBEYXRlKGVsLmdldEF0dHJpYnV0ZSgnZGF0aXVtLWRhdGEnKSk7XHJcbiAgICAgICAgICAgIGlmIChkYXRlLmdldEZ1bGxZZWFyKCkgPT09IHNlbGVjdGVkRGF0ZS5nZXRGdWxsWWVhcigpKSB7XHJcbiAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdkYXRpdW0tc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2RhdGl1bS1zZWxlY3RlZCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0SGVpZ2h0KCkge1xyXG4gICAgICAgIHJldHVybiAxODA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRMZXZlbCgpIHtcclxuICAgICAgICByZXR1cm4gTGV2ZWwuWUVBUjtcclxuICAgIH1cclxufSIsInZhciBjc3M9XCJkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0taGVhZGVyLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXItY29udGFpbmVye3dpZHRoOmNhbGMoMTAwJSAtIDE0cHgpO2JveC1zaGFkb3c6MCAzcHggNnB4IHJnYmEoMCwwLDAsLjE2KSwwIDNweCA2cHggcmdiYSgwLDAsMCwuMjMpO292ZXJmbG93OmhpZGRlbn1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tYnViYmxlLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1oZWFkZXIsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci1jb250YWluZXJ7Ym94LXNoYWRvdzowIDNweCA2cHggcmdiYSgwLDAsMCwuMTYpLDAgM3B4IDZweCByZ2JhKDAsMCwwLC4yMyl9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWhlYWRlci13cmFwcGVye292ZXJmbG93OmhpZGRlbjtwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0Oi03cHg7cmlnaHQ6LTdweDt0b3A6LTdweDtoZWlnaHQ6ODdweDtkaXNwbGF5OmJsb2NrO3BvaW50ZXItZXZlbnRzOm5vbmV9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWhlYWRlcntwb3NpdGlvbjpyZWxhdGl2ZTtkaXNwbGF5OmJsb2NrO2hlaWdodDoxMDBweDtiYWNrZ3JvdW5kLWNvbG9yOl9wcmltYXJ5O2JvcmRlci10b3AtbGVmdC1yYWRpdXM6M3B4O2JvcmRlci10b3AtcmlnaHQtcmFkaXVzOjNweDt6LWluZGV4OjE7bWFyZ2luOjdweDtwb2ludGVyLWV2ZW50czphdXRvfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1zcGFuLWxhYmVsLWNvbnRhaW5lcntwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjQwcHg7cmlnaHQ6NDBweDt0b3A6MDtib3R0b206MDtkaXNwbGF5OmJsb2NrO292ZXJmbG93OmhpZGRlbjt0cmFuc2l0aW9uOi4ycyBlYXNlIGFsbDt0cmFuc2Zvcm0tb3JpZ2luOjQwcHggNDBweH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc3Bhbi1sYWJlbHtwb3NpdGlvbjphYnNvbHV0ZTtmb250LXNpemU6MThwdDtjb2xvcjpfcHJpbWFyeV90ZXh0O2ZvbnQtd2VpZ2h0OjcwMDt0cmFuc2Zvcm0tb3JpZ2luOjAgMDt3aGl0ZS1zcGFjZTpub3dyYXA7dHJhbnNpdGlvbjphbGwgLjJzIGVhc2U7dGV4dC10cmFuc2Zvcm06dXBwZXJjYXNlfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS10b3B7dHJhbnNmb3JtOnRyYW5zbGF0ZVkoMTdweCkgc2NhbGUoLjY2KTt3aWR0aDoxNTElO29wYWNpdHk6LjZ9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXNwYW4tbGFiZWwuZGF0aXVtLWJvdHRvbXt0cmFuc2Zvcm06dHJhbnNsYXRlWSgzNnB4KSBzY2FsZSgxKTt3aWR0aDoxMDAlO29wYWNpdHk6MX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc3Bhbi1sYWJlbC5kYXRpdW0tdG9wLmRhdGl1bS1oaWRkZW57dHJhbnNmb3JtOnRyYW5zbGF0ZVkoNXB4KSBzY2FsZSguNCk7b3BhY2l0eTowfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1zcGFuLWxhYmVsLmRhdGl1bS1ib3R0b20uZGF0aXVtLWhpZGRlbnt0cmFuc2Zvcm06dHJhbnNsYXRlWSg3OHB4KSBzY2FsZSgxLjIpO29wYWNpdHk6MX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc3Bhbi1sYWJlbDphZnRlcntjb250ZW50OicnO2Rpc3BsYXk6aW5saW5lLWJsb2NrO3Bvc2l0aW9uOmFic29sdXRlO21hcmdpbi1sZWZ0OjEwcHg7bWFyZ2luLXRvcDo2cHg7aGVpZ2h0OjE3cHg7d2lkdGg6MTdweDtvcGFjaXR5OjA7dHJhbnNpdGlvbjphbGwgLjJzIGVhc2U7YmFja2dyb3VuZDp1cmwoZGF0YTppbWFnZS9zdmcreG1sO3V0ZjgsJTNDc3ZnJTIweG1sbnMlM0QlMjJodHRwJTNBJTJGJTJGd3d3LnczLm9yZyUyRjIwMDAlMkZzdmclMjIlM0UlM0NnJTIwZmlsbCUzRCUyMl9wcmltYXJ5X3RleHQlMjIlM0UlM0NwYXRoJTIwZCUzRCUyMk0xNyUyMDE1bC0yJTIwMi01LTUlMjAyLTJ6JTIyJTIwZmlsbC1ydWxlJTNEJTIyZXZlbm9kZCUyMiUyRiUzRSUzQ3BhdGglMjBkJTNEJTIyTTclMjAwYTclMjA3JTIwMCUyMDAlMjAwLTclMjA3JTIwNyUyMDclMjAwJTIwMCUyMDAlMjA3JTIwNyUyMDclMjA3JTIwMCUyMDAlMjAwJTIwNy03JTIwNyUyMDclMjAwJTIwMCUyMDAtNy03em0wJTIwMmE1JTIwNSUyMDAlMjAwJTIwMSUyMDUlMjA1JTIwNSUyMDUlMjAwJTIwMCUyMDEtNSUyMDUlMjA1JTIwNSUyMDAlMjAwJTIwMS01LTUlMjA1JTIwNSUyMDAlMjAwJTIwMSUyMDUtNXolMjIlMkYlM0UlM0NwYXRoJTIwZCUzRCUyMk00JTIwNmg2djJINHolMjIlMkYlM0UlM0MlMkZnJTNFJTNDJTJGc3ZnJTNFKX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tYnViYmxlLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1idWJibGUuZGF0aXVtLWJ1YmJsZS12aXNpYmxle3RyYW5zaXRpb24tcHJvcGVydHk6dHJhbnNmb3JtLG9wYWNpdHk7dHJhbnNpdGlvbi10aW1pbmctZnVuY3Rpb246ZWFzZTt0cmFuc2l0aW9uLWR1cmF0aW9uOi4yc31kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc3Bhbi1sYWJlbC5kYXRpdW0tdG9wOmFmdGVye29wYWNpdHk6MX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tc3Bhbi1sYWJlbCBkYXRpdW0tdmFyaWFibGV7Y29sb3I6X3ByaW1hcnk7Zm9udC1zaXplOjE0cHQ7cGFkZGluZzowIDRweDttYXJnaW46MCAycHg7dG9wOi0ycHg7cG9zaXRpb246cmVsYXRpdmV9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXNwYW4tbGFiZWwgZGF0aXVtLXZhcmlhYmxlOmJlZm9yZXtjb250ZW50OicnO3Bvc2l0aW9uOmFic29sdXRlO2xlZnQ6MDt0b3A6MDtyaWdodDowO2JvdHRvbTowO2JvcmRlci1yYWRpdXM6NXB4O2JhY2tncm91bmQtY29sb3I6X3ByaW1hcnlfdGV4dDt6LWluZGV4Oi0xO29wYWNpdHk6Ljd9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXNwYW4tbGFiZWwgZGF0aXVtLWxvd2Vye3RleHQtdHJhbnNmb3JtOmxvd2VyY2FzZX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbmV4dCxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcHJldntwb3NpdGlvbjphYnNvbHV0ZTt3aWR0aDo0MHB4O3RvcDowO2JvdHRvbTowO3RyYW5zZm9ybS1vcmlnaW46MjBweCA1MnB4fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1uZXh0OmFmdGVyLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1uZXh0OmJlZm9yZSxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcHJldjphZnRlcixkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcHJldjpiZWZvcmV7Y29udGVudDonJztwb3NpdGlvbjphYnNvbHV0ZTtkaXNwbGF5OmJsb2NrO3dpZHRoOjNweDtoZWlnaHQ6OHB4O2xlZnQ6NTAlO2JhY2tncm91bmQtY29sb3I6X3ByaW1hcnlfdGV4dDt0b3A6NDhweH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbmV4dC5kYXRpdW0tYWN0aXZlLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1wcmV2LmRhdGl1bS1hY3RpdmV7dHJhbnNmb3JtOnNjYWxlKC45KTtvcGFjaXR5Oi45fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1wcmV2e2xlZnQ6MH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcHJldjphZnRlcixkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcHJldjpiZWZvcmV7bWFyZ2luLWxlZnQ6LTNweH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbmV4dHtyaWdodDowfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1wcmV2OmJlZm9yZXt0cmFuc2Zvcm06cm90YXRlKDQ1ZGVnKSB0cmFuc2xhdGVZKC0yLjZweCl9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXByZXY6YWZ0ZXJ7dHJhbnNmb3JtOnJvdGF0ZSgtNDVkZWcpIHRyYW5zbGF0ZVkoMi42cHgpfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1uZXh0OmJlZm9yZXt0cmFuc2Zvcm06cm90YXRlKDQ1ZGVnKSB0cmFuc2xhdGVZKDIuNnB4KX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbmV4dDphZnRlcnt0cmFuc2Zvcm06cm90YXRlKC00NWRlZykgdHJhbnNsYXRlWSgtMi42cHgpfWRhdGl1bS1jb250YWluZXIuX2lke2Rpc3BsYXk6YmxvY2s7cG9zaXRpb246YWJzb2x1dGU7d2lkdGg6MjgwcHg7Zm9udC1mYW1pbHk6Um9ib3RvLEFyaWFsO21hcmdpbi10b3A6MnB4O2ZvbnQtc2l6ZToxNnB4fWRhdGl1bS1jb250YWluZXIuX2lkLGRhdGl1bS1jb250YWluZXIuX2lkICp7LXdlYmtpdC10b3VjaC1jYWxsb3V0Om5vbmU7LXdlYmtpdC11c2VyLXNlbGVjdDpub25lOy1raHRtbC11c2VyLXNlbGVjdDpub25lOy1tb3otdXNlci1zZWxlY3Q6bm9uZTstbXMtdXNlci1zZWxlY3Q6bm9uZTstd2Via2l0LXRhcC1oaWdobGlnaHQtY29sb3I6dHJhbnNwYXJlbnQ7Y3Vyc29yOmRlZmF1bHR9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWJ1YmJsZXtwb3NpdGlvbjphYnNvbHV0ZTt3aWR0aDo1MHB4O2xpbmUtaGVpZ2h0OjI2cHg7dGV4dC1hbGlnbjpjZW50ZXI7Zm9udC1zaXplOjE0cHg7YmFja2dyb3VuZC1jb2xvcjpfc2Vjb25kYXJ5X2FjY2VudDtmb250LXdlaWdodDo3MDA7Ym9yZGVyLXJhZGl1czozcHg7bWFyZ2luLWxlZnQ6LTI1cHg7bWFyZ2luLXRvcDotMzJweDtjb2xvcjpfc2Vjb25kYXJ5O3otaW5kZXg6MTt0cmFuc2Zvcm0tb3JpZ2luOjMwcHggMzZweDt0cmFuc2l0aW9uLWRlbGF5OjA7dHJhbnNmb3JtOnNjYWxlKC41KTtvcGFjaXR5OjB9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWJ1YmJsZTphZnRlcntjb250ZW50OicnO3Bvc2l0aW9uOmFic29sdXRlO2Rpc3BsYXk6YmxvY2s7d2lkdGg6MTBweDtoZWlnaHQ6MTBweDt0cmFuc2Zvcm06cm90YXRlKDQ1ZGVnKTtiYWNrZ3JvdW5kOmxpbmVhci1ncmFkaWVudCgxMzVkZWcscmdiYSgwLDAsMCwwKSA1MCUsX3NlY29uZGFyeV9hY2NlbnQgNTAlKTtsZWZ0OjUwJTt0b3A6MjBweDttYXJnaW4tbGVmdDotNXB4fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1idWJibGUuZGF0aXVtLWJ1YmJsZS12aXNpYmxle3RyYW5zZm9ybTpzY2FsZSgxKTtvcGFjaXR5OjE7dHJhbnNpdGlvbi1kZWxheTouMnN9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWJ1YmJsZTpub3QoLmRhdGl1bS1idWJibGUtdmlzaWJsZSl7b3BhY2l0eTowIWltcG9ydGFudH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tYnViYmxlLmRhdGl1bS1idWJibGUtaW5hY3RpdmV7b3BhY2l0eTouNX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLWNvbnRhaW5lci13cmFwcGVye292ZXJmbG93OmhpZGRlbjtwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0Oi03cHg7cmlnaHQ6LTdweDt0b3A6ODBweDtoZWlnaHQ6MjcwcHg7ZGlzcGxheTpibG9jaztwb2ludGVyLWV2ZW50czpub25lfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXItY29udGFpbmVye3Bvc2l0aW9uOnJlbGF0aXZlO2hlaWdodDoyNjBweDtiYWNrZ3JvdW5kLWNvbG9yOl9zZWNvbmRhcnk7ZGlzcGxheTpibG9jazttYXJnaW46MCA3cHggN3B4O3BhZGRpbmctdG9wOjIwcHg7dHJhbnNmb3JtOnRyYW5zbGF0ZVkoLTI3MHB4KTtwb2ludGVyLWV2ZW50czphdXRvO2JvcmRlci1ib3R0b20tcmlnaHQtcmFkaXVzOjNweDtib3JkZXItYm90dG9tLWxlZnQtcmFkaXVzOjNweDt0cmFuc2l0aW9uOmFsbCBlYXNlIC40czt0cmFuc2l0aW9uLWRlbGF5Oi4xc31kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2Vye3Bvc2l0aW9uOmFic29sdXRlO2xlZnQ6MDtyaWdodDowO2JvdHRvbTowO2NvbG9yOl9zZWNvbmRhcnlfdGV4dDt0cmFuc2l0aW9uOmFsbCBlYXNlIC40c31kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1waWNrZXItbGVmdHt0cmFuc2Zvcm06dHJhbnNsYXRlWCgtMTAwJSkgc2NhbGUoMSk7cG9pbnRlci1ldmVudHM6bm9uZTt0cmFuc2l0aW9uLWRlbGF5OjBzfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLXBpY2tlci1yaWdodHt0cmFuc2Zvcm06dHJhbnNsYXRlWCgxMDAlKSBzY2FsZSgxKTtwb2ludGVyLWV2ZW50czpub25lO3RyYW5zaXRpb24tZGVsYXk6MHN9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tcGlja2VyLW91dHt0cmFuc2Zvcm06dHJhbnNsYXRlWCgwKSBzY2FsZSgxLjQpO29wYWNpdHk6MDtwb2ludGVyLWV2ZW50czpub25lO3RyYW5zaXRpb24tZGVsYXk6MHN9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tcGlja2VyLWlue3RyYW5zZm9ybTp0cmFuc2xhdGVYKDApIHNjYWxlKC42KTtvcGFjaXR5OjA7cG9pbnRlci1ldmVudHM6bm9uZTt0cmFuc2l0aW9uLWRlbGF5OjBzfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tb250aC1lbGVtZW50LGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS15ZWFyLWVsZW1lbnR7ZGlzcGxheTppbmxpbmUtYmxvY2s7d2lkdGg6MjUlO2xpbmUtaGVpZ2h0OjYwcHg7dGV4dC1hbGlnbjpjZW50ZXI7cG9zaXRpb246cmVsYXRpdmU7dHJhbnNpdGlvbjouMnMgZWFzZSBhbGx9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1vbnRoLWVsZW1lbnQuZGF0aXVtLXNlbGVjdGVkOmFmdGVyLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS15ZWFyLWVsZW1lbnQuZGF0aXVtLXNlbGVjdGVkOmFmdGVye2NvbnRlbnQ6Jyc7cG9zaXRpb246YWJzb2x1dGU7bGVmdDoyMHB4O3JpZ2h0OjIwcHg7dG9wOjUwJTttYXJnaW4tdG9wOjExcHg7aGVpZ2h0OjJweDtkaXNwbGF5OmJsb2NrO2JhY2tncm91bmQtY29sb3I6X3NlY29uZGFyeV9hY2NlbnR9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1vbnRoLWVsZW1lbnQuZGF0aXVtLWFjdGl2ZSxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0teWVhci1lbGVtZW50LmRhdGl1bS1hY3RpdmV7dHJhbnNmb3JtOnNjYWxlKC45KTt0cmFuc2l0aW9uOm5vbmV9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1vbnRoLWVsZW1lbnQ6bm90KFtkYXRpdW0tZGF0YV0pLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS15ZWFyLWVsZW1lbnQ6bm90KFtkYXRpdW0tZGF0YV0pe29wYWNpdHk6LjQ7cG9pbnRlci1ldmVudHM6bm9uZX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbW9udGgtZWxlbWVudC5kYXRpdW0tc2VsZWN0ZWQ6YWZ0ZXJ7bGVmdDoyNXB4O3JpZ2h0OjI1cHh9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLWRhdGUtaGVhZGVye2Rpc3BsYXk6aW5saW5lLWJsb2NrO3dpZHRoOjQwcHg7bGluZS1oZWlnaHQ6MjhweDtvcGFjaXR5Oi42O2ZvbnQtd2VpZ2h0OjcwMDt0ZXh0LWFsaWduOmNlbnRlcn1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tZGF0ZS1lbGVtZW50e2Rpc3BsYXk6aW5saW5lLWJsb2NrO3dpZHRoOjQwcHg7bGluZS1oZWlnaHQ6MzZweDt0ZXh0LWFsaWduOmNlbnRlcjtwb3NpdGlvbjpyZWxhdGl2ZTt0cmFuc2l0aW9uOi4ycyBlYXNlIGFsbH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tZGF0ZS1lbGVtZW50LmRhdGl1bS1zZWxlY3RlZDphZnRlcntjb250ZW50OicnO3Bvc2l0aW9uOmFic29sdXRlO2xlZnQ6MTJweDtyaWdodDoxMnB4O3RvcDo1MCU7bWFyZ2luLXRvcDoxMHB4O2hlaWdodDoycHg7ZGlzcGxheTpibG9jaztiYWNrZ3JvdW5kLWNvbG9yOl9zZWNvbmRhcnlfYWNjZW50fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1kYXRlLWVsZW1lbnQuZGF0aXVtLWFjdGl2ZXt0cmFuc2Zvcm06c2NhbGUoLjkpO3RyYW5zaXRpb246bm9uZX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tZGF0ZS1lbGVtZW50Om5vdChbZGF0aXVtLWRhdGFdKXtvcGFjaXR5Oi40O3BvaW50ZXItZXZlbnRzOm5vbmV9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0taG91ci1waWNrZXIsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tbWludXRlLXBpY2tlcixkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1zZWNvbmQtcGlja2Vye2hlaWdodDoyNDBweH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1ob3VyLXBpY2tlcjpiZWZvcmUsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tbWludXRlLXBpY2tlcjpiZWZvcmUsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tc2Vjb25kLXBpY2tlcjpiZWZvcmV7Y29udGVudDonJzt3aWR0aDoxNDBweDtoZWlnaHQ6MTQwcHg7cG9zaXRpb246YWJzb2x1dGU7Ym9yZGVyOjFweCBzb2xpZDtsZWZ0OjUwJTt0b3A6NTAlO21hcmdpbi1sZWZ0Oi03MXB4O21hcmdpbi10b3A6LTcxcHg7Ym9yZGVyLXJhZGl1czo3MHB4O29wYWNpdHk6LjV9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0taG91ci1waWNrZXI6YWZ0ZXIsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tbWludXRlLXBpY2tlcjphZnRlcixkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1zZWNvbmQtcGlja2VyOmFmdGVye2NvbnRlbnQ6Jyc7d2lkdGg6NHB4O2hlaWdodDo0cHg7bWFyZ2luLWxlZnQ6LTRweDttYXJnaW4tdG9wOi00cHg7dG9wOjUwJTtsZWZ0OjUwJTtib3JkZXItcmFkaXVzOjRweDtwb3NpdGlvbjphYnNvbHV0ZTtib3JkZXI6MnB4IHNvbGlkO2JvcmRlci1jb2xvcjpfc2Vjb25kYXJ5X2FjY2VudDtiYWNrZ3JvdW5kLWNvbG9yOl9zZWNvbmRhcnk7Ym94LXNoYWRvdzowIDAgMCAycHggX3NlY29uZGFyeX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tdGlja3twb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjUwJTt0b3A6NTAlO3dpZHRoOjJweDtoZWlnaHQ6NzBweDttYXJnaW4tbGVmdDotMXB4O3RyYW5zZm9ybS1vcmlnaW46MXB4IDB9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXRpY2s6YWZ0ZXJ7Y29udGVudDonJztwb3NpdGlvbjphYnNvbHV0ZTt3aWR0aDoycHg7aGVpZ2h0OjZweDtiYWNrZ3JvdW5kLWNvbG9yOl9zZWNvbmRhcnlfdGV4dDtib3R0b206LTRweDtvcGFjaXR5Oi41fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tZXJpZGllbS1zd2l0Y2hlcntwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjUwJTttYXJnaW4tbGVmdDotMzBweDt0b3A6NTAlO21hcmdpbi10b3A6MTVweDtkaXNwbGF5OmJsb2NrO3dpZHRoOjYwcHg7aGVpZ2h0OjQwcHh9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1lcmlkaWVtLXN3aXRjaGVyOmFmdGVyLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tZXJpZGllbS1zd2l0Y2hlcjpiZWZvcmV7cG9zaXRpb246YWJzb2x1dGU7d2lkdGg6MzBweDt0b3A6MDtkaXNwbGF5OmJsb2NrO2xpbmUtaGVpZ2h0OjQwcHg7Zm9udC13ZWlnaHQ6NzAwO3RleHQtYWxpZ246Y2VudGVyO2ZvbnQtc2l6ZToxNHB4O3RyYW5zZm9ybTpzY2FsZSguOSk7b3BhY2l0eTouOTtjb2xvcjpfc2Vjb25kYXJ5X3RleHQ7dHJhbnNpdGlvbjphbGwgZWFzZSAuMnN9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1lcmlkaWVtLXN3aXRjaGVyLmRhdGl1bS1taWxpdGFyeS10aW1lOmJlZm9yZXtjb250ZW50OictMTInfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tZXJpZGllbS1zd2l0Y2hlci5kYXRpdW0tbWlsaXRhcnktdGltZTphZnRlcntjb250ZW50OicrMTInfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tZXJpZGllbS1zd2l0Y2hlcjpiZWZvcmV7Y29udGVudDonQU0nO2xlZnQ6MH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbWVyaWRpZW0tc3dpdGNoZXI6YWZ0ZXJ7Y29udGVudDonUE0nO3JpZ2h0OjB9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1lcmlkaWVtLXN3aXRjaGVyLmRhdGl1bS1hbS1zZWxlY3RlZDpiZWZvcmUsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1lcmlkaWVtLXN3aXRjaGVyLmRhdGl1bS1wbS1zZWxlY3RlZDphZnRlcnt0cmFuc2Zvcm06c2NhbGUoMSk7Y29sb3I6X3NlY29uZGFyeV9hY2NlbnQ7b3BhY2l0eToxfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tZXJpZGllbS1zd2l0Y2hlci5kYXRpdW0tYWN0aXZlOmFmdGVyLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tZXJpZGllbS1zd2l0Y2hlci5kYXRpdW0tYWN0aXZlOmJlZm9yZXt0cmFuc2l0aW9uOm5vbmV9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1lcmlkaWVtLXN3aXRjaGVyLmRhdGl1bS1hY3RpdmUuZGF0aXVtLWFtLXNlbGVjdGVkOmJlZm9yZXt0cmFuc2Zvcm06c2NhbGUoLjkpfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1tZXJpZGllbS1zd2l0Y2hlci5kYXRpdW0tYWN0aXZlLmRhdGl1bS1hbS1zZWxlY3RlZDphZnRlcixkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbWVyaWRpZW0tc3dpdGNoZXIuZGF0aXVtLWFjdGl2ZS5kYXRpdW0tcG0tc2VsZWN0ZWQ6YmVmb3Jle3RyYW5zZm9ybTpzY2FsZSguOCl9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1lcmlkaWVtLXN3aXRjaGVyLmRhdGl1bS1hY3RpdmUuZGF0aXVtLXBtLXNlbGVjdGVkOmFmdGVye3RyYW5zZm9ybTpzY2FsZSguOSl9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXRpY2stbGFiZWwtY29udGFpbmVye3Bvc2l0aW9uOmFic29sdXRlO2JvdHRvbTotNTBweDtsZWZ0Oi0yNHB4O2Rpc3BsYXk6YmxvY2s7aGVpZ2h0OjUwcHg7d2lkdGg6NTBweH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tdGljay1sYWJlbHtwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjA7dG9wOjA7ZGlzcGxheTpibG9jazt3aWR0aDoxMDAlO2xpbmUtaGVpZ2h0OjUwcHg7Ym9yZGVyLXJhZGl1czoyNXB4O3RleHQtYWxpZ246Y2VudGVyO2ZvbnQtc2l6ZToxNHB4O3RyYW5zaXRpb246LjJzIGVhc2UgYWxsfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS10aWNrLWxhYmVsLmRhdGl1bS1hY3RpdmV7dHJhbnNmb3JtOnNjYWxlKC45KTt0cmFuc2l0aW9uOm5vbmV9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXRpY2stbGFiZWwuZGF0aXVtLWluYWN0aXZle29wYWNpdHk6LjQ7cG9pbnRlci1ldmVudHM6bm9uZX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1ob3VyLXBpY2tlci5kYXRpdW0tZHJhZ2dpbmcgZGF0aXVtLWhvdXItaGFuZCxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1ob3VyLXBpY2tlci5kYXRpdW0tZHJhZ2dpbmcgZGF0aXVtLW1pbnV0ZS1oYW5kLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLWhvdXItcGlja2VyLmRhdGl1bS1kcmFnZ2luZyBkYXRpdW0tc2Vjb25kLWhhbmQsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0taG91ci1waWNrZXIuZGF0aXVtLWRyYWdnaW5nIGRhdGl1bS10aW1lLWRyYWctYXJtLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLW1pbnV0ZS1waWNrZXIuZGF0aXVtLWRyYWdnaW5nIGRhdGl1bS1ob3VyLWhhbmQsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tbWludXRlLXBpY2tlci5kYXRpdW0tZHJhZ2dpbmcgZGF0aXVtLW1pbnV0ZS1oYW5kLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLW1pbnV0ZS1waWNrZXIuZGF0aXVtLWRyYWdnaW5nIGRhdGl1bS1zZWNvbmQtaGFuZCxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1taW51dGUtcGlja2VyLmRhdGl1bS1kcmFnZ2luZyBkYXRpdW0tdGltZS1kcmFnLWFybSxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1zZWNvbmQtcGlja2VyLmRhdGl1bS1kcmFnZ2luZyBkYXRpdW0taG91ci1oYW5kLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLXNlY29uZC1waWNrZXIuZGF0aXVtLWRyYWdnaW5nIGRhdGl1bS1taW51dGUtaGFuZCxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1zZWNvbmQtcGlja2VyLmRhdGl1bS1kcmFnZ2luZyBkYXRpdW0tc2Vjb25kLWhhbmQsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tc2Vjb25kLXBpY2tlci5kYXRpdW0tZHJhZ2dpbmcgZGF0aXVtLXRpbWUtZHJhZy1hcm17dHJhbnNpdGlvbjpub25lfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1ob3VyLWhhbmQsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLW1pbnV0ZS1oYW5kLGRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1zZWNvbmQtaGFuZHtwb3NpdGlvbjphYnNvbHV0ZTtkaXNwbGF5OmJsb2NrO3dpZHRoOjA7aGVpZ2h0OjA7bGVmdDo1MCU7dG9wOjUwJTt0cmFuc2Zvcm0tb3JpZ2luOjNweCAzcHg7bWFyZ2luLWxlZnQ6LTNweDttYXJnaW4tdG9wOi0zcHg7Ym9yZGVyLWxlZnQ6M3B4IHNvbGlkIHRyYW5zcGFyZW50O2JvcmRlci1yaWdodDozcHggc29saWQgdHJhbnNwYXJlbnQ7Ym9yZGVyLXRvcC1sZWZ0LXJhZGl1czozcHg7Ym9yZGVyLXRvcC1yaWdodC1yYWRpdXM6M3B4O3RyYW5zaXRpb246LjNzIGVhc2UgYWxsfWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS1waWNrZXIuZGF0aXVtLW1pbnV0ZS1waWNrZXIgZGF0aXVtLWhvdXItaGFuZCxkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tcGlja2VyLmRhdGl1bS1zZWNvbmQtcGlja2VyIGRhdGl1bS1ob3VyLWhhbmQsZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXBpY2tlci5kYXRpdW0tc2Vjb25kLXBpY2tlciBkYXRpdW0tbWludXRlLWhhbmR7Ym9yZGVyLXRvcC1jb2xvcjpfc2Vjb25kYXJ5X3RleHQ7b3BhY2l0eTouNX1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0taG91ci1oYW5ke2JvcmRlci10b3A6MzBweCBzb2xpZCBfc2Vjb25kYXJ5X2FjY2VudH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tbWludXRlLWhhbmR7dHJhbnNmb3JtLW9yaWdpbjoycHggMnB4O21hcmdpbi1sZWZ0Oi0ycHg7bWFyZ2luLXRvcDotMnB4O2JvcmRlci1sZWZ0OjJweCBzb2xpZCB0cmFuc3BhcmVudDtib3JkZXItcmlnaHQ6MnB4IHNvbGlkIHRyYW5zcGFyZW50O2JvcmRlci10b3AtbGVmdC1yYWRpdXM6MnB4O2JvcmRlci10b3AtcmlnaHQtcmFkaXVzOjJweDtib3JkZXItdG9wOjQwcHggc29saWQgX3NlY29uZGFyeV9hY2NlbnR9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXNlY29uZC1oYW5ke3RyYW5zZm9ybS1vcmlnaW46MXB4IDFweDttYXJnaW4tbGVmdDotMXB4O21hcmdpbi10b3A6LTFweDtib3JkZXItbGVmdDoxcHggc29saWQgdHJhbnNwYXJlbnQ7Ym9yZGVyLXJpZ2h0OjFweCBzb2xpZCB0cmFuc3BhcmVudDtib3JkZXItdG9wLWxlZnQtcmFkaXVzOjFweDtib3JkZXItdG9wLXJpZ2h0LXJhZGl1czoxcHg7Ym9yZGVyLXRvcDo1MHB4IHNvbGlkIF9zZWNvbmRhcnlfYWNjZW50fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS10aW1lLWRyYWctYXJte3dpZHRoOjJweDtoZWlnaHQ6NzBweDtwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjUwJTt0b3A6NTAlO21hcmdpbi1sZWZ0Oi0xcHg7dHJhbnNmb3JtLW9yaWdpbjoxcHggMDt0cmFuc2Zvcm06cm90YXRlKDQ1ZGVnKTt0cmFuc2l0aW9uOi4zcyBlYXNlIGFsbH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tdGltZS1kcmFnLWFybTphZnRlcixkYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tdGltZS1kcmFnLWFybTpiZWZvcmV7Y29udGVudDonJztib3JkZXI6NHB4IHNvbGlkIHRyYW5zcGFyZW50O3Bvc2l0aW9uOmFic29sdXRlO2JvdHRvbTotNHB4O2xlZnQ6MTJweDtib3JkZXItbGVmdC1jb2xvcjpfc2Vjb25kYXJ5X2FjY2VudDt0cmFuc2Zvcm0tb3JpZ2luOi0xMXB4IDRweH1kYXRpdW0tY29udGFpbmVyLl9pZCBkYXRpdW0tdGltZS1kcmFnLWFybTphZnRlcnt0cmFuc2Zvcm06cm90YXRlKDE4MGRlZyl9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXRpbWUtZHJhZ3tkaXNwbGF5OmJsb2NrO3Bvc2l0aW9uOmFic29sdXRlO3dpZHRoOjUwcHg7aGVpZ2h0OjUwcHg7dG9wOjEwMCU7bWFyZ2luLXRvcDotMjVweDttYXJnaW4tbGVmdDotMjRweDtib3JkZXItcmFkaXVzOjI1cHh9ZGF0aXVtLWNvbnRhaW5lci5faWQgZGF0aXVtLXRpbWUtZHJhZzphZnRlcntjb250ZW50OicnO3dpZHRoOjEwcHg7aGVpZ2h0OjEwcHg7cG9zaXRpb246YWJzb2x1dGU7bGVmdDo1MCU7dG9wOjUwJTttYXJnaW4tbGVmdDotN3B4O21hcmdpbi10b3A6LTdweDtiYWNrZ3JvdW5kLWNvbG9yOl9zZWNvbmRhcnlfYWNjZW50O2JvcmRlcjoycHggc29saWQ7Ym9yZGVyLWNvbG9yOl9zZWNvbmRhcnk7Ym94LXNoYWRvdzowIDAgMCAycHggX3NlY29uZGFyeV9hY2NlbnQ7Ym9yZGVyLXJhZGl1czoxMHB4fWRhdGl1bS1jb250YWluZXIuX2lkIGRhdGl1bS10aW1lLWRyYWcuZGF0aXVtLWFjdGl2ZTphZnRlcnt3aWR0aDo4cHg7aGVpZ2h0OjhweDtib3JkZXI6M3B4IHNvbGlkO2JvcmRlci1jb2xvcjpfc2Vjb25kYXJ5fVwiOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
