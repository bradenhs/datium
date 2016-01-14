let ElementError = Error('DATIUM - The "element" option is required.');
let ShowPickerError = Error('DATIUM - The "showPicker" option must be of type boolean.');
let ModalError = Error('DATIUM - The "modal" option must be of type boolean.');
let ThemeError = Error('DATIUM - The "theme" option must be a string of value: "light", "dark", or "material". Or an object with the properties: primary, primaryText, secondary, secondaryText, secondaryAccent with each property being a valid hex, rgb, or rgba color code.');
let StartViewError = Error('DATIUM - The "startView" option must be a string of value "year", "month", "day", "hour", "minute" or "second".');
let EndViewError = Error('DATIUM - The "endView" option must be a string of value "year", "month", "day", "hour", "minute" or "second". It cannot be a bigger view than the start view (i.e. the end view cannot be "month" if the start view is "day").');
let MaxViewError = Error('DATIUM - The "maxView" option must be a string of value "year", "month", "day", "hour", "minute" or "second". It cannot be a smaller view than the start view (i.e. the max view cannot be "hour" if the start view is "day").');
let MinDateError = Error('DATIUM - The "minDate" option must be an ISO format string, number of milliseconds since midnight 01 January, 1970 UTC, or date object.');
let HourSelectionIntervalError = Error('DATIUM - The "hourSelectionInterval" option must be a number with a value of 1, 2, 3, 4 or 6.');
let MinuteSelectionIntervalError = Error('DATIUM - The "minuteSelectionInterval" option must be a number with a value of 1, 5, 10, 15, 20 or 30.');
let SecondSelectionIntervalError = Error('DATIUM - The "secondSelectionInterval" option must be a number with a value of 1, 5, 10, 15, 20 or 30.');
let MilitaryTimeError = Error('DATIUM - The "militaryTime" option must be of type boolean.');
let DataFormatError = Error('DATIUM - The "dataFormat" option must be of type string.');
let DisplayFormatError = Error('DATIUM - The "displayFormat" option must be of type string.');
let ZIndexError = Error('DATIUM - The "zIndex" option must be of type number.');

function sanitizeElement(element:HTMLInputElement):HTMLInputElement {
    if (typeof element === void 0) throw ElementError;
    //TODO Check if input element
    return element;
}

function sanitizeShowPicker(showPicker:boolean):boolean {
    if (showPicker === void 0) return true; //default
    if (typeof showPicker !== 'boolean') throw ShowPickerError;
    return showPicker;
}

function sanitizeModal(modal:boolean):boolean {
    if (modal === void 0) return false; //default
    if (typeof modal !== 'boolean') throw ModalError;
    return modal;
}

let threeHex = '\\s*#[A-Fa-f0-9]{3}\\s*';
let sixHex = '\\s*#[A-Fa-f0-9]{6}\\s*';
let rgb = '\\s*rgb\\(\\s*[0-9]{1,3}\\s*,\\s*[0-9]{1,3}\\s*,\\s*[0-9]{1,3}\\s*\\)\\s*';
let rgba = '\\s*rgba\\(\\s*[0-9]{1,3}\\s*,\\s*[0-9]{1,3}\\s*,\\s*[0-9]{1,3}\\s*\\,\\s*[0-9]*\\.[0-9]+\\s*\\)\\s*';
let sanitizeColorRegex = new RegExp(`^((${threeHex})|(${sixHex})|(${rgb})|(${rgba}))$`);

function sanitizeColor(color:string):string {
    if (color === void 0) throw ThemeError;
    if (!sanitizeColorRegex.test(color)) throw ThemeError;
    return color;
}

