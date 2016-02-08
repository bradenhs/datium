import {ViewLevel} from 'src/common/ViewManager';

let ElementError = Error('DATIUM - The "element" option is required.');
let ShowPickerError = Error('DATIUM - The "showPicker" option must be of type boolean.');
let ModalError = Error('DATIUM - The "modal" option must be of type boolean.');
let ThemeError = Error('DATIUM - The "theme" option must be a string of value: "light", "dark", or "material". Or an object with the properties: primary, primaryText, secondary, secondaryText, secondaryAccent with each property being a valid hex, rgb, or rgba color code.');
let StartViewError = Error('DATIUM - The "startView" option must be a string of value "year", "month", "day", "hour", "minute" or "second".');
let EndViewError = Error('DATIUM - The "endView" option must be a string of value "year", "month", "day", "hour", "minute" or "second". It cannot be a bigger view than the start view (i.e. the end view cannot be "month" if the start view is "day").');
let MaxViewError = Error('DATIUM - The "maxView" option must be a string of value "year", "month", "day", "hour", "minute" or "second". It cannot be a smaller view than the start view (i.e. the max view cannot be "hour" if the start view is "day").');
let MinDateError = Error('DATIUM - The "minDate" option must be a date string, number of milliseconds since midnight 01 January, 1970 UTC, or date object.');
let MaxDateError = Error('DATIUM - The "maxDate" option must be a date string, number of milliseconds since midnight 01 January, 1970 UTC, or date object.');
let HourSelectionIntervalError = Error('DATIUM - The "hourSelectionInterval" option must be a number with a value of 1, 2, 3, 4 or 6.');
let MinuteSelectionIntervalError = Error('DATIUM - The "minuteSelectionInterval" option must be a number with a value of 1, 5, 10, 15, 20 or 30.');
let SecondSelectionIntervalError = Error('DATIUM - The "secondSelectionInterval" option must be a number with a value of 1, 5, 10, 15, 20 or 30.');
let MilitaryTimeError = Error('DATIUM - The "militaryTime" option must be of type boolean.');
let DataFormatError = Error('DATIUM - The "dataFormat" option must be of type string.');
let DisplayFormatError = Error('DATIUM - The "displayFormat" option must be of type string.');
let ZIndexError = Error('DATIUM - The "zIndex" option must be of type number.');
let TransitionError = Error('DATIUM - The "transition" option must be of type boolean.');
let SmallError = Error('DATIUM - The "small" option must be of type boolean.');

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
    if (modal) {
        console.warn("DATIUM - Warning: Setting the \"modal\" option to true may cause inconsistent performance on mobile devices.");
    }
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
                primaryText: '#eee',
                secondary: '#333',
                secondaryText: '#eee',
                secondaryAccent: '#fff'
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

function toLevel(level:string):ViewLevel {
    switch(level) {
        case 'second': return ViewLevel.SECOND;
        case 'minute': return ViewLevel.MINUTE;
        case 'hour': return ViewLevel.HOUR;
        case 'day': return ViewLevel.DATE;
        case 'month': return ViewLevel.MONTH;
        case 'year': return ViewLevel.YEAR;
        default: return void 0;
    }
}

function sanitizeStartView(startView:string):ViewLevel {
    if (startView === void 0) return ViewLevel.DATE; //default
    if (typeof startView !== 'string') throw StartViewError;
    let startLevel = toLevel(startView);
    if (startLevel === void 0) throw StartViewError;
    return startLevel;
}

function sanitizeEndView(endView:string, startView:string):ViewLevel {
    if (endView === void 0) return sanitizeEndView('minute', startView); //default
    if (typeof endView !== 'string') throw EndViewError;
    let endLevel = toLevel(endView);
    if (endLevel === void 0) throw EndViewError;
    let sanitizedStartView = sanitizeStartView(startView);
    if (endLevel > sanitizedStartView) throw EndViewError;
    return endLevel;
}

