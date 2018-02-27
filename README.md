# Overview

Whipple-video let's you create simple marketing videos with ease. You can add multiple videos, layer on a sound track, drop in text overlay, apply an image/logo overlay, and "fade" in/out overlays. 

# Sample use

```javascript
const FfmpegCommandServiceFactory = require('whipple-video/lib/ffmpegCommandServiceFactory');
 
const ffmpegCommandService = FfmpegCommandServiceFactory.create({
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
});

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

// Do something with the ffmpeg command
```

# Configuring FfmpegCommandService

There is a `create` function on FfmpegCommandServiceFactory that allows you to create an FfmpegCommandService with two primary configuration options:

1. FFMpeg config, primarily a path to the ffmpeg binary.
2. Font config, primarily a reference to the directory containing the fonts and then an array of font name / files.

Here's an example from our testing code:

```javascript
const ffmpegCommandService = FfmpegCommandServiceFactory.create({
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
});
```

# FfmpegCommandService.createFfmpegCommand()

FfmpegCommandService has a single primary function named `createFfmpegCommand` that takes a complicated input object and returns an ffmpeg command string that should be executable in a shell.

Let's take a look at the input object:

```javascript
const ffmpegCommand = ffmpegCommandService.createFfmpegCommand({
    video: {...} | [{...},...],
    audio: {...} | [{...},...],
    backgroundOverlay: {...} | [{...},...],
    imageOverlay: {...} | [{...},...],
    textOverlay: {...} | [{...},...],
    output: {...},
    workingDirectory: '...'
});
```
As you can see, there are five primary inputs that allow you to customize the content of the output video: `video`, `audio`, `backgroundOverlay`, `imageOverlay`, and `textOverlay`.  Each of these have a well-defined schema that we'll review shortly. You can provide either a single object or an array of these objects for each parameter.  There are also two additional parameters:  `output` and `workingDirectory`.  Details on each of these below.

## video

Here's an example video input object:

```javascript
const partialInputObj = { 
    video: {
        filePath: 'sample.mp4',
        dimensions: {
            width: 1920,
            height: 1080
        },
        trimStart: 0,
        trimDuration: 10
    }
}
```

Here's an example using the array format:

```javascript
const partialInputObj = { 
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
        trimDuration: 5
    }]
}
```

Note that when multiple videos are provided in the array format, they are concatenated together.

Here's the JSDoc specification:

```javascript
/**
 * @name WhippleCommandVideo
 * @type Object
 * @property {string} filePath - include the extension, e.g., .mov .mp4
 * @property {number} [trimStart] - in seconds; must be between 0 and 600. Effectively defaults to 0 if not provided.
 * @property {number} [trimDuration] - in seconds; must be between 0 and 600. Effectively defaults to smaller of 600 or time remaining in input video if not provided.
 * @property {WhippleCommandDimensions} [dimensions]
 */

/**
 * @name WhippleCommandDimensions
 * @property {int} width - in pixels
 * @property {int} height - in pixels
 */
```

## audio

```javascript
/**
 * @name WhippleCommandAudio
 * @type Object
 * @property {string} filePath
 * @property {number} [trimStart] - in seconds; must be between 0 and 600. Effectively defaults to 0 if not provided.
 * @property {number} [trimDuration] - in seconds; must be between 0 and 600. Effectively defaults to smaller of 600 or time remaining in input audio if not provided.
 */
```

## backgroundOverlay

```javascript
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
 * @name WhippleCommandFadeEffect
 * @property {number} startTime - in seconds
 * @property {number} duration - in seconds
 */
```

## imageOverlay

```javascript
/**
 * @name WhippleCommandImageOverlay
 * @type Object
 * @property {string} filePath
 * @property {int} xLoc - # of pixels to the right of the upper left corner relative to original video inputs
 * @property {int} yLoc - # of pixels below the upper left corner relative to original video inputs
 * @property {WhippleCommandFadeEffect} fadeIn
 * @property {WhippleCommandFadeEffect} [fadeOut]
 */
```

## textOverlay

```javascript
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
```

## output

```javascript
/**
 * @name WhippleCommandOutput
 * @type {Object}
 * @property {string} filePath
 * @property {boolean} [includeMoovAtomAtFront=true] - enables video streaming by putting MOOV metadata at front of file
 * @property {WhippleCommandDimensions} [dimensions] - if not provided will implicitly default to input video dims
 */
```

## workingDirectory

String.  audio/video/output filePath's relative to this directory. 