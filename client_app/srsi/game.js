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

    isThereEnoughCards (needed) {
        let in_pile = this.pile.length - 1;
        if (needed >= this.deck.length && in_pile > 0) {
            this.deck = this.deck.concat(this.pile.splice(0, in_pile));
        }
        return this.deck.length >= needed;
    }

    t (key) {
        let keys = ('translations.' + key).split('.');
        let value = _translation_finder(this, keys, 0);
        return value === undefined ? 'Missing text for key='+key : value;
    }

}

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

    constructor (game, player_i, stats) {
        this.game = game;
        this.player_i = player_i;
        this.player = game.players[player_i];
        this.stats = (stats === undefined ? Turn.clearStats() : stats);
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
        let move = new DrawMove(this);
        move.process();
        return move;
    }

    doNothing () {
        let move = new NoMove(this);
        move.process();
        return move;
    }

    selectQueenSuit (suit) {
        if (suit === undefined) suit = null;
        return new QueerMove(this, suit);
    }

    finishTurn (move) {
        this.game.propagate(move);
        move.apply();
        if (!move.terminating()) {
            this.last_move = move;
            return this;

        } else {
            let next_player_i = this.player_i + 1;
            if (next_player_i === this.game.players.length) next_player_i = 0;
            return new Turn(this.game, next_player_i, Object.assign({}, this.stats));

        }
    }

    possibleActions () {
        if (this.last_move) {
            if (this.last_move.queer) return ['queer'];
            else if (this.last_move.eights) return ['draw', 'lay'];
            return [];
        }

        let last_is_ace = this.player.cards.length ===1 && this.player.cards[0].rank === cards.ACE;

        if (this.stats.continuance) {

            if (last_is_ace) return ['stay'];
            else {

                if (this.pileCard().rank === cards.ACE) return ['stay', 'lay'];
                if (this.stats.attack > 0) return ['devour', 'lay'];
            }

        } else {

            if (last_is_ace) return ['draw'];

        }

        return ['draw', 'lay'];
    }

    static clearStats () {
        return {
            continuance: false,
            attack: 0,
            suit: null,
            eights: 0
        };
    }

}

class Move {

    constructor (turn) {
        this.context = turn;
        this.valid = true;
    }

    errorMessage () {
        return this.context.game.t('bad_move.' + this.error);
    }

    terminating () {
        return true;
    }

}

class DrawMove extends Move {

    process () {
        let stats = this.context.stats;

        let pile = this.context.pileCard();
        if (stats.continuance && pile.rank === cards.ACE) {
            this.error = 'ace';
            this.valid = false;
            return;
        }

        this.to_take = 1;
        if (stats.attack > 0) this.to_take = stats.attack;
        else if (stats.eights > 0) this.to_take = stats.eights;
        if (!this.context.game.isThereEnoughCards(this.to_take)) {
            this.error = 'not_enough_cards';
            this.valid = false;
        }
    }

    apply () {
        let stats = this.context.stats;
        stats.continuance = false;

        let cards_to_take = this.context.game.deck.splice(0, this.to_take);
        this.context.player.cards = this.context.player.cards.concat(cards_to_take);

        if (stats.attack > 0) {
            stats.attack = 0;

        } else if (stats.eights > 0) {
            stats.eights = 0;
            stats.continuance = true;

        }
    }

}

class LayMove extends Move {

    constructor (turn, card_i) {
        super(turn);
        this.card_i = card_i;
    }

    process () {
        let card = this.context.player.cards[this.card_i];
        let pile = this.context.pileCard();

        if (this.context.stats.attack && (!card.isAttack() && card.rank !== cards.TEN)) {
            this.error = 'attack';
            this.valid = false;
            return;
        }

        if (this.context.stats.continuance && pile.rank === cards.ACE && card.rank !== cards.ACE) {
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

            if (card.rank === cards.ACE && this.context.player.cards.length === 1) {
                this.error = 'ace_end';
                this.valid = false;
                return;
            }

            if (card.rank === cards.QUEEN) {
                this.queer = true
            }

            if (card.rank === cards.EIGHT) {
                this.eights = true;
            }

            return;
        }

        this.error = 'no_match';
        this.valid = false;
    }

    terminating () {
        return this.queer !== true && this.eights !== true;
    }

    apply () {
        let card = this.context.player.cards.splice(this.card_i, 1)[0];
        this.context.game.pile.push(card);

        let stats = this.context.stats;
        stats.continuance = true;
        stats.suit = null;

        switch (card.rank) {

            case cards.SEVEN:
                stats.attack += 2;
                break;

            case cards.EIGHT:
                stats.eights += 1;
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

class QueerMove extends Move {

    constructor (turn, suit) {
        super(turn);
        this.suit = suit;
    }

    apply () {
        let stats = this.context.stats;
        stats.suit = this.suit;
        stats.continuance = true;
    }

}

class NoMove extends Move {

    process () {
        let pile = this.context.pileCard();

        if (this.context.stats.continuance && pile.rank === cards.ACE) {
            return;
        }

        this.error = 'nothing';
        this.valid = false;
    }

    apply () {
        this.context.stats.continuance = false;
    }

}