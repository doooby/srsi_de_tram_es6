import {cards, Card} from '../../client_app/srsi/deck';
import {Turn} from '../../client_app/srsi/game';
import {HelperBuilder} from './support/helper_builder';



describe('possible moves', () => {

    var at_situation = HelperBuilder.possibleActionsFor;

    it('on standard situation', () => {
        let actions = at_situation(new Card(cards.HEARTS | cards.NINE), {continuance: true});
        expect(actions).toEqual(['draw', 'lay']);
    });

    it('on non-continuance', () => {
        let actions = at_situation(new Card(cards.DRAGON));
        expect(actions).toEqual(['draw', 'lay']);
    });

    it('on attack', () => {
        let actions = at_situation(new Card(cards.HEARTS | cards.SEVEN), {continuance: true, attack: 2});
        expect(actions).toEqual(['devour', 'lay']);
    });

    it('on ace', () => {
        let actions = at_situation(new Card(cards.HEARTS | cards.ACE), {continuance: true});
        expect(actions).toEqual(['stay', 'lay']);
    });

    it('cannot lay ace as last', () => {
        let game = HelperBuilder.anonymousGameAt(({
            pile: [new Card(cards.BELLS | cards.ACE)],
            player1: [new Card(cards.ACORNS | cards.ACE)],
            stats: {continuance: true}
        }));
        let turn = new Turn(game, 0);
        expect(turn.possibleActions()).toEqual(['stay']);
    });

    it('cannot lay ace as last - discontinued', () => {
        let game = HelperBuilder.anonymousGameAt(({
            pile: [new Card(cards.BELLS | cards.NINE)],
            player1: [new Card(cards.BELLS | cards.ACE)]
        }));
        let turn = new Turn(game, 0);
        expect(turn.possibleActions()).toEqual(['draw']);
    });

    it('after queen', () => {
        let game = HelperBuilder.anonymousGameAt(({
            pile: [new Card(cards.DRAGON)],
            player1: [new Card(cards.HEARTS | cards.QUEEN)]
        }));
        let turn = new Turn(game, 0);
        turn.finishMove(turn.lay(0), game);
        expect(turn.possibleActions()).toEqual(['queer']);
    });

    it('after eight', () => {
        let game = HelperBuilder.anonymousGameAt(({
            pile: [new Card(cards.DRAGON)],
            player1: [new Card(cards.HEARTS | cards.EIGHT)]
        }));
        let turn = new Turn(game, 0);
        turn.finishMove(turn.lay(0), game);
        expect(turn.possibleActions()).toEqual(['draw', 'lay']);
    });

    it('attacked, having only ace', () => {
        let game = HelperBuilder.anonymousGameAt(({
            pile: [new Card(cards.DRAGON)],
            player1: [new Card(cards.HEARTS | cards.ACE)],
            stats: {continuance: true, attack: 5}
        }));
        let turn = new Turn(game, 0);
        expect(turn.possibleActions()).toEqual(['devour']);
    });

});