"""Generate the continuous offline FoamMacroMesh for the cinematic car wash.

Run with Blender 4.x (or a compatible 3.x build):
  blender --background --python tools/blender/generate_lincoln_foam_macro.py -- \
    --input public/models/lincoln.glb --output public/models/lincoln_foam_macro.glb

The original car is never saved or modified. The exported GLB contains only:
  FoamMacroRoot / FoamMacroMesh
"""

import argparse
import math
import sys

import bpy
import bmesh
from mathutils import Vector


def arguments():
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    return parser.parse_args(argv)


def fract(value):
    return value - math.floor(value)


def noise3(point):
    return fract(math.sin(point.x * 12.9898 + point.y * 78.233 + point.z * 37.719) * 43758.5453)


def paint_only_copy(source):
    copy = source.copy()
    copy.data = source.data.copy()
    bpy.context.collection.objects.link(copy)
    paint_indices = {index for index, slot in enumerate(copy.material_slots) if slot.material and slot.material.name == "Paint"}
    mesh = copy.data
    bm = bmesh.new()
    bm.from_mesh(mesh)
    delete_faces = [face for face in bm.faces if face.material_index not in paint_indices]
    bmesh.ops.delete(bm, geom=delete_faces, context="FACES")
    bm.to_mesh(mesh)
    bm.free()
    return copy


def join(objects):
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.join()
    return bpy.context.object


def apply_modifier(obj, modifier):
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=modifier.name)


def add_color_data(mesh):
    color = mesh.color_attributes.new("FoamMacroColor", "FLOAT_COLOR", "CORNER")
    mesh.color_attributes.active_color = color
    minimum = Vector((min(v.co.x for v in mesh.vertices), min(v.co.y for v in mesh.vertices), min(v.co.z for v in mesh.vertices)))
    maximum = Vector((max(v.co.x for v in mesh.vertices), max(v.co.y for v in mesh.vertices), max(v.co.z for v in mesh.vertices)))
    span = maximum - minimum
    values = {}
    for index, vertex in enumerate(mesh.vertices):
        normal_up = max(vertex.normal.z, 0.0)
        application = min(max((vertex.co.z - minimum.z) / max(span.z, 0.001), 0.0), 1.0)
        density = min(.45 + normal_up * .45 + noise3(vertex.co * 3.0) * .10, 1.0)
        drainage = min(max((vertex.co.z - minimum.z) / max(span.z, .001), 0.0), 1.0)
        wetness = .18 + noise3(vertex.co * 7.0) * .18
        values[index] = (application, density, drainage, wetness)
    for polygon in mesh.polygons:
        for loop_index in polygon.loop_indices:
            color.data[loop_index].color = values[mesh.loops[loop_index].vertex_index]


def create_shape_keys(obj):
    mesh = obj.data
    basis = obj.shape_key_add(name="Basis")
    thin = obj.shape_key_add(name="FoamThin")
    full = obj.shape_key_add(name="FoamFull")
    drained = obj.shape_key_add(name="FoamDrained")
    for index, vertex in enumerate(mesh.vertices):
        point = vertex.co.copy()
        normal = vertex.normal.normalized()
        low_frequency = noise3(point * 1.35) - .5
        medium_frequency = noise3(point * 4.1 + Vector((.37, .19, .61))) - .5
        upward = max(normal.z, 0.0)
        macro = (.0025 + upward * .0045 + low_frequency * .0018 + medium_frequency * .0008)
        thin.data[index].co = point + normal * max(macro * .35, 0.0005)
        full.data[index].co = point + normal * max(macro, 0.0008)
        drained.data[index].co = point + normal * max(macro * .48, 0.0004)
    thin.value = 0.0
    full.value = 0.0
    drained.value = 0.0


def main():
    args = arguments()
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    bpy.ops.import_scene.gltf(filepath=args.input)

    originals = list(bpy.context.scene.objects)
    paint_sources = []
    for obj in originals:
        if obj.type != "MESH":
            continue
        if any(slot.material and slot.material.name == "Paint" for slot in obj.material_slots):
            paint_sources.append(obj)
    if not paint_sources:
        raise RuntimeError("No Paint material meshes were found in the input GLB.")

    copies = [paint_only_copy(source) for source in paint_sources]
    macro = join(copies)
    macro.name = "FoamMacroMesh"
    macro.data.name = "FoamMacroMesh"
    macro.data.materials.clear()
    validation_material = bpy.data.materials.new("FoamMacroValidation")
    validation_material.use_nodes = True
    nodes = validation_material.node_tree.nodes
    links = validation_material.node_tree.links
    principled = nodes.get("Principled BSDF")
    if principled is None:
        principled = nodes.new("ShaderNodeBsdfPrincipled")
        output = nodes.get("Material Output") or nodes.new("ShaderNodeOutputMaterial")
        links.new(principled.outputs["BSDF"], output.inputs["Surface"])
    color_node = nodes.new("ShaderNodeVertexColor")
    color_node.layer_name = "FoamMacroColor"
    links.new(color_node.outputs["Color"], principled.inputs["Base Color"])
    macro.data.materials.append(validation_material)

    # Paint already has enough density for the target 8k–18k triangle budget.
    # Do not subdivide blindly: the shape keys provide the controlled macro volume.
    bpy.context.view_layer.objects.active = macro
    bpy.ops.object.shade_smooth()
    add_color_data(macro.data)
    create_shape_keys(macro)
    print("FOAM_MACRO_AUDIT vertices=%d triangles=%d shape_keys=%s color=%s" % (
        len(macro.data.vertices),
        sum(len(polygon.vertices) - 2 for polygon in macro.data.polygons),
        [key.name for key in macro.data.shape_keys.key_blocks],
        macro.data.color_attributes.active_color.name,
    ))

    root = bpy.data.objects.new("FoamMacroRoot", None)
    bpy.context.collection.objects.link(root)
    macro.parent = root

    # Export only the dedicated foam asset: no original car, glass or materials.
    bpy.ops.object.select_all(action="DESELECT")
    root.select_set(True)
    macro.select_set(True)
    bpy.context.view_layer.objects.active = macro
    bpy.ops.export_scene.gltf(
        filepath=args.output,
        export_format="GLB",
        use_selection=True,
        export_normals=True,
        export_tangents=True,
        export_morph=True,
        export_vertex_color="ACTIVE",
        export_all_vertex_colors=True,
        export_attributes=True,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
        export_materials="EXPORT",
        export_animations=False,
    )


if __name__ == "__main__":
    main()
