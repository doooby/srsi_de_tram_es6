import {cards, Card} from '../../client_app/srsi/deck';
import {GameState, LayMove, DrawMove, QueerMove, NoMove} from '../../client_app/srsi/game';

describe('game rules', () => {

    function calc_cards_diff (former, actual) {
        let count_change = actual.length - former.length;
        if (count_change !== 0) return count_change;

        for (let i=0; i<former.length; i+=1) {
            if (former[i].id() !== actual[i].id()) return 0;
        }

        return false;
    }

    function state_after_move (state, move) {
        let new_state = state.duplicate();
        move.applyTo(new_state);

        let diff = {
            deck: calc_cards_diff(state.deck, new_state.deck),
            pile: calc_cards_diff(state.pile, new_state.pile),
            player: calc_cards_diff(state.players[0], new_state.players[0])
        };
        diff.list = [];
        ['deck', 'pile', 'player'].forEach(a => {
            if (diff[a] !== false) diff.list.push(a)
        });
        ['on_move', 'continuance', 'attack', 'eights', 'suit'].forEach(a => {
            if (state[a] !== new_state[a]) diff.list.push(a);
        });

        return {diff, state, new_state};
    }

    describe('lay moves', () => {

        it('attack with seven', () => {
            let {diff, state, new_state} = state_after_move(GameState.at({
                    players: [
                        [new Card(cards.HEARTS | cards.SEVEN)],
                        []
                    ]
                }),
                new LayMove(0, 0)
            );
            expect(diff.pile).toBe(1);
            expect(diff.player).toBe(-1);
            expect(new_state.continuance).toBe(true);
            expect(new_state.attack).toBe(2);
            expect(diff.list).toEqual(['pile', 'player', 'on_move', 'continuance', 'attack']);
        });

        it('', () => {

        });

        it('', () => {

        });

        it('', () => {

        });

        it('', () => {

        });

    });

    describe('', () => {

        it('', () => {

        });

    });

    describe('', () => {

        it('', () => {

        });

    });

    describe('', () => {

        it('', () => {

        });

    });

});