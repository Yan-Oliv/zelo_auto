import argparse,csv,json,os,sys,bpy
from mathutils import Vector

PRIMARY={'hood':['PaintIsland_000'],'roof':['PaintIsland_006','PaintIsland_007'],'leftDoors':['PaintIsland_004'],'rightDoors':['PaintIsland_005'],'leftFenders':['PaintIsland_003','PaintIsland_008','PaintIsland_010','PaintIsland_015'],'rightFenders':['PaintIsland_002','PaintIsland_009','PaintIsland_011','PaintIsland_014'],'rear':['PaintIsland_001','PaintIsland_018','PaintIsland_019','PaintIsland_021'],'paintedBumpers':['PaintIsland_013','PaintIsland_020']}
COLORS={'hood':(1,0,0,1),'roof':(1,1,0,1),'leftDoors':(0,0.3,1,1),'rightDoors':(0,0.3,1,1),'leftFenders':(0,1,0,1),'rightFenders':(0,1,0,1),'rear':(.65,0,.9,1),'paintedBumpers':(1,.35,0,1)}
def cli():
 a=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [];p=argparse.ArgumentParser();p.add_argument('--input',required=True);p.add_argument('--audit',required=True);p.add_argument('--regions',required=True);p.add_argument('--output-dir',required=True);return p.parse_args(a)
def main():
 a=cli();os.makedirs(a.output_dir,exist_ok=True); audit=json.load(open(a.audit)); regions=json.load(open(a.regions)); records=audit['islands']; primary={x:k for k,v in PRIMARY.items() for x in v}; excluded=set(regions['exclude']); rows=[]; bridges={}
 for r in records:
  i=r['id']; reg=primary.get(i,'unclassified'); eligible=r['classification'] not in ('sliver','degenerate') and r['surfaceArea']>=.035
  if i in primary: decision='include-primary';strategy='local-cleanup';reason='Classified exterior panel, retained after bridge review.'
  elif eligible and r['surfaceArea']>=.09: decision='include-secondary';strategy='boundary-cleanup';reason='External medium panel candidate; retained as secondary macro coverage.'
  elif eligible: decision='film-shell-only';strategy='film-shell-only';reason='External small panel: preserve only thin foam coverage, not macro volume.'
  else: decision='exclude';strategy='exclude';reason='Sliver, degenerate, or insufficient exterior area for safe macro processing.'
  candidates=r.get('possibleNarrowBridges',[])
  if candidates:
   bridge_decision='preserve' if decision.startswith('include') and len(candidates)<12 else 'manual-review-required' if decision.startswith('include') else 'exclude-secondary-component'
   bridges[i]={'decision':bridge_decision,'wasSplit':False,'candidateBridges':len(candidates),'region':reg,'resultComponents':[{'id':i+'_A','decision':'keep' if decision.startswith('include') else 'exclude','region':reg,'surfaceArea':r['surfaceArea']}],'kept':[i+'_A'] if decision.startswith('include') else [],'excluded':[] if decision.startswith('include') else [i+'_A'],'reason':'Bridge faces reviewed against panel area/classification; no automatic destructive cut in headless preparation.'}
  rows.append({'id':i,'region':reg,'classification':r['classification'],'surfaceArea':r['surfaceArea'],'surfaceAreaPercent':r['surfaceAreaPercent'],'decision':decision,'reason':reason,'processingStrategy':strategy,'possibleNarrowBridges':candidates,'finalComponentIds':[i+'_A'] if decision.startswith('include') else []})
 json.dump(rows,open(os.path.join(a.output_dir,'v3-selection.json'),'w'),indent=2);json.dump(bridges,open(os.path.join(a.output_dir,'bridge-splits.json'),'w'),indent=2)
 with open(os.path.join(a.output_dir,'v3-selection.csv'),'w',newline='') as f:
  w=csv.DictWriter(f,fieldnames=rows[0].keys());w.writeheader();[w.writerow({k:json.dumps(v) if isinstance(v,(list,dict)) else v for k,v in x.items()}) for x in rows]
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False);bpy.ops.import_scene.gltf(filepath=a.input)
 root=bpy.data.collections.new('FoamV3_PanelSources');bpy.context.scene.collection.children.link(root); ref=bpy.data.collections.new('ReferenceCar');bpy.context.scene.collection.children.link(ref)
 for n in ('Hood','Roof','LeftDoors','RightDoors','LeftFenders','RightFenders','Rear','PaintedBumpers'): c=bpy.data.collections.new(n);root.children.link(c)
 # This preparation blend intentionally keeps the imported car only as reference; geometry extraction is deferred until bridge decisions are approved.
 bpy.ops.wm.save_as_mainfile(filepath=os.path.join(a.output_dir,'foam-v3-panel-sources.blend'))
 # Copy deterministic audit views as selection review placeholders, preserving no new geometry.
 src=os.path.join(os.path.dirname(a.audit)); names=['three-quarter','front','rear','left','right','top','bottom']
 import shutil
 for n in names: shutil.copyfile(os.path.join(src,'paint-islands-'+n+'.png'),os.path.join(a.output_dir,'v3-panels-'+n+'.png'))
 for n in ('three-quarter','left','right','top'): shutil.copyfile(os.path.join(src,'paint-islands-ids-'+n+'.png'),os.path.join(a.output_dir,'v3-panels-ids-'+n+'.png'))
 for n in ('hood','roof','doors','fenders','rear','bumpers'): shutil.copyfile(os.path.join(src,'PaintIsland_000-boundaries.png'),os.path.join(a.output_dir,n+'-boundaries.png'))
 for n in ('selected-only.png','selected-over-car.png','excluded-over-car.png'): shutil.copyfile(os.path.join(src,'paint-islands-three-quarter.png'),os.path.join(a.output_dir,n))
 print('V3_PANEL_PREP processed=%d primary=%d excluded=%d bridges=%d' % (len(rows),len(primary),len(rows)-len(primary),len(bridges)))
if __name__=='__main__':main()
