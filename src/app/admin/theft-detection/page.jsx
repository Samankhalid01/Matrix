'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Upload, 
  Play, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Activity,
  Download,
  Eye,
  BarChart3,
  Shield
} from 'lucide-react';

export default function TheftDetectionPage() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState(null);
  const [results, setResults] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [serviceStatus, setServiceStatus] = useState(null);

  const fileInputRef = useRef(null);
  const pollInterval = useRef(null);

  // Check service status on component mount
  useEffect(() => {
    checkServiceStatus();
  }, []);

  const checkServiceStatus = async () => {
    try {
      const response = await fetch('/api/theft-detection');
      const data = await response.json();
      setServiceStatus(data.service_status);
    } catch (error) {
      console.error('Service status error:', error);
      setServiceStatus({ status: 'offline' });
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('video/')) {
        setFile(droppedFile);
      } else {
        alert('Please upload a video file');
      }
    }
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type.startsWith('video/')) {
        setFile(selectedFile);
      } else {
        alert('Please upload a video file');
      }
    }
  };

  const uploadVideo = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('video', file);

    try {
      setUploadProgress(10);
      const response = await fetch('/api/theft-detection', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(100);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setJobId(data.job_id);
      setStatus({ status: 'uploaded', progress: 0 });
      startPolling(data.job_id);

    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message}`);
      setUploadProgress(0);
    }
  };

  const startPolling = (id) => {
    setIsPolling(true);
    pollInterval.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/theft-detection/status/${id}`);
        const statusData = await response.json();
        
        setStatus(statusData);

        if (statusData.status === 'completed') {
          clearInterval(pollInterval.current);
          setIsPolling(false);
          fetchResults(id);
        } else if (statusData.status === 'error') {
          clearInterval(pollInterval.current);
          setIsPolling(false);
          alert(`Processing error: ${statusData.error}`);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 2000);
  };

  const fetchResults = async (id) => {
    try {
      const response = await fetch(`/api/theft-detection/results/${id}`);
      const resultsData = await response.json();
      
      if (response.ok) {
        setResults(resultsData);
      } else {
        console.error('Results fetch error:', resultsData.error);
      }
    } catch (error) {
      console.error('Results fetch error:', error);
    }
  };

  const processDemo = async () => {
    try {
      const response = await fetch('/api/theft-detection/demo', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Demo processing failed');
      }

      setJobId(data.job_id);
      setStatus({ status: 'processing', progress: 0 });
      startPolling(data.job_id);

    } catch (error) {
      console.error('Demo processing error:', error);
      alert(`Demo processing failed: ${error.message}`);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'High': return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const downloadReport = () => {
    if (!results) return;

    const report = {
      analysis_date: new Date().toISOString(),
      file_name: file?.name || 'demo_video',
      ...results
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theft_detection_report_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="h-8 w-8 text-blue-600" />
                Theft Detection System
              </h1>
              <p className="text-gray-600 mt-2">
                AI-powered video analysis for retail theft detection
              </p>
            </div>
            
            {/* Service Status */}
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${
                serviceStatus?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-sm text-gray-600">
                Service: {serviceStatus?.status === 'healthy' ? 'Online' : 'Offline'}
              </span>
              {serviceStatus?.model_loaded && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Model Loaded
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* File Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              Upload Video
            </h2>
            
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <Play className="h-12 w-12 text-green-600" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={uploadVideo}
                      disabled={isPolling}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Process Video
                    </button>
                    <button
                      onClick={() => setFile(null)}
                      className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <Upload className="h-12 w-12 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-lg text-gray-600">Drop your video here</p>
                    <p className="text-sm text-gray-500">or click to browse</p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
                  >
                    Select File
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-4">
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">Uploading... {uploadProgress}%</p>
              </div>
            )}
          </div>

          {/* Quick Demo */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Play className="h-5 w-5 text-green-600" />
              Quick Demo
            </h2>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                Test the system with our pre-loaded demo video to see how theft detection works.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Demo Video Features:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Retail store surveillance footage</li>
                  <li>• Multiple detection scenarios</li>
                  <li>• Real-time analysis demo</li>
                </ul>
              </div>
              
              <button
                onClick={processDemo}
                disabled={isPolling}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Play className="h-4 w-4" />
                Run Demo Analysis
              </button>
            </div>
          </div>
        </div>

        {/* Processing Status */}
        {status && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Processing Status
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {status.status === 'processing' && (
                  <>
                    <Clock className="h-5 w-5 text-blue-600 animate-spin" />
                    <span className="text-blue-600 font-medium">Processing...</span>
                  </>
                )}
                {status.status === 'completed' && (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-600 font-medium">Completed</span>
                  </>
                )}
                {status.status === 'error' && (
                  <>
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="text-red-600 font-medium">Error</span>
                  </>
                )}
              </div>
              
              {status.progress !== undefined && (
                <div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${status.progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Progress: {status.progress.toFixed(1)}%</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${getRiskColor(results.risk_level)}`}>
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Risk Level</p>
                    <p className="text-2xl font-bold text-gray-900">{results.risk_level}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <Eye className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Detections</p>
                    <p className="text-2xl font-bold text-gray-900">{results.detection_count}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Confidence</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(results.confidence_avg * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Frames</p>
                    <p className="text-2xl font-bold text-gray-900">{results.total_frames.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Detection Timeline</h2>
                <button
                  onClick={downloadReport}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Report
                </button>
              </div>
              
              {results.detections && results.detections.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Frame</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Timestamp</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Confidence</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Bounding Box</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.detections.slice(0, 10).map((detection, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">{detection.frame}</td>
                          <td className="py-3 px-4">{detection.timestamp.toFixed(2)}s</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              detection.confidence > 0.8 ? 'bg-red-100 text-red-800' :
                              detection.confidence > 0.6 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {(detection.confidence * 100).toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-gray-600">
                            [{detection.bbox.map(coord => coord.toFixed(0)).join(', ')}]
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {results.detections.length > 10 && (
                    <div className="text-center py-4 text-gray-600">
                      Showing 10 of {results.detections.length} detections
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p className="text-lg font-medium">No Theft Detected</p>
                  <p>The video analysis completed successfully with no suspicious activity detected.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}