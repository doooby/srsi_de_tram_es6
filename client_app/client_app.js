//= require ./handlebars_app

'use strict';

import {cards} from 'srsi/deck';
import {Game, Player, Turn} from 'srsi/game';

var game = new Game(cards.shuffleNewDeck(), [
    new Player('ondra'),
    new Player('karel')
]);


game.translations = {
    titles: {
        deck: 'Balík',
        pile: 'Kopa',
        player: 'Hráč'
    },

    actions: {
        lay: 'Polož',
        stay: 'Stůj',
        draw: 'Ber',
        devour: 'Žer',
        queer: 'Změň na'
    },

    bad_move: {
        nothing: 'Musíš udělat tah!',
        no_match: 'Tuto kartu nelze zahrát.',
        not_enough_cards: 'Došly karty!',
        ace: 'Na eso můžeš zahrát jenom další eso.',
        ace_end: 'Eso nelze zahrát jako poslední kartu',
        attack: 'Jsi pod útokem!',
        attack_on_ten: 'Na desítku nelze zahrát útočnou kartu.'
    }
};

let turn = new Turn(game, 0);

window.game = game;
window.HB_APP.printTurn(turn);