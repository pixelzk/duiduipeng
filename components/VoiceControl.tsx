import React, { useState, useRef, useEffect } from 'react';

interface VoiceControlProps {
  onAudioRecorded: (blob: Blob) => void;
  isProcessing: boolean;
  disabled: boolean;
}

export const VoiceControl: React.FC<VoiceControlProps> = ({ onAudioRecorded, isProcessing, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onAudioRecorded(blob);
        stream.getTracks().forEach(track => track.stop()); // Stop mic usage
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("无法访问麦克风，请检查权限设置。");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (disabled || isProcessing) return;
    
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center z-20 mt-4 md:mt-0">
       {/* Pagoda visual representation (simplified with CSS/Image) */}
       <div className="w-32 h-48 md:w-40 md:h-64 bg-contain bg-center bg-no-repeat mb-4 drop-shadow-xl opacity-90"
            style={{ backgroundImage: 'url("https://picsum.photos/160/256")' }}> 
            {/* Using a placeholder, but ideally this is the pagoda asset */}
       </div>

      <div className="relative">
        {/* Ripple Effect when recording */}
        {isRecording && (
          <div className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-75"></div>
        )}

        <button
          onClick={toggleRecording}
          disabled={disabled || isProcessing}
          className={`
            relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center
            border-4 shadow-xl transition-all duration-300
            ${isRecording 
              ? 'bg-amber-500 border-amber-200 text-white scale-110' 
              : 'bg-gradient-to-b from-amber-100 to-amber-300 border-amber-50 text-amber-800 hover:scale-105'}
            ${isProcessing ? 'animate-pulse cursor-wait' : ''}
            ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : ''}
          `}
        >
          {isProcessing ? (
             <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
          ) : (
            <svg className="w-10 h-10 md:w-12 md:h-12" fill="currentColor" viewBox="0 0 24 24">
               {/* Mic Icon */}
               <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
               <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          )}
        </button>
      </div>
      
      <div className="mt-3 text-center">
         <p className="text-white font-bold text-shadow-sm text-lg md:text-xl drop-shadow-md">
             {isRecording ? "聆听中..." : isProcessing ? "AI匹配中..." : "点击麦克风"}
         </p>
         <p className="text-cyan-100 text-sm opacity-90">开启AI语音</p>
      </div>
    </div>
  );
};