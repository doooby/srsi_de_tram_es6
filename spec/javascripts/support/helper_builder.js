//import {cards as Cards} from '../../../client_app/srsi/deck';
import {Game, Player, Turn} from '../../../client_app/srsi/game';

var HelperBuilder = {

    anonymousGameAt: function (options) {
        let game = new Game([], [new Player('player1'), new Player('player2')]);

        if (options === undefined) options = {};
        if (options['deck']) game.deck = options['deck'];
        if (options['pile']) game.pile = options['pile'];
        if (options['player1']) game.players[0].cards = options['player1'];
        if (options['player2']) game.players[1].cards = options['player2'];

        return game;
    },

    buildStats: function (changes) {
        let stats = Turn.clearStats();
        ['continuance', 'attack'].forEach(a => {
            if (changes[a] !== undefined) stats[a] = changes[a];
        });
        return stats;
    }

};

export {HelperBuilder};