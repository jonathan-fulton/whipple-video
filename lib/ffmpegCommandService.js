'use strict';

const Joi = require('joi');
const Fs = require('fs');
const Path = require('path');

class FfmpegCommandService {


    /**
     * @param {WhippleFfmpegConfig} ffmpegConfig
     * @param {WhippleFontConfig} fontConfig
     */
    constructor(ffmpegConfig, fontConfig) {
        this._ffmpegConfig = ffmpegConfig;
        this._fontConfig = fontConfig;

        this._fontLookupObj = this._createFontLookupObj(this._fontConfig);
        this._commandSchema = this._createCommandSchema();
    }

    /**
     * @param {WhippleCommand} command
     * @returms {String}
     */
    createFfmpegCommand(command) {
        this._validateCommandSchema(command);

        const commandInArrayFormat = this._mapCommandToArrayFormat(command);
        this._validateFilesAndFontsExist(commandInArrayFormat);
        const ffmpegCommandString = this._createFfmpegCommand(commandInArrayFormat);
        return ffmpegCommandString;
    }

    /**
     * @param {WhippleFontConfig} fontConfig
     * @returns {Object} - maps font name to font object for quick lookup
     * @private
     */
    _createFontLookupObj(fontConfig) {
        const mapObj = {};
        fontConfig.fonts.forEach((font, i) => {
            mapObj[font.name] = font;
        });
        return mapObj;
    }

    /**
     * @returns Joi schema
     * @private
     */
    _createCommandSchema() {
        const whippleCommandDimensionsRequired = Joi.object().keys({
            width: Joi.number().integer().min(0).required(),
            height: Joi.number().integer().min(0).required()
        }).required();

        const whippleCommandDimensionsOptional = Joi.object().keys({
            width: Joi.number().integer().min(0).required(),
            height: Joi.number().integer().min(0).required()
        });

        const whippleCommandVideoSchema = Joi.object().keys({
            filePath: Joi.string().required(),
            trimStart: Joi.number().min(0).max(600),
            trimDuration: Joi.number().min(0).max(600),
            dimensions: whippleCommandDimensionsRequired
        }).required(); // adding required b/c at least one video must be provided, either in the singular or array form

        const whippleCommandAudioSchema = Joi.object().keys({
            filePath: Joi.string().required(),
            trimStart: Joi.number().min(0).max(600),
            trimDuration: Joi.number().min(0).max(600)
        });

        const whippleCommandFadeEffectRequired = Joi.object().keys({
            startTime: Joi.number().min(0).required(),
            duration: Joi.number().min(0).required()
        }).required();

        const whippleCommandFadeEffectOptional = Joi.object().keys({
            startTime: Joi.number().min(0).required(),
            duration: Joi.number().min(0).required()
        });

        const whippleCommandBackgroundOverlaySchema = Joi.object().keys({
            color: Joi.string().min(6).max(6).hex().required(),
            alpha: Joi.number().min(0).max(1).required(),
            dimensions: whippleCommandDimensionsRequired,
            fadeIn: whippleCommandFadeEffectRequired,
            fadeOut: whippleCommandFadeEffectOptional
        });

        const whippleCommandTextOverlaySchema = Joi.object().keys({
            text: Joi.string().required(),
            fontName: Joi.string().required(),
            fontSize: Joi.number().min(0).required(),
            fontColor: Joi.string().min(6).max(6).hex().required(),
            fontAlpha: Joi.number().min(0).max(1).required(),
            xLoc: Joi.number().integer().required(),
            yLoc: Joi.number().integer().required(),
            fadeIn: whippleCommandFadeEffectRequired,
            fadeOut: whippleCommandFadeEffectOptional
        });

        const whippleCommandImageOverlaySchema = Joi.object().keys({
            filePath: Joi.string().required(),
            xLoc: Joi.number().integer().required(),
            yLoc: Joi.number().integer().required(),
            fadeIn: whippleCommandFadeEffectRequired,
            fadeOut: whippleCommandFadeEffectOptional
        });

        const whippleCommandOutput = Joi.object().keys({
            filePath: Joi.string().required(),
            includeMoovAtomAtFront: Joi.boolean().optional(),
            dimensions: whippleCommandDimensionsOptional
        }).required();

        const whippleCommandSchema = Joi.object().keys({
            video: Joi.alternatives().try([whippleCommandVideoSchema, Joi.array().items(whippleCommandVideoSchema).min(1)]),
            audio: Joi.alternatives().try([whippleCommandAudioSchema, Joi.array().items(whippleCommandAudioSchema).min(1)]),
            backgroundOverlay: Joi.alternatives().try([whippleCommandBackgroundOverlaySchema, Joi.array().items(whippleCommandBackgroundOverlaySchema).min(0)]),
            imageOverlay: Joi.alternatives().try([whippleCommandImageOverlaySchema, Joi.array().items(whippleCommandImageOverlaySchema).min(0)]),
            textOverlay: Joi.alternatives().try([whippleCommandTextOverlaySchema, Joi.array().items(whippleCommandTextOverlaySchema).min(1)]),
            output: whippleCommandOutput,
            workingDirectory: Joi.string().optional()
        });

        return whippleCommandSchema;
    }

