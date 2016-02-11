export class DatePart {
    public static FormatCode:string;
    private value:string;
    protected date:Date;
    protected pad(num:number, length: number):string {
        let padded = num.toString();
        while (padded.length < length) padded = '0' + padded;
        return padded;
    }
    public toString(date?:Date):string {
        if (date !== void 0) {
            this.date = new Date(date.valueOf());
            this.value = this.getValue(date);
        }
        return this.value;
    }
    protected getValue(date:Date):string {
        throw "Override this";
    }
    public increment():Date {
        throw "Override this";
    }
    public decrement():Date {
        throw "Override this";
    }
    private selectable:boolean = true;
    public isSelectable():boolean {
        return this.selectable;
    }
    public setSelectable(selectable:boolean):void {
        this.selectable = selectable;
    }
}

export class PlainText extends DatePart {
    constructor(private text:string) { 
        super();
        this.setSelectable(false);
    }
    
    protected getValue():string {
        return this.text;
    }
}

export class FourDigitYear extends DatePart {
    public static FormatCode:string = 'YYYY';    
    protected getValue(date:Date):string {
        return this.pad(date.getFullYear(), 4);
    }
    public increment():Date {
        let newDate = new Date(this.date.valueOf());
        newDate.setFullYear(newDate.getFullYear() + 1);
        return newDate;
    }
    public decrement():Date {
        let newDate = new Date(this.date.valueOf());
        newDate.setFullYear(newDate.getFullYear() - 1);
        return newDate;
    }
}

export class TwoDigitYear extends DatePart {
    public static FormatCode:string = 'YY';
    protected getValue(date:Date):string {
        return this.pad(date.getFullYear(), 2).slice(-2);
    }
    public increment():Date {
        let newDate = new Date(this.date.valueOf());
        newDate.setFullYear(newDate.getFullYear() + 1);
        return newDate;
    }
    public decrement():Date {
        let newDate = new Date(this.date.valueOf());
        newDate.setFullYear(newDate.getFullYear() - 1);
        return newDate;
    }
}

export class LongMonthName extends DatePart {
    public static FormatCode:string = 'MMMM';
    public static names:string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    protected getValue(date:Date):string {
        return LongMonthName.names[date.getMonth()];
    }
}

export class ShortMonthName extends DatePart {
    public static FormatCode:string = 'MMM';
    public static names:string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    protected getValue(date:Date):string {
        return ShortMonthName.names[date.getMonth()];
    }
}

export class PaddedDate extends DatePart {
    public static FormatCode:string = 'DD';
    protected getValue(date:Date):string {
        return this.pad(date.getDate(), 2);
    }
}

export class OrdinalDate extends DatePart {
    public static FormatCode:string = 'Do';
    public static appendOrdinalTo(i:number):string {
        let j = i % 10;
        let k = i % 100;
        if (j == 1 && k != 11) {
            return i + "st";
        }
        if (j == 2 && k != 12) {
            return i + "nd";
        }
        if (j == 3 && k != 13) {
            return i + "rd";
        }
        return i + "th";
    }
    protected getValue(date:Date):string {
        return OrdinalDate.appendOrdinalTo(date.getDate());
    }
}

export class UnpaddedDate extends DatePart {
    public static FormatCode:string = 'D';
    protected getValue(date:Date):string {
        return date.getDate().toString();
    }
}

export class LongDayName extends DatePart {
    public static FormatCode:string = 'dddd';
    public static names:string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    protected getValue(date:Date):string {
        return LongDayName.names[date.getDay()];
    }
}

export class ShortDayName extends DatePart {
    public static FormatCode:string = 'ddd';
    public static names:string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    protected getValue(date:Date):string {
        return ShortDayName.names[date.getDay()];
    }
}

export class UnixTimestamp extends DatePart {
    public static FormatCode:string = 'X';
    protected getValue(date:Date):string {
        return Math.round(date.valueOf() / 1000).toString();
    }
}

export class UnixMillisecondTimestamp extends DatePart {
    public static FormatCode:string = 'x';
    protected getValue(date:Date):string {
        return date.valueOf().toString();
    }
}

export class PaddedMilitaryHours extends DatePart {
    public static FormatCode:string = 'HH';
    protected getValue(date:Date):string {
        return this.pad(date.getHours(), 2);
    }
}

export class MilitaryHours extends DatePart {
    public static FormatCode:string = 'H';
    protected getValue(date:Date):string {
        return date.getHours().toString();
    }
}

export class PaddedHours extends DatePart {
    public static FormatCode:string = 'hh';
    protected getValue(date:Date):string {
        return this.pad(date.getHours() > 12 ? date.getHours() - 12 : date.getHours(), 2);
    }
}

export class Hours extends DatePart {
    public static FormatCode:string = 'h';
    protected getValue(date:Date):string {
        return (date.getHours() > 12 ? date.getHours() - 12 : date.getHours()).toString();
    }
}
export class UppercaseMeridiem extends DatePart {
    public static FormatCode:string = 'A';
    protected getValue(date:Date):string {
        return date.getHours() < 12 ? 'AM' : 'PM';
    }
}

export class LowercaseMeridiem extends DatePart {
    public static FormatCode:string = 'a';
    protected getValue(date:Date):string {
        return date.getHours() < 12 ? 'am' : 'pm';
    }
}

export class PaddedMinutes extends DatePart {
    public static FormatCode:string = 'mm';
    protected getValue(date:Date):string {
        return this.pad(date.getMinutes(), 2);
    }
}

export class Minutes extends DatePart {
    public static FormatCode:string = 'm';
    protected getValue(date:Date):string {
        return date.getMinutes().toString();
    }
}

export class PaddedSeconds extends DatePart {
    public static FormatCode:string = 'ss';
    protected getValue(date:Date):string {
        return this.pad(date.getSeconds(), 2);
    }
}

export class Seconds extends DatePart {
    public static FormatCode:string = 's';
    protected getValue(date:Date):string {
        return date.getSeconds().toString();
    }
}

export class UTCOffsetWithColon extends DatePart {
    public static FormatCode:string = 'ZZ';
    protected getValue(date:Date):string {
        let tzo = -date.getTimezoneOffset();
        let dif = tzo >= 0 ? '+' : '-';
        return dif + this.pad(tzo / 60, 2) + ':' + this.pad(tzo % 60, 2);
    }
}

export class UTCOffset extends DatePart {
    public static FormatCode:string = 'Z';
    protected getValue(date:Date):string {
        let tzo = -date.getTimezoneOffset();
        let dif = tzo >= 0 ? '+' : '-';
        return dif + this.pad(tzo / 60, 2) + this.pad(tzo % 60, 2);
    }
}

// ORDER HERE IS IMPORTANT
export let dateParts:{new ():DatePart, FormatCode:string}[] = [
  FourDigitYear, TwoDigitYear, LongMonthName,
  ShortMonthName, PaddedDate, OrdinalDate,
  PaddedDate, UnpaddedDate, LongDayName,
  ShortDayName, UnixTimestamp, UnixMillisecondTimestamp,
  PaddedMilitaryHours, MilitaryHours, PaddedHours,
  Hours, UppercaseMeridiem, LowercaseMeridiem,
  PaddedMinutes, Minutes, PaddedSeconds,
  Seconds, UTCOffsetWithColon, UTCOffset 
];
