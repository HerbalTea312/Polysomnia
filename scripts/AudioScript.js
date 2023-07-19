import { config } from "../config.js";
export default function record_page() {
	let state = false;
	const languageCode = window.Telegram.WebApp.initDataUnsafe.user.languageCode;
	const url = config.host + "/dream_item/" + sessionStorage.getItem("user");

	URL = window.URL || window.webkitURL;

	let gumStream; // stream from getUserMedia()
	let rec; // Recorder.js object
	let input; // MediaStreamAudioSourceNode we'll be recording

	// shim for AudioContext when it's not avb. 
	const AudioContext = window.AudioContext || window.webkitAudioContext;

	const recordButton = document.querySelector("#recordBtn");
	const sendButton = document.querySelector("#sendBtn");
	const timeContainer = document.querySelector("#time");
	const deleteButton = document.querySelector("#delete");
	timeContainer.hidden = true;
	deleteButton.disabled = true;

	if (sessionStorage.getItem("emotion") !== null) {
		sessionStorage.removeItem("emotion");
	}
	if (sessionStorage.getItem("title") !== null) {
		sessionStorage.removeItem("title");
	}

	recordButton.addEventListener("click", startRecording);
	sendButton.addEventListener("click", onSendButtonClick);
	deleteButton.addEventListener('click', deleteAudio);

	function onSendButtonClick() {
		sendButton.disabled = true;
		deleteButton.disabled = true;
		// create the wav blob and pass it on to createDownloadLink
		rec.exportWAV(sendAudio);
	}

	function deleteAudio() {
		rec.clear();
		reset();
		sendButton.disabled = true;
		deleteButton.disabled = true;
		timeContainer.hidden = true;
	}

	const constraints = {
		audio: true,
		video: false
	};
	function startRecording() {
		timeContainer.hidden = false;
		// запись началась
		if (state === false) {
			reset();
			navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
				timer();
				recordButton.classList.add("toDark");
				recordButton.innerHTML = `            
				<svg width="31" height="71">
                	<use xlink:href="./icons/button.svg#paused"></use>
            	</svg>`;
				console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

				// create an audio context after getUserMedia is called
				// sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
				// the sampleRate defaults to the one set in your OS for your playback device 
				const audioContext = new AudioContext();

				/*  assign to gumStream for later use  */
				gumStream = stream;

				/* use the stream */
				input = audioContext.createMediaStreamSource(stream);

				// Create the Recorder object and configure to record mono sound (1 channel)
				rec = new Recorder(input, {
					numChannels: 1
				});
				rec.record();
				state = true;
				console.log("Recording started -- Состояние записи: ", state);

				// нет разрешения на захват устройства
			}).catch(() => {
				recordButton.classList.remove("toDark");
				recordButton.innerHTML = `            
				<svg width="53" height="71">
					<use xlink:href="./icons/button.svg#voice"></use>
				</svg>`;
				console.log("no");
			});
		}
		// запись закончилась
		else if (state === true) {
			timeStop();
			recordButton.classList.remove("toDark");
			recordButton.innerHTML = `            
			<svg width="53" height="71">
				<use xlink:href="./icons/button.svg#voice"></use>
			</svg>`;
			rec.stop();
			sendButton.disabled = false;
			deleteButton.disabled = false;
			state = false;
			console.log("stopButton clicked -- Состояние записи: ", state);
		}
	}

	// таймер для записи
	var sec = 0;
	var min = 0;
	var msec = 0;
	var t;

	function tick() {
		msec++;
		if (msec >= 100) {
			msec = 0;
			sec++;
			if (sec >= 60) {
				sec = 0;
				min++;
			}
		}
	}
	function add() {
		tick();
		timeContainer.textContent = (min > 9 ? min : "0" + min)
			+ ":" + (sec > 9 ? sec : "0" + sec)
			+ ":" + (msec > 9 ? msec : "0" + msec);
		timer();
	}
	function timer() {
		t = setTimeout(add, 10);
	}

	function timeStop() {
		clearTimeout(t);
	}

	function reset() {
		timeContainer.textContent = "00:00:00";
		msec = 0; sec = 0; min = 0;
	}

	// отправка аудио
	async function sendAudio(blob) {
		timeContainer.hidden = true;
		const formData = new FormData();
		const filename = 'myfile.wav';

		let audio = new Audio();
		const audioURL = window.URL.createObjectURL(blob);
		audio.src = audioURL;
		audio.onloadeddata = async function () {

			formData.append('language_code', languageCode);
			formData.append('audio', blob, filename);
			formData.append('duration', this.duration);
			formData.append('session_id', sessionStorage.getItem("session"));

			for (var pair of formData.entries()) {
				console.log(pair[0] + ', ' + pair[1]);
			}

			await fetch(url, {
				method: 'POST',
				body: formData
			})
				.then(r => r.json())
				.then(({ id_dream }) => {
					console.log('Code after then');
					console.log(id_dream);
					sessionStorage.setItem("dream", id_dream);
					page.redirect("/edit");
				});
			formData.delete('user_id', 'audio', 'duration', 'language_code');
		};
	}
}

