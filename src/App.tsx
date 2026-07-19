/**
 * @lic{globalLoading && (
        <div style={{position:'fixed',inset:0,zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(15,23,42,0.55)',backdropFilter:'blur(3px)'}}>
          <style>{`.jumia-loader{--dim:5rem;background-color:#f97316;width:var(--dim);height:var(--dim);border-radius:50%;display:grid;place-items:center;animation:spin_412 5s infinite;box-shadow:0 0 40px rgba(249,115,22,0.4);} .jumia-loader svg{transform:translateY(-2px) scale(.7);} @keyframes spin_412{0%{transform:rotate(0) scale(1);}50%{transform:rotate(720deg) scale(1.3);}100%{transform:rotate(0) scale(1);}}`}</style>
          <div className="jumia-loader">
            <svg version="1.1" viewBox="0 0 47.94 47.94" xmlns="http://www.w3.org/2000/svg">
              <path style={{fill:'#fff'}} d="M26.285,2.486l5.407,10.956c0.376,0.762,1.103,1.29,1.944,1.412l12.091,1.757c2.118,0.308,2.963,2.91,1.431,4.403l-8.749,8.528c-0.608,0.593-0.886,1.448-0.742,2.285l2.065,12.042c0.362,2.109-1.852,3.717-3.746,2.722l-10.814-5.685c-0.752-0.395-1.651-0.395-2.403,0l-10.814,5.685c-1.894,0.996-4.108-0.613-3.746-2.722l2.065-12.042c0.144-0.837-0.134-1.692-0.742-2.285l-8.749-8.528c-1.532-1.494-0.687-4.096,1.431-4.403l12.091-1.757c0.841-0.122,1.568-0.65,1.944-1.412l5.407-10.956c0.947-1.919,3.683-1.919,4.63,0z"/>
            </svg>
          </div>
        </div>
        )}
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
