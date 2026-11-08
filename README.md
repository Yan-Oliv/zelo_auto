# Zelo Auto Estética — landing page

![React 19](https://img.shields.io/badge/React%2019-61DAFB?style=flat-square&logo=react&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) ![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=threedotjs&logoColor=white) ![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=flat-square&logo=greensock&logoColor=white) ![Cloudflare Pages](https://img.shields.io/badge/Cloudflare%20Pages-F38020?style=flat-square&logo=cloudflare&logoColor=white)

Landing page **cinematográfica** da Zelo Estética Automotiva: um carro em 3D, transições guiadas pelo scroll e uma galeria conectada ao Instagram da marca.

**Site:** [zelo.omnyatech.com.br](https://zelo.omnyatech.com.br/)

## Destaques

- Cena 3D com **React Three Fiber** e **drei** (modelos glTF otimizados com `gltf-transform`)
- Animações com **GSAP** e **Framer Motion**; carrosséis com **Embla**
- Galeria alimentada pela **Instagram API** através de uma função em `functions/api` (Cloudflare Pages Functions), com *fallback* identificado quando o feed não está disponível
- Pré-renderização da página no build para SEO e primeira pintura rápida
- Espuma em *macro* gerada **offline no Blender** (`tools/blender`) e integrada ao Three.js

## Stack

React 19 · TypeScript · Vite · Three.js · GSAP · Framer Motion · Embla · Tailwind CSS · Cloudflare Pages

## Como executar

```bash
npm install
npm run dev       # desenvolvimento
npm run build     # build + pré-renderização
npm run preview
```

### Variáveis do servidor (Cloudflare Pages)

| Variável | Uso |
|---|---|
| `INSTAGRAM_API_MODE` | `instagram-login` para ativar o feed real |
| `INSTAGRAM_GRAPH_USER_ID` | ID numérico da conta |
| `INSTAGRAM_ACCESS_TOKEN` | token com a permissão `instagram_business_basic` |

Os segredos ficam apenas no servidor (local em `.env`, nunca versionado).

---

<sub>Desenvolvido por <a href="https://github.com/Yan-Oliv">Yan Monteiro</a> · <a href="https://www.linkedin.com/in/yan-de-oliveira-gon%C3%A7alves-monteiro-a2886619a/">LinkedIn</a> · <a href="https://github.com/OmnyaTech">OmnyaTech</a></sub>
