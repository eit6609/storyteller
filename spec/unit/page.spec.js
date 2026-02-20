'use strict';

const
    { cloneDeep } = require('lodash'),
    Page = require('../../src/page.js'),
    fs = require('fs');

describe('Page', () => {
    let id, template, state, builder, sut;
    beforeEach(() => {
        id = 666,
        template = {
            name: 'a-template',
            build () {
            }
        };
        state = {
            a: 'value'
        };
        builder = {
            outputDir: 'a-dir',
            getPage () {
            },
            metadata: {},
        };
        sut = new Page(id, template, state, builder);
    });
    describe('static hash()', () => {
        it('should hash a string', () => {
            const s = 'hello';
            expect(Page.hash(s)).toBe(s);
        });
        it('should hash a number', () => {
            const n = 123456;
            expect(Page.hash(n)).toBe('123456');
        });
        it('should hash a boolean', () => {
            const b = false;
            expect(Page.hash(b)).toBe('false');
        });
        it('should hash a Date', () => {
            const d = new Date();
            expect(Page.hash(d)).toBe(`${d.getTime()}`);
        });
        it('should hash an array', () => {
            const d = new Date();
            const a = [1, 'a', true, d, { a: 1 }];
            expect(Page.hash(a)).toBe(`[1,a,true,${d.getTime()},{a=1}]`);
        });
        it('should hash a Set', () => {
            const d = new Date();
            const s = new Set([1, 'a', true, d, { a: 1 }]);
            expect(Page.hash(s)).toBe(`{1,${d.getTime()},a,true,{a=1}}`);
        });
        it('should hash an object', () => {
            const d = new Date();
            const o = {
                num: 1,
                str: 'a',
                bool: true,
                date: d,
                obj: { a: 1 }
            };
            expect(Page.hash(o)).toBe(`{bool=true,date=${d.getTime()},num=1,obj={a=1},str=a}`);
        });
        it('should hash a Map', () => {
            const d = new Date();
            const o = { a: 1 };
            const m = new Map([[1, 1], [2, 'a'], [d, d], [3, false], [o, o]]);
            expect(Page.hash(m)).toBe(`{1=1,${d.getTime()}=${d.getTime()},2=a,3=false,{a=1}={a=1}}`);
        });
        it('should deal with circular references', () => {
            const parent = {
                children: []
            };
            const child1 = {
                parent
            };
            const child2 = {
                parent,
            };
            child1.sibling = child2;
            child2.sibling = child1;
            parent.children.push(child1, child2);
            expect(Page.hash(parent))
                .toBe('{children=[{parent=<circular0>,sibling={parent=<circular0>,sibling=<circular1>}},\
{parent=<circular0>,sibling={parent=<circular0>,sibling=<circular2>}}]}');
        });
    });
    describe('constructor()', () => {
        it('should store the parameters', () => {
            expect(sut.id).toBe(id);
            expect(sut.template).toBe(template);
            expect(sut.state).toBe(state);
            expect(sut.builder).toBe(builder);
        });
    });
    describe('followLink()', () => {
        it('should call builderr.getPage() with a clone of the state', () => {
            spyOn(builder, 'getPage').and.returnValue('a-page');
            expect(sut.followLink()).toBe('a-page');
            const state = builder.getPage.calls.argsFor(0)[1];
            expect(state).toEqual(sut.state);
            expect(state).not.toBe(sut.state);
        });
        it('should call builder.getPage() with the right parameters and return its result when called without ' +
            'parameters', () => {
            spyOn(builder, 'getPage').and.returnValue('a-page');
            expect(sut.followLink()).toBe('a-page');
            expect(builder.getPage).toHaveBeenCalledWith('a-template', sut.state);
        });
        it('should call builder.getPage() with the right parameters and return its result when called only ' +
            'with a template name', () => {
            spyOn(builder, 'getPage').and.returnValue('a-page');
            expect(sut.followLink('another-template')).toBe('a-page');
            expect(builder.getPage).toHaveBeenCalledWith('another-template', sut.state);
        });
        it('should call builder.getPage() with the right parameters and return its result when called only ' +
            'with an action that modifies the state', () => {
            spyOn(builder, 'getPage').and.returnValue('a-page');
            function action (state) {
                state.attribute = 'value';
            }
            const newState = cloneDeep(sut.state);
            action(newState);
            expect(sut.followLink(undefined, action)).toBe('a-page');
            expect(builder.getPage).toHaveBeenCalledWith('a-template', newState);
        });
        it('should call builder.getPage() with the right parameters and return its result when called only ' +
            'with an action that creates a new state', () => {
            spyOn(builder, 'getPage').and.returnValue('a-page');
            function action () {
                return 'another-state';
            }
            expect(sut.followLink(undefined, action)).toBe('a-page');
            expect(builder.getPage).toHaveBeenCalledWith('a-template', 'another-state');
        });
        it('should call builder.getPage() with the right parameters and return its result when with a template ' +
            'name and an action', () => {
            spyOn(builder, 'getPage').and.returnValue('a-page');
            function action (state) {
                state.attribute = 'value';
            }
            const newState = cloneDeep(sut.state);
            action(newState);
            expect(sut.followLink('another-template', action)).toBe('a-page');
            expect(builder.getPage).toHaveBeenCalledWith('another-template', newState);
        });
    });
    describe('build()', () => {
        it('should call sut.template.build() with the right parameters and set sut.text with its result if ' +
            'sut.builder.markdown is not true', () => {
            let actualParams;
            spyOn(sut.template, 'build').and.callFake((params) => {
                actualParams = params;
                return 'a-text';
            });
            sut.build();
            expect(sut.text).toBe('a-text');
            expect(actualParams.state).toBe(sut.state);
            expect(actualParams.goto.name).toEqual('bound goto');
            expect(actualParams.debug.name).toEqual('bound debug');
        });
        it('should call sut.template.build() with the right parameters and set sut.text with the XHTML conversion of ' +
            'its result if sut.builder.templateEngine is `mt`', () => {
            spyOn(sut.template, 'build').and.returnValue('a paragraph\n');
            sut.builder.templateEngine = 'mt';
            sut.build();
            expect(sut.text).toBe(`<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="it">
<head>
<title>Untitled</title>
<link href="style-epub.css" rel="stylesheet" type="text/css" />
</head>
<body>
<p>a paragraph</p>

</body>
</html>`);
            expect(sut.template.build).toHaveBeenCalledWith(sut);
        });
    });
    describe('savePage()', () => {
        it('should call fs.writeFileSync() with the right parameters', () => {
            sut.text = 'a-text';
            spyOn(sut, 'getPageFileName').and.returnValue('a-file-name');
            spyOn(fs, 'writeFileSync');
            sut.savePage();
            expect(fs.writeFileSync).toHaveBeenCalledWith('a-file-name', 'a-text', 'utf8');
        });
    });
    describe('getPageURL()', () => {
        it('should return the expected value', () => {
            expect(sut.getPageURL()).toBe('0666.html');
        });
    });
    describe('getPageFileName()', () => {
        it('should call sut.getPageURL() and return the expected value', () => {
            spyOn(sut, 'getPageURL').and.returnValue('a-page-url');
            expect(sut.getPageFileName()).toBe('a-dir/a-page-url');
        });
    });
    describe('goto()', () => {
        it('should call sut.followLink() and return the expected value when called only with a template name', () => {
            spyOn(sut, 'followLink').and.returnValue({
                getPageURL () {
                    return 'a-page-url';
                }
            });
            expect(sut.goto('a-template')).toBe('a-page-url');
            expect(sut.followLink).toHaveBeenCalledWith('a-template', undefined);
        });
        it('should call sut.followLink() and return the expected value when called only with an action', () => {
            spyOn(sut, 'followLink').and.returnValue({
                getPageURL () {
                    return 'a-page-url';
                }
            });
            function f () {}
            expect(sut.goto(f)).toBe('a-page-url');
            expect(sut.followLink).toHaveBeenCalledWith(undefined, f);
        });
        it('should call sut.followLink() and return the expected value when called with a template name and an ' +
            'action', () => {
            spyOn(sut, 'followLink').and.returnValue({
                getPageURL () {
                    return 'a-page-url';
                }
            });
            function f () {}
            expect(sut.goto('a-template', f)).toBe('a-page-url');
            expect(sut.followLink).toHaveBeenCalledWith('a-template', f);
        });
    });
    describe('debug()', () => {
        it('should return the empty string if sut.builder.debug is not true', () => {
            expect(sut.debug()).toBe('');
        });
        it('should return the expected result if sut.builder.debug is true', () => {
            builder.debug = true;
            sut = new Page(id, template, state, builder);
            expect(sut.debug()).toBe('<code>a-template/{a=value}</code>');
        });
    });
});
