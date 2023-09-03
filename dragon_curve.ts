

const prepareCanvas = () => {
    const canvas : any= document.getElementById("drawBoard");
    const ctx : any= canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.beginPath();
    ctx.moveTo(300, 300);
    ctx.lineTo(400, 400);
    ctx.stroke();

    return ctx;
}

const start = () => {
    prepareCanvas();
}

document.getElementById("drawButton").addEventListener("click", start);