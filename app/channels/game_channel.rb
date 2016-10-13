# Be sure to restart your server when you modify this file. Action Cable runs in a loop that does not support auto reloading.
class GameChannel < ApplicationCable::Channel

  def subscribed
    super

  end


  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def receive(data)
    ActionCable.server.broadcast stream_name, data
  end


  private

  def build_stream_name
    @stream_name = "g#{params[:board_id]}"
  end

end
