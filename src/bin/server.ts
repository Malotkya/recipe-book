#!/usr/bin/env node
/* converted www file */

//Module Dependencies
import { app } from "../app";
import Debug from 'debug';
import http from 'http';
let debug = Debug('recipe-book:server');

//Normalize the port into a number, stirng, or false.
function normalizePort(value: string):any{
    let port = parseInt(value, 10);

    if (isNaN(port)) {
        return value;
    }

    if (port >= 0)
        return port;

    return false;
}

//Get port from environment and store in Express.
let port = normalizePort(process.env.PORT || '8080');
app.set('port', port);

//Create HTTP server.
let server = http.createServer(app);
server.listen(port);

//Event listener for HTTP server "error" event.
server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.syscall !== 'listen') {
        throw error;
    }

    let address = server.address();
    let bind = typeof address === 'string' ? 'Pipe ' + address : 'Port ' + address;

    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
});

//Event listener for HTTP server "listening event.
server.on('listening', () => {
    let address = server.address();
    let bind = typeof address === 'string' ? 'Pipe ' + address : 'Port ' + address;
    debug('Listening on ' + bind);
});