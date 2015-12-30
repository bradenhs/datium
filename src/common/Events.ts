function handleDelegateEvent(parent:Element, delegateClass:string, callback:(e?:MouseEvent|TouchEvent) => void) {
	return (e:MouseEvent|TouchEvent) => {
		var target = e.srcElement;
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
            reference: newListener,
            event: event
        });
        
        parent.addEventListener(event, newListener);
    }
    return listeners;
}

function attachEvents(events:string[], element:Element|Document, callback:(e?:MouseEvent|TouchEvent) => void):ListenerReference[] {
    let listeners:ListenerReference[] = [];
    for (let key in events) {
        let event:string = events[key];
        
        
        let newListener = (e:MouseEvent|TouchEvent) => {
            callback(e); 
        };
        listeners.push({
            reference: newListener,
            event: event
        });
        
        element.addEventListener(event, newListener);
    }
    return listeners;
}

export function onTap(parent:Element, delegateClass:string, callback:(e?:Event) => void);
export function onTap(element:Element, callback:(e?:Event) => void);
export function onTap(...params:any[]) {
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
        
        if (Math.sqrt(xDiff * xDiff + yDiff * yDiff) < 20) {
            e.preventDefault();
            callback(e);
        }
    }
    
    if (params.length === 3) {
        attachEventsDelegate(['touchstart'], params[0], params[1], handleStart);
        attachEventsDelegate(['touchend', 'click'], params[0], params[1], (e:TouchEvent) => {
            handleEnd(e, params[2]);
        });
    } else if (params.length === 2) {
        attachEvents(['touchstart'], params[0], handleStart);
        attachEvents(['touchend', 'click'], params[0], (e:TouchEvent) => {
            handleEnd(e, params[1]);
        });
    }
}

function onSwipe(element:Element, direction:string, callback:(e?:Event) => void) {
    let startTouchX, startTouchY, startTime;
    attachEvents(['touchstart'], element, (e:TouchEvent) => {
        startTouchX = e.touches[0].clientX;
        startTouchY = e.touches[0].clientY;
        startTime = new Date().valueOf();        
    });
    attachEvents(['touchend'], element, (e:TouchEvent) => {
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

interface ListenerReference {
    reference: EventListener;
    event: string;
}

export function onDrag(parent:Element, delegateClass:string, callbacks:DragCallbacks) {
    let dragging:boolean = false;
    attachEventsDelegate(['touchstart', 'mousedown'], parent, delegateClass, (e?:MouseEvent|TouchEvent) => {
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
            
            for (let key in listeners) {
                let listener = listeners[key];
                
                document.removeEventListener(listener.event, listener.reference);
            }
            
        }));        
    });
}