import {cards, Card} from './deck';

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
        let queer_suit = (typeof this.queer === 'number') ? this.queer : false;
        return queer_suit ? new Card(queer_suit | real.rank) : real;
    }

    playerWon () {
        return (this.onMovePlayerCards().length === 0 &&
            this.queer === null && this.attack === 0 && this.eights === 0);
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


export class Move {

    constructor () {
        this.valid = true;
    }

}

Move.parse = function (data) {
  if (typeof data === 'object') switch (data.m) {
      case 'draw':
          return new DrawMove();
          break;

      case 'lay':
          return new LayMove(data.card_i);
          break;

      case 'queer':
          return new QueerMove(data.suit);
          break;

      case 'no':
          return new NoMove();
          break;
  }
};

export class DrawMove extends Move {

    serialize () {
        return {m: 'draw'};
    }

    evaluate (context) {
        let state = context.state, pile = state.pileCard();

        if (state.continuance && state.queer === true) {
            this.error = 'queer';
            this.valid = false;
            return;
        }

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
        state = state.duplicate();
        state.continuance = false;
        state.queer = null;

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

        return state;
    }

}

export class LayMove extends Move {

    constructor (card_i) {
        super();
        this.card_i = card_i;
    }

    serialize () {
        return {m: 'lay', card_i: this.card_i};
    }

    evaluate (context) {
        let state = context.state;

        if (state.continuance && state.queer === true) {
            this.error = 'queer';
            this.valid = false;
            return;
        }

        let card = state.onMovePlayerCards()[this.card_i], pile = state.pileCard();

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
        state = state.duplicate();
        let card = state.players[state.on_move].splice(this.card_i, 1)[0];
        state.pile.push(card);

        let attack = state.attack, eights = state.eights;
        state.continuance = true;
        state.queer = null;
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

        return state;
    }

}

export class QueerMove extends Move {

    constructor (suit) {
        super();
        this.suit = suit;
    }

    serialize () {
        return {m: 'queer', suit: this.suit};
    }

    evaluate (context) {
        if (context.state.queer !== true) {
            this.error = 'no_queen';
            this.valid = false;
        }
    }

    applyTo (state) {
        state = state.duplicate();
        state.queer = this.suit;
        state.continuance = true;
        state.toNextPlayer();
        return state;
    }

}

export class NoMove extends Move {

    serialize () {
        return {m: 'no'};
    }

    evaluate (context) {
        let state = context.state, pile = state.pileCard();

        if (state.continuance && state.queer) {
            this.error = 'queer';
            this.valid = false;
            return;
        }

        if (state.continuance && pile.rank === cards.ACE) {
            return;
        }

        this.error = 'nothing';
        this.valid = false;
    }

    applyTo (state) {
        state = state.duplicate();
        state.continuance = false;
        state.toNextPlayer();
        return state;
    }

}