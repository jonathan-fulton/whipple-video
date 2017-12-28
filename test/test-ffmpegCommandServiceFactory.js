'use strict';

const Should = require('should');
const Path = require('path');

const FfmpegCommandServiceFactory = require('../lib/ffmpegCommandServiceFactory');
const FfmpegCommandService = require('../lib/ffmpegCommandService');

describe('FfmpegCommandServiceFactory', function() {

    describe('create', function() {

        it('Should properly instantiate an instance of FfmpegCommandService', function() {
            const ffmpegCommandService = FfmpegCommandServiceFactory.create({
                fontsDirectory: Path.resolve(__dirname, './fixtures/fonts1'),
                fonts: [{
                    name: 'Avenir',
                    fontFilePath: 'Avenir.ttc'
                }, {
                    name: 'Helvetica',
                    fontFilePath: 'HelveticaNeueDeskInterface.ttc'
                }]
            });

            Should(ffmpegCommandService).be.an.instanceOf(FfmpegCommandService);
        });

        it('Should throw an error if a font file is not found', function() {

            let actualErr;
            try {
                const ffmpegCommandService = FfmpegCommandServiceFactory.create({
                    fontsDirectory: Path.resolve(__dirname, './fixtures/fonts1'),
                    fonts: [{
                        name: 'Avenir',
                        fontFilePath: 'Avenir.ttc'
                    }, {
                        name: 'Helvetica',
                        fontFilePath: 'HelveticaNeueDeskInterface_DOESNT_EXIST.ttc'
                    }]
                });
            } catch(e) {
                actualErr = e;
            }

            Should(actualErr).be.an.instanceOf(Error);
            Should(actualErr.message).eql(`Font file for Helvetica does not exist. Looked for file ${Path.resolve(__dirname, './fixtures/fonts1/HelveticaNeueDeskInterface_DOESNT_EXIST.ttc')}`)

        });

        it('Should throw an error if fonts not provided in config', function() {

            let actualErr;
            try {
                const ffmpegCommandService = FfmpegCommandServiceFactory.create({
                    fontsDirectory: Path.resolve(__dirname, './fixtures/fonts1')
                });
            } catch(e) {
                actualErr = e;
            }

            Should(actualErr).be.an.instanceOf(Error);
            Should(actualErr.isJoi).be.true();
            Should(actualErr.message).eql('child "fonts" fails because ["fonts" is required]');

        });

        it('Should throw an error if fonts.name is not provided in config', function() {

            let actualErr;
            try {
                const ffmpegCommandService = FfmpegCommandServiceFactory.create({
                    fontsDirectory: Path.resolve(__dirname, './fixtures/fonts1'),
                    fonts: [{
                        fontFilePath: 'Avenir.ttc'
                    }, {
                        name: 'Helvetica',
                        fontFilePath: 'HelveticaNeueDeskInterface_DOESNT_EXIST.ttc'
                    }]
                });
            } catch(e) {
                actualErr = e;
            }

            Should(actualErr).be.an.instanceOf(Error);
            Should(actualErr.isJoi).be.true();
            Should(actualErr.message).eql('child "fonts" fails because ["fonts" at position 0 fails because [child "name" fails because ["name" is required]]]');

        });

        it('Should throw an error if fonts.fontFilePath is not provided in config', function() {

            let actualErr;
            try {
                const ffmpegCommandService = FfmpegCommandServiceFactory.create({
                    fontsDirectory: Path.resolve(__dirname, './fixtures/fonts1'),
                    fonts: [{
                        name: 'Avenir',
                        fontFilePath: 'Avenir.ttc'
                    }, {
                        name: 'Helvetica'
                    }]
                });
            } catch(e) {
                actualErr = e;
            }

            Should(actualErr).be.an.instanceOf(Error);
            Should(actualErr.isJoi).be.true();
            Should(actualErr.message).eql('child "fonts" fails because ["fonts" at position 1 fails because [child "fontFilePath" fails because ["fontFilePath" is required]]]');

        });

    })

});