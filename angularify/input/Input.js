ngm.factory("datium.Input", function() {
var Input = (function () {
    function Input(element) {
        var _this = this;
        this.element = element;
        this.textBuffer = "";
        this.hasBlurred = false;
        this.isInput = element.setSelectionRange !== void 0;
        if (!this.isInput) {
            element.setAttribute('tabindex', '0');
        }
        new KeyboardEventHandler(this);
        new PointerEventHandler(this);
        new PasteEventHander(this);
        listen.viewchanged(element, function (e) { return _this.viewchanged(e.date, e.level, e.update); });
        listen.blur(element, function () {
            _this.textBuffer = '';
            _this.hasBlurred = true;
        });
    }
    Input.prototype.setDateFromString = function (str, start, end) {
        if (start === void 0) { start = 0; }
        if (end === void 0) { end = Number.MAX_VALUE; }
        if (!this.format.test(str)) {
            return false;
        }
        var newDate = new Date(this.date.valueOf());
        var strPrefix = '';
        var levelsUpdated = [];
        for (var i = 0; i < this.dateParts.length; i++) {
            var datePart = this.dateParts[i];
            var regExp = new RegExp(datePart.getRegEx().source.slice(1, -1), 'i');
            var match = str.replace(strPrefix, '').match(regExp);
            if (match === null) {
                datePart.setDefined(false);
                strPrefix += datePart.toString();
                continue;
            }
            if (levelsUpdated.indexOf(datePart.getLevel()) !== -1) {
                strPrefix += datePart.toString();
                continue;
            }
            var val = match[0];
            strPrefix += val;
            if (strPrefix.length >= start && strPrefix.length - val.length <= end) {
                levelsUpdated.push(datePart.getLevel());
                if (!datePart.isSelectable())
                    continue;
                datePart.setDefined(true);
                datePart.setValue(newDate);
                if (datePart.setValue(val)) {
                    newDate = datePart.getValue();
                }
                else {
                    return false;
                }
            }
        }
        var level = this.selectedDatePart === void 0 ? this.getFirstSelectableDatePart().getLevel() : this.selectedDatePart.getLevel();
        trigger.goto(this.element, {
            date: newDate,
            level: level
        });
        return true;
    };
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
    Input.prototype.beforeMinDate = function () {
        return this.date.valueOf() < this.options.minDate.valueOf();
    };
    Input.prototype.afterMaxDate = function () {
        return this.date.valueOf() > this.options.maxDate.valueOf();
    };
    Input.prototype.getInvalidReasons = function () {
        var reasons = [];
        if (this.date.valueOf() < this.options.minDate.valueOf()) {
            reasons.push('datium-before-min');
        }
        if (this.date.valueOf() > this.options.maxDate.valueOf()) {
            reasons.push('datium-after-max');
        }
        this.dateParts.forEach(function (datePart) {
            var level = ['year', 'month', 'day', 'hour', 'minute', 'second'][datePart.getLevel()];
            if (!datePart.isSelectable())
                return;
            if (!datePart.isDefined()) {
                if (reasons.indexOf('datium-undefined') === -1)
                    reasons.push('datium-undefined');
                if (reasons.indexOf("datium-" + level + "-undefined") === -1)
                    reasons.push("datium-" + level + "-undefined");
            }
            if (!datePart.isValid()) {
                if (reasons.indexOf('datium-bad-selection') === -1)
                    reasons.push('datium-bad-selection');
                if (reasons.indexOf("datium-bad-" + level + "-selection") === -1)
                    reasons.push("datium-bad-" + level + "-selection");
            }
        });
        return reasons;
    };
    Input.prototype.isValid = function () {
        if (this.date.valueOf() < this.options.minDate.valueOf() ||
            this.date.valueOf() > this.options.maxDate.valueOf()) {
            return false;
        }
        return this.dateParts.every(function (datePart) {
            return !datePart.isSelectable() ||
                (datePart.isDefined() &&
                    datePart.isValid());
        });
    };
    Input.prototype.getDate = function () {
        return this.date;
    };
    Input.prototype.setDefined = function (datePart, defined) {
        datePart.setDefined(defined);
        trigger.updateDefinedState(this.element, {
            defined: defined,
            level: datePart.getLevel()
        });
    };
    Input.prototype.updateDateFromBuffer = function () {
        if (this.selectedDatePart.setValueFromPartial(this.textBuffer)) {
            var newDate = this.selectedDatePart.getValue();
            if (this.textBuffer.length >= this.selectedDatePart.getMaxBuffer()) {
                this.textBuffer = '';
                this.setDefined(this.selectedDatePart, true);
                if (this.selectedDatePart.isValid()) {
                    var lastSelected = this.selectedDatePart;
                    this.selectedDatePart = this.getNextSelectableDatePart();
                }
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
        var definedLevels = [];
        if (this.dateParts !== void 0) {
            this.dateParts.forEach(function (datePart) {
                if (datePart.isDefined() &&
                    definedLevels.indexOf(datePart.getLevel()) === -1) {
                    definedLevels.push(datePart.getLevel());
                }
            });
        }
        this.dateParts = Parser.parse(options);
        this.selectedDatePart = void 0;
        var format = '^';
        this.dateParts.forEach(function (datePart) {
            format += "((" + datePart.getRegEx().source.slice(1, -1) + ")|(" + new RegExp(datePart.toString()).source + "))";
            if (definedLevels.indexOf(datePart.getLevel()) !== -1) {
                datePart.setDefined(true);
            }
        });
        this.format = new RegExp(format + '$', 'i');
        this.viewchanged(this.date, this.level, true);
    };
    Input.prototype.getMaxDatePart = function () {
        var maxLevel = this.getLevels().slice().sort()[0];
        return this.dateParts.filter(function (datePart) {
            if (datePart.getLevel() === maxLevel) {
                return true;
            }
            return false;
        })[0];
    };
    Input.prototype.toString = function () {
        var dateString = '';
        this.dateParts.forEach(function (datePart) {
            dateString += datePart.toString();
        });
        return dateString;
    };
    Input.prototype.updateView = function () {
        var currentLevel = this.selectedDatePart !== void 0 ? this.selectedDatePart.getLevel() : 6 /* NONE */;
        this.element.value = this.toString();
        if (!this.isInput)
            return;
        if (this.selectedDatePart === void 0)
            return;
        var start = 0;
        var i = 0;
        while (this.dateParts[i] !== this.selectedDatePart) {
            var datePart = this.dateParts[i++];
            start += datePart.toString().length;
        }
        var end = start + this.selectedDatePart.toString().length;
        if (start === this.element.selectionStart &&
            end === this.element.selectionEnd)
            return;
        if (document.activeElement === this.element)
            this.element.setSelectionRange(start, end);
    };
    Input.prototype.viewchanged = function (date, level, update) {
        var _this = this;
        this.date = date;
        this.level = level;
        this.dateParts.forEach(function (datePart) {
            if (update)
                datePart.setValue(_this.date);
            if (update && level === datePart.getLevel() && _this.textBuffer.length > 0) {
                _this.setDefined(datePart, true);
            }
            if (datePart.isSelectable() &&
                datePart.getLevel() === level &&
                _this.getSelectedDatePart() !== void 0 &&
                level !== _this.getSelectedDatePart().getLevel()) {
                _this.setSelectedDatePart(datePart);
            }
        });
        this.updateView();
        this.element.dispatchEvent(new Event('input'));
    };
    Input.prototype.triggerViewChange = function () {
        if (this.selectedDatePart === void 0)
            this.selectedDatePart = this.dateParts[0];
        trigger.viewchanged(this.element, {
            date: this.selectedDatePart.getValue(),
            level: this.selectedDatePart.getLevel(),
            update: false
        });
    };
    return Input;
}());
return Input;
});