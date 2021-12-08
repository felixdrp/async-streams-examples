# async-streams-examples
Learn async streams by examples.

# JS Modules

## callbag
A standard for JS callbacks that enables lightweight observables and iterables
[callbag](https://github.com/callbag/callbag)

## rxjs
Asynchronous programming with observable streams
[rxjs](https://github.com/ReactiveX/rxjs)

# Some doc

[observable](https://reactivex.io/documentation/observable.html)

[rxjs observable guide](https://rxjs.dev/guide/observable)

[rxmarbles.com](https://rxmarbles.com/)

[ECMAScript Observable](https://github.com/tc39/proposal-observable)

[Reactive programming and Observable sequences with RxJS in Node.js](https://medium.freecodecamp.org/rxjs-and-node-8f4e0acebc7c)

[rxjs-dev](https://rxjs-dev.firebaseapp.com/)

[Generators and Observable Sequences](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/gettingstarted/generators.md#generators-and-observable-sequences)

[Learn RxJS](https://www.learnrxjs.io/)

[The introduction to Reactive Programming you've been missing](https://gist.github.com/staltz/868e7e9bc2a7b8c1f754#the-introduction-to-reactive-programming-youve-been-missing)

[for-await-of and synchronous iterables](http://2ality.com/2017/12/for-await-of-sync-iterables.html)

[A General Theory of Reactivity](https://github.com/kriskowal/gtor)

[Understanding Marble Diagrams for Reactive Streams](https://medium.com/@jshvarts/read-marble-diagrams-like-a-pro-3d72934d3ef5)

# Videos

[Jafar Husain: Async Programming in ES7 | JSConf US 2015](https://youtu.be/lil4YCCXRYc)

[Reactive Programming, changing the world at Netflix, Microsoft, Slack and beyond!-Matthew Podwysocki](https://youtu.be/yEeDbHvg1vQ)

[You will learn RxJS at ng-europe 2016](https://www.youtube.com/watch?v=uQ1zhJHclvs)

# Examples

## Group burst of data that have a time interval in between.
[Example code](test/test.js#L14)

....abcd.....efg.....hij.... => ['abcd', 'efg', 'hij']

Thanks [https://stackoverflow.com/a/49774144](https://stackoverflow.com/a/49774144)

## Group burst of data that has a text at the beginning and an idle time interval at the end.
[Example code](test/test.js#L94)

....abcd.....efg.....hij.... => ['abcd', 'efg']

