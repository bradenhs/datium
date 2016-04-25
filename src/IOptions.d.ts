/**
 * The object to specify custom themes. All fields are required.
 */
interface ITheme {
    
    /**
     * type: string
     * 
     * Any valid rgb, rgba, or hex value (ex. "#f00")
     */
    primary:string;
    
    /**
     * type: string
     * 
     * Any valid rgb, rgba, or hex value (ex. "#f00")
     */
    primary_text:string;
    
    /**
     * type: string
     * 
     * Any valid rgb, rgba, or hex value (ex. "#f00")
     */
    secondary:string;
    
    /**
     * type: string
     * 
     * Any valid rgb, rgba, or hex value (ex. "#f00")
     */
    secondary_text:string;
    
    /**
     * type: string
     * 
     * Any valid rgb, rgba, or hex value (ex. "#f00")
     */
    secondary_accent:string;
    
    /**
     * type: string
     * 
     * Any valid rgb, rgba, or hex value (ex. "#f00")
     */
}

/**
 * Options for the picker. All options are optional.
 */
interface IOptions {
    
    /**
     * type: string
     * default: "h:mma MMM D, YYYY"
     * 
     * Format for how the date is displayed.
     * YYYY - four digit year (ex. 2016)
     * YY - two digit year (ex. 16)
     * MMMM - long month name (ex. April)
     * MMM - short month name (ex. Apr)
     * MM - padded month digit (ex. 04)
     * M - month digit (ex. 4)
     * DD - padded date digit (ex. 09)
     * Do - date digit with oridinal (ex. 9th)
     * D - date digit (ex. 9)
     * dddd - long day name (ex. Saturday)
     * ddd - short day name (ex. Sat)
     * HH - padded military hours (ex. 21)
     * hh - padded hours (ex. 09)
     * H - military hours (ex. 21)
     * h - hours (ex. 9)
     * A - uppercase meridiem (ex. PM)
     * a - lowercase meridiem (ex. pm)
     * mm - padded minute (ex. 05)
     * m - minute (ex. 5)
     * ss - padded second (ex. 06)
     * s - second (ex. 6)
     * 
     * Surround escaped segments with square brackets (ex. "[The time of day is ] h:mma")
     * Surround segments needing to reflect the time but not be selectable with curly brackets (ex. "{ddd} MMM Do, YYYY")
     */
    displayAs:string;
    
    /**
     * type: Date
     * default: undefined
     * 
     * The minimum selectable date.
     */    
    minDate:Date;
    
    /**
     * type: Date
     * default: undefined
     * 
     * The maximum selectable date.
     */    
    maxDate:Date;
    
    
    /**
     * type: Date
     * default: undefined
     * 
     * The inital date the picker will open to if no date is selected.
     */    
    initialDate:Date;
    
    /**
     * type: ITheme | string
     * default: "material"
     * 
     * The color theme for the picker. Preset themes are "material", "light", and "dark."
     * If you want a custom theme pass in an ITheme object.
     */    
    theme:ITheme;
    
    /**
     * type: boolean
     * default: false
     * 
     * If the picker should display the clock in military time.
     */
    militaryTime:boolean;
    
    /**
     * type: (d?:Date) => boolean
     * default: () => true
     * 
     * Get a date object and returns a boolean specifying whether or not the second is valid. 
     */
    isSecondValid:(date:Date) => boolean;
    
    /**
     * type: (d?:Date) => boolean
     * default: () => true
     * 
     * Get a date object and returns a boolean specifying whether or not the minute is valid. 
     */
    isMinuteValid:(date:Date) => boolean;
    
    /**
     * type: (d?:Date) => boolean
     * default: () => true
     * 
     * Get a date object and returns a boolean specifying whether or not the hour is valid. 
     */
    isHourValid:(date:Date) => boolean;
    
    /**
     * type: (d?:Date) => boolean
     * default: () => true
     * 
     * Get a date object and returns a boolean specifying whether or not the date is valid. 
     */
    isDateValid:(date:Date) => boolean;
    
    /**
     * type: (d?:Date) => boolean
     * default: () => true
     * 
     * Get a date object and returns a boolean specifying whether or not the month is valid. 
     */
    isMonthValid:(date:Date) => boolean;
    
    /**
     * type: (d?:Date) => boolean
     * default: () => true
     * 
     * Get a date object and returns a boolean specifying whether or not the year is valid. 
     */
    isYearValid:(date:Date) => boolean;
    
    /**
     * type: boolean
     * default: true
     * 
     * Whether or not the picker GUI should show. 
     */
    showPicker:boolean;
    
    /**
     * type: boolean
     * default: true
     * 
     * Whether of not the picker has smooth transitions 
     */
    transition:boolean;
}