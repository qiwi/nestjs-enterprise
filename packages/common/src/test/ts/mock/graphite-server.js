import net from 'node:net';

const port = 2003;

export class GraphiteMockServer {
  server
  requestStack = []

  get timestamplessRequestStack() {
    return this.requestStack.map(request => request.split(' ').slice(0, 2).join(' '))
  }

  start() {
    return new Promise((resolve, reject) => {
      this.server = net.createServer(connection => {
        connection.on('data', data => {
          this.requestStack.push(...data.toString().split("\n"))
        });
      });

      this.server.on('error', err => {
        reject(err)
        throw err;
      });

      this.server.listen(port, resolve);
    })
  }

  flush() {
    this.requestStack = [];
  }

  async stop() {
    this.flush();
    return this.server.close();
  }
}