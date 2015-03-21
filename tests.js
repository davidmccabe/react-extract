"use strict";

var translator = require('./jsx-translator');
var I = require('immutable');

var extractions = {
    'Hello': [],
    '<I18N>Hello</I18N>': ['Hello'],
    'i18n("world")': ['world'],
    '<I18N><a href="foo">tag with only safe attributes</a></I18N>': ['<a href="foo">tag with only safe attributes</a>'],
    '<I18N><a:link href="foo" target="_blank">tag with unsafe attributes</a:link></I18N>': ['<a:link href="foo">tag with unsafe attributes</a:link>'],
    '<I18N><a href="foo" target="_blank" i18n-designation="link">tag with unsafe attributes</a></I18N>': ['<a:link href="foo">tag with unsafe attributes</a:link>'],
    '<I18N><SelfClosing i18n-designation="foo" attr="attr" /></I18N>': ['<SelfClosing:foo />'],
    '<I18N><SelfClosing /></I18N>': ['<SelfClosing />'],
    '<I18N><Member.Name /></I18N>': ['<Member.Name />'],
    '<I18N><a><b><i>Deeply nested</i> nested <i>nested</i> nested</b> tags</a></I18N>': ['<a><b><i>Deeply nested</i> nested <i>nested</i> nested</b> tags</a>'],
    '<I18N>Cat: {hat}</I18N>': ['Cat: {hat}'],
    '<I18N>And now {a.member.expression}</I18N>': ['And now {a.member.expression}'],
    'var nested = i18n("hatters"); <I18N>Cat: {nested}</I18N>': ['hatters', 'Cat: {nested}'],
    '<p><I18N>1: {same.name.different.message}</I18N> <I18N>2: {same.name.different.message}</I18N></p>': ['1: {same.name.different.message}', '2: {same.name.different.message}'],
}

exports.testExtraction = function (test) {
    Object.keys(extractions).forEach(input => {
        test.ok(
            I.is(I.fromJS(extractions[input]),
                 I.fromJS(translator.extractMessages(input))),
                 `
                 Incorrect extraction for input
                 ${input}
                 Expected
                 ${extractions[input]}
                 but got
                 ${translator.extractMessages(input)}
                 `);
    });
    test.done();
};

var shouldNotBeExtractable = [
    '<I18N>Nested <I18N>message markers.</I18N></I18N>',
    'i18n("Not" + "just a string" + "literal")',
    'i18n()',
    'i18n("Too many", "arguments")',
    '<I18N><a target="_blank">Unsafe attributes but no designation.</a></I18N>',
    '<I18N>{"string literal"}</I18N>',
    '<I18N>{arbitrary.expression()}</I18N>',    
    '<I18N>{("non"+"simple").memberExpression}</I18N>',
    '<I18N>{computed["memberExpression"]}</I18N>',
    '<I18N>{sameName}{sameName}</I18N>',
    '<I18N>{same.name}{same.name}</I18N>',    
    '<I18N>{sameName}<a:sameName target="_blank">...</a:sameName></I18N>',
    '<I18N>{sameName}<a i18n-designation="sameName" target="_blank">...</a></I18N>',
]

exports.testErrorsInExtraction = function (test) {
    shouldNotBeExtractable.forEach(message => {
        test.throws(() => translator.extractMessages(message), message);
    });
    test.done();
}


