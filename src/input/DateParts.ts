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
    date:Date;
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
    public date:Date;
}
    
let formatBlocks = (function() {
    let formatBlocks:{ [key:string]: new () => IDatePart; } = {};
        
    let monthNames:string[] = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let shortMonthNames:string[] = monthNames.map((v) => v.slice(0, 3));
    let dayNames:string[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let shortDayNames:string[] = dayNames.map((v) => v.slice(0, 3));
    
    function pad(num:number, size:number = 2):string {
        let str = num.toString();
        while(str.length < size) str = '0' + str;
        return str;
    }
    
    class DatePart {
        public date:Date;
        protected selectable:boolean = true;
        
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
    
    formatBlocks['YYYY'] = class extends DatePart {
        public increment() {
            this.date.setFullYear(this.date.getFullYear() + 1);
        }
        
        public decrement() {
            this.date.setFullYear(this.date.getFullYear() - 1);
        }
        
        public setValueFromPartial(partial:string) {
            if (this.getRegEx().test(partial)) {
                return this.setValue(partial);
            } else {
                return false;
            }
        }
        
        public setValue(value:Date|string) {
            if (typeof value === 'object') {
                this.date = new Date(value.valueOf());
                return true;
            } else if (typeof value === 'string' && this.getRegEx().test(value)) {
                this.date.setFullYear(parseInt(value, 10));
                return true;
            }
            return false;
        }
        
        public getRegEx() {
            return /^\d{1,4}$/;
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
    
    formatBlocks['YY'] = class extends formatBlocks['YYYY'] {
        public getMaxBuffer() {
            return 2;
        }
        
        public setValue(value:Date|string) {
            if (typeof value === 'object') {
                this.date = new Date((<Date>value).valueOf());
                return true;
            } else if (typeof value === 'string' && this.getRegEx().test(value)) {
                let base = Math.floor(super.getValue().getFullYear()/100)*100;
                this.date.setFullYear(parseInt(<string>value, 10) + base);
                return true;
            }
            return false;
        }
        
        public getRegEx() {
            return /^\d{1,2}$/;
        }
        
        public toString() {
            return super.toString().slice(-2);
        }
    }
    
    formatBlocks['MMMM'] = class extends DatePart {
        protected getMonths() {
            return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
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
            return 3;
        }
        
        public getLevel() {
            return Level.MONTH;
        }
        
        public toString() {
            return this.getMonths()[this.date.getMonth()];
        }
    }
    
    formatBlocks['MMM'] = class extends formatBlocks['MMMM'] {
        protected getMonths() {
            return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        }
    }
    
    formatBlocks['D'] = class extends DatePart {
        private daysInMonth() {
            return new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0).getDate();
        }
        
        public increment() {
            let num = this.date.getDate() + 1;
            if (num > this.daysInMonth()) num = 1;
            this.date.setDate(num);
        }
        
        public decrement() {
            let num = this.date.getDate() - 1;
            if (num < 1) num = this.daysInMonth();
            this.date.setDate(num);
        }
        
        public setValueFromPartial(partial:string) {
            if (/^\d{1,2}$/.test(partial) && parseInt(partial, 10) < this.daysInMonth()) {
                return this.setValue(parseInt(partial, 10).toString());
            }
            return false;
        }
        
        public setValue(value:Date|string) {
            if (typeof value === 'object') {
                this.date = new Date(value.valueOf());
                return true;
            } else if (typeof value === 'string' && this.getRegEx().test(value) && parseInt(value, 10) < this.daysInMonth()) {
                this.date.setDate(parseInt(value, 10));
                return true;
            }
            return false;
        }
        
        public getRegEx() {
            return /^[1-3]?[0-9]$/;
        }
        
        public getMaxBuffer() {
            return 2;
        }
        
        public getLevel() {
            return Level.DATE;
        }
        
        public toString() {
            return this.date.getDate().toString();
        }
    }
    
    formatBlocks['h'] = class extends DatePart {        
        public increment() {
            let num = this.date.getHours() + 1;
            if (num > 23) num = 0;
            this.date.setHours(num);
        }
        
        public decrement() {
            let num = this.date.getHours() - 1;
            if (num < 0) num = 23;
            this.date.setHours(num);
        }
        
        public setValueFromPartial(partial:string) {
            let num = parseInt(partial, 10);
            if (/^\d{1,2}$/.test(partial) && num < 24 && num >= 0) {
                return this.setValue(num.toString());
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
        
        public getRegEx() {
            return /^[1-5]?[0-9]$/;
        }
        
        public getMaxBuffer() {
            return 2;
        }
        
        public getLevel() {
            return Level.HOUR;
        }
        
        public toString() {
            let hours = this.date.getHours();
            if (hours > 12) hours -= 12;
            if (hours === 0) hours = 12;
            return hours.toString();
        }
    }
    
    formatBlocks['mm'] = class extends DatePart {        
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
            let num = parseInt(partial, 10);
            if (/^\d{1,2}$/.test(partial) && num < 60 && num >= 0) {
                return this.setValue(pad(num));
            }
            return false;
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
            return 2;
        }
        
        public getLevel() {
            return Level.MINUTE;
        }
        
        public toString() {
            return pad(this.date.getMinutes());
        }
    }
    
    formatBlocks['A'] = class extends DatePart {        
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
            return this.date.getHours() < 12 ? 'AM' : 'PM';
        }
    }
    
    formatBlocks['a'] = class extends formatBlocks['A'] {        
        public toString() {
            return super.toString().toLowerCase();
        }
    }
    
    return formatBlocks;
})();