    /**
     * @param {WhippleCommand} command
     * @private
     */
    _validateCommandSchema(command) {
        const validationResult = Joi.validate(command, this._commandSchema);
        if (validationResult.error) {
            throw validationResult.error;
        }
    }

    /**
     * @param {WhippleCommand} command
     * @returns {WhippleCommand_ArrayFormat}
     * @private
     */
    _mapCommandToArrayFormat(command) {
        /** @var {WhippleCommand} */
        const newCommand = JSON.parse(JSON.stringify(command));

        ['video', 'audio', 'backgroundOverlay', 'imageOverlay', 'textOverlay'].forEach(prop => {
            if (newCommand[prop] && !Array.isArray(newCommand[prop])) {
                newCommand[prop] = [newCommand[prop]];
            }
        });

        return newCommand;
    }

    /**
     * @param {WhippleCommand_ArrayFormat} command
     * @private
     */
    _validateFilesAndFontsExist(command) {

        // Validate video, audio, and imageOverlay files exist
        ['video','audio','imageOverlay'].forEach(prop => {
            if (command[prop]) {
                command[prop].forEach(el => {
                    const fullFilePath = Path.resolve(command.workingDirectory, el.filePath);
                    if (!Fs.existsSync(fullFilePath)) {
                        throw new Error(`${prop} file "${fullFilePath}" does not exist.`);
                    }
                });
            }
        });

        // Validate fonts exist
        if (command.textOverlay) {
            command.textOverlay.forEach(textOverlay => {
                if (!this._fontLookupObj[textOverlay.fontName]) {
                    throw new Error(`Font with name "${textOverlay.fontName}" does not exist.`);
                }
            })
        }
    }

