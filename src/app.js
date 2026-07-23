const $ = (selector) => document.querySelector(selector);
const state = { stories: [], query: '', tag: '', favoritesOnly: false, active: null, fontStep: Number(localStorage.getItem('storykeeper-font') || 0), favorites: new Set(JSON.parse(localStorage.getItem('storykeeper-favorites') || '[]')) };
const colors = { sun:'#f5bd55',coral:'#df7068',mint:'#78a18a',moon:'#65769e',sky:'#9ccfca',plum:'#9b78a6' };
const escapeHtml = (text) => String(text).replace(/[&<>"]/g,(char)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));

async function loadStories(){
  const response = await fetch('./data/stories.json');
  if(!response.ok) throw new Error('Story shelf unavailable');
  state.stories = await response.json();
  renderTags(); renderStories();
}

function searchable(story){ return [story.title,story.summary,story.purpose,...story.heroes,...story.villains,...story.tags].join(' ').toLowerCase(); }
function filtered(){ return state.stories.filter((story)=>searchable(story).includes(state.query) && (!state.tag || story.tags.includes(state.tag)) && (!state.favoritesOnly || state.favorites.has(story.id))); }
function renderTags(){
  const tags=[...new Set(state.stories.flatMap((story)=>story.tags))].slice(0,8);
  $('#tagFilters').innerHTML=tags.map((tag)=>`<button type="button" data-tag="${escapeHtml(tag)}" aria-pressed="false">${escapeHtml(tag.replaceAll('-',' '))}</button>`).join('');
  $('#tagFilters').addEventListener('click',(event)=>{const button=event.target.closest('button');if(!button)return;state.tag=state.tag===button.dataset.tag?'':button.dataset.tag;document.querySelectorAll('[data-tag]').forEach((item)=>item.setAttribute('aria-pressed',String(item.dataset.tag===state.tag)));renderStories();});
}
function renderStories(){
  const stories=filtered(); $('#resultCount').textContent=`${stories.length} ${stories.length===1?'story':'stories'}`; $('#emptyState').hidden=stories.length>0;
  $('#storyGrid').innerHTML=stories.map((story)=>`<article class="story-card"><div class="story-card-cover" style="--card-color:${colors[story.accent]||colors.sun}"><button class="heart" type="button" data-favorite="${story.id}" aria-label="${state.favorites.has(story.id)?'Remove from':'Add to'} favorites" aria-pressed="${state.favorites.has(story.id)}">${state.favorites.has(story.id)?'♥':'♡'}</button><span aria-hidden="true">${escapeHtml(story.symbol)}</span></div><div class="story-card-content"><span class="story-meta">${story.readingMinutes} min · ${escapeHtml(story.tags[0]||'adventure')}</span><h3>${escapeHtml(story.title)}</h3><p>${escapeHtml(story.summary)}</p><button class="read-button" type="button" data-id="${story.id}">Read story →</button></div></article>`).join('');
}
function toggleFavorite(id){ state.favorites.has(id)?state.favorites.delete(id):state.favorites.add(id);localStorage.setItem('storykeeper-favorites',JSON.stringify([...state.favorites]));renderStories();if(state.active?.id===id)updateReaderFavorite(); }
function openStory(story){
  if(!story)return; state.active=story; $('#readerMeta').textContent=`${story.readingMinutes} minute adventure · ${story.heroes.join(', ')}`;$('#readerTitle').textContent=story.title;$('#readerPurpose').textContent=story.purpose;$('#readerBody').innerHTML=story.body.map((p)=>`<p>${escapeHtml(p)}</p>`).join('');updateReaderFavorite();applyFont();$('#readerDialog').showModal();history.replaceState(null,'',`#${story.id}`);$('#readerDialog').scrollTop=0;
}
function closeStory(){speechSynthesis.cancel();$('#listenButton').textContent='▶ Listen';$('#readerDialog').close();history.replaceState(null,'',location.pathname+location.search);}
function updateReaderFavorite(){const saved=state.favorites.has(state.active.id);$('#readerFavorite').setAttribute('aria-pressed',String(saved));$('#readerFavorite').textContent=saved?'♥ Saved':'♡ Save';}
function applyFont(){document.documentElement.style.setProperty('--reader-size',`${1.15+state.fontStep*.12}rem`);localStorage.setItem('storykeeper-font',String(state.fontStep));}
function speak(){ if(!state.active||!('speechSynthesis'in window))return; if(speechSynthesis.speaking){speechSynthesis.cancel();$('#listenButton').textContent='▶ Listen';return;}const utterance=new SpeechSynthesisUtterance(`${state.active.title}. ${state.active.body.join(' ')}`);utterance.rate=.9;utterance.onend=()=>$('#listenButton').textContent='▶ Listen';speechSynthesis.speak(utterance);$('#listenButton').textContent='■ Stop'; }

$('#searchInput').addEventListener('input',(event)=>{state.query=event.target.value.trim().toLowerCase();renderStories();});
$('#storyGrid').addEventListener('click',(event)=>{const favorite=event.target.closest('[data-favorite]');if(favorite){toggleFavorite(favorite.dataset.favorite);return;}const read=event.target.closest('[data-id]');if(read)openStory(state.stories.find((story)=>story.id===read.dataset.id));});
$('#surpriseButton').addEventListener('click',()=>openStory(state.stories[Math.floor(Math.random()*state.stories.length)]));
$('#featuredButton').addEventListener('click',()=>openStory(state.stories[0]));
$('#favoritesButton').addEventListener('click',()=>{state.favoritesOnly=!state.favoritesOnly;$('#favoritesButton').setAttribute('aria-pressed',String(state.favoritesOnly));$('#favoritesButton').textContent=state.favoritesOnly?'♥ All stories':'♡ Favorites';renderStories();});
$('#clearButton').addEventListener('click',()=>{state.query='';state.tag='';state.favoritesOnly=false;$('#searchInput').value='';$('#favoritesButton').setAttribute('aria-pressed','false');$('#favoritesButton').textContent='♡ Favorites';document.querySelectorAll('[data-tag]').forEach((button)=>button.setAttribute('aria-pressed','false'));renderStories();});
$('#themeButton').addEventListener('click',()=>{const night=document.body.classList.toggle('night');localStorage.setItem('storykeeper-theme',night?'night':'day');$('#themeButton').textContent=night?'☀':'☾';$('#themeButton').ariaLabel=night?'Switch to daylight colors':'Switch to bedtime colors';});
$('#closeReader').addEventListener('click',closeStory);$('#readerDialog').addEventListener('click',(event)=>{if(event.target===$('#readerDialog'))closeStory();});
$('#listenButton').addEventListener('click',speak);$('#readerFavorite').addEventListener('click',()=>toggleFavorite(state.active.id));
$('#smallerText').addEventListener('click',()=>{state.fontStep=Math.max(-2,state.fontStep-1);applyFont();});$('#largerText').addEventListener('click',()=>{state.fontStep=Math.min(4,state.fontStep+1);applyFont();});
$('#readerDialog').addEventListener('scroll',()=>{const dialog=$('#readerDialog');const max=dialog.scrollHeight-dialog.clientHeight;$('#readingProgress').style.width=`${max?Math.min(100,dialog.scrollTop/max*100):0}%`;});
if(localStorage.getItem('storykeeper-theme')==='night'){$('body').classList.add('night');$('#themeButton').textContent='☀';}
loadStories().then(()=>{const id=location.hash.slice(1);if(id)openStory(state.stories.find((story)=>story.id===id));}).catch(()=>{$('#storyGrid').innerHTML='<p>Our story shelf is resting. Please try again soon.</p>';});
