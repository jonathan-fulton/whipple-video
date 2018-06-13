const Path = require('path');
const FfmpegCommandServiceFactory = require('./lib/ffmpegCommandServiceFactory');
const { exec } = require('child_process');
const http = require('http')
const https = require('https')
const fs = require('fs')
const url = require('url')
const async = require('async')
const port = 4242

/**
 * Example:
 * curl -X POST --data '{"video": {"filePath": "sample.mp4", "dimensions": { "width": 1920, "height": 1080 }, "trimStart": 0, "trimDuration": 10}}' http://localhost:4242
 */

const ffmpegCommandService = FfmpegCommandServiceFactory.create({
    pathToFfmpegBin: '/usr/local/bin/ffmpeg'
}, {
    fontsDirectory: Path.resolve(__dirname, './test/fixtures/fonts1'),
    fonts: [{
        name: 'Avenir',
        fontFilePath: 'Avenir.ttc'
    }, {
        name: 'Helvetica',
        fontFilePath: 'HelveticaNeueDeskInterface.ttc'
    }]
});

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST'
};

const requestHandler = (request, response) => {
    if (request.method === 'OPTIONS') {
        response.writeHead(200, corsHeaders);
        response.end();
    } else if (request.method === 'POST') {
        let body = '';

        request.on('data', data => {
            body += data;
        });
        request.on('end', () => {
            const source = JSON.parse(body);
            let options = Object.assign(source, {
                output: {
                    filePath: 'output.mp4',
                    dimensions: {
                        width: 1920,
                        height: 1080
                    }
                },
                workingDirectory: Path.resolve(__dirname, './test/fixtures/assets1')
            });

            // TODO: Yes, this is super duper ugly
            async.map(options.audio, handleMediaList, (err, results) => {
                options.audio = results;

                async.map(options.video, handleMediaList, (err, results) => {
                    options.video = results;

                    async.map(options.imageOverlay, handleMediaList, (err, results) => {
                        options.imageOverlay = results;

                        try {
                            const command = ffmpegCommandService.createFfmpegCommand(options, true);
                            console.log(command);

                            console.log('Starting to encode!');
                            
                            exec(command, (err, stdout, stderr) => {
                                if (err) {
                                    console.log(err);
                                    return;
                                }

                                // the *entire* stdout and stderr (buffered)
                                console.log(`stdout: ${stdout}`);
                                console.log(`stderr: ${stderr}`);

                                response.writeHead(200, Object.assign({'Content-Type': 'application/json'}, corsHeaders));
                                response.end(JSON.stringify({ message: 'Success!', command }));

                                exec('open /Users/mathiashansen/Projects/whipple-video/test/fixtures/assets1/output.mp4');
                            });
                        } catch (err) {
                            response.writeHead(400, Object.assign({'Content-Type': 'application/json'}, corsHeaders));
                            response.end(JSON.stringify({ message: err.message }));
                        }
                    });
                });
            });
        });
    } else {
        response.writeHead(404, {'Content-Type': 'application/json'});
        response.end(JSON.stringify({ error: 'Page not found' }));
    }

    console.log(request.url);
}

function handleMediaList(media, callback) {
    if (media.filePath.indexOf('https://') !== -1) {
        const fullUrl = media.filePath;
        console.log('Found url: ' + fullUrl);

        const parsed = url.parse(fullUrl);
        const filename = Path.basename(parsed.pathname);
        const destPath = Path.resolve(__dirname, './test/fixtures/assets1', filename);

        media.filePath = filename;

        if (!fs.existsSync(destPath)) {
            console.log('Saving to: ' + destPath);

            const file = fs.createWriteStream(destPath);
            const request = https.get(fullUrl, response => {
                response.pipe(file);
                response.on('end', () => {
                    console.log('Done downloading!')
                    callback(null, media)
                });
            });

        } else {
            console.log('Using cache: ' + destPath)
            callback(null, media)
        }
    } else {
        callback(null, media);
    }
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
  if (err) {
    return console.log('Something bad happened', err)
  }

  console.log(`Server is listening on ${port}`)
})

