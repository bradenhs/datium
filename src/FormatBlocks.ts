interface IFormatBlock {
    code:string;
    str(d:Date):string;
    regExp?:string;
    // leaving inc, dec and set unset will make the block unselectable
    inc?(d:Date):Date;
    dec?(d:Date):Date;
    set?(d:Date, v:string|number):Date;
    maxBuffer?(d:Date):number;
}

let formatBlocks:IFormatBlock[] = (function() {
    
    const monthNames:string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames:string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    function setSeconds(d:Date, seconds:string|number):Date {
        let num:number;
        if (seconds === 'ZERO_OUT') {
            d.setSeconds(0);
            return d;
        } else if (typeof seconds === 'string' && /^\d+$/.test(seconds)) {
            num = parseInt(<string>seconds, 10);
        } else if (typeof seconds === 'number') {
            num = seconds;
        } else {
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
    
    function incSeconds(d:Date):Date {
        let n = d.getSeconds() + 1;
        return setSeconds(d, n > 59 ? 0 : n);
    }
    
    function decSeconds(d:Date):Date {
        let n = d.getSeconds() - 1;
        return setSeconds(d, n < 0 ? 59 : n);
    }
    
    function setMinutes(d:Date, minutes:string|number):Date {
        let num:number;
        if (minutes === 'ZERO_OUT') {
            d.setMinutes(0);
            return d;
        } else if (typeof minutes === 'string' && /^\d+$/.test(minutes)) {
            num = parseInt(<string>minutes, 10);
        } else if (typeof minutes === 'number') {
            num = minutes;
        } else {
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
    
    function incMinutes(d:Date):Date {
        let n = d.getMinutes() + 1;
        return setMinutes(d, n > 59 ? 0 : n);
    }
    
    function decMinutes(d:Date):Date {
        let n = d.getMinutes() - 1;
        return setMinutes(d, n < 0 ? 59 : n);
    }
    
    function setHours(d:Date, hours:string|number):Date {
        let num:number;
        let meridiem = d.getHours() > 11 ? 'PM' : 'AM';
        
        if (hours === 'ZERO_OUT') {
            d.setHours(meridiem === 'AM' ? 0 : 12);
            return d;
        } else if (typeof hours === 'string' && /^\d+$/.test(hours)) {
            num = parseInt(<string>hours, 10);
        } else if (typeof hours === 'number') {
            num = hours;
        } else {
            d = void 0;
            return d;
        }
        if (num === 0) num = 1;
        if (num < 1 || num > 12) {
            d = void 0;
            return d;
        }
        
        if (num === 12 && meridiem === 'AM') {
            num = 0;
        }
        if (num !== 12 && meridiem === 'PM') {
            num += 12;
        }
        d.setHours(num);
        return d;
    }
    
    function incHours(d:Date):Date {
        let n = d.getHours() + 1;
        return setHours(d, n > 23 ? 0 : n);
    }
    
    function decHours(d:Date):Date {
        let n = d.getHours() - 1;
        return setHours(d, n < 0 ? 23 : n);
    }
    
    function setMilitaryHours(d:Date, hours:string|number):Date {
        let num:number;
        if (hours === 'ZERO_OUT') {
            d.setHours(0);
            return d;
        } else if (typeof hours === 'string' && /^\d+$/.test(hours)) {
            num = parseInt(<string>hours, 10);
        } else if (typeof hours === 'number') {
            num = hours;
        } else {
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
        } else {
            d.setHours(num);
        }
        return d;
    }
    
    function setDate(d:Date, date:string|number):Date {
        let num:number;
        if (date === 'ZERO_OUT') {
            d.setDate(1);
            return d;
        } else if (typeof date === 'string' && /\d{1,2}.*$/.test(date)) {
            num = parseInt(<string>date, 10);
        } else if  (typeof date === 'number') {
            num = date;
        } else {
            d = void 0;
            return d;
        }
        if (num === 0) num = 1;
        if (num < 1 || num > daysInMonth(d)) {
            d = void 0;
            return d;
        }
        d.setDate(num);
        return d;
    }
    
    function incDate(d:Date):Date {
        let n = d.getDate() + 1;
        return setDate(d, n > daysInMonth(d) ? 1 : n);
    }
    
    function decDate(d:Date):Date {
        let n = d.getDate() - 1;
        return setDate(d, n < 0 ? daysInMonth(d) : n);
    }
    
    function setDay(d:Date, day:string|number):Date {
        let num:number;
        if (day === 'ZERO_OUT') {
            return setDay(d, 0);
        } else if (typeof day === 'number') {
            num = day;
        } else if (typeof day === 'string' && dayNames.some((dayName) => {
            if (new RegExp(`^${day}.*$`, 'i').test(dayName)) {
                num = dayNames.indexOf(dayName);
                return true;
            }
        })) {
        } else {
            d = void 0;
            return d;
        }
        
        if (num < 0 || num > 6) {
            d = void 0;
            return d;
        }
        
        let offset = d.getDay() - num;
        d.setDate(d.getDate() - offset);
        return d;
    }
    
    function incDay(d:Date):Date {
        let n = d.getDay() + 1;
        return setDay(d, n > 6 ? 0 : n);
    }
    
    function decDay(d:Date):Date {
        let n = d.getDay() - 1;
        return setDay(d, n < 0 ? 6 : n);
    }
    
    function setMonth(d:Date, month:string|number):Date {
        let num:number;
        if (month === 'ZERO_OUT') {
            d.setMonth(0);
            return d;
        } else if (typeof month === 'string' && /^\d+$/.test(month)) {
            num = parseInt(month, 10);
        } else if (typeof month === 'number') {
            num = month;
        } else {
            d = void 0;
            return d;
        }
        
        if (num === 0) num = 1;
        if (num < 1 || num > 12) {
            d = void 0;
            return d;
        }
        
        d.setMonth(num - 1);
        return d;
    }
    
    function incMonth(d:Date):Date {
        let n = d.getMonth() + 2;
        return setDay(d, n > 12 ? 1 : n);
    }
    
    function decMonth(d:Date):Date {
        let n = d.getMonth();
        return setDay(d, n < 1 ? 12 : n);
    }
    
    function setMonthString(d:Date, month:string|number):Date {
        let num:number;
        
        if (month === 'ZERO_OUT') {
            d.setMonth(0);
            return d;
        } else if (typeof month === 'string' && monthNames.some((monthName) => {
            if (new RegExp(`^${month}.*$`, 'i').test(monthName)) {
                num = monthNames.indexOf(monthName) + 1;
                return true;
            }
        })) {
        } else {
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
    
    function setYear(d:Date, year:string|number):Date {
        let num:number;
        if (year === 'ZERO_OUT') {
            d.setFullYear(0);
            return d;
        } else if (typeof year === 'string' && /^\d+$/.test(year)) {
            num = parseInt(year, 10);
        } else if (typeof year === 'number') {
            num = year;
        } else {
            d = void 0;
            return d;
        }        
        d.setFullYear(num);
        return d;
    }
    
    function setTwoDigitYear(d:Date, year:string|number):Date {
        let base = Math.floor(d.getFullYear()/100)*100;
        let num:number;
        if (year === 'ZERO_OUT') {
            d.setFullYear(base);
            return d;
        } else if (typeof year === 'string' && /^\d+$/.test(year)) {
            num = parseInt(year, 10);
        } else if (typeof year === 'number') {
            num = year;
        } else {
            d = void 0;
            return d;
        }        
        d.setFullYear(base + num);
        return d;
    }
    
    function setUnixSecondTimestamp(d:Date, seconds:string|number):Date {
        let num:number;
        if (seconds === 'ZERO_OUT') {
            d = new Date(0);
            return d;
        } else if (typeof seconds === 'string' && /^\d+$/.test(seconds)) {
            num = parseInt(seconds, 10);
        } else if (typeof seconds === 'number') {
            num = seconds;
        } else {
            d = void 0;
            return d;
        }        
        d = new Date(num * 1000);
        return d;
    }
    
    function setUnixMillisecondTimestamp(d:Date, milliseconds:string|number):Date {
        let num:number;
        if (milliseconds === 'ZERO_OUT') {
            d = new Date(0);
            return d;
        } else if (typeof milliseconds === 'string' && /^\d+$/.test(milliseconds)) {
            num = parseInt(milliseconds, 10);
        } else if (typeof milliseconds === 'number') {
            num = milliseconds;
        } else {
            d = void 0;
            return d;
        }        
        d = new Date(num);
        return d;
    }
    
    function setMeridiem(d:Date, meridiem:string|number):Date {
        let hours = d.getHours();
        if (meridiem === 'ZERO_OUT') return d;
        if (typeof meridiem === 'string' && /^am?$/i.test(<string>meridiem)) {
            hours -= 12;
        } else if (typeof meridiem === 'string' && /^pm?$/i.test(<string>meridiem)) {
            hours += 12;
        } else {
            d = void 0;
            return d;
        }
        if (hours < 0 || hours > 23) {
            return d;
        }
        d.setHours(hours);
        return d;
    }
    
    function incMeridiem(d:Date):Date {
        let n = d.getHours() + 12;
        return setHours(d, n > 23 ? n - 24 : n);
    }
    
    function decMeridiem(d:Date):Date {
        let n = d.getHours() - 12;
        return setHours(d, n < 0 ? n + 24 : n);
    }
    
    function daysInMonth(d:Date):number {
        return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    }
    
    function maxMonthStringBuffer(d:Date):number {
        let m = d.getMonth();
        if (m === 0) return 2; // Jan
        if (m === 1) return 1; // Feb
        if (m === 2) return 3; // Mar
        if (m === 3) return 2; // Apr
        if (m === 4) return 3; // May
        if (m === 5) return 3; // Jun
        if (m === 6) return 3; // Jul
        if (m === 7) return 2; // Aug
        if (m === 8) return 1; // Sep
        if (m === 9) return 1; // Oct
        if (m === 10) return 1; // Nov
        return 1; // Dec
    }
    
    function maxMonthBuffer(d:Date):number {
        return d.getMonth() > 0 ? 1 : 2;
    }
    
    function maxDateBuffer(d:Date):number {
        return d.getDate() * 10 > daysInMonth(d) ? 1 : 2;
    }
    
    function maxDayStringBuffer(d:Date):number {
        return d.getDay() % 2 == 0 ? 2 : 1;
    }
    
    function maxMilitaryHoursBuffer(d:Date):number {
        return d.getHours() > 2 ? 1 : 2;
    }
    
    function maxHoursBuffer(d:Date):number {
        if (d.getHours() > 11) { // PM
            return d.getHours() > 13 ? 1 : 2;
        } else { // AM
            return d.getHours() > 1 ? 1 : 2;   
        }        
    }
    
    function maxMinutesBuffer(d:Date):number {
        return d.getMinutes() > 5 ? 1 : 2;
    }
    
    function maxSecondsBuffer(d:Date):number {
        return d.getSeconds() > 5 ? 1 : 2;
    }
    
    function getUTCOffset(date:Date, showColon:boolean):string {
        let tzo = -date.getTimezoneOffset();
        let dif = tzo >= 0 ? '+' : '-';
        let colon = showColon ? ':' : '';
        return dif + pad(tzo / 60, 2) + colon + pad(tzo % 60, 2);
    }

    function pad(num:number, length:number):string {
        let padded = Math.abs(num).toString();
        while (padded.length < length) padded = '0' + padded;
        return padded;
    }

    function appendOrdinal(num:number):string {
        let j = num % 10;
        let k = num % 100;
        if (j == 1 && k != 11) return num + "st";
        if (j == 2 && k != 12) return num + "nd";
        if (j == 3 && k != 13) return num + "rd";
        return num + "th";
    }

    function toStandardTime(hours:number):number {
        if (hours === 0) return 12;
        return hours > 12 ? hours - 12 : hours;
    }    
        
    return <IFormatBlock[]> [
        { // FOUR DIGIT YEAR
            code: 'YYYY',
            regExp: '\\d{4,4}',
            str: (d) => d.getFullYear().toString(),
            inc: (d) => setYear(d, d.getFullYear() + 1),
            dec: (d) => setYear(d, d.getFullYear() - 1),
            set: (d, v) => setYear(d, v),
            maxBuffer: (d) => 4
        },
        { // TWO DIGIT YEAR
            code: 'YY',
            regExp: '\\d{2,2}',
            str: (d) => d.getFullYear().toString().slice(-2),
            inc: (d) => setYear(d, d.getFullYear() + 1),
            dec: (d) => setYear(d, d.getFullYear() - 1),
            set: (d, v) => setTwoDigitYear(d, v),
            maxBuffer: (d) => 2
        },
        { // LONG MONTH NAME
            code: 'MMMM',
            regExp: `((${monthNames.join(')|(')}))`,
            str: (d) => monthNames[d.getMonth()],
            inc: (d) => incMonth(d),
            dec: (d) => decMonth(d),
            set: (d, v) => setMonthString(d, v),
            maxBuffer: (d) => maxMonthStringBuffer(d)
        },
        { // SHORT MONTH NAME
            code: 'MMM',
            regExp: `((${monthNames.map((v) => v.slice(0,3)).join(')|(')}))`,
            str: (d) => monthNames[d.getMonth()].slice(0,3),
            inc: (d) => incMonth(d),
            dec: (d) => decMonth(d),
            set: (d, v) => setMonthString(d, v),
            maxBuffer: (d) => maxMonthStringBuffer(d)
        },
        { // PADDED MONTH
            code: 'MM',
            regExp: '\\d{2,2}',
            str: (d) => pad(d.getMonth() + 1, 2),
            inc: (d) => incMonth(d),
            dec: (d) => decMonth(d),
            set: (d, v) => setMonth(d, v),
            maxBuffer: (d) => maxMonthBuffer(d)
        },
        { // MONTH
            code: 'M',
            regExp: '\\d{1,2}',
            str: (d) => (d.getMonth() + 1).toString(),
            inc: (d) => incMonth(d),
            dec: (d) => decMonth(d),
            set: (d, v) => setMonth(d, v),
            maxBuffer: (d) => maxMonthBuffer(d)
        },
        { // PADDED DATE
            code: 'DD',
            regExp: '\\d{2,2}',
            str: (d) => pad(d.getDate(), 2),
            inc: (d) => incDate(d),
            dec: (d) => decDate(d),
            set: (d, v) => setDate(d, v),
            maxBuffer: (d) => maxDateBuffer(d)
        },
        { // ORDINAL DATE
            code: 'Do',
            regExp: '\\d{1,2}((th)|(nd)|(rd)|(st))',
            str: (d) => appendOrdinal(d.getDate()),
            inc: (d) => incDate(d),
            dec: (d) => decDate(d),
            set: (d, v) => setDate(d, v),
            maxBuffer: (d) => maxDateBuffer(d)
        },
        { // DATE
            code: 'D',
            regExp: '\\d{1,2}',
            str: (d) => d.getDate().toString(),
            inc: (d) => incDate(d),
            dec: (d) => decDate(d),
            set: (d, v) => setDate(d, v),
            maxBuffer: (d) => maxDateBuffer(d)
        },
        { // LONG DAY NAME
            code: 'dddd',
            regExp: `((${dayNames.join(')|(')}))`,
            str: (d) => dayNames[d.getDay()],
            inc: (d) => incDay(d),
            dec: (d) => decDay(d),
            set: (d, v) => setDay(d, v),
            maxBuffer: (d) => maxDayStringBuffer(d)
        },
        { // SHORT DAY NAME
            code: 'ddd',
            regExp: `((${dayNames.map((v) => v.slice(0,3)).join(')|(')}))`,
            str: (d) => dayNames[d.getDay()].slice(0,3),
            inc: (d) => incDay(d),
            dec: (d) => decDay(d),
            set: (d, v) => setDay(d, v),
            maxBuffer: (d) => maxDayStringBuffer(d)
        },
        { // UNIX TIMESTAMP
            code: 'X',
            regExp: '\\d{1,}',
            str: (d) => Math.floor(d.valueOf() / 1000).toString(),
            inc: (d) => new Date(d.valueOf() + 1000),
            dec: (d) => new Date(d.valueOf() - 1000),
            set: (d, v) => setUnixSecondTimestamp(d, v)
        },
        { // UNIX MILLISECOND TIMESTAMP
            code: 'x',
            regExp: '\\d{1,}',
            str: (d) => d.valueOf().toString(),
            inc: (d) => new Date(d.valueOf() + 1),
            dec: (d) => new Date(d.valueOf() - 1),
            set: (d, v) => setUnixMillisecondTimestamp(d, v)
        },
        { // PADDED MILITARY HOURS
            code: 'HH',
            regExp: '\\d{2,2}',
            str: (d) => pad(d.getHours(), 2),
            inc: (d) => incHours(d),
            dec: (d) => decHours(d),
            set: (d, v) => setMilitaryHours(d, v),
            maxBuffer: (d) => maxMilitaryHoursBuffer(d)
        },
        { // MILITARY HOURS
            code: 'H',
            regExp: '\\d{1,2}',
            str: (d) => d.getHours().toString(),
            inc: (d) => incHours(d),
            dec: (d) => decHours(d),
            set: (d, v) => setMilitaryHours(d, v),
            maxBuffer: (d) => maxMilitaryHoursBuffer(d)
        },
        { // PADDED HOURS
            code: 'hh',
            regExp: '\\d{2,2}',
            str: (d) => pad(toStandardTime(d.getHours()), 2),
            inc: (d) => incHours(d),
            dec: (d) => decHours(d),
            set: (d, v) => setHours(d, v),
            maxBuffer: (d) => maxHoursBuffer(d)
        },
        { // HOURS
            code: 'h',
            regExp: '\\d{1,2}',
            str: (d) => toStandardTime(d.getHours()).toString(),
            inc: (d) => incHours(d),
            dec: (d) => decHours(d),
            set: (d, v) => setHours(d, v),
            maxBuffer: (d) => maxHoursBuffer(d)
        },
        { // UPPERCASE MERIDIEM
            code: 'A',
            regExp: '((AM)|(PM))',
            str: (d) => d.getHours() < 12 ? 'AM' : 'PM',
            inc: (d) => incMeridiem(d),
            dec: (d) => decMeridiem(d),
            set: (d, v) => setMeridiem(d, v),
            maxBuffer: (d) => 1
        },
        { // UPPERCASE MERIDIEM
            code: 'a',
            regExp: '((am)|(pm))',
            str: (d) => d.getHours() < 12 ? 'am' : 'pm',
            inc: (d) => incMeridiem(d),
            dec: (d) => decMeridiem(d),
            set: (d, v) => setMeridiem(d, v),
            maxBuffer: (d) => 1
        },
        { // PADDED MINUTES
            code: 'mm',
            regExp: '\\d{2,2}',
            str: (d) => pad(d.getMinutes(), 2),
            inc: (d) => incMinutes(d),
            dec: (d) => decMinutes(d),
            set: (d, v) => setMinutes(d, v),
            maxBuffer: (d) => maxMinutesBuffer(d)
        },
        { // MINUTES
            code: 'm',
            regExp: '\\d{1,2}',
            str: (d) => d.getMinutes().toString(),
            inc: (d) => incMinutes(d),
            dec: (d) => decMinutes(d),
            set: (d, v) => setMinutes(d, v),
            maxBuffer: (d) => maxMinutesBuffer(d)
        },
        { // PADDED SECONDS
            code: 'ss',
            regExp: '\\d{2,2}',
            str: (d) => pad(d.getSeconds(), 2),
            inc: (d) => incSeconds(d),
            dec: (d) => decSeconds(d),
            set: (d, v) => setSeconds(d, v),
            maxBuffer: (d) => maxSecondsBuffer(d)
        },
        { // SECONDS
            code: 's',
            regExp: '\\d{1,2}',
            str: (d) => d.getSeconds().toString(),
            inc: (d) => incSeconds(d),
            dec: (d) => decSeconds(d),
            set: (d, v) => setSeconds(d, v),
            maxBuffer: (d) => maxSecondsBuffer(d)
        },
        { // UTC OFFSET WITH COLON
            code: 'ZZ',
            regExp: '(\\+|\\-)\\d{2,2}:\\d{2,2}',
            str: (d) => getUTCOffset(d, true) //TODO add ability to inc and dec this
        },
        { // UTC OFFSET
            code: 'Z',
            regExp: '(\\+|\\-)\\d{4,4}',
            str: (d) => getUTCOffset(d, false)
        }
    ];
})();


