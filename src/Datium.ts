import DatiumInternals from 'src/DatiumInternals';
import DatepickerInput from 'src/input/DatepickerInput';


class Datium {
    constructor(options:any) {
        new DatepickerInput(options.element, options.displayFormat, new Date());
        //new DatiumInternals(options);
    }
}

(<any>window).Datium = Datium;