import { Render, Engine, Sleeping, Composite, Runner, Events, Body, Bodies, Vector, Bounds } from 'matter-js';
import { Application, Assets, Sprite, BitmapFont, BitmapText, Graphics } from 'pixi.js';
import { Button } from '@pixi/ui';
import { PhysicsSprite } from './PhysicsSprite.js';
import { calc_canvas_area, calc_absolute_play_area, calc_sim_play_area, calc_relative_play_area } from './DynamicValues.js';
import { GenerateUISprite, GenerateGameOverSprite, GenerateNextSprite, GenerateNextSprites, GenFruitSprite } from './SpriteGen.js';
import { GenerateFixPlayAreaBodies } from './BodyGen.js';
import { Fruit } from './Fruit.js';
import { GenScreenButton, GenHoldButton, GenCloseButton, GenPlayAgainButton } from './ButtonGen.js';

const EPSILON = 0.5;
let POINTS = 0;
let final_fruit_friction = 0.1;
let final_fruit_density = 0.01;
const ENGINE = Engine.create();
const RUNNER = Runner.create();
const WIDTH = Math.min(window.innerWidth,window.innerHeight);
const HEIGHT = WIDTH;

const PIXI_APP = new Application({ width: WIDTH, height: HEIGHT });
document.body.style.margin = 0;
document.body.style['background-color'] = "#E8DCB9";
if (window.innerWidth > window.innerHeight){
  center_element(PIXI_APP.view);
}
document.body.appendChild(PIXI_APP.view);

let GAME_OVER_SPRITES = [];

const CANVAS_AREA = calc_canvas_area(PIXI_APP);
const PLAY_AREA = {};
let floor_body = set_up_play_area();
const uISprite = GenerateUISprite(CANVAS_AREA,PLAY_AREA);
PIXI_APP.stage.addChild(uISprite);
export const SPRITESHEET = await load_pixi_spritesheet();

let hold_button = GenHoldButton(PLAY_AREA);
hold_button.onPress.connect(()=>{hold_fruit();});
PIXI_APP.stage.addChild(hold_button.view);

let FRUITS = {};
FRUITS.active = {};
FRUITS.ghosts = {};
FRUITS.next = {};
FRUITS.hold = {};
export const FRUIT_RADIUS_RATIOS = [35,45,68,74,93,121,137,167,191,234,277];
export const FRUIT_COLORS = ["red","hotpink","purple","chocolate","orange","crimson","khaki","pink","yellow","lightgreen","forestgreen"]
const FRUIT_POINTS = [0,1,3,6,10,15,21,28,36,45,55,66];
export const RADIUS_U = 35/478/2*PLAY_AREA.sim.width;
render_reference_chart();

function create_next_bag(){
  let bag1 = shuffle([0,1,2,3,4]);
  let bag2 = shuffle([0,1,2,3,4]);
  return bag1.concat(bag2);
}
function top_up_next_bag(inbag){
  let bag = shuffle([0,1,2,3,4]);
  return inbag.concat(bag);
}
let NEXT_BAG = create_next_bag();
let NEXT_BAG_SPRITES = GenerateNextSprites(NEXT_BAG.slice(0,6),PLAY_AREA);
push_next_fruit();

let key_mv=0;
let dash=0;
let dash_speed=3;
let key_speed=PLAY_AREA.sim.width/105; //3
key_move();

BitmapFont.from("PointsFont", {
  fill: 'black',
  fontSize: PLAY_AREA.rel.width*(14/90)/2,
  fontWeight: 'bold',
  stroke:'white',
  strokeThickness:5
});
const text = new BitmapText("", {
  fontName: "PointsFont",
});
PIXI_APP.stage.addChild(text);
function update_points_text(score){
  text.text=score.toString();
  text.position.x=(PLAY_AREA.rel.x1/2) - (text.width/2);
  text.position.y=(42/112 * PLAY_AREA.rel.height);
}
update_points_text(POINTS);

