import { readFile, readdir, mkdir, copyFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const project = fileURLToPath(new URL('../', import.meta.url));
const source = path.resolve(process.argv[2] ?? path.join(project, '..'));
const manifest = JSON.parse(await readFile(path.join(source, 'manifest.json'), 'utf8'));
if (manifest.models.length !== 3 || manifest.repeats !== 1) {
  throw new Error('This gallery expects three models and one sample per scene.');
}
const scenes = [];
for (const scene of manifest.scenes) {
  const images = [];
  let scenePrompt;
  for (const model of manifest.models) {
    const modelPath = path.join(source, scene.id, 'sample-01', model);
    const attempts = (await readdir(modelPath)).filter(name => /^attempt-\d+$/.test(name));
    const candidates = [];
    for (const attempt of attempts) {
      const files = await readdir(path.join(modelPath, attempt));
      for (const name of files.filter(name => /^original\.(png|jpe?g|webp)$/.test(name))) {
        candidates.push(path.join(modelPath, attempt, name));
      }
    }
    if (candidates.length !== 1) throw new Error(`Expected one original: ${scene.id}/${model}; found ${candidates.length}`);
    const original = candidates[0];
    const request = JSON.parse(await readFile(path.join(path.dirname(original), 'request.body.json'), 'utf8'));
    const { prompt, ...parameters } = request;
    if (typeof prompt !== 'string' || !prompt.trim()) throw new Error(`Missing prompt: ${scene.id}/${model}`);
    if (scenePrompt !== undefined && scenePrompt !== prompt) throw new Error(`Different model prompts in scene: ${scene.id}`);
    scenePrompt = prompt;
    const relative = `images/${scene.id}/${model}/${path.basename(original)}`;
    const destination = path.join(project, 'public', relative);
    const { width, height } = await sharp(original).metadata();
    if (!width || !height) throw new Error(`Invalid image dimensions: ${original}`);
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(original, destination);
    images.push({ model, src: relative, width, height, parameters });
  }
  scenes.push({ id: scene.id, title: scene.title, prompt: scenePrompt, images });
}
await writeFile(path.join(project, 'src/gallery.json'), JSON.stringify({ models: manifest.models, scenes }, null, 2) + '\n');
console.log(`Imported ${scenes.length} scenes, ${scenes.flatMap(scene => scene.images).length} originals.`);
