import preact from 'preact';
import Section from './section';

export default class Board extends preact.Component {

    constructor(props) {
        super(props);

        let game = this.props.game;

        game.localPlayer().gameStateChanged = () => {
            this.setState({turn: game.createTurn()});
        };
        this.state.turn = game.createTurn();

        game.localPlayer().playerEnded = function (winner) {
            this.setState({winner: winner === game.player_i});
        };

        game.onBadMove = (move) => {
          game.printout(game.t('bad_move.' + move.error));
        };

        game.printout = (text) => {
          this.setState({prinout: text});
        };
    }

    render (_, {turn, prinout, winner}) {
        return <div className="hb_app_container">
            <Section
                type="deck"
                turn={turn} />

            <Section
                type="pile"
                turn={turn} />

            {turn.game.players.map(player =>
                <Section
                    type={`player.${player.player_i}`}
                    turn={turn}
                    playable={winner === undefined && turn.game.player_i === player.player_i && player.player_i === turn.state.on_move} />
            )}

            <div class="printout">{prinout && <div class="callout alert">{prinout}</div>}</div>

            {winner !== undefined && (_ => {
                let text = winner ? 'you_won' : 'you_lost';
                return <div className="overlay"><h2>{turn.game.t(`texts.${text}`)}</h2></div>;
            })()}
        </div>;
    }

}