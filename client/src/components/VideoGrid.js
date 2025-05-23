import React from 'react';
import { useVideo } from '../context/VideoContext';

const VideoGrid = () => {
    const { state } = useVideo();
    const { localStream, remoteStreams } = state;

    const allStreams = [
        { id: 'local', stream: localStream },
        ...Object.entries(remoteStreams).map(([id, stream]) => ({
            id,
            stream,
        })),
    ].filter((item) => item.stream);

    const gridClass = allStreams.length <= 1
        ? 'grid-cols-1'
        : allStreams.length <= 4
            ? 'grid-cols-2'
            : 'grid-cols-3';

    return (
        <div className={`grid ${gridClass} gap-4 p-4`}>
            {allStreams.map(({ id, stream }) => (
                <div
                    key={id}
                    className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden"
                >
                    <video
                        ref={(video) => {
                            if (video) {
                                video.srcObject = stream;
                            }
                        }}
                        autoPlay
                        playsInline
                        muted={id === 'local'}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-sm">
                        {id === 'local' ? 'You' : `Participant ${id}`}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default VideoGrid; 