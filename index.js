window.onload = () => {
  const fileElm = document.querySelector("#input-file");
  const audioElm = document.querySelector("#audio");
  const canvasElm = document.querySelector("canvas");
  const audioStatusElm = document.querySelector("#audio-status");

  canvasElm.width = window.innerWidth;
  canvasElm.height = window.innerHeight;

  fileElm.onchange = () => {
    audioElm.src = URL.createObjectURL(fileElm.files[0]);
    audioElm.load();
    audioElm.play();

    const audioContext = new AudioContext();
    const audioContextSrc = audioContext.createMediaElementSource(audioElm);
    const audioAnalyser = audioContext.createAnalyser();
    const canvasContext = canvasElm.getContext("2d");

    audioContextSrc.connect(audioAnalyser);
    audioAnalyser.connect(audioContext.destination);

    audioAnalyser.fftSize = 256;

    const analyserFrequencyLength = audioAnalyser.frequencyBinCount;
    const frequencyDataArray = new Uint8Array(analyserFrequencyLength);

    const canvasWidth = canvasElm.width;
    const canvasHeight = canvasElm.height;

    const barWidth = (canvasWidth / analyserFrequencyLength) * 2.5;
    let barHeight;
    let barIndex = 0;

    const hasAudio = (frequencyData) => {
      let sum = 0;
      for (let i = 0; i < frequencyData.length; i++) {
        sum += frequencyData[i];
      }
      const threshold = 1000;
      return sum > threshold;
    };

    audioElm.addEventListener("timeupdate", () => {
      const currentTime = audioElm.currentTime;

      audioAnalyser.getByteFrequencyData(frequencyDataArray);

      const hasSound = hasAudio(frequencyDataArray);

      const message = hasSound
        ? "Có âm thanh tại giây " + Math.floor(currentTime)
        : "Không có âm thanh tại giây " + Math.floor(currentTime);
      audioStatusElm.innerText = message;
    });

    const renderFrame = () => {
      window.requestAnimationFrame(renderFrame);

      barIndex = 0;

      audioAnalyser.getByteFrequencyData(frequencyDataArray);

      canvasContext.fillStyle = "#000";
      canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);

      for (let i = 0; i < analyserFrequencyLength; i++) {
        barHeight = frequencyDataArray[i];
        const rgbRed = barHeight + 25 * (i / analyserFrequencyLength);
        const rgbGreen = 250 * (i / analyserFrequencyLength);
        const rgbBlue = 50;

        canvasContext.fillStyle =
          "rgb(" + rgbRed + ", " + rgbGreen + ", " + rgbBlue + ")";
        canvasContext.fillRect(
          barIndex,
          canvasHeight - barHeight,
          barWidth,
          barHeight
        );

        barIndex += barWidth + 1;
      }
    };

    renderFrame();
  };
};
