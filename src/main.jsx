import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import './styles.css';
import gallery from './gallery.json';

const slides = gallery.scenes.flatMap(scene => scene.images.map(image => ({
  ...image,
  src: `${import.meta.env.BASE_URL}${image.src}`,
  alt: `${scene.title} — ${image.model}`,
  title: `${scene.title} / ${image.model}`,
})));

function ThemeIcon({ light }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    {light ? <path d="M20.3 14A8.5 8.5 0 0 1 10 3.7 8.5 8.5 0 1 0 20.3 14Z" /> : <>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4m0-14.2-1.4 1.4M6.3 17.7l-1.4 1.4" />
    </>}
  </svg>;
}

function App() {
  const [theme, setTheme] = useState(document.documentElement.dataset.theme);
  const [index, setIndex] = useState(-1);
  const [failedImages, setFailedImages] = useState(new Set());
  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    document.querySelector('meta[name="theme-color"]').content = next === 'dark' ? '#111214' : '#f7f7f5';
    setTheme(next);
    localStorage.setItem('image-gallery-theme', next);
  }
  return <>
    <header className="page-header">
      <a className="brand" href="#top" aria-label="图像对照，返回顶部">
        <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
        <h1>图像对照</h1>
      </a>
      <button className="theme-toggle" onClick={toggleTheme} aria-label={`切换到${theme === 'dark' ? '亮' : '暗'}色`} title={`切换到${theme === 'dark' ? '亮' : '暗'}色`}>
        <ThemeIcon light={theme === 'light'} />
      </button>
    </header>
    <main id="top">
      <div className="comparison">
        <div className="model-header" aria-label="模型列">
          {gallery.models.map((model, i) => <div className="model-name" key={model}><span className={`model-dot dot-${i}`} />{model}</div>)}
        </div>
        <div className="scenes">
          {gallery.scenes.map((scene, sceneIndex) => <section className="scene" key={scene.id} aria-labelledby={scene.id}>
            <h2 id={scene.id}><span className="scene-number">{String(sceneIndex + 1).padStart(2, '0')}</span>{scene.title}</h2>
            <div className="image-row">
              {scene.images.map((image, modelIndex) => {
                const slideIndex = sceneIndex * gallery.models.length + modelIndex;
                return <button className="image-button" key={image.model} onClick={() => setIndex(slideIndex)} aria-label={`放大：${scene.title}，${image.model}`} disabled={failedImages.has(image.src)}>
                  {failedImages.has(image.src) ? <span role="alert" className="image-error">图片加载失败：{image.model}</span> : <img
                    src={slides[slideIndex].src}
                    alt={slides[slideIndex].alt}
                    width={image.width}
                    height={image.height}
                    loading={sceneIndex === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    onError={() => setFailedImages(previous => new Set([...previous, image.src]))}
                  />}
                  <span className="expand-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7" /></svg></span>
                </button>;
              })}
            </div>
          </section>)}
        </div>
      </div>
    </main>
    <Lightbox open={index >= 0} close={() => setIndex(-1)} index={index} slides={slides} plugins={[Zoom, Captions]}
      zoom={{ maxZoomPixelRatio: 3, scrollToZoom: true }}
      carousel={{ finite: true }}
      controller={{ closeOnBackdropClick: true }}
      labels={{ Close: '关闭', Next: '下一张', Previous: '上一张', 'Zoom in': '放大', 'Zoom out': '缩小', 'Show captions': '显示标题', 'Hide captions': '隐藏标题' }}
    />
  </>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
