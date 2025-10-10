
(function(){
  function ready(fn){document.readyState!=='loading'?fn():document.addEventListener('DOMContentLoaded',fn);}
  ready(function(){
    if (typeof Chart === 'undefined') { console.warn('[live-comments] Chart.js não encontrado'); return; }
    const canvas = document.getElementById('chartStatus');
    if (!canvas) return;

    // Compact height for consistency
    const wrap = canvas.parentElement;
    if (wrap) wrap.style.height = '280px';

    const ctx = canvas.getContext('2d');

    const SECRETARIAS = [
      "Casa Civil","Saúde (SES)","Segurança (SSP)","Educação (SEDUC)","Meio Ambiente (SEMA)",
      "Fazenda (SEFAZ)","Infraestrutura (SEINFRA)","Cultura (SEDAC)","Justiça (SEJUSP)","Agricultura (SEAPI)",
      "Assistência Social (SAS)","Planejamento (SEPLAG)","Turismo (SETUR)","Comunicação (SECOM)"
    ];

    const rnd = (min, max) => Math.floor(Math.random()*(max-min+1))+min;
    let dataArr = SECRETARIAS.map(s => ({label:s, value:rnd(20,220)}));
    dataArr.sort((a,b)=>b.value-a.value);
    let topK = 10;

    const grad = ctx.createLinearGradient(0, 0, 0, 300);
    grad.addColorStop(0, 'rgba(31,165,76,0.35)');
    grad.addColorStop(1, 'rgba(31,165,76,0.08)');

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dataArr.slice(0,topK).map(d=>d.label),
        datasets: [{
          label: 'Qtd. de comentários',
          data: dataArr.slice(0,topK).map(d=>d.value),
          backgroundColor: grad,
          borderColor: '#1FA54C',
          borderWidth: 1.5,
          borderRadius: 8,
          barThickness: 'flex',
          maxBarThickness: 28
        }]
      },
      options: {
        responsive:true,
        maintainAspectRatio:false,
        animation: { duration: 700, easing: 'easeOutCubic' },
        plugins:{
          legend:{ display:false },
          tooltip:{
            callbacks:{
              label:(ctx)=>`${(ctx.parsed.y).toLocaleString('pt-BR')} comentários`
            }
          }
        },
        scales:{
          x:{ grid:{display:false}, ticks:{color:'#5b6b86', font:{size:11}} },
          y:{
            beginAtZero:true,
            grid:{color:'#eef2ff'},
            ticks:{
              color:'#5b6b86', font:{size:11},
              callback:(v)=>{
                const n=Number(v);
                return n>=1000? (Math.round(n/100)/10)+'k' : n;
              }
            },
            suggestedMax: 260
          }
        }
      }
    });

    // Real-time updates (simulado)
    let paused = false;
    function tick(){
      if (paused) return;
      // small random walk per secretaria
      dataArr = dataArr.map(d => ({...d, value: Math.max(0, d.value + rnd(-18, 28))}));
      dataArr.sort((a,b)=>b.value-a.value);
      const top = dataArr.slice(0, topK);
      chart.data.labels = top.map(d=>d.label);
      chart.data.datasets[0].data = top.map(d=>d.value);
      chart.update();
    }
    let t = setInterval(tick, 2000);

    // Controles
    const pauseBtn = document.getElementById('livePauseBtn');
    const shuffleBtn = document.getElementById('liveShuffleBtn');
    if (pauseBtn){
      pauseBtn.addEventListener('click', ()=>{
        paused = !paused;
        pauseBtn.textContent = paused ? 'Retomar' : 'Pausar';
      });
    }
    if (shuffleBtn){
      shuffleBtn.addEventListener('click', ()=>{
        // reset baseline
        dataArr = SECRETARIAS.map(s => ({label:s, value:rnd(20,220)})).sort((a,b)=>b.value-a.value);
        tick();
      });
    }

    // Evitar conflito com possíveis funções do dash
    window.renderStatusChart = function(){ /* substituído por gráfico de comentários em tempo real */ };
  });
})();
