
export default function GameChannel (consumer, board_id, events) {

    //events


    return consumer.subscriptions.create({
        channel: 'GameChannel',
        board_id: board_id
    }, events);

};