'use strict';

const
    GoatCabbageWolf = require('./goat-cabbage-wolf.js'),
    Generator = require('../../../src/generator.js');

function build () {
    const options = {
        templateEngine: 'pug',
        templatesDir: '../templates',
        outputDir: '../out-pug',
        debug: false,
        metadata: {
            title: 'Saving Goat and Cabbages',
            author: 'Dario Morandini',
            language: 'en',
            filename: 'goat-cabbage-wolf-pug.epub',
            cover: 'images/cover.png',
        }
    };
    const generator = new Generator(options);
    return generator.generate('start', new GoatCabbageWolf());
}

build().catch((error) => console.log(error));
