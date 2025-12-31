document.addEventListener("DOMContentLoaded", () => {

  const STORE_NAME  = "malla_nombre_v1";
  const STORE_STATE = "malla_estado_v1";

  const welcomeScreen = document.getElementById("welcomeScreen");
  const app = document.getElementById("app");
  const startBtn = document.getElementById("startBtn");
  const nameInput = document.getElementById("nameInput");
  const saludo = document.getElementById("saludo");
  const resetBtn = document.getElementById("resetBtn");
  const grid = document.getElementById("grid");

  const courses = [
    { id:"MATEMATICAS", name:"MATEMÁTICAS", cycle:1, credits:3, prereq:[] },
    { id:"QUIMICA", name:"QUÍMICA", cycle:1, credits:3, prereq:[] },
    { id:"INTRO", name:"INTRODUCCIÓN A LA INGENIERÍA INDUSTRIAL", cycle:1, credits:4, prereq:[] },
    { id:"INGLES_I", name:"INGLÉS I", cycle:1, credits:2, prereq:[] },

    { id:"MAT_I", name:"MATEMÁTICA I", cycle:2, credits:3, prereq:["MATEMATICAS"] },
    { id:"FIS_I", name:"FÍSICA I", cycle:2, credits:4, prereq:["MATEMATICAS"] },
    { id:"INGLES_II", name:"INGLÉS II", cycle:2, credits:2, prereq:["INGLES_I"] },

    { id:"MAT_II", name:"MATEMÁTICA II", cycle:3, credits:4, prereq:["MAT_I"] },
    { id:"FIS_II", name:"FÍSICA II", cycle:3, credits:4, prereq:["FIS_I"] },
    { id:"ALGORITMOS", name:"ALGORITMOS COMPUTACIONALES", cycle:3, credits:2, prereq:[] },

    { id:"ESTADISTICA", name:"ESTADÍSTICA Y PROBABILIDADES", cycle:4, credits:3, prereq:["MAT_II"] },
    { id:"PROCESOS", name:"INGENIERÍA DE PROCESOS INDUSTRIALES", cycle:4, credits:4, prereq:["INTRO"] },
  ];

  const byId = Object.fromEntries(courses.map(c => [c.id, c]));

  let state = JSON.parse(localStorage.getItem(STORE_STATE) || "{}");
  courses.forEach(c => {
    if (!state[c.id]) state[c.id] = { approved:false, fails:0 };
  });

  function save(){ localStorage.setItem(STORE_STATE, JSON.stringify(state)); }

  function planCycles(){
    const memo = {};
    function plan(id){
      if (memo[id]) return memo[id];
      const c = byId[id];
      let p = c.cycle + state[id].fails;
      for (const pre of c.prereq){
        p = Math.max(p, plan(pre) + 1);
      }
      memo[id] = p;
      return p;
    }
    courses.forEach(c => plan(c.id));
    return memo;
  }

  function render(){
    const planned = planCycles();
    const max = Math.max(...Object.values(planned));
    grid.innerHTML = "";

    for (let i=1;i<=max;i++){
      const col = document.createElement("div");
      col.className = "cycle";

      const h2 = document.createElement("h2");
      h2.textContent = `Ciclo ${i}`;
      col.appendChild(h2);

      let credits = 0;
      courses.forEach(c=>{
        if (planned[c.id]===i && !state[c.id].approved){
          credits += c.credits;
        }
      });

      const sub = document.createElement("div");
      sub.className = "sub";
      sub.textContent = `Créditos en curso: ${credits}`;
      col.appendChild(sub);

      courses.forEach(c=>{
        if (planned[c.id]!==i) return;

        const card = document.createElement("div");
        card.className = "course"+(state[c.id].approved?" done":"");

        const name = document.createElement("div");
        name.className = "name";
        name.innerHTML = `${c.name}<div style="font-size:11px">${c.credits} créditos</div>`;

        const ctr = document.createElement("div");
        ctr.className = "controls";

        const ok = document.createElement("button");
        ok.className = "ctrl ok";
        ok.textContent = "✓";
        ok.onclick = ()=>{ state[c.id].approved=true; save(); render(); };

        const no = document.createElement("button");
        no.className = "ctrl no";
        no.textContent = "✕";
        no.onclick = ()=>{ state[c.id].approved=false; state[c.id].fails++; save(); render(); };

        ctr.append(ok,no);
        card.append(name,ctr);
        col.appendChild(card);
      });

      grid.appendChild(col);
    }
  }

  function start(name){
    localStorage.setItem(STORE_NAME, name);
    saludo.textContent = `Hola, ${name} 👋`;
    welcomeScreen.style.display = "none";
    app.style.display = "block";
    render();
  }

  const savedName = localStorage.getItem(STORE_NAME);
  if (savedName) start(savedName);

  startBtn.onclick = ()=>{
    if (!nameInput.value.trim()) return;
    start(nameInput.value.trim());
  };

  resetBtn.onclick = ()=>{
    if (confirm("¿Reiniciar todo?")){
      localStorage.clear();
      location.reload();
    }
  };
});


