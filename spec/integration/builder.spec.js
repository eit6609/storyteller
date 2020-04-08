'use strict';

const
    { forEach } = require('lodash'),
    { join } = require('path'),
    { walk } = require('@eit6609/walker'),
    fs = require('fs'),
    Builder = require('../../src/builder.js'),
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
}

describe('Builder [integration]', () => {
    it('should create the expected pages', async () => {
        const options = {
            templatesDir: TEMPLATES_DIR,
            outputDir: OUTPUT_DIR,
            debug: true,
            metadata: {
                title: 'The Tower of Hanoi',
                author: 'Dario Morandini',
                language: 'en',
                filename: RESULT_FILENAME
            }
        };
        const builder = new Builder(options);
        State.configure({ nDiscs: 4 });
        await builder.build('start', new State());
        const files = readFiles(OUTPUT_DIR);
        const expectedFiles = readFiles(EXPECTED_OUTPUT_DIR);
        expect(files).toEqual(expectedFiles);
    });
});
