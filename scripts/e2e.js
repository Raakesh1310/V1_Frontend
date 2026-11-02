const concurrently = require('concurrently');

concurrently(
  [
    {
      command: 'npm run ng -- e2e --port 6200 --suite deal:flow1',
      name: 'TEST_1',
      prefixColor: 'bgGreen.bold'
    },
    {
      command: 'npm run ng -- e2e --port 6200 --suite deal:flow2',
      name: 'TEST_2',
      prefixColor: 'bgBlue.bold'
    }
  ],
  {
    prefix: 'name',
    killOthers: ['failure', 'success']
  }
).then(success, failure);

function success() {
  console.log('Success');
}

function failure() {
  console.log('Failure');
}
