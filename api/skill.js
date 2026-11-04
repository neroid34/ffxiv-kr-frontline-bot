// Vercel 서버리스 함수용 진입점 (Vercel에 배포할 때만 사용). 주소: /api/skill
const { buildResponse } = require("../frontline");

module.exports = (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const utterance = req.body?.userRequest?.utterance ?? "";
  res.status(200).json(buildResponse(utterance));
};
