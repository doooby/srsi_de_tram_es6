//= require handlebars.runtime
//= require_directory ./templates


import {cards, Deck} from 'srsi/deck';
import Player from 'srsi/player';



var game = {
    players: [
        new Player('ondra'),
        new Player('karel')
    ],
    deck: Deck.shuffleNewDeck(),
    pile: [],

    listCards: function (cards) {
        return cards.map(c => c.transcription());
    }
};

game.players[0].cards = game.players[0].cards.concat(game.deck.cards.splice(0, 6));
game.players[1].cards = game.players[1].cards.concat(game.deck.cards.splice(0, 6));

window.cards = cards;
window.game = game;





function renderSection (section, title, cards, on_click) {
    let $html = $(HandlebarsTemplates['section']({
        section: section,
        title: title,
        cards: cards.map((c, i) => { return {index: i, text: c.text}; })
    }));

    if (typeof on_click === 'function') $html.on('click', '.card', on_click);
    return $html;
}

game.print = function () {
    let $container = $('#container');

    $container.append(renderSection('deck', 'Deck', game.deck.cards));
    $container.append(renderSection('pile', 'Pile', game.pile));

    game.players.forEach(player => {
        $container.append(renderSection('player', player.name, player.cards, (e) => {
            let card_index = $(e.target).data('card');
            console.log('Player ' + player.name + ' clicked on card ' + player.cards[card_index].text);
        }));
    });

};

game.print();