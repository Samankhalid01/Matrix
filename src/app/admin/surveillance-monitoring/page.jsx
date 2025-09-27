'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  AlertTriangle, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  Video,
  Activity,
  Bell,
  RefreshCw,
  Play,
  Pause,
  Download,
  Filter,
  Search,
  Calendar,
  BarChart3,
  Shield
} from 'lucide-react';

export default function SurveillanceTheftDetection() {
  // State management
  const [incidents, setIncidents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [serviceStatus, setServiceStatus] = useState('checking');
  const [stats, setStats] = useState({
    total: 0,
    flagged: 0,
    pending_review: 0,
    confirmed: 0
  });

  // Check Python service status
  const checkServiceStatus = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/health');
      const data = await response.json();
      
      setServiceStatus(data.model_loaded ? 'online' : 'model_missing');
      setStats(prev => ({
        ...prev,
        total: data.total_incidents || 0,
        flagged: data.flagged_incidents || 0,
        pending_review: data.pending_notifications || 0
      }));
    } catch (error) {
      setServiceStatus('offline');
      console.error('Service check failed:', error);
    }
  }, []);

  // Fetch surveillance incidents
  const fetchIncidents = useCallback(async (status = 'all') => {
    try {
      setLoading(true);
      const url = status !== 'all' 
        ? `http://localhost:5000/surveillance/incidents?status=${status}`
        : 'http://localhost:5000/surveillance/incidents';
        
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setIncidents(data.incidents || []);
        setStats({
          total: data.total || 0,
          flagged: data.flagged || 0,
          pending_review: data.pending_review || 0,
          confirmed: data.incidents?.filter(i => i.status === 'confirmed').length || 0
        });
      }
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/surveillance/notifications?unread=true');
      const data = await response.json();
      
      if (response.ok) {
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, []);

  // Handle incident review
  const handleReview = async (incidentId, verdict, notes = '') => {
    try {
      const response = await fetch(`http://localhost:5000/surveillance/incidents/${incidentId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verdict, notes }),
      });

      const data = await response.json();
      if (response.ok) {
        // Refresh incidents
        fetchIncidents(filterStatus);
        setSelectedIncident(null);
        alert(`Incident marked as ${verdict.replace('_', ' ')}`);
      }
    } catch (error) {
      console.error('Error reviewing incident:', error);
      alert('Error reviewing incident');
    }
  };

  // Trigger manual video scan
  const triggerVideoScan = async () => {
    try {
      const response = await fetch('http://localhost:5000/surveillance/scan', {
        method: 'POST'
      });
      
      if (response.ok) {
        setTimeout(() => {
          fetchIncidents(filterStatus);
          fetchNotifications();
        }, 5000); // Wait 5 seconds then refresh
      }
    } catch (error) {
      console.error('Error triggering scan:', error);
    }
  };

  // Initial load and periodic refresh
  useEffect(() => {
    checkServiceStatus();
    
    const interval = setInterval(() => {
      checkServiceStatus();
    }, 10000); // Check service status every 10 seconds

    return () => clearInterval(interval);
  }, [checkServiceStatus]);

  useEffect(() => {
    if (serviceStatus === 'online') {
      fetchIncidents();
      fetchNotifications();
      
      // Set up periodic refresh for incidents and notifications
      const interval = setInterval(() => {
        fetchIncidents(filterStatus);
        fetchNotifications();
      }, 15000); // Refresh every 15 seconds

      return () => clearInterval(interval);
    }
  }, [serviceStatus, fetchIncidents, fetchNotifications, filterStatus]);

  // Filter incidents
  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.video_file?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'flagged') return incident.flagged && matchesSearch;
    if (filterStatus === 'pending') return incident.status === 'pending_review' && matchesSearch;
    if (filterStatus === 'reviewed') return incident.admin_reviewed && matchesSearch;
    return incident.status === filterStatus && matchesSearch;
  });

  // Get risk level color
  const getRiskColor = (level) => {
    switch (level) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // Service status display
  const getServiceStatusDisplay = () => {
    switch (serviceStatus) {
      case 'online':
        return { color: 'bg-green-500', text: 'Service Online', icon: CheckCircle };
      case 'model_missing':
        return { color: 'bg-yellow-500', text: 'Model Missing', icon: AlertTriangle };
      case 'offline':
        return { color: 'bg-red-500', text: 'Service Offline', icon: XCircle };
      default:
        return { color: 'bg-gray-500', text: 'Checking...', icon: Clock };
    }
  };

  const statusInfo = getServiceStatusDisplay();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="w-8 h-8 text-blue-600" />
                Surveillance Monitoring
              </h1>
              <p className="text-gray-600 mt-2">Real-time theft detection and incident management</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  checkServiceStatus();
                  fetchIncidents(filterStatus);
                  fetchNotifications();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              
              <button
                onClick={triggerVideoScan}
                disabled={serviceStatus !== 'online'}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                <Video className="w-4 h-4" />
                Scan Videos
              </button>
              
              {/* Service Status */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm">
                <div className={`w-3 h-3 rounded-full ${statusInfo.color}`}></div>
                <span className="text-sm font-medium">{statusInfo.text}</span>
                <StatusIcon className="w-4 h-4" />
              </div>
              
              {notifications.length > 0 && (
                <div className="relative">
                  <Bell className="w-6 h-6 text-red-600" />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Service Status Alert */}
        {serviceStatus !== 'online' && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-yellow-800">Service Notice</h3>
                <p className="text-yellow-700">
                  {serviceStatus === 'offline' && 'Theft detection service is offline. Please start the Python Flask service.'}
                  {serviceStatus === 'model_missing' && 'AI model not found. Please place best_model.h5 in the models/ directory.'}
                  {serviceStatus === 'checking' && 'Checking service status...'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Incidents</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Flagged</p>
                <p className="text-2xl font-bold text-red-600">{stats.flagged}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending_review}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed Theft</p>
                <p className="text-2xl font-bold text-red-700">{stats.confirmed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-red-700" />
            </div>
          </div>
        </div>

        {/* Active Notifications Banner */}
        {notifications.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-800">🚨 Active Security Alerts</h3>
                <div className="mt-2 space-y-1">
                  {notifications.slice(0, 3).map(notification => (
                    <p key={notification.id || notification.notification_id} className="text-sm text-red-700">
                      • {notification.message} ({notification.risk_level} Risk)
                    </p>
                  ))}
                  {notifications.length > 3 && (
                    <p className="text-sm text-red-600 font-medium">
                      +{notifications.length - 3} more alerts
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by video filename..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              {['all', 'flagged', 'pending', 'reviewed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                    filterStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Incidents Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))
          ) : filteredIncidents.length > 0 ? (
            filteredIncidents.map((incident) => (
              <div key={incident.incident_id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Video className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-900 text-sm truncate">{incident.video_file}</span>
                    </div>
                    
                    {incident.flagged && (
                      <div className="flex items-center gap-1 bg-red-100 px-2 py-1 rounded-full">
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                        <span className="text-xs font-medium text-red-600">FLAGGED</span>
                      </div>
                    )}
                  </div>

                  {/* Risk Level */}
                  <div className="mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(incident.risk_level)}`}>
                      {incident.risk_level} Risk
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-600">Detections:</span>
                      <span className="ml-2 font-semibold text-gray-900">{incident.detection_count || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Confidence:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {Math.round(incident.confidence_avg || 0)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Duration:</span>
                      <span className="ml-2 font-semibold text-gray-900">{Math.round(incident.duration || 0)}s</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className={`ml-2 font-semibold text-xs uppercase ${
                        incident.status === 'confirmed' ? 'text-red-600' :
                        incident.status === 'false_alarm' ? 'text-green-600' :
                        incident.status === 'pending_review' ? 'text-yellow-600' :
                        'text-gray-600'
                      }`}>
                        {(incident.status || 'unknown').replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="text-xs text-gray-500 mb-4">
                    Detected: {formatTime(incident.detected_at)}
                    {incident.reviewed_at && (
                      <div>Reviewed: {formatTime(incident.reviewed_at)}</div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedIncident(incident)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Review
                    </button>
                    
                    {incident.status === 'pending_review' && (
                      <>
                        <button
                          onClick={() => handleReview(incident.incident_id, 'confirmed_theft')}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleReview(incident.incident_id, 'false_alarm')}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                          Dismiss
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No incidents found</h3>
              <p className="text-gray-600 mb-4">
                {serviceStatus !== 'online' 
                  ? 'Start the detection service to begin monitoring.'
                  : 'No surveillance incidents match your current filters.'}
              </p>
              {serviceStatus === 'online' && (
                <button
                  onClick={triggerVideoScan}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Scan for Videos
                </button>
              )}
            </div>
          )}
        </div>

        {/* Video Review Modal */}
        {selectedIncident && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Incident Review</h2>
                  <button
                    onClick={() => setSelectedIncident(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {/* Video Player */}
                <div className="bg-gray-900 rounded-lg mb-6 h-64 flex items-center justify-center">
                  <div className="w-full h-full">
                    <video 
                      controls 
                      className="w-full h-full object-contain"
                      poster="/api/placeholder/400/240"
                      onError={(e) => {
                        console.error('Video loading error:', e);
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    >
                      <source 
                        src={`http://localhost:5000/surveillance/video/${selectedIncident.incident_id}`} 
                        type="video/mp4" 
                      />
                      <source 
                        src={`http://localhost:5000/videos/${selectedIncident.video_file}`} 
                        type="video/mp4" 
                      />
                      Your browser does not support the video tag.
                    </video>
                    
                    {/* Fallback display if video fails to load */}
                    <div className="text-center text-white h-full items-center justify-center" style={{ display: 'none' }}>
                      <Video className="w-16 h-16 mx-auto mb-4" />
                      <p className="text-lg font-medium">{selectedIncident.video_file}</p>
                      <p className="text-sm text-gray-300 mt-2">
                        {selectedIncident.detection_count} suspicious activities detected
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Video URL: http://localhost:5000/surveillance/video/{selectedIncident.incident_id}
                      </p>
                      <a 
                        href={`http://localhost:5000/surveillance/video/${selectedIncident.incident_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Open Video in New Tab
                      </a>
                    </div>
                  </div>
                </div>

                {/* Incident Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Detection Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Risk Level:</span>
                        <span className={`font-semibold ${
                          selectedIncident.risk_level === 'High' ? 'text-red-600' :
                          selectedIncident.risk_level === 'Medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {selectedIncident.risk_level}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Confidence:</span>
                        <span className="font-semibold">{Math.round(selectedIncident.confidence_avg || 0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Detections:</span>
                        <span className="font-semibold">{selectedIncident.detection_count || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-semibold">{Math.round(selectedIncident.duration || 0)}s</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Status</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Status:</span>
                        <span className="font-semibold capitalize">{(selectedIncident.status || 'unknown').replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Detected:</span>
                        <span className="font-semibold">{formatTime(selectedIncident.detected_at)}</span>
                      </div>
                      {selectedIncident.admin_reviewed && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Verdict:</span>
                            <span className="font-semibold">{selectedIncident.admin_verdict?.replace('_', ' ')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Reviewed:</span>
                            <span className="font-semibold">{formatTime(selectedIncident.reviewed_at)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Detections List */}
                {selectedIncident.detections && selectedIncident.detections.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Detection Timeline</h3>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {selectedIncident.detections.map((detection, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">
                            Frame {detection.frame} ({Math.round(detection.timestamp)}s)
                          </span>
                          <span className="text-sm font-semibold">
                            {Math.round((detection.confidence || 0) * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Review Actions */}
                {selectedIncident.status === 'pending_review' && (
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Admin Review</h3>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleReview(selectedIncident.incident_id, 'confirmed_theft')}
                        className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Confirm Theft
                      </button>
                      <button
                        onClick={() => handleReview(selectedIncident.incident_id, 'false_alarm')}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <XCircle className="w-5 h-5" />
                        Mark as False Alarm
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}