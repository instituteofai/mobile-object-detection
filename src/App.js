import React, {useRef, useEffect} from 'react';
import './App.css';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

function App() {
  // Load the model
  const modelPromise = cocoSsd.load({base: 'mobilenet_v2'});

  // References for video and canvas elements
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Only video is required from the user's device
    const mediaConstraints = {
      audio: false,
      video: {facingMode: 'environment'},
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
        .then((values) => runInference(videoRef.current, values[0]))
        .catch((error) => console.error(error));
    }
  });

  // Run inference on the video stream
  const runInference = (video, model) => {
    model.detect(video).then((predictions) => {
      console.log(predictions);
    });
    setTimeout(() => {
      runInference(video, model);
    }, 1000);
  };

  // Draw bounding boxes

  return (
    <>
      <video ref={videoRef} autoPlay></video>
      <canvas ref={canvasRef}></canvas>
    </>
  );
}

export default App;
