let drawing : boolean = false;
let started : boolean = false;

let drawingStart : Coord = {x : null, y : null};
let canvas : any = document.getElementById("drawBoard");
const context : any= canvas.getContext("2d");

class Line {

    start : Coord;
    end : Coord;

    constructor(start : Coord, end : Coord){
        this.start = start;
        this.end = end;
    }

    serializeCoord(coord : Coord){
        return coord.x + "_" + coord.y;
    }

    deserializeCoord(strCoord : string){
        const parsed : string[] = strCoord.split("_");
        return {x : parseInt(parsed[0]), y : parseInt(parsed[1])};
    }

    serializeStart() : string {
        return this.serializeCoord(this.start);
    }

    serializeEnd() : string {
        return this.serializeCoord(this.end);
    }

    deserializeStart(start : string) : Coord {
        return this.deserializeCoord(start);
    }

    deserializeEnd(end : string) : Coord {
        return this.deserializeCoord(end);
    }

}

class DrawConext {
    
    canvas : any;
    context : any;
    
    //For (O1) fast searches in set => we use search by value based on string value of lines
    //If there was fast search by value in sets in TS we would have Set<Line> or 
    lines : Set<string>;

    constructor(boardId : string){

    }

}



interface Coord {
    x : number;
    y : number;
}

const drawLine = (from : Coord, to : Coord) : void => {
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
}

//Clear the canvas
const clearCanvas = (context : any) => {
    context.clearRect(0, 0, canvas.width, canvas.height);
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

    console.log(c);

    setTimeout(() => {
        drawLine(c, a);
        drawLine(c, b);
        
        splitLine(c, a, iterNum + 1, iterMax);
        splitLine(c, b, iterNum + 1, iterMax);
    }, 1000)

}

const start = (start : Coord, end : Coord) : void => {

    //Noone can draw, while we render
    started = true;

    //We can parse this, since the input is of type number. Worst case we parse float to integer
    const iterations : number = parseInt((document.getElementById("iterationsInput") as HTMLInputElement).value);
    console.log(iterations)


    splitLine(start, end, 0, iterations);
}



//Register client first click and start drawing line from there
canvas.addEventListener("click", (ev) => {

    //We are already drawing, we do not want anyone to draw now
    if (started){
        return;
    }

    if (drawing) {
        let x : number = ev.clientX - canvas.getBoundingClientRect().left;
        let y : number = ev.clientY - canvas.getBoundingClientRect().top;
        clearCanvas(context);
        drawLine(drawingStart, {x : x, y : y});
        start(drawingStart, {x : x, y : y})
        drawing = false;
        return;
    }

    //Get coordinates of client click and set it as a drawing start
    drawingStart.x = ev.clientX - canvas.getBoundingClientRect().left;
    drawingStart.y = ev.clientY - canvas.getBoundingClientRect().top;
    document.getElementById("startCoord").innerText = Math.floor(drawingStart.x) + ", " + Math.floor(drawingStart.y);
    drawing = true;
})

//When the user is drawing - track the position of the mouse and draw line to it
canvas.addEventListener("mousemove", (ev) => {
    if (!drawing){
        return;
    }
    let x : number = ev.clientX - canvas.getBoundingClientRect().left;
    let y : number = ev.clientY - canvas.getBoundingClientRect().top;
    clearCanvas(context);
    drawLine(drawingStart, {x : x, y : y});
    document.getElementById("endCoord").innerText = Math.floor(x) + ", " + Math.floor(y);
})