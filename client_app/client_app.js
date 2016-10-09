'use strict';

import {cards} from 'srsi/deck';
import {Game, Player} from 'srsi/game';
import HbApp from './handlebars_app';


let players = [
    new Player('ondra'),
    new Player('karel')
];

let translations = {
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
        attack_on_ten: 'Na desítku nelze zahrát útočnou kartu.',
        eights: 'Polož další osmu nebo ukonči dobráním.',
        no_queen: 'Nebyla zahrána dáma.',
        queer: 'Musíš vybrat novou barvu.'
    }
};

let deck = cards.shuffleNewDeck();

function create_app (container_selector, player) {
    let game = new Game(players, player);
    game.translations = translations;
    let app = new HbApp(game, $(container_selector));
    game.begin(deck.slice());
    return app;
}


window.apps = [
    create_app('#container1', 0),
    create_app('#container2', 1)
];

window.apps[0].g._on_move = function (move) {
    window.apps[0].g.applyMove(move);
    window.apps[1].g.applyMove(move);
};

window.apps[1].g._on_move = function (move) {
    window.apps[0].g.applyMove(move);
    window.apps[1].g.applyMove(move);
};