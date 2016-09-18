//= require ./handlebars_app

'use strict';

import {cards} from 'srsi/deck';
import {Game, Player, Turn} from 'srsi/game';

var game = new Game(cards.shuffleNewDeck(), [
    new Player('ondra'),
    new Player('karel')
]);

window.game = game;

let stats = {};
let turn = new Turn(game, 0, stats);
window.HB_APP.print(turn);