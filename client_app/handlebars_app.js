//= require handlebars.runtime
//= require_directory ./templates

var HB_APP = {

    print: function (game) {
        let $container = $('#container');

        $container.append(renderSection('deck', 'Deck', game.deck.cards));
        $container.append(renderSection('pile', 'Pile', game.pile));

        game.players.forEach(player => {
            $container.append(renderSection('player', player.name, player.cards, (e) => {
                let card_index = $(e.target).data('card');
                console.log('Player ' + player.name + ' clicked on card ' + player.cards[card_index].text);
            }));
        });
    },

    renderSection: function (section, title, cards, on_click) {
        let $html = $(HandlebarsTemplates['section']({
            section: section,
            title: title,
            cards: cards.map((c, i) => { return {index: i, text: c.text}; })
        }));

        if (typeof on_click === 'function') $html.on('click', '.card', on_click);
        return $html;
    }
};