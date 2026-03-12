// ============================================================
// NAVIGATION & SIDEBAR SYSTEM (Adapted for Microprocessors)
// ============================================================

const weekSections = {
    w1: [
        { id: 'core', label: '⚡ Core Definitions' },
        { id: 'arch', label: '🏛 Architectures' },
        { id: '8051', label: '🔲 The 8051 Family' },
        { id: 'ops', label: '🔄 CPU Operations' },
        { id: 'select', label: '📋 Selection Criteria' },
        { id: 'pinout', label: '📌 Pinout Explorer' },
        { id: 'buses', label: '🚌 Bus Architecture ✦' }
    ],
    w4: [
        { id: 'loops', label: '🔁 Loops & DJNZ' },
        { id: 'jumps', label: '↗️ Jump Mechanics' },
        { id: 'stack', label: '📚 Stack & Subroutines' },
        { id: 'timing', label: '⏱ Timing & Delays' },
        { id: 'io', label: '🔌 I/O & Bit Logic' },
        { id: '16bit', label: '🔢 16-bit Arithmetic ✦' }
    ],
    w56: [
        { id: 'hw', label: '🖥 Hardware Overview' },
        { id: 'mem', label: '💾 Memory Map' },
        { id: 'sfr', label: '⚙️ SFRs & PSW' },
        { id: 'timers', label: '⏰ Timers' },
        { id: 'irq', label: '⚠️ Interrupts' },
        { id: 'clab', label: '💻 C Lab' },
        { id: 'freq', label: '📡 Square Waves ✦' }
    ],
    w67a: [
        { id: 'basics', label: '🧮 Memory Capacity' },
        { id: 'types', label: '💿 Memory Types ✦' },
        { id: 'decode', label: '🔀 Address Decoding' },
        { id: 'ale', label: '🔌 ALE Multiplexing' },
        { id: 'ea', label: '📍 EA Pin & Maps' },
        { id: 'movx', label: '📦 MOVX Assembly' }
    ],
    w67b: [
        { id: 'mem', label: '💾 Memory & SFRs' },
        { id: 'timing', label: '⏱ Core Timing' },
        { id: 'tmod', label: '⚙️ Timer Config' },
        { id: 'irq', label: '⚠️ Interrupts' },
        { id: 'scenario', label: '🚨 Alarm Scenario' },
        { id: 'itypes', label: '🔀 IT0/IT1 Trigger ✦' }
    ]
};

const weekColors = {
    w1: '#4f8ef7', w4: '#34d399', w56: '#f59e0b',
    w67a: '#f472b6', w67b: '#ef4444'
};

const weekLabels = {
    w1: 'W1 — Core', w4: 'W4 — Loops', w56: 'W5–6 — Arch',
    w67a: 'W6–7 — Mem', w67b: 'W6–7 — IRQ'
};

let currentWeek = 'w1';
let currentSection = null;

function buildSidebar(weekId) {
    const sidebar = document.getElementById('sidebar');
    const sections = weekSections[weekId];
    if (!sections) { sidebar.innerHTML = ''; return; }
    
    const color = weekColors[weekId] || '#4f8ef7';

    // Resources panel at top of sidebar
    let html = `
        <div class="sb-section-label" style="color:${color}">Resources</div>
        <button class="sidebar-pdf-btn" style="border-color:${color}40;color:${color}" onclick="openPDF('${weekId}')">
            📄 Week Notes PDF
        </button>
        <div class="sb-section-label" style="margin-top:0.75rem">Sections</div>
    `;
    
    // Generate sections dynamically
    sections.forEach(s => {
        const id = `${weekId}-${s.id}`;
        const isNew = s.label.includes('✦');
        const cleanLabel = s.label.replace(' ✦', '');
        const newTag = isNew ? `<span class="new-tag">NEW</span>` : '';
        html += `<button class="sb-btn" id="nav-${id}" onclick="showSection('${weekId}','${s.id}')">${cleanLabel} ${newTag}</button>`;
    });
    
    sidebar.innerHTML = html;
}

function showWeek(weekId) {
    // Update top nav active state
    document.querySelectorAll('.wtab').forEach(t => t.classList.remove('active'));
    const activeTab = document.querySelector(`[data-week="${weekId}"]`);
    if(activeTab) activeTab.classList.add('active');

    // Show correct week page
    document.querySelectorAll('.week-view').forEach(p => p.classList.remove('active'));
    const weekPage = document.getElementById(`wk-${weekId}`);
    if(weekPage) weekPage.classList.add('active');

    currentWeek = weekId;
    
    // Render dynamic sidebar
    buildSidebar(weekId);

    // Show first section automatically
    const sections = weekSections[weekId];
    if (sections && sections.length > 0) {
        showSection(weekId, sections[0].id);
    }

    // Update audio bar for this week
    switchAudioWeek(weekId);
}

function showSection(weekId, sectionId) {
    // Hide all sections in this week
    const allSections = document.querySelectorAll(`#wk-${weekId} .section-view`);
    allSections.forEach(s => s.classList.remove('active'));

    // Show target section
    const target = document.getElementById(`${weekId}-${sectionId}`);
    if (target) {
        target.classList.add('active');
        document.getElementById('mainContent').scrollTop = 0;
    }

    // Update sidebar button active state
    document.querySelectorAll('.sb-btn').forEach(i => i.classList.remove('active'));
    const navItem = document.getElementById(`nav-${weekId}-${sectionId}`);
    if (navItem) navItem.classList.add('active');

    currentSection = sectionId;
}

// ============================================================
// AUDIO SYSTEM
// ============================================================

const audioState = {
    audio: null,
    playing: false,
    currentWeek: null,
    files: {
        'w1': { name: 'Week 1 Audio', url: './assets/W1 Audio Overview.mp3' },
        'w4': { name: 'Week 4 Audio', url: './assets/W4 Audio Overview.mp3' },
        'w56': { name: 'Week 5-6 Audio', url: './assets/W5-6 Audio Overview.mp3' },
        'w67a': { name: 'Week 6-7 (Mem) Audio', url: './assets/W6-7 P1 Audio Overview.mp3' },
        'w67b': { name: 'Week 6-7 (IRQ) Audio', url: './assets/W6-7 P2 Audio Overview.mp3' }
    },
    animFrame: null,
};

