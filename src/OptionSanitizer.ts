class OptionSanitizer {
    static sanitizeElement = (element:HTMLInputElement) => {
        if (element === void 0) throw 'Element must be defined';
        return element;
    };
    
    static sanitizeDisplayAs = (displayAs:string) => {
        if (displayAs === void 0) return 'YYYY mmm ddd';
        if (typeof displayAs !== 'string') throw 'Display as must be a string';
        return displayAs;
    }
    
    static sanitize = (options:IOptions) => {
        return <IOptions>{
            element: OptionSanitizer.sanitizeElement(options['element']),
            displayAs: OptionSanitizer.sanitizeDisplayAs(options['displayAs'])
        }
    }
}