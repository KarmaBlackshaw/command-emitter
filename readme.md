# Command Emitter

### Installation
```sh
npm install
```

### Setup
Install an instance in the main device. Then install another one to the end device. 
- Make sure to have the same `PROJECT_KEY` 
- Make sure to have the `REDIS_HOST` and `REDIS_PORT` for both project

### Publisher Setup
Run commands using the publisher instance
```sh
npm run start:publisher
```

View outputs in the logger instance
```sh
npm run start:publisher-logger
```

### Listener Setup
```sh
npm run start:listener
```