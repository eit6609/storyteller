'use strict';

const
    Template = require('../../src/template.js');

describe('Template', () => {
    let name, builder, mockMT, mockPug, mockEJS, sut;
    beforeEach(() => {
        name = 'a-name';
        builder = {
            templatesDir: 'a-dir'
        };
        mockMT = {
            compileFile () {
            }
        };
        mockPug = {
            compileFile () {
            }
        };
        mockEJS = {
            compile () {
            },
            getFileContent () {
                return 'dummy';
            }
        };
    });
    describe('constructor()', () => {
        it('should store the right stuff and call load()', () => {
            spyOn(Template.prototype, 'load').and.returnValue('a-template');
            sut = new Template(name, builder);
            expect(sut.name).toBe('a-name');
            expect(sut.templatesDir).toBe('a-dir');
            expect(sut.adapter.getFileExtension()).toBe('ejs');
            expect(sut.load).toHaveBeenCalled();
        });
    });
    describe('load()', () => {
        it('should call sut.getFileName() and mt.compileFile() if builder.templateEngine is `mt`', () => {
            builder.templateEngine = 'mt';
            sut = new Template(name, builder, {mockMT, mockPug, mockEJS});
            spyOn(mockMT, 'compileFile').and.returnValue('a-template');
            spyOn(sut, 'getFileName').and.returnValue('a-file-name');
            sut.load({mockMT, mockPug, mockEJS});
            expect(mockMT.compileFile).toHaveBeenCalledWith('a-file-name');
            expect(sut.template).toBe('a-template');
        });
        it('should call sut.getFileName() and pug.compileFile() if builder.templateEngine is `pug`', () => {
            builder.templateEngine = 'pug';
            sut = new Template(name, builder, {mockMT, mockPug, mockEJS});
            spyOn(mockPug, 'compileFile').and.returnValue('a-template');
            spyOn(sut, 'getFileName').and.returnValue('a-file-name');
            sut.load({mockMT, mockPug, mockEJS});
            expect(mockPug.compileFile).toHaveBeenCalledWith('a-file-name', { pretty: true });
            expect(sut.template).toBe('a-template');
        });
        it('should call sut.getFileName() and ejs.compile() if builder.templateEngine is `ejs`', () => {
            builder.templateEngine = 'ejs';
            sut = new Template(name, builder, {mockMT, mockPug, mockEJS});
            spyOn(mockEJS, 'compile').and.returnValue('a-template');
            spyOn(sut, 'getFileName').and.returnValue('a-file-name');
            sut.load({mockMT, mockPug, mockEJS});
            expect(mockEJS.compile).toHaveBeenCalledWith('dummy');
            expect(sut.template).toBe('a-template');
        });
    });
    describe('getFileName()', () => {
        it('should return the expected .md file name if builder.templateEngin is mt', () => {
            builder.templateEngine = 'mt';
            sut = new Template(name, builder, {mockMT, mockPug, mockEJS});
            expect(sut.getFileName()).toBe('a-dir/a-name.md');
        });
        it('should return the expected .pug file name if builder.templateEngin is pug', () => {
            builder.templateEngine = 'pug';
            sut = new Template(name, builder, {mockMT, mockPug, mockEJS});
            expect(sut.getFileName()).toBe('a-dir/a-name.pug');
        });
        it('should return the expected .pug file name if builder.templateEngin is ejs', () => {
            builder.templateEngine = 'ejs';
            sut = new Template(name, builder, {mockMT, mockPug, mockEJS});
            expect(sut.getFileName()).toBe('a-dir/a-name.ejs');
        });
    });
    describe('build()', () => {
        it('should call sut.template() with the right parameter and return its result', () => {
            sut = new Template(name, builder, {mockMT, mockPug, mockEJS});
            sut.template = () => {};
            spyOn(sut, 'template').and.returnValue('result');
            expect(sut.build('page')).toBe('result');
            expect(sut.template).toHaveBeenCalledWith('page');
        });
    });
});
