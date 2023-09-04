let drawing = false;
let started = false;
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
        this.lines = new Set;
    }
    //Our default line is erasable, therefore we keep them stored in our set
    drawLine(start, end) {
        const line = new Line(start, end, null);
        this.lines.add(line.serializeLine());
        this.context.beginPath();
        this.context.moveTo(line.start.x, line.start.y);
        this.context.lineTo(line.end.x, line.end.y);
        this.context.stroke();
    }
    //Draw a line, that is not persisted in any lines cache and cannot be erased
    //Ideal for in-animation strings, that get erased by clear and never redrawn again
    drawNonPersistedLine(start, end) {
        const line = new Line(start, end, null);
        this.context.beginPath();
        this.context.moveTo(line.start.x, line.start.y);
        this.context.lineTo(line.end.x, line.end.y);
        this.context.stroke();
    }
    //Clear the canvas
    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    //We cannot delte line on html canvas right away
    //We need to redraw the picture without it
    removeLine(start, end) {
        const inputLine = new Line(start, end, null);
        const serializedLine = inputLine.serializeLine();
        if (this.lines.has(serializedLine)) {
            this.lines.delete(serializedLine);
            console.log("Deleted: " + serializedLine);
            this.clear();
            this.lines.forEach((line) => {
                const deseralizedLine = new Line(null, null, line);
                console.log("Drawing : " + line);
                this.drawLine(deseralizedLine.getStart(), deseralizedLine.getEnd());
            });
        }
    }
    getCanvas() {
        return this.canvas;
    }
    getContext() {
        return this.context();
    }
    clearMemory() {
        this.lines = new Set;
    }
}
//Given a line from a |---| b, split the line in half and create both hypotenuses of it by creating point C
const splitLine = (a, b, iterNum, iterMax) => {
    if (iterNum >= iterMax) {
        started = false;
        return;
    }
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
        drawContext.removeLine(a, b);
        drawContext.drawLine(c, a);
        drawContext.drawLine(c, b);
        splitLine(c, a, iterNum + 1, iterMax);
        splitLine(c, b, iterNum + 1, iterMax);
    }, 1000);
};
const start = (start, end) => {
    //Noone can draw, while we render
    started = true;
    //We delete previous pricture from the cache
    drawContext.clearMemory();
    //We can parse this, since the input is of type number. Worst case we parse float to integer
    const iterations = parseInt(document.getElementById("iterationsInput").value);
    console.log(iterations);
    splitLine(start, end, 0, iterations);
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
        drawContext.drawLine(drawingStart, { x: x, y: y });
        start(drawingStart, { x: x, y: y });
        drawing = false;
        return;
    }
    //Get coordinates of client click and set it as a drawing start
    drawingStart.x = ev.clientX - drawContext.getCanvas().getBoundingClientRect().left;
    drawingStart.y = ev.clientY - drawContext.getCanvas().getBoundingClientRect().top;
    document.getElementById("startCoord").innerText = Math.floor(drawingStart.x) + ", " + Math.floor(drawingStart.y);
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
    drawContext.drawNonPersistedLine(drawingStart, { x: x, y: y });
    document.getElementById("endCoord").innerText = Math.floor(x) + ", " + Math.floor(y);
});
