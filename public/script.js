const socket = io("/")

const videoGrid = document.getElementById("video-grid")

const myPeer = new Peer(undefined, {})

const myVideo = document.createElement("video")
myVideo.classList.add("rounded-lg", "object-cover", "only:block", "hidden", "sm:block", "sm:m-2", "bg-blue-300", "h-screen", "w-screen")
myVideo.style.maxWidth = "1000px"
myVideo.style.maxHeight = "1000px"
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
      call.answer(stream)
      peers[call.peer] = call
      const video = createNewVideo()
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream)
      })
    })

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, window.stream)
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

function createNewVideo() {
  const video = document.createElement("video")
  video.classList.add("rounded-lg", "object-cover", "sm:m-2", "bg-blue-300", "h-screen", "w-screen")
  video.style.maxWidth = "1000px"
  video.style.maxHeight = "1000px"
  return video
}

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = createNewVideo()
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
  video.classList.add(stream.id)
  video.addEventListener("loadedmetadata", () => {
    video.play()
  })
  debouncedRecalculateLayout()

  video.muted = true

  // const videoContainer = document.createElement("div")
  // videoContainer.classList.add("video-container")
  // videoContainer.append(video)

  videoGrid.append(video)
}

const audioSelect = document.getElementById("audioSourceSelect")
const videoSelect = document.getElementById("videoSourceSelect")
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
    (option) => option.text === stream.getVideoTracks()[0].label
  )

  addVideoStream(myVideo, stream)
  // This only works when ur the second person to join lololol
  for (const [key, value] of Object.entries(peers)) {
    value.peerConnection.getSenders().forEach((sender) => {
      if (sender.track.kind === "video" && stream.getVideoTracks().length > 0) {
        sender.replaceTrack(stream.getVideoTracks()[0])
      }
      if (sender.track.kind === "audio" && stream.getAudioTracks().length > 0) {
        sender.replaceTrack(stream.getAudioTracks()[0])
      }
    })
  }
}

function handleError(error) {
  console.error("Error: ", error)
}

function recalculateLayout() {
  const gallery = document.getElementById("video-grid")
  const screenWidth = document.body.getBoundingClientRect().width
  const screenHeight = document.body.getBoundingClientRect().height
  const videoCount = document.getElementsByTagName("video").length

  function calculateLayout(containerWidth, containerHeight, videoCount) {
    const aspectRatio = 16 / 9

    let bestLayout = {
      area: 0,
      cols: 0,
      rows: 0,
      width: 0,
      height: 0,
    }

    // brute-force search layout where video occupy the largest area of the container
    for (let cols = 1; cols <= videoCount; cols++) {
      const rows = Math.ceil(videoCount / cols)
      const hScale = containerWidth / (cols * aspectRatio)
      const vScale = containerHeight / rows
      let width
      let height
      if (hScale <= vScale) {
        width = Math.floor(containerWidth / cols)
        height = Math.floor(width / aspectRatio)
      } else {
        height = Math.floor(containerHeight / rows)
        width = Math.floor(height * aspectRatio)
      }
      const area = width * height
      if (area > bestLayout.area) {
        bestLayout = {
          area,
          width,
          height,
          rows,
          cols,
        }
      }
    }
    return bestLayout
  }

  const { width, height, cols } = calculateLayout(screenWidth, screenHeight, videoCount)

  gallery.style.setProperty("--width", width + "px")
  gallery.style.setProperty("--height", height + "px")
  gallery.style.setProperty("--cols", cols + "")
}

const debouncedRecalculateLayout = _.debounce(recalculateLayout, 30)
window.addEventListener("resize", debouncedRecalculateLayout)
debouncedRecalculateLayout()
