import { formatKibanaEntry, TWinstonEntry } from '../../main/ts/winston'

type TTestCase = {
  description: string
  input: TWinstonEntry
  output: ReturnType<typeof formatKibanaEntry>
}

describe('formatKibanaEntry', () => {
  const testCases: TTestCase[] = [
    {
      description: 'adds string timestamp from meta',
      input: {
        level: 'foo',
        timestamp: 1599847151451,
        meta: {
          timestamp: '2020-09-11T18:30:19.868Z',
        },
        message: 'bar',
      },
      output: {
        '@timestamp': '2020-09-11T18:30:19.868Z',
        level: 'FOO',
        message: 'bar',
      },
    },
    {
      description: 'adds instant timestamp from meta',
      input: {
        level: 'foo',
        timestamp: 1599847151451,
        meta: {
          timestamp: 1599849019865,
        },
        message: 'bar',
      },
      output: {
        '@timestamp': '2020-09-11T18:30:19.865Z',
        level: 'FOO',
        message: 'bar',
      },
    },
    {
      description: 'adds timestamp from root',
      input: {
        level: 'foo',
        timestamp: 1599847151451,
        meta: {
          timestamp: 'bar',
          publicMeta: {
            baz: 'baz',
          },
        },
        message: 'bar',
      },
      output: {
        '@timestamp': '2020-09-11T17:59:11.451Z',
        level: 'FOO',
        message: 'bar',
        baz: 'baz',
      },
    },
    {
      description: 'adds root timestamp if meta.timestamp is null',
      input: {
        level: 'foo',
        timestamp: 1599847151451,
        meta: {
          // eslint-disable-next-line unicorn/no-null
          timestamp: null,
          publicMeta: {
            baz: 'baz',
          },
        },
        message: 'bar',
      },
      output: {
        '@timestamp': '2020-09-11T17:59:11.451Z',
        level: 'FOO',
        message: 'bar',
        baz: 'baz',
      },
    },
    {
      description: 'adds root timestamp if meta.timestamp is undefined',
      input: {
        level: 'foo',
        timestamp: 1600081785361,
        meta: {
          timestamp: undefined,
          publicMeta: {
            baz: 'baz',
          },
        },
        message: 'bar',
      },
      output: {
        '@timestamp': '2020-09-14T11:09:45.361Z',
        level: 'FOO',
        message: 'bar',
        baz: 'baz',
      },
    },
  ]

  testCases.forEach(({ input, output, description }) =>
    it(description, () => {
      expect(formatKibanaEntry(input)).toEqual(output)
    }),
  )
})
