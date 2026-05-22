// 시연용 더미 데이터 (Ingredients & Recipes Data Layer)
let ingredients = [
    { name: "대파", dday: 1, category: "채소", location: "채소칸", emoji: "🥬" },
    { name: "계란", dday: 3, category: "알류/유제품", location: "냉장실", emoji: "🥚" },
    { name: "양파", dday: 3, category: "채소", location: "채소칸", emoji: "🧅" },
    { name: "두부", dday: 5, category: "두부/콩류", location: "냉장실", emoji: "🧈" },
    { name: "비엔나 소세지", dday: 7, category: "육류", location: "냉장실", emoji: "🌭" },
    { name: "애호박", dday: 4, category: "채소", location: "채소칸", emoji: "🥒" },
    { name: "김치", dday: 14, category: "반찬/양념", location: "냉장실", emoji: "🌶️" }
];

const mockScanResult = [
    { name: "새송이버섯", dday: 4, category: "채소", location: "채소칸", emoji: "🍄" },
    { name: "우유", dday: 2, category: "알류/유제품", location: "냉장실", emoji: "🥛" },
    { name: "베이컨", dday: 3, category: "육류", location: "냉장실", emoji: "🥓" }
];

const recipes = [
    { 
        title: "대파계란볶음밥", 
        ingredients: ["대파", "계란"],
        time: "10분",
        difficulty: "쉬움",
        youtubeUrl: "https://www.youtube.com/watch?v=1F_47ZfXvJ0", // 하루한끼 초간단 계란볶음밥 (24M+ 조회수 보장 실시간 영상)
        steps: [
            "대파를 송송 썰어 기름에 볶아 파기름을 냅니다.",
            "풀어둔 계란을 한쪽에 부어 스크램블 에그를 만듭니다.",
            "밥 한 공기를 넣고 파기름, 계란과 함께 고르게 섞어가며 볶습니다.",
            "간장 한 스푼으로 풍미를 더해 완성합니다."
        ]
    },
    {
        title: "버섯베이컨크림파스타",
        ingredients: ["양파", "새송이버섯", "우유", "베이컨"],
        time: "15분",
        difficulty: "보통",
        youtubeUrl: "https://www.youtube.com/watch?v=H74tSgu-p0I", // 백종원 공식 요리비책 - 생크림 없이 우유로 만드는 초간단 크림파스타 실시간 영상
        steps: [
            "파스타면을 끓는 물에 소금을 넣고 8분간 삶아 건져둡니다.",
            "양파, 새송이버섯, 베이컨을 한 입 크기로 채 썰어둡니다.",
            "팬에 식용유를 두르고 양파, 버섯, 베이컨을 노릇하게 볶습니다.",
            "우유 200ml와 면수 한 국자를 넣고 끓이다가, 삶아둔 면을 넣어 소스가 걸쭉해질 때까지 졸여 완성합니다."
        ]
    }
];
