/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
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
  const [activeTab, setActiveTab] = useState(() => { try { return sessionStorage.getItem('jdm_tab') || 'calendar'; } catch { return 'calendar'; } });

  const pendingRef = useRef(0);
  const [isLoggedIn, setIsLoggedIn] = useState(() => { try { return sessionStorage.getItem('jdm_loggedIn') === '1'; } catch { return false; } });
  const [userRole, setUserRole] = useState<'admin' | 'vendor' | null>(() => { try { return (sessionStorage.getItem('jdm_role') as 'admin' | 'vendor' | null) || null; } catch { return null; } });
  const [userName, setUserName] = useState(() => { try { return sessionStorage.getItem('jdm_name') || ''; } catch { return ''; } });
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [loggedInVendorId, setLoggedInVendorId] = useState<string | null>(() => { try { return sessionStorage.getItem('jdm_vid') || null; } catch { return null; } });

  const handleNavigate = (tab: string) => {
    setActiveTab(tab); try { sessionStorage.setItem('jdm_tab', tab); } catch {}
    if (tab !== 'calendar') {
      setSelectedCampaign(null);
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={(role, name, vendorId) => {
      setIsLoggedIn(true);
      setUserRole(role);
      setUserName(name || '');
      sessionStorage.setItem('jdm_loggedIn','1'); sessionStorage.setItem('jdm_role',role); sessionStorage.setItem('jdm_name',name); if(vendorId) sessionStorage.setItem('jdm_vid',vendorId); setLoggedInVendorId(vendorId || null);
      setSelectedCampaign(null);
      if (role === 'admin') {
        setActiveTab('admin');
      } else {
        setActiveTab('calendar');
      }
    }} />;
  }

  return (<>
    <Layout activeTab={activeTab} onNavigate={handleNavigate} onLogout={() => {
      sessionStorage.removeItem('jdm_loggedIn'); sessionStorage.removeItem('jdm_role'); sessionStorage.removeItem('jdm_name'); sessionStorage.removeItem('jdm_vid'); sessionStorage.removeItem('jdm_tab'); setIsLoggedIn(false);
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
  </>)
}
