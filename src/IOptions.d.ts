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
}