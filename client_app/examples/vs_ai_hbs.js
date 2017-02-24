'use strict';

import {Game, Player} from '../srsi/game';
import HbApp from '../handlebars_app/handlebars_app';
import RandomPossibleAI from '../ai/random_possible';

const players_names = ['člověk', 'náhoda'];

// set-up human player
let human_game = new Game(players_names.map(name => new Player(name)), 0);
human_game.translations = Game.translations.cs;
let app = new HbApp(human_game, $('[data-hb-app=0]'));

// set-up dummy AI
let ai_game = new Game(players_names.map(name => new Player(name)), 1);
RandomPossibleAI(ai_game.localPlayer(), {
    failed () { app.printAlert(app.game.t('texts.ai_fail')); }
});

// set-up local match
app.game.propagateMove = move => ai_game.onPlayerMoved(move);
ai_game.propagateMove = move => app.game.onPlayerMoved(move);

// initialize game
let deck = Game.newDeck();
app.game.begin(deck.slice());
ai_game.begin(deck.slice());