function switchAudioWeek(weekId) {
    if (audioState.audio && audioState.playing) {
        audioState.audio.pause();
        audioState.playing = false;
        document.getElementById('audio-play-btn').textContent = '▶';
        if (audioState.animFrame) cancelAnimationFrame(audioState.animFrame);
    }

    audioState.currentWeek = weekId;
    const color = weekColors[weekId] || '#4f8ef7';
    document.getElementById('audio-week-label').textContent = weekLabels[weekId] || weekId;
    document.getElementById('audio-week-label').style.color = color;
    document.getElementById('audio-play-btn').style.background = color;

    const fileData = audioState.files[weekId];
    if (fileData) {
        loadAudioURL(fileData.url, fileData.name, weekId);
    } else {
        document.getElementById('audio-track-name').textContent = 'No audio loaded';
        document.getElementById('audio-progress').value = 0;
        document.getElementById('audio-time').textContent = '0:00 / 0:00';
        clearWaveform();
        if (audioState.audio) {
            audioState.audio.pause();
            audioState.audio = null;
        }
    }
    showAudioBar();
}

function showAudioBar() {
    document.getElementById('audio-bar').classList.add('visible');
    document.body.classList.add('audio-visible');
}

function hideAudioBar() {
    if (audioState.audio) {
        audioState.audio.pause();
        audioState.playing = false;
    }
    document.getElementById('audio-bar').classList.remove('visible');
    document.body.classList.remove('audio-visible');
}

function loadAudioURL(url, name, weekId) {
    if (audioState.audio) {
        audioState.audio.pause();
        audioState.audio.src = '';
    }
    const audio = new Audio(url);
    audio.volume = parseFloat(document.getElementById('audio-volume').value);
    audioState.audio = audio;
    audioState.playing = false;
    document.getElementById('audio-play-btn').textContent = '▶';

    const trackEl = document.getElementById('audio-track-name');
    trackEl.textContent = name;

    audio.addEventListener('loadedmetadata', () => {
        document.getElementById('audio-progress').max = audio.duration;
        document.getElementById('audio-time').textContent = `0:00 / ${fmtTime(audio.duration)}`;
        drawStaticWaveform(weekColors[weekId] || '#4f8ef7');
    });

    audio.addEventListener('timeupdate', () => {
        if (!audio.duration) return;
        document.getElementById('audio-progress').value = audio.currentTime;
        document.getElementById('audio-time').textContent = `${fmtTime(audio.currentTime)} / ${fmtTime(audio.duration)}`;
    });

    audio.addEventListener('ended', () => {
        audioState.playing = false;
        document.getElementById('audio-play-btn').textContent = '▶';
        if (audioState.animFrame) cancelAnimationFrame(audioState.animFrame);
        clearWaveform();
    });
}

function togglePlay() {
    if (!audioState.audio) return;
    if (audioState.playing) {
        audioState.audio.pause();
        audioState.playing = false;
        document.getElementById('audio-play-btn').textContent = '▶';
        if (audioState.animFrame) cancelAnimationFrame(audioState.animFrame);
        drawStaticWaveform(weekColors[audioState.currentWeek] || '#4f8ef7');
    } else {
        audioState.audio.play().catch(() => {});
        audioState.playing = true;
        document.getElementById('audio-play-btn').textContent = '⏸';
        animateWaveform();
    }
}

function seekAudio(val) {
    if (audioState.audio) audioState.audio.currentTime = parseFloat(val);
}

function setVolume(val) {
    if (audioState.audio) audioState.audio.volume = parseFloat(val);
}

function fmtTime(s) {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2,'0');
    return `${m}:${sec}`;
}

function animateWaveform() {
    const canvas = document.getElementById('audio-waveform');
    const ctx = canvas.getContext('2d');
    const color = weekColors[audioState.currentWeek] || '#4f8ef7';
    const W = canvas.width, H = canvas.height;
    const bars = 20;
    let t = 0;

    function draw() {
        ctx.clearRect(0,0,W,H);
        const bw = W / bars - 1;
        for (let i = 0; i < bars; i++) {
            const h = (Math.sin(t * 3 + i * 0.7) * 0.4 + 0.6) * H * 0.8;
            const y = (H - h) / 2;
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.75 + Math.sin(t + i) * 0.25;
            ctx.fillRect(i * (bw + 1), y, bw, h);
        }
        ctx.globalAlpha = 1;
        t += 0.07;
        if (audioState.playing) {
            audioState.animFrame = requestAnimationFrame(draw);
        }
    }
    draw();
}

function drawStaticWaveform(color) {
    const canvas = document.getElementById('audio-waveform');
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0,0,W,H);
    const bars = 20;
    const bw = W / bars - 1;
    for (let i = 0; i < bars; i++) {
        const h = (Math.sin(i * 0.9) * 0.3 + 0.5) * H * 0.65;
        const y = (H - h) / 2;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.3;
        ctx.fillRect(i * (bw + 1), y, bw, h);
    }
    ctx.globalAlpha = 1;
}

function clearWaveform() {
    const canvas = document.getElementById('audio-waveform');
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

// ============================================================
// PDF SYSTEM
// ============================================================

const pdfState = {
    currentWeek: null,
    files: {
        'w1': { name: 'Week 1 Notes', url: './assets/Week 1 Study Notes.pdf' },
        'w4': { name: 'Week 4 Notes', url: './assets/Week 4 Study Notes.pdf' },
        'w56': { name: 'Week 5-6 Notes', url: './assets/Week 5 & 6 Study Notes.pdf' },
        'w67a': { name: 'Week 6-7 (Mem) Notes', url: './assets/Week 6 & 7 Study Notes Part 1.pdf' },
        'w67b': { name: 'Week 6-7 (IRQ) Notes', url: './assets/Week 6 & 7 Study Notes Part 2.pdf' }
    },
    zoom: 100,
};

let isPdfMaximized = false;

function openPDF(weekId) {
    pdfState.currentWeek = weekId;
    const color = weekColors[weekId] || '#4f8ef7';

    const badge = document.getElementById('pdf-week-badge');
    badge.textContent = weekLabels[weekId] || weekId;
    badge.style.background = `${color}18`;
    badge.style.color = color;
    badge.style.borderColor = `${color}40`;

    const fileData = pdfState.files[weekId];
    if (fileData) {
        showPDFViewer(fileData.url);
    } else {
        showPDFUpload();
    }

    document.getElementById('pdf-drawer').classList.add('open');
    document.getElementById('pdf-overlay').classList.add('active');
}

function closePDF() {
    document.getElementById('pdf-drawer').classList.remove('open');
    document.getElementById('pdf-overlay').classList.remove('active');
    if (isPdfMaximized) togglePDFSize(); 
}

function showPDFUpload() {
    document.getElementById('pdf-upload-zone').style.display = 'flex';
    document.getElementById('pdf-viewer-area').classList.remove('active');
}

function showPDFViewer(url) {
    document.getElementById('pdf-upload-zone').style.display = 'none';
    document.getElementById('pdf-viewer-area').classList.add('active');
    const frame = document.getElementById('pdf-frame');
    frame.src = url + '#toolbar=1&navpanes=0&scrollbar=1';
    pdfFit();
}

function loadPDFFile(input) {
    const file = input.files[0];
    if (!file) return;
    const weekId = pdfState.currentWeek;
    const url = URL.createObjectURL(file);
    pdfState.files[weekId] = { name: file.name, url };
    showPDFViewer(url);
    input.value = '';
}

function pdfZoomIn() {
    pdfState.zoom = Math.min(250, pdfState.zoom + 25);
    applyZoom();
}

function pdfZoomOut() {
    pdfState.zoom = Math.max(50, pdfState.zoom - 25);
    applyZoom();
}

function pdfFit() {
    pdfState.zoom = 100;
    applyZoom();
}

function applyZoom() {
    const frame = document.getElementById('pdf-frame');
    if(pdfState.zoom === 100) {
        frame.style.transform = '';
        frame.style.width = '100%';
        frame.style.height = '100%';
    } else {
        const scale = pdfState.zoom / 100;
        frame.style.transform = `scale(${scale})`;
        frame.style.width = `${100 / scale}%`;
        frame.style.height = `${100 / scale}%`;
    }
    document.getElementById('pdf-page-info').textContent = `Zoom: ${pdfState.zoom}%`;
}

function setupDragDrop() {
    const zone = document.getElementById('pdf-drop-area');
    if (!zone) return;
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
    zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'application/pdf') {
            const url = URL.createObjectURL(file);
            const weekId = pdfState.currentWeek;
            pdfState.files[weekId] = { name: file.name, url };
            showPDFViewer(url);
        }
    });
}