function sanitizeTheme(theme:string|IDatiumTheme):IDatiumTheme {
    if (theme === void 0) return sanitizeTheme("light"); //default
    if (typeof theme === 'object') {
        return <IDatiumTheme>{
          primary: sanitizeColor(theme.primary),
          primaryText: sanitizeColor(theme.primaryText),
          secondary: sanitizeColor(theme.secondary),
          secondaryText: sanitizeColor(theme.secondaryText),
          secondaryAccent: sanitizeColor(theme.secondaryAccent)
        };
    } else if (typeof theme === 'string') {
        switch(theme) {
        case 'light':
            return <IDatiumTheme>{
                primary: '#eee',
                primaryText: '#666',
                secondary: '#fff',
                secondaryText: '#666',
                secondaryAccent: '#666'
            }
        case 'dark':
            return <IDatiumTheme>{
                primary: '#444',
                primaryText: '#ccc',
                secondary: '#333',
                secondaryText: '#888',
                secondaryAccent: '#ccc'
            }
        case 'material':
            return <IDatiumTheme>{
                primary: '#019587',
                primaryText: '#fff',
                secondary: '#fff',
                secondaryText: '#888',
                secondaryAccent: '#019587'
            }
        default:
            throw ThemeError;
        }
    } else {
        throw ThemeError;
    }
}

let views = ['second', 'minute', 'hour', 'day', 'month', 'year'];
function sanitizeStartView(startView:string):string {
    if (startView === void 0) return 'day'; //default
    if (typeof startView !== 'string') throw StartViewError;
    if (views.indexOf(startView) === -1) throw StartViewError;
    return startView;
}

function sanitizeEndView(endView:string, startView:string):string {
    if (endView === void 0) return sanitizeEndView('minute', startView); //default
    if (typeof endView !== 'string') throw EndViewError;
    if (views.indexOf(endView) === -1) throw EndViewError;
    let sanitizedStartView = sanitizeStartView(startView);
    if (views.indexOf(endView) > views.indexOf(sanitizedStartView)) throw EndViewError;
    return endView;
}

function sanitizeMaxView(maxView:string, startView:string):string {
    if (maxView === void 0) return sanitizeMaxView('year', startView); //default
    if (typeof maxView !== 'string') throw MaxViewError;
    if (views.indexOf(maxView) === -1) throw MaxViewError;
    let sanitizedStartView = sanitizeStartView(startView);
    if (views.indexOf(maxView) < views.indexOf(sanitizedStartView)) throw MaxViewError;
    return maxView;
}

let sanitizeDateRegex = new RegExp('/^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/');
function sanitizeMinDate(minDate:any):Date {
    if (minDate === void 0) return void 0; //default
    switch(typeof minDate) {
        case 'string':
        if (sanitizeDateRegex.test(<string>minDate)) return new Date(<string>minDate);
        case 'number': return new Date(<number>minDate);
        case 'date': return <Date>minDate;
        default: throw MinDateError;
    }
}

function sanitizeMaxDate(maxDate:any, minDate:any):Date {
    if (maxDate === void 0) return void 0;
    let returnValue:Date;
    switch(typeof maxDate) {
    case 'string':
        if (sanitizeDateRegex.test(<string>maxDate)) {
            returnValue = new Date(<string>maxDate);
            break;
        }
    case 'number':
        returnValue = new Date(<number>maxDate);
        break;
    case 'date': 
        returnValue = <Date>maxDate;
        break;
    default:
        throw MinDateError;
    }
    let sanitizedMinDate = sanitizeMinDate(minDate);
    if (sanitizedMinDate !== void 0 && returnValue.valueOf() <= sanitizedMinDate.valueOf()) throw MinDateError;
    return returnValue;
}

function sanitizeHourSelectionInterval(hourSelectionInterval:number):number {
    if (hourSelectionInterval === void 0) return 1;
    if (typeof hourSelectionInterval !== 'number') throw HourSelectionIntervalError;
    if (hourSelectionInterval !== 1 &&
        hourSelectionInterval !== 2 &&
        hourSelectionInterval !== 3 &&
        hourSelectionInterval !== 4 &&
        hourSelectionInterval !== 6) throw HourSelectionIntervalError;
    return hourSelectionInterval;
}

