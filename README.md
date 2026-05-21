# 🍏 MoEatzy (모잇지) - MVP Demo

"냉장고에 뭐 있지? 이제 쉽고 간편하게(Eat Easy) 해결하세요."

## 1. 프로젝트 개요 (Project Overview)
**MoEatzy**는 2030 1인 가구를 위한 '지능형 냉장고 관리 및 식재료 소비 최적화' 웹앱(Web App) 데모입니다.
사용자가 영수증이나 사진을 스캔하여 식재료를 쉽게 등록하면, AI가 남은 재료를 활용한 현실적인 레시피를 제안하여 음식물 쓰레기를 줄이고 식비를 절감하도록 돕습니다. 본 데모 프로젝트는 실제 서비스 작동 흐름과 유저의 '지불 의사(가짜 결제 실험)'를 검증하기 위해 제작되었습니다.

## 2. 핵심 기능 (Core Features)
- **간편 등록 (Smart Scan)**: 영수증 스캔 컨셉으로 귀찮은 수동 입력을 대체합니다.
- **스마트 인벤토리 (Inventory)**: 보유 식재료와 유통기한(D-day)을 시각적으로 파악합니다.
- **AI 잔반 셰프 (AI Recipe)**: 추가 구매 없이 현재 있는 재료로만 가능한 15분 레시피를 제안합니다.
- **절약 리포트 & 스마트 바잉 (Smart Buying)**: 식비 절감 효과를 체감하게 하고, 프리미엄 구독(가짜 결제 실험)을 유도합니다.

## 3. 기술 스택 (Tech Stack)
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla JS)
- **Design**: 시원하고 모던한 냉장고 모티프 (Ice Blue, White, Deep Navy 컬러 활용)
- **Architecture**: 뷰(HTML/CSS), 로직(app.js), 데이터(data.js)가 완벽히 분리된 모듈화 구조.

## 4. 폴더 및 파일 구조 (Directory Structure)
```text
/
├── index.html          # 메인 앱 뼈대 및 하단 네비게이션 탭 바
├── style.css           # UI 디자인, 레이아웃, 애니메이션
├── app.js              # 화면 전환 로직, 모달 팝업, 사용자 인터랙션 제어
├── data.js             # 시연용 더미 데이터 (식재료 목록, 레시피 등)
├── README.md           # 프로젝트 전체 명세 (현재 문서)
├── FEATURES.md         # 상세 MVP 기능 명세서
├── UI_UX_GUIDE.md      # 디자인 시스템 및 톤앤매너 가이드
├── DEVELOPMENT_RULES.md# AI 코딩 에이전트 행동 지침
└── TODO_LIST.md        # 작업 현황판