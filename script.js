//Tabuleiro do jogo
var origBoard;

//Jogador e a IA
const huPlayer = 'O';
const aiPlayer = 'X';

//Combinações em que é possivel ganhar no tabuleiro
const winCombos = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[6, 4, 2]
]

//Selecionar todas as celulas do tabuleiro
const cells = document.querySelectorAll('.cell');

//Iniciar jogo
startGame();

/*Função iniciar jogo que define o estilo da div "endgame" para none
pois não é o momento dela aparecer ainda, apois isso o tabuleiro
recebe um array de 0 a 8, no for ele limpa as celular para tirar o texto
o backgroundcolor e adicionar o evento de cick a cada um*/ 
function startGame() {
	document.querySelector(".endgame").style.display = "none";
	origBoard = Array.from(Array(9).keys());
	for (var i = 0; i < cells.length; i++) {
		cells[i].innerText = '';
		cells[i].style.removeProperty('background-color');
		cells[i].addEventListener('click', turnClick, false);
	}
}

/* Função que é disparada ao ser clicado em uma celula, caso o tabuleiro
ainda não tenha sido preenchido com uma letra X ou O, o player joga
e após isso verifica se houve vitoria ou empate, caso não a IA joga */
function turnClick(square) {
	if (typeof origBoard[square.target.id] == 'number') {
		turn(square.target.id, huPlayer)
		if (!checkWin(origBoard, huPlayer) && !checkTie()) turn(bestSpot(), aiPlayer);
	}
}

/* Função que verifica se a jogada do player ou da IA no quadrado
selecionado ganhou o jogo, se sim chama a função que acaba o jogo */
function turn(squareId, player) {
	origBoard[squareId] = player;
	document.getElementById(squareId).innerText = player;
	let gameWon = checkWin(origBoard, player)
	if (gameWon) gameOver(gameWon)
}

/* Função que checa que se o jogador venceu, vefica a celula em
que foi clicado e a partir disso verifica se essas celulas formam
algum dos combos possiveis para ganhar, se os valores baterem é
retornado uma variavel dizendo o tipo do jogador e as celulas que
formam o trio */
function checkWin(board, player) {
	let plays = board.reduce((a, e, i) =>
		(e === player) ? a.concat(i) : a, []);
	let gameWon = null;
	for (let [index, win] of winCombos.entries()) {
		if (win.every(elem => plays.indexOf(elem) > -1)) {
			gameWon = {index: index, player: player};
			break;
		}
	}
	return gameWon;
}

/* Função de fim do jogo que pega as 3 celulas que formam a linha
ganhadora e muda de cor de acordo com o tipo do player, apos isso
limpa tira todos os eventos de click das celulas e chama da função
que declara o ganhador */
function gameOver(gameWon) {
	for (let index of winCombos[gameWon.index]) {
		document.getElementById(index).style.backgroundColor =
			gameWon.player == huPlayer ? "blue" : "red";
	}
	for (var i = 0; i < cells.length; i++) {
		cells[i].removeEventListener('click', turnClick, false);
	}
	declareWinner(gameWon.player == huPlayer ? "Você Venceu!" : "Você Perdeu.");
}

/* Função que declara o ganhador ao deixar a div "endgame" visivel
e pega mostra na tela o tipo de player que foi vitorioso */
function declareWinner(who) {
	document.querySelector(".endgame").style.display = "block";
	document.querySelector(".endgame .text").innerText = who;
}

//Pega todas as celulas que ainda não foram preenchidas
function emptySquares() {
	return origBoard.filter(s => typeof s == 'number');
}

/* O melhor lugar para a IA fazer a sua jogada na celula a partir
da função minimax */
function bestSpot() {
	return minimax(origBoard, aiPlayer).index;
}

/* Função para checar se houve algum empate, caso não tenhe nenhuma
celula sem estar preenchida o fundo é pintado de verde e o evento de
click é retirado, passando o texto da função declareWinner como empate */
function checkTie() {
	if (emptySquares().length == 0) {
		for (var i = 0; i < cells.length; i++) {
			cells[i].style.backgroundColor = "green";
			cells[i].removeEventListener('click', turnClick, false);
		}
		declareWinner("Empate!")
		return true;
	}
	return false;
}

/* Função que uso o algoritomo de minimo e maximo para achar
a melhor jogada possivel, na jogada da IA ele verifica todas
as celulas vazias e a partir disso quais poderiam ser as jogadas
seguintes fazendo uma arvore de possibilidades, se a jogada levar
a vitoria do player ela retorna um score de "-10" caso seja vitoria
da IA retorna "+10" e empate "0" a partir disso a IA vai fazendo
novos tabuleiros para cada teste procurando o movimento em que
ela ganhe com mais pontos fazendo menos ações até chegar a vitoria */
function minimax(newBoard, player) {
	var availSpots = emptySquares();

	if (checkWin(newBoard, huPlayer)) {
		return {score: -10};
	} else if (checkWin(newBoard, aiPlayer)) {
		return {score: 10};
	} else if (availSpots.length === 0) {
		return {score: 0};
	}
	var moves = [];
	for (var i = 0; i < availSpots.length; i++) {
		var move = {};
		move.index = newBoard[availSpots[i]];
		newBoard[availSpots[i]] = player;

		if (player == aiPlayer) {
			var result = minimax(newBoard, huPlayer);
			move.score = result.score;
		} else {
			var result = minimax(newBoard, aiPlayer);
			move.score = result.score;
		}

		newBoard[availSpots[i]] = move.index;

		moves.push(move);
	}

	var bestMove;
	if(player === aiPlayer) {
		var bestScore = -10000;
		for(var i = 0; i < moves.length; i++) {
			if (moves[i].score > bestScore) {
				bestScore = moves[i].score;
				bestMove = i;
			}
		}
	} else {
		var bestScore = 10000;
		for(var i = 0; i < moves.length; i++) {
			if (moves[i].score < bestScore) {
				bestScore = moves[i].score;
				bestMove = i;
			}
		}
	}

	return moves[bestMove];
}