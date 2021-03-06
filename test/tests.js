'use strict'
const fs = require('fs')
const test = require('tape-catch')
const singleUseFile = require('..')

const fileExists = (filePath) => new Promise((resolve) => {
  return fs.stat(filePath, (err) => {
    if (!err || (err && err.code !== 'ENOENT')) {
      return resolve(true)
    }
    return resolve(false)
  })
})

test('writes an Error to a crash file', (t) => {
  singleUseFile.write(new Error('test error'), (err, filePath) => {
    t.notOk(err, 'File was written without error')
    t.ok(filePath, 'Written file path was returned')
    fs.unlink(filePath, t.end)
  })
})

test('writes an Error to a crash file and returns a promise', (t) => {
  singleUseFile.write(new Error('test error'))
    .then((filePath) => {
      t.ok(filePath, 'Written file path was returned')
      fs.unlink(filePath, t.end)
    })
    .catch((err) => {
      t.notOk(err, 'File was written without error')
      t.fail()
    })
})

test('reads an Error crash file', (t) => {
  singleUseFile.write(new Error('test error'), (err, filePath) => {
    t.notOk(err, 'File was written without error')
    t.ok(filePath, 'Written file path was returned')

    singleUseFile.read((err, contents) => {
      t.notOk(err, 'File was read without error')
      t.ok(contents, 'Error file has contents')
      t.ok(~contents.indexOf('test error'), 'Error contents should contain "test error"')

      fs.stat(filePath, (err) => {
        t.ok(err)
        t.equal(err.code, 'ENOENT', 'Error file should be removed on read')
        t.end()
      })
    })
  })
})

test('reads an Error crash file and returns a promise', (t) => {
  let filePath

  singleUseFile.write(new Error('test error'))
    .then((_filePath) => {
      t.ok(_filePath, 'Written file path was returned')
      filePath = _filePath
    })
    .then(() => singleUseFile.read())
    .then((contents) => {
      t.ok(contents, 'Error file has contents')
      t.ok(~contents.indexOf('test error'), 'Error contents should contain "test error"')
      return fileExists(filePath)
    })
    .then((filExists) => {
      t.notOk(filExists, 'Error file should be removed on read')
      t.end()
    })
    .catch((err) => {
      t.fail(err)
      t.end()
    })
})

test('reads an Error crash file and returns even if the error file is invalid JSON', (t) => {
  let filePath

  singleUseFile.write(new Error('test error'))
    .then((_filePath) => {
      t.ok(_filePath, 'Written file path was returned')
      filePath = _filePath

      // write invalid json
      return new Promise((resolve, reject) => {
        return fs.writeFile(filePath, null, (err) => err ? reject(err) : resolve())
      })
    })
    .then(() => singleUseFile.read())
    .then((contents) => {
      t.notOk(contents, 'Error file has no content')
      return fileExists(filePath)
    })
    .then((filExists) => {
      t.notOk(filExists, 'Error file should be removed on read')
      t.end()
    })
    .catch((err) => {
      t.fail(err)
      t.end()
    })
})
