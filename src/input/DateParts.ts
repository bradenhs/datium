interface IDatePart {
    increment():void;
    decrement():void;
    setValueFromPartial(partial:string):boolean;
    setValue(value:Date|string):boolean;
    getValue():Date;
    getRegEx():RegExp;
    setSelectable(selectable:boolean):IDatePart;
    getMaxBuffer():number;
    getLevel():Level;
    isSelectable():boolean;
    toString():string;
}

class PlainText implements IDatePart {
    constructor(private text:string) {}
    public increment() {}
    public decrement() {}
    public setValueFromPartial() { return false }
    public setValue() { return false }
    public getValue():Date { return null }
    public getRegEx():RegExp { return new RegExp(`[${this.text}]`); }
    public setSelectable(selectable:boolean):IDatePart { return this }
    public getMaxBuffer():number { return 0 }
    public getLevel():Level { return Level.NONE }
    public isSelectable():boolean { return false }
    public toString():string { return this.text }
}
    
let formatBlocks = (function() {    
    class DatePart extends Common {
        protected date:Date;
        protected selectable:boolean = true;
        
        constructor(protected options:IOptions) {
            super();
        }
        
        public getValue():Date {
            return this.date
        }
        
        public setSelectable(selectable:boolean) {
            this.selectable = selectable;
            return this;
        }
        
        public isSelectable() {
            return this.selectable;
        }
    }
    
    class FourDigitYear extends DatePart {
        constructor(options:IOptions) { super(options); }
        
        public increment() {
            do {
                this.date.setFullYear(this.date.getFullYear() + 1);
            } while (!this.options.yearSelectable(this.date));
        }
        
        public decrement() {
            do {
                this.date.setFullYear(this.date.getFullYear() - 1);
            } while (!this.options.yearSelectable(this.date));
        }
        
        public setValueFromPartial(partial:string) {
            return this.setValue(partial);
        }
        
        public setValue(value:Date|string) {
            if (typeof value === 'object') {
                let date = new Date(value.valueOf());
                if (!this.options.yearSelectable(date)) return false;
                this.date = date;
                return true;
            } else if (typeof value === 'string' && this.getRegEx().test(value)) {
                let date = new Date(this.date.valueOf());
                date.setFullYear(parseInt(value, 10));
                if (!this.options.yearSelectable(date)) return false;
                this.date = date;
                return true;
            }
            return false;
        }
        
        public getRegEx() {
            return /^-?\d{1,4}$/;
        }
        
        public getMaxBuffer() {
            return 4;
        }
        
        public getLevel() {
            return Level.YEAR;
        }
        
        public toString() {
            return this.date.getFullYear().toString();
        }
    }
    
    class TwoDigitYear extends FourDigitYear {
        constructor(options:IOptions) { super(options); }
        
        public getMaxBuffer() {
            return 2;
        }
        
        public setValue(value:Date|string) {
            if (typeof value === 'object') {
                this.date = new Date(value.valueOf());
                return true;
            } else if (typeof value === 'string' && this.getRegEx().test(value)) {
                let base = Math.floor(super.getValue().getFullYear()/100)*100;
                this.date.setFullYear(parseInt(<string>value, 10) + base);
                return true;
            }
            return false;
        }
        
        public getRegEx() {
            return /^-?\d{1,2}$/;
        }
        
        public toString() {
            return super.toString().slice(-2);
        }
    }
    
    class LongMonthName extends DatePart {
        constructor(options:IOptions) { super(options); }
        
        protected getMonths() {
            return super.getMonths();
        } 
        
        public increment() {
            let num = this.date.getMonth() + 1;
            if (num > 11) num = 0;
            this.date.setMonth(num);
            while (this.date.getMonth() > num) {
                this.date.setDate(this.date.getDate() - 1);
            }
        }
        
        public decrement() {
            let num = this.date.getMonth() - 1;
            if (num < 0) num = 11;
            this.date.setMonth(num);
        }
        
        public setValueFromPartial(partial:string) {
            let month = this.getMonths().filter((month) => {
               return new RegExp(`^${partial}.*$`, 'i').test(month); 
            })[0];
            if (month !== void 0) {
                return this.setValue(month);
            }
            return false;
        }
        
        public setValue(value:Date|string) {
            if (typeof value === 'object') {
                this.date = new Date(value.valueOf());
                return true;
            } else if (typeof value === 'string' && this.getRegEx().test(value)) {
                let num = this.getMonths().indexOf(value);
                this.date.setMonth(num);
                return true;
            }
            return false;
        }
        
        public getRegEx() {
            return new RegExp(`^((${this.getMonths().join(")|(")}))$`, 'i');
        }
        
        public getMaxBuffer() {
            return [2,1,3,2,3,3,3,2,1,1,1,1][this.date.getMonth()];
        }
        
        public getLevel() {
            return Level.MONTH;
        }
        
        public toString() {
            return this.getMonths()[this.date.getMonth()];
        }
    }
    
    class ShortMonthName extends LongMonthName {
        constructor(options:IOptions) { super(options); }
        
        protected getMonths() {
            return super.getShortMonths();
        }
    }
    
    class Month extends LongMonthName {
        constructor(options:IOptions) { super(options); }
        
        public getMaxBuffer() {
            return this.date.getMonth() > 0 ? 1 : 2;
        }
        
        public setValueFromPartial(partial:string) {
            if (/^\d{1,2}$/.test(partial)) {
                let trimmed = this.trim(partial === '0' ? '1' : partial);
                return this.setValue(trimmed);
            }
            return false;
        }
        
        public setValue(value:Date|string) {
            if (typeof value === 'object') {
                this.date = new Date(value.valueOf());
                return true;
            } else if (typeof value === 'string' && this.getRegEx().test(value)) {
                this.date.setMonth(parseInt(value, 10) - 1);
                return true;
            }
            return false;
        }
        
        public getRegEx() {
            return /^([1-9]|(1[0-2]))$/;
        }
        
        public toString() {
            return (this.date.getMonth() + 1).toString();
        }
    }
    
    class PaddedMonth extends Month {
        constructor(options:IOptions) { super(options); }
        
        public setValueFromPartial(partial:string) {
            if (/^\d{1,2}$/.test(partial)) {
                let padded = this.pad(partial === '0' ? '1' : partial);
                return this.setValue(padded);
            }
            return false;
        }
        
        public getRegEx() {
            return /^((0[1-9])|(1[0-2]))$/;            
        }
        
        public toString() {
            return this.pad(super.toString());
        }
    }
    
    class DateNumeral extends DatePart {
        constructor(options:IOptions) { super(options); }
        
        public increment() {
            let num = this.date.getDate() + 1;
            if (num > this.daysInMonth(this.date)) num = 1;
            this.date.setDate(num);
        }
        
        public decrement() {
            let num = this.date.getDate() - 1;
            if (num < 1) num = this.daysInMonth(this.date);
            this.date.setDate(num);
        }
        
        public setValueFromPartial(partial:string) {
            if (/^\d{1,2}$/.test(partial)) {
                let trimmed = this.trim(partial === '0' ? '1' : partial);
                return this.setValue(trimmed);
            }
            return false;
        }
        
        public setValue(value:Date|string) {
            if (typeof value === 'object') {
                this.date = new Date(value.valueOf());
                return true;
            } else if (typeof value === 'string' && this.getRegEx().test(value) && parseInt(value, 10) < this.daysInMonth(this.date)) {
                this.date.setDate(parseInt(value, 10));
                return true;
            }
            return false;
        }
        
        public getRegEx() {
            return /^[1-9]|((1|2)[0-9])|(3[0-1])$/;
        }
        
        public getMaxBuffer() {
            return this.date.getDate() > Math.floor(this.daysInMonth(this.date)/10) ? 1 : 2;
        }
        
        public getLevel() {
            return Level.DATE;
        }
        
        public toString() {
            return this.date.getDate().toString();
        }
    }
    
    class PaddedDate extends DateNumeral {
        constructor(options:IOptions) { super(options); }
        
        public setValueFromPartial(partial:string) {
            if (/^\d{1,2}$/.test(partial)) {
                let padded = this.pad(partial === '0' ? '1' : partial);
                return this.setValue(padded);
            }
            return false;
        }
        
        public getRegEx() {
            return /^(0[1-9])|((1|2)[0-9])|(3[0-1])$/;
        }
        
        public toString() {
            return this.pad(this.date.getDate());
        }
    }
    
    class DateOrdinal extends DateNumeral {
        constructor(options:IOptions) { super(options); }
        
        public getRegEx() {
            return /^([1-9]|((1|2)[0-9])|(3[0-1]))((st)|(nd)|(rd)|(th))?$/i;
        }
        
        public toString() {
            let date = this.date.getDate();
            let j = date % 10;
            let k = date % 100;
            if (j === 1 && k !== 11) return date + "st";
            if (j === 2 && k !== 12) return date + "nd";
            if (j === 3 && k !== 13) return date + "rd";
            return date + "th";
        }
    }
    
    class LongDayName extends DatePart {
        constructor(options:IOptions) { super(options); }
        
        protected getDays() {
            return super.getDays();
        }
        
        public increment() {
            let num = this.date.getDay() + 1;
            if (num > 6) num = 0;
            this.date.setDate(this.date.getDate() - this.date.getDay() + num);
        }
        
        public decrement() {
            let num = this.date.getDay() - 1;
            if (num < 0) num = 6;
            this.date.setDate(this.date.getDate() - this.date.getDay() + num);
        }
        
        public setValueFromPartial(partial:string) {
            let day = this.getDays().filter((day) => {
                return new RegExp(`^${partial}.*$`, 'i').test(day);
            })[0];
            if (day !== void 0) {
                return this.setValue(day);
            }
            return false;
        }
        
        public setValue(value:Date|string) {
            if (typeof value === 'object') {
                this.date = new Date(value.valueOf());
                return true;
            } else if (typeof value === 'string' && this.getRegEx().test(value)) {
                let num = this.getDays().indexOf(value);
                this.date.setDate(this.date.getDate() - this.date.getDay() + num);
                return true;
            }
            return false;
        }
        
        public getRegEx() {
            return new RegExp(`^((${this.getDays().join(")|(")}))$`, 'i');
        }
        
        public getMaxBuffer() {
            return [2,1,2,1,2,1,2][this.date.getDay()];
        }
        
        public getLevel() {
            return Level.DATE;
        }
        
        public toString() {
            return this.getDays()[this.date.getDay()];
        }
    }
    
    class ShortDayName extends LongDayName {
        constructor(options:IOptions) { super(options); }
        
        protected getDays() {
            return super.getShortDays();
        }
    }
    
    class PaddedMilitaryHour extends DatePart {
        constructor(options:IOptions) { super(options); }
        
        public increment() {
            let num = this.date.getHours() + 1;
            if (num > 23) num = 0;
            this.date.setHours(num);
        }
        
        public decrement() {
            let num = this.date.getHours() - 1;
            if (num < 0) num = 23;
            this.date.setHours(num);
            // Day Light Savings Adjustment
            if (this.date.getHours() !== num) {
                this.date.setHours(num - 1);
            }
        }
        
        public setValueFromPartial(partial:string) {
            if (/^\d{1,2}$/.test(partial)) {
                let padded = this.pad(partial);
                return this.setValue(padded);
            }
            return false;
        }
        
        public setValue(value:Date|string) {
            if (typeof value === 'object') {
                this.date = new Date(value.valueOf());
                return true;
            } else if (typeof value === 'string' && this.getRegEx().test(value)) {
                this.date.setHours(parseInt(value, 10));
                return true;
            }
            return false;
        }
        
        public getMaxBuffer() {
            return this.date.getHours() > 2 ? 1 : 2;
        }
        
        public getLevel() {
            return Level.HOUR;
        }
        
        public getRegEx() {
            return /^(((0|1)[0-9])|(2[0-3]))$/;
        }
        
        public toString() {
            return this.pad(this.date.getHours());
        }
    }
    
    class MilitaryHour extends PaddedMilitaryHour {
        constructor(options:IOptions) { super(options); }
        
        public setValueFromPartial(partial:string) {
            if (/^\d{1,2}$/.test(partial)) {
                let trimmed = this.trim(partial);
                return this.setValue(trimmed);
            }
            return false;
        }
        
        public getRegEx() {
            return /^((1?[0-9])|(2[0-3]))$/;
        }
        
        public toString() {
            return this.date.getHours().toString();
        }
    }
    
    class PaddedHour extends PaddedMilitaryHour {
        constructor(options:IOptions) { super(options); }
        
        public setValueFromPartial(partial:string) {
            let padded = this.pad(partial === '0' ? '1' : partial);
            return this.setValue(padded);
        }
        
        public setValue(value:Date|string) {
            if (typeof value === 'object') {
                this.date = new Date(value.valueOf());
                return true;
            } else if (typeof value === 'string' && this.getRegEx().test(value)) {
                let num = parseInt(value, 10);
                if (this.date.getHours() < 12 && num === 12) num = 0;
                if (this.date.getHours() > 11 && num !== 12) num += 12;
                this.date.setHours(num);
                return true;
            }
            return false;
        }
        
        public getRegEx() {
            return /^(0[1-9])|(1[0-2])$/;
        }
        
        public getMaxBuffer() {
            return parseInt(this.toString(), 10) > 1 ? 1 : 2;
        }
        
        public toString() {
            return this.pad(this.getHours(this.date));
        }
    }
    
    class Hour extends PaddedHour {
        constructor(options:IOptions) { super(options); }
        
        public setValueFromPartial(partial:string) {
            let trimmed = this.trim(partial === '0' ? '1' : partial);
            return this.setValue(trimmed);
        }
        
        public getRegEx() {
            return /^[1-9]|(1[0-2])$/;
        }
        
        public toString() {
            return this.trim(super.toString());
        }
    }
    
    class PaddedMinute extends DatePart {
        constructor(options:IOptions) { super(options); }
        
        public increment() {
            let num = this.date.getMinutes() + 1;
            if (num > 59) num = 0;
            this.date.setMinutes(num);
        }
        
        public decrement() {
            let num = this.date.getMinutes() - 1;
            if (num < 0) num = 59;
            this.date.setMinutes(num);
        }
        
        public setValueFromPartial(partial:string) {
            return this.setValue(this.pad(partial));
        }
        
        public setValue(value:Date|string) {
            if (typeof value === 'object') {
                this.date = new Date(value.valueOf());
                return true;
            } else if (typeof value === 'string' && this.getRegEx().test(value)) {
                this.date.setMinutes(parseInt(value, 10));
                return true;
            }
            return false;
        }
        
        public getRegEx() {
            return /^[0-5][0-9]$/;
        }
        
        public getMaxBuffer() {
            return this.date.getMinutes() > 5 ? 1 : 2;
        }
        
        public getLevel() {
            return Level.MINUTE;
        }
        
        public toString() {
            return this.pad(this.date.getMinutes());
        }
    }
    
    class Minute extends PaddedMinute {
        constructor(options:IOptions) { super(options); }
        
        public setValueFromPartial(partial:string) {
            return this.setValue(this.trim(partial));
        }
        
        public getRegEx() {
            return /^[0-5]?[0-9]$/;
        }
        
        public toString() {
            return this.date.getMinutes().toString();
        }
    }
    
    class PaddedSecond extends DatePart {
        constructor(options:IOptions) { super(options); }
        
        public increment() {
            let num = this.date.getSeconds() + 1;
            if (num > 59) num = 0;
            this.date.setSeconds(num);
        }
        
        public decrement() {
            let num = this.date.getSeconds() - 1;
            if (num < 0) num = 59;
            this.date.setSeconds(num);
        }
        
        public setValueFromPartial(partial:string) {
            return this.setValue(this.pad(partial));
        }
        
        public setValue(value:Date|string) {
            if (typeof value === 'object') {
                this.date = new Date(value.valueOf());
                return true;
            } else if (typeof value === 'string' && this.getRegEx().test(value)) {
                this.date.setSeconds(parseInt(value, 10));
                return true;
            }
            return false;
        }
        
        public getRegEx() {
            return /^[0-5][0-9]$/;
        }
        
        public getMaxBuffer() {
            return this.date.getSeconds() > 5 ? 1 : 2;
        }
        
        public getLevel() {
            return Level.SECOND;
        }
        
        public toString() {
            return this.pad(this.date.getSeconds());
        }
    }
    
    class Second extends PaddedSecond {
        constructor(options:IOptions) { super(options); }
        
        public setValueFromPartial(partial:string) {
            return this.setValue(this.trim(partial));
        }
        
        public getRegEx() {
            return /^[0-5]?[0-9]$/;
        }
        
        public toString() {
            return this.date.getSeconds().toString();
        }
        
    }
    
    class UppercaseMeridiem extends DatePart {
        constructor(options:IOptions) { super(options); }
        
        public increment() {
            let num = this.date.getHours() + 12;
            if (num > 23) num -= 24;
            this.date.setHours(num);
        }
        
        public decrement() {
            let num = this.date.getHours() - 12;
            if (num < 0) num += 24;
            this.date.setHours(num);
        }
        
        public setValueFromPartial(partial:string) {
            if (/^((AM?)|(PM?))$/i.test(partial)) {
                return this.setValue(partial[0] === 'A' ? 'AM' : 'PM');
            }
            return false;
        }
        
        public setValue(value:Date|string) {
            if (typeof value === 'object') {
                this.date = new Date(value.valueOf());
                return true;
            } else if (typeof value === 'string' && this.getRegEx().test(value)) {
                if (value.toLowerCase() === 'am' && this.date.getHours() > 11) {
                    this.date.setHours(this.date.getHours() - 12);
                } else if (value.toLowerCase() === 'pm' && this.date.getHours() < 12) {
                    this.date.setHours(this.date.getHours() + 12);
                }
                return true;
            }
            return false;
        }
        
        public getLevel() {
            return Level.HOUR;
        }
        
        public getMaxBuffer() {
            return 1;
        }
        
        public getRegEx() {
            return /^((am)|(pm))$/i;
        }
        
        public toString() {
            return this.getMeridiem(this.date).toUpperCase();
        }
    }
    
    class LowercaseMeridiem extends UppercaseMeridiem {
        public toString() {
            return this.getMeridiem(this.date);
        }
    }
    
    let formatBlocks:{ [key:string]: new (options:IOptions) => IDatePart; } = {};
    
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


