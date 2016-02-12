class DateChain {
    public date:Date;
    constructor(date:Date) {
        this.date = new Date(date.valueOf());
    }
    
    public setSeconds(seconds:string|number):DateChain {
        let num:number;
        if (seconds === 'ZERO_OUT') {
            this.date.setSeconds(0);
            return this;
        } else if (typeof seconds === 'string' && /^\d+$/.test(seconds)) {
            num = parseInt(<string>seconds);
        } else if (typeof seconds === 'number') {
            num = seconds;
        } else {
            this.date = void 0;
            return this;
        }
        if (num < 0 || num > 59) {
            this.date = void 0;
            return this;
        }
        this.date.setSeconds(num);
        return this;
    }
    
    public setMinutes(minutes:string|number):DateChain {
        let num:number;
        if (minutes === 'ZERO_OUT') {
            this.date.setMinutes(0);
            return this;
        } else if (typeof minutes === 'string' && /^\d+$/.test(minutes)) {
            num = parseInt(<string>minutes);
        } else if (typeof minutes === 'number') {
            num = minutes;
        } else {
            this.date = void 0;
            return this;
        }
        if (num < 0 || num > 59) {
            this.date = void 0;
            return this;
        }
        this.date.setMinutes(num);
        return this;
    }
    
    public setHours(hours:string|number):DateChain { // TODO Think about meridiem stuff here
        let num:number;
        if (hours === 'ZERO_OUT') {
            this.date.setHours(0);
            return this;
        } else if (typeof hours === 'string' && /^\d+$/.test(hours)) {
            num = parseInt(<string>hours);
        } else if (typeof hours === 'number') {
            num = hours;
        } else {
            this.date = void 0;
            return this;
        }
        if (num < 0 || num > 23) {
            this.date = void 0;
            return this;
        }
        this.date.setHours(num);
        return this;
    }
    
    public setDate(date:string|number):DateChain {
        if (typeof date === 'string') {
            
        } else if (typeof date === 'number') {
            if (date < 1 || date > this.daysInMonth()) return this;
            this.date.setDate(date);
        }
        return this;
    }
    
    public setDay(day:string|number):DateChain {
        if (typeof day === 'string') {
        } else if (typeof day === 'number') {
            if (day < 0 || day > 6) return this;
            let offset = this.date.getDay() - day;
            this.date.setDate(this.date.getDate() - offset);
        }
        return this;
    }
    
    public setMonth(month:string|number):DateChain {
        if (typeof month === 'string') {
        } else if (typeof month === 'number') {
            if (month < 0 || month > 11) return this;
            this.date.setMonth(month);
            if (this.date.getMonth() !== month) this.date.setDate(0);
        }
        return this;            
    }
    
    public setYear(year:string|number):DateChain {
        if (typeof year === 'string') {
            
        } else if (typeof year === 'number') {
            this.date.setFullYear(year);
        }
        return this;
    }
    
    public setUnixSecondTimestamp(seconds:string|number):DateChain {
        if (typeof seconds === 'string') {
            
        } else if (typeof seconds === 'number') {
            
        }
        return this;
    }
    
    public setUnixMillisecondTimestamp(milliseconds:string|number):DateChain {
        if (typeof milliseconds === 'string') {
            
        } else if (typeof milliseconds === 'number') {
            
        }
        return this;
    }
    
    public setMeridiem(meridiem:string|number):DateChain {
        let hours = this.date.getHours();
        if (meridiem === 'ZERO_OUT') return this;
        if (typeof meridiem === 'string' && (<string>meridiem).toLowerCase() === 'a') {
            hours -= 12;
        } else if (typeof meridiem === 'string' && (<string>meridiem).toLowerCase() === 'p') {
            hours += 12;
        } else {
            this.date = void 0;
            return this;
        }
        if (hours < 0 || hours > 23) {
            return this;
        }
        this.date.setHours(hours);
        return this;
    }
    
    private daysInMonth():number {
        return new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0).getDate();
    }
    
    public maxMonthStringBuffer():number {
        return 3;
    }
    
    public maxMonthBuffer():number {
        return 2;
    }
    
    public maxDateBuffer():number {
        return 2;
    }
    
    public maxDayStringBuffer():number {
        return 2;
    }
    
    public maxMilitaryHoursBuffer():number {
        return 2;
    }
    
    public maxHoursBuffer():number {
        return 2;
    }
    
    public maxMinutesBuffer():number {
        return 2;
    }
    
    public maxSecondsBuffer():number {
        return this.date.getSeconds() > 5 ? 1 : 2;
    }
}

