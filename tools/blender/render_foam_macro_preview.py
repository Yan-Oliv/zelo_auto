"""Render static, white offline validation views of a FoamMacro GLB."""

import argparse
import os
import sys

import bpy
from mathutils import Vector


def arguments():
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--asset", required=True)
    parser.add_argument("--output-dir", required=True)
    return parser.parse_args(argv)


def target_object(camera, target):
    camera.rotation_euler = (target - camera.location).to_track_quat("-Z", "Y").to_euler()


def mesh_bounds(obj):
    points = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
    minimum = Vector((min(point.x for point in points), min(point.y for point in points), min(point.z for point in points)))
    maximum = Vector((max(point.x for point in points), max(point.y for point in points), max(point.z for point in points)))
    return minimum, maximum


def render(scene, camera, output_dir, name, mesh, morph):
    for key in mesh.data.shape_keys.key_blocks:
        key.value = 0.0
    if morph != "base":
        mesh.data.shape_keys.key_blocks[morph].value = 1.0
    bpy.context.view_layer.update()
    scene.render.filepath = os.path.join(output_dir, name + ".png")
    bpy.ops.render.render(write_still=True)
    print("FOAM_MACRO_PREVIEW name=%s morph=%s" % (name, morph))


def main():
    args = arguments()
    os.makedirs(args.output_dir, exist_ok=True)
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    bpy.ops.import_scene.gltf(filepath=args.asset)
    mesh = bpy.data.objects.get("FoamMacroMesh")
    if mesh is None:
        raise RuntimeError("FoamMacroMesh not found")
    material = bpy.data.materials.new("OfflineWhiteValidation")
    material.diffuse_color = (0.93, 0.96, 0.97, 1.0)
    material.roughness = 0.84
    mesh.data.materials.clear()
    mesh.data.materials.append(material)
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_WORKBENCH"
    scene.display.shading.light = "STUDIO"
    scene.display.shading.studiolight_rotate_z = 0.55
    scene.display.shading.studiolight_background_alpha = 1.0
    scene.display.shading.background_type = "WORLD"
    scene.display.shading.background_color = (0.035, 0.055, 0.075)
    scene.render.resolution_x = 1200
    scene.render.resolution_y = 760
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    camera_data = bpy.data.cameras.new("OfflineValidationCamera")
    camera = bpy.data.objects.new("OfflineValidationCamera", camera_data)
    bpy.context.collection.objects.link(camera)
    scene.camera = camera
    minimum, maximum = mesh_bounds(mesh)
    center = (minimum + maximum) * 0.5
    diagonal = (maximum - minimum).length
    views = {
        "three-quarter-full": Vector((1.05, -1.35, 0.72)),
        "front-full": Vector((0.0, -1.75, 0.45)),
        "side-full": Vector((1.75, 0.0, 0.35)),
        "rear-full": Vector((0.0, 1.72, 0.48)),
        "thin": Vector((1.05, -1.35, 0.72)),
        "drained": Vector((1.05, -1.35, 0.72)),
    }
    for name, direction in views.items():
        camera.location = center + direction.normalized() * diagonal * 0.84
        camera.data.lens = 54 if name not in ("front-full", "rear-full") else 58
        target_object(camera, center + Vector((0, 0, diagonal * 0.02)))
        render(scene, camera, args.output_dir, name, mesh, "FoamThin" if name == "thin" else "FoamDrained" if name == "drained" else "FoamFull")
    wire = material.copy()
    wire.diffuse_color = (0.98, 0.20, 0.75, 1.0)
    mesh.data.materials[0] = wire
    wire.use_nodes = False
    mesh.display_type = "WIRE"
    camera.location = center + views["three-quarter-full"].normalized() * diagonal * 0.84
    target_object(camera, center)
    render(scene, camera, args.output_dir, "wireframe-full", mesh, "FoamFull")


if __name__ == "__main__":
    main()
