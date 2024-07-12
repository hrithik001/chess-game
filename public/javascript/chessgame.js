const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;


const renderBoard = () => {

    const board = chess.board();
    
    boardElement.innerHTML = "";
    board.forEach((row , rowIndex ) => {
        row.forEach((square , squareIndex) => {
            const squareElement = document.createElement("div");
            squareElement.classList.add("square",(rowIndex+squareIndex) % 2 === 0 ? "light" : "dark");

            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = squareIndex;
            console.log(square);
            if(square){
                const pieceElement = document.createElement("div");
                pieceElement.classList.add("piece",square.color === 'w' ? "white" : "black");
                pieceElement.innerText = getPieceUniCode(square)
                pieceElement.draggable = playerRole === square.color;

                pieceElement.addEventListener("dragstart", (e) =>
                {
                    console.log("dragestart");
                    if(pieceElement.draggable)
                    {
                        draggedPiece = pieceElement;
                        sourceSquare = {
                            row: rowIndex,
                            col: squareIndex
                        };
                        // e.dataTransfer.setData("text/plain","");
                        console.log(e)


                    }

                })

                pieceElement.addEventListener("dragend",(e) => {
                      console.log("drag end");
                    draggedPiece = null;
                    sourceSquare = null;
                })

                squareElement.appendChild(pieceElement); 
            }

            squareElement.addEventListener("dragover",(e) => {
                  console.log("drag over");
                e.preventDefault();
            });

            squareElement.addEventListener("drop",(e) =>  {
                e.preventDefault();
                console.log("dropped here")
                if(draggedPiece){
                    const targetSquare = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col)
                    };

                    handelMove(sourceSquare,targetSquare);

                }
            })

           
            boardElement.appendChild(squareElement);
        })
    });

    if(playerRole === 'b')
    {
        boardElement.classList.add("flipped");
    }
    else{
        boardElement.classList.remove("flipped");
    }

    

}


const handelMove = (source,destination) => {
    const move = {
        from: `${String.fromCharCode(97+source.col)}${8-source.row}`,
        to: `${String.fromCharCode(97+destination.col)}${8-destination.row}`,
        promotion: "q"

    };

    socket.emit("move",move);

};

const getPieceUniCode = (piece) => {
    const unicodePiece = {
        p: '♙',
        r: '♖',
        n: '♘',
        b: '♗',
        q: '♕',
        k: '♔'

    }

    return unicodePiece[piece.type] || ""
};


socket.on("playerRole",(role) => {
    playerRole = role;
    renderBoard();
});

socket.on("spectorRole",() => {
    playerRole = null;
    renderBoard();
});

socket.on("boardState",(fen) => {
    chess.load(fen);
    renderBoard();
});

socket.on("move",(move) => {

    console.log("inside move")
    chess.move(move);
    renderBoard();
});



renderBoard();