import {Composite} from "matter-js";
export class PhysicsSprite {
  constructor (x,y,scale) {
    this.isAlive = true
    this.x_translate = x;
    this.y_translate = y;
    this.scale = scale;
  }
  createPhysics(engine,body) {
    this._engine = engine;
    this._body = body;
    Composite.add(this._engine.world, this._body);
    this.update();
  }
  createSprite(stage,sprite) {
    this._sprite = sprite;
    // this._sprite.anchor.set(0.5);
    this._stage = stage;
    this._stage.addChild(this._sprite);
    this.update();
  }
  update () {
    if (this._body && this._sprite) {
      this._sprite.position.x = (this.scale * this._body.position.x) + this.x_translate;
      this._sprite.position.y = (this.scale * this._body.position.y) + this.y_translate;
      this._sprite.rotation = this._body.angle;
    }
  }
  destroy () {
    this.isAlive = false;
    Composite.remove(this._engine.world, this._body);
    this._body = null;
    this._stage.removeChild(this._sprite);
    this._sprite = null;
  }
  get body(){
    return this._body;
  }
  get sprite(){
    return this._sprite;
  }
}