document.addEventListener('click',click_handler);
document.addEventListener('mousemove',mousemove_handler);
document.addEventListener('keydown',keydown_handler);
document.addEventListener('keyup', keyup_handler);
Events.on(ENGINE,"beforeUpdate",anti_grav_all_ghosts);
PIXI_APP.ticker.add(update_all_active_fruit_physicssprites);
Runner.run(RUNNER, ENGINE);
let GAME_ACTIVE=true;

// var render = Render.create({
//     element: document.body,
//     engine: ENGINE
// });
// render.options.showAngleIndicator = true;
// Render.lookAt(render,floor_body);
// Render.run(render);

function set_up_play_area(){
  PLAY_AREA.sim = calc_sim_play_area();
  PLAY_AREA.rel = calc_relative_play_area(CANVAS_AREA,PLAY_AREA);
  PLAY_AREA.abs = calc_absolute_play_area(CANVAS_AREA,PLAY_AREA);
  let play_area_bodies = GenerateFixPlayAreaBodies(PLAY_AREA);
  Composite.add(ENGINE.world,play_area_bodies);
  return play_area_bodies[1];
}

async function load_pixi_spritesheet(){
  let spritesheet = await Assets.load('public/gs.json');
  return spritesheet.textures;
}

function gen_fruit_body(x,y,fruit_id){
  let fruit_radius = RADIUS_U*FRUIT_RADIUS_RATIOS[fruit_id]/FRUIT_RADIUS_RATIOS[0];
  let fruit_body = Bodies.circle(x,y,fruit_radius,
    {
      label:fruit_id.toString(),
      friction:0
    },
    1024
  );
  Body.setDensity(fruit_body,final_fruit_density);
  return fruit_body;
}

function gen_fruit_physicssprite(x,y,fruit_id,fruit_sprite){
  //Create+render fruit
  //Returns physicssprite
  let physicssprite = new PhysicsSprite(PLAY_AREA.rel.x1,PLAY_AREA.rel.y1,PLAY_AREA.rel.scale);
  let fruit_body = gen_fruit_body(x,y,fruit_id);
  let gend_fruit_sprite = GenFruitSprite(fruit_id,PLAY_AREA,fruit_sprite);
  physicssprite.createPhysics(ENGINE,fruit_body);
  physicssprite.createSprite(PIXI_APP.stage,gend_fruit_sprite);
  return physicssprite;
}

function gen_fruit(x,y,fruit_id,fruit_sprite){
  //The x and y passed are w.r.t simulation
  let gend_fruit;
  gend_fruit = new Fruit(gen_fruit_physicssprite(x,y,fruit_id,fruit_sprite));
  FRUITS.active[gend_fruit.id] = gend_fruit;
  return gend_fruit;
}

function make_body_ghost(fruit_body){
  //ghost ->
  //anti-gravity
  //only collides with side-walls
  FRUITS.ghosts[fruit_body.id] = fruit_body.type;
  fruit_body.collisionFilter.mask = 2;
}
function make_body_real(fruit_body){
  //real ->
  //gravity applied
  //collides with all
  FRUITS.ghosts[fruit_body.id] = null;
  fruit_body.collisionFilter.mask = -1;
}

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;
  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

function render_next_board(sprite_list){
  sprite_list.forEach((sprite,list_idx)=>{
    sprite.position = {x:PLAY_AREA.rel.x2 + (6/90 * PLAY_AREA.rel.width),y:PLAY_AREA.rel.y1 + (list_idx*11/112* PLAY_AREA.rel.height) + (15/112 * PLAY_AREA.rel.height)};
    PIXI_APP.stage.addChild(sprite);
  });
}
function update_next_bag_sprites(){
  let new_fruit_sprite = GenerateNextSprite(NEXT_BAG[5],PLAY_AREA);
  NEXT_BAG_SPRITES.push(new_fruit_sprite);
}
function render_reference_chart(){
  let ref_sprite;
  let ref_height = PLAY_AREA.rel.width/11;
  for (let i=0;i<=10;i++){
    ref_sprite = GenFruitSprite(i,PLAY_AREA);
    ref_sprite.height=ref_height;
    ref_sprite.width=ref_height;
    ref_sprite.position.x=PLAY_AREA.rel.x1+ref_height/2+i*ref_height;
    ref_sprite.position.y=HEIGHT;
    PIXI_APP.stage.addChild(ref_sprite);
  }
}

