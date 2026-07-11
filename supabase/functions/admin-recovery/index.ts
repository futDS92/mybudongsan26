type RecoveryPayload = {
  recoveryName?: string;
  recoveryEmail?: string;
  tempPasscode?: string;
  expiresAt?: number;
  origin?: string;
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return json({ sent: false, error: "Method not allowed" }, 405);
  }

  const sharedSecret = Deno.env.get("RECOVERY_SHARED_SECRET") || "";
  if (sharedSecret) {
    const token = req.headers.get("x-recovery-secret") || "";
    if (token !== sharedSecret) {
      return json({ sent: false, error: "Unauthorized" }, 401);
    }
  }

  const payload = (await safeJson(req)) as RecoveryPayload;
  const recoveryName = String(payload.recoveryName || "").trim();
  const recoveryEmail = String(payload.recoveryEmail || "").trim();
  const tempPasscode = String(payload.tempPasscode || "").trim();
  const expiresAt = Number(payload.expiresAt || 0);
  const origin = String(payload.origin || "").trim();

  if (!recoveryName || !recoveryEmail || !tempPasscode || !expiresAt) {
    return json({ sent: false, error: "Missing recovery payload" }, 400);
  }

  const resendKey = Deno.env.get("RESEND_API_KEY") || "";
  const from = Deno.env.get("RECOVERY_FROM_EMAIL") || "";
  if (!resendKey || !from) {
    return json({ sent: false, error: "Email provider is not configured" }, 501);
  }

  const subject = "부동산 모니터 임시 비밀번호";
  const text = [
    `${recoveryName}님, 관리자 임시 비밀번호를 발급했습니다.`,
    "",
    `임시 비밀번호: ${tempPasscode}`,
    `만료 시각: ${new Date(expiresAt).toLocaleString("ko-KR")}`,
    "",
    "로그인 화면의 'Admin 패스코드 또는 임시 비밀번호' 칸에 위 값을 입력한 뒤 새 비밀번호를 설정하세요.",
    origin ? `도메인: ${origin}` : "",
  ].filter(Boolean).join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [recoveryEmail],
      subject,
      text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return json({ sent: false, error: errorText || `Resend ${response.status}` }, 502);
  }

  return json({ sent: true });
});

async function safeJson(req: Request): Promise<RecoveryPayload> {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
