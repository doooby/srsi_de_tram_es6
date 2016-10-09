import {cards, Card} from './deck';
import {GameState, DrawMove, LayMove, QueerMove, NoMove} from './game_state';

export class Game {

    constructor (players, local_player) {
        this.players = players;
        this.local_player = local_player;
    }

    begin (deck) {
        let state = GameState.empty.duplicate();
        state.deck = (deck === undefined) ? cards.shuffleNewDeck() : deck;
        for (let i=0; i<this.players.length; i+=1) state.players[i] = state.deck.splice(0, 6);
        state.pile = state.deck.splice(0, 1);
        state.on_move = 0;
        this.setState(state);
    }

    attachEvents (events) {
        this.triggerEvent = function () {

        };
    }

    createTurn () {
        return new Turn(this.state);
    }

    move (move) {
        if (move.valid) {
            this.triggerEvent('_on_move', move);
        } else {
            this.triggerEvent('_on_bad_move', move);
        }
    }

    applyMove (move) {
        this.setState(move.applyTo(this.state));
    }

    setState (state) {
        this.state = state;
        if (this.history !== undefined) this.history.push(state);
        this.triggerEvent('_on_modified');
    }

    triggerEvent () {
        let args = Array.prototype.slice.call(arguments);
        let callback = this[args.shift()];
        if (callback) {
            setTimeout(() => {
                callback.apply(this, args);
            }, 0);
        }
    }

    t (key) {
        let value = _translation_finder(this.translations, key.split('.'), 0);
        return value === undefined ? 'Missing text for key='+key : value;
    }

}

function _translation_finder (data, keys, i) {
    if (typeof data !== 'object') return undefined;
    let value = data[keys[i]];
    i += 1;
    return i === keys.length ? value : _translation_finder(value, keys, i);
}

export class Player {

    constructor (name) {
        this.name = name;
    }

}

export class Turn {

    constructor (state) {
        this.state = state;
    }

    lay (card_i) {
        let move = new LayMove(card_i);
        move.evaluate(this);
        return move;
    }

    draw () {
        let move = new DrawMove();
        move.evaluate(this);
        return move;
    }

    doNothing () {
        let move = new NoMove();
        move.evaluate(this);
        return move;
    }

    selectQueenSuit (suit) {
        if (suit === undefined) suit = null;
        let move = new QueerMove(suit);
        move.evaluate(this);
        return move;
    }

    possibleActions () {
        if (this.state.queer === true) return ['queer'];
        else if (this.state.eights > 0) return ['draw', 'lay'];

        let passive = 'draw';
        if (this.state.continuance) {
            if (this.state.pileCard().rank === cards.ACE) passive = 'stay';
            else if (this.state.attack > 0) passive = 'devour';
        }
        let player_cards = this.state.onMovePlayerCards();
        let last_is_ace = player_cards.length === 1 && player_cards[0].rank === cards.ACE;

        return last_is_ace ? [passive] : [passive, 'lay'];
    }

}

