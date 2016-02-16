'use strict'

module.exports = function (fn) {
  return function () {
    const args = new Array(arguments.length)
    for (let i = 0, c = args.length; i < c; i++) {
      args[ i ] = arguments[ i ]
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
}
