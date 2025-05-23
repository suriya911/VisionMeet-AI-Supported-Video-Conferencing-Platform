import { useEffect, useRef } from 'react';
import { useVideo } from '../context/VideoContext';
import Peer from 'simple-peer';

export const useWebRTC = (socket, meetingId) => {
    const { state, dispatch } = useVideo();
    const peersRef = useRef({});

    useEffect(() => {
        // Request media permissions
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
                dispatch({ type: 'SET_LOCAL_STREAM', payload: stream });
            })
            .catch((error) => {
                console.error('Error accessing media devices:', error);
            });

        // Cleanup function
        return () => {
            state.localStream?.getTracks().forEach((track) => track.stop());
            Object.values(peersRef.current).forEach((peer) => peer.destroy());
        };
    }, []);

    useEffect(() => {
        if (!socket || !state.localStream) return;

        // Handle incoming calls
        socket.on('user-joined', ({ userId, signal }) => {
            const peer = new Peer({
                initiator: false,
                trickle: false,
                stream: state.localStream,
            });

            peer.on('signal', (signal) => {
                socket.emit('return-signal', { signal, to: userId });
            });

            peer.on('stream', (stream) => {
                dispatch({
                    type: 'ADD_REMOTE_STREAM',
                    payload: { id: userId, stream },
                });
            });

            peer.signal(signal);
            peersRef.current[userId] = peer;
        });

        // Handle returned signals
        socket.on('signal-received', ({ userId, signal }) => {
            const peer = peersRef.current[userId];
            if (peer) {
                peer.signal(signal);
            }
        });

        // Handle user leaving
        socket.on('user-left', ({ userId }) => {
            if (peersRef.current[userId]) {
                peersRef.current[userId].destroy();
                delete peersRef.current[userId];
                dispatch({ type: 'REMOVE_REMOTE_STREAM', payload: userId });
            }
        });

        // Join the meeting room
        socket.emit('join-meeting', { meetingId });

        return () => {
            socket.off('user-joined');
            socket.off('signal-received');
            socket.off('user-left');
        };
    }, [socket, state.localStream, meetingId]);

    const toggleAudio = () => {
        if (state.localStream) {
            const audioTrack = state.localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                dispatch({ type: 'TOGGLE_AUDIO' });
            }
        }
    };

    const toggleVideo = () => {
        if (state.localStream) {
            const videoTrack = state.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                dispatch({ type: 'TOGGLE_VIDEO' });
            }
        }
    };

    const toggleScreenShare = async () => {
        try {
            if (!state.isScreenSharing) {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                });
                const videoTrack = screenStream.getVideoTracks()[0];

                // Replace video track in all peer connections
                Object.values(peersRef.current).forEach((peer) => {
                    const sender = peer._pc.getSenders().find((s) => s.track.kind === 'video');
                    sender.replaceTrack(videoTrack);
                });

                // Update local stream
                const newStream = new MediaStream([
                    state.localStream.getAudioTracks()[0],
                    videoTrack,
                ]);
                dispatch({ type: 'SET_LOCAL_STREAM', payload: newStream });
                dispatch({ type: 'TOGGLE_SCREEN_SHARE' });

                // Handle screen share stop
                videoTrack.onended = () => {
                    toggleScreenShare();
                };
            } else {
                // Restore camera video
                const cameraStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                });
                const videoTrack = cameraStream.getVideoTracks()[0];

                // Replace video track in all peer connections
                Object.values(peersRef.current).forEach((peer) => {
                    const sender = peer._pc.getSenders().find((s) => s.track.kind === 'video');
                    sender.replaceTrack(videoTrack);
                });

                // Update local stream
                const newStream = new MediaStream([
                    state.localStream.getAudioTracks()[0],
                    videoTrack,
                ]);
                dispatch({ type: 'SET_LOCAL_STREAM', payload: newStream });
                dispatch({ type: 'TOGGLE_SCREEN_SHARE' });
            }
        } catch (error) {
            console.error('Error toggling screen share:', error);
        }
    };

    return {
        toggleAudio,
        toggleVideo,
        toggleScreenShare,
    };
}; 