function sanitizeMinuteSelectionInterval(minuteSelectionInterval:number):number {
    if (minuteSelectionInterval === void 0) return 1;
    if (typeof minuteSelectionInterval !== 'number') throw MinuteSelectionIntervalError;
    if (minuteSelectionInterval !== 1 &&
        minuteSelectionInterval !== 5 &&
        minuteSelectionInterval !== 10 &&
        minuteSelectionInterval !== 15 &&
        minuteSelectionInterval !== 20 &&
        minuteSelectionInterval !== 30) throw MinuteSelectionIntervalError;
    return minuteSelectionInterval;
}

function sanitizeSecondSelectionInterval(secondSelectionInterval:number):number {
    if (secondSelectionInterval === void 0) return 1;
    if (typeof secondSelectionInterval !== 'number') throw SecondSelectionIntervalError;
    if (secondSelectionInterval !== 1 &&
        secondSelectionInterval !== 5 &&
        secondSelectionInterval !== 10 &&
        secondSelectionInterval !== 15 &&
        secondSelectionInterval !== 20 &&
        secondSelectionInterval !== 30) throw SecondSelectionIntervalError;
    return secondSelectionInterval;
}

function sanitizeMilitaryTime(militaryTime:boolean):boolean {
    if (militaryTime === void 0) return true; //default
    if (typeof militaryTime !== 'boolean') throw MilitaryTimeError;
    return militaryTime;
}

function sanitizeDataFormat(dataFormat:string):string {
    if (dataFormat === void 0) return 'YYYY-MM-DDTHH:mm:SSZZ';
    if (typeof dataFormat !== 'string') throw DataFormatError;
    return dataFormat;
}

function sanitizeDisplayFormat(displayFormat:string):string {
    if (displayFormat === void 0) return 'HH:mmA MMM DD, YYYY';
    if (typeof displayFormat !== 'string') throw DisplayFormatError;
    return displayFormat;
}

function sanitizeZIndex(zIndex:number):number {
    if (zIndex === void 0) return 2147483647;
    if (typeof zIndex !== 'number') throw ZIndexError;
    return zIndex;
}

export function SanitizeOptions(opts:any):IDatiumOptions {
    return <IDatiumOptions>{
        element: sanitizeElement(opts.element),
        showPicker: sanitizeShowPicker(opts.showPicker),
        modal: sanitizeModal(opts.modal),
        theme: sanitizeTheme(opts.theme),
        startView: sanitizeStartView(opts.startView),
        endView: sanitizeEndView(opts.endView, opts.startView),
        maxView: sanitizeMaxView(opts.maxView, opts.startView),
        minDate: <Date>sanitizeMinDate(opts.minDate),
        maxDate: <Date>sanitizeMaxDate(opts.maxDate, opts.minDate),
        hourSelectionInterval: sanitizeHourSelectionInterval(opts.hourSelectionInterval),
        minuteSelectionInterval: sanitizeMinuteSelectionInterval(opts.minuteSelectionInterval),
        secondSelectionInterval: sanitizeSecondSelectionInterval(opts.secondSelectionInterval),
        militaryTime: sanitizeMilitaryTime(opts.militaryTime),
        dataFormat: sanitizeDataFormat(opts.dataFormat),
        displayFormat: sanitizeDisplayFormat(opts.displayFormat),
        zIndex: sanitizeZIndex(opts.zIndex)
    }
}

export interface IDatiumOptions {
    
    /**
     * The input element the picker should be attached to
     * (Questions: what if they want to attach it to something else besides an
     *   input element? Is that okay?)
     * 
     * Required 
     * Type: HTMLInputElement
     */
	element: HTMLInputElement;
    
    /**
     * Toggle if the picker shows when the input is focused
     * 
     * Optional (default: true)
     * Type: boolean
     */
    showPicker: boolean;
    
    /**
     * Toggle if the picker should show as a modal
     * 
     * Optional (default: false)
     * Type: boolean
     */
    modal: boolean;
    
