"""Audit deterministic connected Paint islands without modifying the GLB."""

import argparse, csv, json, math, os, shutil, sys
import bpy
import bmesh
from mathutils import Vector

GLOBAL_VOXEL_REMESH_ALLOWED = False

def args():
    values=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
    parser=argparse.ArgumentParser(); parser.add_argument('--input',required=True); parser.add_argument('--output-dir',required=True); parser.add_argument('--regions-output',required=True)
    return parser.parse_args(values)

def tri_count(polys): return sum(max(len(p.vertices)-2,0) for p in polys)
def bounds(vertices):
    lo=Vector((min(v.co.x for v in vertices),min(v.co.y for v in vertices),min(v.co.z for v in vertices)))
    hi=Vector((max(v.co.x for v in vertices),max(v.co.y for v in vertices),max(v.co.z for v in vertices)))
    return lo,hi,hi-lo
def vec(v): return [round(x,6) for x in v]
def edge_face_counts(mesh):
    counts={}
    for polygon in mesh.polygons:
        vertices=list(polygon.vertices)
        for index,a in enumerate(vertices):
            b=vertices[(index+1)%len(vertices)]; key=(a,b) if a<b else (b,a); counts[key]=counts.get(key,0)+1
    return counts

def connected_paint_components(source):
    paint={i for i,s in enumerate(source.material_slots) if s.material and s.material.name=='Paint'}
    bm=bmesh.new(); bm.from_mesh(source.data)
    faces={f for f in bm.faces if f.material_index in paint}; components=[]
    while faces:
        start=faces.pop(); stack=[start]; component=[start]
        while stack:
            face=stack.pop()
            for edge in face.edges:
                for linked in edge.link_faces:
                    if linked in faces:
                        faces.remove(linked); stack.append(linked); component.append(linked)
        components.append(component)
    result=[]
    for faces in components:
        used=sorted({v.index for f in faces for v in f.verts}); remap={old:i for i,old in enumerate(used)}
        vertices=[source.data.vertices[i].co.copy() for i in used]
        polygons=[[remap[v.index] for v in f.verts] for f in faces]
        mesh=bpy.data.meshes.new('__PaintIsland'); mesh.from_pydata(vertices,[],polygons); mesh.update()
        obj=bpy.data.objects.new('__PaintIsland',mesh); bpy.context.collection.objects.link(obj); obj.matrix_world=source.matrix_world.copy()
        bpy.context.view_layer.objects.active=obj; obj.select_set(True); bpy.ops.object.transform_apply(location=False,rotation=True,scale=True); obj.select_set(False)
        result.append(obj)
    bm.free(); return result

