module ApplicationCable
  class Channel < ActionCable::Channel::Base

    attr_reader :stream_name

    def subscribed
      build_stream_name
      unless stream_name
        Rails.logger.debug "#{self.class.name} couldn't build valid stream name"
        return
      end

      stream_from stream_name
    end

    private

    def build_stream_name; end

  end
end
