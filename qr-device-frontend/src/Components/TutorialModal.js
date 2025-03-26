import React from 'react';
import './TutorialModal.css';

function TutorialModal({ videoUrl, isOpen, onClose }) {
    if (!isOpen) return null;

    // Extract video ID from YouTube URL
    const getYouTubeVideoId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const videoId = getYouTubeVideoId(videoUrl);

    return (
        <div className="tutorial-modal-overlay" onClick={onClose}>
            <div className="tutorial-modal-content" onClick={e => e.stopPropagation()}>
                <button className="tutorial-modal-close" onClick={onClose}>&times;</button>
                <div className="tutorial-modal-video-container">
                    {videoId && (
                        <iframe
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title="Machine Tutorial"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default TutorialModal;