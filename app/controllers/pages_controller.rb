class PagesController < ApplicationController

  layout false

  EXAMPLES = {
      vs_ai_hbs: {caption: 'HBS: hra proti počítači', render_action: :render_hbs_example, apps_count: 1},
      '3_ai_hbs': {caption: 'HBS: AI vs AI vs AI test', render_action: :render_hbs_example, apps_count: 3},
      action_cable_hbs: {caption: 'HBS: test ActionCable', render_action: :render_hbs_example, apps_count: 2},
      srsi_preact_dev: {caption: 'Preact dev'}
  }.freeze

  def home

  end

  def examples
    example = params[:example]
    example_def = EXAMPLES[example.to_sym] || (return head 404)
    example_def = example_def.merge example: example

    if example_def[:render_action]
      send example_def[:render_action], example_def

    else
      render "pages/examples/#{example}", locals: example_def

    end
  end

  private

  def render_hbs_example definition
    render 'pages/examples/hbs_example', locals: definition
  end

end