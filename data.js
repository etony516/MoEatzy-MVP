// 시연용 더미 데이터 (Ingredients & Recipes Data Layer)
let ingredients = [
    { name: "대파", dday: 1, category: "채소", location: "채소칸", emoji: "🥬", quantity: "반" },
    { name: "계란", dday: 3, category: "알류/유제품", location: "냉장실", emoji: "🥚", quantity: "전체" },
    { name: "양파", dday: 3, category: "채소", location: "채소칸", emoji: "🧅", quantity: "조금 남음" },
    { name: "두부", dday: 5, category: "두부/콩류", location: "냉장실", emoji: "🧈", quantity: "전체" },
    { name: "비엔나 소세지", dday: 7, category: "육류", location: "냉장실", emoji: "🌭", quantity: "반" },
    { name: "애호박", dday: 4, category: "채소", location: "채소칸", emoji: "🥒", quantity: "조금 남음" },
    { name: "김치", dday: 14, category: "반찬/양념", location: "냉장실", emoji: "🌶️", quantity: "전체" }
];

const mockScanResult = [
    { name: "새송이버섯", dday: 4, category: "채소", location: "채소칸", emoji: "🍄", quantity: "전체" },
    { name: "우유", dday: 2, category: "알류/유제품", location: "냉장실", emoji: "🥛", quantity: "전체" },
    { name: "베이컨", dday: 3, category: "육류", location: "냉장실", emoji: "🥓", quantity: "전체" }
];

