//= require ./handlebars_app

'use strict';

import {cards, Deck} from 'srsi/deck';
import Player from 'srsi/player';



var game = {
    players: [
        new Player('ondra'),
        new Player('karel')
    ],
    deck: Deck.shuffleNewDeck(),
    pile: [],

    listCards: function (cards) {
        return cards.map(c => c.transcription());
    }
};

game.players[0].cards = game.players[0].cards.concat(game.deck.cards.splice(0, 6));
game.players[1].cards = game.players[1].cards.concat(game.deck.cards.splice(0, 6));

window.cards = cards;
window.game = game;







game.print = function () {


};

game.print();

