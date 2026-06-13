import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Shyam Pro Services — AI Career Tools & Digital Marketing";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0B0B23",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* top gradient bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 12,
            display: "flex",
            background: "linear-gradient(90deg,#10B981,#0EA5E9,#8B5CF6)",
          }}
        />

        {/* logo mark + name */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg,#10B981,#0EA5E9)",
              color: "#fff",
              fontSize: 52,
              fontWeight: 900,
              marginRight: 28,
            }}
          >
            S
          </div>
          <div style={{ display: "flex", fontSize: 56, fontWeight: 900, color: "#fff" }}>
            Shyam Pro&nbsp;<span style={{ color: "#10B981" }}>Services</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 40,
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.2,
            marginBottom: 24,
          }}
        >
          AI Career Tools + Digital Marketing
        </div>

        <div style={{ display: "flex", fontSize: 28, color: "#9CA3CF", maxWidth: 900 }}>
          LinkedIn &amp; Naukri optimization · ATS resume scanner · Resume writing · Portfolio ·
          SEO, Social, Google &amp; Meta Ads
        </div>

        {/* bottom accent pills */}
        <div style={{ display: "flex", marginTop: 44, gap: 14 }}>
          {["Career", "Business", "Marketing"].map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                fontSize: 24,
                color: "#10B981",
                border: "2px solid #10B98155",
                borderRadius: 999,
                padding: "8px 22px",
                marginRight: 14,
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
