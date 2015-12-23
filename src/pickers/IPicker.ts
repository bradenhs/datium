export enum Transition {
	SCROLL_LEFT,
	SCROLL_RIGHT,
	ZOOM_IN,
	ZOOM_OUT,
	NONE
}

export interface IPicker {
	create(transition:Transition, date:Date);
	getHeight():number;
	destroy(transition:Transition);
}