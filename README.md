snakey.io
=========

Snakey.io implementation files

Server
======

Running locally
---------------

Install requirements

```
npm install package.json
```

Start server (default port: 8001)

```
npm start
```

or

```
node server/server.js [PORT]
```

Running on Heroku
-----------------

TODO


Example Snake servers
=====================

Django
------

Note: It's recommended to run snake server in virtualenv

Install requirements:

```bash
pip install requirements.txt
```

Run snake server locally
~~~~~~~~~~~~~~~~~~~~~~~~

```bash
cd examples/django/
gunicorn example.wsgi:application
```

Run snake server on heroku
~~~~~~~~~~~~~~~~~~~~~~~~~~

TODO