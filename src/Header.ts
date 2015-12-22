import {onTap} from 'src/Events';

export default class Header {
	constructor(public el:Element) {
		// Bind events
		onTap(el, 'datium-top', () => {
			
		});
		
		onTap(el.querySelector('datium-previous-view'), () => {
			
		});
		
		onTap(el.querySelector('datium-next-view'), () => {
			
		});
	}
}