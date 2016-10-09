//= require handlebars.runtime
//= require_directory ./templates

import {cards} from 'srsi/deck';

Handlebars.registerHelper('debug', function(value) {
    console.log('debug --- >', value);
});


var HB_APP = {

    turns: [],

    printTurn: function (turn) {
        let $container = $('#container');
        $container.html('');

        // print Deck
        $container.append(HandlebarsTemplates['section']({
            section: 'deck',
            title: HB_APP.game.t('titles.deck'),
            cards: HB_APP.generateCardsHelper(turn.state.deck, {visible: true})
        }));

        // print Pile
        $container.append(HandlebarsTemplates['section']({
            section: 'pile',
            title: HB_APP.game.t('titles.pile'),
            cards: HB_APP.generateCardsHelper(turn.state.pile, {visible: true}),
            queer: (turn.state.suit ? cards.transcribe(turn.state.suit) : null)
        }));

        // print Players
        turn.state.players.forEach((player, player_i) => {
            let on_turn = turn.state.on_move === player_i;
            let possible_actions = turn.possibleActions();
            let $html = $(HandlebarsTemplates['section']({
                section: 'player',
                title: HB_APP.game.t('titles.player') + ' - '+ HB_APP.game.players[player_i].name,
                cards: HB_APP.generateCardsHelper(turn.state.players[player_i],
                    {visible: true, can_lay: on_turn && (possible_actions.indexOf('lay') !== -1)}),
                actions: (on_turn ? HB_APP.generateActionsHelper(turn, possible_actions) : null)
            }));
            if (on_turn) $html.on('click', '[data-action]', HB_APP.playerMove.bind(HB_APP, turn));
            $container.append($html);
        });

        $container.append('<div id="printout"></div>');
    },

    generateCardsHelper: function (_cards, context) {
        let visible = !!context.visible;
        let can_lay = !!context.can_lay;
        return _cards.map((c, i) => {
            if (visible) {
                return {index: i, text: c.text, can_lay: can_lay, suit: cards.suitName(c.suit)};
            }
            else return {index: i, hidden: true};
        });
    },

    generateActionsHelper: function (turn, actions) {
        let buttons = [];

        actions.forEach(action => {

            switch (action) {
                case 'draw':
                case 'stay':
                    buttons.push({action: action, text: HB_APP.game.t('actions.'+action)});
                    break;

                case 'devour':
                    buttons.push({action: action, text: HB_APP.game.t('actions.'+action) + ' ' + turn.state.attack});
                    break;

                case 'queer':
                    cards.SUITS.forEach((suit) => {
                        buttons.push({action: action, args: suit, text: cards.transcribe(suit)});
                    });
                    break;
            }
        });

        return buttons;
    },

    clearAlert: function () {
        $('#printout').html('');
    },

    printAlert: function (text) {
        $('#printout').html(HandlebarsTemplates['alert']({text: text, type: 'alert'}));
    },

    playerMove: function (turn, e) {
        this.clearAlert();
        let $el = $(e.target);
        let move;

        switch ($el.data('action')) {
            case 'draw':
            case 'devour':
                move = turn.draw();
                break;

            case 'stay':
                move = turn.doNothing();
                break;

            case 'lay':
                let card_i = $el.data('card');
                move = turn.lay(card_i);
                break;

            case 'queer':
                let suit = $el.data('args');
                move = turn.selectQueenSuit(suit);
                break;

        }
        HB_APP.game.move(move);
    }

};

window.HB_APP = HB_APP;