import {cards, Card} from '../../client_app/srsi/deck';
import {Turn} from '../../client_app/srsi/game';
import {GameState} from '../../client_app/srsi/game_state';



describe('possible moves', () => {

    var at_situation = function (pile_card, state_at) {
        state_at['pile'] = [pile_card];
        if (!state_at['players']) state_at['players'] = [[]];
        let turn = new Turn(GameState.at(state_at));
        return turn.possibleActions();
    };

    it('on standard situation', () => {
        let actions = at_situation(new Card(cards.HEARTS | cards.NINE), {continuance: true});
        expect(actions).toEqual(['draw', 'lay']);
    });

    it('on non-continuance', () => {
        let actions = at_situation(new Card(cards.DRAGON), {});
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
        let actions = at_situation(new Card(cards.BELLS | cards.ACE), {
            players: [[new Card(cards.ACORNS | cards.ACE)]], continuance: true});
        expect(actions).toEqual(['stay']);
    });

    it('cannot lay ace as last - discontinued', () => {
        let actions = at_situation(new Card(cards.BELLS | cards.NINE), {
            players: [[new Card(cards.BELLS | cards.ACE)]]});
        expect(actions).toEqual(['draw']);
    });

    it('after queen', () => {
        let actions = at_situation(new Card(cards.HEARTS | cards.QUEEN), {continuance: true, queer: true});
        expect(actions).toEqual(['queer']);
    });

    it('after eight', () => {
        let actions = at_situation(new Card(cards.HEARTS | cards.EIGHT), {continuance: true, eights: 1});
        expect(actions).toEqual(['draw', 'lay']);
    });

    it('after eight, having no more', () => {
        let actions = at_situation(new Card(cards.HEARTS | cards.EIGHT), {
            players: [[new Card(cards.HEARTS | cards.NINE)]], continuance: true, eights: 1});
        expect(actions).toEqual(['draw', 'lay']);
    });

    it('attacked, having only ace', () => {
        let actions = at_situation(new Card(cards.DRAGON), {
            players: [[new Card(cards.BELLS | cards.ACE)]], continuance: true, attack: 5});
        expect(actions).toEqual(['devour']);
    });

});