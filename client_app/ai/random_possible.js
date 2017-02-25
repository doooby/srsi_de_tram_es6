import {cards} from '../srsi/deck';

export default function RandomPossibleAI (player, options) {

    if (typeof options !== 'object') options = {};
    let callback_action = options['action'];
    let callback_failed = options['failed'];
    let debug = !options['debug'];

    let on_move_dispatcher = function () {
        let turn = player.game.createTurn();
        let actions = turn.possibleActions();
        let move;

        // first try to lay anything
        if (actions.indexOf('lay') !== -1) {
            actions.splice(actions.indexOf('lay'), 1);
            let possible_moves = turn.state.players[player.player_i].map((_, i) => turn.lay(i)).filter(m => m.valid);
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
            if (typeof callback_failed === 'function') {
                if (debug) console.log(`[AI] ${player.name} failed to compute for`, turn.state, turn.possibleActions());
                callback_failed(turn, move);
            }
            return;
        }

        let action = function () {
            if (debug) console.log(`[AI] ${player.player_i} moves`, move.serialize(), move);
            turn.makeAction(move);
        };

        if (typeof callback_action === 'function') callback_action(turn, move, action);
        else action();
    };

    let delay = options['delay'];
    if (typeof delay !== 'number' || isNaN(delay)) delay = 1000;
    if (delay < 20) delay = 20;

    player.onMove = function () {
      setTimeout(on_move_dispatcher, delay);
    };
};

function rand_pick (array) {
    return array[Math.floor(Math.random()*array.length)]
}