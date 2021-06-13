function GravityBitch(x, y, v_x, v_y, m) {
    this.pos = {
        x: x,
        y: y,
    };
    this.vel = {
        x: v_x,
        y: v_y,
    };
    this.acc = {
        x: 0,
        y: 0,
    };
    this.m = m;
}

function Ship(x, y, m, r, i) {
    this.pos.x = x;
    this.pos.y = y;
    this.vel.x = 0;
    this.vel.y = 0;
    this.m = m;
    this.rot = r;
    this.thrust = false;
    this.impulse = i;
}

const shipProto = new GravityBitch();
shipProto.rot = 0;
shipProto.thrust = false;
shipProto.impulse = 0;
Ship.prototype = shipProto;

(function() {
    const canvas = document.getElementById("game");
    const instructions = document.getElementById("instructions");
    canvas.height = window.innerHeight - instructions.getClientRects()[0].height * 2;
    canvas.width = window.innerWidth ;
    canvas.style = "background: white;";
    const context = canvas.getContext("2d");

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

    const G = 6.674 * Math.pow(10, -11);

    const ship = new Ship(50, 100, 1000, 0, 16);

    const objects = [
        ship,
        new GravityBitch(748, 442, 19, 62, 1000),
        new GravityBitch(875, 688, -50, -11, Math.pow(10, 14)),
        new GravityBitch(canvas.width / 2, canvas.height / 2, 0, 0, Math.pow(10, 16)),
    ];

    const second = 1000; // ms
    let t = Date.now();

    function loop() {
        const now = Date.now();
        const h = (now - t) / second;

        // update ship rotation
        if (keysDown["d"]) {
            ship.rot += 0.1;
        }
        if (keysDown["a"]) {
            ship.rot -= 0.1;
        }
        // ship under thrust?
        ship.thrust = keysDown["w"];

        for (let o = 0; o < objects.length; o++) {
            simulate(objects[o], h);
        }
        render();
        t = now;
        window.requestAnimationFrame(loop);
    }

    function simulate(o, h) {
        // add up forces subjected by other objects
        o.acc.x = 0;
        o.acc.y = 0;
        for (let i_o = 0; i_o < objects.length; i_o++) {
            const o_ = objects[i_o];
            if (o != o_) {
                const dir_o_ = [o_.pos.x - o.pos.x, o_.pos.y - o.pos.y];
                const [x_o_, y_o_] = unit(dir_o_);
                const norm_o_ = norm(dir_o_);
                const f = G * (o.m * o_.m) / Math.pow(norm_o_, 2);
                const a = f / o.m;
                o.acc.x += x_o_ * a;
                o.acc.y += y_o_ * a;
            }
        }
        if (o.thrust) {
            const dir_rot = [
                Math.cos(o.rot),
                Math.sin(o.rot),
            ];
            const [x_r, y_r] = unit(dir_rot);
            o.acc.x += x_r * o.impulse;
            o.acc.y += y_r * o.impulse;
        }
        o.vel.x += h * o.acc.x;
        o.vel.y += h * o.acc.y;
        o.pos.x += h * o.vel.x;
        o.pos.y += h * o.vel.y;
    }

    function render() {
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
            context.ellipse(o.pos.x, o.pos.y, r, r, 0, 0, 2 * Math.PI);
            context.stroke();
            // acceleration vector indicator
            const dir_gw = [o.acc.x, o.acc.y];
            const size_acc = norm([o.acc.x, o.acc.y]);
            const [x_, y_] = unit(dir_gw);
            context.beginPath();
            context.strokeStyle = "red";
            context.moveTo(o.pos.x + x_ * 5, o.pos.y + y_ * 5);
            context.lineTo((o.pos.x + x_ * size_acc), (o.pos.y + y_ * size_acc));
            context.stroke();
            // ship rotation indicator
            if (o instanceof Ship) {
                const dir_rot = [
                    Math.cos(o.rot),
                    Math.sin(o.rot)
                ];
                const [x_r, y_r] = unit(dir_rot);
                context.beginPath();
                context.strokeStyle = "green";
                context.moveTo(o.pos.x + x_r * 5, o.pos.y + y_r * 5);
                context.lineTo((o.pos.x + x_r * 20), (o.pos.y + y_r * 20));
                context.stroke();
            }
        }
    }

    window.requestAnimationFrame(loop);

    // compute unit vector
    function unit(arr) {
        const n = norm(arr);
        const unit = arr.map(
            function(e) {
                return e / n;
            }
        );
        return unit;
    }

    function norm(arr) {
        const sqrSum = arr.reduce(
            function(a, c) {
                return Math.pow(c, 2) + a;
            },
            0
        );
        const n = Math.sqrt(sqrSum);
        return n;
    }
})();
