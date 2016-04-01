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
    isSecondSelectable:(date:Date) => boolean;
    isMinuteSelectable:(date:Date) => boolean;
    isHourSelectable:(date:Date) => boolean;
    isDateSelectable:(date:Date) => boolean;
    isMonthSelectable:(date:Date) => boolean;
    isYearSelectable:(date:Date) => boolean;
}