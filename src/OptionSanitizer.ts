let OptionSanitizer = (() => {
    let sanitizeElement = (element:HTMLInputElement):HTMLInputElement => {
        if (element === void 0) throw 'DATIUM: "element" option is required';
        console.log('oh yeah aha');
        return element;
    }
    
    return class {
        static sanitize(opts:IOptions):IOptions {
            return {
                element: sanitizeElement(opts.element)
            };
        }
    }
})();