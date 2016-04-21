ngm.factory("datium.formatBlocks",
["datium.Common", 
function(Common) {
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
        DatePart.prototype.isValid = function () {
            var level = this.getLevel();
            if (level === 0 /* YEAR */) {
                return this.options.isYearValid(this.date);
            }
            else if (level === 1 /* MONTH */) {
                return this.options.isMonthValid(this.date);
            }
            else if (level === 2 /* DATE */) {
                return this.options.isDateValid(this.date);
            }
            else if (level === 3 /* HOUR */) {
                return this.options.isHourValid(this.date);
            }
            else if (level === 4 /* MINUTE */) {
                return this.options.isMinuteValid(this.date);
            }
            else if (level === 5 /* SECOND */) {
                return this.options.isSecondValid(this.date);
            }
        };
        DatePart.prototype.getLevel = function () {
            return void 0;
        };
        return DatePart;
    }(Common));
    var FourDigitYear = (function (_super) {
        __extends(FourDigitYear, _super);
        function FourDigitYear(options) {
            _super.call(this, options);
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
            if (this.defined)
                return this.date.getFullYear().toString();
            return 'yyyy';
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
            // TODO goto closest 50 years
            if (typeof value === 'object') {
                this.date = new Date(value.valueOf());
                return true;
            }
            else if (typeof value === 'string' && this.getRegEx().test(value)) {
                var base = Math.floor(this.date.getFullYear() / 100) * 100;
                var year = parseInt(value, 10) + base;
                if (year - this.date.getFullYear() > 50) {
                    year -= 100;
                }
                else if (year - this.date.getFullYear() < -50) {
                    year += 100;
                }
                this.date.setFullYear(year);
                return true;
            }
            return false;
        };
        TwoDigitYear.prototype.getRegEx = function () {
            return /^-?\d{1,2}$/;
        };
        TwoDigitYear.prototype.toString = function () {
            if (this.defined)
                return _super.prototype.toString.call(this).slice(-2);
            return 'yy';
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
            var i = 0;
            do {
                var num = this.date.getMonth() + 1;
                if (num > 11)
                    num = 0;
                this.date.setMonth(num);
                while (this.date.getMonth() !== num) {
                    this.date.setDate(this.date.getDate() - 1);
                }
            } while (!this.isValid() && i++ < 12);
        };
        LongMonthName.prototype.decrement = function () {
            var i = 0;
            do {
                var num = this.date.getMonth() - 1;
                if (num < 0)
                    num = 11;
                this.date.setMonth(num);
                while (this.date.getMonth() !== num) {
                    this.date.setDate(this.date.getDate() - 1);
                }
            } while (!this.isValid() && i++ < 12);
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
            if (this.defined)
                return this.getMonths()[this.date.getMonth()];
            return 'mmm';
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
            if (this.defined)
                return _super.prototype.toString.call(this);
            return 'mmm';
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
            return /^((1[0-2])|[1-9])$/;
        };
        Month.prototype.toString = function () {
            if (this.defined)
                return (this.date.getMonth() + 1).toString();
            return 'mm';
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
            if (this.defined)
                return this.pad(_super.prototype.toString.call(this));
            return 'mm';
        };
        return PaddedMonth;
    }(Month));
    var DateNumeral = (function (_super) {
        __extends(DateNumeral, _super);
        function DateNumeral(options) {
            _super.call(this, options);
        }
        DateNumeral.prototype.increment = function () {
            var i = 0;
            do {
                var num = this.date.getDate() + 1;
                if (num > this.daysInMonth(this.date))
                    num = 1;
                this.date.setDate(num);
            } while (!this.isValid() && i++ < this.daysInMonth(this.date));
        };
        DateNumeral.prototype.decrement = function () {
            var i = 0;
            do {
                var num = this.date.getDate() - 1;
                if (num < 1)
                    num = this.daysInMonth(this.date);
                this.date.setDate(num);
            } while (!this.isValid() && i++ < this.daysInMonth(this.date));
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
            else if (typeof value === 'string' && this.getRegEx().test(value) && parseInt(value, 10) <= this.daysInMonth(this.date)) {
                this.date.setDate(parseInt(value, 10));
                return true;
            }
            return false;
        };
        DateNumeral.prototype.getRegEx = function () {
            return /^((1|2)[0-9])|(3[0-1])|[1-9]$/;
        };
        DateNumeral.prototype.getMaxBuffer = function () {
            return this.date.getDate() > Math.floor(this.daysInMonth(this.date) / 10) ? 1 : 2;
        };
        DateNumeral.prototype.getLevel = function () {
            return 2 /* DATE */;
        };
        DateNumeral.prototype.toString = function () {
            if (this.defined)
                return this.date.getDate().toString();
            return 'dd';
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
            if (this.defined)
                return this.pad(this.date.getDate());
            return 'dd';
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
            if (this.defined) {
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
            }
            return 'dd';
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
            var i = 0;
            do {
                var num = this.date.getDay() + 1;
                if (num > 6)
                    num = 0;
                this.date.setDate(this.date.getDate() - this.date.getDay() + num);
            } while (!this.isValid() && i++ < 7);
        };
        LongDayName.prototype.decrement = function () {
            var i = 0;
            do {
                var num = this.date.getDay() - 1;
                if (num < 0)
                    num = 6;
                this.date.setDate(this.date.getDate() - this.date.getDay() + num);
            } while (!this.isValid() && i++ < 7);
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
            if (this.defined)
                return this.getDays()[this.date.getDay()];
            return 'ddd';
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
            var i = 0;
            do {
                var num = this.date.getHours() + 1;
                if (num > 23)
                    num = 0;
                this.date.setHours(num);
            } while (!this.isValid() && i++ < 24);
        };
        PaddedMilitaryHour.prototype.decrement = function () {
            var i = 0;
            do {
                var num = this.date.getHours() - 1;
                if (num < 0)
                    num = 23;
                this.date.setHours(num);
                // Day Light Savings Adjustment
                if (this.date.getHours() !== num) {
                    this.date.setHours(num - 1);
                    i++;
                }
            } while (!this.isValid() && i++ < 24);
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
            if (this.defined)
                return this.pad(this.date.getHours());
            return '--';
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
            return /^((2[0-3])|(1?[0-9]))$/;
        };
        MilitaryHour.prototype.toString = function () {
            if (this.defined)
                return this.date.getHours().toString();
            return '--';
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
            if (this.defined)
                return this.pad(this.getHours(this.date));
            return '--';
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
            return /^(1[0-2])|[1-9]$/;
        };
        Hour.prototype.toString = function () {
            if (this.defined)
                return this.trim(_super.prototype.toString.call(this));
            return '--';
        };
        return Hour;
    }(PaddedHour));
    var PaddedMinute = (function (_super) {
        __extends(PaddedMinute, _super);
        function PaddedMinute(options) {
            _super.call(this, options);
        }
        PaddedMinute.prototype.increment = function () {
            var i = 0;
            do {
                var num = this.date.getMinutes() + 1;
                if (num > 59)
                    num = 0;
                this.date.setMinutes(num);
            } while (!this.isValid() && i++ < 60);
        };
        PaddedMinute.prototype.decrement = function () {
            var i = 0;
            do {
                var num = this.date.getMinutes() - 1;
                if (num < 0)
                    num = 59;
                this.date.setMinutes(num);
            } while (!this.isValid() && i++ < 60);
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
            if (this.defined)
                return this.pad(this.date.getMinutes());
            return '--';
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
            if (this.defined)
                return this.date.getMinutes().toString();
            return '--';
        };
        return Minute;
    }(PaddedMinute));
    var PaddedSecond = (function (_super) {
        __extends(PaddedSecond, _super);
        function PaddedSecond(options) {
            _super.call(this, options);
        }
        PaddedSecond.prototype.increment = function () {
            var i = 0;
            do {
                var num = this.date.getSeconds() + 1;
                if (num > 59)
                    num = 0;
                this.date.setSeconds(num);
            } while (!this.isValid() && i++ < 60);
        };
        PaddedSecond.prototype.decrement = function () {
            var i = 0;
            do {
                var num = this.date.getSeconds() - 1;
                if (num < 0)
                    num = 59;
                this.date.setSeconds(num);
            } while (!this.isValid() && i++ < 60);
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
            if (this.defined)
                return this.pad(this.date.getSeconds());
            return '--';
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
            if (this.defined)
                return this.date.getSeconds().toString();
            return '--';
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
            if (this.defined)
                return this.getMeridiem(this.date).toUpperCase();
            return '--';
        };
        return UppercaseMeridiem;
    }(DatePart));
    var LowercaseMeridiem = (function (_super) {
        __extends(LowercaseMeridiem, _super);
        function LowercaseMeridiem() {
            _super.apply(this, arguments);
        }
        LowercaseMeridiem.prototype.toString = function () {
            if (this.defined)
                return this.getMeridiem(this.date);
            return '--';
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
return formatBlocks;
}]);