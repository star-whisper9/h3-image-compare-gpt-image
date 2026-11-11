import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "./styles.css";
import gallery from "./gallery.json";

const SCENE_NOTES = {
  "01_still_life": {
    shortTitle: "窗边静物",
    tag: "写实摄影",
    focus: ["釉面与玻璃折射", "左前/中后/右前站位", "单侧柔光同向投影"],
    summary:
      "50mm 视角下的基础材质与空间关系测试，重点看陶瓷釉面、半杯清水的边缘折射、橙皮毛孔肌理，以及三件物品阴影方向是否统一。",
  },
  "02_watercolor": {
    shortTitle: "雨后小屋",
    tag: "水彩绘本",
    focus: ["冷压纸纹颗粒", "湿画法自然水痕", "水洼色彩倒影"],
    summary:
      "检验模型能否脱离数码精修与塑胶高光感，表现出真实透明水彩的晕染、干笔飞白，以及浅水洼对黄雨衣与红屋顶的微弱倒影。",
  },
  "03_anime": {
    shortTitle: "屋顶信使",
    tag: "赛璐璐动画",
    focus: ["二分色块阴影", "海风吹拂动态", "全身手脚与道具"],
    summary:
      "日系动画剧场版视觉风格，考察干净的线稿与冷暖赛璐璐光影，同时看全身入镜时头、手、脚比例，以及伞尖触地和无字信封的细节兑现。",
  },
  "04_clay_shop": {
    shortTitle: "狐狸面包房",
    tag: "定格黏土",
    focus: ["手工捏塑指纹", "盘中食物精确计数", "墙钟 10:10 指针"],
    summary:
      "定格动画质感与多主体指令遵循测试：蓝盘 2 只牛角包、白盘 1 只黑麦面包、绿盘 3 只草莓蛋糕，外加右侧墙面指向十点十分的挂钟。",
  },
  "05_cinema": {
    shortTitle: "雨夜交接",
    tag: "电影剧照",
    focus: ["双人四手交互", "包裹接触关系", "雨夜青蓝琥珀影调"],
    summary:
      "高难度人物交互场景：左女左手撑伞、右手递出包裹，右男双手托底承接，画面定格于交接未完的一瞬，极度考验手部解剖结构与物体唯一性。",
  },
  "06_poster": {
    shortTitle: "春日书展",
    tag: "中文平面海报",
    focus: ["中文笔画准确度", "多级信息排版", "纯平面非样机"],
    summary:
      "直测中英文字形生成与瑞士网格排版：主副标题、展期、时间、场馆及底部口号需逐字准确、层级分明，且直接输出海报平面而非墙面样机。",
  },
  "07_cutaway": {
    shortTitle: "山间观测站",
    tag: "建筑轴测剖视",
    focus: ["无灭点轴测视角", "四室功能分区", "楼梯与楼板开口逻辑"],
    summary:
      "针管笔淡彩风格的建筑空间逻辑测试：一楼厨房与工作室、二楼卧室与圆顶观测室分区明确，右侧楼梯抵达二楼处须有真实楼板开口与防跌落围栏。",
  },
  "08_comic": {
    shortTitle: "失而复得",
    tag: "连续四格漫画",
    focus: ["2×2 等大分格", "人物与猫跨格一致", "无字视线叙事"],
    summary:
      "连续视觉叙事测试：四格内保持短发圆眼镜女主与“左耳黑、右耳白、黑尾尖”白猫的特征统一，不借任何文字对白，仅靠动作讲清红围巾失而复得。",
  },
};

const MODEL_META = {
  "gpt-image-2.5-sunburst": {
    label: "gpt-image-2.5-sunburst",
    short: "GPT Image 2.5",
    badge: "Baseline",
    note: "high quality · 基准参照",
  },
  "gpt-image-2.6-sunburst": {
    label: "gpt-image-2.6-sunburst",
    short: "GPT Image 2.6",
    badge: "Candidate",
    note: "high quality · complexity: high",
  },
  "MiniMax-H3-Image": {
    label: "MiniMax-H3-Image",
    short: "MiniMax H3",
    badge: "External",
    note: "关闭提示词改写 · 原生直出",
  },
};

