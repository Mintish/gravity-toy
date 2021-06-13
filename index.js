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

    const ship = {
        pos: {
            x: 100, // m
            y: 100, // m
        },
        vel: {
            x: 0, // m/s
            y: 0, // m/s
        },
        acc: {
            x: 0,
            y: 0,
        },
        rot: Math.PI / 2,
        thrust: false,
        impulse: 16,
    };

    const objects = [
        ship,
    ];

    const gw = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        g: 9.81,
    };

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

        simulate(h);
        render();
        t = now;
        window.requestAnimationFrame(loop);
    }

    function simulate(h) {
        const [x_gw, y_gw] = unit([gw.x - ship.pos.x, gw.y - ship.pos.y]);
        ship.acc.x = x_gw * gw.g;
        ship.acc.y = y_gw * gw.g;
        if (ship.thrust) {
            const dir_rot = [
                Math.cos(ship.rot),
                Math.sin(ship.rot),
            ];
            const [x_r, y_r] = unit(dir_rot);
            ship.acc.x += x_r * ship.impulse;
            ship.acc.y += y_r * ship.impulse;
        }
        ship.vel.x += h * ship.acc.x;
        ship.vel.y += h * ship.acc.y;
        ship.pos.x += h * ship.vel.x;
        ship.pos.y += h * ship.vel.y;
    }

    function render() {
        //     console.log(`${(t - start) / second}\t${ship.pos.x}\t${ship.pos.y}`)

        // blank screen
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "black";

        // ship
        context.beginPath();
        context.strokeStyle = "black";
        context.ellipse(ship.pos.x, ship.pos.y, 3, 3, 0, 0, 2 * Math.PI);
        context.stroke();

        // planet
        context.beginPath();
        context.ellipse(gw.x, gw.y, 20, 20, 0, 0, 2 * Math.PI);
        context.stroke();

        // acceleration vector indicator
        const dir_gw = [ship.acc.x, ship.acc.y];
        const size_acc = norm([ship.acc.x, ship.acc.y]);
        const [x_, y_] = unit(dir_gw);
        context.beginPath();
        context.strokeStyle = "red";
        context.moveTo(ship.pos.x + x_ * 5, ship.pos.y + y_ * 5);
        context.lineTo((ship.pos.x + x_ * size_acc), (ship.pos.y + y_ * size_acc));
        context.stroke();

        // ship rotation indicator
        const dir_rot = [
            Math.cos(ship.rot),
            Math.sin(ship.rot)
        ];
        const [x_r, y_r] = unit(dir_rot);
        context.beginPath();
        context.strokeStyle = "green";
        context.moveTo(ship.pos.x + x_r * 5, ship.pos.y + y_r * 5);
        context.lineTo((ship.pos.x + x_r * 20), (ship.pos.y + y_r * 20));
        context.stroke();
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
