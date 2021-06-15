export function GravityBitch(x, y, v_x, v_y, m) {
    this.pos = [x, y];
    this.vel = [v_x, v_y];
    this.acc = [0, 0];
    this.m = m;
}

export function Ship(x, y, m, r, i) {
    this.pos = [x, y];
    this.vel = [0, 0];
    this.m = m;
    this.rot = r;
    this.thrust = false;
    this.impulse = i;
}

const shipProto = new GravityBitch();
shipProto.rot = 0;
shipProto.thrust = false;
shipProto.impulse = 0;
shipProto.dir_rot = [0, 0];
Ship.prototype = shipProto;
