# @qiwi/nestjs-enterprise-svc-info
Returns uptime by `/svc-info/uptime` and application name with version by `/svc-info/version`
## Installation
```shell script
yarn add @qiwi/nestjs-enterprise-svc-info
```
## Before using
Set up `build-info.json` forwarding into container in your `Dockerfile`
```dockerfile
COPY build-info.json $APP_DIR/build-info.json
``` 

Add path variables `BUILD_INFO` and `IMAGE_TAG` to `makefile` and forward them into the building image
```makefile
BUILD_INFO=true

VERSION=$(shell $(GET_APP_VERSION_EXEC))$(VERSION_SUFFIX)
IMAGE_TAG=$(DOCKER_REGISTRY)/$(APP_NAME):$(VERSION)

NODE_BUILD_TOOL=sudo docker run --rm -u $(shell id -u):$(shell id -g) -v $(HOME):/home -v $(PWD):/app -e "IMAGE_TAG=$(IMAGE_TAG)" -e "VERSION=$(VERSION)" -e "IMAGE_TAG_LATEST=$(IMAGE_TAG_LATEST)" -e "BUILD_INFO=$(BUILD_INFO)" <your building image name>

```
Add to `"scripts"` in `package.json`
```json
"prebuild": "build-info",
```
##Usage
Usage as module
```typescript
import { SvcInfoModule } from '@qiwi/nestjs-enterprise-svc-info'
// ...

@Module({
  imports: [
    SvcInfoModule
    // and so on
  ],
  controllers: [ ],
  providers: [ ],
})
export class AppModule {}
```

Usage as controller (if you need routes order)

```typescript
import { SvcInfoController } from '@qiwi/nestjs-enterprise-svc-info'

// ...

@Module({
  imports: [],
  controllers: [SvcInfoController],
  providers: [ ],
})
export class AppModule {}
```
