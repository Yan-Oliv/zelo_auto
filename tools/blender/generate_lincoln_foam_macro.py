"""Generate offline FoamMacro assets without modifying the original car.

Surface strategy reproduces the original diagnostic asset. Volumetric strategy
creates one continuous sculpted mesh from an inward-solidified Paint shell plus
low, asymmetric generator masses, then remeshes and decimates it offline.
"""

import argparse
import math
import statistics
import sys

import bmesh
import bpy
from mathutils import Matrix, Vector
from mathutils.bvhtree import BVHTree


def arguments():
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--strategy", choices=("surface", "volumetric"), default="surface")
    parser.add_argument("--voxel-size", type=float, default=0.055)
    parser.add_argument("--target-triangles", type=int, default=17000)
    return parser.parse_args(argv)


def fract(value):
    return value - math.floor(value)


def noise3(point):
    return fract(math.sin(point.x * 12.9898 + point.y * 78.233 + point.z * 37.719) * 43758.5453)


def triangle_count(mesh):
    return sum(max(len(polygon.vertices) - 2, 0) for polygon in mesh.polygons)


def bounds(mesh):
    minimum = Vector((min(vertex.co.x for vertex in mesh.vertices), min(vertex.co.y for vertex in mesh.vertices), min(vertex.co.z for vertex in mesh.vertices)))
    maximum = Vector((max(vertex.co.x for vertex in mesh.vertices), max(vertex.co.y for vertex in mesh.vertices), max(vertex.co.z for vertex in mesh.vertices)))
    return minimum, maximum, maximum - minimum


def paint_only_copy(source):
    copy = source.copy()
    copy.data = source.data.copy()
    bpy.context.collection.objects.link(copy)
    paint_indices = {index for index, slot in enumerate(copy.material_slots) if slot.material and slot.material.name == "Paint"}
    mesh = copy.data
    bm = bmesh.new()
    bm.from_mesh(mesh)
    bmesh.ops.delete(bm, geom=[face for face in bm.faces if face.material_index not in paint_indices], context="FACES")
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


def make_validation_material():
    material = bpy.data.materials.new("FoamMacroValidation")
    material.use_nodes = True
    principled = material.node_tree.nodes.get("Principled BSDF")
    if principled:
        principled.inputs["Base Color"].default_value = (0.92, 0.95, 0.96, 1.0)
        principled.inputs["Roughness"].default_value = 0.84
        principled.inputs["Metallic"].default_value = 0.0
    return material


def build_bvh(mesh):
    return BVHTree.FromPolygons([vertex.co.copy() for vertex in mesh.vertices], [polygon.vertices[:] for polygon in mesh.polygons], all_triangles=False)


def nearest_surface_vertex(mesh, target, mode, span):
    best = None
    best_score = float("inf")
    scale = max(span.length, 0.001)
    for vertex in mesh.vertices:
        normal = vertex.normal.normalized()
        score = (vertex.co - target).length_squared
        if mode == "top":
            score += (1.0 - max(normal.z, 0.0)) * scale * scale * 0.12
        elif mode == "side":
            score += abs(normal.z) * scale * scale * 0.08
        if score < best_score:
            best, best_score = vertex, score
    return best


def deform_blob(blob, seed):
    for vertex in blob.data.vertices:
        point = vertex.co.copy()
        radial = noise3(point * 2.3 + Vector((seed * 0.17, seed * 0.31, seed * 0.11))) - 0.5
        secondary = noise3(point * 4.7 + Vector((seed * 0.29, seed * 0.13, seed * 0.41))) - 0.5
        vertex.co.x *= 1.0 + radial * 0.16
        vertex.co.y *= 1.0 + secondary * 0.13
        vertex.co.z *= 0.82 + radial * 0.10
        vertex.co.x += secondary * 0.045
    blob.data.update()


