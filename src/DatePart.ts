/// <reference path="FormatBlocks.ts" />

class DatePart {
    
    increment:(d:Date) => Date;
    decrement:(d:Date) => Date;        
    setValue:(d:Date) => DatePart;
    toString:() => string;        
    isSelectable:() => boolean;        
    getRegExpString:() => string;        
    getDateFromString:(date:Date, partial:string) => Date;        
    getMaxBufferSize:(date:Date) => number;
    
    constructor(arg:IFormatBlock|String, selectableOverride?:boolean) {
        
        // PRIVATE
        
        let str:(d:Date) => string;
        let regExpString:string;
        let inc:(d:Date) => Date;
        let dec:(d:Date) => Date;
        let set:(d:Date, v:string|number) => Date;
        
        let value:string;
        let selectable:boolean;
        let maxBuffer:(d:Date) => number;

        function regExpEscape(str:string):string {
            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        }
        
        function clone(d:Date):Date {
            return new Date(d.valueOf());
        }
        
        // CONSTRUCTOR
        
        if (typeof arg === 'object') {
            str = (<IFormatBlock>arg).str;
            inc = (<IFormatBlock>arg).inc;
            dec = (<IFormatBlock>arg).dec;
            set = (<IFormatBlock>arg).set;
            maxBuffer = (<IFormatBlock>arg).maxBuffer;
            regExpString = (<IFormatBlock>arg).regExp;
            selectable = inc !== void 0 && dec !== void 0;
        } else {
            value = <string>arg;
            regExpString = regExpEscape(value);
            selectable = false;
        }
        if (typeof selectableOverride === 'boolean') {
            selectable = selectableOverride;
        }
        
        // PUBLIC
        
        this.increment = (d:Date) => inc(clone(d));
        
        this.decrement = (d:Date) => dec(clone(d));            
        
        this.setValue = (d:Date) => {
            if (str === void 0) return this;
            value = str(clone(d));
            return this;
        }
        
        this.toString = () => value;
                    
        this.isSelectable = () => selectable;
                    
        this.getRegExpString = () => regExpString;
    
        this.getDateFromString = (date:Date, partial:string) => set(clone(date), partial);
        
        this.getMaxBufferSize = (date:Date) => {
            if (maxBuffer === void 0) return void 0;
            return maxBuffer(clone(date));                
        }
    }
}