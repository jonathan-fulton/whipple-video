'use strict';

const Joi = require('joi');

class FfmpegCommandService {


    /**
     * @param {WhippleFontConfig} fontConfig
     */
    constructor(ffmpegConfig, fontConfig) {
        this._fontConfig = fontConfig;
    }

    /**
     * @param {WhippleCommand} command
     * @returms {String}
     */
    createFfmpegCommand(command) {
        this._validateCommand(command);
        const ffmpegCommandString = this._createFfmpegCommand(command);
        return ffmpegCommandString;
    }

    /**
     * @param {WhippleCommand} command
     * @private
     */
    _validateCommand(command) {

        const WhippleCommandDimensionsRequired = Joi.object().keys({
            width: Joi.number().integer().min(0).required(),
            height: Joi.number().integer().min(0).required()
        }).required();

        const WhippleCommandDimensionsOptional = Joi.object().keys({
            width: Joi.number().integer().min(0).required(),
            height: Joi.number().integer().min(0).required()
        });

        const WhippleCommandVideoSchema = Joi.object().keys({
            filePath: Joi.string().required(),
            trimStart: Joi.number().required(),
            trimDuration: Joi.number().required(),
            dimensions: WhippleCommandDimensionsRequired
        }).required(); // adding required b/c at least one video must be provided, either in the singular or array form

        const WhippleCommandAudioSchema = Joi.object().keys({
            filePath: Joi.string.required(),
            trimStart: Joi.number(),
            trimDuration: Joi.number()
        });

        const WhippleCommandFadeEffectRequired = Joi.object().keys({
            startTime: Joi.number().min(0).required(),
            duration: Joi.number().min(0).required()
        }).required();

        const WhippleCommandFadeEffectOptional = Joi.object().keys({
            startTime: Joi.number().min(0).required(),
            duration: Joi.number().min(0).required()
        });

        const WhippleCommandBackgroundOverlaySchema = Joi.object().keys({
            color: Joi.string().min(6).max(6).hex().required(),
            alpha: Joi.number().min(0).max(1).required(),
            dimensions: WhippleCommandDimensionsRequired,
            fadeIn: WhippleCommandFadeEffectRequired,
            fadeOut: WhippleCommandFadeEffectOptional
        });

        const WhippleCommandTextOverlaySchema = Joi.object().keys({
            text: Joi.string().required(),
            fontName: Joi.string().required(),
            fontSize: Joi.number().min(0).required(),
            fontColor: Joi.string().min(6).max(6).hex().required(),
            fontAlpha: Joi.number().min(0).max(1).required(),
            xLoc: Joi.number().integer().min(0).required(),
            yLoc: Joi.number().integer().min(0).required(),
            fadeIn: WhippleCommandFadeEffectRequired,
            fadeOut: WhippleCommandFadeEffectOptional
        });

        const WhippleCommandImageOverlaySchema = Joi.object().keys({
            filePath: Joi.string().required(),
            fadeIn: WhippleCommandFadeEffectRequired,
            fadeOut: WhippleCommandFadeEffectOptional
        });

        /**
         * @name WhippleCommandOutput
         * @type {Object}
         * @property {string} filePath
         * @property {boolean} [includeMoovAtomAtFront=true] - enables video streaming by putting MOOV metadata at front of file
         * @property {number} [width] - in pixels; if not provided, will be equal to input videos
         * @property {number} [height] - in pixels; if not provided, will be equal to input videos
         */

        const WhippleCommandOutput = Joi.object().keys({
            filePath: Joi.string.required(),
            includeMoovAtomAtFront: Joi.boolean().optional(),
            dimensions: WhippleCommandDimensionsOptional
        });

        const WhippleCommandSchema = Joi.object().keys({
            video: Joi.alternatives().try([WhippleCommandVideoSchema, Joi.array().items(WhippleCommandVideoSchema)]),
            audio: Joi.alternatives().try([WhippleCommandAudioSchema, Joi.array().items(WhippleCommandAudioSchema)]),
            backgroundOverlay: Joi.alternatives().try([WhippleCommandBackgroundOverlaySchema, Joi.array().items(WhippleCommandBackgroundOverlaySchema)]),
            imageOverlay: Joi.alternatives().try([WhippleCommandImageOverlaySchema, Joi.array().items(WhippleCommandImageOverlaySchema)]),
            textOverlay: Joi.alternatives().try([WhippleCommandTextOverlaySchema, Joi.array().items(WhippleCommandTextOverlaySchema)]),
            output: WhippleCommandOutput,
            workingDirectory: Joi.string().optional()
        });

    }

    _createFfmpegCommand(command) {
        return '';
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
 * @name WhippleCommandVideo
 * @type Object
 * @property {string} filePath - include the extension, e.g., .mov .mp4
 * @property {number} [trimStart] - in seconds
 * @property {number} [trimDuration] - in seconds
 * @property {WhippleCommandDimensions} [dimensions]
 */

/**
 * @name WhippleCommandAudio
 * @type Object
 * @property {string} filePath
 * @property {number} [trimStart] - in seconds
 * @property {number} [trimDuration] - in seconds
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
 * @name WhippleCommandTextOverlay
 * @type Object
 * @property {string} text
 * @property {string} fontName - should correspond to one of the font names in service configuration
 * @property {number} fontSize - in pixels
 * @property {string} fontColor - hex
 * @property {number} fontAlpha - alpha for fontColor when fully faded in
 * @property {number} xLoc - # of pixels to the right of the upper left corner relative to original video inputs
 * @property {number} yLoc - # of pixels below the upper left corner relative to original video inputs
 * @property {WhippleCommandFadeEffect} fadeIn
 * @property {WhippleCommandFadeEffect} [fadeOut]
 */

/**
 * @name WhippleCommandImageOverlay
 * @type Object
 * @property {string} filePath
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