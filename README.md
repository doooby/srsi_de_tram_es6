Nope. still in dev/testing. (a card game)

DEVELOPMENT
---------------

###To run locally
bundle install  
npm install  
(async adapter for ActionCable)  
(sqlite3 for db)   bin/rails db:migrate RAILS_ENV=development  
bin/rails s

###js (game app) tests
npm test

### TODO
- look for bugs in game rules (there's a plenty of tests already)
- migrate to postgres - put users login in
- UI for game creation
- UI for the game itself (probably three.js; right now basic html UI)
- multi-player
- AI