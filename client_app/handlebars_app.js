//= require handlebars.runtime
//= require_directory ./templates

import {cards} from 'srsi/deck';
import {Turn} from 'srsi/game';

Handlebars.registerHelper('debug', function(value) {
    console.log('debug --- >', value);
});


var HB_APP = {

    playGame: function (game) {
        HB_APP.game = game;

        game.dealCards();

        game.attachEvent('move', function (move) {
            if (!move.terminating()) HB_APP.printTurn(this, HB_APP.turn);
        });

        game.attachEvent('beginTurn', function (player_i) {
            HB_APP.printTurn(this, new Turn(this, player_i));
        });

        HB_APP.printTurn(game, new Turn(game, 0));
    },

    printTurn: function (game, turn) {
        this.turn = turn;

        let $container = $('#container');
        $container.html('');

        $container.append(HandlebarsTemplates['section']({
            section: 'deck',
            title: game.t('titles.deck'),
            cards: HB_APP.generateCardsHelper(turn, turn.deck, {visible: true})
        }));

        $container.append(HandlebarsTemplates['section']({
            section: 'pile',
            title: game.t('titles.pile'),
            cards: HB_APP.generateCardsHelper(turn, turn.pile, {visible: true}),
            queer: (turn.suit ? cards.transcribe(turn.suit) : null)
        }));

        game.players.forEach((player, player_i) => {
            let on_turn = turn.player_i === player_i;
            let actions = turn.possibleActions();

            let $html = $(HandlebarsTemplates['section']({
                section: 'player',
                title: game.t('titles.player') + ' - '+ player.name,
                cards: HB_APP.generateCardsHelper(turn, turn.players[player_i], {visible: true, global_can_lay: on_turn}),
                actions: (on_turn ? HB_APP.generateActionsHelper(game, turn, actions) : null)
            }));

            if (on_turn) $html.on('click', '[data-action]', HB_APP.playerMove.bind(HB_APP, game, turn));

            $container.append($html);
        });

        $container.append('<div id="printout"></div>');

    },

    generateCardsHelper: function (turn, _cards, context) {
        let visible = !!context.visible;
        let global_can_lay = !!context.global_can_lay;
        return _cards.map((c, i) => {
            if (visible) {
                let can_lay = global_can_lay;
                return {index: i, text: c.text, can_lay: can_lay, suit: cards.suitName(c.suit)};
            }
            else return {index: i, hidden: true};
        });
    },

    generateActionsHelper: function (game, turn, actions) {
        let buttons = [];

        actions.forEach(action => {

            switch (action) {
                case 'draw':
                case 'stay':
                    buttons.push({action: action, text: game.t('actions.'+action)});
                    break;

                case 'devour':
                    buttons.push({action: action, text: game.t('actions.'+action) + ' ' + turn.attack});
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

    playerMove: function (game, turn, e) {
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

        if (move.valid) {
            turn.finishMove(move, game);

        } else {
            this.printAlert(game.t('bad_move.' + move.error));

        }
    }

};

window.HB_APP = HB_APP;