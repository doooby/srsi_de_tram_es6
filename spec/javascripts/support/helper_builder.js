//import {cards as Cards} from '../../../client_app/srsi/deck';
import {Game, Player, Turn} from '../../../client_app/srsi/game';

var HelperBuilder = {

    anonymousGameAt: function (options) {
        let game = new Game([new Player('player1'), new Player('player2')], []);
        game.dealCards();

        if (options === undefined) options = {};
        if (options['deck']) game.deck = options['deck'];
        if (options['pile']) game.pile = options['pile'];
        if (options['player1']) game.players[0].cards = options['player1'];
        if (options['player2']) game.players[1].cards = options['player2'];

        if (options['stats']) {
            Game.statuses.forEach(a => {
                let val = options['stats'][a];
                if (val !== undefined) game[a] = val;
            });
        }

        return game;
    },

    possibleActionsFor: function (pile_card, stats) {
        let game = HelperBuilder.anonymousGameAt(({pile: [pile_card], stats: stats}));
        let turn = new Turn(game, 0);
        return turn.possibleActions();
    }

};

export {HelperBuilder};