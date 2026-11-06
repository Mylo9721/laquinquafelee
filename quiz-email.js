(function(){
"use strict";
const ELEMENTS = ['eau', 'feu', 'terre', 'air'];
const CONSENT_VERSION = '2026-11-06-public-v1';
const PROFILES = {
  eau: { name: 'Eau', subtitle: 'L’émotion en circulation', color: '#327983', pale: '#e7f2f0', word: 'Déposer', symbol: '≈',
    text: 'Vos réponses font ressortir une sensibilité à ce qui se vit intérieurement et dans vos relations. Vous pouvez avoir besoin de lien, d’écoute et d’espaces où déposer ce qui s’accumule.',
    strength: 'L’empathie, l’intuition et la capacité à créer du lien.', need: 'Vous soutenir autant que vous soutenez les autres.',
    gesture: 'Prenez cinq minutes pour écrire ce qui vous pèse, puis choisissez une personne de confiance à qui en parler.',
    work: 'Identifiez une personne ressource ou un espace de parole où vous pouvez demander du soutien.',
    signature: 'Votre sensibilité mérite une place et de la douceur.' },
  feu: { name: 'Feu', subtitle: 'L’intense en transformation', color: '#ad513b', pale: '#fbede3', word: 'Ralentir', symbol: '◒',
    text: 'Vos réponses font ressortir de l’intensité, de la réactivité et un besoin d’agir ou de reprendre la main lorsque quelque chose vous bouscule.',
    strength: 'La détermination, le courage et la capacité à initier le changement.', need: 'Préserver votre élan en vous accordant des pauses.',
    gesture: 'Avant de répondre à une sollicitation, posez les pieds au sol et prenez quelques respirations naturelles, sans forcer.',
    work: 'Créez une courte pause entre deux sollicitations et formulez une limite concrète.',
    signature: 'Votre feu peut vous porter sans vous consumer.' },
  terre: { name: 'Terre', subtitle: 'L’ancrée en rééquilibrage', color: '#637c4f', pale: '#eef1e5', word: 'Alléger', symbol: '▱',
    text: 'Vos réponses font ressortir un besoin de stabilité, de continuité et de sécurité. Vous pouvez avoir tendance à tenir et à continuer malgré la fatigue.',
    strength: 'La fiabilité, la constance et la capacité à rassurer.', need: 'Vous autoriser à ralentir et à partager ce que vous portez.',
    gesture: 'Choisissez une tâche à alléger ou à déléguer aujourd’hui. Accordez-vous une pause adaptée à votre énergie.',
    work: 'Repérez une charge qui pourrait être partagée et préparez une demande précise.',
    signature: 'Prendre soin de votre base, c’est aussi avancer.' },
  air: { name: 'Air', subtitle: 'La mobile en quête d’ancrage', color: '#82739c', pale: '#f0ebf5', word: 'Recentrer', symbol: '≋',
    text: 'Vos réponses font ressortir du mouvement, de l’adaptation et une activité mentale importante. Lorsque les sollicitations augmentent, cette mobilité peut se transformer en dispersion.',
    strength: 'La curiosité, la vivacité et la capacité à relier les idées.', need: 'Retrouver un point d’ancrage et réduire les sollicitations.',
    gesture: 'Déposez vos pensées sur papier et choisissez une seule petite action à réaliser maintenant.',
    work: 'Protégez un court moment de calme et réduisez les interruptions pour une tâche.',
    signature: 'Vous pouvez simplifier pour retrouver de l’espace.' }
};
function analyzeScores(scores) {
  if (!scores || typeof scores !== 'object' || Array.isArray(scores) || Object.keys(scores).length !== 4 || ELEMENTS.some(k => !Number.isInteger(scores[k]) || scores[k] < 0 || scores[k] > 12) || ELEMENTS.reduce((n,k)=>n+scores[k],0)!==12) throw new Error('Le total doit être de 12 réponses, réparties entre les quatre éléments.');
  const max = Math.max(...ELEMENTS.map(k => scores[k]));
  const min = Math.min(...ELEMENTS.map(k => scores[k]));
  const dominant = ELEMENTS.filter(k => scores[k] === max);
  const weak = dominant.length === 4 ? [] : ELEMENTS.filter(k => scores[k] === min);
  const secondary = ELEMENTS.filter(k => scores[k] < max && scores[k] > min).sort((a,b)=>scores[b]-scores[a]);
  const type = dominant.length === 4 ? 'equilibre' : dominant.length === 3 ? 'composite' : dominant.length === 2 ? 'partage' : 'dominant';
  const names=dominant.map(k=>PROFILES[k].name).join(' · ');
  const title = type === 'equilibre' ? 'Vos quatre éléments à l’équilibre' : type === 'dominant' ? 'Votre profil '+names : type === 'composite' ? 'Votre profil composite '+names : 'Votre dominante partagée '+names;
  return { scores: {...scores}, dominant, weak, secondary, type, title, percentages: Object.fromEntries(ELEMENTS.map(k=>[k,Math.round(scores[k]/12*1000)/10])) };
}
function scoreAnswers(answers) {
  if (!Array.isArray(answers) || answers.length !== 12 || answers.some(a=>!['A','B','C','D'].includes(a))) throw new Error('Répondez aux 12 questions avant de voir votre profil.');
  const scores={eau:0,feu:0,terre:0,air:0};
  answers.forEach(a=>scores[ELEMENTS[['A','B','C','D'].indexOf(a)]]++);
  return analyzeScores(scores);
}


let current=null, generation=0;
const get=id=>document.getElementById(id);
try { localStorage.removeItem('lqf_email');localStorage.removeItem('lqf_prenom'); } catch {}
function validateStart(){
 const email=get('lqf-email').value.trim(), error=get('lqf-start-error');error.textContent='';
 if(email && !get('lqf-email').checkValidity()){error.textContent='Vérifiez votre adresse e-mail.';get('lqf-email').focus();return false;}
 if(email && !get('lqf-mail-consent').checked){error.textContent='Votre accord est nécessaire pour recevoir la fiche. Vous pouvez aussi effacer l’adresse et continuer sans envoi.';return false;}
 if(!email && get('lqf-mail-consent').checked){error.textContent='Renseignez votre adresse pour recevoir la fiche, ou décochez la case pour continuer sans envoi.';return false;}
 return true;
}
function displayProfile(result){
 const names=result.dominant.map(k=>PROFILES[k].name).join(' · ');
 get('dominantTitle').textContent=names;
 get('dominantLabel').textContent=result.type==='equilibre'?'Quatre dynamiques à parts égales':result.dominant.length>1?'Dominante partagée':'Votre profil du moment';
 get('dominantSubtitle').textContent=result.dominant.length===1?PROFILES[result.dominant[0]].subtitle:'Toutes les dynamiques à égalité sont conservées.';
 get('dominantDesc').textContent=result.dominant.map(k=>PROFILES[k].text).join(' ');
 const card=get('dominantCard');card.className='dominant-card'+(result.dominant.length===1?' '+result.dominant[0]:'');
 card.style.background=result.dominant.length===1?PROFILES[result.dominant[0]].pale:'#f5eef3';
 card.setAttribute?.('data-symbol',result.dominant.length===1?PROFILES[result.dominant[0]].symbol:'');
 get('plantesCard').hidden=true;
 const advice=get('adviceList');advice.replaceChildren();
 for(const k of [...result.dominant,...result.secondary,...result.weak].slice(0,3)){const li=document.createElement('li');li.textContent=PROFILES[k].gesture;advice.appendChild(li);}
 for(const k of ELEMENTS){const suffix=k[0].toUpperCase()+k.slice(1);get('bar'+suffix).style.width=result.percentages[k]+'%';get('pct'+suffix).textContent=result.percentages[k].toLocaleString('fr-FR')+' %';}
 get('lqf-signature').textContent=result.dominant.length===1?PROFILES[result.dominant[0]].signature:'Votre résultat garde toutes les dynamiques présentes à égalité.';get('lqf-signature').style.display='block';
}
function prepare(scores){
 if(current)return;
 const result=analyzeScores(scores);displayProfile(result);
 const email=get('lqf-email').value.trim(), consent=get('lqf-mail-consent').checked;
 get('lqf-mail-box').hidden=false;get('lqf-mail-retry').hidden=true;get('lqf-drink-box').hidden=true;
 if(!email||!consent){get('lqf-mail-status').textContent='Votre résultat est affiché ici. Aucun envoi par e-mail n’a été demandé.';return;}
 current={generation, sending:false, done:false, body:{email,consent:true,consentVersion:CONSENT_VERSION,idempotencyKey:crypto.randomUUID(),scores:{...scores},requestedAt:new Date().toISOString()}};
 if(result.dominant.length===1){current.body.drinkElement=result.dominant[0];send();}
 else {
  get('lqf-mail-status').textContent='Plusieurs éléments sont à égalité : choisissez une pause tisane pour préparer votre fiche unique.';
  const box=get('lqf-drink-choices');box.replaceChildren();get('lqf-drink-box').hidden=false;
  for(const k of result.dominant){const b=document.createElement('button');b.type='button';b.className='btn btn-prev';b.textContent=PROFILES[k].name;b.addEventListener('click',()=>{if(!current||current.sending||current.done)return;current.body.drinkElement=k;get('lqf-drink-box').hidden=true;return send();});box.appendChild(b);}
 }
}
async function send(){
 const job=current;if(!job||job.sending||job.done)return;job.sending=true;
 get('lqf-mail-retry').hidden=true;get('lqf-mail-status').textContent='Préparation de votre PDF et demande d’envoi en cours…';
 try{
  const response=await fetch('https://lqf-quiz-menopause.laquinquafelee.workers.dev/quiz-result',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(job.body),signal:AbortSignal.timeout(60000)});
  const data=await response.json();if(job.generation!==generation||current!==job)return;
  if(response.ok&&data.status==='accepted'&&typeof data.receiptId==='string'&&data.receiptId){job.done=true;get('lqf-mail-status').textContent='Votre envoi a été accepté par le service. La réception reste à confirmer : vérifiez votre boîte de réception et les courriers indésirables. Un seul PDF personnel de trois pages est joint.';}
  else {get('lqf-mail-status').textContent=data.message||'Aucun envoi n’est confirmé. Vous pouvez réessayer avec la même demande.';get('lqf-mail-retry').hidden=false;}
 }catch{if(job.generation!==generation||current!==job)return;get('lqf-mail-status').textContent='Aucun envoi n’est confirmé. Vérifiez votre boîte avant de réessayer avec la même demande.';get('lqf-mail-retry').hidden=false;}
 finally{job.sending=false;}
}
function reset(){generation++;current=null;get('lqf-email').value='';get('lqf-prenom').value='';get('lqf-mail-consent').checked=false;get('lqf-start-error').textContent='';get('lqf-mail-box').hidden=true;get('lqf-drink-box').hidden=true;get('lqf-mail-retry').hidden=true;}
get('lqf-mail-retry').addEventListener('click',send);
window.LQFMail={validateStart,prepare,reset};

})();
