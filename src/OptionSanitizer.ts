function OptionException(msg:string) {
    return `[Datium Option Exception]\n  ${msg}\n  See the readme for documentation.\n`;
}

class OptionSanitizer {
    
    static sanitizeDisplayAs(displayAs:any, dflt:string = 'h:mma MMM D, YYYY') {
        if (displayAs === void 0) return dflt;
        if (typeof displayAs !== 'string') throw OptionException('The "displayAs" option must be a string');
        return displayAs;
    }
    
    static sanitizeMinDate(minDate:any, dflt:Date = new Date(-62135658000000)) {
        if (minDate === void 0) return dflt;
        let date = new Date(minDate);
        if (date.toString() === 'Invalid Date') throw OptionException('The "minDate" option is invalid.');
        return date;
    }
    
    static sanitizeMaxDate(maxDate:any, dflt:Date = new Date(8640000000000000)) {
        if (maxDate === void 0) return dflt;
        let date = new Date(maxDate);
        if (date.toString() === 'Invalid Date') throw OptionException('The "maxDate" option is invalid.');
        return date;
    }
    
    static sanitizeInitialDate(initialDate:any, dflt:Date = new Date()) {
        if (initialDate === void 0) return dflt;
        let date = new Date(initialDate);
        if (date.toString() === 'Invalid Date') throw OptionException('The "initialDate" option is invalid.');
        return date;
    }
        
    static sanitizeColor(color:any) {
        let threeHex = '\\s*#[A-Fa-f0-9]{3}\\s*';
        let sixHex = '\\s*#[A-Fa-f0-9]{6}\\s*';
        let rgb = '\\s*rgb\\(\\s*[0-9]{1,3}\\s*,\\s*[0-9]{1,3}\\s*,\\s*[0-9]{1,3}\\s*\\)\\s*';
        let rgba = '\\s*rgba\\(\\s*[0-9]{1,3}\\s*,\\s*[0-9]{1,3}\\s*,\\s*[0-9]{1,3}\\s*\\,\\s*[0-9]*\\.[0-9]+\\s*\\)\\s*';
        let sanitizeColorRegex = new RegExp(`^((${threeHex})|(${sixHex})|(${rgb})|(${rgba}))$`);

        if (color === void 0) throw OptionException("All theme colors (primary, primary_text, secondary, secondary_text, secondary_accent) must be defined");
        if (!sanitizeColorRegex.test(color)) throw OptionException("All theme colors must be valid rgb, rgba, or hex code");
        return <string>color;
    }
    
    static sanitizeTheme(theme:any, dflt:any = "material"):ITheme {
        if (theme === void 0) return OptionSanitizer.sanitizeTheme(dflt, void 0);
        if (typeof theme === 'string') {
            switch(theme) {
            case 'light':
                return <ITheme>{
                    primary: '#eee',
                    primary_text: '#666',
                    secondary: '#fff',
                    secondary_text: '#666',
                    secondary_accent: '#666'
                }
            case 'dark':
                return <ITheme>{
                    primary: '#444',
                    primary_text: '#eee',
                    secondary: '#333',
                    secondary_text: '#eee',
                    secondary_accent: '#fff'
                }
            case 'material':
                return <ITheme>{
                    primary: '#019587',
                    primary_text: '#fff',
                    secondary: '#fff',
                    secondary_text: '#888',
                    secondary_accent: '#019587'
                }
            default:
                throw "Name of theme not valid.";
            }
        } else if (typeof theme === 'object') {
            return <ITheme> {
                primary: OptionSanitizer.sanitizeColor(theme['primary']),
                secondary: OptionSanitizer.sanitizeColor(theme['secondary']),
                primary_text: OptionSanitizer.sanitizeColor(theme['primary_text']),
                secondary_text: OptionSanitizer.sanitizeColor(theme['secondary_text']),
                secondary_accent: OptionSanitizer.sanitizeColor(theme['secondary_accent'])
            }
        } else {
            throw OptionException('The "theme" option must be object or string');
        }
    }
    
    static sanitizeIsSecondValid(isSecondValid:any, dflt:any = () => true) {
        if (isSecondValid === void 0) return dflt;
        if (typeof isSecondValid !== 'function')
            throw OptionException('The "isSecondValid" option should be a function with signature (date:Date) => boolean');
        return isSecondValid;
    }
    