function move_sprite_to_held_fruit_spot(sprite,fruit_id){
  sprite.height = (FRUIT_RADIUS_RATIOS[fruit_id] / FRUIT_RADIUS_RATIOS[4]) * (18/90 * PLAY_AREA.rel.width);
  sprite.width = sprite.height;
  sprite.position = {x:PLAY_AREA.rel.x1 - (10/90 * PLAY_AREA.rel.width),y:PLAY_AREA.rel.y1 + (17/112 * PLAY_AREA.rel.height)};
  return sprite;
}
function hold_fruit(){
  if (!GAME_ACTIVE){return;}
  if (FRUITS.ghosts[FRUITS.next.id] == null){
    return;
  }
  if (FRUITS.hold.sprite){
    let old_held_fruit_id = FRUITS.hold.fruit_id;
    let old_held_fruit_sprite = FRUITS.hold.sprite;

    let new_held_fruit_id = FRUITS.next.fruit_id;
    let new_held_fruit_sprite = FRUITS.next.sprite;
    FRUITS.active[FRUITS.next.id] = null;

    FRUITS.hold.sprite = move_sprite_to_held_fruit_spot(new_held_fruit_sprite,new_held_fruit_id);
    FRUITS.hold.fruit_id = new_held_fruit_id;

    let x = FRUITS.next.body.position.x;
    let y = PLAY_AREA.sim.y1;
    FRUITS.next = gen_fruit(x,y,old_held_fruit_id,old_held_fruit_sprite);
    make_body_ghost(FRUITS.next.body);
  } else {
    FRUITS.hold.fruit_id = FRUITS.next.fruit_id;
    FRUITS.hold.sprite = FRUITS.next.sprite;
    FRUITS.active[FRUITS.next.id] = null;
    move_sprite_to_held_fruit_spot(FRUITS.hold.sprite,FRUITS.hold.fruit_id);
    push_next_fruit();
  }
}

