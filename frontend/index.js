
const BG_COLOR='#231f20';

const SNAKE_COLOR='#c2c2c2';

const FOOD_COLOR='#e66916';

const socket=io('https://limitless-lake-23339.herokuapp.com/');


socket.on('init',handleInit);
socket.on('gameState',handleGameState);
socket.on('gameOver',handleGameOver);
socket.on('gameCode',handleGameCode);
socket.on('unknownCode',handleUnknownCode);
socket.on('tooManyPlayers',handleTooManyPlayers);


const gameScreen=document.getElementById('gameScreen');
const initialScreen=document.getElementById('initialScreen');
const newGAmeBtn=document.getElementById('newGameButton');
const joinGameBtn=document.getElementById('joinGameButton');
const gameCodeInput=document.getElementById('gameCodeInput');
const gameCodeDisplay=document.getElementById('gameCodeDisplay');

newGAmeBtn.addEventListener('click',newGame);
joinGameBtn.addEventListener('click',joinGame);


function newGame()
{
    socket.emit('newGame');
    init();
}

 function joinGame()
 {
     const code=gameCodeInput.value;
     console.log(code);
     socket.emit('joinGame',code);
     init();

 }

let canvas, ctx;
let playerNumber;
let gameActive = false;

function init()
{     initialScreen.style.display='none';
      gameScreen.style.display='block';

      canvas=document.getElementById('canvas');
       ctx=canvas.getContext('2d');

       canvas.width=canvas.height=600;
      ctx.fillStyle=BG_COLOR;

     ctx.fillRect(0,0,canvas.width,canvas.height);

     document.addEventListener('keydown',keydown);
     gameActive=true;
}


function keydown(e)
{
    socket.emit('keydown',e.keyCode)
}


function paintGame(state)
{
    ctx.fillStyle=BG_COLOR;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    const food =state.food;
   // console.log(food);
    const gridsize=state.gridsize;
    const size=canvas.width/gridsize;

    ctx.fillStyle=FOOD_COLOR;
    ctx.fillRect(food.x*size,food.y*size,size,size);

    paintPlayer(state.players[0],size,SNAKE_COLOR);
    paintPlayer(state.players[1],size,'red');
}

function paintPlayer(playerState,size,colour)
{
    const snake=playerState.snake;
    ctx.fillStyle=colour;
    console.log(snake)
    for(let cell of snake)
    {
        ctx.fillRect(cell.x*size,cell.y*size,size,size);
        console.log(cell)
    }

}

 function handleInit(number)
{
    palyerNumber=number
}

function handleGameState(gameState)
{    if (!gameActive) {
    return;
    }

    gameState=JSON.parse(gameState);
    requestAnimationFrame(()=>paintGame(gameState));
}
function handleGameOver(data)
{   if(!gameActive)
    return;
    data=JSON.parse(data);
    gameActive=false;
    if(data.winner===palyerNumber)
    alert('YOU WIN')
    else
    alert('you loose');
}

function handleGameCode(gameCode)
{
  gameCodeDisplay.innerText=gameCode;
}
 function handleUnknownCode()
 {
    reset();
    alert('unkown game Code');
 }
 function handleTooManyPlayers()
 {
   reset();
   alert('This game is already in progress');
 }
 function reset()
 {
     palyerNumber=null;
     gameCodeInput.value='';
     gameCodeDisplay.innerText='';
     initialScreen.style.display='block';
     gameScreen.style.display='none'
 }