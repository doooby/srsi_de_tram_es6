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

        it('simple lay', () => {
            let {diff, state, new_state} = state_after_move(GameState.at({
                    players: [
                        [new Card(cards.HEARTS | cards.NINE)],
                        []
                    ]
                }),
                new LayMove(0, 0)
            );
            expect(diff.pile).toBe(1);
            expect(diff.player).toBe(-1);
            expect(new_state.continuance).toBe(true);
            expect(diff.list).toEqual(['pile', 'player', 'on_move', 'continuance']);
        });

        it('ten clears attack', () => {
            let {diff, state, new_state} = state_after_move(GameState.at({
                    players: [
                        [new Card(cards.HEARTS | cards.TEN)],
                        []
                    ],
                    continuance: true,
                    attack: 5
                }),
                new LayMove(0, 0)
            );
            expect(diff.pile).toBe(1);
            expect(diff.player).toBe(-1);
            expect(new_state.attack).toBe(0);
            expect(diff.list).toEqual(['pile', 'player', 'on_move', 'attack']);
        });

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

        it('return with king', () => {
            let {diff, state, new_state} = state_after_move(GameState.at({
                    players: [
                        [new Card(cards.HEARTS | cards.KING)],
                        []
                    ],
                    continuance: true,
                    attack: 3
                }),
                new LayMove(0, 0)
            );
            expect(diff.pile).toBe(1);
            expect(diff.player).toBe(-1);
            expect(diff.list).toEqual(['pile', 'player', 'on_move']);
        });

        it('attack with king of leaves', () => {
            let {diff, state, new_state} = state_after_move(GameState.at({
                    players: [
                        [new Card(cards.LEAVES | cards.KING)],
                        []
                    ]
                }),
                new LayMove(0, 0)
            );
            expect(diff.pile).toBe(1);
            expect(diff.player).toBe(-1);
            expect(new_state.continuance).toBe(true);
            expect(new_state.attack).toBe(4);
            expect(diff.list).toEqual(['pile', 'player', 'on_move', 'continuance', 'attack']);
        });

        it('attack with dragon', () => {
            let {diff, state, new_state} = state_after_move(GameState.at({
                    players: [
                        [new Card(cards.DRAGON)],
                        []
                    ]
                }),
                new LayMove(0, 0)
            );
            expect(diff.pile).toBe(1);
            expect(diff.player).toBe(-1);
            expect(new_state.continuance).toBe(true);
            expect(new_state.attack).toBe(5);
            expect(diff.list).toEqual(['pile', 'player', 'on_move', 'continuance', 'attack']);
        });

    });

    describe('queen move', () => {

        it('lay', () => {
            let {diff, state, new_state} = state_after_move(GameState.at({
                    players: [
                        [new Card(cards.BELLS | cards.QUEEN)],
                        []
                    ],
                    continuance: true
                }),
                new LayMove(0, 0)
            );
            expect(diff.pile).toBe(1);
            expect(diff.player).toBe(-1);
            expect(new_state.continuance).toBe(true);
            expect(diff.list).toEqual(['pile', 'player']);
        });

        it('change', () => {
            let {diff, state, new_state} = state_after_move(GameState.at({
                    pile: [new Card(cards.BELLS | cards.QUEEN)],
                    players: [
                        [],
                        []
                    ],
                    continuance: true
                }),
                new QueerMove(0, cards.ACORNS)
            );
            expect(new_state.suit).toBe(cards.ACORNS);
            expect(diff.list).toEqual(['suit']);
        });

        it('change - the same', () => {
            let {diff, state, new_state} = state_after_move(GameState.at({
                    pile: [new Card(cards.BELLS | cards.QUEEN)],
                    players: [
                        [],
                        []
                    ],
                    continuance: true
                }),
                new QueerMove(0)
            );
            expect(new_state.suit).toBe(null);
            expect(diff.list).toEqual([]);
        });

    });

    describe('eights move', () => {

        it('first eight', () => {
            let {diff, state, new_state} = state_after_move(GameState.at({
                    players: [
                        [new Card(cards.BELLS | cards.EIGHT)],
                        []
                    ],
                    continuance: true
                }),
                new LayMove(0, 0)
            );
            expect(diff.pile).toBe(1);
            expect(diff.player).toBe(-1);
            expect(new_state.eights).toBe(1);
            expect(diff.list).toEqual(['pile', 'player', 'eights']);
        });

        it('first eight - discontinued', () => {
            let {diff, state, new_state} = state_after_move(GameState.at({
                    players: [
                        [new Card(cards.BELLS | cards.EIGHT)],
                        []
                    ]
                }),
                new LayMove(0, 0)
            );
            expect(diff.pile).toBe(1);
            expect(diff.player).toBe(-1);
            expect(new_state.continuance).toBe(true);
            expect(new_state.eights).toBe(1);
            expect(diff.list).toEqual(['pile', 'player', 'continuance', 'eights']);
        });

        it('second eight', () => {
            let {diff, state, new_state} = state_after_move(GameState.at({
                    players: [
                        [new Card(cards.BELLS | cards.EIGHT)],
                        []
                    ],
                    continuance: true,
                    eights: 1
                }),
                new LayMove(0, 0)
            );
            expect(diff.pile).toBe(1);
            expect(diff.player).toBe(-1);
            expect(new_state.eights).toBe(2);
            expect(diff.list).toEqual(['pile', 'player', 'eights']);
        });

        it('third eight', () => {
            let {diff, state, new_state} = state_after_move(GameState.at({
                    players: [
                        [new Card(cards.BELLS | cards.EIGHT)],
                        []
                    ],
                    continuance: true,
                    eights: 2
                }),
                new LayMove(0, 0)
            );
            expect(diff.pile).toBe(1);
            expect(diff.player).toBe(-1);
            expect(new_state.eights).toBe(3);
            expect(diff.list).toEqual(['pile', 'player', 'eights']);
        });

    });

    describe('', () => {

        it('', () => {

        });

    });

});