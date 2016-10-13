import {cards} from '../../client_app/srsi/deck';
import {Move, LayMove, DrawMove, QueerMove, NoMove} from '../../client_app/srsi/game_state';

describe('game rules', () => {

    describe('moves serialization', () => {

        it('LayMove', () => {
            let move_data = (new LayMove(2)).serialize();
            expect(move_data).toEqual(Move.parse(move_data).serialize());
        });

        it('DrawMove', () => {
            let move_data = (new DrawMove()).serialize();
            expect(move_data).toEqual(Move.parse(move_data).serialize());
        });

        it('QueerMove', () => {
            let move_data = (new QueerMove(cards.ACORNS)).serialize();
            expect(move_data).toEqual(Move.parse(move_data).serialize());
        });

        it('NoMove', () => {
            let move_data = (new NoMove()).serialize();
            expect(move_data).toEqual(Move.parse(move_data).serialize());
        });

    });

});