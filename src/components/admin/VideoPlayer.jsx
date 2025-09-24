'use client';
import { useState } from 'react';

const VideoPlayer = ({ videoUrl, timestamp, incident }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Incident Recording</h2>
          <span className="text-sm text-gray-500">{timestamp}</span>
        </div>
      </div>
      <div className="p-6">
        <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden">
          <video
            src={videoUrl}
            controls
            className="w-full h-full object-cover"
          />
        </div>
        <div className="mt-6">
          <h3 className="text-md font-medium">Incident Details</h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-500 w-32">Time:</span>
              <span className="text-sm text-gray-900">{incident?.time}</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-500 w-32">Location:</span>
              <span className="text-sm text-gray-900">{incident?.location}</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-500 w-32">Confidence:</span>
              <div className="flex items-center">
                <div className="w-32 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-red-500 rounded-full"
                    style={{ width: `${incident?.confidence || 0}%` }}
                  />
                </div>
                <span className="ml-2 text-sm text-gray-900">{incident?.confidence}%</span>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-sm font-medium text-gray-500 w-32">Description:</span>
              <p className="text-sm text-gray-900">{incident?.description}</p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">
            Dismiss
          </button>
          <button className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600">
            Report Incident
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
