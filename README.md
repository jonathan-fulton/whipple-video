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
As you can see, there are five primary inputs that allow you to customize the content of the output video: video, audio, backgroundOverlay, imageOverlay, and textOverlay.  Each of these have a well-defined schema that we'll review shortly. You can provide either a single object or an array of these objects for each parameter.

## video - WhippleCommandVideo

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

Documentation for each parameter:

`filePath` - Required string. Includes the file extension.  Relative to `workingDirectory` if provided on the overall input object.

`dimensions` - Required object with `width` and `height` integer properties. Doesn't affect output at the moment, merely future-proofing the API.

`trimStart` - Optional number. Number of seconds into the video to start trimming. Defaults to 0.  Must be between 0 and 600.

`trimDuration` - Optional number. Duration of the trimmed video. Defaults to 600 though will be cut off at end of input video if shorter than 600 seconds.  Must be between 0 and 600.

```
ffmpeg -i sample.mp4 -i sample2.mp4 -i music.mp3 -i music2.mp3 -loop 1 -i logo.png  -f lavfi -i anullsrc -f lavfi -i color=c=black:size=1920x1080 -filter_complex "[0:v] trim=start=4:duration=10,setpts=PTS-STARTPTS [v1]; [1:v] trim=start=4:duration=10,setpts=PTS-STARTPTS [v2]; [v1] [v2] concat=n=2:v=1:a=0 [v_concat]; [6:v] format=yuva420p, colorchannelmixer=aa=0.6 [overlay]; [overlay] fade=t=in:st=15:d=2:alpha=1 [overlay_fade]; [v_concat] [overlay_fade] overlay=shortest=1 [v_overlay]; [v_overlay] drawtext=text='Hello World':enable=1:x=800:y=450:fontsize=60:fontfile=/System/Library/Fonts/HelveticaNeueDeskInterface.ttc:fontcolor_expr=ffffff%{eif\\\\: clip(255*(1*between(t\\, 1.0 + 1.0\\, 6.0 - 1.0) + ((t - 1.0)/1.0)*between(t\\, 1.0\\, 1.0 + 1.0) + (-(t - 6.0)/1.0)*between(t\\, 6.0 - 1.0\\, 6.0) )\\, 0\\, 255) \\\\: x\\\\: 2 } [v_text]; [4:v] fade=t=in:st=16:d=1:alpha=1 [logo]; [v_text] [logo] overlay=x=900:y=450:shortest=1 [v_logo]" -map "[v_logo]" output.mp4
```