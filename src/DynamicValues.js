export function calc_canvas_area(PIXI_APP){
  let bounds = PIXI_APP.view.getBoundingClientRect();
  let CANVAS_AREA={};
  CANVAS_AREA.x1=bounds.left;
  CANVAS_AREA.x2=bounds.right;
  CANVAS_AREA.y1=bounds.top;
  CANVAS_AREA.y2=bounds.bottom;
  CANVAS_AREA.height=CANVAS_AREA.y2-CANVAS_AREA.y1;
  CANVAS_AREA.width=CANVAS_AREA.x2-CANVAS_AREA.x1;
  return CANVAS_AREA;
}
export function calc_sim_play_area(){
  //Hardcoded values of the physics simulation space
  let height = 112*5.31;
  //604
  let width = 90*5.31;
  //478
  let thickness = height;
  let sim_play_area={};
  sim_play_area.x1=0;
  sim_play_area.y1=0;
  sim_play_area.x2=width;
  sim_play_area.y2=height;
  sim_play_area.width=width;
  sim_play_area.height=height;
  sim_play_area.thickness=thickness;
  return sim_play_area;
}
export function calc_relative_play_area(CANVAS_AREA,PLAY_AREA){
  //Taking the canvas top left as (0,0),
  //the play area top left is locatd at (x1,y1)
  let x1,y1,x2,y2;
  x1=21/132 * CANVAS_AREA.width;
  y1=9/132 * CANVAS_AREA.width;
  x2=111/132 * CANVAS_AREA.width;
  y2=121/132 * CANVAS_AREA.width;
  let scale = Math.min((x2-x1)/(PLAY_AREA.sim.width),(y2-y1)/PLAY_AREA.sim.height)
  let rel_play_area = {};
  rel_play_area.x1=x1;
  rel_play_area.y1=y1;
  rel_play_area.x2=x2;
  rel_play_area.y2=y2;
  rel_play_area.width=x2 - x1;
  rel_play_area.height=y2 - y1;
  rel_play_area.scale=scale;
  return rel_play_area;
}
export function calc_absolute_play_area(CANVAS_AREA,PLAY_AREA){
  //Taking the window top left as (0,0),
  //the play area top left is located at (x1,y1)
  let true_play_area={};
  true_play_area.x1=CANVAS_AREA.x1+PLAY_AREA.rel.x1;
  true_play_area.x2=CANVAS_AREA.x1+PLAY_AREA.rel.x2;
  true_play_area.y1=CANVAS_AREA.y1+PLAY_AREA.rel.y1;
  true_play_area.y2=CANVAS_AREA.y1+PLAY_AREA.rel.y2;
  true_play_area.width=true_play_area.x2-true_play_area.x1;
  true_play_area.height=true_play_area.y2-true_play_area.y1;
  return true_play_area;
}