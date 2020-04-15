'use strict';

const
    Generator = require('../../../src/generator.js'),
    Hanoi = require('./hanoi.js');

function build () {
    const options = {
        templatesDir: '../templates',
        outputDir: '../out',
        debug: false,
        metadata: {
            title: 'The Tower of Hanoi',
            author: 'Dario Morandini',
            language: 'en',
            filename: 'hanoi.epub'
        }
    };
    const generator = new Generator(options);
    Hanoi.configure({ nDiscs: 4 });
    return generator.generate('start', new Hanoi());
}

build().catch((error) => console.log(error));
