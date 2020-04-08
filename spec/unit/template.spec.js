'use strict';

const
    Template = require('../../src/template.js');

describe('Template', () => {
    let name, builder, mt, pug, sut;
    beforeEach(() => {
        name = 'a-name';
        builder = {
            templatesDir: 'a-dir',
            markdown: false
        };
        mt = {
            compileFile () {
            }
        };
        pug = {
            compileFile () {
            }
        };
    });
    describe('constructor()', () => {
        it('should store the right stuff and call load()', () => {
            spyOn(Template.prototype, 'load').and.returnValue('a-template');
            sut = new Template(name, builder);
            expect(sut.name).toBe('a-name');
            expect(sut.templatesDir).toBe('a-dir');
            expect(sut.markdown).toBeFalse();
            expect(sut.load).toHaveBeenCalled();
        });
    });
    describe('load()', () => {
        it('should call sut.getFileName() and pug.compileFile() if builder.markdown is false', () => {
            sut = new Template(name, builder, mt, pug);
            spyOn(pug, 'compileFile').and.returnValue('a-template');
            spyOn(sut, 'getFileName').and.returnValue('a-file-name');
            sut.load(mt, pug);
            expect(pug.compileFile).toHaveBeenCalledWith('a-file-name', { pretty: true });
            expect(sut.template).toBe('a-template');
        });
        it('should call sut.getFileName() and mt.compileFile() if builder.markdown is true', () => {
            builder.markdown = true;
            sut = new Template(name, builder, mt, pug);
            spyOn(mt, 'compileFile').and.returnValue('a-template');
            spyOn(sut, 'getFileName').and.returnValue('a-file-name');
            sut.load(mt, pug);
            expect(mt.compileFile).toHaveBeenCalledWith('a-file-name');
            expect(sut.template).toBe('a-template');
        });
    });
    describe('getFileName()', () => {
        it('should return the expected .pug file name if builder.markdown is false', () => {
            sut = new Template(name, builder, mt, pug);
            expect(sut.getFileName()).toBe('a-dir/a-name.pug');
        });
        it('should return the expected .md file name if builder.markdown is true', () => {
            builder.markdown = true;
            sut = new Template(name, builder, mt, pug);
            expect(sut.getFileName()).toBe('a-dir/a-name.md');
        });
    });
    describe('build()', () => {
        it('should call sut.template() with the right parameter and return its result', () => {
            sut = new Template(name, builder, mt, pug);
            sut.template = () => {};
            spyOn(sut, 'template').and.returnValue('result');
            expect(sut.build('page')).toBe('result');
            expect(sut.template).toHaveBeenCalledWith('page');
        });
    });
});
