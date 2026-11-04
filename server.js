// 카카오 i 오픈빌더 스킬 서버 (Node.js 내장 모듈만 사용, npm install 불필요)
//   POST /skill  : 오픈빌더가 호출하는 스킬 엔드포인트
//   GET  /health : 상태 확인
const http = require("http");
const { buildResponse } = require("./frontline");

function send(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/health") return send(res, 200, { ok: true });
  if (req.method !== "POST" || req.url !== "/skill") return send(res, 404, { error: "not found" });

  let raw = "";
  req.on("data", (chunk) => {
    raw += chunk;
    if (raw.length > 1e6) req.destroy(); // 비정상적으로 큰 요청 차단
  });
  req.on("end", () => {
    let utterance = "";
    try {
      utterance = JSON.parse(raw || "{}").userRequest?.utterance ?? "";
    } catch {
      // 파싱 실패 시 빈 발화로 처리 → 오늘 전장 응답
    }
    send(res, 200, buildResponse(utterance));
  });
});

if (require.main === module) {
  const port = process.env.PORT || 8000;
  server.listen(port, () => console.log(`listening on :${port}`));
}

module.exports = server;