    /**
     * The color scheme of the picker
     * 
     * Optional (default: "light")
     * Type: string|IDatiumTheme
     * Accepted values: 'light', 'dark', 'material', object of type IDatiumTheme
     */
    theme: IDatiumTheme;
    
    /**
     * The view the picker should open at
     * 
     * Optional (default: "day")
     * Type: string
     * Accepted values:
     *   'year', 'month', 'day', 'hour', 'minute', 'second'
     */
    startView: string;
    
    /**
     * The view the picker should close at
     * 
     * Optional (default: "minute")
     * Type: string
     * Accepted values:
     *   'year', 'month', 'day', 'hour', 'minute', 'second'
     */
    endView: string;
    
    /** 
     * The view the picker shouldn't be able to zoom out beyond
     * 
     * Optional (default: "year")
     * Type: string
     * Accepted values:
     *   'year', 'month', 'day', 'hour', 'minute', 'second'
     */
    maxView: string;
    
    /**
     * The first selectable date
     * 
     * Optional (default: undefined)
     * Type: string|number|Date
     * Accepted values: ISO format string | number of milliseconds since midnight
     *   01 January, 1970 UTC | Date object
     */
    minDate: Date;
    
    /**
     * The last selectable date
     * 
     * Optional (default: undefined)
     * Type: string|number|Date
     * Accepted values: ISO format string | number of milliseconds since midnight
     *   01 January, 1970 UTC | Date object
     */
    maxDate: Date;
    
    /**
     * The intervals on which hours can be selected (every 3rd hour means 12am,
     *   3am, 6am, 9am, 12pm, 3pm, 6pm, and 9pm are selectable)
     * 
     * Optional (default: 1)
     * Type: number
     * Accepted values: 1, 2, 3, 4, 6
     */
    hourSelectionInterval: number;
    
    /**
     * The intervals on which minutes can be selected (every 15th minute means 00m,
     *   15m, 30m, and 45m are selectable)
     * 
     * Optional (default: 1)
     * Type: number
     * Accepted values: 1, 5, 10, 15, 20, 30
     */
    minuteSelectionInterval: number;
    
    /**
     * The intervals on which seconds can be selected (every 15th second means 00s,
     *   15s, 30s, and 45s are selectable)
     * 
     * Optional (default: 1)
     * Type: number
     * Accepted values: 1, 5, 10, 15, 20, 30
     */
    secondSelectionInterval: number;
    
    /**
     * Toggle if military time should be used in the hour selection
     * 
     * Optional (default: false)
     * Type: boolean
     */
    militaryTime: boolean;
    
    /**
     * Format of the date in the datium-val attribute on the element the picker is attached to
     * 
     * Optional (default: "YYYY-MM-DDTHH:mm:SSZZ")
     * Type: string
     * Accepted values: follows format defined on http://momentjs.com/docs/#/parsing/string-format/
     */
    dataFormat: string;
    
    /**
     * Format of the date in the val attribute on the element the picker is attached to
     * 
     * Optional (default: "HH:mmA MMM DD, YYYY")
     * Type: string
     * Accepted values: follows format defined on http://momentjs.com/docs/#/parsing/string-format/
     */
    displayFormat: string; // Format date appears as in input
    
    /**
     * The z-index of the picker component
     * 
     * Optional (default: 2147483647)
     * Type: number
     */
    zIndex: number;
}

export interface IDatiumTheme {
    
    /**
     * A hex, rgb, or rgba color value
     * 
     * Required
     * Type: string
     */
    primary: string;
    
    /**
     * A hex, rgb, or rgba color value
     * 
     * Required
     * Type: string
     */
    primaryText: string;
    
    /**
     * A hex, rgb, or rgba color value
     * 
     * Required
     * Type: string
     */
    secondary: string;
    
    /**
     * A hex, rgb, or rgba color value
     * 
     * Required
     * Type: string
     */
    secondaryText: string;
    
    /**
     * A hex, rgb, or rgba color value
     * 
     * Required
     * Type: string
     */
    secondaryAccent: string;
}