function push_next_fruit(){
  //Set+render the new fruit_to_be_placed and update+render the next fruit list
  let old_fruit_x;
  if (FRUITS.next.body){
    //else, follow same x as previous fruit
    old_fruit_x = FRUITS.next.body.position.x;
  } else {
    //If previous fruit has been destroyed (i.e first held fruit)
    old_fruit_x=(PLAY_AREA.sim.x1+PLAY_AREA.sim.x2)/2;
  }
  FRUITS.next = gen_fruit(old_fruit_x,PLAY_AREA.sim.y1,NEXT_BAG.shift(),NEXT_BAG_SPRITES.shift());
  make_body_ghost(FRUITS.next.body);
  update_next_bag_sprites()
  render_next_board(NEXT_BAG_SPRITES);
  if (NEXT_BAG.length<=6){
    NEXT_BAG = top_up_next_bag(NEXT_BAG);
  }
}
let game_over_shown;
function game_over(){
  GAME_ACTIVE = false;
  RUNNER.enabled=false;
  if (GAME_OVER_SPRITES.length > 0){
    show_game_over();
  } else {
    let game_over_bg = GenerateGameOverSprite(PLAY_AREA);
    PIXI_APP.stage.addChild(game_over_bg);
    GAME_OVER_SPRITES.push(game_over_bg)
    let close_button = GenCloseButton(PLAY_AREA);
    close_button.onPress.connect(()=>{hide_game_over();});
    PIXI_APP.stage.addChild(close_button.view);
    GAME_OVER_SPRITES.push(close_button.view)
    let text = new BitmapText("", {
      fontName: "PointsFont",
    });
    text.text="PLAY AGAIN";
    text.position.x = PLAY_AREA.rel.x1+PLAY_AREA.rel.width/2;
    text.position.y = PLAY_AREA.rel.y1+PLAY_AREA.rel.height/2;
    text.anchor.set(0.5);
    PIXI_APP.stage.addChild(text);
    GAME_OVER_SPRITES.push(text);
    let play_again_button = GenPlayAgainButton(text);
    // play_again_button.onPress.connect(()=>{reset_game_over();});
    // PIXI_APP.stage.addChild(play_again_button.view);
    GAME_OVER_SPRITES.push(play_again_button.view);
  }
}
function hide_game_over(){
  GAME_OVER_SPRITES.forEach((sprite)=>{
    PIXI_APP.stage.removeChild(sprite);
  });

}
function show_game_over(){
  GAME_OVER_SPRITES.forEach((sprite)=>{
    PIXI_APP.stage.addChild(sprite);
  });
}
function reset_game_over(){
  hide_game_over();
  Object.values(FRUITS.active).forEach((fruit)=>{
    if (fruit){
      if(fruit.body){
        fruit.destroy();
      }
    }
  });
  PIXI_APP.stage.removeChild(FRUITS.hold.sprite)
  FRUITS.hold = {};
  NEXT_BAG = create_next_bag();
  Object.values(NEXT_BAG_SPRITES).forEach((sprite)=>{
    PIXI_APP.stage.removeChild(sprite);
  });
  NEXT_BAG_SPRITES = GenerateNextSprites(NEXT_BAG.slice(0,6),PLAY_AREA);
  push_next_fruit();
  POINTS=0;
  update_points_text(POINTS);
  RUNNER.enabled=true;
  GAME_ACTIVE = true;
}


Events.on(ENGINE, "collisionStart", (event) => {
  //When the world has a new collision event,
  //the maximum number of new fruits that can be created is 1(one)
  //This prevents a single fruit collision from producing infinite fruits
  //and is also efficient because we get to skip the rest of the pairs
  let created=0;
  event.pairs.forEach((pair)=>{
    // //The side-wall ignore (because ghost collisions with sidewall still trigger this event)
    // //We dont want to count those
    if (pair.bodyA.collisionFilter.category==2 || pair.bodyB.collisionFilter.category==2){return;}
    //While fruit_to_be_placed is freefalling, we want no friction
    //and now that it has hit something, we want friction back
    //and also slow it down to zero
    if (pair.bodyA.friction==0){pair.bodyA.friction=final_fruit_friction;}//Body.setAngularSpeed(pair.bodyA,0);}
    if (pair.bodyB.friction==0){pair.bodyB.friction=final_fruit_friction;}//Body.setAngularSpeed(pair.bodyB,0);}
    if (created==1){return;}
    if (pair.bodyA.label != pair.bodyB.label){return;}
    if (pair.bodyA.label!="10"){
      let new_fruit_x = pair.activeContacts[0].vertex.x
      let new_fruit_y = pair.activeContacts[0].vertex.y
      let new_fruit_id = +pair.bodyA.label+1;
      let new_fruit = gen_fruit(new_fruit_x,new_fruit_y,new_fruit_id);
      FRUITS.active[new_fruit.id] = new_fruit;
      created=1;
      POINTS+=FRUIT_POINTS[new_fruit_id];
      update_points_text(POINTS);
    } else if (pair.bodyA.label=="10"){
      POINTS+=FRUIT_POINTS[11];
      update_points_text(POINTS);
    }
    if (pair.bodyA.id == FRUITS.next.id || pair.bodyB.id == FRUITS.next.id){
      push_next_fruit();
    }
    FRUITS.active[pair.bodyA.id].destroy();
    FRUITS.active[pair.bodyB.id].destroy();
    FRUITS.active[pair.bodyA.id] = null;
    FRUITS.active[pair.bodyB.id] = null;
  })
});