const recipes = [
    // === 1. 한정식 (Korean Cuisine) ===
    { 
        title: "애호박 된장찌개", 
        ingredients: ["애호박", "두부"],
        time: "15분",
        difficulty: "쉬움",
        youtubeUrl: "https://www.youtube.com/watch?v=7uKj4b9oX4c",
        steps: [
            "애호박과 두부를 한 입 크기로 썰어 준비합니다.",
            "뚝배기에 물을 붓고 된장 2스푼을 잘 풀어 끓이기 시작합니다.",
            "국물이 끓어오르면 썰어 둔 애호박을 넣고 채수가 우러나오게 끓입니다.",
            "애호박이 익어가면 두부를 넣고 한소끔 더 끓여 구수하게 완성합니다."
        ],
        cuisine: "한정식"
    },
    { 
        title: "초간단 대파 계란국", 
        ingredients: ["계란", "대파"],
        time: "8분",
        difficulty: "쉬움",
        youtubeUrl: "https://www.youtube.com/watch?v=kY3j9Z56w1Q",
        steps: [
            "냄비에 물 500ml를 붓고 동전 육수나 국간장 1스푼을 넣어 끓입니다.",
            "대파는 어슷하게 송송 썰고, 계란은 소금 한 꼬집을 넣어 잘 풀어둡니다.",
            "육수가 팔팔 끓으면 풀어둔 계란물을 원을 그리며 천천히 부어줍니다.",
            "계란이 익어 몽글몽글하게 떠오르면 송송 썬 대파를 넣고 불을 꺼 완성합니다."
        ],
        cuisine: "한정식"
    },
    { 
        title: "두부 김치 두루치기", 
        ingredients: ["두부", "김치", "베이컨"],
        time: "15분",
        difficulty: "쉬움",
        youtubeUrl: "https://www.youtube.com/watch?v=5y2WnB_eXzo",
        steps: [
            "두부는 도톰하게 썰어 끓는 물에 소금을 넣고 살짝 데쳐 건져둡니다.",
            "베이컨은 한 입 크기로 썰고, 김치는 송송 썰어 준비합니다.",
            "팬에 베이컨을 먼저 볶아 기름을 낸 뒤 신김치와 설탕 반 스푼을 넣고 달달 볶아줍니다.",
            "접시 중앙에 볶은 김치를 담고 주변에 데친 두부를 미려하게 둘러 완성합니다."
        ],
        cuisine: "한정식"
    },

    // === 2. 중식 (Chinese Cuisine) ===
    { 
        title: "대파계란볶음밥", 
        ingredients: ["대파", "계란"],
        time: "10분",
        difficulty: "쉬움",
        youtubeUrl: "https://www.youtube.com/watch?v=1F_47ZfXvJ0",
        steps: [
            "대파를 송송 썰어 기름에 볶아 파기름을 냅니다.",
            "풀어둔 계란을 한쪽에 부어 스크램블 에그를 만듭니다.",
            "밥 한 공기를 넣고 파기름, 계란과 함께 고르게 섞어가며 볶습니다.",
            "간장 한 스푼으로 향을 내어 완성합니다."
        ],
        cuisine: "중식"
    },
    { 
        title: "마파두부 덮밥", 
        ingredients: ["두부", "대파", "양파"],
        time: "12분",
        difficulty: "보통",
        youtubeUrl: "https://www.youtube.com/watch?v=3g8K91T4tJc",
        steps: [
            "두부는 사각 모양으로 썰고, 양파와 대파는 잘게 다져줍니다.",
            "팬에 식용유를 두르고 파와 양파를 볶다 두반장 1.5스푼(또는 된장1+고춧가루1)을 넣고 볶습니다.",
            "물 반 컵을 붓고 끓어오르면 썰어둔 두부를 넣고 약한 불에 조려줍니다.",
            "전분물을 조금씩 부어 걸쭉하게 농도를 맞춘 뒤 따뜻한 밥 위에 얹어냅니다."
        ],
        cuisine: "중식"
    },
    { 
        title: "토마토 달걀 볶음", 
        ingredients: ["계란", "대파"],
        time: "7분",
        difficulty: "쉬움",
        youtubeUrl: "https://www.youtube.com/watch?v=hZJc33wQ1U8",
        steps: [
            "계란은 소금 한 꼬집을 넣고 잘 풀고, 대파는 송송 썰어 준비합니다.",
            "팬에 기름을 넉넉히 두르고 계란물을 부어 스크램블 에그를 만들어 따로 덜어둡니다.",
            "팬에 대파를 볶아 향을 낸 뒤, 토마토(혹은 케첩 2스푼과 굴소스 반 스푼)를 넣고 함께 볶습니다.",
            "만들어 둔 계란 스크램블을 넣고 빠르게 휘리릭 섞어 부드럽게 완성합니다."
        ],
        cuisine: "중식"
    },

    // === 3. 양식 (Western Cuisine) ===
    { 
        title: "베이컨 크림 파스타", 
        ingredients: ["베이컨", "우유", "양파"],
        time: "15분",
        difficulty: "보통",
        youtubeUrl: "https://www.youtube.com/watch?v=H74tSgu-p0I",
        steps: [
            "파스타면을 끓는 물에 소금을 넣고 8분간 삶아 건져둡니다.",
            "양파와 베이컨을 먹기 좋은 크기로 채 썰어 볶아 기름을 냅니다.",
            "팬에 우유 200ml와 면수를 자작하게 붓고 끓입니다.",
            "삶아 둔 파스타면을 소스에 넣고 치즈와 후추를 넣어 꾸덕하게 볶아 완성합니다."
        ],
        cuisine: "양식"
    },
    { 
        title: "두부 카프레제 샐러드", 
        ingredients: ["두부", "양파"],
        time: "8분",
        difficulty: "쉬움",
        youtubeUrl: "https://www.youtube.com/watch?v=jW9O5B3lQeo",
        steps: [
            "두부를 반으로 자른 뒤 0.8cm 두께로 썰어 물기를 완전히 빼둡니다.",
            "양파는 아주 얇게 채 썰어 매운맛을 빼기 위해 찬물에 5분간 담갔다 건집니다.",
            "두부 슬라이스 사이사이에 물기를 뺀 양파와 올리브유, 식초, 설탕을 섞은 소스를 올립니다.",
            "발사믹 글레이즈나 통후추를 살짝 얹어 산뜻하고 건강하게 즐깁니다."
        ],
        cuisine: "양식"
    },
    { 
        title: "베이컨 버섯 오믈렛", 
        ingredients: ["베이컨", "새송이버섯", "계란"],
        time: "10분",
        difficulty: "쉬움",
        youtubeUrl: "https://www.youtube.com/watch?v=8MskmYfFf3A",
        steps: [
            "새송이버섯과 베이컨은 잘게 다지고, 계란 2개는 우유 2스푼과 소금을 섞어 풀어줍니다.",
            "팬에 버터를 살짝 녹이고 다진 베이컨과 새송이버섯을 노릇하게 볶아 덜어둡니다.",
            "다시 팬에 식용유를 두르고 계란물을 부어 젓가락으로 저으며 몽글몽글하게 익힙니다.",
            "계란이 반쯤 익었을 때 가운데에 볶아둔 버섯과 베이컨을 올리고 반으로 접어 모양을 잡아 완성합니다."
        ],
        cuisine: "양식"
    },

    // === 4. 일본식 (Japanese Cuisine) ===
    { 
        title: "두부 계란 덮밥", 
        ingredients: ["두부", "계란", "양파"],
        time: "10분",
        difficulty: "쉬움",
        youtubeUrl: "https://www.youtube.com/watch?v=B7bC7Wv78sU",
        steps: [
            "두부는 주사위 모양으로 썰고, 양파는 얇게 채 썰어 준비합니다.",
            "팬에 간장 2스푼, 설탕 반 스푼, 물 4스푼을 끓여 간장 소스를 만듭니다.",
            "채 썬 양파와 두부를 넣고 양파가 투명해질 때까지 조립니다.",
            "풀어둔 계란을 두부 위에 원을 그리며 얹고 80%만 익혀 밥 위에 올려 냅니다."
        ],
        cuisine: "일본식"
    },
    { 
        title: "베이컨 야끼소바 볶음면", 
        ingredients: ["베이컨", "양파", "대파"],
        time: "12분",
        difficulty: "보통",
        youtubeUrl: "https://www.youtube.com/watch?v=x7t1hQ1-6Wk",
        steps: [
            "라면이나 우동면을 끓는 물에 삶은 뒤 찬물에 헹궈 물기를 빼둡니다.",
            "베이컨은 2cm 폭으로 썰고, 양파와 대파는 먹기 좋게 채 썹니다.",
            "팬에 베이컨과 파를 볶아 기름을 낸 뒤 면과 양파를 넣고 볶습니다.",
            "돈가스 소스 2스푼, 굴소스 1스푼, 올리고당 반 스푼 소스를 넣고 센 불에 볶아 불맛을 입힙니다."
        ],
        cuisine: "일본식"
    },
    { 
        title: "버섯 두부 맑은 장국", 
        ingredients: ["새송이버섯", "두부", "대파"],
        time: "10분",
        difficulty: "쉬움",
        youtubeUrl: "https://www.youtube.com/watch?v=VlT68593Jyo",
        steps: [
            "두부와 새송이버섯은 얇게 깍둑썰기하고, 대파는 얇게 송송 썰어둡니다.",
            "냄비에 물 500ml와 쯔유 3스푼(혹은 국간장1)을 넣고 장국 베이스를 끓입니다.",
            "물이 끓어오르면 썰어둔 버섯과 두부를 넣고 중불에 3분간 더 끓여줍니다.",
            "마지막에 송송 썬 대파를 넣고 바로 불을 꺼 맑고 담백한 풍미를 냅니다."
        ],
        cuisine: "일본식"
    },

    // === 5. 분식 (Snacks & Quick Meals) ===
    { 
        title: "소세지 야채 볶음", 
        ingredients: ["비엔나 소세지", "양파"],
        time: "12분",
        difficulty: "쉬움",
        youtubeUrl: "https://www.youtube.com/watch?v=1d97746PskI",
        steps: [
            "비엔나 소세지에 칼집을 내고 양파는 한 입 크기로 깍둑썰기합니다.",
            "케첩 2스푼, 간장 1스푼, 설탕 반 스푼을 섞어 소스를 만듭니다.",
            "팬에 식용유를 두르고 소세지와 양파를 아삭하게 볶습니다.",
            "만들어 둔 소스를 붓고 센 불에 빠르게 버무리며 볶아 완성합니다."
        ],
        cuisine: "분식"
    },
    { 
        title: "베이컨 김치 볶음밥", 
        ingredients: ["김치", "베이컨", "계란"],
        time: "10분",
        difficulty: "쉬움",
        youtubeUrl: "https://www.youtube.com/watch?v=O15N2_BskI8",
        steps: [
            "베이컨은 한 입 크기로, 김치는 잘게 가위로 썰어 준비합니다.",
            "팬에 베이컨을 먼저 바삭하게 볶아 기름을 낸 후 김치와 설탕 한 꼬집을 넣고 달달 볶아줍니다.",
            "김치가 투명해지면 밥을 넣고 굴소스 반 스푼을 더해 고르게 볶아줍니다.",
            "밥 위에 완벽한 반숙 계란후라이를 하나 올려 노른자를 깨뜨려 비벼 먹습니다."
        ],
        cuisine: "분식"
    },
    { 
        title: "소세지 부대라면", 
        ingredients: ["비엔나 소세지", "대파", "김치"],
        time: "8분",
        difficulty: "쉬움",
        youtubeUrl: "https://www.youtube.com/watch?v=7uR3W4P92_g",
        steps: [
            "비엔나 소세지는 동글게 편 썰고, 대파는 송송 썰고, 신김치는 가볍게 다집니다.",
            "냄비에 물 550ml와 다진 신김치 1스푼을 넣고 물을 끓이기 시작합니다.",
            "물이 끓으면 라면 수프, 면, 편 썬 소세지를 함께 넣고 끓여 깊은 육수를 냅니다.",
            "면이 꼬들하게 익었을 때 송송 썬 대파를 듬뿍 올리고 1분 더 끓여 부대찌개 맛을 완성합니다."
        ],
        cuisine: "분식"
    },

    // === 6. 디저트 (Dessert) ===
    { 
        title: "우유 계란 푸딩", 
        ingredients: ["계란", "우유"],
        time: "15분",
        difficulty: "쉬움",
        youtubeUrl: "https://www.youtube.com/watch?v=kYJ5y3Z21-g",
        steps: [
            "볼에 계란 1개와 우유 120ml, 설탕 1스푼을 넣고 골고루 섞어줍니다.",
            "부드러운 식감을 위해 섞은 푸딩 액을 체에 1~2번 걸러냅니다.",
            "전자레인지 전용 용기에 담아 랩을 씌운 뒤 구멍을 뚫어 1분 30초간 돌립니다.",
            "꺼내어 냉장고에 시원하게 식힌 후 캐러멜 시럽을 얹어 완성합니다."
        ],
        cuisine: "디저트"
    },
    { 
        title: "촉촉한 프렌치 토스트", 
        ingredients: ["계란", "우유"],
        time: "10분",
        difficulty: "쉬움",
        youtubeUrl: "https://www.youtube.com/watch?v=0kY8S5wZ6Qk",
        steps: [
            "넓은 그릇에 계란 1개, 우유 50ml, 설탕 반 스푼을 섞어 계란물을 만듭니다.",
            "남은 식빵이나 빵을 먹기 좋은 크기로 썰어 계란물에 푹 적셔 흡수시킵니다.",
            "팬에 식용유나 버터를 두르고 약불에서 빵의 겉면이 노릇해지도록 은은히 굽습니다.",
            "완성된 토스트 위에 설탕이나 메이플 시럽을 솔솔 뿌려 달콤하게 즐깁니다."
        ],
        cuisine: "디저트"
    },
    { 
        title: "고소한 두부 바나나 쉐이크", 
        ingredients: ["두부", "우유"],
        time: "5분",
        difficulty: "쉬움",
        youtubeUrl: "https://www.youtube.com/watch?v=VlU9d_591X0",
        steps: [
            "두부 1/4모(약 80g)는 찬물에 헹군 뒤 물기를 뺍니다.",
            "믹서기에 두부와 흰 우유 200ml, 꿀이나 올리고당 1.5스푼을 넣어줍니다.",
            "바나나(혹은 견과류)가 있다면 함께 넣고 덩어리가 없을 때까지 완전히 곱게 갈아줍니다.",
            "컵에 예쁘게 담아 바쁜 아침 식사 대용이나 고단백 건강 디저트로 부드럽게 마십니다."
        ],
        cuisine: "디저트"
    }
];
