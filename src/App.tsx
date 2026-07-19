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

  const [globalLoading, setGlobalLoading] = useState(false);
  const pendingRef = useRef(0);
  useEffect(() => {
    const origFetch = window.fetch;
    window.fetch = async (...args) => {
      pendingRef.current += 1;
      setGlobalLoading(true);
      try { return await origFetch(...args); }
      finally { pendingRef.current -= 1; if (pendingRef.current === 0) setGlobalLoading(false); }
    };
    return () => { window.fetch = origFetch; };
  }, []);  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(() => { try { return sessionStorage.getItem('jdm_loggedIn') === '1'; } catch { return false; } });
  const [userRole, setUserRole] = useState<'admin' | 'vendor' | null>(() => { try { return (sessionStorage.getItem('jdm_role') as 'admin' | 'vendor' | null) || null; } catch { return null; } });
  const [userName, setUserName] = useState(() => { try { return sessionStorage.getItem('jdm_name') || ''; } catch { return ''; } });
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
      {globalLoading && (
        <div style={{position:'fixed',inset:0,zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(15,23,42,0.6)',backdropFilter:'blur(3px)'}}>
          <style>{`
            .dot-spinner{--uib-size:5rem;--uib-speed:.9s;--uib-color:#f97316;position:relative;display:flex;align-items:center;justify-content:flex-start;height:var(--uib-size);width:var(--uib-size)}
            .dot-spinner__dot{position:absolute;top:0;left:0;display:flex;align-items:center;justify-content:flex-start;height:100%;width:100%}
            .dot-spinner__dot::before{content:'';height:20%;width:20%;border-radius:50%;background-color:var(--uib-color);transform:scale(0);opacity:.5;animation:pulse0112 calc(var(--uib-speed)*1.111) ease-in-out infinite}
            .dot-spinner__dot:nth-child(2){transform:rotate(45deg)}.dot-spinner__dot:nth-child(2)::before{animation-delay:calc(var(--uib-speed)*-.875)}
            .dot-spinner__dot:nth-child(3){transform:rotate(90deg)}.dot-spinner__dot:nth-child(3)::before{animation-delay:calc(var(--uib-speed)*-.75)}
            .dot-spinner__dot:nth-child(4){transform:rotate(135deg)}.dot-spinner__dot:nth-child(4)::before{animation-delay:calc(var(--uib-speed)*-.625)}
            .dot-spinner__dot:nth-child(5){transform:rotate(180deg)}.dot-spinner__dot:nth-child(5)::before{animation-delay:calc(var(--uib-speed)*-.5)}
            .dot-spinner__dot:nth-child(6){transform:rotate(225deg)}.dot-spinner__dot:nth-child(6)::before{animation-delay:calc(var(--uib-speed)*-.375)}
            .dot-spinner__dot:nth-child(7){transform:rotate(270deg)}.dot-spinner__dot:nth-child(7)::before{animation-delay:calc(var(--uib-speed)*-.25)}
            .dot-spinner__dot:nth-child(8){transform:rotate(315deg)}.dot-spinner__dot:nth-child(8)::before{animation-delay:calc(var(--uib-speed)*-.125)}
            @keyframes pulse0112{0%,100%{transform:scale(0);opacity:.5}50%{transform:scale(1);opacity:1}}
          `}</style>
          <div className="dot-spinner">
            <div className="dot-spinner__dot"/><div className="dot-spinner__dot"/>
            <div className="dot-spinner__dot"/><div className="dot-spinner__dot"/>
            <div className="dot-spinner__dot"/><div className="dot-spinner__dot"/>
            <div className="dot-spinner__dot"/><div className="dot-spinner__dot"/>
          </div>
        </div>
      )}
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
