const io=require('socket.io')();
const { initGame,gameLoop,getUpdateVelocity} =require('./game');
const { FRAME_RATE }=require('./constants');
const {makeId } =require('./utils');

const state={};
const clientRooms={};
io.on('connection',client=>{
    client.on('keydown',handleKeydown);
    client.on('newGame',handleNewGame);
    client.on('joinGame',handleJoinGame);
    function handleJoinGame(gameCode)
    {  console.log(gameCode,'gameCode');
        const room=io.sockets.adapter.rooms[gameCode];
        console.log(room,'room')
        let allUsers;
        if(room)
        allUsers=room.sockets;
        console.log(allUsers,'allUsers')
        let numClients=0;
        if(allUsers)
        {

            numClients=Object.keys(allUsers).length;
            console.log(numClients,'hello world')
        }
        if(numClients === 0)
        {
            client.emit('unknownCode');
            return;
        } else if(numClients>1)
        {
            client.emit('tooManyPlayers');
            return;
        }
        clientRooms[client.id]=gameCode;
        client.join(gameCode);
        client.number=2;
        client.emit('init',2);
       startGameInterval(gameCode);

    }
    function handleNewGame()
    {
        let roomName=makeId(5);
        clientRooms[client.id]=roomName;
        client.emit('gameCode',roomName);
        state[roomName]=initGame();
         client.join(roomName);
         client.number=1;
         client.emit('init',1);
    }
    function handleKeydown(keyCode)
    {  const roomName=clientRooms[client.id];
        if(!roomName)
        return;
        try {
            keyCode=parseInt(keyCode);
            console.log(keyCode);
        } catch(e)
        {
            console.error(e);
            return ;
        }
        const vel=getUpdateVelocity(keyCode);
        if(vel) {
            state[roomName].players[client.number - 1].vel=vel;
    
        }
    }
  
});

function startGameInterval(roomName)
{
    const intervalId=setInterval(()=>{
          const winner=gameLoop(state[roomName]);
          if(!winner)
          {   emitGameState(roomName,state[roomName]);
          }
          else
          {  emitGameover(roomName,winner);
            state[roomName]='null'
              clearInterval(intervalId);
          }
    },1000/FRAME_RATE)
}

function emitGameState(roomName,state)
{
  io.sockets.in(roomName)
  .emit('gameState',JSON.stringify(state));
}
function emitGameover(roomName,winner)
{
    io.sockets.in(roomName)
    .emit('gameOver',JSON.stringify({winner}));
}
io.listen(3000);