def add_generator_mass(macro, center, normal, radii, seed):
    # An icosphere is only a temporary offline generator. It is embedded by
    # 65% along the target normal and removed by the voxel union afterward.
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=1.0, location=(0, 0, 0))
    blob = bpy.context.object
    blob.name = "__FoamGenerator_%02d" % seed
    deform_blob(blob, seed)
    orientation = normal.to_track_quat("Z", "Y").to_matrix().to_4x4()
    transform = Matrix.Translation(center - normal * (radii.z * 0.65)) @ orientation @ Matrix.Diagonal((radii.x, radii.y, radii.z, 1.0))
    blob.matrix_world = macro.matrix_world @ transform
    return blob


def volumetric_anchor_specs():
    # x/y are placement hints over the Paint bounds. z keeps the search near
    # the intended exterior band; normal mode prevents door anchors becoming
    # roof blobs. These 13 fields are intentionally wide and low.
    return [
        (0.20, 0.20, 0.75, "top", 0.18, 0.14, 0.012), (0.50, 0.18, 0.76, "top", 0.20, 0.15, 0.013),
        (0.78, 0.24, 0.74, "top", 0.17, 0.13, 0.011), (0.30, 0.54, 0.90, "top", 0.18, 0.13, 0.009),
        (0.66, 0.56, 0.90, "top", 0.17, 0.12, 0.009), (0.12, 0.38, 0.57, "side", 0.12, 0.15, 0.007),
        (0.88, 0.40, 0.57, "side", 0.12, 0.16, 0.007), (0.10, 0.68, 0.52, "side", 0.10, 0.15, 0.006),
        (0.90, 0.70, 0.52, "side", 0.10, 0.15, 0.006), (0.22, 0.82, 0.72, "top", 0.16, 0.12, 0.010),
        (0.58, 0.84, 0.72, "top", 0.17, 0.12, 0.010), (0.82, 0.78, 0.63, "side", 0.10, 0.13, 0.006),
        (0.18, 0.72, 0.65, "side", 0.09, 0.12, 0.005),
    ]


def create_volumetric_mesh(macro, voxel_size, target_triangles):
    # Reference remains untouched and supplies nearest Paint projection for
    # the Thin/Drained morph targets after remeshing.
    reference = macro.copy()
    reference.data = macro.data.copy()
    reference.name = "__PaintReference"
    bpy.context.collection.objects.link(reference)
    reference.hide_render = True
    reference.hide_viewport = True
    reference.parent = None
    reference.matrix_world = macro.matrix_world.copy()

    minimum, maximum, span = bounds(macro.data)
    diagonal = span.length
    solidify = macro.modifiers.new("__FoamInwardSolidify", "SOLIDIFY")
    solidify.thickness = max(diagonal * 0.0016, 0.006)
    solidify.offset = -1.0
    solidify.use_even_offset = True
    apply_modifier(macro, solidify)

    generators = []
    for seed, (x, y, z, mode, rx, ry, rz) in enumerate(volumetric_anchor_specs()):
        target = Vector((minimum.x + span.x * x, minimum.y + span.y * y, minimum.z + span.z * z))
        vertex = nearest_surface_vertex(reference.data, target, mode, span)
        normal = vertex.normal.normalized()
        radii = Vector((max(span.x * rx, diagonal * 0.045), max(span.y * ry, diagonal * 0.055), max(diagonal * rz, diagonal * 0.005)))
        generators.append(add_generator_mass(macro, vertex.co, normal, radii, seed))

    macro = join([macro] + generators)
    macro.name = "FoamMacroMesh"
    macro.data.name = "FoamMacroMesh"
    remesh = macro.modifiers.new("__FoamVoxelUnion", "REMESH")
    remesh.mode = "VOXEL"
    remesh.voxel_size = voxel_size
    remesh.use_smooth_shade = True
    apply_modifier(macro, remesh)
    before_decimate = triangle_count(macro.data)
    if before_decimate > target_triangles:
        decimate = macro.modifiers.new("__FoamControlledDecimate", "DECIMATE")
        decimate.ratio = max(min(target_triangles / before_decimate, 1.0), 0.05)
        decimate.decimate_type = "COLLAPSE"
        apply_modifier(macro, decimate)
    bpy.context.view_layer.objects.active = macro
    bpy.ops.object.shade_smooth()
    # Remesh invalidates original UVs. Use a dedicated non-overlapping UV map;
    # a later Macro PBR may instead choose triplanar mapping, but the geometry
    # gate remains independent from that decision.
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(island_margin=0.015)
    bpy.ops.object.mode_set(mode="OBJECT")
    print("FOAM_MACRO_V2_VOLUME generators=%d voxel_size=%.5f triangles_before_decimate=%d triangles_final=%d uv_strategy=smart_project" % (len(generators), voxel_size, before_decimate, triangle_count(macro.data)))
    return macro, reference, diagonal


