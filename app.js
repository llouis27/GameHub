
const games = [
  ['tetris', 'Tetris', 'Klassiker', 'Drehe Blöcke und vervollständige Reihen.', '🟦', '#063d91', '#071a43'],
  ['chess', 'Schach gegen Computer', 'Strategie', 'Eine einfache Schach-Demo.', '♟️', '#c49b63', '#47301f'],
  ['blocks', 'Block Blast', 'Puzzle', 'Platziere Formen und fülle Reihen.', '🧩', '#1b7cbd', '#102c59'],
  ['2048', '2048', 'Puzzle', 'Kombiniere gleiche Zahlen.', '🔢', '#f4b641', '#d87521'],
  ['snake', 'Snake', 'Klassiker', 'Sammle Punkte und weiche Hindernissen aus.', '🐍', '#176e43', '#092b24'],
  ['bubbles', 'Bubble Pop', 'Action', 'Klicke so schnell du kannst auf Blasen.', '🫧', '#633bc0', '#172b75'],
  ['memory', 'Memory', 'Puzzle', 'Finde alle Kartenpaare.', '🃏', '#a23c89', '#4d226d'],
  ['solitaire', 'Solitaire', 'Klassiker', 'Spiele Solitaire online.', '🂡', '#13815e', '#064a3d']
];

let cat = 'Alle';
let favs = new Set(JSON.parse(localStorage.getItem('gh-favs') || '[]'));
const $ = s => document.querySelector(s);

function render() {
  const search = $('#search');
  const grid = $('#grid');
  if (!search || !grid) return;

  const q = search.value.toLowerCase();
  const list = games.filter(g =>
    (cat === 'Alle' || g[2] === cat) &&
    g.join(' ').toLowerCase().includes(q)
  );

  const count = $('#count');
  if (count) count.textContent = list.length + ' Spiele';

  grid.innerHTML = list.map(g => `
    <article class="game">
      <div class="art" style="--c1:${g[5]};--c2:${g[6]}">${g[4]}</div>
      <div class="game-body">
        <h3>${g[1]}</h3>
        <p>${g[3]}</p>
        <div class="meta">
          <span class="tag">${g[2]}</span>
          <span>
            <button onclick="favorite('${g[0]}')">${favs.has(g[0]) ? '♥' : '♡'}</button>
            <button class="play" onclick="launch('${g[0]}')">Spielen ▶</button>
          </span>
        </div>
      </div>
    </article>
  `).join('') || '<p>Keine Spiele gefunden.</p>';
}

function favorite(id) {
  favs.has(id) ? favs.delete(id) : favs.add(id);
  localStorage.setItem('gh-favs', JSON.stringify([...favs]));
  render();
}

document.querySelectorAll('[data-cat]').forEach(button => {
  button.onclick = () => {
    cat = button.dataset.cat;
    document.querySelectorAll('[data-cat]').forEach(b =>
      b.classList.toggle('active', b === button)
    );
    render();
  };
});

if ($('#search')) $('#search').oninput = () => {
  if ($('#heroSearch')) $('#heroSearch').value = $('#search').value;
  render();
};

if ($('#heroSearch')) $('#heroSearch').oninput = () => {
  if ($('#search')) $('#search').value = $('#heroSearch').value;
  render();
};

if ($('#profileBtn')) $('#profileBtn').onclick = () =>
  $('#profile')?.scrollIntoView({ behavior: 'smooth' });

function showProfile() {
  const name = localStorage.getItem('gh-name') || '';
  if ($('#username')) $('#username').value = name;
  if ($('#profileStatus')) {
    $('#profileStatus').textContent = name
      ? 'Lokales Profil: ' + name
      : 'Kein Profil gespeichert.';
  }
}

if ($('#saveProfile')) $('#saveProfile').onclick = () => {
  const name = $('#username').value.trim();
  if (name) localStorage.setItem('gh-name', name.slice(0, 20));
  showProfile();
};

