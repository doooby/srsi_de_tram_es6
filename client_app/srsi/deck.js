export class Card {

    constructor (id) {
        this.suit = id & 0xf0;
        this.rank = id & 0x0f;
        this.text = cards.transcribe(this.suit) + cards.transcribe(this.rank);
    }

    id () { return this.suit | this.rank; }

    isAttack () {
        return this.rank === cards.SEVEN ||
            this.rank === cards.KING ||
            this.rank === cards.DRAGON;
    }

    suitText () {
        return cards.suitName(this.suit);
    }
}

let transcriptions = {}, cards = [], suit_names = {};

// suits
cards.HEARTS = 0x10;  // 16 ♥
cards.BELLS  = 0x20;  // 32 ♦
cards.ACORNS = 0x30;  // 48 ♣
cards.LEAVES = 0x40;  // 64 ♠

// ranks
cards.SEVEN  = 0x7;
cards.EIGHT  = 0x8;
cards.NINE   = 0x9;
cards.TEN    = 0xA;
cards.JACK   = 0xB;
cards.QUEEN  = 0xC;
cards.KING   = 0xD;
cards.ACE    = 0xE;

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

suit_names[cards.HEARTS] = 'hearts';
suit_names[cards.BELLS] = 'bells';
suit_names[cards.ACORNS] = 'acorn';
suit_names[cards.LEAVES] = 'leaves';

cards.shuffleNewDeck = function () {
    let i = 0, j = 0, temp = null, array = cards.slice();
    for (i = array.length - 1; i > 0; i -= 1) {
        j = Math.floor(Math.random() * (i + 1));
        temp = array[i];
        array[i] = array[j];
        array[j] = temp
    }
    return array;
};

cards.create = function (suit, rank) {
    return new Card(suit | rank);
};

cards.transcribe = function (value) {
  return transcriptions[value];
};

cards.suitName = function (suit) {
  return suit_names[suit];
};

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



//export class Deck {
//
//    constructor (cards) {
//        this.cards = cards;
//    }
//
//    static shuffleNewDeck () {
//        let i = 0, j = 0, temp = null, array = cards.slice();
//        for (i = array.length - 1; i > 0; i -= 1) {
//            j = Math.floor(Math.random() * (i + 1));
//            temp = array[i];
//            array[i] = array[j];
//            array[j] = temp
//        }
//        return new Deck(array);
//    }
//
//    //take (count) {
//    //    if (count+1 > this.cards.length) {
//    //        throw 'došel balík';
//    //        //this.cards = this.cards.concat(SDT.game.pile.takeCards());
//    //    }
//    //    else return this.cards.splice(0, count);
//    //}
//}