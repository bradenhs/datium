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
    
    static sanitizeMinDate(minDate:any, dflt:Date = void 0) {
        if (minDate === void 0) return dflt;
        return new Date(minDate); //TODO figure this out yes
    }
    
    static sanitizeMaxDate(maxDate:any, dflt:Date = void 0) {
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
    
    static sanitizeSecondSelectable(secondSelectable:any, dflt:any = (d:Date) => true) {
        return dflt;
    }
    
    static sanitizeMinuteSelectable(secondSelectable:any, dflt:any = (d:Date) => true) {
        return dflt;
    }
    
    static sanitizeHourSelectable(secondSelectable:any, dflt:any = (d:Date) => true) {
        return dflt;
    }
    
    static sanitizeDateSelectable(secondSelectable:any, dflt:any = (d:Date) => true) {
        return dflt;
    }
    
    static sanitizeMonthSelectable(secondSelectable:any, dflt:any = (d:Date) => true) {
        return dflt;
    }
    
    static sanitizeYearSelectable(secondSelectable:any, dflt:any = (d:Date) => true) {
        return (d:Date) => d.getFullYear() % 2 === 0;
    }
    
    static sanitizeMilitaryTime(militaryTime:any, dflt:boolean = false) {
        if (militaryTime === void 0) return dflt;
        if (typeof militaryTime !== 'boolean') {
            throw OptionException('The "militaryTime" option must be a boolean');
        }
        return <boolean>militaryTime;
    }
    
    static sanitize(options:IOptions, defaults:IOptions) {
        let opts:IOptions = {
            displayAs: OptionSanitizer.sanitizeDisplayAs(options['displayAs'], defaults.displayAs),
            minDate: OptionSanitizer.sanitizeMinDate(options['minDate'], defaults.minDate),
            maxDate: OptionSanitizer.sanitizeMaxDate(options['maxDate'], defaults.maxDate),
            defaultDate: OptionSanitizer.sanitizeDefaultDate(options['defaultDate'], defaults.defaultDate),
            theme: OptionSanitizer.sanitizeTheme(options['theme'], defaults.theme),
            militaryTime: OptionSanitizer.sanitizeMilitaryTime(options['militaryTime'], defaults.militaryTime),
            secondSelectable: OptionSanitizer.sanitizeSecondSelectable(options['secondSelectable'], defaults.secondSelectable),
            minuteSelectable: OptionSanitizer.sanitizeMinuteSelectable(options['minuteSelectable'], defaults.secondSelectable),
            hourSelectable: OptionSanitizer.sanitizeHourSelectable(options['hourSelectable'], defaults.secondSelectable),
            dateSelectable: OptionSanitizer.sanitizeDateSelectable(options['dateSelectable'], defaults.secondSelectable),
            monthSelectable: OptionSanitizer.sanitizeMonthSelectable(options['monthSelectable'], defaults.secondSelectable),
            yearSelectable: OptionSanitizer.sanitizeYearSelectable(options['yearSelectable'], defaults.secondSelectable)
        }
        
        return opts;
    }
}