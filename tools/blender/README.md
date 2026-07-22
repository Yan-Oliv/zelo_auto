# Offline Foam Macro asset

The continuous macro foam is deliberately generated outside the browser. It is
not a replacement car and contains only `FoamMacroRoot/FoamMacroMesh`.

Run on a workstation with Blender installed:

```powershell
blender --background --python tools/blender/generate_lincoln_foam_macro.py -- --input public/models/lincoln.glb --output public/models/lincoln_foam_macro.glb
```

Then inspect the GLB in Blender or a glTF viewer. The export must contain only
the macro foam mesh, `COLOR_0`, normals, UVs, and `FoamThin`, `FoamFull`, and
`FoamDrained` shape keys before it is integrated into the Three.js laboratory.
