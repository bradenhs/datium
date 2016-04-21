class PlainText implements IDatePart {
    constructor(private text:string) {}
    public increment() {}
    public decrement() {}
    public setValueFromPartial() { return false }
    public setValue() { return false }
    public getLastValue():Date { return null }
    public getValue():Date { return null }
    public getRegEx():RegExp { return new RegExp(`[${this.text}]`); }
    public setSelectable(selectable:boolean):IDatePart { return this }
    public getMaxBuffer():number { return 0 }
    public getLevel():Level { return Level.NONE }
    public isValid():boolean { return false }
    public isSelectable():boolean { return false }
    public isDefined():boolean { return false }
    public setDefined() {}
    public toString():string { return this.text }
}