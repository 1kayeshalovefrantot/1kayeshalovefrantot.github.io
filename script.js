const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const meterBar = document.getElementById('meterBar');
const dbLabel = document.getElementById('dbLabel');
const ball = document.getElementById('ball');
const alertSound = document.getElementById('alertSound');

let alerted = false;

navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);

    const dataArray = new Float32Array(analyser.fftSize);

    function update() {
      analyser.getFloatTimeDomainData(dataArray);

      let sumSquares = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sumSquares += dataArray[i] * dataArray[i];
      }

      let rms = Math.sqrt(sumSquares / dataArray.length);
      let db = 20 * Math.log10(rms);
      let displayDb = Math.max(0, Math.round(-db));

      // Update meter
      dbLabel.textContent = displayDb + ' dB';
      let level = Math.min(displayDb, 100);
      meterBar.style.width = level + '%';

      if (displayDb > 75) {
        meterBar.style.background = 'red';
        ball.style.top = '-50px';
        if (!alerted) {
          alertSound.play();
          alerted = true;
        }
      } else if (displayDb > 50) {
        meterBar.style.background = 'yellow';
        ball.style.top = '-20px';
        alerted = false;
      } else {
        meterBar.style.background = 'green';
        ball.style.top = '0px';
        alerted = false;
      }

      requestAnimationFrame(update);
    }

    update();
  })
  .catch(err => {
    alert('Microphone access is needed to run this app.');
    console.error(err);
  });
