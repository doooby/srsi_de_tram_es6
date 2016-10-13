//= require action_cable

import GameChannel from './game_channel';

const consumer = ActionCable.createConsumer();

const channels_map = {
  game: GameChannel
};

const cable = {
    _consumer: consumer,

    openChannel: function (channel_name, ...args) {
        let constructor = channels_map[channel_name];
        return (constructor === undefined) ? null : constructor(consumer, ...args);
    }

};

export default cable;