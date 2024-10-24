import { Graphics, Sprite } from 'pixi.js';
import { RADIUS_U, FRUIT_RADIUS_RATIOS, FRUIT_COLORS, SPRITESHEET } from './index.js'

export function GenerateUISprite(CANVAS_AREA,PLAY_AREA){
	let bg = new Graphics();
	//Main back
	bg = bg.beginFill('#0B3142').drawRect(0, 0, CANVAS_AREA.width, CANVAS_AREA.height);
	//Game area
	bg = bg.beginFill('#0F5257').drawRect(PLAY_AREA.rel.x1,PLAY_AREA.rel.y1,PLAY_AREA.rel.width,PLAY_AREA.rel.height);
	//Hold area
	bg = bg.beginFill('#9C92A3').drawRect(PLAY_AREA.rel.x1 - (21/90 * PLAY_AREA.rel.width), PLAY_AREA.rel.y1, 21/90 * PLAY_AREA.rel.width, 32/112 * PLAY_AREA.rel.height);
	//Next area
	bg = bg.beginFill('#9C92A3').drawRect(PLAY_AREA.rel.x2, PLAY_AREA.rel.y1, 21/90 * PLAY_AREA.rel.width, 85/112 * PLAY_AREA.rel.height);
	//Hold box
	bg = bg.beginFill('black').drawRect(PLAY_AREA.rel.x1 - (19/90 * PLAY_AREA.rel.width), PLAY_AREA.rel.y1 + (8/112 * PLAY_AREA.rel.height), 18/90 * PLAY_AREA.rel.width, 18/112 * PLAY_AREA.rel.height);
	//Next boxes
	bg = bg.beginFill('black').drawRect(PLAY_AREA.rel.x2 + (1/90 * PLAY_AREA.rel.width), PLAY_AREA.rel.y1 + (10/112 * PLAY_AREA.rel.height), 10/90 * PLAY_AREA.rel.width, 10/112 * PLAY_AREA.rel.height);
	bg = bg.beginFill('black').drawRect(PLAY_AREA.rel.x2 + (1/90 * PLAY_AREA.rel.width), PLAY_AREA.rel.y1 + (21/112 * PLAY_AREA.rel.height), 10/90 * PLAY_AREA.rel.width, 10/112 * PLAY_AREA.rel.height);
	bg = bg.beginFill('black').drawRect(PLAY_AREA.rel.x2 + (1/90 * PLAY_AREA.rel.width), PLAY_AREA.rel.y1 + (32/112 * PLAY_AREA.rel.height), 10/90 * PLAY_AREA.rel.width, 10/112 * PLAY_AREA.rel.height);
	bg = bg.beginFill('black').drawRect(PLAY_AREA.rel.x2 + (1/90 * PLAY_AREA.rel.width), PLAY_AREA.rel.y1 + (43/112 * PLAY_AREA.rel.height), 10/90 * PLAY_AREA.rel.width, 10/112 * PLAY_AREA.rel.height);
	bg = bg.beginFill('black').drawRect(PLAY_AREA.rel.x2 + (1/90 * PLAY_AREA.rel.width), PLAY_AREA.rel.y1 + (54/112 * PLAY_AREA.rel.height), 10/90 * PLAY_AREA.rel.width, 10/112 * PLAY_AREA.rel.height);
	bg = bg.beginFill('black').drawRect(PLAY_AREA.rel.x2 + (1/90 * PLAY_AREA.rel.width), PLAY_AREA.rel.y1 + (65/112 * PLAY_AREA.rel.height), 10/90 * PLAY_AREA.rel.width, 10/112 * PLAY_AREA.rel.height);
	return bg;
}
export function GenerateGameOverSprite(PLAY_AREA){
	let bg = new Graphics();
	//Main back
	bg = bg.beginFill('#BBCEA8').drawRoundedRect(PLAY_AREA.rel.x1+0.1*PLAY_AREA.rel.width, PLAY_AREA.rel.y1+0.1*PLAY_AREA.rel.height, 0.8*PLAY_AREA.rel.width, 0.8*PLAY_AREA.rel.height);
	return bg;
}
export function GenSprite(sprite_name){
  let spritesheet_texture = SPRITESHEET[sprite_name];
  let sprite = Sprite.from(spritesheet_texture);
  return sprite;
}
export function GenFruitSprite(fruit_id,PLAY_AREA,fruit_sprite){
  if (fruit_sprite === undefined){
  	if (fruit_id >= 5){
	    fruit_sprite = GenSprite("circle2");
	  } else {
	    fruit_sprite = GenSprite("circle");
	  }
  }
  let fruit_body_height = 2*RADIUS_U*(FRUIT_RADIUS_RATIOS[fruit_id]/FRUIT_RADIUS_RATIOS[0]);
  fruit_sprite.height = PLAY_AREA.rel.scale * fruit_body_height;
  fruit_sprite.width = fruit_sprite.height;
  fruit_sprite.tint = FRUIT_COLORS[fruit_id];
  fruit_sprite.anchor.set(0.5);
  return fruit_sprite;
}
export function GenerateNextSprite(fruit_id,PLAY_AREA){
    let next_sprite = GenFruitSprite(fruit_id,PLAY_AREA);
    let sprite_height = (FRUIT_RADIUS_RATIOS[fruit_id] / FRUIT_RADIUS_RATIOS[4]) * (10/90 * PLAY_AREA.rel.width);
    next_sprite.height = sprite_height;
    next_sprite.width = sprite_height;
    next_sprite.anchor.set(0.5);
    return next_sprite;
}

export function GenerateNextSprites(fruit_id_list,PLAY_AREA){
	let next_sprites = [];
	fruit_id_list.forEach((fruit_id,list_idx)=>{
		let next_sprite = GenerateNextSprite(fruit_id,PLAY_AREA);
		next_sprites.push(next_sprite);
	});
	return next_sprites;
}