/* Canada Road Signs PWA — Offline + Multilingual + Quiz */

const $ = (sel) => document.querySelector(sel);

const LS = {
  learned: "crs_learned_v4",
  starred: "crs_starred_v4",
  lang: "crs_lang_v2"
};

function loadSet(key){
  try{
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  }catch{
    return new Set();
  }
}
function saveSet(key, set){
  localStorage.setItem(key, JSON.stringify([...set]));
}

const learnedSet = loadSet(LS.learned);
const starredSet = loadSet(LS.starred);

const state = {
  view: "browse",
  search: "",
  category: "all",
  onlyStarred: false,
  onlyLearned: false,
  lang: (localStorage.getItem(LS.lang) || "en"),
  quiz: {
    running: false,
    mode: "meaning",
    category: "all",
    current: null,
    choices: [],
    score: 0,
    streak: 0,
    qnum: 0,
    locked: false
  }
};

/* -------------------------
   i18n UI strings
-------------------------- */
const I18N = {
  en: {
    browse: "Browse",
    quiz: "Quiz",
    progress: "Progress",
    offlineReady: "Offline-ready PWA",
    swOk: "Installed service worker ✓",
    swNo: "Service worker not active",
    searchPh: "Search (e.g., stop, yield, school, lane)",
    allCats: "All categories",
    starred: "Starred",
    learned: "Learned",
    resetFilters: "Reset filters",
    noMatch: "No signs match your search.",
    tapToLearn: "Tap to learn",
    learnedBadge: "Learned ✓",
    markLearned: "Mark Learned",
    unmarkLearned: "Unmark Learned",
    quizPickMeaning: "Pick the meaning",
    quizPickName: "Pick the sign name",
    quizPickCategory: "Pick the category",
    start: "Start",
    score: "Score",
    streak: "Streak",
    question: "Question",
    pressStart: "Press Start",
    chooseCorrect: "Choose the correct answer",
    skip: "Skip",
    reveal: "Reveal",
    next: "Next",
    ans: "Answer",
    correct: "✅ Correct!",
    notQuite: "❌ Not quite.",
    clearProgress: "Clear progress",
    tip: "Tip: In Browse mode, tap a card to mark it “Learned”, and use ⭐ to star it."
  },

  fr: {
    browse: "Parcourir",
    quiz: "Quiz",
    progress: "Progrès",
    offlineReady: "Application PWA hors ligne",
    swOk: "Service worker installé ✓",
    swNo: "Service worker inactif",
    searchPh: "Rechercher (ex: arrêt, cédez, école, voie)",
    allCats: "Toutes les catégories",
    starred: "Favoris",
    learned: "Appris",
    resetFilters: "Réinitialiser",
    noMatch: "Aucun panneau ne correspond à votre recherche.",
    tapToLearn: "Touchez pour apprendre",
    learnedBadge: "Appris ✓",
    markLearned: "Marquer appris",
    unmarkLearned: "Retirer appris",
    quizPickMeaning: "Choisir la signification",
    quizPickName: "Choisir le nom du panneau",
    quizPickCategory: "Choisir la catégorie",
    start: "Démarrer",
    score: "Score",
    streak: "Série",
    question: "Question",
    pressStart: "Appuyez sur Démarrer",
    chooseCorrect: "Choisissez la bonne réponse",
    skip: "Passer",
    reveal: "Révéler",
    next: "Suivant",
    ans: "Réponse",
    correct: "✅ Correct !",
    notQuite: "❌ Pas tout à fait.",
    clearProgress: "Effacer les progrès",
    tip: "Astuce : en mode Parcourir, touchez une carte pour la marquer “Appris”, et utilisez ⭐ pour l’ajouter aux favoris."
  },

  sw: {
    browse: "Vinjari",
    quiz: "Maswali",
    progress: "Maendeleo",
    offlineReady: "Programu ya PWA bila intaneti",
    swOk: "Service worker imewekwa ✓",
    swNo: "Service worker haifanyi kazi",
    searchPh: "Tafuta (mf: simama, toa njia, shule, njia ya barabara)",
    allCats: "Makundi yote",
    starred: "Uliyoipenda",
    learned: "Umejifunza",
    resetFilters: "Weka upya vichujio",
    noMatch: "Hakuna alama zinazolingana na utafutaji wako.",
    tapToLearn: "Gusa kujifunza",
    learnedBadge: "Umejifunza ✓",
    markLearned: "Weka kama umejifunza",
    unmarkLearned: "Ondoa (umejifunza)",
    quizPickMeaning: "Chagua maana",
    quizPickName: "Chagua jina la alama",
    quizPickCategory: "Chagua kundi",
    start: "Anza",
    score: "Alama",
    streak: "Mfululizo",
    question: "Swali",
    pressStart: "Bonyeza Anza",
    chooseCorrect: "Chagua jibu sahihi",
    skip: "Ruka",
    reveal: "Onyesha jibu",
    next: "Ifuatayo",
    ans: "Jibu",
    correct: "✅ Sahihi!",
    notQuite: "❌ Sio hivyo.",
    clearProgress: "Futa maendeleo",
    tip: "Kidokezo: Ukiwa kwenye Vinjari, gusa kadi kuiweka “Umejifunza”, na tumia ⭐ kuiweka kwenye uliyoipenda."
  },

  ar: {
    browse: "تصفح",
    quiz: "اختبار",
    progress: "التقدم",
    offlineReady: "تطبيق يعمل دون إنترنت",
    swOk: "تم تثبيت Service Worker ✓",
    swNo: "Service Worker غير نشط",
    searchPh: "ابحث (مثال: توقف، أعطِ الطريق، مدرسة، مسار)",
    allCats: "كل الفئات",
    starred: "المفضلة",
    learned: "متقن",
    resetFilters: "إعادة ضبط",
    noMatch: "لا توجد إشارات تطابق بحثك.",
    tapToLearn: "اضغط للتعلم",
    learnedBadge: "متقن ✓",
    markLearned: "وضع كمتقن",
    unmarkLearned: "إزالة (متقن)",
    quizPickMeaning: "اختر المعنى",
    quizPickName: "اختر اسم الإشارة",
    quizPickCategory: "اختر الفئة",
    start: "ابدأ",
    score: "النقاط",
    streak: "سلسلة",
    question: "سؤال",
    pressStart: "اضغط ابدأ",
    chooseCorrect: "اختر الإجابة الصحيحة",
    skip: "تخطي",
    reveal: "إظهار الإجابة",
    next: "التالي",
    ans: "الإجابة",
    correct: "✅ صحيح!",
    notQuite: "❌ ليس تمامًا.",
    clearProgress: "مسح التقدم",
    tip: "نصيحة: في وضع التصفح، اضغط البطاقة لوضعها “متقن”، واستخدم ⭐ لإضافتها للمفضلة."
  },

  zh: {
    browse: "浏览",
    quiz: "测验",
    progress: "进度",
    offlineReady: "离线可用 PWA",
    swOk: "已安装 Service Worker ✓",
    swNo: "Service Worker 未启用",
    searchPh: "搜索（如：停止、让行、学校、车道）",
    allCats: "所有类别",
    starred: "收藏",
    learned: "已掌握",
    resetFilters: "重置筛选",
    noMatch: "没有匹配的标志。",
    tapToLearn: "点击学习",
    learnedBadge: "已掌握 ✓",
    markLearned: "标记为已掌握",
    unmarkLearned: "取消已掌握",
    quizPickMeaning: "选择含义",
    quizPickName: "选择标志名称",
    quizPickCategory: "选择类别",
    start: "开始",
    score: "得分",
    streak: "连对",
    question: "题目",
    pressStart: "点击开始",
    chooseCorrect: "请选择正确答案",
    skip: "跳过",
    reveal: "显示答案",
    next: "下一题",
    ans: "答案",
    correct: "✅ 正确！",
    notQuite: "❌ 不对。",
    clearProgress: "清除进度",
    tip: "提示：在浏览模式点击卡片可标记“已掌握”，用 ⭐ 添加到收藏。"
  },

  pt: {
    browse: "Explorar",
    quiz: "Questionário",
    progress: "Progresso",
    offlineReady: "Aplicativo PWA offline",
    swOk: "Service Worker instalado ✓",
    swNo: "Service Worker inativo",
    searchPh: "Pesquisar (ex: parar, ceder, escola, faixa)",
    allCats: "Todas as categorias",
    starred: "Favoritos",
    learned: "Aprendido",
    resetFilters: "Redefinir filtros",
    noMatch: "Nenhuma placa corresponde à busca.",
    tapToLearn: "Toque para aprender",
    learnedBadge: "Aprendido ✓",
    markLearned: "Marcar como aprendido",
    unmarkLearned: "Desmarcar aprendido",
    quizPickMeaning: "Escolher significado",
    quizPickName: "Escolher nome da placa",
    quizPickCategory: "Escolher categoria",
    start: "Iniciar",
    score: "Pontuação",
    streak: "Sequência",
    question: "Pergunta",
    pressStart: "Toque em Iniciar",
    chooseCorrect: "Escolha a resposta correta",
    skip: "Pular",
    reveal: "Mostrar resposta",
    next: "Próxima",
    ans: "Resposta",
    correct: "✅ Correto!",
    notQuite: "❌ Incorreto.",
    clearProgress: "Limpar progresso",
    tip: "Dica: No modo Explorar, toque no cartão para marcar “Aprendido” e use ⭐ para favoritar."
  },

  es: {
    browse: "Explorar",
    quiz: "Cuestionario",
    progress: "Progreso",
    offlineReady: "Aplicación PWA sin internet",
    swOk: "Service Worker instalado ✓",
    swNo: "Service Worker inactivo",
    searchPh: "Buscar (ej: pare, ceda, escuela, carril)",
    allCats: "Todas las categorías",
    starred: "Favoritos",
    learned: "Aprendido",
    resetFilters: "Restablecer filtros",
    noMatch: "No hay señales que coincidan con tu búsqueda.",
    tapToLearn: "Toca para aprender",
    learnedBadge: "Aprendido ✓",
    markLearned: "Marcar como aprendido",
    unmarkLearned: "Quitar aprendido",
    quizPickMeaning: "Elegir significado",
    quizPickName: "Elegir nombre de la señal",
    quizPickCategory: "Elegir categoría",
    start: "Iniciar",
    score: "Puntuación",
    streak: "Racha",
    question: "Pregunta",
    pressStart: "Toca Iniciar",
    chooseCorrect: "Elige la respuesta correcta",
    skip: "Saltar",
    reveal: "Mostrar respuesta",
    next: "Siguiente",
    ans: "Respuesta",
    correct: "✅ ¡Correcto!",
    notQuite: "❌ No es correcto.",
    clearProgress: "Borrar progreso",
    tip: "Consejo: En Explorar, toca una tarjeta para marcarla “Aprendido” y usa ⭐ para guardarla en Favoritos."
  }
};

