const fs = require('fs');
let data = fs.readFileSync('data.js', 'utf8');

const pronunciations = {
  "이거 하나 주세요.": "Igeo hana juseyo.",
  "포장해 주세요.": "Pojanghae juseyo.",
  "먹고 갈게요.": "Meokgo galgeyo.",
  "얼마예요?": "Eolmayeyo?",
  "카드 결제 되나요?": "Kadeu gyeolje doenayo?",
  "현금 결제할게요.": "Hyeongeum gyeoljehalgeyo.",
  "영수증 주세요.": "Yeongsujeung juseyo.",
  "메뉴판 다시 보여주세요.": "Menyupan dasi boyeojuseyo.",
  "제일 잘 나가는 메뉴가 뭐예요?": "Jeil jal naganeun menyuga mwoyeyo?",
  "화장실이 어디예요?": "Hwajangsili eodiyeyo?",
  "남은 음식 포장해 주세요.": "Nameun eumsik pojanghae juseyo.",
  "포인트 적립해 주세요.": "Pointeu jeongniphae juseyo.",
  "계란 빼주세요.": "Gyeran ppaejuseyo.",
  "물 좀 주시겠어요?": "Mul jom jusigesseoyo?"
};

let newData = data.split('\\n').map(line => {
  for (const [ko, pro] of Object.entries(pronunciations)) {
    if (line.includes('ko: "' + ko + '"') && !line.includes('pronunciation')) {
      return line.replace('ko: "' + ko + '",', 'ko: "' + ko + '", pronunciation: "' + pro + '",');
    }
  }
  return line;
}).join('\\n');

fs.writeFileSync('data.js', newData);
console.log('Added pronunciations');
