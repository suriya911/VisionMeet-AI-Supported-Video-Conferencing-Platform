import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MicrophoneIcon,
    VideoCameraIcon,
    ComputerDesktopIcon,
    PhoneXMarkIcon,
} from '@heroicons/react/24/solid';
import { useVideo } from '../context/VideoContext';

const MeetingControls = ({ onToggleAudio, onToggleVideo, onToggleScreenShare }) => {
    const navigate = useNavigate();
    const { state } = useVideo();

    const handleLeaveMeeting = () => {
        navigate('/');
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 py-4">
            <div className="flex justify-center space-x-4">
                <button
                    onClick={onToggleAudio}
                    className={`p-3 rounded-full ${state.isAudioEnabled ? 'bg-gray-700' : 'bg-red-600'
                        }`}
                >
                    <MicrophoneIcon className="h-6 w-6 text-white" />
                </button>

                <button
                    onClick={onToggleVideo}
                    className={`p-3 rounded-full ${state.isVideoEnabled ? 'bg-gray-700' : 'bg-red-600'
                        }`}
                >
                    <VideoCameraIcon className="h-6 w-6 text-white" />
                </button>

                <button
                    onClick={onToggleScreenShare}
                    className={`p-3 rounded-full ${state.isScreenSharing ? 'bg-primary-600' : 'bg-gray-700'
                        }`}
                >
                    <ComputerDesktopIcon className="h-6 w-6 text-white" />
                </button>

                <button
                    onClick={handleLeaveMeeting}
                    className="p-3 rounded-full bg-red-600"
                >
                    <PhoneXMarkIcon className="h-6 w-6 text-white" />
                </button>
            </div>
        </div>
    );
};

export default MeetingControls; 