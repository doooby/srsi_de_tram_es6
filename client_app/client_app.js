'use strict';

import {cards} from 'srsi/deck';
import {Game, Player} from 'srsi/game';
import {Move} from 'srsi/game_state';


import HbApp from './handlebars_app';
import cable from 'cable/integration';

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
    app.channel = cable.openChannel('game', null, {
        connected: function() { console.log('player '+player+' connected'); },
        disconnected: function() { console.log('player '+player+' disconnected'); },
        received: function(data) {
            if (data.p === undefined || data.p === player) return;
            console.log('player '+player+' received from '+data.p, data.d, Move.parse(data.d));

            switch (data.a) {
                case 'move':
                    game.triggerEvent('_on_move', Move.parse(data.d), data.p);
                    break;
            }
        }

    });
    app.debug = true;
    return app;
}


window.apps = [
    create_app('#container1', 0),
    create_app('#container2', 1)
];

for (let i=0; i<2; i+=1) {

    window.apps[i].g._on_move = function (move, player) {
        window.apps[i].g.applyMove(move);
        if (player === i) window.apps[i].channel.send({p: i, a: 'move', d: move.serialize()});
    };

    window.apps[i].g._on_turn = function () {
        let turn = this.createTurn();
        let actions = turn.possibleActions();
        let move;

        // first try to lay anything
        if (actions.indexOf('lay') !== -1) {
            actions.splice(actions.indexOf('lay'), 1);
            let possible_moves = turn.state.players[this.state.on_move].map((_, i) => turn.lay(i)).filter(m => m.valid);
            move = rand_pick(possible_moves);
        }

        // if not possible to lay, then choose something else
        if (!move) switch (rand_pick(actions)) {
            case 'draw':
            case 'devour':
                move = turn.draw();
                break;

            case 'stay':
                move = turn.doNothing();
                break;

            case 'queer':
                move = turn.selectQueenSuit(rand_pick(cards.SUITS));
                break;

        }

        // fail
        if (!move) {
            console.log('failed to compute for', turn.state, 'actions=', turn.possibleActions());
            return;
        }

        setTimeout(() => {
            console.log(players[i].name + ' hraje: ', move.serialize(), move);
            turn.makeAction(this, move);
        }, 500);
    };

}

function rand_pick (array) {
    return array[Math.floor(Math.random()*array.length)]
}

window.cable = cable;