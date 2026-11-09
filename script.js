(function(){
  var nav=document.getElementById('nav'),b=document.getElementById('burger'),links=document.getElementById('nav-links');
  if(nav&&b){
    function set(o){nav.classList.toggle('open',o);b.setAttribute('aria-expanded',o?'true':'false');b.setAttribute('aria-label',o?'Close menu':'Open menu');}
    b.addEventListener('click',function(){set(!nav.classList.contains('open'));});
    links.addEventListener('click',function(e){if(e.target.closest('a'))set(false);});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')set(false);});
    document.addEventListener('click',function(e){if(nav.classList.contains('open')&&!nav.contains(e.target))set(false);});
    window.addEventListener('resize',function(){if(window.innerWidth>1080)set(false);});
  }
  // FAQ: one open at a time
  var items=[].slice.call(document.querySelectorAll('.faq-item'));
  items.forEach(function(d){d.addEventListener('toggle',function(){if(d.open)items.forEach(function(o){if(o!==d)o.open=false;});});});
  // active nav link
  var map={};[].slice.call(document.querySelectorAll('.nav-links a[href^="#"]:not(.btn)')).forEach(function(a){map[a.getAttribute('href').slice(1)]=a;});
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting&&map[en.target.id]){for(var k in map)map[k].classList.remove('active');map[en.target.id].classList.add('active');}});},{rootMargin:'-45% 0px -50% 0px'});
    Object.keys(map).forEach(function(id){var s=document.getElementById(id);if(s)io.observe(s);});
    var rv=[].slice.call(document.querySelectorAll('.card,.step,.faq-item,.split-art,.split-copy,.band'));
    var io2=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io2.unobserve(en.target);}});},{rootMargin:'0px 0px -8% 0px'});
    rv.forEach(function(el){if(el.getBoundingClientRect().top>window.innerHeight){el.classList.add('rv');io2.observe(el);}});
  }
})();
(function(){
  var form=document.getElementById('pilot-form'); if(!form) return;
  var msg=document.getElementById('form-msg');
  var TO='Aurasyncmedical@gmail.com';
  var FS='https://formsubmit.co/ajax/aurasyncmedical@gmail.com';
  function val(n){return (form.elements[n].value||'').trim();}
  function mailto(d){
    var body='Name: '+d.name+'\nFacility: '+d.facility+'\nRole: '+d.role+'\nEmail: '+d.email+'\nPhone: '+d.phone;
    return 'mailto:'+TO+'?subject='+encodeURIComponent('AuraCart pilot request — '+d.facility)+'&body='+encodeURIComponent(body);
  }
  function toEmail(d){
    return fetch(FS,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify({name:d.name,facility:d.facility,role:d.role,email:d.email,phone:d.phone,
        _subject:'New AuraCart pilot request',_template:'table',_captcha:'false',_replyto:d.email})})
      .then(function(r){return r.json().catch(function(){return {};}).then(function(j){window.__fs={status:r.status,body:j};if(!r.ok||String(j.success)==='false')throw new Error('fs '+r.status);return j;});});
  }
  function toStore(d){
    return fetch('/api/pilot',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(d)})
      .then(function(r){window.__store=r.status;if(!r.ok)throw new Error('store '+r.status);return r.json();});
  }
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var d={name:val('name'),facility:val('facility'),role:val('role'),email:val('email'),phone:val('phone'),website:val('website')};
    var bad=null;
    ['name','facility','email'].forEach(function(n){var el=form.elements[n];var ok=!!d[n]&&(n!=='email'||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d[n]));el.setAttribute('aria-invalid',ok?'false':'true');if(!ok&&!bad)bad=el;});
    if(bad){msg.className='form-msg err';msg.textContent='Please add your name, facility and a valid email.';bad.focus();return;}
    if(d.website){form.classList.add('done');msg.textContent='Thanks, we\u2019ll be in touch.';return;}
    var btn=form.querySelector('button');btn.disabled=true;btn.textContent='Sending\u2026';msg.className='form-msg';msg.textContent='';
    var a=toEmail(d).then(function(){return true;},function(){return false;});
    var b=toStore(d).then(function(){return true;},function(){return false;});
    Promise.all([a,b]).then(function(res){
      window.__pilot={email:res[0],store:res[1]};
      if(res[0]||res[1]){try{window.__asCount&&window.__asCount('click','Form: pilot request sent');}catch(_){}form.classList.add('done');msg.className='form-msg';msg.textContent='Thanks, we\u2019ll be in touch.';return;}
      btn.disabled=false;btn.textContent='Request a Free Pilot';msg.className='form-msg err';
      msg.innerHTML='';msg.appendChild(document.createTextNode('That didn\u2019t go through. '));
      var l=document.createElement('a');l.href=mailto(d);l.textContent='Send it by email instead';msg.appendChild(l);
    });
  });
})();

/* Visit + click counter: no cookies, no IP, no personal data. Skip with ?nocount or localStorage 'as-nocount'. */
(function(){
  try{
    var EP='https://aurasyncmedical.sites.tab.bot/api/hit';
    var ls=null; try{ls=window.localStorage;}catch(_){}
    if(/[?&]nocount\b/.test(location.search)){ try{ls&&ls.setItem('as-nocount','1');}catch(_){} }
    if(ls&&ls.getItem('as-nocount')) { window.__asCount=function(){}; return; }
    var vid=''; try{vid=ls&&ls.getItem('as-vid');}catch(_){}
    if(!vid){ vid='v'+Math.random().toString(36).slice(2,10)+Date.now().toString(36); try{ls&&ls.setItem('as-vid',vid);}catch(_){} }
    var NAMES={top:'Hero',problem:'Problem',solution:'Solution',how:'How it works',benefits:'Benefits',hospitals:'For Hospitals',faq:'FAQ',contact:'Contact'};
    function send(type,label){
      try{
        var body=JSON.stringify({type:type,label:String(label||'').slice(0,60),path:location.pathname,ref:document.referrer||'',vid:vid,host:location.hostname});
        var ok=false;
        if(navigator.sendBeacon){ try{ ok=navigator.sendBeacon(EP,new Blob([body],{type:'text/plain'})); }catch(_){ ok=false; } }
        if(!ok&&window.fetch){ fetch(EP,{method:'POST',mode:'cors',keepalive:true,credentials:'omit',headers:{'content-type':'text/plain'},body:body}).catch(function(){}); }
      }catch(_){}
    }
    window.__asCount=send;
    function where(el){
      if(el.closest('.nav')) return 'Nav';
      if(el.closest('footer')) return 'Footer';
      var s=el.closest('section[id]'); return s?(NAMES[s.id]||s.id):'Page';
    }
    function txt(el){ return (el.getAttribute('aria-label')&&el.classList.contains('logo')?'Logo':(el.textContent||'')).replace(/\s+/g,' ').trim(); }
    document.addEventListener('click',function(e){
      try{
        var a=e.target.closest&&e.target.closest('a'); if(!a) return;
        var href=a.getAttribute('href')||'';
        if(/^mailto:/i.test(href)) return send('click','Email link ('+where(a)+')');
        if(href==='#main') return;
        send('click',where(a)+': '+txt(a));
      }catch(_){}
    },true);
    [].slice.call(document.querySelectorAll('.faq-item')).forEach(function(d){
      d.__asWas=d.open;
      d.addEventListener('toggle',function(){ var was=d.__asWas; d.__asWas=d.open; if(d.open&&!was){ var s=d.querySelector('summary'); send('click','FAQ: '+(s?s.textContent.replace(/\s+/g,' ').trim():'?')); } });
    });
    send('view','');
  }catch(_){}
})();