    /**
     * @param {WhippleCommand_ArrayFormat} command
     * @returns {string}
     * @private
     *
     * @TODO: scale video to match output size
     */
    _createFfmpegCommand(command) {

        // 1) Add ffmpeg bin
        // 2) Add inputs
            // a) video
            // b) audio
            // c) color background for backgroundOverlays
            // d) images for imageOverlays
        // 3) Create filter_complex field
            // a) Trim videos
            // b) Concatenate videos
            // c) Create backgroundOverlay alpha mix channels
            // d) Overlay each backgroundOverlay
            // e) Add imageOverlays
            // f) Add textOverlays
            // g) Concatenate audio
        // 4) Add final map statements for video and audio components
        // 5) Add output filename

        let ffmpegCmd = this._ffmpegConfig.pathToFfmpegBin;

        command.video.forEach(video => {
            ffmpegCmd += ` -i ${Path.resolve(command.workingDirectory, video.filePath)}`;
        });

        if (command.backgroundOverlay) {
            command.backgroundOverlay.forEach(backgroundOverlay => {
                ffmpegCmd += ` -f lavfi -i color=c=${backgroundOverlay.color}:size=${backgroundOverlay.dimensions.width}x${backgroundOverlay.dimensions.height}`;
            });
        }

        if (command.imageOverlay) {
            command.imageOverlay.forEach(imageOverlay => {
                ffmpegCmd += ` -loop 1 -i logo.png`;
            })
        }

        if (command.audio) {
            command.audio.forEach(audio => {
                ffmpegCmd += ` -i ${Path.resolve(command.workingDirectory, audio.filePath)}`;
            });
        }

        ffmpegCmd += ` -filter_complex "`;

        // 3a) Trim videos
        command.video.forEach((video,i) => {
            ffmpegCmd += ` [${i}:v] trim=start=${video.trimStart || 0}:duration=${video.trimDuration || 600}, setpts=PTS-STARTPTS [v${i}];`
        });

        // 3b) Concatenate videos
        command.video.forEach((video, i) => ffmpegCmd += ` [v${i}]`);
        ffmpegCmd += ` concat=n=${command.video.length}:v=1:a=0 [v_concat];`;

        // Let's keep track of the label for the current full video stream
        // Makes it easier to handle the fact that some sections are optional
        let lastVLabel = 'v_concat';

        // 3c/d) Create backgroundOverlay alpha mix channels and Overlay each backgroundOverlay
        if (command.backgroundOverlay) {
            const inputIndex = command.video.length;
            command.backgroundOverlay.forEach((backgroundOverlay,i) => {
                // Required for the alpha layer transparency
                ffmpegCmd += ` [${inputIndex + i}:v] format=yuva420p, colorchannelmixer=aa=${backgroundOverlay.alpha} [v_overlay_${i}_mixin];`;

                // Fades in/out the alpha layer transparency
                ffmpegCmd += ` [v_overlay_${i}_mixin] fade=t=in:st=${backgroundOverlay.fadeIn.startTime}:d=${backgroundOverlay.fadeIn.duration}:alpha=1`;
                if (backgroundOverlay.fadeOut) {
                    ffmpegCmd += `, fade=t=out:st=${backgroundOverlay.fadeOut.startTime}:d=${backgroundOverlay.fadeOut.duration}:alpha=1`;
                }
                ffmpegCmd += ` [v_overlay_${i}_fade];`;

                // Adds the transparent background to the overall video
                ffmpegCmd += ` [${lastVLabel}] [v_overlay_${i}_fade] overlay=shortest=1 [v_overlay_${i}];`;
                lastVLabel = `v_overlay_${i}`;
            })
        }

        if (command.imageOverlay) {
            const inputIndex = command.video.length + (command.backgroundOverlay ? command.backgroundOverlay.length : 0);
            command.imageOverlay.forEach((imageOverlay, i) => {
                // [4:v] fade=t=in:st=14:d=1:alpha=1, fade=t=out:st=16:d=1:alpha=1 [logo]
                // [v_text] [logo] overlay=x=900:y=450:shortest=1 [v_logo]
                ffmpegCmd += ` [${inputIndex + i}] fade=t=in:st=${imageOverlay.fadeIn.startTime}:d=${imageOverlay.fadeIn.duration}:alpha=1`;
                if (imageOverlay.fadeOut) {
                    ffmpegCmd += `, fade=t=out:st=${imageOverlay.fadeOut.startTime}:d=${imageOverlay.fadeOut.duration}:alpha=1`;
                }
                ffmpegCmd += ` [v_image_${i}_layer];`;

                ffmpegCmd += ` [${lastVLabel}] [v_image_${i}_layer] overlay=x=${imageOverlay.xLoc}:y=${imageOverlay.yLoc}:shortest=1 [v_image_${i}];`;
                lastVLabel = `v_image_${i}`;
            });
        }

        if (command.textOverlay) {
            const bashCharsToEscapeRegex = /!/g;
            ffmpegCmd += ` [${lastVLabel}]`;
            command.textOverlay.forEach((textOverlay,i) => {
                // @TODO: add handling for escaping special characters in bash.  Know it's at least ! that needs escaping.

                const fontFile = Path.resolve(this._fontConfig.fontsDirectory, this._fontLookupObj[textOverlay.fontName].fontFilePath);
                ffmpegCmd += `${i > 0 ? ',' : ''} drawtext=enable=1:text='${textOverlay.text.replace(bashCharsToEscapeRegex, "\\$&")}':x=${textOverlay.xLoc}:y=${textOverlay.yLoc}`;
                ffmpegCmd += `:fontfile=${fontFile}:fontsize=${textOverlay.fontSize}`;

                // See example near bottom of this page for the copy / pasted formula:  https://ffmpeg.org/ffmpeg-filters.html#Examples-51
                // fontcolor_expr=ff0000%{eif\\\\: clip(255*(1*between(t\\, $DS + $FID\\, $DE - $FOD) + ((t - $DS)/$FID)*between(t\\, $DS\\, $DS + $FID) + (-(t - $DE)/$FOD)*between(t\\, $DE - $FOD\\, $DE) )\\, 0\\, 255) \\\\: x\\\\: 2 }
                const ds = textOverlay.fadeIn.startTime; // display start
                const de = textOverlay.fadeOut ? textOverlay.fadeOut.startTime + textOverlay.fadeOut.duration : 1000000; // display end; 1000000 is BIG in seconds and should result in no fade out
                const fid = textOverlay.fadeIn.duration; // fade in duration
                const fod = textOverlay.fadeOut ? textOverlay.fadeOut.duration : 1; // fade out duration; defaulting to 1 to avoid divide by 0 error
                ffmpegCmd += `:fontcolor_expr=${textOverlay.fontColor}%{eif\\\\\\\\: clip(255*${textOverlay.fontAlpha}*(1*between(t\\\\, ${ds + fid}\\\\, ${de - fod}) + ((t - ${ds})/${fid})*between(t\\\\, ${ds}\\\\, ${ds + fid}) + (-(t - ${de})/${fod})*between(t\\\\, ${de - fod}\\\\, ${de}) )\\\\, 0\\\\, 255) \\\\\\\\: x\\\\\\\\: 2 }`;
            });
            ffmpegCmd += ` [v_text];`;
            lastVLabel = `v_text`;
        }

        if (command.audio) {
            const inputIndex = command.video.length + (command.backgroundOverlay ? command.backgroundOverlay.length : 0) + (command.imageOverlay ? command.imageOverlay.length : 0);
            command.audio.forEach((audio, i) => {
                ffmpegCmd += ` [${inputIndex + i}:a] atrim=start=${audio.trimStart || 0}:duration=${audio.trimDuration || 600}, asetpts=PTS-STARTPTS [a${i}];`;
            });
            command.audio.forEach((audio, i) => ffmpegCmd += ` [a${i}]`);
            ffmpegCmd += ` concat=n=${command.audio.length}:v=0:a=1 [a_concat];`;
        }

        ffmpegCmd = ffmpegCmd.replace(/;$/, ''); // Remove trailing semicolon if necessary

        ffmpegCmd += `"`;

        ffmpegCmd += ` -map "[${lastVLabel}]"`;

        if (command.audio) {
            ffmpegCmd += ` -map "[a_concat]"`
        }

        // Note, -y enables override of the output file without a command line prompt
        ffmpegCmd += ` -y ${Path.resolve(command.workingDirectory, command.output.filePath)}`;

        return ffmpegCmd;
    }
}

