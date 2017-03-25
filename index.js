'use strict'
const path = require('path')
const fs = require('fs')

module.exports.fileName = 'single-use-file.json'

const crashFilePath = path.join(path.dirname(process.argv[1]), exports.fileName)

const crashFileExists = () => {
  return new Promise((resolve, reject) => fs.stat(crashFilePath, (err) => {
    if (!err) {
      return resolve(true)
    }

    // no crash file found, this isn't an error
    if (err.code && err.code === 'ENOENT') {
      return resolve(false)
    }

    return reject(err)
  }))
}

const readCrashFile = () => {
  return new Promise((resolve, reject) => fs.readFile(crashFilePath, 'utf8', (err, contents) => {
    if (err) {
      return reject(err)
    }
    try {
      contents = JSON.parse(contents)
    } catch (err) {}

    return resolve(contents)
  }))
}

const removeCrashFile = () => {
  return new Promise((resolve, reject) => {
    return fs.unlink(crashFilePath, (err) => {
      if (!err) {
        return resolve()
      }
      // file already gone
      if (err.code === 'ENOENT') {
        return resolve()
      }
      return reject(err)
    })
  })
}

const read = () => {
  return crashFileExists()
    .then((exists) => {
      if (!exists) {
        return
      }
      return readCrashFile()
    })
    .then((contents) => {
      return removeCrashFile()
        .then(() => contents)
    })
}

const writeFile = (info) => {
  return new Promise((resolve, reject) => {
    return fs.writeFile(crashFilePath, JSON.stringify(info), (err) => err ? reject(err) : resolve(crashFilePath))
  })
}

module.exports.read = (cb) => {
  if (!cb) {
    return read()
  }

  return read()
    .catch(cb)
    .then((contents) => cb(null, contents))
}

module.exports.write = (info, cb) => {
  if (info instanceof Error) {
    info = info.stack || info
  }

  if (!cb) {
    return writeFile(info)
  }

  return writeFile(info)
    .catch(cb)
    .then((filePath) => cb(null, filePath))
}
