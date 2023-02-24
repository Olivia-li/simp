const socket = io("/")
const videoGrid = document.getElementById("video-grid")

const myPeer = new Peer(undefined, {})

const myVideo = document.createElement("video")
myVideo.style.width = "200px"
myVideo.style.height = "200px"
myVideo.muted = true
const peers = {}

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    addVideoStream(myVideo, stream)

    myPeer.on("call", (call) => {
      call.answer(window.stream)
      peers[call.peer] = call
      const video = document.createElement("video")
      video.classList.add("rounded-lg")
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream)
      })
    })

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream)
    })

  })
  .catch((err) => {
    console.log(err)
  })

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close()
})



myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement("video")
  video.classList.add("rounded-lg")
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream)
  })
  call.on("close", () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener("loadedmetadata", () => {
    video.play()
  })
  videoGrid.append(video)
}

const audioSelect = document.getElementById("audioSourceSelect")
const videoSelect = document.getElementById("videoSourceSelect")
console.log(audioSelect)
audioSelect.onchange = getStream
videoSelect.onchange = getStream

getStream().then(getDevices).then(gotDevices)

function getDevices() {
  return navigator.mediaDevices.enumerateDevices()
}

function gotDevices(deviceInfos) {
  window.deviceInfos = deviceInfos
  for (const deviceInfo of deviceInfos) {
    const option = document.createElement("option")
    option.value = deviceInfo.deviceId
    if (deviceInfo.kind === "audioinput") {
      option.text = deviceInfo.label || `Microphone ${audioSelect.length + 1}`
      audioSelect.appendChild(option)
    } else if (deviceInfo.kind === "videoinput") {
      option.text = deviceInfo.label || `Camera ${videoSelect.length + 1}`
      videoSelect.appendChild(option)
    }
  }
}

function getStream() {
  if (window.stream) {
    window.stream.getTracks().forEach((track) => {
      track.stop()
    })
  }
  const audioSource = audioSelect.value
  const videoSource = videoSelect.value
  const constraints = {
    audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
    video: { deviceId: videoSource ? { exact: videoSource } : undefined },
  }
  return navigator.mediaDevices.getUserMedia(constraints).then(gotStream).catch(handleError)
}

function gotStream(stream) {
  window.stream = stream
  audioSelect.selectedIndex = [...audioSelect.options].findIndex(
    (option) => option.text === stream.getAudioTracks()[0].label
  )
  videoSelect.selectedIndex = [...videoSelect.options].findIndex(
    option => option.text === stream.getVideoTracks()[0].label
  );
  addVideoStream(myVideo, stream);
  myVideo.srcObject = stream;
  // This only works when ur the second person to join lololol
  for(const [key, value] of Object.entries(peers)) {
    value.peerConnection.getSenders().forEach(sender => {
      if (sender.track.kind === "video" && stream.getVideoTracks().length > 0) {
        sender.replaceTrack(stream.getVideoTracks()[0]);
      };
      if (sender.track.kind === "audio" && stream.getAudioTracks().length > 0) {
        sender.replaceTrack(stream.getAudioTracks()[0]);
      };
    })
  }
}

function handleError(error) {
  console.error("Error: ", error)
}
