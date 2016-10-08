import {cards, Card} from './deck';
import {GameState, DrawMove, LayMove, QueerMove, NoMove} from './game_state';

export class Game {

    constructor (players, deck, options) {
        if (deck === undefined) deck = cards.shuffleNewDeck();
        this.deck = deck;
        this.pile = [];
        this.players = players;
        this.players.forEach( p => p.cards = [] );

        if (!options) options ={};

        this.events = {};
        let events = options['events'];
        if (typeof events === 'object') {
            for (let event_key of Object.keys(events)) this.attachEvent(event_key, events[event_key]);
        }

        this.translations = options['translations'];
    }

    dealCards () {
        this.players.forEach( p => p.cards = this.deck.splice(0, 6) );
        this.pile = this.deck.splice(0, 1);
    }

    attachEvent (key, fn) {
        if (Game.knownEvents.indexOf(key) === -1) throw 'bad argument: event name is unknown';
        if (typeof  fn !== 'function') throw 'bad argument: is not function';
        this.events[key] = fn;
    }

    triggerEvent () {
        let args = Array.prototype.slice.call(arguments);
        let callback = this.events[args.shift()];
        if (callback) callback.apply(this, args);
    }

    t (key) {
        let keys = ('translations.' + key).split('.');
        let value = _translation_finder(this, keys, 0);
        return value === undefined ? 'Missing text for key='+key : value;
    }

}

Game.knownEvents = ['move', 'beginTurn'];

var _translation_finder = (data, keys, i) => {
    if (typeof data !== 'object') return undefined;
    let value = data[keys[i]];
    i += 1;
    return i === keys.length ? value : _translation_finder(value, keys, i);
};

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

    finishMove (move, game) {
        //this.moves.push(move);
        //
        //// modify others
        //game.triggerEvent('move', move);
        //
        //// modify self
        //let new_state = move.applyTo(game.state);
        //let terminating = game.state.on_move !== new_state.on_move;
        //if (terminating) this.state = new_state;
        //
        //
        //if (terminating) {
        //    let next_player_i = this.player_i + 1;
        //    if (next_player_i === game.players.length) next_player_i = 0;
        //    game.triggerEvent('beginTurn', next_player_i);
        //}
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

