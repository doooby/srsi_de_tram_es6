class Card {

    constructor (id) {
        this.id = id;
    }

    suit () { return this.id & 0xf0; }
    rank () { return this.id & 0x0f; }

    transcription () {
        return transcriptions[this.suit()] + transcriptions[this.rank()];
    }

}

var deck = [];

// suits
deck.HEARTS =  0x10;
deck.BELLS = 0x20;
deck.ACORNS = 0x30;
deck.LEAVES = 0x40;

// ranks
deck.SEVEN = 0x1;
deck.EIGHT = 0x2;
deck.NINE = 0x3;
deck.TEN = 0x4;
deck.JACK = 0x5;
deck.QUEEN = 0x6;
deck.KING = 0x7;
deck.ACE = 0x8;

// dragon
deck.DRAGON = 0x0;

// the whole deck
deck.SUITS = Object.freeze([deck.HEARTS, deck.BELLS, deck.ACORNS, deck.LEAVES]);
deck.RANKS = Object.freeze([deck.SEVEN, deck.EIGHT, deck.NINE, deck.TEN, deck.JACK,
    deck.QUEEN, deck.KING, deck.ACE]);
deck.push(new Card(deck.DRAGON));
deck.SUITS.forEach(function (suit) {
    deck.RANKS.forEach(function (rank) {
        deck.push(new Card(suit | rank));
    });
});
Object.freeze(deck);

var transcriptions = {};
transcriptions[deck.HEARTS] = "\u2665";
transcriptions[deck.BELLS] = "\u2666";
transcriptions[deck.ACORNS] = "\u2663";
transcriptions[deck.LEAVES] = "\u2660";
transcriptions[deck.SEVEN] = "\u2166";
transcriptions[deck.EIGHT] = "\u2167";
transcriptions[deck.NINE] = "\u2168";
transcriptions[deck.TEN] = "\u2169";
transcriptions[deck.JACK] = "J";
transcriptions[deck.QUEEN] = "Q";
transcriptions[deck.KING] = "K";
transcriptions[deck.ACE] = "A";
transcriptions[deck.DRAGON] = "D";

export {deck as default};