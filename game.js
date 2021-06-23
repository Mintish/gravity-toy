import vec from "./vec.js";
import { Ship, GravityBitch } from "./objects.js";

export default function Game(canvas, controls) {
    const second = 1000; // ms
    const G = 6.674 * Math.pow(10, -11);
    const context = canvas.getContext("2d");
    this.controls = controls;
    const _this = this;
    let paused = false;

    this.initialize = function () {
        const keysDown = {};
        let selectedObject = 0;
        const ship = new Ship(70, 400, 0, 300, 1000, 0, 96);
        const objects = [
            ship,
            new GravityBitch(100, 400, 0, 450, Math.pow(10, 16)),
            new GravityBitch(400, 400, 0, 0, Math.pow(10, 18)),
        ];
        const proxiedObjects = [];
        for (let i_o = 0; i_o < objects.length; i_o++) {
            const tableRow = document.createElement("tr");
            tableRow.addEventListener(
                "click",
                function(e) {
                    selectedObject = i_o;
                }
            );
            const pxCell = document.createElement("td");
            const pyCell = document.createElement("td");
            const vxCell = document.createElement("td");
            const vyCell = document.createElement("td");
            const mCell = document.createElement("td");
            mCell.innerHTML = objects[i_o].m;
            for (let c of [pxCell, pyCell, vxCell, vyCell, mCell])
                tableRow.appendChild(c);
            controls.objectsList.appendChild(tableRow);
            const handler = {
                set(obj, prop, value) {
                    obj[prop] = value;
                    switch (prop) {
                    case "vel":
                        if (selectedObject == i_o) {
                            controls.velocity.xInput.value = value[0];
                            controls.velocity.yInput.value = value[1];
                        }
                        vxCell.innerHTML = value[0];
                        vyCell.innerHTML = value[1];
                        break;
                    case "pos":
                        if (selectedObject == i_o) {
                            controls.position.xInput.value = value[0];
                            controls.position.yInput.value = value[1];
                        }
                        pxCell.innerHTML = value[0];
                        pyCell.innerHTML = value[1];
                        break;
                    }
                    if (selectedObject == i_o) {
                    }
                    return true;
                },
                get(obj, prop) {
                    return obj[prop];
                }
            };
            const proxy = new Proxy(objects[i_o], handler);
            proxiedObjects.push(proxy);
        }
        const shipProxy = proxiedObjects[0];
        controls.stopButton.addEventListener(
            "click",
            function() {
                paused = true;
            }
        );
        controls.startButton.addEventListener(
            "click",
            function() {
                paused = false;
            }
        );
        controls.position.xInput.addEventListener(
            "change",
            function(e) {
                proxiedObjects[selectedObject].pos[0] = parseInt(e.target.value);
            }
        );
        controls.position.yInput.addEventListener(
            "change",
            function(e) {
                proxiedObjects[selectedObject].pos[1] = parseInt(e.target.value);
            }
        );
        controls.velocity.xInput.addEventListener(
            "change",
            function(e) {
                proxiedObjects[selectedObject].vel[0] = parseInt(e.target.value);
            }
        );
        controls.velocity.yInput.addEventListener(
            "change",
            function(e) {
                proxiedObjects[selectedObject].vel[1] = parseInt(e.target.value);
            }
        );
        controls.massInput.addEventListener(
            "change",
            function(e) {
                proxiedObjects[selectedObject].m = parseInt(e.target.value);
            }
        );
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
        /*
        controls.objectsList.addEventListener(
            "click",
            function(e) {
                console.log(e.currentTarget);
                console.log(e.target);
                const index = e.currentTarget.index;
                selectedObject = index;
            }
        );
        */
        let t = Date.now();
        const state = {
            selectedObject,
            keysDown,
            t,
            ship: shipProxy,
            objects: proxiedObjects,
        };
        window.requestAnimationFrame(
            function() {
                _this.loop(state);
            }
        );
    };

    this.loop = function (state) {
        const { keysDown, t, ship, objects } = state;
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
        //
        //const h_ = h / 10;
        if (!paused) {
            //for (let i_h = 0; i_h < 10; i_h++) {
                this.simulate(state, h);
            //}
            controls.massInput.value = ship.m;
        }
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