function togglePDFSize() {
    const drawer = document.getElementById('pdf-drawer');
    const btn = document.getElementById('pdf-size-btn');
    
    isPdfMaximized = !isPdfMaximized;
    if (isPdfMaximized) {
        drawer.classList.add('maximized');
        btn.textContent = '🗕 Restore';
    } else {
        drawer.classList.remove('maximized');
        btn.textContent = '⛶ Enlarge';
    }
}

// ============================================================
// MICROPROCESSOR SIMULATOR FUNCTIONS
// ============================================================

// W1: EMBED TABS
function showEmbed(id, btn) {
    document.querySelectorAll('[id^="embed-"]').forEach(e => e.style.display = 'none');
    document.getElementById('embed-' + id).style.display = 'grid';
    document.querySelectorAll('#embedCatBtns button').forEach(b => b.className = 'btn-ghost');
    btn.className = 'btn-primary';
}

// W1: ROM TECH
const romData = {
    mask: {title:'80xx — Mask ROM (Factory Programmed)', desc:'Programmed permanently via photolithographic masks. Cannot be erased. Used in final, high-volume production.', badges:['badge-green:✓ Cheapest in volume','badge-red:✗ Permanent — no field updates']},
    uveprom: {title:'87xx — UV-EPROM', desc:'Erase: 15–20 min of UV light through a physical quartz window. Program via 12.5V on V_pp. Part prefix: 27xxx. Cannot be programmed on system board.', badges:['badge-amber:~1,000 cycles','badge-red:✗ Slow erase off-board']},
    flash: {title:'89xx — Flash EEPROM', desc:'Electrically erased in under 1 second (entire chip). ~100ns access time. 100,000+ program/erase cycles. Can be programmed in-system. Modern standard.', badges:['badge-green:100K+ cycles','badge-green:✓ Fast in-system reprogramming']},
    nvram: {title:'DS5000 — NV-RAM (Dallas)', desc:'SRAM + internal lithium battery. Detects Vcc loss and switches to battery instantly. Byte-level changes. Includes a real-time clock (RTC). Virtually infinite cycles.', badges:['badge-pink:∞ Virtually unlimited cycles','badge-green:✓ Retains data on power-off']},
};
function showRom(key, btn) {
    const d = romData[key];
    document.getElementById('romContent').innerHTML = `<h4>${d.title}</h4><p style="font-size:0.83rem;color:#94a3b8;margin-bottom:0.75rem">${d.desc}</p><div style="display:flex;gap:0.5rem;flex-wrap:wrap">${d.badges.map(b=>{const[cls,txt]=b.split(':');return`<span class="badge ${cls}">${txt}</span>`;}).join('')}</div>`;
    document.querySelectorAll('#romBtns button').forEach(b => b.className = 'btn-ghost');
    btn.className = 'btn-primary';
}

// W1: ARCHITECTURE
function showArch(type) {
    const h = type === 'harvard';
    document.getElementById('archTitle').textContent = h ? 'Harvard Architecture' : 'Princeton (Von-Neumann) Architecture';
    document.getElementById('archDesc').innerHTML = h
        ? 'Uses <strong style="color:#fff">separate</strong> memory blocks and buses for Code and Data. CPU can fetch both simultaneously — faster.'
        : 'Uses a <strong style="color:#fff">shared</strong> single memory and one bus for both Code and Data. CPU must fetch them sequentially.';
    document.getElementById('btnHarvard').className = h ? 'toggle-btn active' : 'toggle-btn';
    document.getElementById('btnPrinceton').className = h ? 'toggle-btn' : 'toggle-btn active';
    document.getElementById('archMemInst').style.display = h ? '' : 'none';
    document.getElementById('archBus1').style.display = h ? '' : 'none';
    if(!h) {
        document.getElementById('archMemData').textContent = 'Shared Memory';
        document.getElementById('archMemData').style.background = 'rgba(245,158,11,0.15)';
        document.getElementById('archMemData').style.borderColor = 'rgba(245,158,11,0.3)';
        document.getElementById('archMemData').style.color = '#fcd34d';
    } else {
        document.getElementById('archMemData').innerHTML = 'Data<br>Memory (RAM)';
        document.getElementById('archMemData').style.background = 'rgba(52,211,153,0.15)';
        document.getElementById('archMemData').style.borderColor = 'rgba(52,211,153,0.3)';
        document.getElementById('archMemData').style.color = '#6ee7b7';
    }
}

