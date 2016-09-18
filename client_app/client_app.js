//= require ./handlebars_app

'use strict';

import {cards} from 'srsi/deck';
import {Game, Player, Turn} from 'srsi/game';


var game = {
    players: [
        new Player('ondra'),
        new Player('karel')
    ],
    deck: cards.shuffleNewDeck(),
    pile: [],

    listCards: function (cards) {
        return cards.map(c => c.transcription());
    }
};

game.players[0].cards = game.deck.splice(0, 6);
game.players[1].cards = game.deck.splice(0, 6);
game.pile = game.deck.splice(0, 1);


window.game = game;

let stats = {};
let turn = new Turn(game, 0, stats);
window.HB_APP.print(turn);