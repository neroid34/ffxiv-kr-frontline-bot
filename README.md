# FFXIV 오늘의 전장 카카오톡 챗봇

"오늘 전장"이라고 물으면 오늘의 전장 맵을 알려주는 카카오 i 오픈빌더 스킬 서버입니다. (Node.js 18+, npm 패키지 없음)

## 실행 / 테스트
    npm test         # 단위 테스트
    npm start        # 로컬 서버 실행. PORT 환경변수로 포트 지정 (기본 8000)

서버를 띄운 뒤 다른 터미널에서 확인합니다.

    curl localhost:8000/health
    curl -X POST localhost:8000/skill -H 'Content-Type: application/json' \
      -d '{"userRequest":{"utterance":"오늘 전장"}}'

엔드포인트는 `POST /skill`(오픈빌더 스킬), `GET /health`(상태 확인) 두 개입니다. 발화에 `내일`이 들어 있으면 내일 전장을, 아니면 오늘 전장을 답합니다.

## 카카오톡 연결
카카오 스킬 서버는 **5초 안에 응답**해야 합니다. 일정 시간 요청이 없으면 잠드는 무료 서버는 첫 응답이 늦어 실패할 수 있으니 주의하세요.

1. 카카오톡 채널 개설 (business.kakao.com) → 챗봇 관리자센터(chatbot.kakao.com)에서 봇 생성 후 채널 연결
2. 오픈빌더 **스킬** 탭 → 스킬 생성, URL = `https://<배포 주소>/skill`
3. **시나리오** 탭 → 블록 생성, 발화에 `오늘 전장`, `내일 전장`, `전장` 등을 등록하고 봇 응답을 위 스킬로 지정
4. 오픈빌더 **배포** 버튼을 눌러 채널에 반영한 뒤, 채널에서 테스트

> 오픈빌더에서 테스트는 되는데 실제 채널에서 안 되면, 4번의 오픈빌더 배포를 빼먹은 경우가 많습니다.
> 스킬 테스트 화면은 입력값을 `action.params.utterance`에 넣어 보내기 때문에, 서버가 `userRequest.utterance`와 `action.params.utterance`를 모두 읽도록 되어 있습니다.

## 로테이션
`frontline.js`의 `ROTATION` 8칸 순환입니다. 한국 시간 자정에 바뀝니다.
출처: ConsoleGamesWiki `Template:Current Frontline map` 을 한국 서버 커뮤니티 달력에 맞게 +1일 보정.
전장 이름은 한국 서버 커뮤니티에서 쓰는 줄임말입니다 (봉바 = 봉인된 바위섬, 제압 = 제압전).

맵이 추가·삭제되거나 주기가 바뀌면 `ROTATION`을 고치고, 한국 서버 달력과 날짜가 맞도록 `EPOCH_OFFSET_DAYS`를 조정한 뒤 `frontline.test.js`의 달력 테스트도 새 달력으로 갱신하세요.
