(function(){
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
/// <reference path="OptionSanitizer.ts" />
window['Datium'] = (function () {
    var options;
    return (function () {
        function class_2(opts) {
            this.updateOptions(opts);
        }
        class_2.prototype.updateOptions = function (opts) {
            options = OptionSanitizer.sanitize(opts);
        };
        return class_2;
    })();
})();
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
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk9wdGlvblNhbml0aXplci50cyIsIkRhdGl1bS50cyIsIkZvcm1hdEJsb2Nrcy50cyJdLCJuYW1lcyI6WyJjb25zdHJ1Y3RvciIsInNhbml0aXplIiwidXBkYXRlT3B0aW9ucyIsIkRhdGVDaGFpbiIsIkRhdGVDaGFpbi5jb25zdHJ1Y3RvciIsIkRhdGVDaGFpbi5zZXRTZWNvbmRzIiwiRGF0ZUNoYWluLmluY1NlY29uZHMiLCJEYXRlQ2hhaW4uZGVjU2Vjb25kcyIsIkRhdGVDaGFpbi5zZXRNaW51dGVzIiwiRGF0ZUNoYWluLmluY01pbnV0ZXMiLCJEYXRlQ2hhaW4uZGVjTWludXRlcyIsIkRhdGVDaGFpbi5zZXRIb3VycyIsIkRhdGVDaGFpbi5pbmNIb3VycyIsIkRhdGVDaGFpbi5kZWNIb3VycyIsIkRhdGVDaGFpbi5zZXRNaWxpdGFyeUhvdXJzIiwiRGF0ZUNoYWluLnNldERhdGUiLCJEYXRlQ2hhaW4uaW5jRGF0ZSIsIkRhdGVDaGFpbi5kZWNEYXRlIiwiRGF0ZUNoYWluLnNldERheSIsIkRhdGVDaGFpbi5pbmNEYXkiLCJEYXRlQ2hhaW4uZGVjRGF5IiwiRGF0ZUNoYWluLnNldE1vbnRoIiwiRGF0ZUNoYWluLmluY01vbnRoIiwiRGF0ZUNoYWluLmRlY01vbnRoIiwiRGF0ZUNoYWluLnNldE1vbnRoU3RyaW5nIiwiRGF0ZUNoYWluLnNldFllYXIiLCJEYXRlQ2hhaW4uc2V0VHdvRGlnaXRZZWFyIiwiRGF0ZUNoYWluLnNldFVuaXhTZWNvbmRUaW1lc3RhbXAiLCJEYXRlQ2hhaW4uc2V0VW5peE1pbGxpc2Vjb25kVGltZXN0YW1wIiwiRGF0ZUNoYWluLnNldE1lcmlkaWVtIiwiRGF0ZUNoYWluLmluY01lcmlkaWVtIiwiRGF0ZUNoYWluLmRlY01lcmlkaWVtIiwiRGF0ZUNoYWluLmRheXNJbk1vbnRoIiwiRGF0ZUNoYWluLm1heE1vbnRoU3RyaW5nQnVmZmVyIiwiRGF0ZUNoYWluLm1heE1vbnRoQnVmZmVyIiwiRGF0ZUNoYWluLm1heERhdGVCdWZmZXIiLCJEYXRlQ2hhaW4ubWF4RGF5U3RyaW5nQnVmZmVyIiwiRGF0ZUNoYWluLm1heE1pbGl0YXJ5SG91cnNCdWZmZXIiLCJEYXRlQ2hhaW4ubWF4SG91cnNCdWZmZXIiLCJEYXRlQ2hhaW4ubWF4TWludXRlc0J1ZmZlciIsIkRhdGVDaGFpbi5tYXhTZWNvbmRzQnVmZmVyIiwiY2hhaW4iLCJnZXRVVENPZmZzZXQiLCJwYWQiLCJhcHBlbmRPcmRpbmFsIiwidG9TdGFuZGFyZFRpbWUiXSwibWFwcGluZ3MiOiJBQUFBLElBQUksZUFBZSxHQUFHLENBQUM7SUFDbkIsSUFBSSxlQUFlLEdBQUcsVUFBQyxPQUF3QjtRQUMzQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssS0FBSyxDQUFDLENBQUM7WUFBQyxNQUFNLHNDQUFzQyxDQUFDO1FBQ3JFLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDM0IsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUNuQixDQUFDLENBQUE7SUFFRCxNQUFNLENBQUM7UUFBQTtRQU1QQSxDQUFDQTtRQUxVLGdCQUFRLEdBQWYsVUFBZ0IsSUFBYTtZQUN6QkMsTUFBTUEsQ0FBQ0E7Z0JBQ0hBLE9BQU9BLEVBQUVBLGVBQWVBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBO2FBQ3pDQSxDQUFDQTtRQUNOQSxDQUFDQTtRQUNMLGNBQUM7SUFBRCxDQU5PLEFBTU4sR0FBQSxDQUFBO0FBQ0wsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQ2RMLDJDQUEyQztBQUVyQyxNQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztJQUN2QixJQUFJLE9BQWdCLENBQUM7SUFFckIsTUFBTSxDQUFDO1FBQ0gsaUJBQVksSUFBYTtZQUNyQkQsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDN0JBLENBQUNBO1FBRUQsK0JBQWEsR0FBYixVQUFjLElBQWE7WUFDdkJFLE9BQU9BLEdBQUdBLGVBQWVBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNB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Q0EsT0FBT0EsS0FBS0EsS0FBS0EsUUFBUUEsSUFBSUEsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzFEQSxHQUFHQSxHQUFHQSxRQUFRQSxDQUFTQSxLQUFLQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtZQUN0Q0EsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsS0FBS0EsS0FBS0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ25DQSxHQUFHQSxHQUFHQSxLQUFLQSxDQUFDQTtZQUNoQkEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ0pBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLEtBQUtBLENBQUNBLENBQUNBO2dCQUNuQkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7WUFDaEJBLENBQUNBO1lBQ0RBLEVBQUVBLENBQUNBLENBQUNBLEdBQUdBLEtBQUtBLENBQUNBLENBQUNBO2dCQUFDQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQTtZQUN2QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsR0FBR0EsQ0FBQ0EsSUFBSUEsR0FBR0EsR0FBR0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3RCQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDbkJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1lBQ2hCQSxDQUFDQTtZQUVEQSxFQUFFQSxDQUFDQSxDQUFDQSxHQUFHQSxLQUFLQSxFQUFFQSxJQUFJQSxRQUFRQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDbENBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBO1lBQ1pBLENBQUNBO1lBQ0RBLEVBQUVBLENBQUNBLENBQUNBLEdBQUdBLEtBQUtBLEVBQUVBLElBQUlBLFFBQVFBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO2dCQUNsQ0EsR0FBR0EsSUFBSUEsRUFBRUEsQ0FBQ0E7WUFDZEEsQ0FBQ0E7WUFDREEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFDeEJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2hCQSxDQUFDQTtRQUVNUiw0QkFBUUEsR0FBZkE7WUFDSVMsSUFBSUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFDakNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO1FBQ3pDQSxDQUFDQTtRQUVNVCw0QkFBUUEsR0FBZkE7WUFDSVUsSUFBSUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFDakNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO1FBQ3pDQSxDQUFDQTtRQUVNVixvQ0FBZ0JBLEdBQXZCQSxVQUF3QkEsS0FBbUJBO1lBQ3ZDVyxJQUFJQSxHQUFVQSxDQUFDQTtZQUNmQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxLQUFLQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDdkJBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUN0QkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7WUFDaEJBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLEtBQUtBLEtBQUtBLFFBQVFBLElBQUlBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUMxREEsR0FBR0EsR0FBR0EsUUFBUUEsQ0FBU0EsS0FBS0EsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7WUFDdENBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLEtBQUtBLEtBQUtBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO2dCQUNuQ0EsR0FBR0EsR0FBR0EsS0FBS0EsQ0FBQ0E7WUFDaEJBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLENBQUNBO2dCQUNKQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDbkJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1lBQ2hCQSxDQUFDQTtZQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxHQUFHQSxHQUFHQSxDQUFDQSxJQUFJQSxHQUFHQSxHQUFHQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDdEJBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLEtBQUtBLENBQUNBLENBQUNBO2dCQUNuQkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7WUFDaEJBLENBQUNBO1lBQ0RBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLEVBQUVBLEtBQUtBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUNuQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3hCQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxFQUFFQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDL0JBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO2dCQUNoQ0EsQ0FBQ0E7WUFDTEEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ0pBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNB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QUVBLENBQUNBLENBQUNBLEdBQUdBLEdBQUdBLENBQUNBLElBQUlBLEdBQUdBLEdBQUdBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO2dCQUN0QkEsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ25CQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtZQUNoQkEsQ0FBQ0E7WUFFREEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDNUJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2hCQSxDQUFDQTtRQUVNckIsMkJBQU9BLEdBQWRBLFVBQWVBLElBQWtCQTtZQUM3QnNCLElBQUlBLEdBQVVBLENBQUNBO1lBQ2ZBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBO2dCQUN0QkEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3pCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtZQUNoQkEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsSUFBSUEsS0FBS0EsUUFBUUEsSUFBSUEsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3hEQSxHQUFHQSxHQUFHQSxRQUFRQSxDQUFDQSxJQUFJQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtZQUM3QkEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsSUFBSUEsS0FBS0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2xDQSxHQUFHQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUNmQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFDSkEsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsS0FBS0EsQ0FBQ0EsQ0FB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QUlBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO1FBQzlDQSxDQUFDQTtRQUVNM0IsK0JBQVdBLEdBQWxCQTtZQUNJNEIsSUFBSUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsRUFBRUEsR0FBR0EsRUFBRUEsQ0FBQ0E7WUFDbENBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO1FBQzdDQSxDQUFDQTtRQUVPNUIsK0JBQVdBLEdBQW5CQTtZQUNJNkIsTUFBTUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsRUFBRUEsRUFBRUEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsRUFBRUEsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0E7UUFDcEZBLENBQUNBO1FBRU03Qix3Q0FBb0JBLEdBQTNCQTtZQUNJOEIsSUFBSUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0E7WUFDN0JBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO2dCQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQTtZQUM3QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7Z0JBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BO1lBQzdCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUE7WUFDN0JBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO2dCQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQTtZQUM3QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7Z0JBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BO1lBQzdCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUE7WUFDN0JBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO2dCQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQTtZQUM3QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7Z0JBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BO1lBQzdCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUE7WUFDN0JBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO2dCQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQTtZQUM3QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsRUFBRUEsQ0FBQ0E7Z0JBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BO1lBQzlCQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQTtRQUNwQkEsQ0FBQ0E7UUFFTTlCLGtDQUFjQSxHQUFyQkE7WUFDSStCLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLEVBQUVBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLENBQUNB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QUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLElBQUksRUFBMUIsQ0FBMEI7WUFDdEMsR0FBRyxFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLElBQUksRUFBMUIsQ0FBMEI7WUFDdEMsR0FBRyxFQUFFLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUEzQixDQUEyQjtZQUMxQyxTQUFTLEVBQUUsVUFBQyxDQUFDLElBQUssT0FBQSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsRUFBM0IsQ0FBMkI7U0FDaEQ7UUFDRDtZQUNJLElBQUksRUFBRSxJQUFJO1lBQ1YsTUFBTSxFQUFFLFVBQVU7WUFDbEIsR0FBRyxFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsR0FBRyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBdEIsQ0FBc0I7WUFDbEMsR0FBRyxFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLElBQUksRUFBMUIsQ0FBMEI7WUFDdEMsR0FBRyxFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLElBQUksRUFBMUIsQ0FBMEI7WUFDdEMsR0FBRyxFQUFFLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUEzQixDQUEyQjtZQUMxQyxTQUFTLEVBQUUsVUFBQyxDQUFDLElBQUssT0FBQSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsRUFBM0IsQ0FBMkI7U0FDaEQ7UUFDRDtZQUNJLElBQUksRUFBRSxHQUFHO1lBQ1QsTUFBTSxFQUFFLFVBQVU7WUFDbEIsR0FBRyxFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLFFBQVEsRUFBRSxFQUF6QixDQUF5QjtZQUNyQyxHQUFHLEVBQUUsVUFBQyxDQUFDLElBQUssT0FBQSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsSUFBSSxFQUExQixDQUEwQjtZQUN0QyxHQUFHLEVBQUUsVUFBQyxDQUFDLElBQUssT0FBQSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsSUFBSSxFQUExQixDQUEwQjtZQUN0QyxHQUFHLEVBQUUsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLE9BQUEsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQTNCLENBQTJCO1lBQzFDLFNBQVMsRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxFQUEzQixDQUEyQjtTQUNoRDtRQUNEO1lBQ0ksSUFBSSxFQUFFLElBQUk7WUFDVixNQUFNLEVBQUUsNEJBQTRCO1lBQ3BDLEdBQUcsRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLFlBQVksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQXJCLENBQXFCLENBQUMsc0NBQXNDO1NBQzNFO1FBQ0Q7WUFDSSxJQUFJLEVBQUUsR0FBRztZQUNULE1BQU0sRUFBRSxtQkFBbUI7WUFDM0IsR0FBRyxFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsWUFBWSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsRUFBdEIsQ0FBc0I7U0FDckM7S0FDSixDQUFDO0FBQ04sQ0FBQyxDQUFDLEVBQUUsQ0FBQyIsImZpbGUiOiJkYXRpdW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyJsZXQgT3B0aW9uU2FuaXRpemVyID0gKCgpID0+IHtcclxuICAgIGxldCBzYW5pdGl6ZUVsZW1lbnQgPSAoZWxlbWVudDpIVE1MSW5wdXRFbGVtZW50KTpIVE1MSW5wdXRFbGVtZW50ID0+IHtcclxuICAgICAgICBpZiAoZWxlbWVudCA9PT0gdm9pZCAwKSB0aHJvdyAnREFUSVVNOiBcImVsZW1lbnRcIiBvcHRpb24gaXMgcmVxdWlyZWQnO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdvaCB5ZWFoIGFoYScpO1xyXG4gICAgICAgIHJldHVybiBlbGVtZW50O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICByZXR1cm4gY2xhc3Mge1xyXG4gICAgICAgIHN0YXRpYyBzYW5pdGl6ZShvcHRzOklPcHRpb25zKTpJT3B0aW9ucyB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50OiBzYW5pdGl6ZUVsZW1lbnQob3B0cy5lbGVtZW50KVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiT3B0aW9uU2FuaXRpemVyLnRzXCIgLz5cclxuXHJcbig8YW55PndpbmRvdylbJ0RhdGl1bSddID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgbGV0IG9wdGlvbnM6SU9wdGlvbnM7XHJcbiAgICBcclxuICAgIHJldHVybiBjbGFzcyB7XHJcbiAgICAgICAgY29uc3RydWN0b3Iob3B0czpJT3B0aW9ucykge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZU9wdGlvbnMob3B0cyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHVwZGF0ZU9wdGlvbnMob3B0czpJT3B0aW9ucyk6dm9pZCB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSBPcHRpb25TYW5pdGl6ZXIuc2FuaXRpemUob3B0cyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsImludGVyZmFjZSBJRm9ybWF0QmxvY2sge1xyXG4gICAgY29kZTpzdHJpbmc7XHJcbiAgICBzdHIoZDpEYXRlKTpzdHJpbmc7XHJcbiAgICByZWdFeHA/OnN0cmluZztcclxuICAgIC8vIGxlYXZpbmcgaW5jLCBkZWMgYW5kIHNldCB1bnNldCB3aWxsIG1ha2UgdGhlIGJsb2NrIHVuc2VsZWN0YWJsZVxyXG4gICAgaW5jPyhkOkRhdGUpOkRhdGU7XHJcbiAgICBkZWM/KGQ6RGF0ZSk6RGF0ZTtcclxuICAgIHNldD8oZDpEYXRlLCB2OnN0cmluZ3xudW1iZXIpOkRhdGU7XHJcbiAgICBtYXhCdWZmZXI/KGQ6RGF0ZSk6bnVtYmVyO1xyXG59XHJcblxyXG5sZXQgZm9ybWF0QmxvY2tzOklGb3JtYXRCbG9ja1tdID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgXHJcbiAgICBjb25zdCBtb250aE5hbWVzOnN0cmluZ1tdID0gWydKYW51YXJ5JywgJ0ZlYnJ1YXJ5JywgJ01hcmNoJywgJ0FwcmlsJywgJ01heScsICdKdW5lJywgJ0p1bHknLCAnQXVndXN0JywgJ1NlcHRlbWJlcicsICdPY3RvYmVyJywgJ05vdmVtYmVyJywgJ0RlY2VtYmVyJ107XHJcbiAgICBjb25zdCBkYXlOYW1lczpzdHJpbmdbXSA9IFsnU3VuZGF5JywgJ01vbmRheScsICdUdWVzZGF5JywgJ1dlZG5lc2RheScsICdUaHVyc2RheScsICdGcmlkYXknLCAnU2F0dXJkYXknXTtcclxuXHJcbiAgICBjbGFzcyBEYXRlQ2hhaW4ge1xyXG4gICAgICAgIHB1YmxpYyBkYXRlOkRhdGU7XHJcbiAgICAgICAgY29uc3RydWN0b3IoZGF0ZTpEYXRlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKGRhdGUudmFsdWVPZigpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFNlY29uZHMoc2Vjb25kczpzdHJpbmd8bnVtYmVyKTpEYXRlQ2hhaW4ge1xyXG4gICAgICAgICAgICBsZXQgbnVtOm51bWJlcjtcclxuICAgICAgICAgICAgaWYgKHNlY29uZHMgPT09ICdaRVJPX09VVCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRTZWNvbmRzKDApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHNlY29uZHMgPT09ICdzdHJpbmcnICYmIC9eXFxkKyQvLnRlc3Qoc2Vjb25kcykpIHtcclxuICAgICAgICAgICAgICAgIG51bSA9IHBhcnNlSW50KDxzdHJpbmc+c2Vjb25kcywgMTApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBzZWNvbmRzID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICAgICAgbnVtID0gc2Vjb25kcztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IHZvaWQgMDtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChudW0gPCAwIHx8IG51bSA+IDU5KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0U2Vjb25kcyhudW0pO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGluY1NlY29uZHMoKTpEYXRlQ2hhaW4ge1xyXG4gICAgICAgICAgICBsZXQgbiA9IHRoaXMuZGF0ZS5nZXRTZWNvbmRzKCkgKyAxO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRTZWNvbmRzKG4gPiA1OSA/IDAgOiBuKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGRlY1NlY29uZHMoKTpEYXRlQ2hhaW4ge1xyXG4gICAgICAgICAgICBsZXQgbiA9IHRoaXMuZGF0ZS5nZXRTZWNvbmRzKCkgLSAxO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRTZWNvbmRzKG4gPCAwID8gNTkgOiBuKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldE1pbnV0ZXMobWludXRlczpzdHJpbmd8bnVtYmVyKTpEYXRlQ2hhaW4ge1xyXG4gICAgICAgICAgICBsZXQgbnVtOm51bWJlcjtcclxuICAgICAgICAgICAgaWYgKG1pbnV0ZXMgPT09ICdaRVJPX09VVCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRNaW51dGVzKDApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG1pbnV0ZXMgPT09ICdzdHJpbmcnICYmIC9eXFxkKyQvLnRlc3QobWludXRlcykpIHtcclxuICAgICAgICAgICAgICAgIG51bSA9IHBhcnNlSW50KDxzdHJpbmc+bWludXRlcywgMTApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBtaW51dGVzID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICAgICAgbnVtID0gbWludXRlcztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IHZvaWQgMDtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChudW0gPCAwIHx8IG51bSA+IDU5KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0TWludXRlcyhudW0pO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGluY01pbnV0ZXMoKTpEYXRlQ2hhaW4ge1xyXG4gICAgICAgICAgICBsZXQgbiA9IHRoaXMuZGF0ZS5nZXRNaW51dGVzKCkgKyAxO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRNaW51dGVzKG4gPiA1OSA/IDAgOiBuKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGRlY01pbnV0ZXMoKTpEYXRlQ2hhaW4ge1xyXG4gICAgICAgICAgICBsZXQgbiA9IHRoaXMuZGF0ZS5nZXRNaW51dGVzKCkgLSAxO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRNaW51dGVzKG4gPCAwID8gNTkgOiBuKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldEhvdXJzKGhvdXJzOnN0cmluZ3xudW1iZXIpOkRhdGVDaGFpbiB7XHJcbiAgICAgICAgICAgIGxldCBudW06bnVtYmVyO1xyXG4gICAgICAgICAgICBsZXQgbWVyaWRpZW0gPSB0aGlzLmRhdGUuZ2V0SG91cnMoKSA+IDExID8gJ1BNJyA6ICdBTSc7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoaG91cnMgPT09ICdaRVJPX09VVCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRIb3VycyhtZXJpZGllbSA9PT0gJ0FNJyA/IDAgOiAxMik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgaG91cnMgPT09ICdzdHJpbmcnICYmIC9eXFxkKyQvLnRlc3QoaG91cnMpKSB7XHJcbiAgICAgICAgICAgICAgICBudW0gPSBwYXJzZUludCg8c3RyaW5nPmhvdXJzLCAxMCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGhvdXJzID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICAgICAgbnVtID0gaG91cnM7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobnVtID09PSAwKSBudW0gPSAxO1xyXG4gICAgICAgICAgICBpZiAobnVtIDwgMSB8fCBudW0gPiAxMikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gdm9pZCAwO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChudW0gPT09IDEyICYmIG1lcmlkaWVtID09PSAnQU0nKSB7XHJcbiAgICAgICAgICAgICAgICBudW0gPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChudW0gIT09IDEyICYmIG1lcmlkaWVtID09PSAnUE0nKSB7XHJcbiAgICAgICAgICAgICAgICBudW0gKz0gMTI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5kYXRlLnNldEhvdXJzKG51bSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgaW5jSG91cnMoKTpEYXRlQ2hhaW4ge1xyXG4gICAgICAgICAgICBsZXQgbiA9IHRoaXMuZGF0ZS5nZXRIb3VycygpICsgMTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0SG91cnMobiA+IDIzID8gMCA6IG4pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZGVjSG91cnMoKTpEYXRlQ2hhaW4ge1xyXG4gICAgICAgICAgICBsZXQgbiA9IHRoaXMuZGF0ZS5nZXRIb3VycygpIC0gMTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0SG91cnMobiA8IDAgPyAyMyA6IG4pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgc2V0TWlsaXRhcnlIb3Vycyhob3VyczpzdHJpbmd8bnVtYmVyKTpEYXRlQ2hhaW4ge1xyXG4gICAgICAgICAgICBsZXQgbnVtOm51bWJlcjtcclxuICAgICAgICAgICAgaWYgKGhvdXJzID09PSAnWkVST19PVVQnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnMoMCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgaG91cnMgPT09ICdzdHJpbmcnICYmIC9eXFxkKyQvLnRlc3QoaG91cnMpKSB7XHJcbiAgICAgICAgICAgICAgICBudW0gPSBwYXJzZUludCg8c3RyaW5nPmhvdXJzLCAxMCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGhvdXJzID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICAgICAgbnVtID0gaG91cnM7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobnVtIDwgMCB8fCBudW0gPiAyMykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gdm9pZCAwO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuZGF0ZS5nZXRIb3VycygpID09PSBudW0gKyAxKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0SG91cnMobnVtKTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmRhdGUuZ2V0SG91cnMoKSAhPT0gbnVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldEhvdXJzKG51bSAtIDEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldEhvdXJzKG51bSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXREYXRlKGRhdGU6c3RyaW5nfG51bWJlcik6RGF0ZUNoYWluIHtcclxuICAgICAgICAgICAgbGV0IG51bTpudW1iZXI7XHJcbiAgICAgICAgICAgIGlmIChkYXRlID09PSAnWkVST19PVVQnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0RGF0ZSgxKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBkYXRlID09PSAnc3RyaW5nJyAmJiAvXFxkezEsMn0uKiQvLnRlc3QoZGF0ZSkpIHtcclxuICAgICAgICAgICAgICAgIG51bSA9IHBhcnNlSW50KDxzdHJpbmc+ZGF0ZSwgMTApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgICh0eXBlb2YgZGF0ZSA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICAgICAgICAgIG51bSA9IGRhdGU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobnVtID09PSAwKSBudW0gPSAxO1xyXG4gICAgICAgICAgICBpZiAobnVtIDwgMSB8fCBudW0gPiB0aGlzLmRheXNJbk1vbnRoKCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IHZvaWQgMDtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXREYXRlKG51bSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgaW5jRGF0ZSgpOkRhdGVDaGFpbiB7XHJcbiAgICAgICAgICAgIGxldCBuID0gdGhpcy5kYXRlLmdldERhdGUoKSArIDE7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldERhdGUobiA+IHRoaXMuZGF5c0luTW9udGgoKSA/IDEgOiBuKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGRlY0RhdGUoKTpEYXRlQ2hhaW4ge1xyXG4gICAgICAgICAgICBsZXQgbiA9IHRoaXMuZGF0ZS5nZXREYXRlKCkgLSAxO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXREYXRlKG4gPCAwID8gdGhpcy5kYXlzSW5Nb250aCgpIDogbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXREYXkoZGF5OnN0cmluZ3xudW1iZXIpOkRhdGVDaGFpbiB7XHJcbiAgICAgICAgICAgIGxldCBudW06bnVtYmVyO1xyXG4gICAgICAgICAgICBpZiAoZGF5ID09PSAnWkVST19PVVQnKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXREYXkoMCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGRheSA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICAgICAgICAgIG51bSA9IGRheTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZGF5ID09PSAnc3RyaW5nJyAmJiBkYXlOYW1lcy5zb21lKChkYXlOYW1lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAobmV3IFJlZ0V4cChgXiR7ZGF5fS4qJGAsICdpJykudGVzdChkYXlOYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG51bSA9IGRheU5hbWVzLmluZGV4T2YoZGF5TmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pKSB7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKG51bSA8IDAgfHwgbnVtID4gNikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gdm9pZCAwO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBvZmZzZXQgPSB0aGlzLmRhdGUuZ2V0RGF5KCkgLSBudW07XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXREYXRlKHRoaXMuZGF0ZS5nZXREYXRlKCkgLSBvZmZzZXQpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGluY0RheSgpOkRhdGVDaGFpbiB7XHJcbiAgICAgICAgICAgIGxldCBuID0gdGhpcy5kYXRlLmdldERheSgpICsgMTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0RGF5KG4gPiA2ID8gMCA6IG4pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZGVjRGF5KCk6RGF0ZUNoYWluIHtcclxuICAgICAgICAgICAgbGV0IG4gPSB0aGlzLmRhdGUuZ2V0RGF5KCkgLSAxO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXREYXkobiA8IDAgPyA2IDogbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRNb250aChtb250aDpzdHJpbmd8bnVtYmVyKTpEYXRlQ2hhaW4ge1xyXG4gICAgICAgICAgICBsZXQgbnVtOm51bWJlcjtcclxuICAgICAgICAgICAgaWYgKG1vbnRoID09PSAnWkVST19PVVQnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUuc2V0TW9udGgoMCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbW9udGggPT09ICdzdHJpbmcnICYmIC9eXFxkKyQvLnRlc3QobW9udGgpKSB7XHJcbiAgICAgICAgICAgICAgICBudW0gPSBwYXJzZUludChtb250aCwgMTApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBtb250aCA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICAgICAgICAgIG51bSA9IG1vbnRoO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gdm9pZCAwO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChudW0gPT09IDApIG51bSA9IDE7XHJcbiAgICAgICAgICAgIGlmIChudW0gPCAxIHx8IG51bSA+IDEyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1vbnRoKG51bSAtIDEpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGluY01vbnRoKCk6RGF0ZUNoYWluIHtcclxuICAgICAgICAgICAgbGV0IG4gPSB0aGlzLmRhdGUuZ2V0TW9udGgoKSArIDI7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldERheShuID4gMTIgPyAxIDogbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBkZWNNb250aCgpOkRhdGVDaGFpbiB7XHJcbiAgICAgICAgICAgIGxldCBuID0gdGhpcy5kYXRlLmdldE1vbnRoKCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldERheShuIDwgMSA/IDEyIDogbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRNb250aFN0cmluZyhtb250aDpzdHJpbmd8bnVtYmVyKTpEYXRlQ2hhaW4ge1xyXG4gICAgICAgICAgICBsZXQgbnVtOm51bWJlcjtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChtb250aCA9PT0gJ1pFUk9fT1VUJykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1vbnRoKDApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG1vbnRoID09PSAnc3RyaW5nJyAmJiBtb250aE5hbWVzLnNvbWUoKG1vbnRoTmFtZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKG5ldyBSZWdFeHAoYF4ke21vbnRofS4qJGAsICdpJykudGVzdChtb250aE5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbnVtID0gbW9udGhOYW1lcy5pbmRleE9mKG1vbnRoTmFtZSkgKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KSkge1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gdm9pZCAwO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChudW0gPCAxIHx8IG51bSA+IDEyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5kYXRlLnNldE1vbnRoKG51bSAtIDEpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHNldFllYXIoeWVhcjpzdHJpbmd8bnVtYmVyKTpEYXRlQ2hhaW4ge1xyXG4gICAgICAgICAgICBsZXQgbnVtOm51bWJlcjtcclxuICAgICAgICAgICAgaWYgKHllYXIgPT09ICdaRVJPX09VVCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRGdWxsWWVhcigwKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB5ZWFyID09PSAnc3RyaW5nJyAmJiAvXlxcZCskLy50ZXN0KHllYXIpKSB7XHJcbiAgICAgICAgICAgICAgICBudW0gPSBwYXJzZUludCh5ZWFyLCAxMCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHllYXIgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgICAgICBudW0gPSB5ZWFyO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gdm9pZCAwO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgIH0gICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLmRhdGUuc2V0RnVsbFllYXIobnVtKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRUd29EaWdpdFllYXIoeWVhcjpzdHJpbmd8bnVtYmVyKTpEYXRlQ2hhaW4ge1xyXG4gICAgICAgICAgICBsZXQgYmFzZSA9IE1hdGguZmxvb3IodGhpcy5kYXRlLmdldEZ1bGxZZWFyKCkvMTAwKSoxMDA7XHJcbiAgICAgICAgICAgIGxldCBudW06bnVtYmVyO1xyXG4gICAgICAgICAgICBpZiAoeWVhciA9PT0gJ1pFUk9fT1VUJykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlLnNldEZ1bGxZZWFyKGJhc2UpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHllYXIgPT09ICdzdHJpbmcnICYmIC9eXFxkKyQvLnRlc3QoeWVhcikpIHtcclxuICAgICAgICAgICAgICAgIG51bSA9IHBhcnNlSW50KHllYXIsIDEwKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgeWVhciA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICAgICAgICAgIG51bSA9IHllYXI7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgfSAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZS5zZXRGdWxsWWVhcihiYXNlICsgbnVtKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRVbml4U2Vjb25kVGltZXN0YW1wKHNlY29uZHM6c3RyaW5nfG51bWJlcik6RGF0ZUNoYWluIHtcclxuICAgICAgICAgICAgbGV0IG51bTpudW1iZXI7XHJcbiAgICAgICAgICAgIGlmIChzZWNvbmRzID09PSAnWkVST19PVVQnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSgwKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBzZWNvbmRzID09PSAnc3RyaW5nJyAmJiAvXlxcZCskLy50ZXN0KHNlY29uZHMpKSB7XHJcbiAgICAgICAgICAgICAgICBudW0gPSBwYXJzZUludChzZWNvbmRzLCAxMCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHNlY29uZHMgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgICAgICBudW0gPSBzZWNvbmRzO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gdm9pZCAwO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgIH0gICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZShudW0gKiAxMDAwKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRVbml4TWlsbGlzZWNvbmRUaW1lc3RhbXAobWlsbGlzZWNvbmRzOnN0cmluZ3xudW1iZXIpOkRhdGVDaGFpbiB7XHJcbiAgICAgICAgICAgIGxldCBudW06bnVtYmVyO1xyXG4gICAgICAgICAgICBpZiAobWlsbGlzZWNvbmRzID09PSAnWkVST19PVVQnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSgwKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBtaWxsaXNlY29uZHMgPT09ICdzdHJpbmcnICYmIC9eXFxkKyQvLnRlc3QobWlsbGlzZWNvbmRzKSkge1xyXG4gICAgICAgICAgICAgICAgbnVtID0gcGFyc2VJbnQobWlsbGlzZWNvbmRzLCAxMCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG1pbGxpc2Vjb25kcyA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICAgICAgICAgIG51bSA9IG1pbGxpc2Vjb25kcztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IHZvaWQgMDtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9ICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUobnVtKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBzZXRNZXJpZGllbShtZXJpZGllbTpzdHJpbmd8bnVtYmVyKTpEYXRlQ2hhaW4ge1xyXG4gICAgICAgICAgICBsZXQgaG91cnMgPSB0aGlzLmRhdGUuZ2V0SG91cnMoKTtcclxuICAgICAgICAgICAgaWYgKG1lcmlkaWVtID09PSAnWkVST19PVVQnKSByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBtZXJpZGllbSA9PT0gJ3N0cmluZycgJiYgL15hbT8kL2kudGVzdCg8c3RyaW5nPm1lcmlkaWVtKSkge1xyXG4gICAgICAgICAgICAgICAgaG91cnMgLT0gMTI7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG1lcmlkaWVtID09PSAnc3RyaW5nJyAmJiAvXnBtPyQvaS50ZXN0KDxzdHJpbmc+bWVyaWRpZW0pKSB7XHJcbiAgICAgICAgICAgICAgICBob3VycyArPSAxMjtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IHZvaWQgMDtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChob3VycyA8IDAgfHwgaG91cnMgPiAyMykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5kYXRlLnNldEhvdXJzKGhvdXJzKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBpbmNNZXJpZGllbSgpOkRhdGVDaGFpbiB7XHJcbiAgICAgICAgICAgIGxldCBuID0gdGhpcy5kYXRlLmdldEhvdXJzKCkgKyAxMjtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0SG91cnMobiA+IDIzID8gbiAtIDI0IDogbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBkZWNNZXJpZGllbSgpOkRhdGVDaGFpbiB7XHJcbiAgICAgICAgICAgIGxldCBuID0gdGhpcy5kYXRlLmdldEhvdXJzKCkgLSAxMjtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0SG91cnMobiA8IDAgPyBuICsgMjQgOiBuKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHJpdmF0ZSBkYXlzSW5Nb250aCgpOm51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZSh0aGlzLmRhdGUuZ2V0RnVsbFllYXIoKSwgdGhpcy5kYXRlLmdldE1vbnRoKCkgKyAxLCAwKS5nZXREYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBtYXhNb250aFN0cmluZ0J1ZmZlcigpOm51bWJlciB7XHJcbiAgICAgICAgICAgIGxldCBtID0gdGhpcy5kYXRlLmdldE1vbnRoKCk7XHJcbiAgICAgICAgICAgIGlmIChtID09PSAwKSByZXR1cm4gMjsgLy8gSmFuXHJcbiAgICAgICAgICAgIGlmIChtID09PSAxKSByZXR1cm4gMTsgLy8gRmViXHJcbiAgICAgICAgICAgIGlmIChtID09PSAyKSByZXR1cm4gMzsgLy8gTWFyXHJcbiAgICAgICAgICAgIGlmIChtID09PSAzKSByZXR1cm4gMjsgLy8gQXByXHJcbiAgICAgICAgICAgIGlmIChtID09PSA0KSByZXR1cm4gMzsgLy8gTWF5XHJcbiAgICAgICAgICAgIGlmIChtID09PSA1KSByZXR1cm4gMzsgLy8gSnVuXHJcbiAgICAgICAgICAgIGlmIChtID09PSA2KSByZXR1cm4gMzsgLy8gSnVsXHJcbiAgICAgICAgICAgIGlmIChtID09PSA3KSByZXR1cm4gMjsgLy8gQXVnXHJcbiAgICAgICAgICAgIGlmIChtID09PSA4KSByZXR1cm4gMTsgLy8gU2VwXHJcbiAgICAgICAgICAgIGlmIChtID09PSA5KSByZXR1cm4gMTsgLy8gT2N0XHJcbiAgICAgICAgICAgIGlmIChtID09PSAxMCkgcmV0dXJuIDE7IC8vIE5vdlxyXG4gICAgICAgICAgICByZXR1cm4gMTsgLy8gRGVjXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBtYXhNb250aEJ1ZmZlcigpOm51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0TW9udGgoKSA+IDAgPyAxIDogMjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIG1heERhdGVCdWZmZXIoKTpudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldERhdGUoKSAqIDEwID4gdGhpcy5kYXlzSW5Nb250aCgpID8gMSA6IDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBtYXhEYXlTdHJpbmdCdWZmZXIoKTpudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldERheSgpICUgMiA9PSAwID8gMiA6IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBtYXhNaWxpdGFyeUhvdXJzQnVmZmVyKCk6bnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXRIb3VycygpID4gMiA/IDEgOiAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgbWF4SG91cnNCdWZmZXIoKTpudW1iZXIge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kYXRlLmdldEhvdXJzKCkgPiAxMSkgeyAvLyBQTVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXRIb3VycygpID4gMTMgPyAxIDogMjtcclxuICAgICAgICAgICAgfSBlbHNlIHsgLy8gQU1cclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0SG91cnMoKSA+IDEgPyAxIDogMjsgICBcclxuICAgICAgICAgICAgfSAgICAgICAgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBtYXhNaW51dGVzQnVmZmVyKCk6bnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXRNaW51dGVzKCkgPiA1ID8gMSA6IDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBtYXhTZWNvbmRzQnVmZmVyKCk6bnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXRTZWNvbmRzKCkgPiA1ID8gMSA6IDI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNoYWluKGQ6RGF0ZSk6RGF0ZUNoYWluIHtcclxuICAgICAgICByZXR1cm4gbmV3IERhdGVDaGFpbihkKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRVVENPZmZzZXQoZGF0ZTpEYXRlLCBzaG93Q29sb246Ym9vbGVhbik6c3RyaW5nIHtcclxuICAgICAgICBsZXQgdHpvID0gLWRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKTtcclxuICAgICAgICBsZXQgZGlmID0gdHpvID49IDAgPyAnKycgOiAnLSc7XHJcbiAgICAgICAgbGV0IGNvbG9uID0gc2hvd0NvbG9uID8gJzonIDogJyc7XHJcbiAgICAgICAgcmV0dXJuIGRpZiArIHBhZCh0em8gLyA2MCwgMikgKyBjb2xvbiArIHBhZCh0em8gJSA2MCwgMik7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGFkKG51bTpudW1iZXIsIGxlbmd0aDpudW1iZXIpOnN0cmluZyB7XHJcbiAgICAgICAgbGV0IHBhZGRlZCA9IE1hdGguYWJzKG51bSkudG9TdHJpbmcoKTtcclxuICAgICAgICB3aGlsZSAocGFkZGVkLmxlbmd0aCA8IGxlbmd0aCkgcGFkZGVkID0gJzAnICsgcGFkZGVkO1xyXG4gICAgICAgIHJldHVybiBwYWRkZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gYXBwZW5kT3JkaW5hbChudW06bnVtYmVyKTpzdHJpbmcge1xyXG4gICAgICAgIGxldCBqID0gbnVtICUgMTA7XHJcbiAgICAgICAgbGV0IGsgPSBudW0gJSAxMDA7XHJcbiAgICAgICAgaWYgKGogPT0gMSAmJiBrICE9IDExKSByZXR1cm4gbnVtICsgXCJzdFwiO1xyXG4gICAgICAgIGlmIChqID09IDIgJiYgayAhPSAxMikgcmV0dXJuIG51bSArIFwibmRcIjtcclxuICAgICAgICBpZiAoaiA9PSAzICYmIGsgIT0gMTMpIHJldHVybiBudW0gKyBcInJkXCI7XHJcbiAgICAgICAgcmV0dXJuIG51bSArIFwidGhcIjtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB0b1N0YW5kYXJkVGltZShob3VyczpudW1iZXIpOm51bWJlciB7XHJcbiAgICAgICAgaWYgKGhvdXJzID09PSAwKSByZXR1cm4gMTI7XHJcbiAgICAgICAgcmV0dXJuIGhvdXJzID4gMTIgPyBob3VycyAtIDEyIDogaG91cnM7XHJcbiAgICB9ICAgIFxyXG4gICAgXHJcbiAgICByZXR1cm4gPElGb3JtYXRCbG9ja1tdPiBbXHJcbiAgICAgICAgeyAvLyBGT1VSIERJR0lUIFlFQVJcclxuICAgICAgICAgICAgY29kZTogJ1lZWVknLFxyXG4gICAgICAgICAgICByZWdFeHA6ICdcXFxcZHs0LDR9JyxcclxuICAgICAgICAgICAgc3RyOiAoZCkgPT4gZC5nZXRGdWxsWWVhcigpLnRvU3RyaW5nKCksXHJcbiAgICAgICAgICAgIGluYzogKGQpID0+IGNoYWluKGQpLnNldFllYXIoZC5nZXRGdWxsWWVhcigpICsgMSkuZGF0ZSxcclxuICAgICAgICAgICAgZGVjOiAoZCkgPT4gY2hhaW4oZCkuc2V0WWVhcihkLmdldEZ1bGxZZWFyKCkgLSAxKS5kYXRlLFxyXG4gICAgICAgICAgICBzZXQ6IChkLCB2KSA9PiBjaGFpbihkKS5zZXRZZWFyKHYpLmRhdGUsXHJcbiAgICAgICAgICAgIG1heEJ1ZmZlcjogKGQpID0+IDRcclxuICAgICAgICB9LFxyXG4gICAgICAgIHsgLy8gVFdPIERJR0lUIFlFQVJcclxuICAgICAgICAgICAgY29kZTogJ1lZJyxcclxuICAgICAgICAgICAgcmVnRXhwOiAnXFxcXGR7MiwyfScsXHJcbiAgICAgICAgICAgIHN0cjogKGQpID0+IGQuZ2V0RnVsbFllYXIoKS50b1N0cmluZygpLnNsaWNlKC0yKSxcclxuICAgICAgICAgICAgaW5jOiAoZCkgPT4gY2hhaW4oZCkuc2V0WWVhcihkLmdldEZ1bGxZZWFyKCkgKyAxKS5kYXRlLFxyXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBjaGFpbihkKS5zZXRZZWFyKGQuZ2V0RnVsbFllYXIoKSAtIDEpLmRhdGUsXHJcbiAgICAgICAgICAgIHNldDogKGQsIHYpID0+IGNoYWluKGQpLnNldFR3b0RpZ2l0WWVhcih2KS5kYXRlLFxyXG4gICAgICAgICAgICBtYXhCdWZmZXI6IChkKSA9PiAyXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7IC8vIExPTkcgTU9OVEggTkFNRVxyXG4gICAgICAgICAgICBjb2RlOiAnTU1NTScsXHJcbiAgICAgICAgICAgIHJlZ0V4cDogYCgoJHttb250aE5hbWVzLmpvaW4oJyl8KCcpfSkpYCxcclxuICAgICAgICAgICAgc3RyOiAoZCkgPT4gbW9udGhOYW1lc1tkLmdldE1vbnRoKCldLFxyXG4gICAgICAgICAgICBpbmM6IChkKSA9PiBjaGFpbihkKS5pbmNNb250aCgpLmRhdGUsXHJcbiAgICAgICAgICAgIGRlYzogKGQpID0+IGNoYWluKGQpLmRlY01vbnRoKCkuZGF0ZSxcclxuICAgICAgICAgICAgc2V0OiAoZCwgdikgPT4gY2hhaW4oZCkuc2V0TW9udGhTdHJpbmcodikuZGF0ZSxcclxuICAgICAgICAgICAgbWF4QnVmZmVyOiAoZCkgPT4gY2hhaW4oZCkubWF4TW9udGhTdHJpbmdCdWZmZXIoKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeyAvLyBTSE9SVCBNT05USCBOQU1FXHJcbiAgICAgICAgICAgIGNvZGU6ICdNTU0nLFxyXG4gICAgICAgICAgICByZWdFeHA6IGAoKCR7bW9udGhOYW1lcy5tYXAoKHYpID0+IHYuc2xpY2UoMCwzKSkuam9pbignKXwoJyl9KSlgLFxyXG4gICAgICAgICAgICBzdHI6IChkKSA9PiBtb250aE5hbWVzW2QuZ2V0TW9udGgoKV0uc2xpY2UoMCwzKSxcclxuICAgICAgICAgICAgaW5jOiAoZCkgPT4gY2hhaW4oZCkuaW5jTW9udGgoKS5kYXRlLFxyXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBjaGFpbihkKS5kZWNNb250aCgpLmRhdGUsXHJcbiAgICAgICAgICAgIHNldDogKGQsIHYpID0+IGNoYWluKGQpLnNldE1vbnRoU3RyaW5nKHYpLmRhdGUsXHJcbiAgICAgICAgICAgIG1heEJ1ZmZlcjogKGQpID0+IGNoYWluKGQpLm1heE1vbnRoU3RyaW5nQnVmZmVyKClcclxuICAgICAgICB9LFxyXG4gICAgICAgIHsgLy8gUEFEREVEIE1PTlRIXHJcbiAgICAgICAgICAgIGNvZGU6ICdNTScsXHJcbiAgICAgICAgICAgIHJlZ0V4cDogJ1xcXFxkezIsMn0nLFxyXG4gICAgICAgICAgICBzdHI6IChkKSA9PiBwYWQoZC5nZXRNb250aCgpICsgMSwgMiksXHJcbiAgICAgICAgICAgIGluYzogKGQpID0+IGNoYWluKGQpLmluY01vbnRoKCkuZGF0ZSxcclxuICAgICAgICAgICAgZGVjOiAoZCkgPT4gY2hhaW4oZCkuZGVjTW9udGgoKS5kYXRlLFxyXG4gICAgICAgICAgICBzZXQ6IChkLCB2KSA9PiBjaGFpbihkKS5zZXRNb250aCh2KS5kYXRlLFxyXG4gICAgICAgICAgICBtYXhCdWZmZXI6IChkKSA9PiBjaGFpbihkKS5tYXhNb250aEJ1ZmZlcigpXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7IC8vIE1PTlRIXHJcbiAgICAgICAgICAgIGNvZGU6ICdNJyxcclxuICAgICAgICAgICAgcmVnRXhwOiAnXFxcXGR7MSwyfScsXHJcbiAgICAgICAgICAgIHN0cjogKGQpID0+IChkLmdldE1vbnRoKCkgKyAxKS50b1N0cmluZygpLFxyXG4gICAgICAgICAgICBpbmM6IChkKSA9PiBjaGFpbihkKS5pbmNNb250aCgpLmRhdGUsXHJcbiAgICAgICAgICAgIGRlYzogKGQpID0+IGNoYWluKGQpLmRlY01vbnRoKCkuZGF0ZSxcclxuICAgICAgICAgICAgc2V0OiAoZCwgdikgPT4gY2hhaW4oZCkuc2V0TW9udGgodikuZGF0ZSxcclxuICAgICAgICAgICAgbWF4QnVmZmVyOiAoZCkgPT4gY2hhaW4oZCkubWF4TW9udGhCdWZmZXIoKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeyAvLyBQQURERUQgREFURVxyXG4gICAgICAgICAgICBjb2RlOiAnREQnLFxyXG4gICAgICAgICAgICByZWdFeHA6ICdcXFxcZHsyLDJ9JyxcclxuICAgICAgICAgICAgc3RyOiAoZCkgPT4gcGFkKGQuZ2V0RGF0ZSgpLCAyKSxcclxuICAgICAgICAgICAgaW5jOiAoZCkgPT4gY2hhaW4oZCkuaW5jRGF0ZSgpLmRhdGUsXHJcbiAgICAgICAgICAgIGRlYzogKGQpID0+IGNoYWluKGQpLmRlY0RhdGUoKS5kYXRlLFxyXG4gICAgICAgICAgICBzZXQ6IChkLCB2KSA9PiBjaGFpbihkKS5zZXREYXRlKHYpLmRhdGUsXHJcbiAgICAgICAgICAgIG1heEJ1ZmZlcjogKGQpID0+IGNoYWluKGQpLm1heERhdGVCdWZmZXIoKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeyAvLyBPUkRJTkFMIERBVEVcclxuICAgICAgICAgICAgY29kZTogJ0RvJyxcclxuICAgICAgICAgICAgcmVnRXhwOiAnXFxcXGR7MSwyfSgodGgpfChuZCl8KHJkKXwoc3QpKScsXHJcbiAgICAgICAgICAgIHN0cjogKGQpID0+IGFwcGVuZE9yZGluYWwoZC5nZXREYXRlKCkpLFxyXG4gICAgICAgICAgICBpbmM6IChkKSA9PiBjaGFpbihkKS5pbmNEYXRlKCkuZGF0ZSxcclxuICAgICAgICAgICAgZGVjOiAoZCkgPT4gY2hhaW4oZCkuZGVjRGF0ZSgpLmRhdGUsXHJcbiAgICAgICAgICAgIHNldDogKGQsIHYpID0+IGNoYWluKGQpLnNldERhdGUodikuZGF0ZSxcclxuICAgICAgICAgICAgbWF4QnVmZmVyOiAoZCkgPT4gY2hhaW4oZCkubWF4RGF0ZUJ1ZmZlcigpXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7IC8vIERBVEVcclxuICAgICAgICAgICAgY29kZTogJ0QnLFxyXG4gICAgICAgICAgICByZWdFeHA6ICdcXFxcZHsxLDJ9JyxcclxuICAgICAgICAgICAgc3RyOiAoZCkgPT4gZC5nZXREYXRlKCkudG9TdHJpbmcoKSxcclxuICAgICAgICAgICAgaW5jOiAoZCkgPT4gY2hhaW4oZCkuaW5jRGF0ZSgpLmRhdGUsXHJcbiAgICAgICAgICAgIGRlYzogKGQpID0+IGNoYWluKGQpLmRlY0RhdGUoKS5kYXRlLFxyXG4gICAgICAgICAgICBzZXQ6IChkLCB2KSA9PiBjaGFpbihkKS5zZXREYXRlKHYpLmRhdGUsXHJcbiAgICAgICAgICAgIG1heEJ1ZmZlcjogKGQpID0+IGNoYWluKGQpLm1heERhdGVCdWZmZXIoKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeyAvLyBMT05HIERBWSBOQU1FXHJcbiAgICAgICAgICAgIGNvZGU6ICdkZGRkJyxcclxuICAgICAgICAgICAgcmVnRXhwOiBgKCgke2RheU5hbWVzLmpvaW4oJyl8KCcpfSkpYCxcclxuICAgICAgICAgICAgc3RyOiAoZCkgPT4gZGF5TmFtZXNbZC5nZXREYXkoKV0sXHJcbiAgICAgICAgICAgIGluYzogKGQpID0+IGNoYWluKGQpLmluY0RheSgpLmRhdGUsXHJcbiAgICAgICAgICAgIGRlYzogKGQpID0+IGNoYWluKGQpLmRlY0RheSgpLmRhdGUsXHJcbiAgICAgICAgICAgIHNldDogKGQsIHYpID0+IGNoYWluKGQpLnNldERheSh2KS5kYXRlLFxyXG4gICAgICAgICAgICBtYXhCdWZmZXI6IChkKSA9PiBjaGFpbihkKS5tYXhEYXlTdHJpbmdCdWZmZXIoKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeyAvLyBTSE9SVCBEQVkgTkFNRVxyXG4gICAgICAgICAgICBjb2RlOiAnZGRkJyxcclxuICAgICAgICAgICAgcmVnRXhwOiBgKCgke2RheU5hbWVzLm1hcCgodikgPT4gdi5zbGljZSgwLDMpKS5qb2luKCcpfCgnKX0pKWAsXHJcbiAgICAgICAgICAgIHN0cjogKGQpID0+IGRheU5hbWVzW2QuZ2V0RGF5KCldLnNsaWNlKDAsMyksXHJcbiAgICAgICAgICAgIGluYzogKGQpID0+IGNoYWluKGQpLmluY0RheSgpLmRhdGUsXHJcbiAgICAgICAgICAgIGRlYzogKGQpID0+IGNoYWluKGQpLmRlY0RheSgpLmRhdGUsXHJcbiAgICAgICAgICAgIHNldDogKGQsIHYpID0+IGNoYWluKGQpLnNldERheSh2KS5kYXRlLFxyXG4gICAgICAgICAgICBtYXhCdWZmZXI6IChkKSA9PiBjaGFpbihkKS5tYXhEYXlTdHJpbmdCdWZmZXIoKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeyAvLyBVTklYIFRJTUVTVEFNUFxyXG4gICAgICAgICAgICBjb2RlOiAnWCcsXHJcbiAgICAgICAgICAgIHJlZ0V4cDogJ1xcXFxkezEsfScsXHJcbiAgICAgICAgICAgIHN0cjogKGQpID0+IE1hdGguZmxvb3IoZC52YWx1ZU9mKCkgLyAxMDAwKS50b1N0cmluZygpLFxyXG4gICAgICAgICAgICBpbmM6IChkKSA9PiBuZXcgRGF0ZShkLnZhbHVlT2YoKSArIDEwMDApLFxyXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBuZXcgRGF0ZShkLnZhbHVlT2YoKSAtIDEwMDApLFxyXG4gICAgICAgICAgICBzZXQ6IChkLCB2KSA9PiBjaGFpbihkKS5zZXRVbml4U2Vjb25kVGltZXN0YW1wKHYpLmRhdGVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHsgLy8gVU5JWCBNSUxMSVNFQ09ORCBUSU1FU1RBTVBcclxuICAgICAgICAgICAgY29kZTogJ3gnLFxyXG4gICAgICAgICAgICByZWdFeHA6ICdcXFxcZHsxLH0nLFxyXG4gICAgICAgICAgICBzdHI6IChkKSA9PiBkLnZhbHVlT2YoKS50b1N0cmluZygpLFxyXG4gICAgICAgICAgICBpbmM6IChkKSA9PiBuZXcgRGF0ZShkLnZhbHVlT2YoKSArIDEpLFxyXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBuZXcgRGF0ZShkLnZhbHVlT2YoKSAtIDEpLFxyXG4gICAgICAgICAgICBzZXQ6IChkLCB2KSA9PiBjaGFpbihkKS5zZXRVbml4TWlsbGlzZWNvbmRUaW1lc3RhbXAodikuZGF0ZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeyAvLyBQQURERUQgTUlMSVRBUlkgSE9VUlNcclxuICAgICAgICAgICAgY29kZTogJ0hIJyxcclxuICAgICAgICAgICAgcmVnRXhwOiAnXFxcXGR7MiwyfScsXHJcbiAgICAgICAgICAgIHN0cjogKGQpID0+IHBhZChkLmdldEhvdXJzKCksIDIpLFxyXG4gICAgICAgICAgICBpbmM6IChkKSA9PiBjaGFpbihkKS5pbmNIb3VycygpLmRhdGUsXHJcbiAgICAgICAgICAgIGRlYzogKGQpID0+IGNoYWluKGQpLmRlY0hvdXJzKCkuZGF0ZSxcclxuICAgICAgICAgICAgc2V0OiAoZCwgdikgPT4gY2hhaW4oZCkuc2V0TWlsaXRhcnlIb3Vycyh2KS5kYXRlLFxyXG4gICAgICAgICAgICBtYXhCdWZmZXI6IChkKSA9PiBjaGFpbihkKS5tYXhNaWxpdGFyeUhvdXJzQnVmZmVyKClcclxuICAgICAgICB9LFxyXG4gICAgICAgIHsgLy8gTUlMSVRBUlkgSE9VUlNcclxuICAgICAgICAgICAgY29kZTogJ0gnLFxyXG4gICAgICAgICAgICByZWdFeHA6ICdcXFxcZHsxLDJ9JyxcclxuICAgICAgICAgICAgc3RyOiAoZCkgPT4gZC5nZXRIb3VycygpLnRvU3RyaW5nKCksXHJcbiAgICAgICAgICAgIGluYzogKGQpID0+IGNoYWluKGQpLmluY0hvdXJzKCkuZGF0ZSxcclxuICAgICAgICAgICAgZGVjOiAoZCkgPT4gY2hhaW4oZCkuZGVjSG91cnMoKS5kYXRlLFxyXG4gICAgICAgICAgICBzZXQ6IChkLCB2KSA9PiBjaGFpbihkKS5zZXRNaWxpdGFyeUhvdXJzKHYpLmRhdGUsXHJcbiAgICAgICAgICAgIG1heEJ1ZmZlcjogKGQpID0+IGNoYWluKGQpLm1heE1pbGl0YXJ5SG91cnNCdWZmZXIoKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeyAvLyBQQURERUQgSE9VUlNcclxuICAgICAgICAgICAgY29kZTogJ2hoJyxcclxuICAgICAgICAgICAgcmVnRXhwOiAnXFxcXGR7MiwyfScsXHJcbiAgICAgICAgICAgIHN0cjogKGQpID0+IHBhZCh0b1N0YW5kYXJkVGltZShkLmdldEhvdXJzKCkpLCAyKSxcclxuICAgICAgICAgICAgaW5jOiAoZCkgPT4gY2hhaW4oZCkuaW5jSG91cnMoKS5kYXRlLFxyXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBjaGFpbihkKS5kZWNIb3VycygpLmRhdGUsXHJcbiAgICAgICAgICAgIHNldDogKGQsIHYpID0+IGNoYWluKGQpLnNldEhvdXJzKHYpLmRhdGUsXHJcbiAgICAgICAgICAgIG1heEJ1ZmZlcjogKGQpID0+IGNoYWluKGQpLm1heEhvdXJzQnVmZmVyKClcclxuICAgICAgICB9LFxyXG4gICAgICAgIHsgLy8gSE9VUlNcclxuICAgICAgICAgICAgY29kZTogJ2gnLFxyXG4gICAgICAgICAgICByZWdFeHA6ICdcXFxcZHsxLDJ9JyxcclxuICAgICAgICAgICAgc3RyOiAoZCkgPT4gdG9TdGFuZGFyZFRpbWUoZC5nZXRIb3VycygpKS50b1N0cmluZygpLFxyXG4gICAgICAgICAgICBpbmM6IChkKSA9PiBjaGFpbihkKS5pbmNIb3VycygpLmRhdGUsXHJcbiAgICAgICAgICAgIGRlYzogKGQpID0+IGNoYWluKGQpLmRlY0hvdXJzKCkuZGF0ZSxcclxuICAgICAgICAgICAgc2V0OiAoZCwgdikgPT4gY2hhaW4oZCkuc2V0SG91cnModikuZGF0ZSxcclxuICAgICAgICAgICAgbWF4QnVmZmVyOiAoZCkgPT4gY2hhaW4oZCkubWF4SG91cnNCdWZmZXIoKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeyAvLyBVUFBFUkNBU0UgTUVSSURJRU1cclxuICAgICAgICAgICAgY29kZTogJ0EnLFxyXG4gICAgICAgICAgICByZWdFeHA6ICcoKEFNKXwoUE0pKScsXHJcbiAgICAgICAgICAgIHN0cjogKGQpID0+IGQuZ2V0SG91cnMoKSA8IDEyID8gJ0FNJyA6ICdQTScsXHJcbiAgICAgICAgICAgIGluYzogKGQpID0+IGNoYWluKGQpLmluY01lcmlkaWVtKCkuZGF0ZSxcclxuICAgICAgICAgICAgZGVjOiAoZCkgPT4gY2hhaW4oZCkuZGVjTWVyaWRpZW0oKS5kYXRlLFxyXG4gICAgICAgICAgICBzZXQ6IChkLCB2KSA9PiBjaGFpbihkKS5zZXRNZXJpZGllbSh2KS5kYXRlLFxyXG4gICAgICAgICAgICBtYXhCdWZmZXI6IChkKSA9PiAxXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7IC8vIFVQUEVSQ0FTRSBNRVJJRElFTVxyXG4gICAgICAgICAgICBjb2RlOiAnYScsXHJcbiAgICAgICAgICAgIHJlZ0V4cDogJygoYW0pfChwbSkpJyxcclxuICAgICAgICAgICAgc3RyOiAoZCkgPT4gZC5nZXRIb3VycygpIDwgMTIgPyAnYW0nIDogJ3BtJyxcclxuICAgICAgICAgICAgaW5jOiAoZCkgPT4gY2hhaW4oZCkuaW5jTWVyaWRpZW0oKS5kYXRlLFxyXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBjaGFpbihkKS5kZWNNZXJpZGllbSgpLmRhdGUsXHJcbiAgICAgICAgICAgIHNldDogKGQsIHYpID0+IGNoYWluKGQpLnNldE1lcmlkaWVtKHYpLmRhdGUsXHJcbiAgICAgICAgICAgIG1heEJ1ZmZlcjogKGQpID0+IDFcclxuICAgICAgICB9LFxyXG4gICAgICAgIHsgLy8gUEFEREVEIE1JTlVURVNcclxuICAgICAgICAgICAgY29kZTogJ21tJyxcclxuICAgICAgICAgICAgcmVnRXhwOiAnXFxcXGR7MiwyfScsXHJcbiAgICAgICAgICAgIHN0cjogKGQpID0+IHBhZChkLmdldE1pbnV0ZXMoKSwgMiksXHJcbiAgICAgICAgICAgIGluYzogKGQpID0+IGNoYWluKGQpLmluY01pbnV0ZXMoKS5kYXRlLFxyXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBjaGFpbihkKS5kZWNNaW51dGVzKCkuZGF0ZSxcclxuICAgICAgICAgICAgc2V0OiAoZCwgdikgPT4gY2hhaW4oZCkuc2V0TWludXRlcyh2KS5kYXRlLFxyXG4gICAgICAgICAgICBtYXhCdWZmZXI6IChkKSA9PiBjaGFpbihkKS5tYXhNaW51dGVzQnVmZmVyKClcclxuICAgICAgICB9LFxyXG4gICAgICAgIHsgLy8gTUlOVVRFU1xyXG4gICAgICAgICAgICBjb2RlOiAnbScsXHJcbiAgICAgICAgICAgIHJlZ0V4cDogJ1xcXFxkezEsMn0nLFxyXG4gICAgICAgICAgICBzdHI6IChkKSA9PiBkLmdldE1pbnV0ZXMoKS50b1N0cmluZygpLFxyXG4gICAgICAgICAgICBpbmM6IChkKSA9PiBjaGFpbihkKS5pbmNNaW51dGVzKCkuZGF0ZSxcclxuICAgICAgICAgICAgZGVjOiAoZCkgPT4gY2hhaW4oZCkuZGVjTWludXRlcygpLmRhdGUsXHJcbiAgICAgICAgICAgIHNldDogKGQsIHYpID0+IGNoYWluKGQpLnNldE1pbnV0ZXModikuZGF0ZSxcclxuICAgICAgICAgICAgbWF4QnVmZmVyOiAoZCkgPT4gY2hhaW4oZCkubWF4TWludXRlc0J1ZmZlcigpXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7IC8vIFBBRERFRCBTRUNPTkRTXHJcbiAgICAgICAgICAgIGNvZGU6ICdzcycsXHJcbiAgICAgICAgICAgIHJlZ0V4cDogJ1xcXFxkezIsMn0nLFxyXG4gICAgICAgICAgICBzdHI6IChkKSA9PiBwYWQoZC5nZXRTZWNvbmRzKCksIDIpLFxyXG4gICAgICAgICAgICBpbmM6IChkKSA9PiBjaGFpbihkKS5pbmNTZWNvbmRzKCkuZGF0ZSxcclxuICAgICAgICAgICAgZGVjOiAoZCkgPT4gY2hhaW4oZCkuZGVjU2Vjb25kcygpLmRhdGUsXHJcbiAgICAgICAgICAgIHNldDogKGQsIHYpID0+IGNoYWluKGQpLnNldFNlY29uZHModikuZGF0ZSxcclxuICAgICAgICAgICAgbWF4QnVmZmVyOiAoZCkgPT4gY2hhaW4oZCkubWF4U2Vjb25kc0J1ZmZlcigpXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7IC8vIFNFQ09ORFNcclxuICAgICAgICAgICAgY29kZTogJ3MnLFxyXG4gICAgICAgICAgICByZWdFeHA6ICdcXFxcZHsxLDJ9JyxcclxuICAgICAgICAgICAgc3RyOiAoZCkgPT4gZC5nZXRTZWNvbmRzKCkudG9TdHJpbmcoKSxcclxuICAgICAgICAgICAgaW5jOiAoZCkgPT4gY2hhaW4oZCkuaW5jU2Vjb25kcygpLmRhdGUsXHJcbiAgICAgICAgICAgIGRlYzogKGQpID0+IGNoYWluKGQpLmRlY1NlY29uZHMoKS5kYXRlLFxyXG4gICAgICAgICAgICBzZXQ6IChkLCB2KSA9PiBjaGFpbihkKS5zZXRTZWNvbmRzKHYpLmRhdGUsXHJcbiAgICAgICAgICAgIG1heEJ1ZmZlcjogKGQpID0+IGNoYWluKGQpLm1heFNlY29uZHNCdWZmZXIoKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeyAvLyBVVEMgT0ZGU0VUIFdJVEggQ09MT05cclxuICAgICAgICAgICAgY29kZTogJ1paJyxcclxuICAgICAgICAgICAgcmVnRXhwOiAnKFxcXFwrfFxcXFwtKVxcXFxkezIsMn06XFxcXGR7MiwyfScsXHJcbiAgICAgICAgICAgIHN0cjogKGQpID0+IGdldFVUQ09mZnNldChkLCB0cnVlKSAvL1RPRE8gYWRkIGFiaWxpdHkgdG8gaW5jIGFuZCBkZWMgdGhpc1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeyAvLyBVVEMgT0ZGU0VUXHJcbiAgICAgICAgICAgIGNvZGU6ICdaJyxcclxuICAgICAgICAgICAgcmVnRXhwOiAnKFxcXFwrfFxcXFwtKVxcXFxkezQsNH0nLFxyXG4gICAgICAgICAgICBzdHI6IChkKSA9PiBnZXRVVENPZmZzZXQoZCwgZmFsc2UpXHJcbiAgICAgICAgfVxyXG4gICAgXTtcclxufSkoKTtcclxuXHJcblxyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
