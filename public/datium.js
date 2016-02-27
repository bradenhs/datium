(function(){
var formatBlocks = (function () {
    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    function setSeconds(d, seconds) {
        var num;
        if (seconds === "ZERO_OUT") {
            d.setSeconds(0);
            return d;
        }
        else if (typeof seconds === "string" && /^\d+$/.test(seconds)) {
            num = parseInt(seconds, 10);
        }
        else if (typeof seconds === "number") {
            num = seconds;
        }
        else {
            d = void 0;
            return d;
        }
        if (num < 0 || num > 59) {
            d = void 0;
            return d;
        }
        d.setSeconds(num);
        return d;
    }
    function incSeconds(d) {
        var n = d.getSeconds() + 1;
        return setSeconds(d, n > 59 ? 0 : n);
    }
    function decSeconds(d) {
        var n = d.getSeconds() - 1;
        return setSeconds(d, n < 0 ? 59 : n);
    }
    function setMinutes(d, minutes) {
        var num;
        if (minutes === "ZERO_OUT") {
            d.setMinutes(0);
            return d;
        }
        else if (typeof minutes === "string" && /^\d+$/.test(minutes)) {
            num = parseInt(minutes, 10);
        }
        else if (typeof minutes === "number") {
            num = minutes;
        }
        else {
            d = void 0;
            return d;
        }
        if (num < 0 || num > 59) {
            d = void 0;
            return d;
        }
        d.setMinutes(num);
        return d;
    }
    function incMinutes(d) {
        var n = d.getMinutes() + 1;
        return setMinutes(d, n > 59 ? 0 : n);
    }
    function decMinutes(d) {
        var n = d.getMinutes() - 1;
        return setMinutes(d, n < 0 ? 59 : n);
    }
    function setHours(d, hours) {
        var num;
        var meridiem = d.getHours() > 11 ? "PM" : "AM";
        if (hours === "ZERO_OUT") {
            d.setHours(meridiem === "AM" ? 0 : 12);
            return d;
        }
        else if (typeof hours === "string" && /^\d+$/.test(hours)) {
            num = parseInt(hours, 10);
        }
        else if (typeof hours === "number") {
            num = hours;
        }
        else {
            d = void 0;
            return d;
        }
        if (num === 0)
            num = 1;
        if (num < 1 || num > 12) {
            d = void 0;
            return d;
        }
        if (num === 12 && meridiem === "AM") {
            num = 0;
        }
        if (num !== 12 && meridiem === "PM") {
            num += 12;
        }
        d.setHours(num);
        return d;
    }
    function incHours(d) {
        var n = d.getHours() + 1;
        return setMilitaryHours(d, n > 23 ? 0 : n);
    }
    function decHours(d) {
        var n = d.getHours() - 1;
        return setMilitaryHours(d, n < 0 ? 23 : n);
    }
    function setMilitaryHours(d, hours) {
        var num;
        if (hours === "ZERO_OUT") {
            d.setHours(0);
            return d;
        }
        else if (typeof hours === "string" && /^\d+$/.test(hours)) {
            num = parseInt(hours, 10);
        }
        else if (typeof hours === "number") {
            num = hours;
        }
        else {
            d = void 0;
            return d;
        }
        if (num < 0 || num > 23) {
            d = void 0;
            return d;
        }
        if (d.getHours() === num + 1) {
            d.setHours(num);
            if (d.getHours() !== num) {
                d.setHours(num - 1);
            }
        }
        else {
            d.setHours(num);
        }
        return d;
    }
    function setDate(d, date) {
        var num;
        if (date === "ZERO_OUT") {
            d.setDate(1);
            return d;
        }
        else if (typeof date === "string" && /\d{1,2}.*$/.test(date)) {
            num = parseInt(date, 10);
        }
        else if (typeof date === "number") {
            num = date;
        }
        else {
            d = void 0;
            return d;
        }
        if (num === 0)
            num = 1;
        if (num < 1 || num > daysInMonth(d)) {
            d = void 0;
            return d;
        }
        d.setDate(num);
        return d;
    }
    function incDate(d) {
        var n = d.getDate() + 1;
        return setDate(d, n > daysInMonth(d) ? 1 : n);
    }
    function decDate(d) {
        var n = d.getDate() - 1;
        return setDate(d, n < 1 ? daysInMonth(d) : n);
    }
    function setDay(d, day) {
        var num;
        if (day === "ZERO_OUT") {
            return setDay(d, 0);
        }
        else if (typeof day === "number") {
            num = day;
        }
        else if (typeof day === "string" && dayNames.some(function (dayName) {
            if (new RegExp("^" + day + ".*$", "i").test(dayName)) {
                num = dayNames.indexOf(dayName);
                return true;
            }
        })) {
        }
        else {
            d = void 0;
            return d;
        }
        if (num < 0 || num > 6) {
            d = void 0;
            return d;
        }
        var offset = d.getDay() - num;
        d.setDate(d.getDate() - offset);
        return d;
    }
    function incDay(d) {
        var n = d.getDay() + 1;
        return setDay(d, n > 6 ? 0 : n);
    }
    function decDay(d) {
        var n = d.getDay() - 1;
        return setDay(d, n < 0 ? 6 : n);
    }
    function setMonth(d, month) {
        var num;
        if (month === "ZERO_OUT") {
            d.setMonth(0);
            return d;
        }
        else if (typeof month === "string" && /^\d+$/.test(month)) {
            num = parseInt(month, 10);
        }
        else if (typeof month === "number") {
            num = month;
        }
        else {
            d = void 0;
            return d;
        }
        if (num === 0)
            num = 1;
        if (num < 1 || num > 12) {
            d = void 0;
            return d;
        }
        d.setMonth(num - 1);
        return d;
    }
    function incMonth(d) {
        var n = d.getMonth() + 2;
        return setMonth(d, n > 12 ? 1 : n);
    }
    function decMonth(d) {
        var n = d.getMonth();
        return setMonth(d, n < 1 ? 12 : n);
    }
    function setMonthString(d, month) {
        var num;
        if (month === "ZERO_OUT") {
            d.setMonth(0);
            return d;
        }
        else if (typeof month === "string" && monthNames.some(function (monthName) {
            if (new RegExp("^" + month + ".*$", "i").test(monthName)) {
                num = monthNames.indexOf(monthName) + 1;
                return true;
            }
        })) {
        }
        else {
            d = void 0;
            return d;
        }
        if (num < 1 || num > 12) {
            d = void 0;
            return d;
        }
        d.setMonth(num - 1);
        return d;
    }
    function setYear(d, year) {
        var num;
        if (year === "ZERO_OUT") {
            d.setFullYear(0);
            return d;
        }
        else if (typeof year === "string" && /^\d+$/.test(year)) {
            num = parseInt(year, 10);
        }
        else if (typeof year === "number") {
            num = year;
        }
        else {
            d = void 0;
            return d;
        }
        d.setFullYear(num);
        return d;
    }
    function setTwoDigitYear(d, year) {
        var base = Math.floor(d.getFullYear() / 100) * 100;
        var num;
        if (year === "ZERO_OUT") {
            d.setFullYear(base);
            return d;
        }
        else if (typeof year === "string" && /^\d+$/.test(year)) {
            num = parseInt(year, 10);
        }
        else if (typeof year === "number") {
            num = year;
        }
        else {
            d = void 0;
            return d;
        }
        d.setFullYear(base + num);
        return d;
    }
    function setUnixSecondTimestamp(d, seconds) {
        var num;
        if (seconds === "ZERO_OUT") {
            d = new Date(0);
            return d;
        }
        else if (typeof seconds === "string" && /^\d+$/.test(seconds)) {
            num = parseInt(seconds, 10);
        }
        else if (typeof seconds === "number") {
            num = seconds;
        }
        else {
            d = void 0;
            return d;
        }
        d = new Date(num * 1000);
        return d;
    }
    function setUnixMillisecondTimestamp(d, milliseconds) {
        var num;
        if (milliseconds === "ZERO_OUT") {
            d = new Date(0);
            return d;
        }
        else if (typeof milliseconds === "string" && /^\d+$/.test(milliseconds)) {
            num = parseInt(milliseconds, 10);
        }
        else if (typeof milliseconds === "number") {
            num = milliseconds;
        }
        else {
            d = void 0;
            return d;
        }
        d = new Date(num);
        return d;
    }
    function setMeridiem(d, meridiem) {
        var hours = d.getHours();
        if (meridiem === "ZERO_OUT")
            return d;
        if (typeof meridiem === "string" && /^am?$/i.test(meridiem)) {
            hours -= 12;
        }
        else if (typeof meridiem === "string" && /^pm?$/i.test(meridiem)) {
            hours += 12;
        }
        else {
            d = void 0;
            return d;
        }
        if (hours < 0 || hours > 23) {
            return d;
        }
        return setMilitaryHours(d, hours);
    }
    function incMeridiem(d) {
        var n = d.getHours() + 12;
        return setMilitaryHours(d, n > 23 ? n - 24 : n);
    }
    function decMeridiem(d) {
        var n = d.getHours() - 12;
        return setMilitaryHours(d, n < 0 ? n + 24 : n);
    }
    function daysInMonth(d) {
        return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    }
    function maxMonthStringBuffer(d) {
        var m = d.getMonth();
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
    }
    function maxMonthBuffer(d) {
        return d.getMonth() > 0 ? 1 : 2;
    }
    function maxDateBuffer(d) {
        return d.getDate() * 10 > daysInMonth(d) ? 1 : 2;
    }
    function maxDayStringBuffer(d) {
        return d.getDay() % 2 == 0 ? 2 : 1;
    }
    function maxMilitaryHoursBuffer(d) {
        return d.getHours() > 2 ? 1 : 2;
    }
    function maxHoursBuffer(d) {
        if (d.getHours() > 11) {
            return d.getHours() > 13 ? 1 : 2;
        }
        else {
            return d.getHours() > 1 ? 1 : 2;
        }
    }
    function maxMinutesBuffer(d) {
        return d.getMinutes() > 5 ? 1 : 2;
    }
    function maxSecondsBuffer(d) {
        return d.getSeconds() > 5 ? 1 : 2;
    }
    function getUTCOffset(date, showColon) {
        var tzo = -date.getTimezoneOffset();
        var dif = tzo >= 0 ? "+" : "-";
        var colon = showColon ? ":" : "";
        return dif + pad(tzo / 60, 2) + colon + pad(tzo % 60, 2);
    }
    function pad(num, length) {
        var padded = Math.abs(num).toString();
        while (padded.length < length)
            padded = "0" + padded;
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
            code: "YYYY",
            regExp: "\\d{4,4}",
            str: function (d) { return d.getFullYear().toString(); },
            inc: function (d) { return setYear(d, d.getFullYear() + 1); },
            dec: function (d) { return setYear(d, d.getFullYear() - 1); },
            set: function (d, v) { return setYear(d, v); },
            maxBuffer: function (d) { return 4; }
        },
        {
            code: "YY",
            regExp: "\\d{2,2}",
            str: function (d) { return d.getFullYear().toString().slice(-2); },
            inc: function (d) { return setYear(d, d.getFullYear() + 1); },
            dec: function (d) { return setYear(d, d.getFullYear() - 1); },
            set: function (d, v) { return setTwoDigitYear(d, v); },
            maxBuffer: function (d) { return 2; }
        },
        {
            code: "MMMM",
            regExp: "((" + monthNames.join(")|(") + "))",
            str: function (d) { return monthNames[d.getMonth()]; },
            inc: function (d) { return incMonth(d); },
            dec: function (d) { return decMonth(d); },
            set: function (d, v) { return setMonthString(d, v); },
            maxBuffer: function (d) { return maxMonthStringBuffer(d); }
        },
        {
            code: "MMM",
            regExp: "((" + monthNames.map(function (v) { return v.slice(0, 3); }).join(")|(") + "))",
            str: function (d) { return monthNames[d.getMonth()].slice(0, 3); },
            inc: function (d) { return incMonth(d); },
            dec: function (d) { return decMonth(d); },
            set: function (d, v) { return setMonthString(d, v); },
            maxBuffer: function (d) { return maxMonthStringBuffer(d); }
        },
        {
            code: "MM",
            regExp: "\\d{2,2}",
            str: function (d) { return pad(d.getMonth() + 1, 2); },
            inc: function (d) { return incMonth(d); },
            dec: function (d) { return decMonth(d); },
            set: function (d, v) { return setMonth(d, v); },
            maxBuffer: function (d) { return maxMonthBuffer(d); }
        },
        {
            code: "M",
            regExp: "\\d{1,2}",
            str: function (d) { return (d.getMonth() + 1).toString(); },
            inc: function (d) { return incMonth(d); },
            dec: function (d) { return decMonth(d); },
            set: function (d, v) { return setMonth(d, v); },
            maxBuffer: function (d) { return maxMonthBuffer(d); }
        },
        {
            code: "DD",
            regExp: "\\d{2,2}",
            str: function (d) { return pad(d.getDate(), 2); },
            inc: function (d) { return incDate(d); },
            dec: function (d) { return decDate(d); },
            set: function (d, v) { return setDate(d, v); },
            maxBuffer: function (d) { return maxDateBuffer(d); }
        },
        {
            code: "Do",
            regExp: "\\d{1,2}((th)|(nd)|(rd)|(st))",
            str: function (d) { return appendOrdinal(d.getDate()); },
            inc: function (d) { return incDate(d); },
            dec: function (d) { return decDate(d); },
            set: function (d, v) { return setDate(d, v); },
            maxBuffer: function (d) { return maxDateBuffer(d); }
        },
        {
            code: "D",
            regExp: "\\d{1,2}",
            str: function (d) { return d.getDate().toString(); },
            inc: function (d) { return incDate(d); },
            dec: function (d) { return decDate(d); },
            set: function (d, v) { return setDate(d, v); },
            maxBuffer: function (d) { return maxDateBuffer(d); }
        },
        {
            code: "dddd",
            regExp: "((" + dayNames.join(")|(") + "))",
            str: function (d) { return dayNames[d.getDay()]; },
            inc: function (d) { return incDay(d); },
            dec: function (d) { return decDay(d); },
            set: function (d, v) { return setDay(d, v); },
            maxBuffer: function (d) { return maxDayStringBuffer(d); }
        },
        {
            code: "ddd",
            regExp: "((" + dayNames.map(function (v) { return v.slice(0, 3); }).join(")|(") + "))",
            str: function (d) { return dayNames[d.getDay()].slice(0, 3); },
            inc: function (d) { return incDay(d); },
            dec: function (d) { return decDay(d); },
            set: function (d, v) { return setDay(d, v); },
            maxBuffer: function (d) { return maxDayStringBuffer(d); }
        },
        {
            code: "X",
            regExp: "\\d{1,}",
            str: function (d) { return Math.floor(d.valueOf() / 1000).toString(); },
            inc: function (d) { return new Date(d.valueOf() + 1000); },
            dec: function (d) { return new Date(d.valueOf() - 1000); },
            set: function (d, v) { return setUnixSecondTimestamp(d, v); }
        },
        {
            code: "x",
            regExp: "\\d{1,}",
            str: function (d) { return d.valueOf().toString(); },
            inc: function (d) { return new Date(d.valueOf() + 1); },
            dec: function (d) { return new Date(d.valueOf() - 1); },
            set: function (d, v) { return setUnixMillisecondTimestamp(d, v); }
        },
        {
            code: "HH",
            regExp: "\\d{2,2}",
            str: function (d) { return pad(d.getHours(), 2); },
            inc: function (d) { return incHours(d); },
            dec: function (d) { return decHours(d); },
            set: function (d, v) { return setMilitaryHours(d, v); },
            maxBuffer: function (d) { return maxMilitaryHoursBuffer(d); }
        },
        {
            code: "H",
            regExp: "\\d{1,2}",
            str: function (d) { return d.getHours().toString(); },
            inc: function (d) { return incHours(d); },
            dec: function (d) { return decHours(d); },
            set: function (d, v) { return setMilitaryHours(d, v); },
            maxBuffer: function (d) { return maxMilitaryHoursBuffer(d); }
        },
        {
            code: "hh",
            regExp: "\\d{2,2}",
            str: function (d) { return pad(toStandardTime(d.getHours()), 2); },
            inc: function (d) { return incHours(d); },
            dec: function (d) { return decHours(d); },
            set: function (d, v) { return setHours(d, v); },
            maxBuffer: function (d) { return maxHoursBuffer(d); }
        },
        {
            code: "h",
            regExp: "\\d{1,2}",
            str: function (d) { return toStandardTime(d.getHours()).toString(); },
            inc: function (d) { return incHours(d); },
            dec: function (d) { return decHours(d); },
            set: function (d, v) { return setHours(d, v); },
            maxBuffer: function (d) { return maxHoursBuffer(d); }
        },
        {
            code: "A",
            regExp: "((AM)|(PM))",
            str: function (d) { return d.getHours() < 12 ? "AM" : "PM"; },
            inc: function (d) { return incMeridiem(d); },
            dec: function (d) { return decMeridiem(d); },
            set: function (d, v) { return setMeridiem(d, v); },
            maxBuffer: function (d) { return 1; }
        },
        {
            code: "a",
            regExp: "((am)|(pm))",
            str: function (d) { return d.getHours() < 12 ? "am" : "pm"; },
            inc: function (d) { return incMeridiem(d); },
            dec: function (d) { return decMeridiem(d); },
            set: function (d, v) { return setMeridiem(d, v); },
            maxBuffer: function (d) { return 1; }
        },
        {
            code: "mm",
            regExp: "\\d{2,2}",
            str: function (d) { return pad(d.getMinutes(), 2); },
            inc: function (d) { return incMinutes(d); },
            dec: function (d) { return decMinutes(d); },
            set: function (d, v) { return setMinutes(d, v); },
            maxBuffer: function (d) { return maxMinutesBuffer(d); }
        },
        {
            code: "m",
            regExp: "\\d{1,2}",
            str: function (d) { return d.getMinutes().toString(); },
            inc: function (d) { return incMinutes(d); },
            dec: function (d) { return decMinutes(d); },
            set: function (d, v) { return setMinutes(d, v); },
            maxBuffer: function (d) { return maxMinutesBuffer(d); }
        },
        {
            code: "ss",
            regExp: "\\d{2,2}",
            str: function (d) { return pad(d.getSeconds(), 2); },
            inc: function (d) { return incSeconds(d); },
            dec: function (d) { return decSeconds(d); },
            set: function (d, v) { return setSeconds(d, v); },
            maxBuffer: function (d) { return maxSecondsBuffer(d); }
        },
        {
            code: "s",
            regExp: "\\d{1,2}",
            str: function (d) { return d.getSeconds().toString(); },
            inc: function (d) { return incSeconds(d); },
            dec: function (d) { return decSeconds(d); },
            set: function (d, v) { return setSeconds(d, v); },
            maxBuffer: function (d) { return maxSecondsBuffer(d); }
        },
        {
            code: "ZZ",
            regExp: "(\\+|\\-)\\d{2,2}:\\d{2,2}",
            str: function (d) { return getUTCOffset(d, true); } //TODO add ability to inc and dec this
        },
        {
            code: "Z",
            regExp: "(\\+|\\-)\\d{4,4}",
            str: function (d) { return getUTCOffset(d, false); }
        }
    ];
})();
/// <reference path="FormatBlocks.ts" />
var DatePart = (function () {
    function DatePart(arg, selectableOverride) {
        var _this = this;
        this.regExpEscape = function (str) {
            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        };
        this.clone = function (d) {
            return new Date(d.valueOf());
        };
        this.increment = function (d) {
            return _this.inc(_this.clone(d));
        };
        this.decrement = function (d) {
            return _this.dec(_this.clone(d));
        };
        this.setValue = function (d) {
            if (_this.str === void 0)
                return _this;
            _this.value = _this.str(_this.clone(d));
            return _this;
        };
        this.toString = function () {
            return _this.value;
        };
        this.isSelectable = function () {
            return _this.selectable;
        };
        this.getRegExpString = function () {
            return _this.regExpString;
        };
        this.getDateFromString = function (date, partial) {
            return _this.set(_this.clone(date), partial);
        };
        this.getMaxBufferSize = function (date) {
            if (_this.maxBuffer === void 0)
                return void 0;
            return _this.maxBuffer(_this.clone(date));
        };
        if (typeof arg === "object") {
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
        if (typeof selectableOverride === "boolean") {
            this.selectable = selectableOverride;
        }
    }
    return DatePart;
})();
/// <reference path="FormatBlocks.ts" />
/// <reference path="DatePart.ts" />
var DisplayParser = (function () {
    function DisplayParser() {
    }
    DisplayParser.parse = function (format) {
        var index = 0;
        var inEscapedSegment = false;
        var dateParts = [];
        var textBuffer = "";
        var pushPlainText = function () {
            if (textBuffer.length > 0) {
                var dp = new DatePart(textBuffer, void 0);
                dateParts.push(dp);
                textBuffer = "";
            }
        };
        var increment;
        while (index < format.length) {
            if (!inEscapedSegment && format[index] === "[") {
                inEscapedSegment = true;
                index++;
                continue;
            }
            else if (inEscapedSegment && format[index] === "]") {
                inEscapedSegment = false;
                index++;
                continue;
            }
            else if (inEscapedSegment) {
                textBuffer += format[index];
                index++;
                continue;
            }
            else {
                var found = formatBlocks.some(function (block) {
                    if (DisplayParser.findAt(format, index, "{" + block.code + "}")) {
                        pushPlainText();
                        var dp = new DatePart(block, false);
                        dateParts.push(dp);
                        increment = block.code.length + 2;
                        return true;
                    }
                    else if (DisplayParser.findAt(format, index, block.code)) {
                        pushPlainText();
                        var dp = new DatePart(block, void 0);
                        dateParts.push(dp);
                        increment = block.code.length;
                        return true;
                    }
                });
                if (found) {
                    index += increment;
                }
                else {
                    textBuffer += format[index];
                    index++;
                }
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
var MouseEvents = (function () {
    function MouseEvents(input) {
        var _this = this;
        this.input = input;
        this.mousedown = function () {
            // Mouse event triggered - get rid of touch handler
            clearInterval(_this.interval);
            _this.down = true;
            _this.input.element.setSelectionRange(void 0, void 0);
            setTimeout(function () {
                _this.caretStart = _this.input.element.selectionStart;
            });
        };
        this.mouseup = function () {
            if (!_this.down)
                return;
            _this.down = false;
            var pos = _this.input.element.selectionStart === _this.caretStart ? _this.input.element.selectionEnd : _this.input.element.selectionStart;
            _this.input.selectedIndex = _this.input.getNearestSelectableIndex(pos);
            if (_this.input.element.selectionStart > 0 || _this.input.element.selectionEnd < _this.input.element.value.length) {
                _this.input.update();
            }
        };
        this.touchstart = function () {
            _this.input.element.removeEventListener("mousedown", _this.mousedown);
            document.removeEventListener("mouseup", _this.mouseup);
            document.removeEventListener("touchstart", _this.touchstart);
        };
        this.handleSelectionOnTouch = function () {
            if (!_this.input.pasting &&
                (_this.input.element.selectionStart !== 0 ||
                    _this.input.element.selectionEnd !== _this.input.element.value.length) &&
                (_this.input.element.selectionStart !== _this.lastStart ||
                    _this.input.element.selectionEnd !== _this.lastEnd)) {
                var pos = _this.input.element.selectionStart + (_this.input.element.selectionEnd - _this.input.element.selectionStart) / 2;
                _this.input.selectedIndex = _this.input.getNearestSelectableIndex(pos);
                _this.input.update();
            }
            _this.lastStart = _this.input.element.selectionStart;
            _this.lastEnd = _this.input.element.selectionEnd;
        };
        input.element.addEventListener("mousedown", this.mousedown);
        document.addEventListener("mouseup", this.mouseup);
        document.addEventListener("touchstart", this.touchstart);
        // Stop default
        input.element.addEventListener("dragenter", function (e) { return e.preventDefault(); });
        input.element.addEventListener("dragover", function (e) { return e.preventDefault(); });
        input.element.addEventListener("drop", function (e) { return e.preventDefault(); });
        input.element.addEventListener("cut", function (e) { return e.preventDefault(); });
        // Touch devices need this handled in a different way
        this.interval = setInterval(this.handleSelectionOnTouch);
    }
    return MouseEvents;
})();
/// <reference path="FormatBlocks.ts" />
/// <reference path="DatePart.ts" />
/// <reference path="DisplayParser.ts" />
/// <reference path="MouseEvents.ts" />
window["Datium"] = (function () {
    function Datium(opts) {
        new DatepickerInput(opts['element'], opts['displayAs']);
    }
    return Datium;
})();
var DatepickerInput = (function () {
    function DatepickerInput(element, displayAs, minDate, maxDate) {
        var _this = this;
        this.element = element;
        this.displayAs = displayAs;
        this.minDate = minDate;
        this.maxDate = maxDate;
        this.selecting = false;
        this.shiftTabDown = false;
        this.tabDown = false;
        this.pasting = false;
        this.textBuffer = "";
        this.concatRegExp = function (dateParts) {
            var regExp = "";
            dateParts.forEach(function (datePart) {
                regExp += datePart.getRegExpString();
            });
            return new RegExp("^" + regExp + "$", "i");
        };
        this.bindEvents = function () {
            _this.element.addEventListener("focus", function () { return _this.focus(); });
            _this.element.addEventListener("keydown", function (e) { return _this.keydown(e); });
            _this.element.addEventListener("paste", function () { return _this.paste(); });
            document.addEventListener("keydown", function (e) {
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
            new MouseEvents(_this);
        };
        this.paste = function () {
            _this.pasting = true;
            var originalValue = _this.element.value;
            setTimeout(function () {
                if (!_this.dateStringRegExp.test(_this.element.value)) {
                    _this.element.value = originalValue;
                    _this.pasting = false;
                    return;
                }
                var newDate = new Date(_this.curDate.valueOf());
                var strPrefix = "";
                _this.dateParts.forEach(function (datePart) {
                    var val = _this.element.value.replace(strPrefix, "").match(datePart.getRegExpString())[0];
                    strPrefix += val;
                    if (!datePart.isSelectable())
                        return;
                    newDate = datePart.getDateFromString(newDate, val);
                });
                _this.update(newDate);
                _this.pasting = false;
            });
        };
        this.keydown = function (e) {
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
                _this.selectedIndex = _this.getFirstSelectable();
                _this.update();
                e.preventDefault();
            }
            else if (e.keyCode === 35 /* END */) {
                _this.selectedIndex = _this.getLastSelectable();
                _this.update();
                e.preventDefault();
            }
            else if (e.keyCode === 37 /* LEFT */) {
                _this.selectedIndex = _this.getPreviousSelectable();
                _this.update();
                e.preventDefault();
            }
            else if (e.shiftKey && e.keyCode === 9 /* TAB */) {
                var previousSelectable = _this.getPreviousSelectable();
                if (previousSelectable !== _this.selectedIndex) {
                    _this.selectedIndex = previousSelectable;
                    _this.update();
                    e.preventDefault();
                }
            }
            else if (e.keyCode === 39 /* RIGHT */) {
                _this.selectedIndex = _this.getNextSelectable();
                _this.update();
                e.preventDefault();
            }
            else if (e.keyCode === 9 /* TAB */) {
                var nextSelectable = _this.getNextSelectable();
                if (nextSelectable !== _this.selectedIndex) {
                    _this.selectedIndex = nextSelectable;
                    _this.update();
                    e.preventDefault();
                }
            }
            else if (e.keyCode === 38 /* UP */) {
                var newDate = _this.dateParts[_this.selectedIndex].increment(_this.curDate);
                _this.update(newDate);
                e.preventDefault();
            }
            else if (e.keyCode === 40 /* DOWN */) {
                var newDate = _this.dateParts[_this.selectedIndex].decrement(_this.curDate);
                _this.update(newDate);
                e.preventDefault();
            }
            else {
                e.preventDefault();
            }
            var keyPressed = {
                "48": "0", "96": "0", "49": "1", "97": "1",
                "50": "2", "98": "2", "51": "3", "99": "3",
                "52": "4", "100": "4", "53": "5", "101": "5",
                "54": "6", "102": "6", "55": "7", "103": "7",
                "56": "8", "104": "8", "57": "9", "105": "9",
                "65": "a", "66": "b", "67": "c", "68": "d",
                "69": "e", "70": "f", "71": "g", "72": "h",
                "73": "i", "74": "j", "75": "k", "76": "l",
                "77": "m", "78": "n", "79": "o", "80": "p",
                "81": "q", "82": "r", "83": "s", "84": "t",
                "85": "u", "86": "v", "87": "w", "88": "x",
                "89": "y", "90": "z"
            }[e.keyCode];
            if (e.keyCode === 8 /* BACKSPACE */) {
                _this.backspace();
            }
            else if (keyPressed !== void 0) {
                _this.textBuffer += keyPressed;
            }
            else if (!e.shiftKey) {
                _this.textBuffer = "";
            }
            if (_this.textBuffer.length > 0) {
                var orig = _this.curDate.valueOf();
                var result = _this.dateParts[_this.selectedIndex].getDateFromString(_this.curDate, _this.textBuffer);
                if (result !== void 0 && _this.dateParts[_this.selectedIndex].getMaxBufferSize(result) !== void 0 && _this.textBuffer.length >= _this.dateParts[_this.selectedIndex].getMaxBufferSize(result)) {
                    var next = _this.getNextSelectable();
                    if (next === _this.selectedIndex)
                        _this.textBuffer = '';
                    _this.selectedIndex = next;
                }
                if (result === void 0) {
                    _this.textBuffer = _this.textBuffer.slice(0, _this.textBuffer.length - 1);
                }
                else {
                    _this.update(result);
                }
            }
        };
        this.backspace = function () {
            if (_this.textBuffer.length < 2) {
                var orig = _this.curDate.valueOf();
                var result = _this.dateParts[_this.selectedIndex].getDateFromString(_this.curDate, "ZERO_OUT");
                if (result.valueOf() !== orig) {
                    _this.update(result);
                }
            }
            _this.textBuffer = _this.textBuffer.slice(0, _this.textBuffer.length - 1);
        };
        this.getPreviousSelectable = function () {
            var index = _this.selectedIndex;
            while (--index >= 0) {
                if (_this.dateParts[index].isSelectable())
                    return index;
            }
            return _this.selectedIndex;
        };
        this.getNextSelectable = function () {
            var index = _this.selectedIndex;
            while (++index < _this.dateParts.length) {
                if (_this.dateParts[index].isSelectable())
                    return index;
            }
            return _this.selectedIndex;
        };
        this.getNearestSelectableIndex = function (caretPosition) {
            var pos = 0;
            var nearestSelectableIndex;
            var nearestSelectableDistance;
            for (var i = 0; i < _this.dateParts.length; i++) {
                if (_this.dateParts[i].isSelectable()) {
                    var fromLeft = caretPosition - pos;
                    var fromRight = caretPosition - (pos + _this.dateParts[i].toString().length);
                    if (fromLeft > 0 && fromRight < 0)
                        return i;
                    var dist = Math.min(Math.abs(fromLeft), Math.abs(fromRight));
                    if (nearestSelectableIndex == void 0 || dist <= nearestSelectableDistance) {
                        nearestSelectableIndex = i;
                        nearestSelectableDistance = dist;
                    }
                }
                pos += _this.dateParts[i].toString().length;
            }
            return nearestSelectableIndex;
        };
        this.focus = function () {
            if (_this.tabDown) {
                _this.selectedIndex = _this.getFirstSelectable();
                setTimeout(function () {
                    _this.update();
                });
            }
            else if (_this.shiftTabDown) {
                _this.selectedIndex = _this.getLastSelectable();
                setTimeout(function () {
                    _this.update();
                });
            }
        };
        this.getFirstSelectable = function () {
            for (var i = 0; i < _this.dateParts.length; i++) {
                if (_this.dateParts[i].isSelectable())
                    return i;
            }
            return void 0;
        };
        this.getLastSelectable = function () {
            for (var i = _this.dateParts.length - 1; i >= 0; i--) {
                if (_this.dateParts[i].isSelectable())
                    return i;
            }
            return void 0;
        };
        /**
         * @param {Date=} date (optional).
         */
        this.update = function (date) {
            if (date === void 0)
                date = _this.curDate;
            if (_this.minDate !== void 0 && date.valueOf() < _this.minDate.valueOf())
                date = new Date(_this.minDate.valueOf());
            if (_this.maxDate !== void 0 && date.valueOf() < _this.maxDate.valueOf())
                date = new Date(_this.maxDate.valueOf());
            if (_this.selectedIndex !== _this.lastSelectedIndex) {
                _this.textBuffer = "";
            }
            _this.lastSelectedIndex = _this.selectedIndex;
            _this.curDate = new Date(date.valueOf());
            var dateString = "";
            _this.dateParts.forEach(function (datePart) {
                dateString += datePart.setValue(date).toString();
            });
            _this.element.value = dateString;
            _this.updateSelection();
        };
        this.updateSelection = function () {
            if (_this.selectedIndex === void 0 || document.activeElement !== _this.element)
                return;
            var start = 0;
            for (var i = 0; i < _this.selectedIndex; i++) {
                start += _this.dateParts[i].toString().length;
            }
            var end = start + _this.dateParts[_this.selectedIndex].toString().length;
            _this.element.setSelectionRange(start, end);
        };
        this.dateParts = DisplayParser.parse(displayAs);
        this.dateStringRegExp = this.concatRegExp(this.dateParts);
        this.bindEvents();
        element.setAttribute("spellcheck", "false");
        this.update(new Date());
    }
    return DatepickerInput;
})();
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZvcm1hdEJsb2Nrcy50cyIsIkRhdGVQYXJ0LnRzIiwiRGlzcGxheVBhcnNlci50cyIsIk1vdXNlRXZlbnRzLnRzIiwiRGF0aXVtLnRzIl0sIm5hbWVzIjpbInNldFNlY29uZHMiLCJpbmNTZWNvbmRzIiwiZGVjU2Vjb25kcyIsInNldE1pbnV0ZXMiLCJpbmNNaW51dGVzIiwiZGVjTWludXRlcyIsInNldEhvdXJzIiwiaW5jSG91cnMiLCJkZWNIb3VycyIsInNldE1pbGl0YXJ5SG91cnMiLCJzZXREYXRlIiwiaW5jRGF0ZSIsImRlY0RhdGUiLCJzZXREYXkiLCJpbmNEYXkiLCJkZWNEYXkiLCJzZXRNb250aCIsImluY01vbnRoIiwiZGVjTW9udGgiLCJzZXRNb250aFN0cmluZyIsInNldFllYXIiLCJzZXRUd29EaWdpdFllYXIiLCJzZXRVbml4U2Vjb25kVGltZXN0YW1wIiwic2V0VW5peE1pbGxpc2Vjb25kVGltZXN0YW1wIiwic2V0TWVyaWRpZW0iLCJpbmNNZXJpZGllbSIsImRlY01lcmlkaWVtIiwiZGF5c0luTW9udGgiLCJtYXhNb250aFN0cmluZ0J1ZmZlciIsIm1heE1vbnRoQnVmZmVyIiwibWF4RGF0ZUJ1ZmZlciIsIm1heERheVN0cmluZ0J1ZmZlciIsIm1heE1pbGl0YXJ5SG91cnNCdWZmZXIiLCJtYXhIb3Vyc0J1ZmZlciIsIm1heE1pbnV0ZXNCdWZmZXIiLCJtYXhTZWNvbmRzQnVmZmVyIiwiZ2V0VVRDT2Zmc2V0IiwicGFkIiwiYXBwZW5kT3JkaW5hbCIsInRvU3RhbmRhcmRUaW1lIiwiRGF0ZVBhcnQiLCJEYXRlUGFydC5jb25zdHJ1Y3RvciIsIkRpc3BsYXlQYXJzZXIiLCJEaXNwbGF5UGFyc2VyLmNvbnN0cnVjdG9yIiwiTW91c2VFdmVudHMiLCJNb3VzZUV2ZW50cy5jb25zdHJ1Y3RvciIsImNvbnN0cnVjdG9yIiwiRGF0ZXBpY2tlcklucHV0IiwiRGF0ZXBpY2tlcklucHV0LmNvbnN0cnVjdG9yIl0sIm1hcHBpbmdzIjoiQUFXQSxJ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TUFBTUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDekNBLENBQUNBO0lBRUQsa0JBQWtCLENBQU0sRUFBRSxLQUFtQjtRQUN6Q0MsSUFBSUEsR0FBVUEsQ0FBQ0E7UUFDZkEsSUFBSUEsUUFBUUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFFL0NBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLEtBQUtBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBO1lBQ3ZCQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQSxRQUFRQSxLQUFLQSxJQUFJQSxHQUFHQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFDQSxDQUFDQTtZQUN2Q0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDYkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsS0FBS0EsS0FBS0EsUUFBUUEsSUFBSUEsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDMURBLEdBQUdBLEdBQUdBLFFBQVFBLENBQVNBLEtBQUtBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBO1FBQ3RDQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxLQUFLQSxLQUFLQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNuQ0EsR0FBR0EsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFDaEJBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ0pBLENBQUNBLEdBQUdBLEtBQUtBLENBQUNBLENBQUNBO1lBQ1hBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO1FBQ2JBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLEdBQUdBLEtBQUtBLENBQUNBLENBQUNB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ZkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsS0FBS0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDckJBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO1FBQ3hCQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxHQUFHQSxLQUFLQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNqQ0EsR0FBR0EsR0FBR0EsR0FBR0EsQ0FBQ0E7UUFDZEEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsR0FBR0EsS0FBS0EsUUFBUUEsSUFBSUEsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBQ0EsT0FBT0E7WUFDeERBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLE1BQU1BLENBQUNBLE1BQUlBLEdBQUdBLFFBQUtBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUM5Q0EsR0FBR0EsR0FBR0EsUUFBUUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2hDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtZQUNoQkEsQ0FBQ0E7UUFDTEEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDTEEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDSkEsQ0FBQ0EsR0FBR0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7WUFDWEEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDYkEsQ0FBQ0E7UUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsR0FBR0EsQ0FBQ0EsSUFBSUEsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDckJBLENBQUNBLEdBQUdBLEtBQUtBLENBQUNBLENBQUNBO1lBQ1hBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO1FBQ2JBLENBQUNBO1FBRURBLElBQUlBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBLE1BQU1BLEVBQUVBLEdBQUdBLEdBQUdBLENBQUNBO1FBQzlCQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxPQUFPQSxFQUFFQSxHQUFHQSxNQUFNQSxDQUFDQSxDQUFDQTtRQUNoQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDYkEsQ0FBQ0E7SUFFRCxnQkFBZ0IsQ0FBTTtRQUNsQkMsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDdkJBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO0lBQ3BDQSxDQUFDQTtJQUVELGdCQUFnQixDQUFNO1FBQ2xCQyxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxNQUFNQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUN2QkEsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDcENBLENBQUNBO0lBRUQsa0JBQWtCLENBQU0sRUFBRSxLQUFtQjtRQUN6Q0MsSUFBSUEsR0FBVUEsQ0FBQ0E7UUFDZkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsS0FBS0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkJBLENBQUNBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2RBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO1FBQ2JBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLEtBQUtBLEtBQUtBLFFBQVFBLElBQUlBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzFEQSxHQUFHQSxHQUFHQSxRQUFRQSxDQUFDQSxLQUFLQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtRQUM5QkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsS0FBS0EsS0FBS0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkNBLEdBQUdBLEdBQUdBLEtBQUtBLENBQUNBO1FBQ2hCQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNKQSxDQUFDQSxHQUFHQSxLQUFLQSxDQUFDQSxDQUFDQTtZQUNYQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNiQSxDQUFDQTtRQUVEQSxFQUFFQSxDQUFDQSxDQUFDQSxHQUFHQSxLQUFLQSxDQUFDQSxDQUFDQTtZQUFDQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUN2QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsR0FBR0EsQ0FBQ0EsSUFBSUEsR0FBR0EsR0FBR0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdEJBLENBQUNBLEdBQUdBLEtBQUtBLENBQUNBLENBQUNBO1lBQ1hBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO1FBQ2JBLENBQUNBO1FBRURBLENBQUNBLENBQUNBLFFBQVFBLENBQUNBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO1FBQ3BCQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNiQSxDQUFDQTtJQUVELGtCQUFrQixDQUFNO1FBQ3BCQyxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxRQUFRQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUN6QkEsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsRUFBRUEsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDdkNBLENBQUNBO0lBRUQsa0JBQWtCLENBQU07UUFDcEJDLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBO1FBQ3JCQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUN2Q0EsQ0FBQ0E7SUFFRCx3QkFBd0IsQ0FBTSxFQUFFLEtBQW1CO1FBQy9DQyxJQUFJQSxHQUFVQSxDQUFDQTtRQUVmQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxLQUFLQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2QkEsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDZEEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDYkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsS0FBS0EsS0FBS0EsUUFBUUEsSUFBSUEsVUFBVUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBQ0EsU0FBU0E7WUFDOURBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLE1BQU1BLENBQUNBLE1BQUlBLEtBQUtBLFFBQUtBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUNsREEsR0FBR0EsR0FBR0EsVUFBVUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3hDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtZQUNoQkEsQ0FBQ0E7UUFDTEEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDTEEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDSkEsQ0FBQ0EsR0FBR0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7WUFDWEEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDYkEsQ0FBQ0E7UUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsR0FBR0EsQ0FBQ0EsSUFBSUEsR0FBR0EsR0FBR0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdEJBLENBQUNBLEdBQUdBLEtBQUtBLENBQUNBLENBQUNBO1lBQ1hBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO1FBQ2JBLENBQUNBO1FBRURBLENBQUNBLENBQUNBLFFBQVFBLENBQUNBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO1FBQ3BCQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNiQSxDQUFDQTtJQUVELGlCQUFpQixDQUFNLEVBQUUsSUFBa0I7UUFDdkNDLElBQUlBLEdBQVVBLENBQUNBO1FBQ2ZBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBO1lBQ3RCQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNqQkEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDYkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsSUFBSUEsS0FBS0EsUUFBUUEsSUFBSUEsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDeERBLEdBQUdBLEdBQUdBLFFBQVFBLENBQUNBLElBQUlBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBO1FBQzdCQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxJQUFJQSxLQUFLQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsQ0EsR0FBR0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDZkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDSkEsQ0FBQ0EsR0FBR0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7WUFDWEEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDYkEsQ0FBQ0E7UUFDREEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDbkJBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO0lBQ2JBLENBQUNBO0lBRUQseUJBQXlCLENBQU0sRUFBRSxJQUFrQjtRQUMvQ0MsSUFBSUEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsV0FBV0EsRUFBRUEsR0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBQ0EsR0FBR0EsQ0FBQ0E7UUFDL0NBLElBQUlBLEdBQVVBLENBQUNBO1FBQ2ZBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBO1lBQ3RCQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNwQkEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDYkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsSUFBSUEsS0FBS0EsUUFBUUEsSUFBSUEsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDeERBLEdBQUdBLEdBQUdBLFFBQVFBLENBQUNBLElBQUlBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBO1FBQzdCQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxJQUFJQSxLQUFLQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsQ0EsR0FBR0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDZkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDSkEsQ0FBQ0EsR0FBR0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7WUFDWEEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDYkEsQ0FBQ0E7UUFDREEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsSUFBSUEsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDMUJBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO0lBQ2JBLENBQUNBO0lBRUQsZ0NBQWdDLENBQU0sRUFBRSxPQUFxQjtRQUN6REMsSUFBSUEsR0FBVUEsQ0FBQ0E7UUFDZkEsRUFBRUEs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RUFBRUEsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0E7SUFDcEVBLENBQUNBO0lBRUQsOEJBQThCLENBQU07UUFDaENDLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBO1FBQ3JCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQTtRQUM3QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUE7UUFDN0JBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BO1FBQzdCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQTtRQUM3QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUE7UUFDN0JBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BO1FBQzdCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQTtRQUM3QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUE7UUFDN0JBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BO1FBQzdCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQTtRQUM3QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsRUFBRUEsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUE7UUFDOUJBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BO0lBQ3BCQSxDQUFDQTtJQUVELHdCQUF3QixDQUFNO1FBQzFCQyxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxRQUFRQSxFQUFFQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUNwQ0EsQ0FBQ0E7SUFFRCx1QkFBdUIsQ0FBTTtRQUN6QkMsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsT0FBT0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7SUFDckRBLENBQUNBO0lBRUQsNEJBQTRCLENBQU07UUFDOUJDLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLEVBQUVBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO0lBQ3ZDQSxDQUFDQTtJQUVELGdDQUFnQyxDQUFNO1FBQ2xDQyxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxRQUFRQSxFQUFFQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUNwQ0EsQ0FBQ0E7SUFFRCx3QkFBd0IsQ0FBTTtRQUMxQkMsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsRUFBRUEsR0FBR0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDcEJBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLFFBQVFBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1FBQ3JDQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNKQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxRQUFRQSxFQUFFQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUNwQ0EsQ0FBQ0E7SUFDTEEsQ0FBQ0E7SUFFRCwwQkFBMEIsQ0FBTTtRQUM1QkMsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsVUFBVUEsRUFBRUEsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7SUFDdENBLENBQUNBO0lBRUQsMEJBQTBCLENBQU07UUFDNUJDLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLFVBQVVBLEVBQUVBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO0lBQ3RDQSxDQUFDQTtJQUVELHNCQUFzQixJQUFTLEVBQUUsU0FBaUI7UUFDOUNDLElBQUlBLEdBQUdBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLGlCQUFpQkEsRUFBRUEsQ0FBQ0E7UUFDcENBLElBQUlBLEdBQUdBLEdBQUdBLEdBQUdBLElBQUlBLENBQUNBLEdBQUdBLEdBQUdBLEdBQUdBLEdBQUdBLENBQUNBO1FBQy9CQSxJQUFJQSxLQUFLQSxHQUFHQSxTQUFTQSxHQUFHQSxHQUFHQSxHQUFHQSxFQUFFQSxDQUFDQTtRQUNqQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsR0FBR0EsR0FBR0EsQ0FBQ0EsR0FBR0EsR0FBR0EsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsS0FBS0EsR0FBR0EsR0FBR0EsQ0FBQ0EsR0FBR0EsR0FBR0EsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDN0RBLENBQUNBO0lBRUQsYUFBYSxHQUFVLEVBQUUsTUFBYTtRQUNsQ0MsSUFBSUEsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0E7UUFDdENBLE9BQU9BLE1BQU1BLENBQUNBLE1BQU1BLEdBQUdBLE1BQU1BO1lBQUVBLE1BQU1BLEdBQUdBLEdBQUdBLEdBQUdBLE1BQU1BLENBQUNBO1FBQ3JEQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQTtJQUNsQkEsQ0FBQ0E7SUFFRCx1QkFBdUIsR0FBVTtRQUM3QkMsSUFBSUEsQ0FBQ0EsR0FBR0EsR0FBR0EsR0FBR0EsRUFBRUEsQ0FBQ0E7UUFDakJBLElBQUlBLENBQUNBLEdBQUdBLEdBQUdBLEdBQUdBLEdBQUdBLENBQUNBO1FBQ2xCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUN6Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDekNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLEdBQUdBLEdBQUdBLElBQUlBLENBQUNBO1FBQ3pDQSxNQUFNQSxDQUFDQSxHQUFHQSxHQUFHQSxJQUFJQSxDQUFDQTtJQUN0QkEsQ0FBQ0E7SUFFRCx3QkFBd0IsS0FBWTtRQUNoQ0MsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7UUFDM0JBLE1BQU1BLENBQUNBLEtBQUtBLEdBQUdBLEVBQUVBLEdBQUdBLEtBQUtBLEdBQUdBLEVBQUVBLEdBQUdBLEtBQUtBLENBQUNBO0lBQzNDQSxDQUFDQTtJQUVELE1B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LEVBQUVBLElBQUlBLEVBQUVBLEdBQUdBLEVBQUVBLElBQUlBLEVBQUVBLEdBQUdBO2dCQUMxQ0EsSUFBSUEsRUFBRUEsR0FBR0EsRUFBRUEsS0FBS0EsRUFBRUEsR0FBR0EsRUFBRUEsSUFBSUEsRUFBRUEsR0FBR0EsRUFBRUEsS0FBS0EsRUFBRUEsR0FBR0E7Z0JBQzVDQSxJQUFJQSxFQUFFQSxHQUFHQSxFQUFFQSxLQUFLQSxFQUFFQSxHQUFHQSxFQUFFQSxJQUFJQSxFQUFFQSxHQUFHQSxFQUFFQSxLQUFLQSxFQUFFQSxHQUFHQTtnQkFDNUNBLElBQUlBLEVBQUVBLEdBQUdBLEVBQUVBLEtBQUtBLEVBQUVBLEdBQUdBLEVBQUVBLElBQUlBLEVBQUVBLEdBQUdBLEVBQUVBLEtBQUtBLEVBQUVBLEdBQUdBO2dCQUM1Q0EsSUFBSUEsRUFBRUEsR0FBR0EsRUFBRUEsSUFBSUEsRUFBRUEsR0FBR0EsRUFBRUEsSUFBSUEsRUFBRUEsR0FBR0EsRUFBRUEsSUFBSUEsRUFBRUEsR0FBR0E7Z0JBQzFDQSxJQUFJQSxFQUFFQSxHQUFHQSxFQUFFQSxJQUFJQSxFQUFFQSxHQUFHQSxFQUFFQSxJQUFJQSxFQUFFQSxHQUFHQSxFQUFFQSxJQUFJQSxFQUFFQSxHQUFHQTtnQkFDMUNBLElBQUlBLEVBQUVBLEdBQUdBLEVBQUVBLElBQUlBLEVBQUVBLEdBQUdBLEVBQUVBLElBQUlBLEVBQUVBLEdBQUdBLEVBQUVBLElBQUlBLEVBQUVBLEdBQUdBO2dCQUMxQ0EsSUFBSUEsRUFBRUEsR0FBR0EsRUFBRUEsSUFBSUEsRUFBRUEsR0FBR0EsRUFBRUEsSUFBSUEsRUFBRUEsR0FBR0EsRUFBRUEsSUFBSUEsRUFBRUEsR0FBR0E7Z0JBQzFDQSxJQUFJQSxFQUFFQSxHQUFHQSxFQUFFQSxJQUFJQSxFQUFFQSxHQUFHQSxFQUFFQSxJQUFJQSxFQUFFQSxHQUFHQSxFQUFFQSxJQUFJQSxFQUFFQSxHQUFHQTtnQkFDMUNBLElBQUlBLEVBQUVBLEdBQUdBLEVBQUVBLElBQUlBLEVBQUVBLEdBQUdBLEVBQUVBLElBQUlBLEVBQUVB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LENBQUNBO1lBQ1BBLENBQUNBO1FBQ0xBLENBQUNBLENBQUFBO1FBRU9BLHVCQUFrQkEsR0FBR0E7WUFDekJBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLEtBQUlBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBO2dCQUM3Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsWUFBWUEsRUFBRUEsQ0FBQ0E7b0JBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO1lBQ25EQSxDQUFDQTtZQUNEQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUNsQkEsQ0FBQ0EsQ0FBQUE7UUFFT0Esc0JBQWlCQSxHQUFFQTtZQUN2QkEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsS0FBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0E7Z0JBQ2xEQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxZQUFZQSxFQUFFQSxDQUFDQTtvQkFBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLENBQUNBO1lBQ0RBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1FBQ2xCQSxDQUFDQSxDQUFBQTtRQUtEQTs7V0FFR0E7UUFDSUEsV0FBTUEsR0FBR0EsVUFBQ0EsSUFBVUE7WUFDdkJBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLEtBQUtBLENBQUNBLENBQUNBO2dCQUFDQSxJQUFJQSxHQUFHQSxLQUFJQSxDQUFDQSxPQUFPQSxDQUFDQTtZQUN6Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBSUEsQ0FB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QSxJQUFJQSxDQUFDQSxVQUFVQSxFQUFFQSxDQUFDQTtRQUNsQkEsT0FBT0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsWUFBWUEsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFDNUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLElBQUlBLEVBQUVBLENBQUNBLENBQUNBO0lBQzVCQSxDQUFDQTtJQTZQTEQsc0JBQUNBO0FBQURBLENBcFJBLEFBb1JDQSxJQUFBIiwiZmlsZSI6ImRhdGl1bS5qcyIsInNvdXJjZXNDb250ZW50IjpbImludGVyZmFjZSBJRm9ybWF0QmxvY2sge1xyXG4gICAgY29kZTpzdHJpbmc7XHJcbiAgICBzdHIoZDpEYXRlKTpzdHJpbmc7XHJcbiAgICByZWdFeHA/OnN0cmluZztcclxuICAgIC8vIGxlYXZpbmcgaW5jLCBkZWMgYW5kIHNldCB1bnNldCB3aWxsIG1ha2UgdGhlIGJsb2NrIHVuc2VsZWN0YWJsZVxyXG4gICAgaW5jPyhkOkRhdGUpOkRhdGU7XHJcbiAgICBkZWM/KGQ6RGF0ZSk6RGF0ZTtcclxuICAgIHNldD8oZDpEYXRlLCB2OnN0cmluZ3xudW1iZXIpOkRhdGU7XHJcbiAgICBtYXhCdWZmZXI/KGQ6RGF0ZSk6bnVtYmVyO1xyXG59XHJcblxyXG5sZXQgZm9ybWF0QmxvY2tzOklGb3JtYXRCbG9ja1tdID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgXHJcbiAgICBjb25zdCBtb250aE5hbWVzOnN0cmluZ1tdID0gW1wiSmFudWFyeVwiLCBcIkZlYnJ1YXJ5XCIsIFwiTWFyY2hcIiwgXCJBcHJpbFwiLCBcIk1heVwiLCBcIkp1bmVcIiwgXCJKdWx5XCIsIFwiQXVndXN0XCIsIFwiU2VwdGVtYmVyXCIsIFwiT2N0b2JlclwiLCBcIk5vdmVtYmVyXCIsIFwiRGVjZW1iZXJcIl07XHJcbiAgICBjb25zdCBkYXlOYW1lczpzdHJpbmdbXSA9IFtcIlN1bmRheVwiLCBcIk1vbmRheVwiLCBcIlR1ZXNkYXlcIiwgXCJXZWRuZXNkYXlcIiwgXCJUaHVyc2RheVwiLCBcIkZyaWRheVwiLCBcIlNhdHVyZGF5XCJdO1xyXG5cclxuICAgIGZ1bmN0aW9uIHNldFNlY29uZHMoZDpEYXRlLCBzZWNvbmRzOnN0cmluZ3xudW1iZXIpOkRhdGUge1xyXG4gICAgICAgIGxldCBudW06bnVtYmVyO1xyXG4gICAgICAgIGlmIChzZWNvbmRzID09PSBcIlpFUk9fT1VUXCIpIHtcclxuICAgICAgICAgICAgZC5zZXRTZWNvbmRzKDApO1xyXG4gICAgICAgICAgICByZXR1cm4gZDtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBzZWNvbmRzID09PSBcInN0cmluZ1wiICYmIC9eXFxkKyQvLnRlc3Qoc2Vjb25kcykpIHtcclxuICAgICAgICAgICAgbnVtID0gcGFyc2VJbnQoPHN0cmluZz5zZWNvbmRzLCAxMCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygc2Vjb25kcyA9PT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgICAgICBudW0gPSBzZWNvbmRzO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGQgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIHJldHVybiBkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobnVtIDwgMCB8fCBudW0gPiA1OSkge1xyXG4gICAgICAgICAgICBkID0gdm9pZCAwO1xyXG4gICAgICAgICAgICByZXR1cm4gZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZC5zZXRTZWNvbmRzKG51bSk7XHJcbiAgICAgICAgcmV0dXJuIGQ7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIGluY1NlY29uZHMoZDpEYXRlKTpEYXRlIHtcclxuICAgICAgICBsZXQgbiA9IGQuZ2V0U2Vjb25kcygpICsgMTtcclxuICAgICAgICByZXR1cm4gc2V0U2Vjb25kcyhkLCBuID4gNTkgPyAwIDogbik7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIGRlY1NlY29uZHMoZDpEYXRlKTpEYXRlIHtcclxuICAgICAgICBsZXQgbiA9IGQuZ2V0U2Vjb25kcygpIC0gMTtcclxuICAgICAgICByZXR1cm4gc2V0U2Vjb25kcyhkLCBuIDwgMCA/IDU5IDogbik7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIHNldE1pbnV0ZXMoZDpEYXRlLCBtaW51dGVzOnN0cmluZ3xudW1iZXIpOkRhdGUge1xyXG4gICAgICAgIGxldCBudW06bnVtYmVyO1xyXG4gICAgICAgIGlmIChtaW51dGVzID09PSBcIlpFUk9fT1VUXCIpIHtcclxuICAgICAgICAgICAgZC5zZXRNaW51dGVzKDApO1xyXG4gICAgICAgICAgICByZXR1cm4gZDtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBtaW51dGVzID09PSBcInN0cmluZ1wiICYmIC9eXFxkKyQvLnRlc3QobWludXRlcykpIHtcclxuICAgICAgICAgICAgbnVtID0gcGFyc2VJbnQoPHN0cmluZz5taW51dGVzLCAxMCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbWludXRlcyA9PT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgICAgICBudW0gPSBtaW51dGVzO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGQgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIHJldHVybiBkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobnVtIDwgMCB8fCBudW0gPiA1OSkge1xyXG4gICAgICAgICAgICBkID0gdm9pZCAwO1xyXG4gICAgICAgICAgICByZXR1cm4gZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZC5zZXRNaW51dGVzKG51bSk7XHJcbiAgICAgICAgcmV0dXJuIGQ7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIGluY01pbnV0ZXMoZDpEYXRlKTpEYXRlIHtcclxuICAgICAgICBsZXQgbiA9IGQuZ2V0TWludXRlcygpICsgMTtcclxuICAgICAgICByZXR1cm4gc2V0TWludXRlcyhkLCBuID4gNTkgPyAwIDogbik7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIGRlY01pbnV0ZXMoZDpEYXRlKTpEYXRlIHtcclxuICAgICAgICBsZXQgbiA9IGQuZ2V0TWludXRlcygpIC0gMTtcclxuICAgICAgICByZXR1cm4gc2V0TWludXRlcyhkLCBuIDwgMCA/IDU5IDogbik7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIHNldEhvdXJzKGQ6RGF0ZSwgaG91cnM6c3RyaW5nfG51bWJlcik6RGF0ZSB7XHJcbiAgICAgICAgbGV0IG51bTpudW1iZXI7XHJcbiAgICAgICAgbGV0IG1lcmlkaWVtID0gZC5nZXRIb3VycygpID4gMTEgPyBcIlBNXCIgOiBcIkFNXCI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKGhvdXJzID09PSBcIlpFUk9fT1VUXCIpIHtcclxuICAgICAgICAgICAgZC5zZXRIb3VycyhtZXJpZGllbSA9PT0gXCJBTVwiID8gMCA6IDEyKTtcclxuICAgICAgICAgICAgcmV0dXJuIGQ7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgaG91cnMgPT09IFwic3RyaW5nXCIgJiYgL15cXGQrJC8udGVzdChob3VycykpIHtcclxuICAgICAgICAgICAgbnVtID0gcGFyc2VJbnQoPHN0cmluZz5ob3VycywgMTApO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGhvdXJzID09PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAgICAgIG51bSA9IGhvdXJzO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGQgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIHJldHVybiBkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobnVtID09PSAwKSBudW0gPSAxO1xyXG4gICAgICAgIGlmIChudW0gPCAxIHx8IG51bSA+IDEyKSB7XHJcbiAgICAgICAgICAgIGQgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIHJldHVybiBkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZiAobnVtID09PSAxMiAmJiBtZXJpZGllbSA9PT0gXCJBTVwiKSB7XHJcbiAgICAgICAgICAgIG51bSA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChudW0gIT09IDEyICYmIG1lcmlkaWVtID09PSBcIlBNXCIpIHtcclxuICAgICAgICAgICAgbnVtICs9IDEyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkLnNldEhvdXJzKG51bSk7XHJcbiAgICAgICAgcmV0dXJuIGQ7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIGluY0hvdXJzKGQ6RGF0ZSk6RGF0ZSB7XHJcbiAgICAgICAgbGV0IG4gPSBkLmdldEhvdXJzKCkgKyAxO1xyXG4gICAgICAgIHJldHVybiBzZXRNaWxpdGFyeUhvdXJzKGQsIG4gPiAyMyA/IDAgOiBuKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZnVuY3Rpb24gZGVjSG91cnMoZDpEYXRlKTpEYXRlIHtcclxuICAgICAgICBsZXQgbiA9IGQuZ2V0SG91cnMoKSAtIDE7XHJcbiAgICAgICAgcmV0dXJuIHNldE1pbGl0YXJ5SG91cnMoZCwgbiA8IDAgPyAyMyA6IG4pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBmdW5jdGlvbiBzZXRNaWxpdGFyeUhvdXJzKGQ6RGF0ZSwgaG91cnM6c3RyaW5nfG51bWJlcik6RGF0ZSB7XHJcbiAgICAgICAgbGV0IG51bTpudW1iZXI7XHJcbiAgICAgICAgaWYgKGhvdXJzID09PSBcIlpFUk9fT1VUXCIpIHtcclxuICAgICAgICAgICAgZC5zZXRIb3VycygwKTtcclxuICAgICAgICAgICAgcmV0dXJuIGQ7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgaG91cnMgPT09IFwic3RyaW5nXCIgJiYgL15cXGQrJC8udGVzdChob3VycykpIHtcclxuICAgICAgICAgICAgbnVtID0gcGFyc2VJbnQoPHN0cmluZz5ob3VycywgMTApO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGhvdXJzID09PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAgICAgIG51bSA9IGhvdXJzO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGQgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIHJldHVybiBkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobnVtIDwgMCB8fCBudW0gPiAyMykge1xyXG4gICAgICAgICAgICBkID0gdm9pZCAwO1xyXG4gICAgICAgICAgICByZXR1cm4gZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGQuZ2V0SG91cnMoKSA9PT0gbnVtICsgMSkge1xyXG4gICAgICAgICAgICBkLnNldEhvdXJzKG51bSk7XHJcbiAgICAgICAgICAgIGlmIChkLmdldEhvdXJzKCkgIT09IG51bSkge1xyXG4gICAgICAgICAgICAgICAgZC5zZXRIb3VycyhudW0gLSAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGQuc2V0SG91cnMobnVtKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGQ7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIHNldERhdGUoZDpEYXRlLCBkYXRlOnN0cmluZ3xudW1iZXIpOkRhdGUge1xyXG4gICAgICAgIGxldCBudW06bnVtYmVyO1xyXG4gICAgICAgIGlmIChkYXRlID09PSBcIlpFUk9fT1VUXCIpIHtcclxuICAgICAgICAgICAgZC5zZXREYXRlKDEpO1xyXG4gICAgICAgICAgICByZXR1cm4gZDtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBkYXRlID09PSBcInN0cmluZ1wiICYmIC9cXGR7MSwyfS4qJC8udGVzdChkYXRlKSkge1xyXG4gICAgICAgICAgICBudW0gPSBwYXJzZUludCg8c3RyaW5nPmRhdGUsIDEwKTtcclxuICAgICAgICB9IGVsc2UgaWYgICh0eXBlb2YgZGF0ZSA9PT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgICAgICBudW0gPSBkYXRlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGQgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIHJldHVybiBkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobnVtID09PSAwKSBudW0gPSAxO1xyXG4gICAgICAgIGlmIChudW0gPCAxIHx8IG51bSA+IGRheXNJbk1vbnRoKGQpKSB7XHJcbiAgICAgICAgICAgIGQgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIHJldHVybiBkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkLnNldERhdGUobnVtKTtcclxuICAgICAgICByZXR1cm4gZDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZnVuY3Rpb24gaW5jRGF0ZShkOkRhdGUpOkRhdGUge1xyXG4gICAgICAgIGxldCBuID0gZC5nZXREYXRlKCkgKyAxO1xyXG4gICAgICAgIHJldHVybiBzZXREYXRlKGQsIG4gPiBkYXlzSW5Nb250aChkKSA/IDEgOiBuKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZnVuY3Rpb24gZGVjRGF0ZShkOkRhdGUpOkRhdGUge1xyXG4gICAgICAgIGxldCBuID0gZC5nZXREYXRlKCkgLSAxO1xyXG4gICAgICAgIHJldHVybiBzZXREYXRlKGQsIG4gPCAxID8gZGF5c0luTW9udGgoZCkgOiBuKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZnVuY3Rpb24gc2V0RGF5KGQ6RGF0ZSwgZGF5OnN0cmluZ3xudW1iZXIpOkRhdGUge1xyXG4gICAgICAgIGxldCBudW06bnVtYmVyO1xyXG4gICAgICAgIGlmIChkYXkgPT09IFwiWkVST19PVVRcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gc2V0RGF5KGQsIDApO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGRheSA9PT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgICAgICBudW0gPSBkYXk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZGF5ID09PSBcInN0cmluZ1wiICYmIGRheU5hbWVzLnNvbWUoKGRheU5hbWUpID0+IHtcclxuICAgICAgICAgICAgaWYgKG5ldyBSZWdFeHAoYF4ke2RheX0uKiRgLCBcImlcIikudGVzdChkYXlOYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgbnVtID0gZGF5TmFtZXMuaW5kZXhPZihkYXlOYW1lKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSkpIHtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBkID0gdm9pZCAwO1xyXG4gICAgICAgICAgICByZXR1cm4gZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKG51bSA8IDAgfHwgbnVtID4gNikge1xyXG4gICAgICAgICAgICBkID0gdm9pZCAwO1xyXG4gICAgICAgICAgICByZXR1cm4gZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IG9mZnNldCA9IGQuZ2V0RGF5KCkgLSBudW07XHJcbiAgICAgICAgZC5zZXREYXRlKGQuZ2V0RGF0ZSgpIC0gb2Zmc2V0KTtcclxuICAgICAgICByZXR1cm4gZDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZnVuY3Rpb24gaW5jRGF5KGQ6RGF0ZSk6RGF0ZSB7XHJcbiAgICAgICAgbGV0IG4gPSBkLmdldERheSgpICsgMTtcclxuICAgICAgICByZXR1cm4gc2V0RGF5KGQsIG4gPiA2ID8gMCA6IG4pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBmdW5jdGlvbiBkZWNEYXkoZDpEYXRlKTpEYXRlIHtcclxuICAgICAgICBsZXQgbiA9IGQuZ2V0RGF5KCkgLSAxO1xyXG4gICAgICAgIHJldHVybiBzZXREYXkoZCwgbiA8IDAgPyA2IDogbik7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIHNldE1vbnRoKGQ6RGF0ZSwgbW9udGg6c3RyaW5nfG51bWJlcik6RGF0ZSB7XHJcbiAgICAgICAgbGV0IG51bTpudW1iZXI7XHJcbiAgICAgICAgaWYgKG1vbnRoID09PSBcIlpFUk9fT1VUXCIpIHtcclxuICAgICAgICAgICAgZC5zZXRNb250aCgwKTtcclxuICAgICAgICAgICAgcmV0dXJuIGQ7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbW9udGggPT09IFwic3RyaW5nXCIgJiYgL15cXGQrJC8udGVzdChtb250aCkpIHtcclxuICAgICAgICAgICAgbnVtID0gcGFyc2VJbnQobW9udGgsIDEwKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBtb250aCA9PT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgICAgICBudW0gPSBtb250aDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBkID0gdm9pZCAwO1xyXG4gICAgICAgICAgICByZXR1cm4gZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKG51bSA9PT0gMCkgbnVtID0gMTtcclxuICAgICAgICBpZiAobnVtIDwgMSB8fCBudW0gPiAxMikge1xyXG4gICAgICAgICAgICBkID0gdm9pZCAwO1xyXG4gICAgICAgICAgICByZXR1cm4gZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgZC5zZXRNb250aChudW0gLSAxKTtcclxuICAgICAgICByZXR1cm4gZDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZnVuY3Rpb24gaW5jTW9udGgoZDpEYXRlKTpEYXRlIHtcclxuICAgICAgICBsZXQgbiA9IGQuZ2V0TW9udGgoKSArIDI7XHJcbiAgICAgICAgcmV0dXJuIHNldE1vbnRoKGQsIG4gPiAxMiA/IDEgOiBuKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZnVuY3Rpb24gZGVjTW9udGgoZDpEYXRlKTpEYXRlIHtcclxuICAgICAgICBsZXQgbiA9IGQuZ2V0TW9udGgoKTtcclxuICAgICAgICByZXR1cm4gc2V0TW9udGgoZCwgbiA8IDEgPyAxMiA6IG4pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBmdW5jdGlvbiBzZXRNb250aFN0cmluZyhkOkRhdGUsIG1vbnRoOnN0cmluZ3xudW1iZXIpOkRhdGUge1xyXG4gICAgICAgIGxldCBudW06bnVtYmVyO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChtb250aCA9PT0gXCJaRVJPX09VVFwiKSB7XHJcbiAgICAgICAgICAgIGQuc2V0TW9udGgoMCk7XHJcbiAgICAgICAgICAgIHJldHVybiBkO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG1vbnRoID09PSBcInN0cmluZ1wiICYmIG1vbnRoTmFtZXMuc29tZSgobW9udGhOYW1lKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChuZXcgUmVnRXhwKGBeJHttb250aH0uKiRgLCBcImlcIikudGVzdChtb250aE5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICBudW0gPSBtb250aE5hbWVzLmluZGV4T2YobW9udGhOYW1lKSArIDE7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pKSB7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZCA9IHZvaWQgMDtcclxuICAgICAgICAgICAgcmV0dXJuIGQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChudW0gPCAxIHx8IG51bSA+IDEyKSB7XHJcbiAgICAgICAgICAgIGQgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIHJldHVybiBkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBkLnNldE1vbnRoKG51bSAtIDEpO1xyXG4gICAgICAgIHJldHVybiBkO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBmdW5jdGlvbiBzZXRZZWFyKGQ6RGF0ZSwgeWVhcjpzdHJpbmd8bnVtYmVyKTpEYXRlIHtcclxuICAgICAgICBsZXQgbnVtOm51bWJlcjtcclxuICAgICAgICBpZiAoeWVhciA9PT0gXCJaRVJPX09VVFwiKSB7XHJcbiAgICAgICAgICAgIGQuc2V0RnVsbFllYXIoMCk7XHJcbiAgICAgICAgICAgIHJldHVybiBkO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHllYXIgPT09IFwic3RyaW5nXCIgJiYgL15cXGQrJC8udGVzdCh5ZWFyKSkge1xyXG4gICAgICAgICAgICBudW0gPSBwYXJzZUludCh5ZWFyLCAxMCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgeWVhciA9PT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgICAgICBudW0gPSB5ZWFyO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGQgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIHJldHVybiBkO1xyXG4gICAgICAgIH0gICAgICAgIFxyXG4gICAgICAgIGQuc2V0RnVsbFllYXIobnVtKTtcclxuICAgICAgICByZXR1cm4gZDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZnVuY3Rpb24gc2V0VHdvRGlnaXRZZWFyKGQ6RGF0ZSwgeWVhcjpzdHJpbmd8bnVtYmVyKTpEYXRlIHtcclxuICAgICAgICBsZXQgYmFzZSA9IE1hdGguZmxvb3IoZC5nZXRGdWxsWWVhcigpLzEwMCkqMTAwO1xyXG4gICAgICAgIGxldCBudW06bnVtYmVyO1xyXG4gICAgICAgIGlmICh5ZWFyID09PSBcIlpFUk9fT1VUXCIpIHtcclxuICAgICAgICAgICAgZC5zZXRGdWxsWWVhcihiYXNlKTtcclxuICAgICAgICAgICAgcmV0dXJuIGQ7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgeWVhciA9PT0gXCJzdHJpbmdcIiAmJiAvXlxcZCskLy50ZXN0KHllYXIpKSB7XHJcbiAgICAgICAgICAgIG51bSA9IHBhcnNlSW50KHllYXIsIDEwKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB5ZWFyID09PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAgICAgIG51bSA9IHllYXI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZCA9IHZvaWQgMDtcclxuICAgICAgICAgICAgcmV0dXJuIGQ7XHJcbiAgICAgICAgfSAgICAgICAgXHJcbiAgICAgICAgZC5zZXRGdWxsWWVhcihiYXNlICsgbnVtKTtcclxuICAgICAgICByZXR1cm4gZDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZnVuY3Rpb24gc2V0VW5peFNlY29uZFRpbWVzdGFtcChkOkRhdGUsIHNlY29uZHM6c3RyaW5nfG51bWJlcik6RGF0ZSB7XHJcbiAgICAgICAgbGV0IG51bTpudW1iZXI7XHJcbiAgICAgICAgaWYgKHNlY29uZHMgPT09IFwiWkVST19PVVRcIikge1xyXG4gICAgICAgICAgICBkID0gbmV3IERhdGUoMCk7XHJcbiAgICAgICAgICAgIHJldHVybiBkO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHNlY29uZHMgPT09IFwic3RyaW5nXCIgJiYgL15cXGQrJC8udGVzdChzZWNvbmRzKSkge1xyXG4gICAgICAgICAgICBudW0gPSBwYXJzZUludChzZWNvbmRzLCAxMCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygc2Vjb25kcyA9PT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgICAgICBudW0gPSBzZWNvbmRzO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGQgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIHJldHVybiBkO1xyXG4gICAgICAgIH0gICAgICAgIFxyXG4gICAgICAgIGQgPSBuZXcgRGF0ZShudW0gKiAxMDAwKTtcclxuICAgICAgICByZXR1cm4gZDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZnVuY3Rpb24gc2V0VW5peE1pbGxpc2Vjb25kVGltZXN0YW1wKGQ6RGF0ZSwgbWlsbGlzZWNvbmRzOnN0cmluZ3xudW1iZXIpOkRhdGUge1xyXG4gICAgICAgIGxldCBudW06bnVtYmVyO1xyXG4gICAgICAgIGlmIChtaWxsaXNlY29uZHMgPT09IFwiWkVST19PVVRcIikge1xyXG4gICAgICAgICAgICBkID0gbmV3IERhdGUoMCk7XHJcbiAgICAgICAgICAgIHJldHVybiBkO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG1pbGxpc2Vjb25kcyA9PT0gXCJzdHJpbmdcIiAmJiAvXlxcZCskLy50ZXN0KG1pbGxpc2Vjb25kcykpIHtcclxuICAgICAgICAgICAgbnVtID0gcGFyc2VJbnQobWlsbGlzZWNvbmRzLCAxMCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbWlsbGlzZWNvbmRzID09PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAgICAgIG51bSA9IG1pbGxpc2Vjb25kcztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBkID0gdm9pZCAwO1xyXG4gICAgICAgICAgICByZXR1cm4gZDtcclxuICAgICAgICB9ICAgICAgICBcclxuICAgICAgICBkID0gbmV3IERhdGUobnVtKTtcclxuICAgICAgICByZXR1cm4gZDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZnVuY3Rpb24gc2V0TWVyaWRpZW0oZDpEYXRlLCBtZXJpZGllbTpzdHJpbmd8bnVtYmVyKTpEYXRlIHtcclxuICAgICAgICBsZXQgaG91cnMgPSBkLmdldEhvdXJzKCk7XHJcbiAgICAgICAgaWYgKG1lcmlkaWVtID09PSBcIlpFUk9fT1VUXCIpIHJldHVybiBkO1xyXG4gICAgICAgIGlmICh0eXBlb2YgbWVyaWRpZW0gPT09IFwic3RyaW5nXCIgJiYgL15hbT8kL2kudGVzdCg8c3RyaW5nPm1lcmlkaWVtKSkge1xyXG4gICAgICAgICAgICBob3VycyAtPSAxMjtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBtZXJpZGllbSA9PT0gXCJzdHJpbmdcIiAmJiAvXnBtPyQvaS50ZXN0KDxzdHJpbmc+bWVyaWRpZW0pKSB7XHJcbiAgICAgICAgICAgIGhvdXJzICs9IDEyO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGQgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIHJldHVybiBkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaG91cnMgPCAwIHx8IGhvdXJzID4gMjMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzZXRNaWxpdGFyeUhvdXJzKGQsIGhvdXJzKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZnVuY3Rpb24gaW5jTWVyaWRpZW0oZDpEYXRlKTpEYXRlIHtcclxuICAgICAgICBsZXQgbiA9IGQuZ2V0SG91cnMoKSArIDEyO1xyXG4gICAgICAgIHJldHVybiBzZXRNaWxpdGFyeUhvdXJzKGQsIG4gPiAyMyA/IG4gLSAyNCA6IG4pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBmdW5jdGlvbiBkZWNNZXJpZGllbShkOkRhdGUpOkRhdGUge1xyXG4gICAgICAgIGxldCBuID0gZC5nZXRIb3VycygpIC0gMTI7XHJcbiAgICAgICAgcmV0dXJuIHNldE1pbGl0YXJ5SG91cnMoZCwgbiA8IDAgPyBuICsgMjQgOiBuKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZnVuY3Rpb24gZGF5c0luTW9udGgoZDpEYXRlKTpudW1iZXIge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShkLmdldEZ1bGxZZWFyKCksIGQuZ2V0TW9udGgoKSArIDEsIDApLmdldERhdGUoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZnVuY3Rpb24gbWF4TW9udGhTdHJpbmdCdWZmZXIoZDpEYXRlKTpudW1iZXIge1xyXG4gICAgICAgIGxldCBtID0gZC5nZXRNb250aCgpO1xyXG4gICAgICAgIGlmIChtID09PSAwKSByZXR1cm4gMjsgLy8gSmFuXHJcbiAgICAgICAgaWYgKG0gPT09IDEpIHJldHVybiAxOyAvLyBGZWJcclxuICAgICAgICBpZiAobSA9PT0gMikgcmV0dXJuIDM7IC8vIE1hclxyXG4gICAgICAgIGlmIChtID09PSAzKSByZXR1cm4gMjsgLy8gQXByXHJcbiAgICAgICAgaWYgKG0gPT09IDQpIHJldHVybiAzOyAvLyBNYXlcclxuICAgICAgICBpZiAobSA9PT0gNSkgcmV0dXJuIDM7IC8vIEp1blxyXG4gICAgICAgIGlmIChtID09PSA2KSByZXR1cm4gMzsgLy8gSnVsXHJcbiAgICAgICAgaWYgKG0gPT09IDcpIHJldHVybiAyOyAvLyBBdWdcclxuICAgICAgICBpZiAobSA9PT0gOCkgcmV0dXJuIDE7IC8vIFNlcFxyXG4gICAgICAgIGlmIChtID09PSA5KSByZXR1cm4gMTsgLy8gT2N0XHJcbiAgICAgICAgaWYgKG0gPT09IDEwKSByZXR1cm4gMTsgLy8gTm92XHJcbiAgICAgICAgcmV0dXJuIDE7IC8vIERlY1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBmdW5jdGlvbiBtYXhNb250aEJ1ZmZlcihkOkRhdGUpOm51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIGQuZ2V0TW9udGgoKSA+IDAgPyAxIDogMjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZnVuY3Rpb24gbWF4RGF0ZUJ1ZmZlcihkOkRhdGUpOm51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIGQuZ2V0RGF0ZSgpICogMTAgPiBkYXlzSW5Nb250aChkKSA/IDEgOiAyO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBmdW5jdGlvbiBtYXhEYXlTdHJpbmdCdWZmZXIoZDpEYXRlKTpudW1iZXIge1xyXG4gICAgICAgIHJldHVybiBkLmdldERheSgpICUgMiA9PSAwID8gMiA6IDE7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIG1heE1pbGl0YXJ5SG91cnNCdWZmZXIoZDpEYXRlKTpudW1iZXIge1xyXG4gICAgICAgIHJldHVybiBkLmdldEhvdXJzKCkgPiAyID8gMSA6IDI7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIG1heEhvdXJzQnVmZmVyKGQ6RGF0ZSk6bnVtYmVyIHtcclxuICAgICAgICBpZiAoZC5nZXRIb3VycygpID4gMTEpIHsgLy8gUE1cclxuICAgICAgICAgICAgcmV0dXJuIGQuZ2V0SG91cnMoKSA+IDEzID8gMSA6IDI7XHJcbiAgICAgICAgfSBlbHNlIHsgLy8gQU1cclxuICAgICAgICAgICAgcmV0dXJuIGQuZ2V0SG91cnMoKSA+IDEgPyAxIDogMjsgICBcclxuICAgICAgICB9ICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgZnVuY3Rpb24gbWF4TWludXRlc0J1ZmZlcihkOkRhdGUpOm51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIGQuZ2V0TWludXRlcygpID4gNSA/IDEgOiAyO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBmdW5jdGlvbiBtYXhTZWNvbmRzQnVmZmVyKGQ6RGF0ZSk6bnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gZC5nZXRTZWNvbmRzKCkgPiA1ID8gMSA6IDI7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIGdldFVUQ09mZnNldChkYXRlOkRhdGUsIHNob3dDb2xvbjpib29sZWFuKTpzdHJpbmcge1xyXG4gICAgICAgIGxldCB0em8gPSAtZGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpO1xyXG4gICAgICAgIGxldCBkaWYgPSB0em8gPj0gMCA/IFwiK1wiIDogXCItXCI7XHJcbiAgICAgICAgbGV0IGNvbG9uID0gc2hvd0NvbG9uID8gXCI6XCIgOiBcIlwiO1xyXG4gICAgICAgIHJldHVybiBkaWYgKyBwYWQodHpvIC8gNjAsIDIpICsgY29sb24gKyBwYWQodHpvICUgNjAsIDIpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBhZChudW06bnVtYmVyLCBsZW5ndGg6bnVtYmVyKTpzdHJpbmcge1xyXG4gICAgICAgIGxldCBwYWRkZWQgPSBNYXRoLmFicyhudW0pLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgd2hpbGUgKHBhZGRlZC5sZW5ndGggPCBsZW5ndGgpIHBhZGRlZCA9IFwiMFwiICsgcGFkZGVkO1xyXG4gICAgICAgIHJldHVybiBwYWRkZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gYXBwZW5kT3JkaW5hbChudW06bnVtYmVyKTpzdHJpbmcge1xyXG4gICAgICAgIGxldCBqID0gbnVtICUgMTA7XHJcbiAgICAgICAgbGV0IGsgPSBudW0gJSAxMDA7XHJcbiAgICAgICAgaWYgKGogPT0gMSAmJiBrICE9IDExKSByZXR1cm4gbnVtICsgXCJzdFwiO1xyXG4gICAgICAgIGlmIChqID09IDIgJiYgayAhPSAxMikgcmV0dXJuIG51bSArIFwibmRcIjtcclxuICAgICAgICBpZiAoaiA9PSAzICYmIGsgIT0gMTMpIHJldHVybiBudW0gKyBcInJkXCI7XHJcbiAgICAgICAgcmV0dXJuIG51bSArIFwidGhcIjtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB0b1N0YW5kYXJkVGltZShob3VyczpudW1iZXIpOm51bWJlciB7XHJcbiAgICAgICAgaWYgKGhvdXJzID09PSAwKSByZXR1cm4gMTI7XHJcbiAgICAgICAgcmV0dXJuIGhvdXJzID4gMTIgPyBob3VycyAtIDEyIDogaG91cnM7XHJcbiAgICB9ICAgIFxyXG4gICAgICAgIFxyXG4gICAgcmV0dXJuIDxJRm9ybWF0QmxvY2tbXT4gW1xyXG4gICAgICAgIHsgLy8gRk9VUiBESUdJVCBZRUFSXHJcbiAgICAgICAgICAgIGNvZGU6IFwiWVlZWVwiLFxyXG4gICAgICAgICAgICByZWdFeHA6IFwiXFxcXGR7NCw0fVwiLFxyXG4gICAgICAgICAgICBzdHI6IChkKSA9PiBkLmdldEZ1bGxZZWFyKCkudG9TdHJpbmcoKSxcclxuICAgICAgICAgICAgaW5jOiAoZCkgPT4gc2V0WWVhcihkLCBkLmdldEZ1bGxZZWFyKCkgKyAxKSxcclxuICAgICAgICAgICAgZGVjOiAoZCkgPT4gc2V0WWVhcihkLCBkLmdldEZ1bGxZZWFyKCkgLSAxKSxcclxuICAgICAgICAgICAgc2V0OiAoZCwgdikgPT4gc2V0WWVhcihkLCB2KSxcclxuICAgICAgICAgICAgbWF4QnVmZmVyOiAoZCkgPT4gNFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeyAvLyBUV08gRElHSVQgWUVBUlxyXG4gICAgICAgICAgICBjb2RlOiBcIllZXCIsXHJcbiAgICAgICAgICAgIHJlZ0V4cDogXCJcXFxcZHsyLDJ9XCIsXHJcbiAgICAgICAgICAgIHN0cjogKGQpID0+IGQuZ2V0RnVsbFllYXIoKS50b1N0cmluZygpLnNsaWNlKC0yKSxcclxuICAgICAgICAgICAgaW5jOiAoZCkgPT4gc2V0WWVhcihkLCBkLmdldEZ1bGxZZWFyKCkgKyAxKSxcclxuICAgICAgICAgICAgZGVjOiAoZCkgPT4gc2V0WWVhcihkLCBkLmdldEZ1bGxZZWFyKCkgLSAxKSxcclxuICAgICAgICAgICAgc2V0OiAoZCwgdikgPT4gc2V0VHdvRGlnaXRZZWFyKGQsIHYpLFxyXG4gICAgICAgICAgICBtYXhCdWZmZXI6IChkKSA9PiAyXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7IC8vIExPTkcgTU9OVEggTkFNRVxyXG4gICAgICAgICAgICBjb2RlOiBcIk1NTU1cIixcclxuICAgICAgICAgICAgcmVnRXhwOiBgKCgke21vbnRoTmFtZXMuam9pbihcIil8KFwiKX0pKWAsXHJcbiAgICAgICAgICAgIHN0cjogKGQpID0+IG1vbnRoTmFtZXNbZC5nZXRNb250aCgpXSxcclxuICAgICAgICAgICAgaW5jOiAoZCkgPT4gaW5jTW9udGgoZCksXHJcbiAgICAgICAgICAgIGRlYzogKGQpID0+IGRlY01vbnRoKGQpLFxyXG4gICAgICAgICAgICBzZXQ6IChkLCB2KSA9PiBzZXRNb250aFN0cmluZyhkLCB2KSxcclxuICAgICAgICAgICAgbWF4QnVmZmVyOiAoZCkgPT4gbWF4TW9udGhTdHJpbmdCdWZmZXIoZClcclxuICAgICAgICB9LFxyXG4gICAgICAgIHsgLy8gU0hPUlQgTU9OVEggTkFNRVxyXG4gICAgICAgICAgICBjb2RlOiBcIk1NTVwiLFxyXG4gICAgICAgICAgICByZWdFeHA6IGAoKCR7bW9udGhOYW1lcy5tYXAoKHYpID0+IHYuc2xpY2UoMCwzKSkuam9pbihcIil8KFwiKX0pKWAsXHJcbiAgICAgICAgICAgIHN0cjogKGQpID0+IG1vbnRoTmFtZXNbZC5nZXRNb250aCgpXS5zbGljZSgwLDMpLFxyXG4gICAgICAgICAgICBpbmM6IChkKSA9PiBpbmNNb250aChkKSxcclxuICAgICAgICAgICAgZGVjOiAoZCkgPT4gZGVjTW9udGgoZCksXHJcbiAgICAgICAgICAgIHNldDogKGQsIHYpID0+IHNldE1vbnRoU3RyaW5nKGQsIHYpLFxyXG4gICAgICAgICAgICBtYXhCdWZmZXI6IChkKSA9PiBtYXhNb250aFN0cmluZ0J1ZmZlcihkKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeyAvLyBQQURERUQgTU9OVEhcclxuICAgICAgICAgICAgY29kZTogXCJNTVwiLFxyXG4gICAgICAgICAgICByZWdFeHA6IFwiXFxcXGR7MiwyfVwiLFxyXG4gICAgICAgICAgICBzdHI6IChkKSA9PiBwYWQoZC5nZXRNb250aCgpICsgMSwgMiksXHJcbiAgICAgICAgICAgIGluYzogKGQpID0+IGluY01vbnRoKGQpLFxyXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBkZWNNb250aChkKSxcclxuICAgICAgICAgICAgc2V0OiAoZCwgdikgPT4gc2V0TW9udGgoZCwgdiksXHJcbiAgICAgICAgICAgIG1heEJ1ZmZlcjogKGQpID0+IG1heE1vbnRoQnVmZmVyKGQpXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7IC8vIE1PTlRIXHJcbiAgICAgICAgICAgIGNvZGU6IFwiTVwiLFxyXG4gICAgICAgICAgICByZWdFeHA6IFwiXFxcXGR7MSwyfVwiLFxyXG4gICAgICAgICAgICBzdHI6IChkKSA9PiAoZC5nZXRNb250aCgpICsgMSkudG9TdHJpbmcoKSxcclxuICAgICAgICAgICAgaW5jOiAoZCkgPT4gaW5jTW9udGgoZCksXHJcbiAgICAgICAgICAgIGRlYzogKGQpID0+IGRlY01vbnRoKGQpLFxyXG4gICAgICAgICAgICBzZXQ6IChkLCB2KSA9PiBzZXRNb250aChkLCB2KSxcclxuICAgICAgICAgICAgbWF4QnVmZmVyOiAoZCkgPT4gbWF4TW9udGhCdWZmZXIoZClcclxuICAgICAgICB9LFxyXG4gICAgICAgIHsgLy8gUEFEREVEIERBVEVcclxuICAgICAgICAgICAgY29kZTogXCJERFwiLFxyXG4gICAgICAgICAgICByZWdFeHA6IFwiXFxcXGR7MiwyfVwiLFxyXG4gICAgICAgICAgICBzdHI6IChkKSA9PiBwYWQoZC5nZXREYXRlKCksIDIpLFxyXG4gICAgICAgICAgICBpbmM6IChkKSA9PiBpbmNEYXRlKGQpLFxyXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBkZWNEYXRlKGQpLFxyXG4gICAgICAgICAgICBzZXQ6IChkLCB2KSA9PiBzZXREYXRlKGQsIHYpLFxyXG4gICAgICAgICAgICBtYXhCdWZmZXI6IChkKSA9PiBtYXhEYXRlQnVmZmVyKGQpXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7IC8vIE9SRElOQUwgREFURVxyXG4gICAgICAgICAgICBjb2RlOiBcIkRvXCIsXHJcbiAgICAgICAgICAgIHJlZ0V4cDogXCJcXFxcZHsxLDJ9KCh0aCl8KG5kKXwocmQpfChzdCkpXCIsXHJcbiAgICAgICAgICAgIHN0cjogKGQpID0+IGFwcGVuZE9yZGluYWwoZC5nZXREYXRlKCkpLFxyXG4gICAgICAgICAgICBpbmM6IChkKSA9PiBpbmNEYXRlKGQpLFxyXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBkZWNEYXRlKGQpLFxyXG4gICAgICAgICAgICBzZXQ6IChkLCB2KSA9PiBzZXREYXRlKGQsIHYpLFxyXG4gICAgICAgICAgICBtYXhCdWZmZXI6IChkKSA9PiBtYXhEYXRlQnVmZmVyKGQpXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7IC8vIERBVEVcclxuICAgICAgICAgICAgY29kZTogXCJEXCIsXHJcbiAgICAgICAgICAgIHJlZ0V4cDogXCJcXFxcZHsxLDJ9XCIsXHJcbiAgICAgICAgICAgIHN0cjogKGQpID0+IGQuZ2V0RGF0ZSgpLnRvU3RyaW5nKCksXHJcbiAgICAgICAgICAgIGluYzogKGQpID0+IGluY0RhdGUoZCksXHJcbiAgICAgICAgICAgIGRlYzogKGQpID0+IGRlY0RhdGUoZCksXHJcbiAgICAgICAgICAgIHNldDogKGQsIHYpID0+IHNldERhdGUoZCwgdiksXHJcbiAgICAgICAgICAgIG1heEJ1ZmZlcjogKGQpID0+IG1heERhdGVCdWZmZXIoZClcclxuICAgICAgICB9LFxyXG4gICAgICAgIHsgLy8gTE9ORyBEQVkgTkFNRVxyXG4gICAgICAgICAgICBjb2RlOiBcImRkZGRcIixcclxuICAgICAgICAgICAgcmVnRXhwOiBgKCgke2RheU5hbWVzLmpvaW4oXCIpfChcIil9KSlgLFxyXG4gICAgICAgICAgICBzdHI6IChkKSA9PiBkYXlOYW1lc1tkLmdldERheSgpXSxcclxuICAgICAgICAgICAgaW5jOiAoZCkgPT4gaW5jRGF5KGQpLFxyXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBkZWNEYXkoZCksXHJcbiAgICAgICAgICAgIHNldDogKGQsIHYpID0+IHNldERheShkLCB2KSxcclxuICAgICAgICAgICAgbWF4QnVmZmVyOiAoZCkgPT4gbWF4RGF5U3RyaW5nQnVmZmVyKGQpXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7IC8vIFNIT1JUIERBWSBOQU1FXHJcbiAgICAgICAgICAgIGNvZGU6IFwiZGRkXCIsXHJcbiAgICAgICAgICAgIHJlZ0V4cDogYCgoJHtkYXlOYW1lcy5tYXAoKHYpID0+IHYuc2xpY2UoMCwzKSkuam9pbihcIil8KFwiKX0pKWAsXHJcbiAgICAgICAgICAgIHN0cjogKGQpID0+IGRheU5hbWVzW2QuZ2V0RGF5KCldLnNsaWNlKDAsMyksXHJcbiAgICAgICAgICAgIGluYzogKGQpID0+IGluY0RheShkKSxcclxuICAgICAgICAgICAgZGVjOiAoZCkgPT4gZGVjRGF5KGQpLFxyXG4gICAgICAgICAgICBzZXQ6IChkLCB2KSA9PiBzZXREYXkoZCwgdiksXHJcbiAgICAgICAgICAgIG1heEJ1ZmZlcjogKGQpID0+IG1heERheVN0cmluZ0J1ZmZlcihkKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeyAvLyBVTklYIFRJTUVTVEFNUFxyXG4gICAgICAgICAgICBjb2RlOiBcIlhcIixcclxuICAgICAgICAgICAgcmVnRXhwOiBcIlxcXFxkezEsfVwiLFxyXG4gICAgICAgICAgICBzdHI6IChkKSA9PiBNYXRoLmZsb29yKGQudmFsdWVPZigpIC8gMTAwMCkudG9TdHJpbmcoKSxcclxuICAgICAgICAgICAgaW5jOiAoZCkgPT4gbmV3IERhdGUoZC52YWx1ZU9mKCkgKyAxMDAwKSxcclxuICAgICAgICAgICAgZGVjOiAoZCkgPT4gbmV3IERhdGUoZC52YWx1ZU9mKCkgLSAxMDAwKSxcclxuICAgICAgICAgICAgc2V0OiAoZCwgdikgPT4gc2V0VW5peFNlY29uZFRpbWVzdGFtcChkLCB2KVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeyAvLyBVTklYIE1JTExJU0VDT05EIFRJTUVTVEFNUFxyXG4gICAgICAgICAgICBjb2RlOiBcInhcIixcclxuICAgICAgICAgICAgcmVnRXhwOiBcIlxcXFxkezEsfVwiLFxyXG4gICAgICAgICAgICBzdHI6IChkKSA9PiBkLnZhbHVlT2YoKS50b1N0cmluZygpLFxyXG4gICAgICAgICAgICBpbmM6IChkKSA9PiBuZXcgRGF0ZShkLnZhbHVlT2YoKSArIDEpLFxyXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBuZXcgRGF0ZShkLnZhbHVlT2YoKSAtIDEpLFxyXG4gICAgICAgICAgICBzZXQ6IChkLCB2KSA9PiBzZXRVbml4TWlsbGlzZWNvbmRUaW1lc3RhbXAoZCwgdilcclxuICAgICAgICB9LFxyXG4gICAgICAgIHsgLy8gUEFEREVEIE1JTElUQVJZIEhPVVJTXHJcbiAgICAgICAgICAgIGNvZGU6IFwiSEhcIixcclxuICAgICAgICAgICAgcmVnRXhwOiBcIlxcXFxkezIsMn1cIixcclxuICAgICAgICAgICAgc3RyOiAoZCkgPT4gcGFkKGQuZ2V0SG91cnMoKSwgMiksXHJcbiAgICAgICAgICAgIGluYzogKGQpID0+IGluY0hvdXJzKGQpLFxyXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBkZWNIb3VycyhkKSxcclxuICAgICAgICAgICAgc2V0OiAoZCwgdikgPT4gc2V0TWlsaXRhcnlIb3VycyhkLCB2KSxcclxuICAgICAgICAgICAgbWF4QnVmZmVyOiAoZCkgPT4gbWF4TWlsaXRhcnlIb3Vyc0J1ZmZlcihkKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeyAvLyBNSUxJVEFSWSBIT1VSU1xyXG4gICAgICAgICAgICBjb2RlOiBcIkhcIixcclxuICAgICAgICAgICAgcmVnRXhwOiBcIlxcXFxkezEsMn1cIixcclxuICAgICAgICAgICAgc3RyOiAoZCkgPT4gZC5nZXRIb3VycygpLnRvU3RyaW5nKCksXHJcbiAgICAgICAgICAgIGluYzogKGQpID0+IGluY0hvdXJzKGQpLFxyXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBkZWNIb3VycyhkKSxcclxuICAgICAgICAgICAgc2V0OiAoZCwgdikgPT4gc2V0TWlsaXRhcnlIb3VycyhkLCB2KSxcclxuICAgICAgICAgICAgbWF4QnVmZmVyOiAoZCkgPT4gbWF4TWlsaXRhcnlIb3Vyc0J1ZmZlcihkKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeyAvLyBQQURERUQgSE9VUlNcclxuICAgICAgICAgICAgY29kZTogXCJoaFwiLFxyXG4gICAgICAgICAgICByZWdFeHA6IFwiXFxcXGR7MiwyfVwiLFxyXG4gICAgICAgICAgICBzdHI6IChkKSA9PiBwYWQodG9TdGFuZGFyZFRpbWUoZC5nZXRIb3VycygpKSwgMiksXHJcbiAgICAgICAgICAgIGluYzogKGQpID0+IGluY0hvdXJzKGQpLFxyXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBkZWNIb3VycyhkKSxcclxuICAgICAgICAgICAgc2V0OiAoZCwgdikgPT4gc2V0SG91cnMoZCwgdiksXHJcbiAgICAgICAgICAgIG1heEJ1ZmZlcjogKGQpID0+IG1heEhvdXJzQnVmZmVyKGQpXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7IC8vIEhPVVJTXHJcbiAgICAgICAgICAgIGNvZGU6IFwiaFwiLFxyXG4gICAgICAgICAgICByZWdFeHA6IFwiXFxcXGR7MSwyfVwiLFxyXG4gICAgICAgICAgICBzdHI6IChkKSA9PiB0b1N0YW5kYXJkVGltZShkLmdldEhvdXJzKCkpLnRvU3RyaW5nKCksXHJcbiAgICAgICAgICAgIGluYzogKGQpID0+IGluY0hvdXJzKGQpLFxyXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBkZWNIb3VycyhkKSxcclxuICAgICAgICAgICAgc2V0OiAoZCwgdikgPT4gc2V0SG91cnMoZCwgdiksXHJcbiAgICAgICAgICAgIG1heEJ1ZmZlcjogKGQpID0+IG1heEhvdXJzQnVmZmVyKGQpXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7IC8vIFVQUEVSQ0FTRSBNRVJJRElFTVxyXG4gICAgICAgICAgICBjb2RlOiBcIkFcIixcclxuICAgICAgICAgICAgcmVnRXhwOiBcIigoQU0pfChQTSkpXCIsXHJcbiAgICAgICAgICAgIHN0cjogKGQpID0+IGQuZ2V0SG91cnMoKSA8IDEyID8gXCJBTVwiIDogXCJQTVwiLFxyXG4gICAgICAgICAgICBpbmM6IChkKSA9PiBpbmNNZXJpZGllbShkKSxcclxuICAgICAgICAgICAgZGVjOiAoZCkgPT4gZGVjTWVyaWRpZW0oZCksXHJcbiAgICAgICAgICAgIHNldDogKGQsIHYpID0+IHNldE1lcmlkaWVtKGQsIHYpLFxyXG4gICAgICAgICAgICBtYXhCdWZmZXI6IChkKSA9PiAxXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7IC8vIFVQUEVSQ0FTRSBNRVJJRElFTVxyXG4gICAgICAgICAgICBjb2RlOiBcImFcIixcclxuICAgICAgICAgICAgcmVnRXhwOiBcIigoYW0pfChwbSkpXCIsXHJcbiAgICAgICAgICAgIHN0cjogKGQpID0+IGQuZ2V0SG91cnMoKSA8IDEyID8gXCJhbVwiIDogXCJwbVwiLFxyXG4gICAgICAgICAgICBpbmM6IChkKSA9PiBpbmNNZXJpZGllbShkKSxcclxuICAgICAgICAgICAgZGVjOiAoZCkgPT4gZGVjTWVyaWRpZW0oZCksXHJcbiAgICAgICAgICAgIHNldDogKGQsIHYpID0+IHNldE1lcmlkaWVtKGQsIHYpLFxyXG4gICAgICAgICAgICBtYXhCdWZmZXI6IChkKSA9PiAxXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7IC8vIFBBRERFRCBNSU5VVEVTXHJcbiAgICAgICAgICAgIGNvZGU6IFwibW1cIixcclxuICAgICAgICAgICAgcmVnRXhwOiBcIlxcXFxkezIsMn1cIixcclxuICAgICAgICAgICAgc3RyOiAoZCkgPT4gcGFkKGQuZ2V0TWludXRlcygpLCAyKSxcclxuICAgICAgICAgICAgaW5jOiAoZCkgPT4gaW5jTWludXRlcyhkKSxcclxuICAgICAgICAgICAgZGVjOiAoZCkgPT4gZGVjTWludXRlcyhkKSxcclxuICAgICAgICAgICAgc2V0OiAoZCwgdikgPT4gc2V0TWludXRlcyhkLCB2KSxcclxuICAgICAgICAgICAgbWF4QnVmZmVyOiAoZCkgPT4gbWF4TWludXRlc0J1ZmZlcihkKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeyAvLyBNSU5VVEVTXHJcbiAgICAgICAgICAgIGNvZGU6IFwibVwiLFxyXG4gICAgICAgICAgICByZWdFeHA6IFwiXFxcXGR7MSwyfVwiLFxyXG4gICAgICAgICAgICBzdHI6IChkKSA9PiBkLmdldE1pbnV0ZXMoKS50b1N0cmluZygpLFxyXG4gICAgICAgICAgICBpbmM6IChkKSA9PiBpbmNNaW51dGVzKGQpLFxyXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBkZWNNaW51dGVzKGQpLFxyXG4gICAgICAgICAgICBzZXQ6IChkLCB2KSA9PiBzZXRNaW51dGVzKGQsIHYpLFxyXG4gICAgICAgICAgICBtYXhCdWZmZXI6IChkKSA9PiBtYXhNaW51dGVzQnVmZmVyKGQpXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7IC8vIFBBRERFRCBTRUNPTkRTXHJcbiAgICAgICAgICAgIGNvZGU6IFwic3NcIixcclxuICAgICAgICAgICAgcmVnRXhwOiBcIlxcXFxkezIsMn1cIixcclxuICAgICAgICAgICAgc3RyOiAoZCkgPT4gcGFkKGQuZ2V0U2Vjb25kcygpLCAyKSxcclxuICAgICAgICAgICAgaW5jOiAoZCkgPT4gaW5jU2Vjb25kcyhkKSxcclxuICAgICAgICAgICAgZGVjOiAoZCkgPT4gZGVjU2Vjb25kcyhkKSxcclxuICAgICAgICAgICAgc2V0OiAoZCwgdikgPT4gc2V0U2Vjb25kcyhkLCB2KSxcclxuICAgICAgICAgICAgbWF4QnVmZmVyOiAoZCkgPT4gbWF4U2Vjb25kc0J1ZmZlcihkKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeyAvLyBTRUNPTkRTXHJcbiAgICAgICAgICAgIGNvZGU6IFwic1wiLFxyXG4gICAgICAgICAgICByZWdFeHA6IFwiXFxcXGR7MSwyfVwiLFxyXG4gICAgICAgICAgICBzdHI6IChkKSA9PiBkLmdldFNlY29uZHMoKS50b1N0cmluZygpLFxyXG4gICAgICAgICAgICBpbmM6IChkKSA9PiBpbmNTZWNvbmRzKGQpLFxyXG4gICAgICAgICAgICBkZWM6IChkKSA9PiBkZWNTZWNvbmRzKGQpLFxyXG4gICAgICAgICAgICBzZXQ6IChkLCB2KSA9PiBzZXRTZWNvbmRzKGQsIHYpLFxyXG4gICAgICAgICAgICBtYXhCdWZmZXI6IChkKSA9PiBtYXhTZWNvbmRzQnVmZmVyKGQpXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7IC8vIFVUQyBPRkZTRVQgV0lUSCBDT0xPTlxyXG4gICAgICAgICAgICBjb2RlOiBcIlpaXCIsXHJcbiAgICAgICAgICAgIHJlZ0V4cDogXCIoXFxcXCt8XFxcXC0pXFxcXGR7MiwyfTpcXFxcZHsyLDJ9XCIsXHJcbiAgICAgICAgICAgIHN0cjogKGQpID0+IGdldFVUQ09mZnNldChkLCB0cnVlKSAvL1RPRE8gYWRkIGFiaWxpdHkgdG8gaW5jIGFuZCBkZWMgdGhpc1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeyAvLyBVVEMgT0ZGU0VUXHJcbiAgICAgICAgICAgIGNvZGU6IFwiWlwiLFxyXG4gICAgICAgICAgICByZWdFeHA6IFwiKFxcXFwrfFxcXFwtKVxcXFxkezQsNH1cIixcclxuICAgICAgICAgICAgc3RyOiAoZCkgPT4gZ2V0VVRDT2Zmc2V0KGQsIGZhbHNlKVxyXG4gICAgICAgIH1cclxuICAgIF07XHJcbn0pKCk7XHJcblxyXG5cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIkZvcm1hdEJsb2Nrcy50c1wiIC8+XHJcblxyXG5jbGFzcyBEYXRlUGFydCB7ICAgIFxyXG4gICAgICAgIFxyXG4gICAgcHJpdmF0ZSBzdHI6KGQ6RGF0ZSkgPT4gc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSByZWdFeHBTdHJpbmc6c3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBpbmM6KGQ6RGF0ZSkgPT4gRGF0ZTtcclxuICAgIHByaXZhdGUgZGVjOihkOkRhdGUpID0+IERhdGU7XHJcbiAgICBwcml2YXRlIHNldDooZDpEYXRlLCB2OnN0cmluZ3xudW1iZXIpID0+IERhdGU7XHJcbiAgICBcclxuICAgIHByaXZhdGUgdmFsdWU6c3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBzZWxlY3RhYmxlOmJvb2xlYW47XHJcbiAgICBwcml2YXRlIG1heEJ1ZmZlcjooZDpEYXRlKSA9PiBudW1iZXI7XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKGFyZzpJRm9ybWF0QmxvY2t8U3RyaW5nLCBzZWxlY3RhYmxlT3ZlcnJpZGU6Ym9vbGVhbikge1xyXG4gICAgICAgIGlmICh0eXBlb2YgYXJnID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RyID0gKDxJRm9ybWF0QmxvY2s+YXJnKS5zdHI7XHJcbiAgICAgICAgICAgIHRoaXMuaW5jID0gKDxJRm9ybWF0QmxvY2s+YXJnKS5pbmM7XHJcbiAgICAgICAgICAgIHRoaXMuZGVjID0gKDxJRm9ybWF0QmxvY2s+YXJnKS5kZWM7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0ID0gKDxJRm9ybWF0QmxvY2s+YXJnKS5zZXQ7XHJcbiAgICAgICAgICAgIHRoaXMubWF4QnVmZmVyID0gKDxJRm9ybWF0QmxvY2s+YXJnKS5tYXhCdWZmZXI7XHJcbiAgICAgICAgICAgIHRoaXMucmVnRXhwU3RyaW5nID0gKDxJRm9ybWF0QmxvY2s+YXJnKS5yZWdFeHA7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0YWJsZSA9IHRoaXMuaW5jICE9PSB2b2lkIDAgJiYgdGhpcy5kZWMgIT09IHZvaWQgMDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gPHN0cmluZz5hcmc7XHJcbiAgICAgICAgICAgIHRoaXMucmVnRXhwU3RyaW5nID0gdGhpcy5yZWdFeHBFc2NhcGUodGhpcy52YWx1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0YWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIHNlbGVjdGFibGVPdmVycmlkZSA9PT0gXCJib29sZWFuXCIpIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RhYmxlID0gc2VsZWN0YWJsZU92ZXJyaWRlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHJlZ0V4cEVzY2FwZSA9IChzdHI6c3RyaW5nKTpzdHJpbmcgPT4ge1xyXG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZSgvW1xcLVxcW1xcXVxcL1xce1xcfVxcKFxcKVxcKlxcK1xcP1xcLlxcXFxcXF5cXCRcXHxdL2csIFwiXFxcXCQmXCIpO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGNsb25lID0gKGQ6RGF0ZSk6RGF0ZSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKGQudmFsdWVPZigpKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGluY3JlbWVudCA9IChkOkRhdGUpOkRhdGUgPT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmluYyh0aGlzLmNsb25lKGQpKTtcclxuICAgIH1cclxuICAgICAgICBcclxuICAgIHB1YmxpYyBkZWNyZW1lbnQgPSAoZDpEYXRlKTpEYXRlID0+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kZWModGhpcy5jbG9uZShkKSk7XHJcbiAgICB9ICAgICAgICAgICAgXHJcbiAgICBcclxuICAgIHB1YmxpYyBzZXRWYWx1ZSA9IChkOkRhdGUpOkRhdGVQYXJ0ID0+IHtcclxuICAgICAgICBpZiAodGhpcy5zdHIgPT09IHZvaWQgMCkgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMuc3RyKHRoaXMuY2xvbmUoZCkpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdG9TdHJpbmcgPSAoKTpzdHJpbmcgPT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnZhbHVlO1xyXG4gICAgfVxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICBwdWJsaWMgaXNTZWxlY3RhYmxlID0gKCk6Ym9vbGVhbiA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0YWJsZTtcclxuICAgIH1cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgcHVibGljIGdldFJlZ0V4cFN0cmluZyA9ICgpOnN0cmluZyA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmVnRXhwU3RyaW5nO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXREYXRlRnJvbVN0cmluZyA9IChkYXRlOkRhdGUsIHBhcnRpYWw6c3RyaW5nKTpEYXRlID0+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zZXQodGhpcy5jbG9uZShkYXRlKSwgcGFydGlhbCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRNYXhCdWZmZXJTaXplID0gKGRhdGU6RGF0ZSk6bnVtYmVyID0+IHtcclxuICAgICAgICBpZiAodGhpcy5tYXhCdWZmZXIgPT09IHZvaWQgMCkgcmV0dXJuIHZvaWQgMDtcclxuICAgICAgICByZXR1cm4gdGhpcy5tYXhCdWZmZXIodGhpcy5jbG9uZShkYXRlKSk7ICAgICAgICAgICAgICAgIFxyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIkZvcm1hdEJsb2Nrcy50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJEYXRlUGFydC50c1wiIC8+XHJcblxyXG5cclxuY2xhc3MgRGlzcGxheVBhcnNlciB7ICAgXHJcbiAgICBcclxuICAgIHB1YmxpYyBzdGF0aWMgcGFyc2UgPSAoZm9ybWF0OnN0cmluZyk6RGF0ZVBhcnRbXSA9PiB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGluZGV4ID0gMDsgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgbGV0IGluRXNjYXBlZFNlZ21lbnQgPSBmYWxzZTtcclxuICAgICAgICBsZXQgZGF0ZVBhcnRzOkRhdGVQYXJ0W10gPSBbXTtcclxuICAgICAgICBsZXQgdGV4dEJ1ZmZlciA9IFwiXCI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHB1c2hQbGFpblRleHQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0ZXh0QnVmZmVyLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGxldCBkcCA9IG5ldyBEYXRlUGFydCh0ZXh0QnVmZmVyLCB2b2lkIDApO1xyXG4gICAgICAgICAgICAgICAgZGF0ZVBhcnRzLnB1c2goZHApO1xyXG4gICAgICAgICAgICAgICAgdGV4dEJ1ZmZlciA9IFwiXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGluY3JlbWVudDpudW1iZXI7ICAgICAgICBcclxuICAgICAgICB3aGlsZSAoaW5kZXggPCBmb3JtYXQubGVuZ3RoKSB7ICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICghaW5Fc2NhcGVkU2VnbWVudCAmJiBmb3JtYXRbaW5kZXhdID09PSBcIltcIikge1xyXG4gICAgICAgICAgICAgICAgaW5Fc2NhcGVkU2VnbWVudCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaW5Fc2NhcGVkU2VnbWVudCAmJiBmb3JtYXRbaW5kZXhdID09PSBcIl1cIikge1xyXG4gICAgICAgICAgICAgICAgaW5Fc2NhcGVkU2VnbWVudCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaW5kZXgrKztcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGluRXNjYXBlZFNlZ21lbnQpIHtcclxuICAgICAgICAgICAgICAgIHRleHRCdWZmZXIgKz0gZm9ybWF0W2luZGV4XTtcclxuICAgICAgICAgICAgICAgIGluZGV4Kys7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxldCBmb3VuZCA9IGZvcm1hdEJsb2Nrcy5zb21lKChibG9jazpJRm9ybWF0QmxvY2spID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoRGlzcGxheVBhcnNlci5maW5kQXQoZm9ybWF0LCBpbmRleCwgYHske2Jsb2NrLmNvZGV9fWApKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1c2hQbGFpblRleHQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRwID0gbmV3IERhdGVQYXJ0KGJsb2NrLCBmYWxzZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZVBhcnRzLnB1c2goZHApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmNyZW1lbnQgPSBibG9jay5jb2RlLmxlbmd0aCArIDI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoRGlzcGxheVBhcnNlci5maW5kQXQoZm9ybWF0LCBpbmRleCwgYmxvY2suY29kZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHVzaFBsYWluVGV4dCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZHAgPSBuZXcgRGF0ZVBhcnQoYmxvY2ssIHZvaWQgMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGVQYXJ0cy5wdXNoKGRwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5jcmVtZW50ID0gYmxvY2suY29kZS5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZiAoZm91bmQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbmRleCArPSBpbmNyZW1lbnQ7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRleHRCdWZmZXIgKz0gZm9ybWF0W2luZGV4XTtcclxuICAgICAgICAgICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1c2hQbGFpblRleHQoKTtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gZGF0ZVBhcnRzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHN0YXRpYyBmaW5kQXQgPSAoc3RyOnN0cmluZywgaW5kZXg6bnVtYmVyLCBzZWFyY2g6c3RyaW5nKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHN0ci5zbGljZShpbmRleCwgaW5kZXggKyBzZWFyY2gubGVuZ3RoKSA9PT0gc2VhcmNoO1xyXG4gICAgfVxyXG59XHJcbiIsImNsYXNzIE1vdXNlRXZlbnRzIHtcclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgaW5wdXQ6RGF0ZXBpY2tlcklucHV0KSB7XHJcbiAgICAgICAgaW5wdXQuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMubW91c2Vkb3duKTtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNldXApO1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaHN0YXJ0XCIsIHRoaXMudG91Y2hzdGFydCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gU3RvcCBkZWZhdWx0XHJcbiAgICAgICAgaW5wdXQuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ2VudGVyXCIsIChlKSA9PiBlLnByZXZlbnREZWZhdWx0KCkpO1xyXG4gICAgICAgIGlucHV0LmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdvdmVyXCIsIChlKSA9PiBlLnByZXZlbnREZWZhdWx0KCkpO1xyXG4gICAgICAgIGlucHV0LmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImRyb3BcIiwgKGUpID0+IGUucHJldmVudERlZmF1bHQoKSk7XHJcbiAgICAgICAgaW5wdXQuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY3V0XCIsIChlKSA9PiBlLnByZXZlbnREZWZhdWx0KCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFRvdWNoIGRldmljZXMgbmVlZCB0aGlzIGhhbmRsZWQgaW4gYSBkaWZmZXJlbnQgd2F5XHJcbiAgICAgICAgdGhpcy5pbnRlcnZhbCA9IHNldEludGVydmFsKHRoaXMuaGFuZGxlU2VsZWN0aW9uT25Ub3VjaCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgaW50ZXJ2YWw6bnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBkb3duOmJvb2xlYW47XHJcbiAgICBwcml2YXRlIGNhcmV0U3RhcnQ6bnVtYmVyO1xyXG4gICAgXHJcbiAgICBwcml2YXRlIG1vdXNlZG93biA9ICgpID0+IHtcclxuICAgICAgICAvLyBNb3VzZSBldmVudCB0cmlnZ2VyZWQgLSBnZXQgcmlkIG9mIHRvdWNoIGhhbmRsZXJcclxuICAgICAgICBjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWwpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuZG93biA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5lbGVtZW50LnNldFNlbGVjdGlvblJhbmdlKHZvaWQgMCwgdm9pZCAwKTtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5jYXJldFN0YXJ0ID0gdGhpcy5pbnB1dC5lbGVtZW50LnNlbGVjdGlvblN0YXJ0O1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBtb3VzZXVwID0gKCkgPT4ge1xyXG4gICAgICAgIGlmICghdGhpcy5kb3duKSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5kb3duID0gZmFsc2U7XHJcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuaW5wdXQuZWxlbWVudC5zZWxlY3Rpb25TdGFydCA9PT0gdGhpcy5jYXJldFN0YXJ0ID8gdGhpcy5pbnB1dC5lbGVtZW50LnNlbGVjdGlvbkVuZCA6IHRoaXMuaW5wdXQuZWxlbWVudC5zZWxlY3Rpb25TdGFydDtcclxuICAgICAgICB0aGlzLmlucHV0LnNlbGVjdGVkSW5kZXggPSB0aGlzLmlucHV0LmdldE5lYXJlc3RTZWxlY3RhYmxlSW5kZXgocG9zKTtcclxuICAgICAgICBpZiAodGhpcy5pbnB1dC5lbGVtZW50LnNlbGVjdGlvblN0YXJ0ID4gMCB8fCB0aGlzLmlucHV0LmVsZW1lbnQuc2VsZWN0aW9uRW5kIDwgdGhpcy5pbnB1dC5lbGVtZW50LnZhbHVlLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0LnVwZGF0ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBcclxuICAgIHByaXZhdGUgdG91Y2hzdGFydCA9ICgpID0+IHtcclxuICAgICAgICB0aGlzLmlucHV0LmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm1vdXNlZG93bik7XHJcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZXVwKTtcclxuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwidG91Y2hzdGFydFwiLCB0aGlzLnRvdWNoc3RhcnQpO1xyXG4gICAgfTtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBsYXN0U3RhcnQ6bnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBsYXN0RW5kOm51bWJlcjtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBoYW5kbGVTZWxlY3Rpb25PblRvdWNoID0gKCkgPT4ge1xyXG4gICAgICAgIGlmICghdGhpcy5pbnB1dC5wYXN0aW5nICYmXHJcbiAgICAgICAgICAgICh0aGlzLmlucHV0LmVsZW1lbnQuc2VsZWN0aW9uU3RhcnQgIT09IDAgfHxcclxuICAgICAgICAgICAgIHRoaXMuaW5wdXQuZWxlbWVudC5zZWxlY3Rpb25FbmQgIT09IHRoaXMuaW5wdXQuZWxlbWVudC52YWx1ZS5sZW5ndGgpICYmXHJcbiAgICAgICAgICAgICh0aGlzLmlucHV0LmVsZW1lbnQuc2VsZWN0aW9uU3RhcnQgIT09IHRoaXMubGFzdFN0YXJ0IHx8XHJcbiAgICAgICAgICAgICB0aGlzLmlucHV0LmVsZW1lbnQuc2VsZWN0aW9uRW5kICE9PSB0aGlzLmxhc3RFbmQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBwb3MgPSB0aGlzLmlucHV0LmVsZW1lbnQuc2VsZWN0aW9uU3RhcnQgKyAodGhpcy5pbnB1dC5lbGVtZW50LnNlbGVjdGlvbkVuZCAtIHRoaXMuaW5wdXQuZWxlbWVudC5zZWxlY3Rpb25TdGFydCkgLyAyO1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0LnNlbGVjdGVkSW5kZXggPSB0aGlzLmlucHV0LmdldE5lYXJlc3RTZWxlY3RhYmxlSW5kZXgocG9zKTtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC51cGRhdGUoKVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmxhc3RTdGFydCA9IHRoaXMuaW5wdXQuZWxlbWVudC5zZWxlY3Rpb25TdGFydDtcclxuICAgICAgICB0aGlzLmxhc3RFbmQgPSB0aGlzLmlucHV0LmVsZW1lbnQuc2VsZWN0aW9uRW5kO1xyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIkZvcm1hdEJsb2Nrcy50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJEYXRlUGFydC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJEaXNwbGF5UGFyc2VyLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIk1vdXNlRXZlbnRzLnRzXCIgLz5cclxuXHJcbig8YW55PndpbmRvdylbXCJEYXRpdW1cIl0gPSBjbGFzcyBEYXRpdW0ge1xyXG4gICAgY29uc3RydWN0b3Iob3B0czpJT3B0aW9ucykge1xyXG4gICAgICAgIG5ldyBEYXRlcGlja2VySW5wdXQob3B0c1snZWxlbWVudCddLCBvcHRzWydkaXNwbGF5QXMnXSk7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbn1cclxuXHJcbmNvbnN0IGVudW0gS2V5Q29kZXMge1xyXG4gICAgUklHSFQgPSAzOSwgTEVGVCA9IDM3LCBUQUIgPSA5LCBVUCA9IDM4LFxyXG4gICAgRE9XTiA9IDQwLCBWID0gODYsIEMgPSA2NywgQSA9IDY1LCBIT01FID0gMzYsXHJcbiAgICBFTkQgPSAzNSwgQkFDS1NQQUNFID0gOFxyXG59XHJcblxyXG5jbGFzcyBEYXRlcGlja2VySW5wdXQge1xyXG4gICAgXHJcbiAgICBwdWJsaWMgc2VsZWN0ZWRJbmRleDpudW1iZXI7XHJcbiAgICBwcml2YXRlIGN1ckRhdGU6RGF0ZTtcclxuICAgIHByaXZhdGUgZGF0ZVBhcnRzOkRhdGVQYXJ0W107XHJcbiAgICBcclxuICAgIHByaXZhdGUgZGF0ZVN0cmluZ1JlZ0V4cDpSZWdFeHA7XHJcbiAgICBcclxuICAgIHByaXZhdGUgc2VsZWN0aW5nOmJvb2xlYW4gPSBmYWxzZTtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBzaGlmdFRhYkRvd24gPSBmYWxzZTtcclxuICAgIHByaXZhdGUgdGFiRG93biA9IGZhbHNlO1xyXG4gICAgcHVibGljIHBhc3Rpbmc6Ym9vbGVhbiA9IGZhbHNlO1xyXG4gICAgXHJcbiAgICBwcml2YXRlIHRleHRCdWZmZXI6c3RyaW5nID0gXCJcIjtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IocHVibGljIGVsZW1lbnQ6SFRNTElucHV0RWxlbWVudCwgcHJpdmF0ZSBkaXNwbGF5QXM6c3RyaW5nLCBwcml2YXRlIG1pbkRhdGU/OkRhdGUsIHByaXZhdGUgbWF4RGF0ZT86RGF0ZSkge1xyXG4gICAgICAgIHRoaXMuZGF0ZVBhcnRzID0gRGlzcGxheVBhcnNlci5wYXJzZShkaXNwbGF5QXMpO1xyXG4gICAgICAgIHRoaXMuZGF0ZVN0cmluZ1JlZ0V4cCA9IHRoaXMuY29uY2F0UmVnRXhwKHRoaXMuZGF0ZVBhcnRzKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmJpbmRFdmVudHMoKTtcclxuICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShcInNwZWxsY2hlY2tcIiwgXCJmYWxzZVwiKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZShuZXcgRGF0ZSgpKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBjb25jYXRSZWdFeHAgPSAoZGF0ZVBhcnRzOkRhdGVQYXJ0W10pOlJlZ0V4cCA9PiB7XHJcbiAgICAgICAgbGV0IHJlZ0V4cCA9IFwiXCI7XHJcbiAgICAgICAgZGF0ZVBhcnRzLmZvckVhY2goKGRhdGVQYXJ0KSA9PiB7XHJcbiAgICAgICAgICAgcmVnRXhwICs9IGRhdGVQYXJ0LmdldFJlZ0V4cFN0cmluZygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBuZXcgUmVnRXhwKGBeJHtyZWdFeHB9JGAsIFwiaVwiKTsgICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGJpbmRFdmVudHMgPSAoKTp2b2lkID0+IHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImZvY3VzXCIsICgpID0+IHRoaXMuZm9jdXMoKSk7XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoZSkgPT4gdGhpcy5rZXlkb3duKGUpKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInBhc3RlXCIsICgpID0+IHRoaXMucGFzdGUoKSk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIChlOktleWJvYXJkRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKGUuc2hpZnRLZXkgJiYgZS5rZXlDb2RlID09PSBLZXlDb2Rlcy5UQUIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hpZnRUYWJEb3duID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChlLmtleUNvZGUgPT09IEtleUNvZGVzLlRBQikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy50YWJEb3duID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgdGhpcy5zaGlmdFRhYkRvd24gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgdGhpcy50YWJEb3duID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIG5ldyBNb3VzZUV2ZW50cyh0aGlzKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBwYXN0ZSA9ICgpOnZvaWQgPT4ge1xyXG4gICAgICAgIHRoaXMucGFzdGluZyA9IHRydWU7XHJcbiAgICAgICAgbGV0IG9yaWdpbmFsVmFsdWUgPSB0aGlzLmVsZW1lbnQudmFsdWU7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5kYXRlU3RyaW5nUmVnRXhwLnRlc3QodGhpcy5lbGVtZW50LnZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnZhbHVlID0gb3JpZ2luYWxWYWx1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFzdGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBuZXdEYXRlID0gbmV3IERhdGUodGhpcy5jdXJEYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgICAgIGxldCBzdHJQcmVmaXggPSBcIlwiO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGVQYXJ0cy5mb3JFYWNoKChkYXRlUGFydCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IHZhbCA9IHRoaXMuZWxlbWVudC52YWx1ZS5yZXBsYWNlKHN0clByZWZpeCwgXCJcIikubWF0Y2goZGF0ZVBhcnQuZ2V0UmVnRXhwU3RyaW5nKCkpWzBdO1xyXG4gICAgICAgICAgICAgICAgc3RyUHJlZml4ICs9IHZhbDtcclxuICAgICAgICAgICAgICAgIGlmICghZGF0ZVBhcnQuaXNTZWxlY3RhYmxlKCkpIHJldHVybjtcclxuICAgICAgICAgICAgICAgIG5ld0RhdGUgPSBkYXRlUGFydC5nZXREYXRlRnJvbVN0cmluZyhuZXdEYXRlLCB2YWwpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGUobmV3RGF0ZSk7XHJcbiAgICAgICAgICAgIHRoaXMucGFzdGluZyA9IGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGtleWRvd24gPSAoZTpLZXlib2FyZEV2ZW50KTp2b2lkID0+IHtcclxuICAgICAgICBpZiAoKGUua2V5Q29kZSA9PT0gS2V5Q29kZXMuSE9NRSB8fCBlLmtleUNvZGUgPT09IEtleUNvZGVzLkVORCkgJiYgZS5zaGlmdEtleSkgcmV0dXJuO1xyXG4gICAgICAgIGlmIChlLmtleUNvZGUgPT09IEtleUNvZGVzLkMgJiYgZS5jdHJsS2V5KSByZXR1cm47XHJcbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gS2V5Q29kZXMuQSAmJiBlLmN0cmxLZXkpIHJldHVybjtcclxuICAgICAgICBpZiAoZS5rZXlDb2RlID09PSBLZXlDb2Rlcy5WICYmIGUuY3RybEtleSkgcmV0dXJuO1xyXG4gICAgICAgIGlmICgoZS5rZXlDb2RlID09PSBLZXlDb2Rlcy5MRUZUIHx8IGUua2V5Q29kZSA9PT0gS2V5Q29kZXMuUklHSFQpICYmIGUuc2hpZnRLZXkpIHJldHVybjtcclxuXHJcbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gS2V5Q29kZXMuSE9NRSkge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkSW5kZXggPSB0aGlzLmdldEZpcnN0U2VsZWN0YWJsZSgpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChlLmtleUNvZGUgPT09IEtleUNvZGVzLkVORCkge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkSW5kZXggPSB0aGlzLmdldExhc3RTZWxlY3RhYmxlKCk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGUua2V5Q29kZSA9PT0gS2V5Q29kZXMuTEVGVCkge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkSW5kZXggPSB0aGlzLmdldFByZXZpb3VzU2VsZWN0YWJsZSgpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChlLnNoaWZ0S2V5ICYmIGUua2V5Q29kZSA9PT0gS2V5Q29kZXMuVEFCKSB7XHJcbiAgICAgICAgICAgIGxldCBwcmV2aW91c1NlbGVjdGFibGUgPSB0aGlzLmdldFByZXZpb3VzU2VsZWN0YWJsZSgpO1xyXG4gICAgICAgICAgICBpZiAocHJldmlvdXNTZWxlY3RhYmxlICE9PSB0aGlzLnNlbGVjdGVkSW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9IHByZXZpb3VzU2VsZWN0YWJsZTtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKGUua2V5Q29kZSA9PT0gS2V5Q29kZXMuUklHSFQpIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEluZGV4ID0gdGhpcy5nZXROZXh0U2VsZWN0YWJsZSgpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChlLmtleUNvZGUgPT09IEtleUNvZGVzLlRBQikge1xyXG4gICAgICAgICAgICBsZXQgbmV4dFNlbGVjdGFibGUgPSB0aGlzLmdldE5leHRTZWxlY3RhYmxlKCk7XHJcbiAgICAgICAgICAgIGlmIChuZXh0U2VsZWN0YWJsZSAhPT0gdGhpcy5zZWxlY3RlZEluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkSW5kZXggPSBuZXh0U2VsZWN0YWJsZTtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKGUua2V5Q29kZSA9PT0gS2V5Q29kZXMuVVApIHtcclxuICAgICAgICAgICAgbGV0IG5ld0RhdGUgPSB0aGlzLmRhdGVQYXJ0c1t0aGlzLnNlbGVjdGVkSW5kZXhdLmluY3JlbWVudCh0aGlzLmN1ckRhdGUpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZShuZXdEYXRlKTtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZS5rZXlDb2RlID09PSBLZXlDb2Rlcy5ET1dOKSB7XHJcbiAgICAgICAgICAgIGxldCBuZXdEYXRlID0gdGhpcy5kYXRlUGFydHNbdGhpcy5zZWxlY3RlZEluZGV4XS5kZWNyZW1lbnQodGhpcy5jdXJEYXRlKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGUobmV3RGF0ZSk7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQga2V5UHJlc3NlZCA9ICg8YW55PntcclxuICAgICAgICAgICAgXCI0OFwiOiBcIjBcIiwgXCI5NlwiOiBcIjBcIiwgXCI0OVwiOiBcIjFcIiwgXCI5N1wiOiBcIjFcIixcclxuICAgICAgICAgICAgXCI1MFwiOiBcIjJcIiwgXCI5OFwiOiBcIjJcIiwgXCI1MVwiOiBcIjNcIiwgXCI5OVwiOiBcIjNcIixcclxuICAgICAgICAgICAgXCI1MlwiOiBcIjRcIiwgXCIxMDBcIjogXCI0XCIsIFwiNTNcIjogXCI1XCIsIFwiMTAxXCI6IFwiNVwiLFxyXG4gICAgICAgICAgICBcIjU0XCI6IFwiNlwiLCBcIjEwMlwiOiBcIjZcIiwgXCI1NVwiOiBcIjdcIiwgXCIxMDNcIjogXCI3XCIsXHJcbiAgICAgICAgICAgIFwiNTZcIjogXCI4XCIsIFwiMTA0XCI6IFwiOFwiLCBcIjU3XCI6IFwiOVwiLCBcIjEwNVwiOiBcIjlcIixcclxuICAgICAgICAgICAgXCI2NVwiOiBcImFcIiwgXCI2NlwiOiBcImJcIiwgXCI2N1wiOiBcImNcIiwgXCI2OFwiOiBcImRcIixcclxuICAgICAgICAgICAgXCI2OVwiOiBcImVcIiwgXCI3MFwiOiBcImZcIiwgXCI3MVwiOiBcImdcIiwgXCI3MlwiOiBcImhcIixcclxuICAgICAgICAgICAgXCI3M1wiOiBcImlcIiwgXCI3NFwiOiBcImpcIiwgXCI3NVwiOiBcImtcIiwgXCI3NlwiOiBcImxcIixcclxuICAgICAgICAgICAgXCI3N1wiOiBcIm1cIiwgXCI3OFwiOiBcIm5cIiwgXCI3OVwiOiBcIm9cIiwgXCI4MFwiOiBcInBcIixcclxuICAgICAgICAgICAgXCI4MVwiOiBcInFcIiwgXCI4MlwiOiBcInJcIiwgXCI4M1wiOiBcInNcIiwgXCI4NFwiOiBcInRcIixcclxuICAgICAgICAgICAgXCI4NVwiOiBcInVcIiwgXCI4NlwiOiBcInZcIiwgXCI4N1wiOiBcIndcIiwgXCI4OFwiOiBcInhcIixcclxuICAgICAgICAgICAgXCI4OVwiOiBcInlcIiwgXCI5MFwiOiBcInpcIlxyXG4gICAgICAgIH0pW2Uua2V5Q29kZV07XHJcblxyXG4gICAgICAgIGlmIChlLmtleUNvZGUgPT09IEtleUNvZGVzLkJBQ0tTUEFDRSkge1xyXG4gICAgICAgICAgICB0aGlzLmJhY2tzcGFjZSgpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoa2V5UHJlc3NlZCAhPT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGV4dEJ1ZmZlciArPSBrZXlQcmVzc2VkO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoIWUuc2hpZnRLZXkpIHtcclxuICAgICAgICAgICAgdGhpcy50ZXh0QnVmZmVyID0gXCJcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnRleHRCdWZmZXIubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBsZXQgb3JpZyA9IHRoaXMuY3VyRGF0ZS52YWx1ZU9mKCk7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSB0aGlzLmRhdGVQYXJ0c1t0aGlzLnNlbGVjdGVkSW5kZXhdLmdldERhdGVGcm9tU3RyaW5nKHRoaXMuY3VyRGF0ZSwgdGhpcy50ZXh0QnVmZmVyKTtcclxuICAgICAgICAgICAgaWYgKHJlc3VsdCAhPT0gdm9pZCAwICYmIHRoaXMuZGF0ZVBhcnRzW3RoaXMuc2VsZWN0ZWRJbmRleF0uZ2V0TWF4QnVmZmVyU2l6ZShyZXN1bHQpICE9PSB2b2lkIDAgJiYgdGhpcy50ZXh0QnVmZmVyLmxlbmd0aCA+PSB0aGlzLmRhdGVQYXJ0c1t0aGlzLnNlbGVjdGVkSW5kZXhdLmdldE1heEJ1ZmZlclNpemUocmVzdWx0KSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG5leHQgPSB0aGlzLmdldE5leHRTZWxlY3RhYmxlKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAobmV4dCA9PT0gdGhpcy5zZWxlY3RlZEluZGV4KSB0aGlzLnRleHRCdWZmZXIgPSAnJztcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9IG5leHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHJlc3VsdCA9PT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRleHRCdWZmZXIgPSB0aGlzLnRleHRCdWZmZXIuc2xpY2UoMCwgdGhpcy50ZXh0QnVmZmVyLmxlbmd0aCAtIDEpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGUocmVzdWx0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgXHJcbiAgICBwcml2YXRlIGJhY2tzcGFjZSA9ICgpID0+IHtcclxuICAgICAgICBpZiAodGhpcy50ZXh0QnVmZmVyLmxlbmd0aCA8IDIpIHtcclxuICAgICAgICAgICAgbGV0IG9yaWcgPSB0aGlzLmN1ckRhdGUudmFsdWVPZigpO1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gdGhpcy5kYXRlUGFydHNbdGhpcy5zZWxlY3RlZEluZGV4XS5nZXREYXRlRnJvbVN0cmluZyh0aGlzLmN1ckRhdGUsIFwiWkVST19PVVRcIik7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQudmFsdWVPZigpICE9PSBvcmlnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZShyZXN1bHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudGV4dEJ1ZmZlciA9IHRoaXMudGV4dEJ1ZmZlci5zbGljZSgwLCB0aGlzLnRleHRCdWZmZXIubGVuZ3RoIC0gMSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRQcmV2aW91c1NlbGVjdGFibGUgPSAoKTpudW1iZXIgPT4ge1xyXG4gICAgICAgIGxldCBpbmRleCA9IHRoaXMuc2VsZWN0ZWRJbmRleDtcclxuICAgICAgICB3aGlsZSAoLS1pbmRleCA+PSAwKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGVQYXJ0c1tpbmRleF0uaXNTZWxlY3RhYmxlKCkpIHJldHVybiBpbmRleDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWRJbmRleDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldE5leHRTZWxlY3RhYmxlID0gKCk6bnVtYmVyID0+IHtcclxuICAgICAgICBsZXQgaW5kZXggPSB0aGlzLnNlbGVjdGVkSW5kZXg7XHJcbiAgICAgICAgd2hpbGUgKCsraW5kZXggPCB0aGlzLmRhdGVQYXJ0cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZGF0ZVBhcnRzW2luZGV4XS5pc1NlbGVjdGFibGUoKSkgcmV0dXJuIGluZGV4O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZEluZGV4O1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBwdWJsaWMgZ2V0TmVhcmVzdFNlbGVjdGFibGVJbmRleCA9IChjYXJldFBvc2l0aW9uOm51bWJlcik6bnVtYmVyID0+IHtcclxuICAgICAgICBsZXQgcG9zID0gMDtcclxuICAgICAgICBsZXQgbmVhcmVzdFNlbGVjdGFibGVJbmRleDpudW1iZXI7XHJcbiAgICAgICAgbGV0IG5lYXJlc3RTZWxlY3RhYmxlRGlzdGFuY2U6bnVtYmVyO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5kYXRlUGFydHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZGF0ZVBhcnRzW2ldLmlzU2VsZWN0YWJsZSgpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZnJvbUxlZnQgPSBjYXJldFBvc2l0aW9uIC0gcG9zO1xyXG4gICAgICAgICAgICAgICAgbGV0IGZyb21SaWdodCA9IGNhcmV0UG9zaXRpb24gLSAocG9zICsgdGhpcy5kYXRlUGFydHNbaV0udG9TdHJpbmcoKS5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGZyb21MZWZ0ID4gMCAmJiBmcm9tUmlnaHQgPCAwKSByZXR1cm4gaTtcclxuICAgICAgICAgICAgICAgIGxldCBkaXN0ID0gTWF0aC5taW4oTWF0aC5hYnMoZnJvbUxlZnQpLCBNYXRoLmFicyhmcm9tUmlnaHQpKTtcclxuICAgICAgICAgICAgICAgIGlmIChuZWFyZXN0U2VsZWN0YWJsZUluZGV4ID09IHZvaWQgMCB8fCBkaXN0IDw9IG5lYXJlc3RTZWxlY3RhYmxlRGlzdGFuY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBuZWFyZXN0U2VsZWN0YWJsZUluZGV4ID0gaTtcclxuICAgICAgICAgICAgICAgICAgICBuZWFyZXN0U2VsZWN0YWJsZURpc3RhbmNlID0gZGlzdDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwb3MgKz0gdGhpcy5kYXRlUGFydHNbaV0udG9TdHJpbmcoKS5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZWFyZXN0U2VsZWN0YWJsZUluZGV4O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZm9jdXMgPSAoKTp2b2lkID0+IHtcclxuICAgICAgICBpZiAodGhpcy50YWJEb3duKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9IHRoaXMuZ2V0Rmlyc3RTZWxlY3RhYmxlKCk7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc2hpZnRUYWJEb3duKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9IHRoaXMuZ2V0TGFzdFNlbGVjdGFibGUoKTtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldEZpcnN0U2VsZWN0YWJsZSA9ICgpOm51bWJlciA9PiB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmRhdGVQYXJ0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kYXRlUGFydHNbaV0uaXNTZWxlY3RhYmxlKCkpIHJldHVybiBpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdm9pZCAwO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0TGFzdFNlbGVjdGFibGU9ICgpOm51bWJlciA9PiB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IHRoaXMuZGF0ZVBhcnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGVQYXJ0c1tpXS5pc1NlbGVjdGFibGUoKSkgcmV0dXJuIGk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2b2lkIDA7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHByaXZhdGUgbGFzdFNlbGVjdGVkSW5kZXg6bnVtYmVyO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHBhcmFtIHtEYXRlPX0gZGF0ZSAob3B0aW9uYWwpLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgdXBkYXRlID0gKGRhdGU/OkRhdGUpOnZvaWQgPT4ge1xyXG4gICAgICAgIGlmIChkYXRlID09PSB2b2lkIDApIGRhdGUgPSB0aGlzLmN1ckRhdGU7XHJcbiAgICAgICAgaWYgKHRoaXMubWluRGF0ZSAhPT0gdm9pZCAwICYmIGRhdGUudmFsdWVPZigpIDwgdGhpcy5taW5EYXRlLnZhbHVlT2YoKSkgZGF0ZSA9IG5ldyBEYXRlKHRoaXMubWluRGF0ZS52YWx1ZU9mKCkpO1xyXG4gICAgICAgIGlmICh0aGlzLm1heERhdGUgIT09IHZvaWQgMCAmJiBkYXRlLnZhbHVlT2YoKSA8IHRoaXMubWF4RGF0ZS52YWx1ZU9mKCkpIGRhdGUgPSBuZXcgRGF0ZSh0aGlzLm1heERhdGUudmFsdWVPZigpKTtcclxuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZEluZGV4ICE9PSB0aGlzLmxhc3RTZWxlY3RlZEluZGV4KSB7XHJcbiAgICAgICAgICAgIHRoaXMudGV4dEJ1ZmZlciA9IFwiXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMubGFzdFNlbGVjdGVkSW5kZXggPSB0aGlzLnNlbGVjdGVkSW5kZXg7XHJcblxyXG4gICAgICAgIHRoaXMuY3VyRGF0ZSA9IG5ldyBEYXRlKGRhdGUudmFsdWVPZigpKTtcclxuICAgICAgICBsZXQgZGF0ZVN0cmluZyA9IFwiXCI7XHJcblxyXG4gICAgICAgIHRoaXMuZGF0ZVBhcnRzLmZvckVhY2goKGRhdGVQYXJ0KSA9PiB7XHJcbiAgICAgICAgICAgIGRhdGVTdHJpbmcgKz0gZGF0ZVBhcnQuc2V0VmFsdWUoZGF0ZSkudG9TdHJpbmcoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnZhbHVlID0gZGF0ZVN0cmluZztcclxuICAgICAgICB0aGlzLnVwZGF0ZVNlbGVjdGlvbigpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgdXBkYXRlU2VsZWN0aW9uID0gKCk6dm9pZCA9PiB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRJbmRleCA9PT0gdm9pZCAwIHx8IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IHRoaXMuZWxlbWVudCkgcmV0dXJuO1xyXG4gICAgICAgIGxldCBzdGFydCA9IDA7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNlbGVjdGVkSW5kZXg7IGkrKykge1xyXG4gICAgICAgICAgICBzdGFydCArPSB0aGlzLmRhdGVQYXJ0c1tpXS50b1N0cmluZygpLmxlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGVuZCA9IHN0YXJ0ICsgdGhpcy5kYXRlUGFydHNbdGhpcy5zZWxlY3RlZEluZGV4XS50b1N0cmluZygpLmxlbmd0aDtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc2V0U2VsZWN0aW9uUmFuZ2Uoc3RhcnQsIGVuZCk7XHJcbiAgICB9XHJcbn0iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
