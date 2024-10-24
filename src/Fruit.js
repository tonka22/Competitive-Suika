export class Fruit {
	constructor (physicssprite) {
		this.physicssprite = physicssprite;
		this.fruit_id = +physicssprite.body.label;
		this.radius = (physicssprite.body.bounds.max.x - physicssprite.body.bounds.min.x)/2;
	}
	update () {
	    this.physicssprite.update();
	}
	destroy () {
	    this.physicssprite.destroy();
	}
	get body() {
		return this.physicssprite.body;
	}
	get sprite() {
		return this.physicssprite.sprite;
	}
	get id() {
		return this.physicssprite.body.id;
	}
}