def add_volumetric_shape_keys(macro, reference, vehicle_diagonal):
    mesh = macro.data
    reference_bvh = build_bvh(reference.data)
    baseline = vehicle_diagonal * 0.0012
    epsilon = vehicle_diagonal * 0.00008
    # Keep the 95th percentile in the requested 0.35%â€“0.80% vehicle-diagonal
    # band. The macro field must read in white, without inflating panels.
    max_macro_height = vehicle_diagonal * 0.0080
    outlier_distance = vehicle_diagonal * 0.018
    basis = macro.shape_key_add(name="Basis")
    thin = macro.shape_key_add(name="FoamThin")
    full = macro.shape_key_add(name="FoamFull")
    drained = macro.shape_key_add(name="FoamDrained")
    heights = []
    rejected_outliers = 0
    for index, vertex in enumerate(mesh.vertices):
        remesh_point = vertex.co.copy()
        nearest = reference_bvh.find_nearest(remesh_point)
        if nearest is None:
            thin_point = remesh_point.copy()
            full_point = remesh_point.copy()
            normal = vertex.normal.normalized()
            height = 0.0
        else:
            location, normal, _, distance = nearest
            normal = normal.normalized()
            if distance > outlier_distance:
                # Voxel closure may bridge large paint openings. Those cells
                # are not valid foam mass and are projected back to the thin
                # reference instead of becoming inflated body volume.
                rejected_outliers += 1
                height = 0.0
            else:
                height = min(max(distance - baseline, 0.0), max_macro_height)
            thin_point = location + normal * baseline
            full_point = thin_point + normal * height
        vertical = 1.0 - max(normal.z, 0.0)
        full_factor = min(height / max(vehicle_diagonal * 0.008, 0.0001), 1.0)
        drained_factor = 0.55 - vertical * 0.25
        drained_point = thin_point.lerp(full_point, max(0.18, drained_factor + full_factor * 0.14))
        basis.data[index].co = thin_point
        thin.data[index].co = thin_point
        full.data[index].co = full_point
        drained.data[index].co = drained_point
        heights.append(height)
    thin.value = full.value = drained.value = 0.0
    affected = sum(height > epsilon for height in heights)
    print("FOAM_MACRO_V2_MORPH_DIAGNOSTIC epsilon=%.9f max_macro_height=%.9f rejected_outliers=%d affected=%d affected_pct=%.3f height_mean=%.9f height_median=%.9f height_p95=%.9f height_max=%.9f" % (epsilon, max_macro_height, rejected_outliers, affected, affected * 100.0 / len(heights), statistics.fmean(heights), statistics.median(heights), percentile(heights, .95), max(heights)))
    return heights


def percentile(values, fraction):
    ordered = sorted(values)
    offset = (len(ordered) - 1) * fraction
    low, high = math.floor(offset), math.ceil(offset)
    return ordered[low] if low == high else ordered[low] + (ordered[high] - ordered[low]) * (offset - low)


