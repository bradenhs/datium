interface IDatePart {
    increment():void;
    decrement():void;
    setValue(value:Date|string):void;
    getValue():Date;
    getRegEx():RegExp;
    setSelectable(selectable:boolean):IDatePart;
    getLevel():Level;
    isSelectable():boolean;
    toString():string;
}

class PlainText implements IDatePart {
    constructor(private text:string) {}
    public increment() {}
    public decrement() {}
    public setValue() {}
    public getValue():Date { return null }
    public getRegEx():RegExp { return null }
    public setSelectable():IDatePart { return this }
    public getLevel():Level { return Level.NONE }
    public isSelectable():boolean { return false }
    public toString():string { return this.text }
}
    
let formatBlocks = (function() {
    let formatBlocks:{ [key:string]: new () => IDatePart; } = {};
        
    const monthNames:string[] = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dayNames:string[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    class DatePart {
        protected date:Date;
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
        
        public setValue(value:Date|string) {
            if (value instanceof Date) {
                this.date = new Date(value.valueOf());
            } else if (typeof value === 'string' && this.getRegEx().test(value)) {
                this.date.setFullYear(parseInt(value, 10));
            } else {
                this.date = void 0;
            }
        }
        
        public getRegEx() {
            return /^\d+$/;
        }
        
        public getLevel() {
            return Level.YEAR;
        }
        
        public toString() {
            if (this.date === void 0) return '----';
            return this.date.getFullYear().toString();
        }
    }
    
    formatBlocks['MMM'] = class extends DatePart {
        public increment() {
            let num = this.date.getMonth() + 1;
            if (num > 11) num = 0;
            this.date.setMonth(num);
        }
        
        public decrement() {
            let num = this.date.getMonth() - 1;
            if (num < 0) num = 11;
            this.date.setMonth(num);
        }
        
        public setValue(value:Date|string) {
            if (value instanceof Date) {
                this.date = new Date(value.valueOf());
            } else if (typeof value === 'string' && this.getRegEx().test(value)) {
                let num = monthNames.map((v:string) => v.slice(0,3)).indexOf(value);
                this.date.setMonth(num);
            } else {
                this.date = void 0;
            }
        }
        
        public getRegEx() {
            return new RegExp(`^((${monthNames.map((v:string) => v.slice(0,3)).join(")|(")}))$`);
        }
        
        public getLevel() {
            return Level.MONTH;
        }
        
        public toString() {
            if (this.date === void 0) return '---';
            return monthNames.map((v:string) => v.slice(0,3))[this.date.getMonth()];
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
        
        public setValue(value:Date|string) {
            if (value instanceof Date) {
                this.date = new Date(value.valueOf());
            } else if (typeof value === 'string' && this.getRegEx().test(value) && parseInt(value, 10) < this.daysInMonth()) {
                this.date.setDate(parseInt(value, 10));
            } else {
                this.date = void 0;
            }
        }
        
        public getRegEx() {
            return /^[1-3]?[0-9]$/;
        }
        
        public getLevel() {
            return Level.DATE;
        }
        
        public toString() {
            if (this.date === void 0) return '--';
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
        
        public setValue(value:Date|string) {
            if (value instanceof Date) {
                this.date = new Date(value.valueOf());
            } else if (typeof value === 'string' && this.getRegEx().test(value)) {
                this.date.setHours(parseInt(value, 10));
            } else {
                this.date = void 0;
            }
        }
        
        public getRegEx() {
            return /^[1-5]?[0-9]$/;
        }
        
        public getLevel() {
            return Level.HOUR;
        }
        
        public toString() {
            if (this.date === void 0) return '--';
            return this.date.getHours().toString();
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
        
        public setValue(value:Date|string) {
            if (value instanceof Date) {
                this.date = new Date(value.valueOf());
            } else if (typeof value === 'string' && this.getRegEx().test(value)) {
                this.date.setHours(parseInt(value, 10));
            } else {
                this.date = void 0;
            }
        }
        
        public getRegEx() {
            return /^[0-5][0-9]$/;
        }
        
        public getLevel() {
            return Level.MINUTE;
        }
        
        public toString() {
            if (this.date === void 0) return '--';
            return this.date.getMinutes().toString();
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
        
        public setValue(value:Date|string) {
            if (value instanceof Date) {
                this.date = new Date(value.valueOf());
            } else if (typeof value === 'string' && this.getRegEx().test(value)) {
                if (value.toLowerCase() === 'am' && this.date.getHours() > 11) {
                    this.date.setHours(this.date.getHours() - 12);
                } else if (value.toLowerCase() === 'pm' && this.date.getHours() < 12) {
                    this.date.setHours(this.date.getHours() + 12);
                }
                this.date.setHours(parseInt(value, 10));
            } else {
                this.date = void 0;
            }
        }
        
        public getLevel() {
            return Level.HOUR;
        }
        
        public getRegEx() {
            return /^((AM)|(PM))$/;
        }
        
        public toString() {
            if (this.date === void 0) return '--';
            return this.date.getHours() < 12 ? 'AM' : 'PM';
        }
    }
    
    formatBlocks['a'] = class extends formatBlocks['A'] {
        public getRegEx() {
            return /^((am)|(pm))$/;
        }
        
        public toString() {
            return super.toString().toLowerCase();
        }
    }
    
    return formatBlocks;
})();


