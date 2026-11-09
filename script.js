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
      if(res[0]||res[1]){form.classList.add('done');msg.className='form-msg';msg.textContent='Thanks, we\u2019ll be in touch.';return;}
      btn.disabled=false;btn.textContent='Request a pilot';msg.className='form-msg err';
      msg.innerHTML='';msg.appendChild(document.createTextNode('That didn\u2019t go through. '));
      var l=document.createElement('a');l.href=mailto(d);l.textContent='Send it by email instead';msg.appendChild(l);
    });
  });
})();
