const aiService = require('./aiService');
const Meeting = require('../models/Meeting');

class SocketService {
    constructor(io) {
        this.io = io;
        this.transcriptionStreams = new Map();
        this.emotionDetectionIntervals = new Map();
    }

    initialize() {
        this.io.on('connection', (socket) => {
            this.handleConnection(socket);
        });
    }

    handleConnection(socket) {
        socket.on('start-transcription', async ({ meetingId }) => {
            try {
                const meeting = await Meeting.findOne({ meetingId });
                if (!meeting) {
                    throw new Error('Meeting not found');
                }

                // Start transcription stream
                const transcriptionStream = await aiService.startTranscription(meetingId);
                this.transcriptionStreams.set(meetingId, transcriptionStream);

                // Handle transcription results
                transcriptionStream.on('data', async (event) => {
                    if (event.TranscriptEvent?.Transcript?.Results?.[0]?.Alternatives?.[0]?.Transcript) {
                        const transcript = event.TranscriptEvent.Transcript.Results[0].Alternatives[0].Transcript;

                        // Save transcription to database
                        await Meeting.updateOne(
                            { meetingId },
                            {
                                $push: {
                                    transcription: {
                                        speaker: socket.id,
                                        text: transcript,
                                        timestamp: new Date(),
                                    },
                                },
                            }
                        );

                        // Emit transcription to all participants
                        this.io.to(meetingId).emit('transcription', {
                            speaker: socket.id,
                            text: transcript,
                            timestamp: new Date(),
                        });
                    }
                });
            } catch (error) {
                console.error('Error starting transcription:', error);
                socket.emit('transcription-error', { error: error.message });
            }
        });

        socket.on('stop-transcription', ({ meetingId }) => {
            const stream = this.transcriptionStreams.get(meetingId);
            if (stream) {
                stream.destroy();
                this.transcriptionStreams.delete(meetingId);
            }
        });

        socket.on('start-emotion-detection', ({ meetingId }) => {
            const interval = setInterval(async () => {
                try {
                    // Get the latest frame from the client
                    socket.emit('request-frame');
                } catch (error) {
                    console.error('Error in emotion detection:', error);
                }
            }, 5000); // Check emotions every 5 seconds

            this.emotionDetectionIntervals.set(meetingId, interval);
        });

        socket.on('frame-data', async ({ meetingId, imageData }) => {
            try {
                const emotion = await aiService.detectEmotion(imageData);
                if (emotion) {
                    // Save emotion to database
                    await Meeting.updateOne(
                        { meetingId },
                        {
                            $push: {
                                emotions: {
                                    userId: socket.id,
                                    emotion,
                                    timestamp: new Date(),
                                },
                            },
                        }
                    );

                    // Emit emotion to all participants
                    this.io.to(meetingId).emit('emotion-detected', {
                        userId: socket.id,
                        emotion,
                        timestamp: new Date(),
                    });
                }
            } catch (error) {
                console.error('Error processing frame:', error);
            }
        });

        socket.on('stop-emotion-detection', ({ meetingId }) => {
            const interval = this.emotionDetectionIntervals.get(meetingId);
            if (interval) {
                clearInterval(interval);
                this.emotionDetectionIntervals.delete(meetingId);
            }
        });

        socket.on('generate-summary', async ({ meetingId }) => {
            try {
                const meeting = await Meeting.findOne({ meetingId });
                if (!meeting) {
                    throw new Error('Meeting not found');
                }

                // Combine all transcriptions
                const transcription = meeting.transcription
                    .map((t) => `${t.speaker}: ${t.text}`)
                    .join('\n');

                // Generate summary
                const summary = await aiService.generateSummary(transcription);

                // Save summary to database
                await Meeting.updateOne(
                    { meetingId },
                    {
                        $set: {
                            summary: {
                                ...summary,
                                generatedAt: new Date(),
                            },
                        },
                    }
                );

                // Emit summary to all participants
                this.io.to(meetingId).emit('summary-generated', summary);
            } catch (error) {
                console.error('Error generating summary:', error);
                socket.emit('summary-error', { error: error.message });
            }
        });

        socket.on('disconnect', () => {
            // Clean up any active streams or intervals
            this.transcriptionStreams.forEach((stream, meetingId) => {
                stream.destroy();
            });
            this.transcriptionStreams.clear();

            this.emotionDetectionIntervals.forEach((interval) => {
                clearInterval(interval);
            });
            this.emotionDetectionIntervals.clear();
        });
    }
}

module.exports = SocketService; 