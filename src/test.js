const assert = require('assert')
const { deepEqual } = assert
const {
  map,
  prop,
  curry,
  normalizeToSuccess
} = require('./util')
const { runTest } = require('./run')

const testHandlers = async (fn, payload, actionHandlers, expectedOutput) => {
  return runTest(actionHandlers, fn, payload).then(({log}) => {
    const outputPicker = prop(1)
    const actualOutput = map(outputPicker, log)
    deepEqual(actualOutput, expectedOutput)
  })
}

const testFn = (fn, expected, index = 0, previousOutput = null) => {
  checkForExpectedTypeMismatches(expected)

  assert(fn, 'The function you are trying to test is undefined.')

  const step = expected[index]

  if (step === undefined) {
    throw new Error('Your spec does not have as many steps as your function.  Are you missing a return line?')
  }

  const [input, expectedOutput] = step
  let g
  if (fn.next) {
    g = fn
  } else {
    g = fn(input)
  }

  let normalizedInput
  if (Array.isArray(previousOutput)) {
    normalizedInput = map(normalizeToSuccess, input)
  } else {
    normalizedInput = normalizeToSuccess(input)
  }
  let { value: actualOutput, done } = g.next(normalizedInput)
  try {
    deepEqual(actualOutput, expectedOutput)
  } catch (e) {
    let errorMessage = []

    errorMessage.push(`Error on Step ${index + 1}`)
    errorMessage.push('============================')
    errorMessage.push('\nActual')
    errorMessage.push(`You expected this for Step ${index + 1} (the ${getNumber(index)} element of the array returned from the spec):`)
    errorMessage.push('-----------------------------------------------------------------------------')
    errorMessage.push(JSON.stringify(expectedOutput, true, 2))

    errorMessage.push('\nExpected')
    errorMessage.push(`The function actually yielded/returned this (right side of the ${getNumber(index)} yield/return in your function):`)
    errorMessage.push('-----------------------------------------------------------------------------')
    errorMessage.push(JSON.stringify(actualOutput, true, 2))
    errorMessage.push('\n')
    e.name = 'Error'
    e.message = errorMessage.join('\n')

    throw e
  }
  if (!done || index + 1 < expected.length) {
    testFn(g, expected, index + 1, actualOutput)
  }
}

const checkForExpectedTypeMismatches = (expected) => {
  if (!Array.isArray(expected)) {
    throw new Error(`Your spec must return an array of tuples.  It is currently returning a value of type "${typeof expected}".`)
  }
  for (let i = 0; i < expected.length; i++) {
    if (i + 1 >= expected.length) return
    let output = expected[i][1]
    let nextInput = expected[i + 1][0]

    if (Array.isArray(output)) {
      assert(Array.isArray(nextInput), 'If an array of actions is yielded, it should return an array of results.')
    }
  }
}

const testIt = (fn, expected) => {
  return function () {
    let expectedLog = expected()
    testFn(fn, expectedLog)
  }
}

const getNumber = (i) => {
  switch (i + 1) {
    case 1:
      return 'first'
    case 2:
      return 'second'
    case 3:
      return 'third'
    case 4:
      return 'fourth'
    case 5:
      return 'fifth'
    case 6:
      return 'sixth'
    case 7:
      return 'seventh'
    case 8:
      return 'eighth'
    case 9:
      return 'ninth'
    case 10:
      return 'tenth'
    case 11:
      return 'eleventh'
    case 12:
      return 'twelfth'
    case 13:
      return 'thirteenth'
    case 14:
      return 'fourteenth'
    case 15:
      return 'fifteenth'
    default:
      return i + 1
  }
}

module.exports = {
  testHandlers: curry(testHandlers),
  testFn: curry(testFn),
  testIt: curry(testIt)
}
