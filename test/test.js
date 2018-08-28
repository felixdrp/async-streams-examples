require('tap').mochaGlobals()
const tap = require('tap')
const should = require('should')

const {Observable, interval, timer} = require('rxjs');
const {debounceTime, bufferWhen, share, bufferToggle, filter} = require('rxjs/operators');

const {promisify} = require('util')
const setTimerPromise = promisify(setTimeout)
tap.jobs = 6


describe('Example:', () => {
  context('Group burst of data by idle time interval in between.', () => {
    // Stream initialization values.
    let dataStream = ['abcd', 'efg', 'hij']
    let timelapseDataStream = [10, 20, 10]

    // Generator that will create an stream.
    // Each yield is a promise that will resolve with some data.
    function* stream(data, timelapse) {
      for (let index in data) {
        yield setTimerPromise(timelapse[index]).then(() => data[index])
      }
    }

    // timelapse between data and the expected groups to end the test.
    async function groupByTimelapse(timelapse, expectedGroups) {
      let stdoutBufferNext
      let endTest
      // Create a promise and export the resolve function to 'endTest' var.
      let end = new Promise(resolve => endTest = resolve)
      // Will store the groups from the stream
      let result = []

      // Observable timer that in case of long time without ending it will rise an error.
      const endUnfinishedTest = timer(100).subscribe(
        ()=>{
          console.log('unfinished test! unfinished Result value: ' + result)
          endTest()
        },
      )

      // Create an observable and export the next function to 'stdoutBufferNext' var.
      // We need to specify the 'share' option at pipe in order to use in multiple observables.
      const stdoutBuffer = Observable.create(observer => {
          stdoutBufferNext = (data) => observer.next(data);
        }).pipe(share())

      // Observable that generate a signal when the observable stream is silent for 'timelapse' time
      const emitAfterTimeInactive = stdoutBuffer
        .pipe(debounceTime(timelapse))

      // Observable that group data from observable.
      // It will use the signal of the emitAfterTimeInactive as trigger
      const bufferBurstOfData = stdoutBuffer
        .pipe(bufferWhen(() => emitAfterTimeInactive))

      // We create a subscription to 'bufferBurstOfData'
      const observerBurstOfData = bufferBurstOfData.subscribe(x => {
        // Add elements to the result
        result.push(x)

        // Check timer End test?
        if (result.length == expectedGroups) {
          endTest(true)
        }
      });

      for await (const x of stream(dataStream, timelapseDataStream)) {
        stdoutBufferNext(x)
      }
      // Await until last group is received and processed by the observable.
      await end
      // Close test length checker observable.
      endUnfinishedTest.unsubscribe()
      return result
    }

    it('get 3 groups', async () => {
      const result = await groupByTimelapse(5, 3)
      result.should.containDeepOrdered([ [ 'abcd' ], [ 'efg' ], [ 'hij' ] ], 'It should be equal!')
    })
    it('get 2 groups', async () => {
      const result = await groupByTimelapse(15, 2)
      result.should.containDeepOrdered([ [ 'abcd' ], [ 'efg', 'hij' ] ], 'It should be equal!')
    })
    it('get 1 groups', async () => {
      const result = await groupByTimelapse(25, 1)
      result.should.containDeepOrdered([dataStream], 'It should be equal!')
    })
  })

  context('Group burst of data that have a text to start yielding and idle time interval to return the data group.', () => {
    // Stream initialization values.
    let dataStream = ['abcd', 'efg', 'hij']
    let timelapseDataStream = [10, 20, 10]

    // Generator that will create an stream.
    // Each yield is a promise that will resolve with some data.
    function* stream(data, timelapse) {
      for (let index in data) {
        yield setTimerPromise(timelapse[index]).then(() => data[index])
      }
    }

    // timelapse between data and the expected groups to end the test.
    async function groupByTimelapse(timelapse, expectedGroups) {
      let stdoutBufferNext
      let endTest
      // Create a promise and export the resolve function to 'endTest' var.
      let end = new Promise(resolve => endTest = resolve)
      // Will store the groups from the stream
      let result = []

      // Observable timer that in case of long time without ending it will rise an error.
      const endUnfinishedTest = timer(100).subscribe(
        ()=>{
          console.error('unfinished test! unfinished Result value: ' + result)
          endTest()
        },
      )

      // Create an observable and export the next function to 'stdoutBufferNext' var.
      // We need to specify the 'share' option at pipe in order to use in multiple observables.
      const stdoutBuffer = Observable.create(observer => {
          stdoutBufferNext = (data) => observer.next(data);
        }).pipe(share())

      // Observable that generate a signal when the observable stream has a provided text
      const emitWhenFindText = stdoutBuffer
        .pipe(filter(burst => burst.includes('ab')))


      // Observable that generate a signal when the observable stream is silent for 'timelapse' time
      const emitAfterTimeInactive = stdoutBuffer
        .pipe(debounceTime(timelapse))

      // Observable that group data from observable.
      // It will use the signal of the emitAfterTimeInactive as trigger
      const bufferBurstOfData = stdoutBuffer
        .pipe(bufferToggle(emitWhenFindText, () => emitAfterTimeInactive))

      // We create a subscription to 'bufferBurstOfData'
      const observerBurstOfData = bufferBurstOfData.subscribe(x => {
        // Add elements to the result
        result.push(x)
        console.log(x, result.length, expectedGroups)

        // Check timer End test?
        if (result.length == expectedGroups) {
          endTest(true)
        }
      });

      for await (const x of stream(dataStream, timelapseDataStream)) {
        stdoutBufferNext(x)
      }
      // Await until last group is received and processed by the observable.
      await end
      // Close test length checker observable.
      endUnfinishedTest.unsubscribe()
      return result
    }

    it('get 3 groups', async () => {
      const result = await groupByTimelapse(5, 1)
      result.should.containDeepOrdered([[ 'abcd', 'efg' ]], 'It should be equal!')
    })
  })
})