/**
 * @name WhippleCommand
 * @type Object
 *
 * @property {WhippleCommandVideo|WhippleCommandVideo[]} video - videos are trimmed and concatenated in order; should all be the same dimensions
 * @property {WhippleCommandAudio|WhippleCommandAudio[]} [audio] - audio is trimmed and concatenated in order
 * @property {WhippleCommandBackgroundOverlay|WhippleCommandBackgroundOverlay[]} [backgroundOverlay] - background overlays are added after videos are concatenated
 * @property {WhippleCommandImageOverlay|WhippleCommandImageOverlay[]} [imageOverlay] - image overlays added after background overlays
 * @property {WhippleCommandTextOverlay|WhippleCommandTextOverlay[]} [textOverlay] - text overlays are added after videos are concatenated and background overlays added
 *
 * @property {WhippleCommandOutput} output
 *
 * @property {string} [workingDirectory] - if specified, all paths to video/audio files are relative to this directory
 */

/**
 * @name WhippleCommand_ArrayFormat - same as WhippleCommand, just that all properties are arrays to minimize if statements in certain locations
 * @type Object
 *
 * @property {WhippleCommandVideo[]} video - videos are trimmed and concatenated in order; should all be the same dimensions
 * @property {WhippleCommandAudio[]} [audio] - audio is trimmed and concatenated in order
 * @property {WhippleCommandBackgroundOverlay[]} [backgroundOverlay] - background overlays are added after videos are concatenated
 * @property {WhippleCommandImageOverlay[]} [imageOverlay] - image overlays added after background overlays
 * @property {WhippleCommandTextOverlay[]} [textOverlay] - text overlays are added after videos are concatenated and background overlays added
 *
 * @property {WhippleCommandOutput} output
 *
 * @property {string} [workingDirectory] - if specified, all paths to video/audio files are relative to this directory
 */

