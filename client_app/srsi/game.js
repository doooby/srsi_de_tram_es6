import {cards, Card} from './deck';

export class Game {

    constructor (deck, players) {
        this.deck = deck;
        this.players = players;
        this.players.forEach( p => p.cards = deck.splice(0, 6) );
        this.pile = this.deck.splice(0, 1);
        this.clearStats();
    }

    move (move) {
        move.apply(this);
    }

    endTurn (player_i) {
        let next_player_i = player_i + 1;
        if (next_player_i === this.players.length) next_player_i = 0;
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

Game.statuses = ['continuance', 'attack', 'suit', 'eights'];

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

    constructor (game, player_i) {
        this.player_i = player_i;
        this.moves = [];
        this.setFromGame(game);

        this.game = game;
    }

    setFromGame (game) {
        this.deck = Object.assign([], game.deck);
        this.pile = Object.assign([], game.pile);
        this.players = game.players.map(p => p.cards);
        Game.statuses.forEach(s => this[s] = game[s]);
    }

    pileCard () {
        let real = this.game.pile[this.game.pile.length - 1];
        let suit_change = this.status('suit');
        if (suit_change !== null) {
            return new Card(suit_change | real.rank);
        } else {
            return real;
        }
    }

    cards_left () {
        return this.game.deck.length + this.game.pile.length - 1;
    }

    playerCards () {
        return this.game.players[this.player_i].cards;
    }

    status (key) {
        return this[key];
    }

    setStatus (key, value) {
        this[key] = value;
    }

    lastMove () {
        return this.moves[this.moves.length - 1];
    }

    lay (card_i) {
        let move = new LayMove(this.player_i, card_i);
        move.evaluate(this);
        return move;
    }

    draw () {
        let move = new DrawMove(this.player_i);
        move.evaluate(this);
        return move;
    }

    doNothing () {
        let move = new NoMove(this.player_i);
        move.evaluate(this);
        return move;
    }

    selectQueenSuit (suit) {
        if (suit === undefined) suit = null;
        return new QueerMove(this.player_i, suit);
    }

    finishMove (move, game) {
        this.moves.push(move);
        this.game.move(move);

        if (move.terminating()) {
            this.game.endTurn(this.player_i);
            return true;

        } else {
            this.setFromGame(game);
            return false;

        }
    }

    possibleActions () {
        let last_move = this.lastMove();
        if (last_move) {
            if (last_move.queer) return ['queer'];
            else if (last_move.eights) return ['draw', 'lay'];
            return [];
        }

        let player_cards = this.playerCards();
        let last_is_ace = player_cards.length === 1 && player_cards[0].rank === cards.ACE;

        if (this.status('continuance')) {

            if (last_is_ace) return ['stay'];
            else {

                if (this.pileCard().rank === cards.ACE) return ['stay', 'lay'];
                if (this.status('attack') > 0) return ['devour', 'lay'];
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

    constructor (player_i) {
        this.valid = true;
        this.player_i = player_i;
    }


    terminating () {
        return true;
    }

}

class DrawMove extends Move {

    evaluate (context) {
        let pile = context.pileCard();
        if (context.status('continuance') && pile.rank === cards.ACE) {
            this.error = 'ace';
            this.valid = false;
            return;
        }

        this.to_take = 1;
        let attack = context.status('attack'), eights = context.status('eights');
        if (attack > 0) this.to_take = attack;
        else if (eights > 0) {
            this.to_take = eights;
            this.continuance = true;
        }

        if (this.to_take > context.cards_left()) {
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

    constructor (player_i, card_i) {
        super(player_i);
        this.card_i = card_i;
    }

    evaluate (context) {
        let card = context.playerCards()[this.card_i];
        let pile = context.pileCard();

        if (context.status('attack') > 0 && (!card.isAttack() && card.rank !== cards.TEN)) {
            this.error = 'attack';
            this.valid = false;
            return;
        }

        if (context.status('continuance') && pile.rank === cards.ACE && card.rank !== cards.ACE) {
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

            if (card.rank === cards.ACE && context.playerCards().length === 1) {
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

    constructor (player_i, suit) {
        super(player_i);
        this.suit = suit;
    }

    apply (game) {
        game.clearStats();
        game.suit = this.suit;
        game.continuance = true;
    }

}

class NoMove extends Move {

    evaluate (context) {
        let pile = context.pileCard();

        if (context.status('continuance') && pile.rank === cards.ACE) {
            return;
        }

        this.error = 'nothing';
        this.valid = false;
    }

    apply (game) {
        game.clearStats();
    }

}