import {onTap} from 'src/Events';
import ViewManager, {ViewLevel} from 'src/ViewManager';

export default class Header {
	constructor(public el:Element, private viewManager:ViewManager) {
		// Bind events
		onTap(el, 'datium-top', () => {
			viewManager.zoomOut();
		});
		
		onTap(el.querySelector('datium-previous-view'), () => {
			viewManager.previous();
		});
		
		onTap(el.querySelector('datium-next-view'), () => {
			viewManager.next();
		});
		
		viewManager.registerObserver((date:Date, level:ViewLevel) => {
			
		});
	}
}