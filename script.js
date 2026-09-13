(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const root = document.documentElement;
  const menu = document.querySelector(".menu");
  const links = document.querySelector(".nav-links");
  if (menu && links) {
    menu.addEventListener("click", () => {
      const open = links.classList.toggle("mobile-open");
      menu.setAttribute("aria-expanded", String(open));
    });
    links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => links.classList.remove("mobile-open")));
  }

  const revealItems = document.querySelectorAll(".reveal");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) revealItems.forEach(el => el.classList.add("visible"));
  else {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
    }), {threshold:.12});
    revealItems.forEach(el => observer.observe(el));
  }

  const form = document.getElementById("projectForm");
  const status = document.getElementById("status");
  if (form) form.addEventListener("submit", e => {
    e.preventDefault();
    const data = new FormData(form);
    const email = String(data.get("email") || "").trim();
    const name = String(data.get("name") || "").trim();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      status.textContent = "Please enter your name and a valid business email.";
      return;
    }
    status.textContent = "Thank you. Your project details have been captured — connect this form to your email/CRM before launch.";
    form.reset();
  });

  // Desktop magnetic cursor.
  if (window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
    document.body.classList.add("has-cursor");
    const cursor = document.querySelector(".cursor"), dot = document.querySelector(".cursor-dot");
    let mx=0,my=0,cx=0,cy=0;
    window.addEventListener("mousemove", e => { mx=e.clientX; my=e.clientY; });
    function cursorLoop(){
      cx += (mx-cx)*.16; cy += (my-cy)*.16;
      cursor.style.left = cx+"px"; cursor.style.top = cy+"px";
      dot.style.left = mx+"px"; dot.style.top = my+"px";
      requestAnimationFrame(cursorLoop);
    }
    cursorLoop();
    document.querySelectorAll("a,button,.service,.case").forEach(el => {
      el.addEventListener("mouseenter", () => { cursor.style.width="52px"; cursor.style.height="52px"; });
      el.addEventListener("mouseleave", () => { cursor.style.width="34px"; cursor.style.height="34px"; });
    });
  }

  // Lightweight Three.js 3D particle field.
  const canvas = document.getElementById("space");
  if (canvas && window.THREE && !reduced) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, .1, 100);
    camera.position.z = 8;
    const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));

    const count = window.innerWidth < 650 ? 700 : 1250;
    const positions = new Float32Array(count*3);
    const sizes = new Float32Array(count);
    for(let i=0;i<count;i++){
      const r = 3.5 + Math.random()*5.5;
      const a = Math.random()*Math.PI*2;
      const z = (Math.random()-.5)*9;
      positions[i*3] = Math.cos(a)*r + (Math.random()-.5)*1.2;
      positions[i*3+1] = Math.sin(a)*r*.58 + (Math.random()-.5)*1.2;
      positions[i*3+2] = z;
      sizes[i] = .8 + Math.random()*1.8;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions,3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes,1));
    const mat = new THREE.PointsMaterial({color:0xbfff3c,size:.022,transparent:true,opacity:.65});
    const points = new THREE.Points(geo,mat);
    scene.add(points);

    const knot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.05,.025,180,12,2,3),
      new THREE.MeshBasicMaterial({color:0xbfff3c,wireframe:true,transparent:true,opacity:.13})
    );
    knot.position.set(2.2,.2,.2);
    scene.add(knot);

    let targetX=0,targetY=0,scroll=0;
    window.addEventListener("pointermove",e=>{
      targetX=(e.clientX/window.innerWidth-.5)*.7;
      targetY=(e.clientY/window.innerHeight-.5)*.5;
    },{passive:true});
    window.addEventListener("scroll",()=>scroll=window.scrollY,{passive:true});

    function resize(){
      const w=canvas.clientWidth||window.innerWidth,h=canvas.clientHeight||800;
      renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
    }
    resize(); window.addEventListener("resize",resize);
    let raf;
    function animate(){
      raf=requestAnimationFrame(animate);
      points.rotation.y += .00055;
      points.rotation.x += .00013;
      points.position.x += (targetX-points.position.x)*.006;
      points.position.y += (-targetY-points.position.y)*.006;
      knot.rotation.x += .0035; knot.rotation.y += .0045;
      knot.rotation.z += .0015;
      knot.position.y = .2 + scroll*.00025;
      renderer.render(scene,camera);
    }
    animate();
    window.addEventListener("beforeunload",()=>cancelAnimationFrame(raf));
  } else if (canvas) {
    canvas.style.display="none";
  }
})();