ngm.factory("datium.MonthPicker",
["datium.listen", "datium.trigger", 
function(listen, trigger) {
/// <reference path="Picker.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var MonthPicker = (function (_super) {
    __extends(MonthPicker, _super);
    function MonthPicker(element, container) {
        var self = this;
        _super.call(this, element, container);
        listen.tap(container, 'datium-month-element[datium-data]', function (e) {
            var el = e.target || e.srcElement;
            var year = new Date(el.getAttribute('datium-data')).getFullYear();
            var month = new Date(el.getAttribute('datium-data')).getMonth();
            var date = new Date(self.selectedDate === void 0 ?
                self.options.initialDate.valueOf() :
                self.selectedDate.valueOf());
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
            var text = self.getShortMonths()[new Date(el.getAttribute('datium-data')).getMonth()];
            var offset = self.getOffset(el);
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
        this.setValid();
    };
    MonthPicker.prototype.setValid = function () {
        var monthElements = this.pickerContainer.querySelectorAll('datium-month-element');
        for (var i = 0; i < monthElements.length; i++) {
            var el = monthElements.item(i);
            var date = new Date(el.getAttribute('datium-data'));
            var next = new Date(date.getFullYear(), date.getMonth() + 1);
            if (date.valueOf() < this.options.maxDate.valueOf() &&
                next.valueOf() > this.options.minDate.valueOf() &&
                this.options.isMonthValid(date)) {
                el.classList.remove('datium-invalid');
            }
            else {
                el.classList.add('datium-invalid');
            }
        }
    };
    MonthPicker.prototype.updateOptions = function (options) {
        this.options = options;
        this.setValid();
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
                date.getMonth() === selectedDate.getMonth() &&
                this.defined) {
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
return MonthPicker;
}]);