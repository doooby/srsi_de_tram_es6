//= require handlebars.runtime
//= require_directory ./templates

import {cards} from 'srsi/deck';

export default class HbApp {

    constructor (game, $container) {
        this.$c = $container;
        this.game = game;

        this.game.history = [];

        let instance = this;
        game.onBadMove = function (move) {
            instance.printAlert(this.t('bad_move.' + move.error));
        };
        game.localPlayer().gameStateChanged = function () {
            instance.printTurn(this.game.createTurn());
        };
    }

    printTurn (turn) {
        this.$c.html('');
        this.turn = turn;

        // print Deck
        this.$c.append(HandlebarsTemplates['section']({
            section: 'deck',
            title: turn.game.t('titles.deck'),
            cards: this.generateCardsHelper(turn.state.deck, {visible: this.debug})
        }));

        // print Pile
        this.$c.append(HandlebarsTemplates['section']({
            section: 'pile',
            title: turn.game.t('titles.pile'),
            cards: this.generateCardsHelper(turn.state.pile, {visible: true}),
            queer: (turn.state.suit ? cards.transcribe(turn.state.suit) : null)
        }));

        // print Players
        turn.state.players.forEach((player, player_i) => {
            let local_player = turn.game.player_i === player_i;
            let on_turn = turn.state.on_move === player_i;
            let possible_actions = turn.possibleActions();
            let $html = $(HandlebarsTemplates['section']({
                css_classes: [
                    'player',
                    (local_player ? 'local_player' : undefined),
                    (on_turn ? 'on_turn' : undefined)
                ].join(' '),
                title: turn.game.t('titles.player') + ' - '+ turn.game.players[player_i].name,
                cards: this.generateCardsHelper(turn.state.players[player_i], {visible: local_player || this.debug}),
                actions: (local_player && on_turn ? this.generateActionsHelper(turn, possible_actions) : null)
            }));
            if (on_turn) $html.on('click', '[data-action]', this.playerMove.bind(this, turn));
            this.$c.append($html);
        });

        this.$c.append('<div class="printout"></div>');
    }

    generateCardsHelper (_cards, context) {
        let visible = !!context.visible;
        return _cards.map((c, i) => {
            if (visible) {
                return {index: i, text: c.text, suit: cards.suitName(c.suit)};
            }
            else return {index: i, hidden: true};
        });
    }

    generateActionsHelper (turn, actions) {
        let buttons = [];
        actions.forEach(action => {
            switch (action) {
                case 'draw':
                case 'stay':
                    buttons.push({action: action, text: turn.game.t('actions.'+action)});
                    break;

                case 'devour':
                    buttons.push({action: action, text: turn.game.t('actions.'+action) + ' ' + turn.state.attack});
                    break;

                case 'queer':
                    cards.SUITS.forEach((suit) => {
                        buttons.push({action: action, args: suit, text: cards.transcribe(suit)});
                    });
                    break;
            }
        });
        return buttons;
    }

    clearAlert () {
        this.$c.find('.printout').html('');
    }

    printAlert (text) {
        this.$c.find('.printout').html(HandlebarsTemplates['alert']({text: text, type: 'alert'}));
    }

    playerMove (turn, e) {
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
        turn.makeAction(move);
    }

}