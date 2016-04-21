ngm.factory("datium.TimePicker", function() {
/// <reference path="Picker.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
        // TODO reproduce dragging bug
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
        var d = this.getElementDate(this.timeDrag);
        var zoomIn = true;
        var start, end;
        if (this.getLevel() === 3 /* HOUR */) {
            d.setHours(this.rotationToTime(this.rotation));
            d = this.round(d);
            zoomIn = this.options.isHourValid(d);
            start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours());
            end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours() + 1);
        }
        else if (this.getLevel() === 4 /* MINUTE */) {
            d.setMinutes(this.rotationToTime(this.rotation));
            d = this.round(d);
            zoomIn = this.options.isMinuteValid(d);
            start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes());
            end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes() + 1);
        }
        else if (this.getLevel() === 5 /* SECOND */) {
            d.setSeconds(this.rotationToTime(this.rotation));
            d = this.round(d);
            zoomIn = this.options.isSecondValid(d);
            start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());
            end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds() + 1);
        }
        if (start.valueOf() < this.options.maxDate.valueOf() &&
            end.valueOf() > this.options.minDate.valueOf() &&
            zoomIn) {
            trigger.zoomIn(this.element, {
                date: d,
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
            date = this.options.initialDate;
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
return TimePicker;
});