# how to run

## dev

* when using webpack dev to serve the html content it is also necessary to run the application
  * `npm run dev` will run devpack, to recompile the front end content on the fly
  * `npm run server` will run the actual application, for the front end to communicate with

### behind nginx
* nginx can be used to route requests to the correct tools
  * `/` should be routed to the webpack dev socket (and upgraded as a socket)
  * `/events|session|state` should be routed to the application node instance port
  * `/socket.io` should be routed to the application node instance port and upgraded as a socket

### using webpack dev proxy
* it is possible to use thr proxy tool of webpack dev to do the same thing
  * https://webpack.js.org/configuration/dev-server/#devserverproxy
  * for proxying `/socket.io/` use `{ ..., ws: true, ...}`
