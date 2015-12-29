function handleEvent(parent:Element, delegateClass:string, callback:(e?:Event) => void) {
	return (e:Event) => {
		e.preventDefault();
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

function addListener(mouseEvent:string, touchEvent:string, params:any[]):void {
    if (params.length === 3) {
		params[0].addEventListener(mouseEvent, handleEvent(params[0], params[1], params[2]));
		params[0].addEventListener(touchEvent, handleEvent(params[0], params[1], params[2]));
	} else if (params.length === 2) {
		params[0].addEventListener(mouseEvent, (e:Event) => {
            e.preventDefault();
            params[1]();
        });        
		params[0].addEventListener(touchEvent, (e:Event) => {
            e.preventDefault();
            params[1]();
        });
	}
}

export function onTap(parent:Element, delegateClass:string, callback:(e?:Event) => void);
export function onTap(element:Element, callback:(e?:Event) => void);
export function onTap(...params:any[]) {
    addListener('click', 'touchend', params);
}