# @qiwi/nestjs-enterprise-config
Nestjs module for processing [uniconfig-based](https://github.com/qiwi/uniconfig) configs.

## Installation
```shell script
yarn add @qiwi/nestjs-enterprise-config
```

## Configuration

### Static import

```typescript
import { Module } from '@nestjs/common'
import { ConfigModule } from "@qiwi/nestjs-enterprise-config"

@Module({
  imports: [
    ConfigModule,
    // and so on
  ],
})

export class AppModule {}
```

### Import as dynamic module.

see [uniconfig-plugin-path](https://github.com/qiwi/uniconfig/tree/master/packages/uniconfig-plugin-path)
```typescript
@Module({
  imports: [
    ConfigModule.register({
      // Absolute or relative path to the config file
      path: '/custom/config/path.json'
      // use <root> or <cwd> tag to form the path.
      // path: '<root>/custom/config/path.json'
    }),
  ]
})

export class AppModule {}
```

### Validation

Module looks for app config json schema in `${process.cwd()}/config/app.config.schema.json` and validates output of uniconfig pipeline.

If file is absent, then no validation is performed.

You can specify path to app config schema via `opts.schemaPath` in `ConfigModule.register`

`app.config.schema.json` example:

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "local": {
      "type": "string"
    },
    "server": {
      "type": "object",
      "properties": {
        "port": {
          "type": "number"
        },
        "host": {
          "type": "string"
        }
      },
      "required": [
        "port",
        "host"
      ]
    },
    "logger": {
      "type": "object",
      "properties": {
        "level": {
          "type": "string"
        }
      },
      "required": [
        "level"
      ]
    }
  },
  "required": [
    "name",
    "server",
    "logger"
  ]
}
```

You can also write schema for config file, for example in `config.schema.json`:

```json
{
  "properties": {
    "data": {
      "$ref": "./app.config.schema.json"
    },
    "$schema": {
      "type": "string"
    }
  },
  "required": ["data"],
  "additionalProperties": {
    "sources": {
      "type": "object"
    }
  }
}
```

And reference it in your config file to enable IDE suggestions and error highlighting:

```json
{
  "$schema": "./config.schema.json",
  "data": {
    "name": "jslab-gen-api",
    "local": "$env:LOCAL",

    "server": {
      "port": 8080,
      "host": "$host:"
    },

    "logger": {
      "level": "debug"
    }
  },

  "sources": {
    "env": {
      "pipeline": "env"
    },
    "host": {
      "pipeline": "ip"
    }
  }
}

```

## Usage
```typescript
@Injectable()
export class MyService {
  constructor(@Inject('IConfigService') config: IConfigService) {}

  myMethod() {
    return this.config.get('name')
  }
}
````

## Uniconfig plugins
### api-file
read json file
```json
{
  "data": {
    "test": "$testFile:"
  },
  "sources": {
    "testFile": {
      "data": ["config/ci.json"],
      "pipeline": "file>json"
    }
  }
}
```
### api-http
read json from url
```json
{
  "data": {
    "test": "$testWeb:"
  },
  "sources": {
    "testWeb": {
      "data": "URL",
      "pipeline": "http>json"
    }
  }
}
```
### argv
read args
```json
{
  "data": {
    "param": "$test:"
  },
  "sources": {
    "test": {
      "pipeline": "argv"
    }
  }
}
```
```js
//node target/es6/main --foo=bar
config.get('param') // { _: [], foo: 'bar', '$0': 'target/es6/main' }
```
### datatree

```json
{
  "data": {
    "test": "$test1:"
  },
  "sources": {
    "test1": {
      "data": {
        "test.test": "test1",
        "test.foo": {
          "bar":"baz"
        }
      }
    }
  }
}
```
```js
config.get('test') // { 'test.test': 'test1', 'test.foo': { bar: 'baz' } }
```
### dot
use [doT template](https://olado.github.io/doT/)
```json
{
  "data": {
    "test": "$test1:"
  },
  "sources": {
    "test1": {
      "data": {
        "data": {
          "data": {
            "foo": "FOO",
            "baz": "BAZ"
          },
          "template": "{{=it.foo}}-bar-{{=it.baz}}"
        }
      },
      "pipeline": "datatree>dot"
    }
  }
}
```
```js
config.get('test') // FOO-bar-BAZ
```
### env
read ENV variables
```json
{
  "data": {
    "test": "$env:LOCAL"
  },
  "sources": {
    "env": {
      "pipeline": "env"
    }
  }
}
```
```js
//LOCAL=true node target/es6/main
config.get('test') // true
```
### ip
IP/host resolver
```json
{
  "data": {
    "test": "$host:"
  },
  "sources": {
    "host": {
      "pipeline": "ip"
    }
  }
}
```
```js
config.get('test') // 192.168.3.5
```
### pkg
read package.json
```json
{
  "data": {
    "test": "$pkg:"
  },
  "sources": {
    "pkg": {
      "pipeline": "pkg"
    }
  }
}
```
```js
config.get('test') // { name: '', version: '0.0.0', description: '' ...etc }
```

`ConfigService` tries to read config file from `<cwd>/config/${process.env.ENVIRONMENT_PROFILE_NAME}.json`.

If it does not exist, then module will read from `<cwd>/config/kube.json` (`DEFAULT_KUBE_CONFIG_PATH`).

If `process.env.LOCAL` is truthy, then service will read from `<cwd>/config/local.json` (`DEFAULT_LOCAL_CONFIG_PATH`).

## API
### Class ConfigModule
Exports `ConfigService` with token `IConfigService`
##### static register (opts?: { path?: string, schemaPath?: string }): DynamicModule

`opts.path` path to config file

`opts.schemaPath` path to app config schema (config.data)

### Function resolveConfigPath

#### resolveConfigPath (path?: string, local?: boolean, env?: string): string

###  DEFAULT_KUBE_CONFIG_PATH
`<cwd>/config/kube.json`
###  DEFAULT_LOCAL_CONFIG_PATH
`<cwd>/config/local.json`

### [Docs](https://qiwi.github.io/nestjs-enterprise/config/)
