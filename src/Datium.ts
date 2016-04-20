(<any>window)['Datium'] = class Datium {
    public updateOptions:(options:IOptions) => void;
    public isValid:() => boolean;
    public getInvalidReasons:() => string[];
    public getDate:() => Date;
    public isDirty:() => boolean;
    public setDirty:(dirty:boolean) => void;
    public setDate:(d:Date) => void;
    public toString:() => string;
    public setDefined:() => void;
    constructor(element:HTMLInputElement, options:IOptions) {
        let internals = new DatiumInternals(element, options);
        this['updateOptions'] = (options:IOptions) => internals.updateOptions(options);
        this['isValid'] = () => internals.isValid();
        this['getDate'] = () => internals.getDate();
        this['isDirty'] = () => internals.isDirty();
        this['setDirty'] = (dirty:boolean) => internals.setDirty(dirty);
        this['setDate'] = (d:Date) => internals.setDate(d);
        this['setDefined'] = () => internals.setDefined();
        this['toString'] = () => internals.toString();
        this['getInvalidReasons'] = () => internals.getInvalidReasons();
    }
}