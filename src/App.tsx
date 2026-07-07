/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Layout } from './components/Layout';
import { CalendarDashboard } from './components/CalendarDashboard';
import { CampaignDetails } from './components/CampaignDetails';
import { AdminDashboard } from './components/AdminDashboard';
import { VendorManagement } from './components/VendorManagement';
import { MyPerformance } from './components/MyPerformance';
import { Login } from './components/Login';
import { SubmissionsDashboard } from './components/SubmissionsDashboard';
import VendorSkus from './components/VendorSkus';
import LiveSkus from './components/LiveSkus';
import type { Campaign } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'vendor' | null>(null);
  const [userName, setUserName] = useState('');
  const [loggedInVendorId, setLoggedInVendorId] = useState<string | null>(null);

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    if (tab !== 'calendar') {
      setSelectedCampaign(null);
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={(role, name, vendorId) => {
      setIsLoggedIn(true);
      setUserRole(role);
      setUserName(name || '');
      setLoggedInVendorId(vendorId || null);
      setSelectedCampaign(null);
      if (role === 'admin') {
        setActiveTab('admin');
      } else {
        setActiveTab('calendar');
      }
    }} />;
  }

  return (
    <Layout activeTab={activeTab} onNavigate={handleNavigate} onLogout={() => {
      setIsLoggedIn(false);
      setUserRole(null);
      setUserName('');
      setLoggedInVendorId(null);
      setSelectedCampaign(null);
      setActiveTab('calendar');
    }} userRole={userRole} userName={userName}>
      {activeTab === 'calendar' && !selectedCampaign && (
        <CalendarDashboard onSelectCampaign={setSelectedCampaign} userRole={userRole} />
      )}
      
      {activeTab === 'calendar' && selectedCampaign && (
        <CampaignDetails 
          campaign={selectedCampaign} 
          onBack={() => setSelectedCampaign(null)} 
          userRole={userRole}
          vendorId={loggedInVendorId}
          vendorName={userName}
        />
      )}

      {activeTab === 'submissions' && (
        <SubmissionsDashboard userRole={userRole} vendorId={loggedInVendorId} />
      )}

      {activeTab === 'admin' && (
        <AdminDashboard />
      )}

      {activeTab === 'vendor-management' && (
        <VendorManagement />
      )}

      {activeTab === 'performance' && (
        <MyPerformance vendorId={loggedInVendorId} />
      )}

      {activeTab === 'vendor-skus' && (
        <VendorSkus />
      )}

      {activeTab === 'live-skus' && (
        <LiveSkus vendorId={loggedInVendorId} />
      )}
    </Layout>
  );
}
