var drawing = false;
var drawingStart = { x: null, y: null };
var canvas = document.getElementById("drawBoard");
var context = canvas.getContext("2d");
var drawLine = function (from, to) {
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
};
//Clear the canvas
var clearCanvas = function (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
};
//Given a line from a |---| b, split the line in half and create both hypotenuses of it by creating point C
var splitLine = function (a, b, iterNum, iterMax) {
    if (iterNum >= iterMax) {
        return;
    }
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
    setTimeout(function () {
        drawLine(c, a);
        drawLine(c, b);
        splitLine(c, a, iterNum + 1, iterMax);
        splitLine(c, b, iterNum + 1, iterMax);
    }, 1000);
};
var start = function (start, end) {
    //We can parse this, since the input is of type number. Worst case we parse float to integer
    var iterations = parseInt(document.getElementById("iterationsInput").value);
    console.log(iterations);
    splitLine(start, end, 0, iterations);
};
//Register client first click and start drawing line from there
canvas.addEventListener("click", function (ev) {
    if (drawing) {
        var x = ev.clientX - canvas.getBoundingClientRect().left;
        var y = ev.clientY - canvas.getBoundingClientRect().top;
        clearCanvas(context);
        drawLine(drawingStart, { x: x, y: y });
        start(drawingStart, { x: x, y: y });
        drawing = false;
        return;
    }
    //Get coordinates of client click and set it as a drawing start
    drawingStart.x = ev.clientX - canvas.getBoundingClientRect().left;
    drawingStart.y = ev.clientY - canvas.getBoundingClientRect().top;
    document.getElementById("startCoord").innerText = Math.floor(drawingStart.x) + ", " + Math.floor(drawingStart.y);
    drawing = true;
});
//When the user is drawing - track the position of the mouse and draw line to it
canvas.addEventListener("mousemove", function (ev) {
    if (!drawing) {
        return;
    }
    var x = ev.clientX - canvas.getBoundingClientRect().left;
    var y = ev.clientY - canvas.getBoundingClientRect().top;
    clearCanvas(context);
    drawLine(drawingStart, { x: x, y: y });
    document.getElementById("endCoord").innerText = Math.floor(x) + ", " + Math.floor(y);
});
