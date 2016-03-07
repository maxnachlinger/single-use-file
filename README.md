# single-use-file

A simple library which writes a file, and then deletes it when read.

[![travis][travis-image]][travis-url]
[![npm][npm-image]][npm-url]
[![standard][standard-image]][standard-url]

[travis-image]: https://travis-ci.org/maxnachlinger/single-use-file.svg?branch=master
[travis-url]: https://travis-ci.org/maxnachlinger/single-use-file
[npm-image]: https://img.shields.io/npm/v/single-use-file.svg?style=flat
[npm-url]: https://npmjs.org/package/single-use-file
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[standard-url]: http://standardjs.com/

### Why?

When your node application gets an uncaught exception, you should log it and shut down. The idea is to do something safe since your app is crashing and additional errors might cause it to hang or obscure the root cause of the crash. One safe thing is to write the exception to a file and then crash. When your app starts back up and 
connects to everything, it can then read the exception from that file and report the error properly.

### Installation:
```
npm i single-use-file --save
```

### Basic Example
```javascript
'use strict'
const singleUseFile = require('..')

process.on('uncaughtException', (err) => {
  console.error(`uncaughtException: ${err.stack || err}`)

  singleUseFile.write(err)
    .then(() => process.exit(1))
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
      setTimeout(() => throw new Error('test uncaughtException'), 1000)
    })
    .catch((err) => console.error(`Could not read crash file, error: ${err.stack || err}`))
}

startup()
```
This example is available [here](https://github.com/maxnachlinger/single-use-file/blob/master/example/index.js). 
Run it twice, once to write the crash file and next to read it.
