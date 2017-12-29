'use strict';

const Path = require('path');
const Fs = require('fs');
const FfmpegCommandService = require('./ffmpegCommandService');
const Joi = require('joi');

class FfmpegCommandServiceFactory {

    /**
     * @name WhippleFfmpegConfig
     * @type Object
     * @property {string} pathToFfmpegBin
     */

    /**
     * @name WhippleFontConfig
     * @type Object
     * @property {String} [fontsDirectory] - if not provided, all fontFilePath values in the fonts array must be absolute
     * @property {WhippleFont[]} fonts
     */

    /**
     * @name WhippleFont
     * @type Object
     * @property {String} name
     * @property {String} fontFilePath - absolute or relative path to font file (fontsDirectory in WhippleFontConfig as base)
     */

    /**
     * @param {WhippleFfmpegConfig} ffmpegConfig
     * @param {WhippleFontConfig} fontConfig - unvalidated configuration
     * @returns {FfmpegCommandService}
     */
    static create(ffmpegConfig, fontConfig) {
        FfmpegCommandServiceFactory._validateFfmpegConfig(ffmpegConfig);
        FfmpegCommandServiceFactory._validateFontConfigSchema(fontConfig);
        FfmpegCommandServiceFactory._confirmEachFontFileExists(fontConfig);
        return new FfmpegCommandService(ffmpegConfig, fontConfig);
    }

    /**
     * @param {WhippleFfmpegConfig} ffmpegConfig
     * @private
     */
    static _validateFfmpegConfig(ffmpegConfig) {
        const schema = Joi.object().keys({
            pathToFfmpegBin: Joi.string().required()
        });

        const validationResult = Joi.validate(ffmpegConfig, schema);
        if (validationResult.error) {
            throw validationResult.error;
        }
    }

    /**
     * @param {WhippleFontConfig} fontConfig
     * @private
     */
    static _validateFontConfigSchema(fontConfig) {
        const schema = Joi.object().keys({
            fontsDirectory: Joi.string(),
            fonts: Joi.array().items(Joi.object().keys({
                name: Joi.string().required(),
                fontFilePath: Joi.string().required()
            })).required()
        });

        const validationResult = Joi.validate(fontConfig, schema);
        if (validationResult.error) {
            throw validationResult.error;
        }
    }

    /**
     * @param {WhippleFontConfig} fontConfig
     * @private
     */
    static _confirmEachFontFileExists(fontConfig) {
        const _prefixDir = fontConfig.fontsDirectory || '';

        fontConfig.fonts.map(font => {
            const fullFontFilePath = Path.join(_prefixDir, font.fontFilePath);
            if (!Fs.existsSync(fullFontFilePath)) {
                throw new Error(`Font file for ${font.name} does not exist. Looked for file ${fullFontFilePath}`);
            }
        })
    }

}

module.exports = FfmpegCommandServiceFactory;