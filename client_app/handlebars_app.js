//= require handlebars.runtime
//= require_directory ./templates



var HB_APP = {

    print: function (turn) {
        let $container = $('#container');
        $container.html('');

        $container.append(HB_APP.renderSection({
            section: 'deck',
            title: 'Deck',
            cards: turn.game.deck
        }));

        $container.append(HB_APP.renderSection({
            section: 'pile',
            title: 'Pile',
            cards: turn.game.pile
        }));

        turn.game.players.forEach((player, player_i) => {
            let on_turn = turn.player_i === player_i;
            let $html = HB_APP.renderSection({
                section: 'player',
                title: player.name,
                on_turn: on_turn,
                cards: player.cards
            });

            if (on_turn) {
                $html.on('click', '.card', HB_APP.playerLays.bind(null, turn));
                $html.on('click', '[data-action=draw]', HB_APP.playerDraws.bind(null, turn));
                $html.on('click', '[data-action=strike]', HB_APP.playerStrikes.bind(null, turn));

            }

            $container.append($html);
        });

        $container.append('<div id="printout"></div>')
    },

    clearAlert: function () {
        $('#printout').html('');
    },

    printAlert: function (text) {
        $('#printout').html(HandlebarsTemplates['alert']({text: text}));
    },

    renderSection: function (helper) {
        helper.cards = helper.cards.map((c, i) => { return {index: i, text: c.text}; });
        return $(HandlebarsTemplates['section'](helper));
    },

    playerLays: function (turn, e) {
        let card_i = $(e.target).data('card');
        //let player = turn.game.players[turn.player_i];
        //console.log('Player ' + player.name + ' clicked on card ' + player.cards[card_index].text);

        let can_lay = turn.canLay(card_i);
        if (can_lay === true) {
            HB_APP.clearAlert();
            turn.lay(card_i);
            if (!turn.canLayMore()) {
                let next = turn.nextTurn();
                HB_APP.print(next);
            }

        } else {
            HB_APP.printAlert(can_lay);

        }
    },

    playerDraws: function (turn, e) {
        turn.draw();
        let next = turn.nextTurn();
        HB_APP.print(next);
    },

    playerStrikes: function (turn, e) {
        let can_strike = turn.canStrike();
        if (can_strike === true) {
            turn.strike();
            let next = turn.nextTurn();
            HB_APP.print(next);

        }
        else {
            HB_APP.printAlert(can_strike);

        }
    }
};

window.HB_APP = HB_APP;