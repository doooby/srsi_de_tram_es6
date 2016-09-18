import {cards, Card} from '../../client_app/srsi/deck';
import {Game, Player, Turn} from '../../client_app/srsi/game';
import {HelperBuilder} from './support/helper_builder';



describe('game rules', () => {
    
    var game_at = HelperBuilder.anonymousGameAt;
    var stats_with = HelperBuilder.buildStats;

    describe('basics', () => {

        it('no matching suit or rank', () => {
            let game = game_at({
                pile: [new Card(cards.HEARTS | cards.NINE)],
                player1: [new Card(cards.ACORNS | cards.TEN)]
            });
            let turn = new Turn(game, 0);
            let move = turn.lay(0);
            expect(move.valid).toBe(false);
            expect(move.error).toBe('bad_move.no_match');
        });

        it('matching suit', () => {
            let game = game_at({
                pile: [new Card(cards.HEARTS | cards.NINE)],
                player1: [new Card(cards.HEARTS | cards.TEN)]
            });
            let turn = new Turn(game, 0);
            let move = turn.lay(0);
            expect(move.valid).toBe(true);
            expect(move.terminating()).toBe(true);
        });

        it('matching rank', () => {
            let game = game_at({
                pile: [new Card(cards.HEARTS | cards.NINE)],
                player1: [new Card(cards.ACORNS | cards.NINE)]
            });
            let turn = new Turn(game, 0);
            let move = turn.lay(0);
            expect(move.valid).toBe(true);
            expect(move.terminating()).toBe(true);
        });

        it('nine on ace', () => {
            let game = game_at({
                pile: [new Card(cards.HEARTS | cards.ACE)],
                player1: [new Card(cards.HEARTS | cards.NINE)]
            });

            let turn = new Turn(game, 0, stats_with({continuance: true}));
            let move = turn.lay(0);
            expect(move.valid).toBe(false);
            expect(move.error).toBe('bad_move.ace');
        });

        it('nine on ace - discontinued', () => {
            let game = game_at({
                pile: [new Card(cards.HEARTS | cards.ACE)],
                player1: [new Card(cards.HEARTS | cards.NINE)]
            });

            let turn = new Turn(game, 0);
            let move = turn.lay(0);
            expect(move.valid).toBe(true);
            expect(move.terminating()).toBe(true);
        });

        it('ace on ace', () => {
            let game = game_at({
                pile: [new Card(cards.HEARTS | cards.ACE)],
                player1: [new Card(cards.ACORNS | cards.ACE)]
            });

            let turn = new Turn(game, 0, stats_with({continuance: true}));
            let move = turn.lay(0);
            expect(move.valid).toBe(true);
            expect(move.terminating()).toBe(true);
        });

        it ('cannot lay while attacked', () => {
            let game = game_at({
                pile: [new Card(cards.HEARTS | cards.SEVEN)],
                player1: [new Card(cards.HEARTS | cards.NINE)]
            });
            let turn = new Turn(game, 0, stats_with({continuance: true, attack: 2}));
            let move = turn.lay(0);
            expect(move.valid).toBe(false);
            expect(move.error).toBe('bad_move.attack');
        });

    });

    describe('attack cards', () => {

        it('seven attacks with 2', () => {
            let game = game_at({
                pile: [new Card(cards.HEARTS | cards.NINE)],
                player1: [new Card(cards.HEARTS | cards.SEVEN)]
            });
            let turn = new Turn(game, 0);
            let move = turn.lay(0);
            expect(move.valid).toBe(true);
            expect(move.terminating()).toBe(true);
            move.apply();
            expect(turn.stats.attack).toBe(2);
        });

        it('king only returns', () => {
            let game = game_at({
                pile: [new Card(cards.HEARTS | cards.SEVEN)],
                player1: [new Card(cards.HEARTS | cards.KING)]
            });
            let turn = new Turn(game, 0, stats_with({continuance: true, attack: 2}));
            let move = turn.lay(0);
            expect(move.valid).toBe(true);
            expect(move.terminating()).toBe(true);
            move.apply();
            expect(turn.stats.attack).toBe(2);
        });

        it('king of leaves attacks with 4', () => {
            let game = game_at({
                pile: [new Card(cards.LEAVES | cards.SEVEN)],
                player1: [new Card(cards.LEAVES | cards.KING)]
            });
            let turn = new Turn(game, 0, stats_with({continuance: true, attack: 2}));
            let move = turn.lay(0);
            expect(move.valid).toBe(true);
            expect(move.terminating()).toBe(true);
            move.apply();
            expect(turn.stats.attack).toBe(6);
        });

        it('dragon attacks with 5', () => {
            let game = game_at({
                pile: [new Card(cards.HEARTS | cards.NINE)],
                player1: [new Card(cards.DRAGON | cards.DRAGON)]
            });
            let turn = new Turn(game, 0);
            let move = turn.lay(0);
            expect(move.valid).toBe(true);
            expect(move.terminating()).toBe(true);
            move.apply();
            expect(turn.stats.attack).toBe(5);
        });

    });

    describe('defensive cards', () => {

        it('ten clears attack', () => {
            let game = game_at({
                pile: [new Card(cards.HEARTS | cards.SEVEN)],
                player1: [new Card(cards.HEARTS | cards.TEN)]
            });
            let turn = new Turn(game, 0, stats_with({attack: 2}));
            let move = turn.lay(0);
            expect(move.valid).toBe(true);
            expect(move.terminating()).toBe(true);
            move.apply();
            expect(turn.stats.attack).toBe(0);
        });

        it('no attack on ten', () => {
            let game = game_at({
                pile: [new Card(cards.HEARTS | cards.TEN)],
                player1: [new Card(cards.HEARTS | cards.SEVEN)]
            });
            let turn = new Turn(game, 0, stats_with({continuance: true}));
            let move = turn.lay(0);
            expect(move.valid).toBe(false);
            expect(move.error).toBe('bad_move.attack_on_ten');
        });

        it('no attack on ten - discontinued', () => {
            let game = game_at({
                pile: [new Card(cards.HEARTS | cards.TEN)],
                player1: [new Card(cards.HEARTS | cards.SEVEN)]
            });
            let turn = new Turn(game, 0);
            let move = turn.lay(0);
            expect(move.valid).toBe(false);
            expect(move.error).toBe('bad_move.attack_on_ten');
        });

    });

    describe('change cards', () => {

        it('jack changes on whatever', () => {
            let game = game_at({
                pile: [new Card(cards.HEARTS | cards.NINE)],
                player1: [new Card(cards.ACORNS | cards.JACK)]
            });
            let turn = new Turn(game, 0);
            let move = turn.lay(0);
            expect(move.valid).toBe(true);
            expect(move.terminating()).toBe(true);
        });

        it('queen - no change', () => {
            let game = game_at({
                pile: [new Card(cards.HEARTS | cards.NINE)],
                player1: [new Card(cards.HEARTS | cards.QUEEN)]
            });
            let turn = new Turn(game, 0);
            let move = turn.lay(0);
            expect(move.valid).toBe(true);
            expect(move.terminating()).toBe(false);
            move.apply();

            move = turn.doNothing();
            expect(move.valid).toBe(true);
            expect(move.terminating()).toBe(true);
            expect(turn.stats.suit).toBe(null);
            expect(turn.pileCard().suit).toBe(cards.HEARTS);
        });

        it('queen with change', () => {
            let game = game_at({
                pile: [new Card(cards.HEARTS | cards.NINE)],
                player1: [new Card(cards.HEARTS | cards.QUEEN)]
            });
            let turn = new Turn(game, 0);
            let move = turn.lay(0);
            expect(move.valid).toBe(true);
            expect(move.terminating()).toBe(false);
            move.apply();

            let new_suit = cards.BELLS;
            move = turn.selectQueenSuit(new_suit);
            expect(move.valid).toBe(true);
            expect(move.terminating()).toBe(true);
            move.apply();
            expect(turn.stats.suit).toBe(new_suit);
            expect(turn.pileCard().suit).toBe(new_suit);
        });

    });

    describe('special rules', () => {

    });

});