// W1: OPCODE FETCH
let fetchStep = 0;
function stepFetch() {
    fetchStep = fetchStep >= 4 ? 1 : fetchStep + 1;
    const hl = (el, type='a') => {
        const e = document.getElementById(el);
        if(type==='a') { e.style.borderColor='var(--accent)'; e.style.background='rgba(79,142,247,0.15)'; e.style.color='#93c5fd'; }
        else if(type==='g') { e.style.borderColor='rgba(52,211,153,0.5)'; e.style.background='rgba(52,211,153,0.1)'; e.style.color='#6ee7b7'; }
        else { e.style.borderColor='var(--border)'; e.style.background='var(--surface2)'; e.style.color='var(--muted)'; }
    };
    ['fABus','fCBus','fDBus'].forEach(e => hl(e,'n'));
    ['fPC','fIR'].forEach(e => {document.getElementById(e).style.borderColor='var(--border)'; document.getElementById(e).style.background='var(--surface)'; document.getElementById(e).style.color='var(--text)';});
    document.getElementById('fMemTarget').style.background='var(--surface)'; document.getElementById('fMemTarget').style.borderColor='var(--border)'; document.getElementById('fMemTarget').style.color='var(--text)';
    const descs = ['','Step 1: PC outputs address 0x0042 onto the Address Bus.','Step 2: CPU sends a READ signal via the Control Bus.','Step 3: Memory places the opcode at 0042 onto the Data Bus.','Step 4: CPU reads Data Bus and loads opcode into Instruction Register (IR). Fetch complete!'];
    document.getElementById('fetchDesc').textContent = descs[fetchStep];
    document.getElementById('fetchBtn').textContent = fetchStep < 4 ? `▶ Step ${fetchStep+1}` : '↺ Restart';
    if(fetchStep===1) { hl('fPC','a'); hl('fABus','a'); }
    if(fetchStep===2) { hl('fCBus','a'); document.getElementById('fMemTarget').style.background='rgba(79,142,247,0.12)'; document.getElementById('fMemTarget').style.color='#93c5fd'; }
    if(fetchStep===3) { hl('fDBus','g'); document.getElementById('fMemTarget').style.background='rgba(52,211,153,0.15)'; document.getElementById('fMemTarget').style.color='#6ee7b7'; }
    if(fetchStep===4) { hl('fDBus','g'); hl('fIR','a'); fetchStep=0; }
}

// W1: MACHINE CYCLE CALC
function calcMC() {
    const f = parseFloat(document.getElementById('mcFreq').value);
    if(f>0){ document.getElementById('mcTosc').textContent = (1/f).toFixed(3)+' µs'; document.getElementById('mcTime').textContent = (12/f).toFixed(3)+' µs'; }
}

// W1: PINOUT
const pinData = {
    1:{n:'P1.0',a:'',d:'Port 1, Bit 0. General-purpose I/O.'},2:{n:'P1.1',a:'',d:'Port 1, Bit 1. General-purpose I/O.'},3:{n:'P1.2',a:'',d:'Port 1, Bit 2.'},4:{n:'P1.3',a:'',d:'Port 1, Bit 3.'},5:{n:'P1.4',a:'',d:'Port 1, Bit 4.'},6:{n:'P1.5',a:'',d:'Port 1, Bit 5.'},7:{n:'P1.6',a:'',d:'Port 1, Bit 6.'},8:{n:'P1.7',a:'',d:'Port 1, Bit 7.'},
    9:{n:'RST',a:'',d:'Reset. High for 2 machine cycles resets the MCU.'},
    10:{n:'P3.0',a:'RXD',d:'Serial Data Receive pin.'},11:{n:'P3.1',a:'TXD',d:'Serial Data Transmit.'},12:{n:'P3.2',a:'INT0',d:'External Interrupt 0 input.'},13:{n:'P3.3',a:'INT1',d:'External Interrupt 1 input.'},14:{n:'P3.4',a:'T0',d:'Timer 0 external input.'},15:{n:'P3.5',a:'T1',d:'Timer 1 external input.'},16:{n:'P3.6',a:'WR̅',d:'External Data Memory Write strobe.'},17:{n:'P3.7',a:'RD̅',d:'External Data Memory Read strobe.'},
    18:{n:'XTAL2',a:'',d:'Output from inverting oscillator amplifier.'},19:{n:'XTAL1',a:'',d:'Input to inverting oscillator amplifier.'},20:{n:'GND',a:'',d:'Ground.'},
    21:{n:'P2.0',a:'A8',d:'Port 2, Bit 0. High byte of address bus.'},22:{n:'P2.1',a:'A9',d:'Port 2, Bit 1.'},23:{n:'P2.2',a:'A10',d:'Port 2, Bit 2.'},24:{n:'P2.3',a:'A11',d:'Port 2, Bit 3.'},25:{n:'P2.4',a:'A12',d:'Port 2, Bit 4.'},26:{n:'P2.5',a:'A13',d:'Port 2, Bit 5.'},27:{n:'P2.6',a:'A14',d:'Port 2, Bit 6.'},28:{n:'P2.7',a:'A15',d:'Port 2, Bit 7.'},
    29:{n:'PSEN̅',a:'',d:'Program Store Enable. Read signal for external ROM.'},30:{n:'ALE',a:'PROG̅',d:'Address Latch Enable. Demultiplexes P0 address/data.'},31:{n:'EA̅',a:'VPP',d:'External Access Enable. Tie low to run external code.'},
    32:{n:'P0.7',a:'AD7',d:'Port 0, Bit 7. Multiplexed address/data.'},33:{n:'P0.6',a:'AD6',d:'Port 0, Bit 6.'},34:{n:'P0.5',a:'AD5',d:'Port 0, Bit 5.'},35:{n:'P0.4',a:'AD4',d:'Port 0, Bit 4.'},36:{n:'P0.3',a:'AD3',d:'Port 0, Bit 3.'},37:{n:'P0.2',a:'AD2',d:'Port 0, Bit 2.'},38:{n:'P0.1',a:'AD1',d:'Port 0, Bit 1.'},39:{n:'P0.0',a:'AD0',d:'Port 0, Bit 0.'},40:{n:'VCC',a:'',d:'+5V Power Supply.'}
};

function initPins() {
    const left = document.getElementById('pinsLeft');
    const right = document.getElementById('pinsRight');
    if (!left || !right) return;
    for(let i=1; i<=20; i++) {
        left.innerHTML += `<div class="pin-row" onmouseenter="hoverPin(${i}, this)"><div class="pin-text">${i} ${pinData[i].n}</div><div class="pin-contact"></div></div>`;
    }
    for(let i=40; i>=21; i--) {
        right.innerHTML += `<div class="pin-row" onmouseenter="hoverPin(${i}, this)"><div class="pin-contact"></div><div class="pin-text">${pinData[i].n} ${i}</div></div>`;
    }
}

function hoverPin(num, el) {
    document.querySelectorAll('.pin-row').forEach(r => r.classList.remove('sel'));
    el.classList.add('sel');
    const data = pinData[num];
    document.getElementById('pinNumBadge').textContent = '#' + num;
    document.getElementById('pinNameDisplay').textContent = data.n;
    if(data.a) {
        document.getElementById('pinAltWrap').style.display = 'block';
        document.getElementById('pinAlt').textContent = data.a;
    } else {
        document.getElementById('pinAltWrap').style.display = 'none';
    }
    document.getElementById('pinDesc').textContent = data.d;
}

