import {cards, Card} from './deck';

export class Game {

    constructor (deck, players) {
        this.deck = deck;
        this.players = players;
        this.players.forEach( p => p.cards = deck.splice(0, 6) );
        this.pile = this.deck.splice(0, 1);
        this.clearStats();
    }

    propagate (move) {

    }

    clearStats () {
        this.continuance = false;
        this.attack = 0;
        this.eights = 0;
        this.suit = null;
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
        this.cards_left = game.deck.length + game.pile.length - 1;

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
        move.apply(this.game);
        if (!move.terminating()) {
            this.last_move = move;
            ['continuance', 'attack', 'suit', 'eights'].forEach(a => {
                this.stats[a] = this.game[a];
            });
            return this;

        } else {
            let next_player_i = this.player_i + 1;
            if (next_player_i === this.game.players.length) next_player_i = 0;
            let new_stats = {};
            ['continuance', 'attack', 'suit', 'eights'].forEach(a => {
                new_stats[a] = this.game[a];
            });
            return new Turn(this.game, next_player_i, new_stats);

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
        this.player_i = turn.player_i;
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
        else if (stats.eights > 0) {
            this.to_take = stats.eights;
            this.continuance = true;
        }

        if (this.to_take > this.context.cards_left) {
            this.error = 'not_enough_cards';
            this.valid = false;
        }
    }

    apply (game) {
        let left_in_pile = game.pile.length - 1;
        if (this.to_take >= game.deck.length && left_in_pile > 0) {
            game.deck = game.deck.concat(game.pile.splice(0, left_in_pile));
        }

        let player = game.players[this.player_i];
        player.cards = player.cards.concat(game.deck.splice(0, this.to_take));

        game.clearStats();
        if (this.continuance) game.continuance = true;
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

    apply (game) {
        let card = game.players[this.player_i].cards.splice(this.card_i, 1)[0];
        game.pile.push(card);

        let attack = game.attack, eights = game.eights;
        game.clearStats();
        game.continuance = true;

        switch (card.rank) {

            case cards.SEVEN:
                game.attack = attack + 2;
                break;

            case cards.EIGHT:
                game.eights = eights + 1;
                break;

            case cards.TEN:
                game.attack = 0;
                break;

            case cards.KING:
                game.attack = attack + (card.suit === cards.LEAVES ? 4 : 0);
                break;

            case cards.DRAGON:
                game.attack = attack + 5;
                break;
        }
    }

}

class QueerMove extends Move {

    constructor (turn, suit) {
        super(turn);
        this.suit = suit;
    }

    apply (game) {
        game.clearStats();
        game.suit = this.suit;
        game.continuance = true;
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