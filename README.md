# Sales Library

영업 사원의 역량 성장을 위한 세일즈 케이스 라이브러리입니다.

역량별 에피소드를 탐색하고, 멘토의 실전 경험을 학습하며, 롤플레잉 챗봇으로 영업 스킬을 훈련할 수 있습니다.

---

## 페이지 구성

- **메인 페이지**: 역량 구조도 및 멘토 목록
- **역량 페이지**: 역량별 에피소드 목록 및 검색
- **에피소드 페이지**: 에피소드 상세 내용 및 롤플레잉 챗봇
- **멘토 페이지**: 멘토 프로필 및 관련 에피소드

---

## 데이터 수정 방법 (Google Spreadsheet)

데이터는 Google Spreadsheet로 관리되며, 수정 후 자동으로 웹페이지에 반영됩니다.

### 시트 구성

- `mentors`: 멘토 정보
- `competencies`: 역량 정보
- `skills`: 세부 스킬 정보
- `원본`: 에피소드 입력 시트 (여기에 직접 입력)
- `episodes`: 변환된 에피소드 데이터 (자동 생성, 직접 수정 금지)

### 에피소드 추가 방법

1. `원본` 시트에 새 에피소드 입력
2. 상단 메뉴 **🛠️ 에피소드 관리 → 신규 변환 실행** 클릭
3. 웹페이지 새로고침 시 자동 반영

### 에피소드 수정 방법

1. `원본` 시트에서 해당 에피소드 수정
2. 상단 메뉴 **🛠️ 에피소드 관리 → 전체 변환 실행** 클릭
3. 웹페이지 새로고침 시 자동 반영

### 에피소드 공개/비공개

- `원본` 시트의 `공개여부` 컬럼을 `TRUEFALSE`로 설정

---

## 디자인/기능 수정 방법

### 필요한 프로그램

- [Node.js]([https://nodejs.org](https://nodejs.org)) (LTS 버전)
- [Cursor]([https://cursor.com](https://cursor.com)) (AI 코드 편집기)
- [Git]([https://git-scm.com](https://git-scm.com))

### 초기 설정

1. [GitHub 저장소]([https://github.com/계정명/sales-library](https://github.com/계정명/sales-library)) 에서 코드 다운로드: `git clone https://github.com/계정명/sales-library.git`
2. 프로젝트 폴더로 이동: `cd sales-library`
3. 패키지 설치: `npm install`
4. `.env` 파일 생성 후 아래 내용 입력: `REACT_APP_GOOGLE_API_KEY=구글API키` , `REACT_APP_SPREADSHEET_ID=스프레드시트ID`
5. (테스트) 로컬 서버 실행: `npm start`

### 수정 후 배포 방법

1. 코드 수정
2. 아래 명령어로 GitHub에 업로드:

```
git add .
git commit -m "수정 내용 개요"
git push
```

1. Vercel이 자동으로 재배포 (약 1~2분 소요)

---

## 주요 파일 구조

```
src/
├── api.js              # Google Sheets API 연동
├── pages/
│   ├── MainPage.jsx    # 메인 페이지
│   ├── SkillPage.jsx   # 역량 페이지
│   ├── EpisodePage.jsx # 에피소드 페이지
│   └── MentorPage.jsx  # 멘토 페이지
└── components/
├── Header.jsx       # 공통 헤더
├── ChatBot.jsx      # 롤플레잉 챗봇
└── LoadingSpinner.jsx # 로딩 화면
api/
└── chat.js             # 챗봇 API 서버
```

---

## 관련 계정 및 접근 권한


| 항목         | 내용                                                                                     |
| ---------- | -------------------------------------------------------------------------------------- |
| **배포**     | [Vercel]([https://vercel.com](https://vercel.com))                                     |
| **코드 저장소** | [GitHub]([https://github.com/계정명/sales-library](https://github.com/계정명/sales-library)) |
| **데이터**    | Google Spreadsheet                                                                     |
| **챗봇 AI**  | OpenAI API                                                                             |