// W4: SHORT JUMPS
function calcJump() {
    const pcHex = document.getElementById('jmpPC').value;
    const relHex = document.getElementById('jmpRel').value;
    const pc = parseInt(pcHex, 16);
    let rel = parseInt(relHex, 16);
    if(isNaN(pc) || isNaN(rel)) return;
    if (rel > 127) rel = rel - 256; 
    let target = pc + rel;
    if (target < 0) target += 65536;
    if (target > 65535) target -= 65536;
    document.getElementById('jmpResult').textContent = '0x' + target.toString(16).toUpperCase().padStart(4, '0');
}

// W4: STACK SIMULATOR
let stack = [];
let sp = 7;
function updateStackUI() {
    const ui = document.getElementById('stackUI');
    document.getElementById('spVal').textContent = sp.toString(16).toUpperCase().padStart(2, '0');
    ui.innerHTML = '';
    if(stack.length === 0) {
        ui.innerHTML = '<div class="stack-empty">— Base (07H) —</div>';
    } else {
        stack.forEach((item, index) => {
            const addr = (7 + index + 1).toString(16).toUpperCase().padStart(2, '0') + 'H';
            const cls = item.includes('PC') ? 'stack-item-pc' : 'stack-item-reg';
            ui.innerHTML = `<div class="stack-item ${cls}"><span>${addr}</span><span>${item}</span></div>` + ui.innerHTML;
        });
    }
    document.getElementById('btnRet').disabled = stack.length === 0;
    document.getElementById('btnPop').disabled = stack.length === 0;
    document.getElementById('btnCall').disabled = stack.length >= 5;
    document.getElementById('btnPush').disabled = stack.length >= 5;
}

function stackCall() { sp += 2; stack.push('PC (Low)'); stack.push('PC (High)'); updateStackUI(); }
function stackRet() { if(stack.length >= 2) { sp -= 2; stack.pop(); stack.pop(); updateStackUI(); } }
function stackPush() { sp += 1; stack.push('R4 Data'); updateStackUI(); }
function stackPop() { if(stack.length >= 1) { sp -= 1; stack.pop(); updateStackUI(); } }

// W4: TIMING
function calcDelay() {
    const f = parseFloat(document.getElementById('delayFreq').value);
    const mcs = parseInt(document.getElementById('delayMC').value);
    if(f > 0) {
        const t1mc = (12 / f);
        document.getElementById('d1mc').textContent = t1mc.toFixed(3) + ' µs';
        document.getElementById('dTotal').textContent = (t1mc * mcs).toFixed(3) + ' µs';
    }
}

function calcNested() {
    const f = parseFloat(document.getElementById('nlFreq').value);
    const outer = parseInt(document.getElementById('nlOuter').value) || 0;
    const inner = parseInt(document.getElementById('nlInner').value) || 0;
    document.getElementById('nlCodeR2').textContent = outer;
    document.getElementById('nlCodeR3').textContent = inner;
    if(f > 0) {
        const mcTime = (12 / f); 
        const totalMcs = outer * (inner * 4 + 2);
        const totalUs = totalMcs * mcTime;
        document.getElementById('nlTotal').textContent = (totalUs / 1000).toFixed(2) + ' ms';
    }
}

// W4: OVEN I/O
function updateOven() {
    const safe = document.getElementById('ovenToggle').checked; 
    if(safe) {
        document.getElementById('ovenStatusTxt').textContent = 'SAFE';
        document.getElementById('ovenStatusTxt').style.color = 'var(--accent2)';
        document.getElementById('buzzerUI').style.borderColor = 'var(--border)';
        document.getElementById('buzzerIcon').textContent = '🔕';
        document.getElementById('buzzerIcon').style.background = 'var(--surface)';
        document.getElementById('ovenL1').style.borderLeftColor = 'var(--accent)';
        document.getElementById('ovenL1').style.background = 'rgba(79,142,247,0.1)';
        [2,3,4,5].forEach(i => {
            document.getElementById('ovenL'+i).style.borderLeftColor = 'transparent';
            document.getElementById('ovenL'+i).style.background = 'transparent';
            document.getElementById('ovenL'+i).style.color = 'var(--muted)';
        });
    } else {
        document.getElementById('ovenStatusTxt').textContent = 'HOT!';
        document.getElementById('ovenStatusTxt').style.color = '#ef4444';
        document.getElementById('buzzerUI').style.borderColor = '#ef4444';
        document.getElementById('buzzerIcon').textContent = '🔔';
        document.getElementById('buzzerIcon').style.background = 'rgba(239,68,68,0.2)';
        document.getElementById('ovenL1').style.borderLeftColor = 'transparent';
        document.getElementById('ovenL1').style.background = 'transparent';
        [2,3,4,5].forEach(i => {
            document.getElementById('ovenL'+i).style.color = 'var(--text)';
        });
    }
}

// W56: EA PIN
function showEA(state) {
    const high = state === 'high';
    document.getElementById('eaHigh').className = high ? 'toggle-btn active' : 'toggle-btn';
    document.getElementById('eaLow').className = high ? 'toggle-btn' : 'toggle-btn active';
    document.getElementById('eaDesc').innerHTML = high 
        ? 'When <strong style="color:#fff">EA = 1 (High)</strong>: 8051 executes from internal 4 KB ROM (0000H–0FFFH). When PC exceeds 0FFFH, it automatically switches to external ROM.'
        : 'When <strong style="color:#fff">EA = 0 (Low)</strong>: 8051 forces ALL code fetches from external ROM (0000H–FFFFH). Internal ROM is ignored.';
}

// W56: MEMORY MAP & SFR
const memData = {
    sfr: { title: 'SFR Space (80H–FFH)', desc: 'Special Function Registers. Direct addressing only. Contains ACC, B, PSW, TMOD, etc.'},
    scratch: { title: 'Scratch Pad RAM (30H–7FH)', desc: 'General purpose data storage. Typically used for stack and user variables.'},
    bit: { title: 'Bit-Addressable RAM (20H–2FH)', desc: '16 bytes providing 128 individual addressable bits (00H to 7FH).'},
    banks: { title: 'Register Banks (00H–1FH)', desc: '32 bytes split into 4 banks of 8 registers (R0–R7). Active bank selected by RS1, RS0 in PSW.'}
};