const COMPARE_PAIRS = [
  { id: "all", label: "三栏同屏", models: [0, 1, 2] },
  { id: "0-1", label: "2.5 对比 2.6", models: [0, 1] },
  { id: "1-2", label: "2.6 对比 MiniMax", models: [1, 2] },
  { id: "0-2", label: "2.5 对比 MiniMax", models: [0, 2] },
];

const slides = gallery.scenes.flatMap((scene, sceneIndex) =>
  scene.images.map((image, modelIndex) => ({
    ...image,
    sceneIndex,
    modelIndex,
    sceneId: scene.id,
    sceneTitle: scene.title,
    src: `${import.meta.env.BASE_URL}${image.src}`,
    alt: `${scene.title} — ${image.model}`,
    title: `${String(sceneIndex + 1).padStart(2, "0")} ${scene.title} · ${image.model}`,
  })),
);

function ThemeIcon({ light }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      {light ? (
        <path d="M20.3 14A8.5 8.5 0 0 1 10 3.7 8.5 8.5 0 1 0 20.3 14Z" />
      ) : (
        <>
          <circle cx="12" cy="12" r="3.6" />
          <path d="M12 2.5v2.2m0 14.6v2.2M2.5 12h2.2m14.6 0h2.2M5.3 5.3l1.5 1.5m10.4 10.4 1.5 1.5m0-13.4-1.5 1.5M6.8 17.2l-1.5 1.5" />
        </>
      )}
    </svg>
  );
}

function JsonCode({ value }) {
  const tokens = JSON.stringify(value, null, 2).split(
    /("(?:\\.|[^"\\])*"(?:\s*:)?|\btrue\b|\bfalse\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
  );
  return (
    <pre className="json-code">
      <code>
        {tokens.map((token, index) => {
          if (index % 2 === 0) return token;
          const type = token.startsWith('"')
            ? token.endsWith(":")
              ? "key"
              : "string"
            : /^(true|false|null)$/.test(token)
              ? "literal"
              : "number";
          return (
            <span className={`json-${type}`} key={index}>
              {token}
            </span>
          );
        })}
      </code>
    </pre>
  );
}

function splitTitle(rawTitle) {
  const parts = rawTitle.split(/\s*·\s*/);
  return {
    name: parts[0] || rawTitle,
    category: parts[1] || "",
  };
}

