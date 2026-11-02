const fsExtra = require('fs-extra');

/**
 * A function to copy the files
 * form dist_temp to dist directory
 *
 * this is basically the part of zero downtime deployment
 */
function copyDist() {
  // console.log('readdirsync');
  // fsExtra.readdirSync('./').forEach(file => {
  //   console.log(file);
  // });
  fsExtra.copy('dist_temp', 'dist');
}

copyDist();
