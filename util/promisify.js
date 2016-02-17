'use strict'

module.exports = function promisify () {
  const fn = arguments[ 0 ] // the function to call

  const args = new Array(arguments.length - 1)
  for (let i = 0, c = args.length; i < c; i++) {
    args[ i ] = arguments[ i + 1 ] // i+1 since arguments[0] is ignored
  }

  return new Promise((resolve, reject) => {
    args[ args.length ] = (err, result) => {
      if (err) {
        return reject(err)
      }
      resolve(result)
    }
    fn.apply(null, args)
  })
}