if ($('#clearProfile')) $('#clearProfile').onclick = () => {
  localStorage.removeItem('gh-name');
  showProfile();
};

showProfile();

function openModal(name, hint = '') {
  $('#modalTitle').textContent = name;
  $('#hint').textContent = hint;
  $('#gameArea').innerHTML = '';
  $('#modal').classList.add('open');
}

function closeGame() {
  $('#modal').classList.remove('open');
  if (window.stopGame) window.stopGame();
  window.onkeydown = null;
}

if ($('#closeModal')) $('#closeModal').onclick = closeGame;
if ($('#modal')) $('#modal').onclick = e => {
  if (e.target.id === 'modal') closeGame();
};

function launch(id) {
  if (id === 'solitaire') {
    window.open('https://www.solitaire.com/', '_blank');
    return;
  }

  const start = {
    tetris: startTetris,
    chess: startChess,
    blocks: startBlocks,
    '2048': start2048,
    snake: startSnake,
    bubbles: startBubbles,
    memory: startMemory
  };

  if (start[id]) start[id]();
}

function start2048() {
  openModal('2048', 'Benutze die Pfeiltasten.');
  let board = Array(16).fill(0), score = 0;

  $('#gameArea').innerHTML = `
    <p id="score">Punkte: 0</p>
    <div id="board" class="board2048"></div>
    <button id="again">Neu starten</button>
  `;

  function spawn() {
    const empty = board.map((v, i) => v ? -1 : i).filter(i => i >= 0);
    if (empty.length) board[empty[Math.random() * empty.length | 0]] =
      Math.random() < 0.9 ? 2 : 4;
  }

  function draw() {
    $('#board').innerHTML = board.map(v =>
      `<div class="tile" data-v="${v}">${v || ''}</div>`
    ).join('');
    $('#score').textContent = 'Punkte: ' + score;
  }

  function move(direction) {
    for (let n = 0; n < 4; n++) {
      const ids = direction === 'l' ? [n*4,n*4+1,n*4+2,n*4+3]
        : direction === 'r' ? [n*4+3,n*4+2,n*4+1,n*4]
        : direction === 'u' ? [n,n+4,n+8,n+12]
        : [n+12,n+8,n+4,n];

      let values = ids.map(i => board[i]).filter(Boolean);
      let out = [];

      for (let i = 0; i < values.length; i++) {
        if (values[i] === values[i+1]) {
          out.push(values[i] * 2);
          score += values[i] * 2;
          i++;
        } else out.push(values[i]);
      }

      while (out.length < 4) out.push(0);
      ids.forEach((id, j) => board[id] = out[j]);
    }
    spawn();
    draw();
  }

  window.onkeydown = e => {
    const d = {
      ArrowLeft: 'l', ArrowRight: 'r',
      ArrowUp: 'u', ArrowDown: 'd'
    }[e.key];
    if (d) { e.preventDefault(); move(d); }
  };

  $('#again').onclick = () => {
    board = Array(16).fill(0);
    score = 0;
    spawn(); spawn(); draw();
  };

  spawn(); spawn(); draw();
  window.stopGame = () => {};
}

