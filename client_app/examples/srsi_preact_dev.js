import app from '../preact_app/app';
import {Game, Player} from '../srsi/game';
import RandomPossibleAI from '../ai/random_possible';




const players_names = ['člověk', 'náhoda'];

// set-up human player
let human_game = new Game(players_names.map(name => new Player(name)), 0);
human_game.translations = Game.translations.cs;

// set-up dummy AI
let ai_game = new Game(players_names.map(name => new Player(name)), 1);
RandomPossibleAI(ai_game.localPlayer(), {
    failed () { console.log(human_game.t('texts.ai_fail')); }
});

// set-up local match
human_game.propagateMove = move => ai_game.onPlayerMoved(move);
ai_game.propagateMove = move => human_game.onPlayerMoved(move);

// initialize game
let deck = Game.newDeck();
human_game.begin(deck.slice());
ai_game.begin(deck.slice());


let root = document.getElementById('srsi_preact');
app.renderRoot(root, human_game);
