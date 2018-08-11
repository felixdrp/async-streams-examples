require('tap').mochaGlobals()
const tap = require('tap')
const should = require('should')

const {Observable, interval, timer} = require('rxjs');
const {debounceTime, bufferWhen, share} = require('rxjs/operators');

const {promisify} = require('util')
const setTimerPromise = promisify(setTimeout)
tap.jobs = 6


describe('Example:', () => {
  context('Group burst of data that have a text to start yielding and time interval in between data to stop.', () => {
    let dataStream = ['abcd', 'efg', 'hij']
    let timelapseDataStream = [10, 20,10]

    function* stream(data, timelapse) {
      for (let index in data) {
        yield setTimerPromise(timelapse[index]).then(() => data[index])
      }
    }

    async function groupByTimilapse(timelapse, expectedGroups) {
      let stdoutBufferNext
      let endTest
      let end = new Promise(resolve => endTest = resolve)

      let result = []

      // In case of error end test at timer:
      const endUnfinishedTest = timer(100).subscribe(
        ()=>{
          console.log('unfinished test! unfinished Result value: ' + result)
          endTest()
        },
      )

      const stdoutBuffer = Observable.create(observer => {
          stdoutBufferNext = (data) => observer.next(data);
        }).pipe(share())

      const emitAfterTimeInactive = stdoutBuffer
        .pipe(debounceTime(timelapse))

      const bufferBurstOfData = stdoutBuffer
        .pipe(bufferWhen(() => emitAfterTimeInactive))

      const observerBurstOfData = bufferBurstOfData
        .subscribe(x => {
          result.push(x)

          // End test?
          if (result.length == expectedGroups) {
            endTest(true)
          }
        });

      for await (const x of stream(dataStream, timelapseDataStream)) {
        stdoutBufferNext(x)
      }
      // Await until last group is received
      await end
      endUnfinishedTest.unsubscribe()
      return result
    }

    it('get 3 groups', async () => {
      const result = await groupByTimilapse(5, 3)
      result.should.containDeepOrdered([ [ 'abcd' ], [ 'efg' ], [ 'hij' ] ], 'It should be equal!')
    })
    it('get 2 groups', async () => {
      const result = await groupByTimilapse(15, 2)
      result.should.containDeepOrdered([ [ 'abcd' ], [ 'efg', 'hij' ] ], 'It should be equal!')
    })
    it('get 1 groups', async () => {
      const result = await groupByTimilapse(25, 1)
      result.should.containDeepOrdered([dataStream], 'It should be equal!')
    })
  })
})