function startTetris() {
  openModal('Tetris', 'Benutze die Pfeiltasten.');
  $('#gameArea').innerHTML = `
    <div style="text-align:center">
      <canvas id="tc" width="240" height="400"></canvas>
      <p id="ts">Punkte: 0</p>
      <button id="left">←</button>
      <button id="rotate">↻</button>
      <button id="down">↓</button>
      <button id="right">→</button>
      <button id="restart">Neu starten</button>
    </div>
  `;

  const canvas = $('#tc'), ctx = canvas.getContext('2d');
  const W = 10, H = 20;
  const shapes = [
    [[1,1,1,1]], [[1,0,0],[1,1,1]], [[0,0,1],[1,1,1]],
    [[1,1],[1,1]], [[0,1,1],[1,1,0]], [[0,1,0],[1,1,1]]
  ];
  let grid, piece, x, y, score, timer, over;

  function hit(px, py, shape) {
    return shape.some((row, dy) => row.some((v, dx) => v &&
      (px+dx < 0 || px+dx >= W || py+dy >= H ||
      (py+dy >= 0 && grid[py+dy][px+dx]))
    ));
  }

  function newPiece() {
    piece = shapes[Math.random()*shapes.length | 0].map(r => r.slice());
    x = 3; y = 0;
    if (hit(x, y, piece)) over = true;
  }

  function draw() {
    ctx.fillStyle = '#071426';
    ctx.fillRect(0, 0, 240, 400);
    grid.forEach((row, yy) => row.forEach((v, xx) => {
      if (v) {
        ctx.fillStyle = '#25b4ff';
        ctx.fillRect(xx*24+1, yy*20+1, 22, 18);
      }
    }));
    if (piece) piece.forEach((row, dy) => row.forEach((v, dx) => {
      if (v) {
        ctx.fillStyle = '#25b4ff';
        ctx.fillRect((x+dx)*24+1, (y+dy)*20+1, 22, 18);
      }
    }));
  }

  function tick() {
    if (over) { clearInterval(timer); return; }
    if (!hit(x, y+1, piece)) y++;
    else {
      piece.forEach((row, dy) => row.forEach((v, dx) => {
        if (v && y+dy >= 0) grid[y+dy][x+dx] = 1;
      }));
      const before = grid.length;
      grid = grid.filter(row => row.some(v => !v));
      score += (before-grid.length)*100;
      while (grid.length < H) grid.unshift(Array(W).fill(0));
      $('#ts').textContent = 'Punkte: ' + score;
      newPiece();
    }
    draw();
  }

  function act(key) {
    if (over) return;
    if (key === 'ArrowLeft' && !hit(x-1,y,piece)) x--;
    if (key === 'ArrowRight' && !hit(x+1,y,piece)) x++;
    if (key === 'ArrowDown') tick();
    if (key === 'ArrowUp') {
      const rotated = piece[0].map((_, i) => piece.map(r => r[i]).reverse());
      if (!hit(x,y,rotated)) piece = rotated;
    }
    draw();
  }

  window.onkeydown = e => {
    if (e.key.startsWith('Arrow')) { e.preventDefault(); act(e.key); }
  };

  $('#left').onclick = () => act('ArrowLeft');
  $('#right').onclick = () => act('ArrowRight');
  $('#down').onclick = () => act('ArrowDown');
  $('#rotate').onclick = () => act('ArrowUp');

  function reset() {
    clearInterval(timer);
    grid = Array.from({length:H}, () => Array(W).fill(0));
    score = 0; over = false; newPiece(); draw();
    $('#ts').textContent = 'Punkte: 0';
    timer = setInterval(tick, 550);
  }

  $('#restart').onclick = reset;
  window.stopGame = () => clearInterval(timer);
  reset();
}