function chain(d:Date):DateChain {
    return new DateChain(d);
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

const longMonthNames:string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const shortMonthNames:string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const longDayNames:string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const shortDayNames:string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export interface IFormatBlock {
    code:string;
    str(d:Date):string;
    regExp?:string;
    // leaving inc, dec and set unset will make the block unselectable
    inc?(d:Date):Date;
    dec?(d:Date):Date;
    set?(d:Date, v:string|number):Date;
    maxBuffer?(d:Date):number;
}

export let formatBlocks:IFormatBlock[] = [
    { // FOUR DIGIT YEAR
        code: 'YYYY',
        regExp: '\\d{4,4}',
        str: (d) => d.getFullYear().toString(),
        inc: (d) => chain(d).setYear(d.getFullYear() + 1).date,
        dec: (d) => chain(d).setYear(d.getFullYear() - 1).date,
        set: (d, v) => chain(d).setYear(v).date,
        maxBuffer: (d) => 4
    },
    { // TWO DIGIT YEAR
        code: 'YY',
        regExp: '\\d{2,2}',
        str: (d) => d.getFullYear().toString().slice(-2),
        inc: (d) => chain(d).setYear(d.getFullYear() + 1).date,
        dec: (d) => chain(d).setYear(d.getFullYear() - 1).date,
        set: (d, v) => chain(d).setYear(v).date,
        maxBuffer: (d) => 2
    },
    { // LONG MONTH NAME
        code: 'MMMM',
        regExp: '((January)|(February)|(March)|(April)|(May)|(June)|(July)|(August)|(September)|(October)|(November)|(December))',
        str: (d) => longMonthNames[d.getMonth()],
        inc: (d) => chain(d).setMonth(d.getMonth() + 1).date,
        dec: (d) => chain(d).setMonth(d.getMonth() - 1).date,
        set: (d, v) => chain(d).setMonth(v).date,
        maxBuffer: (d) => chain(d).maxMonthStringBuffer()
    },
    { // SHORT MONTH NAME
        code: 'MMM',
        regExp: '((Jan)|(Feb)|(Mar)|(Apr)|(May)|(Jun)|(Jul)|(Aug)|(Sep)|(Oct)|(Nov)|(Dec))',
        str: (d) => shortMonthNames[d.getMonth()],
        inc: (d) => chain(d).setMonth(d.getMonth() + 1).date,
        dec: (d) => chain(d).setMonth(d.getMonth() - 1).date,
        set: (d, v) => chain(d).setMonth(v).date,
        maxBuffer: (d) => chain(d).maxMonthStringBuffer()
    },
    { // PADDED MONTH
        code: 'MM',
        regExp: '\\d{2,2}',
        str: (d) => pad(d.getMonth(), 2),
        inc: (d) => chain(d).setMonth(d.getMonth() + 1).date,
        dec: (d) => chain(d).setMonth(d.getMonth() - 1).date,
        set: (d, v) => chain(d).setMonth(v).date,
        maxBuffer: (d) => chain(d).maxMonthBuffer()
    },
    { // MONTH
        code: 'M',
        regExp: '\\d{1,2}',
        str: (d) => d.getMonth().toString(),
        inc: (d) => chain(d).setMonth(d.getMonth() + 1).date,
        dec: (d) => chain(d).setMonth(d.getMonth() - 1).date,
        set: (d, v) => chain(d).setMonth(v).date,
        maxBuffer: (d) => chain(d).maxMonthBuffer()
    },
    { // PADDED DATE
        code: 'DD',
        regExp: '\\d{2,2}',
        str: (d) => pad(d.getDate(), 2),
        inc: (d) => chain(d).setDate(d.getDate() + 1).date,
        dec: (d) => chain(d).setDate(d.getDate() - 1).date,
        set: (d, v) => chain(d).setDate(v).date,
        maxBuffer: (d) => chain(d).maxDateBuffer()
    },
    { // ORDINAL DATE
        code: 'Do',
        regExp: '\\d{1,2}((th)|(nd)|(rd)|(st))',
        str: (d) => appendOrdinal(d.getDate()),
        inc: (d) => chain(d).setDate(d.getDate() + 1).date,
        dec: (d) => chain(d).setDate(d.getDate() - 1).date,
        set: (d, v) => chain(d).setDate(v).date,
        maxBuffer: (d) => chain(d).maxDateBuffer()
    },
    { // DATE
        code: 'D',
        regExp: '\\d{1,2}',
        str: (d) => d.getDate().toString(),
        inc: (d) => chain(d).setDate(d.getDate() + 1).date,
        dec: (d) => chain(d).setDate(d.getDate() - 1).date,
        set: (d, v) => chain(d).setDate(v).date,
        maxBuffer: (d) => chain(d).maxDateBuffer()
    },
    { // LONG DAY NAME
        code: 'dddd',
        regExp: '((Sunday)|(Monday)|(Tuesday)|(Wednesday)|(Thursday)|(Friday)|(Saturday))',
        str: (d) => longDayNames[d.getDay()],
        inc: (d) => chain(d).setDay(d.getDay() + 1).date,
        dec: (d) => chain(d).setDay(d.getDay() - 1).date,
        set: (d, v) => chain(d).setDay(v).date,
        maxBuffer: (d) => chain(d).maxDayStringBuffer()
    },
    { // SHORT DAY NAME
        code: 'ddd',
        regExp: '((Sun)|(Mon)|(Tue)|(Wed)|(Thu)|(Fri)|(Sat))',
        str: (d) => shortDayNames[d.getDay()],
        inc: (d) => chain(d).setDay(d.getDay() + 1).date,
        dec: (d) => chain(d).setDay(d.getDay() - 1).date,
        set: (d, v) => chain(d).setDay(v).date,
        maxBuffer: (d) => chain(d).maxDayStringBuffer()
    },
    { // UNIX TIMESTAMP
        code: 'X',
        regExp: '\\d{1,}',
        str: (d) => Math.round(d.valueOf() / 1000).toString(),
        inc: (d) => new Date(d.valueOf() + 1000),
        dec: (d) => new Date(d.valueOf() - 1000),
        set: (d, v) => chain(d).setUnixSecondTimestamp(v).date
    },
    { // UNIX MILLISECOND TIMESTAMP
        code: 'x',
        regExp: '\\d{1,}',
        str: (d) => d.valueOf().toString(),
        inc: (d) => new Date(d.valueOf() + 1),
        dec: (d) => new Date(d.valueOf() - 1),
        set: (d, v) => chain(d).setUnixMillisecondTimestamp(v).date
    },
    { // PADDED MILITARY HOURS
        code: 'HH',
        regExp: '\\d{2,2}',
        str: (d) => pad(d.getHours(), 2),
        inc: (d) => chain(d).setHours(d.getHours() + 1).date,
        dec: (d) => chain(d).setHours(d.getHours() - 1).date,
        set: (d, v) => chain(d).setHours(v).date,
        maxBuffer: (d) => chain(d).maxMilitaryHoursBuffer()
    },
    { // MILITARY HOURS
        code: 'H',
        regExp: '\\d{1,2}',
        str: (d) => d.getHours().toString(),
        inc: (d) => chain(d).setHours(d.getHours() + 1).date,
        dec: (d) => chain(d).setHours(d.getHours() - 1).date,
        set: (d, v) => chain(d).setHours(v).date,
        maxBuffer: (d) => chain(d).maxMilitaryHoursBuffer()
    },
    { // PADDED HOURS
        code: 'hh',
        regExp: '\\d{2,2}',
        str: (d) => pad(toStandardTime(d.getHours()), 2),
        inc: (d) => chain(d).setHours(d.getHours() + 1).date,
        dec: (d) => chain(d).setHours(d.getHours() - 1).date,
        set: (d, v) => chain(d).setHours(v).date,
        maxBuffer: (d) => chain(d).maxHoursBuffer()
    },
    { // PADDED HOURS
        code: 'h',
        regExp: '\\d{1,2}',
        str: (d) => toStandardTime(d.getHours()).toString(),
        inc: (d) => chain(d).setHours(d.getHours() + 1).date,
        dec: (d) => chain(d).setHours(d.getHours() - 1).date,
        set: (d, v) => chain(d).setHours(v).date,
        maxBuffer: (d) => chain(d).maxHoursBuffer()
    },
    { // UPPERCASE MERIDIEM
        code: 'A',
        regExp: '((AM)|(PM))',
        str: (d) => d.getHours() < 12 ? 'AM' : 'PM',
        inc: (d) => chain(d).setHours(d.getHours() + 12).date,
        dec: (d) => chain(d).setHours(d.getHours() - 12).date,
        set: (d, v) => chain(d).setMeridiem(v).date,
        maxBuffer: (d) => 1
    },
    { // UPPERCASE MERIDIEM
        code: 'a',
        regExp: '((am)|(pm))',
        str: (d) => d.getHours() < 12 ? 'am' : 'pm',
        inc: (d) => chain(d).setHours(d.getHours() + 12).date,
        dec: (d) => chain(d).setHours(d.getHours() - 12).date,
        set: (d, v) => chain(d).setMeridiem(v).date,
        maxBuffer: (d) => 1
    },
    { // PADDED MINUTES
        code: 'mm',
        regExp: '\\d{2,2}',
        str: (d) => pad(d.getMinutes(), 2),
        inc: (d) => chain(d).setMinutes(d.getMinutes() + 1).date,
        dec: (d) => chain(d).setMinutes(d.getMinutes() - 1).date,
        set: (d, v) => chain(d).setMinutes(v).date,
        maxBuffer: (d) => chain(d).maxMinutesBuffer()
    },
    { // MINUTES
        code: 'm',
        regExp: '\\d{1,2}',
        str: (d) => d.getMinutes().toString(),
        inc: (d) => chain(d).setMinutes(d.getMinutes() + 1).date,
        dec: (d) => chain(d).setMinutes(d.getMinutes() - 1).date,
        set: (d, v) => chain(d).setMinutes(v).date,
        maxBuffer: (d) => chain(d).maxMinutesBuffer()
    },
    { // PADDED SECONDS
        code: 'ss',
        regExp: '\\d{2,2}',
        str: (d) => pad(d.getSeconds(), 2),
        inc: (d) => chain(d).setSeconds(d.getSeconds() + 1).date,
        dec: (d) => chain(d).setSeconds(d.getSeconds() - 1).date,
        set: (d, v) => chain(d).setSeconds(v).date,
        maxBuffer: (d) => chain(d).maxSecondsBuffer()
    },
    { // SECONDS
        code: 's',
        regExp: '\\d{1,2}',
        str: (d) => d.getSeconds().toString(),
        inc: (d) => chain(d).setSeconds(d.getSeconds() + 1).date,
        dec: (d) => chain(d).setSeconds(d.getSeconds() - 1).date,
        set: (d, v) => chain(d).setSeconds(v).date,
        maxBuffer: (d) => chain(d).maxSecondsBuffer()
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