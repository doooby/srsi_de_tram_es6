import preact from 'preact';
import Board from './components/board';


const app = {

    renderRoot (root, game) {
        preact.render(<Board game={game}/>, root);
    }

};

export default app;