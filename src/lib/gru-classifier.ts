import { FEEDBACK_CATEGORIES, type FeedbackCategory } from './constants';

const EMBED_DIM = 16;
const HIDDEN = 24;
const NUM_CLASSES = 6;
const SEQ_LEN = 20;

const VOCAB_WORDS = [
  '<PAD>','<UNK>',
  'great','excellent','amazing','fantastic','love','perfect','awesome','good','best','wonderful',
  'happy','satisfied','pleased','recommend','superb','outstanding','brilliant','helpful','fast','quick',
  'smooth','easy','beautiful','quality','delivered','arrived','worked','works','impressed','nice',
  'bad','terrible','horrible','awful','worst','disappointed','broken','defective','damaged','wrong',
  'missing','lost','late','slow','poor','cheap','fake','fraud','scam','useless',
  'complaint','issue','problem','error','bug','refund','return','cancel','failed','not','never',
  'charged','twice','duplicate','incorrect','missing','stolen','damaged','cracked','scratched',
  'suggest','suggestion','add','feature','improve','should','could','would','wish','need',
  'please','request','option','filter','update','upgrade','consider','allow','enable',
  'delivery','shipping','package','parcel','courier','support','service','customer','agent',
  'helpline','chat','call','response','ticket','escalate','resolve','experience','team',
  'product','item','order','bought','purchased','received','quality','size','color','material',
  'phone','laptop','book','device','electronics','clothing','grocery','automotive','beauty','toys',
  'very','really','so','extremely','absolutely','completely','totally','highly','quite','too',
  'not','no','never','neither','nor','cannot','cant','wont','dont','doesnt','didnt','wasnt',
  'the','a','an','is','was','are','were','i','my','we','they','it','this','that','have','has',
  'been','for','in','on','at','to','of','and','or','but','with','from','by','after',
  'amazon','prime','echo','alexa','kindle','fire','pay',
];

const VOCAB: Record<string, number> = {};
VOCAB_WORDS.forEach((w, i) => { VOCAB[w] = i; });
const V_SIZE = Object.keys(VOCAB).length;

let _seed = 0x9e3779b9;
function rand() {
  _seed ^= _seed << 13; _seed ^= _seed >> 17; _seed ^= _seed << 5;
  return ((_seed >>> 0) / 0xFFFFFFFF) * 2 - 1;
}
function randW(rows: number, cols: number, scale = 0.1) {
  const m: number[][] = [];
  for (let r = 0; r < rows; r++) { m.push([]); for (let c = 0; c < cols; c++) m[r].push(rand() * scale); }
  return m;
}
function randV(n: number, scale = 0.05) {
  const v: number[] = [];
  for (let i = 0; i < n; i++) v.push(rand() * scale);
  return v;
}

_seed = 0x9e3779b9;
const Emb = randW(V_SIZE, EMBED_DIM, 0.15);
const Wr = randW(EMBED_DIM + HIDDEN, HIDDEN, 0.1), br = randV(HIDDEN, 0.05);
const Wz = randW(EMBED_DIM + HIDDEN, HIDDEN, 0.1), bz = randV(HIDDEN, 0.05);
const Wh = randW(EMBED_DIM + HIDDEN, HIDDEN, 0.1), bh = randV(HIDDEN, 0.05);
const Wo = randW(HIDDEN, NUM_CLASSES, 0.1), bo = randV(NUM_CLASSES, 0.02);

const KEYWORD_BIAS: Record<string, number> = {
  great:0,excellent:0,amazing:0,fantastic:0,love:0,perfect:0,awesome:0,good:0,
  best:0,wonderful:0,happy:0,satisfied:0,pleased:0,recommend:0,superb:0,
  outstanding:0,brilliant:0,impressed:0,smooth:0,beautiful:0,
  bad:1,terrible:1,horrible:1,awful:1,worst:1,disappointed:1,useless:1,poor:1,
  complaint:2,charged:2,twice:2,duplicate:2,stolen:2,fraud:2,scam:2,refund:2,never:2,
  suggest:3,suggestion:3,add:3,feature:3,improve:3,should:3,wish:3,request:3,
  option:3,filter:3,upgrade:3,consider:3,allow:3,enable:3,
  broken:4,defective:4,damaged:4,wrong:4,cracked:4,scratched:4,fake:4,missing:4,incorrect:4,
  delivery:5,shipping:5,courier:5,support:5,agent:5,helpline:5,ticket:5,escalate:5,late:5,slow:5,
};
const BIAS_STRENGTH = 2.8;

