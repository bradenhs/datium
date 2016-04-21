ngm.factory("datium.OptionSanitizer", function() {
var OptionSanitizer = (function () {
    function OptionSanitizer() {
    }
    OptionSanitizer.Exception = function (msg) {
        return "[Datium Option Exception]\n  " + msg + "\n  See the readme for documentation.\n";
    };
    OptionSanitizer.sanitizeDisplayAs = function (displayAs, dflt) {
        if (dflt === void 0) { dflt = 'h:mma MMM D, YYYY'; }
        if (displayAs === void 0)
            return dflt;
        if (typeof displayAs !== 'string')
            throw OptionSanitizer.Exception('The "displayAs" option must be a string');
        return displayAs;
    };
    OptionSanitizer.sanitizeMinDate = function (minDate, dflt) {
        if (dflt === void 0) { dflt = new Date(-62135658000000); }
        if (minDate === void 0)
            return dflt;
        var date = new Date(minDate);
        if (date.toString() === 'Invalid Date')
            throw OptionSanitizer.Exception('The "minDate" option is invalid.');
        return date;
    };
    OptionSanitizer.sanitizeMaxDate = function (maxDate, dflt) {
        if (dflt === void 0) { dflt = new Date(8640000000000000); }
        if (maxDate === void 0)
            return dflt;
        var date = new Date(maxDate);
        if (date.toString() === 'Invalid Date')
            throw OptionSanitizer.Exception('The "maxDate" option is invalid.');
        return date;
    };
    OptionSanitizer.sanitizeInitialDate = function (initialDate, dflt) {
        if (dflt === void 0) { dflt = new Date(); }
        if (initialDate === void 0)
            return dflt;
        var date = new Date(initialDate);
        if (date.toString() === 'Invalid Date')
            throw OptionSanitizer.Exception('The "initialDate" option is invalid.');
        return date;
    };
    OptionSanitizer.sanitizeColor = function (color) {
        var threeHex = '\\s*#[A-Fa-f0-9]{3}\\s*';
        var sixHex = '\\s*#[A-Fa-f0-9]{6}\\s*';
        var rgb = '\\s*rgb\\(\\s*[0-9]{1,3}\\s*,\\s*[0-9]{1,3}\\s*,\\s*[0-9]{1,3}\\s*\\)\\s*';
        var rgba = '\\s*rgba\\(\\s*[0-9]{1,3}\\s*,\\s*[0-9]{1,3}\\s*,\\s*[0-9]{1,3}\\s*\\,\\s*[0-9]*\\.[0-9]+\\s*\\)\\s*';
        var sanitizeColorRegex = new RegExp("^((" + threeHex + ")|(" + sixHex + ")|(" + rgb + ")|(" + rgba + "))$");
        if (color === void 0)
            throw OptionSanitizer.Exception("All theme colors (primary, primary_text, secondary, secondary_text, secondary_accent) must be defined");
        if (!sanitizeColorRegex.test(color))
            throw OptionSanitizer.Exception("All theme colors must be valid rgb, rgba, or hex code");
        return color;
    };
    OptionSanitizer.sanitizeTheme = function (theme, dflt) {
        if (dflt === void 0) { dflt = "material"; }
        if (theme === void 0)
            return OptionSanitizer.sanitizeTheme(dflt, void 0);
        if (typeof theme === 'string') {
            switch (theme) {
                case 'light':
                    return {
                        primary: '#eee',
                        primary_text: '#666',
                        secondary: '#fff',
                        secondary_text: '#666',
                        secondary_accent: '#666'
                    };
                case 'dark':
                    return {
                        primary: '#444',
                        primary_text: '#eee',
                        secondary: '#333',
                        secondary_text: '#eee',
                        secondary_accent: '#fff'
                    };
                case 'material':
                    return {
                        primary: '#019587',
                        primary_text: '#fff',
                        secondary: '#fff',
                        secondary_text: '#888',
                        secondary_accent: '#019587'
                    };
                default:
                    throw "Name of theme not valid.";
            }
        }
        else if (typeof theme === 'object') {
            return {
                primary: OptionSanitizer.sanitizeColor(theme['primary']),
                secondary: OptionSanitizer.sanitizeColor(theme['secondary']),
                primary_text: OptionSanitizer.sanitizeColor(theme['primary_text']),
                secondary_text: OptionSanitizer.sanitizeColor(theme['secondary_text']),
                secondary_accent: OptionSanitizer.sanitizeColor(theme['secondary_accent'])
            };
        }
        else {
            throw OptionSanitizer.Exception('The "theme" option must be object or string');
        }
    };
    OptionSanitizer.sanitizeIsSecondValid = function (isSecondValid, dflt) {
        if (dflt === void 0) { dflt = function () { return true; }; }
        if (isSecondValid === void 0)
            return dflt;
        if (typeof isSecondValid !== 'function')
            throw OptionSanitizer.Exception('The "isSecondValid" option should be a function with signature (date:Date) => boolean');
        return isSecondValid;
    };
    OptionSanitizer.sanitizeIsMinuteValid = function (isMinuteValid, dflt) {
        if (dflt === void 0) { dflt = function () { return true; }; }
        if (isMinuteValid === void 0)
            return dflt;
        if (typeof isMinuteValid !== 'function')
            throw OptionSanitizer.Exception('The "isMinuteValid" option should be a function with signature (date:Date) => boolean');
        return isMinuteValid;
    };
    OptionSanitizer.sanitizeIsHourValid = function (isHourValid, dflt) {
        if (dflt === void 0) { dflt = function () { return true; }; }
        if (isHourValid === void 0)
            return dflt;
        if (typeof isHourValid !== 'function')
            throw OptionSanitizer.Exception('The "isHourValid" option should be a function with signature (date:Date) => boolean');
        return isHourValid;
    };
    OptionSanitizer.sanitizeIsDateValid = function (isDateValid, dflt) {
        if (dflt === void 0) { dflt = function () { return true; }; }
        if (isDateValid === void 0)
            return dflt;
        if (typeof isDateValid !== 'function')
            throw OptionSanitizer.Exception('The "isDateValid" option should be a function with signature (date:Date) => boolean');
        return isDateValid;
    };
    OptionSanitizer.sanitizeIsMonthValid = function (isMonthValid, dflt) {
        if (dflt === void 0) { dflt = function () { return true; }; }
        if (isMonthValid === void 0)
            return dflt;
        if (typeof isMonthValid !== 'function')
            throw OptionSanitizer.Exception('The "isMonthValid" option should be a function with signature (date:Date) => boolean');
        return isMonthValid;
    };
    OptionSanitizer.sanitizeIsYearValid = function (isYearValid, dflt) {
        if (dflt === void 0) { dflt = function () { return true; }; }
        if (isYearValid === void 0)
            return dflt;
        if (typeof isYearValid !== 'function')
            throw OptionSanitizer.Exception('The "isYearValid" option should be a function with signature (date:Date) => boolean');
        return isYearValid;
    };
    OptionSanitizer.sanitizeMilitaryTime = function (militaryTime, dflt) {
        if (dflt === void 0) { dflt = false; }
        if (militaryTime === void 0)
            return dflt;
        if (typeof militaryTime !== 'boolean') {
            throw OptionSanitizer.Exception('The "militaryTime" option must be a boolean');
        }
        return militaryTime;
    };
    OptionSanitizer.sanitizeShowPicker = function (showPicker, dflt) {
        if (dflt === void 0) { dflt = true; }
        if (showPicker === void 0)
            return dflt;
        if (typeof showPicker !== 'boolean') {
            throw OptionSanitizer.Exception('The "showPicker" option must be a boolean');
        }
        return showPicker;
    };
    OptionSanitizer.sanitizeTransition = function (transition, dflt) {
        if (dflt === void 0) { dflt = true; }
        if (transition === void 0)
            return dflt;
        if (typeof transition !== 'boolean') {
            throw OptionSanitizer.Exception('The "transition" option must be a boolean');
        }
        return transition;
    };
    OptionSanitizer.sanitize = function (options, defaults) {
        var minDate = OptionSanitizer.sanitizeMinDate(options['minDate'], defaults.minDate);
        var maxDate = OptionSanitizer.sanitizeMaxDate(options['maxDate'], defaults.maxDate);
        if (minDate.valueOf() > maxDate.valueOf()) {
            throw OptionSanitizer.Exception('"minDate" must be before "maxDate"');
        }
        var opts = {
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
        };
        return opts;
    };
    return OptionSanitizer;
}());
// TODO negative years
// alternate display as string[] 
return OptionSanitizer;
});