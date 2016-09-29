import {cards, Card} from '../../client_app/srsi/deck';
import {GameState, Turn} from '../../client_app/srsi/game';


describe('game rules', () => {

    beforeEach(function() {
        jasmine.addMatchers({

            toBeValidMove: () => {return {compare: (move) => {
                if (move.valid !== true) return {
                    pass: false,
                    message: 'Move is not valid, error=' + move.error
                };

                return {pass: true};
            }};},

            toBeInvalidMove: () => {return {compare: (move, reason) => {
                if (move.valid !== false) return {
                    pass: false,
                    message: 'Move should not be valid!'
                };

                if (move.error !== reason) return {
                    pass: false,
                    message: 'Expected move to fail because of "' + reason + '" but the error was "' + move.error + '".'
                };

                return {pass: true};
            }};}

        });
    });

    describe('basics', () => {

        it('no matching suit or rank', () => {
            let turn = new Turn(GameState.at({
                pile: [new Card(cards.HEARTS | cards.NINE)],
                players: [
                    [new Card(cards.ACORNS | cards.TEN)]
                ]
            }));
            let move = turn.lay(0);
            expect(move).toBeInvalidMove('no_match');
        });

        it('matching suit', () => {
            let turn = new Turn(GameState.at({
                pile: [new Card(cards.HEARTS | cards.NINE)],
                players: [
                    [new Card(cards.HEARTS | cards.TEN)]
                ]
            }));
            let move = turn.lay(0);
            expect(move).toBeValidMove();
        });

        it('matching rank', () => {
            let turn = new Turn(GameState.at({
                pile: [new Card(cards.HEARTS | cards.NINE)],
                players: [
                    [new Card(cards.ACORNS | cards.NINE)]
                ]
            }));
            let move = turn.lay(0);
            expect(move).toBeValidMove();
        });

        it('simply draw', () => {
            let turn = new Turn(GameState.at({
                deck: [new Card(0), new Card(0)],
                pile: [new Card(cards.HEARTS | cards.NINE)]
            }));
            let move = turn.draw();
            expect(move).toBeValidMove();
        });

        it('simply draw - not enough', () => {
            let turn = new Turn(GameState.at({
                pile: [new Card(cards.HEARTS | cards.NINE)]
            }));
            let move = turn.draw();
            expect(move).toBeInvalidMove('not_enough_cards');
        });

        it('can lay dragon on anything', () => {
            let turn = new Turn(GameState.at({
                pile: [new Card(cards.HEARTS | cards.NINE)],
                players: [
                    [new Card(cards.DRAGON)]
                ]
            }));
            let move = turn.lay(0);
            expect(move).toBeValidMove();
        });

        it('can lay anything on dragon - discontinued', () => {
            let turn = new Turn(GameState.at({
                pile: [new Card(cards.DRAGON)],
                players: [
                    [new Card(cards.LEAVES | cards.NINE)]
                ]
            }));
            let move = turn.lay(0);
            expect(move).toBeValidMove();
        });

    });

    describe('attack cards', () => {

        it ('cannot lay while attacked', () => {
            let turn = new Turn(GameState.at({
                pile: [new Card(cards.HEARTS | cards.SEVEN)],
                players: [
                    [new Card(cards.HEARTS | cards.NINE)]
                ],
                continuance: true,
                attack: 2
            }));
            let move = turn.lay(0);
            expect(move).toBeInvalidMove('attack');
        });

        it('draw while attacked', () => {
            let turn = new Turn(GameState.at({
                deck: [new Card(0)],
                pile: [new Card(0), new Card(cards.HEARTS | cards.SEVEN)],
                continuance: true,
                attack: 2
            }));
            let move = turn.draw();
            expect(move).toBeValidMove();
        });

        it('draw while attacked - not enough', () => {
            let turn = new Turn(GameState.at({
                pile: [new Card(cards.HEARTS | cards.SEVEN)],
                continuance: true,
                attack: 2
            }));
            let move = turn.draw();
            expect(move).toBeInvalidMove('not_enough_cards');
        });

        it('attack with seven', () => {
            let turn = new Turn(GameState.at({
                pile: [new Card(cards.HEARTS | cards.NINE)],
                players: [
                    [new Card(cards.HEARTS | cards.SEVEN)]
                ]
            }));
            let move = turn.lay(0);
            expect(move).toBeValidMove();
        });

        it('king only returns', () => {
            let turn = new Turn(GameState.at({
                pile: [new Card(cards.HEARTS | cards.SEVEN)],
                players: [
                    [new Card(cards.HEARTS | cards.KING)]
                ],
                continuance: true,
                attack: 2
            }));
            let move = turn.lay(0);
            expect(move).toBeValidMove();
        });

        it('attack with king of leaves', () => {
            let turn = new Turn(GameState.at({
                pile: [new Card(cards.LEAVES | cards.SEVEN)],
                players: [
                    [new Card(cards.LEAVES | cards.KING)]
                ],
                continuance: true,
                attack: 2
            }));
            let move = turn.lay(0);
            expect(move).toBeValidMove();
        });

        it('dragon', () => {
            let turn = new Turn(GameState.at({
                pile: [new Card(cards.HEARTS | cards.NINE)],
                players: [
                    [new Card(cards.DRAGON | cards.DRAGON)]
                ]
            }));
            let move = turn.lay(0);
            expect(move).toBeValidMove();
        });

        it('seven on dragon', () => {
            let turn = new Turn(GameState.at({
                pile: [new Card(cards.DRAGON)],
                players: [
                    [new Card(cards.HEARTS | cards.SEVEN)]
                ],
                continuance: true,
                attack: 5
            }));
            let move = turn.lay(0);
            expect(move).toBeValidMove();
        });

    });

    describe('defensive cards', () => {

        it('ten on attack', () => {
            let turn = new Turn(GameState.at({
                pile: [new Card(cards.HEARTS | cards.SEVEN)],
                players: [
                    [new Card(cards.HEARTS | cards.TEN)]
                ],
                continuance: true,
                attack: 2
            }));
            let move = turn.lay(0);
            expect(move).toBeValidMove();
        });

        it('no attack on ten', () => {
            let turn = new Turn(GameState.at({
                pile: [new Card(cards.HEARTS | cards.TEN)],
                players: [
                    [new Card(cards.HEARTS | cards.SEVEN)]
                ],
                continuance: true
            }));
            let move = turn.lay(0);
            expect(move).toBeInvalidMove('attack_on_ten');
        });

        it('no attack on ten - discontinued', () => {
            let turn = new Turn(GameState.at({
                pile: [new Card(cards.HEARTS | cards.TEN)],
                players: [
                    [new Card(cards.HEARTS | cards.SEVEN)]
                ]
            }));
            let move = turn.lay(0);
            expect(move).toBeInvalidMove('attack_on_ten');
        });

    });

    describe('change cards', () => {

        it('jack changes on whatever', () => {
            let turn = new Turn(GameState.at({
                pile: [new Card(cards.HEARTS | cards.NINE)],
                players: [
                    [new Card(cards.ACORNS | cards.JACK)]
                ]
            }));
            let move = turn.lay(0);
            expect(move).toBeValidMove();
        });

        it('lay queen', () => {
            let turn = new Turn(GameState.at({
                pile: [new Card(cards.HEARTS | cards.NINE)],
                players: [
                    [new Card(cards.HEARTS | cards.QUEEN)]
                ]
            }));
            let move = turn.lay(0);
            expect(move).toBeValidMove();
        });

        it('queen invalid', () => {
            let turn = new Turn(GameState.at({
                pile: [new Card(cards.HEARTS | cards.QUEEN)]
            }));
            let move = turn.selectQueenSuit();
            expect(move).toBeInvalidMove('no_queen');
        });

        it('queen', () => {
            let turn = new Turn(GameState.at({
                pile: [new Card(cards.HEARTS | cards.QUEEN)],
                queer: true
            }));
            let move = turn.selectQueenSuit();
            expect(move).toBeValidMove();
        });

        it('queen with change', () => {
            let turn = new Turn(GameState.at({
                pile: [new Card(cards.HEARTS | cards.QUEEN)],
                queer: true
            }));
            let move = turn.selectQueenSuit(cards.BELLS);
            expect(move).toBeValidMove();
        });

    });

    describe('special rules', () => {

        it('nine on ace', () => {
            let turn = new Turn(GameState.at({
                pile: [new Card(cards.HEARTS | cards.ACE)],
                players: [
                    [new Card(cards.HEARTS | cards.NINE)]
                ],
                continuance: true
            }));
            let move = turn.lay(0);
            expect(move).toBeInvalidMove('ace');
        });

        it('nine on ace - discontinued', () => {
            let turn = new Turn(GameState.at({
                pile: [new Card(cards.HEARTS | cards.ACE)],
                players: [
                    [new Card(cards.HEARTS | cards.NINE)]
                ]
            }));
            let move = turn.lay(0);
            expect(move).toBeValidMove();
        });

        it('ace on ace', () => {
            let turn = new Turn(GameState.at({
                pile: [new Card(cards.HEARTS | cards.ACE)],
                players: [
                    [new Card(cards.ACORNS | cards.ACE), new Card(0)]
                ],
                continuance: true
            }));
            let move = turn.lay(0);
            expect(move).toBeValidMove();
        });

        it('cannot draw on ace', () => {
            let turn = new Turn(GameState.at({
                pile: [new Card(cards.HEARTS | cards.ACE)],
                continuance: true
            }));
            let move = turn.draw();
            expect(move).toBeInvalidMove('ace');
        });

        it('can draw on ace - discontinued', () => {
            let turn = new Turn(GameState.at({
                deck: [new Card(0)],
                pile: [new Card(cards.HEARTS | cards.ACE)]
            }));
            let move = turn.draw();
            expect(move).toBeValidMove();
        });

        it('cannot do just nothing - only on ace', () => {
            let turn = new Turn(GameState.at({
                pile: [new Card(cards.HEARTS | cards.ACE)]
            }));
            let move = turn.doNothing();
            expect(move).toBeInvalidMove('nothing');
        });

        it('cannot end with ace', () => {
            let turn = new Turn(GameState.at({
                pile: [new Card(cards.HEARTS | cards.NINE)],
                players: [
                    [new Card(cards.HEARTS | cards.ACE)]
                ]
            }));
            let move = turn.lay(0);
            expect(move).toBeInvalidMove('ace_end');
        });

        it('lay multiple eights', () => {
            let turn = new Turn(GameState.at({
                pile: [new Card(cards.HEARTS | cards.EIGHT)],
                players: [
                    [new Card(cards.ACORNS | cards.EIGHT)]
                ],
                continuance: true,
                eights: 1
            }));
            let move = turn.lay(0);
            expect(move).toBeValidMove();
        });

        it('multiple eights - not enough cards', () => {
            let turn = new Turn(GameState.at({
                pile: [new Card(0), new Card(cards.HEARTS | cards.NINE)],
                players: [
                    [new Card(cards.HEARTS | cards.EIGHT)]
                ],
                continuance: true,
                eights: 3
            }));
            let move = turn.draw();
            expect(move).toBeInvalidMove('not_enough_cards');
        });

        it('only eights can be multiple', () => {
            let turn = new Turn(GameState.at({
                pile: [new Card(cards.HEARTS | cards.EIGHT)],
                players: [
                    [new Card(cards.HEARTS | cards.TEN)]
                ],
                continuance: true,
                eights: 1
            }));
            let move = turn.lay(0);
            expect(move).toBeInvalidMove('eights');
        });

    });

});