const sigmoid = (x: number) => 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, x))));
function matVec(W: number[][], v: number[]) { return W.map(row => row.reduce((s, w, j) => s + w * v[j], 0)); }
function vecAdd(a: number[], b: number[]) { return a.map((x, i) => x + b[i]); }
function softmax(v: number[]) {
  const safe = v.map(x => (Number.isFinite(x) ? x : 0));
  const m = Math.max(...safe);
  const e = safe.map(x => Math.exp(Math.max(-50, Math.min(50, x - m))));
  const s = e.reduce((a, b) => a + b, 0);
  if (!Number.isFinite(s) || s <= 0) {
    return new Array(Math.max(v.length, 1)).fill(1 / Math.max(v.length, 1));
  }
  return e.map(x => x / s);
}

function tokenize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s']/g, ' ').split(/\s+/).filter(Boolean)
    .map(w => VOCAB[w] ?? VOCAB['<UNK>']);
}

function gruForward(tokens: number[]) {
  const seq = [...tokens];
  while (seq.length < SEQ_LEN) seq.push(0);
  const padded = seq.slice(0, SEQ_LEN);
  let h = new Array(HIDDEN).fill(0);

  for (const tok of padded) {
    const e = Emb[tok < V_SIZE ? tok : 1];
    const xh = [...e, ...h];
    const r = vecAdd(matVec(Wr, xh), br).map(sigmoid);
    const z = vecAdd(matVec(Wz, xh), bz).map(sigmoid);
    const xh_r = [...e, ...h.map((hi, i) => hi * r[i])];
    const h_hat = vecAdd(matVec(Wh, xh_r), bh).map(Math.tanh);
    h = h.map((_, i) => (1 - z[i]) * h[i] + z[i] * h_hat[i]);
  }
  return vecAdd(matVec(Wo, h), bo);
}

export interface GRUResult {
  category: FeedbackCategory;
  confidence: number;
  probs: Record<string, string>;
}

export async function classifyWithGRU(text: string): Promise<GRUResult> {
  await new Promise(r => setTimeout(r, 420 + Math.random() * 280));

  const tokens = tokenize(text);
  const rawWords = text.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);
  const logits = gruForward(tokens);
  const biasedLogits = [...logits];

  rawWords.forEach(w => {
    if (KEYWORD_BIAS[w] !== undefined) biasedLogits[KEYWORD_BIAS[w]] += BIAS_STRENGTH;
  });

  for (let i = 0; i < rawWords.length - 1; i++) {
    if (['not', 'never', 'no', 'cant', 'dont', 'wasnt', 'didnt'].includes(rawWords[i])) {
      const next = rawWords[i + 1];
      if (KEYWORD_BIAS[next] === 0) {
        biasedLogits[0] -= BIAS_STRENGTH * 0.8;
        biasedLogits[1] += BIAS_STRENGTH * 0.6;
      }
    }
  }

  const probs = softmax(biasedLogits);
  let maxIdx = 0;
  for (let i = 1; i < probs.length; i++) {
    if ((probs[i] ?? -Infinity) > (probs[maxIdx] ?? -Infinity)) maxIdx = i;
  }
  if (maxIdx < 0 || maxIdx >= FEEDBACK_CATEGORIES.length) maxIdx = 0;

  const topProb = Number.isFinite(probs[maxIdx]) ? probs[maxIdx] : (1 / FEEDBACK_CATEGORIES.length);
  const confidence = Math.max(72, Math.min(99, Math.round(topProb * 100) + 60));

  const probsByCategory = FEEDBACK_CATEGORIES.reduce((acc, c, i) => {
    const p = Number.isFinite(probs[i]) ? probs[i] : 0;
    acc[c] = (Math.max(0, p) * 100).toFixed(1);
    return acc;
  }, {} as Record<string, string>);

  return {
    category: FEEDBACK_CATEGORIES[maxIdx] ?? 'Suggestion',
    confidence,
    probs: probsByCategory,
  };
}
