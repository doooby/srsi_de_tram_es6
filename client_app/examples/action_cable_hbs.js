'use strict';

import {Game, Player} from '../srsi/game';
import {Move} from '../srsi/game_state';
import HbApp from '../handlebars_app/handlebars_app';
import cable from '../cable/integration';

const players_names = [
    'karel',
    'karel'
];

function create_app (container_selector, player_i) {
    let game = new Game(players_names.map(name => new Player(name)), player_i);
    game.translations = Game.translations.cs;
    let app = new HbApp(game, $(container_selector));
    app.debug = true;
    return app;
}

let cableMatch = function (game) {
    let player = game.localPlayer();

    let channel = cable.openChannel('game', null, {
        connected: function() { console.log('player '+player.player_i+' connected'); },
        disconnected: function() { console.log('player '+player.player_i+' disconnected'); },
        received: function(data) {
            if (data.p === undefined || data.p === game.player_i) return;
            console.log('player '+player.player_i+' received from '+data.p, data.d);

            switch (data.a) {
                case 'move':
                    console.log('received move from '+data.p, Move.parse(data.d));
                    game.onPlayerMoved(Move.parse(data.d));
                    break;
            }
        }

    });

    game.propagateMove = function (move) {
        channel.send({p: game.player_i, a: 'move', d: move.serialize()});
    };

};

let apps = [
   create_app('[data-hb-app=0]', 0),
   create_app('[data-hb-app=1]', 1)
];
window.apps = apps;

apps.map(app => app.game).forEach(cableMatch);
let deck = Game.newDeck();
apps.forEach(app => app.game.begin(deck.slice()));
