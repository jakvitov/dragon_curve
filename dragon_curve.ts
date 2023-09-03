let drawing : boolean = false;
let drawingStart : Coord = {x : null, y : null};

interface Coord {
    x : number;
    y : number;
}
const drawLine = (from : Coord, to : Coord, ctx : any) : void => {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
}

//Clear the canvas
const clearCanvas = (context : any) => {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

//Given a line from a |---| b, split the line in half and create both hypotenuses of it by creating point C
const splitLine = (a : Coord, b : Coord, context : any) : void => {
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

    drawLine(c, a, context);
    drawLine(c, b, context);

}

const start = () : void => {

    //splitLine({x: 300, y : 300}, {x: 400, y : 400}, context)

}

let canvas : any = document.getElementById("drawBoard");
const context : any= canvas.getContext("2d");

//Register client first click and start drawing line from there
canvas.addEventListener("click", (ev) => {

    if (drawing) {
        let x : number = ev.clientX - canvas.getBoundingClientRect().left;
        let y : number = ev.clientY - canvas.getBoundingClientRect().top;
        clearCanvas(context);
        drawLine(drawingStart, {x : x, y : y}, context);
        drawing = false;
        return;
    }

    //Get coordinates of client click and set it as a drawing start
    drawingStart.x = ev.clientX - canvas.getBoundingClientRect().left;
    drawingStart.y = ev.clientY - canvas.getBoundingClientRect().top;
    drawing = true;
})

canvas.addEventListener("mousemove", (ev) => {
    if (!drawing){
        return;
    }
    let x : number = ev.clientX - canvas.getBoundingClientRect().left;
    let y : number = ev.clientY - canvas.getBoundingClientRect().top;
    clearCanvas(context);
    drawLine(drawingStart, {x : x, y : y}, context);
})