import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Settings, Save, CheckCircle } from 'lucide-react';
import api from '../../lib/api';

const FLAG_LABELS: Record<string, string> = {
  ai_underwriting_enabled: 'AI Underwriting Analysis',
  investor_marketplace_enabled: 'Investor Marketplace',
  email_intake_enabled: 'Email Document Intake',
  property_research_agent_enabled: 'Property Research Agent (Beta)',
  investor_matching_agent_enabled: 'Investor Matching Agent (Beta)',
};

export default function PlatformConfigPage() {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  // In a real impl, there'd be a GET /api/config endpoint
  // For local dev, we'll just show static flags from seed data
  useEffect(() => {
    setFlags({
      ai_underwriting_enabled: true,
      investor_marketplace_enabled: true,
      email_intake_enabled: true,
      property_research_agent_enabled: false,
      investor_matching_agent_enabled: false,
    });
  }, []);

  const handleSave = () => {
    // In production: PUT /api/config
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Configuration</h1>
        <p className="text-gray-500 text-sm mt-1">Manage feature flags and platform settings</p>
      </div>

      {/* Feature Flags */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4 text-indigo-600" /> Feature Flags
        </h2>
        <div className="space-y-4">
          {Object.entries(FLAG_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{key}</p>
              </div>
              <button
                onClick={() => setFlags(prev => ({ ...prev, [key]: !prev[key] }))}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${flags[key] ? 'bg-indigo-600' : 'bg-gray-200'}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${flags[key] ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* AI Config (display only) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">AI Configuration</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Default Model</span>
            <span className="font-mono text-gray-900 text-xs bg-gray-100 px-2 py-1 rounded">claude-sonnet-4-20250514</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Analysis Mode</span>
            <span className="text-gray-900">Event-driven (async)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Human Override</span>
            <span className="text-emerald-600 font-medium">Required for all decisions</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4">AI configuration is managed via environment variables and cannot be changed here.</p>
      </div>

      {/* Email Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Email Settings</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Intake Address</span>
            <span className="font-mono text-gray-900 text-xs bg-gray-100 px-2 py-1 rounded">intake@capitalflow.io</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">From Address</span>
            <span className="font-mono text-gray-900 text-xs bg-gray-100 px-2 py-1 rounded">noreply@capitalflow.io</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Save className="w-4 h-4" /> Save Changes
        </button>
        {saved && (
          <div className="flex items-center gap-1.5 text-sm text-emerald-600">
            <CheckCircle className="w-4 h-4" /> Saved successfully
          </div>
        )}
      </div>
    </div>
  );
}
