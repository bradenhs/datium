interface IDatePart {
    increment():Date;
    decrement():Date;
    setValue(value:Date|number|string):Date;
    getRegEx():string;
    toString():string;
}

class PlainText implements IDatePart {
    constructor(private text:string) {}
    public increment = ():Date => null;
    public decrement = ():Date => null;
    public setValue = (value:Date|number|string):Date => null;
    public getRegEx = ():string => null;
    public toString = ():string => this.text;
}

let formatBlocks = (function() {
    let formatBlocks:{ [key:string]: new () => IDatePart; } = {};
    
    class DatePart {
        protected date:Date;
        protected increment = ():Date => {
            if (this.date === void 0) return void 0;
            
        }
    }
    
    formatBlocks['YYYY'] = class extends DatePart implements IDatePart {
        public increment = ():Date => {
            return super.increment();
        }
        
        public decrement = ():Date => {
            return null;
        }
        
        public setValue = (value:Date|number|string):Date => {
            return null;
        }
        
        public getRegEx = ():string => '\\d{4,4}';
        
        public toString = ():string => {
            if (this.date === void 0) return '----';
            return this.date.getFullYear().toString();
        }
    }
    
    return formatBlocks;
})();




