const express = require('express');
const socket = require('socket.io');
const http = require('http');
const {Chess}  = require("chess.js")
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socket(server);


const chess = new Chess(); // complete chess functionality

let players = {};
let currentPlayer = 'W';


app.set("view engine" , "ejs");
app.use(express.static(path.join(__dirname , "public")));

app.get("/",(req,res) => {
    res.render("index",{title: "Chess Game"});
});

io.on( "connection" , (clientSocket) => {
    console.log("connected");
    
    // initalizing role to person

    if(!players.white){
        players.white = clientSocket.id;
        clientSocket.emit("playerRole" , "w");
    }else if(!players.black){
        players.black = clientSocket.id;
        clientSocket.emit("playerRole" , "b");
    }else{
        clientSocket.emit("spectorRole");
    }
    // on disconnect

    clientSocket.on("disconnect" , () =>
    {
        if(clientSocket.id === players.white){
            delete players.white;
        }else if(clientSocket.id === players.black){
            delete players.black;
        }
    })

    // move of pieces

    clientSocket.on("move" , (move) =>{
        try{
            if(chess.turn() == 'w' && clientSocket.id !== players.white) return ;
            if(chess.turn() == 'b' && clientSocket.id !== players.black) return ;

            const result = chess.move(move);

            if(result){
                currentPlayer = chess.turn();
                io.emit("move" , move);
                io.emit("boardState",chess.fen()) // return the current state of board
            }
            else{
                console.log("Invalid move" ,move);
                clientSocket.emit("invalidMove: " , move); 

            }
            

        }
        catch(err){
           console.log(err);
           clientSocket.emit("Invalid Move: ", move);
        }
    })
})

server.listen(3000 , () =>
{
    console.log("Server is running on port 3000");
})





