import { Bodies } from 'matter-js';

export function GenerateFixPlayAreaBodies(GAME_AREA){
  let height = GAME_AREA.sim.height;
  let width = GAME_AREA.sim.width;
  let thickness = GAME_AREA.sim.thickness;
  let left_wall = Bodies.rectangle(-1*thickness, 0, 2*thickness, 2*height, { isStatic: true,friction:0,collisionFilter:{category:2}});
  let floor = Bodies.rectangle(width/2,height+thickness, 2*width, 2*thickness, { isStatic: true,frictionStatic:99});
  let right_wall = Bodies.rectangle(width+thickness, 0, 2*thickness, 2*height, { isStatic: true,friction:0,collisionFilter:{category:2}});
  let body_array = [left_wall,floor,right_wall];
  return body_array;
}