#Datium

Datium is a bullet-proof datetime picker. Datium is compatible with the
latest web browsers and performs well mobile.

##Usage

###Options

```javascript
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
     * Surround escaped segments with square brackets
     * (ex. "[The time of day is ] h:mma").
     *
     * Surround segments needing to reflect the time but
     * not be selectable with curly brackets
     * (ex. "{ddd} MMM Do, YYYY")
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
```

###Angular

Use the `datium-picker` directive as an attribute.

Like this:

`<input datium-picker/>`

You can optionally pass the picker options via:

`<input datium-picker datium-options="yourOptionsVariableOnTheScope"/>`

You can optionally specify an `ng-model` via:

`<input datium-picker ng-model="date"/>`

If an `ng-model` is specified the picker will manage `ng-valid` classes on the element the picker is attached to. All possible classes are specified here. Each class suffix described below will be preceded by either `ng-valid` or `ng-invalid` depending on if model is valid or not.

Class Suffix|Description
---|---
`datium-before-min`          |If the date selected is before the date specified<br/>in the `minDate` option.
`datium-after-max`           |If the date selected is after the date specified<br/>in the `maxDate` option.
`datium-undefined`           |If the date has at least one `undefined` part.
`datium-year-undefined`      |If the year selection of the date is `undefined`.
`datium-month-undefined`     |If the month selection of the date is `undefined`.
`datium-day-undefined`       |If the day selection of the date is `undefined`.
`datium-hour-undefined`      |If the hour selection of the date is `undefined`.
`datium-minute-undefined`    |If the minute selection of the date is `undefined`.
`datium-second-undefined`    |If the second selection of the date is `undefined`.
`datium-bad-selection`       |If the current date is invalid because one of the<br/>isValid functions specified in your options is<br/>returning `false`.
`datium-bad-year-selection`  |If the current date is invalid because the<br/>`isYearValid` function specified in your options is<br/>returning `false`.
`datium-bad-month-selection` |If the current date is invalid because the<br/>`isMonthValid` function specified in your options is<br/>returning `false`.
`datium-bad-day-selection`   |If the current date is invalid because the<br/>`isDayValid` function specified in your options is<br/>returning `false`.
`datium-bad-hour-selection`  |If the current date is invalid because the<br/>`isHourValid` function specified in your options is<br/>returning `false`.
`datium-bad-minute-selection`|If the current date is invalid because the<br/>`isMinuteValid` function specified in your options is<br/>returning `false`.
`datium-bad-second-selection`|If the current date is invalid because the<br/>`isSecondValid` function specified in your options is<br/>returning `false`.

###Plain JavaScript

Put the datium script tag on your page.

`<script type="text/javascript" src="datium.js"/>`

After the page is loaded you can attach a picker to any element on the page. Do this by calling `new Datium(yourElement, options)`. The second `options` parameter is optional. If you assign your picker to a variable like this `var myPicker = new Datium(yourElement)` you can use the `myPicker` variable to control the picker. Methods on the picker are described here:

Method|Description
---|---
`myPicker.updateOptions(options)` |Updates the picker options
`myPicker.isValid()`              |Returns a boolean specifying if the currently<br/>selected date is valid
`myPicker.getDate()`              |Returns the currently selected date or<br/>`undefined` if the picker's current date<br/>is invalid or undefined.
`myPicker.isDirty()`              |Returns a boolean specifying if the original<br/>value of the picker has changed
`myPicker.setDirty(dirty)`        |Takes a boolean value to manually change the<br/>dirty flag of the picker
`myPicker.setDate(date)`          |Manually set the date of the picker
`myPicker.setDefined()`           |Manually ensures all fields in the picker<br/>are defined
`myPicker.toString()`             |Returns the string representing the date in<br/>the format specified in the options<br/>`displayAs` parameter
`myPicker.getInvalidReasons()`    |Returns an array of strings specifying why<br/>the date is invalid. These strings are described in<br/>the Class Suffix table above. If an empty array is<br/>returned the date is valid.

##Development

- Clone the repo
- Run `npm install`
- Run `gulp`

**Note: If you are using the `gulp closure` command you'll need to have `java` on your system.*

There are several gulp tasks to help in development of the project.

Task|Description
---|---
`gulp build`|Will compile and combine the project into the `datium.js` in the the `public` folder
`gulp closure`|Will use the google closure compiler to minify `datium.js`
`gulp deploy`|Will deploy the project to bhsnll.github.io but this can be configured to push elsewhere.

##Compatability

Datium works great on mobile browsers. All the latest versions of desktop browsers are supported. Internet Explorer <= IE9 is not supported.
