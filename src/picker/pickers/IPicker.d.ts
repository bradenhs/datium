interface IPicker {
    getHeight():number;
    updateOptions(options:IOptions):void;
    getLevel():Level;
    getDate():Date;
    destroy(transition:Transition):void;
    create(transition:Transition):void;
    needsTransition(date:Date):void;
}