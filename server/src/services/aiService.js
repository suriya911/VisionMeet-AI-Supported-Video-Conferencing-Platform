const { TranscribeStreamingClient, StartStreamTranscriptionCommand } = require('@aws-sdk/client-transcribe');
const { OpenAI } = require('openai');
const axios = require('axios');

class AIService {
    constructor() {
        this.transcribeClient = new TranscribeStreamingClient({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });

        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async startTranscription(meetingId, audioStream) {
        try {
            const command = new StartStreamTranscriptionCommand({
                LanguageCode: 'en-US',
                MediaEncoding: 'pcm',
                MediaSampleRateHertz: 16000,
                AudioStream: audioStream,
            });

            const response = await this.transcribeClient.send(command);
            return response;
        } catch (error) {
            console.error('Error starting transcription:', error);
            throw error;
        }
    }

    async generateSummary(transcription) {
        try {
            const prompt = `Please provide a concise summary of the following meeting transcript and list any action items:\n\n${transcription}`;

            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that summarizes meetings and extracts action items.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: 500,
            });

            return {
                text: response.choices[0].message.content,
                actionItems: this.extractActionItems(response.choices[0].message.content),
            };
        } catch (error) {
            console.error('Error generating summary:', error);
            throw error;
        }
    }

    async detectEmotion(imageData) {
        try {
            const response = await axios.post(
                `${process.env.AZURE_EMOTION_ENDPOINT}/face/v1.0/detect`,
                imageData,
                {
                    headers: {
                        'Content-Type': 'application/octet-stream',
                        'Ocp-Apim-Subscription-Key': process.env.AZURE_EMOTION_KEY,
                    },
                    params: {
                        returnFaceAttributes: 'emotion',
                    },
                }
            );

            if (response.data && response.data.length > 0) {
                const emotions = response.data[0].faceAttributes.emotion;
                return this.getDominantEmotion(emotions);
            }

            return null;
        } catch (error) {
            console.error('Error detecting emotion:', error);
            throw error;
        }
    }

    extractActionItems(summary) {
        const actionItems = [];
        const lines = summary.split('\n');

        for (const line of lines) {
            if (
                line.toLowerCase().includes('action item') ||
                line.toLowerCase().includes('todo') ||
                line.toLowerCase().includes('task') ||
                line.startsWith('- [ ]') ||
                line.startsWith('- [x]')
            ) {
                actionItems.push(line.trim());
            }
        }

        return actionItems;
    }

    getDominantEmotion(emotions) {
        let maxEmotion = null;
        let maxValue = -1;

        for (const [emotion, value] of Object.entries(emotions)) {
            if (value > maxValue) {
                maxValue = value;
                maxEmotion = emotion;
            }
        }

        return maxEmotion;
    }
}

module.exports = new AIService(); 