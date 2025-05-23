import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
    const [meetingId, setMeetingId] = useState('');
    const navigate = useNavigate();

    const createMeeting = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/meetings`);
            navigate(`/meeting/${response.data.meetingId}`);
        } catch (error) {
            console.error('Error creating meeting:', error);
        }
    };

    const joinMeeting = () => {
        if (meetingId.trim()) {
            navigate(`/meeting/${meetingId}`);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Welcome to VisionMeet
                </h1>
                <p className="text-xl text-gray-600">
                    Secure, AI-powered video conferencing platform
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="space-y-6">
                    <div>
                        <button
                            onClick={createMeeting}
                            className="w-full bg-primary-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-primary-700 transition-colors"
                        >
                            Create New Meeting
                        </button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">or join a meeting</span>
                        </div>
                    </div>

                    <div>
                        <input
                            type="text"
                            value={meetingId}
                            onChange={(e) => setMeetingId(e.target.value)}
                            placeholder="Enter Meeting ID"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <button
                            onClick={joinMeeting}
                            className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-md text-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                            Join Meeting
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home; 