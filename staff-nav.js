// Shared "switch view" nav widget for the Key Rebate customer/admin pages.
// Never a security boundary by itself — each destination page enforces its
// own real auth. This only decides whether to show a convenience link.
(function(){
  const SUPABASE_URL = "https://hzagwndglwhcepsirafi.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_5rAinfDT1K9kwEQnqYwlOA_-C5tk_6h";

  function linkHtml(label, href){
    return `<a class="staff-nav-link" href="${href}">${label} →</a>`;
  }

  window.DFLStaffNav = {
    // Tracker (admin) already knows the viewer is staff by the time it calls this.
    renderToCustomerLink(el, href){
      el.innerHTML = linkHtml('View Customer Portal', href);
    },

    // Customer page: only render a "Staff View" link if the browser also holds
    // a Microsoft session (shared via localStorage on the same origin) AND
    // that account is on the staff allow-list. Silently does nothing otherwise.
    async renderToStaffLinkIfEligible(sbClient, el, href){
      try{
        const { data: { session } } = await sbClient.auth.getSession();
        if(!session) return;
        const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/key_rebate_is_staff`, {
          method:'POST',
          headers:{ 'Content-Type':'application/json', 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${session.access_token}` },
          body: '{}'
        });
        if(!res.ok) return;
        const isStaff = await res.json();
        if(isStaff === true){
          el.innerHTML = linkHtml('Staff View', href);
        }
      }catch(e){
        console.error('Staff nav eligibility check failed:', e);
      }
    }
  };
})();
