import sys,pathlib,json,hashlib
sys.path.insert(0,str(pathlib.Path(__file__).parent/'local-tools'))
from fontTools.ttLib import TTFont
from fontTools import subset
src=pathlib.Path('.nox/evidence/ZE-09.1/Michroma-Regular.ttf')
out=pathlib.Path('public/fonts/michroma-community-latin.woff2')
font=TTFont(src,recalcTimestamp=False)
options=subset.Options();options.flavor='woff2';options.recalc_timestamp=False
selection=subset.Subsetter(options);selection.populate(unicodes=list(range(0x20,0x250)));selection.subset(font);font.flavor='woff2';font.save(out)
pathlib.Path('.nox/evidence/ZE-09.1/community-font-manifest.json').write_text(json.dumps({'typeface':'Michroma Regular','source':'https://raw.githubusercontent.com/google/fonts/main/ofl/michroma/Michroma-Regular.ttf','license':'SIL Open Font License1.1; public/fonts/Michroma-OFL.txt','sourceSHA256':hashlib.sha256(src.read_bytes()).hexdigest(),'target':str(out),'targetSHA256':hashlib.sha256(out.read_bytes()).hexdigest(),'bytes':out.stat().st_size,'recipe':'fontTools4.67.0/Brotli1.2.1 Latin U+0020..024F WOFF2 subset; no distorted glyphs or synthetic weights','scope':'Community headings only; self-hosted; no Google Fonts runtime request','rejectedCandidate':'Supplied Eurostile Extended Black repaired losslessly but its bold weight diverged from reference. See font-manifest.json; not used in runtime.'},indent=2),encoding='utf8')
print('Community font',out.stat().st_size)
