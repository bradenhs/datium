class OptionSanitizer {
    
    static dfltDate:Date = new Date();
    
    static sanitizeDisplayAs(displayAs:any, dflt:string = 'h:mma MMM D, YYYY') {
        if (displayAs === void 0) return dflt;
        if (typeof displayAs !== 'string') throw 'Display as must be a string';
        return displayAs;
    }
    
    static sanitizeMinDate(minDate:any, dflt:Date = void 0) {
        if (minDate === void 0) return dflt;
        return new Date(minDate); //TODO figure this out
    }
    
    static sanitizeMaxDate(maxDate:any, dflt:Date = void 0) {
        if (maxDate === void 0) return dflt;
        return new Date(maxDate); //TODO figure this out
    }
    
    static sanitizeDefaultDate(defaultDate:any, dflt:Date = this.dfltDate) {
        if (defaultDate === void 0) return dflt;
        return new Date(defaultDate); //TODO figure this out
    }
    
    static sanitize(options:IOptions, defaults:IOptions) {
        return <IOptions>{
            displayAs: OptionSanitizer.sanitizeDisplayAs(options['displayAs'], defaults.displayAs),
            minDate: OptionSanitizer.sanitizeMinDate(options['minDate'], defaults.minDate),
            maxDate: OptionSanitizer.sanitizeMaxDate(options['maxDate'], defaults.maxDate),
            defaultDate: OptionSanitizer.sanitizeDefaultDate(options['defaultDate'], defaults.defaultDate)
        }
    }
}