function handleDelegateEvent(parent:Element, delegateClass:string, callback:(e?:MouseEvent|TouchEvent) => void) {
	return (e:MouseEvent|TouchEvent) => {
		var target = e.srcElement || <Element>e.target;
        
		while(!target.isEqualNode(parent)) {
			if (target.classList.contains(delegateClass)) {
				callback(e);
				return;
			}
			target = target.parentElement;
		}
	}
}

function attachEventsDelegate(events:string[], parent:Element, delegateClass:string, callback:(e?:MouseEvent|TouchEvent) => void):ListenerReference[] {
    let listeners:ListenerReference[] = [];
    for (let key in events) {
        let event:string = events[key];
        
        let newListener = handleDelegateEvent(parent, delegateClass, callback);
        listeners.push({
            element: parent,
            reference: newListener,
            event: event
        });
        
        parent.addEventListener(event, newListener);
    }
    return listeners;
}

function attachEvents(events:string[], element:Element|Document|Window, callback:(e?:MouseEvent|TouchEvent|TextEvent) => void):ListenerReference[] {
    let listeners:ListenerReference[] = [];
    for (let key in events) {
        let event:string = events[key];
        
        listeners.push({
            element: element,
            reference: callback,
            event: event
        });
        
        element.addEventListener(event, callback);
    }
    return listeners;
}

export function onTap(parent:Element|Document, delegateClass:string, callback:(e?:Event) => void);
export function onTap(element:Element|Document, callback:(e?:Event) => void);
export function onTap(...params:any[]):ListenerReference[] {
    let startTouchX, startTouchY;
    
    let handleStart = (e:TouchEvent) => {
        startTouchX = e.touches[0].clientX;
        startTouchY = e.touches[0].clientY;
    }
    
    let handleEnd = (e:TouchEvent, callback) => {
        if (startTouchX === void 0 || startTouchY === void 0) {
            e.preventDefault();
            callback(e);
            return;
        }
        
        let xDiff = e.changedTouches[0].clientX - startTouchX;
        let yDiff = e.changedTouches[0].clientY - startTouchY;
        
        if (Math.sqrt(xDiff * xDiff + yDiff * yDiff) < 10) {
            console.log('triggered');
            e.preventDefault();
            callback(e);
        }
    }
    
    let listeners:ListenerReference[] = [];
    
    if (params.length === 3) {
        listeners = listeners.concat(attachEventsDelegate(['touchstart'], params[0], params[1], handleStart));
        listeners = listeners.concat(attachEventsDelegate(['touchend', 'click'], params[0], params[1], (e:TouchEvent) => {
            handleEnd(e, params[2]);
        }));
    } else if (params.length === 2) {
        listeners = listeners.concat(attachEvents(['touchstart'], params[0], handleStart));
        listeners = listeners.concat(attachEvents(['touchend', 'click'], params[0], (e:TouchEvent) => {
            handleEnd(e, params[1]);
        }));
    }
    return listeners;
}

function onSwipe(element:Element, direction:string, callback:(e?:Event) => void) {
    let startTouchX, startTouchY, startTime;
    let touchMoveListener:ListenerReference;
    let scrollingDisabled;
    attachEvents(['touchstart'], element, (e:TouchEvent) => {
        startTouchX = e.touches[0].clientX;
        startTouchY = e.touches[0].clientY;
        startTime = new Date().valueOf();
        scrollingDisabled = false;
        touchMoveListener = attachEvents(['touchmove'], document, (e:TouchEvent) => {
            let xDiff = Math.abs(e.changedTouches[0].clientX - startTouchX);
            let yDiff = Math.abs(e.changedTouches[0].clientY - startTouchY);
            if (xDiff > yDiff && xDiff > 20) {
                scrollingDisabled = true;
            } else if (yDiff > xDiff && yDiff > 20) {
                scrollingDisabled = false;
            }
            if (new Date().valueOf() - startTime > 500) {
                scrollingDisabled = false;
            }
            if (scrollingDisabled) {
                e.preventDefault();
            }
        })[0]; 
    });
    attachEvents(['touchend'], element, (e:TouchEvent) => {
        document.removeEventListener(touchMoveListener.event, touchMoveListener.reference);
        if (startTouchX === void 0 || startTouchY === void 0) return;
        if (new Date().valueOf() - startTime > 500) return;
        let xDiff = e.changedTouches[0].clientX - startTouchX;
        let yDiff = e.changedTouches[0].clientY - startTouchY;
        if (Math.abs(xDiff) > Math.abs(yDiff) && Math.abs(xDiff) > 20) {
            e.preventDefault();
            if (direction === 'left' && xDiff < 0) {
                callback(e);
            }
            if (direction === 'right' && xDiff > 0) {
                callback(e);
            }
        } 
    });
}

