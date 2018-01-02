'use strict';

const Should = require('should');
const Path = require('path');

const FfmpegCommandServiceFactory = require('../lib/ffmpegCommandServiceFactory');
//const FfmpegCommandService = require('../lib/ffmpegCommandService');

describe('FfmpegCommandService', function() {

    describe('createFfmpegCommand', function() {

        /** @var {FfmpegCommandService} */
        let ffmpegCommandService;

        before(function() {
            ffmpegCommandService = FfmpegCommandServiceFactory.create({
                pathToFfmpegBin: '/usr/local/bin/ffmpeg'
            }, {
                fontsDirectory: Path.resolve(__dirname, './fixtures/fonts1'),
                fonts: [{
                    name: 'Avenir',
                    fontFilePath: 'Avenir.ttc'
                }, {
                    name: 'Helvetica',
                    fontFilePath: 'HelveticaNeueDeskInterface.ttc'
                }]
            })
        });

        describe('Valid inputs', function() {

            it('Should work with only a video object provided', function() {
                const command = ffmpegCommandService.createFfmpegCommand({
                    video: {
                        filePath: 'sample.mp4',
                        dimensions: {
                            width: 1920,
                            height: 1080
                        }
                    },
                    output: {
                        filePath: 'output.mp4',
                        dimensions: {
                            width: 1920,
                            height: 1080
                        }
                    },
                    workingDirectory: Path.resolve(__dirname, './fixtures/assets1')
                });

                Should(command).eql('someCommand');
            });

            it('Should work with a video and an audio object provided', function() {
                const command = ffmpegCommandService.createFfmpegCommand({
                    video: {
                        filePath: 'sample.mp4',
                        dimensions: {
                            width: 1920,
                            height: 1080
                        }
                    },
                    audio: {
                        filePath: 'music.mp3'
                    },
                    output: {
                        filePath: 'output.mp4',
                        dimensions: {
                            width: 1920,
                            height: 1080
                        }
                    },
                    workingDirectory: Path.resolve(__dirname, './fixtures/assets1')
                });

                Should(command).eql('someCommand');
            });

            it('Should work with a video and a backgroundOverlay object provided', function() {
                const command = ffmpegCommandService.createFfmpegCommand({
                    video: {
                        filePath: 'sample.mp4',
                        dimensions: {
                            width: 1920,
                            height: 1080
                        }
                    },
                    backgroundOverlay: {
                        color: 'aaaaaa',
                        alpha: 0.6,
                        dimensions: {
                            width: 1920,
                            height: 1080
                        },
                        fadeIn: {
                            startTime: 5,
                            duration: 1
                        }
                    },
                    output: {
                        filePath: 'output.mp4',
                        dimensions: {
                            width: 1920,
                            height: 1080
                        }
                    },
                    workingDirectory: Path.resolve(__dirname, './fixtures/assets1')
                });

                Should(command).eql('someCommand');
            });

            it('Should work with a video and an imageOverlay object provided', function() {
                const command = ffmpegCommandService.createFfmpegCommand({
                    video: {
                        filePath: 'sample.mp4',
                        dimensions: {
                            width: 1920,
                            height: 1080
                        }
                    },
                    imageOverlay: {
                        filePath: 'logo.png',
                        fadeIn: {
                            startTime: 5,
                            duration: 2
                        },
                        fadeOut: {
                            startTime: 10,
                            duration: 1
                        }
                    },
                    output: {
                        filePath: 'output.mp4',
                        dimensions: {
                            width: 1920,
                            height: 1080
                        }
                    },
                    workingDirectory: Path.resolve(__dirname, './fixtures/assets1')
                });

                Should(command).eql('someCommand');
            });

            it('Should work with a video and a textOverlay object provided', function() {
                const command = ffmpegCommandService.createFfmpegCommand({
                    video: {
                        filePath: 'sample.mp4',
                        dimensions: {
                            width: 1920,
                            height: 1080
                        }
                    },
                    textOverlay: {
                        text: 'Hello, world!',
                        fontName: 'Avenir',
                        fontSize: 50,
                        fontColor: 'ffffff',
                        fontAlpha: 1,
                        xLoc: 600,
                        yLoc: 600,
                        fadeIn: {
                            startTime: 5,
                            duration: 1
                        },
                        fadeOut: {
                            startTime: 10,
                            duration: 1
                        },
                    },
                    output: {
                        filePath: 'output.mp4',
                        dimensions: {
                            width: 1920,
                            height: 1080
                        }
                    },
                    workingDirectory: Path.resolve(__dirname, './fixtures/assets1')
                });

                Should(command).eql('someCommand');
            });
        });

        describe('Invalid inputs', function() {

            function validateError(commandInput, expectedErrMsg) {
                let err = null;
                try {
                    const command = ffmpegCommandService.createFfmpegCommand(commandInput);
                } catch (e) {
                    err = e;
                }

                Should(err).is.not.null();
                Should(err.message).eql(expectedErrMsg);
            }

            /**
             * Provides some default field settings to minimize lines of code required to set up tests
             * Note, if you need to test video/output/workingDirectory empty, rely on the base validateError function
             *
             * @param commandInput
             * @param expectedErrMsg
             */
            function validateCommonSchemaError(commandInput, expectedErrMsg) {
                // Add the bare minimum required fields to a command
                if (!commandInput.video) {
                    commandInput.video = { filePath: 'sample.mp4', dimensions: { width: 1920, height: 1080 } };
                }

                if (!commandInput.output) {
                    commandInput.output = { filePath: 'output.mp4', dimensions: { width: 1920, height: 1080 }};
                }

                if (!commandInput.workingDirectory) {
                    commandInput.workingDirectory = Path.resolve(__dirname, './fixtures/assets1');
                }

                // Validate input as an object
                validateError(commandInput, expectedErrMsg);
            }

            // Note, WhippleCommand properties accept either an object or an array of that object.
            // In the tests below we're confirming that both the object and forms throw errors appropriately
            // You will therefore see more or less duplicate tests as a result, one for the object form and one for the array form

            describe('Invalid video inputs', function() {
                it('video.filePath must be provided', function() {
                    validateCommonSchemaError({ video: { dimensions: { width: 1920, height: 1080 } } }, 'child "video" fails because [child "filePath" fails because ["filePath" is required], "video" must be an array]');
                    validateCommonSchemaError({ video: [{ dimensions: { width: 1920, height: 1080 } }] }, 'child "video" fails because ["video" must be an object, "video" at position 0 fails because [child "filePath" fails because ["filePath" is required]]]');
                });

                it('video.filePath must be a string', function() {
                    validateCommonSchemaError({ video: { filePath: 1, dimensions: { width: 1920, height: 1080 } } }, 'child "video" fails because [child "filePath" fails because ["filePath" must be a string], "video" must be an array]');
                    validateCommonSchemaError({ video: [{ filePath: 1, dimensions: { width: 1920, height: 1080 } }] }, 'child "video" fails because ["video" must be an object, "video" at position 0 fails because [child "filePath" fails because ["filePath" must be a string]]]');
                });

                it('video.dimensions must be provided', function() {
                    validateCommonSchemaError({ video: { filePath: 'sample.mp4' } }, 'child "video" fails because [child "dimensions" fails because ["dimensions" is required], "video" must be an array]');
                    validateCommonSchemaError({ video: [{ filePath: 'sample.mp4' }] }, 'child "video" fails because ["video" must be an object, "video" at position 0 fails because [child "dimensions" fails because ["dimensions" is required]]]');
                });

                it('video.dimensions.width must be a provided', function() {
                    validateCommonSchemaError({ video: { filePath: 'sample.mp4', dimensions: { height: 1080 } } }, 'child "video" fails because [child "dimensions" fails because [child "width" fails because ["width" is required]], "video" must be an array]');
                    validateCommonSchemaError({ video: [{ filePath: 'sample.mp4', dimensions: { height: 1080 } }] }, 'child "video" fails because ["video" must be an object, "video" at position 0 fails because [child "dimensions" fails because [child "width" fails because ["width" is required]]]]');
                });

                it('video.dimensions.height must be a provided', function() {
                    validateCommonSchemaError({ video: { filePath: 'sample.mp4', dimensions: { width: 1920 } } }, 'child "video" fails because [child "dimensions" fails because [child "height" fails because ["height" is required]], "video" must be an array]');
                    validateCommonSchemaError({ video: [{ filePath: 'sample.mp4', dimensions: { width: 1920 } }] }, 'child "video" fails because ["video" must be an object, "video" at position 0 fails because [child "dimensions" fails because [child "height" fails because ["height" is required]]]]');
                });

                it('video.trimStart must be a number >= 0', function() {
                    validateCommonSchemaError({ video: { filePath: 'sample.mp4', trimStart: -1, dimensions: { width: 1920, height: 1080 } } }, 'child "video" fails because [child "trimStart" fails because ["trimStart" must be larger than or equal to 0], "video" must be an array]');
                    validateCommonSchemaError({ video: [{ filePath: 'sample.mp4', trimStart: -1, dimensions: { width: 1920, height: 1080 } }] }, 'child "video" fails because ["video" must be an object, "video" at position 0 fails because [child "trimStart" fails because ["trimStart" must be larger than or equal to 0]]]');
                });

                it('video.trimDuration must be a number >= 0', function() {
                    validateCommonSchemaError({ video: { filePath: 'sample.mp4', trimDuration: -1, dimensions: { width: 1920, height: 1080 } } }, 'child "video" fails because [child "trimDuration" fails because ["trimDuration" must be larger than or equal to 0], "video" must be an array]');
                    validateCommonSchemaError({ video: [{ filePath: 'sample.mp4', trimDuration: -1, dimensions: { width: 1920, height: 1080 } }] }, 'child "video" fails because ["video" must be an object, "video" at position 0 fails because [child "trimDuration" fails because ["trimDuration" must be larger than or equal to 0]]]');
                });

                it('video has unknown property', function() {
                    validateCommonSchemaError({ video: { filePath: 'sample.mp4', dimensions: { width: 1920, height: 1080 }, badProperty: true } }, 'child "video" fails because ["badProperty" is not allowed, "video" must be an array]');
                    validateCommonSchemaError({ video: [{ filePath: 'sample.mp4', dimensions: { width: 1920, height: 1080 }, badProperty: true }] }, 'child "video" fails because ["video" must be an object, "video" at position 0 fails because ["badProperty" is not allowed]]');
                });
            });

            describe('Invalid audio inputs', function() {
                it('audio.filePath must be provided', function() {
                    validateCommonSchemaError({ audio: { dimensions: { width: 1920, height: 1080 } } }, 'child "audio" fails because [child "filePath" fails because ["filePath" is required], "audio" must be an array]');
                    validateCommonSchemaError({ audio: [{ dimensions: { width: 1920, height: 1080 } }] }, 'child "audio" fails because ["audio" must be an object, "audio" at position 0 fails because [child "filePath" fails because ["filePath" is required]]]');
                });

                it('audio.filePath must be a string', function() {
                    validateCommonSchemaError({ audio: { filePath: 1, dimensions: { width: 1920, height: 1080 } } }, 'child "audio" fails because [child "filePath" fails because ["filePath" must be a string], "audio" must be an array]');
                    validateCommonSchemaError({ audio: [{ filePath: 1, dimensions: { width: 1920, height: 1080 } }] }, 'child "audio" fails because ["audio" must be an object, "audio" at position 0 fails because [child "filePath" fails because ["filePath" must be a string]]]');
                });

                it('audio.trimStart must be a number >= 0', function() {
                    validateCommonSchemaError({ audio: { filePath: 'music.mp3', trimStart: -1 } }, 'child "audio" fails because [child "trimStart" fails because ["trimStart" must be larger than or equal to 0], "audio" must be an array]');
                    validateCommonSchemaError({ audio: [{ filePath: 'music.mp3', trimStart: -1 }] }, 'child "audio" fails because ["audio" must be an object, "audio" at position 0 fails because [child "trimStart" fails because ["trimStart" must be larger than or equal to 0]]]');
                });

                it('audio.trimDuration must be a number >= 0', function() {
                    validateCommonSchemaError({ audio: { filePath: 'music.mp3', trimDuration: -1 } }, 'child "audio" fails because [child "trimDuration" fails because ["trimDuration" must be larger than or equal to 0], "audio" must be an array]');
                    validateCommonSchemaError({ audio: [{ filePath: 'music.mp3', trimDuration: -1 }] }, 'child "audio" fails because ["audio" must be an object, "audio" at position 0 fails because [child "trimDuration" fails because ["trimDuration" must be larger than or equal to 0]]]');
                });

                it('audio has unknown property', function() {
                    validateCommonSchemaError({ audio: { filePath: 'music.mp3', badProperty: true } }, 'child "audio" fails because ["badProperty" is not allowed, "audio" must be an array]');
                    validateCommonSchemaError({ audio: [{ filePath: 'music.mp3', badProperty: true }] }, 'child "audio" fails because ["audio" must be an object, "audio" at position 0 fails because ["badProperty" is not allowed]]');
                });
            });

            describe('Invalid backgroundOverlay inputs', function() {
                it('backgroundOverlay.color must be provided', function() {
                    validateCommonSchemaError({ backgroundOverlay: { alpha: 0.6, dimensions: {width: 1920, height: 1080}, fadeIn: { startTime: 1, duration: 1 } } }, 'child "backgroundOverlay" fails because [child "color" fails because ["color" is required], "backgroundOverlay" must be an array]');
                    validateCommonSchemaError({ backgroundOverlay: [{ alpha: 0.6, dimensions: {width: 1920, height: 1080}, fadeIn: { startTime: 1, duration: 1 } }] }, 'child "backgroundOverlay" fails because ["backgroundOverlay" must be an object, "backgroundOverlay" at position 0 fails because [child "color" fails because ["color" is required]]]');
                });

                it('backgroundOverlay.color must be a valid hex color of 6 characters (< 6 tested)', function() {
                    validateCommonSchemaError({ backgroundOverlay: { color: '12a45', alpha: 0.6, dimensions: {width: 1920, height: 1080}, fadeIn: { startTime: 1, duration: 1 } } }, 'child "backgroundOverlay" fails because [child "color" fails because ["color" length must be at least 6 characters long], "backgroundOverlay" must be an array]');
                    validateCommonSchemaError({ backgroundOverlay: [{ color: '12a45', alpha: 0.6, dimensions: {width: 1920, height: 1080}, fadeIn: { startTime: 1, duration: 1 } }] }, 'child "backgroundOverlay" fails because ["backgroundOverlay" must be an object, "backgroundOverlay" at position 0 fails because [child "color" fails because ["color" length must be at least 6 characters long]]]');
                });

                it('backgroundOverlay.color must be a valid hex color of 6 characters (> 6 tested)', function() {
                    validateCommonSchemaError({ backgroundOverlay: { color: '12a4567', alpha: 0.6, dimensions: {width: 1920, height: 1080}, fadeIn: { startTime: 1, duration: 1 } } }, 'child "backgroundOverlay" fails because [child "color" fails because ["color" length must be less than or equal to 6 characters long], "backgroundOverlay" must be an array]');
                    validateCommonSchemaError({ backgroundOverlay: [{ color: '12a4567', alpha: 0.6, dimensions: {width: 1920, height: 1080}, fadeIn: { startTime: 1, duration: 1 } }] }, 'child "backgroundOverlay" fails because ["backgroundOverlay" must be an object, "backgroundOverlay" at position 0 fails because [child "color" fails because ["color" length must be less than or equal to 6 characters long]]]');
                });

                it('backgroundOverlay.alpha must be provided', function() {
                    validateCommonSchemaError({ backgroundOverlay: { color: 'ffffff', dimensions: {width: 1920, height: 1080}, fadeIn: { startTime: 1, duration: 1 } } }, 'child "backgroundOverlay" fails because [child "alpha" fails because ["alpha" is required], "backgroundOverlay" must be an array]');
                    validateCommonSchemaError({ backgroundOverlay: [{ color: 'ffffff', dimensions: {width: 1920, height: 1080}, fadeIn: { startTime: 1, duration: 1 } }] }, 'child "backgroundOverlay" fails because ["backgroundOverlay" must be an object, "backgroundOverlay" at position 0 fails because [child "alpha" fails because ["alpha" is required]]]');
                });

                it('backgroundOverlay.alpha must be between 0 and 1 (> 1 tested)', function() {
                    validateCommonSchemaError({ backgroundOverlay: { color: 'ffffff', alpha: 1.2, dimensions: {width: 1920, height: 1080}, fadeIn: { startTime: 1, duration: 1 } } }, 'child "backgroundOverlay" fails because [child "alpha" fails because ["alpha" must be less than or equal to 1], "backgroundOverlay" must be an array]');
                    validateCommonSchemaError({ backgroundOverlay: [{ color: 'ffffff', alpha: 1.2, dimensions: {width: 1920, height: 1080}, fadeIn: { startTime: 1, duration: 1 } }] }, 'child "backgroundOverlay" fails because ["backgroundOverlay" must be an object, "backgroundOverlay" at position 0 fails because [child "alpha" fails because ["alpha" must be less than or equal to 1]]]');
                });

                it('backgroundOverlay.alpha must be between 0 and 1 (< 1 tested)', function() {
                    validateCommonSchemaError({ backgroundOverlay: { color: 'ffffff', alpha: -0.1, dimensions: {width: 1920, height: 1080}, fadeIn: { startTime: 1, duration: 1 } } }, 'child "backgroundOverlay" fails because [child "alpha" fails because ["alpha" must be larger than or equal to 0], "backgroundOverlay" must be an array]');
                    validateCommonSchemaError({ backgroundOverlay: [{ color: 'ffffff', alpha: -0.1, dimensions: {width: 1920, height: 1080}, fadeIn: { startTime: 1, duration: 1 } }] }, 'child "backgroundOverlay" fails because ["backgroundOverlay" must be an object, "backgroundOverlay" at position 0 fails because [child "alpha" fails because ["alpha" must be larger than or equal to 0]]]');
                });

                it('backgroundOverlay.dimensions must be provided', function() {
                    validateCommonSchemaError({ backgroundOverlay: { color: '12a456', alpha: 0.6, fadeIn: { startTime: 1, duration: 1 } } }, 'child "backgroundOverlay" fails because [child "dimensions" fails because ["dimensions" is required], "backgroundOverlay" must be an array]');
                    validateCommonSchemaError({ backgroundOverlay: [{ color: '12a456', alpha: 0.6, fadeIn: { startTime: 1, duration: 1 } }] }, 'child "backgroundOverlay" fails because ["backgroundOverlay" must be an object, "backgroundOverlay" at position 0 fails because [child "dimensions" fails because ["dimensions" is required]]]');
                });

                it('backgroundOverlay.dimensions.width must be provided', function() {
                    validateCommonSchemaError({ backgroundOverlay: { color: '12a456', alpha: 0.6, dimensions: {height: 1080}, fadeIn: { startTime: 1, duration: 1 } } }, 'child "backgroundOverlay" fails because [child "dimensions" fails because [child "width" fails because ["width" is required]], "backgroundOverlay" must be an array]');
                    validateCommonSchemaError({ backgroundOverlay: [{ color: '12a456', alpha: 0.6, dimensions: {height: 1080}, fadeIn: { startTime: 1, duration: 1 } }] }, 'child "backgroundOverlay" fails because ["backgroundOverlay" must be an object, "backgroundOverlay" at position 0 fails because [child "dimensions" fails because [child "width" fails because ["width" is required]]]]');
                });

                it('backgroundOverlay.dimensions.height must be provided', function() {
                    validateCommonSchemaError({ backgroundOverlay: { color: '12a456', alpha: 0.6, dimensions: {width: 1920}, fadeIn: { startTime: 1, duration: 1 } } }, 'child "backgroundOverlay" fails because [child "dimensions" fails because [child "height" fails because ["height" is required]], "backgroundOverlay" must be an array]');
                    validateCommonSchemaError({ backgroundOverlay: [{ color: '12a456', alpha: 0.6, dimensions: {width: 1920}, fadeIn: { startTime: 1, duration: 1 } }] }, 'child "backgroundOverlay" fails because ["backgroundOverlay" must be an object, "backgroundOverlay" at position 0 fails because [child "dimensions" fails because [child "height" fails because ["height" is required]]]]');
                });

                it('backgroundOverlay.dimensions.width must be > 0', function() {
                    validateCommonSchemaError({ backgroundOverlay: { color: 'ffffff', alpha: 0.6, dimensions: {width: -1, height: 1080}, fadeIn: { startTime: 1, duration: 1 } } }, 'child "backgroundOverlay" fails because [child "dimensions" fails because [child "width" fails because ["width" must be larger than or equal to 0]], "backgroundOverlay" must be an array]');
                    validateCommonSchemaError({ backgroundOverlay: [{ color: 'ffffff', alpha: 0.6, dimensions: {width: -20, height: 1080}, fadeIn: { startTime: 1, duration: 1 } }] }, 'child "backgroundOverlay" fails because ["backgroundOverlay" must be an object, "backgroundOverlay" at position 0 fails because [child "dimensions" fails because [child "width" fails because ["width" must be larger than or equal to 0]]]]');
                });

                it('backgroundOverlay.dimensions.height must be > 0', function() {
                    validateCommonSchemaError({ backgroundOverlay: { color: 'ffffff', alpha: 0.6, dimensions: {width: 1920, height: -13}, fadeIn: { startTime: 1, duration: 1 } } }, 'child "backgroundOverlay" fails because [child "dimensions" fails because [child "height" fails because ["height" must be larger than or equal to 0]], "backgroundOverlay" must be an array]');
                    validateCommonSchemaError({ backgroundOverlay: [{ color: 'ffffff', alpha: 0.6, dimensions: {width: 1920, height: -15}, fadeIn: { startTime: 1, duration: 1 } }] }, 'child "backgroundOverlay" fails because ["backgroundOverlay" must be an object, "backgroundOverlay" at position 0 fails because [child "dimensions" fails because [child "height" fails because ["height" must be larger than or equal to 0]]]]');
                });

                it('backgroundOverlay.dimensions.width must be an integer', function() {
                    validateCommonSchemaError({ backgroundOverlay: { color: 'ffffff', alpha: 0.6, dimensions: {width: 1920.5, height: 1080}, fadeIn: { startTime: 1, duration: 1 } } }, 'child "backgroundOverlay" fails because [child "dimensions" fails because [child "width" fails because ["width" must be an integer]], "backgroundOverlay" must be an array]');
                    validateCommonSchemaError({ backgroundOverlay: [{ color: 'ffffff', alpha: 0.6, dimensions: {width: 1920.5, height: 1080}, fadeIn: { startTime: 1, duration: 1 } }] }, 'child "backgroundOverlay" fails because ["backgroundOverlay" must be an object, "backgroundOverlay" at position 0 fails because [child "dimensions" fails because [child "width" fails because ["width" must be an integer]]]]');
                });

                it('backgroundOverlay.dimensions.height must be an integer', function() {
                    validateCommonSchemaError({ backgroundOverlay: { color: 'ffffff', alpha: 0.6, dimensions: {width: 1920, height: 1080.5}, fadeIn: { startTime: 1, duration: 1 } } }, 'child "backgroundOverlay" fails because [child "dimensions" fails because [child "height" fails because ["height" must be an integer]], "backgroundOverlay" must be an array]');
                    validateCommonSchemaError({ backgroundOverlay: [{ color: 'ffffff', alpha: 0.6, dimensions: {width: 1920, height: 1080.4}, fadeIn: { startTime: 1, duration: 1 } }] }, 'child "backgroundOverlay" fails because ["backgroundOverlay" must be an object, "backgroundOverlay" at position 0 fails because [child "dimensions" fails because [child "height" fails because ["height" must be an integer]]]]');
                });

                it('backgroundOverlay.fadeIn must be provided', function() {
                    validateCommonSchemaError({ backgroundOverlay: { color: '12a456', alpha: 0.6, dimensions: {width: 1920, height: 1080} } }, 'child "backgroundOverlay" fails because [child "fadeIn" fails because ["fadeIn" is required], "backgroundOverlay" must be an array]');
                    validateCommonSchemaError({ backgroundOverlay: [{ color: '12a456', alpha: 0.6, dimensions: {width: 1920, height: 1080} }] }, 'child "backgroundOverlay" fails because ["backgroundOverlay" must be an object, "backgroundOverlay" at position 0 fails because [child "fadeIn" fails because ["fadeIn" is required]]]');
                });

                it('backgroundOverlay.fadeIn.startTime must be provided', function() {
                    validateCommonSchemaError({ backgroundOverlay: { color: '12a456', alpha: 0.6, dimensions: {width: 1920, height: 1080}, fadeIn: { duration: 1 } } }, 'child "backgroundOverlay" fails because [child "fadeIn" fails because [child "startTime" fails because ["startTime" is required]], "backgroundOverlay" must be an array]');
                    validateCommonSchemaError({ backgroundOverlay: [{ color: '12a456', alpha: 0.6, dimensions: {width: 1920, height: 1080}, fadeIn: { duration: 1 } }] }, 'child "backgroundOverlay" fails because ["backgroundOverlay" must be an object, "backgroundOverlay" at position 0 fails because [child "fadeIn" fails because [child "startTime" fails because ["startTime" is required]]]]');
                });

                it('backgroundOverlay.fadeIn.duration must be provided', function() {
                    validateCommonSchemaError({ backgroundOverlay: { color: '12a456', alpha: 0.6, dimensions: {width: 1920, height: 1080}, fadeIn: { startTime: 1 } } }, 'child "backgroundOverlay" fails because [child "fadeIn" fails because [child "duration" fails because ["duration" is required]], "backgroundOverlay" must be an array]');
                    validateCommonSchemaError({ backgroundOverlay: [{ color: '12a456', alpha: 0.6, dimensions: {width: 1920, height: 1080}, fadeIn: { startTime: 1 } }] }, 'child "backgroundOverlay" fails because ["backgroundOverlay" must be an object, "backgroundOverlay" at position 0 fails because [child "fadeIn" fails because [child "duration" fails because ["duration" is required]]]]');
                });

                it('backgroundOverlay.fadeIn.startTime must be >= 0', function() {
                    validateCommonSchemaError({ backgroundOverlay: { color: '12a456', alpha: 0.6, dimensions: {width: 1920, height: 1080}, fadeIn: { startTime: -3.5, duration: 1 } } }, 'child "backgroundOverlay" fails because [child "fadeIn" fails because [child "startTime" fails because ["startTime" must be larger than or equal to 0]], "backgroundOverlay" must be an array]');
                    validateCommonSchemaError({ backgroundOverlay: [{ color: '12a456', alpha: 0.6, dimensions: {width: 1920, height: 1080}, fadeIn: { startTime: -1.2, duration: 1 } }] }, 'child "backgroundOverlay" fails because ["backgroundOverlay" must be an object, "backgroundOverlay" at position 0 fails because [child "fadeIn" fails because [child "startTime" fails because ["startTime" must be larger than or equal to 0]]]]');
                });

                it('backgroundOverlay.fadeIn.duration must be >= 0', function() {
                    validateCommonSchemaError({ backgroundOverlay: { color: '12a456', alpha: 0.6, dimensions: {width: 1920, height: 1080}, fadeIn: { startTime: 1, duration: -10 } } }, 'child "backgroundOverlay" fails because [child "fadeIn" fails because [child "duration" fails because ["duration" must be larger than or equal to 0]], "backgroundOverlay" must be an array]');
                    validateCommonSchemaError({ backgroundOverlay: [{ color: '12a456', alpha: 0.6, dimensions: {width: 1920, height: 1080}, fadeIn: { startTime: 1, duration: -100 } }] }, 'child "backgroundOverlay" fails because ["backgroundOverlay" must be an object, "backgroundOverlay" at position 0 fails because [child "fadeIn" fails because [child "duration" fails because ["duration" must be larger than or equal to 0]]]]');
                });

                it('backgroundOverlay.fadeOut.startTime must be provided if fadeOut is provided', function() {
                    validateCommonSchemaError({ backgroundOverlay: { color: '12a456', alpha: 0.6, dimensions: {width: 1920, height: 1080}, fadeIn: { startTime: 1, duration: 1 }, fadeOut: { duration: 1 } } }, 'child "backgroundOverlay" fails because [child "fadeOut" fails because [child "startTime" fails because ["startTime" is required]], "backgroundOverlay" must be an array]');
                    validateCommonSchemaError({ backgroundOverlay: [{ color: '12a456', alpha: 0.6, dimensions: {width: 1920, height: 1080}, fadeIn: { startTime: 1, duration: 1 }, fadeOut: { duration: 1 } }] }, 'child "backgroundOverlay" fails because ["backgroundOverlay" must be an object, "backgroundOverlay" at position 0 fails because [child "fadeOut" fails because [child "startTime" fails because ["startTime" is required]]]]');
                });

                it('backgroundOverlay.fadeOut.duration must be provided if fadeOut is provided', function() {
                    validateCommonSchemaError({ backgroundOverlay: { color: '12a456', alpha: 0.6, dimensions: {width: 1920, height: 1080}, fadeIn: { startTime: 1, duration: 1 }, fadeOut: { startTime: 1 } } }, 'child "backgroundOverlay" fails because [child "fadeOut" fails because [child "duration" fails because ["duration" is required]], "backgroundOverlay" must be an array]');
                    validateCommonSchemaError({ backgroundOverlay: [{ color: '12a456', alpha: 0.6, dimensions: {width: 1920, height: 1080}, fadeIn: { startTime: 1, duration: 1 }, fadeOut: { startTime: 1 } }] }, 'child "backgroundOverlay" fails because ["backgroundOverlay" must be an object, "backgroundOverlay" at position 0 fails because [child "fadeOut" fails because [child "duration" fails because ["duration" is required]]]]');
                });
            });

            describe('Invalid imageOverlay inputs', function() {

            });

            describe('Invalid textOverlay inputs', function() {

            });

            describe('Invalid output inputs', function() {

            });

            describe('Invalid workingDirectory inputs', function() {

            });

        });

    })

});