    static sanitizeIsMinuteValid(isMinuteValid:any, dflt:any = () => true) {
        if (isMinuteValid === void 0) return dflt;
        if (typeof isMinuteValid !== 'function')
            throw OptionException('The "isMinuteValid" option should be a function with signature (date:Date) => boolean');
        return isMinuteValid;
    }
    
    static sanitizeIsHourValid(isHourValid:any, dflt:any = () => true) {
        if (isHourValid === void 0) return dflt;
        if (typeof isHourValid !== 'function')
            throw OptionException('The "isHourValid" option should be a function with signature (date:Date) => boolean');
        return isHourValid;
    }
    
    static sanitizeIsDateValid(isDateValid:any, dflt:any = () => true) {
        if (isDateValid === void 0) return dflt;
        if (typeof isDateValid !== 'function')
            throw OptionException('The "isDateValid" option should be a function with signature (date:Date) => boolean');
        return isDateValid;
    }
    
    static sanitizeIsMonthValid(isMonthValid:any, dflt:any = () => true) {
        if (isMonthValid === void 0) return dflt;
        if (typeof isMonthValid !== 'function')
            throw OptionException('The "isMonthValid" option should be a function with signature (date:Date) => boolean');
        return isMonthValid;
    }
    
    static sanitizeIsYearValid(isYearValid:any, dflt:any = () => true) {
        if (isYearValid === void 0) return dflt;
        if (typeof isYearValid !== 'function')
            throw OptionException('The "isYearValid" option should be a function with signature (date:Date) => boolean');
        return isYearValid;
    }
    
    static sanitizeMilitaryTime(militaryTime:any, dflt:boolean = false) {
        if (militaryTime === void 0) return dflt;
        if (typeof militaryTime !== 'boolean') {
            throw OptionException('The "militaryTime" option must be a boolean');
        }
        return <boolean>militaryTime;
    }
    
    static sanitizeShowPicker(showPicker:any, dflt:boolean = true) {
        if (showPicker === void 0) return dflt;
        if (typeof showPicker !== 'boolean') {
            throw OptionException('The "showPicker" option must be a boolean');
        }
        return <boolean>showPicker;
    }
    
    static sanitizeTransition(transition:any, dflt:boolean = true) {
        if (transition === void 0) return dflt;
        if (typeof transition !== 'boolean') {
            throw OptionException('The "transition" option must be a boolean');
        }
        return <boolean>transition;
    }
    
    static sanitize(options:IOptions, defaults:IOptions) {        
        let minDate = OptionSanitizer.sanitizeMinDate(options['minDate'], defaults.minDate);
        let maxDate = OptionSanitizer.sanitizeMaxDate(options['maxDate'], defaults.maxDate);
        
        if (minDate.valueOf() > maxDate.valueOf()) {
            throw OptionException('"minDate" must be before "maxDate"');
        }
        
        let opts:IOptions = {
            displayAs: OptionSanitizer.sanitizeDisplayAs(options['displayAs'], defaults.displayAs),
            minDate: minDate,
            maxDate: maxDate,
            initialDate: OptionSanitizer.sanitizeInitialDate(options['initialDate'], defaults.initialDate),
            theme: OptionSanitizer.sanitizeTheme(options['theme'], defaults.theme),
            militaryTime: OptionSanitizer.sanitizeMilitaryTime(options['militaryTime'], defaults.militaryTime),
            isSecondValid: OptionSanitizer.sanitizeIsSecondValid(options['isSecondValid'], defaults.isSecondValid),
            isMinuteValid: OptionSanitizer.sanitizeIsMinuteValid(options['isMinuteValid'], defaults.isMinuteValid),
            isHourValid: OptionSanitizer.sanitizeIsHourValid(options['isHourValid'], defaults.isHourValid),
            isDateValid: OptionSanitizer.sanitizeIsDateValid(options['isDateValid'], defaults.isDateValid),
            isMonthValid: OptionSanitizer.sanitizeIsMonthValid(options['isMonthValid'], defaults.isMonthValid),
            isYearValid: OptionSanitizer.sanitizeIsYearValid(options['isYearValid'], defaults.isYearValid),
            showPicker: OptionSanitizer.sanitizeShowPicker(options['showPicker'], defaults.showPicker),
            transition: OptionSanitizer.sanitizeTransition(options['transition'], defaults.transition)
        }
        
        return opts;
    }
}

// TODO negative years
// alternate display as string[]