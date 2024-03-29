/* eslint-disable */
var thrift = require('thrift')
var Calculator = require('./gen-nodejs/Calculator.cjs')
var ttypes = require('./gen-nodejs/tutorial_types.cjs')
var SharedStruct = require('./gen-nodejs/shared_types.cjs').SharedStruct

var data = {}

var server = thrift.createServer(Calculator, {
  ping: function (result) {
    console.log('ping()')
    result(null)
  },

  add: function (n1, n2, result) {
    console.log('add(', n1, ',', n2, ')')
    result(null, n1 + n2)
  },

  calculate: function (logid, work, result) {
    console.log('calculate(', logid, ',', work, ')')

    var val = 0
    if (work.op == ttypes.Operation.ADD) {
      val = work.num1 + work.num2
    } else if (work.op === ttypes.Operation.SUBTRACT) {
      val = work.num1 - work.num2
    } else if (work.op === ttypes.Operation.MULTIPLY) {
      val = work.num1 * work.num2
    } else if (work.op === ttypes.Operation.DIVIDE) {
      if (work.num2 === 0) {
        var x = new ttypes.InvalidOperation()
        x.whatOp = work.op
        x.why = 'Cannot divide by 0'
        result(x)
        return
      }
      val = work.num1 / work.num2
    } else {
      var x = new ttypes.InvalidOperation()
      x.whatOp = work.op
      x.why = 'Invalid operation'
      result(x)
      return
    }

    var entry = new SharedStruct()
    entry.key = logid
    entry.value = '' + val
    data[logid] = entry

    result(null, val)
  },

  getStruct: function (key, result) {
    result(null, data[key])
  },

  zip: function () {},
})

module.exports = server