function t(key){
  return (I18N[state.lang] && I18N[state.lang][key]) || I18N.en[key] || key;
}

/* -------------------------
   Direction + html lang
-------------------------- */
function applyDirAndLang(){
  const isRTL = (state.lang === "ar");
  document.documentElement.dir = isRTL ? "rtl" : "ltr";
  document.documentElement.lang = state.lang;
}

/* -------------------------
   SVG helpers (simple drawings)
-------------------------- */
function svgWrap(inner, w=220, h=140){
  return `
  <svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Road sign">
    ${inner}
  </svg>`;
}

function text(x,y,tv, size=20, weight=800, fill="#0b1220", anchor="middle"){
  const safe = String(tv).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="system-ui,Segoe UI,Arial" font-size="${size}" font-weight="${weight}" fill="${fill}">${safe}</text>`;
}
function rect(x,y,w,h, fill, stroke, sw=6, r=14){
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
}
function diamond(cx, cy, size, fill, stroke, sw=10){
  const s = size;
  const pts = `${cx},${cy-s} ${cx+s},${cy} ${cx},${cy+s} ${cx-s},${cy}`;
  return `<polygon points="${pts}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" />`;
}
function triangleUp(cx, cy, size, fill, stroke, sw=10){
  const s = size;
  const pts = `${cx},${cy-s} ${cx+s},${cy+s} ${cx-s},${cy+s}`;
  return `<polygon points="${pts}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" />`;
}
function octagon(cx, cy, r, fill, stroke, sw=10){
  const a = Math.PI / 8;
  const pts = Array.from({length:8}, (_,i)=>{
    const ang = a + i*(Math.PI/4);
    return `${(cx + r*Math.cos(ang)).toFixed(2)},${(cy + r*Math.sin(ang)).toFixed(2)}`;
  }).join(" ");
  return `<polygon points="${pts}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
}
function circle(cx, cy, r, fill, stroke, sw=10){
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
}
function slash(x1,y1,x2,y2,color="#d21f2b", sw=14){
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`;
}

/* Language-aware labels for sign-face text */
function svgStop(lang="en"){
  const labelMap = { en:"STOP", fr:"ARRÊT", sw:"SIMAMA", ar:"توقف", zh:"停", pt:"PARE", es:"PARE" };
  const label = labelMap[lang] || labelMap.en;
  return svgWrap(`
    ${octagon(110,70,52,"#d21f2b","#ffffff",10)}
    ${text(110,82,label,22,900,"#ffffff")}
  `);
}
function svgYield(lang="en"){
  const labelMap = { en:"YIELD", fr:"CÉDEZ", sw:"TOA NJIA", ar:"أعطِ الطريق", zh:"让行", pt:"DÊ A PREFERÊNCIA", es:"CEDA EL PASO" };
  const label = labelMap[lang] || labelMap.en;
  return svgWrap(`
    ${triangleUp(110,74,58,"#ffffff","#d21f2b",12)}
    <polygon points="110,28 162,124 58,124" fill="none" stroke="#d21f2b" stroke-width="12"/>
    ${text(110,96,label,14,900,"#d21f2b")}
  `);
}

function svgRegRect(labelTop, labelBottom=""){
  return svgWrap(`
    ${rect(40,22,140,96,"#ffffff","#111111",8,14)}
    ${text(110,62,labelTop,22,900,"#111111")}
    ${labelBottom ? text(110,92,labelBottom,22,900,"#111111") : ""}
  `);
}
function svgSpeed(max){
  return svgWrap(`
    ${rect(40,22,140,96,"#ffffff","#111111",8,14)}
    ${text(110,54,"MAXIMUM",16,900,"#111111")}
    ${text(110,78,String(max),34,900,"#111111")}
    ${text(110,98,"km/h",14,800,"#111111")}
  `);
}
function svgNo(symbol="P"){
  return svgWrap(`
    ${circle(110,70,52,"#ffffff","#d21f2b",12)}
    ${text(110,82,symbol,44,900,"#111111")}
    ${slash(72,34,148,106,"#d21f2b",14)}
  `);
}
function svgWarning(label){
  return svgWrap(`
    ${diamond(110,72,60,"#f2c300","#111111",10)}
    ${text(110,80,label,24,900,"#111111")}
  `);
}
function svgWarningIcon(icon){
  return svgWrap(`
    ${diamond(110,72,60,"#f2c300","#111111",10)}
    ${text(110,88,icon,44,900,"#111111")}
  `);
}
function svgGuideIcon(icon, color="#1f7a3a"){
  return svgWrap(`
    ${rect(28,26,164,92,color,"#ffffff",8,18)}
    ${text(110,92,icon,44,900,"#ffffff")}
  `);
}
function svgLaneArrow(dir="↑"){
  return svgWrap(`
    ${rect(40,22,140,96,"#ffffff","#111111",8,14)}
    ${text(110,86,dir,54,900,"#111111")}
  `);
}

/* Temporary key labels */
function svgTempKey(key, lang="en"){
  const labels = {
    ROAD_WORK:  { en:"ROAD WORK", fr:"TRAVAUX", sw:"MATENGENEZO", ar:"أعمال طريق", zh:"道路施工", pt:"OBRAS", es:"OBRAS" },
    FLAGGER:    { en:"FLAGGER", fr:"SIGNALEUR", sw:"MWELEKEZAJI", ar:"مُوَجِّه", zh:"旗手", pt:"SINALIZADOR", es:"SEÑALISTA" },
    DETOUR:     { en:"DETOUR", fr:"DÉTOUR", sw:"NJIA MBADALA", ar:"تحويلة", zh:"绕行", pt:"DESVIO", es:"DESVÍO" },
    LANE_CLOSED:{ en:"LANE CLOSED", fr:"VOIE FERMÉE", sw:"NJIA IMEFUNGWA", ar:"المسار مغلق", zh:"车道关闭", pt:"FAIXA FECHADA", es:"CARRIL CERRADO" },
    SLOW:       { en:"SLOW", fr:"RALENTIR", sw:"PUNGUZA KASI", ar:"خفّف السرعة", zh:"减速", pt:"REDUZA", es:"DESPACIO" }
  };
  const label = (labels[key] && labels[key][lang]) ? labels[key][lang] : (key || "");
  return svgWrap(`
    ${rect(28,26,164,92,"#ff8a00","#111111",8,18)}
    ${text(110,84,label,14,900,"#111111")}
  `);
}

/* -------------------------
   Dataset (Full A with ES)
-------------------------- */
const SIGNS = [
  // REGULATORY
  {
    id:"reg_stop", code:"R-STOP", cat:"Regulatory",
    name:{en:"Stop", fr:"Arrêt", sw:"Simama", ar:"توقف", zh:"停止", pt:"Pare", es:"Pare"},
    meaning:{
      en:"Come to a complete stop. Proceed only when safe.",
      fr:"Arrêt complet obligatoire. Repartir seulement lorsque c’est sécuritaire.",
      sw:"Simama kabisa. Endelea tu ikiwa ni salama.",
      ar:"توقف توقفًا كاملًا. تابع فقط عندما يكون ذلك آمنًا.",
      zh:"完全停车。确认安全后再通行。",
      pt:"Pare completamente. Prossiga somente quando for seguro.",
      es:"Deténgase por completo. Avance solo cuando sea seguro."
    },
    svg:(lang)=>svgStop(lang)
  },
  {
    id:"reg_yield", code:"R-YIELD", cat:"Regulatory",
    name:{en:"Yield", fr:"Cédez le passage", sw:"Toa njia", ar:"أعطِ الطريق", zh:"让行", pt:"Dê a preferência", es:"Ceda el paso"},
    meaning:{
      en:"Slow down and give right-of-way. Stop if needed.",
      fr:"Ralentir et céder la priorité. S’arrêter au besoin.",
      sw:"Punguza mwendo na toa kipaumbele. Simama ikibidi.",
      ar:"خفّف السرعة وأعطِ أولوية المرور. توقف إذا لزم الأمر.",
      zh:"减速并让行（必要时停车）。",
      pt:"Reduza a velocidade e dê passagem. Pare se necessário.",
      es:"Reduzca la velocidad y ceda la prioridad. Deténgase si es necesario."
    },
    svg:(lang)=>svgYield(lang)
  },
  {
    id:"reg_speed_30", code:"R-SPEED", cat:"Regulatory",
    name:{en:"Maximum speed 30", fr:"Vitesse maximale 30", sw:"Kasi ya juu 30", ar:"السرعة القصوى 30", zh:"最高限速30", pt:"Velocidade máxima 30", es:"Velocidad máxima 30"},
    meaning:{en:"Do not exceed 30 km/h.", fr:"Ne pas dépasser 30 km/h.", sw:"Usizidi 30 km/h.", ar:"لا تتجاوز 30 كم/س.", zh:"不得超过30公里/小时。", pt:"Não exceda 30 km/h.", es:"No exceda 30 km/h."},
    svg:svgSpeed(30)
  },
  {
    id:"reg_speed_40", code:"R-SPEED", cat:"Regulatory",
    name:{en:"Maximum speed 40", fr:"Vitesse maximale 40", sw:"Kasi ya juu 40", ar:"السرعة القصوى 40", zh:"最高限速40", pt:"Velocidade máxima 40", es:"Velocidad máxima 40"},
    meaning:{en:"Do not exceed 40 km/h.", fr:"Ne pas dépasser 40 km/h.", sw:"Usizidi 40 km/h.", ar:"لا تتجاوز 40 كم/س.", zh:"不得超过40公里/小时。", pt:"Não exceda 40 km/h.", es:"No exceda 40 km/h."},
    svg:svgSpeed(40)
  },
  {
    id:"reg_speed_50", code:"R-SPEED", cat:"Regulatory",
    name:{en:"Maximum speed 50", fr:"Vitesse maximale 50", sw:"Kasi ya juu 50", ar:"السرعة القصوى 50", zh:"最高限速50", pt:"Velocidade máxima 50", es:"Velocidad máxima 50"},
    meaning:{en:"Do not exceed 50 km/h.", fr:"Ne pas dépasser 50 km/h.", sw:"Usizidi 50 km/h.", ar:"لا تتجاوز 50 كم/س.", zh:"不得超过50公里/小时。", pt:"Não exceda 50 km/h.", es:"No exceda 50 km/h."},
    svg:svgSpeed(50)
  },
  {
    id:"reg_speed_60", code:"R-SPEED", cat:"Regulatory",
    name:{en:"Maximum speed 60", fr:"Vitesse maximale 60", sw:"Kasi ya juu 60", ar:"السرعة القصوى 60", zh:"最高限速60", pt:"Velocidade máxima 60", es:"Velocidad máxima 60"},
    meaning:{en:"Do not exceed 60 km/h.", fr:"Ne pas dépasser 60 km/h.", sw:"Usizidi 60 km/h.", ar:"لا تتجاوز 60 كم/س.", zh:"不得超过60公里/小时。", pt:"Não exceda 60 km/h.", es:"No exceda 60 km/h."},
    svg:svgSpeed(60)
  },
  {
    id:"reg_speed_80", code:"R-SPEED", cat:"Regulatory",
    name:{en:"Maximum speed 80", fr:"Vitesse maximale 80", sw:"Kasi ya juu 80", ar:"السرعة القصوى 80", zh:"最高限速80", pt:"Velocidade máxima 80", es:"Velocidad máxima 80"},
    meaning:{en:"Do not exceed 80 km/h.", fr:"Ne pas dépasser 80 km/h.", sw:"Usizidi 80 km/h.", ar:"لا تتجاوز 80 كم/س.", zh:"不得超过80公里/小时。", pt:"Não exceda 80 km/h.", es:"No exceda 80 km/h."},
    svg:svgSpeed(80)
  },
  {
    id:"reg_speed_100", code:"R-SPEED", cat:"Regulatory",
    name:{en:"Maximum speed 100", fr:"Vitesse maximale 100", sw:"Kasi ya juu 100", ar:"السرعة القصوى 100", zh:"最高限速100", pt:"Velocidade máxima 100", es:"Velocidad máxima 100"},
    meaning:{en:"Do not exceed 100 km/h.", fr:"Ne pas dépasser 100 km/h.", sw:"Usizidi 100 km/h.", ar:"لا تتجاوز 100 كم/س.", zh:"不得超过100公里/小时。", pt:"Não exceda 100 km/h.", es:"No exceda 100 km/h."},
    svg:svgSpeed(100)
  },
  {
    id:"reg_do_not_enter", code:"R-DNE", cat:"Regulatory",
    name:{en:"Do not enter", fr:"Sens interdit", sw:"Usiingie", ar:"ممنوع الدخول", zh:"禁止驶入", pt:"Proibido entrar", es:"Prohibido entrar"},
    meaning:{en:"You must not enter this roadway.", fr:"Accès interdit à cette chaussée.", sw:"Hairuhusiwi kuingia kwenye barabara hii.", ar:"يُمنع الدخول إلى هذا الطريق.", zh:"不得进入此道路。", pt:"Entrada proibida nesta via.", es:"No entre a esta vía."},
    svg:svgRegRect("DO NOT","ENTER")
  },
  {
    id:"reg_one_way", code:"R-ONEWAY", cat:"Regulatory",
    name:{en:"One-way", fr:"Sens unique", sw:"Njia ya upande mmoja", ar:"اتجاه واحد", zh:"单行道", pt:"Mão única", es:"Sentido único"},
    meaning:{en:"Traffic flows only in the direction shown.", fr:"La circulation se fait dans le sens indiqué seulement.", sw:"Magari huenda upande mmoja tu kama inavyoonyeshwa.", ar:"السير في اتجاه واحد فقط كما هو موضح.", zh:"车辆只能按箭头方向行驶。", pt:"Tráfego em apenas uma direção.", es:"Circulación en una sola dirección."},
    svg:svgRegRect("ONE WAY","→")
  },
  {
    id:"reg_keep_right", code:"R-KEEP-R", cat:"Regulatory",
    name:{en:"Keep right", fr:"Gardez la droite", sw:"Shika kulia", ar:"الزم اليمين", zh:"靠右行驶", pt:"Mantenha-se à direita", es:"Manténgase a la derecha"},
    meaning:{en:"Keep to the right of the sign/obstruction.", fr:"Passez à droite du panneau/de l’obstacle.", sw:"Pita upande wa kulia wa kizuizi/alama.", ar:"الزم يمين اللوحة/العائق.", zh:"从标志/障碍物右侧通过。", pt:"Passe pelo lado direito.", es:"Pase por la derecha del obstáculo."},
    svg:svgRegRect("KEEP","RIGHT")
  },
  {
    id:"reg_keep_left", code:"R-KEEP-L", cat:"Regulatory",
    name:{en:"Keep left", fr:"Gardez la gauche", sw:"Shika kushoto", ar:"الزم اليسار", zh:"靠左行驶", pt:"Mantenha-se à esquerda", es:"Manténgase a la izquierda"},
    meaning:{en:"Keep to the left of the sign/obstruction.", fr:"Passez à gauche du panneau/de l’obstacle.", sw:"Pita upande wa kushoto wa kizuizi/alama.", ar:"الزم يسار اللوحة/العائق.", zh:"从标志/障碍物左侧通过。", pt:"Passe pelo lado esquerdo.", es:"Pase por la izquierda del obstáculo."},
    svg:svgRegRect("KEEP","LEFT")
  },
  {
    id:"reg_no_u_turn", code:"R-NO-UTURN", cat:"Regulatory",
    name:{en:"No U-turn", fr:"Demi-tour interdit", sw:"Usifanye U-turn", ar:"ممنوع الدوران للخلف", zh:"禁止掉头", pt:"Proibido retorno", es:"Prohibido retorno"},
    meaning:{en:"U-turns are prohibited here.", fr:"Les demi-tours sont interdits ici.", sw:"Demi-turn (U-turn) hairuhusiwi hapa.", ar:"الدوران للخلف ممنوع هنا.", zh:"此处禁止掉头。", pt:"Retorno proibido.", es:"Prohibido dar vuelta en U."},
    svg:svgNo("⟲")
  },
  {
    id:"reg_no_left_turn", code:"R-NO-LTURN", cat:"Regulatory",
    name:{en:"No left turn", fr:"Virage à gauche interdit", sw:"Kushoto marufuku", ar:"ممنوع الانعطاف يسارًا", zh:"禁止左转", pt:"Proibido virar à esquerda", es:"Prohibido girar a la izquierda"},
    meaning:{en:"Left turns are prohibited.", fr:"Les virages à gauche sont interdits.", sw:"Geuka kushoto hairuhusiwi.", ar:"الانعطاف يسارًا ممنوع.", zh:"此处禁止左转。", pt:"Conversão à esquerda proibida.", es:"Giro a la izquierda prohibido."},
    svg:svgNo("↰")
  },
  {
    id:"reg_no_right_turn", code:"R-NO-RTURN", cat:"Regulatory",
    name:{en:"No right turn", fr:"Virage à droite interdit", sw:"Kulia marufuku", ar:"ممنوع الانعطاف يمينًا", zh:"禁止右转", pt:"Proibido virar à direita", es:"Prohibido girar a la derecha"},
    meaning:{en:"Right turns are prohibited.", fr:"Les virages à droite sont interdits.", sw:"Geuka kulia hairuhusiwi.", ar:"الانعطاف يمينًا ممنوع.", zh:"此处禁止右转。", pt:"Conversão à direita proibida.", es:"Giro a la derecha prohibido."},
    svg:svgNo("↱")
  },
  {
    id:"reg_no_parking", code:"R-NO-PARK", cat:"Regulatory",
    name:{en:"No parking", fr:"Stationnement interdit", sw:"Kuegesha marufuku", ar:"ممنوع الوقوف", zh:"禁止停车", pt:"Proibido estacionar", es:"Prohibido estacionar"},
    meaning:{en:"Parking is not permitted.", fr:"Le stationnement est interdit.", sw:"Kuegesha hairuhusiwi.", ar:"الاصطفاف/الوقوف ممنوع.", zh:"不允许停车（停放）。", pt:"Estacionamento proibido.", es:"No se permite estacionar."},
    svg:svgNo("P")
  },
  {
    id:"reg_no_stopping", code:"R-NO-STOP", cat:"Regulatory",
    name:{en:"No stopping", fr:"Arrêt interdit", sw:"Kusimama marufuku", ar:"ممنوع التوقف", zh:"禁止临时停车", pt:"Proibido parar", es:"Prohibido detenerse"},
    meaning:{
      en:"Stopping is prohibited except to avoid danger or obey police/signals.",
      fr:"L’arrêt est interdit sauf pour éviter un danger ou obéir à la police/aux feux.",
      sw:"Kusimama hairuhusiwi isipokuwa kwa usalama au maagizo ya polisi/taa.",
      ar:"التوقف ممنوع إلا لتفادي خطر أو للامتثال للشرطة/الإشارات.",
      zh:"除避险或服从警察/信号外不得停车。",
      pt:"Parada proibida, exceto por segurança.",
      es:"Detenerse está prohibido salvo por seguridad."
    },
    svg:svgNo("⛔")
  },
  {
    id:"reg_no_passing", code:"R-NO-PASS", cat:"Regulatory",
    name:{en:"Passing prohibited", fr:"Dépassement interdit", sw:"Kupita marufuku", ar:"ممنوع التجاوز", zh:"禁止超车", pt:"Proibido ultrapassar", es:"Prohibido adelantar"},
    meaning:{en:"Do not pass other vehicles.", fr:"Ne dépassez pas les autres véhicules.", sw:"Usipite magari mengine.", ar:"لا تتجاوز المركبات الأخرى.", zh:"不得超越其他车辆。", pt:"Ultrapassagem proibida.", es:"No adelante a otros vehículos."},
    svg:svgRegRect("NO","PASSING")
  },
  {
    id:"reg_school_zone", code:"R-SCHOOL", cat:"Regulatory",
    name:{en:"School zone", fr:"Zone scolaire", sw:"Eneo la shule", ar:"منطقة مدرسة", zh:"学校区域", pt:"Zona escolar", es:"Zona escolar"},
    meaning:{en:"Reduced speed/extra caution during posted times.", fr:"Vitesse réduite/prudence accrue aux heures indiquées.", sw:"Punguza kasi/kuwa mwangalifu nyakati zilizoonyeshwa.", ar:"خفّف السرعة وكن أكثر حذرًا في الأوقات المحددة.", zh:"在标示时段减速并特别注意。", pt:"Reduza a velocidade nos horários indicados.", es:"Reduzca la velocidad en los horarios indicados."},
    svg:svgRegRect("SCHOOL","ZONE")
  },
  {
    id:"reg_turn_left_only", code:"R-LONLY", cat:"Regulatory",
    name:{en:"Left turn only", fr:"Virage à gauche obligatoire", sw:"Geuka kushoto tu", ar:"انعطف يسارًا فقط", zh:"只许左转", pt:"Vire à esquerda", es:"Solo giro a la izquierda"},
    meaning:{en:"You must turn left from this lane.", fr:"Vous devez tourner à gauche depuis cette voie.", sw:"Lazima ugeuke kushoto kutoka njia hii.", ar:"يجب الانعطاف يسارًا من هذا المسار.", zh:"此车道必须左转。", pt:"Conversão obrigatória à esquerda.", es:"Debe girar a la izquierda desde este carril."},
    svg:svgLaneArrow("↰")
  },
  {
    id:"reg_turn_right_only", code:"R-RONLY", cat:"Regulatory",
    name:{en:"Right turn only", fr:"Virage à droite obligatoire", sw:"Geuka kulia tu", ar:"انعطف يمينًا فقط", zh:"只许右转", pt:"Vire à direita", es:"Solo giro a la derecha"},
    meaning:{en:"You must turn right from this lane.", fr:"Vous devez tourner à droite depuis cette voie.", sw:"Lazima ugeuke kulia kutoka njia hii.", ar:"يجب الانعطاف يمينًا من هذا المسار.", zh:"此车道必须右转。", pt:"Conversão obrigatória à direita.", es:"Debe girar a la derecha desde este carril."},
    svg:svgLaneArrow("↱")
  },

  // WARNING
  {
    id:"warn_curve", code:"W-CURVE", cat:"Warning",
    name:{en:"Curve ahead", fr:"Courbe à venir", sw:"Kona mbele", ar:"منعطف أمامك", zh:"前方弯道", pt:"Curva à frente", es:"Curva adelante"},
    meaning:{en:"A curve is coming. Reduce speed.", fr:"Une courbe approche. Ralentir.", sw:"Kuna kona. Punguza kasi.", ar:"يوجد منعطف. خفّف السرعة.", zh:"前方有弯道，请减速。", pt:"Curva à frente. Reduza a velocidade.", es:"Curva próxima. Reduzca la velocidad."},
    svg:svgWarning("↷")
  },
  {
    id:"warn_sharp_curve", code:"W-SHARP", cat:"Warning",
    name:{en:"Sharp curve", fr:"Courbe prononcée", sw:"Kona kali", ar:"منعطف حاد", zh:"急弯", pt:"Curva acentuada", es:"Curva cerrada"},
    meaning:{en:"A sharp curve is coming. Slow down more.", fr:"Courbe serrée. Ralentir davantage.", sw:"Kona kali. Punguza kasi zaidi.", ar:"منعطف حاد. خفّف السرعة أكثر.", zh:"前方急弯，请进一步减速。", pt:"Curva fechada. Reduza mais a velocidade.", es:"Curva pronunciada. Reduzca más la velocidad."},
    svg:svgWarning("⤵")
  },
  {
    id:"warn_intersection", code:"W-INT", cat:"Warning",
    name:{en:"Intersection ahead", fr:"Intersection à venir", sw:"Makutano mbele", ar:"تقاطع أمامك", zh:"前方交叉路口", pt:"Cruzamento à frente", es:"Intersección adelante"},
    meaning:{en:"Prepare to slow; watch for cross traffic.", fr:"Préparez-vous à ralentir; surveillez la circulation.", sw:"Jiandae kupunguza kasi; angalia magari yanayokatiza.", ar:"استعد لتخفيف السرعة وانتبه لحركة المرور المتقاطعة.", zh:"准备减速，注意横向来车。", pt:"Prepare-se para reduzir.", es:"Prepárese para reducir y observe el cruce."},
    svg:svgWarning("+")
  },
  {
    id:"warn_side_road", code:"W-SIDE", cat:"Warning",
    name:{en:"Side road ahead", fr:"Route latérale", sw:"Barabara ya pembeni", ar:"طريق جانبي", zh:"前方侧路", pt:"Via lateral", es:"Camino lateral"},
    meaning:{en:"Traffic may enter from a side road.", fr:"Circulation possible d’une route latérale.", sw:"Magari yanaweza kuingia kutoka barabara ya pembeni.", ar:"قد تدخل حركة المرور من طريق جانبي.", zh:"注意侧路车辆汇入。", pt:"Tráfego vindo da lateral.", es:"Puede incorporarse tráfico desde un camino lateral."},
    svg:svgWarning("⊣")
  },
  {
    id:"warn_merge", code:"W-MERGE", cat:"Warning",
    name:{en:"Lane merge", fr:"Fusion de voies", sw:"Njia zinaungana", ar:"اندماج مسارات", zh:"车道汇入", pt:"Convergência de faixas", es:"Convergencia de carriles"},
    meaning:{en:"Traffic will merge. Adjust speed and space.", fr:"Voies qui fusionnent. Ajustez la vitesse et l’espacement.", sw:"Njia zinaungana. Rekebisha kasi na nafasi.", ar:"المسارات ستندمج. اضبط السرعة والمسافة.", zh:"前方汇入，请调整车速和车距。", pt:"As faixas se unem. Ajuste a velocidade.", es:"Los carriles se unen. Ajuste velocidad y distancia."},
    svg:svgWarning("⇢⇠")
  },
  {
    id:"warn_lane_ends", code:"W-ENDS", cat:"Warning",
    name:{en:"Lane ends", fr:"Fin de voie", sw:"Njia inaisha", ar:"نهاية مسار", zh:"车道结束", pt:"Faixa termina", es:"Fin de carril"},
    meaning:{en:"A lane ends. Merge safely.", fr:"Une voie se termine. Fusionnez prudemment.", sw:"Njia inaisha. Ungana kwa usalama.", ar:"مسار ينتهي. ادمج بأمان.", zh:"前方车道结束，请安全并线。", pt:"Faixa termina. Faça a conversão.", es:"Un carril termina. Incorpórese con seguridad."},
    svg:svgWarning("⇣")
  },
  {
    id:"warn_narrow_bridge", code:"W-NARROW", cat:"Warning",
    name:{en:"Narrow bridge", fr:"Pont étroit", sw:"Daraja nyembamba", ar:"جسر ضيق", zh:"窄桥", pt:"Ponte estreita", es:"Puente angosto"},
    meaning:{en:"Bridge is narrower than the road. Slow down.", fr:"Pont plus étroit que la route. Ralentir.", sw:"Daraja ni nyembamba. Punguza kasi.", ar:"الجسر أضيق من الطريق. خفّف السرعة.", zh:"桥面变窄，请减速小心。", pt:"Ponte mais estreita. Reduza a velocidade.", es:"Puente más angosto. Reduzca la velocidad."},
    svg:svgWarning("‖")
  },
  {
    id:"warn_bump", code:"W-BUMP", cat:"Warning",
    name:{en:"Bump / uneven pavement", fr:"Bossele / chaussée inégale", sw:"Mashimo/ukwavu", ar:"مطبات/طريق غير مستوٍ", zh:"路面不平", pt:"Pista irregular", es:"Pavimento irregular"},
    meaning:{en:"Road surface changes. Slow down.", fr:"Chaussée irrégulière. Ralentir.", sw:"Uso wa barabara si sawa. Punguza kasi.", ar:"سطح الطريق غير مستوٍ. خفّف السرعة.", zh:"路况变化，请减速。", pt:"Pavimento irregular. Reduza a velocidade.", es:"Calzada irregular. Reduzca la velocidad."},
    svg:svgWarning("≈")
  },
  {
    id:"warn_slippery", code:"W-SLIP", cat:"Warning",
    name:{en:"Slippery when wet", fr:"Glissant quand mouillé", sw:"Huteleza ikilowa", ar:"زلق عند البلل", zh:"路滑（雨天）", pt:"Pista escorregadia", es:"Resbaladizo si está mojado"},
    meaning:{en:"Road may be slippery. Reduce speed.", fr:"Chaussée glissante. Ralentir.", sw:"Barabara inaweza kuteleza. Punguza kasi.", ar:"قد يكون الطريق زلقًا. خفّف السرعة.", zh:"路面可能湿滑，请减速。", pt:"Pode estar escorregadia.", es:"La vía puede estar resbaladiza."},
    svg:svgWarningIcon("💧")
  },
  {
    id:"warn_ped", code:"W-PED", cat:"Warning",
    name:{en:"Pedestrian crossing", fr:"Passage pour piétons", sw:"Kivuko cha watembea kwa miguu", ar:"ممر مشاة", zh:"人行横道", pt:"Travessia de pedestres", es:"Cruce peatonal"},
    meaning:{en:"Watch for pedestrians crossing.", fr:"Surveillez les piétons qui traversent.", sw:"Angalia watembea kwa miguu wanaovuka.", ar:"انتبه للمشاة أثناء العبور.", zh:"注意行人通过。", pt:"Atenção aos pedestres.", es:"Atención a peatones."},
    svg:svgWarningIcon("🚶")
  },
  {
    id:"warn_school_crossing", code:"W-SCHX", cat:"Warning",
    name:{en:"School crossing", fr:"Traverse scolaire", sw:"Kivuko cha shule", ar:"عبور مدرسة", zh:"学校过街", pt:"Travessia escolar", es:"Cruce escolar"},
    meaning:{en:"Children may be crossing. Be ready to stop.", fr:"Des enfants peuvent traverser. Soyez prêt à arrêter.", sw:"Watoto wanaweza kuvuka. Kuwa tayari kusimama.", ar:"قد يعبر أطفال. كن مستعدًا للتوقف.", zh:"可能有儿童过街，准备停车。", pt:"Crianças podem atravessar.", es:"Niños pueden cruzar. Prepárese para detenerse."},
    svg:svgWarningIcon("🚸")
  },
  {
    id:"warn_deer", code:"W-DEER", cat:"Warning",
    name:{en:"Deer crossing", fr:"Traverse d’animaux", sw:"Wanyama huvuka", ar:"عبور حيوانات", zh:"野生动物穿越", pt:"Animais na pista", es:"Cruce de animales"},
    meaning:{en:"Wildlife may enter the roadway.", fr:"Des animaux peuvent traverser.", sw:"Wanyama wanaweza kuingia barabarani.", ar:"قد تدخل الحيوانات البرية إلى الطريق.", zh:"注意动物可能进入道路。", pt:"Animais podem cruzar.", es:"Animales pueden ingresar a la calzada."},
    svg:svgWarningIcon("🦌")
  },
  {
    id:"warn_moose", code:"W-MOOSE", cat:"Warning",
    name:{en:"Moose crossing", fr:"Orignal", sw:"Moose huvuka", ar:"عبور موظ", zh:"驼鹿穿越", pt:"Alce na pista", es:"Cruce de alces"},
    meaning:{en:"Large wildlife may enter the roadway.", fr:"Gros animaux possibles.", sw:"Wanyama wakubwa wanaweza kuingia barabarani.", ar:"قد تدخل حيوانات كبيرة إلى الطريق.", zh:"注意大型动物可能进入道路。", pt:"Animais grandes podem cruzar.", es:"Animales grandes pueden cruzar."},
    svg:svgWarningIcon("🫎")
  },
  {
    id:"warn_railway", code:"W-RR", cat:"Warning",
    name:{en:"Railway crossing ahead", fr:"Passage à niveau", sw:"Kivuko cha reli mbele", ar:"معبر سكة حديد", zh:"前方铁路道口", pt:"Passagem ferroviária", es:"Paso a nivel"},
    meaning:{en:"Rail tracks ahead. Be prepared to stop.", fr:"Voie ferrée à venir. Soyez prêt à arrêter.", sw:"Reli mbele. Kuwa tayari kusimama.", ar:"سكة حديد أمامك. كن مستعدًا للتوقف.", zh:"注意铁轨，准备停车。", pt:"Trilhos à frente. Prepare-se para parar.", es:"Vías férreas adelante. Prepárese para detenerse."},
    svg:svgWarningIcon("🚆")
  },
  {
    id:"warn_roundabout", code:"W-RB", cat:"Warning",
    name:{en:"Roundabout ahead", fr:"Carrefour giratoire", sw:"Mzunguko wa barabara", ar:"دوار أمامك", zh:"前方环岛", pt:"Rotatória", es:"Rotonda"},
    meaning:{en:"Slow down; prepare to yield in the roundabout.", fr:"Ralentir; cédez dans le giratoire.", sw:"Punguza kasi; toa njia kwenye mzunguko.", ar:"خفّف السرعة واستعد لإعطاء الطريق داخل الدوار.", zh:"减速并在环岛内让行。", pt:"Reduza e dê preferência.", es:"Reduzca y ceda dentro de la rotonda."},
    svg:svgWarningIcon("🌀")
  },
  {
    id:"warn_signal_ahead", code:"W-SIG", cat:"Warning",
    name:{en:"Traffic signals ahead", fr:"Feux de circulation", sw:"Taa za barabarani mbele", ar:"إشارات مرور أمامك", zh:"前方交通信号灯", pt:"Semáforo à frente", es:"Semáforo adelante"},
    meaning:{en:"Signal-controlled intersection ahead. Prepare to stop.", fr:"Intersection avec feux. Préparez-vous à arrêter.", sw:"Makutano yenye taa. Jiandae kusimama.", ar:"تقاطع بإشارات ضوئية أمامك. كن مستعدًا للتوقف.", zh:"前方有信号灯，准备停车。", pt:"Interseção com semáforo.", es:"Intersección con semáforo. Prepárese para detenerse."},
    svg:svgWarningIcon("🚦")
  },
  {
    id:"warn_stop_ahead", code:"W-STOPA", cat:"Warning",
    name:{en:"Stop ahead", fr:"Arrêt à venir", sw:"Simama mbele", ar:"توقف أمامك", zh:"前方停车标志", pt:"Pare à frente", es:"Pare adelante"},
    meaning:{en:"A stop sign is ahead. Prepare to stop.", fr:"Panneau ARRÊT à venir. Préparez-vous à arrêter.", sw:"Alama ya simama mbele. Jiandae kusimama.", ar:"إشارة توقف أمامك. كن مستعدًا للتوقف.", zh:"前方有停车标志，准备停车。", pt:"Placa de PARE à frente.", es:"Señal de PARE adelante."},
    svg:svgWarning("STOP")
  },
  {
    id:"warn_yield_ahead", code:"W-YIELDA", cat:"Warning",
    name:{en:"Yield ahead", fr:"Cédez à venir", sw:"Toa njia mbele", ar:"أعطِ الطريق أمامك", zh:"前方让行标志", pt:"Dê preferência à frente", es:"Ceda el paso adelante"},
    meaning:{en:"A yield sign is ahead. Prepare to yield.", fr:"CÉDEZ à venir. Préparez-vous à céder.", sw:"Alama ya toa njia mbele. Jiandae kutoa njia.", ar:"إشارة أعطِ الطريق أمامك. استعد لإعطاء الطريق.", zh:"前方有让行标志，准备让行。", pt:"Placa de preferência à frente.", es:"Señal de ceda el paso adelante."},
    svg:svgWarning("YIELD")
  },
  {
    id:"warn_falling_rocks", code:"W-ROCK", cat:"Warning",
    name:{en:"Falling rocks", fr:"Chutes de pierres", sw:"Mawe yanaanguka", ar:"تساقط صخور", zh:"落石", pt:"Queda de pedras", es:"Caída de rocas"},
    meaning:{en:"Be alert for rocks on roadway.", fr:"Attention aux pierres sur la route.", sw:"Kuwa makini na mawe barabarani.", ar:"انتبه للصخور على الطريق.", zh:"注意路面落石。", pt:"Atenção a pedras na pista.", es:"Atención a rocas en la calzada."},
    svg:svgWarningIcon("🪨")
  },
  {
    id:"warn_steep_hill", code:"W-HILL", cat:"Warning",
    name:{en:"Steep hill", fr:"Pente raide", sw:"Mteremko mkali", ar:"منحدر شديد", zh:"陡坡", pt:"Ladeira íngreme", es:"Pendiente pronunciada"},
    meaning:{en:"Steep grade. Use lower gear and control speed.", fr:"Forte pente. Utilisez un rapport inférieur.", sw:"Mteremko mkali. Tumia gia ya chini na dhibiti kasi.", ar:"منحدر شديد. استخدم ترسًا منخفضًا وتحكم بالسرعة.", zh:"坡度大，使用低挡并控制车速。", pt:"Use marcha baixa e controle a velocidade.", es:"Use marcha baja y controle la velocidad."},
    svg:svgWarningIcon("⛰️")
  },

  // GUIDE
  {
    id:"guide_hospital", code:"G-H", cat:"Guide",
    name:{en:"Hospital", fr:"Hôpital", sw:"Hospitali", ar:"مستشفى", zh:"医院", pt:"Hospital", es:"Hospital"},
    meaning:{en:"Hospital services nearby.", fr:"Services hospitaliers à proximité.", sw:"Huduma za hospitali karibu.", ar:"خدمات المستشفى قريبة.", zh:"附近有医院服务。", pt:"Serviços de hospital nas proximidades.", es:"Servicios de hospital cerca."},
    svg:svgGuideIcon("H","#1f7a3a")
  },
  {
    id:"guide_gas", code:"G-GAS", cat:"Guide",
    name:{en:"Gas", fr:"Essence", sw:"Mafuta", ar:"وقود", zh:"加油站", pt:"Posto de combustível", es:"Gasolinera"},
    meaning:{en:"Fuel services nearby.", fr:"Carburant à proximité.", sw:"Huduma za mafuta karibu.", ar:"خدمات الوقود قريبة.", zh:"附近有加油服务。", pt:"Serviços de combustível nas proximidades.", es:"Servicios de combustible cerca."},
    svg:svgGuideIcon("⛽","#1f7a3a")
  },
  {
    id:"guide_food", code:"G-FOOD", cat:"Guide",
    name:{en:"Food", fr:"Restauration", sw:"Chakula", ar:"طعام", zh:"餐饮", pt:"Alimentação", es:"Comida"},
    meaning:{en:"Food services nearby.", fr:"Services de restauration à proximité.", sw:"Huduma za chakula karibu.", ar:"خدمات الطعام قريبة.", zh:"附近有餐饮服务。", pt:"Serviços de alimentação nas proximidades.", es:"Servicios de comida cerca."},
    svg:svgGuideIcon("🍴","#1f7a3a")
  },
  {
    id:"guide_lodging", code:"G-LODGE", cat:"Guide",
    name:{en:"Lodging", fr:"Hébergement", sw:"Malazi", ar:"سكن", zh:"住宿", pt:"Hospedagem", es:"Alojamiento"},
    meaning:{en:"Hotels/motels nearby.", fr:"Hôtels/motels à proximité.", sw:"Hoteli/malazi karibu.", ar:"فنادق/نُزُل قريبة.", zh:"附近有旅馆/汽车旅馆。", pt:"Hotéis/motéis nas proximidades.", es:"Hoteles/moteles cerca."},
    svg:svgGuideIcon("🛏️","#1f7a3a")
  },
  {
    id:"guide_parking", code:"G-P", cat:"Guide",
    name:{en:"Parking", fr:"Stationnement", sw:"Maegesho", ar:"موقف سيارات", zh:"停车场", pt:"Estacionamento", es:"Estacionamiento"},
    meaning:{en:"Parking area available.", fr:"Aire de stationnement disponible.", sw:"Eneo la maegesho linapatikana.", ar:"موقف سيارات متاح.", zh:"有停车区域。", pt:"Área de estacionamento disponível.", es:"Área de estacionamiento disponible."},
    svg:svgGuideIcon("P","#1f7a3a")
  },
  {
    id:"guide_airport", code:"G-AIR", cat:"Guide",
    name:{en:"Airport", fr:"Aéroport", sw:"Uwanja wa ndege", ar:"مطار", zh:"机场", pt:"Aeroporto", es:"Aeropuerto"},
    meaning:{en:"Route to an airport.", fr:"Itinéraire vers un aéroport.", sw:"Njia kuelekea uwanja wa ndege.", ar:"طريق إلى المطار.", zh:"通往机场的路线。", pt:"Rota para o aeroporto.", es:"Ruta hacia el aeropuerto."},
    svg:svgGuideIcon("✈️","#1f7a3a")
  },

  // TEMPORARY
  {
    id:"temp_construction", code:"T-WORK", cat:"Temporary",
    name:{en:"Road work", fr:"Travaux", sw:"Matengenezo", ar:"أعمال طريق", zh:"道路施工", pt:"Obras", es:"Obras"},
    meaning:{en:"Road work zone. Slow down and follow signs.", fr:"Zone de travaux. Ralentir et suivre la signalisation.", sw:"Eneo la kazi barabarani. Punguza kasi na fuata alama.", ar:"منطقة أعمال طريق. خفّف السرعة واتبع الإشارات.", zh:"施工区域，请减速并按标志行驶。", pt:"Zona de obras. Reduza a velocidade e siga as placas.", es:"Zona de obras. Reduzca la velocidad y siga las señales."},
    svg:(lang)=>svgTempKey("ROAD_WORK",lang)
  },
  {
    id:"temp_flagger", code:"T-FLAG", cat:"Temporary",
    name:{en:"Flagger ahead", fr:"Signaleur", sw:"Mwelekezaji", ar:"مُوَجِّه", zh:"前方旗手", pt:"Sinalizador", es:"Señalista"},
    meaning:{en:"Be ready to stop and follow instructions.", fr:"Soyez prêt à arrêter et suivez les consignes.", sw:"Kuwa tayari kusimama na fuata maelekezo.", ar:"كن مستعدًا للتوقف واتبع التعليمات.", zh:"准备停车并听从指挥。", pt:"Prepare-se para parar e siga as instruções.", es:"Prepárese para detenerse y siga instrucciones."},
    svg:(lang)=>svgTempKey("FLAGGER",lang)
  },
  {
    id:"temp_detour", code:"T-DETOUR", cat:"Temporary",
    name:{en:"Detour", fr:"Détour", sw:"Njia mbadala", ar:"تحويلة", zh:"绕行", pt:"Desvio", es:"Desvío"},
    meaning:{en:"Follow detour route.", fr:"Suivez l’itinéraire de détour.", sw:"Fuata njia mbadala.", ar:"اتبع مسار التحويلة.", zh:"按绕行路线行驶。", pt:"Siga o desvio.", es:"Siga la ruta de desvío."},
    svg:(lang)=>svgTempKey("DETOUR",lang)
  },
  {
    id:"temp_lane_closed", code:"T-CLOSE", cat:"Temporary",
    name:{en:"Lane closed", fr:"Voie fermée", sw:"Njia imefungwa", ar:"المسار مغلق", zh:"车道关闭", pt:"Faixa fechada", es:"Carril cerrado"},
    meaning:{en:"A lane is closed ahead. Merge when safe.", fr:"Voie fermée à venir. Fusionnez prudemment.", sw:"Njia imefungwa mbele. Ungana kwa usalama.", ar:"مسار مغلق أمامك. ادمج بأمان.", zh:"前方车道关闭，请安全并线。", pt:"Faixa fechada. Converta com cuidado.", es:"Carril cerrado adelante. Incorpórese con seguridad."},
    svg:(lang)=>svgTempKey("LANE_CLOSED",lang)
  }
];

const CATEGORIES = ["Regulatory","Warning","Guide","Temporary"];

/* -------------------------
   UI refs
-------------------------- */
const viewBrowse = $("#viewBrowse");
const viewQuiz = $("#viewQuiz");
const viewProgress = $("#viewProgress");

const btnBrowse = $("#btnBrowse");
const btnQuiz = $("#btnQuiz");
const btnProgress = $("#btnProgress");

const searchInput = $("#search");
const categorySel = $("#category");
const grid = $("#grid");
const empty = $("#empty");
const tpl = $("#cardTpl");

const onlyStarred = $("#onlyStarred");
const onlyLearned = $("#onlyLearned");
const btnResetFilters = $("#btnResetFilters");

const quizMode = $("#quizMode");
const quizCategory = $("#quizCategory");
const btnStartQuiz = $("#btnStartQuiz");
const btnSkip = $("#btnSkip");
const btnReveal = $("#btnReveal");
const btnNext = $("#btnNext");

const quizSign = $("#quizSign");
const quizTitle = $("#quizTitle");
const quizSub = $("#quizSub");
const choicesWrap = $("#choices");
const feedback = $("#feedback");
let scoreEl = $("#score");
let streakEl = $("#streak");
let qnumEl = $("#qnum");

const pLearned = $("#pLearned");
const pStarred = $("#pStarred");
const pTotal = $("#pTotal");
const btnClearProgress = $("#btnClearProgress");

const offlineHint = $("#offlineHint");
const langSel = $("#lang");

/* -------------------------
   Helpers
-------------------------- */
function signName(s){ return (s.name && (s.name[state.lang] || s.name.en)) || ""; }
function signMeaning(s){ return (s.meaning && (s.meaning[state.lang] || s.meaning.en)) || ""; }
function signSvg(s){
  if (typeof s.svg === "function") return s.svg(state.lang);
  return s.svg;
}
function normalize(s){ return (s || "").toLowerCase().trim(); }

/* -------------------------
   i18n apply to UI
-------------------------- */
function applyI18NToUI(){
  btnBrowse.textContent = t("browse");
  btnQuiz.textContent = t("quiz");
  btnProgress.textContent = t("progress");

  searchInput.placeholder = t("searchPh");
  empty.textContent = t("noMatch");

  // chips
  const chipStar = onlyStarred.closest("label");
  const chipLearn = onlyLearned.closest("label");
  chipStar.lastChild.textContent = " " + t("starred");
  chipLearn.lastChild.textContent = " " + t("learned");
  btnResetFilters.textContent = t("resetFilters");

  // quiz selects
  quizMode.querySelector('option[value="meaning"]').textContent = t("quizPickMeaning");
  quizMode.querySelector('option[value="name"]').textContent = t("quizPickName");
  quizMode.querySelector('option[value="category"]').textContent = t("quizPickCategory");
  btnStartQuiz.textContent = t("start");
  btnSkip.textContent = t("skip");
  btnReveal.textContent = t("reveal");
  btnNext.textContent = t("next");

  // categories labels
  categorySel.querySelector('option[value="all"]').textContent = t("allCats");
  quizCategory.querySelector('option[value="all"]').textContent = t("allCats");

  // rebuild stats row to localize labels
  const statsRow = $("#viewQuiz .panel .row.small");
  statsRow.innerHTML = `
    <div class="stat">${t("score")}: <span id="score">${state.quiz.score}</span></div>
    <div class="stat">${t("streak")}: <span id="streak">${state.quiz.streak}</span></div>
    <div class="stat">${t("question")}: <span id="qnum">${state.quiz.qnum}</span></div>
  `;
  scoreEl = $("#score");
  streakEl = $("#streak");
  qnumEl = $("#qnum");

  // initial quiz text
  if (!state.quiz.running){
    quizTitle.textContent = t("pressStart");
    quizSub.textContent = t("chooseCorrect");
  }

  offlineHint.textContent = t("offlineReady");

  // Progress labels
  $("#viewProgress .tip").textContent = t("tip");
  btnClearProgress.textContent = t("clearProgress");
}

function updateQuizStats(){
  scoreEl.textContent = String(state.quiz.score);
  streakEl.textContent = String(state.quiz.streak);
  qnumEl.textContent = String(state.quiz.qnum);
}

/* -------------------------
   Init selects
-------------------------- */
function initSelectors(){
  for (const c of CATEGORIES){
    const o1 = document.createElement("option");
    o1.value = c; o1.textContent = c;
    categorySel.appendChild(o1);

    const o2 = document.createElement("option");
    o2.value = c; o2.textContent = c;
    quizCategory.appendChild(o2);
  }

  langSel.value = state.lang;
  langSel.addEventListener("change", (e) => {
    state.lang = e.target.value;
    localStorage.setItem(LS.lang, state.lang);
    applyDirAndLang();
    applyI18NToUI();
    render();
    renderProgress();
    if (state.quiz.running) nextQuestion(true);
  });
}

/* -------------------------
   Views
-------------------------- */
function setView(which){
  state.view = which;
  viewBrowse.classList.toggle("hidden", which !== "browse");
  viewQuiz.classList.toggle("hidden", which !== "quiz");
  viewProgress.classList.toggle("hidden", which !== "progress");

  btnBrowse.setAttribute("aria-pressed", which === "browse");
  btnQuiz.setAttribute("aria-pressed", which === "quiz");
  btnProgress.setAttribute("aria-pressed", which === "progress");

  if (which === "browse") render();
  if (which === "progress") renderProgress();
}

function getFilteredSigns(){
  const q = normalize(state.search);
  return SIGNS.filter(s => {
    if (state.category !== "all" && s.cat !== state.category) return false;
    if (state.onlyStarred && !starredSet.has(s.id)) return false;
    if (state.onlyLearned && !learnedSet.has(s.id)) return false;

    if (!q) return true;
    const hay = `${signName(s)} ${signMeaning(s)} ${s.cat} ${s.code}`.toLowerCase();
    return hay.includes(q);
  });
}

function render(){
  const items = getFilteredSigns();
  grid.innerHTML = "";
  empty.classList.toggle("hidden", items.length !== 0);

  for (const s of items){
    const node = tpl.content.firstElementChild.cloneNode(true);

    const badge = node.querySelector("[data-badge]");
    const art = node.querySelector("[data-art]");
    const name = node.querySelector("[data-name]");
    const meaning = node.querySelector("[data-meaning]");
    const cat = node.querySelector("[data-cat]");
    const code = node.querySelector("[data-code]");
    const starBtn = node.querySelector("[data-star]");
    const learnBtn = node.querySelector("[data-learn]");

    const isLearned = learnedSet.has(s.id);
    const isStarred = starredSet.has(s.id);

    node.classList.toggle("learned", isLearned);

    badge.textContent = isLearned ? t("learnedBadge") : t("tapToLearn");
    art.innerHTML = signSvg(s) || svgRegRect("SIGN","");
    name.textContent = signName(s);
    meaning.textContent = signMeaning(s);
    cat.textContent = s.cat;
    code.textContent = s.code;

    starBtn.textContent = isStarred ? "★" : "☆";
    learnBtn.textContent = isLearned ? t("unmarkLearned") : t("markLearned");

    const toggleLearned = () => {
      if (learnedSet.has(s.id)) learnedSet.delete(s.id);
      else learnedSet.add(s.id);
      saveSet(LS.learned, learnedSet);
      render();
      renderProgress();
    };

    learnBtn.addEventListener("click", toggleLearned);

    starBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (starredSet.has(s.id)) starredSet.delete(s.id);
      else starredSet.add(s.id);
      saveSet(LS.starred, starredSet);
      render();
      renderProgress();
    });

    art.addEventListener("click", toggleLearned);
    name.addEventListener("click", toggleLearned);

    grid.appendChild(node);
  }
}

function renderProgress(){
  pLearned.textContent = String(learnedSet.size);
  pStarred.textContent = String(starredSet.size);
  pTotal.textContent = String(SIGNS.length);
}

/* -------------------------
   Quiz
-------------------------- */
function randInt(max){ return Math.floor(Math.random() * max); }
function sample(array, n){
  const a = [...array];
  const out = [];
  while (out.length < n && a.length){
    out.push(a.splice(randInt(a.length), 1)[0]);
  }
  return out;
}
function quizPool(){
  let pool = SIGNS;
  if (state.quiz.category !== "all"){
    pool = pool.filter(s => s.cat === state.quiz.category);
  }
  return pool.length ? pool : SIGNS;
}
function buildChoices(correctSign){
  const pool = quizPool().filter(s => s.id !== correctSign.id);
  const distractors = sample(pool, 3);
  const all = sample([correctSign, ...distractors], 4);

  const mode = state.quiz.mode;
  const getLabel = (s) => {
    if (mode === "meaning") return signMeaning(s);
    if (mode === "name") return signName(s);
    return s.cat;
  };

  return all.map(s => ({
    id: s.id,
    label: getLabel(s),
    correct: s.id === correctSign.id
  }));
}

function startQuiz(){
  state.quiz.running = true;
  state.quiz.score = 0;
  state.quiz.streak = 0;
  state.quiz.qnum = 0;
  updateQuizStats();
  nextQuestion(false);
}

function nextQuestion(keepSame=false){
  state.quiz.locked = false;
  btnNext.disabled = true;
  feedback.textContent = "";

  const pool = quizPool();
  const sign = keepSame && state.quiz.current ? state.quiz.current : pool[randInt(pool.length)];
  state.quiz.current = sign;
  if (!keepSame) state.quiz.qnum += 1;

  quizSign.innerHTML = signSvg(sign) || svgRegRect("SIGN","");

  if (state.quiz.mode === "meaning"){
    quizTitle.textContent = signName(sign);
    quizSub.textContent = (state.lang === "fr") ? "Que signifie ce panneau ?" :
                          (state.lang === "sw") ? "Alama hii ina maana gani?" :
                          (state.lang === "ar") ? "ما معنى هذه الإشارة؟" :
                          (state.lang === "zh") ? "这个标志是什么意思？" :
                          (state.lang === "pt") ? "O que esta placa significa?" :
                          (state.lang === "es") ? "¿Qué significa esta señal?" :
                          "What does this sign mean?";
  } else if (state.quiz.mode === "name"){
    quizTitle.textContent = signMeaning(sign);
    quizSub.textContent = (state.lang === "fr") ? "Quel est le nom du panneau ?" :
                          (state.lang === "sw") ? "Jina la alama ni lipi?" :
                          (state.lang === "ar") ? "ما اسم الإشارة؟" :
                          (state.lang === "zh") ? "这是什么标志？" :
                          (state.lang === "pt") ? "Qual é o nome da placa?" :
                          (state.lang === "es") ? "¿Cuál es el nombre de la señal?" :
                          "Which sign name matches?";
  } else {
    quizTitle.textContent = signName(sign);
    quizSub.textContent = (state.lang === "fr") ? "Quelle est la catégorie ?" :
                          (state.lang === "sw") ? "Ni kundi gani?" :
                          (state.lang === "ar") ? "ما الفئة؟" :
                          (state.lang === "zh") ? "属于哪一类？" :
                          (state.lang === "pt") ? "Qual é a categoria?" :
                          (state.lang === "es") ? "¿Cuál es la categoría?" :
                          "Which category does it belong to?";
  }

  state.quiz.choices = buildChoices(sign);
  renderQuizChoices();
  updateQuizStats();
}

function renderQuizChoices(){
  choicesWrap.innerHTML = "";
  for (const ch of state.quiz.choices){
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.type = "button";
    btn.textContent = ch.label;
    btn.addEventListener("click", () => chooseAnswer(btn, ch));
    choicesWrap.appendChild(btn);
  }
}

function revealAnswer(){
  if (!state.quiz.current) return;
  const buttons = [...choicesWrap.querySelectorAll(".choice")];
  buttons.forEach((b, i) => {
    const ch = state.quiz.choices[i];
    if (ch.correct) b.classList.add("correct");
  });
  btnNext.disabled = false;
  feedback.textContent = `${t("ans")}: ${signName(state.quiz.current)} — ${signMeaning(state.quiz.current)}`;
}

function chooseAnswer(btn, ch){
  if (!state.quiz.current || state.quiz.locked) return;
  state.quiz.locked = true;

  const buttons = [...choicesWrap.querySelectorAll(".choice")];
  buttons.forEach(b => b.disabled = true);

  const correctIndex = state.quiz.choices.findIndex(x => x.correct);
  if (correctIndex >= 0) buttons[correctIndex].classList.add("correct");

  if (ch.correct){
    btn.classList.add("correct");
    state.quiz.score += 1;
    state.quiz.streak += 1;

    learnedSet.add(state.quiz.current.id);
    saveSet(LS.learned, learnedSet);

    feedback.textContent = `${t("correct")} ${signMeaning(state.quiz.current)}`;
  } else {
    btn.classList.add("wrong");
    state.quiz.streak = 0;
    feedback.textContent = `${t("notQuite")} ${signName(state.quiz.current)}: ${signMeaning(state.quiz.current)}`;
  }

  btnNext.disabled = false;
  updateQuizStats();
  renderProgress();
}

/* -------------------------
   Misc
-------------------------- */
function resetFilters(){
  state.search = "";
  state.category = "all";
  state.onlyStarred = false;
  state.onlyLearned = false;

  searchInput.value = "";
  categorySel.value = "all";
  onlyStarred.checked = false;
  onlyLearned.checked = false;

  render();
}
function clearProgress(){
  learnedSet.clear();
  starredSet.clear();
  saveSet(LS.learned, learnedSet);
  saveSet(LS.starred, starredSet);
  render();
  renderProgress();
}

/* -------------------------
   Events
-------------------------- */
btnBrowse.addEventListener("click", () => setView("browse"));
btnQuiz.addEventListener("click", () => setView("quiz"));
btnProgress.addEventListener("click", () => setView("progress"));

searchInput.addEventListener("input", (e) => { state.search = e.target.value; render(); });
categorySel.addEventListener("change", (e) => { state.category = e.target.value; render(); });
onlyStarred.addEventListener("change", (e) => { state.onlyStarred = e.target.checked; render(); });
onlyLearned.addEventListener("change", (e) => { state.onlyLearned = e.target.checked; render(); });
btnResetFilters.addEventListener("click", resetFilters);

quizMode.addEventListener("change", (e) => state.quiz.mode = e.target.value);
quizCategory.addEventListener("change", (e) => state.quiz.category = e.target.value);

btnStartQuiz.addEventListener("click", startQuiz);
btnSkip.addEventListener("click", () => { if (state.quiz.running) nextQuestion(false); });
btnReveal.addEventListener("click", () => { if (state.quiz.running) revealAnswer(); });
btnNext.addEventListener("click", () => { if (state.quiz.running) nextQuestion(false); });

btnClearProgress.addEventListener("click", clearProgress);

/* -------------------------
   Service worker
-------------------------- */
async function registerSW(){
  if (!("serviceWorker" in navigator)) return;
  try{
    await navigator.serviceWorker.register("./sw.js");
    offlineHint.textContent = t("swOk");
  }catch{
    offlineHint.textContent = t("swNo");
  }
}

/* -------------------------
   Init
-------------------------- */
function init(){
  initSelectors();
  applyDirAndLang();
  applyI18NToUI();
  render();
  renderProgress();
  registerSW();
}
init();