function showMem(type, el) {
    document.querySelectorAll('.mem-block').forEach(b => b.classList.remove('sel'));
    el.classList.add('sel');
    const d = memData[type];
    document.getElementById('memDetail').innerHTML = `<h4>${d.title}</h4><p style="font-size:0.83rem;color:#94a3b8;margin:0">${d.desc}</p>`;
}

function showMem2(type, el) {
    const rawType = type.replace('2', '');
    document.querySelectorAll('#w67b-mem .mem-block').forEach(b => b.classList.remove('sel'));
    el.classList.add('sel');
    const d = memData[rawType];
    document.getElementById('memDetail2').innerHTML = `<h4>${d.title}</h4><p style="font-size:0.83rem;color:#94a3b8;margin:0">${d.desc}</p>`;
}

let pswState = { rs1: 0, rs0: 0 };
function togglePSW(bit) {
    pswState[bit] = pswState[bit] ? 0 : 1;
    const btn = document.getElementById('psw_' + bit);
    btn.classList.toggle('on', pswState[bit]);
    btn.innerHTML = `${pswState[bit]}<span class="bit-label">${bit.toUpperCase()}</span>`;
    
    const bankNum = (pswState.rs1 << 1) | pswState.rs0;
    const ranges = ['00H–07H', '08H–0FH', '10H–17H', '18H–1FH'];
    document.getElementById('pswStatus').innerHTML = `Active Register Bank: <strong>Bank ${bankNum}</strong> (${ranges[bankNum]}). No arithmetic flags set.`;
}

function togglePSW2(bit) {
    pswState[bit] = pswState[bit] ? 0 : 1;
    const btn = document.getElementById('psw2_' + bit);
    btn.classList.toggle('on', pswState[bit]);
    btn.innerHTML = `${pswState[bit]}<span class="bit-label">${bit.toUpperCase()}</span>`;
    
    const bankNum = (pswState.rs1 << 1) | pswState.rs0;
    const ranges = ['00H–07H', '08H–0FH', '10H–17H', '18H–1FH'];
    document.getElementById('psw2Status').innerHTML = `Active: <strong>Bank ${bankNum}</strong> (${ranges[bankNum]})`;
}

// W56: TIMERS
function calcTimerFreq() {
    const f = parseFloat(document.getElementById('timerFreq').value);
    if(f > 0) {
        document.getElementById('tClk').textContent = (1/f).toFixed(3) + ' µs';
        document.getElementById('tMC').textContent = (12/f).toFixed(3) + ' µs';
    }
}

let simCount = 253; 
function simStep() {
    const reload = parseInt(document.getElementById('simTH1').value, 16) || 0;
    simCount++;
    if(simCount > 255) {
        simCount = reload;
        document.getElementById('simTF1').textContent = '1';
        document.getElementById('simTF1').classList.add('tf-active');
        setTimeout(() => {
            document.getElementById('simTF1').textContent = '0';
            document.getElementById('simTF1').classList.remove('tf-active');
        }, 1000);
    }
    document.getElementById('simTL1').textContent = simCount.toString(16).toUpperCase().padStart(2, '0');
}

function simReset() {
    simCount = parseInt(document.getElementById('simTH1').value, 16) || 0;
    document.getElementById('simTL1').textContent = simCount.toString(16).toUpperCase().padStart(2, '0');
    document.getElementById('simTF1').textContent = '0';
    document.getElementById('simTF1').classList.remove('tf-active');
}

// W56: C LAB
function updateLab() {
    const sw = document.getElementById('labSwitch').checked;
    document.getElementById('labSwVal').textContent = sw ? '1' : '0';
    document.getElementById('labCodeIf').style.borderLeftColor = sw ? 'transparent' : 'var(--accent)';
    document.getElementById('labCodeElse').style.borderLeftColor = sw ? 'var(--accent)' : 'transparent';
    
    if(!sw) {
        document.getElementById('labLED').style.background = 'var(--accent4)';
        document.getElementById('labLED').style.borderColor = 'var(--accent4)';
        document.getElementById('labLED').style.boxShadow = '0 0 15px rgba(244,114,182,0.5)';
        document.getElementById('labLEDVal').textContent = '1';
        document.getElementById('labCodeOn').style.borderLeftColor = 'var(--accent)';
        document.getElementById('labCodeOff').style.borderLeftColor = 'transparent';
    } else {
        document.getElementById('labLED').style.background = '#374151';
        document.getElementById('labLED').style.borderColor = '#4b5563';
        document.getElementById('labLED').style.boxShadow = 'none';
        document.getElementById('labLEDVal').textContent = '0';
        document.getElementById('labCodeOn').style.borderLeftColor = 'transparent';
        document.getElementById('labCodeOff').style.borderLeftColor = 'var(--accent)';
    }
}

// W67A: MEMORY
function calcMem() {
    const a = parseInt(document.getElementById('memAddr').value);
    const d = parseInt(document.getElementById('memData').value);
    if(a > 0 && d > 0) {
        const locs = Math.pow(2, a);
        const bits = locs * d;
        const bytes = bits / 8;
        
        document.getElementById('memLocs').textContent = locs.toLocaleString();
        
        if(bits >= 1048576) document.getElementById('memBits').textContent = (bits/1048576).toFixed(1) + ' Mbits';
        else if(bits >= 1024) document.getElementById('memBits').textContent = (bits/1024).toFixed(0) + ' Kbits';
        else document.getElementById('memBits').textContent = bits + ' bits';
        
        if(bytes >= 1048576) document.getElementById('memBytes').textContent = (bytes/1048576).toFixed(1) + ' MB';
        else if(bytes >= 1024) document.getElementById('memBytes').textContent = (bytes/1024).toFixed(0) + ' KB';
        else document.getElementById('memBytes').textContent = bytes + ' Bytes';
    }
}

// W67A: DECODER
function updateDecoder() {
    const decA = document.getElementById('decA');
    if (!decA) return; // Prevent break if element is missing
    const a = decA.checked ? 1 : 0;
    const b = document.getElementById('decB').checked ? 1 : 0;
    const c = document.getElementById('decC').checked ? 1 : 0;
    const val = (c << 2) | (b << 1) | a;
    
    let html = '';
    for(let i=0; i<8; i++) {
        const active = i === val;
        const cls = active ? 'dec-out hot' : 'dec-out';
        const txt = active ? '0' : '1';
        html += `<div class="${cls}">Y${i} = ${txt}</div>`;
    }
    document.getElementById('decOutputs').innerHTML = html;
    
    const start = (val * 4096).toString(16).toUpperCase().padStart(4, '0') + 'H';
    const end = (val * 4096 + 4095).toString(16).toUpperCase().padStart(4, '0') + 'H';
    document.getElementById('decRange').innerHTML = `<strong>Selected:</strong> ${start}–${end} (4 KB block)`;
}

