# snakey.io


Snakey.io implementation files


## Game Server


### Running locally


1. Download & install [Node.js](http://nodejs.org/download/)
2. [Download snakey.io code](https://github.com/gkapkowski/snakey.io/archive/master.zip) or clone repository.

    ```bash
    git clone git@github.com:gkapkowski/snakey.io.git
    cd snakey.io/
    ```

3. Install dependencies

    ```bash
    npm install package.json
    ```

4. Build Package

    ```bash
    gulp
    ```

5. Start server (default port: 5000)

    ```bash
    npm start
    ```

    or

    ```bash
    node dist/server/server.js [PORT]
    ```


<!-- ### Running on Heroku


1. Download & install [Heroku Toolbelt](https://toolbelt.heroku.com/)
2. Clone snakey.io repository

    ```bash
    git clone git@github.com:gkapkowski/snakey.io.git
    cd snakey.io/
    ```

3. Create new heroku app with snakey.io (Heroku will automatically add new remote repo)

    ```bash
    heroku create
    ```
    
4. Deploy your snakey.io instance

    ```bash
    git push heroku master
    ```
 -->

## Players


### Running Locally


1. Download snakey.io code ([Download](https://github.com/gkapkowski/snakey.io/archive/master.zip)) or clone repository.

    ```bash
    git clone git@github.com:gkapkowski/snakey.io.git
    ```

#### Django


It's recommended to run snake server in virtual enviroment. Read more at http://www.virtualenv.org/en/latest/

1. go to example django snake dir

    ```
    cd snakey.io/examples/django
    ```

2. Install requirements:

    ```bash
    pip install requirements.txt
    ```

3. Run server (default port 8000)

    ```bash
    gunicorn example.wsgi:application
    ```
    

#### Node.js

1. Download & install Node.js from http://nodejs.org/download/
2. Go to example snake dir

    ```bash
    cd snakey.io/examples/node/
    ```

3. Install dependencies

    ```bash
    npm install
    ```
    
4. Run server (default port 8001)

    ```bash
    npm start
    ```
    
    or
    
    ```bash
    node snake.js
    ```
