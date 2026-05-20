const fs = require('fs');

// 1. Update data.js mockScripts
const newMockScripts = `const mockScripts = [
  {
    targetCategory: "All",
    situation: { ko: "주문할 때", en: "When Ordering", uz: "Buyurtma berishda", ur: "آرڈر کرتے وقت", mn: "Захиалах үед", ne: "अर्डर गर्दा", vi: "Khi gọi món", si: "ඇණවුම් කරන විට" },
    scripts: [
      { ko: "이거 하나 주세요.", pronunciation: "Igeo hana juseyo.", en: "I'll have one of this, please." },
      { ko: "포장해 주세요.", pronunciation: "Pojanghae juseyo.", en: "To go, please." },
      { ko: "여기 주문할게요.", pronunciation: "Yeogi jumunhalgeyo.", en: "I'd like to order, please." },
      { ko: "제일 잘 나가는 메뉴가 뭐예요?", pronunciation: "Jeil jal naganeun menyuga mwoyeyo?", en: "What is the most popular menu?" },
      { ko: "이 메뉴는 많이 매운가요?", pronunciation: "I menyuneun mani maeungayo?", en: "Is this menu very spicy?" },
      { ko: "덜 맵게 해주세요.", pronunciation: "Deol maepge haejuseyo.", en: "Make it less spicy, please." },
      { ko: "이거랑 이거 주세요.", pronunciation: "Igeorang igeo juseyo.", en: "I'll have this and this, please." },
      { ko: "음료수 하나 추가해 주세요.", pronunciation: "Eumnyosu hana chugahae juseyo.", en: "Add one drink, please." },
      { ko: "고수는 빼주세요.", pronunciation: "Gosuneun ppaejuseyo.", en: "No cilantro, please." },
      { ko: "얼마나 걸리나요?", pronunciation: "Eolmana geollinayo?", en: "How long will it take?" }
    ]
  },
  {
    targetCategory: "Restaurant",
    situation: { ko: "식당에서", en: "Dining In", uz: "Restoranda", ur: "ریستوراں میں", mn: "Ресторанд", ne: "रेस्टुरेन्टमा", vi: "Tại nhà hàng", si: "අවන්හලේදී" },
    scripts: [
      { ko: "먹고 갈게요.", pronunciation: "Meokgo galgeyo.", en: "For here, please." },
      { ko: "물 좀 주시겠어요?", pronunciation: "Mul jom jusigesseoyo?", en: "Could I have some water, please?" },
      { ko: "앞접시 좀 주세요.", pronunciation: "Apjeopsi jom juseyo.", en: "Could I get a small plate?" },
      { ko: "반찬 좀 더 주세요.", pronunciation: "Banchan jom deo juseyo.", en: "Could I have more side dishes?" },
      { ko: "화장실이 어디예요?", pronunciation: "Hwajangsili eodiyeyo?", en: "Where is the restroom?" },
      { ko: "휴지 좀 주시겠어요?", pronunciation: "Hyuji jom jusigesseoyo?", en: "Could I get some tissues?" },
      { ko: "남은 음식 포장해 주세요.", pronunciation: "Nameun eumsik pojanghae juseyo.", en: "Could you pack the leftovers, please?" },
      { ko: "여기 치워주실 수 있나요?", pronunciation: "Yeogi chiwojusil su innayo?", en: "Could you clear the table, please?" },
      { ko: "숟가락/젓가락 하나 더 주세요.", pronunciation: "Sutgarak/Jeotgarak hana deo juseyo.", en: "One more spoon/chopsticks, please." },
      { ko: "맛있어요!", pronunciation: "Masisseoyo!", en: "It's delicious!" }
    ]
  },
  {
    targetCategory: "Restaurant",
    situation: { ko: "알레르기/요청사항", en: "Allergies / Special Requests", uz: "Allergiya", ur: "الرجی", mn: "Харшил", ne: "एलर्जी", vi: "Dị ứng", si: "අසාත්මිකතා" },
    scripts: [
      { ko: "계란 빼주세요.", pronunciation: "Gyeran ppaejuseyo.", en: "No eggs, please." },
      { ko: "제가 견과류 알레르기가 있어요.", pronunciation: "Jega gyeongwaryu allereugiga isseoyo.", en: "I am allergic to nuts." },
      { ko: "여기에 땅콩이 들어가나요?", pronunciation: "Yeogie ttangkongi deureoganayo?", en: "Are there peanuts in this?" },
      { ko: "오이는 빼주세요.", pronunciation: "Oineun ppaejuseyo.", en: "No cucumbers, please." },
      { ko: "고기 들어간 메뉴인가요?", pronunciation: "Gogi deureogan menyuingayo?", en: "Does this menu contain meat?" },
      { ko: "돼지고기는 못 먹어요.", pronunciation: "Dwaejigogineun mot meogeoyo.", en: "I can't eat pork." },
      { ko: "채식 메뉴가 있나요?", pronunciation: "Chaesik menyuga innayo?", en: "Do you have vegetarian options?" },
      { ko: "해산물 알레르기가 있어요.", pronunciation: "Haesanmul allereugiga isseoyo.", en: "I have a seafood allergy." },
      { ko: "우유나 버터가 들어가나요?", pronunciation: "Uyuna beoteoga deureoganayo?", en: "Does this contain milk or butter?" },
      { ko: "짜지 않게 해주세요.", pronunciation: "Jjaji anke haejuseyo.", en: "Make it less salty, please." }
    ]
  },
  {
    targetCategory: "Restaurant",
    situation: { ko: "결제할 때", en: "Payment", uz: "To'lov", ur: "ادائیگی", mn: "Төлбөр", ne: "भुक्तानी", vi: "Thanh toán", si: "ගෙවීම" },
    scripts: [
      { ko: "얼마예요?", pronunciation: "Eolmayeyo?", en: "How much is it?" },
      { ko: "카드 결제 되나요?", pronunciation: "Kadeu gyeolje doenayo?", en: "Do you accept credit cards?" },
      { ko: "현금 결제할게요.", pronunciation: "Hyeongeum gyeoljehalgeyo.", en: "I'll pay in cash." },
      { ko: "영수증 주세요.", pronunciation: "Yeongsujeung juseyo.", en: "Receipt, please." },
      { ko: "포인트 적립해 주세요.", pronunciation: "Pointeu jeongniphae juseyo.", en: "I'd like to earn reward points." },
      { ko: "따로따로 계산해 주세요.", pronunciation: "Ttarottaro gyesanhae juseyo.", en: "Can we pay separately?" },
      { ko: "계좌 이체 되나요?", pronunciation: "Gyejwa iche doenayo?", en: "Do you accept bank transfers?" },
      { ko: "카카오페이 되나요?", pronunciation: "Kakaopei doenayo?", en: "Do you accept Kakao Pay?" },
      { ko: "영수증은 버려주세요.", pronunciation: "Yeongsujeungeun beoryeojuseyo.", en: "You can throw away the receipt." },
      { ko: "잘 먹었습니다.", pronunciation: "Jal meogeotseumnida.", en: "I ate well. (Thank you for the meal)" }
    ]
  }
];`;

let dataJs = fs.readFileSync('data.js', 'utf8');
const startIdx = dataJs.indexOf('const mockScripts = [');
const endIdx = dataJs.indexOf('const initialData = [');
if (startIdx !== -1 && endIdx !== -1) {
  dataJs = dataJs.substring(0, startIdx) + newMockScripts + '\\n\\n' + dataJs.substring(endIdx);
  fs.writeFileSync('data.js', dataJs);
}

// 2. Update app.js categories
let appJs = fs.readFileSync('app.js', 'utf8');
appJs = appJs.replace(
  "const categories = ['Ordering', 'Dining In', 'Allergies'];",
  "const categories = ['Ordering', 'Dining In', 'Allergies', 'Payment'];"
);
appJs = appJs.replace(
  "const catMap = { 'Ordering': 'When Ordering', 'Dining In': 'Dining In', 'Allergies': 'Allergies / Special Requests' };",
  "const catMap = { 'Ordering': 'When Ordering', 'Dining In': 'Dining In', 'Allergies': 'Allergies / Special Requests', 'Payment': 'Payment' };"
);
fs.writeFileSync('app.js', appJs);

console.log('Successfully added more sentences, pronunciation, and Payment category!');
