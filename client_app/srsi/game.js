import {cards, Card} from './deck';

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

Game.statuses = ['continuance', 'attack', 'queer', 'eights'];
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

export class GameState {

    constructor (state) {
        this.deck = Object.assign([], state.deck);
        this.pile = Object.assign([], state.pile);
        this.players = state.players.map(p => Object.assign([], p));
        this.on_move = state.on_move;
        this.continuance = state.continuance;
        this.attack = state.attack;
        this.eights = state.eights;
        this.queer = state.queer;
    }

    duplicate () {
        return new GameState(this);
    }

    toNextPlayer () {
        let next = this.on_move + 1;
        if (next >= this.players.length) next = 0;
        this.on_move = next;
    }

    cardsLeftToTake () {
        return this.deck.length + this.pile.length - 1;
    }

    onMovePlayerCards () {
        return this.players[this.on_move];
    }

    pileCard () {
        let real = this.pile[this.pile.length - 1];
        return this.queer === null ? real : new Card(this.suit | real.rank);
    }

}

GameState.empty = new GameState({
    deck: [],
    pile: [],
    players: [],
    on_move: -1,
    continuance: false,
    attack: 0,
    eights: 0,
    queer: null
});

GameState.at = function (options) {
    let state = GameState.empty.duplicate();
    if (typeof options !== 'object') return state;

    ['deck', 'pile', 'players', 'continuance', 'attack', 'queer', 'eights'].forEach(a => {
       if (options[a]) state[a] = options[a];
    });

    let on_move = options['on_move'];
    if (on_move === undefined && state.players.length > 0) on_move = 0;
    if (on_move !== undefined) state.on_move = on_move;

    return state;
};

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

class Move {

    constructor () {
        this.valid = true;
    }

    serialize () {
        return {move: 'nope'};
    }
}

export class DrawMove extends Move {

    evaluate (context) {
        let state = context.state, pile = state.pileCard();
        if (state.continuance && pile.rank === cards.ACE) {
            this.error = 'ace';
            this.valid = false;
            return;
        }

        let attack = state.attack, eights = state.eights, to_take = 1;
        if (attack > 0) to_take = attack;
        else if (eights > 0) to_take = eights;

        if (to_take > state.cardsLeftToTake()) {
            this.error = 'not_enough_cards';
            this.valid = false;
        }
    }

    applyTo (state) {
        state.continuance = false;

        let attack = state.attack, eights = state.eights, to_take = 1;
        if (attack > 0) {
            to_take = attack;
            state.attack = 0;
        }
        else if (eights > 0) {
            to_take = eights;
            state.continuance = true;
            state.eights = 0;
        }

        let left_in_pile = state.pile.length - 1;
        if (to_take >= state.deck.length && left_in_pile > 0) {
            state.deck = state.deck.concat(state.pile.splice(0, left_in_pile));
        }
        state.players[state.on_move] = state.players[state.on_move].concat(state.deck.splice(0, to_take));
        state.toNextPlayer();
    }

}

export class LayMove extends Move {

    constructor (card_i) {
        super();
        this.card_i = card_i;
    }

    evaluate (context) {
        let state = context.state, card = state.onMovePlayerCards()[this.card_i], pile = state.pileCard();

        if (state.attack > 0 && (!card.isAttack() && card.rank !== cards.TEN)) {
            this.error = 'attack';
            this.valid = false;
            return;
        }

        if (state.continuance && pile.rank === cards.ACE && card.rank !== cards.ACE) {
            this.error = 'ace';
            this.valid = false;
            return;
        }

        if (pile.rank === cards.TEN && card.isAttack()) {
            this.error = 'attack_on_ten';
            this.valid = false;
            return;
        }
        
        if (card.suit === pile.suit || card.rank === pile.rank || pile.suit === cards.DRAGON ||
            card.suit === cards.DRAGON || card.rank === cards.JACK) {

            if (card.rank === cards.ACE && state.onMovePlayerCards().length === 1) {
                this.error = 'ace_end';
                this.valid = false;
                return;
            }

            else if (state.eights > 0 && card.rank !== cards.EIGHT) {
                this.error = 'eights';
                this.valid = false;

            }

            return;
        }

        this.error = 'no_match';
        this.valid = false;
    }

    applyTo (state) {
        let card = state.players[state.on_move].splice(this.card_i, 1)[0];
        state.pile.push(card);

        let attack = state.attack, eights = state.eights;
        state.continuance = true;
        let end_of_move = true;

        switch (card.rank) {

            case cards.SEVEN:
                state.attack = attack + 2;
                break;

            case cards.EIGHT:
                state.eights = eights + 1;
                end_of_move = false;
                break;

            case cards.TEN:
                state.attack = 0;
                break;

            case cards.QUEEN:
                state.queer = true;
                end_of_move = false;
                break;

            case cards.KING:
                state.attack = attack + (card.suit === cards.LEAVES ? 4 : 0);
                break;

            case cards.DRAGON:
                state.attack = attack + 5;
                break;
        }
        if (end_of_move) state.toNextPlayer();
    }

}

export class QueerMove extends Move {

    constructor (suit) {
        super();
        this.suit = suit;
    }

    evaluate (context) {
        if (context.state.queer !== true) {
            this.error = 'no_queen';
            this.valid = false;
        }
    }

    applyTo (state) {
        state.queer = this.suit;
        state.continuance = true;
        state.toNextPlayer();
    }

}

export class NoMove extends Move {

    evaluate (context) {
        let state = context.state, pile = state.pileCard();

        if (state.continuance && pile.rank === cards.ACE) {
            return;
        }

        this.error = 'nothing';
        this.valid = false;
    }

    applyTo (state) {
        state.continuance = false;
        state.toNextPlayer();
    }

}