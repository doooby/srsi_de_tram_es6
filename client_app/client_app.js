//= require ./handlebars_app

'use strict';

import {cards} from 'srsi/deck';
import {Game, Player} from 'srsi/game';

let game = new Game([
    new Player('ondra'),
    new Player('karel')
]);

game.attachTranslations({
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
});

self.HB_APP.game = game;
game.attachEvents({

    modified: function () {
        self.HB_APP.turns.push(this.state);
        self.HB_APP.printTurn(this.createTurn());
    },

    bad_move: function (move) {
        console.log(this);
        self.HB_APP.printAlert(self.HB_APP.game.t('bad_move.' + move.error));
    }
});

game.begin();