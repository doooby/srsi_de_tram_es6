//= require handlebars.runtime
//= require_directory ./templates

Handlebars.registerHelper('debug', function(value) {
    console.log('debug --- >', value);
});


var HB_APP = {

    printTurn: function (turn) {
        let $container = $('#container');
        $container.html('');

        $container.append(HandlebarsTemplates['section']({
            section: 'deck',
            title: turn.game.t('titles.deck'),
            cards: HB_APP.generateCardsHelper(turn, turn.game.deck, {visible: true})
        }));

        $container.append(HandlebarsTemplates['section']({
            section: 'pile',
            title: turn.game.t('titles.pile'),
            cards: HB_APP.generateCardsHelper(turn, turn.game.pile, {visible: true})
        }), true);

        turn.game.players.forEach((player, player_i) => {
            let on_turn = turn.player_i === player_i;
            let actions = turn.possibleActions();

            let $html = $(HandlebarsTemplates['section']({
                section: 'player',
                title: turn.game.t('titles.player') + ' - '+ player.name,
                cards: HB_APP.generateCardsHelper(turn, player.cards, {visible: true, global_can_lay: on_turn}),
                actions: (on_turn ? HB_APP.generateActionsHelper(turn, actions) : null)
            }));

            if (on_turn) $html.on('click', '[data-action]', HB_APP.playerMove.bind(HB_APP, turn));

            $container.append($html);
        });

        $container.append('<div id="printout"></div>');
        this.turn = turn;
    },

    generateCardsHelper: function (turn, cards, context) {
        let visible = !!context.visible;
        let global_can_lay = !!context.global_can_lay;
        return cards.map((c, i) => {
            if (visible) {
                let can_lay = global_can_lay;
                return {index: i, text: c.text, can_lay: can_lay, suit: c.suitText()};
            }
            else return {index: i, hidden: true};
        });
    },

    generateActionsHelper: function (turn, actions) {
        let buttons = [];

        actions.forEach(action => {
            let def = {action: action, text: turn.game.t('actions.'+action)};

            switch (action) {
                case 'draw':
                case 'stay':
                    buttons.push(def);
                    break;

                case 'devour':
                    def.text += ' ' + turn.stats.attack;
                    buttons.push(def);
                    break;

                case 'queer':
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
                //    move = turn.selectQueenSuit();
                break;

        }

        if (move.valid) {
            this.printTurn(turn.finishMove(move, turn.game));


        } else {
            this.printAlert(turn.game.t('bad_move.' + move.error));

        }
    }

};

window.HB_APP = HB_APP;