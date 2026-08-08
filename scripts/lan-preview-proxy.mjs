import http from 'node:http';
import net from 'node:net';

const listenPort = Number(process.argv[2] || 3025);
const targetPort = Number(process.argv[3] || 3024);

const server = http.createServer((request, response) => {
  const upstream = http.request(
    {
      hostname: '::1',
      family: 6,
      port: targetPort,
      method: request.method,
      path: request.url,
      headers: request.headers,
    },
    (upstreamResponse) => {
      response.writeHead(
        upstreamResponse.statusCode || 502,
        upstreamResponse.headers,
      );
      upstreamResponse.pipe(response);
    },
  );

  upstream.on('error', () => {
    if (!response.headersSent) {
      response.writeHead(502, {'Content-Type': 'text/plain; charset=utf-8'});
    }
    response.end('Local preview is unavailable.');
  });
  request.pipe(upstream);
});

server.on('upgrade', (request, socket, head) => {
  const upstream = net.connect({host: '::1', port: targetPort, family: 6}, () => {
    const headers = Object.entries(request.headers)
      .map(([name, value]) => `${name}: ${value}`)
      .join('\r\n');
    upstream.write(
      `${request.method} ${request.url} HTTP/${request.httpVersion}\r\n${headers}\r\n\r\n`,
    );
    if (head.length) upstream.write(head);
    socket.pipe(upstream).pipe(socket);
  });

  upstream.on('error', () => socket.destroy());
});

server.listen(listenPort, '0.0.0.0');
