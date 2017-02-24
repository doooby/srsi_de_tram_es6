'use strict';

import {Game, Player} from '../srsi/game';
import HbApp from '../handlebars_app/handlebars_app';
import RandomPossibleAI from '../ai/random_possible';

function generate_players () {
    return [1, 2, 3].map(i => new Player('player_'+i));
}

function generate_app (i) {
    let game = new Game(generate_players(), i);
    RandomPossibleAI(game.localPlayer(), {delay: 200});
    game.translations = Game.translations.cs;
    return new HbApp(game, $('[data-hb-app='+i+']'), false);
}

// set-up local match
let apps = [generate_app(0), generate_app(1), generate_app(2)];
apps.forEach(app => {
    let others = apps.filter(a => a !== app);
    app.game.propagateMove = function (move) {
        others.forEach(a => a.game.onPlayerMoved(move));
    };
});
let deck = Game.newDeck();
apps.forEach(app => app.game.begin(deck.slice()));