Events.on(ENGINE, "collisionActive", (event) => {
  //This is to detect the event when fruit_to_be_placed has settled down
  //This means sitting on the floor or another different type fruit
  //So we must ignore the side walls
  //Otherwise the ghost version hitting the side wall would trigger this
  //We want to fix the angular velocity bug that happens when fruits land (rolling left for no reason)
  event.pairs.forEach((pair)=>{
    //The side wall ignore
    if (pair.bodyA.collisionFilter.category==2 || pair.bodyB.collisionFilter.category==2){return;}
    //Game over check
    if (is_real_fruit(pair.bodyA) && pair.bodyA.bounds.min.y <= PLAY_AREA.sim.y1){
      game_over();
    }
    if (is_real_fruit(pair.bodyB) && pair.bodyB.bounds.min.y <= PLAY_AREA.sim.y1){
      game_over();
    }
    //Settle down fix
    if (pair.bodyA.id == FRUITS.next.id || pair.bodyB.id == FRUITS.next.id){
      if (pair.bodyA.id == FRUITS.next.body.id){Body.setAngularVelocity(pair.bodyA,0);}
      if (pair.bodyB.id == FRUITS.next.body.id){Body.setAngularVelocity(pair.bodyB,0);}
      //Now that the old fruit has settled down,
      //push the next fruit_to_be_placed
      push_next_fruit();
    }
  });
});


function key_move(){
// 1 -> right
// 2 -> left
// 3 -> left+right(p)
// 4 -> right+left(p)

  if (FRUITS.next.body && FRUITS.ghosts[FRUITS.next.body.id] == null){
    setTimeout(key_move, 16);
  }
  else {
      switch(key_mv){
        case 1:
          if(Math.abs((PLAY_AREA.sim.x2-FRUITS.next.radius)-FRUITS.next.body.position.x)<EPSILON){FRUITS.next.body.position.x=PLAY_AREA.sim.x2-FRUITS.next.radius;break;}
          Body.translate(FRUITS.next.body,Vector.create(key_speed*(1-dash)+key_speed*dash*dash_speed,0));
          break;
        case 2:
          if(Math.abs(FRUITS.next.body.position.x-(PLAY_AREA.sim.x1+FRUITS.next.radius))<EPSILON){FRUITS.next.body.position.x=PLAY_AREA.sim.x1+FRUITS.next.radius;break;}
          Body.translate(FRUITS.next.body,Vector.create(-key_speed*(1-dash)-key_speed*dash*dash_speed,0));
          break;
        case 3:
          if(Math.abs((PLAY_AREA.sim.x2-FRUITS.next.radius)-FRUITS.next.body.position.x)<EPSILON){FRUITS.next.body.position.x=PLAY_AREA.sim.x2-FRUITS.next.radius;break;}
          Body.translate(FRUITS.next.body,Vector.create(key_speed*(1-dash)+key_speed*dash*dash_speed,0));
          break;
        case 4:
          if(Math.abs(FRUITS.next.body.position.x-(PLAY_AREA.sim.x1+FRUITS.next.radius))<EPSILON){FRUITS.next.body.position.x=PLAY_AREA.sim.x1+FRUITS.next.radius;break;}
          Body.translate(FRUITS.next.body,Vector.create(-key_speed*(1-dash)-key_speed*dash*dash_speed,0));
          break;
      }
      setTimeout(key_move, 16);
  }
}
function click_handler(event){
  if (!GAME_ACTIVE){
    let close_button = GAME_OVER_SPRITES[1];
    if (click_in_bounds(event,CANVAS_AREA,close_button.getBounds())){
      return;
    }
    let play_again_button = GAME_OVER_SPRITES[3];
    if (click_in_bounds(event,CANVAS_AREA,play_again_button.getBounds())){
      reset_game_over();
      return;
    }
    show_game_over();
    return;
  }
  if (click_in_bounds(event,CANVAS_AREA,hold_button.view.getBounds())){
    return;
  }
  if (FRUITS.ghosts[FRUITS.next.id] != null){
    make_body_real(FRUITS.next.body);
  }
}
function mousemove_handler(event){
  if (!GAME_ACTIVE){return;}
  if (FRUITS.next.body && FRUITS.ghosts[FRUITS.next.id] != null){
    let ex = event.clientX;
    ex = ex - PLAY_AREA.abs.x1;
    ex = ex / PLAY_AREA.rel.scale;
    let left_limit = PLAY_AREA.sim.x1 + (FRUITS.next.radius);
    let right_limit = PLAY_AREA.sim.width - (FRUITS.next.radius);
    if (ex<left_limit){
      ex=FRUITS.next.radius;
      ex=left_limit
    }
    else if (ex>right_limit){
      ex=(PLAY_AREA.sim.width) - (FRUITS.next.radius);
      ex=right_limit
    }
    Body.translate(
      FRUITS.next.body,Vector.create(
        (ex)-FRUITS.next.body.position.x,
        0
      )
    );
  }
}

