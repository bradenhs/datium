class DateChain {
    public date:Date;
    constructor(date:Date) {
        this.date = new Date(date.valueOf());
    }
    
    public setSecond(seconds:number):DateChain {
        this.date.setSeconds(seconds);
        return this;
    }
    
    public setMinute(minute:number):DateChain {
        this.date.setMinutes(minute);
        return this;
    }
    
    public setHour(hour:number):DateChain {
        this.date.setHours(hour);
        return this;
    }
    
    public setDate(date:number):DateChain {
        this.date.setDate(date);
        return this;
    }
    
    public setMonth(month:number):DateChain {
        this.date.setMonth(month);
        return this;
    }
    
    public setYear(year:number):DateChain {
        this.date.setFullYear(year);
        return this;
    }
}

function chain(d:Date):DateChain {
    return new DateChain(d);
}

export interface IDatePart {
    formatCode?:string;
    str(d:Date):string;
    inc?(d:Date):Date;
    dec?(d:Date):Date;
    selectable?:boolean;
}

let getUTCOffset = (date:Date, showColon:boolean):string => {
    let tzo = -date.getTimezoneOffset();
    let dif = tzo >= 0 ? '+' : '-';
    let colon = showColon ? ':' : '';
    return dif + this.pad(tzo / 60, 2) + colon + this.pad(tzo % 60, 2);
}

let pad = (num:number, length:number):string => {
    let padded = num.toString();
    while (padded.length < length) padded = '0' + padded;
    return padded;
}

let appendOrdinal = (num:number):string => {
    let j = num % 10;
    let k = num % 100;
    if (j == 1 && k != 11) {
        return num + "st";
    }
    if (j == 2 && k != 12) {
        return num + "nd";
    }
    if (j == 3 && k != 13) {
        return num + "rd";
    }
    return num + "th";
}

let mkDP = (data:IDatePart):IDatePart => {
    // to right of || are default values
    return {
        formatCode: data.formatCode || void 0,
        str: data.str || void 0,
        inc: data.inc || void 0,
        dec: data.dec || void 0,
        selectable: data.selectable || true
    }
}

