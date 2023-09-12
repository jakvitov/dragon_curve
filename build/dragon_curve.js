let drawing = false;
let started = false;
let nthIter = 0;
//We get the current state of draw past generation checkbox on page load
let drawPastGen = document.getElementById("pastGenCheckbox").checked;
let drawingStart = { x: null, y: null };
class Line {
    constructor(start, end, strLine) {
        if (strLine !== null) {
            this.deserialize(strLine);
            return;
        }
        this.start = start;
        this.end = end;
    }
    deserialize(strLine) {
        const parsed = strLine.split("|");
        this.start = this.deserializeCoord(parsed[0]);
        this.end = this.deserializeCoord(parsed[1]);
    }
    serializeCoord(coord) {
        return Math.trunc(coord.x) + "_" + Math.trunc(coord.y);
    }
    deserializeCoord(strCoord) {
        const parsed = strCoord.split("_");
        return { x: parseInt(parsed[0]), y: parseInt(parsed[1]) };
    }
    //Format x_y|a_b
    serializeLine() {
        return this.serializeCoord(this.start) + "|" + this.serializeCoord(this.end);
    }
    getStart() {
        return this.start;
    }
    getEnd() {
        return this.end;
    }
}
class DrawConext {
    constructor(boardId) {
        this.canvas = document.getElementById("drawBoard");
        this.context = this.canvas.getContext("2d");
        this.lines = new Set();
    }
    //Our default line is erasable, therefore we keep them stored in our set
    drawLine(start, end) {
        const line = new Line(start, end, null);
        this.context.beginPath();
        this.context.moveTo(line.start.x, line.start.y);
        this.context.lineTo(line.end.x, line.end.y);
        this.context.stroke();
    }
    //Draw a line, that is not persisted in any lines cache and cannot be erased
    //Ideal for in-animation strings, that get erased by clear and never redrawn again
    drawNonBufferedLine(start, end) {
        const line = new Line(start, end, null);
        this.context.beginPath();
        this.context.moveTo(line.start.x, line.start.y);
        this.context.lineTo(line.end.x, line.end.y);
        this.context.stroke();
    }
    //We add a line in the context map, but we do not draw it
    //This allows us to optimalise the code for rendering only after the whole image was drawn
    bufferLine(start, end) {
        const line = new Line(start, end, null);
        this.lines.add(line.serializeLine());
    }
    //Draws all lines prepared in a buffer
    drawBuffer() {
        console.log("Drawing with " + nthIter + " lines");
        this.clear();
        this.lines.forEach((line) => {
            const deseralizedLine = new Line(null, null, line);
            this.drawLine(deseralizedLine.getStart(), deseralizedLine.getEnd());
        });
    }
    clearBuffer() {
        this.lines.clear();
    }
    //Clear the canvas
    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    getCanvas() {
        return this.canvas;
    }
    getContext() {
        return this.context();
    }
}
//Given a line from a |---| b, split the line in half and create both hypotenuses of it by creating point C
const splitLine = (a, b, generation, iterMax) => {
    nthIter++;
    if (generation > iterMax) {
        started = false;
        return;
    }
    console.log(nthIter);
    //Middle of the line
    const middle = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    //Relative coordinates of A in coord system, where middle point is the beginning of a cartesian coord system.
    const relativeA = ({ x: a.x - middle.x, y: a.y - middle.y });
    //Rotate A around S by Pi degrees -> relativeC
    //We use standard rotation matrices with precalculated sines and cosines of the used angles (Pi/2)
    const relativeC = { x: -relativeA.y, y: relativeA.x };
    //Transform the relativeC to normal coordinates
    const c = { x: relativeC.x + middle.x, y: relativeC.y + middle.y };
    setTimeout(() => {
        //Check if this line is the last of the iteration -> then we draw the buffer 
        if (nthIter === (Math.pow(2, generation) - 1)) {
            drawContext.drawBuffer();
            //If the past gen erase option is not chosen -> we clear the buffer with this gen.
            if (!drawPastGen) {
                drawContext.clearBuffer();
            }
        }
        //We buffer both of the next gen lines to be drawn after the last lines are computed
        drawContext.bufferLine(c, a);
        drawContext.bufferLine(c, b);
        splitLine(c, a, generation + 1, iterMax);
        splitLine(c, b, generation + 1, iterMax);
    }, 1000);
};
const start = (start, end) => {
    //Noone can draw, while we render
    started = true;
    //We can parse this, since the input is of type number. Worst case we parse float to integer
    const maxGeneration = parseInt(document.getElementById("iterationsInput").value);
    nthIter = 0;
    splitLine(start, end, 1, maxGeneration);
};
let drawContext = new DrawConext("drawBoard");
//Register client first click and start drawing line from there
drawContext.getCanvas().addEventListener("click", (ev) => {
    //We are already drawing, we do not want anyone to draw now
    if (started) {
        return;
    }
    if (drawing) {
        let x = ev.clientX - drawContext.getCanvas().getBoundingClientRect().left;
        let y = ev.clientY - drawContext.getCanvas().getBoundingClientRect().top;
        drawContext.clear();
        drawContext.clearBuffer();
        drawContext.bufferLine(drawingStart, { x: x, y: y });
        start(drawingStart, { x: x, y: y });
        drawing = false;
        return;
    }
    //Get coordinates of client click and set it as a drawing start
    drawingStart.x = ev.clientX - drawContext.getCanvas().getBoundingClientRect().left;
    drawingStart.y = ev.clientY - drawContext.getCanvas().getBoundingClientRect().top;
    drawing = true;
});
//When the user is drawing - track the position of the mouse and draw line to it
drawContext.getCanvas().addEventListener("mousemove", (ev) => {
    if (!drawing) {
        return;
    }
    let x = ev.clientX - drawContext.getCanvas().getBoundingClientRect().left;
    let y = ev.clientY - drawContext.getCanvas().getBoundingClientRect().top;
    drawContext.clear();
    drawContext.drawNonBufferedLine(drawingStart, { x: x, y: y });
});
//Draw past gen checkbox is checked/unchecked
document.getElementById("pastGenCheckbox").addEventListener("click", () => {
    drawPastGen = document.getElementById("pastGenCheckbox").checked;
});
