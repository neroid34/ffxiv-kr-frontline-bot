const test = require("node:test");
const assert = require("node:assert");
const f = require("./frontline");

const kst = (y, m, d, h = 12) => new Date(Date.UTC(y, m - 1, d, h - 9)); // KST 시각 → Date

test("한국 서버 커뮤니티 달력(2026.11)과 30일 모두 일치", () => {
  // 1일~30일. 워=워코치테
  const calendar = "워 봉바 쇄빙 온살 워 봉바 제압 온살 워 봉바 쇄빙 온살 워 봉바 제압 온살 워 봉바 쇄빙 온살 워 봉바 제압 온살 워 봉바 쇄빙 온살 워 봉바".split(" ");
  calendar.forEach((name, i) => {
    const ko = f.ROTATION[f.slotFor(f.kstDayNumber(kst(2026, 11, i + 1)))][0];
    assert.ok(ko.startsWith(name), `11/${i + 1}: 기대 ${name}, 실제 ${ko}`);
  });
});

test("2026-11-04 는 슬롯 2 (온살)", () => {
  const day = f.kstDayNumber(kst(2026, 11, 4));
  assert.strictEqual(f.slotFor(day), 2);
  assert.match(f.buildResponse("오늘 전장", kst(2026, 11, 4)).template.outputs[0].simpleText.text, /온살/);
});

test("한국 시간 자정에 전장이 바뀜", () => {
  const before = f.kstDayNumber(kst(2026, 11, 4, 23));
  const after = f.kstDayNumber(kst(2026, 11, 5, 0));
  assert.strictEqual(after, before + 1);
});

test("'내일' 발화는 내일 전장", () => {
  const text = f.buildResponse("내일 전장", kst(2026, 11, 4)).template.outputs[0].simpleText.text;
  assert.match(text, /내일의 전장 \(11\/5 목\)/);
});

test("오픈빌더 스킬 테스트 화면 요청: userRequest.utterance 는 기본값, 입력값은 action.params 에만 있음", () => {
  const body = {
    userRequest: { utterance: "발화 내용" },
    action: { params: { utterance: "내일 전장" }, detailParams: { utterance: { origin: "내일 전장", value: "내일 전장" } } },
  };
  const text = f.buildResponse(f.extractUtterance(body), kst(2026, 11, 4)).template.outputs[0].simpleText.text;
  assert.match(text, /내일의 전장 \(11\/5 목\)/);
});

test("실제 채팅 요청(action.params 없음)과 빈 본문 처리", () => {
  assert.strictEqual(f.extractUtterance({ userRequest: { utterance: "내일 전장" } }), "내일 전장");
  assert.strictEqual(f.extractUtterance({}), "");
  assert.strictEqual(f.extractUtterance(undefined), "");
  const text = f.buildResponse(f.extractUtterance({ userRequest: { utterance: "오늘 전장" } }), kst(2026, 11, 4)).template.outputs[0].simpleText.text;
  assert.match(text, /오늘의 전장 \(11\/4 수\)/);
});

test("응답에 오늘/내일 퀵리플라이 버튼 포함, 버튼 문구는 발화 규칙과 일치", () => {
  const r = f.buildResponse("오늘 전장", kst(2026, 11, 4));
  const qr = r.template.quickReplies;
  assert.deepStrictEqual(qr.map((q) => q.label), ["오늘 전장", "내일 전장"]);
  for (const q of qr) {
    assert.strictEqual(q.action, "message");
    assert.ok(q.label.length <= 14, "퀵리플라이 label 은 14자 이내");
  }
  // 버튼을 누르면 messageText 가 발화로 들어오므로 각각 오늘/내일 응답이 나와야 함
  assert.match(f.buildResponse(qr[0].messageText, kst(2026, 11, 4)).template.outputs[0].simpleText.text, /오늘의 전장/);
  assert.match(f.buildResponse(qr[1].messageText, kst(2026, 11, 4)).template.outputs[0].simpleText.text, /내일의 전장/);
});

test("카카오 응답 형식", () => {
  const r = f.buildResponse("", kst(2026, 11, 4));
  assert.strictEqual(r.version, "2.0");
  assert.ok(r.template.outputs[0].simpleText.text.includes("오늘의 전장 (11/4 수)"));
});
