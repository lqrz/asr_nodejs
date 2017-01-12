
$(document).ready(function(){
	function hasGetUserMedia() {
		return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
		navigator.mozGetUserMedia || navigator.msGetUserMedia);
		}

	if (hasGetUserMedia()) {
		console.log("getUserMedia() supported!")
	} else {
		alert('getUserMedia() is not supported in your browser');
	}

	window.AudioContext = window.AudioContext || window.webkitAudioContext;

	// var recordRTC = null;
	var audioContext = new AudioContext();
	var native_recorder = null;
	var audio_path = null;
	var decoder_path = null;

	function gotStream(stream) {
	    inputPoint = audioContext.createGain();

	    // Create an AudioNode from the stream.
	    realAudioInput = audioContext.createMediaStreamSource(stream);
	    audioInput = realAudioInput;
	    audioInput.connect(inputPoint);

	//    audioInput = convertToMono( input );

	    analyserNode = audioContext.createAnalyser();
	    analyserNode.fftSize = 2048;
	    inputPoint.connect( analyserNode );

	    native_recorder = new Recorder( inputPoint );

	    zeroGain = audioContext.createGain();
	    zeroGain.gain.value = 0.0;
	    inputPoint.connect( zeroGain );
	    zeroGain.connect( audioContext.destination );
	}

	function initAudio() {
	        if (!navigator.getUserMedia)
	            navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	        if (!navigator.cancelAnimationFrame)
	            navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
	        if (!navigator.requestAnimationFrame)
	            navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

	    navigator.getUserMedia(
	        {
	            "audio": {
	                "mandatory": {
	                    "googEchoCancellation": "false",
	                    "googAutoGainControl": "false",
	                    "googNoiseSuppression": "false",
	                    "googHighpassFilter": "false"
	                },
	                "optional": []
	            },
	        }, gotStream, function(e) {
	            alert('Error getting audio');
	            console.log(e);
	        });
	}

	initAudio();

	// converts blob to base64
	var blobToBase64 = function(blob) {
		var reader = new FileReader();
		reader.onload = function() {
			var dataUrl = reader.result;
			var base64 = dataUrl.split(',')[1];
			send_data(base64);
			};
		reader.readAsDataURL(blob);
		};

	function send_data(audio_base64){
		console.log("Sending data to server")
		json_obj = JSON.stringify({'audio_base64': audio_base64,
									'audio_path': audio_path,
									'decoder_path': decoder_path
									})
		console.log(json_obj)
		$.ajax({
			type: 'POST',
			url: '/send_audio',
			data: json_obj,
			contentType: 'application/json',
			cache: false,
			processData: false,
			})
		.success(function(server_response){
			console.log("Audio successfully sent")
			console.log(server_response)
			var translation = jQuery.parseJSON(server_response);
			if (translation.translation==""){
				$('#output_translation').val("(empty translation)");
			}else{
				$('#output_translation').val(translation.translation);
			}
		})
	}

	$( "#record_image" )
		.mouseup(function() {
			console.log("Recording stop")
			native_recorder.stop();
			// native_recorder.getBuffer(function(buff){}
			native_recorder.exportWAV(blobToBase64);
			// function(blob) {
			// 	console.log(blob)
			// 	send_data

   //  			Recorder.forceDownload( blob, "myRecording.wav" );
			// 	// audio.src = window.URL.createObjectURL(s);
			// 	});
			// recordRTC.stopRecording(function() {
				// recordRTC.save('just_stopped.wav');
				// console.log(recordRTC.view)
				// console.log(recordRTC.getBlob())
				// blobToBase64(recordRTC.getBlob(), send_data)
				// });
			})
		.mousedown(function() {
			console.log("Recording start")
			console.log("Validating paths")
			audio_path = $('#audio_path').val()
			decoder_path = $('#decoder_script_path').val()
			console.log(audio_path)
			console.log(decoder_path)

			if (audio_path=="" || decoder_path==""){
				alert("Missing input paths")
				return;
			}
			$('#output_translation').val("Translating...");
			navigator.getUserMedia({audio: true, video: false}, function (mediaStream) {
				native_recorder.clear();
				native_recorder.record();
				// recordRTC = RecordRTC(mediaStream);
				// recordRTC.clearRecordedData();
				// recordRTC.startRecording();
				}, function(err){
					console.log("Error!")
				});
			});
	
});


// navigator.getUserMedia(session, function (mediaStream) {
// 	recordRTC = RecordRTC(MediaStream);
// 	recordRTC.startRecording();
// 	}, onError);
;