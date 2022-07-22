# Command Emitter

### Installation
```sh
npm install
```

### Setup
Install an instance in the main device. Then install another one to the end device. 
- Make sure to have the same `PROJECT_KEY` 
- Make sure to have the `REDIS_HOST` and `REDIS_PORT` for both project
- Add `INSTANCE_NAME` for publisher identification

### APIs
#### Send command
```sh
npm run start:publisher
-
-
? Enter command to be emitted: [write you command here.]
```
#### Send command to a specified listener
```sh
npm run start:publisher
-
-
? Enter command to be emitted: listener:[listener INSTANCE_NAME]
? Enter command to be emitted: [write you command here.]
```
#### Show command logs
```sh
npm run start:publisher-logger
-
-
? Enter command to be emitted: [write you command here.]
```
#### Add listener
Set this up in another device
```sh
npm run start:listener
```
#### List all listeners
Set this up in another device
```sh
npm run start:publisher-logger
-
-
? Enter command to be emitted: listener:list
```
#### Setup listener
Set this up in another device
```sh
npm run start:listener
```
#### Stop publisher
Set this up in another device
```sh
npm run start:publisher-logger
-
-
? Enter command to be emitted: stop
```