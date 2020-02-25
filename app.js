var express = require('express');
var app = express();
var m3u = require('m3u');
var fs  = require('fs');
var default_playlist = require('./default_playlist');

var port = process.env.PORT || 3001;

function getFiles (dir, files_){
  files_ = files_ || [];
  var files = fs.readdirSync(dir);
  for (var i in files){
    var name = dir + '/' + files[i];
    // console.log(files[i])
    if (fs.statSync(name).isDirectory()){
      getFiles(name, files_);
    } else {
      files_.push(files[i]);
    }
  }
  return files_;
}

express.static.mime.define({'video/mp2t': ['ts']});
app.use('/assets', express.static('assets'));

var writer = m3u.httpLiveStreamingWriter();
var index = 0;
var isFirstVid = true;

app.get('/playlist.m3u8', function (req, res) {
  // EXT-X-VERSION: Indicates the compatibility version of the Playlist file.
  // (optional)
  writer.version(6);

  writer.allowCache(false);

  // EXT-X-PLAYLIST-TYPE: Provides mutability information about the m3u file.
  // (optional)
  writer.playlistType('EVENT');

  // EXT-X-TARGETDURATION: Maximum media file duration.
  writer.targetDuration(6);

  // EXT-X-MEDIA-SEQUENCE: Sequence number of first file (optional).
  // (optional)
  writer.mediaSequence(0);

  makePlaylist(req);

  res
    .set('Content-Type', 'application/x-mpegURL')
    .send(writer.toString());
});

app.get('/kevin', function (req, res) {
  var vidFiles = [
    { name: "assets/kevin/segment-0.ts", duration: 6.006000 },
    { name: "assets/kevin/segment-1.ts", duration: 6.006000 },
    { name: "assets/kevin/segment-2.ts", duration: 6.006000 },
    { name: "assets/kevin/segment-3.ts", duration: 6.006000 },
    { name: "assets/kevin/segment-4.ts", duration: 6.006000 },
    { name: "assets/kevin/segment-5.ts", duration: 6.006000 },
    { name: "assets/kevin/segment-6.ts", duration: 6.006000 },
    { name: "assets/kevin/segment-7.ts", duration: 6.006000 },
    { name: "assets/kevin/segment-8.ts", duration: 6.006000 },
    { name: "assets/kevin/segment-9.ts", duration: 6.006000 },
    { name: "assets/kevin/segment-10.ts", duration: 6.006000 },
    { name: "assets/kevin/segment-11.ts", duration: 2.127125 }
  ]

  // writer.discontinuity();
  // console.log("----------------------------------");
  //
  // for (i = 0; i < vidFiles.length; i++) {
  //   writer.file(req.protocol + '://' + req.get('host') + "/" + vidFiles[i].name, vidFiles[i].duration);
  //   console.log("Adding " + vidFiles[i].name);
  // }

  default_playlist.splice(index, 0, vidFiles);
  console.log(default_playlist);
});

var timeToAdd = true;
var timer;

function makePlaylist(req) {
  var vidDuration = 0;
  if (timeToAdd) {
    console.log(index);

    if (isFirstVid) {
      timer = new Date().getTime();

      var timeAdded = timer - new Date().getTime();

      var seconds = Math.floor((timeAdded % (1000 * 60)) / 1000);

      console.log("Video added: " + seconds + " seconds since the timer began.");

      for (i = 0; i < 3; i++) {
        writer.file(req.protocol + '://' + req.get('host') + "/" + default_playlist[index][i].name, default_playlist[index][i].duration);
        console.log("Adding " + default_playlist[index][i].name);
        vidDuration += default_playlist[index][i].duration;
      }

      setTimeout(function() {
        for (i = 3; i < default_playlist[index].length; i++) {
          writer.file(req.protocol + '://' + req.get('host') + "/" + default_playlist[index][i].name, default_playlist[index][i].duration);
          console.log("Adding " + default_playlist[index][i].name);
          vidDuration += default_playlist[index][i].duration;
        }

        if (index < default_playlist.length - 1) {
          index ++;
        } else {
          index = 0;
        }

        isFirstVid = false;

        var nextVidCall = (vidDuration.toFixed() * 1000) * .75
        console.log("This video is " + vidDuration.toFixed() + " seconds long. Will make the next call in " + (vidDuration.toFixed()* .75) + " seconds.");

        setTimeout(function() {
          console.log((vidDuration.toFixed()* .75) + " seconds have passed. Will add next vid now.");
          timeToAdd = true;
        }, nextVidCall);

        console.log("----------------------------------");

      }, 3000);

      timeToAdd = false;
    } else {
      writer.discontinuity();

      var newTimer = new Date().getTime();
      var timeAdded = newTimer - timer;

      var minutes = Math.floor((timeAdded % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((timeAdded % (1000 * 60)) / 1000);

      console.log("Video added: " + minutes + " minutes and " + seconds + " seconds since the last video.");

      timer = newTimer;

      for (i = 0; i < default_playlist[index].length; i++) {
        writer.file(req.protocol + '://' + req.get('host') + "/" + default_playlist[index][i].name, default_playlist[index][i].duration);
        console.log("Adding " + default_playlist[index][i].name);
        vidDuration += default_playlist[index][i].duration;
      }

      if (index < default_playlist.length - 1) {
        index ++;
      } else {
        index = 0;
      }

      timeToAdd = false;

      var nextVidCall = (vidDuration.toFixed() * 1000) * .75;
      console.log("This video is " + vidDuration.toFixed() + " seconds long. Will the make next call in " + (vidDuration.toFixed() * .75) + " seconds.");

      setTimeout(function() {
        console.log((vidDuration.toFixed() * .75) + " seconds have passed. Will add next vid now.");
        timeToAdd = true;
      }, nextVidCall);

      console.log("----------------------------------");
    }
  }
}

app.listen(port, function () {
  console.log('Example app listening on port ' + port);
});
