import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import IconButton from "@mui/material/IconButton";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import Badge from "@mui/material/Badge";
import InboxIcon from "@mui/icons-material/Inbox";
import SendIcon from '@mui/icons-material/Send';
import { useNavigate, useParams } from "react-router-dom";

import "./Videomeet.css";
import { height, width } from "@mui/system";

const server_url = "http://localhost:8000";

var connections = {};

var peerConfigConnections = {
  iceservers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoMeetComponent() {
  var socketRef = useRef();

  let socketIdRef = useRef();

  let localVideoRef = useRef();

  let [videoAvailable, setVideoAvailable] = useState(true);

  let [audioAvailable, setAudioAvailable] = useState(true);

  let [audio, setAudio] = useState();

  let [video, setVideo] = useState([]);

  let [screen, setScreen] = useState();

  let [showModal, setModal] = useState(false);

  let [screenAvailable, setScreenAvailable] = useState();

  let [messages, setMessages] = useState([]);

  let [message, setMessage] = useState("");

  let [newMessages, setNewmessages] = useState(0);

  let [askForUsername, setAskUsername] = useState(true);

  let [username, setUsername] = useState("");

  const videoRef = useRef([]);
  const chatDisplayRef = useRef(null);

  let [videos, setVideos] = useState([]);
  
  const { url } = useParams();
  const [copied, setCopied] = useState(false);

  const getPermission = async () => {
    try {
      const getVideoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      if (getVideoPermission) {
        setVideoAvailable(true);
      } else {
        setVideoAvailable(false);
      }

      const getAudioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      if (getAudioPermission) {
        setAudioAvailable(true);
      } else {
        setAudioAvailable(false);
      }

      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }

      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });
        if (userMediaStream) {
          window.localStream = userMediaStream;

          if (localVideoRef.current) {
            localVideoRef.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    getPermission();
  }, []);

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }
    window.localStream = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = window.localStream;
    }

    for (let id in connections) {
      if (id === socketIdRef.current) {
        continue;
      }
      connections[id].addStream(window.localStream);
      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription }),
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setVideo(false);
          setAudio(false);
          try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoRef.current.srcObject = window.localStream;

          for (let id in connections) {
            connections[id].addStream(window.localStream);
            connections[id].createOffer().then((description) => {
              connections[id]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id,
                    JSON.stringify({ sdp: connections[id].localDescription }),
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        }),
    );
  };

  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);
    if (fromId != socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit(
                        "signal",
                        fromId,
                        JSON.stringify({
                          sdp: connections[fromId].localDescription,
                        }),
                      );
                    })
                    .catch((e) => {
                      console.log(e);
                    });
                })
                .catch((e) => {
                  console.log(e);
                });
            }
          })
          .catch((e) => {
            console.log(e);
          });
      }
      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => {
            console.log(e);
          });
      }
    }
  };

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();

    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();

    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();

    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .then((stream) => {})
        .catch((e) => {
          console.log(e);
        });
    } else {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (e) {
        console.log(e);
      }
    }
  };

  useEffect(() => {
    if (video != undefined && audio != undefined) {
      getUserMedia();
    }
  }, [audio, video]);

  let addMessage = (data,sender,socketIdSender) => {
    setMessages((prevmessages)=>[
      ...prevmessages,
      {sender:sender,data:data}
    ])
    if(socketIdSender!=socketIdRef.current){
      setNewmessages((prevmessages)=>prevmessages+1);
    }
  };


