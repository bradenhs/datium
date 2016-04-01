function OptionException(msg:string) {
    return `[Datium Option Exception]\n  ${msg}\n  See http://datium.io/documentation for documentation.`;
}

class OptionSanitizer {
    
    static dfltDate:Date = new Date();
    
    static sanitizeDisplayAs(displayAs:any, dflt:string = 'h:mma MMM D, YYYY') {
        if (displayAs === void 0) return dflt;
        if (typeof displayAs !== 'string') throw OptionException('The "displayAs" option must be a string');
        return displayAs;
    }
    
    static sanitizeMinDate(minDate:any, dflt:Date = new Date(-8640000000000000)) {
        if (minDate === void 0) return dflt;
        return new Date(minDate); //TODO figure this out yes
    }
    
    static sanitizeMaxDate(maxDate:any, dflt:Date = new Date(8640000000000000)) {
        if (maxDate === void 0) return dflt;
        return new Date(maxDate); //TODO figure this out 
    }
    
    static sanitizeDefaultDate(defaultDate:any, dflt:Date = this.dfltDate) {
        if (defaultDate === void 0) return dflt;
        return new Date(defaultDate); //TODO figure this out
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
    
    static sanitizeIsSecondSelectable(isSecondSelectable:any, dflt:any = (date:Date) => true) {
        return dflt;
    }
    
    static sanitizeIsMinuteSelectable(isMinuteSelectable:any, dflt:any = (date:Date) => true) {
        return (date:Date) => date.getMinutes() % 15 === 0;
    }
    
    static sanitizeIsHourSelectable(isHourSelectable:any, dflt:any = (date:Date) => true) {
        return dflt;
    }
    
    static sanitizeIsDateSelectable(isDateSelectable:any, dflt:any = (date:Date) => true) {
        return (date:Date) => date.getDay() !== 0 && date.getDay() !== 6;
    }
    
    static sanitizeIsMonthSelectable(isMonthSelectable:any, dflt:any = (date:Date) => true) {
        return dflt;
    }
    
    static sanitizeIsYearSelectable(isYearSelectable:any, dflt:any = (date:Date) => true) {
        return dflt;
    }
    
    static sanitizeMilitaryTime(militaryTime:any, dflt:boolean = false) {
        if (militaryTime === void 0) return dflt;
        if (typeof militaryTime !== 'boolean') {
            throw OptionException('The "militaryTime" option must be a boolean');
        }
        return <boolean>militaryTime;
    }
    
    static sanitize(options:IOptions, defaults:IOptions) {
        let minDate = OptionSanitizer.sanitizeMinDate(options['minDate'], defaults.minDate);
        let maxDate = OptionSanitizer.sanitizeMaxDate(options['maxDate'], defaults.maxDate);
        
        let yearSelectable = OptionSanitizer.sanitizeIsYearSelectable(options['isYearSelectable'], defaults.isYearSelectable);
        let monthSelectable = OptionSanitizer.sanitizeIsMonthSelectable(options['isMonthSelectable'], defaults.isMonthSelectable);
        let dateSelectable = OptionSanitizer.sanitizeIsDateSelectable(options['isDateSelectable'], defaults.isDateSelectable);
        let hourSelectable = OptionSanitizer.sanitizeIsHourSelectable(options['isHourSelectable'], defaults.isHourSelectable);
        let minuteSelectable = OptionSanitizer.sanitizeIsMinuteSelectable(options['isMinuteSelectable'], defaults.isMinuteSelectable);
        let secondSelectable = OptionSanitizer.sanitizeIsSecondSelectable(options['isSecondSelectable'], defaults.isSecondSelectable);
        
        let isYearSelectable = (d:Date) => {
            if (new Date(d.getFullYear(), 0).valueOf() > maxDate.valueOf() ||
                new Date(d.getFullYear() + 1, 0).valueOf() < minDate.valueOf()) return false;
            return yearSelectable(d);
        }
        let isMonthSelectable = (d:Date) => {
            if (new Date(d.getFullYear(), d.getMonth()).valueOf() > maxDate.valueOf() ||
                new Date(d.getFullYear(), d.getMonth() + 1).valueOf() < minDate.valueOf()) return false;
            return isYearSelectable(d) &&
                   monthSelectable(d);
        }
        let isDateSelectable = (d:Date) => {
            if (new Date(d.getFullYear(), d.getMonth(), d.getDate()).valueOf() > maxDate.valueOf() ||
                new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).valueOf() < minDate.valueOf()) return false;
            return isMonthSelectable(d) &&
                   dateSelectable(d);
        }
        let isHourSelectable = (d:Date) => {
            if (new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()).valueOf() > maxDate.valueOf() ||
                new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours() + 1).valueOf() < minDate.valueOf()) return false;
            return isDateSelectable(d) &&
                   hourSelectable(d);
        }
        let isMinuteSelectable = (d:Date) => {
            if (new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()).valueOf() > maxDate.valueOf() ||
                new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes() + 1).valueOf() < minDate.valueOf()) return false;
            return isHourSelectable(d) &&
                   minuteSelectable(d);
        }
        let isSecondSelectable = (d:Date) => {
            if (new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()).valueOf() > maxDate.valueOf() ||
                new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds() + 1).valueOf() < minDate.valueOf()) return false;
            return isMinuteSelectable(d) &&
                   secondSelectable(d);
        }
        
        let opts:IOptions = {
            displayAs: OptionSanitizer.sanitizeDisplayAs(options['displayAs'], defaults.displayAs),
            minDate: minDate,
            maxDate: maxDate,
            defaultDate: OptionSanitizer.sanitizeDefaultDate(options['defaultDate'], defaults.defaultDate),
            theme: OptionSanitizer.sanitizeTheme(options['theme'], defaults.theme),
            militaryTime: OptionSanitizer.sanitizeMilitaryTime(options['militaryTime'], defaults.militaryTime),
            isSecondSelectable: isSecondSelectable,
            isMinuteSelectable: isMinuteSelectable,
            isHourSelectable: isHourSelectable,
            isDateSelectable: isDateSelectable,
            isMonthSelectable: isMonthSelectable,
            isYearSelectable: isYearSelectable
        }
        
        return opts;
    }
}