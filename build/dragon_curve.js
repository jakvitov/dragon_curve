var drawing = false;
var drawingStart = { x: null, y: null };
var drawLine = function (from, to, ctx) {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
};
//Clear the canvas
var clearCanvas = function (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
};
//Given a line from a |---| b, split the line in half and create both hypotenuses of it by creating point C
var splitLine = function (a, b, context) {
    //Middle of the line
    var middle = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    //Relative coordinates of A in coord system, where middle point is the beginning of a cartesian coord system.
    var relativeA = ({ x: a.x - middle.x, y: a.y - middle.y });
    //Rotate A around S by Pi degrees -> relativeC
    //We use standard rotation matrices with precalculated sines and cosines of the used angles (Pi/2)
    var relativeC = { x: -relativeA.y, y: relativeA.x };
    //Transform the relativeC to normal coordinates
    var c = { x: relativeC.x + middle.x, y: relativeC.y + middle.y };
    console.log(c);
    drawLine(c, a, context);
    drawLine(c, b, context);
};
var start = function () {
    //splitLine({x: 300, y : 300}, {x: 400, y : 400}, context)
};
var canvas = document.getElementById("drawBoard");
var context = canvas.getContext("2d");
//Register client first click and start drawing line from there
canvas.addEventListener("click", function (ev) {
    if (drawing) {
        var x = ev.clientX - canvas.getBoundingClientRect().left;
        var y = ev.clientY - canvas.getBoundingClientRect().top;
        clearCanvas(context);
        drawLine(drawingStart, { x: x, y: y }, context);
        drawing = false;
        return;
    }
    //Get coordinates of client click and set it as a drawing start
    drawingStart.x = ev.clientX - canvas.getBoundingClientRect().left;
    drawingStart.y = ev.clientY - canvas.getBoundingClientRect().top;
    drawing = true;
});
canvas.addEventListener("mousemove", function (ev) {
    if (!drawing) {
        return;
    }
    var x = ev.clientX - canvas.getBoundingClientRect().left;
    var y = ev.clientY - canvas.getBoundingClientRect().top;
    clearCanvas(context);
    drawLine(drawingStart, { x: x, y: y }, context);
});
