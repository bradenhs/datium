ngm.factory("datium.DatiumInternals",
["datium.OptionSanitizer", "datium.Common", "datium.listen", 
"datium.trigger", "datium.Input", "datium.PickerManager", 
"datium.Picker", 
function(OptionSanitizer, Common, listen, trigger, Input, PickerManager, Picker) {
var DatiumInternals = (function () {
    function DatiumInternals(element, options) {
        var self = this;
        this.element = element;
        this.options = {};
        this.dirty = false;
        this.first = true;
        if (element === void 0)
            throw 'element is required';
        element.setAttribute('spellcheck', 'false');
        element.setAttribute('readonly', 'readonly');
        this.input = new Input(element);
        this.pickerManager = new PickerManager(element);
        this.updateOptions(options);
        listen.goto(element, function (e) { return self.goto(e.date, e.level, e.update); });
        listen.zoomOut(element, function (e) { return self.zoomOut(e.date, e.currentLevel, e.update); });
        listen.zoomIn(element, function (e) { return self.zoomIn(e.date, e.currentLevel, e.update); });
        listen.focus(element, function (e) {
            element.removeAttribute('readonly');
        });
        listen.blur(element, function () {
            if (self.options.showPicker) {
                element.setAttribute('readonly', 'readonly');
            }
        });
        var downCoor;
        listen.down(document, function (e) {
            downCoor = Common.GetClientCoor(e);
        });
        listen.up(document, function (e) {
            var upCoor = Common.GetClientCoor(e);
            if (Math.sqrt(Math.pow(upCoor.x - downCoor.x, 2) + Math.pow(upCoor.y - downCoor.y, 2)) > 20)
                return;
            var target = e.srcElement || e.target;
            while (target !== null) {
                if (target === self.pickerManager.container ||
                    target === self.element) {
                    return;
                }
                target = target.parentElement;
            }
            self.element.blur();
        });
        if (this.input.isInput)
            return;
        listen.down(element, function () {
            if (!self.pickerManager.container.classList.contains('datium-closed'))
                return;
            trigger.goto(element, {
                date: self.date,
                level: self.levels[0]
            });
        });
    }
    DatiumInternals.prototype.init = function () {
        var initialDate = this.options.initialDate;
        if (initialDate === void 0) {
            initialDate = new Date();
            if (initialDate.valueOf() < this.options.minDate.valueOf()) {
                initialDate = new Date(this.options.minDate.valueOf());
            }
            if (initialDate.valueOf() > this.options.maxDate.valueOf()) {
                initialDate = new Date(this.options.maxDate.valueOf());
            }
        }
        this.goto(initialDate, 6 /* NONE */, false);
    };
    DatiumInternals.prototype.setDate = function (date) {
        if (typeof date === 'string') {
            this.input.setDateFromString(date);
        }
        else {
            trigger.goto(this.element, {
                date: date,
                level: this.input.getSelectedDatePart() === void 0 ? 6 /* NONE */ : this.input.getSelectedDatePart().getLevel()
            });
        }
    };
    DatiumInternals.prototype.setDirty = function (dirty) {
        this.dirty = dirty;
    };
    DatiumInternals.prototype.setDefined = function () {
        var self = this;
        this.input.dateParts.forEach(function (datePart) {
            datePart.setDefined(true);
            trigger.updateDefinedState(self.element, {
                defined: true,
                level: datePart.getLevel()
            });
        });
        trigger.goto(this.element, {
            date: this.input.getDate(),
            level: this.input.getSelectedDatePart() === void 0 ? 6 /* NONE */ : this.input.getSelectedDatePart().getLevel()
        });
    };
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
        var self = this;
        if (update === void 0) { update = true; }
        var newLevel = this.levels[this.levels.indexOf(currentLevel) + 1];
        if (newLevel === void 0) {
            newLevel = 6 /* NONE */;
            this.pickerManager.closePicker();
            if (!this.input.isInput) {
                this.element.blur();
            }
        }
        this.input.dateParts.forEach(function (datePart) {
            if (datePart.getLevel() <= currentLevel) {
                datePart.setDefined(true);
                trigger.updateDefinedState(self.element, {
                    defined: true,
                    level: datePart.getLevel()
                });
            }
        });
        trigger.goto(this.element, {
            date: date,
            level: newLevel,
            update: update
        });
    };
    DatiumInternals.prototype.toString = function () {
        return this.input.toString();
    };
    DatiumInternals.prototype.getInvalidReasons = function () {
        return this.input.getInvalidReasons();
    };
    DatiumInternals.prototype.isValid = function () {
        return this.input.isValid();
    };
    DatiumInternals.prototype.isDirty = function () {
        return this.dirty;
    };
    DatiumInternals.prototype.getDate = function () {
        if (!this.isValid())
            return void 0;
        return this.input.getDate();
    };
    DatiumInternals.prototype.goto = function (date, level, update) {
        if (update === void 0) { update = true; }
        this.date = date;
        if (update)
            this.dirty = true;
        trigger.viewchanged(this.element, {
            date: this.date,
            level: level,
            update: update
        });
        this.element.dispatchEvent(new Event('input'));
    };
    DatiumInternals.prototype.updateOptions = function (newOptions) {
        if (newOptions === void 0) { newOptions = {}; }
        this.options = OptionSanitizer.sanitize(newOptions, this.options);
        this.input.updateOptions(this.options);
        this.levels = this.input.getLevels().slice();
        this.levels.sort();
        if (this.options.transition) {
            this.pickerManager.container.classList.remove('datium-no-transition');
        }
        else {
            this.pickerManager.container.classList.add('datium-no-transition');
        }
        if (this.options.showPicker) {
            this.element.setAttribute('readonly', 'readonly');
        }
        else {
            this.element.removeAttribute('readonly');
        }
        if (this.pickerManager.currentPicker !== void 0) {
            var curLevel = this.pickerManager.currentPicker.getLevel();
            if (this.levels.indexOf(curLevel) == -1) {
                trigger.goto(this.element, {
                    date: this.date,
                    level: this.levels[0]
                });
            }
        }
        this.pickerManager.startLevel = this.levels[0];
        this.pickerManager.updateOptions(this.options);
        if (this.first) {
            this.first = false;
            this.init();
        }
    };
    return DatiumInternals;
}());
return DatiumInternals;
}]);