import { useEffect, useMemo, useRef, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import EvaluationResult from './EvaluationResult';

const MIME_CANDIDATES = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
const ACCEPTED_UPLOAD_TYPES = ['video/mp4', 'video/webm'];

function pickSupportedMimeType() {
    if (typeof window === 'undefined' || !window.MediaRecorder?.isTypeSupported) {
        return '';
    }

    return MIME_CANDIDATES.find((type) => window.MediaRecorder.isTypeSupported(type)) ?? '';
}

function formatDuration(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60)
        .toString()
        .padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');

    return `${minutes}:${seconds}`;
}

function isAcceptedUpload(file) {
    if (!file) {
        return false;
    }

    if (ACCEPTED_UPLOAD_TYPES.includes(file.type)) {
        return true;
    }

    const lowerName = file.name.toLowerCase();
    return lowerName.endsWith('.mp4') || lowerName.endsWith('.webm');
}

function MediaInputArea() {
    const livePreviewRef = useRef(null);
    const fileInputRef = useRef(null);
    const streamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    const [activeTab, setActiveTab] = useState('record');
    const [hasStream, setHasStream] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(0);

    const [recordedBlob, setRecordedBlob] = useState(null);
    const [recordedPreviewUrl, setRecordedPreviewUrl] = useState('');

    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState('');
    const [isDragActive, setIsDragActive] = useState(false);

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [evaluationResult, setEvaluationResult] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isRecording) {
            return undefined;
        }

        const timerId = window.setInterval(() => {
            setTimerSeconds((current) => current + 1);
        }, 1000);

        return () => {
            window.clearInterval(timerId);
        };
    }, [isRecording]);

    useEffect(() => {
        if (activeTab === 'record' && livePreviewRef.current && streamRef.current && !recordedPreviewUrl) {
            livePreviewRef.current.srcObject = streamRef.current;
        }
    }, [activeTab, recordedPreviewUrl]);

    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }

            if (recordedPreviewUrl) {
                URL.revokeObjectURL(recordedPreviewUrl);
            }

            if (uploadedPreviewUrl) {
                URL.revokeObjectURL(uploadedPreviewUrl);
            }
        };
    }, [recordedPreviewUrl, uploadedPreviewUrl]);

    const currentVideoSource = useMemo(() => {
        if (activeTab === 'upload') {
            return uploadedFile ? { kind: 'upload', file: uploadedFile } : null;
        }

        return recordedBlob ? { kind: 'record', blob: recordedBlob } : null;
    }, [activeTab, uploadedFile, recordedBlob]);

    const ensureMediaStream = async () => {
        if (streamRef.current) {
            return streamRef.current;
        }

        if (!navigator.mediaDevices?.getUserMedia) {
            throw new Error('Your browser does not support camera capture.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        setHasStream(true);

        if (livePreviewRef.current) {
            livePreviewRef.current.srcObject = stream;
        }

        return stream;
    };

    const startRecording = async () => {
        setError('');
        setEvaluationResult(null);

        try {
            const stream = await ensureMediaStream();

            setRecordedPreviewUrl((previousUrl) => {
                if (previousUrl) {
                    URL.revokeObjectURL(previousUrl);
                }

                return '';
            });

            setRecordedBlob(null);
            chunksRef.current = [];

            const mimeType = pickSupportedMimeType();
            const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'video/webm' });
                const previewUrl = URL.createObjectURL(blob);

                setRecordedBlob(blob);
                setRecordedPreviewUrl(previewUrl);
                setIsRecording(false);
            };

            recorder.onerror = () => {
                setError('Recording was interrupted. Please try again.');
                setIsRecording(false);
            };

            recorder.start(200);
            setTimerSeconds(0);
            setIsRecording(true);
        } catch (recordingError) {
            setError(recordingError.message ?? 'Unable to access camera and microphone.');
            setHasStream(false);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    };

    const retakeRecording = () => {
        setError('');
        setEvaluationResult(null);
        setRecordedBlob(null);

        setRecordedPreviewUrl((previousUrl) => {
            if (previousUrl) {
                URL.revokeObjectURL(previousUrl);
            }

            return '';
        });

        if (livePreviewRef.current && streamRef.current) {
            livePreviewRef.current.srcObject = streamRef.current;
        }
    };

    const onPickUpload = (file) => {
        if (!file) {
            return;
        }

        if (!isAcceptedUpload(file)) {
            setError('Invalid file type. Please upload MP4 or WEBM.');
            return;
        }

        setError('');
        setEvaluationResult(null);
        setUploadedFile(file);

        setUploadedPreviewUrl((previousUrl) => {
            if (previousUrl) {
                URL.revokeObjectURL(previousUrl);
            }

            return URL.createObjectURL(file);
        });
    };

    const onUploadInputChange = (event) => {
        const file = event.target.files?.[0];
        onPickUpload(file);
    };

    const onDrop = (event) => {
        event.preventDefault();
        setIsDragActive(false);
        const file = event.dataTransfer.files?.[0];
        onPickUpload(file);
    };

    const analyzePresentation = async () => {
        if (!currentVideoSource || isRecording || isAnalyzing) {
            return;
        }

        setIsAnalyzing(true);
        setError('');

        try {
            let fileToAnalyze;

            if (currentVideoSource.kind === 'upload') {
                fileToAnalyze = currentVideoSource.file;
            } else {
                const blob = currentVideoSource.blob;
                const extension = blob.type.includes('mp4') ? 'mp4' : 'webm';
                fileToAnalyze = new File([blob], `video.${extension}`, {
                    type: blob.type || `video/${extension}`,
                });
            }

            const formData = new FormData();
            formData.append('video', fileToAnalyze);

            const response = await axiosInstance.post('/evaluate', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setEvaluationResult(response.data?.data ?? response.data ?? null);
        } catch (requestError) {
            const apiMessage = requestError.response?.data?.message;
            const apiDetails = requestError.response?.data?.details;
            const detailText = apiDetails ? ` ${apiDetails}` : '';
            setError((apiMessage ?? 'Failed to analyze this video.') + detailText);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <section className="space-y-5">
            <article className="surface-card p-5 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Media Input</p>
                        <h2 className="mt-2 text-2xl font-display font-bold text-slate-900">Record or Upload Presentation</h2>
                        <p className="mt-1 text-sm text-slate-500">Capture camera video or upload an existing file before AI analysis.</p>
                    </div>

                    <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                        <button
                            type="button"
                            onClick={() => setActiveTab('record')}
                            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${activeTab === 'record' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Record Camera
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('upload')}
                            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${activeTab === 'upload' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Upload Video
                        </button>
                    </div>
                </div>

                {activeTab === 'record' ? (
                    <div className="mt-5 space-y-4">
                        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                            {recordedPreviewUrl && !isRecording ? (
                                <video src={recordedPreviewUrl} controls className="aspect-video w-full object-cover" />
                            ) : (
                                <video ref={livePreviewRef} autoPlay muted playsInline className="aspect-video w-full object-cover" />
                            )}

                            {!hasStream && !recordedPreviewUrl ? (
                                <div className="absolute inset-0 grid place-items-center bg-slate-100/90">
                                    <p className="max-w-sm px-4 text-center text-sm text-slate-500">
                                        Camera and microphone permission are required. Click Start Recording to begin.
                                    </p>
                                </div>
                            ) : null}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="text-sm text-slate-600">
                                {isRecording ? (
                                    <span className="inline-flex items-center gap-2 font-medium text-rose-600">
                                        <span className="relative flex h-2.5 w-2.5">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />
                                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
                                        </span>
                                        Recording {formatDuration(timerSeconds)}
                                    </span>
                                ) : recordedBlob ? (
                                    'Recording ready'
                                ) : (
                                    'Ready to record'
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {!isRecording && !recordedBlob ? (
                                    <button
                                        type="button"
                                        onClick={startRecording}
                                        className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                                    >
                                        Start Recording
                                    </button>
                                ) : null}

                                {isRecording ? (
                                    <button
                                        type="button"
                                        onClick={stopRecording}
                                        className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                                    >
                                        Stop Recording
                                    </button>
                                ) : null}

                                {!isRecording && recordedBlob ? (
                                    <button
                                        type="button"
                                        onClick={retakeRecording}
                                        className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                                    >
                                        Retake
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mt-5 space-y-4">
                        <div
                            onDragOver={(event) => {
                                event.preventDefault();
                                setIsDragActive(true);
                            }}
                            onDragLeave={() => setIsDragActive(false)}
                            onDrop={onDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${isDragActive ? 'border-indigo-400 bg-indigo-50' : 'border-slate-300 bg-slate-50'
                                }`}
                        >
                            <p className="text-sm font-medium text-slate-700">Drag and drop your video here</p>
                            <p className="mt-1 text-sm text-slate-500">or click to browse MP4/WEBM files</p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="video/mp4,video/webm"
                                onChange={onUploadInputChange}
                                className="hidden"
                            />
                        </div>

                        {uploadedFile ? (
                            <p className="text-sm text-slate-600">
                                Selected file: <span className="font-medium text-slate-800">{uploadedFile.name}</span>
                            </p>
                        ) : null}

                        {uploadedPreviewUrl ? (
                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                                <video src={uploadedPreviewUrl} controls className="aspect-video w-full object-cover" />
                            </div>
                        ) : null}
                    </div>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={analyzePresentation}
                        disabled={!currentVideoSource || isRecording || isAnalyzing}
                        className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                    >
                        Analyze Presentation
                    </button>

                    {isAnalyzing ? (
                        <div className="inline-flex items-center gap-2 text-sm text-slate-600">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
                            Analyzing metrics...
                        </div>
                    ) : null}
                </div>

                {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
            </article>

            <EvaluationResult result={evaluationResult} />
        </section>
    );
}

export default MediaInputArea;
