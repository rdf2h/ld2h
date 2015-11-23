import test from 'tape'
import LD2h from '../'
import report from 'browserify-tape-spec'

test('exists', (t)=> {
  t.ok(test, 'test lib correctly imported')
  t.end()
})

test('LD2h exists', (t)=> {
  t.ok(LD2h, 'echo lib correctly imported')
  t.end()
})

if (process.browser) test.createStream().pipe(report('out'))
