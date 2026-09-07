/* Shared DOM helpers for the ten independent interactive homepages. */
window.WowKit = Object.freeze({
  q:(s,root=document)=>root.querySelector(s),
  all:(s,root=document)=>[...root.querySelectorAll(s)],
  text:(s,value)=>{const e=document.querySelector(s);if(e)e.textContent=value;},
  pressed:(s,key,value)=>document.querySelectorAll(s).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset[key]===value))),
  choose:(s,value)=>{const e=[...document.querySelectorAll(s)].find(i=>i.value===value);if(e){e.checked=true;e.dispatchEvent(new Event('change',{bubbles:true}));}},
  date:()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');},
  url:(page,values)=>page+'?'+new URLSearchParams(values).toString(),
  params:new URLSearchParams(location.search)
});
