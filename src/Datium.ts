(<any>window)['Datium'] = class Datium {
    public update:(options:IOptions) => void;
    constructor(options:IOptions) {
        let internals = new DatiumInternals(options);
        this.update = internals.update;
    }
}