def island_stats(obj):
    mesh=obj.data; lo,hi,size=bounds(mesh.vertices); area=sum(p.area for p in mesh.polygons); center=sum((p.center*p.area for p in mesh.polygons),Vector())/max(area,1e-9)
    normals=[p.normal for p in mesh.polygons]; avg=sum(normals,Vector()).normalized() if normals else Vector()
    variance=sum(1-max(min(n.dot(avg),1),-1) for n in normals)/max(len(normals),1)
    face_counts=edge_face_counts(mesh); boundary=sum(value==1 for value in face_counts.values()); nonmanifold=sum(value>2 for value in face_counts.values())
    bridges=[]
    for polygon in mesh.polygons:
        ids=list(polygon.vertices); lengths=[(mesh.vertices[ids[i]].co-mesh.vertices[ids[(i+1)%len(ids)]].co).length for i in range(len(ids))]
        width=min(lengths) if lengths else 0.0; ratio=max(lengths)/max(width,1e-9) if lengths else 0.0
        if ratio>10.0: bridges.append({'face':polygon.index,'width':width,'aspectRatio':ratio})
    dims=sorted(size); thin=dims[0]/max(dims[-1],1e-9); aspect=dims[-1]/max(dims[1],1e-9); triangles=tri_count(mesh.polygons)
    warnings=[]
    if area<.002: warnings.append('small_fragment')
    if thin<.015: warnings.append('very_thin')
    if aspect>16: warnings.append('long_sliver')
    if triangles<4: warnings.append('degenerate_bbox')
    if boundary/max(len(mesh.edges),1)>.65: warnings.append('high_boundary_ratio')
    if nonmanifold: warnings.append('non_manifold')
    if max(size)<.025: warnings.append('isolated_fragment')
    label='large' if area>.12 else 'medium' if area>.02 else 'small'
    if 'very_thin' in warnings or 'long_sliver' in warnings: label='sliver'
    if 'degenerate_bbox' in warnings: label='degenerate'
    return dict(vertices=len(mesh.vertices),edges=len(mesh.edges),faces=len(mesh.polygons),triangles=triangles,surfaceArea=area,centroidLocal=vec(center),boundingBoxMin=vec(lo),boundingBoxMax=vec(hi),dimensions=vec(size),boundingBoxVolume=size.x*size.y*size.z,diagonal=size.length,averageNormal=vec(avg),normalVariance=variance,boundaryEdgeCount=boundary,nonManifoldEdgeCount=nonmanifold,isClosed=boundary==0 and nonmanifold==0,thinnessRatio=thin,aspectRatio=aspect,possibleNarrowBridges=bridges[:32],classification=label,warnings=warnings)

def set_color(obj,index):
    hue=(index*.61803398875)%1; color=__import__('colorsys').hsv_to_rgb(hue,.72,.95); mat=bpy.data.materials.new(obj.name+'_Mat'); mat.diffuse_color=(*color,1); obj.data.materials.append(mat)

def camera_for(scene, objs, name, output):
    pts=[v.co for o in objs for v in o.data.vertices]; lo=Vector((min(p.x for p in pts),min(p.y for p in pts),min(p.z for p in pts))); hi=Vector((max(p.x for p in pts),max(p.y for p in pts),max(p.z for p in pts))); center=(lo+hi)*.5; d=(hi-lo).length
    directions={'three-quarter':Vector((1,-1.3,.7)),'front':Vector((0,-1.8,.35)),'rear':Vector((0,1.8,.35)),'left':Vector((-1.8,0,.2)),'right':Vector((1.8,0,.2)),'top':Vector((0,0,2)),'bottom':Vector((0,0,-2))}
    cam=bpy.data.objects.get('AuditCamera'); cam.location=center+directions[name].normalized()*d*.86; cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler(); scene.camera=cam; scene.render.filepath=os.path.join(output,'paint-islands-'+name+'.png'); bpy.ops.render.render(write_still=True)

def add_labels(objs):
    for obj in objs:
        text=bpy.data.curves.new(obj.name+'_Label','FONT'); text.body=obj.name; text.align_x='CENTER'; text.size=.08
        label=bpy.data.objects.new(text.name,text); bpy.context.collection.objects.link(label); label.location=Vector(json.loads(obj['centroid']))+Vector((0,0,.05)); label.rotation_euler=(0,0,0)

def render_large_debug(scene, obj, output):
    originals=[o.hide_render for o in bpy.context.collection.objects if o.type=='MESH']
    meshes=[o for o in bpy.context.collection.objects if o.type=='MESH']; [setattr(o,'hide_render',o!=obj) for o in meshes]
    obj.show_wire=True; obj.show_all_edges=True; camera_for(scene,[obj],'three-quarter',output); os.replace(os.path.join(output,'paint-islands-three-quarter.png'),os.path.join(output,obj.name+'-wireframe.png'))
    # Boundary diagnostic: red lines are open boundaries; yellow lines indicate non-manifold edges.
    line_mesh=bpy.data.meshes.new(obj.name+'_BoundaryLines'); edges=[]
    counts=edge_face_counts(obj.data)
    for e in obj.data.edges:
        key=(e.vertices[0],e.vertices[1]) if e.vertices[0]<e.vertices[1] else (e.vertices[1],e.vertices[0])
        if counts.get(key,0)!=2: edges.append((e.vertices[0],e.vertices[1]))
    line_mesh.from_pydata([v.co for v in obj.data.vertices],edges,[]); line=bpy.data.objects.new(obj.name+'_Boundaries',line_mesh); bpy.context.collection.objects.link(line)
    mat=bpy.data.materials.new(obj.name+'_BoundaryRed'); mat.diffuse_color=(1,0.04,0.04,1); line.data.materials.append(mat); line.show_wire=True; line.show_all_edges=True; line.hide_render=False
    camera_for(scene,[obj,line],'three-quarter',output); os.replace(os.path.join(output,'paint-islands-three-quarter.png'),os.path.join(output,obj.name+'-boundaries.png'))
    bpy.data.objects.remove(line,do_unlink=True); obj.show_wire=False; obj.show_all_edges=False
    for o,value in zip(meshes,originals): o.hide_render=value

