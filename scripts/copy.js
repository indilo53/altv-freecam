const fse = require('fs-extra');

fse
  .copy(process.argv[2], process.argv[3])
  .then(() => {
    console.log('copy done');
  })
  .catch(err => {
    throw err;
  })
;
