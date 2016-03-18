class Common {
    protected getMonths() {
        return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    }
    
    protected getShortMonths() {
        return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    }
    
    protected getDays() {
        return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    }
    
    protected getShortDays() {
        return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    }
    
    protected getHours(date:Date):string {
        let num = date.getHours();
        if (num === 0) num = 12;
        if (num > 12) num -= 12;
        return num.toString();
    }
    
    protected getDecade(date:Date):string {
        return `${Math.floor(date.getFullYear()/10)*10} - ${Math.ceil((date.getFullYear() + 1)/10)*10}`;
    }
    
    protected getMeridiem(date:Date):string {
        return date.getHours() < 12 ? 'am' : 'pm';
    }
    
    protected pad(num:number|string, size:number = 2) {
        let str = num.toString();
        while(str.length < size) str = '0' + str;
        return str;
    }
    
    protected trim(str:string) {
        while (str[0] === '0' && str.length > 1) {
            str = str.substr(1, str.length);  
        }
        return str;
    }
}