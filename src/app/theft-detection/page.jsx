'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import VideoPlayer from '@/components/admin/VideoPlayer';

const TheftDetectionPage = () => {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [filter, setFilter] = useState('all');

  const mockIncidents = [
    {
      id: 1,
      time: '2023-09-10 14:30',
      location: 'Aisle 3',
      confidence: 85,
      status: 'pending',
      description: 'Suspicious behavior detected near electronics section',
      videoUrl: '/video/incident-1'
    },
    // Add more mock incidents as needed
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Theft Detection</h2>
          <select
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Incidents</option>
            <option value="pending">Pending Review</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Incident List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Recent Incidents</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {mockIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedIncident?.id === incident.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedIncident(incident)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{incident.time}</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        incident.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        incident.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {incident.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{incident.description}</p>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span className="mr-4">📍 {incident.location}</span>
                      <span>🎯 {incident.confidence}% confidence</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Video Player and Details */}
          <div className="lg:col-span-2">
            {selectedIncident ? (
              <VideoPlayer
                videoUrl={selectedIncident.videoUrl}
                timestamp={selectedIncident.time}
                incident={selectedIncident}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center h-full">
                <p className="text-gray-500">Select an incident to view details</p>
              </div>
            )}
          </div>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Incident Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Incidents</span>
                <span className="text-sm font-medium">24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pending Review</span>
                <span className="text-sm font-medium text-yellow-500">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">False Positives</span>
                <span className="text-sm font-medium text-green-500">4</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">High Risk Areas</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Electronics Section</span>
                <span className="text-sm font-medium text-red-500">12 incidents</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Clothing Area</span>
                <span className="text-sm font-medium text-yellow-500">8 incidents</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Checkout Area</span>
                <span className="text-sm font-medium text-green-500">4 incidents</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Detection Accuracy</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Overall Accuracy</span>
                <div className="flex items-center">
                  <div className="w-32 h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-green-500 rounded-full" style={{ width: '85%' }} />
                  </div>
                  <span className="ml-2 text-sm font-medium">85%</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">False Positives Rate</span>
                <span className="text-sm font-medium text-yellow-500">12%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Detection Speed</span>
                <span className="text-sm font-medium">1.2s avg</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TheftDetectionPage;
