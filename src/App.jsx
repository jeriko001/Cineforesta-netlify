import { useState, useEffect, useRef, useCallback } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, get } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCOeii2jYWPhUTACPEFsqQClXc-iQBQSLo",
  authDomain: "cineforesta-34e77.firebaseapp.com",
  databaseURL: "https://cineforesta-34e77-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "cineforesta-34e77",
  storageBucket: "cineforesta-34e77.firebasestorage.app",
  messagingSenderId: "555430963680",
  appId: "1:555430963680:web:6d40794808625c64de2385"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

const TMDB_KEY = "86c3283ad5a8c5b4f86ec7015813ccdc";
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p/w342";

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Lato:wght@300;400;700&display=swap');
  :root {
    --beige:#F5EFE0;--beige-dark:#E8DCC8;--beige-mid:#EFE6D0;
    --forest:#2D5016;--forest-mid:#3D6B1F;--forest-light:#5A8A35;
    --forest-faint:rgba(74,122,42,0.09);--brown:#7A5C3A;
    --text-dark:#1E2F10;--text-light:#6B7A55;
    --shadow:0 4px 24px rgba(45,80,22,0.13);--shadow-hover:0 12px 36px rgba(45,80,22,0.22);
  }
  html,body{margin:0;padding:0;overflow-x:hidden;max-width:100vw;}
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{background:var(--beige);font-family:'Lato',sans-serif;color:var(--text-dark);min-height:100vh;overflow-x:hidden;}
  .app{min-height:100vh;width:100%;max-width:100vw;overflow-x:hidden;background:var(--beige);
    background-image:radial-gradient(ellipse at 10% 0%,rgba(90,138,53,0.08) 0%,transparent 60%),radial-gradient(ellipse at 90% 100%,rgba(45,80,22,0.07) 0%,transparent 60%);}

  .landing{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;padding:40px 20px;width:100%;}
  .landing-logo{font-size:2.8rem;}
  .landing-title{font-family:'Playfair Display',serif;font-size:2.3rem;color:var(--forest);text-align:center;line-height:1.1;}
  .landing-title span{font-style:italic;color:var(--forest-light);display:block;font-size:.95rem;margin-top:5px;letter-spacing:.08em;font-weight:400;}
  .landing-sub{color:var(--text-light);font-size:.93rem;text-align:center;max-width:310px;line-height:1.65;}
  .landing-box{background:white;border-radius:20px;box-shadow:var(--shadow);padding:24px 26px;display:flex;flex-direction:column;gap:12px;width:100%;max-width:350px;}
  .landing-box-title{font-family:'Playfair Display',serif;font-size:1rem;color:var(--forest);}
  .name-input{background:var(--beige);border:2px solid var(--beige-dark);border-radius:32px;padding:10px 15px;font-family:'Lato',sans-serif;font-size:.86rem;color:var(--text-dark);outline:none;transition:border-color .2s;width:100%;}
  .name-input:focus{border-color:var(--forest-light);}
  .create-btn{background:var(--forest);color:var(--beige);border:none;border-radius:32px;padding:12px 28px;font-family:'Lato',sans-serif;font-size:.9rem;font-weight:700;letter-spacing:.06em;cursor:pointer;transition:background .2s,transform .15s;width:100%;}
  .create-btn:hover{background:var(--forest-mid);transform:translateY(-1px);}
  .create-btn:disabled{opacity:.6;cursor:not-allowed;transform:none;}
  .divider{display:flex;align-items:center;gap:10px;color:var(--text-light);font-size:.76rem;}
  .divider::before,.divider::after{content:'';flex:1;height:1px;background:var(--beige-dark);}
  .join-row{display:flex;gap:8px;}
  .join-input{flex:1;background:var(--beige);border:2px solid var(--beige-dark);border-radius:32px;padding:10px 15px;font-family:'Lato',sans-serif;font-size:.86rem;color:var(--text-dark);outline:none;transition:border-color .2s;text-transform:uppercase;letter-spacing:.12em;min-width:0;}
  .join-input:focus{border-color:var(--forest-light);}
  .join-btn{background:var(--beige-dark);color:var(--forest);border:none;border-radius:32px;padding:10px 15px;font-family:'Lato',sans-serif;font-size:.82rem;font-weight:700;cursor:pointer;transition:background .2s;white-space:nowrap;flex-shrink:0;}
  .join-btn:hover{background:#ddd4be;}
  .error-msg{color:#b03020;font-size:.78rem;}
  .recent-section{width:100%;max-width:350px;}
  .recent-title{font-family:'Playfair Display',serif;font-size:.9rem;color:var(--text-light);margin-bottom:8px;padding-left:4px;}
  .recent-list{display:flex;flex-direction:column;gap:8px;}
  .recent-item{background:white;border-radius:14px;padding:11px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;box-shadow:var(--shadow);transition:transform .15s,box-shadow .15s;}
  .recent-item:hover{transform:translateY(-2px);box-shadow:var(--shadow-hover);}
  .recent-icon{font-size:1.3rem;flex-shrink:0;}
  .recent-name{font-family:'Playfair Display',serif;font-size:.9rem;color:var(--text-dark);font-weight:600;}
  .recent-code{font-size:.72rem;color:var(--text-light);font-family:monospace;letter-spacing:.1em;margin-top:2px;}
  .recent-del{margin-left:auto;background:none;border:none;color:var(--text-light);cursor:pointer;font-size:1rem;padding:4px;flex-shrink:0;}

  header{background:var(--forest);padding:17px 18px 13px;display:flex;align-items:center;gap:10px;position:sticky;top:0;z-index:100;box-shadow:0 2px 18px rgba(45,80,22,.18);width:100%;}
  .header-leaf{font-size:1.3rem;flex-shrink:0;cursor:pointer;}
  .header-title{font-family:'Playfair Display',serif;font-size:1.45rem;color:var(--beige);letter-spacing:.03em;line-height:1;min-width:0;flex:1;}
  .header-title span{color:var(--beige-dark);font-style:italic;font-size:.76rem;display:block;font-weight:400;margin-top:2px;letter-spacing:.07em;}
  .header-right{display:flex;align-items:center;gap:8px;flex-shrink:0;}
  .icon-btn{width:34px;height:34px;border-radius:50%;background:rgba(245,239,224,.15);border:1.5px solid rgba(245,239,224,.28);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:1rem;transition:background .2s;flex-shrink:0;}
  .icon-btn:hover{background:rgba(245,239,224,.25);}
  .share-pill{display:flex;align-items:center;gap:6px;background:rgba(245,239,224,.12);border:1.5px solid rgba(245,239,224,.25);border-radius:32px;padding:6px 11px;cursor:pointer;transition:background .2s;flex-shrink:0;}
  .share-pill:hover{background:rgba(245,239,224,.2);}
  .share-pill-label{color:var(--beige);font-size:.68rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;}
  .share-code{color:var(--beige-dark);font-size:.83rem;font-family:monospace;letter-spacing:.16em;font-weight:700;}

  .notes-overlay{position:fixed;inset:0;background:rgba(30,47,16,0.45);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .2s ease;}
  .notes-popup{background:var(--beige);border-radius:22px;box-shadow:0 8px 40px rgba(45,80,22,0.22);width:100%;max-width:420px;max-height:80vh;display:flex;flex-direction:column;overflow:hidden;animation:popIn .25s ease;}
  @keyframes popIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
  .notes-header{background:var(--forest);padding:16px 18px;display:flex;align-items:center;justify-content:space-between;}
  .notes-header-title{font-family:'Playfair Display',serif;font-size:1.1rem;color:var(--beige);font-weight:600;}
  .notes-close{background:none;border:none;color:var(--beige-dark);font-size:1.3rem;cursor:pointer;padding:4px;}
  .notes-body{display:flex;flex:1;overflow:hidden;}
  .notes-tabs-vertical{display:flex;flex-direction:column;background:var(--beige-mid);border-right:1.5px solid var(--beige-dark);width:38px;flex-shrink:0;}
  .notes-tab-v{writing-mode:vertical-rl;text-orientation:mixed;transform:rotate(180deg);padding:14px 8px;font-family:'Lato',sans-serif;font-size:.72rem;font-weight:700;color:var(--text-light);cursor:pointer;border:none;background:transparent;transition:background .18s,color .18s;letter-spacing:.06em;text-align:center;border-bottom:1.5px solid var(--beige-dark);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-height:120px;}
  .notes-tab-v.active{background:var(--beige);color:var(--forest);}
  .notes-tab-v:hover:not(.active){background:rgba(245,239,224,.6);}
  .notes-content{flex:1;display:flex;flex-direction:column;overflow:hidden;}
  .notes-tab-label-row{display:flex;align-items:center;gap:8px;padding:10px 14px 0;}
  .notes-tab-label-input{font-family:'Lato',sans-serif;font-size:.78rem;font-weight:700;color:var(--forest);background:transparent;border:none;outline:none;border-bottom:1.5px dashed var(--beige-dark);padding:2px 4px;width:100%;cursor:text;}
  .notes-tab-label-input:focus{border-bottom-color:var(--forest-light);}
  .notes-textarea{flex:1;padding:12px 14px;font-family:'Lato',sans-serif;font-size:.9rem;color:var(--text-dark);background:var(--beige);border:none;outline:none;resize:none;line-height:1.7;min-height:220px;}
  .notes-save-row{padding:10px 14px;border-top:1px solid var(--beige-dark);}
  .notes-save-btn{background:var(--forest);color:var(--beige);border:none;border-radius:32px;padding:9px 22px;font-family:'Lato',sans-serif;font-size:.82rem;font-weight:700;cursor:pointer;transition:background .2s;}
  .notes-save-btn:hover{background:var(--forest-mid);}

  .tabs{display:flex;gap:8px;padding:14px 16px 0;overflow-x:auto;}
  .tab{background:transparent;border:2px solid var(--beige-dark);border-radius:32px;padding:7px 14px;font-family:'Lato',sans-serif;font-size:.82rem;font-weight:700;color:var(--text-light);cursor:pointer;transition:all .2s;white-space:nowrap;flex-shrink:0;}
  .tab.active{background:var(--forest);border-color:var(--forest);color:var(--beige);}
  .tab:hover:not(.active){border-color:var(--forest-light);color:var(--forest);}

  .sync-info{display:flex;align-items:center;gap:6px;font-size:.72rem;color:var(--text-light);padding:7px 16px 0;flex-wrap:wrap;}
  .sync-dot{width:6px;height:6px;border-radius:50%;background:var(--forest-light);animation:pulse 2.5s infinite;flex-shrink:0;}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}

  .search-wrap{padding:14px 16px 0;max-width:500px;}
  .search-row{display:flex;gap:8px;}
  .search-input{flex:1;background:white;border:2px solid var(--beige-dark);border-radius:32px;padding:11px 17px;font-family:'Lato',sans-serif;font-size:.9rem;color:var(--text-dark);outline:none;transition:border-color .2s,box-shadow .2s;min-width:0;}
  .search-input:focus{border-color:var(--forest-light);box-shadow:0 0 0 3px rgba(90,138,53,.12);}
  .search-btn{background:var(--forest);color:var(--beige);border:none;border-radius:32px;padding:11px 18px;font-family:'Lato',sans-serif;font-size:.83rem;font-weight:700;letter-spacing:.06em;cursor:pointer;transition:background .2s,transform .15s;flex-shrink:0;}
  .search-btn:hover{background:var(--forest-mid);transform:translateY(-1px);}
  .search-btn:disabled{opacity:.5;cursor:not-allowed;transform:none;}
  .search-results{background:white;border:1.5px solid var(--beige-dark);border-radius:16px;margin-top:8px;overflow-y:auto;max-height:320px;box-shadow:var(--shadow);animation:fadeIn .2s ease;}
  .result-item{display:flex;align-items:center;gap:11px;padding:10px 13px;cursor:pointer;border-bottom:1px solid var(--beige-dark);transition:background .15s;}
  .result-item:last-child{border-bottom:none;}
  .result-item:hover{background:var(--beige-mid);}
  .result-poster-img{width:34px;height:51px;object-fit:cover;border-radius:4px;flex-shrink:0;}
  .result-poster-sq{width:44px;height:44px;object-fit:cover;border-radius:6px;flex-shrink:0;}
  .result-poster-ph{width:34px;height:51px;background:var(--beige-dark);border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;}
  .result-poster-ph-sq{width:44px;height:44px;background:var(--beige-dark);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0;}
  .result-title{font-family:'Playfair Display',serif;font-size:.88rem;color:var(--text-dark);font-weight:600;}
  .result-year{font-size:.72rem;color:var(--text-light);margin-top:2px;}
  .no-results{padding:11px 13px;color:var(--text-light);font-style:italic;font-size:.84rem;}

  .section-label{font-family:'Playfair Display',serif;font-size:1.18rem;color:var(--forest);padding:22px 16px 11px;display:flex;align-items:center;gap:9px;font-weight:600;}
  .section-label::after{content:'';flex:1;height:1.5px;background:linear-gradient(90deg,var(--forest-faint),transparent);margin-left:6px;}
  .count-badge{background:var(--forest-faint);color:var(--forest-mid);border:1px solid rgba(45,80,22,.15);font-family:'Lato',sans-serif;font-size:.69rem;font-weight:700;padding:2px 8px;border-radius:12px;letter-spacing:.05em;flex-shrink:0;}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(138px,1fr));gap:15px;padding:0 16px 10px;}
  .grid-sq{display:grid;grid-template-columns:repeat(auto-fill,minmax(138px,1fr));gap:15px;padding:0 16px 10px;}
  .card{position:relative;border-radius:12px;overflow:hidden;background:white;box-shadow:var(--shadow);transition:transform .22s,box-shadow .22s;animation:cardIn .35s ease both;}
  .card:hover{transform:translateY(-5px) scale(1.02);box-shadow:var(--shadow-hover);}
  .card.watched{opacity:.62;filter:saturate(.45);}
  .card-poster{width:100%;aspect-ratio:2/3;object-fit:cover;display:block;background:var(--beige-dark);}
  .card-poster-sq{width:100%;aspect-ratio:1/1;object-fit:cover;display:block;background:var(--beige-dark);}
  .poster-ph{width:100%;aspect-ratio:2/3;background:linear-gradient(135deg,var(--beige-dark),var(--beige-mid));display:flex;align-items:center;justify-content:center;font-size:2.2rem;}
  .poster-ph-sq{width:100%;aspect-ratio:1/1;background:linear-gradient(135deg,var(--beige-dark),var(--beige-mid));display:flex;align-items:center;justify-content:center;font-size:2.5rem;}
  .card-check{position:absolute;top:8px;left:8px;width:24px;height:24px;border-radius:6px;background:rgba(245,239,224,.93);border:2px solid var(--forest);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .18s,transform .15s;z-index:2;}
  .card-check:hover{transform:scale(1.12);}
  .card-check.on{background:var(--forest);}
  .checkmark{color:var(--beige);font-size:12px;font-weight:900;}
  .card-del{position:absolute;top:8px;right:8px;width:21px;height:21px;border-radius:50%;background:rgba(245,239,224,.88);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:11px;color:var(--brown);opacity:0;transition:opacity .18s;z-index:2;}
  .card:hover .card-del{opacity:1;}
  .card-info{padding:8px 10px 10px;background:white;}
  .card-title{font-family:'Playfair Display',serif;font-size:.82rem;color:var(--text-dark);font-weight:600;line-height:1.3;}
  .card-year{font-family:'Lato',sans-serif;font-size:.69rem;color:var(--text-light);margin-top:2px;}
  .empty{padding:12px 16px;font-family:'Playfair Display',serif;font-style:italic;color:var(--text-light);font-size:.9rem;}
  .watched-section{margin-top:4px;padding-bottom:50px;}
  .watched-section .section-label{color:var(--text-light);}

  /* GAMES */
  .games-section{padding:16px;}
  .games-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;max-width:400px;}
  .game-card{background:white;border-radius:18px;box-shadow:var(--shadow);padding:24px 16px;display:flex;flex-direction:column;align-items:center;gap:10px;cursor:pointer;transition:transform .2s,box-shadow .2s;border:2px solid transparent;}
  .game-card:hover{transform:translateY(-4px);box-shadow:var(--shadow-hover);border-color:var(--forest-light);}
  .game-card-emoji{font-size:2.4rem;}
  .game-card-name{font-family:'Playfair Display',serif;font-size:.95rem;color:var(--forest);font-weight:600;text-align:center;}
  .game-card-score{font-size:.75rem;color:var(--text-light);font-family:'Lato',sans-serif;}

  /* GAME SCREEN */
  .game-screen{padding:16px;display:flex;flex-direction:column;align-items:center;gap:16px;padding-bottom:80px;}
  .game-back{align-self:flex-start;background:transparent;border:2px solid var(--beige-dark);border-radius:32px;padding:7px 16px;font-family:'Lato',sans-serif;font-size:.82rem;font-weight:700;color:var(--text-light);cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:6px;}
  .game-back:hover{border-color:var(--forest);color:var(--forest);}
  .game-title{font-family:'Playfair Display',serif;font-size:1.4rem;color:var(--forest);font-weight:600;}
  .game-scores{display:flex;gap:16px;background:white;border-radius:16px;padding:12px 20px;box-shadow:var(--shadow);}
  .score-box{text-align:center;}
  .score-label{font-size:.72rem;color:var(--text-light);font-weight:700;letter-spacing:.06em;text-transform:uppercase;}
  .score-val{font-family:'Playfair Display',serif;font-size:1.6rem;color:var(--forest);font-weight:600;line-height:1;}
  .score-sep{width:1px;background:var(--beige-dark);}
  .turn-banner{background:var(--forest);color:var(--beige);border-radius:32px;padding:12px 28px;font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:600;text-align:center;width:100%;max-width:360px;position:fixed;bottom:20px;left:50%;transform:translateX(-50%);box-shadow:0 4px 18px rgba(45,80,22,.3);z-index:50;}
  .turn-banner.their{background:var(--brown);}
  .reset-btn{background:transparent;border:2px solid var(--beige-dark);border-radius:32px;padding:8px 20px;font-family:'Lato',sans-serif;font-size:.8rem;font-weight:700;color:var(--text-light);cursor:pointer;transition:all .2s;}
  .reset-btn:hover{border-color:var(--forest);color:var(--forest);}

  /* TRIS */
  .tris-board{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;width:min(90vw,280px);}
  .tris-cell{aspect-ratio:1;background:white;border-radius:14px;box-shadow:var(--shadow);display:flex;align-items:center;justify-content:center;font-size:2.2rem;cursor:pointer;transition:transform .15s,box-shadow .15s;border:2px solid var(--beige-dark);}
  .tris-cell:hover:not(.taken){transform:scale(1.05);box-shadow:var(--shadow-hover);background:var(--beige-mid);}
  .tris-cell.taken{cursor:default;}
  .tris-cell.win{background:var(--forest-faint);border-color:var(--forest-light);}

  /* FORZA 4 */
  .f4-board{background:var(--forest);border-radius:16px;padding:10px;display:grid;grid-template-columns:repeat(7,1fr);gap:6px;width:min(95vw,350px);}
  .f4-cell{aspect-ratio:1;border-radius:50%;background:var(--beige-dark);cursor:pointer;transition:transform .15s;}
  .f4-cell:hover{transform:scale(1.08);}
  .f4-cell.p1{background:#F5EFE0;}
  .f4-cell.p2{background:#8B6914;}
  .f4-cell.win{box-shadow:0 0 0 3px #fff;}

  /* CAMPO MINATO */
  .mine-board{display:grid;gap:4px;width:min(95vw,360px);}
  .mine-cell{aspect-ratio:1;border-radius:8px;background:white;border:2px solid var(--beige-dark);display:flex;align-items:center;justify-content:center;font-size:.85rem;font-weight:700;cursor:pointer;transition:background .15s;}
  .mine-cell:hover:not(.revealed):not(.flagged){background:var(--beige-mid);}
  .mine-cell.revealed{background:var(--beige);cursor:default;border-color:var(--beige-dark);}
  .mine-cell.mine-hit{background:#c0392b;color:white;}
  .mine-cell.flagged{background:var(--forest-faint);}
  .mine-cell.n1{color:#2980b9;}
  .mine-cell.n2{color:#27ae60;}
  .mine-cell.n3{color:#c0392b;}
  .mine-cell.n4{color:#8e44ad;}
  .mine-cell.n5{color:#e67e22;}
  .mine-cell.n6{color:#16a085;}
  .mine-cell.n7{color:#2c3e50;}
  .mine-cell.n8{color:#7f8c8d;}
  .mine-info{display:flex;gap:12px;align-items:center;font-size:.82rem;color:var(--text-light);}
  .mine-flag-btn{background:var(--beige-dark);border:none;border-radius:32px;padding:7px 16px;font-family:'Lato',sans-serif;font-size:.8rem;font-weight:700;cursor:pointer;color:var(--forest);transition:background .2s;}
  .mine-flag-btn.active{background:var(--forest);color:var(--beige);}

  /* SUDOKU */
  .sudoku-board{display:grid;grid-template-columns:repeat(9,1fr);gap:2px;width:min(95vw,360px);background:var(--forest);padding:3px;border-radius:10px;}
  .sudoku-cell{aspect-ratio:1;background:var(--beige);display:flex;align-items:center;justify-content:center;font-family:'Lato',sans-serif;font-size:.9rem;font-weight:700;cursor:pointer;transition:background .15s;color:var(--text-dark);}
  .sudoku-cell.given{color:var(--forest);cursor:default;}
  .sudoku-cell.selected{background:var(--beige-dark);}
  .sudoku-cell.error{color:#c0392b;}
  .sudoku-cell.box-right{border-right:2px solid var(--forest);}
  .sudoku-cell.box-bottom{border-bottom:2px solid var(--forest);}
  .sudoku-numpad{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;width:min(95vw,360px);}
  .sudoku-num{background:white;border:2px solid var(--beige-dark);border-radius:10px;padding:10px;font-family:'Lato',sans-serif;font-size:1rem;font-weight:700;color:var(--forest);cursor:pointer;text-align:center;transition:all .2s;}
  .sudoku-num:hover{background:var(--forest);color:var(--beige);border-color:var(--forest);}

  .toast{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);background:var(--forest);color:var(--beige);border-radius:32px;padding:10px 22px;font-size:.83rem;font-weight:700;letter-spacing:.04em;box-shadow:0 4px 18px rgba(45,80,22,.25);animation:toastIn .25s ease,toastOut .25s ease 1.85s both;z-index:999;white-space:nowrap;max-width:92vw;text-align:center;}
  @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
  @keyframes toastOut{to{opacity:0;transform:translateX(-50%) translateY(8px)}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
  @keyframes cardIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  .loading-dots{display:inline-flex;gap:4px;align-items:center}
  .loading-dots span{width:5px;height:5px;border-radius:50%;background:var(--beige);animation:dot 1.2s infinite}
  .loading-dots span:nth-child(2){animation-delay:.2s}.loading-dots span:nth-child(3){animation-delay:.4s}
  @keyframes dot{0%,80%,100%{opacity:.25;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}
`;

// ---- UTILS ----
function lsGet(k) { try { const v=localStorage.getItem(k); return v?JSON.parse(v):null; } catch{return null;} }
function lsSet(k,v) { try{localStorage.setItem(k,JSON.stringify(v));}catch{} }
function genCode() { const c="ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; return Array.from({length:6},()=>c[Math.floor(Math.random()*c.length)]).join(""); }

async function saveList(code,data) { await set(ref(db,"lists/"+code),data); }
async function loadList(code) { const s=await get(ref(db,"lists/"+code)); return s.exists()?s.val():null; }

async function searchMusic(query) {
  try {
    const url=`https://musicbrainz.org/ws/2/release/?query=${encodeURIComponent(query)}&fmt=json&limit=12`;
    const res=await fetch(url,{headers:{"User-Agent":"CineForesta/1.0"}});
    const data=await res.json();
    return (data.releases||[]).slice(0,12).map(r=>({
      id:r.id, title:r.title,
      original_title:r["artist-credit"]?.[0]?.artist?.name||"",
      year:(r.date||"").slice(0,4)||"—",
      poster:`https://coverartarchive.org/release/${r.id}/front-250`,
      isCover:true,
    }));
  } catch{return[];}
}

async function searchFilms(query,type) {
  try {
    const ep=type==="film"?"movie":"tv";
    const url=`${TMDB_BASE}/search/${ep}?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&language=it-IT&page=1`;
    const res=await fetch(url);
    const data=await res.json();
    return (data.results||[]).slice(0,12).map(m=>({
      id:m.id, title:m.title||m.name,
      original_title:m.original_title||m.original_name,
      year:(m.release_date||m.first_air_date||"").slice(0,4)||"—",
      poster:m.poster_path?`${TMDB_IMG}${m.poster_path}`:null,
    }));
  } catch{return[];}
}

function getRecents(){return lsGet("cf_recents")||[];}
function saveRecents(l){lsSet("cf_recents",l);}
function addRecent(code,name){const r=getRecents().filter(x=>x.code!==code);r.unshift({code,name});saveRecents(r.slice(0,5));}
function removeRecent(code){saveRecents(getRecents().filter(r=>r.code!==code));}

const DEFAULT_NOTES={tabs:["Note","Luoghi","Link"],contents:["","",""]};

// ---- GAME LOGIC ----
function checkTrisWinner(board) {
  const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for(const [a,b,c] of lines) if(board[a]&&board[a]===board[b]&&board[a]===board[c]) return {winner:board[a],line:[a,b,c]};
  return null;
}

function checkF4Winner(board,rows=6,cols=7) {
  const get=(r,c)=>r>=0&&r<rows&&c>=0&&c<cols?board[r*cols+c]:null;
  const dirs=[[0,1],[1,0],[1,1],[1,-1]];
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) {
    const v=get(r,c); if(!v) continue;
    for(const [dr,dc] of dirs) {
      const cells=[r*cols+c];
      let ok=true;
      for(let i=1;i<4;i++){const nr=r+dr*i,nc=c+dc*i;if(get(nr,nc)!==v){ok=false;break;}cells.push(nr*cols+nc);}
      if(ok) return {winner:v,cells};
    }
  }
  return null;
}

function generateMineBoard(rows,cols,mines) {
  const total=rows*cols;
  const mineSet=new Set();
  while(mineSet.size<mines) mineSet.add(Math.floor(Math.random()*total));
  const board=Array(total).fill(null).map((_,i)=>({mine:mineSet.has(i),revealed:false,flagged:false,count:0}));
  for(let i=0;i<total;i++) {
    if(!board[i].mine) continue;
    const r=Math.floor(i/cols),c=i%cols;
    for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++) {
      const nr=r+dr,nc=c+dc;
      if(nr>=0&&nr<rows&&nc>=0&&nc<cols) board[nr*cols+nc].count++;
    }
  }
  return board;
}

function revealCells(board,idx,rows,cols) {
  const b=[...board];
  const stack=[idx];
  while(stack.length) {
    const i=stack.pop();
    if(b[i].revealed||b[i].flagged) continue;
    b[i]={...b[i],revealed:true};
    if(b[i].count===0&&!b[i].mine) {
      const r=Math.floor(i/cols),c=i%cols;
      for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++) {
        const nr=r+dr,nc=c+dc;
        if(nr>=0&&nr<rows&&nc>=0&&nc<cols) stack.push(nr*cols+nc);
      }
    }
  }
  return b;
}

function generateSudoku() {
  const base=Array(81).fill(0);
  function possible(b,pos,num) {
    const r=Math.floor(pos/9),c=pos%9;
    for(let i=0;i<9;i++){if(b[r*9+i]===num||b[i*9+c]===num)return false;}
    const br=Math.floor(r/3)*3,bc=Math.floor(c/3)*3;
    for(let dr=0;dr<3;dr++) for(let dc=0;dc<3;dc++) if(b[(br+dr)*9+(bc+dc)]===num)return false;
    return true;
  }
  function solve(b,pos=0) {
    if(pos===81)return true;
    if(b[pos]!==0)return solve(b,pos+1);
    const nums=[1,2,3,4,5,6,7,8,9].sort(()=>Math.random()-.5);
    for(const n of nums){if(possible(b,pos,n)){b[pos]=n;if(solve(b,pos+1))return true;b[pos]=0;}}
    return false;
  }
  solve(base);
  const solution=[...base];
  const puzzle=[...base];
  const toRemove=45;
  const positions=[...Array(81).keys()].sort(()=>Math.random()-.5).slice(0,toRemove);
  positions.forEach(i=>puzzle[i]=0);
  return {puzzle,solution};
}

// ---- MAIN APP ----
export default function App() {
  const [screen,setScreen]=useState("landing");
  const [roomCode,setRoomCode]=useState("");
  const [roomName,setRoomName]=useState("");
  const [newName,setNewName]=useState("");
  const [joinVal,setJoinVal]=useState("");
  const [joinErr,setJoinErr]=useState("");
  const [creating,setCreating]=useState(false);
  const [activeTab,setActiveTab]=useState("film");
  const [listData,setListData]=useState({film:[],serie:[],musica:[],notes:DEFAULT_NOTES,games:{},scores:{},name:""});
  const [query,setQuery]=useState("");
  const [results,setResults]=useState([]);
  const [searching,setSearching]=useState(false);
  const [showResults,setShowResults]=useState(false);
  const [recents,setRecents]=useState(getRecents());
  const [showNotes,setShowNotes]=useState(false);
  const [notesTab,setNotesTab]=useState(0);
  const [localNotes,setLocalNotes]=useState(DEFAULT_NOTES);
  const [activeGame,setActiveGame]=useState(null);
  const [toast,setToast]=useState(null);
  const [toastKey,setToastKey]=useState(0);
  const searchRef=useRef(null);
  const toastTimer=useRef(null);
  const unsubRef=useRef(null);

  const showToast=msg=>{setToast(msg);setToastKey(k=>k+1);clearTimeout(toastTimer.current);toastTimer.current=setTimeout(()=>setToast(null),2400);};

  useEffect(()=>{
    const h=e=>{if(searchRef.current&&!searchRef.current.contains(e.target))setShowResults(false);};
    document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[]);

  const startListening=useCallback((code)=>{
    if(unsubRef.current)unsubRef.current();
    const listRef=ref(db,"lists/"+code);
    unsubRef.current=onValue(listRef,snap=>{
      if(snap.exists()){
        const val=snap.val();
        const notes=val.notes||DEFAULT_NOTES;
        setListData({film:val.film||[],serie:val.serie||[],musica:val.musica||[],notes,games:val.games||{},scores:val.scores||{},name:val.name||""});
        setLocalNotes(notes);
      }
    });
  },[]);

  const enterRoom=async(code,isNew,name="")=>{
    if(isNew){await saveList(code,{film:[],serie:[],musica:[],notes:DEFAULT_NOTES,games:{},scores:{},name});}
    else{const ex=await loadList(code);if(ex===null){setJoinErr("Codice non trovato.");return false;}name=ex.name||code;}
    setRoomCode(code);setRoomName(name);
    addRecent(code,name);setRecents(getRecents());
    lsSet("cf_last",{code,name});
    startListening(code);setScreen("app");return true;
  };

  const handleCreate=async()=>{
    if(!newName.trim()){setJoinErr("Dai un nome alla lista!");return;}
    setCreating(true);const code=genCode();
    await enterRoom(code,true,newName.trim());
    showToast("Lista creata! 🌿");setCreating(false);
  };

  const handleJoin=async()=>{
    const c=joinVal.trim().toUpperCase();
    if(c.length<4){setJoinErr("Codice non valido.");return;}
    setJoinErr("");const ok=await enterRoom(c,false);if(ok)showToast("Entrato! 🌿");
  };

  const goHome=()=>{
    if(unsubRef.current)unsubRef.current();
    setScreen("landing");setRoomCode("");setRoomName("");
    setQuery("");setResults([]);setShowResults(false);
    setRecents(getRecents());setShowNotes(false);setActiveGame(null);
  };

  const updateData=async(patch)=>{
    const newData={...listData,...patch};
    setListData(newData);await saveList(roomCode,newData);
  };

  const updateCategory=async(cat,next)=>{const d={...listData,[cat]:next};setListData(d);await saveList(roomCode,d);};

  const saveNotes=async()=>{const d={...listData,notes:localNotes};setListData(d);await saveList(roomCode,d);showToast("Note salvate ✓");};

  const handleSearch=async()=>{
    if(!query.trim())return;
    setSearching(true);setShowResults(true);setResults([]);
    const r=activeTab==="musica"?await searchMusic(query.trim()):await searchFilms(query.trim(),activeTab);
    setResults(r);setSearching(false);
  };

  const addItem=async item=>{
    const list=listData[activeTab]||[];
    if(list.find(f=>f.id===item.id)){showToast("Già in lista!");return;}
    await updateCategory(activeTab,[{...item,watched:false,addedAt:Date.now()},...list]);
    setQuery("");setResults([]);setShowResults(false);
    showToast(`"${item.title}" aggiunto ✓`);
  };

  const toggleWatched=id=>updateCategory(activeTab,(listData[activeTab]||[]).map(f=>f.id===id?{...f,watched:!f.watched}:f));
  const removeItem=id=>updateCategory(activeTab,(listData[activeTab]||[]).filter(f=>f.id!==id));
  const copyCode=()=>{navigator.clipboard?.writeText(roomCode).catch(()=>{});showToast(`Codice copiato: ${roomCode} 📋`);};
  const updateNoteTab=(i,v)=>{const t=[...localNotes.tabs];t[i]=v;setLocalNotes(p=>({...p,tabs:t}));};
  const updateNoteContent=(i,v)=>{const c=[...localNotes.contents];c[i]=v;setLocalNotes(p=>({...p,contents:c}));};

  const updateGame=async(gameKey,gameState)=>{
    const games={...(listData.games||{}),[gameKey]:gameState};
    await updateData({games});
  };
  const updateScores=async(scores)=>updateData({scores});

  const currentList=listData[activeTab]||[];
  const toWatch=currentList.filter(f=>!f.watched);
  const watched=currentList.filter(f=>f.watched);
  const isMusic=activeTab==="musica";
  const tabIcon={film:"🎬",serie:"📺",musica:"🎵"};
  const watchedLabel={film:"Film visti",serie:"Visti",musica:"Ascoltati"};
  const toWatchLabel={film:"Da vedere",serie:"Da vedere",musica:"Da ascoltare"};
  const searchPlaceholder={film:"Cerca un film…",serie:"Cerca una serie o anime…",musica:"Cerca artista o album…"};

  if(screen==="landing") return (
    <>
      <style>{STYLE}</style>
      <div className="app">
        <div className="landing">
          <div className="landing-logo">🌿</div>
          <div className="landing-title">CineForesta<span>watchlist condivisa</span></div>
          <p className="landing-sub">Crea una lista, condividi il codice con un amico, e decidete cosa vedere stasera.</p>
          <div className="landing-box">
            <div className="landing-box-title">Crea nuova lista</div>
            <input className="name-input" placeholder="Nome della lista (es. Film con Marco)" value={newName} onChange={e=>{setNewName(e.target.value);setJoinErr("");}} onKeyDown={e=>e.key==="Enter"&&handleCreate()}/>
            <button className="create-btn" onClick={handleCreate} disabled={creating}>{creating?<span className="loading-dots"><span/><span/><span/></span>:"🌿 Crea lista"}</button>
            <div className="divider">oppure entra con un codice</div>
            <div className="join-row">
              <input className="join-input" placeholder="CODICE" value={joinVal} onChange={e=>{setJoinVal(e.target.value);setJoinErr("");}} onKeyDown={e=>e.key==="Enter"&&handleJoin()} maxLength={8}/>
              <button className="join-btn" onClick={handleJoin}>Entra →</button>
            </div>
            {joinErr&&<div className="error-msg">⚠ {joinErr}</div>}
          </div>
          {recents.length>0&&(
            <div className="recent-section">
              <div className="recent-title">Liste recenti</div>
              <div className="recent-list">
                {recents.map(r=>(
                  <div key={r.code} className="recent-item" onClick={()=>enterRoom(r.code,false)}>
                    <span className="recent-icon">🌿</span>
                    <div><div className="recent-name">{r.name}</div><div className="recent-code">{r.code}</div></div>
                    <button className="recent-del" onClick={e=>{e.stopPropagation();removeRecent(r.code);setRecents(getRecents());}}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {toast&&<div key={toastKey} className="toast">{toast}</div>}
    </>
  );

  return (
    <>
      <style>{STYLE}</style>
      <div className="app">
        <header>
          <span className="header-leaf" onClick={goHome}>🌿</span>
          <div className="header-title">{roomName||"CineForesta"}<span>watchlist condivisa</span></div>
          <div className="header-right">
            <div className="icon-btn" onClick={()=>setShowNotes(true)} title="Note">📝</div>
            <div className="share-pill" onClick={copyCode}>
              <span className="share-pill-label">Codice</span>
              <span className="share-code">{roomCode}</span>
              <span style={{color:"var(--beige-dark)"}}>📋</span>
            </div>
          </div>
        </header>

        <div className="tabs">
          {["film","serie","musica","giochi"].map(t=>(
            <button key={t} className={`tab${activeTab===t?" active":""}`} onClick={()=>{setActiveTab(t);setQuery("");setResults([]);setShowResults(false);setActiveGame(null);}}>
              {t==="film"?"🎬 Film":t==="serie"?"📺 Serie":t==="musica"?"🎵 Musica":"🎮 Giochi"}
            </button>
          ))}
        </div>

        <div className="sync-info"><span className="sync-dot"/>Sincronizzata in tempo reale · codice:&nbsp;<strong style={{color:"var(--forest)"}}>{roomCode}</strong></div>

        {activeTab!=="giochi" ? (
          <>
            <div ref={searchRef}>
              <div className="search-wrap">
                <div className="search-row">
                  <input className="search-input" placeholder={searchPlaceholder[activeTab]} value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSearch()} onFocus={()=>results.length&&setShowResults(true)}/>
                  <button className="search-btn" onClick={handleSearch} disabled={searching}>{searching?<span className="loading-dots"><span/><span/><span/></span>:"Cerca"}</button>
                </div>
                {showResults&&(
                  <div className="search-results">
                    {searching&&<div className="no-results">Ricerca in corso…</div>}
                    {!searching&&results.length===0&&<div className="no-results">Nessun risultato trovato.</div>}
                    {!searching&&results.map(item=>(
                      <div key={item.id} className="result-item" onClick={()=>addItem(item)}>
                        {isMusic?<MusicCover url={item.poster} size="sq"/>:item.poster?<img src={item.poster} alt={item.title} className="result-poster-img"/>:<div className="result-poster-ph">📺</div>}
                        <div><div className="result-title">{item.title}</div><div className="result-year">{item.original_title&&item.original_title!==item.title?`${item.original_title} · `:""}{item.year}</div></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="section-label">{tabIcon[activeTab]} {toWatchLabel[activeTab]} {toWatch.length>0&&<span className="count-badge">{toWatch.length}</span>}</div>
            {toWatch.length===0?<div className="empty">Cerca qualcosa per aggiungerlo…</div>:<div className={isMusic?"grid-sq":"grid"}>{toWatch.map((f,i)=><Card key={f.id} film={f} index={i} isMusic={isMusic} tab={activeTab} onToggle={toggleWatched} onRemove={removeItem}/>)}</div>}
            {watched.length>0&&(<div className="watched-section"><div className="section-label">{watchedLabel[activeTab]} 🙃 <span className="count-badge">{watched.length}</span></div><div className={isMusic?"grid-sq":"grid"}>{watched.map((f,i)=><Card key={f.id} film={f} index={i} isMusic={isMusic} tab={activeTab} onToggle={toggleWatched} onRemove={removeItem}/>)}</div></div>)}
          </>
        ) : activeGame===null ? (
          <GamesMenu scores={listData.scores||{}} onSelect={setActiveGame}/>
        ) : activeGame==="tris" ? (
          <TrisGame gameData={listData.games?.tris} scores={listData.scores||{}} roomCode={roomCode} onUpdate={s=>updateGame("tris",s)} onUpdateScores={updateScores} onBack={()=>setActiveGame(null)}/>
        ) : activeGame==="forza4" ? (
          <Forza4Game gameData={listData.games?.forza4} scores={listData.scores||{}} onUpdate={s=>updateGame("forza4",s)} onUpdateScores={updateScores} onBack={()=>setActiveGame(null)}/>
        ) : activeGame==="mine" ? (
          <MineGame gameData={listData.games?.mine} scores={listData.scores||{}} onUpdate={s=>updateGame("mine",s)} onUpdateScores={updateScores} onBack={()=>setActiveGame(null)}/>
        ) : activeGame==="sudoku" ? (
          <SudokuGame gameData={listData.games?.sudoku} scores={listData.scores||{}} onUpdate={s=>updateGame("sudoku",s)} onUpdateScores={updateScores} onBack={()=>setActiveGame(null)}/>
        ) : null}
      </div>

      {showNotes&&(
        <div className="notes-overlay" onClick={e=>e.target.className==="notes-overlay"&&setShowNotes(false)}>
          <div className="notes-popup">
            <div className="notes-header"><span className="notes-header-title">📝 Note condivise</span><button className="notes-close" onClick={()=>setShowNotes(false)}>✕</button></div>
            <div className="notes-body">
              <div className="notes-tabs-vertical">
                {localNotes.tabs.map((t,i)=><button key={i} className={`notes-tab-v${notesTab===i?" active":""}`} onClick={()=>setNotesTab(i)} title={t}>{t}</button>)}
              </div>
              <div className="notes-content">
                <div className="notes-tab-label-row"><input className="notes-tab-label-input" value={localNotes.tabs[notesTab]} onChange={e=>updateNoteTab(notesTab,e.target.value)} placeholder="Nome linguetta…"/></div>
                <textarea className="notes-textarea" value={localNotes.contents[notesTab]} onChange={e=>updateNoteContent(notesTab,e.target.value)} placeholder="Scrivi qui le tue note…"/>
                <div className="notes-save-row"><button className="notes-save-btn" onClick={saveNotes}>Salva note</button></div>
              </div>
            </div>
          </div>
        </div>
      )}
      {toast&&<div key={toastKey} className="toast">{toast}</div>}
    </>
  );
}

// ---- COMPONENTS ----
function MusicCover({url,size}){const[err,setErr]=useState(false);if(!url||err)return<div className={size==="sq"?"result-poster-ph-sq":"poster-ph-sq"}>🎵</div>;return<img src={url} alt="" className={size==="sq"?"result-poster-sq":"card-poster-sq"} onError={()=>setErr(true)}/>;}

function Card({film,index,isMusic,tab,onToggle,onRemove}){
  const[imgErr,setImgErr]=useState(false);
  const emoji={film:"🎬",serie:"📺",musica:"🎵"};
  return(
    <div className={`card${film.watched?" watched":""}`} style={{animationDelay:`${index*0.05}s`}}>
      <div className={`card-check${film.watched?" on":""}`} onClick={()=>onToggle(film.id)}>{film.watched&&<span className="checkmark">✓</span>}</div>
      <button className="card-del" onClick={()=>onRemove(film.id)}>✕</button>
      {isMusic?film.poster&&!imgErr?<img src={film.poster} alt={film.title} className="card-poster-sq" onError={()=>setImgErr(true)}/>:<div className="poster-ph-sq">🎵</div>:film.poster&&!imgErr?<img src={film.poster} alt={film.title} className="card-poster" onError={()=>setImgErr(true)}/>:<div className="poster-ph">{emoji[tab]}</div>}
      <div className="card-info"><div className="card-title">{film.title}</div><div className="card-year">{isMusic&&film.original_title?film.original_title:film.year}</div></div>
    </div>
  );
}

function GamesMenu({scores,onSelect}){
  const games=[{key:"tris",emoji:"⭕",name:"Tris"},{key:"forza4",emoji:"🟡",name:"Forza 4"},{key:"mine",emoji:"💣",name:"Campo Minato"},{key:"sudoku",emoji:"🔢",name:"Sudoku"}];
  return(
    <div className="games-section">
      <div className="section-label">🎮 Giochi</div>
      <div className="games-grid">
        {games.map(g=>(
          <div key={g.key} className="game-card" onClick={()=>onSelect(g.key)}>
            <div className="game-card-emoji">{g.emoji}</div>
            <div className="game-card-name">{g.name}</div>
            <div className="game-card-score">{scores[g.key]?.p1||0} — {scores[g.key]?.p2||0}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// TRIS
function TrisGame({gameData,scores,onUpdate,onUpdateScores,onBack}){
  const init={board:Array(9).fill(null),turn:"p1",winner:null,line:[]};
  const state=gameData&&gameData.board?gameData:init;
  const sc=scores.tris||{p1:0,p2:0};

  const handleClick=async i=>{
    if(state.winner||state.board[i])return;
    const board=[...state.board];
    board[i]=state.turn;
    const res=checkTrisWinner(board);
    const draw=!res&&board.every(Boolean);
    const newState={board,turn:state.turn==="p1"?"p2":"p1",winner:res?state.turn:draw?"draw":null,line:res?res.line:[]};
    if(res){const newSc={...sc,[state.turn]:(sc[state.turn]||0)+1};await onUpdateScores({...scores,tris:newSc});}
    await onUpdate(newState);
  };

  const reset=async()=>onUpdate(init);

  const symb={p1:"⭕",p2:"❌"};
  const turnMsg=state.winner?state.winner==="draw"?"Pareggio! 🤝":`Ha vinto ${symb[state.winner]}!`:state.turn==="p1"?"Tocca a te! ⭕":"Tocca all'altro! ❌";

  return(
    <div className="game-screen">
      <button className="game-back" onClick={onBack}>← Giochi</button>
      <div className="game-title">Tris ⭕</div>
      <div className="game-scores"><div className="score-box"><div className="score-label">⭕</div><div className="score-val">{sc.p1||0}</div></div><div className="score-sep"/><div className="score-box"><div className="score-label">❌</div><div className="score-val">{sc.p2||0}</div></div></div>
      <div className="tris-board">
        {state.board.map((v,i)=>(
          <div key={i} className={`tris-cell${v?" taken":""}${state.line?.includes(i)?" win":""}`} onClick={()=>handleClick(i)}>{v?symb[v]:""}</div>
        ))}
      </div>
      <button className="reset-btn" onClick={reset}>Nuova partita</button>
      <div className={`turn-banner${state.turn==="p2"&&!state.winner?" their":""}`}>{turnMsg}</div>
    </div>
  );
}

// FORZA 4
function Forza4Game({gameData,scores,onUpdate,onUpdateScores,onBack}){
  const ROWS=6,COLS=7;
  const init={board:Array(ROWS*COLS).fill(null),turn:"p1",winner:null,winCells:[]};
  const state=gameData&&gameData.board?gameData:init;
  const sc=scores.forza4||{p1:0,p2:0};

  const handleClick=async col=>{
    if(state.winner)return;
    let row=-1;
    for(let r=ROWS-1;r>=0;r--){if(!state.board[r*COLS+col]){row=r;break;}}
    if(row===-1)return;
    const board=[...state.board];board[row*COLS+col]=state.turn;
    const res=checkF4Winner(board,ROWS,COLS);
    const draw=!res&&board.every(Boolean);
    const newState={board,turn:state.turn==="p1"?"p2":"p1",winner:res?state.turn:draw?"draw":null,winCells:res?res.cells:[]};
    if(res){const newSc={...sc,[state.turn]:(sc[state.turn]||0)+1};await onUpdateScores({...scores,forza4:newSc});}
    await onUpdate(newState);
  };

  const reset=async()=>onUpdate(init);
  const turnMsg=state.winner?state.winner==="draw"?"Pareggio! 🤝":`Ha vinto ${state.winner==="p1"?"⚪":"🟡"}!`:state.turn==="p1"?"Tocca a te! ⚪":"Tocca all'altro! 🟡";

  return(
    <div className="game-screen">
      <button className="game-back" onClick={onBack}>← Giochi</button>
      <div className="game-title">Forza 4 🟡</div>
      <div className="game-scores"><div className="score-box"><div className="score-label">⚪</div><div className="score-val">{sc.p1||0}</div></div><div className="score-sep"/><div className="score-box"><div className="score-label">🟡</div><div className="score-val">{sc.p2||0}</div></div></div>
      <div className="f4-board">
        {Array(ROWS*COLS).fill(null).map((_,i)=>{
          const v=state.board[i];
          return<div key={i} className={`f4-cell${v?` ${v}`:""}${state.winCells?.includes(i)?" win":""}`} onClick={()=>handleClick(i%COLS)}/>;
        })}
      </div>
      <button className="reset-btn" onClick={reset}>Nuova partita</button>
      <div className={`turn-banner${state.turn==="p2"&&!state.winner?" their":""}`}>{turnMsg}</div>
    </div>
  );
}

// CAMPO MINATO
function MineGame({gameData,scores,onUpdate,onUpdateScores,onBack}){
  const ROWS=9,COLS=9,MINES=10;
  const initBoard=()=>generateMineBoard(ROWS,COLS,MINES);
  const init={board:initBoard(),turn:"p1",flagMode:false,status:"playing"};
  const state=gameData&&gameData.board?gameData:init;
  const sc=scores.mine||{p1:0,p2:0};

  const handleClick=async i=>{
    if(state.status!=="playing")return;
    const cell=state.board[i];
    if(state.flagMode){
      if(cell.revealed)return;
      const board=state.board.map((c,idx)=>idx===i?{...c,flagged:!c.flagged}:c);
      await onUpdate({...state,board});return;
    }
    if(cell.revealed||cell.flagged)return;
    if(cell.mine){
      const board=state.board.map((c,idx)=>idx===i?{...c,revealed:true}:c);
      const nextTurn=state.turn==="p1"?"p2":"p1";
      await onUpdate({...state,board,turn:nextTurn,status:"playing"});return;
    }
    const board=revealCells([...state.board],i,ROWS,COLS);
    const allSafe=board.every(c=>c.mine||c.revealed);
    if(allSafe){
      const newSc={...sc,[state.turn]:(sc[state.turn]||0)+1};
      await onUpdateScores({...scores,mine:newSc});
      await onUpdate({...state,board,status:"won"});
    } else {
      await onUpdate({...state,board});
    }
  };

  const reset=async()=>onUpdate({board:initBoard(),turn:"p1",flagMode:false,status:"playing"});
  const toggleFlag=async()=>onUpdate({...state,flagMode:!state.flagMode});

  const flagged=state.board.filter(c=>c.flagged).length;
  const turnMsg=state.status==="won"?`Ha vinto ${state.turn==="p1"?"⚪":"🟤"}! 🎉`:state.turn==="p1"?"Tocca a te!":"Tocca all'altro!";

  const numColors=["","n1","n2","n3","n4","n5","n6","n7","n8"];

  return(
    <div className="game-screen">
      <button className="game-back" onClick={onBack}>← Giochi</button>
      <div className="game-title">Campo Minato 💣</div>
      <div className="game-scores"><div className="score-box"><div className="score-label">⚪</div><div className="score-val">{sc.p1||0}</div></div><div className="score-sep"/><div className="score-box"><div className="score-label">🟤</div><div className="score-val">{sc.p2||0}</div></div></div>
      <div className="mine-info">
        <span>💣 {MINES-flagged}</span>
        <button className={`mine-flag-btn${state.flagMode?" active":""}`} onClick={toggleFlag}>{state.flagMode?"🚩 Flag ON":"🚩 Flag OFF"}</button>
      </div>
      <div className="mine-board" style={{gridTemplateColumns:`repeat(${COLS},1fr)`}}>
        {state.board.map((c,i)=>(
          <div key={i} className={`mine-cell${c.revealed?" revealed":""}${c.revealed&&c.mine?" mine-hit":""}${c.flagged?" flagged":""}${c.revealed&&c.count>0?` ${numColors[c.count]}`:""}`} onClick={()=>handleClick(i)}>
            {c.flagged&&!c.revealed?"🚩":c.revealed&&c.mine?"💥":c.revealed&&c.count>0?c.count:""}
          </div>
        ))}
      </div>
      <button className="reset-btn" onClick={reset}>Nuova partita</button>
      <div className={`turn-banner${state.turn==="p2"&&state.status==="playing"?" their":""}`}>{turnMsg}</div>
    </div>
  );
}

// SUDOKU
function SudokuGame({gameData,scores,onUpdate,onUpdateScores,onBack}){
  const initSudoku=()=>{const{puzzle,solution}=generateSudoku();return{puzzle,solution,board:[...puzzle],turn:"p1",selected:null,errors:0,status:"playing"};};
  const state=gameData&&gameData.puzzle?gameData:initSudoku();
  const sc=scores.sudoku||{p1:0,p2:0};

  const handleSelect=async i=>{
    if(state.board[i]!==0&&state.puzzle[i]!==0)return;
    await onUpdate({...state,selected:i});
  };

  const handleNum=async n=>{
    const i=state.selected;
    if(i===null||state.puzzle[i]!==0||state.status!=="playing")return;
    const board=[...state.board];board[i]=n;
    const correct=state.solution[i]===n;
    let errors=state.errors;
    let turn=state.turn;
    if(!correct){errors++;turn=state.turn==="p1"?"p2":"p1";}
    const solved=board.every((v,idx)=>v===state.solution[idx]);
    if(solved){
      const newSc={...sc,[state.turn]:(sc[state.turn]||0)+1};
      await onUpdateScores({...scores,sudoku:newSc});
      await onUpdate({...state,board,errors,turn,status:"won",selected:null});
    } else {
      await onUpdate({...state,board,errors,turn,selected:i});
    }
  };

  const reset=async()=>onUpdate(initSudoku());
  const turnMsg=state.status==="won"?"Sudoku completato! 🎉":state.turn==="p1"?"Tocca a te!":"Tocca all'altro!";

  return(
    <div className="game-screen">
      <button className="game-back" onClick={onBack}>← Giochi</button>
      <div className="game-title">Sudoku 🔢</div>
      <div className="game-scores"><div className="score-box"><div className="score-label">⚪</div><div className="score-val">{sc.p1||0}</div></div><div className="score-sep"/><div className="score-box"><div className="score-label">🟤</div><div className="score-val">{sc.p2||0}</div></div><div className="score-sep"/><div className="score-box"><div className="score-label">Errori</div><div className="score-val">{state.errors}</div></div></div>
      <div className="sudoku-board">
        {state.board.map((v,i)=>{
          const r=Math.floor(i/9),c=i%9;
          const isGiven=state.puzzle[i]!==0;
          const isSelected=state.selected===i;
          const isError=v!==0&&!isGiven&&v!==state.solution[i];
          const boxR=Math.floor(r/3)*3+2,boxC=Math.floor(c/3)*3+2;
          return(
            <div key={i} className={`sudoku-cell${isGiven?" given":""}${isSelected?" selected":""}${isError?" error":""}${c===boxC&&c!==8?" box-right":""}${r===boxR&&r!==8?" box-bottom":""}`} onClick={()=>handleSelect(i)}>
              {v||""}
            </div>
          );
        })}
      </div>
      <div className="sudoku-numpad">
        {[1,2,3,4,5,6,7,8,9,0].map(n=>(
          <div key={n} className="sudoku-num" onClick={()=>handleNum(n)}>{n===0?"✕":n}</div>
        ))}
      </div>
      <button className="reset-btn" onClick={reset}>Nuova partita</button>
      <div className={`turn-banner${state.turn==="p2"&&state.status==="playing"?" their":""}`}>{turnMsg}</div>
    </div>
  );
}
