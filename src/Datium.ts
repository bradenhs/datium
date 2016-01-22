import DatiumInternals from 'src/DatiumInternals';

class Datium {
    constructor(options:any) {
        new DatiumInternals(options);
    }
}

(<any>window).Datium = Datium;