// W67A: ALE
let aleStep = 0;
function stepALE() {
    aleStep++;
    const p0 = document.getElementById('aleP0');
    const ale = document.getElementById('aleALE');
    const psen = document.getElementById('alePSEN');
    const latch = document.getElementById('aleLatch');
    const latchVal = document.getElementById('aleLatchVal');
    const dBus = document.getElementById('aleDataBus');
    const rom = document.getElementById('aleROM');
    const btn = document.getElementById('aleBtn');
    const desc = document.getElementById('aleDesc');

    if(aleStep === 1) {
        p0.textContent = 'Port 0: A0-A7 (0x42)';
        p0.style.color = '#fcd34d'; p0.style.borderColor = '#fcd34d';
        ale.textContent = 'ALE: 1'; ale.style.color = 'var(--accent2)'; ale.style.borderColor = 'var(--accent2)';
        latch.style.borderColor = 'var(--accent2)';
        latchVal.textContent = 'Pass-thru';
        btn.textContent = 'Step 2: Latch Address';
        desc.textContent = 'CPU places lower address (0x42) on Port 0. ALE pulses HIGH, allowing the 74LS373 latch to pass the address through.';
    }
    else if(aleStep === 2) {
        ale.textContent = 'ALE: 0'; ale.style.color = 'var(--muted)'; ale.style.borderColor = '#374151';
        latch.style.borderColor = '#0f766e';
        latchVal.textContent = 'Latched: 0x42';
        p0.textContent = 'Port 0: Float (Input)';
        p0.style.color = 'var(--muted)'; p0.style.borderColor = '#374151';
        btn.textContent = 'Step 3: Read Enable';
        desc.textContent = 'ALE goes LOW. The latch freezes the address (0x42) for the ROM. Port 0 is now free to act as a data bus.';
    }
    else if(aleStep === 3) {
        psen.textContent = 'PSEN: 0'; psen.style.color = 'var(--accent4)'; psen.style.borderColor = 'var(--accent4)';
        rom.style.borderColor = 'var(--accent4)'; rom.innerHTML = 'Data Out: 0x74';
        dBus.textContent = 'D0-D7 = 0x74'; dBus.style.color = 'var(--accent)'; dBus.style.borderColor = 'var(--accent)';
        p0.textContent = 'Port 0: Reading 0x74'; p0.style.color = 'var(--accent)'; p0.style.borderColor = 'var(--accent)';
        btn.textContent = 'Reset Cycle';
        desc.textContent = 'PSEN pulses LOW, enabling ROM output. ROM places instruction (0x74) on the bus. CPU reads it via Port 0.';
    }
    else {
        aleStep = 0;
        p0.textContent = 'Port 0: High-Z'; p0.style.color = 'var(--muted)'; p0.style.borderColor = '#374151';
        ale.textContent = 'ALE: 0';
        psen.textContent = 'PSEN: 1'; psen.style.color = 'var(--muted)'; psen.style.borderColor = '#374151';
        latchVal.textContent = 'Empty';
        dBus.textContent = 'D0–D7 idle'; dBus.style.color = 'var(--muted)'; dBus.style.borderColor = '#374151';
        rom.style.borderColor = '#7c2d12'; rom.innerHTML = 'Data Out: —';
        btn.textContent = 'Step 1: Output Address';
        desc.textContent = 'Click the button to simulate the external memory fetch cycle step by step.';
    }
}

// W67A: EA MAPS
function updateEAMap() {
    const mcu = document.getElementById('eaMCU').value;
    const ea = document.getElementById('eaPIN').value;
    const viz = document.getElementById('eaMapViz');
    const note = document.getElementById('eaNote');
    
    let intKB = 0;
    if(mcu === '8051') intKB = 4;
    if(mcu === '8052') intKB = 8;
    
    viz.innerHTML = '';
    
    if(ea === 'gnd' || intKB === 0) {
        viz.innerHTML = `<div style="flex:1;background:rgba(245,158,11,0.2);display:flex;align-items:center;justify-content:center;color:#fcd34d;font-family:'Syne',sans-serif;font-weight:700;font-size:0.8rem;text-align:center">64 KB<br>External ROM</div>`;
        note.innerHTML = ea === 'gnd' ? 'EA is LOW. <strong>All</strong> code is fetched from external memory.' : '8031 has NO internal ROM. EA must be tied LOW.';
        document.getElementById('eaBoundary').style.display = 'none';
    } else {
        const intPct = (intKB / 64) * 100;
        viz.innerHTML = `
            <div style="height:${intPct}%;background:rgba(79,142,247,0.3);display:flex;align-items:center;justify-content:center;color:#93c5fd;font-family:'Syne',sans-serif;font-weight:700;font-size:0.75rem;border-bottom:1px dashed var(--accent)">${intKB}KB Int</div>
            <div style="flex:1;background:rgba(245,158,11,0.2);display:flex;align-items:center;justify-content:center;color:#fcd34d;font-family:'Syne',sans-serif;font-weight:700;font-size:0.8rem;text-align:center">${64-intKB} KB<br>Ext</div>
        `;
        note.innerHTML = `EA is HIGH. The first ${intKB} KB is executed from the chip. Remaining address space goes external.`;
        document.getElementById('eaBoundary').style.display = 'block';
        document.getElementById('eaBoundary').textContent = intKB === 4 ? '0FFFH' : '1FFFH';
    }
}

// W67A: MOVX STEPPER
let mxStep = -1;
let mxR5 = 10;
let mxDPTR = 0;
let mxR0 = 48; // 30H
let mxA = 0;
const extMem = [0x55, 0xAA, 0x12, 0x34, 0x77, 0x88, 0x99, 0xBB, 0xCC, 0xDD];
let intMem = new Array(10).fill('00');

