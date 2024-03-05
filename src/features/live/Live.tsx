import { useEffect, useRef, useState } from "react";
import { socket } from "../socket";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { getRoom } from "../roomname";
import { getUser } from "../user/userStore";
import { User } from "../../type";
import { AnyAction, Dispatch } from "@reduxjs/toolkit";
import { getLive, setLive } from "./liveStore";
import { showModal } from "../modal";

export const createPeerConnection = () => {
  const rtc = new RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.stunprotocol.org",
      },
    ],
  });
  return rtc;
};

export function endLive(
  rtc: RTCPeerConnection | null,
  video: HTMLVideoElement,
  dispatch: Dispatch<AnyAction>
) {
  if (rtc) {
    rtc.ontrack = null;
    rtc.onconnectionstatechange = null;
    rtc.onicecandidate = null;
    rtc.onnegotiationneeded = null;
    if (video.srcObject) {
      const srcObject = video.srcObject as MediaStream;
      srcObject.getTracks().forEach((track) => track.stop());
    }
    rtc.close();
    rtc = null;
  }
  video.removeAttribute("src");
  video.removeAttribute("srcObject");
  dispatch(setLive({ laiver: "", isLive: false, type: "going" }));
}

export const Live = () => {
  const [finishedCountdown, setFinishedCountdown] = useState(false);
  const [countdown, setCountdown] = useState(4);
  const [error, setError] = useState("");
  const sendingVideoRef = useRef<HTMLVideoElement>(null);
  const incomingVideoRef = useRef<HTMLVideoElement>(null);
  const countdownRef = useRef<NodeJS.Timeout>();
  const me = useSelector<RootState, User>((state) => getUser(state));
  const entered = useSelector<RootState, number>((state) => getRoom(state));
  const rtcRef = useRef<RTCPeerConnection>();
  const live = useSelector<
    RootState,
    { laiver: string; isLive: boolean; type: string }
  >((state) => getLive(state));
  const dispatch = useDispatch();

  useEffect(() => {
    if (live.type === "going" && !finishedCountdown)
      countdownRef.current = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
  });
console.log(countdownRef.current)
  useEffect(() => {
    if (live.type === "going") {
      socket.emit("goinglive", entered, me.name);
    }
  }, []);

  useEffect(() => {
    if (countdown == 0 && countdownRef.current && live.type === "going") {
      setFinishedCountdown(true);
      clearTimeout(countdownRef.current);
    }
  }, [countdown, live]);

  useEffect(() => {
    async function getMedia() {
      try {
        const userMedia = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        rtcRef.current = createPeerConnection();
        if (sendingVideoRef.current) {
          const rtc = rtcRef.current;
          sendingVideoRef.current.srcObject = userMedia;
          userMedia.getTracks().forEach((track) => {
            rtc!.addTrack(track, userMedia);
          });
          rtc.onicecandidate = (event) => {
            if (event.candidate) {
              socket.emit("sendingICE", event.candidate, entered, me.name);
            }
          };
          rtc.onnegotiationneeded = async () => {
            try {
              const offer = await rtc!.createOffer();
              await rtc!.setLocalDescription(offer);
              socket.emit("live", rtc!.localDescription, entered, me.name);
            } catch (e) {
              reportError();
            }
          };
          rtc.ontrack = (event) => {
            sendingVideoRef.current!.srcObject = event.streams[0];
          };
          rtc.onconnectionstatechange = (e) => {
            console.log(rtc.connectionState);
          };
        }
      } catch (e) {
        setError("Error using webcam");
      }
    }
    countdown == 0 && getMedia();
  }, [countdown]);

  useEffect(() => {
    if (live.type === "incoming") {
      try {
        rtcRef.current = createPeerConnection();
        const rtc = rtcRef.current;
        rtc.ontrack = (event) => {
          incomingVideoRef.current &&
            (incomingVideoRef.current.srcObject = event.streams[0]);
        };
        rtc.onconnectionstatechange = (e) => {
          console.log(rtc.connectionState);
          //endLive(rtc, incomingVideoRef.current!, dispatch);
        };
        socket
          .on("incomingLive", async (sdp: RTCSessionDescription) => {
            const desc = new RTCSessionDescription(sdp);
            await rtc.setRemoteDescription(desc);
            const answer = await rtc.createAnswer();
            await rtc.setLocalDescription(answer);
          })
          .on("receivingICE", (cand: RTCIceCandidate, sender: string) => {
            if (sender !== me.name) {
              const candidate = new RTCIceCandidate(cand);
              rtc.addIceCandidate(candidate);
            }
          });
      } catch (e) {
        reportError();
      }
    }
  }, []);

  function reportError() {
    setError("Error making live");
  }

  if (live.type === "going")
    return (
      <div className="modal">
        {finishedCountdown ? (
          error ? (
            <p>{error}</p>
          ) : (
            <>
              <h1 className="h1live">{live.laiver} is Live</h1>
              <div className="videodiv">
                <video autoPlay ref={sendingVideoRef} />
              </div>
              <div>
                <button
                  onClick={() => {
                    endLive(
                      rtcRef.current!,
                      sendingVideoRef.current!,
                      dispatch
                    );
                  }}
                >
                  End Live
                </button>
              </div>
            </>
          )
        ) : (
          <div className="cd">{countdown}</div>
        )}
      </div>
    );
  else
    return (
      <div className="modal">
        <div className="close">
          <button
            onClick={() => {
              endLive(rtcRef.current!, incomingVideoRef.current!, dispatch);
              dispatch(showModal({ display: false, type: "close" }));
            }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div>
          <h1 className="h1live">{live.laiver} is live</h1>
          <div className="videodiv">
            <video autoPlay ref={incomingVideoRef} />
          </div>
        </div>
      </div>
    );
};
