'use strict';

const
    GoatCabbageWolf = require('./goat-cabbage-wolf.js'),
    Generator = require('../../../src/generator.js');

function build () {
    const options = {
        templateEngine: 'ejs',
        templatesDir: '../templates',
        outputDir: '../out-ejs',
        debug: false,
        metadata: {
            title: 'Saving Goat and Cabbages',
            author: 'Dario Morandini',
            language: 'en',
            filename: 'goat-cabbage-wolf-ejs.epub',
            cover: 'images/cover.png',
        }
    };
    const generator = new Generator(options);
    return generator.generate('start', new GoatCabbageWolf());
}

build().catch((error) => console.log(error));
