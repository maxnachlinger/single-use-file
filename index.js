'use strict'
const path = require('path')
const fs = require('fs')
const promisify = require('./util/promisify')

module.exports.fileName = 'single-use-file.json'

const crashFilePath = path.join(path.dirname(process.argv[ 1 ]), exports.fileName)

function crashFileExists (cb) {
  return fs.stat(crashFilePath, (err) => {
    if (!err) {
      return cb(null, true)
    }

    // no crash file found, this isn't an error
    if (err.code && err.code === 'ENOENT') {
      return cb(null, false)
    }
    return cb(err)
  })
}

function readCrashFile (cb) {
  fs.readFile(crashFilePath, 'utf8', (err, contents) => {
    if (err) {
      return cb(err)
    }
    try {
      contents = JSON.parse(contents)
    } catch (err) {}
    cb(null, contents)
  })
}

function read (cb) {
  crashFileExists((err, exists) => {
    if (err) {
      return cb(err)
    }
    if (!exists) {
      return cb()
    }

    readCrashFile((err, contents) => {
      if (err) {
        return cb(err)
      }

      fs.unlink(crashFilePath, (err) => {
        if (err) {
          return cb(err)
        }
        cb(null, contents)
      })
    })
  })
}

module.exports.read = (cb) => {
  if (cb) {
    return read(cb)
  }
  return promisify(read)
}

function write (info, cb) {
  if (info instanceof Error) {
    info = info.stack || info
  }

  return fs.writeFile(crashFilePath, JSON.stringify(info), (err) => {
    if (err) {
      return cb(err)
    }
    return cb(null, crashFilePath)
  })
}

module.exports.write = (info, cb) => {
  if (cb) {
    return write(info, cb)
  }
  return promisify(write, info)
}