/**
 * @name WhippleCommandVideo
 * @type Object
 * @property {string} filePath - include the extension, e.g., .mov .mp4
 * @property {number} [trimStart] - in seconds; must be between 0 and 600. Effectively defaults to 0 if not provided.
 * @property {number} [trimDuration] - in seconds; must be between 0 and 600. Effectively defaults to smaller of 600 or time remaining in input video if not provided.
 * @property {WhippleCommandDimensions} [dimensions]
 */

/**
 * @name WhippleCommandAudio
 * @type Object
 * @property {string} filePath
 * @property {number} [trimStart] - in seconds; must be between 0 and 600. Effectively defaults to 0 if not provided.
 * @property {number} [trimDuration] - in seconds; must be between 0 and 600. Effectively defaults to smaller of 600 or time remaining in input audio if not provided.
 */

/**
 * @name WhippleCommandBackgroundOverlay
 * @type Object
 * @property {string} color - hex code
 * @property {number} alpha - alpha channel value between 0 and 1
 * @property {WhippleCommandDimensions} dimensions
 * @property {WhippleCommandFadeEffect} fadeIn
 * @property {WhippleCommandFadeEffect} [fadeOut]
 */

/**
 * @name WhippleCommandImageOverlay
 * @type Object
 * @property {string} filePath
 * @property {int} xLoc - # of pixels to the right of the upper left corner relative to original video inputs
 * @property {int} yLoc - # of pixels below the upper left corner relative to original video inputs
 * @property {WhippleCommandFadeEffect} fadeIn
 * @property {WhippleCommandFadeEffect} [fadeOut]
 */

/**
 * @name WhippleCommandTextOverlay
 * @type Object
 * @property {string} text
 * @property {string} fontName - should correspond to one of the font names in service configuration
 * @property {number} fontSize - in pixels
 * @property {string} fontColor - hex
 * @property {number} fontAlpha - alpha for fontColor when fully faded in
 * @property {int} xLoc - # of pixels to the right of the upper left corner relative to original video inputs
 * @property {int} yLoc - # of pixels below the upper left corner relative to original video inputs
 * @property {WhippleCommandFadeEffect} fadeIn
 * @property {WhippleCommandFadeEffect} [fadeOut]
 */

/**
 * @name WhippleCommandFadeEffect
 * @property {number} startTime - in seconds
 * @property {number} duration - in seconds
 */

/**
 * @name WhippleCommandDimensions
 * @property {int} width - in pixels
 * @property {int} height - in pixels
 */

/**
 * @name WhippleCommandOutput
 * @type {Object}
 * @property {string} filePath
 * @property {boolean} [includeMoovAtomAtFront=true] - enables video streaming by putting MOOV metadata at front of file
 * @property {WhippleCommandDimensions} [dimensions] - if not provided will implicitly default to input video dims
 */



module.exports = FfmpegCommandService;