function stepMOVX() {
    const hl = (n) => {
        for(let i=0; i<=7; i++) {
            const el = document.getElementById('mc'+i);
            if(el) {
                el.style.borderLeftColor = (i===n) ? 'var(--accent)' : 'transparent';
                el.style.color = (i===n) ? 'var(--text)' : '#6e7681';
            }
        }
    };
    
    mxStep++;
    if(mxStep === 0) { hl(0); mxDPTR = 0; document.getElementById('movxDPTR').textContent = '0000H'; }
    else if(mxStep === 1) { hl(1); mxR5 = 10; document.getElementById('movxR5').textContent = '0AH'; }
    else if(mxStep === 2) { hl(2); mxR0 = 48; document.getElementById('movxR0').textContent = '30H'; }
    else if(mxStep === 3) { 
        hl(3); 
        mxA = extMem[mxDPTR]; 
        document.getElementById('movxA').textContent = mxA.toString(16).toUpperCase().padStart(2, '0') + 'H';
        document.getElementById('movxLog').textContent = `Read ${document.getElementById('movxA').textContent} from Ext ROM.`;
    }
    else if(mxStep === 4) { 
        hl(4); 
        intMem[mxR0 - 48] = mxA.toString(16).toUpperCase().padStart(2, '0');
        renderIntRAM();
        document.getElementById('movxLog').textContent = `Wrote to Int RAM at ${mxR0.toString(16).toUpperCase()}H.`;
    }
    else if(mxStep === 5) { hl(5); mxDPTR++; document.getElementById('movxDPTR').textContent = mxDPTR.toString(16).toUpperCase().padStart(4, '0') + 'H'; }
    else if(mxStep === 6) { hl(6); mxR0++; document.getElementById('movxR0').textContent = mxR0.toString(16).toUpperCase() + 'H'; }
    else if(mxStep === 7) { 
        hl(7); 
        mxR5--; 
        document.getElementById('movxR5').textContent = mxR5.toString(16).toUpperCase().padStart(2, '0') + 'H';
        if(mxR5 > 0) {
            mxStep = 2; 
            document.getElementById('movxLog').textContent = `R5 != 0. Looping back.`;
        } else {
            document.getElementById('movxLog').textContent = `R5 = 0. Copy complete!`;
            document.getElementById('movxBtn').textContent = 'Reset';
        }
    }
    else {
        mxStep = -1;
        mxR5 = 10; mxDPTR = 0; mxR0 = 48; mxA = 0;
        intMem.fill('00');
        ['DPTR','R5','R0','A'].forEach(id => {
            const el = document.getElementById('movx'+id);
            if(el) el.textContent = '—';
        });
        renderIntRAM();
        document.getElementById('movxBtn').textContent = 'Step Execute';
        document.getElementById('movxLog').textContent = 'Ready.';
        hl(-1);
    }
}

function renderIntRAM() {
    let h = '';
    for(let i=0; i<10; i++) {
        h += `<div style="background:var(--surface2);border:1px solid var(--border);border-radius:4px;padding:4px"><div style="color:var(--muted);font-size:0.6rem">3${i}H</div><div style="color:var(--accent2)">${intMem[i]}</div></div>`;
    }
    const target = document.getElementById('movxRAM');
    if (target) target.innerHTML = h;
}

// W67B: TIMING
function calcT2() {
    const f = parseFloat(document.getElementById('t2Freq').value);
    if(f > 0) {
        const mc = 12 / f;
        document.getElementById('t2Clk').textContent = (1/f).toFixed(3) + ' µs';
        document.getElementById('t2MC').textContent = mc.toFixed(3) + ' µs';
        document.getElementById('t2Row1').textContent = mc.toFixed(3) + ' µs';
        document.getElementById('t2Row2').textContent = (mc * 2).toFixed(3) + ' µs';
        document.getElementById('t2Row4').textContent = (mc * 4).toFixed(3) + ' µs';
    }
}

// W67B: TMOD
let tmodState = { gate:0, ct:0, m1:0, m0:0 };
function toggleTMOD(bit) {
    if(bit !== 'fake') tmodState[bit] = tmodState[bit] ? 0 : 1;
    if(bit !== 'fake') {
        const btn = document.getElementById('tmod_' + bit);
        if (btn) {
            btn.classList.toggle('on', tmodState[bit]);
            btn.innerHTML = `${tmodState[bit]}<span class="bit-label">${bit.toUpperCase()}</span>`;
        }
    }
    let mode = (tmodState.m1 << 1) | tmodState.m0;
    let modeTxt = ['0 (13-bit)', '1 (16-bit)', '2 (8-bit Auto-Reload)', '3 (Split)'][mode];
    let src = tmodState.ct ? 'Counter (External pin T0)' : 'Timer (Internal clock)';
    let ctrl = tmodState.gate ? 'Requires TR0=1 AND INT0 pin HIGH' : 'Requires TR0=1 only';
    
    const res = document.getElementById('tmodResult');
    if (res) res.innerHTML = `<strong>Mode:</strong> ${modeTxt}<br><strong>Source:</strong> ${src}<br><strong>Control:</strong> ${ctrl}`;
}

// W67B: IE REG
function updateIE() {
    const eaBtn = document.getElementById('ieEA');
    if (!eaBtn) return;
    const ea = eaBtn.checked;
    
    document.getElementById('ieSubSwitches').style.opacity = ea ? '1' : '0.4';
    document.getElementById('ieSubSwitches').style.pointerEvents = ea ? 'auto' : 'none';
    
    let val = 0;
    if(ea) val |= 0x80;
    if(document.getElementById('ieET1').checked && ea) val |= 0x08;
    if(document.getElementById('ieEX1').checked && ea) val |= 0x04;
    if(document.getElementById('ieET0').checked && ea) val |= 0x02;
    if(document.getElementById('ieEX0').checked && ea) val |= 0x01;
    
    document.getElementById('ieHex').textContent = '0x' + val.toString(16).toUpperCase().padStart(2, '0');
}

// W67B: ALARM SCENARIO
let alStep = 0;
function stepAlarm() {
    alStep++;
    if(alStep > 4) alStep = 0;
    
    for(let i=0; i<=4; i++) {
        document.getElementById('al'+i).classList.toggle('lit', i <= alStep);
    }
    
    const btn = document.getElementById('alarmBtn');
    if(alStep === 0) btn.textContent = 'Trigger Door';
    else if(alStep === 1) btn.textContent = 'Run EX0ISR';
    else if(alStep === 2) btn.textContent = 'Simulate 1 Second';
    else if(alStep === 3) btn.textContent = 'Trigger Shutdown';
    else if(alStep === 4) btn.textContent = 'Reset Scenario';
}

// ============================================================
// BOOT SEQUENCE
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Attach listener to top nav tabs (mapped to .wtab correctly now)
    document.querySelectorAll('.wtab').forEach(t => {
        t.addEventListener('click', () => showWeek(t.dataset.week));
    });

    // 2. Safely initialize simulators
    if (typeof initPins === 'function') initPins();
    if (typeof renderIntRAM === 'function') renderIntRAM();
    if (typeof updateDecoder === 'function') updateDecoder();
    if (typeof toggleTMOD === 'function') toggleTMOD('fake'); 
    
    // 3. Initialize UI Features
    if (typeof setupDragDrop === 'function') setupDragDrop();
    
    // 4. Force load week 1 content and sidebar setup
    showWeek('w1');
});