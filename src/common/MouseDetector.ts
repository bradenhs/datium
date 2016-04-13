class MouseDetector {
    private _hasMouse:boolean = false;
    constructor(callback?:(hasMouse:boolean) => void) {
        let mousedown:number, touchstart:number = 0;
        let mouselisteners = listen.mousedown(document, () => {
            mousedown = new Date().valueOf();
            listen.removeListeners(mouselisteners);
            this._hasMouse = mousedown - touchstart > 200;
            if (callback !== void 0) callback(this._hasMouse);
        });
        let touchlisteners = listen.touchstart(document, () => {
            touchstart = new Date().valueOf();
            listen.removeListeners(touchlisteners);
        });
    }
    
    public hasMouse() {
        return this._hasMouse;
    }
}