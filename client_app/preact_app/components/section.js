import preact from 'preact';
import {cards} from '../../srsi/deck';

export default class Section extends preact.Component {

    constructor () {
        super();
    }

    render ({type, turn, visible=true, playable=false}, {}) {
        let context = this.parse_type();

        let section_css = [
            'section',
            context.section_css,
            (turn.game.player_i === context.player && 'local_player'),
            (playable && 'on_turn')
        ].filter(c => c).join(' ');

        return <div className={section_css}>
            <span className="title">{context.title}</span>
            {playable && this.build_actions()}
            <br/>
            {this.build_cards(context.cards, visible, playable)}
            {context.queer_pile}
        </div>;
    }

    playerAction (move, args) {
        let turn = this.props.turn;
        turn.game.printout(null);
        if (!this.props.playable) return;

        switch (move) {
            case 'draw':
            case 'devour':
                move = turn.draw();
                break;

            case 'stay':
                move = turn.doNothing();
                break;

            case 'lay':
                move = turn.lay(args);
                break;

            case 'queer':
                move = turn.selectQueenSuit(args);
                break;

        }
        turn.makeAction(move);
    }

    parse_type () {
        let type = this.props.type;
        let turn = this.props.turn;
        let context = {};

        let type_arr = type.split('.');
        if (type_arr[0] === 'player') {
            context.player = Number(type_arr[1]);
            context.title = `${turn.game.t('titles.player')} - ${turn.game.players[context.player].name}`;
            context.section_css = 'player';
            context.cards = turn.state.players[context.player];

        } else {
            context.title = turn.game.t(`titles.${type}`);
            context.section_css = type;
            context.cards = turn.state[type];

        }

        if (type === 'pile' && typeof turn.state.queer === 'number') {
            let suit = cards.suitName(turn.state.queer);
            let text = cards.transcribe(turn.state.queer);
            context.queer_pile = <span class={`card ${suit}`}>{text}</span>
        }

        return context;
    }

    build_cards (list, visible, playable) {
        return list.map((card, i) => {
            let css_classes = [
                'card',
                (visible && cards.suitName(card.suit)),
                (i === 0 && 'first'),
                (i === list.length - 1 && 'last'),
                (!visible && 'hidden')
            ];
            return <span
                className={css_classes.filter(c => c).join(' ')}
                onClick={playable && this.playerAction.bind(this, 'lay', i)}>
                    {visible && card.text}
                </span>;
        });
    }

    build_actions () {
        let turn = this.props.turn;
        let possible = turn.possibleActions();

        let buttons = [];
        possible.forEach(action => {
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

        return buttons.map(def =>
            <button type="button" class="button secondary"
                    onClick={this.playerAction.bind(this, def.action, def.args)}>{def.text}</button>
        );
    }

}