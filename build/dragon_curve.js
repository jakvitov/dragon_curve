var prepareCanvas = function () {
    var canvas = document.getElementById("drawBoard");
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(300, 300);
    ctx.lineTo(400, 400);
    ctx.stroke();
    return ctx;
};
var start = function () {
    prepareCanvas();
};
document.getElementById("drawButton").addEventListener("click", start);
