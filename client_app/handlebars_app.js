//= require handlebars.runtime
//= require_directory ./templates

import {cards} from 'srsi/deck';

export default class HbApp {

    constructor (game, $container) {
        this.$c = $container;

        this.g = game;
        let instance = this;
        game._on_bad_move = function (move) {
            instance.printAlert(this.t('bad_move.' + move.error));
        };
        game._on_modified = function () {
            instance.printTurn(this.createTurn());
        }
    }

    printTurn (turn) {
        this.$c.html('');

        // print Deck
        this.$c.append(HandlebarsTemplates['section']({
            section: 'deck',
            title: this.g.t('titles.deck'),
            cards: this.generateCardsHelper(turn.state.deck, {visible: true})
        }));

        // print Pile
        this.$c.append(HandlebarsTemplates['section']({
            section: 'pile',
            title: this.g.t('titles.pile'),
            cards: this.generateCardsHelper(turn.state.pile, {visible: true}),
            queer: (turn.state.suit ? cards.transcribe(turn.state.suit) : null)
        }));

        // print Players
        turn.state.players.forEach((player, player_i) => {
            let local_player = this.g.local_player === player_i;
            let on_turn = turn.state.on_move === player_i;
            let possible_actions = turn.possibleActions();
            let $html = $(HandlebarsTemplates['section']({
                css_classes: [
                    'player',
                    (local_player ? 'local_player' : undefined),
                    (on_turn ? 'on_turn' : undefined)
                ].join(' '),
                title: this.g.t('titles.player') + ' - '+ this.g.players[player_i].name,
                cards: this.generateCardsHelper(turn.state.players[player_i],
                    {
                        visible: local_player,
                        can_lay: on_turn && (possible_actions.indexOf('lay') !== -1)
                    }
                ),
                actions: (local_player && on_turn ? this.generateActionsHelper(turn, possible_actions) : null),
            }));
            if (on_turn) $html.on('click', '[data-action]', this.playerMove.bind(this, turn));
            this.$c.append($html);
        });

        this.$c.append('<div id="printout"></div>');
    }

    generateCardsHelper (_cards, context) {
        let visible = !!context.visible;
        let can_lay = !!context.can_lay;
        return _cards.map((c, i) => {
            if (visible) {
                return {index: i, text: c.text, can_lay: can_lay, suit: cards.suitName(c.suit)};
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
                    buttons.push({action: action, text: this.g.t('actions.'+action)});
                    break;

                case 'devour':
                    buttons.push({action: action, text: this.g.t('actions.'+action) + ' ' + turn.state.attack});
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
        this.g.move(move);
    }

}