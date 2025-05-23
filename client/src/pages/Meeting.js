import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { useWebRTC } from '../hooks/useWebRTC';
import VideoGrid from '../components/VideoGrid';
import MeetingControls from '../components/MeetingControls';

const Meeting = () => {
    const { meetingId } = useParams();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io(process.env.REACT_APP_API_URL);
        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    const { toggleAudio, toggleVideo, toggleScreenShare } = useWebRTC(socket, meetingId);

    return (
        <div className="h-screen flex flex-col bg-gray-900">
            <div className="flex-1 overflow-hidden">
                <VideoGrid />
            </div>
            <MeetingControls
                onToggleAudio={toggleAudio}
                onToggleVideo={toggleVideo}
                onToggleScreenShare={toggleScreenShare}
            />
        </div>
    );
};

export default Meeting; 