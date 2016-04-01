(<any>window)['Datium'] = class Datium {
    public updateOptions:(options:IOptions) => void;
    constructor(element:HTMLInputElement, options:IOptions) {
        let internals = new DatiumInternals(element, options);
        this['updateOptions'] = (options:IOptions) => internals.updateOptions(options);
    }
}