function sanitizeMaxView(maxView:string, startView:string):ViewLevel {
    if (maxView === void 0) return sanitizeMaxView('year', startView); //default
    if (typeof maxView !== 'string') throw MaxViewError;
    let maxLevel = toLevel(maxView);
    if (maxLevel === void 0) throw MaxViewError;
    let sanitizedStartView = sanitizeStartView(startView);
    if (maxLevel < sanitizedStartView) throw MaxViewError;
    return maxLevel;
}

function sanitizeMinDate(minDate:any):Date {
    if (minDate === void 0) return void 0; //default
    switch(typeof minDate) {
    case 'string':
        let date = new Date(<string>minDate);
        if (date.toString() === 'Invalid Date') throw MinDateError;
        return date;
    case 'number':
        return new Date(<number>minDate);
    case 'object':
        if (minDate instanceof Date) {
            return <Date>minDate;
        } else {
            throw MinDateError;
        }
    default:
        throw MinDateError;
    }
}

function sanitizeMaxDate(maxDate:any, minDate:any):Date {
    if (maxDate === void 0) return void 0; //default
    let returnValue:Date;
    switch(typeof maxDate) {
    case 'string':
        returnValue = new Date(<string>maxDate);
        if (returnValue.toString() === 'Invalid Date') throw MaxDateError;
    case 'number':
        returnValue = new Date(<number>maxDate);
        break;
    case 'object': 
        if (maxDate instanceof Date) {
            returnValue = <Date>maxDate;
        } else {
            throw MaxDateError;
        }
        break;
    default:
        throw MaxDateError;
    }
    let sanitizedMinDate = sanitizeMinDate(minDate);
    if (sanitizedMinDate !== void 0 && returnValue.valueOf() <= sanitizedMinDate.valueOf()) throw MaxDateError;
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
    if (militaryTime === void 0) return false; //default
    if (typeof militaryTime !== 'boolean') throw MilitaryTimeError;
    return militaryTime;
}

function sanitizeDataFormat(dataFormat:string):string {
    if (dataFormat === void 0) return 'YYYY-MM-DDTHH:mm:SSZZ';
    if (typeof dataFormat !== 'string') throw DataFormatError;
    return dataFormat;
}

function sanitizeDisplayFormat(displayFormat:string):string {
    if (displayFormat === void 0) return 'hh:mmA MMM DD, YYYY';
    if (typeof displayFormat !== 'string') throw DisplayFormatError;
    return displayFormat;
}

function sanitizeZIndex(zIndex:number):number {
    if (zIndex === void 0) return 2147483647; //default
    if (typeof zIndex !== 'number') throw ZIndexError;
    return zIndex;
}

function sanitizeTransition(transition:boolean):boolean {
    if (transition === void 0) return true; //default
    if (typeof transition !== 'boolean') throw TransitionError;
    return transition;
}

function sanitizeSmall(small:boolean):boolean {
    if (small === void 0) return false; //default
    if (typeof small !== 'boolean') throw SmallError;
    return small;
}