useEffect(() => {
  if (!showModal || !chatDisplayRef.current) return;

  const chat = chatDisplayRef.current;

  requestAnimationFrame(() => {
    chat.scrollTop = chat.scrollHeight;
  });
}, [showModal]);



  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });
    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;
      socketRef.current.on("chat-message", addMessage);
      socketRef.current.on("user-left", (id) => {
        setVideo((videos) =>
          videos.filter((videos) => {
            video.socketId != id;
          }),
        );
      });
      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections,
          );

          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate != null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate }),
              );
            }
          };

          connections[socketListId].onaddstream = (event) => {
            console.log("REMOTE STREAM RECEIVED:", socketListId, event.stream);
            let videoExists = videoRef.current.find(
              (video) => video.socketId === socketListId,
            );

            if (videoExists) {
              setVideos((videos) => {
                const updatedVideos = videos.map((video) => {
                  return video.socketId === socketListId
                    ? { ...video, stream: event.stream }
                    : video;
                });

                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            } else {
              let newVideo = {
                socketId: socketListId,
                stream: event.stream,
                autoplay: true,
                playsinline: true,
              };

              setVideos((videos) => {
                const updatedVideos = [...videos, newVideo];

                videoRef.current = updatedVideos;

                return updatedVideos;
              });
            }
          };

          if (window.localStream != undefined && window.localStream != null) {
            connections[socketListId].addStream(window.localStream);
          } else {
            let blackSilence = (...args) =>
              new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            connections[socketListId].addStream(window.localStream);
          }
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) {
              continue;
            }
            try {
              connections[id2].addStream(window.localStream);
            } catch (e) {
              console.log(e);
            }
            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id2,
                    JSON.stringify({ sdp: connections[id2].localDescription }),
                  );
                })
                .catch((e) => {
                  console.log(e);
                });
            });
          }
        }
      });
    });
  };

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  let routeTo=useNavigate();

  let connect = () => {
    setAskUsername(false);
    getMedia();
  };

  let handleVideo = () => {
    setVideo(!video);
  };

  let handleAudio = () => {
    setAudio(!audio);
  };

  let getDislayMediaSuccess = (stream) => {
    console.log("HERE");
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);
      console.log("Sending screen stream to:", id);
      console.log("Stream tracks:", window.localStream.getTracks());

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription }),
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setScreen(false);

          try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoRef.current.srcObject = window.localStream;

          getUserMedia();
        }),
    );
  };

  let getDisplayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then(getDislayMediaSuccess)
          .then((stream) => {})
          .catch((e) => {
            console.log(e);
            setScreen(false);
          });
      }
    }
    else{
      getUserMedia();
    }
  };
  useEffect(() => {
    if (screen != undefined) {
      getDisplayMedia();
    }
  }, [screen]);

  let handleScreen = () => {
    setScreen(!screen);
  };

  let handleChat=()=>{
    setModal(!showModal);
    setNewmessages(0);
  }

  let sendMessages=()=>{
    if (!message.trim()) {
      return;
    }
    socketRef.current.emit("chat-message",message,username);
    setMessage("");

  }

  let handleEndCall=()=>{
    try{
      let tracks=localVideoRef.current.srcObject.getTracks();
      tracks.forEach(track=>track.stop());
    }
    catch(e){
      console.log(e);
    }
    routeTo("/dashboard");
  }

const copyMeetingCode = async () => {
  try {
    await navigator.clipboard.writeText(url);
    console.log("Copied:", url);
    setCopied(true);
  } catch (error) {
    console.log("Copy failed:", error);
  }
};

  return (
    <div>
      {askForUsername === true ? (
        <div >
        <div className="preview-page">
            <TextField
              className="input-field preview-input"
              id="outlined-basic"
              label="Enter your name"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <Button className="connect-btn preview-btn" variant="contained" onClick={connect}>
              Connect
            </Button>
          </div>

          <div className="preview-video">
            <video ref={localVideoRef} autoPlay muted></video>
          </div>
        </div>
      ) : (
        <div className={`meetVideoContainer ${showModal ? "chat-open" : ""}`}>

        {showModal?
        <div className="chatroom">
          <div className="chatcontainer">

            <h2 style={{color:'#7854db'}}>Chat</h2>

            <div className="chattingDisplay" ref={chatDisplayRef}>
              {messages.length>0? messages.map((item,index)=>{
                return(
                  <div key={index} className={item.sender === username ? "my-message" : "other-message"}>
                    <p className="title">{item.sender}</p>
                    <p className="message">{item.data}</p>

                  </div>

                )

              })
              :<p>No messages yet</p>}
            </div>

            <div className="chattingArea">
              <TextField value={message} onChange={(e)=>setMessage(e.target.value)} id="outlined-basic" label="Send a Message" variant="outlined" />
              <IconButton onClick={sendMessages}><SendIcon/></IconButton>
            </div>
          </div>
          
        </div>
        :
        <></>
        }
          {!copied && (
            <div className="meetingCode">
              <span>{url}</span>

              <Button onClick={copyMeetingCode} variant="contained">
                Copy
              </Button>
            </div>
          )}


          <div className="buttonContainer">
            <IconButton onClick={handleVideo}>
              {video === true ? (
                <VideocamIcon className="meet-controls" />
              ) : (
                <VideocamOffIcon className="meet-controls" />
              )}
            </IconButton>

            <IconButton onClick={handleAudio}>
              {audio === true ? (
                <MicIcon className="meet-controls" />
              ) : (
                <MicOffIcon className="meet-controls" />
              )}
            </IconButton>

            <IconButton onClick={handleEndCall}>
              <CallEndIcon className="call-end" />
            </IconButton>
            {screenAvailable === true ? (
              <IconButton onClick={handleScreen}>
                {screen === true ? (
                  <StopScreenShareIcon className="meet-controls" />
                ) : (
                  <ScreenShareIcon className="meet-controls" />
                )}
              </IconButton>
            ) : (
              <></>
            )}

            <Badge badgeContent={newMessages} max={999} color="secondary">
              <IconButton onClick={handleChat}>
                <InboxIcon className="meet-controls" />
              </IconButton>
            </Badge>
          </div>

          <div className="conferenceView">
            <div>
              <video
                className="meetUserVideo"
                ref={localVideoRef}
                autoPlay
                muted
              ></video>
            </div>
            {videos.map((video) => (
              <div key={video.socketId}>
                <video
                  data-socket={video.socketId}
                  ref={(ref) => {
                    if (ref && video.stream) {
                      ref.srcObject = video.stream;
                    }
                  }}
                  autoPlay
                ></video>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
