export default class Game {

}

export class Player {

    constructor (name, game) {
        this.name = name;
        this.game = game;
        this.cards = [];
    }

}

export class Turn {

    constructor (game, player_i, stats) {
        this.game = game;
        this.player_i = player_i;
        //this.moves = [];
        this.stats = stats;
    }

    canLay (card_i) {
        return true;
    }

    canStrike () {
        return true;
    }

    canLayMore () {
        return false;
    }

    lay (card_i) {
        let card = this.game.players[this.player_i].cards.splice(card_i, 1)[0];
        this.game.pile.push(card);
    }

    draw () {
        let card = this.game.deck.splice(0, 1)[0];
        this.game.players[this.player_i].cards.push(card);
    }

    strike () {

    }

    nextTurn () {
        let next_player_i = this.player_i + 1;
        if (next_player_i === this.game.players.length) next_player_i = 0;
        return new Turn(this.game, next_player_i, Turn.clearStats());
    }

    static clearStats () {
        return {};
    }

}

class Move {



}