export function SanitizeOptions(opts:any):IDatiumOptions {
    for (let key in opts) {
        if (key !== 'element' &&
            key !== 'showPicker' &&
            key !== 'modal' &&
            key !== 'theme' &&
            key !== 'startView' &&
            key !== 'endView' &&
            key !== 'maxView' &&
            key !== 'minDate' &&
            key !== 'maxDate' &&
            key !== 'hourSelectionInterval' &&
            key !== 'minuteSelectionInterval' &&
            key !== 'secondSelectionInterval' &&
            key !== 'militaryTime' &&
            key !== 'dataFormat' &&
            key !== 'displayFormat' &&
            key !== 'zIndex' &&
            key !== 'transition' &&
            key !== 'small') {
                throw Error(`DATIUM - "${key}" is an unrecognized option. Look at the docs for a complete reference.`);
        }
    }
    return <IDatiumOptions>{
        element: sanitizeElement(opts.element),
        showPicker: sanitizeShowPicker(opts.showPicker), //done
        modal: sanitizeModal(opts.modal), //done
        theme: sanitizeTheme(opts.theme), //done
        startView: sanitizeStartView(opts.startView), //done
        endView: sanitizeEndView(opts.endView, opts.startView), //done
        maxView: sanitizeMaxView(opts.maxView, opts.startView), //done
        minDate: <Date>sanitizeMinDate(opts.minDate), //done
        maxDate: <Date>sanitizeMaxDate(opts.maxDate, opts.minDate), //done
        hourSelectionInterval: sanitizeHourSelectionInterval(opts.hourSelectionInterval), //done
        minuteSelectionInterval: sanitizeMinuteSelectionInterval(opts.minuteSelectionInterval), //done
        secondSelectionInterval: sanitizeSecondSelectionInterval(opts.secondSelectionInterval), //done
        militaryTime: sanitizeMilitaryTime(opts.militaryTime), //done
        dataFormat: sanitizeDataFormat(opts.dataFormat), // IS THIS NEEDED?
        displayFormat: sanitizeDisplayFormat(opts.displayFormat),
        zIndex: sanitizeZIndex(opts.zIndex), //done
        transition: sanitizeTransition(opts.transition), //done
        small: sanitizeSmall(opts.small)
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
	element: HTMLInputElement; //make it so this doesn't have to be html input element
    
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
    startView: ViewLevel; //should this maybe be determined by the displayFormat?
    
    /**
     * The view the picker should close at
     * 
     * Optional (default: "minute")
     * Type: string
     * Accepted values:
     *   'year', 'month', 'day', 'hour', 'minute', 'second'
     */
    endView: ViewLevel; //should this maybe be determined by the displayFormat?
    
    /** 
     * The view the picker shouldn't be able to zoom out beyond
     * 
     * Optional (default: "year")
     * Type: string
     * Accepted values:
     *   'year', 'month', 'day', 'hour', 'minute', 'second'
     */
    maxView: ViewLevel; //should this maybe be determined by the displayFormat?
    
    /**
     * The first selectable date down to the day (time constraints will be ignored).
     * 
     * Optional (default: undefined)
     * Type: string|number|Date
     * Accepted values: ISO format string | number of milliseconds since midnight
     *   01 January, 1970 UTC | Date object
     */
    minDate: Date;
    
    /**
     * The last selectable date down to the day (time constraints will be ignored).
     * 
     * Optional (default: undefined)
     * Type: string|number|Date
     * Accepted values: ISO format string | number of milliseconds since midnight
     *   01 January, 1970 UTC | Date object
     */
    maxDate: Date;
    
    // add isSelectable option...
    /**
     * This would be a function like this
     * function(date:Date, level:ViewLevel):boolean
     * 
     * And it just returns true or false if a date is selectable
     * There would be maybe some default strings you could pass in
     * that would just end up passing a premade function to the datepicker
     * like "weekdays." That function might look like this
     *  function (date:Date, level:ViewLevel):boolean {
     *      if (level > ViewLevel.DATE) return true;
     *      return date.getDay() !== 0 && date.getDay() !== 6;
     *  }
     */
    
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
     * Optional (default: false) // default to hh or HH specified in displayFormat
     * Type: boolean
     */
    militaryTime: boolean;
    
    /**
     * Format of the date in the datium-val attribute on the element the picker is attached to
     * 
     * Optional (default: "YYYY-MM-DDTHH:mm:SSZZ")
     * Type: string
     * Accepted values: follows format defined on http://momentjs.com/docs/#/parsing/string-format/ (pretty much at least)
     */
    dataFormat: string;
    
    /**
     * Format of the date in the val attribute on the element the picker is attached to
     * 
     * Optional (default: "HH:mmA MMM DD, YYYY")
     * Type: string
     * Accepted values: follows format defined on http://momentjs.com/docs/#/parsing/string-format/ (pretty much at least)
     */
    displayFormat: string; // Format date appears as in input
    
    /**
     * The z-index of the picker component
     * 
     * Optional (default: 2147483647)
     * Type: number
     */
    zIndex: number; // just have a css style hook instead
        
    /**
     * Toggle if the datepicker should have smooth transitions
     * 
     * Optional (default: true)
     * Type: boolean
     */
    transition: boolean;
        
    /**
     * Toggle if the datepicker should be of the small variety
     * 
     * Optional (default: true)
     * Type: boolean
     */
    small: boolean;
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