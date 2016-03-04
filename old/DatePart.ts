/// <reference path="FormatBlocks.ts" />

class ADatePart {    
        
    private str:(d:Date) => string;
    private regExpString:string;
    private inc:(d:Date) => Date;
    private dec:(d:Date) => Date;
    private set:(d:Date, v:string|number) => Date;
    
    private value:string;
    private selectable:boolean;
    private maxBuffer:(d:Date) => number;
    
    constructor(arg:IFormatBlock|String, selectableOverride:boolean) {
        if (typeof arg === "object") {
            this.str = (<IFormatBlock>arg).str;
            this.inc = (<IFormatBlock>arg).inc;
            this.dec = (<IFormatBlock>arg).dec;
            this.set = (<IFormatBlock>arg).set;
            this.maxBuffer = (<IFormatBlock>arg).maxBuffer;
            this.regExpString = (<IFormatBlock>arg).regExp;
            this.selectable = this.inc !== void 0 && this.dec !== void 0;
        } else {
            this.value = <string>arg;
            this.regExpString = this.regExpEscape(this.value);
            this.selectable = false;
        }
        if (typeof selectableOverride === "boolean") {
            this.selectable = selectableOverride;
        }
    }

    private regExpEscape = (str:string):string => {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        
    }
    
    private clone = (d:Date):Date => {
        return new Date(d.valueOf());
    }
    
    public increment = (d:Date):Date => {
        return this.inc(this.clone(d));
    }
        
    public decrement = (d:Date):Date => {
        return this.dec(this.clone(d));
    }            
    
    public setValue = (d:Date):DatePart => {
        if (this.str === void 0) return this;
        this.value = this.str(this.clone(d));
        return this;
    }
    
    public toString = ():string => {
        return this.value;
    }
                
    public isSelectable = ():boolean => {
        return this.selectable;
    }
                
    public getRegExpString = ():string => {
        return this.regExpString;
    }

    public getDateFromString = (date:Date, partial:string):Date => {
        return this.set(this.clone(date), partial);
    }
    
    public getMaxBufferSize = (date:Date):number => {
        if (this.maxBuffer === void 0) return void 0;
        return this.maxBuffer(this.clone(date));                
    }
}