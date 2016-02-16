'use strict'
const singleUseFile = require('..')

process.on('uncaughtException', (err) => {
  console.error(`uncaughtException: ${err.stack || err}`)

  singleUseFile.write(err)
    .then(() => {
      process.exit(1)
    })
    .catch((writeErr) => {
      console.error(`Could not write the crash file, error: ${writeErr.stack || writeErr}`)
      process.exit(1)
    })
})

function startup() {
  singleUseFile.read()
    .then((contents) => {
      if (contents) {
        console.log(`Crash file found: ${JSON.stringify(contents)}`)
        return
      }

      // no crash file, trigger an uncaughtException - you know, for fun
      setTimeout(() => {
        throw new Error('test uncaughtException')
      }, 1000)
    })
    .catch((err) => {
      console.error(`Could not read crash file, error: ${err.stack || err}`)
    })
}

startup()