def main():
    a=args(); os.makedirs(a.output_dir,exist_ok=True); bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False); bpy.ops.import_scene.gltf(filepath=a.input)
    sources=[o for o in bpy.context.scene.objects if o.type=='MESH' and any(s.material and s.material.name=='Paint' for s in o.material_slots)]
    islands=[component for source in sources for component in connected_paint_components(source)]
    for o in list(bpy.context.scene.objects):
        if o not in islands: bpy.data.objects.remove(o,do_unlink=True)
    stats=[island_stats(o) for o in islands]; ordered=sorted(zip(islands,stats),key=lambda it:(-it[1]['surfaceArea'],-it[1]['faces'],*it[1]['centroidLocal']))
    islands=[]; records=[]; total=sum(s['surfaceArea'] for _,s in ordered)
    for index,(obj,stat) in enumerate(ordered):
        obj.name='PaintIsland_%03d'%index; obj.data.name=obj.name; set_color(obj,index); stat['id']=obj.name; stat['surfaceAreaPercent']=stat['surfaceArea']*100/max(total,1e-9); obj['centroid']=json.dumps(stat['centroidLocal']); islands.append(obj); records.append(stat)
    scene=bpy.context.scene; scene.render.engine='BLENDER_WORKBENCH'; scene.display.shading.light='FLAT'; scene.display.shading.color_type='MATERIAL'; scene.display.shading.background_type='WORLD'; scene.display.shading.background_color=(.025,.035,.05); scene.render.resolution_x=1400; scene.render.resolution_y=900; scene.render.resolution_percentage=100; scene.render.image_settings.file_format='PNG'
    cam=bpy.data.cameras.new('AuditCamera'); bpy.context.collection.objects.link(bpy.data.objects.new('AuditCamera',cam))
    for view in ('three-quarter','front','rear','left','right','top','bottom'): camera_for(scene,islands,view,a.output_dir)
    add_labels(islands); camera_for(scene,islands,'three-quarter',a.output_dir); shutil.copyfile(os.path.join(a.output_dir,'paint-islands-three-quarter.png'),os.path.join(a.output_dir,'paint-islands-ids-three-quarter.png'))
    camera_for(scene,islands,'left',a.output_dir); shutil.copyfile(os.path.join(a.output_dir,'paint-islands-left.png'),os.path.join(a.output_dir,'paint-islands-ids-left.png'))
    camera_for(scene,islands,'right',a.output_dir); shutil.copyfile(os.path.join(a.output_dir,'paint-islands-right.png'),os.path.join(a.output_dir,'paint-islands-ids-right.png'))
    camera_for(scene,islands,'top',a.output_dir); shutil.copyfile(os.path.join(a.output_dir,'paint-islands-top.png'),os.path.join(a.output_dir,'paint-islands-ids-top.png'))
    [setattr(o,'hide_render',True) for o in bpy.context.scene.objects if o.type=='FONT']
    for obj in islands[:5]: render_large_debug(scene,obj,a.output_dir)
    # The per-island render helper temporarily reuses the generic camera name;
    # restore the full color set after those diagnostics have been emitted.
    for view in ('three-quarter','front','rear','left','right','top','bottom'): camera_for(scene,islands,view,a.output_dir)
    covered=0; count95=0
    for r in records:
        covered+=r['surfaceAreaPercent']; count95+=1
        if covered>=95: break
    summary={'GLOBAL_VOXEL_REMESH_ALLOWED':False,'totalIslands':len(records),'large':sum(r['classification']=='large' for r in records),'medium':sum(r['classification']=='medium' for r in records),'small':sum(r['classification']=='small' for r in records),'sliver':sum(r['classification']=='sliver' for r in records),'degenerate':sum(r['classification']=='degenerate' for r in records),'totalSurfaceArea':total,'top5AreaPercent':sum(r['surfaceAreaPercent'] for r in records[:5]),'top10AreaPercent':sum(r['surfaceAreaPercent'] for r in records[:10]),'closed':sum(r['isClosed'] for r in records),'open':sum(not r['isClosed'] for r in records),'islandsFor95PercentArea':count95,'islands':records}
    with open(os.path.join(a.output_dir,'paint-islands.json'),'w',encoding='utf8') as f: json.dump(summary,f,indent=2)
    keys=list(records[0].keys())
    with open(os.path.join(a.output_dir,'paint-islands.csv'),'w',newline='',encoding='utf8') as f:
        writer=csv.DictWriter(f,fieldnames=keys); writer.writeheader(); [writer.writerow({k:json.dumps(v) if isinstance(v,(list,dict)) else v for k,v in r.items()}) for r in records]
    # These IDs are derived only after deterministic area ordering and are a
    # conservative first pass from the labeled renders. Long side shells stay
    # manualCleanup rather than being treated as a global manifold.
    semantic={'hood':['PaintIsland_000'],'roof':['PaintIsland_006','PaintIsland_007'],'leftDoors':['PaintIsland_004'],'rightDoors':['PaintIsland_005'],'leftFenders':['PaintIsland_003','PaintIsland_008','PaintIsland_010','PaintIsland_015'],'rightFenders':['PaintIsland_002','PaintIsland_009','PaintIsland_011','PaintIsland_014'],'rear':['PaintIsland_001','PaintIsland_018','PaintIsland_019','PaintIsland_021'],'paintedBumpers':['PaintIsland_013','PaintIsland_020']}
    assigned={item for items in semantic.values() for item in items}; excluded=[r['id'] for r in records if r['classification'] in ('sliver','degenerate')]
    included=sorted(item for item in assigned if item not in excluded)
    unclassified=[r['id'] for r in records if r['id'] not in assigned and r['id'] not in excluded]
    strategies={}
    for region,items in semantic.items():
        for item in items:
            strategies[item]={'region':region,'strategy':'localSubdivision' if region in ('hood','roof','rear') else 'manualCleanup','reason':'Preliminary mapping from deterministic island render; process separately with boundary falloff.'}
    for item in excluded: strategies[item]={'region':'unclassified','strategy':'exclude','reason':'Sliver or degenerate diagnostic classification; retained in audit only.'}
    for item in unclassified: strategies[item]={'region':'unclassified','strategy':'manualCleanup','reason':'Not admitted to v3 until visual classification is approved.'}
    regions={'include':included,'exclude':excluded,'regions':{**semantic,'unclassified':unclassified},'strategies':strategies}
    with open(a.regions_output,'w',encoding='utf8') as f: json.dump(regions,f,indent=2)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(a.output_dir,'paint-islands-audit.blend'))
    print('PAINT_ISLANDS_AUDIT islands=%d area=%.6f top5=%.3f top10=%.3f islands95=%d GLOBAL_VOXEL_REMESH_ALLOWED=%s' % (len(records),total,summary['top5AreaPercent'],summary['top10AreaPercent'],count95,GLOBAL_VOXEL_REMESH_ALLOWED))

if __name__=='__main__': main()