function startSnake() {
  openModal('Snake', 'Benutze die Pfeiltasten oder die Knöpfe.');
  $('#gameArea').innerHTML = `
    <div style="text-align:center">
      <canvas id="sc" width="320" height="320"></canvas>
      <p id="ss">Punkte: 0</p>
      <button id="up">↑</button><br>
      <button id="sl">←</button>
      <button id="sd">↓</button>
      <button id="sr">→</button>
      <button id="sreset">Neu starten</button>
    </div>
  `;

  const ctx = $('#sc').getContext('2d');
  let snake, food, dir, score, timer;

  function draw() {
    ctx.fillStyle = '#07170f';
    ctx.fillRect(0,0,320,320);
    ctx.fillStyle = '#36dc8a';
    snake.forEach(p => ctx.fillRect(p.x*16+1,p.y*16+1,14,14));
    ctx.fillStyle = '#ff5b67';
    ctx.fillRect(food.x*16+1,food.y*16+1,14,14);
  }

  function setDir(key) {
    const d = {
      ArrowUp:{x:0,y:-1}, ArrowDown:{x:0,y:1},
      ArrowLeft:{x:-1,y:0}, ArrowRight:{x:1,y:0}
    }[key];
    if (d && (d.x !== -dir.x || d.y !== -dir.y)) dir = d;
  }

  function step() {
    const h = {x:snake[0].x+dir.x,y:snake[0].y+dir.y};
    if (h.x<0 || h.y<0 || h.x>=20 || h.y>=20 ||
        snake.some(p => p.x===h.x && p.y===h.y)) {
      clearInterval(timer);
      $('#ss').textContent = 'Spiel vorbei · Punkte: ' + score;
      return;
    }

    snake.unshift(h);
    if (h.x===food.x && h.y===food.y) {
      score += 10;
      food = {x:Math.random()*20|0,y:Math.random()*20|0};
      $('#ss').textContent = 'Punkte: ' + score;
    } else snake.pop();
    draw();
  }

  function reset() {
    clearInterval(timer);
    snake = [{x:8,y:8},{x:7,y:8},{x:6,y:8}];
    food = {x:13,y:10}; dir = {x:1,y:0}; score = 0;
    draw(); timer = setInterval(step,130);
  }

  window.onkeydown = e => {
    if (e.key.startsWith('Arrow')) { e.preventDefault(); setDir(e.key); }
  };
  $('#up').onclick = () => setDir('ArrowUp');
  $('#sd').onclick = () => setDir('ArrowDown');
  $('#sl').onclick = () => setDir('ArrowLeft');
  $('#sr').onclick = () => setDir('ArrowRight');
  $('#sreset').onclick = reset;
  window.stopGame = () => clearInterval(timer);
  reset();
}

function startBlocks() {
  openModal('Block Blast', 'Wähle eine Form und tippe auf das Raster.');
  $('#gameArea').innerHTML = `
    <div style="text-align:center">
      <div id="bg" class="blockgrid"></div>
      <p id="bs">Punkte: 0</p>
      <button data-sh="one">Einzelblock</button>
      <button data-sh="line">Linie</button>
      <button data-sh="corner">Ecke</button>
      <button id="br">Neu starten</button>
      <p id="bmsg"></p>
    </div>
  `;

  let a = Array(64).fill(0), shape = 'one', score = 0;

  function draw() {
    $('#bg').innerHTML = a.map((v,i) =>
      `<button class="cell ${v?'filled':''}" data-i="${i}"></button>`
    ).join('');
    $('#bs').textContent = 'Punkte: ' + score;
    document.querySelectorAll('[data-i]').forEach(b =>
      b.onclick = () => place(+b.dataset.i)
    );
  }

  function place(i) {
    const ids = shape==='one' ? [i] :
      shape==='line' ? [i,i+1,i+2] : [i,i+8,i+9];

    if (ids.some(n => n>=64 ||
      (shape==='line' && (n>>3)!==(i>>3)) ||
      (shape==='corner' && (n>>3)>(i>>3)+1) || a[n])) {
      $('#bmsg').textContent = 'Die Form passt hier nicht.';
      return;
    }

    ids.forEach(n => a[n]=1);
    let cleared=0;

    for (let r=0;r<8;r++) {
      if (a.slice(r*8,r*8+8).every(Boolean)) {
        a.fill(0,r*8,r*8+8); cleared++;
      }
    }

    for (let c=0;c<8;c++) {
      if (Array.from({length:8},(_,r)=>a[r*8+c]).every(Boolean)) {
        for (let r=0;r<8;r++) a[r*8+c]=0;
        cleared++;
      }
    }

    score += ids.length + cleared*10;
    $('#bmsg').textContent = '';
    draw();
  }

  document.querySelectorAll('[data-sh]').forEach(b =>
    b.onclick = () => { shape=b.dataset.sh; }
  );

  $('#br').onclick = () => { a=Array(64).fill(0); score=0; draw(); };
  window.stopGame = () => {};
  draw();
}

