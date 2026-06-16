
(function(){
  /* ---- Guard: some embedded/throttled preview contexts never advance
     CSS transitions (opacity stays pinned at frame 0), even when the
     document timeline itself moves. Detect by sampling a real reveal's
     rendered opacity shortly after it's marked visible; if it hasn't
     progressed, force the final end-state with no animation. ---- */
  function forceVisible(){ document.documentElement.classList.add('anim-frozen'); }
  function guardReveals(){
    // The first .reveal.in is the hero eyebrow (zero delay): in a real
    // browser its 820ms transition is essentially complete by now, while a
    // frozen/throttled context leaves it pinned near 0. Threshold catches
    // only the stuck case, never a mid-transition frame.
    var probe = document.querySelector('.reveal.in') || document.querySelector('.reveal');
    if(!probe){ return; }
    var op = parseFloat(getComputedStyle(probe).opacity);
    if(isNaN(op) || op < 0.2){ forceVisible(); }
  }
  setTimeout(guardReveals, 950);
  setTimeout(guardReveals, 2000);

  /* ---- Nav scroll state + mobile CTA reveal ---- */
  var nav = document.getElementById('nav');
  var mobileCta = document.getElementById('mobileCta');
  function onScroll(){
    var y = window.scrollY || window.pageYOffset;
    if(nav){ nav.classList.toggle('scrolled', y > 40); }
    if(mobileCta){ mobileCta.classList.toggle('show', y > window.innerHeight * 0.75); }
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  /* ---- Mobile menu ---- */
  var ham = document.getElementById('hamburger');
  var menu = document.getElementById('mobileMenu');
  var closeBtn = document.getElementById('closeMenu');
  function setMenu(open){
    if(!menu){ return; }
    menu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if(ham){ ham.addEventListener('click', function(){ setMenu(true); }); }
  if(closeBtn){ closeBtn.addEventListener('click', function(){ setMenu(false); }); }
  Array.prototype.forEach.call(document.querySelectorAll('[data-mm]'), function(a){
    a.addEventListener('click', function(){ setMenu(false); });
  });

  /* ---- Menu tab switching ---- */
  var tabs = document.querySelectorAll('.menu-tab');
  var panels = document.querySelectorAll('.menu-panel');
  Array.prototype.forEach.call(tabs, function(tab){
    tab.addEventListener('click', function(){
      var name = tab.getAttribute('data-tab');
      tabs.forEach(function(t){ t.classList.toggle('active', t === tab); });
      panels.forEach(function(p){
        var on = p.getAttribute('data-panel') === name;
        p.classList.toggle('active', on);
        if(on){
          // re-trigger reveals inside the now-visible panel
          p.querySelectorAll('.reveal').forEach(function(el){
            el.classList.add('in');
          });
        }
      });
    });
  });

  /* ---- Scroll reveal (position-based; robust across embed contexts) ---- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  function checkReveals(){
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var trigger = vh * 0.92;
    for(var i = reveals.length - 1; i >= 0; i--){
      var el = reveals[i];
      var r = el.getBoundingClientRect();
      if(r.top < trigger && r.bottom > 0){
        el.classList.add('in');
        reveals.splice(i, 1);
      }
    }
  }
  window.addEventListener('scroll', checkReveals, { passive:true });
  window.addEventListener('resize', checkReveals);
  // initial passes (after layout + fonts settle)
  checkReveals();
  requestAnimationFrame(checkReveals);
  setTimeout(checkReveals, 300);
})();
