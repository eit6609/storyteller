'use strict';

const
    Generator = require('../../../src/generator.js'),
    Desert = require('./desert.js');

function build () {
    const options = {
        templatesDir: '../templates',
        outputDir: '../out',
        debug: false,
        metadata: {
            title: 'Desert Traversal',
            author: 'Dario Morandini',
            language: 'en',
            filename: 'desert.epub'
        }
    };
    const generator = new Generator(options);
    const config = {
        locations: 6,
        cans: 15,
        consumption: 1,
        tankCapacity: 1,
        loadCapacity: 2
    };
    Desert.configure(config);
    return generator.generate('start', new Desert());
}

build().catch((error) => console.log(error));
