class OptionSanitizer {
        
    static sanitizeDisplayAs(displayAs:string, dflt:string = 'h:mma MMM D, YYYY') {
        if (displayAs === void 0) return dflt;
        if (typeof displayAs !== 'string') throw 'Display as must be a string';
        return displayAs;
    }
    
    static sanitize(options:IOptions, defaults:IOptions) {
        return <IOptions>{
            displayAs: OptionSanitizer.sanitizeDisplayAs(options['displayAs'], defaults.displayAs)
        }
    }
}