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
    { 
        title: "대파계란볶음밥", 
        ingredients: ["대파", "계란"],
        time: "10분",
        difficulty: "쉬움",
        youtubeUrl: "https://www.youtube.com/watch?v=1F_47ZfXvJ0", // 하루한끼 초간단 계란볶음밥
        steps: [
            "대파를 송송 썰어 기름에 볶아 파기름을 냅니다.",
            "풀어둔 계란을 한쪽에 부어 스크램블 에그를 만듭니다.",
            "밥 한 공기를 넣고 파기름, 계란과 함께 고르게 섞어가며 볶습니다.",
            "간장 한 스푼으로 풍미를 더해 완성합니다."
        ],
        cuisine: "중식"
    },
    {
        title: "소세지 볶음",
        ingredients: ["비엔나 소세지", "양파"],
        time: "12분",
        difficulty: "쉬움",
        youtubeUrl: "https://www.youtube.com/watch?v=1d97746PskI", // 백종원 쏘야볶음 영상
        steps: [
            "비엔나 소세지에 칼집을 내고 양파는 한 입 크기로 깍둑썰기합니다.",
            "케첩 2스푼, 간장 1스푼, 설탕 반 스푼을 섞어 소스를 만듭니다.",
            "팬에 식용유를 두르고 소세지와 양파를 아삭하게 볶습니다.",
            "만들어 둔 소스를 붓고 센 불에 빠르게 버무리며 볶아 완성합니다."
        ],
        cuisine: "분식"
    },
    {
        title: "애호박 된장찌개",
        ingredients: ["애호박", "두부"],
        time: "15분",
        difficulty: "쉬움",
        youtubeUrl: "https://www.youtube.com/watch?v=7uKj4b9oX4c", // 백종원 초간단 된장찌개
        steps: [
            "애호박과 두부를 한 입 크기로 썰어 준비합니다.",
            "뚝배기에 물을 붓고 된장 2스푼을 잘 풀어 끓이기 시작합니다.",
            "국물이 끓어오르면 썰어 둔 애호박을 넣고 채수가 우러나오게 끓입니다.",
            "애호박이 익어가면 두부를 넣고 한소끔 더 끓여 구수하게 완성합니다."
        ],
        cuisine: "한정식"
    },
    {
        title: "베이컨 크림 파스타",
        ingredients: ["베이컨", "우유", "양파"],
        time: "15분",
        difficulty: "보통",
        youtubeUrl: "https://www.youtube.com/watch?v=H74tSgu-p0I", // 생크림 없이 우유 크림파스타
        steps: [
            "파스타면을 끓는 물에 소금을 넣고 8분간 삶아 건져둡니다.",
            "양파와 베이컨을 먹기 좋은 크기로 채 썰어 볶아 기름을 냅니다.",
            "팬에 우유 200ml와 면수를 자작하게 붓고 끓입니다.",
            "삶아 둔 파스타면을 소스에 넣고 치즈와 후추를 넣어 꾸덕하게 볶아 완성합니다."
        ],
        cuisine: "양식"
    },
    {
        title: "두부 계란 덮밥",
        ingredients: ["두부", "계란", "양파"],
        time: "10분",
        difficulty: "쉬움",
        youtubeUrl: "https://www.youtube.com/watch?v=B7bC7Wv78sU", // 백종원 두부덮밥
        steps: [
            "두부는 주사위 모양으로 썰고, 양파는 얇게 채 썰어 준비합니다.",
            "팬에 간장 2스푼, 설탕 반 스푼, 물 4스푼을 끓여 간장 소스를 냅니다.",
            "채 썬 양파와 두부를 넣고 양파가 투명해질 때까지 졸입니다.",
            "풀어둔 계란을 두부 위에 원을 그리며 얹고 80%만 익혀 밥 위에 올려 냅니다."
        ],
        cuisine: "일본식"
    },
    {
        title: "우유 계란 푸딩",
        ingredients: ["계란", "우유"],
        time: "15분",
        difficulty: "쉬움",
        youtubeUrl: "https://www.youtube.com/watch?v=kYJ5y3Z21-g", // 초간단 렌지 푸딩
        steps: [
            "볼에 계란 1개와 우유 120ml, 설탕 1스푼을 넣고 골고루 섞어줍니다.",
            "부드러운 식감을 위해 섞은 푸딩 액을 체에 1~2번 걸러냅니다.",
            "전자레인지 전용 용기에 담아 랩을 씌운 뒤 구멍을 뚫어 1분 30초간 돌립니다.",
            "꺼내어 냉장고에 시원하게 식힌 후 캐러멜 시럽을 얹어 완성합니다."
        ],
        cuisine: "디저트"
    }
];
