# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = '1.0'

# Add additional assets to the asset load path
# Rails.application.config.assets.paths << Emoji.images_path
Rails.application.config.assets.paths << Rails.root.join('client_app')

# Precompile additional assets.
# application.js, application.css, and all non-JS/CSS in app/assets folder are already added.
# Rails.application.config.assets.precompile += %w( search.js )
# Rails.application.config.assets.precompile += %w( client_app.js )
Rails.application.config.assets.precompile << /^examples\/[\d\w]+\.js$/

Rails.application.config.assets.configure do |env|
  Sprockets::Commoner::Processor.configure env,
      # include, exclude, and babel_exclude patterns can be path prefixes or regexes.
      # Explicitely list paths to include. The default is `[env.root]`

      include: ["#{env.root}/client_app"],
      # List files to ignore and not process require calls or apply any Babel transforms to. Default is ['vendor/bundle'].
      exclude: ['app/assets/javascripts']
      # Anything listed in babel_exclude has its require calls resolved, but no transforms listed in .babelrcs applied.
      # Default is [/node_modules/]
      # babel_exclude: [/node_modules/]
end