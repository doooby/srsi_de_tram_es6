
GAME RULES
----------

### english
- sorry for now

### česky

- Hra se zakládá na principu prší / ferbl. Hráčí se střídají 
v odkládání karet po jedné, aby jim v ruce nezůstala žádná.
Základní princip je v dodržení barvy nebo znaku (sedma na sedmu, 
srdce na srdce). Pokud hráč nemůže (/nechce - není povinnen) zahrát
žádnou kartu, veme si jednu z paklu.
- Jako v prší, jsou zde speciální karty: měnící (dáma), útočné (sedma, 
pikový král; tyto se kupí dokud jeden z hráčů nemá žádnou další
a musí si vzít/"žrát" patřičný počet z paklu), a pak také eso, 
po němž protihráč na jeden tah nehraje/"stojí".
- V srší de tram má prakticky každá karta přidané pravidla. J
edinou vyjímkou je devítka - ale ta je dvojnásobně hodnocená
jako zavírací karta. tedy:
    - VII: útočná karta za 2.
    - VIII: jediný znak, jehož karet může hráč zahrát více naráz. za 
    každou zahranou osmu si však hráč, který ji zahrál, veme jinou kartu
    z paklu. speciální pravidlo: zahraje-li hráč všechny čtyři osmy,
    čtyři karty z paklu bere protihráč.
    - IX: speciální pravidlo: pokud je zahrána jako poslední karta,
    vítěz vyhrává za dva body.
    - X: obranná karta. je-li zahrána na útočnou, celý útok se tím ruší;
    na tuto kartu nelze nikdy položit útočnou kartu.
    - J: měnící karta. lze položit na libovolnou barvu.
    - D: měnící karta. pokud je zahrána, hráč si vybere na jakou
    barvu "mění" - pokračuje se jako by položená dáma měla tuto barvu.
    - K: král plní roli útočné karty, ale má hodnotu 0, resp.
     pikový král 4.
    - E: protihráč musí také zahrát eso, jinak vynechává tah.
    - Žolík: toto je speciální karta - je útočná s hodnotou 5; a nemá
    žádnou barvu ani znak, lze ji tedy z toho hlediska zahrát na cokoli
    a na ni zahrát cokoli. což může být výhoda ale i nevýhoda: lze 
    velmi snadno podniknout protiútok.
- Důležité je, že jakmile dojde pakl pro dobírání karet (ne dříve), tak
se **přetočí** kopa - tedy karty se již po zbytek hry nemíchají a hráčí
tak postupně získají přehled o tom, jaké karty protihráč má.
- Dá se hrát i ve více hráčích, ale v tom případě hrozí, že dojdou
karty. V tom případě hra končí aniž by některý z hráčů získal bod.
 


IN DEVELOPMENT
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
- look for bugs in game rules (though there's a plenty of tests already)
- migrate to postgres - put users login in
- UI for game creation
- UI for the game itself (probably three.js; right now basic html UI)
- multi-player
- AI