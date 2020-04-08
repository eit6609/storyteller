'use strict';

const
    Builder = require('../../../src/builder.js'),
    Desert = require('./desert.js');

function build () {
    const options = {
        templatesDir: '../templates',
        outputDir: '../out',
        debug: true,
        metadata: {
            title: 'Desert Traversal',
            author: 'Dario Morandini',
            language: 'en',
            filename: 'desert.epub'
        }
    };
    const builder = new Builder(options);
    const config = {
        locations: 6,
        cans: 15,
        consumption: 1,
        tankCapacity: 1,
        loadCapacity: 2
    };
    Desert.configure(config);
    const initialState = new Desert();
    return builder.build('start', initialState, options);
}

build().catch((error) => console.log(error));
