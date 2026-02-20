'use strict';

const
    { forEach } = require('lodash'),
    { join } = require('path'),
    { walk } = require('@eit6609/walker'),
    fs = require('fs'),
    Generator = require('../../src/generator.js'),
    State = require('../../examples/hanoi/code/hanoi.js');

const
    TEMPLATES_DIR = 'examples/hanoi/templates',
    OUTPUT_DIR = 'spec/fixtures/output',
    RESULT_FILENAME = 'spec/fixtures/result.epub',
    EXPECTED_OUTPUT_DIR = 'spec/fixtures/expected-output';

function readFiles (dir) {
    const files = [];
    for (const [dirPath, , fileNames] of walk(dir)) {
        forEach(fileNames, (fileName) => {
            const filePath = join(dirPath, fileName);
            files.push(fs.readFileSync(filePath, 'utf8'));
        });
    }
    return files;
}

describe('Generator [integration]', () => {
    it('should create the expected pages', async () => {
        const options = {
            templatesDir: TEMPLATES_DIR,
            outputDir: OUTPUT_DIR,
            templateEngine: 'pug',
            debug: false,
            metadata: {
                title: 'The Tower of Hanoi',
                author: 'Dario Morandini',
                language: 'en',
                filename: RESULT_FILENAME
            }
        };
        const generator = new Generator(options);
        State.configure({ nDiscs: 4 });
        await generator.generate('start', new State());
        const files = readFiles(OUTPUT_DIR);
        const expectedFiles = readFiles(EXPECTED_OUTPUT_DIR);
        expect(files).toEqual(expectedFiles);
    });
});
