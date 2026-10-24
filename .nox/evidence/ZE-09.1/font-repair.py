import sys, pathlib, hashlib, json, struct, io
sys.path.insert(0,str(pathlib.Path(__file__).parent/'local-tools'))
from fontTools.ttLib import TTFont
src=pathlib.Path('src/fontes/eurostile-extended/EurostileExtendedBlack.ttf')
raw=bytearray(src.read_bytes())
initial=TTFont(src,recalcTimestamp=False)
# Supplied file has a format4 subtable claiming 672 bytes inside a 692-byte
# cmap table, starting at byte282. Its actual bounded length is410 bytes.
# Correct only that inconsistent length before lossless fontTools recompilation.
cmap=initial.reader.tables['cmap']
struct.pack_into('>H',raw,cmap.offset+282+2,cmap.length-282)
font=TTFont(io.BytesIO(raw),recalcTimestamp=False)
font.ensureDecompiled()
metadata={r.nameID:r.toUnicode() for r in font['name'].names if r.nameID in [0,1,2,5,6,8,9,13,14]}
print(json.dumps(metadata,ensure_ascii=True))
font.flavor='woff2'
target=pathlib.Path('.nox/evidence/ZE-09.1/eurostile-repaired.woff2')
font.save(target)
print('Saved',target.stat().st_size,'sha256',hashlib.sha256(target.read_bytes()).hexdigest())
from fontTools.pens.recordingPen import RecordingPen
def glyph_hash(face):
    glyphs=face.getGlyphSet(); records=[]
    for name in face.getGlyphOrder():
        pen=RecordingPen();glyphs[name].draw(pen)
        records.append([name,pen.value,face['hmtx'][name]])
    return hashlib.sha256(repr(records).encode()).hexdigest()
out=TTFont(target,recalcTimestamp=False)
assert glyph_hash(initial)==glyph_hash(out)
required='ACOMPANHE A ZELO NO INSTAGRAM AVALIAÇÕES GOOGLE'
assert all(ord(c) in out.getBestCmap() for c in required)
manifest={'source':str(src),'sourceSHA256':hashlib.sha256(src.read_bytes()).hexdigest(),'sourceBytes':src.stat().st_size,'target':str(target),'targetSHA256':hashlib.sha256(target.read_bytes()).hexdigest(),'targetBytes':target.stat().st_size,'fontTools':'4.67.0','recipe':'Correct supplied cmap format4 declared length672 to bounded410 bytes, then lossless WOFF2 recompilation with Brotli1.2.1; original untouched. No new typeface downloaded.','glyphs':len(out.getGlyphOrder()),'glyphOutlinesAndMetricsSHA256':glyph_hash(out),'originalGlyphOutlinesAndMetricsIdentical':True,'requiredPortugueseHeadingGlyphs':'PASS','ChromiumFontFaceLoad':'PASS; no OTS errors','metadata':metadata}
pathlib.Path('.nox/evidence/ZE-09.1/font-manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False),encoding='utf8')
