class Card {

    constructor (id) {
        this.id = id;
        this.text = transcriptions[this.suit()] + transcriptions[this.rank()];
    }

    suit () { return this.id & 0xf0; }
    rank () { return this.id & 0x0f; }

}

let transcriptions = {};
let cards = [];

// suits
cards.HEARTS =  0x10;
cards.BELLS = 0x20;
cards.ACORNS = 0x30;
cards.LEAVES = 0x40;

// ranks
cards.SEVEN = 0x1;
cards.EIGHT = 0x2;
cards.NINE = 0x3;
cards.TEN = 0x4;
cards.JACK = 0x5;
cards.QUEEN = 0x6;
cards.KING = 0x7;
cards.ACE = 0x8;

// dragon
cards.DRAGON = 0x0;

transcriptions[cards.HEARTS] = "\u2665";
transcriptions[cards.BELLS] = "\u2666";
transcriptions[cards.ACORNS] = "\u2663";
transcriptions[cards.LEAVES] = "\u2660";
transcriptions[cards.SEVEN] = "\u2166";
transcriptions[cards.EIGHT] = "\u2167";
transcriptions[cards.NINE] = "\u2168";
transcriptions[cards.TEN] = "\u2169";
transcriptions[cards.JACK] = "J";
transcriptions[cards.QUEEN] = "Q";
transcriptions[cards.KING] = "K";
transcriptions[cards.ACE] = "A";
transcriptions[cards.DRAGON] = "D";

// the whole cards
cards.SUITS = Object.freeze([cards.HEARTS, cards.BELLS, cards.ACORNS, cards.LEAVES]);
cards.RANKS = Object.freeze([cards.SEVEN, cards.EIGHT, cards.NINE, cards.TEN, cards.JACK,
    cards.QUEEN, cards.KING, cards.ACE]);
cards.push(new Card(cards.DRAGON));
cards.SUITS.forEach(function (suit) {
    cards.RANKS.forEach(function (rank) {
        cards.push(new Card(suit | rank));
    });
});

Object.freeze(cards);
export {cards};

export class Deck {

    constructor (cards) {
        this.cards = cards;
    }

    static shuffleNewDeck () {
        let i = 0, j = 0, temp = null, array = cards.slice();
        for (i = array.length - 1; i > 0; i -= 1) {
            j = Math.floor(Math.random() * (i + 1));
            temp = array[i];
            array[i] = array[j];
            array[j] = temp
        }
        return new Deck(array);
    }

    //take (count) {
    //    if (count+1 > this.cards.length) {
    //        throw 'došel balík';
    //        //this.cards = this.cards.concat(SDT.game.pile.takeCards());
    //    }
    //    else return this.cards.splice(0, count);
    //}
}