function startBubbles() {
  openModal('Bubble Pop', 'Klicke Blasen in 20 Sekunden.');
  $('#gameArea').innerHTML = `
    <div style="text-align:center">
      <p id="bt">Zeit: 20</p>
      <div id="bb" style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center"></div>
      <p id="bsc">Punkte: 0</p>
      <button id="bstart">Neu starten</button>
    </div>
  `;

  let t, score, timer;

  function reset() {
    clearInterval(timer);
    t=20; score=0;
    $('#bb').innerHTML = Array.from({length:24},(_,i)=>
      `<button style="width:45px;height:45px;border-radius:50%;background:${['#ff5978','#fbc94a','#43d9ff','#b78bff','#50e3a4'][Math.random()*5|0]}" data-b="${i}"></button>`
    ).join('');

    document.querySelectorAll('[data-b]').forEach(b => b.onclick=()=>{
      if(t>0 && !b.disabled) {
        b.disabled=true; b.style.visibility='hidden';
        $('#bsc').textContent='Punkte: '+(++score);
      }
    });

    $('#bt').textContent='Zeit: 20';
    $('#bsc').textContent='Punkte: 0';
    timer=setInterval(()=>{
      t--;
      $('#bt').textContent='Zeit: '+t;
      if(t<=0) clearInterval(timer);
    },1000);
  }

  $('#bstart').onclick=reset;
  window.stopGame=()=>clearInterval(timer);
  reset();
}

function startMemory() {
  openModal('Memory', 'Finde alle Kartenpaare.');
  $('#gameArea').innerHTML = `
    <div style="text-align:center">
      <div id="mg" style="display:grid;grid-template-columns:repeat(4,min(16vw,64px));gap:7px"></div>
      <p id="ms">Gefundene Paare: 0 / 8</p>
      <button id="mr">Neu starten</button>
    </div>
  `;

  let vals, opened, matched, lock;

  function reset() {
    vals=['🍉','🍉','🐱','🐱','⭐','⭐','🚀','🚀','🍀','🍀','🎲','🎲','🌈','🌈','⚽','⚽']
      .sort(()=>Math.random()-.5);
    opened=[]; matched=[]; lock=false; draw();
  }

  function draw() {
    $('#mg').innerHTML=vals.map((v,i)=>
      `<button data-m="${i}" style="width:min(16vw,64px);height:min(16vw,64px);padding:0;font-size:24px">${matched.includes(i)||opened.includes(i)?v:'❔'}</button>`
    ).join('');

    document.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{
      const i=+b.dataset.m;
      if(lock||matched.includes(i)||opened.includes(i)) return;
      opened.push(i); draw();

      if(opened.length===2) {
        if(vals[opened[0]]===vals[opened[1]]) {
          matched.push(...opened); opened=[];
          $('#ms').textContent='Gefundene Paare: '+matched.length/2+' / 8';
        } else {
          lock=true;
          setTimeout(()=>{opened=[];lock=false;draw();},650);
        }
      }
    });
  }

  $('#mr').onclick=reset;
  window.stopGame=()=>{};
  reset();
}

