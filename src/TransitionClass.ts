import {Transition} from 'src/pickers/IPicker';
function getTransitionClass(transition:Transition) {
	switch(transition) {
		case Transition.SCROLL_LEFT: return 'datium-transition-left';
		case Transition.SCROLL_RIGHT: return 'datium-transition-right';
		case Transition.ZOOM_IN: return 'datium-transition-in';
		case Transition.ZOOM_OUT: return 'datium-transition-out';
		default: return '';
	}
}

export default getTransitionClass;