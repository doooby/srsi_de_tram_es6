//= require handlebars.runtime
//= require_directory ./templates

Handlebars.registerHelper('debug', function(value) {
    console.log('debug --- >', value);
});


var HB_APP = {

    playGame: function (game) {
        HB_APP.game = game;
        game.dealCards();

        game.events = {

            move: function (move) {
                if (!move.terminating()) HB_APP.printTurn(this, HB_APP.turn);
            },

            beginTurn: function (player_i) {
                HB_APP.printTurn(this, this.createTurn(player_i));
            }
        };

        HB_APP.printTurn(game, game.createTurn());
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
            cards: HB_APP.generateCardsHelper(turn, turn.pile, {visible: true})
        }), true);

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

    generateActionsHelper: function (game, turn, actions) {
        let buttons = [];

        actions.forEach(action => {
            let def = {action: action, text: game.t('actions.'+action)};

            switch (action) {
                case 'draw':
                case 'stay':
                    buttons.push(def);
                    break;

                case 'devour':
                    def.text += ' ' + turn.attack;
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
                //    move = turn.selectQueenSuit();
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