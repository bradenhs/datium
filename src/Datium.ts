(<any>window)['Datium'] = class Datium {
    public update:(options:IOptions) => void;
    constructor(element:HTMLInputElement, options:IOptions) {
        let internals = new DatiumInternals(element, options);
        this.update = (options:IOptions) => internals.update(options);
    }
}