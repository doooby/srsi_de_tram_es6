import {cards} from '../srsi/deck';

export default function RandomPossibleAI (player, options) {

    let callback_action = options['action'];
    let callback_failed = options['failed'];

    player.onMove = function () {
        let turn = player.game.createTurn();
        let actions = turn.possibleActions();
        let move;

        // first try to lay anything
        if (actions.indexOf('lay') !== -1) {
            actions.splice(actions.indexOf('lay'), 1);
            let possible_moves = turn.state.players[this.player_i].map((_, i) => turn.lay(i)).filter(m => m.valid);
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
            if (typeof callback_failed === 'function') callback_failed(turn, move);
            return;
        }

        let action = function () { turn.makeAction(move); };
        if (typeof callback_action === 'function') callback_action(turn, move, action);
        else action();
    };

};

function rand_pick (array) {
    return array[Math.floor(Math.random()*array.length)]
}