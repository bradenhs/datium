interface IDatiumOptions {
    
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
     * Accepted values: 'light', 'dark', 'material', object of type ITheme
     */
    theme: string|IDatiumTheme;
    
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
    minDate: string|number;
    
    /**
     * The last selectable date
     * 
     * Optional (default: undefined)
     * Type: string|number|Date
     * Accepted values: ISO format string | number of milliseconds since midnight
     *   01 January, 1970 UTC | Date object
     */
    maxDate: string|number;
    
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
     * Optional (default: 999)
     * Type: number
     */
    zIndex: number;
}

interface IDatiumTheme {
    
    /**
     * A hex or rgba color value
     * 
     * Required
     * Type: string
     */
    primary: string;
    
    /**
     * A hex or rgba color value
     * 
     * Required
     * Type: string
     */
    primaryText: string;
    
    /**
     * A hex or rgba color value
     * 
     * Required
     * Type: string
     */
    secondary: string;
    
    /**
     * A hex or rgba color value
     * 
     * Required
     * Type: string
     */
    secondaryText: string;
}