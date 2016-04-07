(<any>window)['Datium'] = class Datium {
    public updateOptions:(options:IOptions) => void;
    public isValid:() => boolean;
    public getDate:() => Date;
    public setDate:(d:Date) => void;
    public toString:() => string;
    constructor(element:HTMLInputElement, options:IOptions) {
        let internals = new DatiumInternals(element, options);
        this['updateOptions'] = (options:IOptions) => internals.updateOptions(options);
        this['isValid'] = () => internals.isValid();
        this['getDate'] = () => internals.getDate();
        this['setDate'] = (d:Date) => internals.setDate(d);
        this['toString'] = () => internals.toString();
    }
}