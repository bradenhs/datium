interface IPicker {
    getHeight():number;
    updateOptions(options:IOptions):void;
    getLevel():Level;
    getDate():Date;
    create(date:Date, transition:Transition):void;
    remove(transition:Transition):void;
    getMin():Date;
    getMax():Date;
    setSelectedDate(date:Date):void;
}