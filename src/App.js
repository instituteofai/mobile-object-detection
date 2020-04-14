import React, {useRef, useEffect} from 'react';
import './App.css';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

function App() {
  // Load the model
  const modelPromise = cocoSsd.load({base: 'lite_mobilenet_v2'});

  // References for video and canvas elements
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Height and width of canvas
  const winWidth = window.innerWidth;
  const winHeight = window.innerHeight;

  // Run inference on the video stream
  const runInference = (video, model) => {
    model.detect(video).then((predictions) => {
      drawBoundingBoxes(predictions);
    });
    requestAnimationFrame(() => runInference(video, model));
  };

  // Draw bounding boxes around predictions
  const drawBoundingBoxes = (predictions) => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'green';
    ctx.font = '14px sans-serif';
    ctx.textBaseline = 'bottom';
    const padding = 8;

    predictions.forEach((prediction) => {
      const predText = prediction.class + ' - ' + (prediction.score * 100).toFixed(2);
      const textWidth = ctx.measureText(predText).width;
      const textHeight = parseInt(ctx.font, 10);
      ctx.strokeRect(
        prediction.bbox[0],
        prediction.bbox[1],
        prediction.bbox[2],
        prediction.bbox[3],
      );

      ctx.fillStyle = '#000';
      ctx.fillRect(
        prediction.bbox[0],
        prediction.bbox[1],
        textWidth + 2 * padding,
        textHeight + 2 * padding,
      );

      ctx.fillStyle = '#FFF';
      ctx.fillText(
        predText,
        prediction.bbox[0] + padding,
        prediction.bbox[1] + textHeight + padding,
      );
    });
  };

  useEffect(() => {
    // Only video is required from the user's device
    const mediaConstraints = {
      audio: false,
      video: {
        facingMode: 'environment',
        height: winHeight,
        width: winWidth,
      },
    };

    if (navigator.mediaDevices.getUserMedia) {
      const videoStreamPromise = navigator.mediaDevices
        .getUserMedia(mediaConstraints)
        .then((stream) => {
          videoRef.current.srcObject = stream;
          // Wait for video element to load with data
          return new Promise((resolve) => (videoRef.current.onloadedmetadata = resolve));
        })
        .catch(() => {
          alert('Activate your camera and refresh the page.');
        });

      // Start prediction when the model and video stream have both loaded
      Promise.all([modelPromise, videoStreamPromise])
        .then((values) => {
          runInference(videoRef.current, values[0]);
        })
        .catch((error) => console.error(error));
    }
  });

  return (
    <>
      <video ref={videoRef} autoPlay playsInline width={winWidth} height={winHeight} />
      <canvas ref={canvasRef} width={winWidth} height={winHeight} />
    </>
  );
}

export default App;
