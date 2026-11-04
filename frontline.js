// FFXIV 전장(Frontline) 일일 로테이션 계산.
//
// 규칙 출처: ConsoleGamesWiki Template:Current Frontline map 을 한국 서버 달력에 맞게 +1일 보정
//   슬롯 = ((unix_time + 9시간) / 1일 - 20407) % 8
// 기준이 UTC+9 자정이라 한국 시간(KST) 자정에 전장이 바뀝니다.

// 위키 공식의 오프셋은 20406 이지만, 한국 서버 커뮤니티 달력(2026.11)과 하루 어긋나서 +1 보정함.
const EPOCH_OFFSET_DAYS = 20407; // (1970-01-01 기준 일수)
const DAY_MS = 86400 * 1000;
const KST_OFFSET_MS = 9 * 3600 * 1000;

// [한국어 이름, 영문 이름] — 이름을 바꾸고 싶으면 여기만 고치면 됩니다.
const SEAL_ROCK = ["봉바", "Seal Rock (Seize)"];
const FIELDS_OF_GLORY = ["쇄빙", "The Fields of Glory (Shatter)"];
const ONSAL_HAKAIR = ["온살", "Onsal Hakair (Danshig Naadam)"];
const WORQOR_CHIRTEH = ["워코치테", "Worqor Chirteh (Triumph)"];
const BORDERLAND_RUINS = ["제압", "The Borderland Ruins (Secure)"];

// 8일 주기. 한국 서버에 아직 없는 맵이 있으면 이 목록을 수정하세요.
// (맵을 빼거나 추가하면 주기 길이가 바뀌므로 EPOCH_OFFSET_DAYS 도 다시 맞춰야 합니다.)
const ROTATION = [
  SEAL_ROCK, // 0
  FIELDS_OF_GLORY, // 1
  ONSAL_HAKAIR, // 2
  WORQOR_CHIRTEH, // 3
  SEAL_ROCK, // 4
  BORDERLAND_RUINS, // 5
  ONSAL_HAKAIR, // 6
  WORQOR_CHIRTEH, // 7
];

const WEEKDAYS = "일월화수목금토";

// 한국 시간 기준 "1970-01-01 이후 지난 일수". dayOffset=1 이면 내일.
function kstDayNumber(now = new Date(), dayOffset = 0) {
  return Math.floor((now.getTime() + KST_OFFSET_MS) / DAY_MS) + dayOffset;
}

function slotFor(dayNumber) {
  const n = ROTATION.length;
  return (((dayNumber - EPOCH_OFFSET_DAYS) % n) + n) % n;
}

function formatMessage(dayNumber, label = "오늘") {
  const [ko, en] = ROTATION[slotFor(dayNumber)];
  const d = new Date(dayNumber * DAY_MS); // UTC로 읽으면 그 날짜 그대로
  const date = `${d.getUTCMonth() + 1}/${d.getUTCDate()} ${WEEKDAYS[d.getUTCDay()]}`;
  return `${label}의 전장 (${date})\n${ko}\n${en}`;
}

// 스킬 요청 본문에서 발화를 꺼냄. 실제 채팅은 userRequest.utterance 에 들어오고,
// 오픈빌더 스킬 테스트 화면은 action.params.utterance 에만 입력값이 들어가므로 둘 다 본다.
function extractUtterance(body) {
  return [body?.userRequest?.utterance, body?.action?.params?.utterance]
    .filter((v) => typeof v === "string")
    .join(" ");
}

// 카카오 스킬 응답. 발화에 '내일'이 있으면 내일 전장, 아니면 오늘 전장.
function buildResponse(utterance, now = new Date()) {
  const tomorrow = (utterance || "").includes("내일");
  const text = formatMessage(kstDayNumber(now, tomorrow ? 1 : 0), tomorrow ? "내일" : "오늘");
  return { version: "2.0", template: { outputs: [{ simpleText: { text } }] } };
}

module.exports = { ROTATION, EPOCH_OFFSET_DAYS, kstDayNumber, slotFor, formatMessage, extractUtterance, buildResponse };
