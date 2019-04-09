const http = require('http');
const fs = require('fs');
const createHandler = require('github-webhook-handler');
const secret = fs.readFileSync('./secret', 'utf8');
const handler = createHandler({ path: '/webhook', secret: secret });

http.createServer((req, res) => {
    handler(req, res, _ => {
        res.statusCode = 404;
        res.end('no such location');
    });
}).listen(8081);

function runCmd(cmd, args, callback) {
    const spawn = require('child_process').spawn;
    const child = spawn(cmd, args);
    const response = '';

    child.stdout.on('data', buffer => response += buffer.toString());
    child.stdout.on('end', _ => callback(response));
}

handler.on('error', err => console.error('Error:', err.message));

handler.on('issues', event => console.log('Received an issue event for %s action=%s: #%d %s', event.payload.repository.name, event.payload.action, event.payload.issue.number, event.payload.issue.title));

handler.on('push', _ => runCmd('sh', ['./release.sh'], text => console.log(text)));