const longMonthNames:string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const shortMonthNames:string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const longDayNames:string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const shortDayNames:string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export let dateParts:IDatePart[] = [
    mkDP({ // FOUR DIGIT YEAR
        formatCode: 'YYYY',
        str: (d) => d.getFullYear().toString(),
        inc: (d) => chain(d).setYear(d.getFullYear() + 1).date,
        dec: (d) => chain(d).setYear(d.getFullYear() - 1).date
    }),
    mkDP({ // TWO DIGIT YEAR
        formatCode: 'YY',
        str: (d) => d.getFullYear().toString().slice(-2),
        inc: (d) => chain(d).setYear(d.getFullYear() + 1).date,
        dec: (d) => chain(d).setYear(d.getFullYear() - 1).date
    }),
    mkDP({ // LONG MONTH NAME
        formatCode: 'MMMM',
        str: (d) => longMonthNames[d.getMonth()],
        inc: (d) => chain(d).setMonth(d.getMonth() + 1).date,
        dec: (d) => chain(d).setMonth(d.getMonth() - 1).date
    }),
    mkDP({ // SHORT MONTH NAME
        formatCode: 'MMM',
        str: (d) => shortMonthNames[d.getMonth()],
        inc: (d) => chain(d).setMonth(d.getMonth() + 1).date,
        dec: (d) => chain(d).setMonth(d.getMonth() - 1).date
    }),
    mkDP({ // PADDED DATE
        formatCode: 'DD',
        str: (d) => pad(d.getDate(), 2),
        inc: (d) => chain(d).setDate(d.getDate() + 1).date,
        dec: (d) => chain(d).setDate(d.getDate() - 1).date
    }),
    mkDP({ // ORDINAL DATE
        formatCode: 'Do',
        str: (d) => appendOrdinal(d.getDate()),
        inc: (d) => chain(d).setDate(d.getDate() + 1).date,
        dec: (d) => chain(d).setDate(d.getDate() - 1).date
    }),
    mkDP({ // DATE
        formatCode: 'D',
        str: (d) => d.getDate().toString(),
        inc: (d) => chain(d).setDate(d.getDate() + 1).date,
        dec: (d) => chain(d).setDate(d.getDate() - 1).date
    }),
    mkDP({ // LONG DAY NAME
        formatCode: 'dddd',
        str: (d) => longDayNames[d.getDate()],
        inc: (d) => chain(d).setDate(d.getDate() + 1).date,
        dec: (d) => chain(d).setDate(d.getDate() - 1).date
    }),
    mkDP({ // SHORT DAY NAME
        formatCode: 'ddd',
        str: (d) => shortDayNames[d.getDate()],
        inc: (d) => chain(d).setDate(d.getDate() + 1).date,
        dec: (d) => chain(d).setDate(d.getDate() - 1).date
    }),
    mkDP({ // UNIX TIMESTAMP
        formatCode: 'X',
        str: (d) => Math.round(d.valueOf() / 1000).toString(),
        inc: (d) => new Date(d.valueOf() + 1000),
        dec: (d) => new Date(d.valueOf() - 1000)
    }),
    mkDP({ // UNIX MILLISECOND TIMESTAMP
        formatCode: 'x',
        str: (d) => d.valueOf().toString(),
        inc: (d) => new Date(d.valueOf() + 1),
        dec: (d) => new Date(d.valueOf() - 1)
    }),
    mkDP({ // PADDED MILITARY HOURS
        formatCode: 'HH',
        str: (d) => pad(d.getHours(), 2),
        inc: (d) => chain(d).setHour(d.getHours() + 1).date,
        dec: (d) => chain(d).setHour(d.getHours() - 1).date
    }),
    mkDP({ // MILITARY HOURS
        formatCode: 'H',
        str: (d) => d.getHours().toString(),
        inc: (d) => chain(d).setHour(d.getHours() + 1).date,
        dec: (d) => chain(d).setHour(d.getHours() - 1).date
    }),
    mkDP({ // PADDED HOURS
        formatCode: 'hh',
        str: (d) => pad(d.getHours() < 12 ? d.getHours() + 12 : d.getHours(), 2),
        inc: (d) => chain(d).setHour(d.getHours() + 1).date,
        dec: (d) => chain(d).setHour(d.getHours() - 1).date
    }),
    mkDP({ // PADDED HOURS
        formatCode: 'h',
        str: (d) => (d.getHours() < 12 ? d.getHours() + 12 : d.getHours(), 2).toString(),
        inc: (d) => chain(d).setHour(d.getHours() + 1).date,
        dec: (d) => chain(d).setHour(d.getHours() - 1).date
    }),
    mkDP({ // UPPERCASE MERIDIEM
        formatCode: 'A',
        str: (d) => d.getHours() < 12 ? 'AM' : 'PM',
        inc: (d) => d.getHours() < 12 ? chain(d).setHour(d.getHours() + 12).date : d,
        dec: (d) => d.getHours() > 11 ? chain(d).setHour(d.getHours() - 12).date : d
    }),
    mkDP({ // UPPERCASE MERIDIEM
        formatCode: 'a',
        str: (d) => d.getHours() < 12 ? 'am' : 'pm',
        inc: (d) => d.getHours() < 12 ? chain(d).setHour(d.getHours() + 12).date : d,
        dec: (d) => d.getHours() > 11 ? chain(d).setHour(d.getHours() - 12).date : d
    }),
    mkDP({ // PADDED MINUTES
        formatCode: 'mm',
        str: (d) => pad(d.getMinutes(), 2),
        inc: (d) => chain(d).setMinute(d.getMinutes() + 1).date,
        dec: (d) => chain(d).setMinute(d.getMinutes() - 1).date
    }),
    mkDP({ // MINUTES
        formatCode: 'm',
        str: (d) => d.getMinutes().toString(),
        inc: (d) => chain(d).setMinute(d.getMinutes() + 1).date,
        dec: (d) => chain(d).setMinute(d.getMinutes() - 1).date
    }),
    mkDP({ // PADDED SECONDS
        formatCode: 'ss',
        str: (d) => pad(d.getSeconds(), 2),
        inc: (d) => chain(d).setSecond(d.getSeconds() + 1).date,
        dec: (d) => chain(d).setSecond(d.getSeconds() - 1).date
    }),
    mkDP({ // SECONDS
        formatCode: 's',
        str: (d) => d.getSeconds().toString(),
        inc: (d) => chain(d).setSecond(d.getSeconds() + 1).date,
        dec: (d) => chain(d).setSecond(d.getSeconds() - 1).date
    }),
    mkDP({ // UTC Offset with Colon
        formatCode: 'ZZ',
        str: (d) => getUTCOffset(d, true),
        selectable: false
    }),
    mkDP({ // UTC Offset
        formatCode: 'Z',
        str: (d) => getUTCOffset(d, false),
        selectable: false
    })
];

