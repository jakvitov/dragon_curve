let drawing : boolean = false;
let started : boolean = false;
//We get the current state of draw past generation checkbox on page load
let drawPastGen : boolean = (document.getElementById("pastGenCheckbox") as HTMLInputElement).value === "on";


let drawingStart : Coord = {x : null, y : null};


interface Coord {
    x : number;
    y : number;
}


class Line {

    start : Coord;
    end : Coord;

    constructor(start : Coord, end : Coord, strLine : string){
        if (strLine !== null){
            this.deserialize(strLine);
            return;
        }
        this.start = start;
        this.end = end;
    }

    deserialize(strLine : string){
        const parsed : string[] = strLine.split("|");
        this.start = this.deserializeCoord(parsed[0]);
        this.end = this.deserializeCoord(parsed[1]);
    }

    serializeCoord(coord : Coord) : string{
        return Math.trunc(coord.x) + "_" + Math.trunc(coord.y);
    }

    deserializeCoord(strCoord : string) : Coord{
        const parsed : string[] = strCoord.split("_");
        return {x : parseInt(parsed[0]), y : parseInt(parsed[1])};
    }

    //Format x_y|a_b
    serializeLine() : string{
        return this.serializeCoord(this.start) + "|" + this.serializeCoord(this.end);
    }

    getStart() : Coord {
        return this.start; 
    }

    getEnd() : Coord {
        return this.end;
    }

}

class DrawConext {
    
    canvas : any;
    context : any;
    
    //For (O1) fast searches in set => we use search by value based on string value of lines
    //If there was fast search by value in sets in TS we would have Set<Line> or 
    lines : Set<string>;

    constructor(boardId : string){
        this.canvas = document.getElementById("drawBoard");
        this.context = this.canvas.getContext("2d");
        this.lines = new Set<string>;
    }

    //Our default line is erasable, therefore we keep them stored in our set
    drawLine(start : Coord, end : Coord){
        const line : Line = new Line(start, end, null);
        this.lines.add(line.serializeLine());

        this.context.beginPath();
        this.context.moveTo(line.start.x, line.start.y);
        this.context.lineTo(line.end.x, line.end.y);
        this.context.stroke();
    }

    //Draw a line, that is not persisted in any lines cache and cannot be erased
    //Ideal for in-animation strings, that get erased by clear and never redrawn again
    drawNonPersistedLine(start : Coord, end : Coord){
        const line : Line = new Line(start, end, null);

        this.context.beginPath();
        this.context.moveTo(line.start.x, line.start.y);
        this.context.lineTo(line.end.x, line.end.y);
        this.context.stroke();
    }

    //Clear the canvas
    clear(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    //We cannot delte line on html canvas right away
    //We need to redraw the picture without it
    removeLine(start : Coord, end : Coord){
        const inputLine : Line = new Line(start, end, null);
        const serializedLine : string = inputLine.serializeLine();
        if (this.lines.has(serializedLine)){
            this.lines.delete(serializedLine);
            console.log("Deleted: " + serializedLine);
            this.clear();
            this.lines.forEach((line) => {
                const deseralizedLine : Line = new Line (null, null, line);
                console.log("Drawing : " + line);
                this.drawLine(deseralizedLine.getStart(), deseralizedLine.getEnd());
            })
        }
    }

    getCanvas() : any {
        return this.canvas;
    }

    getContext() : any {
        return this.context()
    }

    clearMemory() : void {
        this.lines = new Set<string>;
    }

}


//Given a line from a |---| b, split the line in half and create both hypotenuses of it by creating point C
const splitLine = (a : Coord, b : Coord, iterNum : number, iterMax : number) : void => {

    if (iterNum >= iterMax){
        started = false;
        return;
    }

    //Middle of the line
    const middle : Coord = {x : (a.x + b.x)/2, y : (a.y + b.y)/2};

    //Relative coordinates of A in coord system, where middle point is the beginning of a cartesian coord system.
    const relativeA : Coord = ({x : a.x - middle.x, y : a.y - middle.y});

    //Rotate A around S by Pi degrees -> relativeC
    //We use standard rotation matrices with precalculated sines and cosines of the used angles (Pi/2)
    const relativeC : Coord = {x : -relativeA.y, y :  relativeA.x};

    //Transform the relativeC to normal coordinates
    const c : Coord = {x : relativeC.x + middle.x, y : relativeC.y + middle.y};

    setTimeout(() => {
        if (!drawPastGen){
            drawContext.removeLine(a, b);
        }
        drawContext.drawLine(c, a);
        drawContext.drawLine(c, b);
        
        splitLine(c, a, iterNum + 1, iterMax);
        splitLine(c, b, iterNum + 1, iterMax);
    }, 1000)

}

const start = (start : Coord, end : Coord) : void => {

    //Noone can draw, while we render
    started = true;
    //We delete previous pricture from the cache
    drawContext.clearMemory();

    //We can parse this, since the input is of type number. Worst case we parse float to integer
    const iterations : number = parseInt((document.getElementById("iterationsInput") as HTMLInputElement).value);
    console.log(iterations)


    splitLine(start, end, 0, iterations);
}

let drawContext = new DrawConext("drawBoard");


//Register client first click and start drawing line from there
drawContext.getCanvas().addEventListener("click", (ev) => {

    //We are already drawing, we do not want anyone to draw now
    if (started){
        return;
    }

    if (drawing) {
        let x : number = ev.clientX - drawContext.getCanvas().getBoundingClientRect().left;
        let y : number = ev.clientY - drawContext.getCanvas().getBoundingClientRect().top;
        drawContext.clear();
        drawContext.drawLine(drawingStart, {x : x, y : y});
        start(drawingStart, {x : x, y : y})
        drawing = false;
        return;
    }

    //Get coordinates of client click and set it as a drawing start
    drawingStart.x = ev.clientX - drawContext.getCanvas().getBoundingClientRect().left;
    drawingStart.y = ev.clientY - drawContext.getCanvas().getBoundingClientRect().top;
    document.getElementById("startCoord").innerText = Math.floor(drawingStart.x) + ", " + Math.floor(drawingStart.y);
    drawing = true;
})

//When the user is drawing - track the position of the mouse and draw line to it
drawContext.getCanvas().addEventListener("mousemove", (ev) => {
    if (!drawing){
        return;
    }
    let x : number = ev.clientX - drawContext.getCanvas().getBoundingClientRect().left;
    let y : number = ev.clientY - drawContext.getCanvas().getBoundingClientRect().top;
    drawContext.clear();
    drawContext.drawNonPersistedLine(drawingStart, {x : x, y : y});
    document.getElementById("endCoord").innerText = Math.floor(x) + ", " + Math.floor(y);
})


//Draw past gen checkbox is checked/unchecked
document.getElementById("pastGenCheckbox").addEventListener("click", () => {
    drawPastGen = !drawPastGen;
})