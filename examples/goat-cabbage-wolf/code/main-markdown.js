'use strict';

const
    CapraCavoloLupo = require('./goat-cabbage-wolf.js'),
    Builder = require('../../../src/builder.js');

function build () {
    const options = {
        templatesDir: '../templates',
        outputDir: '../out-markdown',
        markdown: true,
        debug: true,
        metadata: {
            title: 'Saving Goat and Cabbages',
            author: 'Dario Morandini',
            language: 'en',
            filename: 'goat-cabbage-wolf-markdown.epub',
            cover: 'images/cover.png',
        }
    };
    const builder = new Builder(options);
    const initialState = new CapraCavoloLupo();
    return builder.build('start', initialState, options);
}

build().catch((error) => console.log(error));
