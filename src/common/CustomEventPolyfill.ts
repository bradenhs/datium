CustomEvent = (function() {
    function useNative () {
        try {
            let customEvent = new CustomEvent('a', { detail: { b: 'b' } });
            return  'a' === customEvent.type && 'b' === customEvent.detail.b;
        } catch (e) {
        }
        return false;
    }
    
    if (useNative()) {
        return <any>CustomEvent;
    } else if (typeof document.createEvent === 'function') {
        // IE >= 9
        return <any>function(type:string, params:CustomEventInit) {
            let e = document.createEvent('CustomEvent');
            if (params) {
                e.initCustomEvent(type, params.bubbles, params.cancelable, params.detail);
            } else {
                e.initCustomEvent(type, false, false, void 0);
            }
            return e;
        }
    } else {
        // IE >= 8
        return <any>function(type:string, params:CustomEventInit) {
            let e = (<any>document).createEventObject();
            e.type = type;
            if (params) {
                e.bubbles = Boolean(params.bubbles);
                e.cancelable = Boolean(params.cancelable);
                e.detail = params.detail;
            } else {
                e.bubbles = false;
                e.cancelable = false;
                e.detail = void 0;
            }
            return e;
        } 
    }  
})();
