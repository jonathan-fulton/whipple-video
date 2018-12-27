'use strict';

const Should = require('should');
const Path = require('path');

const FfmpegCommandServiceFactory = require('../lib/ffmpegCommandServiceFactory');

describe('FfmpegCommandService', function() {
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


    describe('createFfmpegCommand', function() {

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

                Should(command).eql('/usr/local/bin/ffmpeg -i ' + Path.resolve(__dirname, './fixtures/assets1/sample.mp4') + ' -filter_complex "[0:v] trim=start=0:duration=600, setpts=PTS-STARTPTS [v0]; [v0] concat=n=1:v=1:a=0 [v_concat]; [v_concat] scale=1920:1080 [v_scaled]" -map "[v_scaled]" -y ' + Path.resolve(__dirname, './fixtures/assets1/output.mp4'));
            });

            it('Should work with a video and an audio object provided', function() {
                const command = ffmpegCommandService.createFfmpegCommand({
                    video: {
                        filePath: 'sample.mp4',
                        dimensions: {
                            width: 1920,
                            height: 1080
                        },
                        trimStart: 0,
                        trimDuration: 10
                    },
                    audio: {
                        filePath: 'music.mp3',
                        trimStart: 0,
                        trimDuration: 10
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

                Should(command).eql('/usr/local/bin/ffmpeg -i ' + Path.resolve(__dirname, './fixtures/assets1/sample.mp4') + ' -i ' + Path.resolve(__dirname, './fixtures/assets1/music.mp3') + ' -filter_complex "[0:v] trim=start=0:duration=10, setpts=PTS-STARTPTS [v0]; [v0] concat=n=1:v=1:a=0 [v_concat]; [1:a] atrim=start=0:duration=10, asetpts=PTS-STARTPTS [a0]; [a0] concat=n=1:v=0:a=1 [a_concat]; [v_concat] scale=1920:1080 [v_scaled]" -map "[v_scaled]" -map "[a_concat]" -y ' + Path.resolve(__dirname, './fixtures/assets1/output.mp4'));
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

                Should(command).eql('/usr/local/bin/ffmpeg -i ' + Path.resolve(__dirname, './fixtures/assets1/sample.mp4') + ' -f lavfi -i color=c=aaaaaa:size=1920x1080 -filter_complex "[0:v] trim=start=0:duration=600, setpts=PTS-STARTPTS [v0]; [v0] concat=n=1:v=1:a=0 [v_concat]; [1:v] format=yuva420p, colorchannelmixer=aa=0.6 [v_overlay_0_mixin]; [v_overlay_0_mixin] fade=t=in:st=5:d=1:alpha=1 [v_overlay_0_fade]; [v_concat] [v_overlay_0_fade] overlay=shortest=1 [v_overlay_0]; [v_overlay_0] scale=1920:1080 [v_scaled]" -map "[v_scaled]" -y ' + Path.resolve(__dirname, './fixtures/assets1/output.mp4'));
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
                        xLoc: 500,
                        yLoc: 400,
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

                Should(command).eql('/usr/local/bin/ffmpeg -i ' + Path.resolve(__dirname, './fixtures/assets1/sample.mp4') + ' -loop 1 -i ' + Path.resolve(__dirname, './fixtures/assets1/logo.png') + ' -filter_complex "[0:v] trim=start=0:duration=600, setpts=PTS-STARTPTS [v0]; [v0] concat=n=1:v=1:a=0 [v_concat]; [1] fade=t=in:st=5:d=2:alpha=1, fade=t=out:st=10:d=1:alpha=1 [v_image_0_layer]; [v_concat] [v_image_0_layer] overlay=x=500:y=400:shortest=1 [v_image_0]; [v_image_0] scale=1920:1080 [v_scaled]" -map "[v_scaled]" -y ' + Path.resolve(__dirname, './fixtures/assets1/output.mp4'));
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

                Should(command).eql('/usr/local/bin/ffmpeg -i ' + Path.resolve(__dirname, './fixtures/assets1/sample.mp4') + ' -filter_complex "[0:v] trim=start=0:duration=600, setpts=PTS-STARTPTS [v0]; [v0] concat=n=1:v=1:a=0 [v_concat]; [v_concat] drawtext=enable=1:text=\'Hello, world\\!\':x=600:y=600:fontfile=' + Path.resolve(__dirname, './fixtures/fonts1/Avenir.ttc') + ':fontsize=50:fontcolor_expr=ffffff%{eif\\\\\\\\: clip(255*1*(1*between(t\\\\, 6\\\\, 10) + ((t - 5)/1)*between(t\\\\, 5\\\\, 6) + (-(t - 11)/1)*between(t\\\\, 10\\\\, 11) )\\\\, 0\\\\, 255) \\\\\\\\: x\\\\\\\\: 2 } [v_text]; [v_text] scale=1920:1080 [v_scaled]" -map "[v_scaled]" -y ' + Path.resolve(__dirname, './fixtures/assets1/output.mp4'));
            });

            it('Should support horizontal text alignment via xLoc', function() {
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
                        xLoc: 'center',
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

                Should(command).eql('/usr/local/bin/ffmpeg -i ' + Path.resolve(__dirname, './fixtures/assets1/sample.mp4') + ' -filter_complex "[0:v] trim=start=0:duration=600, setpts=PTS-STARTPTS [v0]; [v0] concat=n=1:v=1:a=0 [v_concat]; [v_concat] drawtext=enable=1:text=\'Hello, world\\!\':x=(main_w/2-text_w/2):y=600:fontfile=' + Path.resolve(__dirname, './fixtures/fonts1/Avenir.ttc') + ':fontsize=50:fontcolor_expr=ffffff%{eif\\\\\\\\: clip(255*1*(1*between(t\\\\, 6\\\\, 10) + ((t - 5)/1)*between(t\\\\, 5\\\\, 6) + (-(t - 11)/1)*between(t\\\\, 10\\\\, 11) )\\\\, 0\\\\, 255) \\\\\\\\: x\\\\\\\\: 2 } [v_text]; [v_text] scale=1920:1080 [v_scaled]" -map "[v_scaled]" -y ' + Path.resolve(__dirname, './fixtures/assets1/output.mp4'));
            });

            it('Should support horizontal and vertical text alignment', function() {
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
                        xLoc: 'center',
                        yLoc: 'center',
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

                Should(command).eql('/usr/local/bin/ffmpeg -i ' + Path.resolve(__dirname, './fixtures/assets1/sample.mp4') + ' -filter_complex "[0:v] trim=start=0:duration=600, setpts=PTS-STARTPTS [v0]; [v0] concat=n=1:v=1:a=0 [v_concat]; [v_concat] drawtext=enable=1:text=\'Hello, world\\!\':x=(main_w/2-text_w/2):y=(main_h/2-text_h/2):fontfile=' + Path.resolve(__dirname, './fixtures/fonts1/Avenir.ttc') + ':fontsize=50:fontcolor_expr=ffffff%{eif\\\\\\\\: clip(255*1*(1*between(t\\\\, 6\\\\, 10) + ((t - 5)/1)*between(t\\\\, 5\\\\, 6) + (-(t - 11)/1)*between(t\\\\, 10\\\\, 11) )\\\\, 0\\\\, 255) \\\\\\\\: x\\\\\\\\: 2 } [v_text]; [v_text] scale=1920:1080 [v_scaled]" -map "[v_scaled]" -y ' + Path.resolve(__dirname, './fixtures/assets1/output.mp4'));
            });

            it('Should support vertical bottom text alignment', function() {
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
                        yLoc: 'bottom',
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

                Should(command).eql('/usr/local/bin/ffmpeg -i ' + Path.resolve(__dirname, './fixtures/assets1/sample.mp4') + ' -filter_complex "[0:v] trim=start=0:duration=600, setpts=PTS-STARTPTS [v0]; [v0] concat=n=1:v=1:a=0 [v_concat]; [v_concat] drawtext=enable=1:text=\'Hello, world\\!\':x=600:y=main_h-text_h-50:fontfile=' + Path.resolve(__dirname, './fixtures/fonts1/Avenir.ttc') + ':fontsize=50:fontcolor_expr=ffffff%{eif\\\\\\\\: clip(255*1*(1*between(t\\\\, 6\\\\, 10) + ((t - 5)/1)*between(t\\\\, 5\\\\, 6) + (-(t - 11)/1)*between(t\\\\, 10\\\\, 11) )\\\\, 0\\\\, 255) \\\\\\\\: x\\\\\\\\: 2 } [v_text]; [v_text] scale=1920:1080 [v_scaled]" -map "[v_scaled]" -y ' + Path.resolve(__dirname, './fixtures/assets1/output.mp4'));
            });

            it('Should work with multiple values provided for each command property', function() {
                const command = ffmpegCommandService.createFfmpegCommand({
                    video: [{
                        filePath: 'sample.mp4',
                        dimensions: {
                            width: 1920,
                            height: 1080
                        },
                        trimStart: 0,
                        trimDuration: 10
                    }, {
                        filePath: 'sample2.mp4',
                        dimensions: {
                            width: 1920,
                            height: 1080
                        },
                        trimStart: 0,
                        trimDuration: 10
                    }],
                    audio: [{
                        filePath: 'music.mp3',
                        trimStart: 0,
                        trimDuration: 9
                    }, {
                        filePath: 'music2.mp3',
                        trimStart: 0,
                        trimDuration: 8,
                        paddingDuration: 3
                    }],
                    backgroundOverlay: [{
                        color: '555555',
                        alpha: 0.6,
                        dimensions: {
                            width: 1920,
                            height: 1080
                        },
                        fadeIn: {
                            startTime: 5,
                            duration: 1
                        },
                        fadeOut: {
                            startTime: 8,
                            duration: 3
                        }
                    },{
                        color: 'ff0000',
                        alpha: 0.7,
                        dimensions: {
                            width: 1920,
                            height: 1080
                        },
                        fadeIn: {
                            startTime: 14,
                            duration: 1
                        }
                    }],
                    imageOverlay: [{
                        filePath: 'logo.png',
                        xLoc: 300,
                        yLoc: 400,
                        fadeIn: {
                            startTime: 5,
                            duration: 2
                        },
                        fadeOut: {
                            startTime: 10,
                            duration: 1
                        }
                    },{
                        filePath: 'logo.png',
                        xLoc: 1000,
                        yLoc: 400,
                        fadeIn: {
                            startTime: 15,
                            duration: 2
                        }
                    }],
                    textOverlay: [{
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
                        }
                    }, {
                        text: 'Go away!',
                        fontName: 'Avenir',
                        fontSize: 75,
                        fontColor: 'ff0000',
                        fontAlpha: 0.8,
                        xLoc: 800,
                        yLoc: 400,
                        fadeIn: {
                            startTime: 7,
                            duration: 2
                        },
                        fadeOut: {
                            startTime: 15,
                            duration: 1
                        }
                    }],
                    output: {
                        filePath: 'output.mp4',
                        dimensions: {
                            width: 1920,
                            height: 1080
                        },
                        crop: {
                            outputWidth: '540',
                            outputHeight: '1080',
                            xLoc: 480,
                            yLoc: 0
                        }
                    },
                    workingDirectory: Path.resolve(__dirname, './fixtures/assets1')
                });

                Should(command).eql('/usr/local/bin/ffmpeg -i ' + Path.resolve(__dirname, './fixtures/assets1/sample.mp4') + ' -i ' + Path.resolve(__dirname, './fixtures/assets1/sample2.mp4') + ' -f lavfi -i color=c=555555:size=1920x1080 -f lavfi -i color=c=ff0000:size=1920x1080 -loop 1 -i ' +  Path.resolve(__dirname, './fixtures/assets1/logo.png') + ' -loop 1 -i ' + Path.resolve(__dirname, './fixtures/assets1/logo.png') + ' -i ' + Path.resolve(__dirname, './fixtures/assets1/music.mp3') + ' -i ' + Path.resolve(__dirname, './fixtures/assets1/music2.mp3') + ' -filter_complex "aevalsrc=0:d=3 [a1_padding]; [0:v] trim=start=0:duration=10, setpts=PTS-STARTPTS [v0]; [1:v] trim=start=0:duration=10, setpts=PTS-STARTPTS [v1]; [v0] [v1] concat=n=2:v=1:a=0 [v_concat]; [2:v] format=yuva420p, colorchannelmixer=aa=0.6 [v_overlay_0_mixin]; [v_overlay_0_mixin] fade=t=in:st=5:d=1:alpha=1, fade=t=out:st=8:d=3:alpha=1 [v_overlay_0_fade]; [v_concat] [v_overlay_0_fade] overlay=shortest=1 [v_overlay_0]; [3:v] format=yuva420p, colorchannelmixer=aa=0.7 [v_overlay_1_mixin]; [v_overlay_1_mixin] fade=t=in:st=14:d=1:alpha=1 [v_overlay_1_fade]; [v_overlay_0] [v_overlay_1_fade] overlay=shortest=1 [v_overlay_1]; [4] fade=t=in:st=5:d=2:alpha=1, fade=t=out:st=10:d=1:alpha=1 [v_image_0_layer]; [v_overlay_1] [v_image_0_layer] overlay=x=300:y=400:shortest=1 [v_image_0]; [5] fade=t=in:st=15:d=2:alpha=1 [v_image_1_layer]; [v_image_0] [v_image_1_layer] overlay=x=1000:y=400:shortest=1 [v_image_1]; [v_image_1] drawtext=enable=1:text=\'Hello, world\\!\':x=600:y=600:fontfile=' + Path.resolve(__dirname, './fixtures/fonts1/Avenir.ttc') + ':fontsize=50:fontcolor_expr=ffffff%{eif\\\\\\\\: clip(255*1*(1*between(t\\\\, 6\\\\, 10) + ((t - 5)/1)*between(t\\\\, 5\\\\, 6) + (-(t - 11)/1)*between(t\\\\, 10\\\\, 11) )\\\\, 0\\\\, 255) \\\\\\\\: x\\\\\\\\: 2 }, drawtext=enable=1:text=\'Go away\\!\':x=800:y=400:fontfile=' + Path.resolve(__dirname, './fixtures/fonts1/Avenir.ttc') + ':fontsize=75:fontcolor_expr=ff0000%{eif\\\\\\\\: clip(255*0.8*(1*between(t\\\\, 9\\\\, 15) + ((t - 7)/2)*between(t\\\\, 7\\\\, 9) + (-(t - 16)/1)*between(t\\\\, 15\\\\, 16) )\\\\, 0\\\\, 255) \\\\\\\\: x\\\\\\\\: 2 } [v_text]; [6:a] atrim=start=0:duration=9, asetpts=PTS-STARTPTS [a0]; [7:a] atrim=start=0:duration=8, asetpts=PTS-STARTPTS [a1]; [a0] [a1_padding] [a1] concat=n=3:v=0:a=1 [a_concat]; [v_text] scale=1920:1080 [v_scaled]; [v_scaled] crop=540:1080:480:0 [v_cropped]" -map "[v_cropped]" -map "[a_concat]" -y ' + Path.resolve(__dirname, './fixtures/assets1/output.mp4'));
            })
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
                it('video array must contain at least one item', function() {
                    validateCommonSchemaError({ video: [] }, 'child "video" fails because ["video" must be an object, "video" does not contain 1 required value(s)]');
                });

                it('video.filePath must be provided', function() {
                    validateCommonSchemaError({ video: { dimensions: { width: 1920, height: 1080 } } }, 'child "video" fails because [child "filePath" fails because ["filePath" is required], "video" must be an array]');
                    validateCommonSchemaError({ video: [{ dimensions: { width: 1920, height: 1080 } }] }, 'child "video" fails because ["video" must be an object, "video" at position 0 fails because [child "filePath" fails because ["filePath" is required]]]');
                });

                it('video.filePath must be a string', function() {
                    validateCommonSchemaError({ video: { filePath: 1, dimensions: { width: 1920, height: 1080 } } }, 'child "video" fails because [child "filePath" fails because ["filePath" must be a string], "video" must be an array]');
                    validateCommonSchemaError({ video: [{ filePath: 1, dimensions: { width: 1920, height: 1080 } }] }, 'child "video" fails because ["video" must be an object, "video" at position 0 fails because [child "filePath" fails because ["filePath" must be a string]]]');
                });

                it('video.filePath must exist as an actual file', function() {
                    validateCommonSchemaError({ video: { filePath: 'unknownfile.mp4', dimensions: { width: 1920, height: 1080 } } }, `video file "${Path.resolve(__dirname, 'fixtures/assets1/unknownfile.mp4')}" does not exist.`);
                    validateCommonSchemaError({ video: [{ filePath: 'unknownfile.mp4', dimensions: { width: 1920, height: 1080 } }] }, `video file "${Path.resolve(__dirname, 'fixtures/assets1/unknownfile.mp4')}" does not exist.`);
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

                it('video.trimStart must be a number between 0 and 600 (< 0 tested)', function() {
                    validateCommonSchemaError({ video: { filePath: 'sample.mp4', trimStart: -1, dimensions: { width: 1920, height: 1080 } } }, 'child "video" fails because [child "trimStart" fails because ["trimStart" must be larger than or equal to 0], "video" must be an array]');
                    validateCommonSchemaError({ video: [{ filePath: 'sample.mp4', trimStart: -1, dimensions: { width: 1920, height: 1080 } }] }, 'child "video" fails because ["video" must be an object, "video" at position 0 fails because [child "trimStart" fails because ["trimStart" must be larger than or equal to 0]]]');
                });

                it('video.trimStart must be a number between 0 and 600 (> 600 tested)', function() {
                    validateCommonSchemaError({ video: { filePath: 'sample.mp4', trimStart: 601, dimensions: { width: 1920, height: 1080 } } }, 'child "video" fails because [child "trimStart" fails because ["trimStart" must be less than or equal to 600], "video" must be an array]');
                    validateCommonSchemaError({ video: [{ filePath: 'sample.mp4', trimStart: 7000, dimensions: { width: 1920, height: 1080 } }] }, 'child "video" fails because ["video" must be an object, "video" at position 0 fails because [child "trimStart" fails because ["trimStart" must be less than or equal to 600]]]');
                });

                it('video.trimDuration must be a number between 0 and 600 (< 0 tested)', function() {
                    validateCommonSchemaError({ video: { filePath: 'sample.mp4', trimDuration: -1, dimensions: { width: 1920, height: 1080 } } }, 'child "video" fails because [child "trimDuration" fails because ["trimDuration" must be larger than or equal to 0], "video" must be an array]');
                    validateCommonSchemaError({ video: [{ filePath: 'sample.mp4', trimDuration: -1, dimensions: { width: 1920, height: 1080 } }] }, 'child "video" fails because ["video" must be an object, "video" at position 0 fails because [child "trimDuration" fails because ["trimDuration" must be larger than or equal to 0]]]');
                });

                it('video.trimDuration must be a number between 0 and 600 (> 600 tested)', function() {
                    validateCommonSchemaError({ video: { filePath: 'sample.mp4', trimDuration: 1323, dimensions: { width: 1920, height: 1080 } } }, 'child "video" fails because [child "trimDuration" fails because ["trimDuration" must be less than or equal to 600], "video" must be an array]');
                    validateCommonSchemaError({ video: [{ filePath: 'sample.mp4', trimDuration: 601, dimensions: { width: 1920, height: 1080 } }] }, 'child "video" fails because ["video" must be an object, "video" at position 0 fails because [child "trimDuration" fails because ["trimDuration" must be less than or equal to 600]]]');
                });

                it('video has unknown property', function() {
                    validateCommonSchemaError({ video: { filePath: 'sample.mp4', dimensions: { width: 1920, height: 1080 }, badProperty: true } }, 'child "video" fails because ["badProperty" is not allowed, "video" must be an array]');
                    validateCommonSchemaError({ video: [{ filePath: 'sample.mp4', dimensions: { width: 1920, height: 1080 }, badProperty: true }] }, 'child "video" fails because ["video" must be an object, "video" at position 0 fails because ["badProperty" is not allowed]]');
                });
            });

            describe('Invalid audio inputs', function() {
                it('audio array must contain at least one item', function() {
                    validateCommonSchemaError({ audio: [] }, 'child "audio" fails because ["audio" must be an object, "audio" must contain at least 1 items]');
                });

                it('audio.filePath must be provided', function() {
                    validateCommonSchemaError({ audio: { } }, 'child "audio" fails because [child "filePath" fails because ["filePath" is required], "audio" must be an array]');
                    validateCommonSchemaError({ audio: [{ }] }, 'child "audio" fails because ["audio" must be an object, "audio" at position 0 fails because [child "filePath" fails because ["filePath" is required]]]');
                });

                it('audio.filePath must be a string', function() {
                    validateCommonSchemaError({ audio: { filePath: 1 } }, 'child "audio" fails because [child "filePath" fails because ["filePath" must be a string], "audio" must be an array]');
                    validateCommonSchemaError({ audio: [{ filePath: 1 }] }, 'child "audio" fails because ["audio" must be an object, "audio" at position 0 fails because [child "filePath" fails because ["filePath" must be a string]]]');
                });

                it('audio.filePath must exist as an actual file', function() {
                    validateCommonSchemaError({ audio: { filePath: 'unknownfile.mp3' } }, `audio file "${Path.resolve(__dirname, 'fixtures/assets1/unknownfile.mp3')}" does not exist.`);
                    validateCommonSchemaError({ audio: [{ filePath: 'unknownfile.mp3' }] }, `audio file "${Path.resolve(__dirname, 'fixtures/assets1/unknownfile.mp3')}" does not exist.`);
                });

                it('audio.trimStart must be a number between 0 and 600 (< 0 tested)', function() {
                    validateCommonSchemaError({ audio: { filePath: 'music.mp3', trimStart: -1 } }, 'child "audio" fails because [child "trimStart" fails because ["trimStart" must be larger than or equal to 0], "audio" must be an array]');
                    validateCommonSchemaError({ audio: [{ filePath: 'music.mp3', trimStart: -1 }] }, 'child "audio" fails because ["audio" must be an object, "audio" at position 0 fails because [child "trimStart" fails because ["trimStart" must be larger than or equal to 0]]]');
                });

                it('audio.trimStart must be a number between 0 and 600 (> 600 tested)', function() {
                    validateCommonSchemaError({ audio: { filePath: 'music.mp3', trimStart: 601 } }, 'child "audio" fails because [child "trimStart" fails because ["trimStart" must be less than or equal to 600], "audio" must be an array]');
                    validateCommonSchemaError({ audio: [{ filePath: 'music.mp3', trimStart: 7000 }] }, 'child "audio" fails because ["audio" must be an object, "audio" at position 0 fails because [child "trimStart" fails because ["trimStart" must be less than or equal to 600]]]');
                });

                it('audio.trimDuration must be a number between 0 and 600 (< 0 tested)', function() {
                    validateCommonSchemaError({ audio: { filePath: 'music.mp3', trimDuration: -1 } }, 'child "audio" fails because [child "trimDuration" fails because ["trimDuration" must be larger than or equal to 0], "audio" must be an array]');
                    validateCommonSchemaError({ audio: [{ filePath: 'music.mp3', trimDuration: -1 }] }, 'child "audio" fails because ["audio" must be an object, "audio" at position 0 fails because [child "trimDuration" fails because ["trimDuration" must be larger than or equal to 0]]]');
                });

                it('audio.trimDuration must be a number between 0 and 600 (> 600 tested)', function() {
                    validateCommonSchemaError({ audio: { filePath: 'music.mp3', trimDuration: 17893 } }, 'child "audio" fails because [child "trimDuration" fails because ["trimDuration" must be less than or equal to 600], "audio" must be an array]');
                    validateCommonSchemaError({ audio: [{ filePath: 'music.mp3', trimDuration: 601 }] }, 'child "audio" fails because ["audio" must be an object, "audio" at position 0 fails because [child "trimDuration" fails because ["trimDuration" must be less than or equal to 600]]]');
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

                it('backgroundOverlay has unknown property', function() {
                    validateCommonSchemaError({ backgroundOverlay: { badProperty: true, color: 'ffffff',alpha: 0.6, dimensions: {width: 1920, height: 1080}, fadeIn: { startTime: 1, duration: 1 } } }, 'child "backgroundOverlay" fails because ["badProperty" is not allowed, "backgroundOverlay" must be an array]');
                    validateCommonSchemaError({ backgroundOverlay: [{ badProperty: true, color: 'ffffff', alpha: 0.6, dimensions: {width: 1920, height: 1080}, fadeIn: { startTime: 1, duration: 1 } }] }, 'child "backgroundOverlay" fails because ["backgroundOverlay" must be an object, "backgroundOverlay" at position 0 fails because ["badProperty" is not allowed]]');
                });
            });

            describe('Invalid imageOverlay inputs', function() {
                it('imageOverlay.filePath must be provided', function() {
                    validateCommonSchemaError({ imageOverlay: { xLoc: 0, yLoc: 0, fadeIn: { startTime: 1, duration: 1 } } }, 'child "imageOverlay" fails because [child "filePath" fails because ["filePath" is required], "imageOverlay" must be an array]');
                    validateCommonSchemaError({ imageOverlay: [{ xLoc: 0, yLoc: 0, fadeIn: { startTime: 1, duration: 1 } }] }, 'child "imageOverlay" fails because ["imageOverlay" must be an object, "imageOverlay" at position 0 fails because [child "filePath" fails because ["filePath" is required]]]');
                });

                it('imageOverlay.filePath must exist as an actual file', function() {
                    validateCommonSchemaError({ imageOverlay: { filePath: 'unknownfile.png', xLoc: 0, yLoc: 0, fadeIn: { startTime: 1, duration: 1 } } }, `imageOverlay file "${Path.resolve(__dirname, 'fixtures/assets1/unknownfile.png')}" does not exist.`);
                    validateCommonSchemaError({ imageOverlay: [{ filePath: 'unknownfile.png', xLoc: 0, yLoc: 0,fadeIn: { startTime: 1, duration: 1 } }] }, `imageOverlay file "${Path.resolve(__dirname, 'fixtures/assets1/unknownfile.png')}" does not exist.`);
                });

                it('imageOverlay.xLoc must be provided', function() {
                    validateCommonSchemaError({ imageOverlay: { filePath: 'logo.png', yLoc: 0, fadeIn: { startTime: 1, duration: 1 } } }, 'child "imageOverlay" fails because [child "xLoc" fails because ["xLoc" is required], "imageOverlay" must be an array]');
                    validateCommonSchemaError({ imageOverlay: [{ filePath: 'logo.png', yLoc: 0, fadeIn: { startTime: 1, duration: 1 } }] }, 'child "imageOverlay" fails because ["imageOverlay" must be an object, "imageOverlay" at position 0 fails because [child "xLoc" fails because ["xLoc" is required]]]');
                });

                it('imageOverlay.xLoc must be an integer', function() {
                    validateCommonSchemaError({ imageOverlay: { filePath: 'logo.png', xLoc: 20.2, yLoc: 0, fadeIn: { startTime: 1, duration: 1 } } }, 'child "imageOverlay" fails because [child "xLoc" fails because ["xLoc" must be an integer], "imageOverlay" must be an array]');
                    validateCommonSchemaError({ imageOverlay: [{ filePath: 'logo.png', xLoc: 30.1, yLoc: 0, fadeIn: { startTime: 1, duration: 1 } }] }, 'child "imageOverlay" fails because ["imageOverlay" must be an object, "imageOverlay" at position 0 fails because [child "xLoc" fails because ["xLoc" must be an integer]]]');
                });

                it('imageOverlay.yLoc must be provided', function() {
                    validateCommonSchemaError({ imageOverlay: { filePath: 'logo.png', xLoc: 0, fadeIn: { startTime: 1, duration: 1 } } }, 'child "imageOverlay" fails because [child "yLoc" fails because ["yLoc" is required], "imageOverlay" must be an array]');
                    validateCommonSchemaError({ imageOverlay: [{ filePath: 'logo.png', xLoc: 0, fadeIn: { startTime: 1, duration: 1 } }] }, 'child "imageOverlay" fails because ["imageOverlay" must be an object, "imageOverlay" at position 0 fails because [child "yLoc" fails because ["yLoc" is required]]]');
                });

                it('imageOverlay.yLoc must be an integer', function() {
                    validateCommonSchemaError({ imageOverlay: { filePath: 'logo.png', xLoc: 0, yLoc: -10.1, fadeIn: { startTime: 1, duration: 1 } } }, 'child "imageOverlay" fails because [child "yLoc" fails because ["yLoc" must be an integer], "imageOverlay" must be an array]');
                    validateCommonSchemaError({ imageOverlay: [{ filePath: 'logo.png', xLoc: 0, yLoc: 500.2, fadeIn: { startTime: 1, duration: 1 } }] }, 'child "imageOverlay" fails because ["imageOverlay" must be an object, "imageOverlay" at position 0 fails because [child "yLoc" fails because ["yLoc" must be an integer]]]');
                });

                it('imageOverlay.fadeIn must be provided', function() {
                    validateCommonSchemaError({ imageOverlay: { filePath: 'logo.png', xLoc: 0, yLoc: 0 } }, 'child "imageOverlay" fails because [child "fadeIn" fails because ["fadeIn" is required], "imageOverlay" must be an array]');
                    validateCommonSchemaError({ imageOverlay: [{ filePath: 'logo.png', xLoc: 0, yLoc: 0 }] }, 'child "imageOverlay" fails because ["imageOverlay" must be an object, "imageOverlay" at position 0 fails because [child "fadeIn" fails because ["fadeIn" is required]]]');
                });

                it('imageOverlay.fadeIn.startTime must be provided', function() {
                    validateCommonSchemaError({ imageOverlay: { filePath: 'logo.png', xLoc: 0, yLoc: 0, fadeIn: { duration: 1 } } }, 'child "imageOverlay" fails because [child "fadeIn" fails because [child "startTime" fails because ["startTime" is required]], "imageOverlay" must be an array]');
                    validateCommonSchemaError({ imageOverlay: [{ filePath: 'logo.png', xLoc: 0, yLoc: 0, fadeIn: { duration: 1 } }] }, 'child "imageOverlay" fails because ["imageOverlay" must be an object, "imageOverlay" at position 0 fails because [child "fadeIn" fails because [child "startTime" fails because ["startTime" is required]]]]');
                });

                it('imageOverlay.fadeIn.duration must be provided', function() {
                    validateCommonSchemaError({ imageOverlay: { filePath: 'logo.png', xLoc: 0, yLoc: 0, fadeIn: { startTime: 1 } } }, 'child "imageOverlay" fails because [child "fadeIn" fails because [child "duration" fails because ["duration" is required]], "imageOverlay" must be an array]');
                    validateCommonSchemaError({ imageOverlay: [{ filePath: 'logo.png', xLoc: 0, yLoc: 0, fadeIn: { startTime: 1 } }] }, 'child "imageOverlay" fails because ["imageOverlay" must be an object, "imageOverlay" at position 0 fails because [child "fadeIn" fails because [child "duration" fails because ["duration" is required]]]]');
                });

                it('imageOverlay.fadeOut.startTime must be provided if fadeOut is provided', function() {
                    validateCommonSchemaError({ imageOverlay: { filePath: 'logo.png', xLoc: 0, yLoc: 0, fadeIn: { duration: 1 } } }, 'child "imageOverlay" fails because [child "fadeIn" fails because [child "startTime" fails because ["startTime" is required]], "imageOverlay" must be an array]');
                    validateCommonSchemaError({ imageOverlay: [{ filePath: 'logo.png', xLoc: 0, yLoc: 0, fadeIn: { duration: 1 } }] }, 'child "imageOverlay" fails because ["imageOverlay" must be an object, "imageOverlay" at position 0 fails because [child "fadeIn" fails because [child "startTime" fails because ["startTime" is required]]]]');
                });

                it('imageOverlay.fadeOut.duration must be provided if fadeOut is provided', function() {
                    validateCommonSchemaError({ imageOverlay: { filePath: 'logo.png', xLoc: 0, yLoc: 0, fadeIn: { startTime: 1 } } }, 'child "imageOverlay" fails because [child "fadeIn" fails because [child "duration" fails because ["duration" is required]], "imageOverlay" must be an array]');
                    validateCommonSchemaError({ imageOverlay: [{ filePath: 'logo.png', xLoc: 0, yLoc: 0, fadeIn: { startTime: 1 } }] }, 'child "imageOverlay" fails because ["imageOverlay" must be an object, "imageOverlay" at position 0 fails because [child "fadeIn" fails because [child "duration" fails because ["duration" is required]]]]');
                });

                it('imageOverlay has unknown property', function() {
                    validateCommonSchemaError({ imageOverlay: { badProperty: true, filePath: 'logo.png', xLoc: 0, yLoc: 0, fadeIn: { startTime: 1, duration: 1 } } }, 'child "imageOverlay" fails because ["badProperty" is not allowed, "imageOverlay" must be an array]');
                    validateCommonSchemaError({ imageOverlay: [{ badProperty: true, filePath: 'logo.png', xLoc: 0, yLoc: 0, fadeIn: { startTime: 1, duration: 1 } }] }, 'child "imageOverlay" fails because ["imageOverlay" must be an object, "imageOverlay" at position 0 fails because ["badProperty" is not allowed]]');
                });
            });

            describe('Invalid textOverlay inputs', function() {
                it('textOverlay array must contain at least one item', function() {
                    validateCommonSchemaError({ textOverlay: [] }, 'child "textOverlay" fails because ["textOverlay" must be an object, "textOverlay" must contain at least 1 items]');
                });

                it('textOverlay.text must be provided', function() {
                    validateCommonSchemaError({ textOverlay: {fontName: 'Avenir', fontSize: 40, fontColor: 'ffffff', fontAlpha: 1.0, xLoc: 400, yLoc: 400, fadeIn: { startTime: 1, duration: 1 } } }, 'child "textOverlay" fails because [child "text" fails because ["text" is required], "textOverlay" must be an array]');
                    validateCommonSchemaError({ textOverlay: [{fontName: 'Avenir', fontSize: 40, fontColor: 'ffffff', fontAlpha: 1.0, xLoc: 400, yLoc: 400, fadeIn: { startTime: 1, duration: 1 } }] }, 'child "textOverlay" fails because ["textOverlay" must be an object, "textOverlay" at position 0 fails because [child "text" fails because ["text" is required]]]');
                });

                it('textOverlay.fontName must be provided', function() {
                    validateCommonSchemaError({ textOverlay: {text: 'Hello, world', fontSize: 40, fontColor: 'ffffff', fontAlpha: 1.0, xLoc: 400, yLoc: 400, fadeIn: { startTime: 1, duration: 1 } } }, 'child "textOverlay" fails because [child "fontName" fails because ["fontName" is required], "textOverlay" must be an array]');
                    validateCommonSchemaError({ textOverlay: [{text: 'Hello, world', fontSize: 40, fontColor: 'ffffff', fontAlpha: 1.0, xLoc: 400, yLoc: 400, fadeIn: { startTime: 1, duration: 1 } }] }, 'child "textOverlay" fails because ["textOverlay" must be an object, "textOverlay" at position 0 fails because [child "fontName" fails because ["fontName" is required]]]');
                });

                it('textOverlay.fontName must exist in font config', function() {
                    validateCommonSchemaError({ textOverlay: {text: 'Hello, world!', fontName: 'unknown', fontSize: 40, fontColor: 'ffffff', fontAlpha: 1.0, xLoc: 400, yLoc: 400, fadeIn: { startTime: 1, duration: 1 } } }, 'Font with name "unknown" does not exist.');
                    validateCommonSchemaError({ textOverlay: [{text: 'Hello, world!', fontName: 'unknown', fontSize: 40, fontColor: 'ffffff', fontAlpha: 1.0, xLoc: 400, yLoc: 400, fadeIn: { startTime: 1, duration: 1 } }] }, 'Font with name "unknown" does not exist.');
                });

                it('textOverlay.fontSize must be provided', function() {
                    validateCommonSchemaError({ textOverlay: {text: 'Hello, world', fontName: 'Avenir', fontColor: 'ffffff', fontAlpha: 1.0, xLoc: 400, yLoc: 400, fadeIn: { startTime: 1, duration: 1 } } }, 'child "textOverlay" fails because [child "fontSize" fails because ["fontSize" is required], "textOverlay" must be an array]');
                    validateCommonSchemaError({ textOverlay: [{text: 'Hello, world', fontName: 'Avenir', fontColor: 'ffffff', fontAlpha: 1.0, xLoc: 400, yLoc: 400, fadeIn: { startTime: 1, duration: 1 } }] }, 'child "textOverlay" fails because ["textOverlay" must be an object, "textOverlay" at position 0 fails because [child "fontSize" fails because ["fontSize" is required]]]');
                });
                it('textOverlay.fontSize must greater than 0', function() {
                    validateCommonSchemaError({ textOverlay: {text: 'Hello, world', fontName: 'Avenir', fontSize: -2, fontColor: 'ffffff', fontAlpha: 1.0, xLoc: 400, yLoc: 400, fadeIn: { startTime: 1, duration: 1 } } }, 'child "textOverlay" fails because [child "fontSize" fails because ["fontSize" must be larger than or equal to 0], "textOverlay" must be an array]');
                    validateCommonSchemaError({ textOverlay: [{text: 'Hello, world', fontName: 'Avenir', fontSize: -1, fontColor: 'ffffff', fontAlpha: 1.0, xLoc: 400, yLoc: 400, fadeIn: { startTime: 1, duration: 1 } }] }, 'child "textOverlay" fails because ["textOverlay" must be an object, "textOverlay" at position 0 fails because [child "fontSize" fails because ["fontSize" must be larger than or equal to 0]]]');
                });

                it('textOverlay.fontColor must be provided', function() {
                    validateCommonSchemaError({ textOverlay: {text: 'Hello, world', fontName: 'Avenir', fontSize: 40, fontAlpha: 1.0, xLoc: 400, yLoc: 400, fadeIn: { startTime: 1, duration: 1 } } }, 'child "textOverlay" fails because [child "fontColor" fails because ["fontColor" is required], "textOverlay" must be an array]');
                    validateCommonSchemaError({ textOverlay: [{text: 'Hello, world', fontName: 'Avenir', fontSize: 40, fontAlpha: 1.0, xLoc: 400, yLoc: 400, fadeIn: { startTime: 1, duration: 1 } }] }, 'child "textOverlay" fails because ["textOverlay" must be an object, "textOverlay" at position 0 fails because [child "fontColor" fails because ["fontColor" is required]]]');
                });
                it('textOverlay.fontSize must be a valid hex color of 6 characters (= 6 tested)', function() {
                    validateCommonSchemaError({ textOverlay: {text: 'Hello, world', fontName: 'Avenir', fontSize: 40, fontColor: '12345g', fontAlpha: 1.0, xLoc: 400, yLoc: 400, fadeIn: { startTime: 1, duration: 1 } } }, 'child "textOverlay" fails because [child "fontColor" fails because ["fontColor" must only contain hexadecimal characters], "textOverlay" must be an array]');
                    validateCommonSchemaError({ textOverlay: [{text: 'Hello, world', fontName: 'Avenir', fontSize: 40, fontColor: '12345g', fontAlpha: 1.0, xLoc: 400, yLoc: 400, fadeIn: { startTime: 1, duration: 1 } }] }, 'child "textOverlay" fails because ["textOverlay" must be an object, "textOverlay" at position 0 fails because [child "fontColor" fails because ["fontColor" must only contain hexadecimal characters]]]');
                });
                it('textOverlay.fontSize must be a valid hex color of 6 characters (< 6 tested)', function() {
                    validateCommonSchemaError({ textOverlay: {text: 'Hello, world', fontName: 'Avenir', fontSize: 40, fontColor: '12345', fontAlpha: 1.0, xLoc: 400, yLoc: 400, fadeIn: { startTime: 1, duration: 1 } } }, 'child "textOverlay" fails because [child "fontColor" fails because ["fontColor" length must be at least 6 characters long], "textOverlay" must be an array]');
                    validateCommonSchemaError({ textOverlay: [{text: 'Hello, world', fontName: 'Avenir', fontSize: 40, fontColor: '12345', fontAlpha: 1.0, xLoc: 400, yLoc: 400, fadeIn: { startTime: 1, duration: 1 } }] }, 'child "textOverlay" fails because ["textOverlay" must be an object, "textOverlay" at position 0 fails because [child "fontColor" fails because ["fontColor" length must be at least 6 characters long]]]');
                });
                it('textOverlay.fontSize must be a valid hex color of 6 characters (> 6 tested)', function() {
                    validateCommonSchemaError({ textOverlay: {text: 'Hello, world', fontName: 'Avenir', fontSize: 40, fontColor: '1234567', fontAlpha: 1.0, xLoc: 400, yLoc: 400, fadeIn: { startTime: 1, duration: 1 } } }, 'child "textOverlay" fails because [child "fontColor" fails because ["fontColor" length must be less than or equal to 6 characters long], "textOverlay" must be an array]');
                    validateCommonSchemaError({ textOverlay: [{text: 'Hello, world', fontName: 'Avenir', fontSize: 40, fontColor: '1234567', fontAlpha: 1.0, xLoc: 400, yLoc: 400, fadeIn: { startTime: 1, duration: 1 } }] }, 'child "textOverlay" fails because ["textOverlay" must be an object, "textOverlay" at position 0 fails because [child "fontColor" fails because ["fontColor" length must be less than or equal to 6 characters long]]]');
                });

                it('textOverlay.fontAlpha must be provided', function() {
                    validateCommonSchemaError({ textOverlay: {text: 'Hello, world', fontName: 'Avenir', fontSize: 40, fontColor: 'ffffff', xLoc: 400, yLoc: 400, fadeIn: { startTime: 1, duration: 1 } } }, 'child "textOverlay" fails because [child "fontAlpha" fails because ["fontAlpha" is required], "textOverlay" must be an array]');
                    validateCommonSchemaError({ textOverlay: [{text: 'Hello, world', fontName: 'Avenir', fontSize: 40, fontColor: 'ffffff', xLoc: 400, yLoc: 400, fadeIn: { startTime: 1, duration: 1 } }] }, 'child "textOverlay" fails because ["textOverlay" must be an object, "textOverlay" at position 0 fails because [child "fontAlpha" fails because ["fontAlpha" is required]]]');
                });
                it('textOverlay.fontAlpha must be between 0 and 1 (> 1 tested)', function() {
                    validateCommonSchemaError({ textOverlay: {text: 'Hello, world', fontName: 'Avenir', fontSize: 40, fontColor: 'ffffff', fontAlpha: 1.1, xLoc: 400, yLoc: 400, fadeIn: { startTime: 1, duration: 1 } } }, 'child "textOverlay" fails because [child "fontAlpha" fails because ["fontAlpha" must be less than or equal to 1], "textOverlay" must be an array]');
                    validateCommonSchemaError({ textOverlay: [{text: 'Hello, world', fontName: 'Avenir', fontSize: 40, fontColor: 'ffffff', fontAlpha: 1003.0, xLoc: 400, yLoc: 400, fadeIn: { startTime: 1, duration: 1 } }] }, 'child "textOverlay" fails because ["textOverlay" must be an object, "textOverlay" at position 0 fails because [child "fontAlpha" fails because ["fontAlpha" must be less than or equal to 1]]]');
                });
                it('textOverlay.fontAlpha must be between 0 and 1 (< 0 tested)', function() {
                    validateCommonSchemaError({ textOverlay: {text: 'Hello, world', fontName: 'Avenir', fontSize: 40, fontColor: 'ffffff', fontAlpha: -100, xLoc: 400, yLoc: 400, fadeIn: { startTime: 1, duration: 1 } } }, 'child "textOverlay" fails because [child "fontAlpha" fails because ["fontAlpha" must be larger than or equal to 0], "textOverlay" must be an array]');
                    validateCommonSchemaError({ textOverlay: [{text: 'Hello, world', fontName: 'Avenir', fontSize: 40, fontColor: 'ffffff', fontAlpha: -200, xLoc: 400, yLoc: 400, fadeIn: { startTime: 1, duration: 1 } }] }, 'child "textOverlay" fails because ["textOverlay" must be an object, "textOverlay" at position 0 fails because [child "fontAlpha" fails because ["fontAlpha" must be larger than or equal to 0]]]');
                });

                it('textOverlay.xLoc must be provided', function() {
                    validateCommonSchemaError({ textOverlay: {text: 'Hello, world', fontName: 'Avenir', fontSize: 40, fontColor: 'ffffff', fontAlpha: 1.0, yLoc: 400, fadeIn: { startTime: 1, duration: 1 } } }, 'child "textOverlay" fails because [child "xLoc" fails because ["xLoc" is required], "textOverlay" must be an array]');
                    validateCommonSchemaError({ textOverlay: [{text: 'Hello, world', fontName: 'Avenir', fontSize: 40, fontColor: 'ffffff', fontAlpha: 1.0, yLoc: 400, fadeIn: { startTime: 1, duration: 1 } }] }, 'child "textOverlay" fails because ["textOverlay" must be an object, "textOverlay" at position 0 fails because [child "xLoc" fails because ["xLoc" is required]]]');
                });
                it('textOverlay.xLoc must be an integer', function() {
                    validateCommonSchemaError({ textOverlay: {text: 'Hello, world', fontName: 'Avenir', fontSize: 40, fontColor: 'ffffff', fontAlpha: 1.0, xLoc: 400.7, yLoc: 400, fadeIn: { startTime: 1, duration: 1 } } }, 'child "textOverlay" fails because [child "xLoc" fails because ["xLoc" must be an integer], "textOverlay" must be an array]');
                    validateCommonSchemaError({ textOverlay: [{text: 'Hello, world', fontName: 'Avenir', fontSize: 40, fontColor: 'ffffff', fontAlpha: 1.0, xLoc: 200.3, yLoc: 400, fadeIn: { startTime: 1, duration: 1 } }] }, 'child "textOverlay" fails because ["textOverlay" must be an object, "textOverlay" at position 0 fails because [child "xLoc" fails because ["xLoc" must be an integer]]]');
                });

                it('textOverlay.yLoc must be provided', function() {
                    validateCommonSchemaError({ textOverlay: {text: 'Hello, world', fontName: 'Avenir', fontSize: 40, fontColor: 'ffffff', fontAlpha: 1.0, xLoc: 400, fadeIn: { startTime: 1, duration: 1 } } }, 'child "textOverlay" fails because [child "yLoc" fails because ["yLoc" is required], "textOverlay" must be an array]');
                    validateCommonSchemaError({ textOverlay: [{text: 'Hello, world', fontName: 'Avenir', fontSize: 40, fontColor: 'ffffff', fontAlpha: 1.0, xLoc: 400, fadeIn: { startTime: 1, duration: 1 } }] }, 'child "textOverlay" fails because ["textOverlay" must be an object, "textOverlay" at position 0 fails because [child "yLoc" fails because ["yLoc" is required]]]');
                });
                it('textOverlay.yLoc must be an integer', function() {
                    validateCommonSchemaError({ textOverlay: {text: 'Hello, world', fontName: 'Avenir', fontSize: 40, fontColor: 'ffffff', fontAlpha: 1.0, xLoc: 400, yLoc: 400.5, fadeIn: { startTime: 1, duration: 1 } } }, 'child "textOverlay" fails because [child "yLoc" fails because ["yLoc" must be an integer], "textOverlay" must be an array]');
                    validateCommonSchemaError({ textOverlay: [{text: 'Hello, world', fontName: 'Avenir', fontSize: 40, fontColor: 'ffffff', fontAlpha: 1.0, xLoc: 400, yLoc: -100.7, fadeIn: { startTime: 1, duration: 1 } }] }, 'child "textOverlay" fails because ["textOverlay" must be an object, "textOverlay" at position 0 fails because [child "yLoc" fails because ["yLoc" must be an integer]]]');
                });

                it('textOverlay.fadeIn must be provided', function() {
                    validateCommonSchemaError({ textOverlay: {text: 'Hello, world', fontName: 'Avenir', fontSize: 40, fontColor: 'ffffff', fontAlpha: 1.0, xLoc: 400, yLoc: 400 } }, 'child "textOverlay" fails because [child "fadeIn" fails because ["fadeIn" is required], "textOverlay" must be an array]');
                    validateCommonSchemaError({ textOverlay: [{text: 'Hello, world', fontName: 'Avenir', fontSize: 40, fontColor: 'ffffff', fontAlpha: 1.0, xLoc: 400, yLoc: 400 }] }, 'child "textOverlay" fails because ["textOverlay" must be an object, "textOverlay" at position 0 fails because [child "fadeIn" fails because ["fadeIn" is required]]]');
                });
                it('textOverlay.fadeIn.startTime must be provided', function() {
                    validateCommonSchemaError({ textOverlay: {text: 'Hello, world', fontName: 'Avenir', fontSize: 40, fontColor: 'ffffff', fontAlpha: 1.0, xLoc: 400, yLoc: 400, fadeIn: { duration: 1 } } }, 'child "textOverlay" fails because [child "fadeIn" fails because [child "startTime" fails because ["startTime" is required]], "textOverlay" must be an array]');
                    validateCommonSchemaError({ textOverlay: [{text: 'Hello, world', fontName: 'Avenir', fontSize: 40, fontColor: 'ffffff', fontAlpha: 1.0, xLoc: 400, yLoc: 400, fadeIn: { duration: 1 } }] }, 'child "textOverlay" fails because ["textOverlay" must be an object, "textOverlay" at position 0 fails because [child "fadeIn" fails because [child "startTime" fails because ["startTime" is required]]]]');
                });
                it('textOverlay.fadeIn.duration must be provided', function() {
                    validateCommonSchemaError({ textOverlay: {text: 'Hello, world', fontName: 'Avenir', fontSize: 40, fontColor: 'ffffff', fontAlpha: 1.0, xLoc: 400, yLoc: 400, fadeIn: { startTime: 1 } } }, 'child "textOverlay" fails because [child "fadeIn" fails because [child "duration" fails because ["duration" is required]], "textOverlay" must be an array]');
                    validateCommonSchemaError({ textOverlay: [{text: 'Hello, world', fontName: 'Avenir', fontSize: 40, fontColor: 'ffffff', fontAlpha: 1.0, xLoc: 400, yLoc: 400, fadeIn: { startTime: 1 } }] }, 'child "textOverlay" fails because ["textOverlay" must be an object, "textOverlay" at position 0 fails because [child "fadeIn" fails because [child "duration" fails because ["duration" is required]]]]');
                });

                it('textOverlay.fadeOut.startTime must be provided if fadeOut provided', function() {
                    validateCommonSchemaError({ textOverlay: {text: 'Hello, world', fontName: 'Avenir', fontSize: 40, fontColor: 'ffffff', fontAlpha: 1.0, xLoc: 400, yLoc: 400, fadeIn: { startTime: 1, duration: 1 }, fadeOut: { duration: 1 } } }, 'child "textOverlay" fails because [child "fadeOut" fails because [child "startTime" fails because ["startTime" is required]], "textOverlay" must be an array]');
                    validateCommonSchemaError({ textOverlay: [{text: 'Hello, world', fontName: 'Avenir', fontSize: 40, fontColor: 'ffffff', fontAlpha: 1.0, xLoc: 400, yLoc: 400, fadeIn: { startTime: 1, duration: 1 }, fadeOut: { duration: 1 } }] }, 'child "textOverlay" fails because ["textOverlay" must be an object, "textOverlay" at position 0 fails because [child "fadeOut" fails because [child "startTime" fails because ["startTime" is required]]]]');
                });
                it('textOverlay.fadeOut.duration must be provided if fadeOut provided', function() {
                    validateCommonSchemaError({ textOverlay: {text: 'Hello, world', fontName: 'Avenir', fontSize: 40, fontColor: 'ffffff', fontAlpha: 1.0, xLoc: 400, yLoc: 400, fadeIn: { startTime: 1, duration: 1 }, fadeOut: { startTime: 1 } } }, 'child "textOverlay" fails because [child "fadeOut" fails because [child "duration" fails because ["duration" is required]], "textOverlay" must be an array]');
                    validateCommonSchemaError({ textOverlay: [{text: 'Hello, world', fontName: 'Avenir', fontSize: 40, fontColor: 'ffffff', fontAlpha: 1.0, xLoc: 400, yLoc: 400, fadeIn: { startTime: 1, duration: 1 }, fadeOut: { startTime: 1 } }] }, 'child "textOverlay" fails because ["textOverlay" must be an object, "textOverlay" at position 0 fails because [child "fadeOut" fails because [child "duration" fails because ["duration" is required]]]]');
                });

                it('textOverlay.xLoc text alignment value has to be valid', function() {
                    validateCommonSchemaError({ textOverlay: {text: 'Hello, world', fontName: 'Avenir', fontSize: 40, fontColor: 'ffffff', fontAlpha: 1.0, xLoc: 'wrong', yLoc: 'wrong', fadeIn: { startTime: 1, duration: 1 } } }, 'child "textOverlay" fails because [child "xLoc" fails because ["xLoc" must be a number], "textOverlay" must be an array]');
                    validateCommonSchemaError({ textOverlay: {text: 'Hello, world', fontName: 'Avenir', fontSize: 40, fontColor: 'ffffff', fontAlpha: 1.0, xLoc: 400, yLoc: 'wrong', fadeIn: { startTime: 1, duration: 1 } } }, 'child "textOverlay" fails because [child "yLoc" fails because ["yLoc" must be a number], "textOverlay" must be an array]');
                });
            });

            describe('Invalid output inputs', function() {
                it('output.filePath is required', function() {
                    validateCommonSchemaError({ output: {  } }, 'child "output" fails because [child "filePath" fails because ["filePath" is required]]');
                });

                it('output.includeMoovAtomAtFront must be a boolean', function() {
                    validateCommonSchemaError({ output: { filePath: 'output.mp4', includeMoovAtomAtFront: 'hello' } }, 'child "output" fails because [child "includeMoovAtomAtFront" fails because ["includeMoovAtomAtFront" must be a boolean]]');
                });

                it('output.dimensions.width must be provided if output.dimensions is provided', function() {
                    validateCommonSchemaError({ output: { filePath: 'output.mp4', dimensions: { height: 1080 } } }, 'child "output" fails because [child "dimensions" fails because [child "width" fails because ["width" is required]]]');
                });
                it('output.dimensions.height must be provided if output.dimensions is provided', function() {
                    validateCommonSchemaError({ output: { filePath: 'output.mp4', dimensions: { width: 1920 } } }, 'child "output" fails because [child "dimensions" fails because [child "height" fails because ["height" is required]]]');
                });
                it('output.crop.outputWidth must be provided', function() {
                    validateCommonSchemaError({ output: { filePath: 'output.mp4', crop: { outputHeight: 480, xLoc: 0, yLoc: 0} } }, 'child "output" fails because [child "crop" fails because [child "outputWidth" fails because ["outputWidth" is required]]]' );
                });
                it('output.crop.outputHeight must be provided', function() {
                    validateCommonSchemaError({ output: { filePath: 'output.mp4', crop: { outputWidth: 720, xLoc: 0, yLoc: 0} } }, 'child "output" fails because [child "crop" fails because [child "outputHeight" fails because ["outputHeight" is required]]]' );
                });
                it('output.crop.xLoc must be provided', function() {
                    validateCommonSchemaError({ output: { filePath: 'output.mp4', crop: { outputWidth: 720, outputHeight: 480, yLoc: 0} } }, 'child "output" fails because [child "crop" fails because [child "xLoc" fails because ["xLoc" is required]]]' );
                });
                it('output.crop.yLoc must be provided', function() {
                    validateCommonSchemaError({ output: { filePath: 'output.mp4', crop: { outputWidth: 720, outputHeight: 480, xLoc: 0} } }, 'child "output" fails because [child "crop" fails because [child "yLoc" fails because ["yLoc" is required]]]' );
                });
            });

            describe('Invalid workingDirectory inputs', function() {



            });

            it('Should work with additional keys if strict mode is disabled', function() {
                const command = ffmpegCommandService.createFfmpegCommand({
                    video: {
                        title: 'test', // This is an ignored key
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
                }, true);

                Should(command).eql('/usr/local/bin/ffmpeg -i ' + Path.resolve(__dirname, './fixtures/assets1/sample.mp4') + ' -f lavfi -i color=c=aaaaaa:size=1920x1080 -filter_complex "[0:v] trim=start=0:duration=600, setpts=PTS-STARTPTS [v0]; [v0] concat=n=1:v=1:a=0 [v_concat]; [1:v] format=yuva420p, colorchannelmixer=aa=0.6 [v_overlay_0_mixin]; [v_overlay_0_mixin] fade=t=in:st=5:d=1:alpha=1 [v_overlay_0_fade]; [v_concat] [v_overlay_0_fade] overlay=shortest=1 [v_overlay_0]; [v_overlay_0] scale=1920:1080 [v_scaled]" -map "[v_scaled]" -y ' + Path.resolve(__dirname, './fixtures/assets1/output.mp4'));
            });

        });

    })

    describe('createFfmpegOptions', function () {
        it('Should work with a video and an audio object provided and without an output object', function() {
            const options = ffmpegCommandService.createFfmpegOptions({
                video: {
                    filePath: 'sample.mp4',
                    dimensions: {
                        width: 1920,
                        height: 1080
                    },
                    trimStart: 0,
                    trimDuration: 10
                },
                audio: {
                    filePath: 'music.mp3',
                    trimStart: 0,
                    trimDuration: 10
                },
                workingDirectory: Path.resolve(__dirname, './fixtures/assets1')
            });

            Should(options.inputs).eql([
                { type: 'video', input: Path.resolve(__dirname, './fixtures/assets1/sample.mp4') },
                { type: 'audio', input: Path.resolve(__dirname, './fixtures/assets1/music.mp3') }
            ]);

            Should(options.filterComplex.filter).eql("[0:v] trim=start=0:duration=10, setpts=PTS-STARTPTS [v0]; [v0] concat=n=1:v=1:a=0 [v_concat]; [1:a] atrim=start=0:duration=10, asetpts=PTS-STARTPTS [a0]; [a0] concat=n=1:v=0:a=1 [a_concat]");
            Should(options.filterComplex.maps).eql(['v_concat', 'a_concat']);
        });

        it('Should allow URL\'s instead of filenames when a working directory is not specified', function() {
            const options = ffmpegCommandService.createFfmpegOptions({
                video: {
                    filePath: 'https://example.com/sample.mp4',
                    dimensions: {
                        width: 1920,
                        height: 1080
                    },
                    trimStart: 0,
                    trimDuration: 10
                },
                audio: {
                    filePath: 'https://example.com/music.mp3',
                    trimStart: 0,
                    trimDuration: 10
                },
            });

            Should(options.inputs).eql([
                { type: 'video', input: 'https://example.com/sample.mp4' },
                { type: 'audio', input: 'https://example.com/music.mp3' }
            ]);

            Should(options.filterComplex.filter).eql("[0:v] trim=start=0:duration=10, setpts=PTS-STARTPTS [v0]; [v0] concat=n=1:v=1:a=0 [v_concat]; [1:a] atrim=start=0:duration=10, asetpts=PTS-STARTPTS [a0]; [a0] concat=n=1:v=0:a=1 [a_concat]");
            Should(options.filterComplex.maps).eql(['v_concat', 'a_concat']);
        });
    })

});