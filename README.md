# FFXIV 오늘의 전장 카카오톡 챗봇

"오늘 전장"이라고 물으면 오늘의 전장 맵을 알려주는 카카오 i 오픈빌더 스킬 서버입니다. (Node.js 18+, npm 패키지 없음)

## 실행 / 테스트
    npm start        # PORT 환경변수로 포트 지정 (기본 8000)
    npm test

## 배포 (둘 중 하나)
카카오 스킬 서버는 **5초 안에 응답**해야 합니다. 일정 시간 요청이 없으면 잠드는 무료 서버는 첫 응답이 늦어 실패할 수 있으니 주의하세요.

- **Vercel (추천)**: GitHub에 올리고 Vercel에서 import → 스킬 URL `https://<프로젝트>.vercel.app/api/skill`
- **Railway / Render 등**: 시작 명령 `npm start` → 스킬 URL `https://<배포주소>/skill`

## 카카오톡 연결
1. 카카오톡 채널 개설 (business.kakao.com) → 챗봇 관리자센터(chatbot.kakao.com)에서 봇 생성 후 채널 연결
2. 오픈빌더 **스킬** 탭 → 스킬 생성, URL = 위 배포 URL
3. **시나리오** 탭 → 블록 생성, 발화에 `오늘 전장`, `내일 전장`, `전장` 등을 등록하고 봇 응답을 위 스킬로 지정
4. 배포 후 채널에서 테스트

## 로테이션
`frontline.js`의 `ROTATION` 8칸 순환입니다. 한국 시간 자정에 바뀝니다.
출처: ConsoleGamesWiki `Template:Current Frontline map` 을 한국 서버 커뮤니티 달력에 맞게 +1일 보정.
