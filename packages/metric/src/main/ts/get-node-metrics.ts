import os from 'node:os'

/**
 * Return process and os metric.
 *
 * - node.process.memory-usage.rss - representing the Resident Set Size (RSS) in bytes.
 * - node.process.memory-usage.heap-total - refer to V8's memory usage.
 * - node.process.memory-usage.heap-used - refer to V8's memory usage.
 * - node.os.loadavg.1m - 1 minute load averages.
 * - node.os.loadavg.5m - 5 minute load averages.
 * - node.os.loadavg.15m - 15 minute load averages.
 * - node.os.freemem - amount of free system memory in bytes as an integer.
 * - node.os.totalmem - total amount of system memory in bytes as an integer.
 *
 * @see {@link https://nodejs.org/api/process.html#process_process_memoryusage}
 * @see {@link https://nodejs.org/api/os.html#os_os_loadavg}
 */
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
