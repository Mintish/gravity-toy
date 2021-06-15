import vec from "./vec.js";
import { Ship, GravityBitch } from "./objects.js";

export default function Game(canvas) {
    const second = 1000; // ms
    const G = 6.674 * Math.pow(10, -11);
    const context = canvas.getContext("2d");
    const _this = this;

    this.initialize = function () {
        const instructions = document.getElementById("instructions");
        canvas.height = window.innerHeight - instructions.getClientRects()[0].height * 2;
        canvas.width = window.innerWidth;
        canvas.style = "background: white;";
        const keysDown = {};
        document.body.addEventListener(
            "keydown",
            function(e) {
                keysDown[e.key] = true;
            }
        );
        document.body.addEventListener(
            "keyup",
            function(e) {
                keysDown[e.key] = false;
            }
        );
        const ship = new Ship(50, 100, 1000, 0, 16);
        const objects = [
            ship,
            new GravityBitch(748, 442, 19, 62, 1000),
            new GravityBitch(875, 688, -50, -11, Math.pow(10, 14)),
            new GravityBitch(canvas.width / 2, canvas.height / 2, 0, 0, Math.pow(10, 16)),
        ];
        let t = Date.now();
        const state = {
            keysDown,
            t,
            ship,
            objects,
        };
        window.requestAnimationFrame(
            function() {
                _this.loop(state);
            }
        );
    };

    this.loop = function (state) {
        const { keysDown, t, ship, objects} = state;
        const now = Date.now();
        const h = (now - t) / second;
        // update ship rotation
        if (keysDown["d"]) {
            ship.rot += 0.1;
        }
        if (keysDown["a"]) {
            ship.rot -= 0.1;
        }
        // ship rotation
        ship.dir_rot = vec.unit([Math.cos(ship.rot), Math.sin(ship.rot)]);
        // ship under thrust?
        ship.thrust = keysDown["w"];
        this.simulate(state, h);
        this.render(state);
        state.t = now;
        window.requestAnimationFrame(
            function() {
                _this.loop(state);
            }
        );
    };

    this.simulate = function ({ ship, objects }, h) {
        for (let i_o = 0; i_o < objects.length; i_o++) {
            const o = objects[i_o];
            // add up forces subjected by other objects
            o.acc = [0, 0];
            for (let j_o = 0; j_o < objects.length; j_o++) {
                if (i_o !== j_o) {
                    const o_ = objects[j_o];
                    const dir_o_ = vec.sub(o_.pos, o.pos);
                    const u_o_ = vec.unit(dir_o_);
                    const norm_o_ = vec.norm(dir_o_);
                    const f = G * (o.m * o_.m) / Math.pow(norm_o_, 2);
                    const a = f / o.m;
                    o.acc = vec.add(o.acc, vec.mult(u_o_, a));
                }
            }
            if (o.thrust) {
                o.acc = vec.add(o.acc, vec.mult(ship.dir_rot, o.impulse));
            }
            o.vel = vec.add(o.vel, vec.mult(o.acc, h));
            o.pos = vec.add(o.pos, vec.mult(o.vel, h));
        }
    };

    this.render = function ({ ship, objects }) {
        // blank screen
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "black";
        // objects
        for (let i_o = 0; i_o < objects.length; i_o++) {
            const o = objects[i_o];
            context.beginPath();
            context.strokeStyle = "black";
            const r = o.m > 1000000 ? 20 : 3;
            context.ellipse(o.pos[0], o.pos[1], r, r, 0, 0, 2 * Math.PI);
            context.stroke();
            // acceleration vector indicator
            const size_acc = vec.norm(o.acc);
            const u_acc = vec.unit(o.acc);
            context.beginPath();
            context.strokeStyle = "red";
            context.moveTo(o.pos[0] + u_acc[0] * 5, o.pos[1] + u_acc[1] * 5);
            context.lineTo(o.pos[0] + u_acc[0] * size_acc, o.pos[1] + u_acc[1] * size_acc);
            context.stroke();
            // ship rotation indicator
            if (o instanceof Ship) {
                context.beginPath();
                context.strokeStyle = "green";
                context.moveTo(o.pos[0] + ship.dir_rot[0] * 5, o.pos[1] + ship.dir_rot[1] * 5);
                context.lineTo((o.pos[0] + ship.dir_rot[0] * 20), (o.pos[1] + ship.dir_rot[1] * 20));
                context.stroke();
            }
        }
    };
}
