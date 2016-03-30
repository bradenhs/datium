interface ITheme {
    primary:string;
    primary_text:string;
    secondary:string;
    secondary_text:string;
    secondary_accent:string;
}

interface IOptions {
    displayAs:string;
    minDate:Date;
    maxDate:Date;
    defaultDate:Date;
    theme:ITheme;
    militaryTime:boolean;
    secondSelectable:(date:Date) => boolean;
    minuteSelectable:(date:Date) => boolean;
    hourSelectable:(date:Date) => boolean;
    dateSelectable:(date:Date) => boolean;
    monthSelectable:(date:Date) => boolean;
    yearSelectable:(date:Date) => boolean;
}