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
/// <reference path="OptionSanitizer.ts" />
/// <reference path="FormatBlocks.ts" />
/// <reference path="DatePart.ts" />
/// <reference path="DisplayParser.ts" />
window['Datium'] = (function () {
    var options;
    return (function () {
        function class_2(opts) {
            new DatepickerInput(opts.element, 'h:mma {ddd} MMM Do, YYYY');
            this.updateOptions(opts);
        }
        class_2.prototype.updateOptions = function (opts) {
            options = OptionSanitizer.sanitize(opts);
        };
        return class_2;
    })();
})();
var DatepickerInput = (function () {
    function DatepickerInput(element, displayAs, minDate, maxDate) {
        this.element = element;
        this.minDate = minDate;
        this.maxDate = maxDate;
        this.shiftTabDown = false;
        this.tabDown = false;
        this.pasting = false;
        this.textBuffer = '';
        this.selecting = false;
        this.dateParts = DisplayParser.parse(displayAs);
        this.dateStringRegExp = this.concatRegExp(this.dateParts);
        this.bindEvents();
        this.element.setAttribute('spellcheck', 'false');
        this.update(new Date());
    }
    DatepickerInput.prototype.concatRegExp = function (dateParts) {
        var regExp = '';
        dateParts.forEach(function (datePart) {
            regExp += datePart.getRegExpString();
        });
        return new RegExp("^" + regExp + "$", 'i');
    };
    DatepickerInput.prototype.bindEvents = function () {
        var _this = this;
        this.element.addEventListener('focus', function () { return _this.focus(); });
        this.element.addEventListener('keydown', function (e) { return _this.keydown(e); });
        this.element.addEventListener('paste', function () { return _this.paste(); });
        document.addEventListener('keydown', function (e) {
            if (e.shiftKey && e.keyCode === 9 /* TAB */) {
                _this.shiftTabDown = true;
            }
            else if (e.keyCode === 9 /* TAB */) {
                _this.tabDown = true;
            }
            setTimeout(function () {
                _this.shiftTabDown = false;
                _this.tabDown = false;
            });
        });
        // Prevent Default
        this.element.addEventListener('dragenter', function (e) { return e.preventDefault(); });
        this.element.addEventListener('dragover', function (e) { return e.preventDefault(); });
        this.element.addEventListener('drop', function (e) { return e.preventDefault(); });
        this.element.addEventListener('cut', function (e) { return e.preventDefault(); });
        var caretStart;
        var down = false;
        var mousedown = function () {
            clearInterval(interval);
            down = true;
            _this.element.setSelectionRange(void 0, void 0);
            setTimeout(function () {
                caretStart = _this.element.selectionStart;
            });
        };
        var mouseup = function () {
            if (!down)
                return;
            down = false;
            var pos = _this.element.selectionStart === caretStart ? _this.element.selectionEnd : _this.element.selectionStart;
            _this.selectedIndex = _this.getNearestSelectableIndex(pos);
            if (_this.element.selectionStart > 0 || _this.element.selectionEnd < _this.element.value.length) {
                _this.update();
            }
        };
        var touchstart = function () {
            _this.element.removeEventListener('mousedown', mousedown);
            document.removeEventListener('mouseup', mouseup);
            document.removeEventListener('touchstart', touchstart);
        };
        this.element.addEventListener('mousedown', mousedown);
        document.addEventListener('mouseup', mouseup);
        document.addEventListener('touchstart', touchstart);
        var lastStart;
        var lastEnd;
        var interval = setInterval(function () {
            if (!_this.pasting &&
                (_this.element.selectionStart !== 0 ||
                    _this.element.selectionEnd !== _this.element.value.length) &&
                (_this.element.selectionStart !== lastStart ||
                    _this.element.selectionEnd !== lastEnd)) {
                _this.selectedIndex = _this.getNearestSelectableIndex(_this.element.selectionStart + (_this.element.selectionEnd - _this.element.selectionStart) / 2);
                _this.update();
            }
            lastStart = _this.element.selectionStart;
            lastEnd = _this.element.selectionEnd;
        });
    };
    DatepickerInput.prototype.paste = function () {
        var _this = this;
        this.pasting = true;
        var originalValue = this.element.value;
        setTimeout(function () {
            if (!_this.dateStringRegExp.test(_this.element.value)) {
                _this.element.value = originalValue;
                _this.pasting = false;
                return;
            }
            var newDate = new Date(_this.curDate.valueOf());
            var strPrefix = '';
            _this.dateParts.forEach(function (datePart) {
                var val = _this.element.value.replace(strPrefix, '').match(datePart.getRegExpString())[0];
                strPrefix += val;
                if (!datePart.isSelectable())
                    return;
                newDate = datePart.getDateFromString(newDate, val);
            });
            _this.update(newDate);
            _this.pasting = false;
        });
    };
    DatepickerInput.prototype.keydown = function (e) {
        if ((e.keyCode === 36 /* HOME */ || e.keyCode === 35 /* END */) && e.shiftKey)
            return;
        if (e.keyCode === 67 /* C */ && e.ctrlKey)
            return;
        if (e.keyCode === 65 /* A */ && e.ctrlKey)
            return;
        if (e.keyCode === 86 /* V */ && e.ctrlKey)
            return;
        if ((e.keyCode === 37 /* LEFT */ || e.keyCode === 39 /* RIGHT */) && e.shiftKey)
            return;
        if (e.keyCode === 36 /* HOME */) {
            this.selectedIndex = this.getFirstSelectable();
            this.update();
            e.preventDefault();
        }
        else if (e.keyCode === 35 /* END */) {
            this.selectedIndex = this.getLastSelectable();
            this.update();
            e.preventDefault();
        }
        else if (e.keyCode === 37 /* LEFT */) {
            this.selectedIndex = this.getPreviousSelectable();
            this.update();
            e.preventDefault();
        }
        else if (e.shiftKey && e.keyCode === 9 /* TAB */) {
            var previousSelectable = this.getPreviousSelectable();
            if (previousSelectable !== this.selectedIndex) {
                this.selectedIndex = previousSelectable;
                this.update();
                e.preventDefault();
            }
        }
        else if (e.keyCode === 39 /* RIGHT */) {
            this.selectedIndex = this.getNextSelectable();
            this.update();
            e.preventDefault();
        }
        else if (e.keyCode === 9 /* TAB */) {
            var nextSelectable = this.getNextSelectable();
            if (nextSelectable !== this.selectedIndex) {
                this.selectedIndex = nextSelectable;
                this.update();
                e.preventDefault();
            }
        }
        else if (e.keyCode === 38 /* UP */) {
            var newDate = this.dateParts[this.selectedIndex].increment(this.curDate);
            this.update(newDate);
            e.preventDefault();
        }
        else if (e.keyCode === 40 /* DOWN */) {
            var newDate = this.dateParts[this.selectedIndex].decrement(this.curDate);
            this.update(newDate);
            e.preventDefault();
        }
        else {
            e.preventDefault();
        }
        var keyPressed = {
            '48': '0', '96': '0', '49': '1', '97': '1',
            '50': '2', '98': '2', '51': '3', '99': '3',
            '52': '4', '100': '4', '53': '5', '101': '5',
            '54': '6', '102': '6', '55': '7', '103': '7',
            '56': '8', '104': '8', '57': '9', '105': '9',
            '65': 'a', '66': 'b', '67': 'c', '68': 'd',
            '69': 'e', '70': 'f', '71': 'g', '72': 'h',
            '73': 'i', '74': 'j', '75': 'k', '76': 'l',
            '77': 'm', '78': 'n', '79': 'o', '80': 'p',
            '81': 'q', '82': 'r', '83': 's', '84': 't',
            '85': 'u', '86': 'v', '87': 'w', '88': 'x',
            '89': 'y', '90': 'z'
        }[e.keyCode];
        if (e.keyCode === 8 /* BACKSPACE */) {
            this.backspace();
        }
        else if (keyPressed !== void 0) {
            this.textBuffer += keyPressed;
        }
        else if (!e.shiftKey) {
            this.textBuffer = '';
        }
        if (this.textBuffer.length > 0) {
            var orig = this.curDate.valueOf();
            var result = this.dateParts[this.selectedIndex].getDateFromString(this.curDate, this.textBuffer);
            if (result !== void 0 && this.dateParts[this.selectedIndex].getMaxBufferSize(result) !== void 0 && this.textBuffer.length >= this.dateParts[this.selectedIndex].getMaxBufferSize(result)) {
                this.selectedIndex = this.getNextSelectable();
            }
            if (result === void 0) {
                this.textBuffer = this.textBuffer.slice(0, this.textBuffer.length - 1);
            }
            else {
                this.update(result);
            }
        }
    };
    DatepickerInput.prototype.backspace = function () {
        if (this.textBuffer.length < 2) {
            var orig = this.curDate.valueOf();
            var result = this.dateParts[this.selectedIndex].getDateFromString(this.curDate, 'ZERO_OUT');
            if (result.valueOf() !== orig) {
                this.update(result);
            }
        }
        this.textBuffer = this.textBuffer.slice(0, this.textBuffer.length - 1);
    };
    DatepickerInput.prototype.getPreviousSelectable = function () {
        var index = this.selectedIndex;
        while (--index >= 0) {
            if (this.dateParts[index].isSelectable())
                return index;
        }
        return this.selectedIndex;
    };
    DatepickerInput.prototype.getNextSelectable = function () {
        var index = this.selectedIndex;
        while (++index < this.dateParts.length) {
            if (this.dateParts[index].isSelectable())
                return index;
        }
        return this.selectedIndex;
    };
    DatepickerInput.prototype.getNearestSelectableIndex = function (caretPosition) {
        var pos = 0;
        var nearestSelectableIndex;
        var nearestSelectableDistance;
        for (var i = 0; i < this.dateParts.length; i++) {
            if (this.dateParts[i].isSelectable()) {
                var fromLeft = caretPosition - pos;
                var fromRight = caretPosition - (pos + this.dateParts[i].toString().length);
                if (fromLeft > 0 && fromRight < 0)
                    return i;
                var dist = Math.min(Math.abs(fromLeft), Math.abs(fromRight));
                if (nearestSelectableIndex == void 0 || dist <= nearestSelectableDistance) {
                    nearestSelectableIndex = i;
                    nearestSelectableDistance = dist;
                }
            }
            pos += this.dateParts[i].toString().length;
        }
        return nearestSelectableIndex;
    };
    DatepickerInput.prototype.focus = function () {
        var _this = this;
        if (this.tabDown) {
            this.selectedIndex = this.getFirstSelectable();
            setTimeout(function () {
                _this.update();
            });
        }
        else if (this.shiftTabDown) {
            this.selectedIndex = this.getLastSelectable();
            setTimeout(function () {
                _this.update();
            });
        }
    };
    DatepickerInput.prototype.getFirstSelectable = function () {
        for (var i = 0; i < this.dateParts.length; i++) {
            if (this.dateParts[i].isSelectable())
                return i;
        }
        return void 0;
    };
    DatepickerInput.prototype.getLastSelectable = function () {
        for (var i = this.dateParts.length - 1; i >= 0; i--) {
            if (this.dateParts[i].isSelectable())
                return i;
        }
        return void 0;
    };
    DatepickerInput.prototype.update = function (date) {
        if (date === void 0)
            date = this.curDate;
        if (this.minDate !== void 0 && date.valueOf() < this.minDate.valueOf())
            date = new Date(this.minDate.valueOf());
        if (this.maxDate !== void 0 && date.valueOf() < this.maxDate.valueOf())
            date = new Date(this.maxDate.valueOf());
        if (this.selectedIndex !== this.lastSelectedIndex) {
            this.textBuffer = '';
        }
        this.lastSelectedIndex = this.selectedIndex;
        this.curDate = new Date(date.valueOf());
        var dateString = '';
        this.dateParts.forEach(function (datePart) {
            dateString += datePart.setValue(date).toString();
        });
        this.element.value = dateString;
        this.updateSelection();
    };
    DatepickerInput.prototype.updateSelection = function () {
        if (this.selectedIndex === void 0 || document.activeElement !== this.element)
            return;
        var start = 0;
        for (var i = 0; i < this.selectedIndex; i++) {
            start += this.dateParts[i].toString().length;
        }
        var end = start + this.dateParts[this.selectedIndex].toString().length;
        this.element.setSelectionRange(start, end);
    };
    return DatepickerInput;
})();
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZvcm1hdEJsb2Nrcy50cyIsIkRhdGVQYXJ0LnRzIiwiT3B0aW9uU2FuaXRpemVyLnRzIiwiRGlzcGxheVBhcnNlci50cyIsIkRhdGl1bS50cyJdLCJuYW1lcyI6WyJEYXRlQ2hhaW4iLCJEYXRlQ2hhaW4uY29uc3RydWN0b3IiLCJEYXRlQ2hhaW4uc2V0U2Vjb25kcyIsIkRhdGVDaGFpbi5pbmNTZWNvbmRzIiwiRGF0ZUNoYWluLmRlY1NlY29uZHMiLCJEYXRlQ2hhaW4uc2V0TWludXRlcyIsIkRhdGVDaGFpbi5pbmNNaW51dGVzIiwiRGF0ZUNoYWluLmRlY01pbnV0ZXMiLCJEYXRlQ2hhaW4uc2V0SG91cnMiLCJEYXRlQ2hhaW4uaW5jSG91cnMiLCJEYXRlQ2hhaW4uZGVjSG91cnMiLCJEYXRlQ2hhaW4uc2V0TWlsaXRhcnlIb3VycyIsIkRhdGVDaGFpbi5zZXREYXRlIiwiRGF0ZUNoYWluLmluY0RhdGUiLCJEYXRlQ2hhaW4uZGVjRGF0ZSIsIkRhdGVDaGFpbi5zZXREYXkiLCJEYXRlQ2hhaW4uaW5jRGF5IiwiRGF0ZUNoYWluLmRlY0RheSIsIkRhdGVDaGFpbi5zZXRNb250aCIsIkRhdGVDaGFpbi5pbmNNb250aCIsIkRhdGVDaGFpbi5kZWNNb250aCIsIkRhdGVDaGFpbi5zZXRNb250aFN0cmluZyIsIkRhdGVDaGFpbi5zZXRZZWFyIiwiRGF0ZUNoYWluLnNldFR3b0RpZ2l0WWVhciIsIkRhdGVDaGFpbi5zZXRVbml4U2Vjb25kVGltZXN0YW1wIiwiRGF0ZUNoYWluLnNldFVuaXhNaWxsaXNlY29uZFRpbWVzdGFtcCIsIkRhdGVDaGFpbi5zZXRNZXJpZGllbSIsIkRhdGVDaGFpbi5pbmNNZXJpZGllbSIsIkRhdGVDaGFpbi5kZWNNZXJpZGllbSIsIkRhdGVDaGFpbi5kYXlzSW5Nb250aCIsIkRhdGVDaGFpbi5tYXhNb250aFN0cmluZ0J1ZmZlciIsIkRhdGVDaGFpbi5tYXhNb250aEJ1ZmZlciIsIkRhdGVDaGFpbi5tYXhEYXRlQnVmZmVyIiwiRGF0ZUNoYWluLm1heERheVN0cmluZ0J1ZmZlciIsIkRhdGVDaGFpbi5tYXhNaWxpdGFyeUhvdXJzQnVmZmVyIiwiRGF0ZUNoYWluLm1heEhvdXJzQnVmZmVyIiwiRGF0ZUNoYWluLm1heE1pbnV0ZXNCdWZmZXIiLCJEYXRlQ2hhaW4ubWF4U2Vjb25kc0J1ZmZlciIsImNoYWluIiwiZ2V0VVRDT2Zmc2V0IiwicGFkIiwiYXBwZW5kT3JkaW5hbCIsInRvU3RhbmRhcmRUaW1lIiwiRGF0ZVBhcnQiLCJEYXRlUGFydC5jb25zdHJ1Y3RvciIsIkRhdGVQYXJ0LnJlZ0V4cEVzY2FwZSIsIkRhdGVQYXJ0LmluY3JlbWVudCIsIkRhdGVQYXJ0LmRlY3JlbWVudCIsIkRhdGVQYXJ0LnNldFZhbHVlIiwiRGF0ZVBhcnQudG9TdHJpbmciLCJEYXRlUGFydC5pc1NlbGVjdGFibGUiLCJEYXRlUGFydC5nZXRSZWdFeHBTdHJpbmciLCJEYXRlUGFydC5nZXREYXRlRnJvbVN0cmluZyIsIkRhdGVQYXJ0LmdldE1heEJ1ZmZlclNpemUiLCJjb25zdHJ1Y3RvciIsInNhbml0aXplIiwiRGlzcGxheVBhcnNlciIsIkRpc3BsYXlQYXJzZXIuY29uc3RydWN0b3IiLCJEaXNwbGF5UGFyc2VyLnBhcnNlIiwiRGlzcGxheVBhcnNlci5maW5kQXQiLCJ1cGRhdGVPcHRpb25zIiwiRGF0ZXBpY2tlcklucHV0IiwiRGF0ZXBpY2tlcklucHV0LmNvbnN0cnVjdG9yIiwiRGF0ZXBpY2tlcklucHV0LmNvbmNhdFJlZ0V4cCIsIkRhdGVwaWNrZXJJbnB1dC5iaW5kRXZlbnRzIiwiRGF0ZXBpY2tlcklucHV0LnBhc3RlIiwiRGF0ZXBpY2tlcklucHV0LmtleWRvd24iLCJEYXRlcGlja2VySW5wdXQuYmFja3NwYWNlIiwiRGF0ZXBpY2tlcklucHV0LmdldFByZXZpb3VzU2VsZWN0YWJsZSIsIkRhdGVwaWNrZXJJbnB1dC5nZXROZXh0U2VsZWN0YWJsZSIsIkRhdGVwaWNrZXJJbnB1dC5nZXROZWFyZXN0U2VsZWN0YWJsZUluZGV4IiwiRGF0ZXBpY2tlcklucHV0LmZvY3VzIiwiRGF0ZXBpY2tlcklucHV0LmdldEZpcnN0U2VsZWN0YWJsZSIsIkRhdGVwaWNrZXJJbnB1dC5nZXRMYXN0U2VsZWN0YWJsZSIsIkRhdGVwaWNrZXJJbnB1dC51cGRhdGUiLCJEYXRlcGlja2VySW5wdXQudXBkYXRlU2VsZWN0aW9uIl0sIm1hcHBpbmdzIjoiQUFXQSxJQUFJLFlBQVksR0FBa0IsQ0FBQztJQUUvQixJQUFNLFVBQVUsR0FBWSxDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDdkosSUFBTSxRQUFRLEdBQVksQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUV6RztRQUVJQSxtQkFBWUEsSUFBU0E7WUFDakJDLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBLENBQUNBO1FBQ3pDQSxDQUFDQTtRQUVNRCw4QkFBVUEsR0FBakJBLFVBQWtCQSxPQUFxQkE7WUFDbkNFLElBQUlBLEdBQVVBLENBQUNBO1lBQ2ZBLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLEtBQUtBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBO2dCQUN6QkEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3hCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtZQUNoQkEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsT0FBT0EsS0FBS0EsUUFBUUEsSUFBSUEsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FB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QUNBO2dCQUMvQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7WUFDaEJBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLEtBQUtBLEtBQUtBLFFBQVFBLElBQUlBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUMxREEsR0FBR0EsR0FBR0EsUUFBUUEsQ0FBU0EsS0FBS0EsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7WUFDdENBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLEtBQUtBLEtBQUtBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO2dCQUNuQ0EsR0FBR0EsR0FBR0EsS0FBS0EsQ0FBQ0E7WUFDaEJBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLENBQUNBO2dCQUNKQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDbkJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1lBQ2hCQSxDQUFDQTtZQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxHQUFHQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFBQ0EsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFDdkJBLEVBQUVBLENBQUNBLENBQUNBLEdBQUdBLEdBQUdBLENBQUNBLElBQUlBLEdBQUdBLEdBQUdBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO2dCQUN0QkEsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ25CQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtZQUNoQkEsQ0FBQ0E7WUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsS0FBS0EsRUFBRUEsSUFBSUEsUUFBUUEsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2xDQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQTtZQUNaQSxDQUFDQTtZQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxHQUFHQSxLQUFLQSxFQUFFQSxJQUFJQSxRQUFRQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDbENBLEdBQUdBLElBQUlBLEVBQUVBLENBQUNBO1lBQ2RBLENBQUNBO1lBQ0RBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1lBQ3hCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNoQkEsQ0FBQ0E7UUFFTVIsNEJBQVFBLEdBQWZBO1lBQ0lTLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO1lBQ2pDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxHQUFHQSxFQUFFQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUN6Q0EsQ0FBQ0E7UUFFTVQsNEJBQVFBLEdBQWZBO1lBQ0lVLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO1lBQ2pDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUN6Q0EsQ0FBQ0E7UUFFTVYsb0NBQWdCQSxHQUF2QkEsVUFBd0JBLEtBQW1CQTtZQUN2Q1csSUFBSUEsR0FBVUEsQ0FBQ0E7WUFDZkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsS0FBS0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3ZCQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDdEJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1lBQ2hCQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxLQUFLQSxLQUFLQSxR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LEdBQUdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLEVBQUVBLEdBQUdBLEVBQUVBLENBQUNBO1lBQ2xDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxHQUFHQSxFQUFFQSxHQUFHQSxDQUFDQSxHQUFHQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUM5Q0EsQ0FBQ0E7UUFFTTNCLCtCQUFXQSxHQUFsQkE7WUFDSTRCLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLEVBQUVBLEdBQUdBLEVBQUVBLENBQUNBO1lBQ2xDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUM3Q0EsQ0FBQ0E7UUFFTzVCLCtCQUFXQSxHQUFuQkE7WUFDSTZCLE1BQU1BLENBQUNBLElBQUlBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLEVBQUVBLEdBQUdBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBO1FBQ3BGQSxDQUFDQTtRQUVNN0Isd0NBQW9CQSxHQUEzQkE7WUFDSThCLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBO1lBQzdCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUE7WUFDN0JBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO2dCQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQTtZQUM3QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7Z0JBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BO1lBQzdCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUE7WUFDN0JBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO2dCQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQTtZQUM3QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7Z0JBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BO1lBQzdCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUE7WUFDN0JBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO2dCQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQTtZQUM3QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7Z0JBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BO1lBQzdCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUE7WUFDN0JBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLEVBQUVBLENBQUNBO2dCQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQTtZQUM5QkEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUE7UUFDcEJBLENBQUNBO1FBRU05QixrQ0FBY0EsR0FBckJBO1lBQ0krQixNQUFNQSxD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R0FBR0EsRUFBRUEsS0FBS0EsRUFBRUEsR0FBR0E7WUFDNUNBLElBQUlBLEVBQUVBLEdBQUdBLEVBQUVBLEtBQUtBLEVBQUVBLEdBQUdBLEVBQUVBLElBQUlBLEVBQUVBLEdBQUdBLEVBQUVBLEtBQUtBLEVBQUVBLEdBQUdBO1lBQzVDQSxJQUFJQSxFQUFFQSxHQUFHQSxFQUFFQSxJQUFJQSxFQUFFQSxHQUFHQSxFQUFFQSxJQUFJQSxFQUFFQSxHQUFHQSxFQUFFQSxJQUFJQSxFQUFFQSxHQUFHQTtZQUMxQ0EsSUFBSUEsRUFBRUEsR0FBR0EsRUFBRUEsSUFBSUEsRUFBRUEsR0FBR0EsRUFBRUEsSUFBSUEsRUFBRUEsR0FBR0EsRUFBRUEsSUFBSUEsRUFBRUEsR0FBR0E7WUFDMUNBLElBQUlBLEVBQUVBLEdBQUdBLEVBQUVBLElBQUlBLEVBQUVBLEdBQUdBLEVBQUVBLElBQUlBLEVBQUVBLEdBQUdBLEVBQUVBLElBQUlBLEVBQUVBLEdBQUdBO1lBQzFDQSxJQUFJQSxFQUFFQSxHQUFHQSxFQUFFQSxJQUFJQSxFQUFFQSxHQUFHQSxFQUFFQSxJQUFJQSxFQUFFQSxHQUFHQSxFQUFFQSxJQUFJQSxFQUFFQSxHQUFHQTtZQUMxQ0EsSUFBSUEsRUFBRUEsR0FBR0EsRUFBRUEsSUFBSUEsRUFBRUEsR0FBR0EsRUFBRUEsSUFBSUEsRUFBRUEsR0FBR0EsRUFBRUEsSUFBSUEsRUFBRUEsR0FBR0E7WUFDMUNBLElBQUlBLEVBQUVBLEdBQUdBLEVBQUVBLElBQUlBLEVBQUVBLEdBQUdBLEVBQUVBLElBQUlBLEVBQUVBLEdBQUdBLEVBQUVBLElBQUlBLEVBQUVBLEdBQUdBO1lBQzFDQSxJQUFJQSxFQUFFQSxHQUFHQSxFQUFFQSxJQUFJQSxFQUFFQSxHQUFHQTtTQUN0QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFFZEEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsT0FBT0EsS0FBS0EsaUJBQWtCQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNuQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0E7UUFDckJBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLFVBQVVBLEtBQUtBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQy9CQSxJQUFJQSxDQUFDQSxVQUFVQSxJQUFJQSxVQUFVQSxDQUFDQTtRQUNsQ0EsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDckJBLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLEVBQUVBLENBQUNBO1FBQ3pCQSxDQUFDQTtRQUVEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM3QkEsSUFBSUEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0E7WUFDbENBLElBQUlBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsRUFBRUEsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0E7WUFDakdBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLEtBQUtBLEtBQUtBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsS0FBS0EsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsTUFBTUEsSUFBSUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDdkxBLElBQUlBLENBQUNBLGFBQWFBLEdBQUdBLElBQUlBLENBQUNBLGlCQUFpQkEsRUFBRUEsQ0FBQ0E7WUFDbERBLENBQUNBO1lBQ0RBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLEtBQUtBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUNwQkEsSUFBSUEsQ0FBQ0EsVUFBVUEsR0FBR0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDM0VBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLENBQUNBO2dCQUNKQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtZQUN4QkEsQ0FBQ0E7UUFDTEEsQ0FBQ0E7SUFDTEEsQ0FBQ0E7SUFFT0wsbUNBQVNBLEdBQWpCQTtRQUNJTSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM3QkEsSUFBSUEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0E7WUFDbENBLElBQUlBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsRUFBRUEsVUFBVUEsQ0FBQ0EsQ0FBQ0E7WUFDNUZBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLE9BQU9BLEVBQUVBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO2dCQUM1QkEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7WUFDeEJBLENBQUNBO1FBQ0xBLENBQUNBO1FBQ0RBLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLEtB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QSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQTtZQUNsREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsWUFBWUEsRUFBRUEsQ0FBQ0E7Z0JBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO1FBQ25EQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUNsQkEsQ0FBQ0E7SUFLTVosZ0NBQU1BLEdBQWJBLFVBQWNBLElBQVVBO1FBQ3BCYSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxLQUFLQSxDQUFDQSxDQUFDQTtZQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQTtRQUN6Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsS0FBS0EsS0FBS0EsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsT0FBT0EsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0E7WUFBQ0EsSUFBSUEsR0FBR0EsSUFBSUEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7UUFDaEhBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLEtBQUtBLEtBQUtBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLE9BQU9BLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBO1lBQUNBLElBQUlBLEdBQUdBLElBQUlBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBLENBQUNBO1FBQ2hIQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxhQUFhQSxLQUFLQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLENBQUNBLENBQUNBO1lBQ2hEQSxJQUFJQSxDQUFDQSxVQUFVQSxHQUFHQSxFQUFFQSxDQUFDQTtRQUN6QkEsQ0FBQ0E7UUFDREEsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxHQUFHQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQTtRQUU1Q0EsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsSUFBSUEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7UUFDeENBLElBQUlBLFVBQVVBLEdBQUdBLEVBQUVBLENBQUNBO1FBRXBCQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxPQUFPQSxDQUFDQSxVQUFDQSxRQUFRQTtZQUM1QkEsVUFBVUEsSUFBSUEsUUFBUUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0E7UUFDckRBLENBQUNBLENBQUNBLENBQUNBO1FBRUhBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLEtBQUtBLEdBQUdBLFVBQVVBLENBQUNBO1FBQ2hDQSxJQUFJQSxDQUFDQSxlQUFlQSxFQUFFQSxDQUFDQTtJQUMzQkEsQ0FBQ0E7SUFFT2IseUNBQWVBLEdBQXZCQTtRQUNJYyxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxhQUFhQSxLQUFLQSxLQUFLQSxDQUFDQSxJQUFJQSxRQUFRQSxDQUFDQSxhQUFhQSxLQUFLQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQTtRQUNyRkEsSUFBSUEsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDZEEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsYUFBYUEsRUFBRUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0E7WUFDMUNBLEtBQUtBLElBQUlBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBLE1BQU1BLENBQUNBO1FBQ2pEQSxDQUFDQTtRQUNEQSxJQUFJQSxHQUFHQSxHQUFHQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxRQUFRQSxFQUFFQSxDQUFDQSxNQUFNQSxDQUFDQTtRQUN2RUEsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxLQUFLQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUMvQ0EsQ0FBQ0E7SUFDTGQsc0JBQUNBO0FBQURBLENBOVRBLEFBOFRDQSxJQUFBIiwiZmlsZSI6ImRhdGl1bS5qcyIsInNvdXJjZXNDb250ZW50IjpbImludGVyZmFjZSBJRm9ybWF0QmxvY2sge1xuICAgIGNvZGU6c3RyaW5nO1xuICAgIHN0cihkOkRhdGUpOnN0cmluZztcbiAgICByZWdFeHA/OnN0cmluZztcbiAgICAvLyBsZWF2aW5nIGluYywgZGVjIGFuZCBzZXQgdW5zZXQgd2lsbCBtYWtlIHRoZSBibG9jayB1bnNlbGVjdGFibGVcbiAgICBpbmM/KGQ6RGF0ZSk6RGF0ZTtcbiAgICBkZWM/KGQ6RGF0ZSk6RGF0ZTtcbiAgICBzZXQ/KGQ6RGF0ZSwgdjpzdHJpbmd8bnVtYmVyKTpEYXRlO1xuICAgIG1heEJ1ZmZlcj8oZDpEYXRlKTpudW1iZXI7XG59XG5cbmxldCBmb3JtYXRCbG9ja3M6SUZvcm1hdEJsb2NrW10gPSAoZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgY29uc3QgbW9udGhOYW1lczpzdHJpbmdbXSA9IFsnSmFudWFyeScsICdGZWJydWFyeScsICdNYXJjaCcsICdBcHJpbCcsICdNYXknLCAnSnVuZScsICdKdWx5JywgJ0F1Z3VzdCcsICdTZXB0ZW1iZXInLCAnT2N0b2JlcicsICdOb3ZlbWJlcicsICdEZWNlbWJlciddO1xuICAgIGNvbnN0IGRheU5hbWVzOnN0cmluZ1tdID0gWydTdW5kYXknLCAnTW9uZGF5JywgJ1R1ZXNkYXknLCAnV2VkbmVzZGF5JywgJ1RodXJzZGF5JywgJ0ZyaWRheScsICdTYXR1cmRheSddO1xuXG4gICAgY2xhc3MgRGF0ZUNoYWluIHtcbiAgICAgICAgcHVibGljIGRhdGU6RGF0ZTtcbiAgICAgICAgY29uc3RydWN0b3IoZGF0ZTpEYXRlKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZShkYXRlLnZhbHVlT2YoKSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBzZXRTZWNvbmRzKHNlY29uZHM6c3RyaW5nfG51bWJlcik6RGF0ZUNoYWluIHtcbiAgICAgICAgICAgIGxldCBudW06bnVtYmVyO1xuICAgICAgICAgICAgaWYgKHNlY29uZHMgPT09ICdaRVJPX09VVCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0U2Vjb25kcygwKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHNlY29uZHMgPT09ICdzdHJpbmcnICYmIC9eXFxkKyQvLnRlc3Qoc2Vjb25kcykpIHtcbiAgICAgICAgICAgICAgICBudW0gPSBwYXJzZUludCg8c3RyaW5nPnNlY29uZHMsIDEwKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHNlY29uZHMgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgbnVtID0gc2Vjb25kcztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG51bSA8IDAgfHwgbnVtID4gNTkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0U2Vjb25kcyhudW0pO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBpbmNTZWNvbmRzKCk6RGF0ZUNoYWluIHtcbiAgICAgICAgICAgIGxldCBuID0gdGhpcy5kYXRlLmdldFNlY29uZHMoKSArIDE7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRTZWNvbmRzKG4gPiA1OSA/IDAgOiBuKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGRlY1NlY29uZHMoKTpEYXRlQ2hhaW4ge1xuICAgICAgICAgICAgbGV0IG4gPSB0aGlzLmRhdGUuZ2V0U2Vjb25kcygpIC0gMTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFNlY29uZHMobiA8IDAgPyA1OSA6IG4pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgc2V0TWludXRlcyhtaW51dGVzOnN0cmluZ3xudW1iZXIpOkRhdGVDaGFpbiB7XG4gICAgICAgICAgICBsZXQgbnVtOm51bWJlcjtcbiAgICAgICAgICAgIGlmIChtaW51dGVzID09PSAnWkVST19PVVQnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1pbnV0ZXMoMCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBtaW51dGVzID09PSAnc3RyaW5nJyAmJiAvXlxcZCskLy50ZXN0KG1pbnV0ZXMpKSB7XG4gICAgICAgICAgICAgICAgbnVtID0gcGFyc2VJbnQoPHN0cmluZz5taW51dGVzLCAxMCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBtaW51dGVzID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIG51bSA9IG1pbnV0ZXM7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChudW0gPCAwIHx8IG51bSA+IDU5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1pbnV0ZXMobnVtKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgaW5jTWludXRlcygpOkRhdGVDaGFpbiB7XG4gICAgICAgICAgICBsZXQgbiA9IHRoaXMuZGF0ZS5nZXRNaW51dGVzKCkgKyAxO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0TWludXRlcyhuID4gNTkgPyAwIDogbik7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBkZWNNaW51dGVzKCk6RGF0ZUNoYWluIHtcbiAgICAgICAgICAgIGxldCBuID0gdGhpcy5kYXRlLmdldE1pbnV0ZXMoKSAtIDE7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRNaW51dGVzKG4gPCAwID8gNTkgOiBuKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHNldEhvdXJzKGhvdXJzOnN0cmluZ3xudW1iZXIpOkRhdGVDaGFpbiB7XG4gICAgICAgICAgICBsZXQgbnVtOm51bWJlcjtcbiAgICAgICAgICAgIGxldCBtZXJpZGllbSA9IHRoaXMuZGF0ZS5nZXRIb3VycygpID4gMTEgPyAnUE0nIDogJ0FNJztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKGhvdXJzID09PSAnWkVST19PVVQnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldEhvdXJzKG1lcmlkaWVtID09PSAnQU0nID8gMCA6IDEyKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGhvdXJzID09PSAnc3RyaW5nJyAmJiAvXlxcZCskLy50ZXN0KGhvdXJzKSkge1xuICAgICAgICAgICAgICAgIG51bSA9IHBhcnNlSW50KDxzdHJpbmc+aG91cnMsIDEwKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGhvdXJzID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIG51bSA9IGhvdXJzO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobnVtID09PSAwKSBudW0gPSAxO1xuICAgICAgICAgICAgaWYgKG51bSA8IDEgfHwgbnVtID4gMTIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChudW0gPT09IDEyICYmIG1lcmlkaWVtID09PSAnQU0nKSB7XG4gICAgICAgICAgICAgICAgbnVtID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChudW0gIT09IDEyICYmIG1lcmlkaWVtID09PSAnUE0nKSB7XG4gICAgICAgICAgICAgICAgbnVtICs9IDEyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5kYXRlLnNldEhvdXJzKG51bSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGluY0hvdXJzKCk6RGF0ZUNoYWluIHtcbiAgICAgICAgICAgIGxldCBuID0gdGhpcy5kYXRlLmdldEhvdXJzKCkgKyAxO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0SG91cnMobiA+IDIzID8gMCA6IG4pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgZGVjSG91cnMoKTpEYXRlQ2hhaW4ge1xuICAgICAgICAgICAgbGV0IG4gPSB0aGlzLmRhdGUuZ2V0SG91cnMoKSAtIDE7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRIb3VycyhuIDwgMCA/IDIzIDogbik7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBzZXRNaWxpdGFyeUhvdXJzKGhvdXJzOnN0cmluZ3xudW1iZXIpOkRhdGVDaGFpbiB7XG4gICAgICAgICAgICBsZXQgbnVtOm51bWJlcjtcbiAgICAgICAgICAgIGlmIChob3VycyA9PT0gJ1pFUk9fT1VUJykge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3VycygwKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGhvdXJzID09PSAnc3RyaW5nJyAmJiAvXlxcZCskLy50ZXN0KGhvdXJzKSkge1xuICAgICAgICAgICAgICAgIG51bSA9IHBhcnNlSW50KDxzdHJpbmc+aG91cnMsIDEwKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGhvdXJzID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIG51bSA9IGhvdXJzO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobnVtIDwgMCB8fCBudW0gPiAyMykge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGUuZ2V0SG91cnMoKSA9PT0gbnVtICsgMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3VycyhudW0pO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmRhdGUuZ2V0SG91cnMoKSAhPT0gbnVtKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3VycyhudW0gLSAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3VycyhudW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBzZXREYXRlKGRhdGU6c3RyaW5nfG51bWJlcik6RGF0ZUNoYWluIHtcbiAgICAgICAgICAgIGxldCBudW06bnVtYmVyO1xuICAgICAgICAgICAgaWYgKGRhdGUgPT09ICdaRVJPX09VVCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0RGF0ZSgxKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGRhdGUgPT09ICdzdHJpbmcnICYmIC9cXGR7MSwyfS4qJC8udGVzdChkYXRlKSkge1xuICAgICAgICAgICAgICAgIG51bSA9IHBhcnNlSW50KDxzdHJpbmc+ZGF0ZSwgMTApO1xuICAgICAgICAgICAgfSBlbHNlIGlmICAodHlwZW9mIGRhdGUgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgbnVtID0gZGF0ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG51bSA9PT0gMCkgbnVtID0gMTtcbiAgICAgICAgICAgIGlmIChudW0gPCAxIHx8IG51bSA+IHRoaXMuZGF5c0luTW9udGgoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXREYXRlKG51bSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGluY0RhdGUoKTpEYXRlQ2hhaW4ge1xuICAgICAgICAgICAgbGV0IG4gPSB0aGlzLmRhdGUuZ2V0RGF0ZSgpICsgMTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldERhdGUobiA+IHRoaXMuZGF5c0luTW9udGgoKSA/IDEgOiBuKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGRlY0RhdGUoKTpEYXRlQ2hhaW4ge1xuICAgICAgICAgICAgbGV0IG4gPSB0aGlzLmRhdGUuZ2V0RGF0ZSgpIC0gMTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldERhdGUobiA8IDAgPyB0aGlzLmRheXNJbk1vbnRoKCkgOiBuKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHNldERheShkYXk6c3RyaW5nfG51bWJlcik6RGF0ZUNoYWluIHtcbiAgICAgICAgICAgIGxldCBudW06bnVtYmVyO1xuICAgICAgICAgICAgaWYgKGRheSA9PT0gJ1pFUk9fT1VUJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldERheSgwKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGRheSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICBudW0gPSBkYXk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBkYXkgPT09ICdzdHJpbmcnICYmIGRheU5hbWVzLnNvbWUoKGRheU5hbWUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAobmV3IFJlZ0V4cChgXiR7ZGF5fS4qJGAsICdpJykudGVzdChkYXlOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICBudW0gPSBkYXlOYW1lcy5pbmRleE9mKGRheU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSkge1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChudW0gPCAwIHx8IG51bSA+IDYpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxldCBvZmZzZXQgPSB0aGlzLmRhdGUuZ2V0RGF5KCkgLSBudW07XG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0RGF0ZSh0aGlzLmRhdGUuZ2V0RGF0ZSgpIC0gb2Zmc2V0KTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgaW5jRGF5KCk6RGF0ZUNoYWluIHtcbiAgICAgICAgICAgIGxldCBuID0gdGhpcy5kYXRlLmdldERheSgpICsgMTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldERheShuID4gNiA/IDAgOiBuKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGRlY0RheSgpOkRhdGVDaGFpbiB7XG4gICAgICAgICAgICBsZXQgbiA9IHRoaXMuZGF0ZS5nZXREYXkoKSAtIDE7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXREYXkobiA8IDAgPyA2IDogbik7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBzZXRNb250aChtb250aDpzdHJpbmd8bnVtYmVyKTpEYXRlQ2hhaW4ge1xuICAgICAgICAgICAgbGV0IG51bTpudW1iZXI7XG4gICAgICAgICAgICBpZiAobW9udGggPT09ICdaRVJPX09VVCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0TW9udGgoMCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBtb250aCA9PT0gJ3N0cmluZycgJiYgL15cXGQrJC8udGVzdChtb250aCkpIHtcbiAgICAgICAgICAgICAgICBudW0gPSBwYXJzZUludChtb250aCwgMTApO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbW9udGggPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgbnVtID0gbW9udGg7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKG51bSA9PT0gMCkgbnVtID0gMTtcbiAgICAgICAgICAgIGlmIChudW0gPCAxIHx8IG51bSA+IDEyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0TW9udGgobnVtIC0gMSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGluY01vbnRoKCk6RGF0ZUNoYWluIHtcbiAgICAgICAgICAgIGxldCBuID0gdGhpcy5kYXRlLmdldE1vbnRoKCkgKyAyO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0RGF5KG4gPiAxMiA/IDEgOiBuKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGRlY01vbnRoKCk6RGF0ZUNoYWluIHtcbiAgICAgICAgICAgIGxldCBuID0gdGhpcy5kYXRlLmdldE1vbnRoKCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXREYXkobiA8IDEgPyAxMiA6IG4pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgc2V0TW9udGhTdHJpbmcobW9udGg6c3RyaW5nfG51bWJlcik6RGF0ZUNoYWluIHtcbiAgICAgICAgICAgIGxldCBudW06bnVtYmVyO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAobW9udGggPT09ICdaRVJPX09VVCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0TW9udGgoMCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBtb250aCA9PT0gJ3N0cmluZycgJiYgbW9udGhOYW1lcy5zb21lKChtb250aE5hbWUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAobmV3IFJlZ0V4cChgXiR7bW9udGh9LiokYCwgJ2knKS50ZXN0KG1vbnRoTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgbnVtID0gbW9udGhOYW1lcy5pbmRleE9mKG1vbnRoTmFtZSkgKyAxO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSkge1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChudW0gPCAxIHx8IG51bSA+IDEyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0TW9udGgobnVtIC0gMSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHNldFllYXIoeWVhcjpzdHJpbmd8bnVtYmVyKTpEYXRlQ2hhaW4ge1xuICAgICAgICAgICAgbGV0IG51bTpudW1iZXI7XG4gICAgICAgICAgICBpZiAoeWVhciA9PT0gJ1pFUk9fT1VUJykge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRGdWxsWWVhcigwKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHllYXIgPT09ICdzdHJpbmcnICYmIC9eXFxkKyQvLnRlc3QoeWVhcikpIHtcbiAgICAgICAgICAgICAgICBudW0gPSBwYXJzZUludCh5ZWFyLCAxMCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB5ZWFyID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIG51bSA9IHllYXI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH0gICAgICAgIFxuICAgICAgICAgICAgdGhpcy5kYXRlLnNldEZ1bGxZZWFyKG51bSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHNldFR3b0RpZ2l0WWVhcih5ZWFyOnN0cmluZ3xudW1iZXIpOkRhdGVDaGFpbiB7XG4gICAgICAgICAgICBsZXQgYmFzZSA9IE1hdGguZmxvb3IodGhpcy5kYXRlLmdldEZ1bGxZZWFyKCkvMTAwKSoxMDA7XG4gICAgICAgICAgICBsZXQgbnVtOm51bWJlcjtcbiAgICAgICAgICAgIGlmICh5ZWFyID09PSAnWkVST19PVVQnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldEZ1bGxZZWFyKGJhc2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgeWVhciA9PT0gJ3N0cmluZycgJiYgL15cXGQrJC8udGVzdCh5ZWFyKSkge1xuICAgICAgICAgICAgICAgIG51bSA9IHBhcnNlSW50KHllYXIsIDEwKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHllYXIgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgbnVtID0geWVhcjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfSAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0RnVsbFllYXIoYmFzZSArIG51bSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIHNldFVuaXhTZWNvbmRUaW1lc3RhbXAoc2Vjb25kczpzdHJpbmd8bnVtYmVyKTpEYXRlQ2hhaW4ge1xuICAgICAgICAgICAgbGV0IG51bTpudW1iZXI7XG4gICAgICAgICAgICBpZiAoc2Vjb25kcyA9PT0gJ1pFUk9fT1VUJykge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKDApO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygc2Vjb25kcyA9PT0gJ3N0cmluZycgJiYgL15cXGQrJC8udGVzdChzZWNvbmRzKSkge1xuICAgICAgICAgICAgICAgIG51bSA9IHBhcnNlSW50KHNlY29uZHMsIDEwKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHNlY29uZHMgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgbnVtID0gc2Vjb25kcztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfSAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZShudW0gKiAxMDAwKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgc2V0VW5peE1pbGxpc2Vjb25kVGltZXN0YW1wKG1pbGxpc2Vjb25kczpzdHJpbmd8bnVtYmVyKTpEYXRlQ2hhaW4ge1xuICAgICAgICAgICAgbGV0IG51bTpudW1iZXI7XG4gICAgICAgICAgICBpZiAobWlsbGlzZWNvbmRzID09PSAnWkVST19PVVQnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUoMCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBtaWxsaXNlY29uZHMgPT09ICdzdHJpbmcnICYmIC9eXFxkKyQvLnRlc3QobWlsbGlzZWNvbmRzKSkge1xuICAgICAgICAgICAgICAgIG51bSA9IHBhcnNlSW50KG1pbGxpc2Vjb25kcywgMTApO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbWlsbGlzZWNvbmRzID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIG51bSA9IG1pbGxpc2Vjb25kcztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfSAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZShudW0pO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBzZXRNZXJpZGllbShtZXJpZGllbTpzdHJpbmd8bnVtYmVyKTpEYXRlQ2hhaW4ge1xuICAgICAgICAgICAgbGV0IGhvdXJzID0gdGhpcy5kYXRlLmdldEhvdXJzKCk7XG4gICAgICAgICAgICBpZiAobWVyaWRpZW0gPT09ICdaRVJPX09VVCcpIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBtZXJpZGllbSA9PT0gJ3N0cmluZycgJiYgL15hbT8kL2kudGVzdCg8c3RyaW5nPm1lcmlkaWVtKSkge1xuICAgICAgICAgICAgICAgIGhvdXJzIC09IDEyO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbWVyaWRpZW0gPT09ICdzdHJpbmcnICYmIC9ecG0/JC9pLnRlc3QoPHN0cmluZz5tZXJpZGllbSkpIHtcbiAgICAgICAgICAgICAgICBob3VycyArPSAxMjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGhvdXJzIDwgMCB8fCBob3VycyA+IDIzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnMoaG91cnMpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBpbmNNZXJpZGllbSgpOkRhdGVDaGFpbiB7XG4gICAgICAgICAgICBsZXQgbiA9IHRoaXMuZGF0ZS5nZXRIb3VycygpICsgMTI7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRIb3VycyhuID4gMjMgPyBuIC0gMjQgOiBuKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIGRlY01lcmlkaWVtKCk6RGF0ZUNoYWluIHtcbiAgICAgICAgICAgIGxldCBuID0gdGhpcy5kYXRlLmdldEhvdXJzKCkgLSAxMjtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldEhvdXJzKG4gPCAwID8gbiArIDI0IDogbik7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHByaXZhdGUgZGF5c0luTW9udGgoKTpudW1iZXIge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHRoaXMuZGF0ZS5nZXRGdWxsWWVhcigpLCB0aGlzLmRhdGUuZ2V0TW9udGgoKSArIDEsIDApLmdldERhdGUoKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIG1heE1vbnRoU3RyaW5nQnVmZmVyKCk6bnVtYmVyIHtcbiAgICAgICAgICAgIGxldCBtID0gdGhpcy5kYXRlLmdldE1vbnRoKCk7XG4gICAgICAgICAgICBpZiAobSA9PT0gMCkgcmV0dXJuIDI7IC8vIEphblxuICAgICAgICAgICAgaWYgKG0gPT09IDEpIHJldHVybiAxOyAvLyBGZWJcbiAgICAgICAgICAgIGlmIChtID09PSAyKSByZXR1cm4gMzsgLy8gTWFyXG4gICAgICAgICAgICBpZiAobSA9PT0gMykgcmV0dXJuIDI7IC8vIEFwclxuICAgICAgICAgICAgaWYgKG0gPT09IDQpIHJldHVybiAzOyAvLyBNYXlcbiAgICAgICAgICAgIGlmIChtID09PSA1KSByZXR1cm4gMzsgLy8gSnVuXG4gICAgICAgICAgICBpZiAobSA9PT0gNikgcmV0dXJuIDM7IC8vIEp1bFxuICAgICAgICAgICAgaWYgKG0gPT09IDcpIHJldHVybiAyOyAvLyBBdWdcbiAgICAgICAgICAgIGlmIChtID09PSA4KSByZXR1cm4gMTsgLy8gU2VwXG4gICAgICAgICAgICBpZiAobSA9PT0gOSkgcmV0dXJuIDE7IC8vIE9jdFxuICAgICAgICAgICAgaWYgKG0gPT09IDEwKSByZXR1cm4gMTsgLy8gTm92XG4gICAgICAgICAgICByZXR1cm4gMTsgLy8gRGVjXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBtYXhNb250aEJ1ZmZlcigpOm51bWJlciB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldE1vbnRoKCkgPiAwID8gMSA6IDI7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBtYXhEYXRlQnVmZmVyKCk6bnVtYmVyIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0RGF0ZSgpICogMTAgPiB0aGlzLmRheXNJbk1vbnRoKCkgPyAxIDogMjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIG1heERheVN0cmluZ0J1ZmZlcigpOm51bWJlciB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldERheSgpICUgMiA9PSAwID8gMiA6IDE7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBtYXhNaWxpdGFyeUhvdXJzQnVmZmVyKCk6bnVtYmVyIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0SG91cnMoKSA+IDIgPyAxIDogMjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHVibGljIG1heEhvdXJzQnVmZmVyKCk6bnVtYmVyIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGUuZ2V0SG91cnMoKSA+IDExKSB7IC8vIFBNXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXRIb3VycygpID4gMTMgPyAxIDogMjtcbiAgICAgICAgICAgIH0gZWxzZSB7IC8vIEFNXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXRIb3VycygpID4gMSA/IDEgOiAyOyAgIFxuICAgICAgICAgICAgfSAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1YmxpYyBtYXhNaW51dGVzQnVmZmVyKCk6bnVtYmVyIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0TWludXRlcygpID4gNSA/IDEgOiAyO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwdWJsaWMgbWF4U2Vjb25kc0J1ZmZlcigpOm51bWJlciB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldFNlY29uZHMoKSA+IDUgPyAxIDogMjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNoYWluKGQ6RGF0ZSk6RGF0ZUNoYWluIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlQ2hhaW4oZCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0VVRDT2Zmc2V0KGRhdGU6RGF0ZSwgc2hvd0NvbG9uOmJvb2xlYW4pOnN0cmluZyB7XG4gICAgICAgIGxldCB0em8gPSAtZGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpO1xuICAgICAgICBsZXQgZGlmID0gdHpvID49IDAgPyAnKycgOiAnLSc7XG4gICAgICAgIGxldCBjb2xvbiA9IHNob3dDb2xvbiA/ICc6JyA6ICcnO1xuICAgICAgICByZXR1cm4gZGlmICsgcGFkKHR6byAvIDYwLCAyKSArIGNvbG9uICsgcGFkKHR6byAlIDYwLCAyKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYWQobnVtOm51bWJlciwgbGVuZ3RoOm51bWJlcik6c3RyaW5nIHtcbiAgICAgICAgbGV0IHBhZGRlZCA9IE1hdGguYWJzKG51bSkudG9TdHJpbmcoKTtcbiAgICAgICAgd2hpbGUgKHBhZGRlZC5sZW5ndGggPCBsZW5ndGgpIHBhZGRlZCA9ICcwJyArIHBhZGRlZDtcbiAgICAgICAgcmV0dXJuIHBhZGRlZDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhcHBlbmRPcmRpbmFsKG51bTpudW1iZXIpOnN0cmluZyB7XG4gICAgICAgIGxldCBqID0gbnVtICUgMTA7XG4gICAgICAgIGxldCBrID0gbnVtICUgMTAwO1xuICAgICAgICBpZiAoaiA9PSAxICYmIGsgIT0gMTEpIHJldHVybiBudW0gKyBcInN0XCI7XG4gICAgICAgIGlmIChqID09IDIgJiYgayAhPSAxMikgcmV0dXJuIG51bSArIFwibmRcIjtcbiAgICAgICAgaWYgKGogPT0gMyAmJiBrICE9IDEzKSByZXR1cm4gbnVtICsgXCJyZFwiO1xuICAgICAgICByZXR1cm4gbnVtICsgXCJ0aFwiO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRvU3RhbmRhcmRUaW1lKGhvdXJzOm51bWJlcik6bnVtYmVyIHtcbiAgICAgICAgaWYgKGhvdXJzID09PSAwKSByZXR1cm4gMTI7XG4gICAgICAgIHJldHVybiBob3VycyA+IDEyID8gaG91cnMgLSAxMiA6IGhvdXJzO1xuICAgIH0gICAgXG4gICAgXG4gICAgcmV0dXJuIDxJRm9ybWF0QmxvY2tbXT4gW1xuICAgICAgICB7IC8vIEZPVVIgRElHSVQgWUVBUlxuICAgICAgICAgICAgY29kZTogJ1lZWVknLFxuICAgICAgICAgICAgcmVnRXhwOiAnXFxcXGR7NCw0fScsXG4gICAgICAgICAgICBzdHI6IChkKSA9PiBkLmdldEZ1bGxZZWFyKCkudG9TdHJpbmcoKSxcbiAgICAgICAgICAgIGluYzogKGQpID0+IGNoYWluKGQpLnNldFllYXIoZC5nZXRGdWxsWWVhcigpICsgMSkuZGF0ZSxcbiAgICAgICAgICAgIGRlYzogKGQpID0+IGNoYWluKGQpLnNldFllYXIoZC5nZXRGdWxsWWVhcigpIC0gMSkuZGF0ZSxcbiAgICAgICAgICAgIHNldDogKGQsIHYpID0+IGNoYWluKGQpLnNldFllYXIodikuZGF0ZSxcbiAgICAgICAgICAgIG1heEJ1ZmZlcjogKGQpID0+IDRcbiAgICAgICAgfSxcbiAgICAgICAgeyAvLyBUV08gRElHSVQgWUVBUlxuICAgICAgICAgICAgY29kZTogJ1lZJyxcbiAgICAgICAgICAgIHJlZ0V4cDogJ1xcXFxkezIsMn0nLFxuICAgICAgICAgICAgc3RyOiAoZCkgPT4gZC5nZXRGdWxsWWVhcigpLnRvU3RyaW5nKCkuc2xpY2UoLTIpLFxuICAgICAgICAgICAgaW5jOiAoZCkgPT4gY2hhaW4oZCkuc2V0WWVhcihkLmdldEZ1bGxZZWFyKCkgKyAxKS5kYXRlLFxuICAgICAgICAgICAgZGVjOiAoZCkgPT4gY2hhaW4oZCkuc2V0WWVhcihkLmdldEZ1bGxZZWFyKCkgLSAxKS5kYXRlLFxuICAgICAgICAgICAgc2V0OiAoZCwgdikgPT4gY2hhaW4oZCkuc2V0VHdvRGlnaXRZZWFyKHYpLmRhdGUsXG4gICAgICAgICAgICBtYXhCdWZmZXI6IChkKSA9PiAyXG4gICAgICAgIH0sXG4gICAgICAgIHsgLy8gTE9ORyBNT05USCBOQU1FXG4gICAgICAgICAgICBjb2RlOiAnTU1NTScsXG4gICAgICAgICAgICByZWdFeHA6IGAoKCR7bW9udGhOYW1lcy5qb2luKCcpfCgnKX0pKWAsXG4gICAgICAgICAgICBzdHI6IChkKSA9PiBtb250aE5hbWVzW2QuZ2V0TW9udGgoKV0sXG4gICAgICAgICAgICBpbmM6IChkKSA9PiBjaGFpbihkKS5pbmNNb250aCgpLmRhdGUsXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBjaGFpbihkKS5kZWNNb250aCgpLmRhdGUsXG4gICAgICAgICAgICBzZXQ6IChkLCB2KSA9PiBjaGFpbihkKS5zZXRNb250aFN0cmluZyh2KS5kYXRlLFxuICAgICAgICAgICAgbWF4QnVmZmVyOiAoZCkgPT4gY2hhaW4oZCkubWF4TW9udGhTdHJpbmdCdWZmZXIoKVxuICAgICAgICB9LFxuICAgICAgICB7IC8vIFNIT1JUIE1PTlRIIE5BTUVcbiAgICAgICAgICAgIGNvZGU6ICdNTU0nLFxuICAgICAgICAgICAgcmVnRXhwOiBgKCgke21vbnRoTmFtZXMubWFwKCh2KSA9PiB2LnNsaWNlKDAsMykpLmpvaW4oJyl8KCcpfSkpYCxcbiAgICAgICAgICAgIHN0cjogKGQpID0+IG1vbnRoTmFtZXNbZC5nZXRNb250aCgpXS5zbGljZSgwLDMpLFxuICAgICAgICAgICAgaW5jOiAoZCkgPT4gY2hhaW4oZCkuaW5jTW9udGgoKS5kYXRlLFxuICAgICAgICAgICAgZGVjOiAoZCkgPT4gY2hhaW4oZCkuZGVjTW9udGgoKS5kYXRlLFxuICAgICAgICAgICAgc2V0OiAoZCwgdikgPT4gY2hhaW4oZCkuc2V0TW9udGhTdHJpbmcodikuZGF0ZSxcbiAgICAgICAgICAgIG1heEJ1ZmZlcjogKGQpID0+IGNoYWluKGQpLm1heE1vbnRoU3RyaW5nQnVmZmVyKClcbiAgICAgICAgfSxcbiAgICAgICAgeyAvLyBQQURERUQgTU9OVEhcbiAgICAgICAgICAgIGNvZGU6ICdNTScsXG4gICAgICAgICAgICByZWdFeHA6ICdcXFxcZHsyLDJ9JyxcbiAgICAgICAgICAgIHN0cjogKGQpID0+IHBhZChkLmdldE1vbnRoKCkgKyAxLCAyKSxcbiAgICAgICAgICAgIGluYzogKGQpID0+IGNoYWluKGQpLmluY01vbnRoKCkuZGF0ZSxcbiAgICAgICAgICAgIGRlYzogKGQpID0+IGNoYWluKGQpLmRlY01vbnRoKCkuZGF0ZSxcbiAgICAgICAgICAgIHNldDogKGQsIHYpID0+IGNoYWluKGQpLnNldE1vbnRoKHYpLmRhdGUsXG4gICAgICAgICAgICBtYXhCdWZmZXI6IChkKSA9PiBjaGFpbihkKS5tYXhNb250aEJ1ZmZlcigpXG4gICAgICAgIH0sXG4gICAgICAgIHsgLy8gTU9OVEhcbiAgICAgICAgICAgIGNvZGU6ICdNJyxcbiAgICAgICAgICAgIHJlZ0V4cDogJ1xcXFxkezEsMn0nLFxuICAgICAgICAgICAgc3RyOiAoZCkgPT4gKGQuZ2V0TW9udGgoKSArIDEpLnRvU3RyaW5nKCksXG4gICAgICAgICAgICBpbmM6IChkKSA9PiBjaGFpbihkKS5pbmNNb250aCgpLmRhdGUsXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBjaGFpbihkKS5kZWNNb250aCgpLmRhdGUsXG4gICAgICAgICAgICBzZXQ6IChkLCB2KSA9PiBjaGFpbihkKS5zZXRNb250aCh2KS5kYXRlLFxuICAgICAgICAgICAgbWF4QnVmZmVyOiAoZCkgPT4gY2hhaW4oZCkubWF4TW9udGhCdWZmZXIoKVxuICAgICAgICB9LFxuICAgICAgICB7IC8vIFBBRERFRCBEQVRFXG4gICAgICAgICAgICBjb2RlOiAnREQnLFxuICAgICAgICAgICAgcmVnRXhwOiAnXFxcXGR7MiwyfScsXG4gICAgICAgICAgICBzdHI6IChkKSA9PiBwYWQoZC5nZXREYXRlKCksIDIpLFxuICAgICAgICAgICAgaW5jOiAoZCkgPT4gY2hhaW4oZCkuaW5jRGF0ZSgpLmRhdGUsXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBjaGFpbihkKS5kZWNEYXRlKCkuZGF0ZSxcbiAgICAgICAgICAgIHNldDogKGQsIHYpID0+IGNoYWluKGQpLnNldERhdGUodikuZGF0ZSxcbiAgICAgICAgICAgIG1heEJ1ZmZlcjogKGQpID0+IGNoYWluKGQpLm1heERhdGVCdWZmZXIoKVxuICAgICAgICB9LFxuICAgICAgICB7IC8vIE9SRElOQUwgREFURVxuICAgICAgICAgICAgY29kZTogJ0RvJyxcbiAgICAgICAgICAgIHJlZ0V4cDogJ1xcXFxkezEsMn0oKHRoKXwobmQpfChyZCl8KHN0KSknLFxuICAgICAgICAgICAgc3RyOiAoZCkgPT4gYXBwZW5kT3JkaW5hbChkLmdldERhdGUoKSksXG4gICAgICAgICAgICBpbmM6IChkKSA9PiBjaGFpbihkKS5pbmNEYXRlKCkuZGF0ZSxcbiAgICAgICAgICAgIGRlYzogKGQpID0+IGNoYWluKGQpLmRlY0RhdGUoKS5kYXRlLFxuICAgICAgICAgICAgc2V0OiAoZCwgdikgPT4gY2hhaW4oZCkuc2V0RGF0ZSh2KS5kYXRlLFxuICAgICAgICAgICAgbWF4QnVmZmVyOiAoZCkgPT4gY2hhaW4oZCkubWF4RGF0ZUJ1ZmZlcigpXG4gICAgICAgIH0sXG4gICAgICAgIHsgLy8gREFURVxuICAgICAgICAgICAgY29kZTogJ0QnLFxuICAgICAgICAgICAgcmVnRXhwOiAnXFxcXGR7MSwyfScsXG4gICAgICAgICAgICBzdHI6IChkKSA9PiBkLmdldERhdGUoKS50b1N0cmluZygpLFxuICAgICAgICAgICAgaW5jOiAoZCkgPT4gY2hhaW4oZCkuaW5jRGF0ZSgpLmRhdGUsXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBjaGFpbihkKS5kZWNEYXRlKCkuZGF0ZSxcbiAgICAgICAgICAgIHNldDogKGQsIHYpID0+IGNoYWluKGQpLnNldERhdGUodikuZGF0ZSxcbiAgICAgICAgICAgIG1heEJ1ZmZlcjogKGQpID0+IGNoYWluKGQpLm1heERhdGVCdWZmZXIoKVxuICAgICAgICB9LFxuICAgICAgICB7IC8vIExPTkcgREFZIE5BTUVcbiAgICAgICAgICAgIGNvZGU6ICdkZGRkJyxcbiAgICAgICAgICAgIHJlZ0V4cDogYCgoJHtkYXlOYW1lcy5qb2luKCcpfCgnKX0pKWAsXG4gICAgICAgICAgICBzdHI6IChkKSA9PiBkYXlOYW1lc1tkLmdldERheSgpXSxcbiAgICAgICAgICAgIGluYzogKGQpID0+IGNoYWluKGQpLmluY0RheSgpLmRhdGUsXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBjaGFpbihkKS5kZWNEYXkoKS5kYXRlLFxuICAgICAgICAgICAgc2V0OiAoZCwgdikgPT4gY2hhaW4oZCkuc2V0RGF5KHYpLmRhdGUsXG4gICAgICAgICAgICBtYXhCdWZmZXI6IChkKSA9PiBjaGFpbihkKS5tYXhEYXlTdHJpbmdCdWZmZXIoKVxuICAgICAgICB9LFxuICAgICAgICB7IC8vIFNIT1JUIERBWSBOQU1FXG4gICAgICAgICAgICBjb2RlOiAnZGRkJyxcbiAgICAgICAgICAgIHJlZ0V4cDogYCgoJHtkYXlOYW1lcy5tYXAoKHYpID0+IHYuc2xpY2UoMCwzKSkuam9pbignKXwoJyl9KSlgLFxuICAgICAgICAgICAgc3RyOiAoZCkgPT4gZGF5TmFtZXNbZC5nZXREYXkoKV0uc2xpY2UoMCwzKSxcbiAgICAgICAgICAgIGluYzogKGQpID0+IGNoYWluKGQpLmluY0RheSgpLmRhdGUsXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBjaGFpbihkKS5kZWNEYXkoKS5kYXRlLFxuICAgICAgICAgICAgc2V0OiAoZCwgdikgPT4gY2hhaW4oZCkuc2V0RGF5KHYpLmRhdGUsXG4gICAgICAgICAgICBtYXhCdWZmZXI6IChkKSA9PiBjaGFpbihkKS5tYXhEYXlTdHJpbmdCdWZmZXIoKVxuICAgICAgICB9LFxuICAgICAgICB7IC8vIFVOSVggVElNRVNUQU1QXG4gICAgICAgICAgICBjb2RlOiAnWCcsXG4gICAgICAgICAgICByZWdFeHA6ICdcXFxcZHsxLH0nLFxuICAgICAgICAgICAgc3RyOiAoZCkgPT4gTWF0aC5mbG9vcihkLnZhbHVlT2YoKSAvIDEwMDApLnRvU3RyaW5nKCksXG4gICAgICAgICAgICBpbmM6IChkKSA9PiBuZXcgRGF0ZShkLnZhbHVlT2YoKSArIDEwMDApLFxuICAgICAgICAgICAgZGVjOiAoZCkgPT4gbmV3IERhdGUoZC52YWx1ZU9mKCkgLSAxMDAwKSxcbiAgICAgICAgICAgIHNldDogKGQsIHYpID0+IGNoYWluKGQpLnNldFVuaXhTZWNvbmRUaW1lc3RhbXAodikuZGF0ZVxuICAgICAgICB9LFxuICAgICAgICB7IC8vIFVOSVggTUlMTElTRUNPTkQgVElNRVNUQU1QXG4gICAgICAgICAgICBjb2RlOiAneCcsXG4gICAgICAgICAgICByZWdFeHA6ICdcXFxcZHsxLH0nLFxuICAgICAgICAgICAgc3RyOiAoZCkgPT4gZC52YWx1ZU9mKCkudG9TdHJpbmcoKSxcbiAgICAgICAgICAgIGluYzogKGQpID0+IG5ldyBEYXRlKGQudmFsdWVPZigpICsgMSksXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBuZXcgRGF0ZShkLnZhbHVlT2YoKSAtIDEpLFxuICAgICAgICAgICAgc2V0OiAoZCwgdikgPT4gY2hhaW4oZCkuc2V0VW5peE1pbGxpc2Vjb25kVGltZXN0YW1wKHYpLmRhdGVcbiAgICAgICAgfSxcbiAgICAgICAgeyAvLyBQQURERUQgTUlMSVRBUlkgSE9VUlNcbiAgICAgICAgICAgIGNvZGU6ICdISCcsXG4gICAgICAgICAgICByZWdFeHA6ICdcXFxcZHsyLDJ9JyxcbiAgICAgICAgICAgIHN0cjogKGQpID0+IHBhZChkLmdldEhvdXJzKCksIDIpLFxuICAgICAgICAgICAgaW5jOiAoZCkgPT4gY2hhaW4oZCkuaW5jSG91cnMoKS5kYXRlLFxuICAgICAgICAgICAgZGVjOiAoZCkgPT4gY2hhaW4oZCkuZGVjSG91cnMoKS5kYXRlLFxuICAgICAgICAgICAgc2V0OiAoZCwgdikgPT4gY2hhaW4oZCkuc2V0TWlsaXRhcnlIb3Vycyh2KS5kYXRlLFxuICAgICAgICAgICAgbWF4QnVmZmVyOiAoZCkgPT4gY2hhaW4oZCkubWF4TWlsaXRhcnlIb3Vyc0J1ZmZlcigpXG4gICAgICAgIH0sXG4gICAgICAgIHsgLy8gTUlMSVRBUlkgSE9VUlNcbiAgICAgICAgICAgIGNvZGU6ICdIJyxcbiAgICAgICAgICAgIHJlZ0V4cDogJ1xcXFxkezEsMn0nLFxuICAgICAgICAgICAgc3RyOiAoZCkgPT4gZC5nZXRIb3VycygpLnRvU3RyaW5nKCksXG4gICAgICAgICAgICBpbmM6IChkKSA9PiBjaGFpbihkKS5pbmNIb3VycygpLmRhdGUsXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBjaGFpbihkKS5kZWNIb3VycygpLmRhdGUsXG4gICAgICAgICAgICBzZXQ6IChkLCB2KSA9PiBjaGFpbihkKS5zZXRNaWxpdGFyeUhvdXJzKHYpLmRhdGUsXG4gICAgICAgICAgICBtYXhCdWZmZXI6IChkKSA9PiBjaGFpbihkKS5tYXhNaWxpdGFyeUhvdXJzQnVmZmVyKClcbiAgICAgICAgfSxcbiAgICAgICAgeyAvLyBQQURERUQgSE9VUlNcbiAgICAgICAgICAgIGNvZGU6ICdoaCcsXG4gICAgICAgICAgICByZWdFeHA6ICdcXFxcZHsyLDJ9JyxcbiAgICAgICAgICAgIHN0cjogKGQpID0+IHBhZCh0b1N0YW5kYXJkVGltZShkLmdldEhvdXJzKCkpLCAyKSxcbiAgICAgICAgICAgIGluYzogKGQpID0+IGNoYWluKGQpLmluY0hvdXJzKCkuZGF0ZSxcbiAgICAgICAgICAgIGRlYzogKGQpID0+IGNoYWluKGQpLmRlY0hvdXJzKCkuZGF0ZSxcbiAgICAgICAgICAgIHNldDogKGQsIHYpID0+IGNoYWluKGQpLnNldEhvdXJzKHYpLmRhdGUsXG4gICAgICAgICAgICBtYXhCdWZmZXI6IChkKSA9PiBjaGFpbihkKS5tYXhIb3Vyc0J1ZmZlcigpXG4gICAgICAgIH0sXG4gICAgICAgIHsgLy8gSE9VUlNcbiAgICAgICAgICAgIGNvZGU6ICdoJyxcbiAgICAgICAgICAgIHJlZ0V4cDogJ1xcXFxkezEsMn0nLFxuICAgICAgICAgICAgc3RyOiAoZCkgPT4gdG9TdGFuZGFyZFRpbWUoZC5nZXRIb3VycygpKS50b1N0cmluZygpLFxuICAgICAgICAgICAgaW5jOiAoZCkgPT4gY2hhaW4oZCkuaW5jSG91cnMoKS5kYXRlLFxuICAgICAgICAgICAgZGVjOiAoZCkgPT4gY2hhaW4oZCkuZGVjSG91cnMoKS5kYXRlLFxuICAgICAgICAgICAgc2V0OiAoZCwgdikgPT4gY2hhaW4oZCkuc2V0SG91cnModikuZGF0ZSxcbiAgICAgICAgICAgIG1heEJ1ZmZlcjogKGQpID0+IGNoYWluKGQpLm1heEhvdXJzQnVmZmVyKClcbiAgICAgICAgfSxcbiAgICAgICAgeyAvLyBVUFBFUkNBU0UgTUVSSURJRU1cbiAgICAgICAgICAgIGNvZGU6ICdBJyxcbiAgICAgICAgICAgIHJlZ0V4cDogJygoQU0pfChQTSkpJyxcbiAgICAgICAgICAgIHN0cjogKGQpID0+IGQuZ2V0SG91cnMoKSA8IDEyID8gJ0FNJyA6ICdQTScsXG4gICAgICAgICAgICBpbmM6IChkKSA9PiBjaGFpbihkKS5pbmNNZXJpZGllbSgpLmRhdGUsXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBjaGFpbihkKS5kZWNNZXJpZGllbSgpLmRhdGUsXG4gICAgICAgICAgICBzZXQ6IChkLCB2KSA9PiBjaGFpbihkKS5zZXRNZXJpZGllbSh2KS5kYXRlLFxuICAgICAgICAgICAgbWF4QnVmZmVyOiAoZCkgPT4gMVxuICAgICAgICB9LFxuICAgICAgICB7IC8vIFVQUEVSQ0FTRSBNRVJJRElFTVxuICAgICAgICAgICAgY29kZTogJ2EnLFxuICAgICAgICAgICAgcmVnRXhwOiAnKChhbSl8KHBtKSknLFxuICAgICAgICAgICAgc3RyOiAoZCkgPT4gZC5nZXRIb3VycygpIDwgMTIgPyAnYW0nIDogJ3BtJyxcbiAgICAgICAgICAgIGluYzogKGQpID0+IGNoYWluKGQpLmluY01lcmlkaWVtKCkuZGF0ZSxcbiAgICAgICAgICAgIGRlYzogKGQpID0+IGNoYWluKGQpLmRlY01lcmlkaWVtKCkuZGF0ZSxcbiAgICAgICAgICAgIHNldDogKGQsIHYpID0+IGNoYWluKGQpLnNldE1lcmlkaWVtKHYpLmRhdGUsXG4gICAgICAgICAgICBtYXhCdWZmZXI6IChkKSA9PiAxXG4gICAgICAgIH0sXG4gICAgICAgIHsgLy8gUEFEREVEIE1JTlVURVNcbiAgICAgICAgICAgIGNvZGU6ICdtbScsXG4gICAgICAgICAgICByZWdFeHA6ICdcXFxcZHsyLDJ9JyxcbiAgICAgICAgICAgIHN0cjogKGQpID0+IHBhZChkLmdldE1pbnV0ZXMoKSwgMiksXG4gICAgICAgICAgICBpbmM6IChkKSA9PiBjaGFpbihkKS5pbmNNaW51dGVzKCkuZGF0ZSxcbiAgICAgICAgICAgIGRlYzogKGQpID0+IGNoYWluKGQpLmRlY01pbnV0ZXMoKS5kYXRlLFxuICAgICAgICAgICAgc2V0OiAoZCwgdikgPT4gY2hhaW4oZCkuc2V0TWludXRlcyh2KS5kYXRlLFxuICAgICAgICAgICAgbWF4QnVmZmVyOiAoZCkgPT4gY2hhaW4oZCkubWF4TWludXRlc0J1ZmZlcigpXG4gICAgICAgIH0sXG4gICAgICAgIHsgLy8gTUlOVVRFU1xuICAgICAgICAgICAgY29kZTogJ20nLFxuICAgICAgICAgICAgcmVnRXhwOiAnXFxcXGR7MSwyfScsXG4gICAgICAgICAgICBzdHI6IChkKSA9PiBkLmdldE1pbnV0ZXMoKS50b1N0cmluZygpLFxuICAgICAgICAgICAgaW5jOiAoZCkgPT4gY2hhaW4oZCkuaW5jTWludXRlcygpLmRhdGUsXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBjaGFpbihkKS5kZWNNaW51dGVzKCkuZGF0ZSxcbiAgICAgICAgICAgIHNldDogKGQsIHYpID0+IGNoYWluKGQpLnNldE1pbnV0ZXModikuZGF0ZSxcbiAgICAgICAgICAgIG1heEJ1ZmZlcjogKGQpID0+IGNoYWluKGQpLm1heE1pbnV0ZXNCdWZmZXIoKVxuICAgICAgICB9LFxuICAgICAgICB7IC8vIFBBRERFRCBTRUNPTkRTXG4gICAgICAgICAgICBjb2RlOiAnc3MnLFxuICAgICAgICAgICAgcmVnRXhwOiAnXFxcXGR7MiwyfScsXG4gICAgICAgICAgICBzdHI6IChkKSA9PiBwYWQoZC5nZXRTZWNvbmRzKCksIDIpLFxuICAgICAgICAgICAgaW5jOiAoZCkgPT4gY2hhaW4oZCkuaW5jU2Vjb25kcygpLmRhdGUsXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBjaGFpbihkKS5kZWNTZWNvbmRzKCkuZGF0ZSxcbiAgICAgICAgICAgIHNldDogKGQsIHYpID0+IGNoYWluKGQpLnNldFNlY29uZHModikuZGF0ZSxcbiAgICAgICAgICAgIG1heEJ1ZmZlcjogKGQpID0+IGNoYWluKGQpLm1heFNlY29uZHNCdWZmZXIoKVxuICAgICAgICB9LFxuICAgICAgICB7IC8vIFNFQ09ORFNcbiAgICAgICAgICAgIGNvZGU6ICdzJyxcbiAgICAgICAgICAgIHJlZ0V4cDogJ1xcXFxkezEsMn0nLFxuICAgICAgICAgICAgc3RyOiAoZCkgPT4gZC5nZXRTZWNvbmRzKCkudG9TdHJpbmcoKSxcbiAgICAgICAgICAgIGluYzogKGQpID0+IGNoYWluKGQpLmluY1NlY29uZHMoKS5kYXRlLFxuICAgICAgICAgICAgZGVjOiAoZCkgPT4gY2hhaW4oZCkuZGVjU2Vjb25kcygpLmRhdGUsXG4gICAgICAgICAgICBzZXQ6IChkLCB2KSA9PiBjaGFpbihkKS5zZXRTZWNvbmRzKHYpLmRhdGUsXG4gICAgICAgICAgICBtYXhCdWZmZXI6IChkKSA9PiBjaGFpbihkKS5tYXhTZWNvbmRzQnVmZmVyKClcbiAgICAgICAgfSxcbiAgICAgICAgeyAvLyBVVEMgT0ZGU0VUIFdJVEggQ09MT05cbiAgICAgICAgICAgIGNvZGU6ICdaWicsXG4gICAgICAgICAgICByZWdFeHA6ICcoXFxcXCt8XFxcXC0pXFxcXGR7MiwyfTpcXFxcZHsyLDJ9JyxcbiAgICAgICAgICAgIHN0cjogKGQpID0+IGdldFVUQ09mZnNldChkLCB0cnVlKSAvL1RPRE8gYWRkIGFiaWxpdHkgdG8gaW5jIGFuZCBkZWMgdGhpc1xuICAgICAgICB9LFxuICAgICAgICB7IC8vIFVUQyBPRkZTRVRcbiAgICAgICAgICAgIGNvZGU6ICdaJyxcbiAgICAgICAgICAgIHJlZ0V4cDogJyhcXFxcK3xcXFxcLSlcXFxcZHs0LDR9JyxcbiAgICAgICAgICAgIHN0cjogKGQpID0+IGdldFVUQ09mZnNldChkLCBmYWxzZSlcbiAgICAgICAgfVxuICAgIF07XG59KSgpO1xuXG5cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJGb3JtYXRCbG9ja3MudHNcIiAvPlxuXG5jbGFzcyBEYXRlUGFydCB7XG4gICAgcHJpdmF0ZSBzdHI6KGQ6RGF0ZSkgPT4gc3RyaW5nO1xuICAgIHByaXZhdGUgcmVnRXhwU3RyaW5nOnN0cmluZztcbiAgICBwcml2YXRlIGluYzooZDpEYXRlKSA9PiBEYXRlO1xuICAgIHByaXZhdGUgZGVjOihkOkRhdGUpID0+IERhdGU7XG4gICAgcHJpdmF0ZSBzZXQ6KGQ6RGF0ZSwgdjpzdHJpbmd8bnVtYmVyKSA9PiBEYXRlO1xuICAgIFxuICAgIHByaXZhdGUgdmFsdWU6c3RyaW5nO1xuICAgIHByaXZhdGUgc2VsZWN0YWJsZTpib29sZWFuO1xuICAgIHByaXZhdGUgbWF4QnVmZmVyOihkOkRhdGUpID0+IG51bWJlcjtcbiAgICBcbiAgICBjb25zdHJ1Y3Rvcihhcmc6SUZvcm1hdEJsb2NrfFN0cmluZywgc2VsZWN0YWJsZU92ZXJyaWRlPzpib29sZWFuKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYXJnID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgdGhpcy5zdHIgPSAoPElGb3JtYXRCbG9jaz5hcmcpLnN0cjtcbiAgICAgICAgICAgIHRoaXMuaW5jID0gKDxJRm9ybWF0QmxvY2s+YXJnKS5pbmM7XG4gICAgICAgICAgICB0aGlzLmRlYyA9ICg8SUZvcm1hdEJsb2NrPmFyZykuZGVjO1xuICAgICAgICAgICAgdGhpcy5zZXQgPSAoPElGb3JtYXRCbG9jaz5hcmcpLnNldDtcbiAgICAgICAgICAgIHRoaXMubWF4QnVmZmVyID0gKDxJRm9ybWF0QmxvY2s+YXJnKS5tYXhCdWZmZXI7XG4gICAgICAgICAgICB0aGlzLnJlZ0V4cFN0cmluZyA9ICg8SUZvcm1hdEJsb2NrPmFyZykucmVnRXhwO1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RhYmxlID0gdGhpcy5pbmMgIT09IHZvaWQgMCAmJiB0aGlzLmRlYyAhPT0gdm9pZCAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IDxzdHJpbmc+YXJnO1xuICAgICAgICAgICAgdGhpcy5yZWdFeHBTdHJpbmcgPSB0aGlzLnJlZ0V4cEVzY2FwZSh0aGlzLnZhbHVlKTtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0YWJsZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2Ygc2VsZWN0YWJsZU92ZXJyaWRlID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0YWJsZSA9IHNlbGVjdGFibGVPdmVycmlkZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIHJlZ0V4cEVzY2FwZShzdHI6c3RyaW5nKTpzdHJpbmcge1xuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UoL1tcXC1cXFtcXF1cXC9cXHtcXH1cXChcXClcXCpcXCtcXD9cXC5cXFxcXFxeXFwkXFx8XS9nLCBcIlxcXFwkJlwiKTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIGluY3JlbWVudChkOkRhdGUpOkRhdGUge1xuICAgICAgICByZXR1cm4gdGhpcy5pbmMoZCk7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBkZWNyZW1lbnQoZDpEYXRlKTpEYXRlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVjKGQpO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgc2V0VmFsdWUoZDpEYXRlKTpEYXRlUGFydCB7XG4gICAgICAgIGlmICh0aGlzLnN0ciA9PT0gdm9pZCAwKSByZXR1cm4gdGhpcztcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMuc3RyKGQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHRvU3RyaW5nKCk6c3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBpc1NlbGVjdGFibGUoKTpib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0YWJsZTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIGdldFJlZ0V4cFN0cmluZygpOnN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlZ0V4cFN0cmluZztcbiAgICB9XG4gICAgXG4gICAgcHVibGljIGdldERhdGVGcm9tU3RyaW5nKGRhdGU6RGF0ZSwgcGFydGlhbDpzdHJpbmcpOkRhdGUge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXQoZGF0ZSwgcGFydGlhbCk7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBnZXRNYXhCdWZmZXJTaXplKGRhdGU6RGF0ZSk6bnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMubWF4QnVmZmVyID09PSB2b2lkIDApIHJldHVybiB2b2lkIDA7XG4gICAgICAgIHJldHVybiB0aGlzLm1heEJ1ZmZlcihkYXRlKTtcbiAgICB9XG59IiwibGV0IE9wdGlvblNhbml0aXplciA9ICgoKSA9PiB7XG4gICAgbGV0IHNhbml0aXplRWxlbWVudCA9IChlbGVtZW50OkhUTUxJbnB1dEVsZW1lbnQpOkhUTUxJbnB1dEVsZW1lbnQgPT4ge1xuICAgICAgICBpZiAoZWxlbWVudCA9PT0gdm9pZCAwKSB0aHJvdyAnREFUSVVNOiBcImVsZW1lbnRcIiBvcHRpb24gaXMgcmVxdWlyZWQnO1xuICAgICAgICBjb25zb2xlLmxvZygnb2ggeWVhaCBhaGEnKTtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBjbGFzcyB7XG4gICAgICAgIHN0YXRpYyBzYW5pdGl6ZShvcHRzOklPcHRpb25zKTpJT3B0aW9ucyB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IHNhbml0aXplRWxlbWVudChvcHRzLmVsZW1lbnQpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxufSkoKTsiLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiRm9ybWF0QmxvY2tzLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJEYXRlUGFydC50c1wiIC8+XG5cbmNsYXNzIERpc3BsYXlQYXJzZXIge1xuICAgIFxuICAgIHB1YmxpYyBzdGF0aWMgcGFyc2UoZm9ybWF0OnN0cmluZyk6RGF0ZVBhcnRbXSB7ICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGxldCBpbmRleCA9IDA7ICAgICAgICAgICAgICAgIFxuICAgICAgICBsZXQgaW5Fc2NhcGVkU2VnbWVudCA9IGZhbHNlO1xuICAgICAgICBsZXQgZGF0ZVBhcnRzOkRhdGVQYXJ0W10gPSBbXTtcbiAgICAgICAgbGV0IHRleHRCdWZmZXIgPSAnJztcbiAgICAgICAgXG4gICAgICAgIGxldCBwdXNoUGxhaW5UZXh0ID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRleHRCdWZmZXIubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGRhdGVQYXJ0cy5wdXNoKG5ldyBEYXRlUGFydCh0ZXh0QnVmZmVyKSk7XG4gICAgICAgICAgICAgICAgdGV4dEJ1ZmZlciA9ICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBsZXQgaW5jcmVtZW50Om51bWJlcjsgICAgICAgIFxuICAgICAgICB3aGlsZSAoaW5kZXggPCBmb3JtYXQubGVuZ3RoKSB7ICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoIWluRXNjYXBlZFNlZ21lbnQgJiYgZm9ybWF0W2luZGV4XSA9PT0gJ1snKSB7XG4gICAgICAgICAgICAgICAgaW5Fc2NhcGVkU2VnbWVudCA9IHRydWU7XG4gICAgICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaW5Fc2NhcGVkU2VnbWVudCAmJiBmb3JtYXRbaW5kZXhdID09PSAnXScpIHtcbiAgICAgICAgICAgICAgICBpbkVzY2FwZWRTZWdtZW50ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaW5Fc2NhcGVkU2VnbWVudCkge1xuICAgICAgICAgICAgICAgIHRleHRCdWZmZXIgKz0gZm9ybWF0W2luZGV4XTtcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChmb3JtYXRCbG9ja3Muc29tZSgoYmxvY2s6SUZvcm1hdEJsb2NrKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZmluZEF0KGZvcm1hdCwgaW5kZXgsIGB7JHtibG9jay5jb2RlfX1gKSkge1xuICAgICAgICAgICAgICAgICAgICBwdXNoUGxhaW5UZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIGRhdGVQYXJ0cy5wdXNoKG5ldyBEYXRlUGFydChibG9jaywgZmFsc2UpKTtcbiAgICAgICAgICAgICAgICAgICAgaW5jcmVtZW50ID0gYmxvY2suY29kZS5sZW5ndGggKyAyO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZmluZEF0KGZvcm1hdCwgaW5kZXgsIGJsb2NrLmNvZGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHB1c2hQbGFpblRleHQoKTtcbiAgICAgICAgICAgICAgICAgICAgZGF0ZVBhcnRzLnB1c2gobmV3IERhdGVQYXJ0KGJsb2NrKSk7XG4gICAgICAgICAgICAgICAgICAgIGluY3JlbWVudCA9IGJsb2NrLmNvZGUubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSkge1xuICAgICAgICAgICAgICAgIGluZGV4ICs9IGluY3JlbWVudDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGV4dEJ1ZmZlciArPSBmb3JtYXRbaW5kZXhdO1xuICAgICAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHB1c2hQbGFpblRleHQoKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBkYXRlUGFydHM7XG4gICAgfSAgICBcbiAgICBcbiAgICBwcml2YXRlIHN0YXRpYyBmaW5kQXQoc3RyOnN0cmluZywgaW5kZXg6bnVtYmVyLCBzZWFyY2g6c3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBzdHIuc2xpY2UoaW5kZXgsIGluZGV4ICsgc2VhcmNoLmxlbmd0aCkgPT09IHNlYXJjaDtcbiAgICB9XG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIk9wdGlvblNhbml0aXplci50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiRm9ybWF0QmxvY2tzLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJEYXRlUGFydC50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiRGlzcGxheVBhcnNlci50c1wiIC8+XG5cbig8YW55PndpbmRvdylbJ0RhdGl1bSddID0gKGZ1bmN0aW9uKCkge1xuICAgIGxldCBvcHRpb25zOklPcHRpb25zO1xuICAgIFxuICAgIHJldHVybiBjbGFzcyB7XG4gICAgICAgIGNvbnN0cnVjdG9yKG9wdHM6SU9wdGlvbnMpIHtcbiAgICAgICAgICAgIG5ldyBEYXRlcGlja2VySW5wdXQob3B0cy5lbGVtZW50LCAnaDptbWEge2RkZH0gTU1NIERvLCBZWVlZJyk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZU9wdGlvbnMob3B0cyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHVwZGF0ZU9wdGlvbnMob3B0czpJT3B0aW9ucyk6dm9pZCB7XG4gICAgICAgICAgICBvcHRpb25zID0gT3B0aW9uU2FuaXRpemVyLnNhbml0aXplKG9wdHMpO1xuICAgICAgICB9XG4gICAgfVxufSkoKTtcblxuY29uc3QgZW51bSBLZXlDb2RlcyB7XG4gICAgUklHSFQgPSAzOSwgTEVGVCA9IDM3LCBUQUIgPSA5LCBVUCA9IDM4LFxuICAgIERPV04gPSA0MCwgViA9IDg2LCBDID0gNjcsIEEgPSA2NSwgSE9NRSA9IDM2LFxuICAgIEVORCA9IDM1LCBCQUNLU1BBQ0UgPSA4XG59XG5cbmNsYXNzIERhdGVwaWNrZXJJbnB1dCB7XG5cbiAgICBwcml2YXRlIHNlbGVjdGVkSW5kZXg6bnVtYmVyO1xuICAgIHByaXZhdGUgY3VyRGF0ZTpEYXRlO1xuICAgIHByaXZhdGUgZGF0ZVBhcnRzOkRhdGVQYXJ0W107XG4gICAgcHJpdmF0ZSBkYXRlU3RyaW5nUmVnRXhwOlJlZ0V4cDtcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgZWxlbWVudDpIVE1MSW5wdXRFbGVtZW50LCBkaXNwbGF5QXM6c3RyaW5nLCBwcml2YXRlIG1pbkRhdGU/OkRhdGUsIHByaXZhdGUgbWF4RGF0ZT86RGF0ZSkge1xuICAgICAgICB0aGlzLmRhdGVQYXJ0cyA9IERpc3BsYXlQYXJzZXIucGFyc2UoZGlzcGxheUFzKTtcbiAgICAgICAgdGhpcy5kYXRlU3RyaW5nUmVnRXhwID0gdGhpcy5jb25jYXRSZWdFeHAodGhpcy5kYXRlUGFydHMpO1xuICAgICAgICB0aGlzLmJpbmRFdmVudHMoKTtcbiAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSgnc3BlbGxjaGVjaycsICdmYWxzZScpO1xuICAgICAgICB0aGlzLnVwZGF0ZShuZXcgRGF0ZSgpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNvbmNhdFJlZ0V4cChkYXRlUGFydHM6RGF0ZVBhcnRbXSk6UmVnRXhwIHtcbiAgICAgICAgbGV0IHJlZ0V4cCA9ICcnO1xuICAgICAgICBkYXRlUGFydHMuZm9yRWFjaCgoZGF0ZVBhcnQpID0+IHtcbiAgICAgICAgICAgcmVnRXhwICs9IGRhdGVQYXJ0LmdldFJlZ0V4cFN0cmluZygpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoYF4ke3JlZ0V4cH0kYCwgJ2knKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGJpbmRFdmVudHMoKTp2b2lkIHtcbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgKCkgPT4gdGhpcy5mb2N1cygpKTtcblxuICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChlKSA9PiB0aGlzLmtleWRvd24oZSkpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigncGFzdGUnLCAoKSA9PiB0aGlzLnBhc3RlKCkpO1xuXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZTpLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoZS5zaGlmdEtleSAmJiBlLmtleUNvZGUgPT09IEtleUNvZGVzLlRBQikge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hpZnRUYWJEb3duID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZS5rZXlDb2RlID09PSBLZXlDb2Rlcy5UQUIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRhYkRvd24gPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICB0aGlzLnNoaWZ0VGFiRG93biA9IGZhbHNlO1xuICAgICAgICAgICAgICAgdGhpcy50YWJEb3duID0gZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAvLyBQcmV2ZW50IERlZmF1bHRcbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdlbnRlcicsIChlKSA9PiBlLnByZXZlbnREZWZhdWx0KCkpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCAoZSkgPT4gZS5wcmV2ZW50RGVmYXVsdCgpKTtcbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCAoZSkgPT4gZS5wcmV2ZW50RGVmYXVsdCgpKTtcbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2N1dCcsIChlKSA9PiBlLnByZXZlbnREZWZhdWx0KCkpO1xuXG4gICAgICAgIGxldCBjYXJldFN0YXJ0Om51bWJlcjtcbiAgICAgICAgbGV0IGRvd24gPSBmYWxzZTtcbiAgICAgICAgXG4gICAgICAgIGxldCBtb3VzZWRvd24gPSAoKSA9PiB7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICAgICAgICAgIGRvd24gPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnNldFNlbGVjdGlvblJhbmdlKHZvaWQgMCwgdm9pZCAwKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNhcmV0U3RhcnQgPSB0aGlzLmVsZW1lbnQuc2VsZWN0aW9uU3RhcnQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIGxldCBtb3VzZXVwID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFkb3duKSByZXR1cm47XG4gICAgICAgICAgICBkb3duID0gZmFsc2U7XG4gICAgICAgICAgICBsZXQgcG9zID0gdGhpcy5lbGVtZW50LnNlbGVjdGlvblN0YXJ0ID09PSBjYXJldFN0YXJ0ID8gdGhpcy5lbGVtZW50LnNlbGVjdGlvbkVuZCA6IHRoaXMuZWxlbWVudC5zZWxlY3Rpb25TdGFydDtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9IHRoaXMuZ2V0TmVhcmVzdFNlbGVjdGFibGVJbmRleChwb3MpO1xuICAgICAgICAgICAgaWYgKHRoaXMuZWxlbWVudC5zZWxlY3Rpb25TdGFydCA+IDAgfHwgdGhpcy5lbGVtZW50LnNlbGVjdGlvbkVuZCA8IHRoaXMuZWxlbWVudC52YWx1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgbGV0IHRvdWNoc3RhcnQgPSAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgbW91c2Vkb3duKTtcbiAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBtb3VzZXVwKTtcbiAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0b3VjaHN0YXJ0KTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBtb3VzZWRvd24pO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgbW91c2V1cCk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0b3VjaHN0YXJ0KTtcblxuICAgICAgICBsZXQgbGFzdFN0YXJ0Om51bWJlcjtcbiAgICAgICAgbGV0IGxhc3RFbmQ6bnVtYmVyO1xuICAgICAgICB2YXIgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMucGFzdGluZyAmJlxuICAgICAgICAgICAgICAgICh0aGlzLmVsZW1lbnQuc2VsZWN0aW9uU3RhcnQgIT09IDAgfHxcbiAgICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnNlbGVjdGlvbkVuZCAhPT0gdGhpcy5lbGVtZW50LnZhbHVlLmxlbmd0aCkgJiZcbiAgICAgICAgICAgICAgICAodGhpcy5lbGVtZW50LnNlbGVjdGlvblN0YXJ0ICE9PSBsYXN0U3RhcnQgfHxcbiAgICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnNlbGVjdGlvbkVuZCAhPT0gbGFzdEVuZCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkSW5kZXggPSB0aGlzLmdldE5lYXJlc3RTZWxlY3RhYmxlSW5kZXgodGhpcy5lbGVtZW50LnNlbGVjdGlvblN0YXJ0ICsgKHRoaXMuZWxlbWVudC5zZWxlY3Rpb25FbmQgLSB0aGlzLmVsZW1lbnQuc2VsZWN0aW9uU3RhcnQpIC8gMik7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGUoKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGFzdFN0YXJ0ID0gdGhpcy5lbGVtZW50LnNlbGVjdGlvblN0YXJ0O1xuICAgICAgICAgICAgbGFzdEVuZCA9IHRoaXMuZWxlbWVudC5zZWxlY3Rpb25FbmQ7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIHNoaWZ0VGFiRG93biA9IGZhbHNlO1xuICAgIHByaXZhdGUgdGFiRG93biA9IGZhbHNlO1xuICAgIHByaXZhdGUgcGFzdGluZzpib29sZWFuID0gZmFsc2U7XG4gICAgXG4gICAgcHJpdmF0ZSBwYXN0ZSgpOnZvaWQge1xuICAgICAgICB0aGlzLnBhc3RpbmcgPSB0cnVlO1xuICAgICAgICBsZXQgb3JpZ2luYWxWYWx1ZSA9IHRoaXMuZWxlbWVudC52YWx1ZTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuZGF0ZVN0cmluZ1JlZ0V4cC50ZXN0KHRoaXMuZWxlbWVudC52YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQudmFsdWUgPSBvcmlnaW5hbFZhbHVlO1xuICAgICAgICAgICAgICAgIHRoaXMucGFzdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBuZXdEYXRlID0gbmV3IERhdGUodGhpcy5jdXJEYXRlLnZhbHVlT2YoKSk7XG4gICAgICAgICAgICBsZXQgc3RyUHJlZml4ID0gJyc7XG4gICAgICAgICAgICB0aGlzLmRhdGVQYXJ0cy5mb3JFYWNoKChkYXRlUGFydCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCB2YWwgPSB0aGlzLmVsZW1lbnQudmFsdWUucmVwbGFjZShzdHJQcmVmaXgsICcnKS5tYXRjaChkYXRlUGFydC5nZXRSZWdFeHBTdHJpbmcoKSlbMF07XG4gICAgICAgICAgICAgICAgc3RyUHJlZml4ICs9IHZhbDtcbiAgICAgICAgICAgICAgICBpZiAoIWRhdGVQYXJ0LmlzU2VsZWN0YWJsZSgpKSByZXR1cm47XG4gICAgICAgICAgICAgICAgbmV3RGF0ZSA9IGRhdGVQYXJ0LmdldERhdGVGcm9tU3RyaW5nKG5ld0RhdGUsIHZhbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKG5ld0RhdGUpO1xuICAgICAgICAgICAgdGhpcy5wYXN0aW5nID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgdGV4dEJ1ZmZlcjpzdHJpbmcgPSAnJztcblxuICAgIHByaXZhdGUga2V5ZG93bihlOktleWJvYXJkRXZlbnQpOnZvaWQge1xuICAgICAgICBpZiAoKGUua2V5Q29kZSA9PT0gS2V5Q29kZXMuSE9NRSB8fCBlLmtleUNvZGUgPT09IEtleUNvZGVzLkVORCkgJiYgZS5zaGlmdEtleSkgcmV0dXJuO1xuICAgICAgICBpZiAoZS5rZXlDb2RlID09PSBLZXlDb2Rlcy5DICYmIGUuY3RybEtleSkgcmV0dXJuO1xuICAgICAgICBpZiAoZS5rZXlDb2RlID09PSBLZXlDb2Rlcy5BICYmIGUuY3RybEtleSkgcmV0dXJuO1xuICAgICAgICBpZiAoZS5rZXlDb2RlID09PSBLZXlDb2Rlcy5WICYmIGUuY3RybEtleSkgcmV0dXJuO1xuICAgICAgICBpZiAoKGUua2V5Q29kZSA9PT0gS2V5Q29kZXMuTEVGVCB8fCBlLmtleUNvZGUgPT09IEtleUNvZGVzLlJJR0hUKSAmJiBlLnNoaWZ0S2V5KSByZXR1cm47XG5cbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gS2V5Q29kZXMuSE9NRSkge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEluZGV4ID0gdGhpcy5nZXRGaXJzdFNlbGVjdGFibGUoKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZS5rZXlDb2RlID09PSBLZXlDb2Rlcy5FTkQpIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9IHRoaXMuZ2V0TGFzdFNlbGVjdGFibGUoKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZS5rZXlDb2RlID09PSBLZXlDb2Rlcy5MRUZUKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkSW5kZXggPSB0aGlzLmdldFByZXZpb3VzU2VsZWN0YWJsZSgpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfSBlbHNlIGlmIChlLnNoaWZ0S2V5ICYmIGUua2V5Q29kZSA9PT0gS2V5Q29kZXMuVEFCKSB7XG4gICAgICAgICAgICBsZXQgcHJldmlvdXNTZWxlY3RhYmxlID0gdGhpcy5nZXRQcmV2aW91c1NlbGVjdGFibGUoKTtcbiAgICAgICAgICAgIGlmIChwcmV2aW91c1NlbGVjdGFibGUgIT09IHRoaXMuc2VsZWN0ZWRJbmRleCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9IHByZXZpb3VzU2VsZWN0YWJsZTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChlLmtleUNvZGUgPT09IEtleUNvZGVzLlJJR0hUKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkSW5kZXggPSB0aGlzLmdldE5leHRTZWxlY3RhYmxlKCk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9IGVsc2UgaWYgKGUua2V5Q29kZSA9PT0gS2V5Q29kZXMuVEFCKSB7XG4gICAgICAgICAgICBsZXQgbmV4dFNlbGVjdGFibGUgPSB0aGlzLmdldE5leHRTZWxlY3RhYmxlKCk7XG4gICAgICAgICAgICBpZiAobmV4dFNlbGVjdGFibGUgIT09IHRoaXMuc2VsZWN0ZWRJbmRleCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9IG5leHRTZWxlY3RhYmxlO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGUua2V5Q29kZSA9PT0gS2V5Q29kZXMuVVApIHtcbiAgICAgICAgICAgIGxldCBuZXdEYXRlID0gdGhpcy5kYXRlUGFydHNbdGhpcy5zZWxlY3RlZEluZGV4XS5pbmNyZW1lbnQodGhpcy5jdXJEYXRlKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKG5ld0RhdGUpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9IGVsc2UgaWYgKGUua2V5Q29kZSA9PT0gS2V5Q29kZXMuRE9XTikge1xuICAgICAgICAgICAgbGV0IG5ld0RhdGUgPSB0aGlzLmRhdGVQYXJ0c1t0aGlzLnNlbGVjdGVkSW5kZXhdLmRlY3JlbWVudCh0aGlzLmN1ckRhdGUpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGUobmV3RGF0ZSk7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQga2V5UHJlc3NlZCA9ICg8YW55PntcbiAgICAgICAgICAgICc0OCc6ICcwJywgJzk2JzogJzAnLCAnNDknOiAnMScsICc5Nyc6ICcxJyxcbiAgICAgICAgICAgICc1MCc6ICcyJywgJzk4JzogJzInLCAnNTEnOiAnMycsICc5OSc6ICczJyxcbiAgICAgICAgICAgICc1Mic6ICc0JywgJzEwMCc6ICc0JywgJzUzJzogJzUnLCAnMTAxJzogJzUnLFxuICAgICAgICAgICAgJzU0JzogJzYnLCAnMTAyJzogJzYnLCAnNTUnOiAnNycsICcxMDMnOiAnNycsXG4gICAgICAgICAgICAnNTYnOiAnOCcsICcxMDQnOiAnOCcsICc1Nyc6ICc5JywgJzEwNSc6ICc5JyxcbiAgICAgICAgICAgICc2NSc6ICdhJywgJzY2JzogJ2InLCAnNjcnOiAnYycsICc2OCc6ICdkJyxcbiAgICAgICAgICAgICc2OSc6ICdlJywgJzcwJzogJ2YnLCAnNzEnOiAnZycsICc3Mic6ICdoJyxcbiAgICAgICAgICAgICc3Myc6ICdpJywgJzc0JzogJ2onLCAnNzUnOiAnaycsICc3Nic6ICdsJyxcbiAgICAgICAgICAgICc3Nyc6ICdtJywgJzc4JzogJ24nLCAnNzknOiAnbycsICc4MCc6ICdwJyxcbiAgICAgICAgICAgICc4MSc6ICdxJywgJzgyJzogJ3InLCAnODMnOiAncycsICc4NCc6ICd0JyxcbiAgICAgICAgICAgICc4NSc6ICd1JywgJzg2JzogJ3YnLCAnODcnOiAndycsICc4OCc6ICd4JyxcbiAgICAgICAgICAgICc4OSc6ICd5JywgJzkwJzogJ3onXG4gICAgICAgIH0pW2Uua2V5Q29kZV07XG5cbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gS2V5Q29kZXMuQkFDS1NQQUNFKSB7XG4gICAgICAgICAgICB0aGlzLmJhY2tzcGFjZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKGtleVByZXNzZWQgIT09IHZvaWQgMCkge1xuICAgICAgICAgICAgdGhpcy50ZXh0QnVmZmVyICs9IGtleVByZXNzZWQ7XG4gICAgICAgIH0gZWxzZSBpZiAoIWUuc2hpZnRLZXkpIHtcbiAgICAgICAgICAgIHRoaXMudGV4dEJ1ZmZlciA9ICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMudGV4dEJ1ZmZlci5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBsZXQgb3JpZyA9IHRoaXMuY3VyRGF0ZS52YWx1ZU9mKCk7XG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gdGhpcy5kYXRlUGFydHNbdGhpcy5zZWxlY3RlZEluZGV4XS5nZXREYXRlRnJvbVN0cmluZyh0aGlzLmN1ckRhdGUsIHRoaXMudGV4dEJ1ZmZlcik7XG4gICAgICAgICAgICBpZiAocmVzdWx0ICE9PSB2b2lkIDAgJiYgdGhpcy5kYXRlUGFydHNbdGhpcy5zZWxlY3RlZEluZGV4XS5nZXRNYXhCdWZmZXJTaXplKHJlc3VsdCkgIT09IHZvaWQgMCAmJiB0aGlzLnRleHRCdWZmZXIubGVuZ3RoID49IHRoaXMuZGF0ZVBhcnRzW3RoaXMuc2VsZWN0ZWRJbmRleF0uZ2V0TWF4QnVmZmVyU2l6ZShyZXN1bHQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEluZGV4ID0gdGhpcy5nZXROZXh0U2VsZWN0YWJsZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlc3VsdCA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50ZXh0QnVmZmVyID0gdGhpcy50ZXh0QnVmZmVyLnNsaWNlKDAsIHRoaXMudGV4dEJ1ZmZlci5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGUocmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYmFja3NwYWNlKCk6dm9pZCB7XG4gICAgICAgIGlmICh0aGlzLnRleHRCdWZmZXIubGVuZ3RoIDwgMikge1xuICAgICAgICAgICAgbGV0IG9yaWcgPSB0aGlzLmN1ckRhdGUudmFsdWVPZigpO1xuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHRoaXMuZGF0ZVBhcnRzW3RoaXMuc2VsZWN0ZWRJbmRleF0uZ2V0RGF0ZUZyb21TdHJpbmcodGhpcy5jdXJEYXRlLCAnWkVST19PVVQnKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQudmFsdWVPZigpICE9PSBvcmlnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGUocmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnRleHRCdWZmZXIgPSB0aGlzLnRleHRCdWZmZXIuc2xpY2UoMCwgdGhpcy50ZXh0QnVmZmVyLmxlbmd0aCAtIDEpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0UHJldmlvdXNTZWxlY3RhYmxlKCk6bnVtYmVyIHtcbiAgICAgICAgbGV0IGluZGV4ID0gdGhpcy5zZWxlY3RlZEluZGV4O1xuICAgICAgICB3aGlsZSAoLS1pbmRleCA+PSAwKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5kYXRlUGFydHNbaW5kZXhdLmlzU2VsZWN0YWJsZSgpKSByZXR1cm4gaW5kZXg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWRJbmRleDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldE5leHRTZWxlY3RhYmxlKCk6bnVtYmVyIHtcbiAgICAgICAgbGV0IGluZGV4ID0gdGhpcy5zZWxlY3RlZEluZGV4O1xuICAgICAgICB3aGlsZSAoKytpbmRleCA8IHRoaXMuZGF0ZVBhcnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuZGF0ZVBhcnRzW2luZGV4XS5pc1NlbGVjdGFibGUoKSkgcmV0dXJuIGluZGV4O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGVkSW5kZXg7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZWxlY3Rpbmc6Ym9vbGVhbiA9IGZhbHNlO1xuXG4gICAgcHJpdmF0ZSBnZXROZWFyZXN0U2VsZWN0YWJsZUluZGV4KGNhcmV0UG9zaXRpb246bnVtYmVyKTpudW1iZXIge1xuICAgICAgICBsZXQgcG9zID0gMDtcbiAgICAgICAgbGV0IG5lYXJlc3RTZWxlY3RhYmxlSW5kZXg6bnVtYmVyO1xuICAgICAgICBsZXQgbmVhcmVzdFNlbGVjdGFibGVEaXN0YW5jZTpudW1iZXI7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5kYXRlUGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGVQYXJ0c1tpXS5pc1NlbGVjdGFibGUoKSkge1xuICAgICAgICAgICAgICAgIGxldCBmcm9tTGVmdCA9IGNhcmV0UG9zaXRpb24gLSBwb3M7XG4gICAgICAgICAgICAgICAgbGV0IGZyb21SaWdodCA9IGNhcmV0UG9zaXRpb24gLSAocG9zICsgdGhpcy5kYXRlUGFydHNbaV0udG9TdHJpbmcoKS5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIGlmIChmcm9tTGVmdCA+IDAgJiYgZnJvbVJpZ2h0IDwgMCkgcmV0dXJuIGk7XG4gICAgICAgICAgICAgICAgbGV0IGRpc3QgPSBNYXRoLm1pbihNYXRoLmFicyhmcm9tTGVmdCksIE1hdGguYWJzKGZyb21SaWdodCkpO1xuICAgICAgICAgICAgICAgIGlmIChuZWFyZXN0U2VsZWN0YWJsZUluZGV4ID09IHZvaWQgMCB8fCBkaXN0IDw9IG5lYXJlc3RTZWxlY3RhYmxlRGlzdGFuY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgbmVhcmVzdFNlbGVjdGFibGVJbmRleCA9IGk7XG4gICAgICAgICAgICAgICAgICAgIG5lYXJlc3RTZWxlY3RhYmxlRGlzdGFuY2UgPSBkaXN0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBvcyArPSB0aGlzLmRhdGVQYXJ0c1tpXS50b1N0cmluZygpLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmVhcmVzdFNlbGVjdGFibGVJbmRleDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGZvY3VzKCk6dm9pZCB7XG4gICAgICAgIGlmICh0aGlzLnRhYkRvd24pIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9IHRoaXMuZ2V0Rmlyc3RTZWxlY3RhYmxlKCk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnNoaWZ0VGFiRG93bikge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEluZGV4ID0gdGhpcy5nZXRMYXN0U2VsZWN0YWJsZSgpO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGdldEZpcnN0U2VsZWN0YWJsZSgpOm51bWJlciB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5kYXRlUGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGVQYXJ0c1tpXS5pc1NlbGVjdGFibGUoKSkgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldExhc3RTZWxlY3RhYmxlKCk6bnVtYmVyIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IHRoaXMuZGF0ZVBhcnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5kYXRlUGFydHNbaV0uaXNTZWxlY3RhYmxlKCkpIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgfVxuXG5cbiAgICBwcml2YXRlIGxhc3RTZWxlY3RlZEluZGV4Om51bWJlcjtcblxuICAgIHB1YmxpYyB1cGRhdGUoZGF0ZT86RGF0ZSk6dm9pZCB7XG4gICAgICAgIGlmIChkYXRlID09PSB2b2lkIDApIGRhdGUgPSB0aGlzLmN1ckRhdGU7XG4gICAgICAgIGlmICh0aGlzLm1pbkRhdGUgIT09IHZvaWQgMCAmJiBkYXRlLnZhbHVlT2YoKSA8IHRoaXMubWluRGF0ZS52YWx1ZU9mKCkpIGRhdGUgPSBuZXcgRGF0ZSh0aGlzLm1pbkRhdGUudmFsdWVPZigpKTtcbiAgICAgICAgaWYgKHRoaXMubWF4RGF0ZSAhPT0gdm9pZCAwICYmIGRhdGUudmFsdWVPZigpIDwgdGhpcy5tYXhEYXRlLnZhbHVlT2YoKSkgZGF0ZSA9IG5ldyBEYXRlKHRoaXMubWF4RGF0ZS52YWx1ZU9mKCkpO1xuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZEluZGV4ICE9PSB0aGlzLmxhc3RTZWxlY3RlZEluZGV4KSB7XG4gICAgICAgICAgICB0aGlzLnRleHRCdWZmZXIgPSAnJztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxhc3RTZWxlY3RlZEluZGV4ID0gdGhpcy5zZWxlY3RlZEluZGV4O1xuXG4gICAgICAgIHRoaXMuY3VyRGF0ZSA9IG5ldyBEYXRlKGRhdGUudmFsdWVPZigpKTtcbiAgICAgICAgbGV0IGRhdGVTdHJpbmcgPSAnJztcblxuICAgICAgICB0aGlzLmRhdGVQYXJ0cy5mb3JFYWNoKChkYXRlUGFydCkgPT4ge1xuICAgICAgICAgICAgZGF0ZVN0cmluZyArPSBkYXRlUGFydC5zZXRWYWx1ZShkYXRlKS50b1N0cmluZygpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmVsZW1lbnQudmFsdWUgPSBkYXRlU3RyaW5nO1xuICAgICAgICB0aGlzLnVwZGF0ZVNlbGVjdGlvbigpO1xuICAgIH1cblxuICAgIHByaXZhdGUgdXBkYXRlU2VsZWN0aW9uKCk6dm9pZCB7XG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkSW5kZXggPT09IHZvaWQgMCB8fCBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSB0aGlzLmVsZW1lbnQpIHJldHVybjtcbiAgICAgICAgbGV0IHN0YXJ0ID0gMDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNlbGVjdGVkSW5kZXg7IGkrKykge1xuICAgICAgICAgICAgc3RhcnQgKz0gdGhpcy5kYXRlUGFydHNbaV0udG9TdHJpbmcoKS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGVuZCA9IHN0YXJ0ICsgdGhpcy5kYXRlUGFydHNbdGhpcy5zZWxlY3RlZEluZGV4XS50b1N0cmluZygpLmxlbmd0aDtcbiAgICAgICAgdGhpcy5lbGVtZW50LnNldFNlbGVjdGlvblJhbmdlKHN0YXJ0LCBlbmQpO1xuICAgIH1cbn0iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
