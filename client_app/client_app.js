// 'use strict';
//
// import {cards} from './srsi/deck';
// import {Game, Player} from './srsi/game';
// import {Move} from './srsi/game_state';
// import cable from './cable/integration';
//
// import translations from './translations';
// import HbApp from './handlebars_app/handlebars_app';
//
// import RandomPossibleAI from 'ai/random_possible';
//
// let deck = cards.shuffleNewDeck();
//
// const players_names = [
//     'hráč',
//     'random AI'
// ];
//
// function create_app (container_selector, player_i) {
//     let game = new Game(players_names.map(name => new Player(name)), player_i);
//     game.translations = translations.cs;
//     let app = new HbApp(game, $(container_selector));
//
//     //app.debug = true;
//     return app;
// }
//
// function set_player_as_ai (player, delay=1000) {
//     RandomPossibleAI(player, {
//
//         action: function (turn, move, action) {
//             setTimeout(() => {
//                 console.log(player.player_i + ' moves', move.serialize(), move);
//                 action();
//             }, delay);
//         },
//
//         failed: function (turn, move) {
//             console.log(player.name + ' failed to compute for', turn.state, turn.possibleActions());
//         }
//
//     });
// }
//
// let localMatch = function (games) {
//     games.forEach(function (game) {
//         let others = games.filter(g => g !== game);
//
//         game.propagateMove = function (move) {
//             others.forEach(g => g.onPlayerMoved(move));
//         };
//
//     });
// };
//
// let cableMatch = function (game) {
//     let player = game.localPlayer();
//
//     let channel = cable.openChannel('game', null, {
//         connected: function() { console.log('player '+player.player_i+' connected'); },
//         disconnected: function() { console.log('player '+player.player_i+' disconnected'); },
//         received: function(data) {
//             if (data.p === undefined || data.p === game.player_i) return;
//             console.log('player '+player.player_i+' received from '+data.p, data.d);
//
//             switch (data.a) {
//                 case 'move':
//                     console.log('received move from '+data.p, Move.parse(data.d));
//                     game.onPlayerMoved(Move.parse(data.d));
//                     break;
//             }
//         }
//
//     });
//
//     game.propagateMove = function (move) {
//         channel.send({p: game.player_i, a: 'move', d: move.serialize()});
//     };
//
// };
//
// /////////////////////// local AI vs AI
//
// //let apps = [
// //    create_app('#container1', 0),
// //    create_app('#container2', 1)
// //];
// //window.apps = apps;
//
// //set_player_as_ai(apps[0].game.localPlayer(), 10);
// //set_player_as_ai(apps[1].game.localPlayer(), 10);
//
// //localMatch(apps.map(app => app.game));
// //apps.map(app => app.game).forEach(cableMatch);
//
// //apps.forEach(app => app.game.begin(deck.slice()));
//
//
//
// /////////////////////////// local player vs AI
//
// let player_app = create_app('#container1', 0);
//
// let ai_game = new Game(players_names.map(name => new Player(name)), 1);
// set_player_as_ai(ai_game.localPlayer(), 10);
//
// localMatch([player_app.game, ai_game]);
// player_app.game.begin(deck.slice());
// ai_game.begin(deck.slice());