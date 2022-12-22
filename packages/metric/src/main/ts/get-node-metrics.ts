import os from 'node:os'

export const getNodeMetrics = () => ({
  // https://nodejs.org/api/process.html#process_process_memoryusage
  'node.process.memory-usage.rss': process.memoryUsage().rss,
  'node.process.memory-usage.heap-total': process.memoryUsage().heapTotal,
  'node.process.memory-usage.heap-used': process.memoryUsage().heapUsed,

  // https://nodejs.org/api/os.html#os_os_loadavg
  'node.os.loadavg.1m': os.loadavg()[0],
  'node.os.loadavg.5m': os.loadavg()[1],
  'node.os.loadavg.15m': os.loadavg()[2],
  'node.os.freemem': os.freemem(),
  'node.os.totalmem': os.totalmem(),
})