function startChess() {
  openModal('Schach gegen Computer', 'Einfache Schach-Demo mit zufälligen Computerzügen.');
  const glyph={K:'♔',Q:'♕',R:'♖',B:'♗',N:'♘',P:'♙',k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'};
  let board='rnbqkbnrpppppppp................................PPPPPPPPRNBQKBNR'.split('');
  let selected=-1, turn='w';

  $('#gameArea').innerHTML=`
    <div><div id="cb" class="chess"></div>
    <p id="cs">Weiß ist am Zug.</p>
    <button id="cr">Neu starten</button></div>`;

  function color(p) { return !p ? null : p===p.toUpperCase()?'w':'b'; }

  function moves(i, side=turn) {
    const p=board[i], type=p.toLowerCase(), r=i>>3, f=i&7, out=[];
    if(!p||color(p)!==side) return out;

    function add(rr,ff,slide=false) {
      while(rr>=0&&rr<8&&ff>=0&&ff<8) {
        const j=rr*8+ff;
        if(!board[j]) out.push(j);
        else { if(color(board[j])!==side) out.push(j); break; }
        if(!slide) break;
        rr+=Math.sign(rr-r); ff+=Math.sign(ff-f);
      }
    }

    if(type==='p') {
      const d=side==='w'?-1:1;
      if(r+d>=0&&r+d<8&&!board[(r+d)*8+f]) {
        out.push((r+d)*8+f);
        if((side==='w'?r===6:r===1)&&!board[(r+2*d)*8+f]) out.push((r+2*d)*8+f);
      }
      for(const df of [-1,1]) {
        const rr=r+d, ff=f+df;
        if(ff>=0&&ff<8&&board[rr*8+ff]&&color(board[rr*8+ff])!==side) out.push(rr*8+ff);
      }
    } else if(type==='n') {
      for(const [dr,df] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
        const rr=r+dr, ff=f+df;
        if(rr>=0&&rr<8&&ff>=0&&ff<8&&color(board[rr*8+ff])!==side) out.push(rr*8+ff);
      }
    } else {
      const dirs=[];
      if(['b','q','k'].includes(type)) dirs.push([-1,-1],[-1,1],[1,-1],[1,1]);
      if(['r','q','k'].includes(type)) dirs.push([-1,0],[1,0],[0,-1],[0,1]);
      dirs.forEach(([dr,df])=>add(r+dr,f+df,type!=='k'));
    }
    return out;
  }

  function draw() {
    $('#cb').innerHTML=board.map((p,i)=>
      `<button class="sq ${(Math.floor(i/8)+i%8)%2?'dark':'light'} ${selected===i?'selected':''} ${selected>=0&&moves(selected).includes(i)?'target':''}" data-s="${i}">${glyph[p]||''}</button>`
    ).join('');
    document.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>click(+b.dataset.s));
  }

  function click(i) {
    if(selected<0) {
      if(board[i]&&color(board[i])===turn) {selected=i;draw();}
      return;
    }

    if(moves(selected).includes(i)) {
      board[i]=board[selected]; board[selected]='';
      if(board[i].toLowerCase()==='p'&&(i<8||i>=56)) board[i]=turn==='w'?'Q':'q';
      turn=turn==='w'?'b':'w'; selected=-1; draw();
      $('#cs').textContent=turn==='b'?'Computer denkt …':'Weiß ist am Zug.';
      if(turn==='b') setTimeout(ai,350);
    } else if(board[i]&&color(board[i])===turn) {
      selected=i;draw();
    } else {selected=-1;draw();}
  }

  function ai() {
    const all=[];
    board.forEach((p,i)=>{if(color(p)==='b') moves(i,'b').forEach(j=>all.push([i,j]));});
    if(!all.length) {$('#cs').textContent='Keine Züge mehr.';return;}
    const [from,to]=all[Math.random()*all.length|0];
    board[to]=board[from];board[from]='';
    if(board[to]==='p'&&to>=56) board[to]='q';
    turn='w';draw();$('#cs').textContent='Weiß ist am Zug.';
  }

  function reset() {
    board='rnbqkbnrpppppppp................................PPPPPPPPRNBQKBNR'.split('');
    selected=-1;turn='w';draw();$('#cs').textContent='Weiß ist am Zug.';
  }

  $('#cr').onclick=reset;
  window.stopGame=()=>{};
  draw();
}

render();