export function onSwipeLeft(element:Element, callback:(e?:Event) => void) {
    onSwipe(element, 'left', callback);
}

export function onSwipeRight(element:Element, callback:(e?:Event) => void) {
    onSwipe(element, 'right', callback);
}

interface DragCallbacks {
    dragStart?:(e?:MouseEvent|TouchEvent) => void;
    dragMove?:(e?:MouseEvent|TouchEvent) => void;
    dragEnd?:(e?:MouseEvent|TouchEvent) => void;
}

export interface ListenerReference {
    element: Element|Document|Window;
    reference: EventListener;
    event: string;
}


export function onDrag(parent:Element, delegateClass:string, callbacks:DragCallbacks);
export function onDrag(element:Element, callbacks:DragCallbacks);
export function onDrag(...params:any[]) {
    let dragging:boolean = false;
    
    let callbacks:DragCallbacks = params[params.length-1];
    
    let startEvents = (e?:MouseEvent|TouchEvent) => {
        dragging = true;
        if (callbacks.dragStart !== void 0) {
            callbacks.dragStart(e);
            e.preventDefault();
        }
        
        let listeners:ListenerReference[] = [];
        
        listeners = listeners.concat(attachEvents(['touchmove', 'mousemove'], document, (e?:MouseEvent|TouchEvent) => {
            if (dragging && callbacks.dragMove !== void 0) {
                callbacks.dragMove(e);
                e.preventDefault();
            }
        }));
        listeners = listeners.concat(attachEvents(['touchend', 'mouseup'], document, (e?:MouseEvent|TouchEvent) => {
            if (dragging && callbacks.dragEnd !== void 0) {
                callbacks.dragEnd(e);
                e.preventDefault();
            }
            dragging = false;
            removeListeners(listeners);            
        }));  
    }
    
    if (params.length === 3) {
        attachEventsDelegate(['touchstart', 'mousedown'], params[0], params[1], startEvents);
    } else {
        attachEvents(['touchstart', 'mousedown'], params[0], startEvents);
    }
}

export function onKeyDown(element:Element|Document, callback:(e?:KeyboardEvent) => void) {
    element.addEventListener('keydown', (e:KeyboardEvent) => {
       callback(e); 
    });
}

export function removeListeners(listeners:ListenerReference[]):void {
    for (let key in listeners) {
        let listener = listeners[key];
        listener.element.removeEventListener(listener.event, listener.reference);
    }
}

export function onMouseDown(element:Element, callback:(e?:MouseEvent|TouchEvent) => void) {
    attachEvents(['mousedown'], element, (e) => {
        callback(<any>e);
    }); 
};

export function onDown(parent:Element, delegateClass:string, callback:(e?:MouseEvent|TouchEvent) => void):ListenerReference[];
export function onDown(element:Element, callback:(e?:MouseEvent|TouchEvent) => void):ListenerReference[];
export function onDown(...params:any[]) {
    if (params.length === 3) {
        return attachEventsDelegate(['mousedown', 'touchstart'], params[0], params[1], (e) => {
            params[2](<any>e);
        });
    } else {
        return attachEvents(['mousedown', 'touchstart'], params[0], (e) => {
            params[1](<any>e);
        });        
    } 
};

export function onUp(element:Element|Document, callback:(e?:MouseEvent|TouchEvent) => void):ListenerReference[] {
    return attachEvents(['mouseup', 'touchend'], element, (e) => {
        callback(<any>e);
    }); 
};

export function onFocus(element:Element, callback:(e?:MouseEvent|TouchEvent) => void) {
    attachEvents(['focus'], element, (e) => {
        callback(<any>e);
    }); 
};

export function onPaste(element:Element, callback:(e?:ClipboardEvent) => void) {
    attachEvents(['paste'], element, (e) => {
        callback(<any>e);
    }); 
};

export function onBlur(element:Element|Window, callback:(e?:MouseEvent|TouchEvent) => void) {
    attachEvents(['blur'], element, (e) => {
        e.preventDefault();
        callback(<any>e);
    }); 
};

export const enum KeyCodes {
    RIGHT = 39,
    LEFT = 37,
    TAB = 9,
    UP = 38,
    DOWN = 40
}