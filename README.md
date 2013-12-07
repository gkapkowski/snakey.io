# snakey.io


Snakey.io implementation files


## Game Server


### Running locally


1. Download & install Node.js from http://nodejs.org/download/
2. Download snakey.io code ([Download](https://github.com/gkapkowski/snakey.io/archive/master.zip)) or clone repozitory.

    ```bash
    git clone git@github.com:gkapkowski/snakey.io.git
    cd snakey.io/
    ```

3. Install dependencies

    ```bash
    npm install package.json
    ```


4. Start server (default port: 5000)

    ```bash
    npm start
    ```

    or

    ```bash
    node server/server.js [PORT]
    ```


### Running on Heroku


TODO


## Player servers (snakes)


### Running Locally


1. Download snakey.io code ([Download](https://github.com/gkapkowski/snakey.io/archive/master.zip)) or clone repozitory.

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
    
<!---
#### Node.js

1. Download & install Node.js from http://nodejs.org/download/
2. Install dependencies

    ```bash
    cd snakey.io
    npm install package.json
    ```
    
3. Run server (default port 5003)

    ```bash
    cd snakey.ioexamples/nodejs/
    node snake.js
    ```
-->

### Running on heroku


TODO
