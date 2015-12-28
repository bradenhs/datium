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

export function onTap(parent:Element, delegateClass:string, callback:(e?:Event) => void);
export function onTap(element:Element, callback:(e?:Event) => void);
export function onTap(...params:any[]) {
	if (params.length === 3) {
		params[0].addEventListener('click', handleEvent(params[0], params[1], params[2]));
		params[0].addEventListener('touchend', handleEvent(params[0], params[1], params[2]));
	} else if (params.length === 2) {
		params[0].addEventListener('click', params[1]);
		params[0].addEventListener('touchend', params[1]);
	}
}