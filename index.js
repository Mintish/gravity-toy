import Game from "./game.js";

const canvas = document.getElementById("game");
const controls = {
    startButton: document.getElementById("start-button"),
    stopButton: document.getElementById("stop-button"),
    position: {
        xInput: document.getElementById("position-x-input"),
        yInput: document.getElementById("position-y-input"),
    },
    velocity: {
        xInput: document.getElementById("velocity-x-input"),
        yInput: document.getElementById("velocity-y-input"),
    },
    massInput: document.getElementById("mass-input"),
};
const game = new Game(canvas, controls);
game.initialize();
