(function(){
var formatBlocks = (function () {
    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var DateChain = (function () {
        function DateChain(date) {
            this.date = new Date(date.valueOf());
        }
        DateChain.prototype.setSeconds = function (seconds) {
            var num;
            if (seconds === 'ZERO_OUT') {
                this.date.setSeconds(0);
                return this;
            }
            else if (typeof seconds === 'string' && /^\d+$/.test(seconds)) {
                num = parseInt(seconds, 10);
            }
            else if (typeof seconds === 'number') {
                num = seconds;
            }
            else {
                this.date = void 0;
                return this;
            }
            if (num < 0 || num > 59) {
                this.date = void 0;
                return this;
            }
            this.date.setSeconds(num);
            return this;
        };
        DateChain.prototype.incSeconds = function () {
            var n = this.date.getSeconds() + 1;
            return this.setSeconds(n > 59 ? 0 : n);
        };
        DateChain.prototype.decSeconds = function () {
            var n = this.date.getSeconds() - 1;
            return this.setSeconds(n < 0 ? 59 : n);
        };
        DateChain.prototype.setMinutes = function (minutes) {
            var num;
            if (minutes === 'ZERO_OUT') {
                this.date.setMinutes(0);
                return this;
            }
            else if (typeof minutes === 'string' && /^\d+$/.test(minutes)) {
                num = parseInt(minutes, 10);
            }
            else if (typeof minutes === 'number') {
                num = minutes;
            }
            else {
                this.date = void 0;
                return this;
            }
            if (num < 0 || num > 59) {
                this.date = void 0;
                return this;
            }
            this.date.setMinutes(num);
            return this;
        };
        DateChain.prototype.incMinutes = function () {
            var n = this.date.getMinutes() + 1;
            return this.setMinutes(n > 59 ? 0 : n);
        };
        DateChain.prototype.decMinutes = function () {
            var n = this.date.getMinutes() - 1;
            return this.setMinutes(n < 0 ? 59 : n);
        };
        DateChain.prototype.setHours = function (hours) {
            var num;
            var meridiem = this.date.getHours() > 11 ? 'PM' : 'AM';
            if (hours === 'ZERO_OUT') {
                this.date.setHours(meridiem === 'AM' ? 0 : 12);
                return this;
            }
            else if (typeof hours === 'string' && /^\d+$/.test(hours)) {
                num = parseInt(hours, 10);
            }
            else if (typeof hours === 'number') {
                num = hours;
            }
            else {
                this.date = void 0;
                return this;
            }
            if (num === 0)
                num = 1;
            if (num < 1 || num > 12) {
                this.date = void 0;
                return this;
            }
            if (num === 12 && meridiem === 'AM') {
                num = 0;
            }
            if (num !== 12 && meridiem === 'PM') {
                num += 12;
            }
            this.date.setHours(num);
            return this;
        };
        DateChain.prototype.incHours = function () {
            var n = this.date.getHours() + 1;
            return this.setHours(n > 23 ? 0 : n);
        };
        DateChain.prototype.decHours = function () {
            var n = this.date.getHours() - 1;
            return this.setHours(n < 0 ? 23 : n);
        };
        DateChain.prototype.setMilitaryHours = function (hours) {
            var num;
            if (hours === 'ZERO_OUT') {
                this.date.setHours(0);
                return this;
            }
            else if (typeof hours === 'string' && /^\d+$/.test(hours)) {
                num = parseInt(hours, 10);
            }
            else if (typeof hours === 'number') {
                num = hours;
            }
            else {
                this.date = void 0;
                return this;
            }
            if (num < 0 || num > 23) {
                this.date = void 0;
                return this;
            }
            if (this.date.getHours() === num + 1) {
                this.date.setHours(num);
                if (this.date.getHours() !== num) {
                    this.date.setHours(num - 1);
                }
            }
            else {
                this.date.setHours(num);
            }
            return this;
        };
        DateChain.prototype.setDate = function (date) {
            var num;
            if (date === 'ZERO_OUT') {
                this.date.setDate(1);
                return this;
            }
            else if (typeof date === 'string' && /\d{1,2}.*$/.test(date)) {
                num = parseInt(date, 10);
            }
            else if (typeof date === 'number') {
                num = date;
            }
            else {
                this.date = void 0;
                return this;
            }
            if (num === 0)
                num = 1;
            if (num < 1 || num > this.daysInMonth()) {
                this.date = void 0;
                return this;
            }
            this.date.setDate(num);
            return this;
        };
        DateChain.prototype.incDate = function () {
            var n = this.date.getDate() + 1;
            return this.setDate(n > this.daysInMonth() ? 1 : n);
        };
        DateChain.prototype.decDate = function () {
            var n = this.date.getDate() - 1;
            return this.setDate(n < 0 ? this.daysInMonth() : n);
        };
        DateChain.prototype.setDay = function (day) {
            var num;
            if (day === 'ZERO_OUT') {
                return this.setDay(0);
            }
            else if (typeof day === 'number') {
                num = day;
            }
            else if (typeof day === 'string' && dayNames.some(function (dayName) {
                if (new RegExp("^" + day + ".*$", 'i').test(dayName)) {
                    num = dayNames.indexOf(dayName);
                    return true;
                }
            })) {
            }
            else {
                this.date = void 0;
                return this;
            }
            if (num < 0 || num > 6) {
                this.date = void 0;
                return this;
            }
            var offset = this.date.getDay() - num;
            this.date.setDate(this.date.getDate() - offset);
            return this;
        };
        DateChain.prototype.incDay = function () {
            var n = this.date.getDay() + 1;
            return this.setDay(n > 6 ? 0 : n);
        };
        DateChain.prototype.decDay = function () {
            var n = this.date.getDay() - 1;
            return this.setDay(n < 0 ? 6 : n);
        };
        DateChain.prototype.setMonth = function (month) {
            var num;
            if (month === 'ZERO_OUT') {
                this.date.setMonth(0);
                return this;
            }
            else if (typeof month === 'string' && /^\d+$/.test(month)) {
                num = parseInt(month, 10);
            }
            else if (typeof month === 'number') {
                num = month;
            }
            else {
                this.date = void 0;
                return this;
            }
            if (num === 0)
                num = 1;
            if (num < 1 || num > 12) {
                this.date = void 0;
                return this;
            }
            this.date.setMonth(num - 1);
            return this;
        };
        DateChain.prototype.incMonth = function () {
            var n = this.date.getMonth() + 2;
            return this.setDay(n > 12 ? 1 : n);
        };
        DateChain.prototype.decMonth = function () {
            var n = this.date.getMonth();
            return this.setDay(n < 1 ? 12 : n);
        };
        DateChain.prototype.setMonthString = function (month) {
            var num;
            if (month === 'ZERO_OUT') {
                this.date.setMonth(0);
                return this;
            }
            else if (typeof month === 'string' && monthNames.some(function (monthName) {
                if (new RegExp("^" + month + ".*$", 'i').test(monthName)) {
                    num = monthNames.indexOf(monthName) + 1;
                    return true;
                }
            })) {
            }
            else {
                this.date = void 0;
                return this;
            }
            if (num < 1 || num > 12) {
                this.date = void 0;
                return this;
            }
            this.date.setMonth(num - 1);
            return this;
        };
        DateChain.prototype.setYear = function (year) {
            var num;
            if (year === 'ZERO_OUT') {
                this.date.setFullYear(0);
                return this;
            }
            else if (typeof year === 'string' && /^\d+$/.test(year)) {
                num = parseInt(year, 10);
            }
            else if (typeof year === 'number') {
                num = year;
            }
            else {
                this.date = void 0;
                return this;
            }
            this.date.setFullYear(num);
            return this;
        };
        DateChain.prototype.setTwoDigitYear = function (year) {
            var base = Math.floor(this.date.getFullYear() / 100) * 100;
            var num;
            if (year === 'ZERO_OUT') {
                this.date.setFullYear(base);
                return this;
            }
            else if (typeof year === 'string' && /^\d+$/.test(year)) {
                num = parseInt(year, 10);
            }
            else if (typeof year === 'number') {
                num = year;
            }
            else {
                this.date = void 0;
                return this;
            }
            this.date.setFullYear(base + num);
            return this;
        };
        DateChain.prototype.setUnixSecondTimestamp = function (seconds) {
            var num;
            if (seconds === 'ZERO_OUT') {
                this.date = new Date(0);
                return this;
            }
            else if (typeof seconds === 'string' && /^\d+$/.test(seconds)) {
                num = parseInt(seconds, 10);
            }
            else if (typeof seconds === 'number') {
                num = seconds;
            }
            else {
                this.date = void 0;
                return this;
            }
            this.date = new Date(num * 1000);
            return this;
        };
        DateChain.prototype.setUnixMillisecondTimestamp = function (milliseconds) {
            var num;
            if (milliseconds === 'ZERO_OUT') {
                this.date = new Date(0);
                return this;
            }
            else if (typeof milliseconds === 'string' && /^\d+$/.test(milliseconds)) {
                num = parseInt(milliseconds, 10);
            }
            else if (typeof milliseconds === 'number') {
                num = milliseconds;
            }
            else {
                this.date = void 0;
                return this;
            }
            this.date = new Date(num);
            return this;
        };
        DateChain.prototype.setMeridiem = function (meridiem) {
            var hours = this.date.getHours();
            if (meridiem === 'ZERO_OUT')
                return this;
            if (typeof meridiem === 'string' && /^am?$/i.test(meridiem)) {
                hours -= 12;
            }
            else if (typeof meridiem === 'string' && /^pm?$/i.test(meridiem)) {
                hours += 12;
            }
            else {
                this.date = void 0;
                return this;
            }
            if (hours < 0 || hours > 23) {
                return this;
            }
            this.date.setHours(hours);
            return this;
        };
        DateChain.prototype.incMeridiem = function () {
            var n = this.date.getHours() + 12;
            return this.setHours(n > 23 ? n - 24 : n);
        };
        DateChain.prototype.decMeridiem = function () {
            var n = this.date.getHours() - 12;
            return this.setHours(n < 0 ? n + 24 : n);
        };
        DateChain.prototype.daysInMonth = function () {
            return new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0).getDate();
        };
        DateChain.prototype.maxMonthStringBuffer = function () {
            var m = this.date.getMonth();
            if (m === 0)
                return 2; // Jan
            if (m === 1)
                return 1; // Feb
            if (m === 2)
                return 3; // Mar
            if (m === 3)
                return 2; // Apr
            if (m === 4)
                return 3; // May
            if (m === 5)
                return 3; // Jun
            if (m === 6)
                return 3; // Jul
            if (m === 7)
                return 2; // Aug
            if (m === 8)
                return 1; // Sep
            if (m === 9)
                return 1; // Oct
            if (m === 10)
                return 1; // Nov
            return 1; // Dec
        };
        DateChain.prototype.maxMonthBuffer = function () {
            return this.date.getMonth() > 0 ? 1 : 2;
        };
        DateChain.prototype.maxDateBuffer = function () {
            return this.date.getDate() * 10 > this.daysInMonth() ? 1 : 2;
        };
        DateChain.prototype.maxDayStringBuffer = function () {
            return this.date.getDay() % 2 == 0 ? 2 : 1;
        };
        DateChain.prototype.maxMilitaryHoursBuffer = function () {
            return this.date.getHours() > 2 ? 1 : 2;
        };
        DateChain.prototype.maxHoursBuffer = function () {
            if (this.date.getHours() > 11) {
                return this.date.getHours() > 13 ? 1 : 2;
            }
            else {
                return this.date.getHours() > 1 ? 1 : 2;
            }
        };
        DateChain.prototype.maxMinutesBuffer = function () {
            return this.date.getMinutes() > 5 ? 1 : 2;
        };
        DateChain.prototype.maxSecondsBuffer = function () {
            return this.date.getSeconds() > 5 ? 1 : 2;
        };
        return DateChain;
    })();
    function chain(d) {
        return new DateChain(d);
    }
    function getUTCOffset(date, showColon) {
        var tzo = -date.getTimezoneOffset();
        var dif = tzo >= 0 ? '+' : '-';
        var colon = showColon ? ':' : '';
        return dif + pad(tzo / 60, 2) + colon + pad(tzo % 60, 2);
    }
    function pad(num, length) {
        var padded = Math.abs(num).toString();
        while (padded.length < length)
            padded = '0' + padded;
        return padded;
    }
    function appendOrdinal(num) {
        var j = num % 10;
        var k = num % 100;
        if (j == 1 && k != 11)
            return num + "st";
        if (j == 2 && k != 12)
            return num + "nd";
        if (j == 3 && k != 13)
            return num + "rd";
        return num + "th";
    }
    function toStandardTime(hours) {
        if (hours === 0)
            return 12;
        return hours > 12 ? hours - 12 : hours;
    }
    return [
        {
            code: 'YYYY',
            regExp: '\\d{4,4}',
            str: function (d) { return d.getFullYear().toString(); },
            inc: function (d) { return chain(d).setYear(d.getFullYear() + 1).date; },
            dec: function (d) { return chain(d).setYear(d.getFullYear() - 1).date; },
            set: function (d, v) { return chain(d).setYear(v).date; },
            maxBuffer: function (d) { return 4; }
        },
        {
            code: 'YY',
            regExp: '\\d{2,2}',
            str: function (d) { return d.getFullYear().toString().slice(-2); },
            inc: function (d) { return chain(d).setYear(d.getFullYear() + 1).date; },
            dec: function (d) { return chain(d).setYear(d.getFullYear() - 1).date; },
            set: function (d, v) { return chain(d).setTwoDigitYear(v).date; },
            maxBuffer: function (d) { return 2; }
        },
        {
            code: 'MMMM',
            regExp: "((" + monthNames.join(')|(') + "))",
            str: function (d) { return monthNames[d.getMonth()]; },
            inc: function (d) { return chain(d).incMonth().date; },
            dec: function (d) { return chain(d).decMonth().date; },
            set: function (d, v) { return chain(d).setMonthString(v).date; },
            maxBuffer: function (d) { return chain(d).maxMonthStringBuffer(); }
        },
        {
            code: 'MMM',
            regExp: "((" + monthNames.map(function (v) { return v.slice(0, 3); }).join(')|(') + "))",
            str: function (d) { return monthNames[d.getMonth()].slice(0, 3); },
            inc: function (d) { return chain(d).incMonth().date; },
            dec: function (d) { return chain(d).decMonth().date; },
            set: function (d, v) { return chain(d).setMonthString(v).date; },
            maxBuffer: function (d) { return chain(d).maxMonthStringBuffer(); }
        },
        {
            code: 'MM',
            regExp: '\\d{2,2}',
            str: function (d) { return pad(d.getMonth() + 1, 2); },
            inc: function (d) { return chain(d).incMonth().date; },
            dec: function (d) { return chain(d).decMonth().date; },
            set: function (d, v) { return chain(d).setMonth(v).date; },
            maxBuffer: function (d) { return chain(d).maxMonthBuffer(); }
        },
        {
            code: 'M',
            regExp: '\\d{1,2}',
            str: function (d) { return (d.getMonth() + 1).toString(); },
            inc: function (d) { return chain(d).incMonth().date; },
            dec: function (d) { return chain(d).decMonth().date; },
            set: function (d, v) { return chain(d).setMonth(v).date; },
            maxBuffer: function (d) { return chain(d).maxMonthBuffer(); }
        },
        {
            code: 'DD',
            regExp: '\\d{2,2}',
            str: function (d) { return pad(d.getDate(), 2); },
            inc: function (d) { return chain(d).incDate().date; },
            dec: function (d) { return chain(d).decDate().date; },
            set: function (d, v) { return chain(d).setDate(v).date; },
            maxBuffer: function (d) { return chain(d).maxDateBuffer(); }
        },
        {
            code: 'Do',
            regExp: '\\d{1,2}((th)|(nd)|(rd)|(st))',
            str: function (d) { return appendOrdinal(d.getDate()); },
            inc: function (d) { return chain(d).incDate().date; },
            dec: function (d) { return chain(d).decDate().date; },
            set: function (d, v) { return chain(d).setDate(v).date; },
            maxBuffer: function (d) { return chain(d).maxDateBuffer(); }
        },
        {
            code: 'D',
            regExp: '\\d{1,2}',
            str: function (d) { return d.getDate().toString(); },
            inc: function (d) { return chain(d).incDate().date; },
            dec: function (d) { return chain(d).decDate().date; },
            set: function (d, v) { return chain(d).setDate(v).date; },
            maxBuffer: function (d) { return chain(d).maxDateBuffer(); }
        },
        {
            code: 'dddd',
            regExp: "((" + dayNames.join(')|(') + "))",
            str: function (d) { return dayNames[d.getDay()]; },
            inc: function (d) { return chain(d).incDay().date; },
            dec: function (d) { return chain(d).decDay().date; },
            set: function (d, v) { return chain(d).setDay(v).date; },
            maxBuffer: function (d) { return chain(d).maxDayStringBuffer(); }
        },
        {
            code: 'ddd',
            regExp: "((" + dayNames.map(function (v) { return v.slice(0, 3); }).join(')|(') + "))",
            str: function (d) { return dayNames[d.getDay()].slice(0, 3); },
            inc: function (d) { return chain(d).incDay().date; },
            dec: function (d) { return chain(d).decDay().date; },
            set: function (d, v) { return chain(d).setDay(v).date; },
            maxBuffer: function (d) { return chain(d).maxDayStringBuffer(); }
        },
        {
            code: 'X',
            regExp: '\\d{1,}',
            str: function (d) { return Math.floor(d.valueOf() / 1000).toString(); },
            inc: function (d) { return new Date(d.valueOf() + 1000); },
            dec: function (d) { return new Date(d.valueOf() - 1000); },
            set: function (d, v) { return chain(d).setUnixSecondTimestamp(v).date; }
        },
        {
            code: 'x',
            regExp: '\\d{1,}',
            str: function (d) { return d.valueOf().toString(); },
            inc: function (d) { return new Date(d.valueOf() + 1); },
            dec: function (d) { return new Date(d.valueOf() - 1); },
            set: function (d, v) { return chain(d).setUnixMillisecondTimestamp(v).date; }
        },
        {
            code: 'HH',
            regExp: '\\d{2,2}',
            str: function (d) { return pad(d.getHours(), 2); },
            inc: function (d) { return chain(d).incHours().date; },
            dec: function (d) { return chain(d).decHours().date; },
            set: function (d, v) { return chain(d).setMilitaryHours(v).date; },
            maxBuffer: function (d) { return chain(d).maxMilitaryHoursBuffer(); }
        },
        {
            code: 'H',
            regExp: '\\d{1,2}',
            str: function (d) { return d.getHours().toString(); },
            inc: function (d) { return chain(d).incHours().date; },
            dec: function (d) { return chain(d).decHours().date; },
            set: function (d, v) { return chain(d).setMilitaryHours(v).date; },
            maxBuffer: function (d) { return chain(d).maxMilitaryHoursBuffer(); }
        },
        {
            code: 'hh',
            regExp: '\\d{2,2}',
            str: function (d) { return pad(toStandardTime(d.getHours()), 2); },
            inc: function (d) { return chain(d).incHours().date; },
            dec: function (d) { return chain(d).decHours().date; },
            set: function (d, v) { return chain(d).setHours(v).date; },
            maxBuffer: function (d) { return chain(d).maxHoursBuffer(); }
        },
        {
            code: 'h',
            regExp: '\\d{1,2}',
            str: function (d) { return toStandardTime(d.getHours()).toString(); },
            inc: function (d) { return chain(d).incHours().date; },
            dec: function (d) { return chain(d).decHours().date; },
            set: function (d, v) { return chain(d).setHours(v).date; },
            maxBuffer: function (d) { return chain(d).maxHoursBuffer(); }
        },
        {
            code: 'A',
            regExp: '((AM)|(PM))',
            str: function (d) { return d.getHours() < 12 ? 'AM' : 'PM'; },
            inc: function (d) { return chain(d).incMeridiem().date; },
            dec: function (d) { return chain(d).decMeridiem().date; },
            set: function (d, v) { return chain(d).setMeridiem(v).date; },
            maxBuffer: function (d) { return 1; }
        },
        {
            code: 'a',
            regExp: '((am)|(pm))',
            str: function (d) { return d.getHours() < 12 ? 'am' : 'pm'; },
            inc: function (d) { return chain(d).incMeridiem().date; },
            dec: function (d) { return chain(d).decMeridiem().date; },
            set: function (d, v) { return chain(d).setMeridiem(v).date; },
            maxBuffer: function (d) { return 1; }
        },
        {
            code: 'mm',
            regExp: '\\d{2,2}',
            str: function (d) { return pad(d.getMinutes(), 2); },
            inc: function (d) { return chain(d).incMinutes().date; },
            dec: function (d) { return chain(d).decMinutes().date; },
            set: function (d, v) { return chain(d).setMinutes(v).date; },
            maxBuffer: function (d) { return chain(d).maxMinutesBuffer(); }
        },
        {
            code: 'm',
            regExp: '\\d{1,2}',
            str: function (d) { return d.getMinutes().toString(); },
            inc: function (d) { return chain(d).incMinutes().date; },
            dec: function (d) { return chain(d).decMinutes().date; },
            set: function (d, v) { return chain(d).setMinutes(v).date; },
            maxBuffer: function (d) { return chain(d).maxMinutesBuffer(); }
        },
        {
            code: 'ss',
            regExp: '\\d{2,2}',
            str: function (d) { return pad(d.getSeconds(), 2); },
            inc: function (d) { return chain(d).incSeconds().date; },
            dec: function (d) { return chain(d).decSeconds().date; },
            set: function (d, v) { return chain(d).setSeconds(v).date; },
            maxBuffer: function (d) { return chain(d).maxSecondsBuffer(); }
        },
        {
            code: 's',
            regExp: '\\d{1,2}',
            str: function (d) { return d.getSeconds().toString(); },
            inc: function (d) { return chain(d).incSeconds().date; },
            dec: function (d) { return chain(d).decSeconds().date; },
            set: function (d, v) { return chain(d).setSeconds(v).date; },
            maxBuffer: function (d) { return chain(d).maxSecondsBuffer(); }
        },
        {
            code: 'ZZ',
            regExp: '(\\+|\\-)\\d{2,2}:\\d{2,2}',
            str: function (d) { return getUTCOffset(d, true); } //TODO add ability to inc and dec this
        },
        {
            code: 'Z',
            regExp: '(\\+|\\-)\\d{4,4}',
            str: function (d) { return getUTCOffset(d, false); }
        }
    ];
})();
/// <reference path="FormatBlocks.ts" />
var DatePart = (function () {
    function DatePart(arg, selectableOverride) {
        if (typeof arg === 'object') {
            this.str = arg.str;
            this.inc = arg.inc;
            this.dec = arg.dec;
            this.set = arg.set;
            this.maxBuffer = arg.maxBuffer;
            this.regExpString = arg.regExp;
            this.selectable = this.inc !== void 0 && this.dec !== void 0;
        }
        else {
            this.value = arg;
            this.regExpString = this.regExpEscape(this.value);
            this.selectable = false;
        }
        if (typeof selectableOverride === 'boolean') {
            this.selectable = selectableOverride;
        }
    }
    DatePart.prototype.regExpEscape = function (str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    };
    DatePart.prototype.increment = function (d) {
        return this.inc(d);
    };
    DatePart.prototype.decrement = function (d) {
        return this.dec(d);
    };
    DatePart.prototype.setValue = function (d) {
        if (this.str === void 0)
            return this;
        this.value = this.str(d);
        return this;
    };
    DatePart.prototype.toString = function () {
        return this.value;
    };
    DatePart.prototype.isSelectable = function () {
        return this.selectable;
    };
    DatePart.prototype.getRegExpString = function () {
        return this.regExpString;
    };
    DatePart.prototype.getDateFromString = function (date, partial) {
        return this.set(date, partial);
    };
    DatePart.prototype.getMaxBufferSize = function (date) {
        if (this.maxBuffer === void 0)
            return void 0;
        return this.maxBuffer(date);
    };
    return DatePart;
})();
var OptionSanitizer = (function () {
    var sanitizeElement = function (element) {
        if (element === void 0)
            throw 'DATIUM: "element" option is required';
        console.log('oh yeah aha');
        return element;
    };
    return (function () {
        function class_1() {
        }
        class_1.sanitize = function (opts) {
            return {
                element: sanitizeElement(opts.element)
            };
        };
        return class_1;
    })();
})();
/// <reference path="FormatBlocks.ts" />
/// <reference path="DatePart.ts" />
var DisplayParser = (function () {
    function DisplayParser() {
    }
    DisplayParser.parse = function (format) {
        var _this = this;
        var index = 0;
        var inEscapedSegment = false;
        var dateParts = [];
        var textBuffer = '';
        var pushPlainText = function () {
            if (textBuffer.length > 0) {
                dateParts.push(new DatePart(textBuffer));
                textBuffer = '';
            }
        };
        var increment;
        while (index < format.length) {
            if (!inEscapedSegment && format[index] === '[') {
                inEscapedSegment = true;
                index++;
                continue;
            }
            else if (inEscapedSegment && format[index] === ']') {
                inEscapedSegment = false;
                index++;
                continue;
            }
            else if (inEscapedSegment) {
                textBuffer += format[index];
                index++;
                continue;
            }
            else if (formatBlocks.some(function (block) {
                if (_this.findAt(format, index, "{" + block.code + "}")) {
                    pushPlainText();
                    dateParts.push(new DatePart(block, false));
                    increment = block.code.length + 2;
                    return true;
                }
                else if (_this.findAt(format, index, block.code)) {
                    pushPlainText();
                    dateParts.push(new DatePart(block));
                    increment = block.code.length;
                    return true;
                }
            })) {
                index += increment;
            }
            else {
                textBuffer += format[index];
                index++;
            }
        }
        pushPlainText();
        return dateParts;
    };
    DisplayParser.findAt = function (str, index, search) {
        return str.slice(index, index + search.length) === search;
    };
    return DisplayParser;
})();
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZvcm1hdEJsb2Nrcy50cyIsIkRhdGVQYXJ0LnRzIiwiT3B0aW9uU2FuaXRpemVyLnRzIiwiRGlzcGxheVBhcnNlci50cyJdLCJuYW1lcyI6WyJEYXRlQ2hhaW4iLCJEYXRlQ2hhaW4uY29uc3RydWN0b3IiLCJEYXRlQ2hhaW4uc2V0U2Vjb25kcyIsIkRhdGVDaGFpbi5pbmNTZWNvbmRzIiwiRGF0ZUNoYWluLmRlY1NlY29uZHMiLCJEYXRlQ2hhaW4uc2V0TWludXRlcyIsIkRhdGVDaGFpbi5pbmNNaW51dGVzIiwiRGF0ZUNoYWluLmRlY01pbnV0ZXMiLCJEYXRlQ2hhaW4uc2V0SG91cnMiLCJEYXRlQ2hhaW4uaW5jSG91cnMiLCJEYXRlQ2hhaW4uZGVjSG91cnMiLCJEYXRlQ2hhaW4uc2V0TWlsaXRhcnlIb3VycyIsIkRhdGVDaGFpbi5zZXREYXRlIiwiRGF0ZUNoYWluLmluY0RhdGUiLCJEYXRlQ2hhaW4uZGVjRGF0ZSIsIkRhdGVDaGFpbi5zZXREYXkiLCJEYXRlQ2hhaW4uaW5jRGF5IiwiRGF0ZUNoYWluLmRlY0RheSIsIkRhdGVDaGFpbi5zZXRNb250aCIsIkRhdGVDaGFpbi5pbmNNb250aCIsIkRhdGVDaGFpbi5kZWNNb250aCIsIkRhdGVDaGFpbi5zZXRNb250aFN0cmluZyIsIkRhdGVDaGFpbi5zZXRZZWFyIiwiRGF0ZUNoYWluLnNldFR3b0RpZ2l0WWVhciIsIkRhdGVDaGFpbi5zZXRVbml4U2Vjb25kVGltZXN0YW1wIiwiRGF0ZUNoYWluLnNldFVuaXhNaWxsaXNlY29uZFRpbWVzdGFtcCIsIkRhdGVDaGFpbi5zZXRNZXJpZGllbSIsIkRhdGVDaGFpbi5pbmNNZXJpZGllbSIsIkRhdGVDaGFpbi5kZWNNZXJpZGllbSIsIkRhdGVDaGFpbi5kYXlzSW5Nb250aCIsIkRhdGVDaGFpbi5tYXhNb250aFN0cmluZ0J1ZmZlciIsIkRhdGVDaGFpbi5tYXhNb250aEJ1ZmZlciIsIkRhdGVDaGFpbi5tYXhEYXRlQnVmZmVyIiwiRGF0ZUNoYWluLm1heERheVN0cmluZ0J1ZmZlciIsIkRhdGVDaGFpbi5tYXhNaWxpdGFyeUhvdXJzQnVmZmVyIiwiRGF0ZUNoYWluLm1heEhvdXJzQnVmZmVyIiwiRGF0ZUNoYWluLm1heE1pbnV0ZXNCdWZmZXIiLCJEYXRlQ2hhaW4ubWF4U2Vjb25kc0J1ZmZlciIsImNoYWluIiwiZ2V0VVRDT2Zmc2V0IiwicGFkIiwiYXBwZW5kT3JkaW5hbCIsInRvU3RhbmRhcmRUaW1lIiwiRGF0ZVBhcnQiLCJEYXRlUGFydC5jb25zdHJ1Y3RvciIsIkRhdGVQYXJ0LnJlZ0V4cEVzY2FwZSIsIkRhdGVQYXJ0LmluY3JlbWVudCIsIkRhdGVQYXJ0LmRlY3JlbWVudCIsIkRhdGVQYXJ0LnNldFZhbHVlIiwiRGF0ZVBhcnQudG9TdHJpbmciLCJEYXRlUGFydC5pc1NlbGVjdGFibGUiLCJEYXRlUGFydC5nZXRSZWdFeHBTdHJpbmciLCJEYXRlUGFydC5nZXREYXRlRnJvbVN0cmluZyIsIkRhdGVQYXJ0LmdldE1heEJ1ZmZlclNpemUiLCJjb25zdHJ1Y3RvciIsInNhbml0aXplIiwiRGlzcGxheVBhcnNlciIsIkRpc3BsYXlQYXJzZXIuY29uc3RydWN0b3IiLCJEaXNwbGF5UGFyc2VyLnBhcnNlIiwiRGlzcGxheVBhcnNlci5maW5kQXQiXSwibWFwcGluZ3MiOiJBQVdBLElBQUksWUFBWSxHQUFrQixDQUFDO0lBRS9CLElBQU0sVUFBVSxHQUFZLENBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUN2SixJQUFNLFFBQVEsR0FBWSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBRXpHO1FBRUlBLG1CQUFZQSxJQUFTQTtZQUNqQkMsSUFBSUEsQ0FBQ0EsSUFBSUEs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QUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO1FBQzNDQSxDQUFDQTtRQUVNUCw0QkFBUUEsR0FBZkEsVUFBZ0JBLEtBQW1CQTtZQUMvQlEsSUFBSUEsR0FBVUEsQ0FBQ0E7WUFDZkEsSUFBSUEsUUFBUUEsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0E7WUFFdkRBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLEtBQUtBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBO2dCQUN2QkEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsUUFBUUEsS0FBS0EsSUFBSUEsR0FBR0EsQ0FBQ0EsR0FBR0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7Z0JBQy9DQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtZQUNoQkEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsS0FBS0EsS0FBS0EsUUFBUUEsSUFBSUEsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzFEQSxHQUFHQSxHQUFHQSxRQUFRQSxDQUFTQSxLQUFLQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtZQUN0Q0EsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsS0FBS0EsS0FBS0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ25DQSxHQUFHQSxHQUFHQSxLQUFLQSxDQUFDQTtZQUNoQkEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ0pBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLEtBQUtBLENBQUNBLENBQUNBO2dCQUNuQkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7WUFDaEJBLENBQUNBO1lBQ0RBLEVBQUVBLENBQUNBLENBQUNBLEdBQUdBLEtBQUtBLENBQUNBLENBQUNBO2dCQUFDQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQTtZQUN2QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsR0FBR0EsQ0FBQ0EsSUFBSUEsR0FBR0EsR0FBR0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3RCQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDbkJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1lBQ2hCQSxDQUFDQTtZQUVEQSxFQUFFQSxDQUFDQSxDQUFDQSxHQUFHQSxLQUFLQSxFQUFFQSxJQUFJQSxRQUFRQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDbENBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBO1lBQ1pBLENBQUNBO1lBQ0RBLEVBQUVBLENBQUNBLENBQUNBLEdBQUdBLEtBQUtBLEVBQUVBLElBQUlBLFFBQVFBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO2dCQUNsQ0EsR0FBR0EsSUFBSUEsRUFBRUEsQ0FBQ0E7WUFDZEEsQ0FBQ0E7WUFDREEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFDeEJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2hCQSxDQUFDQTtRQUVNUiw0QkFBUUEsR0FBZkE7WUFDSVMsSUFBSUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFDakNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO1FBQ3pDQSxDQUFDQTtRQUVNVCw0QkFBUUEsR0FBZkE7WUFDSVUsSUFBSUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsRUFBRUEs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LENBQUNBO1lBQ2hCQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFDSkEsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ25CQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtZQUNoQkEsQ0FBQ0E7WUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0EsSUFBSUEsS0FBS0EsR0FBR0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzFCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtZQUNoQkEsQ0FBQ0E7WUFDREEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7WUFDMUJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2hCQSxDQUFDQTtRQUVNMUIsK0JBQVdBLEdBQWxCQTtZQUNJMkIsSUFBSUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsRUFBRUEsR0FBR0EsRUFBRUEsQ0FBQ0E7WUFDbENBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO1FBQzlDQSxDQUFDQTtRQUVNM0IsK0JBQVdBLEdBQWxCQTtZQUNJNEIsSUFBSUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsRUFBRUEsR0FBR0EsRUFBRUEsQ0FBQ0E7WUFDbENBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO1FBQzdDQSxDQUFDQTtRQUVPNUIsK0JBQVdBLEdBQW5CQTtZQUNJNkIsTUFBTUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsRUFBRUEsRUFBRUEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsRUFBRUEsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0E7UUFDcEZBLENBQUNBO1FBRU03Qix3Q0FBb0JBLEdBQTNCQTtZQUNJOEIsSUFBSUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0E7WUFDN0JBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO2dCQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQTtZQUM3QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7Z0JBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BO1lBQzdCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUE7WUFDN0JBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO2dCQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQTtZQUM3QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7Z0JBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BO1lBQzdCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUE7WUFDN0JBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO2dCQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQTtZQUM3QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7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QUFLQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDN0NBLGdCQUFnQkEsR0FBR0EsSUFBSUEsQ0FBQ0E7Z0JBQ3hCQSxLQUFLQSxFQUFFQSxDQUFDQTtnQkFDUkEsUUFBUUEsQ0FBQ0E7WUFDYkEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQWdCQSxJQUFJQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDbkRBLGdCQUFnQkEsR0FBR0EsS0FBS0EsQ0FBQ0E7Z0JBQ3pCQSxLQUFLQSxFQUFFQSxDQUFDQTtnQkFDUkEsUUFBUUEsQ0FBQ0E7WUFDYkEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDMUJBLFVBQVVBLElBQUlBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO2dCQUM1QkEsS0FBS0EsRUFBRUEsQ0FBQ0E7Z0JBQ1JBLFFBQVFBLENBQUNBO1lBQ2JBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLFVBQUNBLEtBQWtCQTtnQkFDNUNBLEVBQUVBLENBQUNBLENBQUNBLEtBQUlBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLEVBQUVBLEtBQUtBLEVBQUVBLE1BQUlBLEtBQUtBLENBQUNBLElBQUlBLE1BQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO29CQUNoREEsYUFBYUEsRUFBRUEsQ0FBQ0E7b0JBQ2hCQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxRQUFRQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDM0NBLFNBQVNBLEdBQUdBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBO29CQUNsQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7Z0JBQ2hCQSxDQUFDQTtnQkFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsRUFBRUEsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ2hEQSxhQUFhQSxFQUFFQSxDQUFDQTtvQkFDaEJBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFFBQVFBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO29CQUNwQ0EsU0FBU0EsR0FBR0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7b0JBQzlCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtnQkFDaEJBLENBQUNBO1lBQ0xBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUNEQSxLQUFLQSxJQUFJQSxTQUFTQSxDQUFDQTtZQUN2QkEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ0pBLFVBQVVBLElBQUlBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO2dCQUM1QkEsS0FBS0EsRUFBRUEsQ0FBQ0E7WUFDWkEsQ0FBQ0E7UUFDTEEsQ0FBQ0E7UUFFREEsYUFBYUEsRUFBRUEsQ0FBQ0E7UUFFaEJBLE1BQU1BLENBQUNBLFNBQVNBLENBQUNBO0lBQ3JCQSxDQUFDQTtJQUVjRixvQkFBTUEsR0FBckJBLFVBQXNCQSxHQUFVQSxFQUFFQSxLQUFZQSxFQUFFQSxNQUFhQTtRQUN6REcsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsR0FBR0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsTUFBTUEsQ0FBQ0E7SUFDOURBLENBQUNBO0lBQ0xILG9CQUFDQTtBQUFEQSxDQTFEQSxBQTBEQ0EsSUFBQSIsImZpbGUiOiJkYXRpdW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbnRlcmZhY2UgSUZvcm1hdEJsb2NrIHtcclxuICAgIGNvZGU6c3RyaW5nO1xyXG4gICAgc3RyKGQ6RGF0ZSk6c3RyaW5nO1xyXG4gICAgcmVnRXhwPzpzdHJpbmc7XHJcbiAgICAvLyBsZWF2aW5nIGluYywgZGVjIGFuZCBzZXQgdW5zZXQgd2lsbCBtYWtlIHRoZSBibG9jayB1bnNlbGVjdGFibGVcclxuICAgIGluYz8oZDpEYXRlKTpEYXRlO1xyXG4gICAgZGVjPyhkOkRhdGUpOkRhdGU7XHJcbiAgICBzZXQ/KGQ6RGF0ZSwgdjpzdHJpbmd8bnVtYmVyKTpEYXRlO1xyXG4gICAgbWF4QnVmZmVyPyhkOkRhdGUpOm51bWJlcjtcclxufVxyXG5cclxubGV0IGZvcm1hdEJsb2NrczpJRm9ybWF0QmxvY2tbXSA9IChmdW5jdGlvbigpIHtcclxuICAgIFxyXG4gICAgY29uc3QgbW9udGhOYW1lczpzdHJpbmdbXSA9IFsnSmFudWFyeScsICdGZWJydWFyeScsICdNYXJjaCcsICdBcHJpbCcsICdNYXknLCAnSnVuZScsICdKdWx5JywgJ0F1Z3VzdCcsICdTZXB0ZW1iZXInLCAnT2N0b2JlcicsICdOb3ZlbWJlcicsICdEZWNlbWJlciddO1xyXG4gICAgY29uc3QgZGF5TmFtZXM6c3RyaW5nW10gPSBbJ1N1bmRheScsICdNb25kYXknLCAnVHVlc2RheScsICdXZWRuZXNkYXknLCAnVGh1cnNkYXknLCAnRnJpZGF5JywgJ1NhdHVyZGF5J107XHJcblxyXG4gICAgY2xhc3MgRGF0ZUNoYWluIHtcclxuICAgICAgICBwdWJsaWMgZGF0ZTpEYXRlO1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKGRhdGU6RGF0ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZShkYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRTZWNvbmRzKHNlY29uZHM6c3RyaW5nfG51bWJlcik6RGF0ZUNoYWluIHtcclxuICAgICAgICAgICAgbGV0IG51bTpudW1iZXI7XHJcbiAgICAgICAgICAgIGlmIChzZWNvbmRzID09PSAnWkVST19PVVQnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0U2Vjb25kcygwKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBzZWNvbmRzID09PSAnc3RyaW5nJyAmJiAvXlxcZCskLy50ZXN0KHNlY29uZHMpKSB7XHJcbiAgICAgICAgICAgICAgICBudW0gPSBwYXJzZUludCg8c3RyaW5nPnNlY29uZHMsIDEwKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygc2Vjb25kcyA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICAgICAgICAgIG51bSA9IHNlY29uZHM7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobnVtIDwgMCB8fCBudW0gPiA1OSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gdm9pZCAwO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5kYXRlLnNldFNlY29uZHMobnVtKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBpbmNTZWNvbmRzKCk6RGF0ZUNoYWluIHtcclxuICAgICAgICAgICAgbGV0IG4gPSB0aGlzLmRhdGUuZ2V0U2Vjb25kcygpICsgMTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0U2Vjb25kcyhuID4gNTkgPyAwIDogbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBkZWNTZWNvbmRzKCk6RGF0ZUNoYWluIHtcclxuICAgICAgICAgICAgbGV0IG4gPSB0aGlzLmRhdGUuZ2V0U2Vjb25kcygpIC0gMTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0U2Vjb25kcyhuIDwgMCA/IDU5IDogbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRNaW51dGVzKG1pbnV0ZXM6c3RyaW5nfG51bWJlcik6RGF0ZUNoYWluIHtcclxuICAgICAgICAgICAgbGV0IG51bTpudW1iZXI7XHJcbiAgICAgICAgICAgIGlmIChtaW51dGVzID09PSAnWkVST19PVVQnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0TWludXRlcygwKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBtaW51dGVzID09PSAnc3RyaW5nJyAmJiAvXlxcZCskLy50ZXN0KG1pbnV0ZXMpKSB7XHJcbiAgICAgICAgICAgICAgICBudW0gPSBwYXJzZUludCg8c3RyaW5nPm1pbnV0ZXMsIDEwKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbWludXRlcyA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICAgICAgICAgIG51bSA9IG1pbnV0ZXM7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobnVtIDwgMCB8fCBudW0gPiA1OSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gdm9pZCAwO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1pbnV0ZXMobnVtKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBpbmNNaW51dGVzKCk6RGF0ZUNoYWluIHtcclxuICAgICAgICAgICAgbGV0IG4gPSB0aGlzLmRhdGUuZ2V0TWludXRlcygpICsgMTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0TWludXRlcyhuID4gNTkgPyAwIDogbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBkZWNNaW51dGVzKCk6RGF0ZUNoYWluIHtcclxuICAgICAgICAgICAgbGV0IG4gPSB0aGlzLmRhdGUuZ2V0TWludXRlcygpIC0gMTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0TWludXRlcyhuIDwgMCA/IDU5IDogbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRIb3Vycyhob3VyczpzdHJpbmd8bnVtYmVyKTpEYXRlQ2hhaW4ge1xyXG4gICAgICAgICAgICBsZXQgbnVtOm51bWJlcjtcclxuICAgICAgICAgICAgbGV0IG1lcmlkaWVtID0gdGhpcy5kYXRlLmdldEhvdXJzKCkgPiAxMSA/ICdQTScgOiAnQU0nO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKGhvdXJzID09PSAnWkVST19PVVQnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnMobWVyaWRpZW0gPT09ICdBTScgPyAwIDogMTIpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGhvdXJzID09PSAnc3RyaW5nJyAmJiAvXlxcZCskLy50ZXN0KGhvdXJzKSkge1xyXG4gICAgICAgICAgICAgICAgbnVtID0gcGFyc2VJbnQoPHN0cmluZz5ob3VycywgMTApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBob3VycyA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICAgICAgICAgIG51bSA9IGhvdXJzO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gdm9pZCAwO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG51bSA9PT0gMCkgbnVtID0gMTtcclxuICAgICAgICAgICAgaWYgKG51bSA8IDEgfHwgbnVtID4gMTIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IHZvaWQgMDtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAobnVtID09PSAxMiAmJiBtZXJpZGllbSA9PT0gJ0FNJykge1xyXG4gICAgICAgICAgICAgICAgbnVtID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobnVtICE9PSAxMiAmJiBtZXJpZGllbSA9PT0gJ1BNJykge1xyXG4gICAgICAgICAgICAgICAgbnVtICs9IDEyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3VycyhudW0pO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGluY0hvdXJzKCk6RGF0ZUNoYWluIHtcclxuICAgICAgICAgICAgbGV0IG4gPSB0aGlzLmRhdGUuZ2V0SG91cnMoKSArIDE7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldEhvdXJzKG4gPiAyMyA/IDAgOiBuKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGRlY0hvdXJzKCk6RGF0ZUNoYWluIHtcclxuICAgICAgICAgICAgbGV0IG4gPSB0aGlzLmRhdGUuZ2V0SG91cnMoKSAtIDE7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldEhvdXJzKG4gPCAwID8gMjMgOiBuKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldE1pbGl0YXJ5SG91cnMoaG91cnM6c3RyaW5nfG51bWJlcik6RGF0ZUNoYWluIHtcclxuICAgICAgICAgICAgbGV0IG51bTpudW1iZXI7XHJcbiAgICAgICAgICAgIGlmIChob3VycyA9PT0gJ1pFUk9fT1VUJykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldEhvdXJzKDApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGhvdXJzID09PSAnc3RyaW5nJyAmJiAvXlxcZCskLy50ZXN0KGhvdXJzKSkge1xyXG4gICAgICAgICAgICAgICAgbnVtID0gcGFyc2VJbnQoPHN0cmluZz5ob3VycywgMTApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBob3VycyA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICAgICAgICAgIG51bSA9IGhvdXJzO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gdm9pZCAwO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG51bSA8IDAgfHwgbnVtID4gMjMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IHZvaWQgMDtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGUuZ2V0SG91cnMoKSA9PT0gbnVtICsgMSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldEhvdXJzKG51bSk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kYXRlLmdldEhvdXJzKCkgIT09IG51bSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3VycyhudW0gLSAxKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3VycyhudW0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0RGF0ZShkYXRlOnN0cmluZ3xudW1iZXIpOkRhdGVDaGFpbiB7XHJcbiAgICAgICAgICAgIGxldCBudW06bnVtYmVyO1xyXG4gICAgICAgICAgICBpZiAoZGF0ZSA9PT0gJ1pFUk9fT1VUJykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldERhdGUoMSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZGF0ZSA9PT0gJ3N0cmluZycgJiYgL1xcZHsxLDJ9LiokLy50ZXN0KGRhdGUpKSB7XHJcbiAgICAgICAgICAgICAgICBudW0gPSBwYXJzZUludCg8c3RyaW5nPmRhdGUsIDEwKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICAodHlwZW9mIGRhdGUgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgICAgICBudW0gPSBkYXRlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gdm9pZCAwO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG51bSA9PT0gMCkgbnVtID0gMTtcclxuICAgICAgICAgICAgaWYgKG51bSA8IDEgfHwgbnVtID4gdGhpcy5kYXlzSW5Nb250aCgpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0RGF0ZShudW0pO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGluY0RhdGUoKTpEYXRlQ2hhaW4ge1xyXG4gICAgICAgICAgICBsZXQgbiA9IHRoaXMuZGF0ZS5nZXREYXRlKCkgKyAxO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXREYXRlKG4gPiB0aGlzLmRheXNJbk1vbnRoKCkgPyAxIDogbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBkZWNEYXRlKCk6RGF0ZUNoYWluIHtcclxuICAgICAgICAgICAgbGV0IG4gPSB0aGlzLmRhdGUuZ2V0RGF0ZSgpIC0gMTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0RGF0ZShuIDwgMCA/IHRoaXMuZGF5c0luTW9udGgoKSA6IG4pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0RGF5KGRheTpzdHJpbmd8bnVtYmVyKTpEYXRlQ2hhaW4ge1xyXG4gICAgICAgICAgICBsZXQgbnVtOm51bWJlcjtcclxuICAgICAgICAgICAgaWYgKGRheSA9PT0gJ1pFUk9fT1VUJykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0RGF5KDApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBkYXkgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgICAgICBudW0gPSBkYXk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGRheSA9PT0gJ3N0cmluZycgJiYgZGF5TmFtZXMuc29tZSgoZGF5TmFtZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKG5ldyBSZWdFeHAoYF4ke2RheX0uKiRgLCAnaScpLnRlc3QoZGF5TmFtZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBudW0gPSBkYXlOYW1lcy5pbmRleE9mKGRheU5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KSkge1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gdm9pZCAwO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChudW0gPCAwIHx8IG51bSA+IDYpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IHZvaWQgMDtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgb2Zmc2V0ID0gdGhpcy5kYXRlLmdldERheSgpIC0gbnVtO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0RGF0ZSh0aGlzLmRhdGUuZ2V0RGF0ZSgpIC0gb2Zmc2V0KTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBpbmNEYXkoKTpEYXRlQ2hhaW4ge1xyXG4gICAgICAgICAgICBsZXQgbiA9IHRoaXMuZGF0ZS5nZXREYXkoKSArIDE7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldERheShuID4gNiA/IDAgOiBuKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGRlY0RheSgpOkRhdGVDaGFpbiB7XHJcbiAgICAgICAgICAgIGxldCBuID0gdGhpcy5kYXRlLmdldERheSgpIC0gMTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0RGF5KG4gPCAwID8gNiA6IG4pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0TW9udGgobW9udGg6c3RyaW5nfG51bWJlcik6RGF0ZUNoYWluIHtcclxuICAgICAgICAgICAgbGV0IG51bTpudW1iZXI7XHJcbiAgICAgICAgICAgIGlmIChtb250aCA9PT0gJ1pFUk9fT1VUJykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1vbnRoKDApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG1vbnRoID09PSAnc3RyaW5nJyAmJiAvXlxcZCskLy50ZXN0KG1vbnRoKSkge1xyXG4gICAgICAgICAgICAgICAgbnVtID0gcGFyc2VJbnQobW9udGgsIDEwKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbW9udGggPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgICAgICBudW0gPSBtb250aDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IHZvaWQgMDtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAobnVtID09PSAwKSBudW0gPSAxO1xyXG4gICAgICAgICAgICBpZiAobnVtIDwgMSB8fCBudW0gPiAxMikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gdm9pZCAwO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRNb250aChudW0gLSAxKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBpbmNNb250aCgpOkRhdGVDaGFpbiB7XHJcbiAgICAgICAgICAgIGxldCBuID0gdGhpcy5kYXRlLmdldE1vbnRoKCkgKyAyO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXREYXkobiA+IDEyID8gMSA6IG4pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZGVjTW9udGgoKTpEYXRlQ2hhaW4ge1xyXG4gICAgICAgICAgICBsZXQgbiA9IHRoaXMuZGF0ZS5nZXRNb250aCgpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXREYXkobiA8IDEgPyAxMiA6IG4pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0TW9udGhTdHJpbmcobW9udGg6c3RyaW5nfG51bWJlcik6RGF0ZUNoYWluIHtcclxuICAgICAgICAgICAgbGV0IG51bTpudW1iZXI7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAobW9udGggPT09ICdaRVJPX09VVCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRNb250aCgwKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBtb250aCA9PT0gJ3N0cmluZycgJiYgbW9udGhOYW1lcy5zb21lKChtb250aE5hbWUpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChuZXcgUmVnRXhwKGBeJHttb250aH0uKiRgLCAnaScpLnRlc3QobW9udGhOYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG51bSA9IG1vbnRoTmFtZXMuaW5kZXhPZihtb250aE5hbWUpICsgMTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSkpIHtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IHZvaWQgMDtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAobnVtIDwgMSB8fCBudW0gPiAxMikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gdm9pZCAwO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRNb250aChudW0gLSAxKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRZZWFyKHllYXI6c3RyaW5nfG51bWJlcik6RGF0ZUNoYWluIHtcclxuICAgICAgICAgICAgbGV0IG51bTpudW1iZXI7XHJcbiAgICAgICAgICAgIGlmICh5ZWFyID09PSAnWkVST19PVVQnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0RnVsbFllYXIoMCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgeWVhciA9PT0gJ3N0cmluZycgJiYgL15cXGQrJC8udGVzdCh5ZWFyKSkge1xyXG4gICAgICAgICAgICAgICAgbnVtID0gcGFyc2VJbnQoeWVhciwgMTApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB5ZWFyID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICAgICAgbnVtID0geWVhcjtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IHZvaWQgMDtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9ICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5kYXRlLnNldEZ1bGxZZWFyKG51bSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VHdvRGlnaXRZZWFyKHllYXI6c3RyaW5nfG51bWJlcik6RGF0ZUNoYWluIHtcclxuICAgICAgICAgICAgbGV0IGJhc2UgPSBNYXRoLmZsb29yKHRoaXMuZGF0ZS5nZXRGdWxsWWVhcigpLzEwMCkqMTAwO1xyXG4gICAgICAgICAgICBsZXQgbnVtOm51bWJlcjtcclxuICAgICAgICAgICAgaWYgKHllYXIgPT09ICdaRVJPX09VVCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRGdWxsWWVhcihiYXNlKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB5ZWFyID09PSAnc3RyaW5nJyAmJiAvXlxcZCskLy50ZXN0KHllYXIpKSB7XHJcbiAgICAgICAgICAgICAgICBudW0gPSBwYXJzZUludCh5ZWFyLCAxMCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHllYXIgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgICAgICBudW0gPSB5ZWFyO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gdm9pZCAwO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgIH0gICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0RnVsbFllYXIoYmFzZSArIG51bSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VW5peFNlY29uZFRpbWVzdGFtcChzZWNvbmRzOnN0cmluZ3xudW1iZXIpOkRhdGVDaGFpbiB7XHJcbiAgICAgICAgICAgIGxldCBudW06bnVtYmVyO1xyXG4gICAgICAgICAgICBpZiAoc2Vjb25kcyA9PT0gJ1pFUk9fT1VUJykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUoMCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygc2Vjb25kcyA9PT0gJ3N0cmluZycgJiYgL15cXGQrJC8udGVzdChzZWNvbmRzKSkge1xyXG4gICAgICAgICAgICAgICAgbnVtID0gcGFyc2VJbnQoc2Vjb25kcywgMTApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBzZWNvbmRzID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICAgICAgbnVtID0gc2Vjb25kcztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IHZvaWQgMDtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9ICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUobnVtICogMTAwMCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0VW5peE1pbGxpc2Vjb25kVGltZXN0YW1wKG1pbGxpc2Vjb25kczpzdHJpbmd8bnVtYmVyKTpEYXRlQ2hhaW4ge1xyXG4gICAgICAgICAgICBsZXQgbnVtOm51bWJlcjtcclxuICAgICAgICAgICAgaWYgKG1pbGxpc2Vjb25kcyA9PT0gJ1pFUk9fT1VUJykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUoMCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbWlsbGlzZWNvbmRzID09PSAnc3RyaW5nJyAmJiAvXlxcZCskLy50ZXN0KG1pbGxpc2Vjb25kcykpIHtcclxuICAgICAgICAgICAgICAgIG51bSA9IHBhcnNlSW50KG1pbGxpc2Vjb25kcywgMTApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBtaWxsaXNlY29uZHMgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgICAgICBudW0gPSBtaWxsaXNlY29uZHM7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgfSAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKG51bSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0TWVyaWRpZW0obWVyaWRpZW06c3RyaW5nfG51bWJlcik6RGF0ZUNoYWluIHtcclxuICAgICAgICAgICAgbGV0IGhvdXJzID0gdGhpcy5kYXRlLmdldEhvdXJzKCk7XHJcbiAgICAgICAgICAgIGlmIChtZXJpZGllbSA9PT0gJ1pFUk9fT1VUJykgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbWVyaWRpZW0gPT09ICdzdHJpbmcnICYmIC9eYW0/JC9pLnRlc3QoPHN0cmluZz5tZXJpZGllbSkpIHtcclxuICAgICAgICAgICAgICAgIGhvdXJzIC09IDEyO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBtZXJpZGllbSA9PT0gJ3N0cmluZycgJiYgL15wbT8kL2kudGVzdCg8c3RyaW5nPm1lcmlkaWVtKSkge1xyXG4gICAgICAgICAgICAgICAgaG91cnMgKz0gMTI7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaG91cnMgPCAwIHx8IGhvdXJzID4gMjMpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3Vycyhob3Vycyk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgaW5jTWVyaWRpZW0oKTpEYXRlQ2hhaW4ge1xyXG4gICAgICAgICAgICBsZXQgbiA9IHRoaXMuZGF0ZS5nZXRIb3VycygpICsgMTI7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldEhvdXJzKG4gPiAyMyA/IG4gLSAyNCA6IG4pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZGVjTWVyaWRpZW0oKTpEYXRlQ2hhaW4ge1xyXG4gICAgICAgICAgICBsZXQgbiA9IHRoaXMuZGF0ZS5nZXRIb3VycygpIC0gMTI7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldEhvdXJzKG4gPCAwID8gbiArIDI0IDogbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHByaXZhdGUgZGF5c0luTW9udGgoKTpudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGUodGhpcy5kYXRlLmdldEZ1bGxZZWFyKCksIHRoaXMuZGF0ZS5nZXRNb250aCgpICsgMSwgMCkuZ2V0RGF0ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgbWF4TW9udGhTdHJpbmdCdWZmZXIoKTpudW1iZXIge1xyXG4gICAgICAgICAgICBsZXQgbSA9IHRoaXMuZGF0ZS5nZXRNb250aCgpO1xyXG4gICAgICAgICAgICBpZiAobSA9PT0gMCkgcmV0dXJuIDI7IC8vIEphblxyXG4gICAgICAgICAgICBpZiAobSA9PT0gMSkgcmV0dXJuIDE7IC8vIEZlYlxyXG4gICAgICAgICAgICBpZiAobSA9PT0gMikgcmV0dXJuIDM7IC8vIE1hclxyXG4gICAgICAgICAgICBpZiAobSA9PT0gMykgcmV0dXJuIDI7IC8vIEFwclxyXG4gICAgICAgICAgICBpZiAobSA9PT0gNCkgcmV0dXJuIDM7IC8vIE1heVxyXG4gICAgICAgICAgICBpZiAobSA9PT0gNSkgcmV0dXJuIDM7IC8vIEp1blxyXG4gICAgICAgICAgICBpZiAobSA9PT0gNikgcmV0dXJuIDM7IC8vIEp1bFxyXG4gICAgICAgICAgICBpZiAobSA9PT0gNykgcmV0dXJuIDI7IC8vIEF1Z1xyXG4gICAgICAgICAgICBpZiAobSA9PT0gOCkgcmV0dXJuIDE7IC8vIFNlcFxyXG4gICAgICAgICAgICBpZiAobSA9PT0gOSkgcmV0dXJuIDE7IC8vIE9jdFxyXG4gICAgICAgICAgICBpZiAobSA9PT0gMTApIHJldHVybiAxOyAvLyBOb3ZcclxuICAgICAgICAgICAgcmV0dXJuIDE7IC8vIERlY1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgbWF4TW9udGhCdWZmZXIoKTpudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldE1vbnRoKCkgPiAwID8gMSA6IDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBtYXhEYXRlQnVmZmVyKCk6bnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXREYXRlKCkgKiAxMCA+IHRoaXMuZGF5c0luTW9udGgoKSA/IDEgOiAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgbWF4RGF5U3RyaW5nQnVmZmVyKCk6bnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXREYXkoKSAlIDIgPT0gMCA/IDIgOiAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgbWF4TWlsaXRhcnlIb3Vyc0J1ZmZlcigpOm51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0SG91cnMoKSA+IDIgPyAxIDogMjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIG1heEhvdXJzQnVmZmVyKCk6bnVtYmVyIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZGF0ZS5nZXRIb3VycygpID4gMTEpIHsgLy8gUE1cclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0SG91cnMoKSA+IDEzID8gMSA6IDI7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7IC8vIEFNXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldEhvdXJzKCkgPiAxID8gMSA6IDI7ICAgXHJcbiAgICAgICAgICAgIH0gICAgICAgIFxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgbWF4TWludXRlc0J1ZmZlcigpOm51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0TWludXRlcygpID4gNSA/IDEgOiAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgbWF4U2Vjb25kc0J1ZmZlcigpOm51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0U2Vjb25kcygpID4gNSA/IDEgOiAyO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjaGFpbihkOkRhdGUpOkRhdGVDaGFpbiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlQ2hhaW4oZCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0VVRDT2Zmc2V0KGRhdGU6RGF0ZSwgc2hvd0NvbG9uOmJvb2xlYW4pOnN0cmluZyB7XHJcbiAgICAgICAgbGV0IHR6byA9IC1kYXRlLmdldFRpbWV6b25lT2Zmc2V0KCk7XHJcbiAgICAgICAgbGV0IGRpZiA9IHR6byA+PSAwID8gJysnIDogJy0nO1xyXG4gICAgICAgIGxldCBjb2xvbiA9IHNob3dDb2xvbiA/ICc6JyA6ICcnO1xyXG4gICAgICAgIHJldHVybiBkaWYgKyBwYWQodHpvIC8gNjAsIDIpICsgY29sb24gKyBwYWQodHpvICUgNjAsIDIpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBhZChudW06bnVtYmVyLCBsZW5ndGg6bnVtYmVyKTpzdHJpbmcge1xyXG4gICAgICAgIGxldCBwYWRkZWQgPSBNYXRoLmFicyhudW0pLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgd2hpbGUgKHBhZGRlZC5sZW5ndGggPCBsZW5ndGgpIHBhZGRlZCA9ICcwJyArIHBhZGRlZDtcclxuICAgICAgICByZXR1cm4gcGFkZGVkO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGFwcGVuZE9yZGluYWwobnVtOm51bWJlcik6c3RyaW5nIHtcclxuICAgICAgICBsZXQgaiA9IG51bSAlIDEwO1xyXG4gICAgICAgIGxldCBrID0gbnVtICUgMTAwO1xyXG4gICAgICAgIGlmIChqID09IDEgJiYgayAhPSAxMSkgcmV0dXJuIG51bSArIFwic3RcIjtcclxuICAgICAgICBpZiAoaiA9PSAyICYmIGsgIT0gMTIpIHJldHVybiBudW0gKyBcIm5kXCI7XHJcbiAgICAgICAgaWYgKGogPT0gMyAmJiBrICE9IDEzKSByZXR1cm4gbnVtICsgXCJyZFwiO1xyXG4gICAgICAgIHJldHVybiBudW0gKyBcInRoXCI7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdG9TdGFuZGFyZFRpbWUoaG91cnM6bnVtYmVyKTpudW1iZXIge1xyXG4gICAgICAgIGlmIChob3VycyA9PT0gMCkgcmV0dXJuIDEyO1xyXG4gICAgICAgIHJldHVybiBob3VycyA+IDEyID8gaG91cnMgLSAxMiA6IGhvdXJzO1xyXG4gICAgfSAgICBcclxuICAgIFxyXG4gICAgcmV0dXJuIDxJRm9ybWF0QmxvY2tbXT4gW1xyXG4gICAgICAgIHsgLy8gRk9VUiBESUdJVCBZRUFSXHJcbiAgICAgICAgICAgIGNvZGU6ICdZWVlZJyxcclxuICAgICAgICAgICAgcmVnRXhwOiAnXFxcXGR7NCw0fScsXHJcbiAgICAgICAgICAgIHN0cjogKGQpID0+IGQuZ2V0RnVsbFllYXIoKS50b1N0cmluZygpLFxyXG4gICAgICAgICAgICBpbmM6IChkKSA9PiBjaGFpbihkKS5zZXRZZWFyKGQuZ2V0RnVsbFllYXIoKSArIDEpLmRhdGUsXHJcbiAgICAgICAgICAgIGRlYzogKGQpID0+IGNoYWluKGQpLnNldFllYXIoZC5nZXRGdWxsWWVhcigpIC0gMSkuZGF0ZSxcclxuICAgICAgICAgICAgc2V0OiAoZCwgdikgPT4gY2hhaW4oZCkuc2V0WWVhcih2KS5kYXRlLFxyXG4gICAgICAgICAgICBtYXhCdWZmZXI6IChkKSA9PiA0XHJcbiAgICAgICAgfSxcclxuICAgICAgICB7IC8vIFRXTyBESUdJVCBZRUFSXHJcbiAgICAgICAgICAgIGNvZGU6ICdZWScsXHJcbiAgICAgICAgICAgIHJlZ0V4cDogJ1xcXFxkezIsMn0nLFxyXG4gICAgICAgICAgICBzdHI6IChkKSA9PiBkLmdldEZ1bGxZZWFyKCkudG9TdHJpbmcoKS5zbGljZSgtMiksXHJcbiAgICAgICAgICAgIGluYzogKGQpID0+IGNoYWluKGQpLnNldFllYXIoZC5nZXRGdWxsWWVhcigpICsgMSkuZGF0ZSxcclxuICAgICAgICAgICAgZGVjOiAoZCkgPT4gY2hhaW4oZCkuc2V0WWVhcihkLmdldEZ1bGxZZWFyKCkgLSAxKS5kYXRlLFxyXG4gICAgICAgICAgICBzZXQ6IChkLCB2KSA9PiBjaGFpbihkKS5zZXRUd29EaWdpdFllYXIodikuZGF0ZSxcclxuICAgICAgICAgICAgbWF4QnVmZmVyOiAoZCkgPT4gMlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeyAvLyBMT05HIE1PTlRIIE5BTUVcclxuICAgICAgICAgICAgY29kZTogJ01NTU0nLFxyXG4gICAgICAgICAgICByZWdFeHA6IGAoKCR7bW9udGhOYW1lcy5qb2luKCcpfCgnKX0pKWAsXHJcbiAgICAgICAgICAgIHN0cjogKGQpID0+IG1vbnRoTmFtZXNbZC5nZXRNb250aCgpXSxcclxuICAgICAgICAgICAgaW5jOiAoZCkgPT4gY2hhaW4oZCkuaW5jTW9udGgoKS5kYXRlLFxyXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBjaGFpbihkKS5kZWNNb250aCgpLmRhdGUsXHJcbiAgICAgICAgICAgIHNldDogKGQsIHYpID0+IGNoYWluKGQpLnNldE1vbnRoU3RyaW5nKHYpLmRhdGUsXHJcbiAgICAgICAgICAgIG1heEJ1ZmZlcjogKGQpID0+IGNoYWluKGQpLm1heE1vbnRoU3RyaW5nQnVmZmVyKClcclxuICAgICAgICB9LFxyXG4gICAgICAgIHsgLy8gU0hPUlQgTU9OVEggTkFNRVxyXG4gICAgICAgICAgICBjb2RlOiAnTU1NJyxcclxuICAgICAgICAgICAgcmVnRXhwOiBgKCgke21vbnRoTmFtZXMubWFwKCh2KSA9PiB2LnNsaWNlKDAsMykpLmpvaW4oJyl8KCcpfSkpYCxcclxuICAgICAgICAgICAgc3RyOiAoZCkgPT4gbW9udGhOYW1lc1tkLmdldE1vbnRoKCldLnNsaWNlKDAsMyksXHJcbiAgICAgICAgICAgIGluYzogKGQpID0+IGNoYWluKGQpLmluY01vbnRoKCkuZGF0ZSxcclxuICAgICAgICAgICAgZGVjOiAoZCkgPT4gY2hhaW4oZCkuZGVjTW9udGgoKS5kYXRlLFxyXG4gICAgICAgICAgICBzZXQ6IChkLCB2KSA9PiBjaGFpbihkKS5zZXRNb250aFN0cmluZyh2KS5kYXRlLFxyXG4gICAgICAgICAgICBtYXhCdWZmZXI6IChkKSA9PiBjaGFpbihkKS5tYXhNb250aFN0cmluZ0J1ZmZlcigpXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7IC8vIFBBRERFRCBNT05USFxyXG4gICAgICAgICAgICBjb2RlOiAnTU0nLFxyXG4gICAgICAgICAgICByZWdFeHA6ICdcXFxcZHsyLDJ9JyxcclxuICAgICAgICAgICAgc3RyOiAoZCkgPT4gcGFkKGQuZ2V0TW9udGgoKSArIDEsIDIpLFxyXG4gICAgICAgICAgICBpbmM6IChkKSA9PiBjaGFpbihkKS5pbmNNb250aCgpLmRhdGUsXHJcbiAgICAgICAgICAgIGRlYzogKGQpID0+IGNoYWluKGQpLmRlY01vbnRoKCkuZGF0ZSxcclxuICAgICAgICAgICAgc2V0OiAoZCwgdikgPT4gY2hhaW4oZCkuc2V0TW9udGgodikuZGF0ZSxcclxuICAgICAgICAgICAgbWF4QnVmZmVyOiAoZCkgPT4gY2hhaW4oZCkubWF4TW9udGhCdWZmZXIoKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeyAvLyBNT05USFxyXG4gICAgICAgICAgICBjb2RlOiAnTScsXHJcbiAgICAgICAgICAgIHJlZ0V4cDogJ1xcXFxkezEsMn0nLFxyXG4gICAgICAgICAgICBzdHI6IChkKSA9PiAoZC5nZXRNb250aCgpICsgMSkudG9TdHJpbmcoKSxcclxuICAgICAgICAgICAgaW5jOiAoZCkgPT4gY2hhaW4oZCkuaW5jTW9udGgoKS5kYXRlLFxyXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBjaGFpbihkKS5kZWNNb250aCgpLmRhdGUsXHJcbiAgICAgICAgICAgIHNldDogKGQsIHYpID0+IGNoYWluKGQpLnNldE1vbnRoKHYpLmRhdGUsXHJcbiAgICAgICAgICAgIG1heEJ1ZmZlcjogKGQpID0+IGNoYWluKGQpLm1heE1vbnRoQnVmZmVyKClcclxuICAgICAgICB9LFxyXG4gICAgICAgIHsgLy8gUEFEREVEIERBVEVcclxuICAgICAgICAgICAgY29kZTogJ0REJyxcclxuICAgICAgICAgICAgcmVnRXhwOiAnXFxcXGR7MiwyfScsXHJcbiAgICAgICAgICAgIHN0cjogKGQpID0+IHBhZChkLmdldERhdGUoKSwgMiksXHJcbiAgICAgICAgICAgIGluYzogKGQpID0+IGNoYWluKGQpLmluY0RhdGUoKS5kYXRlLFxyXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBjaGFpbihkKS5kZWNEYXRlKCkuZGF0ZSxcclxuICAgICAgICAgICAgc2V0OiAoZCwgdikgPT4gY2hhaW4oZCkuc2V0RGF0ZSh2KS5kYXRlLFxyXG4gICAgICAgICAgICBtYXhCdWZmZXI6IChkKSA9PiBjaGFpbihkKS5tYXhEYXRlQnVmZmVyKClcclxuICAgICAgICB9LFxyXG4gICAgICAgIHsgLy8gT1JESU5BTCBEQVRFXHJcbiAgICAgICAgICAgIGNvZGU6ICdEbycsXHJcbiAgICAgICAgICAgIHJlZ0V4cDogJ1xcXFxkezEsMn0oKHRoKXwobmQpfChyZCl8KHN0KSknLFxyXG4gICAgICAgICAgICBzdHI6IChkKSA9PiBhcHBlbmRPcmRpbmFsKGQuZ2V0RGF0ZSgpKSxcclxuICAgICAgICAgICAgaW5jOiAoZCkgPT4gY2hhaW4oZCkuaW5jRGF0ZSgpLmRhdGUsXHJcbiAgICAgICAgICAgIGRlYzogKGQpID0+IGNoYWluKGQpLmRlY0RhdGUoKS5kYXRlLFxyXG4gICAgICAgICAgICBzZXQ6IChkLCB2KSA9PiBjaGFpbihkKS5zZXREYXRlKHYpLmRhdGUsXHJcbiAgICAgICAgICAgIG1heEJ1ZmZlcjogKGQpID0+IGNoYWluKGQpLm1heERhdGVCdWZmZXIoKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeyAvLyBEQVRFXHJcbiAgICAgICAgICAgIGNvZGU6ICdEJyxcclxuICAgICAgICAgICAgcmVnRXhwOiAnXFxcXGR7MSwyfScsXHJcbiAgICAgICAgICAgIHN0cjogKGQpID0+IGQuZ2V0RGF0ZSgpLnRvU3RyaW5nKCksXHJcbiAgICAgICAgICAgIGluYzogKGQpID0+IGNoYWluKGQpLmluY0RhdGUoKS5kYXRlLFxyXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBjaGFpbihkKS5kZWNEYXRlKCkuZGF0ZSxcclxuICAgICAgICAgICAgc2V0OiAoZCwgdikgPT4gY2hhaW4oZCkuc2V0RGF0ZSh2KS5kYXRlLFxyXG4gICAgICAgICAgICBtYXhCdWZmZXI6IChkKSA9PiBjaGFpbihkKS5tYXhEYXRlQnVmZmVyKClcclxuICAgICAgICB9LFxyXG4gICAgICAgIHsgLy8gTE9ORyBEQVkgTkFNRVxyXG4gICAgICAgICAgICBjb2RlOiAnZGRkZCcsXHJcbiAgICAgICAgICAgIHJlZ0V4cDogYCgoJHtkYXlOYW1lcy5qb2luKCcpfCgnKX0pKWAsXHJcbiAgICAgICAgICAgIHN0cjogKGQpID0+IGRheU5hbWVzW2QuZ2V0RGF5KCldLFxyXG4gICAgICAgICAgICBpbmM6IChkKSA9PiBjaGFpbihkKS5pbmNEYXkoKS5kYXRlLFxyXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBjaGFpbihkKS5kZWNEYXkoKS5kYXRlLFxyXG4gICAgICAgICAgICBzZXQ6IChkLCB2KSA9PiBjaGFpbihkKS5zZXREYXkodikuZGF0ZSxcclxuICAgICAgICAgICAgbWF4QnVmZmVyOiAoZCkgPT4gY2hhaW4oZCkubWF4RGF5U3RyaW5nQnVmZmVyKClcclxuICAgICAgICB9LFxyXG4gICAgICAgIHsgLy8gU0hPUlQgREFZIE5BTUVcclxuICAgICAgICAgICAgY29kZTogJ2RkZCcsXHJcbiAgICAgICAgICAgIHJlZ0V4cDogYCgoJHtkYXlOYW1lcy5tYXAoKHYpID0+IHYuc2xpY2UoMCwzKSkuam9pbignKXwoJyl9KSlgLFxyXG4gICAgICAgICAgICBzdHI6IChkKSA9PiBkYXlOYW1lc1tkLmdldERheSgpXS5zbGljZSgwLDMpLFxyXG4gICAgICAgICAgICBpbmM6IChkKSA9PiBjaGFpbihkKS5pbmNEYXkoKS5kYXRlLFxyXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBjaGFpbihkKS5kZWNEYXkoKS5kYXRlLFxyXG4gICAgICAgICAgICBzZXQ6IChkLCB2KSA9PiBjaGFpbihkKS5zZXREYXkodikuZGF0ZSxcclxuICAgICAgICAgICAgbWF4QnVmZmVyOiAoZCkgPT4gY2hhaW4oZCkubWF4RGF5U3RyaW5nQnVmZmVyKClcclxuICAgICAgICB9LFxyXG4gICAgICAgIHsgLy8gVU5JWCBUSU1FU1RBTVBcclxuICAgICAgICAgICAgY29kZTogJ1gnLFxyXG4gICAgICAgICAgICByZWdFeHA6ICdcXFxcZHsxLH0nLFxyXG4gICAgICAgICAgICBzdHI6IChkKSA9PiBNYXRoLmZsb29yKGQudmFsdWVPZigpIC8gMTAwMCkudG9TdHJpbmcoKSxcclxuICAgICAgICAgICAgaW5jOiAoZCkgPT4gbmV3IERhdGUoZC52YWx1ZU9mKCkgKyAxMDAwKSxcclxuICAgICAgICAgICAgZGVjOiAoZCkgPT4gbmV3IERhdGUoZC52YWx1ZU9mKCkgLSAxMDAwKSxcclxuICAgICAgICAgICAgc2V0OiAoZCwgdikgPT4gY2hhaW4oZCkuc2V0VW5peFNlY29uZFRpbWVzdGFtcCh2KS5kYXRlXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7IC8vIFVOSVggTUlMTElTRUNPTkQgVElNRVNUQU1QXHJcbiAgICAgICAgICAgIGNvZGU6ICd4JyxcclxuICAgICAgICAgICAgcmVnRXhwOiAnXFxcXGR7MSx9JyxcclxuICAgICAgICAgICAgc3RyOiAoZCkgPT4gZC52YWx1ZU9mKCkudG9TdHJpbmcoKSxcclxuICAgICAgICAgICAgaW5jOiAoZCkgPT4gbmV3IERhdGUoZC52YWx1ZU9mKCkgKyAxKSxcclxuICAgICAgICAgICAgZGVjOiAoZCkgPT4gbmV3IERhdGUoZC52YWx1ZU9mKCkgLSAxKSxcclxuICAgICAgICAgICAgc2V0OiAoZCwgdikgPT4gY2hhaW4oZCkuc2V0VW5peE1pbGxpc2Vjb25kVGltZXN0YW1wKHYpLmRhdGVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHsgLy8gUEFEREVEIE1JTElUQVJZIEhPVVJTXHJcbiAgICAgICAgICAgIGNvZGU6ICdISCcsXHJcbiAgICAgICAgICAgIHJlZ0V4cDogJ1xcXFxkezIsMn0nLFxyXG4gICAgICAgICAgICBzdHI6IChkKSA9PiBwYWQoZC5nZXRIb3VycygpLCAyKSxcclxuICAgICAgICAgICAgaW5jOiAoZCkgPT4gY2hhaW4oZCkuaW5jSG91cnMoKS5kYXRlLFxyXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBjaGFpbihkKS5kZWNIb3VycygpLmRhdGUsXHJcbiAgICAgICAgICAgIHNldDogKGQsIHYpID0+IGNoYWluKGQpLnNldE1pbGl0YXJ5SG91cnModikuZGF0ZSxcclxuICAgICAgICAgICAgbWF4QnVmZmVyOiAoZCkgPT4gY2hhaW4oZCkubWF4TWlsaXRhcnlIb3Vyc0J1ZmZlcigpXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7IC8vIE1JTElUQVJZIEhPVVJTXHJcbiAgICAgICAgICAgIGNvZGU6ICdIJyxcclxuICAgICAgICAgICAgcmVnRXhwOiAnXFxcXGR7MSwyfScsXHJcbiAgICAgICAgICAgIHN0cjogKGQpID0+IGQuZ2V0SG91cnMoKS50b1N0cmluZygpLFxyXG4gICAgICAgICAgICBpbmM6IChkKSA9PiBjaGFpbihkKS5pbmNIb3VycygpLmRhdGUsXHJcbiAgICAgICAgICAgIGRlYzogKGQpID0+IGNoYWluKGQpLmRlY0hvdXJzKCkuZGF0ZSxcclxuICAgICAgICAgICAgc2V0OiAoZCwgdikgPT4gY2hhaW4oZCkuc2V0TWlsaXRhcnlIb3Vycyh2KS5kYXRlLFxyXG4gICAgICAgICAgICBtYXhCdWZmZXI6IChkKSA9PiBjaGFpbihkKS5tYXhNaWxpdGFyeUhvdXJzQnVmZmVyKClcclxuICAgICAgICB9LFxyXG4gICAgICAgIHsgLy8gUEFEREVEIEhPVVJTXHJcbiAgICAgICAgICAgIGNvZGU6ICdoaCcsXHJcbiAgICAgICAgICAgIHJlZ0V4cDogJ1xcXFxkezIsMn0nLFxyXG4gICAgICAgICAgICBzdHI6IChkKSA9PiBwYWQodG9TdGFuZGFyZFRpbWUoZC5nZXRIb3VycygpKSwgMiksXHJcbiAgICAgICAgICAgIGluYzogKGQpID0+IGNoYWluKGQpLmluY0hvdXJzKCkuZGF0ZSxcclxuICAgICAgICAgICAgZGVjOiAoZCkgPT4gY2hhaW4oZCkuZGVjSG91cnMoKS5kYXRlLFxyXG4gICAgICAgICAgICBzZXQ6IChkLCB2KSA9PiBjaGFpbihkKS5zZXRIb3Vycyh2KS5kYXRlLFxyXG4gICAgICAgICAgICBtYXhCdWZmZXI6IChkKSA9PiBjaGFpbihkKS5tYXhIb3Vyc0J1ZmZlcigpXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7IC8vIEhPVVJTXHJcbiAgICAgICAgICAgIGNvZGU6ICdoJyxcclxuICAgICAgICAgICAgcmVnRXhwOiAnXFxcXGR7MSwyfScsXHJcbiAgICAgICAgICAgIHN0cjogKGQpID0+IHRvU3RhbmRhcmRUaW1lKGQuZ2V0SG91cnMoKSkudG9TdHJpbmcoKSxcclxuICAgICAgICAgICAgaW5jOiAoZCkgPT4gY2hhaW4oZCkuaW5jSG91cnMoKS5kYXRlLFxyXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBjaGFpbihkKS5kZWNIb3VycygpLmRhdGUsXHJcbiAgICAgICAgICAgIHNldDogKGQsIHYpID0+IGNoYWluKGQpLnNldEhvdXJzKHYpLmRhdGUsXHJcbiAgICAgICAgICAgIG1heEJ1ZmZlcjogKGQpID0+IGNoYWluKGQpLm1heEhvdXJzQnVmZmVyKClcclxuICAgICAgICB9LFxyXG4gICAgICAgIHsgLy8gVVBQRVJDQVNFIE1FUklESUVNXHJcbiAgICAgICAgICAgIGNvZGU6ICdBJyxcclxuICAgICAgICAgICAgcmVnRXhwOiAnKChBTSl8KFBNKSknLFxyXG4gICAgICAgICAgICBzdHI6IChkKSA9PiBkLmdldEhvdXJzKCkgPCAxMiA/ICdBTScgOiAnUE0nLFxyXG4gICAgICAgICAgICBpbmM6IChkKSA9PiBjaGFpbihkKS5pbmNNZXJpZGllbSgpLmRhdGUsXHJcbiAgICAgICAgICAgIGRlYzogKGQpID0+IGNoYWluKGQpLmRlY01lcmlkaWVtKCkuZGF0ZSxcclxuICAgICAgICAgICAgc2V0OiAoZCwgdikgPT4gY2hhaW4oZCkuc2V0TWVyaWRpZW0odikuZGF0ZSxcclxuICAgICAgICAgICAgbWF4QnVmZmVyOiAoZCkgPT4gMVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeyAvLyBVUFBFUkNBU0UgTUVSSURJRU1cclxuICAgICAgICAgICAgY29kZTogJ2EnLFxyXG4gICAgICAgICAgICByZWdFeHA6ICcoKGFtKXwocG0pKScsXHJcbiAgICAgICAgICAgIHN0cjogKGQpID0+IGQuZ2V0SG91cnMoKSA8IDEyID8gJ2FtJyA6ICdwbScsXHJcbiAgICAgICAgICAgIGluYzogKGQpID0+IGNoYWluKGQpLmluY01lcmlkaWVtKCkuZGF0ZSxcclxuICAgICAgICAgICAgZGVjOiAoZCkgPT4gY2hhaW4oZCkuZGVjTWVyaWRpZW0oKS5kYXRlLFxyXG4gICAgICAgICAgICBzZXQ6IChkLCB2KSA9PiBjaGFpbihkKS5zZXRNZXJpZGllbSh2KS5kYXRlLFxyXG4gICAgICAgICAgICBtYXhCdWZmZXI6IChkKSA9PiAxXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7IC8vIFBBRERFRCBNSU5VVEVTXHJcbiAgICAgICAgICAgIGNvZGU6ICdtbScsXHJcbiAgICAgICAgICAgIHJlZ0V4cDogJ1xcXFxkezIsMn0nLFxyXG4gICAgICAgICAgICBzdHI6IChkKSA9PiBwYWQoZC5nZXRNaW51dGVzKCksIDIpLFxyXG4gICAgICAgICAgICBpbmM6IChkKSA9PiBjaGFpbihkKS5pbmNNaW51dGVzKCkuZGF0ZSxcclxuICAgICAgICAgICAgZGVjOiAoZCkgPT4gY2hhaW4oZCkuZGVjTWludXRlcygpLmRhdGUsXHJcbiAgICAgICAgICAgIHNldDogKGQsIHYpID0+IGNoYWluKGQpLnNldE1pbnV0ZXModikuZGF0ZSxcclxuICAgICAgICAgICAgbWF4QnVmZmVyOiAoZCkgPT4gY2hhaW4oZCkubWF4TWludXRlc0J1ZmZlcigpXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7IC8vIE1JTlVURVNcclxuICAgICAgICAgICAgY29kZTogJ20nLFxyXG4gICAgICAgICAgICByZWdFeHA6ICdcXFxcZHsxLDJ9JyxcclxuICAgICAgICAgICAgc3RyOiAoZCkgPT4gZC5nZXRNaW51dGVzKCkudG9TdHJpbmcoKSxcclxuICAgICAgICAgICAgaW5jOiAoZCkgPT4gY2hhaW4oZCkuaW5jTWludXRlcygpLmRhdGUsXHJcbiAgICAgICAgICAgIGRlYzogKGQpID0+IGNoYWluKGQpLmRlY01pbnV0ZXMoKS5kYXRlLFxyXG4gICAgICAgICAgICBzZXQ6IChkLCB2KSA9PiBjaGFpbihkKS5zZXRNaW51dGVzKHYpLmRhdGUsXHJcbiAgICAgICAgICAgIG1heEJ1ZmZlcjogKGQpID0+IGNoYWluKGQpLm1heE1pbnV0ZXNCdWZmZXIoKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeyAvLyBQQURERUQgU0VDT05EU1xyXG4gICAgICAgICAgICBjb2RlOiAnc3MnLFxyXG4gICAgICAgICAgICByZWdFeHA6ICdcXFxcZHsyLDJ9JyxcclxuICAgICAgICAgICAgc3RyOiAoZCkgPT4gcGFkKGQuZ2V0U2Vjb25kcygpLCAyKSxcclxuICAgICAgICAgICAgaW5jOiAoZCkgPT4gY2hhaW4oZCkuaW5jU2Vjb25kcygpLmRhdGUsXHJcbiAgICAgICAgICAgIGRlYzogKGQpID0+IGNoYWluKGQpLmRlY1NlY29uZHMoKS5kYXRlLFxyXG4gICAgICAgICAgICBzZXQ6IChkLCB2KSA9PiBjaGFpbihkKS5zZXRTZWNvbmRzKHYpLmRhdGUsXHJcbiAgICAgICAgICAgIG1heEJ1ZmZlcjogKGQpID0+IGNoYWluKGQpLm1heFNlY29uZHNCdWZmZXIoKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeyAvLyBTRUNPTkRTXHJcbiAgICAgICAgICAgIGNvZGU6ICdzJyxcclxuICAgICAgICAgICAgcmVnRXhwOiAnXFxcXGR7MSwyfScsXHJcbiAgICAgICAgICAgIHN0cjogKGQpID0+IGQuZ2V0U2Vjb25kcygpLnRvU3RyaW5nKCksXHJcbiAgICAgICAgICAgIGluYzogKGQpID0+IGNoYWluKGQpLmluY1NlY29uZHMoKS5kYXRlLFxyXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBjaGFpbihkKS5kZWNTZWNvbmRzKCkuZGF0ZSxcclxuICAgICAgICAgICAgc2V0OiAoZCwgdikgPT4gY2hhaW4oZCkuc2V0U2Vjb25kcyh2KS5kYXRlLFxyXG4gICAgICAgICAgICBtYXhCdWZmZXI6IChkKSA9PiBjaGFpbihkKS5tYXhTZWNvbmRzQnVmZmVyKClcclxuICAgICAgICB9LFxyXG4gICAgICAgIHsgLy8gVVRDIE9GRlNFVCBXSVRIIENPTE9OXHJcbiAgICAgICAgICAgIGNvZGU6ICdaWicsXHJcbiAgICAgICAgICAgIHJlZ0V4cDogJyhcXFxcK3xcXFxcLSlcXFxcZHsyLDJ9OlxcXFxkezIsMn0nLFxyXG4gICAgICAgICAgICBzdHI6IChkKSA9PiBnZXRVVENPZmZzZXQoZCwgdHJ1ZSkgLy9UT0RPIGFkZCBhYmlsaXR5IHRvIGluYyBhbmQgZGVjIHRoaXNcclxuICAgICAgICB9LFxyXG4gICAgICAgIHsgLy8gVVRDIE9GRlNFVFxyXG4gICAgICAgICAgICBjb2RlOiAnWicsXHJcbiAgICAgICAgICAgIHJlZ0V4cDogJyhcXFxcK3xcXFxcLSlcXFxcZHs0LDR9JyxcclxuICAgICAgICAgICAgc3RyOiAoZCkgPT4gZ2V0VVRDT2Zmc2V0KGQsIGZhbHNlKVxyXG4gICAgICAgIH1cclxuICAgIF07XHJcbn0pKCk7XHJcblxyXG5cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIkZvcm1hdEJsb2Nrcy50c1wiIC8+XHJcblxyXG5jbGFzcyBEYXRlUGFydCB7XHJcbiAgICBwcml2YXRlIHN0cjooZDpEYXRlKSA9PiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIHJlZ0V4cFN0cmluZzpzdHJpbmc7XHJcbiAgICBwcml2YXRlIGluYzooZDpEYXRlKSA9PiBEYXRlO1xyXG4gICAgcHJpdmF0ZSBkZWM6KGQ6RGF0ZSkgPT4gRGF0ZTtcclxuICAgIHByaXZhdGUgc2V0OihkOkRhdGUsIHY6c3RyaW5nfG51bWJlcikgPT4gRGF0ZTtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSB2YWx1ZTpzdHJpbmc7XHJcbiAgICBwcml2YXRlIHNlbGVjdGFibGU6Ym9vbGVhbjtcclxuICAgIHByaXZhdGUgbWF4QnVmZmVyOihkOkRhdGUpID0+IG51bWJlcjtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IoYXJnOklGb3JtYXRCbG9ja3xTdHJpbmcsIHNlbGVjdGFibGVPdmVycmlkZT86Ym9vbGVhbikge1xyXG4gICAgICAgIGlmICh0eXBlb2YgYXJnID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICB0aGlzLnN0ciA9ICg8SUZvcm1hdEJsb2NrPmFyZykuc3RyO1xyXG4gICAgICAgICAgICB0aGlzLmluYyA9ICg8SUZvcm1hdEJsb2NrPmFyZykuaW5jO1xyXG4gICAgICAgICAgICB0aGlzLmRlYyA9ICg8SUZvcm1hdEJsb2NrPmFyZykuZGVjO1xyXG4gICAgICAgICAgICB0aGlzLnNldCA9ICg8SUZvcm1hdEJsb2NrPmFyZykuc2V0O1xyXG4gICAgICAgICAgICB0aGlzLm1heEJ1ZmZlciA9ICg8SUZvcm1hdEJsb2NrPmFyZykubWF4QnVmZmVyO1xyXG4gICAgICAgICAgICB0aGlzLnJlZ0V4cFN0cmluZyA9ICg8SUZvcm1hdEJsb2NrPmFyZykucmVnRXhwO1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGFibGUgPSB0aGlzLmluYyAhPT0gdm9pZCAwICYmIHRoaXMuZGVjICE9PSB2b2lkIDA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IDxzdHJpbmc+YXJnO1xyXG4gICAgICAgICAgICB0aGlzLnJlZ0V4cFN0cmluZyA9IHRoaXMucmVnRXhwRXNjYXBlKHRoaXMudmFsdWUpO1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGFibGUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBzZWxlY3RhYmxlT3ZlcnJpZGUgPT09ICdib29sZWFuJykge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGFibGUgPSBzZWxlY3RhYmxlT3ZlcnJpZGU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHJlZ0V4cEVzY2FwZShzdHI6c3RyaW5nKTpzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZSgvW1xcLVxcW1xcXVxcL1xce1xcfVxcKFxcKVxcKlxcK1xcP1xcLlxcXFxcXF5cXCRcXHxdL2csIFwiXFxcXCQmXCIpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgaW5jcmVtZW50KGQ6RGF0ZSk6RGF0ZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5jKGQpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZGVjcmVtZW50KGQ6RGF0ZSk6RGF0ZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVjKGQpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgc2V0VmFsdWUoZDpEYXRlKTpEYXRlUGFydCB7XHJcbiAgICAgICAgaWYgKHRoaXMuc3RyID09PSB2b2lkIDApIHJldHVybiB0aGlzO1xyXG4gICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLnN0cihkKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHRvU3RyaW5nKCk6c3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGlzU2VsZWN0YWJsZSgpOmJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGFibGU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRSZWdFeHBTdHJpbmcoKTpzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJlZ0V4cFN0cmluZztcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldERhdGVGcm9tU3RyaW5nKGRhdGU6RGF0ZSwgcGFydGlhbDpzdHJpbmcpOkRhdGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNldChkYXRlLCBwYXJ0aWFsKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldE1heEJ1ZmZlclNpemUoZGF0ZTpEYXRlKTpudW1iZXIge1xyXG4gICAgICAgIGlmICh0aGlzLm1heEJ1ZmZlciA9PT0gdm9pZCAwKSByZXR1cm4gdm9pZCAwO1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1heEJ1ZmZlcihkYXRlKTtcclxuICAgIH1cclxufSIsImxldCBPcHRpb25TYW5pdGl6ZXIgPSAoKCkgPT4ge1xyXG4gICAgbGV0IHNhbml0aXplRWxlbWVudCA9IChlbGVtZW50OkhUTUxJbnB1dEVsZW1lbnQpOkhUTUxJbnB1dEVsZW1lbnQgPT4ge1xyXG4gICAgICAgIGlmIChlbGVtZW50ID09PSB2b2lkIDApIHRocm93ICdEQVRJVU06IFwiZWxlbWVudFwiIG9wdGlvbiBpcyByZXF1aXJlZCc7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ29oIHllYWggYWhhJyk7XHJcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJldHVybiBjbGFzcyB7XHJcbiAgICAgICAgc3RhdGljIHNhbml0aXplKG9wdHM6SU9wdGlvbnMpOklPcHRpb25zIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IHNhbml0aXplRWxlbWVudChvcHRzLmVsZW1lbnQpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJGb3JtYXRCbG9ja3MudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiRGF0ZVBhcnQudHNcIiAvPlxyXG5cclxuY2xhc3MgRGlzcGxheVBhcnNlciB7XHJcbiAgICBcclxuICAgIHB1YmxpYyBzdGF0aWMgcGFyc2UoZm9ybWF0OnN0cmluZyk6RGF0ZVBhcnRbXSB7ICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICBsZXQgaW5kZXggPSAwOyAgICAgICAgICAgICAgICBcclxuICAgICAgICBsZXQgaW5Fc2NhcGVkU2VnbWVudCA9IGZhbHNlO1xyXG4gICAgICAgIGxldCBkYXRlUGFydHM6RGF0ZVBhcnRbXSA9IFtdO1xyXG4gICAgICAgIGxldCB0ZXh0QnVmZmVyID0gJyc7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHB1c2hQbGFpblRleHQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0ZXh0QnVmZmVyLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGRhdGVQYXJ0cy5wdXNoKG5ldyBEYXRlUGFydCh0ZXh0QnVmZmVyKSk7XHJcbiAgICAgICAgICAgICAgICB0ZXh0QnVmZmVyID0gJyc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGluY3JlbWVudDpudW1iZXI7ICAgICAgICBcclxuICAgICAgICB3aGlsZSAoaW5kZXggPCBmb3JtYXQubGVuZ3RoKSB7ICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICghaW5Fc2NhcGVkU2VnbWVudCAmJiBmb3JtYXRbaW5kZXhdID09PSAnWycpIHtcclxuICAgICAgICAgICAgICAgIGluRXNjYXBlZFNlZ21lbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgaW5kZXgrKztcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGluRXNjYXBlZFNlZ21lbnQgJiYgZm9ybWF0W2luZGV4XSA9PT0gJ10nKSB7XHJcbiAgICAgICAgICAgICAgICBpbkVzY2FwZWRTZWdtZW50ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaW5Fc2NhcGVkU2VnbWVudCkge1xyXG4gICAgICAgICAgICAgICAgdGV4dEJ1ZmZlciArPSBmb3JtYXRbaW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgaW5kZXgrKztcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGZvcm1hdEJsb2Nrcy5zb21lKChibG9jazpJRm9ybWF0QmxvY2spID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZpbmRBdChmb3JtYXQsIGluZGV4LCBgeyR7YmxvY2suY29kZX19YCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBwdXNoUGxhaW5UZXh0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZVBhcnRzLnB1c2gobmV3IERhdGVQYXJ0KGJsb2NrLCBmYWxzZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGluY3JlbWVudCA9IGJsb2NrLmNvZGUubGVuZ3RoICsgMjtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5maW5kQXQoZm9ybWF0LCBpbmRleCwgYmxvY2suY29kZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBwdXNoUGxhaW5UZXh0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZVBhcnRzLnB1c2gobmV3IERhdGVQYXJ0KGJsb2NrKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5jcmVtZW50ID0gYmxvY2suY29kZS5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pKSB7XHJcbiAgICAgICAgICAgICAgICBpbmRleCArPSBpbmNyZW1lbnQ7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0QnVmZmVyICs9IGZvcm1hdFtpbmRleF07XHJcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1c2hQbGFpblRleHQoKTtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gZGF0ZVBhcnRzO1xyXG4gICAgfSAgICBcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgZmluZEF0KHN0cjpzdHJpbmcsIGluZGV4Om51bWJlciwgc2VhcmNoOnN0cmluZykge1xyXG4gICAgICAgIHJldHVybiBzdHIuc2xpY2UoaW5kZXgsIGluZGV4ICsgc2VhcmNoLmxlbmd0aCkgPT09IHNlYXJjaDtcclxuICAgIH1cclxufSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
