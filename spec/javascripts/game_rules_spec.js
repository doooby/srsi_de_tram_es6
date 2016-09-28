import {cards, Card} from '../../client_app/srsi/deck';
import {Game, GameState, Player, Turn} from '../../client_app/srsi/game';



describe('game rules', () => {

    beforeEach(function() {
        jasmine.addMatchers({

            toBeValidMove: () => {return {compare: (move, termination) => {
                if (termination === undefined) termination = true;

                if (move.valid !== true) return {
                    pass: false,
                    message: 'Move is not valid, error=' + move.error
                };

                if (move.terminating() !== termination) return {
                    pass: false,
                    message: (termination ?
                            'Expected move to terminate.' :
                            'Expected move not to terminate.'
                    )
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
            /*
             turn.finishMove(move, game);
             expect(game.continuance).toBe(false);
             expect(game.players[move.player_i].cards.length).toBe(1);
             */
        });

        it('cannot do just nothing - only on ace', () => {
            let turn = new Turn(GameState.at({
                pile: [new Card(cards.HEARTS | cards.ACE)]
            }));
            let move = turn.doNothing();
            expect(move).toBeInvalidMove('nothing');

            /*
             game.continuance = true;
             turn = new Turn(game, 0);
             move = turn.doNothing();
             expect(move).toBeValidMove();
             turn.finishMove(move, game);
             expect(game.continuance).toBe(false);
             */
        });

        it('simply draw', () => {
            let turn = new Turn(GameState.at({
                deck: [new Card(0), new Card(0)],
                pile: [new Card(cards.HEARTS | cards.NINE)]
            }));
            let move = turn.draw();
            expect(move).toBeValidMove();

            /*
             turn.finishMove(move, game);
             expect(game.continuance).toBe(false);
             expect(game.deck.length).toBe(1);
             expect(game.pile.length).toBe(1);
             expect(game.players[move.player_i].cards.length).toBe(1);
             */
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

            /*
             turn.finishMove(move, game);
             expect(game.attack).toBe(0);
             expect(game.continuance).toBe(false);
             expect(game.deck.length).toBe(0);
             expect(game.pile.length).toBe(1);
             expect(game.players[move.player_i].cards.length).toBe(2);
             */
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

        it('seven attacks with 2', () => {
            let turn = new Turn(GameState.at({
                pile: [new Card(cards.HEARTS | cards.NINE)],
                players: [
                    [new Card(cards.HEARTS | cards.SEVEN)]
                ]
            }));
            let move = turn.lay(0);
            expect(move).toBeValidMove();

            /*
             turn.finishMove(move, game);
             expect(game.attack).toBe(2);
             */
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

            /*
             turn.finishMove(move, game);
             expect(game.attack).toBe(2);
             */
        });

        it('king of leaves attacks with 4', () => {
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

            /*
             turn.finishMove(move, game);
             expect(game.attack).toBe(6);
             */
        });

        it('dragon attacks with 5', () => {
            let turn = new Turn(GameState.at({
                pile: [new Card(cards.HEARTS | cards.NINE)],
                players: [
                    [new Card(cards.DRAGON | cards.DRAGON)]
                ]
            }));
            let move = turn.lay(0);
            expect(move).toBeValidMove();

            /*
             turn.finishMove(move, game);
             expect(game.attack).toBe(5);
             */
        });

    });

    describe('defensive cards', () => {

        it('ten clears attack', () => {
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

            /*
             turn.finishMove(move, game);
             expect(game.attack).toBe(0);
             */
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

        it('queen - no change', () => {
            let turn = new Turn(GameState.at({
                pile: [new Card(cards.HEARTS | cards.NINE)],
                players: [
                    [new Card(cards.HEARTS | cards.QUEEN)]
                ]
            }));
            let move = turn.lay(0);
            expect(move).toBeValidMove(false);

            /*
             expect(turn.finishMove(move, game)).toBe(false);
             expect(turn.lastMove()).toBe(move);
             expect(move.queer).toBe(true);

             move = turn.selectQueenSuit();
             expect(move).toBeValidMove();
             turn.finishMove(move, game);
             expect(game.suit).toBe(null);
             expect(game.continuance).toBe(true);
             expect(turn.pileCard()).toBe(game.pile[1]);
             */
        });

        it('queen with change', () => {
            let turn = new Turn(GameState.at({
                pile: [new Card(cards.HEARTS | cards.NINE)],
                players: [
                    [new Card(cards.HEARTS | cards.QUEEN)]
                ]
            }));
            let move = turn.lay(0);
            expect(move).toBeValidMove(false);

            /*
             expect(turn.finishMove(move, game)).toBe(false);
             expect(turn.lastMove()).toBe(move);
             expect(move.queer).toBe(true);

             let new_suit = cards.BELLS;
             move = turn.selectQueenSuit(new_suit);
             expect(move).toBeValidMove();
             expect(turn.finishMove(move, game)).toBe(true);
             expect(game.suit).toBe(new_suit);
             expect(game.continuance).toBe(true);
             */
        });

    });

    describe('special rules', () => {

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
                pile: [new Card(0), new Card(0), new Card(cards.HEARTS | cards.NINE)],
                players: [
                    [new Card(cards.HEARTS | cards.EIGHT), new Card(cards.ACORNS | cards.EIGHT)]
                ]
            }));
            let move = turn.lay(0);
            expect(move).toBeValidMove(false);

            /*
             expect(turn.finishMove(move, game)).toBe(false);
             expect(turn.lastMove()).toBe(move);
             expect(move.eights).toBe(true);
             expect(game.eights).toBe(1);
             expect(game.players[move.player_i].cards.length).toBe(1);

             move = turn.lay(0);
             expect(move).toBeValidMove(false);
             expect(turn.finishMove(move, game)).toBe(false);
             expect(turn.lastMove()).toBe(move);
             expect(move.eights).toBe(true);
             expect(game.eights).toBe(2);
             expect(game.players[move.player_i].cards.length).toBe(0);

             move = turn.draw();
             expect(move).toBeValidMove();
             expect(turn.finishMove(move, game)).toBe(true);
             expect(game.continuance).toBe(true);
             expect(game.eights).toBe(0);
             expect(game.players[move.player_i].cards.length).toBe(2);
             */
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

        it('lay multiple eights - only eights', () => {
            let turn = new Turn(GameState.at({
                pile: [new Card(0), new Card(0), new Card(cards.HEARTS | cards.NINE)],
                players: [
                    [new Card(cards.HEARTS | cards.EIGHT), new Card(cards.HEARTS | cards.TEN)]
                ]
            }));
            let move = turn.lay(0);
            expect(move).toBeValidMove(false);

            /*
             expect(turn.finishMove(move, game)).toBe(false);
             expect(turn.eights).toBe(1);

             move = turn.lay(0);
             expect(move).toBeInvalidMove('eights');
             */
        });

    });

    describe('corrections', () => {

        // jack on ace
        // the check whether is jack was at the beginning of move validation and therefore attack check was skipped
        it('jack on ace', () => {
            let turn = new Turn(GameState.at({
                pile: [new Card(cards.HEARTS | cards.ACE)],
                players: [
                    [new Card(cards.ACORNS | cards.JACK)]
                ],
                continuance: true
            }));
            let move = turn.lay(0);
            expect(move).toBeInvalidMove('ace');
        });

        // couldn't lay a seven on the dragon
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

    })

});
