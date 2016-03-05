'use strict'

module.exports = function promisify (fn, ctx) {
  return function () {
    const args = new Array(arguments.length)
    for (let i = 0, c = args.length; i < c; i++) {
      args[ i ] = arguments[ i ] // i+1 since arguments[0] is ignored
    }

    return new Promise((resolve, reject) => {
      args[ args.length ] = (err, result) => {
        if (err) {
          return reject(err)
        }
        resolve(result)
      }
      return fn.apply(ctx, args)
    })
  }
}
