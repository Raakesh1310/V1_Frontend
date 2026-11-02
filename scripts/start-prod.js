const concurrently = require('concurrently');
const port = process.env.PORT || 4200;

concurrently([
  // Copy the environment file
  {
    command: 'cp src/environments/environment.prod.ts src/environments/environment.ts',
    name: 'Copying Environment file',
    prefixColor: 'bgYellow.bold'
  },
  { command: 'node scripts/pug-watch.js', name: 'PUG_WATCH', prefixColor: 'bgGreen.bold' },
  {
    command: `npm run ng -- serve --port ${port} --open -c=local`,
    name: 'NG_SERVE',
    prefixColor: 'bgBlue.bold'
  }
], {
  prefix: 'name',
  killOthers: ['failure', 'success']
}).then(success, failure);

function success() {
  console.log('Success');
}

function failure() {
  console.log('Failure');
}
