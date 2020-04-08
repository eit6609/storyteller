'use strict';

const
    Builder = require('../../../src/builder.js'),
    Hanoi = require('./hanoi.js');

function build () {
    const options = {
        templatesDir: '../templates',
        outputDir: '../out',
        debug: true,
        metadata: {
            title: 'The Tower of Hanoi',
            author: 'Dario Morandini',
            language: 'en',
            filename: 'hanoi.epub'
        }
    };
    const builder = new Builder(options);
    Hanoi.configure({ nDiscs: 4 });
    return builder.build('start', new Hanoi(), options);
}

build().catch((error) => console.log(error));
