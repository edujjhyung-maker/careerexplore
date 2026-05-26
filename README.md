# 역량 기반 진로 탐색 시스템

> 제8회 교육 공공데이터 AI활용대회 출품작  
> KNOW 한국직업정보 570개 직업 데이터 기반 맞춤형 진로 추천 웹앱

## 데모

👉 [GitHub Pages 링크] (배포 후 추가)

## 주요 기능

- **교육과정 핵심 역량 검사** — 6대 역량(리더십·분석적 사고·성취/노력·책임성·혁신·신뢰성) 30문항 측정
- **AI 직업 추천** — KNOW 재직자조사 데이터 570개 직업과 역량 유사도 분석
- **희망 직업 비교** — 희망 직업 검색 후 레이더 차트로 역량 GAP 시각화
- **꿈길·커리어넷 연계** — 부족 역량 기반 체험 프로그램 자동 매칭

## 사용 데이터

| 데이터 | 출처 | 활용 내용 |
|--------|------|-----------|
| KNOW 재직자조사_성격,지식 | 공공데이터포털 | 570개 직업별 핵심 역량 평균값 |
| 꿈길 진로체험 프로그램 | ggoomgil.go.kr | 체험 프로그램 매칭 (API 연동) |
| 커리어넷 직업 정보 | career.go.kr | 직업 상세 정보 연계 (API 연동) |

## 파일 구조

```
career-app/
├── index.html          # 메인 페이지
├── css/
│   └── style.css       # 스타일시트
├── js/
│   ├── data.js         # KNOW 직업 데이터 570개
│   └── app.js          # 앱 로직 (검사·추천·시각화)
└── README.md
```

## GitHub Pages 배포 방법

1. 이 저장소를 GitHub에 push
2. Settings → Pages → Source: `main` 브랜치 → `/ (root)`
3. 저장 후 약 1~2분 뒤 `https://{username}.github.io/{repo}/` 접속

## API 연동 방법

### 1. 꿈길 API 발급

1. [공공데이터포털](https://www.data.go.kr) 로그인
2. `교육부_진로체험망_꿈길_진로체험지원센터정보` 검색 → 활용신청
3. 승인 후 마이페이지 → 인증키 복사

### 2. 커리어넷 API 발급

1. [커리어넷 OpenAPI](https://www.career.go.kr/cnet/front/openapi/openApiCoseCenter.do) 접속
2. 로그인 → 인증키 발급 신청
3. 승인 후 인증키 복사

### 3. API 키 설정

`js/app.js` 상단의 `API_CONFIG` 객체에 키를 입력:

```javascript
const API_CONFIG = {
  ggoomgil: 'YOUR_GGOOMGIL_API_KEY',   // 꿈길 API 키
  careernet: 'YOUR_CAREERNET_API_KEY',  // 커리어넷 API 키
};
```

## 기반 연구

이송이, 김희진, 정재형, 이서윤, 한옥영 (2024).  
교육과정 핵심 역량을 통한 학생 맞춤형 진로 탐색 시스템 개발에 관한 연구.  
*2024년 한국컴퓨터교육학회 하계 학술발표논문집*, 28(2).

## 라이선스

- 소스코드: MIT License  
- KNOW 데이터: 공공데이터포털 공공저작물 자유이용 허락(공공누리 1유형)


