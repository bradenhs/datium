/// <reference path="OptionSanitizer.ts" />

(<any>window)['Datium'] = (function() {
    let options:IOptions;
    
    return class {
        constructor(opts:IOptions) {
            this.updateOptions(opts);
        }
        
        updateOptions(opts:IOptions):void {
            options = OptionSanitizer.sanitize(opts);
        }
    }
})();