function keydown_handler(event){
  if (!GAME_ACTIVE){return;}
  switch(event.code){
    case 'ArrowUp':
      if (FRUITS.ghosts[FRUITS.next.body.id] != null){
        make_body_real(FRUITS.next.body);
      }
      break;
    case 'ArrowDown':
      break;
    case 'ArrowRight':
      switch(key_mv){
        case 0:
          key_mv=1;
          break;
        case 2:
          key_mv=3;
          break;
      }
      break;
    case 'ArrowLeft':
      switch(key_mv){
        case 0:
          key_mv=2;
          break;
        case 1:
          key_mv=4;
          break;
      }
      break;
    case 'Space':
      hold_fruit();
      break;
    case 'ShiftLeft':
      if (dash==0){
        dash=1;
      }
      break;
    // case 'KeyA':
    //   game_over();
    //   break;
  }
}
function keyup_handler(event){
  if (!GAME_ACTIVE){return;}
  switch(event.code){
    case 'ArrowRight':
      switch(key_mv){
        case 1:
          key_mv=0;
          break;
        case 3:
          key_mv=2;
          break;
        case 4:
          key_mv=2;
          break;
      }
      break;
    case 'ArrowLeft':
      switch(key_mv){
        case 2:
          key_mv=0;
          break;
        case 3:
          key_mv=1;
          break;
        case 4:
          key_mv=1;
          break;
      }
      break;
    case 'ShiftLeft':
      if (dash==1){
        dash=0;
      }
      break;
  }
}


function is_real_fruit(body){
  return FRUITS.ghosts[body.id]==null && FRUITS.active[body.id]!=null;
}

function anti_grav_all_ghosts(){
  Composite.allBodies(ENGINE.world).forEach((body)=>{
    if (FRUITS.ghosts[body.id] != null){
      Body.applyForce(body,body.position,{x:0,y:-1*body.mass*ENGINE.gravity.y*ENGINE.gravity.scale});
    }
  });
}
function update_all_active_fruit_physicssprites(){
  Object.values(FRUITS.active).forEach((fruit)=>{
    if(fruit){
      fruit.update();
    }
  });
}

function center_element(element){
  if (window.innerWidth>window.innerHeight){
    element.style.position = "absolute";
    element.style.left = "50%";
    element.style.transform="translate(-50%,0%)";
  } else if (window.innerWidth<window.innerHeight){
    element.style.position = "absolute";
    element.style.bottom = "50%";
    element.style.transform="translate(0%,50%)";
  }
}

function click_in_bounds(event,CANVAS_AREA,bounds){
  if (event.clientX <= CANVAS_AREA.x1+bounds.x+bounds.width){
    if (event.clientX >= CANVAS_AREA.x1+bounds.x && 
      event.clientY <= CANVAS_AREA.y1+bounds.y+bounds.height &&
      event.clientY >= CANVAS_AREA.y1+bounds.y
      ){
      return true;
    }
  }
  return false;
}