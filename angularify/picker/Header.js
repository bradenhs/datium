ngm.factory("datium.Header",
["datium.Common", "datium.listen", "datium.trigger", 
function(Common, listen, trigger) {
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Header = (function (_super) {
    __extends(Header, _super);
    function Header(element, container) {
        var self = this;
        _super.call(this);
        this.element = element;
        this.container = container;
        listen.viewchanged(element, function (e) { return self.viewchanged(e.date, e.level); });
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
        listen.tap(previousButton, function () { return self.previous(); });
        listen.tap(nextButton, function () { return self.next(); });
        listen.tap(spanLabelContainer, function () { return self.zoomOut(); });
    }
    Header.prototype.updateMaxLevel = function (level) {
        this.yearLabel.classList.remove('datium-max-level');
        this.monthLabel.classList.remove('datium-max-level');
        this.dateLabel.classList.remove('datium-max-level');
        this.hourLabel.classList.remove('datium-max-level');
        this.minuteLabel.classList.remove('datium-max-level');
        switch (level) {
            case 1 /* MONTH */:
                this.yearLabel.classList.add('datium-max-level');
                break;
            case 2 /* DATE */:
                this.monthLabel.classList.add('datium-max-level');
                break;
            case 3 /* HOUR */:
                this.dateLabel.classList.add('datium-max-level');
                break;
            case 4 /* MINUTE */:
                this.hourLabel.classList.add('datium-max-level');
                break;
            case 5 /* SECOND */:
                this.minuteLabel.classList.add('datium-max-level');
                break;
        }
    };
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
        // TODO think about making a "viewDate" and a "selectedDate"
        var self = this;
        this.date = date;
        this.level = level;
        this.labels.forEach(function (label, labelLevel) {
            label.classList.remove('datium-top');
            label.classList.remove('datium-bottom');
            label.classList.remove('datium-hidden');
            if (labelLevel < level) {
                label.classList.add('datium-top');
                label.innerHTML = self.getHeaderTopText(self.date, labelLevel);
            }
            else {
                label.classList.add('datium-bottom');
                label.innerHTML = self.getHeaderBottomText(self.date, labelLevel);
            }
            if (labelLevel < level - 1 || labelLevel > level) {
                label.classList.add('datium-hidden');
            }
        });
    };
    Header.prototype.getHeaderTopText = function (date, level) {
        if (date === void 0)
            return;
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
        if (date === void 0)
            return;
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
return Header;
}]);