function App() {
  const [theme, setTheme] = useState(
    document.documentElement.dataset.theme || "dark",
  );
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [failedImages, setFailedImages] = useState(new Set());
  const [compareMode, setCompareMode] = useState("all");
  const [showPrompts, setShowPrompts] = useState(true);
  const [openParams, setOpenParams] = useState({});
  const [allParamsOpen, setAllParamsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [activeSceneId, setActiveSceneId] = useState(
    gallery.scenes[0]?.id || "",
  );

  const activePair = useMemo(
    () =>
      COMPARE_PAIRS.find((item) => item.id === compareMode) || COMPARE_PAIRS[0],
    [compareMode],
  );

  const visibleModelIndices = activePair.models;

  useEffect(() => {
    const sections = gallery.scenes
      .map((scene) => document.getElementById(scene.id))
      .filter(Boolean);
    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveSceneId(visible[0].target.id);
        }
      },
      { rootMargin: "-18% 0px -65% 0px", threshold: [0, 0.2] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (lightboxIndex < 0) return undefined;
    function handleKeyDown(event) {
      const currentSlide = slides[lightboxIndex];
      if (!currentSlide) return;
      const baseIndex = currentSlide.sceneIndex * gallery.models.length;
      if (event.key === "1") setLightboxIndex(baseIndex);
      if (event.key === "2" && gallery.models.length > 1)
        setLightboxIndex(baseIndex + 1);
      if (event.key === "3" && gallery.models.length > 2)
        setLightboxIndex(baseIndex + 2);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex]);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.content = next === "dark" ? "#0d0d0c" : "#f5f4f0";
    }
    setTheme(next);
    localStorage.setItem("image-gallery-theme", next);
  }

  function handleCopyPrompt(sceneId, promptText) {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(promptText).then(() => {
      setCopiedId(sceneId);
      window.clearTimeout(window.__copyTimer);
      window.__copyTimer = window.setTimeout(() => setCopiedId(null), 1800);
    });
  }

  function toggleCardParam(cardKey) {
    setOpenParams((prev) => ({
      ...prev,
      [cardKey]: !(prev[cardKey] ?? allParamsOpen),
    }));
  }

  function handleToggleAllParams() {
    const next = !allParamsOpen;
    setAllParamsOpen(next);
    setOpenParams({});
  }

  const activeSlide = lightboxIndex >= 0 ? slides[lightboxIndex] : null;

  return (
    <div className="app-shell" id="top">
      <header className="hero-header">
        <div className="hero-top">
          <div className="hero-identity">
            <span className="eyebrow">
              IMAGE GENERATION BENCHMARK · RAW OUTPUTS
            </span>
            <h1>文生图模型直出样张横评</h1>
            <p className="hero-lead">
              基于完全一致的中文长提示词，并排呈现{" "}
              <strong>gpt-image-2.5-sunburst</strong>、
              <strong>gpt-image-2.6-sunburst</strong> 与{" "}
              <strong>MiniMax-H3-Image</strong> 在 8
              类典型视觉任务下的单次生成原图。全程保留原始分辨率与接口入参，未做抽卡筛选或后期修饰。
            </p>
          </div>
          <div className="hero-actions">
            <div className="stat-pills" aria-label="测试规模概览">
              <div className="stat-pill">
                <span className="stat-num">03</span>
                <span className="stat-label">参测模型</span>
              </div>
              <div className="stat-pill">
                <span className="stat-num">08</span>
                <span className="stat-label">实测命题</span>
              </div>
              <div className="stat-pill">
                <span className="stat-num">24</span>
                <span className="stat-label">直出原图</span>
              </div>
            </div>
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`切换至${theme === "dark" ? "浅色纸面" : "暗房看片"}模式`}
              title={`切换至${theme === "dark" ? "浅色纸面" : "暗房看片"}模式`}
            >
              <ThemeIcon light={theme === "light"} />
              <span>{theme === "dark" ? "浅色纸面" : "暗房看片"}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="sticky-workbench">
        <div className="workbench-inner">
          <nav className="scene-nav" aria-label="测试场景快速跳转">
            {gallery.scenes.map((scene, idx) => {
              const note = SCENE_NOTES[scene.id];
              const { name } = splitTitle(scene.title);
              const isActive = activeSceneId === scene.id;
              return (
                <a
                  key={scene.id}
                  href={`#${scene.id}`}
                  className={`scene-chip ${isActive ? "is-active" : ""}`}
                  onClick={() => setActiveSceneId(scene.id)}
                >
                  <span className="scene-chip-num">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="scene-chip-text">
                    {note?.shortTitle || name}
                  </span>
                </a>
              );
            })}
          </nav>

          <div className="workbench-controls">
            <div
              className="segmented-group"
              role="group"
              aria-label="对比视图切换"
            >
              {COMPARE_PAIRS.map((pair) => (
                <button
                  key={pair.id}
                  type="button"
                  className={`seg-btn ${compareMode === pair.id ? "is-selected" : ""}`}
                  onClick={() => setCompareMode(pair.id)}
                >
                  {pair.label}
                </button>
              ))}
            </div>

            <div className="utility-toggles">
              <button
                type="button"
                className={`util-btn ${showPrompts ? "is-on" : ""}`}
                onClick={() => setShowPrompts((v) => !v)}
              >
                {showPrompts ? "隐藏提示词" : "显示提示词"}
              </button>
              <button
                type="button"
                className={`util-btn ${allParamsOpen ? "is-on" : ""}`}
                onClick={handleToggleAllParams}
              >
                {allParamsOpen ? "收起全部参数" : "展开全部参数"}
              </button>
            </div>
          </div>

          <div
            className={`model-column-bar cols-${visibleModelIndices.length}`}
            aria-label="当前展示模型列"
          >
            {visibleModelIndices.map((modelIndex) => {
              const modelName = gallery.models[modelIndex];
              const meta = MODEL_META[modelName] || {
                label: modelName,
                note: "",
              };
              return (
                <div className="model-col-head" key={modelName}>
                  <div className="model-col-main">
                    <span className="model-index-tag">M{modelIndex + 1}</span>
                    <span className="model-id-text">{modelName}</span>
                  </div>
                  {meta.note && (
                    <span className="model-col-sub">{meta.note}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <main className="main-canvas">
        <div className="scenes-list">
          {gallery.scenes.map((scene, sceneIndex) => {
            const note = SCENE_NOTES[scene.id];
            const { name, category } = splitTitle(scene.title);
            const firstImage = scene.images[0];
            const isPortrait =
              firstImage && firstImage.height > firstImage.width;
            const ratioLabel = isPortrait
              ? "2:3 竖幅 · 1024×1536"
              : "3:2 横幅 · 1536×1024";

            return (
              <section
                className="scene-block"
                key={scene.id}
                id={scene.id}
                aria-labelledby={`heading-${scene.id}`}
              >
                <div className="scene-header">
                  <div className="scene-title-group">
                    <span className="scene-index">
                      {String(sceneIndex + 1).padStart(2, "0")}
                    </span>
                    <div className="scene-title-stack">
                      <div className="scene-heading-row">
                        <h2 id={`heading-${scene.id}`}>{name}</h2>
                        {(category || note?.tag) && (
                          <span className="scene-category-badge">
                            {category || note.tag}
                          </span>
                        )}
                        <span className="scene-ratio-badge">{ratioLabel}</span>
                      </div>
                      {note?.summary && (
                        <p className="scene-summary">{note.summary}</p>
                      )}
                    </div>
                  </div>

                  {note?.focus && (
                    <div className="scene-focus-list" aria-label="核心观察点">
                      <span className="focus-prefix">看点</span>
                      {note.focus.map((item) => (
                        <span className="focus-tag" key={item}>
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {showPrompts && (
                  <div className="prompt-panel">
                    <div className="prompt-panel-bar">
                      <span className="prompt-label">测试提示词</span>
                      <button
                        type="button"
                        className="copy-btn"
                        onClick={() => handleCopyPrompt(scene.id, scene.prompt)}
                      >
                        {copiedId === scene.id ? "已复制" : "复制提示词"}
                      </button>
                    </div>
                    <p className="prompt-body">{scene.prompt}</p>
                  </div>
                )}

                <div
                  className={`image-grid cols-${visibleModelIndices.length}`}
                >
                  {visibleModelIndices.map((modelIndex) => {
                    const image = scene.images[modelIndex];
                    const slideIndex =
                      sceneIndex * gallery.models.length + modelIndex;
                    const cardKey = `${scene.id}-${image.model}`;
                    const isParamExpanded =
                      openParams[cardKey] ?? allParamsOpen;
                    const isFailed = failedImages.has(image.src);

                    return (
                      <article className="sample-card" key={image.model}>
                        <div className="sample-card-top">
                          <span className="sample-model-name">
                            <span className="sample-model-idx">
                              0{modelIndex + 1}
                            </span>
                            {image.model}
                          </span>
                          <span className="sample-dimensions">
                            {image.width} × {image.height}
                          </span>
                        </div>

                        <button
                          type="button"
                          className={`image-stage ${isPortrait ? "is-portrait" : "is-landscape"}`}
                          onClick={() => setLightboxIndex(slideIndex)}
                          aria-label={`放大检视：${scene.title} — ${image.model}`}
                          disabled={isFailed}
                        >
                          {isFailed ? (
                            <span role="alert" className="image-error">
                              原图加载失败：{image.model}
                            </span>
                          ) : (
                            <img
                              src={slides[slideIndex].src}
                              alt={slides[slideIndex].alt}
                              width={image.width}
                              height={image.height}
                              loading={sceneIndex < 2 ? "eager" : "lazy"}
                              decoding="async"
                              onError={() =>
                                setFailedImages(
                                  (previous) =>
                                    new Set([...previous, image.src]),
                                )
                              }
                            />
                          )}
                          <span className="zoom-hint" aria-hidden="true">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.7"
                            >
                              <path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7" />
                            </svg>
                            <span>原图检视</span>
                          </span>
                        </button>

                        <div className="sample-card-footer">
                          <div className="param-inline-tags">
                            {image.parameters.quality && (
                              <span className="param-chip">
                                quality: {image.parameters.quality}
                              </span>
                            )}
                            {image.parameters.complexity && (
                              <span className="param-chip">
                                complexity: {image.parameters.complexity}
                              </span>
                            )}
                            {image.parameters.disable_prompt_enhanced !==
                              undefined && (
                              <span className="param-chip">
                                disable_prompt_enhanced:{" "}
                                {String(
                                  image.parameters.disable_prompt_enhanced,
                                )}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            className={`param-toggle-btn ${isParamExpanded ? "is-open" : ""}`}
                            onClick={() => toggleCardParam(cardKey)}
                            aria-expanded={isParamExpanded}
                          >
                            <span>请求参数</span>
                            <span className="param-chevron" aria-hidden="true">
                              {isParamExpanded ? "−" : "+"}
                            </span>
                          </button>
                        </div>

                        {isParamExpanded && (
                          <div className="param-drawer">
                            <JsonCode value={image.parameters} />
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      <footer className="page-footer">
        <div className="footer-inner">
          <span>
            全部 24 张样张均为 API 原始输出 PNG，未经过超分、重绘或色彩后处理。
          </span>
          <a href="#top" className="back-to-top">
            返回顶部 ↑
          </a>
        </div>
      </footer>

      {activeSlide && (
        <div
          className="lightbox-hud"
          role="region"
          aria-label="同场景模型快速切换"
        >
          <div className="lightbox-hud-scene">
            <span className="hud-scene-num">
              {String(activeSlide.sceneIndex + 1).padStart(2, "0")}
            </span>
            <span className="hud-scene-title">{activeSlide.sceneTitle}</span>
          </div>
          <div className="lightbox-hud-models">
            {gallery.models.map((model, mIdx) => {
              const targetSlideIndex =
                activeSlide.sceneIndex * gallery.models.length + mIdx;
              const isCurrent = activeSlide.modelIndex === mIdx;
              return (
                <button
                  key={model}
                  type="button"
                  className={`hud-model-btn ${isCurrent ? "is-active" : ""}`}
                  onClick={() => setLightboxIndex(targetSlideIndex)}
                >
                  <kbd>{mIdx + 1}</kbd>
                  <span>{model}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={lightboxIndex}
        slides={slides}
        on={{
          view: ({ index: nextIdx }) => setLightboxIndex(nextIdx),
        }}
        plugins={[Zoom]}
        zoom={{ maxZoomPixelRatio: 3.5, scrollToZoom: true }}
        carousel={{ finite: true }}
        controller={{ closeOnBackdropClick: true }}
        labels={{
          Close: "关闭",
          Next: "下一张",
          Previous: "上一张",
          "Zoom in": "放大",
          "Zoom out": "缩小",
        }}
      />
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
