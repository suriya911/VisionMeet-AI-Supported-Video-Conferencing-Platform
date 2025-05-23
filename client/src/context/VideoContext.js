import React, { createContext, useContext, useReducer } from 'react';

const VideoContext = createContext();

const initialState = {
    localStream: null,
    remoteStreams: {},
    isAudioEnabled: true,
    isVideoEnabled: true,
    isScreenSharing: false,
    participants: [],
    meetingId: null,
    isHost: false,
};

function videoReducer(state, action) {
    switch (action.type) {
        case 'SET_LOCAL_STREAM':
            return { ...state, localStream: action.payload };
        case 'ADD_REMOTE_STREAM':
            return {
                ...state,
                remoteStreams: { ...state.remoteStreams, [action.payload.id]: action.payload.stream },
            };
        case 'REMOVE_REMOTE_STREAM':
            const { [action.payload]: removed, ...remaining } = state.remoteStreams;
            return { ...state, remoteStreams: remaining };
        case 'TOGGLE_AUDIO':
            return { ...state, isAudioEnabled: !state.isAudioEnabled };
        case 'TOGGLE_VIDEO':
            return { ...state, isVideoEnabled: !state.isVideoEnabled };
        case 'TOGGLE_SCREEN_SHARE':
            return { ...state, isScreenSharing: !state.isScreenSharing };
        case 'SET_PARTICIPANTS':
            return { ...state, participants: action.payload };
        case 'SET_MEETING_ID':
            return { ...state, meetingId: action.payload };
        case 'SET_HOST':
            return { ...state, isHost: action.payload };
        default:
            return state;
    }
}

export function VideoProvider({ children }) {
    const [state, dispatch] = useReducer(videoReducer, initialState);

    return (
        <VideoContext.Provider value={{ state, dispatch }}>
            {children}
        </VideoContext.Provider>
    );
}

export function useVideo() {
    const context = useContext(VideoContext);
    if (!context) {
        throw new Error('useVideo must be used within a VideoProvider');
    }
    return context;
} 