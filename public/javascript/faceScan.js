(function() {

    var width = 320; // We will scale the photo width to this
    var height = 0; // This will be computed based on the input stream

    var streaming = false;

    var video = null;
    var canvas = null;
    var photo = null;
    var startbutton = null;

    function startup() {
        video = document.getElementById('video');
        canvas = document.getElementById('canvas');
        photo = document.getElementById('photo');
        startbutton = document.getElementById('startbutton');

        navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            })
            .then(function(stream) {
                video.srcObject = stream;
                video.play();
            })
            .catch(function(err) {
                console.log("An error occurred: " + err);
            });

        video.addEventListener('canplay', function(ev) {
            if (!streaming) {
                height = video.videoHeight / (video.videoWidth / width);

                if (isNaN(height)) {
                    height = width / (4 / 3);
                }

                video.setAttribute('width', width);
                video.setAttribute('height', height);
                canvas.setAttribute('width', width);
                canvas.setAttribute('height', height);
                streaming = true;
            }
        }, false);

        startbutton.addEventListener('click', function(ev) {
            document.getElementById('result').classList.remove('available');
            takepicture();
            canvas.toBlob(async function(blob) {
                const formData = new FormData();
                formData.append('inputImg', blob);
                document.getElementById('loader').style.display='flex';
                // document.getElementById('loader').style.display='flex';
                const result = await axios.post('/facescan', formData);
                console.log(result.data);
                if(result.data.verified) {
                    document.getElementById('result').classList.add('available');
                    document.getElementById('resultText').innerHTML = 'Match Found';
                    document.getElementById('resultText').classList.add('success');
                    
                } else {
                    document.getElementById('result').classList.add('available');
                    document.getElementById('resultText').innerHTML = 'Match Not Found';
                    document.getElementById('resultText').classList.add('failure');
                }
                document.getElementById('loader').style.display='none';
            });
            ev.preventDefault();
        }, false);

        clearphoto();
    }


    function clearphoto() {
        var context = canvas.getContext('2d');
        context.fillStyle = "#AAA";
        context.fillRect(0, 0, canvas.width, canvas.height);

        var data = canvas.toDataURL('image/png');
        photo.setAttribute('src', data);
    }

    function takepicture() {
        var context = canvas.getContext('2d');
        if (width && height) {
            canvas.width = width;
            canvas.height = height;
            context.drawImage(video, 0, 0, width, height);

            var data = canvas.toDataURL('image/png');
            photo.setAttribute('src', data);
        } else {
            clearphoto();
        }
    }

    window.addEventListener('load', startup, false);
})();

const startbutton = document.getElementById('startbutton');
