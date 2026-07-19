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
        <div style={{position:'fixed',inset:0,zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(15,23,42,0.55)',backdropFilter:'blur(3px)'}}>
          <style>{`.jumia-loader{--dim:5rem;background-color:#f97316;width:var(--dim);height:var(--dim);border-radius:50%;display:grid;place-items:center;animation:spin_412 5s infinite;box-shadow:0 0 40px rgba(249,115,22,0.4);} .jumia-loader svg{transform:translateY(-2px) scale(.7);} @keyframes spin_412{0%{transform:rotate(0) scale(1);}50%{transform:rotate(720deg) scale(1.3);}100%{transform:rotate(0) scale(1);}}`}</style>
          <div className="jumia-loader">
            <svg version="1.1" viewBox="0 0 47.94 47.94" xmlns="http://www.w3.org/2000/svg">
              <path style={{fill:'#fff'}} d="M26.285,2.486l5.407,10.956c0.376,0.762,1.103,1.29,1.944,1.412l12.091,1.757c2.118,0.308,2.963,2.91,1.431,4.403l-8.749,8.528c-0.608,0.593-0.886,1.448-0.742,2.285l2.065,12.042c0.362,2.109-1.852,3.717-3.746,2.722l-10.814-5.685c-0.752-0.395-1.651-0.395-2.403,0l-10.814,5.685c-1.894,0.996-4.108-0.613-3.746-2.722l2.065-12.042c0.144-0.837-0.134-1.692-0.742-2.285l-8.749-8.528c-1.532-1.494-0.687-4.096,1.431-4.403l12.091-1.757c0.841-0.122,1.568-0.65,1.944-1.412l5.407-10.956c0.947-1.919,3.683-1.919,4.63,0z"/>
            </svg>
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
