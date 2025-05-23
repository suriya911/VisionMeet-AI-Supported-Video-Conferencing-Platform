const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema(
    {
        meetingId: {
            type: String,
            required: true,
            unique: true,
        },
        host: {
            type: String,
            required: true,
        },
        participants: [{
            userId: String,
            joinedAt: Date,
            leftAt: Date,
        }],
        startTime: {
            type: Date,
            default: Date.now,
        },
        endTime: Date,
        transcription: [{
            speaker: String,
            text: String,
            timestamp: Date,
        }],
        summary: {
            text: String,
            actionItems: [String],
            generatedAt: Date,
        },
        emotions: [{
            userId: String,
            emotion: String,
            timestamp: Date,
        }],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Meeting', meetingSchema); 