def add_color_data(mesh, heights=None, diagonal=1.0):
    color = mesh.color_attributes.get("FoamMacroColor") or mesh.color_attributes.new("FoamMacroColor", "FLOAT_COLOR", "CORNER")
    mesh.color_attributes.active_color = color
    minimum, maximum, span = bounds(mesh)
    values = {}
    for index, vertex in enumerate(mesh.vertices):
        normal_up = max(vertex.normal.z, 0.0)
        application = min(max((vertex.co.z - minimum.z) / max(span.z, 0.001), 0.0), 1.0)
        macro_height = min((heights[index] if heights else 0.0) / max(diagonal * 0.008, 0.0001), 1.0)
        density = min(.38 + normal_up * .20 + macro_height * .38 + noise3(vertex.co * 3.0) * .04, 1.0)
        drainage = min(max((1.0 - normal_up) * .65 + (1.0 - application) * .35, 0.0), 1.0)
        wetness = min(.12 + (1.0 - macro_height) * .26 + noise3(vertex.co * 7.0) * .10, 1.0)
        values[index] = (application, density, drainage, wetness)
    for polygon in mesh.polygons:
        for loop_index in polygon.loop_indices:
            color.data[loop_index].color = values[mesh.loops[loop_index].vertex_index]


def create_surface_shape_keys(obj):
    mesh = obj.data
    basis = obj.shape_key_add(name="Basis")
    thin = obj.shape_key_add(name="FoamThin")
    full = obj.shape_key_add(name="FoamFull")
    drained = obj.shape_key_add(name="FoamDrained")
    for index, vertex in enumerate(mesh.vertices):
        point, normal = vertex.co.copy(), vertex.normal.normalized()
        macro = .0025 + max(normal.z, 0.0) * .0045 + (noise3(point * 1.35) - .5) * .0018
        thin.data[index].co = point + normal * max(macro * .35, .0005)
        full.data[index].co = point + normal * max(macro, .0008)
        drained.data[index].co = point + normal * max(macro * .48, .0004)
    thin.value = full.value = drained.value = 0.0


def export_asset(macro, output):
    macro.data.materials.clear()
    macro.data.materials.append(make_validation_material())
    root = bpy.data.objects.new("FoamMacroRoot", None)
    bpy.context.collection.objects.link(root)
    macro.parent = root
    bpy.ops.object.select_all(action="DESELECT")
    root.select_set(True)
    macro.select_set(True)
    bpy.context.view_layer.objects.active = macro
    print("FOAM_MACRO_EXPORT objects=[FoamMacroRoot,FoamMacroMesh] vertices=%d triangles=%d shape_keys=%s color=%s" % (len(macro.data.vertices), triangle_count(macro.data), [key.name for key in macro.data.shape_keys.key_blocks], macro.data.color_attributes.active_color.name))
    bpy.ops.export_scene.gltf(
        filepath=output, export_format="GLB", use_selection=True,
        export_normals=True, export_tangents=True, export_morph=True,
        export_vertex_color="ACTIVE", export_all_vertex_colors=True,
        export_attributes=True, export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6, export_materials="EXPORT",
        export_animations=False,
    )


def main():
    args = arguments()
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    bpy.ops.import_scene.gltf(filepath=args.input)
    paint_sources = [obj for obj in list(bpy.context.scene.objects) if obj.type == "MESH" and any(slot.material and slot.material.name == "Paint" for slot in obj.material_slots)]
    if not paint_sources:
        raise RuntimeError("No Paint material meshes were found in the input GLB.")
    macro = join([paint_only_copy(source) for source in paint_sources])
    macro.name = "FoamMacroMesh"
    macro.data.name = "FoamMacroMesh"
    if args.strategy == "volumetric":
        macro, reference, diagonal = create_volumetric_mesh(macro, args.voxel_size, args.target_triangles)
        heights = add_volumetric_shape_keys(macro, reference, diagonal)
        add_color_data(macro.data, heights, diagonal)
    else:
        bpy.context.view_layer.objects.active = macro
        bpy.ops.object.shade_smooth()
        add_color_data(macro.data)
        create_surface_shape_keys(macro)
        print("FOAM_MACRO_SURFACE vertices=%d triangles=%d" % (len(macro.data.vertices), triangle_count(macro.data)))
    export_asset(macro, args.output)


if __name__ == "__main__":
    main()
