import {cards, Card} from './deck';

export class Game {

    constructor (deck, players) {
        this.deck = deck;
        this.players = players;
        this.players.forEach( p => p.cards = deck.splice(0, 6) );
        this.pile = this.deck.splice(0, 1);
    }

    propagate (move) {

    }


}

export class Player {

    constructor (name) {
        this.name = name;
    }

}

export class Turn {

    constructor (game, player_i, stats) {
        this.game = game;
        this.player_i = player_i;
        this.stats = (stats === undefined ? Turn.clearStats() : stats);
    }

    playersHand () {
        return this.game.players[this.player_i].cards;
    }

    pileCard () {
        let real = this.game.pile[this.game.pile.length - 1];
        if (this.stats.suit !== null) {
            return new Card(this.stats.suit | real.rank);
        } else {
            return real;
        }
    }

    lay (card_i) {
        let move = new LayMove(this, card_i);
        move.process();
        return move;
    }

    draw () {
        //let card = this.game.deck.splice(0, 1)[0];
        //this.game.players[this.player_i].cards.push(card);
    }

    doNothing () {
        let move = new NoMove(this);
        move.process();
        return move;
    }

    selectQueenSuit (suit) {
        return new SuitChangeMove(this, suit);
    }

    finishTurn (move) {
        this.game.propagate(move);
        move.apply();
        if (!move.terminating()) {
            return this;

        } else {
            let next_player_i = this.player_i + 1;
            if (next_player_i === this.game.players.length) next_player_i = 0;
            return new Turn(this.game, next_player_i, Object.assign({}, this.stats));

        }
    }

    static clearStats () {
        return {
            continuance: false,
            attack: 0,
            suit: null
        };
    }

}

class Move {

    constructor (turn) {
        this.context = turn;
        this.valid = true;
    }

    errorMessage () {
        this.context.t(this.error);
    }

    terminating () {
        return true;
    }

}

class LayMove extends Move {

    constructor (turn, card_i) {
        super(turn);
        this.card_i = card_i;
    }

    process () {
        let card = this.context.playersHand()[this.card_i];
        let pile = this.context.pileCard();

        if (card.rank === cards.QUEEN) {
            this.not_terminating = true;
        }

        if (this.context.stats.attack && (!card.isAttack() && card.rank !== cards.TEN)) {
            this.error = 'bad_move.attack';
            this.valid = false;
            return;
        }

        if (card.rank === cards.JACK) {
            return;
        }

        if (this.context.stats.continuance && pile.rank === cards.ACE && card.rank !== cards.ACE) {
            this.error = 'bad_move.ace';
            this.valid = false;
            return;
        }

        if (pile.rank === cards.TEN && card.isAttack()) {
            this.error = 'bad_move.attack_on_ten';
            this.valid = false;
            return;
        }

        if (card.suit === pile.suit || card.rank === pile.rank || card.suit === cards.DRAGON) {
            return;
        }

        this.error = 'bad_move.no_match';
        this.valid = false;
    }

    terminating () {
        return !(this.not_terminating === true);
    }

    apply () {
        let card = this.context.playersHand().splice(this.card_i, 1)[0];
        this.context.game.pile.push(card);

        let stats = this.context.stats;
        stats.continuance = true;
        stats.suit = null;

        switch (card.rank) {

            case cards.SEVEN:
                stats.attack += 2;
                break;

            case cards.TEN:
                stats.attack = 0;
                break;

            case cards.KING:
                if (card.suit === cards.LEAVES) stats.attack += 4;
                break;

            case cards.DRAGON:
                stats.attack += 5;
                break;
        }


    }

}

class SuitChangeMove extends Move {

    constructor (turn, suit) {
        super(turn);
        this.suit = suit;
    }

    apply () {
        this.context.stats.suit = this.suit;
    }

}

class NoMove extends Move {

    process () {

    }

    apply () {

    }

}