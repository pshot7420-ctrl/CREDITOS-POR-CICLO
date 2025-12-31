const courses = [
  // CICLO 1
  { id:"MAT", name:"Matemáticas", cycle:1, credits:3, prereq:[] },
  { id:"QUI", name:"Química", cycle:1, credits:3, prereq:[] },
  { id:"INTRO", name:"Introducción a la Ingeniería Industrial", cycle:1, credits:4, prereq:[] },
  { id:"ING1", name:"Inglés I", cycle:1, credits:2, prereq:[] },

  // CICLO 2
  { id:"MAT1", name:"Matemática I", cycle:2, credits:3, prereq:["MAT"] },
  { id:"FIS1", name:"Física I", cycle:2, credits:4, prereq:["MAT"] },
  { id:"ING2", name:"Inglés II", cycle:2, credits:2, prereq:["ING1"] },

  // CICLO 3
  { id:"MAT2", name:"Matemática II", cycle:3, credits:4, prereq:["MAT1"] },
  { id:"FIS2", name:"Física II", cycle:3, credits:4, prereq:["FIS1"] },
  { id:"ALG", name:"Algoritmos Computacionales", cycle:3, credits:2, prereq:[] },

  // CICLO 4
  { id:"EST", name:"Estadística y Probabilidades", cycle:4, credits:3, prereq:["MAT2"] },
  { id:"PROC", name:"Ingeniería de Procesos Industriales", cycle:4, credits:4, prereq:["INTRO"] }
];

const state = JSON.parse(localStorage.getItem("state") || "{}");
courses.forEach(c=>{
  if(!state[c.id]) state[c.id]={approved:false,fails:0};
});

function save(){
  localStorage.setItem("state", JSON.stringify(state));
}

function planCycles(){
  const memo={};
  function plan(id){
    if(memo[id]) return memo[id];
    const c=courses.find(x=>x.id===id);
    let p=c.cycle+state[id].fails;
    c.prereq.forEach(r=>{
      p=Math.max(p, plan(r)+1);
    });
    memo[id]=p;
    return p;
  }
  courses.forEach(c=>plan(c.id));
  return memo;
}

function render(){
  const grid=document.getElementById("grid");
  grid.innerHTML="";
  const planned=planCycles();
  const max=Math.max(...Object.values(planned));

  for(let i=1;i<=max;i++){
    const col=document.createElement("div");
    col.className="cycle";
    col.innerHTML=`<h2>Ciclo ${i}</h2>`;

    let credits=0;
    courses.forEach(c=>{
      if(planned[c.id]===i && !state[c.id].approved){
        credits+=c.credits;
      }
    });

    const box=document.createElement("div");
    box.className="credits-box";
    box.textContent=`Créditos en curso: ${credits}`;
    col.appendChild(box);

    courses.forEach(c=>{
      if(planned[c.id]!==i) return;

      const card=document.createElement("div");
      card.className="course"+(state[c.id].approved?" done":"");

      card.innerHTML=`
        <div class="course-name">${c.name}</div>
        <div class="course-credits">${c.credits} créditos</div>
      `;

      const ctr=document.createElement("div");
      ctr.className="controls";

      const ok=document.createElement("button");
      ok.className="approve";
      ok.textContent="✓";
      ok.onclick=()=>{state[c.id].approved=true; save(); render();};

      const fail=document.createElement("button");
      fail.className="fail";
      fail.textContent="✕";
      fail.onclick=()=>{state[c.id].approved=false; state[c.id].fails++; save(); render();};

      ctr.append(ok,fail);
      card.appendChild(ctr);
      col.appendChild(card);
    });

    grid.appendChild(col);
  }
}

render();
