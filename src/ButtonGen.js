import { Graphics } from 'pixi.js';
import { Button } from '@pixi/ui';

export function GenScreenButton(CANVAS_AREA){
	let button = new Button(
	    new Graphics()
	        .beginFill(0xfff,.00001)
	        .drawRect(0, 0, CANVAS_AREA.width, CANVAS_AREA.height)
	);
	return button;
}

export function GenHoldButton(PLAY_AREA){
	const button = new Button(
    new Graphics()
        .beginFill(0xfff,.00001)
        .drawRect(PLAY_AREA.rel.x1 - (19/90 * PLAY_AREA.rel.width), PLAY_AREA.rel.y1 + (8/112 * PLAY_AREA.rel.height), 18/90 * PLAY_AREA.rel.width, 18/112 * PLAY_AREA.rel.height)
	);
	return button;
}
export function GenPlayAgainButton(text_object){
	let x1 = text_object.position.x - text_object.width/2;
	let y1 = text_object.position.y - text_object.height/2;
	const button = new Button(
    new Graphics()
        .beginFill(0xfff,0.00001)
        .drawRect(x1,y1,text_object.width,text_object.height)
	);
	return button;
}
export function GenCloseButton(PLAY_AREA){
	let x = PLAY_AREA.rel.x1+0.9*PLAY_AREA.rel.width;
	let y = PLAY_AREA.rel.y1+0.1*PLAY_AREA.rel.height;
	let button = new Button(
    new Graphics()
        .beginFill('#922D50')
        .drawCircle(x,y,0.04*PLAY_AREA.rel.width)
	);
	return button;
}